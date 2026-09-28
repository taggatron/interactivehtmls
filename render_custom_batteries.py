import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
import numpy as np

# Battery specifications for all 9 models
BATTERY_SPECS = {
    'xs': {
        'name': 'iPhone Xs / X',
        'type': 'l_right',
        'stalk': (995, 625, 1125, 1075),
        'foot': (900, 915, 1125, 1075),
        'model_no': 'Model A1920',
        'cap_mah': '2658 mAh',
        'voltage': '3.81 V',
        'energy': '10.13 Whr',
        'label': 'Daisy Recycled • Single-Cell L-Pack',
        'warning': 'WARNING: Authorized Service Only. Do not crush, heat, or incinerate.',
        'accent': '#8cb89a',
        'surface': 'black_pouch',
        'tabs': [(1045, 618), (925, 1078)],
        'fpc': (900, 920, 882, 890) # flex cable from corner to logic board
    },
    '11pro': {
        'name': 'iPhone 11 Pro',
        'type': 'l_right',
        'stalk': (1005, 675, 1115, 1070),
        'foot': (935, 925, 1115, 1070),
        'model_no': 'Model A2160',
        'cap_mah': '3046 mAh',
        'voltage': '3.83 V',
        'energy': '11.67 Whr',
        'label': '100% Recycled Tin Solder • High-Capacity Pouch',
        'warning': 'WARNING: Risk of fire if punctured. Replace with genuine Apple cell.',
        'accent': '#8cb89a',
        'surface': 'black_pouch',
        'tabs': [(1050, 668), (955, 1073)],
        'fpc': (935, 930, 912, 895)
    },
    '12pro': {
        'name': 'iPhone 12 Pro',
        'type': 'rect',
        'box': (865, 670, 948, 1055),
        'model_no': 'Model A2479',
        'cap_mah': '2815 mAh',
        'voltage': '3.83 V',
        'energy': '10.78 Whr',
        'label': 'MagSafe Compatible Li-ion Pack',
        'warning': 'WARNING: Authorized Service Only. Potential fire or burn hazard.',
        'accent': '#8cb89a',
        'surface': 'black_pouch',
        'tabs': [(895, 662), (895, 1058)],
        'fpc': (948, 710, 968, 725)
    },
    '13pro': {
        'name': 'iPhone 13 Pro',
        'type': 'l_left',
        'stalk': (895, 700, 985, 1055),
        'foot': (895, 935, 1075, 1055),
        'model_no': 'Model A2656',
        'cap_mah': '3095 mAh',
        'voltage': '3.85 V',
        'energy': '11.97 Whr',
        'label': 'High-Density Cobalt Cathode',
        'warning': 'WARNING: Handle with care. Authorized technician replacement only.',
        'accent': '#8cb89a',
        'surface': 'black_pouch',
        'tabs': [(930, 692), (1030, 1058)],
        'fpc': (985, 740, 1010, 755)
    },
    '14pro': {
        'name': 'iPhone 14 Pro',
        'type': 'rect',
        'box': (890, 675, 980, 1060),
        'model_no': 'Model A2890',
        'cap_mah': '3200 mAh',
        'voltage': '3.87 V',
        'energy': '12.38 Whr',
        'label': 'Dual-Cell Balanced Architecture',
        'warning': 'WARNING: High energy density cell. Do not expose to heat > 60°C.',
        'accent': '#8cb89a',
        'surface': 'black_pouch',
        'tabs': [(925, 668), (925, 1063)],
        'fpc': (980, 720, 1002, 735)
    },
    '15pro': {
        'name': 'iPhone 15 Pro',
        'type': 'rect',
        'box': (870, 675, 956, 1060),
        'model_no': 'Model A3101',
        'cap_mah': '3274 mAh',
        'voltage': '3.88 V',
        'energy': '12.70 Whr',
        'label': '100% Recycled Cobalt Cathode',
        'warning': 'WARNING: Authorized technician repair only. Zero conflict minerals.',
        'accent': '#48c2c5',
        'surface': 'black_pouch',
        'tabs': [(905, 668), (905, 1063)],
        'fpc': (956, 720, 978, 735)
    },
    '16pro': {
        'name': 'iPhone 16 Pro',
        'type': 'rect',
        'box': (872, 675, 962, 1060),
        'model_no': 'Model A3293',
        'cap_mah': '3582 mAh',
        'voltage': '3.89 V',
        'energy': '13.94 Whr',
        'label': 'Laser-Welded Steel Thermal Enclosure',
        'warning': 'STEEL CASING • Electrically Debondable Adhesive • 100% Recycled Cobalt',
        'accent': '#e0c068',
        'surface': 'steel_cased',
        'tabs': [(908, 666), (908, 1063)],
        'fpc': (962, 715, 984, 730)
    },
    '17pro': {
        'name': 'iPhone 17 Pro',
        'type': 'rect',
        'box': (868, 670, 965, 1060),
        'model_no': 'Model A3410',
        'cap_mah': '3950 mAh',
        'voltage': '3.92 V',
        'energy': '15.48 Whr',
        'label': 'Silicon-Anode Solid State Matrix',
        'warning': 'SOLID STATE MATRIX • 0% Liquid Flammability • Self-Healing Electrolyte',
        'accent': '#50e3c2',
        'surface': 'silicon_composite',
        'tabs': [(910, 662), (910, 1063)],
        'fpc': (965, 710, 988, 725)
    },
    '18pro': {
        'name': 'iPhone 18 Pro',
        'type': 'rect',
        'box': (870, 670, 965, 1060),
        'model_no': 'Model A3520',
        'cap_mah': '4200 mAh',
        'voltage': '3.95 V',
        'energy': '16.59 Whr',
        'label': 'Closed-Loop Graphene Cell',
        'warning': 'GRAPHENE COMPOSITE • Quantum Diffusion Core • Zero Degradation Lifespan',
        'accent': '#8ced8c',
        'surface': 'graphene_matrix',
        'tabs': [(910, 662), (910, 1063)],
        'fpc': (965, 710, 988, 725)
    }
}

