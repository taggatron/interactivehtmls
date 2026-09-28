/**
 * Interactive Phone Hotspots & Pin Callouts for iPhone Multi-Generation Explorer.
 * Handles model-specific SVG interactive meshes, pulsating radar pins, audio synthesizer clicks,
 * and laser leader lines to inspector cards.
 */

const MODEL_HOTSPOT_BOUNDS = {
  xs:      { front: [244, 270.5, 398.5, 573.5], back: [430, 270.5, 584, 573.5], cx_back: 507, cy_back: 422 },
  '11pro': { front: [255.5, 270, 405.5, 573.5], back: [450, 277.5, 572.5, 573.5], cx_back: 511, cy_back: 425.5 },
  '12pro': { front: [297.5, 277, 410, 573], back: [420.5, 277, 530, 572.5], cx_back: 475, cy_back: 424.5 },
  '13pro': { front: [266.5, 271, 413.5, 573.5], back: [436, 273, 562, 573.5], cx_back: 499, cy_back: 423 },
  '14pro': { front: [276, 273.5, 418.5, 573.5], back: [432.5, 277, 553.5, 573.5], cx_back: 493, cy_back: 425 },
  '15pro': { front: [293.5, 277.5, 412.5, 570.5], back: [423, 277.5, 534, 572], cx_back: 478.5, cy_back: 424.5 },
  '16pro': { front: [289, 276.5, 405, 573.5], back: [422.5, 276.5, 538.5, 573.5], cx_back: 480.5, cy_back: 425 },
  '17pro': { front: [290.5, 276, 407.5, 573.5], back: [420.5, 276.5, 537.5, 573.5], cx_back: 479, cy_back: 425 },
  '18pro': { front: [291.5, 275.5, 405, 571], back: [423, 275.5, 536.5, 571], cx_back: 479.5, cy_back: 423 }
};

