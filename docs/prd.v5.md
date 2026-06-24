# novel-multi-agent V5 PRD: 完成全部后续迭代方向

## 背景

V4 已把 Web 工作台升级为可生成、续写、评分、预览、下载 artifact 的本地页面。boss 要求继续完成全部后续迭代方向，因此 V5 合并交付七类能力，优先保持零后端、零新增运行依赖，同时补齐 CLI 真实 LLM 调用入口和 GitHub Pages 静态部署准备。

## 目标

1. Web 本地项目库：artifact 可保存到浏览器本地项目库，支持列表、打开、删除、导出。
2. Artifact 导入与对比：支持粘贴 JSON 导入，并比较当前 artifact 与导入 artifact 的标题、章节、伏笔评分、模式差异。
3. 章节编辑与续写闭环：Web 里可编辑章节文本并生成下一章续写 artifact。
4. 真实 LLM CLI 适配：CLI 暴露 provider smoke 命令，支持 OpenAI-compatible env，缺 key 时 fallback mock。
5. 记忆卡片与关系图：从 artifact 构建角色/地点/物品/伏笔卡片和 lightweight graph。
6. Web 视觉升级：至少四套主题（light/dark/sepia/nord），主题切换位于首页主区域。
7. GitHub Pages 静态部署准备：workflow 可部署 `apps/web` 静态文件，README 记录部署方式。

## 非目标

- 不强制推送远程或启用 GitHub Pages；提交/推送仍等待 boss 明确指令。
- 不引入前端框架和数据库服务。
- 不将浏览器 localStorage 数据写入 `.novel-ma` 文件系统。

## 验收标准

- Web workbench 测试覆盖项目库、导入对比、章节编辑续写、记忆图谱、主题切换、Pages workflow。
- CLI 测试覆盖 provider smoke fallback。
- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 新增函数覆盖率保持 100%。
- `npm run verify:readme` 返回 0 failed。
