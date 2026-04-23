#!/usr/bin/env python3
"""
skillify — 把个人 MD 笔记打包成可分享的 Claude Code Skill。

核心脚本，被 /skillify Skill 调用或通过 CLI 直接使用。

用法:
    python skillify.py --source <md-file> --name <skill-name> \\
                       --description "<desc>" --author "<name>" \\
                       [--output <output-dir>] [--install]

示例:
    python skillify.py \\
        --source ./notes/api-debug.md \\
        --name api-debug \\
        --description "调试 REST API 时加载团队常见坑点和规范请求格式" \\
        --author "张三" \\
        --install

输出:
    ./shared-skills/<name>/
        SKILL.md            Claude Skill 定义
        README.md           使用说明
        install.sh          Mac/Linux 一键安装
        install.bat         Windows 一键安装
    ./shared-skills/<name>-skill.zip   分享包
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import zipfile
from datetime import date
from pathlib import Path


# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------

RESERVED_NAMES = {
    "dev-monitor", "token-report", "duplicate-check", "efficiency-score",
    "session-review", "rework-check",  # 系统自带
    "smart-route", "session-compress", "context-budget",  # 本工具包
    "cache-master", "plan-first", "output-control",
    "skillify", "token-saver-guide",
    "update-config", "simplify", "loop", "claude-api", "init", "review",
    "security-review", "brand-guidelines", "canvas-design",
    "frontend-design", "webapp-testing", "theme-factory",
}

NAME_PATTERN = re.compile(r"^[a-z0-9-]+$")


# ---------------------------------------------------------------------------
# 辅助函数
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """把任意文本转换为合法的 skill name。"""
    s = re.sub(r"[^\w\s-]", "", text or "").strip().lower()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:32] or "practice"


def validate_name(name: str, force: bool = False) -> tuple[bool, str]:
    """校验 skill name。"""
    if not name:
        return False, "名称不能为空"
    if not NAME_PATTERN.match(name):
        return False, f"名称只能包含 a-z, 0-9, - (得到: {name})"
    if name in RESERVED_NAMES and not force:
        return False, f"{name} 是系统保留/已存在的 Skill 名，请换一个（或用 --force）"
    return True, ""


def validate_description(desc: str) -> tuple[bool, str]:
    """校验 description 是否包含触发场景。"""
    if not desc or len(desc) < 10:
        return False, "描述太短（<10字符），Claude 无法判断何时调用"
    if len(desc) > 500:
        return False, "描述太长（>500字符），建议压缩到 100 字内"
    # 启发式检查：是否包含"何时使用"的关键词
    trigger_keywords = ["when", "使用", "场景", "调用", "触发", "遇到", "询问", "需要"]
    if not any(kw in desc.lower() for kw in trigger_keywords):
        return False, (
            "描述缺少'触发场景'说明。Claude 需要知道'什么时候'调用此 Skill。\n"
            "  当前: " + desc + "\n"
            "  建议格式: '<做什么>。当<场景>时调用。'"
        )
    return True, ""


# ---------------------------------------------------------------------------
# 文件模板
# ---------------------------------------------------------------------------

def render_skill_md(name: str, description: str, author: str, body: str) -> str:
    """生成 SKILL.md 内容。"""
    # 转义 description 中的双引号
    desc_escaped = description.replace('"', '\\"')
    return f"""---
name: {name}
description: "{desc_escaped}"
---

# /{name}

> 贡献者: {author} · 整理于 {date.today().isoformat()}

当用户调用 `/{name}` 时，参考以下内容回答其问题。

---

{body}

---

## 使用方式

根据上述指南内容帮助用户。具体触发场景参见顶部 description。
"""


def render_readme(name: str, description: str, author: str) -> str:
    return f"""# {name} Skill

> 贡献者: {author} · {date.today().isoformat()}

## 是什么

{description}

## 安装

### macOS / Linux
```bash
chmod +x install.sh && ./install.sh
```

### Windows
双击 `install.bat`

### 手动
```bash
mkdir -p ~/.claude/skills/{name}
cp SKILL.md ~/.claude/skills/{name}/SKILL.md
```

## 调用

重启 Claude Code 后，在对话框输入 `/{name}` 即可加载本指南。
"""


def render_install_sh(name: str) -> str:
    return f"""#!/bin/bash
