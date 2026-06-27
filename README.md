# novel-multi-agent

中文说明见 `README.zh-CN.md`。

A Flue-inspired multi-agent fiction writing scaffold. It can create a story from a theme, continue from existing chapters, inspect exported writing artifacts, and catalog saved projects. The same capabilities are exposed through three surfaces — **CLI**, **Web Workbench**, and **TUI Interactive Shell** — kept in lock-step by a shared `Mode Parity` contract so nothing drifts between surfaces.

## Three Surfaces

| Surface | Entry | How to run | Role |
| --- | --- | --- | --- |
| CLI | `packages/cli/src/cli.ts` | `npm run cli -- <command> ...` · `npx novel-ma <command> ...` | Scriptable, CI-friendly, JSON output |
| Web Workbench | `apps/web/index.html` | `npm run web` *or* `npm run cli -- web` *or* `npm run cli -- --web` *or* `npx novel-ma web` (or open in browser, or GitHub Pages) | Visual, interactive, 4 themes |
| TUI Panel | `apps/tui/index.html` | `npm run tui` *or* `npm run cli -- tui` *or* `npm run cli -- --tui` *or* `npx novel-ma tui` (or open in browser, or GitHub Pages) | Terminal-style mirror of Web flows |

The shared contract lives in `packages/cli/src/mode-parity.ts` and exposes 14 commands × 3 surfaces. See the **Mode Parity** section below.

## Quick Start

```bash
npm install --include=dev --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
npm run bootstrap
```

`npm run verify:readme` re-executes every CLI command documented in this README against the local `.novel-ma/projects/` directory, so the commands listed below are guaranteed to work.

## Web Workbench (`apps/web/`)

The Web Workbench is a zero-dependency, single-file HTML app (~62 KB, no npm install for the browser side). It runs entirely in the browser — no server, no API calls, no external CDN. Open it locally or via GitHub Pages.

### How to open

```bash
# Recommended: npm script (cross-platform, uses scripts/open.mjs)
npm run web

# Equivalent CLI shortcuts — three ways to invoke the same binary:
npm run cli -- web           # via the npm script
novel-ma web                  # if ./node_modules/.bin is on PATH (npm workspaces puts it there)
npx novel-ma web              # via npx — works from any directory inside the repo
npm exec novel-ma web         # npm exec variant of the above

# Equivalent CLI shortcuts (flag form, same four invocation styles)
npm run cli -- --web
novel-ma --web
npx novel-ma --web
npm exec novel-ma --web

# The `web` / `tui` shortcut accepts opener flags that pass through to scripts/open.mjs:
novel-ma web --print-url      # only print the resolved file:// URL, do not launch
novel-ma web --no-launch      # alias of --print-url

# Manual — pick one
xdg-open apps/web/index.html          # Linux
open apps/web/index.html              # macOS
start apps/web/index.html             # Windows
file:///home/hermes/projects/novel-multi-agent/apps/web/index.html   # WSL

# GitHub Pages (after Pages is enabled in workflow mode)
https://<owner>.github.io/novel-multi-agent/apps/web/

# Legacy root index.html auto-redirects to apps/web/
```

All launcher forms go through `scripts/open.mjs`, which auto-detects the platform and falls through a candidate list:

| Platform | Resolution order |
| --- | --- |
| macOS | `open <path>` |
| Windows | `powershell Start-Process <path>` → `cmd /c start "" <path>` |
| Linux (WSL) | `wslview <path>` (if installed) → `explorer.exe <win-path>` → `explorer.exe <wsl-path>` |
| Linux (native) | `sensible-browser` → `firefox` → `chromium` → `google-chrome` → `microsoft-edge` → `xdg-open` |

When every candidate exits non-zero, the opener prints the resolved `file://` URL and `exit 1` so you can paste it into your host browser manually (common on headless WSL where neither `explorer.exe` nor `xdg-open` finds a default browser).

### Themes (Header switcher)

Four built-in themes, switchable from the Header toolbar without reload:

`light` · `dark` · `sepia` · `nord`

### Web sections (top → bottom)

1. **根据主题创建** — generate artifact draft from a theme
2. **根据已有篇章续写** — build continuation context from pasted chapters
3. **伏笔回收评分** — score foreshadowing (recovered / open / overdue)
4. **Artifact 导入与对比** — paste JSON, compare against current preview
5. **导入两个 Artifact 对比** — diff two artifacts, human-readable report
6. **导入项目库 Bundle** — merge an exported bundle into the local library
7. **Artifact 真实导入向导** — schema check + remediation steps
8. **续写质量面板** — character / foreshadowing / style sub-scores
9. **本地项目库清理面板** — dry-run prune manifest (no destructive default)
10. **Provider 实战面板** — mock / openai-compatible readiness diagnostic
11. **Flue Workflow 适配** — premise → bible → outline → draft → critique → revise → memory plan
12. **桌面壳准备度** — Electron / Desktop shell readiness
13. **长篇工程化控制台** — longform project OS overview
14. **V30 panels** — Artifact Import Studio, Longform Project OS, Quality Repair Loop, Provider Live Runtime, Flue Workflow Runner, Desktop File Bridge, Collaboration Pack, Narrative Analytics, Publishing Pipeline, Agent Studio
15. **CLI/Web/TUI 功能对齐** — Mode Parity matrix (also surfaces `novel-ma mode-parity` / `novel-ma tui` action references)
16. **V32 Web-first Studio Hub / V32 TUI Interactive Shell / V33 Web Product Ops / V34 Product Closure Hub / V35-V40 Execution Suite** — closure & execution panels
17. **TUI 模式预览** — inline link to `apps/tui/`
18. **本地项目库 / 项目目录索引 / Artifact 预览输出** — saved-artifact list, latest/history index, JSON output + download

