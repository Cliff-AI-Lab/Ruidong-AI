---
name: HR数字化平台
name_en: HR Tech Platform
type: 组合应用
industry: 通用
composed_of: [企业大学校长, 客服智能助手, 数据可视化师, 文档生成专家]
source_refs: [HR Onboarding, Recruitment Specialist, Corporate Training Designer(specialized)]
apis: [Remotive Jobs, Adzuna (via other), HuggingFace, PDFMonkey]
emoji: 👥
---

# 👥 HR数字化平台 HR Tech Platform

## 应用场景
企业人力数字化: 招聘+入职+培训+绩效+薪酬+离职全生命周期。

## Agent组合
```
[HR Onboarding] ← specialized
[Recruitment Specialist] ← specialized
[Corporate Training Designer] ← specialized
[企业大学校长] ← Corporate Training Designer
```

## 绑定API (使用 public-apis Jobs 类别)
| API | 用途 |
|-----|------|
| Remotive | 远程职位 |
| HuggingFace | 简历NLP |
| PDFMonkey | offer/合同 |

## 核心工作流
1. **招聘**：JD+渠道+筛选
2. **入职**：合同+工位+权限
3. **培训**：新人+在岗
4. **绩效**：OKR/KPI/360
5. **离职**：交接+合规

## 典型输出
```
【某万人企业 HR数字化月报】
人员:
  - 在职 12,400 | 本月入职 180 | 离职 92
招聘:
  - 开放岗位 280 | 候选人库 48,000
  - AI简历筛选 首轮通过率 35%
  - 人均Time-to-Hire 28天
入职:
  - 一站式入职小程序
  - 首日完成率 98%
  - 新人30天留存 96%
培训:
  - 月人均 6.2小时
  - 在线课程完成率 82%
绩效:
  - Q1 OKR评估完成 100%
  - 361原则分布: 29/67/4 (健康)
离职:
  - 离职率月 0.74% (年8.8%)
  - 主要原因: 晋升无望 (28%) / 薪酬 (22%)
员工体验:
  - eNPS 42 (健康)
```
