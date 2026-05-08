'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatSettings, loadConfig, type ChatConfig } from '@/components/ChatSettings';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  toolEvents?: Array<{ tool: string; input: unknown }>;
}

const SAMPLE_QUESTIONS = [
  '北京和上海的 GDP 哪个高？',
  'GDP 增速最快的 3 个城市',
  '深圳的产业结构是什么样的？',
  '哪些城市房价收入比最低？',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          config: config ?? undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...next, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      } else {
        setMessages([
          ...next,
          { role: 'assistant', content: data.reply, toolEvents: data.toolEvents },
        ]);
      }
    } catch (e) {
      setMessages([
        ...next,
        { role: 'assistant', content: `⚠️ 请求失败：${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const providerLabel =
    config?.provider === 'openai' ? 'OpenAI 兼容' : 'Anthropic';
  const modelLabel = config?.model ?? '默认';

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">自然语言问答</h1>
            <span className="text-sm text-neutral-500">基于 LLM tool use</span>
          </div>
          <p className="text-sm text-neutral-600">
            回答仅来源于数据库的结构化数据，每次会展开调用了哪些工具。
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:border-neutral-500"
          title="模型设置"
        >
          <span className="hidden font-mono text-[10px] text-neutral-500 sm:inline">
            {providerLabel} · {modelLabel}
          </span>
          <span aria-hidden>⚙</span>
          <span className="sr-only">模型设置</span>
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
        <div className="h-[60vh] space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="space-y-3 text-sm">
              <p className="text-neutral-500">试试这些问题：</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:border-neutral-500"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-900 ring-1 ring-inset ring-neutral-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.toolEvents && m.toolEvents.length > 0 && (
                  <details className="mt-2 text-xs text-neutral-500">
                    <summary className="cursor-pointer">查询了 {m.toolEvents.length} 次数据</summary>
                    <ul className="mt-1 space-y-0.5">
                      {m.toolEvents.map((e, j) => (
                        <li key={j}>
                          <span className="font-mono">{e.tool}</span>(
                          {JSON.stringify(e.input)})
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-500">
                正在查询数据并生成回答…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t border-neutral-200 p-3"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="问点什么…"
            className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </div>

      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onChange={setConfig}
      />
    </div>
  );
}
