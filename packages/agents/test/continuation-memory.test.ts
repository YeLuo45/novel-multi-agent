import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runFullPipeline } from '../src/index.js';

describe('pipeline continuation memory usage', () => {
  it('writes continuation drafts that explicitly use stored character and foreshadowing memory', () => {
    const project = runFullPipeline({
      mode: 'continuation',
      existingText: '# 第一章 月背图书馆\n守夜人林澈遇见失忆AI墨塔。\n# 第二章 会移动的星图\n墨塔提醒林澈不要相信会移动的星图。',
      targetChapters: 4,
      targetWords: 900,
      language: 'zh-CN',
    });

    assert.equal(project.stage, 'completed');
    assert.ok(project.draft?.body.includes('记忆约束'));
    assert.ok(project.draft?.body.includes('林澈'));
    assert.ok(project.draft?.body.includes('会移动的星图'));
    assert.ok(project.memory.chapterSummaries.at(-1)?.includes(project.revision?.title ?? ''));
  });
});
