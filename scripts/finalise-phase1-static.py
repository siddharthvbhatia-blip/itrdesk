from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
path = root / "index.html"
text = path.read_text(encoding="utf-8")

text = re.sub(
    r'<nav id="site-nav" class="site-nav" aria-label="Primary navigation">.*?</nav>',
    '<nav id="site-nav" class="site-nav" aria-label="Primary navigation"><a href="index.html" aria-current="page">Home</a><a href="calculator.html">Tax Calculator</a><a href="itr-preparation-json.html">ITR Review Draft</a><a href="#guides">Guides</a><a href="about-ca-siddharth-bhatia.html">About</a><a href="contact.html">Contact</a></nav>',
    text,
    count=1,
    flags=re.S,
)
text = re.sub(
    r'<div class="hero-actions">.*?</div>',
    '<div class="hero-actions"><a class="btn primary" href="calculator.html" data-track="hero_calculator">Check my tax</a><a class="btn secondary" href="#enquiry" data-track="hero_enquiry">Request professional assistance</a></div>',
    text,
    count=1,
    flags=re.S,
)
text = text.replace('<span class="status-chip">Start in under a minute</span>', '<span class="status-chip">Simple, guided starting points</span>')
text = text.replace('<h2>What do you need today?</h2>', '<h2>Choose one starting point</h2>')
text = re.sub(
    r'<div class="quick-links">.*?</div>\s*</aside>',
    '<div class="quick-links"><a href="calculator.html"><strong>Calculate and compare tax</strong><span>Estimate the old and new regime position with special-rate income.</span></a><a href="itr-preparation-json.html"><strong>Prepare an ITR review draft</strong><span>Organise confirmed figures for professional review; this is not a portal-upload JSON.</span></a><a href="checklist.html"><strong>Get the right document checklist</strong><span>Prepare records before requesting professional assistance.</span></a></div></aside>',
    text,
    count=1,
    flags=re.S,
)
text = text.replace(
    'I choose to send these basic details on WhatsApp for a checklist and scope discussion. I understand this alone does not create a professional engagement.',
    'I choose to submit these basic details securely for a checklist and scope discussion. I understand this alone does not create a professional engagement.'
)
text = text.replace('Is the ITR preparation JSON ready to upload on the portal?', 'Is the ITR review draft ready to upload on the portal?')
text = re.sub(
    r'<nav class="mobile-dock" aria-label="Mobile quick actions">.*?</nav>',
    '<nav class="mobile-dock" aria-label="Mobile quick actions"><a href="calculator.html"><span>₹</span>Tax</a><a href="itr-preparation-json.html"><span>✓</span>Review</a><a href="checklist.html"><span>☑</span>Checklist</a><a href="contact.html"><span>↗</span>Contact</a></nav>',
    text,
    count=1,
    flags=re.S,
)
path.write_text(text, encoding="utf-8")
