/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — คลังเนื้อหา + ตัวสร้างโจทย์ (ฟังก์ชันล้วน ไม่แตะ DOM ทดสอบด้วย node ได้)
   เนื้อหาตามที่ครูกำหนด: คำบุพบท in on at between under above · ตำแหน่ง เวลา วิธีการ (by / with)
   ทุกประโยคอังกฤษในคลังมีรหัสเสียง (CLIPS) เพื่อผลิตไฟล์พากย์คุณภาพสูงไว้ล่วงหน้า
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP = window.PP || {};
  const SC = PP.scene;

  /* ── ตัวช่วยสุ่ม ── */
  const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const sample = (a, n) => shuffle(a).slice(0, n);

  /* ══════════ คำบุพบทสถานที่ : คลังประโยค ══════════ */
  /* i = ไอเท็ม · p = คำบุพบท · o = วัตถุ (between = [วัตถุซ้าย, วัตถุขวา]) */
  const RAW = {
    in: [['parcel', 'box'], ['ball', 'box'], ['cat', 'box'], ['parcel', 'basket'], ['ball', 'basket'], ['cat', 'basket'], ['bird', 'tree']],
    on: [['parcel', 'table'], ['cat', 'table'], ['book', 'table'], ['ball', 'table'], ['cat', 'chair'], ['parcel', 'chair'], ['cat', 'bed'], ['ball', 'bed'], ['parcel', 'shelf'], ['book', 'shelf'], ['pip', 'bridge'], ['parcel', 'bridge']],
    at: [['pip', 'door'], ['cat', 'door'], ['parcel', 'door'], ['cat', 'gate'], ['pip', 'busstop'], ['parcel', 'busstop']],
    under: [['parcel', 'table'], ['cat', 'table'], ['ball', 'table'], ['cat', 'chair'], ['ball', 'chair'], ['parcel', 'chair'], ['ball', 'bed'], ['cat', 'bed'], ['cat', 'tree'], ['pip', 'tree'], ['boat', 'bridge'], ['parcel', 'shelf']],
    above: [['bird', 'tree'], ['kite', 'tree'], ['pip', 'tree'], ['bird', 'house'], ['kite', 'house'], ['pip', 'house'], ['balloon', 'table'], ['parcel', 'table']],
    between: [['ball', ['box', 'basket']], ['cat', ['box', 'basket']], ['parcel', ['box', 'basket']], ['cat', ['chair', 'table']], ['ball', ['chair', 'table']], ['parcel', ['chair', 'table']], ['pip', ['tree', 'house']], ['cat', ['tree', 'house']]]
  };
  const keyOf = (i, p, o) => i + '_' + p + '_' + (Array.isArray(o) ? o.join('+') : o);
  const ENTRIES = [];
  Object.keys(RAW).forEach(p => RAW[p].forEach(r => {
    const e = { i: r[0], p, o: r[1] };
    e.key = keyOf(e.i, e.p, e.o);
    e.id = 's_' + e.key;
    e.text = SC.sentence(e);
    ENTRIES.push(e);
  }));
  const byPrep = p => ENTRIES.filter(e => e.p === p);
  const entryOf = (i, p, o) => ENTRIES.find(e => e.key === keyOf(i, p, o));

  /* ไอเท็มทำอะไรได้บ้าง (กันภาพแปลก ๆ เช่น แมวลอยเหนือโต๊ะ) */
  const CAN = { parcel: ['in', 'on', 'under', 'above', 'at', 'between'], cat: ['in', 'on', 'under', 'at', 'between'], ball: ['in', 'on', 'under', 'between'], book: ['in', 'on', 'under'], bird: ['in', 'on', 'above', 'at'], pip: ['on', 'under', 'above', 'at', 'between'], kite: ['above'], balloon: ['above'], boat: ['under'] };
  const canDo = (i, p) => (CAN[i] || []).indexOf(p) >= 0;
  /* ── ชุดภาพสำหรับโจทย์ "เลือกภาพ" ──
     ฉากมีวัตถุ 2 อย่าง (วัตถุของประโยค + ตัวประกอบ) ทุกตัวเลือกใช้ฉากเดียวกัน
     ตัวเลือก = ตำแหน่งที่ไอเท็มเดิมไปอยู่ได้อย่างสมเหตุสมผล (คำบุพบท/วัตถุต่างกัน) ตัวแรกคือคำตอบ */
  const GROUPS = { indoor: ['table', 'chair', 'bed', 'shelf', 'box', 'basket'], outdoor: ['tree', 'house', 'gate', 'busstop'] };
  function plausible(i, p, o) {
    if (!canDo(i, p) || SC.OBJ[o].preps.indexOf(p) < 0) return false;
    if (o === 'bridge' && p === 'under' && i !== 'boat' && i !== 'pip') return false;
    return true;
  }
  function layout2(a, b) {
    const wa = SC.OBJ[a].w, wb = SC.OBJ[b].w, m = Math.max(10, (400 - wa - wb) / 3);
    return [{ o: a, x: Math.round(m + wa / 2) }, { o: b, x: Math.round(2 * m + wa + wb / 2) }];
  }
  function pickSet(e) {
    /* ลองทุกตัวประกอบที่เป็นไปได้ตามลำดับสุ่ม จนได้ชุดที่ครบ */
    let layouts;
    if (e.p === 'between') layouts = [SC.pairPositions(e.o[0], e.o[1]).map(q => ({ o: q[0], x: q[1] }))];
    else if (e.o === 'bridge') layouts = [[{ o: 'bridge', x: 200 }]];
    else {
      const base = e.o === 'door' ? 'house' : e.o;
      const grp = GROUPS[SC.OBJ[base].env === 'outdoor' ? 'outdoor' : 'indoor'];
      layouts = shuffle(grp.filter(g => g !== base)).map(comp => Math.random() < 0.5 ? layout2(e.o, comp) : layout2(comp, e.o));
    }
    for (let t = 0; t < layouts.length; t++) {
      const objs = layouts[t];
      const combos = [];
      objs.forEach(ob => SC.OBJ[ob.o].preps.forEach(p => { if (!(ob.o === e.o && p === e.p && e.p !== 'between') && plausible(e.i, p, ob.o)) combos.push({ i: e.i, p, o: ob.o }); }));
      /* เลือกตัวลวง 2 ตัว (ภาพไม่ซ้ำกัน และคำบุพบทต่างจากคำตอบอย่างน้อย 1 ตัว) */
      const diffPrep = combos.filter(c => c.p !== e.p);
      if (combos.length < 2 || !diffPrep.length) continue;
      const first = pick(diffPrep);
      const rest = combos.filter(c => !(c.p === first.p && c.o === first.o));
      if (!rest.length) continue;
      const second = pick(rest);
      const target = { i: e.i, p: e.p, o: e.p === 'between' ? e.o[0] : e.o, o2: e.p === 'between' ? e.o[1] : undefined };
      return { objs, env: SC.OBJ[objs[0].o].env, options: [target, first, second] };
    }
    return null;
  }
  const pickable = e => !!pickSet(e);
  const distractors = (e, n) => { const s = pickSet(e); return s ? s.options.slice(1, 1 + n) : null; };

  /* ══════════ วางพัสดุ (Listen & Put) : แบบฉาก ══════════ */
  /* objs = [[วัตถุ, x]] · only = จุดที่แสดง · env */
  const DROP = {
    1: [
      { env: 'outdoor', objs: [['box', 62], ['chair', 172], ['busstop', 318]], only: ['box:in', 'chair:on', 'busstop:at'] },
      { env: 'outdoor', objs: [['basket', 62], ['chair', 172], ['house', 320]], only: ['basket:in', 'chair:on', 'house:at'] },
      { env: 'outdoor', objs: [['box', 62], ['shelf', 190], ['gate', 330]], only: ['box:in', 'shelf:on', 'gate:at'] }
    ],
    2: [
      { env: 'indoor', objs: [['table', 200]], only: ['table:on', 'table:under', 'table:above'], targets: ['table:under', 'table:above'] },
      { env: 'outdoor', objs: [['tree', 200]], only: ['tree:in', 'tree:under', 'tree:above'], targets: ['tree:under', 'tree:above'] },
      { env: 'indoor', pair: ['box', 'basket'], only: ['between', 'box:in', 'basket:in'], targets: ['between'] },
      { env: 'indoor', objs: [['bed', 200]], only: ['bed:on', 'bed:under', 'bed:above'], targets: ['bed:under', 'bed:above'] },
      { env: 'indoor', pair: ['chair', 'table'], only: ['between', 'chair:under', 'table:under'], targets: ['between'] }
    ],
    3: [
      { env: 'indoor', objs: [['table', 110], ['chair', 300]], only: ['table:on', 'table:under', 'chair:on', 'chair:under'] },
      { env: 'outdoor', objs: [['tree', 90], ['house', 300]], only: ['tree:under', 'tree:above', 'house:at', 'house:above'] },
      { env: 'indoor', objs: [['box', 70], ['bed', 270]], only: ['box:in', 'box:above', 'bed:on', 'bed:under'] },
      { env: 'indoor', objs: [['shelf', 110], ['basket', 300]], only: ['shelf:on', 'shelf:under', 'basket:in', 'basket:above'] },
      { env: 'indoor', pair: ['box', 'basket'], only: ['between', 'box:in', 'basket:in', 'box:above'], targets: ['between', 'box:above'] }
    ]
  };
  /* สร้างโจทย์วางพัสดุจากแบบ r → {objs, spots, ghosts, target, text, id} */
  function dropFrom(recipe, avoidId) {
    const objs = recipe.pair ? SC.pairPositions(recipe.pair[0], recipe.pair[1]).map(q => ({ o: q[0], x: q[1] })) : recipe.objs.map(q => ({ o: q[0], x: q[1] }));
    const spots = [];
    objs.forEach(ob => SC.OBJ[ob.o].preps.forEach(p => {
      const id = ob.o + ':' + p;
      if (recipe.only.indexOf(id) < 0) return;
      const a = SC.OBJ[ob.o].anchors(ob.x)[p];
      spots.push({ id, prep: p, o: ob.o, x: a[0], y: a[1] });
    }));
    if (recipe.pair && recipe.only.indexOf('between') >= 0) spots.push({ id: 'between', prep: 'between', o: recipe.pair[0], o2: recipe.pair[1], x: 200, y: SC.FLOOR });
    const tIds = (recipe.targets || recipe.only);
    const cand = spots.filter(s => tIds.indexOf(s.id) >= 0 && s.id !== avoidId);
    const t = pick(cand.length ? cand : spots);
    const text = SC.command('parcel', t.prep, t.o, t.o2);
    const slug = s => s.replace(/\s+/g, '');
    return { env: recipe.env, objs, spots, target: t, text, id: 'd_' + t.prep + '_' + slug(SC.objName(t.o, t.prep)) + (t.o2 ? '_' + slug(SC.objName(t.o2, 'x')) : ''), ghosts: spots.map(s => ({ id: s.id, prep: s.prep, o: s.o, x: s.x, y: s.y, w: 46, h: 44 })) };
  }
  /* คำสั่งทั้งหมดที่เป็นไปได้ (ใช้ผลิตไฟล์เสียง) */
  function allDropCommands() {
    const out = {};
    Object.keys(DROP).forEach(z => DROP[z].forEach(r => {
      const d0 = r.targets || r.only;
      d0.forEach(tid => {
        const recipe = Object.assign({}, r, { targets: [tid] });
        const d = dropFrom(recipe);
        out[d.id] = d.text;
      });
    }));
    return out;
  }

  /* ══════════ เวลา: at / on / in ══════════ */
  const TIME = [
    { k: 'at_7', prep: 'at', w: "seven o'clock", icon: ['clock', 7, 0] },
    { k: 'at_9', prep: 'at', w: "nine o'clock", icon: ['clock', 9, 0] },
    { k: 'at_330', prep: 'at', w: 'half past three', icon: ['clock', 3, 30] },
    { k: 'at_noon', prep: 'at', w: 'noon', icon: ['thing', 'sun'] },
    { k: 'at_night', prep: 'at', w: 'night', icon: ['thing', 'moon'] },
    { k: 'at_mid', prep: 'at', w: 'midnight', icon: ['clock', 12, 0] },
    { k: 'on_mon', prep: 'on', w: 'Monday', icon: ['cal', 'MON', ''] },
    { k: 'on_fri', prep: 'on', w: 'Friday', icon: ['cal', 'FRI', ''] },
    { k: 'on_sun', prep: 'on', w: 'Sunday', icon: ['cal', 'SUN', ''] },
    { k: 'on_bday', prep: 'on', w: 'my birthday', icon: ['thing', 'cake'] },
    { k: 'on_may5', prep: 'on', w: '5 May', icon: ['cal', '5', 'MAY'] },
    { k: 'in_jun', prep: 'in', w: 'June', icon: ['month', 'JUN'] },
    { k: 'in_dec', prep: 'in', w: 'December', icon: ['month', 'DEC'] },
    { k: 'in_summer', prep: 'in', w: 'summer', icon: ['thing', 'sun'] },
    { k: 'in_rainy', prep: 'in', w: 'the rainy season', icon: ['thing', 'rain'] },
    { k: 'in_2026', prep: 'in', w: '2026', icon: ['month', '2026'] },
    { k: 'in_morning', prep: 'in', w: 'the morning', icon: ['thing', 'sunrise'] },
    { k: 'in_afternoon', prep: 'in', w: 'the afternoon', icon: ['thing', 'sun'] },
    { k: 'in_evening', prep: 'in', w: 'the evening', icon: ['thing', 'sunset'] }
  ];
  TIME.forEach(t => { t.id = 'tp_' + t.k; t.text = t.prep + ' ' + t.w; });
  const TIMEBY = k => TIME.find(t => t.k === k);
  const TSENT_RAW = [
    ['The post office opens at nine o\'clock.', 'at_9'], ["School starts at seven o'clock.", 'at_7'], ['The mail truck leaves at half past three.', 'at_330'],
    ['Pip eats lunch at noon.', 'at_noon'], ['The bird sleeps at night.', 'at_night'],
    ['The parcel comes on Monday.', 'on_mon'], ['Pip rests on Sunday.', 'on_sun'], ['The party is on Friday.', 'on_fri'], ['My birthday is on 5 May.', 'on_may5'],
    ['Pip delivers parcels in the morning.', 'in_morning'], ['Pip reads a book in the evening.', 'in_evening'], ['It rains a lot in the rainy season.', 'in_rainy'], ['My birthday is in June.', 'in_jun'], ['The big party is in December.', 'in_dec']
  ];
  const TSENT = TSENT_RAW.map((r, n) => { const t = TIMEBY(r[1]); return { id: 'ts_' + r[1], text: r[0], k: r[1], prep: t.prep, phrase: t.prep + ' ' + t.w, w: t.w, icon: t.icon, n }; });

  /* ══════════ วิธีการ: by / with ══════════ */
  const METHOD = [
    { k: 'boat', prep: 'by', n: 'boat', thing: 'boat', text: 'Pip goes to the island by boat.' },
    { k: 'train', prep: 'by', n: 'train', thing: 'train', text: 'The parcel goes to the city by train.' },
    { k: 'bus', prep: 'by', n: 'bus', thing: 'bus', text: 'Mr. Bee comes to the post office by bus.' },
    { k: 'bike', prep: 'by', n: 'bike', thing: 'bike', text: 'Pip rides to the park by bike.' },
    { k: 'car', prep: 'by', n: 'car', thing: 'car', text: 'We go to the market by car.' },
    { k: 'plane', prep: 'by', n: 'plane', thing: 'plane', text: 'The big parcel goes to Japan by plane.' },
    { k: 'scissors', prep: 'with', n: 'scissors', thing: 'scissors', text: 'Pip cuts the string with scissors.' },
    { k: 'pen', prep: 'with', n: 'a pen', thing: 'pen', text: 'Pip writes the address with a pen.' },
    { k: 'spoon', prep: 'with', n: 'a spoon', thing: 'spoon', text: 'I eat rice with a spoon.' },
    { k: 'key', prep: 'with', n: 'a key', thing: 'key', text: 'Pip opens the door with a key.' },
    { k: 'brush', prep: 'with', n: 'a brush', thing: 'brush', text: 'Pip paints the box with a brush.' },
    { k: 'schoolbus', prep: 'by', n: 'bus', thing: 'bus', text: 'I go to school by bus.', noPool: true }
  ];
  METHOD.forEach(m => { m.id = 'ms_' + m.k; m.phrase = m.prep + ' ' + m.n; });
  const VEH = METHOD.filter(m => m.prep === 'by' && !m.noPool), TOOL = METHOD.filter(m => m.prep === 'with');

  /* ══════════ โน้ต (อ่าน) และข้อความเสียง (ฟัง) ══════════ */
  const NOTES = [
    { id: 'n1', text: 'Dear Pip,\nthe ball is in the basket.\nThe cat is on the chair.\nThank you!', targets: ['in', 'on'],
      q: { en: 'Where is the cat?', th: 'แมวอยู่ที่ไหน?', kind: 'scene', entry: ['cat', 'on', 'chair'] } },
    { id: 'n2', text: 'Hi Pip!\nI am at the bus stop.\nThe parcel is between the tree and the house.\nSee you!', targets: ['at', 'between'],
      q: { en: 'Where is the parcel?', th: 'พัสดุอยู่ที่ไหน?', kind: 'scene', entry: ['parcel', 'between', ['tree', 'house']] } },
    { id: 'n3', text: "Dear Pip,\nplease come on Friday.\nThe party is at six o'clock in the evening.", targets: ['on', 'at', 'in'],
      q: { en: 'What day is the party?', th: 'งานเลี้ยงวันอะไร?', kind: 'icons', ans: 'on_fri', pool: ['on_mon', 'on_fri', 'on_sun'] } },
    { id: 'n4', text: 'Dear Pip,\nsend the big box by plane.\nCut the string with scissors.', targets: ['by', 'with'],
      q: { en: 'How does the box go?', th: 'กล่องใหญ่ไปอย่างไร?', kind: 'things', ans: 'plane', pool: ['plane', 'boat', 'bus'] } },
    { id: 'n5', text: "Dear Pip,\nthe parcel is under the table.\nCome on Sunday at four o'clock.\nGo by bus!", targets: ['under', 'on', 'at', 'by'],
      q: { en: 'Where is the parcel?', th: 'พัสดุอยู่ที่ไหน?', kind: 'scene', entry: ['parcel', 'under', 'table'] } }
  ];
  const MAIL = [
    { id: 'vm1', text: 'Hi Pip! The parcel is on the table. The cat is under the table.',
      qs: [{ en: 'Where is the parcel?', th: 'พัสดุอยู่ที่ไหน?', kind: 'scene', entry: ['parcel', 'on', 'table'] }, { en: 'Where is the cat?', th: 'แมวอยู่ที่ไหน?', kind: 'scene', entry: ['cat', 'under', 'table'] }] },
    { id: 'vm2', text: 'Hello Pip! The ball is in the basket. The bird is above the tree.',
      qs: [{ en: 'Where is the ball?', th: 'ลูกบอลอยู่ที่ไหน?', kind: 'scene', entry: ['ball', 'in', 'basket'] }, { en: 'Where is the bird?', th: 'นกอยู่ที่ไหน?', kind: 'scene', entry: ['bird', 'above', 'tree'] }] },
    { id: 'vm3', text: "Hi Pip! Come on Monday. I am home at five o'clock.",
      qs: [{ en: 'Which day?', th: 'วันไหน?', kind: 'icons', ans: 'on_mon', pool: ['on_mon', 'on_fri', 'on_sun'] }, { en: 'What time?', th: 'กี่โมง?', kind: 'clocks', ans: [5, 0], pool: [[5, 0], [3, 0], [7, 0]] }] },
    { id: 'vm4', text: 'Dear Pip, send the big parcel by plane. Cut the string with scissors.',
      qs: [{ en: 'How does the parcel go?', th: 'พัสดุไปอย่างไร?', kind: 'things', ans: 'plane', pool: ['plane', 'boat', 'bus'] }, { en: 'What is for the string?', th: 'ใช้อะไรตัดเชือก?', kind: 'things', ans: 'scissors', pool: ['scissors', 'pen', 'spoon'] }] },
    { id: 'vm5', text: 'Hello Pip! Leave the parcel under the tree. I come by bus on Monday.',
      qs: [{ en: 'Where is the parcel?', th: 'พัสดุอยู่ที่ไหน?', kind: 'scene', entry: ['parcel', 'under', 'tree'] }, { en: 'How does he come?', th: 'เขามาอย่างไร?', kind: 'things', ans: 'bus', pool: ['bus', 'train', 'bike'] }, { en: 'Which day?', th: 'วันไหน?', kind: 'icons', ans: 'on_mon', pool: ['on_mon', 'on_fri', 'on_sun'] }] }
  ];

  /* คำศัพท์เดี่ยว (ฟังเสียงเมื่อแตะ) */
  const WORDS = ['in', 'on', 'at', 'under', 'above', 'between', 'by', 'with'];
  /* พยางค์/เสียงเน้น (ใช้โชว์ตอนฝึกพูด) */
  const STRESS = { between: 'be-TWEEN', above: 'a-BOVE', under: 'UN-der' };

  /* ══════════ รายการเสียงทั้งหมด (สำหรับผลิตไฟล์พากย์) ══════════ */
  function clips() {
    const C = {};
    const add = (id, text, voice, pri) => { C[id] = { text, voice: voice || 'pip', pri: pri || 5 }; };
    Object.keys(PP.LINES).forEach(k => { const L = PP.LINES[k]; add('l_' + k, L[1], L[0] === 'w' ? 'whoosh' : 'pip', 1); });
    WORDS.forEach(w => add('w_' + w, w, 'pip', 1));
    ENTRIES.forEach(e => add(e.id, e.text, 'pip', 2));
    const dc = allDropCommands(); Object.keys(dc).forEach(id => add(id, dc[id], 'pip', 2));
    TIME.forEach(t => add(t.id, t.text, 'pip', 3));
    TSENT.forEach(t => add(t.id, t.text, 'pip', 3));
    METHOD.forEach(m => add(m.id, m.text, 'pip', 3));
    NOTES.forEach(n => add('note_' + n.id, n.text.replace(/\n/g, ' '), 'guest', 4));
    MAIL.forEach(m => add('mail_' + m.id, m.text, 'guest', 4));
    return C;
  }

  PP.D = { int, pick, shuffle, sample, ENTRIES, byPrep, entryOf, keyOf, CAN, canDo, plausible, pickSet, distractors, pickable, DROP, dropFrom, allDropCommands, TIME, TIMEBY, TSENT, METHOD, VEH, TOOL, NOTES, MAIL, WORDS, STRESS, clips };
})();
