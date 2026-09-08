"""
Pydantic Schemas - SIH25018 Nabha Telemedicine AI Service
Request and response validation models for AI preliminary triage
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class VitalsInput(BaseModel):
    temperature: Optional[float] = Field(None, description="Body temperature in Celsius or Fahrenheit")
    systolicBp: Optional[int] = Field(None, description="Systolic blood pressure (mmHg)")
    diastolicBp: Optional[int] = Field(None, description="Diastolic blood pressure (mmHg)")
    heartRate: Optional[int] = Field(None, description="Heart rate (bpm)")
    spo2: Optional[int] = Field(None, description="Blood oxygen saturation (%)")
    weight: Optional[str] = Field(None, description="Weight in kg")
    respiratoryRate: Optional[int] = Field(None, description="Respiratory rate (breaths/min)")

class TriageRequest(BaseModel):
    symptoms: str = Field(..., min_length=2, description="Clinical symptoms description")
    age: Optional[int] = Field(None, ge=0, le=120, description="Patient age in years")
    gender: Optional[str] = Field(None, description="Patient gender")
    vitals: Optional[VitalsInput] = Field(default_factory=VitalsInput)

class TriageResponse(BaseModel):
    riskLevel: str = Field(..., description="Risk categorization: LOW | MODERATE | HIGH | EMERGENCY")
    triageCategory: str = Field(..., description="Clinical triage category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Triage confidence score between 0.0 and 1.0")
    guidance: List[str] = Field(..., description="Clinical guidance recommendations for health worker")
    warningFlags: List[str] = Field(..., description="High-risk red flag clinical warnings")
    disclaimer: str = Field(
        "AI-assisted preliminary triage ONLY. Not a confirmed diagnosis. Final clinical decision belongs to a qualified medical professional.",
        description="Mandatory medical safety disclaimer"
    )
    modelVersion: str = Field("fastapi-rule-engine-v1.0", description="Triage model/rule engine version")
