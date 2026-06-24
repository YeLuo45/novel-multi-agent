import type { NovelMemory } from './types.js';

export function splitChapters(text: string): string[] {
  const normalized = text.trim();
  if (!normalized) return [];
  const parts = normalized.split(/(?=^#\s*第.+章)/m).map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [normalized];
}

export function summarizeRecentChapters(chapters: string[], count = 3): string[] {
  return chapters.slice(-count).map((chapter, index) => {
    const compact = chapter.replace(/\s+/g, ' ').slice(0, 120);
    return `近章${index + 1}: ${compact}`;
  });
}

export function createEmptyMemory(): NovelMemory {
  return {
    characters: {},
    foreshadowing: [],
    chapterSummaries: [],
    styleFingerprint: [],
  };
}

export function extractStyleFingerprint(text: string): string[] {
  const markers: string[] = [];
  if (/月|星|夜|影/.test(text)) markers.push('意象偏冷：月、星、夜、影');
  if (/说|提醒|发现/.test(text)) markers.push('叙事推进依赖发现与对话');
  if (text.length > 300) markers.push('段落较长，适合悬疑铺陈');
  return markers.length ? markers : ['保持原文叙事视角与节奏'];
}

export interface ContinuationContextInput {
  existingText: string;
  memory: NovelMemory;
  nextChapterTitle: string;
  maxRecentChapters?: number;
}

export interface ContinuationContext {
  nextChapterTitle: string;
  recentSummaries: string[];
  memoryBrief: string;
  styleGuide: string;
  promptBlock: string;
}

function formatMemoryBrief(memory: NovelMemory): string {
  const characterBrief = Object.entries(memory.characters).map(([name, state]) => `${name}: ${state}`);
  const sections = [...characterBrief, ...memory.foreshadowing.map((item) => `伏笔: ${item}`)];
  return sections.length ? sections.join('；') : '暂无稳定记忆。';
}

export function buildContinuationContext(input: ContinuationContextInput): ContinuationContext {
  const chapters = splitChapters(input.existingText);
  const recentSummaries = summarizeRecentChapters(chapters, input.maxRecentChapters ?? 3);
  const memoryBrief = formatMemoryBrief(input.memory);
  const styleGuide = input.memory.styleFingerprint.length ? input.memory.styleFingerprint.join('；') : extractStyleFingerprint(input.existingText).join('；');
  const promptBlock = [
    `续写目标：${input.nextChapterTitle}`,
    `前文摘要：${recentSummaries.length ? recentSummaries.join(' / ') : '暂无前文摘要'}`,
    `记忆约束：${memoryBrief}`,
    `风格指纹：${styleGuide}`,
  ].join('\n');
  return {
    nextChapterTitle: input.nextChapterTitle,
    recentSummaries,
    memoryBrief,
    styleGuide,
    promptBlock,
  };
}
