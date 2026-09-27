import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

TARGET_MODELS = ['13pro', '14pro', '15pro', '16pro', '17pro', '18pro']

# Load base badge assets
bat_badge = Image.open('assets/badge_battery.png').convert('RGBA')
pcb_badge = Image.open('assets/badge_circuit_boards.png').convert('RGBA')
coil_badge = Image.open('assets/badge_other.png').convert('RGBA')
disp_badge = Image.open('assets/badge_display.png').convert('RGBA')
frame_badge = Image.open('assets/badge_stainless_steel.png').convert('RGBA')

# Model-specific hardware specifications
MODEL_SPECS = {
    'xs': {
        'chip': 'A12', 'chip_sub': 'Bionic • 7nm', 'has_magsafe': False,
        'bat_type': 'pouch_l', 'bat_cap': '2658 mAh', 'bat_label': 'Li-ion • Apple Daisy Recycled',
        'frame_type': 'steel_round', 'frame_color': (0, 113, 227), 'notch': 'wide_notch'
    },
    '11pro': {
        'chip': 'A13', 'chip_sub': 'Bionic • 7nm+', 'has_magsafe': False,
        'bat_type': 'pouch_l', 'bat_cap': '3046 mAh', 'bat_label': '100% Recycled Tin Solder',
        'frame_type': 'steel_round', 'frame_color': (0, 113, 227), 'notch': 'wide_notch'
    },
    '12pro': {
        'chip': 'A14', 'chip_sub': 'Bionic • 5nm', 'has_magsafe': True,
        'bat_type': 'rect', 'bat_cap': '2815 mAh', 'bat_label': 'MagSafe Compatible Li-ion',
        'frame_type': 'steel_flat', 'frame_color': (0, 122, 255), 'notch': 'narrow_notch'
    },
    '13pro': {
        'chip': 'A15', 'chip_sub': 'Bionic • 5nm+', 'has_magsafe': True,
        'bat_type': 'pouch_l', 'bat_cap': '3095 mAh', 'bat_label': 'High-Density Cobalt Cathode',
        'frame_type': 'steel_flat', 'frame_color': (0, 122, 255), 'notch': 'narrow_notch'
    },
    '14pro': {
        'chip': 'A16', 'chip_sub': 'Bionic • 4nm', 'has_magsafe': True,
        'bat_type': 'rect', 'bat_cap': '3200 mAh', 'bat_label': 'Dual-Cell Balanced Pack',
        'frame_type': 'steel_flat', 'frame_color': (0, 122, 255), 'notch': 'dynamic_island'
    },
    '15pro': {
        'chip': 'A17 Pro', 'chip_sub': '3nm • Ray Tracing', 'has_magsafe': True,
        'bat_type': 'rect', 'bat_cap': '3274 mAh', 'bat_label': '100% Recycled Cobalt Cell',
        'frame_type': 'titanium_brushed', 'frame_color': (48, 176, 199), 'notch': 'dynamic_island'
    },
    '16pro': {
        'chip': 'A18 Pro', 'chip_sub': '2nd Gen 3nm • NPU', 'has_magsafe': True,
        'bat_type': 'metal_case', 'bat_cap': '3582 mAh', 'bat_label': 'Steel-Cased Thermal Matrix',
        'frame_type': 'titanium_microblast', 'frame_color': (212, 175, 55), 'notch': 'dynamic_island'
    },
    '17pro': {
        'chip': 'A19 Pro', 'chip_sub': '2nm GAA • Neural Engine', 'has_magsafe': True,
        'bat_type': 'silicon_anode', 'bat_cap': '3950 mAh', 'bat_label': 'Silicon-Anode Solid State',
        'frame_type': 'liquid_titanium', 'frame_color': (80, 227, 194), 'notch': 'under_display'
    },
    '18pro': {
        'chip': 'A20 Pro', 'chip_sub': '1.8nm Photonic Core', 'has_magsafe': True,
        'bat_type': 'graphene_cell', 'bat_cap': '4200 mAh', 'bat_label': 'Closed-Loop Graphene Cell',
        'frame_type': 'liquid_titanium', 'frame_color': (140, 237, 140), 'notch': 'under_display'
    }
}

