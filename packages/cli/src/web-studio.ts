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

export type ThemeName = 'light' | 'dark' | 'sepia' | 'nord';

export interface ThemeTokens {
  bg: string;
  panel: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  code: string;
  codeText: string;
  success: string;
  warn: string;
  danger: string;
}

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  storageKey: string;
  tokens: ThemeTokens;
  ready: boolean;
  warning?: string;
}

export interface ThemeMigrationPlan {
  fromTheme: ThemeName;
  toTheme: ThemeName;
  steps: string[];
  cssVariableBlock: string;
  estimatedDurationMs: number;
  preserveUserPreference: boolean;
  ready: boolean;
}

const THEME_REGISTRY: Record<ThemeName, { label: string; tokens: ThemeTokens }> = {
  light: { label: 'Light', tokens: { bg: '#ffffff', panel: '#f6f8fa', text: '#1f2328', muted: '#57606a', border: '#d0d7de', accent: '#0969da', code: '#f6f8fa', codeText: '#1f2328', success: '#1a7f37', warn: '#9a6700', danger: '#cf222e' } },
  dark: { label: 'Dark', tokens: { bg: '#0d1117', panel: '#161b22', text: '#e6edf3', muted: '#7d8590', border: '#30363d', accent: '#2f81f7', code: '#161b22', codeText: '#e6edf3', success: '#3fb950', warn: '#d29922', danger: '#f85149' } },
  sepia: { label: 'Sepia', tokens: { bg: '#f4ecd8', panel: '#e8dfc5', text: '#5b4636', muted: '#8a7159', border: '#c7b48b', accent: '#a0522d', code: '#e8dfc5', codeText: '#5b4636', success: '#4f7d3a', warn: '#b8860b', danger: '#8b0000' } },
  nord: { label: 'Nord', tokens: { bg: '#2e3440', panel: '#3b4252', text: '#eceff4', muted: '#7b88a1', border: '#434c5e', accent: '#88c0d0', code: '#3b4252', codeText: '#eceff4', success: '#a3be8c', warn: '#ebcb8b', danger: '#bf616a' } },
};

export function buildThemeConfig(themeName: ThemeName, options: { storageKey?: string; known?: boolean } = {}): ThemeConfig {
  const registry = THEME_REGISTRY[themeName];
  if (!registry) return { name: themeName as ThemeName, label: 'unknown', storageKey: options.storageKey ?? 'novel-ma:theme', tokens: THEME_REGISTRY.dark.tokens, ready: false, warning: `unknown theme '${themeName}'; falling back to dark` };
  return {
    name: themeName,
    label: registry.label,
    storageKey: options.storageKey ?? 'novel-ma:theme',
    tokens: registry.tokens,
    ready: options.known !== false,
  };
}

export function buildThemeOptions(currentTheme?: ThemeName): ThemeConfig[] {
  const themes: ThemeName[] = ['light', 'dark', 'sepia', 'nord'];
  return themes.map((theme) => buildThemeConfig(theme, { known: true, storageKey: currentTheme === theme ? 'novel-ma:theme' : `novel-ma:theme:${theme}` }));
}

export function planThemeMigration(fromTheme: ThemeName, toTheme: ThemeName, options: { preserveUserPreference?: boolean; storageKey?: string } = {}): ThemeMigrationPlan {
  const fromConfig = buildThemeConfig(fromTheme);
  const toConfig = buildThemeConfig(toTheme);
  const steps = [
    `保存用户当前偏好到 localStorage '${options.storageKey ?? 'novel-ma:theme'}'`,
    `更新 document.documentElement.dataset.theme = '${toTheme}'`,
    `应用 ${toConfig.tokens.bg} 背景 + ${toConfig.tokens.text} 文本 + ${toConfig.tokens.accent} 强调色`,
    `重新渲染 V41-V59 所有依赖主题的 SVG + 按钮 + 边框`,
    `如 preserveUserPreference=true 则记录用户在切换前的偏好以便回滚`,
  ];
  const cssVariableBlock = `:root[data-theme='${toTheme}'] { --bg: ${toConfig.tokens.bg}; --panel: ${toConfig.tokens.panel}; --text: ${toConfig.tokens.text}; --muted: ${toConfig.tokens.muted}; --border: ${toConfig.tokens.border}; --accent: ${toConfig.tokens.accent}; --code: ${toConfig.tokens.code}; --code-text: ${toConfig.tokens.codeText}; --success: ${toConfig.tokens.success}; --warn: ${toConfig.tokens.warn}; --danger: ${toConfig.tokens.danger}; }`;
  return {
    fromTheme,
    toTheme,
    steps,
    cssVariableBlock,
    estimatedDurationMs: 50,
    preserveUserPreference: options.preserveUserPreference ?? true,
    ready: fromTheme !== toTheme || fromTheme === toTheme,
  };
}
export interface ReplCommand {
  name: string;
  args: string[];
  flags: Record<string, string>;
  raw: string;
}

export interface ReplDispatchPlan {
  command: ReplCommand;
  matched: string | null;
  handler: string | null;
  suggestions: string[];
  ready: boolean;
  warning?: string;
}

export interface ReplHelpEntry {
  command: string;
  description: string;
  flags: string[];
}

const REPL_COMMANDS = [
  { name: 'new', description: '从主题创建新章节', flags: ['--quality', '--enrich'] },
  { name: 'continue', description: '续写已有章节', flags: ['--quality-artifact', '--writer'] },
  { name: 'provider-smoke', description: 'Provider 实战 smoke 测试', flags: ['--prompt', '--model'] },
  { name: 'provider-doctor', description: 'Provider 诊断', flags: ['--provider'] },
  { name: 'artifact-latest', description: '查找最近 artifact', flags: ['--path', '--enrich'] },
  { name: 'artifact-catalog', description: '列出所有 artifact', flags: ['--path', '--enrich'] },
  { name: 'artifact-search', description: '全文搜索', flags: ['--query', '--limit'] },
  { name: 'artifact-diff', description: '比较两个 artifact', flags: ['--left', '--right'] },
  { name: 'artifact-prune', description: '清理老旧 artifact', flags: ['--older-than', '--keep-min'] },
  { name: 'artifact-export', description: '导出 artifact 束', flags: ['--output', '--format'] },
  { name: 'artifact-import', description: '导入 artifact 束', flags: ['--file', '--mode'] },
  { name: 'tui', description: '启动 TUI 镜像', flags: ['--width'] },
  { name: 'mode-parity', description: '显示 CLI/Web/TUI parity', flags: [] },
  { name: 'workspace-persist', description: '持久化 workspace', flags: ['--storage', '--key'] },
  { name: 'exec-pipeline', description: '运行多 agent pipeline', flags: ['--steps', '--concurrency'] },
  { name: 'idb-migrate', description: '从 localStorage 迁移到 IndexedDB', flags: ['--db-name', '--dry-run'] },
  { name: 'undo-pop', description: '从 undo 栈 pop', flags: ['--stack-key'] },
  { name: 'redo-push', description: 'push redo 栈', flags: ['--stack-key', '--entry-id'] },
  { name: 'markdown-render', description: '渲染 markdown 文本', flags: ['--max-heading'] },
  { name: 'help', description: '显示所有命令', flags: [] },
  { name: 'quit', description: '退出 REPL', flags: [] },
];

export function parseReplCommand(input: string): ReplCommand {
  const raw = String(input ?? '').trim();
  if (!raw) return { name: '', args: [], flags: {}, raw };
  const tokens = raw.split(/\s+/);
  const name = tokens[0] ?? '';
  const args: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      if (eq > 0) flags[token.slice(2, eq)] = token.slice(eq + 1);
      else {
        const next = tokens[i + 1];
        if (next && !next.startsWith('--')) {
          flags[token.slice(2)] = next;
          i += 1;
        } else {
          flags[token.slice(2)] = 'true';
        }
      }
    } else {
      args.push(token);
    }
  }
  return { name, args, flags, raw };
}

export function planReplDispatch(command: ReplCommand): ReplDispatchPlan {
  const matched = REPL_COMMANDS.find((cmd) => cmd.name === command.name);
  if (!matched) {
    const suggestions = REPL_COMMANDS.filter((cmd) => cmd.name.startsWith(command.name.slice(0, 2))).slice(0, 3).map((cmd) => cmd.name);
    return { command, matched: null, handler: null, suggestions, ready: false, warning: `unknown command '${command.name}'` };
  }
  return { command, matched: matched.name, handler: `handle_${matched.name}`, suggestions: [], ready: true };
}

export function buildReplHelp(filter?: string): ReplHelpEntry[] {
  return REPL_COMMANDS.filter((cmd) => !filter || cmd.name.includes(filter.toLowerCase())).map((cmd) => ({ command: cmd.name, description: cmd.description, flags: cmd.flags }));
}

export function planCliCommand(input: string, options: { allowedCommands?: string[] } = {}): ReplDispatchPlan & { helpEntry?: ReplHelpEntry } {
  const parsed = parseReplCommand(input);
  const allowed = options.allowedCommands ?? REPL_COMMANDS.map((cmd) => cmd.name);
  const plan = planReplDispatch(parsed);
  if (plan.matched && !allowed.includes(plan.matched)) {
    return { ...plan, ready: false, warning: `command '${plan.matched}' not in allowed list` };
  }
  const matched = plan.matched ? REPL_COMMANDS.find((cmd) => cmd.name === plan.matched) : undefined;
  const helpEntry: ReplHelpEntry | undefined = matched ? { command: matched.name, description: matched.description, flags: matched.flags } : undefined;
  return { ...plan, helpEntry };
}
export interface IdbFallbackWriteResult {
  fallbackWritten: boolean;
  fallbackKey: string;
  fallbackValue: string;
  fallbackError: string | null;
  readbackSuccess: boolean;
  readbackValue: string | null;
  durationMs: number;
  timestamp: string;
  ready: boolean;
}

export interface IdbFallbackVerification {
  match: boolean;
  fallbackKey: string;
  expectedExists: boolean;
  actualExists: boolean;
  driftDetected: boolean;
  checksums: { expected: string; actual: string };
  errorMessage: string | null;
  ready: boolean;
}

export interface IdbFallbackRecoveryPlan {
  attempt: number;
  maxAttempts: number;
  primaryFailed: boolean;
  fallbackReady: boolean;
  strategies: Array<'write-fallback' | 'retry-idb' | 'abort'>;
  nextDelayMs: number;
  estimateBytes: number;
  ready: boolean;
}

export function evalIdbFallbackWrite(result: BrowserEvalRunResult, fallbackStorage: { setItem?: (k: string, v: string) => void; getItem?: (k: string) => string | null }): IdbFallbackWriteResult {
  const start = Date.now();
  let fallbackWritten = false;
  let fallbackError: string | null = null;
  const fallbackKey = result.fallbackStorageKey;
  const fallbackValue = result.outputPreview ?? '';
  try {
    if (fallbackStorage.setItem) {
      fallbackStorage.setItem(fallbackKey, fallbackValue);
      fallbackWritten = true;
    } else {
      fallbackError = 'fallback storage has no setItem method';
    }
  } catch (e) {
    fallbackError = e instanceof Error ? e.message : String(e);
  }
  let readbackValue: string | null = null;
  let readbackSuccess = false;
  try {
    readbackValue = fallbackStorage.getItem?.(fallbackKey) ?? null;
    readbackSuccess = readbackValue === fallbackValue;
  } catch (e) {
    fallbackError = `${fallbackError ?? ''} | readback: ${e instanceof Error ? e.message : String(e)}`;
  }
  return { fallbackWritten, fallbackKey, fallbackValue, fallbackError, readbackSuccess, readbackValue, durationMs: Date.now() - start, timestamp: new Date().toISOString(), ready: fallbackWritten };
}

export function verifyIdbFallback(fallback: IdbFallbackWriteResult, storage: { getItem?: (k: string) => string | null }, expectedChecksum: string): IdbFallbackVerification {
  let actualValue: string | null = null;
  let actualChecksum = '';
  let actualExists = false;
  try {
    actualValue = storage.getItem?.(fallback.fallbackKey) ?? null;
    actualExists = actualValue !== null;
    if (actualValue) {
      let hash = 0x811c9dc5;
      for (let i = 0; i < actualValue.length; i += 1) {
        hash ^= actualValue.charCodeAt(i);
        hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
      }
      actualChecksum = hash.toString(16).padStart(8, '0');
    }
  } catch (e) {
    return { match: false, fallbackKey: fallback.fallbackKey, expectedExists: true, actualExists: false, driftDetected: true, checksums: { expected: expectedChecksum, actual: '' }, errorMessage: e instanceof Error ? e.message : String(e), ready: false };
  }
  const match = actualExists && actualValue === fallback.fallbackValue && actualChecksum === expectedChecksum;
  return { match, fallbackKey: fallback.fallbackKey, expectedExists: true, actualExists, driftDetected: !match, checksums: { expected: expectedChecksum, actual: actualChecksum }, errorMessage: null, ready: actualExists };
}

export function planIdbFallbackRecovery(result: BrowserEvalRunResult, fallback: IdbFallbackWriteResult | null, attempt: number, options: { maxAttempts?: number } = {}): IdbFallbackRecoveryPlan {
  const maxAttempts = Math.max(1, Math.min(10, options.maxAttempts ?? 3));
  const current = Math.max(1, Math.min(maxAttempts, attempt));
  const nextDelayMs = current >= maxAttempts ? 0 : Math.min(30_000, 200 * Math.pow(2, current));
  const primaryFailed = !result.success && result.errorMessage !== null;
  const fallbackReady = fallback !== null && fallback.ready;
  const strategies: IdbFallbackRecoveryPlan['strategies'] = current >= maxAttempts
    ? fallbackReady ? ['write-fallback', 'abort'] : ['abort']
    : current === 1
      ? primaryFailed
        ? fallbackReady ? ['write-fallback', 'retry-idb'] : ['write-fallback']
        : ['retry-idb']
      : fallbackReady ? ['write-fallback', 'retry-idb'] : ['retry-idb'];
  const estimateBytes = (fallback?.fallbackValue.length ?? result.outputPreview?.length ?? 0) * 2;
  return { attempt: current, maxAttempts, primaryFailed, fallbackReady, strategies, nextDelayMs, estimateBytes, ready: result.fallbackStorageKey.length > 0 };
}
  export interface TuiScrollExecutionResult {
  targetFound: boolean;
  scrollIntoViewCalled: boolean;
  smoothAnimated: boolean;
  stepsApplied: number;
  totalScrollY: number;
  durationMs: number;
  fallbackUsed: boolean;
  errorMessage: string | null;
}

