---
name: capture-lessons
description: "Run efficiency diagnostics and automatically convert findings into a reusable lessons-learned MD file, ready to be packaged with /skillify. Use after a bad session (low score) or at session end to turn pain into shareable team knowledge. Closes the loop: diagnose → extract lessons → share."
---

# /capture-lessons - 教训封装器

把 `/dev-monitor` / `/session-review` 等体检工具发现的问题，**自动转换成结构化教训 MD**，作为 `/skillify` 的输入。

这是 **"体检 → 封装 → 分享" 闭环的中间环节**。

## 工作流程

### Step 1: 运行体检（如果还没跑过）

如果用户还没跑过体检，先调用：

```bash
python ~/.claude/skills/capture-lessons/analyzer.py session-review --json
python ~/.claude/skills/capture-lessons/analyzer.py efficiency-score --json
```

或者调用已安装的 skill:
- `/dev-monitor` — 快速总览
- `/session-review` — 会话详情
- `/rework-check` — 返工文件
- `/duplicate-check` — 重复对话

### Step 2: 分析体检输出

找出 **主要扣分项**（penalty ≥ 5 的维度）：

| 维度 | 扣分 | 说明 |
|------|------|------|
| duplicate | 重复对话率 | 跨会话反复问同样问题 |
| rework | 文件返工 | 同文件 3+ 次修改 |
| tool_churn | 工具搅动 | 同命令反复失败执行 |
| cache_miss | 缓存未命中 | Cache Hit Rate < 80% |
| token_bloat | Token 膨胀 | 每消息 > 5000 tokens |

### Step 3: 生成教训 MD

根据扣分项和具体数据（被返工的文件列表、重复的 prompt、失败的命令），生成结构化 MD：

```markdown
# {场景名} 教训复盘 — {日期}

> 来自 /dev-monitor 体检结果 · 评分 {score}/{grade}

## 踩到的坑

### 坑 1: {维度名} ({扣分}分)
**现象**: {具体数据，如 "Efficiency.tsx 被修改 8 次"}

**根因分析**: {为什么会这样}
- {原因 1}
- {原因 2}

**损失**: 约 {N} tokens

### 坑 2: ...

## 应避免的做法

```
✗ {反面做法示例}
```

## 推荐做法

```
✓ {正面做法示例}
```

## 下次遇到 {场景} 时的 checklist

- [ ] {具体可操作的一条}
- [ ] {具体可操作的一条}
- [ ] {具体可操作的一条}
```

### Step 4: 询问下一步

把生成的 MD 展示给用户后询问：

```
教训 MD 已生成，保存路径: ./lessons/{name}-lessons.md

下一步（三选一）：
1) 立即用 /skillify 打包成可分享的 Skill
2) 先保存到 ./lessons/，待积累后再打包
3) 直接追加到项目 CLAUDE.md
```

### Step 5: 若用户选 1）,自动联动 /skillify

调用 skillify.py（已随 Token Saver 安装）：

```bash
python ~/.claude/skills/skillify/skillify.py \
    --source "./lessons/{name}-lessons.md" \
    --name "{lesson-name}" \
    --description "{自动生成描述，含'遇到{场景}时调用'}" \
    --author "{用户名}" \
    --install --json
```

返回 ZIP 路径 + 安装确认，完成 **体检 → 封装 → 打包 → 分享** 的完整闭环。

## 典型场景示例

```
用户: /capture-lessons

Claude: [先运行 /dev-monitor]
       评分 57/100 [D]
       主要扣分:
       - 返工 -18 (Efficiency.tsx 被改 8 次)
       - 重复 -20 (72% duplicate rate)

       发现 2 个典型教训，我帮你封装成 MD:

       [生成] ./lessons/ui-rework-lessons.md
       
       内容:
       - 坑 1: UI 迭代没出设计稿就动手 (8次返工)
         根因: 缺少设计规范，跟 Claude 沟通靠口述
         损失: ~15K tokens
       - 坑 2: 跨会话重复讨论同一架构 (72% 重复)
         根因: 没用 /session-compress 保存结论

       下一步？

用户: 1

Claude: [调用 skillify.py]
       ✓ 已打包为 ui-rework-lessons Skill
       ZIP: ./shared-skills/ui-rework-lessons-skill.zip
       本机已装: /ui-rework-lessons

       现在团队任何人动 UI 前调用 /ui-rework-lessons,
       Claude 会自动加载你总结的坑点,避免再踩。
```

## 完整闭环

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. 日常开发 → 每天结束 /dev-monitor 体检                 │
│     └─ 评分低? 有扣分项?                                  │
│                                                          │
│  2. /capture-lessons                                     │
│     └─ 自动分析扣分项 + 数据 + 根因                       │
│     └─ 生成结构化教训 MD                                  │
│                                                          │
│  3. /skillify (自动联动)                                  │
│     └─ 教训 MD 打包成 Skill                               │
│                                                          │
│  4. 发 ZIP 给团队                                         │
│     └─ 同事一键装 → /{lesson-name}                        │
│                                                          │
│  5. 下次遇到类似场景,Claude 自动引用教训                   │
│     └─ 不再踩同样的坑                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 为什么需要这一层

- **体检工具** 告诉你"哪儿差了" — 但不记录"为什么"和"下次怎么避免"
- **教训 MD** 把一次性的数据转成 **可复用的行为指南**
- **skillify 打包** 让教训对团队可见、可调用、可版本化
