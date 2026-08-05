(() => {
  if (window.__bpvFinalUpdateApplied) return;
  window.__bpvFinalUpdateApplied = true;

  const tagline = 'Precision In Numbers - Excellence In Action';

  const founderMarkup = `
    <section class="section founder-spotlight" id="founder-profile">
      <div class="container founder-spotlight-grid">
        <div class="founder-visual-wrap reveal">
          <div class="founder-trust-card"><span class="trust-icon">✓</span><div><strong>Trusted by</strong><span>US, UK &amp; global businesses</span></div></div>
          <div class="founder-portrait-shell">
            <div class="founder-dot-grid" aria-hidden="true"></div><span class="founder-node one" aria-hidden="true"></span><span class="founder-node two" aria-hidden="true"></span>
            <div class="founder-portrait-stage"><div class="founder-portrait"><img src="assets/founder-enhanced.svg" alt="CA Siddharth Bhatia"></div></div>
            <span class="founder-profile-badge badge-top">International workflows</span><span class="founder-profile-badge badge-bottom">Accuracy-led delivery</span>
          </div>
        </div>
        <div class="founder-copy-wrap reveal">
          <p class="eyebrow">Founder</p>
          <h2 class="founder-name-single">CA Siddharth Bhatia</h2>
          <p class="founder-subline founder-subline-all-italic">Delivering reliable financial clarity through professional judgement with structured execution.</p>
          <div class="founder-pill-row"><span class="founder-pill">ICAI Member</span><span class="founder-pill">International Workflows</span><span class="founder-pill">CA-Led Delivery</span></div>
          <p>Indian Chartered Accountant providing remote accounting, bookkeeping, reconciliation and workpaper support for US, UK and global workflows.</p>
          <p>His professional background includes accounting, audit, tax/GST, financial reporting, lender-oriented documentation, working-paper preparation and corporate process exposure. The emphasis is on source tracing, structured schedules, concise query sheets and clear disclosure of unresolved matters.</p>
          <div class="founder-card-grid">
            <article class="founder-info-card membership"><strong>ICAI Membership</strong><span>Membership No. 438248</span></article>
            <article class="founder-info-card experience"><strong>Experience Areas</strong><span>Accounting, audit, tax and reporting support</span></article>
            <article class="founder-info-card tools"><strong>Core Tools</strong><span>QBO, Xero, Excel, Power BI</span></article>
            <article class="founder-info-card base"><strong>Base</strong><span>Indore, Madhya Pradesh, India</span></article>
          </div>
        </div>
      </div>
    </section>`;

  const globeMarkup = `
    <section class="services-globe" id="capabilities">
      <div class="container">
        <div class="section-heading center reveal">
          <p class="eyebrow">Services at a glance</p>
          <h2>Integrated support across accounting and finance operations.</h2>
          <p>Click a service around the globe to see how BluePeak Verity can support your workflow.</p>
        </div>
        <div class="services-globe-shell reveal">
          <div class="services-globe-stage" aria-label="Interactive globe of accounting services">
            <div class="services-globe-orbit outer" aria-hidden="true"></div><div class="services-globe-orbit inner" aria-hidden="true"></div>
            <div class="services-globe-core" aria-hidden="true"><div class="services-globe-name"><span>BluePeak Verity</span><strong>Global service network</strong><small>Accounting · Tax support · Finance operations</small></div></div>
            <button type="button" class="service-globe-node active" data-service="accounting" style="--top:8%;--left:50%">Accounting &amp; bookkeeping</button>
            <button type="button" class="service-globe-node" data-service="taxation" style="--top:27%;--left:84%">Taxation support</button>
            <button type="button" class="service-globe-node" data-service="ap" style="--top:72%;--left:84%">Accounts payable</button>
            <button type="button" class="service-globe-node" data-service="ar" style="--top:91%;--left:50%">Accounts receivable</button>
            <button type="button" class="service-globe-node" data-service="reporting" style="--top:72%;--left:16%">Management reporting</button>
            <button type="button" class="service-globe-node" data-service="cleanup" style="--top:27%;--left:16%">Cleanup &amp; catch-up</button>
          </div>
          <article class="service-globe-detail" aria-live="polite">
            <span class="service-detail-label" id="service-detail-label">Core accounting</span>
            <h3 id="service-detail-title">Accounting &amp; bookkeeping</h3>
            <p id="service-detail-copy">Transaction review, reconciliations, monthly books and supporting schedules prepared for reviewer handoff.</p>
            <ul id="service-detail-list"><li>Transaction review and coding</li><li>Monthly reconciliations and schedules</li><li>Review-ready handoff notes</li></ul>
            <div class="service-detail-foot" id="service-detail-foot">Best suited to recurring monthly accounting support.</div>
          </article>
        </div>
      </div>
    </section>`;

  const serviceData = {
    accounting:{label:'Core accounting',title:'Accounting & bookkeeping',copy:'Transaction review, reconciliations, monthly books and supporting schedules prepared for reviewer handoff.',items:['Transaction review and coding','Monthly reconciliations and schedules','Review-ready handoff notes'],foot:'Best suited to recurring monthly accounting support.'},
    taxation:{label:'Tax data',title:'Taxation support',copy:'Source-data organisation, schedules and workpapers prepared to support review by the responsible licensed adviser.',items:['Source-data collation','Working papers and schedules','Clear review-support documentation'],foot:'Preparation support only; regulated representation remains with the responsible adviser.'},
    ap:{label:'AP operations',title:'Accounts payable',copy:'Vendor balances, bill processing, ageing and payment-support schedules maintained within a controlled workflow.',items:['Vendor ledger support','Bills and ageing tracking','Payment-support schedules'],foot:'Useful for firms and growing businesses seeking stronger payables control.'},
    ar:{label:'AR operations',title:'Accounts receivable',copy:'Customer balances, invoicing support, receivables ageing and collection visibility organised for timely follow-up.',items:['Invoice-support workflow','Debtor ageing visibility','Collection follow-up support'],foot:'Designed to improve working-capital visibility without obscuring review responsibility.'},
    reporting:{label:'Management insight',title:'Management reporting',copy:'Financial statements, variance views and structured management schedules designed to support clearer decisions.',items:['Management reporting packs','Variance analysis support','Dashboards and financial schedules'],foot:'Suitable for managers, owners and accounting-firm reviewers.'},
    cleanup:{label:'Remediation',title:'Cleanup & catch-up',copy:'Backlogs, duplicates, reconciliations and missing-record issues organised into a clear remediation workflow.',items:['Backlog processing','Cleanup journals for review','Missing-document trackers'],foot:'Helpful before moving an entity into a recurring monthly cadence.'}
  };

  const homeHero = document.querySelector('main#main .hero');
  if (homeHero) {
    const heroCopy = homeHero.querySelector('.hero-copy-v4,.hero-copy,.hero-grid>div:first-child');
    if (heroCopy && !heroCopy.querySelector('.bpv-tagline-ribbon')) {
      const ribbon = document.createElement('div');
      ribbon.className = 'bpv-tagline-ribbon';
      ribbon.innerHTML = `<strong>${tagline}</strong>`;
      const kicker = heroCopy.querySelector('.hero-kicker,.eyebrow');
      heroCopy.insertBefore(ribbon, kicker || heroCopy.firstChild);
    }
    homeHero.querySelector('.hero-assurance-v4')?.remove();

    const capabilities = document.getElementById('capabilities');
    if (capabilities && !capabilities.classList.contains('services-globe')) capabilities.outerHTML = globeMarkup;

    document.querySelectorAll('section').forEach(section => {
      const heading = section.querySelector('.control-grid .eyebrow');
      if (heading && heading.textContent.trim().toLowerCase() === 'confidential back-office model') section.remove();
    });
  }

  const existingFounder = document.getElementById('founder-profile');
  if (existingFounder) existingFounder.outerHTML = founderMarkup;
  else {
    const legacyFounder = [...document.querySelectorAll('section')].find(section => section.querySelector('.founder-grid'));
    if (legacyFounder) legacyFounder.outerHTML = founderMarkup;
  }

  document.querySelectorAll('.footer-brand').forEach(footerBrand => {
    if (!footerBrand.querySelector('.footer-tagline')) {
      const footerTagline = document.createElement('span');
      footerTagline.className = 'footer-tagline';
      footerTagline.textContent = tagline;
      footerBrand.appendChild(footerTagline);
    }
  });

  const nodes = [...document.querySelectorAll('.service-globe-node')];
  const detailLabel = document.getElementById('service-detail-label');
  const detailTitle = document.getElementById('service-detail-title');
  const detailCopy = document.getElementById('service-detail-copy');
  const detailList = document.getElementById('service-detail-list');
  const detailFoot = document.getElementById('service-detail-foot');
  nodes.forEach(node => node.addEventListener('click', () => {
    const service = serviceData[node.dataset.service];
    if (!service) return;
    nodes.forEach(item => item.classList.toggle('active', item === node));
    detailLabel.textContent = service.label;
    detailTitle.textContent = service.title;
    detailCopy.textContent = service.copy;
    detailList.innerHTML = service.items.map(item => `<li>${item}</li>`).join('');
    detailFoot.textContent = service.foot;
  }));

  const revealTargets = document.querySelectorAll('.services-globe .reveal,.founder-spotlight .reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.1,rootMargin:'0px 0px -30px'});
    revealTargets.forEach((element,index) => { element.style.transitionDelay = `${Math.min(index % 4,3) * 70}ms`; observer.observe(element); });
  } else revealTargets.forEach(element => element.classList.add('visible'));
})();
