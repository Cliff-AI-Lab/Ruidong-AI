# Token Saver 使用说明

> 一套装进 Claude Code 的省 Token 工具包 + 团队知识沉淀闭环。
> 安装 3 分钟，每次交互省 30%+ Token，团队知识可复用。

---

## 一、为什么需要 Token Saver

AI Coding 工具（Claude Code、Cursor、Copilot 等）按 Token 计费，团队日常开发中存在大量可避免的 Token 浪费：

| 浪费类型 | 典型场景 | 浪费比例 |
|---------|---------|---------|
| 模型杀鸡用牛刀 | 搜索文件用 Opus，改个拼写用 Opus | 占总消耗 40-60% |
| 缓存未命中 | 频繁开新会话、中途改 CLAUDE.md | 占输入 30-40% |
| 重复上下文 | 每次会话重新解释项目背景和技术方案 | 占输入 15-25% |
| 反复返工 | 需求没说清，改了又改，建了又删 | 占输出 20-30% |
| 粘贴代码 | 手动复制文件内容到对话框 | 占输入 15-20% |
| 冗余输出 | 没要求简洁，Claude 每次输出大段解释 | 占输出 10-15% |
| 知识不复用 | 一个人摸索出的做法，其他人重复踩坑 | 团队级浪费 |

**Token Saver 的核心价值**：装到 Claude Code 中 → 自动优化上述问题 → 积累的个人经验可一键打包分享给团队。

---

## 二、工具包全景

### 两层结构

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1 — 个人省Token工具（装一次，全局生效）              │
│                                                            │
│   [7条 CLAUDE.md 规则]  自动生效，不需要调用                │
│   [7个 Slash Skill]     按需调用的斜杠命令                 │
│   [1个 Hook]            文件重复读取自动拦截                │
├────────────────────────────────────────────────────────────┤
│  Layer 2 — 团队知识沉淀闭环                                 │
│                                                            │
│   日常使用 → 积累个人MD → /skillify → 打包ZIP →            │
│   分享同事 → 一键安装 → 团队知识库                          │
└────────────────────────────────────────────────────────────┘
```

### 文件布局

```
token-saver/
│
├── TOKEN_SAVER_RULES.md        7条省Token规则（写入CLAUDE.md，自动生效）
├── install.bat                  Windows 一键安装脚本
├── README.md                    技术文档
│
├── shareable-skills/            7 个可分享 Skill
│   ├── cache-master/            /cache-master      Cache健康检查
│   ├── smart-route/             /smart-route       智能模型路由
│   ├── plan-first/              /plan-first        零返工工作流
│   ├── session-compress/        /session-compress  会话压缩保存
│   ├── context-budget/          /context-budget    上下文预算
│   ├── output-control/          /output-control    输出控制
│   └── skillify/                /skillify          个人笔记→Skill 打包器
│       ├── SKILL.md              轻量指令（Claude 读）
│       └── skillify.py           独立打包脚本（也可 CLI 直用）
│
└── hooks/                       1个自动Hook
    └── file_read_gate.py        文件重复读取拦截
```

---

## 三、7 个 Skill 一览

| 命令 | 场景 | 节省 | 来源 |
|------|------|------|------|
| `/cache-master` | 开始长会话时检查 Cache 健康 | 30-40% | Cache≥90%的高效会话 |
| `/smart-route` | 开始新任务前选模型 | ~50% | 多模型使用的高效会话 |
| `/plan-first` | 动手前飞行前检查 | ~25% | 零返工的高效会话 |
| `/session-compress` | 会话结束前固化上下文 | ~20% | 重复率<5%的高效会话 |
| `/context-budget` | 会话变慢时诊断 | 诊断型 | Token效率优的会话 |
| `/output-control` | 需要精简/结构化输出时 | 10-15% | 输出比率优的会话 |
| **`/skillify`** | **把个人MD笔记打包为可分享Skill** | **团队级复用** | **知识沉淀闭环** |

---

## 四、安装（3分钟）

### 步骤 1：安装 Skill 命令

双击 `shareable-skills/install.bat`（Windows）或执行 `./shareable-skills/install.sh`（Mac/Linux）。

手动方式：

```bash
# 复制 7 个 Skill 到 Claude Code 全局目录
for S in cache-master smart-route plan-first session-compress context-budget output-control skillify; do
    mkdir -p ~/.claude/skills/$S
    cp shareable-skills/$S/SKILL.md ~/.claude/skills/$S/SKILL.md
