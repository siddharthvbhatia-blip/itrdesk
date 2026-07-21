'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets', 'clean-v2.css'), 'utf8');

const phoneDisplay = '+91 7879857126';
const phoneHref = 'tel:+917879857126';
const address = '444, Vikram Tower, Sapna Sangeeta Road, Indore – 452001';
const mapQuery = '444%2C+Vikram+Tower%2C+Sapna+Sangeeta+Road%2C+Indore+452001';

assert(html.includes('class="hero-contact-panel"'), 'Homepage hero contact panel is missing');
assert(html.includes(phoneDisplay), 'Homepage does not visibly show the office mobile number');
assert(html.includes(`href="${phoneHref}"`), 'Homepage click-to-call link is missing or incorrect');
assert(html.includes(address), 'Homepage does not visibly show the complete office address');
assert(html.includes(mapQuery), 'Homepage Google Maps link is missing or incorrect');
assert(html.includes('"streetAddress":"444, Vikram Tower, Sapna Sangeeta Road"'), 'Structured business street address is missing');
assert(html.includes('"postalCode":"452001"'), 'Structured business postal code is missing');
assert(html.includes('assets/clean-v2.css?v=20260721-r24'), 'Homepage does not pin the R24 contact stylesheet');
assert(css.includes('.hero-contact-panel{'), 'Contact panel styling is missing');
assert(css.includes('.hero-contact-item{'), 'Contact item styling is missing');
assert(css.includes('@media(max-width:720px)'), 'Mobile contact-panel layout safeguard is missing');
assert(css.includes('.hero-contact-panel{grid-template-columns:1fr;max-width:100%}'), 'Contact panel does not collapse safely on mobile');

console.log('PASS homepage mobile number, office address, call link, map link, schema and responsive contact styles');
