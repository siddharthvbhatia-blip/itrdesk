'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const loader = read('assets/script.js');
const js = read('assets/professional-experience-r34.js');
const css = read('assets/professional-experience-r34.css');
const vcard = read('ca-siddharth-bhatia.vcf');

assert(loader.includes('professional-experience-r34.css?v=20260727-r34'), 'R34 stylesheet loader is missing');
assert(loader.includes('professional-experience-r34.js?v=20260727-r34'), 'R34 script loader is missing');

for (const feature of [
  'buildHeroJourney',
  'setupCaseExperience',
  'setupItrProgress',
  'addCalculatorComparison',
  'addDocumentScanners',
  'addOfficeTrustSection',
  'addServiceStandards'
]) assert(js.includes(feature), `R34 feature is missing: ${feature}`);

for (const selector of [
  '.itr-journey',
  '.case-experience-preview',
  '.regime-visual-comparison',
  '.document-scan-card',
  '.itr-progress-card',
  '.office-trust-card',
  '.service-standard-grid',
  '.professional-action',
  '@media (prefers-reduced-motion: reduce)'
]) assert(css.includes(selector), `R34 visual rule is missing: ${selector}`);

assert(js.includes('Illustrative workflow — each case is assessed on its facts.'), 'Hero workflow lacks an appropriate limitation');
assert(js.includes('Final applicability depends on verified facts and current law.'), 'Tax chart lacks an indicative-result limitation');
assert(js.includes('review every proposed figure before applying it'), 'Document scanner does not require user review');
assert(js.includes('No fabricated ratings or guaranteed-outcome claims are displayed.'), 'Ethical service-standard statement is missing');
assert(!/guaranteed refund|best ca|no\. ?1 ca|100% refund|maximum refund guaranteed/i.test(js + css), 'Prohibited promotional or guaranteed-outcome claim was introduced');
assert(!/reviewed by ca siddharth bhatia.*seal|verification seal/i.test(js + css), 'Excluded professional verification seal was introduced');
assert(!/testimonial|client said|five-star|5-star/i.test(js + css), 'Unverified testimonial content was introduced');
assert(!/adsbygoogle|pagead2\.googlesyndication|google_ad_client/i.test(js + css), 'Third-party advertising code was introduced');

assert(vcard.includes('FN:CA Siddharth Bhatia'), 'Professional contact card name is missing');
assert(vcard.includes('ICAI Membership No. 438248'), 'Professional contact card membership detail is missing');
assert(vcard.includes('444\\, Vikram Tower'), 'Professional contact card office address is missing');

console.log('PASS R34 professional graphics, interactive case selector, progress system, tax chart, local document animation and ethical safeguards');
