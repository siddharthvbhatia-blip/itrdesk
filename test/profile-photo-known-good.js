'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const legacy = fs.readFileSync(path.join(root, 'assets', 'ca-siddharth-bhatia.jpeg'));
assert(legacy.length > 10000, 'Legacy fallback photo is unexpectedly small');
assert.deepEqual([...legacy.subarray(0, 3)], [0xff, 0xd8, 0xff], 'Legacy fallback is not a JPEG');

const approved = fs.readFileSync(path.join(root, 'assets', 'ca-siddharth-bhatia-profile.png'));
assert(approved.length > 10000, 'Approved professional portrait is unexpectedly small');
assert.deepEqual([...approved.subarray(0, 8)], [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a], 'Approved portrait is not a PNG');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(index.includes('data-profile-photo'), 'index.html lacks a profile marker');
assert(index.includes('assets/ca-siddharth-bhatia.jpeg?v=20260717-r9'), 'index.html lost its current verified fallback');

const about = fs.readFileSync(path.join(root, 'about-ca-siddharth-bhatia.html'), 'utf8');
assert((about.match(/data-profile-photo/g) || []).length >= 2, 'About page lacks both profile markers');
assert(about.includes('assets/ca-siddharth-bhatia-profile.png?v=20260717-r14'), 'About page does not use the cache-safe approved portrait');
assert(about.includes('data-remote-fallback="https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"'), 'About page lacks the approved portrait fallback');
assert(!about.includes('src="data:image/jpeg;base64,'), 'About page contains an unsupported inline portrait');

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
console.log('PASS approved portrait, circular geometry and mobile overlap regression checks');
