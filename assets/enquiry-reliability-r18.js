(function(){
  'use strict';

  const ENDPOINT='https://itrdesk-payment-backend.vercel.app/api/enquiry';
  const PHONE='917879857126';
  const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();

  function whatsappUrl(payload){
    const message=[
      'Hi, I tried to submit an enquiry on ITR Desk.', '',
      'Name: '+payload.name,
      'Mobile: '+payload.mobile,
      'Broad case: '+payload.caseType,
      'Short note: '+(payload.note||'Not provided'), '',
      'I have not included PAN, passwords or OTPs.'
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
      const error=new Error(data.error||'Automatic enquiry delivery is temporarily unavailable.');
      error.status=response.status;
      throw error;
    }finally{clearTimeout(timer)}
  }

  async function submitWithRetry(payload){
    let lastError;
    for(let attempt=1;attempt<=2;attempt+=1){
      try{return await postOnce(payload)}catch(error){
        lastError=error;
        const retryable=!error.status||error.status>=500||error.name==='AbortError';
        if(!retryable||attempt===2)break;
        await wait(850);
      }
    }
    throw lastError||new Error('Automatic enquiry delivery is temporarily unavailable.');
  }

  function setup(){
    const form=document.querySelector('#itrForm');
    if(!form||form.dataset.reliableEnquiry==='true')return;
    form.dataset.reliableEnquiry='true';

    let status=form.querySelector('#enquiryStatus');
    if(!status){status=document.createElement('div');status.id='enquiryStatus';status.className='enquiry-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.appendChild(status)}
    let fallback=form.querySelector('#enquiryFallback');
    if(!fallback){fallback=document.createElement('a');fallback.id='enquiryFallback';fallback.className='btn ghost enquiry-fallback';fallback.target='_blank';fallback.rel='noopener';fallback.textContent='Use WhatsApp instead';fallback.hidden=true;form.appendChild(fallback)}
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
      fallback.href=whatsappUrl(payload);
      status.className='enquiry-status';
      status.textContent='Submitting securely…';
      const original=button?button.textContent:'';
      if(button){button.disabled=true;button.textContent='Submitting…'}

      try{
        const result=await submitWithRetry(payload);
        status.className='enquiry-status success';
        status.textContent='Enquiry submitted successfully. Reference: '+result.reference+'. You do not need to send a WhatsApp message.';
        form.reset();
      }catch(error){
        const validation=error&&error.status&&error.status<500&&error.status!==429;
        status.className='enquiry-status error';
        status.textContent=validation?error.message:'Automatic delivery is temporarily unavailable. Your details remain on this page; use WhatsApp to send the prepared enquiry.';
        fallback.hidden=false;
      }finally{
        if(button){button.disabled=false;button.textContent=original||'Submit secure enquiry'}
      }
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
