from pathlib import Path
import base64
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260717-r6"

jpg_path = ROOT / "assets" / "ca-siddharth-bhatia-profile-v3.jpg"
png_path = ROOT / "assets" / "ca-siddharth-bhatia-profile.png"
if not jpg_path.exists() or not png_path.exists():
    raise SystemExit("Existing verified profile photo assets are missing")

local_jpg = f"assets/ca-siddharth-bhatia-profile-v3.jpg?v={VERSION}"
local_png = f"assets/ca-siddharth-bhatia-profile.png?v={VERSION}"
remote_png = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"
attrs = (
    f'data-profile-photo src="{local_jpg}" '
    f'data-fallback-src="{local_png}" '
    f'data-remote-fallback="{remote_png}" '
    'decoding="sync" fetchpriority="high"'
)

for name in ["index.html", "about-ca-siddharth-bhatia.html"]:
    path = ROOT / name
    text = path.read_text(encoding="utf-8")
    text, count = re.subn(r'src="data:image/jpeg;base64,[^"]+"', attrs, text)
    if count == 0:
        text, count = re.subn(
            r'(?:data-profile-photo\s+)?src="assets/(?:ca-siddharth-bhatia-profile|profile-siddharth)[^"]*"'
            r'(?:\s+data-fallback-src="[^"]*")?'
            r'(?:\s+data-remote-fallback="[^"]*")?'
            r'(?:\s+decoding="[^"]*")?'
            r'(?:\s+fetchpriority="[^"]*")?',
            attrs,
            text,
        )
    if count == 0:
        raise SystemExit(f"No profile photo image source found in {name}")
    text = text.replace(
        "https://siddharthvbhatia-blip.github.io/itrdesk/assets/ca-siddharth-bhatia-profile-v3.jpg?v=3",
        f"https://siddharthvbhatia-blip.github.io/itrdesk/assets/ca-siddharth-bhatia-profile-v3.jpg?v={VERSION}",
    )
    path.write_text(text, encoding="utf-8")