done
```

### 步骤 2：把省 Token 规则写入项目

在你的项目根目录下执行：

```bash
cat TOKEN_SAVER_RULES.md >> CLAUDE.md
```

或直接在 Claude Code 中说："把 token-saver/TOKEN_SAVER_RULES.md 追加到本项目 CLAUDE.md"。

写入后，Claude 在该项目中每次会话都会自动遵守这 7 条规则。

### 步骤 3（可选）：配置自动 Hook

编辑 `~/.claude/settings.json`（或项目级 `.claude/settings.local.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "python \"你的安装路径/token-saver/hooks/file_read_gate.py\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

配置后，当 Claude 在 5 分钟内重复读取同一个文件，会自动收到提醒使用缓存内容。

### 步骤 4：重启 Claude Code

所有工具即刻生效。

---

## 五、日常使用场景

### 5.1 自动生效（不用做任何事）

安装 `TOKEN_SAVER_RULES.md` 后，Claude 自动遵守：

| 规则 | Claude 的行为变化 |
|------|----------------|
| 缓存优化 | 不在会话中途改写 CLAUDE.md |
| Prompt 精简 | 用 Read 工具读文件，不要求你粘贴 |
| 防返工 | 动手前先读文件、理解上下文 |
| 输出控制 | 不输出冗余解释，直接给代码 |
| Agent 控制 | 简单任务不乱开 Agent |

### 5.2 按需调用的 6 个省 Token Skill

#### `/cache-master` — 开始长会话时

```
你: /cache-master
Claude: Cache 健康检查
       ─────────────────────
       CLAUDE.md 稳定性: ✓
       主题连贯性:      ✓
       会话时长:        ✓
       ─────────────────────
       预计缓存命中率: 92%
       状态良好，继续保持。
```

#### `/smart-route` — 开始新任务前

```
你: /smart-route
Claude: 你下一个任务是什么？

你: 帮我把 User 模型的 email 字段改成 emails 数组

Claude: Task: 单字段类型改写
       Complexity: Level 1 (简单改写)
       Recommended: Haiku (/fast)
       Reason: 单字段类型转换，无需复杂推理
       Est. saving vs Opus: ~80%
       建议: 输入 /fast 切换后再开始。
```

#### `/plan-first` — 动手写代码前

```
你: /plan-first
Claude: 下一个任务是什么？涉及修改哪些文件？

你: 加个用户注销功能

Claude: Pre-flight Checklist
       ─────────────────────────
       需求描述完整性:   △ (注销流程未明确)
       涉及文件已读取:   ✗
       边界情况考虑:     △ (未登录状态/并发注销)
       预期输出格式:     ✓
       ─────────────────────────
       请先回答:
       1. 点击注销后是立即登出还是弹二次确认?
       2. 注销时是否清除本地缓存?
       3. 还未登录时按钮是否显示?
       回答完这些，我再开始。
```

#### `/session-compress` — 长会话结束前

```
你: /session-compress
Claude: ## Session Summary — 2026-04-17
       ### Completed
       - 实现用户登录/注销功能
       - 完成 3 个 API 端点
       ### Key Decisions
       - 用 JWT 替代 Session (无状态)
       - 前端用 localStorage 保存 token
       ### Next Steps
       - 加 token 刷新机制
       - 写 E2E 测试
       保存到哪里?
       A) 项目 CLAUDE.md (推荐)
       B) Claude memory
```

#### `/context-budget` — 会话变慢时

```
你: /context-budget
Claude: Context Budget Estimate
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       System + CLAUDE.md:  ~4.2K
       Conversation:        ~28K (35 turns)
       Tool results:        ~12K
       Active files:        ~8K
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Total:               ~52K tokens
       Cache hit rate:      ~78%
       Top consumers:
       1. 对话历史 28K — 建议开新会话
       2. CLAUDE.md 4.2K — 清理旧 Session Summary
       应用建议后可节省 ~65%/turn
```

#### `/output-control` — 需要精简输出时

```
你: /output-control
Claude: 选择输出模式:
       1. 极简 (Minimal) - 只给答案
       2. 结构化 (Structured) - JSON/表格/bullet
       3. 限长 (Bounded) - 字数限制
       4. 代码优先 (Code-only)

你: 代码优先
Claude: [接下来的回复只输出代码块]
```

