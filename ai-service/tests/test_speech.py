import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.speech_service import SpeechService

client = TestClient(app)

def test_get_voice_profiles():
    response = client.get("/api/v1/speech/voices")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    ids = [v["id"] for v in data]
    assert "sarah-rigorous" in ids
    assert "alex-architect" in ids

def test_synthesize_speech_endpoint():
    payload = {
        "text": "Could you walk me through the lock-free queue concurrency model?",
        "voiceId": "alex-architect",
        "speed": 1.1,
        "pitch": 1.0
    }
    response = client.post("/api/v1/speech/synthesize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audioDataUrl" in data
    assert data["audioDataUrl"].startswith("data:audio/wav;base64,")
    assert data["format"] == "wav"
    assert data["durationMs"] > 0
    assert data["voiceId"] == "alex-architect"

def test_transcribe_audio_endpoint():
    # Provide synthetic base64 WAV payload
    sample_wav = SpeechService.generate_wav_audio_buffer(0.5, 440.0)
    import base64
    b64_str = base64.b64encode(sample_wav).decode("utf-8")

    payload = {
        "audioBase64": f"data:audio/wav;base64,{b64_str}",
        "format": "wav",
        "sampleRate": 24000
    }
    response = client.post("/api/v1/speech/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert len(data["text"]) > 0
    assert "confidence" in data
    assert data["confidence"] > 0.5
    assert data["durationMs"] > 0
