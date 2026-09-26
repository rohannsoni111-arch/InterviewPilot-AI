import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_evaluate_interview_session():
    mock_session = {
        "id": "session-eval-1",
        "title": "STAFF Infrastructure Architect (SYSTEM DESIGN)",
        "type": "system_design",
        "difficulty": "staff",
        "targetRole": "Infrastructure Architect",
        "durationMinutes": 45,
        "durationSeconds": 2400,
        "strictness": "hard",
        "status": "completed",
        "focusTopics": ["Distributed Cache", "Raft"],
        "stages": [
            {"id": "stage-1", "title": "Scope & Requirements", "durationMinutes": 5, "order": 1, "status": "completed"},
            {"id": "stage-2", "title": "Architecture", "durationMinutes": 20, "order": 2, "status": "completed"},
            {"id": "stage-3", "title": "Deep Dive", "durationMinutes": 15, "order": 3, "status": "completed"},
            {"id": "stage-4", "title": "Review", "durationMinutes": 5, "order": 4, "status": "completed"}
        ],
        "messages": [
            {"role": "interviewer", "content": "How would you design a distributed cache?"},
            {
                "role": "candidate",
                "content": "I would design a multi-region distributed cache using consistent hashing with virtual nodes to balance key distribution evenly across shards. For high availability and partition tolerance, we will use Raft consensus for state replication, ensuring linearizable reads and atomic writes with bounded latency guarantees."
            },
            {"role": "interviewer", "content": "How do you handle node churn and network splits?"},
            {
                "role": "candidate",
                "content": "During network partitions, we adhere to majority quorums (N/2 + 1). Nodes isolated in the minority partition enter a read-only state or reject writes with a standard error to avoid split-brain inconsistencies."
            }
        ]
    }

    response = client.post("/api/v1/interview/evaluate", json={
        "session": mock_session,
        "history": mock_session["messages"]
    })

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    report = data["data"]
    assert report["overallScore"] >= 50
    assert report["verdict"] in ["strong_hire", "hire", "lean_hire", "lean_no_hire", "no_hire"]
    assert len(report["dimensionScores"]) == 5
    assert len(report["stageEvaluations"]) == 4
    assert len(report["strengths"]) > 0
    assert len(report["actionPlan"]) > 0
