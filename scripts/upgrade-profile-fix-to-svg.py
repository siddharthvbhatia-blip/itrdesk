from pathlib import Path

path = Path('scripts/apply-profile-multilayer-fix.py')
text = path.read_text(encoding='utf-8')

text = text.replace('VERSION = "20260717-r6"', 'VERSION = "20260717-r7"')
text = text.replace(
    'png_path = ROOT / "assets" / "ca-siddharth-bhatia-profile.png"\n'
    'if not jpg_path.exists() or not png_path.exists():\n'
    '    raise SystemExit("Existing verified profile photo assets are missing")',
    'svg_path = ROOT / "assets" / "ca-siddharth-bhatia-profile-fallback.svg"\n'
    'if not jpg_path.exists():\n'
    '    raise SystemExit("Verified JPEG profile photo asset is missing")\n'
    'jpg_data = jpg_path.read_bytes()\n'
    'if not jpg_data.startswith(b"\\xff\\xd8\\xff"):\n'
    '    raise SystemExit("Verified JPEG profile photo asset has an invalid signature")\n'
    'embedded = base64.b64encode(jpg_data).decode("ascii")\n'
    'svg_path.write_text(\n'
    '    \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">\'\n'
    '    \'<image href="data:image/jpeg;base64,\' + embedded + \'" width="256" height="256" preserveAspectRatio="xMidYMid slice"/>\'\n'
    '    \'</svg>\',\n'
    '    encoding="utf-8",\n'
    ')'
)
text = text.replace(
    'local_png = f"assets/ca-siddharth-bhatia-profile.png?v={VERSION}"',
    'local_svg = f"assets/ca-siddharth-bhatia-profile-fallback.svg?v={VERSION}"'
)
text = text.replace(
    'remote_png = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile.png"',
    'remote_jpg = "https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile-v3.jpg"'
)
text = text.replace('f\'data-fallback-src="{local_png}" \'', 'f\'data-fallback-src="{local_svg}" \'')
text = text.replace('f\'data-remote-fallback="{remote_png}" \'', 'f\'data-remote-fallback="{remote_jpg}" \'')
text = text.replace('{remote_png}', '{remote_jpg}')

text = text.replace(
    "const pngPath = path.join(root, 'assets', 'ca-siddharth-bhatia-profile.png');\n"
    "const jpg = fs.readFileSync(jpgPath);\n"
    "const png = fs.readFileSync(pngPath);",
    "const svgPath = path.join(root, 'assets', 'ca-siddharth-bhatia-profile-fallback.svg');\n"
    "const jpg = fs.readFileSync(jpgPath);\n"
    "const svg = fs.readFileSync(svgPath, 'utf8');"
)
text = text.replace(
    "assert(png.length > 30000, 'PNG profile photo is unexpectedly small');\n"
    "assert.deepEqual(\n"
    "  [...png.subarray(0, 8)],\n"
    "  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],\n"
    "  'PNG signature is invalid'\n"
    ");",
    "assert(svg.includes('<svg'), 'SVG fallback is invalid');\n"
    "const match = svg.match(/data:image\\/jpeg;base64,([^\"]+)/);\n"
    "assert(match, 'SVG fallback has no embedded JPEG');\n"
    "const embeddedJpg = Buffer.from(match[1], 'base64');\n"
    "assert.deepEqual([...embeddedJpg.subarray(0, 3)], [0xff, 0xd8, 0xff], 'SVG embedded JPEG signature is invalid');"
)

text = text.replace('20260717-r6', '20260717-r7')
text = text.replace(
    'assets/ca-siddharth-bhatia-profile.png',
    'assets/ca-siddharth-bhatia-profile-fallback.svg'
)
text = text.replace(
    'https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile-fallback.svg',
    'https://raw.githubusercontent.com/siddharthvbhatia-blip/itrdesk/main/assets/ca-siddharth-bhatia-profile-v3.jpg'
)
text = text.replace(
    "assets = ['assets/ca-siddharth-bhatia-profile-v3.jpg', 'assets/ca-siddharth-bhatia-profile-fallback.svg']",
    "assets = ['assets/ca-siddharth-bhatia-profile-v3.jpg']"
)
text = text.replace(
    'from io import BytesIO\n          import os',
    'from io import BytesIO\n          import base64\n          import os\n          import re'
)
needle = "                      assert image.size[0] >= 192 and image.size[1] >= 192, (asset, image.size)\n\n                  for page, minimum in pages:"
replacement = "                      assert image.size[0] >= 192 and image.size[1] >= 192, (asset, image.size)\n\n                  svg_req = urllib.request.Request(\n                      f'{base}assets/ca-siddharth-bhatia-profile-fallback.svg?smoke={build}-{attempt}',\n                      headers={'User-Agent':'ITR-Desk-photo-smoke/3.0','Cache-Control':'no-cache'},\n                  )\n                  svg = urllib.request.urlopen(svg_req, timeout=20).read().decode('utf-8')\n                  match = re.search(r'data:image/jpeg;base64,([^\"]+)', svg)\n                  assert match, 'SVG fallback has no embedded JPEG'\n                  embedded = base64.b64decode(match.group(1), validate=True)\n                  fallback = Image.open(BytesIO(embedded))\n                  fallback.verify()\n\n                  for page, minimum in pages:"
text = text.replace(needle, replacement)

required = [
    'ca-siddharth-bhatia-profile-fallback.svg',
    '20260717-r7',
    'remote_jpg',
    'SVG fallback has no embedded JPEG',
]
for value in required:
    if value not in text:
        raise SystemExit(f'Failed to insert required profile fix value: {value}')

path.write_text(text, encoding='utf-8')
print('Upgraded profile photo repair to verified JPEG + generated SVG fallback')
