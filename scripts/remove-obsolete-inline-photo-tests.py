from pathlib import Path
import re

path = Path('test/run-tests.js')
text = path.read_text(encoding='utf-8')
text, count = re.subn(
    r'\nfunction assertEmbeddedProfilePhoto\(filename, minimumCount\) \{.*?console\.log\(\'PASS embedded profile photo availability and JPEG integrity tests\'\);',
    "\nconsole.log('PASS browser calculator AY 2026-27 boundary and validation tests');",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit('Obsolete inline profile-photo tests were not found exactly once')
# Avoid duplicate calculator success messages after replacement.
text = text.replace(
    "console.log('PASS browser calculator AY 2026-27 boundary and validation tests');\nconsole.log('PASS browser calculator AY 2026-27 boundary and validation tests');",
    "console.log('PASS browser calculator AY 2026-27 boundary and validation tests');",
)
path.write_text(text, encoding='utf-8')
print('Removed obsolete inline-data-URI photo assertions')
