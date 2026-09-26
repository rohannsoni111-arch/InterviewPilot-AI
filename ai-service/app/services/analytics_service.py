from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ComputeAnalyticsRequest(BaseModel):
    sessions: List[Dict[str, Any]]
    targetRole: Optional[str] = "Senior Software Engineer"

TRACK_METADATA = {
    "coding": "Data Structures & Algorithms",
    "system_design": "System Design & Scalability",
    "technical": "Technical Architecture & Internals",
    "sql": "SQL & Data Engineering",
    "behavioral": "Behavioral & STAR Leadership"
}

DIMENSION_METADATA = [
    "Technical & Algorithmic Correctness",
    "Problem-Solving & Architectural Depth",
    "Communication Clarity & Structure",
    "Edge Cases & Scalability Handling",
    "Code & Implementation Quality"
]

class AnalyticsService:
    @classmethod
    def compute_comprehensive_analytics(cls, req: ComputeAnalyticsRequest) -> Dict[str, Any]:
        sessions = req.sessions or []
        completed = [s for s in sessions if s.get("status") == "completed" and s.get("overallScore") is not None]

        total_sessions = len(sessions)
        completed_count = len(completed)
        total_seconds = sum(s.get("durationSeconds", 0) for s in sessions)
        total_practice_hours = round(total_seconds / 3600.0, 1)

        # Integrity average
        integrity_scores = []
        for s in sessions:
            rep = s.get("proctoringReport")
            if rep and isinstance(rep, dict) and "integrityScore" in rep:
                integrity_scores.append(rep["integrityScore"])
        
        avg_integrity = round(sum(integrity_scores) / len(integrity_scores)) if integrity_scores else 95

        if not completed:
            # Return baseline schema for candidates with 0 completed sessions
            track_competencies = [
                {
                    "track": k,
                    "title": v,
                    "score": 0,
                    "sessionsCount": 0,
                    "benchmark": 75,
                    "status": "needs_practice"
                }
                for k, v in TRACK_METADATA.items()
            ]

            dimension_analytics = [
                {
                    "dimension": d,
                    "score": 0,
                    "trend": 0,
                    "status": "below"
                }
                for d in DIMENSION_METADATA
            ]

            return {
                "hasData": False,
                "overallReadinessScore": None,
                "readinessTier": "Calibration Required",
                "readinessVelocityDelta": 0,
                "estimatedTimeToTargetBar": "Complete 1st session to calibrate",
                "trackCompetencies": track_competencies,
                "dimensionAnalytics": dimension_analytics,
                "trajectory": [],
                "weaknessHeatmap": [],
                "totalSessions": total_sessions,
                "completedSessions": 0,
                "totalPracticeHours": total_practice_hours,
                "averageIntegrityScore": avg_integrity
            }

        # 1. Overall Readiness & Velocity
        scores = [s.get("overallScore", 75) for s in completed]
        avg_score = round(sum(scores) / len(scores))

        # Recent velocity (latest score vs first half average)
        if len(scores) >= 2:
            recent = scores[0]
            older_avg = sum(scores[1:]) / len(scores[1:])
            velocity_delta = round(recent - older_avg)
        else:
            velocity_delta = 5

        # Readiness Tier
        if avg_score >= 88:
            readiness_tier = "Staff / Principal Ready"
            eta = "Ready for on-site hiring rounds"
        elif avg_score >= 78:
            readiness_tier = "Senior Engineer Ready"
            eta = "4-7 days (2 targeted drills)"
        elif avg_score >= 65:
            readiness_tier = "Mid-Level Engineer Ready"
            eta = "10-14 days (4 targeted drills)"
        else:
            readiness_tier = "Junior / Growth Tier"
            eta = "18-21 days (6 foundational drills)"

        # 2. Multi-Track Competencies
        track_map = {k: {"total": 0, "count": 0} for k in TRACK_METADATA.keys()}
        for s in completed:
            t = s.get("type", "coding")
            if t in track_map:
                track_map[t]["total"] += s.get("overallScore", 75)
                track_map[t]["count"] += 1

        track_competencies = []
        for k, v in TRACK_METADATA.items():
            count = track_map[k]["count"]
            if count > 0:
                sc = round(track_map[k]["total"] / count)
                status = "proficient" if sc >= 80 else ("developing" if sc >= 65 else "needs_practice")
            else:
                sc = 0
                status = "needs_practice"

            track_competencies.append({
                "track": k,
                "title": v,
                "score": sc,
                "sessionsCount": count,
                "benchmark": 75,
                "status": status
            })

        # 3. 5-Dimensional Analytics
        dim_map = {d: {"total": 0, "count": 0, "scores": []} for d in DIMENSION_METADATA}
        for s in completed:
            eval_report = s.get("evaluationReport") or {}
            dim_scores = eval_report.get("dimensionScores", [])
            for ds in dim_scores:
                dim_name = ds.get("dimension")
                if dim_name in dim_map:
                    val = ds.get("score", 75)
                    dim_map[dim_name]["total"] += val
                    dim_map[dim_name]["count"] += 1
                    dim_map[dim_name]["scores"].append(val)

        dimension_analytics = []
        for d in DIMENSION_METADATA:
            count = dim_map[d]["count"]
            if count > 0:
                sc = round(dim_map[d]["total"] / count)
                # calculate trend
                first_score = dim_map[d]["scores"][-1]
                latest_score = dim_map[d]["scores"][0]
                trend = latest_score - first_score if count > 1 else 3
                status = "exceeds" if sc >= 85 else ("meets" if sc >= 70 else "below")
            else:
                sc = avg_score
                trend = 2
                status = "meets" if sc >= 70 else "below"

            dimension_analytics.append({
                "dimension": d,
                "score": sc,
                "trend": trend,
                "status": status
            })

        # 4. Chronological Trajectory
        trajectory = []
        for s in reversed(completed):
            date_str = s.get("completedAt") or s.get("createdAt") or "Recent"
            if len(date_str) > 10:
                date_str = date_str[:10]
            trajectory.append({
                "date": date_str,
                "score": s.get("overallScore", 75),
                "interviewType": s.get("type", "coding"),
                "interviewTitle": s.get("title", "Session")
            })

        # 5. Weakness Recurrence Heatmap
        weakness_counts: Dict[str, Dict[str, Any]] = {}
        for s in completed:
            eval_report = s.get("evaluationReport") or {}
            weaknesses = eval_report.get("weaknesses", [])
            for w in weaknesses:
                topic = w.split(":")[0] if ":" in w else w
                if topic not in weakness_counts:
                    weakness_counts[topic] = {
                        "count": 0,
                        "category": "Architecture & Algorithms",
                        "lastDate": s.get("completedAt") or s.get("createdAt")
                    }
                weakness_counts[topic]["count"] += 1

        weakness_heatmap = []
        for topic, info in weakness_counts.items():
            cnt = info["count"]
            severity = "critical" if cnt >= 3 else ("moderate" if cnt >= 2 else "minor")
            weakness_heatmap.append({
                "topic": topic,
                "category": info["category"],
                "recurrenceCount": cnt,
                "lastOccurredAt": info["lastDate"],
                "severity": severity,
                "remediationSuggestion": f"Schedule a focused 30-min drill on {topic}."
            })

        weakness_heatmap.sort(key=lambda x: x["recurrenceCount"], reverse=True)

        return {
            "hasData": True,
            "overallReadinessScore": avg_score,
            "readinessTier": readiness_tier,
            "readinessVelocityDelta": velocity_delta,
            "estimatedTimeToTargetBar": eta,
            "trackCompetencies": track_competencies,
            "dimensionAnalytics": dimension_analytics,
            "trajectory": trajectory,
            "weaknessHeatmap": weakness_heatmap[:6],
            "totalSessions": total_sessions,
            "completedSessions": completed_count,
            "totalPracticeHours": total_practice_hours,
            "averageIntegrityScore": avg_integrity
        }
