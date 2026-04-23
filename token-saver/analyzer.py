#!/usr/bin/env python3
"""
AI Development Efficiency Analyzer (开发效能分析器)
Three-tier architecture: Memory → Skills → Instinct

Parses Claude Code's native data from ~/.claude/ to detect:
- Duplicate conversations
- UI rework patterns
- Repeated tool/skill invocations
- Token waste and efficiency scoring

Usage:
    python analyzer.py token-report [--days N]
    python analyzer.py duplicate-check [--threshold 0.75]
    python analyzer.py efficiency-score [--session SESSION_ID]
    python analyzer.py session-review [--session SESSION_ID]
    python analyzer.py rework-check [--session SESSION_ID]
    python analyzer.py overview
"""

import argparse
import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CLAUDE_DATA_PATH = Path.home() / ".claude"
HISTORY_FILE = CLAUDE_DATA_PATH / "history.jsonl"
STATS_CACHE_FILE = CLAUDE_DATA_PATH / "stats-cache.json"
PROJECTS_DIR = CLAUDE_DATA_PATH / "projects"

DUPLICATE_SIMILARITY_THRESHOLD = 0.75
REWORK_EDIT_THRESHOLD = 3
TOKEN_SPIKE_THRESHOLD = 10000
UI_FILE_EXTENSIONS = {".tsx", ".jsx", ".vue", ".html", ".css", ".svelte", ".scss"}


# ---------------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------------

def normalize_prompt(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\u4e00-\u9fff]", "", text)
    return text


def prompt_hash(text: str) -> str:
    return hashlib.sha256(normalize_prompt(text).encode("utf-8")).hexdigest()[:16]


def ngram_set(text: str, n: int = 3) -> set:
    normalized = normalize_prompt(text)
    if len(normalized) < n:
        return {normalized}
    return {normalized[i : i + n] for i in range(len(normalized) - n + 1)}


def jaccard_similarity(text_a: str, text_b: str) -> float:
    set_a, set_b = ngram_set(text_a), ngram_set(text_b)
    if not set_a or not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union)


