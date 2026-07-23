'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const stylesheet = 'assets/professional-visuals-r28.css?v=20260723-r28';
const css = read('assets/professional-visuals-r28.css');
const index = read('index.html');

const visuals = [
  {
    asset: 'assets/tax-calculator-visual-r28.webp',
    page: 'calculator.html',
    alt: 'Laptop, calculator, rupee coin and tax document'
  },
  {
    asset: 'assets/itr-review-visual-r28.webp',
    page: 'itr-preparation-json.html',
    alt: 'Tax documents under review with a magnifying glass and verification shield'
  },
  {
    asset: 'assets/document-checklist-visual-r28.webp',
    page: 'checklist.html',
    alt: 'Organised filing checklist in a secure document folder'
  }
];

for (const page of ['index.html', ...visuals.map((visual) => visual.page)]) {
  assert(
    read(page).includes(stylesheet),
    `${page} does not load the cache-versioned professional visual stylesheet`
  );
}

for (const visual of visuals) {
  const asset = fs.readFileSync(path.join(root, visual.asset));
  const page = read(visual.page);

  assert(asset.length > 10000, `${visual.asset} is unexpectedly small`);
  assert(asset.length < 250000, `${visual.asset} is not sufficiently web-optimised`);
  assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF', `${visual.asset} is not a WebP asset`);
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP', `${visual.asset} has an invalid WebP signature`);

  assert(index.includes(`src="${visual.asset}"`), `Homepage does not use ${visual.asset}`);
  assert(page.includes(`src="${visual.asset}"`), `${visual.page} does not use its matching visual`);
  assert(index.includes(`alt="${visual.alt}"`), `Homepage alt text is missing for ${visual.asset}`);
  assert(page.includes(`alt="${visual.alt}"`), `${visual.page} alt text is missing for ${visual.asset}`);
  assert(
    index.includes(`src="${visual.asset}" alt="${visual.alt}" width="1200" height="900" loading="lazy" decoding="async"`),
    `Homepage visual ${visual.asset} is missing stable dimensions or deferred loading`
  );
  assert(
    page.includes(`src="${visual.asset}" alt="${visual.alt}" width="1200" height="900" decoding="async" fetchpriority="high"`),
    `${visual.page} hero visual is missing stable dimensions or high-priority loading`
  );
}

assert(index.match(/class="clean-action-card visual-action-card"/g).length === 3, 'Homepage does not contain three visual action cards');
assert(css.includes('.page-hero-visual-grid'), 'Responsive hero visual grid is missing');
assert(css.includes('.professional-hero-visual'), 'Professional hero visual treatment is missing');
assert(css.includes('.visual-trust-label'), 'Context label treatment is missing');
assert(css.includes('@media (hover: hover) and (pointer: fine)'), 'Hover animation is not limited to fine pointers');
assert(css.includes('@media (max-width: 760px)'), 'Mobile visual layout safeguard is missing');
assert(css.includes('@media (max-width: 640px)'), 'Compact phone card layout is missing');
assert(css.includes('grid-template-areas:'), 'Phone cards do not use a height-efficient visual layout');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion visual fallback is missing');
assert(!css.includes('transition: all'), 'Visual stylesheet must not animate every CSS property');

const reviewPage = read('itr-preparation-json.html');
assert(reviewPage.includes('class="json-hero-side"'), 'ITR review visual is not grouped safely with the security card');
assert(reviewPage.includes('assets/blue-white-r22.css?v=20260721-r22'), 'ITR review page does not use the matching blue-white visual system');

console.log('PASS R28 original imagery, responsive placement, loading, accessibility and WebP optimisation checks');
