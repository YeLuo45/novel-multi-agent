# novel-multi-agent

`novel-multi-agent` 是一个基于 Flue 思想设计的多智能体小说创作系统。它支持两类核心任务：

1. 根据用户主题从零生成小说设定、章节目录和章节正文。
2. 根据已有小说篇章续写下一章，并保持人物、伏笔、世界观和文风一致。

## 参考来源

- `/home/hermes/projects/flue`：采用 agent/workflow 分层、可部署工作流、会话式 harness 的思想。
- `/home/hermes/opensource/AI_NovelGenerator`：采用设定工坊、分块章节目录、最近章节摘要、定稿后更新状态的写作链路。
- `/home/hermes/opensource/NovelForge`：采用卡片化创作、上下文注入、知识图谱/记忆层、工作流 Agent 的产品思想。

## 架构

```text
packages/core    # 状态机、类型、存储、上下文/记忆算法
packages/agents  # 规划/设定/大纲/写作/审校/记忆等智能体
packages/cli     # 本地命令行入口 + Mode Parity / Web Studio 共享契约
apps/web/        # 零依赖 Web 工作台（单文件 HTML，约 62 KB）
apps/tui/        # 静态 TUI 交互式面板（单文件 HTML）
.flue/           # Flue-style agent/workflow 蓝图
examples/        # 输入样例
scripts/         # 验收脚本 + 跨平台打开器 (verify-readme / incremental-coverage / open)
index.html       # 兼容旧 Pages 的根入口，跳转到 apps/web/
```

## 三大入口（CLI / Web / TUI）

同一份能力通过三个入口暴露，由 `packages/cli/src/mode-parity.ts` 中的 Mode Parity 契约统一，避免后续漂移。

| 入口 | 位置 | 启动方式 | 角色 |
| --- | --- | --- | --- |
| CLI | `packages/cli/src/cli.ts` | `npm run cli -- <command> ...` · `npx novel-ma <command> ...` | 脚本化、CI 友好、JSON 输出 |
| Web 工作台 | `apps/web/index.html` | `npm run web` *或* `npm run cli -- web` *或* `npm run cli -- --web` *或* `npx novel-ma web`（或浏览器直接打开 / GitHub Pages） | 可视化、交互、4 套主题 |
| TUI 面板 | `apps/tui/index.html` | `npm run tui` *或* `npm run cli -- tui` *或* `npm run cli -- --tui` *或* `npx novel-ma tui`（或浏览器直接打开 / GitHub Pages） | 终端风格，镜像 Web 主流程 |

## 快速开始

```bash
npm install --include=dev --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
npm run bootstrap
```

`npm run verify:readme` 会按本文档列出的命令逐条重新执行，确保 README 与本地 `.novel-ma/projects/` 真实状态一致。

## V69 InMemory 真实持久化（双写 adapter + backup plan + restore plan + checksum）

- `buildIdbPersistenceAdapter(handle, {primaryStorage, primaryKey, secondaryKey})`：包装 V68 in-memory handle 为持久化层，primary/secondary 双存储 + `getBytes()/getWritesLogged()` 方法 + `bytesWritten/writesLogged` getter（避免对象值捕获陷阱）。
- `planPersistenceBackup(handle, options)`：序列化所有 store 到 JSON + 写入 targetStorage + 4 步备份步骤 + estimatedBytes/durationMs。
- `planPersistenceRestore(handle, options)`：从 sourceStorage 恢复 + entriesFound/Applied + conflictsResolved 计数 + ready flag。
- `computePersistenceChecksum(handle, algorithm)`：3 算法（sha256-lite/fnv1a/simple-xor）+ per-store digests + byteCount；fnv1a 是零依赖标准实现。
- HTML 集成：5 个 inline 按钮（build/write/backup/restore/checksum），从 library.list() 自动写入 3 artifact。
- 关键修复：`bytesWritten` 从普通属性改为 `get bytesWritten()` getter，避免 return object 时值捕获（最初测试报 0 因为 return 时 bytesWritten=0 已被冻结）。

## V68 IDB Mock browser-side（in-memory store + 事件 + 7 op 批量执行）

- `buildIdbInMemoryHandle({stores})`：返回完整 IDB API 模拟（put/get/getAll/delete/count/clear/close），每 store 含 Map data + putCount/getCount/deleteCount/clearCount/size 计数器；所有 op 记录 `IdbInMemoryEvent{type, store, key?, value?, result?, timestamp}`；totalOperations getter 跟踪 op 总数。
- `runIdbInMemoryOps(handle, ops)` async：顺序执行 ops 数组，成功/失败分别计数 + 错误不中断后续 op + 返回本次 slice events。
- HTML 集成：3 个 inline 按钮（生成 handle / 批量 7 ops / 错误路径），从 library.list() 自动生成 ops；`totalOperations` 在错误路径中证明 continue-on-error 行为。
- 关键修复：V67 patch 时误删 IdbEvalCode interface（前向声明 IdbInMemoryStore block），单独补回后通过。

## V67 IDB 真实 eval（浏览器 eval(planCode) + 错误回退 + 5 类错误识别）

- `buildIdbExecutorCode(executor, {wrapperFnName})`：从 V58 executor 生成 `function runIdbExecutor(executor) { ... }` 可执行 JS 代码字符串，含 startTime/stepsCompleted/return IdbEvalResult 9 字段 + try/catch + dependencies list (`indexedDB`/`console`/`JSON`/`localStorage`)。
- `parseIdbEvalError(stderr, step?)`：识别 5 类 IDB 错误 → `IdbEvalErrorInfo{errorType, message, step, recoverable, fallbackStorageKey, userMessage}`；`QuotaExceededError`/`InvalidStateError` 可恢复降级到 localStorage，`NotFoundError`/`SyntaxError` 不可恢复。
- `simulateIdbEval(evalCode, mockOutput)`：Node 端同步执行 mock，返回 `IdbEvalResult` (success/stepsCompleted/totalSteps/errorMessage/errorStep/fallbackTriggered/durationMs/outputPreview 8 字段)；HTML 端可用 `eval(evalCode.code)` 真实执行。
- HTML 集成：3 个按钮（生成 eval 代码 / Node 端 simulate / 解析错误），从 library.list() 自动生成 ops。

## V66 TUI 真实键盘绑定（document keydown → vimKey → planTuiKeyBindings）

- `parseVimKey(key, shift, ctrl, alt, meta)` private：把 raw event.key 转成 vim 风格（如 'j', 'Ctrl+r', 'Cmd+k', 'Esc', 'Down'）。
- `buildTuiKeyEvent(input)`：返回 `{key, sequence, modifiers{4}, vimKey, matched}`。
- `planTuiKeyBindings(keymap, event)`：匹配 direct bindings（大小写不敏感），返回 `{event, binding, action, matched, consumed}`。
- `buildTuiActiveSection(sectionId, index, totalSections, vimActions)`：返回 `{sectionId, index, totalSections, highlighted, vimActions[]}` 用于 UI 高亮。
- HTML 集成：1 个真实 keydown 监听 + 1 个 27-section 列表 + 1 个按钮触发模拟 keydown；`active-mark ▶` 标记当前 section；input/textarea 内键不触发（避免破坏编辑）。

## V65 TUI 镜像交互（vim hjkl + 9 actions + 3 模式）

