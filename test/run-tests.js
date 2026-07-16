'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class FakeElement {
  constructor(value = '0') {
    this.value = value;
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this.disabled = false;
    this.listeners = {};
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  scrollIntoView() {}
}

const moneyIds = ['salaryIncome','houseIncome','businessIncome','dividendIncome','otherIncome','agriculturalIncome','deduction80C','deduction80D','deductionNPS','otherOldDeductions','commonDeductions','stcg111A','stcg115AD','ltcg112A','ltcg112','propertyGainNoIndex','propertyGainIndexed','customCapitalGain','lotteryIncome','onlineGamingIncome','vdaIncome','unexplainedIncome','patentIncome','carbonCreditIncome','nriDividendIncome','nriInterestIncome','nriRoyaltyFtsIncome','otherSpecialIncome','otherSpecialIncome2','adjustedTotalIncome','amtCredit','relief89','foreignTaxRelief','interest234','lateFee','tdsPaid','tcsPaid','advanceTaxPaid','selfAssessmentPaid'];
const rateIds = ['customCapitalRate','otherSpecialRate','otherSpecialRate2'];
const resultSuffixes = ['NormalIncome','SpecialIncome','Taxable','NormalTax','SpecialTax','Rebate','Surcharge','Cess','AmtIncrease','GrossTax','Reliefs','InterestFee','TaxesPaid','Balance'];
const ids = new Map();
function element(id, value = '0') { if (!ids.has(id)) ids.set(id, new FakeElement(value)); return ids.get(id); }

moneyIds.forEach(id => element(id, '0'));
rateIds.forEach(id => element(id, id === 'customCapitalRate' ? '12.5' : id === 'otherSpecialRate' ? '20' : '10'));
element('taxCalculator');element('resetCalculator');element('calcError');element('specialBreakdown');element('calculationWarnings');element('warningList');element('bestRegime');element('estimatedSaving');element('positionRegime');element('positionLabel');element('finalPosition');element('newTotalTax');element('oldTotalTax');
resultSuffixes.forEach(suffix => { element('new' + suffix); element('old' + suffix); });
element('assesseeType','individual');element('residentialStatus','resident');element('taxpayerAge','below60');element('customCapitalSurcharge','cap15');element('otherSpecialSurcharge','general');element('otherSpecialSurcharge2','general');

global.document = {
  getElementById: id => element(id),
  querySelector: () => new FakeElement()
};
global.window = {};
require('../assets/calculator.js');

function reset(overrides = {}) {
  moneyIds.forEach(id => { element(id).value = '0'; });
  element('customCapitalRate').value = '12.5';element('otherSpecialRate').value = '20';element('otherSpecialRate2').value = '10';
  element('assesseeType').value = 'individual';element('residentialStatus').value = 'resident';element('taxpayerAge').value = 'below60';
  element('customCapitalSurcharge').value = 'cap15';element('otherSpecialSurcharge').value = 'general';element('otherSpecialSurcharge2').value = 'general';
  Object.entries(overrides).forEach(([id,value]) => { element(id).value = String(value); });
  const valid = window.ITRDeskCalculator.recalculate();
  return { valid, computation: window.ITRDeskCalculator.getComputation() };
}

let result = reset({ salaryIncome: 1275000 });
assert.equal(result.valid, true);
assert.equal(result.computation.newRegime.totalIncome, 1200000);
assert.equal(result.computation.newRegime.grossTax, 0);

result = reset({ salaryIncome: 1300000 });
assert.equal(result.computation.newRegime.totalIncome, 1225000);
assert.equal(result.computation.newRegime.netTax, 26000);

result = reset({ salaryIncome: 550000 });
assert.equal(result.computation.oldRegime.totalIncome, 500000);
assert.equal(result.computation.oldRegime.grossTax, 0);

result = reset({ otherIncome: 400000, ltcg112A: 225000 });
const section112A = result.computation.newRegime.components.find(component => component.key === '112A');
assert.equal(section112A.amount, 100000);
assert.equal(section112A.tax, 12500);
assert.equal(result.computation.newRegime.grossTax, 13000);

result = reset({ salaryIncome: 350000, taxpayerAge: '60to79' });
assert.equal(result.computation.oldRegime.normalIncome, 300000);
assert.equal(result.computation.oldRegime.grossTax, 0);

result = reset({ assesseeType: 'huf', salaryIncome: 100000 });
assert.equal(result.valid, false);
assert.match(element('calcError').textContent, /HUF cannot report salary/);

result = reset({ customCapitalRate: 101 });
assert.equal(result.valid, false);
assert.match(element('calcError').textContent, /between 0% and 100%/);

function assertEmbeddedProfilePhoto(filename, minimumCount) {
  const html = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  const matches = [...html.matchAll(/src="data:image\/jpeg;base64,([^\"]+)"/g)];
  assert.ok(matches.length >= minimumCount, `${filename} must contain ${minimumCount} embedded profile photo(s)`);
  for (const match of matches) {
    const bytes = Buffer.from(match[1], 'base64');
    assert.ok(bytes.length > 5000, `${filename} profile photo is unexpectedly small`);
    assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff', `${filename} profile photo is not a valid JPEG`);
  }
  assert.ok(!html.includes('src="assets/ca-siddharth-bhatia-profile'), `${filename} must not depend on a separately served profile image`);
}

assertEmbeddedProfilePhoto('index.html', 1);
assertEmbeddedProfilePhoto('about-ca-siddharth-bhatia.html', 2);

console.log('PASS browser calculator AY 2026-27 boundary and validation tests');
console.log('PASS embedded profile photo availability and JPEG integrity tests');
