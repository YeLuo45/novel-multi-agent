# novel-multi-agent V3 PRD: 全量后续方向迭代

## 背景

V1 已完成从主题创建小说项目的确定性多智能体骨架；V2 已完成续写上下文记忆增强与验收门禁。V3 面向可交付产品化补齐后续高 ROI 能力：真实模型接入、已有章节导入、伏笔回收评分、可发现的 Web 工作台和 CI 自动验收。

## 目标

1. 支持 OpenAI-compatible LLM Provider，同时保持无 API key 时 deterministic mock fallback。
2. 支持 Markdown/纯文本已有章节导入，转换为标准 chapter records。
3. 支持伏笔回收评分，输出 recovered/open/overdue/score/revisionAdvice。
4. 提供零新增运行依赖的 Web 工作台，首页直接暴露主题创建、篇章续写、伏笔评分。
5. 提供 GitHub Actions CI，自动运行安装、类型检查、测试、构建、增量覆盖率、README 命令验证。

## 非目标

- 不引入数据库服务。
- 不引入前端框架或第三方 UI 依赖。
- 不在 V3 强制调用真实外部模型；Provider 接口必须可测、可回退。

## 验收标准

- `npm run check` 通过。
- `npm test` 100% pass。
- `npm run build` 通过。
- `npm run coverage:incremental` 新增函数覆盖率 >= 95%。
- `npm run verify:readme` 对 README 中命令真实执行并返回 0 failed。
- Web 工作台源码存在，且测试验证创建、续写、伏笔评分入口可发现。
