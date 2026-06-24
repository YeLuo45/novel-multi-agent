import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseImportedChapters } from '../src/index.js';

describe('chapter importer', () => {
  it('parses markdown and plain numbered chapters into normalized chapter records', () => {
    const chapters = parseImportedChapters(`# 第一章 月背图书馆
林澈遇见墨塔。

第二章 会移动的星图
星图改变了银河的位置。`);

    assert.equal(chapters.length, 2);
    assert.deepEqual(chapters.map((chapter) => chapter.number), [1, 2]);
    assert.deepEqual(chapters.map((chapter) => chapter.title), ['月背图书馆', '会移动的星图']);
    assert.ok(chapters[1]?.body.includes('银河'));
  });

  it('keeps untitled text as a single import chapter', () => {
    const chapters = parseImportedChapters('没有标题，但这是一段可续写的正文。');
    assert.equal(chapters.length, 1);
    assert.equal(chapters[0]?.number, 1);
    assert.equal(chapters[0]?.title, '未命名章节');
  });
});
