(() => {
  'use strict';

  const apply = () => {
    document.querySelectorAll('.founder-photo-frame img').forEach(img => {
      img.src = 'assets/founder-original-attached.jpg?v=20260807-performance-r1';
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.setProperty('display','block','important');
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('object-fit','cover','important');
      img.style.setProperty('object-position','center 20%','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('filter','none','important');
    });

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
        } else if (/score|completion|validity/i.test(t)) {
          el.remove();
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once:true });
  } else {
    apply();
  }
  window.addEventListener('load', apply, { once:true });
})();