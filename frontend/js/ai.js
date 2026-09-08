/**
 * AI Triage Service - Nabha Telemedicine Platform
 * Frontend preliminary triage algorithm categorizing patient risk levels
 */

class AIService {
  triage(data) {
    const symptomsText = (data.symptoms || '').toLowerCase();
    const vitals = data.vitals || {};
    
    const warningFlags = [];
    let riskScore = 0;

    // High Risk Keyword Checks
    const highRiskKeywords = ['breathlessness', 'chest pain', 'severe abdominal pain', 'unconscious', 'bleeding', 'high fever'];
    highRiskKeywords.forEach(kw => {
      if (symptomsText.includes(kw)) {
        riskScore += 3;
        warningFlags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    // Moderate Risk Keyword Checks
    const modRiskKeywords = ['fever', 'cough', 'dizziness', 'vomiting', 'headache', 'joint pain'];
    modRiskKeywords.forEach(kw => {
      if (symptomsText.includes(kw) && !warningFlags.includes(kw.charAt(0).toUpperCase() + kw.slice(1))) {
        riskScore += 1;
        warningFlags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    // Vitals Checks
    if (vitals.temperature) {
      const t = parseFloat(vitals.temperature);
      if (t >= 102) {
        riskScore += 2;
        warningFlags.push('High Fever (≥102°F)');
      }
    }

    if (vitals.spo2) {
      const s = parseInt(vitals.spo2, 10);
      if (s < 93) {
        riskScore += 3;
        warningFlags.push(`Low SpO2 (${s}%)`);
      }
    }

    if (vitals.bloodPressure) {
      const parts = vitals.bloodPressure.split('/');
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        if (sys >= 160) {
          riskScore += 3;
          warningFlags.push(`Stage 2 Hypertension BP (${vitals.bloodPressure})`);
        }
      }
    }

    // Determine Risk Level
    let riskLevel = 'LOW';
    let guidance = 'Routine consultation recommended. Rest and maintain hydration.';

    if (riskScore >= 4) {
      riskLevel = 'HIGH';
      guidance = 'Urgent evaluation by a medical doctor required. Contact nearest PHC or emergency helpline.';
    } else if (riskScore >= 2) {
      riskLevel = 'MODERATE';
      guidance = 'Schedule doctor teleconsultation within 24 hours. Monitor vitals closely.';
    }

    return {
      riskLevel,
      warningFlags: warningFlags.length > 0 ? warningFlags : ['No acute warning flags detected'],
      preliminaryGuidance: guidance,
      disclaimer: 'AI-assisted preliminary triage. This does not provide a diagnosis and does not replace a healthcare professional.',
      analyzedAt: new Date().toISOString()
    };
  }
}

const aiService = new AIService();
