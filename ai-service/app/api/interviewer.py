from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.interviewer_service import InterviewerService

router = APIRouter(prefix="/api/v1/interview")

class StartInterviewRequest(BaseModel):
    session: Dict[str, Any]

class StartInterviewResponse(BaseModel):
    success: bool = True
    message: str
    suggested_follow_ups: List[str] = Field(default_factory=list)

class TurnInterviewRequest(BaseModel):
    session: Dict[str, Any]
    history: List[Dict[str, Any]] = Field(default_factory=list)
    candidate_response: str

class TurnInterviewResponse(BaseModel):
    success: bool = True
    message: str
    stage_transition_recommended: bool = False
    suggested_follow_ups: List[str] = Field(default_factory=list)

class AdvanceStageRequest(BaseModel):
    session: Dict[str, Any]
    new_stage_idx: int

class AdvanceStageResponse(BaseModel):
    success: bool = True
    message: str

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(payload: StartInterviewRequest):
    try:
        res = InterviewerService.generate_opening_turn(payload.session)
        return StartInterviewResponse(
            success=True,
            message=res["message"],
            suggested_follow_ups=res.get("suggested_follow_ups", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/turn", response_model=TurnInterviewResponse)
async def turn_interview(payload: TurnInterviewRequest):
    try:
        res = InterviewerService.generate_turn_response(
            payload.session,
            payload.history,
            payload.candidate_response
        )
        return TurnInterviewResponse(
            success=True,
            message=res["message"],
            stage_transition_recommended=res.get("stage_transition_recommended", False),
            suggested_follow_ups=res.get("suggested_follow_ups", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advance-stage", response_model=AdvanceStageResponse)
async def advance_stage(payload: AdvanceStageRequest):
    try:
        res = InterviewerService.generate_stage_transition(
            payload.session,
            payload.new_stage_idx
        )
        return AdvanceStageResponse(
            success=True,
            message=res["message"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