- `buildTuiKeymap({mode, enableNavigation, enableActions})`：返回 `{mode: 'normal'|'insert'|'command', bindings[9], enabled}`，含 j/k/gg/G/Enter (navigation) + q/?/:/i (actions)。
- `planTuiNavigate(keymap, currentSection, keySequence, allSections)`：根据 key 序列返回 `{fromSection, toSection, action, direction, matched}`；direction ∈ up/down/first/last/enter/quit/help/command/insert/unknown。
- `buildTuiCommands(options)`：聚合 keymap 返回 `{totalBindings, uniqueActions, navigationKeys[], actionKeys[], ready}`。
- HTML 集成：2 个 inline 按钮（列出 vim 键映射 / 导航）+ 1 个 key 输入框；用户输入 `j`/`k`/`gg`/`G`/`q` 触发 navigate。
- 关键修复：V64 patch 时误删 IdbIntegrationTestCase interface（前向声明 TuiKeymap block），单独补回后通过。

## V64 IDB 集成测试（4 用例 + mock handle + 100% 覆盖率断言）

- `buildIdbIntegrationTestCases()`：4 内置用例：basic-put-single / basic-count-after-put / no-idb-fallback / getall-empty，每个含 executor + expectedSuccess/Fallback/Steps。
- `runIdbIntegrationTest(test)` async：用 V63 mock handle + V60 planIdbExecution + V63 simulateIdbRuntime 执行单个 case，断言三字段相等返回 `IdbIntegrationTestResult`。
- `assessIdbIntegrationCoverage(tests)` async：聚合 N 个 case 返回 `{totalCases, passedCases, failedCases, coveragePercent, results[], ready}`，ready=true iff failedCases===0。
- HTML 集成：2 个 inline 按钮（列出所有测试用例 / 运行所有集成测试），从 wb?.buildIdbIntegrationTestCases() 取数据。
- 关键修复：V63 patch 时误删 IdbMockStore interface（前向声明 IdbIntegrationTestCase block），单独补回后通过。

## V63 IDB 真实 runtime 模拟（mock handle + execute + 错误恢复）

- `buildIdbMockHandle({supportsIdb, stores})`：返回 `{stores{projects/tags/undo put/get/getAll/delete/count/clear/close}, isOpen, supportsIdb, open, close}`。
- `simulateIdbRuntime(plan, handle, options)` async：返回 `IdbRuntimeResult{success, stepsCompleted, totalSteps, errorMessage, errorStep, fallbackUsed, fallbackStorageKey, durationMs, recovered}`。IDB 不支持时 fallbackUsed=true，错误信息='IDB not supported'。
- `planIdbRecovery(error, options)`：返回 `{fromError, toFallback, steps[5], estimatedDurationMs, fallbackStorageKey, ready}`；recovered=true 步骤含 '记录恢复事件到 novel-ma:idb-recovery log'，false 含 '抛出错误让用户决策'。
- HTML 集成：4 个 inline 按钮（mock 生成 / 成功 execute / 失败 execute / 错误恢复计划），从 library.list() 自动生成 put ops。
- 关键修复：每次新方向块加在 IdbMockHandle/IdbRuntimeResult/IdbRecoveryPlan 之前时，需要保留后续的 `export interface IdbExecutionPlan` 块；通过先加新内容再用 patch 单独补回丢失的 interface。

## V62 主题持久化（light/dark/sepia/nord + 跨刷新 + 11 token）

- `buildThemeConfig(themeName, options)`：从 THEME_REGISTRY 查 light/dark/sepia/nord 之一返回 `{name, label, storageKey, tokens{11字段}, ready, warning?}`，unknown theme 降级到 dark。
- `buildThemeOptions(currentTheme?)`：返回 4 个 ThemeConfig[]，active theme 的 storageKey 标记为 `novel-ma:theme`，其他为 `novel-ma:theme:<name>`。
- `planThemeMigration(fromTheme, toTheme, options)`：返回 `{fromTheme, toTheme, steps[5], cssVariableBlock, estimatedDurationMs, preserveUserPreference, ready}`；cssVariableBlock 是可直接 eval 的 `:root[data-theme='light'] { --bg: ...; }`。
- 11 token 字段：bg/panel/text/muted/border/accent/code/codeText/success/warn/danger。
- HTML 集成：4 个主题切换按钮（light/dark/sepia/nord）+ 1 个 migration 计划按钮 + DOMContentLoaded 自动恢复用户偏好；通过 `applyThemeLive(theme)` 写 `document.documentElement.dataset.theme` + `localStorage` `novel-ma:theme`。
- 真实持久化：刷新页面后 `loadThemeLive()` 从 localStorage 恢复上次主题。

## V61 CLI REPL 调度器（21 命令 + 解析 + 派发 + allowlist + help）

- `parseReplCommand(input)`：解析 `command --flag=value arg` 字符串为 `{name, args[], flags{}, raw}`。
- `planReplDispatch(command)`：匹配 21 内置命令之一（new/continue/provider-smoke/provider-doctor/artifact-*/tui/mode-parity/workspace-persist/exec-pipeline/idb-migrate/undo-pop/redo-push/markdown-render/help/quit），返回 `{matched, handler: 'handle_<cmd>', suggestions[], ready, warning?}`。
- `buildReplHelp(filter?)`：列出所有命令 + description + flags[]，支持子串过滤。
- `planCliCommand(input, options)`：包装 dispatch + allowlist 检查，返回 `ReplDispatchPlan & {helpEntry?}`。
- HTML 集成：3 个 inline 按钮（parse/dispatch/help）+ 1 个输入框，实时展示解析结果/派发计划/全部命令列表。
- 修 `parseReplCommand` 空 next token 处理 bug：`new --quality` 时 next=undefined，应赋 `flags['quality']='true'` 而不是 `''`。
- 修 `planCliCommand` 的 `helpEntry` 类型不匹配：`matched` 是 `REPL_COMMANDS[].name`，需要显式构造 `{command, description, flags}` 才能匹配 `ReplHelpEntry`。

## V60 IDB Execution Wrapper（try-catch + onError + localStorage 错误回退）

- `planIdbExecution(executor, {fallbackStorageKey, timeoutMs})`：从 V58 executor 生成 async wrapper 字符串，每步 `try { step.code; stepsCompleted = i; } catch (err) { onIdbError(i, err); return IdbExecutionResult; }` + 顶层 fallback try/catch + 3 个 errorHandlers（onIdbError 函数 / IDB not supported 检测 / timeout warning）。
- `IdbExecutionResult` 包含 success/stepsCompleted/totalSteps/errorMessage/errorStep/fallbackUsed/durationMs。
- HTML 集成：1 个 inline 按钮（生成 Execution Wrapper），输出 wrapper 代码字符串到 `idb-exec-wrapper-host`，HTML 端可 `eval(plan.wrapper)` 真实运行 IDB 步骤。
- 修复 wrapper 缺失 `localStorage.setItem` 引用（之前只放在 errorHandlers 数组里，没 inline 到 wrapper）。
- 修 V60 测试 line 1185 `assert.ok(plan.wrapper.includes('localStorage.setItem'))` 失败：把 errorHandlers 内联到 wrapper 字符串内。

## V59 TUI 镜像 V41-V58 全功能（三端 parity 100%）

