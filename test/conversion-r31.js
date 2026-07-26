'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const home = read('index.html');
const advanced = read('itr-preparation-json.html');
const css = read('assets/conversion-r31.css');
const js = read('assets/conversion-r31.js');

assert(home.includes('Professional ITR Filing and Tax Review in Indore'), 'Conversion-focused homepage headline is missing');
assert(home.includes('Get my ITR case reviewed'), 'Primary ITR review CTA is missing');
assert(home.includes('View office location'), 'Office-location CTA is missing');
assert((home.match(/data-case-choice=/g) || []).length === 4, 'Homepage should contain four case-selection choices');

for (const item of [
  'Appropriate ITR-form assessment',
  'AIS/TIS/26AS reconciliation',
  'Income-head and risk review',
  'Tax computation',
  'Draft confirmation before filing',
  'Filing acknowledgement after completion'
]) {
  assert(home.includes(item), `Homepage lost professional-scope item: ${item}`);
}

assert(home.includes('Accept and pay securely'), 'Private engagement and payment step is missing');
assert(home.includes('name="name"') && home.includes('name="phone"') && home.includes('name="caseType"'), 'Short enquiry form lost required fields');
assert(!home.includes('name="email"') && !home.includes('name="city"'), 'Sensitive or unnecessary first-contact fields returned');
assert(home.includes('name="website"'), 'Enquiry honeypot field is missing');
assert((home.match(/<details\b/g) || []).length === 3, 'Homepage should retain exactly three FAQs');

assert(advanced.includes('Advanced ITR Data Preparation Tool'), 'Advanced-tool positioning is missing');
assert(advanced.includes('data-public-quote-only="true"'), 'Public quote-only protection is missing');
assert(advanced.includes('Request scope and fee quote'), 'Private scope CTA is missing');
assert(advanced.includes('legacy-checkout" hidden'), 'Legacy checkout must remain hidden for compatibility');
assert(!advanced.includes('checkout-disclosure'), 'Public checkout disclosure should not remain visible');
assert(!advanced.includes('bundle-paywall'), 'Public payment panel should not remain visible');

for (const source of [home, advanced]) {
  assert(!/adsbygoogle|pagead2\.googlesyndication|google_ad_client/i.test(source), 'Third-party advertising code must not be added to the professional website');
  assert(source.includes('assets/conversion-r31.css?v=20260726-r31'), 'R31 conversion stylesheet is missing');
  assert(source.includes('assets/conversion-r31.js?v=20260726-r31'), 'R31 conversion script is missing');
}

assert(css.includes('.case-choice-grid') && css.includes('.included-panel') && css.includes('.legacy-checkout[hidden]'), 'Conversion stylesheet lost required components');
assert(js.includes('data-case-choice') && js.includes('stopImmediatePropagation'), 'Conversion script lost case selection or quote-only protection');

console.log('PASS conversion-focused homepage, private quote flow and no-advertising safeguards');
