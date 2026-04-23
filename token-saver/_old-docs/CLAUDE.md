# AI Development Efficiency Governance (开发效能监管)

## Three-Tier Architecture

This project provides a three-tier efficiency governance toolkit for AI-assisted development:

- **Tier 1 - Memory**: `analyzer.py` parses `~/.claude/` data (sessions, history, stats)
- **Tier 2 - Skills**: Slash commands (`/token-report`, `/duplicate-check`, `/efficiency-score`, `/session-review`, `/rework-check`)
- **Tier 3 - Instinct**: Auto-hooks in `.claude/settings.json` for token tracking and rework alerts

## Governance Agent Rules

When working in any project that has this toolkit installed, the AI assistant should act as a development efficiency agent by following these governance rules:

### Rule 1: Avoid Duplicate Work
Before starting a task, consider if similar work was done in a recent session. If the user's prompt closely resembles a previous conversation, mention it and ask whether to continue the previous work or start fresh.

### Rule 2: Minimize Rework
When modifying files, aim for accuracy on the first attempt:
- Read the file before editing
- Understand the full context before making changes
- Prefer fewer, more comprehensive edits over many small iterations

### Rule 3: Token Efficiency
- Use cache-friendly patterns (keep system prompts stable)
- Break large tasks into focused sub-tasks
- Avoid generating unnecessarily verbose output

### Rule 4: Periodic Self-Assessment
At the end of significant work sessions, suggest running `/efficiency-score` to assess development efficiency.

## Available Commands

```bash
# Quick overview
python analyzer.py overview

# Detailed reports
python analyzer.py token-report --days 7
python analyzer.py duplicate-check --threshold 0.75
python analyzer.py efficiency-score
python analyzer.py session-review
python analyzer.py rework-check

# JSON output for programmatic use
python analyzer.py efficiency-score --json
```

## Project Structure

```
analyzer.py              # Core analysis engine (all three tiers)
skills/                  # Tier 2: Claude Code SKILL.md files
  token-report/
  duplicate-check/
  efficiency-score/
  session-review/
  rework-check/
hooks/                   # Tier 3: Auto-trigger scripts
  post_message_hook.py   # Token tracking + spike alerts
  rework_alert_hook.py   # File rework detection
  .state/                # Hook state files (auto-created)
data/                    # Output data
  live-tally.jsonl       # Real-time token tally (auto-created)
```
