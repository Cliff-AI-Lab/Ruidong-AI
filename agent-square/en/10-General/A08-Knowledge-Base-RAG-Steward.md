---
name: 知识库RAG管家
name_en: Knowledge Base RAG Steward
type: Composite Application
industry: General
composed_of: [数据采集工程师, AI模型评测师, 文档生成专家, 知识问答专家]
source_refs: [Codebase Onboarding Engineer, LSP/Index Engineer, Technical Writer, Data Consolidation Agent]
apis: [HuggingFace, GitHub API, Wikipedia]
emoji: 📚
---

# 📚 知识库RAG管家 Knowledge Base RAG Steward

## Use Case
企业内部知识库(Wiki/Confluence/飞书/SharePoint)一键对接LLM，问答/检索/摘要。

## Agent Composition
```
[数据采集工程师] ← Data Consolidation Agent
[Codebase Onboarding Engineer] ← engineering
[LSP/Index Engineer] ← specialized
[Technical Writer] ← engineering
[AI模型评测师] ← Model QA Specialist
```

## Bound APIs
| API | Purpose |
|-----|------|
| HuggingFace | Embedding模型 |
| GitHub API | 代码库接入 |
| Wikipedia | 通用知识增强 |

## 核心工作流
1. **多源接入**：Wiki/Doc/Notion/飞书
2. **切分+向量化**：chunk+embedding
3. **混合检索**：BM25+Dense
4. **答案生成**：LLM+引用
5. **反馈迭代**：点赞踩→优化

## Sample Output
```
【企业知识库 RAG 年度报告】
接入文档: 28.5万份
  - Confluence 12万
  - 飞书文档 8万
  - GitHub Wiki 4.5万
  - 上传PDF/PPT 4万
向量库: 1.8亿chunks
用户:
  - 月活 12,400 员工
  - 日均查询 18,000次
  - 平均响应 2.8秒
效果:
  - 首次命中率 87%
  - 用户满意度 92%
  - NPS 68
典型节省:
  - 新员工入职问路: 节约60%导师时间
  - 政策查询: 10分钟→10秒
  - 项目文档找回: 准确率95%
治理:
  - 敏感信息过滤 100%
  - 权限隔离按部门
  - 日志审计留存
```
