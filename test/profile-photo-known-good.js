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

const phase = fs.readFileSync(path.join(root, 'assets', 'phase1.css'), 'utf8');
const portrait = fs.readFileSync(path.join(root, 'assets', 'profile-photo.css'), 'utf8');

assert(!phase.includes('.profile-hero-photo,.professional-portrait,.sidebar-portrait{overflow:hidden'), 'Destructive shared overflow rule returned');
assert(phase.includes('.sidebar-card,.profile-sidebar{position:static!important'), 'Mobile sticky-sidebar reset is missing');
assert(phase.includes('.profile-hero-photo,.profile-hero-photo img{width:144px!important;height:144px!important'), 'Mobile hero portrait dimensions are not locked square');
assert(phase.includes('.professional-portrait{width:160px!important;max-width:160px!important;height:auto!important'), 'Homepage figure is not separated from its circular image');
assert(phase.includes('.professional-portrait img{width:144px!important;height:144px!important'), 'Homepage mobile portrait is not locked square');
assert(phase.includes('.professional-card>*{position:static!important;grid-column:auto!important'), 'Mobile professional-card stacking reset is missing');
assert(phase.includes('.professional-verification dl div{grid-template-columns:minmax(0,1fr)!important'), 'Verification rows do not collapse safely on mobile');
assert(portrait.includes('aspect-ratio:1/1'), 'Portrait base stylesheet lacks square aspect ratio');
assert(portrait.includes('border-radius:50%'), 'Portrait base stylesheet lacks circular clipping');

console.log('PASS profile image integrity, circular geometry and mobile overlap regression checks');