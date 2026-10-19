/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ห้อง 4–6
   4 ปฏิทินพยากรณ์จันทร์ (ข้างขึ้น-ข้างแรม · ทำนายรูปร่าง) · 5 สวนระบบสุริยะ (องค์ประกอบ) · 6 สนามแข่งวงโคจร (คาบการโคจร · ภารกิจสุดท้าย)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK;
  const { art, ui, audio, W, GEN, STAGES } = SK;
  const { pick } = SK;
  const L = SK.lib;
  const { textOpt, moonOpt, planetOpt, taskChoice, tapOrder, rich, rchip } = L;
  const VT = id => (window.VOICED && window.VOICED[id]) || '';
  const U = (run, key) => (run.used[key] = run.used[key] || []);
  const showZone = (id, cap) => box => { box.innerHTML = '<div class="show-card">' + art.zoneArt(id) + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; };
  const hostOf = (el, cls) => el.querySelector('.' + cls);
  const QA = (r1, r2) => '<div class="qa"><div class="qa-q"><div class="w-host ' + r1 + '"></div></div>' + (r2 ? '<div class="qa-a"><div class="w-host ' + r2 + '"></div></div>' : '') + '</div>';
  const nameList = ids => ids.map(SK.plName).join(' → ');

  /* ฟิ้วฟิ้วอ้าง (เหมือนห้องก่อน ๆ) */
  function tClaim(stage, run, figFn, hintMid, fx3) {
    const c = GEN.claim(stage, U(run, 'claim' + stage));
    return taskChoice({
      skill: { 4: 'predict', 5: 'solar', 6: 'period' }[stage],
      title: 'ฟิ้วฟิ้วอ้างว่า... จริงหรือไม่จริง?',
      judSay: 'ฮิ ๆ ข้าขอบอกว่า “' + c.text + '” เชื่อข้าสิ!',
      say: 'อย่าเพิ่งเชื่อ! ดูจากแบบจำลอง แล้วตัดสินว่าจริงหรือไม่จริง!',
      story: 'ฟิ้วฟิ้วบอกว่า: **' + c.text + '**',
      cls: 'opts-yn', options: L.yn(), answer: c.truth, explain: c.why,
      wrongMsg: () => 'ลองดูจากแบบจำลองก่อนนะ',
      hints: ['อย่าเพิ่งเชื่อฟิ้วฟิ้ว ต้องดูหลักฐานก่อน!', hintMid, 'ดูจากแบบจำลองแล้วตัดสินใจ แล้วค่อยตอบ'],
      noDim: true, fig: figFn, fx3, answerText: c.truth ? 'จริง' : 'ไม่จริง'
    });
  }

  /* ═══════════════════════════════════════════════════════
     ห้อง 4 ปฏิทินพยากรณ์จันทร์
     ═══════════════════════════════════════════════════════ */
  function tCycleRing() {
    let ring = null;
    return {
      skill: 'predict', title: 'วางรูปร่างดวงจันทร์ลงวงปฏิทิน', say: VT('t4a'), sayClip: 't4a',
      render(el, api) {
        el.innerHTML = QA('ring-host');
        ring = W.cycleRing(hostOf(el, 'ring-host'), {
          prefill: [0, 4],
          onWrong(ci, si) { api.wrong('การ์ดนี้ยังไม่ใช่ช่องนี้ ลองดูว่าสว่างเพิ่มขึ้นหรือลดลง', ring.svg); },
          onDone() { api.correct('ครบ 1 รอบประมาณ 30 วัน · {c:wax}สว่างเพิ่มขึ้นทางขวา · {c:wane}สว่างลดลงทางซ้าย', el); }
        });
      },
      hint(l) {
        if (l === 3 && ring) { const c = ring.cards.find(x => x.isConnected); if (c) ring.place(+c.dataset.i); }
        return ['เริ่มที่จันทร์ดับ (บนสุด) แล้วเต็มดวง (ล่างสุด) สว่างเพิ่มขึ้นทางขวา', 'ฝั่งขวาคือ ข้างขึ้น สว่างเพิ่มขึ้นทีละนิด ฝั่งซ้ายคือ ข้างแรม สว่างลดลงทีละนิด', 'มูนมูนวางให้หนึ่งใบแล้ว ลองวางใบที่เหลือต่อเลย'][l - 1];
      },
      answer: 'วางตามลำดับ จันทร์ดับ → เสี้ยวข้างขึ้น → ครึ่งดวงข้างขึ้น → ค่อนดวงข้างขึ้น → เต็มดวง → ข้างแรมกลับไป',
      solve() { if (ring) for (let i = 0; i < 8; i++) { const c = ring.cards.find(x => +x.dataset.i === i && x.isConnected); if (c) ring.place(i); } }
    };
  }

  function tDayDial() {
    let dial = null, ch = null, asked = false, ask = null;
    const seen = {};
    return {
      skill: 'predict', title: 'เลื่อนวันดู: แสงสว่างเปลี่ยนอย่างไร?', say: VT('t4b'), sayClip: 't4b',
      render(el, api) {
        el.innerHTML = QA('dial-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('ตั้งแต่วันที่ 1 ถึงวันที่ 14 ดวงจันทร์สว่างเพิ่มหรือลด?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-words',
            options: [{ html: textOpt('สว่างเพิ่มขึ้น (ข้างขึ้น)'), value: 'wax' }, { html: textOpt('สว่างลดลง (ข้างแรม)'), value: 'wane' }],
            onPick(v, b) {
              if (v === 'wax') { b.classList.add('good'); ch.lock(); api.correct('วันที่ 1–14 คือ{c:wax} ส่วนสว่างเพิ่มขึ้นทางขวา จนเต็มดวงประมาณวันที่ 15', b); } else { ch.dim(b); api.wrong('เลื่อนวันดูอีกที จากจันทร์ดับไปเต็มดวง สว่างมากขึ้นไหม?', b); }
            }
          });
        };
        dial = W.dayDial(hostOf(el, 'dial-host'), { day: 0, onVisit(idx) { seen[idx] = true; if (Object.keys(seen).length >= 5) setTimeout(ask, 700); } });
      },
      hint(l) {
        if (l === 3 && dial) { dial.setDay(9); }
        return ['เลื่อนแถบวันที่ จาก 0 ไปทางขวาช้า ๆ ดูภาพดวงจันทร์', 'ดูซีกสว่างทางขวา มันใหญ่ขึ้นหรือเล็กลง', 'มูนมูนเลื่อนให้ดูแล้ว ซีกสว่างโตขึ้นเรื่อย ๆ'][l - 1];
      },
      answer: 'วันที่ 1–14 ดวงจันทร์สว่างเพิ่มขึ้น เรียกว่า ข้างขึ้น',
      solve() { if (dial) dial.setDay(9); if (ask) ask(); if (ch) ch.mark('wax', 'good'); }
    };
  }

  function bigMoon(idx, cap) { return '<div class="show-card"><div class="big-moon">' + art.moon(SK.epsOfIdx(idx), { glow: true }) + '</div>' + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; }

  function tPredict(level, run) {
    const q = GEN.predict(level, U(run, 'pred'));
    const steps = SK.stepOf(q.days);
    return taskChoice({
      skill: 'predict', title: 'ทำนาย: อีกประมาณ ' + q.days + ' วัน ดวงจันทร์จะเป็นแบบไหน?', say: 'วันนี้เห็น ' + SK.PHASES[q.from].n + ' อีกประมาณ ' + q.days + ' วัน จะเห็นแบบไหน?', cls: 'opts-3 opts-moon',
      options: q.options.map(i => ({ html: moonOpt(i, true), value: i })), answer: q.to,
      explain: 'จาก' + SK.PHASES[q.from].n + ' ผ่านไปประมาณ ' + q.days + ' วัน จะเป็น ' + SK.PHASES[q.to].long,
      wrongMsg: i => 'ภาพนั้นคือ ' + SK.PHASES[i].n + ' ลองนับต่อในวงปฏิทินอีกที',
      hints: ['รูปร่างเปลี่ยนไป 1 แบบ ทุก ๆ ประมาณ 4 วัน', 'นับต่อไปอีก ' + steps + ' ก้าว ตามวงปฏิทิน จากรูปร่างวันนี้', 'ดูวงปฏิทินที่มูนมูนเปิดให้ แล้วนับต่อไปอีก ' + steps + ' ก้าว'],
      fig: host => {
        host.innerHTML = '<div class="pred-fig"><div class="show-card"><div class="big-moon sm">' + art.moon(SK.epsOfIdx(q.from), { glow: true }) + '</div><p class="show-cap">วันนี้: ' + SK.PHASES[q.from].n + '</p></div>' +
          '<div class="pred-arrow">' + art.icon('right') + '<b>อีกประมาณ ' + q.days + ' วัน</b></div><div class="pred-q"><span>?</span></div></div>';
        return { showRing() { const rh = document.createElement('div'); rh.className = 'w-host'; host.appendChild(rh); W.cycleRing(rh, { prefill: [0, 1, 2, 3, 4, 5, 6, 7], names: false }); } };
      },
      fx3: b => { if (b && b.showRing) b.showRing(); },
      onRight: () => { if (SK.know) SK.know('moon', q.to); }
    });
  }

  function tPhaseOrder(level) {
    const o = GEN.phaseOrder(level);
    let ord = null;
    return {
      skill: 'predict', title: 'เรียงรูปร่างดวงจันทร์ตามวันที่ผ่านไป', say: 'แตะเรียงจากวันแรก ไปวันหลัง ตามลำดับในรอบเดือน!',
      render(el, api) {
        el.innerHTML = '<div class="w-host o-host"></div>';
        ord = tapOrder(el.querySelector('.o-host'), {
          ask: 'แตะเรียงตามเวลา: ก่อน → หลัง', cards: o.shuffled.map(i => ({ id: String(i), html: moonOpt(i, true) })),
          onComplete(order) {
            if (order.join() === o.seq.map(String).join()) api.correct('ลำดับถูกต้อง รูปร่างเปลี่ยนไปทีละน้อยตามแบบรูป: ' + o.seq.map(i => SK.PHASES[i].n).join(' → '), el);
            else { api.wrong('ยังไม่ถูกลำดับ นึกถึงวงปฏิทิน ตามเข็มนาฬิกาจากจันทร์ดับ', el.querySelector('.o-host')); setTimeout(() => ord.reset(), 700); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ord) { const c = ord.cards.find(x => x.dataset.id === String(o.seq[0])); if (c) c.classList.add('hl'); }
        return ['ดูซีกสว่างว่าเพิ่มขึ้นหรือลดลง', 'ข้างขึ้นสว่างทางขวาเพิ่มขึ้น เต็มดวงแล้วจึงลดลงทางซ้าย', 'ใบที่เรืองแสง คือใบแรกของลำดับนี้'][l - 1];
      },
      answer: o.seq.map(i => SK.PHASES[i].n).join(' → '),
      solve() { if (ord) ord.set(o.seq.map(String)); }
    };
  }

  function tWaxSide(level, run) {
    const q = GEN.waxSide(level, U(run, 'wax'));
    return taskChoice({
      skill: 'predict', title: 'ดวงจันทร์คืนนี้ เป็นข้างขึ้น หรือข้างแรม?', say: 'ดูซีกสว่าง แล้วบอกว่าเป็นข้างขึ้นหรือข้างแรม!', cls: 'opts-words',
      options: [{ html: textOpt('ข้างขึ้น', 'สว่างเพิ่มขึ้น'), value: 'wax' }, { html: textOpt('ข้างแรม', 'สว่างลดลง'), value: 'wane' }], answer: q.ans,
      explain: q.wax ? 'สว่างทางขวามือ แสงกำลังเพิ่มขึ้น เป็น{c:wax}' : 'สว่างทางซ้ายมือ แสงกำลังลดลง เป็น{c:wane}',
      wrongMsg: () => 'ดูว่าซีกสว่างอยู่ด้านขวาหรือซ้ายของภาพ', hints: ['ข้างขึ้น = สว่างทางขวามือ (มองจากประเทศไทย)', 'ข้างแรม = สว่างทางซ้ายมือ', 'ดูภาพอีกที ซีกสว่างอยู่ด้านไหน'],
      fig: host => { host.innerHTML = bigMoon(q.idx, 'ดวงจันทร์คืนนี้'); }
    });
  }

  function tDayShape(level, run) {
    const q = GEN.dayShape(level, U(run, 'day'));
    return taskChoice({
      skill: 'predict', title: 'วันที่ ' + q.day + ' ของรอบเดือน ดวงจันทร์เป็นแบบไหน?', say: 'วันที่ ' + q.day + ' ของรอบเดือน เห็นดวงจันทร์แบบไหนนะ?', cls: 'opts-3 opts-moon',
      options: q.options.map(i => ({ html: moonOpt(i, true), value: i })), answer: q.idx,
      explain: 'วันที่ ' + q.day + ' ของรอบเดือน เห็น ' + SK.PHASES[q.idx].long,
      wrongMsg: i => 'ภาพนั้นคือ ' + SK.PHASES[i].n,
      hints: ['วันที่ 0 คือจันทร์ดับ วันที่ 15 คือเต็มดวง', 'ครึ่งดวงข้างขึ้นประมาณวันที่ 7 ครึ่งดวงข้างแรมประมาณวันที่ 22', 'ลองเลื่อนวันดูในหน้าต่างช่วยดู'],
      fig: host => W.dayDial(host, { day: 0, showName: false }),
      onRight: () => { if (SK.know) SK.know('moon', q.idx); }
    });
  }

  STAGES.push({
    id: 4, name: 'ปฏิทินพยากรณ์จันทร์', topic: 'แบบรูปข้างขึ้นข้างแรม', color: '#3ccf9a', skill: 'predict',
    intro: [
      { who: 'mat', mood: 'wow', v: 's4a', text: VT('s4a'), show: showZone(4, 'ปฏิทินพยากรณ์จันทร์') },
      { who: 'tub', mood: 'laugh', v: 's4b', text: VT('s4b') },
      { who: 'mat', mood: 'think', v: 's4c', text: VT('s4c') },
      { who: 'mat', mood: 'cheer', v: 's4d', text: VT('s4d'), last: 'ลุยเลย!' }
    ],
    learn: [tCycleRing, tDayDial],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tPredict(level, run);
      if (i === 1) return level === 1 ? tDayShape(level, run) : level === 2 ? tWaxSide(level, run) : tPhaseOrder(level);
      return Math.random() < 0.5 ? tPredict(level, run) : tClaim(4, run, host => W.dayDial(host, { day: 3, showName: true }), 'เลื่อนวันดูในแบบจำลอง ดูว่าสว่างเพิ่มหรือลด');
    },
    recap: [
      'รูปร่างปรากฏของดวงจันทร์เปลี่ยนเป็นแบบรูป ครบ 1 รอบประมาณ 30 วัน',
      '{c:wax}: ส่วนสว่างเพิ่มขึ้นทีละวัน ประมาณ 15 วัน จนเต็มดวง',
      '{c:wane}: ส่วนสว่างลดลงทีละวัน ประมาณ 15 วัน จนถึงจันทร์ดับ แล้วเริ่มรอบใหม่',
      'ใช้แบบรูป ทำนายรูปร่างของดวงจันทร์ในวันข้างหน้าได้'
    ],
    teacher: [
      'ให้นักเรียนทำปฏิทินดวงจันทร์ 1 เดือนจากการสังเกตจริง แล้วทดสอบว่าแบบรูปตรงกับที่เรียนหรือไม่',
      'จันทร์เสี้ยวหลังตะวันตกดิน อยู่ข้างขึ้นหรือข้างแรม? (ชวนใช้ซีกสว่างทางขวา-ซ้ายตัดสิน)'
    ],
    book: [
      'ดวงจันทร์เปลี่ยนรูปร่างปรากฏเป็นวัฏจักร **ครบรอบประมาณ 30 วัน**',
      '**ข้างขึ้น** ประมาณ 15 วัน สว่างเพิ่มขึ้นทางขวามือ (มองจากประเทศไทย) จนเต็มดวง',
      '**ข้างแรม** ประมาณ 15 วัน สว่างลดลงทางซ้ายมือ จนเหลือจันทร์ดับ',
      'รูปร่างทั้ง 8 แบบ: จันทร์ดับ · เสี้ยวข้างขึ้น · ครึ่งดวงข้างขึ้น · ค่อนดวงข้างขึ้น · เต็มดวง · ค่อนดวงข้างแรม · ครึ่งดวงข้างแรม · เสี้ยวข้างแรม'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     ห้อง 5 สวนระบบสุริยะ
     ═══════════════════════════════════════════════════════ */
  function tBuildSolar() {
    const ids = SK.PL.map(p => p.id);
    let bd = null;
    return {
      skill: 'solar', title: 'สร้างแบบจำลองระบบสุริยะ', say: VT('t5a'), sayClip: 't5a',
      render(el, api) {
        el.innerHTML = QA('ob-host');
        bd = W.orbitBuilder(hostOf(el, 'ob-host'), {
          ids,
          onWrong(id, k) { api.wrong(SK.plName(id) + ' ยังไม่ใช่วงที่ ' + (k + 1) + ' ลองนึกว่าดวงไหนใกล้ดวงอาทิตย์กว่า', bd.svg); },
          onDone() { api.correct('ดวงอาทิตย์อยู่ตรงกลาง ดาวเคราะห์ 8 ดวงเรียงจากใกล้ไปไกล: ' + nameList(ids), el); }
        });
      },
      hint(l) {
        if (l === 3 && bd) { const next = ids.find(id => bd.cards.some(c => c.dataset.id === id && c.isConnected)); if (next) bd.place(next); }
        return ['ดวงที่ใกล้ดวงอาทิตย์ที่สุดคือดาวพุธ', 'ลำดับคือ ' + nameList(ids), 'มูนมูนวางให้หนึ่งดวงแล้ว ลองวางต่อเลย'][l - 1];
      },
      answer: 'ลำดับ: ' + nameList(ids),
      solve() { if (bd) ids.forEach(id => bd.place(id)); }
    };
  }

  function tSolarParts() {
    const items = [
      { id: 'sun', html: '<b>ดวงอาทิตย์</b>', short: 'ดวงอาทิตย์', bin: 'star' },
      { id: 'earth', html: '<b>โลก</b>', short: 'โลก', bin: 'planet' },
      { id: 'mars', html: '<b>ดาวอังคาร</b>', short: 'ดาวอังคาร', bin: 'planet' },
      { id: 'saturn', html: '<b>ดาวเสาร์</b>', short: 'ดาวเสาร์', bin: 'planet' },
      { id: 'moon', html: '<b>ดวงจันทร์</b>', short: 'ดวงจันทร์', bin: 'moon' }
    ];
    let sorter = null;
    return {
      skill: 'solar', title: 'จัดกลุ่มสมาชิกของระบบสุริยะ', say: VT('t5b'), sayClip: 't5b',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: SK.shuffle(items),
          bins: [
            { id: 'star', label: 'ดาวฤกษ์', note: 'ให้แสงสว่างในตัวเอง', icon: 'sun', color: '#ffb21f' },
            { id: 'planet', label: 'ดาวเคราะห์', note: 'โคจรรอบดวงอาทิตย์', icon: 'orbit', color: '#4aa8ff' },
            { id: 'moon', label: 'ดาวบริวาร', note: 'โคจรรอบดาวเคราะห์', icon: 'moon', color: '#b9a6ff' }
          ],
          answer: it => it.bin,
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่กลุ่มนี้ ลองนึกว่าโคจรรอบอะไร', card),
          onDone: () => api.correct('ดวงอาทิตย์เป็น{c:star} · โลก ดาวอังคาร ดาวเสาร์เป็น{c:planet} · ดวงจันทร์โคจรรอบโลก เป็นดาวบริวารของโลก', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) { const it = items.find(x => sorter.cardOf(x.id)); if (it) sorter.place(it.id, it.bin); }
        return ['ดวงอาทิตย์ให้แสงสว่างเอง ส่วนดาวเคราะห์ไม่ได้ให้แสงเอง', 'ดาวเคราะห์โคจรรอบดวงอาทิตย์ ดวงจันทร์โคจรรอบโลก', 'มูนมูนวางให้หนึ่งใบแล้ว ลองต่อเลย'][l - 1];
      },
      answer: 'ดวงอาทิตย์ = ดาวฤกษ์ · โลก ดาวอังคาร ดาวเสาร์ = ดาวเคราะห์ · ดวงจันทร์ = ดาวบริวาร',
      solve() { items.forEach(it => { try { sorter.place(it.id, it.bin); } catch (e) { /* ข้าม */ } }); }
    };
  }

  function tNth(level, run) {
    const useBetween = level >= 2 && Math.random() < (level === 3 ? 0.7 : 0.4);
    if (useBetween) {
      const q = GEN.between(level, U(run, 'btw'));
      return taskChoice({
        skill: 'solar', title: 'ดวงไหนอยู่ระหว่าง ' + SK.plName(q.a) + ' กับ ' + SK.plName(q.b) + '?', say: 'ดาวเคราะห์ดวงไหนอยู่ระหว่าง ' + SK.plName(q.a) + ' กับ ' + SK.plName(q.b) + '?', cls: 'opts-3 opts-planet',
        options: q.options.map(id => ({ html: planetOpt(id), value: id })), answer: q.id, explain: SK.plName(q.id) + 'อยู่ระหว่าง ' + SK.plName(q.a) + ' กับ ' + SK.plName(q.b),
        wrongMsg: id => SK.plName(id) + 'ไม่ได้อยู่ระหว่างสองดวงนี้', hints: ['ดูลำดับจากดวงอาทิตย์ออกไป', 'ลำดับ: ' + nameList(SK.PL.map(p => p.id)), 'ดูวงโคจรที่เรืองแสงในแผนผัง'],
        fig: host => W.orbitMap(host, { ids: SK.PL.map(p => p.id), highlight: [q.id], names: true, nameHl: true, pulse: false }),
        onRight: () => { if (SK.know) SK.know('planet', q.id); }
      });
    }
    const q = GEN.nth(level, U(run, 'nth'));
    return taskChoice({
      skill: 'solar', title: 'วงที่เรืองแสงเป็นของดาวเคราะห์ดวงไหน?', say: 'วงโคจรที่เรืองแสงเป็นของดาวเคราะห์ดวงไหนนะ?', cls: 'opts-3 opts-planet',
      options: q.options.map(id => ({ html: planetOpt(id), value: id })), answer: q.id, explain: SK.plName(q.id) + ' เป็นดวงที่ ' + (q.rank + 1) + ' นับจากดวงอาทิตย์',
      wrongMsg: id => SK.plName(id) + 'อยู่ลำดับที่ ' + (SK.PLID[id].rank + 1) + ' ไม่ใช่วงนี้', hints: ['นับวงจากดวงอาทิตย์ออกไป วงเรืองแสงเป็นวงที่เท่าไร', 'ลำดับ: ' + nameList(SK.PL.map(p => p.id)), 'ตัดตัวเลือกที่อยู่ผิดลำดับออกก่อน'],
      fig: host => W.orbitMap(host, { ids: SK.PL.map(p => p.id), highlight: [q.id], names: false, pulse: true }),
      onRight: () => { if (SK.know) SK.know('planet', q.id); }
    });
  }

  function tPlanetOrder(level) {
    const o = GEN.planetsSorted(level);
    let ord = null;
    return {
      skill: 'solar', title: 'เรียงดาวเคราะห์จากใกล้ → ไกลดวงอาทิตย์', say: 'แตะเรียงจากดวงที่ใกล้ดวงอาทิตย์ที่สุด ไปไกลที่สุด!',
      render(el, api) {
        el.innerHTML = '<div class="w-host o-host"></div>';
        ord = tapOrder(el.querySelector('.o-host'), {
          ask: 'แตะเรียง: ใกล้ดวงอาทิตย์ → ไกล', cards: o.shuffled.map(id => ({ id, html: planetOpt(id) })),
          onComplete(order) {
            if (order.join() === o.ids.join()) { o.ids.forEach(id => SK.know && SK.know('planet', id)); api.correct('ถูกต้อง! ' + nameList(o.ids), el); } else { api.wrong('ลำดับยังไม่ถูก ดวงที่ใกล้ดวงอาทิตย์ที่สุดคือดาวพุธ', el.querySelector('.o-host')); setTimeout(() => ord.reset(), 700); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ord) { const c = ord.cards.find(x => x.dataset.id === o.ids[0]); if (c) c.classList.add('hl'); }
        return ['นึกถึงลำดับ พุธ ศุกร์ โลก อังคาร ...', 'ลำดับเต็ม: ' + nameList(SK.PL.map(p => p.id)), 'ใบที่เรืองแสง คือดวงที่ใกล้ดวงอาทิตย์ที่สุดในชุดนี้'][l - 1];
      },
      answer: nameList(o.ids), solve() { if (ord) ord.set(o.ids); }
    };
  }

  function tNearFar() {
    const o = GEN.nearFar(3);
    let sorter = null;
    return {
      skill: 'solar', title: 'ใกล้หรือไกลกว่าโลก?', say: 'จัดดาวเคราะห์ว่าอยู่ใกล้หรือไกลดวงอาทิตย์กว่าโลก!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: o.items.map(id => ({ id, html: '<b>' + SK.plName(id) + '</b>', short: SK.plName(id).replace('ดาว', '') })),
          bins: [{ id: 'near', label: 'ใกล้ดวงอาทิตย์กว่าโลก', icon: 'sun', color: '#ff8a3c' }, { id: 'far', label: 'ไกลดวงอาทิตย์กว่าโลก', icon: 'orbit', color: '#4aa8ff' }],
          answer: it => o.ans(it.id),
          onWrong: (it, b, card) => api.wrong(SK.plName(it.id) + 'ยังไม่ใช่กลุ่มนี้ ลองนึกลำดับจากดวงอาทิตย์', card),
          onDone: () => api.correct('ดาวพุธกับดาวศุกร์อยู่ใกล้ดวงอาทิตย์กว่าโลก ส่วนดาวอังคารเป็นต้นไปอยู่ไกลกว่า', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) { const id = o.items.find(x => sorter.cardOf(x)); if (id) sorter.place(id, o.ans(id)); }
        return ['โลกเป็นดวงที่ 3 นับจากดวงอาทิตย์', 'ก่อนโลกมี 2 ดวง คือดาวพุธกับดาวศุกร์', 'มูนมูนวางให้หนึ่งใบแล้ว ลองต่อเลย'][l - 1];
      },
      answer: 'พุธ ศุกร์ = ใกล้กว่าโลก · ที่เหลือ = ไกลกว่าโลก',
      solve() { o.items.forEach(id => { try { sorter.place(id, o.ans(id)); } catch (e) { /* ข้าม */ } }); }
    };
  }

  STAGES.push({
    id: 5, name: 'สวนระบบสุริยะ', topic: 'องค์ประกอบของระบบสุริยะ', color: '#4aa8ff', skill: 'solar',
    intro: [
      { who: 'mat', mood: 'wow', v: 's5a', text: VT('s5a'), show: showZone(5, 'สวนระบบสุริยะ') },
      { who: 'tub', mood: 'laugh', v: 's5b', text: VT('s5b') },
      { who: 'mat', mood: 'think', v: 's5c', text: VT('s5c') },
      { who: 'mat', mood: 'cheer', v: 's5d', text: VT('s5d'), last: 'ลุยเลย!' }
    ],
    learn: [tBuildSolar, tSolarParts],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tNth(level, run);
      if (i === 1) return level >= 3 ? tNearFar() : tPlanetOrder(level);
      return tClaim(5, run, host => W.orbitMap(host, { ids: SK.PL.map(p => p.id), names: true }), 'ดูแผนผังระบบสุริยะ นับวงจากดวงอาทิตย์ออกไป');
    },
    recap: [
      'ระบบสุริยะมีดวงอาทิตย์เป็น{c:star}อยู่ตรงกลาง และมี{c:planet} 8 ดวงโคจรรอบ',
      'ลำดับจากใกล้ไปไกล: ' + nameList(SK.PL.map(p => p.id)),
      'ดวงจันทร์เป็นดาวบริวารของโลก โคจรรอบโลก',
      'แบบจำลองระบบสุริยะ ใช้ดูลำดับและการเคลื่อนที่ (ขนาดและระยะในภาพไม่ใช่ของจริง)'
    ],
    teacher: [
      'ให้นักเรียนทำแบบจำลองระบบสุริยะด้วยวัสดุรอบตัว แล้วอธิบายว่าอะไรในแบบจำลองต่างจากของจริง (ขนาด ระยะ)',
      'ทำไมแบบจำลองจึงยังมีประโยชน์ แม้ไม่ใช่สัดส่วนจริง? (ชวนคิดเรื่องข้อดี-ข้อจำกัดของแบบจำลอง)'
    ],
    book: [
      '**ดวงอาทิตย์** เป็นดาวฤกษ์อยู่ตรงกลาง ให้แสงและความร้อน',
      '**ดาวเคราะห์ 8 ดวง** โคจรรอบดวงอาทิตย์ เรียงจากใกล้ไปไกล: ' + nameList(SK.PL.map(p => p.id)),
      'ดาวเคราะห์บางดวงมีดาวบริวาร เช่น ดวงจันทร์เป็นดาวบริวารของโลก',
      'ในระบบสุริยะยังมีวัตถุอื่น เช่น ดาวเคราะห์แคระ ดาวเคราะห์น้อย และดาวหาง'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     ห้อง 6 สนามแข่งวงโคจร : คาบการโคจร + ภารกิจสุดท้าย
     ═══════════════════════════════════════════════════════ */
  function tRaceInner() {
    const ids = ['mercury', 'venus', 'earth', 'mars'];
    let race = null, ch = null, asked = false, ask = null;
    return {
      skill: 'period', title: 'ปล่อยเวลาเดิน 1 ปีของโลก ใครครบรอบก่อน?', say: VT('t6a'), sayClip: 't6a',
      render(el, api) {
        el.innerHTML = QA('race-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('ในเวลา 1 ปีของโลก ดาวดวงไหนโคจรได้หลายรอบที่สุด?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-3 opts-planet',
            options: ['mars', 'mercury', 'venus'].map(id => ({ html: planetOpt(id), value: id })),
            onPick(v, b) {
              if (v === 'mercury') { b.classList.add('good'); ch.lock(); api.correct('ดาวพุธอยู่ใกล้ดวงอาทิตย์ที่สุด โคจรครบรอบเร็วที่สุด ได้มากกว่า 4 รอบใน 1 ปีของโลก', b); } else { ch.dim(b); api.wrong('ดูตัวเลขรอบที่ขึ้นข้างล่าง ดวงไหนมากที่สุด', b); }
            }
          });
        };
        race = W.orbitRace(hostOf(el, 'race-host'), { ids, spanYears: 1, unit: 'day', ms: 8000, onEnd: ask });
      },
      hint(l) {
        if (l === 3 && race) race.runToEnd();
        return ['กดปล่อยเวลาเดิน แล้วดูตัวเลขรอบของแต่ละดวง', 'ดวงที่ใกล้ดวงอาทิตย์วิ่งครบรอบได้เร็วกว่า', 'มูนมูนเดินเวลาให้แล้ว ดูรอบของดาวพุธสิ'][l - 1];
      },
      answer: 'ดาวพุธโคจรได้มากกว่า 4 รอบ ใน 1 ปีของโลก',
      solve() { if (race) race.runToEnd(); if (ask) ask(); if (ch) ch.mark('mercury', 'good'); }
    };
  }

  function tPeriodPattern() {
    const ids = SK.PL.map(p => p.id);
    let ch = null;
    return {
      skill: 'period', title: 'หาแบบรูปจากตารางคาบการโคจร', say: VT('t6b'), sayClip: 't6b',
      render(el, api) {
        el.innerHTML = QA('pt-host', 'ch-host');
        W.periodTable(hostOf(el, 'pt-host'), { ids });
        ch = W.choice(hostOf(el, 'ch-host'), {
          cls: 'opts-words',
          options: [{ html: textOpt('ยิ่งไกลดวงอาทิตย์ ยิ่งใช้เวลาโคจรนานขึ้น'), value: 'longer' }, { html: textOpt('ยิ่งไกลดวงอาทิตย์ ยิ่งใช้เวลาโคจรสั้นลง'), value: 'shorter' }, { html: textOpt('ทุกดวงใช้เวลาเท่ากัน'), value: 'same' }],
          onPick(v, b) {
            if (v === 'longer') { b.classList.add('good'); ch.lock(); api.correct('ดาวเคราะห์ที่อยู่ไกลดวงอาทิตย์กว่า มี{c:period}นานกว่า', b); } else { ch.dim(b); api.wrong('เทียบแท่งของดาวพุธกับดาวเนปจูนดูสิ', b); }
          }
        });
      },
      hint(l) { return ['ดูแท่งจากบนลงล่าง ดาวพุธอยู่ใกล้ ดาวเนปจูนอยู่ไกล', 'แท่งยาวขึ้นหรือสั้นลง เมื่อไปไกลดวงอาทิตย์', 'ดวงที่ไกลที่สุดมีแท่งยาวที่สุด'][l - 1]; },
      answer: 'ยิ่งไกลดวงอาทิตย์ ยิ่งใช้เวลาโคจรนานขึ้น',
      solve() { if (ch) ch.mark('longer', 'good'); }
    };
  }

  function tLonger(level, run) {
    const q = GEN.longer(level, U(run, 'lng'));
    const asked = q.mode === 'longer' ? 'นานกว่า' : 'สั้นกว่า';
    return taskChoice({
      skill: 'period', title: 'ดวงไหนมีคาบการโคจร' + asked + '?', say: SK.plName(q.a) + 'กับ' + SK.plName(q.b) + ' ดวงไหนมีคาบการโคจร' + asked + 'นะ?', cls: 'opts-2 opts-planet',
      options: SK.shuffle([q.a, q.b]).map(id => ({ html: planetOpt(id), value: id })), answer: q.answer,
      explain: SK.plName(q.answer) + 'อยู่' + (q.mode === 'longer' ? 'ไกล' : 'ใกล้') + 'ดวงอาทิตย์กว่า จึงมีคาบการโคจร' + asked,
      wrongMsg: id => SK.plName(id) + 'ไม่ใช่ ลองดูว่าดวงไหนอยู่ไกลดวงอาทิตย์กว่า',
      hints: ['ดูว่าดวงไหนอยู่ไกลดวงอาทิตย์กว่า', 'ไกลกว่า = ใช้เวลาโคจรครบ 1 รอบนานกว่า', 'ดูแท่งในตารางที่มูนมูนเปิดให้'],
      fig: host => W.orbitMap(host, { ids: SK.PL.map(p => p.id), highlight: [q.a, q.b], names: false, nameHl: true }),
      fx3: (b, t) => { const h = document.querySelector('.qa-q'); if (h && !h.querySelector('.ptable')) { const d = document.createElement('div'); d.className = 'w-host'; h.appendChild(d); W.periodTable(d, { ids: [q.a, q.b] }); } },
      onRight: () => { if (SK.know) { SK.know('planet', q.a); SK.know('planet', q.b); } }
    });
  }

  function tPeriodQ(level, run) {
    if (level === 3 && Math.random() < 0.5) {
      const q = GEN.laps(U(run, 'lap'));
      const all = [q.ans].concat(q.wrongs);
      return taskChoice({
        skill: 'period', title: q.ask, say: q.ask, cls: 'opts-3',
        options: SK.shuffle(all).map(v => ({ html: textOpt(typeof v === 'number' ? v + ' รอบ' : v), value: v })), answer: q.ans, explain: q.why, hints: q.hints,
        fig: host => W.periodTable(host, { ids: ['mercury', 'earth', 'jupiter', 'neptune'] })
      });
    }
    const q = GEN.periodTable(level, U(run, 'ptab'));
    return taskChoice({
      skill: 'period', title: q.ask, say: q.ask, cls: 'opts-3 opts-planet',
      options: q.options.map(id => ({ html: planetOpt(id), value: id })), answer: q.answer,
      explain: SK.plName(q.answer) + ' (' + SK.PLID[q.answer].per + ') ตรงกับที่ถามในตาราง',
      wrongMsg: id => SK.plName(id) + ' คือ ' + SK.PLID[id].per + ' ลองเทียบในตารางอีกที',
      hints: ['อ่านค่าในตารางของแต่ละดวง', 'คาบการโคจร = เวลาที่โคจรครบ 1 รอบ ปีโลก = 365 วัน', 'เทียบแท่งที่ยาวที่สุดและสั้นที่สุด'],
      fig: host => W.periodTable(host, { ids: q.ids })
    });
  }

  /* ภารกิจสุดท้าย : ฟิ้วฟิ้วสลับชื่อดาว เหลือแต่ตัวเลขคาบ ให้จัดวงโคจรตามคาบ */
  function tFinalOrbit(level) {
    const n = level === 1 ? 4 : level === 2 ? 6 : 8;
    const pool = n === 8 ? SK.PL.slice() : SK.sample(SK.PL, n).sort((a, b) => a.rank - b.rank);
    const ids = pool.map(p => p.id);
    let bd = null;
    return {
      skill: 'period', title: 'ภารกิจสุดท้าย: จัดวงโคจรตามคาบ', say: 'ฟิ้วฟิ้วลบชื่อดาวหมดแล้ว! ดูคาบการโคจร แล้ววางลงวงที่ใช่!',
      judSay: 'ฮิ ๆ ข้าลบชื่อดาวเคราะห์หมดแล้ว ไม่มีใครรู้หรอกว่าดวงไหนอยู่วงไหน!',
      render(el, api) {
        el.innerHTML = QA('ob-host');
        bd = W.orbitBuilder(hostOf(el, 'ob-host'), {
          ids, hideName: true, showPeriod: true,
          onWrong(id, k) { api.wrong('คาบการโคจรขนาดนี้ ยังไม่ใช่วงที่ ' + (k + 1) + ' ยิ่งคาบนานต้องยิ่งไกล', bd.svg); },
          onDone() { api.correct('คาบสั้น = ใกล้ดวงอาทิตย์ · คาบยาว = ไกลดวงอาทิตย์ ได้ลำดับ: ' + nameList(ids), el); }
        });
      },
      hint(l) {
        if (l === 3 && bd) { const next = ids.find(id => bd.cards.some(c => c.dataset.id === id && c.isConnected)); if (next) bd.place(next); }
        return ['ดูตัวเลขคาบของแต่ละดวง คาบสั้นที่สุดอยู่วงในสุด', 'เรียงคาบจากน้อยไปมาก ก็คือเรียงจากใกล้ไปไกล', 'มูนมูนวางให้หนึ่งดวงแล้ว ลองต่อเลย'][l - 1];
      },
      answer: 'เรียงตามคาบจากสั้นไปยาว: ' + nameList(ids),
      solve() { if (bd) ids.forEach(id => bd.place(id)); }
    };
  }

  STAGES.push({
    id: 6, name: 'สนามแข่งวงโคจร', topic: 'คาบการโคจรของดาวเคราะห์', color: '#b36bff', skill: 'period', final: true,
    intro: [
      { who: 'mat', mood: 'wow', v: 's6a', text: VT('s6a'), show: showZone(6, 'สนามแข่งวงโคจร') },
      { who: 'tub', mood: 'laugh', v: 's6b', text: VT('s6b') },
      { who: 'mat', mood: 'think', v: 's6c', text: VT('s6c') },
      { who: 'mat', mood: 'cheer', v: 's6d', text: VT('s6d'), last: 'ลุยเลย!' }
    ],
    learn: [tRaceInner, tPeriodPattern],
    missions: 4,
    gen(level, i, run) {
      if (i === 0) return tLonger(level, run);
      if (i === 1) return tPeriodQ(level, run);
      if (i === 2) return tClaim(6, run, host => W.periodTable(host, { ids: SK.PL.map(p => p.id) }), 'ดูตารางคาบการโคจร ดาวพุธอยู่บนสุด ดาวเนปจูนอยู่ล่างสุด');
      return tFinalOrbit(level);
    },
    recap: [
      '{c:period} คือ เวลาที่ดาวเคราะห์โคจรรอบดวงอาทิตย์ครบ 1 รอบ',
      'โลกใช้ประมาณ 365 วัน (1 ปี) · ดาวพุธประมาณ 88 วัน · ดาวเนปจูนประมาณ 165 ปี',
      'ดาวเคราะห์ที่อยู่ไกลดวงอาทิตย์กว่า มี{c:period}นานกว่า'
    ],
    teacher: [
      'ให้นักเรียนอธิบายด้วยแบบจำลองในเกม ว่าทำไมดาวพุธครบรอบเร็วกว่าดาวเสาร์ (ใช้ได้ทั้งเรื่องระยะทางวงโคจรและความเร็ว)',
      'ถ้าอาศัยอยู่บนดาวพฤหัสบดี 1 ปีของดาวนั้น เท่ากับกี่ปีของโลก? (ประมาณ 12 ปี)'
    ],
    book: [
      '**คาบการโคจร** คือเวลาที่ดาวเคราะห์โคจรรอบดวงอาทิตย์ครบ 1 รอบ',
      'ตัวเลขโดยประมาณ: ดาวพุธ 88 วัน · ดาวศุกร์ 225 วัน · โลก 365 วัน · ดาวอังคาร 687 วัน · ดาวพฤหัสบดี 12 ปี · ดาวเสาร์ 29 ปี · ดาวยูเรนัส 84 ปี · ดาวเนปจูน 165 ปี',
      'แบบรูป: **ยิ่งไกลดวงอาทิตย์ ยิ่งใช้เวลาโคจรครบรอบนานขึ้น**'
    ],
    outro: [
      { who: 'mat', mood: 'cheer', v: 'o1', text: VT('o1') },
      { who: 'tub', mood: 'happy', v: 'o2', text: VT('o2') },
      { who: 'mat', mood: 'happy', v: 'o3', text: VT('o3') },
      { who: 'mat', mood: 'cheer', v: 'o4', text: VT('o4'), last: 'เก่งที่สุด!' }
    ]
  });
})();
