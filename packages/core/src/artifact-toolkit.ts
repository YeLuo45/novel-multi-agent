import type { ChapterCard, NovelMemory, NovelProject, NovelStage, SourceMode, StoryBible } from './types.js';

export interface ArtifactForeshadowingScore {
  score: number;
  missingPayoffs?: string[];
  danglingSetups?: string[];
}

export interface NovelArtifactPayload {
  mode: SourceMode;
  bible: StoryBible;
  outline: ChapterCard[];
  memory: NovelMemory;
  foreshadowingScore?: ArtifactForeshadowingScore;
}

export interface NovelArtifactEnvelope {
  projectId: string;
  title: string;
  stage: NovelStage;
  chapterTitle: string;
  artifact: NovelArtifactPayload;
}

export interface ArtifactSummary {
  projectId: string;
  title: string;
  stage: NovelStage;
  chapterTitle: string;
  mode: SourceMode;
  outlineChapters: number;
  characterCount: number;
  foreshadowingCount: number;
  foreshadowingScore: number | null;
  danglingSetups: string[];
}

export interface ArtifactDiff {
  field: string;
  left: unknown;
  right: unknown;
}

export interface ArtifactMemoryNode {
  id: string;
  label: string;
  kind: 'style' | 'character' | 'foreshadowing' | 'chapter';
  detail?: string;
}

export interface ArtifactMemoryEdge {
  from: string;
  to: string;
  relation: 'mentions' | 'contains' | 'styles';
}

export interface ArtifactMemoryGraph {
  nodes: ArtifactMemoryNode[];
  edges: ArtifactMemoryEdge[];
}

export interface ArtifactLibraryItem {
  projectId: string;
  title: string;
  stage: NovelStage;
  chapterTitle: string;
}

export interface MemoryArtifactLibrary {
  save(artifact: NovelArtifactEnvelope): void;
  list(): ArtifactLibraryItem[];
  load(projectId: string): NovelArtifactEnvelope | undefined;
  remove(projectId: string): boolean;
  exportJson(): string;
}

export interface ArtifactCatalogEntry {
  path: string;
  json: string | unknown;
}

export interface ArtifactCatalogItem extends ArtifactLibraryItem {
  mode: SourceMode;
  outlineChapters: number;
  updatedAt: string | null;
  sourcePath: string;
  searchableText?: string;
  tags?: string[];
  qualityScore?: number;
}

export interface ArtifactCatalogIssue {
  path: string;
  message: string;
}

export interface ArtifactCatalog {
  items: ArtifactCatalogItem[];
  issues: ArtifactCatalogIssue[];
}

export interface LatestArtifactCatalogGroup {
  key: string;
  latest: ArtifactCatalogItem;
  history: ArtifactCatalogItem[];
}

export interface LatestArtifactCatalog extends ArtifactCatalog {
  groups: LatestArtifactCatalogGroup[];
}

export interface NormalizedArtifactEnvelope {
  schemaVersion: 2;
  envelope: NovelArtifactEnvelope;
  summary: ArtifactSummary;
  graph: ArtifactMemoryGraph;
}

export interface ArtifactSearchResult {
  query: string;
  items: ArtifactCatalogItem[];
}

export interface ContinuationQualityReport {
  status: 'pass' | 'warn' | 'fail';
  score: number;
  dimensionScores: { characters: number; foreshadowing: number; style: number };
  matched: { characters: string[]; foreshadowing: string[]; style: string[] };
  missing: { characters: string[]; foreshadowing: string[]; style: string[] };
  recommendations: string[];
}

export interface ArtifactCatalogCompactOptions {
  verbose?: boolean;
}

export interface ArtifactPruneManifest {
  manifestPath: string;
  removed: Array<{ projectId: string; sourcePath: string }>;
}

export interface ArtifactPrunePlan {
  dryRun: boolean;
  keep: ArtifactCatalogItem[];
  remove: ArtifactCatalogItem[];
  backupManifest?: ArtifactPruneManifest;
}

