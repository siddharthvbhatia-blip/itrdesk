'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const backend = 'https://itrdesk-payment-backend.vercel.app/api/enquiry';
const nativeProvider = 'https://formsubmit.co/siddharth.v.bhatia@gmail.com';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function fillAndSubmit(page, name) {
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="phone"]').fill('9876543210');
  await page.locator('select[name="caseType"]').selectOption({ label: 'F&O / Intraday / Trading' });
  await page.locator('textarea[name="note"]').fill('Browser delivery test.');
  await page.locator('input[name="consent"]').check();
  await page.locator('#itrForm button[type="submit"]').click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const retryPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let retryBackend = 0;
    let retryNative = 0;
    await retryPage.route(backend, async route => {
      retryBackend += 1;
      if (retryBackend === 1) await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
      else await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accepted: true, reference: 'ENQ-20260718-ABC123' }) });
    });
    await retryPage.route(nativeProvider, async route => { retryNative += 1; await route.abort(); });
    await retryPage.goto(`${base}/index.html?enquiry-test=r20-retry`, { waitUntil: 'networkidle' });
    assert.equal(await retryPage.locator('#itrForm').getAttribute('data-reliable-enquiry'), 'r20');
    await fillAndSubmit(retryPage, 'Backend Retry Test');
    await retryPage.locator('#enquiryStatus.success').waitFor({ timeout: 10000 });
    assert.equal(retryBackend, 2);
    assert.equal(retryNative, 0);
    assert.match(await retryPage.locator('#enquiryStatus').innerText(), /ENQ-20260718-ABC123/);
    assert.equal(await retryPage.locator('#enquiryFallback').evaluate(element => element.hidden), true);

    const nativePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let nativeBackend = 0;
    let nativePosts = 0;
    await nativePage.route(backend, async route => {
      nativeBackend += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
    });
    await nativePage.route(nativeProvider, async route => {
      nativePosts += 1;
      assert.equal(route.request().method(), 'POST');
      const fields = Object.fromEntries(new URLSearchParams(route.request().postData() || ''));
      assert.equal(fields.mobile, '9876543210');
      assert.equal(fields.broad_case, 'F&O / Intraday / Trading');
      assert.match(fields.reference, /^ENQ-[0-9]{8}-[A-F0-9]{6}$/);
      assert.match(fields._next, /enquiry-received\.html\?reference=ENQ-/);
      await route.fulfill({ status: 302, headers: { Location: fields._next }, body: '' });
    });
    await nativePage.goto(`${base}/index.html?enquiry-test=r20-native`, { waitUntil: 'networkidle' });
    await fillAndSubmit(nativePage, 'Native Delivery Test');
    await nativePage.locator('#enquiryStatus.success').waitFor({ timeout: 12000 });
    const nativeText = await nativePage.locator('#enquiryStatus').innerText();
    assert.equal(nativeBackend, 2);
    assert.equal(nativePosts, 1);
    assert.match(nativeText, /ENQ-[0-9]{8}-[A-F0-9]{6}/);
    assert.equal(await nativePage.locator('#enquiryFallback').evaluate(element => element.hidden), true);
    await nativePage.screenshot({ path: path.join(outputDir, 'enquiry-native-success-r20.png'), fullPage: true });

    const failPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await failPage.addInitScript(() => { window.ITRDeskEnquiryNativeTimeout = 700; });
    let failedBackend = 0;
    let failedNative = 0;
    await failPage.route(backend, async route => {
      failedBackend += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Automatic enquiry delivery is temporarily unavailable.' }) });
    });
    await failPage.route(nativeProvider, async route => { failedNative += 1; await route.abort('failed'); });
    await failPage.goto(`${base}/index.html?enquiry-test=r20-final-fallback`, { waitUntil: 'networkidle' });
    await fillAndSubmit(failPage, 'Final Fallback Test');
    await failPage.locator('#enquiryStatus.error').waitFor({ timeout: 10000 });
    assert.equal(failedBackend, 2);
    assert.equal(failedNative, 1);
    assert.match(await failPage.locator('#enquiryStatus').innerText(), /temporarily unavailable/i);
    assert.equal(await failPage.locator('#enquiryFallback').isVisible(), true);
    await failPage.screenshot({ path: path.join(outputDir, 'enquiry-final-fallback-r20.png'), fullPage: true });

    console.log('PASS backend retry succeeds without native fallback');
    console.log('PASS no-CORS native POST confirms through the same-origin return page');
    console.log('PASS WhatsApp appears only after backend and native delivery fail');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
