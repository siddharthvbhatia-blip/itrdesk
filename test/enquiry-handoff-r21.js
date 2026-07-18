'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'assets', 'enquiry-handoff-r21.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');

assert(index.includes('assets/enquiry-handoff-r21.js?v=20260718-r21'), 'Homepage does not load the R21 enquiry handoff');
assert(!index.includes('assets/enquiry-delivery-r20.js'), 'Homepage still loads the blocked R20 provider route');
assert(!index.includes('assets/enquiry-delivery-r19.js'), 'Homepage still loads the blocked R19 provider route');
assert(client.includes("form.dataset.reliableEnquiry='r21'"), 'R21 client does not identify its active version');
assert(client.includes('attempt<=2'), 'R21 client does not retry the secure backend');
assert(client.includes('12000'), 'R21 client lacks a bounded request timeout');
assert(client.includes('stopImmediatePropagation'), 'R21 client does not prevent the older form handler from firing');
assert(client.includes("location.assign(fallback.href)"), 'R21 client does not automatically open the prepared WhatsApp enquiry');
assert(client.includes('ITRDeskDisableAutoWhatsApp'), 'R21 automatic handoff cannot be disabled for deterministic testing');
assert(client.includes('WA-${date}-${random}'), 'R21 client does not create a traceable WhatsApp reference');
assert(client.includes('Tap Send there to complete it'), 'R21 client does not explain that the visitor must tap Send');
assert(!client.includes('formsubmit.co'), 'R21 client retains the blocked third-party form dependency');
assert(!client.includes('not configured'), 'R21 client exposes configuration-specific wording');
assert(privacy.includes('opens WhatsApp'), 'Privacy page does not disclose the automatic WhatsApp handoff');
assert(privacy.includes('only when you tap Send in WhatsApp'), 'Privacy page does not explain when the enquiry is completed');

console.log('PASS backend retry, cache-safe R21 handoff, prepared WhatsApp reference and privacy wording');
