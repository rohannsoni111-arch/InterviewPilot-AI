import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_SESSIONS = [
    {
        "id": "sess-1",
        "title": "Senior Distributed Systems Session",
        "type": "system_design",
        "status": "completed",
        "overallScore": 88,
        "durationSeconds": 2400,
        "createdAt": "2026-09-20T10:00:00Z",
        "completedAt": "2026-09-20T10:40:00Z",
        "evaluationReport": {
            "overallScore": 88,
            "dimensionScores": [
                {"dimension": "Technical & Algorithmic Correctness", "score": 90},
                {"dimension": "Problem-Solving & Architectural Depth", "score": 92},
                {"dimension": "Communication Clarity & Structure", "score": 85},
                {"dimension": "Edge Cases & Scalability Handling", "score": 88},
                {"dimension": "Code & Implementation Quality", "score": 84}
            ],
            "weaknesses": [
                "Database Partitioning: Replay lag during failovers",
                "Concurrency: Lock contention under extreme traffic"
            ]
        },
        "proctoringReport": {
            "integrityScore": 95,
            "flagLevel": "clean"
        }
    },
    {
        "id": "sess-2",
        "title": "Algorithms & LeetCode Hard Drill",
        "type": "coding",
        "status": "completed",
        "overallScore": 82,
        "durationSeconds": 1800,
        "createdAt": "2026-09-24T14:00:00Z",
        "completedAt": "2026-09-24T14:30:00Z",
        "evaluationReport": {
            "overallScore": 82,
            "dimensionScores": [
                {"dimension": "Technical & Algorithmic Correctness", "score": 85},
                {"dimension": "Problem-Solving & Architectural Depth", "score": 80},
                {"dimension": "Communication Clarity & Structure", "score": 80},
                {"dimension": "Edge Cases & Scalability Handling", "score": 82},
                {"dimension": "Code & Implementation Quality", "score": 86}
            ],
            "weaknesses": [
                "Concurrency: Thread starvation scenarios",
                "Dynamic Programming: Memory space optimization"
            ]
        },
        "proctoringReport": {
            "integrityScore": 98,
            "flagLevel": "clean"
        }
    }
]

def test_compute_analytics_with_sessions():
    response = client.post(
        "/api/v1/analytics/compute",
        json={
            "sessions": SAMPLE_SESSIONS,
            "targetRole": "Senior Backend Architect"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    res = data["data"]
    assert res["hasData"] is True
    assert res["overallReadinessScore"] >= 80
    assert "Senior" in res["readinessTier"] or "Staff" in res["readinessTier"]
    assert len(res["trackCompetencies"]) == 5
    assert len(res["dimensionAnalytics"]) == 5
    assert len(res["trajectory"]) == 2
    assert len(res["weaknessHeatmap"]) >= 1
    assert res["totalPracticeHours"] > 0
    assert res["averageIntegrityScore"] >= 90

def test_compute_analytics_empty_sessions():
    response = client.post(
        "/api/v1/analytics/compute",
        json={
            "sessions": [],
            "targetRole": "Software Engineer"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    res = data["data"]
    assert res["hasData"] is False
    assert res["overallReadinessScore"] is None
    assert len(res["trackCompetencies"]) == 5
