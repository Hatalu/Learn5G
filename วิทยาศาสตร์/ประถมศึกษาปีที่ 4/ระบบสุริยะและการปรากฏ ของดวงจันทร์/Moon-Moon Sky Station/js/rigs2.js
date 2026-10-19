/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ตัวทดลองแบบโต้ตอบ ชุดระบบสุริยะ
   orbitMap (แผนผังวงโคจร) · orbitBuilder (สร้างแบบจำลองระบบสุริยะ) · orbitRace (เทียบคาบการโคจร) · periodTable (ตารางคาบ)
   * ระยะห่างและขนาดในแผนผัง "ไม่ใช่สัดส่วนจริง" ใช้เทียบลำดับและการเคลื่อนที่เท่านั้น
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK;
  const { art, ui, audio } = SK;
  const INK = art.INK;
  const W = SK.W = SK.W || {};
  const { clamp } = SK;
  const f1 = n => (+n).toFixed(1);
  const rad = d => d * Math.PI / 180;
  const CX = 150, CY = 150;
  const ANG = [200, 40, 300, 130, 250, 20, 160, 330];     // มุมเริ่มต้นของแต่ละดวงให้กระจายสวย
  const radiusOf = (k, n) => n <= 1 ? 40 : 34 + k * (134 - 34) / (n - 1);
  const pr = id => clamp(SK.PLID[id].size * 0.78, 5, 10.5);
  const polar = (r, a) => [CX + r * Math.cos(rad(a)), CY - r * Math.sin(rad(a))];

  /* พื้นหลัง + ดวงอาทิตย์ + วงโคจร (ใช้ร่วมกัน) */
  function baseSvg(n, o) {
    o = o || {};
    let h = '<defs><linearGradient id="obg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2250"/><stop offset="1" stop-color="#2f3a8c"/></linearGradient></defs><rect width="300" height="300" rx="24" fill="url(#obg)"/>';
    for (let i = 0; i < 26; i++) h += '<circle class="bgstar" style="animation-delay:' + ((i * 0.43) % 4).toFixed(2) + 's" cx="' + ((i * 71) % 290 + 5) + '" cy="' + ((i * 43) % 290 + 5) + '" r="' + (0.8 + (i % 3) * 0.5) + '" fill="#fff6c2" opacity=".7"/>';
    for (let k = 0; k < n; k++) {
      const r = radiusOf(k, n), hl = o.highlight && o.highlight.indexOf(k) >= 0;
      h += '<circle class="ob-orbit' + (hl ? ' hl' : '') + '" data-k="' + k + '" cx="' + CX + '" cy="' + CY + '" r="' + f1(r) + '" fill="none" stroke="' + (hl ? '#ffd23f' : '#fff6c2') + '" stroke-width="' + (hl ? 4 : 2) + '" ' + (hl ? '' : 'stroke-dasharray="3 6"') + ' opacity="' + (hl ? 1 : 0.6) + '"/>';
    }
    h += '<g transform="translate(' + CX + ' ' + CY + ')">' + art.sun(o.sunR || 14, false) + '</g>';
    return h;
  }
  function planetAt(id, r, a, withName) {
    const p = polar(r, a), pri = pr(id);
    return '<g class="ob-pl" data-id="' + id + '" transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ')">' + art.planet(id, pri) +
      (withName ? '<text y="' + f1(pri + 11) + '" font-size="10.5" font-weight="800" fill="#fff" stroke="' + INK + '" stroke-width="2.6" paint-order="stroke" text-anchor="middle" font-family="Mali">' + SK.plName(id) + '</text>' : '') + '</g>';
  }

  /* ════════════════════════════════════════════════════
     orbitMap : แผนผังวงโคจรนิ่ง ๆ
     cfg = {ids, highlight:[ids], names, sizeCls}
     ════════════════════════════════════════════════════ */
  function orbitMap(host, cfg) {
    const ids = cfg.ids || SK.PL.map(p => p.id), n = ids.length;
    const hk = (cfg.highlight || []).map(id => ids.indexOf(id)).filter(k => k >= 0);
    let h = baseSvg(n, { highlight: hk });
    ids.forEach((id, k) => { h += planetAt(id, radiusOf(k, n), ANG[SK.PLID[id].rank], cfg.names !== false || (cfg.highlight || []).indexOf(id) >= 0 && cfg.nameHl); });
    if (cfg.pulse) hk.forEach(k => { const p = polar(radiusOf(k, n), ANG[SK.PLID[ids[k]].rank]); h += '<circle class="moon-hint" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + (pr(ids[k]) + 7) + '" fill="none" stroke="#ffd23f" stroke-width="3"/>'; });
    host.innerHTML = '<div class="omap ' + (cfg.sizeCls || '') + '"><svg viewBox="0 0 300 300" aria-label="แผนผังระบบสุริยะ">' + h + '</svg><p class="omap-note">ไม่ใช่ขนาดและระยะจริง · ใช้ดูลำดับจากดวงอาทิตย์ออกไป</p></div>';
    return { svg: host.querySelector('svg'), radiusOf: k => radiusOf(k, n) };
  }

  /* ════════════════════════════════════════════════════
     orbitBuilder : วางดาวเคราะห์ลงวงโคจร (แตะการ์ดแล้วแตะวง หรือลากไปวางบนวง)
     cfg = {ids (เรียงตามลำดับจริงจากดวงอาทิตย์), order (ลำดับการ์ดที่แสดง), hideName, showPeriod, onRight(id,k), onWrong(id,k,card), onDone()}
     ════════════════════════════════════════════════════ */
  function orbitBuilder(host, cfg) {
    const ids = cfg.ids, n = ids.length, order = cfg.order || SK.shuffle(ids);
    const cardHtml = id => art.planetSvg(id, 46) + (cfg.hideName ? '' : '<b>' + SK.plName(id) + '</b>') + (cfg.showPeriod ? '<small>' + SK.PLID[id].per + '</small>' : '');
    host.innerHTML = '<div class="obuild"><div class="omap"><svg viewBox="0 0 300 300" aria-label="วงโคจรของระบบสุริยะ"></svg><p class="omap-note">ดวงอาทิตย์อยู่ตรงกลาง · วงเล็กอยู่ใกล้ วงใหญ่อยู่ไกล</p></div>' +
      '<div class="ob-tray">' + order.map(id => '<button class="icard-btn ob-card" data-id="' + id + '">' + cardHtml(id) + '</button>').join('') + '</div></div>';
    const svg = host.querySelector('svg');
    const placed = {};
    function draw() {
      let h = baseSvg(n);
      for (let k = 0; k < n; k++) {
        const r = radiusOf(k, n), pt = polar(r, 90 + k * 13); // กระจายมุมเลขวงให้ไม่ทับกัน
        h += '<circle class="ob-hit" data-k="' + k + '" cx="' + CX + '" cy="' + CY + '" r="' + f1(r) + '" fill="none" stroke="transparent" stroke-width="22" pointer-events="stroke" style="cursor:pointer"/>' +
          '<g transform="translate(' + f1(pt[0]) + ' ' + f1(pt[1]) + ')"><circle r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><text y="4" font-size="11" font-weight="800" fill="' + INK + '" text-anchor="middle" font-family="Mali">' + (k + 1) + '</text></g>';
        if (placed[k]) h += planetAt(placed[k], r, ANG[SK.PLID[placed[k]].rank], true);
      }
      svg.innerHTML = h;
      svg.querySelectorAll('.ob-hit').forEach(c => c.addEventListener('click', () => { if (selected) put(selected, +c.dataset.k); }));
    }
    const cards = Array.from(host.querySelectorAll('.ob-card'));
    let selected = null, remaining = n, ghost = null;
    const select = c => { cards.forEach(x => x.classList.toggle('sel', x === c)); selected = c; svg.classList.toggle('armed', !!c); };
    function put(card, k) {
      const id = card.dataset.id;
      if (placed[k]) { audio.sfx('tick'); return; }
      if (ids[k] !== id) { audio.sfx('gentle'); ui.shake(card); if (cfg.onWrong) cfg.onWrong(id, k, card); return; }
      placed[k] = id; remaining--;
      draw();
      audio.sfx('snapin');
      const pe = svg.querySelector('.ob-pl[data-id="' + id + '"]'); if (pe) ui.sparkle(ui.center(pe), 8);
      if (SK.know) SK.know('planet', id);
      card.remove(); selected = null; svg.classList.remove('armed');
      if (cfg.onRight) cfg.onRight(id, k);
      if (!remaining && cfg.onDone) setTimeout(cfg.onDone, 400);
    }
    function orbitAt(p) {
      const q = W.svgPt(svg, p), d = Math.hypot(q.x - CX, q.y - CY);
      let best = -1, bd = 1e9;
      for (let k = 0; k < n; k++) { const e = Math.abs(d - radiusOf(k, n)); if (e < bd) { bd = e; best = k; } }
      return bd <= Math.max(14, 120 / n) ? best : -1;
    }
    cards.forEach(c => ui.drag(c, {
      onStart() { audio.unlock(); return true; },
      onMove(p, e, moved) {
        if (!moved) return;
        if (!ghost) { ghost = c.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.style.width = c.offsetWidth + 'px'; document.body.appendChild(ghost); c.classList.add('lifting'); select(c); }
        ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
      },
      onEnd(p, e, moved) {
        if (ghost) { ghost.remove(); ghost = null; }
        c.classList.remove('lifting');
        if (moved) { const k = orbitAt(p); if (k >= 0) put(c, k); return; }
        audio.sfx('pop', 0); select(selected === c ? null : c);
      }
    }));
    draw();
    return { svg, place(id) { const c = cards.find(x => x.dataset.id === id && x.isConnected); if (c) put(c, ids.indexOf(id)); }, remaining: () => remaining, cards };
  }

  /* ════════════════════════════════════════════════════
     orbitRace : ปล่อยเวลาเดินหน้า ดูว่าใครโคจรครบรอบก่อน
     cfg = {ids, spanYears, unit:'day'|'year', ms, onEnd(), onLap(id)}
     ทุกดวงเริ่มพร้อมกันที่เส้นสตาร์ทด้านบน · มุม = 360 × เวลา ÷ คาบ
     ════════════════════════════════════════════════════ */
  function orbitRace(host, cfg) {
    const ids = cfg.ids, n = ids.length, span = cfg.spanYears, ms = cfg.ms || 9000;
    let frac = 0, anim = null, done = false;
    const chips = ids.map(id => '<div class="lap-chip" data-id="' + id + '">' + art.planetSvg(id, 26) + '<b>' + SK.plName(id) + '</b><span class="lap-n">0.0</span><small>รอบ</small></div>').join('');
    host.innerHTML = '<div class="orace"><div class="omap"><svg viewBox="0 0 300 300" aria-label="แบบจำลองการโคจรรอบดวงอาทิตย์"></svg><p class="omap-note">ไม่ใช่ขนาดและระยะจริง · ทุกดวงเริ่มพร้อมกันที่เส้นสตาร์ท</p></div>' +
      '<div class="orace-side"><div class="orace-time"><b class="ot-t"></b><span class="ot-u"></span></div>' +
      '<div class="orace-ctl"><button class="btn btn-sm btn-go or-play">' + art.icon('play') + '<span>ปล่อยเวลาเดิน</span></button><button class="btn btn-sm btn-soft or-reset">' + art.icon('refresh') + '<span>เริ่มใหม่</span></button></div>' +
      '<input class="orace-range" type="range" min="0" max="1000" value="0" aria-label="เลื่อนเวลา"><div class="lap-chips">' + chips + '</div></div></div>';
    const svg = host.querySelector('svg'), play = host.querySelector('.or-play'), reset = host.querySelector('.or-reset'), rng = host.querySelector('.orace-range');
    const tEl = host.querySelector('.ot-t'), uEl = host.querySelector('.ot-u');
    let base = baseSvg(n);
    const sp = polar(radiusOf(n - 1, n) + 9, 90);
    base += '<line x1="' + CX + '" y1="' + CY + '" x2="' + CX + '" y2="' + f1(sp[1]) + '" stroke="#fff" stroke-width="2.4" stroke-dasharray="4 4" opacity=".85"/>' + art.at(art.flag('#ff5a6e'), CX - 3, f1(sp[1]) - 22, 22, 27);
    const lastLap = {};
    function paint() {
      let h = base;
      ids.forEach((id, k) => {
        const yrs = SK.PLID[id].yrs, laps = span * frac / yrs, a = 90 + 360 * laps;
        h += planetAt(id, radiusOf(k, n), a, false);
        const chipEl = host.querySelector('.lap-chip[data-id="' + id + '"]');
        chipEl.querySelector('.lap-n').textContent = laps < 10 ? laps.toFixed(1) : String(Math.floor(laps));
        chipEl.classList.toggle('done', laps >= 1);
        const fl = Math.floor(laps + 1e-9);
        if (fl > (lastLap[id] || 0)) { lastLap[id] = fl; ui.restart(chipEl, 'lapflash'); audio.sfx('lap'); if (cfg.onLap) cfg.onLap(id, fl); }
        else if (fl < (lastLap[id] || 0)) lastLap[id] = fl;
      });
      svg.innerHTML = h;
      const val = span * frac;
      if (cfg.unit === 'day') { tEl.textContent = String(Math.round(val * 365)); uEl.textContent = 'วัน (จาก ' + Math.round(span * 365) + ' วัน)'; }
      else { tEl.textContent = val < 10 ? val.toFixed(1) : String(Math.round(val)); uEl.textContent = 'ปีโลก (จาก ' + span + ' ปี)'; }
      rng.value = Math.round(frac * 1000);
    }
    function setPlayUi(on) { play.querySelector('span').textContent = on ? 'หยุดชั่วคราว' : (frac >= 1 ? 'ดูอีกครั้ง' : 'ปล่อยเวลาเดิน'); play.querySelector('svg').outerHTML = art.icon(on ? 'pause' : 'play'); }
    function pause() { if (anim) { anim.cancel(); anim = null; } setPlayUi(false); }
    function start() {
      if (anim) { pause(); return; }
      if (frac >= 1) { frac = 0; Object.keys(lastLap).forEach(k => { lastLap[k] = 0; }); done = false; }
      const from = frac;
      setPlayUi(true);
      audio.sfx('swoosh');
      anim = ui.tween(ms * (1 - from) + 200, k => { frac = from + (1 - from) * k; paint(); }, () => {
        anim = null; frac = 1; paint(); setPlayUi(false);
        if (!done) { done = true; if (cfg.onEnd) cfg.onEnd(); }
      }, ui.ease.linear);
    }
    play.addEventListener('click', () => { audio.unlock(); start(); });
    reset.addEventListener('click', () => { pause(); frac = 0; done = false; Object.keys(lastLap).forEach(k => { lastLap[k] = 0; }); audio.sfx('tick'); paint(); setPlayUi(false); });
    rng.addEventListener('input', () => { audio.unlock(); pause(); frac = +rng.value / 1000; paint(); if (frac >= 1 && !done) { done = true; if (cfg.onEnd) cfg.onEnd(); } });
    paint();
    return { svg, play: start, pause, setFrac(f) { pause(); frac = clamp(f, 0, 1); paint(); }, frac: () => frac, isDone: () => done,
      laps: id => span * frac / SK.PLID[id].yrs, runToEnd() { pause(); frac = 1; paint(); if (!done) { done = true; if (cfg.onEnd) cfg.onEnd(); } } };
  }

  /* ════════════════════════════════════════════════════
     periodTable : ตารางคาบการโคจร (แท่งยาว = ใช้เวลานาน ย่อสเกลเพื่อให้ดูได้)
     cfg = {ids, highlight:[ids], hideValue:[ids]}
     ════════════════════════════════════════════════════ */
  function periodTable(host, cfg) {
    const ids = cfg.ids, maxY = Math.max.apply(null, SK.PL.map(p => p.yrs));
    host.innerHTML = '<div class="ptable">' + ids.map(id => {
      const p = SK.PLID[id], w = Math.max(4, 100 * Math.sqrt(p.yrs / maxY));
      return '<div class="pt-row' + ((cfg.highlight || []).indexOf(id) >= 0 ? ' hl' : '') + '" data-id="' + id + '">' + art.planetSvg(id, 34) + '<b>' + p.n + '</b>' +
        '<span class="pt-bar"><i style="width:' + f1(w) + '%;background:' + p.c2 + '"></i></span><span class="pt-v">' + ((cfg.hideValue || []).indexOf(id) >= 0 ? '?' : p.per) + '</span></div>';
    }).join('') + '<p class="omap-note">แท่งยาว = ใช้เวลาโคจรครบ 1 รอบนาน (ย่อสเกลเพื่อให้ดูง่าย)</p></div>';
    return {};
  }

  Object.assign(W, { orbitMap, orbitBuilder, orbitRace, periodTable });
})();
