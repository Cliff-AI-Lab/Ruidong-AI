---
name: context-budget
description: "Estimates current conversation token budget and suggests trimming. Use when sessions feel slow or when you want to understand where tokens are going. Identifies context bloat before it becomes expensive."
---

# /context-budget - 上下文预算分析

从 Token 效率优秀的会话中提炼的上下文管理法：定期诊断上下文花销。

## 使用方式

1. 估算当前上下文组成：

```
Context Budget Estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
System prompt + CLAUDE.md:  ~[X]K tokens
Conversation history:       ~[X]K tokens ([N] turns)
Tool results cached:        ~[X]K tokens
Active file contents:       ~[X]K tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total estimated:            ~[X]K tokens
Cache hit rate:             ~[X]%
```

2. 识别最大消耗者（按估算大小排序的 top 3 项）。

3. 给出具体裁剪建议：

**立即可做（无需改变行为）**:
- CLAUDE.md > 2K token：建议清理旧的 Session Summary
- 同一文件被 Read 3+ 次：依赖已缓存内容
- 对话 > 30 轮：开启专注新会话

**行为级优化**:
- Prompt 平均 > 200 token：建议更简洁
- Claude 输出冗长：在 CLAUDE.md 加"简洁回复"规则
- 一个会话多个主题：拆分为独立会话

4. 计算潜在节省:
```
应用建议后:
  当前:  ~[X]K tokens/轮
  优化后: ~[Y]K tokens/轮
  节省:  ~[Z]% per turn
```

5. 若已经精简，直接说"上下文已很精简，无需裁剪。"
