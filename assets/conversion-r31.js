(function(){
  'use strict';

  function setupCaseChoices(){
    const form=document.getElementById('itrForm');
    if(!form)return;
    const select=form.querySelector('select[name="caseType"]');
    document.querySelectorAll('[data-case-choice]').forEach(link=>{
      link.addEventListener('click',()=>{
        const value=String(link.dataset.caseChoice||'').trim();
        if(select&&value){
          const option=Array.from(select.options).find(item=>item.value===value||item.textContent.trim()===value);
          if(option)select.value=option.value;
        }
        setTimeout(()=>{
          const name=form.querySelector('input[name="name"]');
          if(name)name.focus({preventScroll:true});
        },450);
      });
    });
  }

  function protectQuoteOnlyTool(){
    const form=document.querySelector('#itrJsonForm[data-public-quote-only="true"]');
    if(!form)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const target=document.querySelector('.public-scope-cta');
      if(target)target.scrollIntoView({behavior:'smooth',block:'center'});
    },true);
  }

  function setup(){
    setupCaseChoices();
    protectQuoteOnlyTool();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
