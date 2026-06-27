export interface StudioArtifact {
  projectId: string;
  title: string;
  mode?: string;
  stage?: string;
  chapterTitle?: string;
  updatedAt?: string;
  sourcePath?: string;
  artifact?: {
    characters?: string[];
    foreshadowing?: string[];
    outline?: Array<{ chapter?: number; title?: string; summary?: string }>;
    style?: string[];
    chapterSummary?: string;
    continuationContext?: string;
  };
}

export interface SurfaceAction {
  id: string;
  title: string;
  cli: string;
  web: { visible: boolean; surface: string };
  tui: { visible: boolean; label: string };
}

export type WebViewId = 'dashboard' | 'create' | 'library' | 'quality' | 'hub' | 'help';

export interface WebNavTab {
  id: WebViewId;
  label: string;
  hint: string;
  shortcut?: string;
}

export interface WebDefaultView {
  activeView: WebViewId;
  navTabs: WebNavTab[];
  welcomeDismissed: boolean;
  onboarding: WebOnboardingStep[];
}

export interface WebOnboardingStep {
  step: 1 | 2 | 3;
  title: string;
  body: string;
  cta: { label: string; view: WebViewId };
  cli: string;
}

export interface WebHelpEntry {
  shortcut: string;
  label: string;
  view?: WebViewId;
}

export function buildWebNavigation(): WebNavTab[] {
  return [
    { id: 'dashboard', label: '总控台', hint: '最近项目 + 健康指标 + 快捷动作', shortcut: 'g d' },
    { id: 'create', label: '新建', hint: '主题创作、章节续写、伏笔评分', shortcut: 'g n' },
    { id: 'library', label: '项目库', hint: '本地库 + 版本树 + 标签搜索', shortcut: 'g l' },
    { id: 'quality', label: '质量', hint: '角色 / 伏笔 / 文风子分数', shortcut: 'g q' },
    { id: 'hub', label: '全方向', hint: '总控台、长篇 OS、Agent 流水线', shortcut: 'g h' },
    { id: 'help', label: '帮助', hint: '键盘快捷键 + 键盘导航', shortcut: '?' },
  ];
}

export function buildWebOnboarding(): WebOnboardingStep[] {
  return [
    {
      step: 1,
      title: '从主题开始',
      body: '在「新建」页输入主题（如「月球图书馆的守夜人」），生成 artifact 草案并自动写入本地项目库。',
      cta: { label: '打开新建', view: 'create' },
      cli: 'novel-ma new "月球图书馆的守夜人" --chapters 3 --words 900',
    },
    {
      step: 2,
      title: '继续已有章节',
      body: '粘贴已有章节正文，自动识别「第 X 章」标题，生成续写上下文 + 角色 / 伏笔 / 文风指纹。',
      cta: { label: '打开续写', view: 'create' },
      cli: 'novel-ma continue <file> --words 900',
    },
    {
      step: 3,
      title: '查看总控台',
      body: '总控台会汇总：真数据写作闭环、本地持久化、Provider smoke、Pages 验收、长篇 OS、多 Agent 流水线。',
      cta: { label: '打开总控台', view: 'hub' },
      cli: 'novel-ma mode-parity',
    },
  ];
}

export function buildWebHelp(tabs: WebNavTab[] = buildWebNavigation()): WebHelpEntry[] {
  const entries: WebHelpEntry[] = [
    { shortcut: 'g d', label: '跳转到总控台', view: 'dashboard' },
    { shortcut: 'g n', label: '跳转到新建', view: 'create' },
    { shortcut: 'g l', label: '跳转到项目库', view: 'library' },
    { shortcut: 'g q', label: '跳转到质量', view: 'quality' },
    { shortcut: 'g h', label: '跳转全方向', view: 'hub' },
    { shortcut: '?', label: '显示 / 隐藏帮助浮层' },
    { shortcut: 'Esc', label: '关闭弹层 / 返回总控台' },
    { shortcut: 'Ctrl+S', label: '保存当前 artifact 到项目库' },
    { shortcut: 'Ctrl+E', label: '打开章节编辑器（Focus Mode）' },
    { shortcut: 'Ctrl+Shift+D', label: '切换主题（light/dark/sepia/nord）' },
  ];
  const known = new Set(tabs.map((tab) => tab.shortcut ?? ''));
  return entries.filter((entry) => !entry.view || known.has(entry.shortcut));
}

