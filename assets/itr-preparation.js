(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const form=$('itrJsonForm');
  if(!form)return;

  const apiMeta=document.querySelector('meta[name="itrdesk-payment-api"]');
  const API_BASE=String(apiMeta&&apiMeta.content||'').replace(/\/$/,'');
  const configured=/^https:\/\/[A-Za-z0-9.-]+$/.test(API_BASE)&&API_BASE!=='https://PAYMENT_API_BASE';
  const payButton=$('payForJsonDraft');
  const retryButton=$('retryJsonVerification');
  const status=$('jsonPaymentStatus');
  const downloads=$('jsonDownloads');
  const callbackStatus=$('jsonCallbackStatus');
  let paidSession=null;
  let pendingPayment=null;
  let razorpayPromise=null;
  let localFileNames=[];
  let linkedCalculation=null;

  const incomeFields={
    salary:'jsonSalary',houseProperty:'jsonHouseProperty',businessProfession:'jsonBusiness',
    shortTermCapitalGains:'jsonStcg',longTermCapitalGains:'jsonLtcg',otherSources:'jsonOtherSources',
    exemptIncome:'jsonExemptIncome',agriculturalIncome:'jsonAgriculturalIncome'
  };
  const taxFields={
    oldRegimeDeductions:'jsonOldDeductions',newOrCommonDeductions:'jsonNewDeductions',
    tdsTcs:'jsonTdsTcs',advanceTax:'jsonAdvanceTax',selfAssessmentTax:'jsonSelfAssessmentTax',
    foreignTaxRelief:'jsonForeignTaxRelief'
  };

  function clean(value,max=500){return String(value==null?'':value).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
  function amount(id){
    const raw=String($(id).value||'0').replace(/,/g,'').trim();
    if(!/^-?(?:\d+\.?\d*|\.\d+)$/.test(raw))throw new Error('Please enter valid numeric amounts only.');
    const value=Number(raw);
    if(!Number.isFinite(value)||Math.abs(value)>1e12)throw new Error('An amount is outside the supported range.');
    return Math.round(value*100)/100;
  }
  function setStatus(message,type){status.textContent=message||'';status.className='payment-status'+(type?' '+type:'')}
  function setCallbackStatus(message,type){callbackStatus.textContent=message||'';callbackStatus.className='callback-status'+(type?' '+type:'')}
  function identityData(){
    const identity={
      name:clean($('jsonName').value,100),
      pan:clean($('jsonPan').value,10).toUpperCase(),
      dob:clean($('jsonDob').value,10),
      mobile:clean($('jsonMobile').value,20).replace(/[\s-]/g,''),
      email:clean($('jsonEmail').value,150).toLowerCase(),
      city:clean($('jsonCity').value,80)
    };
    if(identity.name.length<2)throw new Error('Please enter the assessee name.');
    if(!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(identity.pan))throw new Error('Please enter a valid PAN in the format ABCDE1234F.');
    if(!/^(?:\+91)?[6-9][0-9]{9}$/.test(identity.mobile))throw new Error('Please enter a valid Indian mobile number.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email))throw new Error('Please enter a valid email address.');
    return identity;
  }
  function draftData(){
    const identity=identityData();
    if(!$('jsonTermsConsent').checked)throw new Error('Please accept the terms and confirm that this is a professional-review draft.');
    const incomeSummary={};Object.entries(incomeFields).forEach(([key,id])=>{incomeSummary[key]=amount(id)});
    const taxSummary={};Object.entries(taxFields).forEach(([key,id])=>{taxSummary[key]=amount(id)});
    const selected=name=>Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(input=>clean(input.value,100));
    const draft={
      schema:'itrdesk-preparation-draft-v1',
      assessmentYear:'2026-27',
      identity,
      returnProfile:{
        returnStage:$('jsonReturnStage').value,
        residentialStatus:$('jsonResidentialStatus').value,
        indicatedItrForm:$('jsonItrForm').value,
        taxRegimeForReview:$('jsonRegime').value,
        refundBankAccountCount:Number($('jsonBankAccountCount').value||0)
      },
      sourceDocuments:selected('sourceDocument'),
      localFileNames:localFileNames.slice(0,20),
      incomeSummary,
      taxSummary,
      reviewFlags:selected('reviewFlag'),
      reviewNotes:clean($('jsonReviewNotes').value,1500),
      linkedCalculatorComputation:linkedCalculation,
      declarations:{officialPortalCredentialsCollected:false,officialUploadReadyJson:false,professionalReviewRequired:true}
    };
    return draft;
  }
  async function api(path,body,blob){
    const response=await fetch(API_BASE+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(blob&&response.ok)return response;
    const data=await response.json().catch(()=>({error:'Unexpected server response.'}));
    if(!response.ok)throw new Error(data.error||'The request could not be completed.');
    return data;
  }
  function loadRazorpay(){
    if(window.Razorpay)return Promise.resolve();
    if(razorpayPromise)return razorpayPromise;
    razorpayPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.async=true;script.onload=resolve;script.onerror=()=>reject(new Error('Secure payment window could not be loaded. Check your internet connection.'));document.head.appendChild(script)});
    return razorpayPromise;
  }
  function resetPayButton(){if(!configured||paidSession)return;payButton.disabled=false;payButton.textContent='Pay securely and unlock JSON'}
  function savePending(response,draft){pendingPayment={response,draft};try{sessionStorage.setItem('itrdeskPendingJsonPayment',JSON.stringify(pendingPayment))}catch(_){}retryButton.hidden=false}
  function clearPending(){pendingPayment=null;try{sessionStorage.removeItem('itrdeskPendingJsonPayment')}catch(_){}retryButton.hidden=true}
  function savePaidSession(session){
    paidSession=session;try{sessionStorage.setItem('itrdeskPaidJsonAuth',JSON.stringify(session))}catch(_){}clearPending();
    payButton.disabled=true;payButton.textContent='Payment verified';downloads.hidden=false;
    setStatus('Payment verified. The structured preparation draft is unlocked for this exact data for 24 hours.','success');
    downloads.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function restoreSession(){
    try{const stored=JSON.parse(sessionStorage.getItem('itrdeskPaidJsonAuth')||'null');if(stored&&stored.token&&stored.draft&&new Date(stored.expiresAt)>new Date()){paidSession=stored;payButton.disabled=true;payButton.textContent='Payment verified';downloads.hidden=false;setStatus('A verified preparation JSON is available in this browser session until '+new Date(stored.expiresAt).toLocaleString('en-IN')+'.','success')}}catch(_){try{sessionStorage.removeItem('itrdeskPaidJsonAuth')}catch(__){}}
    if(!paidSession&&configured){try{const pending=JSON.parse(sessionStorage.getItem('itrdeskPendingJsonPayment')||'null');if(pending&&pending.response&&pending.draft){pendingPayment=pending;retryButton.hidden=false;setStatus('A completed payment is waiting for server verification. Select “Verify completed payment again”.')}}catch(_){try{sessionStorage.removeItem('itrdeskPendingJsonPayment')}catch(__){}}}
  }
  async function verifyPayment(response,draft){
    savePending(response,draft);setStatus('Payment received. Verifying it securely before releasing the JSON...');
    const verified=await api('/api/verify-json-payment',{...response,draft});
    if(!verified.verified||!verified.token)throw new Error('Payment could not be verified. No JSON was released.');
    savePaidSession({token:verified.token,expiresAt:verified.expiresAt,draft});
  }

  function formatInput(id,value){if(Number.isFinite(value))$(id).value=value.toLocaleString('en-IN',{maximumFractionDigits:2})}
  function restoreLinkedCalculation(){
    try{
      const stored=JSON.parse(sessionStorage.getItem('itrdesk:linked-calculation')||'null');
      if(!stored||!stored.computation||stored.computation.version!=='AY2026-27-v1')return;
      linkedCalculation=stored.computation;
      const v=linkedCalculation.inputs||{};
      formatInput('jsonSalary',Number(v.salaryIncome||0));
      formatInput('jsonHouseProperty',Number(v.houseIncome||0));
      formatInput('jsonBusiness',Number(v.businessIncome||0));
      formatInput('jsonStcg',Number(v.stcg111A||0)+Number(v.stcg115AD||0));
      formatInput('jsonLtcg',Number(v.ltcg112A||0)+Number(v.ltcg112||0)+Number(v.propertyGainNoIndex||0)+Number(v.customCapitalGain||0));
      formatInput('jsonOtherSources',Number(v.dividendIncome||0)+Number(v.otherIncome||0));
      formatInput('jsonAgriculturalIncome',Number(v.agriculturalIncome||0));
      formatInput('jsonOldDeductions',Number(v.deduction80C||0)+Number(v.deduction80D||0)+Number(v.deductionNPS||0)+Number(v.otherOldDeductions||0));
      formatInput('jsonNewDeductions',Number(v.commonDeductions||0));
      formatInput('jsonTdsTcs',Number(v.tdsPaid||0)+Number(v.tcsPaid||0));
      formatInput('jsonAdvanceTax',Number(v.advanceTaxPaid||0));
      formatInput('jsonSelfAssessmentTax',Number(v.selfAssessmentPaid||0));
      formatInput('jsonForeignTaxRelief',Number(v.foreignTaxRelief||0));
      const linked=$('linkedCalculation');linked.textContent='Calculator figures linked from '+new Date(stored.savedAt||Date.now()).toLocaleString('en-IN')+'. Review every amount against official records before payment.';linked.classList.add('ready');
    }catch(_){linkedCalculation=null}
  }

  $('jsonLocalFiles').addEventListener('change',event=>{
    const files=Array.from(event.target.files||[]).slice(0,20);
    localFileNames=files.map(file=>clean(file.name,180));
    const list=$('jsonFileList');list.replaceChildren();
    if(!localFileNames.length){const li=document.createElement('li');li.textContent='No local files selected.';list.appendChild(li);return;}
    localFileNames.forEach(name=>{const li=document.createElement('li');li.textContent=name;list.appendChild(li)});
  });
  window.addEventListener('itrdesk:source-files',event=>{
    const names=event&&event.detail&&Array.isArray(event.detail.names)?event.detail.names:[];
    localFileNames=names.slice(0,20).map(name=>clean(name,180));
  });

  $('requestJsonCallback').addEventListener('click',()=>{
    try{
      const identity=identityData();
      if(!$('jsonCallbackConsent').checked)throw new Error('Please confirm that you choose to send the callback request.');
      const message=`Hi, I am preparing an AY 2026-27 review draft on ITR Desk and request one callback.\n\nName: ${identity.name}\nMobile: ${identity.mobile}\nEmail: ${identity.email}\nStarting ITR indication: ${$('jsonItrForm').value}\n\nI have not included a password or OTP.`;
      setCallbackStatus('Your WhatsApp request is ready. Send it there to complete the request.');
      window.open('https://wa.me/917879857126?text='+encodeURIComponent(message),'_blank','noopener');
    }catch(error){setCallbackStatus(error.message,'error')}
  });

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!configured){setStatus('The secure JSON checkout has not been activated yet.','error');return;}
    let draft;
    try{
      draft=draftData();payButton.disabled=true;payButton.textContent='Creating secure checkout...';setStatus('Preparing the secure payment order...');
      const [order]=await Promise.all([api('/api/create-json-order',{draft}),loadRazorpay()]);
      const checkout=new Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,name:'ITR Desk',description:'AY 2026-27 ITR preparation review draft JSON',order_id:order.orderId,prefill:{name:draft.identity.name,email:draft.identity.email,contact:draft.identity.mobile},notes:{service:'ITR preparation review draft'},theme:{color:'#0f6b5d'},handler:async response=>{try{await verifyPayment(response,draft)}catch(error){setStatus(error.message+' If your account was debited, use “Verify completed payment again”.','error');resetPayButton()}},modal:{confirm_close:true,ondismiss:()=>{if(!paidSession)setStatus('Payment window closed. No JSON has been unlocked.');resetPayButton()}}});
      checkout.on('payment.failed',response=>setStatus('Payment failed: '+clean(response&&response.error&&response.error.description||'Please try again.'),'error'));
      payButton.textContent='Payment window open…';checkout.open();
    }catch(error){setStatus(error.message,'error');resetPayButton()}
  });

  retryButton.addEventListener('click',async()=>{
    if(!configured||!pendingPayment)return;
    const original=retryButton.textContent;
    try{retryButton.disabled=true;retryButton.textContent='Verifying…';await verifyPayment(pendingPayment.response,pendingPayment.draft)}catch(error){setStatus(error.message,'error')}finally{retryButton.disabled=false;retryButton.textContent=original}
  });

  $('downloadJsonDraft').addEventListener('click',async()=>{
    if(!paidSession){setStatus('Complete and verify the JSON-draft payment first.','error');return;}
    const button=$('downloadJsonDraft'),original=button.textContent;
    try{
      button.disabled=true;button.textContent='Preparing...';setStatus('Generating your structured preparation draft securely...');
      const response=await api('/api/download-json',{token:paidSession.token,draft:paidSession.draft},true);
      const blob=await response.blob();const disposition=response.headers.get('Content-Disposition')||'';const match=disposition.match(/filename="([^"]+)"/);const filename=match?match[1]:'ITR-Preparation-Review-Draft-AY-2026-27.json';
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus('Preparation JSON downloaded. Obtain professional review before using any data for filing.','success');
    }catch(error){setStatus(error.message,'error')}finally{button.disabled=false;button.textContent=original}
  });

  Object.values({...incomeFields,...taxFields}).forEach(id=>$(id).addEventListener('blur',()=>{try{formatInput(id,amount(id))}catch(_){}}));
  if(!configured){payButton.disabled=true;payButton.textContent='Secure checkout activation pending';setStatus('Secure online payment is being activated.','error')}
  restoreLinkedCalculation();restoreSession();
})();
