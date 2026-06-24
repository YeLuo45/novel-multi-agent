import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { runFullPipeline } from '@novel-ma/agents';
import { createLLMProviderFromEnv, diagnoseLLMProviderConfig, saveProject, type LlmProviderConfigDiagnostic, type LlmResult, type NovelInput } from '@novel-ma/core';
import { buildArtifactCatalog, buildArtifactMemoryGraph, buildLatestArtifactCatalog, compareArtifacts, compactArtifactCatalog, enrichArtifactCatalog, exportArtifactSchema, formatArtifactDiffReport, importArtifactJson, normalizeArtifactEnvelope, planArtifactPrune, searchArtifactCatalog, summarizeArtifact, assessContinuationQuality, type ArtifactCatalog, type ArtifactDiff, type ArtifactSearchResult, type ContinuationQualityReport, type LatestArtifactCatalog, type NormalizedArtifactEnvelope, type ArtifactSummary, type ArtifactPrunePlan } from '@novel-ma/core';

export interface CliResult {
  projectId: string;
  artifactPath: string;
  title: string;
  stage: string;
  chapterTitle: string;
  qualityGate?: ContinuationQualityReport;
}

export interface ArtifactInspectResult {
  summary: ArtifactSummary;
  graph: { nodes: number; edges: number };
  validation: { ok: boolean; issues: string[] };
}

function readOption(args: string[], name: string, fallback: string): string {
  const direct = args.indexOf(name);
  if (direct >= 0 && args[direct + 1]) return args[direct + 1];
  const npmKey = `npm_config_${name.replace(/^--/, '').replaceAll('-', '_')}`;
  return process.env[npmKey] && process.env[npmKey] !== 'true' ? process.env[npmKey] : fallback;
}

function findWorkspaceRoot(start: string): string {
  let current = start;
  while (true) {
    const packagePath = path.join(current, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { workspaces?: unknown };
      if (packageJson.workspaces) return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}

function resolveRoot(root: string): string {
  return findWorkspaceRoot(root);
}

function resolveInputPath(file: string, root: string): string {
  return path.isAbsolute(file) ? file : path.join(resolveRoot(root), file);
}

async function findArtifactFiles(root: string): Promise<string[]> {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await findArtifactFiles(fullPath)));
    if (entry.isFile() && entry.name === 'artifact.json') files.push(fullPath);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

export async function runNew(args: string[], root = process.cwd()): Promise<CliResult> {
  const theme = args.find((arg) => !arg.startsWith('--')) ?? '未命名主题';
  const input: NovelInput = {
    mode: 'theme',
    theme,
    targetChapters: Number(readOption(args, '--chapters', '3')),
    targetWords: Number(readOption(args, '--words', '900')),
    language: 'zh-CN',
  };
  const project = runFullPipeline(input);
  const storageRoot = resolveRoot(root);
  const artifactPath = await saveProject(storageRoot, project);
  return { projectId: project.id, artifactPath, title: project.title, stage: project.stage, chapterTitle: project.revision?.title ?? '' };
}

export async function runContinue(args: string[], root = process.cwd()): Promise<CliResult> {
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file) throw new Error('continue command requires a source file');
  const storageRoot = resolveRoot(root);
  const existingText = await readFile(resolveInputPath(file, storageRoot), 'utf8');
  const qualityArtifactPath = readOption(args, '--quality-artifact', '');
  const qualityText = readOption(args, '--quality-text', existingText);
  const qualityGate = qualityArtifactPath ? assessContinuationQuality(await readFile(resolveInputPath(qualityArtifactPath, storageRoot), 'utf8'), qualityText) : undefined;
  if (qualityGate && qualityGate.status === 'fail' && !hasFlag(args, '--force')) throw new Error(`quality gate failed: ${qualityGate.recommendations.join('; ')}`);
  const input: NovelInput = {
    mode: 'continuation',
    existingText,
    targetChapters: Number(readOption(args, '--chapters', '6')),
    targetWords: Number(readOption(args, '--words', '900')),
    language: 'zh-CN',
  };
  const project = runFullPipeline(input);
  const artifactPath = await saveProject(storageRoot, project);
  return { projectId: project.id, artifactPath, title: project.title, stage: project.stage, chapterTitle: project.revision?.title ?? '', qualityGate };
}

export async function runProviderSmoke(args: string[], env: Record<string, string | undefined> = process.env): Promise<LlmResult> {
  const prompt = args.find((arg) => !arg.startsWith('--')) ?? 'novel-multi-agent provider smoke';
  const provider = createLLMProviderFromEnv(env);
  return provider.complete({ prompt, temperature: 0 });
}

export function runProviderDoctor(env: Record<string, string | undefined> = process.env): LlmProviderConfigDiagnostic {
  return diagnoseLLMProviderConfig(env);
}

export async function runArtifactInspect(args: string[], root = process.cwd()): Promise<ArtifactInspectResult> {
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file) throw new Error('artifact-inspect command requires an artifact JSON file');
  const source = await readFile(resolveInputPath(file, root), 'utf8');
  const artifact = importArtifactJson(source);
  const graph = buildArtifactMemoryGraph(artifact);
  return {
    summary: summarizeArtifact(artifact),
    graph: { nodes: graph.nodes.length, edges: graph.edges.length },
    validation: { ok: true, issues: [] },
  };
}

