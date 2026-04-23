#!/bin/bash
# Token Saver 完整闭环 - 一键安装全部 9 个 Skill + 体检工具 + skillify 脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

echo "============================================================"
echo "  Token Saver 完整闭环 - 一键安装"
echo "============================================================"

mkdir -p "$SKILLS_DIR"

# 安装 shareable-skills (6 省Token + capture-lessons + skillify)
for S in cache-master smart-route plan-first session-compress context-budget output-control capture-lessons skillify; do
    SRC="$SCRIPT_DIR/shareable-skills/$S"
    [ ! -d "$SRC" ] && continue
    mkdir -p "$SKILLS_DIR/$S"
    cp "$SRC/SKILL.md" "$SKILLS_DIR/$S/SKILL.md"
    for EXTRA in "$SRC"/*.py "$SRC"/*.sh; do
        [ -f "$EXTRA" ] && cp "$EXTRA" "$SKILLS_DIR/$S/"
    done
    echo "  [OK] /$S"
done

# 安装 diagnostic-skills (6 体检工具)
for S in dev-monitor token-report duplicate-check rework-check efficiency-score session-review; do
    SRC="$SCRIPT_DIR/diagnostic-skills/$S"
    [ ! -d "$SRC" ] && continue
    mkdir -p "$SKILLS_DIR/$S"
    cp "$SRC/SKILL.md" "$SKILLS_DIR/$S/SKILL.md"
    echo "  [OK] /$S"
done

# analyzer.py 复制到用户目录（体检 Skills 会引用）
ANALYZER_DST="$HOME/.claude/skills/_shared"
mkdir -p "$ANALYZER_DST"
cp "$SCRIPT_DIR/analyzer.py" "$ANALYZER_DST/analyzer.py"
echo "  [OK] analyzer.py → $ANALYZER_DST/"

echo ""
echo "============================================================"
echo "  安装完成"
echo "============================================================"
echo ""
echo "  下一步："
echo "    1. 将 TOKEN_SAVER_RULES.md 追加到你项目的 CLAUDE.md"
echo "    2. (可选) 配置 ~/.claude/settings.json 的 hooks"
echo "    3. 重启 Claude Code"
echo ""
echo "  核心闭环命令："
echo "    /dev-monitor      → 体检"
echo "    /capture-lessons  → 封装教训 MD"
echo "    /skillify         → 打包成可分享 Skill"
echo "    /token-saver-guide → 查看完整使用说明"
echo ""
