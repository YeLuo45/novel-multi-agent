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
});