export async function runArtifactCatalog(args: string[], root = process.cwd()): Promise<ArtifactCatalog> {
  const catalogRootArg = args.find((arg) => !arg.startsWith('--')) ?? '.novel-ma/projects';
  const catalogRoot = resolveInputPath(catalogRootArg, root);
  const files = await findArtifactFiles(catalogRoot);
  const entries = await Promise.all(
    files.map(async (file) => ({ path: file, json: await readFile(file, 'utf8') })),
  );
  const catalog = buildArtifactCatalog(entries);
  return hasFlag(args, '--enrich') ? enrichArtifactCatalog(catalog) : catalog;
}

async function readCatalogEntries(catalogRootArg: string, root: string): Promise<Array<{ path: string; json: string }>> {
  const catalogRoot = resolveInputPath(catalogRootArg, root);
  const files = await findArtifactFiles(catalogRoot);
  return Promise.all(files.map(async (file) => ({ path: file, json: await readFile(file, 'utf8') })));
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

export async function runArtifactLatest(args: string[], root = process.cwd()): Promise<LatestArtifactCatalog> {
  const catalogRootArg = args.find((arg) => !arg.startsWith('--')) ?? '.novel-ma/projects';
  return compactArtifactCatalog(buildLatestArtifactCatalog(await readCatalogEntries(catalogRootArg, root)), { verbose: hasFlag(args, '--verbose') });
}

function positionalArgs(args: string[], valueFlags: string[] = []): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (valueFlags.includes(arg)) {
      index += 1;
      continue;
    }
    if (!arg.startsWith('--')) values.push(arg);
  }
  return values;
}

export async function runArtifactSearch(args: string[], root = process.cwd()): Promise<ArtifactSearchResult> {
  const positional = positionalArgs(args, ['--mode']);
  const catalogRootArg = positional[0] ?? '.novel-ma/projects';
  const query = positional.slice(1).join(' ');
  const mode = readOption(args, '--mode', '');
  const fullCatalog = buildArtifactCatalog(await readCatalogEntries(catalogRootArg, root));
  const searchableCatalog = hasFlag(args, '--latest-only') ? buildLatestArtifactCatalog(await readCatalogEntries(catalogRootArg, root)).groups.reduce<ArtifactCatalog>((catalog, group) => ({ items: [...catalog.items, group.latest], issues: catalog.issues }), { items: [], issues: fullCatalog.issues }) : fullCatalog;
  const modeCatalog = mode ? { ...searchableCatalog, items: searchableCatalog.items.filter((item) => item.mode === mode) } : searchableCatalog;
  const result = searchArtifactCatalog(modeCatalog, query);
  return { ...result, items: compactArtifactCatalog({ items: result.items, issues: [] }, { verbose: hasFlag(args, '--verbose') }).items };
}

export async function runArtifactNormalize(args: string[], root = process.cwd()): Promise<NormalizedArtifactEnvelope> {
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file) throw new Error('artifact-normalize command requires an artifact JSON file');
  return normalizeArtifactEnvelope(await readFile(resolveInputPath(file, root), 'utf8'));
}

export async function runArtifactExport(args: string[], root = process.cwd()): Promise<NormalizedArtifactEnvelope> {
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file) throw new Error('artifact-export command requires an artifact JSON file');
  return exportArtifactSchema(await readFile(resolveInputPath(file, root), 'utf8'), 'v2');
}

export async function runArtifactPrune(args: string[], root = process.cwd()): Promise<ArtifactPrunePlan> {
  const catalogRootArg = args.find((arg) => !arg.startsWith('--')) ?? '.novel-ma/projects';
  const keep = Number(readOption(args, '--keep', '1'));
  const catalog = buildLatestArtifactCatalog(await readCatalogEntries(catalogRootArg, root));
  const plan = planArtifactPrune(catalog, { keep });
  if (!hasFlag(args, '--apply')) return plan;
  const catalogRoot = resolveInputPath(catalogRootArg, root);
  const manifestPath = path.join(catalogRoot, `prune-manifest-${Date.now()}.json`);
  const removed = plan.remove.map((item) => ({ projectId: item.projectId, sourcePath: item.sourcePath }));
  await writeFile(manifestPath, JSON.stringify({ removed, keep: plan.keep.map((item) => ({ projectId: item.projectId, sourcePath: item.sourcePath })) }, null, 2), 'utf8');
  for (const item of plan.remove) await rm(path.dirname(item.sourcePath), { recursive: true, force: true });
  return { ...plan, dryRun: false, backupManifest: { manifestPath, removed } };
}

export async function runArtifactDiff(args: string[], root = process.cwd()): Promise<ArtifactDiff[] | string> {
  const positional = positionalArgs(args, ['--format']);
  const [leftPath, rightPath] = positional;
  if (!leftPath || !rightPath) throw new Error('artifact-diff command requires left and right artifact JSON files');
  const left = importArtifactJson(await readFile(resolveInputPath(leftPath, root), 'utf8'));
  const right = importArtifactJson(await readFile(resolveInputPath(rightPath, root), 'utf8'));
  const diff = compareArtifacts(left, right);
  return readOption(args, '--format', 'json') === 'text' ? formatArtifactDiffReport(diff) : diff;
}

export async function runContinuationCheck(args: string[], root = process.cwd()): Promise<ContinuationQualityReport> {
  const positional = args.filter((arg) => !arg.startsWith('--'));
  const [artifactPath, ...textParts] = positional;
  if (!artifactPath) throw new Error('continuation-check command requires an artifact JSON file');
  const continuationText = textParts.join(' ');
  return assessContinuationQuality(await readFile(resolveInputPath(artifactPath, root), 'utf8'), continuationText);
}
