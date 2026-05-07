import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { SEED_CITIES } from './seed-data';
import { SEED_HISTORY } from './seed-history';
import type { City, CityWithMetrics, MetricValue } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'cities.db');

let _db: Database.Database | null = null;

function init(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tier TEXT NOT NULL,
      province TEXT NOT NULL,
      region TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS metrics (
      city_code TEXT NOT NULL,
      metric_key TEXT NOT NULL,
      as_of TEXT NOT NULL,
      value_num REAL,
      value_text TEXT,
      unit TEXT NOT NULL,
      source TEXT NOT NULL,
      PRIMARY KEY (city_code, metric_key, as_of),
      FOREIGN KEY (city_code) REFERENCES cities(code)
    );
    CREATE INDEX IF NOT EXISTS idx_metrics_key ON metrics(metric_key);
  `);

  const count = db.prepare('SELECT COUNT(*) as n FROM cities').get() as { n: number };
  if (count.n > 0) return;

  const insertCity = db.prepare(
    'INSERT INTO cities (code, name, tier, province, region) VALUES (?, ?, ?, ?, ?)',
  );
  const insertMetric = db.prepare(
    'INSERT INTO metrics (city_code, metric_key, as_of, value_num, value_text, unit, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  const seed = db.transaction(() => {
    for (const c of SEED_CITIES) {
      insertCity.run(c.code, c.name, c.tier, c.province, c.region);
      for (const [key, m] of Object.entries(c.metrics)) {
        insertMetric.run(c.code, key, m.asOf, m.valueNum, m.valueText, m.unit, m.source);
      }
    }
    for (const h of SEED_HISTORY) {
      const fields: Array<[string, number | null, string]> = [
        ['gdp', h.gdp ?? null, '亿元'],
        ['permanent_pop', h.pop ?? null, '万人'],
        ['public_revenue', h.fiscal ?? null, '亿元'],
      ];
      for (const [key, value, unit] of fields) {
        if (value == null) continue;
        insertMetric.run(h.city, key, h.year, value, null, unit, h.source);
      }
    }
  });
  seed();
}

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  init(_db);
  return _db;
}

export function listCities(): City[] {
  return getDb()
    .prepare('SELECT code, name, tier, province, region FROM cities ORDER BY code')
    .all() as City[];
}

export function getCity(code: string): City | null {
  const row = getDb()
    .prepare('SELECT code, name, tier, province, region FROM cities WHERE code = ?')
    .get(code) as City | undefined;
  return row ?? null;
}

// Latest row per metric_key for a city (max as_of wins).
export function getCityMetrics(code: string): Record<string, MetricValue> {
  const rows = getDb()
    .prepare(
      `SELECT m.metric_key as key, m.value_num as valueNum, m.value_text as valueText,
              m.unit, m.as_of as asOf, m.source
         FROM metrics m
         JOIN (SELECT metric_key, MAX(as_of) as max_asof
                 FROM metrics WHERE city_code = ? GROUP BY metric_key) latest
           ON m.metric_key = latest.metric_key AND m.as_of = latest.max_asof
        WHERE m.city_code = ?`,
    )
    .all(code, code) as MetricValue[];
  const out: Record<string, MetricValue> = {};
  for (const r of rows) out[r.key] = r;
  return out;
}

export function getCityWithMetrics(code: string): CityWithMetrics | null {
  const city = getCity(code);
  if (!city) return null;
  return { ...city, metrics: getCityMetrics(code) };
}

export function getMetricForCity(code: string, key: string): MetricValue | null {
  const row = getDb()
    .prepare(
      `SELECT metric_key as key, value_num as valueNum, value_text as valueText,
              unit, as_of as asOf, source
         FROM metrics WHERE city_code = ? AND metric_key = ?
         ORDER BY as_of DESC LIMIT 1`,
    )
    .get(code, key) as MetricValue | undefined;
  return row ?? null;
}

export interface SeriesPoint {
  asOf: string;
  valueNum: number;
}

export function getMetricSeries(code: string, key: string): SeriesPoint[] {
  return getDb()
    .prepare(
      `SELECT as_of as asOf, value_num as valueNum
         FROM metrics
        WHERE city_code = ? AND metric_key = ? AND value_num IS NOT NULL
        ORDER BY as_of ASC`,
    )
    .all(code, key) as SeriesPoint[];
}

export function rankCitiesByMetric(
  key: string,
  order: 'desc' | 'asc' = 'desc',
  limit = 10,
): Array<{ code: string; name: string; valueNum: number | null; unit: string; asOf: string }> {
  return getDb()
    .prepare(
      `SELECT c.code, c.name, m.value_num as valueNum, m.unit, m.as_of as asOf
         FROM cities c
         JOIN metrics m ON c.code = m.city_code
         JOIN (SELECT city_code, metric_key, MAX(as_of) as max_asof
                 FROM metrics WHERE metric_key = ? GROUP BY city_code, metric_key) latest
           ON latest.city_code = m.city_code AND latest.metric_key = m.metric_key
              AND latest.max_asof = m.as_of
        WHERE m.metric_key = ? AND m.value_num IS NOT NULL
        ORDER BY m.value_num ${order === 'desc' ? 'DESC' : 'ASC'}
        LIMIT ?`,
    )
    .all(key, key, limit) as Array<{
      code: string;
      name: string;
      valueNum: number;
      unit: string;
      asOf: string;
    }>;
}

export function upsertMetric(
  cityCode: string,
  key: string,
  valueNum: number | null,
  unit: string,
  asOf: string,
  source: string,
  valueText: string | null = null,
): void {
  getDb()
    .prepare(
      `INSERT INTO metrics (city_code, metric_key, as_of, value_num, value_text, unit, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(city_code, metric_key, as_of) DO UPDATE SET
         value_num = excluded.value_num,
         value_text = excluded.value_text,
         unit = excluded.unit,
         source = excluded.source`,
    )
    .run(cityCode, key, asOf, valueNum, valueText, unit, source);
}

export function metricRange(key: string): { min: number; max: number } | null {
  const row = getDb()
    .prepare(
      `SELECT MIN(m.value_num) as min, MAX(m.value_num) as max
         FROM metrics m
         JOIN (SELECT city_code, metric_key, MAX(as_of) as max_asof
                 FROM metrics WHERE metric_key = ? GROUP BY city_code, metric_key) latest
           ON latest.city_code = m.city_code AND latest.metric_key = m.metric_key
              AND latest.max_asof = m.as_of
        WHERE m.metric_key = ? AND m.value_num IS NOT NULL`,
    )
    .get(key, key) as { min: number | null; max: number | null } | undefined;
  if (!row || row.min === null || row.max === null) return null;
  return { min: row.min, max: row.max };
}

export function findCityByName(query: string): City | null {
  const row = getDb()
    .prepare(
      'SELECT code, name, tier, province, region FROM cities WHERE name = ? OR code = ? LIMIT 1',
    )
    .get(query, query.toLowerCase()) as City | undefined;
  return row ?? null;
}
