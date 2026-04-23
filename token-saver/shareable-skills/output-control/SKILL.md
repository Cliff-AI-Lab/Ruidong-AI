---
name: output-control
description: "Adds precise output constraints to the next response — length, format, structure. Saves 10-15% tokens by avoiding verbose prose when you just need the answer. Use when you want concise answers or structured data."
---

# /output-control - 输出控制器

从输出比率优秀的会话中提炼的响应精简模式。

## 使用方式

用户调用 `/output-control` 后，询问当前任务的期望输出形态，然后在本次响应中严格遵守：

### 模式选择

**1. 极简模式（Minimal）** — 只给答案，零解释
- 触发词: "简洁回答"、"只给代码"、"yes/no"
- 行为: 剥离所有解释性文字，只输出核心内容
- 示例: 用户问"这个函数对吗"→ 只回 "对" 或 "不对，X 行有问题"

**2. 结构化模式（Structured）** — JSON/表格/列表
- 触发词: "用 JSON/表格/bullet 回答"
- 行为: 严格按格式输出，前后无任何自然语言
- 示例:
```json
{"status": "ok", "issue": null}
```

**3. 限长模式（Bounded）** — 限制字数
- 触发词: "50字以内"、"一句话"、"限200token"
- 行为: 严格限制输出长度，超出则精简

**4. 代码优先模式（Code-only）**
- 触发词: "只给代码"、"no explanation"
- 行为: 只输出代码块，可附一行注释说明关键点

### 应用到 CLAUDE.md

若用户想让这些约束永久生效，追加到项目 CLAUDE.md:

```markdown
## Output Rules
- Default to concise responses
- When user asks yes/no, reply yes/no only
- Prefer JSON/table/bullet list over prose
- Skip "Here's what I'll do..." preambles
- Skip "Let me know if you need more..." closings
```

### 效果验证

一次对比:
- 未启用: 平均 800 token/响应
- 启用后: 平均 500 token/响应
- 节省: ~37%