- `buildTuiMirror({width, webStudioVersion})`：聚合 18 个 V 特性（V41-V58）到 21 个 TUI 段（1 header + 18 features + 1 bindings + 1 shortcuts），每段生成 ASCII 边框文本（┌─┐│└─┘），含 parity=1.0 + bindings(11) + shortCuts(9) + featuresCovered(18) 元数据。
- HTML 集成：1 个 inline 按钮（生成 TUI 镜像），输出 `.code-frame` 文本到 `tui-mirror-host`。
- `apps/tui/index.html` 真实落地 V59：新增 "V59 TUI Mirror" term panel + "Generate TUI Mirror" 按钮 + inline `buildInlineMirror()` 函数（vm-free 渲染，因为 TUI 是浏览器内执行）；与 V32 Interactive Shell + V33 Mode Parity 共存。
- 关键修复：V58 误删 `IdbExecutorStep` interface 已补回 + 加 `warnings` 字段到 `IdbMigrationPlan`。
- 修 TUI 镜像 totalSections 计数 off-by-one：实际 21 = 18 features + 1 header + 1 bindings + 1 shortcuts，不是 20。
- vm sandbox 兼容：1 个新函数通过 Object.assign + typeof guard 注入。

## V58 IndexedDB 真实 runtime executor（open + migrate + put + close 步骤代码）

- `buildIdbExecutor({dbName, version, operations, supportsIdb, fallbackStorageKey})`：从 V51 schema + V54 operations 生成真实 `indexedDB.open(...)` + `onupgradeneeded` + per-op `tx.objectStore(...).put/get/delete/count/getAll/clear()` + `db.close()` 代码字符串。
- `planIdbMigration(items, options)`：从 artifact 列表 + sizeBytes 推算 IDB put steps + totalBytes vs maxBytes（默认 50MB）+ warnings + ready flag。
- HTML 集成：2 个 inline 按钮（executor/migration plan），每步显示 `description + code`，HTML 端可直接 `eval(step.code)` 执行（vm sandbox 不执行，真实浏览器可执行）。
- 修 IdbMigrationPlan 缺 `warnings` 字段导致 `warnings is not defined`：补回 warnings: string[] 字段。
- 修 `planIdbMigration` 超量时 `ready` 永远 true 的 bug：添加 `overage` 标志 + `ready: !overage && executor.ready`。

## V57 Redo 栈真实实现（push + pop + forward 计划）

- `buildRedoStackConfig()`：storageKey `novel-ma:redo` / maxSize 50（clamp 1-500）/ ttlMs 7 天。
- `pushRedoEntry(stack, entry, now)`：TTL 过滤 + FIFO trim 保留最后 maxSize 条。
- `popRedoEntry(stack)`：返回 `{stack, entry}`，栈空时 entry=null。
- `planRedoForward(undoStack, redoStack, entryId)`：返回 `{entryId, fromUndo, pushedToRedo, redoStackSize, undoStackSize, steps[4], ready}`。
- HTML 集成：3 个 inline 按钮（push/pop/plan）+ 真实 localStorage 持久化（`novel-ma:redo` key）+ loadRedoStack/saveRedoStack 辅助函数。
- 关键修复：V56 修的 typeof guard 在 V57 复用通过 Object.assign + typeof 嵌套时不能正确闭合——必须用 `typeof fn === 'function' ? fn : () => null` 形式而非嵌套条件。

## V56 键盘快捷键真绑定（Ctrl+Z/Y/S/B/E + 冲突检测）