### Web Toolbar (Header)

- **主题切换** `<select>` — light / dark / sepia / nord
- **保存到本地项目库** — persist current preview to the in-browser library (localStorage)
- **导出项目库** — bundle the library to a downloadable JSON

### Web ↔ CLI equivalents

Every Web panel maps to a CLI command. The mapping is the source of truth for the Mode Parity matrix:

| Web panel | CLI command |
| --- | --- |
| 根据主题创建 | `novel-ma new "<theme>" --chapters N --words N` |
| 根据已有篇章续写 / Quality Repair Loop | `novel-ma continue <file> --words N` (add `--quality-artifact <artifact>` to gate on quality) |
| Provider 实战面板 / Provider Live Runtime | `novel-ma provider-doctor` · `novel-ma provider-smoke "<prompt>"` |
| Artifact 真实导入向导 | `novel-ma artifact-inspect <artifact.json>` |
| 项目目录索引 / 最近项目 | `novel-ma artifact-catalog .novel-ma/projects [--enrich]` · `novel-ma artifact-latest .novel-ma/projects` |
| 本地项目库 / Narrative Analytics | `novel-ma artifact-search .novel-ma/projects <query> [--latest-only] [--mode theme|continuation]` |
| Artifact Import Studio | `novel-ma artifact-normalize <artifact.json>` |
| Publishing Pipeline | `novel-ma artifact-export <artifact.json>` |
| Longform Project OS / 章节版本树 | `novel-ma artifact-version-tree <artifact.json>` |
| 本地项目库清理面板 | `novel-ma artifact-prune .novel-ma/projects --keep N [--apply]` (default: dry-run) |
| 导入两个 Artifact 对比 | `novel-ma artifact-diff <left> <right> --format text` |
| 续写质量面板 / Quality Repair Loop | `novel-ma continuation-check <artifact.json> <text>` |

## TUI Interactive Shell (`apps/tui/`)

A static, browser-rendered terminal panel that mirrors the Web-first Studio Hub. Useful for sharing terminal-style screenshots and as a printable cheatsheet for the 14 CLI commands.

### How to open

```bash
# Recommended: npm script (cross-platform, uses scripts/open.mjs)
npm run tui

# Equivalent CLI shortcuts — three ways to invoke the same binary:
npm run cli -- tui           # via the npm script
novel-ma tui                  # if ./node_modules/.bin is on PATH (npm workspaces puts it there)
npx novel-ma tui              # via npx — works from any directory inside the repo
npm exec novel-ma tui         # npm exec variant of the above

# Equivalent CLI shortcuts (flag form, same four invocation styles)
npm run cli -- --tui
novel-ma --tui
npx novel-ma --tui
npm exec novel-ma --tui

# The `tui` / `web` shortcut accepts opener flags that pass through to scripts/open.mjs:
novel-ma tui --print-url      # only print the resolved file:// URL, do not launch
novel-ma tui --no-launch      # alias of --print-url
```

All launcher forms go through `scripts/open.mjs`; see the Web Workbench section for the platform-detection matrix and the headless-WSL fallback behavior.

### TUI panels

- **Interactive Shell · Web-first Studio Mirror** — selectable actions (Dashboard / Library / Continue / Provider / Analytics / Shell / Contract) with key hints (`↑/↓` select · `Enter` generate command · `w` open Web · `q` quit) and pre-rendered command examples.
- **Mode Parity · CLI/Web/TUI 功能对齐** — the 14-command × 3-surface matrix, rendered as a checklist.

### TUI command cheatsheet (also shown in `apps/tui/`)

```text
novel-ma artifact-latest .novel-ma/projects
novel-ma artifact-catalog .novel-ma/projects --enrich
novel-ma continue <file> --quality-artifact <artifact>
novel-ma provider-doctor && novel-ma provider-smoke <prompt>
novel-ma artifact-search .novel-ma/projects <query>
novel-ma tui                  # opens the Interactive Shell panel via scripts/open.mjs
novel-ma --tui                # flag-form alias for `novel-ma tui`
novel-ma web                  # opens the Web Workbench via scripts/open.mjs
novel-ma --web                # flag-form alias for `novel-ma web`
novel-ma mode-parity          # prints the CLI/Web/TUI alignment matrix (Mode Parity contract)
```

