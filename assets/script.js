(function(){
  'use strict';

  const PHONE='917879857126';
  const ENQUIRY_API='https://itrdesk-payment-backend.vercel.app';
  const LINKEDIN_URL='https://www.linkedin.com/in/ca-siddharth-bhatia';
  const GOOGLE_PROFILE_URL='https://www.google.com/search?q=Siddharth+Bhatia+and+Co+Indore';
  const PROFILE_IMAGE='assets/ca-siddharth-bhatia-final-r16.jpg?v=20260717-r16';
  const waUrl=message=>`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();

  function track(name,details){
    const payload=Object.assign({page:location.pathname},details||{});
    window.dispatchEvent(new CustomEvent('itrdesk:interaction',{detail:{name,...payload}}));
    if(typeof window.gtag==='function')window.gtag('event',name,payload);
  }
  window.ITRDeskTrack=track;

  function loadPhaseOneStyles(){
    if(document.querySelector('link[href^="assets/phase1.css"]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='assets/phase1.css?v=20260717-r16';
    document.head.appendChild(link);
  }

  function currentFile(){return location.pathname.split('/').pop()||'index.html'}

  function buildNavigation(){
    const nav=document.querySelector('#site-nav');
    if(!nav)return;
    const items=[
      ['index.html','Home'],
      ['calculator.html','Tax Calculator'],
      ['itr-preparation-json.html','ITR Review Draft'],
      ['index.html#guides','Guides'],
      ['about-ca-siddharth-bhatia.html','About'],
      ['contact.html','Contact']
    ];
    const file=currentFile();
    nav.innerHTML=items.map(([href,label])=>{
      const itemFile=href.split('#')[0];
      const current=(file===itemFile)||(file===''&&itemFile==='index.html');
      return `<a href="${href}"${current?' aria-current="page"':''}>${label}</a>`;
    }).join('');
  }

  function configureMobileNav(){
    let dock=document.querySelector('.mobile-dock');
    if(!dock){dock=document.createElement('nav');dock.className='mobile-dock';dock.setAttribute('aria-label','Mobile quick actions');document.body.appendChild(dock)}
    dock.innerHTML='<a href="calculator.html"><span>₹</span>Tax</a><a href="itr-preparation-json.html"><span>✓</span>Review</a><a href="checklist.html"><span>☑</span>Checklist</a><a href="contact.html"><span>↗</span>Contact</a>';
  }

  function removeHindiClaim(){
    document.querySelectorAll('.language-strip').forEach(section=>section.remove());
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script=>{
      try{
        const data=JSON.parse(script.textContent);
        const visit=value=>{
          if(Array.isArray(value)){value.forEach(visit);return}
          if(!value||typeof value!=='object')return;
          if(Object.prototype.hasOwnProperty.call(value,'availableLanguage'))value.availableLanguage=['English'];
          if(Object.prototype.hasOwnProperty.call(value,'inLanguage'))value.inLanguage='en-IN';
          if(value['@type']==='ProfessionalService'||value['@type']==='Person')value.sameAs=Array.from(new Set([...(Array.isArray(value.sameAs)?value.sameAs:[]),LINKEDIN_URL,GOOGLE_PROFILE_URL]));
          Object.values(value).forEach(visit);
        };
        visit(data);script.textContent=JSON.stringify(data);
      }catch(_){ }
    });
  }

  function renameReviewDraft(){
    document.querySelectorAll('.site-nav a[href*="itr-preparation-json"],.mobile-dock a[href*="itr-preparation-json"]').forEach(link=>{
      if(link.closest('.mobile-dock'))link.innerHTML='<span>✓</span>Review';else link.textContent='ITR Review Draft';
    });
    if(currentFile()==='itr-preparation-json.html'){
      document.title='ITR Review Draft AY 2026-27 | ITR Desk';
      const description=document.querySelector('meta[name="description"]');
      if(description)description.content='Organise AY 2026-27 income, taxes and document checks into a structured ITR review draft for professional review without sharing an income-tax password or OTP.';
      const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content='ITR Review Draft AY 2026-27 | ITR Desk';
      const application=document.querySelector('script[type="application/ld+json"]');
      if(application){try{const value=JSON.parse(application.textContent);if(value.name)value.name='ITR Review Draft AY 2026-27';application.textContent=JSON.stringify(value)}catch(_){}}
      document.querySelectorAll('h2').forEach(h=>{if(h.textContent.includes('Callback and paid JSON draft'))h.textContent='7. Callback and paid review draft'});
      const pay=document.querySelector('#payForJsonDraft');if(pay&&pay.textContent.includes('JSON'))pay.textContent='Pay securely and unlock review draft';
      const download=document.querySelector('#downloadJsonDraft');if(download)download.textContent='Download ITR review draft';
    }
  }

  function simplifyHome(){
    if(currentFile()!=='index.html'&&currentFile()!=='')return;
    const heroActions=document.querySelector('.hero-actions');
    if(heroActions){
      heroActions.innerHTML='<a class="btn primary" href="calculator.html" data-track="hero_calculator">Check my tax</a><a class="btn secondary" href="#enquiry" data-track="hero_enquiry">Request professional assistance</a>';
    }
    const decision=document.querySelector('.decision-card .quick-links');
    if(decision){
      decision.innerHTML='<a href="calculator.html"><strong>Calculate and compare tax</strong><span>Estimate the old and new regime position with special-rate income.</span></a><a href="itr-preparation-json.html"><strong>Prepare an ITR review draft</strong><span>Organise confirmed figures for professional review; this is not a portal-upload JSON.</span></a><a href="checklist.html"><strong>Get the right document checklist</strong><span>Prepare records before requesting professional assistance.</span></a>';
    }
    const decisionHeading=document.querySelector('.decision-card h2');if(decisionHeading)decisionHeading.textContent='Choose one starting point';
    const status=document.querySelector('.decision-card .status-chip');if(status)status.textContent='Simple, guided starting points';
  }

  function updateProfileImages(){
    document.querySelectorAll('.professional-portrait img,.profile-hero-photo img,.sidebar-portrait').forEach(image=>{
      image.src=PROFILE_IMAGE;
      image.width=180;image.height=180;
      image.alt='CA Siddharth Bhatia in professional attire';
    });
  }

  function professionalVerificationPanel(){
    const cards=document.querySelectorAll('.professional-card,.profile-sidebar');
    cards.forEach(card=>{
      if(card.querySelector('.professional-verification'))return;
      const panel=document.createElement('section');
      panel.className='professional-verification';
      panel.setAttribute('aria-label','Professional verification and public profiles');
      panel.innerHTML='<p class="eyebrow">Professional verification</p><h3>CA Siddharth Bhatia</h3><dl><div><dt>Designation</dt><dd>Chartered Accountant</dd></div><div><dt>ICAI Membership</dt><dd>438248</dd></div><div><dt>Location</dt><dd>Indore, Madhya Pradesh</dd></div></dl><div class="verification-links"><a href="'+LINKEDIN_URL+'" target="_blank" rel="noopener noreferrer">LinkedIn profile ↗</a><a href="'+GOOGLE_PROFILE_URL+'" target="_blank" rel="noopener noreferrer">Google business profile ↗</a></div><p class="micro-note">External profile links are provided for independent professional identification and do not imply endorsement by ICAI, LinkedIn or Google.</p>';
      if(card.classList.contains('professional-card')){
        const existing=card.querySelector('.docs-panel');
        if(existing)existing.replaceWith(panel);else card.appendChild(panel);
      }else{
        const heading=card.querySelector('h2');
        if(heading)card.insertBefore(panel,heading);else card.appendChild(panel);
      }
    });
  }

  function fixFeedbackCopy(){
    document.querySelectorAll('[data-feedback]').forEach(card=>{
      const copy=card.querySelector('div>p:not(.eyebrow)');
      if(copy)copy.textContent='Your preference is saved only on this device. It is not transmitted to ITR Desk or displayed publicly.';
    });
  }

  function setupMenu(){
    const navToggle=document.querySelector('.nav-toggle');
    const nav=document.querySelector('#site-nav');
    if(!navToggle||!nav)return;
    const close=()=>{nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false')};
    navToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',String(open))});
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){close();navToggle.focus()}});
  }

  async function postEnquiry(payload){
    const response=await fetch(ENQUIRY_API+'/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await response.json().catch(()=>({error:'Unexpected server response.'}));
    if(!response.ok)throw new Error(data.error||'The enquiry could not be submitted.');
    return data;
  }

  function setupSecureEnquiry(){
    const form=document.querySelector('#itrForm');
    if(!form)return;
    if(!form.querySelector('[name="website"]')){
      const trap=document.createElement('label');trap.className='form-trap';trap.setAttribute('aria-hidden','true');trap.innerHTML='Website<input type="text" name="website" tabindex="-1" autocomplete="off" />';form.prepend(trap);
    }
    let status=form.querySelector('#enquiryStatus');
    if(!status){status=document.createElement('div');status.id='enquiryStatus';status.className='enquiry-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.appendChild(status)}
    let fallback=form.querySelector('#enquiryFallback');
    if(!fallback){fallback=document.createElement('a');fallback.id='enquiryFallback';fallback.className='btn ghost enquiry-fallback';fallback.hidden=true;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='Use WhatsApp instead';form.appendChild(fallback)}
    const button=form.querySelector('button[type="submit"]');
    if(button)button.textContent='Submit secure enquiry';
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const data=new FormData(form);
      const details=data.getAll('details').map(clean);
      const payload={
        name:clean(data.get('name')),
        mobile:clean(data.get('phone')),
        email:clean(data.get('email')),
        city:clean(data.get('city')),
        caseType:clean(data.get('caseType')),
        details,
        note:clean(data.get('note')),
        consent:Boolean(data.get('consent')),
        website:clean(data.get('website')),
        source:`${document.title}\n${location.href.split('#')[0]}`
      };
      const message=`Hi, I submitted an enquiry on ITR Desk.\n\nName: ${payload.name}\nMobile: ${payload.mobile}\nBroad case: ${payload.caseType}\nConditions: ${details.join(', ')||'Not specified'}\n\nI have not included passwords or OTPs.`;
      fallback.href=waUrl(message);
      fallback.hidden=true;
      status.className='enquiry-status';status.textContent='Submitting securely…';
      const original=button?button.textContent:'';if(button){button.disabled=true;button.textContent='Submitting…'}
      try{
        const result=await postEnquiry(payload);
        status.className='enquiry-status success';
        status.textContent='Enquiry submitted successfully. Reference: '+result.reference+'. You do not need to send a WhatsApp message.';
        track('secure_enquiry_submitted',{case_type:payload.caseType});
        form.reset();
      }catch(error){
        status.className='enquiry-status error';status.textContent=error.message+' Your information has not been lost from this page; you may use the WhatsApp fallback.';
        fallback.hidden=false;track('secure_enquiry_failed',{case_type:payload.caseType});
      }finally{if(button){button.disabled=false;button.textContent=original||'Submit secure enquiry'}}
    });
  }

  function classifyItrProfile(residency,incomeRange,selectedFlags){
    const flags=new Set(selectedFlags||[]),over50=incomeRange==='above50';
    if(flags.has('business')){
      if(flags.has('presumptive')&&residency==='resident'&&!over50&&!flags.has('capital')&&!flags.has('foreign')&&!flags.has('director')&&!flags.has('complex'))return {form:'ITR-4',title:'ITR-4 may be a starting point',reason:'You selected an eligible presumptive-income route and no exclusion in this short questionnaire.',guide:'business-profession-itr.html'};
      return {form:'ITR-3',title:'ITR-3 may be a starting point',reason:'Business, profession, F&O or intraday income generally moves an individual outside ITR-1 and ITR-2. Presumptive eligibility and exclusions still require confirmation.',guide:'business-profession-itr.html'};
    }
    if(residency!=='resident'||over50||flags.has('capital')||flags.has('foreign')||flags.has('director')||flags.has('complex'))return {form:'ITR-2',title:'ITR-2 may be a starting point',reason:'One or more selected conditions usually moves a non-business individual outside ITR-1.',guide:flags.has('capital')?'capital-gain-itr-filing.html':(residency!=='resident'||flags.has('foreign')?'nri-itr-filing.html':'which-itr-form-ay-2026-27.html')};
    return {form:'ITR-1',title:'ITR-1 may be a starting point',reason:'Your answers indicate a relatively simple non-business profile, subject to every ITR-1 eligibility condition.',guide:'salary-itr-filing.html'};
  }

  function setupExistingInteractions(){
    document.addEventListener('click',event=>{const target=event.target.closest('[data-track]');if(target)track(target.dataset.track,{label:clean(target.textContent).slice(0,80)})});
    document.querySelectorAll('[data-wa]').forEach(element=>element.addEventListener('click',()=>window.open(waUrl(element.getAttribute('data-wa')||'Hi, I reviewed an ITR Desk resource and would like the relevant checklist.'),'_blank','noopener')));

    const callbackForm=document.querySelector('#calculationCallbackForm');
    if(callbackForm){callbackForm.addEventListener('submit',event=>{event.preventDefault();const status=callbackForm.querySelector('.callback-status'),data=new FormData(callbackForm),name=clean(data.get('callbackName')),mobile=clean(data.get('callbackMobile')).replace(/[\s-]/g,'');if(name.length<2){status.textContent='Please enter your name.';status.className='callback-status error';return}if(!/^(?:\+91)?[6-9][0-9]{9}$/.test(mobile)){status.textContent='Please enter a valid Indian mobile number.';status.className='callback-status error';return}if(!data.get('callbackConsent')){status.textContent='Please confirm that you choose to send the callback request.';status.className='callback-status error';return}const message=`Hi, I used the ITR Desk AY 2026-27 calculator and request one callback about my calculation.\n\nName: ${name}\nMobile: ${mobile}\nSource: ${location.href.split('#')[0]}\n\nI have not included a password or OTP.`;status.textContent='Your WhatsApp request is ready. Send it there to complete the request.';status.className='callback-status';track('calculation_callback_open');window.open(waUrl(message),'_blank','noopener')})}

    const prepareJsonButton=document.querySelector('#prepareJsonFromCalculation');
    if(prepareJsonButton){prepareJsonButton.textContent='Continue to ITR review draft';prepareJsonButton.addEventListener('click',()=>{try{if(!window.ITRDeskCalculator||!window.ITRDeskCalculator.recalculate())throw new Error('Please correct the calculator inputs first.');const computation=window.ITRDeskCalculator.getComputation();if(!computation||(!computation.newRegime.totalIncome&&!computation.oldRegime.totalIncome))throw new Error('Please enter income and calculate before continuing.');sessionStorage.setItem('itrdesk:linked-calculation',JSON.stringify({savedAt:new Date().toISOString(),computation}));track('prepare_review_draft_from_calculator');location.href='itr-preparation-json.html?from=calculator'}catch(error){const status=document.querySelector('#calculationCallbackForm .callback-status');if(status){status.textContent=error.message;status.className='callback-status error';status.scrollIntoView({behavior:'smooth',block:'center'})}}})}

    const copyButton=document.querySelector('[data-copy-link]');
    if(copyButton){copyButton.addEventListener('click',async()=>{const original=copyButton.textContent;try{await navigator.clipboard.writeText(location.href.split('#')[0]);copyButton.textContent='Link copied';track('copy_link')}catch(_){copyButton.textContent='Copy from the address bar'}setTimeout(()=>{copyButton.textContent=original},1800)})}

    document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',async()=>{const original=button.textContent,url=location.href.split('#')[0],shareText=button.getAttribute('data-share-text')||'A practical income-tax resource from ITR Desk by CA Siddharth Bhatia.';try{if(navigator.share){await navigator.share({title:document.title,text:shareText,url});track('native_share');return}await navigator.clipboard.writeText(`${shareText}\n${url}`);button.textContent='Link copied to share';track('copy_share')}catch(error){if(error&&error.name==='AbortError')return;button.textContent='Copy the address-bar link'}setTimeout(()=>{button.textContent=original},2200)}));

    const finder=document.querySelector('#formFinder');
    if(finder){const business=finder.querySelector('input[value="business"]'),presumptive=finder.querySelector('input[value="presumptive"]');if(business&&presumptive){const sync=()=>{if(!business.checked)presumptive.checked=false;presumptive.disabled=!business.checked};business.addEventListener('change',sync);sync()}finder.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(finder),{form,title,reason,guide}=classifyItrProfile(data.get('residency'),data.get('incomeRange'),data.getAll('flags')),result=document.querySelector('#formFinderResult');result.innerHTML=`<span class="result-kicker">Starting indication</span><h3>${title}</h3><p>${reason}</p><div class="finder-actions"><a class="btn secondary small" href="${guide}">Read the relevant guide</a><a class="btn ghost small" href="checklist.html">Open checklist</a></div><small>This is not final form selection. Check the notified eligibility, return utility and your complete facts before filing.</small>`;result.hidden=false;result.scrollIntoView({behavior:'smooth',block:'nearest'});track('form_finder_result',{result:form})})}

    document.querySelectorAll('[data-feedback]').forEach(card=>{const message=card.querySelector('.feedback-message');card.querySelectorAll('[data-feedback-value]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.feedbackValue;try{localStorage.setItem(`itrdesk-feedback:${location.pathname}`,value)}catch(_){}card.querySelectorAll('[data-feedback-value]').forEach(item=>item.disabled=true);message.textContent=value==='yes'?'Saved on this device. Thank you.':'Saved on this device. You can use Contact if you wish to tell us what was missing.';track('local_page_feedback',{value})}))});
  }

  loadPhaseOneStyles();
  buildNavigation();
  configureMobileNav();
  removeHindiClaim();
  renameReviewDraft();
  simplifyHome();
  updateProfileImages();
  professionalVerificationPanel();
  fixFeedbackCopy();
  setupMenu();
  setupSecureEnquiry();
  setupExistingInteractions();

  if(typeof module!=='undefined')module.exports={classifyItrProfile};
})();

/* VERIFIED PROFILE PHOTO FALLBACK */
(() => {
  const initialiseProfilePhotos = () => {
    document.querySelectorAll('img[data-profile-photo],.professional-portrait img,.profile-hero-photo img,.sidebar-portrait').forEach((image) => {
      const remote = 'https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-final-r16.jpg?v=20260717-r16';
      let fallbackUsed = false;
      const useFallback = () => {
        if (fallbackUsed) return;
        fallbackUsed = true;
        image.src = remote;
      };
      image.addEventListener('error', useFallback, {once:true});
      image.addEventListener('load', () => {
        if (image.naturalWidth < 150 || image.naturalHeight < 150) useFallback();
        else image.dataset.profilePhotoLoaded = 'true';
      });
      window.setTimeout(() => {
        if (!image.complete || image.naturalWidth < 150 || image.naturalHeight < 150) useFallback();
      }, 1600);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseProfilePhotos);
  else initialiseProfilePhotos();
})();

/* GLOBAL CA FAVICON — R25 */
(() => {
  const applyCaFavicon = () => {
    let icon = document.querySelector('link[rel~="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = 'image/svg+xml';
    icon.href = 'assets/favicon-ca-r23.svg?v=20260721-r25';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyCaFavicon, {once:true});
  else applyCaFavicon();
})();
