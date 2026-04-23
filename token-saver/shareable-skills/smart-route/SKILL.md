---
name: smart-route
description: "Smart model routing — analyzes the next task and recommends Haiku/Sonnet/Opus to save up to 50% tokens. Use before starting any new task block to avoid paying Opus prices for routine work."
---

# /smart-route - 智能模型路由

从高效会话中提炼的模型选择策略。80% 的日常任务可用 Haiku 完成，成本仅 Opus 的 1/60。

## 使用方式

1. 询问用户下一个任务（或直接分析刚描述的任务）

2. 按复杂度分级：

**Level 1 — Haiku / Fast Mode（简单、例行）**
- 文件搜索、grep、glob
- 单行编辑、拼写修复、格式化
- 运行测试、查看构建输出
- 简单重命名/移动
- 读文件理解代码

**Level 2 — Sonnet（中等、多步）**
- 跨 2-3 个文件实现特性
- 代码审查 + Bug 修复
- 为已有代码写测试
- 需要调查的调试
- 单模块内重构

**Level 3 — Opus（复杂、架构型）**
- 设计新架构/系统
- 跨 5+ 文件的复杂重构
- 安全审查、性能优化
- 撰写设计文档/技术规范
- 跨模块集成变更

3. 输出推荐：

```
Task: [任务一句话概括]
Complexity: Level [1/2/3]
Recommended: [Haiku|Sonnet|Opus]
Switch command: /fast 或 /model sonnet 或 /model opus
Reason: [为什么选这个]
Est. saving vs Opus: [X%]
```

4. 如果用户当前在更贵的模型上做简单任务，明确提醒：
   - "你在 Opus 上做 Level 1 任务。输入 /fast 切换可省 ~80%。"

5. 任务模糊时默认推荐 Sonnet（最佳性价比）。
