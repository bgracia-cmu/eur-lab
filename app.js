(function () {
  const $ = (s) => document.querySelector(s);
  const VF = Vex.Flow;
  const BT = VF.BarlineType || VF.Barline.type;

  // ---------- Rhythm data ----------
  const LISTS = [
    { id: 'L1', name: 'Binary List 1', sub: 'Beat divisions', desc: 'One beat split into 1, 2, 3 or 4 notes, plus the half note.' },
    { id: 'L2', name: 'Binary List 2', sub: 'Two-beat long–short patterns', desc: 'Dotted quarter and eighth combinations, including the syncopated eighth–quarter–eighth.' },
    { id: 'A2', name: 'Binary List 2 (Alternate)', sub: 'Binary List 2 with sixteenths', desc: 'The Binary List 2 patterns with each eighth note replaced by two sixteenths.' },
    { id: 'L3', name: 'Binary List 3', sub: 'One-beat sixteenth figures', desc: 'Eighth and sixteenth combinations inside one beat, including dotted-eighth rhythms.' },
    { id: 'T1', name: 'Ternary List 1', sub: 'Compound meters (6/8 to 15/8)', desc: 'One dotted-quarter beat split into eighths and sixteenths, plus the dotted half.', ternary: true }
  ];
  // Ternary lists are for compound meters (6/8, 9/8, 12/8, 15/8), binary lists for x/4.
  const isTernary = function (listId) { return LISTS.some(function (L) { return L.id === listId && L.ternary; }); };
  const T3 = 1 / 3;
  const n = (d, vf, dots) => ({ d: d, vf: vf, dots: dots || 0 });
  const Q = () => n(1, 'q'), E = () => n(0.5, '8'), X = () => n(0.25, '16');
  const QD = () => n(1.5, 'q', 1), ED = () => n(0.75, '8', 1);
  const TE = () => n(1 / 3, '8'), TS = () => n(1 / 6, '16');   // eighth and sixteenth in compound time

  const CELLS = [
    { id: 'q', list: 'L1', name: 'Quarter note', notes: [Q()] },
    { id: 'ee', list: 'L1', name: 'Two eighths', notes: [E(), E()], beams: [[0, 1]] },
    { id: 'trip', list: 'L1', name: 'Eighth-note triplet', notes: [n(T3, '8'), n(T3, '8'), n(T3, '8')], beams: [[0, 1, 2]], tuplet: [0, 1, 2] },
    { id: 'ssss', list: 'L1', name: 'Four sixteenths', notes: [X(), X(), X(), X()], beams: [[0, 1, 2, 3]] },
    { id: 'h', list: 'L1', name: 'Half note', notes: [n(2, 'h')] },

    { id: 'qd-e', list: 'L2', name: 'Dotted quarter, eighth', notes: [QD(), E()] },
    { id: 'e-qd', list: 'L2', name: 'Eighth, dotted quarter', notes: [E(), QD()] },
    { id: 'e-q-e', list: 'L2', name: 'Eighth, quarter, eighth', notes: [E(), Q(), E()] },

    { id: 'qd-ss', list: 'A2', name: 'Dotted quarter, two sixteenths', notes: [QD(), X(), X()], beams: [[1, 2]] },
    { id: 'ss-qd', list: 'A2', name: 'Two sixteenths, dotted quarter', notes: [X(), X(), QD()], beams: [[0, 1]] },
    { id: 'e-q-ss', list: 'A2', name: 'Eighth, quarter, two sixteenths', notes: [E(), Q(), X(), X()], beams: [[2, 3]] },
    { id: 'ss-q-e', list: 'A2', name: 'Two sixteenths, quarter, eighth', notes: [X(), X(), Q(), E()], beams: [[0, 1]] },
    { id: 'ss-q-ss', list: 'A2', name: 'Two sixteenths, quarter, two sixteenths', notes: [X(), X(), Q(), X(), X()], beams: [[0, 1], [3, 4]] },

    { id: 'e-ss', list: 'L3', name: 'Eighth, two sixteenths', notes: [E(), X(), X()], beams: [[0, 1, 2]] },
    { id: 'ss-e', list: 'L3', name: 'Two sixteenths, eighth', notes: [X(), X(), E()], beams: [[0, 1, 2]] },
    { id: 's-e-s', list: 'L3', name: 'Sixteenth, eighth, sixteenth', notes: [X(), E(), X()], beams: [[0, 1, 2]] },
    { id: 'ed-s', list: 'L3', name: 'Dotted eighth, sixteenth', notes: [ED(), X()], beams: [[0, 1]] },
    { id: 's-ed', list: 'L3', name: 'Sixteenth, dotted eighth', notes: [X(), ED()], beams: [[0, 1]] },

    // Ternary List 1. In compound time the beat is a dotted quarter, so durations are in those
    // beats: eighth = 1/3, sixteenth = 1/6, quarter = 2/3, dotted half = 2.
    { id: 't-dq', list: 'T1', name: 'Dotted quarter', notes: [n(1, 'q', 1)] },
    { id: 't-eee', list: 'T1', name: 'Three eighths', notes: [TE(), TE(), TE()], beams: [[0, 1, 2]] },
    { id: 't-q-e', list: 'T1', name: 'Quarter, eighth', notes: [n(2 / 3, 'q'), TE()] },
    { id: 't-e-q', list: 'T1', name: 'Eighth, quarter', notes: [TE(), n(2 / 3, 'q')] },
    { id: 't-ss-e-e', list: 'T1', name: 'Two sixteenths, two eighths', notes: [TS(), TS(), TE(), TE()], beams: [[0, 1, 2, 3]] },
    { id: 't-e-ss-e', list: 'T1', name: 'Eighth, two sixteenths, eighth', notes: [TE(), TS(), TS(), TE()], beams: [[0, 1, 2, 3]] },
    { id: 't-e-e-ss', list: 'T1', name: 'Two eighths, two sixteenths', notes: [TE(), TE(), TS(), TS()], beams: [[0, 1, 2, 3]] },
    { id: 't-ssss-e', list: 'T1', name: 'Four sixteenths, eighth', notes: [TS(), TS(), TS(), TS(), TE()], beams: [[0, 1, 2, 3, 4]] },
    { id: 't-ss-e-ss', list: 'T1', name: 'Two sixteenths, eighth, two sixteenths', notes: [TS(), TS(), TE(), TS(), TS()], beams: [[0, 1, 2, 3, 4]] },
    { id: 't-e-ssss', list: 'T1', name: 'Eighth, four sixteenths', notes: [TE(), TS(), TS(), TS(), TS()], beams: [[0, 1, 2, 3, 4]] },
    { id: 't-s6', list: 'T1', name: 'Six sixteenths', notes: [TS(), TS(), TS(), TS(), TS(), TS()], beams: [[0, 1, 2, 3, 4, 5]] },
    { id: 't-hd', list: 'T1', name: 'Dotted half', notes: [n(2, 'h', 1)] }
  ];
  CELLS.forEach(function (c) {
    c.beams = c.beams || [];
    c.beats = Math.round(c.notes.reduce(function (a, x) { return a + x.d; }, 0) * 12) / 12;
    c.ternary = isTernary(c.list);
  });
  const QUARTER = CELLS[0];
  const DOTTED_QUARTER = CELLS.filter(function (c) { return c.id === 't-dq'; })[0];
  // The meter as written: 4 beats is 4/4 in simple time, 12/8 in compound time
  const meterLabel = function (bpb, ternary) { return ternary ? (bpb * 3) + '/8' : bpb + '/4'; };

  // Count syllable for a position measured in beats from the bar (or cell) start
  // Compound time (ternary): 1 & a on the eighths, 1 ta & ta a ta on the sixteenths.
  function syllable(p, ternary) {
    const b = Math.floor(p + 1e-6);
    const f = p - b;
    const near = function (x) { return Math.abs(f - x) < 1e-3; };
    if (ternary) {
      const k = Math.round(f * 6);
      return [String(b + 1), 'ta', '&', 'ta', 'a', 'ta'][k] || '·';
    }
    let txt = '·';
    if (near(0)) txt = String(b + 1);
    else if (near(0.25)) txt = 'e';
    else if (near(0.5)) txt = '&';
    else if (near(0.75)) txt = 'a';
    else if (near(T3)) txt = '&';
    else if (near(2 * T3)) txt = 'a';
    return txt;
  }
  // Metric weight of a position in the bar: downbeat 1, other beats 0.55, & 0.28, e / a / triplet notes 0.15
  function metricWeight(pib, ternary) {
    const b = Math.floor(pib + 1e-6);
    const f = pib - b;
    if (f < 1e-3 && b === 0) return 1;
    if (f < 1e-3) return 0.55;
    if (ternary) return Math.abs(f * 3 - Math.round(f * 3)) < 1e-3 ? 0.28 : 0.15;   // eighths, then sixteenths
    if (Math.abs(f - 0.5) < 1e-3) return 0.28;
    return 0.15;
  }
  // Metronome clicks per beat. The ÷ setting is 1, 2 or 4 (beats, eighths, sixteenths in x/4);
  // in compound time the same choices click dotted quarters, eighths (3) and sixteenths (6).
  function clicksPerBeat(ternary) {
    const sub = S.sub || 1;
    return ternary ? (sub === 4 ? 6 : (sub === 2 ? 3 : 1)) : sub;
  }
  function cellCounts(cell) {
    let p = 0;
    const parts = [];
    cell.notes.forEach(function (nt) { parts.push(syllable(p, cell.ternary)); p += nt.d; });
    return parts.join(' ');
  }

  // ---------- Follow (and colours) ----------
  // Gold always means notes, blue always means metronome. Each feature chooses what it follows:
  //   staff    - the 1 e & a / pulse / circle / underline highlights glow on notes (gold) or clicks (blue)
  //   ball     - off, note ball (gold), metronome ball (blue) or both
  //   playhead - off, or pulses on notes or clicks (always drawn in black)
  const FOLLOW_ROWS = [
    { id: 'staff', name: 'Staff', opts: ['notes', 'metro'] },
    { id: 'ball', name: 'Ball', opts: ['off', 'notes', 'metro', 'both'] },
    { id: 'playhead', name: 'Playhead', opts: ['off', 'notes', 'metro'] },
    { id: 'conduct', name: 'Conductor', opts: ['off', 'left', 'right', 'both'] }
  ];
  const FOLLOW_LABEL = { off: 'Off', notes: 'Notes', metro: 'Metronome', both: 'Both', left: 'Left hand', right: 'Right hand' };
  function followValue(id) {
    if (id === 'conduct') return S.conduct || 'off';
    if (id === 'staff') return S.staffFollow === 'metro' ? 'metro' : 'notes';
    if (id === 'ball') return S.tracer && S.metroBall ? 'both' : (S.tracer ? 'notes' : (S.metroBall ? 'metro' : 'off'));
    return !S.playhead ? 'off' : (S.playheadFollow === 'notes' ? 'notes' : 'metro');
  }
  function setFollow(id, v) {
    if (id === 'conduct') S.conduct = v;
    else if (id === 'staff') S.staffFollow = v;
    else if (id === 'ball') { S.tracer = v === 'notes' || v === 'both'; S.metroBall = v === 'metro' || v === 'both'; }
    else { S.playhead = v !== 'off'; if (v !== 'off') S.playheadFollow = v; }
  }
  function applyColors() {
    const root = document.documentElement.style;
    const staffBlue = S.staffFollow === 'metro';
    ['syll', 'pulse', 'ring', 'under'].forEach(function (k) { root.setProperty('--c-' + k, staffBlue ? 'var(--accent)' : 'var(--gold)'); });
    root.setProperty('--c-ring-text', staffBlue ? 'var(--on-accent)' : 'var(--on-gold)');
    root.setProperty('--c-notes', 'var(--gold)');
    root.setProperty('--c-noteball', 'var(--gold)');
    root.setProperty('--c-metroball', 'var(--accent)');
    root.setProperty('--c-playhead', 'var(--ink)');   // playhead is always black; it only follows notes or clicks for its pulse
  }

  // ---------- Settings ----------
  const DEFAULTS = {
    lists: ['L1', 'L2', 'T1'], meter: 4, ternary: false, bars: 4, ties: false, hide: false,
    bpm: 64, metro: true, sub: 1, countIn: true, loop: false,
    grid: true, pulse: false, circles: true, boxes: true, counts: false, highlight: true,
    staffFollow: 'notes', tracer: true, metroBall: false, playhead: true, playheadFollow: 'metro',
    inst: 'woodblock', volRhythm: 80, punch: true, metroSound: 'click', volMetro: 70,
    conduct: 'off', notation: 'show', aids: true, beatLines: true, beatMarks: false, runFill: false, beatColors: false, melody: false, key: 'C', legato: false, exam: false, examPlays: 3, examGap: 20
  };
  let S = Object.assign({}, DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem('eur-rhythm-settings') || 'null');
    if (saved) S = Object.assign(S, saved);
    S.counts = false;   // the counts-on-notes option was removed
    if (saved && !saved.notation) S.notation = saved.hide ? 'hidden' : (saved.reveal ? 'semi' : 'show');   // older saves
  } catch (e) { /* storage unavailable */ }
  function save() {
    try { localStorage.setItem('eur-rhythm-settings', JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  // ---------- Generation ----------
  let score = null;
  let revealed = false;
  const rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  // Flatten bars of cells into note events: pos = beats from the start, pib = beats into the bar
  // ternary: compound time (beat = dotted quarter); taken from the cells when not given
  function buildModel(bars, bpb, ternary) {
    if (ternary === undefined) {
      const first = bars.reduce(function (c, b) { return c || b.cells[0]; }, null);
      ternary = !!(first && first.ternary);
    }
    const flat = [];
    const cellStarts = [];
    let pos = 0;
    bars.forEach(function (bar, bi) {
      let pib = 0;
      bar.cells.forEach(function (cell, ci) {
        cellStarts.push(flat.length);
        cell.notes.forEach(function (nt) {
          flat.push({ bar: bi, cell: ci, pos: pos, pib: pib, d: nt.d, rest: !!nt.rest });
          pos += nt.d;
          pib += nt.d;
        });
      });
    });
    return { bpb: bpb, ternary: !!ternary, bars: bars, flat: flat, cellStarts: cellStarts, tieAfter: new Set(), total: bars.length * bpb };
  }

  function generate() {
    score = makeRhythm();
    applyMelody(score);
    revealed = false;
  }
  // Lists that apply to the current meter: binary lists in x/4, ternary lists in x/8. If none of
  // the selected lists fit the meter, its first list is used so there is always something to draw.
  function meterLists() {
    const use = S.lists.filter(function (l) { return isTernary(l) === !!S.ternary; });
    return use.length ? use : [S.ternary ? 'T1' : 'L1'];
  }
  function makeRhythm() {
    const bpb = S.meter;
    const lists = meterLists();
    const bars = [];
    let filled = false;
    for (let b = 0; b < S.bars; b++) {
      let rem = bpb;
      const cells = [];
      while (rem > 1e-6) {
        // pick a list first so each chosen list is equally likely, then a cell that fits the bar
        const options = lists
          .map(function (l) { return CELLS.filter(function (c) { return c.list === l && c.beats <= rem + 1e-6; }); })
          .filter(function (a) { return a.length; });
        let cell;
        if (options.length) {
          cell = rnd(rnd(options));
        } else {
          cell = S.ternary ? DOTTED_QUARTER : QUARTER;
          filled = true;
        }
        cells.push(cell);
        rem -= cell.beats;
      }
      bars.push({ cells: cells });
    }

    const model = buildModel(bars, bpb, !!S.ternary);
    if (S.ties) {
      const bounds = model.cellStarts.slice(1).map(function (s) { return s - 1; });
      bounds.forEach(function (i) { if (Math.random() < 0.3) model.tieAfter.add(i); });
      if (!model.tieAfter.size && bounds.length) model.tieAfter.add(rnd(bounds));
    }
    model.filled = filled;
    return model;
  }

  // ---------- Melody (pitch layer over the rhythm) ----------
  // The rhythm is generated exactly as before; a melody only adds a pitch to each note.
  // model.voices holds one voice for now ({ pitch: [...] } aligned with model.flat), so a
  // second voice (a canon, a bass line) can be added later without changing the rhythm code.
  const KEYS = {
    C:  { name: 'C major',  sig: 'C',  mode: 'major', tonic: 60, letter: 0, acc: {} },
    G:  { name: 'G major',  sig: 'G',  mode: 'major', tonic: 67, letter: 4, acc: { 3: 1 } },
    D:  { name: 'D major',  sig: 'D',  mode: 'major', tonic: 62, letter: 1, acc: { 3: 1, 0: 1 } },
    F:  { name: 'F major',  sig: 'F',  mode: 'major', tonic: 65, letter: 3, acc: { 6: -1 } },
    Bb: { name: 'B♭ major', sig: 'Bb', mode: 'major', tonic: 70, letter: 6, acc: { 6: -1, 2: -1 } },
    Am: { name: 'A minor',  sig: 'Am', mode: 'minor', tonic: 69, letter: 5, acc: {} },
    Em: { name: 'E minor',  sig: 'Em', mode: 'minor', tonic: 64, letter: 2, acc: { 3: 1 } },
    Dm: { name: 'D minor',  sig: 'Dm', mode: 'minor', tonic: 62, letter: 1, acc: { 6: -1 } },
    Gm: { name: 'G minor',  sig: 'Gm', mode: 'minor', tonic: 67, letter: 4, acc: { 6: -1, 2: -1 } }
  };
  const SCALE = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];   // C D E F G A B
  const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  const mod = function (a, n) { return ((a % n) + n) % n; };

  // scale step s (0 = tonic, 7 = tonic an octave up) -> midi; raised = minor's leading tone
  function stepMidi(key, s, raised) {
    const deg = mod(s, 7), oct = Math.floor(s / 7);
    let semis = SCALE[key.mode][deg] + 12 * oct;
    if (raised && key.mode === 'minor' && deg === 6) semis += 1;
    return key.tonic + semis;
  }

  // Harmony: chord roots as scale degrees (I=0, ii=1, IV=3, V=4, vi=5), per bar as segments.
  // Phrases of up to 4 bars; 5-8 bars split into a half cadence then an authentic cadence.
  function harmonyPlan(nBars, bpb) {
    const pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    const half = Math.max(1, Math.floor(bpb / 2));
    const phrase = function (len, end) {
      if (end === 'PAC') {
        if (len === 1) return [[{ at: 0, deg: 4 }, { at: half, deg: 0 }]];
        if (len === 2) return [[{ at: 0, deg: 0 }, { at: half, deg: 4 }], [{ at: 0, deg: 0 }]];
        if (len === 3) return [[{ at: 0, deg: 0 }], [{ at: 0, deg: pick([3, 1]) }, { at: half, deg: 4 }], [{ at: 0, deg: 0 }]];
        return [[{ at: 0, deg: 0 }], [{ at: 0, deg: pick([3, 5, 1]) }], [{ at: 0, deg: 4 }], [{ at: 0, deg: 0 }]];
      }
      if (len === 1) return [[{ at: 0, deg: 0 }, { at: half, deg: 4 }]];
      if (len === 2) return [[{ at: 0, deg: 0 }], [{ at: 0, deg: 4 }]];
      if (len === 3) return [[{ at: 0, deg: 0 }], [{ at: 0, deg: pick([3, 1]) }], [{ at: 0, deg: 4 }]];
      return [[{ at: 0, deg: 0 }], [{ at: 0, deg: pick([3, 5]) }], [{ at: 0, deg: pick([1, 3, 0]) }], [{ at: 0, deg: 4 }]];
    };
    let plan = [], cad = [];   // cad[b] = 'PAC' | 'HC' | null (the bar a cadence lands in)
    if (nBars <= 4) { plan = phrase(nBars, 'PAC'); cad = plan.map(function (_, i) { return i === nBars - 1 ? 'PAC' : null; }); }
    else {
      const a = Math.floor(nBars / 2), b = nBars - a;
      plan = phrase(a, 'HC').concat(phrase(b, 'PAC'));
      cad = plan.map(function (_, i) { return i === a - 1 ? 'HC' : (i === nBars - 1 ? 'PAC' : null); });
    }
    return { plan: plan, cad: cad };
  }

  function makeMelody(model, keyId) {
    const key = KEYS[keyId] || KEYS.C;
    const bpb = model.bpb;
    const H = harmonyPlan(model.bars.length, bpb);
    // usable steps: keep the line between C4 and A5 (treble staff, at most one ledger line)
    const steps = [];
    for (let s = -10; s <= 14; s++) { const m = stepMidi(key, s, false); if (m >= 60 && m <= 81) steps.push(s); }
    const lo = steps[0], hi = steps[steps.length - 1];
    const chordAt = function (bar, pib) {
      let deg = 0;
      H.plan[bar].forEach(function (seg) { if (pib + 1e-6 >= seg.at) deg = seg.deg; });
      return deg;
    };
    const chordTones = function (root) { return [root, root + 2, root + 4].map(function (d) { return mod(d, 7); }); };
    const nearest = function (prev, degs, maxLeap) {
      const c = [];
      for (let s = lo; s <= hi; s++) if (degs.indexOf(mod(s, 7)) >= 0 && Math.abs(s - prev) <= (maxLeap || 7)) c.push(s);
      if (!c.length) return prev;
      c.sort(function (a, b) { return Math.abs(a - prev) - Math.abs(b - prev); });
      // mostly the closest, sometimes the next closest, rarely a repeat
      const pool = c.filter(function (s) { return s !== prev; }).slice(0, 2);
      return pool.length ? pool[Math.random() < 0.7 ? 0 : pool.length - 1] : c[0];
    };
    const flat = model.flat;
    const pitch = new Array(flat.length);
    // index of each bar's first struck note, and the last struck note of each bar
    const firstInBar = {}, lastInBar = {};
    flat.forEach(function (f, i) {
      if (f.rest || model.tieAfter.has(i - 1)) return;
      if (firstInBar[f.bar] === undefined) firstInBar[f.bar] = i;
      lastInBar[f.bar] = i;
    });
    const lastBar = model.bars.length - 1;
    let prev = Math.round((lo + hi) / 2);
    prev = nearest(prev, [0, 2, 4], 3);
    let dir = 1;
    for (let i = 0; i < flat.length; i++) {
      const f = flat[i];
      if (f.rest) { pitch[i] = null; continue; }
      if (model.tieAfter.has(i - 1)) { pitch[i] = pitch[i - 1]; continue; }   // a tie keeps the pitch
      const deg = chordAt(f.bar, f.pib);
      const strong = Math.abs(f.pib - Math.round(f.pib)) < 1e-6 || i === firstInBar[f.bar];
      let s;
      if (i === firstInBar[0]) s = prev;                                                // opening: tonic-chord tone
      else if (H.cad[f.bar] === 'PAC' && i === lastInBar[f.bar]) s = nearest(prev, [0], 4);   // end on the tonic
      else if (H.cad[f.bar] === 'PAC' && i === firstInBar[f.bar] && f.bar === lastBar) s = nearest(prev, [0, 2], 4);
      else if (H.cad[f.bar] === 'HC' && i === lastInBar[f.bar]) s = nearest(prev, [4, 1, 6], 4);   // rest on V
      else if (H.cad[f.bar + 1] === 'PAC' && f.bar + 1 === lastBar && i === lastInBar[f.bar]) s = nearest(prev, [1, 6], 4);   // 2 or 7 into 1
      else if (strong) s = nearest(prev, chordTones(deg), 4);
      else {
        // weak positions: step (passing / neighbour), sometimes a chord-tone skip
        if (Math.random() < 0.25) s = nearest(prev, chordTones(deg), 2);
        else {
          if (prev + dir > hi || prev + dir < lo || Math.random() < 0.3) dir = -dir;
          s = prev + dir;
        }
      }
      s = Math.max(lo, Math.min(hi, s));
      dir = s > prev ? 1 : (s < prev ? -1 : dir);
      // minor: the 7th is raised (leading tone) over V and when it resolves up to the tonic
      const raised = key.mode === 'minor' && mod(s, 7) === 6 && (deg === 4 || H.cad[f.bar + 1] === 'PAC' || H.cad[f.bar] === 'HC');
      pitch[i] = { s: s, raised: raised };
      prev = s;
    }
    // spell each note for the staff: letter/octave, and the accidental to show (bar-by-bar)
    const out = new Array(flat.length);
    let bar = -1, shown = {};
    for (let i = 0; i < flat.length; i++) {
      if (!pitch[i]) { out[i] = null; continue; }
      if (flat[i].bar !== bar) { bar = flat[i].bar; shown = {}; }
      const midi = stepMidi(key, pitch[i].s, pitch[i].raised);
      const li = mod(key.letter + pitch[i].s, 7);
      let acc = mod(midi, 12) - NATURAL_PC[li];
      if (acc > 6) acc -= 12; if (acc < -6) acc += 12;
      const octave = (midi - acc - NATURAL_PC[li]) / 12 - 1;
      const id = LETTERS[li] + octave;
      const sigAcc = key.acc[li] || 0;
      const current = shown[id] !== undefined ? shown[id] : sigAcc;
      let glyph = null;
      if (acc !== current && !model.tieAfter.has(i - 1)) { glyph = acc === 1 ? '#' : (acc === -1 ? 'b' : 'n'); shown[id] = acc; }
      out[i] = { key: LETTERS[li] + (acc === 1 ? '#' : acc === -1 ? 'b' : '') + '/' + octave, glyph: glyph, midi: midi };
    }
    return { keyId: keyId, voices: [{ pitch: out }] };
  }
  function applyMelody(model) {
    const m = makeMelody(model, S.key);
    model.keyId = m.keyId;
    model.voices = m.voices;
  }

  // ---------- Notation ----------
  // pitch: { key: 'f#/4', glyph: '#' | 'b' | 'n' | null } for melody mode; otherwise one-line rhythm
  function makeNote(nt, label, pitch) {
    const sn = pitch
      ? new VF.StaveNote({ keys: [pitch.key], duration: nt.vf + (nt.dots ? 'd' : ''), auto_stem: true })
      : new VF.StaveNote({ keys: ['b/4'], duration: nt.vf + (nt.dots ? 'd' : '') + (nt.rest ? 'r' : ''), stem_direction: 1, auto_stem: false });
    if (pitch && pitch.glyph) sn.addModifier(new VF.Accidental(pitch.glyph), 0);
    if (nt.dots) {
      if (VF.Dot.buildAndAttach) VF.Dot.buildAndAttach([sn], { all: true });
      else sn.addModifier(new VF.Dot(), 0);
    }
    if (label) {
      const ann = new VF.Annotation(label);
      ann.setFont('DM Mono, monospace', 11);
      ann.setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
      sn.addModifier(ann, 0);
    }
    return sn;
  }
  function oneLine(stave) {
    stave.setConfigForLines([0, 1, 2, 3, 4].map(function (i) { return { visible: i === 2 }; }));
  }
  function elOf(sn) {
    let el = null;
    try { if (sn.getSVGElement) el = sn.getSVGElement(); } catch (e) { /* ignore */ }
    if (!el) { try { el = sn.getAttribute('el'); } catch (e) { /* ignore */ } }
    if (!el) { try { el = document.getElementById('vf-' + sn.getAttribute('id')); } catch (e) { /* ignore */ } }
    return el;
  }
  // Build VexFlow notes + beams + tuplets for a list of cells
  function buildCells(cells, labels, pitches) {
    const notes = [], beams = [], tuplets = [], noteBeams = [];
    let k = 0;
    cells.forEach(function (cell) {
      const cn = cell.notes.map(function (nt) {
        const sn = makeNote(nt, labels ? labels[k] : null, pitches ? pitches[k] : null);
        k++;
        return sn;
      });
      const local = cn.map(function () { return []; });
      cell.beams.forEach(function (g) {
        const bm = new VF.Beam(g.map(function (i) { return cn[i]; }), !!pitches);   // melody: beams pick stem direction
        bm.groupNotes = g.map(function (i) { return cn[i]; });
        beams.push(bm);
        g.forEach(function (i) { local[i].push(bm); });
      });
      if (cell.tuplet) tuplets.push(new VF.Tuplet(cell.tuplet.map(function (i) { return cn[i]; }), { num_notes: 3, notes_occupied: 2 }));
      cn.forEach(function (x, i) { notes.push(x); noteBeams.push(local[i]); });
    });
    return { notes: notes, beams: beams, tuplets: tuplets, noteBeams: noteBeams };
  }

  // Everything that should light up for each note: its own group, its stem
  // (beamed notes draw stems outside the note group) and any beams it belongs to.
  let beamClipId = 0;
  // claimed: stems already matched to earlier bars (bars on different rows can share an x)
  function highlightTargets(svg, built, claimed) {
    claimed = claimed || new Set();
    const loose = Array.prototype.slice.call(svg.querySelectorAll('.vf-stem'))
      .filter(function (s) { return !s.closest('.vf-stavenote') && !claimed.has(s); })
      .map(function (s) {
        const p = s.querySelector('path');
        const m = p && /M\s*([\d.\-]+)/.exec(p.getAttribute('d') || '');
        return { el: s, x: m ? parseFloat(m[1]) : NaN };
      });
    return built.notes.map(function (sn, i) {
      const out = [];
      const g = elOf(sn);
      if (g) out.push(g);
      if (g && !g.querySelector('.vf-stem')) {
        let stemEl = null;
        try { if (sn.getStem && sn.getStem()) stemEl = elOf(sn.getStem()); } catch (e) { /* ignore */ }
        if (!stemEl) {
          let sx = null;
          try { sx = sn.getStemX(); } catch (e) { /* ignore */ }
          let best = null, bd = 3;
          loose.forEach(function (s) { const d = Math.abs(s.x - sx); if (d < bd) { bd = d; best = s.el; } });
          stemEl = best;
        }
        if (stemEl) { out.push(stemEl); claimed.add(stemEl); }
      }
      // Only the stretch of beam that belongs to this note lights up: a gold copy of the
      // beam, clipped from halfway to the previous stem to halfway to the next stem.
      built.noteBeams[i].forEach(function (bm) {
        const e = elOf(bm);
        if (!e) return;
        const ns = bm.groupNotes;
        const j = ns.indexOf(sn);
        let xs;
        try { xs = ns.map(function (n) { return n.getStemX(); }); } catch (err) { return; }
        const L = j === 0 ? -1e4 : (xs[j - 1] + xs[j]) / 2;
        const R = j === ns.length - 1 ? 1e5 : (xs[j] + xs[j + 1]) / 2;
        const NS = 'http://www.w3.org/2000/svg';
        const id = 'beamclip' + (++beamClipId);
        const cp = document.createElementNS(NS, 'clipPath');
        cp.setAttribute('id', id);
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', L.toFixed(1));
        r.setAttribute('y', -1e4);
        r.setAttribute('width', (R - L).toFixed(1));
        r.setAttribute('height', 2e4);
        cp.appendChild(r);
        svg.appendChild(cp);
        const clone = e.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('class', 'beam-hl');
        clone.setAttribute('clip-path', 'url(#' + id + ')');
        e.parentNode.insertBefore(clone, e.nextSibling);
        out.push(clone);
      });
      return out;
    });
  }
  // pibs: start of each note in beats. Notes are placed with uniform spacing
  // (every sixteenth gets the same width) so the page shows time proportionally.
  // Returns the width of one beat in pixels.
  // layout: { origin, beatW } puts every note on one even grid shared by all bars, with each
  // notehead centred in its sixteenth slot and barlines on slot edges, so time moves at a
  // constant speed across barlines.
  // Half the smallest grid slot (a sixteenth): 1/8 of a beat in simple time, 1/12 in compound time
  const slotLead = function (ternary) { return ternary ? 1 / 12 : 0.125; };
  function drawVoice(ctx, stave, built, beats, pibs, layout) {
    const voice = new VF.Voice(layout.ternary ? { num_beats: beats * 3, beat_value: 8 } : { num_beats: beats, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT);
    const lead = slotLead(layout.ternary);   // space before the first notehead: half the smallest slot
    voice.addTickables(built.notes);
    const w = stave.getNoteEndX() - stave.getNoteStartX() - 14;
    new VF.Formatter().joinVoices([voice]).format([voice], Math.max(40, w));
    const beatW = layout.beatW;
    const ns = stave.getNoteStartX();
    built.notes.forEach(function (sn, i) {
      const centre = layout.origin + (pibs[i] + lead) * beatW;
      sn.getTickContext().setX(centre - 6 - ns);   // tick x is roughly the notehead's left edge
    });
    // VexFlow adds its own padding; measure where the first notehead really lands and shift all
    // notes so each head is exactly centred in its slot
    try {
      const first = built.notes[0];
      first.setStave(stave);
      const real = (first.getNoteHeadBeginX() + first.getNoteHeadEndX()) / 2;
      const want = layout.origin + (pibs[0] + lead) * beatW;
      const delta = real - want;
      if (Math.abs(delta) > 0.1) {
        built.notes.forEach(function (sn) { const tc = sn.getTickContext(); tc.setX(tc.getX() - delta); });
      }
    } catch (e) { /* keep the rough placement */ }
    voice.draw(ctx, stave);
    built.beams.forEach(function (b) { b.setContext(ctx).draw(); });
    built.tuplets.forEach(function (t) { t.setContext(ctx).draw(); });
    return beatW;
  }

  // Map beat position -> x for one bar. Spacing is uniform, so two points
  // (the first notehead centre and one bar later) define the whole line.
  function makeAnchors(notes, pibs, bpb, beatW) {
    const sn = notes[0];
    const x0 = (sn.getNoteHeadBeginX() + sn.getNoteHeadEndX()) / 2 - pibs[0] * beatW;
    return [{ p: 0, x: x0 }, { p: bpb, x: x0 + bpb * beatW }];
  }
  function xAtIn(anchors, p) {
    let k = 0;
    while (k < anchors.length - 2 && anchors[k + 1].p <= p + 1e-6) k++;
    const a = anchors[k], b = anchors[k + 1];
    const t = (p - a.p) / (b.p - a.p);
    return a.x + t * (b.x - a.x);
  }
  // info: one entry per note in the bar, { p: start in beats, attack: false when tied from the previous note }
  // Returns the grid slots ({ p, el }) so playback can highlight them.
  // What is drawn under the staff. "Notation aids" (Settings > Notation) switches all of it off
  // at once for a plain score, while keeping each aid's own setting for when it comes back.
  const G = {
    get grid() { return S.aids && S.grid; },
    get pulse() { return S.aids && S.pulse; }
  };
  let runGradSeq = 0;
  function drawGrid(svg, stave, anchors, info, bpb, shift, ternary) {
    function xAt(p) { return xAtIn(anchors, p); }
    const y = stave.getYForLine(2) + (S.counts ? 64 : 34) + (shift || 0);
    const NS = 'http://www.w3.org/2000/svg';

    // Build the slots: 1 e & a per beat, or 1 & a when the beat holds a triplet
    const slots = [];
    for (let b = 0; b < bpb && ternary; b++) {
      // compound time: 1 & a on the eighths, or 1 ta & ta a ta when the beat has sixteenths
      const sixths = info.some(function (nt) {
        return nt.p >= b - 1e-6 && nt.p < b + 1 - 1e-6 && Math.abs(nt.p * 3 - Math.round(nt.p * 3)) > 1e-3;
      });
      const subs = sixths ? [0, 1, 2, 3, 4, 5].map(function (k) { return k / 6; }) : [0, T3, 2 * T3];
      const labs = sixths ? [String(b + 1), 'ta', '&', 'ta', 'a', 'ta'] : [String(b + 1), '&', 'a'];
      subs.forEach(function (s, i) { slots.push({ p: b + s, label: labs[i] }); });
    }
    for (let b = 0; b < bpb && !ternary; b++) {
      const trip = info.some(function (nt) {
        return nt.p >= b - 1e-6 && nt.p < b + 1 - 1e-6 && Math.abs(nt.p * 4 - Math.round(nt.p * 4)) > 1e-3;
      });
      const subs = trip ? [0, T3, 2 * T3] : [0, 0.25, 0.5, 0.75];
      const labs = trip ? [String(b + 1), '&', 'a'] : [String(b + 1), 'e', '&', 'a'];
      subs.forEach(function (s, i) { slots.push({ p: b + s, label: labs[i] }); });
    }

    // A slot is an attack when a note is struck there; every other slot is sustained by the note before it
    slots.forEach(function (sl) {
      const nt = info.find(function (x) { return Math.abs(x.p - sl.p) < 1e-3; });
      sl.attack = !!(nt && nt.attack && !nt.rest);
      // slots inside a rest get no circle or underline
      let owner = null;
      info.forEach(function (x) { if (x.p <= sl.p + 1e-3) owner = x; });
      sl.rest = !!(owner && owner.rest);
      sl.x = xAt(sl.p);
      sl.halfW = sl.label.length * 3.7;
    });

    // One box per sounding note: from the slot where it is struck through every slot it is held.
    // A run that starts without an attack is held over from a tie and gets a dashed box.
    const first = slots[0], second = slots[1];
    const leftEdge = function (i) {
      const prevX = i > 0 ? slots[i - 1].x : first.x - (second ? second.x - first.x : 20);
      return (prevX + slots[i].x) / 2 + 1.5;
    };
    const rightEdge = function (i) {
      const nextX = i + 1 < slots.length ? slots[i + 1].x : xAt(bpb);
      return (slots[i].x + nextX) / 2 - 1.5;
    };
    // Pulse circles sit under the syllables, or take their place when the 1 e & a row is off
    const dotY = G.grid ? y + 21 : y - 3;

    // | dividers between beats, halfway between one beat's last slot and the next beat number.
    // They sit in the gaps of the syllable row and the pulse row, so they never cross text or dots.
    const tick = function (bx, y1, y2) {
      const dv = document.createElementNS(NS, 'line');
      dv.setAttribute('x1', bx);
      dv.setAttribute('x2', bx);
      dv.setAttribute('y1', y1);
      dv.setAttribute('y2', y2);
      dv.setAttribute('class', 'grid-divider');
      svg.appendChild(dv);
    };
    slots.forEach(function (sl, i) {
      if (i === 0 || Math.abs(sl.p - Math.round(sl.p)) > 1e-6) return;
      if (!S.beatLines) return;
      // a short tick centred on the syllables, in the free space between the two (counting circles)
      const prev = slots[i - 1];
      const left = prev.x + (S.circles && prev.attack ? 8.3 : prev.halfW);
      const right = sl.x - (S.circles && sl.attack ? 8.3 : sl.halfW);
      const bx = ((left + right) / 2).toFixed(1);
      if (G.grid) tick(bx, (y - 9).toFixed(1), y.toFixed(1));
      if (G.pulse) tick(bx, dotY - 4, dotY + 4);
    });

    // Underlines and circles sit on the syllable row, or on the pulse row when syllables are off
    const markY = G.grid ? y : dotY;
    const underY = G.grid ? y + 8 : dotY + 11;
    let runStart = 0;
    for (let i = 0; (G.grid || G.pulse) && i < slots.length; i++) {
      if (slots[i].rest) { runStart = i + 1; continue; }
      const endsHere = i + 1 >= slots.length || slots[i + 1].attack || slots[i + 1].rest;
      if (!endsHere) continue;
      const x1 = leftEdge(runStart);
      const x2 = rightEdge(i);
      // Underline the syllables the note is held through
      const rect = document.createElementNS(NS, 'line');
      rect.setAttribute('x1', (x1 + 2).toFixed(1));
      rect.setAttribute('x2', Math.max(x1 + 4, x2 - 2).toFixed(1));
      rect.setAttribute('y1', underY);
      rect.setAttribute('y2', underY);
      rect.setAttribute('class', 'grid-run' + (slots[runStart].attack ? '' : ' grid-run-tied'));
      svg.appendChild(rect);
      // Underline fill: a gold bar that grows along the underline as the playhead crosses it,
      // soft at its start and bright at the leading edge (gradient stretches with the bar)
      if (S.runFill) {
        if (!svg.__runGrad) {
          svg.__runGrad = 'runGrad' + (++runGradSeq);
          let defs = svg.querySelector('defs');
          if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild); }
          const lg = document.createElementNS(NS, 'linearGradient');
          lg.setAttribute('id', svg.__runGrad);
          [['0', 'run-stop-a'], ['0.85', 'run-stop-b'], ['1', 'run-stop-c']].forEach(function (st) {
            const stop = document.createElementNS(NS, 'stop');
            stop.setAttribute('offset', st[0]);
            stop.setAttribute('class', st[1]);
            lg.appendChild(stop);
          });
          defs.appendChild(lg);
        }
        const fx1 = x1 + 1, fx2 = Math.max(x1 + 5, x2 - 1);
        const fill = document.createElementNS(NS, 'rect');
        fill.setAttribute('x', fx1.toFixed(1));
        fill.setAttribute('y', (underY - 1.7).toFixed(1));
        fill.setAttribute('height', 3.4);
        fill.setAttribute('rx', 1.7);
        fill.setAttribute('width', 0);
        fill.style.fill = 'url(#' + svg.__runGrad + ')';   // inline: the page's ink rule would override a fill attribute
        fill.setAttribute('class', 'grid-run-fill');
        svg.appendChild(fill);
        rect.fill = fill; rect.fx1 = fx1; rect.fx2 = fx2;
      }
      for (let k = runStart; k <= i; k++) slots[k].run = rect;
      rect.fx1 = x1 + 1; rect.fx2 = Math.max(x1 + 5, x2 - 1);   // where the playhead is on it
      runStart = i + 1;
    }

    slots.forEach(function (sl) {
      // Metric weight: downbeat strongest, other beats next, subdivisions smallest
      const isDown = sl.p < 1e-6;
      const isBeat = Math.abs(sl.p - Math.round(sl.p)) < 1e-6;
      const weight = isDown ? ' grid-down' : (isBeat ? ' grid-beat' : '');

      // Ring around the syllable where a note is struck
      if (sl.attack) {
        const ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('cx', sl.x.toFixed(1));
        ring.setAttribute('cy', G.grid ? y - 4.5 : markY);
        ring.setAttribute('r', G.grid ? 8.3 : 8.6);
        ring.setAttribute('class', 'grid-ring');
        svg.appendChild(ring);
        sl.ring = ring;
      }

      if (G.grid && S.beatMarks && isBeat) {
        // short line above each beat number marks where the beats are
        const bm = document.createElementNS(NS, 'line');
        bm.setAttribute('x1', (sl.x - 5).toFixed(1));
        bm.setAttribute('x2', (sl.x + 5).toFixed(1));
        bm.setAttribute('y1', y - 17);
        bm.setAttribute('y2', y - 17);
        bm.setAttribute('class', 'grid-beatmark beat-' + (Math.floor(sl.p + 1e-6) % 5 + 1));
        svg.appendChild(bm);
      }
      if (G.grid) {
        const txt = document.createElementNS(NS, 'text');
        txt.setAttribute('x', sl.x.toFixed(1));
        txt.setAttribute('y', y);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('class', 'grid' + weight + (sl.attack ? ' grid-hit grid-ringed' : '') + ' beat-' + (Math.floor(sl.p + 1e-6) % 5 + 1));
        txt.textContent = sl.label;
        svg.appendChild(txt);
        sl.el = txt;
      }

      if (G.pulse) {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', sl.x.toFixed(1));
        dot.setAttribute('cy', dotY);
        dot.setAttribute('r', isDown ? 6.4 : (isBeat ? 5 : 2.9));
        dot.setAttribute('class', 'grid-dot');
        svg.appendChild(dot);
        sl.dot = dot;
      }
    });
    return slots;
  }

  // How many bars fit on a line: each sixteenth slot needs enough room for the densest notes in
  // the rhythm (and for the 1 e & a syllables when shown). Lines are then balanced, so 4 bars
  // that fit 3 per line become 2 + 2 instead of 3 + 1.
  function barsPerLine(model, avail) {
    const shortest = model.flat.reduce(function (m, f) { return f.rest ? m : Math.min(m, f.d); }, 4);
    let barW;
    if (model.ternary) {
      // compound beat: six sixteenth slots when there are sixteenths, else three eighth slots
      const six = shortest <= 0.17;
      let slot = six ? 18 : (shortest <= 0.34 ? 26 : 20);
      if (G.grid) slot = Math.max(slot, six ? 18 : 16);
      if (G.pulse) slot = Math.max(slot, 14);
      barW = model.bpb * (six ? 6 : 3) * slot + 24;
    } else {
      let slot = shortest <= 0.26 ? 19 : (shortest <= 0.34 ? 18 : (shortest <= 0.5 ? 13 : 10));   // px per sixteenth
      if (G.grid) slot = Math.max(slot, 16);          // room for each syllable
      if (G.pulse) slot = Math.max(slot, 14);
      barW = model.bpb * 4 * slot + 24;
    }
    const maxPer = Math.max(1, Math.min(6, Math.floor(avail / barW)));
    const n = model.bars.length;
    const lines = Math.ceil(n / maxPer);
    return Math.max(1, Math.ceil(n / lines));
  }

  // ---------- Shared renderer (practice score and glossary cards) ----------
  // A "model" is { bpb, bars: [{ cells }], flat, tieAfter, total }.
  // renderRhythm draws it and returns a "view" used for highlighting and the playhead.
  let litSlot = null;
  // Redraws empty a container and then measure the page. For that moment the page is shorter,
  // and the browser pulls the scroll position up to fit, so a toggle low on the page (or a
  // redraw while scrolling) threw you back up. Hold the page at its current height until the
  // redraw is done (next frame); then let it settle to its real height.
  let holdRaf = 0;
  function holdPage() {
    const b = document.body;
    if (!holdRaf) b.style.minHeight = document.documentElement.scrollHeight + 'px';
    cancelAnimationFrame(holdRaf);
    holdRaf = requestAnimationFrame(function () { holdRaf = 0; b.style.minHeight = ''; });
  }

  function renderRhythm(host, model, opts) {
    holdPage();   // keep the page height while this redraws
    host.innerHTML = '';
    host.style.width = '';   // measure the real available width, not a width left from the last draw
    const view = { model: model, els: [], barGeo: [], playhead: null };
    const W = Math.max(opts.minWidth || 200, host.clientWidth || opts.fallbackWidth || 700);
    const bpb = model.bpb;
    const melody = !!(opts.melody && model.voices && model.voices[0]);
    const mkey = melody ? (KEYS[model.keyId] || KEYS.C) : null;
    // melody: treble clef + key signature start every line; one-line rhythm: just the time signature
    // Phones: a smaller time signature, so it doesn't eat the first bar
    const small = W < 520;
    const makeTS = function () {
      const ts = new VF.TimeSignature(meterLabel(bpb, model.ternary), small ? 8 : 15);
      if (small) { ts.point = Math.round(ts.point * 0.7); ts.setTimeSig(meterLabel(bpb, model.ternary)); }
      return ts;
    };
    // Space before the first note, kept the same on every line so beats line up top to bottom
    let tsExtra = opts.timeSig ? (small ? 22 : 34) : 0;
    if (melody) {
      // measure what the clef, key signature and time signature really take
      const probe = new VF.Stave(0, 0, 600);
      probe.addClef('treble');
      probe.addKeySignature(mkey.sig);
      if (opts.timeSig) probe.addModifier(makeTS());
      tsExtra = Math.ceil(probe.getNoteStartX()) + 8;
    }
    const topShift = melody ? 14 : 0, gridShift = melody ? 20 : 0;   // a five-line staff is taller
    // breathing room between a full line's last note and its end barline
    const endPad = small ? 8 : 16;
    const perRow = opts.oneRow ? 1 : barsPerLine(model, W - tsExtra - endPad - 4);
    const rows = Math.ceil(model.bars.length / perRow);
    const gridRows = G.grid && G.pulse ? 42 : (G.grid ? 26 : (G.pulse ? 30 : 0));
    const ballRoom = (S.tracer || S.metroBall) ? 42 : 0;   // space above the staff for the balls' arcs
    const rowH = 104 + ballRoom + topShift + gridShift + (S.counts ? 18 : 0) + (gridRows && S.counts ? gridRows + 10 : gridRows);
    const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
    renderer.resize(W, rows * rowH + 6);
    const ctx = renderer.getContext();
    const svg = host.querySelector('svg');
    // VexFlow pins a fixed width on the container; clear it so the box keeps following the page
    host.style.width = '';
    host.style.height = '';
    // let the drawing scale down to its box, so it can never force the page wider (phones)
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (rows * rowH + 6));
    svg.style.width = '100%';
    svg.style.maxWidth = W + 'px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    const bw = (W - 3 - tsExtra - endPad) / perRow;

    const flatSN = [];
    const claimedStems = new Set();
    const rowOf = [];
    let fi = 0;
    model.bars.forEach(function (bar, bi) {
      const r = Math.floor(bi / perRow), c = bi % perRow;
      const x = 1 + (c === 0 ? 0 : tsExtra + c * bw);
      const w = (c === 0 ? bw + tsExtra : bw) + (c === perRow - 1 ? endPad : 0);
      const stave = new VF.Stave(x, r * rowH - 6 + ballRoom + topShift, w);
      if (melody) {
        if (c === 0) { stave.addClef('treble'); stave.addKeySignature(mkey.sig); }
      } else oneLine(stave);
      if (opts.timeSig && bi === 0) stave.addModifier(makeTS());
      if (!opts.barlines) {
        stave.setBegBarType(BT.NONE);
        stave.setEndBarType(BT.NONE);
      } else if (bi === model.bars.length - 1) {
        stave.setEndBarType(BT.END);
      }
      stave.setContext(ctx).draw();

      let labels = null;
      const count = bar.cells.reduce(function (a, cl) { return a + cl.notes.length; }, 0);
      if (S.counts) {
        labels = [];
        for (let j = 0; j < count; j++) {
          const f = model.flat[fi + j];
          const s = syllable(f.pib, model.ternary);
          labels.push(model.tieAfter.has(fi + j - 1) ? '(' + s + ')' : s);
        }
      }
      let pitches = null;
      if (melody) {
        pitches = [];
        for (let j = 0; j < count; j++) pitches.push(model.voices[0].pitch[fi + j]);
      }
      const built = buildCells(bar.cells, labels, pitches);
      const pibs = [];
      for (let j = 0; j < count; j++) pibs.push(model.flat[fi + j].pib);
      const beatW = drawVoice(ctx, stave, built, bpb, pibs, { origin: x + (c === 0 ? tsExtra : 0), beatW: bw / bpb, ternary: model.ternary });
      const anchors = makeAnchors(built.notes, pibs, bpb, beatW);
      const lineY = stave.getYForLine(2);
      const geo = { anchors: anchors, beatW: beatW, x2: x + w, lineY: lineY, landY: lineY - 52 - topShift, row: r, rowTop: r * rowH, rowH: rowH,
        y1: lineY - 44 - topShift, y2: lineY + gridShift + (S.counts ? 30 : 0) + (G.grid && G.pulse ? 62 : (G.grid ? 44 : (G.pulse ? 46 : 14))) };
      view.barGeo.push(geo);
      if (G.grid || G.pulse) {
        const info = [];
        for (let j = 0; j < count; j++) info.push({ p: pibs[j], attack: !model.tieAfter.has(fi + j - 1), rest: !!model.flat[fi + j].rest });
        geo.grid = drawGrid(svg, stave, anchors, info, bpb, gridShift, model.ternary);
      }
      highlightTargets(svg, built, claimedStems).forEach(function (t) { view.els.push(t); });
      built.notes.forEach(function (sn) { flatSN.push(sn); rowOf.push(r); });
      fi += count;
    });

    model.tieAfter.forEach(function (i) {
      const a = flatSN[i], b = flatSN[i + 1];
      if (!a || !b) return;
      if (rowOf[i] === rowOf[i + 1]) {
        new VF.StaveTie({ first_note: a, last_note: b, first_indices: [0], last_indices: [0] }).setContext(ctx).draw();
      } else {
        new VF.StaveTie({ first_note: a, last_note: null, first_indices: [0], last_indices: [0] }).setContext(ctx).draw();
        new VF.StaveTie({ first_note: null, last_note: b, first_indices: [0], last_indices: [0] }).setContext(ctx).draw();
      }
    });

    // both balls share one lane; the bigger blue metronome ball is drawn first so the gold
    // note ball shows on top of it when they land together
    // Build: a hit area over each placed cell; tap it to remove that cell
    if (opts.build) {
      view.barGeo.forEach(function (g, bi) {
        let p = 0;
        model.bars[bi].cells.forEach(function (cell, ci) {
          if (cell.id !== 'rest') {
            const x0 = g.anchors[0].x - g.beatW * slotLead(model.ternary) + p * g.beatW;
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            t.setAttribute('class', 'cell-hit');
            t.setAttribute('x', (x0 + 1).toFixed(1));
            t.setAttribute('y', g.rowTop + 4);
            t.setAttribute('width', (cell.beats * g.beatW - 2).toFixed(1));
            t.setAttribute('height', g.rowH - 8);
            t.setAttribute('rx', 6);
            t.setAttribute('tabindex', '0');
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', 'Remove ' + cell.name + ' from bar ' + (bi + 1));
            const tt = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            tt.textContent = 'Remove ' + cell.name;
            t.appendChild(tt);
            const rm = function () { removeCell(bi, ci); };
            t.addEventListener('click', rm);
            t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); rm(); } });
            svg.appendChild(t);
          }
          p += cell.beats;
        });
      });
    }

    // Dictation: one tile per beat hides the answer; tap a tile to reveal just that beat
    if (opts.dictation) {
      view.dictation = true;
      view.barGeo.forEach(function (g, bi) {
        for (let k = 0; k < bpb; k++) {
          const x0 = g.anchors[0].x - g.beatW * slotLead(model.ternary) + k * g.beatW;
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          t.setAttribute('class', 'beat-tile');
          t.setAttribute('x', (x0 + 1).toFixed(1));
          t.setAttribute('y', g.rowTop + 4);
          t.setAttribute('width', (g.beatW - 2).toFixed(1));
          t.setAttribute('height', g.rowH - 8);
          t.setAttribute('rx', 6);
          t.setAttribute('tabindex', '0');
          t.setAttribute('role', 'button');
          t.setAttribute('aria-label', 'Reveal bar ' + (bi + 1) + ', beat ' + (k + 1));
          const toggle = function () {
            const open = t.classList.toggle('open');
            t.setAttribute('aria-label', (open ? 'Hide' : 'Reveal') + ' bar ' + (bi + 1) + ', beat ' + (k + 1));
          };
          t.addEventListener('click', toggle);
          t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
          svg.appendChild(t);
        }
      });
    }

    // Reveal mode: a veil over each row that the playhead wipes away as it passes
    view.covers = [];
    if (opts.reveal) {
      for (let r = 0; r < rows; r++) {
        // two veils per row: one before the visible part, one after it
        const mk = function () {
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          c.setAttribute('class', 'reveal-cover');
          c.setAttribute('x', 0);
          c.setAttribute('y', r * rowH);
          c.setAttribute('width', 0);
          c.setAttribute('height', rowH);
          c.style.opacity = opts.reveal.opacity;
          svg.appendChild(c);
          return c;
        };
        const left = mk(), right = mk();
        right.setAttribute('width', W);   // fully veiled until playback starts
        view.covers.push({ left: left, right: right, row: r });
      }
      view.coverW = W;
      view.revealAhead = opts.reveal.ahead || 0;
      view.revealBehind = opts.reveal.behind === undefined ? null : opts.reveal.behind;
    }
    view.balls = [];
    if (S.metroBall) view.balls.push(makeBall(svg, model, 'metro', 0));
    if (S.tracer && !opts.dictation) view.balls.push(makeBall(svg, model, 'notes', 0));   // the note ball would give the answer away

    // dark border behind the playhead that only shows near each strike
    const phEdge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    phEdge.setAttribute('class', 'playhead-edge');
    phEdge.style.display = 'none';
    svg.appendChild(phEdge);
    view.playheadEdge = phEdge;
    const ph = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ph.setAttribute('class', 'playhead playhead-' + (S.playheadFollow === 'notes' ? 'notes' : 'metro'));
    ph.style.display = 'none';
    svg.appendChild(ph);
    view.playhead = ph;

    // Wrap-around copy: while the playhead and balls cross from one line to the next, a copy
    // carries on past the end of the line they leave (or slides in at the start of the line
    // they enter), so they glide off one edge and in at the other instead of jumping.
    const SVGNS = 'http://www.w3.org/2000/svg';
    const wrap = document.createElementNS(SVGNS, 'g');
    wrap.setAttribute('class', 'wrap-ghost');
    wrap.style.display = 'none';
    // The copies are <use> clones, which the page's stylesheet doesn't reach: give the originals
    // their colours inline (custom properties still resolve), so the copies match them.
    view.balls.forEach(function (B) { B.g.style.fill = B.kind === 'metro' ? 'var(--c-metroball)' : 'var(--c-noteball)'; });
    ph.style.stroke = 'var(--c-playhead)'; ph.style.strokeWidth = '3'; ph.style.strokeLinecap = 'round';
    phEdge.style.stroke = 'var(--ink)'; phEdge.style.strokeWidth = '6'; phEdge.style.strokeLinecap = 'round';
    view.balls.map(function (B) { return B.g; }).concat([phEdge, ph]).forEach(function (el) {
      if (!el.id) el.id = 'wrapsrc-' + (++wrapSeq);
      const u = document.createElementNS(SVGNS, 'use');
      u.setAttribute('href', '#' + el.id);
      wrap.appendChild(u);
    });
    svg.appendChild(wrap);
    view.wrap = wrap;
    view.W = W;
    return view;
  }
  let wrapSeq = 0;

  // Offset from where the playhead is drawn to where its wrap-around copy belongs, or null
  // when it is not near a line break.
  function wrapOffset(view, pos) {
    if (pos === null) return null;
    const bpb = view.model.bpb;
    const geo = view.barGeo;
    const b = Math.min(geo.length - 1, Math.floor(pos / bpb + 1e-9));
    if (b < 0) return null;
    const pib = pos - b * bpb;
    const here = xAtIn(geo[b].anchors, pib);
    const margin = 24;   // ball halo
    let other = null;
    // the bar that follows / precedes this one; with Loop on, the last bar leads back to the first
    const looping = P.loop && geo.length > 0;
    const next = b + 1 < geo.length ? b + 1 : (looping ? 0 : -1);
    const prev = b > 0 ? b - 1 : (looping && P.looped ? geo.length - 1 : -1);
    if (next >= 0 && (geo[next].row !== geo[b].row || next === 0)) {
      // leaving a line: the copy comes in from the left of the next line (or the first, when looping)
      const x = xAtIn(geo[next].anchors, pib - bpb);
      if (x > -margin) other = { x: x, g: geo[next] };
    }
    if (!other && prev >= 0 && (geo[prev].row !== geo[b].row || b === 0)) {
      // just entered a line: the copy finishes going off the end of the line before. That line
      // may stop short of the right edge (a last line with fewer bars), so the copy only shows
      // up to its closing barline, never out in the empty space after it.
      const x = xAtIn(geo[prev].anchors, pib + bpb);
      if (x < geo[prev].x2 + 4) other = { x: x, g: geo[prev] };
    }
    if (!other) return null;
    return { dx: other.x - here, dy: other.g.landY - geo[b].landY };
  }
  function updateWrap(view, pos, hidePh) {
    if (!view || !view.wrap) return;
    const off = hidePh && !(view.balls && view.balls.length) ? null : wrapOffset(view, pos);
    if (!off) { view.wrap.style.display = 'none'; return; }
    view.wrap.setAttribute('transform', 'translate(' + off.dx.toFixed(1) + ' ' + off.dy.toFixed(1) + ')');
    view.wrap.style.display = '';
  }

  // ---------- Bouncing ball (karaoke style) ----------
  // A ball hops above the staff from beat to beat (or note to note) in time with the music,
  // leaving a short trail that fades away behind it. Kept above the staff so it is never
  // mistaken for a tie or slur.
  const BALL_TRAIL = 14;        // trail dots
  const BALL_TRAIL_SECS = 0.35; // how long the trail lingers
  let ballGlowId = 0;
  // kind: 'notes' (gold, lands on every struck note) or 'metro' (blue, lands on every metronome click)
  // lane: 0 = just above the staff, 1 = one lane higher
  function makeBall(svg, model, kind, lane) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ball ball-' + kind);
    g.style.display = 'none';
    const trail = [];
    for (let i = 0; i < BALL_TRAIL; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'ball-trail');
      c.setAttribute('r', 0);
      g.appendChild(c);
      trail.push(c);
    }
    // soft glow behind the ball (blurred circle), like a synth's LED
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild); }
    const fid = 'ballglow' + (++ballGlowId);
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', fid);
    filter.setAttribute('x', '-200%');
    filter.setAttribute('y', '-200%');
    filter.setAttribute('width', '500%');
    filter.setAttribute('height', '500%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    filter.appendChild(blur);
    defs.appendChild(filter);
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('class', 'ball-halo');
    halo.setAttribute('filter', 'url(#' + fid + ')');
    halo.setAttribute('r', 0);
    g.appendChild(halo);
    const ball = document.createElementNS(NS, 'circle');
    ball.setAttribute('class', 'ball-dot');
    ball.setAttribute('r', 5);
    g.appendChild(ball);
    svg.appendChild(g);

    // Landing points in beats
    const pts = [];
    if (kind === 'notes') {
      model.flat.forEach(function (f, i) { if (!model.tieAfter.has(i - 1)) pts.push(f.pos); });
    } else {
      const per = clicksPerBeat(model.ternary);   // follows the metronome's clicks per beat
      for (let k = 0; k < model.total * per; k++) pts.push(k / per);
    }
    pts.push(model.total);
    return { g: g, ball: ball, halo: halo, trail: trail, pts: pts, hist: [], kind: kind, lane: lane };
  }

  // x/y of a beat position inside a view; atEndOf forces the end of that bar (for row breaks)
  function ballXY(view, pos, atEndOf) {
    const bpb = view.model.bpb;
    const geo = view.barGeo;
    let b = atEndOf !== undefined ? atEndOf : Math.min(geo.length - 1, Math.floor(pos / bpb + 1e-9));
    const pib = atEndOf !== undefined ? bpb : pos - b * bpb;
    return { x: atEndOf !== undefined ? xAtIn(geo[b].anchors, pib) : motionX(view, b, pib), land: geo[b].landY, row: geo[b].row, bar: b };
  }

  // Landing points for a glow cycle: 'beats', 'metro' (every metronome click) or 'notes' (every struck note)
  function landingPts(view, kind) {
    view.ptsCache = view.ptsCache || {};
    if (view.ptsCache[kind]) return view.ptsCache[kind];
    const model = view.model;
    const pts = [];
    if (kind === 'notes') {
      model.flat.forEach(function (f, i) { if (!model.tieAfter.has(i - 1)) pts.push(f.pos); });
    } else {
      const per = kind === 'metro' ? clicksPerBeat(model.ternary) : 1;
      for (let k = 0; k < model.total * per; k++) pts.push(k / per);
    }
    pts.push(model.total);
    view.ptsCache[kind] = pts;
    return pts;
  }
  // Glow cycle: 1 right on a landing point, falling to 0 halfway to the next one
  function glowAt(view, pos, kind) {
    const pts = landingPts(view, kind || 'beats');
    let j = 0;
    while (j < pts.length - 2 && pts[j + 1] <= pos + 1e-9) j++;
    const frac = Math.max(0, Math.min(1, (pos - pts[j]) / (pts[j + 1] - pts[j])));
    const e = Math.min(frac, 1 - frac);
    return Math.pow(1 - 2 * e, 3);
  }

  function updateBalls(view, pos) {
    if (!view || !view.balls) return;
    view.balls.forEach(function (B) { updateBall(view, B, pos); });
  }
  function updateBall(view, B, pos) {
    if (pos === null) { B.g.style.display = 'none'; B.hist.length = 0; return; }
    const pts = B.pts;
    let j = 0;
    while (j < pts.length - 2 && pts[j + 1] <= pos + 1e-9) j++;
    const a = pts[j], b = pts[j + 1];
    const frac = Math.max(0, Math.min(1, (pos - a) / (b - a)));
    // Horizontal position is exactly the playhead's, so the two can never drift apart;
    // the hop height comes from how far we are between landing points.
    const here = ballXY(view, Math.min(pos, view.model.total - 1e-6));
    // taller arcs so the two balls separate clearly in flight (they share a lane and meet on landings)
    const cpb = clicksPerBeat(view.model.ternary);
    const H = B.kind === 'notes' ? Math.min(36, 12 + (b - a) * 16) : (cpb >= 4 ? 12 : (cpb >= 2 ? 18 : 26));
    const x = here.x;
    const y = here.land - B.lane * 24 - H * 4 * frac * (1 - frac);
    B.g.style.display = '';
    B.ball.setAttribute('cx', x.toFixed(1));
    B.ball.setAttribute('cy', y.toFixed(1));
    // Brightness: flares at each landing (beat mark), dims to an ember mid-hop
    const e = Math.min(frac, 1 - frac);              // 0 at a landing, 0.5 halfway
    const bright = Math.pow(1 - 2 * e, 3);
    B.ball.style.opacity = (0.05 + 0.95 * bright).toFixed(2);   // fades almost out mid-hop, like the playhead
    // metronome ball is a little larger than the note ball, so both show when they overlap
    B.ball.setAttribute('r', (B.kind === 'metro' ? 7.5 + 1.5 * bright : 4 + 1.8 * bright).toFixed(2));
    // outline only near the strike, so the landing reads as a crisp hit
    const edge = bright * bright;
    B.ball.style.stroke = 'var(--ink)';
    B.ball.style.strokeWidth = (2.4 * edge).toFixed(2);
    B.ball.style.strokeOpacity = edge.toFixed(2);
    B.halo.setAttribute('cx', x.toFixed(1));
    B.halo.setAttribute('cy', y.toFixed(1));
    B.halo.setAttribute('r', (5 + 9 * bright).toFixed(2));
    B.halo.style.opacity = (0.85 * bright).toFixed(2);

    // trail: recent positions, shrinking and fading with age
    const now = performance.now() / 1000;
    const last = B.hist[B.hist.length - 1];
    if (!last || Math.abs(last.x - x) + Math.abs(last.y - y) > 1.5) B.hist.push({ x: x, y: y, t: now });
    while (B.hist.length && now - B.hist[0].t > BALL_TRAIL_SECS) B.hist.shift();
    for (let i = 0; i < B.trail.length; i++) {
      const h = B.hist[B.hist.length - 1 - Math.round(i * B.hist.length / B.trail.length)];
      const c = B.trail[i];
      if (!h) { c.setAttribute('r', 0); continue; }
      const age = Math.min(1, (now - h.t) / BALL_TRAIL_SECS);
      c.setAttribute('cx', h.x.toFixed(1));
      c.setAttribute('cy', h.y.toFixed(1));
      c.setAttribute('r', (4.2 * (1 - age) + 0.6).toFixed(2));
      c.style.opacity = ((1 - age) * 0.4).toFixed(2);
    }
  }

  // x for a position in bar b. Bars share one even grid, so this is linear everywhere,
  // including across barlines.
  function motionX(view, b, pib) {
    return xAtIn(view.barGeo[b].anchors, pib);
  }

  // Move a view's playhead (and grid highlight) to an absolute beat position; null hides it
  // Reveal mode: rows before the playhead are clear, its row is clear up to the playhead,
  // rows after it stay veiled. pos = null (count-in) veils everything.
  function updateReveal(view, pos) {
    if (!view || !view.covers || !view.covers.length) return;
    const bpb = view.model.bpb, W = view.coverW;
    const at = function (p) {   // row and x of a beat position
      p = Math.max(0, Math.min(p, view.model.total));
      const b = Math.min(view.barGeo.length - 1, Math.floor(p / bpb + 1e-9));
      return { row: view.barGeo[b].row, x: motionX(view, b, Math.min(p - b * bpb, bpb)) };
    };
    const set = function (el, x0, x1) { el.setAttribute('x', x0.toFixed(1)); el.setAttribute('width', Math.max(0, x1 - x0).toFixed(1)); };
    if (pos === null || pos < 0) {   // count-in: everything veiled
      view.covers.forEach(function (c) { set(c.left, 0, 0); set(c.right, 0, W); });
      return;
    }
    const ahead = at(pos + (view.revealAhead || 0));
    if (view.revealBehind === null) {
      // reveal modes: everything up to the look-ahead point is clear
      view.covers.forEach(function (c) {
        set(c.left, 0, 0);
        if (c.row < ahead.row) set(c.right, 0, 0);
        else if (c.row === ahead.row) set(c.right, ahead.x, W);
        else set(c.right, 0, W);
      });
      return;
    }
    // window mode: only the slice around the playhead on its own row is clear
    const cur = at(pos), behind = at(pos - view.revealBehind);
    view.covers.forEach(function (c) {
      if (c.row !== cur.row) { set(c.left, 0, W); set(c.right, 0, 0); return; }
      set(c.left, 0, behind.row === c.row ? behind.x : 0);
      set(c.right, ahead.row === c.row ? ahead.x : W, W);
    });
  }

  // Note highlight follows the playhead: each note warms into gold as the playhead approaches
  // (half a beat ahead), is fullest when it is reached, and cools again as the playhead moves on.
  const GLOW_AHEAD = 0.5;
  function paintNote(els, k) {
    [].concat(els || []).forEach(function (e) {
      if (k <= 0.001) {
        e.style.fill = ''; e.style.stroke = ''; e.style.opacity = '';
        e.removeAttribute('data-glow');
        return;
      }
      e.setAttribute('data-glow', '');
      if (e.classList.contains('beam-hl')) { e.style.opacity = k.toFixed(3); return; }
      const mix = 'color-mix(in srgb, var(--c-notes) ' + Math.round(k * 100) + '%, var(--ink))';
      e.style.fill = mix;
      e.style.stroke = mix;
    });
  }
  function updateNoteGlow(view, pos) {
    if (!view || !view.els) return;
    const flat = view.model.flat;
    view.glowK = view.glowK || [];
    for (let i = 0; i < flat.length; i++) {
      let k = 0;
      if (S.highlight && pos !== null && !flat[i].rest) {
        const dist = pos - flat[i].pos;
        const after = Math.max(0.5, flat[i].d);
        k = dist < 0 ? Math.max(0, 1 + dist / GLOW_AHEAD) : Math.max(0, 1 - dist / after);
        k = k * k * (3 - 2 * k);   // smooth ease in and out
      }
      if (Math.abs(k - (view.glowK[i] || 0)) < 0.015 && !(k === 0 && view.glowK[i])) continue;
      view.glowK[i] = k;
      paintNote(view.els[i], k);
    }
  }

  // Grid tools under the staff: each slot warms up as the playhead approaches it (a quarter beat
  // ahead), is fullest when reached, and cools over the next half beat. An underline takes the
  // brightest of the slots it covers.
  const SLOT_AHEAD = 0.25, SLOT_AFTER = 0.5;
  function paintSlot(sl, k) {
    const pct = Math.round(k * 100);
    const els = [sl.el, sl.dot, sl.ring];
    if (k <= 0.001) {
      els.forEach(function (e) { if (e) { e.style.fill = ''; e.style.stroke = ''; e.removeAttribute('data-glow'); } });
      return;
    }
    const mix = function (v, base) { return 'color-mix(in srgb, var(' + v + ') ' + pct + '%, ' + base + ')'; };
    const ringed = sl.ring && S.circles;
    if (sl.el) {
      sl.el.setAttribute('data-glow', '');
      // fades back toward the syllable's own color (its beat color when Beat colors is on)
      sl.el.style.fill = ringed ? mix('--c-ring-text', 'var(--bc, var(--ink))') : mix('--c-syll', sl.attack ? 'var(--bc, var(--ink))' : 'var(--bc-soft, var(--muted))');
    }
    if (sl.dot) {
      sl.dot.setAttribute('data-glow', '');
      sl.dot.style.fill = mix('--c-pulse', 'transparent');
      sl.dot.style.stroke = mix('--c-pulse', 'var(--muted)');
    }
    if (sl.ring) {
      sl.ring.setAttribute('data-glow', '');
      sl.ring.style.fill = mix('--c-ring', 'transparent');
      sl.ring.style.stroke = mix('--c-ring', 'var(--ink)');
    }
  }
  function updateGridGlow(view, pos) {
    const bpb = view.model.bpb;
    const runs = new Map();
    view.barGeo.forEach(function (g, bi) {
      if (!g.grid) return;
      g.grid.forEach(function (sl) {
        let k = 0;
        if (S.highlight && pos !== null) {
          const dist = pos - (bi * bpb + sl.p);
          k = dist < 0 ? Math.max(0, 1 + dist / SLOT_AHEAD) : Math.max(0, 1 - dist / SLOT_AFTER);
          k = k * k * (3 - 2 * k);
        }
        if (sl.run) { sl.run.bi = bi; runs.set(sl.run, Math.max(runs.get(sl.run) || 0, k)); }
        if (Math.abs(k - (sl.k || 0)) < 0.015 && !(k === 0 && sl.k)) return;
        sl.k = k;
        paintSlot(sl, k);
      });
    });
    runs.forEach(function (k, run) {
      // underline fill grows with the playhead, then fades out with the other highlights
      if (run.fill) {
        let w = 0, op = 0;
        if (S.highlight && pos !== null) {
          const px = xAtIn(view.barGeo[run.bi].anchors, pos - run.bi * bpb);
          w = Math.max(0, Math.min(run.fx2 - run.fx1, px - run.fx1));
          op = px < run.fx1 ? 0 : (px <= run.fx2 ? 1 : k);
        }
        run.fill.setAttribute('width', w.toFixed(1));
        run.fill.style.opacity = op.toFixed(2);
        return;                                   // the fill replaces the old colour glow
      }
      // no fill: the underline stays fully lit while the playhead is on it (rather than dipping
      // between syllables, which made it flash), then fades out with the other highlights
      if (S.highlight && pos !== null) {
        const px = xAtIn(view.barGeo[run.bi].anchors, pos - run.bi * bpb);
        if (px >= run.fx1 && px <= run.fx2) k = 1;
        else if (px > run.fx2) {
          // after the end: a quick smooth fade from full (an eighth of a beat), so it is off
          // almost as soon as the playhead has left it
          let f = Math.max(0, 1 - (px - run.fx2) / (0.125 * view.barGeo[run.bi].beatW));
          k = f * f * (3 - 2 * f);
        }
      }
      if (k <= 0.001) { run.style.stroke = ''; run.style.strokeOpacity = ''; run.removeAttribute('data-glow'); return; }
      run.setAttribute('data-glow', '');
      run.style.stroke = 'color-mix(in srgb, var(--c-under) ' + Math.round(k * 100) + '%, var(--ink))';
      run.style.strokeOpacity = (0.7 + 0.3 * k).toFixed(2);   // 0.7 = the underline's resting strength
    });
  }

  // hidePh: keep the playhead hidden (exam mode)
  function movePlayhead(view, pos, hidePh) {
    if (!view) return;
    updateNoteGlow(view, pos);
    updateReveal(view, pos);
    updateBalls(view, pos);
    const ph = view.playhead;
    if (!ph || !ph.isConnected) return;
    updateWrap(view, pos, hidePh);
    const bpb = view.model.bpb;
    const barGeo = view.barGeo;
    const b = pos === null ? -1 : Math.floor(pos / bpb + 1e-9);
    // the 1 e & a grid, pulse circles, circles and underlines fade with the playhead too
    updateGridGlow(view, pos);
    const edgeEl = view.playheadEdge;
    if (!S.playhead || hidePh || b < 0 || b >= barGeo.length) {
      ph.style.display = 'none';
      if (edgeEl) edgeEl.style.display = 'none';
      return;
    }
    const phGlow = pos === null ? 1 : glowAt(view, pos, S.playheadFollow === 'notes' && !view.dictation ? 'notes' : 'metro');
    ph.style.opacity = (0.05 + 0.9 * phGlow).toFixed(2);   // nearly fades out between pulses
    const g = barGeo[b];
    const x = motionX(view, b, pos - b * bpb).toFixed(1);
    ph.setAttribute('x1', x);
    ph.setAttribute('x2', x);
    ph.setAttribute('y1', g.y1);
    ph.setAttribute('y2', g.y2);
    ph.style.display = '';
    if (edgeEl) {
      ['x1', 'x2', 'y1', 'y2'].forEach(function (k) { edgeEl.setAttribute(k, ph.getAttribute(k)); });
      edgeEl.style.opacity = (0.9 * phGlow * phGlow).toFixed(2);
      edgeEl.style.display = '';
    }
  }

  // Playback events for a model; el() looks up the view at play time so re-renders are picked up
  function makeSeq(model, getView) {
    return model.flat.map(function (f, i) {
      const tiedFrom = model.tieAfter.has(i - 1);
      let dur = f.d, j = i;
      while (model.tieAfter.has(j) && j + 1 < model.flat.length) { j++; dur += model.flat[j].d; }
      return {
        pos: f.pos, d: f.d, attack: !tiedFrom && !f.rest, dur: dur, w: metricWeight(f.pib, model.ternary),
        midi: (model.voices && S.melody && model === score && model.voices[0].pitch[i]) ? model.voices[0].pitch[i].midi : null,
        el: function () { const v = getView(); return (!f.rest && v && v.els[i]) || null; }
      };
    });
  }

  // ---------- Conductor ----------
  // Standard beat patterns in a box: x from -1 (left) to 1 (right) for the right hand, y from 0 (top)
  // to 1 (bottom). P = where each beat lands (ictus), R = the top of the rebound after it.
  // 2/4: quarter circle, down then back up · 3/4: down, right, up · 4/4: down, left, right, up · 5/4: down, in (depth), out, out, in-up
  // An optional third value is depth (z): negative = toward the body, drawn as a smaller tip.
  const CONDUCT = {
    2: { P: [[0.56, 0.86], [0.375, 0.295]], R: [[0.519, 0.575], [0.0, 0.1]] },   // quarter circle: down to 1, back up the same arc to 2
    3: { P: [[0, .9], [.62, .8], [.25, .5]], R: [[-.08, .64], [.6, .58], [0, .08]] },
    4: { P: [[0, .9], [-.62, .8], [.64, .8], [.24, .5]], R: [[.1, .64], [-.52, .6], [.6, .58], [0, .08]] },
    // 5/4: 1 down, 2 in toward the body (depth, z = -1), 3 out, 4 further out, 5 back in and up
    5: { P: [[0, .9, 0], [-.12, .74, -1], [.42, .8, 0], [.78, .78, 0], [.24, .5, 0]],
         R: [[-.06, .64, -.5], [.08, .6, -.4], [.42, .58, 0], [.72, .54, 0], [0, .08, 0]] }
  };
  const REBOUND_AT = 0.38;   // fraction of the beat where the rebound tops out
  function conductPoint(bpb, beatPos) {
    const pat = CONDUCT[bpb] || CONDUCT[4];
    const knots = [];
    for (let i = 0; i < bpb; i++) {
      knots.push({ t: i, p: pat.P[i], ictus: true });
      knots.push({ t: i + REBOUND_AT, p: pat.R[i], ictus: false });
    }
    const n = knots.length;
    let k = n - 1;
    for (let i = 0; i < n; i++) { if (knots[i].t <= beatPos + 1e-9) k = i; }
    const k1 = (k + 1) % n;
    const t0 = knots[k].t, t1 = k1 === 0 ? bpb : knots[k1].t;
    let u = Math.max(0, Math.min(1, (beatPos - t0) / (t1 - t0)));
    // idiomatic timing: snap out of the ictus and decelerate into the rebound, then
    // accelerate down into the next ictus
    u = knots[k].ictus ? 1 - (1 - u) * (1 - u) : u * u;
    const p0 = knots[(k - 1 + n) % n].p, p1 = knots[k].p, p2 = knots[k1].p, p3 = knots[(k + 2) % n].p;
    const cr = function (a, b, c, d) {
      return 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    };
    const z = function (q) { return q[2] || 0; };
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), cr(z(p0), z(p1), z(p2), z(p3))];
  }

  let condView = null;
  function buildConductor() {
    const host = $('#conductor');
    holdPage();   // keep the page height while this redraws
    host.innerHTML = '';
    condView = null;
    if (!S.conduct || S.conduct === 'off' || !score) { host.hidden = true; return; }
    host.hidden = false;
    const NS = 'http://www.w3.org/2000/svg';
    const bpb = score.bpb;
    const both = S.conduct === 'both';
    host.classList.toggle('both', both);
    const hands = both ? [{ cx: 115, mirror: -1, name: 'L' }, { cx: 345, mirror: 1, name: 'R' }]
      : [{ cx: 115, mirror: S.conduct === 'left' ? -1 : 1, name: S.conduct === 'left' ? 'L' : 'R' }];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', both ? '0 0 460 200' : '0 0 230 200');
    svg.setAttribute('class', 'cond-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Conducting pattern for ' + meterLabel(bpb, score.ternary));
    host.appendChild(svg);
    // Depth (z) is drawn in perspective: moving in toward the body pulls a point toward a
    // vanishing point above the centre, so the pattern visibly goes "into" the page.
    const VP = [-0.7, 0.18];   // depth recedes diagonally up and toward the body side
    const map = function (h, p) {
      const k = 1 + 0.38 * Math.max(-1.6, Math.min(1, p[2] || 0));
      const x = VP[0] + (p[0] - VP[0]) * k, y = VP[1] + (p[1] - VP[1]) * k;
      return [h.cx + h.mirror * x * 95, 12 + y * 172, k];
    };
    const pat = CONDUCT[bpb] || CONDUCT[4];
    const hasDepth = pat.P.concat(pat.R).some(function (q) { return q[2]; });
    hands.forEach(function (h) {
      if (hasDepth) {
        // depth axis: from the floor of the pattern back toward the vanishing point
        const a = map(h, [0, .95, 0]), b = map(h, [0, .95, -1.6]);
        const ax = document.createElementNS(NS, 'line');
        ax.setAttribute('x1', a[0].toFixed(1)); ax.setAttribute('y1', a[1].toFixed(1));
        ax.setAttribute('x2', b[0].toFixed(1)); ax.setAttribute('y2', b[1].toFixed(1));
        ax.setAttribute('class', 'cond-axis');
        svg.appendChild(ax);
        const lb = document.createElementNS(NS, 'text');
        lb.setAttribute('x', (b[0] - 4 * h.mirror).toFixed(1));
        lb.setAttribute('y', (b[1] - 4).toFixed(1));
        lb.setAttribute('text-anchor', h.mirror > 0 ? 'end' : 'start');
        lb.setAttribute('class', 'cond-num');
        lb.textContent = 'in';
        svg.appendChild(lb);
      }
      // the full pattern, drawn faintly; with depth, segments farther in are thinner
      const N = 160;
      let prev = null, d = '';
      for (let i = 0; i <= N; i++) {
        const q = map(h, conductPoint(bpb, (i / N) * bpb * 0.9999));
        if (hasDepth && prev) {
          const seg = document.createElementNS(NS, 'line');
          seg.setAttribute('x1', prev[0].toFixed(1)); seg.setAttribute('y1', prev[1].toFixed(1));
          seg.setAttribute('x2', q[0].toFixed(1)); seg.setAttribute('y2', q[1].toFixed(1));
          seg.setAttribute('class', 'cond-path');
          seg.style.strokeWidth = (2.4 * q[2]).toFixed(2);
          svg.appendChild(seg);
        }
        d += (i ? ' L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
        prev = q;
      }
      if (!hasDepth) {
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d + ' Z');
        path.setAttribute('class', 'cond-path');
        svg.appendChild(path);
      }
      // beat numbers at each ictus
      (CONDUCT[bpb] || CONDUCT[4]).P.forEach(function (p, i) {
        const q = map(h, p);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', q[0].toFixed(1));
        t.setAttribute('y', (q[1] + 14).toFixed(1));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'cond-num');
        t.textContent = i + 1;
        svg.appendChild(t);
      });
      const lab = document.createElementNS(NS, 'text');
      lab.setAttribute('x', h.cx);
      lab.setAttribute('y', 14);
      lab.setAttribute('text-anchor', 'middle');
      lab.setAttribute('class', 'cond-hand');
      lab.textContent = h.name === 'L' ? 'Left hand' : 'Right hand';
      svg.appendChild(lab);
      // trail + baton tip
      h.trail = [];
      for (let i = 0; i < 16; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'cond-trail');
        c.setAttribute('r', 0);
        svg.appendChild(c);
        h.trail.push(c);
      }
      h.dot = document.createElementNS(NS, 'circle');
      h.dot.setAttribute('class', 'cond-dot');
      h.dot.setAttribute('r', 0);
      svg.appendChild(h.dot);
      h.hist = [];
    });
    condView = { bpb: bpb, hands: hands, map: map };
  }

  // pos: beats since the start of the rhythm (negative during the count-in), null = stopped
  function updateConductor(pos) {
    const V = condView;
    if (!V) return;
    V.hands.forEach(function (h) {
      if (pos === null) {
        h.dot.setAttribute('r', 0);
        h.trail.forEach(function (c) { c.setAttribute('r', 0); });
        h.hist.length = 0;
        return;
      }
      const bp = ((pos % V.bpb) + V.bpb) % V.bpb;
      const cp = conductPoint(V.bpb, bp);
      const q = V.map(h, cp);
      const depth = 1 + 0.45 * Math.max(-1, Math.min(1, cp[2]));   // smaller when the hand moves in toward the body
      const f = bp - Math.floor(bp);
      const bright = Math.pow(1 - 2 * Math.min(f, 1 - f), 3);   // flashes on each beat
      h.dot.setAttribute('cx', q[0].toFixed(1));
      h.dot.setAttribute('cy', q[1].toFixed(1));
      h.dot.setAttribute('r', ((5 + 3 * bright) * depth).toFixed(2));
      h.dot.style.opacity = (0.45 + 0.55 * bright).toFixed(2);
      const now = performance.now() / 1000;
      const last = h.hist[h.hist.length - 1];
      if (!last || Math.abs(last.x - q[0]) + Math.abs(last.y - q[1]) > 1) h.hist.push({ x: q[0], y: q[1], t: now });
      while (h.hist.length && now - h.hist[0].t > 0.45) h.hist.shift();
      h.trail.forEach(function (c, i) {
        const e = h.hist[h.hist.length - 1 - Math.round(i * h.hist.length / h.trail.length)];
        if (!e) { c.setAttribute('r', 0); return; }
        const age = Math.min(1, (now - e.t) / 0.45);
        c.setAttribute('cx', e.x.toFixed(1));
        c.setAttribute('cy', e.y.toFixed(1));
        c.setAttribute('r', (3.6 * (1 - age) + 0.6).toFixed(2));
        c.style.opacity = ((1 - age) * 0.5).toFixed(2);
      });
    });
  }

  let scoreView = null;
  function renderScore() {
    // semi: faded veil cleared a beat ahead · dictate: solid veil cleared exactly at the playhead
    // window: only a beat behind to a beat ahead of the playhead is visible
    const reveal = S.notation === 'semi' ? { opacity: 0.9, ahead: 1 }
      : S.notation === 'dictate' ? { opacity: 1, ahead: 0 }
      : S.notation === 'window' ? { opacity: 1, ahead: 1, behind: 1 } : null;
    scoreView = score ? renderRhythm($('#score'), score, { timeSig: true, barlines: true, minWidth: 300, reveal: reveal, melody: S.melody }) : null;
    buildConductor();
  }

  // ---------- Audio ----------
  // If the page script runs again in the same window (live update), silence the old instance first
  if (window.__eurStop) { try { window.__eurStop(); } catch (e) { /* ignore */ } }
  let actx = null;
  // iPhone / iPad (Safari 17+): treat the app's sound as media playback, so it still plays when
  // the ring/silent switch is on silent (by default web audio follows the ringer and stays mute).
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
  window.__eurStop = function () {
    stopAll();
    if (actx) { try { actx.close(); } catch (e) { /* ignore */ } actx = null; }
  };
  function ac() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      // Mixer: one bus for the rhythm instrument, one for the metronome
      actx.rhythmBus = actx.createGain();
      actx.metroBus = actx.createGain();
      // gentle limiter so loud attacks never distort
      const lim = actx.createDynamicsCompressor();
      lim.threshold.value = -1;
      lim.knee.value = 2;
      lim.ratio.value = 12;
      lim.attack.value = 0.002;
      lim.release.value = 0.12;
      lim.connect(actx.destination);
      actx.rhythmBus.connect(lim);
      actx.metroBus.connect(lim);
      // the Metronome on/off switch: a gate in front of the metronome bus, so turning it off
      // silences clicks that are already scheduled (the count-in bypasses it)
      actx.metroGate = actx.createGain();
      actx.metroGate.gain.value = S.metro ? 1 : 0;
      actx.metroGate.connect(actx.metroBus);
      applyMix();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  // After the page has been in the background (another app, another tab, a locked phone),
  // browsers can leave the audio context suspended or "interrupted" for good, so resume()
  // never brings the sound back. Each Play (or sound preview) then starts a fresh context:
  // it is always inside a tap or key press, where a new context is allowed to start.
  // play() also marks the context stale if its clock never starts, so the next Play recovers.
  let audioStale = false;
  function freshAudio() {
    if (actx && (audioStale || actx.state === 'interrupted' || actx.state === 'closed')) {
      try { actx.close(); } catch (e) { /* already closed */ }
      actx = null;
    }
    audioStale = false;
    return ac();
  }
  // Slider 0-100 -> gain, with a curve so the low end of the slider is usable
  function volToGain(v) { return Math.pow(v / 100, 2) * 1.6; }
  function applyMix() {
    if (!actx) return;
    const now = actx.currentTime;
    actx.rhythmBus.gain.setTargetAtTime(volToGain(S.volRhythm), now, 0.02);
    actx.metroBus.gain.setTargetAtTime(volToGain(S.volMetro), now, 0.02);
  }

  // loop / looped: whether this playback loops, and whether it has already gone round once
  const P = { token: 0, nodes: [], raf: 0, onStop: null, loop: false, looped: false };
  function track(node) {
    P.nodes.push(node);
    node.onended = function () { const i = P.nodes.indexOf(node); if (i >= 0) P.nodes.splice(i, 1); };
  }

  // ----- Sound building blocks -----
  let noiseBuf = null;
  function noise(ctx, t, len) {
    if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.start(t);
    src.stop(t + len);
    track(src);
    return src;
  }
  function osc(ctx, type, freq, t, end) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.start(t);
    o.stop(end + 0.02);
    track(o);
    return o;
  }
  // Envelope gain: quick attack to peak, exponential fall to ~0 at end
  function hitEnv(ctx, t, peak, end, out) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    g.connect(out);
    return g;
  }
  function filt(ctx, type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q) f.Q.value = q;
    return f;
  }

  const INSTRUMENTS = [
    { id: 'piano', name: 'Piano' },
    { id: 'marimba', name: 'Marimba' },
    { id: 'synth', name: 'Synth' },
    { id: 'woodblock', name: 'Woodblock' },
    { id: 'snare', name: 'Snare drum' },
    { id: 'clap', name: 'Hand clap' }
  ];
  const METRO_SOUNDS = [
    { id: 'click', name: 'Click' },
    { id: 'woodblock', name: 'Woodblock' },
    { id: 'cowbell', name: 'Cowbell' },
    { id: 'hihat', name: 'Hi-hat' }
  ];

  // One rhythm note at time t lasting dur seconds, in the chosen instrument
  // weight: metric weight of the note (1 = downbeat). It only matters with Strong attacks on,
  // where strong beats are played much louder and sharper than weak ones.
  function tone(t, dur, weight, midi) {
    // melody notes carry a pitch; plain rhythm plays on C5
    const f0 = midi ? 440 * Math.pow(2, (midi - 69) / 12) : 523.25;
    const ctx = ac();
    const inst = S.inst;
    // Velocity by beat: like key velocity on a keyboard, each note is simply played louder
    // or softer by where it falls in the bar (beat 1 loudest, e / a softest). The sound and
    // its attack are unchanged; only the level moves.
    const w = (S.punch && weight !== undefined) ? weight : 1;
    // rhythm: beat 1 2.0x, other beats 1.3x, & 0.5x, e / a 0.3x
    // melody: a gentler spread (1.5 / 1.15 / 0.8 / 0.65) so weak-beat notes stay clearly audible
    const vel = !S.punch ? 1 : (midi
      ? (w >= 1 ? 1.5 : (w >= 0.5 ? 1.15 : (w >= 0.25 ? 0.8 : 0.65)))
      : (w >= 1 ? 2.0 : (w >= 0.5 ? 1.3 : (w >= 0.25 ? 0.5 : 0.3))));
    const out = ctx.createGain();
    out.gain.value = vel;
    out.connect(ctx.rhythmBus);
    const hit = 1;
    if (inst === 'piano' || inst === 'synth') {
      // Sustaining sounds: the note length is audible.
      // Legato (melody): each note holds its full length with a fuller sustain and fades out over
      // ~30 ms around the next onset (a short crossfade), so the line connects without the old
      // note's tail masking the new note's start. The attack stays crisp (4 ms) either way.
      const leg = !!(S.legato && midi);
      const end = leg ? t + dur + 0.02 : t + Math.max(0.08, dur * 0.92);
      const g = ctx.createGain();
      const peak = inst === 'piano' ? 0.32 : 0.16;
      const sustain = inst === 'piano' ? 0.32 * (leg ? 0.55 : 0.35) : 0.16 * 0.8;
      const decayEnd = Math.max(t + 0.01, Math.min(end - 0.03, t + (leg ? 0.4 : 0.25)));
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
      g.gain.exponentialRampToValueAtTime(sustain, decayEnd);
      g.gain.setValueAtTime(sustain, Math.max(decayEnd + 0.001, end - 0.03));
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      g.connect(out);
      if (inst === 'piano') {
        [[f0, 'triangle', 1], [f0 * 2, 'sine', 0.35], [f0 * 3, 'sine', 0.12]].forEach(function (p) {
          const og = ctx.createGain();
          og.gain.value = p[2];
          osc(ctx, p[1], p[0], t, end).connect(og).connect(g);
        });
      } else {
        const lp = filt(ctx, 'lowpass', 1800, 0.8);
        if (midi) {   // melody: the filter opens briefly at the start so each note speaks clearly
          lp.frequency.setValueAtTime(4200, t);
          lp.frequency.exponentialRampToValueAtTime(1800, t + 0.09);
        }
        lp.connect(g);
        osc(ctx, 'sawtooth', f0, t, end).connect(lp);
        const o2 = osc(ctx, 'sawtooth', f0, t, end);
        o2.detune.value = 9;
        o2.connect(lp);
      }
      // melody: a very short, quiet upper partial at the onset (like a hammer on a string) marks
      // where each note starts; it is part of the pitch, not a noise click
      if (midi) {
        const tg = hitEnv(ctx, t, inst === 'piano' ? 0.07 : 0.05, t + 0.035, out);
        osc(ctx, 'sine', f0 * 4, t, t + 0.035).connect(tg);
      }
    } else if (inst === 'marimba') {
      const end = S.legato && midi ? t + Math.max(0.12, dur) + 0.02 : t + Math.min(0.5, Math.max(0.12, dur));   // legato: ring to the next note
      const g = hitEnv(ctx, t, 0.42 * hit, end, out);
      osc(ctx, 'sine', f0, t, end).connect(g);
      const g2 = hitEnv(ctx, t, 0.12, t + 0.08, out);
      osc(ctx, 'sine', f0 * 4, t, t + 0.08).connect(g2);
    } else if (inst === 'woodblock') {
      const end = t + 0.12;
      const g = hitEnv(ctx, t, 0.45 * hit, end, out);
      const bp = filt(ctx, 'bandpass', 1050, 6);
      bp.connect(g);
      osc(ctx, 'triangle', 1050, t, end).connect(bp);
      noise(ctx, t, 0.02).connect(bp);
    } else if (inst === 'snare') {
      const end = t + 0.18;
      const gn = hitEnv(ctx, t, 0.35 * hit, end, out);
      noise(ctx, t, 0.2).connect(filt(ctx, 'highpass', 1600)).connect(gn);
      const gb = hitEnv(ctx, t, 0.3, t + 0.08, out);
      const body = osc(ctx, 'triangle', 190, t, t + 0.08);
      body.frequency.exponentialRampToValueAtTime(130, t + 0.08);
      body.connect(gb);
    } else if (inst === 'clap') {
      // a few quick bursts, like several hands landing together
      const bp = filt(ctx, 'bandpass', 1300, 1.2);
      bp.connect(out);
      [0, 0.011, 0.022].forEach(function (off, i) {
        const g = ctx.createGain();
        const st = t + off;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.5 * hit, st + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, st + (i === 2 ? 0.16 : 0.012));
        g.connect(bp);
        noise(ctx, st, i === 2 ? 0.17 : 0.015).connect(g);
      });
    }
  }

  // Metronome click. accent: downbeat. loud: count-in. sub: a subdivision click between beats
  // Each metronome sound is scaled so a plain beat is about as loud as an instrument note on
  // a beat (measured: RMS over the loudest 60 ms), so the two volume sliders cover the same range.
  const METRO_NORM = { click: 5.2, woodblock: 3.85, cowbell: 4.7, hihat: 4.0 };
  // gated: a metronome beat (silenced by the Metronome switch); count-in clicks are not gated
  function click(t, accent, loud, sub, gated) {
    const ctx = ac();
    const out = ctx.createGain();
    out.gain.value = METRO_NORM[S.metroSound] || METRO_NORM.click;
    out.connect(gated ? ctx.metroGate : ctx.metroBus);
    const level = sub ? 0.45 : (loud ? 1.4 : 1) * (accent ? 1 : 0.7);   // count-in clicks a little louder
    const kind = S.metroSound;
    if (kind === 'woodblock') {
      const f = sub ? 700 : (accent ? 1250 : 950);
      const end = t + 0.08;
      const g = hitEnv(ctx, t, 0.22 * level, end, out);
      const bp = filt(ctx, 'bandpass', f, 7);
      bp.connect(g);
      osc(ctx, 'triangle', f, t, end).connect(bp);
      noise(ctx, t, 0.015).connect(bp);
    } else if (kind === 'cowbell') {
      const end = t + (sub ? 0.06 : 0.14);
      const g = hitEnv(ctx, t, 0.08 * level, end, out);
      const bp = filt(ctx, 'bandpass', accent ? 900 : 760, 3);
      bp.connect(g);
      const k = accent ? 1.15 : 1;
      osc(ctx, 'square', 540 * k, t, end).connect(bp);
      osc(ctx, 'square', 800 * k, t, end).connect(bp);
    } else if (kind === 'hihat') {
      const end = t + (accent ? 0.07 : 0.035);
      const g = hitEnv(ctx, t, 0.22 * level, end, out);
      noise(ctx, t, 0.08).connect(filt(ctx, 'highpass', sub ? 9000 : 7000)).connect(g);
    } else {
      const o = osc(ctx, 'sine', sub ? 1150 : (accent ? 2200 : 1600), t, t + 0.04);
      o.connect(hitEnv(ctx, t, 0.16 * level, t + 0.04, out));
    }
  }
  function clearHighlights() {
    document.querySelectorAll('.is-playing').forEach(function (e) { e.classList.remove('is-playing'); });
    document.querySelectorAll('.playhead, .playhead-edge').forEach(function (e) { e.style.display = 'none'; });
    document.querySelectorAll('.countdown').forEach(function (e) { e.hidden = true; });
    document.querySelectorAll('[data-glow]').forEach(function (e) { paintNote(e, 0); e.style.strokeOpacity = ''; });
    [scoreView, typeof dview !== 'undefined' ? dview : null, typeof bview !== 'undefined' ? bview : null].forEach(function (v) {
      if (v && v.barGeo) v.barGeo.forEach(function (g) { (g.grid || []).forEach(function (sl) { sl.k = 0; }); });
    });
    [scoreView, typeof dview !== 'undefined' ? dview : null, typeof bview !== 'undefined' ? bview : null].forEach(function (v) { if (v) v.glowK = []; });
    // stopped: put the bouncing balls away (and drop their trails) so none stays frozen
    [scoreView, typeof dview !== 'undefined' ? dview : null, typeof bview !== 'undefined' ? bview : null].forEach(function (v) { updateBalls(v, null); });
    document.querySelectorAll('g.ball, g.wrap-ghost').forEach(function (e) { e.style.display = 'none'; });
    document.querySelectorAll('.grid-run-fill').forEach(function (e) { e.setAttribute('width', 0); });
    document.querySelectorAll('.reveal-cover').forEach(function (e) { e.setAttribute('width', 0); });   // stopped: show it all to check
    if (typeof updateConductor === 'function') updateConductor(null);
    document.querySelectorAll('.grid-now').forEach(function (e) {
      e.classList.remove('grid-now');
      e.style.opacity = '';
      e.style.fillOpacity = '';
      e.style.strokeOpacity = '';
    });
    litSlot = null;
  }
  function stopAll() {
    P.token++;
    P.nodes.slice().forEach(function (nd) { try { nd.stop(); } catch (e) { /* already stopped */ } });
    P.nodes = [];
    cancelAnimationFrame(P.raf);
    clearHighlights();
    const f = P.onStop;
    P.onStop = null;
    if (f) f();
  }
  // seq items: { pos, d, attack, dur, el: () => Element }
  // Sound may only start within a moment of a real (trusted) click, tap or key press,
  // so nothing can start playback on load, reload or a live update of the page.
  let lastGesture = -1e9;
  document.addEventListener('pointerdown', function (e) { if (e.isTrusted) lastGesture = performance.now(); }, true);
  function play(opts) {
    stopAll();
    if (!opts.trusted && performance.now() - lastGesture > 1500) { return false; }
    // a fresh audio context if the old one went stale in the background; chained exam plays
    // run without a tap, so they keep the running one
    const ctx = opts.trusted ? ac() : freshAudio();
    const token = P.token;
    P.onStop = opts.onStop || null;
    P.loop = !!opts.loop;
    P.looped = false;
    const spb = 60 / S.bpm;
    let start = ctx.currentTime + 0.12;
    const countStart = start;
    const startedAt = performance.now();
    for (let k = 0; k < opts.countIn; k++) click(start + k * spb, k === 0, true);
    start += opts.countIn * spb;
    const playStart = start;
    let lastCount = null;
    const passLen = opts.totalBeats * spb;

    function schedulePass(s) {
      if (!opts.noMetro) {   // always scheduled; the Metronome switch opens or closes the gate
        // clicks per beat: 1 = beats only, then eighths, then sixteenths (see clicksPerBeat)
        const cpb = clicksPerBeat(opts.ternary);
        for (let k = 0; k < opts.totalBeats; k++) {
          for (let j = 0; j < cpb; j++) {
            click(s + (k + j / cpb) * spb, j === 0 && k % opts.accentEvery === 0, false, j > 0, true);
          }
        }
      }
      return opts.seq.map(function (ev) {
        if (ev.attack) tone(s + ev.pos * spb, ev.dur * spb, ev.w, ev.midi);
        return { t: s + ev.pos * spb, end: s + (ev.pos + ev.d) * spb, el: ev.el };
      });
    }
    let items = schedulePass(start);
    let passEnd = start + passLen;
    let passStart = start;
    let queued = false;
    let lit = null;

    function tick() {
      if (token !== P.token) return;
      const now = ctx.currentTime;
      // the sound clock should be running within a moment; if not, the context is stuck
      if (ctx.state !== 'running' && performance.now() - startedAt > 800) audioStale = true;
      if (opts.loop && !queued && now > passEnd - 0.3) {
        items = items.concat(schedulePass(passEnd));
        queued = true;
      }
      if (now >= passEnd) {
        if (opts.loop) {
          const old = passEnd;
          items = items.filter(function (it) { return it.t >= old - 1e-6; });
          passStart = old;
          P.looped = true;
          passEnd += passLen;
          queued = false;
        } else {
          stopAll();
          return;
        }
      }
      // Visuals follow what you actually hear: the sound reaches the speakers later than it is
      // scheduled (the device's output delay, large on Bluetooth), while each frame appears about
      // one frame after it is drawn. Shift the visual clock by the difference.
      const outDelay = Math.min(0.5, Math.max(0, (ctx.outputLatency || 0) + (ctx.baseLatency || 0)));
      const vnow = now - outDelay + 1 / 60;
      let vpos = vnow >= passStart ? (vnow - passStart) / spb : null;
      // Looping: the sound starts the next pass a moment before the (delayed) visuals reach it.
      // Until they do, keep them on the end of the previous pass, so the playhead and balls
      // glide round to the start instead of blinking out and snapping back in.
      if (vpos === null && opts.loop && passStart > playStart + 1e-6) vpos = (vnow - passStart) / spb + opts.totalBeats;
      if (vpos !== null && opts.loop && vpos >= opts.totalBeats) vpos -= opts.totalBeats;
      if (opts.onPos) opts.onPos(vpos);
      // Beat position including the count-in (negative), for the conductor
      if (opts.onBeat) {
        let bpos = vpos;
        if (bpos === null && vnow >= countStart) bpos = (vnow - countStart) / spb - opts.countIn;
        opts.onBeat(bpos);
      }
      // Count-in numbers: 4 3 2 1 (or however many beats the count-in has)
      if (opts.onCount) {
        let n = null;
        if (opts.countIn && vnow < playStart) {
          const k = Math.floor((vnow - countStart) / spb + 1e-6);
          if (k >= 0) n = opts.countIn - k;
        }
        if (n !== lastCount) { opts.onCount(n); lastCount = n; }
      }
      let cur = null;
      for (let i = 0; i < items.length; i++) {
        // notes are now coloured by updateNoteGlow (distance to the playhead), not switched on/off
        break;
      }
      if (cur !== lit) {
        // el() may return one element or a list (note group, stem, beams)
        [].concat(lit || []).forEach(function (e) { e.classList.remove('is-playing'); });
        [].concat(cur || []).forEach(function (e) { e.classList.add('is-playing'); });
        lit = cur;
      }
      P.raf = requestAnimationFrame(tick);
    }
    P.raf = requestAnimationFrame(tick);
    return true;
  }

  // ---------- Practice UI ----------
  const ICON_PLAY = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="1"/></svg>';
  let practicePlaying = false;
  function setPlayBtn() {
    $('#playBtn').innerHTML = practicePlaying ? ICON_STOP + 'Stop' : ICON_PLAY + 'Play';
  }

  function buildPanel() {
    const box = $('#listChips');
    holdPage();   // keep the page height while this redraws
    box.innerHTML = '';
    LISTS.forEach(function (L) {
      const lab = document.createElement('label');
      lab.className = 'chip';
      lab.innerHTML = '<input type="checkbox" id="list-' + L.id + '"><span><b>' + L.name + '</b><small>' + L.sub + '</small></span>';
      box.appendChild(lab);
      const inp = lab.querySelector('input');
      inp.checked = S.lists.indexOf(L.id) >= 0;
      inp.addEventListener('change', function () {
        const next = LISTS.map(function (x) { return x.id; }).filter(function (id) { return $('#list-' + id).checked; });
        if (!next.length) { inp.checked = true; return; }
        S.lists = next;
        regenerate();
      });
    });
    // meters: 2/4 to 5/4, and compound 6/8 to 15/8 (value 'c2' = two dotted-quarter beats)
    syncMeterUi();
    document.querySelectorAll('input[name="meter"]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.ternary = r.value.charAt(0) === 'c';
        S.meter = Number(r.value.replace('c', ''));
        syncMeterUi();
        regenerate();
      });
    });
    // number of bars: one button per choice, 1 to 8
    $('#bars-' + S.bars).checked = true;
    document.querySelectorAll('input[name="bars"]').forEach(function (r) {
      r.addEventListener('change', function () { S.bars = Number(r.value); regenerate(); });
    });
    document.body.classList.toggle('no-boxes', !S.boxes);
    document.body.classList.toggle('no-circles', !S.circles);
    document.body.classList.toggle('beat-colors', !!S.beatColors);
    document.body.classList.toggle('no-aids', !S.aids);
    ['ties', 'metro', 'countIn', 'aids', 'grid', 'pulse', 'boxes', 'circles', 'highlight', 'beatLines', 'beatMarks', 'beatColors', 'runFill', 'loop', 'punch'].forEach(function (k) {
      const el = $('#opt-' + k);
      el.checked = !!S[k];
      el.addEventListener('change', function () {
        S[k] = el.checked;
        save();
        if (k === 'ties') regenerate();
        else if (k === 'aids') { document.body.classList.toggle('no-aids', !S.aids); refreshViews(); }
        else if (k === 'counts' || k === 'beatLines' || k === 'beatMarks' || k === 'runFill' || k === 'grid' || k === 'pulse' || k === 'tracer' || k === 'metroBall') refreshViews();
        else if (k === 'boxes') document.body.classList.toggle('no-boxes', !S.boxes);
        else if (k === 'metro' && actx) actx.metroGate.gain.setTargetAtTime(S.metro ? 1 : 0, actx.currentTime, 0.01);   // takes effect mid-play
        else if (k === 'beatColors') document.body.classList.toggle('beat-colors', !!S.beatColors);
        else if (k === 'circles') { document.body.classList.toggle('no-circles', !S.circles); refreshViews(); }
        else if (k === 'highlight' || k === 'playhead') clearHighlights();
        else if ((k === 'loop' || k === 'punch') && practicePlaying) startPractice();
      });
    });
    // Melody
    $('#opt-melody').checked = !!S.melody;
    $('#keySel').value = S.key;
    const syncMelodyUi = function () {
      $('#keySel').disabled = !S.melody;
      $('#opt-legato').disabled = !S.melody;
      $('#newBtn').textContent = S.melody ? 'New melody' : 'New rhythm';   // one button: rhythm or melody
    };
    $('#opt-legato').checked = !!S.legato;
    $('#opt-legato').addEventListener('change', function () { S.legato = $('#opt-legato').checked; save(); if (practicePlaying) startPractice(); });
    syncMelodyUi();
    $('#opt-melody').addEventListener('change', function () {
      S.melody = $('#opt-melody').checked;
      if (S.melody) { S.inst = 'synth'; syncMixer(); }   // melody: synth by default (pitched, clear onsets)
      // back to rhythm only: the woodblock suits plain rhythms
      if (!S.melody) { S.inst = 'woodblock'; syncMixer(); }
      save(); syncMelodyUi(); if (practicePlaying) stopAll(); showScore();
    });
    $('#keySel').addEventListener('change', function () { S.key = $('#keySel').value; save(); if (practicePlaying) stopAll(); applyMelody(score); showScore(); });
    $('#nt-' + S.notation).checked = true;
    document.querySelectorAll('input[name="notation"]').forEach(function (r) {
      r.addEventListener('change', function () { S.notation = r.value; revealed = false; save(); showScore(); });
    });
    $('#sub-' + S.sub).checked = true;
    document.querySelectorAll('input[name="sub"]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.sub = Number(r.value);
        save();
        if (S.metroBall || S.playheadFollow === 'metro' || S.staffFollow === 'metro') refreshViews();
        if (practicePlaying) startPractice();
      });
    });
    $('#bpm').value = S.bpm;
    syncMeterUi();
    $('#bpm').addEventListener('input', function () {
      S.bpm = Number($('#bpm').value);
      syncMeterUi();
      save();
    });
    $('#bpm').addEventListener('change', function () { if (practicePlaying) startPractice(); });

    // Dark mode toggle (remembered in this browser; without a choice the page follows the system)
    const ICON_MOON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.2 1.3a6.8 6.8 0 1 0 8.5 8.5A5.6 5.6 0 0 1 6.2 1.3z"/></svg>';
    const ICON_SUN = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2"/><path d="M8 .5v2M8 13.5v2M.5 8h2M13.5 8h2M2.7 2.7l1.4 1.4M11.9 11.9l1.4 1.4M2.7 13.3l1.4-1.4M11.9 4.1l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    const isDark = function () {
      const t = document.documentElement.getAttribute('data-theme');
      return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const paintThemeBtn = function () {
      const d = isDark();
      $('#themeBtn').innerHTML = d ? ICON_SUN : ICON_MOON;
      $('#themeBtn').setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
      $('#themeBtn').title = d ? 'Light mode' : 'Dark mode';
    };
    try { const t = localStorage.getItem('eur-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) { /* ignore */ }
    paintThemeBtn();
    $('#themeBtn').addEventListener('click', function () {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('eur-theme', next); } catch (e) { /* ignore */ }
      paintThemeBtn();
    });



    // Colors

    $('#colorGrid').innerHTML = FOLLOW_ROWS.map(function (f) {
      return '<div class="colorrow">' + f.name +
        '<div class="subseg" role="radiogroup" aria-label="' + f.name + ' follows">' +
        f.opts.map(function (o) {
          const dot = (f.id === 'playhead' || f.id === 'conduct') ? '' : o === 'notes' ? '<i class="swatch gold"></i>' : (o === 'metro' ? '<i class="swatch blue"></i>' : (o === 'both' ? '<i class="swatch gold"></i><i class="swatch blue"></i>' : ''));
          return '<label><input type="radio" name="fol-' + f.id + '" id="fol-' + f.id + '-' + o + '" value="' + o + '"><span>' + dot + FOLLOW_LABEL[o] + '</span></label>';
        }).join('') +
        '</div></div>';
    }).join('');
    FOLLOW_ROWS.forEach(function (f) {
      document.querySelectorAll('input[name="fol-' + f.id + '"]').forEach(function (r) {
        r.addEventListener('change', function () {
          setFollow(f.id, r.value);
          save();
          applyColors();
          refreshViews();
        });
      });
    });
    syncColors();

    // Mixer

    $('#inst').innerHTML = INSTRUMENTS.map(function (x) { return '<option value="' + x.id + '">' + x.name + '</option>'; }).join('');
    $('#metroSound').innerHTML = METRO_SOUNDS.map(function (x) { return '<option value="' + x.id + '">' + x.name + '</option>'; }).join('');
    syncMixer();
    $('#inst').addEventListener('change', function () {
      S.inst = $('#inst').value;
      save();
      if (practicePlaying) { startPractice(); return; }
      const ctx = freshAudio();
      tone(ctx.currentTime + 0.03, 0.45);   // preview the new sound
    });
    $('#metroSound').addEventListener('change', function () {
      S.metroSound = $('#metroSound').value;
      save();
      if (practicePlaying) { startPractice(); return; }
      const ctx = freshAudio();
      click(ctx.currentTime + 0.03, true, false, false);
    });
    ['volRhythm', 'volMetro'].forEach(function (k) {
      $('#' + k).addEventListener('input', function () {
        S[k] = Number($('#' + k).value);
        $('#' + k + 'Out').textContent = S[k];
        applyMix();
        save();
      });
    });

    $('#resetBtn').addEventListener('click', function () {
      stopAll();
      S = Object.assign({}, DEFAULTS, { lists: DEFAULTS.lists.slice() });
      syncPanel();
      regenerate();
      const btn = $('#resetBtn');
      btn.textContent = 'Defaults restored';
      setTimeout(function () { btn.textContent = 'Reset to defaults'; }, 1500);
    });
  }

  function syncColors() {
    FOLLOW_ROWS.forEach(function (f) { $('#fol-' + f.id + '-' + followValue(f.id)).checked = true; });
    applyColors();
  }
  function syncMixer() {
    $('#inst').value = S.inst;
    $('#metroSound').value = S.metroSound;
    ['volRhythm', 'volMetro'].forEach(function (k) {
      $('#' + k).value = S[k];
      $('#' + k + 'Out').textContent = S[k];
    });
    applyMix();
  }

  // Meter-dependent labels: the checked meter, the tempo unit (a dotted quarter in compound
  // time) and the metronome's clicks per beat (1 2 4 in x/4, 1 3 6 in x/8)
  function syncMeterUi() {
    const r = $('#meter-' + (S.ternary ? 'c' : '') + S.meter);
    if (r) r.checked = true;
    $('#bpmOut').textContent = (S.ternary ? '♩.=' : '♩=') + S.bpm;
    [1, 2, 4].forEach(function (v) {
      const lab = document.querySelector('#sub-' + v + ' + span');
      if (lab) lab.textContent = S.ternary ? { 1: 1, 2: 3, 4: 6 }[v] : v;
    });
  }

  // Put every control back in step with S (used after a reset)
  function syncPanel() {
    syncMixer();
    syncColors();
    LISTS.forEach(function (L) { $('#list-' + L.id).checked = S.lists.indexOf(L.id) >= 0; });
    syncMeterUi();
    $('#nt-' + S.notation).checked = true;
    $('#opt-melody').checked = !!S.melody;
    $('#keySel').value = S.key;
    $('#keySel').disabled = !S.melody;
    $('#newBtn').textContent = S.melody ? 'New melody' : 'New rhythm';
    $('#opt-legato').checked = !!S.legato;
    $('#opt-legato').disabled = !S.melody;
    $('#sub-' + S.sub).checked = true;
    $('#bars-' + S.bars).checked = true;
    ['ties', 'metro', 'countIn', 'aids', 'grid', 'pulse', 'boxes', 'circles', 'highlight', 'beatLines', 'beatMarks', 'beatColors', 'runFill', 'loop', 'punch'].forEach(function (k) {
      $('#opt-' + k).checked = !!S[k];
    });
    document.body.classList.toggle('no-aids', !S.aids);
    document.body.classList.toggle('beat-colors', !!S.beatColors);
    document.body.classList.toggle('no-boxes', !S.boxes);
    document.body.classList.toggle('no-circles', !S.circles);
    $('#bpm').value = S.bpm;
    syncMeterUi();
    if (actx) actx.metroGate.gain.setTargetAtTime(S.metro ? 1 : 0, actx.currentTime, 0.01);
  }

  // A settings change (or New rhythm) makes fresh rhythms for both Practice and Dictation
  function regenerate() {
    save();
    if (practicePlaying || dictPlaying || buildPlaying) stopAll();
    cancelExam(); exam = null;
    generate();
    dscore = makeRhythm();
    refreshViews();
  }

  function showScore() {
    const hide = S.notation === 'hidden' && !revealed;
    $('#score').hidden = hide;
    $('#hiddenMsg').hidden = !hide;
    if (!hide) renderScore();
    const names = LISTS.filter(function (L) { return meterLists().indexOf(L.id) >= 0; }).map(function (L) { return L.name; }).join(', ');
    $('#scoreMeta').textContent = score.bars.length + (score.bars.length === 1 ? ' bar' : ' bars') + ' · ' + meterLabel(score.bpb, score.ternary) + ' · ' + names;
    const note = $('#fillNote');
    if (score.filled) {
      note.textContent = 'Your selected lists only have two-beat cells, so leftover single beats in ' + meterLabel(score.bpb, score.ternary) + ' are filled with quarter notes.';
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }

  // Big count-in number over a score or card; n = null hides it
  function showCount(box, n) {
    if (!box) return;
    let el = box.querySelector(':scope > .countdown');
    if (!el) {
      el = document.createElement('div');
      el.className = 'countdown';
      el.setAttribute('aria-live', 'polite');
      box.appendChild(el);
    }
    if (n === null) { el.hidden = true; return; }
    el.hidden = false;
    el.classList.toggle('small', typeof n === 'string');   // text like "Next play in 5"
    el.innerHTML = '<span>' + n + '</span>';   // new span restarts the pop animation
  }

  function startPractice() {
    const ok = play({
      seq: makeSeq(score, function () { return scoreView; }),
      totalBeats: score.total,
      accentEvery: score.bpb, ternary: score.ternary,
      countIn: S.countIn ? score.bpb : 0,
      loop: S.loop,
      onPos: function (p) { movePlayhead(scoreView, p); },
      onCount: function (n) { showCount(document.querySelector('.score-card'), n); },
      onBeat: updateConductor,
      onStop: function () { practicePlaying = false; setPlayBtn(); }
    });
    if (!ok) return;
    practicePlaying = true;
    setPlayBtn();
  }
  function togglePractice() {
    if (practicePlaying) stopAll();
    else startPractice();
  }

  $('#playBtn').addEventListener('click', togglePractice);
  $('#newBtn').addEventListener('click', regenerate);
  $('#revealBtn').addEventListener('click', function () { revealed = true; showScore(); });

  // ---------- Dictation page ----------
  let dscore = null, dview = null, dictPlaying = false;
  // exam: { n: plays so far, total, timer, cancelled, done }
  let exam = null;
  function renderDictation() {
    if (!dscore) dscore = makeRhythm();
    dview = renderRhythm($('#dscore'), dscore, { timeSig: true, barlines: true, minWidth: 300, dictation: true });
    const names = LISTS.filter(function (L) { return meterLists().indexOf(L.id) >= 0; }).map(function (L) { return L.name; }).join(', ');
    $('#dMeta').textContent = dscore.bars.length + (dscore.bars.length === 1 ? ' bar' : ' bars') + ' · ' + meterLabel(dscore.bpb, dscore.ternary) + ' · ' + names;
    // one button per bar for bar-by-bar playback
    const box = $('#barBtns');
    holdPage();   // keep the page height while this redraws
    box.innerHTML = '';
    dscore.bars.forEach(function (bar, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill-btn';
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', 'Play bar ' + (i + 1));
      b.addEventListener('click', function () { playBar(i); });
      box.appendChild(b);
    });
    syncDictUi();
  }

  const examLocked = function () { return !!(S.exam && exam); };   // running or finished: no free replays
  function syncDictUi() {
    const btn = $('#dPlayBtn');
    if (S.exam) {
      if (exam && exam.done) { btn.innerHTML = ICON_PLAY + 'Exam done'; btn.disabled = true; }
      else if (exam) { btn.innerHTML = ICON_STOP + 'Stop exam'; btn.disabled = false; }
      else { btn.innerHTML = ICON_PLAY + 'Start exam'; btn.disabled = false; }
    } else {
      btn.disabled = false;
      btn.innerHTML = dictPlaying ? ICON_STOP + 'Stop' : ICON_PLAY + 'Play';
    }
    document.querySelectorAll('#barBtns button').forEach(function (b) { b.disabled = examLocked(); });
    const note = $('#examNote');
    if (S.exam && exam && exam.done) {
      note.textContent = 'Exam finished: ' + exam.total + ' plays. Check your answer by revealing beats, or press New dictation for another.';
      note.hidden = false;
    } else if (S.exam && exam) {
      note.textContent = 'Exam: play ' + exam.n + ' of ' + exam.total + '. Replays are locked until the next dictation.';
      note.hidden = false;
    } else note.hidden = true;
  }
  const setDPlayBtn = syncDictUi;

  function dictPlayOpts(extra) {
    return Object.assign({
      seq: makeSeq(dscore, function () { return dview; }),
      totalBeats: dscore.total,
      accentEvery: dscore.bpb, ternary: dscore.ternary,
      countIn: S.countIn ? dscore.bpb : 0,
      loop: false,
      onPos: function (p) { movePlayhead(dview, p); },
      onCount: function (n) { showCount($('#dCard'), n); },
      onStop: function () { dictPlaying = false; syncDictUi(); }
    }, extra || {});
  }
  function startDictation() {
    const ok = play(dictPlayOpts({ loop: S.loop }));
    if (!ok) return;
    dictPlaying = true;
    syncDictUi();
  }

  // Bar-by-bar: play just one bar (notes tied in from the bar before are struck so you can hear them)
  function playBar(b) {
    if (examLocked() || !dscore) return;
    const bpb = dscore.bpb, start = b * bpb, end = start + bpb;
    let first = true;
    const seq = makeSeq(dscore, function () { return dview; })
      .filter(function (ev) { return ev.pos >= start - 1e-6 && ev.pos < end - 1e-6; })
      .map(function (ev) {
        const e = Object.assign({}, ev, { pos: ev.pos - start, dur: Math.min(ev.dur, end - ev.pos) });
        if (first) { e.attack = true; first = false; }
        return e;
      });
    const ok = play(dictPlayOpts({
      seq: seq, totalBeats: bpb,
      onPos: function (p) { movePlayhead(dview, p === null ? null : p + start); }
    }));
    if (!ok) return;
    dictPlaying = true;
    syncDictUi();
  }

  // Exam mode: play the dictation a set number of times with a silent gap between, then lock
  function cancelExam() {
    if (!exam) return;
    exam.cancelled = true;
    clearInterval(exam.timer);
    showCount($('#dCard'), null);
  }
  function startExam() {
    exam = { n: 0, total: S.examPlays, timer: null, cancelled: false, done: false };
    examPlay(false);
  }
  function examPlay(chained) {
    if (!exam || exam.cancelled) return;
    exam.n++;
    const ok = play(dictPlayOpts({
      trusted: chained,   // later plays start from the timer, not a click
      noMetro: true,      // exam: no metronome during the plays (the count-in still sets the tempo)
      onPos: function (p) { movePlayhead(dview, p, true); },   // and no playhead
      onStop: function () {
        dictPlaying = false;
        if (!exam || exam.cancelled) { syncDictUi(); return; }
        if (exam.n >= exam.total) { exam.done = true; syncDictUi(); return; }
        // silent gap with a countdown, then the next play
        let left = S.examGap;
        showCount($('#dCard'), 'Next play in ' + left);
        exam.timer = setInterval(function () {
          left--;
          if (left > 0) { showCount($('#dCard'), 'Next play in ' + left); return; }
          clearInterval(exam.timer);
          showCount($('#dCard'), null);
          examPlay(true);
        }, 1000);
        syncDictUi();
      }
    }));
    if (!ok) { exam = null; syncDictUi(); return; }
    dictPlaying = true;
    syncDictUi();
  }

  function toggleDictation() {
    if (S.exam) {
      if (exam && exam.done) return;
      if (exam) { cancelExam(); exam = null; stopAll(); syncDictUi(); return; }
      startExam();
      return;
    }
    if (dictPlaying) stopAll(); else startDictation();
  }
  $('#dPlayBtn').addEventListener('click', toggleDictation);
  $('#dNewBtn').addEventListener('click', function () { cancelExam(); exam = null; stopAll(); dscore = makeRhythm(); renderDictation(); });
  $('#dRevealAll').addEventListener('click', function () { document.querySelectorAll('#dscore .beat-tile').forEach(function (t) { t.classList.add('open'); }); });
  $('#dHideAll').addEventListener('click', function () { document.querySelectorAll('#dscore .beat-tile').forEach(function (t) { t.classList.remove('open'); }); });
  // exam settings
  $('#opt-exam').checked = !!S.exam;
  $('#examPlays').value = String(S.examPlays);
  $('#examGap').value = String(S.examGap);
  $('#opt-exam').addEventListener('change', function () {
    S.exam = $('#opt-exam').checked; save();
    cancelExam(); exam = null; stopAll(); syncDictUi();
  });
  $('#examPlays').addEventListener('change', function () { S.examPlays = Number($('#examPlays').value); save(); });
  $('#examGap').addEventListener('change', function () { S.examGap = Number($('#examGap').value); save(); });
  syncDictUi();

  // ---------- Compose page (called Build in the code) ----------
  // The student assembles a rhythm from list cells. comp.bars[b] is a list of cell ids;
  // empty beats are filled with quarter rests for display (rests are not played).
  const REST = { id: 'rest', list: '-', name: 'Rest', notes: [{ d: 1, vf: 'q', dots: 0, rest: true }], beams: [], beats: 1 };
  const REST_DQ = { id: 'rest', list: '-', name: 'Rest', notes: [{ d: 1, vf: 'q', dots: 1, rest: true }], beams: [], beats: 1, ternary: true };   // one compound beat
  const compMeter = function () { return (S.ternary ? 'c' : '') + S.meter; };   // e.g. '4' = 4/4, 'c4' = 12/8
  const cellById = function (id) { return CELLS.find(function (c) { return c.id === id; }); };
  let comp = null, bmodel = null, bview = null, buildPlaying = false;
  const buildHistory = [];
  function loadComp() {
    try { comp = JSON.parse(localStorage.getItem('eur-build') || 'null'); } catch (e) { comp = null; }
    if (!comp || !Array.isArray(comp.bars)) comp = { meter: compMeter(), bars: [] };
  }
  function saveComp() { try { localStorage.setItem('eur-build', JSON.stringify(comp)); } catch (e) { /* ignore */ } }
  const barBeats = function (ids) { return ids.reduce(function (a, id) { const c = cellById(id); return a + (c ? c.beats : 0); }, 0); };
  function fitComp() {
    // keep the composition in step with the meter and number of bars
    if (String(comp.meter) !== compMeter()) comp = { meter: compMeter(), bars: [] };
    while (comp.bars.length < S.bars) comp.bars.push([]);
    comp.bars.length = S.bars;
  }
  function pushHistory() { buildHistory.push(JSON.stringify(comp)); if (buildHistory.length > 100) buildHistory.shift(); }

  function renderBuild() {
    if (!comp) loadComp();
    fitComp();
    const bpb = S.meter;
    const bars = comp.bars.map(function (ids) {
      const cells = ids.map(cellById).filter(Boolean);
      let rest = bpb - barBeats(ids);
      while (rest > 1e-6) { cells.push(S.ternary ? REST_DQ : REST); rest -= 1; }
      return { cells: cells };
    });
    bmodel = buildModel(bars, bpb, !!S.ternary);
    bview = renderRhythm($('#bscore'), bmodel, { timeSig: true, barlines: true, minWidth: 300, build: true });
    const filled = comp.bars.reduce(function (a, ids) { return a + barBeats(ids); }, 0);
    $('#bMeta').textContent = filled + ' of ' + (bpb * S.bars) + ' beats filled · ' + meterLabel(bpb, !!S.ternary);
    buildPalette();
    syncBuildBtns();
  }
  function syncBuildBtns() {
    $('#bPlayBtn').innerHTML = buildPlaying ? ICON_STOP + 'Stop' : ICON_PLAY + 'Play';
    $('#bUndo').disabled = !buildHistory.length;
  }

  // small notation for one cell (palette)
  function miniCell(host, cell) {
    holdPage();   // keep the page height while this redraws
    host.innerHTML = '';
    const beats = Math.max(1, Math.ceil(cell.beats));
    const W = Math.round(beats * 64 + 20), H = 74;
    const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
    renderer.resize(W, H);
    host.style.width = '';
    const svg = host.querySelector('svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.width = W + 'px';
    svg.style.height = 'auto';
    const ctx = renderer.getContext();
    const stave = new VF.Stave(0, -24, W);
    oneLine(stave);
    stave.setBegBarType(BT.NONE);
    stave.setEndBarType(BT.NONE);
    stave.setContext(ctx).draw();
    const built = buildCells([cell], null);
    const pibs = [];
    let p = 0;
    cell.notes.forEach(function (nt) { pibs.push(p); p += nt.d; });
    drawVoice(ctx, stave, built, beats, pibs, { origin: 6, beatW: (W - 12) / beats, ternary: cell.ternary });
  }
  let paletteKey = '';
  function buildPalette() {
    const key = S.lists.join(',') + '|' + compMeter();
    if (key === paletteKey && $('#palette').children.length) return;
    paletteKey = key;
    const root = $('#palette');
    holdPage();   // keep the page height while this redraws
    root.innerHTML = '';
    const lists = meterLists();   // only the lists that fit this meter (binary in x/4, ternary in x/8)
    LISTS.filter(function (L) { return lists.indexOf(L.id) >= 0; }).forEach(function (L) {
      const grp = document.createElement('div');
      grp.className = 'pal-group';
      grp.innerHTML = '<span class="tag" data-list="' + L.id + '">' + L.name + '</span><div class="pal-items"></div>';
      root.appendChild(grp);
      const items = grp.querySelector('.pal-items');
      CELLS.filter(function (c) { return c.list === L.id && c.beats <= S.meter + 1e-6; }).forEach(function (cell) {
        const it = document.createElement('div');
        it.setAttribute('role', 'button');
        it.tabIndex = 0;
        it.className = 'pal-item vf';
        it.draggable = true;
        it.title = cell.name + ' (' + cell.beats + (cell.beats === 1 ? ' beat' : ' beats') + ')';
        it.setAttribute('aria-label', 'Add ' + cell.name);
        items.appendChild(it);
        miniCell(it, cell);
        it.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('text/plain', cell.id);
          e.dataTransfer.effectAllowed = 'copy';
        });
        it.addEventListener('click', function () { addCell(cell.id, null, null); });
        it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addCell(cell.id, null, null); } });
      });
    });
    if (!root.children.length) root.innerHTML = '<p class="hint">Pick at least one list in the settings to fill the palette.</p>';
  }

  function flash(msg) {
    const n = $('#bNote');
    n.textContent = msg;
    n.hidden = false;
    clearTimeout(flash.t);
    flash.t = setTimeout(function () { n.hidden = true; }, 2200);
  }
  // add a cell: into bar b at beat position pib, or (b === null) the first bar with room
  function addCell(id, b, pib) {
    const cell = cellById(id);
    if (!cell) return;
    fitComp();
    const bpb = S.meter;
    if (b === null) {
      b = comp.bars.findIndex(function (ids) { return barBeats(ids) + cell.beats <= bpb + 1e-6; });
      if (b < 0) { flash('No bar has room for ' + cell.name.toLowerCase() + ' (' + cell.beats + ' beats). Remove something or add bars.'); return; }
    }
    const ids = comp.bars[b];
    if (barBeats(ids) + cell.beats > bpb + 1e-6) { flash('Bar ' + (b + 1) + ' only has ' + (bpb - barBeats(ids)) + ' beat(s) left.'); return; }
    // insert before the first placed cell that starts at or after the drop point
    let at = ids.length;
    if (pib !== null) {
      let acc = 0;
      for (let i = 0; i < ids.length; i++) {
        if (acc + 1e-6 >= pib) { at = i; break; }
        acc += cellById(ids[i]).beats;
      }
    }
    pushHistory();
    ids.splice(at, 0, id);
    saveComp();
    renderBuild();
  }
  function removeCell(b, i) {
    pushHistory();
    comp.bars[b].splice(i, 1);
    saveComp();
    renderBuild();
  }

  // drop onto the staff: find the bar and beat under the pointer
  $('#bCard').addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; $('#bCard').classList.add('drop'); });
  $('#bCard').addEventListener('dragleave', function () { $('#bCard').classList.remove('drop'); });
  $('#bCard').addEventListener('drop', function (e) {
    e.preventDefault();
    $('#bCard').classList.remove('drop');
    const id = e.dataTransfer.getData('text/plain');
    const svg = $('#bscore svg');
    if (!id || !svg || !bview) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    let hit = null;
    bview.barGeo.forEach(function (g, b) {
      const x0 = g.anchors[0].x - g.beatW * slotLead(!!S.ternary);
      if (q.y >= g.rowTop && q.y < g.rowTop + g.rowH && q.x >= x0 - 8 && q.x <= x0 + S.meter * g.beatW + 8) {
        hit = { b: b, pib: Math.max(0, Math.min(S.meter, (q.x - x0) / g.beatW)) };
      }
    });
    if (hit) addCell(id, hit.b, hit.pib); else flash('Drop the rhythm onto one of the bars.');
  });

  function startBuild() {
    if (!bmodel || !bmodel.flat.some(function (f) { return !f.rest; })) { flash('Add some rhythms first.'); return; }
    const ok = play({
      seq: makeSeq(bmodel, function () { return bview; }),
      totalBeats: bmodel.total, accentEvery: bmodel.bpb, ternary: bmodel.ternary,
      countIn: S.countIn ? bmodel.bpb : 0, loop: S.loop,
      onPos: function (p) { movePlayhead(bview, p); },
      onCount: function (n) { showCount($('#bCard'), n); },
      onStop: function () { buildPlaying = false; syncBuildBtns(); }
    });
    if (!ok) return;
    buildPlaying = true;
    syncBuildBtns();
  }
  function toggleBuild() { if (buildPlaying) stopAll(); else startBuild(); }
  $('#bPlayBtn').addEventListener('click', toggleBuild);
  $('#bUndo').addEventListener('click', function () {
    if (!buildHistory.length) return;
    comp = JSON.parse(buildHistory.pop());
    saveComp();
    renderBuild();
  });
  $('#bClear').addEventListener('click', function () {
    pushHistory();
    comp = { meter: S.meter, bars: [] };
    saveComp();
    renderBuild();
  });

  // ---------- Glossary ----------
  // Each card is a one-bar model drawn and played with the same code and settings as Practice.
  const glossaryCards = [];
  function buildGlossary() {
    const root = $('#glossaryLists');
    holdPage();   // keep the page height while this redraws
    root.innerHTML = '';
    glossaryCards.length = 0;
    LISTS.forEach(function (L) {
      const sec = document.createElement('section');
      sec.className = 'gl-sec';
      sec.innerHTML = '<header class="gl-head"><span class="tag" data-list="' + L.id + '">' + L.name + '</span><h2>' + L.sub + '</h2><p>' + L.desc + '</p></header><div class="gl-grid"></div>';
      root.appendChild(sec);
      const grid = sec.querySelector('.gl-grid');
      CELLS.filter(function (c) { return c.list === L.id; }).forEach(function (cell) {
        const card = document.createElement('article');
        card.className = 'gl-card';
        const beatsTxt = (cell.beats === 1 ? '1 beat' : cell.beats + ' beats') + (cell.ternary ? ' (dotted quarter) · 6/8–15/8' : '');
        card.innerHTML = '<div class="gl-notation vf"></div><div class="gl-info"><h3>' + cell.name + '</h3><p class="counts">' + cellCounts(cell) + '</p><p>' + beatsTxt + '</p></div><button class="play-mini" type="button" aria-label="Play ' + cell.name + '">' + ICON_PLAY + '</button>';
        grid.appendChild(card);
        const entry = {
          card: card,
          host: card.querySelector('.gl-notation'),
          model: buildModel([{ cells: [cell] }], Math.max(1, Math.ceil(cell.beats))),
          view: null
        };
        glossaryCards.push(entry);
        const btn = card.querySelector('.play-mini');
        btn.addEventListener('click', function () {
          if (card.classList.contains('playing')) { stopAll(); return; }
          const m = entry.model;
          const ok = play({
            seq: makeSeq(m, function () { return entry.view; }),
            totalBeats: m.total,
            accentEvery: m.bpb, ternary: m.ternary,
            countIn: S.countIn ? Math.max(2, m.bpb) : 0,
            loop: S.loop,
            onPos: function (p) { movePlayhead(entry.view, p); },
            onCount: function (n) { showCount(card, n); },
            onStop: function () { card.classList.remove('playing'); btn.innerHTML = ICON_PLAY; }
          });
          if (!ok) return;
          card.classList.add('playing');
          btn.innerHTML = ICON_STOP;
        });
      });
    });
  }
  function renderGlossary() {
    glossaryCards.forEach(function (e) {
      e.view = renderRhythm(e.host, e.model, { timeSig: false, barlines: false, oneRow: true, minWidth: 180, fallbackWidth: 240 });
    });
  }

  // Redraw whichever tab is showing (used when a display setting changes)
  function refreshViews() {
    if (location.hash === '#glossary') renderGlossary();
    else if (location.hash === '#dictation') renderDictation();
    else if (location.hash === '#compose') renderBuild();
    else showScore();
  }

  // ---------- Routing ----------
  function route() {
    if (location.hash === '#build') history.replaceState(null, '', '#compose');   // old link to the page now called Compose
    if (location.hash === '#options') history.replaceState(null, '', '#settings'); // old link to the page now called Settings
    const views = { '#glossary': 'glossary', '#dictation': 'dictation', '#compose': 'build', '#settings': 'options' };
    const view = views[location.hash] || 'practice';
    ['practice', 'dictation', 'build', 'glossary', 'options'].forEach(function (v) {
      $('#view-' + v).hidden = v !== view;
      $('#tab-' + v).setAttribute('aria-selected', String(v === view));
    });
    // phones: the tab row scrolls sideways; bring the open page's tab into view
    const tabRow = document.querySelector('.tabs'), cur = $('#tab-' + view);
    if (tabRow.scrollWidth > tabRow.clientWidth) {
      const l = cur.offsetLeft - tabRow.offsetLeft, r = l + cur.offsetWidth;
      if (l < tabRow.scrollLeft) tabRow.scrollLeft = l - 8;
      else if (r > tabRow.scrollLeft + tabRow.clientWidth - 28) tabRow.scrollLeft = r - tabRow.clientWidth + 36;
    }
    // the general bar shows this page's Play / New / ... buttons (Glossary has none)
    document.querySelectorAll('.general .stage-bar').forEach(function (b) { b.hidden = b.dataset.page !== view; });
    cancelExam(); exam = null;
    // one rhythm-settings panel, shown on whichever of Practice / Dictation is open
    const layout = view === 'dictation' ? $('#dLayout') : (view === 'build' ? $('#bLayout') : $('#pLayout'));
    const panel = document.querySelector('aside.panel');
    if (panel && panel.parentNode !== layout) layout.insertBefore(panel, layout.firstChild);
    stopAll();
    refreshViews();
  }
  window.addEventListener('hashchange', route);

  document.addEventListener('keydown', function (e) {
    if (e.isTrusted) lastGesture = performance.now();
    if (e.target !== document.body) return;
    if (location.hash === '#glossary' || location.hash === '#settings') return;
    const dict = location.hash === '#dictation';
    if (location.hash === '#compose') { if (e.code === 'Space') { e.preventDefault(); toggleBuild(); } return; }
    if (e.code === 'Space') { e.preventDefault(); if (dict) toggleDictation(); else togglePractice(); }
    else if (e.key === 'n' || e.key === 'N') { if (dict) $('#dNewBtn').click(); else regenerate(); }
    else if (e.key === 'l' || e.key === 'L') { $('#opt-loop').click(); }
  });

  // Redraw when the page gets wider or narrower. Phones also fire resize while scrolling (the
  // address bar slides in and out, changing only the height); redrawing then interrupts the
  // scroll and can throw it back, so height-only changes are ignored.
  let rt = 0;
  let lastW = window.innerWidth;
  window.addEventListener('resize', function (e) {
    if (e.isTrusted && window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (location.hash === '#glossary') renderGlossary();
      else if (location.hash === '#dictation') renderDictation();
      else if (location.hash === '#compose') renderBuild();
      else if (!$('#score').hidden) renderScore();
    }, 150);
  });

  // ---------- Keep what you tapped where it was ----------
  // Most settings redraw the score, which can change its height and push everything below it
  // (on phones, the rhythm settings) up or down. Chrome compensates, Safari doesn't: measure
  // the tapped control before the change and scroll by however far it moved afterwards.
  (function () {
    let pending = null;
    function remember(e) {
      const t = e.target && e.target.closest ? e.target.closest('label, button, input, select, [role="radio"], .pill') || e.target : null;
      if (!t || !t.getBoundingClientRect || t.closest('.tour')) return;
      const id = t.id || (t.querySelector && t.querySelector('[id]') ? t.querySelector('[id]').id : '');
      const top = t.getBoundingClientRect().top;
      const rec = { el: t, id: id, top: top, y: window.scrollY };
      pending = rec;
      const settle = function () {
        if (pending !== rec) return;
        if (Math.abs(window.scrollY - rec.y) > 2) return;     // the user has scrolled since: leave it
        let el = rec.el;
        if (!el.isConnected && rec.id) {
          const byId = document.getElementById(rec.id);
          el = byId ? (byId.closest('label') || byId) : null;
        }
        if (!el || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        if (!r.height) return;                                 // hidden now (e.g. another page)
        const d = r.top - rec.top;
        if (Math.abs(d) > 1) { window.scrollBy(0, d); rec.y = window.scrollY; }
      };
      requestAnimationFrame(settle);
      setTimeout(settle, 250);                                 // redraws that wait a moment
    }
    document.addEventListener('click', remember, true);
    document.addEventListener('change', function (e) { if (e.target && e.target.tagName === 'SELECT') remember(e); }, true);
    // sliders (e.g. Bars) redraw on every step while dragged, so keep the slider under your finger
    document.addEventListener('input', function (e) { if (e.target && e.target.type === 'range') remember(e); }, true);
  })();

  // ---------- Collapsible rhythm settings ----------
  // Folds the lists / meter / bars panel down to one line (handy on a phone in landscape).
  // The choice is remembered; the score re-renders to use the freed width.
  function panelSummary() {
    $('#panelSum').textContent = S.bars + (S.bars === 1 ? ' bar' : ' bars') + ' · ' + meterLabel(S.meter, !!S.ternary) + (S.melody ? ' · melody' : '');
    // each section's dropdown header (phones) shows its current choice
    // the lists actually used in this meter: binary in x/4, ternary in x/8
    const short = { L1: '1', L2: '2', A2: '2 alt', L3: '3', T1: 'T1' };
    const used = meterLists();
    const sums = {
      lists: LISTS.filter(function (L) { return used.indexOf(L.id) >= 0; }).map(function (L) { return short[L.id]; }).join(', '),
      meter: meterLabel(S.meter, !!S.ternary),
      melody: S.melody ? (KEYS[S.key] || KEYS.C).name : 'Off',
      bars: String(S.bars),
      options: S.ties ? 'on' : 'off'
    };
    document.querySelectorAll('.rs-chips .fs-sum').forEach(function (el) { el.textContent = sums[el.dataset.sum] || ''; });
  }

  // Phones: the rhythm settings become one row of chips (Lists, Meter, Bars, Melody, Ties) that
  // scrolls sideways; a chip opens its section just below the row, and closes it again.
  // Desktop hides the chips and shows the sections in the left column, as before.
  (function () {
    const kinds = ['lists', 'meter', 'bars', 'melody', 'options'];
    const names = ['Lists', 'Meter', 'Bars', 'Melody', 'Ties'];
    const row = document.createElement('div');
    row.className = 'rs-chips';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Rhythm settings');
    const sets = Array.prototype.slice.call(document.querySelectorAll('#panelBody > fieldset'));
    sets.forEach(function (fs, i) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'rs-chip';
      chip.setAttribute('aria-expanded', 'false');
      chip.innerHTML = '<span class="rs-name"></span><span class="fs-sum"></span><svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>';
      chip.querySelector('.rs-name').textContent = names[i];
      chip.querySelector('.fs-sum').dataset.sum = kinds[i];
      chip.addEventListener('click', function () {
        const open = !fs.classList.contains('open');
        sets.forEach(function (f, j) { f.classList.toggle('open', open && j === i); });
        // wide screens: drop down under this chip (kept inside the score's width)
        if (open && window.innerWidth > 860) {
          const panelW = fs.parentNode.offsetWidth;
          const w = Math.min(panelW, 440);
          fs.style.left = Math.max(0, Math.min(chip.offsetLeft - row.scrollLeft, panelW - w)) + 'px';
        } else fs.style.left = '';
        row.querySelectorAll('.rs-chip').forEach(function (c, j) { c.setAttribute('aria-expanded', String(open && j === i)); });
      });
      row.appendChild(chip);
    });
    const body = $('#panelBody');
    body.parentNode.insertBefore(row, body);
    // the Notation aids on/off toggle sits at the end of the same row
    const aids = document.querySelector('.aids-pill');
    if (aids) row.appendChild(aids);
    // tap anywhere else (or Esc) closes the open dropdown
    const closeAll = function () {
      sets.forEach(function (f) { f.classList.remove('open'); });
      row.querySelectorAll('.rs-chip').forEach(function (c) { c.setAttribute('aria-expanded', 'false'); });
    };
    document.addEventListener('pointerdown', function (e) {
      if (!sets.some(function (f) { return f.classList.contains('open'); })) return;
      if (e.target.closest && e.target.closest('aside.panel')) return;
      closeAll();
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    window.addEventListener('hashchange', closeAll);
    // a width change (rotating a phone, resizing the window) would leave it placed for the old width
    let chipW = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth !== chipW) { chipW = window.innerWidth; closeAll(); } });
  })();
  function setPanelCollapsed(c, keep) {
    const panel = document.querySelector('aside.panel');
    if (!panel) return;
    const was = panel.classList.contains('collapsed');
    panel.classList.toggle('collapsed', c);
    document.body.classList.toggle('panel-collapsed', c);
    $('#panelToggle').setAttribute('aria-expanded', String(!c));
    panelSummary();
    if (!keep) { try { localStorage.setItem('eur-panel-collapsed', c ? '1' : ''); } catch (e) { /* ignore */ } }
    if (was !== c) window.dispatchEvent(new Event('resize'));   // redraw the score at its new width
  }
  $('#panelToggle').addEventListener('click', function () {
    setPanelCollapsed(!document.querySelector('aside.panel').classList.contains('collapsed'));
  });
  document.querySelector('aside.panel').addEventListener('change', panelSummary);
  document.querySelector('aside.panel').addEventListener('input', panelSummary);
  (function () {
    let c = false;
    try { c = !!localStorage.getItem('eur-panel-collapsed'); } catch (e) { /* ignore */ }
    setPanelCollapsed(c, true);
  })();

  // Playback only ever starts from a real click or key press; stop it when the page is hidden or unloaded
  window.addEventListener('pagehide', function () { window.__eurStop(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopAll(); audioStale = true; } });
  window.addEventListener('pagehide', function () { audioStale = true; });
  window.addEventListener('pageshow', function (e) { if (e.persisted) audioStale = true; });   // restored from the back/forward cache

  // ---------- Walkthrough (first visit, or the Tour button) ----------
  // A spotlight over one part of the page with a tooltip; Back / Next / Skip, arrow keys and Esc.
  // Each step can set the page up first: which tab is open (page), whether the Settings panel
  // is open (opts), and whether melody mode is shown (melody). Everything is put back afterwards.
  const TOUR = [
    { page: 'practice', sel: '.tabs', title: 'Welcome to Eurhythmics Lab', text: 'Practice plays random rhythms, Dictation hides one for you to write down, Compose lets you drag rhythms onto a staff, and Glossary lists every rhythm with a play button.' },
    { page: 'practice', sel: '.general', title: 'Play, tempo and metronome', text: 'Play the rhythm (Space) or make a new one (N). Next to them: the tempo, the metronome and its clicks per beat, count-in and Loop.' },
    { page: 'practice', sel: '#pLayout aside.panel', title: 'Rhythm settings', text: 'Choose the binary lists, meter, number of bars, melody mode and ties.' },
    { page: 'practice', sel: '#tab-options', title: 'Settings', text: 'Sound, what is shown under the staff, display modes and playback visuals live on their own page, and apply everywhere. Replay this tour any time with the Tour button.' }
  ];
  let tourSaved = null;   // what the tour changed, to put back at the end
  function tourSetup(st) {
    // open the right page
    if (location.hash !== '#' + st.page) { history.replaceState(null, '', '#' + st.page); route(); }
    // melody mode, shown temporarily
    const wantMelody = st.melody ? true : tourSaved.melody;
    if (S.melody !== wantMelody) {
      S.melody = wantMelody;
      $('#opt-melody').checked = wantMelody;
      $('#newBtn').textContent = wantMelody ? 'New melody' : 'New rhythm';
      $('#keySel').disabled = !wantMelody;
      $('#opt-legato').disabled = !wantMelody;
      if (location.hash === '#practice' || !location.hash) showScore();
    }
  }

  let tourStep = -1, tourEls = null;
  function tourTarget(i) {
    const el = document.querySelector(TOUR[i].sel);
    return el && el.getClientRects().length ? el : null;
  }
  function placeTour() {
    if (tourStep < 0 || !tourEls) return;
    const el = tourTarget(tourStep);
    const tip = tourEls.tip, spot = tourEls.spot;
    // the page may be zoomed (desktop 125%): measurements come back in screen pixels, while
    // positions we set are scaled again by the zoom, so convert into the page's own units
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const vw = window.innerWidth / z, vh = window.innerHeight / z;
    if (el) {
      const b = el.getBoundingClientRect(), pad = 6;
      const r = { top: b.top / z, left: b.left / z, width: b.width / z, height: b.height / z, bottom: b.bottom / z };
      const top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
      const w = Math.min(vw - left - 4, r.width + pad * 2), h = Math.min(vh - top - 4, r.height + pad * 2);
      Object.assign(spot.style, { top: top + 'px', left: left + 'px', width: w + 'px', height: h + 'px', opacity: 1 });
      // tooltip below the target when there is room, otherwise above, else centred
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let ty = r.bottom + 14;
      if (ty + th > vh - 8) ty = r.top - th - 14;
      if (ty < 8) ty = vh - th - 16;   // big targets: tuck the tip at the bottom of the screen
      let tx = r.left + r.width / 2 - tw / 2;
      tx = Math.max(12, Math.min(vw - tw - 12, tx));
      tip.style.top = ty + 'px';
      tip.style.left = tx + 'px';
    } else {
      spot.style.opacity = 0;
      tip.style.top = Math.max(8, (vh - tip.offsetHeight) / 2) + 'px';
      tip.style.left = Math.max(12, (vw - tip.offsetWidth) / 2) + 'px';
    }
  }
  function showTourStep(i) {
    tourStep = i;
    const st = TOUR[i];
    const tip = tourEls.tip;
    tip.querySelector('.tour-count').textContent = (i + 1) + ' / ' + TOUR.length;
    tip.querySelector('h4').textContent = st.title;
    tip.querySelector('p').textContent = st.text;
    tip.querySelector('.tour-back').disabled = i === 0;
    tip.querySelector('.tour-next').textContent = i === TOUR.length - 1 ? 'Done' : 'Next';
    tourSetup(st);
    // let the page settle (tab switch, panel, redraw) before pointing at the target
    setTimeout(function () {
      const el = tourTarget(i);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
      requestAnimationFrame(placeTour);
    }, 60);
    tip.querySelector('.tour-next').focus();
  }
  function endTour() {
    if (!tourEls) return;
    tourEls.root.remove();
    tourEls = null;
    tourStep = -1;
    // put back what the tour changed
    if (tourSaved) {
      tourSetup({ page: 'practice', opts: false, melody: false });
      tourSaved = null;
    }
    try { localStorage.setItem('eur-tour-done', '1'); } catch (e) { /* ignore */ }
    window.scrollTo({ top: 0 });
  }
  function startTour() {
    setPanelCollapsed(false, true);   // the tour points at the rhythm settings
    if (tourEls) return;
    stopAll();
    tourSaved = { melody: S.melody };
    if (location.hash && location.hash !== '#practice') { location.hash = '#practice'; }
    const root = document.createElement('div');
    root.className = 'tour';
    root.innerHTML = '<div class="tour-block"></div><div class="tour-spot"></div>' +
      '<div class="tour-tip" role="dialog" aria-modal="true" aria-labelledby="tourTitle">' +
      '<div class="tour-count"></div><h4 id="tourTitle"></h4><p></p>' +
      '<div class="tour-btns"><button type="button" class="btn btn-small tour-skip">Skip</button>' +
      '<span></span><button type="button" class="btn btn-small tour-back">Back</button>' +
      '<button type="button" class="btn btn-small primary tour-next">Next</button></div></div>';
    document.body.appendChild(root);
    tourEls = { root: root, tip: root.querySelector('.tour-tip'), spot: root.querySelector('.tour-spot') };
    root.querySelector('.tour-skip').addEventListener('click', endTour);
    root.querySelector('.tour-back').addEventListener('click', function () { if (tourStep > 0) showTourStep(tourStep - 1); });
    root.querySelector('.tour-next').addEventListener('click', function () { if (tourStep < TOUR.length - 1) showTourStep(tourStep + 1); else endTour(); });
    showTourStep(0);
  }
  document.addEventListener('keydown', function (e) {
    if (!tourEls) return;
    if (e.key === 'Escape') { e.preventDefault(); endTour(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); tourEls.root.querySelector('.tour-next').click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (tourStep > 0) showTourStep(tourStep - 1); }
  }, true);
  window.addEventListener('resize', function () { requestAnimationFrame(placeTour); });
  window.addEventListener('scroll', function () { requestAnimationFrame(placeTour); }, { passive: true });
  $('#tourBtn').addEventListener('click', startTour);

  buildPanel();
  practicePlaying = false;
  setPlayBtn();
  generate();
  buildGlossary();
  route();
  // ---------- Sound check (on page load) ----------
  // A browser can't tell whether the device volume is down or a phone's silent switch is on,
  // and it can't hear its own output, so this is a reminder with a test click, not a detector.
  // Shown on each load until "Don't show again" is ticked; the first-visit tour follows it.
  function soundCheck(then) {
    let off = false;
    try { off = !!localStorage.getItem('eur-soundcheck-off'); } catch (e) { /* ignore */ }
    if (off) { then(); return; }
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const phone = ios || /Android/i.test(navigator.userAgent);
    const tip = ios
      ? 'Turn the volume up. If you still hear nothing, flip the ring/silent switch on the side of your iPhone to ring.'
      : (phone ? 'Turn the media volume up, and check that the phone is not muted or in Do Not Disturb.'
               : 'Turn your volume up and check the right speakers or headphones are selected.');
    const root = document.createElement('div');
    root.className = 'tour sound-check';
    root.innerHTML = '<div class="tour-block sc-back"></div>' +
      '<div class="tour-tip sc-tip" role="dialog" aria-modal="true" aria-labelledby="scTitle">' +
      '<h4 id="scTitle">Sound check</h4><p></p>' +
      '<label class="sc-again"><input type="checkbox"> Don’t show again</label>' +
      '<div class="tour-btns"><button type="button" class="btn btn-small sc-test">Test sound</button>' +
      '<span></span><button type="button" class="btn btn-small primary sc-ok">OK</button></div></div>';
    root.querySelector('p').textContent = 'This app plays sound. ' + tip;
    document.body.appendChild(root);
    root.querySelector('.sc-test').addEventListener('click', function () {
      const ctx = freshAudio();
      const t = ctx.currentTime + 0.05;
      for (let k = 0; k < 4; k++) click(t + k * 0.35, k === 0, true);
    });
    const close = function () {
      if (root.querySelector('.sc-again input').checked) { try { localStorage.setItem('eur-soundcheck-off', '1'); } catch (e) { /* ignore */ } }
      root.remove();
      document.removeEventListener('keydown', onKey, true);
      then();
    };
    const onKey = function (e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    root.querySelector('.sc-ok').addEventListener('click', close);
    root.querySelector('.sc-ok').focus();
  }

  // ---------- What's new ----------
  // One entry per release, newest first, with its new features and its bug fixes. To ship a
  // change: add an entry at the top with the next version number. A returning visitor sees every entry newer than the last version they saw
  // (stored in localStorage); a first-time visitor gets the tour instead.
  const CHANGES = [
    { v: 5, date: 'November 10, 2026', features: [], fixes: [
      'Turning the metronome off while a rhythm is playing now silences it straight away.'
    ] },
    { v: 4, date: 'November 10, 2026', features: [
      'This What’s new card shows what changed since your last visit.'
    ], fixes: [
      'The metronome is now as loud as the instrument at the same volume setting (it was much quieter).'
    ] },
    { v: 3, date: 'November 10, 2026', features: [
      'Ternary List 1, and compound meters 6/8, 9/8, 12/8 and 15/8 (pick them under Meter).',
      'In compound time the tempo is per dotted quarter, the metronome clicks 1, 3 or 6 times a beat, and the counting reads 1 & a / 1 ta & ta a ta.'
    ], fixes: [] },
    { v: 2, date: 'November 9, 2026', features: [
      'Rhythm settings are a row of buttons above the score; each opens a small menu.',
      'Notation aids: one switch for a plain score without the counting marks.',
      'Bars is chosen with 1–8 buttons. Options is now the Settings page.'
    ], fixes: [
      'Scrolling and changing settings no longer make the page jump on phones.'
    ] }
  ];
  const VERSION = CHANGES[0].v;
  function whatsNew(then) {
    let seen = 0;
    try { seen = Number(localStorage.getItem('eur-version')) || 0; } catch (e) { seen = VERSION; }
    const fresh = CHANGES.filter(function (c) { return c.v > seen; });
    const done = function () { try { localStorage.setItem('eur-version', String(VERSION)); } catch (e) { /* ignore */ } if (then) then(); };
    if (!fresh.length) { done(); return; }
    const root = document.createElement('div');
    root.className = 'tour sound-check whats-new';
    root.innerHTML = '<div class="tour-block sc-back"></div>' +
      '<div class="tour-tip sc-tip" role="dialog" aria-modal="true" aria-labelledby="wnTitle">' +
      '<h4 id="wnTitle">What’s new</h4><div class="wn-list"></div>' +
      '<div class="tour-btns"><span></span><button type="button" class="btn btn-small primary wn-ok">Got it</button></div></div>';
    // one section per date (releases on the same day are merged), each with New and Fixed
    const list = root.querySelector('.wn-list');
    const days = [];
    fresh.forEach(function (c) {
      let d = days.filter(function (x) { return x.date === c.date; })[0];
      if (!d) { d = { date: c.date, features: [], fixes: [] }; days.push(d); }
      d.features = d.features.concat(c.features || []);
      d.fixes = d.fixes.concat(c.fixes || []);
    });
    days.forEach(function (d) {
      const h = document.createElement('p');
      h.className = 'wn-date';
      h.textContent = d.date;
      list.appendChild(h);
      [['New', d.features], ['Fixed', d.fixes]].forEach(function (grp) {
        if (!grp[1].length) return;
        const sub = document.createElement('p');
        sub.className = 'wn-kind';
        sub.textContent = grp[0];
        const ul = document.createElement('ul');
        grp[1].forEach(function (t) { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
        list.appendChild(sub);
        list.appendChild(ul);
      });
    });
    document.body.appendChild(root);
    const close = function () {
      root.remove();
      document.removeEventListener('keydown', onKey, true);
      done();
    };
    const onKey = function (e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    root.querySelector('.wn-ok').addEventListener('click', close);
    root.querySelector('.wn-ok').focus();
  }

  // Startup: the sound check, then the tour on a first visit or What's new for a returning one
  let toured = false;
  try { toured = !!localStorage.getItem('eur-tour-done'); } catch (e) { toured = true; }
  setTimeout(function () {
    soundCheck(function () {
      if (!toured) {
        try { localStorage.setItem('eur-version', String(VERSION)); } catch (e) { /* ignore */ }   // the tour covers it all
        setTimeout(startTour, 200);
      } else whatsNew();
    });
  }, 500);

  // ---------- Visit counter (not shown on the page) ----------
  // Counts kept by Abacus (a free, open-source counter API; no cookies): visits go up on every
  // page load, visitors only the first time a browser opens the site (remembered in
  // localStorage). The numbers aren't shown here; read them from the Abacus API (see README).
  // Local copies don't count, so testing doesn't inflate them.
  (function () {
    if (!window.fetch) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname) || location.protocol === 'file:') return;
    const API = 'https://abacus.jasoncameron.dev/hit/bgracia-cmu-eur-lab/';
    const hit = function (key) {
      return fetch(API + key, { referrerPolicy: 'no-referrer', credentials: 'omit' }).then(function (r) { return r.ok; }).catch(function () { return false; });
    };
    hit('visits');
    let seen = true;
    try { seen = !!localStorage.getItem('eur-visited'); } catch (e) { /* storage off: don't count as new */ }
    if (!seen) hit('visitors').then(function (ok) { if (ok) { try { localStorage.setItem('eur-visited', '1'); } catch (e) { /* ignore */ } } });
  })();
})();
