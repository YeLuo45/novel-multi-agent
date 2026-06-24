# novel-multi-agent V11 PRD: Local Artifact Search

## 背景

V7 已建立 Artifact Catalog 基础能力。V11 继续完成后续迭代方向：在 catalog/envelope 上支持标题、角色、伏笔、章节摘要搜索。

## 目标

1. 保持 core 纯函数、CLI 文件系统适配、Web 零依赖。
2. 新增可测试 contract：searchArtifactCatalog + CLI artifact-search。
3. 覆盖真实 `.novel-ma/projects/**/artifact.json` 形态。
4. 文档和 README 同步可执行命令。

## 非目标

- 不引入新依赖。
- 不改写历史 artifact 文件。
- 不连接远程服务或数据库。

## 验收标准

- 新增/更新 node:test 测试。
- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 通过。
- `npm run verify:readme` 返回 0 failed。
