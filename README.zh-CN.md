# novel-multi-agent

`novel-multi-agent` 是一个基于 Flue 思想设计的多智能体小说创作系统。它支持两类核心任务：

1. 根据用户主题从零生成小说设定、章节目录和章节正文。
2. 根据已有小说篇章续写下一章，并保持人物、伏笔、世界观和文风一致。

## 参考来源

- `/home/hermes/projects/flue`：采用 agent/workflow 分层、可部署工作流、会话式 harness 的思想。
- `/home/hermes/opensource/AI_NovelGenerator`：采用设定工坊、分块章节目录、最近章节摘要、定稿后更新状态的写作链路。
- `/home/hermes/opensource/NovelForge`：采用卡片化创作、上下文注入、知识图谱/记忆层、工作流 Agent 的产品思想。

## 架构

```text
packages/core    # 状态机、类型、存储、上下文/记忆算法
packages/agents  # 规划/设定/大纲/写作/审校/记忆等智能体
packages/cli     # 本地命令行入口 + Mode Parity / Web Studio 共享契约
apps/web/        # 零依赖 Web 工作台（单文件 HTML，约 62 KB）
apps/tui/        # 静态 TUI 交互式面板（单文件 HTML）
.flue/           # Flue-style agent/workflow 蓝图
examples/        # 输入样例
scripts/         # 验收脚本 + 跨平台打开器 (verify-readme / incremental-coverage / open)
index.html       # 兼容旧 Pages 的根入口，跳转到 apps/web/
```

## 三大入口（CLI / Web / TUI）

同一份能力通过三个入口暴露，由 `packages/cli/src/mode-parity.ts` 中的 Mode Parity 契约统一，避免后续漂移。

| 入口 | 位置 | 启动方式 | 角色 |
| --- | --- | --- | --- |
| CLI | `packages/cli/src/cli.ts` | `npm run cli -- <command> ...` · `npx novel-ma <command> ...` | 脚本化、CI 友好、JSON 输出 |
| Web 工作台 | `apps/web/index.html` | `npm run web` *或* `npm run cli -- web` *或* `npm run cli -- --web` *或* `npx novel-ma web`（或浏览器直接打开 / GitHub Pages） | 可视化、交互、4 套主题 |
| TUI 面板 | `apps/tui/index.html` | `npm run tui` *或* `npm run cli -- tui` *或* `npm run cli -- --tui` *或* `npx novel-ma tui`（或浏览器直接打开 / GitHub Pages） | 终端风格，镜像 Web 主流程 |

## 快速开始

```bash
npm install --include=dev --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
npm run bootstrap
```

`npm run verify:readme` 会按本文档列出的命令逐条重新执行，确保 README 与本地 `.novel-ma/projects/` 真实状态一致。

## V35-V40 新增能力

- V35 Verify Pages Script：生成 `npm run verify:pages` 对应的 root、Web、TUI marker 检查脚本模型。
- V36 Provider Live Smoke Executor：把 provider smoke 从请求计划升级为 env-live-or-mock 执行器，脱敏 Authorization 并保留 mock fallback。
- V37 Real Artifact Workspace Loader：从真实 artifact JSON 路径列表构建 workspace，坏文件进入 issues，不阻断有效项目。
- V38 Multi-Agent Pipeline Runner：把 planner/writer/editor/continuity/test 转成可执行 agent-runner 命令和产物列表。
- V39 Longform Risk Scoring：为长篇 Project OS 增加伏笔逾期、开放循环、风格漂移等风险评分。
- V40 Web Editing Persistence：编辑结果生成 persist-revision 计划、diff、rollback token 和 searchable catalog update。

## V34 新增能力

- Product Closure Hub：把后续 1-6 方向收束为首页可见总控台，统一展示真数据写作、持久化、Provider、Pages、Project OS、多 Agent 流水线状态。
- Workspace Persistence Plan：明确 localStorage 项目库的 import/export/merge/cleanup 动作和 refresh-safe、bad-entry-isolated、schema-normalized 保障。
- Provider Live Smoke Result：在请求计划之外提供 smoke 结果模型，脱敏 Authorization 并记录 pass/fail diagnostics。
- Pages Acceptance Checks：把 root、`/apps/web/`、`/apps/tui/` marker 检查建模为可执行验收结果。
- Agent Collaboration Pipeline：planner → writer → editor → continuity → test 五角色流水线，最终 artifact 标记 accepted。
- Longform Project OS 聚合：把分卷、章节版本树、人物弧、伏笔台账、风格圣经纳入 closure hub。

