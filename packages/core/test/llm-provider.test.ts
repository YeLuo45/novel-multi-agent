import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLLMProviderFromEnv, createMockLlmProvider, createOpenAICompatibleProvider, diagnoseLLMProviderConfig, generateWithFallback } from '../src/index.js';

describe('llm providers', () => {
  it('uses mock provider without network when no api key is present', async () => {
    const provider = createMockLlmProvider({ prefix: 'MOCK' });
    const result = await provider.complete({ prompt: '写一个月球图书馆开头', temperature: 0.4 });
    assert.equal(result.provider, 'mock');
    assert.ok(result.text.includes('MOCK'));
    assert.equal(result.usedFallback, false);
  });

  it('falls back to mock provider when openai-compatible provider has no api key', async () => {
    const primary = createOpenAICompatibleProvider({ apiKey: '', baseUrl: 'https://example.invalid/v1', model: 'test-model' });
    const fallback = createMockLlmProvider({ prefix: 'FALLBACK' });
    const result = await generateWithFallback(primary, fallback, { prompt: '续写', temperature: 0.3 });
    assert.equal(result.provider, 'mock');
    assert.equal(result.usedFallback, true);
    assert.ok(result.text.includes('FALLBACK'));
  });

  it('builds an env-driven provider with deterministic fallback when no compatible api key exists', async () => {
    const provider = createLLMProviderFromEnv({ OPENAI_COMPATIBLE_API_KEY: '', OPENAI_COMPATIBLE_MODEL: 'story-model' });
    const result = await provider.complete({ prompt: '章节烟测', temperature: 0 });
    assert.equal(result.provider, 'mock');
    assert.equal(result.usedFallback, true);
    assert.ok(result.text.includes('章节烟测'));
  });

  it('diagnoses provider config without exposing secret values', () => {
    const missing = diagnoseLLMProviderConfig({ OPENAI_COMPATIBLE_MODEL: 'story-model' });
    assert.equal(missing.ready, false);
    assert.equal(missing.provider, 'mock-fallback');
    assert.deepEqual(missing.missing, ['OPENAI_COMPATIBLE_API_KEY']);

    const ready = diagnoseLLMProviderConfig({ OPENAI_COMPATIBLE_API_KEY: 'secret-token', OPENAI_COMPATIBLE_BASE_URL: 'https://llm.example/v1', OPENAI_COMPATIBLE_MODEL: 'story-model' });
    assert.equal(ready.ready, true);
    assert.equal(ready.provider, 'openai-compatible');
    assert.equal(ready.baseUrl, 'https://llm.example/v1');
    assert.equal(ready.model, 'story-model');
    assert.equal('apiKey' in ready, false);
  });

  it('calls an OpenAI-compatible chat completions endpoint through injected fetch', async () => {
    const calls: Array<{ url: string; headers: Record<string, string>; body: string }> = [];
    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-token',
      baseUrl: 'https://llm.example/v1/',
      model: 'story-model',
      fetchImpl: async (url, init) => {
        calls.push({ url, headers: init.headers, body: init.body });
        return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: '真实续写结果' } }] }) };
      },
    });

    const result = await provider.complete({ prompt: '续写月球图书馆', temperature: 0.2 });

    assert.equal(result.text, '真实续写结果');
    assert.equal(result.provider, 'openai-compatible');
    assert.equal(result.model, 'story-model');
    assert.equal(calls[0]?.url, 'https://llm.example/v1/chat/completions');
    assert.equal(calls[0]?.headers.Authorization, 'Bearer secret-token');
    assert.equal(JSON.parse(calls[0]?.body ?? '{}').messages[0].content, '续写月球图书馆');
  });

  it('falls back when the OpenAI-compatible endpoint returns an error', async () => {
    const primary = createOpenAICompatibleProvider({
      apiKey: 'secret-token',
      baseUrl: 'https://llm.example/v1',
      model: 'story-model',
      fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({ error: { message: 'busy' } }) }),
    });
    const result = await generateWithFallback(primary, createMockLlmProvider({ prefix: 'SAFE' }), { prompt: '降级续写' });
    assert.equal(result.provider, 'mock');
    assert.equal(result.usedFallback, true);
    assert.ok(result.text.includes('降级续写'));
  });
});
