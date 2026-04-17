<p align="center">
  <img src="https://img.shields.io/badge/Agent_Square-General_Purpose-0A84FF?style=for-the-badge&labelColor=0D1117" alt="Agent Square — General" />
  <img src="https://img.shields.io/badge/Agents-31-00D4AA?style=for-the-badge&labelColor=0D1117" alt="31 Agents" />
  <img src="https://img.shields.io/badge/Bilingual-ZH_·_EN-7B61FF?style=for-the-badge&labelColor=0D1117" alt="Bilingual" />
</p>

<h1 align="center">Agent Square · General-Purpose Collection</h1>

<p align="center">
  <b>31 production-ready general-purpose AI agents</b><br/>
  <sub>Digital employees and horizontal-scenario agents covering secretary, translation, design, HR, contract, ESG, global expansion, knowledge base, and more.</sub>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#catalog">Catalog</a> ·
  <a href="#naming-system">Naming System</a> ·
  <a href="#file-format">File Format</a> ·
  <a href="#中文版">中文版</a>
</p>

---

## Overview

This directory is the **general-purpose slice** of the *Agent Square* series — the horizontal, industry-agnostic agents that act as digital employees inside any enterprise. Industry-specific slices (finance, manufacturing, energy, healthcare, etc.) live in the companion repo [Enterprise-AI-Lab/agent-square](https://github.com/Cliff-AI-Lab/Enterprise-AI-Lab/tree/main/agent-square).

| Track | Prefix | Count | Focus |
|-------|--------|------:|-------|
| Foundation Agents | `01–05` | 5 | Single-capability + API-bound specialists |
| Applied Composites | `A01–A08` | 8 | Multi-agent orchestration + multi-API workflows |
| Advanced Scenarios | `B01–B08` | 8 | Department-level platforms |
| Niche Verticals | `C01–C04` | 4 | Sub-domain concierges |
| Long-Tail Specialists | `D01–D06` | 6 | Specialized back-office roles |
| **Total** | | **31** | |

## Quick Start

### Option 1 — Claude Code Subagent

```bash
cp "en/10-General/A01-Enterprise-AI-Secretary.md" ~/.claude/agents/secretary.md
```

### Option 2 — System Prompt

Copy any `.md` file's content and paste it as the system prompt in Claude / ChatGPT / Gemini / domestic LLMs.

### Option 3 — Bundle Download

- Chinese: [`agent-square-general-zh.zip`](agent-square-general-zh.zip)
- English: [`agent-square-general-en.zip`](agent-square-general-en.zip)

## Catalog

### Foundation Agents

| # | English | 中文 |
|---|---------|------|
| 01 | Weather Forecaster | 天气预报员 |
| 02 | News Aggregation Editor | 新闻聚合编辑 |
| 03 | Multilingual Translator | 多语言翻译官 |
| 04 | Document Generator | 文档生成专家 |
| 05 | Data Visualization Specialist | 数据可视化师 |

### Applied Composites (A-series)

| # | English | 中文 |
|---|---------|------|
| A01 | Enterprise AI Secretary | 企业智慧秘书 |
| A02 | Auto Meeting Minutes | 会议纪要全自动 |
| A03 | Competitive Intelligence Radar | 竞争情报雷达 |
| A04 | Bid & Tender Specialist | 招投标专员 |
| A05 | Contract Lifecycle Manager | 合同全生命周期 |
| A06 | ESG Report Auto-Generator | ESG报告一键生成 |
| A07 | Enterprise Global Expansion | 企业出海全链 |
| A08 | Knowledge-Base RAG Steward | 知识库RAG管家 |

### Advanced Scenarios (B-series)

| # | English | 中文 |
|---|---------|------|
| B01 | Content Creation Studio | 内容创作工作室 |
| B02 | Brand Design System | 品牌设计系统 |
| B03 | HR-Tech Platform | HR数字化平台 |
| B04 | Real-Estate Platform | 房产中介平台 |
| B05 | Travel Concierge | 旅游出游管家 |
| B06 | Subscription Management | 订阅制管家 |
| B07 | Open-Source Project Ops | 开源项目运营 |
| B08 | Video Conferencing Platform | 视频会议平台 |

### Niche Verticals (C-series)

| # | English | 中文 |
|---|---------|------|
| C01 | Corporate PR Crisis | 企业公关响应 |
| C02 | Enterprise Training Bot | 企业培训Bot |
| C03 | Employee Benefits | 员工福利平台 |
| C04 | Corporate Gifting | 企业礼品采购 |

### Long-Tail Specialists (D-series)

| # | English | 中文 |
|---|---------|------|
| D01 | Admin Concierge | 企业行政管家 |
| D02 | Procurement Digital | 采购数字化 |
| D03 | Corporate Legal Advisor | 企业法律顾问 |
| D04 | Equity Compensation | 股权激励管家 |
| D05 | Business Intelligence Report | 企业数据报告 |
| D06 | Digital Collectibles Ops | 数字藏品运营 |

## Naming System

Inside each industry folder, agents use prefix semantics:

- **01–, 02–, …** — Foundation agents (single capability + API binding)
- **A01, A02, …** — Applied composites (multi-agent orchestration + multi-API)
- **B01, B02, …** — Advanced scenarios
- **C01, C02, …** — Niche verticals
- **D01, D02, …** — Long-tail specialists

## File Format

Each `.md` follows a YAML frontmatter + body layout:

```yaml
---
name: 中文名
name_en: English Name
type: 组合应用        # optional
industry: 所属行业
apis: [API list]
emoji: icon
---
```

Body sections:

1. **Application Scenario** — what problem it solves
2. **Core Capabilities / Bound APIs** — what it can do + what it plugs into
3. **Workflow** — step-by-step operation (detailed variants included)
4. **Typical Output** — deliverable samples

## Directory Structure

```
agent-square/
├── zh/10-通用/              (31 Chinese md files)
├── en/10-General/           (31 English md files)
├── agent-square-general-zh.zip
├── agent-square-general-en.zip
└── README.md
```

---

## 中文版

### 概述

本目录是 *Agent广场* 系列中的**通用部分** —— 跨行业的水平向智能体，可作为任何企业内的数字员工。行业专属部分（金融、制造、能源、医药等）见姐妹仓库 [Enterprise-AI-Lab/agent-square](https://github.com/Cliff-AI-Lab/Enterprise-AI-Lab/tree/main/agent-square)。

### 31 个通用智能体分布

| 层级 | 前缀 | 数量 | 定位 |
|------|------|-----:|------|
| 基础专业 | `01–05` | 5 | 单一能力 + API 绑定 |
| 组合应用 | `A01–A08` | 8 | 多 Agent 编排 + 多 API |
| 进阶场景 | `B01–B08` | 8 | 部门级平台 |
| 细分领域 | `C01–C04` | 4 | 子领域管家 |
| 长尾垂直 | `D01–D06` | 6 | 后台专员角色 |
| **合计** | | **31** | |

### 三种使用方式

1. **Claude Code 子代理**：`cp "zh/10-通用/A01-企业智慧秘书.md" ~/.claude/agents/secretary.md`
2. **系统提示词**：复制 md 内容贴到任意大模型的系统提示词位置
3. **整包下载**：[`agent-square-general-zh.zip`](agent-square-general-zh.zip)

### 设计理念

1. **一个智能体 = 角色 + 能力 + 数据**
2. **基础 → 组合** 的进阶路径（数字前缀 → A/B/C/D 系列）
3. **场景优先** — 31 个真实业务锚点
4. **交付物可见** — 每个文件均含典型输出样例

---

<p align="center">
  <a href="https://github.com/Cliff-AI-Lab/Ruidong-AI"><img src="https://img.shields.io/badge/RuidongAI-More_Projects-0A84FF?style=for-the-badge&logo=github&labelColor=0D1117" alt="RuidongAI" /></a>
  &nbsp;
  <a href="https://x.com/RaytoneAI"><img src="https://img.shields.io/badge/@RaytoneAI-Follow-00D4AA?style=for-the-badge&logo=x&logoColor=white&labelColor=0D1117" alt="X (Twitter)" /></a>
</p>
