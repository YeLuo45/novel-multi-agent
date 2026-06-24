import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { runArtifactDiff, runArtifactExport, runArtifactLatest, runArtifactNormalize, runArtifactPrune, runArtifactSearch, runArtifactVersionTree, runContinuationCheck, runContinue } from '../src/index.js';

function projectJson(id: string, title: string, createdAt: string, text = '林墨握住银色书签，短句冷色意象。', setup = '银色书签'): string {
  return JSON.stringify({
    id,
    title,
    stage: 'completed',
    input: { mode: 'theme', theme: title, targetChapters: 1, targetWords: 900, language: 'zh-CN' },
    bible: { premise: title, genre: '科幻', tone: '短句 冷色意象', worldRules: [], characters: ['林墨', '阿回'], promises: [] },
    outline: [{ number: 1, title: '第1章 起点', purpose: '林墨开场', conflict: '选择', foreshadowing: [setup] }],
    revision: { chapterNumber: 1, title: '第1章 起点', body: text, targetWords: 900 },
    memory: { characters: { 林墨: '守夜人', 阿回: 'AI' }, foreshadowing: [setup], chapterSummaries: [text], styleFingerprint: ['短句', '冷色意象'] },
    auditLog: [{ createdAt }],
  });
}

describe('artifact extended cli runners', () => {
  it('runs latest, search, normalize, diff, and continuation quality commands', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'novel-ma-extended-'));
    try {
      const oldDir = path.join(dir, 'old');
      const newDir = path.join(dir, 'new');
      const otherDir = path.join(dir, 'other');
      await mkdir(oldDir, { recursive: true });
      await mkdir(newDir, { recursive: true });
      await mkdir(otherDir, { recursive: true });
      const oldPath = path.join(oldDir, 'artifact.json');
      const newPath = path.join(newDir, 'artifact.json');
      const otherPath = path.join(otherDir, 'artifact.json');
      await writeFile(oldPath, projectJson('old', '《同名项目》', '2026-06-22T00:00:00.000Z'), 'utf8');
      await writeFile(newPath, projectJson('new', '《同名项目》', '2026-06-23T00:00:00.000Z'), 'utf8');
      await writeFile(otherPath, projectJson('other', '《火星档案》', '2026-06-24T00:00:00.000Z', '火星档案记录蓝光。', '蓝光回声'), 'utf8');

      const latest = await runArtifactLatest([dir], dir);
      assert.equal(latest.groups.find((group) => group.key.includes('同名项目'))?.latest.projectId, 'new');
      assert.equal('searchableText' in (latest.items[0] ?? {}), false);
      const verboseLatest = await runArtifactLatest([dir, '--verbose'], dir);
      assert.equal(typeof verboseLatest.items[0]?.searchableText, 'string');

      const search = await runArtifactSearch([dir, '银色书签'], dir);
      assert.deepEqual(search.items.map((item) => item.projectId), ['new', 'old']);
      assert.equal('searchableText' in (search.items[0] ?? {}), false);
      const latestOnly = await runArtifactSearch([dir, '银色书签', '--latest-only'], dir);
      assert.deepEqual(latestOnly.items.map((item) => item.projectId), ['new']);
      const modeFiltered = await runArtifactSearch([dir, '银色书签', '--mode', 'theme'], dir);
      assert.deepEqual(modeFiltered.items.map((item) => item.projectId), ['new', 'old']);

      const normalized = await runArtifactNormalize([newPath], dir);
      assert.equal(normalized.schemaVersion, 2);
      assert.equal(normalized.summary.projectId, 'new');

      const exported = await runArtifactExport([newPath], dir);
      assert.equal(exported.schemaVersion, 2);
      assert.equal(exported.summary.projectId, 'new');

      const versionTree = await runArtifactVersionTree([newPath], dir);
      assert.equal(versionTree.latestByChapter[0]?.chapterNumber, 1);
      assert.equal(versionTree.latestByChapter[0]?.source, 'revision');
      assert.equal(versionTree.roots[0]?.children.length, 1);

      const prune = await runArtifactPrune([dir, '--keep', '1'], dir);
      assert.equal(prune.dryRun, true);
      assert.deepEqual(prune.remove.map((item) => item.projectId), ['old']);

      const diff = await runArtifactDiff([oldPath, otherPath], dir);
      if (!Array.isArray(diff)) throw new Error('expected JSON diff array');
      assert.ok(diff.some((item) => item.field === 'title'));
      assert.ok(diff.some((item) => item.field === 'outline.length') === false);
      const diffReport = await runArtifactDiff([oldPath, otherPath, '--format', 'text'], dir);
      if (typeof diffReport !== 'string') throw new Error('expected text diff report');
      assert.ok(diffReport.includes('title'));

      const appliedPrune = await runArtifactPrune([dir, '--keep', '1', '--apply'], dir);
      assert.equal(appliedPrune.dryRun, false);
      assert.equal(appliedPrune.backupManifest?.removed.length, 1);
      assert.ok(/prune-manifest/.test(appliedPrune.backupManifest?.manifestPath ?? ''));

      const quality = await runContinuationCheck([newPath, '林墨拿起银色书签，用短句写下冷色意象。'], dir);
      assert.equal(quality.status, 'pass');

      const sourcePath = path.join(dir, 'source.md');
      await writeFile(sourcePath, '# 第一章 旧线索\n林墨和阿回握住银色书签，用短句写下冷色意象。', 'utf8');
      const continued = await runContinue([sourcePath, '--quality-artifact', newPath], dir);
      assert.equal(continued.qualityGate?.status, 'pass');
      await assert.rejects(() => runContinue([sourcePath, '--quality-artifact', newPath, '--quality-text', '完全无关。'], dir), /quality gate failed/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