export interface ChapterVersion {
  id: string;
  parentId?: string;
  chapterNumber: number;
  title: string;
  body: string;
  createdAt: string;
  source: 'draft' | 'revision' | 'import';
}

export interface ChapterVersionNode extends ChapterVersion {
  children: ChapterVersionNode[];
}

export interface ChapterVersionTree {
  roots: ChapterVersionNode[];
  nodesById: Record<string, ChapterVersionNode>;
  latestByChapter: ChapterVersionNode[];
  pathsByLeaf: Record<string, ChapterVersionNode[]>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.length === 0) throw new Error(`artifact ${field} is required`);
  return value;
}

function parseJson(json: string | unknown): unknown {
  if (typeof json !== 'string') return json;
  try {
    return JSON.parse(json);
  } catch {
    throw new Error('artifact input must be valid JSON');
  }
}

function isNovelProject(record: Record<string, unknown>): boolean {
  return typeof record.id === 'string' && isRecord(record.input) && Array.isArray(record.outline) && isRecord(record.memory);
}

function fromNovelProject(project: NovelProject): NovelArtifactEnvelope {
  return {
    projectId: project.id,
    title: project.title,
    stage: project.stage,
    chapterTitle: project.revision?.title ?? project.draft?.title ?? project.outline[0]?.title ?? '',
    artifact: {
      mode: project.input.mode,
      bible: project.bible ?? {
        premise: project.title,
        genre: 'unknown',
        tone: 'unknown',
        worldRules: [],
        characters: [],
        promises: [],
      },
      outline: project.outline,
      memory: project.memory,
    },
  };
}

export function importArtifactJson(json: string | unknown): NovelArtifactEnvelope {
  const parsed = parseJson(json);
  if (!isRecord(parsed)) throw new Error('artifact input must be an object');
  if (isNovelProject(parsed)) return fromNovelProject(parsed as unknown as NovelProject);
  const projectId = requireString(parsed, 'projectId');
  const title = requireString(parsed, 'title');
  const stage = requireString(parsed, 'stage') as NovelStage;
  const chapterTitle = requireString(parsed, 'chapterTitle');
  const artifact = parsed.artifact;
  if (!isRecord(artifact)) throw new Error('artifact artifact is required');
  const outline = artifact.outline;
  if (!Array.isArray(outline)) throw new Error('artifact outline is required');
  return {
    projectId,
    title,
    stage,
    chapterTitle,
    artifact: artifact as unknown as NovelArtifactPayload,
  };
}

export function summarizeArtifact(artifact: NovelArtifactEnvelope): ArtifactSummary {
  const foreshadowingScore = artifact.artifact.foreshadowingScore;
  return {
    projectId: artifact.projectId,
    title: artifact.title,
    stage: artifact.stage,
    chapterTitle: artifact.chapterTitle,
    mode: artifact.artifact.mode,
    outlineChapters: artifact.artifact.outline.length,
    characterCount: Object.keys(artifact.artifact.memory.characters).length,
    foreshadowingCount: artifact.artifact.memory.foreshadowing.length,
    foreshadowingScore: foreshadowingScore?.score ?? null,
    danglingSetups: foreshadowingScore?.danglingSetups ?? [],
  };
}

function pushDiff(diffs: ArtifactDiff[], field: string, left: unknown, right: unknown): void {
  if (JSON.stringify(left) !== JSON.stringify(right)) diffs.push({ field, left, right });
}

export function compareArtifacts(left: NovelArtifactEnvelope, right: NovelArtifactEnvelope): ArtifactDiff[] {
  const diffs: ArtifactDiff[] = [];
  pushDiff(diffs, 'title', left.title, right.title);
  pushDiff(diffs, 'artifact.mode', left.artifact.mode, right.artifact.mode);
  pushDiff(diffs, 'chapterTitle', left.chapterTitle, right.chapterTitle);
  pushDiff(diffs, 'foreshadowingScore.score', left.artifact.foreshadowingScore?.score ?? null, right.artifact.foreshadowingScore?.score ?? null);
  pushDiff(diffs, 'outline.length', left.artifact.outline.length, right.artifact.outline.length);
  return diffs;
}

