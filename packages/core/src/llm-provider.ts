export interface LlmRequest {
  prompt: string;
  temperature?: number;
}

export interface LlmResult {
  text: string;
  provider: string;
  model?: string;
  usedFallback: boolean;
}

export interface LlmProvider {
  complete(request: LlmRequest): Promise<LlmResult>;
}

export interface LlmFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type LlmFetch = (url: string, init: { method: 'POST'; headers: Record<string, string>; body: string }) => Promise<LlmFetchResponse>;

export function createMockLlmProvider(options: { prefix?: string } = {}): LlmProvider {
  const prefix = options.prefix ?? 'MOCK';
  return {
    async complete(request) {
      return {
        text: `${prefix}: ${request.prompt.slice(0, 80)}`,
        provider: 'mock',
        model: 'deterministic-local',
        usedFallback: false,
      };
    },
  };
}

function parseOpenAICompatibleText(payload: unknown): string {
  const record = payload as { choices?: Array<{ message?: { content?: unknown }; text?: unknown }> };
  const choice = record.choices?.[0];
  const content = choice?.message?.content ?? choice?.text;
  if (typeof content !== 'string' || content.length === 0) throw new Error('OpenAI-compatible response missing content');
  return content;
}

export function createOpenAICompatibleProvider(options: { apiKey?: string; baseUrl: string; model: string; fetchImpl?: LlmFetch }): LlmProvider {
  return {
    async complete(request) {
      if (!options.apiKey) throw new Error('OPENAI_COMPATIBLE_API_KEY missing');
      const fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as LlmFetch | undefined);
      if (!fetchImpl) throw new Error('fetch is not available');
      const baseUrl = options.baseUrl.replace(/\/+$/, '');
      const response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model,
          messages: [{ role: 'user', content: request.prompt }],
          temperature: request.temperature ?? 0.7,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI-compatible provider failed with HTTP ${response.status}`);
      return {
        text: parseOpenAICompatibleText(await response.json()),
        provider: 'openai-compatible',
        model: options.model,
        usedFallback: false,
      };
    },
  };
}

export interface LlmProviderConfigDiagnostic {
  ready: boolean;
  provider: 'openai-compatible' | 'mock-fallback';
  baseUrl: string;
  model: string;
  missing: string[];
}

export function diagnoseLLMProviderConfig(env: Record<string, string | undefined>): LlmProviderConfigDiagnostic {
  const hasApiKey = Boolean(env.OPENAI_COMPATIBLE_API_KEY || env.OPENAI_API_KEY);
  const baseUrl = env.OPENAI_COMPATIBLE_BASE_URL ?? 'https://api.openai.com/v1';
  const model = env.OPENAI_COMPATIBLE_MODEL ?? env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    ready: hasApiKey,
    provider: hasApiKey ? 'openai-compatible' : 'mock-fallback',
    baseUrl,
    model,
    missing: hasApiKey ? [] : ['OPENAI_COMPATIBLE_API_KEY'],
  };
}

export function createLLMProviderFromEnv(env: Record<string, string | undefined>): LlmProvider {
  const primary = createOpenAICompatibleProvider({
    apiKey: env.OPENAI_COMPATIBLE_API_KEY || env.OPENAI_API_KEY,
    baseUrl: env.OPENAI_COMPATIBLE_BASE_URL ?? 'https://api.openai.com/v1',
    model: env.OPENAI_COMPATIBLE_MODEL ?? env.OPENAI_MODEL ?? 'gpt-4o-mini',
  });
  return {
    async complete(request) {
      return generateWithFallback(primary, createMockLlmProvider({ prefix: 'MOCK-FALLBACK' }), request);
    },
  };
}

export async function generateWithFallback(primary: LlmProvider, fallback: LlmProvider, request: LlmRequest): Promise<LlmResult> {
  try {
    return await primary.complete(request);
  } catch {
    const result = await fallback.complete(request);
    return { ...result, usedFallback: true };
  }
}
