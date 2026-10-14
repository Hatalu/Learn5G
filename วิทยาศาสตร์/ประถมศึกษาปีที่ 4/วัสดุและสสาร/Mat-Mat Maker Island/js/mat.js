/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — Material core
   - ข้อมูลวัสดุ/ตัวอย่างทดลอง (ความแข็ง สภาพยืดหยุ่น การนำความร้อน การนำไฟฟ้า สถานะ)
   - คำอ่านไทยสำหรับเสียงพากย์
   - ตัวสร้างโจทย์ (ข้อมูลล้วน ไม่แตะ DOM) ทดสอบด้วย Node ได้: node tools/test-gen.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const MM = G.MM = G.MM || {};

  /* ───────── เครื่องมือเล็ก ๆ ───────── */
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const without = (arr, xs) => arr.filter(x => xs.indexOf(x) < 0);

  /* ───────── คำอ่านภาษาไทย ───────── */
  const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNIT = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น'];
  function intThai(n) {
    n = Math.floor(Math.abs(+n));
    if (!n) return 'ศูนย์';
    const s = String(n), L = s.length;
    let out = '';
    for (let i = 0; i < L; i++) {
      const d = +s[i], pos = L - 1 - i;
      if (!d) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && L > 1) out += 'เอ็ด';
      else out += DIG[d] + UNIT[pos];
    }
    return out;
  }
  /* แปลงข้อความโชว์เป็นข้อความสำหรับพูด */
  function speakify(s) {
    return String(s)
      .replace(/(\d+)\s*มล\./g, (m, n) => ' ' + intThai(+n) + ' มิลลิลิตร ')
      .replace(/(\d+)/g, (m, n) => ' ' + intThai(+n) + ' ')
      .replace(/\s=\s/g, ' เท่ากับ ')
      .replace(/→/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /* ═════════════════════════════════════════════════════════
     ตัวอย่างทดลอง (item)
     hard  : ระดับความแข็ง 1 (นิ่มมาก) – 4 (แข็งมาก) · กดด้วยนิ้วบุ๋ม = ระดับ 1–2
     elastic: ออกแรงแล้วกลับรูปเดิมไหม · rigid = แข็งจนไม่เปลี่ยนรูปด้วยมือ
     heat  : วินาทีในการทดลองที่ความร้อนวิ่งถึงปลายแท่ง (น้อย = นำความร้อนดี)
     elec  : นำไฟฟ้าไหม
     ═════════════════════════════════════════════════════════ */
  const I = (n, mat, o) => Object.assign({ n, mat }, o || {});
  const ITEM = {
    /* ความแข็ง / สภาพยืดหยุ่น */
    sponge:  I('ฟองน้ำ', 'sponge', { hard: 1, elastic: true }),
    clay:    I('ดินน้ำมัน', 'clay', { hard: 1, elastic: false }),
    eraser:  I('ยางลบ', 'rubber', { hard: 2, elastic: true, elec: false }),
    rubber:  I('แผ่นยาง', 'rubber', { hard: 2, elastic: true, elec: false, heat: 70 }),
    wood:    I('ไม้', 'wood', { hard: 3, elastic: false, rigid: true, heat: 40, elec: false }),
    plastic: I('พลาสติก', 'plastic', { hard: 3, elastic: false, rigid: true, heat: 55, elec: false }),
    steel:   I('เหล็ก', 'steel', { hard: 4, elastic: false, rigid: true, heat: 4.2, elec: true }),
    stone:   I('หิน', 'stone', { hard: 4, elastic: false, rigid: true }),
    glass:   I('แก้ว', 'glass', { hard: 4, elastic: false, rigid: true, elec: false }),
    cloth:   I('ผ้า', 'cloth', { hard: 1, heat: 60 }),
    alu:     I('แผ่นอะลูมิเนียม', 'alum', { heat: 3, elec: true }),
    /* สภาพยืดหยุ่น */
    band:    I('ยางยืด', 'rubber', { elastic: true, elec: false }),
    spring:  I('สปริง', 'steel', { elastic: true }),
    ball:    I('ลูกบอลยาง', 'rubber', { elastic: true }),
    paper:   I('กระดาษ', 'paper', { elastic: false }),
    foil:    I('ฟอยล์อะลูมิเนียม', 'alum', { elastic: false, elec: true }),
    wire:    I('ลวดทองแดง', 'copper', { elastic: false, elec: true, heat: 2.2 }),
    /* การนำความร้อน (แท่งทดลอง) */
    cuRod:   I('ช้อนทองแดง', 'copper', { heat: 2.2 }),
    alRod:   I('ช้อนอะลูมิเนียม', 'alum', { heat: 3 }),
    feRod:   I('ช้อนเหล็ก', 'steel', { heat: 4.2 }),
    woodRod: I('ช้อนไม้', 'wood', { heat: 40 }),
    plRod:   I('ช้อนพลาสติก', 'plastic', { heat: 55 }),
    rubRod:  I('ช้อนยาง', 'rubber', { heat: 70 }),
    /* การนำไฟฟ้า */
    nail:    I('ตะปูเหล็ก', 'steel', { elec: true }),
    coin:    I('เหรียญ', null, { elec: true }),
    clip:    I('คลิปหนีบกระดาษ', 'steel', { elec: true }),
    key:     I('กุญแจ', 'steel', { elec: true }),
    stick:   I('ไม้ไอศกรีม', 'wood', { elec: false }),
    ruler:   I('ไม้บรรทัดพลาสติก', 'plastic', { elec: false }),
    glassRod: I('แท่งแก้ว', 'glass', { elec: false })
  };
  Object.keys(ITEM).forEach(k => { ITEM[k].id = k; });

  /* วัสดุสำหรับสมุดการ์ด (เปิดข้อมูลเมื่อได้ทดลองจริง) */
  const MAT = {
    steel:   { n: 'เหล็ก', c: '#8da2b8' },
    copper:  { n: 'ทองแดง', c: '#e0894a' },
    alum:    { n: 'อะลูมิเนียม', c: '#c9d6e2' },
    wood:    { n: 'ไม้', c: '#c68a4e' },
    plastic: { n: 'พลาสติก', c: '#55b6ff' },
    glass:   { n: 'แก้ว', c: '#a8e6f2' },
    stone:   { n: 'หิน', c: '#9b9aa6' },
    rubber:  { n: 'ยาง', c: '#e8548a' },
    sponge:  { n: 'ฟองน้ำ', c: '#ffd23f' },
    clay:    { n: 'ดินน้ำมัน', c: '#7ad07a' },
    paper:   { n: 'กระดาษ', c: '#fff3d1' },
    cloth:   { n: 'ผ้า', c: '#b693ff' }
  };
  const MAT_ORDER = ['steel', 'copper', 'alum', 'wood', 'plastic', 'glass', 'stone', 'rubber', 'sponge', 'clay', 'paper', 'cloth'];

  /* สถานะของสสาร */
  const SI = {
    rock:    { n: 'ก้อนหิน', s: 'solid' },
    book:    { n: 'หนังสือ', s: 'solid' },
    ice:     { n: 'น้ำแข็ง', s: 'solid' },
    sand:    { n: 'ทราย', s: 'solid', pours: true, grains: true },
    salt:    { n: 'เกลือ', s: 'solid', pours: true, grains: true },
    pencil:  { n: 'ดินสอ', s: 'solid' },
    water:   { n: 'น้ำ', s: 'liquid' },
    milk:    { n: 'นม', s: 'liquid' },
    oil:     { n: 'น้ำมันพืช', s: 'liquid' },
    honey:   { n: 'น้ำผึ้ง', s: 'liquid', slow: true },
    juice:   { n: 'น้ำส้ม', s: 'liquid' },
    air:     { n: 'อากาศในลูกโป่ง', s: 'gas' },
    helium:  { n: 'แก๊สในลูกโป่งลอย', s: 'gas' },
    lpg:     { n: 'แก๊สหุงต้ม', s: 'gas' },
    soda:    { n: 'ฟองแก๊สในน้ำอัดลม', s: 'gas' }
  };
  Object.keys(SI).forEach(k => { SI[k].id = k; });
  const STATE_N = { solid: 'ของแข็ง', liquid: 'ของเหลว', gas: 'แก๊ส' };

  /* ───────── คุณสมบัติรายตัวอย่าง ───────── */
  const hardGroup = id => ITEM[id].hard >= 3 ? 'hard' : 'soft';                    /* กดด้วยนิ้วบุ๋มไหม */
  const scratches = (a, b) => ITEM[a].hard > ITEM[b].hard;                           /* a ขีด b เป็นรอยได้ */
  const NAIL_TIER = 3;                                                              /* ตะปูขีดได้ถึงระดับ 3 */
  const nailScratches = id => ITEM[id].hard <= NAIL_TIER;
  const heatGood = id => ITEM[id].heat <= 6;
  const isElastic = id => ITEM[id].elastic === true;
  const isConductor = id => ITEM[id].elec === true;
  const nm = id => (ITEM[id] || SI[id]).n;

  /* ───────── ชุดตัวอย่างต่อระดับ ───────── */
  const POOL = {
    hardSoft: ['sponge', 'clay', 'eraser'],
    hardHard: ['wood', 'plastic', 'steel', 'stone', 'glass'],
    hardAll: ['sponge', 'clay', 'eraser', 'wood', 'plastic', 'steel', 'stone', 'glass'],
    elasticYes: ['band', 'spring', 'sponge', 'ball'],
    elasticNo: ['clay', 'paper', 'foil', 'wire', 'wood', 'stone'],
    heatGood: ['cuRod', 'alRod', 'feRod'],
    heatPoor: ['woodRod', 'plRod', 'rubRod'],
    elecYes: ['nail', 'wire', 'foil', 'coin', 'clip', 'key'],
    elecNo: ['stick', 'ruler', 'eraser', 'glassRod', 'band']
  };

  /* ═════════ ตัวสร้างโจทย์ ═════════ */
  const GEN = {};

  /* ความแข็ง : คู่ที่ระดับต่างกัน (ห้ามระดับเท่ากัน) ผู้ชนะ = ตัวที่แข็งกว่า */
  GEN.hardPair = function (level, avoid) {
    const minGap = level === 1 ? 3 : level === 2 ? 2 : 1;
    let a, b, tries = 0;
    do {
      a = pick(POOL.hardAll); b = pick(POOL.hardAll);
      tries++;
    } while ((a === b || Math.abs(ITEM[a].hard - ITEM[b].hard) < minGap ||
      (avoid && (avoid.indexOf(a + b) >= 0 || avoid.indexOf(b + a) >= 0))) && tries < 80);
    const winner = ITEM[a].hard > ITEM[b].hard ? a : b;
    return { a, b, winner, loser: winner === a ? b : a };
  };
  /* 3 ตัวระดับต่างกัน เรียงจากนิ่ม → แข็ง */
  GEN.hardTriple = function (level) {
    let ids, tries = 0;
    do {
      ids = sample(POOL.hardAll, 3);
      const t = ids.map(i => ITEM[i].hard);
      var distinct = new Set(t).size === 3;
      var spread = Math.max.apply(null, t) - Math.min.apply(null, t);
      tries++;
    } while ((!distinct || (level === 1 && spread < 3)) && tries < 80);
    const sorted = ids.slice().sort((x, y) => ITEM[x].hard - ITEM[y].hard);
    return { ids, sorted };
  };
  /* ชุดคัดแยกแข็ง/นิ่ม */
  GEN.hardSort = function (level, n) {
    n = n || 6;
    const soft = sample(POOL.hardSoft, level === 1 ? 3 : 3);
    const hard = sample(POOL.hardHard, n - soft.length);
    return shuffle(soft.concat(hard));
  };

  /* สภาพยืดหยุ่น */
  GEN.elasticSet = function (level, n) {
    n = n || 6;
    const yes = sample(POOL.elasticYes, n / 2);
    const no = sample(POOL.elasticNo, n / 2);
    return shuffle(yes.concat(no));
  };

  /* การนำความร้อน : 4 แท่ง (2 ดี 2 ไม่ดี) */
  GEN.heatRods = function (level) {
    const good = sample(POOL.heatGood, 2);
    const poor = sample(POOL.heatPoor, 2);
    return shuffle(good.concat(poor));
  };
  GEN.heatSort = function (n) {
    const good = sample(['cuRod', 'alRod', 'feRod'], 3);
    const poor = sample(['woodRod', 'plRod', 'rubRod'], 3);
    return shuffle(good.concat(poor)).slice(0, n || 6);
  };

  /* การนำไฟฟ้า */
  GEN.elecSet = function (n) {
    n = n || 8;
    return shuffle(sample(POOL.elecYes, n / 2).concat(sample(POOL.elecNo, n / 2)));
  };
  /* สะพานไฟ : มีช่องว่าง k ช่อง แต่ละช่องมี 3 ตัวเลือก ตัวนำอย่างน้อย 1 */
  GEN.bridge = function (level) {
    const k = level >= 3 ? 3 : 2;
    const slots = [];
    const usedC = [];
    for (let i = 0; i < k; i++) {
      const nCond = level === 1 ? 1 : pick([1, 1, 2]);
      const cs = sample(without(POOL.elecYes, usedC), nCond);
      const ns = sample(POOL.elecNo, 3 - nCond);
      usedC.push.apply(usedC, cs);
      slots.push(shuffle(cs.concat(ns)));
    }
    return { k, slots };
  };

  /* สายไฟ/หม้อ/หมวก : วัตถุที่ต้องเลือกวัสดุให้ครบทุกส่วน */
  GEN.BUILD = {
    pot: {
      name: 'หม้อต้มน้ำ',
      parts: [
        { k: 'body', n: 'ตัวหม้อ', need: id => heatGood(id), tell: 'ตัวหม้อต้องนำความร้อนดี' },
        { k: 'handle', n: 'ด้ามหม้อ', need: id => !heatGood(id), tell: 'ด้ามต้องนำความร้อนไม่ดี' }
      ],
      shelf: ['alu', 'steel', 'wood', 'plastic', 'rubber', 'cloth']
    },
    cable: {
      name: 'สายไฟ',
      parts: [
        { k: 'core', n: 'แกนกลาง', need: id => isConductor(id), tell: 'แกนต้องนำไฟฟ้า' },
        { k: 'cover', n: 'ปลอกหุ้ม', need: id => ITEM[id].elec === false, tell: 'ปลอกต้องไม่นำไฟฟ้า' }
      ],
      shelf: ['wire', 'steel', 'plastic', 'rubber', 'wood', 'alu']
    },
    helmet: {
      name: 'หมวกนิรภัย',
      parts: [
        { k: 'shell', n: 'เปลือกนอก', need: id => hardGroup(id) === 'hard', tell: 'เปลือกต้องแข็ง' },
        { k: 'pad', n: 'นวมข้างใน', need: id => hardGroup(id) === 'soft' && isElastic(id), tell: 'นวมต้องนิ่มและยืดหยุ่น' }
      ],
      shelf: ['plastic', 'sponge', 'clay', 'wood', 'steel', 'eraser']
    }
  };

  /* นักสืบวัสดุลึกลับ : สัญญาณจากการทดสอบ 4 อย่าง ผู้ต้องสงสัย 3 ตัวจากต่างกลุ่ม */
  const MYST = {
    steel:   { n: 'เหล็ก',   art: 'steel',   sig: { press: 'hard', elastic: false, heat: true,  elec: true,  grp: 'M' } },
    alu:     { n: 'อะลูมิเนียม', art: 'alu', sig: { press: 'hard', elastic: false, heat: true,  elec: true,  grp: 'M' } },
    wood:    { n: 'ไม้',     art: 'wood',    sig: { press: 'hard', elastic: false, heat: false, elec: false, grp: 'W' } },
    plastic: { n: 'พลาสติก', art: 'plastic', sig: { press: 'hard', elastic: false, heat: false, elec: false, grp: 'W' } },
    rubber:  { n: 'ยาง',     art: 'rubber',  sig: { press: 'soft', elastic: true,  heat: false, elec: false, grp: 'R' } },
    sponge:  { n: 'ฟองน้ำ',  art: 'sponge',  sig: { press: 'soft', elastic: true,  heat: false, elec: false, grp: 'R' } }
  };
  GEN.mystery = function (avoid) {
    const groups = { M: ['steel', 'alu'], W: ['wood', 'plastic'], R: ['rubber', 'sponge'] };
    let secret, tries = 0;
    do { secret = pick(Object.keys(MYST)); tries++; } while (avoid && avoid.indexOf(secret) >= 0 && tries < 30);
    const cand = ['M', 'W', 'R'].map(g => g === MYST[secret].sig.grp ? secret : pick(groups[g]));
    return { secret, cand: shuffle(cand) };
  };
  /* ผลการทดสอบ test ∈ press|elastic|heat|elec ของตัวลึกลับ → ค่าที่เห็น */
  GEN.mysteryResult = function (id, test) { return MYST[id].sig[test]; };
  /* ผู้ต้องสงสัยที่ยังไม่ขัดกับผลที่เห็น */
  GEN.mysteryLeft = function (cand, seen) {
    return cand.filter(id => Object.keys(seen).every(t => MYST[id].sig[t] === seen[t]));
  };

  /* ═════════ สถานะของสสาร ═════════ */
  GEN.stateSet = function (n, tricky) {
    const base = [].concat(sample(['rock', 'book', 'ice', 'pencil'], 2), sample(['water', 'milk', 'oil', 'juice'], 2), sample(['air', 'helium', 'lpg'], 2));
    const trick = tricky ? ['sand', 'salt', 'honey', 'soda'] : [];
    const pool = tricky ? sample(trick, Math.min(trick.length, 3)).concat(sample(base, (n || 6) - 3)) : base;
    return shuffle(pool).slice(0, n || 6);
  };

  /* ประโยคที่ตุ๊บตุ๊บอ้าง (จริง/ไม่จริง) ต่อเรื่อง — claim: {text, truth, why, kind, ...args} */
  GEN.claim = function (zone, avoid) {
    const out = [];
    if (zone === 1) {
      const p = GEN.hardPair(2, avoid);
      const x = Math.random() < 0.5 ? p.a : p.b, y = x === p.a ? p.b : p.a;
      out.push({ kind: 'hardDuel', a: x, b: y, text: nm(x) + 'ขีด' + nm(y) + 'ให้เป็นรอยได้', truth: scratches(x, y),
        why: scratches(x, y) ? nm(x) + 'แข็งกว่า' + nm(y) + ' จึงขีดได้' : nm(x) + 'แข็งน้อยกว่า' + nm(y) + ' จึงขีดไม่เป็นรอย' });
    } else if (zone === 2) {
      const id = pick(['clay', 'wire', 'paper', 'foil', 'band', 'spring', 'sponge', 'ball']);
      out.push({ kind: 'elastic', id, text: nm(id) + 'เป็นวัสดุยืดหยุ่น', truth: isElastic(id),
        why: isElastic(id) ? nm(id) + 'ปล่อยแล้วกลับเหมือนเดิม' : nm(id) + 'ไม่กลับเหมือนเดิม' });
    } else if (zone === 3) {
      const g = pick(POOL.heatGood), b = pick(POOL.heatPoor);
      const flip = Math.random() < 0.5;
      out.push({ kind: 'heat', a: flip ? b : g, b: flip ? g : b, text: nm(flip ? b : g) + 'ร้อนเร็วกว่า' + nm(flip ? g : b), truth: !flip,
        why: nm(g) + 'นำความร้อนดี ร้อนเร็วกว่า' + nm(b) });
    } else if (zone === 4) {
      const id = pick(POOL.elecYes.concat(POOL.elecNo));
      out.push({ kind: 'elec', id, text: nm(id) + 'นำไฟฟ้า', truth: isConductor(id),
        why: isConductor(id) ? nm(id) + 'ทำให้ไฟติด จึงนำไฟฟ้า' : nm(id) + 'ทำให้ไฟไม่ติด จึงไม่นำไฟฟ้า' });
    }
    return out[0];
  };
  /* ประโยคอ้างเรื่องสถานะ (เนื้อหาตายตัว) */
  const STATE_CLAIMS = [
    { text: 'ทรายเทได้ ทรายจึงเป็นของเหลว', truth: false, why: 'ทรายแต่ละเม็ดเป็นของแข็ง รูปร่างเม็ดไม่เปลี่ยน แค่เม็ดเล็กเลยเทได้' },
    { text: 'เทน้ำลงขวดผอมสูง น้ำจะมีปริมาตรมากขึ้น', truth: false, why: 'ของเหลวมีปริมาตรคงที่ แค่รูปร่างเปลี่ยนตามภาชนะ' },
    { text: 'อากาศมองไม่เห็น แต่ก็เป็นสสาร', truth: true, why: 'อากาศเป็นแก๊ส มีมวลและต้องการที่อยู่ แม้เรามองไม่เห็น' },
    { text: 'น้ำผึ้งไหลช้า น้ำผึ้งจึงเป็นของแข็ง', truth: false, why: 'น้ำผึ้งไหลได้และเปลี่ยนรูปตามภาชนะ จึงเป็นของเหลว' },
    { text: 'แก๊สในลูกโป่ง แผ่ออกเต็มลูกโป่ง', truth: true, why: 'แก๊สแผ่ออกเต็มภาชนะที่บรรจุเสมอ' },
    { text: 'หินก้อนเดียวกัน ใส่ในขวดแล้วเปลี่ยนรูปร่างตามขวด', truth: false, why: 'ของแข็งมีรูปร่างคงที่ ไม่เปลี่ยนตามภาชนะ' }
  ];
  GEN.stateClaim = function (avoid) {
    const list = STATE_CLAIMS.filter((c, i) => !(avoid && avoid.indexOf(i) >= 0));
    const c = pick(list.length ? list : STATE_CLAIMS);
    return Object.assign({ idx: STATE_CLAIMS.indexOf(c), kind: 'state' }, c);
  };

  /* ───────── เลือกวัสดุไปใช้งาน (apply) ───────── */
  const USE = {
    1: [
      { ask: 'ทำหัวค้อนตอกตะปู', good: ['steel', 'stone'], bad: ['sponge', 'clay', 'eraser'], why: 'หัวค้อนต้องแข็ง ตอกแล้วไม่เป็นรอยหรือบุบ' },
      { ask: 'ทำไส้หมอนให้นอนสบาย', good: ['sponge'], bad: ['stone', 'steel', 'wood'], why: 'ไส้หมอนต้องนิ่ม กดแล้วยุบตามหัว' },
      { ask: 'ปูพื้นทางเดินให้คนเหยียบ', good: ['stone'], bad: ['sponge', 'clay', 'eraser'], why: 'พื้นทางเดินต้องแข็ง เหยียบนานก็ไม่ยุบ' },
      { ask: 'ปั้นตุ๊กตาเล่นเป็นรูปต่าง ๆ', good: ['clay'], bad: ['steel', 'stone', 'glass'], why: 'วัสดุปั้นต้องนิ่ม ใช้นิ้วกดให้เป็นรูปได้' },
      { ask: 'ทำเขียงตัดผัก', good: ['wood', 'plastic'], bad: ['sponge', 'clay'], why: 'เขียงต้องแข็งพอจะรองรับมีด ไม่ยุบเวลากด' }
    ],
    2: [
      { ask: 'ทำพื้นรองเท้าวิ่งให้เด้ง', good: ['rubber', 'sponge'], bad: ['wood', 'stone', 'clay'], why: 'พื้นรองเท้าต้องยืดหยุ่น รับแรงแล้วคืนรูป' },
      { ask: 'ทำเตียงกระโดดให้ดีดตัวขึ้น', good: ['spring'], bad: ['paper', 'clay', 'wood'], why: 'สปริงถูกกดแล้วดีดกลับ จึงยืดหยุ่น' },
      { ask: 'รัดผมให้อยู่', good: ['band'], bad: ['paper', 'foil', 'clay'], why: 'ยางยืดดึงได้และหดกลับ จึงรัดแน่น' },
      { ask: 'ทำลูกบอลให้เด้งได้', good: ['ball'], bad: ['clay', 'stone', 'paper'], why: 'ลูกบอลยางถูกกระแทกแล้วกลับรูป จึงเด้ง' },
      { ask: 'ปั้นรูปปั้นให้คงรูปอยู่เฉย ๆ (ต้องไม่ดีดกลับ)', good: ['clay'], bad: ['band', 'sponge', 'spring'], why: 'ดินน้ำมันไม่ยืดหยุ่น ปั้นแล้วคงรูปที่ปั้น' }
    ],
    3: [
      { ask: 'ทำตัวกระทะ ให้อาหารสุกเร็ว', good: ['alu', 'steel'], bad: ['wood', 'plastic', 'rubber'], why: 'ตัวกระทะต้องนำความร้อนดี' },
      { ask: 'ทำด้ามจับกระทะ ไม่ให้มือร้อน', good: ['wood', 'plastic'], bad: ['steel', 'alu'], why: 'ด้ามต้องนำความร้อนไม่ดี' },
      { ask: 'ทำที่จับหม้อร้อน ๆ ให้มือไม่ร้อน', good: ['cloth', 'rubber'], bad: ['steel', 'alu'], why: 'ผ้ากับยางนำความร้อนไม่ดี จับแล้วไม่ร้อนมือ' },
      { ask: 'ทำทัพพีคนซุปที่กำลังเดือด', good: ['wood', 'plastic'], bad: ['steel', 'alu'], why: 'ด้ามที่ไม่นำความร้อนจับแล้วไม่ร้อนมือ' }
    ],
    4: [
      { ask: 'ทำแกนกลางสายไฟ', good: ['wire', 'alu'], bad: ['wood', 'plastic', 'rubber'], why: 'แกนกลางต้องนำไฟฟ้า' },
      { ask: 'ทำปลอกหุ้มสายไฟ', good: ['plastic', 'rubber'], bad: ['steel', 'wire', 'alu'], why: 'ปลอกหุ้มต้องไม่นำไฟฟ้า เพื่อความปลอดภัย' },
      { ask: 'ทำด้ามไขควงของช่างไฟ', good: ['plastic', 'rubber', 'wood'], bad: ['steel', 'alu'], why: 'ด้ามที่ไม่นำไฟฟ้าช่วยให้มือปลอดภัย' },
      { ask: 'ทำขาปลั๊กไฟที่เสียบเข้าเต้ารับ', good: ['wire', 'steel', 'alu'], bad: ['wood', 'plastic', 'rubber'], why: 'ขาปลั๊กต้องนำไฟฟ้า ไฟถึงจะเข้าเครื่องใช้ได้' }
    ]
  };
  GEN.useQ = function (zone, level, avoid) {
    const list = USE[zone].filter((u, i) => !(avoid && avoid.indexOf(zone + ':' + i) >= 0));
    const u = pick(list.length ? list : USE[zone]);
    const idx = USE[zone].indexOf(u);
    const good = pick(u.good);
    const nBad = 2;
    const bad = sample(u.bad, nBad);
    return { idx, key: zone + ':' + idx, ask: u.ask, good: u.good, why: u.why, options: shuffle([good].concat(bad)), answer: good };
  };

  /* ═════════ ส่งออก ═════════ */
  Object.assign(MM, {
    R, pick, shuffle, clamp, sample, without,
    intThai, speakify,
    ITEM, MAT, MAT_ORDER, SI, STATE_N, STATE_CLAIMS, POOL, USE, MYST,
    hardGroup, scratches, nailScratches, heatGood, isElastic, isConductor, nm,
    GEN
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = MM;
})();
