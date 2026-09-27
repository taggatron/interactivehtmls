import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# All 9 iPhone generations
TARGET_MODELS = ['xs', '11pro', '12pro', '13pro', '14pro', '15pro', '16pro', '17pro', '18pro']

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
        'bat_type': 'pouch_l', 'bat_cap': '2658 mAh', 'bat_label': 'Li-ion • Daisy Recycled',
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

def add_ambient_shadow(base, obj_alpha, x, y, blur=4, opacity=130):
    """Adds a soft natural ambient occlusion drop-shadow under hardware components."""
    w, h = base.size
    shadow_mask = Image.new('L', (w, h), 0)
    shadow_mask.paste(obj_alpha, (x, y + 3))
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(blur))
    shadow_fill = Image.new('RGBA', (w, h), (0, 0, 0, opacity))
    return Image.composite(shadow_fill, base, shadow_mask)

def draw_chip_label(draw, cx, cy, chip_name, sub_name):
    """Draws an authentic Apple Silicon package with matte dark substrate and crisp markings."""
    w, h = 92, 80
    x0, y0 = cx - w//2, cy - h//2
    # Realistic matte dark silicon package with subtle bevel edge
    draw.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=8, fill=(22, 25, 30, 250), outline=(52, 58, 66, 255), width=1)
    # Apple logo icon
    draw.ellipse([cx - 7, y0 + 12, cx + 7, y0 + 26], fill=(240, 240, 245, 240))
    # Chip name & specs
    draw.text((cx - len(chip_name)*4, y0 + 34), chip_name, fill=(255, 255, 255, 250))
    draw.text((cx - len(sub_name)*3, y0 + 52), sub_name, fill=(180, 195, 210, 220))

def create_battery_cutaway(base, model):
    """Reveals the internal battery pack seamlessly with realistic hardware texture and specifications."""
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

    bat_scaled = bat_badge.resize((bw, bh), Image.Resampling.LANCZOS)
    if spec['bat_type'] == 'metal_case':
        enhancer = ImageEnhance.Color(bat_scaled)
        bat_scaled = enhancer.enhance(0.4)
        enhancer_b = ImageEnhance.Brightness(bat_scaled)
        bat_scaled = enhancer_b.enhance(1.25)

    # Ambient drop shadow nestled inside the chassis cavity
    comp = add_ambient_shadow(comp, bat_scaled.split()[3], bx0, by0, blur=5, opacity=140)
    comp.paste(bat_scaled, (bx0, by0), bat_scaled)

    # Clean technical markings printed directly on the battery
    dcomp = ImageDraw.Draw(comp)
    dcomp.text((bx0 + 16, by0 + bh - 40), spec['bat_cap'], fill=(240, 240, 245, 230))
    dcomp.text((bx0 + 16, by0 + bh - 24), spec['bat_label'], fill=(180, 190, 200, 200))
    return comp

