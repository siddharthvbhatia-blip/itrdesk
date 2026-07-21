(function(){
  'use strict';

  const ENDPOINT='https://itrdesk-payment-backend.vercel.app/api/enquiries';
  const ACCESS_STORAGE='itrdesk:private-inbox-access:r24';
  const accessPanel=document.querySelector('#inboxAccess');
  const accessStatus=document.querySelector('#inboxAccessStatus');
  const app=document.querySelector('#inboxApp');
  const list=document.querySelector('#inboxList');
  const count=document.querySelector('#inboxCount');
  const storage=document.querySelector('#inboxStorage');
  const status=document.querySelector('#inboxStatus');
  const errorBox=document.querySelector('#inboxError');
  const refresh=document.querySelector('#inboxRefresh');
  const notifications=document.querySelector('#inboxNotifications');
  const forget=document.querySelector('#inboxForgetDevice');

  function clean(value){return String(value==null?'':value)}
  function text(element,value){element.textContent=clean(value)}
  function formatDate(value){
    const date=new Date(value);
    return Number.isNaN(date.getTime())?clean(value):date.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
  }
  function tel(value){return clean(value).replace(/[^+0-9]/g,'')}
  function whatsapp(value,name,reference){
    const number=tel(value).replace(/^\+?91/,'');
    const message=`Hello ${clean(name)}, regarding your ITR Desk enquiry ${clean(reference)}.`;
    return `https://wa.me/91${number}?text=${encodeURIComponent(message)}`;
  }
  function field(label,value,wide){
    if(!clean(value))return null;
    const wrapper=document.createElement('div');if(wide)wrapper.className='wide';
    const dt=document.createElement('dt');text(dt,label);
    const dd=document.createElement('dd');text(dd,value);
    wrapper.append(dt,dd);return wrapper;
  }
  function readMagicAccess(){
    const raw=location.hash.startsWith('#')?location.hash.slice(1):'';
    const parameters=new URLSearchParams(raw);
    const access=clean(parameters.get('access')).trim();
    if(access){
      localStorage.setItem(ACCESS_STORAGE,access);
      history.replaceState(null,'',location.pathname+location.search);
      return access;
    }
    return clean(localStorage.getItem(ACCESS_STORAGE)).trim();
  }
  function showUnauthorised(message){
    app.hidden=true;
    accessPanel.hidden=false;
    text(accessStatus,message||'Open your private access link once on this device. No password entry is required.');
  }
  function render(enquiries){
    list.replaceChildren();
    text(count,`${enquiries.length} ${enquiries.length===1?'enquiry':'enquiries'}`);
    if(!enquiries.length){
      const empty=document.createElement('div');empty.className='inbox-empty';
      empty.innerHTML='<h2>No enquiries found</h2><p>New website enquiries will appear here after submission.</p>';
      list.appendChild(empty);return;
    }
    enquiries.forEach(item=>{
      const article=document.createElement('article');article.className='inbox-message';
      const head=document.createElement('div');head.className='inbox-message-head';
      const identity=document.createElement('div');
      const heading=document.createElement('h2');text(heading,item.name||'Website enquiry');
      const time=document.createElement('time');text(time,formatDate(item.createdAt));
      identity.append(heading,time);
      const reference=document.createElement('span');reference.className='inbox-reference';text(reference,item.reference||'No reference');
      head.append(identity,reference);

      const details=document.createElement('dl');details.className='inbox-grid';
      [
        field('Mobile',item.mobile),field('Broad case',item.caseType),field('Email',item.email),field('City',item.city),
        field('Details',Array.isArray(item.details)?item.details.join(', '):item.details,true),field('Message',item.note||'No note provided',true),
        field('Status',item.status||'New'),field('Source',item.source,true)
      ].filter(Boolean).forEach(node=>details.appendChild(node));

      const actions=document.createElement('div');actions.className='inbox-actions';
      if(item.mobile){
        const call=document.createElement('a');call.className='btn primary';call.href='tel:'+tel(item.mobile);text(call,'Call');
        const wa=document.createElement('a');wa.className='btn secondary';wa.href=whatsapp(item.mobile,item.name,item.reference);wa.target='_blank';wa.rel='noopener';text(wa,'WhatsApp');
        actions.append(call,wa);
      }
      if(item.email){
        const email=document.createElement('a');email.className='btn ghost';email.href='mailto:'+encodeURIComponent(item.email)+'?subject='+encodeURIComponent('ITR Desk enquiry '+(item.reference||''));text(email,'Email');
        actions.appendChild(email);
      }
      article.append(head,details,actions);list.appendChild(article);
    });
  }

  async function load(access){
    if(!access){showUnauthorised();return;}
    errorBox.hidden=true;refresh.disabled=true;refresh.textContent='Refreshing…';
    try{
      const response=await fetch(ENDPOINT,{headers:{Authorization:'Bearer '+access,Accept:'application/json'},cache:'no-store'});
      const data=await response.json().catch(()=>({error:'Unexpected server response.'}));
      if(response.status===401){localStorage.removeItem(ACCESS_STORAGE);throw new Error('This device is no longer authorised. Open your private access link again.');}
      if(!response.ok||!data.accepted)throw new Error(data.error||'The enquiry inbox could not be loaded.');
      accessPanel.hidden=true;app.hidden=false;
      render(Array.isArray(data.enquiries)?data.enquiries:[]);
      text(storage,data.storage==='google-drive'?'Permanent Google Drive archive':'Recent notification inbox');
      status.className=data.storage==='google-drive'?'inbox-status':'inbox-status warning';
      text(status,data.retentionNotice||'');
      notifications.href=data.notificationUrl||'#';
      notifications.hidden=!data.notificationUrl;
      if(Array.isArray(data.errors)&&data.errors.length){errorBox.hidden=false;text(errorBox,data.errors.join(' '));}
    }catch(error){
      showUnauthorised(error.message||'Unable to open the inbox.');
    }finally{refresh.disabled=false;refresh.textContent='Refresh';}
  }

  refresh.addEventListener('click',()=>load(clean(localStorage.getItem(ACCESS_STORAGE)).trim()));
  forget.addEventListener('click',()=>{
    localStorage.removeItem(ACCESS_STORAGE);
    list.replaceChildren();
    showUnauthorised('This device has been removed from the private inbox. Use the private access link to authorise it again.');
  });

  load(readMagicAccess());
})();
