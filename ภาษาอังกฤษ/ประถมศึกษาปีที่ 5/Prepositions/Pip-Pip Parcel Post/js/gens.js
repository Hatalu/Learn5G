/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — ตัวสร้างโจทย์ (สุ่มใหม่ทุกครั้ง แต่ตรวจคำตอบจากข้อมูลจริง) ไม่แตะ DOM
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { scene: SC, art, D } = PP;
  const { int, pick, shuffle, sample } = D;
  const G = PP.G = {};

  /* ── ชื่อไทย ── */
  const ITEM_TH = { parcel: 'พัสดุ', cat: 'แมว', bird: 'นก', ball: 'ลูกบอล', book: 'หนังสือ', kite: 'ว่าว', balloon: 'ลูกโป่ง', boat: 'เรือ', pip: 'ปิ๊บ' };
  const OBJ_TH = { table: 'โต๊ะ', box: 'กล่อง', chair: 'เก้าอี้', bed: 'เตียง', shelf: 'ชั้นวางของ', basket: 'ตะกร้า', house: 'บ้าน', door: 'ประตู', tree: 'ต้นไม้', gate: 'ประตูรั้ว', busstop: 'ป้ายรถเมล์', bridge: 'สะพาน' };
  const TH = { in: 'ใน', on: 'บน', at: 'ที่ / ตรง', under: 'ใต้', above: 'เหนือ', between: 'ระหว่าง', by: 'โดย', with: 'ด้วย' };
  G.ITEM_TH = ITEM_TH; G.OBJ_TH = OBJ_TH;
  const thObj = (e) => e.p === 'between' ? OBJ_TH[e.o[0]] + 'กับ' + OBJ_TH[e.o[1]] : OBJ_TH[(e.o === 'house' && e.p === 'at') ? 'door' : e.o];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* รายการ (entry) จากข้อมูลย่อ ถ้าไม่มีในคลังก็สร้างให้ (ใช้แสดงภาพเท่านั้น) */
  function mkEntry(i, p, o) {
    const hit = D.entryOf(i, p, o);
    if (hit) return hit;
    const e = { i, p, o, key: D.keyOf(i, p, o) };
    e.id = 's_' + e.key; e.text = SC.sentence(e);
    return e;
  }
  G.mkEntry = mkEntry;

  function icon(ic, size) {
    size = size || 72;
    if (ic[0] === 'clock') return art.clockFace(ic[1], ic[2], size);
    if (ic[0] === 'thing') return art.thing(ic[1], size);
    if (ic[0] === 'cal') return art.calPage(ic[1], ic[2], size);
    if (ic[0] === 'month') return art.calPage(ic[1], '', size, 'month');
    return '';
  }
  G.icon = icon;
  const iconCard = (ic, size) => '<div class="fc-ic">' + icon(ic, size || 120) + '</div>';

  /* ── เลือกประโยคจากคลัง ── */
  function entries(preps, n, filter) {
    let pool = ENTRIES_BY(preps).filter(e => D.pickable(e) && (!filter || filter(e)));
    const out = [], seen = {};
    shuffle(pool).forEach(e => { const k = e.i + e.p; if (out.length < n && !seen[e.o + '|' + e.p + '|' + e.i]) { seen[e.o + '|' + e.p + '|' + e.i] = 1; out.push(e); } });
    return out;
  }
  const ENTRIES_BY = preps => D.ENTRIES.filter(e => preps.indexOf(e.p) >= 0);
  /* ให้แต่ละข้อใช้คำบุพบทไม่ซ้ำกันเท่าที่ทำได้ */
  function spread(preps, n, filter) {
    const out = [];
    const order = shuffle(preps);
    let tries = 0;
    while (out.length < n && tries < 80) {
      const p = order[out.length % order.length];
      const cand = D.ENTRIES.filter(e => e.p === p && (!filter || filter(e)) && !out.some(o => o.key === e.key));
      if (cand.length) out.push(pick(cand));
      tries++;
    }
    return out;
  }
  G.spread = spread;
  /* สำหรับโจทย์เลือกภาพ: ต้องมีชุดภาพตัวลวงครบ */
  G.spreadPick = (preps, n) => spread(preps, n, e => D.pickable(e));

  /* ══════════ pick : โจทย์เลือกภาพ ══════════ */
  function sceneOpts(e) {
    const ps = D.pickSet(e);
    if (!ps) throw new Error('no pick set for ' + e.key);
    const target = ps.options[0];
    const opts = shuffle(ps.options);
    return {
      options: opts.map(x => ({ html: SC.svg({ objs: ps.objs, env: ps.env, items: [{ i: x.i, prep: x.p, o: x.o, o2: x.o2 }], cls: 'mini' }) })),
      ans: opts.indexOf(target)
    };
  }
  const hintsScene = e => [
    'คำเล็ก ๆ คือ "' + e.p + '" แปลว่า ' + TH[e.p] + ' ลองดูว่า' + ITEM_TH[e.i] + 'อยู่ตรงไหนของ' + thObj(e),
    'ปิ๊บตัดตัวเลือกที่ไม่ใช่ออกให้ 1 ภาพ',
    'เหลือภาพที่ใช่กะพริบอยู่ ลองแตะเลย'
  ];
  /* mode: 'listen' (ฟังอย่างเดียว) | 'read' (อ่านประโยค) */
  G.qScene = (e, mode) => {
    const o = sceneOpts(e);
    const q = Object.assign({
      options: o.options, ans: o.ans,
      why: { id: e.id, en: e.text, th: '', preps: [e.p], fileOnly: true },
      hints: hintsScene(e), missText: 'ภาพนี้ยังไม่ตรงกับประโยค ดูคำเล็ก ๆ (' + e.p + ') อีกที'
    });
    if (mode === 'listen') { q.inst = 'ฟังประโยค แล้วเลือกภาพที่ตรงกัน'; q.audio = { id: e.id, text: e.text, th: 'ฟังแล้วเลือกภาพ', hide: true }; }
    else { q.inst = 'อ่านประโยค แล้วเลือกภาพที่ตรงกัน'; q.prompt = { id: e.id, en: e.text, th: 'อ่านแล้วเลือกภาพ', silent: true }; q.ask = { en: e.text, th: '' }; q.audioBtn = { id: e.id, text: e.text }; }
    return q;
  };
  G.pickScene = (entriesArr, mode) => ({ type: 'pick', qs: entriesArr.map(e => G.qScene(e, mode)) });

  /* ตัวเลือกไอคอน/ของ/นาฬิกาสำหรับโน้ตและข้อความเสียง */
  const fmtClock = (h, m) => h + ':' + (m < 10 ? '0' : '') + m;
  const clockSay = (h, m) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][h] + " o'clock";
  const METHODBY = k => D.METHOD.find(m => m.k === k);
  function qFromSpec(spec) {
    const q = { ask: { en: spec.en, th: spec.th }, hints: ['ฟัง/อ่านอีกครั้ง ตั้งใจจับคำสำคัญ', 'ปิ๊บตัดตัวเลือกที่ไม่ใช่ออกให้ 1 ตัว', 'เหลือตัวเลือกที่ใช่กะพริบอยู่'] , missText: 'ยังไม่ใช่ ลองฟัง/อ่านอีกครั้งนะ' };
    if (spec.kind === 'scene') {
      const e = mkEntry(spec.entry[0], spec.entry[1], spec.entry[2]);
      const o = sceneOpts(e);
      q.options = o.options; q.ans = o.ans; q.why = { id: e.id, en: e.text, th: '', preps: [e.p], fileOnly: true }; q.hints = hintsScene(e);
    } else if (spec.kind === 'icons') {
      const keys = shuffle(spec.pool);
      q.options = keys.map(k => { const t = D.TIMEBY(k); return { html: icon(t.icon, 84), label: t.w }; }); q.ans = keys.indexOf(spec.ans);
      const t = D.TIMEBY(spec.ans); q.why = { id: t.id, en: t.text, th: '', preps: [t.prep], fileOnly: true };
    } else if (spec.kind === 'things') {
      const keys = shuffle(spec.pool);
      q.options = keys.map(k => { const m = METHODBY(k); return { html: art.thing(m.thing, 96), label: cap(m.n.replace(/^a /, '')) }; }); q.ans = keys.indexOf(spec.ans);
      const m = METHODBY(spec.ans); q.why = { id: null, en: m.phrase, th: '', preps: [m.prep], fileOnly: true };
    } else if (spec.kind === 'clocks') {
      const keys = shuffle(spec.pool.map(x => x.join(':')));
      q.options = keys.map(k => { const [hh, mm] = k.split(':').map(Number); return { html: art.clockFace(hh, mm, 92), label: fmtClock(hh, mm) }; });
      q.ans = keys.indexOf(spec.ans.join(':'));
      q.why = { id: null, en: 'at ' + clockSay(spec.ans[0], spec.ans[1]), th: '', preps: ['at'], fileOnly: true };
    }
    return q;
  }
  G.qFromSpec = qFromSpec;
  /* ข้อความเสียง (ฟัง) : ทุกข้อใช้เสียงเดียวกัน ข้อแรกเล่นอัตโนมัติ */
  G.mail = (m) => ({
    type: 'pick', mail: m.id,
    qs: m.qs.map((s, i) => Object.assign(qFromSpec(s), {
      inst: 'ฟังข้อความเสียง แล้วตอบคำถาม',
      audio: { id: 'mail_' + m.id, text: m.text, th: 'ข้อความเสียงจากลูกค้า', hide: true, who: 'guest', name: 'ข้อความเสียง · Voice message' },
      noAuto: i > 0
    }))
  });
  /* โน้ต (อ่าน) */
  G.notes = (n) => ({ type: 'notes', id: n.id, text: n.text, targets: n.targets, q: Object.assign(qFromSpec(n.q), { inst: 'อ่านโน้ตอีกครั้ง แล้วตอบคำถาม', prompt: { en: n.q.en, th: n.q.th, silent: true } }) });

  /* ══════════ fix : ซ่อมป้าย ══════════ */
  const splitAt = (text, prep) => { const i = text.indexOf(' ' + prep + ' '); return [text.slice(0, i + 1), text.slice(i + 1 + prep.length)]; };
  const optSet = (ans, pool, n) => shuffle([ans].concat(sample(pool.filter(x => x !== ans), Math.max(0, (n || 3) - 1))));
  G.fixPlace = (e, pool) => {
    const [before, after] = splitAt(e.text, e.p);
    return {
      kind: 'place', entry: e, before, after, answer: e.p, options: optSet(e.p, pool, 3), sentence: e.text, audioId: e.id,
      inst: 'ดูภาพที่ลูกค้าต้องการ แล้วเลือกคำเล็ก ๆ ที่หายไป', th: 'ซ่อมป้ายให้ตรงกับภาพ',
      hints: ['ดูภาพลูกค้า: ' + ITEM_TH[e.i] + 'อยู่ตรงไหนของ' + thObj(e) + ' แล้วนึกถึงคำที่บอกตำแหน่งนั้น', 'ภาพลูกค้าเรืองแสงแล้ว ดูตำแหน่งให้ละเอียด', 'ปิ๊บตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'],
      why: e.p + ' = ' + TH[e.p],
      wrongText: w => 'พัสดุไม่ไปอยู่ตามภาพ ลองเทียบกับภาพลูกค้าอีกที'
    };
  };
  const KIND_TH = { at: 'จุดเวลา (เช่นเวลาบนนาฬิกา)', on: 'วัน หรือวันที่', in: 'ช่วงเวลายาว (เดือน ฤดู ปี ช่วงของวัน)' };
  G.fixTime = (ts) => {
    const [before, after] = splitAt(ts.text, ts.prep);
    return {
      kind: 'time', before, after, answer: ts.prep, options: ['at', 'on', 'in'], sentence: ts.text, audioId: ts.id, iconHTML: iconCard(ts.icon, 120),
      inst: 'ดูภาพเวลา แล้วเลือก at / on / in', th: 'at, on หรือ in?',
      hints: ['at = จุดเวลา/นาฬิกา · on = วัน/วันที่ · in = ช่วงเวลายาว', 'ปิ๊บส่องภาพเวลาให้แล้ว: ภาพนี้คือ ' + KIND_TH[ts.prep], 'ปิ๊บตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'],
      why: ts.prep + ' = ' + KIND_TH[ts.prep],
      wrongText: w => 'ลองดูภาพ: นี่คือ "จุดเวลา" "วัน" หรือ "ช่วงเวลายาว"?'
    };
  };
  G.fixMethod = (m) => {
    const [before, after] = splitAt(m.text, m.prep);
    return {
      kind: 'method', before, after, answer: m.prep, options: ['by', 'with'], sentence: m.text, audioId: m.id, iconHTML: iconCard(['thing', m.thing], 120),
      inst: 'ดูภาพ แล้วเลือก by หรือ with', th: 'by หรือ with?',
      hints: ['by = ยานพาหนะ (by bus) · with = เครื่องมือ (with a pen)', 'ปิ๊บส่องภาพให้แล้ว: ภาพนี้คือ ' + (m.prep === 'by' ? 'ยานพาหนะ' : 'เครื่องมือ'), 'ปิ๊บตัดตัวเลือกที่ไม่ใช่ออกให้แล้ว'],
      why: m.prep === 'by' ? 'by + ยานพาหนะ (ไม่ใช้ a / the)' : 'with + เครื่องมือ',
      wrongText: w => 'ลองดูภาพ: นี่คือ "ยานพาหนะ" หรือ "เครื่องมือ"?'
    };
  };

  /* ══════════ drop : วางพัสดุ ══════════ */
  G.dropRounds = (zone, n, showText) => {
    const rec = shuffle(D.DROP[zone]);
    const out = []; let avoid = null;
    for (let i = 0; i < n; i++) {
      const r = rec[i % rec.length];
      const d = D.dropFrom(r, avoid);
      avoid = d.target.id;
      d.why = s => 'พัสดุไปอยู่ ' + s.prep + ' ' + (OBJ_TH[s.o] || '') + ' แต่ที่ได้ยินคือ "' + d.target.prep + '" ลองฟังอีกครั้ง';
      out.push(d);
    }
    return { type: 'drop', rounds: out, showText: !!showText };
  };

  /* ══════════ say : ฝึกพูด ══════════ */
  const objWords = e => (e.p === 'between' ? e.o : [e.o]).map(o => SC.objName(o, e.p));
  const subjLine = { cat: 'qWhereCat', parcel: 'qWhereParcel', ball: 'qWhereBall', bird: 'qWhereBird', pip: 'qWherePip', book: 'qWhereBook' };
  const objPhrase = e => e.p === 'between' ? 'the ' + SC.objName(e.o[0], 'x') + ' and the ' + SC.objName(e.o[1], 'x') : 'the ' + SC.objName(e.o, e.p);
  G.sayEcho = (e) => ({ mode: 'echo', pic: SC.ofEntry(e, { cls: 'big' }), text: e.text, audioId: e.id, targets: [e.text], keys: [e.p].concat(objWords(e)), inst: 'ฟังปิ๊บ แล้วกดไมค์พูดตาม' });
  G.sayDescribe = (e) => { const [b, a] = splitAt(e.text, e.p); return { mode: 'describe', pic: SC.ofEntry(e, { cls: 'big' }), text: e.text, before: b, after: a, audioId: e.id, targets: [e.text, 'It is ' + e.p + ' ' + objPhrase(e) + '.', e.p + ' ' + objPhrase(e) + '.'], keys: [e.p].concat(objWords(e)), inst: 'ดูภาพ แล้วพูดประโยคให้ครบ (เติมคำเล็ก ๆ ที่หายไป)' }; };
  G.sayAnswer = (e) => {
    const lid = subjLine[e.i];
    const subj = e.i === 'pip' ? 'Pip' : 'the ' + e.i;
    return { mode: 'answer', pic: SC.ofEntry(e, { cls: 'big' }), text: e.text, audioId: e.id, ask: { id: 'l_' + lid, en: PP.LINES[lid][1], th: PP.LINES[lid][2] }, frame: (e.i === 'pip' ? 'Pip' : 'The ' + e.i) + ' is ... .',
      targets: [e.text, 'It is ' + e.p + ' ' + objPhrase(e) + '.', e.p + ' ' + objPhrase(e) + '.'], keys: [e.p].concat(objWords(e)), inst: 'ปิ๊บถามคำถาม ดูภาพแล้วตอบเป็นประโยค' };
  };
  G.sayTime = (ts) => ({ mode: 'echo', pic: '<div class="say-ic">' + icon(ts.icon, 130) + '</div>', text: ts.text, audioId: ts.id, targets: [ts.text], keys: [ts.prep], inst: 'ฟังปิ๊บ แล้วกดไมค์พูดตาม' });
  G.sayMethod = (m) => ({ mode: 'echo', pic: '<div class="say-ic">' + icon(['thing', m.thing], 130) + '</div>', text: m.text, audioId: m.id, targets: [m.text], keys: [m.prep], inst: 'ฟังปิ๊บ แล้วกดไมค์พูดตาม' });
  G.sayAskTime = () => {
    const ts = D.TSENT.find(t => t.k === 'at_9');
    return { mode: 'answer', pic: '<div class="say-ic">' + icon(ts.icon, 130) + '</div>', text: ts.text, audioId: ts.id, ask: { id: 'l_qOpen', en: PP.LINES.qOpen[1], th: PP.LINES.qOpen[2] }, frame: 'It opens ... .',
      targets: [ts.text, "It opens at nine o'clock.", "At nine o'clock."], keys: ['at'], inst: 'ปิ๊บถามคำถาม ดูภาพแล้วตอบเป็นประโยค' };
  };
  G.sayAskGo = () => {
    const m = D.METHOD.find(x => x.k === 'schoolbus');
    const veh = ['bus', 'bike', 'car', 'train', 'boat'];
    return { mode: 'answer', pic: '<div class="say-ic">' + icon(['thing', 'bus'], 130) + '</div>', text: m.text, audioId: m.id, ask: { id: 'l_qGo', en: PP.LINES.qGo[1], th: PP.LINES.qGo[2] }, frame: 'I go to school ... .',
      targets: veh.map(v => 'I go to school by ' + v + '.').concat(veh.map(v => 'By ' + v + '.')), keys: ['by'], inst: 'ปิ๊บถามคำถาม ตอบด้วยยานพาหนะของเธอ (by ...)' };
  };

  /* ══════════ build / spell : เขียน ══════════ */
  const prepsFor = pool => pool;
  G.buildPlace = (e, pool, dictate) => ({
    words: e.text.split(' '), extra: sample(pool.filter(p => p !== e.p), 1), text: e.text, keys: [e.p], audioId: e.id, pic: SC.ofEntry(e, { cls: 'mini' }), dictate: !!dictate,
    inst: dictate ? 'ฟังแล้วแตะคำเรียงเป็นประโยค' : 'ดูภาพ แล้วแตะคำเรียงเป็นประโยค'
  });
  G.buildTime = (ts, dictate) => ({
    words: ts.text.split(' '), extra: sample(['at', 'on', 'in'].filter(p => p !== ts.prep), 1), text: ts.text, keys: [ts.prep], audioId: ts.id, pic: iconCard(ts.icon, 90), dictate: !!dictate,
    inst: dictate ? 'ฟังแล้วแตะคำเรียงเป็นประโยค' : 'ดูภาพเวลา แล้วแตะคำเรียงเป็นประโยค'
  });
  G.buildMethod = (m, dictate) => ({
    words: m.text.split(' '), extra: [m.prep === 'by' ? 'with' : 'by'], text: m.text, keys: [m.prep], audioId: m.id, pic: iconCard(['thing', m.thing], 90), dictate: !!dictate,
    inst: dictate ? 'ฟังแล้วแตะคำเรียงเป็นประโยค' : 'ดูภาพ แล้วแตะคำเรียงเป็นประโยค'
  });
  G.spellPlace = (e) => ({
    word: e.p, pic: SC.ofEntry(e, { cls: 'mini' }), sentence: e.text, sentenceBlank: splitAt(e.text, e.p)[0] + '_____' + splitAt(e.text, e.p)[1], audioId: e.id,
    hints: ['ดูภาพ: ' + ITEM_TH[e.i] + 'อยู่ตรงไหนของ' + thObj(e) + ' คำนั้นคือ ' + e.p.length + ' ตัวอักษร', 'ปิ๊บอ่านคำให้ฟัง และใส่ตัวแรกให้แล้ว', 'ปิ๊บใส่ตัวอักษรให้ครึ่งคำแล้ว ต่ออีกนิดเดียว'],
    th: 'สะกดคำเล็ก ๆ ที่หายไป', inst: 'ดูภาพ แล้วสะกดคำเล็ก ๆ ที่หายไป'
  });
  G.spellMethod = (m) => ({
    word: m.prep, pic: '<div class="say-ic">' + icon(['thing', m.thing], 100) + '</div>', sentence: m.text, sentenceBlank: splitAt(m.text, m.prep)[0] + '_____' + splitAt(m.text, m.prep)[1], audioId: m.id,
    hints: [m.prep === 'by' ? 'ยานพาหนะใช้ by (2 ตัวอักษร)' : 'เครื่องมือใช้ with (4 ตัวอักษร)', 'ปิ๊บอ่านคำให้ฟัง และใส่ตัวแรกให้แล้ว', 'ปิ๊บใส่ตัวอักษรให้ครึ่งคำแล้ว'],
    th: 'สะกดคำเล็ก ๆ ที่หายไป', inst: 'ดูภาพ แล้วสะกดคำเล็ก ๆ ที่หายไป'
  });

  /* ══════════ gate : การ์ดเวลา ══════════ */
  G.deck = (counts, pool) => {
    const out = [];
    ['at', 'on', 'in'].forEach(p => {
      const c = counts[p] || 0;
      const cand = D.TIME.filter(t => t.prep === p && (!pool || pool.indexOf(t.k) >= 0));
      sample(cand, c).forEach(t => out.push(t));
    });
    return shuffle(out);
  };
  G.timeExamples = () => ({
    at: ['at_7', 'at_330', 'at_noon'].map(D.TIMEBY), on: ['on_mon', 'on_may5', 'on_bday'].map(D.TIMEBY), in: ['in_jun', 'in_summer', 'in_morning'].map(D.TIMEBY)
  });
  G.methodExamples = () => ({
    by: ['boat', 'train', 'bike', 'plane'].map(METHODBY), with: ['scissors', 'pen', 'key', 'brush'].map(METHODBY)
  });

  PP.G.cap = cap;
})();
