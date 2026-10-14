/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — กลไกภารกิจ (ส่วนที่ 2)
     fix  : ซ่อมป้ายชื่อที่คำเล็ก ๆ หาย — เลือกคำแล้วดูพัสดุถูกส่งไปจริง (Reading + CLUE → PROOF)
     gate : ประตู at / on / in — จัดการ์ดเวลาเข้าประตูที่ถูก (Reading / Listening)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { art, audio, ui, scene: SC, ENG, cards } = PP;
  const D = PP.D;
  const { esc, wait, h } = ui;
  const { hiPrep, iconHTML, dots } = cards;
  const START = [44, 262];
  const sentHTML = (text, preps) => '<div class="cap-sent">' + hiPrep(text, preps) + '</div>';

  /* กฎสั้น ๆ ภาษาไทย (ใช้ในคำใบ้) */
  const RULE = {
    at: 'at ใช้กับ "จุดเวลา" เช่น เวลาบนนาฬิกา (at seven o\'clock) หรือ at noon / at night',
    on: 'on ใช้กับ "วัน" และวันที่ เช่น on Monday, on 5 May, on my birthday',
    in: 'in ใช้กับ "ช่วงเวลายาว" เช่น เดือน ฤดู ปี และช่วงของวัน (in June, in the morning)',
    by: 'by ใช้กับ "ยานพาหนะ" เช่น by bus, by boat (ไม่ต้องมี a / the)',
    with: 'with ใช้กับ "เครื่องมือ" เช่น with scissors, with a pen'
  };
  PP.RULE = RULE;

  /* ═══════════ fix : ซ่อมป้าย ═══════════ */
  ENG.fix = (T, c) => {
    const { stage, panel } = c;
    let qi = 0, q, locked, qMiss, svg = null, objs = null;
    c.dbg(() => q);

    function blankHTML(w) { return '<span class="blank' + (w ? ' filled' : '') + '">' + (w ? esc(w) : '&nbsp;&nbsp;&nbsp;&nbsp;') + '</span>'; }
    function capHTML(w, cls) { return '<div class="cap-sent fixs' + (cls ? ' ' + cls : '') + '">' + esc(q.before) + blankHTML(w) + esc(q.after) + '</div>'; }
    function load() {
      q = T.qs[qi]; qMiss = 0; locked = false; svg = null;
      c.resetHint();
      if (q.kind === 'place') {
        const e = q.entry;
        objs = SC.layoutFor(e);
        const photo = SC.ofEntry(e, { cls: 'photo' });
        stage.innerHTML = '<div class="scene-wrap">' + SC.svg({ env: SC.OBJ[objs[0].o].env, objs, items: [{ i: e.i, x: START[0], y: START[1], mv: true, id: 'pk', prep: 'on' }], cls: 'explore' }) +
          '<div class="photo-card"><small>ภาพที่ลูกค้าต้องการ</small>' + photo + '</div><div class="scene-cap">' + capHTML() + '</div></div>';
        svg = stage.querySelector('svg:not(.photo)');
      } else {
        stage.innerHTML = '<div class="fix-card"><div class="fc-ic">' + q.iconHTML + '</div><div class="scene-cap">' + capHTML() + '</div></div>';
      }
      panel.innerHTML = '<div class="q-card">' + dots(qi, T.qs.length) + '<p class="q-th">' + esc(q.inst || 'เลือกคำเล็ก ๆ ที่หายไป') + '</p><div class="word-tiles' + (q.options.length > 2 ? ' n3' : '') + '">' +
        q.options.map((w, k) => '<button type="button" class="word-tile" data-k="' + k + '"><b>' + w + '</b><small>' + esc(PP.THshort[w]) + '</small></button>').join('') + '</div><div class="q-listen"></div><div class="q-why hidden"></div></div>';
      panel.querySelectorAll('.word-tile').forEach(b => b.addEventListener('click', () => choose(+b.dataset.k, b)));
      ui.speakBtns(panel.querySelector('.q-listen'), { id: q.audioId, text: q.sentence, who: 'pip' });
      c.say({ id: null, en: q.before.trim() + ' ... ' + q.after.trim(), th: q.th || 'เลือกคำเล็ก ๆ ให้ป้ายสมบูรณ์' });
    }
    async function choose(k, b) {
      if (locked) return;
      const w = q.options[k];
      audio.sfx('tile');
      locked = true;
      stage.querySelector('.scene-cap').innerHTML = capHTML(w);
      if (q.kind === 'place' && svg) {
        const e = q.entry;
        const sp = SC.fit(e, objs, w);
        if (sp) {
          SC.moveTo(svg, 'pk', sp[0], sp[1], w);
          await wait(700); audio.sfx('drop');
          await wait(450);
        } else {
          /* ใช้ไม่ได้ : พัสดุกระโดดไปทางวัตถุแล้วเด้งกลับ */
          const ox = objs[0].x;
          SC.moveTo(svg, 'pk', ox - 60, SC.FLOOR, 'on'); await wait(600);
          audio.sfx('nope'); ui.puff(svg.querySelector('.slot.pk'));
          await wait(250);
        }
      } else await wait(350);
      if (!c.alive()) return;
      if (w === q.answer) {
        b.classList.add('right'); audio.sfx('check'); ui.sparkle(b, 16);
        stage.querySelector('.scene-cap').innerHTML = capHTML(w, 'ok');
        stage.querySelector('.scene-cap').classList.add('stamp');
        audio.sfx('stamp');
        const wy = panel.querySelector('.q-why');
        wy.innerHTML = '<span class="why-en">' + hiPrep(q.sentence, [q.answer]) + '</span>' + (q.why ? '<small>' + esc(q.why) + '</small>' : ''); wy.classList.remove('hidden');
        if (qi === T.qs.length - 1) return c.win({ id: q.audioId, en: q.sentence, th: q.why || '' }, b);
        await c.say({ id: q.audioId, en: q.sentence, th: q.why || '', mood: 'cheer' });
        if (!c.alive()) return;
        await wait(200);
        qi++; load();
      } else {
        qMiss++; b.classList.add('wrong'); b.disabled = true;
        if (svg) SC.moveTo(svg, 'pk', START[0], START[1], 'on');
        stage.querySelector('.scene-cap').innerHTML = capHTML();
        locked = false;
        c.miss(q.wrongText ? q.wrongText(w) : 'ยังไม่ใช่นะ ดูภาพอีกที', b);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
      }
    }
    c.hintText(lv => (q.hints || [])[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (lv >= 2) { const g = panel.querySelector('.word-tile[data-k="' + q.options.indexOf(q.answer) + '"]'); if (lv >= 3 && g) g.classList.add('pulse'); }
      if (lv >= 2) { const ph = stage.querySelector('.photo-card'); if (ph) ph.classList.add('glow'); }
      if (lv >= 3) { const wrongs = Array.from(panel.querySelectorAll('.word-tile')).filter(x => q.options[+x.dataset.k] !== q.answer && !x.disabled); D.sample(wrongs, Math.max(0, wrongs.length - 1)).forEach(x => { x.disabled = true; x.classList.add('off'); }); }
    });
    load();
  };

  /* ═══════════ gate : ประตู at / on / in ═══════════ */
  ENG.gate = (T, c) => {
    const { stage, panel } = c;
    let i = 0, qMiss = 0, locked = false, cur = null, drag = null;
    const cardsL = T.cards, gates = T.gates;
    const counts = {}; gates.forEach(g => { counts[g] = []; });
    c.dbg(() => ({ i, cur, cardsL }));
    const METAPH = { at: 'จุด', on: 'วัน', in: 'ช่วงยาว' };
    stage.innerHTML = '<div class="gate-stage"><div class="belt"><div class="belt-line"></div><div class="gcard-host"></div></div>' +
      '<div class="gates n' + gates.length + '">' + gates.map(g => '<button type="button" class="gate" data-g="' + g + '"><span class="g-stack"></span><span class="g-door"><b>' + g + '</b><small>' + METAPH[g] + '</small></span></button>').join('') + '</div></div>';
    const host = stage.querySelector('.gcard-host');
    function paintPanel() {
      panel.innerHTML = '<div class="q-card">' + dots(i, cardsL.length) + '<p class="q-th">' + esc(T.inst || 'ส่งการ์ดเวลาเข้าประตูที่ถูก (ลากหรือแตะประตู)') + '</p><div class="q-listen"></div><div class="rule-box hidden"></div></div>';
      ui.speakBtns(panel.querySelector('.q-listen'), { id: cur ? cur.id : null, text: cur ? cur.text : '', who: 'pip' });
    }
    function next() {
      if (i >= cardsL.length) return;
      cur = cardsL[i]; locked = false; qMiss = 0; c.resetHint();
      host.innerHTML = '<div class="gcard pop-in" data-id="' + cur.k + '"><div class="gc-ic">' + iconHTML(cur.icon, 84) + '</div><div class="gc-w">' + esc(cur.w) + '</div></div>';
      paintPanel();
      bindCard();
      c.say(T.sayEach ? { id: cur.id, en: cur.text, th: '', hide: true } : { en: cur.w, th: 'ใช้ at, on หรือ in?' });
    }
    function bindCard() {
      const el = host.querySelector('.gcard');
      el.addEventListener('pointerdown', e => {
        if (locked) return;
        const r = el.getBoundingClientRect();
        drag = { ox: e.clientX - r.left, oy: e.clientY - r.top, x0: r.left, y0: r.top, moved: false };
        try { el.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      el.addEventListener('pointermove', e => {
        if (!drag) return;
        drag.moved = true; el.classList.add('drag');
        el.style.transform = 'translate(' + (e.clientX - drag.ox - drag.x0) + 'px,' + (e.clientY - drag.oy - drag.y0) + 'px) scale(1.08)';
        el.style.pointerEvents = 'none';
        const under = document.elementFromPoint(e.clientX, e.clientY);
        el.style.pointerEvents = '';
        stage.querySelectorAll('.gate').forEach(g => g.classList.toggle('near', !!under && g.contains(under)));
      });
      const end = e => {
        if (!drag) return;
        const d = drag; drag = null;
        el.style.pointerEvents = 'none';
        const under = document.elementFromPoint(e.clientX, e.clientY);
        el.style.pointerEvents = '';
        stage.querySelectorAll('.gate.near').forEach(g => g.classList.remove('near'));
        const g = under && under.closest('.gate');
        el.classList.remove('drag'); el.style.transform = '';
        if (g && d.moved) send(g.dataset.g, g);
      };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    }
    stage.querySelectorAll('.gate').forEach(g => g.addEventListener('click', () => { if (!locked) send(g.dataset.g, g); }));
    async function send(prep, g) {
      if (locked || !cur) return;
      locked = true;
      audio.sfx('pop');
      if (prep === cur.prep) {
        const el = host.querySelector('.gcard');
        el.classList.add('into');
        const rr = g.getBoundingClientRect(), r0 = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (rr.left + rr.width / 2 - r0.left - r0.width / 2) + 'px,' + (rr.top + rr.height * 0.35 - r0.top - r0.height / 2) + 'px) scale(.35)';
        await wait(420);
        audio.sfx('stamp'); ui.sparkle(g, 14);
        counts[prep].push(cur);
        g.querySelector('.g-stack').innerHTML = counts[prep].map(k => '<i>' + iconHTML(k.icon, 28) + '</i>').join('');
        g.classList.add('boing'); setTimeout(() => g.classList.remove('boing'), 500);
        const box = panel.querySelector('.rule-box'); box.innerHTML = '<b class="pp">' + prep + '</b> ' + esc(PP.RULE[prep].replace(/^\w+ /, '')); box.classList.remove('hidden');
        const k = cur;
        i++;
        if (i >= cardsL.length) { await audio.play(k.id, k.text, 'pip').catch(() => {}); return c.win({ en: k.text, th: '' }, g); }
        await c.say({ id: k.id, en: k.text, th: '', mood: 'cheer' });
        if (!c.alive()) return;
        await wait(150);
        next();
      } else {
        qMiss++; g.classList.add('wrong'); setTimeout(() => g.classList.remove('wrong'), 600);
        const el = host.querySelector('.gcard'); ui.shake(el);
        await wait(450);
        locked = false;
        c.miss(PP.RULE[cur.prep] ? 'ลองคิดดู: "' + cur.w + '" เป็นเวลาแบบไหน?' : 'ลองอีกที', g);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
      }
    }
    c.hintText(lv => cur ? [PP.RULE[cur.prep], 'ปิ๊บเปิดไฟที่ประตูให้แล้ว ลองส่งการ์ดเข้าประตูนั้น', 'เหลือประตูเดียวให้เลือกแล้ว'][Math.min(lv, 3) - 1] : '');
    c.onHint(lv => {
      if (locked || !cur) return;
      if (lv >= 2) { const g = stage.querySelector('.gate[data-g="' + cur.prep + '"]'); if (g) g.classList.add('hl'); }
      if (lv >= 3) stage.querySelectorAll('.gate').forEach(g => { if (g.dataset.g !== cur.prep) g.classList.add('dim'); });
    });
    next();
  };
})();
