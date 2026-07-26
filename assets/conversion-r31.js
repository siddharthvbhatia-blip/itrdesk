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

  function loadJsonAccordionStyles(){
    if(document.querySelector('link[data-json-accordion-r33]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='assets/json-accordion-r33.css?v=20260726-r33';
    link.dataset.jsonAccordionR33='true';
    document.head.appendChild(link);
  }

  function setPanelOpen(panel,open){
    const toggle=panel.querySelector(':scope > .json-accordion-toggle');
    const content=panel.querySelector(':scope > .json-accordion-content');
    if(!toggle||!content)return;
    panel.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    content.hidden=!open;
  }

  function setupJsonAccordions(){
    const form=document.getElementById('itrJsonForm');
    if(!form)return;

    loadJsonAccordionStyles();
    const panels=Array.from(form.querySelectorAll(':scope > .json-panel'));
    if(!panels.length)return;

    panels.forEach((panel,index)=>{
      if(panel.dataset.accordionReady==='true')return;
      const directChildren=Array.from(panel.children);
      const heading=directChildren.find(node=>node.tagName==='H2');
      const intro=directChildren.find(node=>node.tagName==='P');
      if(!heading)return;

      const titleText=heading.textContent.trim();
      const summaryText=intro?intro.textContent.trim():'Open this section to view and complete the details.';
      const content=document.createElement('div');
      content.className='json-accordion-content';
      content.id=`jsonAccordionContent${index+1}`;

      Array.from(panel.childNodes).forEach(node=>{
        if(node!==heading&&node!==intro)content.appendChild(node);
      });

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='json-accordion-toggle';
      toggle.setAttribute('aria-controls',content.id);
      toggle.innerHTML=`<span class="json-accordion-heading"><span class="json-accordion-title"></span><span class="json-accordion-summary"></span></span><span class="json-accordion-icon" aria-hidden="true">▶</span>`;
      toggle.querySelector('.json-accordion-title').textContent=titleText;
      toggle.querySelector('.json-accordion-summary').textContent=summaryText;

      panel.replaceChildren(toggle,content);
      panel.classList.add('json-accordion-panel');
      panel.dataset.accordionReady='true';
      setPanelOpen(panel,index===0);

      toggle.addEventListener('click',()=>{
        const shouldOpen=!panel.classList.contains('is-open');
        if(shouldOpen)panels.forEach(item=>setPanelOpen(item,item===panel));
        else setPanelOpen(panel,false);
      });
    });

    form.classList.add('json-accordion-ready');
    form.addEventListener('invalid',event=>{
      const panel=event.target.closest('.json-panel');
      if(panel)panels.forEach(item=>setPanelOpen(item,item===panel));
    },true);

    const hashTarget=location.hash?document.getElementById(location.hash.slice(1)):null;
    const hashPanel=hashTarget&&hashTarget.closest('.json-panel');
    if(hashPanel)panels.forEach(item=>setPanelOpen(item,item===hashPanel));
  }

  function setSidebarOpen(card,open){
    const toggle=card.querySelector(':scope > .json-sidebar-toggle');
    const content=card.querySelector(':scope > .json-sidebar-content');
    if(!toggle||!content)return;
    card.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    content.hidden=!open;
  }

  function setupJsonSidebarAccordions(){
    const side=document.querySelector('.json-side');
    if(!side)return;
    const cards=Array.from(side.querySelectorAll(':scope > .sidebar-card'));
    if(!cards.length)return;

    cards.forEach((card,index)=>{
      if(card.dataset.sidebarAccordionReady==='true')return;
      const directChildren=Array.from(card.children);
      const heading=directChildren.find(node=>node.matches('h2,h3'));
      const eyebrow=directChildren.find(node=>node.classList&&node.classList.contains('eyebrow'));
      if(!heading)return;

      const titleText=heading.textContent.trim();
      const summaryText=index===0?'Five safety checks before entering detailed information.':'Official portal links and filing guidance.';
      const content=document.createElement('div');
      content.className='json-sidebar-content';
      content.id=`jsonSidebarContent${index+1}`;

      Array.from(card.childNodes).forEach(node=>{
        if(node!==heading&&node!==eyebrow)content.appendChild(node);
      });

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='json-sidebar-toggle';
      toggle.setAttribute('aria-controls',content.id);
      toggle.innerHTML=`<span class="json-sidebar-heading"><span class="json-sidebar-title"></span><span class="json-sidebar-summary"></span></span><span class="json-sidebar-icon" aria-hidden="true">▶</span>`;
      toggle.querySelector('.json-sidebar-title').textContent=titleText;
      toggle.querySelector('.json-sidebar-summary').textContent=summaryText;

      card.replaceChildren(toggle,content);
      card.classList.add('json-sidebar-disclosure');
      card.dataset.sidebarAccordionReady='true';
      setSidebarOpen(card,false);

      toggle.addEventListener('click',()=>{
        const shouldOpen=!card.classList.contains('is-open');
        if(shouldOpen)cards.forEach(item=>setSidebarOpen(item,item===card));
        else setSidebarOpen(card,false);
      });
    });

    side.classList.add('json-sidebar-accordion-ready');
  }

  function setup(){
    setupCaseChoices();
    setupJsonAccordions();
    setupJsonSidebarAccordions();
    protectQuoteOnlyTool();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
