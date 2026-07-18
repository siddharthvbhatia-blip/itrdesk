'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const endpoint = 'https://itrdesk-payment-backend.vercel.app/api/enquiry';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function fillAndSubmit(page, name) {
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="phone"]').fill('9876543210');
  await page.locator('select[name="caseType"]').selectOption({ label: 'F&O / Intraday / Trading' });
  await page.locator('textarea[name="note"]').fill('Browser reliability test.');
  await page.locator('input[name="consent"]').check();
  await page.locator('#itrForm button[type="submit"]').click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const retryPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let retryRequests = 0;
    await retryPage.route(endpoint, async route => {
      retryRequests += 1;
      if (retryRequests === 1) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accepted: true, reference: 'ENQ-20260718-ABC123' }) });
      }
    });
    await retryPage.goto(`${base}/index.html?enquiry-test=retry`, { waitUntil: 'networkidle' });
    await fillAndSubmit(retryPage, 'Retry Test');
    await retryPage.locator('#enquiryStatus.success').waitFor({ timeout: 8000 });
    const successText = await retryPage.locator('#enquiryStatus').innerText();
    const fallbackHidden = await retryPage.locator('#enquiryFallback').evaluate(element => element.hidden);
    assert.equal(retryRequests, 2, `Expected two automatic delivery attempts, received ${retryRequests}`);
    assert.match(successText, /ENQ-20260718-ABC123/);
    assert.equal(fallbackHidden, true, 'WhatsApp fallback should stay hidden after retry succeeds');
    await retryPage.screenshot({ path: path.join(outputDir, 'enquiry-retry-success-r18.png'), fullPage: true });

    const failPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let failedRequests = 0;
    await failPage.route(endpoint, async route => {
      failedRequests += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
    });
    await failPage.goto(`${base}/index.html?enquiry-test=fallback`, { waitUntil: 'networkidle' });
    await fillAndSubmit(failPage, 'Fallback Test');
    await failPage.locator('#enquiryStatus.error').waitFor({ timeout: 8000 });
    const failureText = await failPage.locator('#enquiryStatus').innerText();
    const fallbackVisible = await failPage.locator('#enquiryFallback').isVisible();
    assert.equal(failedRequests, 2, `Expected two automatic attempts before fallback, received ${failedRequests}`);
    assert.match(failureText, /temporarily unavailable/i);
    assert.doesNotMatch(failureText, /not configured/i);
    assert.equal(fallbackVisible, true, 'WhatsApp fallback should be visible only after both automatic attempts fail');
    await failPage.screenshot({ path: path.join(outputDir, 'enquiry-fallback-r18.png'), fullPage: true });

    console.log('PASS browser retries transient enquiry delivery once');
    console.log('PASS browser hides WhatsApp after automatic recovery');
    console.log('PASS browser shows generic fallback only after two failures');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
