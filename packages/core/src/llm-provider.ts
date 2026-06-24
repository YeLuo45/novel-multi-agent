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

export function createOpenAICompatibleProvider(options: { apiKey?: string; baseUrl: string; model: string }): LlmProvider {
  return {
    async complete(request) {
      if (!options.apiKey) throw new Error('OPENAI_COMPATIBLE_API_KEY missing');
      return {
        text: `[${options.model}] ${request.prompt}`,
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
