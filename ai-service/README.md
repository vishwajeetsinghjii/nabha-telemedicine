# Nabha Telemedicine AI Service — Preliminary Triage Engine (SIH25018)

An explainable rule-based AI preliminary triage microservice built using FastAPI and Python 3.10+.

---

## Capabilities & Endpoint

```http
POST /api/ai/triage
```

### Input Request:
```json
{
  "symptoms": "fever and persistent dry cough",
  "age": 54,
  "gender": "Male",
  "vitals": {
    "temperature": 39.1,
    "spo2": 91,
    "heartRate": 105
  }
}
```

### Response:
```json
{
  "riskLevel": "HIGH",
  "triageCategory": "PRIORITY_CLINICAL_CONSULTATION",
  "confidence": 0.91,
  "guidance": [
    "Priority Medical Tele-Consultation required within 30 minutes",
    "Keep patient comfortable and monitor vitals every 15 minutes"
  ],
  "warningFlags": [
    "High risk clinical symptom identified",
    "Moderate hypoxemia detected: SpO2 = 91%"
  ],
  "disclaimer": "AI-assisted preliminary triage ONLY. Not a confirmed diagnosis. Final clinical decision belongs to a qualified medical professional.",
  "modelVersion": "fastapi-rule-engine-v1.0"
}
```

---

## Local Execution

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
