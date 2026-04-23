---
name: dev-monitor
description: "Quick development efficiency overview - run at the start or end of any session to check token usage, duplicate rate, rework patterns, and get an efficiency score. Use when starting a session, finishing work, or when asked about AI development efficiency."
---

# /dev-monitor - Development Efficiency Monitor

Run a quick development efficiency health check.

## Instructions

1. First run the overview:
```bash
python "{{INSTALL_DIR}}/analyzer.py" overview
```

2. Then run the efficiency score:
```bash
python "{{INSTALL_DIR}}/analyzer.py" efficiency-score
```

3. Present the results as a brief summary:
   - Overall health: sessions, messages, cache hit rate
   - Efficiency grade (S/A/B/C/D) with score
   - Top 2-3 issues and specific recommendations

4. If grade is C or D, suggest the user run specific deep-dive commands:
   - High duplicate penalty -> suggest `/duplicate-check`
   - High rework penalty -> suggest `/rework-check`
   - High token bloat -> suggest `/session-review`

Keep the output concise and actionable.
