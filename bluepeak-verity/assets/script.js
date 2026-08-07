(() => {
  'use strict';

  if (!document.querySelector('script[data-bp-graphics]')) {
    const graphicsScript = document.createElement('script');
    graphicsScript.src = 'assets/graphics-upgrade.js?v=20260807-r5';
    graphicsScript.defer = true;
    graphicsScript.dataset.bpGraphics = 'true';
    document.head.appendChild(graphicsScript);
  }

  /* Force-load the latest user corrections. */
  if (!document.querySelector('link[data-bp-user-hotfix]')) {
    const hotfix = document.createElement('link');
    hotfix.rel = 'stylesheet';
    hotfix.href = 'assets/user-corrections.css?v=20260807-founder-photo-r4';
    hotfix.dataset.bpUserHotfix = 'true';
    document.head.appendChild(hotfix);
  }

  /* Final portrait + Xero cleanup layer. This deliberately runs after the older correction stack. */
  if (!document.querySelector('script[data-bp-profile-xero-fix]')) {
    const fixScript = document.createElement('script');
    fixScript.src = 'assets/profile-xero-fix.js?v=20260807-founder-xero-r1';
    fixScript.defer = true;
    fixScript.dataset.bpProfileXeroFix = 'true';
    document.head.appendChild(fixScript);
  }

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = $('[data-header]');
  const progressBar = $('.site-progress span');
  const updateScrollState = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
    }
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  const navToggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const setNav = open => {
    if (!nav || !navToggle) return;
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', open);
  };
  navToggle?.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  $$('#site-nav a').forEach(link => link.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setNav(false); });

  const revealItems = $$('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      observer.observe(item);
    });
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  const controlStage = $('[data-control-stage]');
  const controlConsole = $('.control-console', controlStage || document);
  if (controlStage && controlConsole && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    controlStage.addEventListener('pointermove', event => {
      const rect = controlStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      controlConsole.style.transform = `rotateY(${x * 3.4}deg) rotateX(${y * -2.7}deg) translateZ(0)`;
    });
    controlStage.addEventListener('pointerleave', () => { controlConsole.style.transform = ''; });
  }

  const capabilityContent = {
    books:{number:'01 / CONTROLLED RECURRING',title:'Bookkeeping & month-end support',copy:'Structured monthly processing and close support under your chart of accounts, review framework and agreed cut-off.',visual:'LEDGER',points:['Transaction review and coding','Month-end notes and schedules','Review-ready handoff pack'],boundary:'Prepared within the agreed accounting framework and reviewer responsibility.'},
    recon:{number:'02 / RECONCILIATION CONTROL',title:'Bank & card reconciliations',copy:'Statement-to-ledger matching with reconciling differences isolated instead of buried inside the close.',visual:'MATCH',points:['Bank-feed and statement review','Reconciling-difference analysis','Open-item tracking'],boundary:'Unresolved items remain visible for reviewer or client follow-up.'},
    cleanup:{number:'03 / REMEDIATION',title:'Catch-up & cleanup',copy:'Historical books reviewed for duplicated entries, misclassifications, missing evidence and unreconciled balances.',visual:'CLEAN',points:['Backlog processing','Cleanup journals for review','Missing-document tracker'],boundary:'Adjustments are prepared for appropriate review before final acceptance.'},
    reporting:{number:'04 / REPORTING SUPPORT',title:'Financial reporting support',copy:'Supporting schedules and analytical checks designed to make management accounts easier to review and interpret.',visual:'REPORT',points:['P&L and balance-sheet review','Variance and trend checks','Management reporting packs'],boundary:'Reporting format and review responsibility are agreed before recurring delivery.'},
    working:{number:'05 / WORKING CAPITAL',title:'AP, AR & ageing support',copy:'Operational schedules that improve visibility over vendor balances, customer balances, ageing and follow-up priorities.',visual:'AGEING',points:['Vendor and customer review','Ageing schedules','Exception and follow-up lists'],boundary:'Payment or collection authority remains subject to the client’s agreed controls.'},
    workpapers:{number:'06 / PROFESSIONAL WORKPAPERS',title:'Audit & tax data support',copy:'Schedules, reconciliations and source-data packs prepared for consideration by the responsible licensed professional.',visual:'PACK',points:['Lead schedules and evidence indexes','Tax-organiser data support','Reviewer query preparation'],boundary:'No attest opinion, regulated representation or jurisdiction-specific sign-off is implied.'}
  };
  const capTabs = $$('.capability-tab');
  const renderCapability = key => {
    const data = capabilityContent[key];
    if (!data || !$('#cap-number')) return;
    $('#cap-number').textContent = data.number;
    $('#cap-title').textContent = data.title;
    $('#cap-copy').textContent = data.copy;
    $('#cap-visual-label').textContent = data.visual;
    $('#cap-points').innerHTML = data.points.map(point => `<li>${point}</li>`).join('');
    $('#cap-boundary').textContent = data.boundary;
    capTabs.forEach(tab => { const active = tab.dataset.cap === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
  };
  capTabs.forEach(tab => tab.addEventListener('click', () => renderCapability(tab.dataset.cap)));

  const audienceContent = {
    us:{kicker:'US accounting firms',title:'Extend preparation capacity without surrendering reviewer control.',copy:'Recurring bookkeeping, close support, cleanup and organised tax-source workpapers can sit behind your firm’s client relationship and review process.',proof:[['Workflow','QuickBooks Online-oriented'],['Close','Reconciliations & schedules'],['Queries','Consolidated for review'],['Boundary','No US CPA representation']]},
    uk:{kicker:'UK accountancy practices',title:'Add Xero-oriented execution behind your practice workflow.',copy:'Bookkeeping, accounts schedules, reconciliation and VAT source-data support can follow your workpaper format and reviewer sign-off process.',proof:[['Workflow','Xero-oriented'],['Accounts','Ledgers & schedules'],['VAT support','Source-data preparation'],['Boundary','Practice retains statutory responsibility']]},
    business:{kicker:'Growing businesses',title:'Build a stronger finance operating rhythm before hiring a full internal team.',copy:'Monthly reconciliation, reporting, working-capital visibility and organised records can support founders who have outgrown basic bookkeeping.',proof:[['Books','Monthly close routines'],['Reporting','Management visibility'],['Working capital','AP, AR & ageing'],['Handoff','Organised for local advisers']]}
  };
  const audienceTabs = $$('.audience-tab');
  const renderAudience = key => {
    const data = audienceContent[key];
    if (!data || !$('#audience-kicker')) return;
    $('#audience-kicker').textContent = data.kicker;
    $('#audience-title').textContent = data.title;
    $('#audience-copy').textContent = data.copy;
    $('#audience-proof').innerHTML = data.proof.map(item => `<div><span>${item[0]}</span><strong>${item[1]}</strong></div>`).join('');
    audienceTabs.forEach(tab => { const active = tab.dataset.audience === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
  };
  audienceTabs.forEach(tab => tab.addEventListener('click', () => renderAudience(tab.dataset.audience)));

  const processCards = $$('.process-card');
  if ('IntersectionObserver' in window && processCards.length) {
    const processObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) processCards.forEach(card => card.classList.toggle('active', card === entry.target)); });
    }, { threshold: 0.55 });
    processCards.forEach(card => processObserver.observe(card));
  }

  const form = $('#pilot-form');
  if (form) {
    const steps = $$('.form-step', form);
    const progressSteps = $$('.form-progress span', form);
    let currentStep = 1;
    const showStep = next => {
      currentStep = Math.max(1, Math.min(3, next));
      steps.forEach(step => { const active = Number(step.dataset.formStep) === currentStep; step.hidden = !active; step.classList.toggle('active', active); });
      progressSteps.forEach((step, index) => step.classList.toggle('active', index < currentStep));
    };
    const validateStep = stepNumber => {
      const step = $(`.form-step[data-form-step="${stepNumber}"]`, form);
      if (!step) return true;
      if (stepNumber === 1 && !$('input[name="organisation"]:checked', step)) { $('#form-message').textContent = 'Please select the type of organisation.'; return false; }
      if (stepNumber === 2) {
        if (!$$('input[name="support"]:checked', step).length) { $('#form-message').textContent = 'Please select at least one support area.'; return false; }
        const platform = $('select[name="platform"]', step);
        if (!platform.value) { $('#form-message').textContent = 'Please select the accounting platform.'; platform.focus(); return false; }
      }
      $('#form-message').textContent = '';
      return true;
    };
    $$('.form-next', form).forEach(button => button.addEventListener('click', () => { if (validateStep(currentStep)) showStep(currentStep + 1); }));
    $$('.form-back', form).forEach(button => button.addEventListener('click', () => showStep(currentStep - 1)));
    const finalRequired = () => {
      const required = $$('[required]', $('.form-step[data-form-step="3"]', form));
      for (const field of required) { if (!field.checkValidity()) { field.reportValidity(); return false; } }
      return true;
    };
    $('#prepare-enquiry')?.addEventListener('click', () => {
      if (!validateStep(1) || !validateStep(2) || !finalRequired()) return;
      const data = new FormData(form);
      const brief = ['BluePeak Verity — Pilot Enquiry','',`Organisation: ${data.get('organisation') || ''}`,`Support required: ${data.getAll('support').join(', ')}`,`Platform: ${data.get('platform') || ''}`,`Approximate volume: ${data.get('volume') || ''}`,'',`Name: ${data.get('name') || ''}`,`Firm / Company: ${data.get('firm') || ''}`,`Work email: ${data.get('email') || ''}`,`Country / Time zone: ${data.get('country') || ''}`,`Preferred contact method: ${data.get('contact_method') || ''}`,'','Current challenge:',data.get('challenge') || ''].join('\n');
      $('#form-message').textContent = 'Your structured enquiry is ready. Complete sending it in the communication app that opens.';
      if (data.get('contact_method') === 'WhatsApp') window.open(`https://wa.me/917879857126?text=${encodeURIComponent(brief)}`, '_blank', 'noopener,noreferrer');
      else window.location.href = `mailto:siddharth.v.bhatia@gmail.com?subject=${encodeURIComponent('BluePeak Verity — Pilot Enquiry')}&body=${encodeURIComponent(brief)}`;
    });
  }
})();