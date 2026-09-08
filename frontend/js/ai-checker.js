document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('public-symptom-form');
  if (!form) return;
  const result = document.getElementById('public-symptom-result');
  const button = document.getElementById('public-symptom-button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const symptoms = document.getElementById('public-symptoms').value.trim();
    if (symptoms.length < 2) {
      result.hidden = false;
      result.className = 'symptom-result high';
      result.innerHTML = `<div class="symptom-risk">${escapeHtml(i18n.t('please_describe_symptoms', 'Please describe your symptoms.'))}</div>`;
      return;
    }

    button.disabled = true;
    button.textContent = i18n.t('checking', 'Checking…');
    try {
      const data = await api.publicTriage({
        symptoms,
        age: document.getElementById('public-age').value || null,
        gender: document.getElementById('public-gender').value || null,
        vitals: {
          spo2: document.getElementById('public-spo2').value || null,
          temperature: document.getElementById('public-temp').value || null
        }
      });
      const risk = String(data.riskLevel || 'LOW').toLowerCase();
      const flags = (data.warningFlags || []).map(x => `<li>${escapeHtml(String(x))}</li>`).join('');
      const guidance = Array.isArray(data.guidance) ? data.guidance : (data.guidance ? [data.guidance] : []);
      result.hidden = false;
      result.className = `symptom-result ${risk}`;
      result.innerHTML = `
        <div class="symptom-risk">${escapeHtml(i18n.t('risk_level', 'Risk level'))}: ${escapeHtml(data.riskLevel || 'LOW')}</div>
        <p>${escapeHtml(data.triageCategory || '')}</p>
        ${flags ? `<strong>${escapeHtml(i18n.t('warning_flags', 'Warning flags'))}</strong><ul>${flags}</ul>` : ''}
        <strong>${escapeHtml(i18n.t('guidance', 'Guidance'))}</strong>
        <ul>${guidance.map(x => `<li>${escapeHtml(String(x))}</li>`).join('')}</ul>
        <p class="symptom-disclaimer">${escapeHtml(data.disclaimer || i18n.t('symptom_disclaimer'))}</p>`;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      result.hidden = false;
      result.className = 'symptom-result high';
      result.innerHTML = `<div class="symptom-risk">${escapeHtml(i18n.t('checker_unavailable', 'Symptom checker is temporarily unavailable.'))}</div><p>${escapeHtml(err.message || 'Please try again later.')}</p>`;
    } finally {
      button.disabled = false;
      button.textContent = i18n.t('check_symptoms', 'Check symptoms');
    }
  });

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }
});
