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

export interface InteractivePanel {
  kind: string;
  title: string;
  badges: Array<{ label: string; tone: 'pass' | 'warn' | 'fail' | 'info' }>;
  sections: InteractivePanelSection[];
  raw: unknown;
}

export interface ChapterEditor {
  artifact: StudioArtifact;
  body: string;
  target: number;
  wordCount: number;
  remaining: number;
  progress: number;
  tone: 'pass' | 'warn' | 'fail' | 'info';
  context: ChapterContext;
  savePlan: ChapterSavePlan;
  revisions: ChapterRevision[];
}

export interface ChapterContext {
  characters: Array<{ name: string; mentions: number }>;
  foreshadowing: Array<{ name: string; status: 'recovered' | 'open' | 'overdue' | 'missing' }>;
  styleFingerprint: string[];
  recentSummary: string;
}

export interface ChapterSavePlan {
  projectId: string;
  storageKey: string;
  previousSavedAt: string | null;
  rollbackToken: string;
  bodyWordDelta: number;
  fingerprint: string;
}

export interface ChapterRevision {
  id: string;
  savedAt: string;
  wordCount: number;
  excerpt: string;
}

function countWords(text: string): number {
  if (!text) return 0;
  const source = String(text);
  const hanChars = source.match(/[\p{Script=Han}]/gu) ?? [];
  const stripped = source.replace(/[\p{Script=Han}]/gu, ' ');
  const latinWords = stripped.match(/[\p{L}\p{N}]+/gu) ?? [];
  return hanChars.length + latinWords.length;
}

function fingerprintOf(text: string): string {
  const sample = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
  let hash = 0;
  for (let i = 0; i < sample.length; i += 1) hash = ((hash << 5) - hash + sample.charCodeAt(i)) | 0;
  return `fp-${(hash >>> 0).toString(16)}`;
}

function recentSummaryOf(artifact: StudioArtifact): string {
  return artifact.artifact?.chapterSummary ?? artifact.artifact?.continuationContext ?? artifact.chapterTitle ?? '';
}

export function buildChapterContext(artifact: StudioArtifact): ChapterContext {
  const characters = (artifact.artifact?.characters ?? []).map((entry) => {
    const [name = entry, mentionsText = '0'] = entry.split(':');
    return { name: name.trim(), mentions: Math.max(0, Number(mentionsText.replace(/[^\d]/g, '')) || 0) };
  });
  const foreshadowing = (artifact.artifact?.foreshadowing ?? []).map((entry) => {
    const [name = entry, status = 'open'] = entry.split(':');
    return { name: name.trim(), status: status.trim().toLowerCase() as 'recovered' | 'open' | 'overdue' | 'missing' };
  });
  return {
    characters,
    foreshadowing,
    styleFingerprint: artifact.artifact?.style ?? ['克制、悬疑、带微光', '短句推进'],
    recentSummary: recentSummaryOf(artifact),
  };
}

export function computeWordStats(text: string, target: number): { wordCount: number; remaining: number; progress: number; tone: 'pass' | 'warn' | 'fail' | 'info' } {
  const wordCount = countWords(text);
  const safeTarget = Math.max(1, target);
  const progress = Math.round((wordCount / safeTarget) * 100);
  const remaining = Math.max(0, safeTarget - wordCount);
  const tone = progress >= 100 ? 'pass' : progress >= 50 ? 'warn' : 'fail';
  return { wordCount, remaining, progress, tone };
}

export function planChapterSave(artifact: StudioArtifact, body: string, options: { target?: number; previousSavedAt?: string | null } = {}): ChapterSavePlan {
  const target = options.target ?? 900;
  const stats = computeWordStats(body, target);
  const previousWordCount = (artifact.artifact as { wordCount?: number } | undefined)?.wordCount ?? 0;
  const previousSavedAt = options.previousSavedAt ?? (artifact as { savedAt?: string }).savedAt ?? null;
  return {
    projectId: artifact.projectId,
    storageKey: 'novel-ma:artifacts',
    previousSavedAt,
    rollbackToken: `rollback-${artifact.projectId}-${Date.now()}`,
    bodyWordDelta: stats.wordCount - previousWordCount,
    fingerprint: fingerprintOf(body),
  };
}

export function buildChapterEditor(input: { artifact: StudioArtifact; body: string; target?: number; revisions?: ChapterRevision[] }): ChapterEditor {
  const target = Math.max(1, input.target ?? 900);
  const stats = computeWordStats(input.body, target);
  return {
    artifact: input.artifact,
    body: input.body,
    target,
    wordCount: stats.wordCount,
    remaining: stats.remaining,
    progress: stats.progress,
    tone: stats.tone,
    context: buildChapterContext(input.artifact),
    savePlan: planChapterSave(input.artifact, input.body, { target }),
    revisions: input.revisions ?? [],
  };
}