## V33 新增能力

- Web 真数据项目浏览器：按 `.novel-ma/projects/<id>/artifact.json` 组织 artifact 路径、有效项目和坏文件 issues，并给出 inspect/catalog/search 命令。
- Web Artifact Editor：把章节标题、人物、伏笔、风格做成可编辑模型，编辑后生成 revision history。
- 质量修复 patch：根据未回收伏笔和当前正文生成 rewrite patch、missing 列表和 revision note。
- TUI 命令路由：从 shared surface contract 生成可执行命令，`continue` 自动带 `--quality-artifact`。
- Provider live request：Web 侧生成 OpenAI-compatible chat completions 请求计划，并脱敏 Authorization。
- GitHub Pages 验收计划：生成 root、`/apps/web/`、`/apps/tui/` 的线上检查 URL 和 marker。

## V32 新增能力

- Web-first Studio Hub：把 Dashboard、Artifact Library Pro、Continuation Studio、Provider Console、Narrative Analytics 收敛到首页主入口。
- Web Project Dashboard：展示项目数、最近项目、质量分、伏笔健康度和继续写作/质量修复/版本对比快捷动作。
- Artifact Library Pro：支持模式过滤、语义搜索索引、标签过滤和 diff picker 候选集。
- Continuation Studio：将已有章节、记忆、伏笔、风格、续写草稿和 repair suggestion 拆成可读面板。
- TUI Interactive Shell：`apps/tui/index.html` 从静态对齐表升级为交互式 shell 预览，命令菜单镜像 Web 主流程。
- Shared Surface Contract：Web/TUI 共享 action contract，避免 CLI/Web/TUI 后续能力漂移。

## V31 新增能力

- CLI/Web/TUI 功能对齐矩阵：14 个 CLI 命令统一映射到 Web 工作台和 TUI 模式，避免多入口漂移。
- Web 模式新增“CLI/Web/TUI 功能对齐”和“TUI 模式预览”入口，可直接生成对齐矩阵和 TUI 面板文本。
- TUI 模式新增 `apps/tui/index.html` 静态终端面板，覆盖 new、continue、provider、artifact、continuation-check 等 CLI 能力。
- `packages/cli/src/mode-parity.ts` 提供共享矩阵、Web 面板渲染和 TUI 面板渲染，CLI/TUI/Web 后续都可复用。

## V30 新增能力

- Artifact Import Studio：批量导入前输出 schema diff、导入预览和 rollback token。
- Longform Project OS：把分卷、章节、人物弧线、伏笔台账和风格圣经组织为统一项目 OS。
- Quality Repair Loop：从续写质量评分生成 rewrite suggestion、repair paragraph 和 revision note。
- Provider Live Runtime：支持 mock/live 模式、openai-compatible endpoint 诊断、token 成本估算和 fallback。
- Flue Workflow Runner：把 premise→bible→outline→draft→critique→revise→memory 计划升级为可回放 timeline。
- Desktop File Bridge：模拟桌面壳本地目录、artifact 文件树、离线缓存和导入导出权限。
- Collaboration Pack：生成协作 bundle、review notes、冲突列表和合并策略。
- Narrative Analytics：统计人物出场、伏笔周期、章节节奏、文风漂移和可视化诊断项。
- Publishing Pipeline：生成 Markdown/EPUB 文件清单、metadata manifest 和发布前检查。
- Agent Studio：展示 planner/worldbuilder/writer/critic/memory agent 的输入输出 trace。

## V29 新增能力

