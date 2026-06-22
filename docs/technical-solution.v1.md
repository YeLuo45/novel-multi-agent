# Technical Solution v1

## Fusion design

| Source | Adopted pattern |
|---|---|
| Flue | Agent/workflow 分离、可部署 workflow、agent harness 概念 |
| AI_NovelGenerator | 设定→目录→章节→定稿→状态更新链路，分块目录和近章摘要 |
| NovelForge | 卡片化创作、上下文注入、记忆/关系图谱、Workflow Agent 思想 |

## Packages

- `@novel-ma/core`: 类型、状态机、上下文构建、JSON 存储。
- `@novel-ma/agents`: 确定性 agent 实现和 pipeline orchestration。
- `@novel-ma/cli`: `new` 与 `continue` 命令。

## Pipeline

```text
intake -> bible -> outline -> draft -> critique -> revision -> memory -> completed
```

每一步只允许前进，由 `advanceStage` 保护，避免 agent 随意改状态。

## Artifact model

`NovelProject` 是唯一持久化实体，包含：

- `source`: theme 或 continuation。
- `cards`: premise、bible、outline、draft、critique、revision。
- `memory`: characters、foreshadowing、styleFingerprint、chapterSummaries。
- `auditLog`: 每个 agent 的输入摘要、输出摘要和时间。

## Flue integration plan

`.flue/agents/*.ts` 与 `.flue/workflows/*.ts` 保存 Flue-style 蓝图。V1 不把本地验证绑定到 Flue workspace 依赖，避免跨仓库开发阻塞；后续可把 `packages/agents` 适配为真实 `defineAgent/defineWorkflow`。