export function formatArtifactDiffReport(diffs: ArtifactDiff[]): string {
  if (diffs.length === 0) return 'No artifact differences.';
  return diffs.map((diff) => `${diff.field}: ${JSON.stringify(diff.left)} → ${JSON.stringify(diff.right)}`).join('\n');
}

export function buildArtifactMemoryGraph(artifact: NovelArtifactEnvelope): ArtifactMemoryGraph {
  const nodes = new Map<string, ArtifactMemoryNode>();
  const edges: ArtifactMemoryEdge[] = [];
  const addNode = (node: ArtifactMemoryNode): void => {
    nodes.set(node.id, node);
  };

  for (const [name, detail] of Object.entries(artifact.artifact.memory.characters)) addNode({ id: `character:${name}`, label: name, kind: 'character', detail });
  for (const style of artifact.artifact.memory.styleFingerprint) addNode({ id: `style:${style}`, label: style, kind: 'style' });
  for (const setup of artifact.artifact.memory.foreshadowing) addNode({ id: `foreshadowing:${setup}`, label: setup, kind: 'foreshadowing' });

  for (const chapter of artifact.artifact.outline) {
    const chapterId = `chapter:${chapter.number}`;
    addNode({ id: chapterId, label: chapter.title, kind: 'chapter', detail: chapter.purpose });
    edges.push({ from: chapterId, to: `style:${artifact.artifact.memory.styleFingerprint[0] ?? 'default'}`, relation: 'styles' });
    for (const setup of chapter.foreshadowing) edges.push({ from: chapterId, to: `foreshadowing:${setup}`, relation: 'contains' });
    for (const character of Object.keys(artifact.artifact.memory.characters)) {
      if (chapter.purpose.includes(character) || chapter.conflict.includes(character) || chapter.title.includes(character)) {
        edges.push({ from: chapterId, to: `character:${character}`, relation: 'mentions' });
      }
    }
  }

  return { nodes: [...nodes.values()], edges };
}

export function createMemoryArtifactLibrary(initial: NovelArtifactEnvelope[] = []): MemoryArtifactLibrary {
  const artifacts = new Map<string, NovelArtifactEnvelope>();
  for (const artifact of initial) artifacts.set(artifact.projectId, artifact);
  return {
    save(artifact) {
      artifacts.set(artifact.projectId, artifact);
    },
    list() {
      return [...artifacts.values()].map(({ projectId, title, stage, chapterTitle }) => ({ projectId, title, stage, chapterTitle }));
    },
    load(projectId) {
      return artifacts.get(projectId);
    },
    remove(projectId) {
      return artifacts.delete(projectId);
    },
    exportJson() {
      return JSON.stringify([...artifacts.values()], null, 2);
    },
  };
}

function extractUpdatedAt(raw: unknown): string | null {
  const parsed = parseJson(raw);
  if (!isRecord(parsed)) return null;
  const auditLog = parsed.auditLog;
  if (!Array.isArray(auditLog)) return null;
  const latest = [...auditLog]
    .reverse()
    .find((entry): entry is { createdAt: string } => isRecord(entry) && typeof entry.createdAt === 'string');
  return latest?.createdAt ?? null;
}

function collectArtifactSearchText(artifact: NovelArtifactEnvelope): string {
  return [
    artifact.projectId,
    artifact.title,
    artifact.stage,
    artifact.chapterTitle,
    artifact.artifact.mode,
    artifact.artifact.bible.premise,
    artifact.artifact.bible.genre,
    artifact.artifact.bible.tone,
    ...artifact.artifact.bible.characters,
    ...artifact.artifact.bible.worldRules,
    ...artifact.artifact.bible.promises,
    ...artifact.artifact.outline.flatMap((chapter) => [chapter.title, chapter.purpose, chapter.conflict, ...chapter.foreshadowing]),
    ...Object.keys(artifact.artifact.memory.characters),
    ...Object.values(artifact.artifact.memory.characters),
    ...artifact.artifact.memory.foreshadowing,
    ...artifact.artifact.memory.chapterSummaries,
    ...artifact.artifact.memory.styleFingerprint,
  ].join(' ');
}