# Subpixel 2048x1152 coordinate bounds for left phone (front display) and right phone (rear chassis)
PHONE_GEOMETRY = {
    'xs':    {'front': (684, 546, 836, 1148), 'back': (760, 557, 972, 1148), 'cx_back': 866, 'cy_back': 844},
    '11pro': {'front': (511, 540, 811, 1147), 'back': (900, 555, 1145, 1147), 'cx_back': 1022, 'cy_back': 851},
    '12pro': {'front': (595, 554, 820, 1146), 'back': (841, 554, 1060, 1145), 'cx_back': 950, 'cy_back': 849},
    '13pro': {'front': (533, 542, 827, 1147), 'back': (872, 546, 1124, 1147), 'cx_back': 998, 'cy_back': 846},
    '14pro': {'front': (552, 547, 837, 1147), 'back': (865, 554, 1107, 1147), 'cx_back': 986, 'cy_back': 850},
    '15pro': {'front': (587, 555, 825, 1141), 'back': (846, 555, 1068, 1144), 'cx_back': 957, 'cy_back': 849},
    '16pro': {'front': (578, 553, 810, 1147), 'back': (845, 553, 1077, 1147), 'cx_back': 961, 'cy_back': 850},
    '17pro': {'front': (581, 552, 815, 1147), 'back': (841, 553, 1075, 1147), 'cx_back': 958, 'cy_back': 850},
    '18pro': {'front': (583, 551, 810, 1142), 'back': (846, 551, 1073, 1142), 'cx_back': 959, 'cy_back': 846},
}

def draw_chip_label(draw, cx, cy, chip_name, sub_name, color=(255, 255, 255)):
    w, h = 90, 80
    x0, y0 = cx - w//2, cy - h//2
    draw.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=8, fill=(20, 24, 28, 240), outline=color, width=2)
    draw.ellipse([cx - 7, y0 + 12, cx + 7, y0 + 26], fill=color)
    draw.text((cx - len(chip_name)*4, y0 + 34), chip_name, fill=color)
    draw.text((cx - len(sub_name)*3, y0 + 52), sub_name, fill=(180, 200, 220))

