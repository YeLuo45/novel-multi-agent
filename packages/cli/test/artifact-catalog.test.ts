import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { runArtifactCatalog } from '../src/index.js';

function projectJson(id: string, title: string): string {
  return JSON.stringify({
    id,
    title,
    stage: 'completed',
    input: { mode: 'theme', theme: title, targetChapters: 1, targetWords: 900, language: 'zh-CN' },
    bible: { premise: title, genre: '科幻', tone: '冷静', worldRules: [], characters: [], promises: [] },
    outline: [{ number: 1, title: '第1章 起点', purpose: '开场', conflict: '选择', foreshadowing: [] }],
    revision: { chapterNumber: 1, title: '第1章 起点', body: '正文', targetWords: 900 },
    memory: { characters: {}, foreshadowing: [], chapterSummaries: [], styleFingerprint: [] },
    auditLog: [{ createdAt: '2026-06-23T00:00:00.000Z' }],
  });
}

describe('artifact catalog runner', () => {
  it('scans project artifact files and returns catalog items plus issues', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'novel-ma-catalog-'));
    try {
      const first = path.join(dir, 'first');
      const second = path.join(dir, 'nested', 'second');
      const broken = path.join(dir, 'broken');
      await mkdir(first, { recursive: true });
      await mkdir(second, { recursive: true });
      await mkdir(broken, { recursive: true });
      await writeFile(path.join(first, 'artifact.json'), projectJson('first-id', '《乙项目》'), 'utf8');
      await writeFile(path.join(second, 'artifact.json'), projectJson('second-id', '《甲项目》'), 'utf8');
      await writeFile(path.join(broken, 'artifact.json'), 'not-json', 'utf8');

      const result = await runArtifactCatalog([dir], dir);
      assert.deepEqual(result.items.map((item) => item.projectId), ['second-id', 'first-id']);
      assert.equal(result.items[0]?.outlineChapters, 1);
      assert.equal(result.issues.length, 1);
      assert.ok(result.issues[0]?.path.endsWith('broken/artifact.json'));

      const enriched = await runArtifactCatalog([dir, '--enrich'], dir);
      assert.equal(typeof enriched.items[0]?.qualityScore, 'number');
      assert.ok(enriched.items[0]?.tags.includes('科幻'));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
