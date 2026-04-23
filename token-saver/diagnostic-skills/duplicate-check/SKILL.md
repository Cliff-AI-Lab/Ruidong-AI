---
name: duplicate-check
description: "Detect duplicate conversations - finds repeated prompts across sessions using hash matching and fuzzy similarity. Use when investigating token waste, when the user suspects they are repeating questions, or as part of efficiency auditing."
---

# /duplicate-check - Duplicate Conversation Detection

Detect duplicate and similar conversations across all sessions.

## Instructions

Run the analyzer:
```bash
python "{{INSTALL_DIR}}/analyzer.py" duplicate-check
```

Present the results:

1. **Duplicate Rate**: Overall percentage of repeated prompts
2. **Exact Duplicates**: Prompts repeated verbatim across sessions - show the top 5
3. **Fuzzy Matches**: Similar but not identical prompts (Jaccard >= 0.75) - show top 3
4. **Waste Estimate**: Tokens likely wasted on repeated conversations

For each group, explain:
- Why it may be happening (forgotten context, different sessions, retries)
- How to avoid it (memory files, CLAUDE.md, consolidate sessions)

If duplicate rate > 30%: this is a significant issue. Recommend:
- Using CLAUDE.md or memory files to persist context
- Starting sessions with a summary of previous work
- Avoiding copy-pasting the same prompt across sessions
