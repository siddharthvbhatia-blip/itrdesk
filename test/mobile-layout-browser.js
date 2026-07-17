'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const LINKEDIN_URL = 'https://www.linkedin.com/in/ca-siddharth-bhatia';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function snapshot(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      borderRadius: style.borderRadius,
      position: style.position,
      display: style.display,
      overflow: style.overflow
    };
  });
}

function circleError(label, value) {
  if (Math.abs(value.width - value.height) > 2) return `${label} is not square: ${value.width} x ${value.height}`;
  if (value.width < 120 || value.width > 180) return `${label} has unsafe width ${value.width}`;
  const percentageCircle = value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= 49;
  const pixelCircle = !value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= value.width / 2 - 3;
  if (!percentageCircle && !pixelCircle) return `${label} is not circular: radius ${value.borderRadius}`;
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { base, errors: [] };
  try {
    const about = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await about.goto(`${base}/about-ca-siddharth-bhatia.html?mobile-check=20260717-r14`, { waitUntil: 'networkidle' });
    await about.waitForTimeout(1800);
    await about.screenshot({ path: path.join(outputDir, 'about-mobile.png'), fullPage: true });

    report.about = await about.evaluate(() => {
      const image = document.querySelector('.profile-hero-photo img');
      const frame = document.querySelector('.profile-hero-photo');
      const side = document.querySelector('.profile-sidebar');
      const guide = document.querySelector('.section.muted .seo-card');
      const linkedin = [...document.querySelectorAll('.verification-links a')].find((link) => /linkedin/i.test(link.textContent));
      const rect = (element) => element ? (() => { const r = element.getBoundingClientRect(); return { left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; })() : null;
      return {
        image: image ? { complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,currentSrc:image.currentSrc,src:image.getAttribute('src'),rect:rect(image),style:{borderRadius:getComputedStyle(image).borderRadius,display:getComputedStyle(image).display,objectFit:getComputedStyle(image).objectFit,objectPosition:getComputedStyle(image).objectPosition} } : null,
        frame: frame ? { rect:rect(frame),style:{borderRadius:getComputedStyle(frame).borderRadius,display:getComputedStyle(frame).display,overflow:getComputedStyle(frame).overflow} } : null,
        sidebar: side ? { rect:rect(side),position:getComputedStyle(side).position } : null,
        guide: rect(guide),
        linkedinHref: linkedin ? linkedin.href : null,
        verificationCount: document.querySelectorAll('.professional-verification').length,
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    if (!report.about.frame) report.errors.push('About portrait frame is missing');
    else {
      const value = { ...report.about.frame.rect, borderRadius: report.about.frame.style.borderRadius };
      const error = circleError('About portrait frame', value); if (error) report.errors.push(error);
    }
    if (!report.about.image) report.errors.push('About portrait image is missing');
    else {
      const value = { ...report.about.image.rect, borderRadius: report.about.image.style.borderRadius };
      const error = circleError('About portrait image', value); if (error) report.errors.push(error);
      if (!report.about.image.complete || report.about.image.naturalWidth < 150 || report.about.image.naturalHeight < 150) report.errors.push(`About portrait did not decode: ${report.about.image.naturalWidth} x ${report.about.image.naturalHeight}`);
      if (!report.about.image.currentSrc.includes('ca-siddharth-bhatia-profile.png')) report.errors.push(`About portrait uses an unexpected source: ${report.about.image.currentSrc}`);
    }
    if (report.about.linkedinHref !== LINKEDIN_URL) report.errors.push(`LinkedIn profile URL is incorrect: ${report.about.linkedinHref}`);
    if (report.about.sidebar && ['sticky','fixed'].includes(report.about.sidebar.position)) report.errors.push(`About sidebar remains ${report.about.sidebar.position}`);
    if (report.about.scrollWidth > report.about.innerWidth + 2) report.errors.push(`About page horizontal overflow: ${report.about.scrollWidth} > ${report.about.innerWidth}`);
    if (report.about.sidebar && report.about.guide && report.about.guide.top < report.about.sidebar.rect.bottom - 1) report.errors.push(`About sidebar overlaps guide cards by ${report.about.sidebar.rect.bottom - report.about.guide.top}px`);

    const home = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await home.goto(`${base}/index.html?mobile-check=20260717-r14`, { waitUntil: 'networkidle' });
    await home.waitForTimeout(1800);
    await home.screenshot({ path: path.join(outputDir, 'home-mobile.png'), fullPage: true });
    report.home = await home.evaluate(() => {
      const image = document.querySelector('.professional-portrait img');
      const rect = (element) => element ? (() => { const r = element.getBoundingClientRect(); return { left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; })() : null;
      const blocks = [...document.querySelectorAll('.professional-card > .professional-portrait, .professional-card > .professional-copy, .professional-card > .professional-verification')].map(rect);
      return {
        image: image ? { complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,currentSrc:image.currentSrc,rect:rect(image),borderRadius:getComputedStyle(image).borderRadius } : null,
        blocks,
        verificationCount: document.querySelectorAll('.professional-verification').length,
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });
    if (!report.home.image) report.errors.push('Homepage portrait is missing');
    else {
      const value = { ...report.home.image.rect, borderRadius: report.home.image.borderRadius };
      const error = circleError('Homepage portrait', value); if (error) report.errors.push(error);
      if (!report.home.image.complete || report.home.image.naturalWidth < 150 || report.home.image.naturalHeight < 150) report.errors.push(`Homepage portrait did not decode: ${report.home.image.naturalWidth} x ${report.home.image.naturalHeight}`);
    }
    if (report.home.blocks.length !== 3) report.errors.push(`Expected 3 homepage professional blocks, found ${report.home.blocks.length}`);
    for (let index = 1; index < report.home.blocks.length; index += 1) {
      if (report.home.blocks[index].top < report.home.blocks[index - 1].bottom - 1) report.errors.push(`Homepage professional blocks ${index - 1} and ${index} overlap`);
    }
    if (report.home.scrollWidth > report.home.innerWidth + 2) report.errors.push(`Homepage horizontal overflow: ${report.home.scrollWidth} > ${report.home.innerWidth}`);

    fs.writeFileSync(path.join(outputDir, 'mobile-diagnostic.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    assert.deepStrictEqual(report.errors, [], report.errors.join('\n'));
    console.log('PASS Chromium portrait decode, circular geometry, LinkedIn URL and no-overlap checks');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
