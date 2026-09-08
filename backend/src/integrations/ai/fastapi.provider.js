/**
 * FastAPI AI Provider - Nabha Telemedicine Backend
 * Sends HTTP requests to FastAPI AI Microservice on port 8001 with automatic fallback
 */

const AIProvider = require('./ai.provider');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const http = require('http');

class FastAPIAIProvider extends AIProvider {
  async evaluateTriage(patientId, symptoms, vitals = {}, demographics = {}) {
    const aiUrl = env.AI_SERVICE_URL || 'http://localhost:8001';

    try {
      // 1. Prepare HTTP POST request payload for Python FastAPI microservice
      const payload = JSON.stringify({
        symptoms: symptoms || '',
        age: demographics.age ?? null,
        gender: demographics.gender || null,
        vitals: {
          temperature: parseFloat(vitals.temperature) || null,
          systolicBp: vitals.systolicBp || null,
          diastolicBp: vitals.diastolicBp || null,
          heartRate: vitals.heartRate || null,
          spo2: vitals.spo2 || null,
          weight: vitals.weight || null,
          respiratoryRate: vitals.respiratoryRate || null
        }
      });

      const responseData = await this.postJson(`${aiUrl}/api/ai/triage`, payload, env.AI_SERVICE_TIMEOUT_MS || 5000);
      
      return {
        riskLevel: responseData.riskLevel,
        triageCategory: responseData.triageCategory,
        confidence: responseData.confidence * 100, // Format as percentage
        warningFlags: responseData.warningFlags || [],
        guidance: (responseData.guidance || []).join(' | '),
        modelVersion: responseData.modelVersion || 'fastapi-python-v1.0'
      };

    } catch (err) {
      logger.error('[FastAPI Provider] AI service unavailable', { error: err.message });
      if (env.NODE_ENV === 'production') {
        const e = new Error('AI triage service is temporarily unavailable');
        e.code = 'AI_SERVICE_UNAVAILABLE'; e.statusCode = 503; throw e;
      }
      return this.evaluateFallback(symptoms, vitals);
    }
  }

  evaluateFallback(symptoms, vitals) {
    const text = (symptoms || '').toLowerCase();
    let riskLevel = 'LOW';
    let category = 'General Routine Care';
    let confidence = 88.0;
    const warningFlags = [];

    if (text.includes('breath') || text.includes('chest pain') || text.includes('unconscious') || (vitals.spo2 && vitals.spo2 < 90)) {
      riskLevel = 'HIGH';
      category = 'Urgent Emergency Escalation';
      confidence = 94.0;
      warningFlags.push('Respiratory distress or severe hypoxemia detected');
    } else if (text.includes('fever') || text.includes('cough') || (vitals.temperature && vitals.temperature > 101)) {
      riskLevel = 'MODERATE';
      category = 'Primary Care Clinical Consultation';
      confidence = 90.0;
      warningFlags.push('Febrile illness requiring clinical assessment');
    }

    return {
      riskLevel,
      triageCategory: category,
      confidence,
      warningFlags,
      guidance: 'AI-assisted preliminary triage: Patient should be evaluated by a qualified medical doctor.',
      modelVersion: 'fastapi-fallback-rule-v1.0'
    };
  }

  postJson(urlStr, data, timeoutMs) {
    return new Promise((resolve, reject) => {
      const url = new URL(urlStr);
      const req = http.request({
        hostname: url.hostname,
        port: url.port || 8001,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: timeoutMs
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('HTTP request timeout'));
      });

      req.write(data);
      req.end();
    });
  }
}

module.exports = FastAPIAIProvider;
