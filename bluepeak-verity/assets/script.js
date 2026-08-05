(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false');
    }));
  }

  const tabs = [...document.querySelectorAll('.tab-button')];
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    document.querySelectorAll('.audience-panel').forEach(p => p.hidden = p.id !== btn.dataset.target);
  }));

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold:.12 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  const form = document.getElementById('fit-form');
  const message = document.getElementById('form-message');
  const buildBrief = () => {
    const data = new FormData(form);
    return [
      'BluePeak Verity — Engagement Enquiry', '',
      `Name: ${data.get('name') || ''}`,
      `Firm / Business: ${data.get('firm') || ''}`,
      `Work email: ${data.get('email') || ''}`,
      `Country / Time zone: ${data.get('country') || ''}`,
      `Support required: ${data.get('service') || ''}`,
      `Estimated monthly volume: ${data.get('volume') || ''}`, '',
      'Brief:', data.get('brief') || ''
    ].join('\n');
  };
  const validate = () => {
    if (!form.reportValidity()) return false;
    message.textContent = 'Your enquiry brief is ready. Please complete sending it in the app that opens.';
    return true;
  };
  document.getElementById('email-brief')?.addEventListener('click', e => {
    e.preventDefault(); if (!validate()) return;
    const subject = encodeURIComponent('International accounting support enquiry');
    const body = encodeURIComponent(buildBrief());
    window.location.href = `mailto:siddharth.v.bhatia@gmail.com?subject=${subject}&body=${body}`;
  });
  document.getElementById('whatsapp-brief')?.addEventListener('click', e => {
    e.preventDefault(); if (!validate()) return;
    window.open(`https://wa.me/917879857126?text=${encodeURIComponent(buildBrief())}`, '_blank', 'noopener');
  });
})();
