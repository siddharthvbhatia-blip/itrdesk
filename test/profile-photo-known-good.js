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
