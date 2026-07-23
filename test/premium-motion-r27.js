'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const css = read('assets/premium-motion-r27.css');
const js = read('assets/premium-motion-r27.js');
const pages = [
  'index.html',
  'about-ca-siddharth-bhatia.html',
  'calculator.html',
  'checklist.html',
  'thank-you.html'
];

for (const page of pages) {
  const html = read(page);
  assert(
    html.includes('assets/premium-motion-r27.css?v=20260723-r27'),
    `${page} does not load the cache-versioned R27 interaction stylesheet`
  );
  assert(
    html.includes('assets/premium-motion-r27.js?v=20260723-r27'),
    `${page} does not load the cache-versioned R27 interaction runtime`
  );
}

for (const page of ['calculator.html', 'checklist.html']) {
  assert(
    read(page).includes('assets/blue-white-r22.css?v=20260721-r22'),
    `${page} does not retain the professional blue-and-white theme`
  );
}

assert(css.includes('.motion-hero-symbols'), 'Soft hero symbol animation is missing');
assert(css.includes('.motion-card::before'), 'Interactive card lighting is missing');
assert(css.includes('.motion-step-track::after'), 'Process-line fill animation is missing');
assert(css.includes('.motion-check-item.is-check-visible'), 'Checklist tick animation is missing');
assert(css.includes('.regime-cards>div::after'), 'Calculator comparison bars are missing');
assert(css.includes('.enquiry-status.success::before'), 'Real enquiry success feedback is missing');
assert(css.includes('.confirmation-card.motion-confirmed'), 'Thank-you confirmation animation is missing');
assert(css.includes('@media(max-width:950px)'), 'Tablet workflow layout safeguard is missing');
assert(css.includes('@media(max-width:760px)'), 'Mobile animation simplification is missing');
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion accessibility fallback is missing');
assert(!css.includes('transition:all'), 'R27 must not animate every CSS property');

assert(js.includes('IntersectionObserver'), 'Viewport-triggered R27 motion is missing');
assert(js.includes('requestAnimationFrame'), 'Calculator number animation is not frame-driven');
assert(js.includes('MutationObserver'), 'Enquiry feedback is not tied to actual status changes');
assert(js.includes("status.classList.contains('success')"), 'Success animation is not based on the real success state');
assert(js.includes("document.querySelector('#taxCalculator')"), 'Calculator animation setup is missing');
assert(js.includes("document.querySelector('#itrForm')"), 'Enquiry animation setup is missing');
assert(js.includes("document.querySelector('.confirmation-card')"), 'Confirmation-page animation setup is missing');
assert(js.includes('prefers-reduced-motion: reduce'), 'Runtime does not respect reduced-motion preference');
assert(!js.includes('fetch('), 'Optional motion runtime must never submit or retrieve data');
assert(!/https?:\/\//.test(js), 'Optional motion runtime must not load third-party code or tracking');

console.log('PASS R27 hero, cards, process, checklist, calculator, enquiry and reduced-motion source checks');
