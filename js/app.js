/**
 * Main Application Orchestrator for iPhone Xs Interactive Environmental Report
 */

document.addEventListener("DOMContentLoaded", () => {
  let activeComponentId = null;
  const componentKeys = Object.keys(ENVIRONMENTAL_DATA.components);

  // Initialize Subsystems
  const charts = new EnvironmentalCharts({
    onSelectComponent: (id) => selectComponent(id)
  });

  const hotspots = new PhoneHotspots({
    onSelect: (id) => selectComponent(id)
  });

  // UI References
  const stage = document.getElementById("interactive-stage");
  const inspectorPanel = document.getElementById("component-inspector");
  const inspectorName = document.getElementById("inspector-title");
  const inspectorCategory = document.getElementById("inspector-category");
  const inspectorWeight = document.getElementById("inspector-weight");
  const inspectorCarbon = document.getElementById("inspector-carbon");
  const inspectorDesc = document.getElementById("inspector-desc");
  const inspectorHighlights = document.getElementById("inspector-highlights");
  const inspectorMfg = document.getElementById("inspector-mfg");
  const inspectorCircular = document.getElementById("inspector-circular");

  // Central Component Selection Dispatcher
  function selectComponent(id) {
    activeComponentId = id;

    // Update charts & phone hotspots
    charts.update(id);
    hotspots.update(id);

    // Update Inspector Drawer
    updateInspector(id);
  }

  // Click on stage background (outside phone or chart slices) to reset
  if (stage) {
    stage.addEventListener("click", (e) => {
      const isPart = e.target.closest(".phone-mesh-part");
      const isSlice = e.target.closest(".chart-slice");
      const isLegend = e.target.closest(".legend-row");
      if (!isPart && !isSlice && !isLegend) {
        hotspots.playClickSound(480);
        selectComponent(null);
      }
    });
  }

  // Update Inspector Card
  function updateInspector(id) {
    if (!inspectorPanel) return;

    if (!id) {
      // General Device Overview
      inspectorPanel.classList.remove("active-card");
      inspectorCategory.textContent = "Complete Device Lifecycle";
      inspectorName.textContent = "iPhone Xs (64GB Model)";
      inspectorWeight.textContent = "177 grams";
      inspectorCarbon.textContent = "70 kg CO₂e";
      inspectorDesc.textContent =
        "Comprehensive environmental lifecycle assessment including raw materials extraction, manufacturing in zero-waste certified facilities, global transportation, energy consumed during customer usage, and Daisy disassembly recycling.";

      inspectorHighlights.innerHTML = `
        <li><span class="hl-badge">81% Production</span> Responsible for 56.7 kg CO₂e, dominated by semiconductor fabrication and stainless steel forging.</li>
        <li><span class="hl-badge">15% Customer Use</span> 10.5 kg CO₂e consumed across standard 3-year charging cycles.</li>
        <li><span class="hl-badge">Daisy Robot</span> Recovers 14 key materials across 200 iPhone units per hour.</li>
        <li><span class="hl-badge">Zero Waste</span> All final assembly facilities divert 100% of waste from landfills.</li>
      `;

      inspectorMfg.textContent =
        "Apple-mandated clean energy transitions power 100% of final assembly facilities. 100% recycled tin utilized in main logic board solder.";
      inspectorCircular.textContent =
        "Disassembly with Daisy allows closed-loop recycling of cobalt, gold, rare earth elements, and high-purity surgical steel.";
      return;
    }

    const comp = ENVIRONMENTAL_DATA.components[id];
    if (!comp) return;

    inspectorPanel.classList.add("active-card");
    inspectorCategory.textContent = comp.category;
    inspectorName.textContent = comp.name;
    inspectorWeight.textContent = `${comp.weightFormatted} (${comp.weightPercentage}% of Device)`;
    inspectorCarbon.textContent = `${comp.carbonFootprint} kg CO₂e (${comp.carbonPercentage}% of Total)`;
    inspectorDesc.textContent = comp.description;

    inspectorHighlights.innerHTML = comp.environmentalHighlights
      .map((h) => `<li><span class="hl-badge" style="background: ${comp.materialColor}20; color: ${comp.materialColor}; border-color: ${comp.materialColor}40;">Spec</span> ${h}</li>`)
      .join("");

    inspectorMfg.textContent = comp.manufacturingInsight;
    inspectorCircular.textContent = comp.circularFeature;
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

  // Initial state
  updateInspector(null);
});
