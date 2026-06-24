# novel-multi-agent V4 Technical Solution

## 方案概览

V4 在 `apps/web/index.html` 内实现一个零依赖本地工作台。页面脚本不调用网络、不依赖构建工具，直接在浏览器内生成标准 artifact 对象，并支持 JSON 下载。测试侧通过 Node 读取 HTML 内嵌脚本，验证纯函数存在与行为。

## 设计原则

- 保持零新增依赖：使用原生 DOM、Blob、URL API。
- 保持 artifact schema 与 CLI 输出字段一致：`projectId/title/stage/chapterTitle/artifact`。
- 业务逻辑可测试：把生成逻辑挂到 `window.NovelWorkbench`，测试通过 VM sandbox 调用。
- UI 可发现：创建、续写、评分、预览、下载都在首页主区域。

## 实现点

1. `apps/web/index.html`
   - 新增主题创建表单。
   - 新增已有章节续写表单。
   - 新增伏笔评分文本域。
   - 新增 artifact preview `<pre>` 和下载按钮。
   - 暴露 `window.NovelWorkbench.createFromTheme / continueFromChapters / scoreForeshadowing / buildArtifact`。

2. `packages/cli/test/workbench-ci.test.ts`
   - 增加 HTML 脚本抽取与 VM 执行测试。
   - 验证从主题生成 artifact。
   - 验证从已有章节生成续写 artifact。
   - 验证伏笔评分结果进入 artifact。

3. `README.zh-CN.md` / `README.md`
   - 补 Web 工作台说明与本地打开方式。

## 验收命令

```bash
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
```

## 风险控制

- 浏览器下载 API 不在 Node VM 中执行真实下载，测试只覆盖 artifact 生成逻辑。
- README 验证会运行 demo 并生成 `.novel-ma` artifact，仍由 `.gitignore` 排除。
