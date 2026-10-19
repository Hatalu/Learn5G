/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ตัวทดลองแบบโต้ตอบ (rigs) ชุดดวงจันทร์
   choice · sortBins · skyRig (เส้นทางขึ้น-ตก + โลกหมุน) · moonLog (หลักฐานเวลาขึ้น)
   phaseLab (แบบจำลองแสงจันทร์) · cycleRing (วงปฏิทินดวงจันทร์) · dayDial (หมุนวัน)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK;
  const { art, ui, audio } = SK;
  const INK = art.INK;
  const W = SK.W = SK.W || {};
  const { clamp, mod } = SK;
  const f1 = n => (+n).toFixed(1);
  const rad = d => d * Math.PI / 180;

  /* พิกัดจอ → พิกัดใน svg (รองรับการย่อ-ขยายด้วย transform) */
  function svgPt(svg, p) {
    const pt = svg.createSVGPoint();
    pt.x = p.x; pt.y = p.y;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }
  const chip = (txt, cls) => '<span class="rchip ' + (cls || '') + '">' + txt + '</span>';

  /* ════════════════════════════════════════════════════
     choice : ปุ่มตัวเลือก
     ════════════════════════════════════════════════════ */
  function choice(host, o) {
    host.innerHTML = '<div class="opts ' + (o.cls || '') + '">' + o.options.map((op, i) =>
      '<button class="opt" data-i="' + i + '">' + op.html + '</button>').join('') + '</div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.opt'));
    btns.forEach((b, i) => b.addEventListener('click', () => { if (!locked && !b.disabled) { audio.unlock(); o.onPick(o.options[i].value, b, i); } }));
    return {
      btns,
      lock() { locked = true; btns.forEach(b => b.classList.add('done')); },
      mark(value, cls) { btns.forEach((b, i) => { if (o.options[i].value === value) b.classList.add(cls); }); },
      dim(b) { b.disabled = true; b.classList.add('dim'); }
    };
  }

  /* ════════════════════════════════════════════════════
     sortBins : ลากการ์ดลงถัง (หรือแตะการ์ดแล้วแตะถัง)
     cfg = {items:[{id, html}], bins:[{id,label,icon,color,note}], answer(item)→binId, onRight, onWrong(item,binId,card), onDone()}
     ════════════════════════════════════════════════════ */
  function sortBins(host, cfg) {
    const items = cfg.items.slice();
    host.innerHTML = '<div class="sorter"><div class="sort-tray">' + items.map(it =>
      '<div class="scard text" data-id="' + it.id + '" tabindex="0"><div class="scard-txt">' + it.html + '</div></div>').join('') +
      '</div><div class="sort-bins">' + cfg.bins.map(b =>
      '<div class="bin" data-id="' + b.id + '" style="--bc:' + b.color + '"><div class="bin-h">' + (b.icon ? art.icon(b.icon) : '') + '<b>' + b.label + '</b></div>' + (b.note ? '<small>' + b.note + '</small>' : '') + '<div class="bin-in"></div></div>').join('') + '</div></div>';
    const tray = host.querySelector('.sort-tray');
    const bins = Array.from(host.querySelectorAll('.bin'));
    let selected = null, remaining = items.length;
    const cardOf = id => tray.querySelector('.scard[data-id="' + id + '"]');
    const itemOf = id => items.find(i => i.id === id);
    function select(card) {
      tray.querySelectorAll('.scard').forEach(c => c.classList.toggle('sel', c === card));
      selected = card || null;
    }
    function drop(card, bin) {
      if (!card || !bin) return;
      const it = itemOf(card.dataset.id);
      if (cfg.answer(it) !== bin.dataset.id) {
        audio.sfx('gentle'); ui.shake(card);
        if (cfg.onWrong) cfg.onWrong(it, bin.dataset.id, card, bin);
        return;
      }
      audio.sfx('pop', 2);
      const mini = document.createElement('span');
      mini.className = 'bin-mini';
      mini.innerHTML = '<em>' + (it.short || '') + '</em>';
      bin.querySelector('.bin-in').appendChild(mini);
      ui.restart(mini, 'pop');
      ui.sparkle(ui.center(bin), 6);
      card.remove(); selected = null; remaining--;
      if (cfg.onRight) cfg.onRight(it, bin.dataset.id);
      if (remaining === 0 && cfg.onDone) setTimeout(cfg.onDone, 350);
    }
    function binAt(p) {
      for (const el of document.elementsFromPoint(p.x, p.y)) { const b = el.closest && el.closest('.bin'); if (b && host.contains(b)) return b; }
      return null;
    }
    tray.querySelectorAll('.scard').forEach(card => {
      let ghost = null;
      ui.drag(card, {
        onStart() { audio.unlock(); return true; },
        onMove(p, e, moved) {
          if (!moved) return;
          if (!ghost) {
            ghost = card.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.style.width = card.offsetWidth + 'px';
            document.body.appendChild(ghost); card.classList.add('lifting'); select(card);
          }
          ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
          const b = binAt(p); bins.forEach(x => x.classList.toggle('near', x === b));
        },
        onEnd(p, e, moved) {
          if (ghost) { ghost.remove(); ghost = null; }
          card.classList.remove('lifting'); bins.forEach(x => x.classList.remove('near'));
          if (moved) { drop(card, binAt(p)); return; }
          audio.sfx('pop', 0);
          select(selected === card ? null : card);
        }
      });
    });
    bins.forEach(b => b.addEventListener('click', () => { if (selected) drop(selected, b); }));
    return { select, drop, place(id, binId) { drop(cardOf(id), host.querySelector('.bin[data-id="' + binId + '"]')); }, cardOf, remaining: () => remaining };
  }

  /* ════════════════════════════════════════════════════
     skyRig : ท้องฟ้ามองไปทางทิศใต้ (ขวา = ตะวันออก, ซ้าย = ตะวันตก ตามแผนที่สากล)
     ลากดวงจันทร์ตามเส้นโค้ง หรือกด "เล่นต่อเนื่อง" · cfg.earth = แสดงแบบจำลองโลกหมุนข้างกัน
     cfg = {t, eps, earth, trail, onMove(t), onVisit(kind)}   kind = rise | mid | set
     ════════════════════════════════════════════════════ */
  function skyRig(host, cfg) {
    cfg = cfg || {};
    const eps = cfg.eps != null ? cfg.eps : 160;
    let t = cfg.t != null ? cfg.t : 0.5, anim = null;
    const visited = { rise: false, mid: false, set: false };
    const X = u => 370 - 320 * u, Y = u => 190 - 140 * Math.sin(Math.PI * u);
    let path = '';
    for (let i = 0; i <= 40; i++) path += (i ? 'L' : 'M') + f1(X(i / 40)) + ' ' + f1(Y(i / 40));
    let stars = '';
    for (let i = 0; i < 34; i++) stars += '<circle class="bgstar" style="animation-delay:' + ((i * 0.31) % 4).toFixed(2) + 's" cx="' + ((i * 97) % 410 + 6) + '" cy="' + ((i * 53) % 150 + 8) + '" r="' + (1 + (i % 3) * 0.5) + '" fill="#fff6c2"/>';
    let dots = '';
    [0.12, 0.3, 0.7, 0.88].forEach(u => { dots += '<circle cx="' + f1(X(u)) + '" cy="' + f1(Y(u)) + '" r="3" fill="#fff6c2" opacity=".5"/>'; });
    const earthHtml = cfg.earth ? '<div class="sky-earth"><svg class="sky-svg2" id="earthSvg" viewBox="0 0 200 220" aria-hidden="true"></svg></div>' : '';
    host.innerHTML = '<div class="skyrig' + (cfg.earth ? ' with-earth' : '') + '"><div class="sky-main"><svg class="sky-svg2" viewBox="0 0 420 250" aria-label="ท้องฟ้าตามทิศแผนที่สากล">' +
      '<defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18235a"/><stop offset=".7" stop-color="#3f3f9e"/><stop offset="1" stop-color="#7a5bc0"/></linearGradient></defs>' +
      '<rect width="420" height="250" rx="22" fill="url(#skyg)"/>' + stars +
      '<path d="' + path + '" fill="none" stroke="#fff6c2" stroke-width="2.6" stroke-dasharray="3 7" stroke-linecap="round" opacity=".7"/>' + dots +
      '<g class="sk-moon"><circle class="moon-hint" r="30" fill="none" stroke="#ffd23f" stroke-width="3"/>' + art.at(art.moon(eps, { glow: true }), -22, -22, 44) + '</g>' +
      '<path d="M0 194 Q70 168 140 188 T290 184 T420 190 V250 H0Z" fill="#2a2368" stroke="' + INK + '" stroke-width="3"/><rect x="0" y="198" width="420" height="52" fill="#1d1850"/>' +
      '<path d="M30 200 l10 -22 l10 22Z M62 200 l8 -16 l8 16Z M352 200 l10 -24 l10 24Z M384 200 l8 -15 l8 15Z" fill="#13103a"/>' +
      '<g transform="translate(210 198)"><circle cx="0" cy="-16" r="6" fill="#0f0c30"/><path d="M-7 0 V-8 Q0 -13 7 -8 V0Z" fill="#0f0c30"/></g>' +
      '<line x1="14" y1="198" x2="406" y2="198" stroke="#fff6c2" stroke-width="1.6" opacity=".5"/>' +
      '<text x="404" y="224" font-size="17" font-weight="800" fill="#ffb347" text-anchor="end" font-family="Mali">ตะวันออก</text>' +
      '<text x="16" y="224" font-size="17" font-weight="800" fill="#ff9fc8" font-family="Mali">ตะวันตก</text>' +
      '<text x="210" y="238" font-size="12" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">ทิศตามแผนที่สากล</text></svg>' +
      '<div class="sky-ctl"><button class="btn btn-sm btn-soft sky-play">' + art.icon('play') + '<span>เล่นต่อเนื่อง</span></button><span class="sky-state"></span></div></div>' + earthHtml + '</div>';
    const svg = host.querySelector('.sky-main svg'), mg = svg.querySelector('.sk-moon');
    const stateEl = host.querySelector('.sky-state'), playBtn = host.querySelector('.sky-play');
    const stateOf = u => u < 0.1 ? 'เพิ่งขึ้นที่ทิศตะวันออก' : u < 0.42 ? 'กำลังไต่ขึ้นสูง' : u < 0.58 ? 'สูงสุดกลางฟ้า' : u < 0.9 ? 'กำลังลดต่ำลง' : 'กำลังตกที่ทิศตะวันตก';

    /* โลกหมุน (มองจากด้านบน) : ผู้สังเกตอยู่ที่มุม θ = -90 → +90 องศา */
    const earth = cfg.earth ? host.querySelector('#earthSvg') : null;
    function paintEarth(u) {
      const th = -90 + 180 * u, cx = 92, cy = 108, R = 48;
      const px = cx + (R + 3) * Math.cos(rad(th)), py = cy - (R + 3) * Math.sin(rad(th));
      const mx = 168, my = 108;
      const arrow = (() => {
        const a0 = 105, a1 = 175, r = 62, P = a => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
        const s = P(a0), e = P(a1), tx = -Math.sin(rad(a1)), ty = -Math.cos(rad(a1)), nx = -ty, ny = tx;
        const tip = [e[0] + tx * 8, e[1] + ty * 8], b1 = [e[0] + nx * 5, e[1] + ny * 5], b2 = [e[0] - nx * 5, e[1] - ny * 5];
        return '<path d="M' + f1(s[0]) + ' ' + f1(s[1]) + ' A' + r + ' ' + r + ' 0 0 0 ' + f1(e[0]) + ' ' + f1(e[1]) + '" fill="none" stroke="#ffd23f" stroke-width="3.4" stroke-linecap="round"/>' +
          '<path d="M' + f1(tip[0]) + ' ' + f1(tip[1]) + ' L' + f1(b1[0]) + ' ' + f1(b1[1]) + ' L' + f1(b2[0]) + ' ' + f1(b2[1]) + 'Z" fill="#ffd23f"/>';
      })();
      earth.innerHTML = '<defs><clipPath id="ec"><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/></clipPath><radialGradient id="eg" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#8fd4ff"/><stop offset="1" stop-color="#2a7fd6"/></radialGradient></defs>' +
        '<rect width="200" height="220" rx="22" fill="#1a2250"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#eg)"/><g clip-path="url(#ec)"><g transform="rotate(' + f1(-th) + ' ' + cx + ' ' + cy + ')">' +
        '<path d="M' + (cx - 30) + ' ' + (cy - 14) + ' q12 -22 30 -10 q6 14 -10 22 q-14 6 -20 -12Z M' + (cx + 8) + ' ' + (cy + 18) + ' q22 -10 28 6 q-8 16 -26 8Z M' + (cx - 24) + ' ' + (cy + 24) + ' q10 -6 16 4 q-6 10 -16 -4Z" fill="#58c26b"/></g></g>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
        arrow + '<text x="14" y="40" font-size="13" font-weight="800" fill="#ffd23f" font-family="Mali">โลกหมุน</text>' +
        '<line x1="' + f1(px) + '" y1="' + f1(py) + '" x2="' + mx + '" y2="' + my + '" stroke="#fff6c2" stroke-width="2" stroke-dasharray="3 5" opacity=".8"/>' +
        art.at(art.moon(eps), mx - 12, my - 12, 24) + '<text x="' + mx + '" y="' + (my + 26) + '" font-size="10.5" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">ดวงจันทร์</text>' +
        '<g transform="translate(' + f1(px) + ' ' + f1(py) + ') rotate(' + f1(90 - th) + ') scale(1.55)"><path d="M-7 0 V-9 Q0 -14 7 -9 V0Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="-16" r="6" fill="#ffd7b4" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<text x="100" y="208" font-size="12" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">มองโลกจากด้านบน (ขั้วโลกเหนือ)</text>';
    }
    function setT(u, quiet) {
      t = clamp(u, 0, 1);
      mg.setAttribute('transform', 'translate(' + f1(X(t)) + ' ' + f1(Y(t)) + ')');
      stateEl.textContent = stateOf(t);
      if (earth) paintEarth(t);
      const kinds = [];
      if (t <= 0.1) kinds.push('rise');
      if (t >= 0.4 && t <= 0.6) kinds.push('mid');
      if (t >= 0.9) kinds.push('set');
      kinds.forEach(k => { if (!visited[k]) { visited[k] = true; if (cfg.onVisit) cfg.onVisit(k); } });
      if (!quiet && cfg.onMove) cfg.onMove(t);
    }
    function stop() { if (anim) { anim.cancel(); anim = null; } playBtn.querySelector('span').textContent = 'เล่นต่อเนื่อง'; playBtn.querySelector('svg').outerHTML = art.icon('play'); }
    function play() {
      if (anim) { stop(); return; }
      if (t >= 0.98) setT(0, true);
      const start = t, ms = 6500 * (1 - start) + 400;
      playBtn.querySelector('span').textContent = 'หยุดดู';
      playBtn.querySelector('svg').outerHTML = art.icon('pause');
      mg.querySelector('.moon-hint').style.display = 'none';
      audio.sfx('rise');
      anim = ui.tween(ms, k => setT(start + (1 - start) * k), () => { anim = null; stop(); audio.sfx('setsky'); }, ui.ease.linear);
    }
    playBtn.addEventListener('click', () => { audio.unlock(); play(); });
    if (cfg.static) {
      host.querySelector('.sky-ctl').style.display = 'none';
      mg.querySelector('.moon-hint').style.display = 'none';
    } else {
      ui.drag(svg, {
        onStart(p) { audio.unlock(); stop(); mg.querySelector('.moon-hint').style.display = 'none'; const q = svgPt(svg, p); setT((370 - q.x) / 320); return true; },
        onMove(p) { const q = svgPt(svg, p); setT((370 - q.x) / 320); },
        onEnd() { audio.sfx('phase'); }
      });
    }
    setT(t, true);
    return { svg, setT, getT: () => t, play, stop, visited };
  }

  /* ════════════════════════════════════════════════════
     moonLog : บันทึกเวลาที่ดวงจันทร์ขึ้น (หลักฐาน) — แตะแต่ละวันเพื่อ "ดู" แล้วเห็นกราฟขั้นบันได
     cfg = {rows:[{day,min}], t0=16*60, t1=24*60, hidden:true, predict:{day, ans, tol, onCheck(ok,min)}, onAll()}
     ════════════════════════════════════════════════════ */
  function moonLog(host, cfg) {
    const rows = cfg.rows, n = rows.length + (cfg.predict ? 1 : 0);
    const t0 = cfg.t0 || 16 * 60, t1 = cfg.t1 || 24 * 60, left = 70, right = 400, top = 34, rh = 38;
    const H = top + n * rh + 34;
    const X = m => left + (right - left) * clamp((m - t0) / (t1 - t0), 0, 1);
    const unX = x => t0 + (x - left) / (right - left) * (t1 - t0);
    let grid = '';
    for (let h = Math.ceil(t0 / 60); h * 60 <= t1; h++) {
      const x = X(h * 60);
      grid += '<line x1="' + f1(x) + '" y1="' + (top - 6) + '" x2="' + f1(x) + '" y2="' + (H - 28) + '" stroke="#fff6c2" stroke-width="1.4" opacity=".28"/>' +
        '<text x="' + f1(x) + '" y="' + (top - 12) + '" font-size="11" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">' + (h % 24 < 10 ? '0' : '') + (h % 24) + '.00</text>';
    }
    let body = '';
    rows.forEach((r, i) => {
      const y = top + i * rh;
      body += '<g class="lg-row" data-i="' + i + '"><text x="10" y="' + (y + 25) + '" font-size="15" font-weight="800" fill="#fff" font-family="Mali">วันที่ ' + r.day + '</text>' +
        '<rect x="' + left + '" y="' + (y + 18) + '" width="' + (right - left) + '" height="6" rx="3" fill="#ffffff" opacity=".14"/>' +
        '<g class="lg-pt" style="opacity:' + (cfg.hidden === false ? 1 : 0) + '" transform="translate(' + f1(X(r.min)) + ' ' + (y + 21) + ')">' + art.at(art.moon(150), -13, -13, 26) + '</g>' +
        '<text class="lg-time" style="opacity:' + (cfg.hidden === false ? 1 : 0) + '" x="' + f1(X(r.min)) + '" y="' + (y + 11) + '" font-size="12" font-weight="800" fill="#ffe27a" text-anchor="middle" font-family="Mali">' + SK.fmtTime(r.min) + '</text>' +
        (cfg.hidden === false ? '' : '<g class="lg-cover"><rect x="' + left + '" y="' + (y + 2) + '" width="' + (right - left) + '" height="30" rx="15" fill="#8b5cf6" stroke="' + INK + '" stroke-width="3"/><text x="' + ((left + right) / 2) + '" y="' + (y + 23) + '" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Mali">แตะเพื่อดูดวงจันทร์ขึ้น</text></g>') + '</g>';
    });
    if (cfg.predict) {
      const y = top + rows.length * rh;
      body += '<g class="lg-pred"><text x="10" y="' + (y + 25) + '" font-size="15" font-weight="800" fill="#ffd23f" font-family="Mali">วันที่ ' + cfg.predict.day + '</text>' +
        '<rect x="' + left + '" y="' + (y + 18) + '" width="' + (right - left) + '" height="6" rx="3" fill="#ffd23f" opacity=".3"/>' +
        '<g class="lg-pin" transform="translate(' + f1(X(t0 + (t1 - t0) * 0.5)) + ' ' + (y + 21) + ')"><circle r="16" fill="none" stroke="#ffd23f" stroke-width="3" class="moon-hint"/>' + art.at(art.moon(150), -13, -13, 26) + '</g>' +
        '<text class="lg-pin-t" x="' + f1(X(t0 + (t1 - t0) * 0.5)) + '" y="' + (y + 11) + '" font-size="12" font-weight="800" fill="#ffe27a" text-anchor="middle" font-family="Mali"></text></g>';
    }
    host.innerHTML = '<div class="moonlog"><svg viewBox="0 0 420 ' + H + '" class="lg-svg" aria-label="บันทึกเวลาที่ดวงจันทร์ขึ้น"><rect width="420" height="' + H + '" rx="22" fill="url(#skyg2)"/><defs><linearGradient id="skyg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18235a"/><stop offset="1" stop-color="#3a3a96"/></linearGradient></defs>' +
      grid + '<path class="lg-line" d="" fill="none" stroke="#ffd23f" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>' + body +
      '<text x="210" y="' + (H - 10) + '" font-size="12" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">เวลาที่ดวงจันทร์ขึ้น (น.)</text></svg>' +
      (cfg.predict ? '<button class="btn btn-go btn-sm lg-check" disabled>' + art.icon('check') + '<span>ตรวจคำตอบ</span></button>' : '') + '</div>';
    const svg = host.querySelector('.lg-svg');
    let shown = cfg.hidden === false ? rows.length : 0;
    const seen = {};
    function drawLine() {
      const pts = rows.filter((r, i) => cfg.hidden === false || seen[i]).map(r => ({ x: X(r.min), y: top + (r.day - rows[0].day) * rh + 21 }));
      svg.querySelector('.lg-line').setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + f1(p.x) + ' ' + f1(p.y)).join(''));
    }
    function reveal(i) {
      if (seen[i]) return;
      seen[i] = true; shown++;
      const g = svg.querySelector('.lg-row[data-i="' + i + '"]');
      const cov = g.querySelector('.lg-cover'); if (cov) cov.remove();
      const pt = g.querySelector('.lg-pt'), tt = g.querySelector('.lg-time');
      pt.style.opacity = 1; tt.style.opacity = 1;
      ui.restart(pt, 'logpop');
      audio.sfx('rise');
      drawLine();
      if (cfg.onSeen) cfg.onSeen(i, shown);
      if (shown >= rows.length && cfg.onAll) setTimeout(cfg.onAll, 500);
    }
    svg.querySelectorAll('.lg-row').forEach(g => g.addEventListener('click', () => { audio.unlock(); reveal(+g.dataset.i); }));
    drawLine();
    let pm = null;
    if (cfg.predict) {
      const y0 = top + rows.length * rh + 21, pin = svg.querySelector('.lg-pin'), pt = svg.querySelector('.lg-pin-t'), btn = host.querySelector('.lg-check');
      const setPin = m => {
        m = clamp(Math.round(m / 10) * 10, t0, t1 - 1); pm = m;
        pin.setAttribute('transform', 'translate(' + f1(X(m)) + ' ' + y0 + ')');
        pt.setAttribute('x', f1(X(m))); pt.textContent = SK.fmtTime(m);
        btn.disabled = false;
      };
      ui.drag(svg, {
        onStart(p) { const q = svgPt(svg, p); if (q.y < y0 - 22 || q.x < left - 10) return false; audio.unlock(); pin.querySelector('.moon-hint').style.display = 'none'; setPin(unX(q.x)); return true; },
        onMove(p) { setPin(unX(svgPt(svg, p).x)); },
        onEnd() { audio.sfx('phase'); }
      });
      btn.addEventListener('click', () => { if (pm == null) return; cfg.predict.onCheck(Math.abs(pm - cfg.predict.ans) <= (cfg.predict.tol || 15), pm); });
    }
    return {
      svg, seen: () => shown, revealAll() { rows.forEach((r, i) => reveal(i)); },
      setPredict(m) { if (cfg.predict) { const el = host.querySelector('.lg-check'); if (el) el.disabled = false; const y0 = top + rows.length * rh + 21; svg.querySelector('.lg-pin').setAttribute('transform', 'translate(' + f1(X(m)) + ' ' + y0 + ')'); const pt = svg.querySelector('.lg-pin-t'); pt.setAttribute('x', f1(X(m))); pt.textContent = SK.fmtTime(m); pm = m; } },
      pinMin: () => pm
    };
  }

  /* ════════════════════════════════════════════════════
     phaseLab : ห้องจำลองแสงจันทร์ (มองจากเหนือโลก) ดวงอาทิตย์ทางซ้าย
     ลากดวงจันทร์รอบโลก → ภาพที่เห็นจากโลกเปลี่ยนตาม
     cfg = {eps, showName, discover, onChange(eps, idx), onSettle(eps, idx), target:{eps,name,img}}
     ════════════════════════════════════════════════════ */
  function phaseLab(host, cfg) {
    cfg = cfg || {};
    let eps = cfg.eps != null ? cfg.eps : 90, locked = false, tw = null;
    const EX = 190, EY = 150, OR = 88, SX = 34, SY = 150;
    const pos = e => { const a = rad(SK.orbitAngle(e)); return [EX + OR * Math.cos(a), EY - OR * Math.sin(a)]; };
    let dots = '';
    for (let i = 0; i < 8; i++) { const p = pos(i * 45); dots += '<circle class="plab-dot" data-i="' + i + '" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="6" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>'; }
    host.innerHTML = '<div class="plab"><div class="plab-orbit"><svg viewBox="0 0 300 300" aria-label="แบบจำลองดวงอาทิตย์ โลก ดวงจันทร์">' +
      '<defs><linearGradient id="plbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2250"/><stop offset="1" stop-color="#2f3a8c"/></linearGradient></defs><rect width="300" height="300" rx="24" fill="url(#plbg)"/>' +
      '<g transform="translate(' + SX + ' ' + SY + ')">' + art.sun(18) + '</g>' +
      [100, 150, 200].map(y => '<g stroke="#ffe27a" stroke-width="3" stroke-linecap="round" opacity=".85"><line x1="66" y1="' + y + '" x2="94" y2="' + y + '" stroke-dasharray="2 7"/><path d="M90 ' + (y - 5) + ' L98 ' + y + ' L90 ' + (y + 5) + '" fill="none"/></g>').join('') +
      '<text x="80" y="82" font-size="12" font-weight="800" fill="#ffe27a" text-anchor="middle" font-family="Mali">แสงอาทิตย์</text>' +
      '<circle cx="' + EX + '" cy="' + EY + '" r="' + OR + '" fill="none" stroke="#fff6c2" stroke-width="2.2" stroke-dasharray="4 7" opacity=".7"/>' + dots +
      '<g transform="translate(' + EX + ' ' + EY + ')">' + art.planet('earth', 24) + '</g>' +
      '<line class="plab-sight" x1="' + EX + '" y1="' + EY + '" x2="' + EX + '" y2="' + EY + '" stroke="#8fe0ff" stroke-width="2.4" stroke-dasharray="3 5"/>' +
      '<g class="plab-moon"></g><circle class="moon-hint plab-hint" r="26" fill="none" stroke="#ffd23f" stroke-width="3"/>' +
      '<text x="150" y="292" font-size="11.5" font-weight="700" fill="#cfd8ff" text-anchor="middle" font-family="Mali">มองจากเหนือโลก · โคจรทวนเข็มนาฬิกา</text></svg></div>' +
      '<div class="plab-view"><div class="plab-card"><div class="plab-img"></div><div class="plab-name"></div></div><div class="plab-cap">ภาพที่เห็นจากโลก</div>' +
      '<div class="plab-target"' + (cfg.target ? '' : ' hidden') + '>' + (cfg.target && cfg.target.img != null ? '<div class="pt-img">' + art.moon(cfg.target.img) + '</div>' : '') + '<span>' + (cfg.target ? cfg.target.name : '') + '</span></div></div></div>';
    if (cfg.hideView) host.querySelector('.plab').classList.add('hide-view');
    const svg = host.querySelector('.plab-orbit svg'), mg = svg.querySelector('.plab-moon'), sight = svg.querySelector('.plab-sight'), hint = svg.querySelector('.plab-hint');
    const img = host.querySelector('.plab-img'), nameEl = host.querySelector('.plab-name');
    let lastIdx = -1;
    function paint() {
      const p = pos(eps);
      const sunDeg = Math.atan2(-(SY - p[1]), SX - p[0]) * 180 / Math.PI; // ทิศจากดวงจันทร์ไปหาดวงอาทิตย์ (องศาแบบคณิต)
      mg.setAttribute('transform', 'translate(' + f1(p[0]) + ' ' + f1(p[1]) + ')');
      mg.innerHTML = art.moonOrbit(15, sunDeg);
      hint.setAttribute('cx', f1(p[0])); hint.setAttribute('cy', f1(p[1]));
      sight.setAttribute('x2', f1(p[0])); sight.setAttribute('y2', f1(p[1]));
      img.innerHTML = art.moon(eps, { glow: true });
      const idx = SK.phaseIdx(eps), near = Math.abs(mod(eps - idx * 45 + 180, 360) - 180) <= 12;
      nameEl.textContent = cfg.showName === false ? '' : (near ? SK.PHASES[idx].long : 'กำลังเปลี่ยนรูปร่าง');
      svg.querySelectorAll('.plab-dot').forEach(d => d.setAttribute('fill', +d.dataset.i === idx && near ? '#ffd23f' : '#fff'));
      if (idx !== lastIdx) { lastIdx = idx; audio.sfx('phase'); }
      if (cfg.discover && near && SK.know) SK.know('moon', idx);
      if (cfg.onChange) cfg.onChange(eps, idx);
    }
    function setEps(e, quiet) { eps = mod(e, 360); paint(); }
    function angleToEps(p) {
      const q = svgPt(svg, p), a = Math.atan2(-(q.y - EY), q.x - EX) * 180 / Math.PI;
      return Math.round(mod(a - 180, 360) / 5) * 5;
    }
    if (cfg.static) { locked = true; hint.style.display = 'none'; }
    ui.drag(svg, {
      onStart(p) { if (locked) return false; audio.unlock(); if (tw) { tw.cancel(); tw = null; } hint.style.display = 'none'; setEps(angleToEps(p)); return true; },
      onMove(p) { setEps(angleToEps(p)); },
      onEnd() { if (cfg.onSettle) cfg.onSettle(eps, SK.phaseIdx(eps)); }
    });
    setEps(eps);
    return {
      svg, setEps, getEps: () => eps, lock(on) { locked = on; },
      showView() { host.querySelector('.plab').classList.remove('hide-view'); },
      setTarget(name) { const el = host.querySelector('.plab-target'); el.hidden = false; el.querySelector('span').textContent = name; },
      /* เลื่อนดวงจันทร์ไปที่มุมที่ต้องการแบบเคลื่อนไหว (ทางสั้นที่สุด) */
      moveTo(target, ms, done) {
        if (tw) tw.cancel();
        hint.style.display = 'none';
        const from = eps, d = mod(target - from + 180, 360) - 180;
        tw = ui.tween(ms || 900, k => setEps(from + d * k), () => { tw = null; if (done) done(); }, ui.ease.inOut);
      }
    };
  }

  /* ════════════════════════════════════════════════════
     cycleRing : วางการ์ดรูปร่างดวงจันทร์ลงวงปฏิทิน (ตามเข็มนาฬิกาจากบน = วันที่ 0)
     cfg = {prefill:[idx...], onWrong(cardIdx, slotIdx, el), onRight(idx), onDone(), names:true}
     ════════════════════════════════════════════════════ */
  function cycleRing(host, cfg) {
    cfg = cfg || {};
    const pre = cfg.prefill || [];
    const C = 150, RR = 100, SR = 32;
    const slotPos = i => { const a = rad(-90 + i * 45); return [C + RR * Math.cos(a), C + RR * Math.sin(a)]; };
    let slots = '';
    for (let i = 0; i < 8; i++) {
      const p = slotPos(i), filled = pre.indexOf(i) >= 0;
      slots += '<g class="ring-slot' + (filled ? ' fixed' : '') + '" data-i="' + i + '" transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ')">' +
        '<circle r="' + SR + '" fill="' + (filled ? '#fff' : 'rgba(255,255,255,.14)') + '" stroke="' + (filled ? INK : '#fff6c2') + '" stroke-width="3" ' + (filled ? '' : 'stroke-dasharray="5 5"') + '/>' +
        '<g class="slot-moon">' + (filled ? art.at(art.moon(i * 45), -17, -25, 34) : '') + '</g>' +
        '<text class="slot-day" y="' + (SR - 7) + '" font-size="10.5" font-weight="800" fill="' + (filled ? INK : '#ffe27a') + '" text-anchor="middle" font-family="Mali">วัน ' + SK.PHASES[i].day + '</text></g>';
    }
    const arcs = '<path d="M150 50 A100 100 0 0 1 150 250" fill="none" stroke="#ffd23f" stroke-width="7" opacity=".28" stroke-linecap="round"/><path d="M150 250 A100 100 0 0 1 150 50" fill="none" stroke="#b9a6ff" stroke-width="7" opacity=".28" stroke-linecap="round"/>';
    const tray = SK.shuffle([0, 1, 2, 3, 4, 5, 6, 7].filter(i => pre.indexOf(i) < 0));
    host.innerHTML = '<div class="ring"><svg viewBox="0 0 300 300" aria-label="วงปฏิทินดวงจันทร์"><rect width="300" height="300" rx="26" fill="#232d78"/>' + arcs +
      '<text x="150" y="130" font-size="14" font-weight="800" fill="#fff" text-anchor="middle" font-family="Mali">1 รอบ</text><text x="150" y="152" font-size="14" font-weight="800" fill="#fff" text-anchor="middle" font-family="Mali">ประมาณ 30 วัน</text>' +
      '<text x="204" y="178" font-size="11" font-weight="800" fill="#ffd23f" text-anchor="middle" font-family="Mali">ข้างขึ้น</text><text x="96" y="178" font-size="11" font-weight="800" fill="#c9b8ff" text-anchor="middle" font-family="Mali">ข้างแรม</text>' +
      slots + '</svg><div class="ring-tray">' + tray.map(i => '<button class="icard-btn ring-card" data-i="' + i + '">' + art.moon(i * 45) + (cfg.names === false ? '' : '<b>' + SK.PHASES[i].n + '</b>') + '</button>').join('') + '</div></div>';
    const svg = host.querySelector('svg');
    const cards = Array.from(host.querySelectorAll('.ring-card'));
    let selected = null, remaining = tray.length, ghost = null;
    const slotEl = i => svg.querySelector('.ring-slot[data-i="' + i + '"]');
    const select = c => { cards.forEach(x => x.classList.toggle('sel', x === c)); selected = c; };
    function place(cardEl, slotI) {
      const ci = +cardEl.dataset.i, sl = slotEl(slotI);
      if (sl.classList.contains('fixed') || sl.classList.contains('filled')) { audio.sfx('tick'); return; }
      if (ci !== slotI) { audio.sfx('gentle'); ui.shake(cardEl); if (cfg.onWrong) cfg.onWrong(ci, slotI, cardEl); return; }
      sl.classList.add('filled');
      sl.querySelector('circle').setAttribute('fill', '#fff'); sl.querySelector('circle').setAttribute('stroke', INK); sl.querySelector('circle').removeAttribute('stroke-dasharray');
      sl.querySelector('.slot-moon').innerHTML = art.at(art.moon(ci * 45), -17, -25, 34);
      sl.querySelector('.slot-day').setAttribute('fill', INK);
      audio.sfx('snapin'); ui.sparkle(ui.center(sl), 7);
      if (SK.know) SK.know('moon', ci);
      cardEl.remove(); selected = null; remaining--;
      if (cfg.onRight) cfg.onRight(ci);
      if (!remaining && cfg.onDone) setTimeout(cfg.onDone, 350);
    }
    const slotAt = p => {
      for (const el of document.elementsFromPoint(p.x, p.y)) { const g = el.closest && el.closest('.ring-slot'); if (g && svg.contains(g)) return +g.dataset.i; }
      return -1;
    };
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
        if (moved) { const s = slotAt(p); if (s >= 0) place(c, s); return; }
        audio.sfx('pop', 0); select(selected === c ? null : c);
      }
    }));
    svg.querySelectorAll('.ring-slot').forEach(g => g.addEventListener('click', () => { if (selected) place(selected, +g.dataset.i); }));
    return { svg, place(i) { const c = cards.find(x => +x.dataset.i === i && x.isConnected); if (c) place(c, i); }, remaining: () => remaining, cards };
  }

  /* ════════════════════════════════════════════════════
     dayDial : เลื่อนวันที่ในรอบเดือน (0–30) ดูรูปร่างดวงจันทร์
     cfg = {day, showName, onChange(day, idx, eps), onVisit(idx)}
     ════════════════════════════════════════════════════ */
  function dayDial(host, cfg) {
    cfg = cfg || {};
    host.innerHTML = '<div class="dial"><div class="dial-img"></div><div class="dial-info"><b class="dial-day"></b><span class="dial-name"></span><span class="dial-tag"></span></div>' +
      '<label class="dial-range"><span>วันที่ 0</span><input type="range" min="0" max="30" step="1" value="' + (cfg.day || 0) + '" aria-label="เลือกวันที่ในรอบเดือน"><span>วันที่ 30</span></label></div>';
    const inp = host.querySelector('input'), img = host.querySelector('.dial-img');
    const dayEl = host.querySelector('.dial-day'), nameEl = host.querySelector('.dial-name'), tag = host.querySelector('.dial-tag');
    let lastIdx = -1;
    function paint() {
      const d = +inp.value, eps = SK.epsOfDay(d), idx = SK.phaseIdx(eps), P = SK.PHASES[idx];
      img.innerHTML = art.moon(eps, { glow: true });
      dayEl.textContent = 'วันที่ ' + d + ' ของรอบเดือน';
      nameEl.textContent = cfg.showName === false ? '' : P.long;
      const wax = d > 0 && d < 15, wane = d > 15 && d < 30;
      tag.textContent = wax ? 'ข้างขึ้น · สว่างเพิ่มขึ้น' : wane ? 'ข้างแรม · สว่างลดลง' : d === 15 ? 'เต็มดวง' : 'จันทร์ดับ';
      tag.className = 'dial-tag ' + (wax ? 'wax' : wane ? 'wane' : 'mid');
      if (idx !== lastIdx) { lastIdx = idx; audio.sfx('phase'); if (SK.know) SK.know('moon', idx); if (cfg.onVisit) cfg.onVisit(idx); }
      if (cfg.onChange) cfg.onChange(d, idx, eps);
    }
    inp.addEventListener('input', () => { audio.unlock(); paint(); });
    paint();
    return { setDay(d) { inp.value = d; paint(); }, getDay: () => +inp.value, input: inp };
  }

  Object.assign(W, { choice, sortBins, skyRig, moonLog, phaseLab, cycleRing, dayDial, svgPt, chip });
})();
