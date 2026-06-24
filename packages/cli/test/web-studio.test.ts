import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildContinuationStudio,
  buildNarrativeAnalyticsDashboard,
  buildProviderConsole,
  buildTuiInteractiveShell,
  buildWebArtifactLibrary,
  buildWebProjectDashboard,
  buildWebTuiSurfaceContract,
  renderTuiShellPanel,
  renderWebStudioPanel,
} from '../src/web-studio.js';

const sampleArtifacts = [
  {
    projectId: 'moon-1',
    title: '《月背图书馆》',
    mode: 'theme',
    stage: 'completed',
    chapterTitle: '第1章 异常的开端',
    updatedAt: '2026-06-24T10:00:00.000Z',
    artifact: {
      characters: ['主角：守夜人', '同行者：失忆AI'],
      foreshadowing: ['银匙:recovered', '旧门:open', '月尘脚印:overdue'],
      outline: [
        { chapter: 1, title: '异常的开端', summary: '主角发现月背图书馆异常。' },
        { chapter: 2, title: '线索的回声', summary: '失忆AI说出银匙来源。' },
      ],
      style: ['克制、悬疑、带微光', '短句推进'],
      chapterSummary: '主角带着银匙追踪旧门。',
    },
  },
  {
    projectId: 'moon-2',
    title: '《月背图书馆》',
    mode: 'continuation',
    stage: 'completed',
    chapterTitle: '第2章 线索的回声',
    updatedAt: '2026-06-25T10:00:00.000Z',
    artifact: {
      characters: ['主角：守夜人'],
      foreshadowing: ['旧门:recovered'],
      outline: [{ chapter: 2, title: '线索的回声', summary: '旧门打开。' }],
      style: ['短句推进'],
      continuationContext: '旧门打开后，AI恢复一段记忆。',
    },
  },
];

describe('web-first studio models', () => {
  it('builds a project dashboard with visible status and next actions', () => {
    const dashboard = buildWebProjectDashboard(sampleArtifacts);

    assert.equal(dashboard.summary.totalProjects, 2);
    assert.equal(dashboard.summary.latestProjectId, 'moon-2');
    assert.equal(dashboard.health.foreshadowing.overdue, 1);
    assert.ok(dashboard.cards.some((card) => card.title.includes('月背图书馆')));
    assert.ok(dashboard.quickActions.map((action) => action.kind).includes('continue'));
    assert.ok(renderWebStudioPanel({ dashboard }).includes('Web Project Dashboard'));
  });

  it('builds artifact library filters and semantic search index', () => {
    const library = buildWebArtifactLibrary(sampleArtifacts, { query: '银匙', mode: 'theme', tag: 'foreshadowing' });

    assert.equal(library.filters.modes.includes('theme'), true);
    assert.equal(library.results.length, 1);
    assert.equal(library.results[0]?.projectId, 'moon-1');
    assert.ok(library.diffPicker.leftCandidates.length >= 1);
    assert.ok(library.indexedTextById['moon-1']?.includes('银匙'));
  });

  it('builds continuation studio panes with repair suggestions', () => {
    const studio = buildContinuationStudio(sampleArtifacts[0]!, '# 第一章 异常\n守夜人发现银匙。', '继续追踪旧门');

    assert.equal(studio.input.chapterCount, 1);
    assert.ok(studio.memoryPane.characters.length >= 1);
    assert.ok(studio.foreshadowingPane.items.some((item) => item.status === 'overdue'));
    assert.ok(studio.draftPane.draft.includes('继续追踪旧门'));
    assert.ok(studio.repairPane.suggestions.length >= 1);
  });

  it('builds provider console diagnostics without leaking keys', () => {
    const console = buildProviderConsole({ provider: 'openai-compatible', model: 'gpt-test', apiKey: 'sk-secret-token', endpoint: 'https://example.test/v1' });

    assert.equal(console.mode, 'live');
    assert.equal(console.ready, true);
    assert.ok(console.maskedKey.includes('sk-'));
    assert.equal(console.maskedKey.includes('secret-token'), false);
    assert.ok(console.smokePrompt.includes('月背图书馆'));
    assert.ok(console.costEstimate.tokens > 0);
  });

  it('builds narrative analytics dashboard with user-readable risks', () => {
    const analytics = buildNarrativeAnalyticsDashboard(sampleArtifacts);

    assert.ok(analytics.characterHeatmap.some((item) => item.name.includes('主角')));
    assert.equal(analytics.foreshadowingCycle.overdue, 1);
    assert.ok(analytics.pacingCurve.length >= 2);
    assert.ok(analytics.risks.some((risk) => risk.kind === 'overdue-foreshadowing'));
  });

  it('builds interactive TUI shell from the same action contract', () => {
    const contract = buildWebTuiSurfaceContract();
    const shell = buildTuiInteractiveShell(contract, 'continue');

    assert.equal(contract.actions.length >= 7, true);
    assert.equal(contract.actions.every((action) => action.web.visible && action.tui.visible), true);
    assert.equal(shell.selectedAction?.id, 'continue');
    assert.ok(shell.commands.some((command) => command.includes('novel-ma continue')));
    assert.ok(renderTuiShellPanel(shell).includes('Interactive Shell'));
  });
});