- Artifact 真实导入向导：校验 JSON/schema，输出导入步骤和修复建议。
- 续写质量面板：在 Web 主界面展示 characters/foreshadowing/style 子分数。
- 本地项目库清理面板：按 latest/history 生成 dry-run prune manifest，不直接删除。
- Provider 实战面板：显示 mock/openai-compatible readiness、模型和脱敏诊断。
- Flue Workflow 适配：输出 premise→bible→outline→draft→critique→revise→memory 节点计划。
- 桌面壳准备度：检查 local-file-open、localStorage-library、json-download、offline-workbench。
- 长篇工程化控制台：暴露分卷规划、章节版本树、人物弧线、伏笔台账和风格圣经入口。

## V22-V28 新增能力

- Web 首页 Latest Catalog：项目目录索引主区域展示“最近项目 / latest / history”。
- Artifact Prune：默认 dry-run，`--apply` 才会删除重复历史，并先写 `prune-manifest-*.json`。
- Continue Quality Gate：`continue --quality-artifact <artifact.json>` 在续写前检查角色、伏笔和文风；失败需 `--force`。
- Diff 可读报告：`artifact-diff --format text` 输出人工审阅友好的字段变化列表。
- Search 高级检索：`artifact-search --latest-only`、`--mode theme|continuation` 支持最新视图与模式过滤。
- Web 双 Artifact 对比：首页可粘贴两个 artifact，输出 diff 和可读 report。
- Schema Guard：`artifact-export`/normalize 对 `schemaVersion: 2` 输入保持幂等，旧 NovelProject 自动归一化。

## V8-V14 新增能力

- Latest Catalog：按 `title + mode` 聚合重复项目，保留 latest/history。
- Schema Normalization：输出 `schemaVersion: 2` 的归一化 artifact snapshot。
- Artifact Diff CLI：比较两个 artifact 的标题、模式、章节和伏笔评分差异。
- Local Search：按标题、角色、伏笔、章节摘要搜索本地项目目录。
- Continuation Quality Gate：检查续写文本是否使用角色、伏笔和文风指纹。
- Web Catalog Helpers：Web 工作台暴露 latest/search/normalize/quality 纯函数。

## V7 新增能力

- Artifact Catalog：扫描 `.novel-ma/projects/**/artifact.json` 并生成稳定排序的项目摘要列表。
- 坏文件隔离：单个 artifact 解析失败会进入 `issues`，不影响其他项目索引。
- CLI 项目目录：`npm run cli -- artifact-catalog .novel-ma/projects` 输出 `{ items, issues }`。

## V6 新增能力

- 共享 Artifact Toolkit：`packages/core` 提供 artifact 导入校验、摘要、对比、记忆图谱和内存项目库 contract。
- CLI Artifact 检查：`npm run cli -- artifact-inspect <artifact.json>` 输出 summary、memory graph 计数和 validation。
- Web/CLI 语义对齐：核心 artifact 操作可复用，减少内联脚本和 CLI 行为漂移。

## V5 新增能力

- Web 本地项目库：artifact 可保存、打开、删除、导出。
- Artifact 导入与对比：支持粘贴 JSON 并比较标题、模式、章节、伏笔评分差异。
- 章节编辑续写闭环：在 Web 里编辑章节后直接生成下一章 artifact。
- 真实 LLM CLI 适配：`npm run cli -- provider-smoke "提示词"`，无 key 自动 mock fallback；`npm run cli -- provider-doctor` 输出脱敏配置诊断。
- 章节版本树：`artifact-version-tree` 可把 outline/import/revision 组织成父子版本链，便于追踪多轮改稿。
- 记忆卡片与关系图：artifact 内包含角色/伏笔/文风 graph。
- 主题切换：light/dark/sepia/nord 四套主题，首页主区域可见。
- GitHub Pages：`.github/workflows/pages.yml` 可部署 `apps/web` 静态工作台；根 `index.html` 兼容 legacy Pages，并跳转到 `apps/web/`。

## V4 新增能力

- Web 本地 Artifact 工作台：`apps/web/index.html` 可直接在浏览器打开。
- 支持根据主题生成标准 artifact 预览，并下载 JSON。
- 支持粘贴已有章节生成续写 artifact，自动识别中文章号。
- 支持伏笔清单 recovered/open/overdue/missing 评分并写入预览。

## V3 新增能力

