/**
 * Handler genérico para todo `<form data-form="lead">` (home, contacto, etc.).
 * Hace fetch JSON a /api/lead y reemplaza el form con mensaje de éxito/error.
 *
 * El cotizador tiene su propio submit en widget.ts y NO usa data-form="lead".
 */
const trackEvent = (name, params = {}) => {
    if (typeof gtag === 'function')
        gtag('event', name, params);
    if (typeof fbq === 'function')
        fbq('trackCustom', name, params);
};
const formToJson = (form) => {
    const data = new FormData(form);
    const out = {};
    for (const [key, value] of data.entries()) {
        if (typeof value === 'string')
            out[key] = value;
    }
    return out;
};
const renderSuccess = (form) => {
    const card = document.createElement('div');
    card.className = 'form-success';
    card.setAttribute('role', 'status');
    card.style.cssText =
        'padding:1.5rem;background:#E8F5E9;border:1.5px solid #66BB6A;border-radius:6px;color:#1B5E20;font-family:Montserrat,sans-serif';
    card.innerHTML =
        '<h3 style="margin:0 0 .5rem;font-size:1rem">✓ Solicitud enviada</h3>' +
            '<p style="margin:0;font-size:.88rem;line-height:1.5">Gracias. Le contactaremos en menos de 24 horas hábiles.</p>';
    form.replaceWith(card);
};
const renderError = (form, message) => {
    let box = form.querySelector('.form-error');
    if (!box) {
        box = document.createElement('div');
        box.className = 'form-error';
        box.setAttribute('role', 'alert');
        box.style.cssText =
            'margin-top:1rem;padding:.85rem 1rem;background:#FFEBEE;border:1.5px solid #E57373;border-radius:6px;color:#B71C1C;font-size:.85rem;font-family:Montserrat,sans-serif';
        form.appendChild(box);
    }
    box.textContent = message;
};
const clearError = (form) => {
    form.querySelector('.form-error')?.remove();
};
const submitLead = async (form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn?.textContent ?? '';
    const payload = formToJson(form);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
    }
    clearError(form);
    trackEvent('form_submit_started', { source: payload.source });
    try {
        const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const body = (await res.json().catch(() => ({})));
            const msg = body.error === 'invalid_payload'
                ? 'Revise los datos del formulario e intente de nuevo.'
                : 'No pudimos enviar su solicitud. Intente de nuevo o contáctenos por WhatsApp.';
            renderError(form, msg);
            trackEvent('form_error', { source: payload.source, status: res.status });
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalLabel;
            }
            return;
        }
        trackEvent('form_submitted', { source: payload.source });
        renderSuccess(form);
    }
    catch (err) {
        renderError(form, 'Error de conexión. Verifique su internet o contáctenos por WhatsApp.');
        trackEvent('form_error', {
            source: payload.source,
            error: err instanceof Error ? err.message : String(err),
        });
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    }
};
export function initLeadForms() {
    const forms = document.querySelectorAll('form[data-form="lead"]');
    forms.forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            void submitLead(form);
        });
    });
}
//# sourceMappingURL=forms.js.map