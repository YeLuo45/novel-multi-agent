import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assessContinuationQuality,
  buildArtifactCatalog,
  buildArtifactMemoryGraph,
  buildLatestArtifactCatalog,
  buildChapterVersionTree,
  compactArtifactCatalog,
  compareArtifacts,
  enrichArtifactCatalog,
  formatArtifactDiffReport,
  createMemoryArtifactLibrary,
  exportArtifactSchema,
  importArtifactJson,
  normalizeArtifactEnvelope,
  planArtifactPrune,
  searchArtifactCatalog,
  suggestContinuationRepairs,
  summarizeArtifact,
  type NovelArtifactEnvelope,
} from '../src/index.js';

function sampleEnvelope(overrides: Partial<NovelArtifactEnvelope> = {}): NovelArtifactEnvelope {
  return {
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
      outline: [
        { number: 1, title: '月背门厅', purpose: '建立图书馆危机', conflict: '氧气不足', foreshadowing: ['银色书签'] },
        { number: 2, title: '失忆索引', purpose: '揭露AI缺口', conflict: '索引失真', foreshadowing: ['蓝光回声'] },
      ],
      memory: {
        characters: { 林墨: '守夜人', 阿回: '失忆AI' },
        foreshadowing: ['银色书签', '蓝光回声'],
        chapterSummaries: ['林墨进入月背门厅。'],
        styleFingerprint: ['短句', '冷色意象'],
      },
      foreshadowingScore: { score: 88, missingPayoffs: [], danglingSetups: ['蓝光回声'] },
    },
    ...overrides,
  };
}

