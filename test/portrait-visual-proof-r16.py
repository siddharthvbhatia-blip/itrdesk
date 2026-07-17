from pathlib import Path
from PIL import Image, ImageStat

root = Path(__file__).resolve().parents[1]
path = root / 'assets' / 'ca-siddharth-bhatia-final-r16.jpg'
image = Image.open(path).convert('RGB')
image.load()
assert image.width >= 170 and image.height >= 170, image.size
stats = ImageStat.Stat(image)
assert max(stats.stddev) > 60, f'Portrait lacks photographic variation: {stats.stddev}'
pixels = list(image.resize((90, 90)).getdata())
dark_ratio = sum(1 for pixel in pixels if sum(pixel) / 3 < 80) / len(pixels)
assert dark_ratio > 0.10, f'Portrait resembles a pale placeholder: {dark_ratio}'
print('PASS final portrait contains visible photographic content', image.size, stats.stddev, dark_ratio)