- `planKeyboardShortcut({id, key, ctrl, shift, alt, meta, label, scope, existing?})`：返回 `{shortcut, displayKey, conflictWith[], ready, warning?}`；displayKey 自动拼接 `Ctrl+Z` / `Cmd+Shift+Enter`；existing 用于冲突检测。
- `buildChapterShortcutBindings({enableCtrlZ, enableCtrlY, enableCtrlS, enableCtrlB, enableCtrlE})`：默认 5 个快捷键（撤销/重做/保存/加粗/inline code）；返回 totalCount + conflictCount + warnings。
- HTML 集成：`document.addEventListener('keydown')` 在 textarea focus 范围内匹配 binding，Ctrl+Z 真实从 V53 undo 栈 pop + 恢复 body；Ctrl+B 包裹选区为 `**`；Ctrl+E 包裹为 `` ` ``；Ctrl+S 触发 V55 save。
- vm sandbox 兼容：2 个新函数通过 Object.assign + typeof guard 注入。
- 修 keydown 监听中误用 TS `as` cast 致 SyntaxError：改为 `typeof before === 'object' ? before.body : undefined`。

## V55 章节正文 Markdown 嵌入（raw / preview / split 三视图 + undo 联动）

- `buildChapterDocument({body, view, undoEntries})`：聚合 `renderMarkdown` + `countWords` + 元数据（wordCount/headingCount/codeBlockCount/linkCount）→ 单一文档模型。
- `switchChapterView(doc, view)`：纯函数切换 raw/preview/split，body/renderedHtml 不变。
- `planChapterEdit({before, after, label, undoEntriesBefore})`：返回 `{operation, deltaWords, fingerprint, undoEntriesAfter, label}`；fingerprint 复用 V43 `fingerprintOf`。
- HTML 集成：textarea + 4 按钮（raw/preview/split/save）+ stats badge（view + 字数 + 标题 + 代码 + 链接）+ split 模式用 CSS grid 1:1 展示；save 按钮调 `planChapterEdit` + `planUndoEntry` + `pushUndoEntry` 真实写入 V53 撤销栈。
- 复用 V43 + V52 + V53：单文件内零依赖集成，三个方向的产物通过 buildChapterDocument 聚合。

## V54 Web IndexedDB Runtime（open + batch + quota 评估）

- `buildIndexedDbRuntime()`：从 V51 schema 生成 runtime，9 个 operations（open/get/getAll/put/delete/count/clear/batch-put/migrate）+ 4 步 open 流程（open → onupgradeneeded → onerror 降级 fallback → onsuccess）+ batchSize（1-1000）+ supportsBatch/Transaction flags。
- `planIndexedDbBatch(ops)`：分组 ops by store + estimatedDurationMs + transaction flag（≤3 store 自动启用）+ fallbackToOneByOne。
- `assessIndexedDbQuota(items)`：totalBytes vs targetBytes（默认 maxBytes 80%）+ recommendedEviction（超量时按均值算驱逐数）+ ok flag。
- HTML 集成：3 个 inline 按钮（runtime/batch/quota），从 `library.list()` 自动生成 ops 计划。
- vm sandbox 兼容：3 个新函数通过 Object.assign + typeof guard 注入。

## V53 Web 撤销栈真持久化（localStorage 栈 + 跨刷新 + 栈统计）

- `buildUndoStackConfig()`：storageKey `novel-ma:undo` / maxSize 50（clamp 1-500）/ ttlMs 7 天（clamp ≥60s）/ persistAcrossReload true。
- `pushUndoEntry(stack, entry, now)`：TTL 过滤过期 entry + FIFO trim 保留最后 maxSize 条；返回新 stack + 更新 totalPushed/oldestEntryId/newestEntryId。
- `popUndoEntry(stack)`：返回 `{stack, entry}`，栈空时 entry=null；totalPopped 累加。
- `planUndoRestore(stack, entryId)`：返回 `{entryId, projectId, label, beforeJson, afterJson, deltaFieldCount, steps[4], ready}`；entry 不存在时 ready=false + steps=['entry not found']。
- `computeUndoStats(stack, now)`：返回 `{count, maxSize, storageBytes, oldestAge, averageInterval, ttlMs}`。
- HTML 集成：3 个 inline 按钮（push/pop/stats）+ 真实 localStorage 持久化（`novel-ma:undo` key）+ loadUndoStack/saveUndoStack 辅助函数 + `planUndoEntry` 复用 V47 的 entry 生成。

## V52 Web Markdown 富文本编辑器（零依赖渲染 + 工具栏 + 大纲）

- `renderMarkdown(text, options)`：~80 行自实现 markdown 渲染器，支持 # 标题 / **粗体** / *斜体* / `inline code` / `- list` / ``` codeblock ``` / `[text](url)` 链接；支持 `maxHeadingLevel` clamp + `breaks` + `allowHtml` 选项；返回 html + sections[] + counts（headings/paragraphs/codeBlocks/links）。
- `extractMarkdownOutline(text, maxDepth=3)`：从 sections 过滤 level<=maxDepth，保留 index 稳定。
- `buildRichTextToolbar()`：8 个 toolbar action（bold/italic/code/h1/h2/list/link/codeblock），每个含 id/label/shortcut/before/after/placeholder。
- HTML 集成：textarea + 工具栏 8 按钮（点击在选区前后插入 wrap）+ 渲染按钮（输出 `.md-frame` 预览 + 统计 badge）+ 大纲按钮（输出 hierarchical 列表）。
- vm sandbox 兼容：3 个新函数通过 Object.assign + typeof guard 注入。

## V51 Web IndexedDB 真实迁移（schema + adapter + migration script）

- `buildIndexedDbSchema()`：3 表（projects/tags/undo）+ 5 索引（updatedAt/mode/stage + projectIds multiEntry + createdAt）；dbName `novel-ma` v1。
- `buildIndexedDbAdapter()`：8 个 operation 名（open/list/get/put/delete/migrate-from-localStorage/export/import）+ fallbackStorageKey `novel-ma:artifacts` + ready flag + warnings（不支持 IDB / 0 stores）。
- `buildMigrationScript()`：source（localStorage/memory/json/csv）+ target（indexedDb/localStorage/json）+ steps[]（读 → 校验 schemaVersion → 打开 IDB → 逐项 put → 校验导入数 → 保留 source fallback）+ dryRun flag + 估算 durationMs。
- HTML 集成：3 个 inline 按钮（schema/adapter/migration），复用 `.diff-summary` + `.wizard-steps` 风格。
- vm sandbox 兼容：3 个新函数通过 Object.assign + typeof guard 注入。

## V50 Web CLI 项目同步（File API + parseArtifactIndex + planArtifactSync）

- `parseArtifactIndex(files)`：批量解析 `{path, json}[]`，坏 JSON 进 `issues`（reason: `json: ...`），缺少 `projectId` 也进 issues；正常 artifact 进 `items`。
- `planArtifactSync(files, options)`：在 parseArtifactIndex 基础上加 acceptModes 白名单 + rejectStages 黑名单 + maxBytes 软上限；返回 scannedFiles/importedCount/issuesCount/byMode/byStage/oldestSavedAt/newestSavedAt。
- HTML 集成：textarea 支持 JSON 数组或 `path|json` 行格式，2 个 inline 按钮（解析 + 同步计划），复用 `.diff-summary` + `.list` 风格。
- vm sandbox 兼容：2 个新函数通过 Object.assign + typeof guard 注入。

## V49 Web Agent Pipeline 时间线 + Trace 视图

- `buildPipelineTimelineSvg(steps)`：横向 Gantt SVG，6 个角色（planner/worldbuilder/writer/editor/continuity/test），按 `durationMs/maxDuration` 归一化 bar 宽度，按 status 着色（pending 灰/running 蓝/done 绿/failed 红/skipped 灰）。
- `buildAgentTraceView(trace)`：把 AgentTrace 结构压缩成视图（durationMs = endedAt - startedAt、artifactCount、artifactKeys[]、outputExcerpt 前 120 字）。
- HTML 集成：2 个 inline 按钮（pipeline 时间线 + writer trace），SVG 渲染到 `.svg-frame`，trace 渲染为 badge + note。
- vm sandbox 兼容：2 个新函数通过 Object.assign + typeof guard 注入。

## V48 Web PWA（manifest + sw.js + 离线能力评估）

- `buildPwaManifest()`：生成标准 W3C manifest（含 name/shortName/startUrl/display/themeColor/backgroundColor/icons[]），默认 192/512 双尺寸。
- `buildServiceWorkerPlan()`：cache name、strategy（cache-first/network-first/stale-while-revalidate）、precacheFiles、runtimePatterns、fallback；默认 cacheName `novel-ma-v1`。
- `renderServiceWorkerScript(plan)`：字符串模板生成 sw.js（install/activate/fetch 三个 listener + caches API + 离线 fallback），零依赖、~1.2KB。
- `assessOfflineCapability({manifest, plan, storageQuotaMb})`：检查 manifest/sw/precache/runtime/存储配额 + 4 类 warning（missing/precache 超 30/quota 不足 20MB）。
- 真实落地：`apps/web/manifest.webmanifest` + `apps/web/sw.js` 已生成；HTML 端 `<link rel="manifest">` + `navigator.serviceWorker.register('sw.js')`（vm sandbox 用 typeof guard 兼容）。
- HTML 集成：3 个 inline 按钮（生成 manifest / 生成 sw.js / 离线评估），显示 manifest JSON、sw.js 代码、capability 报告。

## V47 Web 写作辅助（每日目标 + 写作热力图 + 番茄钟 + 撤销栈）

- `computeDailyGoal(history, target)`：聚合今日字数、连击天数（streakDays）、今日进度和 tone 着色（pass/warn/fail）；支持跨日连击，跳过今天未达标从昨天起算。
- `buildHeatmapSvg(history, weeks, options)`：仿 GitHub contribution graph，weeks × 7 单元 = N 个格子，每格强度按 `words/target` 归一化，绿色 rgba 透明度，灰色空格子，自带 `<title>` tooltip。
- `planFocusSession(durationMin, options)`：番茄钟规划，clamp 5~180 分钟，按 25 分钟/休息自动算 breaks，默认目标 `durationMin × 30` 字。
- `planUndoEntry(before, after, label, options)`：撤销栈条目结构（id/createdAt/before/after/label），HTML 端可序列化到 localStorage。
- HTML 集成：4 个 inline 控件（每日目标/热力图/番茄钟/撤销），复用 `.svg-frame` + `.diff-summary` badge 风格。
- 修复 `computeDailyGoal` 旧 bug：原 while 循环逻辑只在 dayWords 恰好为 0 时跳到昨天，导致今天未达标直接 break，streakDays 永远 0；改为 for 循环 365 步 + 双分支条件。

## V46 Web Diff 可视化 + 导入向导交互

- `buildDiffView(left, right)`：自实现 LCS（最长公共子序列）算法做行级 diff，返回 `lines`（equal/add/remove 三态）+ `added/removed/unchanged` 计数 + `similarity` 比例（0~1）。零依赖实现，~50 行。
- `buildImportWizard(rawJson)`：5 步流水线（parse → validate → normalize → preview → commit），每步返回 ok 状态 + body + hint；JSON parse 失败时阻断 commit；schemaVersion≠2 时自动归一化并加 warning。
- HTML 集成：双 textarea + Diff 按钮 → 行级染色视图（绿/红/灰）+ similarity badge + 加减统计；JSON 输入框 + 向导按钮 → 5 步卡片视图（CSS counter 自增编号），失败步骤红色边框。
- vm sandbox 兼容：2 个函数通过 `Object.assign` + typeof guard 注入。

## V45 Web 项目库增强（IndexedDB 迁移 + 版本树 + 标签 + 全文搜索）

- `buildRevisionTree(items)`：按 projectId 分组生成树状版本节点，origin root + 按 savedAt 排序的 revision children，parentId 链向上一个节点；纯函数可在 CLI 和 Web 共用。
- `buildTagIndex(items, tagsByProject?)`：合并显式 tag + 推断 tag（`mode:theme`、`stage:completed`、`risk:overdue`、`health:recovered`），返回 tags/byProject/byTag 三视图。
- `searchProjectsIndexed(items, query)`：9 字段（title/mode/stage/chapterTitle/characters/foreshadowing/style/chapterSummary/continuationContext）全文索引，按字段加权打分（title 10 / character+foreshadowing 6 / 其他 3），返回带 excerpt 的命中排序。
- `planIndexedDbMigration(items)`：估算 `JSON.stringify(items).length*2` 字节数，对比 localStorage 5MB 软上限，返回 ready flag + warnings + store/index 名。
- HTML 集成：搜索框 + 版本树按钮 + 标签索引按钮 + IDB 迁移计划按钮，4 个 inline 视图。
- vm sandbox 兼容：4 个新函数通过 `Object.assign` + typeof guard 注入。
- 修复 `buildRevisionTree` 旧 bug：原 `prev.children.push` 把节点链成线性链表而非 siblings，改为 `previousId` 链 + 全部 push 到 root.children。

## V44 Web 可视化层（SVG 图谱 / 人物弧线 / 章节节奏）

- `buildForeshadowingGraphSvg(items)`：从 artifacts 收集去重伏笔，按 recovered/open/overdue/missing 4 色渲染圆形节点（极坐标布局），节点间用 4-4 dasharray 虚线连接，返回 `<svg>` markup string。
- `buildCharacterArcSvg(artifacts)`：每个 artifact 一个折线点（蓝 #2563eb），x 轴按 chapter 平铺，y 轴按 arcIndex 偏移，文本标签取 `outline[0].title || chapterTitle`。
- `buildChapterPacingSvg(artifacts)`：最多 8 个章节柱图（绿 #16a34a），bar 高度按 `wordCount ?? summaryLen*6` 归一化，文本显示章节标题（前 6 字）和字数。
- `svgEscape()`：HTML/XML 转义 `& < > " '` 为 entity，防止恶意 title 注入 SVG。
- HTML 集成：3 个 inline 按钮 + `.svg-frame` 主题感知容器 + `.svg-grid` 响应式网格，4 套主题通过 `currentColor` + `var()` 自动适配。
- vm sandbox 兼容：3 个 SVG 函数通过 `Object.assign` + typeof guard 注入。

