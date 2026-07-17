(function(){
  'use strict';

  const PROFILE_IMAGE='assets/ca-siddharth-bhatia-final-r16.jpg?v=20260717-r16';
  const PROFILE_FALLBACK='https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-final-r16.jpg';
  const LINKEDIN_URL='https://www.linkedin.com/in/ca-siddharth-bhatia';

  function restoreProfileImages(){
    document.querySelectorAll('img[data-profile-photo],.professional-portrait img,.profile-hero-photo img,.sidebar-portrait').forEach((image)=>{
      image.dataset.profileR16Ready='true';
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.width=180;
      image.height=180;
      image.alt='CA Siddharth Bhatia in professional attire';
      image.style.display='block';
      image.style.opacity='1';
      image.style.visibility='visible';
      image.style.objectFit='cover';
      image.style.objectPosition='center';
      image.style.borderRadius='50%';

      let fallbackUsed=false;
      const useFallback=()=>{
        if(fallbackUsed)return;
        fallbackUsed=true;
        image.src=PROFILE_FALLBACK+'?v=20260717-r16';
      };
      image.addEventListener('error',useFallback,{once:true});
      image.addEventListener('load',()=>{
        if(image.naturalWidth<150||image.naturalHeight<150)useFallback();
      });
      image.src=PROFILE_IMAGE;
      window.setTimeout(()=>{
        if(!image.complete||image.naturalWidth<150||image.naturalHeight<150)useFallback();
      },1200);
    });
  }

  function correctLinkedInLinks(){
    document.querySelectorAll('a[href*="linkedin.com/in/ca-siddharth-bhatia"]').forEach((link)=>{
      link.href=LINKEDIN_URL;
      link.target='_blank';
      link.rel='noopener noreferrer';
    });
    document.querySelectorAll('.verification-links a').forEach((link)=>{
      if(/linkedin/i.test(link.textContent))link.href=LINKEDIN_URL;
    });
  }

  function apply(){
    restoreProfileImages();
    correctLinkedInLinks();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);
  else apply();
  window.addEventListener('load',apply,{once:true});
  window.setTimeout(apply,250);
  window.setTimeout(apply,1000);
})();
