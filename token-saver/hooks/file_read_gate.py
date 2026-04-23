#!/usr/bin/env python3
"""
Token Saver: File Read Gate Hook (PreToolUse)

拦截重复文件读取 — 如果同一文件在本会话中已被 Read 过，
提醒 Claude 使用缓存的内容而非重新读取（节省 Token）。

安装方式: 将此 hook 配置到 ~/.claude/settings.json 的 PreToolUse 中。
触发条件: Read 工具调用时。

环境变量:
  CLAUDE_SESSION_ID - 当前会话 ID
"""
import json
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.parent
STATE_DIR = SCRIPT_DIR / "hooks" / ".state"
STATE_DIR.mkdir(parents=True, exist_ok=True)

# 同一文件在 N 秒内被重复读取才拦截
GATE_WINDOW_SECONDS = 300  # 5 分钟
# 小文件不拦截（读取成本低）
MIN_FILE_SIZE_KB = 10


def get_read_history(session_id: str) -> dict:
    state_file = STATE_DIR / f"reads-{session_id[:12]}.json"
    if state_file.exists():
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_read_history(session_id: str, history: dict):
    state_file = STATE_DIR / f"reads-{session_id[:12]}.json"
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(history, f)


def main():
    session_id = os.environ.get("CLAUDE_SESSION_ID", "")
    if not session_id:
        return

    # 从 stdin 读取工具输入
    tool_input = {}
    try:
        stdin_data = sys.stdin.read()
        if stdin_data.strip():
            tool_input = json.loads(stdin_data)
    except (json.JSONDecodeError, OSError):
        pass

    file_path = tool_input.get("file_path", "")
    if not file_path:
        return

    # 规范化路径
    try:
        file_path = str(Path(file_path).resolve())
    except Exception:
        return

    # 小文件不拦截
    try:
        file_size = Path(file_path).stat().st_size / 1024
        if file_size < MIN_FILE_SIZE_KB:
            return
    except OSError:
        return

    # 检查是否在窗口内重复读取
    import time
    now = time.time()
    history = get_read_history(session_id)

    last_read = history.get(file_path, 0)
    if last_read and (now - last_read) < GATE_WINDOW_SECONDS:
        # 重复读取！发出提醒
        minutes_ago = round((now - last_read) / 60, 1)
        file_name = Path(file_path).name
        print(
            f"[Token Saver] {file_name} was already read {minutes_ago} min ago in this session. "
            f"Consider using the cached content from your earlier read instead of re-reading. "
            f"This saves ~{file_size:.0f}KB of input tokens.",
            file=sys.stderr,
        )

    # 记录本次读取
    history[file_path] = now
    save_read_history(session_id, history)


if __name__ == "__main__":
    main()