## V43 Web 章节正文编辑器 + 续写上下文侧栏

- `buildChapterContext(artifact)`：从 artifact 提取角色（含出场次数）/ 伏笔（recovered/open/overdue/missing 状态）/ 文风指纹 / 最近章节摘要。
- `computeWordStats(text, target)`：准确统计 Han 字符 + 拉丁词数（先剥离 Han 后再按 `[\p{L}\p{N}]+` 切分，避免 Han 被 `\p{L}` 重复计入），返回 wordCount / remaining / progress / tone。
- `planChapterSave(artifact, body)`：生成 rollback token、fingerprint（`fp-<hex>` 哈希）、bodyWordDelta、storageKey（`novel-ma:artifacts`）。
- `buildChapterEditor({artifact, body, target, revisions})`：聚合上面三者，返回编辑器完整状态模型。
- `appendChapterRevision(revisions, body)`：保存后追加版本记录，最多保留 10 条（FIFO 淘汰）。
- HTML 集成：textarea + 字数徽章 + 进度条（目标/完成度/tone 着色）+ 续写上下文三卡片（角色 / 伏笔 / 文风）+ 历史版本折叠列表。
- 自动保存到 localStorage（`novel-ma:artifacts`）：点击"保存到项目库"按钮后 currentArtifact 立即更新，editorRevisions 追加。
- vm sandbox 兼容：`buildChapterEditor / computeWordStats / planChapterSave / buildChapterContext / appendChapterRevision` 通过 `Object.assign` + typeof guard 注入。

## V42 Web 交互式工作流面板（替代 pre 输出 JSON）

- `buildInteractivePanel(kind, payload)` 把 5 个核心面板（quality / provider-readiness / longform-os / narrative-analytics / foreshadowing）从 JSON 文本升级为带 badges + progress / bar / list / tree / metric / note 6 类 section 的组件视图。
- Web 端新增 `renderInteractivePanel()` DOM 渲染器：按 tone（pass/warn/fail/info）着色进度条、徽章、列表项，支持原始 JSON details 折叠查看。
- 6 大改写按钮：续写质量 / 伏笔评分 / Provider 实战 / 长篇工程 OS / 叙事分析，全部从 pre 输出转为专用组件视图。
- vm sandbox 兼容：shorthand 属性 `buildInteractivePanel` 通过 `Object.assign` + typeof guard 注入，避免 vm context 抛 ReferenceError。
- Theme-aware CSS：所有 panel badge / progress / bar / list / tree / metric 都走 `var(--bg/panel/text/border/accent)`，4 套主题自动适配。

## V41 Web 可发现性重塑（导航 + 默认视图 + Onboarding）

- 顶部 tab 导航：总控台 / 新建 / 项目库 / 质量 / 全方向 / 帮助 六张切换卡，按主题分块切换 `.grid > section` 显隐。
- 默认视图：刷新页面进入「总控台」（所有 section 可见），其他 view 过滤隐藏不相关卡片。
- 3 步 Onboarding 弹窗：首次访问显示「主题创作 → 续写 → 总控台」三步引导，每步含 CLI 锚点和一键跳转。
- 帮助浮层：按 `?` 打开 / `Esc` 关闭，列出 10 个快捷键（g d / g n / g l / g q / g h / ? / Esc / Ctrl+S / Ctrl+E / Ctrl+Shift+D）。
- Vim 风格导航：连续按 `g d` / `g n` / `g l` / `g q` / `g h` 在视图间跳转（800ms 窗口）。
- Onboarding 状态持久化：localStorage key `novel-ma:onboarding-dismissed`，关闭后不再打扰。
- 纯函数 + vm sandbox 兼容：`buildWebNavigation / buildWebOnboarding / buildWebHelp / buildWebDefaultView` 全部走 `packages/cli/src/web-studio.ts`，CLI 单元测试和 vm HTML 渲染测试都能复用。

## V35-V40 新增能力

- V35 Verify Pages Script：生成 `npm run verify:pages` 对应的 root、Web、TUI marker 检查脚本模型。
- V36 Provider Live Smoke Executor：把 provider smoke 从请求计划升级为 env-live-or-mock 执行器，脱敏 Authorization 并保留 mock fallback。
- V37 Real Artifact Workspace Loader：从真实 artifact JSON 路径列表构建 workspace，坏文件进入 issues，不阻断有效项目。
- V38 Multi-Agent Pipeline Runner：把 planner/writer/editor/continuity/test 转成可执行 agent-runner 命令和产物列表。
- V39 Longform Risk Scoring：为长篇 Project OS 增加伏笔逾期、开放循环、风格漂移等风险评分。
- V40 Web Editing Persistence：编辑结果生成 persist-revision 计划、diff、rollback token 和 searchable catalog update。

