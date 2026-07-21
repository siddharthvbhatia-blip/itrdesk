'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function inspectPage(browser, viewport, label) {
  const page = await browser.newPage({ viewport });
  const diagnostic = { label, viewport };
  try {
    await page.goto(`${base}/index.html?motion-check=20260721-r26-${label}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1550);

    const start = await page.evaluate(() => {
      const heading = document.querySelector('.clean-hero h1');
      const card = document.querySelector('.clean-profile-card');
      const progress = document.querySelector('.motion-progress');
      return {
        motionJs: document.documentElement.classList.contains('motion-js'),
        motionStarted: document.documentElement.classList.contains('motion-started'),
        bodyEnhanced: document.body.classList.contains('motion-enhanced'),
        progress: Boolean(progress),
        progressTransform: progress ? getComputedStyle(progress).transform : null,
        headingOpacity: heading ? Number(getComputedStyle(heading).opacity) : -1,
        headingVisible: heading ? heading.classList.contains('is-visible') : false,
        cardVisible: card ? card.classList.contains('is-visible') : false,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth
      };
    });
    diagnostic.start = start;

    assert(start.motionJs && start.motionStarted && start.bodyEnhanced, `${label}: motion runtime did not initialise`);
    assert(start.progress, `${label}: progress indicator is missing`);
    assert(start.headingVisible && start.headingOpacity > 0.95, `${label}: hero heading did not complete its entrance`);
    assert(start.cardVisible, `${label}: profile card did not complete its entrance`);
    assert(start.scrollWidth <= start.innerWidth + 2, `${label}: animation caused horizontal overflow`);

    const serviceCards = page.locator('#services .clean-service-card');
    const serviceCount = await serviceCards.count();
    for (let index = 0; index < serviceCount; index += 1) {
      await serviceCards.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(950);

    const middle = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('#services .clean-service-card')];
      const progress = document.querySelector('.motion-progress');
      return {
        visibleCards: cards.filter((card) => card.classList.contains('is-visible')).length,
        cardOpacities: cards.map((card) => Number(getComputedStyle(card).opacity)),
        delays: cards.map((card) => getComputedStyle(card).getPropertyValue('--motion-delay').trim()),
        progressTransform: progress ? getComputedStyle(progress).transform : null,
        headerScrolled: document.querySelector('.site-header')?.classList.contains('motion-scrolled'),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth
      };
    });
    diagnostic.middle = middle;

    assert.equal(middle.visibleCards, 6, `${label}: not all service cards revealed while scrolling through the service grid`);
    assert(middle.cardOpacities.every((value) => value > 0.95), `${label}: one or more service cards remain transparent`);
    assert(new Set(middle.delays).size >= 3, `${label}: service cards are not staggered`);
    assert(middle.headerScrolled, `${label}: header did not enter its scrolled state`);
    assert.notEqual(middle.progressTransform, start.progressTransform, `${label}: scroll progress did not move`);
    assert(middle.scrollWidth <= middle.innerWidth + 2, `${label}: mid-page animation caused horizontal overflow`);

    await page.locator('#enquiry').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    const bottom = await page.evaluate(() => {
      const copy = document.querySelector('.clean-enquiry-copy');
      const form = document.querySelector('.lead-form');
      const rect = (element) => { const r = element.getBoundingClientRect(); return { left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; };
      return {
        copyVisible: copy?.classList.contains('is-visible'),
        formVisible: form?.classList.contains('is-visible'),
        copyRect: copy ? rect(copy) : null,
        formRect: form ? rect(form) : null,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth
      };
    });
    diagnostic.bottom = bottom;

    assert(bottom.copyVisible && bottom.formVisible, `${label}: enquiry elements did not reveal`);
    if (viewport.width >= 900) assert(bottom.copyRect.right <= bottom.formRect.left + 2, `${label}: animated enquiry columns overlap`);
    assert(bottom.scrollWidth <= bottom.innerWidth + 2, `${label}: bottom animation caused horizontal overflow`);

    await page.screenshot({ path: path.join(outputDir, `premium-motion-${label}.png`), fullPage: true });
    fs.writeFileSync(path.join(outputDir, `premium-motion-${label}.json`), JSON.stringify(diagnostic, null, 2));
    return diagnostic;
  } catch (error) {
    diagnostic.error = error.stack || String(error);
    fs.writeFileSync(path.join(outputDir, `premium-motion-${label}-error.json`), JSON.stringify(diagnostic, null, 2));
    await page.screenshot({ path: path.join(outputDir, `premium-motion-${label}-error.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await inspectPage(browser, { width: 1440, height: 900 }, 'desktop');
    const mobile = await inspectPage(browser, { width: 390, height: 844 }, 'mobile');

    const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await reducedPage.goto(`${base}/index.html?motion-check=reduce-r26`, { waitUntil: 'networkidle' });
    await reducedPage.waitForTimeout(250);
    const reduced = await reducedPage.evaluate(() => {
      const heading = document.querySelector('.clean-hero h1');
      const service = document.querySelector('.clean-service-card');
      return {
        headingOpacity: heading ? Number(getComputedStyle(heading).opacity) : -1,
        serviceOpacity: service ? Number(getComputedStyle(service).opacity) : -1,
        serviceVisible: service?.classList.contains('is-visible'),
        progressDisplay: getComputedStyle(document.querySelector('.motion-progress')).display,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth
      };
    });
    assert(reduced.headingOpacity > 0.95, 'Reduced-motion hero is hidden');
    assert(reduced.serviceVisible && reduced.serviceOpacity > 0.95, 'Reduced-motion content is hidden');
    assert.equal(reduced.progressDisplay, 'none', 'Reduced-motion mode still shows animated progress');
    assert(reduced.scrollWidth <= reduced.innerWidth + 2, 'Reduced-motion page has horizontal overflow');
    await reducedPage.close();

    fs.writeFileSync(path.join(outputDir, 'premium-motion-r26.json'), JSON.stringify({ desktop, mobile, reduced }, null, 2));
    console.log('PASS premium motion hero, scroll reveal, stagger, progress, mobile and reduced-motion browser checks');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  fs.writeFileSync(path.join(outputDir, 'premium-motion-r26-error.txt'), error.stack || String(error));
  console.error(error);
  process.exit(1);
});
