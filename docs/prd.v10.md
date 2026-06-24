# novel-multi-agent V10 PRD: Artifact Diff CLI

## 背景

V7 已建立 Artifact Catalog 基础能力。V10 继续完成后续迭代方向：把 V6 compareArtifacts 暴露为 CLI artifact-diff，并支持真实 NovelProject。

## 目标

1. 保持 core 纯函数、CLI 文件系统适配、Web 零依赖。
2. 新增可测试 contract：runArtifactDiff(left,right)。
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
