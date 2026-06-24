# novel-multi-agent V10 Technical Solution: Artifact Diff CLI

## 方案概览

实现 `runArtifactDiff(left,right)`，继续沿用 V6/V7 的 contract 分层：`packages/core` 只处理普通对象和字符串，`packages/cli` 负责文件读取和命令参数，`apps/web/index.html` 保持零依赖浏览器本地函数。

## 实现要点

- Core：新增纯函数和类型，兼容 V6 envelope 与 persisted NovelProject。
- CLI：新增 runner 与 command branch，输出 JSON。
- Web：只暴露纯函数，不引入 bundler。
- 测试：先 RED 后 GREEN，覆盖正常路径、坏输入和真实 artifact 格式。

## 验证

运行：

```bash
npm run check && npm test && npm run build && npm run coverage:incremental && npm run verify:readme
```
