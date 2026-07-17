'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const LINKEDIN_URL = 'https://www.linkedin.com/in/ca-siddharth-bhatia';
const PROFILE_ASSET = 'ca-siddharth-bhatia-final-r16.jpg';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

function circleError(label, value) {
  if (Math.abs(value.width - value.height) > 2) return `${label} is not square: ${value.width} x ${value.height}`;
  if (value.width < 120 || value.width > 180) return `${label} has unsafe width ${value.width}`;
  const percentageCircle = value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= 49;
  const pixelCircle = !value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= value.width / 2 - 3;
  if (!percentageCircle && !pixelCircle) return `${label} is not circular: radius ${value.borderRadius}`;
  return null;
}

async function inspect(page, kind) {
  return page.evaluate(({ kind, profileAsset, linkedinUrl }) => {
    const rect = (element) => element ? (() => { const r = element.getBoundingClientRect(); return { left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; })() : null;
    const image = document.querySelector(kind === 'home' ? '.clean-profile-card img' : '.profile-hero-photo img');
    const sections = [...document.querySelectorAll('main > section')].map((section) => ({ className:section.className, ...rect(section) }));
    const linkedin = [...document.querySelectorAll('a')].find((link) => link.href === linkedinUrl);
    return {
      image: image ? {
        complete:image.complete,
        naturalWidth:image.naturalWidth,
        naturalHeight:image.naturalHeight,
        currentSrc:image.currentSrc,
        rect:rect(image),
        borderRadius:getComputedStyle(image).borderRadius,
        objectFit:getComputedStyle(image).objectFit
      } : null,
      sections,
      sectionCount:sections.length,
      actionCards:document.querySelectorAll('.clean-action-card').length,
      serviceCards:document.querySelectorAll('.clean-service-card').length,
      faqCount:document.querySelectorAll('.clean-faq details').length,
      formControls:document.querySelectorAll('#itrForm input:not([name="website"]),#itrForm select,#itrForm textarea').length,
      oldSections:document.querySelectorAll('.trust-strip,.need-section,.form-finder-section,.tools-showcase,.sample-section,.deadline-section,.safety-section,.process-section,.feedback-section').length,
      verificationPanels:document.querySelectorAll('.professional-verification').length,
      linkedinHref:linkedin ? linkedin.href : null,
      innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      pageHeight:document.documentElement.scrollHeight,
      profileAsset
    };
  }, { kind, profileAsset: PROFILE_ASSET, linkedinUrl: LINKEDIN_URL });
}

function validateSections(label, report, errors) {
  for (let index = 1; index < report.sections.length; index += 1) {
    if (report.sections[index].top < report.sections[index - 1].bottom - 1) errors.push(`${label} sections ${index - 1} and ${index} overlap`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { base, errors: [] };
  try {
    const home = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await home.goto(`${base}/index.html?mobile-check=20260718-r17`, { waitUntil: 'networkidle' });
    await home.waitForFunction(() => {
      const image = document.querySelector('.clean-profile-card img');
      return image && image.complete && image.naturalWidth >= 150;
    }, null, { timeout: 10000 });
    await home.waitForTimeout(500);
    await home.screenshot({ path: path.join(outputDir, 'home-mobile-r17.png'), fullPage: true });
    report.home = await inspect(home, 'home');

    if (!report.home.image) report.errors.push('Homepage portrait is missing');
    else {
      const error = circleError('Homepage portrait', { ...report.home.image.rect, borderRadius:report.home.image.borderRadius });
      if (error) report.errors.push(error);
      if (!report.home.image.complete || report.home.image.naturalWidth < 150) report.errors.push(`Homepage portrait did not decode: ${report.home.image.naturalWidth} x ${report.home.image.naturalHeight}`);
      if (!report.home.image.currentSrc.includes(PROFILE_ASSET)) report.errors.push(`Homepage portrait uses unexpected source: ${report.home.image.currentSrc}`);
    }
    if (report.home.sectionCount > 6) report.errors.push(`Homepage has too many sections: ${report.home.sectionCount}`);
    if (report.home.actionCards !== 3) report.errors.push(`Homepage should show 3 primary actions, found ${report.home.actionCards}`);
    if (report.home.serviceCards !== 6) report.errors.push(`Homepage should show 6 concise services, found ${report.home.serviceCards}`);
    if (report.home.faqCount !== 3) report.errors.push(`Homepage should show 3 FAQs, found ${report.home.faqCount}`);
    if (report.home.formControls > 5) report.errors.push(`Homepage enquiry form is too long: ${report.home.formControls} visible controls`);
    if (report.home.oldSections !== 0) report.errors.push(`Homepage still renders ${report.home.oldSections} old repetitive sections`);
    if (report.home.verificationPanels !== 0) report.errors.push('Homepage injected an unnecessary verification panel');
    if (report.home.scrollWidth > report.home.innerWidth + 2) report.errors.push(`Homepage horizontal overflow: ${report.home.scrollWidth} > ${report.home.innerWidth}`);
    if (report.home.pageHeight > 7200) report.errors.push(`Homepage remains excessively tall on mobile: ${report.home.pageHeight}px`);
    validateSections('Homepage', report.home, report.errors);

    const about = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await about.goto(`${base}/about-ca-siddharth-bhatia.html?mobile-check=20260718-r17`, { waitUntil: 'networkidle' });
    await about.waitForFunction(() => {
      const image = document.querySelector('.profile-hero-photo img');
      return image && image.complete && image.naturalWidth >= 150;
    }, null, { timeout: 10000 });
    await about.waitForTimeout(500);
    await about.screenshot({ path: path.join(outputDir, 'about-mobile-r17.png'), fullPage: true });
    report.about = await inspect(about, 'about');

    if (!report.about.image) report.errors.push('About portrait is missing');
    else {
      const error = circleError('About portrait', { ...report.about.image.rect, borderRadius:report.about.image.borderRadius });
      if (error) report.errors.push(error);
      if (!report.about.image.complete || report.about.image.naturalWidth < 150) report.errors.push(`About portrait did not decode: ${report.about.image.naturalWidth} x ${report.about.image.naturalHeight}`);
      if (!report.about.image.currentSrc.includes(PROFILE_ASSET)) report.errors.push(`About portrait uses unexpected source: ${report.about.image.currentSrc}`);
    }
    if (report.about.sectionCount > 5) report.errors.push(`About page has too many sections: ${report.about.sectionCount}`);
    if (report.about.serviceCards !== 6) report.errors.push(`About page should show 6 concise services, found ${report.about.serviceCards}`);
    if (report.about.linkedinHref !== LINKEDIN_URL) report.errors.push(`LinkedIn profile URL is incorrect: ${report.about.linkedinHref}`);
    if (report.about.verificationPanels !== 0) report.errors.push('About page injected a duplicate verification panel');
    if (report.about.scrollWidth > report.about.innerWidth + 2) report.errors.push(`About page horizontal overflow: ${report.about.scrollWidth} > ${report.about.innerWidth}`);
    if (report.about.pageHeight > 6000) report.errors.push(`About page remains excessively tall on mobile: ${report.about.pageHeight}px`);
    validateSections('About page', report.about, report.errors);

    fs.writeFileSync(path.join(outputDir, 'mobile-diagnostic-r17.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    assert.deepStrictEqual(report.errors, [], report.errors.join('\n'));
    console.log('PASS concise mobile content, portrait, section order and overflow checks');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