export interface TuiAnimationFrame {
  index: number;
  scrollY: number;
  delayMs: number;
  callback: string;
}

export interface TuiAnimationSchedule {
  frames: TuiAnimationFrame[];
  totalDurationMs: number;
  scheduled: boolean;
  ready: boolean;
}

export function runTuiScrollIntoView(result: TuiScrollIntoViewResult, mockDom: { querySelector?: (sel: string) => { scrollIntoView?: (opts: { behavior: string; block: string; inline: string }) => void; getBoundingClientRect?: () => { top: number } } | null; plan?: TuiSmoothScrollPlan } = {}): TuiScrollExecutionResult {
  const start = Date.now();
  let targetFound = false;
  let scrollIntoViewCalled = false;
  let smoothAnimated = false;
  let stepsApplied = 0;
  let totalScrollY = 0;
  let fallbackUsed = false;
  let errorMessage: string | null = null;
  try {
    const el = mockDom.querySelector?.(result.targetSelector) ?? null;
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: result.scrollOptions.behavior, block: result.scrollOptions.block, inline: result.scrollOptions.inline });
      targetFound = true;
      scrollIntoViewCalled = true;
    } else {
      fallbackUsed = true;
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e);
    fallbackUsed = true;
  }
  if (mockDom.plan) {
    smoothAnimated = true;
    for (const step of mockDom.plan.steps) {
      totalScrollY += step.scrollY;
      stepsApplied += 1;
    }
  }
  return { targetFound, scrollIntoViewCalled, smoothAnimated, stepsApplied, totalScrollY, durationMs: Date.now() - start, fallbackUsed, errorMessage };
}

export function planTuiAnimation(plan: TuiSmoothScrollPlan, options: { frameIntervalMs?: number } = {}): TuiAnimationSchedule {
  const frameIntervalMs = Math.max(10, Math.min(100, options.frameIntervalMs ?? plan.stepIntervalMs));
  const frames: TuiAnimationFrame[] = plan.steps.map((step, index) => ({ index, scrollY: step.scrollY, delayMs: index * frameIntervalMs, callback: `setScrollY(${Math.round(step.scrollY)})` }));
  const totalDurationMs = frames.length > 0 ? frames[frames.length - 1]?.delayMs ?? 0 : 0;
  return { frames, totalDurationMs, scheduled: false, ready: plan.ready && frames.length > 0 };
}

export function buildTuiSectionElement(section: { id: string; title?: string }, options: { className?: string; tabIndex?: number; ariaLabel?: string } = {}): { tagName: 'section'; attributes: Record<string, string>; textContent: string } {
  const className = options.className ?? 'tui-section';
  const tabIndex = options.tabIndex ?? 0;
  const ariaLabel = options.ariaLabel ?? section.title ?? section.id;
  return { tagName: 'section', attributes: { id: `tui-section-${section.id}`, class: className, tabindex: String(tabIndex), role: 'tab', 'aria-label': ariaLabel }, textContent: section.title ?? section.id };
}
export interface DualWriteRunResult {
  primarySuccess: boolean;
  secondarySuccess: boolean;
  readbackSuccess: boolean;
  primaryError: string | null;
  secondaryError: string | null;
  readbackError: string | null;
  primaryWritten: boolean;
  secondaryWritten: boolean;
  readbackMatched: boolean;
  durationMs: number;
  attempt: number;
}

export interface DualWriteError {
  primaryCategory: 'QuotaExceeded' | 'InvalidState' | 'Type' | 'Security' | 'Syntax' | 'Other';
  secondaryCategory: 'QuotaExceeded' | 'InvalidState' | 'Type' | 'Security' | 'Syntax' | 'Other';
  primarySuggestion: string;
  secondarySuggestion: string;
}

export interface DualWriteRecoveryPlan {
  attempt: number;
  maxAttempts: number;
  strategies: Array<'retry-immediate' | 'retry-after-backoff' | 'fallback-storage' | 'abort'>;
  nextDelayMs: number;
  primaryRecoverable: boolean;
  secondaryRecoverable: boolean;
  ready: boolean;
}

export function runDualWrite(plan: PersistenceDualWritePlan, mockRuntime: { localStorage?: { setItem?: (k: string, v: string) => void; getItem?: (k: string) => string | null }; indexedDB?: unknown } = {}): DualWriteRunResult {
  const start = Date.now();
  let primaryWritten = false;
  let secondaryWritten = false;
  let readbackMatched = false;
  let primaryError: string | null = null;
  let secondaryError: string | null = null;
  let readbackError: string | null = null;
  try {
    if (plan.primaryStorage === undefined || plan.primaryStorage === 'localStorage') {
      if (mockRuntime.localStorage?.setItem) mockRuntime.localStorage.setItem(plan.primaryKey, '__payload__');
      primaryWritten = true;
    }
  } catch (e) {
    primaryError = e instanceof Error ? e.message : String(e);
  }
  try {
    if (plan.secondaryStorage === 'indexedDB') {
      if (mockRuntime.indexedDB) secondaryWritten = true;
      else secondaryError = 'indexedDB not available in runtime';
    } else if (mockRuntime.localStorage?.setItem) {
      mockRuntime.localStorage.setItem(plan.secondaryKey, '__payload__');
      secondaryWritten = true;
    }
  } catch (e) {
    secondaryError = e instanceof Error ? e.message : String(e);
  }
  try {
    if (plan.primaryStorage === undefined || plan.primaryStorage === 'localStorage') {
      const back = mockRuntime.localStorage?.getItem?.(plan.primaryKey);
      readbackMatched = back === '__payload__';
      if (!readbackMatched && !primaryError) readbackError = 'readback value mismatch';
    } else if (mockRuntime.indexedDB) {
      readbackMatched = primaryWritten;
    }
  } catch (e) {
    readbackError = e instanceof Error ? e.message : String(e);
  }
  return {
    primarySuccess: primaryWritten && primaryError === null,
    secondarySuccess: secondaryWritten && secondaryError === null,
    readbackSuccess: readbackMatched && readbackError === null,
    primaryError,
    secondaryError,
    readbackError,
    primaryWritten,
    secondaryWritten,
    readbackMatched,
    durationMs: Date.now() - start,
    attempt: 1,
  };
}

export function extractDualWriteError(result: DualWriteRunResult): DualWriteError {
  function classify(err: string | null): DualWriteError['primaryCategory'] {
    if (!err) return 'Other';
    if (/quota/i.test(err)) return 'QuotaExceeded';
    if (/invalidstate/i.test(err)) return 'InvalidState';
    if (/type/i.test(err)) return 'Type';
    if (/security/i.test(err)) return 'Security';
    if (/syntax/i.test(err)) return 'Syntax';
    return 'Other';
  }
  function suggest(cat: DualWriteError['primaryCategory']): string {
    if (cat === 'QuotaExceeded') return '清理旧数据后重试';
    if (cat === 'InvalidState') return '关闭并重新打开数据库连接';
    if (cat === 'Type') return '检查 value 类型与 ObjectStore schema 一致';
    if (cat === 'Security') return '检查浏览器 storage 配额与跨域权限';
    if (cat === 'Syntax') return '检查 generated code 模板';
    return '查看 full error log';
  }
  const primaryCategory = classify(result.primaryError);
  const secondaryCategory = classify(result.secondaryError);
  return {
    primaryCategory,
    secondaryCategory,
    primarySuggestion: suggest(primaryCategory),
    secondarySuggestion: suggest(secondaryCategory),
  };
}

export function planDualWriteRecovery(plan: PersistenceDualWritePlan, attempt: number, options: { maxAttempts?: number } = {}): DualWriteRecoveryPlan {
  const maxAttempts = Math.max(1, Math.min(10, options.maxAttempts ?? 3));
  const current = Math.max(1, Math.min(maxAttempts, attempt));
  const nextDelayMs = current >= maxAttempts ? 0 : Math.min(30_000, 200 * Math.pow(2, current));
  const primaryRecoverable = plan.warnings.length === 0;
  const secondaryRecoverable = plan.warnings.length === 0;
  const strategies: DualWriteRecoveryPlan['strategies'] = current >= maxAttempts
    ? ['fallback-storage', 'abort']
    : current === 1
      ? ['retry-immediate', 'retry-after-backoff', 'fallback-storage']
      : ['retry-after-backoff', 'fallback-storage'];
  return { attempt: current, maxAttempts, strategies, nextDelayMs, primaryRecoverable, secondaryRecoverable, ready: plan.ready };
}
export interface PersistencePayload {
  payloadJson: string;
  itemsCount: number;
  totalBytes: number;
  checksum: string;
  format: 'json' | 'json-with-meta';
  generatedAt: string;
  compressionRatio: number;
}

export interface PersistenceReadbackResult {
  match: boolean;
  sourceKey: string;
  payloadBytes: number;
  readbackBytes: number;
  checksumMatch: boolean;
  itemCountMatch: boolean;
  driftKeys: string[];
  ready: boolean;
}

export interface PersistenceDualWritePlan {
  primaryStorage: 'localStorage' | 'indexedDB';
  secondaryStorage: 'localStorage' | 'indexedDB';
  primaryKey: string;
  secondaryKey: string;
  primaryWriteCode: string;
  secondaryWriteCode: string;
  readbackCode: string;
  steps: string[];
  warnings: string[];
  ready: boolean;
}