def create_circuit_boards_cutaway(base, model):
    """Reveals the logic board PCB, camera modules, and Apple Silicon processor package."""
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

    pcb_scaled = pcb_badge.resize((pw, ph), Image.Resampling.LANCZOS)
    comp = add_ambient_shadow(comp, pcb_scaled.split()[3], px0, py0, blur=4, opacity=130)
    comp.paste(pcb_scaled, (px0, py0), pcb_scaled)

    # Apple Silicon Chip package
    chip_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dchip = ImageDraw.Draw(chip_layer)
    draw_chip_label(dchip, (px0 + px1)//2, (py0 + py1)//2 - 6, spec['chip'], spec['chip_sub'])
    comp = Image.alpha_composite(comp, chip_layer)
    return comp

def create_display_cutaway(base, model):
    """Reveals the Super Retina XDR OLED display panel by enhancing screen vibrance and contrast."""
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    fx0, fy0, fx1, fy1 = geo['front']
    dx0, dy0, dx1, dy1 = fx0 + 8, fy0 + 8, fx1 - 8, fy1 - 8
    radius = 34 if 'flat' in spec['frame_type'] or 'titanium' in spec['frame_type'] else 38

    screen_mask = Image.new('L', (w, h), 0)
    ds = ImageDraw.Draw(screen_mask)
    ds.rounded_rectangle([dx0, dy0, dx1, dy1], radius=radius, fill=255)
    screen_mask = screen_mask.filter(ImageFilter.GaussianBlur(2))

    # Brighten and enrich the active OLED panel
    enhancer = ImageEnhance.Color(base)
    vibrant_base = enhancer.enhance(1.35)
    enhancer_b = ImageEnhance.Brightness(vibrant_base)
    vibrant_base = enhancer_b.enhance(1.15)
    comp = Image.composite(vibrant_base, comp, screen_mask)
    return comp

def create_frame_cutaway(base, model):
    """Enhances the physical precision-machined metallic chassis bevel with natural studio luster."""
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    fx0, fy0, fx1, fy1 = geo['front']
    rx0, ry0, rx1, ry1 = geo['back']
    radius = 34 if 'flat' in spec['frame_type'] or 'titanium' in spec['frame_type'] else 40

    # Natural metallic edge highlight along physical perimeter bevel (no neon vector lines)
    edge_mask = Image.new('L', (w, h), 0)
    dedge = ImageDraw.Draw(edge_mask)
    dedge.rounded_rectangle([fx0, fy0, fx1, fy1], radius=radius, outline=200, width=5)
    dedge.rounded_rectangle([rx0, ry0, rx1, ry1], radius=radius, outline=200, width=5)
    edge_mask = edge_mask.filter(ImageFilter.GaussianBlur(3))

    enhancer = ImageEnhance.Brightness(base)
    bright_base = enhancer.enhance(1.28)
    comp = Image.composite(bright_base, comp, edge_mask)
    return comp

def create_wireless_cutaway(base, model):
    """Reveals the internal copper wireless charging coil and MagSafe neodymium alignment magnets."""
    w, h = base.size
    comp = base.copy()
    spec = MODEL_SPECS.get(model, MODEL_SPECS['xs'])
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    
    cx, cy = geo['cx_back'], geo['cy_back']
    rw = geo['back'][2] - geo['back'][0]
    r = 64 if model == 'xs' else int(rw * 0.28)
    x0, y0 = cx - r, cy - r

    coil_scaled = coil_badge.resize((r * 2, r * 2), Image.Resampling.LANCZOS)
    comp = add_ambient_shadow(comp, coil_scaled.split()[3], x0, y0, blur=5, opacity=140)
    comp.paste(coil_scaled, (x0, y0), coil_scaled)

    if spec['has_magsafe']:
        dmag = ImageDraw.Draw(comp)
        dmag.rounded_rectangle([cx - 4, cy + r - 2, cx + 4, cy + r + 16], radius=3, fill=(215, 220, 228, 245), outline=(150, 155, 165, 230), width=1)
    return comp

def create_glass_cutaway(base, model):
    """Reveals the precision rear glass with a clean optical light reflection (no colored tint or outline)."""
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    rx0, ry0, rx1, ry1 = geo['back']
    radius = 36

    # Pure neutral white optical glass reflection beam (zero green tint, zero outline)
    glass_mask = Image.new('L', (w, h), 0)
    dmask = ImageDraw.Draw(glass_mask)
    dmask.rounded_rectangle([rx0 + 2, ry0 + 2, rx1 - 2, ry1 - 2], radius=radius, fill=255)

    sheen = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dsheen = ImageDraw.Draw(sheen)
    # Soft diagonal light beam at 45 degrees across rear glass
    beam_w = (rx1 - rx0) * 0.4
    center_beam = rx0 + (rx1 - rx0) * 0.55
    dsheen.polygon([
        (center_beam - beam_w, ry0),
        (center_beam + beam_w, ry0),
        (center_beam + beam_w - 90, ry1),
        (center_beam - beam_w - 90, ry1)
    ], fill=(255, 255, 255, 38))
    sheen = sheen.filter(ImageFilter.GaussianBlur(14))

    sheen_clipped = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sheen_clipped = Image.composite(sheen, sheen_clipped, glass_mask)
    comp = Image.alpha_composite(comp, sheen_clipped)
    return comp

def create_plastics_cutaway(base, model):
    """Reveals the internal bottom acoustic module, speaker chamber, and Taptic Engine."""
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    rx0, ry0, rx1, ry1 = geo['back']
    
    px0 = rx0 + 16
    px1 = rx1 - 16
    py0 = ry1 - int((ry1 - ry0) * 0.16)
    py1 = ry1 - 12
    pw, ph = px1 - px0, py1 - py0

    # Realistic internal acoustic module hardware
    module = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    dmod = ImageDraw.Draw(module)
    dmod.rounded_rectangle([0, 0, pw, ph], radius=8, fill=(28, 30, 34, 245), outline=(55, 58, 65, 255), width=1)
    # Speaker grille ports
    for x in range(16, pw - 16, 8):
        dmod.rounded_rectangle([x, ph//2 - 6, x + 4, ph//2 + 6], radius=2, fill=(15, 16, 18, 255))
    dmod.text((18, ph - 16), "ACOUSTIC ENCLOSURE • TAPTIC", fill=(170, 180, 190, 220))

    comp = add_ambient_shadow(comp, module.split()[3], px0, py0, blur=4, opacity=130)
    comp.paste(module, (px0, py0), module)
    return comp

def create_aluminum_cutaway(base, model):
    """Reveals the laser-etched internal aluminum thermal dissipation matrix."""
    w, h = base.size
    comp = base.copy()
    geo = PHONE_GEOMETRY.get(model, PHONE_GEOMETRY['xs'])
    cx, cy = geo['cx_back'], geo['cy_back']
    rw = geo['back'][2] - geo['back'][0]
    
    ax0 = cx - int(rw * 0.24)
    ax1 = cx + int(rw * 0.24)
    ay0 = cy - 65
    ay1 = cy + 65
    aw, ah = ax1 - ax0, ay1 - ay0

    # Realistic brushed aluminum thermal dissipation shield
    shield = Image.new('RGBA', (aw, ah), (0, 0, 0, 0))
    dshield = ImageDraw.Draw(shield)
    dshield.rounded_rectangle([0, 0, aw, ah], radius=10, fill=(160, 165, 175, 235), outline=(200, 205, 215, 255), width=1)
    # Subtle thermal plate laser markings
    dshield.text((12, 14), "THERMAL MATRIX", fill=(90, 95, 105, 240))
    dshield.text((12, 30), "100% RECYCLED ALUMINUM", fill=(100, 105, 115, 220))

    comp = add_ambient_shadow(comp, shield.split()[3], ax0, ay0, blur=4, opacity=130)
    comp.paste(shield, (ax0, ay0), shield)
    return comp

def build_all():
    print("Generating model-aligned 2048x1152 clean high-resolution component cutaways...")
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

        print(f"✓ Generated 8 clean 2048x1152 cutaways for {model}", flush=True)

if __name__ == '__main__':
    build_all()
