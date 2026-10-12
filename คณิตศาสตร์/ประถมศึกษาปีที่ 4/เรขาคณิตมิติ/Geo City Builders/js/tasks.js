/* ═══════════════════════════════════════════════════════════
   GEO CITY BUILDERS — กลไกกิจกรรม (Task Engines)
   ทุกกิจกรรมได้รับ c (context) จาก main.js:
     c.stage / c.panel  : พื้นที่กระดาน / แผงควบคุม
     c.say(id|text)     : ให้ตัวละครพูด
     c.win(lineId)      : ทำสำเร็จ
     c.miss(text, at)   : ตอบผิด (คืนจำนวนครั้งที่ผิดในข้อนี้)
     c.onHint(fn)       : ลงทะเบียนตัวช่วยภาพตามระดับคำใบ้ (1..3)
     c.alive()          : ข้อนี้ยังเล่นอยู่ไหม
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const GB = window.GB;
  const { art, audio, ui, geo } = GB;
  const { M } = geo;
  const { h, esc, sparkle, puff, floatText, shake, bounce } = ui;
  const sfx = (n, a) => audio.sfx(n, a);

  /* ── รูปเล็ก (SVG string) สำหรับการ์ด/ป้าย ── */
  function figSvg(f, w, hgt) {
    w = w || 170; hgt = hgt || 96;
    const cx = w / 2, cy = hgt / 2 + 6;
    let s = '<svg class="mini" viewBox="0 0 ' + w + ' ' + hgt + '" aria-hidden="true">';
    const ST = 'stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const arrow = (tip, from) => {
      const a = Math.atan2(tip.y - from.y, tip.x - from.x), z = 11;
      return '<path d="M' + (tip.x - z * Math.cos(a - 0.5)) + ' ' + (tip.y - z * Math.sin(a - 0.5)) + 'L' + tip.x + ' ' + tip.y + 'L' + (tip.x - z * Math.cos(a + 0.5)) + ' ' + (tip.y - z * Math.sin(a + 0.5)) + '" ' + ST + '/>';
    };
    const dot = (p, n, side) => '<circle cx="' + p.x + '" cy="' + p.y + '" r="5.5" fill="currentColor"/>' +
      (n ? '<text x="' + p.x + '" y="' + (p.y + (side || -14)) + '" text-anchor="middle" class="mini-l">' + n + '</text>' : '');
    if (f.k === 'seg' || f.k === 'ray' || f.k === 'line') {
      const r = (f.rot || 0) * Math.PI / 180;
      const cs = Math.abs(Math.cos(r)) || 1e-6, sn = Math.abs(Math.sin(r)) || 1e-6;
      /* ระยะครึ่งเส้นที่ใส่ในกรอบได้ (เผื่อขอบ 10) */
      const room = Math.min((w / 2 - 10) / cs, (hgt / 2 - 12) / sn);
      const d = Math.min(36, room * 0.58);
      const a = { x: cx - d * Math.cos(r), y: cy + d * Math.sin(r) }, b = { x: cx + d * Math.cos(r), y: cy - d * Math.sin(r) };
      const E = Math.max(10, Math.min(30, room - d));
      /* ต่อเส้นเลยจุด q ออกไปในทิศ p→q */
      const far = (p, q) => ({ x: q.x + (q.x - p.x) / (2 * d) * E, y: q.y + (q.y - p.y) / (2 * d) * E });
      let p1 = a, p2 = b;
      if (f.k !== 'seg') p2 = far(a, b);
      if (f.k === 'line') p1 = far(b, a);
      s += '<path d="M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y + '" ' + ST + '/>';
      if (f.k !== 'seg') s += arrow(p2, a);
      if (f.k === 'line') s += arrow(p1, b);
      const L = f.l || '';
      if (f.k === 'line') s += dot(a, L[0]) + dot(b, L[1]);
      else s += dot(a, L[0]) + dot(b, L[1]);
    } else if (f.k === 'ang') {
      const big = f.deg >= 180 || (f.rot || 0) > 45;
      const v = big ? { x: cx, y: hgt * 0.52 } : { x: cx - w * 0.22, y: hgt * 0.8 };
      const R = big ? hgt * 0.4 : Math.min(w * 0.5, hgt * 0.68), rot = f.rot || 0;
      const p1 = M.pol(v, rot, R), p2 = M.pol(v, rot + f.deg, R);
      const ar = f.deg === 90 ? 0 : 16;
      if (f.deg === 90) {
        const a = M.pol(v, rot, 12), b = M.pol(v, rot + 90, 12);
        s += '<path d="M' + a.x + ' ' + a.y + 'L' + (a.x + b.x - v.x) + ' ' + (a.y + b.y - v.y) + 'L' + b.x + ' ' + b.y + '" stroke="currentColor" stroke-width="2.5" fill="none"/>';
      } else {
        const q1 = M.pol(v, rot, ar), q2 = M.pol(v, rot + f.deg, ar);
        s += '<path d="M' + q1.x + ' ' + q1.y + 'A' + ar + ' ' + ar + ' 0 ' + (f.deg > 180 ? 1 : 0) + ' 0 ' + q2.x + ' ' + q2.y + '" stroke="#ff5c8a" stroke-width="3.5" fill="none"/>';
      }
      s += '<path d="M' + p1.x + ' ' + p1.y + 'L' + v.x + ' ' + v.y + 'L' + p2.x + ' ' + p2.y + '" ' + ST + '/>';
      s += '<circle cx="' + v.x + '" cy="' + v.y + '" r="4.5" fill="currentColor"/>';
    }
    return s + '</svg>';
  }

  /* ── ส่วนประกอบเลย์เอาต์มาตรฐาน ── */
  function btn(cls, iconName, label) {
    const b = h('button', 'btn ' + (cls || ''), (iconName ? art.icon(iconName) : '') + (label ? '<span>' + label + '</span>' : ''));
    b.type = 'button';
    return b;
  }
  function note(c, html) {
    let n = c.panel.querySelector('.p-note');
    if (!n) { n = h('div', 'p-note'); c.panel.prepend(n); }
    n.innerHTML = html;
    return n;
  }
  const pulse = el => { if (!el) return; el.classList.remove('pulse'); void el.getBoundingClientRect(); el.classList.add('pulse'); };
  const scr = (B, p) => B.screen(p);
  /* ส่วนโค้งด้านในของมุม (ไม่เกิน 180 องศา) */
  function arcIn(B, layer, v, a, b, r) {
    let t1 = M.dir(v, a), t2 = M.dir(v, b);
    if (((t2 - t1) + 360) % 360 > 180) { const t = t1; t1 = t2; t2 = t; }
    return B.arc(layer, v, t1, t2, r, 'b-arc');
  }

  const ENG = {};

  /* ═════════ 1) ระนาบและจุด ═════════ */
  ENG.plane = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 7, cls: 'plane' });
    [['M6 0.6l-0.4 0.5h0.8z', 'up'], ['M6 6.4l-0.4 -0.5h0.8z', 'down'], ['M0.6 3.5l0.5 -0.4v0.8z', 'left'], ['M11.4 3.5l-0.5 -0.4v0.8z', 'right']]
      .forEach(([d, k]) => B.path('deco', d, 'plane-arrow pa-' + k));
    B.text('deco', 0.35, 0.6, 'ระนาบ แผ่ไปทุกทิศไม่สิ้นสุด', { class: 'b-cap' });
    const chips = h('div', 'chips');
    ['A', 'B', 'C'].forEach(n => chips.appendChild(h('span', 'chip', 'จุด ' + n)));
    c.panel.appendChild(chips);
    note(c, 'แตะบนแผ่นพิมพ์เขียว เพื่อวางจุด');
    const pts = [];
    c.seq(['t11a', 't11b']);
    let ghost = null;
    c.onHint(() => {
      const spots = [{ x: 3, y: 2.5 }, { x: 8.5, y: 2 }, { x: 6, y: 4.8 }];
      const s = spots.find(q => !pts.some(p => M.dist(p, q) < 1.4)) || spots[0];
      if (ghost) ghost.remove();
      ghost = B.el('ui', 'circle', { cx: s.x, cy: s.y, r: 0.5, class: 'ghost-ring' });
    });
    B.on({
      down(p) {
        if (pts.length >= 3 || !c.alive()) return;
        p = { x: Math.max(0.6, Math.min(11.4, p.x)), y: Math.max(0.6, Math.min(6.2, p.y)) };
        if (pts.some(q => M.dist(q, p) < 1.1)) { sfx('nope'); return; }
        if (ghost) { ghost.remove(); ghost = null; }
        const n = 'ABC'[pts.length];
        pts.push(p);
        const g = B.point('base', p, n, { cls: 'pop-in big' });
        sfx('point', pts.length - 1);
        sparkle(scr(B, p), 10);
        chips.children[pts.length - 1].classList.add('on');
        bounce(chips.children[pts.length - 1]);
        if (pts.length === 3) setTimeout(() => c.win('t11ok', scr(B, p)), 500);
        void g;
      }
    });
  };

  /* ═════════ 2) ลากสร้างเส้น แล้วเลือกชนิดเส้น ═════════ */
  const SCENES = {
    bridge(B, T) {
      let d = '';
      for (let y = 1.2; y < 7; y += 1.1) d += 'M0 ' + y + ' q0.75 -0.25 1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0';
      B.path('deco', d, 'waves');
      [T.a, T.b].forEach(p => { B.el('deco', 'ellipse', { cx: p.x, cy: p.y + 0.35, rx: 1.3, ry: 0.75, class: 'island' }); B.el('deco', 'path', { d: 'M' + (p.x - 0.7) + ' ' + (p.y - 0.2) + 'l0.3 -0.6 l0.3 0.6z', class: 'tree' }); });
    },
    light(B, T) {
      let d = '';
      for (let y = 1.2; y < 7; y += 1.1) d += 'M0 ' + y + ' q0.75 -0.25 1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0';
      B.path('deco', d, 'waves');
      const a = T.a;
      B.path('deco', 'M' + (a.x - 0.45) + ' ' + (a.y + 1.1) + 'L' + (a.x - 0.25) + ' ' + (a.y - 0.2) + 'H' + (a.x + 0.25) + 'L' + (a.x + 0.45) + ' ' + (a.y + 1.1) + 'Z', 'lighthouse');
      B.path('deco', 'M' + (a.x - 0.25) + ' ' + (a.y + 0.3) + 'H' + (a.x + 0.25) + 'M' + (a.x - 0.32) + ' ' + (a.y + 0.75) + 'H' + (a.x + 0.32), 'lh-band');
      const b = T.b;
      B.path('deco', 'M' + (b.x - 0.6) + ' ' + (b.y + 0.3) + 'H' + (b.x + 0.6) + 'L' + (b.x + 0.35) + ' ' + (b.y + 0.65) + 'H' + (b.x - 0.35) + 'Z M' + b.x + ' ' + (b.y + 0.3) + 'V' + (b.y - 0.5) + 'L' + (b.x + 0.45) + ' ' + (b.y + 0.15) + 'Z', 'ship');
    },
    rail(B, T) {
      B.el('deco', 'rect', { x: 0, y: T.a.y + 0.45, width: B.W, height: B.H, class: 'ground' });
      [T.a, T.b].forEach(p => {
        B.path('deco', 'M' + (p.x - 0.7) + ' ' + (p.y - 0.25) + 'v-0.8 h1.4 v0.8 M' + (p.x - 0.85) + ' ' + (p.y - 1.05) + 'h1.7 l-0.85 -0.5z', 'station');
      });
    },
    search(B, T) {
      B.el('deco', 'rect', { x: 0, y: 5.6, width: B.W, height: 2, class: 'ground night' });
      const a = T.a;
      B.path('deco', 'M' + (a.x - 0.5) + ' ' + (a.y + 1.4) + 'L' + (a.x - 0.2) + ' ' + (a.y + 0.2) + 'H' + (a.x + 0.2) + 'L' + (a.x + 0.5) + ' ' + (a.y + 1.4) + 'Z', 'lob-tower');
      B.path('deco', 'M' + T.b.x + ' ' + (T.b.y - 0.75) + 'l0.22 0.48 0.52 0.07 -0.38 0.36 0.1 0.52 -0.46 -0.25 -0.46 0.25 0.1 -0.52 -0.38 -0.36 0.52 -0.07z', 'star-deco');
    }
  };
  const TYPE_INFO = {
    seg: { name: 'ส่วนของเส้นตรง', d: 'มีจุดปลาย 2 จุด' },
    ray: { name: 'รังสี', d: 'มีจุดปลาย 1 จุด' },
    line: { name: 'เส้นตรง', d: 'ไม่มีจุดปลาย' }
  };
  ENG.build = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 7, cls: 'scene-' + T.scene });
    SCENES[T.scene](B, T);
    const P = [T.a, T.b];
    const ptEls = P.map(p => B.point('base', p, p.n, { cls: 'big grab' }));
    c.say(T.say);
    note(c, 'ลากจากจุดหนึ่งไปอีกจุดหนึ่ง');
    let phase = 1, from = null, rubber = null, conn = null, preview = null, chosen = null;
    const types = h('div', 'type-row hidden');
    const cap = h('div', 'type-cap');
    const go = btn('btn-go hidden', 'check', 'สร้างเลย!');
    ['seg', 'ray', 'line'].forEach(k => {
      const b = h('button', 'type-btn', figSvg({ k, rot: 0, l: '' }, 120, 60) + '<b>' + TYPE_INFO[k].name + '</b>');
      b.type = 'button'; b.dataset.k = k;
      b.addEventListener('click', () => pick(k));
      types.appendChild(b);
    });
    c.panel.append(types, cap, go);

    function pick(k) {
      if (phase !== 2) return;
      chosen = k;
      sfx(k === 'seg' ? 'snap' : 'laser');
      types.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('sel', b.dataset.k === k));
      if (preview) preview.remove();
      preview = B.figure('draw', conn.from, conn.to, k, 'preview grow');
      cap.innerHTML = '<b>' + TYPE_INFO[k].name + '</b> ' + TYPE_INFO[k].d;
      go.classList.remove('hidden'); bounce(go);
    }
    function resetDraw() {
      B.clear('draw'); conn = null; preview = null; chosen = null; phase = 1;
      types.classList.add('hidden'); go.classList.add('hidden'); cap.innerHTML = '';
      types.querySelectorAll('.type-btn').forEach(b => b.classList.remove('sel', 'hint-glow'));
      note(c, 'ลากจากจุดหนึ่งไปอีกจุดหนึ่ง');
    }
    go.addEventListener('click', () => {
      if (!chosen || !c.alive()) return;
      const dirOk = T.need !== 'ray' || conn.from.n === T.from;
      if (chosen === T.need && dirOk) {
        phase = 3;
        types.classList.add('done-row'); go.classList.add('hidden');
        if (preview) preview.classList.add('built');
        celebrate();
        c.win(T.ok, scr(B, T.b));
      } else if (chosen === T.need) {
        c.miss('รังสีต้องเริ่มที่จุดปลาย ' + T.from + ' แล้วพุ่งผ่าน ' + (T.from === T.a.n ? T.b.n : T.a.n) + ' ลองลากใหม่จาก ' + T.from + ' นะ', scr(B, conn.from));
        setTimeout(resetDraw, 700);
      } else {
        c.miss(T.why[chosen], go);
      }
    });
    function celebrate() {
      const a = conn.from, b = conn.to;
      if (T.scene === 'bridge') {
        const n = Math.round(M.dist(a, b) / 0.35);
        for (let i = 1; i < n; i++) {
          const t = i / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
          const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
          const g = B.el('top', 'g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + ang + ')' });
          const r = B.el(g, 'rect', { x: -0.06, y: -0.32, width: 0.12, height: 0.64, class: 'plank' });
          r.style.animationDelay = (i * 0.04) + 's';
        }
        sfx('build');
      } else if (T.scene === 'light' || T.scene === 'search') {
        const e = B.edge(a, b, 0);
        const ang = Math.atan2(e.y - a.y, e.x - a.x), w = 0.9;
        const q1 = { x: e.x + Math.sin(ang) * w, y: e.y - Math.cos(ang) * w }, q2 = { x: e.x - Math.sin(ang) * w, y: e.y + Math.cos(ang) * w };
        B.path('draw', 'M' + a.x + ' ' + a.y + 'L' + q1.x + ' ' + q1.y + 'L' + q2.x + ' ' + q2.y + 'Z', 'beam');
        sfx('beam');
      } else if (T.scene === 'rail') {
        const e1 = B.edge(b, a, 0), e2 = B.edge(a, b, 0);
        const train = B.el('top', 'g', { class: 'train' });
        train.innerHTML = '<rect x="-0.55" y="-0.75" width="1.1" height="0.6" rx="0.15"/><circle cx="-0.3" cy="-0.1" r="0.16"/><circle cx="0.3" cy="-0.1" r="0.16"/><rect x="-0.35" y="-0.65" width="0.3" height="0.25" class="win"/>';
        const t0 = performance.now(), dur = 2200;
        const step = now => {
          const t = Math.min(1, (now - t0) / dur);
          const x = e1.x + (e2.x - e1.x) * t, y = e1.y + (e2.y - e1.y) * t;
          train.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
          if (t < 1 && train.isConnected) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        sfx('train');
      }
    }
    c.onHint(lv => {
      if (lv >= 2) { const s = T.need === 'ray' ? P.find(p => p.n === T.from) : T.a; pulse(ptEls[P.indexOf(s)]); }
      if (lv >= 3 && phase === 2) types.querySelector('[data-k="' + T.need + '"]').classList.add('hint-glow');
    });
    B.on({
      down(p) {
        if (phase !== 1 || !c.alive()) return;
        const s = P.find(q => M.near(p, q, 0.8));
        if (!s) return;
        from = s;
        rubber = B.seg('draw', s, p, 'b-rubber');
        sfx('stretch');
      },
      move(p) { if (rubber) { rubber.setAttribute('x2', p.x); rubber.setAttribute('y2', p.y); } },
      up(p) {
        if (!rubber) return;
        rubber.remove(); rubber = null;
        const end = P.find(q => q !== from && M.near(p, q, 0.9));
        if (!end) { note(c, 'ลากให้ไปถึงอีกจุดนะ'); sfx('nope'); return; }
        conn = { from, to: end };
        B.seg('draw', from, end, 'b-solid');
        sfx('snap'); sparkle(scr(B, end), 8);
        phase = 2;
        types.classList.remove('hidden');
        note(c, 'เลือกแบบเส้น แล้วกด "สร้างเลย!"');
        c.say('pickType');
      }
    });
  };

  /* ═════════ 3) คัดแยกเข้ากล่อง ═════════ */
  ENG.sort = function (T, c) {
    c.stage.classList.add('stage-cards');
    const cardsBox = h('div', 'sort-cards');
    const binsBox = h('div', 'sort-bins n' + T.bins.length);
    c.stage.appendChild(cardsBox);
    /* จอแนวนอน: วางกล่องไว้แผงขวา ลากการ์ดข้ามไปได้ / จอแนวตั้ง: กล่องอยู่ใต้การ์ด */
    if (matchMedia('(min-width: 861px) and (orientation: landscape)').matches) { c.panel.appendChild(binsBox); binsBox.classList.add('in-panel'); }
    else c.stage.appendChild(binsBox);
    c.say(T.say);
    note(c, 'แตะการ์ด แล้วแตะกล่องที่ถูก (หรือลากไปวางก็ได้)');
    let sel = null, left = T.cards.length;
    const cardEls = T.cards.map((cd, i) => {
      const e = h('button', 'sort-card', figSvg(cd.fig, 150, 104));
      e.type = 'button'; e.dataset.i = i;
      e.style.animationDelay = (i * 0.06) + 's';
      cardsBox.appendChild(e);
      return e;
    });
    const binEls = T.bins.map(b => {
      const e = h('button', 'sort-bin bin-' + b.id, '<span class="bin-mk">' + (b.mk ? art.mark(b.mk) : '') + '</span><b>' + b.label + '</b><small>' + (b.sub || '') + '</small><span class="bin-in"></span>');
      e.type = 'button'; e.dataset.id = b.id;
      binsBox.appendChild(e);
      return e;
    });
    function select(i) {
      sel = i;
      cardEls.forEach((e, j) => e.classList.toggle('sel', j === i));
      sfx('pop', 1);
    }
    function drop(i, binId) {
      const cd = T.cards[i], ce = cardEls[i];
      const be = binEls[T.bins.findIndex(b => b.id === binId)];
      if (cd.bin === binId) {
        const r1 = ce.getBoundingClientRect(), r2 = be.getBoundingClientRect();
        ce.style.transform = 'translate(' + (r2.left + r2.width / 2 - r1.left - r1.width / 2) + 'px,' + (r2.top + r2.height / 2 - r1.top - r1.height / 2) + 'px) scale(.2)';
        ce.classList.add('flying'); ce.disabled = true;
        sfx('pop', 3); sparkle(be, 10); bounce(be);
        const mini = h('i', 'bin-tick'); be.querySelector('.bin-in').appendChild(mini);
        setTimeout(() => { ce.classList.add('gone'); }, 380);
        sel = null;
        left--;
        if (left === 0) setTimeout(() => c.win(T.ok, binsBox), 450);
      } else {
        shake(ce); shake(be);
        c.miss(T.why(cd, binId), ce);
      }
    }
    cardEls.forEach((e, i) => {
      let sx = 0, sy = 0, drag = null, moved = false;
      e.addEventListener('pointerdown', ev => {
        if (e.disabled) return;
        sx = ev.clientX; sy = ev.clientY; moved = false;
        try { e.setPointerCapture(ev.pointerId); } catch (er) {}
      });
      e.addEventListener('pointermove', ev => {
        if (!e.hasPointerCapture || !e.hasPointerCapture(ev.pointerId)) return;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) > 10) { moved = true; select(i); drag = true; e.classList.add('dragging'); }
        if (drag) e.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(4deg)';
        if (drag) {
          const t = document.elementFromPoint(ev.clientX, ev.clientY);
          binEls.forEach(b => b.classList.toggle('over', !!t && b.contains(t)));
        }
      });
      e.addEventListener('pointerup', ev => {
        if (drag) {
          drag = null; e.classList.remove('dragging'); e.style.transform = '';
          binEls.forEach(b => b.classList.remove('over'));
          e.style.visibility = 'hidden';
          const t = document.elementFromPoint(ev.clientX, ev.clientY);
          e.style.visibility = '';
          const be = t && binEls.find(b => b.contains(t));
          if (be) drop(i, be.dataset.id);
        } else if (!moved) select(i);
      });
    });
    binEls.forEach(be => be.addEventListener('click', () => {
      if (sel == null) { pulse(cardsBox.querySelector('.sort-card:not(.gone)')); note(c, 'แตะเลือกการ์ดก่อนนะ'); return; }
      drop(sel, be.dataset.id);
    }));
    c.onHint(lv => {
      cardsBox.classList.toggle('helper', lv >= 2);
      if (lv >= 3) {
        const i = sel != null ? sel : cardEls.findIndex(e => !e.disabled);
        if (i < 0) return;
        select(i);
        binEls.forEach(b => b.classList.toggle('hint-glow', b.dataset.id === T.cards[i].bin));
      }
    });
  };

  /* ═════════ 4) เปิดป้ายดูสัญลักษณ์ ═════════ */
  ENG.reveal = function (T, c) {
    c.stage.classList.add('stage-cards');
    const row = h('div', 'posts');
    c.stage.appendChild(row);
    c.say(T.say);
    note(c, 'แตะป้ายทั้ง 3 อัน');
    let n = 0;
    T.items.forEach((it, i) => {
      const p = h('button', 'post', '<div class="post-fig">' + figSvg({ k: it.k, rot: 0, l: it.l }, 170, 90) + '</div>' +
        '<div class="post-sign"><div class="ps-front">' + art.icon('hand') + '<span>แตะเลย</span></div><div class="ps-back">' + art.symbol(it.k, it.l) + '<b>' + M.KIND_TH[it.k] + ' ' + it.l + '</b></div></div>');
      p.type = 'button';
      p.style.animationDelay = (i * 0.1) + 's';
      p.addEventListener('click', () => {
        if (p.classList.contains('open')) { ui.guide.say('rv_' + it.k); return; }
        p.classList.add('open'); n++;
        sfx('unlock'); sparkle(p, 12);
        ui.guide.say('rv_' + it.k);
        if (n === T.items.length) setTimeout(() => c.win(T.ok, row), 1600);
      });
      row.appendChild(p);
    });
    c.onHint(() => row.querySelectorAll('.post:not(.open)').forEach(pulse));
  };

  /* ═════════ 5) สร้างสัญลักษณ์จากกระเบื้อง ═════════ */
  ENG.symbol = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 6, cls: 'sign-board' });
    const ptEls = {};
    if (T.fig.k === 'ang') {
      const { v, a, b } = T.fig;
      B.figure('base', v, a, 'ray', 'stat');
      B.figure('base', v, b, 'ray', 'stat');
      arcIn(B, 'base', v, a, b, 0.8);
      [a, v, b].forEach(p => { ptEls[p.n] = B.point('base', p, p.n, { cls: 'big', off: p.off }); });
    } else {
      const { a, b, k } = T.fig;
      B.figure('base', a, b, k, 'stat');
      [a, b].forEach(p => { ptEls[p.n] = B.point('base', p, p.n, { cls: 'big', off: p.off }); });
    }
    c.say(T.say);
    const isAng = T.ans.mark === 'angle';
    const n = T.ans.letters[0].length;
    const plate = h('div', 'plate' + (isAng ? ' ang' : ''));
    const mslot = h('button', 'slot mslot', '');
    mslot.type = 'button';
    const lrow = h('div', 'lrow');
    const lslots = [];
    for (let i = 0; i < n; i++) { const s = h('button', 'slot lslot', ''); s.type = 'button'; lslots.push(s); lrow.appendChild(s); }
    if (isAng) { plate.classList.add('row'); plate.append(mslot, lrow); } else plate.append(mslot, lrow);
    const tiles = h('div', 'tiles');
    const markTiles = T.tiles.marks.map(k => { const t = h('button', 'tile mtile', art.mark(k)); t.type = 'button'; t.dataset.k = k; tiles.appendChild(t); return t; });
    const letTiles = T.tiles.letters.map(L => { const t = h('button', 'tile ltile', '<b>' + L + '</b>'); t.type = 'button'; t.dataset.l = L; tiles.appendChild(t); return t; });
    const check = btn('btn-go', 'check', 'ติดป้าย!');
    check.disabled = true;
    c.panel.append(plate, tiles, check);
    note(c, 'แตะเครื่องหมาย 1 อัน และตัวอักษรให้ครบ');
    let mk = null, lockMark = false;
    const letters = new Array(n).fill(null);
    function refresh() {
      mslot.innerHTML = mk ? art.mark(mk) : '<i>เครื่องหมาย</i>';
      mslot.classList.toggle('filled', !!mk);
      lslots.forEach((s, i) => { s.innerHTML = letters[i] ? '<b>' + letters[i] + '</b>' : ''; s.classList.toggle('filled', !!letters[i]); });
      markTiles.forEach(t => t.classList.toggle('used', t.dataset.k === mk));
      letTiles.forEach(t => t.classList.toggle('used', letters.indexOf(t.dataset.l) >= 0));
      check.disabled = !(mk && letters.every(Boolean));
    }
    markTiles.forEach(t => t.addEventListener('click', () => { if (lockMark) return; mk = t.dataset.k; sfx('pop', 2); bounce(mslot); refresh(); }));
    letTiles.forEach(t => t.addEventListener('click', () => {
      if (letters.indexOf(t.dataset.l) >= 0) return;
      const i = letters.indexOf(null);
      if (i < 0) return;
      letters[i] = t.dataset.l; sfx('pop', i + 1); bounce(lslots[i]); refresh();
    }));
    mslot.addEventListener('click', () => { if (lockMark) return; mk = null; sfx('click'); refresh(); });
    lslots.forEach((s, i) => s.addEventListener('click', () => { letters[i] = null; sfx('click'); refresh(); }));
    check.addEventListener('click', () => {
      if (!c.alive()) return;
      const word = letters.join('');
      if (mk !== T.ans.mark) { shake(mslot); c.miss(T.whyMark[mk] || 'ลองดูปลายเส้นบนรูปอีกทีนะ', mslot); return; }
      if (T.ans.letters.indexOf(word) < 0) {
        shake(lrow);
        let why = 'ลองดูชื่อจุดบนรูปอีกทีนะ';
        if (mk === 'ray' && word === T.ans.letters[0].split('').reverse().join('')) why = 'รังสีต้องเขียนจุดปลายก่อนเสมอ จุดปลายคือ ' + T.ans.letters[0][0] + ' นะ';
        if (mk === 'angle' && word.split('').sort().join('') === T.ans.letters[0].split('').sort().join('')) why = 'จุดยอดมุมคือ ' + T.ans.letters[0][1] + ' ต้องอยู่ตรงกลางนะ';
        c.miss(why, lrow);
        return;
      }
      plate.classList.add('done'); sfx('stamp'); sparkle(plate, 16);
      [check, tiles].forEach(e => e.classList.add('hidden'));
      c.win(T.ok, plate);
    });
    refresh();
    c.onHint(lv => {
      if (lv >= 2) Object.values(ptEls).forEach(pulse);
      if (lv >= 3) { mk = T.ans.mark; lockMark = true; refresh(); mslot.classList.add('hint-glow'); }
    });
  };

  /* ═════════ 6) แตะเรียกชื่อมุม ═════════ */
  ENG.nameAngle = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 7 });
    const { v, a, b } = T;
    B.figure('base', v, a, 'ray', 'stat');
    B.figure('base', v, b, 'ray', 'stat');
    arcIn(B, 'base', v, a, b, 0.85);
    const all = [a, v, b].concat(T.extra || []);
    const els = all.map(p => {
      const g = B.point('base', p, p.n, { cls: 'big tap', off: p.off });
      B.el(g, 'circle', { r: 0.7, class: 'hit' });
      return g;
    });
    c.say(T.say);
    const bar = h('div', 'name-bar', '<span class="nb-pre">มุม</span><span class="nb-slots"></span>');
    const slotsEl = bar.querySelector('.nb-slots');
    const undo = btn('btn-soft btn-sm', 'undo', 'ลบ');
    c.panel.append(bar, undo);
    note(c, 'แตะจุดบนรูปเรียงตามชื่อมุม');
    let seq = [];
    function paint() {
      slotsEl.innerHTML = [0, 1, 2].map(i => '<i class="nb-s' + (seq[i] ? ' on' : '') + '">' + (seq[i] ? seq[i].n : '') + '</i>').join('');
      els.forEach((e, i) => e.classList.toggle('chosen', seq.indexOf(all[i]) >= 0));
    }
    undo.addEventListener('click', () => { seq.pop(); sfx('click'); paint(); });
    B.on({
      down(p) {
        if (!c.alive() || seq.length >= 3) return;
        const q = all.find(x => M.near(p, x, 0.75));
        if (!q || seq.indexOf(q) >= 0) return;
        seq.push(q); sfx('point', seq.length); sparkle(scr(B, q), 6); paint();
        if (seq.length === 3) setTimeout(judge, 250);
      }
    });
    function judge() {
      const ns = seq.map(x => x.n).join('');
      const bad = seq.find(x => (T.extra || []).indexOf(x) >= 0);
      const ok = seq[1] === v && ((seq[0] === a && seq[2] === b) || (seq[0] === b && seq[2] === a));
      if (ok) {
        bar.classList.add('done');
        slotsEl.innerHTML = art.symbol('angle', ns, { scale: 1.1 });
        sfx('stamp'); sparkle(bar, 14);
        undo.classList.add('hidden');
        c.win(T.ok, bar);
        return;
      }
      shake(bar);
      if (bad) c.miss('จุด ' + bad.n + ' ไม่ได้อยู่บนแขนของมุมนี้นะ', bar);
      else c.miss('จุดยอดมุมคือจุด ' + v.n + ' ที่รังสีสองเส้นเริ่มต้น ต้องอยู่ตรงกลางชื่อมุมนะ', bar);
      setTimeout(() => { seq = []; paint(); }, 900);
    }
    paint();
    c.onHint(lv => {
      if (lv >= 2) pulse(els[1]);
      if (lv >= 3) B.text('ui', v.x, v.y + 0.9, 'จุดยอดมุม', { class: 'b-tag', 'text-anchor': 'middle' });
    });
  };

  /* ═════════ 7) มุมเกิดจากรังสีสองเส้น + ส่วนประกอบของมุม ═════════ */
  ENG.angleParts = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 7 });
    const V = { x: 3.2, y: 5.4, n: 'B' };
    const A = { x: 9.6, y: 5.4, n: 'A' };
    B.figure('base', V, A, 'ray', 'stat arm1');
    let deg = 16, phase = 1;
    const dyn = B.el('draw', 'g', { class: 'dyn' });
    const handle = B.el('ui', 'g', { class: 'handle' });
    handle.innerHTML = '<circle r="0.55" class="h-ring"/><circle r="0.25" class="h-dot"/>';
    function render() {
      dyn.innerHTML = '';
      const C = M.pol(V, deg, 5);
      if (deg > 14) B.arc(dyn, V, 0, deg, 1, 'b-arc grow');
      B.figure(dyn, V, C, 'ray', 'stat arm2');
      const lab = M.pol(V, deg, 5.4);
      B.point(dyn, M.pol(V, deg, 4.2), 'C', { off: [-0.35, -0.3] });
      handle.setAttribute('transform', 'translate(' + lab.x + ' ' + lab.y + ')');
    }
    B.point('ui', V, 'B', { cls: 'big', off: [-0.1, 0.55] });
    B.point('ui', { x: 6, y: 5.4 }, 'A', { off: [0, 0.55] });
    render();
    c.say('t31a');
    note(c, 'ลากวงกลมสีเหลือง หมุนรังสีขึ้นไป');
    const found = { v: false, a1: false, a2: false };
    B.on({
      down(p) {
        if (!c.alive()) return;
        if (phase === 2) return tapPart(p);
      },
      move(p) {
        if (phase !== 1) return;
        let d = M.dir(V, p);
        if (d > 175) d = d > 270 ? 0 : 175;
        deg = Math.max(6, Math.min(150, d));
        render();
        if (Math.round(deg) % 10 === 0) sfx('tick');
      },
      up() {
        if (phase === 1 && deg >= 35) {
          phase = 2;
          handle.remove();
          sfx('unlock'); sparkle(scr(B, V), 14);
          note(c, 'แตะ จุดยอดมุม ก่อน แล้วแตะ แขนของมุม ทั้งสองข้าง');
          c.seq(['t31b', 't31c']);
        }
      }
    });
    function tapPart(p) {
      const C = M.pol(V, deg, 5);
      if (M.near(p, V, 0.6)) {
        if (found.v) return;
        found.v = true;
        B.text('top', V.x - 0.2, V.y + 1.15, 'จุดยอดมุม', { class: 'b-tag pop-in', 'text-anchor': 'middle' });
        B.el('top', 'circle', { cx: V.x, cy: V.y, r: 0.42, class: 'found-ring' });
        sfx('check'); sparkle(scr(B, V), 10);
      } else {
        const onA1 = M.segDist(p, V, { x: 11.7, y: 5.4 }) < 0.5 && M.dist(p, V) > 0.7;
        const onA2 = M.segDist(p, V, M.pol(V, deg, 6)) < 0.5 && M.dist(p, V) > 0.7;
        if (!onA1 && !onA2) return;
        if (!found.v) { c.miss('แตะจุดยอดมุมก่อนนะ คือจุดที่รังสีสองเส้นเริ่มต้นร่วมกัน', scr(B, p)); return; }
        const key = onA1 ? 'a1' : 'a2';
        if (found[key]) return;
        found[key] = true;
        const mid = onA1 ? { x: 6.6, y: 5.95 } : M.pol(V, deg, 2.8);
        B.text('top', mid.x + (onA1 ? 0 : -0.6), mid.y + (onA1 ? 0.25 : -0.3), 'แขนของมุม', { class: 'b-tag pop-in', 'text-anchor': 'middle' });
        B.el('top', 'line', onA1 ? { x1: V.x, y1: V.y, x2: 11.6, y2: 5.4, class: 'found-arm' } : { x1: V.x, y1: V.y, x2: C.x, y2: C.y, class: 'found-arm' });
        sfx('check'); sparkle(scr(B, p), 8);
      }
      if (found.v && found.a1 && found.a2) setTimeout(() => c.win('t31ok', scr(B, V)), 400);
    }
    c.onHint(lv => {
      if (phase === 1) { pulse(handle); return; }
      if (lv >= 2) B.el('ui', 'circle', { cx: V.x, cy: V.y, r: 0.6, class: 'ghost-ring' });
    });
  };

  /* ═════════ 8) หมุนตั้งมุมให้ถูกชนิด ═════════ */
  const RANGE = {
    acute: 'มุมแหลม มากกว่า 0 แต่น้อยกว่า 90 องศา',
    right: 'มุมฉาก เท่ากับ 90 องศาพอดี',
    obtuse: 'มุมป้าน มากกว่า 90 แต่น้อยกว่า 180 องศา',
    straight: 'มุมตรง เท่ากับ 180 องศาพอดี',
    reflex: 'มุมกลับ มากกว่า 180 แต่น้อยกว่า 360 องศา'
  };
  const DIAL_THEME = {
    crane(B, V) { B.path('deco', 'M' + (V.x - 0.6) + ' ' + (V.y + 2.4) + 'L' + (V.x - 0.25) + ' ' + V.y + 'H' + (V.x + 0.25) + 'L' + (V.x + 0.6) + ' ' + (V.y + 2.4) + 'Z', 'crane-base'); },
    door(B, V) { B.el('deco', 'rect', { x: V.x - 0.3, y: V.y - 0.3, width: 0.6, height: 2.6, class: 'door-post' }); },
    slide(B, V) { B.path('deco', 'M' + (V.x - 1) + ' ' + (V.y + 2.4) + 'L' + V.x + ' ' + V.y + 'L' + (V.x + 1) + ' ' + (V.y + 2.4), 'slide-legs'); },
    seesaw(B, V) { B.path('deco', 'M' + (V.x - 0.6) + ' ' + (V.y + 1.2) + 'L' + V.x + ' ' + V.y + 'L' + (V.x + 0.6) + ' ' + (V.y + 1.2) + 'Z', 'seesaw-base'); },
    wheel(B, V) { B.el('deco', 'circle', { cx: V.x, cy: V.y, r: 2.9, class: 'wheel-rim' }); }
  };
  ENG.dial = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 7.4, cls: 'dial theme-' + T.theme });
    const V = { x: 6, y: 3.7 }, R = 2.9;
    DIAL_THEME[T.theme] && DIAL_THEME[T.theme](B, V);
    const zone = B.el('deco', 'g', { class: 'zone' });
    let deg = T.start;
    const fixedEnd = M.pol(V, 0, R);
    const dyn = B.el('draw', 'g');
    const handle = B.el('ui', 'g', { class: 'handle' });
    handle.innerHTML = '<circle r="0.6" class="h-ring"/><circle r="0.27" class="h-dot"/>';
    const readout = h('div', 'readout', '<b>0</b><span>องศา</span>');
    const ctrls = h('div', 'dial-ctrls');
    const minus = btn('btn-round', 'minus', ''), plus = btn('btn-round', 'plus', '');
    const go = btn('btn-go', 'check', T.go || 'ตั้งมุม!');
    ctrls.append(minus, readout, plus);
    const chart = h('div', 'range-chart hidden', Object.keys(RANGE).map(k => '<div class="rc rc-' + k + (k === T.target ? ' on' : '') + '">' + RANGE[k] + '</div>').join(''));
    c.panel.append(ctrls, go, chart);
    note(c, 'ลากวงกลมสีเหลืองเพื่อหมุนแขน');
    function render() {
      dyn.innerHTML = '';
      const d = Math.round(deg);
      const end = M.pol(V, d, R);
      if (d === 90) B.rightMark(dyn, V, 0, 90, 0.55, 'b-right big');
      else if (d > 0) B.arc(dyn, V, 0, d, d > 180 ? 0.75 : 0.95, 'b-arc' + (d > 180 ? ' reflex' : ''));
      B.seg(dyn, V, fixedEnd, 'arm fixed');
      B.seg(dyn, V, end, 'arm move');
      B.el(dyn, 'circle', { cx: fixedEnd.x, cy: fixedEnd.y, r: 0.2, class: 'arm-tip' });
      B.el(dyn, 'circle', { cx: V.x, cy: V.y, r: 0.24, class: 'arm-pivot' });
      const lp = M.pol(V, d / 2, d > 180 ? 1.25 : 1.45);
      B.text(dyn, lp.x, lp.y + 0.18, d + '°', { class: 'deg-lbl', 'text-anchor': 'middle' });
      handle.setAttribute('transform', 'translate(' + end.x + ' ' + end.y + ')');
      readout.querySelector('b').textContent = d;
    }
    function setDeg(d) {
      d = ((Math.round(d / 5) * 5) % 360 + 360) % 360;
      if (d === 0) d = deg > 180 ? 355 : 5;
      if (d !== deg) { sfx('tick'); deg = d; render(); }
    }
    minus.addEventListener('click', () => setDeg(deg - 5));
    plus.addEventListener('click', () => setDeg(deg + 5));
    B.on({ down(p) { if (c.alive() && !done) setDeg(M.dir(V, p)); }, move(p) { if (c.alive() && !done) setDeg(M.dir(V, p)); } });
    let done = false;
    go.addEventListener('click', () => {
      if (!c.alive() || done) return;
      const ty = M.angleType(deg);
      if (ty === T.target) {
        done = true;
        sfx('correct');
        B.wrap.classList.add('ride-go');
        c.win(T.ok, scr(B, V));
      } else {
        c.miss('ตอนนี้ได้ ' + deg + ' องศา เป็น' + M.TYPE_TH[ty] + ' แต่ต้องการ' + RANGE[T.target], readout);
      }
    });
    render();
    c.say(T.say);
    c.onHint(lv => {
      if (lv >= 2) chart.classList.remove('hidden');
      if (lv >= 3) {
        zone.innerHTML = '';
        const rng = { acute: [5, 85], right: [88, 92], obtuse: [95, 175], straight: [178, 182], reflex: [185, 355] }[T.target];
        B.arc(zone, V, rng[0], rng[1], R + 0.4, 'target-zone');
      }
    });
  };

  /* ═════════ 9) ตรวจสอบรูปสี่เหลี่ยม (ตัวเช็กมุมฉาก + ไม้บรรทัด) ═════════ */
  ENG.inspect = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 8, cls: 'factory' });
    const P = T.v.map((p, i) => Object.assign({ n: 'ABCD'[i] }, p));
    const poly = B.path('base', 'M' + P.map(p => p.x + ' ' + p.y).join('L') + 'Z', 'quad pop-in');
    void poly;
    const cen = { x: P.reduce((s, p) => s + p.x, 0) / 4, y: P.reduce((s, p) => s + p.y, 0) / 4 };
    P.forEach(p => {
      const dx = p.x - cen.x, dy = p.y - cen.y, L = Math.hypot(dx, dy);
      B.point('base', p, p.n, { off: [dx / L * 0.6, dy / L * 0.6] });
    });
    const tools = h('div', 'tools');
    const tCorner = btn('tool', 'corner', 'ตัวเช็กมุมฉาก'), tRuler = btn('tool', 'ruler', 'ไม้บรรทัด');
    tools.append(tCorner, tRuler);
    const stamps = h('div', 'stamps');
    const SNAME = { square: 'จัตุรัส', rect: 'ผืนผ้า', none: 'ไม่ใช่สี่เหลี่ยมมุมฉาก' };
    ['square', 'rect', 'none'].forEach(k => {
      const s = btn('stamp st-' + k, 'stamp', SNAME[k]); s.dataset.k = k;
      s.addEventListener('click', () => judge(k));
      stamps.appendChild(s);
    });
    const tally = h('div', 'tally');
    c.panel.append(tools, tally, stamps);
    let tool = 'corner';
    const angOk = [null, null, null, null], len = [null, null, null, null];
    function setTool(t) { tool = t; tCorner.classList.toggle('on', t === 'corner'); tRuler.classList.toggle('on', t === 'ruler'); B.wrap.dataset.tool = t; sfx('click'); }
    tCorner.addEventListener('click', () => setTool('corner'));
    tRuler.addEventListener('click', () => setTool('ruler'));
    setTool('corner');
    function paintTally() {
      const nA = angOk.filter(x => x !== null).length, nL = len.filter(x => x !== null).length;
      tally.innerHTML = '<span>' + art.icon('corner') + ' มุมที่ตรวจ ' + nA + '/4</span><span>' + art.icon('ruler') + ' ด้านที่วัด ' + nL + '/4</span>';
    }
    paintTally();
    const COLORS = ['c1', 'c2', 'c3', 'c4'];
    let saidB = false;
    B.on({
      down(p) {
        if (!c.alive()) return;
        if (tool === 'corner') {
          const i = P.findIndex(q => M.near(p, q, 0.9));
          if (i < 0) { note(c, 'แตะที่มุม (จุดยอด) ของรูปนะ'); return; }
          if (angOk[i] !== null) return;
          const prev = P[(i + 3) % 4], next = P[(i + 1) % 4];
          const a = M.angleAt(prev, P[i], next);
          const isRight = Math.abs(a - 90) < 0.6;
          angOk[i] = isRight;
          const t1 = M.dir(P[i], prev), t2 = M.dir(P[i], next);
          let s1 = t1, s2 = t2;
          if (((t2 - t1) + 360) % 360 > 180) { s1 = t2; s2 = t1; }
          if (isRight) { B.rightMark('top', P[i], s1, s2, 0.5, 'b-right ok pop-in'); sfx('check'); sparkle(scr(B, P[i]), 8); }
          else {
            B.arc('top', P[i], s1, s2, 0.6, 'b-arc bad pop-in');
            const q = M.pol(P[i], (s1 + (((s2 - s1) + 360) % 360) / 2), 1.05);
            B.path('top', 'M' + (q.x - 0.18) + ' ' + (q.y - 0.18) + 'l0.36 0.36 M' + (q.x + 0.18) + ' ' + (q.y - 0.18) + 'l-0.36 0.36', 'x-mark pop-in');
            sfx('nope');
            floatText(scr(B, P[i]), 'ไม่ใช่มุมฉาก', 'bad');
          }
          paintTally();
          if (T.guided && !saidB && angOk.every(x => x !== null)) { saidB = true; setTimeout(() => { setTool('ruler'); c.say('t51b'); }, 600); }
        } else {
          let best = -1, bd = 0.5;
          for (let j = 0; j < 4; j++) {
            const d = M.segDist(p, P[j], P[(j + 1) % 4]);
            if (d < bd) { bd = d; best = j; }
          }
          if (best < 0) { note(c, 'แตะที่ด้านของรูปนะ'); return; }
          if (len[best] !== null) return;
          const a = P[best], b = P[(best + 1) % 4];
          const L = M.round(M.dist(a, b), 1);
          len[best] = L;
          const uniq = [...new Set(len.filter(x => x !== null))];
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const nx = -(b.y - a.y) / M.dist(a, b), ny = (b.x - a.x) / M.dist(a, b);
          const o = (mid.x + nx - cen.x) ** 2 + (mid.y + ny - cen.y) ** 2 > (mid.x - nx - cen.x) ** 2 + (mid.y - ny - cen.y) ** 2 ? 1 : -1;
          B.seg('top', a, b, 'measured ' + COLORS[uniq.indexOf(L) % 4]);
          B.text('top', mid.x + nx * 0.62 * o, mid.y + ny * 0.62 * o + 0.18, (L % 1 ? L : Math.round(L)) + ' ซม.', { class: 'len-lbl ' + COLORS[uniq.indexOf(L) % 4] + ' pop-in', 'text-anchor': 'middle' });
          sfx('ruler');
          paintTally();
        }
      }
    });
    function judge(k) {
      if (!c.alive()) return;
      const anyBad = angOk.some(x => x === false);
      const allA = angOk.every(x => x !== null), allL = len.every(x => x !== null);
      if (k === 'none') {
        if (anyBad) return ok(k);
        if (!allA) { c.say('chkAng'); pulse(tCorner); return; }
        c.miss('มุมทั้งสี่เป็นมุมฉากครบแล้วนะ จึงเป็นรูปสี่เหลี่ยมมุมฉาก', stamps);
        return;
      }
      if (anyBad) { c.miss('มีมุมที่ไม่ใช่มุมฉาก จึงไม่เป็นรูปสี่เหลี่ยมมุมฉากนะ', stamps); return; }
      if (!allA) { c.say('chkAng'); setTool('corner'); pulse(tCorner); return; }
      if (!allL) { c.say('chkLen'); setTool('ruler'); pulse(tRuler); return; }
      const allEq = len.every(x => Math.abs(x - len[0]) < 0.05);
      const truth = allEq ? 'square' : 'rect';
      if (k === truth) return ok(k);
      if (k === 'square') c.miss('ด้านยาวไม่เท่ากันทุกด้าน จึงยังไม่ใช่จัตุรัสนะ ลองดูตัวเลขที่วัดได้', stamps);
      else c.miss('ด้านยาวเท่ากันทุกด้านนะ มุมฉากครบ แบบนี้เรียกว่าจัตุรัส', stamps);
    }
    function ok(k) {
      stamps.querySelector('.st-' + k).classList.add('stamped');
      const holder = B.el('top', 'g', { transform: 'translate(' + cen.x + ' ' + cen.y + ') rotate(-8)' });
      const big = B.el(holder, 'g', { class: 'big-stamp' });
      big.innerHTML = '<rect x="-2.3" y="-0.65" width="4.6" height="1.3" rx="0.3"/><text y="0.28" text-anchor="middle">' + (k === 'none' ? 'ไม่ผ่าน' : SNAME[k]) + '</text>';
      if (k === 'none') big.classList.add('reject');
      sfx('stamp');
      c.win(T.ok, scr(B, cen));
    }
    if (T.guided) c.say('t51a'); else c.say(T.say);
    c.onHint(lv => {
      if (lv >= 2) {
        P.forEach((p, i) => { if (angOk[i] === null) B.el('ui', 'circle', { cx: p.x, cy: p.y, r: 0.55, class: 'ghost-ring' }); });
        if (angOk.every(x => x !== null) && !angOk.some(x => x === false)) pulse(tRuler);
      }
      if (lv >= 3) stamps.querySelector('.st-' + T.ans).classList.add('hint-glow');
    });
  };

  /* ═════════ 10) สร้างรูปสี่เหลี่ยมมุมฉากตามขั้นตอน (ไม้บรรทัด + ไม้ฉาก) ═════════ */
  ENG.construct = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 8, grid: 'dots', cls: 'yard' });
    const A = { x: T.A.x, y: T.A.y, n: 'A' };
    const Bp = { x: A.x + T.L, y: A.y, n: 'B' };
    const D = { x: A.x, y: A.y - T.Wd, n: 'D' };
    const C = { x: Bp.x, y: Bp.y - T.Wd, n: 'C' };
    const steps = [
      { from: A, to: Bp, guide: 'h', len: T.L, line: T.lines[0] },
      { from: A, to: D, guide: 'v', len: T.Wd, line: T.lines[1], sq: true },
      { from: Bp, to: C, guide: 'v', len: T.Wd, line: T.lines[2], sq: true },
      { from: D, to: C, guide: 'h', len: T.L, line: T.lines[3] }
    ];
    let si = 0, rubber = null, rlab = null;
    const ptL = B.el('top', 'g');
    const shown = new Set();
    function showPt(p) { if (shown.has(p.n)) return; shown.add(p.n); B.point(ptL, p, p.n, { cls: 'big pop-in', off: [p.n === 'A' || p.n === 'D' ? -0.45 : 0.45, p.n === 'A' || p.n === 'B' ? 0.5 : -0.4] }); }
    showPt(A);
    const stepBox = h('ol', 'steps', steps.map((s, i) => '<li data-i="' + i + '">' + ui.strip(typeof s.line === 'string' && GB.LINES[s.line] ? GB.LINES[s.line][1] : s.line) + '</li>').join(''));
    c.panel.appendChild(stepBox);
    const guideL = B.el('deco', 'g');
    const sqL = B.el('ui', 'g');
    function setStep() {
      const s = steps[si];
      stepBox.querySelectorAll('li').forEach((li, i) => { li.classList.toggle('now', i === si); li.classList.toggle('ok', i < si); });
      guideL.innerHTML = ''; sqL.innerHTML = '';
      note(c, 'ลากจากจุด ' + s.from.n + ' ไปตามเส้นประ นับจุดให้ครบ ' + s.len + ' หน่วย');
      const far = s.guide === 'h' ? { x: s.from.x + (s.to.x > s.from.x ? 6 : -6), y: s.from.y } : { x: s.from.x, y: s.from.y - 6 };
      B.seg(guideL, s.from, far, 'guide-line');
      if (s.sq) {
        const g = B.el(sqL, 'g', { class: 'setsq', transform: 'translate(' + s.from.x + ' ' + s.from.y + ')' });
        const k = s.from === A ? 1 : -1;
        g.innerHTML = '<path d="M0 0 V-2.2 L' + (1.6 * k) + ' 0 Z"/><path d="M0 -0.42 H' + (0.42 * k) + ' V0" class="sq-mk"/>';
        sfx('whoosh');
      }
      if (si === 0 && T.intro) c.say(T.intro).then(() => { if (c.alive() && si === 0) c.say(s.line); });
      else c.say(s.line);
    }
    function snap(p) { return { x: Math.round(p.x), y: Math.round(p.y) }; }
    B.on({
      down(p) {
        if (!c.alive() || si >= 4) return;
        const s = steps[si];
        if (!M.near(p, s.from, 0.8)) { note(c, 'เริ่มลากจากจุด ' + s.from.n + ' นะ'); pulse(ptL.children[[...shown].indexOf(s.from.n)]); return; }
        rubber = B.seg('draw', s.from, s.from, 'b-rubber');
        rlab = B.text('ui', s.from.x, s.from.y, '', { class: 'live-len', 'text-anchor': 'middle' });
        sfx('stretch');
      },
      move(p) {
        if (!rubber) return;
        const s = steps[si];
        let q = snap(p);
        if (s.guide === 'h') q.y = s.from.y; else q.x = s.from.x;
        rubber.setAttribute('x2', q.x); rubber.setAttribute('y2', q.y);
        const L = Math.round(M.dist(s.from, q));
        rlab.textContent = L ? L + ' หน่วย' : '';
        rlab.setAttribute('x', (s.from.x + q.x) / 2 + (s.guide === 'v' ? (s.from === A || s.from === D ? -0.9 : 0.9) : 0));
        rlab.setAttribute('y', (s.from.y + q.y) / 2 + (s.guide === 'h' ? 0.75 : 0.15));
      },
      up(p) {
        if (!rubber) return;
        const s = steps[si];
        let q = snap(p);
        const off = s.guide === 'h' ? Math.abs(q.y - s.from.y) : Math.abs(q.x - s.from.x);
        if (s.guide === 'h') q.y = s.from.y; else q.x = s.from.x;
        rubber.remove(); rlab.remove(); rubber = null;
        const L = Math.round(M.dist(s.from, q));
        if (q.x === s.to.x && q.y === s.to.y) {
          B.seg('base', s.from, s.to, 'b-solid built-line');
          showPt(s.to);
          sfx('build'); sparkle(scr(B, s.to), 10);
          si++;
          if (si < 4) setStep();
          else finish();
        } else if (L === 0) {
          return;
        } else if (off > 1.2) {
          c.miss('ลากไปตามเส้นประนะ', scr(B, q));
        } else {
          c.miss('ตอนนี้ยาว ' + L + ' หน่วย ต้องยาว ' + s.len + ' หน่วยนะ ลองนับจุดดู', scr(B, q));
        }
      }
    });
    function finish() {
      guideL.innerHTML = ''; sqL.innerHTML = '';
      stepBox.querySelectorAll('li').forEach(li => { li.classList.add('ok'); li.classList.remove('now'); });
      note(c, 'สร้างเสร็จแล้ว!');
      B.path('deco', 'M' + [A, Bp, C, D].map(p => p.x + ' ' + p.y).join('L') + 'Z', 'quad fill-in');
      [[A, 0, 90], [Bp, 90, 180], [C, 180, 270], [D, 270, 360]].forEach(([p, a, b], i) => setTimeout(() => { B.rightMark('top', p, a, b, 0.42, 'b-right ok pop-in'); sfx('pop', i); }, 200 + i * 160));
      c.win(T.ok, scr(B, C));
    }
    setStep();
    c.onHint(lv => {
      const s = steps[si]; if (!s) return;
      if (lv >= 2) B.el('ui', 'circle', { cx: s.to.x, cy: s.to.y, r: 0.45, class: 'ghost-ring' });
      if (lv >= 3) B.seg('ui', s.from, s.to, 'ghost-line');
    });
  };

  /* ═════════ 11) สร้างรูปสี่เหลี่ยมมุมฉากเอง (แตะจุดบนกระดานจุด) ═════════ */
  ENG.free = function (T, c) {
    const B = geo.board(c.stage, { w: 12, h: 8, grid: 'dots', cls: 'yard theme-' + (T.theme || 'park') });
    c.say(T.say);
    const spec = h('div', 'spec', T.square ? '<b>จัตุรัส</b> ด้านยาว ' + T.w + ' หน่วย' : '<b>ผืนผ้า</b> ยาว ' + T.w + ' กว้าง ' + T.h + ' หน่วย');
    const row = h('div', 'row-btns');
    const undo = btn('btn-soft btn-sm', 'undo', 'ย้อน'), clr = btn('btn-soft btn-sm', 'trash', 'ล้าง');
    row.append(undo, clr);
    c.panel.append(spec, row);
    note(c, 'แตะจุดมุมทีละจุด ให้ครบ 4 มุม');
    let pts = [], closed = false, done = false;
    const lay = B.el('draw', 'g');
    function paint() {
      lay.innerHTML = '';
      if (closed) B.path(lay, 'M' + pts.map(p => p.x + ' ' + p.y).join('L') + 'Z', 'quad fill-in');
      for (let i = 0; i < pts.length - 1 + (closed ? 1 : 0); i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        B.seg(lay, a, b, 'b-solid');
        const L = M.round(M.dist(a, b), 1);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        B.text(lay, mid.x, mid.y - 0.25, (L % 1 ? L : L) + '', { class: 'len-lbl small', 'text-anchor': 'middle' });
      }
      pts.forEach((p, i) => B.point(lay, p, '', { cls: i === 0 ? 'first' : '' }));
    }
    undo.addEventListener('click', () => { if (done) return; closed = false; pts.pop(); sfx('click'); paint(); });
    clr.addEventListener('click', () => { if (done) return; closed = false; pts = []; sfx('puff'); paint(); });
    B.on({
      down(p) {
        if (!c.alive() || done) return;
        const q = { x: Math.round(p.x), y: Math.round(p.y) };
        if (M.dist(p, q) > 0.55 || q.x < 1 || q.y < 1 || q.x > 11 || q.y > 7) return;
        if (closed) { note(c, 'กด ย้อน หรือ ล้าง เพื่อแก้ไขนะ'); return; }
        if (pts.length >= 3 && q.x === pts[0].x && q.y === pts[0].y) { close(); return; }
        if (pts.some(r => r.x === q.x && r.y === q.y)) return;
        pts.push(q); sfx('point', pts.length - 1); paint();
        if (pts.length === 4) setTimeout(close, 250);
      }
    });
    function close() {
      closed = true; paint(); sfx('snap');
      const sides = pts.map((p, i) => M.dist(p, pts[(i + 1) % 4]));
      const bad = pts.map((p, i) => Math.abs(M.angleAt(pts[(i + 3) % 4], p, pts[(i + 1) % 4]) - 90) > 0.5);
      if (bad.some(Boolean)) {
        bad.forEach((b, i) => { if (b) B.el(lay, 'circle', { cx: pts[i].x, cy: pts[i].y, r: 0.45, class: 'bad-ring' }); });
        c.miss('มุมที่วงสีแดงไม่ใช่มุมฉาก รูปสี่เหลี่ยมมุมฉากต้องมีมุมฉากครบสี่มุมนะ', B.wrap);
        return;
      }
      const want = [T.w, T.h, T.w, T.h].sort((a, b) => a - b);
      const got = sides.map(s => M.round(s, 2)).sort((a, b) => a - b);
      if (want.every((w, i) => Math.abs(w - got[i]) < 0.01)) {
        done = true;
        pts.forEach((p, i) => {
          const t1 = M.dir(p, pts[(i + 1) % 4]), t2 = M.dir(p, pts[(i + 3) % 4]);
          let s1 = t1, s2 = t2; if (((t2 - t1) + 360) % 360 > 180) { s1 = t2; s2 = t1; }
          B.rightMark(lay, p, s1, s2, 0.4, 'b-right ok pop-in');
        });
        B.wrap.classList.add('built-ok');
        c.win(T.ok, B.wrap);
      } else {
        c.miss('มุมฉากครบแล้ว แต่ด้านยาว ' + got.map(x => Math.round(x * 10) / 10).join(', ') + ' หน่วย ต้องการ' + (T.square ? 'ทุกด้านยาว ' + T.w : 'ยาว ' + T.w + ' กว้าง ' + T.h) + ' หน่วยนะ', B.wrap);
      }
    }
    c.onHint(lv => {
      if (lv >= 2) B.el('ui', 'circle', { cx: 3, cy: 6, r: 0.45, class: 'ghost-ring' });
      if (lv >= 3) B.path('ui', 'M3 6H' + (3 + T.w) + 'V' + (6 - T.h) + 'H3Z', 'ghost-line');
    });
  };

  /* ═════════ 12) เลือกคำตอบพร้อมเหตุผล ═════════ */
  ENG.choice = function (T, c) {
    c.stage.classList.add('stage-cards');
    if (T.head) c.stage.appendChild(h('div', 'choice-head', T.head));
    const box = h('div', 'choices ' + (T.figs ? 'figs' : 'texts'));
    c.stage.appendChild(box);
    c.say(T.say);
    note(c, 'แตะคำตอบที่ถูกต้อง');
    const els = T.opts.map((o, i) => {
      const e = h('button', 'choice', o.fig ? figSvg(o.fig, 190, 100) : '<span>' + esc(o.text) + '</span>');
      e.type = 'button';
      e.style.animationDelay = (i * 0.08) + 's';
      e.addEventListener('click', () => {
        if (!c.alive() || e.disabled) return;
        if (o.ok) { e.classList.add('right'); sfx('stamp'); sparkle(e, 16); box.classList.add('done'); c.win(T.ok, e); }
        else { shake(e); e.classList.add('wrong'); e.disabled = true; c.miss(o.why, e); }
      });
      box.appendChild(e);
      return e;
    });
    c.onHint(lv => {
      if (lv >= 3) { const w = els.find((e, i) => !T.opts[i].ok && !e.disabled); if (w) { w.disabled = true; w.classList.add('fade'); } }
    });
  };

  GB.ENG = ENG;
  GB.figSvg = figSvg;
})();
