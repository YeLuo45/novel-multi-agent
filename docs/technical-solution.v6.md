# novel-multi-agent V6 Technical Solution

## 方案概览

新增 `packages/core/src/artifact-toolkit.ts` 作为共享纯函数模块。模块不依赖 Node 或浏览器 API，只处理普通对象和字符串，因此可被 CLI、Web、未来服务端复用。CLI 新增 `artifact-inspect` 命令读取 artifact JSON 文件并返回摘要、记忆图谱和基础校验结果。

## Core API

- `importArtifactJson(json: string | unknown): NovelArtifactEnvelope`
  - 解析 JSON 或对象。
  - 校验 `projectId/title/stage/chapterTitle/artifact`。
  - 错误时抛出明确异常。

- `compareArtifacts(left, right): ArtifactDiff[]`
  - 比较 `title / artifact.mode / chapterTitle / foreshadowingScore.score / outline length`。

- `buildArtifactMemoryGraph(artifact): ArtifactMemoryGraph`
  - 输出 style/character/foreshadowing/outline nodes。
  - 输出 mentions/contains edges。

- `createMemoryArtifactLibrary(initial?: NovelArtifactEnvelope[])`
  - 内存实现，提供 `save/list/load/remove/exportJson`。
  - 作为 Web localStorage library 和未来持久化实现的 contract baseline。

- `summarizeArtifact(artifact)`
  - 输出 CLI 可读摘要。

## CLI API

- `npm run cli -- artifact-inspect <artifact.json>`
  - 读取文件。
  - 调用 `importArtifactJson`、`summarizeArtifact`、`buildArtifactMemoryGraph`。
  - 输出 JSON summary。

## 测试策略

- Core 测试先 RED：要求 toolkit API 存在并覆盖行为。
- CLI 测试先 RED：要求 `runArtifactInspect` 可读取临时 artifact 文件。
- 全量门禁沿用 V5：check/test/build/coverage/readme。
