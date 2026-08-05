(() => {
  const hero = document.querySelector('.hero');
  if (hero && !hero.classList.contains('hero-v4')) {
    hero.className = 'hero hero-v4';
    hero.setAttribute('aria-labelledby', 'hero-title');
    hero.innerHTML = `
      <div class="hero-ambient" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="container hero-grid-v4">
        <div class="hero-copy hero-copy-v4">
          <p class="eyebrow hero-kicker"><span class="live-dot" aria-hidden="true"></span>US &amp; UK accounting support · delivered from India</p>
          <h1 id="hero-title">Accounting and finance operations. <em>One disciplined delivery team.</em></h1>
          <p class="hero-lead">BluePeak Verity supports accounting firms and growing businesses across bookkeeping, taxation workpapers, accounts payable, accounts receivable, reporting and cleanup—under defined scope and professional review.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#contact">Discuss a pilot engagement <span aria-hidden="true">→</span></a><a class="btn btn-secondary" href="#capabilities">Explore capabilities</a></div>
          <div class="hero-assurance-v4" aria-label="Core service groups"><div><strong>Accounting &amp; reporting</strong><span>Books, reconciliations and schedules</span></div><div><strong>Taxation support</strong><span>Source data and workpaper preparation</span></div><div><strong>AP &amp; AR operations</strong><span>Payables, receivables and ageing</span></div></div>
        </div>
        <div class="hero-services-visual" aria-label="Animated overview of BluePeak Verity services">
          <div class="services-glow" aria-hidden="true"></div>
          <div class="service-console">
            <div class="service-console-head"><div><span class="panel-label">BluePeak Verity delivery desk</span><h2>Integrated accounting support</h2></div><span class="service-console-status"><i aria-hidden="true"></i> Service portfolio</span></div>
            <div class="hero-service-grid">
              <article class="hero-service-card active" style="--delay:.05s" data-hero-service data-focus-title="Accounting & bookkeeping" data-focus-copy="Monthly books, reconciliations and ledger review prepared for professional review."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3M14 11h2M8 15h3M14 15h2"/></svg></span><h3>Accounting &amp; bookkeeping</h3><p>Transaction review, reconciliations and ledger schedules.</p><span class="service-tag">Core books</span></article>
              <article class="hero-service-card" style="--delay:.12s" data-hero-service data-focus-title="Taxation support" data-focus-copy="Tax-source data, schedules and workpapers organised for the responsible licensed adviser."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h3"/></svg></span><h3>Taxation support</h3><p>Source-data organisation and supporting workpapers.</p><span class="service-tag">Tax data</span></article>
              <article class="hero-service-card" style="--delay:.19s" data-hero-service data-focus-title="Accounts payable" data-focus-copy="Vendor ledgers, bill processing, ageing and payment schedules kept visible and controlled."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v12H4zM4 10h16M8 15h4"/><path d="M16 3v5M13.5 5.5 16 8l2.5-2.5"/></svg></span><h3>Accounts payable</h3><p>Vendor balances, bills, ageing and payment support.</p><span class="service-tag">AP</span></article>
              <article class="hero-service-card" style="--delay:.26s" data-hero-service data-focus-title="Accounts receivable" data-focus-copy="Customer ledgers, invoicing schedules, ageing and collection visibility for timely follow-up."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v12H4zM4 10h16M8 15h4"/><path d="M16 8V3M13.5 5.5 16 3l2.5 2.5"/></svg></span><h3>Accounts receivable</h3><p>Customer balances, invoicing and collection visibility.</p><span class="service-tag">AR</span></article>
              <article class="hero-service-card" style="--delay:.33s" data-hero-service data-focus-title="Management reporting" data-focus-copy="P&L, balance-sheet, variance and management schedules designed for clearer decisions."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span><h3>Management reporting</h3><p>Financial statements, variance analysis and schedules.</p><span class="service-tag">Insights</span></article>
              <article class="hero-service-card" style="--delay:.40s" data-hero-service data-focus-title="Cleanup & catch-up" data-focus-copy="Backlogs, duplicates, misclassifications and unreconciled balances systematically resolved."><span class="service-icon-box"><svg class="service-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M7.1 7.2A7 7 0 0 1 19 10M16.9 16.8A7 7 0 0 1 5 14"/></svg></span><h3>Cleanup &amp; catch-up</h3><p>Backlogs, duplicates and reconciliation corrections.</p><span class="service-tag">Remediation</span></article>
            </div>
            <div class="service-flow" aria-label="Delivery process"><div class="flow-label"><strong>Controlled delivery path</strong><span>From source records to reviewer handoff</span></div><div class="flow-track" aria-hidden="true"><i></i></div><div class="flow-steps"><span class="flow-step active"><b>01</b>Records</span><span class="flow-step"><b>02</b>Process</span><span class="flow-step"><b>03</b>Review</span><span class="flow-step"><b>04</b>Handoff</span></div></div>
            <div class="service-focus" aria-live="polite"><span class="focus-icon" aria-hidden="true">↗</span><div><strong id="service-focus-title">Accounting &amp; bookkeeping</strong><span id="service-focus-copy">Monthly books, reconciliations and ledger review prepared for professional review.</span></div><em>Under your review framework</em></div>
          </div>
        </div>
      </div>`;
  }

  const nav = document.querySelector('.site-nav');
  const processSection = document.getElementById('process');
  const hasPricingLink = nav && [...nav.querySelectorAll('a')].some(a => a.getAttribute('href')?.endsWith('#pricing'));
  if (nav && !hasPricingLink) {
    const pricingLink = document.createElement('a');
    pricingLink.href = location.pathname.endsWith('about.html') ? 'index.html#pricing' : '#pricing';
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
        <div class="pricing-intro reveal"><div><p class="eyebrow">Transparent starting points</p><h2>Commercially sensible pricing. Scope controlled before work begins.</h2><p>Indicative starting prices apply to clean, accessible records. Final fees depend on volume, entities, backlog, currencies, payroll, sales tax or VAT, source quality, turnaround and reviewer requirements.</p></div><div class="pricing-graphic" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="price-signal"><span>Finance operations</span><strong>Built to scale</strong><small>pilot → recurring cadence</small></div></div></div>
        <div class="pricing-grid">
          <article class="pricing-card reveal"><span class="plan-label">PILOT</span><h3>Defined pilot assignment</h3><p class="price"><strong>US$249</strong><span> / £199 onwards</span></p><p>One entity and one defined accounting cycle or cleanup batch to establish workflow and review expectations.</p><ul><li>Scope and access review</li><li>Reconciliation or cleanup batch</li><li>Open-item and query log</li><li>Review-ready handoff</li></ul><a class="btn btn-secondary" href="#contact">Discuss pilot scope</a></article>
          <article class="pricing-card featured reveal"><span class="plan-label">RECURRING</span><div class="popular-tag">Most suitable for firms</div><h3>Monthly accounting support</h3><p class="price"><strong>US$499</strong><span> / £399 onwards</span></p><p>Recurring bookkeeping, reconciliations and close schedules for a clean, low-to-moderate-volume entity.</p><ul><li>Monthly transaction review</li><li>Bank and card reconciliations</li><li>Balance-sheet schedules</li><li>Consolidated reviewer queries</li></ul><a class="btn btn-primary" href="#contact">Request monthly quote</a></article>
          <article class="pricing-card reveal"><span class="plan-label">GROWTH</span><h3>Multi-process finance support</h3><p class="price"><strong>Custom</strong><span> monthly scope</span></p><p>For multiple entities, higher volumes, management reporting, AP/AR or structured offshore capacity.</p><ul><li>Dedicated delivery cadence</li><li>Reporting and variance schedules</li><li>AP, AR and ageing support</li><li>Firm-specific SOP alignment</li></ul><a class="btn btn-secondary" href="#contact">Build a custom scope</a></article>
        </div><p class="pricing-note">Prices exclude regulated sign-off, attest work, legal advice, tax representation, software subscriptions and third-party charges. The quote may be revised after sample records are inspected.</p>
      </div>`;
    processSection.parentNode.insertBefore(pricing, processSection);
  }

  const footerLogo = document.querySelector('.footer-brand img');
  if (footerLogo && !footerLogo.closest('.footer-logo-shell')) {
    const shell = document.createElement('span'); shell.className = 'footer-logo-shell';
    footerLogo.parentNode.insertBefore(shell, footerLogo); shell.appendChild(footerLogo);
  }

  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(open)); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }));
  }

  document.querySelectorAll('.tab-button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.audience-panel').forEach(panel => panel.hidden = panel.id !== btn.dataset.target);
  }));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const serviceCards = [...document.querySelectorAll('[data-hero-service]')];
  const focusTitle = document.getElementById('service-focus-title');
  const focusCopy = document.getElementById('service-focus-copy');
  const flowSteps = [...document.querySelectorAll('.flow-step')];
  let serviceIndex = 0;
  let serviceTimer;
  const activateService = index => {
    if (!serviceCards.length) return;
    serviceIndex = (index + serviceCards.length) % serviceCards.length;
    serviceCards.forEach((card, i) => card.classList.toggle('active', i === serviceIndex));
    const active = serviceCards[serviceIndex];
    if (focusTitle) focusTitle.textContent = active.dataset.focusTitle || '';
    if (focusCopy) focusCopy.textContent = active.dataset.focusCopy || '';
    flowSteps.forEach((step, i) => step.classList.toggle('active', i === serviceIndex % flowSteps.length));
  };
  serviceCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => activateService(index));
    card.addEventListener('focusin', () => activateService(index));
    card.addEventListener('click', () => activateService(index));
  });
  if (serviceCards.length && !reducedMotion) {
    serviceTimer = window.setInterval(() => activateService(serviceIndex + 1), 2600);
    document.querySelector('.service-console')?.addEventListener('mouseenter', () => window.clearInterval(serviceTimer));
    document.querySelector('.service-console')?.addEventListener('mouseleave', () => { window.clearInterval(serviceTimer); serviceTimer = window.setInterval(() => activateService(serviceIndex + 1), 2600); });
  }

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px' });
    revealElements.forEach((element, index) => { element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`; revealObserver.observe(element); });
  } else revealElements.forEach(element => element.classList.add('visible'));

  const form = document.getElementById('fit-form');
  if (form) {
    const message = document.getElementById('form-message');
    const buildBrief = () => {
      const data = new FormData(form);
      return ['BluePeak Verity — Engagement Enquiry','',`Name: ${data.get('name') || ''}`,`Firm / Business: ${data.get('firm') || ''}`,`Work email: ${data.get('email') || ''}`,`Country / Time zone: ${data.get('country') || ''}`,`Support required: ${data.get('service') || ''}`,`Estimated monthly volume: ${data.get('volume') || ''}`,'','Brief:',data.get('brief') || ''].join('\n');
    };
    const validate = () => { if (!form.reportValidity()) return false; if (message) message.textContent = 'Your enquiry brief is ready. Please complete sending it in the app that opens.'; return true; };
    document.getElementById('email-brief')?.addEventListener('click', event => { event.preventDefault(); if (!validate()) return; window.location.href = `mailto:siddharth.v.bhatia@gmail.com?subject=${encodeURIComponent('International accounting support enquiry')}&body=${encodeURIComponent(buildBrief())}`; });
    document.getElementById('whatsapp-brief')?.addEventListener('click', event => { event.preventDefault(); if (!validate()) return; window.open(`https://wa.me/917879857126?text=${encodeURIComponent(buildBrief())}`, '_blank', 'noopener'); });
  }

  if (!document.querySelector('script[src$="targeted-update.js"]')) {
    const targetedScript = document.createElement('script');
    targetedScript.src = 'assets/targeted-update.js';
    targetedScript.defer = true;
    document.head.appendChild(targetedScript);
  }
})();