class PhoneHotspots {
  constructor(options = {}) {
    this.container = options.container || document.getElementById("phone-hotspots-group");
    this.leaderLineGroup = options.leaderLineGroup || document.getElementById("leader-line-group");
    this.tooltipEl = document.getElementById("phone-part-tooltip");
    this.onSelect = options.onSelect || (() => {});
    this.onHover = options.onHover || (() => {});
    this.audioEnabled = false;
    this.audioCtx = null;
    this.activeComponentId = null;
    this.currentModelId = options.modelId || (typeof currentModelId !== "undefined" ? currentModelId : "xs");

    // Sound is off by default.
    this.render();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  playClickSound(freq = 520, duration = 0.04) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio playback failed silently
    }
  }

  render() {
    this.renderHotspotMesh(this.currentModelId);
  }

  getComponentPin(componentId, modelId = this.currentModelId || "xs") {
    const b = MODEL_HOTSPOT_BOUNDS[modelId] || MODEL_HOTSPOT_BOUNDS.xs;
    const fx0 = b.front[0], fy0 = b.front[1], fx1 = b.front[2], fy1 = b.front[3];
    const bx0 = b.back[0], by0 = b.back[1], bx1 = b.back[2], by1 = b.back[3];
    const cx = b.cx_back, cy = b.cy_back;
    const bw = bx1 - bx0;

    switch (componentId) {
      case "display":
        return { x: Math.round((fx0 + fx1) / 2), y: Math.round(fy0 + 115) };
      case "stainless_steel":
        return { x: Math.round(bx1 - 5), y: Math.round((by0 + by1) / 2 + 10) };
      case "glass":
        return { x: Math.round((bx0 + bx1) / 2), y: Math.round(by0 + 75) };
      case "circuit_boards":
        return { x: Math.round(bx0 + 38), y: Math.round(by0 + 38) };
      case "battery":
        if (modelId === "xs") return { x: 518, y: 440 };
        if (modelId === "11pro") return { x: 532, y: 435 };
        if (modelId === "13pro") return { x: 470, y: 440 };
        return { x: Math.round(bx0 + bw * 0.28), y: Math.round((by0 + by1) / 2 + 15) };
      case "other":
        return { x: Math.round(cx), y: Math.round(cy) };
      case "plastics":
        return { x: Math.round((bx0 + bx1) / 2), y: Math.round(by1 - 22) };
      case "aluminum":
        return { x: Math.round(bx0 + bw * 0.72), y: Math.round(by0 + 115) };
      default:
        return { x: Math.round(cx), y: Math.round(cy) };
    }
  }

  renderHotspotMesh(modelId = this.currentModelId || "xs") {
    if (!this.container) return;
    this.currentModelId = modelId;

    const b = MODEL_HOTSPOT_BOUNDS[modelId] || MODEL_HOTSPOT_BOUNDS.xs;
    const fx0 = b.front[0], fy0 = b.front[1], fx1 = b.front[2], fy1 = b.front[3];
    const bx0 = b.back[0], by0 = b.back[1], bx1 = b.back[2], by1 = b.back[3];
    const cx = b.cx_back, cy = b.cy_back;

    const fw = fx1 - fx0;
    const fh = fy1 - fy0;
    const bw = bx1 - bx0;
    const bh = by1 - by0;

    const cameraW = Math.min(62, Math.max(48, Math.round(bw * 0.44)));
    const cameraH = Math.min(64, Math.max(52, Math.round(bw * 0.46)));

    // Generate model-accurate hotspots mapped to the exact subpixel phone coordinates
    let hotspots = [
      {
        id: "display",
        title: "Super Retina Display",
        type: "rect",
        x: fx0 + 6,
        y: fy0 + 8,
        width: fw - 12,
        height: fh - 16,
        rx: 16,
        ry: 16
      },
      {
        id: "stainless_steel",
        title: "Precision Chassis & Frame",
        type: "multi-path",
        paths: [
          // Left band of front display
          `M ${fx0},${fy0 + 16} C ${fx0},${fy0 + 4} ${fx0 + 6},${fy0} ${fx0 + 16},${fy0} L ${fx0 + 20},${fy0 + 4} C ${fx0 + 10},${fy0 + 4} ${fx0 + 6},${fy0 + 10} ${fx0 + 6},${fy0 + 18} L ${fx0 + 6},${fy1 - 18} C ${fx0 + 6},${fy1 - 10} ${fx0 + 10},${fy1 - 4} ${fx0 + 20},${fy1 - 4} L ${fx0 + 16},${fy1} C ${fx0 + 6},${fy1} ${fx0},${fy1 - 4} ${fx0},${fy1 - 16} Z`,
          // Right outer band of rear chassis
          `M ${bx1 - 16},${by0} C ${bx1 - 6},${by0} ${bx1},${by0 + 4} ${bx1},${by0 + 16} L ${bx1},${by1 - 16} C ${bx1},${by1 - 4} ${bx1 - 6},${by1} ${bx1 - 16},${by1} L ${bx1 - 20},${by1 - 4} C ${bx1 - 10},${by1 - 4} ${bx1 - 6},${by1 - 10} ${bx1 - 6},${by1 - 18} L ${bx1 - 6},${by0 + 18} C ${bx1 - 6},${by0 + 10} ${bx1 - 10},${by0 + 4} ${bx1 - 20},${by0 + 4} Z`
        ]
      },
      {
        id: "glass",
        title: "Precision Back Glass",
        type: "rect",
        x: bx0 + 6,
        y: by0 + 6,
        width: bw - 12,
        height: bh - 12,
        rx: 18,
        ry: 18
      },
      {
        id: "circuit_boards",
        title: "Logic Board & Camera System",
        type: "multi-path",
        paths: [
          // Camera module bump
          `M ${bx0 + 8 + 14},${by0 + 8} L ${bx0 + 8 + cameraW - 14},${by0 + 8} C ${bx0 + 8 + cameraW},${by0 + 8} ${bx0 + 8 + cameraW},${by0 + 8 + 14} ${bx0 + 8 + cameraW},${by0 + 8 + 14} L ${bx0 + 8 + cameraW},${by0 + 8 + cameraH - 14} C ${bx0 + 8 + cameraW},${by0 + 8 + cameraH} ${bx0 + 8 + cameraW - 14},${by0 + 8 + cameraH} ${bx0 + 8 + cameraW - 14},${by0 + 8 + cameraH} L ${bx0 + 8 + 14},${by0 + 8 + cameraH} C ${bx0 + 8},${by0 + 8 + cameraH} ${bx0 + 8},${by0 + 8 + cameraH - 14} ${bx0 + 8},${by0 + 8 + cameraH - 14} L ${bx0 + 8},${by0 + 8 + 14} C ${bx0 + 8},${by0 + 8} ${bx0 + 8 + 14},${by0 + 8} ${bx0 + 8 + 14},${by0 + 8} Z`,
          // Upper Main Logic Board
          `M ${bx0 + cameraW + 8},${by0 + 8} L ${bx1 - 10},${by0 + 8} L ${bx1 - 10},${by0 + 86} L ${bx0 + cameraW + 8},${by0 + 86} Z`
        ]
      }
    ];

    // Model-accurate battery geometry
    if (modelId === "xs" || modelId === "11pro") {
      // Authentic L-shaped battery with vertical stalk on the right and horizontal foot along the bottom
      const sx0 = Math.round(bx0 + bw * 0.44), sx1 = Math.round(bx1 - 10);
      const sy0 = Math.round(by0 + 58), sy1 = Math.round(by1 - 38);
      const fx0 = Math.round(bx0 + 14), fy0 = Math.round(by0 + bh * 0.60);
      hotspots.push({
        id: "battery",
        title: "Lithium-Ion L-Shaped Battery Pack",
        type: "path",
        d: `M ${sx0 + 8},${sy0} L ${sx1 - 8},${sy0} C ${sx1},${sy0} ${sx1},${sy0 + 8} ${sx1},${sy0 + 8} L ${sx1},${sy1 - 8} C ${sx1},${sy1} ${sx1 - 8},${sy1} ${sx1 - 8},${sy1} L ${fx0 + 8},${sy1} C ${fx0},${sy1} ${fx0},${sy1 - 8} ${fx0},${sy1 - 8} L ${fx0},${fy0 + 8} C ${fx0},${fy0} ${fx0 + 8},${fy0} ${fx0 + 8},${fy0} L ${sx0 - 8},${fy0} C ${sx0},${fy0} ${sx0},${fy0 - 8} ${sx0},${fy0 - 8} L ${sx0},${sy0 + 8} C ${sx0},${sy0} ${sx0 + 8},${sy0} ${sx0 + 8},${sy0} Z`
      });
    } else if (modelId === "13pro") {
      // Authentic L-shaped battery contoured on left and bottom
      const sx0 = Math.round(bx0 + 12), sx1 = Math.round(bx0 + bw * 0.44);
      const sy0 = Math.round(by0 + 78), sy1 = Math.round(by1 - 38);
      const fx1 = Math.round(bx1 - 14), fy0 = Math.round(by0 + bh * 0.64);
      hotspots.push({
        id: "battery",
        title: "Lithium-Ion L-Shaped Battery Pack",
        type: "path",
        d: `M ${sx0 + 8},${sy0} L ${sx1 - 8},${sy0} C ${sx1},${sy0} ${sx1},${sy0 + 8} ${sx1},${sy0 + 8} L ${sx1},${fy0 - 8} C ${sx1},${fy0} ${sx1 + 8},${fy0} ${sx1 + 8},${fy0} L ${fx1 - 8},${fy0} C ${fx1},${fy0} ${fx1},${fy0 + 8} ${fx1},${fy0 + 8} L ${fx1},${sy1 - 8} C ${fx1},${sy1} ${fx1 - 8},${sy1} ${fx1 - 8},${sy1} L ${sx0 + 8},${sy1} C ${sx0},${sy1} ${sx0},${sy1 - 8} ${sx0},${sy1 - 8} L ${sx0},${sy0 + 8} C ${sx0},${sy0} ${sx0 + 8},${sy0} ${sx0 + 8},${sy0} Z`
      });
    } else {
      // Rectangular battery on left side
      hotspots.push({
        id: "battery",
        title: modelId === "16pro" ? "Laser-Welded Steel Thermal Battery" : "Lithium-Ion / Advanced Cell Battery",
        type: "rect",
        x: bx0 + 12,
        y: by0 + 72,
        width: Math.round(bw * 0.44),
        height: Math.round(bh - 116),
        rx: 10,
        ry: 10
      });
    }

    // Wireless coil, plastics, aluminum
    hotspots.push(
      {
        id: "other",
        title: (modelId === "xs" || modelId === "11pro") ? "Wireless Qi Charging Coil" : "MagSafe Array & Qi Charging Coil",
        type: "circle",
        cx: Math.round(cx),
        cy: Math.round(cy),
        r: 28
      },
      {
        id: "plastics",
        title: "Acoustics & Antenna Plastics",
        type: "rect",
        x: bx0 + 10,
        y: by1 - 38,
        width: bw - 20,
        height: 30,
        rx: 8,
        ry: 8
      },
      {
        id: "aluminum",
        title: "Internal Thermal Shielding",
        type: "rect",
        x: Math.round(bx0 + bw * 0.52),
        y: by0 + 82,
        width: Math.round(bw * 0.40),
        height: 64,
        rx: 8,
        ry: 8
      }
    );

    let html = "";
    hotspots.forEach((h) => {
      if (h.type === "path") {
        html += `
          <path id="hotspot-mesh-${h.id}"
                class="phone-mesh-part"
                d="${h.d}"
                fill="transparent"
                stroke="none"
                data-id="${h.id}"
                data-title="${h.title}">
            <title>${h.title}</title>
          </path>
        `;
      } else if (h.type === "rect") {
        html += `
          <rect id="hotspot-mesh-${h.id}"
                class="phone-mesh-part"
                x="${h.x}"
                y="${h.y}"
                width="${h.width}"
                height="${h.height}"
                rx="${h.rx || 0}"
                ry="${h.ry || 0}"
                fill="transparent"
                stroke="none"
                data-id="${h.id}"
                data-title="${h.title}">
            <title>${h.title}</title>
          </rect>
        `;
      } else if (h.type === "multi-path") {
        html += `<g id="hotspot-mesh-${h.id}" class="phone-mesh-part" data-id="${h.id}" data-title="${h.title}">`;
        h.paths.forEach((p) => {
          html += `<path d="${p}" fill="transparent" stroke="none"></path>`;
        });
        html += `<title>${h.title}</title></g>`;
      } else if (h.type === "circle") {
        html += `
          <circle id="hotspot-mesh-${h.id}"
                  class="phone-mesh-part"
                  cx="${h.cx}"
                  cy="${h.cy}"
                  r="${h.r}"
                  fill="transparent"
                  stroke="none"
                  data-id="${h.id}"
                  data-title="${h.title}">
            <title>${h.title}</title>
          </circle>
        `;
      }
    });

    this.container.innerHTML = html;

    // Attach click and hover handlers to mesh components
    hotspots.forEach((h) => {
      const el = document.getElementById(`hotspot-mesh-${h.id}`);
      if (el) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          this.playClickSound(640);
          const newTarget = this.activeComponentId === h.id ? null : h.id;
          this.onSelect(newTarget);
        });

        el.addEventListener("mouseenter", (e) => {
          this.playClickSound(800, 0.02);
          this.highlightHover(h.id, true, e, true);
        });

        el.addEventListener("mousemove", (e) => {
          this.highlightHover(h.id, true, e, false);
        });

        el.addEventListener("mouseleave", () => {
          this.highlightHover(h.id, false, null, true);
        });
      }
    });
  }

  highlightHover(componentId, isHovered, event = null, triggerCallback = false) {
    const meshEl = document.getElementById(`hotspot-mesh-${componentId}`);
    if (meshEl) {
      if (isHovered) {
        meshEl.classList.add("mesh-hovered");
      } else {
        meshEl.classList.remove("mesh-hovered");
      }
    }

    if (this.tooltipEl) {
      if (isHovered && componentId && event) {
        const comp = ENVIRONMENTAL_DATA.components ? ENVIRONMENTAL_DATA.components[componentId] : null;
        if (comp) {
          this.tooltipEl.innerHTML = `
            <span class="tooltip-dot" style="background: ${comp.materialColor};"></span>
            <strong>${comp.name}</strong> • ${comp.weightFormatted} (${comp.weightPercentage}%)
          `;
          this.tooltipEl.classList.add("visible");
          const stageRect = document.getElementById("interactive-stage").getBoundingClientRect();
          const x = event.clientX - stageRect.left + 14;
          const y = event.clientY - stageRect.top + 14;
          this.tooltipEl.style.left = `${x}px`;
          this.tooltipEl.style.top = `${y}px`;
        }
      } else {
        this.tooltipEl.classList.remove("visible");
      }
    }

    // Cross-highlight other subsystems
    if (triggerCallback && this.onHover) {
      this.onHover(componentId, isHovered);
    }
  }

  update(componentId) {
    this.activeComponentId = componentId;

    // Update mesh classes
    document.querySelectorAll(".phone-mesh-part").forEach((el) => {
      const id = el.getAttribute("data-id");
      if (componentId && id === componentId) {
        el.classList.add("mesh-active");
      } else {
        el.classList.remove("mesh-active");
      }
    });

    this.renderLeaderLine(componentId);
  }

  renderLeaderLine(componentId) {
    if (!this.leaderLineGroup) return;

    if (!componentId) {
      this.leaderLineGroup.innerHTML = "";
      return;
    }

    const comp = ENVIRONMENTAL_DATA.components ? ENVIRONMENTAL_DATA.components[componentId] : null;
    if (!comp) {
      this.leaderLineGroup.innerHTML = "";
      return;
    }

    const pin = this.getComponentPin(componentId, this.currentModelId);
    const startX = pin.x;
    const startY = pin.y;

    // Target the left border of the top-right card at (547, targetY)
    const targetX = 547;
    // Map vertical component position smoothly to card left edge (range ~65 to 175)
    const targetY = Math.round(Math.min(175, Math.max(65, 80 + (startY - 280) * 0.32)));

    // Route cleanly out through the corridor between phone and right elements (x >= 496)
    const cp1x = Math.max(Math.round(startX + (targetX - startX) * 0.4), 496);
    const cp1y = Math.round(startY - (startY - targetY) * 0.12);
    const cp2x = 522;
    const cp2y = Math.round(targetY + (startY - targetY) * 0.22);

    const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

    this.leaderLineGroup.innerHTML = `
      <g class="leader-line-animated" filter="url(#glow-effect)">
        <!-- Underlying soft glow aura -->
        <path d="${pathD}"
              stroke="${comp.materialColor}"
              stroke-width="4"
              stroke-opacity="0.35"
              fill="none"
              stroke-linecap="round"></path>

        <!-- Dynamic Laser Dash line -->
        <path class="laser-flow-line"
              d="${pathD}"
              stroke="${comp.materialColor}"
              stroke-width="2.2"
              fill="none"
              stroke-linecap="round"></path>

        <!-- Origin component ping & dot -->
        <circle cx="${startX}" cy="${startY}" r="7" fill="${comp.materialColor}" fill-opacity="0.25" class="laser-origin-ping"></circle>
        <circle cx="${startX}" cy="${startY}" r="3.5" fill="#ffffff" stroke="${comp.materialColor}" stroke-width="2"></circle>

        <!-- Target card anchor node -->
        <circle cx="${targetX}" cy="${targetY}" r="4" fill="${comp.materialColor}" stroke="#ffffff" stroke-width="1.5"></circle>
      </g>
    `;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PhoneHotspots;
}