def create_battery_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    rx0, ry0, rx1, ry1 = geo['back']
    rw = rx1 - rx0
    if model == 'xs':
        bx0, by0, bx1, by1 = 812, 770, 928, 1040
    else:
        bw = int(rw * 0.52)
        bx0 = geo['cx_back'] - bw // 2 - 10
        bx1 = bx0 + bw
        by0 = ry0 + int((ry1 - ry0) * 0.36)
        by1 = ry1 - int((ry1 - ry0) * 0.15)
    bw, bh = bx1 - bx0, by1 - by0

    # 1. Dark smoky glass window for internal cavity
    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.rounded_rectangle([bx0, by0, bx1, by1], radius=16, fill=225)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    
    tint_color = (18, 22, 28, 210) if spec['bat_type'] == 'metal_case' else (10, 16, 22, 195)
    tint = Image.new('RGBA', (w, h), tint_color)
    comp = Image.composite(tint, comp, mask)

    # 2. Battery pack hardware render with model-specific styling
    bat_scaled = bat_badge.resize((bw - 12, bh - 12), Image.Resampling.LANCZOS)
    if spec['bat_type'] == 'metal_case':
        enhancer = ImageEnhance.Color(bat_scaled)
        bat_scaled = enhancer.enhance(0.4)
        enhancer_b = ImageEnhance.Brightness(bat_scaled)
        bat_scaled = enhancer_b.enhance(1.25)
    comp.paste(bat_scaled, (bx0 + 6, by0 + 6), bat_scaled)

    # 3. Model-specific battery markings
    dcomp = ImageDraw.Draw(comp)
    dcomp.text((bx0 + 16, by0 + bh - 44), spec['bat_cap'], fill=(255, 255, 255, 220))
    dcomp.text((bx0 + 16, by0 + bh - 26), spec['bat_label'], fill=(160, 220, 180, 200))

    # 4. Radiant neon green bloom
    neon_green = (52, 199, 89, 255)
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([bx0, by0, bx1, by1], radius=16, outline=neon_green, width=8)
    bloom = bloom.filter(ImageFilter.GaussianBlur(12))

    # 5. Crisp inner neon stroke + core white specular
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([bx0, by0, bx1, by1], radius=16, outline=(120, 255, 170, 255), width=4)
    dline.rounded_rectangle([bx0+1, by0+1, bx1-1, by1-1], radius=15, outline=(255, 255, 255, 230), width=2)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_circuit_boards_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    rx0, ry0, rx1, ry1 = geo['back']
    rw = rx1 - rx0
    if model == 'xs':
        px0, py0, px1, py1 = 824, 552, 942, 744
        cx0, cy0, cx1, cy1 = 774, 554, 824, 686
    else:
        cx0 = rx0 + 14
        cx1 = rx0 + int(rw * 0.44)
        cy0 = ry0 + 14
        cy1 = ry0 + int((ry1 - ry0) * 0.28)
        px0 = cx1 + 4
        px1 = rx1 - 18
        py0 = ry0 + 14
        py1 = ry0 + int((ry1 - ry0) * 0.35)
    pw, ph = px1 - px0, py1 - py0

    # 1. Dark cavity
    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.rounded_rectangle([px0, py0, px1, py1], radius=14, fill=225)
    dmask.rounded_rectangle([cx0, cy0, cx1, cy1], radius=16, fill=225)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    tint = Image.new('RGBA', (w, h), (10, 15, 24, 195))
    comp = Image.composite(tint, comp, mask)

    # 2. Logic board hardware render
    pcb_scaled = pcb_badge.resize((pw - 8, ph - 8), Image.Resampling.LANCZOS)
    comp.paste(pcb_scaled, (px0 + 4, py0 + 4), pcb_scaled)

    # 3. Model-specific Silicon Chip overlay (A12 through A20 Pro)
    chip_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dchip = ImageDraw.Draw(chip_layer)
    draw_chip_label(dchip, (px0 + px1)//2, (py0 + py1)//2 - 6, spec['chip'], spec['chip_sub'], (255, 255, 255))
    comp = Image.alpha_composite(comp, chip_layer)

    # 4. Cyan & Lime circuitry neon bloom
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([px0, py0, px1, py1], radius=14, outline=(48, 209, 88, 255), width=7)
    dbloom.rounded_rectangle([cx0, cy0, cx1, cy1], radius=16, outline=(100, 210, 255, 255), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(10))

    # 5. Crisp neon edge
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([px0, py0, px1, py1], radius=14, outline=(140, 255, 170, 255), width=3)
    dline.rounded_rectangle([cx0, cy0, cx1, cy1], radius=16, outline=(180, 240, 255, 255), width=3)
    dline.rounded_rectangle([px0+1, py0+1, px1-1, py1-1], radius=13, outline=(255, 255, 255, 220), width=1)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_display_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    fx0, fy0, fx1, fy1 = geo['front']
    dx0, dy0, dx1, dy1 = fx0 + 8, fy0 + 8, fx1 - 8, fy1 - 8
    cx_front = (dx0 + dx1) // 2

    # 1. Radiant OLED border aura
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    radius = 34 if 'flat' in spec['frame_type'] or 'titanium' in spec['frame_type'] else 38
    dbloom.rounded_rectangle([dx0, dy0, dx1, dy1], radius=radius, outline=(231, 129, 56, 255), width=12)
    dbloom.rounded_rectangle([dx0+2, dy0+2, dx1-2, dy1-2], radius=radius-2, outline=(0, 113, 227, 240), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(14))

    # 2. Electric neon perimeter line
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([dx0, dy0, dx1, dy1], radius=radius, outline=(255, 170, 80, 255), width=4)
    dline.rounded_rectangle([dx0+1, dy0+1, dx1-1, dy1-1], radius=radius-1, outline=(255, 255, 255, 240), width=2)

    # 3. Model-specific cutout (Notch vs Dynamic Island vs Under-display)
    if spec['notch'] == 'dynamic_island':
        dline.rounded_rectangle([cx_front - 24, dy0 + 16, cx_front + 24, dy0 + 32], radius=8, fill=(0, 0, 0, 255), outline=(0, 113, 227, 200), width=1)
    elif spec['notch'] == 'wide_notch':
        dline.rounded_rectangle([cx_front - 30, dy0, cx_front + 30, dy0 + 24], radius=6, fill=(0, 0, 0, 255), outline=(231, 129, 56, 200), width=1)
    elif spec['notch'] == 'narrow_notch':
        dline.rounded_rectangle([cx_front - 22, dy0, cx_front + 22, dy0 + 18], radius=5, fill=(0, 0, 0, 255), outline=(231, 129, 56, 200), width=1)
    elif spec['notch'] == 'under_display':
        dline.ellipse([cx_front - 5, dy0 + 20, cx_front + 5, dy0 + 30], outline=(80, 227, 194, 220), width=1)

    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    # 4. Enhance vibrance of front screen
    screen_mask = Image.new('L', (w, h), 0)
    ds = ImageDraw.Draw(screen_mask)
    ds.rounded_rectangle([dx0, dy0, dx1, dy1], radius=radius, fill=255)
    screen_mask = screen_mask.filter(ImageFilter.GaussianBlur(2))

    enhancer = ImageEnhance.Color(base)
    vibrant_base = enhancer.enhance(1.35)
    enhancer_b = ImageEnhance.Brightness(vibrant_base)
    vibrant_base = enhancer_b.enhance(1.12)
    comp = Image.composite(vibrant_base, comp, screen_mask)

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_frame_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    fx0, fy0, fx1, fy1 = geo['front']
    rx0, ry0, rx1, ry1 = geo['back']
    color = spec['frame_color']

    # 1. Model-specific metallic glow (surgical steel vs titanium vs desert titanium)
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    radius = 34 if 'flat' in spec['frame_type'] or 'titanium' in spec['frame_type'] else 40
    dbloom.rounded_rectangle([fx0, fy0, fx1, fy1], radius=radius, outline=color + (255,), width=8)
    dbloom.rounded_rectangle([rx0, ry0, rx1, ry1], radius=radius, outline=color + (255,), width=8)
    bloom = bloom.filter(ImageFilter.GaussianBlur(12))

    # 2. Gleaming chrome core line
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    core_color = (min(color[0]+80, 255), min(color[1]+80, 255), min(color[2]+80, 255), 255)
    dline.rounded_rectangle([fx0, fy0, fx1, fy1], radius=radius, outline=core_color, width=4)
    dline.rounded_rectangle([rx0, ry0, rx1, ry1], radius=radius, outline=core_color, width=4)
    dline.rounded_rectangle([fx0+1, fy0+1, fx1-1, fy1-1], radius=radius-1, outline=(255, 255, 255, 230), width=2)
    dline.rounded_rectangle([rx0+1, ry0+1, rx1-1, ry1-1], radius=radius-1, outline=(255, 255, 255, 230), width=2)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_wireless_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    cx, cy = geo['cx_back'], geo['cy_back']
    rw = geo['back'][2] - geo['back'][0]
    r = 64 if model == 'xs' else int(rw * 0.28)
    x0, y0, x1, y1 = cx - r, cy - r, cx + r, cy + r

    # 1. Dark smoky glass window for coil
    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.ellipse([x0, y0, x1, y1], fill=220)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    tint = Image.new('RGBA', (w, h), (16, 12, 10, 195))
    comp = Image.composite(tint, comp, mask)

    # 2. Paste wireless coil & MagSafe array
    coil_scaled = coil_badge.resize((r * 2 - 8, r * 2 - 8), Image.Resampling.LANCZOS)
    comp.paste(coil_scaled, (x0 + 4, y0 + 4), coil_scaled)

    # 3. Model-specific MagSafe indicator (12 Pro and later)
    if spec['has_magsafe']:
        dmag = ImageDraw.Draw(comp)
        dmag.rounded_rectangle([cx - 4, cy + r - 4, cx + 4, cy + r + 18], radius=3, fill=(255, 215, 120, 240), outline=(216, 189, 72, 255))

    # 4. Amber / Gold electromagnetic aura
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.ellipse([x0, y0, x1, y1], outline=(216, 189, 72, 255), width=8)
    bloom = bloom.filter(ImageFilter.GaussianBlur(12))

    # 5. Neon ring
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.ellipse([x0, y0, x1, y1], outline=(255, 215, 120, 255), width=3)
    dline.ellipse([x0+1, y0+1, x1-1, y1-1], outline=(255, 255, 255, 220), width=2)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_glass_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    fx0, fy0, fx1, fy1 = geo['front']
    rx0, ry0, rx1, ry1 = geo['back']

    sheen = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dsheen = ImageDraw.Draw(sheen)
    dsheen.rounded_rectangle([rx0, ry0, rx1, ry1], radius=36, fill=(137, 154, 56, 35), outline=(137, 154, 56, 200), width=4)
    dsheen.rounded_rectangle([fx0, fy0, fx1, fy1], radius=36, fill=(137, 154, 56, 25), outline=(137, 154, 56, 180), width=4)
    
    bloom = sheen.filter(ImageFilter.GaussianBlur(10))
    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, sheen)
    return comp

