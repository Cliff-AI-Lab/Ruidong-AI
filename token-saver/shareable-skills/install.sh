#!/bin/bash
# Team Best-Practice Skills - 一键安装到 Claude Code
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

mkdir -p "$SKILLS_DIR"

echo "============================================================"
echo "  Team Best-Practice Skills - 一键安装到 Claude Code"
echo "============================================================"

for S in cache-master smart-route plan-first session-compress context-budget output-control skillify; do
    mkdir -p "$SKILLS_DIR/$S"
    # 复制 SKILL.md
    cp "$SCRIPT_DIR/$S/SKILL.md" "$SKILLS_DIR/$S/SKILL.md"
    # 复制 Skill 目录下的所有附加文件（如 skillify.py）
    for EXTRA in "$SCRIPT_DIR/$S"/*.py "$SCRIPT_DIR/$S"/*.sh; do
        [ -f "$EXTRA" ] && cp "$EXTRA" "$SKILLS_DIR/$S/"
    done
    echo "  [OK] /$S"
done

echo ""
echo "============================================================"
echo "  7 个团队最佳实践 Skill 已安装！"
echo "============================================================"
echo ""
echo "  重启 Claude Code 后可用:"
echo "    /cache-master      Cache 优化健康检查"
echo "    /smart-route       智能模型路由"
echo "    /plan-first        零返工工作流"
echo "    /session-compress  会话压缩保存"
echo "    /context-budget    上下文预算分析"
echo "    /output-control    输出控制器"
echo "    /skillify          个人笔记打包为 Skill"
