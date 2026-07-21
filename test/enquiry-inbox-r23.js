'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const favicon = read('assets/favicon-ca-r23.svg');
const index = read('index.html');
const about = read('about-ca-siddharth-bhatia.html');
const privacy = read('privacy.html');
const admin = read('admin-inbox.html');
const client = read('assets/admin-inbox-r24.js');
const phase = read('assets/phase1.css');

assert(favicon.includes('viewBox="0 0 64 64"'), 'CA favicon SVG has an invalid viewBox');
for (const colour of ['#17639a','#f47920','#50b848']) assert(favicon.includes(colour), `CA favicon is missing ${colour}`);
assert(index.includes('rel="icon" href="assets/favicon-ca-r23.svg?v=20260721-r23"'), 'Homepage does not pin the CA favicon');
assert(about.includes('rel="icon" href="assets/favicon-ca-r23.svg?v=20260721-r23"'), 'About page does not pin the CA favicon');
assert(admin.includes('rel="icon" href="assets/favicon-ca-r23.svg?v=20260721-r24"'), 'Admin page does not pin the R24 CA favicon');
assert(index.includes('Send your message directly from the website.'), 'Homepage does not explain direct website enquiries');
assert(index.includes('private ITR Desk inbox'), 'Homepage does not confirm private inbox delivery');
assert(admin.includes('noindex, nofollow, noarchive'), 'Admin inbox is not excluded from indexing');
assert(admin.includes('assets/admin-inbox-r24.js?v=20260721-r24'), 'Admin inbox does not load the R24 trusted-device client');
assert(!admin.includes('type="password"') && !admin.includes('Inbox password'), 'Manual password form remains visible');
assert(client.includes('/api/enquiries'), 'Admin client does not use the protected inbox endpoint');
assert(client.includes('location.hash') && client.includes("parameters.get('access')"), 'Magic access link is not supported');
assert(client.includes('localStorage.setItem(ACCESS_STORAGE,access)'), 'Trusted-device access is not remembered');
assert(client.includes('history.replaceState'), 'Magic access token is not removed from the address bar');
assert(!admin.includes('itrdesk_hrOrZs0s8PFa6UNjcYyjAmmd') && !client.includes('itrdesk_hrOrZs0s8PFa6UNjcYyjAmmd'), 'Private magic key leaked into public files');
assert(phase.includes('.brand:not(.brand-with-ca-logo)::before'), 'Older pages do not receive the CA-logo lockup');
assert(phase.includes('ca-india-logo-r22.webp?v=20260721-r24'), 'Global CA-logo asset is not cache-busted');
assert(privacy.includes('Google Drive archive') && privacy.includes('Private administrator inbox'), 'Privacy page does not describe the enquiry data flow');

console.log('PASS global CA logo, direct enquiry copy, trusted-device inbox and privacy source checks');