### 5.3 团队知识沉淀 — `/skillify`

这是核心能力：**把你积累的个人笔记/指南一键打包成可分享的 Skill**。

> **架构说明**: `/skillify` 采用 **"Skill + Script"** 模式：
> - `SKILL.md`（3KB）— 让 Claude 理解何时触发、如何收集参数
> - `skillify.py`（12KB）— 所有文件生成、校验、打包的确定性脚本
>
> 这样每次调用几乎不耗 Claude 的 Token（只传参数），生成结果 100% 一致，且脚本可脱离 Claude 直接在命令行使用。

#### 典型场景

你在项目中积累了一份 `API调试避坑.md`。你希望全组同事在 Claude Code 里输入 `/payment-api-debug` 就能自动加载这份指南。

#### 模式 A：在 Claude Code 中自然调用（推荐）

```
你: /skillify 帮我把 ./notes/API调试避坑.md 打包成 payment-api-debug

Claude: 描述用什么场景触发? (必须说明何时调用)

你: 调试支付 API 或处理支付错误时调用，加载团队总结的坑点

Claude: 谁整理的?

你: 张三

Claude: [自动调用 skillify.py 脚本]
       python ~/.claude/skills/skillify/skillify.py \
           --source ./notes/API调试避坑.md \
           --name payment-api-debug \
           --description "..." \
           --author "张三" --install --json

       ✓ Skill 已打包完成
       分享 ZIP: ./shared-skills/payment-api-debug-skill.zip (8 KB)
       本机已安装: ~/.claude/skills/payment-api-debug/SKILL.md
       
       包内:
         SKILL.md     Claude Skill 定义（带 frontmatter）
         README.md    使用说明
         install.sh   Mac/Linux 一键安装
         install.bat  Windows 一键安装
         meta.json    元数据（贡献者/创建时间）
       
       分享方式:
         发 ZIP 给同事 → 解压 → 运行 install → 重启 Claude Code → /payment-api-debug
```

#### 模式 B：CLI 直接使用（无需 Claude）

脚本可以独立使用，适合自动化/CI 场景：

```bash
python ~/.claude/skills/skillify/skillify.py \
    --source ./notes/API调试避坑.md \
    --name payment-api-debug \
    --description "调试支付 API 或处理支付错误时调用" \
    --author "张三" \
    --install        # 可选：同时安装到本机
    [--force]        # 可选：覆盖已有
    [--json]         # 可选：JSON 格式输出
    [--output DIR]   # 可选：指定输出目录（默认 ./shared-skills）
```

#### 脚本的严格校验

`skillify.py` 内置 3 层硬校验（比 LLM 判断可靠）：

| 校验项 | 规则 | 失败示例 |
|--------|------|---------|
| 名称合法性 | 只允许 `a-z 0-9 -`，且不能用系统保留名 | `Payment API` → 非法字符 |
| 名称不重复 | 不能与已装 Skill 同名（除非 `--force`） | `smart-route` → 保留名 |
| 描述含触发场景 | 必须包含 "when/使用/场景/调用/遇到" 等词 | "API调试指南" → 缺触发场景 |
| 描述长度 | 10-500 字符之间 | 太短/太长 |
| 源文件内容 | 至少 50 字符 | 空文件/几行内容 |

如果校验失败，脚本返回 `{"success": false, "error": "..."}`，Claude 会引导你修正后重试。

#### 知识复用闭环

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. 你用 Token Saver 工具日常开发                         │
│     └─ /session-compress 把经验沉淀到 CLAUDE.md          │
│                                                          │
│  2. 你整理出精华笔记（某个 MD 文件）                      │
│                                                          │
│  3. 你调用 /skillify                                     │
│     └─ 一键打包成标准 Skill ZIP                          │
│                                                          │
│  4. 你把 ZIP 发到团队群                                   │
│                                                          │
│  5. 同事下载 → 双击 install 脚本                          │
│     └─ 重启 Claude Code 后直接调用 /你的skill名           │
│                                                          │
│  6. 全组共享经验，不再重复踩坑                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 六、7 条省 Token 规则详解

