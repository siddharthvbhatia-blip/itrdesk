(() => {
  const hero = document.querySelector('.hero');
  if (hero && !hero.classList.contains('hero-v2')) {
    hero.className = 'hero hero-v2';
    hero.setAttribute('aria-labelledby', 'hero-title');
    hero.innerHTML = `
      <div class="hero-ambient" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="container hero-grid hero-grid-v2">
        <div class="hero-copy hero-copy-v2">
          <p class="eyebrow hero-kicker"><span class="live-dot" aria-hidden="true"></span>US &amp; UK accounting support · delivered from India</p>
          <h1 id="hero-title">Reliable accounting capacity. <em>Review-ready from day one.</em></h1>
          <p class="hero-lead">BluePeak Verity supports accounting firms with reconciliations, month-end close, cleanup, reporting and workpapers—under your process, your review standards and your client relationship.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#contact">Discuss a pilot engagement <span aria-hidden="true">→</span></a><a class="btn btn-secondary" href="#capabilities">Explore capabilities</a></div>
          <div class="hero-assurance" aria-label="Service assurances"><div><strong>CA-led</strong><span>Professional oversight</span></div><div><strong>Controlled</strong><span>Defined scope and access</span></div><div><strong>Reviewable</strong><span>Clear schedules and queries</span></div></div>
        </div>
        <div class="hero-visual hero-visual-v2" aria-label="Illustrative month-end close control panel">
          <div class="visual-glow" aria-hidden="true"></div>
          <div class="close-panel">
            <div class="close-panel-header"><div><span class="panel-label">Illustrative workflow</span><h2>Month-end close control</h2></div><span class="panel-status"><i aria-hidden="true"></i> On track</span></div>
            <div class="close-metrics"><article><span>Reconciled</span><strong><b data-count="96">0</b>%</strong><small>Ready for review</small></article><article><span>Open items</span><strong><b data-count="8">0</b></strong><small>Consolidated query log</small></article><article><span>Close stage</span><strong>Day <b data-count="4">0</b></strong><small>Within agreed cadence</small></article></div>
            <div class="close-chart-card"><div class="chart-heading"><div><strong>Close progression</strong><span>Illustrative completion trend</span></div><span class="chart-badge">Current cycle</span></div><div class="close-chart" aria-hidden="true"><div class="chart-grid"></div><svg viewBox="0 0 560 190" preserveAspectRatio="none"><defs><linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d83ed" stop-opacity=".28"/><stop offset="1" stop-color="#3d83ed" stop-opacity="0"/></linearGradient></defs><path class="chart-area" d="M0 164 C62 150 96 145 137 126 S224 128 272 90 S359 108 410 61 S492 75 560 23 L560 190 L0 190Z" fill="url(#heroArea)"/><path class="chart-line" d="M0 164 C62 150 96 145 137 126 S224 128 272 90 S359 108 410 61 S492 75 560 23"/></svg><div class="chart-bars"><i style="--h:30%;--d:.05s"></i><i style="--h:43%;--d:.12s"></i><i style="--h:49%;--d:.19s"></i><i style="--h:61%;--d:.26s"></i><i style="--h:58%;--d:.33s"></i><i style="--h:74%;--d:.40s"></i><i style="--h:82%;--d:.47s"></i></div></div></div>
            <div class="close-bottom-grid"><div class="review-list"><div class="mini-heading"><strong>Reviewer queue</strong><span>3 workstreams</span></div><div class="review-row"><span class="review-icon">✓</span><div><strong>Bank reconciliations</strong><small>Source-linked schedules</small></div><em>Ready</em></div><div class="review-row"><span class="review-icon">✓</span><div><strong>Balance-sheet schedules</strong><small>Exceptions identified</small></div><em>Ready</em></div><div class="review-row"><span class="review-icon pending">2</span><div><strong>Client queries</strong><small>Consolidated for follow-up</small></div><em class="pending-text">Open</em></div></div><div class="handoff-card"><span class="handoff-icon" aria-hidden="true">↗</span><strong>Predictable handoff</strong><p>Sources, assumptions and unresolved matters remain visible to the reviewer.</p><div class="handoff-steps" aria-hidden="true"><i class="done"></i><i class="done"></i><i class="active"></i><i></i></div></div></div>
          </div>
        </div>
      </div>`;
  }

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
            <p>Indicative starting prices apply to clean, accessible records. Final fees depend on volume, entities, backlog, currencies, payroll, sales tax or VAT, source quality, turnaround and reviewer requirements.</p>
          </div>
          <div class="pricing-graphic" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="price-signal"><span>Close support</span><strong>Built to scale</strong><small>pilot → recurring cadence</small></div></div>
        </div>
        <div class="pricing-grid">
          <article class="pricing-card reveal"><span class="plan-label">PILOT</span><h3>Defined pilot assignment</h3><p class="price"><strong>US$249</strong><span> / £199 onwards</span></p><p>One entity and one defined accounting cycle or cleanup batch to establish workflow and review expectations.</p><ul><li>Scope and access review</li><li>Reconciliation or cleanup batch</li><li>Open-item and query log</li><li>Review-ready handoff</li></ul><a class="btn btn-secondary" href="#contact">Discuss pilot scope</a></article>
          <article class="pricing-card featured reveal"><span class="plan-label">RECURRING</span><div class="popular-tag">Most suitable for firms</div><h3>Monthly accounting support</h3><p class="price"><strong>US$499</strong><span> / £399 onwards</span></p><p>Recurring bookkeeping, reconciliations and close schedules for a clean, low-to-moderate-volume entity.</p><ul><li>Monthly transaction review</li><li>Bank and card reconciliations</li><li>Balance-sheet schedules</li><li>Consolidated reviewer queries</li></ul><a class="btn btn-primary" href="#contact">Request monthly quote</a></article>
          <article class="pricing-card reveal"><span class="plan-label">GROWTH</span><h3>Multi-process finance support</h3><p class="price"><strong>Custom</strong><span> monthly scope</span></p><p>For multiple entities, higher volumes, management reporting, AP/AR or structured offshore capacity.</p><ul><li>Dedicated delivery cadence</li><li>Reporting and variance schedules</li><li>AP, AR and ageing support</li><li>Firm-specific SOP alignment</li></ul><a class="btn btn-secondary" href="#contact">Build a custom scope</a></article>
        </div>
        <p class="pricing-note">Prices exclude regulated sign-off, attest work, legal advice, tax representation, software subscriptions and third-party charges. The quote may be revised after sample records are inspected.</p>
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
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const tabs = [...document.querySelectorAll('.tab-button')];
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.audience-panel').forEach(p => p.hidden = p.id !== btn.dataset.target);
  }));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .12, rootMargin: '0px 0px -40px' });
    reveals.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(el);
    });
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  const counters = [...document.querySelectorAll('[data-count]')];
  const runCounter = el => {
    const target = Number(el.dataset.count || 0);
    if (reducedMotion) { el.textContent = String(target); return; }
    const duration = 1100;
    const started = performance.now();
    const tick = now => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    }), { threshold: .7 });
    counters.forEach(el => counterObserver.observe(el));
  } else counters.forEach(runCounter);

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
