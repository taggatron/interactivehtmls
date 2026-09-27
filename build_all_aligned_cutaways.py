import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

TARGET_MODELS = ['xs', '11pro', '12pro', '13pro', '14pro', '15pro', '16pro', '17pro', '18pro']

# Load base badge assets
bat_badge = Image.open('assets/badge_battery.png').convert('RGBA')
pcb_badge = Image.open('assets/badge_circuit_boards.png').convert('RGBA')
coil_badge = Image.open('assets/badge_other.png').convert('RGBA')
disp_badge = Image.open('assets/badge_display.png').convert('RGBA')
frame_badge = Image.open('assets/badge_stainless_steel.png').convert('RGBA')

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

def draw_chip_label(draw, cx, cy, chip_name, sub_name, color=(255, 255, 255)):
    # Draw dark chip substrate
    w, h = 90, 80
    x0, y0 = cx - w//2, cy - h//2
    draw.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=8, fill=(20, 24, 28, 240), outline=color, width=2)
    # Apple logo circle
    draw.ellipse([cx - 7, y0 + 12, cx + 7, y0 + 26], fill=color)
    # Chip text lines (using geometric rendering for crisp vector look)
    # Text line 1: Chip name
    draw.text((cx - len(chip_name)*4, y0 + 34), chip_name, fill=color)
    draw.text((cx - len(sub_name)*3, y0 + 52), sub_name, fill=(180, 200, 220))

def create_battery_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    
    bx0, by0, bx1, by1 = 812, 770, 928, 1040
    bw, bh = bx1 - bx0, by1 - by0

    # 1. Dark smoky glass window for internal cavity
    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.rounded_rectangle([bx0, by0, bx1, by1], radius=16, fill=225)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    
    # Model-specific cavity tint
    tint_color = (18, 22, 28, 210) if spec['bat_type'] == 'metal_case' else (10, 16, 22, 195)
    tint = Image.new('RGBA', (w, h), tint_color)
    comp = Image.composite(tint, comp, mask)

    # 2. Battery pack hardware render with model-specific styling
    bat_scaled = bat_badge.resize((bw - 12, bh - 12), Image.Resampling.LANCZOS)
    if spec['bat_type'] == 'metal_case':
        # iPhone 16 Pro metal-cased battery has silver metallic sheen
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
    
    px0, py0, px1, py1 = 824, 552, 942, 744
    pw, ph = px1 - px0, py1 - py0
    cx0, cy0, cx1, cy1 = 774, 554, 824, 686

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

    # 3. Model-specific Silicon Chip overlay (A12, A13, A14, A15, A16, A17 Pro, A18 Pro, etc.)
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
    
    # Front OLED screen on the left phone
    dx0, dy0, dx1, dy1 = 692, 542, 836, 1144

    # 1. Radiant OLED border aura
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([dx0, dy0, dx1, dy1], radius=38, outline=(231, 129, 56, 255), width=12)
    dbloom.rounded_rectangle([dx0+2, dy0+2, dx1-2, dy1-2], radius=36, outline=(0, 113, 227, 240), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(14))

    # 2. Electric neon perimeter line
    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([dx0, dy0, dx1, dy1], radius=38, outline=(255, 170, 80, 255), width=4)
    dline.rounded_rectangle([dx0+1, dy0+1, dx1-1, dy1-1], radius=37, outline=(255, 255, 255, 240), width=2)

    # 3. Model-specific cutout (Notch vs Dynamic Island vs Under-display)
    if spec['notch'] == 'dynamic_island':
        # Dynamic Island pill cutout
        dline.rounded_rectangle([746, 560, 782, 574], radius=7, fill=(0, 0, 0, 255), outline=(0, 113, 227, 200), width=1)
    elif spec['notch'] == 'wide_notch':
        # Classic wide notch
        dline.rounded_rectangle([736, 542, 792, 564], radius=6, fill=(0, 0, 0, 255), outline=(231, 129, 56, 200), width=1)
    elif spec['notch'] == 'narrow_notch':
        # Narrow notch
        dline.rounded_rectangle([742, 542, 786, 560], radius=5, fill=(0, 0, 0, 255), outline=(231, 129, 56, 200), width=1)

    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    # 4. Enhance vibrance of the front screen
    screen_mask = Image.new('L', (w, h), 0)
    ds = ImageDraw.Draw(screen_mask)
    ds.rounded_rectangle([dx0, dy0, dx1, dy1], radius=38, fill=255)
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
    
    # Outer perimeter contours
    fx0, fy0, fx1, fy1 = 676, 540, 836, 1148 # left phone
    rx0, ry0, rx1, ry1 = 760, 540, 974, 1148 # right phone

    color = spec['frame_color']

    # 1. Model-specific metallic glow (surgical steel vs titanium vs desert titanium)
    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    radius = 36 if 'flat' in spec['frame_type'] or 'titanium' in spec['frame_type'] else 40
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
    
    # Center of right phone: cx=866, cy=844, r=64
    cx, cy, r = 866, 844, 64
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
        # MagSafe vertical orientation alignment pill at bottom of ring
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
    
    rx0, ry0, rx1, ry1 = 760, 542, 970, 1146
    fx0, fy0, fx1, fy1 = 692, 542, 836, 1144

    sheen = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dsheen = ImageDraw.Draw(sheen)
    dsheen.rounded_rectangle([rx0, ry0, rx1, ry1], radius=38, fill=(137, 154, 56, 35), outline=(137, 154, 56, 200), width=4)
    dsheen.rounded_rectangle([fx0, fy0, fx1, fy1], radius=38, fill=(137, 154, 56, 25), outline=(137, 154, 56, 180), width=4)
    
    bloom = sheen.filter(ImageFilter.GaussianBlur(10))
    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, sheen)
    return comp

