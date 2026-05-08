'use client';

import { useEffect, useState } from 'react';

export type Provider = 'anthropic' | 'openai';

export interface ChatConfig {
  provider: Provider;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'urban-fundamentals.chat-config';

const DEFAULT_CONFIG: ChatConfig = {
  provider: 'anthropic',
  baseUrl: '',
  apiKey: '',
  model: 'claude-opus-4-7',
};

interface Preset {
  label: string;
  config: ChatConfig;
}

const PRESETS: Preset[] = [
  {
    label: 'Anthropic 官方',
    config: { provider: 'anthropic', baseUrl: '', apiKey: '', model: 'claude-opus-4-7' },
  },
  {
    label: 'OpenAI 官方',
    config: {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
    },
  },
  {
    label: 'DeepSeek',
    config: {
      provider: 'openai',
      baseUrl: 'https://api.deepseek.com',
      apiKey: '',
      model: 'deepseek-chat',
    },
  },
  {
    label: '智谱 GLM-4',
    config: {
      provider: 'openai',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      apiKey: '',
      model: 'glm-4',
    },
  },
  {
    label: 'Kimi',
    config: {
      provider: 'openai',
      baseUrl: 'https://api.moonshot.cn/v1',
      apiKey: '',
      model: 'moonshot-v1-32k',
    },
  },
  {
    label: 'OpenRouter',
    config: {
      provider: 'openai',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '',
      model: 'anthropic/claude-3.5-sonnet',
    },
  },
  {
    label: 'Ollama 本地',
    config: {
      provider: 'openai',
      baseUrl: 'http://localhost:11434/v1',
      apiKey: 'ollama',
      model: 'llama3.1',
    },
  },
];

export function loadConfig(): ChatConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ChatConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function ChatSettings({
  open,
  onClose,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onChange: (config: ChatConfig) => void;
}) {
  const [draft, setDraft] = useState<ChatConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (open) setDraft(loadConfig());
  }, [open]);

  if (!open) return null;

  const save = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    onChange(draft);
    onClose();
  };
  const reset = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    onChange(DEFAULT_CONFIG);
    onClose();
  };
  const applyPreset = (p: Preset) => {
    setDraft({ ...p.config, apiKey: draft.apiKey });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold">模型设置</h2>
          <button
            onClick={onClose}
            className="text-sm text-neutral-400 hover:text-neutral-700"
          >
            ✕
          </button>
        </header>

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">协议</span>
            <div className="flex gap-2">
              {(['anthropic', 'openai'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setDraft({ ...draft, provider: p })}
                  className={`rounded-md border px-3 py-1.5 text-xs ${
                    draft.provider === p
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {p === 'anthropic' ? 'Anthropic 原生' : 'OpenAI 兼容'}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">
              Base URL{' '}
              <span className="text-neutral-400">
                ({draft.provider === 'anthropic' ? '默认 api.anthropic.com，可留空' : '必填'})
              </span>
            </span>
            <input
              value={draft.baseUrl}
              onChange={e => setDraft({ ...draft, baseUrl: e.target.value })}
              placeholder={
                draft.provider === 'anthropic'
                  ? 'https://api.anthropic.com (默认)'
                  : 'https://api.openai.com/v1'
              }
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-mono"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">API Key</span>
            <input
              type="password"
              value={draft.apiKey}
              onChange={e => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-mono"
            />
            <span className="mt-1 block text-[11px] text-neutral-400">
              仅存浏览器 localStorage，每次请求以 header 发到本机 /api/chat。
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">模型</span>
            <input
              value={draft.model}
              onChange={e => setDraft({ ...draft, model: e.target.value })}
              placeholder="claude-opus-4-7 / gpt-4o / deepseek-chat ..."
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-mono"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs text-neutral-500">快速预设</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[11px] text-neutral-600 hover:border-neutral-500"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between pt-2">
          <button
            onClick={reset}
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            清除（用 .env 默认）
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs"
            >
              取消
            </button>
            <button
              onClick={save}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              保存
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
