---
name: skillify
description: "Convert your personal notes, guides, or CLAUDE.md snippets into a properly-packaged, shareable Claude Code Skill. Use when you want to turn accumulated team knowledge (pitfall guides, debugging cheatsheets, domain-specific rules) into a /command other teammates can install and invoke."
---

# /skillify - 个人笔记 → 可分享 Skill 打包器

本 Skill 附带独立脚本 `skillify.py`，所有打包逻辑由脚本确定性完成。Claude 只负责收集参数并调用脚本。

## 工作流程

### Step 1: 收集 4 个参数

依次向用户询问（如果未主动提供）：

1. **source** — 源 MD 文件路径（或让用户粘贴内容保存到临时文件）
2. **name** — Skill 名称（小写+短划线，如 `api-debug`）
3. **description** — 描述（**必须包含触发场景**，如 "调试 REST API 时加载团队坑点"）
4. **author** — 贡献者名字

若 description 缺"触发场景"，明确指出并要求补充。

### Step 2: 调用脚本

用 Bash 工具运行（脚本位于本 Skill 目录，路径为 `~/.claude/skills/skillify/skillify.py`）：

```bash
python "$HOME/.claude/skills/skillify/skillify.py" \
    --source "<source-path>" \
    --name "<name>" \
    --description "<desc>" \
    --author "<author>" \
    --install \
    --json
```

参数说明:
- `--install` 同时安装到本机 `~/.claude/skills/` 便于立即验证
- `--json` 让脚本以 JSON 格式返回结果，便于解析
- 遇到重名冲突加 `--force` 覆盖

### Step 3: 解析脚本输出

脚本会返回类似：
```json
{
  "success": true,
  "skill_dir": "./shared-skills/api-debug",
  "zip_path": "./shared-skills/api-debug-skill.zip",
  "installed_path": "~/.claude/skills/api-debug/SKILL.md",
  "size_kb": 8,
  "files": ["SKILL.md", "README.md", "install.sh", "install.bat", "meta.json"]
}
```

### Step 4: 汇报给用户

向用户展示：
- 分享包 ZIP 路径和大小
- 本机已安装路径（可立即 `/name` 调用）
- 分享方式：发 ZIP → 同事解压 → 运行 install 脚本 → 重启 Claude Code

### 错误处理

如果脚本返回 `{"success": false, "error": "..."}`:
- **名称校验失败**（保留名/字符非法）→ 让用户改名重试
- **描述缺触发场景** → 引导用户补充
- **文件已存在** → 询问是否 `--force` 覆盖
- **源文件过短/不存在** → 确认路径

## CLI 直接使用（无需 Claude）

脚本也可脱离 Claude 使用：

```bash
python skillify.py \
    --source ./notes/api-debug.md \
    --name api-debug \
    --description "调试 REST API 时加载团队坑点" \
    --author "张三" \
    --install
```

## 为什么抽成脚本

1. **确定性** — 每次生成的文件结构完全一致，不会因 Claude 幻觉而错乱
2. **省 Token** — Claude 不用每次重新"理解"打包规则，只传参数
3. **可独立使用** — CI/自动化脚本可以直接调用，不依赖 LLM
4. **易维护** — 模板变更只改 Python，不用改 SKILL.md 语义
