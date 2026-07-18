(function(){
  'use strict';

  const ENDPOINT='https://itrdesk-payment-backend.vercel.app/api/enquiry';
  const PHONE='917879857126';
  const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();

  function reference(){
    const date=new Date().toISOString().slice(0,10).replace(/-/g,'');
    const random=typeof crypto!=='undefined'&&crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(3)),value=>value.toString(16).padStart(2,'0')).join('').toUpperCase()
      : Math.random().toString(16).slice(2,8).toUpperCase().padEnd(6,'0');
    return `WA-${date}-${random}`;
  }

  function whatsappUrl(payload,ref){
    const message=[
      'Hi, I submitted an enquiry through ITR Desk.', '',
      'Reference: '+ref,
      'Name: '+payload.name,
      'Mobile: '+payload.mobile,
      'Broad case: '+payload.caseType,
      'Short note: '+(payload.note||'Not provided'), '',
      'I have not included PAN, Aadhaar, passwords or OTPs.'
    ].join('\n');
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  }

  async function postOnce(payload){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
        signal:controller.signal
      });
      const data=await response.json().catch(()=>({}));
      if(response.ok&&data.accepted&&data.reference)return data;
      const error=new Error(data.error||'Secure delivery is temporarily unavailable.');
      error.status=response.status;
      throw error;
    }finally{clearTimeout(timer)}
  }

  async function postWithRetry(payload){
    let lastError;
    for(let attempt=1;attempt<=2;attempt+=1){
      try{return await postOnce(payload)}catch(error){
        lastError=error;
        const retryable=!error.status||error.status>=500||error.name==='AbortError';
        if(!retryable||attempt===2)break;
        await wait(850);
      }
    }
    throw lastError||new Error('Secure delivery is temporarily unavailable.');
  }

  function setup(){
    const form=document.querySelector('#itrForm');
    if(!form||form.dataset.reliableEnquiry==='r21')return;
    form.dataset.reliableEnquiry='r21';

    let status=form.querySelector('#enquiryStatus');
    if(!status){status=document.createElement('div');status.id='enquiryStatus';status.className='enquiry-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.appendChild(status)}
    let fallback=form.querySelector('#enquiryFallback');
    if(!fallback){fallback=document.createElement('a');fallback.id='enquiryFallback';fallback.className='btn primary enquiry-fallback';fallback.target='_blank';fallback.rel='noopener';fallback.hidden=true;form.appendChild(fallback)}
    fallback.textContent='Open prepared WhatsApp enquiry';
    const button=form.querySelector('button[type="submit"]');

    form.addEventListener('submit',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(!form.reportValidity())return;

      const data=new FormData(form);
      const payload={
        name:clean(data.get('name')),
        mobile:clean(data.get('phone')),
        email:clean(data.get('email')),
        city:clean(data.get('city')),
        caseType:clean(data.get('caseType')),
        details:data.getAll('details').map(clean).filter(Boolean),
        note:clean(data.get('note')),
        consent:Boolean(data.get('consent')),
        website:clean(data.get('website')),
        source:`${document.title}\n${location.href.split('#')[0]}`
      };

      fallback.hidden=true;
      status.className='enquiry-status';
      status.textContent='Submitting securely…';
      const original=button?button.textContent:'';
      if(button){button.disabled=true;button.textContent='Submitting…'}

      try{
        const result=await postWithRetry(payload);
        status.className='enquiry-status success';
        status.textContent='Enquiry submitted successfully. Reference: '+result.reference+'. You do not need to send a WhatsApp message.';
        form.reset();
      }catch(error){
        const validation=error&&error.status&&error.status<500&&error.status!==429;
        if(validation){
          status.className='enquiry-status error';
          status.textContent=error.message;
        }else{
          const ref=reference();
          fallback.href=whatsappUrl(payload,ref);
          fallback.hidden=false;
          status.className='enquiry-status handoff';
          status.textContent='Opening WhatsApp with your prepared enquiry. Tap Send there to complete it. Reference: '+ref+'.';
          if(!window.ITRDeskDisableAutoWhatsApp){
            setTimeout(()=>location.assign(fallback.href),450);
          }
        }
      }finally{
        if(button){button.disabled=false;button.textContent=original||'Submit secure enquiry'}
      }
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
