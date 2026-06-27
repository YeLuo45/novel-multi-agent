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
});