- 真实 LLM Provider 适配：OpenAI-compatible provider + deterministic mock fallback。
- 结构化章节导入：Markdown/纯文本章节解析为标准 chapter records。
- 伏笔回收评分：输出 recovered/open/overdue/score/revisionAdvice。
- Web 工作台：`apps/web/index.html` 提供主题创建、篇章续写、伏笔评分本地预览。
- GitHub Actions CI：`.github/workflows/ci.yml` 自动运行 install/check/test/build/coverage/readme verification。

## V2 新增能力

- 续写上下文构建：融合最近章节摘要、角色状态、伏笔记忆和风格指纹。
- 续写草稿约束：Writer Agent 在续写模式下显式使用 `续写目标 / 前文摘要 / 记忆约束 / 风格指纹`。
- 验收门禁：新增 `coverage:incremental` 与 `verify:readme`，用于验证增量覆盖率和 README 命令可交付。

## Web 工作台（`apps/web/`）

零依赖、单文件 HTML（约 62 KB）的浏览器端工作台，不发起网络请求、不依赖 CDN、不需要后端服务。本地直接打开或通过 GitHub Pages 访问。

### 打开方式

```bash
# 推荐：npm 脚本（跨平台，走 scripts/open.mjs）
npm run web

# 等价 CLI 快捷方式 — 同一份二进制有四种调用形式：
npm run cli -- web           # 经 npm 脚本调用
novel-ma web                  # 当 ./node_modules/.bin 在 PATH 中（npm workspaces 自动创建软链）
npx novel-ma web              # 经 npx 调用 — 在仓库内任意目录都可用
npm exec novel-ma web         # npm exec 的等价形式

# 等价 CLI 快捷方式（flag 形式，同样四种调用形式）
npm run cli -- --web
novel-ma --web
npx novel-ma --web
npm exec novel-ma --web

# `web` / `tui` 快捷方式支持透传给 scripts/open.mjs 的 opener flag：
novel-ma web --print-url      # 只打印解析后的 file:// URL，不实际启动浏览器
novel-ma web --no-launch      # --print-url 的别名
```

所有启动方式都走 `scripts/open.mjs`，它会按候选列表逐个尝试：

| 平台 | 候选顺序 |
| --- | --- |
| macOS | `open <path>` |
| Windows | `powershell Start-Process <path>` → `cmd /c start "" <path>` |
| Linux (WSL) | `wslview <path>`（如已安装）→ `explorer.exe <win-path>` → `explorer.exe <wsl-path>` |
| Linux（原生） | `sensible-browser` → `firefox` → `chromium` → `google-chrome` → `microsoft-edge` → `xdg-open` |

当所有候选都返回非零退出码时，opener 打印解析后的 `file://` URL 并 `exit 1`，你可以把它粘贴到宿主机浏览器（headless WSL 上常见，`explorer.exe` 与 `xdg-open` 都找不到默认浏览器）。

### 主题切换（Header）

首页工具栏暴露 4 套主题，无需刷新即可切换：

`light` · `dark` · `sepia` · `nord`

### Web 面板（自上而下）

1. **根据主题创建** — 输入主题，生成 artifact 草案。
2. **根据已有篇章续写** — 粘贴章节，构建续写上下文。
3. **伏笔回收评分** — 对伏笔清单输出 recovered/open/overdue/score。
4. **Artifact 导入与对比** — 粘贴 JSON 与当前预览对比。
5. **导入两个 Artifact 对比** — 双 artifact 可读 Diff。
6. **导入项目库 Bundle** — 合并导出 bundle 到 localStorage 项目库。
7. **Artifact 真实导入向导** — schema 校验 + 修复建议。
8. **续写质量面板** — 角色 / 伏笔 / 文风子分数。
9. **本地项目库清理面板** — dry-run prune manifest（默认不删除）。
10. **Provider 实战面板** — mock / openai-compatible readiness 诊断。
11. **Flue Workflow 适配** — premise → bible → outline → draft → critique → revise → memory 计划。
12. **桌面壳准备度** — Electron / Desktop shell 检查。
13. **长篇工程化控制台** — Longform Project OS 概览。
14. **V30 panels** — Artifact Import Studio、Longform Project OS、Quality Repair Loop、Provider Live Runtime、Flue Workflow Runner、Desktop File Bridge、Collaboration Pack、Narrative Analytics、Publishing Pipeline、Agent Studio。
15. **CLI/Web/TUI 功能对齐** — Mode Parity 矩阵（同时显示 `novel-ma mode-parity` / `novel-ma tui` 引用）。
16. **V32 Web-first Studio Hub / V32 TUI Interactive Shell / V33 Web Product Ops / V34 Product Closure Hub / V35-V40 Execution Suite** — 总控 / 闭环面板。
17. **TUI 模式预览** — 内嵌链接到 `apps/tui/`。
18. **本地项目库 / 项目目录索引 / Artifact 预览输出** — 保存列表、latest/history 索引、JSON 预览与下载。

