'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const endpoint = 'https://itrdesk-payment-backend.vercel.app/api/enquiry';
const directProvider = 'https://formsubmit.co/ajax/siddharth.v.bhatia@gmail.com';
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
    let retryDirectRequests = 0;
    await retryPage.route(endpoint, async route => {
      retryRequests += 1;
      if (retryRequests === 1) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accepted: true, reference: 'ENQ-20260718-ABC123' }) });
      }
    });
    await retryPage.route(directProvider, async route => {
      retryDirectRequests += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    await retryPage.goto(`${base}/index.html?enquiry-test=retry`, { waitUntil: 'networkidle' });
    await fillAndSubmit(retryPage, 'Retry Test');
    await retryPage.locator('#enquiryStatus.success').waitFor({ timeout: 10000 });
    const retryText = await retryPage.locator('#enquiryStatus').innerText();
    const retryFallbackHidden = await retryPage.locator('#enquiryFallback').evaluate(element => element.hidden);
    assert.equal(retryRequests, 2, `Expected two backend attempts, received ${retryRequests}`);
    assert.equal(retryDirectRequests, 0, 'Direct provider should not be called after backend retry succeeds');
    assert.match(retryText, /ENQ-20260718-ABC123/);
    assert.equal(retryFallbackHidden, true, 'WhatsApp should stay hidden after backend recovery');
    await retryPage.screenshot({ path: path.join(outputDir, 'enquiry-retry-success-r18.png'), fullPage: true });

    const directPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let directBackendRequests = 0;
    let directRequests = 0;
    await directPage.route(endpoint, async route => {
      directBackendRequests += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
    });
    await directPage.route(directProvider, async route => {
      directRequests += 1;
      const submitted = JSON.parse(route.request().postData());
      assert.equal(submitted.mobile, '9876543210');
      assert.equal(submitted.broad_case, 'F&O / Intraday / Trading');
      assert.match(submitted.reference, /^ENQ-[0-9]{8}-[A-F0-9]{6}$/);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'submitted' }) });
    });
    await directPage.goto(`${base}/index.html?enquiry-test=direct`, { waitUntil: 'networkidle' });
    await fillAndSubmit(directPage, 'Direct Provider Test');
    await directPage.locator('#enquiryStatus.success').waitFor({ timeout: 10000 });
    const directText = await directPage.locator('#enquiryStatus').innerText();
    const directFallbackHidden = await directPage.locator('#enquiryFallback').evaluate(element => element.hidden);
    assert.equal(directBackendRequests, 2, `Expected two backend attempts before direct fallback, received ${directBackendRequests}`);
    assert.equal(directRequests, 1, `Expected one direct-provider attempt, received ${directRequests}`);
    assert.match(directText, /ENQ-[0-9]{8}-[A-F0-9]{6}/);
    assert.equal(directFallbackHidden, true, 'WhatsApp should remain hidden after direct delivery succeeds');
    await directPage.screenshot({ path: path.join(outputDir, 'enquiry-direct-success-r18.png'), fullPage: true });

    const failPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let failedBackendRequests = 0;
    let failedDirectRequests = 0;
    await failPage.route(endpoint, async route => {
      failedBackendRequests += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
    });
    await failPage.route(directProvider, async route => {
      failedDirectRequests += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false }) });
    });
    await failPage.goto(`${base}/index.html?enquiry-test=fallback`, { waitUntil: 'networkidle' });
    await fillAndSubmit(failPage, 'WhatsApp Fallback Test');
    await failPage.locator('#enquiryStatus.error').waitFor({ timeout: 10000 });
    const failureText = await failPage.locator('#enquiryStatus').innerText();
    const fallbackVisible = await failPage.locator('#enquiryFallback').isVisible();
    assert.equal(failedBackendRequests, 2, `Expected two backend attempts before final fallback, received ${failedBackendRequests}`);
    assert.equal(failedDirectRequests, 1, `Expected one direct-provider attempt before WhatsApp, received ${failedDirectRequests}`);
    assert.match(failureText, /temporarily unavailable/i);
    assert.doesNotMatch(failureText, /not configured/i);
    assert.equal(fallbackVisible, true, 'WhatsApp should appear only after backend and direct delivery fail');
    await failPage.screenshot({ path: path.join(outputDir, 'enquiry-fallback-r18.png'), fullPage: true });

    console.log('PASS backend transient retry without unnecessary fallback');
    console.log('PASS direct browser email delivery after backend failure');
    console.log('PASS WhatsApp appears only after all automatic delivery routes fail');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
