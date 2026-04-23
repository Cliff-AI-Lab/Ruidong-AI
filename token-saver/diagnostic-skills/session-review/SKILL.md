---
name: session-review
description: "Detailed session analysis - reviews token usage, tool calls, rework patterns, duplicate prompts, and API errors for a specific session. Use at the end of a work session or when investigating a specific session's efficiency."
---

# /session-review - Session Review

Review the most recent or a specific session.

## Instructions

Run the analyzer:
```bash
python "{{INSTALL_DIR}}/analyzer.py" session-review
```

For a specific session, pass `$ARGUMENTS` like `--session SESSION_ID`.

Present a structured review:
1. **Overview**: Duration, message count, models used
2. **Token Metrics**: Input/output/cache breakdown, cache hit rate
3. **Token Spikes**: Messages exceeding 10K output tokens
4. **Tool Usage**: Distribution + repeated commands
5. **Rework**: Files modified 3+ times
6. **In-Session Duplicates**: Similar prompts in the same session
7. **Errors**: API retries and failures

End with a one-line efficiency summary and one key suggestion.
