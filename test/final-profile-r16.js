'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const asset = 'ca-siddharth-bhatia-final-r16.jpg';
const correctLinkedIn = 'https://www.linkedin.com/in/ca-siddharth-bhatia';
const badLinkedIn = correctLinkedIn + '-';
const photo = fs.readFileSync(path.join(root, 'assets', asset));

assert(photo.length > 3000, 'Final professional portrait is unexpectedly small');
assert.deepEqual([...photo.subarray(0, 3)], [0xff, 0xd8, 0xff], 'Final professional portrait is not a JPEG');

const about = fs.readFileSync(path.join(root, 'about-ca-siddharth-bhatia.html'), 'utf8');
assert((about.match(new RegExp(asset.replace('.', '\\.'), 'g')) || []).length >= 4, 'About page does not consistently use the final portrait');
assert(about.includes('assets/phase1.css?v=20260717-r16'), 'About page does not pin the final portrait CSS');
assert(about.includes('assets/profile-runtime-r14.js?v=20260717-r16'), 'About page does not pin the final portrait runtime');
assert(!about.includes('ca-siddharth-bhatia-profile.png'), 'About page still references the blank placeholder');
assert(about.includes(correctLinkedIn), 'About page lacks the correct LinkedIn profile');
assert(!about.includes(badLinkedIn), 'About page retains the broken LinkedIn URL');

const phase = fs.readFileSync(path.join(root, 'assets', 'phase1.css'), 'utf8');
assert(phase.includes(`content:url("${asset}?v=20260717-r16")`), 'CSS-level portrait protection is missing');

for (const name of ['assets/script.js', 'assets/profile-runtime-r14.js']) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  assert(source.includes(`${asset}?v=20260717-r16`), `${name} does not use the final portrait`);
  assert(source.includes(correctLinkedIn), `${name} lacks the correct LinkedIn profile`);
  assert(!source.includes(badLinkedIn), `${name} retains the broken LinkedIn URL`);
}

console.log('PASS final professional portrait source, fallback, cache and LinkedIn checks');
