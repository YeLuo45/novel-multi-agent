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
npm run bootstrap
```

## CLI 用法

从主题创建短篇项目：

```bash
npm run cli -- new "月球图书馆的守夜人与失忆AI" --chapters 3 --words 900
```

根据已有篇章续写：

```bash
npm run cli -- continue examples/existing-chapters.md --words 900
```

输出默认写入 `.novel-ma/projects/<project-id>/artifact.json`。

## V1 能力边界

- 默认使用确定性本地 agent，便于无 API key 验收。
- LLM/Flue runtime 接入预留在 `.flue/` 和 `packages/agents` 接口层，后续可替换为真实模型。
- V1 不包含 GUI，但存储结构兼容后续 Web/Electron 工作台。
