---
name: ESG报告一键生成
name_en: ESG Report Auto-Generator
type: 组合应用
industry: 通用
composed_of: [碳排放分析师, 健康数据分析师, 风控合规官, 文档生成专家]
source_refs: [Compliance Auditor, Analytics Reporter, Document Generator]
apis: [Carbon Interface, SEC EDGAR, Climatiq, PDFMonkey]
emoji: 🌳
---

# 🌳 ESG报告一键生成 ESG Report Auto-Generator

## 应用场景
上市公司/企业社会责任部门的年度/季度ESG报告全自动撰写，支持GRI/SASB/TCFD/ISSB。

## Agent组合
```
[碳排放分析师] ← Financial Analyst改造
[健康数据分析师] ← Analytics Reporter
[风控合规官] ← Compliance Auditor
[文档生成专家] ← Document Generator
```

## 绑定API
| API | 用途 |
|-----|------|
| Carbon Interface | 碳排放 |
| Climatiq | 碳因子 |
| SEC EDGAR | 同业披露对标 |
| PDFMonkey | 报告美化 |

## 核心工作流
1. **标准选择**：GRI/SASB/TCFD/ISSB
2. **数据采集**：HR/EHS/财务
3. **KPI计算**：环境/社会/治理
4. **叙事撰写**：case story
5. **排版交付**：PDF+网页

## 典型输出
```
【某上市公司 2025 ESG报告(自动生成)】
框架: GRI + TCFD + ISSB (S1/S2)
核心KPI亮点:
环境 E:
  - Scope 1+2 减排 -18% (vs基准年)
  - 绿电占比 65%
  - 水耗强度 ↓22%
社会 S:
  - 员工培训 人均 42h/年
  - 女性管理层占比 28%
  - 客户满意度 92
  - 供应链社会责任评级: A
治理 G:
  - 独立董事占比 45%
  - 审计委员会全独立
  - 反贿赂案件: 0
气候风险(TCFD):
  - 物理风险+过渡风险定量分析
  - 2℃情景影响: 营收风险 -5%
报告:
  - 正文 58页 + 附录
  - 中英双语
  - 第三方保证意见: 毕马威
```
