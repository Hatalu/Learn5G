/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — เครื่องมือทดลอง (rigs) ชุดที่ 1
   scratchBench : ขีดด้วยตะปู / กดด้วยนิ้ว            (ความแข็ง)
   duelBench    : เอาวัสดุสองชิ้นขีดกัน                (ความแข็ง)
   forceBench   : ดึง กด บีบ แล้วปล่อย                 (สภาพยืดหยุ่น)
   heatBench    : จุ่มช้อนในน้ำร้อน ดูเนยละลาย         (การนำความร้อน)
   circuitBench : วงจรไฟฟ้า ใส่วัสดุคั่นช่องว่าง          (การนำไฟฟ้า)
   ทุกอันรองรับทั้งนิ้วและเมาส์ (Pointer Events)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, ui, audio } = MM;
  const INK = art.INK;
  const clamp = MM.clamp;
  const W = MM.W = MM.W || {};

  const know = (id, prop) => { try { if (MM.know && MM.ITEM[id]) MM.know(MM.ITEM[id].mat, prop); } catch (e) {} };
  function toSvg(svg, p) {
    const pt = svg.createSVGPoint();
    pt.x = p.x != null ? p.x : p.clientX; pt.y = p.y != null ? p.y : p.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }
  const at = (str, x, y, w, h) => str.replace('<svg class="item', '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="item');
  const f1 = n => (+n).toFixed(1);
  const chip = (txt, cls) => '<span class="rchip ' + (cls || '') + '">' + txt + '</span>';
  const nm = MM.nm;
  const ROD_COL = { cuRod: ['#f0a066', '#c9622a'], alRod: ['#f4f8fc', '#a3b2c3'], feRod: ['#dfe7ef', '#7d8ea2'], woodRod: ['#e0a766', '#a96e30'], plRod: ['#7ed0ff', '#2f86e6'], rubRod: ['#ff7aa0', '#c93a6e'] };
  const SCR_COL = { sponge: '#e0a000', clay: '#2f9a3a', eraser: '#d94a7a', wood: '#a96e30', plastic: '#2f86e6', rubber: '#c93a6e', cloth: '#8f66e8' };

  /* ════════════════════════════════════════════════════
     1) scratchBench : ขีดด้วยตะปู / กดด้วยนิ้ว
     cfg = {samples:[id], tools:['nail','finger'], onTest(id, tool, outcome)}
     ════════════════════════════════════════════════════ */
  function scratchBench(host, cfg) {
    const ids = cfg.samples, n = ids.length;
    const tools = cfg.tools || ['nail', 'finger'];
    const VW = 460, VH = 250, SZ = n <= 2 ? 128 : n === 3 ? 116 : n === 4 ? 100 : 84;
    const colW = Math.min(150, 440 / n), x0 = (VW - n * colW) / 2;
    const pos = ids.map((id, i) => ({ id, x: x0 + i * colW + (colW - SZ) / 2, y: Math.round(128 - SZ * .84 + 16) }));
    const gid = art.uid('bn');
    let inner = '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a766"/><stop offset="1" stop-color="#b9783a"/></linearGradient>';
    pos.forEach((p, i) => { inner += '<clipPath id="' + gid + 'c' + i + '"><rect x="' + p.x + '" y="' + (p.y + 18) + '" width="' + SZ + '" height="' + (SZ - 8) + '" rx="10"/></clipPath>'; });
    inner += '</defs>';
    inner += '<rect x="6" y="128" width="448" height="116" rx="22" fill="url(#' + gid + ')"' + ' stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M18 144 H442 M18 168 H442 M18 192 H442" stroke="#8a5420" stroke-width="2" opacity=".35"/><rect x="14" y="130" width="432" height="10" rx="5" fill="#f0c88e" opacity=".8"/>';
    pos.forEach((p, i) => {
      const base = p.y + SZ * .84;
      inner += '<g class="sm" data-i="' + i + '" data-id="' + p.id + '">' +
        '<ellipse cx="' + (p.x + SZ / 2) + '" cy="' + (base + 3) + '" rx="' + (SZ * .4) + '" ry="6" fill="rgba(34,48,90,.25)"/>' +
        '<g class="sm-sq" data-base="' + base + '" data-cx="' + (p.x + SZ / 2) + '"><g class="sm-art">' + at(art.item(p.id), p.x, p.y, SZ, SZ) + '</g></g>' +
        '<g class="sm-dent"></g><g class="sm-marks" clip-path="url(#' + gid + 'c' + i + ')"></g>' +
        '<rect class="sm-hit" x="' + (p.x - 4) + '" y="' + (p.y + 10) + '" width="' + (SZ + 8) + '" height="' + (SZ - 6) + '" fill="transparent"/></g>';
    });
    /* เคอร์เซอร์เครื่องมือ */
    inner += '<g class="nail-cur" style="display:none;pointer-events:none"><g transform="translate(-17 -52)">' + at(art.item('nail'), 0, 0, 64, 64) + '</g></g>' +
      '<g class="fin-cur" style="display:none;pointer-events:none"><g transform="translate(-13 -52)"><rect x="0" y="0" width="26" height="54" rx="13" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.4"/><ellipse cx="13" cy="41" rx="8" ry="9" fill="#fff0e0" stroke="' + INK + '" stroke-width="2.2"/><path d="M5 10 Q13 4 21 10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></g></g>' +
      '<g class="tip-hand" style="pointer-events:none"></g>';

    host.innerHTML = '<div class="bench"><div class="bench-tools"></div>' +
      '<svg class="bench-svg" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="โต๊ะทดลองความแข็ง">' + inner + '</svg>' +
      '<div class="bres">' + ids.map(id => '<div class="bres-row" data-id="' + id + '"><b class="bres-n">' + nm(id) + '</b>' +
        (tools.indexOf('nail') >= 0 ? '<span class="bres-c" data-t="nail">ขีด: ?</span>' : '') +
        (tools.indexOf('finger') >= 0 ? '<span class="bres-c" data-t="finger">กด: ?</span>' : '') + '</div>').join('') + '</div></div>';
    const svg = host.querySelector('.bench-svg');
    const toolsEl = host.querySelector('.bench-tools');
    const nailC = svg.querySelector('.nail-cur'), finC = svg.querySelector('.fin-cur');
    const results = {};
    let tool = tools[0], strokes = null, busy = false, lastSfx = 0, lastChip = 0;

    const TB = { nail: ['scratch', 'ตะปูขีด'], finger: ['press', 'นิ้วกด'] };
    toolsEl.innerHTML = tools.map(t => '<button class="tool-btn" data-t="' + t + '">' + art.icon(TB[t][0]) + '<span>' + TB[t][1] + '</span></button>').join('');
    function setTool(t) {
      tool = t;
      toolsEl.querySelectorAll('.tool-btn').forEach(b => b.classList.toggle('on', b.dataset.t === t));
      svg.dataset.tool = t;
      nailC.style.display = finC.style.display = 'none';
    }
    toolsEl.querySelectorAll('.tool-btn').forEach(b => b.addEventListener('click', () => { audio.sfx('pop', 1); setTool(b.dataset.t); }));
    setTool(tool);

    function record(id, t, outcome) {
      results[id] = results[id] || {};
      results[id][t] = outcome;
      know(id, 'hard');
      const row = host.querySelector('.bres-row[data-id="' + id + '"] .bres-c[data-t="' + t + '"]');
      if (row) {
        if (t === 'nail') { row.innerHTML = 'ขีด: ' + (outcome.scratch ? chip('เป็นรอย', 'warn') : chip('ไม่เป็นรอย', 'ok')); }
        else { row.innerHTML = 'กด: ' + (outcome.dent ? chip('บุ๋ม', 'warn') : chip('ไม่บุ๋ม', 'ok')); }
        ui.restart(row, 'pop');
      }
      if (cfg.onTest) cfg.onTest(id, t, outcome);
    }
    function sampleAt(p) {
      const el = document.elementFromPoint(p.clientX != null ? p.clientX : p.x, p.clientY != null ? p.clientY : p.y);
      const g = el && el.closest && el.closest('.sm');
      return g ? +g.dataset.i : -1;
    }

    /* ── ขีดด้วยตะปู ── */
    function startStroke(i, sp) { strokes = { i, pts: [sp], len: 0, moved: false }; }
    function moveStroke(sp, raw) {
      nailC.setAttribute('transform', 'translate(' + f1(sp.x) + ' ' + f1(sp.y) + ')');
      if (!strokes) return;
      const s = strokes, last = s.pts[s.pts.length - 1];
      const d = Math.hypot(sp.x - last.x, sp.y - last.y);
      if (d < 3) return;
      const p = pos[s.i];
      const inside = sp.x > p.x && sp.x < p.x + SZ && sp.y > p.y + 20 && sp.y < p.y + SZ;
      if (inside) {
        s.len += d; s.pts.push(sp);
        const id = p.id, ok = MM.nailScratches(id);
        const g = svg.querySelectorAll('.sm')[s.i].querySelector('.sm-marks');
        if (ok) {
          g.insertAdjacentHTML('beforeend', '<path d="M' + f1(last.x) + ' ' + f1(last.y) + ' L' + f1(sp.x) + ' ' + f1(sp.y) + '" stroke="rgba(34,48,90,.62)" stroke-width="4.6" stroke-linecap="round" fill="none"/><path d="M' + f1(last.x + 1.8) + ' ' + f1(last.y + 2.2) + ' L' + f1(sp.x + 1.8) + ' ' + f1(sp.y + 2.2) + '" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-linecap="round" fill="none"/>');
          const now = performance.now();
          if (now - lastSfx > 90) { audio.sfx('scratch'); lastSfx = now; }
          if (now - lastChip > 110) { ui.chips(svgToScreen(sp), SCR_COL[id] || '#c68a4e', 3); lastChip = now; }
        } else {
          const now = performance.now();
          if (now - lastSfx > 160) { audio.sfx('clink'); lastSfx = now; ui.sparkle(svgToScreen(sp), 3); }
        }
      }
    }
    function svgToScreen(sp) {
      const m = svg.getScreenCTM(), pt = svg.createSVGPoint();
      pt.x = sp.x; pt.y = sp.y;
      const q = pt.matrixTransform(m);
      return { x: q.x, y: q.y };
    }
    function endStroke() {
      const s = strokes; strokes = null;
      if (!s || s.len < 36) return;
      const id = pos[s.i].id;
      record(id, 'nail', { scratch: MM.nailScratches(id) });
    }

    /* ── กดด้วยนิ้ว ── */
    function press(i) {
      if (busy) return;
      busy = true;
      const p = pos[i], id = p.id, tier = MM.ITEM[id].hard;
      const amt = tier <= 1 ? .4 : tier === 2 ? .16 : tier === 3 ? .02 : 0;
      const g = svg.querySelectorAll('.sm')[i], sq = g.querySelector('.sm-sq');
      const base = +sq.dataset.base, cx = +sq.dataset.cx;
      const apply = k => {
        const sy = 1 - amt * k, sx = 1 + amt * k * .35;
        sq.setAttribute('transform', 'translate(' + cx + ' ' + base + ') scale(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') translate(' + (-cx) + ' ' + (-base) + ')');
        const ty = p.y + 30 + (1 - sy) * SZ * .7;
        finC.setAttribute('transform', 'translate(' + (cx) + ' ' + ty.toFixed(1) + ')');
      };
      finC.style.display = ''; nailC.style.display = 'none';
      finC.setAttribute('transform', 'translate(' + cx + ' ' + (p.y - 26) + ')');
      ui.tween(260, k => {
        const ty = (p.y - 26) + (p.y + 30 - (p.y - 26)) * k;
        finC.setAttribute('transform', 'translate(' + cx + ' ' + ty.toFixed(1) + ')');
      }, () => {
        if (amt > 0) audio.sfx('squish'); else audio.sfx(tier === 3 ? 'knockHard' : 'clink');
        ui.tween(amt > 0 ? 300 : 160, k => apply(k), () => {
          const dent = amt > .05;
          if (!dent) ui.sparkle(svgToScreen({ x: cx, y: p.y + 34 }), 4);
          setTimeout(() => {
            const rest = MM.ITEM[id].elastic ? 0 : (dent ? .35 : 0);
            const from = amt;
            ui.tween(280, k => { const kk = 1 - k * (1 - rest); const sy = 1 - from * kk; const sx = 1 + from * kk * .35; sq.setAttribute('transform', 'translate(' + cx + ' ' + base + ') scale(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') translate(' + (-cx) + ' ' + (-base) + ')'); finC.setAttribute('transform', 'translate(' + cx + ' ' + (p.y + 30 - 60 * k).toFixed(1) + ')'); }, () => {
              finC.style.display = 'none';
              if (dent && !MM.ITEM[id].elastic) g.querySelector('.sm-dent').innerHTML = '<ellipse cx="' + cx + '" cy="' + (p.y + 30) + '" rx="' + (SZ * .22) + '" ry="5" fill="rgba(34,48,90,.28)"/>';
              if (MM.ITEM[id].elastic && dent) audio.sfx('squishUp');
              record(id, 'finger', { dent });
              busy = false;
            });
          }, 160);
        }, ui.ease.out);
      });
    }

    /* ── pointer ── */
    svg.addEventListener('pointerdown', e => {
      audio.unlock();
      const i = sampleAt(e);
      if (i < 0) return;
      if (tool === 'finger') { press(i); return; }
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      const sp = toSvg(svg, e);
      nailC.style.display = '';
      nailC.setAttribute('transform', 'translate(' + f1(sp.x) + ' ' + f1(sp.y) + ')');
      startStroke(i, sp);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', e => {
      if (tool !== 'nail') return;
      const sp = toSvg(svg, e);
      if (strokes || e.pointerType === 'mouse') {
        const over = sp.y > 20 && sp.y < 235;
        nailC.style.display = over ? '' : 'none';
        if (over) moveStroke(sp, e);
      }
    });
    const up = () => { if (strokes) endStroke(); if (tool === 'nail' && !('ontouchstart' in window)) { /* คงเคอร์เซอร์ไว้ให้เห็นขณะเมาส์อยู่บนโต๊ะ */ } else nailC.style.display = 'none'; };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('pointerleave', () => { if (!strokes) nailC.style.display = 'none'; });

    /* ใบ้ด้วยมือชี้ (ครั้งแรก) */
    if (cfg.tipHand !== false) {
      const p0 = pos[0];
      svg.querySelector('.tip-hand').innerHTML = '<g class="tip-anim" transform="translate(' + (p0.x + 10) + ' ' + (p0.y + 60) + ')"><circle r="15" fill="rgba(255,210,63,.45)" stroke="#ffb400" stroke-width="3"/></g>';
      const kill = () => { const t = svg.querySelector('.tip-hand'); if (t) t.innerHTML = ''; };
      svg.addEventListener('pointerdown', kill, { once: true });
    }

    const api = {
      svg, results, setTool,
      tested(id, t) { return !!(results[id] && results[id][t]); },
      allTested(t) { return ids.every(id => results[id] && (!t || results[id][t])); },
      /* สำหรับทดสอบอัตโนมัติ: ทดสอบทั้งหมดทันที */
      runAll(t) { ids.forEach(id => { if (!t || t === 'nail') record(id, 'nail', { scratch: MM.nailScratches(id) }); if (!t || t === 'finger') record(id, 'finger', { dent: MM.ITEM[id].hard <= 2 }); }); }
    };
    return api;
  }

  /* ════════════════════════════════════════════════════
     2) duelBench : เอาวัสดุสองชิ้นขีดกัน
     cfg = {samples:[id], onDuel(a,b,res), onSelect(list)}
     ════════════════════════════════════════════════════ */
  function duelBench(host, cfg) {
    const ids = cfg.samples;
    host.innerHTML = '<div class="bench duel' + (cfg.hidePick ? ' nopick' : '') + '"><div class="duel-pick">' + ids.map(id =>
      '<button class="icard-btn" data-id="' + id + '">' + art.item(id) + '<b>' + nm(id) + '</b></button>').join('') + '</div>' +
      '<svg class="bench-svg duel-arena" viewBox="0 0 460 170"><defs></defs>' +
      '<rect x="6" y="6" width="448" height="158" rx="22" fill="#fff8e6" stroke="' + INK + '" stroke-width="4"/>' +
      '<g class="da-a"></g><g class="da-b"></g><text class="da-vs" x="230" y="96" text-anchor="middle">ขีดกัน</text></svg>' +
      '<div class="duel-bar"><div class="duel-msg">เลือกวัสดุ 2 ชิ้น แล้วกด "ขีดกัน!"</div><button class="btn btn-go btn-sm duel-go" disabled>' + art.icon('scratch') + '<span>ขีดกัน!</span></button></div>' +
      '<div class="duel-log"></div></div>';
    const svg = host.querySelector('.duel-arena'), gA = svg.querySelector('.da-a'), gB = svg.querySelector('.da-b');
    const go = host.querySelector('.duel-go'), msg = host.querySelector('.duel-msg'), log = host.querySelector('.duel-log');
    const btns = Array.from(host.querySelectorAll('.icard-btn'));
    let sel = [], busy = false;
    const done = {};
    function paint() {
      btns.forEach(b => b.classList.toggle('on', sel.indexOf(b.dataset.id) >= 0));
      gA.innerHTML = sel[0] ? at(art.item(sel[0]), 40, 24, 120, 120) : '';
      gB.innerHTML = sel[1] ? at(art.item(sel[1]), 300, 24, 120, 120) : '';
      go.disabled = sel.length < 2 || busy;
      msg.textContent = sel.length < 2 ? 'เลือกวัสดุ 2 ชิ้น แล้วกด "ขีดกัน!"' : nm(sel[0]) + ' กับ ' + nm(sel[1]) + ' พร้อมแล้ว!';
      if (cfg.onSelect) cfg.onSelect(sel.slice());
    }
    btns.forEach(b => b.addEventListener('click', () => {
      if (busy) return;
      const id = b.dataset.id, i = sel.indexOf(id);
      audio.sfx('pop', 1);
      if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 2) sel.shift(); sel.push(id); }
      paint();
    }));
    function run(a, b) {
      if (busy) return Promise.resolve(null);
      if (a && b) { sel = [a, b]; paint(); }
      if (sel.length < 2) return Promise.resolve(null);
      busy = true; go.disabled = true;
      gA.querySelectorAll('.duel-scr').forEach(x => x.remove()); gB.querySelectorAll('.duel-scr').forEach(x => x.remove());
      const A = sel[0], B = sel[1];
      const ta = MM.ITEM[A].hard, tb = MM.ITEM[B].hard;
      const res = { a: A, b: B, tie: ta === tb, winner: ta > tb ? A : tb > ta ? B : null, loser: ta > tb ? B : tb > ta ? A : null };
      return new Promise(resolve => {
        let n = 0;
        const rub = () => {
          if (n >= 6) { finish(); return; }
          const from = n % 2 ? 118 : 134, to = n % 2 ? 134 : 118;
          ui.tween(150, k => gA.setAttribute('transform', 'translate(' + (from + (to - from) * k).toFixed(1) + ' 0)'), () => { audio.sfx(res.tie ? 'clink' : 'rasp'); n++; rub(); }, ui.ease.linear);
        };
        ui.tween(380, k => gA.setAttribute('transform', 'translate(' + (134 * k).toFixed(1) + ' 0)'), () => { rub(); });
        function finish() {
          if (res.loser) {
            const g = res.loser === A ? gA : gB;
            const x = res.loser === A ? 40 : 300;
            g.insertAdjacentHTML('beforeend', '<g class="duel-scr"><path d="M' + (x + 10) + ' ' + 70 + ' l22 6 M' + (x + 14) + ' ' + 86 + ' l30 -8 M' + (x + 18) + ' ' + 100 + ' l24 5" stroke="rgba(34,48,90,.7)" stroke-width="3.6" stroke-linecap="round" fill="none"/></g>');
            ui.chips(ui.center(res.loser === A ? gA : gB), SCR_COL[res.loser] || '#c68a4e', 8);
          } else ui.sparkle(ui.center(gA), 6);
          ui.tween(300, k => gA.setAttribute('transform', 'translate(' + (134 * (1 - k)).toFixed(1) + ' 0)'), () => {
            const txt = res.tie ? nm(A) + ' กับ ' + nm(B) + ' ขีดกันแล้วไม่เป็นรอยทั้งคู่' : nm(res.winner) + ' ขีด ' + nm(res.loser) + ' เป็นรอย (' + nm(res.loser) + 'นิ่มกว่า)';
            msg.textContent = txt;
            log.insertAdjacentHTML('afterbegin', '<div class="duel-line">' + (res.tie ? '' : art.icon('scratch')) + '<span>' + txt + '</span></div>');
            while (log.children.length > 5) log.lastChild.remove();
            know(A, 'hard'); know(B, 'hard');
            done[A + '>' + B] = res; done[B + '>' + A] = res;
            busy = false; go.disabled = false;
            if (cfg.onDuel) cfg.onDuel(A, B, res);
            resolve(res);
          });
        }
      });
    }
    go.addEventListener('click', () => run());
    return { svg, run, done, selected: () => sel.slice(), select(list) { sel = list.slice(0, 2); paint(); }, btns };
  }

  /* ════════════════════════════════════════════════════
     3) forceBench : ออกแรง แล้วปล่อย ดูว่ากลับเหมือนเดิมไหม
     cfg = {samples:[id], onTest(id, outcome)}   outcome ∈ 'back' | 'stay' | 'rigid'
     ════════════════════════════════════════════════════ */
  const KIND = { band: 'stretch', spring: 'spring', sponge: 'squash', ball: 'squash', clay: 'squash', eraser: 'squash', rubber: 'squash', paper: 'crumple', foil: 'crumple', wire: 'bend', wood: 'rigid', stone: 'rigid' };
  const SQ_M = { sponge: .55, ball: .42, clay: .55, eraser: .3, rubber: .26 };
  function forceBench(host, cfg) {
    const ids = cfg.samples;
    const VW = 460, VH = 250, CX = 230, BASE = 205;
    host.innerHTML = '<div class="bench force"><div class="force-tabs">' + ids.map(id =>
      '<button class="icard-btn" data-id="' + id + '">' + art.item(id) + '<b>' + nm(id) + '</b></button>').join('') + '</div>' +
      '<svg class="bench-svg force-svg" viewBox="0 0 ' + VW + ' ' + VH + '"><rect x="6" y="6" width="448" height="238" rx="24" fill="#fff8e6" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="20" y="206" width="420" height="22" rx="8" fill="#d9a066" stroke="' + INK + '" stroke-width="3.4"/>' +
      '<g class="f-ghost"></g><g class="f-obj"></g><g class="f-hand"></g><g class="f-tip"></g></svg>' +
      '<div class="force-res"><span class="force-hint">ลากมือเพื่อออกแรง แล้วปล่อยนิ้ว</span></div></div>';
    const svg = host.querySelector('.force-svg');
    const gG = svg.querySelector('.f-ghost'), gO = svg.querySelector('.f-obj'), gH = svg.querySelector('.f-hand'), gT = svg.querySelector('.f-tip');
    const resEl = host.querySelector('.force-res');
    const tabs = Array.from(host.querySelectorAll('.icard-btn'));
    const results = {};
    let cur = null, kind = null, d = 0, maxD = 0, dragging = false, anim = null, attempted = 0, id0 = null;
    const SEED = [3, 7, 2, 9, 5, 1, 8, 4, 6, 2, 7, 3];

    function itemBig(id, x, y, w, h) { return at(art.item(id), x, y, w, h); }

    /* วาดวัสดุตามค่าการเปลี่ยนรูป d */
    function drawObj() {
      let s = '', hand = '';
      if (kind === 'squash' || kind === 'crumple' || kind === 'rigid') {
        const m = kind === 'squash' ? SQ_M[cur] : kind === 'crumple' ? .5 : .02;
        const sy = 1 - m * d, sx = 1 + (1 - sy) * (kind === 'crumple' ? .4 : .55);
        s = '<g transform="translate(' + CX + ' ' + BASE + ') scale(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') translate(' + (-CX) + ' ' + (-BASE) + ')">' + itemBig(cur, CX - 80, BASE - 156, 160, 160) + '</g>';
        if (kind === 'crumple' && d > .05) {
          let z = '';
          for (let i = 0; i < 9; i++) {
            const x = CX - 54 + i * 13 + SEED[i % 12], y = BASE - 100 + SEED[(i + 3) % 12] * 8;
            z += 'M' + x + ' ' + y + ' l' + (6 + SEED[i % 12]) + ' ' + (10 + SEED[(i + 5) % 12]) + ' l-4 12 ';
          }
          s += '<path d="' + z + '" stroke="#6f8196" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="' + (d * .9).toFixed(2) + '"/>';
        }
        const top = BASE - 118 * sy - 22;
        const py = top;
        hand = '<g class="f-plate" transform="translate(' + CX + ' ' + py.toFixed(1) + ')"><rect x="-90" y="-64" width="180" height="84" fill="transparent"/><rect x="-70" y="-14" width="140" height="22" rx="10" fill="#4aa8ff" stroke="' + INK + '" stroke-width="3.6"/><path d="M-56 -8 H20" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/>' +
          '<path d="M0 -14 V-34" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-42" r="16" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.6"/><path d="M-6 -44 q6 6 12 0" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g>';
        gG.innerHTML = '<rect x="' + (CX - 80) + '" y="' + (BASE - 120) + '" width="160" height="124" rx="16" fill="none" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="7 7" opacity=".85"/><text x="' + (CX + 84) + '" y="' + (BASE - 108) + '" font-size="13" font-weight="700" fill="#e0457a" font-family="Mali">รูปเดิม</text>';
      } else if (kind === 'stretch') {
        const L0 = 100, L1 = L0 + 150 * d, xA = CX - 130, xB = xA + L1;
        const h = 30 - 14 * d;
        s = '<circle cx="' + xA + '" cy="120" r="10" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/>' +
          '<rect x="' + xA + '" y="' + (120 - h / 2) + '" width="' + L1 + '" height="' + h + '" rx="' + (h / 2) + '" fill="none" stroke="' + INK + '" stroke-width="15"/>' +
          '<rect x="' + xA + '" y="' + (120 - h / 2) + '" width="' + L1 + '" height="' + h + '" rx="' + (h / 2) + '" fill="none" stroke="#ff6b8a" stroke-width="9"/>' +
          '<path d="M' + (xA + 14) + ' ' + (120 - h / 2 - 1) + ' H' + (xA + L1 - 14) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
        hand = '<g class="f-plate" transform="translate(' + xB + ' 120)"><circle cx="20" r="44" fill="transparent"/><circle r="10" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/><path d="M10 0 H30" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="0" r="16" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.6"/></g>';
        gG.innerHTML = '<circle cx="' + (xA + L0) + '" cy="120" r="12" fill="none" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="6 6"/><text x="' + (xA + L0 - 22) + '" y="156" font-size="13" font-weight="700" fill="#e0457a" font-family="Mali">รูปเดิม</text>';
      } else if (kind === 'spring') {
        const xA = CX - 120, L = 120 + 120 * d, n = 8, sp = L / n;
        let coil = '';
        for (let i = 0; i < n; i++) { const x = xA + sp * (i + .5); coil += '<ellipse cx="' + f1(x) + '" cy="120" rx="' + f1(Math.max(4, 9 - 3 * d)) + '" ry="30" transform="rotate(-14 ' + f1(x) + ' 120)" fill="none" stroke="' + INK + '" stroke-width="10"/>'; }
        for (let i = 0; i < n; i++) { const x = xA + sp * (i + .5); coil += '<ellipse cx="' + f1(x) + '" cy="120" rx="' + f1(Math.max(4, 9 - 3 * d)) + '" ry="30" transform="rotate(-14 ' + f1(x) + ' 120)" fill="none" stroke="#c9d6e4" stroke-width="5"/>'; }
        s = '<circle cx="' + xA + '" cy="120" r="10" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/>' + coil;
        const xB = xA + L;
        hand = '<g class="f-plate" transform="translate(' + xB + ' 120)"><circle cx="20" r="44" fill="transparent"/><circle r="10" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/><path d="M10 0 H30" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="0" r="16" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.6"/></g>';
        gG.innerHTML = '<circle cx="' + (xA + 120) + '" cy="120" r="12" fill="none" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="6 6"/><text x="' + (xA + 98) + '" y="168" font-size="13" font-weight="700" fill="#e0457a" font-family="Mali">รูปเดิม</text>';
      } else if (kind === 'bend') {
        const xA = CX - 110, xB = CX + 110, yB = 120 - 80 * d;
        const dd = 'M' + xA + ' 120 C' + (xA + 90) + ' 120 ' + (xB - 60) + ' ' + (120 - 30 * d) + ' ' + xB + ' ' + yB.toFixed(1);
        s = '<path d="' + dd + '" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="' + dd + '" fill="none" stroke="#e98445" stroke-width="7" stroke-linecap="round"/>' +
          '<rect x="' + (xA - 22) + '" y="100" width="22" height="40" rx="6" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/>';
        hand = '<g class="f-plate" transform="translate(' + xB + ' ' + yB.toFixed(1) + ')"><circle cy="-14" r="46" fill="transparent"/><circle r="10" fill="#8798ab" stroke="' + INK + '" stroke-width="3.4"/><circle cx="0" cy="-26" r="16" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.6"/><path d="M0 -10 V-3" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/></g>';
        gG.innerHTML = '<path d="M' + xA + ' 120 H' + xB + '" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="7 7" opacity=".85" fill="none"/><text x="' + (xB - 20) + '" y="148" font-size="13" font-weight="700" fill="#e0457a" font-family="Mali">รูปเดิม</text>';
      }
      gO.innerHTML = s; gH.innerHTML = hand;
    }

    /* ค่า d จากระยะที่นิ้วลากไปจากจุดที่จับ (ให้มือขยับตามนิ้ว) */
    let grab = null;
    function dFromPointer(sp) {
      if (!grab) return d;
      if (kind === 'squash' || kind === 'crumple' || kind === 'rigid') {
        const m = kind === 'squash' ? SQ_M[cur] : kind === 'crumple' ? .5 : .02;
        const travel = 118 * m;
        return clamp(grab.d0 + (sp.y - grab.y) / (travel + 6), 0, 1);
      }
      if (kind === 'stretch') return clamp(grab.d0 + (sp.x - grab.x) / 150, 0, 1);
      if (kind === 'spring') return clamp(grab.d0 + (sp.x - grab.x) / 120, -.5, 1);
      if (kind === 'bend') return clamp(grab.d0 + (grab.y - sp.y) / 80, 0, 1);
      return 0;
    }
    function select(id) {
      if (anim) { anim.cancel(); anim = null; }
      cur = id; kind = KIND[id] || 'squash'; d = 0; maxD = 0; attempted = 0; dragging = false;
      tabs.forEach(b => b.classList.toggle('on', b.dataset.id === id));
      resEl.innerHTML = results[id] ? outcomeHtml(results[id]) : '<span class="force-hint">ลากมือเพื่อออกแรง แล้วปล่อยนิ้ว</span>';
      drawObj();
      gT.innerHTML = results[id] ? '' : tipFor();
    }
    function tipFor() {
      let x = CX, y = 90;
      if (kind === 'stretch') { x = CX - 130 + 100 + 42; y = 120; }
      else if (kind === 'spring') { x = CX - 120 + 120 + 42; y = 120; }
      else if (kind === 'bend') { x = CX + 110; y = 94; }
      else { y = BASE - 118 - 62; }
      return '<g transform="translate(' + x + ' ' + y + ')"><circle r="20" class="tip-pulse" fill="rgba(255,210,63,.4)" stroke="#ffb400" stroke-width="3.4"/></g>';
    }
    function outcomeHtml(o) {
      return o === 'back' ? '<span class="rchip ok big">ปล่อยแล้ว: กลับเหมือนเดิม</span>' :
        o === 'stay' ? '<span class="rchip warn big">ปล่อยแล้ว: ค้างอยู่ ไม่กลับเหมือนเดิม</span>' :
          '<span class="rchip gray big">ออกแรงแล้ว: รูปไม่เปลี่ยน</span>';
    }
    tabs.forEach(b => b.addEventListener('click', () => { if (dragging) return; audio.sfx('pop', 1); select(b.dataset.id); }));

    function release() {
      dragging = false;
      const id = cur, k = kind, d0 = d;
      const elastic = MM.ITEM[id].elastic === true;
      const needMin = k === 'rigid' ? 1 : .35;
      if (k === 'rigid') {
        if (attempted < 20) { return; }
        audio.sfx('knockHard');
        finalize(id, 'rigid');
        return;
      }
      if (maxD < needMin) { d = 0; drawObj(); return; }
      if (elastic) {
        audio.sfx(k === 'spring' ? 'sproing' : k === 'stretch' ? 'twang' : id === 'ball' ? 'boing' : 'squishUp');
        const w = k === 'squash' ? 9 : 12, z = k === 'squash' ? 5.5 : 3.6;
        anim = ui.tween(900, (e, kk) => { const t = kk * 0.9; d = d0 * Math.exp(-z * t) * Math.cos(w * t); if (k === 'squash') d = Math.max(-.12, d); drawObj(); }, () => { d = 0; drawObj(); anim = null; finalize(id, 'back'); }, ui.ease.linear);
      } else {
        audio.sfx(k === 'crumple' ? 'crumple' : 'stay');
        const rest = k === 'bend' ? d0 * .96 : d0 * .94;
        anim = ui.tween(260, e => { d = d0 + (rest - d0) * e; drawObj(); }, () => { d = rest; drawObj(); anim = null; finalize(id, 'stay'); });
      }
    }
    function finalize(id, outcome) {
      results[id] = outcome;
      know(id, 'elastic');
      resEl.innerHTML = outcomeHtml(outcome);
      ui.restart(resEl, 'pop');
      gT.innerHTML = '';
      const tab = tabs.find(b => b.dataset.id === id);
      if (tab) tab.classList.add('tested');
      if (cfg.onTest) cfg.onTest(id, outcome);
    }

    ui.drag(svg, {
      onStart(p, e) {
        audio.unlock();
        if (!cur || anim) return false;
        const sp = toSvg(svg, p);
        const plate = e.target.closest && e.target.closest('.f-plate');
        if (!plate && kind !== 'rigid' && Math.hypot(0, 0) > 1) return false;
        if (!plate) return false;
        dragging = true; maxD = d; attempted = 0; gT.innerHTML = '';
        grab = { x: sp.x, y: sp.y, d0: d };
        if (kind === 'rigid') { svg.dataset.sy = sp.y; }
        return true;
      },
      onMove(p) {
        if (!dragging) return;
        const sp = toSvg(svg, p);
        if (kind === 'rigid') { attempted = Math.max(attempted, Math.abs(sp.y - (+svg.dataset.sy || sp.y))); d = clamp((sp.y - (+svg.dataset.sy || sp.y)) / 80, 0, 1); drawObj(); return; }
        const nd = dFromPointer(sp);
        if (Math.abs(nd - d) > .004) {
          if (Math.floor(nd * 8) !== Math.floor(d * 8)) audio.sfx('tick');
          d = nd; maxD = Math.max(maxD, d); drawObj();
        }
      },
      onEnd() { if (dragging) release(); }
    });

    select(ids[0]);
    return {
      svg, results, select, tabs,
      allTested() { return ids.every(id => results[id]); },
      /* ทดลองให้ดูอัตโนมัติ (คำใบ้) */
      autoRun(id) {
        if (anim) return;
        if (id) select(id);
        if (kind === 'rigid') { attempted = 40; d = .02; drawObj(); release(); return; }
        ui.tween(450, e => { d = .85 * e; maxD = Math.max(maxD, d); drawObj(); }, () => release());
      },
      /* สำหรับทดสอบอัตโนมัติ: ผลทั้งหมดทันที */
      runAll() {
        ids.forEach(id => { select(id); finalize(id, KIND[id] === 'rigid' ? 'rigid' : MM.ITEM[id].elastic ? 'back' : 'stay'); });
      }
    };
  }

  /* ════════════════════════════════════════════════════
     4) heatBench : จุ่มช้อนในน้ำร้อน ดูว่าเนยที่ปลายด้ามละลายก่อนไหม
     cfg = {rods:[id], onRun(order, status)}
     ════════════════════════════════════════════════════ */
  function heatBench(host, cfg) {
    const ids = cfg.rods, n = ids.length;
    const VW = 460, VH = 300, WIN = 14, REAL = 8.5;
    const gid = art.uid('hb');
    const xs = ids.map((_, i) => 230 + (i - (n - 1) / 2) * 44);
    const ang = ids.map((_, i) => (i - (n - 1) / 2) * 7);
    let defs = '<defs><linearGradient id="' + gid + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a6a"/><stop offset="1" stop-color="#e0452e"/></linearGradient>' +
      '<linearGradient id="' + gid + 'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a" stop-opacity=".0"/><stop offset=".18" stop-color="#ffd23f" stop-opacity=".95"/><stop offset=".6" stop-color="#ff8a1f" stop-opacity=".95"/><stop offset="1" stop-color="#ff3d2e" stop-opacity=".98"/></linearGradient>';
    ids.forEach((id, i) => {
      defs += '<clipPath id="' + gid + 'c' + i + '"><rect x="-8" y="-186" width="16" height="170" rx="8"/><ellipse cx="0" cy="-16" rx="17" ry="17"/></clipPath>';
      const c = ROD_COL[id] || ['#ddd', '#999'];
      defs += '<linearGradient id="' + gid + 'g' + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>';
    });
    defs += '</defs>';
    let body = defs + '<rect x="6" y="6" width="448" height="288" rx="24" fill="#fff4e3" stroke="' + INK + '" stroke-width="4"/>';
    /* ถ้วยหลัง */
    body += '<path d="M140 196 H320 L312 284 Q311 292 302 292 H158 Q149 292 148 284 Z" fill="rgba(235,248,255,.7)" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M145 214 Q175 206 230 214 T315 214 L311 284 Q310 289 302 289 H158 Q150 289 149 284 Z" fill="url(#' + gid + 'w)" opacity=".92"/>';
    body += '<g class="h-steam" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M180 196 q7 -9 0 -18 t0 -18"/><path d="M230 196 q7 -9 0 -18 t0 -18"/><path d="M280 196 q7 -9 0 -18 t0 -18"/></g>';
    /* ช้อน */
    ids.forEach((id, i) => {
      const x = xs[i], a = ang[i];
      body += '<g class="h-rod" data-i="' + i + '" transform="translate(' + x + ' 270) rotate(' + a + ')">' +
        '<g clip-path="url(#' + gid + 'c' + i + ')"><rect x="-8" y="-186" width="16" height="170" rx="8" fill="url(#' + gid + 'g' + i + ')"/><ellipse cx="0" cy="-16" rx="17" ry="17" fill="url(#' + gid + 'g' + i + ')"/>' +
        '<rect class="h-heat" x="-20" y="0" width="40" height="0" fill="url(#' + gid + 'h)"/></g>' +
        '<rect x="-8" y="-186" width="16" height="170" rx="8" fill="none" stroke="' + INK + '" stroke-width="3.4"/><ellipse cx="0" cy="-16" rx="17" ry="17" fill="none" stroke="' + INK + '" stroke-width="3.4"/>' +
        '<path d="M-3 -176 V-40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
        '<g class="h-butter"><rect x="-15" y="-210" width="30" height="22" rx="6" fill="#ffe27a" stroke="' + INK + '" stroke-width="3.2"/><path d="M-9 -204 H7" stroke="#fff8c9" stroke-width="3.4" stroke-linecap="round"/></g>' +
        '<ellipse class="h-drip" cx="0" cy="-188" rx="4" ry="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="2" opacity="0"/>' +
        '<g class="h-bub" opacity="0"><rect x="-30" y="-262" width="60" height="26" rx="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><text x="0" y="-244" text-anchor="middle" font-size="14" font-weight="700" font-family="Mali" fill="' + INK + '">ร้อน!</text></g>' +
        '</g>';
    });
    /* ถ้วยหน้า (เห็นช้อนในน้ำ) */
    body += '<path d="M140 196 H320 L312 284 Q311 292 302 292 H158 Q149 292 148 284 Z" fill="rgba(190,230,255,.28)" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M146 214 Q175 206 230 214 T314 214" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M158 220 L162 280" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>' +
      '<rect x="132" y="190" width="196" height="9" rx="4.5" fill="rgba(235,248,255,.9)" stroke="' + INK + '" stroke-width="3.4"/>';
    /* ป้ายชื่อ */
    ids.forEach((id, i) => {
      body += '<text x="' + xs[i] + '" y="' + (250 - 224) + '" text-anchor="middle" font-size="12.5" font-weight="700" font-family="Mali" fill="' + INK + '" class="h-lbl" data-i="' + i + '" style="display:none"></text>';
    });
    host.innerHTML = '<div class="bench heat"><svg class="bench-svg heat-svg" viewBox="0 0 ' + VW + ' ' + VH + '">' + body + '</svg>' +
      '<div class="heat-names">' + ids.map((id, i) => '<span class="hn"><i style="background:linear-gradient(135deg,' + ROD_COL[id][0] + ',' + ROD_COL[id][1] + ')"></i><b>' + (i + 1) + '</b>' + nm(id) + '</span>').join('') + '</div>' +
      '<div class="heat-bar"><div class="heat-prog"><i></i></div><button class="btn btn-go btn-sm heat-go">' + art.icon('flame') + '<span>ทดลอง! จุ่มช้อนในน้ำร้อน</span></button></div></div>';
    const svg = host.querySelector('.heat-svg'), go = host.querySelector('.heat-go'), prog = host.querySelector('.heat-prog i');
    const rods = Array.from(svg.querySelectorAll('.h-rod'));
    /* หมายเลขบนช้อน */
    rods.forEach((r, i) => r.insertAdjacentHTML('beforeend', '<g transform="translate(0 -120)"><circle r="11" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><text y="5" text-anchor="middle" font-size="14" font-weight="800" font-family="Baloo 2, Mali" fill="' + INK + '">' + (i + 1) + '</text></g>'));
    const st = ids.map(() => ({ p: 0, melted: false, t: 0, hit: -1 }));
    let running = false, ran = false, loopH = null, simT = 0;
    const order = [];

    function paint() {
      rods.forEach((r, i) => {
        const p = st[i].p, h = r.querySelector('.h-heat');
        const hh = 20 + 170 * p;
        h.setAttribute('y', (-hh).toFixed(1)); h.setAttribute('height', (hh + 2).toFixed(1));
      });
    }
    function melt(i) {
      st[i].melted = true; order.push(ids[i]);
      const r = rods[i], b = r.querySelector('.h-butter'), dr = r.querySelector('.h-drip');
      audio.sfx('sizzle'); setTimeout(() => audio.sfx('drip'), 450);
      ui.tween(1100, k => {
        b.setAttribute('transform', 'translate(0 ' + (k * 6).toFixed(1) + ') translate(0 -188) scale(' + (1 + k * .7).toFixed(2) + ' ' + (1 - k * .8).toFixed(2) + ') translate(0 188)');
        dr.setAttribute('opacity', k < .9 ? 1 : 0);
        dr.setAttribute('cy', (-188 + k * 70).toFixed(1));
      });
      know(ids[i], 'heat');
    }
    function runSim() {
      if (running) return Promise.resolve(order.slice());
      running = true; go.disabled = true; simT = 0;
      audio.sfx('fireup');
      svg.querySelector('.h-steam').classList.add('on');
      return new Promise(resolve => {
        const t0 = performance.now();
        loopH = ui.loop(() => {
          const real = (performance.now() - t0) / 1000;
          simT = Math.min(WIN, real * (WIN / REAL));
          ids.forEach((id, i) => {
            const T = MM.ITEM[id].heat;
            st[i].p = clamp(simT / T, 0, 1);
            if (st[i].p >= 1 && !st[i].melted) melt(i);
          });
          paint();
          prog.style.width = (simT / WIN * 100) + '%';
          if (simT >= WIN) {
            running = false; ran = true; go.disabled = false;
            go.querySelector('span').textContent = 'ทดลองซ้ำ';
            svg.querySelector('.h-steam').classList.remove('on');
            ids.forEach((id, i) => { if (!st[i].melted) know(id, 'heat'); });
            if (cfg.onRun) cfg.onRun(order.slice(), st.map(s => s.melted));
            resolve(order.slice());
            return false;
          }
        });
      });
    }
    function reset() {
      st.forEach(s => { s.p = 0; s.melted = false; });
      order.length = 0; paint(); prog.style.width = '0%';
      rods.forEach(r => { r.querySelector('.h-butter').setAttribute('transform', ''); r.querySelector('.h-drip').setAttribute('opacity', 0); r.querySelector('.h-bub').setAttribute('opacity', 0); });
    }
    go.addEventListener('click', () => { audio.unlock(); if (ran) reset(); ran = false; runSim(); });
    /* แตะที่ช้อนเพื่อลองจับด้าม */
    rods.forEach((r, i) => {
      r.style.cursor = 'pointer';
      r.addEventListener('click', () => {
        const hot = st[i].p > .55, b = r.querySelector('.h-bub');
        b.querySelector('text').textContent = hot ? 'ร้อน!' : 'ยังเย็น';
        b.querySelector('rect').setAttribute('fill', hot ? '#ffd0c8' : '#d8f1ff');
        b.setAttribute('opacity', 1);
        audio.sfx(hot ? 'zap' : 'pop', 1);
        setTimeout(() => b.setAttribute('opacity', 0), 1100);
      });
    });
    return {
      svg, order, run: runSim, reset, state: () => st.slice(),
      hasRun: () => ran,
      /* ทดสอบอัตโนมัติ */
      finishNow() { st.forEach((s, i) => { s.p = clamp(WIN / MM.ITEM[ids[i]].heat, 0, 1); if (s.p >= 1 && !s.melted) { s.melted = true; order.push(ids[i]); } know(ids[i], 'heat'); }); paint(); ran = true; if (cfg.onRun) cfg.onRun(order.slice(), st.map(s => s.melted)); }
    };
  }

  /* ════════════════════════════════════════════════════
     5) circuitBench : ใส่วัสดุคั่นช่องว่างในวงจร ถ้านำไฟฟ้าหลอดไฟจะติด
     cfg = {slots:1|2|3, items:[id], onChange(list, lit), single:bool}
     ════════════════════════════════════════════════════ */
  function circuitBench(host, cfg) {
    const k = cfg.slots || 1, ids = cfg.items;
    const GAPW = k >= 3 ? 252 : 200;
    const VW = 460, VH = 250, X0 = 230 - GAPW / 2, X1 = 230 + GAPW / 2, YB = 200, YT = 34, XL = 52, XR = 410;
    const slotW = GAPW / k;
    const slotC = [];
    for (let i = 0; i < k; i++) slotC.push(X0 + slotW * (i + .5));
    const gid = art.uid('cb');
    let body = '<defs><radialGradient id="' + gid + 'g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff9c0" stop-opacity=".95"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + gid + 'b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd23f"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>' +
      '<rect x="6" y="6" width="448" height="238" rx="24" fill="#f4f1ff" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M18 40 H442 M18 120 H442 M18 200 H442" stroke="#d9d2f2" stroke-width="2" opacity=".6"/>';
    /* สายไฟ (ไม่รวมช่วงหลอดไฟ แบตเตอรี่ และช่องว่าง) */
    const wire = d => '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#ff7a5c" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>';
    const loop = 'M' + XL + ' 96 V' + YT + ' H' + XR + ' V86 M' + XR + ' 150 V' + YB + ' H' + X1 + ' M' + X0 + ' ' + YB + ' H' + XL + ' V160';
    body += wire(loop);
    /* สายต่อไปยังตัวหนีบของแต่ละช่อง */
    {
      const hw0 = Math.min(40, slotW / 2 - 6);
      let prev = X1;
      body += wire('M' + X1 + ' ' + YB + ' H' + (slotC[k - 1] + hw0));
      for (let i = k - 1; i > 0; i--) body += wire('M' + (slotC[i] - hw0) + ' ' + YB + ' H' + (slotC[i - 1] + hw0));
      body += wire('M' + (slotC[0] - hw0) + ' ' + YB + ' H' + X0);
    }
    /* ตัวหนีบ + ช่อง */
    for (let i = 0; i < k; i++) {
      const c = slotC[i], hw = Math.min(40, slotW / 2 - 6);
      body += '<g class="cb-slot" data-i="' + i + '"><rect x="' + (c - hw) + '" y="' + (YB - 34) + '" width="' + (hw * 2) + '" height="68" rx="14" fill="rgba(255,255,255,.7)" stroke="#8b5cf6" stroke-width="3.4" stroke-dasharray="8 7"/>' +
        '<path d="M' + (c - hw) + ' ' + YB + ' h-14" class="cb-stubL" stroke="' + INK + '" stroke-width="0"/>' +
        '<g class="cb-clipL"><circle cx="' + (c - hw) + '" cy="' + YB + '" r="8" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3.4"/></g><g class="cb-clipR"><circle cx="' + (c + hw) + '" cy="' + YB + '" r="8" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3.4"/></g>' +
        '<g class="cb-item"></g><text class="cb-q" x="' + c + '" y="' + (YB + 6) + '" text-anchor="middle" font-size="26" font-weight="800" font-family="Baloo 2, Mali" fill="#8b5cf6">?</text>' +
        '<rect class="cb-hit" x="' + (c - hw - 8) + '" y="' + (YB - 40) + '" width="' + (hw * 2 + 16) + '" height="80" fill="transparent"/></g>';
    }
    /* กระแสไฟ (เส้นประวิ่ง) */
    const flowD = 'M' + XL + ' 96 V' + YT + ' H' + XR + ' V86 M' + XR + ' 150 V' + YB + ' H' + XL + ' V160';
    body += '<path class="cb-flow" d="' + flowD + '" fill="none" stroke="#fff6a8" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="3 12" opacity="0"/>';
    /* แบตเตอรี่ */
    body += '<g transform="translate(' + (XL - 22) + ' 94)"><rect x="0" y="0" width="44" height="68" rx="9" fill="#2d3b66" stroke="' + INK + '" stroke-width="3.6"/><rect x="0" y="22" width="44" height="24" fill="#ffd23f"/><path d="M0 22 H44 M0 46 H44" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M12 6 H32" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M22 -2 V14" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity="0"/>' +
      '<text x="22" y="40" text-anchor="middle" font-size="16" font-weight="800" fill="' + INK + '" font-family="Baloo 2">+ -</text><path d="M14 -6 H30 V0 H14 Z" fill="#c9d6e4" stroke="' + INK + '" stroke-width="2.4"/></g>';
    /* หลอดไฟ */
    body += '<g class="cb-bulb" transform="translate(' + XR + ' 118)"><circle class="cb-glow" r="64" fill="url(#' + gid + 'g)" opacity="0"/>' +
      '<g class="cb-rays" stroke="#ffb400" stroke-width="4" stroke-linecap="round" opacity="0">' + [0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => '<path d="M' + (Math.cos(a * Math.PI / 180) * 38).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 38).toFixed(1) + ' L' + (Math.cos(a * Math.PI / 180) * 52).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 52).toFixed(1) + '"/>').join('') + '</g>' +
      '<rect x="-12" y="22" width="24" height="16" rx="4" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3.2"/><path d="M-12 28 H12 M-12 33 H12" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<circle class="cb-glass" r="28" cy="-6" fill="#eef4fb" stroke="' + INK + '" stroke-width="3.8"/>' +
      '<path class="cb-fil" d="M-10 22 V8 L-5 -6 L0 6 L5 -6 L10 8 V22" fill="none" stroke="#8798ab" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-16 -18 Q-12 -26 -4 -28" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/></g>';
    host.innerHTML = '<div class="bench circuit"><svg class="bench-svg circ-svg" viewBox="0 0 ' + VW + ' ' + VH + '">' + body + '</svg>' +
      '<div class="cb-status"><span class="cb-msg">ลากวัสดุไปวางที่ช่องว่าง ดูว่าไฟติดไหม</span></div>' +
      '<div class="cb-shelf">' + ids.map(id => '<button class="icard-btn" data-id="' + id + '">' + art.item(id) + '<b>' + nm(id) + '</b></button>').join('') + '</div></div>';
    const svg = host.querySelector('.circ-svg'), shelf = host.querySelector('.cb-shelf'), msg = host.querySelector('.cb-msg');
    const slotEls = Array.from(svg.querySelectorAll('.cb-slot'));
    const bulb = svg.querySelector('.cb-bulb'), glow = bulb.querySelector('.cb-glow'), rays = bulb.querySelector('.cb-rays'), fil = bulb.querySelector('.cb-fil'), glass = bulb.querySelector('.cb-glass'), flow = svg.querySelector('.cb-flow');
    const list = new Array(k).fill(null);
    const tested = {};
    let lit = false;

    function setLit(on) {
      if (on === lit) return;
      lit = on;
      glow.setAttribute('opacity', on ? 1 : 0); rays.setAttribute('opacity', on ? 1 : 0);
      fil.setAttribute('stroke', on ? '#ff8a00' : '#8798ab');
      glass.setAttribute('fill', on ? '#fff6a8' : '#eef4fb');
      flow.setAttribute('opacity', on ? 1 : 0); flow.classList.toggle('run', on);
      bulb.classList.toggle('on', on);
      if (on) { audio.sfx('bulbOn'); ui.sparkle(ui.center(glass), 8); }
    }
    function evaluate(silent) {
      const full = list.every(x => x);
      const ok = full && list.every(id => MM.isConductor(id));
      slotEls.forEach((s, i) => { s.classList.toggle('bad', full && !ok && !!list[i] && !MM.isConductor(list[i])); });
      if (!silent) {
        if (full && ok) { setLit(true); msg.innerHTML = chip('ไฟติด!', 'ok big') + ' ไฟฟ้าวิ่งผ่านได้'; }
        else if (full) { if (lit) setLit(false); audio.sfx('bulbOff'); msg.innerHTML = chip('ไฟไม่ติด', 'warn big') + ' ไฟฟ้าวิ่งผ่านไม่ได้'; }
        else { if (lit) setLit(false); msg.textContent = 'ลากวัสดุไปวางที่ช่องว่าง ดูว่าไฟติดไหม'; }
      } else { lit = ok; }
      if (full && k === 1) { const id = list[0]; tested[id] = ok; know(id, 'elec'); }
      if (full && k > 1) list.forEach(id => { if (id) { /* ไม่เปิดข้อมูลเมื่อวางหลายชิ้น */ } });
      if (cfg.onChange) cfg.onChange(list.slice(), full && ok, full);
    }
    function place(id, idx) {
      if (idx == null || idx < 0) idx = list.indexOf(null);
      if (idx < 0) idx = k === 1 ? 0 : k - 1;
      list[idx] = id;
      paintSlot(idx);
      audio.sfx('plug');
      evaluate();
    }
    function remove(idx) {
      if (!list[idx]) return;
      list[idx] = null; paintSlot(idx); audio.sfx('pop', 0); evaluate();
    }
    function paintSlot(i) {
      const el = slotEls[i], c = slotC[i], hw = Math.min(40, slotW / 2 - 6);
      const g = el.querySelector('.cb-item'), q = el.querySelector('.cb-q');
      if (list[i]) { g.innerHTML = at(art.item(list[i]), c - hw + 4, YB - 40, hw * 2 - 8, hw * 2 - 8); q.style.display = 'none'; ui.restart(g, 'pop'); }
      else { g.innerHTML = ''; q.style.display = ''; }
      el.classList.toggle('filled', !!list[i]);
    }
    slotEls.forEach((s, i) => s.addEventListener('click', () => { if (list[i]) remove(i); }));

    /* ลากการ์ดไปวาง / แตะเพื่อวางทันที */
    shelf.querySelectorAll('.icard-btn').forEach(btn => {
      let ghost = null;
      ui.drag(btn, {
        onStart(p) { audio.unlock(); return true; },
        onMove(p, e, moved) {
          if (!moved) return;
          if (!ghost) {
            ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.innerHTML = art.item(btn.dataset.id);
            document.body.appendChild(ghost);
          }
          ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
          const sp = toSvg(svg, p);
          slotEls.forEach((s, i) => s.classList.toggle('near', Math.abs(sp.x - slotC[i]) < slotW / 2 && Math.abs(sp.y - YB) < 50));
        },
        onEnd(p, e, moved) {
          if (ghost) { ghost.remove(); ghost = null; }
          slotEls.forEach(s => s.classList.remove('near'));
          if (!moved) { place(btn.dataset.id, k === 1 ? 0 : list.indexOf(null)); return; }
          const sp = toSvg(svg, p);
          let idx = -1;
          slotEls.forEach((s, i) => { if (Math.abs(sp.x - slotC[i]) < slotW / 2 && Math.abs(sp.y - YB) < 56) idx = i; });
          if (idx >= 0) place(btn.dataset.id, idx);
        }
      });
    });
    return {
      svg, list, tested, place, remove,
      lit: () => lit,
      clear() { for (let i = 0; i < k; i++) { list[i] = null; paintSlot(i); } evaluate(); },
      allTested() { return ids.every(id => id in tested); }
    };
  }

  Object.assign(W, { scratchBench, duelBench, forceBench, heatBench, circuitBench, toSvg, at, chip, ROD_COL });
})();
