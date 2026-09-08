/**
 * Validation Utilities - Nabha Telemedicine Platform
 * Accessible form validation and medical vitals safety range checks
 */

class FormValidator {
  validatePhone(phone) {
    const cleaned = (phone || '').replace(/\D/g, '');
    return cleaned.length === 10;
  }

  validateAge(age) {
    const num = parseInt(age, 10);
    return !isNaN(num) && num >= 0 && num <= 120;
  }

  validateVitals(vitals) {
    const errors = {};

    // Temperature (Fahrenheit): 90°F - 108°F
    if (vitals.temperature) {
      const tempVal = parseFloat(vitals.temperature);
      if (isNaN(tempVal) || tempVal < 90 || tempVal > 108) {
        errors.temperature = 'Temperature must be between 90°F and 108°F.';
      }
    }

    // Blood Pressure format e.g. 120/80
    if (vitals.bloodPressure) {
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!bpRegex.test(vitals.bloodPressure.trim())) {
        errors.bloodPressure = 'BP must be in Sys/Dia format (e.g. 120/80).';
      }
    }

    // SpO2: 50% - 100%
    if (vitals.spo2) {
      const spo2Val = parseInt(vitals.spo2, 10);
      if (isNaN(spo2Val) || spo2Val < 50 || spo2Val > 100) {
        errors.spo2 = 'SpO2 pulse oximetry must be between 50% and 100%.';
      }
    }

    // Heart Rate: 30 - 220 bpm
    if (vitals.heartRate) {
      const hrVal = parseInt(vitals.heartRate, 10);
      if (isNaN(hrVal) || hrVal < 30 || hrVal > 220) {
        errors.heartRate = 'Heart rate must be between 30 and 220 bpm.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

const validator = new FormValidator();
