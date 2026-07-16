from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260717-r9"
SOURCE = f"assets/ca-siddharth-bhatia.jpeg?v={VERSION}"
REMOTE = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia.jpeg"
ATTRS = (
    f'data-profile-photo src="{SOURCE}" '
    f'data-remote-fallback="{REMOTE}" '
    'decoding="sync" fetchpriority="high"'
)

for name in ["index.html", "about-ca-siddharth-bhatia.html"]:
    path = ROOT / name
    text = path.read_text(encoding="utf-8")
    patterns = [
        r'src="data:image/jpeg;base64,[^"]+"',
        r'(?:data-profile-photo\s+)?src="assets/(?:ca-siddharth-bhatia(?:-profile[^\"]*)?|profile-photo-r8\.svg[^\"]*)"'
        r'(?:\s+data-fallback-src="[^"]*")?'
        r'(?:\s+data-remote-fallback="[^"]*")?'
        r'(?:\s+decoding="[^"]*")?'
        r'(?:\s+fetchpriority="[^"]*")?',
    ]
    total = 0
    for pattern in patterns:
        text, count = re.subn(pattern, ATTRS, text)
        total += count
    if total == 0 and SOURCE not in text:
        raise SystemExit(f"No profile photo reference found in {name}")
    path.write_text(text, encoding="utf-8")

css_path = ROOT / "assets" / "profile-photo.css"
css = css_path.read_text(encoding="utf-8")
start = "/* KNOWN GOOD PROFILE PHOTO START */"
end = "/* KNOWN GOOD PROFILE PHOTO END */"
block = f"""
{start}
.profile-hero-photo,
.professional-portrait{{
  overflow:hidden!important;
  background:#eef0f4 url("{REMOTE}") center 17%/cover no-repeat!important;
}}
.profile-hero-photo img[data-profile-photo],
.professional-portrait img[data-profile-photo],
.sidebar-portrait[data-profile-photo]{{
  display:block!important;
  width:100%!important;
  height:100%!important;
  max-width:100%!important;
  opacity:1!important;
  visibility:visible!important;
  object-fit:cover!important;
  object-position:center 17%!important;
  background:#eef0f4 url("{REMOTE}") center 17%/cover no-repeat!important;
}}
{end}
"""
if start in css:
    css = re.sub(re.escape(start) + r'.*?' + re.escape(end), block.strip(), css, flags=re.S)
else:
    css += "\n" + block
css_path.write_text(css, encoding="utf-8")

js_path = ROOT / "assets" / "script.js"
js = js_path.read_text(encoding="utf-8")
js_start = "/* KNOWN GOOD PROFILE PHOTO FALLBACK START */"
js_end = "/* KNOWN GOOD PROFILE PHOTO FALLBACK END */"
js_block = r'''
/* KNOWN GOOD PROFILE PHOTO FALLBACK START */
(() => {
  const initialiseKnownGoodProfilePhotos = () => {
    document.querySelectorAll('img[data-profile-photo]').forEach((image) => {
      if (image.dataset.knownGoodProfileReady === 'true') return;
      image.dataset.knownGoodProfileReady = 'true';
      const remote = image.dataset.remoteFallback;
      let fallbackUsed = false;
      const useFallback = () => {
        if (!remote || fallbackUsed) return;
        fallbackUsed = true;
        image.src = remote;
      };
      image.addEventListener('error', useFallback);
      image.addEventListener('load', () => {
        if (image.naturalWidth < 100 || image.naturalHeight < 100) useFallback();
        else image.dataset.profilePhotoLoaded = 'true';
      });
      window.setTimeout(() => {
        if (!image.complete || image.naturalWidth < 100 || image.naturalHeight < 100) useFallback();
      }, 1600);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseKnownGoodProfilePhotos);
  } else {
    initialiseKnownGoodProfilePhotos();
  }
})();
/* KNOWN GOOD PROFILE PHOTO FALLBACK END */
'''
if js_start in js:
    js = re.sub(re.escape(js_start) + r'.*?' + re.escape(js_end), js_block.strip(), js, flags=re.S)
else:
    js += "\n" + js_block
js_path.write_text(js, encoding="utf-8")

