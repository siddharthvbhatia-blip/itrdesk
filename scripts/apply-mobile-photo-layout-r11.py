from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260717-r11"
PROFILE_LOCAL = f"assets/ca-siddharth-bhatia-profile.png?v={VERSION}"
PROFILE_REMOTE = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"

profile_css = r'''/* Stable circular profile-photo layout */
.profile-hero-grid {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: clamp(26px, 4vw, 50px);
  align-items: center;
}

.profile-hero-photo {
  display: block;
  width: 160px;
  height: 160px;
  min-width: 160px;
  min-height: 160px;
  max-width: 160px;
  max-height: 160px;
  aspect-ratio: 1 / 1;
  margin: 0;
  justify-self: center;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  background: #eef0f4;
  box-shadow: 0 16px 38px rgba(16, 35, 31, .17), 0 0 0 1px rgba(185, 130, 60, .2);
}

.profile-hero-photo > img {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  max-width: none;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: center 18%;
  border-radius: 50%;
}

.sidebar-portrait {
  display: block;
  width: 108px;
  height: 108px;
  min-width: 108px;
  min-height: 108px;
  max-width: 108px;
  max-height: 108px;
  aspect-ratio: 1 / 1;
  margin: 0 auto 20px;
  overflow: hidden;
  border: 3px solid #fff;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 18%;
  background: #eef0f4;
  box-shadow: 0 10px 26px rgba(16, 35, 31, .14), 0 0 0 1px rgba(185, 130, 60, .16);
}
'''

phase1_css = r'''/* Phase 1: navigation, professional verification and secure enquiry */
.language-strip { display: none !important; }
.site-nav { gap: 18px; }
.site-nav a { white-space: nowrap; }
.hero-home { padding-block: 58px; }
.hero-home .hero-actions { margin-top: 26px; }
.hero-home .decision-card { max-width: 460px; justify-self: end; }
.hero-home .quick-links { gap: 12px; }
.hero-home .quick-links a { padding: 17px 18px; }

.professional-card {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr) minmax(285px, .72fr);
  gap: 30px;
  align-items: start;
}

.professional-card > * { min-width: 0; }

.professional-portrait {
  display: block;
  width: 160px !important;
  height: auto !important;
  max-width: 160px !important;
  margin: 0 !important;
  justify-self: center !important;
  overflow: visible !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  text-align: center;
}

.professional-portrait > img {
  display: block !important;
  width: 154px !important;
  height: 154px !important;
  min-width: 154px !important;
  min-height: 154px !important;
  max-width: 154px !important;
  max-height: 154px !important;
  aspect-ratio: 1 / 1 !important;
  margin: 0 auto !important;
  overflow: hidden !important;
  border: 4px solid #fff !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  object-position: center 18% !important;
  background: #eef0f4 !important;
  box-shadow: 0 16px 38px rgba(16, 35, 31, .17), 0 0 0 1px rgba(185, 130, 60, .22) !important;
}

.professional-portrait figcaption {
  display: block !important;
  position: static !important;
  margin-top: 12px !important;
  padding: 0 !important;
  background: transparent !important;
  color: var(--ink) !important;
  font-size: .9rem !important;
  line-height: 1.45 !important;
}

.professional-portrait figcaption span { color: var(--muted) !important; font-size: .8rem !important; }

.professional-verification {
  position: static;
  min-width: 0;
  max-width: 100%;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: linear-gradient(145deg, #fff, #fbf7ef);
  box-shadow: 0 12px 34px rgba(16, 35, 31, .07);
  overflow: hidden;
}

.professional-verification .eyebrow { margin-bottom: 6px; }
.professional-verification h3 { font-size: 1.35rem; margin: 0 0 13px; letter-spacing: -.025em; }
.professional-verification dl { margin: 0; }
.professional-verification dl div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
}
.professional-verification dl div:last-child { border-bottom: 0; }
.professional-verification dt { font-weight: 850; }
.professional-verification dd { margin: 0; text-align: right; color: var(--muted); overflow-wrap: anywhere; }
.verification-links { display: grid; gap: 9px; margin-top: 17px; }
.verification-links a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 11px 13px;
  border: 1px solid #b9d8d0;
  border-radius: 13px;
  background: #f3fbf8;
  color: var(--green-dark);
  font-weight: 850;
  overflow-wrap: anywhere;
}
.verification-links a:hover { border-color: var(--green); transform: translateY(-1px); }
.profile-sidebar .professional-verification { margin-bottom: 22px; }
.profile-sidebar .professional-verification h3 { text-align: left; }

.form-trap { position: absolute !important; left: -10000px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
.enquiry-status { min-height: 1.3em; margin-top: 15px; color: var(--muted); font-size: .92rem; }
.enquiry-status:not(:empty) { padding: 13px 15px; border-radius: 14px; background: #f4f6f5; }
.enquiry-status.success { color: var(--green-dark); background: #eaf7f3; border: 1px solid #b9dfd5; }
.enquiry-status.error { color: var(--danger); background: #fff0ed; border: 1px solid #e8b8af; }
.enquiry-fallback { margin-top: 10px; width: 100%; }

@media (max-width: 1040px) {
  .professional-card { grid-template-columns: 154px minmax(0, 1fr); }
  .professional-verification { grid-column: 1 / -1; }
  .site-nav { gap: 14px; font-size: .92rem; }
}

@media (max-width: 760px) {
  .professional-card { grid-template-columns: minmax(0, 1fr); text-align: center; }
  .professional-card > * { grid-column: auto !important; }
  .professional-portrait { justify-self: center !important; }
  .professional-copy .contact-chips,
  .professional-copy .actions-row { justify-content: center; align-items: center; }
  .professional-verification { width: 100%; text-align: left; }
  .profile-hero-grid { justify-items: center !important; text-align: center; }
  .profile-hero-grid .contact-chips,
  .profile-hero-grid .actions-row { justify-content: center !important; }
  .hero-home .decision-card { justify-self: stretch; max-width: none; }
}
'''

