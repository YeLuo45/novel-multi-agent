import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildContinuationStudio,
  buildNarrativeAnalyticsDashboard,
  buildPagesAcceptancePlan,
  buildProductClosureHub,
  buildProviderConsole,
  buildProviderLiveRequest,
  buildProviderLiveSmokeResult,
  buildRealProjectBrowser,
  buildRevisionHistory,
  buildTuiCommandRouter,
  buildTuiInteractiveShell,
  buildWebArtifactEditor,
  buildWebArtifactLibrary,
  buildWebProjectDashboard,
  buildWebTuiSurfaceContract,
  buildWorkspacePersistencePlan,
  createExecutableProviderSmoke,
  generatePagesVerifyScript,
  generateQualityRewritePatch,
  loadRealArtifactWorkspace,
  planPersistentEditorRevision,
  runAgentCollaborationPipeline,
  runExecutableAgentPipeline,
  runPagesAcceptanceChecks,
  scoreLongformProjectRisks,
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

  it('builds a real project browser from artifact paths and invalid entries', () => {
    const browser = buildRealProjectBrowser([
      { path: '.novel-ma/projects/moon-1/artifact.json', artifact: sampleArtifacts[0] },
      { path: '.novel-ma/projects/bad/artifact.json', error: 'invalid json' },
    ]);

    assert.equal(browser.root, '.novel-ma/projects');
    assert.equal(browser.projects.length, 1);
    assert.equal(browser.issues.length, 1);
    assert.equal(browser.projects[0]?.sourcePath.includes('moon-1'), true);
    assert.ok(browser.commands.open.includes('artifact-inspect'));
  });

  it('builds editable artifact forms and revision history', () => {
    const editor = buildWebArtifactEditor(sampleArtifacts[0]!);
    const edited = editor.applyEdit({ chapterTitle: '第1章 银匙归来', character: '馆长：掌管门禁', foreshadowing: '门禁钟:open', style: '冷光叙事' });
    const history = buildRevisionHistory(sampleArtifacts[0]!, edited, 'boss edit');

    assert.equal(editor.sections.includes('characters'), true);
    assert.equal(edited.chapterTitle, '第1章 银匙归来');
    assert.ok(edited.artifact?.characters?.some((item) => item.includes('馆长')));
    assert.ok(edited.artifact?.foreshadowing?.includes('门禁钟:open'));
    assert.ok(history.entries[0]?.note.includes('boss edit'));
  });

  it('generates quality rewrite patch and executable TUI command routes', () => {
    const patch = generateQualityRewritePatch(sampleArtifacts[0]!, '陌生人穿过广场。');
    const router = buildTuiCommandRouter(buildWebTuiSurfaceContract(), { projectPath: '.novel-ma/projects/moon-1/artifact.json' });

    assert.equal(patch.status, 'needs-rewrite');
    assert.ok(patch.patchText.includes('修复建议'));
    assert.ok(patch.revisionNote.includes('foreshadowing'));
    assert.ok(router.routes.some((route) => route.id === 'continue' && route.command.includes('quality-artifact')));
  });

  it('plans provider live requests and GitHub Pages acceptance checks', () => {
    const request = buildProviderLiveRequest({ provider: 'openai-compatible', model: 'gpt-live', endpoint: 'https://api.example.test/v1', apiKey: 'sk-secret', prompt: '续写月背图书馆' });
    const plan = buildPagesAcceptancePlan('https://yeluo45.github.io/novel-multi-agent/');

    assert.equal(request.method, 'POST');
    assert.equal(request.headers.Authorization.includes('secret'), false);
    assert.ok(request.body.messages[0]?.content.includes('续写月背图书馆'));
    assert.ok(plan.checks.some((check) => check.url.endsWith('/apps/web/')));
    assert.ok(plan.checks.some((check) => check.url.endsWith('/apps/tui/')));
  });

  it('builds V34 product closure hub across persistence smoke pages project OS and agents', () => {
    const persistence = buildWorkspacePersistencePlan(sampleArtifacts, 'local-browser');
    const smoke = buildProviderLiveSmokeResult(buildProviderLiveRequest({ provider: 'openai-compatible', model: 'gpt-live', endpoint: 'https://api.example.test/v1', apiKey: 'sk-secret', prompt: '续写月背图书馆' }), { ok: true, content: '月背图书馆继续亮起。' });
    const pages = runPagesAcceptanceChecks(buildPagesAcceptancePlan('https://yeluo45.github.io/novel-multi-agent/'), { root: 'novel-multi-agent', web: 'V34 Product Closure', tui: 'Interactive Shell' });
    const pipeline = runAgentCollaborationPipeline(sampleArtifacts[0]!, ['planner', 'writer', 'editor', 'continuity', 'test']);
    const hub = buildProductClosureHub(sampleArtifacts, { baseUrl: 'https://yeluo45.github.io/novel-multi-agent/', provider: 'openai-compatible' });

    assert.equal(persistence.strategy, 'local-browser');
    assert.ok(persistence.actions.includes('import-bundle'));
    assert.ok(persistence.actions.includes('export-bundle'));
    assert.equal(smoke.status, 'pass');
    assert.equal(smoke.maskedAuthorization.includes('secret'), false);
    assert.equal(pages.status, 'pass');
    assert.ok(pages.results.every((item) => item.ok));
    assert.deepEqual(pipeline.steps.map((step) => step.role), ['planner', 'writer', 'editor', 'continuity', 'test']);
    assert.equal(pipeline.finalArtifact.stage, 'accepted');
    assert.equal(hub.kind, 'product-closure-hub');
    assert.equal(hub.directions.length, 6);
    assert.ok(hub.projectOS.sections.includes('foreshadowing-ledger'));
    assert.ok(hub.pipeline.steps.some((step) => step.outputKey === 'continuity-report'));
  });

  it('builds V35-V40 executable closure primitives for pages provider workspace agents risks and editor persistence', () => {
    const verifyScript = generatePagesVerifyScript('https://yeluo45.github.io/novel-multi-agent/');
    const smokeExecutor = createExecutableProviderSmoke({ provider: 'openai-compatible', model: 'gpt-live', endpoint: 'https://api.example.test/v1', apiKeyEnv: 'NOVEL_MA_API_KEY' });
    const workspace = loadRealArtifactWorkspace([
      { path: '.novel-ma/projects/moon-1/artifact.json', json: JSON.stringify(sampleArtifacts[0]) },
      { path: '.novel-ma/projects/bad/artifact.json', json: '{bad json' },
    ]);
    const executablePipeline = runExecutableAgentPipeline(sampleArtifacts[0]!, { roles: ['planner', 'writer', 'editor', 'continuity', 'test'], persist: true });
    const risks = scoreLongformProjectRisks(sampleArtifacts);
    const revision = planPersistentEditorRevision(sampleArtifacts[0]!, { chapterTitle: '第1章 银匙归来', character: '馆长：掌管门禁' });

    assert.ok(verifyScript.command.includes('verify:pages'));
    assert.ok(verifyScript.script.includes('V34 Product Closure'));
    assert.equal(smokeExecutor.mode, 'env-live-or-mock');
    assert.equal(smokeExecutor.request.headers.Authorization.includes('NOVEL_MA_API_KEY'), false);
    assert.ok(smokeExecutor.command.includes('provider-smoke'));
    assert.equal(workspace.projects.length, 1);
    assert.equal(workspace.issues.length, 1);
    assert.ok(workspace.browser.projects[0]?.sourcePath.endsWith('artifact.json'));
    assert.equal(executablePipeline.status, 'ready');
    assert.ok(executablePipeline.commands.some((command) => command.includes('agent-runner')));
    assert.ok(executablePipeline.outputs.includes('acceptance-report'));
    assert.ok(risks.overallScore < 100);
    assert.ok(risks.risks.some((risk) => risk.kind === 'foreshadowing-overdue'));
    assert.equal(revision.operation, 'persist-revision');
    assert.ok(revision.diff.some((item) => item.field === 'chapterTitle'));
    assert.ok(revision.catalogUpdate.searchableText.includes('馆长'));
  });
});
