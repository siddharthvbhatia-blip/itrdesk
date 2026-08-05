(() => {
  const nav = document.querySelector('.site-nav');
  const processSection = document.getElementById('process');

  if (nav && !nav.querySelector('a[href="#pricing"]')) {
    const pricingLink = document.createElement('a');
    pricingLink.href = '#pricing';
    pricingLink.textContent = 'Pricing';
    const aboutLink = [...nav.querySelectorAll('a')].find(a => a.getAttribute('href') === 'about.html');
    nav.insertBefore(pricingLink, aboutLink || nav.lastElementChild);
  }

  if (processSection && !document.getElementById('pricing')) {
    const pricing = document.createElement('section');
    pricing.className = 'section pricing-section';
    pricing.id = 'pricing';
    pricing.innerHTML = `
      <div class="container">
        <div class="pricing-intro reveal">
          <div>
            <p class="eyebrow">Transparent starting points</p>
            <h2>Commercially sensible pricing. Scope controlled before work begins.</h2>
            <p>These are indicative starting prices for clean, accessible records. Final fees depend on transaction volume, entities, backlog, currencies, payroll, sales tax or VAT complexity, source quality, turnaround and reviewer requirements.</p>
          </div>
          <div class="pricing-graphic" aria-hidden="true">
            <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
            <div class="price-signal"><span>Close support</span><strong>Built to scale</strong><small>pilot → recurring cadence</small></div>
          </div>
        </div>
        <div class="pricing-grid">
          <article class="pricing-card reveal"><span class="plan-label">PILOT</span><h3>Defined pilot assignment</h3><p class="price"><strong>US$249</strong><span> / £199 onwards</span></p><p>One entity and one defined accounting cycle or cleanup batch to establish workflow and review expectations.</p><ul><li>Scope and access review</li><li>Reconciliation or cleanup batch</li><li>Open-item and query log</li><li>Review-ready handoff</li></ul><a class="btn btn-secondary" href="#contact">Discuss pilot scope</a></article>
          <article class="pricing-card featured reveal"><span class="plan-label">RECURRING</span><div class="popular-tag">Most suitable for firms</div><h3>Monthly accounting support</h3><p class="price"><strong>US$499</strong><span> / £399 onwards</span></p><p>Recurring bookkeeping, reconciliations and close schedules for a clean, low-to-moderate-volume entity.</p><ul><li>Monthly transaction review</li><li>Bank and card reconciliations</li><li>Balance-sheet schedules</li><li>Consolidated reviewer queries</li></ul><a class="btn btn-primary" href="#contact">Request monthly quote</a></article>
          <article class="pricing-card reveal"><span class="plan-label">GROWTH</span><h3>Multi-process finance support</h3><p class="price"><strong>Custom</strong><span> monthly scope</span></p><p>For multiple entities, higher transaction volumes, management reporting, AP/AR or structured offshore capacity.</p><ul><li>Dedicated delivery cadence</li><li>Reporting and variance schedules</li><li>AP, AR and ageing support</li><li>Firm-specific SOP alignment</li></ul><a class="btn btn-secondary" href="#contact">Build a custom scope</a></article>
        </div>
        <p class="pricing-note">Prices exclude regulated sign-off, attest work, legal advice, tax representation, software subscriptions and third-party charges. BluePeak Verity may revise the quote after inspecting sample records.</p>
      </div>`;
    processSection.parentNode.insertBefore(pricing, processSection);
  }

  const footerBrand = document.querySelector('.footer-brand');
  const footerLogo = footerBrand?.querySelector('img');
  if (footerLogo && !footerLogo.closest('.footer-logo-shell')) {
    const shell = document.createElement('span');
    shell.className = 'footer-logo-shell';
    footerLogo.parentNode.insertBefore(shell, footerLogo);
    shell.appendChild(footerLogo);
  }

  const navToggle = document.querySelector('.nav-toggle');
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
  if (!form) return;
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
