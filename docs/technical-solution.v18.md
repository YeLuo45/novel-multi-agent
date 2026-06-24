# novel-multi-agent V18 Technical Solution: Web Latest Catalog Panel

## 方案概览

实现 `render latest catalog panel + helper functions`。Core 继续提供纯函数 contract；CLI 负责参数、文件扫描和 JSON 输出；Web 只追加零依赖 inline helper / 可见入口。

## 实现要点

- Core：扩展 artifact toolkit 的数据转换、质量报告、prune plan 或 repair suggestion。
- CLI：新增或扩展 command branch，默认输出紧凑 JSON。
- Web：暴露 helper 并让项目目录能力在首页可发现。
- 验证：synthetic fixture + real `.novel-ma/projects` smoke。