### Web Header 工具栏

- **主题切换** `<select>` — light / dark / sepia / nord。
- **保存到本地项目库** — 把当前预览写入 localStorage。
- **导出项目库** — 把项目库打包为可下载 JSON。

### Web ↔ CLI 对照表

每个 Web 面板都映射到 CLI 命令，Mode Parity 矩阵是这套映射的唯一真源：

| Web 面板 | CLI 命令 |
| --- | --- |
| 根据主题创建 | `novel-ma new "<theme>" --chapters N --words N` |
| 根据已有篇章续写 / Quality Repair Loop | `novel-ma continue <file> --words N`（加 `--quality-artifact <artifact>` 触发质量门禁） |
| Provider 实战面板 / Provider Live Runtime | `novel-ma provider-doctor` · `novel-ma provider-smoke "<prompt>"` |
| Artifact 真实导入向导 | `novel-ma artifact-inspect <artifact.json>` |
| 项目目录索引 / 最近项目 | `novel-ma artifact-catalog .novel-ma/projects [--enrich]` · `novel-ma artifact-latest .novel-ma/projects` |
| 本地项目库 / Narrative Analytics | `novel-ma artifact-search .novel-ma/projects <query> [--latest-only] [--mode theme\|continuation]` |
| Artifact Import Studio | `novel-ma artifact-normalize <artifact.json>` |
| Publishing Pipeline | `novel-ma artifact-export <artifact.json>` |
| Longform Project OS / 章节版本树 | `novel-ma artifact-version-tree <artifact.json>` |
| 本地项目库清理面板 | `novel-ma artifact-prune .novel-ma/projects --keep N [--apply]`（默认 dry-run） |
| 导入两个 Artifact 对比 | `novel-ma artifact-diff <left> <right> --format text` |
| 续写质量面板 / Quality Repair Loop | `novel-ma continuation-check <artifact.json> <text>` |

## TUI 交互式面板（`apps/tui/`）

浏览器渲染的静态终端面板，镜像 Web-first Studio Hub，适合截图分享、打印成 cheat sheet，或作为 14 个 CLI 命令的速查表。

### 打开方式

```bash
# 推荐：npm 脚本（跨平台，走 scripts/open.mjs）
npm run tui

# 等价 CLI 快捷方式 — 同一份二进制有四种调用形式：
npm run cli -- tui           # 经 npm 脚本调用
novel-ma tui                  # 当 ./node_modules/.bin 在 PATH 中（npm workspaces 自动创建软链）
npx novel-ma tui              # 经 npx 调用 — 在仓库内任意目录都可用
npm exec novel-ma tui         # npm exec 的等价形式

# 等价 CLI 快捷方式（flag 形式，同样四种调用形式）
npm run cli -- --tui
novel-ma --tui
npx novel-ma --tui
npm exec novel-ma --tui

# `tui` / `web` 快捷方式支持透传给 scripts/open.mjs 的 opener flag：
novel-ma tui --print-url      # 只打印解析后的 file:// URL，不实际启动浏览器
novel-ma tui --no-launch      # --print-url 的别名
```

所有启动方式都走 `scripts/open.mjs`；平台候选矩阵与 headless WSL 回退行为见 Web 工作台章节。

### TUI 面板区

