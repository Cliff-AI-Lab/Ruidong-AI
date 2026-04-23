# AI 开发效能监管工具 - 使用说明

## 一、工具简介

本工具用于监管 AI 辅助开发过程中的 Token 消耗和开发效能。通过解析 Claude Code / Codex 等工具的原始会话数据，自动检测:

- **重复对话**: 跨会话反复提出相同或相似的问题
- **UI 返工**: 同一文件被反复修改（建了又改、改了又建）
- **Tool 搅动**: 同一命令反复执行（调试循环、命令失败重试）
- **Token 浪费**: 单次输出过大、Cache 未命中、对话膨胀
- **综合效能评分**: 0-100 分五维度打分（S/A/B/C/D 五个等级）

---

## 二、三层架构

```
  +---------------------------------------------------------+
  |  Tier 3: 本能 (Instinct) - 无需调用，自动触发            |
  |  Hooks 自动运行于 Claude Code 的每次交互中               |
  |  - Token 超限预警: 单次 >10K 或累计 >50K 自动警告       |
  |  - 返工预警: 同一文件修改 3+ 次自动提醒                  |
  +---------------------------------------------------------+
  |  Tier 2: 技能 (Skills) - 按需调用                        |
  |  在 Claude Code 中输入斜杠命令即可调用                   |
  |  /dev-monitor  /token-report  /duplicate-check           |
  |  /efficiency-score  /session-review  /rework-check       |
  +---------------------------------------------------------+
  |  Tier 1: 记忆 (Memory) - 被动采集                        |
  |  analyzer.py 读取 ~/.claude/ 下的原始数据                |
  |  会话 JSONL / history.jsonl / stats-cache.json           |
  +---------------------------------------------------------+
```

**记忆**层是数据基础，只读不写；**技能**层是主动分析工具，按需调用；**本能**层是自动监管，无需人工干预。

---

## 三、安装（一键）

### 方法 1: 运行安装脚本

双击 `setup.bat`，自动完成:
1. 检测 Python 环境
2. 将 6 个 Skills 安装到 `~/.claude/skills/`（全局生效）
3. 将 `/dm` 快捷命令安装到 `~/.claude/commands/`
4. 创建必要的数据目录

### 方法 2: 手动安装

将 `skills/` 下的每个子目录复制到 `~/.claude/skills/`:

```
复制 skills/dev-monitor/       -> ~/.claude/skills/dev-monitor/
复制 skills/token-report/      -> ~/.claude/skills/token-report/
复制 skills/duplicate-check/   -> ~/.claude/skills/duplicate-check/
复制 skills/efficiency-score/  -> ~/.claude/skills/efficiency-score/
复制 skills/session-review/    -> ~/.claude/skills/session-review/
复制 skills/rework-check/      -> ~/.claude/skills/rework-check/
```

安装后重启 Claude Code，Skills 即刻生效。

---

## 四、在 Claude Code 中使用（推荐）

安装完成后，在任何项目的 Claude Code 中都可以直接使用以下斜杠命令:

### /dev-monitor - 快速体检

```
> /dev-monitor
```

一键运行效能总览 + 效能评分，适合**每次开始或结束工作时**快速查看。

输出示例:
```
Sessions: 21 | Messages: 10398
Total output tokens: 181.8K
Cache hit rate: 90.7%
Efficiency Score: 58/100 [D]
Top issues: Duplicate rate 71.5%, Rework files: 11
```

### /token-report - Token 用量报告

```
> /token-report
```

输出内容:
- 总体统计: 会话数、消息数、使用时长
- 模型分布: 各模型的 Input/Output/Cache 用量
- 每日趋势: 最近 7 天的 Token 输出趋势图
- Cache 效率: 缓存命中率评估
- 活跃时段: 最常使用 AI 的时间段

### /duplicate-check - 重复对话检测

```
> /duplicate-check
```

输出内容:
- 重复率: 所有 prompt 中重复的百分比
- 精确重复: 跨会话完全相同的 prompt 列表
- 模糊匹配: 相似度 >= 75% 的 prompt 对
- 浪费估算: 重复对话消耗的 Token 估算

### /efficiency-score - 效能评分

```
> /efficiency-score
```

五维度打分 (满分 100):

| 维度 | 最大扣分 | 检测内容 |
|------|---------|---------|
| 重复对话 | -20 | 跨会话重复提问 |
| 返工 | -20 | 文件被修改 3+ 次 |
| Tool 搅动 | -15 | 同一命令反复执行 |
| Cache 未命中 | -10 | 缓存利用率低 |
| Token 膨胀 | -15 | 每消息 Token 过高 |

评级: S(>=90) A(>=80) B(>=70) C(>=60) D(<60)

