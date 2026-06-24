import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildContinuationContext, createEmptyMemory } from '../src/index.js';

describe('continuation context builder', () => {
  it('combines recent chapter summaries, memory, style, and next chapter intent', () => {
    const memory = createEmptyMemory();
    memory.characters['林澈'] = '守夜人，从被动观察转为主动追查。';
    memory.foreshadowing.push('会移动的星图必须回收');
    memory.styleFingerprint.push('冷色宇宙意象');

    const context = buildContinuationContext({
      existingText: '# 第一章 月背图书馆\n林澈遇见墨塔。\n# 第二章 会移动的星图\n墨塔提醒不要相信星图。',
      memory,
      nextChapterTitle: '第3章 黑匣子回声',
      maxRecentChapters: 2,
    });

    assert.equal(context.nextChapterTitle, '第3章 黑匣子回声');
    assert.equal(context.recentSummaries.length, 2);
    assert.ok(context.memoryBrief.includes('林澈'));
    assert.ok(context.memoryBrief.includes('会移动的星图必须回收'));
    assert.ok(context.styleGuide.includes('冷色宇宙意象'));
    assert.ok(context.promptBlock.includes('续写目标'));
  });

  it('uses safe fallbacks when existing chapters or memory are sparse', () => {
    const context = buildContinuationContext({
      existingText: '',
      memory: createEmptyMemory(),
      nextChapterTitle: '第1章 异常的开端',
    });

    assert.deepEqual(context.recentSummaries, []);
    assert.equal(context.memoryBrief, '暂无稳定记忆。');
    assert.equal(context.styleGuide, '保持原文叙事视角与节奏');
    assert.ok(context.promptBlock.includes('暂无前文摘要'));
  });
});
