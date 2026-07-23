'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const output = path.join(__dirname, '..', 'test-results');

async function verify(viewport, label) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${base}/calculator.html?accordion-check=${Date.now()}`, { waitUntil: 'load' });

    const initial = await page.evaluate(() => {
      const accordions = [...document.querySelectorAll('.income-head-accordion')];
      return {
        count: accordions.length,
        openCount: accordions.filter((item) => item.open).length,
        titles: accordions.map((item) => item.querySelector('.income-head-copy strong')?.textContent.trim()),
        hiddenInputVisible: Boolean(document.querySelector('#stcg111A')?.getClientRects().length),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    });

    assert.equal(initial.count, 5, `${label}: expected five income-head accordions`);
    assert.equal(initial.openCount, 0, `${label}: all income heads must start closed`);
    assert.equal(initial.hiddenInputVisible, false, `${label}: closed income-head fields remain visible`);
    assert(initial.titles.includes('Capital gains at special rates'), `${label}: capital-gains heading is missing`);
    assert(initial.scrollWidth <= initial.innerWidth + 2, `${label}: accordion layout causes horizontal overflow`);

    const capital = page.locator('[data-income-head="capital-gains"]');
    await capital.locator('summary').click();
    assert(await capital.evaluate((item) => item.open), `${label}: capital-gains heading did not open`);
    assert(await page.locator('#stcg111A').isVisible(), `${label}: capital-gain inputs did not become visible`);

    await page.locator('#stcg111A').fill('100000');
    await capital.locator('summary').click();
    assert.equal(await page.locator('#stcg111A').inputValue(), '1,00,000', `${label}: entered capital gain was not preserved after closing`);

    const normal = page.locator('[data-income-head="normal-rate"]');
    await normal.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert(await normal.evaluate((item) => item.open), `${label}: keyboard Enter did not open normal-rate income`);
    await page.locator('#salaryIncome').fill('1000000');

    await page.locator('#taxCalculator button[type="submit"]').click();
    await page.waitForTimeout(250);
    assert.notEqual(
      (await page.locator('#bestRegime').textContent()).trim(),
      'Enter your income',
      `${label}: accordion fields did not reach the calculator`
    );

    await capital.locator('summary').click();
    await page.locator('#taxCalculator #resetCalculator').click();
    await page.waitForTimeout(50);

    const reset = await page.evaluate(() => ({
      openCount: [...document.querySelectorAll('.income-head-accordion')].filter((item) => item.open).length,
      salary: document.querySelector('#salaryIncome')?.value,
      capital: document.querySelector('#stcg111A')?.value
    }));
    assert.equal(reset.openCount, 0, `${label}: reset did not collapse the income heads`);
    assert.equal(reset.salary, '0', `${label}: reset did not clear salary income`);
    assert.equal(reset.capital, '0', `${label}: reset did not clear capital gains`);

    fs.mkdirSync(output, { recursive: true });
    await page.screenshot({
      path: path.join(output, `income-head-accordions-${label}.png`),
      fullPage: false
    });
  } finally {
    await browser.close();
  }
}

(async () => {
  await verify({ width: 1366, height: 900 }, 'desktop');
  await verify({ width: 390, height: 844 }, 'mobile');
  console.log('PASS R29 desktop/mobile closed state, triangle menu, keyboard, value retention, calculation and reset');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