def draw_apple_logo(d, cx, cy, size=16, fill=(240, 240, 245, 230)):
    """Draws a clean minimalist Apple silhouette icon."""
    r = size // 2
    # Apple body
    d.ellipse([cx - r, cy - r + 3, cx + r, cy + r + 3], fill=fill)
    # Right bite cutout
    bite_fill = (0, 0, 0, 0)
    # Leaf
    leaf_w = max(3, size // 4)
    leaf_h = max(4, size // 3)
    d.ellipse([cx, cy - r - leaf_h + 2, cx + leaf_w * 2, cy - r + 2], fill=fill)

def render_battery_layer(spec, width=2048, height=1152):
    """
    Renders an authentic, highly detailed battery pack directly into its exact chassis position.
    Returns (battery_rgba, alpha_mask)
    """
    b_type = spec['type']
    surf = spec['surface']
    
    # 1. Create mask of the battery footprint
    mask = Image.new('L', (width, height), 0)
    dm = ImageDraw.Draw(mask)
    
    if b_type == 'l_right' or b_type == 'l_left':
        s0, s1 = spec['stalk'][0:2], spec['stalk'][2:4]
        f0, f1 = spec['foot'][0:2], spec['foot'][2:4]
        dm.rounded_rectangle([s0[0], s0[1], s1[0], s1[1]], radius=14, fill=255)
        dm.rounded_rectangle([f0[0], f0[1], f1[0], f1[1]], radius=14, fill=255)
        # Bounding box of total battery
        bx0 = min(s0[0], f0[0])
        by0 = min(s0[1], f0[1])
        bx1 = max(s1[0], f1[0])
        by1 = max(s1[1], f1[1])
    else:
        bx0, by0, bx1, by1 = spec['box']
        dm.rounded_rectangle([bx0, by0, bx1, by1], radius=14, fill=255)
        
    bw = bx1 - bx0
    bh = by1 - by0

    # 2. Render surface texture onto battery canvas
    bat_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(bat_layer)
    
    # Fill based on surface type
    if surf == 'black_pouch':
        # Dark satin Li-ion pouch with subtle 3D lighting gradient
        for y in range(by0, by1 + 1):
            t = (y - by0) / float(bh)
            # Specular sheen across upper third
            shine = math.exp(-((t - 0.28) ** 2) / 0.05) * 32
            base_l = int(24 + (1.0 - t) * 8 + shine)
            r = base_l
            g = int(base_l * 1.04)
            b = int(base_l * 1.08)
            d.line([(bx0, y), (bx1, y)], fill=(r, g, b, 255))
            
    elif surf == 'steel_cased':
        # Brushed stainless steel enclosure with metallic gradient
        for y in range(by0, by1 + 1):
            t = (y - by0) / float(bh)
            # Metallic specular bands
            band = math.sin(t * 12.0) * 15 + math.exp(-((t - 0.35)**2)/0.04) * 45
            lum = int(np.clip(185 + band, 140, 245))
            d.line([(bx0, y), (bx1, y)], fill=(lum, lum, int(lum * 1.03), 255))
            
    elif surf == 'silicon_composite':
        # Next-gen dark iridescent silicon composite
        for y in range(by0, by1 + 1):
            t = (y - by0) / float(bh)
            r = int(20 + t * 15)
            g = int(32 + t * 20)
            b = int(45 + t * 25)
            d.line([(bx0, y), (bx1, y)], fill=(r, g, b, 255))
            
    elif surf == 'graphene_matrix':
        # Advanced carbon-graphene composite
        for y in range(by0, by1 + 1):
            t = (y - by0) / float(bh)
            r = int(18 + t * 10)
            g = int(28 + t * 18)
            b = int(24 + t * 14)
            d.line([(bx0, y), (bx1, y)], fill=(r, g, b, 255))

    # Mask the battery fill to the exact footprint
    bat_layer = Image.composite(bat_layer, Image.new('RGBA', (width, height), (0, 0, 0, 0)), mask)
    d = ImageDraw.Draw(bat_layer)
    
    # 3. Add perimeter bevel / stamped lip
    if surf == 'steel_cased':
        # Distinct pressed metallic bezel edge
        d.rounded_rectangle([bx0 + 2, by0 + 2, bx1 - 2, by1 - 2], radius=12, outline=(245, 248, 255, 220), width=1)
        d.rounded_rectangle([bx0 + 4, by0 + 4, bx1 - 4, by1 - 4], radius=11, outline=(130, 135, 145, 180), width=1)
    else:
        # Subtle pouch weld border
        d.rounded_rectangle([bx0 + 2, by0 + 2, bx1 - 2, by1 - 2], radius=12, outline=(55, 60, 68, 160), width=1)
        d.rounded_rectangle([bx0 + 4, by0 + 4, bx1 - 4, by1 - 4], radius=11, outline=(15, 18, 22, 180), width=1)

    # 4. Adhesive pull tabs
    for (tx, ty) in spec['tabs']:
        tab_w, tab_h = 24, 10
        tab_col = (230, 235, 242, 220) if surf != 'steel_cased' else (50, 52, 58, 220)
        d.rounded_rectangle([tx - tab_w//2, ty - tab_h//2, tx + tab_w//2, ty + tab_h//2], radius=3, fill=tab_col)
        # Pull arrow
        arr_col = (40, 45, 50, 240) if surf != 'steel_cased' else (220, 225, 235, 240)
        d.polygon([(tx - 4, ty + (2 if ty > by0 + bh//2 else -2)),
                   (tx + 4, ty + (2 if ty > by0 + bh//2 else -2)),
                   (tx, ty + (5 if ty > by0 + bh//2 else -5))], fill=arr_col)

    # 5. FPC ribbon cable connector
    fpc = spec['fpc']
    d.line([(fpc[0], fpc[1]), (fpc[2], fpc[3])], fill=(30, 32, 38, 255), width=8)
    d.line([(fpc[0], fpc[1]), (fpc[2], fpc[3])], fill=(55, 58, 66, 255), width=6)
    # Gold pins at connector head
    d.rounded_rectangle([fpc[2] - 5, fpc[3] - 8, fpc[2] + 5, fpc[3] + 8], radius=2, fill=(40, 42, 48, 255), outline=(70, 75, 85, 255))
    d.rectangle([fpc[2] - 3, fpc[3] - 6, fpc[2] + 3, fpc[3] + 6], fill=(212, 175, 55, 255))

    # 6. Technical Text & Apple Markings
    # Text color
    text_pri = (45, 50, 58, 240) if surf == 'steel_cased' else (235, 240, 245, 235)
    text_sec = (80, 85, 95, 210) if surf == 'steel_cased' else (165, 175, 185, 200)
    text_acc = spec['accent']
    
    # Determine text anchor area
    if b_type == 'l_right':
        tx0 = spec['stalk'][0] + 12
        ty_top = spec['stalk'][1] + 28
        tx_foot = spec['foot'][0] + 16
        ty_foot = spec['foot'][1] + 24
    elif b_type == 'l_left':
        tx0 = spec['stalk'][0] + 12
        ty_top = spec['stalk'][1] + 28
        tx_foot = spec['foot'][0] + 16
        ty_foot = spec['foot'][1] + 24
    else:
        tx0 = bx0 + 12
        ty_top = by0 + 28
        tx_foot = bx0 + 12
        ty_foot = by0 + bh - 70

    # Apple logo
    draw_apple_logo(d, tx0 + 14, ty_top + 10, size=16, fill=text_pri)
    
    # Capacity & Model
    d.text((tx0 + 36, ty_top + 4), spec['cap_mah'], fill=text_pri)
    d.text((tx0 + 36, ty_top + 20), f"{spec['voltage']} • {spec['energy']}", fill=text_sec)
    d.text((tx0, ty_top + 44), spec['model_no'], fill=text_sec)
    
    # Environmental & Chemistry details
    d.text((tx_foot, ty_foot), spec['label'], fill=text_acc)
    d.text((tx_foot, ty_foot + 18), spec['warning'][:48], fill=text_sec)
    if len(spec['warning']) > 48:
        d.text((tx_foot, ty_foot + 32), spec['warning'][48:96], fill=text_sec)
        
    # Certification badges (CE, Li-ion, Recycle symbol)
    badge_y = ty_foot + (50 if len(spec['warning']) > 48 else 38)
    d.rounded_rectangle([tx_foot, badge_y, tx_foot + 24, badge_y + 14], radius=3, outline=text_sec, width=1)
    d.text((tx_foot + 4, badge_y + 2), "CE", fill=text_sec)
    d.rounded_rectangle([tx_foot + 30, badge_y, tx_foot + 64, badge_y + 14], radius=3, outline=text_sec, width=1)
    d.text((tx_foot + 34, badge_y + 2), "Li-ion", fill=text_sec)
    d.rounded_rectangle([tx_foot + 70, badge_y, tx_foot + 94, badge_y + 14], radius=3, outline=text_sec, width=1)
    d.text((tx_foot + 74, badge_y + 2), "♻ 100", fill=text_sec)

    return bat_layer, mask

print("Battery renderer module ready.")

def add_ambient_shadow(base, obj_alpha, blur=8, opacity=160, dy=4):
    """Adds a soft natural ambient drop-shadow under components in the chassis cavity."""
    w, h = base.size
    shadow_mask = Image.new('L', (w, h), 0)
    # Paste shifted down slightly
    shadow_mask.paste(obj_alpha, (0, dy))
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(blur))
    shadow_fill = Image.new('RGBA', (w, h), (0, 0, 0, opacity))
    return Image.composite(shadow_fill, base, shadow_mask)

def generate_all_batteries():
    print("Generating custom, geometrically accurate batteries for all 9 iPhone models...")
    for model, spec in BATTERY_SPECS.items():
        base_path = f"assets/phone_{model}.png"
        if not os.path.exists(base_path):
            print(f"Base phone {base_path} not found!")
            continue
        base = Image.open(base_path).convert('RGBA')
        w, h = base.size
        
        # 1. Render custom battery layer and alpha mask
        bat_layer, mask = render_battery_layer(spec, w, h)
        
        # 2. Add realistic chassis cavity ambient shadow
        comp = add_ambient_shadow(base, mask, blur=6, opacity=150, dy=3)
        
        # 3. Composite battery onto base phone
        comp = Image.alpha_composite(comp, bat_layer)
        
        # 4. Save component cutaway image
        cutaway_path = f"assets/comp_{model}_battery.png"
        comp.save(cutaway_path, "PNG", compress_level=1)
        
        # 5. Save standalone isolated battery pack asset
        # Find bounding box of mask
        bbox = mask.getbbox()
        if bbox:
            # Add padding
            pad = 8
            x0 = max(0, bbox[0] - pad)
            y0 = max(0, bbox[1] - pad)
            x1 = min(w, bbox[2] + pad)
            y1 = min(h, bbox[3] + pad)
            isolated = bat_layer.crop((x0, y0, x1, y1))
            isolated_path = f"assets/battery_{model}.png"
            isolated.save(isolated_path, "PNG", compress_level=1)
            
        print(f"✓ Generated {cutaway_path} and assets/battery_{model}.png ({spec['name']} - {spec['cap_mah']})")

if __name__ == '__main__':
    generate_all_batteries()