def format_tokens(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


def parse_timestamp(ts) -> datetime:
    if isinstance(ts, str):
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
    return datetime.now(tz=timezone.utc)


# ---------------------------------------------------------------------------
# Parsers (Tier 1: Memory)
# ---------------------------------------------------------------------------

def parse_session_jsonl(filepath: Path) -> dict:
    """Parse a single session JSONL file into structured data."""
    session = {
        "session_id": filepath.stem,
        "file": str(filepath),
        "messages": [],
        "tool_calls": [],
        "file_changes": defaultdict(list),
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_cache_read_tokens": 0,
        "total_cache_creation_tokens": 0,
        "message_count": 0,
        "user_prompts": [],
        "models_used": set(),
        "started_at": None,
        "ended_at": None,
        "turn_durations": [],
        "errors": [],
    }

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue

                entry_type = entry.get("type")
                timestamp = entry.get("timestamp")

                if timestamp:
                    ts = parse_timestamp(timestamp)
                    if session["started_at"] is None or ts < session["started_at"]:
                        session["started_at"] = ts
                    if session["ended_at"] is None or ts > session["ended_at"]:
                        session["ended_at"] = ts

                if entry_type == "user":
                    msg = entry.get("message", {})
                    content = msg.get("content", "")
                    if isinstance(content, str) and content.strip():
                        session["user_prompts"].append({
                            "text": content.strip(),
                            "hash": prompt_hash(content),
                            "timestamp": timestamp,
                            "uuid": entry.get("uuid"),
                        })
                    session["message_count"] += 1

                elif entry_type == "assistant":
                    msg = entry.get("message", {})
                    usage = msg.get("usage", {})

                    input_t = usage.get("input_tokens", 0)
                    output_t = usage.get("output_tokens", 0)
                    cache_read = usage.get("cache_read_input_tokens", 0)
                    cache_creation = usage.get("cache_creation_input_tokens", 0)

                    session["total_input_tokens"] += input_t
                    session["total_output_tokens"] += output_t
                    session["total_cache_read_tokens"] += cache_read
                    session["total_cache_creation_tokens"] += cache_creation

                    model = msg.get("model", "")
                    if model:
                        session["models_used"].add(model)

                    content_blocks = msg.get("content", [])
                    if isinstance(content_blocks, list):
                        for block in content_blocks:
                            if isinstance(block, dict) and block.get("type") == "tool_use":
                                tool_name = block.get("name", "unknown")
                                tool_input = block.get("input", {})
                                file_path = tool_input.get("file_path") or tool_input.get("path") or ""
                                session["tool_calls"].append({
                                    "name": tool_name,
                                    "id": block.get("id"),
                                    "input": tool_input,
                                    "file_path": file_path,
                                    "timestamp": timestamp,
                                    "output_tokens": output_t,
                                })
                                if tool_name in ("Write", "Edit") and file_path:
                                    session["file_changes"][file_path].append({
                                        "tool": tool_name,
                                        "timestamp": timestamp,
                                        "output_tokens": output_t,
                                    })

                    session["messages"].append({
                        "type": "assistant",
                        "input_tokens": input_t,
                        "output_tokens": output_t,
                        "cache_read": cache_read,
                        "cache_creation": cache_creation,
                        "model": model,
                        "stop_reason": msg.get("stop_reason"),
                        "timestamp": timestamp,
                    })
                    session["message_count"] += 1

                elif entry_type == "system":
                    subtype = entry.get("subtype")
                    if subtype == "turn_duration":
                        session["turn_durations"].append({
                            "duration_ms": entry.get("durationMs", 0),
                            "message_count": entry.get("messageCount", 0),
                        })
                    elif subtype == "api_error":
                        session["errors"].append({
                            "error": entry.get("error", {}),
                            "retry_attempt": entry.get("retryAttempt", 0),
                            "timestamp": timestamp,
                        })

    except Exception as e:
        session["parse_error"] = str(e)

    session["models_used"] = list(session["models_used"])
    session["file_changes"] = dict(session["file_changes"])
    return session


def find_all_sessions(project_filter: str = None) -> list:
    """Find all session JSONL files, optionally filtered by project path."""
    sessions = []
    if not PROJECTS_DIR.exists():
        return sessions

    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        if project_filter:
            # project dirs are encoded like E-----Token-------
            if project_filter.lower() not in str(project_dir).lower():
                pass  # still include for now; filter later by session content

        for jsonl_file in project_dir.glob("*.jsonl"):
            if jsonl_file.name == "sessions-index.json":
                continue
            sessions.append(jsonl_file)

    return sessions


def load_history() -> list:
    """Parse history.jsonl for all user prompts across sessions."""
    entries = []
    if not HISTORY_FILE.exists():
        return entries

    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                display = entry.get("display", "")
                if display and len(display) > 5:
                    entries.append({
                        "text": display,
                        "hash": prompt_hash(display),
                        "timestamp": entry.get("timestamp"),
                        "project": entry.get("project", ""),
                        "session_id": entry.get("sessionId", ""),
                    })
            except json.JSONDecodeError:
                continue
    return entries


def load_stats_cache() -> dict:
    """Load pre-aggregated stats from stats-cache.json."""
    if not STATS_CACHE_FILE.exists():
        return {}
    with open(STATS_CACHE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_session_indexes() -> list:
    """Load all session index files for quick metadata access."""
    indexes = []
    if not PROJECTS_DIR.exists():
        return indexes

    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        index_file = project_dir / "sessions-index.json"
        if index_file.exists():
            try:
                with open(index_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for entry in data.get("entries", []):
                        entry["_project_dir"] = str(project_dir)
                        indexes.append(entry)
            except (json.JSONDecodeError, OSError):
                continue
    return indexes


# ---------------------------------------------------------------------------
# Analyzers (Tier 2: Skills)
# ---------------------------------------------------------------------------

def detect_duplicates(history: list, threshold: float = DUPLICATE_SIMILARITY_THRESHOLD) -> dict:
    """Detect duplicate conversations using hash + fuzzy matching."""
    # Phase 1: Exact hash matching
    hash_groups = defaultdict(list)
    for entry in history:
        hash_groups[entry["hash"]].append(entry)

    exact_duplicates = []
    for h, entries in hash_groups.items():
        if len(entries) >= 2:
            exact_duplicates.append({
                "type": "exact",
                "prompt": entries[0]["text"][:200],
                "count": len(entries),
                "sessions": list({e.get("session_id", "N/A") for e in entries}),
                "projects": list({e.get("project", "N/A") for e in entries}),
                "first_seen": min(e.get("timestamp", 0) for e in entries),
                "last_seen": max(e.get("timestamp", 0) for e in entries),
            })

    # Phase 2: Fuzzy matching (on unique prompts only, limit to recent 200)
    unique_prompts = []
    seen_hashes = set()
    for entry in reversed(history):
        if entry["hash"] not in seen_hashes:
            seen_hashes.add(entry["hash"])
            unique_prompts.append(entry)
        if len(unique_prompts) >= 200:
            break

    fuzzy_duplicates = []
    checked = set()
    for i, a in enumerate(unique_prompts):
        for j, b in enumerate(unique_prompts):
            if i >= j:
                continue
            pair_key = (a["hash"], b["hash"])
            if pair_key in checked:
                continue
            checked.add(pair_key)

            sim = jaccard_similarity(a["text"], b["text"])
            if sim >= threshold and sim < 1.0:
                fuzzy_duplicates.append({
                    "type": "fuzzy",
                    "similarity": round(sim, 3),
                    "prompt_a": a["text"][:150],
                    "prompt_b": b["text"][:150],
                    "project_a": a.get("project", ""),
                    "project_b": b.get("project", ""),
                })

    # Sort by count/similarity
    exact_duplicates.sort(key=lambda x: x["count"], reverse=True)
    fuzzy_duplicates.sort(key=lambda x: x["similarity"], reverse=True)

    return {
        "exact_duplicates": exact_duplicates[:20],
        "fuzzy_duplicates": fuzzy_duplicates[:20],
        "total_prompts": len(history),
        "unique_prompts": len(seen_hashes),
        "duplicate_rate": round(
            (len(history) - len(seen_hashes)) / max(len(history), 1) * 100, 1
        ),
    }


def detect_rework(session: dict) -> list:
    """Detect file rework patterns in a session."""
    rework_events = []
    for file_path, changes in session.get("file_changes", {}).items():
        edit_count = len(changes)
        if edit_count >= REWORK_EDIT_THRESHOLD:
            ext = Path(file_path).suffix.lower()
            is_ui = ext in UI_FILE_EXTENSIONS
            wasted_tokens = sum(c.get("output_tokens", 0) for c in changes[2:])
            rework_events.append({
                "file": file_path,
                "edit_count": edit_count,
                "is_ui_rework": is_ui,
                "wasted_tokens": wasted_tokens,
                "changes": [
                    {"tool": c["tool"], "timestamp": c["timestamp"]}
                    for c in changes
                ],
            })
    rework_events.sort(key=lambda x: x["edit_count"], reverse=True)
    return rework_events


def analyze_tool_repeats(session: dict) -> dict:
    """Analyze repeated tool/skill invocations in a session."""
    tool_counts = defaultdict(int)
    bash_commands = defaultdict(int)
    webfetch_urls = defaultdict(int)

    for tc in session.get("tool_calls", []):
        tool_name = tc["name"]
        tool_counts[tool_name] += 1

        if tool_name == "Bash":
            cmd = tc.get("input", {}).get("command", "")[:100]
            if cmd:
                bash_commands[cmd] += 1
        elif tool_name == "WebFetch":
            url = tc.get("input", {}).get("url", "")
            if url:
                webfetch_urls[url] += 1

    total_calls = sum(tool_counts.values())
    repeated_bash = {cmd: cnt for cmd, cnt in bash_commands.items() if cnt >= 3}
    repeated_urls = {url: cnt for url, cnt in webfetch_urls.items() if cnt >= 2}

    # Tool churn: tool calls that are likely repeats
    repeat_count = sum(max(0, cnt - 1) for cnt in bash_commands.values() if cnt >= 3)
    repeat_count += sum(max(0, cnt - 1) for cnt in webfetch_urls.values() if cnt >= 2)
    churn_rate = round(repeat_count / max(total_calls, 1) * 100, 1)

    return {
        "tool_distribution": dict(sorted(tool_counts.items(), key=lambda x: -x[1])),
        "total_tool_calls": total_calls,
        "repeated_bash_commands": repeated_bash,
        "repeated_webfetch_urls": repeated_urls,
        "tool_churn_rate": churn_rate,
    }


def calculate_token_metrics(session: dict) -> dict:
    """Calculate detailed token metrics for a session."""
    total_input = session["total_input_tokens"]
    total_output = session["total_output_tokens"]
    cache_read = session["total_cache_read_tokens"]
    cache_creation = session["total_cache_creation_tokens"]
    msg_count = session["message_count"]

    total_input_family = total_input + cache_read + cache_creation
    cache_hit_rate = round(
        cache_read / max(total_input_family, 1) * 100, 1
    )

    tokens_per_message = round(
        (total_input + total_output) / max(msg_count, 1)
    )

    output_input_ratio = round(
        total_output / max(total_input, 1), 2
    )

    # Identify token spikes (single messages with > threshold output)
    spikes = []
    for msg in session.get("messages", []):
        if msg.get("output_tokens", 0) > TOKEN_SPIKE_THRESHOLD:
            spikes.append({
                "output_tokens": msg["output_tokens"],
                "model": msg.get("model", ""),
                "timestamp": msg.get("timestamp"),
            })

    return {
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_cache_read_tokens": cache_read,
        "total_cache_creation_tokens": cache_creation,
        "total_all_tokens": total_input + total_output + cache_read + cache_creation,
        "cache_hit_rate": cache_hit_rate,
        "tokens_per_message": tokens_per_message,
        "output_input_ratio": output_input_ratio,
        "message_count": msg_count,
        "token_spikes": spikes,
        "models_used": session.get("models_used", []),
    }


def calculate_efficiency_score(
    duplicate_rate: float,
    rework_file_count: int,
    tool_churn_rate: float,
    cache_hit_rate: float,
    tokens_per_message: int,
) -> dict:
    """Calculate composite efficiency score (0-100)."""
    base_score = 100

    dup_penalty = min(20, duplicate_rate * 0.4)
    rework_penalty = min(20, rework_file_count * 3)
    churn_penalty = min(15, tool_churn_rate * 0.3)
    cache_penalty = min(10, max(0, (100 - cache_hit_rate)) * 0.15) if cache_hit_rate > 0 else 0
    bloat_penalty = min(15, max(0, tokens_per_message - 5000) / 1000)

    total_penalty = dup_penalty + rework_penalty + churn_penalty + cache_penalty + bloat_penalty
    final_score = max(0, round(base_score - total_penalty, 1))

    if final_score >= 90:
        grade = "S"
    elif final_score >= 80:
        grade = "A"
    elif final_score >= 70:
        grade = "B"
    elif final_score >= 60:
        grade = "C"
    else:
        grade = "D"

    return {
        "score": final_score,
        "grade": grade,
        "penalties": {
            "duplicate": round(dup_penalty, 1),
            "rework": round(rework_penalty, 1),
            "tool_churn": round(churn_penalty, 1),
            "cache_miss": round(cache_penalty, 1),
            "token_bloat": round(bloat_penalty, 1),
        },
        "total_penalty": round(total_penalty, 1),
    }


# ---------------------------------------------------------------------------
# Report generators (output formatting)
# ---------------------------------------------------------------------------

def report_token(days: int = 7):
    """Generate token usage report."""
    stats = load_stats_cache()
    if not stats:
        print("[!] stats-cache.json not found or empty.")
        return

    print("=" * 60)
    print("  TOKEN USAGE REPORT (Token 用量报告)")
    print("=" * 60)

    # Overall stats
    print(f"\n  Total Sessions:  {stats.get('totalSessions', 'N/A')}")
    print(f"  Total Messages:  {stats.get('totalMessages', 'N/A')}")
    first_date = stats.get("firstSessionDate", "")[:10]
    print(f"  Since:           {first_date}")

    # Model breakdown
    model_usage = stats.get("modelUsage", {})
    if model_usage:
        print(f"\n{'-' * 60}")
        print("  MODEL BREAKDOWN (模型用量分布)")
        print(f"{'-' * 60}")
        print(f"  {'Model':<35} {'Input':>8} {'Output':>8} {'Cache R':>8}")
        print(f"  {'-' * 33} {'-' * 8} {'-' * 8} {'-' * 8}")
        for model, usage in model_usage.items():
            short_name = model.split("-202")[0] if "-202" in model else model
            inp = format_tokens(usage.get("inputTokens", 0))
            out = format_tokens(usage.get("outputTokens", 0))
            cache_r = format_tokens(usage.get("cacheReadInputTokens", 0))
            print(f"  {short_name:<35} {inp:>8} {out:>8} {cache_r:>8}")

    # Daily activity (last N days)
    daily = stats.get("dailyActivity", [])
    if daily:
        recent = daily[-days:]
        print(f"\n{'-' * 60}")
        print(f"  DAILY ACTIVITY (Last {days} days)")
        print(f"{'-' * 60}")
        print(f"  {'Date':<14} {'Messages':>10} {'Sessions':>10} {'Tools':>10}")
        print(f"  {'-' * 12} {'-' * 10} {'-' * 10} {'-' * 10}")
        for day in recent:
            print(
                f"  {day['date']:<14} {day['messageCount']:>10} "
                f"{day['sessionCount']:>10} {day['toolCallCount']:>10}"
            )

    # Daily token trend
    daily_tokens = stats.get("dailyModelTokens", [])
    if daily_tokens:
        recent_t = daily_tokens[-days:]
        print(f"\n{'-' * 60}")
        print(f"  DAILY TOKEN OUTPUT (Last {days} days)")
        print(f"{'-' * 60}")
        for day in recent_t:
            total = sum(day.get("tokensByModel", {}).values())
            bar_len = min(40, total // 5000)
            bar = "#" * bar_len
            print(f"  {day['date']}  {format_tokens(total):>8}  {bar}")

    # Peak hours
    hour_counts = stats.get("hourCounts", {})
    if hour_counts:
        print(f"\n{'-' * 60}")
        print("  PEAK HOURS (活跃时段)")
        print(f"{'-' * 60}")
        sorted_hours = sorted(hour_counts.items(), key=lambda x: -x[1])[:5]
        for hour, count in sorted_hours:
            print(f"  {int(hour):02d}:00  {count} sessions")

    print()


def report_duplicates(threshold: float = DUPLICATE_SIMILARITY_THRESHOLD):
    """Generate duplicate conversation report."""
    history = load_history()
    if not history:
        print("[!] No history data found.")
        return

    result = detect_duplicates(history, threshold)

    print("=" * 60)
    print("  DUPLICATE CONVERSATION REPORT (重复对话检测)")
    print("=" * 60)

    print(f"\n  Total prompts analyzed:  {result['total_prompts']}")
    print(f"  Unique prompts:          {result['unique_prompts']}")
    print(f"  Duplicate rate:          {result['duplicate_rate']}%")

    exact = result["exact_duplicates"]
    if exact:
        print(f"\n{'-' * 60}")
        print(f"  EXACT DUPLICATES ({len(exact)} groups)")
        print(f"{'-' * 60}")
        for i, dup in enumerate(exact[:10], 1):
            print(f"\n  [{i}] Repeated {dup['count']}x:")
            print(f"      \"{dup['prompt'][:80]}...\"")
            print(f"      Projects: {', '.join(dup['projects'][:3])}")
    else:
        print("\n  No exact duplicates found.")

    fuzzy = result["fuzzy_duplicates"]
    if fuzzy:
        print(f"\n{'-' * 60}")
        print(f"  FUZZY MATCHES ({len(fuzzy)} pairs, threshold={threshold})")
        print(f"{'-' * 60}")
        for i, dup in enumerate(fuzzy[:10], 1):
            print(f"\n  [{i}] Similarity: {dup['similarity']}")
            print(f"      A: \"{dup['prompt_a'][:60]}...\"")
            print(f"      B: \"{dup['prompt_b'][:60]}...\"")
    else:
        print(f"\n  No fuzzy matches above threshold {threshold}.")

    print()


def report_session_review(session_id: str = None):
    """Review a specific session or the most recent one."""
    sessions = find_all_sessions()
    if not sessions:
        print("[!] No session files found.")
        return

    # Find the target session
    if session_id:
        target = None
        for s in sessions:
            if session_id in s.stem:
                target = s
                break
        if not target:
            print(f"[!] Session '{session_id}' not found.")
            return
    else:
        # Use most recently modified
        target = max(sessions, key=lambda s: s.stat().st_mtime)

    session = parse_session_jsonl(target)
    token_metrics = calculate_token_metrics(session)
    tool_analysis = analyze_tool_repeats(session)
    rework_events = detect_rework(session)

    print("=" * 60)
    print("  SESSION REVIEW (会话复盘)")
    print("=" * 60)

    print(f"\n  Session ID:   {session['session_id'][:20]}...")
    if session["started_at"]:
        print(f"  Started:      {session['started_at'].strftime('%Y-%m-%d %H:%M')}")
    if session["ended_at"]:
        print(f"  Ended:        {session['ended_at'].strftime('%Y-%m-%d %H:%M')}")
    print(f"  Messages:     {token_metrics['message_count']}")
    print(f"  Models:       {', '.join(token_metrics['models_used']) or 'N/A'}")

    # Token metrics
    print(f"\n{'-' * 60}")
    print("  TOKEN METRICS")
    print(f"{'-' * 60}")
    print(f"  Input tokens:          {format_tokens(token_metrics['total_input_tokens'])}")
    print(f"  Output tokens:         {format_tokens(token_metrics['total_output_tokens'])}")
    print(f"  Cache read tokens:     {format_tokens(token_metrics['total_cache_read_tokens'])}")
    print(f"  Cache creation tokens: {format_tokens(token_metrics['total_cache_creation_tokens'])}")
    print(f"  Cache hit rate:        {token_metrics['cache_hit_rate']}%")
    print(f"  Tokens per message:    {token_metrics['tokens_per_message']}")
    print(f"  Output/Input ratio:    {token_metrics['output_input_ratio']}")

    if token_metrics["token_spikes"]:
        print(f"\n  Token Spikes (>{TOKEN_SPIKE_THRESHOLD} output):")
        for spike in token_metrics["token_spikes"]:
            print(f"    - {format_tokens(spike['output_tokens'])} tokens ({spike['model']})")

    # Tool usage
    print(f"\n{'-' * 60}")
    print("  TOOL USAGE")
    print(f"{'-' * 60}")
    print(f"  Total tool calls:  {tool_analysis['total_tool_calls']}")
    print(f"  Tool churn rate:   {tool_analysis['tool_churn_rate']}%")
    if tool_analysis["tool_distribution"]:
        print(f"\n  {'Tool':<20} {'Count':>8}")
        print(f"  {'-' * 18} {'-' * 8}")
        for tool, count in list(tool_analysis["tool_distribution"].items())[:10]:
            print(f"  {tool:<20} {count:>8}")

    if tool_analysis["repeated_bash_commands"]:
        print(f"\n  Repeated Bash commands (3+ times):")
        for cmd, cnt in tool_analysis["repeated_bash_commands"].items():
            print(f"    [{cnt}x] {cmd[:60]}")

    # Rework
    if rework_events:
        print(f"\n{'-' * 60}")
        print(f"  REWORK DETECTED ({len(rework_events)} files)")
        print(f"{'-' * 60}")
        for rw in rework_events:
            tag = " [UI]" if rw["is_ui_rework"] else ""
            print(f"  {rw['file']}{tag}")
            print(f"    Edits: {rw['edit_count']}  Wasted tokens: ~{format_tokens(rw['wasted_tokens'])}")

    # In-session duplicates
    prompts = session.get("user_prompts", [])
    if prompts:
        prompt_hashes = defaultdict(list)
        for p in prompts:
            prompt_hashes[p["hash"]].append(p["text"][:100])
        in_session_dups = {h: texts for h, texts in prompt_hashes.items() if len(texts) >= 2}
        if in_session_dups:
            print(f"\n{'-' * 60}")
            print(f"  IN-SESSION DUPLICATE PROMPTS ({len(in_session_dups)} groups)")
            print(f"{'-' * 60}")
            for h, texts in list(in_session_dups.items())[:5]:
                print(f"  [{len(texts)}x] \"{texts[0][:60]}...\"")

    # Errors
    if session["errors"]:
        print(f"\n{'-' * 60}")
        print(f"  API ERRORS ({len(session['errors'])})")
        print(f"{'-' * 60}")
        for err in session["errors"][:5]:
            err_data = err.get("error", {})
            err_msg = err_data.get("error", {}).get("message", str(err_data)[:80])
            print(f"  Retry #{err.get('retry_attempt', '?')}: {err_msg[:60]}")

    print()


def report_rework(session_id: str = None):
    """Generate rework pattern report across sessions."""
    sessions = find_all_sessions()
    if not sessions:
        print("[!] No session files found.")
        return

    if session_id:
        targets = [s for s in sessions if session_id in s.stem]
    else:
        # Check all recent sessions (last 10 by mtime)
        targets = sorted(sessions, key=lambda s: s.stat().st_mtime, reverse=True)[:10]

    print("=" * 60)
    print("  REWORK PATTERN REPORT (返工检测)")
    print("=" * 60)

    all_rework = []
    for target in targets:
        session = parse_session_jsonl(target)
        rework_events = detect_rework(session)
        for rw in rework_events:
            rw["session_id"] = session["session_id"][:12]
            all_rework.append(rw)

    if not all_rework:
        print(f"\n  No rework patterns detected (threshold: {REWORK_EDIT_THRESHOLD}+ edits)")
        print(f"  Scanned {len(targets)} recent sessions.")
        print()
        return

    all_rework.sort(key=lambda x: x["edit_count"], reverse=True)
    total_wasted = sum(rw["wasted_tokens"] for rw in all_rework)
    ui_rework_count = sum(1 for rw in all_rework if rw["is_ui_rework"])

    print(f"\n  Files with rework:    {len(all_rework)}")
    print(f"  UI rework files:      {ui_rework_count}")
    print(f"  Est. wasted tokens:   {format_tokens(total_wasted)}")
    print(f"  Sessions scanned:     {len(targets)}")

    print(f"\n{'-' * 60}")
    print(f"  {'File':<40} {'Edits':>6} {'Waste':>8} {'UI':>4}")
    print(f"  {'-' * 38} {'-' * 6} {'-' * 8} {'-' * 4}")
    for rw in all_rework[:15]:
        name = Path(rw["file"]).name
        if len(name) > 38:
            name = name[:35] + "..."
        ui_tag = "Yes" if rw["is_ui_rework"] else ""
        print(
            f"  {name:<40} {rw['edit_count']:>6} "
            f"{format_tokens(rw['wasted_tokens']):>8} {ui_tag:>4}"
        )

    print()


def report_efficiency(session_id: str = None):
    """Generate composite efficiency score report."""
    # Load history for duplicate analysis
    history = load_history()
    dup_result = detect_duplicates(history) if history else {"duplicate_rate": 0}

    # Load recent sessions for rework + tool analysis
    sessions = find_all_sessions()
    if not sessions:
        print("[!] No session files found.")
        return

    if session_id:
        targets = [s for s in sessions if session_id in s.stem]
    else:
        targets = sorted(sessions, key=lambda s: s.stat().st_mtime, reverse=True)[:5]

    total_rework_files = 0
    all_tool_churn = []
    all_cache_rates = []
    all_tokens_per_msg = []

    for target in targets:
        session = parse_session_jsonl(target)
        rework = detect_rework(session)
        total_rework_files += len(rework)

        tool_analysis = analyze_tool_repeats(session)
        all_tool_churn.append(tool_analysis["tool_churn_rate"])

        token_metrics = calculate_token_metrics(session)
        if token_metrics["cache_hit_rate"] > 0:
            all_cache_rates.append(token_metrics["cache_hit_rate"])
        all_tokens_per_msg.append(token_metrics["tokens_per_message"])

    avg_churn = sum(all_tool_churn) / max(len(all_tool_churn), 1)
    avg_cache = sum(all_cache_rates) / max(len(all_cache_rates), 1) if all_cache_rates else 0
    avg_tpm = sum(all_tokens_per_msg) / max(len(all_tokens_per_msg), 1)

    score = calculate_efficiency_score(
        duplicate_rate=dup_result["duplicate_rate"],
        rework_file_count=total_rework_files,
        tool_churn_rate=avg_churn,
        cache_hit_rate=avg_cache,
        tokens_per_message=int(avg_tpm),
    )

    print("=" * 60)
    print("  EFFICIENCY SCORE (开发效能评分)")
    print("=" * 60)

    grade_display = {
        "S": "[S] Excellent",
        "A": "[A] Good",
        "B": "[B] Average",
        "C": "[C] Below Average",
        "D": "[D] Poor",
    }

    print(f"\n  Score:  {score['score']} / 100")
    print(f"  Grade:  {grade_display.get(score['grade'], score['grade'])}")
    print(f"\n  Sessions analyzed: {len(targets)}")

    print(f"\n{'-' * 60}")
    print("  PENALTY BREAKDOWN (扣分明细)")
    print(f"{'-' * 60}")
    penalties = score["penalties"]
    print(f"  Duplicate conversations:  -{penalties['duplicate']:>5}  (rate: {dup_result['duplicate_rate']}%)")
    print(f"  File rework:              -{penalties['rework']:>5}  (files: {total_rework_files})")
    print(f"  Tool churn:               -{penalties['tool_churn']:>5}  (rate: {avg_churn:.1f}%)")
    print(f"  Cache miss:               -{penalties['cache_miss']:>5}  (hit: {avg_cache:.1f}%)")
    print(f"  Token bloat:              -{penalties['token_bloat']:>5}  (avg: {int(avg_tpm)}/msg)")
    print(f"  {'-' * 28}")
    print(f"  Total penalty:            -{score['total_penalty']:>5}")

    # Recommendations
    print(f"\n{'-' * 60}")
    print("  RECOMMENDATIONS (优化建议)")
    print(f"{'-' * 60}")
    if penalties["duplicate"] > 5:
        print("  [!] High duplicate rate. Use memory/context to avoid re-asking similar questions.")
    if penalties["rework"] > 5:
        print("  [!] File rework detected. Be more specific in initial requirements to reduce iterations.")
    if penalties["tool_churn"] > 5:
        print("  [!] Repeated tool calls. Check if commands are failing and address root causes.")
    if penalties["cache_miss"] > 3:
        print("  [!] Low cache hit rate. Keep system prompts stable; use longer sessions.")
    if penalties["token_bloat"] > 5:
        print("  [!] High tokens per message. Consider breaking complex tasks into smaller steps.")
    if score["total_penalty"] < 10:
        print("  [OK] Great efficiency! Keep up the good development practices.")

    print()


def report_overview():
    """Generate a quick overview combining all analyses."""
    print("=" * 60)
    print("  DEV EFFICIENCY OVERVIEW (开发效能总览)")
    print("=" * 60)

    # Stats cache
    stats = load_stats_cache()
    if stats:
        print(f"\n  Sessions: {stats.get('totalSessions', 0)} | Messages: {stats.get('totalMessages', 0)}")
        model_usage = stats.get("modelUsage", {})
        total_output = sum(m.get("outputTokens", 0) for m in model_usage.values())
        total_cache_read = sum(m.get("cacheReadInputTokens", 0) for m in model_usage.values())
        total_cache_create = sum(m.get("cacheCreationInputTokens", 0) for m in model_usage.values())
        print(f"  Total output tokens: {format_tokens(total_output)}")
        global_cache_rate = round(
            total_cache_read / max(total_cache_read + total_cache_create, 1) * 100, 1
        )
        print(f"  Global cache hit rate: {global_cache_rate}%")

    # Quick duplicate check
    history = load_history()
    if history:
        dup_result = detect_duplicates(history)
        print(f"  Duplicate rate: {dup_result['duplicate_rate']}% ({dup_result['total_prompts']} prompts)")

    # Recent session quick scan
    sessions = find_all_sessions()
    if sessions:
        recent = sorted(sessions, key=lambda s: s.stat().st_mtime, reverse=True)[:3]
        total_rework = 0
        for target in recent:
            session = parse_session_jsonl(target)
            total_rework += len(detect_rework(session))
        print(f"  Rework files (last 3 sessions): {total_rework}")

    print(f"\n  Run specific commands for detailed analysis:")
    print(f"  python analyzer.py token-report")
    print(f"  python analyzer.py duplicate-check")
    print(f"  python analyzer.py efficiency-score")
    print(f"  python analyzer.py session-review")
    print(f"  python analyzer.py rework-check")
    print()


# ---------------------------------------------------------------------------
# JSON output mode (for programmatic use by hooks/skills)
# ---------------------------------------------------------------------------

def json_output(command: str, **kwargs) -> dict:
    """Return analysis results as JSON for hooks and skills."""
    if command == "token-report":
        stats = load_stats_cache()
        return {"stats": stats}

    elif command == "duplicate-check":
        history = load_history()
        return detect_duplicates(history, kwargs.get("threshold", DUPLICATE_SIMILARITY_THRESHOLD))

    elif command == "session-review":
        sessions = find_all_sessions()
        if not sessions:
            return {"error": "No sessions found"}
        sid = kwargs.get("session_id")
        if sid:
            target = next((s for s in sessions if sid in s.stem), None)
        else:
            target = max(sessions, key=lambda s: s.stat().st_mtime)
        if not target:
            return {"error": f"Session {sid} not found"}
        session = parse_session_jsonl(target)
        return {
            "token_metrics": calculate_token_metrics(session),
            "tool_analysis": analyze_tool_repeats(session),
            "rework": detect_rework(session),
            "prompt_count": len(session["user_prompts"]),
            "error_count": len(session["errors"]),
        }

    elif command == "efficiency-score":
        history = load_history()
        dup_result = detect_duplicates(history) if history else {"duplicate_rate": 0}
        sessions = find_all_sessions()
        targets = sorted(sessions, key=lambda s: s.stat().st_mtime, reverse=True)[:5]
        rework_count = 0
        churns, caches, tpms = [], [], []
        for t in targets:
            s = parse_session_jsonl(t)
            rework_count += len(detect_rework(s))
            ta = analyze_tool_repeats(s)
            churns.append(ta["tool_churn_rate"])
            tm = calculate_token_metrics(s)
            if tm["cache_hit_rate"] > 0:
                caches.append(tm["cache_hit_rate"])
            tpms.append(tm["tokens_per_message"])

        return calculate_efficiency_score(
            duplicate_rate=dup_result["duplicate_rate"],
            rework_file_count=rework_count,
            tool_churn_rate=sum(churns) / max(len(churns), 1),
            cache_hit_rate=sum(caches) / max(len(caches), 1) if caches else 0,
            tokens_per_message=int(sum(tpms) / max(len(tpms), 1)),
        )

    return {"error": f"Unknown command: {command}"}


# ---------------------------------------------------------------------------
# CLI Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="AI Development Efficiency Analyzer (开发效能分析器)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  overview          Quick overview of all metrics
  token-report      Detailed token usage report
  duplicate-check   Detect duplicate conversations
  efficiency-score  Composite efficiency score
  session-review    Review a specific session
  rework-check      Detect file rework patterns

Three-tier architecture:
  Tier 1 (Memory):   Parsers that read ~/.claude/ data
  Tier 2 (Skills):   Analysis commands invoked on demand
  Tier 3 (Instinct): Hooks that fire automatically (see hooks/)
        """,
    )
    parser.add_argument("command", nargs="?", default="overview",
                        choices=["overview", "token-report", "duplicate-check",
                                 "efficiency-score", "session-review", "rework-check"])
    parser.add_argument("--days", type=int, default=7, help="Number of days for reports")
    parser.add_argument("--session", type=str, default=None, help="Session ID to analyze")
    parser.add_argument("--threshold", type=float, default=DUPLICATE_SIMILARITY_THRESHOLD,
                        help="Similarity threshold for fuzzy duplicate detection")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    if args.json:
        result = json_output(args.command, session_id=args.session, threshold=args.threshold)
        print(json.dumps(result, ensure_ascii=False, indent=2, default=str))
        return

    if args.command == "overview":
        report_overview()
    elif args.command == "token-report":
        report_token(days=args.days)
    elif args.command == "duplicate-check":
        report_duplicates(threshold=args.threshold)
    elif args.command == "efficiency-score":
        report_efficiency(session_id=args.session)
    elif args.command == "session-review":
        report_session_review(session_id=args.session)
    elif args.command == "rework-check":
        report_rework(session_id=args.session)


if __name__ == "__main__":
    main()
