// Cross-platform opener for HTML surfaces (apps/web and apps/tui).
// Used by `npm run web` / `npm run tui` and by `novel-ma tui` / `novel-ma web` shortcuts.
//
// Usage: node scripts/open.mjs <path-to-html-file> [--print-url] [--no-launch]
//   <path-to-html-file>  absolute or relative path; resolved against cwd
//   --print-url          only print the resolved file:// URL, do not launch a browser
//   --no-launch          print the URL but do not spawn any process
//
// Resolution order (per platform):
//   - darwin:                  open <path>
//   - win32 (PowerShell):      Start-Process <path>
//   - win32 (cmd):             cmd /c start "" <path>
//   - linux WSL:
//       1) wslview <path>      (Microsoft WSL helper, hands off to Windows default browser)
//       2) explorer.exe <path> (fallback if wslview missing)
//   - linux with GUI browser:  sensible-browser / x-www-browser / firefox / chromium / google-chrome
//   - linux other:             xdg-open <path>
//
// On every path we also print the resolved file:// URL so the user can copy it
// to their host browser when the launcher fails (e.g. headless WSL, no GUI).

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) flags.add(arg);
    else positional.push(arg);
  }
  return { flags, positional };
}

const { flags, positional } = parseArgs(process.argv);
const target = positional[0];
if (!target) {
  console.error('Usage: node scripts/open.mjs <path-to-html-file> [--print-url] [--no-launch]');
  process.exit(1);
}

const absolute = path.resolve(target);
if (!existsSync(absolute) || !statSync(absolute).isFile()) {
  console.error(`[open] file not found: ${absolute}`);
  process.exit(1);
}

const url = `file://${absolute}`;
const platform = process.platform;
const isWSL = platform === 'linux' && Boolean(process.env.WSL_DISTRO_NAME);
const noLaunch = flags.has('--no-launch') || flags.has('--print-url');

console.log(`[open] platform=${platform}${isWSL ? ' (WSL)' : ''}`);
console.log(`[open] url: ${url}`);

if (noLaunch) {
  console.log('[open] --print-url set, skipping launcher.');
  process.exit(0);
}

// Probe helpers --------------------------------------------------------

function which(bin) {
  const probe = spawnSync('which', [bin], { stdio: 'ignore' });
  return probe.status === 0;
}

function tryRun(label, cmd, args) {
  console.log(`[open] try ${label}: ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'ignore' });
  if (result.error) {
    console.log(`[open] ${label} failed: ${result.error.message}`);
    return false;
  }
  if (result.status === 0) {
    console.log(`[open] ${label} launched OK.`);
    return true;
  }
  console.log(`[open] ${label} exited ${result.status}, trying next option.`);
  return false;
}

// Candidate resolution -------------------------------------------------

const candidates = [];

if (platform === 'darwin') {
  candidates.push({ label: 'macOS open', cmd: 'open', args: [absolute] });
} else if (platform === 'win32') {
  candidates.push({
    label: 'Windows Start-Process',
    cmd: 'powershell.exe',
    args: ['-NoProfile', '-Command', `Start-Process '${absolute.replaceAll("'", "''")}'`],
  });
  candidates.push({ label: 'cmd start', cmd: 'cmd', args: ['/c', 'start', '""', absolute] });
} else if (isWSL) {
  if (which('wslview')) {
    candidates.push({ label: 'wslview', cmd: 'wslview', args: [absolute] });
  }
  // Convert WSL path → Windows path so explorer.exe can actually find the file
  // (cmd.exe cannot handle the resulting UNC path; explorer.exe handles both).
  const wslPath = spawnSync('wslpath', ['-w', absolute], { encoding: 'utf8' });
  const winPath = wslPath.status === 0 ? wslPath.stdout.trim() : absolute;
  candidates.push({ label: 'explorer.exe (win path)', cmd: 'explorer.exe', args: [winPath] });
  candidates.push({ label: 'explorer.exe (wsl path)', cmd: 'explorer.exe', args: [absolute] });
} else {
  // Native Linux — try a known browser first, then xdg-open last
  for (const bin of ['sensible-browser', 'firefox', 'chromium', 'chromium-browser', 'google-chrome', 'microsoft-edge']) {
    if (which(bin)) candidates.push({ label: bin, cmd: bin, args: [absolute] });
  }
  candidates.push({ label: 'xdg-open', cmd: 'xdg-open', args: [absolute] });
}

for (const c of candidates) {
  if (tryRun(c.label, c.cmd, c.args)) {
    process.exit(0);
  }
}

console.error('[open] no launcher succeeded. Open this URL manually in your browser:');
console.error(`       ${url}`);
console.error('[open] tip: pass --print-url to skip launching entirely.');
process.exit(1);