'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const visibleText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const words = (html) => visibleText(html).split(/\s+/).filter(Boolean).length;
const sections = (html) => (html.match(/<section\b/gi) || []).length;
const hasCleanStyles = html => /assets\/clean-v2\.css\?v=202607(?:18-r17|21-r22|21-r24)/.test(html);

const home = read('index.html');
const about = read('about-ca-siddharth-bhatia.html');

assert(hasCleanStyles(home), 'Homepage does not load the clean presentation stylesheet');
assert(hasCleanStyles(about), 'About page does not load the clean presentation stylesheet');
assert(sections(home) <= 6, `Homepage is still too long: ${sections(home)} sections`);
assert(sections(about) <= 5, `About page is still too long: ${sections(about)} sections`);
assert(words(home) < 850, `Homepage visible copy is still too long: ${words(home)} words`);
assert(words(about) < 620, `About page visible copy is still too long: ${words(about)} words`);

for (const oldClass of ['trust-strip','need-section','form-finder-section','tools-showcase','sample-section','deadline-section','safety-section','process-section','feedback-section']) {
  assert(!home.includes(oldClass), `Homepage still contains the old ${oldClass} section`);
}

for (const link of ['calculator.html','itr-preparation-json.html','checklist.html','tax-tools.html','about-ca-siddharth-bhatia.html','contact.html']) {
  assert(home.includes(link), `Homepage lost required link: ${link}`);
}
for (const service of ['Income Tax &amp; ITR','GST','Project Finance &amp; CMA','MCA &amp; Company Compliance','Physical Shares to Demat','Trusts &amp; Audits']) {
  assert(home.includes(service), `Homepage lost service summary: ${service}`);
}

assert((home.match(/<details\b/g) || []).length === 3, 'Homepage should show exactly three concise FAQs');
assert(home.includes('name="name"') && home.includes('name="phone"') && home.includes('name="caseType"'), 'Concise enquiry form lost required fields');
assert(!home.includes('name="email"') && !home.includes('name="city"') && !home.includes('<fieldset>'), 'Long enquiry form fields returned');
assert(home.includes('ca-siddharth-bhatia-final-r16.jpg?v=20260718-r17'), 'Homepage final portrait is missing');
assert(about.includes('ca-siddharth-bhatia-final-r16.jpg?v=20260718-r17'), 'About final portrait is missing');
assert(!home.includes('https://www.linkedin.com/in/ca-siddharth-bhatia-'), 'Homepage contains broken LinkedIn URL');
assert(!about.includes('https://www.linkedin.com/in/ca-siddharth-bhatia-'), 'About page contains broken LinkedIn URL');

console.log('PASS concise homepage and About-page content limits, links, form, portrait and clean stylesheet checks');
