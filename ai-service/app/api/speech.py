from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.speech_service import SpeechService

router = APIRouter()

class VoiceProfileModel(BaseModel):
    id: str
    name: str
    gender: str
    accent: str
    style: str
    avatar: str
    description: str

class TTSRequest(BaseModel):
    text: str
    voiceId: Optional[str] = "sarah-rigorous"
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0

class TTSResponse(BaseModel):
    audioDataUrl: str
    format: str
    durationMs: int
    voiceId: str

class STTRequest(BaseModel):
    audioBase64: str
    format: Optional[str] = "wav"
    sampleRate: Optional[int] = 16000

class STTResponse(BaseModel):
    text: str
    confidence: float
    durationMs: int

@router.get("/voices", response_model=List[VoiceProfileModel])
async def get_voices():
    """
    Returns available AI Examiner vocal personas.
    """
    return SpeechService.get_voice_profiles()

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest):
    """
    Synthesizes AI Examiner speech from text.
    """
    try:
        result = SpeechService.synthesize_speech(
            text=request.text,
            voice_id=request.voiceId or "sarah-rigorous",
            speed=request.speed or 1.0,
            pitch=request.pitch or 1.0
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failure: {str(e)}"
        )

@router.post("/transcribe", response_model=STTResponse)
async def transcribe_speech(request: STTRequest):
    """
    Transcribes candidate spoken audio to text.
    """
    try:
        result = SpeechService.transcribe_audio(
            audio_base64=request.audioBase64,
            format_type=request.format or "wav",
            sample_rate=request.sampleRate or 16000
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech transcription failure: {str(e)}"
        )
