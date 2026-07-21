'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function inspect(page, label) {
  await page.goto(`${base}/index.html?contact-check=20260721-r24`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.hero-contact-panel');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outputDir, `home-contact-${label}.png`), fullPage: true });
  return page.evaluate(() => {
    const panel = document.querySelector('.hero-contact-panel');
    const items = [...document.querySelectorAll('.hero-contact-panel .hero-contact-item')];
    const phone = document.querySelector('.hero-contact-panel a[href^="tel:"]');
    const map = document.querySelector('.hero-contact-panel a[href*="google.com/maps/search"]');
    const profile = document.querySelector('.clean-profile-card');
    const buttons = document.querySelector('.hero-actions');
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
    };
    return {
      panel: rect(panel),
      items: items.map(item => ({ rect:rect(item), text:item.innerText.trim(), display:getComputedStyle(item).display })),
      phoneHref: phone?.getAttribute('href') || '',
      phoneText: phone?.innerText || '',
      mapHref: map?.href || '',
      mapText: map?.innerText || '',
      profile: profile ? rect(profile) : null,
      buttons: buttons ? rect(buttons) : null,
      viewport: { width:innerWidth, height:innerHeight },
      scrollWidth: document.documentElement.scrollWidth
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const mobile = await inspect(mobilePage, 'mobile-r24');
    assert.strictEqual(mobile.items.length, 2, `Expected two mobile contact items, found ${mobile.items.length}`);
    assert(mobile.phoneText.includes('+91 7879857126'), 'Mobile phone number is not visible');
    assert.strictEqual(mobile.phoneHref, 'tel:+917879857126', `Incorrect mobile call link: ${mobile.phoneHref}`);
    assert(mobile.mapText.includes('444, Vikram Tower'), 'Mobile office address is not visible');
    assert(mobile.mapText.includes('Indore – 452001'), 'Mobile office PIN code is not visible');
    assert(mobile.mapHref.includes('google.com/maps/search/'), `Incorrect mobile map link: ${mobile.mapHref}`);
    assert(mobile.panel.left >= -1 && mobile.panel.right <= mobile.viewport.width + 1, 'Mobile contact panel exceeds the viewport');
    assert(mobile.panel.bottom <= mobile.viewport.height + 40, `Office contact details are not visible near the first screen: ${mobile.panel.bottom} > ${mobile.viewport.height}`);
    assert(mobile.scrollWidth <= mobile.viewport.width + 2, `Mobile page has horizontal overflow: ${mobile.scrollWidth} > ${mobile.viewport.width}`);
    for (let index = 1; index < mobile.items.length; index += 1) {
      assert(mobile.items[index].rect.top >= mobile.items[index - 1].rect.bottom - 1, 'Mobile contact items overlap');
    }
    if (mobile.buttons) assert(mobile.panel.top >= mobile.buttons.bottom, 'Mobile contact panel overlaps hero buttons');

    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const desktop = await inspect(desktopPage, 'desktop-r24');
    assert.strictEqual(desktop.items.length, 2, `Expected two desktop contact items, found ${desktop.items.length}`);
    assert(desktop.phoneText.includes('+91 7879857126'), 'Desktop phone number is not visible');
    assert(desktop.mapText.includes('444, Vikram Tower'), 'Desktop office address is not visible');
    assert(desktop.panel.width >= 520, `Desktop contact panel is unexpectedly narrow: ${desktop.panel.width}`);
    assert(desktop.scrollWidth <= desktop.viewport.width + 2, `Desktop page has horizontal overflow: ${desktop.scrollWidth} > ${desktop.viewport.width}`);
    if (desktop.profile) assert(desktop.panel.right <= desktop.profile.left + 3, 'Desktop contact panel overlaps the professional profile card');

    const report = { mobile, desktop };
    fs.writeFileSync(path.join(outputDir, 'home-contact-r24.json'), JSON.stringify(report, null, 2));
    console.log('PASS homepage phone/address visibility, call/maps links, first-screen placement and no-overlap checks');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