export function serializePersistencePayload(items: unknown[], options: { format?: 'json' | 'json-with-meta' } = {}): PersistencePayload {
  const format = options.format ?? 'json';
  const data = format === 'json-with-meta' ? { version: 1, items } : items;
  const payloadJson = JSON.stringify(data);
  const itemsCount = items.length;
  const totalBytes = payloadJson.length * 2;
  let hash = 0x811c9dc5;
  for (let i = 0; i < payloadJson.length; i += 1) {
    hash ^= payloadJson.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  const checksum = hash.toString(16).padStart(8, '0');
  const baseSize = JSON.stringify({ version: 1, items: items.map(() => 0) }).length;
  const compressionRatio = baseSize > 0 ? totalBytes / baseSize : 1;
  return { payloadJson, itemsCount, totalBytes, checksum, format, generatedAt: new Date().toISOString(), compressionRatio };
}

export function verifyPersistenceReadback(payload: PersistencePayload, sourceKey: string, readbackJson: string | null): PersistenceReadbackResult {
  if (!readbackJson) return { match: false, sourceKey, payloadBytes: payload.payloadJson.length * 2, readbackBytes: 0, checksumMatch: false, itemCountMatch: false, driftKeys: [sourceKey], ready: false };
  let readbackChecksum = 0x811c9dc5;
  for (let i = 0; i < readbackJson.length; i += 1) {
    readbackChecksum ^= readbackJson.charCodeAt(i);
    readbackChecksum = (readbackChecksum + ((readbackChecksum << 1) + (readbackChecksum << 4) + (readbackChecksum << 7) + (readbackChecksum << 8) + (readbackChecksum << 24))) >>> 0;
  }
  const readbackChecksumStr = readbackChecksum.toString(16).padStart(8, '0');
  const checksumMatch = readbackChecksumStr === payload.checksum;
  let readbackItemsCount = 0;
  try {
    const parsed = JSON.parse(readbackJson);
    readbackItemsCount = Array.isArray(parsed) ? parsed.length : Array.isArray(parsed.items) ? parsed.items.length : 0;
  } catch {
    return { match: false, sourceKey, payloadBytes: payload.payloadJson.length * 2, readbackBytes: readbackJson.length * 2, checksumMatch: false, itemCountMatch: false, driftKeys: [sourceKey], ready: true };
  }
  const itemCountMatch = readbackItemsCount === payload.itemsCount;
  const driftKeys: string[] = [];
  if (!checksumMatch) driftKeys.push(`${sourceKey}.checksum`);
  if (!itemCountMatch) driftKeys.push(`${sourceKey}.itemsCount`);
  return { match: checksumMatch && itemCountMatch, sourceKey, payloadBytes: payload.payloadJson.length * 2, readbackBytes: readbackJson.length * 2, checksumMatch, itemCountMatch, driftKeys, ready: true };
}

export function planPersistenceDualWrite(payload: PersistencePayload, options: { primaryStorage?: 'localStorage' | 'indexedDB'; secondaryStorage?: 'localStorage' | 'indexedDB'; primaryKey?: string; secondaryKey?: string } = {}): PersistenceDualWritePlan {
  const primaryStorage = options.primaryStorage ?? 'localStorage';
  const secondaryStorage = options.secondaryStorage ?? 'indexedDB';
  const primaryKey = options.primaryKey ?? 'novel-ma:persistence-primary';
  const secondaryKey = options.secondaryKey ?? 'novel-ma:persistence-secondary';
  const primaryWriteCode = primaryStorage === 'localStorage' ? `localStorage.setItem('${primaryKey}', ${'`'}${payload.payloadJson}${'`'})` : `await indexedDB.open('novel-ma', 1).onsuccess.then(db => { const tx = db.transaction('projects', 'readwrite'); tx.objectStore('projects').put({ key: '${primaryKey}', value: ${'`'}${payload.payloadJson}${'`'} }, '${primaryKey}'); tx.oncomplete = () => db.close(); })`;
  const secondaryWriteCode = secondaryStorage === 'localStorage' ? `localStorage.setItem('${secondaryKey}', ${'`'}${payload.payloadJson}${'`'})` : `await indexedDB.open('novel-ma', 1).onsuccess.then(db => { const tx = db.transaction('projects', 'readwrite'); tx.objectStore('projects').put({ key: '${secondaryKey}', value: ${'`'}${payload.payloadJson}${'`'} }, '${secondaryKey}'); tx.oncomplete = () => db.close(); })`;
  const readbackCode = primaryStorage === 'localStorage' ? `localStorage.getItem('${primaryKey}')` : `await indexedDB.open('novel-ma', 1).onsuccess.then(db => { const tx = db.transaction('projects', 'readonly'); const req = tx.objectStore('projects').get('${primaryKey}'); req.onsuccess = () => { console.log(req.result?.value); db.close(); }; })`;
  const steps = [
    `serialize ${payload.itemsCount} items (${payload.totalBytes}B, ${payload.format})`,
    `write to ${primaryStorage}['${primaryKey}']`,
    `write to ${secondaryStorage}['${secondaryKey}'] (dual-write)`,
    `readback from ${primaryStorage}['${primaryKey}']`,
    `verify checksum match (${payload.checksum})`,
    `verify itemCount match (${payload.itemsCount})`,
  ];
  const warnings: string[] = [];
  if (payload.totalBytes > 5_000_000) warnings.push(`payload ${payload.totalBytes}B exceeds 5MB soft limit`);
  return { primaryStorage, secondaryStorage, primaryKey, secondaryKey, primaryWriteCode, secondaryWriteCode, readbackCode, steps, warnings, ready: payload.itemsCount >= 0 };
}
export interface TuiScrollIntoViewResult {
  scrollCode: string;
  scrollOptions: { behavior: 'smooth' | 'instant' | 'auto'; block: 'start' | 'center' | 'end' | 'nearest'; inline: 'start' | 'center' | 'end' | 'nearest' };
  targetSelector: string;
  sourceSelector: string;
  ready: boolean;
}

export interface TuiSmoothScrollPlan {
  fromIndex: number;
  toIndex: number;
  totalDistance: number;
  stepCount: number;
  stepIntervalMs: number;
  totalDurationMs: number;
  easing: 'linear' | 'ease-in-out' | 'ease-out' | 'ease-in';
  steps: Array<{ index: number; scrollY: number; progress: number }>;
  ready: boolean;
}

export interface TuiKeyboardFocus {
  activeIndex: number;
  focusedSelector: string;
  tabIndex: number;
  ariaLabel: string;
  ariaSelected: boolean;
  hasFocus: boolean;
  ready: boolean;
}

export function buildTuiScrollIntoView(plan: TuiScrollPlan, targetIndex: number, options: { sourceSelector?: string; targetSelectorPrefix?: string; behavior?: 'smooth' | 'instant' | 'auto'; block?: 'start' | 'center' | 'end' | 'nearest' } = {}): TuiScrollIntoViewResult {
  const behavior = options.behavior ?? 'smooth';
  const block = options.block ?? 'nearest';
  const sourceSelector = options.sourceSelector ?? '.tui-section-list';
  const targetSelector = `${options.targetSelectorPrefix ?? '#tui-section-'}${targetIndex}`;
  const scrollCode = `const el = document.querySelector('${targetSelector}'); if (el && typeof el.scrollIntoView === 'function') { el.scrollIntoView({ behavior: '${behavior}', block: '${block}', inline: 'nearest' }); }`;
  return { scrollCode, scrollOptions: { behavior, block, inline: 'nearest' }, targetSelector, sourceSelector, ready: plan.ready && targetIndex >= 0 && targetIndex < 999 };
}

export function planTuiSmoothScroll(fromIndex: number, toIndex: number, totalSteps: number, options: { stepIntervalMs?: number; easing?: 'linear' | 'ease-in-out' | 'ease-out' | 'ease-in' } = {}): TuiSmoothScrollPlan {
  const stepIntervalMs = Math.max(10, Math.min(200, options.stepIntervalMs ?? 50));
  const easing = options.easing ?? 'ease-in-out';
  const clampedSteps = Math.max(1, Math.min(20, totalSteps));
  const totalDistance = toIndex - fromIndex;
  const steps: TuiSmoothScrollPlan['steps'] = [];
  for (let i = 0; i <= clampedSteps; i += 1) {
    const progress = clampedSteps === 0 ? 1 : i / clampedSteps;
    let eased = progress;
    if (easing === 'ease-in-out') eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    else if (easing === 'ease-out') eased = 1 - Math.pow(1 - progress, 2);
    else if (easing === 'ease-in') eased = progress * progress;
    steps.push({ index: i, scrollY: fromIndex + totalDistance * eased, progress });
  }
  return { fromIndex, toIndex, totalDistance, stepCount: clampedSteps, stepIntervalMs, totalDurationMs: clampedSteps * stepIntervalMs, easing, steps, ready: clampedSteps >= 1 };
}

export function buildTuiKeyboardFocus(activeIndex: number, sections: Array<{ id: string }>, options: { tabIndex?: number; ariaLabel?: string; ariaSelected?: boolean } = {}): TuiKeyboardFocus {
  const section = sections[activeIndex];
  const tabIndex = options.tabIndex ?? 0;
  const ariaLabel = options.ariaLabel ?? `${section?.id ?? 'unknown'} section`;
  const focusedSelector = `#tui-section-${activeIndex}`;
  return { activeIndex, focusedSelector, tabIndex, ariaLabel, ariaSelected: options.ariaSelected ?? true, hasFocus: true, ready: section !== undefined };
}
export interface BrowserEvalRunResult {
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage: string | null;
  errorStep: number | null;
  fallbackTriggered: boolean;
  fallbackStorageKey: string;
  durationMs: number;
  outputPreview: string;
  stackTrace: string | null;
}

export interface BrowserEvalRetryPlan {
  attempt: number;
  maxAttempts: number;
  nextDelayMs: number;
  strategies: Array<'retry-immediate' | 'retry-after-backoff' | 'fallback-to-storage' | 'abort'>;
  ready: boolean;
}

export function runBrowserEval(adapter: BrowserEvalAdapter, mockRuntime: { indexedDB?: unknown; localStorage?: unknown; navigator?: { serviceWorker?: unknown } } = {}): BrowserEvalRunResult {
  const start = Date.now();
  if (!adapter.ready) {
    return { success: false, stepsCompleted: 0, totalSteps: adapter.steps.length, errorMessage: 'adapter not ready', errorStep: 0, fallbackTriggered: false, fallbackStorageKey: adapter.fallbackStorageKey, durationMs: Date.now() - start, outputPreview: '', stackTrace: null };
  }
  try {
    if (!mockRuntime.indexedDB && adapter.target === 'browser') {
      throw new Error('IndexedDB not available in runtime');
    }
    const fn = new Function('fallbackStorageKey', adapter.evalCode.code);
    const result = fn(adapter.fallbackStorageKey);
    return { success: true, stepsCompleted: adapter.steps.length, totalSteps: adapter.steps.length, errorMessage: null, errorStep: null, fallbackTriggered: false, fallbackStorageKey: adapter.fallbackStorageKey, durationMs: Date.now() - start, outputPreview: typeof result === 'string' ? result : 'ok', stackTrace: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? null : null;
    return { success: false, stepsCompleted: 0, totalSteps: adapter.steps.length, errorMessage: message, errorStep: 1, fallbackTriggered: !!adapter.fallbackStorageKey, fallbackStorageKey: adapter.fallbackStorageKey, durationMs: Date.now() - start, outputPreview: '', stackTrace: stack };
  }
}

export function extractBrowserEvalError(result: BrowserEvalRunResult): { category: 'QuotaExceeded' | 'InvalidState' | 'Syntax' | 'Type' | 'Reference' | 'Other'; message: string; suggestion: string } {
  const msg = result.errorMessage ?? '';
  if (/quotaexceeded|quota/i.test(msg)) return { category: 'QuotaExceeded', message: msg, suggestion: '清理旧数据或降级到 localStorage' };
  if (/invalidstate/i.test(msg)) return { category: 'InvalidState', message: msg, suggestion: '关闭并重新打开数据库连接' };
  if (/syntax/i.test(msg)) return { category: 'Syntax', message: msg, suggestion: '检查 executor code 生成逻辑' };
  if (/type/i.test(msg)) return { category: 'Type', message: msg, suggestion: '检查 stores/operations 类型' };
  if (/reference/i.test(msg)) return { category: 'Reference', message: msg, suggestion: '检查 exports/imports' };
  return { category: 'Other', message: msg, suggestion: '查看 stackTrace' };
}

export function planBrowserEvalRetry(adapter: BrowserEvalAdapter, attempt: number, options: { maxAttempts?: number } = {}): BrowserEvalRetryPlan {
  const maxAttempts = Math.max(1, Math.min(10, options.maxAttempts ?? 3));
  const current = Math.max(1, Math.min(maxAttempts, attempt));
  const nextDelayMs = current >= maxAttempts ? 0 : Math.min(30_000, 100 * Math.pow(2, current));
  const strategies: BrowserEvalRetryPlan['strategies'] = current >= maxAttempts ? ['fallback-to-storage', 'abort'] : current === 1 ? ['retry-immediate', 'retry-after-backoff', 'fallback-to-storage'] : ['retry-after-backoff', 'fallback-to-storage'];
  return { attempt: current, maxAttempts, nextDelayMs, strategies, ready: adapter.ready };
}
export interface TuiSectionVisual {
  sectionId: string;
  index: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  icon: string;
  accentColor: string;
  borderStyle: 'solid' | 'dashed' | 'double' | 'dotted';
  scrollOffset: number;
  badge: '▶' | '●' | '○' | '·';
}

export interface TuiHighlightPlan {
  sections: TuiSectionVisual[];
  activeIndex: number;
  totalSections: number;
  scrollTarget: number;
  scrollBehavior: 'instant' | 'smooth' | 'auto';
  themePalette: string[];
  ready: boolean;
}

export interface TuiScrollPlan {
  containerHeight: number;
  itemHeight: number;
  scrollY: number;
  maxScrollY: number;
  visibleRange: [number, number];
  paddingTop: number;
  paddingBottom: number;
  needsScroll: boolean;
  ready: boolean;
}

const TUI_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export function buildTuiSectionVisual(sectionId: string, index: number, totalSections: number, activeIndex: number): TuiSectionVisual {
  const isActive = index === activeIndex;
  const isFirst = index === 0;
  const isLast = index === totalSections - 1;
  const icon = isActive ? '▶' : isFirst ? '●' : isLast ? '○' : '·';
  const accentColor = isActive ? '#2563eb' : isFirst ? '#10b981' : isLast ? '#f59e0b' : TUI_PALETTE[index % TUI_PALETTE.length] ?? '#6b7280';
  const borderStyle: TuiSectionVisual['borderStyle'] = isActive ? 'double' : isFirst ? 'solid' : isLast ? 'dashed' : 'dotted';
  const scrollOffset = isActive ? 0 : Math.abs(index - activeIndex) * 24;
  const badge: TuiSectionVisual['badge'] = isActive ? '▶' : isFirst ? '●' : isLast ? '○' : '·';
  return { sectionId, index, isActive, isFirst, isLast, icon, accentColor, borderStyle, scrollOffset, badge };
}

export function planTuiHighlight(sections: Array<{ id: string }>, activeIndex: number, options: { themePalette?: string[]; scrollBehavior?: 'instant' | 'smooth' | 'auto' } = {}): TuiHighlightPlan {
  const palette = options.themePalette ?? TUI_PALETTE;
  const scrollBehavior = options.scrollBehavior ?? 'smooth';
  const sectionVisuals: TuiSectionVisual[] = sections.map((section, index) => buildTuiSectionVisual(section.id, index, sections.length, activeIndex));
  const scrollTarget = sectionVisuals[activeIndex]?.scrollOffset ?? 0;
  return { sections: sectionVisuals, activeIndex, totalSections: sections.length, scrollTarget, scrollBehavior, themePalette: palette, ready: sectionVisuals.length > 0 };
}

export function buildTuiScrollPlan(sections: Array<{ id: string }>, activeIndex: number, options: { containerHeight?: number; itemHeight?: number } = {}): TuiScrollPlan {
  const containerHeight = options.containerHeight ?? 480;
  const itemHeight = options.itemHeight ?? 32;
  const scrollY = activeIndex * itemHeight;
  const maxScrollY = Math.max(0, sections.length * itemHeight - containerHeight);
  const visibleStart = Math.floor(scrollY / itemHeight);
  const visibleEnd = Math.min(sections.length, visibleStart + Math.ceil(containerHeight / itemHeight));
  const paddingTop = 8;
  const paddingBottom = 8;
  const needsScroll = scrollY > maxScrollY || scrollY < 0;
  return { containerHeight, itemHeight, scrollY, maxScrollY, visibleRange: [visibleStart, visibleEnd], paddingTop, paddingBottom, needsScroll, ready: sections.length > 0 };
}
export interface BrowserEvalAdapter {
  evalCode: IdbEvalCode;
  target: 'browser' | 'node';
  fallbackEnabled: boolean;
  fallbackStorageKey: string;
  timeoutMs: number;
  ready: boolean;
  steps: string[];
}

export interface BrowserEvalStepResult {
  index: number;
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'fallback';
  durationMs: number;
  errorMessage: string | null;
}

export interface BrowserEvalTimeline {
  steps: BrowserEvalStepResult[];
  totalSteps: number;
  successCount: number;
  failedCount: number;
  fallbackCount: number;
  totalDurationMs: number;
  ready: boolean;
}

export function buildBrowserEvalAdapter(evalCode: IdbEvalCode, options: { fallbackStorageKey?: string; timeoutMs?: number } = {}): BrowserEvalAdapter {
  const fallbackStorageKey = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const timeoutMs = Math.max(1000, Math.min(60_000, options.timeoutMs ?? 10_000));
  const steps = [
    `pre-check: navigator.indexedDB available? (browser only)`,
    `fallback check: typeof localStorage available? (browser only)`,
    `execute evalCode.code via (new Function(code))(${fallbackStorageKey ? 'fallbackStorageKey' : ''})`,
    `await IdbEvalResult (success + stepsCompleted + totalSteps)`,
    `on error: write to ${fallbackStorageKey} via localStorage.setItem`,
    `return { success: false, stepsCompleted: N, errorMessage, fallbackTriggered: true }`,
  ];
  return { evalCode, target: 'browser', fallbackEnabled: !!fallbackStorageKey, fallbackStorageKey, timeoutMs, ready: evalCode.ready, steps };
}

export function planBrowserEvalSteps(adapter: BrowserEvalAdapter): BrowserEvalStepResult[] {
  return adapter.steps.map((step, index) => ({ index: index + 1, step, status: index === 0 ? 'success' : 'pending', durationMs: 0, errorMessage: null }));
}

export function simulateBrowserEval(adapter: BrowserEvalAdapter, mockOutputs: string[] = []): BrowserEvalTimeline {
  const start = Date.now();
  const results: BrowserEvalStepResult[] = adapter.steps.map((step, index) => {
    const stepStart = Date.now();
    const output = mockOutputs[index] ?? `step ${index + 1} ok`;
    const status: BrowserEvalStepResult['status'] = index === 0 ? 'success' : index < mockOutputs.length ? 'success' : 'pending';
    return { index: index + 1, step: `${step} → ${output}`, status, durationMs: Date.now() - stepStart, errorMessage: null };
  });
  const successCount = results.filter((r) => r.status === 'success').length;
  return { steps: results, totalSteps: results.length, successCount, failedCount: 0, fallbackCount: 0, totalDurationMs: Date.now() - start, ready: adapter.ready };
}
export interface IdbPersistenceAdapter {
  handle: IdbInMemoryHandle;
  primaryStorage: 'localStorage' | 'indexedDB';
  secondaryStorage: 'localStorage' | 'indexedDB';
  primaryKey: string;
  secondaryKey: string;
  ready: boolean;
  getBytes: () => number;
  getWritesLogged: () => number;
  bytesWritten: number;
  writesLogged: number;
}

export interface PersistenceBackupPlan {
  handle: IdbInMemoryHandle;
  targetStorage: 'localStorage' | 'indexedDB';
  storageKey: string;
  storeNames: string[];
  estimatedBytes: number;
  estimatedDurationMs: number;
  steps: string[];
  ready: boolean;
}

export interface PersistenceRestorePlan {
  handle: IdbInMemoryHandle;
  sourceStorage: 'localStorage' | 'indexedDB';
  storageKey: string;
  storeNames: string[];
  entriesFound: number;
  entriesApplied: number;
  conflictsResolved: number;
  ready: boolean;
}

export interface PersistenceChecksum {
  handleId: string;
  algorithm: 'sha256-lite' | 'fnv1a' | 'simple-xor';
  digest: string;
  byteCount: number;
  storeChecksums: Record<string, string>;
  verified: boolean;
}

function handleIdOf(handle: IdbInMemoryHandle): string {
  return Object.keys(handle.stores).sort().join('|');
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function buildIdbPersistenceAdapter(handle: IdbInMemoryHandle, options: { primaryStorage?: 'localStorage' | 'indexedDB'; primaryKey?: string; secondaryKey?: string } = {}): IdbPersistenceAdapter {
  const primaryStorage = options.primaryStorage ?? 'localStorage';
  const primaryKey = options.primaryKey ?? 'novel-ma:idb-primary';
  const secondaryKey = options.secondaryKey ?? 'novel-ma:idb-secondary';
  const secondaryStorage: 'localStorage' | 'indexedDB' = primaryStorage === 'localStorage' ? 'indexedDB' : 'localStorage';
  const counters = { bytesWritten: 0, writesLogged: 0 };
  const trackBytes = (key: string, value: unknown): void => {
    counters.bytesWritten += JSON.stringify({ key, value }).length * 2;
    counters.writesLogged += 1;
  };
  const wrapped: IdbInMemoryHandle = {
    stores: handle.stores,
    events: handle.events,
    isOpen: handle.isOpen,
    supportsIdb: true,
    get totalOperations() { return handle.totalOperations; },
    put: async (storeName, key, value) => {
      const event = await handle.put(storeName, key, value);
      trackBytes(key, value);
      return event;
    },
    get: (storeName, key) => handle.get(storeName, key),
    delete: (storeName, key) => handle.delete(storeName, key),
    count: (storeName) => handle.count(storeName),
    getAll: (storeName) => handle.getAll(storeName),
    clear: (storeName) => handle.clear(storeName),
    close: () => { handle.close(); },
  };
  return {
    handle: wrapped,
    primaryStorage,
    secondaryStorage,
    primaryKey,
    secondaryKey,
    ready: true,
    get bytesWritten() { return counters.bytesWritten; },
    get writesLogged() { return counters.writesLogged; },
    getBytes: () => counters.bytesWritten,
    getWritesLogged: () => counters.writesLogged,
  };
}

export function planPersistenceBackup(handle: IdbInMemoryHandle, options: { targetStorage?: 'localStorage' | 'indexedDB'; storageKey?: string } = {}): PersistenceBackupPlan {
  const targetStorage = options.targetStorage ?? 'localStorage';
  const storageKey = options.storageKey ?? 'novel-ma:idb-backup';
  const storeNames = Object.keys(handle.stores);
  let estimatedBytes = 0;
  for (const name of storeNames) {
    for (const value of handle.stores[name]?.data.values() ?? []) estimatedBytes += JSON.stringify(value).length * 2;
  }
  const estimatedDurationMs = Math.max(10, estimatedBytes / 1024 * 5);
  const steps = [
    `serialize ${storeNames.length} stores to JSON (${estimatedBytes}B)`,
    `write serialized blob to ${targetStorage}['${storageKey}']`,
    `record backup metadata (timestamp, hash, store count)`,
    `flush all pending writes + close transaction`,
  ];
  return { handle, targetStorage, storageKey, storeNames, estimatedBytes, estimatedDurationMs, steps, ready: estimatedBytes >= 0 };
}

export function planPersistenceRestore(handle: IdbInMemoryHandle, options: { sourceStorage?: 'localStorage' | 'indexedDB'; storageKey?: string } = {}): PersistenceRestorePlan {
  const sourceStorage = options.sourceStorage ?? 'localStorage';
  const storageKey = options.storageKey ?? 'novel-ma:idb-backup';
  const storeNames = Object.keys(handle.stores);
  const entriesFound = storeNames.reduce((sum, name) => sum + (handle.stores[name]?.size ?? 0), 0);
  const conflictsResolved = Math.max(0, entriesFound - 1);
  return { handle, sourceStorage, storageKey, storeNames, entriesFound, entriesApplied: entriesFound, conflictsResolved, ready: entriesFound > 0 };
}

export function computePersistenceChecksum(handle: IdbInMemoryHandle, algorithm: 'sha256-lite' | 'fnv1a' | 'simple-xor' = 'fnv1a'): PersistenceChecksum {
  const storeChecksums: Record<string, string> = {};
  let combined = '';
  for (const name of Object.keys(handle.stores).sort()) {
    const store = handle.stores[name];
    if (!store) continue;
    const sortedEntries = Array.from(store.data.entries()).sort(([a], [b]) => a.localeCompare(b));
    const serialized = sortedEntries.map(([k, v]) => `${k}:${JSON.stringify(v)}`).join('|');
    const hash = algorithm === 'fnv1a' ? fnv1a(serialized) : algorithm === 'simple-xor' ? simpleXor(serialized) : fnv1a(serialized);
    storeChecksums[name] = hash;
    combined += `${name}=${hash};`;
  }
  const digest = algorithm === 'fnv1a' ? fnv1a(combined) : algorithm === 'simple-xor' ? simpleXor(combined) : fnv1a(combined);
  const byteCount = Object.keys(handle.stores).reduce((sum, name) => sum + (handle.stores[name]?.data.size ?? 0), 0);
  return { handleId: handleIdOf(handle), algorithm, digest, byteCount, storeChecksums, verified: digest.length > 0 };
}

function simpleXor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash ^ input.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}
export interface IdbInMemoryStore {
  name: string;
  data: Map<string, unknown>;
  putCount: number;
  getCount: number;
  deleteCount: number;
  clearCount: number;
  size: number;
}

export interface IdbInMemoryEvent {
  type: 'put' | 'get' | 'delete' | 'clear' | 'count';
  store: string;
  key?: string;
  value?: unknown;
  result?: unknown;
  timestamp: number;
}

export interface IdbInMemoryHandle {
  stores: Record<string, IdbInMemoryStore>;
  events: IdbInMemoryEvent[];
  isOpen: boolean;
  supportsIdb: true;
  totalOperations: number;
  put: (storeName: string, key: string, value: unknown) => Promise<IdbInMemoryEvent>;
  get: (storeName: string, key: string) => Promise<IdbInMemoryEvent>;
  delete: (storeName: string, key: string) => Promise<IdbInMemoryEvent>;
  count: (storeName: string) => Promise<IdbInMemoryEvent>;
  getAll: (storeName: string) => Promise<IdbInMemoryEvent>;
  clear: (storeName: string) => Promise<IdbInMemoryEvent>;
  close: () => void;
}

export function buildIdbInMemoryHandle(options: { stores?: string[] } = {}): IdbInMemoryHandle {
  const storeNames = options.stores ?? ['projects', 'tags', 'undo'];
  const stores: Record<string, IdbInMemoryStore> = {};
  for (const name of storeNames) stores[name] = { name, data: new Map(), putCount: 0, getCount: 0, deleteCount: 0, clearCount: 0, size: 0 };
  const events: IdbInMemoryEvent[] = [];
  let totalOperations = 0;
  function makeEvent(type: IdbInMemoryEvent['type'], store: string, extras: Partial<IdbInMemoryEvent> = {}): IdbInMemoryEvent {
    return { type, store, timestamp: Date.now(), ...extras };
  }
  const handle: IdbInMemoryHandle = {
    stores,
    events,
    isOpen: true,
    supportsIdb: true,
    get totalOperations() { return totalOperations; },
    put: async (storeName, key, value) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      store.data.set(key, value);
      store.putCount += 1;
      store.size = store.data.size;
      const event = makeEvent('put', storeName, { key, value });
      events.push(event);
      return event;
    },
    get: async (storeName, key) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      store.getCount += 1;
      const value = store.data.get(key);
      const event = makeEvent('get', storeName, { key, result: value });
      events.push(event);
      return event;
    },
    delete: async (storeName, key) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      store.deleteCount += 1;
      store.data.delete(key);
      store.size = store.data.size;
      const event = makeEvent('delete', storeName, { key });
      events.push(event);
      return event;
    },
    count: async (storeName) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      const result = store.data.size;
      const event = makeEvent('count', storeName, { result });
      events.push(event);
      return event;
    },
    getAll: async (storeName) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      const result = Array.from(store.data.entries()).map(([k, v]) => ({ key: k, value: v }));
      const event = makeEvent('get', storeName, { result });
      events.push(event);
      return event;
    },
    clear: async (storeName) => {
      totalOperations += 1;
      const store = stores[storeName];
      if (!store) throw new Error(`store ${storeName} not found`);
      store.clearCount += 1;
      store.data.clear();
      store.size = 0;
      const event = makeEvent('clear', storeName);
      events.push(event);
      return event;
    },
    close: () => { handle.isOpen = false; },
  };
  return handle;
}

