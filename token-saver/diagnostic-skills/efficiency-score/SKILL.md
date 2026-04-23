---
name: efficiency-score
description: "Composite development efficiency score (0-100) measuring AI development effectiveness across 5 dimensions: duplicates, rework, tool churn, cache misses, and token bloat. Use to assess overall efficiency or when the user asks 'how efficient am I?'"
---

# /efficiency-score - Development Efficiency Score

Calculate a composite efficiency score.

## Instructions

Run the analyzer:
```bash
python "{{INSTALL_DIR}}/analyzer.py" efficiency-score
```

The score is: Base 100 minus penalties across 5 dimensions.

Present the results:
1. **Score and Grade**: X/100, S/A/B/C/D
2. **Penalty Breakdown**: Show each factor and its deduction
3. **Recommendations**: For the top 2-3 penalty areas, give specific actionable advice

Grade scale:
- S (>= 90): Excellent
- A (>= 80): Good
- B (>= 70): Average
- C (>= 60): Below Average
- D (< 60): Poor - needs attention

For each high penalty, recommend a concrete workflow change.