## V34 新增能力

- Product Closure Hub：把后续 1-6 方向收束为首页可见总控台，统一展示真数据写作、持久化、Provider、Pages、Project OS、多 Agent 流水线状态。
- Workspace Persistence Plan：明确 localStorage 项目库的 import/export/merge/cleanup 动作和 refresh-safe、bad-entry-isolated、schema-normalized 保障。
- Provider Live Smoke Result：在请求计划之外提供 smoke 结果模型，脱敏 Authorization 并记录 pass/fail diagnostics。
- Pages Acceptance Checks：把 root、`/apps/web/`、`/apps/tui/` marker 检查建模为可执行验收结果。
- Agent Collaboration Pipeline：planner → writer → editor → continuity → test 五角色流水线，最终 artifact 标记 accepted。
- Longform Project OS 聚合：把分卷、章节版本树、人物弧、伏笔台账、风格圣经纳入 closure hub。

## V33 新增能力

- Web 真数据项目浏览器：按 `.novel-ma/projects/<id>/artifact.json` 组织 artifact 路径、有效项目和坏文件 issues，并给出 inspect/catalog/search 命令。
- Web Artifact Editor：把章节标题、人物、伏笔、风格做成可编辑模型，编辑后生成 revision history。
- 质量修复 patch：根据未回收伏笔和当前正文生成 rewrite patch、missing 列表和 revision note。
- TUI 命令路由：从 shared surface contract 生成可执行命令，`continue` 自动带 `--quality-artifact`。
- Provider live request：Web 侧生成 OpenAI-compatible chat completions 请求计划，并脱敏 Authorization。
- GitHub Pages 验收计划：生成 root、`/apps/web/`、`/apps/tui/` 的线上检查 URL 和 marker。

## V32 新增能力

- Web-first Studio Hub：把 Dashboard、Artifact Library Pro、Continuation Studio、Provider Console、Narrative Analytics 收敛到首页主入口。
- Web Project Dashboard：展示项目数、最近项目、质量分、伏笔健康度和继续写作/质量修复/版本对比快捷动作。
- Artifact Library Pro：支持模式过滤、语义搜索索引、标签过滤和 diff picker 候选集。
- Continuation Studio：将已有章节、记忆、伏笔、风格、续写草稿和 repair suggestion 拆成可读面板。
- TUI Interactive Shell：`apps/tui/index.html` 从静态对齐表升级为交互式 shell 预览，命令菜单镜像 Web 主流程。
- Shared Surface Contract：Web/TUI 共享 action contract，避免 CLI/Web/TUI 后续能力漂移。

## V31 新增能力

- CLI/Web/TUI 功能对齐矩阵：14 个 CLI 命令统一映射到 Web 工作台和 TUI 模式，避免多入口漂移。
- Web 模式新增“CLI/Web/TUI 功能对齐”和“TUI 模式预览”入口，可直接生成对齐矩阵和 TUI 面板文本。
- TUI 模式新增 `apps/tui/index.html` 静态终端面板，覆盖 new、continue、provider、artifact、continuation-check 等 CLI 能力。
- `packages/cli/src/mode-parity.ts` 提供共享矩阵、Web 面板渲染和 TUI 面板渲染，CLI/TUI/Web 后续都可复用。

## V30 新增能力

- Artifact Import Studio：批量导入前输出 schema diff、导入预览和 rollback token。
- Longform Project OS：把分卷、章节、人物弧线、伏笔台账和风格圣经组织为统一项目 OS。
- Quality Repair Loop：从续写质量评分生成 rewrite suggestion、repair paragraph 和 revision note。
- Provider Live Runtime：支持 mock/live 模式、openai-compatible endpoint 诊断、token 成本估算和 fallback。
- Flue Workflow Runner：把 premise→bible→outline→draft→critique→revise→memory 计划升级为可回放 timeline。
- Desktop File Bridge：模拟桌面壳本地目录、artifact 文件树、离线缓存和导入导出权限。
- Collaboration Pack：生成协作 bundle、review notes、冲突列表和合并策略。
- Narrative Analytics：统计人物出场、伏笔周期、章节节奏、文风漂移和可视化诊断项。
- Publishing Pipeline：生成 Markdown/EPUB 文件清单、metadata manifest 和发布前检查。
- Agent Studio：展示 planner/worldbuilder/writer/critic/memory agent 的输入输出 trace。

## V29 新增能力

- Artifact 真实导入向导：校验 JSON/schema，输出导入步骤和修复建议。
- 续写质量面板：在 Web 主界面展示 characters/foreshadowing/style 子分数。
- 本地项目库清理面板：按 latest/history 生成 dry-run prune manifest，不直接删除。
- Provider 实战面板：显示 mock/openai-compatible readiness、模型和脱敏诊断。
- Flue Workflow 适配：输出 premise→bible→outline→draft→critique→revise→memory 节点计划。
- 桌面壳准备度：检查 local-file-open、localStorage-library、json-download、offline-workbench。
- 长篇工程化控制台：暴露分卷规划、章节版本树、人物弧线、伏笔台账和风格圣经入口。

## V22-V28 新增能力

- Web 首页 Latest Catalog：项目目录索引主区域展示“最近项目 / latest / history”。
- Artifact Prune：默认 dry-run，`--apply` 才会删除重复历史，并先写 `prune-manifest-*.json`。
- Continue Quality Gate：`continue --quality-artifact <artifact.json>` 在续写前检查角色、伏笔和文风；失败需 `--force`。
- Diff 可读报告：`artifact-diff --format text` 输出人工审阅友好的字段变化列表。
- Search 高级检索：`artifact-search --latest-only`、`--mode theme|continuation` 支持最新视图与模式过滤。
- Web 双 Artifact 对比：首页可粘贴两个 artifact，输出 diff 和可读 report。
- Schema Guard：`artifact-export`/normalize 对 `schemaVersion: 2` 输入保持幂等，旧 NovelProject 自动归一化。

## V8-V14 新增能力

- Latest Catalog：按 `title + mode` 聚合重复项目，保留 latest/history。
- Schema Normalization：输出 `schemaVersion: 2` 的归一化 artifact snapshot。
- Artifact Diff CLI：比较两个 artifact 的标题、模式、章节和伏笔评分差异。
- Local Search：按标题、角色、伏笔、章节摘要搜索本地项目目录。
- Continuation Quality Gate：检查续写文本是否使用角色、伏笔和文风指纹。
- Web Catalog Helpers：Web 工作台暴露 latest/search/normalize/quality 纯函数。

## V7 新增能力

- Artifact Catalog：扫描 `.novel-ma/projects/**/artifact.json` 并生成稳定排序的项目摘要列表。
- 坏文件隔离：单个 artifact 解析失败会进入 `issues`，不影响其他项目索引。
- CLI 项目目录：`npm run cli -- artifact-catalog .novel-ma/projects` 输出 `{ items, issues }`。

## V6 新增能力

- 共享 Artifact Toolkit：`packages/core` 提供 artifact 导入校验、摘要、对比、记忆图谱和内存项目库 contract。
- CLI Artifact 检查：`npm run cli -- artifact-inspect <artifact.json>` 输出 summary、memory graph 计数和 validation。
- Web/CLI 语义对齐：核心 artifact 操作可复用，减少内联脚本和 CLI 行为漂移。

## V5 新增能力

