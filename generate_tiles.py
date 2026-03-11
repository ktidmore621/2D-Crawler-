from PIL import Image, ImageDraw, ImageFilter
import os, random

TILE = 48
os.makedirs('public/assets/tilesets/generated', exist_ok=True)

def save(img, name):
    img.save(f'public/assets/tilesets/generated/{name}.png')
    print(f'Saved {name}.png')

# --- GRASS (3 variants) ---
for v in range(3):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    base = [(82,130,48),(78,124,44),(88,138,52)][v]
    d.rectangle([0,0,TILE,TILE], fill=base)
    rng = random.Random(v * 999)
    for _ in range(18):
        x,y = rng.randint(2,44), rng.randint(2,44)
        shade = rng.choice([(70,110,38),(95,148,58),(60,100,30)])
        d.point([x,y], fill=shade)
        d.point([x+1,y], fill=shade)
    # subtle darker bottom edge for 3/4 depth
    for x in range(TILE):
        d.point([x, TILE-1], fill=(60,100,30,180))
    save(img, f'grass_{v}')

# --- DIRT PATH (2 variants) ---
for v in range(2):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    base = [(168,120,72),(155,108,62)][v]
    d.rectangle([0,0,TILE,TILE], fill=base)
    rng = random.Random(v * 777 + 100)
    for _ in range(14):
        x,y = rng.randint(2,44), rng.randint(2,44)
        shade = rng.choice([(140,95,52),(185,138,88),(120,80,40)])
        d.point([x,y], fill=shade)
        d.point([x,y+1], fill=shade)
    # wheel track lines
    for x in range(TILE):
        d.point([x,16], fill=(140,95,52,120))
        d.point([x,32], fill=(140,95,52,120))
    save(img, f'dirt_{v}')

# --- WATER (animated, 3 frames) ---
for f in range(3):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    d.rectangle([0,0,TILE,TILE], fill=(48,120,180))
    rng = random.Random(f * 555)
    # ripple lines
    offset = f * 4
    for y in range(4, TILE-4, 8):
        for x in range(0, TILE-4, 12):
            xo = (x + offset) % (TILE-4)
            d.arc([xo, y, xo+8, y+4], 180, 360, fill=(80,160,220,180), width=1)
    # sparkle dots
    for _ in range(5):
        x,y = rng.randint(4,42), rng.randint(4,42)
        d.ellipse([x,y,x+2,y+2], fill=(180,220,255,200))
    save(img, f'water_{f}')

# --- SHALLOW WATER ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(72,150,200))
rng = random.Random(888)
for _ in range(8):
    x,y = rng.randint(2,44), rng.randint(2,44)
    d.ellipse([x,y,x+3,y+3], fill=(100,180,230,160))
save(img, 'shallow_water')

# --- STONE / RUIN FLOOR (2 variants) ---
for v in range(2):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    base = [(110,98,82),(98,88,72)][v]
    d.rectangle([0,0,TILE,TILE], fill=base)
    # stone block pattern
    for row in range(3):
        y1 = row * 16
        offset = 8 if row % 2 else 0
        for col in range(4):
            x1 = col * 16 - offset
            d.rectangle([x1+1,y1+1,x1+14,y1+14], fill=(118,106,90))
            d.line([x1,y1,x1+15,y1], fill=(80,70,58), width=1)
            d.line([x1,y1,x1,y1+15], fill=(80,70,58), width=1)
    save(img, f'stone_{v}')

# --- MOUNTAIN WALL ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(88,82,72))
# rocky face
d.polygon([(0,30),(12,18),(24,26),(36,14),(48,22),(48,48),(0,48)], fill=(72,66,58))
d.polygon([(0,38),(10,28),(20,34),(30,24),(40,30),(48,26),(48,48),(0,48)], fill=(58,52,44))
# highlights
d.line([(12,18),(0,30)], fill=(108,100,88), width=1)
d.line([(24,26),(36,14)], fill=(108,100,88), width=1)
save(img, 'mountain')

# --- PLATEAU ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(98,118,68))
rng = random.Random(444)
for _ in range(12):
    x,y = rng.randint(2,44), rng.randint(2,44)
    d.point([x,y], fill=(80,98,52))
# cliff edge hint at bottom
d.rectangle([0,42,TILE,TILE], fill=(72,88,44))
save(img, 'plateau')

