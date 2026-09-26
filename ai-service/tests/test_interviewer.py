from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_start_interview():
    payload = {
        "session": {
            "targetRole": "Staff Distributed Systems Architect",
            "type": "system_design",
            "difficulty": "staff",
            "strictness": "hard",
            "focusTopics": ["Distributed Caching", "Raft Consensus"],
            "stages": [
                {"title": "Scope & Requirements", "durationMinutes": 5},
                {"title": "High-Level Architecture", "durationMinutes": 15},
                {"title": "Scalability & Fault Tolerance", "durationMinutes": 20},
                {"title": "Debrief", "durationMinutes": 5}
            ]
        }
    }
    response = client.post("/api/v1/interview/start", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Stage 1: Scope & Requirements" in data["message"]
    assert len(data["suggested_follow_ups"]) > 0

def test_turn_interview():
    payload = {
        "session": {
            "targetRole": "Staff Distributed Systems Architect",
            "type": "system_design",
            "difficulty": "staff",
            "strictness": "ruthless_faang",
            "focusTopics": ["Distributed Caching", "Redis"],
            "currentStageIndex": 0,
            "stages": [
                {"title": "Scope & Requirements", "durationMinutes": 5},
                {"title": "High-Level Architecture", "durationMinutes": 15}
            ]
        },
        "history": [],
        "candidate_response": "I would place a Redis cache in front of PostgreSQL to absorb read queries."
    }
    response = client.post("/api/v1/interview/turn", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "cache" in data["message"].lower()

def test_advance_stage():
    payload = {
        "session": {
            "stages": [
                {"title": "Scope", "durationMinutes": 5, "description": "Clarify constraints"},
                {"title": "Deep Dive", "durationMinutes": 20, "description": "Implement solution"}
            ]
        },
        "new_stage_idx": 1
    }
    response = client.post("/api/v1/interview/advance-stage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Stage 2: Deep Dive" in data["message"]