- Web 本地项目库：artifact 可保存、打开、删除、导出。
- Artifact 导入与对比：支持粘贴 JSON 并比较标题、模式、章节、伏笔评分差异。
- 章节编辑续写闭环：在 Web 里编辑章节后直接生成下一章 artifact。
- 真实 LLM CLI 适配：`npm run cli -- provider-smoke "提示词"`，无 key 自动 mock fallback；`npm run cli -- provider-doctor` 输出脱敏配置诊断。
- 章节版本树：`artifact-version-tree` 可把 outline/import/revision 组织成父子版本链，便于追踪多轮改稿。
- 记忆卡片与关系图：artifact 内包含角色/伏笔/文风 graph。
- 主题切换：light/dark/sepia/nord 四套主题，首页主区域可见。
- GitHub Pages：`.github/workflows/pages.yml` 可部署 `apps/web` 静态工作台；根 `index.html` 兼容 legacy Pages，并跳转到 `apps/web/`。

## V4 新增能力

- Web 本地 Artifact 工作台：`apps/web/index.html` 可直接在浏览器打开。
- 支持根据主题生成标准 artifact 预览，并下载 JSON。
- 支持粘贴已有章节生成续写 artifact，自动识别中文章号。
- 支持伏笔清单 recovered/open/overdue/missing 评分并写入预览。

## V3 新增能力

- 真实 LLM Provider 适配：OpenAI-compatible provider + deterministic mock fallback。
- 结构化章节导入：Markdown/纯文本章节解析为标准 chapter records。
- 伏笔回收评分：输出 recovered/open/overdue/score/revisionAdvice。
- Web 工作台：`apps/web/index.html` 提供主题创建、篇章续写、伏笔评分本地预览。
- GitHub Actions CI：`.github/workflows/ci.yml` 自动运行 install/check/test/build/coverage/readme verification。

## V2 新增能力

- 续写上下文构建：融合最近章节摘要、角色状态、伏笔记忆和风格指纹。
- 续写草稿约束：Writer Agent 在续写模式下显式使用 `续写目标 / 前文摘要 / 记忆约束 / 风格指纹`。
- 验收门禁：新增 `coverage:incremental` 与 `verify:readme`，用于验证增量覆盖率和 README 命令可交付。

## Web 工作台（`apps/web/`）

零依赖、单文件 HTML（约 62 KB）的浏览器端工作台，不发起网络请求、不依赖 CDN、不需要后端服务。本地直接打开或通过 GitHub Pages 访问。

### 打开方式

```bash
# 推荐：npm 脚本（跨平台，走 scripts/open.mjs）
npm run web

# 等价 CLI 快捷方式 — 同一份二进制有四种调用形式：
npm run cli -- web           # 经 npm 脚本调用
novel-ma web                  # 当 ./node_modules/.bin 在 PATH 中（npm workspaces 自动创建软链）
npx novel-ma web              # 经 npx 调用 — 在仓库内任意目录都可用
npm exec novel-ma web         # npm exec 的等价形式

# 等价 CLI 快捷方式（flag 形式，同样四种调用形式）
npm run cli -- --web
novel-ma --web
npx novel-ma --web
npm exec novel-ma --web

# `web` / `tui` 快捷方式支持透传给 scripts/open.mjs 的 opener flag：
novel-ma web --print-url      # 只打印解析后的 file:// URL，不实际启动浏览器
novel-ma web --no-launch      # --print-url 的别名
```

所有启动方式都走 `scripts/open.mjs`，它会按候选列表逐个尝试：

| 平台 | 候选顺序 |
| --- | --- |
| macOS | `open <path>` |
| Windows | `powershell Start-Process <path>` → `cmd /c start "" <path>` |
| Linux (WSL) | `wslview <path>`（如已安装）→ `explorer.exe <win-path>` → `explorer.exe <wsl-path>` |
| Linux（原生） | `sensible-browser` → `firefox` → `chromium` → `google-chrome` → `microsoft-edge` → `xdg-open` |

当所有候选都返回非零退出码时，opener 打印解析后的 `file://` URL 并 `exit 1`，你可以把它粘贴到宿主机浏览器（headless WSL 上常见，`explorer.exe` 与 `xdg-open` 都找不到默认浏览器）。

### 主题切换（Header）

首页工具栏暴露 4 套主题，无需刷新即可切换：

`light` · `dark` · `sepia` · `nord`

### Web 面板（自上而下）

1. **根据主题创建** — 输入主题，生成 artifact 草案。
2. **根据已有篇章续写** — 粘贴章节，构建续写上下文。
3. **伏笔回收评分** — 对伏笔清单输出 recovered/open/overdue/score。
4. **Artifact 导入与对比** — 粘贴 JSON 与当前预览对比。
5. **导入两个 Artifact 对比** — 双 artifact 可读 Diff。
6. **导入项目库 Bundle** — 合并导出 bundle 到 localStorage 项目库。
7. **Artifact 真实导入向导** — schema 校验 + 修复建议。
8. **续写质量面板** — 角色 / 伏笔 / 文风子分数。
9. **本地项目库清理面板** — dry-run prune manifest（默认不删除）。
10. **Provider 实战面板** — mock / openai-compatible readiness 诊断。
11. **Flue Workflow 适配** — premise → bible → outline → draft → critique → revise → memory 计划。
12. **桌面壳准备度** — Electron / Desktop shell 检查。
13. **长篇工程化控制台** — Longform Project OS 概览。
14. **V30 panels** — Artifact Import Studio、Longform Project OS、Quality Repair Loop、Provider Live Runtime、Flue Workflow Runner、Desktop File Bridge、Collaboration Pack、Narrative Analytics、Publishing Pipeline、Agent Studio。
15. **CLI/Web/TUI 功能对齐** — Mode Parity 矩阵（同时显示 `novel-ma mode-parity` / `novel-ma tui` 引用）。
16. **V32 Web-first Studio Hub / V32 TUI Interactive Shell / V33 Web Product Ops / V34 Product Closure Hub / V35-V40 Execution Suite** — 总控 / 闭环面板。
17. **TUI 模式预览** — 内嵌链接到 `apps/tui/`。
18. **本地项目库 / 项目目录索引 / Artifact 预览输出** — 保存列表、latest/history 索引、JSON 预览与下载。

### Web Header 工具栏

- **主题切换** `<select>` — light / dark / sepia / nord。
- **保存到本地项目库** — 把当前预览写入 localStorage。
- **导出项目库** — 把项目库打包为可下载 JSON。

### Web ↔ CLI 对照表

每个 Web 面板都映射到 CLI 命令，Mode Parity 矩阵是这套映射的唯一真源：

| Web 面板 | CLI 命令 |
| --- | --- |
| 根据主题创建 | `novel-ma new "<theme>" --chapters N --words N` |
| 根据已有篇章续写 / Quality Repair Loop | `novel-ma continue <file> --words N`（加 `--quality-artifact <artifact>` 触发质量门禁） |
| Provider 实战面板 / Provider Live Runtime | `novel-ma provider-doctor` · `novel-ma provider-smoke "<prompt>"` |
| Artifact 真实导入向导 | `novel-ma artifact-inspect <artifact.json>` |
| 项目目录索引 / 最近项目 | `novel-ma artifact-catalog .novel-ma/projects [--enrich]` · `novel-ma artifact-latest .novel-ma/projects` |
| 本地项目库 / Narrative Analytics | `novel-ma artifact-search .novel-ma/projects <query> [--latest-only] [--mode theme\|continuation]` |
| Artifact Import Studio | `novel-ma artifact-normalize <artifact.json>` |
| Publishing Pipeline | `novel-ma artifact-export <artifact.json>` |
| Longform Project OS / 章节版本树 | `novel-ma artifact-version-tree <artifact.json>` |
| 本地项目库清理面板 | `novel-ma artifact-prune .novel-ma/projects --keep N [--apply]`（默认 dry-run） |
| 导入两个 Artifact 对比 | `novel-ma artifact-diff <left> <right> --format text` |
| 续写质量面板 / Quality Repair Loop | `novel-ma continuation-check <artifact.json> <text>` |