| # | 规则 | 原理 | 节省幅度 |
|---|------|------|---------|
| 1 | Cache 优化 | Anthropic Prompt Cache 5分钟TTL，稳定 prompt 可大幅复用 | 30-40% |
| 2 | 模型路由 | 80%任务可用1/60成本的模型完成 | ~50% |
| 3 | Prompt 精简 | 让 Claude 用 Read 工具读文件，而非人工粘贴 | 15-25% |
| 4 | 防返工 | 一次说清需求 > 三次追加修改 | 20-30% |
| 5 | 防重复 | 用 memory / `/session-compress` 跨会话传递 | 15-20% |
| 6 | 输出控制 | 要求简洁/JSON/只给代码 | 10-15% |
| 7 | Agent 控制 | 每个并行 Agent 都复制完整上下文 | 按 Agent 数线性 |

---

## 七、效果度量

### 安装前后对比

```bash
# 安装前：记录基线
> /dev-monitor

# 安装 Token Saver，使用 1-2 天

# 安装后：对比
> /dev-monitor
```

### 目标指标

| 指标 | 安装前（典型） | 安装后（目标） | 含义 |
|------|-------------|-------------|------|
| Cache 命中率 | 60-75% | ≥ 90% | 缓存优化生效 |
| Token/消息 | 5000-8000 | ≤ 3000 | Prompt精简+输出控制 |
| 重复率 | 30-70% | < 10% | 防重复+`/session-compress` |
| 返工文件 | 3-10个 | 0-1个 | `/plan-first` 生效 |
| 效能评分 | 50-65 (D-C) | ≥ 80 (A) | 综合改善 |
| 团队知识库大小 | 0 | 每周 +N 个 Skill | `/skillify` 产出 |

---

## 八、团队推广 3 周计划

### 第一周：全员安装

1. 管理员将 `Team_Best_Practice_Skills.zip` 通过内网分享
2. 每人解压后运行 `install.bat`（Windows）或 `install.sh`（Mac/Linux）
3. 将 `TOKEN_SAVER_RULES.md` 追加到各自项目 CLAUDE.md
4. 每人运行 `/dev-monitor` 记录基线

### 第二周：养成习惯

每人建立日常触发节奏：

| 时机 | 动作 | 命令 |
|------|------|------|
| 开始工作 | 检查 Cache | `/cache-master` |
| 开始新任务 | 选模型 | `/smart-route` |
| 动手前 | 飞行检查 | `/plan-first` |
| 会话变慢 | 诊断 | `/context-budget` |
| 需要精简 | 输出控制 | `/output-control` |
| 结束会话 | 压缩保存 | `/session-compress` |
| 整理完指南 | **打包分享** | **`/skillify`** |

### 第三周起：沉淀共享

1. 每周运行 `/dev-monitor` 对比效能评分趋势
2. 每个人挑 1-2 份自己总结的好内容，用 `/skillify` 打包
3. 团队群里分享 ZIP，累积团队 Skill 库
4. 效能检测平台查看团队整体数据趋势

### 典型 Skill 沉淀候选

- 某项目的"API 对接规范"
- "常见 Bug 排查清单"
- "数据库迁移 checklist"
- "新人上手路径"
- "某库的正确用法"
- "deploy 前的检查清单"

---

## 九、常见问题

**Q: 安装后 Claude 的回复质量会下降吗？**
A: 不会。Token Saver 核心原则是"用更少 Token 达到同样效果"。模型路由只在任务确实简单时才推荐 Haiku，复杂任务仍然用 Opus/Sonnet。

**Q: 每个项目都要安装一遍吗？**
A: Skill 是全局的，安装一次所有项目通用。CLAUDE.md 规则是项目级的，每个项目追加一次（一行命令）。

**Q: /skillify 打包后别人装了看不懂怎么办？**
A: `skillify.py` 会硬校验你的 description 必须含"触发场景"（不合格会拒绝生成）。每个生成的 Skill 包都自带 README.md + install 脚本。同事看到 `/命令名` 即可触发，Claude 会参照你的 MD 内容回答。

**Q: /skillify 是纯 Prompt 还是有脚本？**
A: **Skill + 脚本** 混合模式。`SKILL.md` 只 3KB（告诉 Claude 何时触发+如何调脚本），`skillify.py` 12KB（所有打包逻辑）。每次调用几乎不耗 Claude Token，生成结果 100% 一致。脚本也可脱离 Claude 直接命令行用。

