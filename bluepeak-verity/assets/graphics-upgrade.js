(() => {
  'use strict';
  const CA_LOGO = 'https://cmp.icai.org/wp-content/uploads/2025/10/CA-India-Logo-1024x762-250x185.png';
  const ICAI_LOGO_INFO = 'https://www.icai.org/post/19553';

  const addStylesheet = (href, marker) => {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(`data-${marker}`, 'true');
    document.head.appendChild(link);
  };
  addStylesheet('assets/graphics-upgrade.css?v=20260807-r4', 'bp-graphics');
  addStylesheet('assets/graphics-global.css?v=20260807-r1', 'bp-global');

  const firstHeroProof = document.querySelector('.hero-proof span');
  if (firstHeroProof && !firstHeroProof.querySelector('.bp-hero-ca-logo')) {
    const caLogo = document.createElement('img');
    caLogo.className = 'bp-hero-ca-logo';
    caLogo.src = CA_LOGO;
    caLogo.alt = 'CA India';
    caLogo.width = 30;
    caLogo.height = 22;
    caLogo.decoding = 'async';
    caLogo.style.cssText = 'width:30px;height:22px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;margin-left:-15px;margin-right:7px;box-shadow:0 5px 14px rgba(0,0,0,.14)';
    firstHeroProof.prepend(caLogo);
    firstHeroProof.style.paddingLeft = '18px';
    firstHeroProof.style.display = 'inline-flex';
    firstHeroProof.style.alignItems = 'center';
  }

  const heroStage = document.querySelector('[data-control-stage]');
  if (heroStage && !heroStage.querySelector('.bp-altitude-field')) {
    heroStage.insertAdjacentHTML('afterbegin', `
      <div class="bp-altitude-field" aria-hidden="true">
        <svg viewBox="0 0 760 650" preserveAspectRatio="none">
          <path d="M16 510 C120 414 176 438 264 346 S440 220 548 276 678 244 748 120"/>
          <path d="M4 566 C124 492 194 500 286 410 S454 300 570 332 690 308 756 206"/>
          <path d="M34 620 C136 548 230 558 330 474 S500 372 602 398 704 382 770 300"/>
        </svg>
      </div>
      <div class="bp-control-beacon bp-beacon-a" aria-hidden="true"><i>01</i><div><strong>Source integrity</strong><small>Evidence linked</small></div></div>
      <div class="bp-control-beacon bp-beacon-b" aria-hidden="true"><i>02</i><div><strong>Exception control</strong><small>Queries isolated</small></div></div>
      <div class="bp-control-beacon bp-beacon-c" aria-hidden="true"><i>03</i><div><strong>Reviewer handoff</strong><small>Status visible</small></div></div>
    `);
  }

  const credibility = document.querySelector('.credibility-grid');
  const caCredibility = credibility?.firstElementChild;
  if (caCredibility && !caCredibility.querySelector('.bp-ca-mini')) {
    const badge = document.createElement('a');
    badge.className = 'bp-ca-mini';
    badge.href = ICAI_LOGO_INFO;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';
    badge.setAttribute('aria-label', 'CA India professional logo information from ICAI');
    badge.innerHTML = `<img src="${CA_LOGO}" alt="CA India logo" width="50" height="37" loading="eager" decoding="async">`;
    caCredibility.prepend(badge);
  }

  const audiencePanel = document.querySelector('.audience-panel');
  const audienceProof = document.querySelector('#audience-proof');
  if (audiencePanel && audienceProof && !audiencePanel.querySelector('.bp-global-network')) {
    const visual = document.createElement('div');
    visual.className = 'bp-audience-visual';
    visual.innerHTML = `
      <div class="bp-global-network" aria-label="Illustrative delivery network connecting India with US and UK workflows">
        <svg viewBox="0 0 480 230" role="img" aria-hidden="true">
          <ellipse class="bp-globe-ring" cx="240" cy="116" rx="116" ry="92"/>
          <ellipse class="bp-globe-ring dash" cx="240" cy="116" rx="58" ry="92"/>
          <ellipse class="bp-globe-ring" cx="240" cy="116" rx="116" ry="39"/>
          <path class="bp-globe-ring" d="M124 116H356M146 67C198 90 284 90 334 67M146 165C198 142 284 142 334 165"/>
          <path class="bp-route" d="M194 131 C155 101 117 88 79 92"/>
          <path class="bp-route uk" d="M198 127 C250 82 318 67 380 77"/>
          <circle class="bp-route-pulse" cx="144" cy="107" r="3.5"/>
          <circle class="bp-route-pulse" cx="306" cy="88" r="3.5" style="animation-delay:-1.7s"/>
          <g class="bp-network-node hub" transform="translate(194 131)"><circle r="15"/><text text-anchor="middle" dy="2.6">IND</text></g>
          <g class="bp-network-node" transform="translate(79 92)"><circle r="13"/><text text-anchor="middle" dy="2.4">US</text></g>
          <g class="bp-network-node" transform="translate(380 77)"><circle r="13"/><text text-anchor="middle" dy="2.4">UK</text></g>
        </svg>
        <span class="bp-network-label us"><i></i>US accounting firms</span>
        <span class="bp-network-label uk"><i></i>UK practices</span>
        <span class="bp-network-label india"><i></i>India delivery hub</span>
      </div>`;
    audienceProof.parentNode.insertBefore(visual, audienceProof);
    visual.appendChild(audienceProof);
  }

  const founderShell = document.querySelector('.founder-photo-shell');
  const founderPhoto = founderShell?.querySelector('.founder-photo-frame img');
  if (founderPhoto) {
    founderPhoto.src = 'assets/founder-original-attached.jpg?v=20260807-authentic-r4';
    founderPhoto.loading = 'eager';
    founderPhoto.decoding = 'async';
    founderPhoto.addEventListener('error', () => {
      if (!founderPhoto.dataset.fallbackUsed) {
        founderPhoto.dataset.fallbackUsed = 'true';
        founderPhoto.src = '../assets/ca-siddharth-bhatia-final-r16.jpg?v=20260807-fallback';
      }
    }, { once: true });
  }
  if (founderShell && !founderShell.querySelector('.bp-founder-ca')) {
    const ca = document.createElement('a');
    ca.className = 'bp-founder-ca';
    ca.href = ICAI_LOGO_INFO;
    ca.target = '_blank';
    ca.rel = 'noopener noreferrer';
    ca.setAttribute('aria-label', 'Chartered Accountant India credential');
    ca.innerHTML = `<img src="${CA_LOGO}" alt="CA India logo" width="52" height="39"><div><span>Professional qualification</span><strong>Chartered Accountant · ICAI 438248</strong></div>`;
    founderShell.appendChild(ca);
  }

  const credentialShowcase = document.querySelector('.credential-section .credential-showcase');
  if (credentialShowcase && !credentialShowcase.querySelector('.bp-credential-grid')) {
    credentialShowcase.innerHTML = `
      <div class="bp-credentials-head">
        <div><p class="eyebrow">Professional credentials</p><h2>Qualified judgement. Verified platform capability.</h2></div>
        <p>BluePeak Verity is founder-led by an Indian Chartered Accountant and supported by a current Xero L1 credential. These credentials complement the operating controls shown throughout the website; they do not imply US CPA or UK chartered-accountancy status.</p>
      </div>
      <div class="bp-credential-grid">
        <article class="bp-credential-card">
          <a class="bp-credential-logo" href="${ICAI_LOGO_INFO}" target="_blank" rel="noopener noreferrer" aria-label="Learn about the CA India logo on ICAI's website">
            <img src="${CA_LOGO}" alt="CA India logo" width="100" height="74">
          </a>
          <div class="bp-credential-copy">
            <small>Professional qualification</small>
            <h3>Chartered Accountant · India</h3>
            <p>CA Siddharth Bhatia · ICAI Membership No. 438248. Professional judgement and review discipline are built into the delivery model.</p>
            <div class="bp-credential-meta"><span>ICAI member</span><span>Founder-led delivery</span><span>India-based</span></div>
            <a class="bp-credential-link" href="about.html">View professional profile ↗</a>
          </div>
        </article>
        <article class="bp-credential-card">
          <div class="bp-credential-logo xero" aria-hidden="true"><div><span>xero</span><strong>L1</strong></div></div>
          <div class="bp-credential-copy">
            <small>Platform credential</small>
            <h3>Xero L1 Certified Associate</h3>
            <p>Earned by Siddharth Bhatia on 6 August 2026. Score 93 · Completion ID 16789646.</p>
            <div class="bp-credential-meta"><span>Credential earned</span><span>Cloud accounting</span><span>Xero workflows</span></div>
            <a class="bp-credential-link" href="xero-certified.html">View credential details ↗</a>
          </div>
        </article>
      </div>
    `;
  }

  const credentialHero = document.querySelector('.credential-page-hero .container');
  if (credentialHero && !credentialHero.querySelector('.bp-cert-ribbon')) {
    credentialHero.insertAdjacentHTML('beforeend', `
      <a class="bp-cert-ribbon" href="${ICAI_LOGO_INFO}" target="_blank" rel="noopener noreferrer">
        <span class="bp-cert-logo"><img src="${CA_LOGO}" alt="CA India logo" width="60" height="44"></span>
        <span><span>Also professionally qualified</span><strong>Chartered Accountant · India</strong><small>ICAI Membership No. 438248</small></span>
      </a>`);
  }

  document.querySelectorAll('.tech-card').forEach((card, index) => {
    card.style.setProperty('--bp-card-index', index);
  });
})();