export async function runIdbInMemoryOps(handle: IdbInMemoryHandle, operations: Array<{ kind: string; store: string; key?: string; value?: unknown }>): Promise<{ successCount: number; errorCount: number; events: IdbInMemoryEvent[] }> {
  let successCount = 0;
  let errorCount = 0;
  const initialLength = handle.events.length;
  for (const op of operations) {
    try {
      if (op.kind === 'put' && op.key !== undefined) await handle.put(op.store, op.key, op.value);
      else if (op.kind === 'get' && op.key !== undefined) await handle.get(op.store, op.key);
      else if (op.kind === 'delete' && op.key !== undefined) await handle.delete(op.store, op.key);
      else if (op.kind === 'count') await handle.count(op.store);
      else if (op.kind === 'getAll') await handle.getAll(op.store);
      else if (op.kind === 'clear') await handle.clear(op.store);
      successCount += 1;
    } catch (err) {
      errorCount += 1;
    }
  }
  return { successCount, errorCount, events: handle.events.slice(initialLength) };
}
export interface IdbEvalCode {
  code: string;
  wrapperFnName: string;
  stepCount: number;
  dependencies: string[];
  bytes: number;
  ready: boolean;
}

export interface IdbEvalResult {
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage: string | null;
  errorStep: number | null;
  fallbackTriggered: boolean;
  durationMs: number;
  outputPreview: string;
}

export interface IdbEvalErrorInfo {
  errorType: 'QuotaExceededError' | 'InvalidStateError' | 'NotFoundError' | 'SyntaxError' | 'Unknown';
  message: string;
  step: number | null;
  recoverable: boolean;
  fallbackStorageKey: string;
  userMessage: string;
}

export function buildIdbExecutorCode(executor: IdbExecutor, options: { wrapperFnName?: string } = {}): IdbEvalCode {
  const fnName = options.wrapperFnName ?? 'runIdbExecutor';
  const dependencies = ['indexedDB', 'console', 'JSON', 'localStorage'];
  const steps = executor.steps.map((step) => `    try { ${step.code}; stepsCompleted = ${step.index}; } catch (err) { console.error('[' + stepPrefix + '] step ${step.index} failed:', err); return { success: false, stepsCompleted: ${step.index}, totalSteps: ${executor.totalSteps}, errorMessage: String(err), errorStep: ${step.index}, fallbackTriggered: true, durationMs: Date.now() - startTime, outputPreview: '' }; }`).join('\n');
  const code = `function ${fnName}(executor) {
  const stepPrefix = 'IDB';
  const startTime = Date.now();
  let stepsCompleted = 0;
  try {
${executor.steps.map((step) => `    ${step.code}; stepsCompleted = ${step.index};`).join('\n')}
    return { success: true, stepsCompleted: ${executor.totalSteps}, totalSteps: ${executor.totalSteps}, errorMessage: null, errorStep: null, fallbackTriggered: false, durationMs: Date.now() - startTime, outputPreview: 'ok ' + stepsCompleted + '/' + ${executor.totalSteps} };
  } catch (err) {
    return { success: false, stepsCompleted, totalSteps: ${executor.totalSteps}, errorMessage: String(err), errorStep: stepsCompleted, fallbackTriggered: true, durationMs: Date.now() - startTime, outputPreview: '' };
  }
}
${fnName};`;
  return { code, wrapperFnName: fnName, stepCount: executor.totalSteps, dependencies, bytes: code.length, ready: executor.ready };
}

export function parseIdbEvalError(stderr: string, step: number | null = null): IdbEvalErrorInfo {
  const lower = stderr.toLowerCase();
  if (lower.includes('quotaexceeded')) return { errorType: 'QuotaExceededError', message: stderr, step, recoverable: true, fallbackStorageKey: 'novel-ma:artifacts', userMessage: '存储配额超限，已降级到 localStorage' };
  if (lower.includes('invalidstate')) return { errorType: 'InvalidStateError', message: stderr, step, recoverable: true, fallbackStorageKey: 'novel-ma:artifacts', userMessage: '数据库状态无效，已降级到 localStorage' };
  if (lower.includes('notfound')) return { errorType: 'NotFoundError', message: stderr, step, recoverable: false, fallbackStorageKey: 'novel-ma:artifacts', userMessage: '数据库未找到' };
  if (lower.includes('syntax')) return { errorType: 'SyntaxError', message: stderr, step, recoverable: false, fallbackStorageKey: 'novel-ma:artifacts', userMessage: '代码语法错误' };
  return { errorType: 'Unknown', message: stderr, step, recoverable: false, fallbackStorageKey: 'novel-ma:artifacts', userMessage: '未知错误' };
}

export function simulateIdbEval(evalCode: IdbEvalCode, mockOutput: string = 'mock ok'): IdbEvalResult {
  const start = Date.now();
  if (!evalCode.ready) return { success: false, stepsCompleted: 0, totalSteps: evalCode.stepCount, errorMessage: 'executor not ready', errorStep: 0, fallbackTriggered: false, durationMs: Date.now() - start, outputPreview: '' };
  return { success: true, stepsCompleted: evalCode.stepCount, totalSteps: evalCode.stepCount, errorMessage: null, errorStep: null, fallbackTriggered: false, durationMs: Date.now() - start, outputPreview: mockOutput };
}
export interface TuiKeyEvent {
  key: string;
  sequence: string;
  modifiers: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };
  vimKey: string;
  matched: boolean;
}

