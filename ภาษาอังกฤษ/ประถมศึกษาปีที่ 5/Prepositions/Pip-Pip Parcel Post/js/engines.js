/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — กลไกภารกิจ (ส่วนที่ 1)
     explore : สำรวจ — แตะคำบุพบทแล้วดูพัสดุเคลื่อนไปจริง (CLUE → PROOF)
     drop    : ฟังคำสั่งแล้วลาก/แตะวางพัสดุให้ถูกที่ (Listening)
     pick    : ฟัง/อ่านแล้วเลือกภาพ ไอคอน หรือคำ (Listening / Reading)
     notes   : อ่านโน้ต แตะหาคำเล็ก ๆ แล้วตอบคำถาม (Reading)
   ทุกกลไกได้รับ c = { stage, panel, T, alive, say, win, miss, hint, resetHint, onHint, hintText, dbg }
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { art, audio, ui, scene: SC } = PP;
  const D = PP.D;
  const { esc, wait, h } = ui;
  const ENG = PP.ENG = {};

  /* ── ความหมายไทยของคำบุพบท (แสดงใต้คำ) ── */
  PP.TH = { in: 'ใน', on: 'บน', at: 'ที่ / ตรง', under: 'ใต้', above: 'เหนือ', between: 'ระหว่าง', by: 'โดย (ยานพาหนะ)', with: 'ด้วย (เครื่องมือ)' };
  PP.THshort = { in: 'ใน', on: 'บน', at: 'ที่ / ตรง', under: 'ใต้', above: 'เหนือ (ลอยอยู่)', between: 'ระหว่าง', by: 'โดย', with: 'ด้วย' };

  const START = [44, 262];
  const dots = (i, n) => '<div class="q-prog">' + Array.from({ length: n }, (_, k) => '<i class="qd' + (k < i ? ' done' : k === i ? ' now' : '') + '"></i>').join('') + '</div>';

  /* ── ไอคอนเวลา / การ์ด ── */
  function iconHTML(ic, size) {
    size = size || 64;
    if (ic[0] === 'clock') return art.clockFace(ic[1], ic[2], size);
    if (ic[0] === 'thing') return art.thing(ic[1], size);
    if (ic[0] === 'cal') return art.calPage(ic[1], ic[2], size);
    if (ic[0] === 'month') return art.calPage(ic[1], '', size, 'month');
    return '';
  }
  /* ตัวห่อข้อความที่ไฮไลต์คำบุพบท */
  function hiPrep(text, preps) {
    const set = (preps || []).map(p => p.toLowerCase());
    return esc(text).replace(/[A-Za-z']+/g, w => set.indexOf(w.toLowerCase()) >= 0 ? '<b class="pp">' + w + '</b>' : w);
  }
  PP.cards = { iconHTML, hiPrep, dots };

  /* ตัดตัวเลือกผิดออก (คำใบ้ระดับ 3) */
  function eliminate(root, sel, ansK, n) {
    const wrongs = Array.from(root.querySelectorAll(sel)).filter(b => +b.dataset.k !== ansK && !b.disabled);
    D.sample(wrongs, Math.max(0, Math.min(n == null ? 1 : n, wrongs.length - 1))).forEach(b => { b.disabled = true; b.classList.add('off'); });
  }
  function toPt(svg, e) {
    const m = svg.getScreenCTM(); if (!m) return null;
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(m.inverse());
  }
  const sentHTML = (text, preps) => '<div class="cap-sent">' + hiPrep(text, preps) + '</div>';

  /* ═══════════ explore : สำรวจ ═══════════ */
  ENG.explore = (T, c) => {
    const { stage, panel } = c;
    const seen = {};
    let busy = false;
    const tiles = (words, small) => '<div class="word-tiles' + (words.length > 2 ? ' n3' : '') + '">' + words.map(w => '<button type="button" class="word-tile" data-w="' + w + '"><b>' + w + '</b><small>' + esc((small || PP.THshort)[w]) + '</small></button>').join('') + '</div>';
    panel.innerHTML = '<div class="q-card"><p class="q-th">' + esc(T.inst) + '</p>' + tiles(T.words) + '<div class="chips explore-chips"></div></div>';
    c.hintText(() => T.hint);
    c.dbg(() => ({ seen, words: T.words }));
    const markSeen = async (w, tile) => {
      seen[w] = true; tile.classList.add('seen');
      if (T.words.every(x => seen[x])) { await wait(500); if (c.alive()) c.win(T.ok || 'yay3', stage); }
    };

    if (T.kind === 'place') {
      const objs = T.layout.pair ? SC.pairPositions(T.layout.pair[0], T.layout.pair[1]).map(q => ({ o: q[0], x: q[1] })) : T.layout.objs.map(q => ({ o: q[0], x: q[1] }));
      stage.innerHTML = '<div class="scene-wrap">' + SC.svg({ env: T.layout.env, objs, items: [{ i: 'parcel', x: START[0], y: START[1], mv: true, id: 'pk', prep: 'on' }], cls: 'explore' }) + '<div class="scene-cap"><span class="cap-hint">แตะคำด้านข้าง แล้วดูพัสดุเคลื่อนที่</span></div></div>';
      const svg = stage.querySelector('svg'), cap = stage.querySelector('.scene-cap');
      panel.querySelectorAll('.word-tile').forEach(t => t.addEventListener('click', async () => {
        if (busy) return;
        const w = t.dataset.w, e = T.entries[w];
        busy = true; audio.sfx('pop');
        const sp = w === 'between' ? [200, SC.FLOOR] : SC.spotOf(objs, w, e.o);
        SC.moveTo(svg, 'pk', sp[0], sp[1], w);
        setTimeout(() => audio.sfx('drop'), 420);
        cap.innerHTML = sentHTML(e.text, [w]);
        panel.querySelectorAll('.word-tile').forEach(x => x.classList.toggle('on', x === t));
        await audio.play(e.id, e.text, 'pip', { onProgress: ui.karaoke(cap) }).catch(() => {});
        busy = false;
        if (c.alive()) markSeen(w, t);
      }));
      c.say(T.intro || { en: 'Tap a word!', th: 'แตะคำเลย!' });
    } else if (T.kind === 'time') {
      const metaphor = {
        at: '<svg viewBox="0 0 120 50"><path d="M8 34 h104" stroke="#2a2350" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="34" r="9" fill="#ff5c6c" stroke="#2a2350" stroke-width="3"/><text x="60" y="14" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="13" fill="#2a2350">a point</text></svg>',
        on: '<svg viewBox="0 0 120 50"><rect x="38" y="10" width="44" height="34" rx="7" fill="#fff" stroke="#2a2350" stroke-width="3"/><path d="M38 20 h44" stroke="#2a2350" stroke-width="3"/><text x="60" y="38" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="15" fill="#2a2350">a day</text></svg>',
        in: '<svg viewBox="0 0 120 50"><rect x="8" y="16" width="104" height="22" rx="11" fill="#3fd6a8" stroke="#2a2350" stroke-width="3"/><text x="60" y="33" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="13" fill="#2a2350">a long time</text></svg>'
      };
      panel.querySelectorAll('.word-tile').forEach(t => t.insertAdjacentHTML('afterbegin', '<span class="meta-ic">' + metaphor[t.dataset.w] + '</span>'));
      stage.innerHTML = '<div class="ex-time"><p class="ex-hint">แตะ at / on / in เพื่อดูตัวอย่างเวลา</p><div class="ex-cards"></div></div>';
      const host = stage.querySelector('.ex-cards');
      const show = async (w, t) => {
        host.innerHTML = '';
        const cards = T.examples[w];
        cards.forEach((tc, i) => {
          const b = h('button', 'tcard pop-in', '<div class="tc-ic">' + iconHTML(tc.icon, 72) + '</div><div class="tc-t"><b class="pp">' + tc.prep + '</b> ' + esc(tc.w) + '</div>');
          b.type = 'button'; b.style.animationDelay = i * 0.12 + 's';
          b.addEventListener('click', () => { audio.sfx('pop'); audio.play(tc.id, tc.text, 'pip'); });
          host.appendChild(b);
        });
        panel.querySelectorAll('.word-tile').forEach(x => x.classList.toggle('on', x === t));
      };
      panel.querySelectorAll('.word-tile').forEach(t => t.addEventListener('click', async () => {
        if (busy) return;
        const w = t.dataset.w; busy = true; audio.sfx('stamp');
        await show(w, t);
        await audio.play(T.examples[w][0].id, T.examples[w][0].text, 'pip');
        busy = false;
        if (c.alive()) markSeen(w, t);
      }));
      c.say(T.intro || { en: 'Which little word? At, on or in?', th: 'ใช้คำไหนดี? at, on หรือ in?' });
    } else {
      stage.innerHTML = '<div class="ex-time"><p class="ex-hint">แตะ by / with แล้วเลือกของที่อยากฟัง</p><div class="ex-cards"></div></div>';
      const host = stage.querySelector('.ex-cards');
      panel.querySelectorAll('.word-tile').forEach(t => t.addEventListener('click', async () => {
        if (busy) return;
        const w = t.dataset.w; busy = true; audio.sfx('pop');
        host.innerHTML = '';
        const list = T.examples[w];
        list.forEach((m, i) => {
          const b = h('button', 'tcard pop-in', '<div class="tc-ic">' + art.thing(m.thing, 84) + '</div><div class="tc-t"><b class="pp">' + m.prep + '</b> ' + esc(m.n) + '</div>');
          b.type = 'button'; b.style.animationDelay = i * 0.1 + 's';
          b.addEventListener('click', () => { audio.sfx('pop'); audio.play(m.id, m.text, 'pip'); stage.querySelector('.ex-hint').innerHTML = hiPrep(m.text, [m.prep]); });
          host.appendChild(b);
        });
        panel.querySelectorAll('.word-tile').forEach(x => x.classList.toggle('on', x === t));
        await audio.play(list[0].id, list[0].text, 'pip');
        stage.querySelector('.ex-hint').innerHTML = hiPrep(list[0].text, [w]);
        busy = false;
        if (c.alive()) markSeen(w, t);
      }));
      c.say(T.intro || { en: 'By or with?', th: 'by หรือ with?' });
    }
  };

  /* ═══════════ drop : ฟังแล้ววางพัสดุ ═══════════ */
  ENG.drop = (T, c) => {
    const { stage, panel } = c;
    let ri = 0, d, svg, pk, locked, qMiss, drag = null, lastSpot = null;
    c.dbg(() => ({ d, T }));

    function load() {
      d = T.rounds[ri]; qMiss = 0; locked = false; lastSpot = null;
      c.resetHint();
      stage.innerHTML = '<div class="scene-wrap">' + SC.svg({ env: d.env, objs: d.objs, items: [{ i: 'parcel', x: START[0], y: START[1], mv: true, id: 'pk', prep: 'on' }], ghosts: d.ghosts, cls: 'drop' }) + '<div class="scene-cap"></div></div>';
      svg = stage.querySelector('svg'); pk = svg.querySelector('.slot.pk');
      panel.innerHTML = '<div class="q-card">' + dots(ri, T.rounds.length) + '<p class="q-th">ฟังแล้วลากพัสดุไปวางให้ถูกที่ (หรือแตะที่จุดเงา)</p><div class="q-listen"></div><div class="q-why hidden"></div></div>';
      ui.speakBtns(panel.querySelector('.q-listen'), { id: d.id, text: d.text, who: 'pip' });
      svg.querySelectorAll('.ghost').forEach(g => g.addEventListener('click', () => { if (!locked && !drag) place(d.spots.find(s => s.id === g.dataset.spot), false); }));
      bindDrag();
      c.say({ id: d.id, en: d.text, th: 'ฟังแล้ววางพัสดุ', hide: !T.showText });
    }
    function bindDrag() {
      svg.addEventListener('pointerdown', e => {
        if (locked || !e.target.closest('.pk')) return;
        const p = toPt(svg, e); if (!p) return;
        drag = { dx: 0, dy: 0 };
        const cur = new DOMMatrix(getComputedStyle(pk).transform);
        drag.dx = cur.m41 - p.x; drag.dy = cur.m42 - p.y;
        pk.classList.add('drag'); audio.sfx('lift');
        try { svg.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      svg.addEventListener('pointermove', e => {
        if (!drag) return;
        const p = toPt(svg, e); if (!p) return;
        const x = Math.max(10, Math.min(390, p.x + drag.dx)), y = Math.max(30, Math.min(268, p.y + drag.dy));
        pk.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        let best = null, bd = 9999;
        d.spots.forEach(s => { const dist = Math.hypot(s.x - x, s.y - y); if (dist < bd) { bd = dist; best = s; } });
        svg.querySelectorAll('.ghost').forEach(g => g.classList.toggle('near', best && bd < 46 && g.dataset.spot === best.id));
        drag.x = x; drag.y = y; drag.best = bd < 46 ? best : null;
      });
      const end = () => {
        if (!drag) return;
        const dr = drag; drag = null; pk.classList.remove('drag');
        svg.querySelectorAll('.ghost.near').forEach(g => g.classList.remove('near'));
        if (dr.best) place(dr.best, true); else { SC.moveTo(svg, 'pk', START[0], START[1], 'on'); }
      };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    }
    async function place(s, viaDrag) {
      if (!s || locked) return;
      locked = true; lastSpot = s;
      audio.sfx('drop');
      SC.moveTo(svg, 'pk', s.x, s.y, s.prep);
      const ok = s.id === d.target.id;
      const sent = 'The parcel is ' + s.prep + ' the ' + (s.o2 ? SC.objName(s.o, 'x') + ' and the ' + SC.objName(s.o2, 'x') : SC.objName(s.o, s.prep)) + '.';
      const cap = stage.querySelector('.scene-cap');
      cap.innerHTML = sentHTML(sent, [s.prep]);
      if (ok) {
        svg.querySelectorAll('.ghost').forEach(g => g.classList.add('gone'));
        ui.sparkle(pk, 18); audio.sfx('check');
        ui.guide.reveal();
        if (ri === T.rounds.length - 1) return c.win({ en: d.text, th: '' }, pk);
        await c.say({ id: null, en: 'Great!', th: 'เก่งมาก!', mood: 'cheer' });
        if (!c.alive()) return;
        await wait(250);
        ri++; load();
      } else {
        qMiss++;
        await wait(900);
        if (!c.alive()) return;
        SC.moveTo(svg, 'pk', START[0], START[1], 'on');
        cap.innerHTML = '';
        locked = false;
        c.miss(d.why(s), null);
        ui.guide.reveal();
        if (qMiss >= 2) c.hint(Math.min(3, qMiss + 1));
      }
    }
    c.hintText(lv => ['ฟังคำเล็ก ๆ ให้ชัด: ' + d.target.prep + ' แปลว่า ' + (PP.THshort[d.target.prep] || ''), 'ฟังชื่อของที่ต้องวางด้วยนะ — ลองกดฟังช้า ๆ (รูปเต่า)', 'ปิ๊บชี้จุดที่ถูกให้แล้ว ลองวางพัสดุตรงนั้น'][Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (lv >= 2) ui.guide.reveal();
      if (lv >= 3) { const g = svg.querySelector('.ghost[data-spot="' + d.target.id + '"]'); if (g) g.classList.add('hl'); }
    });
    load();
  };

  /* ═══════════ pick : เลือกภาพ / ไอคอน / คำ ═══════════ */
  /* ตัวเลือกจากรายการ q.options = [{html, label?}] , q.ans = ดัชนีคำตอบ */
  function pickCore(c, host, panel, T, onAnswer) {
    let qi = 0, q, locked, qMiss;
    const api = {
      get q() { return q; }, get qi() { return qi; },
      load(i) {
        qi = i; q = T.qs[qi]; qMiss = 0; locked = false; c.resetHint();
        const nOpt = q.options.length;
        host.innerHTML = '<div class="pick-grid n' + nOpt + (q.wide ? ' wide' : '') + '">' + q.options.map((o, k) => '<button type="button" class="pc ' + (o.cls || '') + '" data-k="' + k + '">' + o.html + (o.label ? '<span class="pc-l">' + esc(o.label) + '</span>' : '') + '</button>').join('') + '</div>';
        host.querySelectorAll('.pc').forEach(b => b.addEventListener('click', () => api.choose(+b.dataset.k, b)));
        panel.innerHTML = '<div class="q-card">' + dots(qi, T.qs.length) + '<p class="q-th">' + esc(q.inst || '') + '</p>' +
          (q.ask ? '<div class="q-ask"><b>' + esc(q.ask.en) + '</b><small>' + esc(q.ask.th || '') + '</small></div>' : '') +
          '<div class="q-listen"></div><div class="q-why hidden"></div></div>';
        const a = q.audio || (q.prompt && q.prompt.id ? q.prompt : null);
        if (a) ui.speakBtns(panel.querySelector('.q-listen'), { id: a.id, text: a.text || a.en, who: a.who || 'pip' });
        return q;
      },
      say() {
        if (q.noAuto) return c.say({ en: q.ask ? q.ask.en : '', th: q.ask ? q.ask.th : '', silent: true });
        if (q.audio) return c.say({ id: q.audio.id, en: q.audio.text, th: q.audio.th || '', hide: q.audio.hide, name: q.audio.name });
        if (q.prompt) return c.say(q.prompt);
      },
      choose(k, b) {
        if (locked) return;
        audio.sfx('tick');
        if (k === q.ans) { locked = true; b.classList.add('right'); audio.sfx('check'); ui.sparkle(b, 16); onAnswer(true, b, q); return; }
        qMiss++; b.classList.add('wrong'); b.disabled = true;
        onAnswer(false, b, q, qMiss);
      },
      lock() { locked = true; },
      miss() { return qMiss; },
      hint(lv) {
        if (locked) return;
        if (lv >= 2 && q.audio && q.audio.hide) ui.guide.reveal();
        if (lv >= 2) eliminate(host, '.pc', q.ans, 1);
        if (lv >= 3) { eliminate(host, '.pc', q.ans, 2); const g = host.querySelector('.pc[data-k="' + q.ans + '"]'); if (g) g.classList.add('pulse'); }
      },
      hintText(lv) { return (q.hints || [])[Math.min(lv, 3) - 1]; }
    };
    return api;
  }
  ENG.pick = (T, c) => {
    const { stage, panel } = c;
    const core = pickCore(c, stage, panel, T, async (ok, b, q, qMiss) => {
      if (!ok) {
        c.miss(q.missText || 'ลองฟัง/อ่านอีกครั้งนะ', b);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
        return;
      }
      const w = panel.querySelector('.q-why');
      if (q.why) { w.innerHTML = '<span class="why-en">' + hiPrep(q.why.en, q.why.preps || []) + '</span>' + (q.why.th ? '<small>' + esc(q.why.th) + '</small>' : ''); w.classList.remove('hidden'); }
      ui.guide.reveal();
      if (core.qi === T.qs.length - 1) return c.win(q.why ? { en: q.why.en, th: q.why.th || '', id: q.why.id, fileOnly: q.why.fileOnly } : null, b);
      await c.say(q.why ? { en: q.why.en, th: q.why.th || '', mood: 'cheer', id: q.why.id, fileOnly: q.why.fileOnly } : { en: 'Great!', th: 'เก่งมาก!', mood: 'cheer' });
      if (!c.alive()) return;
      await wait(200);
      core.load(core.qi + 1); core.say();
    });
    c.dbg(() => core.q);
    c.hintText(lv => core.hintText(lv));
    c.onHint(lv => core.hint(lv));
    core.load(0); core.say();
  };

  /* ═══════════ notes : อ่านโน้ต แตะหาคำเล็ก ๆ แล้วตอบ ═══════════ */
  ENG.notes = (T, c) => {
    const { stage, panel } = c;
    const targets = T.targets.slice();
    const need = T.targets.length;
    const found = [];
    let phase = 'find', locked = false, nMiss = 0, core = null;
    c.dbg(() => ({ phase, targets, found }));
    const lines = T.text.split('\n');
    const PREPS = ['in', 'on', 'at', 'under', 'above', 'between', 'by', 'with'];
    let html = '<div class="note-paper"><div class="note-clip"></div>';
    let idx = 0;
    lines.forEach(L => {
      html += '<p class="note-l">' + L.split(/(\s+)/).map(w => {
        if (/^\s+$/.test(w) || !w) return w;
        const bare = w.replace(/[^A-Za-z']/g, '').toLowerCase();
        const isP = PREPS.indexOf(bare) >= 0;
        return '<span class="kw nw' + (isP ? ' pr' : '') + '" data-i="' + (idx++) + '" data-w="' + bare + '" data-p="' + (isP ? 1 : 0) + '">' + esc(w) + '</span>';
      }).join('') + '</p>';
    });
    html += '</div>';
    stage.innerHTML = '<div class="note-wrap">' + html + '</div>';
    const paper = stage.querySelector('.note-paper');
    function paintPanel() {
      panel.innerHTML = '<div class="q-card"><p class="q-th">แตะหา "คำเล็ก ๆ" (คำบุพบท) ในโน้ตให้ครบ ' + need + ' คำ</p><div class="q-listen"></div><div class="chips">' +
        targets.map((w, i) => '<span class="chip find' + (i < found.length ? ' ok' : '') + '">' + (i < found.length ? art.icon('check') + esc(found[i]) : '?') + '</span>').join('') + '</div></div>';
      ui.speakBtns(panel.querySelector('.q-listen'), { id: 'note_' + T.id, text: T.text.replace(/\n/g, ' '), who: 'guest', onProgress: ui.karaoke(paper.parentNode, true) });
    }
    paintPanel();
    paper.querySelectorAll('.nw').forEach(sp => sp.addEventListener('click', async () => {
      if (phase !== 'find' || locked || sp.classList.contains('hit')) return;
      const w = sp.dataset.w;
      audio.sfx('tick');
      if (sp.dataset.p === '1') {
        sp.classList.add('hit'); found.push(w);
        audio.sfx('stamp'); ui.sparkle(sp, 10);
        audio.play('w_' + w, w, 'pip');
        paintPanel();
        if (found.length >= need) { phase = 'ask'; await wait(900); if (c.alive()) ask(); }
      } else {
        nMiss++;
        sp.classList.add('no'); setTimeout(() => sp.classList.remove('no'), 700);
        c.miss('"' + w + '" ไม่ใช่คำเล็ก ๆ ที่บอกที่ เวลา หรือวิธี ลองหาคำสั้น ๆ อย่าง ' + (T.targets.slice(0, 2).join(', ')) + ' ดูนะ', sp);
        if (nMiss >= 2) c.hint(Math.min(3, nMiss));
      }
    }));
    function ask() {
      stage.classList.add('ask');
      const qs = [T.q];
      const T2 = { qs };
      const host = h('div', 'ask-host'); stage.appendChild(host);
      core = pickCore(c, host, panel, T2, async (ok, b, q, qMiss) => {
        if (!ok) { c.miss(q.missText || 'กลับไปอ่านโน้ตอีกครั้งนะ', b); if (qMiss >= 2) c.hint(Math.min(3, qMiss)); return; }
        if (q.why) { const w = panel.querySelector('.q-why'); w.innerHTML = '<span class="why-en">' + hiPrep(q.why.en, q.why.preps || []) + '</span>'; w.classList.remove('hidden'); }
        c.win(q.why ? { en: q.why.en, th: q.why.th || '', id: q.why.id, fileOnly: q.why.fileOnly } : null, b);
      });
      core.load(0);
      c.resetHint();
      c.say(T.q.prompt || { en: T.q.ask.en, th: T.q.ask.th });
    }
    c.hintText(lv => phase === 'find'
      ? ['คำบุพบทมักอยู่หน้าชื่อสถานที่ วัน หรือเวลา เช่น "on Friday"', 'ปิ๊บทำเครื่องหมายคำที่ยังหาไม่เจอให้แล้ว', 'แตะคำที่เรืองแสงได้เลย'][Math.min(lv, 3) - 1]
      : core.hintText(lv));
    c.onHint(lv => {
      if (phase === 'ask') { core.hint(lv); return; }
      if (lv >= 2) {
        const left = Array.from(paper.querySelectorAll('.nw.pr:not(.hit)'));
        if (lv >= 2 && left[0]) left.forEach(x => x.classList.add('pulse-w'));
      }
    });
    c.say({ id: 'l_findWords', en: 'Find the little words!', th: 'หาคำเล็ก ๆ ให้เจอ!' });
  };
})();