mobile_css = r'''/* Mobile layout stability: loaded last to prevent overlap and portrait distortion */
html, body { max-width: 100%; overflow-x: clip; }

.profile-hero-photo,
.profile-hero-photo > img,
.professional-portrait > img,
.sidebar-portrait {
  box-sizing: border-box !important;
}

@media (max-width: 950px) {
  .content-grid,
  .profile-hero-grid,
  .professional-card {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .content-grid > *,
  .professional-card > *,
  .cards-grid > *,
  .guide-grid > *,
  .practice-grid > * {
    min-width: 0 !important;
  }

  .sidebar-card,
  .profile-sidebar {
    position: static !important;
    inset: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    align-self: auto !important;
  }

  .professional-verification {
    position: static !important;
    inset: auto !important;
    grid-column: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    overflow: hidden !important;
  }
}

@media (max-width: 760px) {
  body { padding-bottom: 88px !important; }

  .page-hero { padding: 38px 0 !important; }
  .section { padding-block: 46px !important; }

  .profile-hero-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    justify-items: center !important;
    gap: 24px !important;
    text-align: center !important;
  }

  .profile-hero-photo {
    display: block !important;
    width: 144px !important;
    height: 144px !important;
    min-width: 144px !important;
    min-height: 144px !important;
    max-width: 144px !important;
    max-height: 144px !important;
    aspect-ratio: 1 / 1 !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    border-radius: 50% !important;
    flex: 0 0 144px !important;
  }

  .profile-hero-photo > img {
    display: block !important;
    width: 144px !important;
    height: 144px !important;
    min-width: 144px !important;
    min-height: 144px !important;
    max-width: 144px !important;
    max-height: 144px !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    object-position: center 18% !important;
  }

  .professional-card {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 24px !important;
    align-items: start !important;
    text-align: left !important;
    overflow: visible !important;
  }

  .professional-card > * {
    position: static !important;
    grid-column: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    max-height: none !important;
    transform: none !important;
  }

  .professional-portrait {
    width: 160px !important;
    max-width: 160px !important;
    height: auto !important;
    min-height: 0 !important;
    aspect-ratio: auto !important;
    justify-self: center !important;
    margin: 0 auto !important;
    overflow: visible !important;
    border-radius: 0 !important;
    background: transparent !important;
    text-align: center !important;
  }

  .professional-portrait > img {
    display: block !important;
    width: 144px !important;
    height: 144px !important;
    min-width: 144px !important;
    min-height: 144px !important;
    max-width: 144px !important;
    max-height: 144px !important;
    aspect-ratio: 1 / 1 !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    object-position: center 18% !important;
  }

  .professional-portrait figcaption {
    position: static !important;
    display: block !important;
    width: 160px !important;
    max-width: 160px !important;
    margin: 10px auto 0 !important;
    overflow: visible !important;
    text-align: center !important;
  }

  .sidebar-portrait {
    width: 108px !important;
    height: 108px !important;
    min-width: 108px !important;
    min-height: 108px !important;
    max-width: 108px !important;
    max-height: 108px !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    object-position: center 18% !important;
  }

  .professional-copy,
  .profile-sidebar,
  .professional-verification,
  .content-card,
  .seo-card,
  .contact-card,
  .docs-panel {
    position: static !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
  }

  .professional-copy { text-align: center !important; }

  .professional-verification {
    padding: 20px !important;
    text-align: left !important;
    overflow: hidden !important;
  }

  .professional-verification dl div {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 2px !important;
  }

  .professional-verification dd { text-align: left !important; }

  .verification-links a,
  .profile-sidebar a,
  .contact-chips a,
  .site-footer a {
    min-width: 0 !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .cards-grid,
  .guide-grid,
  .practice-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 16px !important;
  }

  .seo-card,
  .contact-card,
  .practice-grid article {
    display: block !important;
    position: relative !important;
    padding: 22px !important;
    overflow: visible !important;
  }

  .tag,
  .card-number,
  .pill,
  .status-chip,
  .result-kicker {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    max-width: 100% !important;
  }

  .contact-chips,
  .actions-row,
  .profile-hero-grid .contact-chips,
  .profile-hero-grid .actions-row,
  .professional-copy .contact-chips,
  .professional-copy .actions-row {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .contact-chips a,
  .actions-row .btn,
  .profile-sidebar .btn {
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
  }

  .profile-sidebar p,
  .profile-sidebar h2,
  .professional-verification p,
  .professional-verification h3,
  .seo-card p,
  .seo-card h3 {
    position: static !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .mobile-dock {
    z-index: 1000 !important;
    transform: translateZ(0);
  }

  .wa-float { display: none !important; }
  .site-footer { padding-bottom: 36px !important; }
}

@media (max-width: 420px) {
  .profile-hero-photo,
  .profile-hero-photo > img,
  .professional-portrait > img {
    width: 132px !important;
    height: 132px !important;
    min-width: 132px !important;
    min-height: 132px !important;
    max-width: 132px !important;
    max-height: 132px !important;
  }
}
'''

