# novel-multi-agent V4 PRD: Web 本地 Artifact 工作台

## 背景

V3 已提供零依赖 Web 工作台入口，但主要是静态可发现界面。V4 要把它升级为真正可用的本地浏览器工作台：用户在页面中输入主题或已有章节，即可生成标准 artifact 预览、导出 JSON，并对伏笔清单进行本地评分。

## 目标

1. Web 工作台支持从主题创建 artifact 预览。
2. Web 工作台支持粘贴已有章节并生成续写 artifact 预览。
3. Web 工作台支持输入伏笔清单并生成 recovered/open/overdue/score/revisionAdvice。
4. Web 工作台支持下载 artifact JSON，便于后续导入 CLI/存储层。
5. 所有逻辑保持零后端、零新增 npm 依赖，适合 GitHub Pages/本地 file preview。

## 非目标

- 不在 V4 接真实 LLM 网络调用。
- 不引入 React/Vue/Vite 等前端框架。
- 不写入真实 `.novel-ma` 文件系统；浏览器只导出 JSON。

## 验收标准

- Web 页面包含可发现的创建、续写、伏笔评分、artifact 预览、下载入口。
- Node 测试验证页面脚本可从主题生成 artifact。
- Node 测试验证页面脚本可从已有章节生成续写 artifact。
- Node 测试验证伏笔评分结果进入 artifact。
- `npm run check`、`npm test`、`npm run build`、`npm run coverage:incremental`、`npm run verify:readme` 全部通过。
