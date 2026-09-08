"""
Triage Service Engine - SIH25018 Nabha Telemedicine AI Microservice
Explainable rule-based clinical preliminary triage risk evaluator
"""

from app.models.schemas import TriageRequest, TriageResponse, VitalsInput

class TriageService:
    @staticmethod
    def evaluate(request: TriageRequest) -> TriageResponse:
        symptoms_text = (request.symptoms or "").lower()
        vitals = request.vitals or VitalsInput()
        
        warning_flags = []
        guidance = []
        
        # 1. Evaluate Critical Red Flags (EMERGENCY)
        is_emergency = False
        
        if any(term in symptoms_text for term in ["unconscious", "chest pain", "severe dyspnea", "stroke", "convulsions", "heavy bleeding"]):
            is_emergency = True
            warning_flags.append("Critical symptom keyword detected (e.g. chest pain, dyspnea, unconsciousness)")

        if vitals.spo2 is not None and vitals.spo2 < 88:
            is_emergency = True
            warning_flags.append(f"Severe hypoxemia detected: SpO2 = {vitals.spo2}% (< 88%)")

        if vitals.systolicBp is not None and (vitals.systolicBp > 180 or vitals.systolicBp < 80):
            is_emergency = True
            warning_flags.append(f"Hypertensive crisis or circulatory collapse: Systolic BP = {vitals.systolicBp} mmHg")

        if is_emergency:
            guidance = [
                "IMMEDIATE EMERGENCY ESCALATION REQUIRED",
                "Contact Emergency Ambulance Service (Helpline 108 / 102) immediately",
                "Administer emergency oxygen supplementation if available",
                "Alert Duty Medical Officer at Nearest Primary Health Center (PHC)"
            ]
            return TriageResponse(
                riskLevel="EMERGENCY",
                triageCategory="URGENT_EMERGENCY_ESCALATION",
                confidence=0.96,
                guidance=guidance,
                warningFlags=warning_flags
            )

        # 2. Evaluate High Risk Factors (HIGH)
        is_high = False
        
        if any(term in symptoms_text for term in ["breathlessness", "difficulty breathing", "high fever", "stiff neck", "severe abdominal pain"]):
            is_high = True
            warning_flags.append("High risk clinical symptom identified")

        if vitals.spo2 is not None and 88 <= vitals.spo2 <= 92:
            is_high = True
            warning_flags.append(f"Moderate hypoxemia detected: SpO2 = {vitals.spo2}% (88-92%)")

        if vitals.temperature is not None and vitals.temperature >= 39.0: # >= 102.2°F
            is_high = True
            warning_flags.append(f"High febrile temperature: {vitals.temperature}°C")

        if vitals.heartRate is not None and vitals.heartRate > 120:
            is_high = True
            warning_flags.append(f"Tachycardia detected: Heart Rate = {vitals.heartRate} bpm")

        if is_high:
            guidance = [
                "Priority Medical Tele-Consultation required within 30 minutes",
                "Keep patient comfortable and monitor vitals every 15 minutes",
                "Prepare patient history and current vitals summary for Doctor"
            ]
            return TriageResponse(
                riskLevel="HIGH",
                triageCategory="PRIORITY_CLINICAL_CONSULTATION",
                confidence=0.91,
                guidance=guidance,
                warningFlags=warning_flags
            )

        # 3. Evaluate Moderate Risk Factors (MODERATE)
        is_moderate = False
        
        if any(term in symptoms_text for term in ["fever", "cough", "vomiting", "diarrhea", "body ache", "dizziness"]):
            is_moderate = True
            warning_flags.append("Acute clinical symptoms recorded requiring routine medical review")

        if vitals.spo2 is not None and 93 <= vitals.spo2 <= 95:
            is_moderate = True
            warning_flags.append(f"Borderline SpO2 saturation: {vitals.spo2}%")

        if vitals.systolicBp is not None and 140 <= vitals.systolicBp <= 179:
            is_moderate = True
            warning_flags.append(f"Stage 2 Hypertension: Systolic BP = {vitals.systolicBp} mmHg")

        if is_moderate:
            guidance = [
                "Schedule routine Tele-consultation with duty doctor today",
                "Ensure adequate oral fluid hydration and bed rest",
                "ASHA worker to follow up within 24 hours"
            ]
            return TriageResponse(
                riskLevel="MODERATE",
                triageCategory="ROUTINE_TELE_CONSULTATION",
                confidence=0.88,
                guidance=guidance,
                warningFlags=warning_flags
            )

        # 4. Low Risk Default (LOW)
        guidance = [
            "General Health & Preventive Wellness Advice",
            "Monitor symptoms; schedule routine consultation if symptoms persist > 3 days",
            "Maintain healthy nutrition and rest"
        ]
        return TriageResponse(
            riskLevel="LOW",
            triageCategory="GENERAL_WELLNESS_CARE",
            confidence=0.92,
            guidance=guidance,
            warningFlags=["No acute red flag vitals or symptoms identified"]
        )