(ROOT / "assets" / "profile-photo.css").write_text(profile_css, encoding="utf-8")
(ROOT / "assets" / "phase1.css").write_text(phase1_css, encoding="utf-8")
(ROOT / "assets" / "mobile-layout-r11.css").write_text(mobile_css, encoding="utf-8")

for filename in ["index.html", "about-ca-siddharth-bhatia.html"]:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")
    # Remove previous copies so the final order is deterministic.
    text = re.sub(r'\s*<link rel="stylesheet" href="assets/(?:profile-photo|phase1|mobile-layout-r11)\.css(?:\?[^\"]*)?"\s*/>', '', text)
    text = re.sub(r'<script defer src="assets/script\.js(?:\?[^\"]*)?"></script>', f'<script defer src="assets/script.js?v={VERSION}"></script>', text)
    anchor = '<link rel="stylesheet" href="assets/styles.css" />'
    insertion = (
        anchor
        + f'\n  <link rel="stylesheet" href="assets/profile-photo.css?v={VERSION}" />'
        + f'\n  <link rel="stylesheet" href="assets/phase1.css?v={VERSION}" />'
        + f'\n  <link rel="stylesheet" href="assets/mobile-layout-r11.css?v={VERSION}" />'
    )
    if anchor not in text:
        raise SystemExit(f"Stylesheet anchor missing in {filename}")
    text = text.replace(anchor, insertion, 1)
    text = re.sub(
        r'src="assets/(?:ca-siddharth-bhatia(?:-profile)?\.(?:png|jpe?g))(?:\?[^\"]*)?"',
        f'src="{PROFILE_LOCAL}"',
        text,
    )
    text = re.sub(
        r'data-remote-fallback="https://raw\.githubusercontent\.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia(?:-profile)?\.(?:png|jpe?g)"',
        f'data-remote-fallback="{PROFILE_REMOTE}"',
        text,
    )
    if filename == "about-ca-siddharth-bhatia.html":
        text = text.replace(
            'https://siddharthvbhatia-blip.github.io/itrdesk/assets/ca-siddharth-bhatia-profile-v3.jpg?v=3',
            f'https://siddharthvbhatia-blip.github.io/itrdesk/{PROFILE_LOCAL}',
        )
    path.write_text(text, encoding="utf-8")