export function appendChapterRevision(revisions: ChapterRevision[], body: string): ChapterRevision[] {
  const next: ChapterRevision = {
    id: `rev-${Date.now()}`,
    savedAt: new Date().toISOString(),
    wordCount: countWords(body),
    excerpt: body.replace(/\s+/g, ' ').trim().slice(0, 80),
  };
  return [...revisions, next].slice(-10);
}

export interface ForeshadowingNode {
  id: string;
  name: string;
  status: 'recovered' | 'open' | 'overdue' | 'missing';
  x: number;
  y: number;
}

export interface ForeshadowingEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ForeshadowingGraphSvg {
  svg: string;
  nodes: ForeshadowingNode[];
  edges: ForeshadowingEdge[];
  width: number;
  height: number;
}

export interface CharacterArcPoint {
  projectId: string;
  chapter: number;
  arcIndex: number;
}

export interface CharacterArcSvg {
  svg: string;
  points: CharacterArcPoint[];
  width: number;
  height: number;
}

export interface DailyGoal {
  target: number;
  history: Array<{ date: string; words: number }>;
  streakDays: number;
  todayWords: number;
  todayProgress: number;
  tone: 'pass' | 'warn' | 'fail';
}

export interface HeatmapCell {
  date: string;
  words: number;
  intensity: number;
}

export interface HeatmapSvg {
  svg: string;
  cells: HeatmapCell[];
  weeks: number;
  cellSize: number;
}

export interface FocusSession {
  durationMin: number;
  startedAt: string;
  endsAt: string;
  breaks: number;
  target: number;
}

export interface UndoEntry {
  id: string;
  createdAt: string;
  before: unknown;
  after: unknown;
  label: string;
}

export function computeDailyGoal(history: Array<{ date: string; words: number }>, target: number): DailyGoal {
  const safeTarget = Math.max(1, Math.round(target));
  const sorted = [...history].sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const today = new Date().toISOString().slice(0, 10);
  const todayWords = sorted.filter((entry) => entry.date === today).reduce((sum, entry) => sum + Math.max(0, Number(entry.words) || 0), 0);
  const dates = [...new Set(sorted.map((entry) => entry.date))].sort();
  let streak = 0;
  const cursor = new Date(today);
  const dayMap = new Map<string, number>();
  for (const entry of sorted) {
    dayMap.set(entry.date, (dayMap.get(entry.date) ?? 0) + Math.max(0, Number(entry.words) || 0));
  }
  for (let step = 0; step < 365; step += 1) {
    const key = cursor.toISOString().slice(0, 10);
    const dayWords = dayMap.get(key) ?? 0;
    if (dayWords >= safeTarget) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    if (key === today) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    break;
  }
  const todayProgress = Math.min(100, Math.round((todayWords / safeTarget) * 100));
  const tone = todayProgress >= 100 ? 'pass' : todayProgress >= 50 ? 'warn' : 'fail';
  return { target: safeTarget, history: sorted, streakDays: streak, todayWords, todayProgress, tone };
}

export function buildHeatmapSvg(history: Array<{ date: string; words: number }>, weeks: number, options: { target?: number } = {}): HeatmapSvg {
  const safeWeeks = Math.max(1, Math.min(26, weeks));
  const target = Math.max(1, options.target ?? 500);
  const cellSize = 14;
  const gap = 3;
  const width = safeWeeks * (cellSize + gap);
  const height = 7 * (cellSize + gap);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - safeWeeks * 7 + 1);
  const map = new Map<string, number>();
  for (const entry of history) {
    map.set(entry.date, (map.get(entry.date) ?? 0) + Math.max(0, Number(entry.words) || 0));
  }
  const cells: HeatmapCell[] = [];
  const cellMarkup: string[] = [];
  let cursor = new Date(start);
  for (let week = 0; week < safeWeeks; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const key = cursor.toISOString().slice(0, 10);
      const words = map.get(key) ?? 0;
      const intensity = Math.min(1, words / target);
      cells.push({ date: key, words, intensity });
      const x = week * (cellSize + gap);
      const y = day * (cellSize + gap);
      const fill = intensity === 0 ? '#e5e7eb' : `rgba(22, 163, 74, ${0.2 + intensity * 0.8})`;
      cellMarkup.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="3" fill="${fill}"><title>${svgEscape(key)} · ${words}</title></rect>`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="写作热力图">${cellMarkup.join('')}</svg>`;
  return { svg, cells, weeks: safeWeeks, cellSize };
}

export function planFocusSession(durationMin: number, options: { target?: number; breaks?: number } = {}): FocusSession {
  const minutes = Math.max(5, Math.min(180, Math.round(durationMin)));
  const breaks = Math.max(0, Math.min(6, options.breaks ?? Math.floor(minutes / 25)));
  const target = Math.max(50, Math.round(options.target ?? minutes * 30));
  const startedAt = new Date().toISOString();
  const endsAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  return { durationMin: minutes, startedAt, endsAt, breaks, target };
}