set -e
S="{name}"
DIR="$HOME/.claude/skills/$S"
mkdir -p "$DIR"
cp "$(dirname "${{BASH_SOURCE[0]}}")/SKILL.md" "$DIR/SKILL.md"
echo "[OK] /$S 已安装。重启 Claude Code 后可用。"
"""


def render_install_bat(name: str) -> str:
    return (
        "@echo off\r\n"
        "chcp 65001 >nul\r\n"
        f"set S={name}\r\n"
        f"set DIR=%USERPROFILE%\\.claude\\skills\\%S%\r\n"
        f"if not exist \"%DIR%\" mkdir \"%DIR%\"\r\n"
        f"copy /Y \"%~dp0SKILL.md\" \"%DIR%\\SKILL.md\" >nul\r\n"
        f"echo [OK] /%S% 已安装。重启 Claude Code 后可用。\r\n"
        f"pause\r\n"
    )


def render_meta(name: str, description: str, author: str, source: str) -> dict:
    return {
        "name": name,
        "description": description,
        "author": author,
        "source_file": str(source),
        "created_at": date.today().isoformat(),
        "generator": "skillify v1.0",
    }


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def package_skill(
    source: Path,
    name: str,
    description: str,
    author: str,
    output_dir: Path,
    install: bool = False,
    force: bool = False,
) -> dict:
    """
    核心打包逻辑。
    返回 {"skill_dir": Path, "zip_path": Path, "files": [...]} 或抛异常。
    """
    # 1. 读取源内容
    if not source.exists():
        raise FileNotFoundError(f"源文件不存在: {source}")
    body = source.read_text(encoding="utf-8")
    if len(body) < 50:
        raise ValueError(f"源文件内容过短（{len(body)}字符），无法生成有意义的 Skill")

    # 2. 校验参数
    ok, msg = validate_name(name, force=force)
    if not ok:
        raise ValueError(f"名称校验失败: {msg}")
    ok, msg = validate_description(description)
    if not ok:
        raise ValueError(f"描述校验失败: {msg}")
    if not author or len(author.strip()) < 1:
        raise ValueError("author 不能为空")

    # 3. 准备输出目录
    skill_dir = output_dir / name
    if skill_dir.exists():
        if not force:
            raise FileExistsError(f"{skill_dir} 已存在。使用 --force 覆盖。")
        shutil.rmtree(skill_dir)
    skill_dir.mkdir(parents=True, exist_ok=True)

    # 4. 写入所有文件
    (skill_dir / "SKILL.md").write_text(
        render_skill_md(name, description, author, body), encoding="utf-8"
    )
    (skill_dir / "README.md").write_text(
        render_readme(name, description, author), encoding="utf-8"
    )
    (skill_dir / "install.sh").write_text(
        render_install_sh(name), encoding="utf-8"
    )
    (skill_dir / "install.bat").write_bytes(
        render_install_bat(name).encode("utf-8")
    )
    (skill_dir / "meta.json").write_text(
        json.dumps(render_meta(name, description, author, source), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    # 5. 打包 ZIP
    zip_path = output_dir / f"{name}-skill.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in skill_dir.rglob("*"):
            if f.is_file():
                zf.write(f, f.relative_to(skill_dir.parent))

    # 6. （可选）安装到本机
    installed_path = None
    if install:
        home_skill = Path.home() / ".claude" / "skills" / name
        home_skill.mkdir(parents=True, exist_ok=True)
        shutil.copy(skill_dir / "SKILL.md", home_skill / "SKILL.md")
        installed_path = home_skill / "SKILL.md"

    return {
        "skill_dir": skill_dir,
        "zip_path": zip_path,
        "installed_path": installed_path,
        "files": [f.name for f in skill_dir.iterdir()],
        "size_kb": os.path.getsize(zip_path) // 1024,
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="把个人 MD 笔记打包成可分享的 Claude Code Skill",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基本用法
  python skillify.py --source ./notes/api-debug.md --name api-debug \\
      --description "调试 REST API 时加载团队坑点" --author "张三"

  # 打包并立即安装到本机
  python skillify.py --source guide.md --name my-guide \\
      --description "当用户问到X时调用" --author "我" --install

  # 覆盖已有
  python skillify.py ... --force
""",
    )
    parser.add_argument("--source", required=True, help="源 MD 文件路径")
    parser.add_argument("--name", required=True, help="Skill 名称（a-z, 0-9, -）")
    parser.add_argument("--description", required=True, help="描述（必须含触发场景）")
    parser.add_argument("--author", required=True, help="贡献者名字")
    parser.add_argument("--output", default="./shared-skills", help="输出目录（默认 ./shared-skills）")
    parser.add_argument("--install", action="store_true", help="同时安装到本机 ~/.claude/skills/")
    parser.add_argument("--force", action="store_true", help="覆盖已有 Skill")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出结果（供程序调用）")

    args = parser.parse_args()

    try:
        source = Path(args.source)
        output_dir = Path(args.output)
        output_dir.mkdir(parents=True, exist_ok=True)

        # slugify name if not already
        name = slugify(args.name) if not NAME_PATTERN.match(args.name) else args.name

        result = package_skill(
            source=source,
            name=name,
            description=args.description,
            author=args.author,
            output_dir=output_dir,
            install=args.install,
            force=args.force,
        )

        if args.json:
            print(json.dumps({
                "success": True,
                "skill_dir": str(result["skill_dir"]),
                "zip_path": str(result["zip_path"]),
                "installed_path": str(result["installed_path"]) if result["installed_path"] else None,
                "size_kb": result["size_kb"],
                "files": result["files"],
            }, ensure_ascii=False))
        else:
            print("=" * 60)
            print("  Skill 已打包完成")
            print("=" * 60)
            print(f"\n  分享 ZIP: {result['zip_path']}")
            print(f"  大小:     {result['size_kb']} KB")
            print(f"\n  包内文件:")
            for f in result["files"]:
                print(f"    {result['skill_dir'].name}/{f}")
            if result["installed_path"]:
                print(f"\n  本机已安装: {result['installed_path']}")
                print(f"  调用方式:   /{name}（重启 Claude Code 后可用）")
            print(f"\n  分享方式:")
            print(f"    1. 把 ZIP 发给同事")
            print(f"    2. 同事解压后运行 install.sh 或 install.bat")
            print(f"    3. 重启 Claude Code 后调用 /{name}")

        sys.exit(0)

    except (ValueError, FileNotFoundError, FileExistsError) as e:
        msg = str(e)
        if args.json:
            print(json.dumps({"success": False, "error": msg}, ensure_ascii=False))
        else:
            print(f"[ERR] {msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        if args.json:
            print(json.dumps({"success": False, "error": f"未预期错误: {e}"}, ensure_ascii=False))
        else:
            print(f"[ERR] 未预期错误: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
