/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — วาดแผนภูมิแท่ง (SVG) และตารางสองทาง (HTML)
   แกนตั้งเริ่มที่ 0 เสมอ ไม่มีการย่นระยะ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT = window.TT || {};
  const INK = '#2a2350';
  const COLORS = ['#ff6b7a', '#4a7bf0', '#ffb52e', '#3fd6a8', '#9b6cf0', '#ff8fb1'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* spec: { title, xLabel, yLabel, cats:[{n,k}], vals:[..], scale, max }
     o: { mini, hl:[i], dim:[i], showVals, labels:{title,x,y}(false=ช่องว่าง), clickBar, clickTick, build, parts, hideVals } */
  function geom(spec, o) {
    o = o || {};
    const mini = !!o.mini;
    const g = mini
      ? { W: 250, H: 176, L: 30, R: 8, top: 14, base: 146 }
      : { W: 560, H: 420, L: 80, R: 18, top: 74, base: 296 };
    g.PH = g.base - g.top;
    g.PW = g.W - g.L - g.R;
    g.unit = g.PH / spec.max;
    g.n = spec.cats.length;
    g.slot = g.PW / g.n;
    g.bw = Math.min(mini ? 34 : 78, g.slot * 0.6);
    g.y = v => g.base - v * g.unit;
    g.cx = i => g.L + g.slot * (i + 0.5);
    return g;
  }
  function barPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    if (h <= 0.5) return 'M' + x + ' ' + y + 'h' + w;
    return 'M' + x + ' ' + (y + h) + ' V' + (y + r) + ' a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + ' h' + (w - 2 * r) + ' a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + ' V' + (y + h) + ' z';
  }

  function shinePath(x, y, h) {
    return h > 14 ? 'M' + (x + 8) + ' ' + (y + 8) + ' v' + Math.max(0, Math.min(h - 16, 26)) : 'M0 0';
  }
  /* ปรับความสูงแท่งที่ i โดยไม่วาดใหม่ (ใช้ตอนลากแท่ง) */
  function updateBar(svg, spec, i, v, o) {
    const g = geom(spec, o);
    const b = svg.querySelector('.bar[data-i="' + i + '"]');
    if (!b) return;
    const x = g.cx(i) - g.bw / 2, y = g.y(v), h = v * g.unit;
    b.querySelector('.bar-body').setAttribute('d', barPath(x, y, g.bw, h, 12));
    b.querySelector('.bar-shine').setAttribute('d', shinePath(x, y, h));
    const t = b.querySelector('.ch-val');
    if (t) { t.setAttribute('y', y - 8); t.textContent = v; }
  }

  function chartSVG(spec, o) {
    o = o || {};
    const g = geom(spec, o);
    const lab = Object.assign({ title: true, x: true, y: true }, o.labels || {});
    const hl = o.hl || [], dim = o.dim || [];
    let s = '<svg class="chart' + (o.mini ? ' mini' : '') + (o.still ? ' still' : '') + (o.build ? ' build' : '') + '" viewBox="0 0 ' + g.W + ' ' + g.H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="แผนภูมิแท่ง ' + esc(spec.title) + '">';
    s += '<rect x="2" y="2" width="' + (g.W - 4) + '" height="' + (g.H - 4) + '" rx="' + (o.mini ? 12 : 22) + '" class="ch-paper"/>';

    /* ชื่อแผนภูมิ */
    if (!o.mini) {
      s += '<g class="pt" data-part="title">' + (lab.title
        ? '<text x="' + (g.W / 2) + '" y="42" text-anchor="middle" class="ch-title">' + esc(spec.title) + '</text>'
        : '<rect x="' + (g.W / 2 - 130) + '" y="18" width="260" height="34" rx="10" class="ch-empty"/><text x="' + (g.W / 2) + '" y="42" text-anchor="middle" class="ch-ph">ชื่อแผนภูมิ</text>') +
        '<rect x="40" y="14" width="' + (g.W - 80) + '" height="46" fill="transparent"/></g>';
    }

    /* เส้นกริด + เลขแกนตั้ง */
    const lines = Math.round(spec.max / spec.scale);
    const dense = lines > 14, every = dense ? Math.ceil(lines / 5) : 1;
    for (let k = 0; k <= lines; k++) {
      const v = k * spec.scale, y = g.y(v);
      s += '<line x1="' + g.L + '" x2="' + (g.W - g.R) + '" y1="' + y + '" y2="' + y + '" class="ch-grid' + (k === 0 ? ' base' : '') + (dense ? ' dense' : '') + '"/>';
    }
    s += '<line x1="' + g.L + '" x2="' + g.L + '" y1="' + (g.top - 8) + '" y2="' + g.base + '" class="ch-axis"/>';
    s += '<g class="pt" data-part="yaxis"><rect x="0" y="' + (g.top - 12) + '" width="' + (g.L - 2) + '" height="' + (g.PH + 24) + '" fill="transparent" class="part-hit"/>';
    for (let k = 0; k <= lines; k++) {
      const v = k * spec.scale, y = g.y(v);
      const hidden = (o.hideTicks && o.hideTicks.indexOf(v) >= 0) || (dense && k % every);
      s += '<g class="tick' + (o.clickTick ? ' tappable' : '') + '" data-v="' + v + '">' +
        '<rect x="' + (o.mini ? 0 : 20) + '" y="' + (y - Math.min(18, g.unit * spec.scale / 2)) + '" width="' + (g.L - (o.mini ? 0 : 20) - 2) + '" height="' + (Math.min(36, g.unit * spec.scale)) + '" rx="8" class="tick-bg"/>' +
        (hidden ? '' : '<text x="' + (g.L - 10) + '" y="' + (y + (o.mini ? 4 : 6)) + '" text-anchor="end" class="ch-num">' + v + '</text>') + '</g>';
    }
    if (!o.mini) {
      const cy = (g.top + g.base) / 2;
      s += lab.y
        ? '<text transform="translate(26 ' + cy + ') rotate(-90)" text-anchor="middle" class="ch-axl">' + esc(spec.yLabel) + '</text>'
        : '<g transform="translate(26 ' + cy + ') rotate(-90)"><rect x="-70" y="-15" width="140" height="28" rx="9" class="ch-empty"/><text text-anchor="middle" y="6" class="ch-ph">ชื่อแกนตั้ง</text></g>';
    }
    s += '</g>';

    /* แท่ง */
    const vals = o.vals || spec.vals;
    const rank = o.rank || {};
    spec.cats.forEach((c, i) => {
      const v = vals[i], x = g.cx(i) - g.bw / 2, y = g.y(v), h = v * g.unit;
      const col = COLORS[i % COLORS.length];
      s += '<g class="bar' + (hl.indexOf(i) >= 0 ? ' hl' : '') + (dim.indexOf(i) >= 0 ? ' dim' : '') + (o.clickBar ? ' tappable' : '') + (rank[i] ? ' ranked' : '') + '" data-i="' + i + '" data-part="bar" style="--d:' + (i * 0.07).toFixed(2) + 's">' +
        '<rect x="' + (g.cx(i) - g.slot / 2) + '" y="' + (g.top - 10) + '" width="' + g.slot + '" height="' + (g.PH + 10) + '" fill="transparent" class="bar-hit"/>' +
        '<g class="bar-grow"><path d="' + barPath(x, y, g.bw, h, o.mini ? 6 : 12) + '" fill="' + col + '" class="bar-body"/>' +
        '<path d="' + shinePath(x, y, h) + '" class="bar-shine"/></g>';
      if (o.showVals) s += '<text x="' + g.cx(i) + '" y="' + (y - 8) + '" text-anchor="middle" class="ch-val">' + v + '</text>';
      if (rank[i]) s += '<g class="rank-badge" transform="translate(' + g.cx(i) + ' ' + (y - 22) + ')"><circle r="14"/><text y="6" text-anchor="middle">' + rank[i] + '</text></g>';
      s += '</g>';
    });

    /* ชื่อรายการ (แกนนอน) */
    if (!o.mini) {
      s += '<g class="pt" data-part="xaxis">';
      spec.cats.forEach((c, i) => {
        s += '<g transform="translate(' + g.cx(i) + ' ' + (g.base + 30) + ') scale(.82)" class="cat-ic">' + (TT.art.RAW[c.k] || '') + '</g>';
        s += '<text x="' + g.cx(i) + '" y="' + (g.base + 68) + '" text-anchor="middle" class="ch-cat">' + esc(c.n) + '</text>';
      });
      s += lab.x
        ? '<text x="' + (g.L + g.PW / 2) + '" y="' + (g.H - 12) + '" text-anchor="middle" class="ch-axl">' + esc(spec.xLabel) + '</text>'
        : '<rect x="' + (g.L + g.PW / 2 - 70) + '" y="' + (g.H - 36) + '" width="140" height="26" rx="9" class="ch-empty"/><text x="' + (g.L + g.PW / 2) + '" y="' + (g.H - 17) + '" text-anchor="middle" class="ch-ph">ชื่อแกนนอน</text>';
      s += '<rect x="' + g.L + '" y="' + (g.base + 4) + '" width="' + g.PW + '" height="' + (g.H - g.base - 6) + '" fill="transparent" class="part-hit"/></g>';
    }
    s += '<g class="overlay"></g></svg>';
    return s;
  }

  /* เส้นนำสายตา: ลากเส้นประจากยอดแท่งไปที่แกนตั้ง (ใส่เพิ่มบนแผนภูมิที่วาดแล้ว) */
  function addGuide(svg, spec, i, v, o) {
    const g = geom(spec, o);
    const ov = svg.querySelector('.overlay');
    if (!ov) return;
    const y = g.y(v == null ? spec.vals[i] : v);
    const ns = 'http://www.w3.org/2000/svg';
    const ln = document.createElementNS(ns, 'line');
    ln.setAttribute('x1', g.L); ln.setAttribute('x2', g.cx(i)); ln.setAttribute('y1', y); ln.setAttribute('y2', y);
    ln.setAttribute('class', 'guide-line');
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', g.cx(i)); dot.setAttribute('cy', y); dot.setAttribute('r', 6); dot.setAttribute('class', 'guide-dot');
    ov.appendChild(ln); ov.appendChild(dot);
    /* เน้นเลขบนแกน */
    const t = svg.querySelector('.tick[data-v="' + (v == null ? spec.vals[i] : v) + '"]');
    if (t) t.classList.add('glow');
  }

  /* ═══════════ ตารางสองทาง ═══════════
     spec: { title, corner, colHead, rowHead, cols:[{n,k}], rows:[{n,k}], cells:[[..]] }
     o: { totals:true, blank:{ '0,1':1, 'rt0':1, 'ct1':1, 'gt':1 }, hlRow, hlCol, click:true, typed:{key:val} } */
  function tableHTML(spec, o) {
    o = o || {};
    const R = spec.rows.length, C = spec.cols.length;
    const rt = spec.rows.map((_, r) => spec.cells[r].reduce((a, b) => a + b, 0));
    const ct = spec.cols.map((_, c) => spec.cells.reduce((a, row) => a + row[c], 0));
    const gt = rt.reduce((a, b) => a + b, 0);
    const blank = o.blank || {}, typed = o.typed || {};
    const cellTxt = (key, val) => blank[key] ? '<span class="q">' + (typed[key] != null ? typed[key] : '?') + '</span>' : val;
    let h = '<div class="tw">';
    if (spec.title) h += '<div class="tw-title">' + esc(spec.title) + '</div>';
    h += '<table class="two-way"><thead><tr><th class="tw-corner" rowspan="2">' + esc(spec.corner || '') + '</th><th class="colhead" colspan="' + C + '">' + esc(spec.colHead || '') + '</th>' + (o.totals ? '<th class="tot-h" rowspan="2">รวม</th>' : '') + '</tr><tr>';
    spec.cols.forEach((c, j) => {
      h += '<th class="ch' + (o.hlCol === j ? ' hl' : '') + '" data-c="' + j + '">' + (c.k ? TT.art.thing(c.k, 30) : '') + '<span>' + esc(c.n) + '</span></th>';
    });
    h += '</tr></thead><tbody>';
    spec.rows.forEach((r, i) => {
      h += '<tr class="' + (o.hlRow === i ? 'hl' : '') + '"><th class="rh' + (o.hlRow === i ? ' hl' : '') + '" data-r="' + i + '">' + (r.k ? TT.art.thing(r.k, 28) : '') + '<span>' + esc(r.n) + '</span></th>';
      spec.cols.forEach((c, j) => {
        const key = i + ',' + j;
        const hot = (o.hlRow === i || o.hlCol === j) ? ' hot' : '';
        h += '<td class="cell' + (blank[key] ? ' blank' : '') + hot + (o.hit === key ? ' hit' : '') + (o.click ? ' tappable' : '') + '" data-r="' + i + '" data-c="' + j + '" data-key="' + key + '">' + cellTxt(key, spec.cells[i][j]) + '</td>';
      });
      if (o.totals) h += '<td class="tot rt' + (blank['rt' + i] ? ' blank' : '') + '" data-key="rt' + i + '">' + cellTxt('rt' + i, rt[i]) + '</td>';
      h += '</tr>';
    });
    if (o.totals) {
      h += '<tr class="ctrow"><th class="rh tot-h">รวม</th>';
      spec.cols.forEach((c, j) => { h += '<td class="tot ct' + (blank['ct' + j] ? ' blank' : '') + '" data-key="ct' + j + '">' + cellTxt('ct' + j, ct[j]) + '</td>'; });
      h += '<td class="tot gt' + (blank.gt ? ' blank' : '') + '" data-key="gt">' + cellTxt('gt', gt) + '</td></tr>';
    }
    h += '</tbody></table></div>';
    return h;
  }
  function tableSums(spec) {
    const rt = spec.rows.map((_, r) => spec.cells[r].reduce((a, b) => a + b, 0));
    const ct = spec.cols.map((_, c) => spec.cells.reduce((a, row) => a + row[c], 0));
    return { rt, ct, gt: rt.reduce((a, b) => a + b, 0) };
  }

  /* ตัวคีย์แพด (แตะตัวเลข) */
  function keypadHTML() {
    return '<div class="keypad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button type="button" class="key" data-k="' + n + '">' + n + '</button>').join('') +
      '<button type="button" class="key key-del" data-k="del" aria-label="ลบ">' + TT.art.icon('back') + '</button>' +
      '<button type="button" class="key" data-k="0">0</button>' +
      '<button type="button" class="key key-ok" data-k="ok" aria-label="ตกลง">' + TT.art.icon('check') + '</button></div>';
  }

  TT.chart = { geom, chartSVG, updateBar, addGuide, tableHTML, tableSums, keypadHTML, COLORS };
})();
