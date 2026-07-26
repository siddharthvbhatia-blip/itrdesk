(function(){
  'use strict';

  const VERSION='20260727-r34';
  const fileName=()=>location.pathname.split('/').pop()||'index.html';
  const moneyValue=text=>{
    const cleaned=String(text||'').replace(/,/g,'').replace(/[^0-9.-]/g,'');
    const number=Number(cleaned);
    return Number.isFinite(number)?number:0;
  };
  const formatInr=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.max(0,Number(value)||0));

  function addHeroLineArt(){
    const hero=document.querySelector('.clean-hero');
    if(!hero||hero.querySelector('.professional-line-art'))return;
    const art=document.createElement('div');
    art.className='professional-line-art';
    art.setAttribute('aria-hidden','true');
    art.innerHTML='<span class="line-doc">AIS</span><span class="line-doc">26AS</span><span class="line-calculator">₹</span><span class="line-check">✓</span>';
    hero.prepend(art);
  }

  function buildHeroJourney(){
    if(fileName()!=='index.html')return;
    const card=document.querySelector('.clean-profile-card');
    if(!card||card.dataset.experienceReady==='true')return;
    card.dataset.experienceReady='true';
    card.classList.add('experience-hero-card');
    card.innerHTML=`
      <div class="journey-card-head">
        <span class="journey-kicker">Structured review journey</span>
        <strong>Records to reviewed draft</strong>
        <small>Illustrative workflow — each case is assessed on its facts.</small>
      </div>
      <div class="itr-journey" aria-label="Illustrative ITR review workflow">
        <div class="journey-documents" aria-hidden="true">
          <span>AIS</span><span>TIS</span><span>26AS</span><span>CG</span>
        </div>
        <div class="journey-track" aria-hidden="true"><i></i></div>
        <ol class="journey-steps">
          <li><span>1</span><strong>Review</strong><small>Read records</small></li>
          <li><span>2</span><strong>Reconcile</strong><small>Check differences</small></li>
          <li><span>3</span><strong>Compute</strong><small>Compare tax</small></li>
          <li><span>4</span><strong>Confirm</strong><small>Review draft</small></li>
          <li><span>5</span><strong>Complete</strong><small>Retain acknowledgement</small></li>
        </ol>
      </div>
      <div class="hero-identity-mini">
        <img data-profile-photo src="assets/ca-siddharth-bhatia-final-r16.jpg?v=${VERSION}" alt="CA Siddharth Bhatia in professional attire" width="72" height="72" />
        <div><strong>CA Siddharth Bhatia</strong><span>Chartered Accountant · ICAI M. No. 438248</span><small>Indore office and suitable online assignments</small></div>
      </div>
      <div class="hero-card-actions">
        <a href="about-ca-siddharth-bhatia.html">Professional profile <span aria-hidden="true">→</span></a>
        <a href="ca-siddharth-bhatia.vcf" download>Save contact <span aria-hidden="true">↓</span></a>
      </div>`;
  }

  const CASES={
    'Salary / Form 16':{
      eyebrow:'Salary and pension',
      title:'A focused path for Form 16 and routine income records.',
      description:'Start with Form 16, AIS/TIS, Form 26AS, bank interest and eligible deduction records. The applicable ITR form is confirmed only after checking all conditions.',
      items:['Form 16 and salary reconciliation','Bank interest and deduction checks','AIS/TIS/26AS difference review','Old-versus-new regime comparison'],
      guide:'salary-itr-filing.html'
    },
    'Salary + Capital Gains':{
      eyebrow:'Salary with investments',
      title:'Bring salary and capital-gain records into one review path.',
      description:'Broker and mutual-fund statements require classification, cost and loss-set-off checks. Sale consideration shown in AIS is not treated as gain without review.',
      items:['Broker or mutual-fund statements','STCG/LTCG classification review','AIS sale-value reconciliation','Capital-loss and schedule checks'],
      guide:'capital-gain-itr-filing.html'
    },
    'Business / Profession':{
      eyebrow:'Business, profession and trading',
      title:'Organise books-based, presumptive or F&O information carefully.',
      description:'Turnover, gross receipts and bank credits are not automatically treated as taxable profit. Books, expenses, audit applicability and return-form conditions require review.',
      items:['Turnover and books review','Presumptive or regular computation','F&O/intraday classification checks','Audit and loss-carry-forward flags'],
      guide:'business-profession-itr.html'
    },
    'NRI / Foreign Income':{
      eyebrow:'Residential status and foreign matters',
      title:'Start with status, source and disclosure requirements.',
      description:'Residential status, foreign income, assets, signing authority, DTAA relief and currency conversion are case-specific and should be reviewed before filing.',
      items:['Residential-status assessment','Foreign income and asset schedules','DTAA and foreign-tax-relief checks','NRI/RNOR return-form review'],
      guide:'nri-itr-filing.html'
    }
  };

  function setupCaseExperience(){
    if(fileName()!=='index.html')return;
    const grid=document.querySelector('.case-choice-grid');
    if(!grid||grid.dataset.experienceReady==='true')return;
    grid.dataset.experienceReady='true';
    const cards=Array.from(grid.querySelectorAll('[data-case-choice]'));
    if(!cards.length)return;

    const preview=document.createElement('section');
    preview.id='caseExperiencePreview';
    preview.className='case-experience-preview';
    preview.setAttribute('aria-live','polite');
    preview.innerHTML='<div class="case-preview-copy"><span class="case-preview-eyebrow"></span><h3></h3><p></p></div><ul class="case-preview-list"></ul><div class="case-preview-actions"><a class="btn primary" href="#enquiry">Request case review</a><a class="case-guide-link" href="checklist.html">Open relevant guide →</a></div>';
    grid.insertAdjacentElement('afterend',preview);

    const formSelect=document.querySelector('#itrForm select[name="caseType"]');
    const render=value=>{
      const data=CASES[value]||CASES['Salary / Form 16'];
      cards.forEach(card=>{
        const active=card.dataset.caseChoice===value;
        card.classList.toggle('is-active',active);
        card.setAttribute('aria-pressed',String(active));
      });
      preview.querySelector('.case-preview-eyebrow').textContent=data.eyebrow;
      preview.querySelector('h3').textContent=data.title;
      preview.querySelector('p').textContent=data.description;
      preview.querySelector('.case-preview-list').innerHTML=data.items.map(item=>`<li>${item}</li>`).join('');
      preview.querySelector('.case-guide-link').href=data.guide;
      if(formSelect){
        const option=Array.from(formSelect.options).find(item=>item.value===value||item.textContent.trim()===value);
        if(option)formSelect.value=option.value;
      }
    };

    cards.forEach(card=>{
      card.setAttribute('role','button');
      card.setAttribute('aria-controls',preview.id);
      card.addEventListener('click',event=>{
        event.preventDefault();
        render(card.dataset.caseChoice);
        preview.classList.remove('case-preview-pulse');
        void preview.offsetWidth;
        preview.classList.add('case-preview-pulse');
        if(typeof window.ITRDeskTrack==='function')window.ITRDeskTrack('case_experience_selected',{case_type:card.dataset.caseChoice});
      },true);
    });
    render(cards[0].dataset.caseChoice);
  }

  function addServiceStandards(){
    if(fileName()!=='index.html')return;
    const serviceGrid=document.querySelector('#services .clean-service-grid');
    if(!serviceGrid||document.querySelector('.service-standards'))return;
    const section=document.createElement('section');
    section.className='service-standards conversion-subsection';
    section.innerHTML=`
      <div class="section-heading compact-heading"><p class="eyebrow">Professional service standards</p><h2>A factual, record-based client experience.</h2><p>No fabricated ratings or guaranteed-outcome claims are displayed. Each assignment remains subject to facts, records, applicable law and acceptance of scope.</p></div>
      <div class="service-standard-grid">
        <article><span aria-hidden="true">01</span><h3>Clear scope first</h3><p>Deliverables, records, timeline and fee are discussed before professional work begins.</p></article>
        <article><span aria-hidden="true">02</span><h3>Records before conclusions</h3><p>AIS/TIS/26AS and supporting documents are reconciled rather than relying on assumptions.</p></article>
        <article><span aria-hidden="true">03</span><h3>Draft confirmation</h3><p>Material figures and filing positions are reviewed with the client before completion.</p></article>
      </div>`;
    serviceGrid.insertAdjacentElement('afterend',section);
  }

  function addOfficeTrustSection(){
    if(fileName()!=='index.html')return;
    const enquiry=document.getElementById('enquiry');
    if(!enquiry||document.querySelector('.office-trust-section'))return;
    const section=document.createElement('section');
    section.className='section office-trust-section';
    section.innerHTML=`
      <div class="container office-trust-card">
        <img data-profile-photo src="assets/ca-siddharth-bhatia-final-r16.jpg?v=${VERSION}" alt="CA Siddharth Bhatia in professional attire" width="116" height="116" loading="lazy" />
        <div class="office-trust-copy"><p class="eyebrow">Office and professional identity</p><h2>Speak with CA Siddharth Bhatia.</h2><p>444, Vikram Tower, Sapna Sangeeta Road, Indore – 452001</p><div class="office-facts"><span>ICAI M. No. 438248</span><span>Office visits by coordination</span><span>Online support for suitable cases</span></div></div>
        <div class="office-trust-actions"><a class="btn primary" href="tel:+917879857126">Call office</a><a class="btn secondary" href="https://www.google.com/maps/search/?api=1&query=444%2C+Vikram+Tower%2C+Sapna+Sangeeta+Road%2C+Indore+452001" target="_blank" rel="noopener noreferrer">Open Google Maps</a><a class="office-contact-download" href="ca-siddharth-bhatia.vcf" download>Save digital contact card ↓</a></div>
      </div>`;
    enquiry.insertAdjacentElement('beforebegin',section);
  }

  function addCalculatorComparison(){
    if(fileName()!=='calculator.html')return;
    const summary=document.querySelector('.result-summary');
    const newValue=document.getElementById('newTotalTax');
    const oldValue=document.getElementById('oldTotalTax');
    if(!summary||!newValue||!oldValue||summary.querySelector('.regime-visual-comparison'))return;
    const cards=summary.querySelector('.regime-cards');
    const chart=document.createElement('section');
    chart.className='regime-visual-comparison';
    chart.innerHTML=`
      <div class="comparison-heading"><div><span>Visual regime comparison</span><strong>Indicative liability</strong></div><small>Final applicability depends on verified facts and current law.</small></div>
      <div class="comparison-row" data-regime="new"><span>New regime</span><div class="comparison-track"><i></i></div><strong>₹0</strong></div>
      <div class="comparison-row" data-regime="old"><span>Old regime</span><div class="comparison-track"><i></i></div><strong>₹0</strong></div>
      <p class="comparison-difference">Enter figures and calculate to compare the regimes.</p>`;
    if(cards)cards.insertAdjacentElement('afterend',chart);else summary.appendChild(chart);

    const update=()=>{
      const newTax=moneyValue(newValue.textContent);
      const oldTax=moneyValue(oldValue.textContent);
      const maximum=Math.max(newTax,oldTax,1);
      const rows={new:chart.querySelector('[data-regime="new"]'),old:chart.querySelector('[data-regime="old"]')};
      [['new',newTax],['old',oldTax]].forEach(([key,value])=>{
        const row=rows[key];
        row.querySelector('i').style.transform=`scaleX(${Math.max(0,Math.min(1,value/maximum))})`;
        row.querySelector('strong').textContent=formatInr(value);
        row.classList.remove('is-lower','is-higher');
      });
      const difference=Math.abs(newTax-oldTax);
      const note=chart.querySelector('.comparison-difference');
      if(!newTax&&!oldTax){note.textContent='Enter figures and calculate to compare the regimes.';return;}
      if(newTax===oldTax){rows.new.classList.add('is-lower');rows.old.classList.add('is-lower');note.textContent='The entered figures currently produce the same indicative liability.';return;}
      const lower=newTax<oldTax?'new':'old';
      const higher=lower==='new'?'old':'new';
      rows[lower].classList.add('is-lower');rows[higher].classList.add('is-higher');
      note.textContent=`${lower==='new'?'New':'Old'} regime is lower by ${formatInr(difference)} on the entered figures.`;
    };
    new MutationObserver(update).observe(newValue,{childList:true,characterData:true,subtree:true});
    new MutationObserver(update).observe(oldValue,{childList:true,characterData:true,subtree:true});
    document.getElementById('taxCalculator')?.addEventListener('submit',()=>setTimeout(update,60));
    update();
  }

  function addDocumentScanners(){
    document.querySelectorAll('[data-document-importer]').forEach((importer,index)=>{
      if(importer.dataset.scannerReady==='true')return;
      importer.dataset.scannerReady='true';
      const control=importer.querySelector('.import-file-control');
      const input=importer.querySelector('[data-import-files]');
      if(!control||!input)return;
      const scanner=document.createElement('div');
      scanner.className='document-scan-card';
      scanner.innerHTML=`<div class="scan-document" aria-hidden="true"><span>AIS</span><i></i><b>✓</b></div><div><strong>Local document review assistant</strong><p>Choose supported records. Proposed values must still be checked before they are applied.</p><small data-scan-status>No record selected.</small></div>`;
      control.insertAdjacentElement('beforebegin',scanner);
      const status=scanner.querySelector('[data-scan-status]');
      let timer=0;
      input.addEventListener('change',()=>{
        window.clearTimeout(timer);
        const count=input.files?.length||0;
        scanner.classList.toggle('is-scanning',count>0);
        scanner.classList.remove('is-ready');
        if(!count){status.textContent='No record selected.';return;}
        status.textContent=`Reading ${count} selected record${count===1?'':'s'} locally…`;
        timer=window.setTimeout(()=>{
          scanner.classList.remove('is-scanning');
          scanner.classList.add('is-ready');
          status.textContent='Records selected — review every proposed figure before applying it.';
        },1300);
      });
    });
  }

  function fieldHasMeaning(field){
    if(field.disabled||field.type==='hidden'||field.closest('.legacy-checkout'))return false;
    if(field.type==='checkbox'||field.type==='radio')return field.checked;
    if(field.type==='file')return Boolean(field.files&&field.files.length);
    const value=String(field.value||'').trim();
    if(!value)return false;
    if(field.classList.contains('money-input'))return moneyValue(value)!==0;
    if(field.type==='number')return value!==''&&value!=='0';
    return true;
  }

  function setupItrProgress(){
    if(fileName()!=='itr-preparation-json.html')return;
    const form=document.getElementById('itrJsonForm');
    const side=document.querySelector('.json-side');
    if(!form||!side)return;

    let attempts=0;
    const initialise=()=>{
      const panels=Array.from(form.querySelectorAll(':scope > .json-panel.json-accordion-panel'));
      if(!panels.length&&attempts++<40){setTimeout(initialise,75);return;}
      if(!panels.length||form.dataset.progressReady==='true')return;
      form.dataset.progressReady='true';

      const progress=document.createElement('section');
      progress.className='itr-progress-card';
      progress.innerHTML='<div class="itr-progress-head"><div><span>ITR preparation progress</span><strong data-progress-label>0% organised</strong></div><b data-progress-count>0/6</b></div><div class="itr-progress-track"><i></i></div><ol></ol><small>Progress reflects fields organised in this browser; it does not indicate filing completion or professional verification.</small>';
      side.prepend(progress);
      const list=progress.querySelector('ol');

      panels.forEach((panel,index)=>{
        const toggle=panel.querySelector(':scope > .json-accordion-toggle');
        const title=toggle?.querySelector('.json-accordion-title')?.textContent||`Section ${index+1}`;
        const status=document.createElement('span');
        status.className='json-panel-status';
        status.textContent=index===panels.length-1?'Review options':'Not started';
        toggle?.querySelector('.json-accordion-heading')?.appendChild(status);

        const item=document.createElement('li');
        const button=document.createElement('button');
        button.type='button';
        button.innerHTML=`<span>${index+1}</span><strong>${title.replace(/^\d+\.\s*/, '')}</strong><small>Not started</small>`;
        item.appendChild(button);list.appendChild(item);
        button.addEventListener('click',()=>{
          panels.forEach(candidate=>{
            const candidateToggle=candidate.querySelector(':scope > .json-accordion-toggle');
            const content=candidate.querySelector(':scope > .json-accordion-content');
            const open=candidate===panel;
            candidate.classList.toggle('is-open',open);
            candidateToggle?.setAttribute('aria-expanded',String(open));
            if(content)content.hidden=!open;
          });
          panel.scrollIntoView({behavior:'smooth',block:'start'});
        });
        panel.dataset.progressIndex=String(index);
      });

      const update=()=>{
        let completed=0;
        let weighted=0;
        const countable=Math.max(1,panels.length-1);
        panels.forEach((panel,index)=>{
          const fields=Array.from(panel.querySelectorAll('input,select,textarea')).filter(field=>!field.closest('.legacy-checkout'));
          const required=fields.filter(field=>field.required);
          const hasMeaning=fields.some(fieldHasMeaning);
          const requiredComplete=required.length===0||required.every(field=>field.checkValidity()&&String(field.value||'').trim());
          let state='not-started';
          let label='Not started';
          if(index===panels.length-1){state='review';label='Review options';}
          else if(hasMeaning&&requiredComplete){state='complete';label='Completed';completed+=1;weighted+=1;}
          else if(hasMeaning){state='progress';label='In progress';weighted+=0.5;}
          panel.classList.toggle('is-complete',state==='complete');
          panel.classList.toggle('is-in-progress',state==='progress');
          const status=panel.querySelector('.json-panel-status');
          if(status){status.dataset.state=state;status.textContent=label+(state==='complete'?' ✓':'');}
          const icon=panel.querySelector('.json-accordion-icon');
          if(icon)icon.textContent=state==='complete'?'✓':'▶';
          const item=list.children[index];
          if(item){item.dataset.state=state;item.querySelector('small').textContent=label;}
        });
        const percent=Math.round((weighted/countable)*100);
        progress.querySelector('.itr-progress-track i').style.transform=`scaleX(${Math.max(0,Math.min(1,percent/100))})`;
        progress.querySelector('[data-progress-label]').textContent=`${percent}% organised`;
        progress.querySelector('[data-progress-count]').textContent=`${completed}/${countable}`;
      };
      form.addEventListener('input',update);
      form.addEventListener('change',update);
      new MutationObserver(update).observe(form,{childList:true,subtree:true});
      update();
    };
    initialise();
  }

  function upgradeButtons(){
    document.querySelectorAll('.btn,button[type="submit"],.case-guide-link,.text-link').forEach(button=>button.classList.add('professional-action'));
  }

  function setup(){
    document.documentElement.classList.add('professional-experience-r34');
    addHeroLineArt();
    buildHeroJourney();
    setupCaseExperience();
    addServiceStandards();
    addOfficeTrustSection();
    addCalculatorComparison();
    addDocumentScanners();
    setupItrProgress();
    upgradeButtons();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
