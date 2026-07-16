from pathlib import Path
import base64
import re

ROOT = Path(__file__).resolve().parents[1]
PHOTO = ROOT / 'assets' / 'ca-siddharth-bhatia-profile-v3.jpg'
if not PHOTO.exists():
    raise SystemExit('Profile photo source is missing')
raw = PHOTO.read_bytes()
if not raw.startswith(b'\xff\xd8\xff'):
    raise SystemExit('Profile photo source is not a valid JPEG')
uri = 'data:image/jpeg;base64,' + base64.b64encode(raw).decode('ascii')

files = [ROOT / 'index.html', ROOT / 'about-ca-siddharth-bhatia.html']
pattern = re.compile(r'src="assets/ca-siddharth-bhatia-profile[^\"]*"')
for path in files:
    text = path.read_text(encoding='utf-8')
    updated, count = pattern.subn('src="' + uri + '"', text)
    if count == 0 and uri not in text:
        raise SystemExit(f'No profile photo reference found in {path.name}')
    path.write_text(updated, encoding='utf-8')

print('Embedded verified JPEG portrait into:', ', '.join(p.name for p in files))
