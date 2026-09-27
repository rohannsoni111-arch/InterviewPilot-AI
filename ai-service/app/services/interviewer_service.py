import os
import re
import json
import random
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class InterviewerService:
    @staticmethod
    def get_persona_tone(strictness: str) -> Dict[str, Any]:
        tones = {
            "friendly": {
                "greeting": "Hello! Welcome to your interview session. I'm excited to explore your background and technical reasoning today.",
                "style": "supportive, encouraging, and collaborative with gentle nudges",
                "ack": ["Great explanation!", "Thanks for breaking that down clearly.", "I appreciate your thoughtful perspective.", "That is a solid point."],
            },
            "realistic": {
                "greeting": "Hello and welcome. Today we'll be evaluating your problem solving, architecture reasoning, and technical depth.",
                "style": "balanced, structured, standard senior engineering bar",
                "ack": ["Understood.", "Got it, that makes sense.", "Thanks for the walkthrough.", "Noted, let's look closer at that."],
            },
            "hard": {
                "greeting": "Welcome to your assessment. We'll be conducting a rigorous evaluation with special attention to edge cases, scalability, and system bottlenecks.",
                "style": "demanding, analytical, probing for failure modes and deep invariants",
                "ack": ["Noted.", "Let's push deeper into that.", "Fair, but consider the constraints.", "Let's scrutinize that assumption."],
            },
            "ruthless_faang": {
                "greeting": "Let's get right into it. In this session, precision, latency guarantees, and concrete algorithmic trade-offs will be heavily scrutinized.",
                "style": "exacting, zero tolerance for vagueness, probing worst-case limits",
                "ack": ["Let's scrutinize that assumption.", "That works in the trivial case, but let's test the limits.", "What about the worst-case failure mode?", "Let's look at the mathematical bounds."],
            }
        }
        return tones.get(strictness.lower(), tones["realistic"])

    @classmethod
    async def generate_opening_turn(cls, session: Dict[str, Any]) -> Dict[str, Any]:
        target_role = session.get("targetRole", "Software Engineer")
        track = session.get("type", "technical")
        difficulty = session.get("difficulty", "senior").upper()
        strictness = session.get("strictness", "realistic")
        focus_topics = session.get("focusTopics", ["System Architecture"])
        stages = session.get("stages", [])
        stage1 = stages[0] if stages else {"title": "Introduction & Scope Scoping"}

        # Try LLM if available
        if settings.OPENAI_API_KEY:
            try:
                llm_res = await cls._openai_opening(session, stage1)
                if llm_res:
                    return llm_res
            except Exception:
                pass

        if settings.GEMINI_API_KEY:
            try:
                gemini_res = await cls._gemini_opening(session, stage1)
                if gemini_res:
                    return gemini_res
            except Exception:
                pass

        # High Quality Local Fallback Opening
        tone = cls.get_persona_tone(strictness)
        greeting = tone["greeting"]
        topics_str = ", ".join(focus_topics[:3])

        if track == "coding":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
                f"For our problem today targeting a {difficulty} {target_role}, we will explore an algorithmic problem centered around **{topics_str}**.\n\n"
                f"To start: Could you explain how you would approach designing an optimal data structure to handle continuous high-frequency stream updates while supporting O(1) or O(log N) lookups for sliding window quantiles?"
            )
        elif track == "system_design":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
                f"As a {difficulty} {target_role}, you are tasked with architecting a scalable distributed service covering **{topics_str}**.\n\n"
                f"Let's scope the problem: What are your key functional assumptions, throughput estimates (RPS/QPS), and latency vs consistency constraints before we sketch the high-level architecture?"
            )
        elif track == "sql":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
                f"In this data engineering session for a {difficulty} {target_role}, we'll focus on **{topics_str}**.\n\n"
                f"Suppose you have an e-commerce platform with tables orders (100M rows) and order_events (1B rows). How would you write an optimized query using Window Functions or CTEs to find the 95th percentile checkout latency per region without triggering full table scans?"
            )
        elif track == "behavioral":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
                f"In this behavioral & leadership assessment for a {difficulty} {target_role}, we'll explore **{topics_str}**.\n\n"
                f"Tell me about a time when you strongly disagreed with a tech lead or product manager regarding an architectural direction or deadline. How did you handle the conflict, and what was the outcome using the STAR framework?"
            )
        elif track == "resume_defense":
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
                f"Reviewing your background for {difficulty} {target_role}, let's examine your experience with **{topics_str}**.\n\n"
                f"Walk me through the most technically challenging project on your resume. What was your specific individual contribution, why was the tech stack chosen, and what unexpected bottleneck did you encounter in production?"
            )
        else:
            first_q = (
                f"We are beginning **Stage 1: {stage1.get('title')}**.\n"
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
    async def generate_turn_response(
        cls,
        session: Dict[str, Any],
        history: List[Dict[str, Any]],
        candidate_response: str
    ) -> Dict[str, Any]:
        stages = session.get("stages", [])
        current_stage_idx = session.get("currentStageIndex", 0)
        current_stage = stages[current_stage_idx] if current_stage_idx < len(stages) else {}

        # Count turns in current stage
        candidate_turns_in_stage = sum(
            1 for m in history if m.get("role") == "candidate" and m.get("stageIndex", 0) == current_stage_idx
        ) + 1
        stage_transition_recommended = candidate_turns_in_stage >= 3 and current_stage_idx < (len(stages) - 1)

        # 1. Try OpenAI if configured
        if settings.OPENAI_API_KEY:
            try:
                llm_res = await cls._openai_turn(session, history, candidate_response, current_stage, stage_transition_recommended)
                if llm_res:
                    return llm_res
            except Exception:
                pass

        # 2. Try Gemini if configured
        if settings.GEMINI_API_KEY:
            try:
                gemini_res = await cls._gemini_turn(session, history, candidate_response, current_stage, stage_transition_recommended)
                if gemini_res:
                    return gemini_res
            except Exception:
                pass

        # 3. Dynamic Local Contextual Generator (No Repeated Questions)
        return cls._local_turn_response(session, history, candidate_response, current_stage, stage_transition_recommended, current_stage_idx)

    @classmethod
    def _local_turn_response(
        cls,
        session: Dict[str, Any],
        history: List[Dict[str, Any]],
        candidate_response: str,
        current_stage: Dict[str, Any],
        stage_transition_recommended: bool,
        current_stage_idx: int
    ) -> Dict[str, Any]:
        strictness = session.get("strictness", "realistic")
        role = session.get("targetRole", "Software Engineer")
        stages = session.get("stages", [])
        focus_topics = session.get("focusTopics", ["Architecture"])
        
        tone = cls.get_persona_tone(strictness)
        ack = random.choice(tone["ack"])

        cand_lower = candidate_response.lower().strip()
        word_count = len(cand_lower.split())

        # Collect past interviewer questions to prevent repeating
        past_interviewer_texts = " ".join([m.get("content", "").lower() for m in history if m.get("role") == "interviewer"])

        # Determine dynamic follow up based on candidate's actual text
        follow_up = ""

        # Priority 1: Check Technical Topic Concepts
        if "cache" in cand_lower or "redis" in cand_lower or "memcached" in cand_lower:
            if "stampede" not in past_interviewer_texts and "thundering" not in past_interviewer_texts:
                follow_up = "How do you protect the system against cache stampedes (Thundering Herd problem) and handle cache invalidation consistency across replicated regions?"
            elif "eviction" not in past_interviewer_texts:
                follow_up = "Which cache eviction policy (LRU, LFU, TTL) fits this traffic pattern best, and how do you handle hot-key partitioning in Redis?"
            else:
                follow_up = "What happens when Redis runs out of allocated memory, and what fallback data tier ensures uninterrupted availability?"

        elif "database" in cand_lower or "sql" in cand_lower or "postgres" in cand_lower or "mongo" in cand_lower or "query" in cand_lower:
            if "index" not in past_interviewer_texts:
                follow_up = "What indexing strategy (e.g. B-Tree vs Hash vs Composite index) would you put in place to ensure queries remain sub-millisecond as table volume scales to 50M rows?"
            elif "transaction" not in past_interviewer_texts:
                follow_up = "How would you handle transaction isolation levels (e.g. Read Committed vs Serializable) and avoid deadlock scenarios under high concurrent writes?"
            else:
                follow_up = "If the primary database node experiences a sudden hardware crash, what is your automated failover and replication strategy?"

        elif "react" in cand_lower or "usestate" in cand_lower or "hook" in cand_lower or "redux" in cand_lower or "state" in cand_lower:
            if "re-render" not in past_interviewer_texts and "render" not in past_interviewer_texts:
                follow_up = "How do you prevent unnecessary component re-renders when managing frequent state updates, and when would you use useMemo or a selector-based store like Zustand over React Context?"
            elif "ssr" not in past_interviewer_texts:
                follow_up = "How does this state management approach interact with Server-Side Rendering (SSR) or hydration boundaries in Next.js/React 18?"
            else:
                follow_up = "What happens if an asynchronous action encounters a network timeout or race condition during a rapid state transition?"

        elif "concurrency" in cand_lower or "async" in cand_lower or "event loop" in cand_lower or "thread" in cand_lower or "lock" in cand_lower:
            if "starvation" not in past_interviewer_texts:
                follow_up = "How do you prevent worker starvation or deadlocks when multiple asynchronous tasks contend for a shared resource?"
            elif "backpressure" not in past_interviewer_texts:
                follow_up = "How does your architecture handle backpressure when producer ingestion rate temporarily exceeds downstream consumer processing capacity?"
            else:
                follow_up = "What observability metrics (e.g. event loop lag, queue depth, p99 latency) would you monitor in production?"

        elif "o(" in cand_lower or "complexity" in cand_lower or "algorithm" in cand_lower or "array" in cand_lower or "hash" in cand_lower:
            if "space" not in past_interviewer_texts:
                follow_up = "Could you clarify the exact auxiliary space complexity of your approach, and is there an in-place optimization that trades time for memory?"
            elif "edge" not in past_interviewer_texts:
                follow_up = "What are the boundary edge cases for this algorithm (e.g. empty inputs, duplicate elements, negative numbers, extreme values), and how does the code guard against them?"
            else:
                follow_up = "If the dataset cannot fit into single-machine RAM (e.g. 500GB stream), how would you adapt this algorithm using external sorting or MapReduce?"

        # Priority 2: Very brief or vague response (< 6 words or explicit I don't know)
        elif word_count < 6 or "don't know" in cand_lower or "dont know" in cand_lower or "not sure" in cand_lower:
            if "don't know" in cand_lower or "dont know" in cand_lower or "not sure" in cand_lower:
                follow_up = "No worries, let's break it down into smaller steps. What would be the simplest first component you would set up, and what is its main responsibility?"
            elif "yes" in cand_lower or "ok" in cand_lower or "sure" in cand_lower or "correct" in cand_lower:
                follow_up = "Could you elaborate on the underlying mechanism? Specifically, walk me through how the data flows through that step."
            else:
                follow_up = f"That was quite brief. As a {role}, how would you justify this choice to your engineering team, and what potential downside should we watch out for?"

        else:
            # Topic & Stage driven questions (preventing static repeats)
            stage_topic = current_stage.get("title", focus_topics[0] if focus_topics else "Architecture")
            turn_num = candidate_turns_in_stage
            
            options = [
                f"Interesting approach. Could you walk me through the key trade-offs between memory consumption, throughput, and compute latency in this design?",
                f"How would you test and benchmark this component in automated CI/CD pipelines to catch performance regressions before production?",
                f"What is the single most likely failure point (SPOF) in this setup, and what circuit-breaker or fallback mechanism prevents cascading outages?",
                f"How does your design scale if the active user load increases by 10x over a 5-minute flash-sale spike?",
                f"If you had to refactor this architecture for zero-downtime rolling deployments, what changes would you introduce?"
            ]
            # Pick an option that hasn't been asked yet
            unused = [opt for opt in options if opt.split()[0].lower() not in past_interviewer_texts]
            follow_up = unused[0] if unused else options[turn_num % len(options)]

        if stage_transition_recommended:
            next_stage = stages[current_stage_idx + 1]
            content = (
                f"{ack} We have covered the core requirements for **{current_stage.get('title', 'this stage')}**.\n\n"
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
    async def _openai_opening(cls, session: Dict[str, Any], stage1: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        prompt = (
            f"You are conducting a live engineering interview for a {session.get('difficulty', 'senior').upper()} "
            f"{session.get('targetRole', 'Software Engineer')} targeting {session.get('type', 'technical')} track.\n"
            f"Strictness level: {session.get('strictness', 'realistic')}.\n"
            f"Focus topics: {', '.join(session.get('focusTopics', []))}.\n"
            f"Stage 1 is '{stage1.get('title')}': {stage1.get('description')}.\n\n"
            f"Provide an engaging opening greeting and a sharp, role-appropriate initial technical question to start Stage 1. Keep it to 2-3 concise paragraphs."
        )
        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                msg = data["choices"][0]["message"]["content"]
                return {
                    "message": msg,
                    "suggested_follow_ups": ["Clarify requirements & constraints", "State time & space complexity", "Propose architecture"]
                }
        return None

    @classmethod
    async def _openai_turn(
        cls,
        session: Dict[str, Any],
        history: List[Dict[str, Any]],
        candidate_response: str,
        current_stage: Dict[str, Any],
        stage_transition_recommended: bool
    ) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        system_prompt = (
            f"You are a seasoned Principal Technical Interviewer conducting a {session.get('strictness', 'realistic')} interview "
            f"for a {session.get('difficulty', 'senior')} {session.get('targetRole', 'Software Engineer')} position. "
            f"Current stage: {current_stage.get('title', 'Technical Evaluation')}.\n\n"
            f"Rules:\n"
            f"1. Listen carefully to what the candidate just said and coded.\n"
            f"2. Acknowledge their response briefly, and if they missed edge cases, made an incorrect claim, or were vague, probe them directly.\n"
            f"3. Ask a concrete, tailored follow-up question directly related to their answer.\n"
            f"4. NEVER repeat questions that were already asked earlier in the conversation.\n"
            f"5. Keep your tone realistic, professional, and crisp (under 120 words)."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for m in history[-8:]:  # Include recent turns
            role = "assistant" if m.get("role") == "interviewer" else "user"
            messages.append({"role": role, "content": m.get("content", "")})
        
        messages.append({"role": "user", "content": candidate_response})

        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.4
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                msg = data["choices"][0]["message"]["content"]
                return {
                    "message": msg,
                    "stage_transition_recommended": stage_transition_recommended,
                    "suggested_follow_ups": ["Explain latency trade-offs", "Discuss failure recovery", "Handle edge cases"]
                }
        return None

    @classmethod
    async def _gemini_opening(cls, session: Dict[str, Any], stage1: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = (
            f"You are a technical interviewer for {session.get('targetRole')} ({session.get('difficulty')}). "
            f"Stage 1 is {stage1.get('title')}. Give a concise opening greeting and initial technical question."
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                return {"message": text, "suggested_follow_ups": ["Clarify requirements", "State bounds", "Propose design"]}
        return None

    @classmethod
    async def _gemini_turn(
        cls,
        session: Dict[str, Any],
        history: List[Dict[str, Any]],
        candidate_response: str,
        current_stage: Dict[str, Any],
        stage_transition_recommended: bool
    ) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = (
            f"You are a technical interviewer for a {session.get('targetRole')}. Candidate just answered: \"{candidate_response}\". "
            f"Respond directly to their answer with feedback and ask a focused follow-up question. Do not repeat previous questions."
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                return {"message": text, "stage_transition_recommended": stage_transition_recommended, "suggested_follow_ups": ["Trade-offs", "Edge cases", "Recovery"]}
        return None

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
