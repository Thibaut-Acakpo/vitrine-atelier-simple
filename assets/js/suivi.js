// Suivi de reparation — appelle le vrai endpoint public GET /track/:code de l'API
// (aucune authentification requise). Voir assets/js/config.js pour l'URL de l'API.

const STATUS_LABELS = {
  RECEIVED: 'Reçu',
  DIAGNOSING: 'Diagnostic en cours',
  QUOTE_SENT: 'Devis envoyé',
  IN_PROGRESS: 'Réparation en cours',
  WAITING_PART: 'En attente de pièce',
  DONE: 'Terminé / Prêt',
  DELIVERED: 'Livré',
  CANCELLED: 'Non réparable / Annulé',
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#tracking-form');
  const input = document.querySelector('#tracking-code');
  const resultEl = document.querySelector('#tracking-result');
  const errorEl = document.querySelector('#tracking-error');
  const loadingEl = document.querySelector('#tracking-loading');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const prefilled = params.get('code');
  if (prefilled) {
    input.value = prefilled;
    lookup(prefilled);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = input.value.trim();
    if (!code) return;
    history.replaceState(null, '', `?code=${encodeURIComponent(code)}`);
    lookup(code);
  });

  async function lookup(code) {
    resultEl.hidden = true;
    errorEl.hidden = true;
    loadingEl.hidden = false;
    try {
      const base = (window.ATELIER_CONFIG && window.ATELIER_CONFIG.apiBaseUrl) || '';
      const response = await fetch(`${base}/track/${encodeURIComponent(code)}`);
      if (!response.ok) throw new Error('not-found');
      renderResult(await response.json());
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = "Aucune fiche ne correspond à ce numéro de suivi. Vérifiez le code reçu par SMS ou email.";
    } finally {
      loadingEl.hidden = true;
    }
  }

  function renderResult(data) {
    const statusLabel = STATUS_LABELS[data.status] || data.status;
    const historyHtml = (data.history || [])
      .map((h) => `
        <li style="padding:0.5em 0; border-bottom:1px solid var(--line)">
          <strong>${escapeHtml(STATUS_LABELS[h.status] || h.status)}</strong>
          <span style="display:block; font-size:0.78rem; color:var(--ink-faint)">${new Date(h.createdAt).toLocaleString('fr-FR')}</span>
        </li>`)
      .join('');

    resultEl.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap">
          <h3 style="margin:0">Fiche ${escapeHtml(data.trackingCode)}</h3>
          <span style="font-weight:700; font-size:0.8rem; padding:0.4em 1em; border-radius:999px; background:var(--primary-tint); color:var(--primary-dark)">${escapeHtml(statusLabel)}</span>
        </div>
        <p style="margin-top:1rem"><strong>Appareil :</strong> ${escapeHtml(data.device.brand)} ${escapeHtml(data.device.model)}</p>
        <p><strong>Panne déclarée :</strong> ${escapeHtml(data.reportedIssue)}</p>
        ${data.quoteAmount != null ? `<p><strong>Devis :</strong> ${escapeHtml(String(data.quoteAmount))} FCFA (${escapeHtml(data.quoteStatus || '')})</p>` : ''}
        ${data.promisedDate ? `<p><strong>Date promise :</strong> ${new Date(data.promisedDate).toLocaleDateString('fr-FR')}</p>` : ''}
        <h4 style="margin-top:1.3rem">Historique</h4>
        <ul style="list-style:none; padding:0; margin:0.6rem 0 0">${historyHtml}</ul>
      </div>`;
    resultEl.hidden = false;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
