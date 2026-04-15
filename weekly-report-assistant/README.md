<div align="center">

<img src="assets/header-banner.svg" width="100%" alt="Weekly Report Assistant" />

<br/>

[![Stack](https://img.shields.io/badge/Stack-React_+_Express-0A84FF?style=for-the-badge&labelColor=0D1117)](#-tech-stack)
[![AI](https://img.shields.io/badge/AI-LLM_Powered-00D4AA?style=for-the-badge&labelColor=0D1117)](#-ai-powered-extraction)
[![Format](https://img.shields.io/badge/Supports-Excel_·_Word-7B61FF?style=for-the-badge&labelColor=0D1117)](#-features)
[![License](https://img.shields.io/badge/License-MIT-58A6FF?style=for-the-badge&labelColor=0D1117)](#-license)

<br/>

**An AI-powered weekly report analysis platform that transforms raw Excel/Word reports into structured, actionable insights.**

*Upload your team's weekly reports, let AI extract and organize the data, visualize and manage everything in one place.*

<br/>

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [中文](#-中文)

</div>

<br/>

<img src="assets/divider.svg" width="100%" />

<br/>

<h2><img src="assets/icon-vision.svg" width="36" align="center" />&nbsp; Overview</h2>

> **Weekly reports shouldn't be a chore to read — they should be a source of insight.**

Most teams spend hours writing weekly reports in Excel or Word, but reading and analyzing them takes even longer. This tool uses **LLM-powered extraction** to automatically parse, structure, and visualize report data — turning scattered spreadsheets into organized, searchable, actionable intelligence.

<br/>

<h2><img src="assets/icon-why.svg" width="36" align="center" />&nbsp; Features</h2>

<table>
<tr>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-upload.svg" alt="Smart Upload" />
<br/><br/>
<b>Smart Upload</b>
<br/>
<sub>Drag & drop Excel (.xlsx) and<br/>Word (.docx) files with auto-parsing</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-extract.svg" alt="AI Extraction" />
<br/><br/>
<b>AI Extraction</b>
<br/>
<sub>LLM intelligently extracts titles,<br/>fields, importance, and timelines</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-dashboard.svg" alt="Dashboard View" />
<br/><br/>
<b>Dashboard View</b>
<br/>
<sub>KPI cards, section tabs, data tables<br/>with importance-based highlighting</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-chat.svg" alt="AI Chat" />
<br/><br/>
<b>AI Chat</b>
<br/>
<sub>Conversational interface to query<br/>and interact with report data</sub>
<br/><br/>
</td>
</tr>
</table>

<br/>

**Additional capabilities:**

- Multi-report management with history tracking
- Section-level editing and drill-down views
- Dark / Light theme toggle
- Configurable LLM backend (any OpenAI-compatible API)
- Merged cell handling in complex Excel sheets
- Voice input support

<br/>

<h2><img src="assets/icon-quickstart.svg" width="36" align="center" />&nbsp; Quick Start</h2>

```bash
# 1. Clone the repository
git clone https://github.com/Cliff-AI-Lab/weekly-report-assistant.git
cd weekly-report-assistant

# 2. Install dependencies
npm install

# 3. Build the frontend
npm run build

# 4. Start the server
node server.cjs
```

Open `http://localhost:4173` in your browser. Then:

1. Go to **Settings** — enter your API Key and endpoint
2. Go to **Data Entry** — upload an Excel or Word weekly report
3. AI extracts and structures the data automatically
4. View results in **Dashboard** — browse sections, filter by importance

<br/>

<h2><img src="assets/icon-arch.svg" width="36" align="center" />&nbsp; Architecture</h2>

```
┌─────────────────────────────────────────────────────────────────┐
│                   Weekly Report Assistant                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│   │  Dashboard  │  │  AI Chat   │  │  Settings  │              │
│   │  (Overview) │  │  (Upload)  │  │  (API Cfg) │              │
│   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
│         │               │               │                       │
│   ┌─────▼───────────────▼───────────────▼──────┐               │
│   │         React 19 + TypeScript + Vite        │               │
│   │   Zustand Store · Recharts · Tailwind CSS   │               │
│   └──────────────────┬─────────────────────────┘               │
│                      │ REST API                                 │
│   ┌──────────────────▼─────────────────────────┐               │
│   │            Express 5 Backend                │               │
│   │   File Parsing · LLM Proxy · Settings API  │               │
│   └──────────────────┬─────────────────────────┘               │
│                      │                                          │
│   ┌──────────────────▼─────────────────────────┐               │
│   │        OpenAI-Compatible LLM API           │               │
│   │   GPT · Claude · GLM · Qwen · Any LLM     │               │
│   └────────────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

<br/>

<h2><img src="assets/icon-security.svg" width="36" align="center" />&nbsp; Tech Stack</h2>

| Layer | Technology |
|:---:|:---|
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 |
| **UI** | Recharts · Lucide Icons · React Router 7 |
| **Backend** | Express 5 · Node.js |
| **File Parsing** | mammoth (Word) · xlsx (Excel) |
| **AI** | OpenAI-compatible Chat Completions API |
| **State** | Zustand (client-side store) |

<br/>

<img src="assets/divider.svg" width="100%" />

<br/>

<div align="center">

## 🇨🇳 中文

# 周报助手 — AI 驱动的周报分析平台

### 上传 · 提取 · 分析 · 可视化

</div>

<br/>

<h2><img src="assets/icon-vision.svg" width="36" align="center" />&nbsp; 简介</h2>

> **周报不应该只是一堆表格——它应该是洞察的来源。**

大多数团队每周花大量时间编写 Excel / Word 周报，但阅读和分析它们的时间更长。本工具使用 **LLM 智能提取**，自动解析、结构化和可视化周报数据——将散落的电子表格转化为有组织、可检索、可执行的情报。

<br/>

<h2><img src="assets/icon-why.svg" width="36" align="center" />&nbsp; 核心功能</h2>

<table>
<tr>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-upload.svg" alt="智能上传" />
<br/><br/>
<b>智能上传</b>
<br/>
<sub>拖拽上传 Excel (.xlsx)<br/>和 Word (.docx) 文件，自动解析</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-extract.svg" alt="AI 提取" />
<br/><br/>
<b>AI 智能提取</b>
<br/>
<sub>LLM 自动提取标题、字段<br/>重要度、时间节点</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-dashboard.svg" alt="仪表盘" />
<br/><br/>
<b>仪表盘概览</b>
<br/>
<sub>KPI 卡片、板块分组、数据表格<br/>按重要度高亮标注</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<img width="80" src="assets/icon-chat.svg" alt="AI 对话" />
<br/><br/>
<b>AI 对话</b>
<br/>
<sub>对话式交互界面<br/>查询和分析周报数据</sub>
<br/><br/>
</td>
</tr>
</table>

<br/>

<h2><img src="assets/icon-quickstart.svg" width="36" align="center" />&nbsp; 快速开始</h2>

```bash
# 1. 克隆仓库
git clone https://github.com/Cliff-AI-Lab/weekly-report-assistant.git
cd weekly-report-assistant

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 启动服务
node server.cjs
```

浏览器打开 `http://localhost:4173`，然后：

1. 进入 **设置** — 配置 API Key 和接口地址（支持任意 OpenAI 兼容接口）
2. 进入 **数据录入** — 上传 Excel 或 Word 周报文件
3. AI 自动提取并结构化数据
4. 在 **概览** 中查看结果 — 按板块浏览，按重要度筛选

<br/>

<h2><img src="assets/icon-arch.svg" width="36" align="center" />&nbsp; 技术架构</h2>

| 层级 | 技术栈 |
|:---:|:---|
| **前端** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 |
| **UI 组件** | Recharts 图表 · Lucide 图标 · React Router 7 |
| **后端** | Express 5 · Node.js |
| **文件解析** | mammoth (Word) · xlsx (Excel) |
| **AI 引擎** | OpenAI 兼容 Chat Completions API |
| **状态管理** | Zustand |

<br/>

<img src="assets/divider.svg" width="100%" />

<br/>

<div align="center">

<h2><img src="assets/icon-contact.svg" width="36" align="center" />&nbsp; Contributing / 贡献</h2>

PRs and issues are welcome! Feel free to fork, improve, and submit a pull request.

欢迎提交 PR 和 Issue！

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Cliff--AI--Lab-58A6FF?style=for-the-badge&logo=github&logoColor=white&labelColor=0D1117)](https://github.com/Cliff-AI-Lab)

<br/>

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

<br/>

---

<sub>

**Weekly Report Assistant** — Let AI turn your reports into insights.

**周报助手** — 让 AI 把周报变成洞察。

</sub>

<br/>
<br/>

Copyright &copy; 2025 Cliff AI Lab. All rights reserved.

</div>
