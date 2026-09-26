/**
 * Main Application Orchestrator for iPhone Multi-Generation Interactive Environmental Report
 * Supports iPhone Xs through iPhone 16 Pro timeline navigation, bidirectional chart linking,
 * dynamic hardware photo swap, and integrated real-time inspection.
 */

document.addEventListener("DOMContentLoaded", () => {
  const modelIds = Object.keys(IPHONE_MODELS_DATA);
  let activeModelId = currentModelId || "xs";
  let activeComponentId = null;

  // DOM Elements
  const timelineBar = document.getElementById("timeline-bar");
  const stagePhoneImg = document.getElementById("stage-phone-img");
  const emissionsTitleEl = document.getElementById("emissions-chart-title");
  const materialsTitleEl = document.getElementById("materials-chart-title");
  const topInfoCard = document.getElementById("top-info-card");
  const stage = document.getElementById("interactive-stage");

  // Fact icons mapping for components & overview
  const COMPONENT_ICONS = {
    overview: ["🌱", "♻️", "🤖"],
    display: ["📱", "⚡", "🔬"],
    stainless_steel: ["🛡️", "🔬", "♻️"],
    titanium: ["🚀", "🪶", "🛡️"],
    glass: ["✨", "🛡️", "🌊"],
    circuit_boards: ["⚡", "🥇", "♻️"],
    battery: ["🔋", "⚡", "🤖"],
    other: ["📡", "🧲", "♻️"],
    plastics: ["🌱", "🔊", "♻️"],
    aluminum: ["🪶", "🛡️", "♻️"]
  };

  // Central Component Selection Dispatcher
  function selectComponent(id) {
    activeComponentId = id;

    // Update charts & phone hotspots
    charts.update(id);
    hotspots.update(id);

    // Update Top-Right Integrated Card
    updateInfoCard(id);
  }

  // Initialize Subsystems
  const charts = new EnvironmentalCharts({
    onSelectComponent: (id) => selectComponent(id),
    onHoverComponent: (id, isHovered) => hotspots.highlightHover(id, isHovered)
  });

  const hotspots = new PhoneHotspots({
    onSelect: (id) => selectComponent(id),
    onHover: (id, isHovered) => charts.highlightSlice(id, isHovered)
  });

  // Switch Active iPhone Model
  function switchModel(modelId) {
    if (!IPHONE_MODELS_DATA[modelId]) return;
    activeModelId = modelId;
    activeComponentId = null;

    // Audio feedback
    hotspots.playClickSound(580, 0.04);

    // Update global environmental dataset
    setModelData(modelId);

    // Smooth photo cross-fade
    if (stagePhoneImg) {
      stagePhoneImg.classList.add("phone-fade-out");
      setTimeout(() => {
        stagePhoneImg.src = ENVIRONMENTAL_DATA.image;
        stagePhoneImg.alt = `${ENVIRONMENTAL_DATA.displayName} presentation cutout`;
        stagePhoneImg.classList.remove("phone-fade-out");
      }, 120);
    }

    // Update SVG Chart Titles
    if (emissionsTitleEl) {
      emissionsTitleEl.textContent = ENVIRONMENTAL_DATA.emissionsTitle;
    }
    if (materialsTitleEl) {
      materialsTitleEl.textContent = ENVIRONMENTAL_DATA.materialsTitle;
    }

    // Update timeline buttons state
    if (timelineBar) {
      timelineBar.querySelectorAll(".timeline-node").forEach((node) => {
        const isCurrent = node.getAttribute("data-id") === modelId;
        node.classList.toggle("active", isCurrent);
        node.setAttribute("aria-selected", isCurrent ? "true" : "false");

        let dot = node.querySelector(".t-dot");
        if (isCurrent && !dot) {
          const newDot = document.createElement("span");
          newDot.className = "t-dot";
          node.appendChild(newDot);
        } else if (!isCurrent && dot) {
          dot.remove();
        }
      });
    }

    // Re-render chart engines with new model data
    charts.update(null);

    // Refresh phone hotspots mesh colors
    hotspots.renderHotspotMesh();
    hotspots.update(null);

    // Refresh top-right integrated info card
    updateInfoCard(null);
  }

  // Render Apple Model Evolution Timeline Navigation
  function renderTimeline() {
    if (!timelineBar) return;
    const models = Object.values(IPHONE_MODELS_DATA);

    timelineBar.innerHTML = models
      .map((m) => {
        const isActive = m.id === activeModelId;
        return `
        <button class="timeline-node ${isActive ? "active" : ""}"
                role="tab"
                aria-selected="${isActive ? "true" : "false"}"
                data-id="${m.id}"
                title="${m.displayName} (${m.year}) — ${m.overview.totalEmissions} kg CO₂e lifecycle">
          <span class="t-year">${m.year}</span>
          <span class="t-name">${m.displayName}</span>
          <span class="t-co2">${m.overview.totalEmissions} kg</span>
          ${isActive ? '<span class="t-dot"></span>' : ""}
        </button>
      `;
      })
      .join("");

    // Attach click events
    timelineBar.querySelectorAll(".timeline-node").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id && id !== activeModelId) {
          switchModel(id);
        }
      });
    });
  }

  // Click on stage background (outside phone or chart slices) to reset selection
  if (stage) {
    stage.addEventListener("click", (e) => {
      const isPart = e.target.closest(".phone-mesh-part");
      const isSlice = e.target.closest(".chart-slice");
      const isLegend = e.target.closest(".legend-row");
      const isCard = e.target.closest(".top-info-card");
      const isTimeline = e.target.closest(".timeline-bar");
      if (!isPart && !isSlice && !isLegend && !isCard && !isTimeline) {
        hotspots.playClickSound(480);
        selectComponent(null);
      }
    });
  }

  // Update Top-Right Integrated Information Card
  function updateInfoCard(id) {
    if (!topInfoCard) return;

    // Trigger smooth reveal animation
    topInfoCard.classList.remove("anim-update");
    void topInfoCard.offsetWidth; // Force reflow
    topInfoCard.classList.add("anim-update");

    if (!id) {
      // General Device Overview (Dynamic per Model)
      const icons = COMPONENT_ICONS.overview;
      const facts = ENVIRONMENTAL_DATA.overview.quickFacts || [
        "81% of lifecycle emissions (56.7 kg CO₂e) stem from production",
        "100% recycled tin utilized in main logic board solder",
        "Apple's Daisy robot recovers 14 core materials across 200 units/hour"
      ];

      const topEmissions =
        ENVIRONMENTAL_DATA.overview.emissionsBreakdown &&
        ENVIRONMENTAL_DATA.overview.emissionsBreakdown[0]
          ? ENVIRONMENTAL_DATA.overview.emissionsBreakdown[0]
          : { percentage: 81, label: "Production" };

      topInfoCard.innerHTML = `
        <div class="info-card-header">
          <div class="info-badge">
            <span class="info-badge-dot"></span>
            <span>${ENVIRONMENTAL_DATA.name} (${ENVIRONMENTAL_DATA.storage})</span>
          </div>
          <span class="info-hint">Click phone parts or chart slices</span>
        </div>

        <div class="info-kpi-row">
          <div class="info-kpi-box">
            <div class="kpi-val">${ENVIRONMENTAL_DATA.overview.totalWeight}<small>g</small></div>
            <div class="kpi-sub">Total Device Mass</div>
          </div>
          <div class="info-kpi-box">
            <div class="kpi-val">${ENVIRONMENTAL_DATA.overview.totalEmissions}<small>kg</small></div>
            <div class="kpi-sub">CO₂e Lifecycle</div>
          </div>
          <div class="info-kpi-box">
            <div class="kpi-val">${topEmissions.percentage}<small>%</small></div>
            <div class="kpi-sub">${topEmissions.label} Phase</div>
          </div>
        </div>

        <div class="info-key-facts">
          ${facts
            .map(
              (fact, idx) => `
            <div class="fact-pill" style="animation-delay: ${idx * 0.05}s">
              <span class="fact-icon">${icons[idx] || "🌱"}</span>
              <span class="fact-text">${fact}</span>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      return;
    }

    const comp = ENVIRONMENTAL_DATA.components[id];
    if (!comp) return;

    const icons = COMPONENT_ICONS[id] || ["🔹", "🔹", "🔹"];
    const facts = comp.quickFacts || (comp.environmentalHighlights ? comp.environmentalHighlights.slice(0, 3) : []);
    const topEmissionsPhase =
      comp.emissionsBreakdown && comp.emissionsBreakdown.length > 0
        ? comp.emissionsBreakdown[0]
        : { percentage: 80, label: "Production" };
    const phaseShortName = topEmissionsPhase.label.split("(")[0].trim();

    topInfoCard.innerHTML = `
      <div class="info-card-header">
        <div class="info-badge" style="background: ${comp.materialColor}16; color: ${comp.materialColor};">
          <span class="info-badge-dot" style="background: ${comp.materialColor};"></span>
          <span>${comp.name}</span>
          <span class="info-badge-sub">• ${comp.category}</span>
        </div>
        <button id="info-btn-reset" class="info-reset-btn" title="Return to complete device overview">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          Overview
        </button>
      </div>

      <div class="info-kpi-row">
        <div class="info-kpi-box" style="border-color: ${comp.materialColor}30;">
          <div class="kpi-val" style="color: ${comp.materialColor};">${comp.weightFormatted}</div>
          <div class="kpi-sub">${comp.weightPercentage}% of Device</div>
        </div>
        <div class="info-kpi-box">
          <div class="kpi-val">${comp.carbonFootprint}<small>kg</small></div>
          <div class="kpi-sub">${comp.carbonPercentage}% of Total CO₂e</div>
        </div>
        <div class="info-kpi-box">
          <div class="kpi-val">${topEmissionsPhase.percentage}<small>%</small></div>
          <div class="kpi-sub">${phaseShortName}</div>
        </div>
      </div>

      <div class="info-key-facts">
        ${facts
          .map(
            (fact, idx) => `
          <div class="fact-pill" style="animation-delay: ${idx * 0.05}s">
            <span class="fact-icon">${icons[idx] || "🔹"}</span>
            <span class="fact-text">${fact}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Hook up reset button
    const resetBtn = document.getElementById("info-btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        hotspots.playClickSound(480);
        selectComponent(null);
      });
    }
  }

  // Keyboard Navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hotspots.playClickSound(480);
      selectComponent(null);
    } else if (e.key >= "1" && e.key <= "7") {
      const idx = parseInt(e.key, 10) - 1;
      if (modelIds[idx]) {
        switchModel(modelIds[idx]);
      }
    } else if ((e.key === "ArrowRight" || e.key === "ArrowDown") && (e.altKey || e.metaKey)) {
      let idx = modelIds.indexOf(activeModelId) + 1;
      if (idx >= modelIds.length) idx = 0;
      switchModel(modelIds[idx]);
    } else if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && (e.altKey || e.metaKey)) {
      let idx = modelIds.indexOf(activeModelId) - 1;
      if (idx < 0) idx = modelIds.length - 1;
      switchModel(modelIds[idx]);
    } else if (e.key === "ArrowRight") {
      const componentKeys = Object.keys(ENVIRONMENTAL_DATA.components);
      let nextIndex = activeComponentId ? componentKeys.indexOf(activeComponentId) + 1 : 0;
      if (nextIndex >= componentKeys.length) nextIndex = 0;
      hotspots.playClickSound(640);
      selectComponent(componentKeys[nextIndex]);
    } else if (e.key === "ArrowLeft") {
      const componentKeys = Object.keys(ENVIRONMENTAL_DATA.components);
      let prevIndex = activeComponentId ? componentKeys.indexOf(activeComponentId) - 1 : componentKeys.length - 1;
      if (prevIndex < 0) prevIndex = componentKeys.length - 1;
      hotspots.playClickSound(640);
      selectComponent(componentKeys[prevIndex]);
    }
  });

  // Initial render
  renderTimeline();
  updateInfoCard(null);
});
