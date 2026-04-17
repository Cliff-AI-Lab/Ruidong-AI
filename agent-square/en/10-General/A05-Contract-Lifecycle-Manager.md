---
name: 合同全生命周期
name_en: Contract Lifecycle Manager
type: Composite Application
industry: General
composed_of: [法律文书审查员, 文档生成专家, 风控合规官]
source_refs: [Legal Document Review, Legal Client Intake, Legal Compliance Checker, Legal Billing & Time Tracking]
apis: [CourtListener, PDFMonkey, JSONBin]
emoji: 📃
---

# 📃 合同全生命周期 Contract Lifecycle Manager

## Use Case
企业CLM系统: 起草→谈判→审批→签署→履约→归档→续约。

## Agent Composition
```
[法律文书审查员] ← Legal Document Review
[Legal Client Intake] ← specialized
[Legal Billing & Time Tracking] ← specialized
[文档生成专家] ← Document Generator
[风控合规官] ← Compliance Auditor
```

## Bound APIs
| API | Purpose |
|-----|------|
| CourtListener | 判例参考 |
| PDFMonkey | 合同模板 |
| OpenSanctions | 对方合规 |
| HelloSign (via其他) | 电子签 |

## 核心工作流
1. **模板库**：按类型/场景
2. **快速起草**：填空+条款推荐
3. **审批流**：业务+法务+财务
4. **电子签**：加密+存证
5. **履约监控**：到期/违约预警

## Sample Output
```
【CLM 年度报告 2025】
合同总量: 4,820份 (↑18% YoY)
分类型:
  - 销售合同 42%
  - 采购合同 28%
  - 服务/劳务 15%
  - 其他 15%
关键KPI:
  - 起草时长: 从2天→2小时 (模板化)
  - 法务审批: 平均4小时
  - 合同纠纷率: 0.42% (↓0.15pp)
  - 自动续约成功率: 78%
风险拦截:
  - 偏离条款提醒 580次
  - 对方制裁筛查 120家
  - 金额超限预警 18起
履约提醒:
  - 本季度到期 312份
  - 自动提醒业务跟进
```
