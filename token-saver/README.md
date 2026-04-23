<div align="center">

# 🚀 Token Saver

**一套装进 Claude Code 的 AI 开发效能完整闭环工具包**

*体检 → 教训封装 → 打包分享 → 团队复用 · 每次交互省 30%+ Token*

[![Skills](https://img.shields.io/badge/Skills-15_Total-58A6FF?style=for-the-badge&labelColor=0D1117)](#三组工具)
[![Savings](https://img.shields.io/badge/Token_Saving-30%2B%25-00D4AA?style=for-the-badge&labelColor=0D1117)](#b-省-token-工具解决问题)
[![Claude Code](https://img.shields.io/badge/For-Claude_Code-7B61FF?style=for-the-badge&labelColor=0D1117)](https://claude.com/claude-code)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge&labelColor=0D1117)](#-license)

[快速开始](#快速开始) · [三组工具](#三组工具) · [团队推广](#典型团队推广路径) · [FAQ](#常见问题) · [详细文档](USAGE_CN.md)

</div>

---

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

---

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

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Cliff-AI-Lab/Ruidong-AI.git
cd Ruidong-AI/token-saver
```

### 2. 安装（3 分钟）

**Windows**：双击 `install.bat`

**Mac/Linux**：

```bash
chmod +x install.sh && ./install.sh
```

安装完成后：
- 所有 Skill 装到 `~/.claude/skills/`
- `skillify.py` 脚本随 skillify Skill 一起安装
- `analyzer.py` 随体检 Skills 安装

### 3. 追加省 Token 规则（强烈推荐）

把 `TOKEN_SAVER_RULES.md` 内容追加到你项目的 `CLAUDE.md`：

```bash
cat TOKEN_SAVER_RULES.md >> /path/to/your/project/CLAUDE.md
```

### 4. 配置 Hook（可选，自动监控）

编辑 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [{
          "type": "command",
          "command": "python \"<解压路径>/token-saver/hooks/file_read_gate.py\""
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "python \"<解压路径>/token-saver/hooks/rework_alert_hook.py\""
        }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "python \"<解压路径>/token-saver/hooks/post_message_hook.py\""
        }]
      }
    ]
  }
}
```

### 5. 重启 Claude Code

---

## 日常使用模式

### 模式 A：一次性体检 → 封装

```
你: /dev-monitor
Claude: [展示评分]
       评分 57/100 [D]
       主要问题: 返工 -18, 重复 -20

你: /capture-lessons
Claude: [分析并生成教训 MD]
       已生成 ./lessons/2026-04-17-ui-rework-lessons.md
       要立即打包成可分享 Skill 吗? (Y/N)

你: Y
Claude: [自动调用 skillify]
       ✓ Skill 已打包: ./shared-skills/ui-rework-lessons-skill.zip
       现在可发给团队
```

### 模式 B：持续积累 → 定期分享

```
周一-周五: 每天结束 /session-compress 记录到 CLAUDE.md
周五: /dev-monitor 看本周趋势
周五: /capture-lessons 把本周最痛的 1-2 个教训封装
周五: /skillify 打包成 Skill 发到团队群
下周: 大家都能用你封装的新 Skill
```

### 模式 C：主动总结（不一定要有差评）

```
你: 我今天发现了一个调试 DB 迁移的好方法，整理了 ./notes/db-migration-tips.md
你: /skillify
Claude: [引导填写 name/description/author]
       ✓ 已打包 db-migration-tips-skill.zip
```

---

## 典型团队推广路径

### 第 1 周：全员安装
- 管理员把本仓 `token-saver/` 分发给团队
- 每人运行 install
- 追加 `TOKEN_SAVER_RULES.md` 到各自项目

### 第 2 周：养成体检习惯
- 每天结束跑 `/dev-monitor`
- 连续 3 天同一个维度扣分 → `/capture-lessons`
- 低分者向高分者学习（看平台排行榜）

### 第 3 周及之后：沉淀共享
- 每周五每人至少产出 1 条 `/skillify` Skill
- 团队 Skill 库每月累积 20+ 个
- 新人上手时直接 `install all shared skills`

---

## 目录结构

```
token-saver/
├── README.md                       ← 你正在读的文件
├── USAGE_CN.md                     ← 详细中文文档（11章）
├── TOKEN_SAVER_RULES.md            ← CLAUDE.md 规则
├── install.bat / install.sh        ← 一键安装
├── analyzer.py                     ← 体检核心引擎
│
├── shareable-skills/               ← 省 Token + 沉淀工具
│   ├── cache-master/
│   ├── smart-route/
│   ├── plan-first/
│   ├── session-compress/
│   ├── context-budget/
│   ├── output-control/
│   ├── capture-lessons/            ← 教训封装
│   └── skillify/
│       ├── SKILL.md
│       └── skillify.py             ← 独立打包脚本
│
├── diagnostic-skills/              ← 体检工具
│   ├── dev-monitor/
│   ├── token-report/
│   ├── duplicate-check/
│   ├── rework-check/
│   ├── efficiency-score/
│   └── session-review/
│
├── hooks/                          ← 自动监控 Hook
│   ├── file_read_gate.py
│   ├── post_message_hook.py
│   └── rework_alert_hook.py
│
└── _old-docs/                      ← 历史文档归档
```

---

## 常见问题

**Q: 装完后命令有点多，能只装一部分吗？**
A: 可以。安装脚本默认全装。手动只装一部分：

```bash
cp -r shareable-skills/smart-route ~/.claude/skills/
cp -r diagnostic-skills/dev-monitor ~/.claude/skills/
```

**Q: `/capture-lessons` 生成的 MD 看着太模板化怎么办？**
A: 生成后手动编辑加入你的具体经验和代码片段，然后再 `/skillify` 打包。

**Q: 我的团队没装这套工具，能只分享我封装的教训 Skill 吗？**
A: 能。`/skillify` 生成的每个包都自带 install 脚本，独立安装不依赖 Token Saver。

**Q: 怎么度量效果？**
A: 安装前后各跑一次 `/efficiency-score`，对比总分和扣分维度变化。

**Q: 除了 Claude Code 还支持其他工具吗？**
A: 体检部分解析的是 Claude Code / Codex 的 session JSONL；省 Token 规则（CLAUDE.md）在 Cursor / Aider 等兼容工具中也部分适用。

---

## 版本

- 版本：**V9.2**（含 `/capture-lessons`）
- 总 Skill 数：**15**（体检 6 + 省Token 6 + 沉淀 3）
- 包大小：~45 KB
- 数据完全本地解析，不上传任何会话内容

---

## 🤝 贡献

欢迎提交 PR 和 Issue！

[![GitHub](https://img.shields.io/badge/GitHub-Cliff--AI--Lab-58A6FF?style=for-the-badge&logo=github&logoColor=white&labelColor=0D1117)](https://github.com/Cliff-AI-Lab)

## 📄 License

本项目使用 **MIT License** — 可自由使用、修改、分享。

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
