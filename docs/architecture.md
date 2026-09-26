# InterviewPilot AI — Architecture Blueprint

## System Topology
InterviewPilot AI is organized as a decoupled, multi-service architecture designed for high availability, deterministic assessment execution, and safe untrusted code execution.

### Core Subsystems
1. **Frontend Web Client (rontend/)**: React 18 SPA with strict Light/Dark mode, responsive layouts, Monaco Editor, React Flow canvas, WebRTC voice controls.
2. **Core Backend Engine (ackend/)**: Express + TypeScript REST/WebSocket API with robust middleware, Zod schema validation, and structured Pino logging.
3. **AI Evaluation Microservice (i-service/)**: FastAPI Python service handling embeddings, PDF resume vectorization, and structured evaluator prompts.
4. **Data Tier**: MongoDB (user state, interview logs, submissions), Redis (active session cache, rate-limits, BullMQ queues), Qdrant (resume RAG embeddings).
5. **Execution Sandboxes**: Isolated Docker containers with CPU/Memory/Network constraints for Python/Java/JS and PostgreSQL playground.
