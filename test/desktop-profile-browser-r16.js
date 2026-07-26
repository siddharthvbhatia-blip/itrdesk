'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const asset = 'ca-siddharth-bhatia-final-r16.jpg';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await home.goto(`${base}/index.html?desktop-check=20260726-r32`, { waitUntil: 'networkidle' });
    await home.waitForFunction((expected) => {
      const image = document.querySelector('.clean-profile-card img');
      return image && image.complete && image.naturalWidth >= 150 && image.currentSrc.includes(expected);
    }, asset, { timeout: 10000 });
    await home.waitForTimeout(500);
    await home.screenshot({ path: path.join(outputDir, 'home-desktop-r17.png'), fullPage: true });
    const homeReport = await home.evaluate(() => {
      const heroCopy = document.querySelector('.clean-hero-copy');
      const profile = document.querySelector('.clean-profile-card');
      const image = profile.querySelector('img');
      const rect = (element) => { const value = element.getBoundingClientRect(); return { left:value.left,top:value.top,right:value.right,bottom:value.bottom,width:value.width,height:value.height }; };
      const actionVisuals = [...document.querySelectorAll('#guides .clean-action-visual')].map((visual) => {
        const visualImage = visual.querySelector('img');
        return {
          frame: rect(visual),
          image: rect(visualImage),
          objectFit: getComputedStyle(visualImage).objectFit,
          objectPosition: getComputedStyle(visualImage).objectPosition,
          complete: visualImage.complete,
          naturalWidth: visualImage.naturalWidth,
          naturalHeight: visualImage.naturalHeight
        };
      });
      return {
        heroCopy:rect(heroCopy),
        profile:rect(profile),
        image:{complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,currentSrc:image.currentSrc,rect:rect(image),borderRadius:getComputedStyle(image).borderRadius},
        actionVisuals,
        sectionCount:document.querySelectorAll('main > section').length,
        actionCards:document.querySelectorAll('.clean-action-card').length,
        serviceCards:document.querySelectorAll('.clean-service-card').length,
        innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        pageHeight:document.documentElement.scrollHeight
      };
    });
    assert(homeReport.image.currentSrc.includes(asset), `Desktop homepage portrait uses unexpected source: ${homeReport.image.currentSrc}`);
    assert(homeReport.image.complete && homeReport.image.naturalWidth >= 150, 'Desktop homepage portrait did not decode');
    assert(homeReport.image.borderRadius.includes('50%') || parseFloat(homeReport.image.borderRadius) >= homeReport.image.rect.width / 2 - 3, `Desktop homepage portrait is not circular: ${homeReport.image.borderRadius}`);
    assert(homeReport.profile.left >= homeReport.heroCopy.right + 20, 'Desktop homepage profile card overlaps hero copy');
    assert(homeReport.sectionCount <= 6, `Desktop homepage has too many sections: ${homeReport.sectionCount}`);
    assert(homeReport.actionCards === 3 && homeReport.serviceCards === 6, 'Desktop homepage card counts are incorrect');
    assert.equal(homeReport.actionVisuals.length, 3, `Expected three homepage illustrations, found ${homeReport.actionVisuals.length}`);
    for (const [index, visual] of homeReport.actionVisuals.entries()) {
      const ratio = visual.frame.width / visual.frame.height;
      assert(visual.complete && visual.naturalWidth === 1200 && visual.naturalHeight === 900, `Homepage illustration ${index + 1} did not decode at its expected dimensions`);
      assert.equal(visual.objectFit, 'contain', `Homepage illustration ${index + 1} can still be cropped: object-fit=${visual.objectFit}`);
      assert(Math.abs(ratio - (4 / 3)) < 0.04, `Homepage illustration ${index + 1} lost its 4:3 frame: ${ratio}`);
      assert(visual.frame.height > 180, `Homepage illustration ${index + 1} is still forced into a short strip: ${visual.frame.height}px`);
      assert(Math.abs(visual.image.width - visual.frame.width) <= 2 && Math.abs(visual.image.height - visual.frame.height) <= 2, `Homepage illustration ${index + 1} does not fill its complete frame`);
    }
    assert(homeReport.scrollWidth <= homeReport.innerWidth + 2, `Desktop homepage horizontal overflow: ${homeReport.scrollWidth} > ${homeReport.innerWidth}`);
    assert(homeReport.pageHeight < 4300, `Desktop homepage remains excessively tall: ${homeReport.pageHeight}px`);

    const about = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await about.goto(`${base}/about-ca-siddharth-bhatia.html?desktop-check=20260718-r17`, { waitUntil: 'networkidle' });
    await about.waitForFunction((expected) => {
      const image = document.querySelector('.profile-hero-photo img');
      return image && image.complete && image.naturalWidth >= 150 && image.currentSrc.includes(expected);
    }, asset, { timeout: 10000 });
    await about.waitForTimeout(500);
    await about.screenshot({ path: path.join(outputDir, 'about-desktop-r17.png'), fullPage: true });

    const aboutReport = await about.evaluate(() => {
      const image = document.querySelector('.profile-hero-photo img');
      const frame = document.querySelector('.profile-hero-photo');
      const heading = document.querySelector('.clean-about-grid h1');
      const rect = (element) => { const value = element.getBoundingClientRect(); return { left:value.left,top:value.top,right:value.right,bottom:value.bottom,width:value.width,height:value.height }; };
      return {
        image:{complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,currentSrc:image.currentSrc,rect:rect(image),borderRadius:getComputedStyle(image).borderRadius,objectFit:getComputedStyle(image).objectFit},
        frame:{rect:rect(frame),borderRadius:getComputedStyle(frame).borderRadius,overflow:getComputedStyle(frame).overflow},
        heading:rect(heading),
        sectionCount:document.querySelectorAll('main > section').length,
        verificationPanels:document.querySelectorAll('.professional-verification').length,
        innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        pageHeight:document.documentElement.scrollHeight
      };
    });

    assert(aboutReport.image.currentSrc.includes(asset), `Desktop About portrait uses unexpected source: ${aboutReport.image.currentSrc}`);
    assert(aboutReport.image.complete && aboutReport.image.naturalWidth >= 150 && aboutReport.image.naturalHeight >= 150, `Desktop About portrait did not decode: ${aboutReport.image.naturalWidth} x ${aboutReport.image.naturalHeight}`);
    assert(Math.abs(aboutReport.image.rect.width - aboutReport.image.rect.height) <= 2, `Desktop About portrait is not square: ${aboutReport.image.rect.width} x ${aboutReport.image.rect.height}`);
    assert(aboutReport.image.rect.width >= 145 && aboutReport.image.rect.width <= 165, `Desktop About portrait has unsafe size: ${aboutReport.image.rect.width}`);
    assert(aboutReport.image.borderRadius.includes('50%') || parseFloat(aboutReport.image.borderRadius) >= aboutReport.image.rect.width / 2 - 3, `Desktop About portrait is not circular: ${aboutReport.image.borderRadius}`);
    assert(aboutReport.frame.overflow === 'hidden', `Desktop About portrait frame does not clip safely: ${aboutReport.frame.overflow}`);
    assert(aboutReport.heading.left >= aboutReport.frame.rect.right + 20, 'Desktop About portrait overlaps the profile heading');
    assert(aboutReport.sectionCount <= 5, `Desktop About page has too many sections: ${aboutReport.sectionCount}`);
    assert(aboutReport.verificationPanels === 0, 'Desktop About page contains a duplicate verification panel');
    assert(aboutReport.scrollWidth <= aboutReport.innerWidth + 2, `Desktop About page horizontal overflow: ${aboutReport.scrollWidth} > ${aboutReport.innerWidth}`);
    assert(aboutReport.pageHeight < 3300, `Desktop About page remains excessively tall: ${aboutReport.pageHeight}px`);

    const report = { base, home:homeReport, about:aboutReport };
    fs.writeFileSync(path.join(outputDir, 'desktop-clean-r17.json'), JSON.stringify(report, null, 2));
    console.log('PASS concise desktop homepage, full illustration fit and About portrait checks', report);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
