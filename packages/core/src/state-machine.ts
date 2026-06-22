import type { NovelStage } from './types.js';

export const STAGES: NovelStage[] = ['intake', 'bible', 'outline', 'draft', 'critique', 'revision', 'memory', 'completed'];

export function nextStage(stage: NovelStage): NovelStage | null {
  const index = STAGES.indexOf(stage);
  if (index < 0 || index === STAGES.length - 1) return null;
  return STAGES[index + 1];
}

export function advanceStage(current: NovelStage, target: NovelStage): NovelStage {
  const expected = nextStage(current);
  if (expected !== target) {
    throw new Error(`Invalid novel stage transition: ${current} -> ${target}`);
  }
  return target;
}
