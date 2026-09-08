# SIH25018 Nabha Telemedicine — AI Preliminary Triage Specification

## Microservice Architecture
- **Engine**: Python FastAPI service on port 8001.
- **Evaluation Criteria**: Analyzes symptoms text and vitals (SpO2, BP, Temperature, Heart Rate).
- **Risk Categorization**:
  - `EMERGENCY`: Immediate escalation (SpO2 < 88%, chest pain, unconsciousness).
  - `HIGH`: Priority doctor consultation within 30 mins (SpO2 88-92%, temp >= 39°C).
  - `MODERATE`: Routine consultation (cough, fever, BP 140-179 mmHg).
  - `LOW`: General preventive care.

## Safety & Medical Disclaimer
All AI responses include:
`AI-assisted preliminary triage ONLY. Not a confirmed diagnosis. Final clinical decision belongs to a qualified medical professional.`
