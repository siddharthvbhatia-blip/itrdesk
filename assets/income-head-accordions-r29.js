(() => {
  'use strict';

  const form = document.querySelector('#taxCalculator');
  if (!form) return;

  const accordions = [...form.querySelectorAll('.income-head-accordion')];

  /*
   * Values applied by the local document importer fire a change event.
   * Reveal the relevant income head so the user can review those values.
   */
  form.addEventListener('change', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) return;
    const accordion = field.closest('.income-head-accordion');
    if (accordion && !accordion.open && !event.isTrusted) accordion.open = true;
  });

  document.querySelector('#resetCalculator')?.addEventListener('click', () => {
    window.setTimeout(() => {
      accordions.forEach((accordion) => {
        accordion.open = false;
      });
    }, 0);
  });
})();
