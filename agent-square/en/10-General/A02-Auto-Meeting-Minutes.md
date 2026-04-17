---
name: 会议纪要全自动
name_en: Auto Meeting Minutes
type: Composite Application
industry: General
composed_of: [文档生成专家, 多语言翻译官, AI模型评测师]
source_refs: [Executive Summary Generator, Technical Writer, Voice AI Integration Engineer]
apis: [HuggingFace, PDFMonkey, LibreTranslate]
emoji: 📝
---

# 📝 会议纪要全自动 Auto Meeting Minutes

## Use Case
实时会议录音→转文字→摘要→待办分配→邮件推送全自动闭环。

## Agent Composition
```
[Voice AI Integration Engineer] ← engineering
[Executive Summary Generator] ← support
[Technical Writer] ← engineering
[多语言翻译官] ← Language Translator
```

## Bound APIs
| API | Purpose |
|-----|------|
| HuggingFace | ASR+摘要模型 |
| PDFMonkey | 纪要文档 |
| LibreTranslate | 多语会议 |

## 核心工作流
1. **实时ASR**：分离说话人
2. **关键词提取**：决议/待办
3. **结构化摘要**：5W1H
4. **待办分配**：负责人+截止
5. **分发签收**：邮件+提醒

## Sample Output
```
【产品月度评审会 2026-04-17】
时长: 95分钟 | 参会10人
一、主要讨论
  - Q2产品路线图 (项目A, B, C)
  - 某功能下线决议 (60%用户不使用)
  - 团队扩招2名前端
二、决议
  ✅ 批准: 项目A MVP 5月底上线
  ✅ 批准: 某功能3周后下线
  ⏸️ 暂缓: 出海计划 (Q3再评估)
三、待办 (8项)
  @张工 (4/24): 确认技术方案
  @李经理 (4/20): 发布下线公告
  @HR (5/1): 完成2个前端招聘
  ...
四、附件
  - 录音: https://...
  - 完整文字稿: https://...
  - PPT: meeting-deck.pdf
已邮件发送, 已同步日历待办
```
