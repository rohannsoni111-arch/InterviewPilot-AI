from typing import List, Dict, Any, Optional
import random

class InterviewerService:
    @staticmethod
    def get_persona_tone(strictness: str) -> Dict[str, str]:
        tones = {
            "friendly": {
                "greeting": "Hello! Welcome to your interview session. I'm excited to explore your background and technical reasoning today.",
                "style": "supportive, empathetic, and encouraging with helpful hints when encountering difficulties",
                "ack": ["Great explanation!", "Thanks for breaking that down clearly.", "I appreciate your thoughtful perspective."]
            },
            "realistic": {
                "greeting": "Hello and welcome. Today we'll be evaluating your problem solving, architecture reasoning, and technical depth.",
                "style": "balanced, structured, industry standard senior engineering bar",
                "ack": ["Understood.", "Got it, that makes sense.", "Thanks for the walkthrough."]
            },
            "hard": {
                "greeting": "Welcome to your assessment. We'll be conducting a rigorous evaluation with special attention to edge cases, scalability, and system bottlenecks.",
                "style": "demanding, highly analytical, probing for non-obvious failure modes",
                "ack": ["Noted.", "Let's push deeper into that.", "Fair, but consider the constraints."]
            },
            "ruthless_faang": {
                "greeting": "Let's get right into it. In this session, precision, latency guarantees, and concrete algorithmic trade-offs will be heavily scrutinized.",
                "style": "exacting, rapid-fire, zero tolerance for vagueness or hand-waving",
                "ack": ["Let's scrutinize that assumption.", "That works in the trivial case, but let's test the limits.", "What about the worst-case failure mode?"]
            }
        }
        return tones.get(strictness.lower(), tones["realistic"])

    @classmethod
    def generate_opening_turn(cls, session: Dict[str, Any]) -> Dict[str, Any]:
        target_role = session.get("targetRole", "Software Engineer")
        track = session.get("type", "technical")
        difficulty = session.get("difficulty", "senior").upper()
        strictness = session.get("strictness", "realistic")
        focus_topics = session.get("focusTopics", ["System Architecture"])
        stages = session.get("stages", [])
        stage1 = stages[0] if stages else {"title": "Introduction & Scope Scoping"}
        
        tone = cls.get_persona_tone(strictness)
        greeting = tone["greeting"]
        topics_str = ", ".join(focus_topics[:3])

        if track == "coding":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"For our problem today targeting a {difficulty} {target_role}, we will explore an algorithmic problem centered around **{topics_str}**.\n\n"
                f"To start: Could you explain how you would approach designing an optimal data structure to handle continuous high-frequency stream updates while supporting O(1) or O(log N) lookups for sliding window quantiles?"
            )
        elif track == "system_design":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"As a {difficulty} {target_role}, you are tasked with architecting a scalable distributed service covering **{topics_str}**.\n\n"
                f"Let's scope the problem: What are your key functional assumptions, throughput estimates (RPS/QPS), and latency vs consistency constraints before we sketch the high-level architecture?"
            )
        elif track == "sql":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"In this data engineering session for a {difficulty} {target_role}, we'll focus on **{topics_str}**.\n\n"
                f"Suppose you have an e-commerce platform with tables `orders` (100M rows) and `order_events` (1B rows). How would you write an optimized query using Window Functions or CTEs to find the 95th percentile checkout latency per region without triggering full table scans?"
            )
        elif track == "behavioral":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"In this behavioral & leadership assessment for a {difficulty} {target_role}, we'll explore **{topics_str}**.\n\n"
                f"Tell me about a time when you strongly disagreed with a tech lead or product manager regarding an architectural direction or deadline. How did you handle the conflict, and what was the outcome using the STAR framework?"
            )
        elif track == "resume_defense":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"Reviewing your background for {difficulty} {target_role}, let's examine your experience with **{topics_str}**.\n\n"
                f"Walk me through the most technically challenging project on your resume. What was your specific individual contribution, why was the tech stack chosen, and what unexpected bottleneck did you encounter in production?"
            )
        else:
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**. "
                f"Evaluating your engineering foundations for {difficulty} {target_role} around **{topics_str}**.\n\n"
                f"How do concurrency, memory isolation, and thread safety operate under heavy load in your primary language runtime, and what mechanisms prevent race conditions or resource starvation?"
            )

        content = f"{greeting}\n\n{first_q}"
        
        return {
            "message": content,
            "suggested_follow_ups": [
                "Clarify requirements & constraints",
                "State time & space complexity goals",
                "Discuss high-level architecture options"
            ]
        }

    @classmethod
    def generate_turn_response(
        cls,
        session: Dict[str, Any],
        history: List[Dict[str, Any]],
        candidate_response: str
    ) -> Dict[str, Any]:
        strictness = session.get("strictness", "realistic")
        track = session.get("type", "technical")
        stages = session.get("stages", [])
        current_stage_idx = session.get("currentStageIndex", 0)
        current_stage = stages[current_stage_idx] if current_stage_idx < len(stages) else {}
        focus_topics = session.get("focusTopics", ["Architecture"])
        
        tone = cls.get_persona_tone(strictness)
        ack = random.choice(tone["ack"])
        
        # Count candidate turns in current stage
        candidate_turns_in_stage = sum(
            1 for m in history if m.get("role") == "candidate" and m.get("stageIndex", 0) == current_stage_idx
        ) + 1

        # Check if stage transition is recommended (after 2-3 substantial turns per stage)
        stage_transition_recommended = candidate_turns_in_stage >= 3 and current_stage_idx < (len(stages) - 1)

        # Dynamic follow-up generation tailored to strictness and content
        if strictness == "ruthless_faang":
            if "cache" in candidate_response.lower() or "redis" in candidate_response.lower():
                follow_up = "You mentioned caching. What happens during a cache stampede (Thundering Herd) when a key expires, and how do you handle cache invalidation consistency across replicated regions?"
            elif "database" in candidate_response.lower() or "index" in candidate_response.lower():
                follow_up = "What are the exact B-Tree lock contention dynamics during heavy concurrent writes, and why would you choose an LSM tree over B-Tree in this scenario?"
            else:
                follow_up = "What is the exact worst-case algorithmic complexity of this design, and what specific single point of failure (SPOF) remains in your architecture?"
        elif strictness == "hard":
            follow_up = f"That addresses the standard flow. Now, how does this design behave under 10x spike traffic with network partitions (CAP theorem partition tolerance), specifically regarding **{focus_topics[0] if focus_topics else 'consistency'}**?"
        elif strictness == "friendly":
            follow_up = "Good thought process! To build further on that: What trade-offs or alternative options did you consider when making that choice?"
        else:
            # Realistic standard
            follow_up = f"Interesting approach. Could you walk me through the trade-offs between memory consumption and compute latency in this implementation, and how you would verify this in automated CI tests?"

        if stage_transition_recommended:
            next_stage = stages[current_stage_idx + 1]
            content = (
                f"{ack} We've thoroughly covered the core requirements for **{current_stage.get('title', 'this stage')}**.\n\n"
                f"Let's now advance to **Stage {current_stage_idx + 2}: {next_stage.get('title')}** ({next_stage.get('durationMinutes')} mins).\n\n"
                f"{next_stage.get('description')}\n\n"
                f"**Next Question:** {follow_up}"
            )
        else:
            content = f"{ack}\n\n{follow_up}"

        return {
            "message": content,
            "stage_transition_recommended": stage_transition_recommended,
            "suggested_follow_ups": [
                "Explain latency and throughput trade-offs",
                "Walk through failure recovery steps",
                "Discuss edge case handling"
            ]
        }

    @classmethod
    def generate_stage_transition(
        cls,
        session: Dict[str, Any],
        new_stage_idx: int
    ) -> Dict[str, Any]:
        stages = session.get("stages", [])
        if new_stage_idx < len(stages):
            stage = stages[new_stage_idx]
            msg = (
                f"Transitioning to **Stage {new_stage_idx + 1}: {stage.get('title')}** ({stage.get('durationMinutes')} min).\n\n"
                f"*{stage.get('description')}*\n\n"
                f"Please present your solution or architectural components addressing this phase's core objectives."
            )
        else:
            msg = "All structured interview stages are now concluded. Proceeding to final synthesis."
            
        return {"message": msg}
