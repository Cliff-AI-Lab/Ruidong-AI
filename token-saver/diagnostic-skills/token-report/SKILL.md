---
name: token-report
description: "Token usage report - shows token consumption by model, daily trends, cache efficiency, and peak hours. Use when the user asks about token usage, costs, or wants to understand their AI consumption patterns."
---

# /token-report - Token Usage Report

Generate a comprehensive token usage report.

## Instructions

Run the analyzer:
```bash
python "{{INSTALL_DIR}}/analyzer.py" token-report --days 7
```

Present the results with focus on:

1. **Overall Stats**: Total sessions, messages, time range
2. **Model Breakdown**: Which models consumed the most tokens
3. **Daily Trend**: Visual daily token output pattern
4. **Cache Efficiency**: Cache hit rate assessment
5. **Peak Hours**: When the user is most active

Recommendations:
- If cache hit rate < 80%: suggest keeping system prompts stable, using longer sessions
- If one model dominates: ask if a smaller model could handle routine tasks
- If daily variance is high: suggest more consistent work patterns

The user can pass `$ARGUMENTS` to customize (e.g., `--days 14` for 2 weeks).
