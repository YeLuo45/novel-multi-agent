import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { runArtifactInspect } from '../src/index.js';

describe('artifact inspect runner', () => {
  it('reads an artifact JSON file and returns summary plus memory graph counts', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'novel-ma-artifact-'));
    try {
      const artifactPath = path.join(dir, 'artifact.json');
      await writeFile(
        artifactPath,
        JSON.stringify({
          projectId: 'novel-demo',
          title: '月球图书馆',
          stage: 'completed',
          chapterTitle: '第一章 月背门厅',
          artifact: {
            mode: 'theme',
            bible: {
              premise: '守夜人与失忆AI修复月球图书馆。',
              genre: '科幻',
              tone: '克制温暖',
              worldRules: ['月背图书馆保存文明残响'],
              characters: ['林墨', '阿回'],
              promises: ['AI记忆将决定结局'],
            },
            outline: [{ number: 1, title: '月背门厅', purpose: '建立危机', conflict: '氧气不足', foreshadowing: ['银色书签'] }],
            memory: {
              characters: { 林墨: '守夜人', 阿回: '失忆AI' },
              foreshadowing: ['银色书签'],
              chapterSummaries: ['林墨进入月背门厅。'],
              styleFingerprint: ['短句'],
            },
            foreshadowingScore: { score: 91, missingPayoffs: [], danglingSetups: [] },
          },
        }),
        'utf8',
      );

      const result = await runArtifactInspect([artifactPath], dir);
      assert.equal(result.summary.projectId, 'novel-demo');
      assert.equal(result.summary.outlineChapters, 1);
      assert.equal(result.graph.nodes, 5);
      assert.equal(result.graph.edges, 2);
      assert.deepEqual(result.validation, { ok: true, issues: [] });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
