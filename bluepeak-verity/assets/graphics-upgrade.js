(() => {
  'use strict';

  const CA_LOGO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wgARCABxAKADASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAUGAwQHAgH/xAAZAQADAQEBAAAAAAAAAAAAAAAAAgMBBAX/2gAMAwEAAhADEAAAAbwAR0XVqxm9DfmHSrrd5zapdtOVR/dTn+eatht/L+habwjcAAEPMc+eere9KdZQlYAGgZWfEX0Ho56TubdZZeoNLd5eofDfoDX5xf6Jfn6T6IdAAAKRZ6LSM/a4nzz9Puo2D1mx09i+Ku370d7U9bP1U1ub9R57eF62Kpa51BXEaZWPcT0Wk61MRUx5fp6ujhsV/Hqmx7rvcvT2rtS6wNRUq3OYXDNTujm6UoErKtqomzCvOxWrDmlfDl+kaGyyhJxNO6DVupFv5j0XN2RKwAxR0tq1+KsuZ0qFi9SoEFgVrIxZVYiZYERJwjLBzk+3ASgBV7RWrK84GNlN7VhLTVLXjVmw1j2y5bJHSKPV7RWrJuV/U8bTpYMsBPyqGMAAY+APoAG/PpgG58+gAAG//8QAKBAAAgICAgEDBAIDAAAAAAAAAgMBBAAFEyASEBEUFSEkNCMwMzVA/9oACAEBAAEFAvWzcVXxu0cWTdszny7GfMs58yzlRkur5srp8mvuny/07C/4zHuRJ1bTwNZXHPp9XPp1bPptbAGAG2/gRP39Kbuev32VngUpZOZUqBWHttX8j6K4GLyOCxqn8b+95vNZ1SPBPa6/gQAkwwQA17C5bUj7ZUdzo6vLwTEe8jHiPbaP5X6dHvOWP4XXE8FjVtlJTb95gXnnupOQZnkZf/TV9m9rz+CuKzPFvSlRXcNzHRFZzM4UKybYDkRYfiq4L9bI+dfK7OVPXZv5rFRR/HXEEcqQmJuRGG9h5YKUlrLH5HW6nhs6ix7db7+CusJYa1CtTg42L/IrzHiUApte0EtqxMjNZsPT02FX5CvuJUdgLI9dk/msadHoSxOcvKykLBF8cT7KeB+of4s63aI2Mao0km69ODtpyxszYCwljFLhS+rVw1dsJbVGZEq7YcnqYCwW6tRYerfGDrbMzTojX/osRCntoPAtWp6o6Wrcodl2x8ZVdwvUu3J3ctXiS+NnIysxYGUrc2SxhwAVb0Wj7bP9zNz+qPlQOtMFtsP/AHLAFgaaZ8M0/wDkzbNnxuo+KKzhi+uyEpt5txkq0KFtWjXNF/LcmvYnatvGjX+MnNSJCzBrneszqozVSYj/AM//xAAlEQABBAEEAgEFAAAAAAAAAAABAAIDERIEECExICIyEzBBUVL/2gAIAQMBAT8BT5a4CxkK+m/9pjXDtSurhROvg+EjqCjZXO54TBmbR9XWr3m7HhJbvVqj00lVSdpP6NK4IhXaMjndDaYflMdY2JoLTuIkzWqc7HJhQyk7K+DtyLXtGUJWqR+XATW0Faw9slI1Qu4rewUWMJpNY3sLNuwNpxHSEYBvdvZRFuUfSDqtMFNUfxRBdymmx9z/xAAlEQACAgEDAwQDAAAAAAAAAAABAgARAxASISAiMQQTQVEwMlL/2gAIAQIBAT8BiY75MvGJ7ifUdlPiYlvmZVrnoxrZmR741EY7RUHctdGLwejHS9zTJ6hL8xfV/wAi42R2NniKPrTCfiMKOgFzOoOPZMAFlSOYtvwTMeFNuoNTtyCHE0xpXJjGzcqbO7dMbTKvN61UDuBGdvmbDoRUAPmHISK1bwIDSx/MK3UY2Y/7QUIRR/J//8QANBAAAgEBBQUFBwQDAAAAAAAAAQIAAxESITFBECAiMlEEEzNhcSMwQoGRobFAcpLBUvDx/9oACAEBAAY/AttjG1v8RPZhUH1njNPGeeM88ZojtmRsNKk1gGZEFKq15WyJ090aVE46t0mFpJltQ3B95xXm9TPD+5nIf5TlP8oFUWARn109ZadivrkfX3Fi87ZeUCJiTMMW1bfuDlT8zv6qXkvXcdPOFRynFZ3Z5X/PuHOgwE7w8z/jfZtchAoxZjO5+GyyFW8Xs5+oloivrr67zt0WAdYFGm/cHKmHzhrtpguxK/wngqRk0zWMHBuN+ZZTQsZxtcHRZicfqZwrdHVtlX9sT9w3y3xHBZgM9YqJaQB0nCn1hSzA6AQXvvPavaekspJOI3FluZ6nbUXquxH6jeujlTCNU+G2AMbBLXxllJLJi2HlLrLxS7Us4st5l0OIncNriu6SOY4LFRcyYKY5QLIVljZyxhlLoXhYS1vFoG63mICMxFqDXd4edcpqCIErGx+vXcw5UwENdvRdgLC2zZ3g+cN4WLpFq/BU4Kn9RqfTL0honJsvXevJw1PzLtRbDLA1o6NOKj9DLtNbluZtiouZMVFyA3mRsiJfbxaJuvAy5iLUGu9ddQw857Nin3nDdb5zFQvqZeJvP16e4FQ+HU4Kn9Q3UvLoRGFVbFOW7TphQb+wOFvY2QOv/I/Z7nLrbs7paV7DrPa9nZRA6G0HZUBUC7sZmyAthpVKYFo9bd/s/wDuuwfviVBaaNQC2VGU2gjYnp/UKOLQZVXQHZX2J2dOZzKFWlmmBiuuRFu92chSfl57AFBPFpFp1BgVEKsDZdPF12d6tNmsHSXKdArbrLp5jidle8pHqNlSo96mumE8dvpHo1FIunDD9R//xAAoEAEAAgECBQMFAQEAAAAAAAABABEhMUEQIFFhsXGBoTCRweHx8NH/2gAIAQEAAT8h4+WG/qKeUIjb7NE/vT+lP6c6924Abd7F6Q6vA1C+kmJuC+B3grBbQysIB9LWN0PoeIy395P76DSFQG0L00esJSlrlWCjY0/R4rJ9Y+xuw4P8szBNupq8+W9n13ROUR0ra+zEop4iZp2fTZ9DOub2yHX9Hts5wN14e80XQPWCa3n9+sybVnr1ft4iUJSZGH0tR6buNhq8e/8APxG31BD0AKOfLvnbpQzH3W7wP6QHR9nzK4M/sQagrutI9ycmZPoGY6f9TZPzKj7QUZbm3hCnQ8nPTT5CVilLVMWUsap+0R+BOm5cYWNFC8hNZ/mbQH5+JnrT2mDHFKZ1QJ5gC7a+vNaLtO7ux2z1Dyy0YNXDZuzOYTRHV/5L686MCW+4XmWMsOdaPM1Vm9tgtXV7u5y30851mTisQj/kIrGmz2iPRl9+sd8xZIqEV0Ca/vzk8P3jl0lj0ZsmMnR35clTW7+075vRGAk0xafvyWw7946stSf6y8DhrRcCiiaA9pILjNtYShiq8vxGS0WXXZLs7vNXlXU29Uur728OKf3iVsSxZV+GQw89MQotEc21UmFvm2dfzHQprHvNlXk6O/M8UdhccVro4TUx9qeZUhuo/iP6bro9H0AJK+13fiHTXZI4ms9wXN8pWXUrpmuDkFsS1NPN1OrpKAAt3tP+8F9rRKVvtBly3/pK0Sw8LK72bvXgnVWkDoYhfYgUUc3zTw4fBeGafnvRrzDQIIm+Dh8b5Q3AqbmcbHX+9uHyzy8EZDKO23z4nREv1evmPhonMKKEtLVhwTy1wL2ZgMEm5iVaSimOA+dPRU4d4of4tH86TOgtacMoElYLyxaLiCE1ufaKNX1jLkpKrv8AVYcm/N//2gAMAwEAAgADAAAAEOAuHnR5fPPNoXPL1HH9OIlPPAwt9ThV0fKgthRX/KMUg7Pc+VvPMUgescsVvPKR1aYbXl/IAXYQIgYXfP/EACMRAQACAgEDBAMAAAAAAAAAAAEAERAhMUFRYSBxofCBkdH/2gAIAQMBAT8QljlYbK1PsWOtpWpHHoOL5YQtzlAtiK5rCASzKsvRaqV8QBEX8fyZqCvzo+Nzoofr7+YFcs1EAbgEWeGZR6DEyQShIIlmAFMq0cRXOoNJ1ZFJSwJRLjXv/ZZb0yITtO4EK8kSaWXAFksCdytHJmqpyVUta+8BB7xAGaCJIPaUDnrghHBDH//EACIRAQACAQQCAgMAAAAAAAAAAAEAESEQIDFRQWFx8IGh0f/aAAgBAgEBPxCUvDHFCfQEBKVBVoKps5PgiKnGoVohGZS5ERp1NNsRXAe4tLFTn/Ql0T1MsTkfl/kCuZkYvzREBPfEpApxcLYAQaoz3Epp0RWS6DhgHGYt538AGwgSiVOfvUqo86qo9yweIwqByw0RUyogxLk2IQHh5laV1ECOoSpM1FWL8y4NzDb/AP/EACgQAQABAwIFBQEBAQEAAAAAAAERACExQYEgUWFxkRChwdHwsTDh8f/aAAgBAQABPxD0WKlkwSQO7TdSI0Up7rb2qKF0YexX5f1R/wAD9UEiWeYfihPDAkCii7xNLFWA7vjVh0Dpr2pgUTs6EnUcX6UM/wCC0es1ml+C6d8CrcwKX3Wmza9vtYPNGHVGF4hSuTt9lL6Hb7aZLD+edBtVjgaVNgYzNTH3tSklOQVy0CUDImR50bSQITQZ853/AMFytuZ/CHV6Ul9euA1TyNWgoBrbYOR0oI4WoKfMowuW2PNWKzpOAo5JDddKkuLl16bMnipWFAJwOW5J4o43Ml0VJE7su9Y3aUl9Fvnxxo0RStXjxd2qYsCTVOX+tIkzRecu7qrUpjj8lbdF7qlIKAZEuNASJwmhb7b1NTSwAFxLmpqac9hDeoo96NF9+rHzQ+wcuQEcTipiXIIbaj42a1UST8LW3fQhQtlpNf7kdqOpTSc3g2ubVc51FYwx1LbFXbjGHsTV6H0DHveKOkTyt/U1HrLp+A/KUgCvVdaaayXiSs4xPaNHERUWrr12JdqU1xKxe60IQIMEtW/Nl3rQ3/hKc7i2R01oAtcLkAzWAg5o9l6jbDAgLsXaux0wXnQy7tPC9e8z05UeilJHOsMe9C2S2R0ad2ewIQnmeFq4HPG2+2I2qDFlCu8joMHmkozQkxP/AGp8uwZyexaou5iEPD7oDDg2KWCY+Wo1rMXaHDJmiZLA5t3gepO4cLRLhIdFpjZk2ozoIi/i5N6OCIY7sIvsJfFHWhTc3V7ZorDZnyXvd3qXaF+csfulM5bJs0YHt70GC3fDGnZpzHgQk/I/yoOSz66HalBi5xtBkajBG3adh54QiBOraGr7/wBpID3OE+yNAi5gvr6NdOVTU0tZPU42XyNuxWJkmXn+jzUVNV+V3/tCAAGALFTkokEGmj8eKVxZlstbaDR+kDMXy7qujU2N42pdeLbNWSs1oC5uHtRjgaCUMzNnq6/2lGk0LDmOE7VpJ0MR0cnmhw50j9kqHAJFi6EBHfNTIBdKdewS7VAyN1o17rfgQck1FH/LucThOo32oNJVHk8duNzS2SzaBkqLgJdgGzPFlgQQU6dfpbnmn3lyR+B80GkC8d4k1e1cCAcg+X242re41wWZfKnqVKh6+GiSZGKZ44NwxbGBI8cLOwBUZGwi+fRKoVtEizMPKlFsQ+QyqYApASwFiPRfKxXALEB5UHNURWdgJ80PmeL9Z6U4ohKQL3EanSipEjL0Caej1iUMoTlfagAAAgDT/AlbWDMEDIoFOyVOZJTyD+kDC+vFqAwujr3OdKY1T0lEfMHgEzQiJahgb0OewxpMi7qHuVMGN0BMcUuIwhzSFvQodSWo5BTtVIEJC5yRpaQwnEpDOJ6c/SD0iTBLAedHtDNQcwgO6oTQKSYgDoFaU3CziDkZL0SLAS03oQQEYAMaCvVpSSIsAk+aevoKIWAKQ3vvw8+DUo9cKwpx6Onoa14P/9k=';
  const XERO_LOGO = 'assets/xero-credential-badge.svg?v=20260807-local-1';
  const ICAI_INFO = 'https://www.icai.org/post/19553';

  const addCss = (href, marker) => {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[marker] = 'true';
    document.head.appendChild(link);
  };
  addCss('assets/graphics-upgrade.css?v=20260807-r4','bpGraphics');
  addCss('assets/graphics-global.css?v=20260807-r1','bpGlobal');
  addCss('assets/user-corrections.css?v=20260807-r3','bpUserCorrections');

  const nav = document.querySelector('#site-nav');
  if (nav) {
    const onHome = /(?:\/|index\.html)$/.test(location.pathname);
    const addNav = (label, href, cls, before) => {
      if ([...nav.querySelectorAll('a')].some(a => a.textContent.trim() === label)) return;
      const a = document.createElement('a');
      a.textContent = label;
      a.href = href;
      if (cls) a.className = cls;
      nav.insertBefore(a, before || nav.querySelector('.nav-cta'));
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        document.querySelector('.nav-toggle')?.setAttribute('aria-expanded','false');
        document.body.classList.remove('nav-open');
      });
    };
    addNav('Pricing', onHome ? '#pricing' : 'index.html#pricing', 'pricing-nav-link', [...nav.querySelectorAll('a')].find(a => a.getAttribute('href') === 'about.html'));
    addNav('Contact Us', onHome ? '#contact' : 'index.html#contact', 'contact-nav-link', nav.querySelector('.nav-cta'));
  }

  const brand = document.querySelector('.nav-shell .brand');
  if (brand && !document.querySelector('.bp-header-ca')) {
    const badge = document.createElement('a');
    badge.className = 'bp-header-ca';
    badge.href = ICAI_INFO;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';
    badge.setAttribute('aria-label','CA India professional identity');
    badge.innerHTML = `<img src="${CA_LOGO}" alt="CA India logo"><span>CA-led</span>`;
    brand.insertAdjacentElement('afterend', badge);
  }

  const firstHeroProof = document.querySelector('.hero-proof span');
  if (firstHeroProof && !firstHeroProof.querySelector('.bp-hero-ca-logo')) {
    firstHeroProof.style.display='inline-flex'; firstHeroProof.style.alignItems='center';
    const img=document.createElement('img'); img.className='bp-hero-ca-logo'; img.src=CA_LOGO; img.alt='CA India'; img.width=30; img.height=22;
    firstHeroProof.prepend(img);
  }

  const heroStage=document.querySelector('[data-control-stage]');
  if(heroStage && !heroStage.querySelector('.bp-control-beacon')){
    heroStage.insertAdjacentHTML('afterbegin',`<div class="bp-altitude-field" aria-hidden="true"><svg viewBox="0 0 760 650" preserveAspectRatio="none"><path d="M16 510 C120 414 176 438 264 346 S440 220 548 276 678 244 748 120"/><path d="M4 566 C124 492 194 500 286 410 S454 300 570 332 690 308 756 206"/><path d="M34 620 C136 548 230 558 330 474 S500 372 602 398 704 382 770 300"/></svg></div><div class="bp-control-beacon bp-beacon-a"><i>01</i><div><strong>Source integrity</strong><small>Evidence linked</small></div></div><div class="bp-control-beacon bp-beacon-b"><i>02</i><div><strong>Exception control</strong><small>Queries isolated</small></div></div><div class="bp-control-beacon bp-beacon-c"><i>03</i><div><strong>Reviewer handoff</strong><small>Status visible</small></div></div>`);
  }

  const credibility=document.querySelector('.credibility-grid');
  if(credibility){
    const first=credibility.children[0];
    if(first && !first.querySelector('.bp-ca-mini')){
      const a=document.createElement('a'); a.className='bp-ca-mini'; a.href=ICAI_INFO; a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML=`<img src="${CA_LOGO}" alt="CA India logo">`; first.prepend(a);
    }
    const second=credibility.children[1];
    if(second && !second.querySelector('.mini-cred-logo')){
      const x=document.createElement('img'); x.className='mini-cred-logo'; x.src=XERO_LOGO; x.alt='Xero L1 Certified Associate'; second.prepend(x);
    }
  }

  const audienceProof=document.querySelector('#audience-proof');
  if(audienceProof && !document.querySelector('.bp-global-network')){
    const visual=document.createElement('div'); visual.className='bp-audience-visual';
    visual.innerHTML=`<div class="bp-global-network" aria-label="Illustrative delivery network"><svg viewBox="0 0 480 230" aria-hidden="true"><ellipse class="bp-globe-ring" cx="240" cy="116" rx="116" ry="92"/><ellipse class="bp-globe-ring dash" cx="240" cy="116" rx="58" ry="92"/><ellipse class="bp-globe-ring" cx="240" cy="116" rx="116" ry="39"/><path class="bp-globe-ring" d="M124 116H356M146 67C198 90 284 90 334 67M146 165C198 142 284 142 334 165"/><path class="bp-route" d="M194 131 C155 101 117 88 79 92"/><path class="bp-route uk" d="M198 127 C250 82 318 67 380 77"/><g class="bp-network-node hub" transform="translate(194 131)"><circle r="15"/><text text-anchor="middle" dy="2.6">IND</text></g><g class="bp-network-node" transform="translate(79 92)"><circle r="13"/><text text-anchor="middle" dy="2.4">US</text></g><g class="bp-network-node" transform="translate(380 77)"><circle r="13"/><text text-anchor="middle" dy="2.4">UK</text></g></svg><span class="bp-network-label us"><i></i>US accounting firms</span><span class="bp-network-label uk"><i></i>UK practices</span><span class="bp-network-label india"><i></i>India delivery hub</span></div>`;
    audienceProof.parentNode.insertBefore(visual,audienceProof); visual.appendChild(audienceProof);
  }

  const quality=document.querySelector('.quality-visual');
  if(quality && !quality.querySelector('.quality-flow-title')){
    quality.insertAdjacentHTML('afterbegin','<div class="quality-flow-title">BluePeak control sequence</div>');
    quality.insertAdjacentHTML('beforeend','<div class="quality-data-row"><div class="quality-data-card"><span>Source integrity</span><strong><i class="status-dot"></i>Traceable</strong><small>Evidence and basis remain linked to the workpaper.</small></div><div class="quality-data-card"><span>Exception visibility</span><strong>Open items isolated</strong><small>Unresolved matters stay visible for reviewer action.</small></div><div class="quality-data-card"><span>Reviewer status</span><strong>Handoff ready</strong><small>The next professional can follow the sequence quickly.</small></div></div>');
  }

  const founderShell=document.querySelector('.founder-photo-shell');
  if(founderShell && !founderShell.querySelector('.bp-founder-ca')){
    const a=document.createElement('a'); a.className='bp-founder-ca'; a.href=ICAI_INFO; a.target='_blank'; a.rel='noopener noreferrer';
    a.innerHTML=`<img src="${CA_LOGO}" alt="CA India logo"><div><span>Professional qualification</span><strong>Chartered Accountant · ICAI 438248</strong></div>`; founderShell.appendChild(a);
  }

  const credentialShowcase=document.querySelector('.credential-section .credential-showcase');
  if(credentialShowcase && !credentialShowcase.querySelector('.bp-credential-grid')){
    credentialShowcase.innerHTML=`<div class="bp-credentials-head"><div><p class="eyebrow">Professional credentials</p><h2>Qualified judgement. Verified platform capability.</h2></div><p>BluePeak Verity is founder-led by an Indian Chartered Accountant and supported by a current Xero L1 credential. These credentials complement the operating controls shown throughout the website; they do not imply US CPA or UK chartered-accountancy status.</p></div><div class="bp-credential-grid"><article class="bp-credential-card"><a class="bp-credential-logo" href="${ICAI_INFO}" target="_blank" rel="noopener noreferrer"><img src="${CA_LOGO}" alt="CA India logo"></a><div class="bp-credential-copy"><small>Professional qualification</small><h3>Chartered Accountant · India</h3><p>CA Siddharth Bhatia · ICAI Membership No. 438248.</p><div class="bp-credential-meta"><span>ICAI member</span><span>Founder-led delivery</span><span>India-based</span></div><a class="bp-credential-link" href="about.html">View professional profile ↗</a></div></article><article class="bp-credential-card"><div class="bp-credential-logo xero"><img src="${XERO_LOGO}" alt="Xero L1 Certified Associate badge"></div><div class="bp-credential-copy"><small>Platform credential</small><h3>Xero L1 Certified Associate</h3><p>Earned by Siddharth Bhatia on 6 August 2026. Score 93 · Completion ID 16789646.</p><div class="bp-credential-meta"><span>Credential earned</span><span>Cloud accounting</span><span>Xero workflows</span></div><a class="bp-credential-link" href="xero-certified.html">View credential details ↗</a></div></article></div>`;
  }

  const credentialHero=document.querySelector('.credential-page-hero .container');
  if(credentialHero && !credentialHero.querySelector('.bp-cert-ribbon')){
    credentialHero.insertAdjacentHTML('beforeend',`<a class="bp-cert-ribbon" href="${ICAI_INFO}" target="_blank" rel="noopener noreferrer"><span class="bp-cert-logo"><img src="${CA_LOGO}" alt="CA India logo"></span><span><span>Also professionally qualified</span><strong>Chartered Accountant · India</strong><small>ICAI Membership No. 438248</small></span></a>`);
  }

  const pricing=[...document.querySelectorAll('.pricing-section .price-card')];
  if(pricing.length>=2){
    const p0=pricing[0].querySelector('.price'),p1=pricing[1].querySelector('.price');
    if(p0)p0.innerHTML='<strong>US$149</strong><small>/ £119 onwards</small>';
    if(p1)p1.innerHTML='<strong>US$349</strong><small>/ £279 onwards</small>';
    if(!pricing[0].querySelector('.pricing-value-note')) pricing[0].insertAdjacentHTML('beforeend','<small class="pricing-value-note">A practical entry point before recurring support.</small>');
    if(!pricing[1].querySelector('.pricing-value-note')) pricing[1].insertAdjacentHTML('beforeend','<small class="pricing-value-note">Designed for controlled monthly delivery.</small>');
  }

  const footerBrand=document.querySelector('.footer-brand');
  if(footerBrand){
    const logo=[...footerBrand.children].find(el=>el.tagName==='IMG');
    if(logo && !footerBrand.querySelector('.bp-footer-logo-wrap')){const wrap=document.createElement('div');wrap.className='bp-footer-logo-wrap';footerBrand.insertBefore(wrap,logo);wrap.appendChild(logo);}
    if(!footerBrand.querySelector('.bp-footer-credentials')) footerBrand.insertAdjacentHTML('beforeend',`<div class="bp-footer-credentials"><img class="xero-footer" src="${XERO_LOGO}" alt="Xero L1 Certified Associate"><img class="ca-footer" src="${CA_LOGO}" alt="CA India logo"><span>CA-led delivery · Xero L1 Certified Associate</span></div>`);
  }
})();