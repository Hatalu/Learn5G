/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ห้อง 1–3
   1 หอดูดาวทิศทาง (เส้นทางขึ้น-ตกของดวงจันทร์) · 2 สมุดบันทึกท้องฟ้า (หลักฐานเวลาขึ้น) · 3 ห้องจำลองแสงจันทร์ (แบบจำลองรูปร่างปรากฏ)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK;
  const { art, ui, audio, W, GEN } = SK;
  const { pick, mod } = SK;
  const L = SK.lib;
  const { yn, textOpt, moonOpt, taskChoice, tapOrder, rich } = L;
  const VT = id => (window.VOICED && window.VOICED[id]) || '';
  const rad = d => d * Math.PI / 180;

  SK.STAGES = SK.STAGES || [];
  const STAGES = SK.STAGES;
  SK.SKILLS = {
    path: { name: 'เส้นทางขึ้น-ตกของดวงจันทร์', rec: 'ดวงจันทร์ขึ้นทาง{c:east} ตกทาง{c:west} เพราะโลกหมุนรอบตัวเอง' },
    evidence: { name: 'ใช้หลักฐานอธิบายแบบรูป', rec: 'จดเวลาที่ดวงจันทร์ขึ้นหลายวันติดกัน จะเห็นว่าขึ้น{c:later}วันละประมาณ 50 นาที' },
    model: { name: 'แบบจำลองรูปร่างปรากฏของดวงจันทร์', rec: 'ดวงจันทร์สะท้อนแสงอาทิตย์ ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ แต่เรามองเห็นต่างกันตามตำแหน่ง' },
    predict: { name: 'พยากรณ์รูปร่างดวงจันทร์', rec: '{c:wax}สว่างเพิ่ม {c:wane}สว่างลด วนครบรอบประมาณ 30 วัน ใช้วงปฏิทินนับต่อได้' },
    solar: { name: 'องค์ประกอบของระบบสุริยะ', rec: 'ดวงอาทิตย์อยู่ตรงกลาง ดาวเคราะห์ 8 ดวงเรียงจากใกล้ไปไกล: พุธ ศุกร์ โลก อังคาร พฤหัสบดี เสาร์ ยูเรนัส เนปจูน' },
    period: { name: 'เปรียบเทียบคาบการโคจร', rec: 'ดาวเคราะห์ที่อยู่ไกลดวงอาทิตย์กว่า มี{c:period}นานกว่า' }
  };
  const SKILL_OF = { 1: 'path', 2: 'evidence', 3: 'model', 4: 'predict', 5: 'solar', 6: 'period' };

  /* ── ตัวช่วยร่วม ── */
  const U = (run, key) => (run.used[key] = run.used[key] || []);
  const showZone = (id, cap) => box => { box.innerHTML = '<div class="show-card">' + art.zoneArt(id) + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; };
  const showHtml = (html, cap) => box => { box.innerHTML = '<div class="show-card">' + html + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>'; };
  const dir = (a, b) => Math.abs(mod(a - b + 180, 360) - 180);
  const hostOf = (el, cls) => el.querySelector('.' + cls);
  const QA = (r1, r2) => '<div class="qa"><div class="qa-q"><div class="w-host ' + r1 + '"></div></div>' + (r2 ? '<div class="qa-a"><div class="w-host ' + r2 + '"></div></div>' : '') + '</div>';

  /* ภาพย่อท้องฟ้า (ดวงจันทร์ที่จุดหนึ่งบนเส้นโค้ง) ใช้เป็นการ์ดเรียงลำดับ */
  function miniSky(t, eps) {
    const X = u => 12 + 96 * u, Y = u => 54 - 40 * Math.sin(Math.PI * u);
    let p = '';
    for (let i = 0; i <= 20; i++) p += (i ? 'L' : 'M') + X(i / 20).toFixed(1) + ' ' + Y(i / 20).toFixed(1);
    return '<svg class="minisky" viewBox="0 0 120 72" aria-hidden="true"><rect width="120" height="72" rx="12" fill="#2a3590"/><path d="' + p + '" fill="none" stroke="#fff6c2" stroke-width="1.8" stroke-dasharray="2 5" opacity=".8"/>' +
      art.at(art.moon(eps == null ? 170 : eps), (X(t) - 8).toFixed(1), (Y(t) - 8).toFixed(1), 16) + '<rect y="54" width="120" height="18" rx="9" fill="#1d1850"/>' +
      '<text x="10" y="67" font-size="8" font-weight="800" fill="#ffb347" font-family="Mali">ตะวันออก</text><text x="110" y="67" font-size="8" font-weight="800" fill="#ff9fc8" text-anchor="end" font-family="Mali">ตะวันตก</text></svg>';
  }
  /* ภาพย่อวงโคจรดวงจันทร์ (ใช้เป็นตัวเลือก) */
  function miniOrbit(eps) {
    const cx = 74, cy = 60, R = 40, a = rad(SK.orbitAngle(eps)), mx = cx + R * Math.cos(a), my = cy - R * Math.sin(a);
    const sunDeg = Math.atan2(-(cy - my), 16 - mx) * 180 / Math.PI;
    return '<svg class="miniorbit" viewBox="0 0 150 120" aria-hidden="true"><rect width="150" height="120" rx="14" fill="#232d78"/>' +
      '<g transform="translate(16 60)">' + art.sun(9, false) + '</g><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#fff6c2" stroke-width="1.6" stroke-dasharray="3 5" opacity=".7"/>' +
      '<g transform="translate(' + cx + ' ' + cy + ')">' + art.planet('earth', 12) + '</g><g transform="translate(' + mx.toFixed(1) + ' ' + my.toFixed(1) + ')">' + art.moonOrbit(8, sunDeg) + '</g></svg>';
  }
  SK.miniSky = miniSky; SK.miniOrbit = miniOrbit;

  /* ฟิ้วฟิ้วอ้าง : จริงหรือไม่จริง (ใช้ร่วมทุกด่าน) */
  function tClaim(stage, run, figFn, hintMid, fx3) {
    const c = GEN.claim(stage, U(run, 'claim' + stage));
    return taskChoice({
      skill: SKILL_OF[stage],
      title: 'ฟิ้วฟิ้วอ้างว่า... จริงหรือไม่จริง?',
      judSay: 'ฮิ ๆ ข้าขอบอกว่า “' + c.text + '” เชื่อข้าสิ!',
      say: 'อย่าเพิ่งเชื่อ! ทดลองเอง แล้วตัดสินว่าจริงหรือไม่จริง!',
      story: 'ฟิ้วฟิ้วบอกว่า: **' + c.text + '**',
      cls: 'opts-yn', options: yn(), answer: c.truth, explain: c.why,
      wrongMsg: () => 'ลองดูจากแบบจำลองก่อนนะ',
      hints: ['อย่าเพิ่งเชื่อฟิ้วฟิ้ว ต้องดูหลักฐานก่อน!', hintMid, 'ดูจากแบบจำลองแล้วตัดสินใจ แล้วค่อยตอบ'],
      noDim: true, fig: figFn, fx3, answerText: c.truth ? 'จริง' : 'ไม่จริง'
    });
  }

  /* ═══════════════════════════════════════════════════════
     ห้อง 1 หอดูดาวทิศทาง : เส้นทางขึ้นและตกของดวงจันทร์
     ═══════════════════════════════════════════════════════ */
  function tSkyPath() {
    let rig = null, ch = null, asked = false, ask = null;
    return {
      skill: 'path', title: 'ลากดวงจันทร์ตามเส้นโค้ง', say: VT('t1a'), sayClip: 't1a',
      render(el, api) {
        el.innerHTML = QA('rig-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('เห็นไหม? ดวงจันทร์ขึ้นทางไหน แล้วไปตกทางไหน?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-words',
            options: [{ html: textOpt('ขึ้นทางตะวันออก ตกทางตะวันตก'), value: 'EW' }, { html: textOpt('ขึ้นทางตะวันตก ตกทางตะวันออก'), value: 'WE' }, { html: textOpt('ขึ้นทางเหนือ ตกทางใต้'), value: 'NS' }],
            onPick(v, b) {
              if (v === 'EW') { b.classList.add('good'); ch.lock(); api.correct('ดวงจันทร์ขึ้นทาง{c:east} แล้วเคลื่อนเป็นเส้นโค้งไปตกทาง{c:west}', b); } else { ch.dim(b); api.wrong('ลองลากดวงจันทร์ดูอีกรอบ ซ้ายสุดคือทิศตะวันออก', b); }
            }
          });
        };
        rig = W.skyRig(hostOf(el, 'rig-host'), { t: 0.5, onVisit() { if (rig && rig.visited.rise && rig.visited.set) setTimeout(ask, 600); } });
      },
      hint(l) {
        if (l === 3 && rig) rig.play();
        return ['ลากดวงจันทร์ไปซ้ายสุด แล้วไปขวาสุด ดูว่าเริ่มและจบตรงไหน', 'ด้านซ้ายคือทิศตะวันออก ด้านขวาคือทิศตะวันตก', 'กดดูมูนมูนเล่นให้ดู แล้วสังเกตจุดเริ่มกับจุดตก'][l - 1];
      },
      answer: 'ดวงจันทร์ขึ้นทางทิศตะวันออก ตกทางทิศตะวันตก',
      solve() { if (rig) rig.setT(0.95); if (ask) ask(); if (ch) ch.mark('EW', 'good'); }
    };
  }

  function tEarthSpin() {
    let rig = null, ch = null, asked = false, ask = null;
    return {
      skill: 'path', title: 'ทำไมดวงจันทร์ดูเหมือนเคลื่อนที่?', say: VT('t1b'), sayClip: 't1b',
      render(el, api) {
        el.innerHTML = QA('rig-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('ดวงจันทร์ดูเหมือนเคลื่อนที่ เพราะอะไรนะ?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-words',
            options: [{ html: textOpt('เพราะโลกหมุนรอบตัวเอง'), value: 'spin' }, { html: textOpt('เพราะดวงจันทร์วิ่งเร็วมากในคืนเดียว'), value: 'fast' }, { html: textOpt('เพราะดวงอาทิตย์ผลักดวงจันทร์'), value: 'push' }],
            onPick(v, b) {
              if (v === 'spin') { b.classList.add('good'); ch.lock(); api.correct('โลกหมุนจากตะวันตกไปตะวันออก คนบนโลกจึงเห็นดวงจันทร์เหมือนเลื่อนไปทางตะวันตก', b); } else { ch.dim(b); api.wrong('ดูโลกในแบบจำลองสิ ใครหมุน?', b); }
            }
          });
        };
        rig = W.skyRig(hostOf(el, 'rig-host'), { t: 0.12, earth: true, onVisit() { if (rig && rig.visited.rise && rig.visited.set) setTimeout(ask, 600); } });
      },
      hint(l) {
        if (l === 3 && rig) rig.play();
        return ['ลากดวงจันทร์ แล้วดูคนตัวเล็ก ๆ บนโลกว่าขยับอย่างไร', 'ดวงจันทร์ในแบบจำลองอยู่นิ่ง ๆ ส่วนโลกค่อย ๆ หมุน', 'กดดูมูนมูนเล่นให้ดู แล้วสังเกตว่าอะไรหมุน'][l - 1];
      },
      answer: 'โลกหมุนรอบตัวเอง เราจึงเห็นดวงจันทร์ขึ้นและตก',
      solve() { if (rig) rig.setT(0.95); if (ask) ask(); if (ch) ch.mark('spin', 'good'); }
    };
  }

  function tSkyQ(level, run) {
    const q = GEN.sky(level, U(run, 'sky'));
    return taskChoice({
      skill: 'path', title: q.ask, say: q.ask, cls: 'opts-words',
      options: q.options.map(o => ({ html: textOpt(o.label), value: o.value })), answer: q.answer, explain: q.why, hints: q.hints,
      fig: host => W.skyRig(host, { t: q.fig.t, earth: !!q.fig.earth, static: !q.fig.earth }),
      fx3: b => { if (b && b.play && q.fig.earth) b.play(); }
    });
  }

  function tArcOrder(level) {
    const o = GEN.arcOrder(level);
    let ord = null;
    return {
      skill: 'path', title: 'เรียงภาพตามเวลา: ดวงจันทร์เคลื่อนที่อย่างไร', say: 'แตะเรียงจากตอนที่เพิ่งขึ้น ไปจนใกล้ตกนะ!',
      render(el, api) {
        el.innerHTML = '<div class="w-host o-host"></div>';
        ord = tapOrder(el.querySelector('.o-host'), {
          ask: 'แตะเรียง: เพิ่งขึ้น → ใกล้ตก', cards: o.shuffled.map(t => ({ id: String(t), html: miniSky(t) })),
          onComplete(order) {
            if (order.join() === o.ts.map(String).join()) api.correct('ดวงจันทร์เริ่มจากทิศตะวันออก ไต่ขึ้นสูง แล้วลดต่ำลงไปทางทิศตะวันตก', el);
            else { api.wrong('ลำดับยังไม่ถูก นึกถึงเส้นโค้งจากซ้ายไปขวา', el.querySelector('.o-host')); setTimeout(() => ord.reset(), 700); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ord) { const c = ord.cards.find(x => x.dataset.id === String(o.ts[0])); if (c) c.classList.add('hl'); }
        return ['ดวงจันทร์เริ่มจากฝั่งตะวันออก ซึ่งอยู่ทางซ้าย', 'เรียงจากซ้ายไปขวา ตามเส้นโค้งที่ดวงจันทร์เดินทาง', 'ภาพที่เรืองแสง คือภาพแรก ที่ดวงจันทร์เพิ่งขึ้น'][l - 1];
      },
      answer: 'เรียงจากซ้าย (ตะวันออก) ไปขวา (ตะวันตก)',
      solve() { if (ord) ord.set(o.ts.map(String)); }
    };
  }

  STAGES.push({
    id: 1, name: 'หอดูดาวทิศทาง', topic: 'เส้นทางขึ้นและตกของดวงจันทร์', color: '#7a8cff', skill: 'path',
    intro: [
      { who: 'mat', mood: 'wow', v: 's1a', text: VT('s1a'), show: showZone(1, 'หอดูดาวทิศทาง') },
      { who: 'tub', mood: 'laugh', v: 's1b', text: VT('s1b') },
      { who: 'mat', mood: 'think', v: 's1c', text: VT('s1c'), show: showHtml(miniSky(0.5), 'ดวงจันทร์เดินทางบนฟ้า') },
      { who: 'mat', mood: 'cheer', v: 's1d', text: VT('s1d'), last: 'ลุยเลย!' }
    ],
    learn: [tSkyPath, tEarthSpin],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tSkyQ(level, run);
      if (i === 1) return level >= 2 ? tArcOrder(level) : tSkyQ(level, run);
      return tClaim(1, run, host => W.skyRig(host, { t: 0.5, earth: false }), 'ลากดวงจันทร์ดูเส้นทางจริง ซ้ายสุดคือทิศตะวันออก');
    },
    recap: [
      'ดวงจันทร์ขึ้นทาง{c:east} แล้วเคลื่อนเป็นเส้นโค้งไปตกทาง{c:west}',
      'ดวงจันทร์เหมือนเคลื่อนที่ เพราะโลกหมุนรอบตัวเองจากตะวันตกไปตะวันออก',
      'ทิศที่ดวงจันทร์ขึ้นและตก เหมือนกับดวงอาทิตย์'
    ],
    teacher: [
      'ถ้านักเรียนยืนกลางแจ้งแล้วเห็นดวงจันทร์ เขาจะรู้ทิศตะวันออกได้อย่างไร? (ชวนใช้ทิศที่ดวงจันทร์เพิ่งขึ้น)',
      'ให้นักเรียนสังเกตดวงจันทร์จริงอย่างน้อย 3 ช่วงเวลาในคืนเดียวกัน แล้ววาดตำแหน่งเทียบกับบ้านหรือต้นไม้'
    ],
    book: [
      '**ดวงจันทร์ขึ้นทางทิศตะวันออก** ไต่ขึ้นสูงเป็นเส้นโค้ง แล้ว**ตกทางทิศตะวันตก**',
      'โลก**หมุนรอบตัวเอง** จากตะวันตกไปตะวันออก เราจึงเห็นดวงจันทร์เหมือนเคลื่อนที่ไปทางตะวันตก',
      'ภาพท้องฟ้าในเกม: หันหน้าไปทางทิศใต้ มือซ้ายเป็นทิศตะวันออก มือขวาเป็นทิศตะวันตก'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     ห้อง 2 สมุดบันทึกท้องฟ้า : หลักฐานแบบรูปเวลาขึ้นของดวงจันทร์
     ═══════════════════════════════════════════════════════ */
  function tLogObserve() {
    const tb = GEN.riseTable(1, 5);
    let log = null, ch = null, asked = false, ask = null;
    return {
      skill: 'evidence', title: 'จดบันทึก: ดวงจันทร์ขึ้นกี่โมง?', say: VT('t2a'), sayClip: 't2a',
      render(el, api) {
        el.innerHTML = QA('log-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('ดูบันทึกทั้ง 5 วัน เวลาที่ดวงจันทร์ขึ้นเป็นอย่างไรนะ?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-words',
            options: [{ html: textOpt('ช้าลงทุกวัน'), value: 'later' }, { html: textOpt('เร็วขึ้นทุกวัน'), value: 'early' }, { html: textOpt('เวลาเดิมทุกวัน'), value: 'same' }],
            onPick(v, b) {
              if (v === 'later') { b.classList.add('good'); ch.lock(); api.correct('ดวงจันทร์ขึ้น{c:later}ทุกวัน ประมาณวันละ 50 นาที นี่คือแบบรูปจากหลักฐาน', b); } else { ch.dim(b); api.wrong('เทียบเวลาของวันที่ 1 กับวันที่ 5 ดูอีกที', b); }
            }
          });
        };
        log = W.moonLog(hostOf(el, 'log-host'), { rows: tb.rows, onAll: ask });
      },
      hint(l) {
        if (l === 3 && log) log.revealAll();
        return ['แตะแต่ละวัน เพื่อดูว่าดวงจันทร์ขึ้นกี่โมง', 'เมื่อเปิดครบ ให้ดูว่าจุดดวงจันทร์ขยับไปทางไหน', 'มูนมูนเปิดให้แล้ว ดูซิจุดขยับไปทางขวา = เวลาช้าลง'][l - 1];
      },
      answer: 'ดวงจันทร์ขึ้นช้าลงทุกวัน ประมาณวันละ 50 นาที',
      solve() { if (log) log.revealAll(); if (ask) ask(); if (ch) ch.mark('later', 'good'); }
    };
  }

  function tPredictPin() {
    const tb = GEN.riseTable(1, 4, 1);
    const ans = tb.rows[3].min + SK.STEP;
    let log = null;
    return {
      skill: 'evidence', title: 'ทำนายวันที่ 5 จากหลักฐาน', say: VT('t2b'), sayClip: 't2b',
      render(el, api) {
        el.innerHTML = QA('log-host');
        log = W.moonLog(hostOf(el, 'log-host'), {
          rows: tb.rows, hidden: false, predict: {
            day: 5, ans, tol: 15,
            onCheck(ok) { if (ok) api.correct('ถูกต้อง! ขึ้นช้าลงวันละประมาณ 50 นาที วันที่ 5 จึงประมาณ ' + SK.fmtTime(ans), el); else api.wrong('ใกล้แล้ว! ลองดูว่าแต่ละวันห่างกันกี่นาที', el); }
          }
        });
      },
      hint(l) {
        if (l === 3 && log) log.setPredict(ans);
        return ['ดูว่าวันที่ 1 ถึงวันที่ 4 เวลาเปลี่ยนไปวันละกี่นาที', 'แต่ละวันช้าลงประมาณ 50 นาที บวกต่อจากวันที่ 4 อีกหนึ่งวัน', 'มูนมูนวางตัวชี้ให้แล้ว กดตรวจคำตอบได้เลย'][l - 1];
      },
      answer: 'วันที่ 5 ประมาณ ' + SK.fmtTime(ans),
      solve() { if (log) log.setPredict(ans); }
    };
  }

  function tRiseQ(level, run) {
    const q = GEN.rise(level, U(run, 'rise'));
    return taskChoice({
      skill: 'evidence', title: q.ask, say: q.ask, cls: 'opts-words',
      options: q.options.map(o => ({ html: textOpt(o.label), value: o.value })), answer: q.answer, explain: q.why, hints: q.hints,
      fig: q.tb ? host => W.moonLog(host, { rows: q.tb.rows, hidden: false }) : host => { host.innerHTML = '<div class="show-card">' + art.zoneArt(2) + '</div>'; }
    });
  }

  STAGES.push({
    id: 2, name: 'สมุดบันทึกท้องฟ้า', topic: 'หลักฐานเวลาที่ดวงจันทร์ขึ้น', color: '#ff9f5a', skill: 'evidence',
    intro: [
      { who: 'mat', mood: 'wow', v: 's2a', text: VT('s2a'), show: showZone(2, 'สมุดบันทึกท้องฟ้า') },
      { who: 'tub', mood: 'laugh', v: 's2b', text: VT('s2b') },
      { who: 'mat', mood: 'think', v: 's2c', text: VT('s2c') },
      { who: 'mat', mood: 'cheer', v: 's2d', text: VT('s2d'), last: 'ลุยเลย!' }
    ],
    learn: [tLogObserve, tPredictPin],
    missions: 3,
    gen(level, i, run) {
      if (i === 0 || i === 1) return tRiseQ(level, run);
      return tClaim(2, run, host => W.moonLog(host, { rows: GEN.riseTable(1, 4).rows, hidden: false }), 'ดูตารางที่บันทึกไว้ เวลาแต่ละวันเหมือนกันไหม');
    },
    recap: [
      'หลักฐานเชิงประจักษ์ คือข้อมูลที่ได้จากการสังเกตและบันทึกจริง',
      'ดวงจันทร์ขึ้น{c:later}ทุกวัน ประมาณวันละ 50 นาที',
      'ใช้แบบรูปที่พบ ทำนายเวลาที่ดวงจันทร์จะขึ้นในวันต่อไปได้'
    ],
    teacher: [
      'ทำไมต้องสังเกตหลายวันติดกัน ไม่ใช่แค่คืนเดียว? (ชวนคิดเรื่องแบบรูปและหลักฐานที่เพียงพอ)',
      'ถ้าคืนใดมีเมฆบัง ข้อมูลจะหายไป นักเรียนจะทำอย่างไร? (บันทึกว่ามองไม่เห็น ไม่แต่งตัวเลขเอง)'
    ],
    book: [
      '**หลักฐาน** คือสิ่งที่เราสังเกตและจดไว้ได้จริง เช่น เวลาที่ดวงจันทร์ขึ้นแต่ละวัน',
      'ผลที่ได้: ดวงจันทร์ขึ้นช้าลงทุกวัน **ประมาณวันละ 50 นาที** (ตัวเลขนี้เป็นค่าประมาณ ตัวเลขจริงแต่ละวันอาจต่างกันเล็กน้อย)',
      'เมื่อเห็นแบบรูปแล้ว เราทำนายเวลาของวันต่อไปได้'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     ห้อง 3 ห้องจำลองแสงจันทร์ : แบบจำลองรูปร่างปรากฏ
     ═══════════════════════════════════════════════════════ */
  function tLabFour() {
    const steps = [
      { eps: 0, say: 'ลากดวงจันทร์ไปอยู่ระหว่างโลกกับดวงอาทิตย์ ภาพจากโลกจะเป็นอย่างไร?', exp: 'ซีกสว่างหันเข้าหาดวงอาทิตย์ ซีกมืดหันมาทางโลก จึงมองไม่เห็นดวงจันทร์' },
      { eps: 180, say: 'ทีนี้ลากไปฝั่งตรงข้ามดวงอาทิตย์ โลกอยู่ตรงกลาง!', exp: 'ซีกสว่างหันมาทางโลกเต็ม ๆ จึงเห็นดวงจันทร์เต็มดวง' },
      { eps: 90, say: 'ลากไปด้านล่างของโลก ดูภาพทางขวามือ!', exp: 'เห็นซีกสว่างครึ่งหนึ่งทางขวามือ นี่คือครึ่งดวงข้างขึ้น' },
      { eps: 270, say: 'ลากไปด้านบนของโลก ดูภาพทางขวามือ!', exp: 'เห็นซีกสว่างครึ่งหนึ่งทางซ้ายมือ นี่คือครึ่งดวงข้างแรม' }
    ];
    let rig = null, i = 0, ch = null, asked = false, ask = null, apiRef = null;
    return {
      skill: 'model', title: 'ลากดวงจันทร์รอบโลก', say: VT('t3a'), sayClip: 't3a',
      render(el, api) {
        apiRef = api;
        el.innerHTML = QA('lab-host', 'ch-host');
        ask = () => {
          if (asked) return;
          asked = true;
          api.say('ดวงจันทร์ครึ่งซีกที่หันเข้าหาดวงอาทิตย์ เป็นอย่างไรนะ?', 'cheer');
          ch = W.choice(hostOf(el, 'ch-host'), {
            cls: 'opts-words',
            options: [{ html: textOpt('สว่างอยู่เสมอ'), value: 'lit' }, { html: textOpt('มืดเสมอ'), value: 'dark' }, { html: textOpt('สว่างเฉพาะวันเต็มดวง'), value: 'full' }],
            onPick(v, b) {
              if (v === 'lit') { b.classList.add('good'); ch.lock(); api.correct('ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ แต่เรามองเห็นต่างกันตามตำแหน่งของดวงจันทร์', b); } else { ch.dim(b); api.wrong('ดูในแบบจำลอง ซีกที่หันเข้าหาแสงอาทิตย์เป็นอย่างไร', b); }
            }
          });
        };
        rig = W.phaseLab(hostOf(el, 'lab-host'), {
          eps: 45, discover: true, target: { name: 'ภารกิจที่ 1 จาก 4' },
          onSettle(eps) {
            if (i >= steps.length || dir(eps, steps[i].eps) > 14) return;
            api.say(steps[i].exp, 'cheer');
            audio.sfx('star');
            i++;
            if (i < steps.length) {
              setTimeout(() => { if (api.isCurrent()) { api.say(steps[i].say, 'talk'); rig.setTarget('ภารกิจที่ ' + (i + 1) + ' จาก 4'); } }, 3600);
            } else setTimeout(ask, 3600);
          }
        });
        setTimeout(() => api.say(steps[0].say, 'talk'), 2600);
      },
      hint(l) {
        if (l === 3 && rig && i < steps.length) rig.moveTo(steps[i].eps, 1100);
        return [i < steps.length ? steps[i].say : 'ลองตอบคำถามที่ขึ้นมาได้เลย', 'จับดวงจันทร์ที่วงโคจร แล้วลากรอบโลก ดวงอาทิตย์อยู่ทางซ้าย', 'มูนมูนพาดวงจันทร์ไปให้แล้ว ลองมองภาพทางขวา'][l - 1];
      },
      answer: 'ซีกของดวงจันทร์ที่หันเข้าหาดวงอาทิตย์สว่างเสมอ',
      solve() { if (rig) rig.setEps(180); i = steps.length; if (ask) ask(); if (ch) ch.mark('lit', 'good'); }
    };
  }

  function tLabHalf() {
    const target = { eps: 90, name: 'ทำให้ภาพจากโลกเป็นแบบนี้' };
    let rig = null, check = null;
    return {
      skill: 'model', title: 'ทำให้ภาพจากโลกตรงกับเป้าหมาย', say: VT('t3b'), sayClip: 't3b',
      render(el, api) {
        el.innerHTML = QA('lab-host');
        check = eps => {
          if (dir(eps, target.eps) <= 22) api.correct('ดวงจันทร์อยู่ด้านล่างของโลก เห็นสว่างครึ่งดวงทางขวา คือ ครึ่งดวงข้างขึ้น', el);
          else api.wrong('ยังไม่ตรงกับเป้าหมาย ลองดูซีกสว่างของภาพทางขวา', el);
        };
        rig = W.phaseLab(hostOf(el, 'lab-host'), { eps: 235, showName: false, target: { name: target.name, img: target.eps }, onSettle: check });
      },
      hint(l) {
        if (l === 3 && rig) rig.moveTo(target.eps, 1100, () => check && check(target.eps));
        return ['เป้าหมายคือสว่างครึ่งดวงทางขวามือ ลองลากดูทีละน้อย', 'ซีกสว่างทางขวา ต้องให้ดวงจันทร์อยู่ด้านล่างของโลก', 'มูนมูนพาไปให้แล้ว ลองปล่อยมือที่จุดนั้น'][l - 1];
      },
      answer: 'ดวงจันทร์อยู่ด้านล่างของโลก เห็นสว่างครึ่งดวงทางขวา',
      solve() { if (rig) rig.setEps(target.eps); }
    };
  }

  function tLabTarget(level, run) {
    const t = GEN.phaseTarget(level, U(run, 'lab'));
    const start = mod(t.eps + pick([90, 135, 180, 225, 270]), 360);
    let rig = null;
    const wax = SK.PHASES[t.idx].wax;
    return {
      skill: 'model', title: 'ทำให้เห็น “' + SK.PHASES[t.idx].n + '” จากโลก', say: 'ลากดวงจันทร์รอบโลก ให้ภาพจากโลกเป็น ' + SK.PHASES[t.idx].n + '!',
      render(el, api) {
        el.innerHTML = QA('lab-host');
        rig = W.phaseLab(hostOf(el, 'lab-host'), {
          eps: start, showName: false, target: { name: SK.PHASES[t.idx].long, img: level < 3 ? t.eps : null },
          onSettle(eps) {
            if (dir(eps, t.eps) <= 22) { if (SK.know) SK.know('moon', t.idx); api.correct('ถูกต้อง! ตำแหน่งนี้เรามองเห็นดวงจันทร์เป็น ' + SK.PHASES[t.idx].long, el); } else api.wrong('ภาพยังไม่ตรงกับเป้าหมาย', el);
          }
        });
      },
      hint(l) {
        if (l === 3 && rig) rig.moveTo(t.eps, 1100);
        return ['ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ ลองลากแล้วดูภาพทางขวา', wax === true ? 'ข้างขึ้นสว่างทางขวามือ ดวงจันทร์ต้องอยู่ด้านล่างของโลก' : wax === false ? 'ข้างแรมสว่างทางซ้ายมือ ดวงจันทร์ต้องอยู่ด้านบนของโลก' : t.idx === 0 ? 'จันทร์ดับ ต้องอยู่ระหว่างโลกกับดวงอาทิตย์' : 'เต็มดวง ต้องอยู่ตรงข้ามดวงอาทิตย์', 'มูนมูนพาไปที่ตำแหน่งที่ถูกให้แล้ว'][l - 1];
      },
      answer: 'ตำแหน่งนี้เห็น ' + SK.PHASES[t.idx].long,
      solve() { if (rig) rig.setEps(t.eps); }
    };
  }

  function tPosShape(level, run) {
    const q = GEN.pos2shape(level, U(run, 'p2s'));
    return taskChoice({
      skill: 'model', title: 'ดวงจันทร์อยู่ตรงนี้ จะเห็นรูปร่างอะไรจากโลก?', say: 'ดูตำแหน่งดวงจันทร์ แล้วเลือกรูปร่างที่เห็นจากโลก!', cls: 'opts-3 opts-moon',
      options: q.options.map(i => ({ html: moonOpt(i, true), value: i })), answer: q.idx,
      explain: 'ตำแหน่งนี้ เรามองเห็นดวงจันทร์เป็น ' + SK.PHASES[q.idx].long, wrongMsg: i => 'ภาพนั้นคือ ' + SK.PHASES[i].n + ' ลองดูซีกสว่างอีกที',
      hints: ['ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ', 'ลองนึกว่าเรายืนบนโลก มองไปที่ดวงจันทร์ เห็นซีกสว่างด้านไหน', 'ลองคิดแบบเดียวกับที่ลากในห้องทดลองมาแล้ว'],
      fig: host => W.phaseLab(host, { eps: q.eps, hideView: true, showName: false, static: true }),
      onRight: () => { if (SK.know) SK.know('moon', q.idx); },
      fx3: b => { if (b && b.showView) b.showView(); }
    });
  }

  function tShapePos(level, run) {
    const q = GEN.shape2pos(level, U(run, 's2p'));
    return taskChoice({
      skill: 'model', title: 'ภาพนี้เกิดจากตำแหน่งดวงจันทร์แบบไหน?', say: 'ดูรูปร่างที่เห็นจากโลก แล้วเลือกตำแหน่งดวงจันทร์ที่ถูก!', cls: 'opts-3 opts-orbit',
      options: q.options.map(i => ({ html: miniOrbit(SK.epsOfIdx(i)), value: i })), answer: q.idx,
      explain: SK.PHASES[q.idx].long + ' เกิดเมื่อดวงจันทร์อยู่ตำแหน่งนี้', wrongMsg: () => 'ตำแหน่งนั้นจะให้ภาพอีกแบบหนึ่ง',
      hints: ['ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ', 'ลองหมุนภาพในใจ ว่าจากโลกมองเห็นซีกสว่างด้านไหน', 'ตัดตัวเลือกที่ซีกสว่างหันไม่ถูกทางออกก่อน'],
      fig: host => { host.innerHTML = '<div class="show-card"><div class="big-moon">' + art.moon(SK.epsOfIdx(q.idx), { glow: true }) + '</div><p class="show-cap">ภาพที่เห็นจากโลก</p></div>'; }
    });
  }

  function tConcept(run) {
    const q = GEN.moonConcept(U(run, 'concept'));
    const all = [q.ans].concat(q.wrongs);
    return taskChoice({
      skill: 'model', title: q.ask, say: q.ask, cls: 'opts-words',
      options: SK.shuffle(all).map(o => ({ html: textOpt(o.label), value: o.value })), answer: q.ans.value, explain: q.why, hints: q.hints,
      fig: host => W.phaseLab(host, { eps: 120, showName: true })
    });
  }

  STAGES.push({
    id: 3, name: 'ห้องจำลองแสงจันทร์', topic: 'แบบจำลองรูปร่างปรากฏของดวงจันทร์', color: '#ffb21f', skill: 'model',
    intro: [
      { who: 'mat', mood: 'wow', v: 's3a', text: VT('s3a'), show: showZone(3, 'ห้องจำลองแสงจันทร์') },
      { who: 'tub', mood: 'laugh', v: 's3b', text: VT('s3b') },
      { who: 'mat', mood: 'think', v: 's3c', text: VT('s3c') },
      { who: 'mat', mood: 'cheer', v: 's3d', text: VT('s3d'), last: 'ลุยเลย!' }
    ],
    learn: [tLabFour, tLabHalf],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tLabTarget(level, run);
      if (i === 1) return level >= 3 ? tShapePos(level, run) : tPosShape(level, run);
      return Math.random() < 0.5 ? tConcept(run) : tClaim(3, run, host => W.phaseLab(host, { eps: 100, showName: true }), 'ลากดวงจันทร์ในแบบจำลอง แล้วสังเกตซีกที่สว่างกับภาพจากโลก');
    },
    recap: [
      'ดวงจันทร์ไม่มีแสงในตัวเอง เรามองเห็นเพราะสะท้อนแสงอาทิตย์',
      'ซีกของดวงจันทร์ที่หันเข้าหาดวงอาทิตย์สว่างเสมอ',
      'ดวงจันทร์โคจรรอบโลก มุมที่เรามองซีกสว่างเปลี่ยนไป จึงเห็นรูปร่างต่างกัน',
      '{c:newm}: ซีกมืดหันมาทางโลก · {c:full}: ซีกสว่างหันมาทางโลกเต็มที่'
    ],
    teacher: [
      'ให้นักเรียนใช้ลูกบอลกับไฟฉายในห้องมืด ทำแบบจำลองเดียวกับในเกม แล้วเทียบผลที่เห็น',
      'ทำไมเราไม่เห็นดวงจันทร์ตอนจันทร์ดับ ทั้งที่ดวงจันทร์ยังอยู่ที่เดิม? (ชวนอธิบายด้วยแบบจำลอง)'
    ],
    book: [
      'ดวงจันทร์**ไม่เปล่งแสงเอง** แต่สะท้อนแสงจากดวงอาทิตย์',
      'ดวงจันทร์โคจรรอบโลก ซีกที่หันเข้าหาดวงอาทิตย์**สว่างเสมอ**',
      'ตำแหน่งต่างกัน เรามองเห็นซีกสว่างได้ไม่เท่ากัน จึงเห็นเป็นเสี้ยว ครึ่งดวง หรือเต็มดวง',
      'ภาพที่เห็นจากโลก (มองจากประเทศไทย) ข้างขึ้นสว่างด้านขวา ข้างแรมสว่างด้านซ้าย'
    ]
  });
})();
