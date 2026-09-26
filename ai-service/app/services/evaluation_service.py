import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class EvaluateSessionRequest(BaseModel):
    session: Dict[str, Any]
    history: Optional[List[Dict[str, Any]]] = None

class DimensionScoreModel(BaseModel):
    dimension: str
    score: int
    maxScore: int = 100
    feedback: str
    status: str # exceeds, meets, below

class StageEvaluationModel(BaseModel):
    stageId: str
    stageTitle: str
    score: int
    feedback: str
    keyObservations: List[str]
    strengths: List[str]
    areasForImprovement: List[str]

class EvaluationReportModel(BaseModel):
    overallScore: int
    verdict: str # strong_hire, hire, lean_hire, lean_no_hire, no_hire
    summary: str
    dimensionScores: List[DimensionScoreModel]
    stageEvaluations: List[StageEvaluationModel]
    strengths: List[str]
    weaknesses: List[str]
    actionPlan: List[str]
    generatedAt: str

class EvaluationService:
    @classmethod
    def evaluate_interview(cls, req: EvaluateSessionRequest) -> Dict[str, Any]:
        session = req.session
        messages = req.history or session.get("messages", [])
        track = session.get("type", "technical")
        role = session.get("targetRole", "Software Engineer")
        difficulty = session.get("difficulty", "senior")
        strictness = session.get("strictness", "realistic")
        stages = session.get("stages", [])

        # Analyze Candidate Messages
        candidate_turns = [m for m in messages if m.get("role") == "candidate"]
        total_candidate_words = sum(len(m.get("content", "").split()) for m in candidate_turns)
        has_code_submissions = any("codeSnippet" in m or "```" in m.get("content", "") for m in candidate_turns)

        # Baseline Scoring based on response depth and interview track
        base_score = 75
        if total_candidate_words > 250:
            base_score += 12
        elif total_candidate_words > 100:
            base_score += 8
        elif total_candidate_words > 40:
            base_score += 4
        else:
            base_score -= 8

        if has_code_submissions:
            base_score += 5

        # Strictness Modifier
        if strictness == "ruthless_faang":
            base_score -= 5
        elif strictness == "hard":
            base_score -= 2
        elif strictness == "friendly":
            base_score += 3

        # Difficulty Modifier for very sparse responses
        if difficulty in ["staff", "principal"] and total_candidate_words < 40:
            base_score -= 10

        overall_score = max(35, min(98, base_score))

        # Determine Verdict
        if overall_score >= 88:
            verdict = "strong_hire"
        elif overall_score >= 76:
            verdict = "hire"
        elif overall_score >= 65:
            verdict = "lean_hire"
        elif overall_score >= 52:
            verdict = "lean_no_hire"
        else:
            verdict = "no_hire"

        # 5 Core Dimension Scores
        dimension_scores = [
            DimensionScoreModel(
                dimension="Technical & Algorithmic Correctness",
                score=min(100, max(45, overall_score + 2)),
                feedback=f"Demonstrated sound technical foundation for {role} level standards.",
                status="exceeds" if overall_score >= 85 else ("meets" if overall_score >= 68 else "below")
            ),
            DimensionScoreModel(
                dimension="Problem-Solving & Architectural Depth",
                score=min(100, max(40, overall_score - 3)),
                feedback="Structured problem breakdown with clear component decomposition.",
                status="exceeds" if overall_score >= 82 else ("meets" if overall_score >= 65 else "below")
            ),
            DimensionScoreModel(
                dimension="Communication Clarity & Structure",
                score=min(100, max(50, overall_score + 4)),
                feedback="Articulate technical phrasing with concise explanations.",
                status="exceeds" if overall_score >= 80 else ("meets" if overall_score >= 65 else "below")
            ),
            DimensionScoreModel(
                dimension="Edge Cases & Scalability Handling",
                score=min(100, max(38, overall_score - 5)),
                feedback="Considered partition tolerance and load limits under pressure.",
                status="exceeds" if overall_score >= 88 else ("meets" if overall_score >= 68 else "below")
            ),
            DimensionScoreModel(
                dimension="Code & Implementation Quality",
                score=min(100, max(48, overall_score + 1)),
                feedback="Clean modular styling with idiomatic language patterns.",
                status="exceeds" if overall_score >= 84 else ("meets" if overall_score >= 67 else "below")
            )
        ]

        # Stage Evaluations
        stage_evaluations = []
        for idx, stage in enumerate(stages):
            stage_score = min(100, max(45, overall_score + (idx % 2 == 0 and 3 or -2)))
            stage_evaluations.append(
                StageEvaluationModel(
                    stageId=stage.get("id", f"stage-{idx+1}"),
                    stageTitle=stage.get("title", f"Stage {idx+1}"),
                    score=stage_score,
                    feedback=f"Addressed core objectives of {stage.get('title')}. Maintained focus on target constraints.",
                    keyObservations=[
                        f"Engaged actively with {stage.get('title')} requirements.",
                        "Addressed interviewer probes without major regressions."
                    ],
                    strengths=[
                        "Quick to articulate core technical choices.",
                        "Maintained composure and consistent reasoning."
                    ],
                    areasForImprovement=[
                        "Could proactively state non-functional latency bounds earlier.",
                        "Deeper exploration of failure recovery scenarios."
                    ]
                )
            )

        strengths = [
            f"Strong command of foundational principles relevant to {role}.",
            "Clean and structured verbal reasoning throughout the conversation.",
            "Effective use of technical terminology and concise summaries."
        ]

        weaknesses = [
            "Proactive identification of boundary edge-cases and hardware constraints.",
            "Deeper quantification of system metrics (QPS, throughput, p99 latency)."
        ]

        action_plan = [
            "Practice 2-3 timed system design drills focusing specifically on distributed consensus and caching failovers.",
            "Review Big-O space trade-offs for auxiliary hash map buffers under high memory constraints.",
            "Incorporate structured frameworks (e.g. STAR method for behavioral, clarify-calculate-design for technical)."
        ]

        summary = (
            f"Candidate completed the {difficulty.upper()} {role} ({track.replace('_', ' ').title()}) session with an overall readiness score of {overall_score}/100 resulting in a '{verdict.replace('_', ' ').title()}' verdict. "
            f"Demonstrated solid fundamentals with clear opportunities for deeper quantitative bounds."
        )

        return {
            "overallScore": overall_score,
            "verdict": verdict,
            "summary": summary,
            "dimensionScores": [d.dict() for d in dimension_scores],
            "stageEvaluations": [s.dict() for s in stage_evaluations],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "actionPlan": action_plan,
            "generatedAt": datetime.datetime.utcnow().isoformat() + "Z"
        }
