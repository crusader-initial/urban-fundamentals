import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { TOOLS, SYSTEM_PROMPT, runTool } from '@/lib/tools';

export const runtime = 'nodejs';

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: '服务未配置 ANTHROPIC_API_KEY，请在 .env.local 设置后重启。' },
      { status: 500 },
    );
  }

  const body = (await req.json()) as ChatRequest;
  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = body.messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const toolEvents: Array<{ tool: string; input: unknown }> = [];

  for (let i = 0; i < 8; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ],
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === 'end_turn' || response.stop_reason === 'max_tokens') {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      return NextResponse.json({ reply: text, toolEvents });
    }

    if (response.stop_reason !== 'tool_use') {
      return NextResponse.json({
        reply: '（模型未给出明确回复，请换种问法重试。）',
        toolEvents,
      });
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;
      const result = await runTool(block.name, block.input as Record<string, unknown>);
      toolEvents.push({ tool: block.name, input: block.input });
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return NextResponse.json({
    reply: '（推理步数过多，已中止。请换种问法重试。）',
    toolEvents,
  });
}