test = r'''
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const photo = fs.readFileSync(path.join(root, 'assets', 'ca-siddharth-bhatia.jpeg'));
assert(photo.length > 10000, 'Known-good profile photo is unexpectedly small');
assert.deepEqual([...photo.subarray(0, 3)], [0xff, 0xd8, 0xff], 'Known-good profile photo is not a JPEG');
for (const name of ['index.html', 'about-ca-siddharth-bhatia.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes('data-profile-photo'), `${name} lacks profile marker`);
  assert(html.includes('assets/ca-siddharth-bhatia.jpeg?v=20260717-r9'), `${name} does not use known-good profile photo`);
  assert(html.includes('data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia.jpeg"'), `${name} lacks remote fallback`);
  assert(!html.includes('src="data:image/jpeg;base64,'), `${name} still contains unsupported inline portrait`);
}
console.log('PASS known-good profile photo asset and references');
'''
(ROOT / "test" / "profile-photo-known-good.js").write_text(test.lstrip(), encoding="utf-8")

package_path = ROOT / "package.json"
package = package_path.read_text(encoding="utf-8")
if "node test/profile-photo-known-good.js" not in package:
    package = package.replace(
        '"test": "node test/run-tests.js"',
        '"test": "node test/run-tests.js && node test/profile-photo-known-good.js"',
    )
package_path.write_text(package, encoding="utf-8")

live = r'''name: Live profile photo smoke test

on:
  push:
    branches: [main]
    paths:
      - index.html
      - about-ca-siddharth-bhatia.html
      - assets/ca-siddharth-bhatia.jpeg
      - assets/profile-photo.css
      - assets/script.js
      - test/profile-photo-known-good.js
      - .github/workflows/live-profile-photo-smoke.yml
  workflow_dispatch:
  schedule:
    - cron: '17 3 * * *'

permissions:
  contents: read

jobs:
  verify-live-site:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python -m pip install --disable-pip-version-check pillow
      - name: Verify published JPEG and page references
        env:
          BUILD_SHA: ${{ github.sha }}
        run: |
          python - <<'PY'
          from io import BytesIO
          import os
          import time
          import urllib.request
          from PIL import Image, ImageStat

          base = 'https://siddharthvbhatia-blip.github.io/itrdesk/'
          build = os.environ.get('BUILD_SHA', 'manual')
          last = None
          for attempt in range(1, 31):
              try:
                  request = urllib.request.Request(
                      f'{base}assets/ca-siddharth-bhatia.jpeg?smoke={build}-{attempt}',
                      headers={'User-Agent':'ITR-Desk-photo-smoke/5.0','Cache-Control':'no-cache'},
                  )
                  raw = urllib.request.urlopen(request, timeout=20).read()
                  image = Image.open(BytesIO(raw)).convert('RGB')
                  image.load()
                  assert image.width >= 300 and image.height >= 300, image.size
                  assert max(ImageStat.Stat(image).var) > 100, 'Published JPEG appears blank'

                  for page, minimum in [('index.html',1),('about-ca-siddharth-bhatia.html',2)]:
                      request = urllib.request.Request(
                          f'{base}{page}?smoke={build}-{attempt}',
                          headers={'User-Agent':'ITR-Desk-photo-smoke/5.0','Cache-Control':'no-cache'},
                      )
                      html = urllib.request.urlopen(request, timeout=20).read().decode('utf-8')
                      assert html.count('data-profile-photo') >= minimum
                      assert 'assets/ca-siddharth-bhatia.jpeg?v=20260717-r9' in html
                      assert 'data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia.jpeg"' in html
                      assert 'src="data:image/jpeg;base64,' not in html
                  print('PASS live known-good profile photo smoke test')
                  raise SystemExit(0)
              except Exception as exc:
                  last = exc
                  print(f'Attempt {attempt}/30 not ready: {exc}')
                  if attempt < 30:
                      time.sleep(30)
          raise SystemExit(f'Live profile photo smoke test failed: {last}')
          PY
'''
(ROOT / ".github" / "workflows" / "live-profile-photo-smoke.yml").write_text(live, encoding="utf-8")

print("Restored the original browser-proven profile photo with fallbacks and tests")
