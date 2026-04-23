#!/usr/bin/env python3
"""
Tier 3 (Instinct): Post-message token tracker hook.

Fires after every Claude assistant turn (Stop hook).
Tracks cumulative token usage and emits warnings when thresholds are exceeded.

Environment variables available from Claude Code hooks:
  CLAUDE_SESSION_ID - current session ID
  CLAUDE_PROJECT_DIR - current working directory
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Thresholds
TOKEN_SPIKE_THRESHOLD = 10000   # single turn output tokens
SESSION_TOKEN_ALERT = 50000     # cumulative session output tokens

# State file for tracking cumulative tokens per session
SCRIPT_DIR = Path(__file__).parent.parent
STATE_DIR = SCRIPT_DIR / "hooks" / ".state"
STATE_DIR.mkdir(parents=True, exist_ok=True)

TALLY_DIR = SCRIPT_DIR / "data"
TALLY_DIR.mkdir(parents=True, exist_ok=True)


def get_session_state(session_id: str) -> dict:
    state_file = STATE_DIR / f"{session_id[:12]}.json"
    if state_file.exists():
        with open(state_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"cumulative_output_tokens": 0, "turn_count": 0, "warnings": []}


def save_session_state(session_id: str, state: dict):
    state_file = STATE_DIR / f"{session_id[:12]}.json"
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f)


def find_current_session_file(session_id: str) -> Path | None:
    claude_dir = Path.home() / ".claude" / "projects"
    if not claude_dir.exists():
        return None
    for project_dir in claude_dir.iterdir():
        if not project_dir.is_dir():
            continue
        jsonl = project_dir / f"{session_id}.jsonl"
        if jsonl.exists():
            return jsonl
    return None


def get_last_assistant_usage(session_file: Path) -> dict | None:
    """Read the last assistant message's token usage from the session file."""
    last_usage = None
    try:
        with open(session_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if entry.get("type") == "assistant":
                        usage = entry.get("message", {}).get("usage", {})
                        if usage:
                            last_usage = usage
                except json.JSONDecodeError:
                    continue
    except OSError:
        return None
    return last_usage


def main():
    session_id = os.environ.get("CLAUDE_SESSION_ID", "")
    if not session_id:
        return

    session_file = find_current_session_file(session_id)
    if not session_file:
        return

    usage = get_last_assistant_usage(session_file)
    if not usage:
        return

    output_tokens = usage.get("output_tokens", 0)
    input_tokens = usage.get("input_tokens", 0)
    cache_read = usage.get("cache_read_input_tokens", 0)
    cache_creation = usage.get("cache_creation_input_tokens", 0)

    # Update cumulative state
    state = get_session_state(session_id)
    state["cumulative_output_tokens"] += output_tokens
    state["turn_count"] += 1

    warnings = []

    # Check: single-turn spike
    if output_tokens > TOKEN_SPIKE_THRESHOLD:
        warnings.append(
            f"[Token Spike] This turn used {output_tokens:,} output tokens "
            f"(threshold: {TOKEN_SPIKE_THRESHOLD:,}). Consider breaking large "
            f"tasks into smaller steps."
        )

    # Check: cumulative session threshold
    cumulative = state["cumulative_output_tokens"]
    if cumulative > SESSION_TOKEN_ALERT:
        warnings.append(
            f"[Session Alert] Cumulative output tokens: {cumulative:,} "
            f"(threshold: {SESSION_TOKEN_ALERT:,}). Consider starting a new "
            f"focused session to reset context."
        )

    # Log to tally file
    tally_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": session_id[:12],
        "turn": state["turn_count"],
        "output_tokens": output_tokens,
        "input_tokens": input_tokens,
        "cache_read": cache_read,
        "cache_creation": cache_creation,
        "cumulative_output": cumulative,
    }

    tally_file = TALLY_DIR / "live-tally.jsonl"
    with open(tally_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(tally_entry, ensure_ascii=False) + "\n")

    save_session_state(session_id, state)

    # Emit warnings to stderr (Claude Code surfaces these)
    for w in warnings:
        print(w, file=sys.stderr)


if __name__ == "__main__":
    main()
