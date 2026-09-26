# 🎯 InterviewPilot AI — Autonomous Technical Interview & Assessment Platform

[![CI / CD](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-109%20passed%20(100%25)-success.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)]()
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED.svg)]()

> **InterviewPilot AI** is an enterprise-grade, multi-track, adaptive AI technical interview simulation and assessment platform. It goes beyond generic AI chat wrappers by delivering structured multi-stage interviews, real-time code execution with static linting & AST safety analysis, anti-cheat proctoring telemetry, multi-track competency radar analytics, and a real-time voice studio with selectable examiner personas.

---

## 🏗️ Architecture Overview

```
                                  ┌───────────────────────────────┐
                                  │   Frontend SPA (React/Vite)   │
                                  │   • Split Studio (Chat/Code)  │
                                  │   • Real-Time Voice Waveforms │
                                  │   • Proctoring Telemetry Hook │
                                  │   • Radar & Growth Analytics  │
                                  └───────────────┬───────────────┘
                                                  │ HTTP / WebSockets
                                                  ▼
┌──────────────────────────────┐  JWT Auth / REST ┌───────────────────────────────┐
│     MongoDB 7 & Redis 7      │ ◄──────────────► │  Backend API (Node/Express/TS)│
│  • User & Auth Store         │                  │  • Session State Machine      │
│  • Resumes & Structured AST  │                  │  • Proctoring Event Aggregator│
│  • Historical Interview Runs │                  │  • Code Runner Orchestrator   │
│  • Token Blacklisting        │                  │  • Speech Proxy & Audio Buffer│
└──────────────────────────────┘                  └───────────────┬───────────────┘
                                                                  │ HTTP Microservice
                                                                  ▼
                                                  ┌───────────────────────────────┐
                                                  │  AI Microservice (FastAPI/Py) │
                                                  │  • Multi-Stage LLM Evaluator  │
                                                  │  • Safe Code Sandbox (Py/JS/SQL)│
                                                  │  • Resume Parsing & JD Matcher│
                                                  │  • Track Competency Analytics │
                                                  │  • WAV Voice Synthesis (TTS)  │
                                                  └───────────────────────────────┘
```

---

## ⚡ Key Capabilities & Feature Matrix

| Feature | Description |
|---|---|
| **Adaptive Stage Orchestration** | 4-Stage interview pipeline (*Problem Discovery*, *Architecture Design*, *Live Coding*, *Complexity Trade-offs*). |
| **Multi-Language Code Runner** | In-browser Monaco editor + sandboxed execution supporting Python, JavaScript, TypeScript, and SQL with test suites and Big-O verification. |
| **Real-Time Voice Studio** | Live audio waveform canvas, Web Speech STT streaming, and AI Examiner vocal synthesis with selectable examiner personas (*Sarah Blake*, *Alex Rivera*, *Elena Rostova*, *Marcus Vance*). |
| **Proctoring & Anti-Cheat Engine** | Tracks tab switches, document visibility, window blur/focus, and copy-paste size bursts to calculate candidate integrity index scores. |
| **Resume Parsing & JD Fit Analysis** | Multi-format text extraction into structured taxonomies (skills, seniorities, education, projects) with semantic role matching. |
| **Performance Radar & Heatmaps** | Multi-track competency radars (DSA, System Design, SQL, Behavioral, Technical) and recurring weakness clustering with 1-click drill launcher. |
| **Comprehensive Reports** | Categorical scoring rubrics (0-100), hiring verdicts (*Strong Hire*, *Hire*, *Lean Hire*, *Reject*), and customized growth roadmaps. |

---

## 🚀 Quick Start with Docker Compose

To launch all 5 containers (**MongoDB**, **Redis**, **AI Service**, **Backend API**, and **Frontend SPA**) with health checks and volume persistence:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/interviewpilot-ai.git
cd interviewpilot-ai

# 2. Configure Environment (Optional - defaults provided)
cp .env.example .env

# 3. Build and launch all services in detached mode
docker-compose up --build -d

# 4. View running container status
docker-compose ps
```

Once started, access the platform at:
- 🌐 **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- 🤖 **AI Microservice Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `v3.10.x` or higher
- **MongoDB**: `v6.0+` (or Docker container)
- **Redis**: `v7.0+` (or Docker container)

### 1. Install Dependencies
```bash
# Install root, shared, backend, and frontend packages
npm install

# Setup Python dependencies in ai-service
cd ai-service
pip install -r requirements.txt # or install fastapi uvicorn pydantic
cd ..
```

### 2. Build Shared Package
```bash
npm --workspace=shared run build
```

### 3. Seed Database with Realistic Demo Data
```bash
npm --workspace=backend run seed
```
> **Pre-configured Demo Credentials:**
> - **Candidate**: `candidate@interviewpilot.ai` / `Password123!`
> - **Administrator**: `admin@interviewpilot.ai` / `Password123!`

### 4. Run Development Servers
```bash
# Terminal 1: Backend API
npm --workspace=backend run dev

# Terminal 2: AI Microservice
cd ai-service
uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend SPA
npm --workspace=frontend run dev
```

---

## 🧪 Comprehensive Test Suites

InterviewPilot AI adheres to a strict 100% test pass rate across all tiers:

```bash
# 1. AI Microservice Pytest (19 tests)
pytest ai-service/tests

# 2. Backend Jest Test Suites (57 tests, 9 suites)
npm --workspace=backend test

# 3. Frontend Vitest Component Suites (33 tests, 11 suites)
npm --workspace=frontend test

# 4. Full Monorepo Build Verification
npm run build
```

**Total Platform Test Count: 109 automated tests passing with 0 failures.**

---

## 🔒 Security Protocols
- **JWT Authentication**: Short-lived Access Tokens (15m) + Rotating Refresh Tokens (7d) with Redis blacklisting.
- **AST Code Sandboxing**: AST-level sanitization against malicious imports, system exec calls, and resource exhaustion.
- **Client & Server Proctoring**: Anti-cheat integrity calculation with granular event logs.
- **OWASP Headers**: Strict Helmet security headers, CORS origin whitelisting, and rate-limiting middleware.

---

## 📄 License
MIT License. Copyright © 2026 InterviewPilot AI Team.
