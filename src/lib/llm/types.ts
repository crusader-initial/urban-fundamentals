export type Provider = 'anthropic' | 'openai';

export interface ChatConfig {
  provider: Provider;
  baseUrl?: string;
  apiKey?: string;
  model: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolEvent {
  tool: string;
  input: unknown;
}

export interface ChatResult {
  reply: string;
  toolEvents: ToolEvent[];
}

export const PROVIDER_DEFAULTS: Record<Provider, { baseUrl?: string; model: string }> = {
  anthropic: { model: 'claude-opus-4-7' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
};
