import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { runContinue, runNew, runProviderDoctor, runProviderSmoke } from '../src/index.js';

describe('cli runners', () => {
  it('writes an artifact for a new themed project', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'novel-ma-'));
    try {
      const result = await runNew(['月球图书馆', '--chapters', '2'], dir);
      assert.equal(result.stage, 'completed');
      const artifact = JSON.parse(await readFile(result.artifactPath, 'utf8'));
      assert.equal(artifact.outline.length, 2);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('writes an artifact for continuation input', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'novel-ma-'));
    try {
      const source = path.join(dir, 'chapters.md');
      await writeFile(source, `# 第一章
月背图书馆。`, 'utf8');
      const result = await runContinue([source, '--words', '600'], dir);
      assert.equal(result.stage, 'completed');
      assert.ok(result.chapterTitle.includes('第'));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('uses mock fallback for provider smoke when no provider api key is configured', async () => {
    const result = await runProviderSmoke(['测试提示'], { OPENAI_COMPATIBLE_API_KEY: '' });
    assert.equal(result.provider, 'mock');
    assert.equal(result.usedFallback, true);
    assert.ok(result.text.includes('测试提示'));
  });

  it('reports provider readiness without leaking secrets', () => {
    const result = runProviderDoctor({ OPENAI_COMPATIBLE_API_KEY: 'secret-token', OPENAI_COMPATIBLE_MODEL: 'story-model' });
    assert.equal(result.ready, true);
    assert.equal(result.provider, 'openai-compatible');
    assert.equal(result.model, 'story-model');
    assert.equal('apiKey' in result, false);
  });
});
