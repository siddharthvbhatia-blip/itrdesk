'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const output = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  let attempts = 0;
  try {
    const logoPage = await browser.newPage({ viewport: { width:1365, height:900 } });
    for (const file of ['calculator.html','itr-preparation-json.html','contact.html']) {
      await logoPage.goto(`${base}/${file}?logo=r24`, { waitUntil:'networkidle' });
      await logoPage.waitForTimeout(250);
      const logo = await logoPage.locator('.brand').evaluate(element => {
        const before = getComputedStyle(element,'::before');
        return { content:before.content, backgroundImage:before.backgroundImage, width:before.width, height:before.height };
      });
      assert.notEqual(logo.content, 'none', `${file}: CA logo pseudo-element is missing`);
      assert.match(logo.backgroundImage, /ca-india-logo-r22\.webp/, `${file}: CA logo asset is missing`);
      assert(parseFloat(logo.width) >= 48 && parseFloat(logo.height) >= 35, `${file}: CA logo is too small`);
    }
    await logoPage.close();

    for (const viewport of [{name:'desktop',width:1365,height:900},{name:'mobile',width:360,height:800}]) {
      const page = await browser.newPage({ viewport: { width:viewport.width, height:viewport.height } });
      await page.route('https://itrdesk-payment-backend.vercel.app/api/enquiries', async route => {
        attempts += 1;
        const auth = route.request().headers().authorization || '';
        if (auth !== 'Bearer test-magic-access') {
          return route.fulfill({ status:401, contentType:'application/json', body:JSON.stringify({error:'This device is not authorised for the private enquiry inbox.'}) });
        }
        return route.fulfill({
          status:200,
          contentType:'application/json',
          body:JSON.stringify({
            accepted:true,
            storage:'recent-notifications',
            retentionNotice:'The website inbox currently shows recent notifications only. Connect Google Drive for permanent storage.',
            notificationUrl:'https://ntfy.sh/itrdesk-test-topic',
            enquiries:[
              {reference:'ENQ-20260721-A1B2C3',createdAt:'2026-07-21T08:00:00.000Z',name:'Asha Sharma',mobile:'9876543210',caseType:'Salary / Form 16',note:'Please call after 4 PM.',status:'New'},
              {reference:'ENQ-20260721-D4E5F6',createdAt:'2026-07-21T07:00:00.000Z',name:'Rahul Verma',mobile:'9123456780',email:'rahul@example.com',caseType:'F&O / Intraday / Trading',note:'Turnover statement is ready.',status:'New'}
            ]
          })
        });
      });

      await page.goto(`${base}/admin-inbox.html?check=r24-${viewport.name}`, { waitUntil:'networkidle' });
      assert(await page.locator('#inboxAccess').isVisible(), `${viewport.name}: unauthorised device guidance is missing`);
      assert.equal(await page.locator('input[type="password"]').count(), 0, `${viewport.name}: password field remains`);

      await page.goto(`${base}/admin-inbox.html?check=r24-${viewport.name}#access=test-magic-access`, { waitUntil:'networkidle' });
      await page.waitForSelector('#inboxApp:not([hidden])');
      assert.equal(new URL(page.url()).hash, '', `${viewport.name}: access key remains in address bar`);
      assert.equal(await page.locator('.inbox-message').count(), 2, `${viewport.name}: inbox cards missing`);
      assert.equal(await page.locator('#inboxCount').textContent(), '2 enquiries');
      assert.equal(await page.locator('#inboxNotifications').getAttribute('href'), 'https://ntfy.sh/itrdesk-test-topic');
      const stored = await page.evaluate(() => localStorage.getItem('itrdesk:private-inbox-access:r24'));
      assert.equal(stored, 'test-magic-access', `${viewport.name}: trusted-device access was not remembered`);

      await page.reload({ waitUntil:'networkidle' });
      await page.waitForSelector('#inboxApp:not([hidden])');
      assert.equal(await page.locator('.inbox-message').count(), 2, `${viewport.name}: remembered access failed after reload`);
      const geometry = await page.evaluate(() => ({ innerWidth, scrollWidth:document.documentElement.scrollWidth }));
      assert(geometry.scrollWidth <= geometry.innerWidth + 2, `${viewport.name}: horizontal overflow ${geometry.scrollWidth} > ${geometry.innerWidth}`);
      await page.screenshot({ path:path.join(output,`enquiry-inbox-${viewport.name}-r24.png`), fullPage:true });

      await page.click('#inboxForgetDevice');
      assert(await page.locator('#inboxAccess').isVisible(), `${viewport.name}: remove-device action did not lock the inbox`);
      const removed = await page.evaluate(() => localStorage.getItem('itrdesk:private-inbox-access:r24'));
      assert.equal(removed, null, `${viewport.name}: access key remains after remove-device action`);
      await page.close();
    }
    assert(attempts >= 4, `Inbox test expected at least 4 API requests, observed ${attempts}`);
    console.log('PASS CA logo on Calculator/Review/Contact and passwordless trusted-device inbox access');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
