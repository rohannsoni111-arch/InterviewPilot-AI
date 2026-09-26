import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = """
Jane Doe
Senior Full-Stack Engineer
Email: jane.doe@example.com | Phone: (555) 123-4567

Summary:
Over 6 years of experience building resilient distributed microservices, scalable frontend systems, and high-volume data streaming pipelines.

Technical Skills:
- Languages: TypeScript, Python, Go, JavaScript, SQL
- Frameworks: React, Node.js, FastAPI, Next.js, Express
- Infrastructure: Docker, AWS, Kubernetes, Git, CI/CD, Redis, PostgreSQL
- Practices: System Design, Agile, Mentorship, Concurrency

Work Experience:
Lead Software Engineer | Apex Cloud Systems (2022 - Present)
- Architected event-driven microservices processing 50K events/sec using Kafka and Redis.
- Led migration of monolith to Kubernetes container clusters with 99.99% uptime SLA.
- Spearheaded team technical mentoring and standardized PR code reviews.

Software Engineer | FinTech Innovations (2019 - 2022)
- Built financial reconciliation platform using TypeScript, React, and PostgreSQL.
- Optimized database indexing to reduce query execution latency by 45%.

Education:
Bachelor of Science in Computer Science | Stanford University (2019)

Projects:
Distributed Key-Value Store
- Implemented Raft consensus protocol and consistent hashing in Go with zero data loss on node churn.
"""

SAMPLE_JD = """
Job Title: Senior Distributed Systems Engineer
Requirements:
- 5+ years building backend systems in Go, Python, or TypeScript.
- Strong knowledge of Distributed Systems, Concurrency, Microservices, and Redis.
- Hands-on experience with Docker, Kubernetes, and AWS cloud environments.
- Excellent communication and system design skills.
"""

def test_parse_resume_endpoint():
    response = client.post(
        "/api/v1/resume/parse",
        json={"rawText": SAMPLE_RESUME}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    parsed = data["data"]
    assert parsed["candidateName"] == "Jane Doe"
    assert parsed["email"] == "jane.doe@example.com"
    assert "TypeScript" in parsed["skills"]["technical"]
    assert "React" in parsed["skills"]["frameworks"]
    assert "Docker" in parsed["skills"]["tools"]
    assert len(parsed["experience"]) >= 1
    assert len(parsed["education"]) >= 1

def test_match_resume_to_jd_endpoint():
    response = client.post(
        "/api/v1/resume/match",
        json={
            "rawResumeText": SAMPLE_RESUME,
            "jobDescription": SAMPLE_JD,
            "targetRole": "Senior Distributed Systems Engineer"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    match_result = data["data"]
    assert match_result["matchScore"] >= 70
    assert "TypeScript" in match_result["matchedSkills"] or "Go" in match_result["matchedSkills"] or "Redis" in match_result["matchedSkills"]
    assert len(match_result["recommendedFocusTopics"]) > 0
    assert len(match_result["tailoredInterviewPrompts"]) > 0

def test_evaluate_proctoring_endpoint_clean():
    events = [
        {"id": "ev-1", "sessionId": "sess-1", "timestamp": "2026-09-27T01:00:00Z", "eventType": "tab_blur", "severity": "low"},
        {"id": "ev-2", "sessionId": "sess-1", "timestamp": "2026-09-27T01:00:05Z", "eventType": "tab_focus", "severity": "low"}
    ]
    response = client.post(
        "/api/v1/resume/proctoring/evaluate",
        json={
            "sessionId": "sess-1",
            "events": events
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    report = data["data"]
    assert report["integrityScore"] >= 90
    assert report["flagLevel"] == "clean"

def test_evaluate_proctoring_endpoint_flagged():
    # Simulate excessive tab switches and large code injection
    events = [
        {"id": f"ev-{i}", "sessionId": "sess-2", "timestamp": "2026-09-27T01:00:00Z", "eventType": "tab_blur", "severity": "medium"}
        for i in range(12)
    ]
    events.append({
        "id": "ev-paste",
        "sessionId": "sess-2",
        "timestamp": "2026-09-27T01:00:00Z",
        "eventType": "clipboard_paste",
        "severity": "high",
        "metadata": {"charCount": 400}
    })
    response = client.post(
        "/api/v1/resume/proctoring/evaluate",
        json={
            "sessionId": "sess-2",
            "events": events
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    report = data["data"]
    assert report["integrityScore"] < 70
    assert report["flagLevel"] in ["suspicious", "flagged"]
