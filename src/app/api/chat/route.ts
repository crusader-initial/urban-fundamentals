import { NextResponse } from 'next/server';
import { runAnthropic } from '@/lib/llm/anthropic';
import { runOpenAI } from '@/lib/llm/openai';
import { PROVIDER_DEFAULTS, type ChatConfig, type ChatMessage } from '@/lib/llm/types';

export const runtime = 'nodejs';

interface ChatRequest {
  messages: ChatMessage[];
  config?: Partial<ChatConfig>;
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const provider = body.config?.provider ?? 'anthropic';
  const defaults = PROVIDER_DEFAULTS[provider];

  const config: ChatConfig = {
    provider,
    baseUrl: body.config?.baseUrl?.trim() || defaults.baseUrl,
    apiKey: body.config?.apiKey?.trim() || undefined,
    model: body.config?.model?.trim() || defaults.model,
  };

  if (!config.apiKey) {
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: '未配置 ANTHROPIC_API_KEY，可在右上⚙处填入。' },
        { status: 400 },
      );
    }
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI 兼容模式需要 API key，请在右上⚙处填入。' },
        { status: 400 },
      );
    }
  }

  try {
    const result =
      provider === 'anthropic'
        ? await runAnthropic(body.messages, config)
        : await runOpenAI(body.messages, config);
    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    return NextResponse.json({ error: `调用失败：${msg}` }, { status: 500 });
  }
}
