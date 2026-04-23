---
name: session-compress
description: "Compresses the current session's decisions and progress into a compact summary for CLAUDE.md. Run before ending a long session to preserve context without re-explaining next time. Saves ~20% tokens in follow-up sessions."
---

# /session-compress - 会话压缩保存

从低重复率高效会话中提炼：每次会话结束前固化上下文，避免下次重新解释。

## 使用方式

1. 分析本次会话完成了什么：
   - 修改/创建了哪些文件？
   - 做了什么设计决策？
   - 尝试过哪些方案被否决？
   - 当前状态（已完成 vs 剩余）？

2. 生成压缩摘要：

```markdown
## Session Summary — [日期]

### Completed
- [做完的事情，bullet]

### Key Decisions
- [决策]: [理由]（避免下次重复讨论）

### Current State
- [哪些能用，哪些还没完成]

### Next Steps
- [下次会话从哪继续]

### Files Changed
- [文件列表 + 一行说明]
```

3. 询问保存位置：
   - **A) 追加到项目 CLAUDE.md**（推荐 — 下次会话自动加载）
   - **B) 保存到 Claude memory**（跨项目持久化）
   - **C) 仅显示，由我手动处理**

4. 若保存到 CLAUDE.md，追加到 `## Session History` 小节下。只保留最近 3 次摘要避免 CLAUDE.md 膨胀。

5. 告诉用户：
   - "下次会话 Claude 会自动看到这段上下文，无需重新解释。"