describe('artifact toolkit', () => {
  it('imports artifact JSON and rejects missing required fields', () => {
    const envelope = importArtifactJson(JSON.stringify(sampleEnvelope()));
    assert.equal(envelope.projectId, 'novel-demo');
    assert.equal(envelope.artifact.outline.length, 2);

    assert.throws(() => importArtifactJson('{"title":"缺少项目"}'), /projectId/);
    assert.throws(() => importArtifactJson('not-json'), /valid JSON/);
  });

  it('imports saved NovelProject artifacts from the CLI storage format', () => {
    const savedProject = {
      id: 'saved-project',
      title: '《真实项目》',
      stage: 'completed',
      input: { mode: 'theme', theme: '真实项目', targetChapters: 1, targetWords: 900, language: 'zh-CN' },
      bible: sampleEnvelope().artifact.bible,
      outline: sampleEnvelope().artifact.outline.slice(0, 1),
      draft: { chapterNumber: 1, title: '第1章 起点', body: '正文', targetWords: 900 },
      revision: { chapterNumber: 1, title: '第1章 修订', body: '正文修订', targetWords: 900 },
      memory: sampleEnvelope().artifact.memory,
      auditLog: [],
    };

    const envelope = importArtifactJson(JSON.stringify(savedProject));
    assert.equal(envelope.projectId, 'saved-project');
    assert.equal(envelope.chapterTitle, '第1章 修订');
    assert.equal(envelope.artifact.mode, 'theme');
    assert.equal(envelope.artifact.outline.length, 1);
  });

  it('summarizes artifacts for CLI inspection', () => {
    const summary = summarizeArtifact(sampleEnvelope());
    assert.deepEqual(summary, {
      projectId: 'novel-demo',
      title: '月球图书馆',
      stage: 'completed',
      chapterTitle: '第一章 月背门厅',
      mode: 'theme',
      outlineChapters: 2,
      characterCount: 2,
      foreshadowingCount: 2,
      foreshadowingScore: 88,
      danglingSetups: ['蓝光回声'],
    });
  });

  it('compares high-level artifact differences', () => {
    const left = sampleEnvelope();
    const right = sampleEnvelope({
      title: '火星档案馆',
      chapterTitle: '第一章 红尘门厅',
      artifact: { ...sampleEnvelope().artifact, outline: sampleEnvelope().artifact.outline.slice(0, 1) },
    });

    const fields = compareArtifacts(left, right).map((diff) => diff.field);
    assert.deepEqual(fields, ['title', 'chapterTitle', 'outline.length']);
  });

  it('builds a memory graph from style, character, outline and foreshadowing data', () => {
    const graph = buildArtifactMemoryGraph(sampleEnvelope());
    assert.ok(graph.nodes.some((node) => node.id === 'character:林墨' && node.label === '林墨'));
    assert.ok(graph.nodes.some((node) => node.id === 'style:短句'));
    assert.ok(graph.nodes.some((node) => node.id === 'foreshadowing:银色书签'));
    assert.ok(graph.edges.some((edge) => edge.from === 'chapter:1' && edge.to === 'foreshadowing:银色书签'));
  });

  it('stores and exports artifacts through an in-memory library contract', () => {
    const library = createMemoryArtifactLibrary();
    library.save(sampleEnvelope());
    library.save(sampleEnvelope({ projectId: 'novel-second', title: '第二档案' }));

    assert.deepEqual(library.list().map((item) => item.projectId), ['novel-demo', 'novel-second']);
    assert.equal(library.load('novel-demo')?.title, '月球图书馆');
    assert.equal(library.remove('novel-demo'), true);
    assert.equal(library.load('novel-demo'), undefined);
    assert.equal(JSON.parse(library.exportJson()).length, 1);
  });

  it('builds a stable artifact catalog and reports bad entries as issues', () => {
    const projectJson = JSON.stringify({
      id: 'saved-project',
      title: '《真实项目》',
      stage: 'completed',
      input: { mode: 'theme', theme: '真实项目', targetChapters: 1, targetWords: 900, language: 'zh-CN' },
      bible: sampleEnvelope().artifact.bible,
      outline: sampleEnvelope().artifact.outline.slice(0, 1),
      revision: { chapterNumber: 1, title: '第1章 修订', body: '正文修订', targetWords: 900 },
      memory: sampleEnvelope().artifact.memory,
      auditLog: [{ createdAt: '2026-06-23T00:00:00.000Z' }],
    });
    const catalog = buildArtifactCatalog([
      { path: 'b/artifact.json', json: JSON.stringify(sampleEnvelope({ projectId: 'b', title: '乙项目' })) },
      { path: 'a/artifact.json', json: projectJson },
      { path: 'bad/artifact.json', json: 'not-json' },
    ]);

    assert.deepEqual(catalog.items.map((item) => item.projectId), ['saved-project', 'b']);
    assert.equal(catalog.items[0]?.sourcePath, 'a/artifact.json');
    assert.equal(catalog.items[0]?.outlineChapters, 1);
    assert.equal(catalog.items[0]?.updatedAt, '2026-06-23T00:00:00.000Z');
    assert.equal(catalog.issues.length, 1);
    assert.equal(catalog.issues[0]?.path, 'bad/artifact.json');
  });

  it('builds latest catalog groups with history for duplicate title and mode', () => {
    const catalog = buildLatestArtifactCatalog([
      { path: 'old.json', json: JSON.stringify({ ...sampleEnvelope({ projectId: 'old', title: '同名项目' }), auditLog: [{ createdAt: '2026-06-22T00:00:00.000Z' }] }) },
      { path: 'new.json', json: JSON.stringify({ ...sampleEnvelope({ projectId: 'new', title: '同名项目' }), auditLog: [{ createdAt: '2026-06-23T00:00:00.000Z' }] }) },
      { path: 'other.json', json: JSON.stringify(sampleEnvelope({ projectId: 'other', title: '其他项目' })) },
    ]);

    assert.equal(catalog.groups.length, 2);
    assert.equal(catalog.groups[1]?.latest.projectId, 'new');
    assert.deepEqual(catalog.groups[1]?.history.map((item) => item.projectId), ['new', 'old']);
  });

  it('normalizes artifacts with schemaVersion and searches catalog content', () => {
    const normalized = normalizeArtifactEnvelope(sampleEnvelope());
    assert.equal(normalized.schemaVersion, 2);
    assert.equal(normalized.summary.projectId, 'novel-demo');

    const catalog = buildArtifactCatalog([{ path: 'demo.json', json: JSON.stringify(sampleEnvelope()) }]);
    const result = searchArtifactCatalog(catalog, '林墨 银色书签');
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.projectId, 'novel-demo');
  });

  it('assesses continuation quality across characters foreshadowing and style', () => {
    const artifact = sampleEnvelope();
    const good = assessContinuationQuality(artifact, '林墨握住银色书签，短句般记录冷色意象。');
    assert.equal(good.status, 'pass');
    assert.equal(good.missing.characters.length, 1);
    assert.equal(good.dimensionScores.foreshadowing, 50);

    const weak = assessContinuationQuality(artifact, '新的场景没有使用旧线索。');
    assert.equal(weak.status, 'fail');
    assert.ok(weak.score < good.score);
  });

  it('compacts catalog output by hiding searchableText unless verbose is requested', () => {
    const catalog = buildArtifactCatalog([{ path: 'demo.json', json: JSON.stringify(sampleEnvelope()) }]);
    assert.equal(typeof catalog.items[0]?.searchableText, 'string');
    const compact = compactArtifactCatalog(catalog);
    assert.equal('searchableText' in (compact.items[0] ?? {}), false);
    const verbose = compactArtifactCatalog(catalog, { verbose: true });
    assert.equal(typeof verbose.items[0]?.searchableText, 'string');
  });

  it('plans artifact pruning without deleting files and exports schema v2', () => {
    const latest = buildLatestArtifactCatalog([
      { path: 'old.json', json: JSON.stringify({ ...sampleEnvelope({ projectId: 'old', title: '同名项目' }), auditLog: [{ createdAt: '2026-06-22T00:00:00.000Z' }] }) },
      { path: 'new.json', json: JSON.stringify({ ...sampleEnvelope({ projectId: 'new', title: '同名项目' }), auditLog: [{ createdAt: '2026-06-23T00:00:00.000Z' }] }) },
    ]);
    const plan = planArtifactPrune(latest, { keep: 1 });
    assert.equal(plan.dryRun, true);
    assert.deepEqual(plan.remove.map((item) => item.projectId), ['old']);
    assert.deepEqual(plan.keep.map((item) => item.projectId), ['new']);

    const exported = exportArtifactSchema(sampleEnvelope(), 'v2');
    assert.equal(exported.schemaVersion, 2);
    assert.equal(exported.summary.projectId, 'novel-demo');
    assert.equal(exportArtifactSchema(exported, 'v2').summary.projectId, 'novel-demo');
  });

  it('formats artifact diffs into a readable report', () => {
    const diff = compareArtifacts(sampleEnvelope(), sampleEnvelope({ title: '火星档案馆', chapterTitle: '第一章 红尘门厅' }));
    const report = formatArtifactDiffReport(diff);
    assert.ok(report.includes('title'));
    assert.ok(report.includes('月球图书馆'));
    assert.ok(report.includes('火星档案馆'));
  });

  it('suggests continuation repair sentences from quality missing items', () => {
    const report = assessContinuationQuality(sampleEnvelope(), '新的场景没有使用旧线索。');
    const suggestions = suggestContinuationRepairs(report);
    assert.ok(suggestions.some((line) => line.includes('林墨')));
    assert.ok(suggestions.some((line) => line.includes('银色书签')));
  });

  it('enriches catalog items with tags and quality ranking', () => {
    const catalog = buildArtifactCatalog([
      { path: 'low.json', json: JSON.stringify(sampleEnvelope({ projectId: 'low', title: '低分档案' })) },
      {
        path: 'high.json',
        json: JSON.stringify(sampleEnvelope({
          projectId: 'high',
          title: '高分档案',
          artifact: {
            ...sampleEnvelope().artifact,
            foreshadowingScore: { score: 99, missingPayoffs: [], danglingSetups: [] },
          },
        })),
      },
    ]);

    const enriched = enrichArtifactCatalog(catalog);
    assert.equal(enriched.items[0]?.projectId, 'high');
    assert.ok(enriched.items[0]?.tags.includes('科幻'));
    assert.ok(enriched.items[0]?.tags.includes('theme'));
    assert.ok((enriched.items[0]?.qualityScore ?? 0) >= (enriched.items[1]?.qualityScore ?? 0));
  });

  it('builds a chapter version tree with parent-child revisions and latest leaves', () => {
    const tree = buildChapterVersionTree([
      { id: 'c1-draft', chapterNumber: 1, title: '第一章 草稿', body: '月背门厅', createdAt: '2026-06-24T00:00:00.000Z', source: 'draft' },
      { id: 'c1-rev-a', parentId: 'c1-draft', chapterNumber: 1, title: '第一章 修订A', body: '月背门厅加强伏笔', createdAt: '2026-06-24T00:10:00.000Z', source: 'revision' },
      { id: 'c1-rev-b', parentId: 'c1-rev-a', chapterNumber: 1, title: '第一章 修订B', body: '月背门厅加强伏笔与角色动机', createdAt: '2026-06-24T00:20:00.000Z', source: 'revision' },
      { id: 'c2-draft', chapterNumber: 2, title: '第二章 草稿', body: '星图移动', createdAt: '2026-06-24T00:30:00.000Z', source: 'draft' },
    ]);

    assert.equal(tree.roots.length, 2);
    assert.deepEqual(tree.latestByChapter.map((version) => version.id), ['c1-rev-b', 'c2-draft']);
    assert.deepEqual(tree.pathsByLeaf['c1-rev-b']?.map((version) => version.id), ['c1-draft', 'c1-rev-a', 'c1-rev-b']);
    assert.equal(tree.nodesById['c1-draft']?.children[0]?.id, 'c1-rev-a');
  });
});
