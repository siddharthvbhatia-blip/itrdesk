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
const client = read('assets/admin-inbox-r23.js');

assert(favicon.includes('viewBox="0 0 64 64"'), 'CA favicon SVG has an invalid viewBox');
for (const colour of ['#17639a','#f47920','#50b848']) assert(favicon.includes(colour), `CA favicon is missing ${colour}`);
for (const [name, page] of [['index',index],['about',about],['privacy',privacy],['admin',admin]]) {
  assert(page.includes('rel="icon" href="assets/favicon-ca-r23.svg?v=20260721-r23"'), `${name} page does not pin the CA favicon`);
}
assert(index.includes('Send your message directly from the website.'), 'Homepage does not explain direct website enquiries');
assert(index.includes('private ITR Desk inbox'), 'Homepage does not confirm private inbox delivery');
assert(admin.includes('noindex, nofollow, noarchive'), 'Admin inbox is not excluded from indexing');
assert(admin.includes('assets/admin-inbox-r23.js?v=20260721-r23'), 'Admin inbox does not load the R23 client');
assert(client.includes('/api/enquiries'), 'Admin client does not use the protected inbox endpoint');
assert(client.includes('sessionStorage'), 'Admin password is not limited to session storage');
assert(!client.includes('localStorage'), 'Admin password must never be kept in localStorage');
assert(!admin.includes('ITR-ZNV75aVi6XTPOmax') && !client.includes('ITR-ZNV75aVi6XTPOmax'), 'Private inbox password leaked into public files');
assert(!admin.includes('2b98045c6ed3e1bb') && !client.includes('2b98045c6ed3e1bb'), 'Private password hash leaked into public files');
assert(privacy.includes('Google Drive archive') && privacy.includes('Private administrator inbox'), 'Privacy page does not describe the new enquiry data flow');

console.log('PASS CA favicon, direct enquiry copy, private inbox and privacy source checks');