The `web` / `tui` / `--web` / `--tui` shortcuts accept `--print-url` / `--no-launch` flags that pass through to `scripts/open.mjs`. On any platform, when every browser launcher exits non-zero, the opener prints the resolved `file://` URL and `exit 1` so you can paste it into your host browser manually.

## Mode Parity (CLI / Web / TUI)

The same 14 capabilities are exposed across all three surfaces. The matrix is generated by `packages/cli/src/mode-parity.ts` and is the authoritative check before any surface change ships.

```text
[x] new                    web:根据主题创建 / V30 Longform Project OS            tui:Create Novel
[x] continue               web:根据已有篇章续写 / Quality Repair Loop            tui:Continue Novel
[x] provider-smoke         web:Provider 实战面板 / Provider Live Runtime         tui:Provider Smoke
[x] provider-doctor        web:Provider 实战面板                                 tui:Provider Doctor
[x] artifact-inspect       web:Artifact 真实导入向导                            tui:Artifact Inspect
[x] artifact-catalog       web:项目目录索引 / 最近项目                          tui:Artifact Catalog
[x] artifact-latest        web:项目目录索引 / 最近项目                          tui:Artifact Latest
[x] artifact-search        web:本地项目库 / Narrative Analytics                 tui:Artifact Search
[x] artifact-normalize     web:Artifact Import Studio                           tui:Artifact Normalize
[x] artifact-export        web:Publishing Pipeline                              tui:Artifact Export
[x] artifact-version-tree  web:Longform Project OS / 章节版本树                  tui:Version Tree
[x] artifact-prune         web:本地项目库清理面板                                tui:Artifact Prune
[x] artifact-diff          web:导入两个 Artifact 对比                            tui:Artifact Diff
[x] continuation-check     web:续写质量面板 / Quality Repair Loop               tui:Continuation Check
```

## CLI

```bash
# Create a short story from a theme
npm run cli -- new "月球图书馆的守夜人与失忆AI" --chapters 3 --words 900

# Continue from existing chapters (auto quality gate with --quality-artifact)
npm run cli -- continue examples/existing-chapters.md --words 900

# Provider diagnosis (safe — no Authorization header in output)
npm run cli -- provider-doctor
npm run cli -- provider-smoke "写一段章节开头"

# Inspect / catalog / search exported artifacts
npm run cli -- artifact-inspect .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-catalog .novel-ma/projects
npm run cli -- artifact-catalog .novel-ma/projects --enrich
npm run cli -- artifact-latest .novel-ma/projects
npm run cli -- artifact-search .novel-ma/projects 月球
npm run cli -- artifact-search .novel-ma/projects 月球 --latest-only
npm run cli -- artifact-search .novel-ma/projects 月球 --mode theme

# Versioning, diff, prune (prune is dry-run by default)
npm run cli -- artifact-version-tree .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-diff .novel-ma/projects/<left>/artifact.json .novel-ma/projects/<right>/artifact.json --format text
npm run cli -- artifact-prune .novel-ma/projects --keep 1

# Schema normalization / export
npm run cli -- artifact-normalize .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-export   .novel-ma/projects/<project-id>/artifact.json

# Continuation quality gate (per-text scoring against characters/foreshadowing/style)
npm run cli -- continuation-check .novel-ma/projects/<project-id>/artifact.json "<chapter text>"
```

Output is written to `.novel-ma/projects/<project-id>/artifact.json` by default.

## Project Layout

```text
packages/core    # State machines, types, storage, context/memory algorithms
packages/agents  # Planner / Worldbuilder / Writer / Critic / Memory agents
packages/cli     # CLI entry + shared Mode Parity / Web Studio surface
apps/web/        # Zero-dependency Web Workbench (single-file HTML)
apps/tui/        # Static TUI Interactive Shell (single-file HTML)
.flue/           # Flue-style agent/workflow blueprints
examples/        # Sample inputs (e.g. examples/existing-chapters.md)
scripts/         # Acceptance + opener scripts (verify-readme, incremental-coverage, open)
index.html       # Legacy Pages root that redirects to apps/web/
```

## GitHub Pages

`.github/workflows/pages.yml` deploys the zero-dependency Web Workbench from `apps/web/` plus the TUI panel from `apps/tui/`. Enable Pages in **workflow mode**, then push to `main`/`master` or run the workflow manually.

- Online: `https://<owner>.github.io/novel-multi-agent/apps/web/`
- TUI mirror: `https://<owner>.github.io/novel-multi-agent/apps/tui/`
- Legacy root (`index.html`) auto-redirects to `apps/web/`.

## CI

`.github/workflows/ci.yml` runs `npm ci → check → test → build → coverage:incremental → verify:readme` on every push and PR to `main`. `verify:readme` re-executes every CLI command listed in this README, so a documentation drift fails the build.