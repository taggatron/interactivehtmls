/**
 * GeneTree Studio: Clinical Pedigree Lab & Chart Builder
 * Implementation of International Standard Clinical Pedigree Nomenclature
 */

(function () {
  'use strict';

  // =========================================================================
  // AUDIO SYNTHESIZER ENGINE (Web Audio API)
  // =========================================================================
  class SoundFX {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Fallback silently if audio context restricted
      }
    }

    click() {
      this.playTone(800, 'triangle', 0.04, 0.08);
    }

    select() {
      this.playTone(550, 'sine', 0.07, 0.12);
    }

    connect() {
      this.playTone(440, 'sine', 0.05, 0.1);
      setTimeout(() => this.playTone(660, 'sine', 0.08, 0.1), 50);
    }

    success() {
      if (!this.enabled) return;
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.1), idx * 70);
      });
    }

    error() {
      this.playTone(220, 'sawtooth', 0.15, 0.12);
    }

    delete() {
      this.playTone(280, 'square', 0.08, 0.09);
    }
  }

  const sfx = new SoundFX();

  // =========================================================================
  // STATE MANAGEMENT & TEMPLATES
  // =========================================================================
  const DEFAULT_GEN_Y = {
    1: 90,
    2: 240,
    3: 390,
    4: 540
  };

  // Preset Family Datasets
  const PRESETS = {
    'cf-standard': {
      title: 'Cystic Fibrosis (Autosomal Recessive)',
      members: [
        // Gen I
        { id: 'm1', name: 'Grandfather A', sex: 'male', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 1, x: 270, y: 90, age: '74y', genotype: 'wt/ΔF508', notes: 'Heterozygous carrier' },
        { id: 'm2', name: 'Grandmother A', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 1, x: 390, y: 90, age: '71y', genotype: 'wt/wt', notes: 'Normal wild-type' },
        { id: 'm3', name: 'Grandfather B', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 1, x: 570, y: 90, age: '69y', genotype: 'wt/wt', notes: 'Normal wild-type' },
        { id: 'm4', name: 'Grandmother B', sex: 'female', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 1, x: 690, y: 90, age: '68y', genotype: 'wt/ΔF508', notes: 'Heterozygous carrier' },
        // Gen II
        { id: 'm5', name: 'Uncle Mark', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 270, y: 240, age: '45y', genotype: 'wt/wt', notes: '' },
        { id: 'm6', name: 'David (Father)', sex: 'male', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 2, x: 390, y: 240, age: '36y', genotype: 'wt/ΔF508', notes: 'Asymptomatic carrier' },
        { id: 'm7', name: 'Sarah (Mother)', sex: 'female', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 2, x: 570, y: 240, age: '34y', genotype: 'wt/ΔF508', notes: 'Asymptomatic carrier' },
        { id: 'm8', name: 'Aunt Lisa', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 690, y: 240, age: '31y', genotype: 'wt/wt', notes: '' },
        // Gen III (Offspring of David & Sarah)
        { id: 'm9', name: 'Lucas', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 3, x: 410, y: 390, age: '8y', genotype: 'wt/wt', notes: 'Normal phenotype' },
        { id: 'm10', name: 'Emma (Proband)', sex: 'female', status: 'affected', carrierDot: false, deceased: false, proband: true, gen: 3, x: 480, y: 390, age: '4y', genotype: 'ΔF508/ΔF508', notes: 'Diagnosed with Cystic Fibrosis. Sweat chloride 84 mmol/L.' },
        { id: 'm11', name: 'Noah', sex: 'male', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 3, x: 550, y: 390, age: '2y', genotype: 'wt/ΔF508', notes: 'Healthy carrier' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m5', 'm6'] },
        { id: 'r2', type: 'mating', p1: 'm3', p2: 'm4', children: ['m7', 'm8'] },
        { id: 'r3', type: 'mating', p1: 'm6', p2: 'm7', children: ['m9', 'm10', 'm11'] }
      ]
    },

    'hd-standard': {
      title: "Huntington's Chorea (Autosomal Dominant)",
      members: [
        // Gen I
        { id: 'm1', name: 'Arthur (Grandfather)', sex: 'male', status: 'affected', carrierDot: false, deceased: true, proband: false, gen: 1, x: 400, y: 90, age: 'd. 57y', genotype: '45 CAG (Mutant)', notes: 'Severe chorea, dysarthria, and progressive dementia. Passed away at 57.' },
        { id: 'm2', name: 'Eleanor', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 1, x: 540, y: 90, age: '78y', genotype: '18/19 CAG', notes: 'Normal wild-type' },
        // Gen II
        { id: 'm4', name: 'Robert (Father)', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 270, y: 240, age: '51y', genotype: '17/18 CAG', notes: 'Normal wild-type' },
        { id: 'm3', name: 'Claire (Mother)', sex: 'female', status: 'affected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 400, y: 240, age: '49y', genotype: '18/44 CAG', notes: 'Early chorea, executive dysfunction, depression.' },
        { id: 'm5', name: 'Uncle Thomas', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 580, y: 240, age: '46y', genotype: '18/20 CAG', notes: 'Unaffected sibling' },
        // Gen III
        { id: 'm6', name: 'Julian', sex: 'male', status: 'affected', carrierDot: false, deceased: false, proband: false, gen: 3, x: 230, y: 390, age: '28y', genotype: '43 CAG', notes: 'Presymptomatic genetic test confirmed full penetrance allele.' },
        { id: 'm7', name: 'Marcus (Proband)', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: true, gen: 3, x: 360, y: 390, age: '26y', genotype: 'At-risk (50%)', notes: 'Consultand seeking predictive genetic counseling before childbearing.' },
        { id: 'm8', name: 'Sophia', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 3, x: 490, y: 390, age: '22y', genotype: '18/18 CAG', notes: 'Tested negative for HD expansion.' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m3', 'm5'] },
        { id: 'r2', type: 'mating', p1: 'm4', p2: 'm3', children: ['m6', 'm7', 'm8'] }
      ]
    },

    'cf-consanguinity': {
      title: 'CF with Consanguineous Mating (Double Line)',
      members: [
        // Gen I - Common Ancestors
        { id: 'm1', name: 'Great-Grandfather', sex: 'male', status: 'carrier', carrierDot: false, deceased: true, proband: false, gen: 1, x: 420, y: 80, age: 'd. 82y', genotype: 'wt/ΔF508', notes: 'Transmitted mutant allele to branches A & B' },
        { id: 'm2', name: 'Great-Grandmother', sex: 'female', status: 'unaffected', carrierDot: false, deceased: true, proband: false, gen: 1, x: 540, y: 80, age: 'd. 79y', genotype: 'wt/wt', notes: '' },
        // Gen II - Siblings
        { id: 'm3', name: 'Brother (Branch A)', sex: 'male', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 2, x: 330, y: 220, age: '58y', genotype: 'wt/ΔF508', notes: 'Carrier sibling' },
        { id: 'm4', name: 'Sister (Branch B)', sex: 'female', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 2, x: 630, y: 220, age: '56y', genotype: 'wt/ΔF508', notes: 'Carrier sibling' },
        // Gen III - First Cousins in Consanguineous Union
        { id: 'm5', name: 'Cousin Groom', sex: 'male', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 3, x: 410, y: 360, age: '32y', genotype: 'wt/ΔF508', notes: 'Inherited ΔF508 from Branch A' },
        { id: 'm6', name: 'Cousin Bride', sex: 'female', status: 'carrier', carrierDot: false, deceased: false, proband: false, gen: 3, x: 550, y: 360, age: '30y', genotype: 'wt/ΔF508', notes: 'Inherited ΔF508 from Branch B' },
        // Gen IV - Affected Child
        { id: 'm7', name: 'Elena (Proband)', sex: 'female', status: 'affected', carrierDot: false, deceased: false, proband: true, gen: 4, x: 480, y: 500, age: '3y', genotype: 'ΔF508/ΔF508', notes: 'Affected with CF due to shared ancestral allele' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m3', 'm4'] },
        { id: 'r2', type: 'consanguinity', p1: 'm5', p2: 'm6', children: ['m7'] }
      ]
    },

    '3-gen-blank': {
      title: 'Blank 3-Generation Family',
      members: [
        { id: 'm1', name: 'I-1', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 1, x: 380, y: 90, age: '', genotype: '', notes: '' },
        { id: 'm2', name: 'I-2', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 1, x: 520, y: 90, age: '', genotype: '', notes: '' },
        { id: 'm3', name: 'II-1', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 380, y: 240, age: '', genotype: '', notes: '' },
        { id: 'm4', name: 'II-2', sex: 'female', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 2, x: 520, y: 240, age: '', genotype: '', notes: '' },
        { id: 'm5', name: 'III-1', sex: 'female', status: 'affected', carrierDot: false, deceased: false, proband: true, gen: 3, x: 410, y: 390, age: '', genotype: '', notes: '' },
        { id: 'm6', name: 'III-2', sex: 'male', status: 'unaffected', carrierDot: false, deceased: false, proband: false, gen: 3, x: 490, y: 390, age: '', genotype: '', notes: '' }
      ],
      matings: [
        { id: 'r1', type: 'mating', p1: 'm1', p2: 'm2', children: ['m3'] },
        { id: 'r2', type: 'mating', p1: 'm3', p2: 'm4', children: ['m5', 'm6'] }
      ]
    },

    'empty': {
      title: 'Empty Canvas',
      members: [],
      matings: []
    }
  };

  // Application State
  const state = {
    members: [],
    matings: [],
    selectedMemberId: null,
    carrierStyleGlobal: 'half', // 'half' or 'dot'
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    dragStart: { x: 0, y: 0 },
    draggingMemberId: null,
    dragMemberOffset: { x: 0, y: 0 },
    history: [],
    historyIndex: -1,
    connectMode: null // { type: 'mating'|'consanguinity', sourceId: null }
  };

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================
  const svgCanvas = document.getElementById('pedigree-svg');
  const transformGroup = document.getElementById('canvas-transform-group');
  const layerGuidelines = document.getElementById('generation-guidelines');
  const layerConnections = document.getElementById('layer-connections');
  const layerNodes = document.getElementById('layer-nodes');
  const layerInteraction = document.getElementById('layer-interaction');

  const inspectorEl = document.getElementById('clinical-inspector');
  const formMember = document.getElementById('form-edit-member');
  const inspEmpty = document.getElementById('inspector-empty');
  const quickBar = document.getElementById('node-quick-bar');

  const liveAnnouncer = document.getElementById('live-announcer');
  const templateSelect = document.getElementById('template-select');
  const zoomText = document.getElementById('zoom-level-text');

  // Announcement helper for a11y
  function announce(msg) {
    if (liveAnnouncer) {
      liveAnnouncer.textContent = msg;
    }
  }

  // =========================================================================
  // HISTORY / UNDO-REDO
  // =========================================================================
  function pushHistory(description) {
    // Drop future redos
    state.history = state.history.slice(0, state.historyIndex + 1);
    const snapshot = {
      members: JSON.parse(JSON.stringify(state.members)),
      matings: JSON.parse(JSON.stringify(state.matings)),
      description: description || 'Action'
    };
    state.history.push(snapshot);
    state.historyIndex = state.history.length - 1;
    updateUndoRedoButtons();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const snapshot = state.history[state.historyIndex];
      state.members = JSON.parse(JSON.stringify(snapshot.members));
      state.matings = JSON.parse(JSON.stringify(snapshot.matings));
      sfx.click();
      renderCanvas();
      updateInspector();
      runGeneticsAnalysis();
      updateUndoRedoButtons();
      announce(`Undo: ${snapshot.description}`);
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      const snapshot = state.history[state.historyIndex];
      state.members = JSON.parse(JSON.stringify(snapshot.members));
      state.matings = JSON.parse(JSON.stringify(snapshot.matings));
      sfx.click();
      renderCanvas();
      updateInspector();
      runGeneticsAnalysis();
      updateUndoRedoButtons();
      announce(`Redo: ${snapshot.description}`);
    }
  }

  function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = state.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = state.historyIndex >= state.history.length - 1;
  }

  // =========================================================================
  // SVG RENDERING & NOMENCLATURE SYMBOLS
  // =========================================================================
  const SYMBOL_SIZE = 40; // 40x40 standard dimension

  function createMemberSvgElement(member, isSelected) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `pedigree-node ${isSelected ? 'selected' : ''}`);
    g.setAttribute('data-id', member.id);
    g.setAttribute('transform', `translate(${member.x}, ${member.y})`);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${member.name || 'Member'}, Generation ${member.gen}, Sex: ${member.sex}, Status: ${member.status}${member.deceased ? ', Deceased' : ''}${member.proband ? ', Proband' : ''}`);

    const half = SYMBOL_SIZE / 2;
    const isAffected = member.status === 'affected';
    const isCarrier = member.status === 'carrier';
    const useDot = member.carrierDot || state.carrierStyleGlobal === 'dot';

    // 1. Base Shape (Square for male, Circle for female, Diamond for unspecified)
    if (member.sex === 'male') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -half);
      rect.setAttribute('y', -half);
      rect.setAttribute('width', SYMBOL_SIZE);
      rect.setAttribute('height', SYMBOL_SIZE);
      rect.setAttribute('class', `sym-shape ${isAffected ? 'sym-affected' : 'sym-unshaded'}`);
      g.appendChild(rect);

      // Carrier representation
      if (isCarrier) {
        if (useDot) {
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', 0);
          dot.setAttribute('cy', 0);
          dot.setAttribute('r', 6);
          dot.setAttribute('class', 'sym-dot');
          g.appendChild(dot);
        } else {
          const halfRect = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          halfRect.setAttribute('d', `M ${-half} ${-half} L 0 ${-half} L 0 ${half} L ${-half} ${half} Z`);
          halfRect.setAttribute('class', 'sym-carrier-half');
          g.appendChild(halfRect);
        }
      }
    } else if (member.sex === 'female') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('r', half);
      circle.setAttribute('class', `sym-shape ${isAffected ? 'sym-affected' : 'sym-unshaded'}`);
      g.appendChild(circle);

      // Carrier representation
      if (isCarrier) {
        if (useDot) {
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', 0);
          dot.setAttribute('cy', 0);
          dot.setAttribute('r', 6);
          dot.setAttribute('class', 'sym-dot');
          g.appendChild(dot);
        } else {
          const halfCircle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          // Left half arc of circle: from (0, -half) to (0, half)
          halfCircle.setAttribute('d', `M 0 ${-half} A ${half} ${half} 0 0 0 0 ${half} Z`);
          halfCircle.setAttribute('class', 'sym-carrier-half');
          g.appendChild(halfCircle);
        }
      }
    } else {
      // Unspecified Sex (Diamond)
      const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const dSize = half * 1.25;
      diamond.setAttribute('points', `0,${-dSize} ${dSize},0 0,${dSize} ${-dSize},0`);
      diamond.setAttribute('class', `sym-shape ${isAffected ? 'sym-affected' : 'sym-unshaded'}`);
      g.appendChild(diamond);

      if (isCarrier) {
        if (useDot) {
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', 0);
          dot.setAttribute('cy', 0);
          dot.setAttribute('r', 6);
          dot.setAttribute('class', 'sym-dot');
          g.appendChild(dot);
        } else {
          const halfDiamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          halfDiamond.setAttribute('points', `0,${-dSize} 0,${dSize} ${-dSize},0`);
          halfDiamond.setAttribute('class', 'sym-carrier-half');
          g.appendChild(halfDiamond);
        }
      }
    }

    // 2. Deceased Modifier (Diagonal Slash line from bottom-left to top-right)
    if (member.deceased) {
      const slash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const offset = half * 1.4;
      slash.setAttribute('x1', -offset);
      slash.setAttribute('y1', offset);
      slash.setAttribute('x2', offset);
      slash.setAttribute('y2', -offset);
      slash.setAttribute('class', 'sym-slash');
      g.appendChild(slash);
    }

    // 3. Proband Modifier (Arrow pointing towards lower left corner with letter 'P')
    if (member.proband) {
      const arrowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      arrowGroup.setAttribute('class', 'proband-arrow-group');

      const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      // Starts at (-half - 18, half + 18) and points to (-half - 2, half + 2)
      const xStart = -half - 18;
      const yStart = half + 18;
      const xEnd = -half - 2;
      const yEnd = half + 2;
      arrowLine.setAttribute('d', `M ${xStart} ${yStart} L ${xEnd} ${yEnd} M ${xEnd - 8} ${yEnd} L ${xEnd} ${yEnd} L ${xEnd} ${yEnd + 8}`);
      arrowLine.setAttribute('class', 'sym-arrow');

      const textP = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textP.setAttribute('x', xStart - 8);
      textP.setAttribute('y', yStart + 4);
      textP.setAttribute('class', 'sym-p-text');
      textP.setAttribute('font-size', '12');
      textP.textContent = 'P';

      arrowGroup.appendChild(arrowLine);
      arrowGroup.appendChild(textP);
      g.appendChild(arrowGroup);
    }

    // 4. Clinical Labels (ID, Name, Genotype)
    const textGenId = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textGenId.setAttribute('x', 0);
    textGenId.setAttribute('y', half + 16);
    textGenId.setAttribute('class', 'node-gen-id');
    textGenId.textContent = member.clinicalId || `${toRoman(member.gen)}-${member.indexInGen || '?'}`;
    g.appendChild(textGenId);

    if (member.name) {
      const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textName.setAttribute('x', 0);
      textName.setAttribute('y', half + 28);
      textName.setAttribute('class', 'node-label');
      textName.textContent = member.name.length > 15 ? member.name.substring(0, 14) + '…' : member.name;
      g.appendChild(textName);
    }

    if (member.genotype) {
      const textGeno = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textGeno.setAttribute('x', 0);
      textGeno.setAttribute('y', half + (member.name ? 40 : 28));
      textGeno.setAttribute('class', 'node-sublabel');
      textGeno.textContent = member.genotype;
      g.appendChild(textGeno);
    }

    return g;
  }

  function toRoman(num) {
    const romans = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return romans[num] || String(num);
  }

  // =========================================================================
  // CONNECTION RENDERING (MATINGS, CONSANGUINITY, DESCENDANT BARS)
  // =========================================================================
  function renderConnections() {
    layerConnections.innerHTML = '';

    state.matings.forEach(mating => {
      const p1 = state.members.find(m => m.id === mating.p1);
      const p2 = state.members.find(m => m.id === mating.p2);
      if (!p1 || !p2) return;

      const isConsanguineous = mating.type === 'consanguinity';

      // Ensure p1 is to the left of p2 for clean drawing
      const leftP = p1.x <= p2.x ? p1 : p2;
      const rightP = p1.x <= p2.x ? p2 : p1;

      const half = SYMBOL_SIZE / 2;
      const y = (leftP.y + rightP.y) / 2;
      const x1 = leftP.x + half;
      const x2 = rightP.x - half;

      if (x2 <= x1) return; // Overlap safeguard

      const gRel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gRel.setAttribute('class', 'mating-group');
      gRel.setAttribute('data-rel-id', mating.id);

      if (isConsanguineous) {
        // Double horizontal line for Consanguinity
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', x1);
        line1.setAttribute('y1', y - 3);
        line1.setAttribute('x2', x2);
        line1.setAttribute('y2', y - 3);
        line1.setAttribute('class', 'connection-line consanguineous');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', x1);
        line2.setAttribute('y1', y + 3);
        line2.setAttribute('x2', x2);
        line2.setAttribute('y2', y + 3);
        line2.setAttribute('class', 'connection-line consanguineous');

        gRel.appendChild(line1);
        gRel.appendChild(line2);
      } else {
        // Single horizontal line for Standard Mating
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'connection-line');
        gRel.appendChild(line);
      }

      // Descendants / Children lines
      if (mating.children && mating.children.length > 0) {
        const childObjects = mating.children
          .map(cid => state.members.find(m => m.id === cid))
          .filter(Boolean)
        if (childObjects.length > 0) {
          const midX = (x1 + x2) / 2;
          const minChildTopY = Math.min(...childObjects.map(c => c.y - (SYMBOL_SIZE / 2)));
          // Place junction bar safely below parent labels and above child tops
          const dropY = Math.min(minChildTopY - 20, Math.max(y + 65, Math.round((y + minChildTopY) / 2)));

          // 1. Vertical line from mating line down to branch bar
          const dropLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          dropLine.setAttribute('x1', midX);
          dropLine.setAttribute('y1', y);
          dropLine.setAttribute('x2', midX);
          dropLine.setAttribute('y2', dropY);
          dropLine.setAttribute('class', 'connection-line');
          gRel.appendChild(dropLine);

          // 2. Horizontal branch bar spanning all children
          const minChildX = Math.min(...childObjects.map(c => c.x));
          const maxChildX = Math.max(...childObjects.map(c => c.x));
          const branchLeft = Math.min(midX, minChildX);
          const branchRight = Math.max(midX, maxChildX);

          if (childObjects.length > 1 || minChildX !== midX) {
            const branchBar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            branchBar.setAttribute('x1', branchLeft);
            branchBar.setAttribute('y1', dropY);
            branchBar.setAttribute('x2', branchRight);
            branchBar.setAttribute('y2', dropY);
            branchBar.setAttribute('class', 'connection-line');
            gRel.appendChild(branchBar);
          }

          // 3. Drop lines from branch bar down into each individual child
          childObjects.forEach(child => {
            const childTopY = child.y - (SYMBOL_SIZE / 2);
            const toChildLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            toChildLine.setAttribute('x1', child.x);
            toChildLine.setAttribute('y1', dropY);
            toChildLine.setAttribute('x2', child.x);
            toChildLine.setAttribute('y2', childTopY);
            toChildLine.setAttribute('class', 'connection-line');
            gRel.appendChild(toChildLine);
          });
        }
      }

      layerConnections.appendChild(gRel);
    });
  }

  // =========================================================================
  // CANVAS RENDERING ORCHESTRATOR
  // =========================================================================
  function renderCanvas() {
    // 1. Recompute generational order & clinical IDs (I-1, I-2, II-1, etc.)
    computeGenerationIndices();

    // 2. Render guidelines
    renderGuidelines();

    // 3. Render connection lines
    renderConnections();

    // 4. Render individual nodes
    layerNodes.innerHTML = '';
    state.members.forEach(member => {
      const el = createMemberSvgElement(member, member.id === state.selectedMemberId);
      attachNodeEvents(el, member);
      layerNodes.appendChild(el);
    });

    // 5. Update Quick Bar position if member selected
    updateQuickBarPosition();
  }

  function computeGenIndicesForList(memberList) {
    const genGroups = { 1: [], 2: [], 3: [], 4: [] };
    memberList.forEach(m => {
      const g = m.gen || 1;
      if (!genGroups[g]) genGroups[g] = [];
      genGroups[g].push(m);
    });

    Object.keys(genGroups).forEach(g => {
      genGroups[g].sort((a, b) => a.x - b.x);
      genGroups[g].forEach((m, idx) => {
        m.indexInGen = idx + 1;
        m.clinicalId = `${toRoman(m.gen)}-${m.indexInGen}`;
      });
    });
  }

  function computeGenerationIndices() {
    computeGenIndicesForList(state.members);
  }

  function renderGuidelines() {
    layerGuidelines.innerHTML = '';
    const gens = [1, 2, 3, 4];
    gens.forEach(g => {
      const y = DEFAULT_GEN_Y[g];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', -2000);
      line.setAttribute('y1', y);
      line.setAttribute('x2', 4000);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'generation-guide-line');
      layerGuidelines.appendChild(line);
    });
  }

  // =========================================================================
  // INTERACTION HANDLERS & NODE EVENTS
  // =========================================================================
  function attachNodeEvents(svgNode, member) {
    svgNode.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      e.stopPropagation();

      // Handle Connect Mode if active
      if (state.connectMode) {
        handleConnectClick(member);
        return;
      }

      selectMember(member.id);

      // Prepare Dragging
      state.draggingMemberId = member.id;
      const pt = getSvgPoint(e);
      state.dragMemberOffset = {
        x: pt.x - member.x,
        y: pt.y - member.y
      };
    });

    svgNode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMember(member.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedMember();
      }
    });
  }

  function selectMember(memberId) {
    state.selectedMemberId = memberId;
    sfx.select();
    renderCanvas();
    updateInspector();
  }

  function deselectAll() {
    state.selectedMemberId = null;
    renderCanvas();
    updateInspector();
    hideQuickBar();
  }

  function updateQuickBarPosition() {
    if (!state.selectedMemberId) {
      hideQuickBar();
      return;
    }

    const member = state.members.find(m => m.id === state.selectedMemberId);
    if (!member) {
      hideQuickBar();
      return;
    }

    // Convert SVG coords to screen pixels inside canvas container
    const screenX = member.x * state.zoom + state.panX;
    const screenY = member.y * state.zoom + state.panY;

    quickBar.style.left = `${screenX}px`;
    quickBar.style.top = `${screenY - 24 * state.zoom}px`;
    quickBar.classList.remove('hidden');
  }

  function hideQuickBar() {
    quickBar.classList.add('hidden');
  }

  // SVG Coordinate Conversion
  function getSvgPoint(e) {
    const rect = svgCanvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return {
      x: (screenX - state.panX) / state.zoom,
      y: (screenY - state.panY) / state.zoom
    };
  }

  // Canvas Pan & Zoom Handlers
  function updateCanvasTransform() {
    transformGroup.setAttribute('transform', `matrix(${state.zoom} 0 0 ${state.zoom} ${state.panX} ${state.panY})`);
    zoomText.textContent = `${Math.round(state.zoom * 100)}%`;
    updateQuickBarPosition();
  }

  svgCanvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !state.draggingMemberId) {
      state.isPanning = true;
      state.dragStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
      deselectAll();
    }
  });

  window.addEventListener('mousemove', (e) => {
    // 1. Dragging an individual member
    if (state.draggingMemberId) {
      const member = state.members.find(m => m.id === state.draggingMemberId);
      if (member) {
        const pt = getSvgPoint(e);
        member.x = Math.round(pt.x - state.dragMemberOffset.x);
        member.y = Math.round(pt.y - state.dragMemberOffset.y);

        // Snap to nearest generation guideline if within 25px
        const currentGenY = DEFAULT_GEN_Y[member.gen];
        if (Math.abs(member.y - currentGenY) < 25) {
          member.y = currentGenY;
        }

        renderCanvas();
      }
      return;
    }

    // 2. Panning Canvas
    if (state.isPanning) {
      state.panX = e.clientX - state.dragStart.x;
      state.panY = e.clientY - state.dragStart.y;
      updateCanvasTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    if (state.draggingMemberId) {
      pushHistory('Move Individual');
      state.draggingMemberId = null;
      renderCanvas();
    }
    state.isPanning = false;
  });

  // Wheel to Zoom
  svgCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(0.4, state.zoom * zoomFactor), 2.5);

    // Zoom towards mouse position
    const rect = svgCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    state.panX = mouseX - (mouseX - state.panX) * (newZoom / state.zoom);
    state.panY = mouseY - (mouseY - state.panY) * (newZoom / state.zoom);
    state.zoom = newZoom;

    updateCanvasTransform();
  }, { passive: false });

  // Zoom Buttons
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    state.zoom = Math.min(2.5, state.zoom * 1.2);
    updateCanvasTransform();
    sfx.click();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    state.zoom = Math.max(0.4, state.zoom / 1.2);
    updateCanvasTransform();
    sfx.click();
  });

  document.getElementById('btn-reset-view')?.addEventListener('click', () => {
    resetView();
    sfx.click();
  });

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    updateCanvasTransform();
  }

  // =========================================================================
  // CLINICAL INSPECTOR PANEL SYNC
  // =========================================================================
  function updateInspector() {
    if (!state.selectedMemberId) {
      formMember.classList.add('hidden');
      inspEmpty.classList.remove('hidden');
      return;
    }

    const member = state.members.find(m => m.id === state.selectedMemberId);
    if (!member) {
      formMember.classList.add('hidden');
      inspEmpty.classList.remove('hidden');
      return;
    }

    formMember.classList.remove('hidden');
    inspEmpty.classList.add('hidden');

    document.getElementById('insp-badge-id').textContent = member.clinicalId || `Gen ${member.gen}`;
    document.getElementById('insp-title').textContent = member.name || 'Individual Details';

    document.getElementById('input-member-name').value = member.name || '';
    document.getElementById('input-member-age').value = member.age || '';
    document.getElementById('input-member-genotype').value = member.genotype || '';
    document.getElementById('input-member-notes').value = member.notes || '';
    document.getElementById('select-generation').value = String(member.gen || 1);

    // Biological Sex
    const sexInputs = document.querySelectorAll('input[name="member-sex"]');
    sexInputs.forEach(input => {
      input.checked = input.value === member.sex;
    });

    // Clinical Status
    const statusInputs = document.querySelectorAll('input[name="member-status"]');
    statusInputs.forEach(input => {
      input.checked = input.value === member.status;
    });

    // Modifiers
    document.getElementById('check-deceased').checked = !!member.deceased;
    document.getElementById('check-proband').checked = !!member.proband;
  }

  // Bind Inspector Form Input Events
  function initInspectorEvents() {
    document.getElementById('input-member-name')?.addEventListener('input', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.name = e.target.value;
        renderCanvas();
      }
    });

    document.getElementById('input-member-name')?.addEventListener('change', () => {
      pushHistory('Edit Name');
    });

    document.getElementById('input-member-age')?.addEventListener('input', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.age = e.target.value;
        renderCanvas();
      }
    });

    document.getElementById('input-member-genotype')?.addEventListener('input', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.genotype = e.target.value;
        renderCanvas();
      }
    });

    document.getElementById('input-member-notes')?.addEventListener('input', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.notes = e.target.value;
      }
    });

    document.getElementById('select-generation')?.addEventListener('change', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.gen = parseInt(e.target.value, 10);
        member.y = DEFAULT_GEN_Y[member.gen];
        pushHistory('Change Generation Tier');
        renderCanvas();
        updateInspector();
      }
    });

    document.querySelectorAll('input[name="member-sex"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const member = getSelectedMember();
        if (member && e.target.checked) {
          member.sex = e.target.value;
          pushHistory('Change Biological Sex');
          sfx.click();
          renderCanvas();
        }
      });
    });

    document.querySelectorAll('input[name="member-status"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const member = getSelectedMember();
        if (member && e.target.checked) {
          member.status = e.target.value;
          pushHistory('Change Phenotypic Status');
          sfx.click();
          renderCanvas();
          runGeneticsAnalysis();
        }
      });
    });

    document.getElementById('check-deceased')?.addEventListener('change', (e) => {
      const member = getSelectedMember();
      if (member) {
        member.deceased = e.target.checked;
        pushHistory('Toggle Deceased');
        sfx.click();
        renderCanvas();
      }
    });

    document.getElementById('check-proband')?.addEventListener('change', (e) => {
      const member = getSelectedMember();
      if (member) {
        // If setting proband, unmark any previous probands
        if (e.target.checked) {
          state.members.forEach(m => m.proband = false);
        }
        member.proband = e.target.checked;
        pushHistory('Toggle Proband');
        sfx.click();
        renderCanvas();
        runGeneticsAnalysis();
      }
    });

    document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
      deselectAll();
    });

    document.getElementById('btn-delete-member')?.addEventListener('click', () => {
      deleteSelectedMember();
    });

    // Inspector Relationship buttons
    document.getElementById('btn-add-partner-insp')?.addEventListener('click', () => {
      addPartnerToSelected();
    });

    document.getElementById('btn-add-child-insp')?.addEventListener('click', () => {
      addChildToSelected();
    });

    document.getElementById('btn-add-parents-insp')?.addEventListener('click', () => {
      addParentsToSelected();
    });

    document.getElementById('btn-toggle-consanguinity-insp')?.addEventListener('click', () => {
      toggleConsanguinityForSelected();
    });
  }

  function getSelectedMember() {
    return state.members.find(m => m.id === state.selectedMemberId);
  }

  // =========================================================================
  // ACTIONS: ADDING MEMBERS, MATINGS & RELATIONSHIPS
  // =========================================================================
  function addNewMember(options = {}) {
    const id = 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const gen = options.gen || 2;
    const newMember = {
      id,
      name: options.name || '',
      sex: options.sex || 'female',
      status: options.status || 'unaffected',
      carrierDot: !!options.carrierDot,
      deceased: !!options.deceased,
      proband: !!options.proband,
      gen: gen,
      x: options.x !== undefined ? options.x : 450,
      y: options.y !== undefined ? options.y : DEFAULT_GEN_Y[gen],
      age: options.age || '',
      genotype: options.genotype || '',
      notes: options.notes || ''
    };

    if (newMember.proband) {
      state.members.forEach(m => m.proband = false);
    }

    state.members.push(newMember);
    pushHistory('Add Individual');
    sfx.connect();
    selectMember(newMember.id);
    renderCanvas();
    runGeneticsAnalysis();
    announce(`Added new ${newMember.sex} in generation ${toRoman(newMember.gen)}`);
    return newMember;
  }

  function addPartnerToSelected() {
    const current = getSelectedMember();
    if (!current) return;

    // Determine default partner sex opposite to current
    const partnerSex = current.sex === 'male' ? 'female' : 'male';
    const partnerX = current.sex === 'male' ? current.x + 120 : current.x - 120;

    const partner = addNewMember({
      sex: partnerSex,
      gen: current.gen,
      x: partnerX,
      y: current.y
    });

    // Create mating connection
    const matingId = 'r_' + Date.now();
    state.matings.push({
      id: matingId,
      type: 'mating',
      p1: current.id,
      p2: partner.id,
      children: []
    });

    pushHistory('Add Partner');
    sfx.connect();
    renderCanvas();
    runGeneticsAnalysis();
  }

  function addChildToSelected() {
    const current = getSelectedMember();
    if (!current) return;

    // Find mating that includes current member, or create one if none exists
    let mating = state.matings.find(m => m.p1 === current.id || m.p2 === current.id);
    if (!mating) {
      addPartnerToSelected();
      mating = state.matings.find(m => m.p1 === current.id || m.p2 === current.id);
    }

    if (!mating) return;

    const childGen = Math.min(4, current.gen + 1);
    const existingChildren = mating.children
      .map(cid => state.members.find(m => m.id === cid))
      .filter(Boolean);

    let childX = current.x;
    if (existingChildren.length > 0) {
      const maxX = Math.max(...existingChildren.map(c => c.x));
      childX = maxX + 90;
    }

    const child = addNewMember({
      sex: Math.random() > 0.5 ? 'male' : 'female',
      gen: childGen,
      x: childX,
      y: DEFAULT_GEN_Y[childGen]
    });

    mating.children.push(child.id);
    pushHistory('Add Offspring');
    sfx.connect();
    selectMember(child.id);
    renderCanvas();
    runGeneticsAnalysis();
  }

  function addParentsToSelected() {
    const current = getSelectedMember();
    if (!current) return;
    if (current.gen <= 1) {
      alert('Cannot add parents above Generation I.');
      return;
    }

    const parentGen = current.gen - 1;
    const father = addNewMember({
      sex: 'male',
      gen: parentGen,
      x: current.x - 60,
      y: DEFAULT_GEN_Y[parentGen]
    });

    const mother = addNewMember({
      sex: 'female',
      gen: parentGen,
      x: current.x + 60,
      y: DEFAULT_GEN_Y[parentGen]
    });

    const matingId = 'r_' + Date.now();
    state.matings.push({
      id: matingId,
      type: 'mating',
      p1: father.id,
      p2: mother.id,
      children: [current.id]
    });

    pushHistory('Add Parents');
    sfx.connect();
    selectMember(current.id);
    renderCanvas();
    runGeneticsAnalysis();
  }

  function toggleConsanguinityForSelected() {
    const current = getSelectedMember();
    if (!current) return;

    const mating = state.matings.find(m => m.p1 === current.id || m.p2 === current.id);
    if (mating) {
      mating.type = mating.type === 'consanguinity' ? 'mating' : 'consanguinity';
      pushHistory('Toggle Consanguinity Line');
      sfx.click();
      renderCanvas();
      runGeneticsAnalysis();
      announce(`Relationship set to ${mating.type}`);
    } else {
      alert('This individual has no partner relationship yet. Add a partner first.');
    }
  }

  function deleteSelectedMember() {
    const current = getSelectedMember();
    if (!current) return;

    // Remove member
    state.members = state.members.filter(m => m.id !== current.id);

    // Remove from matings & clean up mating if partner left alone
    state.matings.forEach(m => {
      m.children = m.children.filter(cid => cid !== current.id);
    });

    state.matings = state.matings.filter(m => {
      const p1Exists = state.members.some(mem => mem.id === m.p1);
      const p2Exists = state.members.some(mem => mem.id === m.p2);
      return p1Exists && p2Exists;
    });

    state.selectedMemberId = null;
    pushHistory('Delete Individual');
    sfx.delete();
    renderCanvas();
    updateInspector();
    runGeneticsAnalysis();
    announce('Deleted individual');
  }

  // =========================================================================
  // PALETTE & QUICK ACTION TOOLBAR BINDINGS
  // =========================================================================
  function initPaletteAndQuickBar() {
    // Left Palette Items Click to Add
    document.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        if (action === 'add-person') {
          const sex = item.getAttribute('data-sex') || 'male';
          const status = item.getAttribute('data-status') || 'unaffected';
          const carrierDot = item.getAttribute('data-carrier-dot') === 'true';
          const deceased = item.getAttribute('data-deceased') === 'true';
          const proband = item.getAttribute('data-proband') === 'true';

          // Spawn near canvas center or offset from current view
          const spawnX = Math.round((-state.panX + 450) / state.zoom);
          const spawnY = Math.round((-state.panY + 280) / state.zoom);

          addNewMember({
            sex,
            status,
            carrierDot,
            deceased,
            proband,
            gen: 2,
            x: spawnX,
            y: spawnY
          });
        } else if (action === 'connect-mode') {
          const type = item.getAttribute('data-conn-type') || 'mating';
          startConnectMode(type);
        }
      });
    });

    // Floating Node Quick Bar Buttons
    document.getElementById('qbtn-add-partner')?.addEventListener('click', () => addPartnerToSelected());
    document.getElementById('qbtn-add-child')?.addEventListener('click', () => addChildToSelected());
    document.getElementById('qbtn-add-parents')?.addEventListener('click', () => addParentsToSelected());

    document.getElementById('qbtn-toggle-affected')?.addEventListener('click', () => {
      const current = getSelectedMember();
      if (current) {
        current.status = current.status === 'affected' ? 'unaffected' : 'affected';
        pushHistory('Toggle Affected Status');
        sfx.click();
        renderCanvas();
        updateInspector();
        runGeneticsAnalysis();
      }
    });

    document.getElementById('qbtn-toggle-carrier')?.addEventListener('click', () => {
      const current = getSelectedMember();
      if (current) {
        current.status = current.status === 'carrier' ? 'unaffected' : 'carrier';
        pushHistory('Toggle Carrier Status');
        sfx.click();
        renderCanvas();
        updateInspector();
        runGeneticsAnalysis();
      }
    });

    document.getElementById('qbtn-toggle-proband')?.addEventListener('click', () => {
      const current = getSelectedMember();
      if (current) {
        if (!current.proband) {
          state.members.forEach(m => m.proband = false);
        }
        current.proband = !current.proband;
        pushHistory('Toggle Proband');
        sfx.click();
        renderCanvas();
        updateInspector();
        runGeneticsAnalysis();
      }
    });

    document.getElementById('qbtn-delete')?.addEventListener('click', () => deleteSelectedMember());

    // Quick presets inside palette footer
    document.getElementById('btn-quick-cf-insert')?.addEventListener('click', () => loadTemplate('cf-standard'));
    document.getElementById('btn-quick-hd-insert')?.addEventListener('click', () => loadTemplate('hd-standard'));
  }

  function startConnectMode(type) {
    if (!state.selectedMemberId) {
      alert('Please select an individual on the canvas first to connect from.');
      return;
    }
    state.connectMode = { type, sourceId: state.selectedMemberId };
    announce(`Connect mode active: Click a second individual to create ${type} line.`);
  }

  function handleConnectClick(targetMember) {
    if (!state.connectMode || !state.connectMode.sourceId) return;
    const sourceId = state.connectMode.sourceId;
    if (sourceId === targetMember.id) {
      state.connectMode = null;
      return;
    }

    const matingId = 'r_' + Date.now();
    state.matings.push({
      id: matingId,
      type: state.connectMode.type,
      p1: sourceId,
      p2: targetMember.id,
      children: []
    });

    pushHistory(`Connect (${state.connectMode.type})`);
    sfx.connect();
    state.connectMode = null;
    renderCanvas();
    runGeneticsAnalysis();
  }

  // =========================================================================
  // AUTO-LAYOUT ALGORITHM
  // =========================================================================
  function autoLayoutPedigree() {
    if (state.members.length === 0) return;

    // Group by generation
    const genGroups = { 1: [], 2: [], 3: [], 4: [] };
    state.members.forEach(m => {
      const g = m.gen || 1;
      if (!genGroups[g]) genGroups[g] = [];
      genGroups[g].push(m);
    });

    // Space evenly across X
    const canvasCenterX = 480;
    const spacing = 110;

    Object.keys(genGroups).forEach(g => {
      const membersInGen = genGroups[g];
      if (membersInGen.length === 0) return;

      const totalWidth = (membersInGen.length - 1) * spacing;
      const startX = canvasCenterX - totalWidth / 2;

      membersInGen.forEach((m, idx) => {
        m.x = Math.round(startX + idx * spacing);
        m.y = DEFAULT_GEN_Y[g];
      });
    });

    pushHistory('Auto Layout Pedigree');
    sfx.click();
    renderCanvas();
    announce('Pedigree automatically aligned by generation and family tiers.');
  }

  // =========================================================================
  // GENETIC INHERITANCE ANALYSIS ENGINE
  // =========================================================================
  function runGeneticsAnalysis() {
    const summaryBadge = document.getElementById('diagnostic-summary-badge');
    const scoreAr = document.getElementById('score-ar');
    const scoreAd = document.getElementById('score-ad');
    const barAr = document.getElementById('bar-ar');
    const barAd = document.getElementById('bar-ad');
    const cluesAr = document.getElementById('clues-ar');
    const cluesAd = document.getElementById('clues-ad');
    const checkList = document.getElementById('clinical-check-list');

    const proband = state.members.find(m => m.proband);
    const affectedMembers = state.members.filter(m => m.status === 'affected');
    const carrierMembers = state.members.filter(m => m.status === 'carrier');
    const totalMembers = state.members.length;

    // Proband display
    const probandDisplay = document.getElementById('risk-proband-name');
    if (probandDisplay) {
      if (proband) {
        probandDisplay.textContent = `${proband.name || proband.clinicalId || 'Consultand'} (${proband.clinicalId}, ${proband.sex === 'female' ? '♀' : '♂'})`;
      } else {
        probandDisplay.textContent = 'None Specified (Click person & mark Proband)';
      }
    }

    if (totalMembers === 0) {
      if (summaryBadge) summaryBadge.textContent = 'Canvas is empty';
      return;
    }

    let arScore = 50;
    let adScore = 50;
    let cluesArText = [];
    let cluesAdText = [];

    // Check 1: Carriers presence
    if (carrierMembers.length > 0) {
      arScore += 30;
      adScore -= 30;
      cluesArText.push('Heterozygous carriers present (indicative of recessive inheritance).');
      cluesAdText.push('Autosomal dominant conditions typically do not have unaffected carriers.');
    }

    // Check 2: Affected children with unaffected parents (Skipping generations)
    let skippedGen = false;
    let parentToChildDirect = false;

    state.matings.forEach(m => {
      const p1 = state.members.find(mem => mem.id === m.p1);
      const p2 = state.members.find(mem => mem.id === m.p2);
      if (!p1 || !p2) return;

      const p1Aff = p1.status === 'affected';
      const p2Aff = p2.status === 'affected';
      const anyChildAff = m.children.some(cid => {
        const c = state.members.find(mem => mem.id === cid);
        return c && c.status === 'affected';
      });

      if (!p1Aff && !p2Aff && anyChildAff) {
        skippedGen = true;
      }

      if ((p1Aff || p2Aff) && anyChildAff) {
        parentToChildDirect = true;
      }
    });

    if (skippedGen) {
      arScore += 30;
      adScore -= 40;
      cluesArText.push('Generation skipped: Unaffected parents produced affected offspring (classic recessive).');
      cluesAdText.push('Direct violation of standard dominant inheritance (affected child without affected parent).');
    }

    if (parentToChildDirect && !skippedGen && carrierMembers.length === 0) {
      adScore += 35;
      arScore -= 20;
      cluesAdText.push('Vertical transmission observed: Every affected child has an affected parent.');
      cluesArText.push('Consecutive generations affected with equal sex distribution.');
    }

    // Check 3: Consanguinity
    const hasConsanguinity = state.matings.some(m => m.type === 'consanguinity');
    if (hasConsanguinity) {
      arScore += 15;
      cluesArText.push('Consanguineous union (double line) exponentially elevates recessive disease probability.');
    }

    // Clamp scores
    arScore = Math.min(98, Math.max(5, arScore));
    adScore = Math.min(98, Math.max(5, adScore));

    if (scoreAr && barAr) {
      barAr.style.width = `${arScore}%`;
      scoreAr.textContent = arScore >= 70 ? 'High Compatibility' : (arScore >= 40 ? 'Moderate' : 'Unlikely');
      scoreAr.className = `pattern-probability ${arScore >= 70 ? 'prob-high' : 'prob-low'}`;
      cluesAr.textContent = cluesArText.join(' ') || 'Insufficient generational markers to confirm.';
    }

    if (scoreAd && barAd) {
      barAd.style.width = `${adScore}%`;
      scoreAd.textContent = adScore >= 70 ? 'High Compatibility' : (adScore >= 40 ? 'Moderate' : 'Unlikely');
      scoreAd.className = `pattern-probability ${adScore >= 70 ? 'prob-high' : 'prob-low'}`;
      cluesAd.textContent = cluesAdText.join(' ') || 'Insufficient vertical transmission markers.';
    }

    // Mode determination
    const primaryMode = arScore > adScore ? 'Autosomal Recessive' : 'Autosomal Dominant';
    if (summaryBadge) {
      summaryBadge.textContent = `${primaryMode} Pattern Detected`;
      summaryBadge.className = `badge-status-neutral ${primaryMode === 'Autosomal Recessive' ? 'cf-pill' : 'hd-pill'}`;
    }

    const modeBadge = document.getElementById('risk-mode-badge');
    if (modeBadge) modeBadge.textContent = primaryMode;

    // Recurrence Risk Calculation for Proband / Consultand
    const oddsAff = document.getElementById('odds-affected');
    const oddsCar = document.getElementById('odds-carrier');
    const oddsWt = document.getElementById('odds-wildtype');

    if (primaryMode === 'Autosomal Recessive') {
      if (oddsAff) oddsAff.textContent = '25%';
      if (oddsCar) oddsCar.textContent = '50%';
      if (oddsWt) oddsWt.textContent = '25%';
    } else {
      if (oddsAff) oddsAff.textContent = '50%';
      if (oddsCar) oddsCar.textContent = '0%';
      if (oddsWt) oddsWt.textContent = '50%';
    }

    // Update Clinical Checklist
    if (checkList) {
      checkList.innerHTML = `
        <li class="check-item ${proband ? 'check-pass' : 'check-warn'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon ${proband ? 'pass' : 'warn'}">
            ${proband ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
          </svg>
          <span>${proband ? 'Proband clearly indicated with clinical arrow (↗ P).' : 'No Proband designated (select an index case).'}</span>
        </li>
        <li class="check-item check-pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon pass"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Generational notation (I, II, III) numbered sequentially.</span>
        </li>
        <li class="check-item ${hasConsanguinity ? 'check-warn' : 'check-info'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon ${hasConsanguinity ? 'warn' : 'info'}"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <span>${hasConsanguinity ? 'Consanguineous union (double line) present in pedigree.' : 'No consanguineous unions detected.'}</span>
        </li>
      `;
    }
  }

  // =========================================================================
  // CASE STUDY RENDERING: CYSTIC FIBROSIS & HUNTINGTON'S CHOREA
  // =========================================================================
  function renderCaseStudyFrames() {
    const cfCopy = JSON.parse(JSON.stringify(PRESETS['cf-standard']));
    computeGenIndicesForList(cfCopy.members);
    renderStaticPedigree('cf-static-frame', cfCopy);

    const hdCopy = JSON.parse(JSON.stringify(PRESETS['hd-standard']));
    computeGenIndicesForList(hdCopy.members);
    renderStaticPedigree('hd-static-frame', hdCopy);
  }

  function renderStaticPedigree(containerId, presetData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '160 50 640 400');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Connections
    const gConn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    presetData.matings.forEach(mating => {
      const p1 = presetData.members.find(m => m.id === mating.p1);
      const p2 = presetData.members.find(m => m.id === mating.p2);
      if (!p1 || !p2) return;

      const isConsang = mating.type === 'consanguinity';
      const leftP = p1.x <= p2.x ? p1 : p2;
      const rightP = p1.x <= p2.x ? p2 : p1;
      const half = SYMBOL_SIZE / 2;
      const y = (leftP.y + rightP.y) / 2;
      const x1 = leftP.x + half;
      const x2 = rightP.x - half;

      if (isConsang) {
        const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l1.setAttribute('x1', x1); l1.setAttribute('y1', y - 3); l1.setAttribute('x2', x2); l1.setAttribute('y2', y - 3);
        l1.setAttribute('class', 'connection-line consanguineous');
        const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l2.setAttribute('x1', x1); l2.setAttribute('y1', y + 3); l2.setAttribute('x2', x2); l2.setAttribute('y2', y + 3);
        l2.setAttribute('class', 'connection-line consanguineous');
        gConn.appendChild(l1); gConn.appendChild(l2);
      } else {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y); line.setAttribute('x2', x2); line.setAttribute('y2', y);
        line.setAttribute('class', 'connection-line');
        gConn.appendChild(line);
      }

      if (mating.children && mating.children.length > 0) {
        const children = mating.children.map(cid => presetData.members.find(m => m.id === cid)).filter(Boolean);
        const midX = (x1 + x2) / 2;
        const minChildTopY = Math.min(...children.map(c => c.y - half));
        const dropY = Math.min(minChildTopY - 20, Math.max(y + 65, Math.round((y + minChildTopY) / 2)));

        const dropLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        dropLine.setAttribute('x1', midX); dropLine.setAttribute('y1', y); dropLine.setAttribute('x2', midX); dropLine.setAttribute('y2', dropY);
        dropLine.setAttribute('class', 'connection-line');
        gConn.appendChild(dropLine);

        const minX = Math.min(...children.map(c => c.x));
        const maxX = Math.max(...children.map(c => c.x));
        const bLeft = Math.min(midX, minX);
        const bRight = Math.max(midX, maxX);

        if (children.length > 1 || minX !== midX) {
          const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          bar.setAttribute('x1', bLeft); bar.setAttribute('y1', dropY); bar.setAttribute('x2', bRight); bar.setAttribute('y2', dropY);
          bar.setAttribute('class', 'connection-line');
          gConn.appendChild(bar);
        }

        children.forEach(child => {
          const cLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          cLine.setAttribute('x1', child.x); cLine.setAttribute('y1', dropY); cLine.setAttribute('x2', child.x); cLine.setAttribute('y2', child.y - half);
          cLine.setAttribute('class', 'connection-line');
          gConn.appendChild(cLine);
        });
      }
    });

    svg.appendChild(gConn);

    // Nodes
    const gNodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    presetData.members.forEach(member => {
      const el = createMemberSvgElement(member, false);
      gNodes.appendChild(el);
    });
    svg.appendChild(gNodes);

    container.appendChild(svg);
  }

  // =========================================================================
  // CLINICAL QUIZ ENGINE
  // =========================================================================
  const QUIZ_QUESTIONS = [
    {
      id: 'q1',
      category: 'Autosomal Recessive',
      title: 'Cystic Fibrosis Recurrence Risk',
      prompt: 'David and Sarah are both asymptomatic heterozygous carriers of the <em>CFTR</em> ΔF508 mutation (wt/ΔF508). They have already had one affected child (Emma). What is the probability that their next biological child will also be clinically affected with Cystic Fibrosis?',
      diagram: 'punnett-ar',
      options: [
        { letter: 'A', text: '100% (since they already have an affected child)' },
        { letter: 'B', text: '50% (1 in 2 chance)' },
        { letter: 'C', text: '25% (1 in 4 chance, independent of previous offspring)', correct: true },
        { letter: 'D', text: '0% (recessive disorders only affect one child per family)' }
      ],
      explanation: 'In autosomal recessive inheritance, each pregnancy is an independent Mendelian event with a 25% (1 in 4) probability of inheriting two mutant alleles (homozygous ΔF508/ΔF508), 50% carrier risk, and 25% homozygous normal wild-type risk.'
    },
    {
      id: 'q2',
      category: 'Symbol Nomenclature',
      title: 'Clinical Symbol Identification',
      prompt: 'In a medical genetic pedigree, what does a <strong>square symbol filled with magenta with a 45° diagonal slash</strong> represent?',
      diagram: 'symbol-deceased-affected',
      options: [
        { letter: 'A', text: 'A living unaffected female carrier' },
        { letter: 'B', text: 'A deceased male who displayed the clinical phenotype', correct: true },
        { letter: 'C', text: 'A healthy male proband initiating the clinical study' },
        { letter: 'D', text: 'A spontaneous miscarriage of unknown biological sex' }
      ],
      explanation: 'According to international clinical pedigree nomenclature: Square = Male, Shaded (Magenta) = Affected with the clinical condition, and Diagonal Slash = Deceased individual.'
    },
    {
      id: 'q3',
      category: 'Autosomal Dominant',
      title: "Huntington's Chorea Transmission Hallmarks",
      prompt: "Which of the following is a classic hallmark of Huntington's Chorea in a family pedigree?",
      diagram: 'hd-vertical',
      options: [
        { letter: 'A', text: 'Vertical transmission across consecutive generations without skipping', correct: true },
        { letter: 'B', text: 'High frequency of unaffected heterozygous carriers' },
        { letter: 'C', text: 'Transmission exclusively from mother to sons' },
        { letter: 'D', text: 'Phenotype is only expressed when both parents are affected' }
      ],
      explanation: "Huntington's Chorea is an autosomal dominant condition characterized by vertical transmission (every affected person typically has an affected parent). Unaffected carriers do not exist because individuals inheriting the expanded HTT allele (≥40 CAG repeats) develop the phenotype if they reach standard onset age."
    },
    {
      id: 'q4',
      category: 'Consanguinity',
      title: 'Double Horizontal Line Significance',
      prompt: 'In standard clinical pedigree nomenclature, what does a <strong>double horizontal line</strong> connecting two individuals signify, and what is its genetic impact?',
      diagram: 'consanguinity-line',
      options: [
        { letter: 'A', text: 'Divorce or separation; reduces genetic transmission risk' },
        { letter: 'B', text: 'Identical twins; 100% concordance' },
        { letter: 'C', text: 'Consanguinity (mating between blood relatives); significantly increases the risk of homozygous autosomal recessive disorders', correct: true },
        { letter: 'D', text: 'Adopted parents; no biological relationship' }
      ],
      explanation: 'A double horizontal line denotes consanguinity (mating between biological relatives, e.g., first or second cousins). Because blood relatives share genomic segments identical-by-descent from common ancestors, the chance that both partners carry the identical rare mutant allele (e.g. in CFTR) is substantially elevated.'
    },
    {
      id: 'q5',
      category: 'Proband Notation',
      title: 'Index Case / Proband Convention',
      prompt: 'How is the <strong>proband</strong> (the consultand or index patient who first brings the family to medical or genetic attention) designated on a pedigree?',
      diagram: 'proband-arrow',
      options: [
        { letter: 'A', text: 'An arrow pointing at the symbol, accompanied by the letter "P"', correct: true },
        { letter: 'B', text: 'A star placed in the center of the symbol' },
        { letter: 'C', text: 'Dotted outline of the symbol' },
        { letter: 'D', text: 'Roman numeral "I-1"' }
      ],
      explanation: 'The proband (or consultand) is uniquely marked by an arrow pointing towards their symbol from the lower-left, often annotated with the letter "P", identifying them as the person initiating the genetic investigation.'
    }
  ];

  let currentQuizIndex = 0;
  let quizScore = 0;
  let userAnswers = {};

  function initQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    userAnswers = {};
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    if (!q) return;

    document.getElementById('quiz-current-num').textContent = String(currentQuizIndex + 1);
    document.getElementById('quiz-total-num').textContent = String(QUIZ_QUESTIONS.length);
    document.getElementById('quiz-progress-fill').style.width = `${((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`;

    document.getElementById('quiz-category-badge').textContent = q.category;
    document.getElementById('quiz-question-title').textContent = q.title;
    document.getElementById('quiz-question-prompt').innerHTML = q.prompt;

    // Render Quiz Diagram
    renderQuizDiagram(q.diagram);

    // Options
    const optionsGrid = document.getElementById('quiz-options-grid');
    optionsGrid.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `
        <span class="quiz-opt-letter">${opt.letter}</span>
        <span class="quiz-opt-text">${opt.text}</span>
      `;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        userAnswers[currentQuizIndex] = idx;
        document.getElementById('btn-quiz-check').disabled = false;
        sfx.select();
      });

      optionsGrid.appendChild(btn);
    });

    // Reset feedback & controls
    const feedbackBox = document.getElementById('quiz-feedback-box');
    feedbackBox.className = 'quiz-feedback-box hidden';

    document.getElementById('btn-quiz-check').classList.remove('hidden');
    document.getElementById('btn-quiz-check').disabled = true;
    document.getElementById('btn-quiz-next').classList.add('hidden');
    document.getElementById('btn-quiz-prev').disabled = currentQuizIndex === 0;

    document.getElementById('quiz-card').classList.remove('hidden');
    document.getElementById('quiz-results-card').classList.add('hidden');
  }

  function renderQuizDiagram(diagramType) {
    const frame = document.getElementById('quiz-diagram-frame');
    if (!frame) return;
    frame.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 400 180');

    if (diagramType === 'punnett-ar') {
      // Punnett square schematic
      svg.innerHTML = `
        <rect x="70" y="30" width="260" height="120" rx="6" fill="var(--bg-card)" stroke="var(--border-card)" stroke-width="2"/>
        <line x1="200" y1="30" x2="200" y2="150" stroke="var(--border-card)" stroke-width="2"/>
        <line x1="70" y1="90" x2="330" y2="90" stroke="var(--border-card)" stroke-width="2"/>
        <text x="135" y="68" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">wt / wt</text>
        <text x="265" y="68" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">wt / ΔF508</text>
        <text x="135" y="128" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">wt / ΔF508</text>
        <rect x="201" y="91" width="128" height="58" rx="0" fill="rgba(216, 0, 166, 0.25)"/>
        <text x="265" y="128" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--sym-magenta)">ΔF508 / ΔF508</text>
        <text x="200" y="20" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--text-muted)">Carrier Mother (wt / ΔF508)</text>
      `;
    } else if (diagramType === 'symbol-deceased-affected') {
      svg.innerHTML = `
        <g transform="translate(200, 90)">
          <rect x="-30" y="-30" width="60" height="60" class="sym-shape sym-affected"/>
          <line x1="-42" y1="42" x2="42" y2="-42" class="sym-slash"/>
        </g>
      `;
    } else if (diagramType === 'hd-vertical') {
      svg.innerHTML = `
        <g transform="translate(140, 50)">
          <rect x="-18" y="-18" width="36" height="36" class="sym-shape sym-affected"/>
          <line x1="18" y1="0" x2="62" y2="0" stroke="var(--sym-line-color)" stroke-width="2"/>
          <circle cx="80" cy="0" r="18" class="sym-shape sym-unshaded"/>
          <line x1="40" y1="0" x2="40" y2="40" stroke="var(--sym-line-color)" stroke-width="2"/>
          <circle cx="40" cy="65" r="18" class="sym-shape sym-affected"/>
        </g>
        <text x="280" y="60" font-size="12" font-weight="bold" fill="var(--text-primary)">Generation I (Affected Father)</text>
        <text x="280" y="115" font-size="12" font-weight="bold" fill="var(--text-primary)">Generation II (Affected Daughter)</text>
      `;
    } else if (diagramType === 'consanguinity-line') {
      svg.innerHTML = `
        <g transform="translate(200, 90)">
          <rect x="-60" y="-20" width="40" height="40" class="sym-shape sym-unshaded"/>
          <line x1="-20" y1="-5" x2="20" y2="-5" class="connection-line consanguineous"/>
          <line x1="-20" y1="5" x2="20" y2="5" class="connection-line consanguineous"/>
          <circle cx="40" cy="0" r="20" class="sym-shape sym-unshaded"/>
        </g>
      `;
    } else if (diagramType === 'proband-arrow') {
      svg.innerHTML = `
        <g transform="translate(200, 90)">
          <circle cx="20" cy="-10" r="24" class="sym-shape sym-unshaded"/>
          <path d="M -30 35 L -4 12 M -18 12 L -4 12 L -4 26" class="sym-arrow" stroke-width="3"/>
          <text x="-44" y="44" class="sym-p-text" font-size="16">P</text>
        </g>
      `;
    }

    frame.appendChild(svg);
  }

  function checkQuizAnswer() {
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    const selectedIdx = userAnswers[currentQuizIndex];
    if (selectedIdx === undefined) return;

    const isCorrect = q.options[selectedIdx].correct === true;
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    if (isCorrect) {
      quizScore++;
      sfx.success();
      feedbackBox.className = 'quiz-feedback-box correct';
      feedbackIcon.textContent = '✓';
      feedbackTitle.textContent = 'Correct!';
    } else {
      sfx.error();
      feedbackBox.className = 'quiz-feedback-box incorrect';
      feedbackIcon.textContent = '✕';
      feedbackTitle.textContent = 'Incorrect';
    }

    feedbackExplanation.textContent = q.explanation;
    feedbackBox.classList.remove('hidden');

    // Highlight options
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (q.options[idx].correct) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('wrong');
      }
    });

    document.getElementById('btn-quiz-check').classList.add('hidden');
    document.getElementById('btn-quiz-next').classList.remove('hidden');
  }

  function showQuizResults() {
    document.getElementById('quiz-card').classList.add('hidden');
    const resultsCard = document.getElementById('quiz-results-card');
    resultsCard.classList.remove('hidden');

    document.getElementById('final-score').textContent = `${quizScore} / ${QUIZ_QUESTIONS.length}`;
    const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
    document.getElementById('final-percent').textContent = `${pct}% Score`;

    const narrative = document.getElementById('results-narrative');
    if (quizScore === QUIZ_QUESTIONS.length) {
      narrative.textContent = 'Perfect score! You have achieved complete clinical mastery of standard pedigree nomenclature and Mendelian risk evaluation.';
      sfx.success();
    } else if (quizScore >= 3) {
      narrative.textContent = 'Strong clinical comprehension. Review the Cystic Fibrosis (autosomal recessive) and Huntington\'s (autosomal dominant) case studies to solidify your understanding.';
    } else {
      narrative.textContent = 'Review the Standard Clinical Pedigree Nomenclature Guide to become familiar with international symbols and inheritance rules.';
    }
  }

  // =========================================================================
  // EXPORT & IMPORT MODULE
  // =========================================================================
  function exportSvg() {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgCanvas);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedigree-chart-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.click();
    announce('Pedigree exported as SVG vector file');
  }

  function exportPng() {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgCanvas);
    const canvas = document.createElement('canvas');
    canvas.width = svgCanvas.clientWidth * 2 || 1920;
    canvas.height = svgCanvas.clientHeight * 2 || 1080;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#0f172a'; // Match background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `pedigree-chart-${Date.now()}.png`;
      a.click();
      sfx.click();
      announce('Pedigree exported as PNG image');
    };
    img.src = url;
  }

  function exportJson() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      members: state.members,
      matings: state.matings
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedigree-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.click();
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.members) && Array.isArray(data.matings)) {
          state.members = data.members;
          state.matings = data.matings;
          pushHistory('Import JSON');
          renderCanvas();
          updateInspector();
          runGeneticsAnalysis();
          sfx.success();
          announce('Pedigree data successfully imported');
        } else {
          alert('Invalid pedigree JSON schema.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // APP NAVIGATION & TAB SWITCHING
  // =========================================================================
  function initTabs() {
    const tabs = [
      { btnId: 'tab-builder', viewId: 'view-builder' },
      { btnId: 'tab-cf', viewId: 'view-cf' },
      { btnId: 'tab-hd', viewId: 'view-hd' },
      { btnId: 'tab-quiz', viewId: 'view-quiz' }
    ];

    tabs.forEach(tab => {
      const btn = document.getElementById(tab.btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        tabs.forEach(t => {
          const b = document.getElementById(t.btnId);
          const v = document.getElementById(t.viewId);
          if (b && v) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
            v.classList.remove('active');
            v.hidden = true;
          }
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const activeView = document.getElementById(tab.viewId);
        if (activeView) {
          activeView.classList.add('active');
          activeView.hidden = false;
        }

        sfx.click();
        if (tab.viewId === 'view-builder') {
          renderCanvas();
        } else if (tab.viewId === 'view-quiz') {
          initQuiz();
        }
      });
    });
  }

  // =========================================================================
  // LOAD TEMPLATES
  // =========================================================================
  function loadTemplate(key) {
    const preset = PRESETS[key];
    if (!preset) return;

    state.members = JSON.parse(JSON.stringify(preset.members));
    state.matings = JSON.parse(JSON.stringify(preset.matings));
    state.selectedMemberId = null;

    pushHistory(`Load ${preset.title}`);
    resetView();
    renderCanvas();
    updateInspector();
    runGeneticsAnalysis();
    sfx.connect();
    announce(`Loaded template: ${preset.title}`);
  }

  // =========================================================================
  // GLOBAL EVENT LISTENERS & INITIALIZATION
  // =========================================================================
  function init() {
    // 1. Theme Toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    const sunIcon = document.getElementById('icon-sun');
    const moonIcon = document.getElementById('icon-moon');

    themeBtn?.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      sunIcon.classList.toggle('hidden', newTheme === 'dark');
      moonIcon.classList.toggle('hidden', newTheme === 'light');
      sfx.click();
      renderCanvas();
    });

    // 2. Sound Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    const soundOn = document.getElementById('icon-sound-on');
    const soundOff = document.getElementById('icon-sound-off');

    soundBtn?.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      soundOn.classList.toggle('hidden', !sfx.enabled);
      soundOff.classList.toggle('hidden', sfx.enabled);
      if (sfx.enabled) sfx.click();
    });

    // 3. Nomenclature Modal
    const btnNomen = document.getElementById('btn-open-nomenclature');
    const modalNomen = document.getElementById('modal-nomenclature');
    btnNomen?.addEventListener('click', () => {
      modalNomen.showModal();
      sfx.click();
    });

    // 4. Template Selector
    document.getElementById('btn-load-template')?.addEventListener('click', () => {
      const val = templateSelect.value;
      loadTemplate(val);
    });

    // 5. Auto Layout Button
    document.getElementById('btn-auto-layout')?.addEventListener('click', () => autoLayoutPedigree());

    // 6. Carrier Style Toggle
    const btnHalf = document.getElementById('carrier-style-half');
    const btnDot = document.getElementById('carrier-style-dot');

    btnHalf?.addEventListener('click', () => {
      state.carrierStyleGlobal = 'half';
      btnHalf.classList.add('active');
      btnHalf.setAttribute('aria-checked', 'true');
      btnDot.classList.remove('active');
      btnDot.setAttribute('aria-checked', 'false');
      sfx.click();
      renderCanvas();
    });

    btnDot?.addEventListener('click', () => {
      state.carrierStyleGlobal = 'dot';
      btnDot.classList.add('active');
      btnDot.setAttribute('aria-checked', 'true');
      btnHalf.classList.remove('active');
      btnHalf.setAttribute('aria-checked', 'false');
      sfx.click();
      renderCanvas();
    });

    // 7. Undo / Redo
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-redo')?.addEventListener('click', redo);

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    });

    // 8. Export Menu
    const btnExportMenu = document.getElementById('btn-export-menu');
    const exportMenu = document.getElementById('export-menu');

    btnExportMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('hidden');
    });

    window.addEventListener('click', () => {
      exportMenu?.classList.add('hidden');
    });

    document.getElementById('btn-export-svg')?.addEventListener('click', exportSvg);
    document.getElementById('btn-export-png')?.addEventListener('click', exportPng);
    document.getElementById('btn-export-json')?.addEventListener('click', exportJson);
    document.getElementById('btn-print-pedigree')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('input-import-json')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJson(e.target.files[0]);
      }
    });

    // 9. Analysis Drawer Toggle
    const drawerHeader = document.getElementById('drawer-toggle');
    const analysisDrawer = document.getElementById('analysis-drawer');
    drawerHeader?.addEventListener('click', () => {
      analysisDrawer.classList.toggle('minimized');
      sfx.click();
    });

    document.getElementById('btn-analyze-inheritance')?.addEventListener('click', () => {
      analysisDrawer.classList.remove('minimized');
      runGeneticsAnalysis();
      sfx.click();
    });

    // 10. Case Study "Open in Builder" Buttons
    document.getElementById('btn-load-cf-into-builder')?.addEventListener('click', () => {
      loadTemplate('cf-standard');
      document.getElementById('tab-builder').click();
    });

    document.getElementById('btn-load-hd-into-builder')?.addEventListener('click', () => {
      loadTemplate('hd-standard');
      document.getElementById('tab-builder').click();
    });

    document.getElementById('btn-demo-cf-consanguinity')?.addEventListener('click', () => {
      loadTemplate('cf-consanguinity');
      document.getElementById('tab-builder').click();
    });

    // 11. Quiz Navigation Buttons
    document.getElementById('btn-quiz-check')?.addEventListener('click', checkQuizAnswer);
    document.getElementById('btn-quiz-next')?.addEventListener('click', () => {
      if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
        currentQuizIndex++;
        renderQuizQuestion();
        sfx.click();
      } else {
        showQuizResults();
      }
    });

    document.getElementById('btn-quiz-prev')?.addEventListener('click', () => {
      if (currentQuizIndex > 0) {
        currentQuizIndex--;
        renderQuizQuestion();
        sfx.click();
      }
    });

    document.getElementById('btn-restart-quiz')?.addEventListener('click', () => {
      initQuiz();
      sfx.click();
    });

    document.getElementById('btn-goto-builder-from-quiz')?.addEventListener('click', () => {
      document.getElementById('tab-builder').click();
    });

    // 12. Interactive Punnett & CAG Explorers
    const punnettCells = document.querySelectorAll('.punnett-cell');
    const punnettDesc = document.querySelector('.punnett-desc');
    const punnettDetails = {
      'normal': 'wt / wt (25%): Unaffected non-carrier. Inherited normal CFTR gene from both parents. Cannot transmit CF mutation to children.',
      'carrier': 'wt / ΔF508 (50%): Asymptomatic heterozygous carrier. Has one functional CFTR allele producing sufficient chloride channels to prevent symptoms, but carries a 50% probability of passing mutant allele to offspring.',
      'affected': 'ΔF508 / ΔF508 (25%): Affected with Cystic Fibrosis. Inherited ΔF508 deletion from both David and Sarah. Displays clinical phenotype of sweat chloride >60 mmol/L and mucous obstruction (Emma\'s genotype).'
    };
    punnettCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const pheno = cell.getAttribute('data-phenotype');
        if (punnettDesc && punnettDetails[pheno]) {
          punnettDesc.innerHTML = `<strong>Selected Quadrant:</strong> ${punnettDetails[pheno]}`;
          punnettDesc.style.color = pheno === 'affected' ? 'var(--sym-magenta)' : 'var(--text-primary)';
          sfx.select();
        }
      });
    });

    const cagSegments = document.querySelectorAll('.cag-segment');
    const cagPointerTag = document.querySelector('.cag-pointer-tag');
    const cagDetails = {
      'Normal (Unaffected)': 'Normal allele (10-26 CAG repeats): Stable HTT protein function. No choreiform symptoms. No risk of transmission to offspring.',
      'Intermediate (Normal)': 'Intermediate allele (27-35 CAG repeats): Asymptomatic individual, but repeat tract is unstable and can expand during spermatogenesis into disease range for the next generation.',
      'Reduced Penetrance': 'Reduced Penetrance (36-39 CAG repeats): Symptoms may develop late in life, or individual may remain symptom-free throughout normal lifespan. 50% transmission risk.',
      'Full Penetrance (Affected)': 'Full Penetrance (40-120+ CAG repeats): 100% of individuals develop chorea, cognitive decline, and psychiatric changes if they reach age of onset. Claire (Mother, 44 CAG) and Julian (Brother, 43 CAG) carry full penetrance alleles.'
    };
    cagSegments.forEach(seg => {
      seg.style.cursor = 'pointer';
      seg.addEventListener('click', () => {
        const segName = seg.querySelector('.cag-name')?.textContent;
        if (cagPointerTag && cagDetails[segName]) {
          cagPointerTag.innerHTML = `<strong>${segName}:</strong> ${cagDetails[segName]}`;
          sfx.select();
        }
      });
    });

    // 13. Initialize Systems
    initTabs();
    initInspectorEvents();
    initPaletteAndQuickBar();
    renderCaseStudyFrames();

    // Default Load Cystic Fibrosis Standard Pedigree into Builder
    loadTemplate('cf-standard');
  }

  // Boot Application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
