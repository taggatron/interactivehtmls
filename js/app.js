/**
 * Main Application Orchestrator for iPhone Xs Interactive Environmental Report
 */

document.addEventListener("DOMContentLoaded", () => {
  let activeComponentId = null;
  const componentKeys = Object.keys(ENVIRONMENTAL_DATA.components);

  // UI Reference for top-right info card
  const topInfoCard = document.getElementById("top-info-card");
  const stage = document.getElementById("interactive-stage");

  // Fact icons mapping for components
  const COMPONENT_ICONS = {
    overview: ["🌱", "♻️", "🤖"],
    display: ["📱", "⚡", "🔬"],
    stainless_steel: ["🛡️", "🔬", "♻️"],
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

  // Click on stage background (outside phone or chart slices) to reset
  if (stage) {
    stage.addEventListener("click", (e) => {
      const isPart = e.target.closest(".phone-mesh-part");
      const isSlice = e.target.closest(".chart-slice");
      const isLegend = e.target.closest(".legend-row");
      const isCard = e.target.closest(".top-info-card");
      if (!isPart && !isSlice && !isLegend && !isCard) {
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
      // General Device Overview (Simplified, Punchy)
      const icons = COMPONENT_ICONS.overview;
      const facts = ENVIRONMENTAL_DATA.overview.quickFacts || [
        "81% of lifecycle emissions (56.7 kg CO₂e) stem from production",
        "100% recycled tin utilized in main logic board solder",
        "Apple's Daisy robot recovers 14 core materials across 200 units/hour"
      ];

      topInfoCard.innerHTML = `
        <div class="info-card-header">
          <div class="info-badge">
            <span class="info-badge-dot"></span>
            <span>iPhone Xs (64GB Model)</span>
          </div>
          <span class="info-hint">Click phone parts or chart slices</span>
        </div>

        <div class="info-kpi-row">
          <div class="info-kpi-box">
            <div class="kpi-val">177<small>g</small></div>
            <div class="kpi-sub">Total Device Mass</div>
          </div>
          <div class="info-kpi-box">
            <div class="kpi-val">70<small>kg</small></div>
            <div class="kpi-sub">CO₂e Lifecycle</div>
          </div>
          <div class="info-kpi-box">
            <div class="kpi-val">81<small>%</small></div>
            <div class="kpi-sub">Production Phase</div>
          </div>
        </div>

        <div class="info-key-facts">
          ${facts.map((fact, idx) => `
            <div class="fact-pill" style="animation-delay: ${idx * 0.05}s">
              <span class="fact-icon">${icons[idx] || "🌱"}</span>
              <span class="fact-text">${fact}</span>
            </div>
          `).join("")}
        </div>
      `;
      return;
    }

    const comp = ENVIRONMENTAL_DATA.components[id];
    if (!comp) return;

    const icons = COMPONENT_ICONS[id] || ["🔹", "🔹", "🔹"];
    const facts = comp.quickFacts || comp.environmentalHighlights.slice(0, 3);
    const topEmissionsPhase = comp.emissionsBreakdown && comp.emissionsBreakdown.length > 0
      ? comp.emissionsBreakdown[0]
      : { percentage: 81, label: "Production" };
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
        ${facts.map((fact, idx) => `
          <div class="fact-pill" style="animation-delay: ${idx * 0.05}s">
            <span class="fact-icon">${icons[idx] || "🔹"}</span>
            <span class="fact-text">${fact}</span>
          </div>
        `).join("")}
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
    } else if (e.key === "ArrowRight") {
      let nextIndex = activeComponentId ? componentKeys.indexOf(activeComponentId) + 1 : 0;
      if (nextIndex >= componentKeys.length) nextIndex = 0;
      hotspots.playClickSound(640);
      selectComponent(componentKeys[nextIndex]);
    } else if (e.key === "ArrowLeft") {
      let prevIndex = activeComponentId ? componentKeys.indexOf(activeComponentId) - 1 : componentKeys.length - 1;
      if (prevIndex < 0) prevIndex = componentKeys.length - 1;
      hotspots.playClickSound(640);
      selectComponent(componentKeys[prevIndex]);
    }
  });

  // Initial state rendering
  updateInfoCard(null);
});
