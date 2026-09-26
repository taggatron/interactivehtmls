/**
 * Interactive Phone Hotspots & Pin Callouts for iPhone Xs.
 * Handles SVG interactive mesh, pulsating radar pins, audio synthesizer clicks,
 * and laser leader lines to inspector cards.
 */

class PhoneHotspots {
  constructor(options = {}) {
    this.container = options.container || document.getElementById("phone-hotspots-group");
    this.leaderLineGroup = options.leaderLineGroup || document.getElementById("leader-line-group");
    this.tooltipEl = document.getElementById("phone-part-tooltip");
    this.onSelect = options.onSelect || (() => {});
    this.audioEnabled = true;
    this.audioCtx = null;
    this.activeComponentId = null;

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
    this.renderHotspotMesh();
  }

  renderHotspotMesh() {
    if (!this.container) return;

    // SVG Hotspot Contours over Phone Front and Back
    const hotspots = [
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
          // Front phone left edge band
          "M 338,285 C 338,272 344,268 355,268 L 357,272 C 349,272 344,277 344,286 L 344,558 C 344,566 349,572 357,572 L 355,576 C 343,576 338,570 338,558 Z",
          // Back phone right edge band
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
          // Dual camera module
          "M 387,287 C 387,280 392,276 398,276 C 404,276 409,280 409,287 L 409,331 C 409,338 404,342 398,342 C 392,342 387,338 387,331 Z",
          // Upper Main Logic Board
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

    let html = "";
    hotspots.forEach((h) => {
      const comp = ENVIRONMENTAL_DATA.components[h.id];
      const strokeColor = comp ? comp.materialColor : "#0071e3";

      if (h.type === "path") {
        html += `
          <path id="hotspot-mesh-${h.id}"
                class="phone-mesh-part"
                d="${h.d}"
                fill="${strokeColor}"
                stroke="${strokeColor}"
                data-id="${h.id}"
                data-title="${h.title}">
            <title>${h.title}</title>
          </path>
        `;
      } else if (h.type === "multi-path") {
        html += `<g id="hotspot-mesh-${h.id}" class="phone-mesh-part" data-id="${h.id}" data-title="${h.title}">`;
        h.paths.forEach((p) => {
          html += `<path d="${p}" fill="${strokeColor}" stroke="${strokeColor}"></path>`;
        });
        html += `<title>${h.title}</title></g>`;
      } else if (h.type === "circle") {
        html += `
          <circle id="hotspot-mesh-${h.id}"
                  class="phone-mesh-part"
                  cx="${h.cx}"
                  cy="${h.cy}"
                  r="${h.r}"
                  fill="${strokeColor}"
                  stroke="${strokeColor}"
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
          this.highlightHover(h.id, true, e);
        });

        el.addEventListener("mousemove", (e) => {
          this.highlightHover(h.id, true, e);
        });

        el.addEventListener("mouseleave", () => {
          this.highlightHover(h.id, false);
        });
      }
    });
  }

  highlightHover(componentId, isHovered, event = null) {
    const meshEl = document.getElementById(`hotspot-mesh-${componentId}`);
    if (meshEl) {
      if (isHovered) {
        meshEl.classList.add("mesh-hovered");
      } else {
        meshEl.classList.remove("mesh-hovered");
      }
    }

    if (this.tooltipEl) {
      if (isHovered && componentId) {
        const comp = ENVIRONMENTAL_DATA.components[componentId];
        if (comp) {
          this.tooltipEl.innerHTML = `
            <span class="tooltip-dot" style="background: ${comp.materialColor};"></span>
            <strong>${comp.name}</strong> • ${comp.weightFormatted} (${comp.weightPercentage}%)
          `;
          this.tooltipEl.classList.add("visible");
          if (event) {
            const stageRect = document.getElementById("interactive-stage").getBoundingClientRect();
            const x = event.clientX - stageRect.left + 14;
            const y = event.clientY - stageRect.top + 14;
            this.tooltipEl.style.left = `${x}px`;
            this.tooltipEl.style.top = `${y}px`;
          }
        }
      } else {
        this.tooltipEl.classList.remove("visible");
      }
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

    const comp = ENVIRONMENTAL_DATA.components[componentId];
    if (!comp) {
      this.leaderLineGroup.innerHTML = "";
      return;
    }

    const startX = comp.pin.x;
    const startY = comp.pin.y;
    // Connect toward floating callout badge
    const targetX = startX > 420 ? startX + 45 : startX - 45;
    const targetY = startY - 35;

    this.leaderLineGroup.innerHTML = `
      <g class="leader-line-animated">
        <line x1="${startX}" y1="${startY}" x2="${targetX}" y2="${targetY}"
              stroke="${comp.materialColor}"
              stroke-width="2"
              stroke-dasharray="4 2"
              stroke-linecap="round"></line>
        <circle cx="${targetX}" cy="${targetY}" r="3.5" fill="${comp.materialColor}"></circle>
      </g>
    `;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PhoneHotspots;
}