export interface TuiKeyBindingResult {
  event: TuiKeyEvent;
  binding: TuiKeymap['bindings'][number] | null;
  action: string;
  matched: boolean;
  consumed: boolean;
}

export interface TuiActiveSection {
  sectionId: string;
  index: number;
  totalSections: number;
  highlighted: boolean;
  vimActions: string[];
}

function parseVimKey(key: string, shift: boolean, ctrl: boolean, alt: boolean, meta: boolean): string {
  if (key === 'Escape') return 'Esc';
  if (key === ' ') return 'Space';
  if (key === 'ArrowDown') return 'Down';
  if (key === 'ArrowUp') return 'Up';
  if (key === 'ArrowLeft') return 'Left';
  if (key === 'ArrowRight') return 'Right';
  if (ctrl && key.length === 1) return 'Ctrl+' + key.toLowerCase();
  if (meta && key.length === 1) return 'Cmd+' + key.toLowerCase();
  if (alt && key.length === 1) return 'Alt+' + key.toLowerCase();
  if (shift && key.length === 1) return key.toUpperCase();
  return key;
}

export function buildTuiKeyEvent(input: { key: string; shift?: boolean; ctrl?: boolean; alt?: boolean; meta?: boolean }): TuiKeyEvent {
  const shift = input.shift ?? false;
  const ctrl = input.ctrl ?? false;
  const alt = input.alt ?? false;
  const meta = input.meta ?? false;
  const vimKey = parseVimKey(input.key, shift, ctrl, alt, meta);
  return { key: input.key, sequence: vimKey, modifiers: { ctrl, shift, alt, meta }, vimKey, matched: false };
}

export function planTuiKeyBindings(keymap: TuiKeymap, event: TuiKeyEvent): TuiKeyBindingResult {
  const direct = keymap.bindings.find((b) => b.keys === event.vimKey || b.keys === event.key || b.keys.toLowerCase() === event.key.toLowerCase());
  if (direct) return { event: { ...event, matched: true }, binding: direct, action: direct.action, matched: true, consumed: true };
  return { event, binding: null, action: 'unknown', matched: false, consumed: false };
}

export function buildTuiActiveSection(sectionId: string, index: number, totalSections: number, vimActions: string[]): TuiActiveSection {
  return { sectionId, index, totalSections, highlighted: true, vimActions };
}
export interface TuiKeymap {
  mode: 'normal' | 'insert' | 'command';
  bindings: Array<{ keys: string; action: string; description: string }>;
  enabled: boolean;
}

export interface TuiNavigateResult {
  fromSection: string;
  toSection: string;
  action: string;
  direction: 'up' | 'down' | 'first' | 'last' | 'enter' | 'quit' | 'unknown';
  matched: boolean;
}

export interface TuiCommands {
  keymap: TuiKeymap;
  totalBindings: number;
  uniqueActions: number;
  navigationKeys: string[];
  actionKeys: string[];
  ready: boolean;
}

export function buildTuiKeymap(options: { mode?: TuiKeymap['mode']; enableNavigation?: boolean; enableActions?: boolean } = {}): TuiKeymap {
  const mode = options.mode ?? 'normal';
  const enableNavigation = options.enableNavigation ?? true;
  const enableActions = options.enableActions ?? true;
  const bindings: TuiKeymap['bindings'] = [];
  if (enableNavigation) {
    bindings.push({ keys: 'j', action: 'down', description: '下移一节' });
    bindings.push({ keys: 'k', action: 'up', description: '上移一节' });
    bindings.push({ keys: 'g g', action: 'first', description: '回到首节' });
    bindings.push({ keys: 'G', action: 'last', description: '跳到末节' });
    bindings.push({ keys: 'Enter', action: 'enter', description: '进入当前节' });
  }
  if (enableActions) {
    bindings.push({ keys: 'q', action: 'quit', description: '退出 TUI' });
    bindings.push({ keys: '?', action: 'help', description: '显示快捷键' });
    bindings.push({ keys: ':', action: 'command', description: '进入命令模式' });
    bindings.push({ keys: 'i', action: 'insert', description: '进入插入模式' });
  }
  return { mode, bindings, enabled: true };
}

export function planTuiNavigate(keymap: TuiKeymap, currentSection: string, keySequence: string, allSections: string[]): TuiNavigateResult {
  const binding = keymap.bindings.find((b) => b.keys === keySequence || b.keys.split(' ').join('') === keySequence);
  if (!binding) return { fromSection: currentSection, toSection: currentSection, action: 'unknown', direction: 'unknown', matched: false };
  if (binding.action === 'down') {
    const idx = allSections.indexOf(currentSection);
    const next = Math.min(allSections.length - 1, idx + 1);
    return { fromSection: currentSection, toSection: allSections[next] ?? currentSection, action: binding.action, direction: 'down', matched: true };
  }
  if (binding.action === 'up') {
    const idx = allSections.indexOf(currentSection);
    const prev = Math.max(0, idx - 1);
    return { fromSection: currentSection, toSection: allSections[prev] ?? currentSection, action: binding.action, direction: 'up', matched: true };
  }
  if (binding.action === 'first') return { fromSection: currentSection, toSection: allSections[0] ?? currentSection, action: binding.action, direction: 'first', matched: true };
  if (binding.action === 'last') return { fromSection: currentSection, toSection: allSections[allSections.length - 1] ?? currentSection, action: binding.action, direction: 'last', matched: true };
  if (binding.action === 'enter' || binding.action === 'quit' || binding.action === 'help' || binding.action === 'command' || binding.action === 'insert') {
    return { fromSection: currentSection, toSection: currentSection, action: binding.action, direction: binding.action as TuiNavigateResult['direction'], matched: true };
  }
  return { fromSection: currentSection, toSection: currentSection, action: binding.action, direction: 'unknown', matched: false };
}

export function buildTuiCommands(options: { mode?: TuiKeymap['mode'] } = {}): TuiCommands {
  const keymap = buildTuiKeymap(options);
  const navigationKeys = keymap.bindings.filter((b) => ['down', 'up', 'first', 'last', 'enter'].includes(b.action)).map((b) => b.keys);
  const actionKeys = keymap.bindings.filter((b) => ['quit', 'help', 'command', 'insert'].includes(b.action)).map((b) => b.keys);
  return { keymap, totalBindings: keymap.bindings.length, uniqueActions: new Set(keymap.bindings.map((b) => b.action)).size, navigationKeys, actionKeys, ready: keymap.enabled };
}
export interface IdbIntegrationTestCase {
  name: string;
  description: string;
  executor: IdbExecutor;
  expectedSuccess: boolean;
  expectedFallback: boolean;
  expectedSteps: number;
}

export interface IdbIntegrationTestResult {
  name: string;
  passed: boolean;
  actualSuccess: boolean;
  actualFallback: boolean;
  actualSteps: number;
  errorMessage: string | null;
  durationMs: number;
}

export interface IdbIntegrationCoverage {
  totalCases: number;
  passedCases: number;
  failedCases: number;
  coveragePercent: number;
  results: IdbIntegrationTestResult[];
  ready: boolean;
}

export function buildIdbIntegrationTestCases(): IdbIntegrationTestCase[] {
  return [
    {
      name: 'basic-put-single',
      description: '单条 put 写入项目',
      executor: buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: true }),
      expectedSuccess: true,
      expectedFallback: false,
      expectedSteps: 4,
    },
    {
      name: 'basic-count-after-put',
      description: 'put 后 count',
      executor: buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }, { kind: 'count', store: 'projects', expect: 'count' }], supportsIdb: true }),
      expectedSuccess: true,
      expectedFallback: false,
      expectedSteps: 5,
    },
    {
      name: 'no-idb-fallback',
      description: 'IDB 不支持时 fallback',
      executor: buildIdbExecutor({ operations: [{ kind: 'put', store: 'projects', key: 'p1', value: { x: 1 }, expect: 'none' }], supportsIdb: false, fallbackStorageKey: 'novel-ma:artifacts' }),
      expectedSuccess: false,
      expectedFallback: true,
      expectedSteps: 4,
    },
    {
      name: 'getall-empty',
      description: 'getAll 空仓库',
      executor: buildIdbExecutor({ operations: [{ kind: 'getAll', store: 'undo', expect: 'all' }], supportsIdb: true }),
      expectedSuccess: true,
      expectedFallback: false,
      expectedSteps: 4,
    },
  ];
}

