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
packages/cli     # 本地命令行入口
.flue/           # Flue-style agent/workflow 蓝图
examples/        # 输入样例
scripts/         # 验收脚本
```

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
