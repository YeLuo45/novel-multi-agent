import { execFileSync } from 'node:child_process';

const commands = [
  ['npm', ['install', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund']],
  ['npm', ['run', 'check']],
  ['npm', ['test']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'coverage:incremental']],
  ['npm', ['run', 'bootstrap']],
  ['npm', ['run', 'cli', '--', 'new', '月球图书馆的守夜人与失忆AI', '--chapters', '3', '--words', '900']],
  ['npm', ['run', 'cli', '--', 'continue', 'examples/existing-chapters.md', '--words', '900']],
  ['npm', ['run', 'cli', '--', 'provider-doctor']],
  ['npm', ['run', 'cli', '--', 'artifact-catalog', '.novel-ma/projects']],
  ['npm', ['run', 'cli', '--', 'artifact-catalog', '.novel-ma/projects', '--enrich']],
  ['npm', ['run', 'cli', '--', 'artifact-latest', '.novel-ma/projects']],
  ['npm', ['run', 'cli', '--', 'artifact-search', '.novel-ma/projects', '月球']],
  ['npm', ['run', 'cli', '--', 'artifact-search', '.novel-ma/projects', '月球', '--latest-only']],
  ['npm', ['run', 'cli', '--', 'artifact-search', '.novel-ma/projects', '月球', '--mode', 'theme']],
  ['npm', ['run', 'cli', '--', 'artifact-prune', '.novel-ma/projects', '--keep', '1']],
];

function findArtifactPaths() {
  const raw = execFileSync('npm', ['run', 'cli', '--', 'artifact-latest', '.novel-ma/projects'], { encoding: 'utf8' });
  const data = JSON.parse(raw.slice(raw.indexOf('{')));
  return data.items.map((item) => item.sourcePath).filter(Boolean).slice(0, 2);
}

let failed = 0;
for (const [cmd, args] of commands) {
  const rendered = `${cmd} ${args.join(' ')}`;
  console.log(`$ ${rendered}`);
  try {
    execFileSync(cmd, args, { stdio: 'inherit' });
  } catch (error) {
    failed += 1;
    console.error(`[failed] ${rendered}`);
  }
}

try {
  const [left, right] = findArtifactPaths();
  if (left && right) {
    const args = ['run', 'cli', '--', 'artifact-diff', left, right, '--format', 'text'];
    console.log(`$ npm ${args.join(' ')}`);
    execFileSync('npm', args, { stdio: 'inherit' });
  }
} catch (error) {
  failed += 1;
  console.error('[failed] dynamic artifact-diff --format text');
}

console.log(`verify-readme: ${failed} failed`);
if (failed > 0) process.exit(1);
