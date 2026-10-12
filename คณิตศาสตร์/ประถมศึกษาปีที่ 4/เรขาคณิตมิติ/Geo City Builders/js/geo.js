/* ═══════════════════════════════════════════════════════════
   GEO CITY BUILDERS — กระดานพิมพ์เขียว (SVG) + คณิตศาสตร์เรขาคณิต
   หน่วยของกระดาน = 1 ช่องตาราง (viewBox 0..w, 0..h)  แกน y ชี้ลง
   มุมทุกมุมในโค้ดคิดแบบคณิตศาสตร์ (ทวนเข็มนาฬิกา, หน่วยองศา)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const GB = window.GB;
  const NS = 'http://www.w3.org/2000/svg';

  /* ── คณิต ── */
  const M = {
    dist: (a, b) => Math.hypot(b.x - a.x, b.y - a.y),
    /* มุมของเวกเตอร์ a→b (องศา, ทวนเข็ม, 0..360) */
    dir(a, b) { let t = Math.atan2(-(b.y - a.y), b.x - a.x) * 180 / Math.PI; return (t + 360) % 360; },
    /* มุมที่จุดยอด v จากแขน va ไป vb (ค่าเล็กกว่า 0..180) */
    angleAt(a, v, b) {
      let d = Math.abs(M.dir(v, a) - M.dir(v, b));
      if (d > 180) d = 360 - d;
      return d;
    },
    pol(v, deg, r) { const t = deg * Math.PI / 180; return { x: v.x + r * Math.cos(t), y: v.y - r * Math.sin(t) }; },
    round: (v, n) => Math.round(v * Math.pow(10, n || 0)) / Math.pow(10, n || 0),
    near: (a, b, tol) => M.dist(a, b) <= (tol || 0.45),
    /* ระยะจากจุด p ถึงส่วนของเส้นตรง ab */
    segDist(p, a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
      let t = L ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L : 0;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
    },
    /* ชนิดของมุมจากขนาด (องศา) */
    angleType(d) {
      d = Math.round(d);
      if (d <= 0 || d >= 360) return null;
      if (d < 90) return 'acute';
      if (d === 90) return 'right';
      if (d < 180) return 'obtuse';
      if (d === 180) return 'straight';
      return 'reflex';
    }
  };
  M.TYPE_TH = { acute: 'มุมแหลม', right: 'มุมฉาก', obtuse: 'มุมป้าน', straight: 'มุมตรง', reflex: 'มุมกลับ' };
  M.KIND_TH = { seg: 'ส่วนของเส้นตรง', ray: 'รังสี', line: 'เส้นตรง' };

  function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function board(host, o) {
    o = Object.assign({ w: 12, h: 8, grid: 'lines', cls: '' }, o || {});
    const W = o.w, H = o.h;
    const wrap = document.createElement('div');
    wrap.className = 'board ' + o.cls;
    const svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', class: 'bsvg' });
    wrap.appendChild(svg);
    host.appendChild(wrap);
    /* ปรับขนาดกระดานให้พอดีพื้นที่ โดยคงสัดส่วน (ไม่มีแถบว่างรอบกระดาน) */
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / W, (r.height - 8) / H);
      svg.style.width = Math.floor(W * s) + 'px';
      svg.style.height = Math.floor(H * s) + 'px';
    };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
    requestAnimationFrame(fit);

    const defs = mk('defs', null, svg);
    defs.innerHTML =
      '<radialGradient id="gGlow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#7df9ff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="gBeam" x1="0" x2="1"><stop offset="0" stop-color="#fff7c2" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf3f" stop-opacity=".15"/></linearGradient>';

    const L = {};
    ['bg', 'grid', 'deco', 'base', 'draw', 'ui', 'top'].forEach(n => { L[n] = mk('g', { class: 'L-' + n }, svg); });

    mk('rect', { x: 0, y: 0, width: W, height: H, class: 'b-bg' }, L.bg);
    if (o.grid === 'lines') {
      let d = '';
      for (let x = 1; x < W; x++) d += 'M' + x + ' 0V' + H;
      for (let y = 1; y < H; y++) d += 'M0 ' + y + 'H' + W;
      mk('path', { d, class: 'b-grid' }, L.grid);
    } else if (o.grid === 'dots') {
      for (let x = 1; x < W; x++) for (let y = 1; y < H; y++) mk('circle', { cx: x, cy: y, r: 0.07, class: 'b-dot' }, L.grid);
    }

    const B = {
      wrap, svg, W, H, L,
      el(layer, tag, attrs) { return mk(tag, attrs, typeof layer === 'string' ? L[layer] : layer); },
      clear(layer) { L[layer].innerHTML = ''; },
      pt(e) {
        const p = svg.createSVGPoint();
        const src = e.touches ? e.touches[0] : e;
        p.x = src.clientX; p.y = src.clientY;
        const m = svg.getScreenCTM();
        if (!m) return { x: 0, y: 0 };
        const r = p.matrixTransform(m.inverse());
        return { x: r.x, y: r.y };
      },
      /* ตำแหน่งบนจอ (px) ของจุดบนกระดาน — สำหรับเอฟเฟกต์ */
      screen(p) {
        const m = svg.getScreenCTM();
        const q = svg.createSVGPoint(); q.x = p.x; q.y = p.y;
        const r = q.matrixTransform(m);
        return { x: r.x, y: r.y };
      },
      text(layer, x, y, s, attrs) {
        const t = mk('text', Object.assign({ x, y, class: 'b-txt' }, attrs || {}), L[layer] || layer);
        t.textContent = s;
        return t;
      },
      /* จุด + ชื่อจุด */
      point(layer, p, label, opt) {
        opt = opt || {};
        const g = mk('g', { class: 'b-pt ' + (opt.cls || '') }, L[layer] || layer);
        g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
        const inner = mk('g', { class: 'b-pt-in' }, g);
        mk('circle', { r: opt.r || 0.17, class: 'b-pt-c' }, inner);
        if (label) {
          const off = opt.off || [0.32, -0.32];
          const t = mk('text', { x: off[0], y: off[1], class: 'b-lbl', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, inner);
          t.textContent = label;
        }
        return g;
      },
      seg(layer, a, b, cls) { return mk('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls || 'b-seg' }, L[layer] || layer); },
      path(layer, d, cls) { return mk('path', { d, class: cls }, L[layer] || layer); },
      /* จุดที่รังสีจาก a ผ่าน b ไปชนขอบกระดาน */
      edge(a, b, inset) {
        inset = inset == null ? 0.25 : inset;
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        let t = Infinity;
        if (ux > 1e-6) t = Math.min(t, (W - inset - a.x) / ux);
        if (ux < -1e-6) t = Math.min(t, (inset - a.x) / ux);
        if (uy > 1e-6) t = Math.min(t, (H - inset - a.y) / uy);
        if (uy < -1e-6) t = Math.min(t, (inset - a.y) / uy);
        if (!isFinite(t) || t < 0) t = 0;
        return { x: a.x + ux * t, y: a.y + uy * t };
      },
      arrowHead(layer, tip, from, cls, size) {
        size = size || 0.38;
        const ang = Math.atan2(tip.y - from.y, tip.x - from.x);
        const p1 = { x: tip.x - size * Math.cos(ang - 0.45), y: tip.y - size * Math.sin(ang - 0.45) };
        const p2 = { x: tip.x - size * Math.cos(ang + 0.45), y: tip.y - size * Math.sin(ang + 0.45) };
        return mk('path', { d: 'M' + p1.x + ' ' + p1.y + 'L' + tip.x + ' ' + tip.y + 'L' + p2.x + ' ' + p2.y, class: cls || 'b-arrow' }, L[layer] || layer);
      },
      /* วาดเส้นแบบต่าง ๆ จาก a ไป b : kind = seg | ray (เริ่มที่ a) | line */
      figure(layer, a, b, kind, cls) {
        const g = mk('g', { class: 'b-fig fig-' + kind + ' ' + (cls || '') }, L[layer] || layer);
        let p1 = a, p2 = b;
        if (kind === 'ray' || kind === 'line') p2 = B.edge(a, b);
        if (kind === 'line') p1 = B.edge(b, a);
        mk('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'b-fig-glow' }, g);
        const ln = mk('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'b-fig-line' }, g);
        ln.style.setProperty('--len', M.dist(p1, p2).toFixed(2));
        if (kind === 'ray' || kind === 'line') B.arrowHead(g, p2, a, 'b-arrow');
        if (kind === 'line') B.arrowHead(g, p1, b, 'b-arrow');
        return g;
      },
      /* ส่วนโค้งแสดงมุม จาก t1 ไป t2 (ทวนเข็ม) */
      arc(layer, v, t1, t2, r, cls) {
        let sweep = ((t2 - t1) % 360 + 360) % 360;
        if (sweep < 0.5) return null;
        const p1 = M.pol(v, t1, r), p2 = M.pol(v, t1 + sweep, r);
        const large = sweep > 180 ? 1 : 0;
        const d = 'M' + v.x + ' ' + v.y + 'L' + p1.x + ' ' + p1.y + 'A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p2.x + ' ' + p2.y + 'Z';
        return mk('path', { d, class: cls || 'b-arc' }, L[layer] || layer);
      },
      /* เครื่องหมายมุมฉาก */
      rightMark(layer, v, t1, t2, s, cls) {
        s = s || 0.45;
        const a = M.pol(v, t1, s), b = M.pol(v, t2, s);
        const c = { x: a.x + b.x - v.x, y: a.y + b.y - v.y };
        return mk('path', { d: 'M' + a.x + ' ' + a.y + 'L' + c.x + ' ' + c.y + 'L' + b.x + ' ' + b.y, class: cls || 'b-right' }, L[layer] || layer);
      },
      /* รับ pointer events (พิกัดกระดาน) */
      on(handlers) {
        let active = false;
        svg.addEventListener('pointerdown', e => {
          if (e.button != null && e.button > 0) return;
          active = true;
          try { svg.setPointerCapture(e.pointerId); } catch (err) {}
          handlers.down && handlers.down(B.pt(e), e);
        });
        svg.addEventListener('pointermove', e => { if (handlers.hover) handlers.hover(B.pt(e), e); if (active && handlers.move) handlers.move(B.pt(e), e); });
        const up = e => { if (!active) return; active = false; handlers.up && handlers.up(B.pt(e), e); };
        svg.addEventListener('pointerup', up);
        svg.addEventListener('pointercancel', up);
      }
    };
    return B;
  }

  GB.geo = { board, M, mk };
})();
