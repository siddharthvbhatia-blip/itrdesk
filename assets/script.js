(function(){
  'use strict';

  function classifyItrProfile(residency,incomeRange,selectedFlags){
    const flags=new Set(selectedFlags||[]);
    const over50=incomeRange==='above50';
    if(flags.has('business')){
      if(flags.has('presumptive')&&residency==='resident'&&!over50&&!flags.has('capital')&&!flags.has('foreign')&&!flags.has('director')&&!flags.has('complex'))return {form:'ITR-4',title:'ITR-4 may be a starting point',reason:'You selected an eligible presumptive-income route and no exclusion in this short questionnaire.',guide:'business-profession-itr.html'};
      return {form:'ITR-3',title:'ITR-3 may be a starting point',reason:'Business, profession, F&O or intraday income generally moves an individual outside ITR-1 and ITR-2. Presumptive eligibility and exclusions still require confirmation.',guide:'business-profession-itr.html'};
    }
    if(residency!=='resident'||over50||flags.has('capital')||flags.has('foreign')||flags.has('director')||flags.has('complex'))return {form:'ITR-2',title:'ITR-2 may be a starting point',reason:'One or more selected conditions usually moves a non-business individual outside ITR-1.',guide:flags.has('capital')?'capital-gain-itr-filing.html':(residency!=='resident'||flags.has('foreign')?'nri-itr-filing.html':'which-itr-form-ay-2026-27.html')};
    return {form:'ITR-1',title:'ITR-1 may be a starting point',reason:'Your answers indicate a relatively simple non-business profile, subject to every ITR-1 eligibility condition.',guide:'salary-itr-filing.html'};
  }
  if(typeof document==='undefined'){
    if(typeof module!=='undefined')module.exports={classifyItrProfile};
    return;
  }

  const navToggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('#site-nav');
  if(navToggle&&nav){
    navToggle.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded',String(open));
    });
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
    }));
  }

  const phone='917879857126';
  const waUrl=message=>`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();

  function track(name,details){
    const payload=Object.assign({page:location.pathname},details||{});
    window.dispatchEvent(new CustomEvent('itrdesk:interaction',{detail:{name,...payload}}));
    if(typeof window.gtag==='function')window.gtag('event',name,payload);
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-track]');
    if(target)track(target.dataset.track,{label:clean(target.textContent).slice(0,80)});
  });
  window.ITRDeskTrack=track;

  document.querySelectorAll('[data-wa]').forEach(element=>{
    element.addEventListener('click',()=>{
      const message=element.getAttribute('data-wa')||'Hi, I reviewed an ITR Desk resource and would like the relevant checklist.';
      window.open(waUrl(message),'_blank','noopener');
    });
  });

  const enquiryForm=document.querySelector('#itrForm');
  if(enquiryForm){
    enquiryForm.addEventListener('submit',event=>{
      event.preventDefault();
      const data=new FormData(enquiryForm);
      const details=data.getAll('details').join(', ')||'Not specified';
      const source=`${document.title}\n${location.href.split('#')[0]}`;
      const message=`Hi, I independently reviewed an ITR Desk resource and would like the relevant checklist and scope information.\n\nName: ${clean(data.get('name'))}\nMobile: ${clean(data.get('phone'))}\nEmail: ${clean(data.get('email'))||'Not provided'}\nCity: ${clean(data.get('city'))||'Not provided'}\nBroad case: ${clean(data.get('caseType'))}\nConditions: ${details}\nNote: ${clean(data.get('note'))||'None'}\n\nSource: ${source}\n\nI have not included passwords or OTPs.`;
      track('enquiry_whatsapp_open',{case_type:clean(data.get('caseType'))});
      window.open(waUrl(message),'_blank','noopener');
    });
  }

  const copyButton=document.querySelector('[data-copy-link]');
  if(copyButton){
    copyButton.addEventListener('click',async()=>{
      const original=copyButton.textContent;
      try{await navigator.clipboard.writeText(location.href.split('#')[0]);copyButton.textContent='Link copied';track('copy_link');}
      catch(_){copyButton.textContent='Copy from the address bar';}
      setTimeout(()=>{copyButton.textContent=original;},1800);
    });
  }

  document.querySelectorAll('[data-share]').forEach(button=>{
    button.addEventListener('click',async()=>{
      const original=button.textContent;
      const url=location.href.split('#')[0];
      const shareText=button.getAttribute('data-share-text')||'A practical income-tax resource from ITR Desk by CA Siddharth Bhatia.';
      try{
        if(navigator.share){await navigator.share({title:document.title,text:shareText,url});track('native_share');return;}
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        button.textContent='Link copied to share';track('copy_share');
      }catch(error){if(error&&error.name==='AbortError')return;button.textContent='Copy the address-bar link';}
      setTimeout(()=>{button.textContent=original;},2200);
    });
  });

  document.querySelectorAll('[data-language]').forEach(button=>{
    button.addEventListener('click',()=>{
      const language=button.dataset.language;
      document.querySelectorAll('[data-language-panel]').forEach(panel=>{panel.hidden=panel.dataset.languagePanel!==language;});
      document.querySelectorAll('[data-language]').forEach(item=>{
        const active=item.dataset.language===language;
        item.classList.toggle('active',active);
        item.setAttribute('aria-pressed',String(active));
      });
      track('summary_language',{language});
    });
  });

  const finder=document.querySelector('#formFinder');
  if(finder){
    const business=finder.querySelector('input[value="business"]');
    const presumptive=finder.querySelector('input[value="presumptive"]');
    if(business&&presumptive){
      const sync=()=>{if(!business.checked)presumptive.checked=false;presumptive.disabled=!business.checked;};
      business.addEventListener('change',sync);sync();
    }
    finder.addEventListener('submit',event=>{
      event.preventDefault();
      const data=new FormData(finder);
      const residency=data.get('residency');
      const {form,title,reason,guide}=classifyItrProfile(residency,data.get('incomeRange'),data.getAll('flags'));
      const result=document.querySelector('#formFinderResult');
      result.innerHTML=`<span class="result-kicker">Starting indication</span><h3>${title}</h3><p>${reason}</p><div class="finder-actions"><a class="btn secondary small" href="${guide}">Read the relevant guide</a><a class="btn ghost small" href="checklist.html">Open checklist</a></div><small>This is not final form selection. Check the notified eligibility, return utility and your complete facts before filing.</small>`;
      result.hidden=false;
      result.scrollIntoView({behavior:'smooth',block:'nearest'});
      track('form_finder_result',{result:form});
    });
  }

  document.querySelectorAll('[data-feedback]').forEach(card=>{
    const message=card.querySelector('.feedback-message');
    card.querySelectorAll('[data-feedback-value]').forEach(button=>button.addEventListener('click',()=>{
      const value=button.dataset.feedbackValue;
      try{localStorage.setItem(`itrdesk-feedback:${location.pathname}`,value);}catch(_){}
      card.querySelectorAll('[data-feedback-value]').forEach(item=>item.disabled=true);
      message.textContent=value==='yes'?'Thank you. This private response helps us keep the page useful.':'Thank you. Please use the enquiry route only if you want to identify what was missing.';
      track('page_feedback',{value});
    }));
  });

  if(!document.querySelector('.mobile-dock')){
    const dock=document.createElement('nav');
    dock.className='mobile-dock';
    dock.setAttribute('aria-label','Mobile quick actions');
    dock.innerHTML='<a href="calculator.html"><span>₹</span>Tax</a><a href="index.html#form-finder"><span>?</span>ITR form</a><a href="checklist.html"><span>✓</span>Checklist</a><a href="index.html#enquiry"><span>↗</span>Enquiry</a>';
    document.body.appendChild(dock);
  }
})();
