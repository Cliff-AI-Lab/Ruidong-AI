# Hook Installation Guide (Hooks 安装指南)

## How to Enable Tier 3 (Instinct) Hooks

Add the following to your project's `.claude/settings.local.json` or global `~/.claude/settings.json`:

### Option 1: Add to any project's `.claude/settings.local.json`

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python \"{{INSTALL_DIR}}/hooks/post_message_hook.py\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python \"{{INSTALL_DIR}}/hooks/rework_alert_hook.py\""
          }
        ]
      }
    ]
  }
}
```

### Option 2: Global hooks (all projects)

Add the same `hooks` block to `~/.claude/settings.json` to enable monitoring across all projects.

## What the Hooks Do

### Post-Message Hook (Stop)
- Fires after every Claude response
- Tracks cumulative token usage per session
- Warns when single-turn output exceeds 10,000 tokens
- Warns when session cumulative output exceeds 50,000 tokens
- Logs all usage to `data/live-tally.jsonl`

### Rework Alert Hook (PostToolUse: Write|Edit)
- Fires after every Write or Edit tool call
- Counts modifications per file per session
- Warns when a file is modified 3+ times
- Extra warning for UI files (.tsx/.jsx/.vue/.html/.css)

## Customizing Thresholds

Edit the constants at the top of each hook script:

- `hooks/post_message_hook.py`:
  - `TOKEN_SPIKE_THRESHOLD = 10000` (single-turn output limit)
  - `SESSION_TOKEN_ALERT = 50000` (session cumulative limit)

- `hooks/rework_alert_hook.py`:
  - `REWORK_THRESHOLD = 3` (edits before warning)

## Verifying Hooks Work

After installing, edit any file 3+ times in Claude Code. You should see:
```
[Rework Alert] filename.tsx has been modified 3 times in this session. (UI file - consider providing a detailed design spec upfront)
```