**Q: 我也想给自己的 Skill 加独立脚本怎么做？**
A: 参考第十章"Skill + 脚本 架构模式"。`~/.claude/skills/skillify/` 就是完整范例可直接仿照。

**Q: Hook 拦截文件读取会导致 Claude 读不到文件吗？**
A: 不会。Hook 只发提醒（stderr），不阻止读取。Claude 正常读文件，只是在已有缓存时收到"可用缓存"提示。

**Q: 能和 claude-mem 等其他插件一起用吗？**
A: 可以。Token Saver 是规则+Skill+Hook 形式，不与其他插件冲突，且缓存策略互补。

**Q: 如何卸载？**
A:
```bash
# 删除所有 7 个 Skill
rm -rf ~/.claude/skills/{cache-master,smart-route,plan-first,session-compress,context-budget,output-control,skillify}
# 删除 hook 配置：手动编辑 ~/.claude/settings.json 移除 hooks 字段
# 删除 CLAUDE.md 中的 Token Saver Rules 段落
```

**Q: 想立即体验 `/token-saver-guide` Skill？**
A: 本文档已被 `/skillify` 打包成 `token-saver-guide` Skill 并安装到本机。在 Claude Code 中输入 `/token-saver-guide` 即可让 Claude 按本文档内容回答你关于 Token Saver 的任何问题。

---

## 十、进阶 — "Skill + 脚本" 架构模式

`/skillify` 不止是一个工具，也是一种**Claude Skill 设计范式**。团队想自己开发复杂 Skill 时可参考这个模式。

### 两种 Skill 写法的对比

| 模式 | 纯 Markdown Skill | **Skill + 独立脚本** |
|------|-----------------|-----------------|
| 结构 | 只有 `SKILL.md`，所有逻辑写在指令里 | `SKILL.md` + `xxx.py`（或其他脚本） |
| 每次调用 | Claude 每次重新读完整指令（1-3K tokens） | Claude 只读触发规则（~300 tokens） |
| 生成一致性 | 依赖 LLM 理解，偶有偏差 | 脚本确定性，100% 一致 |
| 可独立使用 | 只能在 Claude 里用 | 也能 CLI 直接调用，适合 CI |
| 校验严格度 | 模糊判断 | 硬校验（正则/字典/边界） |
| 维护 | 改规则要改大段文字 | 改脚本逻辑即可 |

### 什么时候用 "Skill + 脚本"

✅ **适合**:
- 需要生成规范化文件结构（如打包、模板填充）
- 需要严格校验（格式、命名、长度）
- 需要跟外部命令/API 交互（git、curl、自建 CLI）
- 逻辑复杂、多分支（if/else 链长于 3 层）
- 想让非 Claude 场景也能用（CI / 脚本化）

❌ **不适合**:
- 纯自然语言回答类（如 `/token-saver-guide` 这种只加载知识的）
- 对话式交互为主（靠 Claude 理解意图）

### 设计步骤

1. **写脚本** — 用 Python 等实现核心逻辑，接受 CLI 参数，支持 `--json` 输出
2. **写 SKILL.md** — 只告诉 Claude：
   - 何时触发（description）
   - 收集哪些参数
   - 如何调用脚本
   - 如何解析 JSON 返回
   - 如何处理错误
3. **打包** — 把脚本和 SKILL.md 一起放进 Skill 目录
4. **安装时** — 确保脚本跟 SKILL.md 一起复制到 `~/.claude/skills/<name>/`
5. **验证** — 既能 `/skill-name` 调用，也能 `python ~/.claude/skills/<name>/xxx.py --help`

### 参考实现

`~/.claude/skills/skillify/` 是完整范例，包含：
- `SKILL.md`（3KB）— 只负责"收参数 + 调脚本 + 解析结果"
- `skillify.py`（12KB）— 所有文件模板、校验、打包、安装逻辑

团队任何人想写自己的 Skill+脚本，都可以仿照这个结构。

---

## 十一、版本信息

- 平台版本: V9.1
- Skill 数量: 7 个（6 个省Token工具 + 1 个 `/skillify` 元工具）
- 支持工具: Claude Code / Cursor / Aider / Cline
- 技术栈: FastAPI + React + SQLite/PostgreSQL + LLM(智谱GLM)
- 分享包: `releases/Team_Best_Practice_Skills.zip` (12 KB)
