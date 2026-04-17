---
name: 订阅制管理
name_en: Subscription Management
type: Composite Application
industry: General
apis: [Stripe, Shopify, HuggingFace]
emoji: 🔁
---

# 🔁 订阅制管理 Subscription Management

## Use Case
SaaS/媒体/零售订阅业务的定价、试用、续费、挽留。

## Core Capabilities
- 多层定价
- 试用转化
- 自动续费+催缴
- 流失挽回

## Bound APIs
| API | Purpose |
|-----|------|
| Stripe | 订阅支付 |
| Shopify | 实物订阅 |

## Sample Output
```
【SaaS订阅业务 月报】
付费订阅: 38,000
MRR: $680K (↑12% MoM)
NRR: 118% (扩展>流失)
套餐:
  - Starter $29 45%
  - Pro $99 38%
  - Enterprise (合约) 17%
试用:
  - 14天试用 注册 8,200
  - 试用转付费 22%
流失:
  - Gross Churn 2.8%
  - 挽留活动召回 35%流失
CAC: $180 | LTV $2,400 | LTV/CAC 13x
```
