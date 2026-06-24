# PRD v2: 续写上下文记忆增强与验收门禁

## 目标

在 V1 可运行骨架上增强续写质量和交付可靠性：续写必须显式使用已有篇章上下文、角色记忆、伏笔记忆和风格指纹；同时建立增量覆盖率与 README 命令验收门禁。

## 范围

- 新增 continuation context builder。
- Writer Agent 在 continuation 模式下使用结构化上下文。
- 根据已有篇章提取基础角色/伏笔记忆。
- 新增增量覆盖率脚本，阈值 ≥95%。
- 新增 README 命令验收脚本。

## 验收标准

- `npm test` 100% pass。
- `npm run coverage:incremental` ≥95%。
- `npm run verify:readme` 输出 `verify-readme: 0 failed`。
- `npm run build` 与 `npm run check` 通过。
