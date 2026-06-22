# PRD v1: novel-multi-agent 多智能体小说创作系统

## 目标

交付一个本地可运行的多智能体小说创作系统骨架，支持根据主题生成小说，以及根据已有篇章续写下一章。

## 用户故事

1. 作为作者，我输入主题、章节数和目标字数，系统生成小说项目、故事圣经、章节目录、首章草稿、审校意见和修订稿。
2. 作为作者，我提供已有篇章，系统提取上下文、识别人物/伏笔/风格，并续写下一章。
3. 作为开发者，我可以替换 agent 实现为真实 LLM，而不改 core 状态机和 CLI。

## 功能范围

- 项目初始化：创建 project artifact。
- 多智能体流水线：intake、planner、worldsmith、outliner、writer、critic、revision、memory。
- 上下文构建：最近章节摘要、实体记忆、伏笔追踪、风格指纹。
- 续写模式：从 markdown/plain text 篇章中抽取上下文并生成下一章。
- 验收：typecheck、unit tests、build、bootstrap、continue smoke。

## 非目标

- V1 不实现 GUI。
- V1 不强依赖真实模型 API。
- V1 不做向量数据库，只提供可替换的内存检索接口。