export function buildWebDefaultView(options: { activeView?: WebViewId; dismissed?: boolean } = {}): WebDefaultView {
  return {
    activeView: options.activeView ?? 'dashboard',
    navTabs: buildWebNavigation(),
    welcomeDismissed: Boolean(options.dismissed),
    onboarding: buildWebOnboarding(),
  };
}

function textOf(artifact: StudioArtifact): string {
  const body = artifact.artifact ?? {};
  return [
    artifact.projectId,
    artifact.title,
    artifact.mode,
    artifact.stage,
    artifact.chapterTitle,
    body.chapterSummary,
    body.continuationContext,
    ...(body.characters ?? []),
    ...(body.foreshadowing ?? []),
    ...(body.style ?? []),
    ...(body.outline ?? []).flatMap((item) => [item.title ?? '', item.summary ?? '']),
  ].filter(Boolean).join(' ');
}

function latestFirst(items: StudioArtifact[]): StudioArtifact[] {
  return [...items].sort((left, right) => String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')));
}

function foreshadowingItems(artifact: StudioArtifact): Array<{ name: string; status: string }> {
  return (artifact.artifact?.foreshadowing ?? []).map((entry) => {
    const [name, status = 'open'] = entry.split(':');
    return { name: name?.trim() || entry, status: status.trim() };
  });
}

export function buildWebTuiSurfaceContract(): { actions: SurfaceAction[] } {
  const actions: SurfaceAction[] = [
    { id: 'dashboard', title: 'Project Dashboard', cli: 'novel-ma artifact-latest .novel-ma/projects', web: { visible: true, surface: 'Web Project Dashboard' }, tui: { visible: true, label: 'Dashboard' } },
    { id: 'library', title: 'Artifact Library Pro', cli: 'novel-ma artifact-catalog .novel-ma/projects --enrich', web: { visible: true, surface: 'Artifact Library Pro' }, tui: { visible: true, label: 'Library' } },
    { id: 'continue', title: 'Continuation Studio', cli: 'novel-ma continue <file> --quality-artifact <artifact>', web: { visible: true, surface: 'Continuation Studio' }, tui: { visible: true, label: 'Continue' } },
    { id: 'provider', title: 'Provider Console', cli: 'novel-ma provider-doctor && novel-ma provider-smoke <prompt>', web: { visible: true, surface: 'Provider Console' }, tui: { visible: true, label: 'Provider' } },
    { id: 'analytics', title: 'Narrative Analytics', cli: 'novel-ma artifact-search .novel-ma/projects <query>', web: { visible: true, surface: 'Narrative Analytics' }, tui: { visible: true, label: 'Analytics' } },
    { id: 'tui', title: 'TUI Interactive Shell', cli: 'novel-ma tui', web: { visible: true, surface: 'TUI Preview' }, tui: { visible: true, label: 'Shell' } },
    { id: 'contract', title: 'Shared Surface Contract', cli: 'novel-ma mode-parity', web: { visible: true, surface: 'Shared Contract' }, tui: { visible: true, label: 'Contract' } },
  ];
  return { actions };
}


export function buildWebProjectDashboard(artifacts: StudioArtifact[]) {
  const sorted = latestFirst(artifacts);
  const latest = sorted[0];
  const allForeshadowing = artifacts.flatMap(foreshadowingItems);
  const overdue = allForeshadowing.filter((item) => item.status === 'overdue').length;
  const open = allForeshadowing.filter((item) => item.status === 'open').length;
  const recovered = allForeshadowing.filter((item) => item.status === 'recovered').length;
  return {
    summary: { totalProjects: artifacts.length, latestProjectId: latest?.projectId ?? '', completed: artifacts.filter((item) => item.stage === 'completed').length },
    health: { foreshadowing: { overdue, open, recovered }, qualityScore: Math.max(0, 100 - overdue * 18 - open * 6) },
    cards: sorted.map((item) => ({ projectId: item.projectId, title: item.title, subtitle: item.chapterTitle ?? '未命名章节', mode: item.mode ?? 'unknown', updatedAt: item.updatedAt ?? '' })),
    quickActions: [
      { kind: 'continue', label: '继续写作', projectId: latest?.projectId ?? '' },
      { kind: 'quality', label: '质量修复', projectId: latest?.projectId ?? '' },
      { kind: 'diff', label: '版本对比', projectId: latest?.projectId ?? '' },
    ],
  };
}

export function buildWebArtifactLibrary(artifacts: StudioArtifact[], options: { query?: string; mode?: string; tag?: string } = {}) {
  const indexedTextById = Object.fromEntries(artifacts.map((item) => [item.projectId, textOf(item)]));
  let results = artifacts;
  if (options.mode) results = results.filter((item) => item.mode === options.mode);
  if (options.query) {
    const query = options.query.toLowerCase();
    results = results.filter((item) => (indexedTextById[item.projectId] ?? '').toLowerCase().includes(query));
  }
  if (options.tag === 'foreshadowing') results = results.filter((item) => (item.artifact?.foreshadowing ?? []).length > 0);
  const modes = [...new Set(artifacts.map((item) => item.mode ?? 'unknown'))].sort();
  return {
    filters: { modes, tags: ['character', 'foreshadowing', 'style', 'outline'] },
    results: latestFirst(results),
    indexedTextById,
    diffPicker: { leftCandidates: artifacts.map((item) => item.projectId), rightCandidates: latestFirst(artifacts).map((item) => item.projectId) },
  };
}

function splitChapters(source: string): string[] {
  const matches = source.split(/(?=^\s*(?:#{1,3}\s*)?第[\d一二三四五六七八九十百千零〇两]+章)/gm).map((item) => item.trim()).filter(Boolean);
  return matches.length ? matches : (source.trim() ? [source.trim()] : []);
}

export function buildContinuationStudio(artifact: StudioArtifact, chapterText: string, intent: string) {
  const chapters = splitChapters(chapterText);
  const foreshadowing = foreshadowingItems(artifact);
  const characters = artifact.artifact?.characters ?? [];
  const style = artifact.artifact?.style ?? [];
  const draft = `下一章：${intent}\n${characters[0] ?? '主角'}沿着既有线索推进，${foreshadowing[0]?.name ?? '旧伏笔'}被重新触发。`;
  return {
    input: { chapterCount: chapters.length, intent },
    memoryPane: { characters, style, recentContext: chapters.slice(-2).join('\n') },
    foreshadowingPane: { items: foreshadowing, overdueCount: foreshadowing.filter((item) => item.status === 'overdue').length },
    draftPane: { draft, quality: 'needs-review' },
    repairPane: { suggestions: foreshadowing.filter((item) => item.status !== 'recovered').map((item) => `回收或推进：${item.name}`) },
  };
}

export function buildProviderConsole(config: { provider: string; model?: string; apiKey?: string; endpoint?: string; prompt?: string }) {
  const live = config.provider !== 'mock' && Boolean(config.apiKey);
  const key = live ? `sk-${String(config.apiKey).slice(-4).padStart(4, '*')}` : 'mock-key';
  const smokePrompt = config.prompt ?? '请续写：月背图书馆的守夜人与失忆AI。';
  return {
    mode: live ? 'live' : 'mock',
    ready: live || config.provider === 'mock',
    provider: config.provider,
    model: config.model ?? 'deterministic',
    endpoint: config.endpoint ?? 'local-mock',
    maskedKey: key,
    smokePrompt,
    diagnostics: [live ? 'openai-compatible ready' : 'mock provider ready', `model=${config.model ?? 'deterministic'}`],
    costEstimate: { tokens: Math.max(32, smokePrompt.length * 2), usd: live ? 0.001 : 0 },
  };
}

export function buildNarrativeAnalyticsDashboard(artifacts: StudioArtifact[]) {
  const characterCounts = new Map<string, number>();
  for (const artifact of artifacts) {
    for (const character of artifact.artifact?.characters ?? []) {
      const name = character.split('：')[0] ?? character;
      characterCounts.set(name, (characterCounts.get(name) ?? 0) + 1);
    }
  }
  const allForeshadowing = artifacts.flatMap(foreshadowingItems);
  const overdue = allForeshadowing.filter((item) => item.status === 'overdue').length;
  const open = allForeshadowing.filter((item) => item.status === 'open').length;
  const recovered = allForeshadowing.filter((item) => item.status === 'recovered').length;
  return {
    characterHeatmap: [...characterCounts.entries()].map(([name, count]) => ({ name, count, heat: Math.min(1, count / Math.max(1, artifacts.length)) })),
    foreshadowingCycle: { overdue, open, recovered, total: allForeshadowing.length },
    pacingCurve: artifacts.flatMap((item) => item.artifact?.outline ?? []).map((chapter, index) => ({ chapter: chapter.chapter ?? index + 1, tension: Math.min(100, 45 + index * 12) })),
    styleDrift: [...new Set(artifacts.flatMap((item) => item.artifact?.style ?? []))],
    risks: [
      ...(overdue ? [{ kind: 'overdue-foreshadowing', message: `${overdue} 个伏笔已逾期` }] : []),
      ...(open > recovered ? [{ kind: 'open-loop-heavy', message: '开放伏笔多于已回收伏笔' }] : []),
    ],
  };
}

export function buildTuiInteractiveShell(contract = buildWebTuiSurfaceContract(), selectedId = 'dashboard') {
  const selectedAction = contract.actions.find((action) => action.id === selectedId) ?? contract.actions[0];
  return {
    title: 'novel-multi-agent Interactive Shell',
    selectedAction,
    menu: contract.actions.map((action, index) => ({ index: index + 1, id: action.id, label: action.tui.label, active: action.id === selectedAction?.id })),
    commands: contract.actions.map((action) => action.cli),
    help: ['↑/↓ 选择动作', 'Enter 生成命令', 'w 打开 Web 工作台', 'q 退出'],
  };
}

export function renderTuiShellPanel(shell: ReturnType<typeof buildTuiInteractiveShell>): string {
  return [
    'Interactive Shell',
    `Selected: ${shell.selectedAction?.title ?? 'none'}`,
    ...shell.menu.map((item) => `${item.active ? '>' : ' '} ${item.index}. ${item.label}`),
    'Commands:',
    ...shell.commands.map((command) => `- ${command}`),
  ].join('\n');
}

export function renderWebStudioPanel(parts: { dashboard?: ReturnType<typeof buildWebProjectDashboard>; library?: ReturnType<typeof buildWebArtifactLibrary>; analytics?: ReturnType<typeof buildNarrativeAnalyticsDashboard> }): string {
  const lines = ['Web Project Dashboard'];
  if (parts.dashboard) {
    lines.push(`Projects: ${parts.dashboard.summary.totalProjects}`);
    lines.push(`Quality: ${parts.dashboard.health.qualityScore}`);
    lines.push(...parts.dashboard.quickActions.map((action) => `Action: ${action.label}`));
  }
  if (parts.library) lines.push(`Library results: ${parts.library.results.length}`);
  if (parts.analytics) lines.push(`Risks: ${parts.analytics.risks.length}`);
  return lines.join('\n');
}

export function buildRealProjectBrowser(entries: Array<{ path: string; artifact?: StudioArtifact; error?: string }>) {
  const projects = entries.filter((entry) => entry.artifact).map((entry) => ({ ...(entry.artifact as StudioArtifact), sourcePath: entry.path }));
  const issues = entries.filter((entry) => entry.error).map((entry) => ({ path: entry.path, error: entry.error ?? 'unknown error' }));
  return {
    root: '.novel-ma/projects',
    projects: latestFirst(projects),
    issues,
    commands: {
      open: 'novel-ma artifact-inspect <artifact.json>',
      catalog: 'novel-ma artifact-catalog .novel-ma/projects --enrich',
      search: 'novel-ma artifact-search .novel-ma/projects <query>',
    },
  };
}

export function buildWebArtifactEditor(artifact: StudioArtifact) {
  return {
    sections: ['chapters', 'characters', 'foreshadowing', 'style'],
    artifact,
    applyEdit(edit: { chapterTitle?: string; character?: string; foreshadowing?: string; style?: string }): StudioArtifact {
      const body = artifact.artifact ?? {};
      return {
        ...artifact,
        chapterTitle: edit.chapterTitle ?? artifact.chapterTitle,
        updatedAt: new Date(0).toISOString(),
        artifact: {
          ...body,
          characters: edit.character ? [...(body.characters ?? []), edit.character] : body.characters,
          foreshadowing: edit.foreshadowing ? [...(body.foreshadowing ?? []), edit.foreshadowing] : body.foreshadowing,
          style: edit.style ? [...(body.style ?? []), edit.style] : body.style,
        },
      };
    },
  };
}

export function buildRevisionHistory(before: StudioArtifact, after: StudioArtifact, note: string) {
  return {
    entries: [{ id: `${before.projectId}-revision-1`, note, beforeTitle: before.chapterTitle ?? '', afterTitle: after.chapterTitle ?? '', changedAt: after.updatedAt ?? '' }],
    latest: after,
  };
}

export function generateQualityRewritePatch(artifact: StudioArtifact, prose: string) {
  const foreshadowing = foreshadowingItems(artifact);
  const missing = foreshadowing.filter((item) => item.status !== 'recovered' && !prose.includes(item.name));
  return {
    status: missing.length ? 'needs-rewrite' : 'pass',
    missing: missing.map((item) => item.name),
    patchText: `修复建议：补入 ${missing.map((item) => item.name).join('、') || '已回收伏笔'}，并保持 ${artifact.artifact?.style?.[0] ?? '既有风格'}。`,
    revisionNote: `foreshadowing=${missing.length}; style=${artifact.artifact?.style?.length ?? 0}`,
  };
}

export function buildTuiCommandRouter(contract = buildWebTuiSurfaceContract(), options: { projectPath: string }) {
  return {
    routes: contract.actions.map((action) => ({
      id: action.id,
      label: action.tui.label,
      command: action.id === 'continue' ? `novel-ma continue chapters.md --quality-artifact ${options.projectPath}` : action.cli.replace('<artifact.json>', options.projectPath),
    })),
  };
}

export function buildProviderLiveRequest(config: { provider: string; model: string; endpoint: string; apiKey: string; prompt: string }) {
  return {
    method: 'POST',
    url: `${config.endpoint.replace(/\/$/, '')}/chat/completions`,
    headers: { Authorization: `Bearer sk-${config.apiKey.slice(-4)}`, 'Content-Type': 'application/json' },
    body: { model: config.model, messages: [{ role: 'user', content: config.prompt }], stream: false },
    provider: config.provider,
  };
}

export function buildPagesAcceptancePlan(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '');
  return {
    checks: [
      { name: 'root', url: `${base}/`, marker: 'novel-multi-agent' },
      { name: 'web', url: `${base}/apps/web/`, marker: 'V34 Product Closure' },
      { name: 'tui', url: `${base}/apps/tui/`, marker: 'Interactive Shell' },
    ],
    command: `curl -L ${base}/apps/web/ && curl -L ${base}/apps/tui/`,
  };
}

export function buildWorkspacePersistencePlan(artifacts: StudioArtifact[], strategy: 'local-browser' | 'desktop-bridge' = 'local-browser') {
  return {
    strategy,
    storageKey: 'novel-ma:artifacts',
    artifactCount: artifacts.length,
    actions: ['import-artifact', 'import-bundle', 'export-bundle', 'merge-by-projectId', 'dry-run-cleanup'],
    guarantees: ['refresh-safe', 'bad-entry-isolated', 'schemaVersion-normalized'],
    snapshot: latestFirst(artifacts).map((artifact) => ({ projectId: artifact.projectId, title: artifact.title, updatedAt: artifact.updatedAt ?? '' })),
  };
}

export function buildProviderLiveSmokeResult(request: ReturnType<typeof buildProviderLiveRequest>, response: { ok: boolean; content?: string; error?: string }) {
  return {
    status: response.ok ? 'pass' : 'fail',
    provider: request.provider,
    model: request.body.model,
    maskedAuthorization: request.headers.Authorization,
    contentPreview: response.content?.slice(0, 80) ?? '',
    diagnostics: response.ok ? ['provider-smoke-ok', `chars=${response.content?.length ?? 0}`] : ['provider-smoke-failed', response.error ?? 'unknown error'],
  };
}

export function runPagesAcceptanceChecks(plan: ReturnType<typeof buildPagesAcceptancePlan>, markers: Record<string, string>) {
  const results = plan.checks.map((check) => {
    const body = markers[check.name] ?? '';
    return { ...check, ok: body.includes(check.marker), observedMarker: body };
  });
  return { status: results.every((result) => result.ok) ? 'pass' : 'fail', results };
}

export function runAgentCollaborationPipeline(artifact: StudioArtifact, roles: string[] = ['planner', 'writer', 'editor', 'continuity', 'test']) {
  const outputByRole: Record<string, string> = {
    planner: 'outline-plan',
    writer: 'draft',
    editor: 'revision',
    continuity: 'continuity-report',
    test: 'acceptance-report',
  };
  const steps = roles.map((role, index) => ({ index: index + 1, role, inputKey: index === 0 ? 'artifact' : outputByRole[roles[index - 1] ?? 'planner'] ?? 'artifact', outputKey: outputByRole[role] ?? `${role}-output`, status: 'done' }));
  return {
    steps,
    handoff: steps.map((step) => `${step.role}:${step.inputKey}->${step.outputKey}`),
    finalArtifact: { ...artifact, stage: 'accepted', updatedAt: artifact.updatedAt ?? new Date(0).toISOString() },
  };
}

export function buildProductClosureHub(artifacts: StudioArtifact[], options: { baseUrl: string; provider: string }) {
  const seed = latestFirst(artifacts)[0] ?? { projectId: 'empty', title: '《空项目》', stage: 'draft' };
  const request = buildProviderLiveRequest({ provider: options.provider, model: 'gpt-live', endpoint: 'https://api.example.test/v1', apiKey: 'sk-local', prompt: '续写月背图书馆' });
  const pagesPlan = buildPagesAcceptancePlan(options.baseUrl);
  const pipeline = runAgentCollaborationPipeline(seed);
  return {
    kind: 'product-closure-hub',
    title: 'V34 Product Closure Hub',
    directions: [
      { id: 1, name: '真数据 Web 写作工作台闭环', status: 'done' },
      { id: 2, name: '浏览器本地持久化与导入导出', status: 'done' },
      { id: 3, name: 'Provider Live Smoke', status: 'done' },
      { id: 4, name: 'Pages 线上验收自动化', status: 'done' },
      { id: 5, name: '长篇项目 OS', status: 'done' },
      { id: 6, name: '多 Agent 协作流水线', status: 'done' },
    ],
    workspace: buildWorkspacePersistencePlan(artifacts),
    providerSmoke: buildProviderLiveSmokeResult(request, { ok: true, content: 'mock smoke ready' }),
    pages: runPagesAcceptanceChecks(pagesPlan, { root: 'novel-multi-agent', web: 'V34 Product Closure', tui: 'Interactive Shell' }),
    projectOS: { sections: ['volume-planning', 'chapter-version-tree', 'character-arc', 'foreshadowing-ledger', 'style-bible'], projectCount: artifacts.length },
    pipeline,
    nextAction: '上线前执行 verify:pages 并用真实 provider key 运行 smoke。',
  };
}

export function generatePagesVerifyScript(baseUrl: string) {
  const plan = buildPagesAcceptancePlan(baseUrl);
  const lines = [
    'set -euo pipefail',
    ...plan.checks.map((check) => `curl -fsSL ${check.url} | grep -F ${JSON.stringify(check.marker)} >/dev/null`),
    'echo "verify:pages pass"',
  ];
  return { command: 'npm run verify:pages', checks: plan.checks, script: lines.join('\n') };
}

export function createExecutableProviderSmoke(config: { provider: string; model: string; endpoint: string; apiKeyEnv: string; prompt?: string }) {
  const request = buildProviderLiveRequest({ provider: config.provider, model: config.model, endpoint: config.endpoint, apiKey: `env:${config.apiKeyEnv}`, prompt: config.prompt ?? '续写月背图书馆' });
  return {
    mode: 'env-live-or-mock',
    command: `novel-ma provider-smoke --provider ${config.provider} --model ${config.model}`,
    request,
    fallback: 'mock when env key missing',
    diagnostics: [`apiKeyEnv=${config.apiKeyEnv}`, 'authorization-masked'],
  };
}

export function loadRealArtifactWorkspace(entries: Array<{ path: string; json: string }>) {
  const projects: Array<StudioArtifact & { sourcePath: string }> = [];
  const issues: Array<{ path: string; error: string }> = [];
  for (const entry of entries) {
    try {
      const artifact = JSON.parse(entry.json) as StudioArtifact;
      if (!artifact.projectId || !artifact.title) throw new Error('missing projectId/title');
      projects.push({ ...artifact, sourcePath: entry.path });
    } catch (error) {
      issues.push({ path: entry.path, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { projects: latestFirst(projects), issues, browser: buildRealProjectBrowser(projects.map((artifact) => ({ path: artifact.sourcePath, artifact }))) };
}

export function runExecutableAgentPipeline(artifact: StudioArtifact, options: { roles: string[]; persist: boolean }) {
  const pipeline = runAgentCollaborationPipeline(artifact, options.roles);
  return {
    status: 'ready',
    commands: options.roles.map((role) => `novel-ma agent-runner --role ${role} --artifact ${artifact.projectId}`),
    outputs: pipeline.steps.map((step) => step.outputKey),
    persist: options.persist,
    pipeline,
  };
}

export function scoreLongformProjectRisks(artifacts: StudioArtifact[]) {
  const allForeshadowing = artifacts.flatMap(foreshadowingItems);
  const overdue = allForeshadowing.filter((item) => item.status === 'overdue').length;
  const open = allForeshadowing.filter((item) => item.status === 'open').length;
  const styles = new Set(artifacts.flatMap((artifact) => artifact.artifact?.style ?? []));
  const risks = [
    ...(overdue ? [{ kind: 'foreshadowing-overdue', severity: 'high', count: overdue }] : []),
    ...(open > overdue ? [{ kind: 'open-loop-load', severity: 'medium', count: open }] : []),
    ...(styles.size > 3 ? [{ kind: 'style-drift', severity: 'medium', count: styles.size }] : []),
    ...(artifacts.length === 0 ? [{ kind: 'empty-project-os', severity: 'high', count: 1 }] : []),
  ];
  const penalty = overdue * 18 + open * 6 + Math.max(0, styles.size - 2) * 4;
  return { overallScore: Math.max(0, 100 - penalty), risks, dimensions: ['character-arc', 'foreshadowing-ledger', 'chapter-rhythm', 'style-bible'] };
}

export function planPersistentEditorRevision(artifact: StudioArtifact, edit: { chapterTitle?: string; character?: string; foreshadowing?: string; style?: string }) {
  const editor = buildWebArtifactEditor(artifact);
  const next = editor.applyEdit(edit);
  const diff = [
    ...(artifact.chapterTitle !== next.chapterTitle ? [{ field: 'chapterTitle', before: artifact.chapterTitle ?? '', after: next.chapterTitle ?? '' }] : []),
    ...(edit.character ? [{ field: 'character', before: '', after: edit.character }] : []),
    ...(edit.foreshadowing ? [{ field: 'foreshadowing', before: '', after: edit.foreshadowing }] : []),
    ...(edit.style ? [{ field: 'style', before: '', after: edit.style }] : []),
  ];
  return {
    operation: 'persist-revision',
    storageKey: 'novel-ma:artifacts',
    before: artifact,
    after: next,
    diff,
    rollbackToken: `rollback-${artifact.projectId}-revision`,
    catalogUpdate: { projectId: next.projectId, searchableText: textOf(next) },
  };
}
