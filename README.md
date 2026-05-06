# 🔭 DataLens

> **Local-first, AI-powered data visualization. Drop in a dataset or connect a database — DataLens figures out what to show you.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)

DataLens is an open-source alternative to Tableau and Power BI that runs entirely on your machine. It automatically profiles your data schema, understands column relationships, and uses AI to suggest the most meaningful visualizations.

## ✨ Features
- 🗂 **File Ingestion** — CSV, JSON, Parquet, Excel
- 🔌 **Database Connections** — PostgreSQL, MySQL, SQLite, BigQuery
- 🧠 **AI-Powered Suggestions** — Claude reads your schema and recommends charts
- 💬 **Natural Language Queries** — "Show me sales by region for Q3"
- 📊 **20+ Chart Types** — via Apache ECharts
- 🖱 **Drag-and-Drop Dashboard** — build multi-panel dashboards
- 🔒 **Local-First** — your data never leaves your machine

## 🚀 Quick Start

```bash
git clone https://github.com/lrbudreau/data-lens.git
cd data-lens
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
cp .env.example .env  # Add your ANTHROPIC_API_KEY
```

Then run: `uvicorn main:app --reload` and `npm run dev`

## 🏗 Architecture
- **backend/** — FastAPI + schema profiler + Claude AI integration  
- **frontend/** — React + Vite + ECharts + Zustand
- **connectors/** — PostgreSQL, MySQL, SQLite, CSV/JSON/Parquet/Excel
- **ai/** — Chart suggestions, NL queries, automated insights

## 📄 License
MIT © [lrbudreau](https://github.com/lrbudreau)