def create_plastics_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    
    px0, py0, px1, py1 = 780, 1036, 952, 1146

    mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(mask)
    dmask.rounded_rectangle([px0, py0, px1, py1], radius=16, fill=220)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    tint = Image.new('RGBA', (w, h), (14, 14, 18, 195))
    comp = Image.composite(tint, comp, mask)

    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([px0, py0, px1, py1], radius=16, outline=(191, 163, 98, 255), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(10))

    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([px0, py0, px1, py1], radius=16, outline=(240, 215, 150, 255), width=3)
    dline.rounded_rectangle([px0+1, py0+1, px1-1, py1-1], radius=15, outline=(255, 255, 255, 220), width=1)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

def create_aluminum_cutaway(base, model):
    w, h = base.size
    comp = base.copy()
    
    ax0, ay0, ax1, ay1 = 850, 728, 934, 872

    bloom = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dbloom = ImageDraw.Draw(bloom)
    dbloom.rounded_rectangle([ax0, ay0, ax1, ay1], radius=12, outline=(200, 72, 59, 255), width=6)
    bloom = bloom.filter(ImageFilter.GaussianBlur(10))

    neon_line = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dline = ImageDraw.Draw(neon_line)
    dline.rounded_rectangle([ax0, ay0, ax1, ay1], radius=12, outline=(255, 140, 130, 255), width=3)
    dline.rounded_rectangle([ax0+1, ay0+1, ax1-1, ay1-1], radius=11, outline=(255, 255, 255, 220), width=1)
    neon_line = neon_line.filter(ImageFilter.GaussianBlur(1))

    comp = Image.alpha_composite(comp, bloom)
    comp = Image.alpha_composite(comp, neon_line)
    return comp

# Process all 9 models and generate aligned, model-specific upscaled cutaways
for m in TARGET_MODELS:
    base_file = f'assets/phone_{m}.png'
    if not os.path.exists(base_file):
        continue
    base = Image.open(base_file).convert('RGBA')
    print(f'Generating model-specific upscaled cutaways for {m}...')

    # 1. Battery
    create_battery_cutaway(base, m).save(f'assets/comp_{m}_battery.png', 'PNG')
    # 2. Circuit Boards
    create_circuit_boards_cutaway(base, m).save(f'assets/comp_{m}_circuit_boards.png', 'PNG')
    # 3. Display
    create_display_cutaway(base, m).save(f'assets/comp_{m}_display.png', 'PNG')
    # 4. Frame / Stainless Steel / Titanium
    create_frame_cutaway(base, m).save(f'assets/comp_{m}_stainless_steel.png', 'PNG')
    # 5. Wireless Qi / MagSafe
    create_wireless_cutaway(base, m).save(f'assets/comp_{m}_other.png', 'PNG')
    # 6. Glass
    create_glass_cutaway(base, m).save(f'assets/comp_{m}_glass.png', 'PNG')
    # 7. Plastics / Acoustics
    create_plastics_cutaway(base, m).save(f'assets/comp_{m}_plastics.png', 'PNG')
    # 8. Aluminum
    create_aluminum_cutaway(base, m).save(f'assets/comp_{m}_aluminum.png', 'PNG')

print('✓ Successfully generated all 72 model-specific upscaled component reveal images!')
