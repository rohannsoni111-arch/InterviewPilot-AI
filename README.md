# InterviewPilot AI

> **Adaptive AI Interview Simulation & Technical Assessment Platform**

InterviewPilot AI is a production-quality technical assessment system built to simulate realistic, adaptive interviews with dynamic depth-probing, real-time voice streaming, sandboxed code & SQL execution, interactive system design canvas, and deterministic rubric-based candidate readiness scoring.

---

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, ioredis, Pino, Zod
- **AI Service**: Python 3.10, FastAPI, Pydantic
- **Databases**: MongoDB, Redis, Qdrant
- **Containerization**: Docker, Docker Compose

---

## Local Development Setup

### 1. Install Dependencies
`ash
npm install
`

### 2. Build Shared Package
`ash
npm --workspace=shared run build
`

### 3. Run Backend & Frontend in Development
`ash
# Backend
npm --workspace=backend run dev

# Frontend
npm --workspace=frontend run dev

# AI Service (FastAPI)
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
`

---

## Testing

`ash
# Backend unit & integration tests
npm --workspace=backend run test

# Frontend tests
npm --workspace=frontend run test

# AI Service tests
cd ai-service && pytest
`

---

## Phase Status
- [x] **Phase 0**: Project Foundation & Shell (Complete)
- [ ] **Phase 1**: Authentication & User System
- [ ] **Phase 2**: Candidate Dashboard
