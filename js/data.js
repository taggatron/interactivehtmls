/**
 * Environmental and Material Lifecycle Data for iPhone Xs (64GB Model)
 * Sourced from Apple iPhone Xs Environmental Report
 * Total Emissions: 70 kg CO2e | Total Device Weight: 177 grams
 */

const ENVIRONMENTAL_DATA = {
  overview: {
    title: "Greenhouse Gas Emissions for iPhone Xs—64GB model",
    materialTitle: "Material Use for iPhone Xs",
    totalEmissions: 70, // kg CO2e
    totalWeight: 177, // grams
    emissionsBreakdown: [
      { id: "production", label: "Production", percentage: 81, value: 56.7, color: "#548c8b" },
      { id: "customer_use", label: "Customer use", percentage: 15, value: 10.5, color: "#adc666" },
      { id: "transport", label: "Transport", percentage: 3, value: 2.1, color: "#d8bd48" },
      { id: "recycling", label: "Recycling", percentage: 1, value: 0.7, color: "#6eb172" }
    ],
    materialsBreakdown: [
      { id: "stainless_steel", label: "Stainless steel", weight: 54, percentage: 30.5, color: "#395b8c" },
      { id: "battery", label: "Battery", weight: 40, percentage: 22.6, color: "#548c8b" },
      { id: "glass", label: "Glass", weight: 36, percentage: 20.3, color: "#899a38" },
      { id: "circuit_boards", label: "Circuit boards", weight: 18, percentage: 10.2, color: "#b8cc3b" },
      { id: "other", label: "Other", weight: 14, percentage: 7.9, color: "#6ec1b8" },
      { id: "plastics", label: "Plastics", weight: 8, percentage: 4.5, color: "#bfa362" },
      { id: "display", label: "Display", weight: 6, percentage: 3.4, color: "#e78138" },
      { id: "aluminum", label: "Aluminum", weight: 1, percentage: 0.6, color: "#c8483b" }
    ],
    quickFacts: [
      "81% of lifecycle emissions (56.7 kg CO₂e) stem from production",
      "100% recycled tin utilized in the main logic board solder",
      "Apple's Daisy robot recovers 14 core materials across 200 units/hour"
    ]
  },

  components: {
    display: {
      id: "display",
      name: "OLED Display",
      category: "Display Subsystem",
      weight: 6,
      weightFormatted: "6g",
      weightPercentage: 3.4,
      materialColor: "#e78138",
      carbonFootprint: 11.2, // kg CO2e
      carbonPercentage: 16.0,
      emissionsBreakdown: [
        { label: "Production (OLED & Lamination)", percentage: 84, color: "#548c8b" },
        { label: "Customer Use (Power Draw)", percentage: 13, color: "#adc666" },
        { label: "Transport Logistics", percentage: 2, color: "#d8bd48" },
        { label: "Material Recovery", percentage: 1, color: "#6eb172" }
      ],
      pin: { x: 368, y: 400, label: "Display (6g)" },
      leaderTarget: { x: 368, y: 390 },
      description: "Super Retina HD 5.8-inch custom OLED multi-touch display featuring True Tone, HDR, and P3 wide color gamut.",
      quickFacts: [
        "Mercury-free emissive OLED & arsenic-free protective glass",
        "Individual organic pixels drop power draw up to 30% in dark modes",
        "Detached cleanly by Daisy robot to recover rare earth optics"
      ],
      environmentalHighlights: [
        "Mercury-free emissive OLED panel",
        "Arsenic-free protective cover glass",
        "Beryllium-free flexible interconnects",
        "High-efficiency subpixels reducing energy draw during active screen time"
      ],
      manufacturingInsight: "Manufactured in supplier facilities moving toward 100% renewable electricity. Integrated organic light-emitting diode structure reduces overall mass down to just 6 grams.",
      circularFeature: "Display modules are cleanly detached by Apple's Daisy robot to recover rare earth elements and high-grade optics."
    },

    stainless_steel: {
      id: "stainless_steel",
      name: "Stainless Steel Band",
      category: "Structural Enclosure",
      weight: 54,
      weightFormatted: "54g",
      weightPercentage: 30.5,
      materialColor: "#395b8c",
      carbonFootprint: 15.4, // kg CO2e
      carbonPercentage: 22.0,
      emissionsBreakdown: [
        { label: "Smelting & Precision CNC", percentage: 76, color: "#395b8c" },
        { label: "Customer Use (Structural)", percentage: 12, color: "#adc666" },
        { label: "Global Air/Sea Freight", percentage: 8, color: "#d8bd48" },
        { label: "Closed-loop Recycling", percentage: 4, color: "#6eb172" }
      ],
      pin: { x: 476, y: 440, label: "Stainless Steel (54g)" },
      leaderTarget: { x: 476, y: 440 },
      description: "Surgical-grade custom alloy frame precisely machined to sub-millimeter tolerances, providing structural rigidity and IP68 water resistance.",
      quickFacts: [
        "100% recyclable surgical-grade steel custom alloy",
        "PVD micro-coating replaces toxic wet chemical baths",
        "Sub-millimeter CNC milling scrap recycled into supply chain"
      ],
      environmentalHighlights: [
        "100% recyclable surgical-grade steel alloy",
        "Extreme tensile strength extends device longevity and drops replacement rate",
        "PVD (Physical Vapor Deposition) micro-coating eliminates toxic wet chemical baths",
        "Zero waste to landfill certification at final assembly facilities"
      ],
      manufacturingInsight: "Forged and CNC-milled using energy-optimized machining centers. Steel scrap from the milling process is collected and remelted into the supply chain.",
      circularFeature: "Daisy recycling robot rapidly unbinds the stainless steel frame from the internal chassis, yielding high-purity ferrous recyclate."
    },

    battery: {
      id: "battery",
      name: "Lithium-Ion Battery",
      category: "Power Subsystem",
      weight: 40,
      weightFormatted: "40g",
      weightPercentage: 22.6,
      materialColor: "#548c8b",
      carbonFootprint: 8.4, // kg CO2e
      carbonPercentage: 12.0,
      emissionsBreakdown: [
        { label: "Cathode Synthesis & Cell Fab", percentage: 74, color: "#548c8b" },
        { label: "Charging Lifecycle Losses", percentage: 18, color: "#adc666" },
        { label: "Packaging & Delivery", percentage: 5, color: "#d8bd48" },
        { label: "Cobalt Hydrometallurgy", percentage: 3, color: "#6eb172" }
      ],
      pin: { x: 422, y: 460, label: "Battery (40g)" },
      leaderTarget: { x: 422, y: 460 },
      description: "Custom L-shaped rechargeable lithium-ion battery with smart charging controller delivering up to 60 hours audio playback.",
      quickFacts: [
        "100% cobalt recovery pilot via Apple Daisy robot",
        "Heavy-metal free: 0 lead, 0 cadmium, 0 mercury",
        "Meets California Energy Commission strict charging efficiency"
      ],
      environmentalHighlights: [
        "Cobalt closed-loop recovery program via Apple Daisy",
        "Meets stringent California Energy Commission battery charging efficiency standards",
        "Heavy-metal free formulation: Zero lead, zero cadmium, zero mercury",
        "Engineered for over 500 complete charge cycles at 80% original capacity"
      ],
      manufacturingInsight: "100% of battery cell assembly suppliers commit to Zero Waste audits. Advanced lithium-cobalt oxide chemistry maximizes energy density per gram.",
      circularFeature: "Daisy robot freezes the battery adhesive at -80°C to pop the cell out without puncturing, recovering 100% of cobalt."
    },

    glass: {
      id: "glass",
      name: "Enclosure Glass",
      category: "Exterior Surfaces",
      weight: 36,
      weightFormatted: "36g",
      weightPercentage: 20.3,
      materialColor: "#899a38",
      carbonFootprint: 6.3, // kg CO2e
      carbonPercentage: 9.0,
      emissionsBreakdown: [
        { label: "Fusion Draw & Ion Exchange", percentage: 80, color: "#899a38" },
        { label: "Use-phase Protection", percentage: 12, color: "#adc666" },
        { label: "Protective Packaging", percentage: 5, color: "#d8bd48" },
        { label: "Cullet Remelt Recovery", percentage: 3, color: "#6eb172" }
      ],
      pin: { x: 433, y: 360, label: "Glass Back (36g)" },
      leaderTarget: { x: 433, y: 360 },
      description: "Durable glass front and back panels chemically engineered via dual-ion exchange to resist scratches and drops while enabling Qi wireless charging.",
      quickFacts: [
        "Dual-ion exchange molecular chemical strengthening",
        "100% arsenic-free & RF transparent for wireless charging",
        "Recovered cullet remelted for secondary industrial insulation"
      ],
      environmentalHighlights: [
        "Arsenic-free glass composition throughout",
        "Dual-ion exchange molecular strengthening doubles fracture toughness",
        "Permeable RF transparency eliminates need for heavy external antenna bands",
        "Formulated without brominated flame retardants (BFR-free)"
      ],
      manufacturingInsight: "Formed in high-temperature precision furnaces utilizing electric heating elements powered by clean grid contracts.",
      circularFeature: "Recovered glass cullet is redirected to fiberglass insulation and industrial ceramic applications."
    },

    circuit_boards: {
      id: "circuit_boards",
      name: "Circuit Boards & Chips",
      category: "Semiconductors & Optics",
      weight: 18,
      weightFormatted: "18g",
      weightPercentage: 10.2,
      materialColor: "#b8cc3b",
      carbonFootprint: 22.4, // kg CO2e
      carbonPercentage: 32.0,
      emissionsBreakdown: [
        { label: "7nm Wafer Fab & Logic PCB", percentage: 86, color: "#b8cc3b" },
        { label: "Computation Power Draw", percentage: 10, color: "#adc666" },
        { label: "High-security Express Freight", percentage: 3, color: "#d8bd48" },
        { label: "Precious Metals Refining", percentage: 1, color: "#6eb172" }
      ],
      pin: { x: 400, y: 310, label: "Logic & Cameras (18g)" },
      leaderTarget: { x: 400, y: 310 },
      description: "Substrate-like stacked PCB (SLP) hosting the 7nm A12 Bionic with Neural Engine, TrueDepth camera module, and dual 12MP rear sensors.",
      quickFacts: [
        "100% recycled tin in solder of the main logic board",
        "7nm A12 Bionic executes 5T ops/sec with 50% less power",
        "Gold and palladium refined through certified closed-loop smelters"
      ],
      environmentalHighlights: [
        "100% recycled tin in the solder of the main logic board",
        "Highest carbon efficiency: 7nm architecture does 5 trillion ops/sec with 50% lower power",
        "Lead-free circuit interconnects and halogen-free board laminate",
        "Gold and palladium recovered through Apple's certified smelting partners"
      ],
      manufacturingInsight: "All main logic board assembly sites are audited to divert 100% of solid waste from municipal landfills.",
      circularFeature: "Specialized hydraulic shear in Daisy robot snaps the stacked PCB intact for specialized hydrometallurgical gold recovery."
    },

    plastics: {
      id: "plastics",
      name: "Engineered Plastics",
      category: "Acoustics & Insulation",
      weight: 8,
      weightFormatted: "8g",
      weightPercentage: 4.5,
      materialColor: "#bfa362",
      carbonFootprint: 2.8, // kg CO2e
      carbonPercentage: 4.0,
      emissionsBreakdown: [
        { label: "Polymer Compounding & Molding", percentage: 72, color: "#bfa362" },
        { label: "Operational Integrity", percentage: 18, color: "#adc666" },
        { label: "Transport Packing", percentage: 6, color: "#d8bd48" },
        { label: "Thermal Recycling", percentage: 4, color: "#6eb172" }
      ],
      pin: { x: 420, y: 540, label: "Plastics & Speakers (8g)" },
      leaderTarget: { x: 420, y: 540 },
      description: "Engineered biocompatible polymers used in speaker acoustic chambers, microphone damping cushions, and RF antenna separator gaskets.",
      quickFacts: [
        "100% PVC-free & BFR-free polymer construction",
        "Bio-based and post-consumer recycled plastic in speakers",
        "Low VOC outgassing certified for environmental safety"
      ],
      environmentalHighlights: [
        "PVC-free (polyvinyl chloride free) internal and external construction",
        "Post-consumer recycled bio-plastics formulated for acoustic stiffness",
        "Phthalate-free sealing gaskets ensuring IP68 water resistance",
        "Low VOC outgassing certified for environmental health"
      ],
      manufacturingInsight: "Precision micro-injection molding reduces sprue and runner scrap to less than 2% of raw resin input.",
      circularFeature: "Polymer brackets are color-coded to allow optical sorting during automated post-consumer recycling."
    },

    aluminum: {
      id: "aluminum",
      name: "Structural Aluminum",
      category: "Internal Shielding",
      weight: 1,
      weightFormatted: "1g",
      weightPercentage: 0.6,
      materialColor: "#c8483b",
      carbonFootprint: 0.7, // kg CO2e
      carbonPercentage: 1.0,
      emissionsBreakdown: [
        { label: "Low-carbon Hydro Smelting", percentage: 68, color: "#c8483b" },
        { label: "EMC Shielding Lifespan", percentage: 20, color: "#adc666" },
        { label: "Air/Road Shipping", percentage: 8, color: "#d8bd48" },
        { label: "Closed-loop Scrap Remelt", percentage: 4, color: "#6eb172" }
      ],
      pin: { x: 442, y: 395, label: "Aluminum (1g)" },
      leaderTarget: { x: 442, y: 395 },
      description: "Ultra-thin aerospace aluminum internal shielding bracket, heat spreader plate, and camera bezel ring.",
      quickFacts: [
        "100% recycled industrial scrap aluminum alloy",
        "Hydroelectric smelting with near-zero direct carbon emissions",
        "Eliminates heavy toxic shielding metals"
      ],
      environmentalHighlights: [
        "100% recycled industrial aluminum alloy",
        "Smelted using hydroelectric power with near-zero direct carbon emissions",
        "Acts as electromagnetic interference (EMI) shield with minimal mass",
        "Eliminates need for heavy toxic tin shields"
      ],
      manufacturingInsight: "Stamped from ultra-thin coil stock with 100% of stamping skeleton fed directly into closed-loop re-smelting.",
      circularFeature: "Easily separated via eddy current separators during recycling shredder phases."
    },

    other: {
      id: "other",
      name: "Other Materials & Magnets",
      category: "Magnets, Coils & Adhesives",
      weight: 14,
      weightFormatted: "14g",
      weightPercentage: 7.9,
      materialColor: "#6ec1b8",
      carbonFootprint: 2.8, // kg CO2e
      carbonPercentage: 4.0,
      emissionsBreakdown: [
        { label: "Rare Earth & Copper Processing", percentage: 70, color: "#6ec1b8" },
        { label: "Inductive Charging Lifespan", percentage: 20, color: "#adc666" },
        { label: "Logistics", percentage: 6, color: "#d8bd48" },
        { label: "Neodymium Extraction", percentage: 4, color: "#6eb172" }
      ],
      pin: { x: 425, y: 415, label: "Magnets & Coils (14g)" },
      leaderTarget: { x: 425, y: 415 },
      description: "High-purity copper wireless Qi charging coil, neodymium magnets in the Taptic Engine and speakers, screws, and structural adhesives.",
      quickFacts: [
        "100% recycled rare earth elements in Taptic Engine",
        "High-conductivity oxygen-free copper Qi inductive coil",
        "Debondable pull-tab adhesive strips allow easy repair"
      ],
      environmentalHighlights: [
        "100% recycled rare earth elements in Taptic Engine magnets",
        "High-conductivity oxygen-free copper reduces inductive charging heat waste",
        "Non-toxic acrylic pressure-sensitive adhesives engineered for clean debonding",
        "Stainless steel micro-fasteners replacing permanent welds for repairability"
      ],
      manufacturingInsight: "Adhesive strips feature pull tabs allowing battery and speaker replacement without damaging enclosure components.",
      circularFeature: "Apple Daisy robot uses automated screw extractors to collect micro-screws and rare earth magnets without shredder contamination."
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ENVIRONMENTAL_DATA;
}
