# novel-multi-agent V7 Technical Solution

## 方案概览

V7 在 V6 artifact toolkit 上增加 catalog 层。Catalog 不负责文件系统扫描，只接收 `{ path, json }` 条目，解析成功后输出 `ArtifactCatalogItem`，解析失败则输出 issue。CLI 负责扫描目录和读取文件，core 只做纯函数聚合。

## Core API

- `buildArtifactCatalog(entries: ArtifactCatalogEntry[]): ArtifactCatalog`
  - 每个 entry 包含 `path` 与 `json`。
  - 调用 `importArtifactJson` 兼容 V6 envelope 与真实 `NovelProject`。
  - 成功项输出 `projectId/title/stage/chapterTitle/mode/outlineChapters/updatedAt/sourcePath`。
  - 按 `title` 再 `projectId` 稳定排序。
  - 失败项进入 `issues`，不中断 catalog。

## CLI API

- `npm run cli -- artifact-catalog [root]`
  - 默认 root 为 `.novel-ma/projects`。
  - 递归查找 `artifact.json`。
  - 输出 `{ items, issues }` JSON。

## 测试策略

- Core TDD：两个合法 artifact + 一个坏 JSON，验证排序和 issue。
- CLI TDD：临时目录创建两个 project artifact，验证扫描输出。
- 真实验收：用现有 `.novel-ma/projects` 执行 `artifact-catalog`，确认不会因单个项目失败而退出。
