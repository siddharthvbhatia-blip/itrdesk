(() => {
  const founderMarkup = (imagePath) => `
    <section class="section founder-spotlight" id="founder-profile">
      <div class="container founder-spotlight-grid">
        <div class="founder-visual-wrap reveal">
          <div class="founder-trust-card"><span class="trust-icon">✓</span><div><strong>Trusted by</strong><span>US, UK &amp; global businesses</span></div></div>
          <div class="founder-portrait-shell">
            <div class="founder-dot-grid" aria-hidden="true"></div><span class="founder-node one" aria-hidden="true"></span><span class="founder-node two" aria-hidden="true"></span>
            <div class="founder-portrait-stage"><div class="founder-portrait"><img src="${imagePath}" alt="CA Siddharth Bhatia"></div></div>
            <span class="founder-profile-badge badge-top">International workflows</span><span class="founder-profile-badge badge-bottom">Accuracy-led delivery</span>
          </div>
        </div>
        <div class="founder-copy-wrap reveal">
          <p class="eyebrow">Founder</p><h2>CA Siddharth Bhatia</h2>
          <p class="founder-subline">Delivering reliable financial clarity through <em>professional judgement</em> <em>with structured execution.</em></p>
          <div class="founder-pill-row"><span class="founder-pill">ICAI Member</span><span class="founder-pill">International Workflows</span><span class="founder-pill">CA-Led Delivery</span></div>
          <p>Indian Chartered Accountant providing remote accounting, bookkeeping, reconciliation and workpaper support for US, UK and global workflows.</p>
          <p>His professional background includes accounting, audit, tax/GST, financial reporting, lender-oriented documentation, working-paper preparation and corporate process exposure. The emphasis is on source tracing, structured schedules, concise query sheets and clear disclosure of unresolved matters.</p>
          <div class="founder-card-grid">
            <article class="founder-info-card membership"><strong>ICAI Membership</strong><span>Membership No. 438248</span></article>
            <article class="founder-info-card experience"><strong>Experience Areas</strong><span>Accounting, audit, tax and reporting support</span></article>
            <article class="founder-info-card tools"><strong>Core Tools</strong><span>QBO, Xero, Excel, Power BI</span></article>
            <article class="founder-info-card base"><strong>Base</strong><span>Indore, Madhya Pradesh, India</span></article>
            <div class="founder-value-strip"><span>Confidential &amp; secure</span><span>On-time delivery</span><span>Detail oriented</span><span>Long-term partnership</span><strong>Built on trust. Delivered with precision.</strong></div>
          </div>
        </div>
      </div>
    </section>`;

  const servicesMarkup = `
    <section class="services-snapshot" id="capabilities">
      <div class="container">
        <div class="section-heading center reveal"><p class="eyebrow">Services at a glance</p><h2>Integrated support across accounting and finance operations.</h2><p>A concise view of the service areas available to accounting firms and growing businesses.</p></div>
        <div class="services-snapshot-grid">
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3M14 11h2M8 15h3M14 15h2"/></svg></span><h3>Accounting &amp; bookkeeping</h3><p>Transaction review, reconciliations, monthly books and supporting schedules.</p><span>Core accounting</span></article>
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h3"/></svg></span><h3>Taxation support</h3><p>Source-data organisation, schedules and workpapers for professional review.</p><span>Tax data</span></article>
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM4 10h16M8 15h4"/><path d="M16 3v5M13.5 5.5 16 8l2.5-2.5"/></svg></span><h3>Accounts payable</h3><p>Vendor balances, bill processing, ageing and payment-support schedules.</p><span>AP operations</span></article>
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM4 10h16M8 15h4"/><path d="M16 8V3M13.5 5.5 16 3l2.5 2.5"/></svg></span><h3>Accounts receivable</h3><p>Customer balances, invoicing support, ageing and collection visibility.</p><span>AR operations</span></article>
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span><h3>Management reporting</h3><p>Financial statements, variance analysis and decision-support schedules.</p><span>Reporting</span></article>
          <article class="services-snapshot-card reveal"><span class="services-snapshot-icon"><svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M7.1 7.2A7 7 0 0 1 19 10M16.9 16.8A7 7 0 0 1 5 14"/></svg></span><h3>Cleanup &amp; catch-up</h3><p>Backlog processing, duplicate review and reconciliation remediation.</p><span>Remediation</span></article>
        </div>
      </div>
    </section>`;

  const home = document.querySelector('main#main .hero');
  if (home) {
    const oldCapabilities = document.getElementById('capabilities');
    if (oldCapabilities && !oldCapabilities.classList.contains('services-snapshot')) oldCapabilities.outerHTML = servicesMarkup;

    document.querySelectorAll('section').forEach(section => {
      const heading = section.querySelector('.control-grid .eyebrow');
      if (heading && heading.textContent.trim().toLowerCase() === 'confidential back-office model') section.remove();
    });

    const oldFounder = [...document.querySelectorAll('section')].find(section => section.querySelector('.founder-grid'));
    if (oldFounder && !document.getElementById('founder-profile')) oldFounder.outerHTML = founderMarkup('../assets/ca-siddharth-bhatia-final-r16.jpg');
  }

  const aboutFounder = document.querySelector('main#main .founder-grid');
  if (aboutFounder && !document.getElementById('founder-profile')) {
    const section = aboutFounder.closest('section');
    if (section) section.outerHTML = founderMarkup('../assets/ca-siddharth-bhatia-final-r16.jpg');
  }

  const revealTargets = document.querySelectorAll('.services-snapshot .reveal, .founder-spotlight .reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .1, rootMargin: '0px 0px -30px' });
    revealTargets.forEach((element, index) => { element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`; observer.observe(element); });
  } else revealTargets.forEach(element => element.classList.add('visible'));
})();