css_path = ROOT / "assets" / "profile-photo.css"
css = css_path.read_text(encoding="utf-8")
start = "/* PROFILE PHOTO MULTILAYER FALLBACK START */"
end = "/* PROFILE PHOTO MULTILAYER FALLBACK END */"
block = f"""
{start}
.profile-hero-photo,
.professional-portrait,
.sidebar-portrait,
img[data-profile-photo]{{
  background-image:url("{remote_png}");
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
js_start = "/* PROFILE PHOTO RUNTIME FALLBACK START */"
js_end = "/* PROFILE PHOTO RUNTIME FALLBACK END */"
js_block = r'''
/* PROFILE PHOTO RUNTIME FALLBACK START */
(() => {
  const initialiseProfilePhotos = () => {
    document.querySelectorAll('img[data-profile-photo]').forEach((image) => {
      if (image.dataset.profileFallbackReady === 'true') return;
      image.dataset.profileFallbackReady = 'true';

      const sources = [
        image.getAttribute('src'),
        image.dataset.fallbackSrc,
        image.dataset.remoteFallback,
      ].filter(Boolean);

      let sourceIndex = 0;
      let switching = false;

      const tryNextSource = () => {
        if (switching) return;
        switching = true;
        sourceIndex += 1;
        if (sourceIndex < sources.length) {
          image.src = sources[sourceIndex];
          window.setTimeout(() => { switching = false; }, 50);
          return;
        }
        image.dataset.profilePhotoFailed = 'true';
        switching = false;
      };

      image.addEventListener('error', tryNextSource);
      image.addEventListener('load', () => {
        if (image.naturalWidth < 100 || image.naturalHeight < 100) {
          tryNextSource();
        } else {
          image.dataset.profilePhotoLoaded = 'true';
        }
      });

      window.setTimeout(() => {
        if (!image.complete || image.naturalWidth < 100 || image.naturalHeight < 100) {
          tryNextSource();
        }
      }, 1800);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseProfilePhotos);
  } else {
    initialiseProfilePhotos();
  }
})();
/* PROFILE PHOTO RUNTIME FALLBACK END */
'''
if js_start in js:
    js = re.sub(re.escape(js_start) + r'.*?' + re.escape(js_end), js_block.strip(), js, flags=re.S)
else:
    js += "\n" + js_block
js_path.write_text(js, encoding="utf-8")

asset_test = r'''
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jpgPath = path.join(root, 'assets', 'ca-siddharth-bhatia-profile-v3.jpg');
const pngPath = path.join(root, 'assets', 'ca-siddharth-bhatia-profile.png');
const jpg = fs.readFileSync(jpgPath);
const png = fs.readFileSync(pngPath);

assert(jpg.length > 10000, 'JPEG profile photo is unexpectedly small');
assert.deepEqual([...jpg.subarray(0, 3)], [0xff, 0xd8, 0xff], 'JPEG signature is invalid');
assert(png.length > 30000, 'PNG profile photo is unexpectedly small');
assert.deepEqual(
  [...png.subarray(0, 8)],
  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'PNG signature is invalid'
);

for (const name of ['index.html', 'about-ca-siddharth-bhatia.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes('data-profile-photo'), `${name} has no profile photo marker`);
  assert(
    html.includes('assets/ca-siddharth-bhatia-profile-v3.jpg?v=20260717-r6'),
    `${name} does not use the verified JPEG`
  );
  assert(
    html.includes('data-fallback-src="assets/ca-siddharth-bhatia-profile.png?v=20260717-r6"'),
    `${name} has no PNG fallback`
  );
  assert(
    html.includes('data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"'),
    `${name} has no independent-host fallback`
  );
  assert(!html.includes('src="data:image/jpeg;base64,'), `${name} still embeds a large data URI`);
}

console.log('PASS profile photo files, references and fallback chain');
'''
(ROOT / "test" / "profile-photo-assets.js").write_text(asset_test.lstrip(), encoding="utf-8")

package_path = ROOT / "package.json"
package = package_path.read_text(encoding="utf-8")
if "node test/profile-photo-assets.js" not in package:
    package = package.replace(
        '"test": "node test/run-tests.js"',
        '"test": "node test/run-tests.js && node test/profile-photo-assets.js"',
    )
package_path.write_text(package, encoding="utf-8")

workflow = r'''name: Live profile photo smoke test

on:
  push:
    branches: [main]
    paths:
      - index.html
      - about-ca-siddharth-bhatia.html
      - assets/ca-siddharth-bhatia-profile-v3.jpg
      - assets/ca-siddharth-bhatia-profile.png
      - assets/profile-photo.css
      - assets/script.js
      - test/profile-photo-assets.js
      - .github/workflows/live-profile-photo-smoke.yml
  pull_request:
    branches: [main]
    paths:
      - index.html
      - about-ca-siddharth-bhatia.html
      - assets/ca-siddharth-bhatia-profile-v3.jpg
      - assets/ca-siddharth-bhatia-profile.png
      - assets/profile-photo.css
      - assets/script.js
      - test/profile-photo-assets.js
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
      - name: Wait for GitHub Pages and verify published photo files and HTML
        env:
          BUILD_SHA: ${{ github.sha }}
        run: |
          python - <<'PY'
          from io import BytesIO
          import os
          import time
          import urllib.request
          from PIL import Image

          base = 'https://siddharthvbhatia-blip.github.io/itrdesk/'
          build = os.environ.get('BUILD_SHA', 'manual')
          pages = [('index.html', 1), ('about-ca-siddharth-bhatia.html', 2)]
          assets = ['assets/ca-siddharth-bhatia-profile-v3.jpg', 'assets/ca-siddharth-bhatia-profile.png']
          last = None

          for attempt in range(1, 31):
              try:
                  for asset in assets:
                      req = urllib.request.Request(
                          f'{base}{asset}?smoke={build}-{attempt}',
                          headers={
                              'User-Agent': 'ITR-Desk-photo-smoke/2.0',
                              'Cache-Control': 'no-cache',
                          },
                      )
                      raw = urllib.request.urlopen(req, timeout=20).read()
                      image = Image.open(BytesIO(raw))
                      image.verify()
                      assert image.size[0] >= 192 and image.size[1] >= 192, (asset, image.size)

                  for page, minimum in pages:
                      req = urllib.request.Request(
                          f'{base}{page}?smoke={build}-{attempt}',
                          headers={
                              'User-Agent': 'ITR-Desk-photo-smoke/2.0',
                              'Cache-Control': 'no-cache',
                          },
                      )
                      html = urllib.request.urlopen(req, timeout=20).read().decode('utf-8')
                      assert html.count('data-profile-photo') >= minimum, (page, 'marker count')
                      assert 'assets/ca-siddharth-bhatia-profile-v3.jpg?v=20260717-r6' in html
                      assert 'data-fallback-src="assets/ca-siddharth-bhatia-profile.png?v=20260717-r6"' in html
                      assert 'data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"' in html
                      assert 'src="data:image/jpeg;base64,' not in html

                  print('PASS live profile photo asset and HTML smoke test')
                  raise SystemExit(0)
              except Exception as exc:
                  last = exc
                  print(f'Attempt {attempt}/30 not ready: {exc}')
                  if attempt < 30:
                      time.sleep(30)

          raise SystemExit(f'Live profile photo smoke test failed: {last}')
          PY
'''
(ROOT / ".github" / "workflows" / "live-profile-photo-smoke.yml").write_text(workflow, encoding="utf-8")

print("Wrote verified JPEG and PNG portraits, browser fallback chain, tests and live smoke checks")
