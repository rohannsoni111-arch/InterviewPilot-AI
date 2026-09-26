from fastapi import APIRouter, HTTPException
from app.services.code_runner_service import (
    CodeRunnerService,
    CodeExecutionRequestModel,
    CodeReviewRequestModel
)

router = APIRouter(prefix="/api/v1/code", tags=["Code Runner & Analysis"])

@router.post("/execute")
async def execute_code(request: CodeExecutionRequestModel):
    try:
        result = CodeRunnerService.execute(request)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review")
async def review_code(request: CodeReviewRequestModel):
    try:
        analysis = CodeRunnerService.analyze_code(request)
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
