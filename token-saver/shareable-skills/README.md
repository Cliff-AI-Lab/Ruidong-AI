# 团队最佳实践技能包

> 从团队高分会话中提炼，7 个可直接在 Claude Code 中调用的省 Token 技能 + 知识沉淀工具。

## 内容

| Skill | 调用方式 | 来源 | 节省 |
|-------|---------|------|------|
| `/cache-master` | 开始长会话时 | Cache 命中率≥90%的高效会话 | 30-40% |
| `/smart-route` | 开始新任务前 | 使用多模型的高效会话 | ~50% |
| `/plan-first` | 动手写代码前 | 零返工的高效会话 | ~25% |
| `/session-compress` | 会话结束前 | 重复率<5%的高效会话 | ~20% |
| `/context-budget` | 会话变慢时 | Token效率优秀的会话 | 诊断型 |
| `/output-control` | 需要精简输出时 | 输出比率优秀的会话 | 10-15% |
| `/skillify` | **沉淀自己的 MD 时** | **把个人笔记/指南一键打包为可分享的 Skill** | 团队知识复用 |

## 知识闭环

```
使用 Token Saver Skills → 积累个人 CLAUDE.md/笔记 → /skillify 一键打包 → 分享给团队 → 别人一键安装
```

## 安装（30 秒）

### Windows
```
双击 install.bat
```

### macOS / Linux
```bash
chmod +x install.sh && ./install.sh
```

### 手动
```bash
cp -r cache-master smart-route plan-first session-compress context-budget output-control ~/.claude/skills/
```

## 使用

重启 Claude Code 后，在任意项目的对话框中输入 `/` 即可看到这 6 个新 Skill。

**典型工作流**：
```
开始工作:   /cache-master   → 检查缓存状态
开始任务:   /smart-route    → 选最划算的模型
动手前:     /plan-first     → 避免返工
感觉慢时:   /context-budget → 诊断Token花销
需要精简:   /output-control → 控制输出长度
结束前:     /session-compress → 保存上下文
```

## 分享

将整个 `shareable-skills` 目录（或打包 ZIP）发给同事。他们运行 `install.bat`/`install.sh` 即可全部生效。

## 来源

这些 Skill 由 Token 效能检测平台（V9）从真实高分会话中提炼生成，经团队验证有效。