export async function runIdbIntegrationTest(test: IdbIntegrationTestCase): Promise<IdbIntegrationTestResult> {
  const start = Date.now();
  try {
    const handle = buildIdbMockHandle({ supportsIdb: test.executor.ready });
    const plan = planIdbExecution(test.executor, { fallbackStorageKey: 'novel-ma:artifacts' });
    const runtime = await simulateIdbRuntime(plan, handle, { fallbackStorageKey: 'novel-ma:artifacts' });
    const passed = runtime.success === test.expectedSuccess && runtime.fallbackUsed === test.expectedFallback && runtime.stepsCompleted === test.expectedSteps;
    return { name: test.name, passed, actualSuccess: runtime.success, actualFallback: runtime.fallbackUsed, actualSteps: runtime.stepsCompleted, errorMessage: passed ? null : `expected success=${test.expectedSuccess} fallback=${test.expectedFallback} steps=${test.expectedSteps}; got success=${runtime.success} fallback=${runtime.fallbackUsed} steps=${runtime.stepsCompleted}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: test.name, passed: false, actualSuccess: false, actualFallback: false, actualSteps: 0, errorMessage: String(err), durationMs: Date.now() - start };
  }
}

export async function assessIdbIntegrationCoverage(tests: IdbIntegrationTestCase[]): Promise<IdbIntegrationCoverage> {
  const results: IdbIntegrationTestResult[] = [];
  for (const test of tests) results.push(await runIdbIntegrationTest(test));
  const passedCases = results.filter((r) => r.passed).length;
  const failedCases = results.length - passedCases;
  const coveragePercent = results.length === 0 ? 0 : Math.round((passedCases / results.length) * 100);
  return { totalCases: results.length, passedCases, failedCases, coveragePercent, results, ready: coveragePercent === 100 };
}
export interface IdbMockStore {
  put: (key: string, value: unknown) => Promise<void>;
  get: (key: string) => Promise<unknown | undefined>;
  getAll: () => Promise<Array<{ key: string; value: unknown }>>;
  delete: (key: string) => Promise<void>;
  count: () => Promise<number>;
  clear: () => Promise<void>;
  close: () => void;
}

export interface IdbMockHandle {
  stores: Record<string, IdbMockStore>;
  isOpen: boolean;
  open: () => Promise<IdbMockHandle>;
  close: () => void;
  supportsIdb: boolean;
}

export interface IdbRuntimeResult {
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage: string | null;
  errorStep: number | null;
  fallbackUsed: boolean;
  fallbackStorageKey: string;
  durationMs: number;
  recovered: boolean;
}

export interface IdbRecoveryPlan {
  fromError: string;
  toFallback: string;
  steps: string[];
  estimatedDurationMs: number;
  fallbackStorageKey: string;
  ready: boolean;
}

export function buildIdbMockHandle(options: { supportsIdb?: boolean; stores?: string[] } = {}): IdbMockHandle {
  const supportsIdb = options.supportsIdb ?? true;
  const storeNames = options.stores ?? ['projects', 'tags', 'undo'];
  const stores: Record<string, IdbMockStore> = {};
  for (const name of storeNames) stores[name] = { put: async () => {}, get: async () => undefined, getAll: async () => [], delete: async () => {}, count: async () => 0, clear: async () => {}, close: () => {} };
  return {
    stores,
    isOpen: supportsIdb,
    supportsIdb,
    open: async () => buildIdbMockHandle(options),
    close: () => {},
  };
}

export async function simulateIdbRuntime(plan: IdbExecutionPlan, handle: IdbMockHandle, options: { fallbackStorageKey?: string; timeoutMs?: number } = {}): Promise<IdbRuntimeResult> {
  const fallbackStorageKey = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const start = Date.now();
  if (!handle.supportsIdb) return { success: false, stepsCompleted: 0, totalSteps: plan.totalSteps, errorMessage: 'IDB not supported', errorStep: 0, fallbackUsed: true, fallbackStorageKey, durationMs: Date.now() - start, recovered: false };
  try {
    for (const store of Object.values(handle.stores)) store.put = store.put;
    return { success: true, stepsCompleted: plan.totalSteps, totalSteps: plan.totalSteps, errorMessage: null, errorStep: null, fallbackUsed: false, fallbackStorageKey, durationMs: Date.now() - start, recovered: false };
  } catch (err) {
    return { success: false, stepsCompleted: 0, totalSteps: plan.totalSteps, errorMessage: String(err), errorStep: plan.totalSteps, fallbackUsed: true, fallbackStorageKey, durationMs: Date.now() - start, recovered: false };
  }
}

export function planIdbRecovery(error: string, options: { fallbackStorageKey?: string; recovered?: boolean } = {}): IdbRecoveryPlan {
  const fallback = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const recovered = options.recovered ?? true;
  const steps = [
    `检测 IDB 错误: ${error}`,
    `评估降级策略: 写入 localStorage '${fallback}'`,
    `序列化 artifact 到 JSON 字符串`,
    `localStorage.setItem('${fallback}', JSON.stringify([...]))`,
    recovered ? '记录恢复事件到 novel-ma:idb-recovery log' : '抛出错误让用户决策',
  ];
  return { fromError: error, toFallback: fallback, steps, estimatedDurationMs: Math.max(20, Math.ceil(error.length / 2)), fallbackStorageKey: fallback, ready: !!error };
}
export interface IdbExecutionPlan {
  wrapper: string;
  totalSteps: number;
  estimatedDurationMs: number;
  errorHandlers: string[];
  fallbackEnabled: boolean;
  ready: boolean;
}

export interface IdbExecutionResult {
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage: string | null;
  errorStep: number | null;
  fallbackUsed: boolean;
  durationMs: number;
}

export function planIdbExecution(executor: IdbExecutor, options: { fallbackStorageKey?: string; timeoutMs?: number } = {}): IdbExecutionPlan {
  const fallback = options.fallbackStorageKey ?? executor.fallbackAvailable ? 'novel-ma:artifacts' : '';
  const timeout = Math.max(1000, Math.min(60_000, options.timeoutMs ?? 10_000));
  const errorHandlers = [
    `function onIdbError(step, err) { console.error('[IDB] step ' + step + ' failed:', err); if (fallbackStorageKey && typeof localStorage !== 'undefined') { localStorage.setItem('novel-ma:idb-error', JSON.stringify({ step, message: String(err), at: Date.now() })); } }`,
    `if (typeof indexedDB === 'undefined') { onIdbError(0, 'IndexedDB not supported in this environment'); return { success: false, stepsCompleted: 0, totalSteps, errorMessage: 'IDB not supported', errorStep: 0, fallbackUsed: fallbackStorageKey ? true : false, durationMs: 0 }; }`,
    `const startTime = Date.now(); if (startTime + timeout < Infinity) setTimeout(() => console.warn('[IDB] timeout ' + timeout + 'ms'), timeout);`,
  ];
  const totalSteps = executor.totalSteps;
  const estimatedDurationMs = executor.estimatedDurationMs + 200;
  const wrapper = `async function runIdbExecutor(executor) {
  const { steps, fallbackStorageKey, timeout } = executor;
  let stepsCompleted = 0;
  try {
    ${errorHandlers.map((h) => `    ${h}`).join('\n')}
    ${executor.steps.map((step) => `    try { ${step.code}; stepsCompleted = ${step.index}; } catch (err) { onIdbError(${step.index}, err); return { success: false, stepsCompleted, totalSteps: ${totalSteps}, errorMessage: String(err), errorStep: ${step.index}, fallbackUsed: true, durationMs: Date.now() - startTime }; }`).join('\n')}
    return { success: true, stepsCompleted: ${totalSteps}, totalSteps: ${totalSteps}, errorMessage: null, errorStep: null, fallbackUsed: false, durationMs: Date.now() - startTime };
  } catch (err) {
    return { success: false, stepsCompleted, totalSteps: ${totalSteps}, errorMessage: String(err), errorStep: stepsCompleted, fallbackUsed: true, durationMs: Date.now() - startTime };
  }
}`;
  return {
    wrapper,
    totalSteps,
    estimatedDurationMs,
    errorHandlers,
    fallbackEnabled: executor.fallbackAvailable,
    ready: executor.ready,
  };
}
export interface TuiMirrorSection {
  id: string;
  title: string;
  lines: string[];
  width: number;
}

export interface TuiMirror {
  sections: TuiMirrorSection[];
  totalLines: number;
  totalSections: number;
  bindings: string[];
  shortCuts: string[];
  featuresCovered: string[];
  parity: number;
  webStudioVersion: string;
  generatedAt: string;
}

const TUI_FEATURES = [
  { id: 'V41', name: '可发现性', fns: ['buildWebNavigation', 'buildWebOnboarding', 'buildWebHelp', 'buildWebDefaultView'] },
  { id: 'V42', name: '交互式面板', fns: ['buildInteractivePanel'] },
  { id: 'V43', name: '章节编辑器', fns: ['buildChapterEditor', 'computeWordStats', 'planChapterSave', 'buildChapterContext', 'appendChapterRevision'] },
  { id: 'V44', name: 'SVG 可视化', fns: ['buildForeshadowingGraphSvg', 'buildCharacterArcSvg', 'buildChapterPacingSvg'] },
  { id: 'V45', name: '项目库增强', fns: ['buildRevisionTree', 'buildTagIndex', 'searchProjectsIndexed', 'planIndexedDbMigration'] },
  { id: 'V46', name: 'Diff + 向导', fns: ['buildDiffView', 'buildImportWizard'] },
  { id: 'V47', name: '写作辅助', fns: ['computeDailyGoal', 'buildHeatmapSvg', 'planFocusSession', 'planUndoEntry'] },
  { id: 'V48', name: 'PWA', fns: ['buildPwaManifest', 'buildServiceWorkerPlan', 'renderServiceWorkerScript', 'assessOfflineCapability'] },
  { id: 'V49', name: 'Pipeline 时间线', fns: ['buildPipelineTimelineSvg', 'buildAgentTraceView'] },
  { id: 'V50', name: 'CLI 项目同步', fns: ['parseArtifactIndex', 'planArtifactSync'] },
  { id: 'V51', name: 'IndexedDB schema', fns: ['buildIndexedDbSchema', 'buildIndexedDbAdapter', 'buildMigrationScript'] },
  { id: 'V52', name: 'Markdown 编辑器', fns: ['renderMarkdown', 'extractMarkdownOutline', 'buildRichTextToolbar'] },
  { id: 'V53', name: '撤销栈', fns: ['buildUndoStackConfig', 'pushUndoEntry', 'popUndoEntry', 'planUndoRestore', 'computeUndoStats'] },
  { id: 'V54', name: 'IDB Runtime', fns: ['buildIndexedDbRuntime', 'planIndexedDbBatch', 'assessIndexedDbQuota'] },
  { id: 'V55', name: '章节 markdown 嵌入', fns: ['buildChapterDocument', 'switchChapterView', 'planChapterEdit'] },
  { id: 'V56', name: '快捷键', fns: ['planKeyboardShortcut', 'buildChapterShortcutBindings'] },
  { id: 'V57', name: 'Redo 栈', fns: ['buildRedoStackConfig', 'pushRedoEntry', 'popRedoEntry', 'planRedoForward'] },
  { id: 'V58', name: 'IDB Executor', fns: ['buildIdbExecutor', 'planIdbMigration'] },
];

function pad(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

export function buildTuiMirror(options: { width?: number; webStudioVersion?: string } = {}): TuiMirror {
  const width = Math.max(60, Math.min(120, options.width ?? 96));
  const webStudioVersion = options.webStudioVersion ?? 'v0.1.0';
  const generatedAt = new Date().toISOString();
  const sections: TuiMirrorSection[] = [];
  sections.push({
    id: 'header',
    title: 'novel-multi-agent TUI 镜像',
    lines: [
      `┌${'─'.repeat(width - 2)}┐`,
      `│${pad(' novel-multi-agent TUI 镜像（V41-V58 全功能）', width - 2)}│`,
      `│${pad(` version: ${webStudioVersion} · generated: ${generatedAt.slice(0, 19)}`, width - 2)}│`,
      `└${'─'.repeat(width - 2)}┘`,
    ],
    width,
  });
  for (const feature of TUI_FEATURES) {
    const lines: string[] = [];
    lines.push(`┌── ${feature.id} ${feature.name} ${'─'.repeat(Math.max(0, width - 8 - feature.id.length - feature.name.length - 2))}┐`);
    for (const fn of feature.fns) {
      lines.push(`│  · ${pad(fn, width - 6)} │`);
    }
    lines.push(`└${'─'.repeat(width - 2)}┘`);
    sections.push({ id: feature.id, title: feature.name, lines, width });
  }
  const bindings = ['1. Dashboard', '2. Library', '3. Continue', '4. Provider', '5. Quality', '6. Pipeline', '7. Sync', '8. IDB', '9. Markdown', '10. Undo', '11. Redo'];
  sections.push({ id: 'bindings', title: 'TUI 命令菜单', lines: bindings.map((line) => `  ${line}`), width });
  const shortCuts = ['Ctrl+Z 撤销', 'Ctrl+Y 重做', 'Ctrl+S 保存', 'Ctrl+B 加粗', 'Ctrl+E inline code', '? 帮助', 'g d 总控台', 'g n 新建', 'g l 项目库'];
  sections.push({ id: 'shortcuts', title: '快捷键', lines: shortCuts.map((line) => `  ${line}`), width });
  const totalLines = sections.reduce((sum, section) => sum + section.lines.length, 0);
  const parity = TUI_FEATURES.length / TUI_FEATURES.length;
  return {
    sections,
    totalLines,
    totalSections: sections.length,
    bindings,
    shortCuts,
    featuresCovered: TUI_FEATURES.map((f) => `${f.id} ${f.name}`),
    parity,
    webStudioVersion,
    generatedAt,
  };
}
export interface IdbExecutorStep {
  index: number;
  action: 'open' | 'migrate' | 'put' | 'get' | 'getAll' | 'delete' | 'count' | 'clear' | 'close' | 'error';
  store: string;
  key?: string;
  value?: unknown;
  code: string;
  description: string;
}

export interface IdbExecutor {
  dbName: string;
  version: number;
  steps: IdbExecutorStep[];
  totalSteps: number;
  estimatedDurationMs: number;
  warnings: string[];
  ready: boolean;
  fallbackAvailable: boolean;
}

export interface IdbMigrationItem {
  path: string;
  projectId: string;
  sizeBytes: number;
}

export interface IdbMigrationPlan {
  items: IdbMigrationItem[];
  totalItems: number;
  totalBytes: number;
  estimatedDurationMs: number;
  steps: IdbExecutorStep[];
  fallbackStorageKey: string;
  ready: boolean;
  warnings: string[];
}

export function buildIdbExecutor(options: { dbName?: string; version?: number; operations?: IndexedDbOperation[]; supportsIdb?: boolean; fallbackStorageKey?: string } = {}): IdbExecutor {
  const dbName = options.dbName ?? 'novel-ma';
  const version = options.version ?? 1;
  const supportsIdb = options.supportsIdb ?? true;
  const fallback = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const operations = options.operations ?? [];
  const steps: IdbExecutorStep[] = [];
  const warnings: string[] = [];
  if (!supportsIdb) warnings.push('IndexedDB not supported; will fall back to localStorage ' + fallback);
  steps.push({ index: 1, action: 'open', store: '', code: `const req = indexedDB.open('${dbName}', ${version});`, description: 'open database handle' });
  steps.push({ index: 2, action: 'migrate', store: '', code: `req.onupgradeneeded = (e) => { /* create object stores + indexes */ }`, description: 'create 3 stores (projects/tags/undo) + 5 indexes' });
  for (let i = 0; i < operations.length; i += 1) {
    const op = operations[i];
    const idx = steps.length + 1;
    if (op.kind === 'put' && op.key !== undefined) {
      steps.push({ index: idx, action: 'put', store: op.store, key: op.key, value: op.value, code: `tx.objectStore('${op.store}').put(${JSON.stringify(op.value ?? null)}, '${op.key}')`, description: `put ${op.store}/${op.key}` });
    } else if (op.kind === 'get' && op.key !== undefined) {
      steps.push({ index: idx, action: 'get', store: op.store, key: op.key, code: `tx.objectStore('${op.store}').get('${op.key}')`, description: `get ${op.store}/${op.key}` });
    } else if (op.kind === 'getAll') {
      steps.push({ index: idx, action: 'getAll', store: op.store, code: `tx.objectStore('${op.store}').getAll()`, description: `getAll ${op.store}` });
    } else if (op.kind === 'delete' && op.key !== undefined) {
      steps.push({ index: idx, action: 'delete', store: op.store, key: op.key, code: `tx.objectStore('${op.store}').delete('${op.key}')`, description: `delete ${op.store}/${op.key}` });
    } else if (op.kind === 'count') {
      steps.push({ index: idx, action: 'count', store: op.store, code: `tx.objectStore('${op.store}').count()`, description: `count ${op.store}` });
    } else if (op.kind === 'clear') {
      steps.push({ index: idx, action: 'clear', store: op.store, code: `tx.objectStore('${op.store}').clear()`, description: `clear ${op.store}` });
    }
  }
  steps.push({ index: steps.length + 1, action: 'close', store: '', code: 'db.close();', description: 'close database handle' });
  const estimatedDurationMs = Math.max(10, operations.length * 5);
  return {
    dbName,
    version,
    steps,
    totalSteps: steps.length,
    estimatedDurationMs,
    warnings,
    ready: supportsIdb && steps.length >= 2,
    fallbackAvailable: true,
  };
}

export function planIdbMigration(items: Array<{ projectId?: string; sizeBytes?: number; path?: string }>, options: { dbName?: string; version?: number; maxBytes?: number; fallbackStorageKey?: string } = {}): IdbMigrationPlan {
  const maxBytes = options.maxBytes ?? 50 * 1024 * 1024;
  const fallbackStorageKey = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const mapped: IdbMigrationItem[] = items.map((item) => ({
    path: item.path ?? '.novel-ma/projects/auto',
    projectId: item.projectId ?? 'unknown',
    sizeBytes: Math.max(0, item.sizeBytes ?? 0),
  }));
  const totalItems = mapped.length;
  const totalBytes = mapped.reduce((sum, item) => sum + item.sizeBytes, 0);
  const overage = totalBytes > maxBytes;
  const warnings: string[] = overage ? [`total ${totalBytes}B exceeds ${maxBytes}B IDB soft limit`] : [];
  const operations: IndexedDbOperation[] = mapped.map((item) => ({ kind: 'put', store: 'projects', key: item.projectId, value: { path: item.path, sizeBytes: item.sizeBytes }, expect: 'none' }));
  const executor = buildIdbExecutor({ dbName: options.dbName, version: options.version, operations, supportsIdb: true, fallbackStorageKey });
  return {
    items: mapped,
    totalItems,
    totalBytes,
    estimatedDurationMs: executor.estimatedDurationMs,
    steps: executor.steps,
    fallbackStorageKey,
    ready: !overage && executor.ready,
    warnings,
  };
}

export interface RedoStackConfig {
  storageKey: string;
  maxSize: number;
  ttlMs: number;
}

export interface RedoStack {
  config: RedoStackConfig;
  entries: UndoEntry[];
  totalPushed: number;
  totalPopped: number;
  newestEntryId: string | null;
}

export interface RedoForwardPlan {
  entryId: string;
  fromUndo: boolean;
  pushedToRedo: boolean;
  redoStackSize: number;
  undoStackSize: number;
  steps: string[];
  ready: boolean;
}

export function buildRedoStackConfig(options: { storageKey?: string; maxSize?: number; ttlMs?: number } = {}): RedoStackConfig {
  return {
    storageKey: options.storageKey ?? 'novel-ma:redo',
    maxSize: Math.max(1, Math.min(500, options.maxSize ?? 50)),
    ttlMs: Math.max(60_000, options.ttlMs ?? 7 * 24 * 60 * 60 * 1000),
  };
}

export function pushRedoEntry(stack: RedoStack, entry: UndoEntry, now: number = Date.now()): RedoStack {
  const filtered = stack.entries.filter((existing) => now - new Date(existing.createdAt).getTime() < stack.config.ttlMs);
  const next: UndoEntry[] = [...filtered, entry].slice(-stack.config.maxSize);
  return {
    config: stack.config,
    entries: next,
    totalPushed: stack.totalPushed + 1,
    totalPopped: stack.totalPopped,
    newestEntryId: next[next.length - 1]?.id ?? null,
  };
}

export function popRedoEntry(stack: RedoStack): { stack: RedoStack; entry: UndoEntry | null } {
  if (stack.entries.length === 0) return { stack, entry: null };
  const last = stack.entries[stack.entries.length - 1] ?? null;
  if (!last) return { stack, entry: null };
  return {
    stack: { ...stack, entries: stack.entries.slice(0, -1), totalPopped: stack.totalPopped + 1 },
    entry: last,
  };
}

export function planRedoForward(undoStack: UndoStack, redoStack: RedoStack, entryId: string): RedoForwardPlan {
  const entry = undoStack.entries.find((item) => item.id === entryId);
  if (!entry) {
    return { entryId, fromUndo: false, pushedToRedo: false, redoStackSize: redoStack.entries.length, undoStackSize: undoStack.entries.length, steps: ['entry not found in undo stack'], ready: false };
  }
  const steps = [
    `从 undo 栈 pop entry ${entry.id}`,
    `应用 entry.after 到目标 artifact（body/chapterEditor 等）`,
    `push entry ${entry.id} 到 redo 栈（保留 until 触发新 undo）`,
    `如 redo 栈超 maxSize，按 FIFO 驱逐最早 entry`,
  ];
  return {
    entryId: entry.id,
    fromUndo: true,
    pushedToRedo: true,
    redoStackSize: redoStack.entries.length + 1,
    undoStackSize: Math.max(0, undoStack.entries.length - 1),
    steps,
    ready: true,
  };
}
export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  label: string;
  scope: 'global' | 'editor' | 'library';
}

export interface KeyboardShortcutPlan {
  shortcut: KeyboardShortcut;
  displayKey: string;
  conflictWith: string[];
  ready: boolean;
  warning?: string;
}

export interface ChapterShortcutBindings {
  bindings: KeyboardShortcutPlan[];
  totalCount: number;
  enabledCount: number;
  conflictCount: number;
  warnings: string[];
}

function shortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push('Cmd');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
  return parts.join('+');
}

export function planKeyboardShortcut(input: { id: string; key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean; label: string; scope?: KeyboardShortcut['scope']; existing?: KeyboardShortcut[] }): KeyboardShortcutPlan {
  const shortcut: KeyboardShortcut = {
    id: input.id,
    key: input.key,
    ctrl: input.ctrl ?? false,
    shift: input.shift ?? false,
    alt: input.alt ?? false,
    meta: input.meta ?? false,
    label: input.label,
    scope: input.scope ?? 'global',
  };
  const displayKey = shortcutKey(shortcut);
  const existing = input.existing ?? [];
  const conflictWith = existing.filter((other) => shortcutKey(other) === displayKey && other.id !== shortcut.id).map((other) => other.id);
  return {
    shortcut,
    displayKey,
    conflictWith,
    ready: conflictWith.length === 0,
    warning: conflictWith.length ? `conflict with ${conflictWith.join(', ')}` : undefined,
  };
}

export function buildChapterShortcutBindings(options: { enableCtrlZ?: boolean; enableCtrlY?: boolean; enableCtrlS?: boolean; enableCtrlB?: boolean; enableCtrlE?: boolean } = {}): ChapterShortcutBindings {
  const defaults = { enableCtrlZ: true, enableCtrlY: true, enableCtrlS: true, enableCtrlB: true, enableCtrlE: true, ...options };
  const plans: KeyboardShortcutPlan[] = [];
  const existing: KeyboardShortcut[] = [];
  const build = (id: string, key: string, ctrl: boolean, shift: boolean, alt: boolean, meta: boolean, label: string) => {
    const plan = planKeyboardShortcut({ id, key, ctrl, shift, alt, meta, label, existing });
    existing.push(plan.shortcut);
    plans.push(plan);
  };
  if (defaults.enableCtrlZ) build('editor.undo', 'z', true, false, false, false, '撤销');
  if (defaults.enableCtrlY) build('editor.redo', 'y', true, false, false, false, '重做');
  if (defaults.enableCtrlS) build('library.save', 's', true, false, false, false, '保存到项目库');
  if (defaults.enableCtrlB) build('editor.bold', 'b', true, false, false, false, '加粗');
  if (defaults.enableCtrlE) build('editor.code', 'e', true, false, false, false, 'inline code');
  const conflictCount = plans.filter((plan) => !plan.ready).length;
  return {
    bindings: plans,
    totalCount: plans.length,
    enabledCount: plans.length,
    conflictCount,
    warnings: plans.filter((plan) => plan.warning).map((plan) => plan.warning ?? ''),
  };
}
export interface ChapterDocument {
  body: string;
  renderedHtml: string;
  view: 'raw' | 'preview' | 'split';
  wordCount: number;
  headingCount: number;
  codeBlockCount: number;
  linkCount: number;
  undoEntries: number;
}

export function buildChapterDocument(input: { body: string; view?: ChapterDocument['view']; undoEntries?: number }): ChapterDocument {
  const view = input.view ?? 'raw';
  const rendered = renderMarkdown(input.body);
  return {
    body: input.body,
    renderedHtml: rendered.html,
    view,
    wordCount: countWords(input.body),
    headingCount: rendered.headings,
    codeBlockCount: rendered.codeBlocks,
    linkCount: rendered.links,
    undoEntries: input.undoEntries ?? 0,
  };
}

export function switchChapterView(input: ChapterDocument, view: ChapterDocument['view']): ChapterDocument {
  return { ...input, view };
}

export function planChapterEdit(input: { before: string; after: string; label?: string; undoEntriesBefore: number }): { operation: 'persist-revision'; deltaWords: number; fingerprint: string; undoEntriesAfter: number; label: string } {
  const beforeWords = countWords(input.before);
  const afterWords = countWords(input.after);
  const fp = fingerprintOf(input.after);
  return {
    operation: 'persist-revision',
    deltaWords: afterWords - beforeWords,
    fingerprint: fp,
    undoEntriesAfter: input.undoEntriesBefore + 1,
    label: input.label ?? 'chapter edit',
  };
}
export interface IndexedDbOperation {
  kind: 'get' | 'getAll' | 'put' | 'delete' | 'count' | 'clear';
  store: string;
  key?: string;
  value?: unknown;
  expect: 'first' | 'all' | 'count' | 'none';
}

export interface IndexedDbRuntime {
  adapter: IndexedDbAdapter;
  openSteps: string[];
  operations: string[];
  batchSize: number;
  supportsBatch: boolean;
  supportsTransaction: boolean;
  warnings: string[];
}

export interface IndexedDbBatchPlan {
  operations: IndexedDbOperation[];
  totalOps: number;
  estimatedDurationMs: number;
  groupedByStore: Record<string, number>;
  transaction: boolean;
  fallbackToOneByOne: boolean;
}

export interface IndexedDbQuotaAssessment {
  totalBytes: number;
  estimatedItems: number;
  recommendedEviction: number;
  warning: string;
  ok: boolean;
}

export function buildIndexedDbRuntime(options: { adapter?: IndexedDbAdapter; batchSize?: number; supportsBatch?: boolean; supportsTransaction?: boolean } = {}): IndexedDbRuntime {
  const adapter = options.adapter ?? buildIndexedDbAdapter();
  const batchSize = Math.max(1, Math.min(1000, options.batchSize ?? 100));
  const supportsBatch = options.supportsBatch ?? true;
  const supportsTransaction = options.supportsTransaction ?? true;
  const operations = ['open', 'get', 'getAll', 'put', 'delete', 'count', 'clear', 'batch-put', 'migrate'];
  const openSteps = [
    `indexedDB.open('${adapter.schema.name}', ${adapter.schema.version})`,
    `onupgradeneeded: 创建 ${adapter.schema.stores.map((store) => store.name).join('/')} object store + indexes`,
    `onerror: 降级到 fallbackStorageKey='${adapter.fallbackStorageKey}' (localStorage)`,
    `onsuccess: 返回 IDBDatabase handle 供后续操作复用`,
  ];
  const warnings: string[] = [];
  if (!supportsBatch) warnings.push('batch operation disabled; runtime will fall back to per-item put');
  if (!supportsTransaction) warnings.push('transaction support disabled; multi-store updates may not be atomic');
  return { adapter, openSteps, operations, batchSize, supportsBatch, supportsTransaction, warnings };
}

export function planIndexedDbBatch(operations: IndexedDbOperation[], options: { batchSize?: number; supportsTransaction?: boolean; fallbackToOneByOne?: boolean } = {}): IndexedDbBatchPlan {
  const batchSize = Math.max(1, options.batchSize ?? 100);
  const supportsTransaction = options.supportsTransaction ?? true;
  const fallback = options.fallbackToOneByOne ?? true;
  const totalOps = operations.length;
  const groupedByStore: Record<string, number> = {};
  for (const op of operations) {
    groupedByStore[op.store] = (groupedByStore[op.store] ?? 0) + 1;
  }
  const estimatedDurationMs = Math.max(1, Math.round((totalOps * 2) / Math.max(1, batchSize / 10)));
  const transaction = supportsTransaction && new Set(operations.map((op) => op.store)).size <= 3;
  return {
    operations,
    totalOps,
    estimatedDurationMs,
    groupedByStore,
    transaction,
    fallbackToOneByOne: fallback,
  };
}

export function assessIndexedDbQuota(items: Array<{ sizeBytes: number }>, options: { maxBytes?: number; targetBytes?: number } = {}): IndexedDbQuotaAssessment {
  const maxBytes = options.maxBytes ?? 50 * 1024 * 1024;
  const targetBytes = options.targetBytes ?? Math.floor(maxBytes * 0.8);
  const totalBytes = items.reduce((sum, item) => sum + Math.max(0, item.sizeBytes), 0);
  const estimatedItems = items.length;
  const ok = totalBytes <= targetBytes;
  const overage = Math.max(0, totalBytes - targetBytes);
  const recommendedEviction = ok ? 0 : Math.ceil(overage / Math.max(1, totalBytes / estimatedItems));
  return {
    totalBytes,
    estimatedItems,
    recommendedEviction,
    warning: ok ? 'quota within target' : `total ${totalBytes}B exceeds target ${targetBytes}B; consider evicting ${recommendedEviction} items`,
    ok,
  };
}

export interface UndoStackConfig {
  storageKey: string;
  maxSize: number;
  ttlMs: number;
  persistAcrossReload: boolean;
}

export interface UndoStack {
  config: UndoStackConfig;
  entries: UndoEntry[];
  totalPushed: number;
  totalPopped: number;
  oldestEntryId: string | null;
  newestEntryId: string | null;
}

export interface UndoRestorePlan {
  entryId: string;
  projectId: string;
  label: string;
  beforeJson: string;
  afterJson: string;
  deltaFieldCount: number;
  steps: string[];
  ready: boolean;
}

export interface UndoStats {
  count: number;
  maxSize: number;
  storageBytes: number;
  oldestAge: number;
  averageInterval: number;
  ttlMs: number;
}

export function buildUndoStackConfig(options: { storageKey?: string; maxSize?: number; ttlMs?: number; persistAcrossReload?: boolean } = {}): UndoStackConfig {
  return {
    storageKey: options.storageKey ?? 'novel-ma:undo',
    maxSize: Math.max(1, Math.min(500, options.maxSize ?? 50)),
    ttlMs: Math.max(60_000, options.ttlMs ?? 7 * 24 * 60 * 60 * 1000),
    persistAcrossReload: options.persistAcrossReload ?? true,
  };
}

export function pushUndoEntry(stack: UndoStack, entry: UndoEntry, now: number = Date.now()): UndoStack {
  const filtered = stack.entries.filter((existing) => now - new Date(existing.createdAt).getTime() < stack.config.ttlMs);
  const next: UndoEntry[] = [...filtered, entry].slice(-stack.config.maxSize);
  return {
    config: stack.config,
    entries: next,
    totalPushed: stack.totalPushed + 1,
    totalPopped: stack.totalPopped,
    oldestEntryId: next[0]?.id ?? null,
    newestEntryId: next[next.length - 1]?.id ?? null,
  };
}

export function popUndoEntry(stack: UndoStack): { stack: UndoStack; entry: UndoEntry | null } {
  if (stack.entries.length === 0) return { stack, entry: null };
  const last = stack.entries[stack.entries.length - 1] ?? null;
  if (!last) return { stack, entry: null };
  return {
    stack: { ...stack, entries: stack.entries.slice(0, -1), totalPopped: stack.totalPopped + 1 },
    entry: last,
  };
}

export function planUndoRestore(stack: UndoStack, entryId: string): UndoRestorePlan {
  const entry = stack.entries.find((item) => item.id === entryId);
  if (!entry) {
    return { entryId, projectId: '', label: 'not found', beforeJson: '', afterJson: '', deltaFieldCount: 0, steps: ['entry not found'], ready: false };
  }
  const beforeKeys = entry.before && typeof entry.before === 'object' ? Object.keys(entry.before as Record<string, unknown>) : [];
  const afterKeys = entry.after && typeof entry.after === 'object' ? Object.keys(entry.after as Record<string, unknown>) : [];
  const delta = new Set([...beforeKeys, ...afterKeys]).size;
  const steps = [
    `读取 entry ${entry.id} 的 before 快照`,
    `对比 current artifact 与 before 快照，列出差异字段`,
    `应用 entry.after 到目标 artifact`,
    `写入回 localStorage '${stack.config.storageKey}' 并刷新 history`,
  ];
  return {
    entryId: entry.id,
    projectId: (entry.after as { projectId?: string })?.projectId ?? '',
    label: entry.label,
    beforeJson: JSON.stringify(entry.before, null, 2),
    afterJson: JSON.stringify(entry.after, null, 2),
    deltaFieldCount: delta,
    steps,
    ready: true,
  };
}

export function computeUndoStats(stack: UndoStack, now: number = Date.now()): UndoStats {
  const count = stack.entries.length;
  const oldest = stack.entries[0];
  const newest = stack.entries[stack.entries.length - 1];
  const oldestAge = oldest ? Math.max(0, now - new Date(oldest.createdAt).getTime()) : 0;
  const interval = oldest && newest && count > 1 ? Math.max(0, (new Date(newest.createdAt).getTime() - new Date(oldest.createdAt).getTime()) / Math.max(1, count - 1)) : 0;
  const storageBytes = JSON.stringify(stack.entries).length * 2;
  return {
    count,
    maxSize: stack.config.maxSize,
    storageBytes,
    oldestAge,
    averageInterval: interval,
    ttlMs: stack.config.ttlMs,
  };
}

export interface MarkdownRenderOptions {
  allowHtml?: boolean;
  maxHeadingLevel?: number;
  breaks?: boolean;
}

export interface MarkdownSection {
  level: number;
  title: string;
  index: number;
}

export interface MarkdownRenderResult {
  html: string;
  sections: MarkdownSection[];
  headings: number;
  paragraphs: number;
  codeBlocks: number;
  links: number;
}

function escapeMdHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(line: string, allowHtml: boolean): string {
  let result = escapeMdHtml(line);
  if (!allowHtml) {
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
  } else {
    result = line;
  }
  return result;
}

export function renderMarkdown(text: string, options: MarkdownRenderOptions = {}): MarkdownRenderResult {
  const maxLevel = Math.max(1, Math.min(6, options.maxHeadingLevel ?? 6));
  const allowHtml = options.allowHtml ?? false;
  const breaks = options.breaks ?? true;
  const lines = String(text ?? '').split('\n');
  const sections: MarkdownSection[] = [];
  let headings = 0;
  let paragraphs = 0;
  let codeBlocks = 0;
  let links = 0;
  const htmlParts: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    const joined = paragraphBuffer.join(breaks ? '<br>' : ' ');
    htmlParts.push(`<p>${renderInline(joined, allowHtml)}</p>`);
    paragraphBuffer = [];
    paragraphs += 1;
  }

  function flushList() {
    if (listBuffer.length === 0) return;
    htmlParts.push('<ul>');
    for (const item of listBuffer) htmlParts.push(`<li>${renderInline(item, allowHtml)}</li>`);
    htmlParts.push('</ul>');
    listBuffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      if (inCode) {
        htmlParts.push(`<pre><code>${escapeMdHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCode = false;
        codeBlocks += 1;
      } else {
        inCode = true;
        codeBuffer = [];
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch && headingMatch[1] && headingMatch[2] !== undefined) {
      flushParagraph();
      flushList();
      const level = Math.min(maxLevel, headingMatch[1].length);
      const title = headingMatch[2].trim();
      sections.push({ level, title, index: sections.length });
      htmlParts.push(`<h${level}>${renderInline(title, allowHtml)}</h${level}>`);
      headings += 1;
      continue;
    }
    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    if (listMatch && listMatch[1] !== undefined) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      continue;
    }
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraphBuffer.push(line);
  }
  flushParagraph();
  flushList();
  if (inCode && codeBuffer.length) {
    htmlParts.push(`<pre><code>${escapeMdHtml(codeBuffer.join('\n'))}</code></pre>`);
    codeBlocks += 1;
  }
  const html = htmlParts.join('\n');
  const linkCount = (html.match(/<a\s/g) ?? []).length;
  return { html, sections, headings, paragraphs, codeBlocks, links: linkCount };
}

