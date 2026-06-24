# novel-multi-agent V15 PRD: Catalog Compact Output

## 背景

V8-V14 已完成 artifact catalog/search/diff/quality 基础闭环。V15 继续解决：CLI 默认隐藏 searchableText，--verbose 才输出全文索引。

## 目标

1. 零新增依赖，保持 core 纯函数、CLI 适配、Web 本地化。
2. 新增 `compactArtifactCatalog + verbose option` 并覆盖真实 artifact。
3. 默认行为安全，不删除生成物，破坏性动作必须显式开启。
4. README/CI 输出保持可读。

## 验收标准

- 新增/更新 node:test 覆盖。
- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 通过。
- `npm run verify:readme` 返回 0 failed。
