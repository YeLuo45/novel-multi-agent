export interface ForeshadowingScoreInput {
  planted: string[];
  recoveredText: string;
  maxOpenItems?: number;
}

export interface ForeshadowingScoreReport {
  total: number;
  recovered: string[];
  open: string[];
  overdue: string[];
  score: number;
  revisionAdvice: string[];
}

function isRecovered(item: string, normalizedText: string): boolean {
  const normalizedItem = item.toLowerCase();
  if (normalizedText.includes(normalizedItem)) return true;
  const tokens = normalizedItem.split(/[\s，。；、里的]+/).filter((token) => token.length >= 2);
  return tokens.some((token) => normalizedText.includes(token));
}

export function scoreForeshadowingRecovery(input: ForeshadowingScoreInput): ForeshadowingScoreReport {
  const maxOpenItems = input.maxOpenItems ?? 3;
  const normalized = input.recoveredText.toLowerCase();
  const recovered = input.planted.filter((item) => isRecovered(item, normalized));
  const open = input.planted.filter((item) => !recovered.includes(item));
  const overdue = open.length > maxOpenItems ? open : [];
  const base = input.planted.length ? Math.round((recovered.length / input.planted.length) * 100) : 100;
  const penalty = overdue.length * 10;
  const score = Math.max(0, Math.min(100, base - penalty));
  const revisionAdvice = open.map((item) => `补写或回收伏笔：${item}`);
  return {
    total: input.planted.length,
    recovered,
    open,
    overdue,
    score,
    revisionAdvice,
  };
}