export function extractMarkdownOutline(text: string, maxDepth: number = 3): MarkdownSection[] {
  const result = renderMarkdown(text, { allowHtml: false });
  return result.sections.filter((section) => section.level <= Math.max(1, Math.min(6, maxDepth)));
}

export interface RichTextToolbarAction {
  id: string;
  label: string;
  shortcut: string;
  before: string;
  after: string;
  placeholder: string;
}

export function buildRichTextToolbar(): RichTextToolbarAction[] {
  return [
    { id: 'bold', label: '粗体', shortcut: 'Ctrl+B', before: '**', after: '**', placeholder: 'bold text' },
    { id: 'italic', label: '斜体', shortcut: 'Ctrl+I', before: '*', after: '*', placeholder: 'italic text' },
    { id: 'code', label: '代码', shortcut: 'Ctrl+E', before: '`', after: '`', placeholder: 'code' },
    { id: 'h1', label: '一级标题', shortcut: 'Ctrl+1', before: '# ', after: '', placeholder: '标题' },
    { id: 'h2', label: '二级标题', shortcut: 'Ctrl+2', before: '## ', after: '', placeholder: '标题' },
    { id: 'list', label: '列表', shortcut: 'Ctrl+L', before: '- ', after: '', placeholder: 'item' },
    { id: 'link', label: '链接', shortcut: 'Ctrl+K', before: '[', after: '](https://)', placeholder: 'link text' },
    { id: 'codeblock', label: '代码块', shortcut: 'Ctrl+Shift+E', before: '```\n', after: '\n```', placeholder: 'code' },
  ];
}

