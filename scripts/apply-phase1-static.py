from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
LINKEDIN = "https://www.linkedin.com/in/ca-siddharth-bhatia-"
GOOGLE = "https://www.google.com/search?q=Siddharth+Bhatia+and+Co+Indore"

for path in ROOT.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    text = text.replace(">ITR Prep JSON<", ">ITR Review Draft<")
    text = text.replace("<h3>ITR Preparation JSON</h3>", "<h3>ITR Review Draft</h3>")
    text = text.replace("ITR preparation JSON</a>", "ITR review draft</a>")
    text = text.replace("<span>{ }</span>JSON", "<span>✓</span>Review")
    text = text.replace('src="assets/ca-siddharth-bhatia.jpeg"', 'src="assets/ca-siddharth-bhatia-profile.png"')
    if path.name == "itr-preparation-json.html":
        text = text.replace("ITR Preparation JSON for Professional Review AY 2026-27 | ITR Desk", "ITR Review Draft AY 2026-27 | ITR Desk")
        text = text.replace("ITR Preparation JSON for Professional Review | ITR Desk", "ITR Review Draft AY 2026-27 | ITR Desk")
        text = text.replace('"name":"ITR Preparation JSON for Professional Review AY 2026-27"', '"name":"ITR Review Draft AY 2026-27"')
        text = text.replace("7. Callback and paid JSON draft", "7. Callback and paid review draft")
        text = text.replace("Pay securely and unlock JSON", "Pay securely and unlock review draft")
        text = text.replace("Download preparation JSON", "Download ITR review draft")
    path.write_text(text, encoding="utf-8")

index = ROOT / "index.html"
text = index.read_text(encoding="utf-8")
text = re.sub(r'\n\s*<section class="language-strip">.*?</section>\s*', "\n", text, flags=re.S)
text = text.replace('"availableLanguage":["English","Hindi"]', '"availableLanguage":["English"]')
text = text.replace('"inLanguage":["en-IN","hi-IN"]', '"inLanguage":"en-IN"')
text = text.replace(
    '"areaServed":["Indore","Madhya Pradesh","India"],',
    '"areaServed":["Indore","Madhya Pradesh","India"],"sameAs":["' + LINKEDIN + '","' + GOOGLE + '"],'
)
text = text.replace(
    "This form prepares a WhatsApp message on your device. It does not upload or store the entries on the website.",
    "Submit only basic case details through the secure enquiry form. After successful submission, you will receive a reference number and do not need to send a separate WhatsApp message."
)
text = text.replace("Prepare WhatsApp enquiry", "Submit secure enquiry")
text = text.replace(
    "Your choice is stored only in this browser and is not displayed as a testimonial.",
    "Your preference is saved only on this device. It is not transmitted to ITR Desk or displayed as a testimonial."
)
index.write_text(text, encoding="utf-8")

about = ROOT / "about-ca-siddharth-bhatia.html"
text = about.read_text(encoding="utf-8")
if '"sameAs"' not in text:
    text = text.replace(
        '"knowsAbout":[',
        '"sameAs":["' + LINKEDIN + '","' + GOOGLE + '"],"knowsAbout":['
    )
about.write_text(text, encoding="utf-8")
