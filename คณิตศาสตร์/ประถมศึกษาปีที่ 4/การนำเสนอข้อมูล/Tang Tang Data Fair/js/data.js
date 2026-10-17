/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — ข้อมูลบทเรียน: ตัวสร้างข้อมูลสุ่ม + โจทย์ + ซุ้มทั้ง 6
   เนื้อหา (ป.4): การอ่านและการเขียนแผนภูมิแท่ง (ไม่รวมการย่นระยะ) · การอ่านตารางสองทาง
   ข้อมูลสุ่มใหม่ทุกครั้งที่เล่น แต่ตรวจคำตอบจากข้อมูลจริงเสมอ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT = window.TT || {};

  /* ── ตัวช่วยสุ่ม ── */
  const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const sum = a => a.reduce((x, y) => x + y, 0);

  /* ═══════════ ชุดข้อมูลแผนภูมิ ═══════════ */
  const POOLS = [
    { id: 'fruit', title: 'ผลไม้ที่ขายได้ในวันนี้', x: 'ชนิดผลไม้', y: 'จำนวน (กล่อง)', unit: 'กล่อง', verb: 'ขายได้', which: 'ผลไม้ชนิดใด',
      cats: [{ n: 'แอปเปิล', k: 'apple' }, { n: 'กล้วย', k: 'banana' }, { n: 'ส้ม', k: 'orange' }, { n: 'องุ่น', k: 'grape' }, { n: 'แตงโม', k: 'melon' }, { n: 'เชอร์รี', k: 'cherry' }] },
    { id: 'pet', title: 'สัตว์เลี้ยงของเพื่อน ๆ', x: 'ชนิดสัตว์', y: 'จำนวน (ตัว)', unit: 'ตัว', verb: 'มี', which: 'สัตว์ชนิดใด',
      cats: [{ n: 'แมว', k: 'cat' }, { n: 'สุนัข', k: 'dog' }, { n: 'กระต่าย', k: 'rabbit' }, { n: 'ปลา', k: 'fish' }, { n: 'เป็ด', k: 'duck' }] },
    { id: 'petlike', title: 'สัตว์ที่เพื่อน ๆ ชอบ', x: 'ชนิดสัตว์', y: 'จำนวน (คน)', unit: 'คน', verb: 'มีคนชอบ', which: 'สัตว์ชนิดใด',
      cats: [{ n: 'แมว', k: 'cat' }, { n: 'สุนัข', k: 'dog' }, { n: 'กระต่าย', k: 'rabbit' }, { n: 'ปลา', k: 'fish' }, { n: 'เป็ด', k: 'duck' }] },
    { id: 'toy', title: 'ของเล่นที่เพื่อน ๆ ชอบ', x: 'ชนิดของเล่น', y: 'จำนวน (คน)', unit: 'คน', verb: 'มีคนชอบ', which: 'ของเล่นชนิดใด',
      cats: [{ n: 'ลูกบอล', k: 'ball' }, { n: 'ว่าว', k: 'kite' }, { n: 'กลอง', k: 'drum' }, { n: 'ลูกโป่ง', k: 'balloon' }, { n: 'ตุ๊กตาเป็ด', k: 'duck' }] },
    { id: 'snack', title: 'ขนมที่ขายหมดในงาน', x: 'ชนิดขนม', y: 'จำนวน (ชิ้น)', unit: 'ชิ้น', verb: 'ขายได้', which: 'ขนมชนิดใด',
      cats: [{ n: 'คุกกี้', k: 'cookie' }, { n: 'เค้ก', k: 'cake' }, { n: 'โดนัท', k: 'donut' }] },
    { id: 'drink', title: 'น้ำที่ขายได้ในงาน', x: 'ชนิดน้ำ', y: 'จำนวน (แก้ว)', unit: 'แก้ว', verb: 'ขายได้', which: 'น้ำชนิดใด',
      cats: [{ n: 'น้ำส้ม', k: 'cupO' }, { n: 'น้ำใบเตย', k: 'cupG' }, { n: 'น้ำสตรอว์เบอร์รี', k: 'cupP' }] },
    { id: 'plant', title: 'ของที่เก็บได้ในสวน', x: 'ชนิดของที่เก็บ', y: 'จำนวน (อัน)', unit: 'อัน', verb: 'เก็บได้', which: 'ของชนิดใด',
      cats: [{ n: 'ดอกไม้', k: 'flower' }, { n: 'เปลือกหอย', k: 'shell' }, { n: 'ดาวทะเล', k: 'star' }, { n: 'ลูกบอล', k: 'ball' }] }
  ];
  let lastPool = '';

  /* สร้างข้อมูลแผนภูมิ: n แท่ง, scale ต่อช่อง, ค่าอยู่ในช่วง vmin..vmax ทีละ step, halves = จำนวนแท่งที่อยู่กึ่งกลางช่อง */
  function mkChart(o) {
    const ok = POOLS.filter(p => p.cats.length >= o.n && p.id !== lastPool);
    const pool = o.pool ? POOLS.find(p => p.id === o.pool) : pick(ok);
    lastPool = pool.id;
    const cats = sample(pool.cats, o.n);
    const step = o.step || o.scale;
    const cand = [];
    for (let v = o.vmin; v <= o.vmax; v += step) cand.push(v);
    const vals = sample(cand, o.n);
    if (o.halves) {
      sample(vals.map((_, i) => i), o.halves).forEach(i => { if (vals[i] - o.scale / 2 > 0) vals[i] -= o.scale / 2; });
    }
    const top = Math.max.apply(null, vals);
    let max = Math.ceil(top / o.scale) * o.scale;
    if (max / o.scale < 4) max = o.scale * 4;
    return { title: pool.title, xLabel: pool.x, yLabel: pool.y, unit: pool.unit, verb: pool.verb, which: pool.which, cats, vals, scale: o.scale, max, pool: pool.id };
  }
  const withVals = (s, vals) => Object.assign({}, s, { vals });

  /* ตัวเลือกตัวเลข: คำตอบ + ความผิดพลาดที่เด็กมักพลาด (อ่านเลขข้างเคียง / นับเส้น) */
  function optsNum(ans, scale) {
    const c = [ans + scale, ans - scale, ans + 1, ans - 1, ans + 2, ans - 2];
    if (scale > 1 && ans % scale === 0 && ans / scale > 1) c.push(ans / scale);
    if (scale > 1) { c.push(ans + scale / 2); c.push(ans - scale / 2); }
    const seen = new Set([ans]);
    const out = [ans];
    shuffle(c).forEach(v => { if (out.length < 4 && v > 0 && Number.isInteger(v) && !seen.has(v)) { seen.add(v); out.push(v); } });
    return out.sort((a, b) => a - b);
  }
  const nameOpts = (names, ans) => shuffle(names.includes(ans) ? names : names.concat(ans));
  const ask = (s, c) => c.n + s.verb + 'กี่' + s.unit;
  const ordIdx = (s, desc) => s.vals.map((v, i) => i).sort((a, b) => desc ? s.vals[b] - s.vals[a] : s.vals[a] - s.vals[b]);

  /* ── โจทย์แผนภูมิ ── */
  function qTick(s, i) {
    const c = s.cats[i], v = s.vals[i];
    return {
      by: 'tick', q: ask(s, c) + '? แตะเลขบนแกนตั้งที่ตรงกับยอดแท่ง', ans: v, hl: [i],
      why: 'ยอดแท่ง' + c.n + 'ตรงกับเลข ' + v + (s.scale > 1 ? ' (แกนตั้งนับทีละ ' + s.scale + ')' : '') + ' ' + c.n + s.verb + ' ' + v + ' ' + s.unit,
      hints: ['มองที่ยอดแท่ง แล้วไล่สายตาไปทางซ้ายจนถึงแกนตั้ง', 'ลากเส้นจากยอดแท่งไปที่แกนตั้ง เห็นเลขที่ตรงกันไหม?', 'เลขที่เรืองแสงคือคำตอบ แตะได้เลย'],
      guide: [{ i }]
    };
  }
  function qRead(s, i) {
    const c = s.cats[i], v = s.vals[i];
    const mid = s.scale % 2 === 0 && v % s.scale !== 0;
    return {
      by: 'option', q: ask(s, c) + '?', options: optsNum(v, s.scale), ans: v, hl: [i], guide: [{ i }],
      why: 'ยอดแท่ง' + c.n + (mid ? 'อยู่กึ่งกลางระหว่าง ' + Math.floor(v / s.scale) * s.scale + ' กับ ' + (Math.floor(v / s.scale) + 1) * s.scale + ' จึงเป็น ' + v : 'ตรงกับเลข ' + v) + ' ' + c.n + s.verb + ' ' + v + ' ' + s.unit,
      hints: s.scale > 1
        ? ['แกนตั้งนับทีละ ' + s.scale + ' ดูว่ายอดแท่งตรงกับเลขอะไร', mid ? 'ยอดแท่งอยู่ระหว่างสองเลข ลองหาจุดกึ่งกลาง' : 'ไล่สายตาจากยอดแท่งไปที่แกนตั้ง', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว เหลือสองตัว']
        : ['ไล่สายตาจากยอดแท่งไปที่เลขบนแกนตั้ง', 'เส้นประช่วยไล่สายตาแล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว']
    };
  }
  function qExtreme(s, most, by) {
    const idx = ordIdx(s, most)[0], c = s.cats[idx];
    const q = {
      by: by || 'bar', q: s.which + s.verb + (most ? 'มาก' : 'น้อย') + 'ที่สุด?' + (by === 'option' ? '' : ' แตะแท่งนั้น'), ans: idx, hl: [],
      why: 'แท่ง' + c.n + (most ? 'สูงที่สุด' : 'เตี้ยที่สุด') + ' จึง' + s.verb + (most ? 'มาก' : 'น้อย') + 'ที่สุด (' + s.vals[idx] + ' ' + s.unit + ')',
      hints: [most ? 'แท่งยิ่งสูง ยิ่งมีจำนวนมาก' : 'แท่งยิ่งเตี้ย ยิ่งมีจำนวนน้อย', 'เส้นประจากยอดทุกแท่ง ช่วยให้เทียบความสูงได้', 'เหลือสองแท่งที่ยังสงสัย เลือกอีกทีนะ'],
      guideAll: true
    };
    if (by === 'option') { q.options = shuffle(s.cats.map(x => x.n)); q.ans = c.n; }
    return q;
  }
  function qDiff(s, i, j) {
    const a = s.vals[i], b = s.vals[j], ci = s.cats[i], cj = s.cats[j];
    const d = a - b;
    const o = new Set([d]);
    [a, b, d + s.scale, Math.abs(d - s.scale), d + 1, a + b].forEach(v => { if (o.size < 4 && v > 0 && v !== d) o.add(v); });
    return {
      by: 'option', q: ci.n + s.verb + 'มากกว่า' + cj.n + 'กี่' + s.unit + '?', options: Array.from(o).sort((x, y) => x - y), ans: d, hl: [i, j], guide: [{ i }, { i: j }],
      why: ci.n + ' ' + a + ' ลบ ' + cj.n + ' ' + b + ' เท่ากับ ' + d + ' ' + s.unit,
      hints: ['อ่านค่าแท่งแรกกับแท่งที่สอง แล้วหาผลต่าง', 'เส้นประบอกค่าของสองแท่งให้แล้ว นำมาลบกันนะ', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว']
    };
  }
  function qSum(s, idxs) {
    const all = idxs.length === s.cats.length;
    const t = sum(idxs.map(i => s.vals[i]));
    const o = new Set([t]);
    [t + s.scale, t - s.scale, t + 1, t - 1, t - Math.min.apply(null, idxs.map(i => s.vals[i])), t + 2].forEach(v => { if (o.size < 4 && v > 0 && v !== t) o.add(v); });
    const names = idxs.map(i => s.cats[i].n);
    return {
      by: 'option', q: (all ? 'ทั้งหมด' : names.join('กับ')) + s.verb + 'รวมกันกี่' + s.unit + '?', options: Array.from(o).sort((x, y) => x - y), ans: t, hl: idxs, guide: idxs.map(i => ({ i })),
      why: idxs.map(i => s.vals[i]).join(' + ') + ' = ' + t + ' ' + s.unit,
      hints: ['อ่านค่าของแต่ละแท่งก่อน แล้วค่อยบวกกัน', 'เส้นประบอกค่าแต่ละแท่งให้แล้ว นำมาบวกกันนะ', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว']
    };
  }
  function qOrder(s, desc) {
    const ord = ordIdx(s, desc);
    return {
      by: 'order', q: 'แตะแท่งเรียงจาก' + (desc ? 'มากไปน้อย' : 'น้อยไปมาก') + ' เริ่มจากที่' + s.verb + (desc ? 'มาก' : 'น้อย') + 'ที่สุด', ans: ord, hl: [],
      why: 'เรียงได้ ' + ord.map(i => s.cats[i].n + ' ' + s.vals[i]).join(' · '),
      hints: [desc ? 'เริ่มจากแท่งที่สูงที่สุด แล้วไล่ลงมา' : 'เริ่มจากแท่งที่เตี้ยที่สุด แล้วไล่ขึ้นไป', 'เส้นประจากยอดแท่งช่วยเทียบความสูงได้', 'แท่งถัดไปที่ต้องแตะกำลังกะพริบ'],
      guideAll: true
    };
  }
  /* ข้อความจริง/ไม่จริง */
  function qTF(s, kind) {
    const idx = ordIdx(s, true);
    let stmt, truth, why;
    if (kind === 'most') {
      const real = Math.random() < 0.5; const i = real ? idx[0] : pick(idx.slice(1));
      stmt = s.cats[i].n + s.verb + 'มากที่สุด'; truth = real;
      why = 'แท่ง' + s.cats[idx[0]].n + 'สูงที่สุด (' + s.vals[idx[0]] + ') ' + (real ? 'ข้อความนี้จริง' : 'จึงไม่ใช่ ' + s.cats[i].n);
    } else if (kind === 'more') {
      const [a, b] = sample(s.cats.map((_, i) => i), 2);
      stmt = s.cats[a].n + s.verb + 'มากกว่า' + s.cats[b].n; truth = s.vals[a] > s.vals[b];
      why = s.cats[a].n + ' ' + s.vals[a] + ' และ ' + s.cats[b].n + ' ' + s.vals[b] + ' ข้อความนี้' + (truth ? 'จริง' : 'ไม่จริง');
    } else {
      const i = int(0, s.cats.length - 1); const real = Math.random() < 0.5;
      const v = real ? s.vals[i] : s.vals[i] + pick([-1, 1]) * s.scale;
      stmt = s.cats[i].n + s.verb + ' ' + v + ' ' + s.unit; truth = real;
      why = 'ยอดแท่ง' + s.cats[i].n + 'อยู่ที่ ' + s.vals[i] + ' ' + (real ? 'ข้อความนี้จริง' : 'ไม่ใช่ ' + v);
    }
    return {
      by: 'option', q: 'จริงหรือไม่จริง? ' + stmt, options: ['จริง', 'ไม่จริง'], ans: truth ? 'จริง' : 'ไม่จริง', hl: [], tf: true,
      why, guideAll: true,
      hints: ['อ่านค่าของแท่งที่พูดถึง แล้วเทียบกับข้อความ', 'เส้นประจากยอดแท่งช่วยเทียบค่าให้แล้ว', 'ลองอ่านเลขจากแกนตั้งอีกรอบ']
    };
  }
  function qStep(s, a) {
    return {
      by: 'option', q: 'แกนตั้งนับทีละเท่าไร? ดูเลขสองช่องที่เรืองแสง', options: [s.scale].concat(sample([1, 2, 5, 10, 20].filter(v => v !== s.scale), 3)).sort((x, y) => x - y), ans: s.scale, hl: [],
      spec: s, focus: [a, a + s.scale],
      why: 'จาก ' + a + ' ไป ' + (a + s.scale) + ' เพิ่มขึ้น ' + s.scale + ' แกนตั้งนี้นับทีละ ' + s.scale,
      hints: ['ดูเลขสองช่องที่อยู่ติดกัน ต่างกันเท่าไร?', 'ลบเลขสองช่องที่เรืองแสงดูนะ', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว']
    };
  }
  function qBarOfValue(s, i) {
    const v = s.vals[i];
    return {
      by: 'bar', q: s.which + s.verb + ' ' + v + ' ' + s.unit + '? แตะแท่งนั้น', ans: i, hl: [], guideAll: true,
      why: 'แท่ง' + s.cats[i].n + 'ยอดอยู่ที่ ' + v + (s.vals[i] % s.scale ? ' (กึ่งกลางช่อง)' : ''),
      hints: ['หาเลข ' + v + ' บนแกนตั้งก่อน แล้วมองไปที่ยอดแท่ง', 'เส้นประจากยอดแท่งบอกค่าแต่ละแท่งแล้ว', 'เหลือสองแท่งที่ยังสงสัย เลือกอีกทีนะ']
    };
  }

  /* ═══════════ ตารางสองทาง ═══════════ */
  const ROW_ACT = [{ n: 'ป.4/1' }, { n: 'ป.4/2' }, { n: 'ป.4/3' }];
  const TCTX = [
    { id: 'act', title: 'ชมรมที่นักเรียนเลือก', corner: 'ห้อง', colHead: 'ชมรมที่เลือก', unit: 'คน', rp: 'ห้อง ', cp: 'ชมรม', rows: ROW_ACT,
      cols: [{ n: 'ว่ายน้ำ', k: 'wave' }, { n: 'วาดรูป', k: 'palette' }, { n: 'ดนตรี', k: 'note' }, { n: 'ฟุตบอล', k: 'ball' }, { n: 'อ่านหนังสือ', k: 'book' }],
      t: { cell: 'นักเรียน{R} ที่เลือก{C} มีกี่คน?', rowTot: '{R} มีนักเรียนที่เลือกชมรมทั้งหมดกี่คน?', colTot: '{C} มีนักเรียนทุกห้องรวมกันกี่คน?', grand: 'นักเรียนที่เลือกชมรมทั้งหมดมีกี่คน?',
        rowTop: '{R} เลือกชมรมใดมากที่สุด?', colTop: '{C} ห้องใดเลือกมากกว่า?', colDiff: '{C} {A} เลือกมากกว่า{B} กี่คน?', desc: '{R} ที่เลือก{C}' } },
    { id: 'pet', title: 'สัตว์เลี้ยงที่นักเรียนชอบ', corner: 'ห้อง', colHead: 'สัตว์ที่ชอบ', unit: 'คน', rp: 'ห้อง ', cp: '', rows: ROW_ACT,
      cols: [{ n: 'แมว', k: 'cat' }, { n: 'สุนัข', k: 'dog' }, { n: 'กระต่าย', k: 'rabbit' }, { n: 'ปลา', k: 'fish' }],
      t: { cell: '{R} ชอบ{C} กี่คน?', rowTot: '{R} มีนักเรียนที่ตอบกี่คน?', colTot: 'นักเรียนทุกห้องรวมกัน ชอบ{C} กี่คน?', grand: 'นักเรียนที่ตอบทั้งหมดมีกี่คน?',
        rowTop: '{R} ชอบสัตว์ชนิดใดมากที่สุด?', colTop: 'คนที่ชอบ{C} ห้องใดมีมากกว่า?', colDiff: '{A} ชอบ{C} มากกว่า{B} กี่คน?', desc: '{R} ที่ชอบ{C}' } },
    { id: 'shop', title: 'ขนมที่ขายได้ในสองวัน', corner: 'วัน', colHead: 'ชนิดขนม', unit: 'ชิ้น', rp: '', cp: '', rows: [{ n: 'วันเสาร์' }, { n: 'วันอาทิตย์' }],
      cols: [{ n: 'คุกกี้', k: 'cookie' }, { n: 'เค้ก', k: 'cake' }, { n: 'โดนัท', k: 'donut' }],
      t: { cell: '{R} ขาย{C}ได้กี่ชิ้น?', rowTot: '{R} ขายขนมได้ทั้งหมดกี่ชิ้น?', colTot: '{C} ขายได้รวมสองวันกี่ชิ้น?', grand: 'สองวันขายขนมได้ทั้งหมดกี่ชิ้น?',
        rowTop: '{R} ขายขนมชนิดใดได้มากที่สุด?', colTop: '{C} ขายได้วันใดมากกว่า?', colDiff: '{C} ขายได้{A}มากกว่า{B} กี่ชิ้น?', desc: '{R} ที่ขาย{C}' } },
    { id: 'drink', title: 'น้ำที่ขายได้ของสองร้าน', corner: 'ร้าน', colHead: 'ชนิดน้ำ', unit: 'แก้ว', rp: '', cp: '', rows: [{ n: 'ร้าน ก' }, { n: 'ร้าน ข' }],
      cols: [{ n: 'น้ำส้ม', k: 'cupO' }, { n: 'น้ำใบเตย', k: 'cupG' }, { n: 'น้ำสตรอว์เบอร์รี', k: 'cupP' }],
      t: { cell: '{R} ขาย{C}ได้กี่แก้ว?', rowTot: '{R} ขายน้ำได้ทั้งหมดกี่แก้ว?', colTot: '{C} ขายได้ทั้งสองร้านรวมกี่แก้ว?', grand: 'สองร้านขายน้ำได้ทั้งหมดกี่แก้ว?',
        rowTop: '{R} ขายน้ำชนิดใดได้มากที่สุด?', colTop: '{C} ร้านใดขายได้มากกว่า?', colDiff: '{C} {A} ขายได้มากกว่า{B} กี่แก้ว?', desc: '{R} ที่ขาย{C}' } }
  ];
  let lastT = '';
  function mkTable(o) {
    const ctx = o.ctx ? TCTX.find(x => x.id === o.ctx) : pick(TCTX.filter(x => x.id !== lastT && x.cols.length >= o.cols && x.rows.length >= o.rows));
    lastT = ctx.id;
    const rows = ctx.rows.slice(0, o.rows);
    const cols = sample(ctx.cols, o.cols);
    const lo = o.vmin || 2, hi = o.vmax || 9;
    let cells = null;
    for (let t = 0; t < 400 && !cells; t++) {
      const m = rows.map(() => cols.map(() => int(lo, hi)));
      const rowOK = m.every(r => new Set(r).size === r.length);
      const colOK = cols.every((_, j) => new Set(m.map(r => r[j])).size === m.length);
      if (rowOK && colOK) cells = m;
    }
    if (!cells) cells = rows.map((_, i) => cols.map((_, j) => lo + ((i * cols.length + j) % (hi - lo + 1))));
    return { ctx, title: ctx.title, corner: ctx.corner, colHead: ctx.colHead, unit: ctx.unit, rows, cols, cells };
  }
  const T$ = (ctx, key, r, c, a, b) => ctx.t[key]
    .replace('{R}', r ? ctx.rp + r.n : '').replace('{C}', c ? ctx.cp + c.n : '')
    .replace('{A}', a ? ctx.rp + a.n : '').replace('{B}', b ? ctx.rp + b.n : '');
  const rcName = (ctx, r, c) => T$(ctx, 'desc', r, c);

  function tCell(tb, r, c, by) {
    const v = tb.cells[r][c];
    const ctx = tb.ctx;
    if (by === 'cell') {
      return { by: 'cell', q: 'แตะช่อง: ' + rcName(ctx, tb.rows[r], tb.cols[c]), ans: [r + ',' + c], rowN: r, colN: c,
        why: 'แถว ' + tb.rows[r].n + ' ตัดกับหลัก ' + tb.cols[c].n + ' ได้ช่องนี้ ค่าคือ ' + v,
        hints: ['หาแถวที่มีชื่อ ' + tb.rows[r].n + ' ก่อน แล้วหาหลัก ' + tb.cols[c].n, 'แถวและหลักที่ต้องใช้ถูกไฮไลต์แล้ว ดูตรงที่สองสีตัดกัน', 'ช่องที่ถูกกะพริบอยู่ แตะได้เลย'] };
    }
    return { by: 'option', q: T$(ctx, 'cell', tb.rows[r], tb.cols[c]), options: optsNum(v, 1), ans: v, rowN: r, colN: c, hlCell: r + ',' + c,
      why: 'แถว ' + tb.rows[r].n + ' ตัดกับหลัก ' + tb.cols[c].n + ' ได้ ' + v + ' ' + tb.unit,
      hints: ['หาแถว ' + tb.rows[r].n + ' กับหลัก ' + tb.cols[c].n + ' แล้วดูช่องที่ตัดกัน', 'แถวและหลักที่ต้องใช้ถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tRowTot(tb, r) {
    const v = sum(tb.cells[r]);
    return { by: 'option', q: T$(tb.ctx, 'rowTot', tb.rows[r]), options: optsNum(v, Math.max(2, Math.round(v / 6))), ans: v, rowN: r, tot: true,
      why: 'รวมแถว ' + tb.rows[r].n + ' = ' + tb.cells[r].join(' + ') + ' = ' + v + ' ' + tb.unit,
      hints: ['ดูช่องรวมท้ายแถว ' + tb.rows[r].n, 'แถวที่ต้องใช้ถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tColTot(tb, c) {
    const v = sum(tb.cells.map(r => r[c]));
    return { by: 'option', q: T$(tb.ctx, 'colTot', null, tb.cols[c]), options: optsNum(v, Math.max(2, Math.round(v / 6))), ans: v, colN: c, tot: true,
      why: 'รวมหลัก ' + tb.cols[c].n + ' = ' + tb.cells.map(r => r[c]).join(' + ') + ' = ' + v + ' ' + tb.unit,
      hints: ['ดูช่องรวมท้ายหลัก ' + tb.cols[c].n, 'หลักที่ต้องใช้ถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tGrand(tb) {
    const v = sum(tb.cells.map(sum));
    return { by: 'option', q: T$(tb.ctx, 'grand'), options: optsNum(v, Math.max(2, Math.round(v / 8))), ans: v, tot: true, hlCell: 'gt',
      why: 'รวมทั้งหมด = ' + v + ' ' + tb.unit + ' (รวมแถวหรือรวมหลักได้เท่ากัน)',
      hints: ['ช่องมุมล่างขวาคือผลรวมทั้งหมด', 'ลองบวกผลรวมของแต่ละแถวเข้าด้วยกัน', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tRowTop(tb, r) {
    const row = tb.cells[r], j = row.indexOf(Math.max.apply(null, row));
    return { by: 'option', q: T$(tb.ctx, 'rowTop', tb.rows[r]), options: tb.cols.map(c => c.n), ans: tb.cols[j].n, rowN: r,
      why: 'ในแถว ' + tb.rows[r].n + ' ' + tb.cols[j].n + ' มีค่ามากที่สุด คือ ' + row[j],
      hints: ['มองเฉพาะแถว ' + tb.rows[r].n + ' แล้วเทียบตัวเลขในแถว', 'แถวที่ต้องดูถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tColTop(tb, c) {
    const col = tb.cells.map(r => r[c]), i = col.indexOf(Math.max.apply(null, col));
    return { by: 'option', q: T$(tb.ctx, 'colTop', null, tb.cols[c]), options: tb.rows.map(r => r.n), ans: tb.rows[i].n, colN: c,
      why: 'ในหลัก ' + tb.cols[c].n + ' ' + tb.rows[i].n + ' มีค่ามากกว่า คือ ' + col[i],
      hints: ['มองเฉพาะหลัก ' + tb.cols[c].n + ' แล้วเทียบตัวเลขในหลัก', 'หลักที่ต้องดูถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  function tColDiff(tb, c) {
    const col = tb.cells.map(r => r[c]);
    const hi = col.indexOf(Math.max.apply(null, col)), lo = col.indexOf(Math.min.apply(null, col));
    const d = col[hi] - col[lo];
    return { by: 'option', q: T$(tb.ctx, 'colDiff', null, tb.cols[c], tb.rows[hi], tb.rows[lo]), options: optsNum(d, 1), ans: d, colN: c,
      why: tb.rows[hi].n + ' ' + col[hi] + ' ลบ ' + tb.rows[lo].n + ' ' + col[lo] + ' = ' + d + ' ' + tb.unit,
      hints: ['อ่านสองช่องในหลัก ' + tb.cols[c].n + ' แล้วหาผลต่าง', 'หลักที่ต้องใช้ถูกไฮไลต์แล้ว', 'ตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'] };
  }
  /* เติมตัวเลขที่หายไป (ใช้คีย์แพด) : keys = ช่องที่ซ่อน */
  function tFill(tb, keys, text, hintBase) {
    const sums = TT.chart.tableSums(tb);
    const ans = {};
    keys.forEach(k => {
      if (k === 'gt') ans[k] = sums.gt;
      else if (k.startsWith('rt')) ans[k] = sums.rt[+k.slice(2)];
      else if (k.startsWith('ct')) ans[k] = sums.ct[+k.slice(2)];
      else { const [r, c] = k.split(',').map(Number); ans[k] = tb.cells[r][c]; }
    });
    return { by: 'fill', q: text, blanks: keys, ans,
      why: 'ตัวเลขครบแล้ว รวมทุกแถวและรวมทุกหลักได้เท่ากับผลรวมทั้งหมด ' + sums.gt + ' ' + tb.unit,
      hints: hintBase || ['แตะช่อง ? แล้วกดตัวเลขบนแป้น กดปุ่มเครื่องหมายถูกเมื่อเสร็จ', 'แถวหรือหลักที่เกี่ยวข้องถูกไฮไลต์แล้ว บวกตัวเลขในนั้นดู', 'ลองเขียนเป็นประโยคบวกลบ แล้วหาตัวเลขที่หายไป'] };
  }
  /* ค่าที่เหมาะสำหรับ miss แบบเห็นหลัก */
  const nOpts = (arr, ans) => arr;

  TT.DATA = { int, pick, shuffle, sample, sum, mkChart, withVals, optsNum, qTick, qRead, qExtreme, qDiff, qSum, qOrder, qTF, qStep, qBarOfValue, mkTable, tCell, tRowTot, tColTot, tGrand, tRowTop, tColTop, tColDiff, tFill, POOLS, TCTX, rcName, T$, ask, ordIdx, nameOpts, nOpts };
})();