export function buildArtifactCatalog(entries: ArtifactCatalogEntry[]): ArtifactCatalog {
  const items: ArtifactCatalogItem[] = [];
  const issues: ArtifactCatalogIssue[] = [];
  for (const entry of entries) {
    try {
      const artifact = importArtifactJson(entry.json);
      const summary = summarizeArtifact(artifact);
      items.push({
        projectId: summary.projectId,
        title: summary.title,
        stage: summary.stage,
        chapterTitle: summary.chapterTitle,
        mode: summary.mode,
        outlineChapters: summary.outlineChapters,
        updatedAt: extractUpdatedAt(entry.json),
        sourcePath: entry.path,
        searchableText: `${collectArtifactSearchText(artifact)} score:${summary.foreshadowingScore ?? 0}`,
      });
    } catch (error) {
      issues.push({ path: entry.path, message: error instanceof Error ? error.message : String(error) });
    }
  }
  items.sort((left, right) => left.title.localeCompare(right.title, 'zh-CN') || left.projectId.localeCompare(right.projectId, 'zh-CN'));
  return { items, issues };
}

export function buildLatestArtifactCatalog(entries: ArtifactCatalogEntry[]): LatestArtifactCatalog {
  const catalog = buildArtifactCatalog(entries);
  const groupsByKey = new Map<string, ArtifactCatalogItem[]>();
  for (const item of catalog.items) {
    const key = `${item.title}|${item.mode}`;
    groupsByKey.set(key, [...(groupsByKey.get(key) ?? []), item]);
  }
  const groups = [...groupsByKey.entries()].map(([key, history]) => {
    const sorted = [...history].sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? '') || right.projectId.localeCompare(left.projectId));
    return { key, latest: sorted[0] as ArtifactCatalogItem, history: sorted };
  });
  groups.sort((left, right) => left.latest.title.localeCompare(right.latest.title, 'zh-CN') || left.key.localeCompare(right.key, 'zh-CN'));
  return { ...catalog, groups };
}

function extractCatalogTags(text: string): string[] {
  const tags = new Set<string>();
  for (const tag of ['科幻', '悬疑', '奇幻', '现实', '长篇', '短篇', 'theme', 'continuation']) {
    if (text.includes(tag.toLowerCase())) tags.add(tag);
  }
  return [...tags];
}

function scoreCatalogItem(item: ArtifactCatalogItem): number {
  const text = item.searchableText ?? '';
  const tagBonus = extractCatalogTags(text.toLowerCase()).length * 4;
  const outlineBonus = Math.min(20, item.outlineChapters * 4);
  const scoreMatch = text.match(/(?:"score"\s*:\s*|score:)(\d+)/);
  const explicitScore = scoreMatch ? Number(scoreMatch[1]) : 0;
  return Math.min(100, Math.round(explicitScore * 0.6 + outlineBonus + tagBonus));
}

export function enrichArtifactCatalog<T extends ArtifactCatalog>(catalog: T): T {
  const items = catalog.items
    .map((item) => {
      const text = [item.title, item.mode, item.searchableText ?? ''].join(' ').toLowerCase();
      return { ...item, tags: extractCatalogTags(text), qualityScore: scoreCatalogItem(item) };
    })
    .sort((left, right) => (right.qualityScore ?? 0) - (left.qualityScore ?? 0) || left.title.localeCompare(right.title, 'zh-CN') || left.projectId.localeCompare(right.projectId, 'zh-CN'));
  if ('groups' in catalog && Array.isArray((catalog as LatestArtifactCatalog).groups)) {
    const byPath = new Map(items.map((item) => [item.sourcePath, item]));
    const groups = (catalog as LatestArtifactCatalog).groups.map((group) => ({
      key: group.key,
      latest: byPath.get(group.latest.sourcePath) ?? group.latest,
      history: group.history.map((item) => byPath.get(item.sourcePath) ?? item),
    }));
    return { ...catalog, items, groups };
  }
  return { ...catalog, items };
}

