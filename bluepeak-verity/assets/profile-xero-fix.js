(() => {
  'use strict';

  /* Load the final founder-photo layer after every earlier stylesheet so it wins the cascade. */
  if (!document.querySelector('link[data-bp-founder-final]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/founder-photo-final.css?v=20260807-founder-final-r1';
    link.dataset.bpFounderFinal = 'true';
    document.head.appendChild(link);
  }

  const apply = () => {
    /* Founder portrait is rendered by founder-photo-final.css. Keep the broken legacy <img> suppressed. */
    document.querySelectorAll('.founder-photo-frame img').forEach(img => {
      img.removeAttribute('src');
      img.style.setProperty('display','none','important');
      img.style.setProperty('visibility','hidden','important');
      img.style.setProperty('opacity','0','important');
    });

    /* Keep Xero presentation clean: no score, completion date, completion ID or validity language. */
    document.querySelectorAll('.credibility-grid small').forEach(el => {
      if (/credential earned/i.test(el.textContent || '')) el.textContent = 'Xero workflow credential';
    });

    document.querySelectorAll('.credential-section p, .credential-section span, .credential-section small, .credential-section strong').forEach(el => {
      const t = (el.textContent || '').trim();
      if (/score\s*93|6 august 2026|completion id|validity/i.test(t)) {
        const card = el.closest('.bp-credential-card');
        if (card && /xero/i.test(card.textContent || '')) {
          const p = card.querySelector('.bp-credential-copy p');
          if (p) p.textContent = 'Xero L1 Certified Associate credential supporting Xero-oriented bookkeeping and reconciliation workflows.';
        } else {
          el.remove();
        }
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once:true });
  else apply();
  window.addEventListener('load', apply, { once:true });
})();