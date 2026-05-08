import OpenAI from 'openai';
import { TOOLS, SYSTEM_PROMPT, runTool } from '../tools';
import type { ChatConfig, ChatMessage, ChatResult, ToolEvent } from './types';

const MAX_ITERS = 8;

const OPENAI_TOOLS: OpenAI.ChatCompletionTool[] = TOOLS.map(t => ({
  type: 'function' as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema as Record<string, unknown>,
  },
}));

export async function runOpenAI(
  history: ChatMessage[],
  config: ChatConfig,
): Promise<ChatResult> {
  const client = new OpenAI({
    apiKey: config.apiKey ?? process.env.OPENAI_API_KEY ?? 'sk-noop',
    baseURL: config.baseUrl,
  });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content }) as const),
  ];

  const toolEvents: ToolEvent[] = [];

  for (let i = 0; i < MAX_ITERS; i++) {
    const response = await client.chat.completions.create({
      model: config.model,
      messages,
      tools: OPENAI_TOOLS,
      max_tokens: 4096,
    });
    const choice = response.choices[0];
    const msg = choice.message;

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { reply: msg.content ?? '（模型未给出明确回复。）', toolEvents };
    }

    // Append assistant message (with tool_calls) so subsequent tool messages
    // are anchored to it correctly per OpenAI's expected sequence.
    messages.push({
      role: 'assistant',
      content: msg.content ?? '',
      tool_calls: msg.tool_calls.map(tc => {
        if (tc.type !== 'function') {
          throw new Error(`unsupported tool call type: ${tc.type}`);
        }
        return tc;
      }),
    });

    for (const call of msg.tool_calls) {
      if (call.type !== 'function') continue;
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(call.function.arguments || '{}');
      } catch {
        // model returned malformed JSON; fall through with empty input
      }
      const result = await runTool(call.function.name, input);
      toolEvents.push({ tool: call.function.name, input });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    if (choice.finish_reason === 'stop') {
      // Defensive: some providers set stop after tool_calls; loop again to
      // give the model a chance to summarize.
    }
  }

  return { reply: '（推理步数过多，已中止。请换种问法重试。）', toolEvents };
}
