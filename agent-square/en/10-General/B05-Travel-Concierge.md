---
name: 出行旅游管家
name_en: Travel Concierge
type: Composite Application
industry: General
composed_of: [路径规划师, 多语言翻译官, 天气预报员, 新闻聚合编辑]
source_refs: [Hospitality Guest Services(specialized), Geographer, Language Translator]
apis: [RestCountries, OpenRouteService, OpenWeatherMap, Calendarific]
emoji: 🧳
---

# 🧳 出行旅游管家 Travel Concierge

## Use Case
一站式旅游管家: 签证+机票+酒店+行程+翻译+应急。

## Agent Composition
```
[Hospitality Guest Services] ← specialized
[Geographer] ← academic
[Language Translator] ← specialized
[天气预报员] ← Analytics Reporter
```

## Bound APIs (使用 public-apis 多个类别)
| API | Purpose |
|-----|------|
| RestCountries | 各国基本信息 |
| OpenRouteService | 景点路径 |
| OpenWeatherMap | 目的地天气 |
| Calendarific | 当地节日 |
| Nager.Date | 假期 |
| Hipolabs Universities | 学生旅行 |

## 核心工作流
1. **需求收集**：目的地+人数+预算
2. **行程推荐**：必去+特色
3. **预订辅助**：机酒一价
4. **当地通讯**：翻译+地图
5. **应急支持**：24小时在线

## Sample Output
```
【王女士家庭 东京5日自由行】
日期: 4/25-4/29 (2大1小)
预算: ¥28,000
已预定:
  - 机票: 东航¥4,800×3 往返
  - 酒店: 新宿4星 ¥5,500×4晚
  - 便民: JR Pass ¥2,500×2 (儿童免)
推荐行程:
  D1: 浅草寺+东京塔 (市内)
  D2: 迪士尼 (孩子主题)
  D3: 镰仓+江之岛 (一日往返)
  D4: 涩谷购物+夜景
  D5: 返程+机场退税
天气预警:
  - 4/27 预计下雨 → 已备选室内
  - 4/28 大风 → 调整户外为购物
当地提示:
  - 4/29 黄金周开始, 景点人多
  - 关西地震预警 不影响东京
应急:
  - 7×24 客服 微信/电话
  - 当地联络点: 新宿中华街
```