def create_plastics_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    rx0, ry0, rx1, ry1 = geo['back']
    rw = rx1 - rx0
    
    px0 = rx0 + 16
    px1 = rx1 - 16
    py0 = ry1 - int((ry1 - ry0) * 0.16)
    py1 = ry1 - 10

    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.rounded_rectangle([px0, py0, px1, py1], radius=14, fill=220)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    tint = Image.new('RGBA', (w, h), (14, 14, 18, 195))
    comp = Image.composite(tint, comp, mask)

    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([px0, py0, px1, py1], radius=14, outline=(191, 163, 98, 255), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(10))

    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([px0, py0, px1, py1], radius=14, outline=(240, 215, 150, 255), width=3)
    dline.rounded_rectangle([px0+1, py0+1, px1-1, py1-1], radius=13, outline=(255, 255, 255, 220), width=1)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_aluminum_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    cx, cy = geo['cx_back'], geo['cy_back']
    rw = geo['back'][2] - geo['back'][0]
    
    ax0 = cx - int(rw * 0.22)
    ax1 = cx + int(rw * 0.22)
    ay0 = cy - 70
    ay1 = cy + 70

    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([ax0, ay0, ax1, ay1], radius=14, outline=(160, 165, 175, 255), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(10))

    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([ax0, ay0, ax1, ay1], radius=14, outline=(220, 230, 240, 255), width=3)
    dline.rounded_rectangle([ax0+1, ay0+1, ax1-1, ay1-1], radius=13, outline=(255, 255, 255, 230), width=1)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def build_all():
    print("Generating model-aligned 2048x1152 high-resolution component cutaways...")
    for model in TARGET_MODELS:
        base_path = f"assets/phone_{model}.png"
        if not os.path.exists(base_path):
            print(f"Skipping {model} (base file missing)")
            continue
        base = Image.open(base_path).convert('RGBA')

        # 1. Battery
        bat_img = create_battery_cutaway(base, model)
        bat_img.save(f"assets/comp_{model}_battery.png", "PNG", compress_level=1)

        # 2. Circuit Boards & Logic Chip
        pcb_img = create_circuit_boards_cutaway(base, model)
        pcb_img.save(f"assets/comp_{model}_circuit_boards.png", "PNG", compress_level=1)

        # 3. Display
        disp_img = create_display_cutaway(base, model)
        disp_img.save(f"assets/comp_{model}_display.png", "PNG", compress_level=1)

        # 4. Frame / Stainless Steel / Titanium
        frame_img = create_frame_cutaway(base, model)
        frame_img.save(f"assets/comp_{model}_stainless_steel.png", "PNG", compress_level=1)

        # 5. Wireless Qi / MagSafe Coil
        coil_img = create_wireless_cutaway(base, model)
        coil_img.save(f"assets/comp_{model}_other.png", "PNG", compress_level=1)

        # 6. Glass
        glass_img = create_glass_cutaway(base, model)
        glass_img.save(f"assets/comp_{model}_glass.png", "PNG", compress_level=1)

        # 7. Plastics
        plastics_img = create_plastics_cutaway(base, model)
        plastics_img.save(f"assets/comp_{model}_plastics.png", "PNG", compress_level=1)

        # 8. Aluminum
        alum_img = create_aluminum_cutaway(base, model)
        alum_img.save(f"assets/comp_{model}_aluminum.png", "PNG", compress_level=1)

        print(f"✓ Generated 8 unique upscaled 2048x1152 cutaways for {model}", flush=True)

if __name__ == '__main__':
    build_all()
