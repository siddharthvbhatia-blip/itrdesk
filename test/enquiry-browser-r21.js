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
    let retryCalls = 0;
    await retryPage.route(endpoint, async route => {
      retryCalls += 1;
      if (retryCalls === 1) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Secure delivery is temporarily unavailable.' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accepted: true, reference: 'ENQ-20260718-ABC123' }) });
      }
    });
    await retryPage.goto(`${base}/index.html?enquiry-test=r21-retry`, { waitUntil: 'networkidle' });
    assert.equal(await retryPage.locator('#itrForm').getAttribute('data-reliable-enquiry'), 'r21');
    await fillAndSubmit(retryPage, 'Backend Retry Test');
    await retryPage.locator('#enquiryStatus.success').waitFor({ timeout: 10000 });
    assert.equal(retryCalls, 2);
    assert.match(await retryPage.locator('#enquiryStatus').innerText(), /ENQ-20260718-ABC123/);
    assert.equal(await retryPage.locator('#enquiryFallback').evaluate(element => element.hidden), true);

    const handoffPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await handoffPage.addInitScript(() => { window.ITRDeskDisableAutoWhatsApp = true; });
    let handoffCalls = 0;
    await handoffPage.route(endpoint, async route => {
      handoffCalls += 1;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Secure delivery is temporarily unavailable.' }) });
    });
    await handoffPage.goto(`${base}/index.html?enquiry-test=r21-handoff`, { waitUntil: 'networkidle' });
    await fillAndSubmit(handoffPage, 'WhatsApp Handoff Test');
    await handoffPage.locator('#enquiryStatus.handoff').waitFor({ timeout: 10000 });
    const handoffText = await handoffPage.locator('#enquiryStatus').innerText();
    const handoffHref = await handoffPage.locator('#enquiryFallback').getAttribute('href');
    assert.equal(handoffCalls, 2);
    assert.match(handoffText, /Opening WhatsApp with your prepared enquiry/);
    assert.match(handoffText, /WA-[0-9]{8}-[A-F0-9]{6}/);
    assert.match(handoffText, /Tap Send there to complete it/);
    assert.equal(await handoffPage.locator('#enquiryFallback').isVisible(), true);
    assert.ok(handoffHref.startsWith('https://wa.me/917879857126?text='));
    const decodedMessage = decodeURIComponent(new URL(handoffHref).searchParams.get('text'));
    assert.match(decodedMessage, /Reference: WA-[0-9]{8}-[A-F0-9]{6}/);
    assert.match(decodedMessage, /Name: WhatsApp Handoff Test/);
    assert.match(decodedMessage, /Broad case: F&O \/ Intraday \/ Trading/);
    assert.doesNotMatch(handoffText, /not configured/i);
    await handoffPage.screenshot({ path: path.join(outputDir, 'enquiry-whatsapp-handoff-r21.png'), fullPage: true });

    const validationPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let validationCalls = 0;
    await validationPage.route(endpoint, async route => {
      validationCalls += 1;
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Please remove PAN, passwords, OTPs or PINs from the enquiry note.' }) });
    });
    await validationPage.goto(`${base}/index.html?enquiry-test=r21-validation`, { waitUntil: 'networkidle' });
    await fillAndSubmit(validationPage, 'Validation Test');
    await validationPage.locator('#enquiryStatus.error').waitFor({ timeout: 8000 });
    assert.equal(validationCalls, 1);
    assert.match(await validationPage.locator('#enquiryStatus').innerText(), /Please remove PAN/);
    assert.equal(await validationPage.locator('#enquiryFallback').evaluate(element => element.hidden), true);

    console.log('PASS secure backend retry and successful reference');
    console.log('PASS prepared WhatsApp handoff with traceable reference and no configuration error');
    console.log('PASS validation errors remain on the website without opening WhatsApp');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
