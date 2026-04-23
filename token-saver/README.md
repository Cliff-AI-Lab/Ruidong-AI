<div align="center">

# 🚀 Token Saver

**A closed-loop efficiency toolkit for Claude Code** · *Diagnose → Capture → Package → Share*

*Save 30%+ tokens per interaction and turn individual lessons into team-wide Skills.*

[![Skills](https://img.shields.io/badge/Skills-15_Total-58A6FF?style=for-the-badge&labelColor=0D1117)](#three-toolsets)
[![Savings](https://img.shields.io/badge/Token_Saving-30%2B%25-00D4AA?style=for-the-badge&labelColor=0D1117)](#b-token-saving-solve)
[![Claude Code](https://img.shields.io/badge/For-Claude_Code-7B61FF?style=for-the-badge&labelColor=0D1117)](https://claude.com/claude-code)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge&labelColor=0D1117)](#-license)

[Features](#three-toolsets) · [Quick Start](#-quick-start) · [Team Rollout](#-team-rollout) · [FAQ](#-faq) · [🇨🇳 中文](#-中文) · [Detailed Doc (CN)](USAGE_CN.md)

</div>

---

## The Closed Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Daily Claude Code usage                                   │
│         ↓                                                   │
│   ① /dev-monitor — diagnose                                 │
│      └─ Surface issues (score D/C, one dimension bleeding)  │
│         ↓                                                   │
│   ② /capture-lessons — encode the lesson                    │
│      └─ Auto-analyze deductions + data + root cause → MD    │
│         ↓                                                   │
│   ③ /skillify — package (auto-chained from ②)               │
│      └─ MD → complete Skill bundle with install scripts     │
│         ↓                                                   │
│   ④ Share the ZIP with your team                            │
│      └─ Teammates unzip + one-click install                 │
│         ↓                                                   │
│   ⑤ Next time the same scenario arises                      │
│      └─ Claude auto-references the lesson, no re-stumble    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Three Toolsets

### A. Diagnostic Skills (find problems)

| Command | Purpose | Data source |
|---------|---------|-------------|
| `/dev-monitor` | Quick overview + efficiency score | ~/.claude/projects/*.jsonl |
| `/token-report` | Token usage distribution | stats-cache.json |
| `/duplicate-check` | Cross-session duplicate detection | history.jsonl |
| `/rework-check` | File-level rework detection | session JSONL |
| `/efficiency-score` | 5-dimension composite score | all data |
| `/session-review` | Deep single-session review | target session |

All commands rely on `analyzer.py` (the core analysis engine).

### B. Token-Saving Skills (solve)

| Command | When to run | Savings |
|---------|-------------|---------|
| `/cache-master` | Start of long sessions | 30-40% |
| `/smart-route` | Before a new task (pick model) | ~50% |
| `/plan-first` | Before writing code | ~25% |
| `/session-compress` | End of a session | ~20% |
| `/context-budget` | When the session slows down | diagnostic |
| `/output-control` | When you need terse output | 10-15% |

Plus the **rule layer**: append `TOKEN_SAVER_RULES.md` to CLAUDE.md — 7 auto-active rules (30-40% savings).

### C. Knowledge-Capture Skills (share)

| Command | Purpose |
|---------|---------|
| **`/capture-lessons`** | Diagnostic result → structured lesson MD (the loop's keystone) |
| **`/skillify`** | MD → shareable Skill ZIP with install scripts |
| `/token-saver-guide` | Complete usage guide (bundled as a Skill) |

`/skillify` uses a **Skill + script** hybrid architecture:
- `SKILL.md` (3KB) — tells Claude *when* to trigger
- `skillify.py` (12KB) — deterministic packaging logic, also callable standalone

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Cliff-AI-Lab/Ruidong-AI.git
cd Ruidong-AI/token-saver
```

### 2. Install (3 minutes)

**Windows**: double-click `install.bat`

**Mac/Linux**:

```bash
chmod +x install.sh && ./install.sh
```

After install:
- All Skills land in `~/.claude/skills/`
- `skillify.py` ships with the skillify Skill
- `analyzer.py` ships with the diagnostic Skills

### 3. Append token-saving rules (strongly recommended)

```bash
cat TOKEN_SAVER_RULES.md >> /path/to/your/project/CLAUDE.md
```

### 4. Configure hooks (optional, auto-monitoring)

Edit `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [{
          "type": "command",
          "command": "python \"<install-path>/token-saver/hooks/file_read_gate.py\""
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "python \"<install-path>/token-saver/hooks/rework_alert_hook.py\""
        }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "python \"<install-path>/token-saver/hooks/post_message_hook.py\""
        }]
      }
    ]
  }
}
```

### 5. Restart Claude Code

---

## Daily Usage Patterns

### Pattern A — One-shot diagnose → encode

```
You: /dev-monitor
Claude: [shows score]
       Score 57/100 [D]
       Top deductions: rework -18, duplicates -20

You: /capture-lessons
Claude: [analyzes and drafts the lesson MD]
       Generated ./lessons/2026-04-17-ui-rework-lessons.md
       Package as a shareable Skill now? (Y/N)

You: Y
Claude: [auto-invokes skillify]
       ✓ Skill packaged: ./shared-skills/ui-rework-lessons-skill.zip
       Ready to share with your team.
```

### Pattern B — Continuous accrual → weekly share

```
Mon-Fri: /session-compress at end of day → writes summary to CLAUDE.md
Fri: /dev-monitor → view weekly trend
Fri: /capture-lessons → encode the week's 1-2 sharpest lessons
Fri: /skillify → package and post to team chat
Next week: everyone can call the new Skills.
```

### Pattern C — Proactive writeup (no bad score needed)

```
You: I figured out a great way to debug DB migrations today — notes at ./notes/db-migration-tips.md
You: /skillify
Claude: [prompts for name / description / author]
       ✓ Packaged db-migration-tips-skill.zip
```

---

## 🏁 Team Rollout

### Week 1 — Everyone installs
- Admin distributes this repo's `token-saver/` folder
- Each member runs the installer
- Each member appends `TOKEN_SAVER_RULES.md` to their project's CLAUDE.md

### Week 2 — Build the diagnosis habit
- Daily `/dev-monitor` at end of day
- When the same dimension bleeds 3 days in a row → `/capture-lessons`
- Low scorers learn from high scorers via the platform leaderboard

### Week 3 onward — Accrue and share
- Every member ships ≥1 `/skillify`-packaged Skill per week
- Team Skill library grows 20+ per month
- New hires `install all shared skills` on day one

---

## 📦 Project Structure

```
token-saver/
├── README.md                       ← you are here
├── USAGE_CN.md                     ← detailed Chinese doc (11 sections)
├── TOKEN_SAVER_RULES.md            ← rules to append to CLAUDE.md
├── install.bat / install.sh        ← one-click installers
├── analyzer.py                     ← diagnostic engine
│
├── shareable-skills/               ← token-saving + knowledge-capture
│   ├── cache-master/
│   ├── smart-route/
│   ├── plan-first/
│   ├── session-compress/
│   ├── context-budget/
│   ├── output-control/
│   ├── capture-lessons/            ← lesson encoding
│   └── skillify/
│       ├── SKILL.md
│       └── skillify.py             ← standalone packaging script
│
├── diagnostic-skills/              ← health-check Skills
│   ├── dev-monitor/
│   ├── token-report/
│   ├── duplicate-check/
│   ├── rework-check/
│   ├── efficiency-score/
│   └── session-review/
│
├── hooks/                          ← auto-monitoring hooks
│   ├── file_read_gate.py
│   ├── post_message_hook.py
│   └── rework_alert_hook.py
│
└── _old-docs/                      ← archived legacy docs
```

---

## ❓ FAQ

**Q: 15 commands seems like a lot — can I install only some?**
A: Yes. The installer is all-in by default, but you can cherry-pick:

```bash
cp -r shareable-skills/smart-route ~/.claude/skills/
cp -r diagnostic-skills/dev-monitor ~/.claude/skills/
```

**Q: The MD from `/capture-lessons` feels too templated.**
A: Hand-edit it with your own specifics and code snippets, then run `/skillify` to package.

**Q: Can I share a single captured-lesson Skill even if my teammates don't have Token Saver?**
A: Yes — every `/skillify` bundle ships with its own installer and has no runtime dependency on Token Saver.

**Q: How do I measure impact?**
A: Run `/efficiency-score` before install and again after 1-2 weeks; compare the total score and the per-dimension deductions.

**Q: Does this work outside Claude Code?**
A: The diagnostics parse Claude Code / Codex session JSONL. The `TOKEN_SAVER_RULES.md` rules also partially apply to Cursor / Aider.

---

## 🏷️ Version

- Version: **V9.2** (with `/capture-lessons`)
- Total Skills: **15** (6 diagnostic + 6 saving + 3 capture)
- Bundle size: ~45 KB
- All parsing is 100% local — no session content is ever uploaded

---

## 🤝 Contributing

PRs and issues welcome!

[![GitHub](https://img.shields.io/badge/GitHub-Cliff--AI--Lab-58A6FF?style=for-the-badge&logo=github&logoColor=white&labelColor=0D1117)](https://github.com/Cliff-AI-Lab)

## 📄 License

Licensed under the **MIT License** — see [LICENSE](LICENSE).

---

<br/>

<div align="center">

## 🇨🇳 中文

# Token Saver — 装进 Claude Code 的 AI 开发效能闭环工具包

### 体检 · 封装 · 打包 · 团队复用

</div>

<br/>

## 完整闭环

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   日常使用 Claude Code                                       │
│         ↓                                                   │
│   ① /dev-monitor 体检                                       │
│      └─ 发现问题（评分 D/C，某项高扣分）                     │
│         ↓                                                   │
│   ② /capture-lessons 封装教训                               │
│      └─ 自动分析扣分项+数据+根因 → 生成结构化 MD             │
│         ↓                                                   │
│   ③ /skillify 打包（上一步可自动联动）                       │
│      └─ MD → 完整 Skill 包（含 install 脚本）                │
│         ↓                                                   │
│   ④ 分享 ZIP 给团队                                          │
│      └─ 同事解压 + 一键安装                                  │
│         ↓                                                   │
│   ⑤ 下次同场景下调用新 Skill                                 │
│      └─ Claude 自动引用教训，避免重复踩坑                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 三组工具

### A. 体检工具（发现问题）

| 命令 | 功能 | 数据源 |
|------|------|--------|
| `/dev-monitor` | 快速总览 + 效能评分 | ~/.claude/projects/*.jsonl |
| `/token-report` | Token 用量分布 | stats-cache.json |
| `/duplicate-check` | 跨会话重复检测 | history.jsonl |
| `/rework-check` | 文件返工检测 | session JSONL |
| `/efficiency-score` | 五维度综合评分 | 所有数据 |
| `/session-review` | 单会话深度复盘 | 指定 session |

所有命令依赖 `analyzer.py`（核心分析引擎）。

### B. 省 Token 工具（解决问题）

| 命令 | 时机 | 节省 |
|------|------|------|
| `/cache-master` | 开始长会话时 | 30-40% |
| `/smart-route` | 新任务前选模型 | ~50% |
| `/plan-first` | 动手写代码前 | ~25% |
| `/session-compress` | 结束会话前 | ~20% |
| `/context-budget` | 会话慢时诊断 | 诊断型 |
| `/output-control` | 需精简输出时 | 10-15% |

加上**规则层**：`TOKEN_SAVER_RULES.md` 追加到 CLAUDE.md，7 条规则自动生效（30-40% 节省）。

### C. 知识沉淀工具（沉淀分享）

| 命令 | 功能 |
|------|------|
| **`/capture-lessons`** | 体检结果 → 结构化教训 MD（闭环关键） |
| **`/skillify`** | MD → 可分享 Skill ZIP（含 install 脚本） |
| `/token-saver-guide` | 完整使用说明 |

`/skillify` 采用 **Skill + 脚本** 混合架构：
- `SKILL.md`（3KB）让 Claude 理解何时触发
- `skillify.py`（12KB）确定性完成打包，也可 CLI 直用

## 快速开始

**1. 克隆仓库**

```bash
git clone https://github.com/Cliff-AI-Lab/Ruidong-AI.git
cd Ruidong-AI/token-saver
```

**2. 安装（3 分钟）**

Windows：双击 `install.bat`；Mac/Linux：`chmod +x install.sh && ./install.sh`

**3. 追加省 Token 规则**

```bash
cat TOKEN_SAVER_RULES.md >> /path/to/your/project/CLAUDE.md
```

**4. 配置 Hook（可选）** — 见上方英文版 `settings.json` 示例

**5. 重启 Claude Code**

## 日常使用模式

- **模式 A**：一次性体检 → `/dev-monitor` → `/capture-lessons` → `/skillify` 打包
- **模式 B**：每日 `/session-compress` 积累；周五体检 + 封装 + 分享
- **模式 C**：主动整理笔记 → `/skillify` 直接打包

## 团队推广路径

- **第 1 周**：全员装工具 + 追加 `TOKEN_SAVER_RULES.md`
- **第 2 周**：养成 `/dev-monitor` 习惯；连续扣分 → `/capture-lessons`
- **第 3 周起**：每周每人至少 1 条 `/skillify` Skill；团队 Skill 库每月 +20

## 常见问题

**Q：命令多，能只装一部分吗？** A：手动 `cp -r` 对应子目录到 `~/.claude/skills/` 即可。

**Q：`/capture-lessons` 生成的 MD 太模板化？** A：手动补充你的具体经验再 `/skillify`。

**Q：同事没装也能用我分享的 Skill 吗？** A：能，每个包都自带独立 install，无依赖。

**Q：怎么度量效果？** A：安装前后各跑 `/efficiency-score`，对比总分和扣分。

**Q：除 Claude Code 还支持什么？** A：体检解析 Claude Code / Codex；规则层在 Cursor / Aider 中也部分适用。

## 版本

- 版本：**V9.2**（含 `/capture-lessons`）
- 总 Skill 数：**15**（体检 6 + 省Token 6 + 沉淀 3）
- 包大小：~45 KB · 数据 100% 本地解析，不上传任何会话内容

---

<div align="center">

### 🔗 Links

[![iRuidong](https://img.shields.io/badge/🌐_iRuidong-iruidong.com-F59E0B?style=for-the-badge&labelColor=0D1117)](https://iruidong.com/)
[![Ruidong-AI](https://img.shields.io/badge/📦_Ruidong--AI-GitHub-58A6FF?style=for-the-badge&labelColor=0D1117)](https://github.com/Cliff-AI-Lab/Ruidong-AI)
[![X](https://img.shields.io/badge/🐦_X-@RaytoneAI-1DA1F2?style=for-the-badge&labelColor=0D1117)](https://x.com/RaytoneAI)

<br/>

<sub>

**Token Saver** — Turn every Claude Code session into team-wide leverage.

**睿动 Token 效能检测** — 把每次 Claude Code 会话都变成团队杠杆。

</sub>

<br/>

Copyright &copy; 2026 Cliff AI Lab. All rights reserved.

</div>
