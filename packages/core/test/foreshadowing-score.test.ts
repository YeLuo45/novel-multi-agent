import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { scoreForeshadowingRecovery } from '../src/index.js';

describe('foreshadowing recovery scorer', () => {
  it('classifies planted, recovered, overdue, and missing foreshadowing items', () => {
    const report = scoreForeshadowingRecovery({
      planted: ['会移动的星图', '黑匣子里的名字', '月尘中的脚印'],
      recoveredText: '林澈终于确认，会移动的星图其实是远航黑匣子的导航残影。',
      maxOpenItems: 2,
    });

    assert.equal(report.total, 3);
    assert.equal(report.recovered.length, 2);
    assert.equal(report.open.length, 1);
    assert.equal(report.overdue.length, 0);
    assert.equal(report.score, 67);
    assert.ok(report.revisionAdvice.some((item) => item.includes('月尘中的脚印')));
  });

  it('marks too many open items as overdue risk', () => {
    const report = scoreForeshadowingRecovery({
      planted: ['A', 'B', 'C'],
      recoveredText: 'A 已经回收。',
      maxOpenItems: 1,
    });

    assert.deepEqual(report.recovered, ['A']);
    assert.deepEqual(report.overdue, ['B', 'C']);
    assert.ok(report.score < 70);
  });
});
