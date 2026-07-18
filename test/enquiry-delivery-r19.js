'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'assets', 'enquiry-delivery-r19.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');

assert(index.includes('assets/enquiry-delivery-r19.js?v=20260718-r19'), 'Homepage does not load the cache-safe R19 enquiry client');
assert(!index.includes('assets/enquiry-reliability-r18.js'), 'Homepage still loads the previously cacheable R18 client');
assert(index.includes('GST / MCA / Other professional work'), 'Homepage case list is missing the professional-work option');
assert(client.includes("form.dataset.reliableEnquiry='r19'"), 'R19 client does not identify its active version');
assert(client.includes('attempt<=2'), 'Enquiry client does not retry transient backend failures');
assert(client.includes('12000'), 'Enquiry client lacks a bounded request timeout');
assert(client.includes('stopImmediatePropagation'), 'Reliable enquiry handler does not prevent the older handler from also firing');
assert(client.includes('https://formsubmit.co/ajax/siddharth.v.bhatia@gmail.com'), 'Enquiry client lacks the direct secondary delivery route');
assert(client.includes('postDirectProvider'), 'Enquiry client does not attempt direct secondary delivery');
assert(client.includes('Automatic delivery is temporarily unavailable.'), 'Enquiry client lacks a generic failure message');
assert(!client.includes('not configured'), 'Enquiry client exposes configuration-specific wording');
assert(privacy.includes('FormSubmit'), 'Privacy page does not disclose the secondary enquiry provider');
assert(privacy.includes('Resend'), 'Privacy page does not disclose the primary enquiry provider');
assert(privacy.includes('submitted directly over HTTPS'), 'Privacy page does not disclose direct browser fallback');
assert(privacy.includes('WhatsApp is shown only if the backend attempts and the direct secondary delivery all fail'), 'Privacy page does not explain final fallback timing');

console.log('PASS cache-safe R19 client, backend retry, direct delivery and final fallback checks');
