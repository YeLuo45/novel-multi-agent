#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runArtifactCatalog,
  runArtifactDiff,
  runArtifactInspect,
  runArtifactLatest,
  runArtifactNormalize,
  runArtifactPrune,
  runArtifactVersionTree,
  runArtifactExport,
  runArtifactSearch,
  runContinuationCheck,
  runContinue,
  runNew,
  runProviderDoctor,
  runProviderSmoke,
} from './run.js';

function findWorkspaceRoot(start: string): string {
  let current = start;
  while (true) {
    const packagePath = path.join(current, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { workspaces?: unknown };
      if (packageJson.workspaces) return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}

interface LauncherOptions {
  readonly subcommand: 'web' | 'tui';
  readonly flag: '--web' | '--tui';
  readonly relativePath: 'apps/web/index.html' | 'apps/tui/index.html';
}

const LAUNCHERS: Record<string, LauncherOptions> = {
  web: { subcommand: 'web', flag: '--web', relativePath: 'apps/web/index.html' },
  tui: { subcommand: 'tui', flag: '--tui', relativePath: 'apps/tui/index.html' },
  '--web': { subcommand: 'web', flag: '--web', relativePath: 'apps/web/index.html' },
  '--tui': { subcommand: 'tui', flag: '--tui', relativePath: 'apps/tui/index.html' },
};

function launchSurface(options: LauncherOptions, forwardedArgs: readonly string[]): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = findWorkspaceRoot(here);
  const opener = path.join(root, 'scripts', 'open.mjs');
  const target = path.join(root, options.relativePath);
  if (!existsSync(opener)) {
    throw new Error(`opener script missing: ${opener}`);
  }
  if (!existsSync(target)) {
    throw new Error(`surface file missing: ${target}`);
  }
  console.log(`[launch] ${options.flag} → ${target}`);
  const child = spawn(process.execPath, [opener, target, ...forwardedArgs], { stdio: 'inherit' });
  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  const launcher = command ? LAUNCHERS[command] : undefined;
  if (launcher) {
    // Allow only forwardable opener flags to be appended after web/tui/--web/--tui.
    const openerFlags = new Set(['--print-url', '--no-launch']);
    const unknownFlags = args.filter((arg) => arg.startsWith('--') && !openerFlags.has(arg));
    if (unknownFlags.length > 0) {
      throw new Error(`unknown flag(s) for ${command}: ${unknownFlags.join(', ')}`);
    }
    launchSurface(launcher, args);
    return;
  }
  if (command === 'new') {
    console.log(JSON.stringify(await runNew(args), null, 2));
    return;
  }
  if (command === 'continue') {
    console.log(JSON.stringify(await runContinue(args), null, 2));
    return;
  }
  if (command === 'provider-smoke') {
    console.log(JSON.stringify(await runProviderSmoke(args), null, 2));
    return;
  }
  if (command === 'provider-doctor') {
    console.log(JSON.stringify(runProviderDoctor(), null, 2));
    return;
  }
  if (command === 'artifact-inspect') {
    console.log(JSON.stringify(await runArtifactInspect(args), null, 2));
    return;
  }
  if (command === 'artifact-catalog') {
    console.log(JSON.stringify(await runArtifactCatalog(args), null, 2));
    return;
  }
  if (command === 'artifact-latest') {
    console.log(JSON.stringify(await runArtifactLatest(args), null, 2));
    return;
  }
  if (command === 'artifact-search') {
    console.log(JSON.stringify(await runArtifactSearch(args), null, 2));
    return;
  }
  if (command === 'artifact-normalize') {
    console.log(JSON.stringify(await runArtifactNormalize(args), null, 2));
    return;
  }
  if (command === 'artifact-export') {
    console.log(JSON.stringify(await runArtifactExport(args), null, 2));
    return;
  }
  if (command === 'artifact-version-tree') {
    console.log(JSON.stringify(await runArtifactVersionTree(args), null, 2));
    return;
  }
  if (command === 'artifact-prune') {
    console.log(JSON.stringify(await runArtifactPrune(args), null, 2));
    return;
  }
  if (command === 'artifact-diff') {
    const result = await runArtifactDiff(args);
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    return;
  }
  if (command === 'continuation-check') {
    console.log(JSON.stringify(await runContinuationCheck(args), null, 2));
    return;
  }
  throw new Error('Usage: novel-ma <new|continue|provider-smoke|provider-doctor|artifact-inspect|artifact-catalog|artifact-latest|artifact-search|artifact-normalize|artifact-export|artifact-version-tree|artifact-prune|artifact-diff|continuation-check> <theme-or-file-or-prompt> [--chapters N] [--words N] | novel-ma <web|tui|--web|--tui>');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
