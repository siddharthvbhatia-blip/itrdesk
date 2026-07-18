'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'assets', 'enquiry-delivery-r20.js'), 'utf8');
const confirmation = fs.readFileSync(path.join(root, 'enquiry-received.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');

assert(index.includes('assets/enquiry-delivery-r20.js?v=20260718-r20'), 'Homepage does not load the no-CORS R20 enquiry client');
assert(!index.includes('assets/enquiry-delivery-r19.js'), 'Homepage still loads the CORS-dependent R19 client');
assert(client.includes("form.dataset.reliableEnquiry='r20'"), 'R20 client does not identify its active version');
assert(client.includes("const NATIVE_PROVIDER='https://formsubmit.co/siddharth.v.bhatia@gmail.com'"), 'R20 client lacks the standard HTML form provider route');
assert(!client.includes('formsubmit.co/ajax/'), 'R20 client still depends on the CORS-blocked AJAX route');
assert(client.includes("form.method='POST'"), 'Native fallback is not a POST form');
assert(client.includes('form.target=frameName'), 'Native fallback does not isolate provider navigation in a hidden frame');
assert(client.includes("_next:returnUrl"), 'Native fallback lacks a same-origin confirmation return');
assert(client.includes('iframe.contentWindow.location.href'), 'Native fallback does not verify the same-origin confirmation page');
assert(client.includes('attempt<=2'), 'Enquiry client does not retry transient backend failures');
assert(client.includes('stopImmediatePropagation'), 'Reliable handler does not block the older handler');
assert(client.includes('ITRDeskEnquiryNativeTimeout'), 'Native delivery timeout is not testable and bounded');
assert(confirmation.includes('noindex, nofollow'), 'Confirmation page should not be indexed');
assert(privacy.includes('submitted directly over HTTPS'), 'Privacy page does not disclose direct browser delivery');

console.log('PASS no-CORS native POST, same-origin confirmation, backend retry and final fallback checks');
