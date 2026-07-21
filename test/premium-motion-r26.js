'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const home = read('index.html');
const about = read('about-ca-siddharth-bhatia.html');
const css = read('assets/premium-motion-r26.css');
const js = read('assets/premium-motion-r26.js');

for (const html of [home, about]) {
  assert(html.includes('assets/premium-motion-r26.css?v=20260721-r26'), 'Page does not load the cache-versioned premium motion CSS');
  assert(html.includes('assets/premium-motion-r26.js?v=20260721-r26'), 'Page does not load the cache-versioned premium motion runtime');
}

assert(css.includes('.motion-progress'), 'Scroll progress animation is missing');
assert(css.includes('.motion-reveal'), 'Scroll reveal styles are missing');
assert(css.includes('.motion-hero-item'), 'Hero entrance styles are missing');
assert(css.includes('@keyframes motionOrb'), 'Hero background movement is missing');
assert(css.includes('@keyframes portraitFloat'), 'Profile portrait movement is missing');
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion accessibility fallback is missing');
assert(css.includes('@media(max-width:760px)'), 'Mobile motion simplification is missing');
assert(!css.includes('transition:all'), 'Motion CSS must not animate every property');

assert(js.includes('IntersectionObserver'), 'Scroll-triggered motion does not use IntersectionObserver');
assert(js.includes('requestAnimationFrame'), 'Scroll animation is not frame-throttled');
assert(js.includes("prefers-reduced-motion: reduce"), 'Runtime does not respect reduced motion');
assert(js.includes("{ passive: true }"), 'Scroll listener is not passive');
assert(js.includes("'.clean-action-card'"), 'Action cards are not included in scroll reveal');
assert(js.includes("'.clean-service-card'"), 'Service cards are not included in scroll reveal');
assert(js.includes("'.lead-form'"), 'Enquiry form is not included in scroll reveal');
assert(!/https?:\/\//.test(js), 'Premium motion runtime should not load third-party code or tracking');

console.log('PASS premium hero, scroll, card, mobile and reduced-motion source checks');
