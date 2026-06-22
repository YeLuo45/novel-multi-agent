import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { advanceStage, nextStage, STAGES } from '../src/index.js';

describe('novel stage machine', () => {
  it('walks the full pipeline one edge at a time', () => {
    let stage = STAGES[0];
    for (const target of STAGES.slice(1)) {
      stage = advanceStage(stage, target);
    }
    assert.equal(stage, 'completed');
  });

  it('rejects skipped stages when target jumps ahead', () => {
    assert.throws(() => advanceStage('intake', 'outline'), /Invalid novel stage transition/);
  });

  it('returns null after completed stage', () => {
    assert.equal(nextStage('completed'), null);
  });
});
