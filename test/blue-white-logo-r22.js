'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const phase = fs.readFileSync(path.join(root, 'assets', 'phase1.css'), 'utf8');
const theme = fs.readFileSync(path.join(root, 'assets', 'blue-white-r22.css'), 'utf8');
const logo = fs.readFileSync(path.join(root, 'assets', 'ca-india-logo-r22.webp'));

assert(index.includes('class="brand brand-with-ca-logo"'), 'Homepage brand does not contain the CA logo lockup');
assert(index.includes('assets/ca-india-logo-r22.webp?v=20260721-r22'), 'Homepage does not use the versioned CA logo asset');
assert(index.includes('assets/blue-white-r22.css?v=20260721-r22'), 'Homepage does not load the blue-white theme directly');
assert(index.includes('<meta name="theme-color" content="#17639a"'), 'Browser theme colour is not blue');
assert(!index.includes('theme-color" content="#0f6b5d"'), 'Old green browser theme colour remains');
assert(phase.startsWith('@import url("blue-white-r22.css?v=20260721-r22");'), 'Global phase stylesheet does not import the blue-white theme');
assert(theme.includes('--green:#17639a'), 'Primary website colour is not the approved blue');
assert(theme.includes('--cream:#f6faff'), 'Muted background is not blue-white');
assert(theme.includes('.site-footer,.clean-footer{background:#092b49'), 'Footer is not navy blue');
assert(theme.includes('.ca-india-logo'), 'CA logo responsive styling is missing');
assert(logo.length > 5000, 'CA logo web asset is unexpectedly small');
assert.equal(logo.subarray(0, 4).toString('ascii'), 'RIFF', 'CA logo is not a WebP asset');
assert.equal(logo.subarray(8, 12).toString('ascii'), 'WEBP', 'CA logo WebP signature is invalid');

console.log('PASS CA logo asset, homepage lockup, global blue-white theme and cache version checks');
