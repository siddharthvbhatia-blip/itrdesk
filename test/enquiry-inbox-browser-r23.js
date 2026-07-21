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
    for (const viewport of [{name:'desktop',width:1365,height:900},{name:'mobile',width:360,height:800}]) {
      const page = await browser.newPage({ viewport: { width:viewport.width, height:viewport.height } });
      await page.route('https://itrdesk-payment-backend.vercel.app/api/enquiries', async route => {
        attempts += 1;
        const auth = route.request().headers().authorization || '';
        if (auth === 'Bearer wrong') {
          return route.fulfill({ status:401, contentType:'application/json', body:JSON.stringify({error:'Incorrect inbox password.'}) });
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

      await page.goto(`${base}/admin-inbox.html?check=r23-${viewport.name}`, { waitUntil:'networkidle' });
      const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
      assert(favicon.includes('favicon-ca-r23.svg'), `${viewport.name}: CA favicon is missing`);

      await page.fill('#inboxPassword','wrong');
      await page.click('#inboxLoginForm button');
      await page.waitForSelector('#inboxLoginStatus:not(:empty)');
      assert.match(await page.locator('#inboxLoginStatus').textContent(), /Incorrect inbox password/);

      await page.fill('#inboxPassword','correct-test-password');
      await page.click('#inboxLoginForm button');
      await page.waitForSelector('#inboxApp:not([hidden])');
      assert.equal(await page.locator('.inbox-message').count(), 2, `${viewport.name}: inbox cards missing`);
      assert.equal(await page.locator('#inboxCount').textContent(), '2 enquiries');
      assert.equal(await page.locator('#inboxNotifications').getAttribute('href'), 'https://ntfy.sh/itrdesk-test-topic');
      const stored = await page.evaluate(() => sessionStorage.getItem('itrdesk:admin-inbox-password:r23'));
      assert.equal(stored, 'correct-test-password', `${viewport.name}: password is not session-only`);
      const local = await page.evaluate(() => localStorage.length);
      assert.equal(local, 0, `${viewport.name}: inbox wrote to localStorage`);
      const geometry = await page.evaluate(() => ({ innerWidth, scrollWidth:document.documentElement.scrollWidth }));
      assert(geometry.scrollWidth <= geometry.innerWidth + 2, `${viewport.name}: horizontal overflow ${geometry.scrollWidth} > ${geometry.innerWidth}`);
      await page.screenshot({ path:path.join(output,`enquiry-inbox-${viewport.name}-r23.png`), fullPage:true });
      await page.close();
    }
    assert(attempts >= 4, `Inbox test expected at least 4 API requests, observed ${attempts}`);
    console.log('PASS private inbox login, enquiry rendering, notification link, session-only password and responsive layout');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