export function normalizeArtifactEnvelope(input: string | unknown): NormalizedArtifactEnvelope {
  const parsed = parseJson(input);
  if (isRecord(parsed) && parsed.schemaVersion === 2 && isRecord(parsed.envelope)) {
    const envelope = importArtifactJson(parsed.envelope);
    return {
      schemaVersion: 2,
      envelope,
      summary: summarizeArtifact(envelope),
      graph: buildArtifactMemoryGraph(envelope),
    };
  }
  const envelope = importArtifactJson(parsed);
  return {
    schemaVersion: 2,
    envelope,
    summary: summarizeArtifact(envelope),
    graph: buildArtifactMemoryGraph(envelope),
  };
}

function collectSearchText(item: ArtifactCatalogItem): string {
  return [item.projectId, item.title, item.stage, item.chapterTitle, item.mode, item.sourcePath, item.searchableText ?? ''].join(' ').toLowerCase();
}

export function searchArtifactCatalog(catalog: ArtifactCatalog, query: string): ArtifactSearchResult {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const items = terms.length === 0 ? catalog.items : catalog.items.filter((item) => terms.every((term) => collectSearchText(item).includes(term)));
  return { query, items: items.map((item) => ({ ...item })) };
}

export function compactArtifactCatalog<T extends ArtifactCatalog>(catalog: T, options: ArtifactCatalogCompactOptions = {}): T {
  if (options.verbose) return catalog;
  const compactItems = catalog.items.map(({ searchableText: _searchableText, ...item }) => item as ArtifactCatalogItem);
  if ('groups' in catalog && Array.isArray((catalog as LatestArtifactCatalog).groups)) {
    const compactByPath = new Map(compactItems.map((item) => [item.sourcePath, item]));
    const groups = (catalog as LatestArtifactCatalog).groups.map((group) => ({
      key: group.key,
      latest: compactByPath.get(group.latest.sourcePath) ?? group.latest,
      history: group.history.map((item) => compactByPath.get(item.sourcePath) ?? item),
    }));
    return { ...catalog, items: compactItems, groups };
  }
  return { ...catalog, items: compactItems };
}

export function planArtifactPrune(catalog: LatestArtifactCatalog, options: { keep?: number } = {}): ArtifactPrunePlan {
  const keepCount = Math.max(1, Math.floor(options.keep ?? 1));
  const keep: ArtifactCatalogItem[] = [];
  const remove: ArtifactCatalogItem[] = [];
  for (const group of catalog.groups) {
    keep.push(...group.history.slice(0, keepCount));
    remove.push(...group.history.slice(keepCount));
  }
  return { dryRun: true, keep, remove };
}

export function exportArtifactSchema(input: NovelArtifactEnvelope | string | unknown, schema: 'v2' = 'v2'): NormalizedArtifactEnvelope {
  if (schema !== 'v2') throw new Error(`unsupported artifact schema: ${schema}`);
  return normalizeArtifactEnvelope(input);
}

function splitMatched(values: string[], text: string): { matched: string[]; missing: string[] } {
  const normalized = text.toLowerCase();
  const matched = values.filter((value) => {
    const normalizedValue = value.toLowerCase();
    if (normalized.includes(normalizedValue)) return true;
    const tokens = normalizedValue.split(/[\s:：，。、；;,.!?！？、]+/).filter((token) => token.length >= 2);
    return tokens.some((token) => normalized.includes(token));
  });
  return { matched, missing: values.filter((value) => !matched.includes(value)) };
}

export function suggestContinuationRepairs(report: ContinuationQualityReport): string[] {
  const suggestions: string[] = [];
  for (const character of report.missing.characters) suggestions.push(`补一句让${character}主动参与当前场景。`);
  for (const setup of report.missing.foreshadowing) suggestions.push(`安排一个动作或意象回收“${setup}”。`);
  for (const style of report.missing.style) suggestions.push(`改写一段句子以贴合“${style}”。`);
  return suggestions.length ? suggestions : ['当前续写已覆盖主要记忆线索，保持节奏推进。'];
}

