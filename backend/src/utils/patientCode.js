/**
 * Patient Code Generator Utility - Nabha Telemedicine Backend
 * Generates human-friendly healthcare identifiers (e.g., NAB-104928)
 */

function generatePatientCode() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `NAB-${randomDigits}`;
}

module.exports = {
  generatePatientCode
};
