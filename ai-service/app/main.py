from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.health import router as health_router
from app.api.interviewer import router as interviewer_router
from app.api.code import router as code_router
from app.api.resume import router as resume_router
from app.api.analytics import router as analytics_router
from app.api.speech import router as speech_router

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["Health"])
app.include_router(interviewer_router, tags=["AI Interviewer"])
app.include_router(code_router, tags=["Code Runner & Analysis"])
app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resume & Proctoring"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics & Radar"])
app.include_router(speech_router, prefix="/api/v1/speech", tags=["Voice Studio & Speech Engine"])



@app.get("/")
async def root():
    return {
        "message": "InterviewPilot AI Service running",
        "version": "1.0.0",
        "docs": "/docs"
    }
