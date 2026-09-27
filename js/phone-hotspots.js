/**
 * Interactive Phone Hotspots & Pin Callouts for iPhone Multi-Generation Explorer.
 * Handles model-specific SVG interactive meshes, pulsating radar pins, audio synthesizer clicks,
 * and laser leader lines to inspector cards.
 */

const MODEL_HOTSPOT_BOUNDS = {
  xs:      { front: [342, 273, 418, 574], back: [380, 278.5, 486, 574], cx_back: 433, cy_back: 422 },
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
    this.audioEnabled = true;
    this.audioCtx = null;
    this.activeComponentId = null;
    this.currentModelId = options.modelId || (typeof currentModelId !== "undefined" ? currentModelId : "xs");

    this.initAudio();
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
        return { x: Math.round(bx0 + 30), y: Math.round((by0 + by1) / 2 + 25) };
      case "other":
        return { x: Math.round(cx), y: Math.round(cy) };
      case "plastics":
        return { x: Math.round((bx0 + bx1) / 2), y: Math.round(by1 - 22) };
      case "aluminum":
        return { x: Math.round(bx0 + (bx1 - bx0) * 0.72), y: Math.round(by0 + 115) };
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
    let hotspots = [];

    if (modelId === "xs") {
      // Handcrafted pixel-perfect paths for iPhone Xs
      hotspots = [
        {
          id: "display",
          title: "OLED Super Retina Display (6g)",
          type: "path",
          d: "M 346,286 C 346,275 353,271 364,271 L 377,271 C 378,274 380,276 384,276 L 396,276 C 400,276 402,274 403,271 L 409,271 C 415,271 418,275 418,286 L 418,556 C 418,568 410,573 400,573 L 360,573 C 349,573 346,566 346,556 Z"
        },
        {
          id: "stainless_steel",
          title: "Surgical-grade Stainless Steel Enclosure (54g)",
          type: "multi-path",
          paths: [
            "M 338,285 C 338,272 344,268 355,268 L 357,272 C 349,272 344,277 344,286 L 344,558 C 344,566 349,572 357,572 L 355,576 C 343,576 338,570 338,558 Z",
            "M 470,272 C 481,275 487,285 487,298 L 487,550 C 487,564 479,574 467,576 L 467,570 C 477,568 481,560 481,548 L 481,298 C 481,288 477,280 469,276 Z"
          ]
        },
        {
          id: "glass",
          title: "Durable Enclosure Glass (36g)",
          type: "path",
          d: "M 378,284 C 378,274 385,270 398,270 L 456,270 C 469,270 477,276 479,288 L 479,555 C 479,568 469,574 456,574 L 398,574 C 384,574 378,566 378,555 Z"
        },
        {
          id: "circuit_boards",
          title: "Circuit Boards & Dual Camera (18g)",
          type: "multi-path",
          paths: [
            "M 387,287 C 387,280 392,276 398,276 C 404,276 409,280 409,287 L 409,331 C 409,338 404,342 398,342 C 392,342 387,338 387,331 Z",
            "M 412,280 C 412,275 417,272 425,272 L 458,272 C 465,272 470,277 470,285 L 470,358 C 470,364 465,368 458,368 L 418,368 C 412,368 412,363 412,358 Z"
          ]
        },
        {
          id: "battery",
          title: "Lithium-Ion Battery Cell (40g)",
          type: "path",
          d: "M 405,395 C 405,388 410,384 418,384 L 454,384 C 460,384 464,388 464,395 L 464,510 C 464,517 460,521 454,521 L 418,521 C 410,521 405,517 405,510 Z"
        },
        {
          id: "other",
          title: "Wireless Qi Coil & Magnets (14g)",
          type: "circle",
          cx: 433,
          cy: 422,
          r: 28
        },
        {
          id: "plastics",
          title: "Engineered Plastics & Acoustics (8g)",
          type: "path",
          d: "M 390,528 C 390,522 396,518 406,518 L 466,518 C 472,518 476,522 476,528 L 476,568 C 476,573 470,576 462,576 L 400,576 C 394,576 390,572 390,566 Z"
        },
        {
          id: "aluminum",
          title: "Structural Aluminum Shielding (1g)",
          type: "path",
          d: "M 425,372 C 425,368 429,364 435,364 L 458,364 C 464,364 467,368 467,372 L 467,428 C 467,433 464,436 458,436 L 435,436 C 429,436 425,433 425,428 Z"
        }
      ];
    } else {
      // Dynamic model geometry for iPhone 11 Pro through iPhone 18 Pro
      hotspots = [
        {
          id: "display",
          title: "Super Retina XDR Display",
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
          title: "Logic Board & Pro Camera",
          type: "multi-path",
          paths: [
            // Camera module bump
            `M ${bx0 + 8 + 14},${by0 + 8} L ${bx0 + 8 + cameraW - 14},${by0 + 8} C ${bx0 + 8 + cameraW},${by0 + 8} ${bx0 + 8 + cameraW},${by0 + 8 + 14} ${bx0 + 8 + cameraW},${by0 + 8 + 14} L ${bx0 + 8 + cameraW},${by0 + 8 + cameraH - 14} C ${bx0 + 8 + cameraW},${by0 + 8 + cameraH} ${bx0 + 8 + cameraW - 14},${by0 + 8 + cameraH} ${bx0 + 8 + cameraW - 14},${by0 + 8 + cameraH} L ${bx0 + 8 + 14},${by0 + 8 + cameraH} C ${bx0 + 8},${by0 + 8 + cameraH} ${bx0 + 8},${by0 + 8 + cameraH - 14} ${bx0 + 8},${by0 + 8 + cameraH - 14} L ${bx0 + 8},${by0 + 8 + 14} C ${bx0 + 8},${by0 + 8} ${bx0 + 8 + 14},${by0 + 8} ${bx0 + 8 + 14},${by0 + 8} Z`,
            // Upper Main Logic Board
            `M ${bx0 + cameraW + 8},${by0 + 8} L ${bx1 - 10},${by0 + 8} L ${bx1 - 10},${by0 + 86} L ${bx0 + cameraW + 8},${by0 + 86} Z`
          ]
        },
        {
          id: "battery",
          title: "Lithium-Ion / Advanced Cell Battery",
          type: "rect",
          x: bx0 + 10,
          y: by0 + 78,
          width: Math.round(bw * 0.48),
          height: Math.round(bh - 122),
          rx: 10,
          ry: 10
        },
        {
          id: "other",
          title: "MagSafe Array & Qi Charging Coil",
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
      ];
    }

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
