(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const moneyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const previousMoney = new WeakMap();

  const rupees = (value) => {
    const rounded = Math.round(value);
    return `${rounded < 0 ? '-' : ''}₹${moneyFormatter.format(Math.abs(rounded))}`;
  };

  const moneyValue = (text) => {
    const source = String(text || '').trim();
    const numeric = Number(source.replace(/[₹,\s]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const observeOnce = (elements, className, options = {}) => {
    const list = [...elements];
    if (!list.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      list.forEach((element) => element.classList.add(className));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(className);
        instance.unobserve(entry.target);
      });
    }, {
      threshold: options.threshold || 0.18,
      rootMargin: options.rootMargin || '0px 0px -7% 0px'
    });
    list.forEach((element) => observer.observe(element));
  };

  const setupHero = () => {
    document.querySelectorAll('.clean-hero,.page-hero').forEach((hero) => {
      if (hero.querySelector('.motion-hero-symbols')) return;
      const layer = document.createElement('div');
      layer.className = 'motion-hero-symbols';
      layer.setAttribute('aria-hidden', 'true');
      ['₹', '26AS', '✓'].forEach((label) => {
        const symbol = document.createElement('span');
        symbol.className = 'motion-hero-symbol';
        symbol.textContent = label;
        layer.appendChild(symbol);
      });
      hero.appendChild(layer);
      const title = hero.querySelector('h1');
      if (title) title.classList.add('motion-title-line');
    });
  };

  const setupCards = () => {
    const cards = document.querySelectorAll('.clean-action-card,.tool-card,.contact-card');
    cards.forEach((card) => {
      card.classList.add('motion-card');
      if (!finePointer) return;
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--motion-card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--motion-card-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  };

  const setupStepTracks = () => {
    const tracks = document.querySelectorAll('.clean-step-grid,.timeline');
    tracks.forEach((track) => {
      track.classList.add('motion-step-track');
      const steps = [...track.querySelectorAll('.clean-step,.step')];
      const activate = () => {
        track.classList.add('is-track-active');
        steps.forEach((step, index) => {
          window.setTimeout(() => step.classList.add('is-step-active'), reducedMotion ? 0 : 250 + index * 330);
        });
      };
      if (reducedMotion || !('IntersectionObserver' in window)) {
        activate();
        return;
      }
      const observer = new IntersectionObserver((entries, instance) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        activate();
        instance.disconnect();
      }, { threshold: 0.28 });
      observer.observe(track);
    });
  };

  const setupChecklist = () => {
    const items = document.querySelectorAll('.check-list li');
    items.forEach((item, index) => {
      item.classList.add('motion-check-item');
      item.style.setProperty('--check-delay', `${Math.min(index % 8, 7) * 65}ms`);
    });
    observeOnce(items, 'is-check-visible', { threshold: 0.14 });
  };

  const animateMoney = (element, start, target) => {
    if (reducedMotion || start === target) {
      element.textContent = rupees(target);
      previousMoney.set(element, target);
      return;
    }
    const duration = 680;
    const started = performance.now();
    element.classList.remove('is-number-rolling');
    void element.offsetWidth;
    element.classList.add('is-number-rolling');
    const frame = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = rupees(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.textContent = rupees(target);
        previousMoney.set(element, target);
      }
    };
    requestAnimationFrame(frame);
  };

  const setupCalculator = () => {
    const form = document.querySelector('#taxCalculator');
    const resultSummary = document.querySelector('.result-summary');
    if (!form || !resultSummary) return;

    const moneyNodes = [...document.querySelectorAll('.calc-results [id]')]
      .filter((element) => /^-?₹/.test(element.textContent.trim()));
    moneyNodes.forEach((element) => {
      element.classList.add('motion-number');
      previousMoney.set(element, moneyValue(element.textContent));
    });

    const updateBars = () => {
      const newNode = document.querySelector('#newTotalTax');
      const oldNode = document.querySelector('#oldTotalTax');
      if (!newNode || !oldNode) return;
      const values = [Math.abs(moneyValue(newNode.textContent)), Math.abs(moneyValue(oldNode.textContent))];
      const maximum = Math.max(...values);
      const cards = document.querySelectorAll('.regime-cards>div');
      cards.forEach((card, index) => {
        const width = maximum ? Math.max(6, values[index] / maximum * 100) : 0;
        card.style.setProperty('--liability-width', `${width}%`);
        card.classList.remove('is-lower-estimate');
      });
      const message = (document.querySelector('#bestRegime')?.textContent || '').toLowerCase();
      if (message.includes('new regime estimates lower')) cards[0]?.classList.add('is-lower-estimate');
      if (message.includes('old regime estimates lower')) cards[1]?.classList.add('is-lower-estimate');
    };

    const animateResults = () => {
      const targets = moneyNodes.map((element) => [element, moneyValue(element.textContent)]);
      targets.forEach(([element, target]) => {
        const start = previousMoney.get(element) || 0;
        animateMoney(element, start, target);
      });
      updateBars();
      resultSummary.classList.remove('is-result-updating');
      void resultSummary.offsetWidth;
      resultSummary.classList.add('is-result-updating');
    };

    form.addEventListener('submit', () => requestAnimationFrame(animateResults));
    document.querySelector('#resetCalculator')?.addEventListener('click', () => requestAnimationFrame(animateResults));
  };

  const setupEnquiry = () => {
    const form = document.querySelector('#itrForm');
    if (!form) return;
    form.querySelectorAll('input:not([type="checkbox"]),select,textarea').forEach((field) => {
      const update = () => {
        const hasValue = String(field.value || '').trim().length > 0;
        field.closest('label')?.classList.toggle('motion-field-ok', hasValue && field.checkValidity());
      };
      field.addEventListener('input', update, { passive: true });
      field.addEventListener('change', update, { passive: true });
    });

    const status = form.querySelector('#enquiryStatus');
    if (!status || !('MutationObserver' in window)) return;
    const reflectRealStatus = () => {
      const success = status.classList.contains('success');
      const failed = status.classList.contains('error') || status.classList.contains('handoff');
      const submitting = Boolean(status.textContent.trim()) && !success && !failed;
      form.classList.toggle('is-form-success', success);
      form.classList.toggle('is-submitting', submitting);
    };
    new MutationObserver(reflectRealStatus).observe(status, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      characterData: true,
      subtree: true
    });
    reflectRealStatus();
  };

  const setupConfirmation = () => {
    const card = document.querySelector('.confirmation-card');
    if (card) card.classList.add('motion-confirmed');
  };

  const setup = () => {
    try {
      root.classList.add('motion-r27-ready');
      setupHero();
      setupCards();
      setupStepTracks();
      setupChecklist();
      setupCalculator();
      setupEnquiry();
      setupConfirmation();
    } catch (error) {
      root.classList.remove('motion-r27-ready');
      console.warn('Optional ITR Desk motion layer could not start.', error);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
