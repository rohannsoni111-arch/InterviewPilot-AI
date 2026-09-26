from fastapi import APIRouter, HTTPException, status
from app.services.analytics_service import AnalyticsService, ComputeAnalyticsRequest

router = APIRouter()

@router.post("/compute", status_code=status.HTTP_200_OK)
async def compute_analytics_endpoint(request: ComputeAnalyticsRequest):
    """
    Computes candidate multi-track competency radar, trajectory velocity, and weakness heatmap.
    """
    try:
        data = AnalyticsService.compute_comprehensive_analytics(request)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics computation error: {str(e)}"
        )
