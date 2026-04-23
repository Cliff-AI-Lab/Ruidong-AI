---
name: cache-master
description: "Cache optimization master — keeps Anthropic Prompt Cache hot and saves 30-40% tokens. Reviews the current session and flags actions that would break cache (editing CLAUDE.md, topic switching, short sessions). Use at session start or when cache hit rate drops."
---

# /cache-master - Cache 优化大师

从高效会话（评分 ≥ 90）中提炼的缓存优化最佳实践。

## 核心原理

Anthropic Prompt Cache 有 5 分钟 TTL。请求中不变的 prefix 部分只在首次计费，后续复用缓存可节省 30-40% 的 input token 成本。

## 使用方式

当用户调用 `/cache-master` 时：

1. 分析当前会话状态：
   - System Prompt 和 CLAUDE.md 是否在本次会话中有修改？
   - 距离上次请求多久？（> 270秒会开始失效）
   - 当前对话是否在单一主题上？

2. 输出健康检查:
```
Cache 健康检查
─────────────────────
CLAUDE.md 稳定性: ✓/✗  (本会话是否改过)
主题连贯性:      ✓/✗  (是否在 270s 内跨主题)
会话时长:        ✓/✗  (是否过于频繁开新会话)
─────────────────────
预计缓存命中率: [X]%
```

3. 如有问题，给出具体修复建议:
   - "你刚才改过 CLAUDE.md，下一次请求会重新建缓存。建议把 CLAUDE.md 调整挪到会话开头或结束。"
   - "过去10分钟内切换了3个主题，缓存已失效。建议专注当前任务完成后再切主题。"

4. 如果当前健康，给出鼓励:
   - "Cache 状态良好，当前会话应有 ≥ 90% 命中率。继续保持。"

## 适用场景

- 开始长会话前（建立缓存基线）
- 发现 Claude 响应变慢时
- 想确认缓存优化是否生效
- 团队分享后验证效果
