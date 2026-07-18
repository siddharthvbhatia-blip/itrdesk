(function(){
  'use strict';

  const ENDPOINT='https://itrdesk-payment-backend.vercel.app/api/enquiry';
  const DIRECT_PROVIDER='https://formsubmit.co/ajax/siddharth.v.bhatia@gmail.com';
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

  function webReference(){
    const date=new Date().toISOString().slice(0,10).replace(/-/g,'');
    const random=typeof crypto!=='undefined'&&crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(3)),value=>value.toString(16).padStart(2,'0')).join('').toUpperCase()
      : Math.random().toString(16).slice(2,8).toUpperCase().padEnd(6,'0');
    return `ENQ-${date}-${random}`;
  }

  async function fetchWithTimeout(url,options){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{return await fetch(url,{...options,signal:controller.signal})}
    finally{clearTimeout(timer)}
  }

  async function postBackendOnce(payload){
    const response=await fetchWithTimeout(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const data=await response.json().catch(()=>({}));
    if(response.ok&&data.accepted&&data.reference)return data;
    const error=new Error(data.error||'Automatic enquiry delivery is temporarily unavailable.');
    error.status=response.status;
    throw error;
  }

  async function postBackendWithRetry(payload){
    let lastError;
    for(let attempt=1;attempt<=2;attempt+=1){
      try{return await postBackendOnce(payload)}catch(error){
        lastError=error;
        const retryable=!error.status||error.status>=500||error.name==='AbortError';
        if(!retryable||attempt===2)break;
        await wait(850);
      }
    }
    throw lastError||new Error('Automatic enquiry delivery is temporarily unavailable.');
  }

  async function postDirectProvider(payload){
    const reference=webReference();
    const response=await fetchWithTimeout(DIRECT_PROVIDER,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        _subject:'[ITR Desk Enquiry] '+payload.caseType+' — '+payload.name,
        _template:'table',
        _captcha:'false',
        _url:location.href.split('#')[0],
        reference,
        name:payload.name,
        mobile:payload.mobile,
        email:payload.email||'Not provided',
        city:payload.city||'Not provided',
        broad_case:payload.caseType,
        conditions:payload.details.length?payload.details.join(', '):'Not specified',
        note:payload.note||'None',
        source:payload.source,
        consent:'Yes — basic enquiry details submitted for checklist and scope discussion.'
      })
    });
    const data=await response.json().catch(()=>({}));
    if(response.ok&&data.success!==false)return {accepted:true,reference,secondary:true};
    const error=new Error('Secondary enquiry delivery is temporarily unavailable.');
    error.status=response.status;
    throw error;
  }

  async function submitReliably(payload){
    try{return await postBackendWithRetry(payload)}
    catch(backendError){
      const validation=backendError&&backendError.status&&backendError.status<500&&backendError.status!==429;
      if(validation)throw backendError;
      try{return await postDirectProvider(payload)}
      catch(directError){
        directError.backendError=backendError;
        throw directError;
      }
    }
  }

  function setup(){
    const form=document.querySelector('#itrForm');
    if(!form||form.dataset.reliableEnquiry==='r19')return;
    form.dataset.reliableEnquiry='r19';

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
        const result=await submitReliably(payload);
        status.className='enquiry-status success';
        status.textContent='Enquiry submitted successfully. Reference: '+result.reference+'. You do not need to send a WhatsApp message.';
        form.reset();
      }catch(error){
        const validation=error&&error.status&&error.status<500&&error.status!==429&&!error.backendError;
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
