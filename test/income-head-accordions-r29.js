'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const calculator = fs.readFileSync(path.join(root, 'calculator.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets', 'income-head-accordions-r29.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets', 'income-head-accordions-r29.js'), 'utf8');

assert(
  calculator.includes('assets/income-head-accordions-r29.css?v=20260723-r29b'),
  'Calculator does not load the cache-versioned R29 accordion stylesheet'
);
assert(
  calculator.includes('assets/income-head-accordions-r29.js?v=20260723-r29'),
  'Calculator does not load the cache-versioned R29 accordion behavior'
);

const incomeHeads = [
  ['taxpayer', 'Taxpayer details'],
  ['normal-rate', 'Normal-rate income'],
  ['capital-gains', 'Capital gains at special rates'],
  ['other-special', 'Other special-rate income'],
  ['final-liability', 'AMT, reliefs and taxes paid']
];

assert.equal(
  (calculator.match(/class="income-head-accordion/g) || []).length,
  incomeHeads.length,
  'Calculator must contain exactly five numbered income-head accordions'
);

for (const [key, title] of incomeHeads) {
  assert(
    calculator.includes(`data-income-head="${key}"`),
    `Calculator is missing the ${key} accordion`
  );
  assert(
    calculator.includes(`<strong>${title}</strong>`),
    `Calculator is missing the visible ${title} heading`
  );
}

assert(
  !/<details class="income-head-accordion"[^>]*\sopen(?:\s|>)/.test(calculator),
  'Income-head accordions must all be closed initially'
);
assert(
  !calculator.includes('<summary>Capital-gain inputs</summary>'),
  'Redundant capital-gain inner dropdown remains'
);
assert(
  !calculator.includes('<summary>Special-income inputs</summary>'),
  'Redundant special-income inner dropdown remains'
);

for (const id of [
  'salaryIncome',
  'houseIncome',
  'businessIncome',
  'stcg111A',
  'ltcg112A',
  'lotteryIncome',
  'vdaIncome',
  'tdsPaid',
  'selfAssessmentPaid'
]) {
  assert(calculator.includes(`id="${id}"`), `Calculator input ${id} was lost during accordion conversion`);
}

assert(css.includes('.income-head-summary::after'), 'Triangle indicator styling is missing');
assert(css.includes('.income-head-accordion[open]'), 'Open-state styling is missing');
assert(css.includes('.income-head-accordion:not([open]) > .income-head-body'), 'Closed-state content hiding is missing');
assert(css.includes('.income-head-summary:focus-visible'), 'Keyboard focus styling is missing');
assert(css.includes('@media (max-width: 640px)'), 'Phone accordion layout is missing');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion fallback is missing');
assert(!css.includes('transition: all'), 'Accordion styling must not animate every CSS property');
assert(js.includes("closest('.income-head-accordion')"), 'Imported values do not reveal their relevant income head');
assert(js.includes('!event.isTrusted'), 'Normal user changes must not unexpectedly alter another accordion');
assert(js.includes('accordion.open = false'), 'Reset does not restore the initial collapsed state');
assert(!js.includes('fetch('), 'Accordion behavior must not make network requests');

console.log('PASS R29 closed income-head accordions, import review, reset, triangle, keyboard and mobile checks');