### /session-review - 会话复盘

```
> /session-review
```

分析最近一次会话的完整效能数据:
- Token 明细: Input/Output/Cache 分解
- Tool 使用: 各工具调用次数和分布
- 返工文件: 哪些文件被反复修改
- 会话内重复: 同一会话内的重复提问
- API 错误: 重试和失败次数

### /rework-check - 返工检测

```
> /rework-check
```

检测最近 10 个会话中被反复修改的文件:
- 标记 UI 文件 (.tsx/.jsx/.vue/.html/.css)
- 计算返工浪费的 Token
- 按修改次数排序展示

### /dm - 万能入口

```
> /dm                     # 等同于 /dev-monitor
> /dm token-report        # 等同于 /token-report
> /dm efficiency-score    # 等同于 /efficiency-score
```

---

## 五、命令行使用

如果不在 Claude Code 中，可以直接用命令行:

```bash
# 快速总览
python analyzer.py overview

# Token 用量报告（最近 7 天）
python analyzer.py token-report --days 7

# 重复对话检测
python analyzer.py duplicate-check

# 效能评分
python analyzer.py efficiency-score

# 会话复盘（最近一次）
python analyzer.py session-review

# 指定会话复盘
python analyzer.py session-review --session b7a619ad

# 返工检测
python analyzer.py rework-check

# JSON 输出（供程序使用）
python analyzer.py efficiency-score --json
```

### 快捷批处理（加入 PATH 后）

```
dm              # 快速总览
dm-token 14     # 14天 Token 报告
dm-dup          # 重复检测
dm-score        # 效能评分
dm-review       # 会话复盘
dm-rework       # 返工检测
dm-help         # 查看所有命令
```

将 `<你的安装目录>` 加入系统 PATH，即可在任何位置使用。

---

## 六、启用自动监管（Tier 3 本能）

自动监管通过 Claude Code 的 Hooks 机制实现，需要手动配置一次。

### 配置方法

