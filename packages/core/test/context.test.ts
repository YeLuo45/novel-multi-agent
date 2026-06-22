import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractStyleFingerprint, splitChapters, summarizeRecentChapters } from '../src/index.js';

describe('context helpers', () => {
  it('splits markdown chapters by Chinese chapter headings', () => {
    const chapters = splitChapters(`# 第一章 开端
内容
# 第二章 转折
更多内容`);
    assert.equal(chapters.length, 2);
  });

  it('summarizes only the recent chapter window', () => {
    const summaries = summarizeRecentChapters(['一', '二', '三', '四'], 2);
    assert.deepEqual(summaries, ['近章1: 三', '近章2: 四']);
  });

  it('extracts style markers from existing prose', () => {
    const markers = extractStyleFingerprint('月影里，林澈发现星图在夜色中移动。');
    assert.ok(markers.some((marker) => marker.includes('意象偏冷')));
  });
});
