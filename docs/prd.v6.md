# novel-multi-agent V6 PRD: 共享 Artifact Toolkit

## 背景

V5 Web 工作台已具备项目库、导入对比、记忆图谱等能力，但核心逻辑仍主要存在于 HTML 内联脚本。V6 要把这些通用能力下沉到 `packages/core`，让 CLI、Web 和后续服务端都可复用同一套 artifact 工具，减少重复逻辑和行为漂移。

## 目标

1. 在 `packages/core` 新增 artifact toolkit：artifact 校验、导入、对比、记忆图谱、内存项目库。
2. CLI 新增 `artifact-inspect` 命令，可读取 artifact JSON 并输出 memoryGraph/diff-ready summary。
3. Web 工作台继续保持零依赖，但内联逻辑语义需和 core toolkit 对齐。
4. 测试覆盖 core toolkit 的正常路径和错误路径。
5. README 补充 CLI artifact inspect 用法。

## 非目标

- 不引入浏览器 bundler，不把 core 直接打包进 HTML。
- 不做远程同步和多用户协作。
- 不改变 V1-V5 已有 CLI 输出 schema。

## 验收标准

- `packages/core/test/artifact-toolkit.test.ts` 覆盖 import/compare/memoryGraph/library。
- `packages/cli/test/run.test.ts` 覆盖 `runArtifactInspect`。
- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 通过。
- `npm run verify:readme` 返回 0 failed。
