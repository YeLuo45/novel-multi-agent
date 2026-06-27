import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coverageDir = path.join(root, '.coverage-v8');
rmSync(coverageDir, { recursive: true, force: true });
mkdirSync(coverageDir, { recursive: true });

const result = spawnSync('npm', ['test'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NODE_V8_COVERAGE: coverageDir },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const targets = {
  'packages/core/src/context.ts': ['buildContinuationContext'],
  'packages/core/src/llm-provider.ts': ['createMockLlmProvider', 'createOpenAICompatibleProvider', 'generateWithFallback'],
  'packages/core/src/chapter-importer.ts': ['parseImportedChapters'],
  'packages/core/src/foreshadowing-score.ts': ['scoreForeshadowingRecovery'],
  'packages/agents/src/deterministic-agents.ts': ['runBibleAgent', 'runWriterAgent', 'runMemoryAgent'],
  'packages/cli/src/web-studio.ts': ['buildWebNavigation', 'buildWebOnboarding', 'buildWebHelp', 'buildWebDefaultView', 'buildInteractivePanel', 'buildChapterEditor', 'computeWordStats', 'planChapterSave', 'buildChapterContext', 'appendChapterRevision', 'buildForeshadowingGraphSvg', 'buildCharacterArcSvg', 'buildChapterPacingSvg', 'buildRevisionTree', 'buildTagIndex', 'searchProjectsIndexed', 'planIndexedDbMigration', 'buildDiffView', 'buildImportWizard', 'computeDailyGoal', 'buildHeatmapSvg', 'planFocusSession', 'planUndoEntry', 'buildPwaManifest', 'buildServiceWorkerPlan', 'renderServiceWorkerScript', 'assessOfflineCapability', 'buildPipelineTimelineSvg', 'buildAgentTraceView', 'parseArtifactIndex', 'planArtifactSync', 'buildIndexedDbSchema', 'buildIndexedDbAdapter', 'buildMigrationScript', 'renderMarkdown', 'extractMarkdownOutline', 'buildRichTextToolbar', 'buildUndoStackConfig', 'pushUndoEntry', 'popUndoEntry', 'planUndoRestore', 'computeUndoStats', 'buildIndexedDbRuntime', 'planIndexedDbBatch', 'assessIndexedDbQuota', 'buildChapterDocument', 'switchChapterView', 'planChapterEdit', 'planKeyboardShortcut', 'buildChapterShortcutBindings', 'buildRedoStackConfig', 'pushRedoEntry', 'popRedoEntry', 'planRedoForward', 'buildIdbExecutor', 'planIdbMigration', 'buildTuiMirror', 'planIdbExecution'],
};

function normalizeUrl(url) {
  return url.startsWith('file://') ? new URL(url).pathname : url;
}

function isCovered(fn) {
  return fn.ranges?.some((range) => range.count > 0) ?? false;
}

const covered = new Map();
for (const file of readdirSync(coverageDir)) {
  if (!file.endsWith('.json')) continue;
  const payload = JSON.parse(readFileSync(path.join(coverageDir, file), 'utf8'));
  for (const script of payload.result ?? []) {
    const scriptPath = normalizeUrl(script.url ?? '');
    const target = Object.keys(targets).find((item) => scriptPath.endsWith(item));
    if (!target) continue;
    const names = targets[target];
    const set = covered.get(target) ?? new Set();
    for (const fn of script.functions ?? []) {
      if (names.includes(fn.functionName) && isCovered(fn)) set.add(fn.functionName);
    }
    covered.set(target, set);
  }
}

let totalCovered = 0;
let total = 0;
for (const [target, names] of Object.entries(targets)) {
  const set = covered.get(target) ?? new Set();
  totalCovered += set.size;
  total += names.length;
  const pct = names.length ? (set.size / names.length) * 100 : 100;
  const missing = names.filter((name) => !set.has(name));
  console.log(`${target}: ${set.size}/${names.length} increment functions (${pct.toFixed(2)}%)`);
  if (missing.length) console.log(`missing: ${missing.join(', ')}`);
}
const overall = total ? (totalCovered / total) * 100 : 100;
console.log(`incremental coverage: ${totalCovered}/${total} functions (${overall.toFixed(2)}%)`);
if (overall < 95) {
  console.error('incremental coverage below 95%');
  process.exit(1);
}
