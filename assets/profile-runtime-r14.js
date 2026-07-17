(function(){
  'use strict';

  const PROFILE_IMAGE='assets/ca-siddharth-bhatia-profile.png?v=20260717-r14';
  const PROFILE_FALLBACK='https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png';
  const LINKEDIN_URL='https://www.linkedin.com/in/ca-siddharth-bhatia';

  function restoreProfileImages(){
    document.querySelectorAll('img[data-profile-photo]').forEach((image)=>{
      if(image.dataset.r14Ready==='true')return;
      image.dataset.r14Ready='true';
      image.removeAttribute('srcset');
      image.sizes='auto';
      image.width=640;
      image.height=640;
      image.alt='CA Siddharth Bhatia in professional attire';
      image.style.display='block';
      image.style.opacity='1';
      image.style.visibility='visible';
      image.style.objectFit='cover';
      image.style.objectPosition='center 18%';
      image.style.borderRadius='50%';

      let fallbackUsed=false;
      const useFallback=()=>{
        if(fallbackUsed)return;
        fallbackUsed=true;
        image.src=PROFILE_FALLBACK+'?v=20260717-r14';
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
  window.setTimeout(apply,400);
  window.setTimeout(apply,1400);
})();
