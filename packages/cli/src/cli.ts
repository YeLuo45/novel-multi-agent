import { runContinue, runNew } from './run.js';

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'new') {
    console.log(JSON.stringify(await runNew(args), null, 2));
    return;
  }
  if (command === 'continue') {
    console.log(JSON.stringify(await runContinue(args), null, 2));
    return;
  }
  throw new Error('Usage: novel-ma <new|continue> <theme-or-file> [--chapters N] [--words N]');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
