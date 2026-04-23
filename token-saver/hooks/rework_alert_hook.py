#!/usr/bin/env python3
"""
Tier 3 (Instinct): Rework alert hook.

Fires after Write/Edit tool calls (PostToolUse hook).
Tracks per-file edit counts within a session and warns on rework patterns.

Environment variables available from Claude Code hooks:
  CLAUDE_SESSION_ID - current session ID
  CLAUDE_TOOL_NAME - name of the tool that was used
  CLAUDE_FILE_PATH - file path affected (if applicable)

The hook reads stdin for the tool input JSON.
"""

import json
import os
import sys
from pathlib import Path

REWORK_THRESHOLD = 3
UI_EXTENSIONS = {".tsx", ".jsx", ".vue", ".html", ".css", ".svelte", ".scss"}

SCRIPT_DIR = Path(__file__).parent.parent
STATE_DIR = SCRIPT_DIR / "hooks" / ".state"
STATE_DIR.mkdir(parents=True, exist_ok=True)


def get_file_edit_state(session_id: str) -> dict:
    state_file = STATE_DIR / f"edits-{session_id[:12]}.json"
    if state_file.exists():
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_file_edit_state(session_id: str, state: dict):
    state_file = STATE_DIR / f"edits-{session_id[:12]}.json"
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)


def main():
    session_id = os.environ.get("CLAUDE_SESSION_ID", "")
    if not session_id:
        return

    # Try to get file path from tool input via stdin
    tool_input = {}
    try:
        stdin_data = sys.stdin.read()
        if stdin_data.strip():
            tool_input = json.loads(stdin_data)
    except (json.JSONDecodeError, OSError):
        pass

    file_path = (
        tool_input.get("file_path")
        or tool_input.get("path")
        or os.environ.get("CLAUDE_FILE_PATH", "")
    )

    if not file_path:
        return

    # Normalize the file path
    file_path = str(Path(file_path).resolve())

    # Update edit count
    state = get_file_edit_state(session_id)
    state[file_path] = state.get(file_path, 0) + 1
    count = state[file_path]
    save_file_edit_state(session_id, state)

    # Check threshold
    if count >= REWORK_THRESHOLD:
        file_name = Path(file_path).name
        ext = Path(file_path).suffix.lower()
        is_ui = ext in UI_EXTENSIONS

        warning = f"[Rework Alert] {file_name} has been modified {count} times in this session."
        if is_ui:
            warning += " (UI file - consider providing a detailed design spec upfront)"
        else:
            warning += " (Consider being more specific in requirements to reduce iterations)"

        print(warning, file=sys.stderr)


if __name__ == "__main__":
    main()