- **Interactive Shell · Web-first Studio Mirror** — 可选动作（Dashboard / Library / Continue / Provider / Analytics / Shell / Contract），按键提示 `↑/↓ 选择动作 · Enter 生成命令 · w 打开 Web 工作台 · q 退出`，并预渲染命令样例。
- **Mode Parity · CLI/Web/TUI 功能对齐** — 14 命令 × 3 入口矩阵的 checklist。

### TUI 命令速查（与 `apps/tui/` 中显示一致）

```text
novel-ma artifact-latest .novel-ma/projects
novel-ma artifact-catalog .novel-ma/projects --enrich
novel-ma continue <file> --quality-artifact <artifact>
novel-ma provider-doctor && novel-ma provider-smoke <prompt>
novel-ma artifact-search .novel-ma/projects <query>
novel-ma tui                  # 打开 TUI Interactive Shell 面板（走 scripts/open.mjs）
novel-ma --tui                # flag 形式别名，等价于 `novel-ma tui`
novel-ma web                  # 打开 Web 工作台（走 scripts/open.mjs）
novel-ma --web                # flag 形式别名，等价于 `novel-ma web`
novel-ma mode-parity          # 打印 CLI/Web/TUI 对齐矩阵（Mode Parity 契约）
```

`novel-ma mode-parity` 由 `packages/cli/src/mode-parity.ts` 暴露，是 Mode Parity 契约的真正源。

`web` / `tui` / `--web` / `--tui` 快捷方式支持 `--print-url` / `--no-launch` 透传给 `scripts/open.mjs`。在任何平台上当所有浏览器启动器都返回非零退出码时，opener 会打印解析后的 `file://` URL 并 `exit 1`，你可以把它粘贴到宿主机浏览器。

## Mode Parity（CLI / Web / TUI 对齐矩阵）

三入口共享同一份 14 命令能力集，矩阵由 `packages/cli/src/mode-parity.ts` 生成，是任何入口变更前的强制检查项。

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

## GitHub Pages

`.github/workflows/pages.yml` 会部署 `apps/web/` 工作台和 `apps/tui/` 面板。把 Pages 切到 **workflow 模式** 后，push 到 `main`/`master` 或手动运行 workflow 即可。

- 在线工作台：`https://<owner>.github.io/novel-multi-agent/apps/web/`
- TUI 镜像：`https://<owner>.github.io/novel-multi-agent/apps/tui/`
- 旧根 `index.html` 自动跳转到 `apps/web/`。

## CI

`.github/workflows/ci.yml` 在每次 push / PR 到 `main` 时执行 `npm ci → check → test → build → coverage:incremental → verify:readme`。`verify:readme` 会按本 README 列出的命令逐条重放，文档漂移会在 CI 阶段暴露。

## CLI 用法

从主题创建短篇项目：

```bash
npm run cli -- new "月球图书馆的守夜人与失忆AI" --chapters 3 --words 900
```

根据已有篇章续写：

```bash
npm run cli -- continue examples/existing-chapters.md --words 900
```

检查已导出的 artifact：

```bash
npm run cli -- artifact-inspect .novel-ma/projects/<project-id>/artifact.json
```

列出本地 artifact 项目目录：

```bash
npm run cli -- artifact-catalog .novel-ma/projects
npm run cli -- artifact-catalog .novel-ma/projects --enrich
npm run cli -- artifact-latest .novel-ma/projects
npm run cli -- artifact-search .novel-ma/projects 月球
npm run cli -- artifact-search .novel-ma/projects 月球 --latest-only
npm run cli -- artifact-search .novel-ma/projects 月球 --mode theme
npm run cli -- artifact-version-tree .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-diff .novel-ma/projects/<left>/artifact.json .novel-ma/projects/<right>/artifact.json --format text
npm run cli -- artifact-prune .novel-ma/projects --keep 1
```

输出默认写入 `.novel-ma/projects/<project-id>/artifact.json`。

## V1 能力边界

- 默认使用确定性本地 agent，便于无 API key 验收。
- LLM/Flue runtime 接入预留在 `.flue/` 和 `packages/agents` 接口层，后续可替换为真实模型。
- V1 不包含 GUI，但存储结构兼容后续 Web/Electron 工作台。
