# Technical Solution v2

## Design

新增 `buildContinuationContext()` 作为 core 纯函数，把已有篇章、记忆层和下一章目标转换成 Writer Agent 可直接消费的 prompt block。

## Implementation

- `packages/core/src/context.ts`: continuation context 类型、memory brief、style guide、prompt block。
- `packages/agents/src/deterministic-agents.ts`: Bible Agent 从已有篇章种入角色/伏笔/风格记忆；Writer Agent 在续写模式使用 continuation context。
- `scripts/incremental-coverage.mjs`: 基于 Node V8 coverage 统计本轮增量源文件函数覆盖率。
- `scripts/verify-readme.mjs`: 顺序执行 README 命令和 CLI smoke。

## Test strategy

- RED: core 新增 continuation context 行为测试；agents 新增续写记忆约束测试。
- GREEN: 最小实现，保持 V1 CLI 和 storage 兼容。
- Gate: build / test / check / incremental coverage / README verification。
