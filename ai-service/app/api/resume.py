from fastapi import APIRouter, HTTPException, status
from app.services.resume_service import (
    ResumeService,
    ProctoringService,
    ParseResumeRequest,
    MatchResumeRequest,
    EvaluateProctoringRequest
)

router = APIRouter()

@router.post("/parse", status_code=status.HTTP_200_OK)
async def parse_resume_endpoint(request: ParseResumeRequest):
    """
    Parses unstructured resume text into structured schema.
    """
    try:
        data = ResumeService.parse_resume_text(request.rawText)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume parsing error: {str(e)}"
        )

@router.post("/match", status_code=status.HTTP_200_OK)
async def match_resume_endpoint(request: MatchResumeRequest):
    """
    Matches candidate resume against target Job Description.
    """
    try:
        data = ResumeService.match_resume_to_jd(request)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume JD matching error: {str(e)}"
        )

@router.post("/proctoring/evaluate", status_code=status.HTTP_200_OK)
async def evaluate_proctoring_endpoint(request: EvaluateProctoringRequest):
    """
    Evaluates session proctoring events and returns candidate integrity report.
    """
    try:
        data = ProctoringService.evaluate_integrity(request)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proctoring evaluation error: {str(e)}"
        )
