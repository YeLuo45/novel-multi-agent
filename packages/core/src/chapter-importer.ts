export interface ImportedChapter {
  number: number;
  title: string;
  body: string;
}

const CHAPTER_RE = /(?:^|\n)\s*#?\s*第?\s*([一二三四五六七八九十百千万\d]+)\s*章\s*([^\n]*)\n/g;

function chineseNumberToInt(value: string): number {
  const direct = Number(value);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const map: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  if (value === '十') return 10;
  if (value.includes('十')) {
    const [tens, ones] = value.split('十');
    return (tens ? map[tens] ?? 1 : 1) * 10 + (ones ? map[ones] ?? 0 : 0);
  }
  return map[value] ?? 1;
}

export function parseImportedChapters(text: string): ImportedChapter[] {
  const source = text.trim();
  if (!source) return [];
  const matches = [...source.matchAll(CHAPTER_RE)];
  if (!matches.length) return [{ number: 1, title: '未命名章节', body: source }];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      number: chineseNumberToInt(match[1] ?? String(index + 1)),
      title: (match[2] ?? '').trim() || '未命名章节',
      body: source.slice(start, end).trim(),
    };
  });
}
