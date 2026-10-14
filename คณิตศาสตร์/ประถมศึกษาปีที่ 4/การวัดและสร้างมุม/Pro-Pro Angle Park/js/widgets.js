/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — Interactive widgets
   numpad (แป้นตัวเลของศา) / choice / angleStage (โพรแทรกเตอร์ลากวางหมุนได้ + มุม)
   partsMap (แตะส่วนประกอบ) — รองรับทั้งแตะและลาก (touch + mouse)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const AP = window.AP;
  const { M, art, ui, audio } = AP;
  const NS = 'http://www.w3.org/2000/svg';
  const raf = f => requestAnimationFrame(f);

  /* ══════════ 1) NUMPAD : แป้นกดตัวเลของศา ══════════ */
  let activePad = null;
  document.addEventListener('keydown', e => {
    if (!activePad || !activePad.host.isConnected || document.querySelector('.ov:not(.hidden)')) return;
    if (/^[0-9]$/.test(e.key)) { activePad.press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { activePad.press('back'); e.preventDefault(); }
    else if (e.key === 'Enter' && activePad.onEnter) { activePad.onEnter(); e.preventDefault(); }
  });
  /* o = {max, label, onEnter, onChange} */
  function numpad(host, o) {
    o = o || {};
    const max = o.max || 3;
    let val = '', locked = false;
    const keyList = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'back', '0', 'clear'];
    host.innerHTML = '<div class="np"><div class="np-top"><div class="np-plate empty"><span class="np-val">?</span><span class="np-deg">°</span><small class="np-lbl">' + (o.label || 'องศา') + '</small></div>' +
      (o.go ? '<button class="btn btn-go act-go np-go">' + art.icon('check') + '<span>' + o.go + '</span></button>' : '') + '</div>' +
      '<div class="np-keys">' + keyList.map((k, i) =>
        '<button class="key' + (k === 'back' ? ' k-back' : k === 'clear' ? ' k-clear' : '') + '" data-k="' + k + '" data-i="' + i + '" aria-label="' +
        (k === 'back' ? 'ลบ' : k === 'clear' ? 'ล้าง' : k) + '">' +
        (k === 'back' ? art.icon('back') : k === 'clear' ? art.icon('refresh') : k) + '</button>').join('') + '</div></div>';
    const plate = host.querySelector('.np-plate'), vEl = host.querySelector('.np-val');
    function paint() {
      vEl.textContent = val === '' ? '?' : val;
      plate.classList.toggle('empty', val === '');
      if (o.onChange) o.onChange(api.get());
    }
    function press(k) {
      if (locked) return;
      const btn = host.querySelector('.key[data-k="' + k + '"]');
      if (btn) ui.jelly(btn);
      if (k === 'back') { val = val.slice(0, -1); audio.sfx('tick'); paint(); return; }
      if (k === 'clear') { val = ''; audio.sfx('tick'); paint(); return; }
      if (val.length >= max) { ui.shake(plate); audio.sfx('gentle'); return; }
      val = val === '0' ? k : val + k;
      audio.sfx('key', +(btn && btn.dataset.i) % 6);
      paint();
    }
    host.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
    const api = {
      host, press, onEnter: o.onEnter, plate, go: host.querySelector('.np-go'),
      get() { return val === '' ? null : +val; },
      empty() { return val === ''; },
      set(n) { val = String(n); paint(); },
      clear() { val = ''; paint(); },
      lock() { locked = true; host.querySelector('.np').classList.add('locked'); if (activePad === api) activePad = null; }
    };
    paint();
    activePad = api;
    return api;
  }

  /* ══════════ 2) CHOICE : ปุ่มตัวเลือก ══════════ */
  function choice(host, o) {
    host.innerHTML = '<div class="opts ' + (o.cls || '') + '">' + o.options.map((op, i) =>
      '<button class="opt" data-i="' + i + '">' + op.html + '</button>').join('') + '</div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.opt'));
    btns.forEach((b, i) => b.addEventListener('click', () => { if (!locked && !b.disabled) o.onPick(o.options[i].value, b, i); }));
    return {
      btns,
      lock() { locked = true; btns.forEach(b => b.classList.add('done')); },
      mark(value, cls) { btns.forEach((b, i) => { if (o.options[i].value === value) b.classList.add(cls); }); },
      dim(b) { b.disabled = true; b.classList.add('dim'); }
    };
  }

  /* ══════════ 3) ANGLE STAGE : พื้นที่ทำงานกับมุมและโพรแทรกเตอร์ ══════════
     cfg = {
       mode  : 'place' (วางให้ตรง) | 'measure' (วางแล้วอ่านค่า) | 'build' (ทำเครื่องหมายแล้วลากเส้น) | 'fan' (ลากแขนมุม)
       fig   : รูปมุม (M.figure)   — build/fan ใช้เฉพาะแขนฐาน (size = 0)
       prot  : 'ideal' (วางถูกไว้ให้แล้ว ล็อก) | 'free' (เริ่มวางไว้มุมล่าง ลากเองได้)
       ring  : แสดงวงเรืองแสงที่จุดยอดตั้งแต่เริ่ม
       glow  : (measure) เมื่อวางถูกให้แขนที่สองเรืองแสงผ่านสเกล
       zeroCue: ไฮไลต์เลข 0 ของสเกลที่ต้องใช้
       readout: (build/fan) แสดงองศาสดระหว่างลาก
       lite  : ลดจำนวนขีด 1 องศา (ภาพเบาขึ้น)
       onAligned(info), onRelease(diag), onMark(reading), onArm(deg)
     } */
  function angleStage(host, cfg) {
    const f = cfg.fig, V = f.V, R = M.PROT.R, KNOB = M.PROT.KNOB;
    const mode = cfg.mode;
    const tol = Object.assign({ pos: 12, rot: 5 }, cfg.tol || {});
    const W = M.STAGE.w, H = M.STAGE.h;
    const showSecond = mode === 'place' || mode === 'measure';
    const pat = art.uid('dots');
    host.innerHTML = '<div class="astage-wrap"><svg class="astage" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="พื้นที่วัดมุม">' +
      '<defs><pattern id="' + pat + '" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="#b7a6e0" opacity=".55"/></pattern></defs>' +
      '<rect class="as-bg" x="3" y="3" width="' + (W - 6) + '" height="' + (H - 6) + '" rx="26" fill="#fffdf6" stroke="' + art.INK + '" stroke-width="4"/>' +
      '<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" rx="23" fill="url(#' + pat + ')"/>' +
      '<g class="as-fig"></g><g class="as-ring"></g><g class="as-ghost"></g>' +
      '<g class="as-prot"><g class="prot-art"></g><g class="as-glow"></g><g class="as-knob"></g></g>' +
      '<g class="as-over"></g></svg>' +
      '<div class="as-tools"><button class="icon-btn rot-btn" data-d="1" aria-label="หมุนทวนเข็มนาฬิกา"></button>' +
      '<span class="as-tip"></span><button class="icon-btn rot-btn" data-d="-1" aria-label="หมุนตามเข็มนาฬิกา"></button></div></div>';
    const svg = host.querySelector('.astage');
    const gFig = svg.querySelector('.as-fig'), gRing = svg.querySelector('.as-ring'), gGhost = svg.querySelector('.as-ghost');
    const gProt = svg.querySelector('.as-prot'), gArt = svg.querySelector('.prot-art'), gGlow = svg.querySelector('.as-glow'), gKnob = svg.querySelector('.as-knob');
    const gOver = svg.querySelector('.as-over');
    const tools = host.querySelector('.as-tools');
    const tip = host.querySelector('.as-tip');
    tools.querySelector('[data-d="1"]').innerHTML = art.icon('rotL');
    tools.querySelector('[data-d="-1"]').innerHTML = art.icon('rotR');
    gArt.innerHTML = art.protractorInner({ lite: !!cfg.lite, hl: [] });

    /* รูปมุม */
    gFig.innerHTML = art.figureMarkup(showSecond ? f : M.figure({ b: f.b, dir: 1, size: 0, V: f.V, len: f.len }), { wedge: showSecond });
    if (mode === 'build' || mode === 'fan') {
      /* ลูกศรบอกว่านี่คือแขนฐาน */
      const t = M.vec(f.b, f.len + 4);
      gFig.insertAdjacentHTML('beforeend', '<text x="' + (V.x + t.x * (f.b === 0 ? 1 : 1)) + '" y="' + (V.y + t.y - 12) + '" text-anchor="' + (Math.cos(M.rad(f.b)) >= 0 ? 'end' : 'start') + '" font-family="Mali, sans-serif" font-weight="700" font-size="13" fill="#2f7fd0" dx="' + (Math.cos(M.rad(f.b)) >= 0 ? '-4' : '4') + '">แขนฐาน</text>');
    }

    const S = { x: V.x - 115, y: V.y + 100, rot: 0, aligned: false, locked: false, mark: null, ray: null, armG: null, penOn: false, cleared: false };
    const ideal0 = mode === 'build' || mode === 'fan' ? M.upIdeal(f) : (function () {
      const all = M.ideals(f);
      const forced = cfg.idealId ? all.filter(i => i.id === cfg.idealId)[0] : null;
      if (forced) return forced;
      return all.slice().sort((a, b) => Math.sin(M.rad(b.rot + 90)) - Math.sin(M.rad(a.rot + 90)))[0];
    })();

    function applyP() {
      gProt.setAttribute('transform', 'translate(' + S.x.toFixed(1) + ' ' + S.y.toFixed(1) + ') rotate(' + (-S.rot).toFixed(1) + ')');
    }
    /* ปุ่มหมุนบนโพรแทรกเตอร์ */
    gKnob.innerHTML = '<g class="knob"><path d="M0 -' + (M.PROT.BODY + 2) + ' V-' + (KNOB - 15) + '" stroke="' + art.INK + '" stroke-width="3.4"/>' +
      '<circle cx="0" cy="-' + KNOB + '" r="15" fill="#ffd23f" stroke="' + art.INK + '" stroke-width="3.6"/>' +
      '<path d="M-6 -' + (KNOB - 1) + ' A7 7 0 1 1 6 -' + (KNOB - 1) + '" fill="none" stroke="' + art.INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M6 -' + (KNOB + 5) + ' L6 -' + (KNOB - 1) + ' L11 -' + (KNOB + 1) + '" fill="none" stroke="' + art.INK + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle class="knob-hit" cx="0" cy="-' + KNOB + '" r="30" fill="transparent"/></g>';

    /* ── ตำแหน่งเริ่มต้น ── */
    if (cfg.prot === 'ideal') {
      S.x = V.x; S.y = V.y; S.rot = ideal0.rot; S.aligned = true; S.locked = true;
    } else {
      S.x = 176; S.y = Math.min(H - 64, V.y + 96);
      const off = (M.R(24, 52)) * (Math.random() < 0.5 ? -1 : 1);
      S.rot = Math.round(M.norm360(ideal0.rot + off));
      /* ให้ปุ่มหมุนอยู่ในกรอบเสมอ และไม่เริ่มใกล้ท่าที่ถูก */
      const rotList = mode === 'build' || mode === 'fan' ? M.baseIdeals(f) : M.ideals(f);
      for (let k = 0; k < 24; k++) {
        const th = M.rad(S.rot + 90), kx = S.x + KNOB * Math.cos(th), ky = S.y - KNOB * Math.sin(th);
        const inside = kx >= 34 && kx <= W - 34 && ky >= 34 && ky <= H - 34;
        const nearIdeal = rotList.some(i => Math.abs(M.norm(i.rot - S.rot)) < 14);
        if (inside && !nearIdeal) break;
        S.rot = M.norm360(S.rot + 17);
      }
    }
    S.ideal = ideal0;
    applyP();
    function paintLock() {
      gKnob.style.display = S.locked ? 'none' : '';
      tools.style.display = (S.locked || mode === 'fan' || (mode === 'build' && cfg.prot === 'ideal')) ? 'none' : '';
      svg.classList.toggle('locked', S.locked);
      svg.classList.toggle('aligned', S.aligned);
    }
    paintLock();

    /* วงเรืองแสงที่จุดยอด */
    function ring(on) {
      gRing.innerHTML = on ? '<circle class="ring-pulse" cx="' + V.x + '" cy="' + V.y + '" r="26" fill="rgba(255,210,63,.28)" stroke="#ffb400" stroke-width="4" stroke-dasharray="7 6"/>' : '';
    }
    if (cfg.ring && !S.locked) ring(true);

    /* ภาพเงา (ใบ้ระดับ 3) */
    function ghost(on) {
      if (!on) { gGhost.innerHTML = ''; return; }
      const id = M.nearestIdeal(f, S) || ideal0;
      const B = M.PROT.BODY;
      gGhost.innerHTML = '<g transform="translate(' + V.x + ' ' + V.y + ') rotate(' + (-(mode === 'build' ? (M.baseIdeals(f).sort((a, b) => Math.abs(M.norm(a.rot - S.rot)) - Math.abs(M.norm(b.rot - S.rot)))[0].rot) : id.rot)).toFixed(1) + ')">' +
        '<path class="ghost-pulse" d="M' + (-B) + ' 30 L' + (-B) + ' 0 A' + B + ' ' + B + ' 0 0 1 ' + B + ' 0 L' + B + ' 30 Z" fill="rgba(255,210,63,.18)" stroke="#ffb400" stroke-width="4" stroke-dasharray="9 7"/></g>';
    }

    /* ── ไฮไลต์/เรืองแสงเมื่อวางถูก (measure) ── */
    function glow(chk) {
      gGlow.innerHTML = '';
      if (!chk) return;
      const otherAng = chk.base === 1 ? f.e : f.b;
      const lo = M.norm(otherAng - S.rot);
      const rr = chk.scale === 'outer' ? 124.5 : 92;
      const q = M.vec(lo, R + 12), c = M.vec(lo, rr);
      let h = '';
      if (cfg.glow) {
        h += '<path d="M0 0 L' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + '" stroke="#ffd23f" stroke-width="9" stroke-linecap="round" opacity=".55"/>';
        h += '<circle class="glow-ring" cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="13" fill="rgba(255,210,63,.3)" stroke="#ff9a1f" stroke-width="3.6"/>';
      }
      if (cfg.zeroCue) {
        const z = chk.scale === 'outer' ? [124.5, 0] : [-92, 0];
        h += '<circle class="hl-pulse" cx="' + z[0] + '" cy="' + z[1] + '" r="17" fill="rgba(255,210,63,.35)" stroke="#ffb400" stroke-width="3.5"/>';
      }
      gGlow.innerHTML = h;
    }
    function setCue(kind, on) {
      if (kind === 'ring') ring(on);
      else if (kind === 'ghost') ghost(on);
      else if (kind === 'zero') {
        cfg.zeroCue = on;
        if (S.aligned) glow(mode === 'measure' || mode === 'place' ? M.checkPlacement(f, S, tol) : null);
      } else if (kind === 'glow') {
        cfg.glow = on;
        if (S.aligned) glow(M.checkPlacement(f, S, tol));
      }
    }

    /* ── แปลงพิกัดจอ → พิกัด SVG ── */
    const pt = svg.createSVGPoint();
    function toSvg(e) {
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: p.x, y: p.y };
    }
    function tween(ms, fn, done) {
      const t0 = performance.now();
      const step = t => {
        const k = Math.min(1, (t - t0) / ms);
        fn(1 - Math.pow(1 - k, 3));
        if (k < 1) raf(step); else if (done) done();
      };
      raf(step);
    }
    function moveTo(x, y, rot, ms, done) {
      const x0 = S.x, y0 = S.y, r0 = S.rot, dr = M.norm(rot - r0);
      tween(ms || 160, k => { S.x = x0 + (x - x0) * k; S.y = y0 + (y - y0) * k; S.rot = r0 + dr * k; applyP(); }, () => { S.x = x; S.y = y; S.rot = M.norm360(rot); applyP(); if (done) done(); });
    }

    /* ── ตรวจเมื่อปล่อย : ดูดเข้าที่ถ้าใกล้พอ ── */
    function release(moved) {
      if (S.locked) return;
      const dist = Math.hypot(S.x - V.x, S.y - V.y);
      if (mode === 'place' || mode === 'measure') {
        const chk = M.checkPlacement(f, S, tol);
        const near = M.nearestIdeal(f, S);
        const rotErr = Math.abs(M.norm(near.rot - S.rot));
        if (dist <= 26 && rotErr <= tol.rot + 1) {
          lockAligned(near.rot);
        } else if (dist <= 26) {
          moveTo(V.x, V.y, S.rot, 140);
          if (cfg.onRelease) cfg.onRelease({ kind: chk.flipped ? 'flipped' : 'rot', dist: 0, rotErr, flipped: chk.flipped });
        } else if (moved && cfg.onRelease) {
          cfg.onRelease({ kind: 'far', dist, rotErr, flipped: chk.flipped });
        }
        return;
      }
      if (mode === 'build') {
        const bi = M.baseIdeals(f).sort((a, b) => Math.abs(M.norm(a.rot - S.rot)) - Math.abs(M.norm(b.rot - S.rot)))[0];
        const rotErr = Math.abs(M.norm(bi.rot - S.rot));
        if (dist <= 26 && rotErr <= tol.rot + 1) lockAligned(bi.rot);
        else if (dist <= 26) {
          moveTo(V.x, V.y, S.rot, 140);
          if (cfg.onRelease) cfg.onRelease({ kind: 'rot', dist: 0, rotErr });
        } else if (moved && cfg.onRelease) cfg.onRelease({ kind: 'far', dist, rotErr });
      }
    }
    function lockAligned(rot) {
      ring(false); ghost(false);
      moveTo(V.x, V.y, rot, 180, () => {
        S.aligned = true; S.locked = true;
        audio.sfx('snap');
        ui.sparkle(ui.center(svg.querySelector('.pr-center') || svg), 8);
        paintLock();
        let info = null;
        if (mode === 'place' || mode === 'measure') { info = M.checkPlacement(f, S, tol); glow(info); }
        if (mode === 'build') { info = M.checkBase(f, S, tol); S.penOn = true; svg.classList.add('pen'); }
        if (cfg.onAligned) cfg.onAligned(info);
      });
    }

    /* ── ลากเลื่อน / หมุนโพรแทรกเตอร์ ── */
    let drag = null, lastRatchet = 0;
    const cap = e => { try { svg.setPointerCapture(e.pointerId); } catch (err) {} };
    svg.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      const p = toSvg(e);
      if (S.locked) {
        if ((S.penOn && mode === 'build') && !S.ray) { e.preventDefault(); drag = { kind: 'pen' }; cap(e); penAt(p, true); }
        else if (mode === 'fan') { e.preventDefault(); drag = { kind: 'arm' }; cap(e); armAt(p, true); }
        return;
      }
      const onKnob = e.target.closest && e.target.closest('.knob');
      const onProt = e.target.closest && e.target.closest('.as-prot');
      if (onKnob) { e.preventDefault(); drag = { kind: 'rot' }; cap(e); rotAt(p); }
      else if (onProt) { e.preventDefault(); drag = { kind: 'move', dx: p.x - S.x, dy: p.y - S.y, moved: false }; cap(e); svg.classList.add('dragging'); ring(!!cfg.ring); }
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = toSvg(e);
      if (drag.kind === 'move') {
        const nx = M.clamp(p.x - drag.dx, 36, W - 36), ny = M.clamp(p.y - drag.dy, 48, H - 36);
        if (Math.hypot(nx - S.x, ny - S.y) > 1) drag.moved = true;
        S.x = nx; S.y = ny; applyP();
        const near = Math.hypot(S.x - V.x, S.y - V.y) <= 26;
        svg.classList.toggle('near', near);
      } else if (drag.kind === 'rot') rotAt(p);
      else if (drag.kind === 'pen') penAt(p, false);
      else if (drag.kind === 'arm') armAt(p, false);
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      svg.classList.remove('dragging', 'near');
      if (d.kind === 'move' || d.kind === 'rot') release(d.kind === 'rot' || d.moved);
      else if (d.kind === 'arm' && cfg.onArm) cfg.onArm(armReading());
      else if (d.kind === 'pen' && cfg.onMark && S.mark != null) cfg.onMark(S.mark.reading);
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    function rotAt(p) {
      let r = Math.round(M.angOf(p, S) - 90);
      r = M.norm360(r);
      /* ดูดเข้าท่าที่ถูก (ถ้าอยู่ใกล้ตำแหน่งที่ถูก) */
      const list = mode === 'build' ? M.baseIdeals(f) : M.ideals(f);
      list.forEach(i => { if (Math.abs(M.norm(i.rot - r)) <= 2) r = i.rot; });
      if (Math.abs(M.norm(r - lastRatchet)) >= 5) { lastRatchet = r; audio.sfx('ratchet'); }
      S.rot = r; applyP();
    }
    /* ปุ่มหมุนละเอียด 1 องศา (กดค้างได้) */
    tools.querySelectorAll('.rot-btn').forEach(b => {
      let hold = 0, rep = 0;
      const stepR = () => { S.rot = M.norm360(S.rot + (+b.dataset.d)); applyP(); audio.sfx('ratchet'); };
      b.addEventListener('pointerdown', e => {
        if (S.locked) return;
        e.preventDefault();
        stepR();
        hold = setTimeout(() => { rep = setInterval(stepR, 70); }, 380);
      });
      const stop = () => {
        const was = hold || rep;
        clearTimeout(hold); clearInterval(rep); hold = rep = 0;
        if (was && !S.locked) {
          const list = mode === 'build' ? M.baseIdeals(f) : M.ideals(f);
          list.forEach(i => { if (Math.abs(M.norm(i.rot - S.rot)) <= 2) { S.rot = i.rot; applyP(); } });
          release(true);
        }
      };
      b.addEventListener('pointerup', stop);
      b.addEventListener('pointerleave', stop);
      b.addEventListener('pointercancel', stop);
    });

    /* ── โหมดสร้างมุม : ทำเครื่องหมายที่ขอบสเกล ── */
    function penAt(p, first) {
      const g0 = M.angOf(p, V);
      let l = M.norm(g0 - S.rot);
      if (l < 0) l = l >= -90 ? 0 : 180;
      const scale = (S.baseScale = S.baseScale || M.checkBase(f, S, tol).scale || 'outer');
      let r = scale === 'inner' ? 180 - l : l;
      r = Math.round(M.clamp(r, 0, 180));
      const l2 = scale === 'inner' ? 180 - r : r;
      const g = S.rot + l2;
      if (!S.mark || S.mark.reading !== r) { if (first || !S.mark || Math.abs(S.mark.reading - r) >= 1) audio.sfx(r % 5 === 0 ? 'tock' : 'ratchet'); }
      S.mark = { reading: r, g: M.norm360(g), scale };
      paintMark();
    }
    function paintMark() {
      if (!S.mark) { gOver.innerHTML = ''; return; }
      const m = S.mark, a = M.vec(m.g, R + 9), b = M.vec(m.g, R + 40);
      let h = '<path d="M' + V.x + ' ' + V.y + ' l' + (a.x).toFixed(1) + ' ' + (a.y).toFixed(1) + '" stroke="#ff3b8a" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round" opacity=".9"/>';
      h += '<g transform="translate(' + (V.x + a.x).toFixed(1) + ' ' + (V.y + a.y).toFixed(1) + ')"><circle r="8" fill="#ff3b8a" stroke="' + art.INK + '" stroke-width="3.4"/><circle r="2.6" fill="#fff"/></g>';
      if (cfg.readout) {
        const tx = V.x + b.x, ty = V.y + b.y;
        h += '<g transform="translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')"><rect x="-27" y="-15" width="54" height="30" rx="15" fill="#fff" stroke="' + art.INK + '" stroke-width="3.2"/><text text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="19" fill="' + (m.scale === 'inner' ? ORNG : BLUE) + '">' + m.reading + '°</text></g>';
      }
      gOver.innerHTML = h;
    }
    const BLUE = '#1d4ed8', ORNG = '#c2410c';
    /* วาดแขนที่สอง ตามเครื่องหมายที่ทำไว้ */
    function drawRay() {
      return new Promise(resolve => {
        if (!S.mark) { resolve(null); return; }
        const m = S.mark, e = M.vec(m.g, f.len);
        audio.sfx('draw');
        S.ray = { reading: m.reading, g: m.g };
        S.penOn = false;
        const sweep = M.norm(m.g - f.b) >= 0 ? 0 : 1;
        const r = 40, a = M.vec(f.b, r), b = M.vec(m.g, r);
        let h = '<path class="ray-wedge" d="M' + V.x + ' ' + V.y + ' L' + (V.x + a.x).toFixed(1) + ' ' + (V.y + a.y).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + (V.x + b.x).toFixed(1) + ' ' + (V.y + b.y).toFixed(1) + ' Z" fill="rgba(255,95,162,.28)" stroke="#ff5fa2" stroke-width="2.4" stroke-linejoin="round" opacity="0"/>';
        h += '<path class="ray-out" d="M' + V.x + ' ' + V.y + ' l' + e.x.toFixed(1) + ' ' + e.y.toFixed(1) + '" stroke="' + art.INK + '" stroke-width="9" stroke-linecap="round" fill="none"/>';
        h += '<path class="ray-in" d="M' + V.x + ' ' + V.y + ' l' + e.x.toFixed(1) + ' ' + e.y.toFixed(1) + '" stroke="#ff5fa2" stroke-width="5" stroke-linecap="round" fill="none"/>';
        h += '<circle cx="' + V.x + '" cy="' + V.y + '" r="8.5" fill="#ffd23f" stroke="' + art.INK + '" stroke-width="3.4"/>';
        gOver.innerHTML = h;
        const len = f.len + 2;
        gOver.querySelectorAll('.ray-out,.ray-in').forEach(p => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
        tween(520, k => {
          gOver.querySelectorAll('.ray-out,.ray-in').forEach(p => { p.style.strokeDashoffset = len * (1 - k); });
          const w = gOver.querySelector('.ray-wedge'); if (w) w.setAttribute('opacity', k);
        }, () => resolve({ reading: m.reading, g: m.g }));
      });
    }
    function clearRay() { S.ray = null; S.penOn = true; paintMark(); }
    function shown(on) { /* ให้ภาพแขนที่สองของรูปเดิม (กรณีสาธิต) */ }

    /* ── โหมดลากแขน (fan) ── */
    function armAt(p, first) {
      const g0 = M.angOf(p, V);
      let l = M.norm(g0 - S.rot);
      if (l < 0) l = l >= -90 ? 0 : 180;
      const r = Math.round(M.clamp(l, 0, 180));
      if (S.armG == null || S.arm !== r) audio.sfx(r % 10 === 0 ? 'tock' : 'ratchet');
      S.arm = r;
      S.armG = M.norm360(S.rot + r);
      paintArm();
    }
    function armReading() { return S.arm; }
    function paintArm() {
      const r = S.arm, g = S.armG, e = M.vec(g, f.len), tip = M.vec(g, f.len + 2);
      const a1 = M.vec(S.rot, 44), a2 = M.vec(g, 44);
      let h = '';
      if (r > 0) h += '<path d="M' + V.x + ' ' + V.y + ' L' + (V.x + a1.x).toFixed(1) + ' ' + (V.y + a1.y).toFixed(1) + ' A44 44 0 0 0 ' + (V.x + a2.x).toFixed(1) + ' ' + (V.y + a2.y).toFixed(1) + ' Z" fill="rgba(255,95,162,.3)" stroke="#ff5fa2" stroke-width="2.4" stroke-linejoin="round"/>';
      h += '<path d="M' + V.x + ' ' + V.y + ' l' + e.x.toFixed(1) + ' ' + e.y.toFixed(1) + '" stroke="' + art.INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + V.x + ' ' + V.y + ' l' + e.x.toFixed(1) + ' ' + e.y.toFixed(1) + '" stroke="#ff5fa2" stroke-width="5" stroke-linecap="round"/>';
      if (r === 90) { const u = M.vec(S.rot, 28), v = M.vec(g, 28), w = { x: u.x + v.x, y: u.y + v.y }; h += '<path d="M' + (V.x + u.x).toFixed(1) + ' ' + (V.y + u.y).toFixed(1) + ' L' + (V.x + w.x).toFixed(1) + ' ' + (V.y + w.y).toFixed(1) + ' L' + (V.x + v.x).toFixed(1) + ' ' + (V.y + v.y).toFixed(1) + '" fill="none" stroke="#12a05a" stroke-width="4" stroke-linejoin="round"/>'; }
      h += '<circle cx="' + V.x + '" cy="' + V.y + '" r="8.5" fill="#ffd23f" stroke="' + art.INK + '" stroke-width="3.4"/>';
      h += '<g class="arm-handle" transform="translate(' + (V.x + tip.x).toFixed(1) + ' ' + (V.y + tip.y).toFixed(1) + ')"><circle r="15" fill="#ff5fa2" stroke="' + art.INK + '" stroke-width="3.6"/><circle r="5" fill="#fff"/></g>';
      const t = M.vec(g, f.len + 36);
      const tx = M.clamp(V.x + t.x, 34, W - 34), ty = M.clamp(V.y + t.y, 24, H - 20);
      h += '<g transform="translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')"><rect x="-32" y="-16" width="64" height="32" rx="16" fill="#fff" stroke="' + art.INK + '" stroke-width="3.2"/><text text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="21" fill="' + BLUE + '">' + r + '°</text></g>';
      gOver.innerHTML = h;
    }
    if (mode === 'fan') { S.arm = cfg.startDeg == null ? 25 : cfg.startDeg; S.armG = M.norm360(S.rot + S.arm); paintArm(); }
    if (S.aligned && mode === 'build') { S.penOn = true; svg.classList.add('pen'); }
    if (S.aligned && (mode === 'measure' || mode === 'place')) glow(M.checkPlacement(f, S, tol));

    /* ── API ── */
    const api = {
      svg, host, state: () => ({ x: S.x, y: S.y, rot: S.rot, aligned: S.aligned, mark: S.mark, ray: S.ray, arm: S.arm }),
      aligned: () => S.aligned,
      ideal: () => ideal0,
      cue: setCue,
      markReading: () => S.mark ? S.mark.reading : null,
      mark: () => S.mark,
      scale: () => S.baseScale || (S.aligned && mode === 'build' ? M.checkBase(f, S, tol).scale : null),
      setMark(r) { if (!S.aligned || mode !== 'build') return; const sc = S.baseScale = S.baseScale || M.checkBase(f, S, tol).scale; const l = sc === 'inner' ? 180 - r : r; S.mark = { reading: r, g: M.norm360(S.rot + l), scale: sc }; paintMark(); },
      drawRay, clearRay,
      setArm(r) { S.arm = r; S.armG = M.norm360(S.rot + r); paintArm(); },
      lock() { S.locked = true; paintLock(); },
      unlock() { S.locked = false; S.aligned = false; S.penOn = false; S.mark = null; S.baseScale = null; S.ray = null; gOver.innerHTML = ''; gGlow.innerHTML = ''; paintLock(); if (cfg.ring) ring(true); },
      /* ให้โพรแทรกเตอร์เข้าที่ถูกเอง (ปุ่มช่วย) */
      solve(cb) {
        if (S.locked && S.aligned) { if (cb) cb(); return; }
        S.locked = false;
        const rot = mode === 'build' ? (M.baseIdeals(f).sort((a, b) => Math.abs(M.norm(a.rot - S.rot)) - Math.abs(M.norm(b.rot - S.rot)))[0]).rot : (M.nearestIdeal(f, S) || ideal0).rot;
        moveTo(V.x, V.y, rot, 380, () => { lockAligned(rot); if (cb) setTimeout(cb, 260); });
      },
      tip(t) { tip.textContent = t || ''; },
      destroy() { activePad = null; }
    };
    api.fig = f; AP._stage = api; /* ใช้ทดสอบ */
    return api;
  }

  /* ══════════ 4) PARTS MAP : แตะส่วนประกอบของโพรแทรกเตอร์ ══════════ */
  function partsMap(host, o) {
    host.innerHTML = '<div class="parts-wrap"><svg class="parts-svg" viewBox="-174 -178 348 232"><g class="pm-art"></g><g class="pm-hl"></g><g class="pm-labels"></g></svg></div>';
    const svg = host.querySelector('.parts-svg');
    svg.querySelector('.pm-art').innerHTML = art.protractorInner({ lite: true, hl: [] });
    const hl = svg.querySelector('.pm-hl'), labels = svg.querySelector('.pm-labels');
    const pt = svg.createSVGPoint();
    let locked = false;
    function toLocal(e) {
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: p.x, y: p.y };
    }
    /* y ลบ = เหนือเส้นฐาน (พื้นที่สเกล), y บวก = ใต้เส้นฐาน (แถบฐาน) */
    function partAt(p) {
      const r = Math.hypot(p.x, p.y);
      if (r <= 22) return 'center';
      if (Math.hypot(p.x - 124.5, p.y) <= 20) return 'zeroOut';
      if (Math.hypot(p.x + 92, p.y) <= 20) return 'zeroIn';
      if (Math.abs(p.y) <= 10 && Math.abs(p.x) <= 160) return 'base';
      if (p.y < 0 && r >= 115 && r <= 150) return 'outer';
      if (p.y < 0 && r >= 82 && r <= 114) return 'inner';
      return null;
    }
    svg.addEventListener('pointerdown', e => {
      if (locked) return;
      e.preventDefault();
      const part = partAt(toLocal(e));
      if (part && o.onPick) o.onPick(part);
      else if (o.onMiss) o.onMiss();
    });
    return {
      svg,
      lock() { locked = true; },
      show(part, cls) {
        const z = art.protractorInner({ lite: true, hl: [part] });
        /* แสดงเฉพาะส่วนไฮไลต์ที่ถูกเพิ่มเข้ามา */
        const tmp = document.createElementNS(NS, 'g');
        tmp.innerHTML = z;
        Array.from(tmp.querySelectorAll('.hl-pulse')).forEach(n => { if (cls) n.classList.add(cls); hl.appendChild(n); });
      },
      label(part, text, col) {
        const pos = { center: [0, 56, 'middle'], base: [-120, 24, 'middle'], zeroOut: [120, 36, 'middle'], zeroIn: [-92, 36, 'middle'], outer: [0, -158, 'middle'], inner: [0, -80, 'middle'] }[part];
        if (!pos) return;
        const w = text.length * 8 + 22;
        labels.insertAdjacentHTML('beforeend', '<g class="lbl-in" transform="translate(' + pos[0] + ' ' + pos[1] + ')"><rect x="' + (-w / 2) + '" y="-12" width="' + w + '" height="24" rx="12" fill="' + (col || '#ff5fa2') + '" stroke="' + art.INK + '" stroke-width="2.6"/><text text-anchor="middle" dy=".36em" font-family="Mali, sans-serif" font-weight="700" font-size="13" fill="#fff">' + text + '</text></g>');
      },
      pulse(part, on) {
        hl.innerHTML = '';
        if (on) this.show(part);
      }
    };
  }

  AP.W = { numpad, choice, angleStage, partsMap };
})();
