# Token Saver Rules (团队省Token规则)
# 将此文件内容追加到项目 CLAUDE.md 中即可生效

## 1. Cache Optimization (缓存优化 — 节省30-40%)
- Keep CLAUDE.md and system prompts stable throughout a session. Do NOT rewrite them mid-conversation.
- Prefer continuing an existing session over starting a new one. Cache has a 5-minute TTL — staying in one session keeps it warm.
- Front-load large context blocks (architecture docs, API schemas) at the start of the session so they get cached early and reused across all subsequent turns.
- Never switch between unrelated topics within the same session within 270 seconds — this invalidates the cache.

## 2. Model Routing (模型路由 — 节省50%)
- For simple tasks (file search, grep, ls, single-line edits, formatting), prefer Haiku or /fast mode.
- For multi-step implementation, code review, debugging, use Sonnet.
- For architecture design, complex refactoring, security review, use Opus.
- Switch with `/model` command before starting a task block, not mid-task.

## 3. Prompt Efficiency (Prompt精简 — 节省15-25%)
- Reference files by path (`src/main.py:42`) instead of pasting code into the prompt.
- Let Claude read files with the Read tool — never paste file contents manually.
- Break compound requests ("do A, B, and C") into separate focused prompts.
- If you already described something in CLAUDE.md or memory, reference it instead of repeating.
- Limit context: only include information relevant to the current task.

## 4. Anti-Rework (防返工 — 节省20-30%)
- Always read a file before editing it.
- Describe the full requirement upfront, not incrementally ("change the button color" then "also move it" then "add an icon" = 3 edits → 1 edit).
- Use Plan Mode (`EnterPlanMode`) for any task touching 3+ files.
- Review the diff before moving to the next task. Catch mistakes early.
- For UI work, provide a design spec or reference screenshot upfront.

## 5. Anti-Duplicate (防重复 — 节省15-20%)
- Before asking a question, check if it was answered in a previous session (use memory or CLAUDE.md notes).
- Use `/resume` to continue previous sessions instead of re-explaining context.
- After completing a design decision, save the conclusion to memory so future sessions don't re-discuss it.
- If you find yourself typing the same prompt in multiple sessions, that prompt should become a Skill or a CLAUDE.md rule.

## 6. Output Control (输出控制 — 节省10-15%)
- Ask for concise responses: "answer in under 50 words" or "just the code, no explanation".
- Request structured output (JSON, table, bullet list) instead of prose.
- Set `max_tokens` when you know the expected response length.
- For yes/no questions, say "reply yes or no only".

## 7. Subagent Awareness (Agent成本控制)
- When using Agent tool for parallel tasks, keep prompts specific and short — each agent inherits full context.
- Prefer 1-2 focused agents over 3-5 broad ones.
- For simple lookups (grep, glob), use the tool directly instead of spawning an agent.
