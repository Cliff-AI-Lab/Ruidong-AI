---
name: rework-check
description: "Detect file rework patterns - finds files modified 3+ times in a session, especially UI components that were built then rebuilt. Use when investigating development waste, UI iteration costs, or code quality patterns."
---

# /rework-check - Rework Pattern Detection

Detect files modified repeatedly across recent sessions.

## Instructions

Run the analyzer:
```bash
python "{{INSTALL_DIR}}/analyzer.py" rework-check
```

Present the results:
1. **Total rework files**: Files modified 3+ times in a session
2. **UI rework**: .tsx/.jsx/.vue/.html/.css files - typically the most expensive
3. **Wasted tokens**: Estimated tokens spent on edits beyond the 2nd
4. **Worst offenders**: Files with the highest edit counts

For files with 5+ edits, suggest:
- Writing detailed specs before coding
- Using design mockups or references for UI work
- Breaking complex components into smaller pieces
- Reviewing requirements before implementation
