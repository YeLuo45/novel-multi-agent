# novel-multi-agent V3 Technical Solution

## 方案概览

V3 延续现有 TypeScript npm workspaces：`packages/core` 放纯领域算法，`packages/agents` 编排确定性写作流程，`packages/cli` 提供命令入口，`apps/web` 提供零依赖静态工作台。核心原则是所有能力默认可离线验收，外部 LLM 只作为可替换 Provider。

## 模块设计

### LLM Provider

- 新增 `packages/core/src/llm-provider.ts`。
- 提供 mock provider 与 OpenAI-compatible provider 构造入口。
- 当 API key 不存在时自动回退 mock provider，确保 CI/本地验收无需密钥。

### 章节导入

- 新增 `packages/core/src/chapter-importer.ts`。
- 支持 Markdown 标题章节与纯文本编号章节解析。
- 输出标准 chapter records，供续写上下文构建器消费。

### 伏笔评分

- 新增 `packages/core/src/foreshadowing-score.ts`。
- 按伏笔种植/回收状态分类 recovered/open/overdue/missing。
- 生成 score 与 revisionAdvice，供审校 agent 或 Web 工作台展示。

### Web 工作台

- 新增 `apps/web/index.html`。
- 不引入构建链，直接提供主题创建、已有篇章续写、伏笔评分三个可发现区域。
- 通过测试验证主入口文案和交互区域存在。

### CI 与门禁

- 新增 `.github/workflows/ci.yml`。
- CI 执行 install/check/test/build/coverage/readme verification。
- `scripts/incremental-coverage.mjs` 对新增函数做增量覆盖率验证。
- `scripts/verify-readme.mjs` 真实执行 README 命令，防止文档漂移。

## 风险与控制

- 外部模型网络和密钥不可控：默认 mock fallback，真实 Provider 仅通过接口测试覆盖无密钥路径。
- README 验证会产生 `.novel-ma` artifact：已在 `.gitignore` 排除运行产物。
- Web 工作台不引入框架：V3 只交付静态可发现入口，后续再接 CLI/API。

## 验收命令

```bash
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
```