export function assessContinuationQuality(artifactInput: NovelArtifactEnvelope | string | unknown, continuationText: string): ContinuationQualityReport {
  const artifact = typeof artifactInput === 'string' || !('artifact' in (artifactInput as Record<string, unknown>)) ? importArtifactJson(artifactInput) : (artifactInput as NovelArtifactEnvelope);
  const characters = Object.keys(artifact.artifact.memory.characters);
  const foreshadowing = artifact.artifact.memory.foreshadowing;
  const style = artifact.artifact.memory.styleFingerprint;
  const charMatch = splitMatched(characters, continuationText);
  const setupMatch = splitMatched(foreshadowing, continuationText);
  const styleMatch = splitMatched(style, continuationText);
  const total = characters.length + foreshadowing.length + style.length;
  const matchedCount = charMatch.matched.length + setupMatch.matched.length + styleMatch.matched.length;
  const score = total === 0 ? 100 : Math.round((matchedCount / total) * 100);
  const dimensionScores = {
    characters: characters.length === 0 ? 100 : Math.round((charMatch.matched.length / characters.length) * 100),
    foreshadowing: foreshadowing.length === 0 ? 100 : Math.round((setupMatch.matched.length / foreshadowing.length) * 100),
    style: style.length === 0 ? 100 : Math.round((styleMatch.matched.length / style.length) * 100),
  };
  const status = score >= 60 ? 'pass' : score >= 30 ? 'warn' : 'fail';
  const recommendations: string[] = [];
  if (charMatch.missing.length) recommendations.push(`补充角色：${charMatch.missing.join('、')}`);
  if (setupMatch.missing.length) recommendations.push(`回收伏笔：${setupMatch.missing.join('、')}`);
  if (styleMatch.missing.length) recommendations.push(`贴合文风：${styleMatch.missing.join('、')}`);
  return {
    status,
    score,
    dimensionScores,
    matched: { characters: charMatch.matched, foreshadowing: setupMatch.matched, style: styleMatch.matched },
    missing: { characters: charMatch.missing, foreshadowing: setupMatch.missing, style: styleMatch.missing },
    recommendations,
  };
}

function collectPathToRoot(node: ChapterVersionNode, nodesById: Record<string, ChapterVersionNode>): ChapterVersionNode[] {
  const path: ChapterVersionNode[] = [node];
  let current = node;
  while (current.parentId && nodesById[current.parentId]) {
    current = nodesById[current.parentId] as ChapterVersionNode;
    path.unshift(current);
  }
  return path;
}

export function buildChapterVersionTree(versions: ChapterVersion[]): ChapterVersionTree {
  const nodesById: Record<string, ChapterVersionNode> = {};
  for (const version of versions) nodesById[version.id] = { ...version, children: [] };

  const roots: ChapterVersionNode[] = [];
  for (const node of Object.values(nodesById)) {
    const parent = node.parentId ? nodesById[node.parentId] : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortByDate = (left: ChapterVersionNode, right: ChapterVersionNode): number => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);
  for (const node of Object.values(nodesById)) node.children.sort(sortByDate);
  roots.sort((left, right) => left.chapterNumber - right.chapterNumber || sortByDate(left, right));

  const latestByChapter = [...Object.values(nodesById).reduce<Map<number, ChapterVersionNode>>((map, node) => {
    const current = map.get(node.chapterNumber);
    if (!current || sortByDate(current, node) <= 0) map.set(node.chapterNumber, node);
    return map;
  }, new Map()).values()].sort((left, right) => left.chapterNumber - right.chapterNumber);

  const leaves = Object.values(nodesById).filter((node) => node.children.length === 0);
  const pathsByLeaf = Object.fromEntries(leaves.map((leaf) => [leaf.id, collectPathToRoot(leaf, nodesById)]));
  return { roots, nodesById, latestByChapter, pathsByLeaf };
}
