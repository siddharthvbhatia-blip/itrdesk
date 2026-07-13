(function(){
  'use strict';
  const $=id=>document.getElementById(id),form=$('paidReportForm');
  if(!form)return;
  const apiMeta=document.querySelector('meta[name="itrdesk-payment-api"]');
  const API_BASE=String(apiMeta&&apiMeta.content||'').replace(/\/$/,'');
  const configured=/^https:\/\/[A-Za-z0-9.-]+$/.test(API_BASE)&&API_BASE!=='https://PAYMENT_API_BASE'&&API_BASE!=='PAYMENT_API_BASE';
  const payButton=$('payForComputation'),retryButton=$('retryPaymentVerification'),status=$('paymentStatus'),downloads=$('paidDownloads');
  let paidSession=null,pendingPayment=null,razorpayPromise=null;

  function setStatus(message,type){status.textContent=message||'';status.className='payment-status'+(type?' '+type:'')}
  function clean(value){return String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim()}
  function reportData(){
    if(!window.ITRDeskCalculator)throw new Error('Please reload the calculator and try again.');
    if(!window.ITRDeskCalculator.recalculate())throw new Error('Please correct the calculator inputs first.');
    const computation=window.ITRDeskCalculator.getComputation();
    if(!computation||(!computation.newRegime.totalIncome&&!computation.oldRegime.totalIncome))throw new Error('Please enter your income and calculate the tax before purchasing a computation.');
    const pan=clean($('reportPan').value).toUpperCase(),mobile=clean($('reportMobile').value).replace(/[\s-]/g,'');
    const identity={name:clean($('reportName').value),pan,fatherName:clean($('reportFatherName').value),dob:clean($('reportDob').value),gender:clean($('reportGender').value),mobile,email:clean($('reportEmail').value).toLowerCase(),natureBusiness:clean($('reportBusiness').value),address:clean($('reportAddress').value)};
    if(identity.name.length<2)throw new Error('Please enter the assessee name.');
    if(!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan))throw new Error('Please enter a valid PAN in the format ABCDE1234F.');
    if(!/^(?:\+91)?[6-9][0-9]{9}$/.test(mobile))throw new Error('Please enter a valid Indian mobile number.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email))throw new Error('Please enter a valid email address.');
    if(!$('reportConsent').checked)throw new Error('Please accept the terms, refund policy and privacy policy.');
    return {schema:'itrdesk-report-v1',identity,computation};
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
  function resetPayButton(){if(!configured||paidSession)return;payButton.disabled=false;payButton.textContent='Pay ₹1,000 and unlock PDF + Word'}
  function savePending(response,report){pendingPayment={response,report};sessionStorage.setItem('itrdeskPendingPayment',JSON.stringify(pendingPayment));retryButton.hidden=false}
  function clearPending(){pendingPayment=null;sessionStorage.removeItem('itrdeskPendingPayment');retryButton.hidden=true}
  function savePaidSession(session){paidSession=session;sessionStorage.setItem('itrdeskPaidReportAuth',JSON.stringify(session));clearPending();payButton.disabled=true;payButton.textContent='Payment verified';downloads.hidden=false;setStatus('Payment verified. PDF and Word downloads are unlocked for this exact computation for 24 hours.','success');downloads.scrollIntoView({behavior:'smooth',block:'center'})}
  function restoreSession(){
    try{const stored=JSON.parse(sessionStorage.getItem('itrdeskPaidReportAuth')||'null');if(stored&&stored.token&&stored.report&&new Date(stored.expiresAt)>new Date()){paidSession=stored;payButton.disabled=true;payButton.textContent='Payment verified';downloads.hidden=false;setStatus('A verified paid computation is available in this browser session until '+new Date(stored.expiresAt).toLocaleString('en-IN')+'.','success')}}catch(_){sessionStorage.removeItem('itrdeskPaidReportAuth')}
    if(!paidSession&&configured){try{const pending=JSON.parse(sessionStorage.getItem('itrdeskPendingPayment')||'null');if(pending&&pending.response&&pending.report){pendingPayment=pending;retryButton.hidden=false;setStatus('A completed payment is waiting for server verification. Select “Verify completed payment again”.')}}catch(_){sessionStorage.removeItem('itrdeskPendingPayment')}}
  }
  async function verifyPayment(response,report){
    savePending(response,report);
    setStatus('Payment received. Verifying it securely before releasing the documents...');
    const verified=await api('/api/verify-payment',{...response,report});
    if(!verified.verified||!verified.token)throw new Error('Payment could not be verified. No document was released.');
    savePaidSession({token:verified.token,expiresAt:verified.expiresAt,report});
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!configured){setStatus('The ₹1,000 payment gateway has not been activated yet. Please contact ITR Desk on WhatsApp.','error');return}
    let report;
    try{
      report=reportData();payButton.disabled=true;payButton.textContent='Creating secure payment...';setStatus('Preparing a secure ₹1,000 payment order...');
      const [order]=await Promise.all([api('/api/create-order',{report}),loadRazorpay()]);
      const checkout=new Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,name:'ITR Desk',description:'AY 2026-27 PDF + Word computation',order_id:order.orderId,prefill:{name:report.identity.name,email:report.identity.email,contact:report.identity.mobile},notes:{service:'Paid tax computation'},theme:{color:'#0f6b5d'},handler:async response=>{try{await verifyPayment(response,report)}catch(error){setStatus(error.message+' If your account was debited, use “Verify completed payment again”.','error');resetPayButton()}},modal:{confirm_close:true,ondismiss:()=>{if(!paidSession)setStatus('Payment window closed. No document has been unlocked.');resetPayButton()}}});
      checkout.on('payment.failed',response=>setStatus('Payment failed: '+clean(response&&response.error&&response.error.description||'Please try again.'),'error'));
      payButton.textContent='Payment window open…';checkout.open();
    }catch(error){setStatus(error.message,'error');resetPayButton()}
  });

  retryButton.addEventListener('click',async()=>{
    if(!configured||!pendingPayment)return;
    const original=retryButton.textContent;
    try{retryButton.disabled=true;retryButton.textContent='Verifying…';await verifyPayment(pendingPayment.response,pendingPayment.report)}catch(error){setStatus(error.message,'error')}finally{retryButton.disabled=false;retryButton.textContent=original}
  });

  async function download(format){
    if(!paidSession){setStatus('Complete and verify the ₹1,000 payment first.','error');return}
    const button=format==='pdf'?$('downloadPaidPdf'):$('downloadPaidDocx');
    const original=button.textContent;
    try{button.disabled=true;button.textContent='Preparing...';setStatus('Generating your '+(format==='pdf'?'PDF':'Word')+' computation securely...');const response=await api('/api/download',{format,token:paidSession.token,report:paidSession.report},true);const blob=await response.blob();const disposition=response.headers.get('Content-Disposition')||'';const match=disposition.match(/filename="([^"]+)"/);const filename=match?match[1]:'ITR-Computation-AY-2026-27.'+(format==='pdf'?'pdf':'docx');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus('Download prepared successfully.','success')}catch(error){setStatus(error.message,'error')}finally{button.disabled=false;button.textContent=original}
  }
  $('downloadPaidPdf').addEventListener('click',()=>download('pdf'));
  $('downloadPaidDocx').addEventListener('click',()=>download('docx'));
  if(!configured){payButton.disabled=true;payButton.textContent='₹1,000 payment activation pending';setStatus('Secure online payment is being activated. Free tax calculation remains available. For an immediate paid computation or ITR filing, contact ITR Desk on WhatsApp.')}
  restoreSession();
})();
