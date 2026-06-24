# novel-multi-agent V5 Technical Solution

## 方案概览

V5 保持当前零依赖 TypeScript workspace 与单文件 Web 工作台架构。Web 侧继续使用原生 DOM/localStorage/Blob/URL API，业务函数暴露到 `window.NovelWorkbench`，便于 Node VM 测试。CLI 侧复用 `@novel-ma/core` 的 LLM Provider，新增 provider smoke 命令作为真实模型接入前的可验收入口。

## Web 本地项目库

- 新增 `createLibrary(storage)`，封装 `save/list/load/remove/exportAll`。
- 默认使用 `localStorage` 键 `novel-ma:artifacts`。
- UI 显示历史 artifact 列表，支持打开和删除。

## Artifact 导入与对比

- 新增 `importArtifact(json)` 解析 JSON 并校验核心字段。
- 新增 `compareArtifacts(left, right)`，输出 title/mode/chapterTitle/foreshadowingScore 差异。
- UI 提供粘贴框和“导入并对比当前预览”。

## 章节编辑续写闭环

- 复用 V4 `continueFromChapters`，将章节编辑文本作为事实来源。
- 保存的 artifact 可重新打开到预览区域。

## 真实 LLM CLI 适配

- 新增 CLI 子命令 `provider-smoke`。
- 使用 `createLLMProviderFromEnv(process.env)`，无 key 时返回 mock provider。
- 输出 provider/model/text，便于 CI 无密钥验收和本地有密钥时烟测。

## 记忆卡片与关系图

- 新增 `buildMemoryGraph(artifact)`。
- 从 artifact 中抽取 characters/items/foreshadowing/style cards，并生成 graph nodes/edges。
- Web artifact 预览默认包含 `memoryGraph`。

## 视觉主题

- HTML 根节点使用 `data-theme`。
- 提供 light/dark/sepia/nord 四套 CSS variables。
- 主题选择器位于 header 主区域，偏好写入 localStorage。

## GitHub Pages 部署准备

- 新增 `.github/workflows/pages.yml`。
- workflow 上传 `apps/web` 为 Pages artifact，不需要构建。
- README 记录本地打开和 Pages workflow 模式。

## 验收命令

```bash
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
```