script_path = ROOT / "assets" / "script.js"
script = script_path.read_text(encoding="utf-8")
script = script.replace(
    "const PROFILE_IMAGE='assets/ca-siddharth-bhatia-profile.png';",
    f"const PROFILE_IMAGE='{PROFILE_LOCAL}';\n  const PROFILE_IMAGE_FALLBACK='{PROFILE_REMOTE}';",
)
script = script.replace(
    "if(document.querySelector('link[href=\"assets/phase1.css\"]'))return;",
    "if(document.querySelector('link[href^=\"assets/phase1.css\"]'))return;",
)
script = script.replace(
    "link.href='assets/phase1.css';",
    f"link.href='assets/phase1.css?v={VERSION}';",
)
script = script.replace(
    "image.src=PROFILE_IMAGE;\n      image.width=640;image.height=640;",
    "image.src=PROFILE_IMAGE;\n      image.dataset.remoteFallback=PROFILE_IMAGE_FALLBACK;\n      image.width=640;image.height=640;",
)
script_path.write_text(script, encoding="utf-8")

static_test = r'''\
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const version = '20260717-r11';
for (const name of ['index.html', 'about-ca-siddharth-bhatia.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes(`assets/profile-photo.css?v=${version}`), `${name} lacks versioned portrait CSS`);
  assert(html.includes(`assets/phase1.css?v=${version}`), `${name} lacks versioned phase-one CSS`);
  assert(html.includes(`assets/mobile-layout-r11.css?v=${version}`), `${name} lacks final mobile CSS`);
  assert(html.includes(`assets/script.js?v=${version}`), `${name} lacks versioned script`);
  assert(html.includes(`assets/ca-siddharth-bhatia-profile.png?v=${version}`), `${name} lacks approved profile image`);
}
const phase = fs.readFileSync(path.join(root, 'assets', 'phase1.css'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'assets', 'mobile-layout-r11.css'), 'utf8');
const photo = fs.readFileSync(path.join(root, 'assets', 'profile-photo.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets', 'script.js'), 'utf8');
assert(!phase.includes('.profile-hero-photo,.professional-portrait,.sidebar-portrait{overflow:hidden'), 'Old destructive portrait rule remains');
assert(mobile.includes('.sidebar-card,\n  .profile-sidebar'), 'Mobile sidebar reset is missing');
assert(mobile.includes('position: static !important'), 'Sticky sidebar reset is missing');
assert(mobile.includes('aspect-ratio: 1 / 1 !important'), 'Square portrait safety rule is missing');
assert(photo.includes('border-radius: 50%'), 'Circular portrait base rule is missing');
assert(script.includes(`const PROFILE_IMAGE='assets/ca-siddharth-bhatia-profile.png?v=${version}'`), 'Script still overwrites the approved image with an unversioned source');
console.log('PASS deterministic circular portraits and mobile no-overlap rules');
'''
(ROOT / "test" / "mobile-layout-r11.js").write_text(static_test.lstrip("\\\n"), encoding="utf-8")