# --- CRATER FLOOR ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(42,36,28))
# scorch marks
rng = random.Random(222)
for _ in range(10):
    x,y = rng.randint(4,40), rng.randint(4,40)
    d.ellipse([x,y,x+6,y+4], fill=(28,22,16,200))
# crack lines
d.line([(8,8),(20,22),(14,36)], fill=(58,48,36), width=1)
d.line([(30,4),(38,18),(28,32)], fill=(58,48,36), width=1)
save(img, 'crater')

# --- HIGHWAY ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(72,70,65))
# lane marking
d.rectangle([22,0,26,20], fill=(200,180,60,180))
d.rectangle([22,28,26,48], fill=(200,180,60,180))
# edge lines
d.line([(2,0),(2,48)], fill=(180,175,165,200), width=1)
d.line([(46,0),(46,48)], fill=(180,175,165,200), width=1)
# crack
rng = random.Random(333)
d.line([(10,10),(18,22),(12,34)], fill=(52,50,45), width=1)
save(img, 'highway')

# --- FARMLAND ---
img = Image.new('RGBA', (TILE, TILE))
d = ImageDraw.Draw(img)
d.rectangle([0,0,TILE,TILE], fill=(118,85,45))
# furrow lines
for y in range(0, TILE, 6):
    d.line([(0,y),(TILE,y)], fill=(98,68,32), width=1)
# occasional grass clump
rng = random.Random(111)
for _ in range(4):
    x,y = rng.randint(4,40), rng.randint(4,40)
    d.ellipse([x,y,x+5,y+4], fill=(78,118,42,200))
save(img, 'farmland')

# --- GRASS-TO-DIRT TRANSITIONS (4 edges + 4 corners) ---
grass_color = (82,130,48)
dirt_color = (168,120,72)

def make_transition(name, grass_from_top, grass_from_right, grass_from_bottom, grass_from_left):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    # Base is dirt
    d.rectangle([0,0,TILE,TILE], fill=dirt_color)
    # Grass bites in from the specified edge
    if grass_from_top:
        for x in range(0, TILE, 4):
            h = 14 + (x % 3) * 3
            d.rectangle([x, 0, x+4, h], fill=grass_color)
    if grass_from_bottom:
        for x in range(0, TILE, 4):
            h = TILE - 14 - (x % 3) * 3
            d.rectangle([x, h, x+4, TILE], fill=grass_color)
    if grass_from_left:
        for y in range(0, TILE, 4):
            w = 14 + (y % 3) * 3
            d.rectangle([0, y, w, y+4], fill=grass_color)
    if grass_from_right:
        for y in range(0, TILE, 4):
            w = TILE - 14 - (y % 3) * 3
            d.rectangle([w, y, TILE, y+4], fill=grass_color)
    save(img, name)

make_transition('trans_grass_N',  True,  False, False, False)  # grass bites from top
make_transition('trans_grass_S',  False, False, True,  False)  # grass bites from bottom
make_transition('trans_grass_E',  False, False, False, True)   # grass bites from right
make_transition('trans_grass_W',  False, True,  False, False)  # grass bites from left
make_transition('trans_grass_NE', True,  False, False, True)
make_transition('trans_grass_NW', True,  True,  False, False)
make_transition('trans_grass_SE', False, False, True,  True)
make_transition('trans_grass_SW', False, True,  True,  False)

# --- WATER SHORELINE TRANSITIONS ---
water_color = (48,120,180)

def make_shore(name, water_top, water_right, water_bottom, water_left):
    img = Image.new('RGBA', (TILE, TILE))
    d = ImageDraw.Draw(img)
    d.rectangle([0,0,TILE,TILE], fill=grass_color)
    if water_top:    d.rectangle([0,0,TILE,22], fill=water_color)
    if water_bottom: d.rectangle([0,26,TILE,TILE], fill=water_color)
    if water_left:   d.rectangle([0,0,22,TILE], fill=water_color)
    if water_right:  d.rectangle([26,0,TILE,TILE], fill=water_color)
    save(img, name)

make_shore('shore_N',  True,  False, False, False)
make_shore('shore_S',  False, False, True,  False)
make_shore('shore_E',  False, True,  False, False)
make_shore('shore_W',  False, False, False, True)
make_shore('shore_NE', True,  True,  False, False)
make_shore('shore_NW', True,  False, False, True)
make_shore('shore_SE', False, True,  True,  False)
make_shore('shore_SW', False, False, True,  True)

print('All terrain tiles generated!')
