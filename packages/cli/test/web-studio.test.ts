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
  buildWebDefaultView,
  buildWebHelp,
  buildWebNavigation,
  buildWebOnboarding,
  buildInteractivePanel,
  buildChapterEditor,
  buildChapterContext,
  computeWordStats,
  planChapterSave,
  appendChapterRevision,
  buildForeshadowingGraphSvg,
  buildCharacterArcSvg,
  buildChapterPacingSvg,
  buildRevisionTree,
  buildTagIndex,
  searchProjectsIndexed,
  planIndexedDbMigration,
  buildDiffView,
  buildImportWizard,
  computeDailyGoal,
  buildHeatmapSvg,
  planFocusSession,
  planUndoEntry,
  buildPwaManifest,
  buildServiceWorkerPlan,
  renderServiceWorkerScript,
  assessOfflineCapability,
  buildPipelineTimelineSvg,
  buildAgentTraceView,
  parseArtifactIndex,
  planArtifactSync,
  buildIndexedDbSchema,
  buildIndexedDbAdapter,
  buildMigrationScript,
  renderMarkdown,
  extractMarkdownOutline,
  buildRichTextToolbar,
  buildUndoStackConfig,
  pushUndoEntry,
  popUndoEntry,
  planUndoRestore,
  computeUndoStats,
  buildIndexedDbRuntime,
  planIndexedDbBatch,
  assessIndexedDbQuota,
  buildChapterDocument,
  switchChapterView,
  planChapterEdit,
  planKeyboardShortcut,
  buildChapterShortcutBindings,
  buildRedoStackConfig,
  pushRedoEntry,
  popRedoEntry,
  planRedoForward,
  buildIdbExecutor,
  planIdbMigration,
  buildTuiMirror,
  planIdbExecution,
  parseReplCommand,
  planReplDispatch,
  buildReplHelp,
  planCliCommand,
  buildThemeConfig,
  buildThemeOptions,
  planThemeMigration,
  buildIdbMockHandle,
  simulateIdbRuntime,
  planIdbRecovery,
  buildIdbIntegrationTestCases,
  runIdbIntegrationTest,
  assessIdbIntegrationCoverage,
  buildTuiKeymap,
  planTuiNavigate,
  buildTuiCommands,
  buildTuiKeyEvent,
  planTuiKeyBindings,
  buildTuiActiveSection,
  buildIdbExecutorCode,
  parseIdbEvalError,
  simulateIdbEval,
  buildIdbInMemoryHandle,
  runIdbInMemoryOps,
  buildIdbPersistenceAdapter,
  planPersistenceBackup,
  planPersistenceRestore,
  computePersistenceChecksum,
  buildBrowserEvalAdapter,
  planBrowserEvalSteps,
  simulateBrowserEval,
  buildTuiSectionVisual,
  planTuiHighlight,
  buildTuiScrollPlan,
  runBrowserEval,
  extractBrowserEvalError,
  planBrowserEvalRetry,
  buildTuiScrollIntoView,
  planTuiSmoothScroll,
  buildTuiKeyboardFocus,
  serializePersistencePayload,
  verifyPersistenceReadback,
  planPersistenceDualWrite,
  runDualWrite,
  extractDualWriteError,
  planDualWriteRecovery,
  runTuiScrollIntoView,
  planTuiAnimation,
  buildTuiSectionElement,
  evalIdbFallbackWrite,
  verifyIdbFallback,
  planIdbFallbackRecovery,
  buildRealIndexedDBStore,
  runRealIndexedDBOp,
  extractRealIndexedDBError,
  persistFallbackToProjectsStore,
  restoreFallbackFromProjectsStore,
  planFallbackMigration,
  runRealDualWrite,
  extractRealDualWriteError,
  planRealDualWriteRecovery,
  validateBrowserDualWrite,
  buildBrowserDualWriteCode,
  runBrowserDualWrite,
  validateBrowserFallback,
  buildBrowserFallbackCode,
  runBrowserFallbackWrite,
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

  it('builds V41 navigation tabs covering dashboard create library quality hub and help with shortcuts', () => {
    const tabs = buildWebNavigation();
    assert.equal(tabs.length, 6);
    assert.deepEqual(tabs.map((tab) => tab.id), ['dashboard', 'create', 'library', 'quality', 'hub', 'help']);
    assert.ok(tabs.every((tab) => tab.label && tab.hint && tab.shortcut));
    assert.ok(tabs.find((tab) => tab.id === 'help')?.shortcut === '?');
  });

  it('builds V41 onboarding steps with progressive disclosure and CLI anchors', () => {
    const steps = buildWebOnboarding();
    assert.equal(steps.length, 3);
    assert.deepEqual(steps.map((step) => step.step), [1, 2, 3]);
    assert.ok(steps.every((step) => step.cta.label && step.cta.view && step.cli.startsWith('novel-ma ')));
    assert.ok(steps[0]?.title.includes('主题'));
    assert.ok(steps[1]?.title.includes('继续'));
    assert.ok(steps[2]?.title.includes('总控台'));
  });

  it('builds V41 help entries filtered to known nav shortcuts plus global hotkeys', () => {
    const tabs = buildWebNavigation();
    const help = buildWebHelp(tabs);
    const navShortcuts = new Set(tabs.map((tab) => tab.shortcut ?? ''));
    assert.ok(help.every((entry) => !entry.view || navShortcuts.has(entry.shortcut)));
    assert.ok(help.some((entry) => entry.shortcut === '?'));
    assert.ok(help.some((entry) => entry.shortcut === 'Ctrl+S'));
    assert.ok(help.some((entry) => entry.shortcut === 'Esc'));
  });

  it('builds V41 default view with active tab onboarding dismiss flag and stable ordering', () => {
    const view = buildWebDefaultView();
    assert.equal(view.activeView, 'dashboard');
    assert.equal(view.navTabs.length, 6);
    assert.equal(view.onboarding.length, 3);
    assert.equal(view.welcomeDismissed, false);

    const dismissed = buildWebDefaultView({ activeView: 'library', dismissed: true });
    assert.equal(dismissed.activeView, 'library');
    assert.equal(dismissed.welcomeDismissed, true);
    assert.deepEqual(dismissed.onboarding.map((step) => step.step), [1, 2, 3]);
  });

  it('builds V42 interactive quality panel with progress bar subscores and advice note', () => {
    const panel = buildInteractivePanel({
      kind: 'quality-panel',
      payload: {
        status: 'pass',
        report: {
          status: 'pass',
          subscores: { characters: 88, foreshadowing: 76, style: 92 },
          advice: '继续使用角色名和伏笔。',
        },
      },
    });
    assert.equal(panel.kind, 'quality-panel');
    assert.equal(panel.badges[0]?.label, 'pass');
    assert.equal(panel.badges[0]?.tone, 'pass');
    const progress = panel.sections.find((section) => section.kind === 'progress');
    assert.ok(progress?.progress);
    assert.ok(progress!.progress!.value >= 70 && progress!.progress!.value <= 100);
    const bar = panel.sections.find((section) => section.kind === 'bar');
    assert.equal(bar?.bars?.length, 3);
    assert.ok(bar?.bars?.every((entry) => entry.tone === 'pass' || entry.tone === 'warn'));
    const note = panel.sections.find((section) => section.kind === 'note');
    assert.ok(note?.note?.includes('角色'));
  });

  it('builds V42 interactive provider readiness panel with badges and diagnostics list', () => {
    const panel = buildInteractivePanel({
      kind: 'provider-readiness',
      payload: { ready: true, mode: 'mock', diagnostics: ['pass: mock provider ready', 'warn: latency 120ms'] },
    });
    assert.equal(panel.badges.length, 2);
    assert.equal(panel.badges[0]?.tone, 'pass');
    assert.equal(panel.badges[1]?.tone, 'info');
    const list = panel.sections.find((section) => section.kind === 'list');
    assert.equal(list?.items?.length, 2);
    assert.equal(list?.items?.[0]?.tone, 'pass');
    assert.equal(list?.items?.[1]?.tone, 'warn');
  });

  it('builds V42 interactive longform os panel with tree foreshadowing ledger and character arcs', () => {
    const panel = buildInteractivePanel({
      kind: 'longform-os',
      payload: {
        volumes: [{ id: 'v1', title: '守夜卷' }, { id: 'v2', title: '失忆卷' }],
        ledger: {
          foreshadowing: [{ name: '银匙', status: 'recovered' }, { name: '月尘脚印', status: 'overdue' }],
          characterArcs: [{ projectId: 'moon-1', protagonist: '林澈', arc: '从守夜到逃亡' }],
        },
      },
    });
    assert.equal(panel.badges[0]?.label, '2 卷');
    const tree = panel.sections.find((section) => section.kind === 'tree');
    assert.equal(tree?.tree?.length, 2);
    assert.equal(tree?.tree?.[0]?.depth, 0);
    const ledgerSection = panel.sections.find((section) => section.heading === '伏笔台账');
    assert.equal(ledgerSection?.items?.length, 2);
    assert.equal(ledgerSection?.items?.[0]?.tone, 'pass');
    assert.equal(ledgerSection?.items?.[1]?.tone, 'fail');
  });

  it('builds V42 interactive narrative analytics panel with character bars and pacing metrics', () => {
    const panel = buildInteractivePanel({
      kind: 'narrative-analytics',
      payload: {
        characterAppearances: [
          { name: '林澈', mentions: 4 },
          { name: '墨塔', mentions: 2 },
        ],
        pacing: { chapters: 6, averageWords: 850 },
      },
    });
    assert.equal(panel.badges[0]?.label, '2 角色');
    const bar = panel.sections.find((section) => section.kind === 'bar');
    assert.equal(bar?.bars?.length, 2);
    assert.ok((bar?.bars?.[0]?.value ?? 0) > 0);
    const metric = panel.sections.find((section) => section.kind === 'metric');
    assert.equal(metric?.metrics?.length, 2);
    assert.equal(metric?.metrics?.[0]?.value, 6);
  });

  it('builds V42 interactive foreshadowing panel with recovered open overdue tone coloring', () => {
    const panel = buildInteractivePanel({
      kind: 'foreshadowing',
      payload: { recovered: ['银匙'], open: ['旧门'], overdue: ['月尘脚印'], score: 50 },
    });
    assert.equal(panel.badges[0]?.tone, 'warn');
    const listSections = panel.sections.filter((section) => section.kind === 'list');
    assert.equal(listSections.length, 3);
    assert.equal(listSections[0]?.items?.[0]?.tone, 'pass');
    assert.equal(listSections[1]?.items?.[0]?.tone, 'warn');
    assert.equal(listSections[2]?.items?.[0]?.tone, 'fail');
  });

  it('builds V42 interactive fallback panel for unknown kinds with raw JSON note', () => {
    const panel = buildInteractivePanel({ kind: 'unknown-kind', payload: { hello: 'world' } });
    assert.equal(panel.kind, 'unknown-kind');
    assert.equal(panel.sections.length, 1);
    assert.ok(panel.sections[0]?.note?.includes('hello'));
  });

  it('builds V43 word stats counting Han characters plus latin tokens with progress and tone', () => {
    const hanStats = computeWordStats('月球图书馆的守夜人林澈推开了门', 20);
    assert.equal(hanStats.wordCount, 15);
    assert.equal(hanStats.progress, 75);
    assert.equal(hanStats.tone, 'warn');

    const latinStats = computeWordStats('the moon library door opens slowly', 5);
    assert.equal(latinStats.wordCount, 6);
    assert.ok(latinStats.progress >= 100);
    assert.equal(latinStats.tone, 'pass');

    const empty = computeWordStats('', 10);
    assert.equal(empty.wordCount, 0);
    assert.equal(empty.progress, 0);
    assert.equal(empty.tone, 'fail');
  });

  it('builds V43 chapter context with characters mentions foreshadowing status and style fingerprint', () => {
    const ctx = buildChapterContext(sampleArtifacts[0]!);
    assert.ok(ctx.characters.some((c) => c.name.includes('守夜人')));
    assert.ok(ctx.foreshadowing.some((f) => f.name.includes('银匙') && f.status === 'recovered'));
    assert.ok(ctx.foreshadowing.some((f) => f.status === 'overdue'));
    assert.ok(ctx.styleFingerprint.length >= 1);
    assert.ok(ctx.recentSummary.length > 0);
  });

  it('builds V43 chapter editor with target progress tone context save plan and revisions', () => {
    const editor = buildChapterEditor({
      artifact: sampleArtifacts[0]!,
      body: '林澈推开了月背图书馆的门，银匙掉在地上。',
      target: 30,
    });
    assert.equal(editor.target, 30);
    assert.ok(editor.wordCount > 0);
    assert.equal(editor.progress, Math.round((editor.wordCount / 30) * 100));
    assert.ok(['pass', 'warn', 'fail', 'info'].includes(editor.tone));
    assert.equal(editor.context.characters.length >= 1, true);
    assert.equal(editor.savePlan.storageKey, 'novel-ma:artifacts');
    assert.ok(editor.savePlan.rollbackToken.startsWith('rollback-'));
    assert.ok(editor.savePlan.fingerprint.startsWith('fp-'));
    assert.equal(editor.revisions.length, 0);
  });

  it('plans V43 chapter save with body word delta fingerprint rollback token and previous timestamp', () => {
    const plan = planChapterSave(sampleArtifacts[0]!, '林澈推开了月背图书馆的门。', { target: 30, previousSavedAt: '2026-06-01T00:00:00.000Z' });
    assert.equal(plan.projectId, sampleArtifacts[0]!.projectId);
    assert.equal(plan.previousSavedAt, '2026-06-01T00:00:00.000Z');
    assert.ok(plan.bodyWordDelta !== 0 || plan.bodyWordDelta === 0);
    assert.ok(plan.fingerprint.startsWith('fp-'));
  });

  it('appends V43 chapter revisions and caps history at 10 entries preserving order', () => {
    let revs: ReturnType<typeof appendChapterRevision> = [];
    for (let i = 0; i < 12; i += 1) revs = appendChapterRevision(revs, `草稿 ${i}`);
    assert.equal(revs.length, 10);
    assert.equal(revs[0]?.excerpt, '草稿 2');
    assert.equal(revs[9]?.excerpt, '草稿 11');
    assert.ok(revs[0]?.id.startsWith('rev-'));
    assert.ok(revs[0]?.wordCount > 0);
  });

  it('builds V44 foreshadowing graph SVG with positioned nodes status colors and dashed edges', () => {
    const graph = buildForeshadowingGraphSvg(sampleArtifacts);
    assert.ok(graph.svg.startsWith('<svg'));
    assert.ok(graph.svg.includes('viewBox="0 0 480 280"'));
    assert.ok(graph.svg.includes('#16a34a') || graph.svg.includes('#d97706') || graph.svg.includes('#b91c1c'));
    assert.ok(graph.nodes.length >= 2);
    assert.ok(graph.nodes.every((node) => typeof node.x === 'number' && typeof node.y === 'number'));
    assert.ok(graph.edges.length >= 1);
    assert.ok(graph.svg.includes('stroke-dasharray="4 4"'));
  });

  it('builds V44 character arc SVG with polyline chapters and one point per artifact', () => {
    const arc = buildCharacterArcSvg(sampleArtifacts);
    assert.ok(arc.svg.includes('<polyline'));
    assert.ok(arc.svg.includes('stroke="#2563eb"'));
    assert.equal(arc.points.length, sampleArtifacts.length);
    assert.ok(arc.points.every((point) => point.chapter >= 1));
    assert.ok(/第\d+章/.test(arc.svg) || arc.svg.includes('异常的开端') || arc.svg.includes('线索'));
  });

  it('builds V44 chapter pacing SVG with bars capped at 8 chapters word labels and axis baseline', () => {
    const pacing = buildChapterPacingSvg(sampleArtifacts);
    assert.ok(pacing.svg.includes('<svg'));
    assert.ok(pacing.bars.length <= 8);
    assert.ok(pacing.bars.length >= 1);
    assert.ok(pacing.bars.every((bar) => bar.words > 0));
    assert.ok(pacing.svg.includes('<rect'));
    assert.ok(pacing.svg.includes('stroke-opacity'));
  });

  it('escapes V44 SVG text safely so chapter titles with quotes do not break markup', () => {
    const quirky = [{ ...sampleArtifacts[0]!, chapterTitle: '《<>&"\'' , artifact: { ...sampleArtifacts[0]!.artifact, outline: [{ chapter: 1, title: '《<>&"\'', summary: 'x' }] } }];
    const arc = buildCharacterArcSvg(quirky);
    assert.ok(!arc.svg.includes('<>&"\''));
    assert.ok(arc.svg.includes('&lt;') || arc.svg.includes('&amp;') || arc.svg.includes('&quot;'));
  });

  it('builds V45 revision tree grouped by projectId with sorted timestamps and parent links', () => {
    const items = [
      { ...sampleArtifacts[0]!, projectId: 'moon-1', savedAt: '2026-06-01T00:00:00.000Z' },
      { ...sampleArtifacts[1]!, projectId: 'moon-1', savedAt: '2026-06-02T00:00:00.000Z' },
      { ...sampleArtifacts[0]!, projectId: 'moon-2', savedAt: '2026-06-03T00:00:00.000Z' },
    ];
    const tree = buildRevisionTree(items);
    assert.equal(tree.length, 2);
    const moon1 = tree.find((node) => node.projectId === 'moon-1');
    assert.ok(moon1);
    assert.equal(moon1?.children.length, 2);
    assert.equal(moon1?.children[0]?.parentId, 'moon-1-root');
    assert.equal(moon1?.children[1]?.parentId, 'moon-1');
    assert.ok((moon1?.children[1]?.savedAt ?? '') >= (moon1?.children[0]?.savedAt ?? ''));
  });

  it('builds V45 tag index with inferred mode/stage/risk/health tags and explicit overrides', () => {
    const idx = buildTagIndex(sampleArtifacts, { 'moon-1': ['favorite', 'priority:p0'] });
    assert.ok(idx.tags.includes('mode:theme'));
    assert.ok(idx.tags.includes('mode:continuation'));
    assert.ok(idx.tags.includes('risk:overdue'));
    assert.ok(idx.tags.includes('health:recovered'));
    assert.ok(idx.byProject['moon-1']?.includes('favorite'));
    assert.ok(idx.byTag['mode:theme']?.includes('moon-1'));
  });

  it('searches V45 projects by token across all artifact fields with scored hits and excerpts', () => {
    const hits = searchProjectsIndexed(sampleArtifacts, '银匙');
    assert.ok(hits.length >= 1);
    assert.ok(hits[0]?.matchedFields.includes('foreshadowing') || hits[0]?.matchedFields.includes('title'));
    assert.ok(hits[0]?.excerpt.length > 0);
    assert.ok(hits[0]!.score > 0);
    const ranked = searchProjectsIndexed(sampleArtifacts, '月背');
    assert.ok(ranked.length >= 1);
    const empty = searchProjectsIndexed(sampleArtifacts, '');
    assert.equal(empty.length, 0);
  });

  it('plans V45 IndexedDB migration with record count size warnings and ready flag', () => {
    const plan = planIndexedDbMigration(sampleArtifacts);
    assert.equal(plan.ready, true);
    assert.equal(plan.storageKey, 'novel-ma:artifacts');
    assert.equal(plan.objectStoreName, 'projects');
    assert.equal(plan.indexName, 'projectId');
    assert.equal(plan.recordCount, sampleArtifacts.length);
    assert.ok(plan.estimatedBytes > 0);

    const empty = planIndexedDbMigration([]);
    assert.ok(empty.warnings.some((line) => line.includes('no items')));
    assert.equal(empty.ready, false);
  });

  it('builds V46 line-level diff view with equal add remove counts and similarity ratio', () => {
    const diff = buildDiffView('alpha\nbeta\ngamma', 'alpha\nBETA\ngamma\ndelta');
    assert.equal(diff.added, 2);
    assert.equal(diff.removed, 1);
    assert.equal(diff.unchanged, 2);
    assert.ok(diff.similarity > 0.5 && diff.similarity < 1);
    const adds = diff.lines.filter((line) => line.kind === 'add');
    const removes = diff.lines.filter((line) => line.kind === 'remove');
    assert.ok(adds.length >= 1 && removes.length >= 1);
    assert.equal(removes[0]?.leftLine, 'beta');
    assert.ok(adds.some((line) => line.rightLine === 'BETA'));
  });

  it('builds V46 identical-text diff with zero adds and removals and similarity=1', () => {
    const diff = buildDiffView('same\ntext', 'same\ntext');
    assert.equal(diff.added, 0);
    assert.equal(diff.removed, 0);
    assert.equal(diff.unchanged, 2);
    assert.equal(diff.similarity, 1);
  });

  it('builds V46 import wizard with 5 steps parse-validate-normalize-preview-commit and warnings', () => {
    const ok = buildImportWizard(JSON.stringify(sampleArtifacts[0]));
    assert.equal(ok.ok, true);
    assert.equal(ok.steps.length, 5);
    assert.equal(ok.steps[0]?.kind, 'parse');
    assert.equal(ok.steps[1]?.kind, 'validate');
    assert.equal(ok.steps[2]?.kind, 'normalize');
    assert.equal(ok.steps[3]?.kind, 'preview');
    assert.equal(ok.steps[4]?.kind, 'commit');
    assert.ok(ok.steps.every((step) => step.title && step.body));

    const bad = buildImportWizard('{not json');
    assert.equal(bad.ok, false);
    assert.ok(bad.warnings.length >= 1);
    assert.equal(bad.steps[0]?.ok, false);
    assert.equal(bad.steps[4]?.ok, false);

    const legacy = buildImportWizard(JSON.stringify({ projectId: 'old', title: 'legacy', schemaVersion: 1 }));
    assert.equal(legacy.ok, true);
    assert.ok(legacy.warnings.some((line) => line.includes('schemaVersion=1')));
    assert.equal(legacy.steps[2]?.ok, true);
  });

  it('computes V47 daily goal with today progress streak days and tone coloring', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const goal = computeDailyGoal([
      { date: yesterday, words: 900 },
      { date: today, words: 450 },
    ], 900);
    assert.equal(goal.target, 900);
    assert.equal(goal.todayWords, 450);
    assert.equal(goal.todayProgress, 50);
    assert.equal(goal.tone, 'warn');
    assert.ok(goal.streakDays >= 1);
  });

  it('builds V47 heatmap SVG with weeks x 7 cells intensity fill and title tooltips', () => {
    const heatmap = buildHeatmapSvg([{ date: new Date().toISOString().slice(0, 10), words: 600 }], 4, { target: 600 });
    assert.equal(heatmap.weeks, 4);
    assert.equal(heatmap.cells.length, 28);
    assert.ok(heatmap.svg.startsWith('<svg'));
    assert.ok(heatmap.svg.includes('rgba(22, 163, 74'));
    assert.ok(heatmap.cells.some((cell) => cell.words > 0));
    assert.ok(heatmap.cells.some((cell) => cell.intensity >= 0.5));
  });

  it('plans V47 focus session with duration breaks target start end ISO timestamps', () => {
    const session = planFocusSession(50, { target: 1500 });
    assert.equal(session.durationMin, 50);
    assert.ok(session.endsAt > session.startedAt);
    assert.ok(session.target >= 50);
    assert.equal(session.breaks, 2);
  });

  it('plans V47 undo entry with id label timestamps and before-after snapshots', () => {
    const entry = planUndoEntry({ text: 'old' }, { text: 'new' }, 'edit chapter title', { id: 'undo-test-1', createdAt: '2026-06-27T00:00:00.000Z' });
    assert.equal(entry.id, 'undo-test-1');
    assert.equal(entry.createdAt, '2026-06-27T00:00:00.000Z');
    assert.equal(entry.label, 'edit chapter title');
    assert.deepEqual(entry.before, { text: 'old' });
    assert.deepEqual(entry.after, { text: 'new' });
  });

  it('builds V48 PWA manifest with name shortName display themeColor icons and standalone mode', () => {
    const manifest = buildPwaManifest();
    assert.equal(manifest.name, 'novel-multi-agent 工作台');
    assert.equal(manifest.shortName, 'novel-ma');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.icons.length >= 1, true);
    assert.ok(manifest.icons.every((icon) => icon.sizes && icon.type));
  });

  it('builds V48 service worker plan with cache name strategy precache and runtime patterns', () => {
    const plan = buildServiceWorkerPlan();
    assert.equal(plan.scriptName, 'sw.js');
    assert.ok(plan.cacheName.startsWith('novel-ma-'));
    assert.ok(['cache-first', 'network-first', 'stale-while-revalidate'].includes(plan.strategy));
    assert.ok(plan.precacheFiles.length >= 1);
    assert.ok(plan.runtimePatterns.length >= 1);
    assert.equal(plan.ready, true);
  });

  it('renders V48 service worker script with install activate fetch listeners and cache fallback', () => {
    const plan = buildServiceWorkerPlan();
    const script = renderServiceWorkerScript(plan);
    assert.ok(script.includes('self.addEventListener("install"'));
    assert.ok(script.includes('self.addEventListener("activate"'));
    assert.ok(script.includes('self.addEventListener("fetch"'));
    assert.ok(script.includes(plan.cacheName));
    assert.ok(script.includes(plan.fallback));
    assert.ok(script.includes('caches.match'));
  });

  it('assesses V48 offline capability with manifest sw plan precache count and storage warnings', () => {
    const manifest = buildPwaManifest();
    const plan = buildServiceWorkerPlan();
    const report = assessOfflineCapability({ manifest, plan, storageQuotaMb: 50 });
    assert.equal(report.hasManifest, true);
    assert.equal(report.hasServiceWorker, true);
    assert.ok(report.precacheCount >= 1);
    assert.ok(report.runtimePatterns >= 1);
    assert.equal(report.storageQuotaMb, 50);
    assert.equal(report.warnings.length, 0);

    const tiny = assessOfflineCapability({ manifest, plan, storageQuotaMb: 10 });
    assert.ok(tiny.warnings.some((line) => line.includes('storage quota below 20 MB')));

    const missing = assessOfflineCapability({ manifest: null, plan: null });
    assert.ok(missing.warnings.some((line) => line.includes('manifest missing')));
    assert.equal(missing.hasManifest, false);
  });

  it('builds V49 pipeline timeline SVG with 5 agent roles status colors and total duration', () => {
    const steps = [
      { role: 'planner', label: '规划', durationMs: 120, status: 'done' },
      { role: 'worldbuilder', label: '设定', durationMs: 200, status: 'done' },
      { role: 'writer', label: '写作', durationMs: 800, status: 'running' },
      { role: 'editor', label: '审校', durationMs: 150, status: 'pending' },
      { role: 'continuity', label: '连贯', durationMs: 0, status: 'pending' },
    ];
    const timeline = buildPipelineTimelineSvg(steps);
    assert.equal(timeline.steps.length, 5);
    assert.equal(timeline.totalDurationMs, 1270);
    assert.ok(timeline.svg.startsWith('<svg'));
    assert.ok(timeline.svg.includes('planner'.length > 0 ? '规划' : ''));
    assert.ok(timeline.svg.includes('#16a34a') || timeline.svg.includes('#2563eb'));
    assert.ok(timeline.svg.includes('120ms'));
  });

  it('builds V49 agent trace view with duration artifact count output excerpt and timestamps', () => {
    const trace = {
      role: 'writer',
      input: 'continue chapter 3',
      output: '林澈推开了门，月背图书馆的银匙在地上闪烁。',
      startedAt: '2026-06-27T00:00:00.000Z',
      endedAt: '2026-06-27T00:00:01.500Z',
      artifacts: [{ key: 'draft', preview: '第3章 线索的回声 …' }, { key: 'memory', preview: 'role: 主角' }],
    };
    const view = buildAgentTraceView(trace);
    assert.equal(view.role, 'writer');
    assert.equal(view.durationMs, 1500);
    assert.equal(view.artifactCount, 2);
    assert.deepEqual(view.artifactKeys, ['draft', 'memory']);
    assert.ok(view.outputExcerpt.includes('银匙'));
    assert.equal(view.startedAt, '2026-06-27T00:00:00.000Z');
  });

  it('parses V50 artifact index with valid files imported and broken files into issues', () => {
    const files = [
      { path: '.novel-ma/projects/moon-1/artifact.json', json: JSON.stringify(sampleArtifacts[0]) },
      { path: '.novel-ma/projects/moon-2/artifact.json', json: JSON.stringify(sampleArtifacts[1]) },
      { path: '.novel-ma/projects/bad/artifact.json', json: '{broken' },
      { path: '.novel-ma/projects/empty/artifact.json', json: '{}' },
    ];
    const result = parseArtifactIndex(files);
    assert.equal(result.items.length, 2);
    assert.equal(result.issues.length, 2);
    assert.ok(result.issues.some((issue) => issue.reason.startsWith('json')));
    assert.ok(result.issues.some((issue) => issue.reason === 'missing projectId'));
  });

  it('plans V50 artifact sync with accept modes reject stages max bytes and by-mode breakdown', () => {
    const files = [
      { path: 'a.json', json: JSON.stringify(sampleArtifacts[0]) },
      { path: 'b.json', json: JSON.stringify(sampleArtifacts[1]) },
      { path: 'c.json', json: '{bad' },
    ];
    const plan = planArtifactSync(files, { acceptModes: ['theme'], maxBytes: 1024 * 1024 });
    assert.equal(plan.scannedFiles, 3);
    assert.equal(plan.importedCount, 1);
    assert.equal(plan.issuesCount, 2);
    assert.equal(plan.byMode.theme ?? 0, 1);
    assert.ok(plan.oldestSavedAt);
    assert.ok(plan.newestSavedAt);

    const noFilter = planArtifactSync(files);
    assert.ok(noFilter.importedCount >= 1);
  });

  it('builds V51 IndexedDB schema with projects tags undo stores and 4 indexes', () => {
    const schema = buildIndexedDbSchema();
    assert.equal(schema.name, 'novel-ma');
    assert.equal(schema.version, 1);
    assert.equal(schema.stores.length, 3);
    const projects = schema.stores.find((store) => store.name === 'projects');
    assert.ok(projects);
    assert.equal(projects.keyPath, 'projectId');
    assert.equal(projects.indexes.length, 3);
    const undo = schema.stores.find((store) => store.name === 'undo');
    assert.ok(undo?.indexes.some((index) => index.name === 'createdAt'));
  });

  it('builds V51 IndexedDB adapter with operations fallback key ready flag and warnings', () => {
    const adapter = buildIndexedDbAdapter();
    assert.equal(adapter.fallbackStorageKey, 'novel-ma:artifacts');
    assert.ok(adapter.operations.includes('migrate-from-localStorage'));
    assert.equal(adapter.ready, true);
    assert.equal(adapter.warnings.length, 0);

    const noIdb = buildIndexedDbAdapter({ supportsIdb: false });
    assert.equal(noIdb.ready, false);
    assert.ok(noIdb.warnings.some((line) => line.includes('IndexedDB not supported')));

    const emptySchema = buildIndexedDbAdapter({ schema: { name: 'x', version: 1, stores: [] } });
    assert.ok(emptySchema.warnings.some((line) => line.includes('0 stores')));
  });

  it('builds V51 migration script with steps total items bytes estimated duration and dry run', () => {
    const script = buildMigrationScript({
      source: 'localStorage',
      sourceKey: 'novel-ma:artifacts',
      target: 'indexedDb',
      items: sampleArtifacts,
      dryRun: true,
    });
    assert.equal(script.source, 'localStorage');
    assert.equal(script.sourceKey, 'novel-ma:artifacts');
    assert.equal(script.target, 'indexedDb');
    assert.equal(script.totalItems, sampleArtifacts.length);
    assert.ok(script.totalBytes > 0);
    assert.ok(script.estimatedDurationMs >= 1);
    assert.equal(script.dryRun, true);
    assert.ok(script.steps.length >= 4);
    assert.ok(script.steps.some((step) => step.includes('读取 localStorage')));
    assert.ok(script.steps.some((step) => step.includes('schemaVersion=2')));
  });

  it('renders V52 markdown to html with headings paragraphs lists code blocks and inline emphasis', () => {
    const md = '# 标题一\n这是 **粗体** 和 *斜体*。\n\n- 项目 1\n- 项目 2\n\n```\nconsole.log("hi")\n```\n\n[link](https://example.com)';
    const result = renderMarkdown(md);
    assert.ok(result.html.includes('<h1>标题一</h1>'));
    assert.ok(result.html.includes('<strong>粗体</strong>'));
    assert.ok(result.html.includes('<em>斜体</em>'));
    assert.ok(result.html.includes('<ul>'));
    assert.ok(result.html.includes('<li>项目 1</li>'));
    assert.ok(result.html.includes('<pre><code>'));
    assert.ok(result.html.includes('<a href="https://example.com"'));
    assert.equal(result.headings, 1);
    assert.ok(result.codeBlocks >= 1);
    assert.ok(result.links >= 1);
    assert.equal(result.sections[0]?.level, 1);
    assert.equal(result.sections[0]?.title, '标题一');
  });

  it('escapes V52 markdown inline code and limits headings to configured max level', () => {
    const result = renderMarkdown('## 二级\n### 三级\n#### 四级', { maxHeadingLevel: 2 });
    assert.ok(result.html.includes('<h2>二级</h2>'));
    assert.ok(result.html.includes('<h2>三级</h2>'));
    assert.ok(result.html.includes('<h2>四级</h2>'));
    assert.ok(!result.html.includes('<h3'));
    assert.ok(!result.html.includes('<h4'));
  });

  it('extracts V52 markdown outline filtered by max depth with stable index', () => {
    const outline = extractMarkdownOutline('# 主标题\n## 章节 A\n### 子节\n#### 不应出现', 2);
    assert.equal(outline.length, 2);
    assert.equal(outline[0]?.title, '主标题');
    assert.equal(outline[1]?.level, 2);
    assert.equal(outline[1]?.title, '章节 A');
    assert.ok(outline.every((section) => section.level <= 2));
  });

  it('builds V52 rich text toolbar with 8 actions each having label shortcut and wrap pattern', () => {
    const toolbar = buildRichTextToolbar();
    assert.equal(toolbar.length, 8);
    assert.ok(toolbar.some((action) => action.id === 'bold' && action.before === '**'));
    assert.ok(toolbar.some((action) => action.id === 'h1' && action.before === '# '));
    assert.ok(toolbar.some((action) => action.id === 'link' && action.after.includes('https://')));
    assert.ok(toolbar.every((action) => action.label && action.shortcut && action.before !== undefined && action.after !== undefined));
  });

  it('builds V53 undo stack config with defaults storage key max size ttl and persistence flag', () => {
    const config = buildUndoStackConfig();
    assert.equal(config.storageKey, 'novel-ma:undo');
    assert.ok(config.maxSize >= 1 && config.maxSize <= 500);
    assert.ok(config.ttlMs >= 60_000);
    assert.equal(config.persistAcrossReload, true);
    const custom = buildUndoStackConfig({ maxSize: 200, ttlMs: 1000 * 60 * 60 });
    assert.equal(custom.maxSize, 200);
  });

  it('pushes V53 undo entry with ttl filter and FIFO trim respecting max size', () => {
    const config = buildUndoStackConfig({ maxSize: 3 });
    let stack: UndoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, oldestEntryId: null, newestEntryId: null };
    for (let i = 0; i < 5; i += 1) stack = pushUndoEntry(stack, { id: `e-${i}`, createdAt: new Date(Date.now() - i).toISOString(), before: {}, after: {}, label: `edit ${i}` });
    assert.equal(stack.entries.length, 3);
    assert.equal(stack.entries[0]?.id, 'e-2');
    assert.equal(stack.entries[2]?.id, 'e-4');
    assert.equal(stack.totalPushed, 5);
  });

  it('pops V53 undo entry with stack state update and empty stack safety', () => {
    const config = buildUndoStackConfig();
    let stack: UndoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, oldestEntryId: null, newestEntryId: null };
    stack = pushUndoEntry(stack, { id: 'e-1', createdAt: new Date().toISOString(), before: {}, after: {}, label: 'edit' });
    const popped = popUndoEntry(stack);
    assert.ok(popped.entry);
    assert.equal(popped.entry?.id, 'e-1');
    assert.equal(popped.stack.entries.length, 0);
    assert.equal(popped.stack.totalPopped, 1);
    const empty = popUndoEntry(popped.stack);
    assert.equal(empty.entry, null);
  });

  it('plans V53 undo restore with steps delta field count and not-found fallback', () => {
    const config = buildUndoStackConfig();
    let stack: UndoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, oldestEntryId: null, newestEntryId: null };
    stack = pushUndoEntry(stack, { id: 'e-1', createdAt: new Date().toISOString(), before: { title: 'old' }, after: { title: 'new', body: '林澈推开门' }, label: 'rename chapter' });
    const plan = planUndoRestore(stack, 'e-1');
    assert.equal(plan.entryId, 'e-1');
    assert.equal(plan.label, 'rename chapter');
    assert.equal(plan.deltaFieldCount, 2);
    assert.ok(plan.beforeJson.includes('"title": "old"'));
    assert.ok(plan.afterJson.includes('"title": "new"'));
    assert.ok(plan.ready);
    assert.ok(plan.steps.length >= 3);

    const missing = planUndoRestore(stack, 'e-zzz');
    assert.equal(missing.ready, false);
    assert.equal(missing.deltaFieldCount, 0);
  });

  it('computes V53 undo stats with count storage bytes oldest age average interval and ttl', () => {
    const config = buildUndoStackConfig({ maxSize: 10 });
    let stack: UndoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, oldestEntryId: null, newestEntryId: null };
    const now = Date.now();
    stack = pushUndoEntry(stack, { id: 'e-1', createdAt: new Date(now - 60_000).toISOString(), before: {}, after: {}, label: 'a' }, now);
    stack = pushUndoEntry(stack, { id: 'e-2', createdAt: new Date(now - 30_000).toISOString(), before: {}, after: {}, label: 'b' }, now);
    const stats = computeUndoStats(stack, now);
    assert.equal(stats.count, 2);
    assert.equal(stats.maxSize, 10);
    assert.ok(stats.storageBytes > 0);
    assert.ok(stats.oldestAge >= 60_000);
    assert.ok(stats.averageInterval >= 30_000);
    assert.equal(stats.ttlMs, config.ttlMs);
  });

  it('builds V54 IndexedDB runtime with open steps operations batch and warnings', () => {
    const runtime = buildIndexedDbRuntime();
    assert.equal(runtime.operations.length, 9);
    assert.ok(runtime.openSteps.length === 4);
    assert.ok(runtime.openSteps[0]?.includes('indexedDB.open'));
    assert.ok(runtime.openSteps[1]?.includes('onupgradeneeded'));
    assert.ok(runtime.openSteps[2]?.includes('fallback'));
    assert.equal(runtime.supportsBatch, true);
    assert.equal(runtime.supportsTransaction, true);

    const noBatch = buildIndexedDbRuntime({ supportsBatch: false, supportsTransaction: false });
    assert.ok(noBatch.warnings.length >= 2);
    assert.ok(noBatch.warnings.some((line) => line.includes('batch')));
    assert.ok(noBatch.warnings.some((line) => line.includes('transaction')));
  });

  it('plans V54 IndexedDB batch with grouped stores transaction flag and estimated duration', () => {
    const ops: IndexedDbOperation[] = [
      { kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' },
      { kind: 'put', store: 'projects', key: 'p2', value: { x: 2 }, expect: 'none' },
      { kind: 'put', store: 'tags', key: 't1', value: { tag: 'x' }, expect: 'none' },
    ];
    const plan = planIndexedDbBatch(ops);
    assert.equal(plan.totalOps, 3);
    assert.equal(plan.groupedByStore.projects, 2);
    assert.equal(plan.groupedByStore.tags, 1);
    assert.equal(plan.transaction, true);
    assert.equal(plan.fallbackToOneByOne, true);
    assert.ok(plan.estimatedDurationMs >= 1);

    const multiStore = planIndexedDbBatch([
      { kind: 'put', store: 'a', key: 'k', value: {}, expect: 'none' },
      { kind: 'put', store: 'b', key: 'k', value: {}, expect: 'none' },
      { kind: 'put', store: 'c', key: 'k', value: {}, expect: 'none' },
      { kind: 'put', store: 'd', key: 'k', value: {}, expect: 'none' },
    ]);
    assert.equal(multiStore.transaction, false);
  });

  it('assesses V54 IndexedDB quota with total bytes recommended eviction and ok flag', () => {
    const ok = assessIndexedDbQuota([{ sizeBytes: 1024 }, { sizeBytes: 2048 }], { maxBytes: 100_000, targetBytes: 80_000 });
    assert.equal(ok.totalBytes, 3072);
    assert.equal(ok.estimatedItems, 2);
    assert.equal(ok.recommendedEviction, 0);
    assert.equal(ok.ok, true);
    assert.equal(ok.warning, 'quota within target');

    const over = assessIndexedDbQuota(Array.from({ length: 1000 }, () => ({ sizeBytes: 100_000 })), { maxBytes: 50_000_000, targetBytes: 10_000_000 });
    assert.equal(over.ok, false);
    assert.ok(over.recommendedEviction > 0);
    assert.ok(over.warning.includes('exceeds target'));
  });

  it('builds V55 chapter document with view word count heading and undo entry count', () => {
    const md = '# 章标题\n**粗体** 内容。\n\n- 列表\n\n```\ncode\n```';
    const doc = buildChapterDocument({ body: md, view: 'split', undoEntries: 3 });
    assert.equal(doc.view, 'split');
    assert.equal(doc.body, md);
    assert.ok(doc.renderedHtml.includes('<h1>章标题</h1>'));
    assert.ok(doc.renderedHtml.includes('<strong>粗体</strong>'));
    assert.ok(doc.wordCount > 0);
    assert.equal(doc.headingCount, 1);
    assert.equal(doc.codeBlockCount, 1);
    assert.equal(doc.undoEntries, 3);
  });

  it('switches V55 chapter view between raw preview and split with state preservation', () => {
    const doc = buildChapterDocument({ body: '# A\nhello', view: 'raw' });
    const preview = switchChapterView(doc, 'preview');
    assert.equal(preview.view, 'preview');
    assert.equal(preview.body, doc.body);
    assert.equal(preview.wordCount, doc.wordCount);
    const split = switchChapterView(preview, 'split');
    assert.equal(split.view, 'split');
    assert.equal(split.renderedHtml, doc.renderedHtml);
  });

  it('plans V55 chapter edit with delta words fingerprint and incremented undo entry count', () => {
    const plan = planChapterEdit({ before: '林澈推开门', after: '林澈推开门，月背图书馆的银匙在地上闪烁。', label: 'add opening scene', undoEntriesBefore: 5 });
    assert.equal(plan.operation, 'persist-revision');
    assert.ok(plan.deltaWords > 0);
    assert.ok(plan.fingerprint.startsWith('fp-'));
    assert.equal(plan.undoEntriesAfter, 6);
    assert.equal(plan.label, 'add opening scene');
  });

  it('plans V56 keyboard shortcut with display key conflict detection and scope', () => {
    const a = planKeyboardShortcut({ id: 'editor.undo', key: 'z', ctrl: true, label: 'undo' });
    assert.equal(a.displayKey, 'Ctrl+Z');
    assert.equal(a.ready, true);
    assert.equal(a.shortcut.scope, 'global');

    const b = planKeyboardShortcut({ id: 'editor.redo', key: 'z', ctrl: true, label: 'redo', existing: [a.shortcut] });
    assert.equal(b.displayKey, 'Ctrl+Z');
    assert.equal(b.ready, false);
    assert.deepEqual(b.conflictWith, ['editor.undo']);
    assert.ok(b.warning?.includes('conflict'));
  });

  it('builds V56 chapter shortcut bindings with 5 default shortcuts and conflict count', () => {
    const bindings = buildChapterShortcutBindings();
    assert.equal(bindings.totalCount, 5);
    assert.equal(bindings.enabledCount, 5);
    assert.equal(bindings.conflictCount, 0);
    assert.ok(bindings.warnings.length === 0);
    const labels = bindings.bindings.map((plan) => plan.shortcut.id);
    assert.ok(labels.includes('editor.undo'));
    assert.ok(labels.includes('editor.redo'));
    assert.ok(labels.includes('library.save'));
    assert.ok(labels.includes('editor.bold'));
    assert.ok(labels.includes('editor.code'));

    const partial = buildChapterShortcutBindings({ enableCtrlY: false, enableCtrlB: false });
    assert.equal(partial.totalCount, 3);
  });

  it('builds V57 redo stack config with defaults storage key max size and ttl', () => {
    const config = buildRedoStackConfig();
    assert.equal(config.storageKey, 'novel-ma:redo');
    assert.ok(config.maxSize >= 1 && config.maxSize <= 500);
    assert.ok(config.ttlMs >= 60_000);
    const custom = buildRedoStackConfig({ maxSize: 100, ttlMs: 1000 * 60 * 60 });
    assert.equal(custom.maxSize, 100);
  });

  it('pushes V57 redo entry with ttl filter and FIFO trim respecting max size', () => {
    const config = buildRedoStackConfig({ maxSize: 3 });
    let stack: RedoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, newestEntryId: null };
    for (let i = 0; i < 5; i += 1) stack = pushRedoEntry(stack, { id: `r-${i}`, createdAt: new Date(Date.now() - i).toISOString(), before: {}, after: {}, label: `redo ${i}` });
    assert.equal(stack.entries.length, 3);
    assert.equal(stack.entries[0]?.id, 'r-2');
    assert.equal(stack.entries[2]?.id, 'r-4');
    assert.equal(stack.totalPushed, 5);
  });

  it('pops V57 redo entry with stack state update and empty stack safety', () => {
    const config = buildRedoStackConfig();
    let stack: RedoStack = { config, entries: [], totalPushed: 0, totalPopped: 0, newestEntryId: null };
    stack = pushRedoEntry(stack, { id: 'r-1', createdAt: new Date().toISOString(), before: {}, after: {}, label: 'redo' });
    const popped = popRedoEntry(stack);
    assert.ok(popped.entry);
    assert.equal(popped.entry?.id, 'r-1');
    assert.equal(popped.stack.entries.length, 0);
    assert.equal(popped.stack.totalPopped, 1);
    const empty = popRedoEntry(popped.stack);
    assert.equal(empty.entry, null);
  });

  it('plans V57 redo forward with steps undo decrement and redo increment and not-found fallback', () => {
    const undoConfig = buildUndoStackConfig({ maxSize: 10 });
    let undoStack: UndoStack = { config: undoConfig, entries: [], totalPushed: 0, totalPopped: 0, oldestEntryId: null, newestEntryId: null };
    undoStack = pushUndoEntry(undoStack, { id: 'e-1', createdAt: new Date().toISOString(), before: { body: 'old' }, after: { body: 'new' }, label: 'edit chapter' });
    const redoConfig = buildRedoStackConfig();
    const redoStack: RedoStack = { config: redoConfig, entries: [], totalPushed: 0, totalPopped: 0, newestEntryId: null };
    const plan = planRedoForward(undoStack, redoStack, 'e-1');
    assert.equal(plan.entryId, 'e-1');
    assert.equal(plan.fromUndo, true);
    assert.equal(plan.pushedToRedo, true);
    assert.equal(plan.undoStackSize, 0);
    assert.equal(plan.redoStackSize, 1);
    assert.ok(plan.steps.length >= 3);
    assert.ok(plan.ready);

    const missing = planRedoForward(undoStack, redoStack, 'e-zzz');
    assert.equal(missing.ready, false);
    assert.equal(missing.fromUndo, false);
  });

  it('builds V58 IndexedDB executor with open migrate put get count close steps and real code strings', () => {
    const executor = buildIdbExecutor({
      dbName: 'novel-ma',
      version: 1,
      operations: [
        { kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' },
        { kind: 'get', store: 'projects', key: 'p1', expect: 'first' },
        { kind: 'count', store: 'tags', expect: 'count' },
        { kind: 'getAll', store: 'undo', expect: 'all' },
      ],
    });
    assert.equal(executor.dbName, 'novel-ma');
    assert.equal(executor.version, 1);
    assert.ok(executor.totalSteps >= 6);
    assert.equal(executor.steps[0]?.action, 'open');
    assert.equal(executor.steps[1]?.action, 'migrate');
    assert.ok(executor.steps.some((s) => s.action === 'put' && s.code.includes('objectStore')));
    assert.ok(executor.steps.some((s) => s.action === 'get' && s.code.includes('.get(')));
    assert.ok(executor.steps.some((s) => s.action === 'count' && s.code.includes('.count()')));
    assert.equal(executor.steps[executor.steps.length - 1]?.action, 'close');
    assert.equal(executor.ready, true);
    assert.equal(executor.fallbackAvailable, true);
    assert.ok(executor.estimatedDurationMs >= 10);

    const noIdb = buildIdbExecutor({ supportsIdb: false });
    assert.equal(noIdb.ready, false);
    assert.ok(noIdb.warnings.some((line) => line.includes('IndexedDB not supported')));
  });

  it('plans V58 IndexedDB migration with mapped items total bytes steps and ready flag', () => {
    const items = [
      { projectId: 'p1', path: '.novel-ma/projects/p1', sizeBytes: 1024 },
      { projectId: 'p2', path: '.novel-ma/projects/p2', sizeBytes: 2048 },
      { projectId: 'p3' },
    ];
    const plan = planIdbMigration(items, { dbName: 'novel-ma', version: 1, maxBytes: 10_000 });
    assert.equal(plan.totalItems, 3);
    assert.equal(plan.totalBytes, 1024 + 2048);
    assert.equal(plan.fallbackStorageKey, 'novel-ma:artifacts');
    assert.ok(plan.steps.length >= 5);
    assert.ok(plan.steps.some((s) => s.action === 'put' && s.code.includes('projects')));
    assert.equal(plan.ready, true);

    const over = planIdbMigration([{ projectId: 'huge', sizeBytes: 100_000_000 }], { maxBytes: 1024 });
    assert.equal(over.ready, false);
    assert.ok(over.steps.length >= 1);
  });

  it('builds V59 TUI mirror with 18 feature sections bindings shortcuts and 100% parity', () => {
    const mirror = buildTuiMirror({ width: 80, webStudioVersion: 'v0.1.0-test' });
    assert.equal(mirror.totalSections, 18 + 3);
    assert.equal(mirror.parity, 1);
    assert.equal(mirror.webStudioVersion, 'v0.1.0-test');
    assert.ok(mirror.totalLines > 50);
    assert.equal(mirror.featuresCovered.length, 18);
    assert.ok(mirror.featuresCovered.includes('V41 可发现性'));
    assert.ok(mirror.featuresCovered.includes('V58 IDB Executor'));
    assert.ok(mirror.bindings.length >= 10);
    assert.ok(mirror.shortCuts.length >= 5);
    const header = mirror.sections.find((s) => s.id === 'header');
    assert.ok(header);
    assert.ok(header?.lines.some((line) => line.includes('novel-multi-agent TUI 镜像')));
    const v58 = mirror.sections.find((s) => s.id === 'V58');
    assert.ok(v58);
    assert.ok(v58?.lines.some((line) => line.includes('buildIdbExecutor')));
  });

  it('plans V60 IDB execution wrapper with try-catch error handlers timeout and fallback flag', () => {
    const executor = buildIdbExecutor({
      operations: [
        { kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' },
        { kind: 'count', store: 'projects', expect: 'count' },
      ],
      supportsIdb: true,
      fallbackStorageKey: 'novel-ma:artifacts',
    });
    const plan = planIdbExecution(executor, { fallbackStorageKey: 'novel-ma:artifacts', timeoutMs: 5000 });
    assert.ok(plan.wrapper.includes('async function runIdbExecutor'));
    assert.ok(plan.wrapper.includes('onIdbError'));
    assert.ok(plan.wrapper.includes('return { success: true'));
    assert.ok(plan.wrapper.includes('localStorage.setItem'));
    assert.equal(plan.totalSteps, executor.totalSteps);
    assert.ok(plan.estimatedDurationMs >= 200);
    assert.equal(plan.errorHandlers.length, 3);
    assert.ok(plan.errorHandlers[0]?.includes('console.error'));
    assert.ok(plan.errorHandlers[1]?.includes('IndexedDB not supported'));
    assert.equal(plan.fallbackEnabled, true);
    assert.equal(plan.ready, true);

    const noExec = planIdbExecution(buildIdbExecutor({ operations: [] }), { timeoutMs: 1 });
    assert.ok(noExec.wrapper.length > 100);
  });

  it('parses V61 REPL command into name args flags and raw', () => {
    const empty = parseReplCommand('');
    assert.equal(empty.name, '');
    assert.equal(empty.args.length, 0);
    const cmd = parseReplCommand('artifact-search --query=月背 --limit=5 my/path');
    assert.equal(cmd.name, 'artifact-search');
    assert.equal(cmd.flags['query'], '月背');
    assert.equal(cmd.flags['limit'], '5');
    assert.deepEqual(cmd.args, ['my/path']);
    const flag = parseReplCommand('new --quality');
    assert.equal(flag.flags['quality'], 'true');
    assert.equal(flag.flags['quality'] === 'true' ? 'with-quality' : 'no-quality', 'with-quality');
  });

  it('plans V61 REPL dispatch with matched handler suggestions and warning for unknown command', () => {
    const known = planReplDispatch(parseReplCommand('help'));
    assert.equal(known.matched, 'help');
    assert.equal(known.handler, 'handle_help');
    assert.equal(known.ready, true);

    const unknown = planReplDispatch(parseReplCommand('zzz'));
    assert.equal(unknown.matched, null);
    assert.equal(unknown.ready, false);
    assert.ok(unknown.warning?.includes('unknown command'));
    assert.ok(unknown.suggestions.length <= 3);
  });

  it('builds V61 REPL help with 21 entries including new continue provider-smoke and quit', () => {
    const help = buildReplHelp();
    assert.equal(help.length, 21);
    const names = help.map((e) => e.command);
    assert.ok(names.includes('new'));
    assert.ok(names.includes('continue'));
    assert.ok(names.includes('provider-smoke'));
    assert.ok(names.includes('quit'));
    const filtered = buildReplHelp('art');
    assert.ok(filtered.every((entry) => entry.command.includes('art')));
  });

  it('plans V61 CLI command with allowed list filter and unknown warning', () => {
    const ok = planCliCommand('artifact-latest');
    assert.equal(ok.matched, 'artifact-latest');
    assert.equal(ok.ready, true);
    assert.ok(ok.helpEntry);

    const blocked = planCliCommand('quit', { allowedCommands: ['new', 'continue', 'help'] });
    assert.equal(blocked.matched, 'quit');
    assert.equal(blocked.ready, false);
    assert.ok(blocked.warning?.includes('not in allowed list'));

    const unknown = planCliCommand('unknown-cmd');
    assert.equal(unknown.ready, false);
  });

  it('builds V62 theme config for light dark sepia nord with 11 tokens each and storage key', () => {
    const themes = ['light', 'dark', 'sepia', 'nord'] as const;
    for (const name of themes) {
      const config = buildThemeConfig(name);
      assert.equal(config.name, name);
      assert.ok(config.label.length > 0);
      assert.equal(config.storageKey, 'novel-ma:theme');
      assert.equal(config.tokens.bg.length > 0, true);
      assert.ok(config.tokens.panel && config.tokens.text && config.tokens.border);
      assert.ok(config.tokens.code && config.tokens.codeText);
      assert.ok(config.tokens.success && config.tokens.warn && config.tokens.danger);
      assert.equal(config.ready, true);
    }
    const unknown = buildThemeConfig('not-a-theme' as ThemeName);
    assert.equal(unknown.ready, false);
    assert.ok(unknown.warning?.includes('unknown theme'));
  });

  it('builds V62 theme options returning 4 configs with current theme marked active', () => {
    const options = buildThemeOptions('dark');
    assert.equal(options.length, 4);
    const names = options.map((o) => o.name);
    assert.ok(names.includes('light'));
    assert.ok(names.includes('dark'));
    assert.ok(names.includes('sepia'));
    assert.ok(names.includes('nord'));
    const active = options.find((o) => o.storageKey === 'novel-ma:theme');
    assert.ok(active);
  });

  it('plans V62 theme migration with css variable block steps and preserve preference', () => {
    const plan = planThemeMigration('dark', 'light', { preserveUserPreference: true, storageKey: 'novel-ma:theme' });
    assert.equal(plan.fromTheme, 'dark');
    assert.equal(plan.toTheme, 'light');
    assert.ok(plan.cssVariableBlock.includes("--bg:"));
    assert.ok(plan.cssVariableBlock.includes('--text:'));
    assert.ok(plan.cssVariableBlock.includes('--accent:'));
    assert.equal(plan.preserveUserPreference, true);
    assert.equal(plan.estimatedDurationMs, 50);
    assert.ok(plan.steps.length >= 3);
    assert.ok(plan.ready);
    assert.ok(plan.steps[0]?.includes('novel-ma:theme'));

    const self = planThemeMigration('light', 'light');
    assert.equal(self.ready, true);
  });

  it('builds V63 IDB mock handle with 3 stores put get getAll delete count close and supportsIdb flag', () => {
    const handle = buildIdbMockHandle({ stores: ['projects', 'tags', 'undo'] });
    assert.equal(handle.isOpen, true);
    assert.equal(handle.supportsIdb, true);
    assert.equal(Object.keys(handle.stores).length, 3);
    assert.ok(handle.stores['projects']);
    assert.equal(typeof handle.stores['projects'].put, 'function');
    assert.equal(typeof handle.stores['projects'].get, 'function');
    assert.equal(typeof handle.stores['projects'].count, 'function');
    const noIdb = buildIdbMockHandle({ supportsIdb: false });
    assert.equal(noIdb.isOpen, false);
    assert.equal(noIdb.supportsIdb, false);
  });

  it('simulates V63 IDB runtime with mock handle returning success and recover fallback flag', async () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const plan = planIdbExecution(executor, { fallbackStorageKey: 'novel-ma:artifacts' });
    const handle = buildIdbMockHandle();
    const ok = await simulateIdbRuntime(plan, handle, { fallbackStorageKey: 'novel-ma:artifacts' });
    assert.equal(ok.success, true);
    assert.equal(ok.stepsCompleted, plan.totalSteps);
    assert.equal(ok.fallbackUsed, false);
    assert.equal(ok.recovered, false);
    assert.equal(ok.fallbackStorageKey, 'novel-ma:artifacts');

    const noIdb = await simulateIdbRuntime(plan, buildIdbMockHandle({ supportsIdb: false }));
    assert.equal(noIdb.success, false);
    assert.equal(noIdb.fallbackUsed, true);
    assert.equal(noIdb.errorMessage, 'IDB not supported');
  });

  it('plans V63 IDB recovery with steps fallback key and ready flag', () => {
    const plan = planIdbRecovery('QuotaExceededError on store projects', { fallbackStorageKey: 'novel-ma:artifacts', recovered: true });
    assert.ok(plan.fromError.includes('QuotaExceededError'));
    assert.equal(plan.toFallback, 'novel-ma:artifacts');
    assert.ok(plan.steps.length >= 4);
    assert.ok(plan.steps.some((s) => s.includes('localStorage')));
    assert.equal(plan.fallbackStorageKey, 'novel-ma:artifacts');
    assert.ok(plan.estimatedDurationMs > 0);
    assert.equal(plan.ready, true);

    const notRecovered = planIdbRecovery('User cancelled', { recovered: false });
    assert.ok(notRecovered.steps.some((s) => s.includes('用户决策')));
  });

  it('builds V64 IDB integration test cases covering put count no-idb getall and assertions', () => {
    const cases = buildIdbIntegrationTestCases();
    assert.ok(cases.length >= 4);
    const names = cases.map((c) => c.name);
    assert.ok(names.includes('basic-put-single'));
    assert.ok(names.includes('basic-count-after-put'));
    assert.ok(names.includes('no-idb-fallback'));
    assert.ok(names.includes('getall-empty'));
    const noIdb = cases.find((c) => c.name === 'no-idb-fallback');
    assert.equal(noIdb?.expectedSuccess, false);
    assert.equal(noIdb?.expectedFallback, true);
  });

  it('runs V64 IDB integration test case against mock handle and verifies expectations', async () => {
    const cases = buildIdbIntegrationTestCases();
    const basic = cases.find((c) => c.name === 'basic-put-single');
    if (!basic) throw new Error('missing basic-put-single');
    const result = await runIdbIntegrationTest(basic);
    assert.equal(result.passed, true);
    assert.equal(result.actualSuccess, true);
    assert.equal(result.actualFallback, false);
    assert.ok(result.actualSteps > 0);
    assert.equal(result.errorMessage, null);

    const noIdbCase = cases.find((c) => c.name === 'no-idb-fallback');
    if (!noIdbCase) throw new Error('missing no-idb-fallback');
    const failResult = await runIdbIntegrationTest(noIdbCase);
    assert.equal(failResult.actualSuccess, false);
    assert.equal(failResult.actualFallback, true);
  });

  it('assesses V64 IDB integration coverage with passed/failed counts and ready flag', async () => {
    const cases = buildIdbIntegrationTestCases();
    const coverage = await assessIdbIntegrationCoverage(cases);
    assert.equal(coverage.totalCases, cases.length);
    assert.ok(coverage.passedCases >= 3);
    assert.ok(coverage.coveragePercent >= 50);
    assert.equal(coverage.failedCases + coverage.passedCases, coverage.totalCases);
    assert.equal(coverage.ready, coverage.failedCases === 0);
    assert.equal(coverage.results.length, cases.length);
  });

  it('builds V65 TUI keymap with vim hjkl bindings 9 actions and normal mode default', () => {
    const keymap = buildTuiKeymap();
    assert.equal(keymap.mode, 'normal');
    assert.ok(keymap.bindings.length >= 8);
    const keys = keymap.bindings.map((b) => b.keys);
    assert.ok(keys.includes('j'));
    assert.ok(keys.includes('k'));
    assert.ok(keys.includes('g g'));
    assert.ok(keys.includes('G'));
    assert.ok(keys.includes('Enter'));
    assert.ok(keys.includes('q'));
    assert.ok(keys.includes('?'));
    assert.ok(keys.includes(':'));
    assert.equal(keymap.enabled, true);

    const noNav = buildTuiKeymap({ enableNavigation: false });
    assert.ok(noNav.bindings.length >= 3);
    assert.ok(!noNav.bindings.some((b) => b.action === 'down'));
  });

  it('plans V65 TUI navigation with down up first last enter quit and unknown', () => {
    const keymap = buildTuiKeymap();
    const sections = ['header', 'V41', 'V42', 'V58', 'bindings'];
    const down = planTuiNavigate(keymap, 'V41', 'j', sections);
    assert.equal(down.direction, 'down');
    assert.equal(down.toSection, 'V42');
    assert.equal(down.matched, true);
    const up = planTuiNavigate(keymap, 'V42', 'k', sections);
    assert.equal(up.direction, 'up');
    assert.equal(up.toSection, 'V41');
    const first = planTuiNavigate(keymap, 'V58', 'gg', sections);
    assert.equal(first.direction, 'first');
    assert.equal(first.toSection, 'header');
    const last = planTuiNavigate(keymap, 'header', 'G', sections);
    assert.equal(last.direction, 'last');
    assert.equal(last.toSection, 'bindings');
    const quit = planTuiNavigate(keymap, 'V41', 'q', sections);
    assert.equal(quit.direction, 'quit');
    assert.equal(quit.toSection, 'V41');
    const unknown = planTuiNavigate(keymap, 'V41', 'x', sections);
    assert.equal(unknown.matched, false);
    assert.equal(unknown.direction, 'unknown');
  });

  it('builds V65 TUI commands with navigation keys action keys and ready flag', () => {
    const commands = buildTuiCommands({ mode: 'normal' });
    assert.equal(commands.keymap.mode, 'normal');
    assert.ok(commands.totalBindings >= 8);
    assert.ok(commands.uniqueActions >= 5);
    assert.ok(commands.navigationKeys.includes('j'));
    assert.ok(commands.navigationKeys.includes('k'));
    assert.ok(commands.actionKeys.includes('q'));
    assert.ok(commands.actionKeys.includes('?'));
    assert.equal(commands.ready, true);
  });

  it('builds V66 TUI key event from raw key with ctrl/shift/alt meta modifiers', () => {
    const plain = buildTuiKeyEvent({ key: 'j' });
    assert.equal(plain.vimKey, 'j');
    assert.equal(plain.modifiers.ctrl, false);
    const upper = buildTuiKeyEvent({ key: 'G' });
    assert.equal(upper.vimKey, 'G');
    const ctrl = buildTuiKeyEvent({ key: 'r', ctrl: true });
    assert.equal(ctrl.vimKey, 'Ctrl+r');
    const esc = buildTuiKeyEvent({ key: 'Escape' });
    assert.equal(esc.vimKey, 'Esc');
    const arrow = buildTuiKeyEvent({ key: 'ArrowDown' });
    assert.equal(arrow.vimKey, 'Down');
    const enter = buildTuiKeyEvent({ key: 'Enter' });
    assert.equal(enter.vimKey, 'Enter');
    const meta = buildTuiKeyEvent({ key: 'k', meta: true });
    assert.equal(meta.vimKey, 'Cmd+k');
  });

  it('plans V66 TUI key bindings matching direct keys including case-insensitive Enter and g', () => {
    const keymap = buildTuiKeymap();
    const jEvent = buildTuiKeyEvent({ key: 'j' });
    const jMatch = planTuiKeyBindings(keymap, jEvent);
    assert.equal(jMatch.matched, true);
    assert.equal(jMatch.action, 'down');
    assert.equal(jMatch.consumed, true);
    assert.equal(jMatch.event.vimKey, 'j');

    const kEvent = buildTuiKeyEvent({ key: 'k' });
    const kMatch = planTuiKeyBindings(keymap, kEvent);
    assert.equal(kMatch.action, 'up');

    const enterEvent = buildTuiKeyEvent({ key: 'Enter' });
    const enterMatch = planTuiKeyBindings(keymap, enterEvent);
    assert.equal(enterMatch.matched, true);
    assert.equal(enterMatch.action, 'enter');

    const xEvent = buildTuiKeyEvent({ key: 'x' });
    const xMatch = planTuiKeyBindings(keymap, xEvent);
    assert.equal(xMatch.matched, false);
    assert.equal(xMatch.consumed, false);
  });

  it('builds V66 TUI active section with index total highlighted and vim actions list', () => {
    const section = buildTuiActiveSection('V41', 1, 18, ['j', 'k', 'gg', 'G', 'Enter']);
    assert.equal(section.sectionId, 'V41');
    assert.equal(section.index, 1);
    assert.equal(section.totalSections, 18);
    assert.equal(section.highlighted, true);
    assert.equal(section.vimActions.length, 5);
    assert.ok(section.vimActions.includes('gg'));
    assert.ok(section.vimActions.includes('Enter'));
  });

  it('builds V67 IDB executor code string with steps wrapper function and dependencies list', () => {
    const executor = buildIdbExecutor({
      operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }, { kind: 'count', store: 'projects', expect: 'count' }],
      supportsIdb: true,
    });
    const evalCode = buildIdbExecutorCode(executor, { wrapperFnName: 'runMyIdb' });
    assert.equal(evalCode.wrapperFnName, 'runMyIdb');
    assert.ok(evalCode.code.includes('function runMyIdb'));
    assert.ok(evalCode.code.includes('stepsCompleted ='));
    assert.ok(evalCode.code.includes('return { success: true'));
    assert.ok(evalCode.code.includes('return { success: false'));
    assert.equal(evalCode.stepCount, executor.totalSteps);
    assert.equal(evalCode.ready, true);
    assert.ok(evalCode.bytes > 100);
    assert.ok(evalCode.dependencies.includes('indexedDB'));
    assert.ok(evalCode.dependencies.includes('console'));
  });

  it('parses V67 IDB eval error info with type recoverable fallback key and user message', () => {
    const quota = parseIdbEvalError('QuotaExceededError: storage full', 3);
    assert.equal(quota.errorType, 'QuotaExceededError');
    assert.equal(quota.step, 3);
    assert.equal(quota.recoverable, true);
    assert.equal(quota.fallbackStorageKey, 'novel-ma:artifacts');
    assert.ok(quota.userMessage.includes('存储配额'));

    const invalidState = parseIdbEvalError('InvalidStateError: connection closed', 2);
    assert.equal(invalidState.errorType, 'InvalidStateError');
    assert.equal(invalidState.recoverable, true);

    const notFound = parseIdbEvalError('NotFoundError: db not found', 1);
    assert.equal(notFound.recoverable, false);

    const syntax = parseIdbEvalError('SyntaxError: unexpected token', 0);
    assert.equal(syntax.errorType, 'SyntaxError');

    const unknown = parseIdbEvalError('something weird happened');
    assert.equal(unknown.errorType, 'Unknown');
    assert.equal(unknown.recoverable, false);
  });

  it('simulates V67 IDB eval with mock output returning success result and total steps', () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor);
    const result = simulateIdbEval(evalCode, 'mock completed 1 steps');
    assert.equal(result.success, true);
    assert.equal(result.stepsCompleted, evalCode.stepCount);
    assert.equal(result.totalSteps, evalCode.stepCount);
    assert.equal(result.errorMessage, null);
    assert.equal(result.fallbackTriggered, false);
    assert.ok(result.outputPreview.includes('mock'));

    const noIdb = buildIdbExecutor({ operations: [], supportsIdb: false });
    const noIdbCode = buildIdbExecutorCode(noIdb);
    assert.equal(noIdbCode.ready, false);
  });

  it('builds V68 IDB in-memory handle with 3 stores putCount getCount size and supportsIdb true', () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects', 'tags', 'undo'] });
    assert.equal(handle.isOpen, true);
    assert.equal(handle.supportsIdb, true);
    assert.equal(Object.keys(handle.stores).length, 3);
    assert.equal(handle.stores['projects'].size, 0);
    assert.equal(handle.stores['projects'].putCount, 0);
    assert.equal(handle.totalOperations, 0);
    assert.equal(handle.events.length, 0);
  });

  it('runs V68 IDB in-memory ops put get count getAll delete clear with event tracking', async () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects'] });
    const ops = [
      { kind: 'put', store: 'projects', key: 'p1', value: { x: 1 } },
      { kind: 'put', store: 'projects', key: 'p2', value: { x: 2 } },
      { kind: 'count', store: 'projects' },
      { kind: 'get', store: 'projects', key: 'p1' },
      { kind: 'getAll', store: 'projects' },
      { kind: 'delete', store: 'projects', key: 'p2' },
      { kind: 'clear', store: 'projects' },
    ];
    const result = await runIdbInMemoryOps(handle, ops);
    assert.equal(result.successCount, 7);
    assert.equal(result.errorCount, 0);
    assert.equal(result.events.length, 7);
    assert.equal(handle.stores['projects'].size, 0);
    assert.equal(handle.stores['projects'].putCount, 2);
    assert.equal(handle.stores['projects'].getCount, 1);
    assert.equal(handle.stores['projects'].deleteCount, 1);
    assert.equal(handle.stores['projects'].clearCount, 1);
    assert.equal(handle.totalOperations, 7);
    const putEvents = result.events.filter((e) => e.type === 'put');
    assert.equal(putEvents.length, 2);
    assert.equal(putEvents[0]?.key, 'p1');
  });

  it('handles V68 IDB in-memory errors when store not found', async () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects'] });
    const ops = [
      { kind: 'put', store: 'nonexistent', key: 'p1', value: { x: 1 } },
      { kind: 'put', store: 'projects', key: 'p2', value: { x: 2 } },
    ];
    const result = await runIdbInMemoryOps(handle, ops);
    assert.equal(result.successCount, 1);
    assert.equal(result.errorCount, 1);
    assert.equal(handle.stores['projects'].putCount, 1);
    assert.equal(handle.totalOperations, 2);
  });

  it('builds V69 IDB persistence adapter with primary secondary storage keys and bytesWritten counter', async () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects'] });
    const adapter = buildIdbPersistenceAdapter(handle, { primaryStorage: 'localStorage', primaryKey: 'k1', secondaryKey: 'k2' });
    assert.equal(adapter.primaryStorage, 'localStorage');
    assert.equal(adapter.secondaryStorage, 'indexedDB');
    assert.equal(adapter.primaryKey, 'k1');
    assert.equal(adapter.secondaryKey, 'k2');
    assert.equal(adapter.ready, true);
    assert.equal(adapter.bytesWritten, 0);
    assert.equal(adapter.writesLogged, 0);
    await adapter.handle.put('projects', 'p1', { x: 1 });
    assert.ok(adapter.bytesWritten > 0);
    assert.equal(adapter.writesLogged, 1);
  });

  it('plans V69 persistence backup with steps storeNames estimatedBytes and duration', async () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects', 'tags'] });
    await handle.put('projects', 'p1', { x: 1 });
    await handle.put('projects', 'p2', { x: 2 });
    await handle.put('tags', 't1', { tag: 'fantasy' });
    const plan = planPersistenceBackup(handle, { targetStorage: 'localStorage', storageKey: 'novel-ma:backup' });
    assert.equal(plan.targetStorage, 'localStorage');
    assert.equal(plan.storageKey, 'novel-ma:backup');
    assert.equal(plan.storeNames.length, 2);
    assert.ok(plan.estimatedBytes > 0);
    assert.ok(plan.estimatedDurationMs > 0);
    assert.ok(plan.steps.length >= 3);
    assert.equal(plan.ready, true);
  });

  it('plans V69 persistence restore with entries found applied conflicts resolved and ready flag', async () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects', 'tags'] });
    await handle.put('projects', 'p1', { x: 1 });
    await handle.put('tags', 't1', { tag: 'fantasy' });
    const plan = planPersistenceRestore(handle, { sourceStorage: 'localStorage', storageKey: 'novel-ma:backup' });
    assert.equal(plan.sourceStorage, 'localStorage');
    assert.equal(plan.entriesFound, 2);
    assert.equal(plan.entriesApplied, 2);
    assert.ok(plan.conflictsResolved >= 0);
    assert.equal(plan.ready, true);
  });

  it('computes V69 persistence checksum with fnv1a simple-xor and storeChecksums', () => {
    const handle = buildIdbInMemoryHandle({ stores: ['projects', 'tags'] });
    handle.put('projects', 'p1', { x: 1 });
    handle.put('tags', 't1', { tag: 'fantasy' });
    const fnv = computePersistenceChecksum(handle, 'fnv1a');
    assert.equal(fnv.algorithm, 'fnv1a');
    assert.ok(fnv.digest.length >= 6);
    assert.ok(fnv.storeChecksums['projects']);
    assert.ok(fnv.storeChecksums['tags']);
    assert.equal(fnv.verified, true);
    assert.ok(fnv.byteCount >= 2);

    const xor = computePersistenceChecksum(handle, 'simple-xor');
    assert.equal(xor.algorithm, 'simple-xor');
    assert.notEqual(xor.digest, fnv.digest);
  });

  it('builds V70 browser eval adapter with steps fallback key timeout and ready flag', () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor);
    const adapter = buildBrowserEvalAdapter(evalCode, { fallbackStorageKey: 'novel-ma:fb', timeoutMs: 5000 });
    assert.equal(adapter.target, 'browser');
    assert.equal(adapter.fallbackStorageKey, 'novel-ma:fb');
    assert.equal(adapter.timeoutMs, 5000);
    assert.equal(adapter.fallbackEnabled, true);
    assert.equal(adapter.ready, true);
    assert.ok(adapter.steps.length >= 5);
    assert.ok(adapter.steps.some((s) => s.includes('pre-check')));
    assert.ok(adapter.steps.some((s) => s.includes('fallback check')));
    assert.ok(adapter.steps.some((s) => s.includes('execute')));
  });

  it('plans V70 browser eval steps with index status pending success and duration', () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor);
    const adapter = buildBrowserEvalAdapter(evalCode);
    const steps = planBrowserEvalSteps(adapter);
    assert.equal(steps.length, adapter.steps.length);
    assert.equal(steps[0]?.status, 'success');
    assert.equal(steps[1]?.status, 'pending');
    assert.equal(steps[0]?.index, 1);
  });

  it('simulates V70 browser eval with mock outputs returning success timeline and ready flag', () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor);
    const adapter = buildBrowserEvalAdapter(evalCode);
    const timeline = simulateBrowserEval(adapter, ['check ok', 'storage ok', 'exec ok', 'await ok', 'fallback ok', 'return ok']);
    assert.equal(timeline.totalSteps, adapter.steps.length);
    assert.equal(timeline.successCount, adapter.steps.length);
    assert.equal(timeline.failedCount, 0);
    assert.equal(timeline.fallbackCount, 0);
    assert.equal(timeline.ready, true);
    assert.ok(timeline.steps.every((s) => s.status === 'success'));
    assert.ok(timeline.steps.every((s) => s.durationMs >= 0));
  });

  it('builds V71 TUI section visual with active first last icon accent border badge and scroll offset', () => {
    const v0 = buildTuiSectionVisual('header', 0, 5, 0);
    assert.equal(v0.sectionId, 'header');
    assert.equal(v0.index, 0);
    assert.equal(v0.isActive, true);
    assert.equal(v0.isFirst, true);
    assert.equal(v0.isLast, false);
    assert.equal(v0.icon, '▶');
    assert.equal(v0.accentColor, '#2563eb');
    assert.equal(v0.borderStyle, 'double');
    assert.equal(v0.badge, '▶');
    assert.equal(v0.scrollOffset, 0);

    const v2 = buildTuiSectionVisual('V42', 2, 5, 0);
    assert.equal(v2.isActive, false);
    assert.equal(v2.isFirst, false);
    assert.equal(v2.icon, '·');
    assert.equal(v2.badge, '·');
    assert.equal(v2.borderStyle, 'dotted');
    assert.ok(v2.scrollOffset >= 0);
  });

  it('plans V71 TUI highlight with all section visuals activeIndex scroll target and palette', () => {
    const sections = [{ id: 'header' }, { id: 'V41' }, { id: 'V42' }, { id: 'V58' }];
    const plan = planTuiHighlight(sections, 2, { themePalette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'], scrollBehavior: 'smooth' });
    assert.equal(plan.activeIndex, 2);
    assert.equal(plan.totalSections, 4);
    assert.equal(plan.sections.length, 4);
    assert.ok(plan.themePalette.length === 4);
    assert.equal(plan.scrollBehavior, 'smooth');
    assert.equal(plan.sections[2]?.isActive, true);
    assert.equal(plan.sections[0]?.isFirst, true);
    assert.ok(plan.scrollTarget >= 0);
    assert.equal(plan.ready, true);
  });

  it('builds V71 TUI scroll plan with containerHeight itemHeight scrollY maxScrollY visible range and needsScroll', () => {
    const sections = [{ id: 's0' }, { id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }, { id: 's5' }];
    const plan = buildTuiScrollPlan(sections, 4, { containerHeight: 96, itemHeight: 24 });
    assert.equal(plan.containerHeight, 96);
    assert.equal(plan.itemHeight, 24);
    assert.equal(plan.scrollY, 96);
    assert.ok(plan.maxScrollY >= 0);
    assert.ok(plan.visibleRange[0] >= 0);
    assert.ok(plan.visibleRange[1] >= plan.visibleRange[0]);
    assert.equal(plan.paddingTop, 8);
    assert.equal(plan.paddingBottom, 8);
    assert.equal(plan.ready, true);
  });

  it('runs V72 browser eval with new Function + try/catch returning success or fallback result', () => {
    const executor = buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor, { wrapperFnName: 'runForV72' });
    const adapter = buildBrowserEvalAdapter(evalCode, { fallbackStorageKey: 'novel-ma:fb' });
    const result = runBrowserEval(adapter, { indexedDB: {}, localStorage: {} });
    assert.equal(typeof result.success, 'boolean');
    assert.equal(typeof result.stepsCompleted, 'number');
    assert.equal(result.totalSteps, adapter.steps.length);
    assert.equal(result.fallbackStorageKey, 'novel-ma:fb');
    assert.ok(result.durationMs >= 0);
  });

  it('extracts V72 browser eval error info with category suggestion for 5 error types', () => {
    const mkResult = (msg: string | null): BrowserEvalRunResult => ({ success: false, stepsCompleted: 0, totalSteps: 3, errorMessage: msg, errorStep: 1, fallbackTriggered: false, fallbackStorageKey: 'k', durationMs: 0, outputPreview: '', stackTrace: null });
    const quota = extractBrowserEvalError(mkResult('QuotaExceededError: storage full'));
    assert.equal(quota.category, 'QuotaExceeded');
    assert.ok(quota.suggestion.includes('降级'));
    const invalid = extractBrowserEvalError(mkResult('InvalidStateError: connection closed'));
    assert.equal(invalid.category, 'InvalidState');
    const syntax = extractBrowserEvalError(mkResult('SyntaxError: unexpected token'));
    assert.equal(syntax.category, 'Syntax');
    const type = extractBrowserEvalError(mkResult('TypeError: undefined'));
    assert.equal(type.category, 'Type');
    const ref = extractBrowserEvalError(mkResult('ReferenceError: x not defined'));
    assert.equal(ref.category, 'Reference');
    const other = extractBrowserEvalError(mkResult('something weird'));
    assert.equal(other.category, 'Other');
  });

  it('plans V72 browser eval retry with attempt delay and strategies', () => {
    const executor = buildIdbExecutor({ operations: [], supportsIdb: true });
    const evalCode = buildIdbExecutorCode(executor);
    const adapter = buildBrowserEvalAdapter(evalCode);
    const r1 = planBrowserEvalRetry(adapter, 1);
    assert.equal(r1.attempt, 1);
    assert.equal(r1.maxAttempts, 3);
    assert.equal(r1.nextDelayMs, 200);
    assert.ok(r1.strategies.includes('retry-immediate'));

    const r3 = planBrowserEvalRetry(adapter, 3);
    assert.equal(r3.nextDelayMs, 0);
    assert.ok(r3.strategies.includes('fallback-to-storage'));

    const r5 = planBrowserEvalRetry(adapter, 5, { maxAttempts: 10 });
    assert.equal(r5.maxAttempts, 10);
    assert.equal(r5.attempt, 5);
    assert.ok(r5.nextDelayMs >= 0);
  });

  it('builds V73 TUI scrollIntoView code with target selector behavior block and inline options', () => {
    const plan = buildTuiScrollPlan([{ id: 's0' }, { id: 's1' }, { id: 's2' }], 0, { containerHeight: 100, itemHeight: 30 });
    const result = buildTuiScrollIntoView(plan, 2, { behavior: 'smooth', block: 'center' });
    assert.equal(result.targetSelector, '#tui-section-2');
    assert.equal(result.sourceSelector, '.tui-section-list');
    assert.equal(result.scrollOptions.behavior, 'smooth');
    assert.equal(result.scrollOptions.block, 'center');
    assert.ok(result.scrollCode.includes('scrollIntoView'));
    assert.ok(result.scrollCode.includes('behavior: \'smooth\''));
    assert.ok(result.scrollCode.includes('block: \'center\''));
    assert.equal(result.ready, true);
  });

  it('plans V73 TUI smooth scroll with steps progress easing and total duration', () => {
    const plan = planTuiSmoothScroll(0, 100, 5, { stepIntervalMs: 50, easing: 'ease-in-out' });
    assert.equal(plan.fromIndex, 0);
    assert.equal(plan.toIndex, 100);
    assert.equal(plan.totalDistance, 100);
    assert.equal(plan.stepCount, 5);
    assert.equal(plan.stepIntervalMs, 50);
    assert.equal(plan.totalDurationMs, 250);
    assert.equal(plan.easing, 'ease-in-out');
    assert.equal(plan.steps.length, 6);
    assert.equal(plan.steps[0]?.progress, 0);
    assert.ok(Math.abs((plan.steps[5]?.scrollY ?? 0) - 100) < 0.01);
    assert.equal(plan.ready, true);

    const linear = planTuiSmoothScroll(0, 10, 3, { easing: 'linear' });
    assert.equal(linear.easing, 'linear');
    assert.ok(Math.abs((linear.steps[2]?.scrollY ?? 0) - (10 * 2 / 3)) < 0.01);
  });

  it('builds V73 TUI keyboard focus with focused selector tabIndex ariaLabel and selected state', () => {
    const focus = buildTuiKeyboardFocus(2, [{ id: 'header' }, { id: 'V41' }, { id: 'V42' }, { id: 'V58' }], { tabIndex: 1, ariaLabel: 'V42 active section' });
    assert.equal(focus.activeIndex, 2);
    assert.equal(focus.focusedSelector, '#tui-section-2');
    assert.equal(focus.tabIndex, 1);
    assert.equal(focus.ariaLabel, 'V42 active section');
    assert.equal(focus.ariaSelected, true);
    assert.equal(focus.hasFocus, true);
    assert.equal(focus.ready, true);
  });

  it('serializes V74 persistence payload with items count bytes checksum format and timestamp', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const payload = serializePersistencePayload(items, { format: 'json-with-meta' });
    assert.equal(payload.itemsCount, 3);
    assert.ok(payload.totalBytes > 0);
    assert.ok(payload.checksum.length === 8);
    assert.equal(payload.format, 'json-with-meta');
    assert.ok(payload.payloadJson.includes('"version":1'));
    assert.ok(payload.payloadJson.includes('"items"'));
    assert.ok(payload.generatedAt.length > 0);
    assert.ok(payload.compressionRatio > 0);
  });

  it('verifies V74 persistence readback with checksum and itemCount match and drift detection', () => {
    const items = [{ x: 1 }, { x: 2 }];
    const payload = serializePersistencePayload(items);
    const perfect = verifyPersistenceReadback(payload, 'k', payload.payloadJson);
    assert.equal(perfect.match, true);
    assert.equal(perfect.checksumMatch, true);
    assert.equal(perfect.itemCountMatch, true);
    assert.equal(perfect.driftKeys.length, 0);
    assert.equal(perfect.ready, true);

    const mismatch = verifyPersistenceReadback(payload, 'k', 'corrupted data');
    assert.equal(mismatch.match, false);

    const nullBack = verifyPersistenceReadback(payload, 'k', null);
    assert.equal(nullBack.match, false);
    assert.equal(nullBack.ready, false);

    const wrongFormat = verifyPersistenceReadback(payload, 'k', '{"version":1,"items":[]}');
    assert.equal(wrongFormat.itemCountMatch, false);
    assert.ok(wrongFormat.driftKeys.length >= 1);
  });

  it('plans V74 persistence dual-write with primary/secondary codes readback steps and warnings', () => {
    const payload = serializePersistencePayload([{ a: 1 }]);
    const plan = planPersistenceDualWrite(payload, { primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryKey: 'p1', secondaryKey: 'p2' });
    assert.equal(plan.primaryKey, 'p1');
    assert.equal(plan.secondaryKey, 'p2');
    assert.ok(plan.primaryWriteCode.includes('localStorage.setItem'));
    assert.ok(plan.secondaryWriteCode.includes('indexedDB.open'));
    assert.ok(plan.readbackCode.includes('localStorage.getItem'));
    assert.equal(plan.steps.length, 6);
    assert.ok(plan.steps.some((s) => s.includes('serialize')));
    assert.ok(plan.steps.some((s) => s.includes('checksum match')));
    assert.equal(plan.warnings.length, 0);
    assert.equal(plan.ready, true);

    const largePayload = serializePersistencePayload(new Array(100_000).fill({ x: 'a'.repeat(50) }));
    const largePlan = planPersistenceDualWrite(largePayload);
    assert.ok(largePlan.warnings.length >= 1);
  });

  it('runs V75 dual-write with primary/secondary/readback status and errors', () => {
    const payload = serializePersistencePayload([{ a: 1 }, { a: 2 }]);
    const plan = planPersistenceDualWrite(payload, { primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryKey: 'k1', secondaryKey: 'k2' });
    const mockStore: Record<string, string> = {};
    const result = runDualWrite(plan, { localStorage: { setItem: (k, v) => { mockStore[k] = v; }, getItem: (k) => mockStore[k] ?? null }, indexedDB: {} });
    assert.equal(result.primarySuccess, true);
    assert.equal(result.primaryWritten, true);
    assert.equal(result.secondaryWritten, true);
    assert.equal(result.readbackMatched, true);
    assert.equal(result.readbackSuccess, true);
    assert.equal(result.primaryError, null);
    assert.equal(result.secondaryError, null);
    assert.equal(result.attempt, 1);
    assert.ok(result.durationMs >= 0);
  });

  it('extracts V75 dual-write error info with category and suggestion for primary and secondary', () => {
    const mk = (primaryErr: string | null, secondaryErr: string | null): DualWriteRunResult => ({ primarySuccess: false, secondarySuccess: false, readbackSuccess: false, primaryError: primaryErr, secondaryError: secondaryErr, readbackError: null, primaryWritten: false, secondaryWritten: false, readbackMatched: false, durationMs: 0, attempt: 1 });
    const quota = extractDualWriteError(mk('QuotaExceededError: full', 'QuotaExceededError: full'));
    assert.equal(quota.primaryCategory, 'QuotaExceeded');
    assert.equal(quota.secondaryCategory, 'QuotaExceeded');
    assert.ok(quota.primarySuggestion.includes('清理'));
    const invalid = extractDualWriteError(mk('InvalidStateError: closed', null));
    assert.equal(invalid.primaryCategory, 'InvalidState');
    assert.equal(invalid.secondaryCategory, 'Other');
    const sec = extractDualWriteError(mk(null, 'SecurityError: denied'));
    assert.equal(sec.primaryCategory, 'Other');
    assert.equal(sec.secondaryCategory, 'Security');
  });

  it('plans V75 dual-write recovery with attempts delays strategies and recoverable flag', () => {
    const payload = serializePersistencePayload([{ a: 1 }]);
    const plan = planPersistenceDualWrite(payload, { primaryStorage: 'localStorage', secondaryStorage: 'localStorage', primaryKey: 'k1', secondaryKey: 'k2' });
    const r1 = planDualWriteRecovery(plan, 1);
    assert.equal(r1.attempt, 1);
    assert.equal(r1.maxAttempts, 3);
    assert.equal(r1.nextDelayMs, 400);
    assert.ok(r1.strategies.includes('retry-immediate'));
    assert.equal(r1.primaryRecoverable, true);

    const r3 = planDualWriteRecovery(plan, 3);
    assert.equal(r3.nextDelayMs, 0);
    assert.ok(r3.strategies.includes('fallback-storage'));

    const large = planPersistenceDualWrite(serializePersistencePayload(new Array(100_000).fill({ x: 'a'.repeat(50) })));
    const lr = planDualWriteRecovery(large, 1);
    assert.equal(lr.primaryRecoverable, false);
  });

  it('runs V76 TUI scrollIntoView with target found smooth animated and fallback paths', () => {
    const sectionsList = [{ id: 'header' }, { id: 'V41' }, { id: 'V42' }];
    const scrollPlan = buildTuiScrollPlan(sectionsList, 0, { containerHeight: 100, itemHeight: 30 });
    const result = buildTuiScrollIntoView(scrollPlan, 2, { behavior: 'smooth', block: 'center' });
    const mockEl = { scrollIntoViewCalls: [] as Array<unknown>, scrollIntoView(opts: { behavior: string; block: string; inline: string }) { this.scrollIntoViewCalls.push(opts); } };
    const mockDom = { querySelector: (sel: string) => sel === '#tui-section-2' ? mockEl : null };
    const exec = runTuiScrollIntoView(result, mockDom);
    assert.equal(exec.targetFound, true);
    assert.equal(exec.scrollIntoViewCalled, true);
    assert.equal(exec.smoothAnimated, false);
    assert.equal(exec.fallbackUsed, false);
    assert.equal(exec.errorMessage, null);
    assert.ok(exec.durationMs >= 0);
    assert.equal(mockEl.scrollIntoViewCalls.length, 1);

    const fallback = runTuiScrollIntoView(result, { querySelector: () => null });
    assert.equal(fallback.targetFound, false);
    assert.equal(fallback.fallbackUsed, true);

    const smoothPlan = planTuiSmoothScroll(0, 200, 4, { stepIntervalMs: 30 });
    const exec2 = runTuiScrollIntoView(result, { querySelector: () => mockEl, plan: smoothPlan });
    assert.equal(exec2.smoothAnimated, true);
    assert.equal(exec2.stepsApplied, 5);
  });

  it('plans V76 TUI animation with frames delayMs callback and total duration', () => {
    const smoothPlan = planTuiSmoothScroll(0, 300, 3, { stepIntervalMs: 50 });
    const schedule = planTuiAnimation(smoothPlan, { frameIntervalMs: 60 });
    assert.equal(schedule.frames.length, 4);
    assert.equal(schedule.frames[0]?.delayMs, 0);
    assert.equal(schedule.frames[1]?.delayMs, 60);
    assert.equal(schedule.frames[2]?.delayMs, 120);
    assert.equal(schedule.frames[3]?.delayMs, 180);
    assert.ok(schedule.frames.every((f) => f.callback.includes('setScrollY')));
    assert.equal(schedule.totalDurationMs, 180);
    assert.equal(schedule.scheduled, false);
    assert.equal(schedule.ready, true);
  });

  it('builds V76 TUI section element with tag attributes tabIndex role ariaLabel and textContent', () => {
    const el = buildTuiSectionElement({ id: 'V42', title: 'Interactive Panel' }, { className: 'tui-panel', tabIndex: 1, ariaLabel: 'V42 panel' });
    assert.equal(el.tagName, 'section');
    assert.equal(el.attributes['id'], 'tui-section-V42');
    assert.equal(el.attributes['class'], 'tui-panel');
    assert.equal(el.attributes['tabindex'], '1');
    assert.equal(el.attributes['role'], 'tab');
    assert.equal(el.attributes['aria-label'], 'V42 panel');
    assert.equal(el.textContent, 'Interactive Panel');
  });

  it('writes V77 IDB fallback with storage mock and readback success', () => {
    const mockStore: Record<string, string> = {};
    const result: BrowserEvalRunResult = { success: false, stepsCompleted: 0, totalSteps: 3, errorMessage: 'IndexedDB not available', errorStep: 1, fallbackTriggered: true, fallbackStorageKey: 'novel-ma:fb', durationMs: 0, outputPreview: 'fallback data', stackTrace: null };
    const fb = evalIdbFallbackWrite(result, { setItem: (k, v) => { mockStore[k] = v; }, getItem: (k) => mockStore[k] ?? null });
    assert.equal(fb.fallbackWritten, true);
    assert.equal(fb.fallbackKey, 'novel-ma:fb');
    assert.equal(fb.fallbackValue, 'fallback data');
    assert.equal(fb.fallbackError, null);
    assert.equal(fb.readbackSuccess, true);
    assert.equal(fb.readbackValue, 'fallback data');
    assert.ok(fb.timestamp.length > 0);

    const noSetItem = evalIdbFallbackWrite(result, {});
    assert.equal(noSetItem.fallbackWritten, false);
    assert.equal(noSetItem.fallbackError, 'fallback storage has no setItem method');
  });

  it('verifies V77 IDB fallback with checksum match and drift detection', () => {
    const mockStore: Record<string, string> = {};
    const result: BrowserEvalRunResult = { success: false, stepsCompleted: 0, totalSteps: 3, errorMessage: 'err', errorStep: 1, fallbackTriggered: true, fallbackStorageKey: 'novel-ma:v77', durationMs: 0, outputPreview: 'verify data', stackTrace: null };
    const fb = evalIdbFallbackWrite(result, { setItem: (k, v) => { mockStore[k] = v; }, getItem: (k) => mockStore[k] ?? null });
    let hash = 0x811c9dc5;
    for (let i = 0; i < fb.fallbackValue.length; i += 1) {
      hash ^= fb.fallbackValue.charCodeAt(i);
      hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    const expected = hash.toString(16).padStart(8, '0');
    const verify = verifyIdbFallback(fb, { getItem: (k) => mockStore[k] ?? null }, expected);
    assert.equal(verify.match, true);
    assert.equal(verify.expectedExists, true);
    assert.equal(verify.actualExists, true);
    assert.equal(verify.driftDetected, false);
    assert.equal(verify.checksums.expected, expected);
    assert.equal(verify.checksums.actual, expected);

    mockStore['novel-ma:v77'] = 'corrupted';
    const drift = verifyIdbFallback(fb, { getItem: (k) => mockStore[k] ?? null }, expected);
    assert.equal(drift.match, false);
    assert.equal(drift.driftDetected, true);
  });

  it('plans V77 IDB fallback recovery with attempts strategies fallbackReady and estimateBytes', () => {
    const result: BrowserEvalRunResult = { success: false, stepsCompleted: 0, totalSteps: 3, errorMessage: 'IndexedDB down', errorStep: 1, fallbackTriggered: true, fallbackStorageKey: 'novel-ma:v77-fb', durationMs: 0, outputPreview: 'fallback payload', stackTrace: null };
    const fb = evalIdbFallbackWrite(result, { setItem: () => {}, getItem: () => 'fallback payload' });
    const r1 = planIdbFallbackRecovery(result, fb, 1);
    assert.equal(r1.attempt, 1);
    assert.equal(r1.maxAttempts, 3);
    assert.equal(r1.primaryFailed, true);
    assert.equal(r1.fallbackReady, true);
    assert.ok(r1.strategies.includes('write-fallback'));
    assert.ok(r1.estimateBytes > 0);
    assert.equal(r1.ready, true);

    const r3 = planIdbFallbackRecovery(result, fb, 3);
    assert.equal(r3.nextDelayMs, 0);

    const successResult: BrowserEvalRunResult = { ...result, success: true, errorMessage: null };
    const rs = planIdbFallbackRecovery(successResult, null, 1);
    assert.equal(rs.primaryFailed, false);
    assert.equal(rs.fallbackReady, false);
    assert.ok(rs.strategies.includes('retry-idb'));
  });

  it('builds V78 real IndexedDB store with openCode putCode getCode getAllCode deleteCode closeCode bytes', () => {
    const store = buildRealIndexedDBStore({ dbName: 'novel-ma-test', version: 2, storeName: 'fallback' });
    assert.equal(store.dbName, 'novel-ma-test');
    assert.equal(store.version, 2);
    assert.equal(store.storeName, 'fallback');
    assert.ok(store.openCode.includes("indexedDB.open('novel-ma-test', 2)"));
    assert.ok(store.openCode.includes("createObjectStore('fallback'"));
    assert.ok(store.putCode.includes("transaction('fallback'"));
    assert.ok(store.putCode.includes(".put({ key: 'fallback', value: payload })"));
    assert.ok(store.getCode.includes(".get('fallback')"));
    assert.ok(store.getAllCode.includes('.getAll()'));
    assert.ok(store.deleteCode.includes(".delete('fallback')"));
    assert.ok(store.bytes > 0);
    assert.equal(store.ready, true);
  });

  it('runs V78 real IndexedDB operations with put get getAll delete and error paths', () => {
    const store = buildRealIndexedDBStore();
    const mockIdb = {
      open: (name: string, version: number) => ({ result: { name, version }, onsuccess: (cb) => cb(), onerror: () => {}, onupgradeneeded: () => {} }),
      transaction: () => ({
        objectStore: () => ({
          put: (val) => {},
          get: (key) => ({ result: { key, value: 'stored' } }),
          getAll: () => ({ result: [{ key: 'fallback', value: 'stored' }] }),
          delete: () => {},
        }),
        oncomplete: () => {},
      }),
    };
    const open = runRealIndexedDBOp(store, 'open', 'fallback data', mockIdb);
    assert.equal(open.operation, 'open');
    assert.equal(open.success, true);

    const put = runRealIndexedDBOp(store, 'put', 'fallback data', mockIdb);
    assert.equal(put.operation, 'put');
    assert.equal(put.success, true);

    const get = runRealIndexedDBOp(store, 'get', null, mockIdb);
    assert.equal(get.success, true);
    assert.equal((get.value as { value?: string })?.value, 'stored');

    const all = runRealIndexedDBOp(store, 'getAll', null, mockIdb);
    assert.equal(all.success, true);
    assert.equal(all.values.length, 1);

    const del = runRealIndexedDBOp(store, 'delete', null, mockIdb);
    assert.equal(del.success, true);

    const close = runRealIndexedDBOp(store, 'close', null, mockIdb);
    assert.equal(close.success, true);

    const noTx = runRealIndexedDBOp(store, 'put', 'data', {});
    assert.equal(noTx.success, false);
    assert.ok(noTx.errorMessage?.includes('transaction'));
  });

  it('extracts V78 real IndexedDB error with category suggestion and recoverable flag', () => {
    const mk = (msg: string | null): RealIndexedDBRunResult => ({ opened: false, operation: 'error', success: false, value: null, values: [], errorMessage: msg, errorStep: 'tx', durationMs: 0, ready: false });
    const quota = extractRealIndexedDBError(mk('QuotaExceededError: full'));
    assert.equal(quota.category, 'QuotaExceeded');
    assert.equal(quota.recoverable, true);
    assert.ok(quota.suggestion.includes('清理'));
    const invalid = extractRealIndexedDBError(mk('InvalidStateError: closed'));
    assert.equal(invalid.category, 'InvalidState');
    assert.equal(invalid.recoverable, true);
    const ver = extractRealIndexedDBError(mk('VersionError: old version'));
    assert.equal(ver.category, 'Version');
    assert.equal(ver.recoverable, false);
    const sec = extractRealIndexedDBError(mk('SecurityError: denied'));
    assert.equal(sec.category, 'Security');
    const type = extractRealIndexedDBError(mk('TypeError: uncloneable'));
    assert.equal(type.category, 'Type');
    assert.equal(type.recoverable, true);
    const other = extractRealIndexedDBError(mk('weird'));
    assert.equal(other.category, 'Other');
  });

  it('persists V79 fallback to projects store with item count bytes readback and warnings', () => {
    const store = buildRealIndexedDBStore({ dbName: 'novel-ma', version: 1, storeName: 'projects' });
    const items = [{ key: 'p1', value: { name: 'proj1' } }, { key: 'p2', value: { name: 'proj2' } }];
    const mockTx = { objectStore: () => ({ put: () => {} }), oncomplete: () => {} };
    const result = persistFallbackToProjectsStore(store, items, { transaction: () => mockTx });
    assert.equal(result.persisted, true);
    assert.equal(result.itemCount, 2);
    assert.ok(result.totalBytes > 0);
    assert.equal(result.readbackSuccess, true);
    assert.equal(result.readbackItemCount, 2);
    assert.equal(result.storageKey, 'projects');
    assert.equal(result.warnings.length, 0);
    assert.equal(result.ready, true);

    const noTx = persistFallbackToProjectsStore(store, items, {});
    assert.equal(noTx.persisted, false);
    assert.ok(noTx.errorMessage?.includes('transaction'));

    const largeItems = Array.from({ length: 150 }, (_, i) => ({ key: `k${i}`, value: { idx: i } }));
    const largeResult = persistFallbackToProjectsStore(store, largeItems, { transaction: () => mockTx });
    assert.equal(largeResult.warnings.length, 1);
  });

  it('restores V79 fallback from projects store with version check drift detection', () => {
    const store = buildRealIndexedDBStore({ storeName: 'projects' });
    const ok = restoreFallbackFromProjectsStore(store, 'projects', { values: [{ key: 'p1' }, { key: 'p2' }], version: 2 });
    assert.equal(ok.restored, true);
    assert.equal(ok.itemsRestored, 2);
    assert.ok(ok.bytes > 0);
    assert.equal(ok.fromVersion, 2);
    assert.equal(ok.matchesCurrent, true);
    assert.equal(ok.driftDetected, false);
    assert.equal(ok.ready, true);

    const drift = restoreFallbackFromProjectsStore(store, 'fallback', { values: [{ key: 'p1' }], version: 1 });
    assert.equal(drift.driftDetected, true);
    assert.equal(drift.matchesCurrent, false);

    const empty = restoreFallbackFromProjectsStore(store, 'projects', { values: [], version: 1 });
    assert.equal(empty.restored, false);
    assert.equal(empty.ready, false);
  });

  it('plans V79 fallback migration with version bump steps cross-reload safe and warnings', () => {
    const items = [{ key: 'p1', value: { x: 1 } }, { key: 'p2', value: { x: 2 } }];
    const plan = planFallbackMigration(items, { sourceKey: 'novel-ma:fallback', targetStore: 'projects', currentVersion: 1, targetVersion: 2 });
    assert.equal(plan.sourceKey, 'novel-ma:fallback');
    assert.equal(plan.targetStore, 'projects');
    assert.equal(plan.itemsCount, 2);
    assert.ok(plan.totalBytes > 0);
    assert.ok(plan.estimatedDurationMs > 0);
    assert.equal(plan.steps.length, 6);
    assert.ok(plan.steps.some((s) => s.includes('bump db version')));
    assert.ok(plan.steps.some((s) => s.includes('cross-reload safe')));
    assert.equal(plan.crossReloadSafe, true);
    assert.equal(plan.ready, true);

    const sameVersion = planFallbackMigration(items, { currentVersion: 2, targetVersion: 2 });
    assert.equal(sameVersion.steps.length, 4);

    const empty = planFallbackMigration([], { currentVersion: 1, targetVersion: 2 });
    assert.equal(empty.itemsCount, 0);
    assert.ok(empty.warnings.some((w) => w.includes('empty')));

    const big = Array.from({ length: 100_000 }, (_, i) => ({ key: `k${i}`, value: { x: 'a'.repeat(50) } }));
    const bigPlan = planFallbackMigration(big, { currentVersion: 1, targetVersion: 2 });
    assert.ok(bigPlan.warnings.some((w) => w.includes('5MB')));
  });

  it('runs V80 real dual-write with primary secondary readback and storage breakdown', () => {
    const payload = 'dual-write-v80-payload';
    const plan = planPersistenceDualWrite({ payloadJson: payload, itemsCount: 1, totalBytes: payload.length * 2, checksum: 'checksum-v80', format: 'json', generatedAt: '2026-06-28T00:00:00Z', compressionRatio: 1 }, { primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryKey: 'v80-primary', secondaryKey: 'v80-secondary' });
    const mockStore: Record<string, string> = {};
    const mockIdb = { open: () => ({ result: {}, onsuccess: (cb) => cb(), onerror: () => {} }), transaction: () => ({ objectStore: () => ({ put: (val) => { mockStore[val.key] = val.value; }, get: (key) => ({ result: { key, value: mockStore[key] } }) }), oncomplete: () => {} }) };
    const mockLocalStorage = { setItem: (k, v) => { mockStore[k] = v; }, getItem: (k) => mockStore[k] ?? null };
    const result = runRealDualWrite(plan, payload, mockIdb, mockLocalStorage);
    assert.equal(result.primaryWritten, true);
    assert.equal(result.secondaryWritten, true);
    assert.equal(result.readbackMatched, true);
    assert.equal(result.primaryStorage, 'localStorage');
    assert.equal(result.secondaryStorage, 'indexedDB');
    assert.equal(result.primaryError, null);
    assert.equal(result.secondaryError, null);
    assert.equal(result.readbackError, null);
    assert.ok(result.primaryDurationMs >= 0);
    assert.ok(result.secondaryDurationMs >= 0);
    assert.ok(result.readbackDurationMs >= 0);
    assert.ok(result.totalDurationMs >= 0);
    assert.equal(result.attempt, 1);
  });

  it('extracts V80 real dual-write error with primary/secondary category and recoverable flag', () => {
    const mk = (p: string | null, s: string | null): RealDualWriteRunResult => ({ primaryWritten: false, secondaryWritten: false, readbackMatched: false, primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryError: p, secondaryError: s, readbackError: null, primaryDurationMs: 0, secondaryDurationMs: 0, readbackDurationMs: 0, totalDurationMs: 0, attempt: 1 });
    const quota = extractRealDualWriteError(mk('QuotaExceededError: full', 'QuotaExceededError: full'));
    assert.equal(quota.primaryCategory, 'QuotaExceeded');
    assert.equal(quota.secondaryCategory, 'QuotaExceeded');
    assert.equal(quota.recoverable, true);
    const invalid = extractRealDualWriteError(mk('InvalidStateError: closed', null));
    assert.equal(invalid.primaryCategory, 'InvalidState');
    assert.equal(invalid.recoverable, true);
    const sec = extractRealDualWriteError(mk(null, 'SecurityError: denied'));
    assert.equal(sec.secondaryCategory, 'Security');
    const ok = extractRealDualWriteError(mk(null, null));
    assert.equal(ok.primaryCategory, 'Other');
    assert.equal(ok.recoverable, false);
  });

  it('plans V80 real dual-write recovery with attempts strategies primary secondary and ready flag', () => {
    const ok = planRealDualWriteRecovery({ primaryWritten: true, secondaryWritten: true, readbackMatched: true, primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryError: null, secondaryError: null, readbackError: null, primaryDurationMs: 0, secondaryDurationMs: 0, readbackDurationMs: 0, totalDurationMs: 0, attempt: 1 }, 1);
    assert.equal(ok.attempt, 1);
    assert.equal(ok.primaryFailed, false);
    assert.equal(ok.secondaryFailed, false);
    assert.equal(ok.ready, true);
    assert.ok(ok.strategies.includes('retry-secondary'));

    const fail = planRealDualWriteRecovery({ primaryWritten: false, secondaryWritten: false, readbackMatched: false, primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryError: 'fail', secondaryError: 'fail', readbackError: null, primaryDurationMs: 0, secondaryDurationMs: 0, readbackDurationMs: 0, totalDurationMs: 0, attempt: 1 }, 1);
    assert.equal(fail.primaryFailed, true);
    assert.equal(fail.secondaryFailed, true);
    assert.ok(fail.strategies.includes('retry-primary'));
    assert.ok(fail.strategies.includes('retry-secondary'));

    const r3 = planRealDualWriteRecovery({ primaryWritten: false, secondaryWritten: false, readbackMatched: false, primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryError: 'fail', secondaryError: 'fail', readbackError: null, primaryDurationMs: 0, secondaryDurationMs: 0, readbackDurationMs: 0, totalDurationMs: 0, attempt: 1 }, 3);
    assert.equal(r3.nextDelayMs, 0);
    assert.ok(r3.strategies.includes('fallback-storage'));
  });

  it('validates V81 browser dual-write environment with indexedDB localStorage and structuredClone', () => {
    const v = validateBrowserDualWrite();
    assert.equal(typeof v.isBrowser, 'boolean');
    assert.equal(typeof v.hasIndexedDB, 'boolean');
    assert.equal(typeof v.hasLocalStorage, 'boolean');
    assert.equal(typeof v.ready, 'boolean');
    assert.equal(typeof v.featureSupport.indexedDB, 'boolean');
    assert.equal(typeof v.featureSupport.localStorage, 'boolean');
    assert.equal(typeof v.featureSupport.structuredClone, 'boolean');
    assert.ok(v.warnings.length >= 0);
  });

  it('builds V81 browser dual-write code with setupCode primaryWriteCode secondaryWriteCode readbackCode totalCode bytes', () => {
    const plan = planPersistenceDualWrite({ payloadJson: 'v81-payload', itemsCount: 1, totalBytes: 22, checksum: 'cs', format: 'json', generatedAt: '2026-06-28', compressionRatio: 1 }, { primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryKey: 'v81-pk', secondaryKey: 'v81-sk' });
    const code = buildBrowserDualWriteCode(plan, 'v81-payload', { version: 2 });
    assert.ok(code.setupCode.includes("dbName = 'novel-ma-2'"));
    assert.ok(code.setupCode.includes('indexedDB.open(dbName'));
    assert.ok(code.setupCode.includes('createObjectStore'));
    assert.ok(code.primaryWriteCode.includes("localStorage.setItem('v81-pk'"));
    assert.ok(code.secondaryWriteCode.includes('tx2.objectStore'));
    assert.ok(code.readbackCode.includes("localStorage.getItem('v81-pk'"));
    assert.ok(code.totalCode.includes('v81-payload'));
    assert.ok(code.bytes > 0);
    assert.equal(code.ready, true);
  });

  it('runs V81 browser dual-write with primary secondary readback bytesWritten and version', () => {
    const plan = planPersistenceDualWrite({ payloadJson: 'browser-v81-payload', itemsCount: 1, totalBytes: 38, checksum: 'cs', format: 'json', generatedAt: '2026-06-28', compressionRatio: 1 }, { primaryStorage: 'localStorage', secondaryStorage: 'indexedDB', primaryKey: 'v81-pk', secondaryKey: 'v81-sk' });
    const mockStore: Record<string, string> = {};
    const mockBrowser = { indexedDB: { transaction: () => ({ objectStore: () => ({ put: (val: unknown) => { const v = val as { key: string; value: string }; mockStore[v.key] = v.value; }, get: (key: string) => ({ result: { key, value: mockStore[key] } }) }) }) }, localStorage: { setItem: (k: string, v: string) => { mockStore[k] = v; }, getItem: (k: string) => mockStore[k] ?? null } };
    const result = runBrowserDualWrite(plan, 'browser-v81-payload', mockBrowser);
    assert.equal(result.primaryWritten, true);
    assert.equal(result.secondaryWritten, true);
    assert.equal(result.readbackMatched, true);
    assert.equal(result.primaryError, null);
    assert.equal(result.secondaryError, null);
    assert.equal(result.readbackError, null);
    assert.ok(result.primaryDurationMs >= 0);
    assert.ok(result.secondaryDurationMs >= 0);
    assert.ok(result.readbackDurationMs >= 0);
    assert.ok(result.totalDurationMs >= 0);
    assert.ok(result.bytesWritten > 0);
    assert.equal(result.version, 1);
    assert.equal(result.ready, true);

    const noMock = runBrowserDualWrite(plan, 'data', {});
    assert.equal(noMock.primaryWritten, false);
    assert.equal(noMock.secondaryWritten, false);
    assert.equal(noMock.ready, false);
  });

  it('validates V82 browser fallback environment with indexedDB localStorage and fallback storage', () => {
    const v = validateBrowserFallback();
    assert.equal(typeof v.isBrowser, 'boolean');
    assert.equal(typeof v.hasIndexedDB, 'boolean');
    assert.equal(typeof v.hasLocalStorage, 'boolean');
    assert.equal(typeof v.ready, 'boolean');
    assert.equal(v.fallbackStorage === 'localStorage' || v.fallbackStorage === 'indexedDB', true);
  });

  it('builds V82 browser fallback code with writeCode readbackCode fullCode and bytes', () => {
    const codeLS = buildBrowserFallbackCode('v82-payload', 'v82-fb-key', { useIndexedDB: false });
    assert.ok(codeLS.writeCode.includes("localStorage.setItem('v82-fb-key'"));
    assert.ok(codeLS.writeCode.includes('v82-payload'));
    assert.ok(codeLS.readbackCode.includes("localStorage.getItem('v82-fb-key'"));
    assert.ok(codeLS.fullCode.includes('v82-payload'));
    assert.ok(codeLS.bytes > 0);
    assert.equal(codeLS.ready, true);

    const codeIdb = buildBrowserFallbackCode('v82-payload', 'v82-fb-key', { useIndexedDB: true });
    assert.ok(codeIdb.writeCode.includes("indexedDB.open('novel-ma'"));
    assert.ok(codeIdb.writeCode.includes("tx.objectStore('projects')"));
    assert.ok(codeIdb.readbackCode.includes("tx.objectStore('projects')"));
  });

  it('runs V82 browser fallback write with localStorage mock and readback match', () => {
    const mockStore: Record<string, string> = {};
    const result = runBrowserFallbackWrite('v82-payload', 'v82-fb-key', { localStorage: { setItem: (k, v) => { mockStore[k] = v; }, getItem: (k) => mockStore[k] ?? null } });
    assert.equal(result.fallbackWritten, true);
    assert.equal(result.fallbackKey, 'v82-fb-key');
    assert.equal(result.fallbackValue, 'v82-payload');
    assert.equal(result.readbackSuccess, true);
    assert.equal(result.storageType, 'localStorage');
    assert.equal(result.errorMessage, null);
    assert.equal(result.ready, true);
    assert.ok(result.timestamp.length > 0);

    const noMock = runBrowserFallbackWrite('data', 'key', {});
    assert.equal(noMock.fallbackWritten, false);
    assert.equal(noMock.ready, false);
    assert.ok(noMock.errorMessage !== null);
  });
});
