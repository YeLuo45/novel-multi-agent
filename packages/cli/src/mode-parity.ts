export interface ModeParityCommand {
  command: string;
  title: string;
  cliUsage: string;
  webSurface: string;
  tuiSurface: string;
  workflowStage: 'create' | 'continue' | 'provider' | 'artifact' | 'quality';
}

export interface ModeParityRow extends ModeParityCommand {
  cli: true;
  web: true;
  tui: true;
}

export interface ModeParityMatrix {
  rows: ModeParityRow[];
  summary: {
    totalCliCommands: number;
    webAligned: number;
    tuiAligned: number;
    gaps: string[];
  };
}

export const MODE_PARITY_COMMANDS: ModeParityCommand[] = [
  { command: 'new', title: '主题新建', cliUsage: 'novel-ma new <theme> --chapters N --words N', webSurface: '根据主题创建 / V30 Longform Project OS', tuiSurface: 'Create Novel', workflowStage: 'create' },
  { command: 'continue', title: '篇章续写', cliUsage: 'novel-ma continue <file> --quality-artifact <artifact>', webSurface: '根据已有篇章续写 / Quality Repair Loop', tuiSurface: 'Continue Novel', workflowStage: 'continue' },
  { command: 'provider-smoke', title: 'Provider 试运行', cliUsage: 'novel-ma provider-smoke <prompt>', webSurface: 'Provider 实战面板 / Provider Live Runtime', tuiSurface: 'Provider Smoke', workflowStage: 'provider' },
  { command: 'provider-doctor', title: 'Provider 诊断', cliUsage: 'novel-ma provider-doctor', webSurface: 'Provider 实战面板', tuiSurface: 'Provider Doctor', workflowStage: 'provider' },
  { command: 'artifact-inspect', title: 'Artifact 检查', cliUsage: 'novel-ma artifact-inspect <artifact.json>', webSurface: 'Artifact 真实导入向导', tuiSurface: 'Artifact Inspect', workflowStage: 'artifact' },
  { command: 'artifact-catalog', title: '项目目录', cliUsage: 'novel-ma artifact-catalog .novel-ma/projects --enrich', webSurface: '项目目录索引 / 最近项目', tuiSurface: 'Artifact Catalog', workflowStage: 'artifact' },
  { command: 'artifact-latest', title: '最近版本', cliUsage: 'novel-ma artifact-latest .novel-ma/projects', webSurface: '项目目录索引 / 最近项目', tuiSurface: 'Artifact Latest', workflowStage: 'artifact' },
  { command: 'artifact-search', title: '语义搜索', cliUsage: 'novel-ma artifact-search .novel-ma/projects <query>', webSurface: '本地项目库 / Narrative Analytics', tuiSurface: 'Artifact Search', workflowStage: 'artifact' },
  { command: 'artifact-normalize', title: 'Schema 归一化', cliUsage: 'novel-ma artifact-normalize <artifact.json>', webSurface: 'Artifact Import Studio', tuiSurface: 'Artifact Normalize', workflowStage: 'artifact' },
  { command: 'artifact-export', title: 'Schema 导出', cliUsage: 'novel-ma artifact-export <artifact.json>', webSurface: 'Publishing Pipeline', tuiSurface: 'Artifact Export', workflowStage: 'artifact' },
  { command: 'artifact-version-tree', title: '章节版本树', cliUsage: 'novel-ma artifact-version-tree <artifact.json>', webSurface: 'Longform Project OS / 章节版本树', tuiSurface: 'Version Tree', workflowStage: 'artifact' },
  { command: 'artifact-prune', title: '清理计划', cliUsage: 'novel-ma artifact-prune .novel-ma/projects --keep 1', webSurface: '本地项目库清理面板', tuiSurface: 'Artifact Prune', workflowStage: 'artifact' },
  { command: 'artifact-diff', title: 'Artifact Diff', cliUsage: 'novel-ma artifact-diff <left> <right> --format text', webSurface: '导入两个 Artifact 对比', tuiSurface: 'Artifact Diff', workflowStage: 'artifact' },
  { command: 'continuation-check', title: '续写质量门禁', cliUsage: 'novel-ma continuation-check <artifact.json> <text>', webSurface: '续写质量面板 / Quality Repair Loop', tuiSurface: 'Continuation Check', workflowStage: 'quality' },
];

export function buildModeParityMatrix(commands: ModeParityCommand[] = MODE_PARITY_COMMANDS): ModeParityMatrix {
  const rows: ModeParityRow[] = commands.map((command) => ({ ...command, cli: true, web: true, tui: true }));
  return {
    rows,
    summary: {
      totalCliCommands: rows.length,
      webAligned: rows.filter((row) => row.web).length,
      tuiAligned: rows.filter((row) => row.tui).length,
      gaps: rows.filter((row) => !row.cli || !row.web || !row.tui).map((row) => row.command),
    },
  };
}

export function renderWebModeParityPanel(matrix: ModeParityMatrix = buildModeParityMatrix()): string {
  const lines = [
    'CLI/Web/TUI 功能对齐矩阵',
    `CLI commands=${matrix.summary.totalCliCommands}; Web aligned=${matrix.summary.webAligned}; TUI aligned=${matrix.summary.tuiAligned}`,
    ...matrix.rows.map((row) => `- ${row.command}: CLI=${row.cliUsage} | Web=${row.webSurface} | TUI=${row.tuiSurface}`),
  ];
  return lines.join('\n');
}

export function renderTuiModeParityPanel(matrix: ModeParityMatrix = buildModeParityMatrix()): string {
  const lines = [
    'Mode Parity',
    `Commands: ${matrix.summary.totalCliCommands}`,
    ...matrix.rows.map((row) => `[x] ${row.command.padEnd(22)} web:${row.webSurface} tui:${row.tuiSurface}`),
  ];
  return lines.join('\n');
}
