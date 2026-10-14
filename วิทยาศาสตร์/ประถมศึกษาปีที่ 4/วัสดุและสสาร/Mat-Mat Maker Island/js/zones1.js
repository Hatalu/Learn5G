/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — พื้นที่ 1–3
   1 เหมืองแข็งแรง (ความแข็ง) · 2 โรงงานยางเด้ง (สภาพยืดหยุ่น) · 3 ครัวร้อนฉ่า (การนำความร้อน)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, ui, audio, W, GEN, POOL } = MM;
  const { pick, shuffle, sample } = MM;
  const L = MM.lib;
  const { itemOpt, yn, taskChoice, tapOrder, praise, rich, rchip, storyP } = L;
  const nm = MM.nm;

  const STAGES = MM.STAGES = MM.STAGES || [];

  /* ── ฉากนำเสนอ ── */
  const showZone = (id, cap) => box => { box.innerHTML = '<div class="show-card">' + art.zoneArt(id) + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; };
  const showItems = (ids, cap) => box => {
    box.innerHTML = '<div class="show-card"><div class="show-row">' + ids.map(id => '<span class="show-it">' + art.item(id) + '<b>' + nm(id) + '</b></span>').join('') + '</div>' + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>';
  };
  const showHtml = (html, cap) => box => { box.innerHTML = '<div class="show-card">' + html + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; };
  const used = run => (run.used = run.used || { pairs: [], use: [], claim: [], kinds: [] });
  const host = (el, cls) => { el.insertAdjacentHTML('beforeend', '<div class="w-host ' + (cls || '') + '"></div>'); return el.lastElementChild; };

  /* คำใบ้ทั่วไปของการเลือกใช้วัสดุ แยกตามเรื่อง */
  const USE_HINT = {
    1: ['คิดดูว่า งานนี้ต้องใช้วัสดุที่ {c:hard} หรือ {c:soft}', 'ของที่ต้องทนแรงกระแทกต้องแข็ง ของที่ต้องนุ่มสบายต้องนิ่ม'],
    2: ['คิดดูว่า งานนี้ต้องการวัสดุที่ปล่อยแล้วกลับเหมือนเดิมไหม', 'ถ้าต้องการให้เด้ง ให้ดีด ให้รัด ต้องใช้วัสดุ {c:elastic}'],
    3: ['คิดดูว่า งานนี้อยากให้ความร้อนผ่านเร็ว หรือผ่านช้า', 'ส่วนที่ต้องร้อนเร็วใช้ {c:heatY} ส่วนที่มือจับต้องใช้ {c:heatN}'],
    4: ['คิดดูว่า งานนี้ต้องการให้ไฟฟ้าผ่านได้ หรือผ่านไม่ได้', 'ส่วนที่ไฟต้องวิ่งผ่านใช้ {c:elecY} ส่วนที่ต้องปลอดภัยใช้ {c:elecN}']
  };
  const PROP_OF = {
    1: id => MM.hardGroup(id) === 'hard', 2: id => MM.isElastic(id), 3: id => MM.heatGood(id), 4: id => MM.isConductor(id)
  };
  const PROP_KEY = { 1: 'hard', 2: 'elastic', 3: 'heat', 4: 'elec' };


  /* แผงทดสอบ: ปุ่มทดสอบใต้วัสดุแต่ละอัน กดแล้วเห็นการทดลองจริง */
  const LAB_KIND = { 1: 'press', 2: 'elastic', 3: 'heat', 4: 'elec' };
  const LAB_EV = {
    1: id => MM.hardGroup(id) === 'hard' ? rchip('กดไม่บุ๋ม', 'ok') : rchip('กดแล้วบุ๋ม', 'warn'),
    2: id => MM.isElastic(id) ? rchip('ปล่อยแล้วกลับเหมือนเดิม', 'ok') : rchip('ค้างอยู่ / ไม่เปลี่ยนรูป', 'warn'),
    3: id => MM.heatGood(id) ? rchip('เนยละลายเร็ว', 'ok') : rchip('เนยยังไม่ละลาย', 'warn'),
    4: id => MM.isConductor(id) ? rchip('ไฟติด', 'ok') : rchip('ไฟไม่ติด', 'warn')
  };
  function labPanel(q, zone, ids, onTest) {
    q.innerHTML = '<div class="lab-panel"><p class="lab-ask">ทดสอบวัสดุแต่ละอันก่อนเลือก</p><div class="lab-row">' + ids.map(id =>
      '<div class="lab-it" data-id="' + id + '">' + art.item(id) + '<b>' + nm(id) + '</b><div class="lab-ev"></div><button class="scard-test">' + art.icon('magnify') + '<span>ทดสอบ</span></button></div>').join('') + '</div></div>';
    q.querySelectorAll('.lab-it').forEach(c => c.querySelector('.scard-test').addEventListener('click', () => {
      const id = c.dataset.id;
      MM.W.miniLab(LAB_KIND[zone], id, { caption: LAB_EV[zone](id) }).then(() => {
        c.querySelector('.lab-ev').innerHTML = LAB_EV[zone](id); c.classList.add('tested');
        if (MM.know) { const p = { 1: 'hard', 2: 'elastic', 3: 'heat', 4: 'elec' }[zone]; MM.know(MM.ITEM[id].mat, p); }
        if (onTest) onTest(id);
      });
    }));
    return { testAll() { q.querySelectorAll('.lab-it .scard-test').forEach(b => b.click()); } };
  }

  /* ────────── ภารกิจเลือกวัสดุไปใช้งาน (ใช้ร่วมกันทุกเรื่อง 1–4) ────────── */
  function tUse(zone, level, run) {
    const u = used(run);
    const q = GEN.useQ(zone, level, u.use);
    u.use.push(q.key);
    return taskChoice({
      skill: 'apply',
      title: 'เลือกวัสดุ: ' + q.ask,
      say: q.ask + ' ควรใช้วัสดุอะไรดี?',
      cls: 'opts-3',
      options: q.options.map(id => ({ html: itemOpt(id), value: id })),
      answer: q.answer,
      explain: q.why,
      wrongMsg: id => nm(id) + 'ยังไม่เหมาะกับงานนี้',
      hints: [USE_HINT[zone][0], USE_HINT[zone][1], 'ดูป้ายคุณสมบัติบนการ์ดนะ แล้วเลือกอันที่ตรงกับงาน'],
      fx3: (b, t) => { L.badgeOptions(t.ch, PROP_KEY[zone], PROP_OF[zone]); if (b) b.testAll(); },
      fig: qq => labPanel(qq, zone, q.options),
      answerText: nm(q.answer)
    });
  }

  /* ────────── ภารกิจตุ๊บตุ๊บอ้าง : ทดสอบเองแล้วตัดสินจริง/ไม่จริง ────────── */
  function tClaim(zone, run) {
    const u = used(run);
    const c = GEN.claim(zone, u.pairs);
    if (c.a && c.b) u.pairs.push(c.a + c.b);
    const t = taskChoice({
      skill: 'apply',
      title: 'ตุ๊บตุ๊บอ้างว่า... จริงหรือไม่จริง?',
      judSay: 'ฮิ ๆ ข้าขอบอกว่า “' + c.text + '” เชื่อข้าสิ!',
      say: 'อย่าเพิ่งเชื่อ! ทดสอบเอง แล้วตัดสินว่าจริงหรือไม่จริง!',
      story: 'ตุ๊บตุ๊บบอกว่า: **' + c.text + '**',
      cls: 'opts-yn',
      options: yn(),
      answer: c.truth,
      explain: c.why,
      wrongMsg: () => 'ลองทดสอบด้วยเครื่องมือดูก่อนนะ',
      hints: ['อย่าเชื่อตุ๊บตุ๊บ ต้องทดสอบก่อน!', ({ 1: 'กดปุ่ม "ขีดกัน!" ดูผลเอง', 2: 'ลากมือดึงหรือกดวัสดุ แล้วปล่อยดู', 3: 'กดปุ่มทดลอง จุ่มช้อนลงน้ำร้อน', 4: 'ลากวัสดุไปวางที่ช่องว่าง ดูหลอดไฟ' })[zone], 'โปรโปร... เอ๊ย แมทแมททดสอบให้ดู ดูผลเอาเองนะ'],
      noDim: true,
      fx3: b => {
        if (!b) return;
        if (zone === 1) b.run(c.a, c.b);
        else if (zone === 2) b.autoRun && b.autoRun(c.id);
        else if (zone === 3) b.run();
        else if (zone === 4) b.place(c.id, 0);
      },
      fig: (q, api) => {
        if (zone === 1) { const b = W.duelBench(q, { samples: [c.a, c.b], hidePick: true }); b.select([c.a, c.b]); return b; }
        if (zone === 2) return W.forceBench(q, { samples: [c.id] });
        if (zone === 3) return W.heatBench(q, { rods: [c.a, c.b] });
        return W.circuitBench(q, { slots: 1, items: [c.id] });
      },
      onRight: b => { if (b && zone === 1) b.run(c.a, c.b); },
      answerText: c.truth ? 'จริง' : 'ไม่จริง'
    });
    return t;
  }

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 1 เหมืองแข็งแรง : ความแข็ง
     ═══════════════════════════════════════════════════════ */
  function tScratch1() {
    const ids = ['sponge', 'wood', 'steel'];
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'hard',
      title: 'ขีดวัสดุด้วยตะปู',
      say: 'ลากตะปูขีดบนวัสดุทั้ง 3 อัน ดูซิอันไหนเป็นรอย!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('ว้าว! อันไหนขีดแล้วไม่เป็นรอยเลย? อันนั้นแหละแข็งที่สุด!', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-3', options: ids.map(id => ({ html: itemOpt(id), value: id })),
            onPick(v, b) {
              if (v === 'steel') { b.classList.add('good'); ch.lock(); api.correct(praise() + ' เหล็กขีดไม่เป็นรอย จึง {c:hard} ที่สุด!', b); }
              else { ch.dim(b); api.wrong(nm(v) + 'ถูกขีดจนเป็นรอยแล้วนะ', b); }
            }
          });
        };
        askFn = ask;
        bench = W.scratchBench(el.querySelector('.bench-host'), { samples: ids, tools: ['nail'], onTest() { if (bench && bench.allTested('nail')) setTimeout(ask, 600); } });
      },
      hint(l) {
        if (l === 3 && bench) bench.svg.querySelector('.sm[data-id="steel"]').classList.add('hl');
        return ['ลากตะปูให้ยาว ๆ บนวัสดุแต่ละอัน แล้วดูรอยที่เกิดขึ้น', 'ดูตารางข้างล่าง อันไหนเขียนว่า "ไม่เป็นรอย"', 'ดูอันที่เรืองแสงเหลืองสิ ขีดแล้วไม่เป็นรอยเลย'][l - 1];
      },
      answer: 'เหล็กขีดไม่เป็นรอย จึงแข็งที่สุด',
      solve() { if (bench) bench.runAll('nail'); if (askFn) askFn(); if (ch) ch.mark('steel', 'good'); }
    };
  }

  function tSortHard() {
    const items = GEN.hardSort(1, 6);
    let sorter = null;
    return {
      skill: 'hard',
      title: 'ลองกดด้วยนิ้ว แล้วจัดกลุ่ม แข็ง/นิ่ม',
      say: 'กดปุ่ม "กด" บนการ์ด! บุ๋ม = นิ่ม ไม่บุ๋ม = แข็ง แล้วลากลงถัง!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: items.map(id => ({ id })),
          bins: [{ id: 'hard', label: 'แข็ง', note: 'กดไม่บุ๋ม', icon: 'gem', color: '#3b82f6' }, { id: 'soft', label: 'นิ่ม', note: 'กดแล้วบุ๋ม', icon: 'pillow', color: '#ec4899' }],
          answer: it => MM.hardGroup(it.id),
          evidence: it => MM.hardGroup(it.id) === 'hard' ? rchip('กดไม่บุ๋ม', 'ok') : rchip('กดแล้วบุ๋ม', 'warn'),
          testIcon: 'press', testLabel: 'กด', lab: () => 'press',
          onTest: it => { if (MM.know) MM.know(MM.ITEM[it.id].mat, 'hard'); },
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่ถังนี้ ลองกดปุ่ม "กด" ก่อนนะ', card),
          onDone: () => api.correct(praise() + ' {c:hard} กดไม่บุ๋ม · {c:soft} กดแล้วบุ๋ม', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.testAll();
        return ['กดปุ่ม "กด" บนการ์ดก่อน แล้วดูผลที่ขึ้นมา', 'กดแล้วบุ๋ม = {c:soft}   กดไม่บุ๋ม = {c:hard}', 'แมทแมทกดให้ทุกใบแล้ว ดูผลแล้วลากลงถังนะ'][l - 1];
      },
      answer: items.map(id => nm(id) + (MM.hardGroup(id) === 'hard' ? ' = แข็ง' : ' = นิ่ม')).join(' · '),
      solve() { items.forEach(id => { try { sorter.place(id, MM.hardGroup(id)); } catch (e) {} }); }
    };
  }

  function tDuel(level, run) {
    const u = used(run);
    const p = GEN.hardPair(level, u.pairs);
    u.pairs.push(p.a + p.b);
    return taskChoice({
      skill: 'hard',
      title: 'ทาย: ' + nm(p.a) + ' กับ ' + nm(p.b) + ' ขีดกัน อันไหนเป็นรอย?',
      say: 'ทายก่อนว่าอันไหนเป็นรอย แล้วกด "ขีดกัน!" พิสูจน์ได้เลย!',
      cls: 'opts-2',
      options: [p.a, p.b].map(id => ({ html: itemOpt(id, '<small>เป็นรอย</small>'), value: id })),
      answer: p.loser,
      explain: nm(p.winner) + 'แข็งกว่า จึงขีด' + nm(p.loser) + 'เป็นรอย',
      wrongMsg: id => nm(id) + 'แข็งกว่านะ เลยไม่เป็นรอย',
      hints: ['วัสดุที่ {c:soft} กว่า จะเป็นรอยเมื่อโดนขีด', 'กดปุ่ม "ขีดกัน!" ดูผลจริงได้เลย', 'แมทแมทขีดให้ดูแล้ว ดูซิอันไหนเป็นรอย'],
      noDim: true,
      fx3: b => { if (b) b.run(p.a, p.b); },
      fig: q => { const b = W.duelBench(q, { samples: [p.a, p.b], hidePick: true }); b.select([p.a, p.b]); return b; },
      onRight: b => { if (b) b.run(p.a, p.b); },
      answerText: nm(p.loser) + 'เป็นรอย'
    });
  }

  function tRank(level, run) {
    const tr = GEN.hardTriple(level);
    let bench = null, ord = null;
    return {
      skill: 'hard',
      title: 'เรียงจาก นิ่มที่สุด → แข็งที่สุด',
      say: 'ขีดกันทีละคู่ อันที่เป็นรอยคือนิ่มกว่า แล้วเรียงให้ถูก!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host b-host"></div></div><div class="qa-a"><div class="w-host o-host"></div></div></div>';
        bench = W.duelBench(el.querySelector('.b-host'), { samples: tr.ids });
        ord = tapOrder(el.querySelector('.o-host'), {
          ask: 'แตะเรียง: นิ่มที่สุด → แข็งที่สุด', ids: tr.ids, labels: ['นิ่มที่สุด', 'กลาง', 'แข็งที่สุด'],
          onComplete(order) {
            if (order.join() === tr.sorted.join()) api.correct(praise() + ' ' + tr.sorted.map(nm).join(' → '), el);
            else { api.wrong('ลำดับยังไม่ถูก ลองขีดเทียบทีละคู่นะ', el.querySelector('.o-host')); setTimeout(() => ord.reset(), 700); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ord) ord.cards.find(c => c.dataset.id === tr.sorted[0]).classList.add('hl');
        return ['เอาสองอันมาขีดกัน อันที่เป็นรอย คือนิ่มกว่า', 'เทียบทีละคู่ แล้วใช้ผลมาเรียง', 'อันที่เรืองแสงสีเหลือง ถูกขีดเป็นรอยทุกครั้ง จึงนิ่มที่สุด'][l - 1];
      },
      answer: tr.sorted.map(nm).join(' → '),
      solve() { if (ord) ord.set(tr.sorted); },
      auto() { tr.sorted.forEach(id => ord.cards.find(c => c.dataset.id === id).click()); }
    };
  }

  STAGES.push({
    id: 1, name: 'เหมืองแข็งแรง', topic: 'ความแข็งของวัสดุ', color: '#ff8a3c', skill: 'hard',
    intro: [
      { who: 'mat', mood: 'wow', text: 'ถึงเหมืองแข็งแรงแล้ว! ตุ๊บตุ๊บสลับป้ายหมด ไม่รู้ว่าอะไรแข็ง อะไรนิ่ม!', show: showZone(1, 'เหมืองแข็งแรง') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ ข้าสลับป้ายเอง! ข้าบอกเลย ฟองน้ำแข็งที่สุด เชื่อข้าสิ!' },
      { who: 'mat', mood: 'think', text: 'อย่าเพิ่งเชื่อ! เรามีเครื่องมือทดสอบ ตะปูไว้ขีด นิ้วไว้กด!', show: showItems(['nail', 'sponge', 'wood', 'steel'], 'ขีดและกด แล้วดูผลด้วยตาตัวเอง') },
      { who: 'mat', mood: 'cheer', text: 'ลองทดสอบกันเลย!', last: 'ลุยเลย!' }
    ],
    learn: [tScratch1, tSortHard],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tDuel(level, run);
      if (i === 1) return level >= 3 ? tRank(level, run) : tUse(1, level, run);
      return tClaim(1, run);
    },
    recap: [
      'วัสดุ {c:hard} ขีดไม่เป็นรอยง่าย และกดด้วยนิ้วไม่บุ๋ม เช่น เหล็ก หิน แก้ว ไม้',
      'วัสดุ {c:soft} ขีดเป็นรอยง่าย และกดแล้วบุ๋ม เช่น ฟองน้ำ ดินน้ำมัน ยางลบ',
      'ถ้าเอาวัสดุสองอันขีดกัน อันที่เป็นรอยคืออันที่แข็งน้อยกว่า',
      'เลือกใช้ให้เหมาะกับงาน เช่น หัวค้อนต้องแข็ง ไส้หมอนต้องนิ่ม'
    ],
    teacher: [
      'ถ้าขีดวัสดุสองชนิดแล้วไม่เป็นรอยทั้งคู่ เราจะรู้ได้อย่างไรว่าอันไหนแข็งกว่า? (ชวนคิดวิธีทดสอบเพิ่ม)',
      'ให้นักเรียนยกตัวอย่างสิ่งของในห้องเรียนที่ทำจากวัสดุแข็ง และวัสดุนิ่ม พร้อมบอกประโยชน์'
    ],
    book: [
      '**ความแข็ง** บอกว่าวัสดุขีดหรือกดให้เป็นรอยยากแค่ไหน',
      'ขีดด้วยตะปู: ไม่เป็นรอย = {c:hard} · เป็นรอย = แข็งน้อยกว่า',
      'กดด้วยนิ้ว: ไม่บุ๋ม = {c:hard} · บุ๋ม = {c:soft}',
      'อันที่เป็นรอยเวลาขีดกัน คือ **อันที่นิ่มกว่า**'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 2 โรงงานยางเด้ง : สภาพยืดหยุ่น
     ═══════════════════════════════════════════════════════ */
  function tForce1() {
    const ids = ['band', 'clay', 'sponge', 'wood'];
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'elastic',
      title: 'ออกแรง แล้วปล่อย ดูซิกลับเหมือนเดิมไหม?',
      say: 'ลากมือออกแรงดึงหรือกด แล้วปล่อยนิ้ว! ลองให้ครบ 4 อัน!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('ยางยืดกับฟองน้ำกลับเหมือนเดิม ดินน้ำมันไม่กลับ! แล้ว {c:elastic} คืออะไร?', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-words',
            options: [
              { html: rich('ออกแรงแล้วเปลี่ยนรูป **ปล่อยแล้วกลับเหมือนเดิม**'), value: 'a' },
              { html: rich('ออกแรงแล้วเปลี่ยนรูป **ปล่อยแล้วค้างอยู่**'), value: 'b' },
              { html: rich('ออกแรงแล้ว **ไม่เปลี่ยนรูปเลย**'), value: 'c' }
            ],
            onPick(v, b) {
              if (v === 'a') { b.classList.add('good'); ch.lock(); api.correct(praise() + ' {c:elastic} คือ ปล่อยแล้วกลับเหมือนเดิม!', b); }
              else { ch.dim(b); api.wrong(v === 'b' ? 'แบบนั้นเหมือนดินน้ำมัน ไม่ใช่วัสดุยืดหยุ่น' : 'วัสดุยืดหยุ่นต้องเปลี่ยนรูปได้ก่อน', b); }
            }
          });
        };
        askFn = ask;
        bench = W.forceBench(el.querySelector('.bench-host'), { samples: ids, onTest() { if (bench && bench.allTested()) setTimeout(ask, 900); } });
      },
      hint(l) {
        return ['ลากมือบนวัสดุ ดึงหรือกดให้สุด แล้วปล่อยนิ้ว ดูว่ากลับไหม', 'ดูเส้นประสีชมพู คือรูปเดิม ถ้าปล่อยแล้วกลับมาตรงเส้นประ คือกลับเหมือนเดิม', 'ยางยืดกับฟองน้ำกลับเหมือนเดิม ส่วนดินน้ำมันค้างอยู่'][l - 1];
      },
      answer: 'ออกแรงแล้วเปลี่ยนรูป ปล่อยแล้วกลับเหมือนเดิม',
      solve() { if (bench) bench.runAll(); if (askFn) askFn(); if (ch) ch.mark('a', 'good'); }
    };
  }

  function tSortElastic() {
    const items = GEN.elasticSet(1, 6);
    let sorter = null;
    return {
      skill: 'elastic',
      title: 'ทดลองแล้วจัดกลุ่ม ยืดหยุ่น / ไม่ยืดหยุ่น',
      say: 'กดปุ่ม "ทดลอง" ดูว่าปล่อยแล้วกลับไหม แล้วลากลงถัง!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: items.map(id => ({ id })),
          bins: [{ id: 'yes', label: 'ยืดหยุ่น', note: 'ปล่อยแล้วกลับเหมือนเดิม', icon: 'coil', color: '#ec4899' }, { id: 'no', label: 'ไม่ยืดหยุ่น', note: 'ค้างอยู่ หรือไม่เปลี่ยนรูป', icon: 'bent', color: '#64748b' }],
          answer: it => MM.isElastic(it.id) ? 'yes' : 'no',
          evidence: it => MM.isElastic(it.id) ? rchip('ปล่อยแล้วกลับเหมือนเดิม', 'ok') : (MM.ITEM[it.id].rigid ? rchip('ออกแรงแล้วรูปไม่เปลี่ยน', 'gray') : rchip('ปล่อยแล้วค้างอยู่', 'warn')),
          testIcon: 'pull', testLabel: 'ทดลอง', lab: () => 'elastic',
          onTest: it => { if (MM.know) MM.know(MM.ITEM[it.id].mat, 'elastic'); },
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่ถังนี้ ลองกดปุ่ม "ทดลอง" ก่อนนะ', card),
          onDone: () => api.correct(praise() + ' ต้องปล่อยแล้ว **กลับเหมือนเดิม** ถึงเรียก {c:elastic}', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.testAll();
        return ['กดปุ่ม "ทดลอง" บนการ์ดก่อน แล้วดูผลที่ขึ้นมา', 'ปล่อยแล้วกลับเหมือนเดิม = {c:elastic} ค้างอยู่หรือไม่เปลี่ยน = {c:inelastic}', 'แมทแมททดลองให้ทุกใบแล้ว ดูผลแล้วลากลงถังนะ'][l - 1];
      },
      answer: items.map(id => nm(id) + (MM.isElastic(id) ? ' = ยืดหยุ่น' : ' = ไม่ยืดหยุ่น')).join(' · '),
      solve() { items.forEach(id => { try { sorter.place(id, MM.isElastic(id) ? 'yes' : 'no'); } catch (e) {} }); }
    };
  }

  function tPredictElastic(level, run) {
    const u = used(run);
    const pools = { 1: ['band', 'clay', 'spring', 'paper'], 2: ['sponge', 'ball', 'foil', 'stone'], 3: ['wire', 'foil', 'wood', 'clay', 'ball'] };
    let id, tries = 0;
    do { id = pick(pools[level]); tries++; } while (u.kinds.indexOf(id) >= 0 && tries < 20);
    u.kinds.push(id);
    const el0 = MM.isElastic(id);
    const trap = !el0 && (id === 'wire' || id === 'foil' || id === 'clay');
    return taskChoice({
      skill: 'elastic',
      title: nm(id) + 'เป็นวัสดุยืดหยุ่นไหม?',
      say: 'ออกแรงแล้วปล่อย ' + nm(id) + 'จะกลับเหมือนเดิมไหม? ลองทดลองดูก็ได้!',
      cls: 'opts-2',
      options: [{ html: art.icon('check') + '<span>ใช่ ยืดหยุ่น</span>', value: true }, { html: art.icon('cross') + '<span>ไม่ใช่</span>', value: false }],
      answer: el0,
      explain: el0 ? nm(id) + 'ปล่อยแล้วกลับเหมือนเดิม จึงยืดหยุ่น' : (trap ? nm(id) + 'เปลี่ยนรูปง่าย แต่ปล่อยแล้วไม่กลับ จึงไม่ยืดหยุ่น' : nm(id) + 'ไม่ยืดหยุ่น'),
      wrongMsg: () => trap ? 'เปลี่ยนรูปง่าย ยังไม่แปลว่ายืดหยุ่น ต้องกลับด้วย' : 'ลองออกแรงแล้วปล่อยดูอีกที',
      hints: ['ยืดหยุ่น ต้อง **ปล่อยแล้วกลับเหมือนเดิม**', 'ลากมือออกแรงแล้วปล่อย ดูเส้นประรูปเดิม', 'แมทแมททดลองให้ดูแล้ว ดูผลใต้ภาพ'],
      noDim: true,
      fx3: b => { if (b && b.autoRun) b.autoRun(id); },
      fig: q => W.forceBench(q, { samples: [id] }),
      answerText: el0 ? 'ยืดหยุ่น' : 'ไม่ยืดหยุ่น'
    });
  }

  STAGES.push({
    id: 2, name: 'โรงงานยางเด้ง', topic: 'สภาพยืดหยุ่นของวัสดุ', color: '#ff5fa2', skill: 'elastic',
    intro: [
      { who: 'mat', mood: 'wow', text: 'โรงงานยางเด้ง! ตุ๊บตุ๊บเอาป้ายไปสลับ ยางยืดกับดินน้ำมันปนกันหมด!', show: showZone(2, 'โรงงานยางเด้ง') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ ข้าบอกเลย ดินน้ำมันดึงแล้วยาว ต้องยืดหยุ่นแน่ ๆ!' },
      { who: 'mat', mood: 'think', text: 'เอ๊ะ จริงเหรอ? ต้องออกแรง แล้วปล่อย ดูว่ากลับเหมือนเดิมไหม!', show: showItems(['band', 'spring', 'ball', 'clay'], 'ออกแรง แล้วปล่อยให้ดู') },
      { who: 'mat', mood: 'cheer', text: 'ลุยทดลองกัน!', last: 'ลุยเลย!' }
    ],
    learn: [tForce1, tSortElastic],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tPredictElastic(level, run);
      if (i === 1) return tUse(2, level, run);
      return tClaim(2, run);
    },
    recap: [
      'วัสดุ {c:elastic} ออกแรงแล้วเปลี่ยนรูป พอปล่อยก็กลับเป็นรูปเดิม เช่น ยางยืด สปริง ฟองน้ำ ลูกบอลยาง',
      'วัสดุ {c:inelastic} เปลี่ยนรูปแล้วค้างอยู่ หรือแข็งจนไม่เปลี่ยนรูป เช่น ดินน้ำมัน กระดาษ ฟอยล์ ลวดทองแดง ไม้ หิน',
      'เปลี่ยนรูปได้ง่าย ไม่ได้แปลว่ายืดหยุ่น ต้อง **กลับเหมือนเดิม** ด้วย',
      'เลือกใช้ให้เหมาะ เช่น พื้นรองเท้าและสปริงต้องยืดหยุ่น ส่วนรูปปั้นดินน้ำมันต้องคงรูป'
    ],
    teacher: [
      'ลวดทองแดงงอได้ง่าย เป็นวัสดุยืดหยุ่นไหม? เพราะอะไร (ชวนแยกคำว่า "เปลี่ยนรูปได้" ออกจาก "กลับเหมือนเดิม")',
      'ให้นักเรียนยกตัวอย่างสิ่งของรอบตัวที่ใช้สมบัติยืดหยุ่น เช่น ยางรัดของ เบาะนั่ง ลูกบอล'
    ],
    book: [
      '**สภาพยืดหยุ่น** คือ ออกแรงแล้วเปลี่ยนรูป พอหยุดออกแรงก็กลับเป็นรูปเดิม',
      '{c:elastic}: ยางยืด · สปริง · ฟองน้ำ · ลูกบอลยาง',
      '{c:inelastic}: ดินน้ำมัน · กระดาษ · ฟอยล์ · ลวดทองแดง · ไม้ · หิน',
      'เปลี่ยนรูปแล้วค้างอยู่ = ไม่ยืดหยุ่น'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 3 ครัวร้อนฉ่า : การนำความร้อน
     ═══════════════════════════════════════════════════════ */
  function tHeat1() {
    /* มีโลหะเพียงตัวเดียว ให้ตอบได้ชัดว่าช้อนไหนเนยละลายก่อน */
    const good = pick(POOL.heatGood), poor = sample(POOL.heatPoor, 3);
    const ids = shuffle([good].concat(poor));
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'heat',
      title: 'จุ่มช้อนในน้ำร้อน ดูเนยที่ปลายด้าม',
      say: 'กดปุ่มทดลอง! ดูเนยที่ปลายด้าม อันไหนละลายก่อน?',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('เนยของช้อนไหนละลายก่อนนะ?', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-2', options: ids.map(id => ({ html: itemOpt(id), value: id })),
            onPick(v, b) {
              if (v === good) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ' + nm(good) + 'เป็น {c:heatY} เนยเลยละลายก่อน!', b); }
              else { ch.dim(b); api.wrong('เนยของ' + nm(v) + 'ยังไม่ละลายเลย ดูอีกทีนะ', b); }
            }
          });
        };
        askFn = ask;
        bench = W.heatBench(el.querySelector('.bench-host'), { rods: ids, onRun: () => setTimeout(ask, 700) });
      },
      hint(l) {
        if (l === 3 && bench && !bench.hasRun()) bench.run();
        return ['กดปุ่มทดลอง แล้วดูสีแดงส้มที่วิ่งขึ้นไปตามช้อน', 'ความร้อนวิ่งไปถึงปลายด้ามก่อน เนยตรงนั้นจะละลายก่อน', 'ดูช้อนที่เนยละลายไปแล้วสิ'][l - 1];
      },
      answer: nm(good) + 'ละลายก่อน เพราะนำความร้อนดี',
      solve() { if (bench && !bench.hasRun()) bench.finishNow(); if (askFn) askFn(); if (ch) ch.mark(good, 'good'); }
    };
  }

  function tSortHeat() {
    const items = GEN.heatSort(6);
    let sorter = null;
    return {
      skill: 'heat',
      title: 'จุ่มน้ำร้อนแล้วจัดกลุ่ม นำความร้อนดี / ไม่ดี',
      say: 'กดปุ่ม "จุ่มน้ำร้อน" ดูว่าเนยละลายไหม แล้วลากลงถัง!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: items.map(id => ({ id })),
          bins: [{ id: 'good', label: 'นำความร้อนดี', note: 'เนยละลายเร็ว', icon: 'flame', color: '#f97316' }, { id: 'poor', label: 'นำความร้อนไม่ดี', note: 'เนยละลายช้ามาก', icon: 'thermo', color: '#64748b' }],
          answer: it => MM.heatGood(it.id) ? 'good' : 'poor',
          evidence: it => MM.heatGood(it.id) ? rchip('เนยละลายเร็ว', 'ok') : rchip('เนยยังไม่ละลาย', 'warn'),
          testIcon: 'flame', testLabel: 'จุ่มน้ำร้อน', lab: () => 'heat',
          onTest: it => { if (MM.know) MM.know(MM.ITEM[it.id].mat, 'heat'); },
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่ถังนี้ ลองกดปุ่ม "จุ่มน้ำร้อน" ก่อนนะ', card),
          onDone: () => api.correct(praise() + ' โลหะ {c:heatY} ส่วนไม้ พลาสติก ยาง {c:heatN}', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.testAll();
        return ['กดปุ่ม "จุ่มน้ำร้อน" บนการ์ดก่อน แล้วดูผล', 'เนยละลายเร็ว = {c:heatY}   ยังไม่ละลาย = {c:heatN}', 'แมทแมททดลองให้ทุกใบแล้ว ดูผลแล้วลากลงถังนะ'][l - 1];
      },
      answer: items.map(id => nm(id) + (MM.heatGood(id) ? ' = นำความร้อนดี' : ' = ไม่ดี')).join(' · '),
      solve() { items.forEach(id => { try { sorter.place(id, MM.heatGood(id) ? 'good' : 'poor'); } catch (e) {} }); }
    };
  }

  function tRaceHeat(level, run) {
    const type = level >= 3 ? pick(['first', 'never']) : level === 2 ? 'never' : 'first';
    let ids, answer, ask, say, expl;
    if (type === 'first') {
      const good = pick(POOL.heatGood);
      ids = shuffle([good].concat(sample(POOL.heatPoor, 3))); answer = good;
      ask = 'ช้อนไหนทำให้เนยละลายก่อน?';
      expl = nm(good) + 'นำความร้อนดี ความร้อนถึงปลายด้ามเร็วสุด';
    } else {
      const poor = pick(POOL.heatPoor);
      ids = shuffle([poor].concat(sample(POOL.heatGood, 3))); answer = poor;
      ask = 'ช้อนไหนที่เนยจะยังไม่ละลาย จนหมดเวลา?';
      expl = nm(poor) + 'นำความร้อนไม่ดี ความร้อนผ่านช้า เนยเลยไม่ละลาย';
    }
    return taskChoice({
      skill: 'heat',
      title: ask,
      say: 'ทายก่อน! ' + ask + ' แล้วกดทดลองพิสูจน์ได้เลย!',
      cls: 'opts-2',
      options: ids.map(id => ({ html: itemOpt(id), value: id })),
      answer,
      explain: expl,
      wrongMsg: id => type === 'first' ? nm(id) + 'ไม่ใช่ตัวที่เร็วที่สุด' : nm(id) + 'นำความร้อนดี เนยละลายแน่ ๆ',
      hints: ['โลหะนำความร้อนดี ไม้ พลาสติก ยาง นำความร้อนไม่ดี', 'กดปุ่มทดลอง ดูสีแดงส้มที่วิ่งขึ้นไปตามช้อน', 'แมทแมททดลองให้ดูแล้ว ดูเนยที่ปลายด้ามสิ'],
      fx3: b => { if (b && !b.hasRun()) b.run(); },
      fig: q => W.heatBench(q, { rods: ids }),
      onRight: b => { if (b && !b.hasRun()) b.run(); },
      answerText: nm(answer)
    });
  }

  STAGES.push({
    id: 3, name: 'ครัวร้อนฉ่า', topic: 'การนำความร้อนของวัสดุ', color: '#ff5a4e', skill: 'heat',
    intro: [
      { who: 'mat', mood: 'wow', text: 'ครัวร้อนฉ่า! ตุ๊บตุ๊บเอาช้อนมาปนกัน ไม่รู้ว่าช้อนไหนร้อนเร็ว!', show: showZone(3, 'ครัวร้อนฉ่า') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ ช้อนไม้ร้อนเร็วที่สุด ข้าลองมาแล้ว!' },
      { who: 'mat', mood: 'think', text: 'จริงเหรอ? เราจะจุ่มช้อนในน้ำร้อน แล้วดูเนยที่ปลายด้ามละลาย!', show: showItems(['cuRod', 'feRod', 'woodRod', 'plRod'], 'เนยละลายเมื่อความร้อนวิ่งถึงปลายด้าม') },
      { who: 'mat', mood: 'cheer', text: 'จำไว้นะ ในห้องเรียนไม่จับของร้อนจริง ๆ ดูในเกมก็พอ!', last: 'ลุยเลย!' }
    ],
    learn: [tHeat1, tSortHeat],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tRaceHeat(level, run);
      if (i === 1) return tUse(3, level, run);
      return tClaim(3, run);
    },
    recap: [
      'วัสดุ {c:heatY} คือ ความร้อนวิ่งผ่านได้เร็ว เช่น ทองแดง อะลูมิเนียม เหล็ก (โลหะ)',
      'วัสดุ {c:heatN} คือ ความร้อนผ่านได้ช้า จับแล้วไม่ร้อนเร็ว เช่น ไม้ พลาสติก ยาง ผ้า',
      'ตัวหม้อใช้โลหะ ให้ความร้อนถึงอาหารเร็ว ส่วนด้ามจับใช้ไม้หรือพลาสติก มือจะได้ไม่ร้อน',
      'ความปลอดภัย: ไม่จับของร้อนด้วยมือเปล่า ใช้ผ้าหรือถุงมือกันร้อนเสมอ'
    ],
    teacher: [
      'ทำไมเวลาทอดอาหารเราจึงเลือกตะหลิวด้ามไม้ แทนด้ามโลหะ? (ให้อธิบายด้วยการนำความร้อน)',
      'ถ้าไม่มีผ้าจับหม้อ จะหาของอะไรในครัวที่นำความร้อนไม่ดีมาช่วยแทนได้ (ย้ำเรื่องความปลอดภัย)'
    ],
    book: [
      '**การนำความร้อน** คือ ความร้อนเคลื่อนที่ผ่านวัสดุได้เร็วหรือช้าแค่ไหน',
      '{c:heatY}: ทองแดง · อะลูมิเนียม · เหล็ก',
      '{c:heatN}: ไม้ · พลาสติก · ยาง · ผ้า',
      'หม้อ: ตัวหม้อโลหะ + ด้ามพลาสติก/ไม้'
    ]
  });

  MM.zone1 = { labPanel, tUse, tClaim, used, showZone, showItems, showHtml, host, PROP_OF, PROP_KEY };
})();
