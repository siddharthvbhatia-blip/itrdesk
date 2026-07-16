from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260717-r8"
LOCAL = f"assets/profile-photo-r8.svg?v={VERSION}"
REMOTE = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/profile-photo-r8.svg"
ATTRS = (
    f'data-profile-photo src="{LOCAL}" '
    f'data-remote-fallback="{REMOTE}" '
    'decoding="sync" fetchpriority="high"'
)

for name in ["index.html", "about-ca-siddharth-bhatia.html"]:
    path = ROOT / name
    text = path.read_text(encoding="utf-8")
    text, count = re.subn(r'src="data:image/jpeg;base64,[^"]+"', ATTRS, text)
    if count == 0:
        text, count = re.subn(
            r'(?:data-profile-photo\s+)?src="assets/(?:ca-siddharth-bhatia-profile|profile-photo-r8)[^"]*"'
            r'(?:\s+data-fallback-src="[^"]*")?'
            r'(?:\s+data-remote-fallback="[^"]*")?'
            r'(?:\s+decoding="[^"]*")?'
            r'(?:\s+fetchpriority="[^"]*")?',
            ATTRS,
            text,
        )
    if count == 0:
        raise SystemExit(f"No profile image source found in {name}")
    path.write_text(text, encoding="utf-8")

css_path = ROOT / "assets" / "profile-photo.css"
css = css_path.read_text(encoding="utf-8")
start = "/* EXTERNAL SVG PROFILE PHOTO START */"
end = "/* EXTERNAL SVG PROFILE PHOTO END */"
block = f"""
{start}
.profile-hero-photo,
.professional-portrait,
.sidebar-portrait,
img[data-profile-photo]{{
  background-image:url("{REMOTE}");
  background-size:cover;
  background-position:center;
  background-repeat:no-repeat;
}}
.profile-hero-photo img[data-profile-photo],
.professional-portrait img[data-profile-photo],
.sidebar-portrait[data-profile-photo]{{
  display:block!important;
  width:100%!important;
  height:100%!important;
  opacity:1!important;
  visibility:visible!important;
  object-fit:cover!important;
  object-position:center!important;
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
start_js = "/* EXTERNAL SVG PROFILE FALLBACK START */"
end_js = "/* EXTERNAL SVG PROFILE FALLBACK END */"
js_block = r'''
/* EXTERNAL SVG PROFILE FALLBACK START */
(() => {
  const initialiseExternalProfilePhotos = () => {
    document.querySelectorAll('img[data-profile-photo]').forEach((image) => {
      if (image.dataset.externalProfileReady === 'true') return;
      image.dataset.externalProfileReady = 'true';
      const remote = image.dataset.remoteFallback;
      let usedRemote = false;
      const useRemote = () => {
        if (!remote || usedRemote) return;
        usedRemote = true;
        image.src = remote;
      };
      image.addEventListener('error', useRemote);
      image.addEventListener('load', () => {
        if (image.naturalWidth < 100 || image.naturalHeight < 100) useRemote();
        else image.dataset.profilePhotoLoaded = 'true';
      });
      window.setTimeout(() => {
        if (!image.complete || image.naturalWidth < 100 || image.naturalHeight < 100) useRemote();
      }, 1800);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseExternalProfilePhotos);
  } else {
    initialiseExternalProfilePhotos();
  }
})();
/* EXTERNAL SVG PROFILE FALLBACK END */
'''
if start_js in js:
    js = re.sub(re.escape(start_js) + r'.*?' + re.escape(end_js), js_block.strip(), js, flags=re.S)
else:
    js += "\n" + js_block
js_path.write_text(js, encoding="utf-8")

test = r'''
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'assets', 'profile-photo-r8.svg'), 'utf8');
assert(svg.includes('xmlns:xlink='), 'SVG lacks xlink compatibility');
const match = svg.match(/xlink:href="data:image\/jpeg;base64,([^\"]+)"/);
assert(match, 'SVG has no embedded JPEG portrait');
const jpg = Buffer.from(match[1], 'base64');
assert(jpg.length > 5000, 'Embedded portrait is unexpectedly small');
assert.deepEqual([...jpg.subarray(0, 3)], [0xff, 0xd8, 0xff], 'Embedded portrait JPEG signature is invalid');

for (const name of ['index.html', 'about-ca-siddharth-bhatia.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes('data-profile-photo'), `${name} lacks profile marker`);
  assert(html.includes('assets/profile-photo-r8.svg?v=20260717-r8'), `${name} lacks external SVG portrait`);
  assert(html.includes('data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/profile-photo-r8.svg"'), `${name} lacks remote SVG fallback`);
  assert(!html.includes('src="data:image/jpeg;base64,'), `${name} still uses the unsupported inline image`);
}
console.log('PASS external SVG profile photo integrity and references');
'''
(ROOT / "test" / "profile-photo-svg.js").write_text(test.lstrip(), encoding="utf-8")

package_path = ROOT / "package.json"
package = package_path.read_text(encoding="utf-8")
if "node test/profile-photo-svg.js" not in package:
    package = package.replace(
        '"test": "node test/run-tests.js"',
        '"test": "node test/run-tests.js && node test/profile-photo-svg.js"',
    )
package_path.write_text(package, encoding="utf-8")

live = r'''name: Live profile photo smoke test

on:
  push:
    branches: [main]
    paths:
      - index.html
      - about-ca-siddharth-bhatia.html
      - assets/profile-photo-r8.svg
      - assets/profile-photo.css
      - assets/script.js
      - test/profile-photo-svg.js
      - .github/workflows/live-profile-photo-smoke.yml
  pull_request:
    branches: [main]
    paths:
      - index.html
      - about-ca-siddharth-bhatia.html
      - assets/profile-photo-r8.svg
      - assets/profile-photo.css
      - assets/script.js
      - test/profile-photo-svg.js
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
      - run: python -m pip install --disable-pip-version-check cairosvg pillow
      - name: Render the published SVG and verify page references
        env:
          BUILD_SHA: ${{ github.sha }}
        run: |
          python - <<'PY'
          from io import BytesIO
          import os
          import time
          import urllib.request
          import cairosvg
          from PIL import Image

          base = 'https://siddharthvbhatia-blip.github.io/itrdesk/'
          build = os.environ.get('BUILD_SHA', 'manual')
          pages = [('index.html', 1), ('about-ca-siddharth-bhatia.html', 2)]
          last = None
          for attempt in range(1, 31):
              try:
                  request = urllib.request.Request(
                      f'{base}assets/profile-photo-r8.svg?smoke={build}-{attempt}',
                      headers={'User-Agent': 'ITR-Desk-photo-smoke/4.0', 'Cache-Control': 'no-cache'},
                  )
                  svg = urllib.request.urlopen(request, timeout=20).read()
                  png = cairosvg.svg2png(bytestring=svg, output_width=256, output_height=256)
                  image = Image.open(BytesIO(png))
                  image.load()
                  assert image.size == (256, 256)
                  assert image.getbbox() is not None

                  for page, minimum in pages:
                      request = urllib.request.Request(
                          f'{base}{page}?smoke={build}-{attempt}',
                          headers={'User-Agent': 'ITR-Desk-photo-smoke/4.0', 'Cache-Control': 'no-cache'},
                      )
                      html = urllib.request.urlopen(request, timeout=20).read().decode('utf-8')
                      assert html.count('data-profile-photo') >= minimum
                      assert 'assets/profile-photo-r8.svg?v=20260717-r8' in html
                      assert 'data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/profile-photo-r8.svg"' in html
                      assert 'src="data:image/jpeg;base64,' not in html
                  print('PASS live rendered SVG profile photo and page references')
                  raise SystemExit(0)
              except Exception as exc:
                  last = exc
                  print(f'Attempt {attempt}/30 not ready: {exc}')
                  if attempt < 30:
                      time.sleep(30)
          raise SystemExit(f'Live SVG profile photo smoke test failed: {last}')
          PY
'''
(ROOT / ".github" / "workflows" / "live-profile-photo-smoke.yml").write_text(live, encoding="utf-8")

print("Applied external SVG portrait, remote fallback, runtime recovery and live render tests")
