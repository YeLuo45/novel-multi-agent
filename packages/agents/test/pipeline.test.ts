import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runFullPipeline } from '../src/index.js';

describe('deterministic novel pipeline', () => {
  it('creates a completed project from a theme', () => {
    const project = runFullPipeline({ mode: 'theme', theme: '月球图书馆的守夜人与失忆AI', targetChapters: 3, targetWords: 900, language: 'zh-CN' });
    assert.equal(project.stage, 'completed');
    assert.equal(project.outline.length, 3);
    assert.ok(project.revision?.body.includes('下一章'));
    assert.ok(project.auditLog.length >= 7);
  });

  it('continues from existing chapters with recent context', () => {
    const existingText = `# 第一章 月背图书馆
林澈遇见墨塔。
# 第二章 星图
星图移动。`;
    const project = runFullPipeline({ mode: 'continuation', existingText, targetChapters: 4, targetWords: 900, language: 'zh-CN' });
    assert.equal(project.stage, 'completed');
    assert.ok(project.draft?.body.includes('续写目标'));
    assert.ok(project.draft?.body.includes('记忆约束'));
    assert.ok(project.memory.styleFingerprint.length > 0);
  });
});
