/**
 * Pedigree Chart Builder
 * Implementation of Standard Clinical Pedigree Nomenclature
 * Streamlined, zero-cognitive-overload clinical architecture.
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & CLINICAL DATA PRESETS
  // =========================================================================
  const SYMBOL_SIZE = 34;
  const HALF_SIZE = SYMBOL_SIZE / 2;
  const GEN_Y = { 1: 90, 2: 240, 3: 390, 4: 540 };

  const PRESETS = {
    'cf': {
      id: 'cf',
      title: 'Cystic Fibrosis (Autosomal Recessive)',
      type: 'recessive',
      typeName: 'Autosomal Recessive',
      gene: 'CFTR Gene (7q31.2)',
      desc: 'Inherited when both parents are unaffected heterozygous carriers (half-shaded). In this 3-generation family, David (II-2) and Sarah (II-3) are carriers; their daughter Emma (III-2) is the affected proband (magenta).',
      rules: [
        'Horizontal Inheritance: Healthy carrier parents have affected children; typically skips generations.',
        'Equal Sex Ratio: Males and females are affected with equal frequency.',
        '25% Recurrence Risk: Each pregnancy between two carriers has a 1-in-4 chance of an affected child.'
      ],
      members: [
        // Gen I
        { id: 'm1', name: 'Grandfather A', sex: 'male', status: 'carrier', deceased: false, proband: false, gen: 1, x: 260, y: 90, genotype: 'wt/ΔF508' },
        { id: 'm2', name: 'Grandmother A', sex: 'female', status: 'unaffected', deceased: false, proband: false, gen: 1, x: 380, y: 90, genotype: 'wt/wt' },
        { id: 'm3', name: 'Grandfather B', sex: 'male', status: 'unaffected', deceased: false, proband: false, gen: 1, x: 560, y: 90, genotype: 'wt/wt' },
        { id: 'm4', name: 'Grandmother B', sex: 'female', status: 'carrier', deceased: false, proband: false, gen: 1, x: 680, y: 90, genotype: 'wt/ΔF508' },
        // Gen II
        { id: 'm5', name: 'Uncle Mark', sex: 'male', status: 'unaffected', deceased: false, proband: false, gen: 2, x: 260, y: 240, genotype: 'wt/wt' },
        { id: 'm6', name: 'David (Father)', sex: 'male', status: 'carrier', deceased: false, proband: false, gen: 2, x: 380, y: 240, genotype: 'wt/ΔF508' },
        { id: 'm7', name: 'Sarah (Mother)', sex: 'female', status: 'carrier', deceased: false, proband: false, gen: 2, x: 560, y: 240, genotype: 'wt/ΔF508' },
        { id: 'm8', name: 'Aunt Lisa', sex: 'female', status: 'unaffected', deceased: false, proband: false, gen: 2, x: 680, y: 240, genotype: 'wt/wt' },
        // Gen III
        { id: 'm9', name: 'Lucas', sex: 'male', status: 'unaffected', deceased: false, proband: false, gen: 3, x: 370, y: 390, genotype: 'wt/wt' },
        { id: 'm10', name: 'Emma (Proband)', sex: 'female', status: 'affected', deceased: false, proband: true, gen: 3, x: 470, y: 390, genotype: 'ΔF508/ΔF508' },
        { id: 'm11', name: 'Noah', sex: 'male', status: 'carrier', deceased: false, proband: false, gen: 3, x: 570, y: 390, genotype: 'wt/ΔF508' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m5', 'm6'] },
        { id: 'r2', type: 'mating', p1: 'm3', p2: 'm4', children: ['m7', 'm8'] },
        { id: 'r3', type: 'mating', p1: 'm6', p2: 'm7', children: ['m9', 'm10', 'm11'] }
      ]
    },

    'hd': {
      id: 'hd',
      title: "Huntington's Chorea (Autosomal Dominant)",
      type: 'dominant',
      typeName: 'Autosomal Dominant',
      gene: 'HTT Gene (4p16.3)',
      desc: "Demonstrates direct vertical transmission across every generation: deceased grandfather Arthur (I-1, slashed magenta square, 45 CAG) → mother Claire (II-2, 44 CAG) → son Julian (III-1, 43 CAG). Consultand Marcus (III-2, ↗ P) is at 50% risk.",
      rules: [
        'Vertical Transmission: Appears in every generation (I → II → III); does not skip generations.',
        'No Unaffected Carriers: Anyone inheriting an expanded allele (≥40 CAG) develops the disorder.',
        '50% Recurrence Risk: Each child of an affected parent has a 50% chance of inheriting the mutant allele.'
      ],
      members: [
        // Gen I
        { id: 'm1', name: 'Arthur (Grandfather)', sex: 'male', status: 'affected', deceased: true, proband: false, gen: 1, x: 390, y: 90, genotype: '45 CAG (d. 57y)' },
        { id: 'm2', name: 'Eleanor', sex: 'female', status: 'unaffected', deceased: false, proband: false, gen: 1, x: 530, y: 90, genotype: '18/19 CAG' },
        // Gen II
        { id: 'm3', name: 'Robert (Father)', sex: 'male', status: 'unaffected', deceased: false, proband: false, gen: 2, x: 270, y: 240, genotype: '17/18 CAG' },
        { id: 'm4', name: 'Claire (Mother)', sex: 'female', status: 'affected', deceased: false, proband: false, gen: 2, x: 410, y: 240, genotype: '18/44 CAG' },
        { id: 'm5', name: 'Uncle Thomas', sex: 'male', status: 'unaffected', deceased: false, proband: false, gen: 2, x: 570, y: 240, genotype: '18/20 CAG' },
        // Gen III
        { id: 'm6', name: 'Julian', sex: 'male', status: 'affected', deceased: false, proband: false, gen: 3, x: 240, y: 390, genotype: '43 CAG (Affected)' },
        { id: 'm7', name: 'Marcus (Proband)', sex: 'male', status: 'unaffected', deceased: false, proband: true, gen: 3, x: 370, y: 390, genotype: 'At-risk (50%)' },
        { id: 'm8', name: 'Sophia', sex: 'female', status: 'unaffected', deceased: false, proband: false, gen: 3, x: 500, y: 390, genotype: '18/18 CAG' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m4', 'm5'] },
        { id: 'r2', type: 'mating', p1: 'm3', p2: 'm4', children: ['m6', 'm7', 'm8'] }
      ]
    },

    'blank': {
      id: 'blank',
      title: 'Blank Pedigree Canvas',
      type: 'blank',
      typeName: 'Custom Family',
      gene: 'Freeform Builder',
      desc: 'Start constructing your own clinical pedigree chart. Use the standard symbols on the left palette to add individuals, partners, and offspring.',
      rules: [
        'Standard Symbols: Squares for males, Circles for females, Diamonds for unspecified sex.',
        'Clinical Shading: Magenta for affected, half-shaded for carriers, diagonal slash for deceased.',
        'Mating & Lines: Single horizontal line for mating; double line for consanguineous marriages.'
      ],
      members: [
        { id: 'm1', name: 'Father', sex: 'male', status: 'carrier', deceased: false, proband: false, gen: 1, x: 380, y: 90, genotype: 'Carrier' },
        { id: 'm2', name: 'Mother', sex: 'female', status: 'carrier', deceased: false, proband: false, gen: 1, x: 520, y: 90, genotype: 'Carrier' },
        { id: 'm3', name: 'Proband', sex: 'female', status: 'affected', deceased: false, proband: true, gen: 2, x: 450, y: 240, genotype: 'Affected' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m3'] }
      ]
    }
  };

  // Application State
  const state = {
    activeCase: 'cf', // 'cf', 'hd', 'blank'
    members: [],
    matings: [],
    selectedId: null,
    connectMode: null, // { type: 'mating'|'consanguinity', sourceId: null }
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    dragStart: { x: 0, y: 0 },
    draggingId: null,
    dragOffset: { x: 0, y: 0 }
  };

  // DOM Elements
  const svg = document.getElementById('pedigree-svg');
  const canvasRoot = document.getElementById('canvas-root');
  const layerConnections = document.getElementById('layer-connections');
  const layerNodes = document.getElementById('layer-nodes');
  const layerInteraction = document.getElementById('layer-interaction');
  const quickToolbar = document.getElementById('quick-toolbar');
  const zoomText = document.getElementById('zoom-text');

  // Side Panel Elements
  const panelCaseInfo = document.getElementById('panel-case-info');
  const panelEditPerson = document.getElementById('panel-edit-person');
  const casePillType = document.getElementById('case-pill-type');
  const casePillGene = document.getElementById('case-pill-gene');
  const caseDisplayTitle = document.getElementById('case-display-title');
  const caseDisplayDesc = document.getElementById('case-display-desc');
  const caseRulesList = document.getElementById('case-rules-list');
  const caseInteractiveWidget = document.getElementById('case-interactive-widget');

  // Edit Panel Inputs
  const editSymbolPreview = document.getElementById('edit-symbol-preview');
  const editGenId = document.getElementById('edit-gen-id');
  const editTitle = document.getElementById('edit-title');
  const inputEditName = document.getElementById('input-edit-name');
  const inputEditGenotype = document.getElementById('input-edit-genotype');
  const checkEditDeceased = document.getElementById('check-edit-deceased');
  const checkEditProband = document.getElementById('check-edit-proband');

  // Sex Buttons
  const btnSetMale = document.getElementById('btn-set-male');
  const btnSetFemale = document.getElementById('btn-set-female');
  const btnSetUnspecified = document.getElementById('btn-set-unspecified');

  // Status Buttons
  const btnSetUnaffected = document.getElementById('btn-set-unaffected');
  const btnSetCarrier = document.getElementById('btn-set-carrier');
  const btnSetAffected = document.getElementById('btn-set-affected');

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function init() {
    setupCaseSwitchers();
    setupCanvasEvents();
    setupPaletteEvents();
    setupQuickToolbar();
    setupPersonEditor();
    setupHeaderControls();
    setupNomenclatureModal();

    // Load initial Cystic Fibrosis case
    loadCase('cf');
  }

  // =========================================================================
  // CASE SWITCHER LOGIC
  // =========================================================================
  function setupCaseSwitchers() {
    const btnCf = document.getElementById('btn-case-cf');
    const btnHd = document.getElementById('btn-case-hd');
    const btnBlank = document.getElementById('btn-case-blank');

    btnCf.addEventListener('click', () => loadCase('cf'));
    btnHd.addEventListener('click', () => loadCase('hd'));
    btnBlank.addEventListener('click', () => loadCase('blank'));
  }

  function loadCase(caseKey) {
    state.activeCase = caseKey;
    const preset = PRESETS[caseKey] || PRESETS['cf'];

    // Update active tab buttons
    document.querySelectorAll('.case-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-case-${caseKey}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Deep clone preset members and matings into active state
    state.members = JSON.parse(JSON.stringify(preset.members));
    state.matings = JSON.parse(JSON.stringify(preset.matings));
    state.selectedId = null;

    // Reset pan/zoom
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    updateTransform();

    // Render Side Panel Case Info
    renderCaseInfo(preset);

    // Close person editor, show case info
    showCaseInfoPanel();

    // Recompute IDs and render
    computeGenerationsAndIndices();
    renderChart();
  }

  function renderCaseInfo(preset) {
    casePillType.textContent = preset.typeName;
    casePillType.className = `pill-badge ${preset.type}`;
    casePillGene.textContent = preset.gene;
    caseDisplayTitle.textContent = preset.title;
    caseDisplayDesc.textContent = preset.desc;

    // Populate rules
    caseRulesList.innerHTML = '';
    preset.rules.forEach(rule => {
      const li = document.createElement('li');
      const parts = rule.split(':');
      if (parts.length > 1) {
        li.innerHTML = `<strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}`;
      } else {
        li.textContent = rule;
      }
      caseRulesList.appendChild(li);
    });

    // Populate interactive widget: Punnett for CF, CAG scale for HD
    caseInteractiveWidget.innerHTML = '';
    if (preset.id === 'cf') {
      renderCFIWidget();
    } else if (preset.id === 'hd') {
      renderHDIWidget();
    } else {
      renderBlankIWidget();
    }
  }

  function renderCFIWidget() {
    caseInteractiveWidget.innerHTML = `
      <div class="widget-title">Punnett Square: Carrier Cross (wt/ΔF508 × wt/ΔF508)</div>
      <table class="mini-punnett" aria-label="Punnett Square for Cystic Fibrosis">
        <thead>
          <tr>
            <th></th>
            <th>Mother: wt</th>
            <th>Mother: ΔF508</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Father: wt</th>
            <td><strong>wt / wt</strong><br><small>25% Normal</small></td>
            <td class="carrier"><strong>wt / ΔF508</strong><br><small>25% Carrier</small></td>
          </tr>
          <tr>
            <th>Father: ΔF508</th>
            <td class="carrier"><strong>wt / ΔF508</strong><br><small>25% Carrier</small></td>
            <td class="affected"><strong>ΔF508 / ΔF508</strong><br><small>25% Affected</small></td>
          </tr>
        </tbody>
      </table>
      <div class="punnett-stat">
        Recurrence Outcome: <strong>25% Affected</strong> (Emma III-2), <strong>50% Carrier</strong> (Noah III-3), <strong>25% Normal</strong> (Lucas III-1).
      </div>
    `;
  }

  function renderHDIWidget() {
    caseInteractiveWidget.innerHTML = `
      <div class="widget-title">CAG Trinucleotide Repeat Expansion Scale</div>
      <div class="cag-scale">
        <div class="cag-bar">
          <div class="cag-seg cag-normal" title="10-26 repeats: Normal">10–26 Normal</div>
          <div class="cag-seg cag-reduced" title="36-39 repeats: Reduced Penetrance">36–39</div>
          <div class="cag-seg cag-affected" title="≥40 repeats: Full Penetrance Chorea">≥40 Chorea</div>
        </div>
        <div class="cag-labels">
          <span>Normal Alleles (&lt;27)</span>
          <span>Full Penetrance (≥40)</span>
        </div>
      </div>
      <div class="punnett-stat" style="margin-top: 8px;">
        Grandfather Arthur: <strong>45 CAG</strong> | Mother Claire: <strong>44 CAG</strong> | Brother Julian: <strong>43 CAG</strong>. Marcus (Proband III-2) presents at <strong>50% prior risk</strong>.
      </div>
    `;
  }

  function renderBlankIWidget() {
    caseInteractiveWidget.innerHTML = `
      <div class="widget-title">Pedigree Building Quick Tips</div>
      <div class="punnett-stat">
        • Click any symbol from the left palette to add an individual.<br>
        • Select an individual on canvas to quickly add a partner or child.<br>
        • Use the Single Line for reproductive unions, and Double Line for consanguinity.
      </div>
    `;
  }

  // =========================================================================
  // GENERATION & INDEX COMPUTATION
  // =========================================================================
  function computeGenerationsAndIndices() {
    // Assign generation based on Y position if not assigned
    state.members.forEach(m => {
      if (!m.gen) {
        if (m.y < 160) m.gen = 1;
        else if (m.y < 310) m.gen = 2;
        else if (m.y < 460) m.gen = 3;
        else m.gen = 4;
      }
    });

    // Group by generation and sort by X position
    const byGen = {};
    state.members.forEach(m => {
      byGen[m.gen] = byGen[m.gen] || [];
      byGen[m.gen].push(m);
    });

    Object.keys(byGen).forEach(genNum => {
      byGen[genNum].sort((a, b) => a.x - b.x);
      byGen[genNum].forEach((m, idx) => {
        m.indexInGen = idx + 1;
        m.clinicalId = `${toRoman(m.gen)}-${m.indexInGen}`;
      });
    });
  }

  function toRoman(num) {
    const romans = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return romans[num] || String(num);
  }

  // =========================================================================
  // SVG RENDERING ENGINE
  // =========================================================================
  function renderChart() {
    renderConnections();
    renderNodes();
    updateQuickToolbarPosition();
  }

  function renderConnections() {
    layerConnections.innerHTML = '';

    state.matings.forEach(mating => {
      const p1 = state.members.find(m => m.id === mating.p1);
      const p2 = state.members.find(m => m.id === mating.p2);
      if (!p1 || !p2) return;

      const isConsanguineous = mating.type === 'consanguinity';
      const leftP = p1.x <= p2.x ? p1 : p2;
      const rightP = p1.x <= p2.x ? p2 : p1;

      const y = (leftP.y + rightP.y) / 2;
      const x1 = leftP.x + HALF_SIZE;
      const x2 = rightP.x - HALF_SIZE;

      if (x2 <= x1) return;

      const gRel = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      if (isConsanguineous) {
        // Double horizontal line for Consanguinity
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', x1); line1.setAttribute('y1', y - 3);
        line1.setAttribute('x2', x2); line1.setAttribute('y2', y - 3);
        line1.setAttribute('class', 'pedigree-line');
        gRel.appendChild(line1);

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', x1); line2.setAttribute('y1', y + 3);
        line2.setAttribute('x2', x2); line2.setAttribute('y2', y + 3);
        line2.setAttribute('class', 'pedigree-line');
        gRel.appendChild(line2);
      } else {
        // Single horizontal line for Mating
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y);
        line.setAttribute('x2', x2); line.setAttribute('y2', y);
        line.setAttribute('class', 'pedigree-line');
        gRel.appendChild(line);
      }

      // Descendant drop line and horizontal branch bar
      const children = (mating.children || []).map(cid => state.members.find(m => m.id === cid)).filter(Boolean);
      if (children.length > 0) {
        const midX = (leftP.x + rightP.x) / 2;
        const minChildTopY = Math.min(...children.map(c => c.y - HALF_SIZE));
        const dropY = Math.min(minChildTopY - 20, Math.max(y + 65, Math.round((y + minChildTopY) / 2)));

        // Vertical drop from mating line
        const dropLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        dropLine.setAttribute('x1', midX); dropLine.setAttribute('y1', y);
        dropLine.setAttribute('x2', midX); dropLine.setAttribute('y2', dropY);
        dropLine.setAttribute('class', 'pedigree-line');
        gRel.appendChild(dropLine);

        // Horizontal bar covering all children
        const minX = Math.min(...children.map(c => c.x));
        const maxX = Math.max(...children.map(c => c.x));
        const barLeft = Math.min(midX, minX);
        const barRight = Math.max(midX, maxX);

        if (children.length > 1 || minX !== midX) {
          const sibBar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          sibBar.setAttribute('x1', barLeft); sibBar.setAttribute('y1', dropY);
          sibBar.setAttribute('x2', barRight); sibBar.setAttribute('y2', dropY);
          sibBar.setAttribute('class', 'pedigree-line');
          gRel.appendChild(sibBar);
        }

        // Drop line down to each child
        children.forEach(child => {
          const cLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          cLine.setAttribute('x1', child.x); cLine.setAttribute('y1', dropY);
          cLine.setAttribute('x2', child.x); cLine.setAttribute('y2', child.y - HALF_SIZE);
          cLine.setAttribute('class', 'pedigree-line');
          gRel.appendChild(cLine);
        });
      }

      layerConnections.appendChild(gRel);
    });
  }

  function renderNodes() {
    layerNodes.innerHTML = '';

    state.members.forEach(member => {
      const g = createMemberSvg(member);
      layerNodes.appendChild(g);
    });
  }

  function createMemberSvg(member) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `pedigree-node ${state.selectedId === member.id ? 'selected' : ''}`);
    g.setAttribute('transform', `translate(${member.x}, ${member.y})`);
    g.setAttribute('data-id', member.id);

    const isAffected = member.status === 'affected';
    const isCarrier = member.status === 'carrier';

    // 1. Base Shape (Square for male, Circle for female, Diamond for unspecified)
    if (member.sex === 'male') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -HALF_SIZE);
      rect.setAttribute('y', -HALF_SIZE);
      rect.setAttribute('width', SYMBOL_SIZE);
      rect.setAttribute('height', SYMBOL_SIZE);
      rect.setAttribute('class', `sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}`);
      g.appendChild(rect);

      // Carrier: Half-shaded (left half filled with magenta)
      if (isCarrier) {
        const half = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        half.setAttribute('d', `M ${-HALF_SIZE} ${-HALF_SIZE} L 0 ${-HALF_SIZE} L 0 ${HALF_SIZE} L ${-HALF_SIZE} ${HALF_SIZE} Z`);
        half.setAttribute('class', 'sym-half-fill');
        g.appendChild(half);
      }
    } else if (member.sex === 'female') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('r', HALF_SIZE);
      circle.setAttribute('class', `sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}`);
      g.appendChild(circle);

      // Carrier: Half-shaded (left half filled with magenta)
      if (isCarrier) {
        const half = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        half.setAttribute('d', `M 0 ${-HALF_SIZE} A ${HALF_SIZE} ${HALF_SIZE} 0 0 0 0 ${HALF_SIZE} Z`);
        half.setAttribute('class', 'sym-half-fill');
        g.appendChild(half);
      }
    } else {
      // Unspecified Sex: Diamond
      const pts = `0,${-HALF_SIZE} ${HALF_SIZE},0 0,${HALF_SIZE} ${-HALF_SIZE},0`;
      const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      diamond.setAttribute('points', pts);
      diamond.setAttribute('class', `sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}`);
      g.appendChild(diamond);

      if (isCarrier) {
        const half = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        half.setAttribute('points', `0,${-HALF_SIZE} 0,${HALF_SIZE} ${-HALF_SIZE},0`);
        half.setAttribute('class', 'sym-half-fill');
        g.appendChild(half);
      }
    }

    // 2. Deceased Diagonal Slash
    if (member.deceased) {
      const slash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      slash.setAttribute('x1', -HALF_SIZE - 5);
      slash.setAttribute('y1', HALF_SIZE + 5);
      slash.setAttribute('x2', HALF_SIZE + 5);
      slash.setAttribute('y2', -HALF_SIZE - 5);
      slash.setAttribute('class', 'sym-slash-line');
      g.appendChild(slash);
    }

    // 3. Proband / Consultand Arrow (↗ P)
    if (member.proband) {
      const gArrow = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const startX = -HALF_SIZE - 18;
      const startY = HALF_SIZE + 18;
      const endX = -HALF_SIZE - 2;
      const endY = HALF_SIZE + 2;

      const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      arrowLine.setAttribute('x1', startX); arrowLine.setAttribute('y1', startY);
      arrowLine.setAttribute('x2', endX); arrowLine.setAttribute('y2', endY);
      arrowLine.setAttribute('class', 'sym-arrow-line');

      const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      arrowHead.setAttribute('points', `${endX - 7},${endY} ${endX},${endY} ${endX},${endY + 7}`);
      arrowHead.setAttribute('class', 'sym-arrow-line');

      const textP = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textP.setAttribute('x', startX - 8);
      textP.setAttribute('y', startY + 4);
      textP.setAttribute('class', 'sym-arrow-text');
      textP.textContent = 'P';

      gArrow.appendChild(arrowLine);
      gArrow.appendChild(arrowHead);
      gArrow.appendChild(textP);
      g.appendChild(gArrow);
    }

    // 4. Clinical Labels (Generation ID, Name, Genotype)
    const textId = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textId.setAttribute('x', 0);
    textId.setAttribute('y', HALF_SIZE + 14);
    textId.setAttribute('class', 'node-text-id');
    textId.textContent = member.clinicalId || `${toRoman(member.gen)}-${member.indexInGen || '?'}`;
    g.appendChild(textId);

    if (member.name) {
      const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textName.setAttribute('x', 0);
      textName.setAttribute('y', HALF_SIZE + 26);
      textName.setAttribute('class', 'node-text-name');
      textName.textContent = member.name.length > 15 ? member.name.substring(0, 14) + '…' : member.name;
      g.appendChild(textName);
    }

    if (member.genotype) {
      const textGeno = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textGeno.setAttribute('x', 0);
      textGeno.setAttribute('y', HALF_SIZE + (member.name ? 38 : 26));
      textGeno.setAttribute('class', 'node-text-tag');
      textGeno.textContent = member.genotype;
      g.appendChild(textGeno);
    }

    // Event Handlers for Node
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectMember(member.id);
    });

    g.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      startDraggingMember(member.id, e);
    });

    return g;
  }

  // =========================================================================
  // SELECTION & PERSON EDITOR LOGIC
  // =========================================================================
  function selectMember(id) {
    state.selectedId = id;
    const member = state.members.find(m => m.id === id);

    if (!member) {
      showCaseInfoPanel();
      quickToolbar.classList.add('hidden');
      renderChart();
      return;
    }

    showPersonEditPanel(member);
    renderChart();
  }

  function showCaseInfoPanel() {
    panelEditPerson.classList.add('hidden');
    panelCaseInfo.classList.remove('hidden');
    quickToolbar.classList.add('hidden');
  }

  function showPersonEditPanel(member) {
    panelCaseInfo.classList.add('hidden');
    panelEditPerson.classList.remove('hidden');

    // Populate Editor fields
    editGenId.textContent = member.clinicalId || `${toRoman(member.gen)}-${member.indexInGen || '?'}`;
    editTitle.textContent = member.name || 'Individual';
    inputEditName.value = member.name || '';
    inputEditGenotype.value = member.genotype || '';
    checkEditDeceased.checked = !!member.deceased;
    checkEditProband.checked = !!member.proband;

    // Update Sex button highlights
    [btnSetMale, btnSetFemale, btnSetUnspecified].forEach(btn => btn.classList.remove('active'));
    if (member.sex === 'male') btnSetMale.classList.add('active');
    else if (member.sex === 'female') btnSetFemale.classList.add('active');
    else btnSetUnspecified.classList.add('active');

    // Update Status button highlights
    [btnSetUnaffected, btnSetCarrier, btnSetAffected].forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('active-magenta');
    });
    if (member.status === 'affected') btnSetAffected.classList.add('active-magenta');
    else if (member.status === 'carrier') btnSetCarrier.classList.add('active');
    else btnSetUnaffected.classList.add('active');

    // Render Preview Symbol
    renderEditSymbolPreview(member);

    // Position Quick Toolbar above node
    updateQuickToolbarPosition();
  }

  function renderEditSymbolPreview(member) {
    const isAffected = member.status === 'affected';
    const isCarrier = member.status === 'carrier';
    let shapeSvg = '';

    if (member.sex === 'male') {
      shapeSvg = `
        <rect x="6" y="6" width="26" height="26" class="sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}"></rect>
        ${isCarrier ? '<path d="M 6 6 L 19 6 L 19 32 L 6 32 Z" class="sym-half-fill"></path>' : ''}
      `;
    } else if (member.sex === 'female') {
      shapeSvg = `
        <circle cx="19" cy="19" r="13" class="sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}"></circle>
        ${isCarrier ? '<path d="M 19 6 A 13 13 0 0 0 19 32 Z" class="sym-half-fill"></path>' : ''}
      `;
    } else {
      shapeSvg = `
        <polygon points="19,5 33,19 19,33 5,19" class="sym-shape ${isAffected ? 'affected-magenta' : 'unshaded'}"></polygon>
        ${isCarrier ? '<polygon points="19,5 19,33 5,19" class="sym-half-fill"></polygon>' : ''}
      `;
    }

    if (member.deceased) {
      shapeSvg += '<line x1="3" y1="35" x2="35" y2="3" class="sym-slash-line"></line>';
    }

    editSymbolPreview.innerHTML = `
      <svg viewBox="0 0 38 38" style="width: 100%; height: 100%;">
        ${shapeSvg}
      </svg>
    `;
  }

  function setupPersonEditor() {
    // Sex Buttons
    btnSetMale.addEventListener('click', () => updateSelected({ sex: 'male' }));
    btnSetFemale.addEventListener('click', () => updateSelected({ sex: 'female' }));
    btnSetUnspecified.addEventListener('click', () => updateSelected({ sex: 'unspecified' }));

    // Status Buttons
    btnSetUnaffected.addEventListener('click', () => updateSelected({ status: 'unaffected' }));
    btnSetCarrier.addEventListener('click', () => updateSelected({ status: 'carrier' }));
    btnSetAffected.addEventListener('click', () => updateSelected({ status: 'affected' }));

    // Toggles
    checkEditDeceased.addEventListener('change', (e) => updateSelected({ deceased: e.target.checked }));
    checkEditProband.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.members.forEach(m => m.proband = false);
      }
      updateSelected({ proband: e.target.checked });
    });

    // Inputs
    inputEditName.addEventListener('input', (e) => {
      const m = getSelected();
      if (!m) return;
      m.name = e.target.value;
      editTitle.textContent = m.name || 'Individual';
      renderChart();
    });

    inputEditGenotype.addEventListener('input', (e) => {
      const m = getSelected();
      if (!m) return;
      m.genotype = e.target.value;
      renderChart();
    });

    // Family Buttons in Editor
    document.getElementById('btn-family-partner').addEventListener('click', addPartnerToSelected);
    document.getElementById('btn-family-child').addEventListener('click', addChildToSelected);
    document.getElementById('btn-family-parents').addEventListener('click', addParentsToSelected);

    // Delete & Done
    document.getElementById('btn-delete-person').addEventListener('click', deleteSelected);
    document.getElementById('btn-done-edit').addEventListener('click', () => {
      state.selectedId = null;
      showCaseInfoPanel();
      renderChart();
    });
    document.getElementById('btn-close-edit').addEventListener('click', () => {
      state.selectedId = null;
      showCaseInfoPanel();
      renderChart();
    });
  }

  function getSelected() {
    return state.members.find(m => m.id === state.selectedId);
  }

  function updateSelected(updates) {
    const m = getSelected();
    if (!m) return;

    Object.assign(m, updates);
    showPersonEditPanel(m);
    renderChart();
  }

  // =========================================================================
  // QUICK FLOATING TOOLBAR LOGIC
  // =========================================================================
  function setupQuickToolbar() {
    document.getElementById('qb-partner').addEventListener('click', addPartnerToSelected);
    document.getElementById('qb-child').addEventListener('click', addChildToSelected);
    document.getElementById('qb-parents').addEventListener('click', addParentsToSelected);

    document.getElementById('qb-affected').addEventListener('click', () => {
      const m = getSelected();
      if (!m) return;
      updateSelected({ status: m.status === 'affected' ? 'unaffected' : 'affected' });
    });

    document.getElementById('qb-carrier').addEventListener('click', () => {
      const m = getSelected();
      if (!m) return;
      updateSelected({ status: m.status === 'carrier' ? 'unaffected' : 'carrier' });
    });

    document.getElementById('qb-proband').addEventListener('click', () => {
      const m = getSelected();
      if (!m) return;
      const next = !m.proband;
      if (next) state.members.forEach(item => item.proband = false);
      updateSelected({ proband: next });
    });

    document.getElementById('qb-delete').addEventListener('click', deleteSelected);
  }

  function updateQuickToolbarPosition() {
    const m = getSelected();
    if (!m) {
      quickToolbar.classList.add('hidden');
      return;
    }

    const screenX = m.x * state.zoom + state.panX;
    const screenY = (m.y - HALF_SIZE) * state.zoom + state.panY;

    quickToolbar.style.left = `${screenX}px`;
    quickToolbar.style.top = `${screenY}px`;
    quickToolbar.classList.remove('hidden');
  }

  // =========================================================================
  // FAMILY GRAPH MANIPULATION (PARTNER, CHILD, PARENTS, DELETE)
  // =========================================================================
  function addPartnerToSelected() {
    const m = getSelected();
    if (!m) return;

    const partnerSex = m.sex === 'male' ? 'female' : 'male';
    const partnerX = m.x + 120;
    const partnerId = 'm_' + Date.now();

    const partner = {
      id: partnerId,
      name: 'Partner',
      sex: partnerSex,
      status: 'unaffected',
      deceased: false,
      proband: false,
      gen: m.gen,
      x: partnerX,
      y: m.y,
      genotype: ''
    };

    state.members.push(partner);

    const relId = 'r_' + Date.now();
    state.matings.push({
      id: relId,
      type: 'mating',
      p1: m.id,
      p2: partner.id,
      children: []
    });

    computeGenerationsAndIndices();
    selectMember(partner.id);
  }

  function addChildToSelected() {
    const m = getSelected();
    if (!m) return;

    // Find mating involving m
    let mating = state.matings.find(rel => rel.p1 === m.id || rel.p2 === m.id);
    if (!mating) {
      // Auto-create partner first if none exists
      addPartnerToSelected();
      mating = state.matings.find(rel => rel.p1 === m.id || rel.p2 === m.id);
    }
    if (!mating) return;

    const childId = 'm_' + Date.now();
    const existingChildren = (mating.children || []).map(cid => state.members.find(item => item.id === cid)).filter(Boolean);
    const childGen = m.gen + 1;
    const childY = GEN_Y[childGen] || (m.y + 150);

    let childX = m.x;
    if (existingChildren.length > 0) {
      const lastX = Math.max(...existingChildren.map(c => c.x));
      childX = lastX + 110;
    }

    const child = {
      id: childId,
      name: 'Child',
      sex: Math.random() > 0.5 ? 'male' : 'female',
      status: 'unaffected',
      deceased: false,
      proband: false,
      gen: childGen,
      x: childX,
      y: childY,
      genotype: ''
    };

    state.members.push(child);
    mating.children = mating.children || [];
    mating.children.push(child.id);

    computeGenerationsAndIndices();
    selectMember(child.id);
  }

  function addParentsToSelected() {
    const m = getSelected();
    if (!m) return;

    // Check if already has parents
    const existingMating = state.matings.find(rel => (rel.children || []).includes(m.id));
    if (existingMating) return;

    const parentGen = Math.max(1, m.gen - 1);
    const parentY = GEN_Y[parentGen] || (m.y - 150);

    const fId = 'm_' + Date.now() + '_1';
    const mId = 'm_' + Date.now() + '_2';

    const father = {
      id: fId,
      name: 'Father',
      sex: 'male',
      status: 'unaffected',
      deceased: false,
      proband: false,
      gen: parentGen,
      x: m.x - 60,
      y: parentY,
      genotype: ''
    };

    const mother = {
      id: mId,
      name: 'Mother',
      sex: 'female',
      status: 'unaffected',
      deceased: false,
      proband: false,
      gen: parentGen,
      x: m.x + 60,
      y: parentY,
      genotype: ''
    };

    state.members.push(father, mother);

    const relId = 'r_' + Date.now();
    state.matings.push({
      id: relId,
      type: 'mating',
      p1: father.id,
      p2: mother.id,
      children: [m.id]
    });

    computeGenerationsAndIndices();
    selectMember(father.id);
  }

  function deleteSelected() {
    const m = getSelected();
    if (!m) return;

    // Remove from members
    state.members = state.members.filter(item => item.id !== m.id);

    // Clean up matings
    state.matings = state.matings.filter(rel => {
      if (rel.p1 === m.id || rel.p2 === m.id) return false;
      rel.children = (rel.children || []).filter(cid => cid !== m.id);
      return true;
    });

    state.selectedId = null;
    showCaseInfoPanel();
    computeGenerationsAndIndices();
    renderChart();
  }

  // =========================================================================
  // PALETTE & DRAG-AND-DROP TO ADD
  // =========================================================================
  function setupPaletteEvents() {
    document.querySelectorAll('.sym-card[data-action="add-person"]').forEach(card => {
      card.addEventListener('click', () => {
        const sex = card.getAttribute('data-sex') || 'male';
        const status = card.getAttribute('data-status') || 'unaffected';
        const deceased = card.getAttribute('data-deceased') === 'true';
        const proband = card.getAttribute('data-proband') === 'true';

        // Add near center of current view
        const rect = svg.getBoundingClientRect();
        const centerScreenX = rect.width / 2;
        const centerScreenY = rect.height / 2;
        const worldX = Math.round((centerScreenX - state.panX) / state.zoom);
        const worldY = Math.round((centerScreenY - state.panY) / state.zoom);

        const newId = 'm_' + Date.now();
        const newPerson = {
          id: newId,
          name: '',
          sex: sex,
          status: status,
          deceased: deceased,
          proband: proband,
          gen: 2,
          x: worldX,
          y: worldY,
          genotype: ''
        };

        if (proband) {
          state.members.forEach(item => item.proband = false);
        }

        state.members.push(newPerson);
        computeGenerationsAndIndices();
        selectMember(newPerson.id);
      });
    });

    // Mating and Consanguinity connection tools
    document.querySelectorAll('.sym-card[data-action="connect-mode"]').forEach(card => {
      card.addEventListener('click', () => {
        const connType = card.getAttribute('data-conn-type') || 'mating';
        const m = getSelected();
        if (m) {
          // If a person is already selected, let user click partner
          alert(`Click another individual to create a ${connType === 'consanguinity' ? 'Consanguineous' : 'Mating'} union.`);
        } else {
          alert(`Select an individual first, then click Mating or Consanguinity.`);
        }
      });
    });
  }

  // =========================================================================
  // CANVAS PAN, ZOOM & DRAG NODES
  // =========================================================================
  function setupCanvasEvents() {
    // Pan Canvas
    svg.addEventListener('mousedown', (e) => {
      if (e.target === svg || e.target.tagName === 'rect' && e.target.classList.contains('svg-bg-grid') || e.target.id === 'pedigree-svg') {
        state.isPanning = true;
        state.dragStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
        state.selectedId = null;
        showCaseInfoPanel();
        renderChart();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (state.isPanning) {
        state.panX = e.clientX - state.dragStart.x;
        state.panY = e.clientY - state.dragStart.y;
        updateTransform();
      } else if (state.draggingId) {
        const member = state.members.find(m => m.id === state.draggingId);
        if (member) {
          const rect = svg.getBoundingClientRect();
          const svgX = e.clientX - rect.left;
          const svgY = e.clientY - rect.top;
          member.x = Math.round((svgX - state.panX) / state.zoom - state.dragOffset.x);
          member.y = Math.round((svgY - state.panY) / state.zoom - state.dragOffset.y);
          renderChart();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      state.isPanning = false;
      if (state.draggingId) {
        state.draggingId = null;
        computeGenerationsAndIndices();
        renderChart();
      }
    });

    // Zoom via wheel
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(state.zoom * zoomFactor);
    });

    // Zoom Buttons
    document.getElementById('btn-zoom-in').addEventListener('click', () => setZoom(state.zoom * 1.15));
    document.getElementById('btn-zoom-out').addEventListener('click', () => setZoom(state.zoom * 0.85));
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
      updateQuickToolbarPosition();
    });
  }

  function setZoom(val) {
    state.zoom = Math.min(2.5, Math.max(0.4, val));
    updateTransform();
    updateQuickToolbarPosition();
  }

  function updateTransform() {
    canvasRoot.setAttribute('transform', `matrix(${state.zoom} 0 0 ${state.zoom} ${state.panX} ${state.panY})`);
    zoomText.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function startDraggingMember(id, e) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;

    state.draggingId = id;
    const rect = svg.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    const worldMouseX = (svgX - state.panX) / state.zoom;
    const worldMouseY = (svgY - state.panY) / state.zoom;

    state.dragOffset = {
      x: worldMouseX - member.x,
      y: worldMouseY - member.y
    };
  }

  // =========================================================================
  // AUTO LAYOUT
  // =========================================================================
  function setupHeaderControls() {
    document.getElementById('btn-auto-layout').addEventListener('click', () => {
      autoLayoutPedigree();
      renderChart();
    });

    // Export Dropdown
    const btnExport = document.getElementById('btn-export');
    const exportDropdown = document.getElementById('export-dropdown');
    btnExport.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      exportDropdown.classList.add('hidden');
    });

    document.getElementById('opt-export-svg').addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.classList.add('hidden');
      exportSvg();
    });
    document.getElementById('opt-export-png').addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.classList.add('hidden');
      exportPng();
    });

    // Theme Toggle
    const btnTheme = document.getElementById('btn-theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    btnTheme.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);

      if (next === 'light') {
        iconSun.classList.remove('hidden');
        iconMoon.classList.add('hidden');
      } else {
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
      }
    });
  }

  function autoLayoutPedigree() {
    // Group members by generation
    const byGen = {};
    state.members.forEach(m => {
      byGen[m.gen] = byGen[m.gen] || [];
      byGen[m.gen].push(m);
    });

    Object.keys(byGen).forEach(genNum => {
      const genMembers = byGen[genNum];
      genMembers.sort((a, b) => a.x - b.x);
      const totalWidth = genMembers.length * 130;
      const startX = Math.max(180, 480 - totalWidth / 2);

      genMembers.forEach((m, idx) => {
        m.x = startX + idx * 130;
        m.y = GEN_Y[m.gen] || (m.gen * 150 - 60);
      });
    });

    computeGenerationsAndIndices();
  }

  // =========================================================================
  // TOAST NOTIFICATION HELPER
  // =========================================================================
  function showToast(message, icon = '✓') {
    let toast = document.getElementById('pedigree-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pedigree-toast';
      toast.className = 'pedigree-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // EXPORT FUNCTIONS (SELF-CONTAINED SVG & HIGH-DPI RETINA PNG)
  // =========================================================================
  function generateExportSvg() {
    const isLight = document.body.getAttribute('data-theme') === 'light';

    // Resolved clinical theme colors (no unresolved CSS variables)
    const bgColor = isLight ? '#ffffff' : '#0b0f19';
    const symStroke = isLight ? '#0f172a' : '#f1f5f9';
    const symUnshaded = isLight ? '#ffffff' : '#0f1627';
    const magenta = isLight ? '#c00092' : '#d800a6';
    const symLine = isLight ? '#475569' : '#cbd5e1';
    const textMain = isLight ? '#0f172a' : '#f1f5f9';
    const textSecondary = isLight ? '#475569' : '#94a3b8';
    const textMuted = isLight ? '#64748b' : '#64748b';
    const headerBorder = isLight ? '#e2e8f0' : '#202d4a';
    const rulerBg = isLight ? '#f1f5f9' : '#151f36';
    const rulerBorder = isLight ? '#cbd5e1' : '#2a3a5e';

    // Compute bounding box around all family members in world coordinates
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    if (state.members.length === 0) {
      minX = 200; maxX = 800; minY = 100; maxY = 500;
    } else {
      state.members.forEach(m => {
        minX = Math.min(minX, m.x - 70);
        maxX = Math.max(maxX, m.x + 70);
        minY = Math.min(minY, m.y - 45);
        maxY = Math.max(maxY, m.y + 75);
      });
    }

    // Include generous clinical margin and space on the left for Roman numerals
    const exportMinX = Math.round(minX - 70);
    const exportMinY = Math.round(minY - 75);
    const exportWidth = Math.max(680, Math.round(maxX - exportMinX + 70));
    const exportHeight = Math.max(440, Math.round(maxY - exportMinY + 60));

    // Case title and clinical descriptor
    const casePreset = PRESETS[state.activeCase] || {
      title: 'Clinical Pedigree Chart',
      typeName: 'Family Study'
    };
    const titleText = state.activeCase === 'blank' ? 'Clinical Pedigree Chart' : (casePreset.title || 'Pedigree Chart');
    const subText = `${casePreset.typeName || 'Clinical Study'} • Standard Clinical Pedigree Nomenclature`;

    // Generation Roman numerals on the left ruler
    const uniqueGens = Array.from(new Set(state.members.map(m => m.gen))).sort((a, b) => a - b);
    let romanNumeralsSvg = '';
    uniqueGens.forEach(gen => {
      const genMembers = state.members.filter(m => m.gen === gen);
      const avgY = genMembers.length > 0
        ? Math.round(genMembers.reduce((sum, m) => sum + m.y, 0) / genMembers.length)
        : (GEN_Y[gen] || (gen * 150 - 60));
      const roman = toRoman(gen);
      romanNumeralsSvg += `
        <rect x="${exportMinX + 24}" y="${avgY - 14}" width="28" height="28" rx="6" fill="${rulerBg}" stroke="${rulerBorder}" stroke-width="1"/>
        <text x="${exportMinX + 38}" y="${avgY}" class="gen-roman-num" dominant-baseline="central" text-anchor="middle">${roman}</text>
      `;
    });

    // Clone connections and nodes, stripping any active selection halo
    const clonedConnections = layerConnections.cloneNode(true);
    const clonedNodes = layerNodes.cloneNode(true);

    clonedNodes.querySelectorAll('.pedigree-node.selected').forEach(node => {
      node.classList.remove('selected');
    });

    const connectionsXml = new XMLSerializer().serializeToString(clonedConnections);
    const nodesXml = new XMLSerializer().serializeToString(clonedNodes);

    const escapeXml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="${exportMinX} ${exportMinY} ${exportWidth} ${exportHeight}"
     width="${exportWidth}" height="${exportHeight}">
  <defs>
    <style type="text/css">
      .sym-shape { stroke: ${symStroke}; stroke-width: 2.5px; stroke-linejoin: round; fill: ${symUnshaded}; }
      .sym-shape.unshaded { fill: ${symUnshaded}; stroke: ${symStroke}; }
      .sym-shape.affected-magenta { fill: ${magenta}; stroke: ${symStroke}; }
      .sym-half-fill { fill: ${magenta}; stroke: none; }
      .sym-dot-fill { fill: ${magenta}; stroke: none; }
      .sym-slash-line { stroke: ${symStroke}; stroke-width: 2.5px; }
      .sym-arrow-line { stroke: ${symStroke}; stroke-width: 2px; fill: none; }
      .sym-arrow-text { font-size: 9px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${symStroke}; text-anchor: middle; }
      .node-text-id { font-size: 11px; font-weight: 700; text-anchor: middle; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textSecondary}; }
      .node-text-name { font-size: 11px; font-weight: 600; text-anchor: middle; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textMain}; }
      .node-text-tag { font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-anchor: middle; fill: ${textMuted}; }
      .pedigree-line { stroke: ${symLine}; stroke-width: 2.2px; stroke-linecap: round; fill: none; }
      .gen-roman-num { font-size: 12px; font-weight: 800; text-anchor: middle; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textSecondary}; }
      .chart-title-text { font-size: 16px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textMain}; }
      .chart-sub-text { font-size: 11px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textSecondary}; }
    </style>
  </defs>

  <!-- Clean Background -->
  <rect x="${exportMinX}" y="${exportMinY}" width="${exportWidth}" height="${exportHeight}" fill="${bgColor}" />

  <!-- Header Title & Divider -->
  <text x="${exportMinX + 30}" y="${exportMinY + 34}" class="chart-title-text">${escapeXml(titleText)}</text>
  <text x="${exportMinX + 30}" y="${exportMinY + 50}" class="chart-sub-text">${escapeXml(subText)}</text>
  <line x1="${exportMinX + 30}" y1="${exportMinY + 60}" x2="${exportMinX + exportWidth - 30}" y2="${exportMinY + 60}" stroke="${headerBorder}" stroke-width="1" />

  <!-- Generation Roman Numerals Column -->
  <g id="export-roman-numerals">
    ${romanNumeralsSvg}
  </g>

  <!-- Pedigree Lines and Nodes -->
  ${connectionsXml}
  ${nodesXml}
</svg>`;

    return {
      svgString: svgContent,
      width: exportWidth,
      height: exportHeight
    };
  }

  function exportSvg() {
    try {
      const exportData = generateExportSvg();
      const blob = new Blob([exportData.svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedigree_${state.activeCase}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(`Exported pedigree_${state.activeCase}.svg`, '📥');
    } catch (err) {
      console.error('Error exporting SVG:', err);
      alert('Failed to export SVG: ' + err.message);
    }
  }

  function exportPng() {
    try {
      const exportData = generateExportSvg();
      const svgStr = exportData.svgString;
      const base64Svg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
      const img = new Image();

      img.onload = () => {
        try {
          const scale = 2; // High-resolution retina export
          const canvas = document.createElement('canvas');
          canvas.width = exportData.width * scale;
          canvas.height = exportData.height * scale;
          const ctx = canvas.getContext('2d');

          const isLight = document.body.getAttribute('data-theme') === 'light';
          ctx.fillStyle = isLight ? '#ffffff' : '#0b0f19';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `pedigree_${state.activeCase}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast(`Exported pedigree_${state.activeCase}.png`, '🖼️');
        } catch (err) {
          console.error('Canvas export error:', err);
          alert('Unable to generate PNG. Please use SVG export.');
        }
      };

      img.onerror = (e) => {
        console.error('Image load failed during PNG export, trying blob URL fallback...', e);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          try {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = exportData.width * scale;
            canvas.height = exportData.height * scale;
            const ctx = canvas.getContext('2d');
            const isLight = document.body.getAttribute('data-theme') === 'light';
            ctx.fillStyle = isLight ? '#ffffff' : '#0b0f19';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `pedigree_${state.activeCase}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            showToast(`Exported pedigree_${state.activeCase}.png`, '🖼️');
          } catch (fallbackErr) {
            console.error('Fallback canvas export error:', fallbackErr);
            alert('Unable to generate PNG: ' + fallbackErr.message);
          }
        };
        fallbackImg.onerror = (err) => {
          console.error('Blob URL image load also failed:', err);
          alert('Could not render PNG from SVG. Please use SVG export.');
        };
        fallbackImg.src = blobUrl;
      };

      img.src = base64Svg;
    } catch (err) {
      console.error('Error initiating PNG export:', err);
      alert('Failed to export PNG: ' + err.message);
    }
  }

  // =========================================================================
  // NOMENCLATURE MODAL
  // =========================================================================
  function setupNomenclatureModal() {
    const modal = document.getElementById('guide-modal');
    const btnOpen = document.getElementById('btn-open-guide');
    const btnClose = document.getElementById('btn-close-guide');
    const btnModalClose = document.getElementById('btn-modal-close');

    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    btnModalClose.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Run on page load
  window.addEventListener('DOMContentLoaded', init);
})();