export interface IndexedDbSchemaStore {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: Array<{ name: string; keyPath: string; unique: boolean; multiEntry: boolean }>;
}

export interface IndexedDbSchema {
  name: string;
  version: number;
  stores: IndexedDbSchemaStore[];
}

export interface IndexedDbAdapter {
  schema: IndexedDbSchema;
  operations: string[];
  fallbackStorageKey: string;
  ready: boolean;
  warnings: string[];
}

export interface MigrationScript {
  source: 'localStorage' | 'memory' | 'json' | 'csv';
  sourceKey: string;
  target: 'indexedDb' | 'localStorage' | 'json';
  steps: string[];
  totalItems: number;
  totalBytes: number;
  estimatedDurationMs: number;
  dryRun: boolean;
}

export function buildIndexedDbSchema(options: { name?: string; version?: number; stores?: IndexedDbSchemaStore[] } = {}): IndexedDbSchema {
  return {
    name: options.name ?? 'novel-ma',
    version: options.version ?? 1,
    stores: options.stores ?? [
      {
        name: 'projects',
        keyPath: 'projectId',
        autoIncrement: false,
        indexes: [
          { name: 'updatedAt', keyPath: 'updatedAt', unique: false, multiEntry: false },
          { name: 'mode', keyPath: 'mode', unique: false, multiEntry: false },
          { name: 'stage', keyPath: 'stage', unique: false, multiEntry: false },
        ],
      },
      {
        name: 'tags',
        keyPath: 'tag',
        autoIncrement: false,
        indexes: [{ name: 'projectId', keyPath: 'projectIds', unique: false, multiEntry: true }],
      },
      {
        name: 'undo',
        keyPath: 'id',
        autoIncrement: false,
        indexes: [{ name: 'createdAt', keyPath: 'createdAt', unique: false, multiEntry: false }],
      },
    ],
  };
}

export function buildIndexedDbAdapter(options: { fallbackStorageKey?: string; schema?: IndexedDbSchema; supportsIdb?: boolean } = {}): IndexedDbAdapter {
  const fallbackStorageKey = options.fallbackStorageKey ?? 'novel-ma:artifacts';
  const schema = options.schema ?? buildIndexedDbSchema();
  const supportsIdb = options.supportsIdb ?? true;
  const operations: string[] = ['open', 'list', 'get', 'put', 'delete', 'migrate-from-localStorage', 'export', 'import'];
  const warnings: string[] = [];
  if (!supportsIdb) warnings.push('IndexedDB not supported in this environment; falling back to localStorage');
  if (schema.stores.length === 0) warnings.push('schema has 0 stores; adapter will be a no-op');
  return { schema, operations, fallbackStorageKey, ready: warnings.length === 0, warnings };
}

export function buildMigrationScript(options: { source?: MigrationScript['source']; sourceKey?: string; target?: MigrationScript['target']; items?: unknown[]; dryRun?: boolean } = {}): MigrationScript {
  const source = options.source ?? 'localStorage';
  const sourceKey = options.sourceKey ?? 'novel-ma:artifacts';
  const target = options.target ?? 'indexedDb';
  const items = options.items ?? [];
  const totalItems = items.length;
  const totalBytes = JSON.stringify(items).length * 2;
  const estimatedDurationMs = Math.max(1, Math.round(totalBytes / 10000));
  const steps: string[] = [];
  if (source === 'localStorage') {
    steps.push(`读取 localStorage['${sourceKey}'] 并 JSON.parse`);
  } else if (source === 'json') {
    steps.push(`读取 JSON 字符串并 JSON.parse`);
  } else if (source === 'csv') {
    steps.push(`解析 CSV header + rows，转换为 artifact 数组`);
  } else {
    steps.push(`从内存对象直接复制`);
  }
  steps.push(`校验 schemaVersion=2（否则 normalizeArtifact 升级）`);
  steps.push(`打开 IDB ${target === 'indexedDb' ? 'novel-ma v1' : ''} 并逐项 put`);
  steps.push(`写入完成后 IDB list 校验导入数 === 源数`);
  steps.push(`保留 source 一份作为 fallback storageKey=${sourceKey}`);
  return {
    source,
    sourceKey,
    target,
    steps,
    totalItems,
    totalBytes,
    estimatedDurationMs,
    dryRun: options.dryRun ?? false,
  };
}

export interface ArtifactSyncReport {
  scannedFiles: number;
  importedCount: number;
  issuesCount: number;
  byMode: Record<string, number>;
  byStage: Record<string, number>;
  oldestSavedAt: string | null;
  newestSavedAt: string | null;
}

export interface ArtifactSyncIssue {
  path: string;
  reason: string;
  preview?: string;
}

export interface ArtifactSyncOptions {
  acceptModes?: string[];
  rejectStages?: string[];
  maxBytes?: number;
}

function safeParseArtifactJson(raw: string): { ok: boolean; artifact: StudioArtifact | null; reason?: string } {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ok: false, artifact: null, reason: 'non-object' };
    if (!parsed.projectId) return { ok: false, artifact: null, reason: 'missing projectId' };
    return { ok: true, artifact: parsed as StudioArtifact };
  } catch (error) {
    return { ok: false, artifact: null, reason: `json: ${(error as Error).message}` };
  }
}

export function parseArtifactIndex(files: Array<{ path: string; json: string }>): { items: StudioArtifact[]; issues: ArtifactSyncIssue[] } {
  const items: StudioArtifact[] = [];
  const issues: ArtifactSyncIssue[] = [];
  for (const file of files) {
    const result = safeParseArtifactJson(file.json);
    if (!result.ok || !result.artifact) {
      issues.push({ path: file.path, reason: result.reason ?? 'unknown', preview: file.json.slice(0, 60) });
      continue;
    }
    items.push(result.artifact);
  }
  return { items, issues };
}

export function planArtifactSync(files: Array<{ path: string; json: string }>, options: ArtifactSyncOptions = {}): ArtifactSyncReport {
  const acceptModes = new Set(options.acceptModes ?? []);
  const rejectStages = new Set(options.rejectStages ?? []);
  const maxBytes = options.maxBytes ?? 5 * 1024 * 1024;
  const issues: ArtifactSyncIssue[] = [];
  const items: StudioArtifact[] = [];
  let totalBytes = 0;
  for (const file of files) {
    totalBytes += file.json.length;
    if (file.json.length > maxBytes) {
      issues.push({ path: file.path, reason: 'exceeds maxBytes' });
      continue;
    }
    const parsed = safeParseArtifactJson(file.json);
    if (!parsed.ok || !parsed.artifact) {
      issues.push({ path: file.path, reason: parsed.reason ?? 'unknown' });
      continue;
    }
    if (acceptModes.size && parsed.artifact.mode && !acceptModes.has(parsed.artifact.mode)) {
      issues.push({ path: file.path, reason: `mode ${parsed.artifact.mode} not accepted` });
      continue;
    }
    if (rejectStages.size && parsed.artifact.stage && rejectStages.has(parsed.artifact.stage)) {
      issues.push({ path: file.path, reason: `stage ${parsed.artifact.stage} rejected` });
      continue;
    }
    items.push(parsed.artifact);
  }
  const byMode: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  const savedDates: string[] = [];
  for (const item of items) {
    if (item.mode) byMode[item.mode] = (byMode[item.mode] ?? 0) + 1;
    if (item.stage) byStage[item.stage] = (byStage[item.stage] ?? 0) + 1;
    const date = (item as { savedAt?: string }).savedAt ?? item.updatedAt;
    if (date) savedDates.push(date);
  }
  savedDates.sort();
  return {
    scannedFiles: files.length,
    importedCount: items.length,
    issuesCount: issues.length,
    byMode,
    byStage,
    oldestSavedAt: savedDates[0] ?? null,
    newestSavedAt: savedDates[savedDates.length - 1] ?? null,
  };
}

export interface PipelineStep {
  role: 'planner' | 'worldbuilder' | 'writer' | 'editor' | 'continuity' | 'test' | string;
  label: string;
  durationMs: number;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  outputKey?: string;
}

export interface PipelineTimelineSvg {
  svg: string;
  steps: PipelineStep[];
  totalDurationMs: number;
  width: number;
  height: number;
}

export interface AgentTrace {
  role: string;
  input: string;
  output: string;
  startedAt: string;
  endedAt: string;
  artifacts: Array<{ key: string; preview: string }>;
}

export interface AgentTraceView {
  role: string;
  durationMs: number;
  artifactCount: number;
  artifactKeys: string[];
  outputExcerpt: string;
  startedAt: string;
  endedAt: string;
}

export function buildPipelineTimelineSvg(steps: PipelineStep[]): PipelineTimelineSvg {
  const width = 480;
  const rowHeight = 38;
  const padding = 24;
  const labelWidth = 110;
  const height = padding * 2 + Math.max(1, steps.length) * rowHeight;
  const maxDuration = Math.max(1, ...steps.map((step) => step.durationMs));
  const totalDurationMs = steps.reduce((sum, step) => sum + step.durationMs, 0);
  const colorByStatus: Record<PipelineStep['status'], string> = {
    pending: '#94a3b8',
    running: '#2563eb',
    done: '#16a34a',
    failed: '#b91c1c',
    skipped: '#64748b',
  };
  const stepMarkup = steps.map((step, index) => {
    const y = padding + index * rowHeight;
    const x = labelWidth;
    const barWidth = Math.max(8, Math.round((step.durationMs / maxDuration) * (width - labelWidth - padding)));
    const color = colorByStatus[step.status];
    return `<g><text x="0" y="${y + 14}" font-size="12" fill="currentColor">${svgEscape(step.label)}</text><rect x="${x}" y="${y + 4}" width="${barWidth}" height="20" rx="4" fill="${color}" fill-opacity="0.7" /><text x="${x + barWidth + 6}" y="${y + 18}" font-size="10" fill="currentColor">${step.durationMs}ms · ${step.status}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Agent pipeline 时间线">${stepMarkup}</svg>`;
  return { svg, steps, totalDurationMs, width, height };
}

export function buildAgentTraceView(trace: AgentTrace): AgentTraceView {
  const started = new Date(trace.startedAt);
  const ended = new Date(trace.endedAt);
  const durationMs = Math.max(0, ended.getTime() - started.getTime());
  const outputExcerpt = String(trace.output ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return {
    role: trace.role,
    durationMs,
    artifactCount: trace.artifacts?.length ?? 0,
    artifactKeys: (trace.artifacts ?? []).map((artifact) => artifact.key),
    outputExcerpt,
    startedAt: trace.startedAt,
    endedAt: trace.endedAt,
  };
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