browser_test = r'''\
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = path.resolve(__dirname, '..', 'mobile-layout-artifacts');
fs.mkdirSync(out, { recursive: true });

function assertCircle(label, box, style, maxSize = 190) {
  assert(box, `${label} is missing`);
  assert(Math.abs(box.width - box.height) <= 2, `${label} is not square: ${box.width} x ${box.height}`);
  assert(box.width >= 90 && box.width <= maxSize, `${label} has unsafe size ${box.width}`);
  const radius = parseFloat(style.borderRadius);
  assert(radius >= box.width / 2 - 3, `${label} is not circular: radius ${style.borderRadius}`);
}

async function metrics(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      box: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      style: { borderRadius: style.borderRadius, position: style.position, overflow: style.overflow }
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const file of ['index.html', 'about-ca-siddharth-bhatia.html']) {
      const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
      await page.goto(`${base}/${file}?layout-r11=1`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(900);
      const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      assert(overflow.scrollWidth <= overflow.width + 2, `${file} has horizontal overflow: ${overflow.scrollWidth} > ${overflow.width}`);

      if (file === 'index.html') {
        await page.waitForSelector('.professional-verification');
        const portrait = await metrics(page, '.professional-portrait img');
        assertCircle('Homepage portrait', portrait.box, portrait.style, 180);
        const children = await page.locator('.professional-card > .professional-portrait, .professional-card > .professional-copy, .professional-card > .professional-verification').evaluateAll((elements) => elements.map((element) => {
          const r = element.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        }));
        assert(children.length === 3, `Homepage professional card has ${children.length} expected blocks`);
        for (let i = 1; i < children.length; i += 1) {
          assert(children[i].top >= children[i - 1].bottom - 1, `Homepage professional blocks overlap at ${i}`);
        }
      } else {
        const hero = await metrics(page, '.profile-hero-photo');
        const heroImage = await metrics(page, '.profile-hero-photo img');
        assertCircle('About hero frame', hero.box, hero.style, 180);
        assertCircle('About hero image', heroImage.box, heroImage.style, 180);
        const sidebar = await metrics(page, '.profile-sidebar');
        assert(!['sticky', 'fixed'].includes(sidebar.style.position), `About sidebar remains ${sidebar.style.position}`);
        const separation = await page.evaluate(() => {
          const side = document.querySelector('.profile-sidebar').getBoundingClientRect();
          const next = document.querySelector('.section.muted .seo-card').getBoundingClientRect();
          return { sideBottom: side.bottom, nextTop: next.top };
        });
        assert(separation.sideBottom <= separation.nextTop + 1, `About sidebar overlaps guide cards: ${separation.sideBottom} > ${separation.nextTop}`);
      }
      await page.screenshot({ path: path.join(out, file.replace('.html', '-mobile.png')), fullPage: true });
      await page.close();
    }
    console.log('PASS Chromium 360px portrait geometry, stacking and overflow checks');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
'''
(ROOT / "test" / "mobile-layout-browser-r11.js").write_text(browser_test.lstrip("\\\n"), encoding="utf-8")

package_path = ROOT / "package.json"
package = package_path.read_text(encoding="utf-8")
if "node test/mobile-layout-r11.js" not in package:
    package = package.replace(
        '"test": "node test/run-tests.js && node test/profile-photo-known-good.js"',
        '"test": "node test/run-tests.js && node test/profile-photo-known-good.js && node test/mobile-layout-r11.js"',
    )
package_path.write_text(package, encoding="utf-8")

print("Applied deterministic portrait sizing, mobile stacking and browser tests")
