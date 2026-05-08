import Anthropic from '@anthropic-ai/sdk';
import { TOOLS, SYSTEM_PROMPT, runTool } from '../tools';
import type { ChatConfig, ChatMessage, ChatResult, ToolEvent } from './types';

const MAX_ITERS = 8;

export async function runAnthropic(
  history: ChatMessage[],
  config: ChatConfig,
): Promise<ChatResult> {
  const client = new Anthropic({
    apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
    baseURL: config.baseUrl,
  });

  const messages: Anthropic.MessageParam[] = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const toolEvents: ToolEvent[] = [];

  for (let i = 0; i < MAX_ITERS; i++) {
    const response = await client.messages.create({
      model: config.model,
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
      return { reply: text, toolEvents };
    }

    if (response.stop_reason !== 'tool_use') {
      return { reply: '（模型未给出明确回复，请换种问法重试。）', toolEvents };
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

  return { reply: '（推理步数过多，已中止。请换种问法重试。）', toolEvents };
}
