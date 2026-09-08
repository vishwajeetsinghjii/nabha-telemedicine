"""
Triage Route Handler - SIH25018 Nabha Telemedicine AI Microservice
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import TriageRequest, TriageResponse
from app.services.triage_service import TriageService

router = APIRouter(prefix="/api/ai", tags=["AI Preliminary Triage"])

@router.post("/triage", response_model=TriageResponse, status_code=status.HTTP_200_OK)
def evaluate_triage(request: TriageRequest):
    """
    Evaluates patient symptoms and vitals to produce explainable preliminary triage risk categorization.
    """
    try:
        return TriageService.evaluate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Triage evaluation error: {str(e)}"
        )