编辑 `~/.claude/settings.json`（全局生效）或项目下的 `.claude/settings.local.json`，添加 `hooks` 字段:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python \"<你的安装目录>/hooks/post_message_hook.py\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python \"<你的安装目录>/hooks/rework_alert_hook.py\""
          }
        ]
      }
    ]
  }
}
```

### 自动监管行为

配置后，以下行为**自动生效**，无需手动调用:

| 触发时机 | 行为 | 阈值 |
|---------|------|------|
| 每次 Claude 回答后 | 记录 Token 用量到 live-tally.jsonl | 始终 |
| 单次输出 > 10,000 tokens | 警告 "[Token Spike]" | 可调 |
| 会话累计输出 > 50,000 tokens | 警告 "[Session Alert]" | 可调 |
| 文件被 Write/Edit 3+ 次 | 警告 "[Rework Alert]" | 可调 |
| UI 文件被修改 3+ 次 | 额外提示返工风险 | 可调 |

### 自定义阈值

编辑 `hooks/post_message_hook.py` 顶部:
```python
TOKEN_SPIKE_THRESHOLD = 10000   # 单次输出 Token 上限
SESSION_TOKEN_ALERT = 50000     # 会话累计 Token 上限
```

编辑 `hooks/rework_alert_hook.py` 顶部:
```python
REWORK_THRESHOLD = 3            # 触发返工警告的修改次数
```

---

## 七、在 Codex 中使用

OpenAI Codex 可以通过 `agents.md` 文件集成:

1. 将 `agents.md` 复制到你的项目根目录
2. Codex 启动时会读取该文件作为智能体规则
3. 智能体会在工作前后自动检查效能指标

或者在 Codex 中手动运行:
```
python "<你的安装目录>/analyzer.py" overview
```

---

## 八、数据来源说明

本工具**只读**以下 Claude Code 数据文件，不做任何写入:

| 文件位置 | 内容 | 用途 |
|---------|------|------|
| `~/.claude/projects/**/SESSION.jsonl` | 每条消息的 Token 用量、Tool 调用、模型信息 | 核心数据源 |
| `~/.claude/history.jsonl` | 所有 prompt 文本 + 时间戳 | 重复对话检测 |
| `~/.claude/stats-cache.json` | 按日聚合的统计数据 | 快速概览 |
| `~/.claude/sessions/*.json` | 活跃会话索引 | 会话定位 |

工具产生的数据存储在:
- `data/live-tally.jsonl` - 实时 Token 记录（Hooks 写入）
- `hooks/.state/` - Hook 状态文件（会话级编辑计数）

---

## 九、效能评分解读

### 评分公式

```
最终得分 = 100 - 重复罚分 - 返工罚分 - 搅动罚分 - 缓存罚分 - 膨胀罚分
```

### 各维度详解

**重复对话罚分** (最高 -20)
- 计算: `min(20, 重复率% x 0.4)`
- 含义: 71.5% 重复率 = 满扣 20 分
- 优化: 使用 CLAUDE.md 持久化上下文，避免跨会话重复提问

**返工罚分** (最高 -20)
- 计算: `min(20, 返工文件数 x 3)`
- 含义: 7+ 个返工文件 = 满扣 20 分
- 优化: 写代码前先明确需求，用设计稿指导 UI 开发

**Tool 搅动罚分** (最高 -15)
- 计算: `min(15, 搅动率% x 0.3)`
- 含义: 同一 Bash 命令执行 3+ 次
- 优化: 命令失败时先分析原因，不要盲目重试

**Cache 未命中罚分** (最高 -10)
- 计算: `min(10, (100 - 缓存命中率%) x 0.15)`
- 含义: 缓存命中率越高越好（90%+ 为优秀）
- 优化: 保持 System Prompt 稳定，使用长会话

**Token 膨胀罚分** (最高 -15)
- 计算: `min(15, max(0, 每消息Token数 - 5000) / 1000)`
- 含义: 平均每消息超过 5000 Token 开始扣分
- 优化: 将大任务拆分为小步骤

---

## 十、最佳实践

### 日常工作流

1. **开始工作时**: 运行 `/dev-monitor` 查看效能状态
2. **工作过程中**: Hooks 自动监控，出现预警时注意调整
3. **完成工作后**: 运行 `/efficiency-score` 复盘本次效能

### 提升效能的关键方法

| 问题 | 解决方案 |
|------|---------|
| 重复率高 | 在 CLAUDE.md 中记录已完成的工作和关键决策 |
| 返工多 | 动手前先描述清楚完整需求，附上参考图/代码 |
| Tool 搅动 | 命令失败后先诊断原因，不要盲目重试 |
| Cache 低 | 避免频繁切换不同话题，保持会话聚焦 |
| Token 膨胀 | 把"帮我做一个XXX系统"拆成多个具体小任务 |

### 团队使用

每位开发者安装此工具后，可以定期导出 JSON 报告对比效能:
```bash
python analyzer.py efficiency-score --json > my-score.json
```

---

## 十一、文件结构

```
<你的安装目录>\
|
|-- analyzer.py              核心分析引擎（纯 Python，无依赖）
|-- setup.bat                一键安装脚本
|-- CLAUDE.md                Claude Code 智能体治理规则
|-- agents.md                Codex 智能体配置
|-- 使用说明.md               本文档
|-- install-hooks.md         Hooks 安装指南
|
|-- skills/                  Tier 2: Skills 源文件
|   |-- dev-monitor/SKILL.md
|   |-- token-report/SKILL.md
|   |-- duplicate-check/SKILL.md
|   |-- efficiency-score/SKILL.md
|   |-- session-review/SKILL.md
|   +-- rework-check/SKILL.md
|
|-- hooks/                   Tier 3: 自动监管脚本
|   |-- post_message_hook.py   Token 追踪 + 超限预警
|   |-- rework_alert_hook.py   文件返工检测
|   +-- .state/                状态文件（自动创建）
|
|-- data/                    输出数据
|   +-- live-tally.jsonl       实时 Token 记录（自动创建）
|
+-- dm*.bat                  命令行快捷入口
    |-- dm.bat               万能入口
    |-- dm-overview.bat      快速总览
    |-- dm-token.bat         Token 报告
    |-- dm-dup.bat           重复检测
    |-- dm-score.bat         效能评分
    |-- dm-review.bat        会话复盘
    +-- dm-rework.bat        返工检测
```

---

## 十二、常见问题

**Q: 安装后 Claude Code 看不到 Skills?**
A: 重启 Claude Code。Skills 安装到 `~/.claude/skills/` 后需要重新加载。

**Q: 只有 Claude Code 能用吗?**
A: 不是。命令行 `python analyzer.py` 在任何终端都能用。`agents.md` 可以给 Codex 用。Skills 是 Claude Code 专属。

**Q: 会修改我的 Claude Code 数据吗?**
A: 不会。工具只读 `~/.claude/` 下的数据，自己的数据存在 `data/` 和 `hooks/.state/`。

**Q: 为什么我的重复率这么高?**
A: `/resume` 等命令和 SSH key 粘贴也被统计为 prompt。真正的重复对话看"精确重复"中超过 3 次的条目。

**Q: 效能评分 D 怎么改善?**
A: 运行 `/efficiency-score` 看具体扣分项，优先解决扣分最大的维度。通常是重复对话和返工两项。
