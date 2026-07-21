(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('motion-js');

  const ready = () => {
    document.body.classList.add('motion-enhanced');

    const progress = document.createElement('div');
    progress.className = 'motion-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const heroItems = [
      ...document.querySelectorAll('.clean-hero-copy > *, .clean-about-grid > *, .page-hero .container > *')
    ];
    heroItems.forEach((element, index) => {
      element.classList.add('motion-hero-item');
      if (element.matches('.clean-profile-card,.profile-hero-photo') || element.closest('.clean-profile-card')) element.classList.add('motion-from-right');
      element.style.setProperty('--motion-delay', `${Math.min(index * 85, 510)}ms`);
    });

    const revealSelectors = [
      '.section-heading',
      '.clean-action-card',
      '.clean-service-card',
      '.clean-step',
      '.clean-faq details',
      '.clean-enquiry-copy',
      '.lead-form',
      '.clean-summary-card',
      '.clean-facts-card',
      '.clean-cta',
      '.content-card',
      '.sidebar-card',
      '.seo-card',
      '.practice-grid article',
      '.tool-card',
      '.guide-card',
      '.notice',
      '.alert-box'
    ];

    const revealElements = [...new Set(document.querySelectorAll(revealSelectors.join(',')))];
    let groupParent = null;
    let groupIndex = 0;
    revealElements.forEach((element) => {
      const parent = element.parentElement;
      if (parent !== groupParent) {
        groupParent = parent;
        groupIndex = 0;
      }
      element.classList.add('motion-reveal');
      if (element.matches('.clean-enquiry-copy,.clean-summary-card')) element.classList.add('motion-left');
      if (element.matches('.lead-form,.clean-facts-card,.sidebar-card')) element.classList.add('motion-right');
      element.style.setProperty('--motion-delay', `${Math.min(groupIndex * 85, 340)}ms`);
      groupIndex += 1;
    });

    if (reduced || !('IntersectionObserver' in window)) {
      heroItems.forEach((element) => element.classList.add('is-visible'));
      revealElements.forEach((element) => element.classList.add('is-visible'));
      root.classList.add('motion-started');
      return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    revealElements.forEach((element) => observer.observe(element));

    requestAnimationFrame(() => {
      root.classList.add('motion-started');
      heroItems.forEach((element) => element.classList.add('is-visible'));
    });

    const hero = document.querySelector('.clean-hero,.page-hero');
    const header = document.querySelector('.site-header');
    let ticking = false;
    const updateScrollMotion = () => {
      const scrollTop = Math.max(window.scrollY || document.documentElement.scrollTop, 0);
      const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      progress.style.transform = `scaleX(${Math.min(scrollTop / total, 1)})`;
      if (hero && window.innerWidth > 760) hero.style.setProperty('--hero-shift', `${Math.min(scrollTop * 0.11, 42)}px`);
      if (header) header.classList.toggle('motion-scrolled', scrollTop > 18);
      ticking = false;
    };
    const requestScrollUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrollMotion);
    };
    updateScrollMotion();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });

    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.querySelectorAll('.clean-profile-card,.profile-hero-photo').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
        });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        });
      });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
