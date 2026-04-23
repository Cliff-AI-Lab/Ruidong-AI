---
name: plan-first
description: "Zero-rework workflow — runs a pre-flight check before any multi-file task to prevent rework. Based on the behavior of high-score sessions with zero rework files. Use before starting feature implementation to save ~25% tokens from avoided iterations."
---

# /plan-first - 零返工工作流

从零返工高效会话中提炼的"先计划后动手"模式。

## 核心原理

一次说清完整需求 = 一次编辑
追加三次小修改 = 三次编辑（3 倍 Token）

## 使用方式

当用户调用 `/plan-first` 时：

1. 询问：下一个任务是什么？涉及修改哪些文件？

2. 做 4 项飞行前检查：

**Pre-flight Checklist**

| 检查项 | 状态 |
|-------|------|
| 需求描述完整性 | ✓/△/✗ |
| 涉及文件已读取 | ✓/△/✗ |
| 边界情况考虑 | ✓/△/✗ |
| 预期输出格式明确 | ✓/△/✗ |

3. 如有 △ 或 ✗，询问澄清问题：
   - "需求中 X 的预期行为是什么？"
   - "Y 文件当前的结构如何？要不要我先读一下？"
   - "错误情况下应该如何处理？"

4. 任何涉及 3+ 文件的任务，强烈建议用 Plan Mode（`EnterPlanMode`）：
   - "这个任务涉及 5 个文件，建议先进入 Plan Mode 制定完整方案。"

5. UI 相关任务，追问设计规范：
   - "这是 UI 改动。有设计稿/参考图吗？"

6. 全部 ✓ 后才允许开始实施，否则先回到步骤 3。

## 适用场景

- 开始任何跨文件的编码任务前
- 需求描述比较模糊时
- 发现自己正在反复修改同一文件时（及时暂停用此 Skill 复盘）
