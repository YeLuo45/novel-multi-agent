# novel-multi-agent V7 PRD: Artifact Catalog

## 背景

V6 已经把 artifact 导入、摘要、图谱能力下沉到 `packages/core`，但 CLI 仍只能检查单个 artifact。真实项目会持续在 `.novel-ma/projects/<project-id>/artifact.json` 下累积多个项目，后续 Web/CLI 都需要一个统一的项目目录视图。

## 目标

1. 在 core artifact toolkit 中新增 catalog 能力：读取多个 artifact envelope / NovelProject，生成稳定排序的项目摘要列表。
2. CLI 新增 `artifact-catalog [root]` 命令，扫描 root 下的 artifact JSON 文件并输出 catalog。
3. 兼容默认 `.novel-ma/projects` 目录；传入 root 时支持测试临时目录。
4. 测试覆盖 catalog 排序、单个坏文件降级为 issue、不影响其他项目。
5. README 补充 artifact catalog 用法。

## 非目标

- 不引入数据库或远程同步。
- 不修改现有 artifact 存储格式。
- 不做 Web UI 新面板，仅建立共享 contract。

## 验收标准

- `packages/core/test/artifact-toolkit.test.ts` 覆盖 `buildArtifactCatalog`。
- `packages/cli/test/artifact-catalog.test.ts` 覆盖 `runArtifactCatalog`。
- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 通过。
- `npm run verify:readme` 返回 0 failed。