## TUI 交互式面板（`apps/tui/`）

浏览器渲染的静态终端面板，镜像 Web-first Studio Hub，适合截图分享、打印成 cheat sheet，或作为 14 个 CLI 命令的速查表。

### 打开方式

```bash
# 推荐：npm 脚本（跨平台，走 scripts/open.mjs）
npm run tui

# 等价 CLI 快捷方式 — 同一份二进制有四种调用形式：
npm run cli -- tui           # 经 npm 脚本调用
novel-ma tui                  # 当 ./node_modules/.bin 在 PATH 中（npm workspaces 自动创建软链）
npx novel-ma tui              # 经 npx 调用 — 在仓库内任意目录都可用
npm exec novel-ma tui         # npm exec 的等价形式

# 等价 CLI 快捷方式（flag 形式，同样四种调用形式）
npm run cli -- --tui
novel-ma --tui
npx novel-ma --tui
npm exec novel-ma --tui

# `tui` / `web` 快捷方式支持透传给 scripts/open.mjs 的 opener flag：
novel-ma tui --print-url      # 只打印解析后的 file:// URL，不实际启动浏览器
novel-ma tui --no-launch      # --print-url 的别名
```

所有启动方式都走 `scripts/open.mjs`；平台候选矩阵与 headless WSL 回退行为见 Web 工作台章节。

### TUI 面板区

- **Interactive Shell · Web-first Studio Mirror** — 可选动作（Dashboard / Library / Continue / Provider / Analytics / Shell / Contract），按键提示 `↑/↓ 选择动作 · Enter 生成命令 · w 打开 Web 工作台 · q 退出`，并预渲染命令样例。
- **Mode Parity · CLI/Web/TUI 功能对齐** — 14 命令 × 3 入口矩阵的 checklist。

### TUI 命令速查（与 `apps/tui/` 中显示一致）

```text
novel-ma artifact-latest .novel-ma/projects
novel-ma artifact-catalog .novel-ma/projects --enrich
novel-ma continue <file> --quality-artifact <artifact>
novel-ma provider-doctor && novel-ma provider-smoke <prompt>
novel-ma artifact-search .novel-ma/projects <query>
novel-ma tui                  # 打开 TUI Interactive Shell 面板（走 scripts/open.mjs）
novel-ma --tui                # flag 形式别名，等价于 `novel-ma tui`
novel-ma web                  # 打开 Web 工作台（走 scripts/open.mjs）
novel-ma --web                # flag 形式别名，等价于 `novel-ma web`
novel-ma mode-parity          # 打印 CLI/Web/TUI 对齐矩阵（Mode Parity 契约）
```

`novel-ma mode-parity` 由 `packages/cli/src/mode-parity.ts` 暴露，是 Mode Parity 契约的真正源。

`web` / `tui` / `--web` / `--tui` 快捷方式支持 `--print-url` / `--no-launch` 透传给 `scripts/open.mjs`。在任何平台上当所有浏览器启动器都返回非零退出码时，opener 会打印解析后的 `file://` URL 并 `exit 1`，你可以把它粘贴到宿主机浏览器。

## Mode Parity（CLI / Web / TUI 对齐矩阵）

三入口共享同一份 14 命令能力集，矩阵由 `packages/cli/src/mode-parity.ts` 生成，是任何入口变更前的强制检查项。

```text
[x] new                    web:根据主题创建 / V30 Longform Project OS            tui:Create Novel
[x] continue               web:根据已有篇章续写 / Quality Repair Loop            tui:Continue Novel
[x] provider-smoke         web:Provider 实战面板 / Provider Live Runtime         tui:Provider Smoke
[x] provider-doctor        web:Provider 实战面板                                 tui:Provider Doctor
[x] artifact-inspect       web:Artifact 真实导入向导                            tui:Artifact Inspect
[x] artifact-catalog       web:项目目录索引 / 最近项目                          tui:Artifact Catalog
[x] artifact-latest        web:项目目录索引 / 最近项目                          tui:Artifact Latest
[x] artifact-search        web:本地项目库 / Narrative Analytics                 tui:Artifact Search
[x] artifact-normalize     web:Artifact Import Studio                           tui:Artifact Normalize
[x] artifact-export        web:Publishing Pipeline                              tui:Artifact Export
[x] artifact-version-tree  web:Longform Project OS / 章节版本树                  tui:Version Tree
[x] artifact-prune         web:本地项目库清理面板                                tui:Artifact Prune
[x] artifact-diff          web:导入两个 Artifact 对比                            tui:Artifact Diff
[x] continuation-check     web:续写质量面板 / Quality Repair Loop               tui:Continuation Check
```

## GitHub Pages

`.github/workflows/pages.yml` 会部署 `apps/web/` 工作台和 `apps/tui/` 面板。把 Pages 切到 **workflow 模式** 后，push 到 `main`/`master` 或手动运行 workflow 即可。

- 在线工作台：`https://<owner>.github.io/novel-multi-agent/apps/web/`
- TUI 镜像：`https://<owner>.github.io/novel-multi-agent/apps/tui/`
- 旧根 `index.html` 自动跳转到 `apps/web/`。

## CI

`.github/workflows/ci.yml` 在每次 push / PR 到 `main` 时执行 `npm ci → check → test → build → coverage:incremental → verify:readme`。`verify:readme` 会按本 README 列出的命令逐条重放，文档漂移会在 CI 阶段暴露。

## CLI 用法

从主题创建短篇项目：

```bash
npm run cli -- new "月球图书馆的守夜人与失忆AI" --chapters 3 --words 900
```

根据已有篇章续写：

```bash
npm run cli -- continue examples/existing-chapters.md --words 900
```

检查已导出的 artifact：

```bash
npm run cli -- artifact-inspect .novel-ma/projects/<project-id>/artifact.json
```

列出本地 artifact 项目目录：

```bash
npm run cli -- artifact-catalog .novel-ma/projects
npm run cli -- artifact-catalog .novel-ma/projects --enrich
npm run cli -- artifact-latest .novel-ma/projects
npm run cli -- artifact-search .novel-ma/projects 月球
npm run cli -- artifact-search .novel-ma/projects 月球 --latest-only
npm run cli -- artifact-search .novel-ma/projects 月球 --mode theme
npm run cli -- artifact-version-tree .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-diff .novel-ma/projects/<left>/artifact.json .novel-ma/projects/<right>/artifact.json --format text
npm run cli -- artifact-prune .novel-ma/projects --keep 1
```

输出默认写入 `.novel-ma/projects/<project-id>/artifact.json`。

## V1 能力边界

- 默认使用确定性本地 agent，便于无 API key 验收。
- LLM/Flue runtime 接入预留在 `.flue/` 和 `packages/agents` 接口层，后续可替换为真实模型。
- V1 不包含 GUI，但存储结构兼容后续 Web/Electron 工作台。