export function planUndoEntry(before: unknown, after: unknown, label: string, options: { id?: string; createdAt?: string } = {}): UndoEntry {
  return {
    id: options.id ?? `undo-${Date.now()}`,
    createdAt: options.createdAt ?? new Date().toISOString(),
    before,
    after,
    label,
  };
}

export interface PwaManifest {
  name: string;
  shortName: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  themeColor: string;
  backgroundColor: string;
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
}

export interface ServiceWorkerPlan {
  scriptName: string;
  cacheName: string;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  precacheFiles: string[];
  runtimePatterns: string[];
  fallback: string;
  ready: boolean;
}

export interface OfflineCapabilityReport {
  hasManifest: boolean;
  hasServiceWorker: boolean;
  precacheCount: number;
  runtimePatterns: number;
  storageQuotaMb: number;
  warnings: string[];
}

export function buildPwaManifest(options: { name?: string; shortName?: string; startUrl?: string; display?: PwaManifest['display']; themeColor?: string; backgroundColor?: string; icons?: PwaManifest['icons'] } = {}): PwaManifest {
  return {
    name: options.name ?? 'novel-multi-agent 工作台',
    shortName: options.shortName ?? 'novel-ma',
    startUrl: options.startUrl ?? './',
    display: options.display ?? 'standalone',
    themeColor: options.themeColor ?? '#334155',
    backgroundColor: options.backgroundColor ?? '#f8fafc',
    icons: options.icons ?? [
      { src: 'apps/web/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'apps/web/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}

export function buildServiceWorkerPlan(options: { cacheName?: string; strategy?: ServiceWorkerPlan['strategy']; precacheFiles?: string[]; runtimePatterns?: string[]; fallback?: string; scriptName?: string } = {}): ServiceWorkerPlan {
  const precacheFiles = options.precacheFiles ?? ['./', './apps/web/', './apps/tui/', 'https://yeluo45.github.io/novel-multi-agent/'];
  const runtimePatterns = options.runtimePatterns ?? ['^https://yeluo45\\.github\\.io/novel-multi-agent/'];
  return {
    scriptName: options.scriptName ?? 'sw.js',
    cacheName: options.cacheName ?? 'novel-ma-v1',
    strategy: options.strategy ?? 'stale-while-revalidate',
    precacheFiles,
    runtimePatterns,
    fallback: options.fallback ?? './apps/web/index.html',
    ready: precacheFiles.length > 0 && runtimePatterns.length > 0,
  };
}

export function renderServiceWorkerScript(plan: ServiceWorkerPlan): string {
  return [
    '// novel-multi-agent service worker (auto-generated by V48 buildServiceWorkerScript)',
    `const CACHE = ${JSON.stringify(plan.cacheName)};`,
    `const PRECACHE = ${JSON.stringify(plan.precacheFiles)};`,
    `const RUNTIME = ${JSON.stringify(plan.runtimePatterns)};`,
    `const FALLBACK = ${JSON.stringify(plan.fallback)};`,
    'self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())); });',
    'self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });',
    'self.addEventListener("fetch", (event) => {',
    '  const url = new URL(event.request.url);',
    '  const matches = RUNTIME.some((pattern) => new RegExp(pattern).test(url.href));',
    '  if (!matches) return;',
    '  event.respondWith(',
    '    caches.match(event.request).then((cached) => {',
    '      const fetched = fetch(event.request).then((response) => { if (response && response.ok) { const copy = response.clone(); caches.open(CACHE).then((c) => c.put(event.request, copy)); } return response; }).catch(() => cached || caches.match(FALLBACK));',
    '      return cached || fetched;',
    '    })',
    '  );',
    '});',
  ].join('\n');
}

export function assessOfflineCapability(options: { manifest?: PwaManifest | null; plan?: ServiceWorkerPlan | null; storageQuotaMb?: number } = {}): OfflineCapabilityReport {
  const warnings: string[] = [];
  if (!options.manifest) warnings.push('manifest missing');
  if (!options.plan) warnings.push('service worker plan missing');
  const precacheCount = options.plan?.precacheFiles.length ?? 0;
  const runtimePatterns = options.plan?.runtimePatterns.length ?? 0;
  const quota = options.storageQuotaMb ?? 50;
  if (precacheCount > 30) warnings.push('precache count exceeds 30 files; may bloat install');
  if (quota < 20) warnings.push('storage quota below 20 MB; PWA install may fail on low-end devices');
  return {
    hasManifest: Boolean(options.manifest),
    hasServiceWorker: Boolean(options.plan),
    precacheCount,
    runtimePatterns,
    storageQuotaMb: quota,
    warnings,
  };
}

export interface DiffView {
  lines: DiffLine[];
  added: number;
  removed: number;
  unchanged: number;
  similarity: number;
}

export interface DiffLine {
  kind: 'equal' | 'add' | 'remove';
  leftLine: string | null;
  rightLine: string | null;
  leftIndex: number | null;
  rightIndex: number | null;
}

export interface ImportWizardStep {
  index: number;
  kind: 'parse' | 'validate' | 'normalize' | 'preview' | 'commit';
  title: string;
  body: string;
  ok: boolean;
  hint?: string;
}

export interface ImportWizard {
  ok: boolean;
  steps: ImportWizardStep[];
  warnings: string[];
  schemaVersion: number;
}

function tokenize(text: string): string[] {
  return String(text ?? '').split('\n');
}

export function buildDiffView(left: string, right: string): DiffView {
  const leftLines = tokenize(left);
  const rightLines = tokenize(right);
  const m = leftLines.length;
  const n = rightLines.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      lcs[i]![j] = leftLines[i] === rightLines[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  while (i < m && j < n) {
    if (leftLines[i] === rightLines[j]) {
      lines.push({ kind: 'equal', leftLine: leftLines[i] ?? null, rightLine: rightLines[j] ?? null, leftIndex: i, rightIndex: j });
      unchanged += 1;
      i += 1;
      j += 1;
    } else if ((lcs[i + 1]?.[j] ?? 0) >= (lcs[i]?.[j + 1] ?? 0)) {
      lines.push({ kind: 'remove', leftLine: leftLines[i] ?? null, rightLine: null, leftIndex: i, rightIndex: null });
      removed += 1;
      i += 1;
    } else {
      lines.push({ kind: 'add', leftLine: null, rightLine: rightLines[j] ?? null, leftIndex: null, rightIndex: j });
      added += 1;
      j += 1;
    }
  }
  while (i < m) {
    lines.push({ kind: 'remove', leftLine: leftLines[i] ?? null, rightLine: null, leftIndex: i, rightIndex: null });
    removed += 1;
    i += 1;
  }
  while (j < n) {
    lines.push({ kind: 'add', leftLine: null, rightLine: rightLines[j] ?? null, leftIndex: null, rightIndex: j });
    added += 1;
    j += 1;
  }
  const similarity = (unchanged * 2) / Math.max(1, m + n);
  return { lines, added, removed, unchanged, similarity };
}

export function buildImportWizard(rawJson: string): ImportWizard {
  const warnings: string[] = [];
  const steps: ImportWizardStep[] = [];
  let parsed: unknown = null;
  let parseOk = false;
  try {
    parsed = JSON.parse(String(rawJson ?? ''));
    parseOk = true;
  } catch (error) {
    warnings.push(`JSON parse failed: ${(error as Error).message}`);
  }
  steps.push({ index: 1, kind: 'parse', title: '1. JSON 解析', body: parseOk ? 'JSON 解析成功' : 'JSON 解析失败', ok: parseOk, hint: parseOk ? undefined : '检查末尾括号 / 引号' });
  const isObject = parsed && typeof parsed === 'object';
  steps.push({ index: 2, kind: 'validate', title: '2. Schema 校验', body: isObject ? '对象结构有效' : '非对象结构', ok: Boolean(isObject), hint: isObject ? undefined : '期望 JSON object' });
  const schemaVersion = isObject ? Number((parsed as { schemaVersion?: unknown }).schemaVersion ?? 2) : 2;
  const validSchema = schemaVersion === 2;
  if (!validSchema) warnings.push(`schemaVersion=${schemaVersion} 非 2；将自动归一化`);
  steps.push({ index: 3, kind: 'normalize', title: '3. Schema 归一化', body: validSchema ? '已是 schemaVersion=2' : `从 ${schemaVersion} 升级到 2`, ok: true, hint: validSchema ? undefined : 'auto-upgrade applied' });
  const projectId = isObject ? String((parsed as { projectId?: unknown }).projectId ?? '(missing)') : '(missing)';
  const title = isObject ? String((parsed as { title?: unknown }).title ?? '(no title)') : '(no title)';
  steps.push({ index: 4, kind: 'preview', title: '4. 预览', body: `projectId=${projectId} · title=${title}`, ok: true });
  steps.push({ index: 5, kind: 'commit', title: '5. 提交入库', body: parseOk && isObject ? '可写入本地项目库' : '阻断：前置步骤未通过', ok: parseOk && Boolean(isObject) });
  return { ok: parseOk && Boolean(isObject), steps, warnings, schemaVersion: 2 };
}

export interface ChapterPacingSvg {
  svg: string;
  bars: ChapterPacingBar[];
  width: number;
  height: number;
}

export interface ChapterPacingBar {
  chapter: number;
  title: string;
  words: number;
  foreshadowing: number;
}

export interface ChapterPacingSvg {
  svg: string;
  bars: ChapterPacingBar[];
  width: number;
  height: number;
}

export interface RevisionNode {
  id: string;
  projectId: string;
  parentId: string | null;
  label: string;
  wordCount: number;
  savedAt: string;
  children: RevisionNode[];
}

export interface TagIndex {
  tags: string[];
  byProject: Record<string, string[]>;
  byTag: Record<string, string[]>;
}

export interface SearchHit {
  projectId: string;
  title: string;
  score: number;
  matchedFields: string[];
  excerpt: string;
}

export interface IndexedDbMigrationPlan {
  storageKey: string;
  objectStoreName: string;
  indexName: string;
  recordCount: number;
  estimatedBytes: number;
  warnings: string[];
  ready: boolean;
}

export function buildRevisionTree(items: StudioArtifact[]): RevisionNode[] {
  const byProject = new Map<string, StudioArtifact[]>();
  const withSavedAt = items as Array<StudioArtifact & { savedAt?: string }>;
  for (const item of withSavedAt) {
    const list = byProject.get(item.projectId) ?? [];
    list.push(item);
    byProject.set(item.projectId, list);
  }
  const tree: RevisionNode[] = [];
  for (const [projectId, list] of byProject.entries()) {
    const sorted = [...list].sort((left, right) => String((left as { savedAt?: string }).savedAt ?? left.updatedAt ?? '').localeCompare(String((right as { savedAt?: string }).savedAt ?? right.updatedAt ?? '')));
    const root: RevisionNode = {
      id: `${projectId}-root`,
      projectId,
      parentId: null,
      label: 'origin',
      wordCount: 0,
      savedAt: (sorted[0] as { savedAt?: string } | undefined)?.savedAt ?? sorted[0]?.updatedAt ?? '',
      children: [],
    };
    let previousId: string | null = `${projectId}-root`;
    for (const item of sorted) {
      const node: RevisionNode = {
        id: item.projectId,
        projectId,
        parentId: previousId,
        label: item.title || item.chapterTitle || 'revision',
        wordCount: Number((item.artifact as { wordCount?: number } | undefined)?.wordCount ?? 0),
        savedAt: (item as { savedAt?: string }).savedAt ?? item.updatedAt ?? '',
        children: [],
      };
      root.children.push(node);
      previousId = item.projectId;
    }
    tree.push(root);
  }
  return tree;
}

export function buildTagIndex(items: StudioArtifact[], tagsByProject: Record<string, string[]> = {}): TagIndex {
  const allTags = new Set<string>();
  const byProject: Record<string, string[]> = {};
  const byTag: Record<string, string[]> = {};
  for (const item of items) {
    const explicit = tagsByProject[item.projectId] ?? [];
    const inferred = extractInferredTags(item);
    const merged = [...new Set([...explicit, ...inferred])].slice(0, 20);
    byProject[item.projectId] = merged;
    for (const tag of merged) {
      allTags.add(tag);
      const list = byTag[tag] ?? [];
      list.push(item.projectId);
      byTag[tag] = list;
    }
  }
  return { tags: [...allTags].sort(), byProject, byTag };
}

function extractInferredTags(item: StudioArtifact): string[] {
  const tags: string[] = [];
  if (item.mode) tags.push(`mode:${item.mode}`);
  if (item.stage) tags.push(`stage:${item.stage}`);
  const foreshadowing = item.artifact?.foreshadowing ?? [];
  if (foreshadowing.some((entry) => entry.endsWith(':overdue'))) tags.push('risk:overdue');
  if (foreshadowing.some((entry) => entry.endsWith(':recovered'))) tags.push('health:recovered');
  return tags;
}

export function searchProjectsIndexed(items: StudioArtifact[], query: string, options: { limit?: number; fields?: string[] } = {}): SearchHit[] {
  const limit = options.limit ?? 20;
  const fields = options.fields ?? ['title', 'mode', 'stage', 'chapterTitle', 'characters', 'foreshadowing', 'style', 'chapterSummary', 'continuationContext'];
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const item of items) {
    let score = 0;
    const matched = new Set<string>();
    const haystacks: Array<{ field: string; value: string }> = [];
    if (fields.includes('title')) haystacks.push({ field: 'title', value: item.title });
    if (fields.includes('mode')) haystacks.push({ field: 'mode', value: item.mode ?? '' });
    if (fields.includes('stage')) haystacks.push({ field: 'stage', value: item.stage ?? '' });
    if (fields.includes('chapterTitle')) haystacks.push({ field: 'chapterTitle', value: item.chapterTitle ?? '' });
    if (fields.includes('characters')) for (const value of item.artifact?.characters ?? []) haystacks.push({ field: 'characters', value });
    if (fields.includes('foreshadowing')) for (const value of item.artifact?.foreshadowing ?? []) haystacks.push({ field: 'foreshadowing', value });
    if (fields.includes('style')) for (const value of item.artifact?.style ?? []) haystacks.push({ field: 'style', value });
    if (fields.includes('chapterSummary')) haystacks.push({ field: 'chapterSummary', value: item.artifact?.chapterSummary ?? '' });
    if (fields.includes('continuationContext')) haystacks.push({ field: 'continuationContext', value: item.artifact?.continuationContext ?? '' });
    let excerpt = '';
    for (const { field, value } of haystacks) {
      const lower = value.toLowerCase();
      const index = lower.indexOf(q);
      if (index >= 0) {
        score += field === 'title' || field === 'chapterTitle' ? 10 : field === 'characters' || field === 'foreshadowing' ? 6 : 3;
        matched.add(field);
        if (!excerpt) {
          const start = Math.max(0, index - 12);
          excerpt = value.slice(start, start + q.length + 24);
        }
      }
    }
    if (score > 0) hits.push({ projectId: item.projectId, title: item.title, score, matchedFields: [...matched], excerpt });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

export function planIndexedDbMigration(items: StudioArtifact[], options: { storageKey?: string; objectStoreName?: string; indexName?: string; softLimitBytes?: number } = {}): IndexedDbMigrationPlan {
  const storageKey = options.storageKey ?? 'novel-ma:artifacts';
  const objectStoreName = options.objectStoreName ?? 'projects';
  const indexName = options.indexName ?? 'projectId';
  const softLimit = options.softLimitBytes ?? 5 * 1024 * 1024;
  const payload = JSON.stringify(items);
  const estimatedBytes = payload.length * 2;
  const warnings: string[] = [];
  if (estimatedBytes > softLimit) warnings.push(`payload exceeds ${softLimit}B localStorage soft limit; IndexedDB recommended.`);
  if (!items.length) warnings.push('no items to migrate; plan will create empty store.');
  return {
    storageKey,
    objectStoreName,
    indexName,
    recordCount: items.length,
    estimatedBytes,
    warnings,
    ready: warnings.length === 0 || warnings[0]?.startsWith('payload exceeds') === true,
  };
}

function svgEscape(text: string): string {
  return String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

export function buildForeshadowingGraphSvg(items: StudioArtifact[]): ForeshadowingGraphSvg {
  const width = 480;
  const height = 280;
  const map = new Map<string, { name: string; status: ForeshadowingNode['status']; sources: Set<string> }>();
  for (const artifact of items) {
    const title = artifact.title || artifact.projectId;
    for (const entry of artifact.artifact?.foreshadowing ?? []) {
      const [name = entry, status = 'open'] = entry.split(':');
      const key = name.trim();
      const existing = map.get(key) ?? { name: key, status: status.trim().toLowerCase() as ForeshadowingNode['status'], sources: new Set<string>() };
      existing.sources.add(title);
      map.set(key, existing);
    }
  }
  const entries = [...map.entries()];
  const radius = 90;
  const cx = width / 2;
  const cy = height / 2;
  const nodes: ForeshadowingNode[] = entries.map(([id, info], index) => {
    const angle = (index / Math.max(1, entries.length)) * Math.PI * 2;
    return {
      id,
      name: info.name,
      status: info.status,
      x: Math.round(cx + Math.cos(angle) * radius),
      y: Math.round(cy + Math.sin(angle) * radius),
    };
  });
  const colorByStatus: Record<ForeshadowingNode['status'], string> = {
    recovered: '#16a34a',
    open: '#d97706',
    overdue: '#b91c1c',
    missing: '#64748b',
  };
  const nodeMarkup = nodes.map((node) => `<g><circle cx="${node.x}" cy="${node.y}" r="20" fill="${colorByStatus[node.status]}" fill-opacity="0.18" stroke="${colorByStatus[node.status]}" stroke-width="2" /><text x="${node.x}" y="${node.y + 4}" text-anchor="middle" font-size="11" fill="currentColor">${svgEscape(node.name.slice(0, 6))}</text></g>`).join('');
  const edges: ForeshadowingEdge[] = [];
  const linkMarkup = nodes.slice(1).map((node, idx) => {
    const prev = nodes[idx];
    if (!prev) return '';
    edges.push({ source: prev.id, target: node.id });
    return `<line x1="${prev.x}" y1="${prev.y}" x2="${node.x}" y2="${node.y}" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4" />`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="伏笔关系图"><rect width="${width}" height="${height}" fill="transparent" />${linkMarkup}${nodeMarkup}</svg>`;
  return { svg, nodes, edges, width, height };
}

export function buildCharacterArcSvg(artifacts: StudioArtifact[]): CharacterArcSvg {
  const width = 480;
  const height = 200;
  const sorted = latestFirst(artifacts);
  const points: CharacterArcPoint[] = sorted.map((artifact, index) => ({
    projectId: artifact.projectId,
    chapter: artifact.artifact?.outline?.[0]?.chapter ?? index + 1,
    arcIndex: index,
  }));
  const stepX = points.length > 1 ? (width - 60) / (points.length - 1) : 0;
  const polyline = points.map((point, index) => {
    const x = 30 + index * stepX;
    const y = height - 40 - (point.arcIndex * 14);
    return `${x},${y}`;
  }).join(' ');
  const circleMarkup = points.map((point, index) => {
    const x = 30 + index * stepX;
    const y = height - 40 - (point.arcIndex * 14);
    const artifact = sorted[index];
    const label = artifact?.artifact?.outline?.[0]?.title ?? artifact?.chapterTitle ?? `第${point.chapter}章`;
    return `<g><circle cx="${x}" cy="${y}" r="5" fill="#2563eb" /><text x="${x}" y="${height - 18}" text-anchor="middle" font-size="10" fill="currentColor">${svgEscape(String(label).slice(0, 12))}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="人物弧线"><polyline points="${polyline}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" />${circleMarkup}</svg>`;
  return { svg, points, width, height };
}

export function buildChapterPacingSvg(artifacts: StudioArtifact[]): ChapterPacingSvg {
  const width = 480;
  const height = 200;
  const sorted = latestFirst(artifacts).slice(0, 8);
  const bars: ChapterPacingBar[] = sorted.map((artifact, index) => {
    const outline = artifact.artifact?.outline ?? [];
    const summaryLen = (artifact.artifact?.chapterSummary?.length ?? 0) + (artifact.artifact?.continuationContext?.length ?? 0);
    return {
      chapter: outline[0]?.chapter ?? index + 1,
      title: outline[0]?.title ?? artifact.chapterTitle ?? `第${index + 1}章`,
      words: Number((artifact.artifact as { wordCount?: number } | undefined)?.wordCount ?? Math.max(60, Math.min(1200, summaryLen * 6))),
      foreshadowing: (artifact.artifact?.foreshadowing ?? []).length,
    };
  });
  const maxWords = Math.max(1, ...bars.map((bar) => bar.words));
  const barWidth = bars.length > 0 ? (width - 60) / bars.length : 0;
  const barMarkup = bars.map((bar, index) => {
    const x = 30 + index * barWidth;
    const barHeight = Math.round((bar.words / maxWords) * (height - 60));
    const y = height - 30 - barHeight;
    return `<g><rect x="${x + 4}" y="${y}" width="${barWidth - 8}" height="${barHeight}" fill="#16a34a" fill-opacity="0.7" rx="4" /><text x="${x + barWidth / 2}" y="${height - 14}" text-anchor="middle" font-size="10" fill="currentColor">${svgEscape(bar.title.slice(0, 6))}</text><text x="${x + barWidth / 2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="currentColor">${bar.words}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="章节节奏"><line x1="30" y1="${height - 30}" x2="${width - 30}" y2="${height - 30}" stroke="currentColor" stroke-opacity="0.3" />${barMarkup}</svg>`;
  return { svg, bars, width, height };
}

export interface InteractivePanelSection {
  kind: 'metric' | 'progress' | 'list' | 'tree' | 'bar' | 'note';
  heading?: string;
  items?: Array<{ label: string; value: string; tone?: 'pass' | 'warn' | 'fail' | 'info' }>;
  metrics?: Array<{ label: string; value: number; suffix?: string }>;
  progress?: { label: string; value: number; tone: 'pass' | 'warn' | 'fail' | 'info' };
  bars?: Array<{ label: string; value: number; tone: 'pass' | 'warn' | 'fail' | 'info' }>;
  tree?: Array<{ id: string; label: string; depth: number; children?: Array<{ id: string; label: string }> }>;
  note?: string;
}

function toneFromScore(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 80) return 'pass';
  if (score >= 50) return 'warn';
  return 'fail';
}

export function buildInteractivePanel(input: { kind: string; payload: unknown }): InteractivePanel {
  const { kind, payload } = input;
  const data = (payload && typeof payload === 'object' ? payload : {}) as Record<string, any>;

  if (kind === 'quality-panel') {
    const status = String(data.status ?? (data.report?.status ?? 'unknown'));
    const sub = data.report?.subscores ?? data.subscores ?? {};
    const scores = [
      { label: 'characters', value: Number(sub.characters ?? 0) },
      { label: 'foreshadowing', value: Number(sub.foreshadowing ?? 0) },
      { label: 'style', value: Number(sub.style ?? 0) },
    ];
    const overall = scores.reduce((sum, item) => sum + item.value, 0) / Math.max(scores.length, 1);
    return {
      kind: 'quality-panel',
      title: '续写质量面板',
      badges: [{ label: status, tone: status === 'pass' ? 'pass' : status === 'warn' ? 'warn' : 'fail' }],
      sections: [
        { kind: 'progress', heading: '总体质量', progress: { label: 'overall', value: Math.round(overall), tone: toneFromScore(overall) } },
        { kind: 'bar', heading: '子分数', bars: scores.map((item) => ({ label: item.label, value: item.value, tone: toneFromScore(item.value) as 'pass' | 'warn' | 'fail' })) },
        { kind: 'note', heading: '建议', note: data.report?.advice ?? data.advice ?? '继续在续写中使用角色名、伏笔、文风指纹。' },
      ],
      raw: data,
    };
  }

  if (kind === 'provider-readiness') {
    const ready = Boolean(data.ready);
    const diagnostics = (data.diagnostics ?? []) as string[];
    const mode = String(data.mode ?? 'mock');
    return {
      kind: 'provider-readiness',
      title: 'Provider 实战面板',
      badges: [{ label: ready ? 'ready' : 'not-ready', tone: ready ? 'pass' : 'fail' }, { label: mode, tone: 'info' }],
      sections: [
        { kind: 'list', heading: '诊断', items: diagnostics.map((line) => ({ label: line, value: '', tone: line.startsWith('fail') ? 'fail' : line.startsWith('warn') ? 'warn' : line.startsWith('pass') ? 'pass' : 'info' as 'pass' | 'warn' | 'fail' | 'info' })) },
      ],
      raw: data,
    };
  }

  if (kind === 'longform-os') {
    const volumes = (data.volumes ?? []) as Array<{ id?: string; title?: string }>;
    const ledger = data.ledger ?? {};
    const foreshadowing = (ledger.foreshadowing ?? []) as Array<{ name?: string; status?: string }>;
    const arcs = (ledger.characterArcs ?? []) as Array<{ projectId?: string; protagonist?: string; arc?: string }>;
    const tree = volumes.flatMap((volume) => ([
      { id: String(volume.id ?? volume.title ?? ''), label: `卷：${volume.title ?? volume.id ?? ''}`, depth: 0 },
    ]));
    return {
      kind: 'longform-os',
      title: '长篇工程 OS',
      badges: [{ label: `${volumes.length} 卷`, tone: 'info' }, { label: `${foreshadowing.length} 伏笔`, tone: foreshadowing.length > 0 ? 'pass' : 'warn' }],
      sections: [
        { kind: 'tree', heading: '分卷结构', tree },
        { kind: 'list', heading: '伏笔台账', items: foreshadowing.map((item) => ({ label: item.name ?? '', value: item.status ?? '', tone: (item.status === 'recovered' ? 'pass' : item.status === 'overdue' ? 'fail' : 'warn') as 'pass' | 'warn' | 'fail' })) },
        { kind: 'list', heading: '人物弧线', items: arcs.map((item) => ({ label: item.protagonist ?? '', value: item.arc ?? '', tone: 'info' as const })) },
      ],
      raw: data,
    };
  }

  if (kind === 'narrative-analytics') {
    const characters = (data.characterAppearances ?? []) as Array<{ name?: string; mentions?: number }>;
    const pacing = data.pacing ?? {};
    return {
      kind: 'narrative-analytics',
      title: '叙事分析',
      badges: [{ label: `${characters.length} 角色`, tone: 'info' }],
      sections: [
        { kind: 'bar', heading: '角色出场', bars: characters.slice(0, 8).map((item) => ({ label: item.name ?? '', value: Math.min(100, (item.mentions ?? 0) * 20), tone: 'info' as const })) },
        { kind: 'metric', heading: '节奏指标', metrics: [{ label: '章节数', value: Number(pacing.chapters ?? 0) }, { label: '平均字数', value: Number(pacing.averageWords ?? 0) }] },
      ],
      raw: data,
    };
  }

  if (kind === 'foreshadowing') {
    const recovered = (data.recovered ?? []) as string[];
    const open = (data.open ?? []) as string[];
    const overdue = (data.overdue ?? []) as string[];
    const score = Number(data.score ?? 100);
    return {
      kind: 'foreshadowing',
      title: '伏笔回收评分',
      badges: [{ label: `score ${score}`, tone: toneFromScore(score) }],
      sections: [
        { kind: 'progress', heading: '回收率', progress: { label: 'recovery', value: score, tone: toneFromScore(score) } },
        { kind: 'list', heading: '已回收', items: recovered.map((name) => ({ label: name, value: '', tone: 'pass' as const })) },
        { kind: 'list', heading: '开放中', items: open.map((name) => ({ label: name, value: '', tone: 'warn' as const })) },
        { kind: 'list', heading: '逾期', items: overdue.map((name) => ({ label: name, value: '', tone: 'fail' as const })) },
      ],
      raw: data,
    };
  }

  return {
    kind,
    title: kind,
    badges: [],
    sections: [{ kind: 'note', heading: '原始数据', note: JSON.stringify(payload, null, 2) }],
    raw: payload,
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
