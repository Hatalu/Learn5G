/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — กลไกภารกิจ 4 แบบ
     parts : แตะส่วนประกอบของแผนภูมิ
     quiz  : อ่านแผนภูมิแล้วตอบ (เลือกตอบ / แตะเลขบนแกน / แตะแท่ง / แตะเรียงลำดับ)
     table : อ่านตารางสองทาง (แตะช่อง / เลือกตอบ / เติมตัวเลขด้วยแป้น)
     build : สร้างแผนภูมิแท่ง (เลือกช่องแกนตั้ง ตั้งชื่อ ลากแท่ง)
   ทุกกลไกได้รับ c = { stage, panel, T, alive, say, win, miss, hint, resetHint, onHint, hintText }
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT;
  const { art, audio, ui, chart } = TT;
  const { esc, wait } = ui;
  const { shuffle, sample } = TT.DATA;
  const ENG = TT.ENG = {};

  const dots = (i, n) => '<div class="q-prog">' + Array.from({ length: n }, (_, k) => '<i class="qd' + (k < i ? ' done' : k === i ? ' now' : '') + '"></i>').join('') + '</div>';
  const optsHTML = q => q.options.map((o, k) => {
    const tf = !!q.tf;
    return '<button type="button" class="opt' + (tf ? ' tf ' + (o === 'จริง' ? 'yes' : 'no') : '') + '" data-k="' + k + '">' + (tf ? art.icon(o === 'จริง' ? 'check' : 'cross') : '') + '<span>' + esc(o) + '</span></button>';
  }).join('');
  /* ตัดตัวเลือกผิดออก 2 ข้อ (คำใบ้ระดับ 3) */
  function eliminate(panel, options, ans) {
    const wrongs = Array.from(panel.querySelectorAll('.opt')).filter(b => options[+b.dataset.k] !== ans && !b.disabled);
    sample(wrongs, Math.max(0, Math.min(2, wrongs.length - 1))).forEach(b => { b.disabled = true; b.classList.add('off'); });
  }

  /* ═══════════ parts : ส่วนประกอบแผนภูมิ ═══════════ */
  ENG.parts = (T, c) => {
    const { stage, panel } = c;
    stage.innerHTML = '<div class="chart-wrap">' + chart.chartSVG(T.spec, { still: false }) + '</div>';
    const svg = stage.querySelector('svg');
    const NAME = { title: 'ชื่อแผนภูมิ', yaxis: 'แกนตั้ง', xaxis: 'แกนนอน', bar: 'แท่ง' };
    const found = [];
    let k = 0, qMiss = 0, locked = false;
    c.dbg(() => T.asks[k]);
    function show() {
      const a = T.asks[k];
      panel.innerHTML = '<div class="q-card">' + dots(k, T.asks.length) + '<p class="q-text">' + esc(a.prompt) + '</p><div class="chips">' +
        found.map(f => '<span class="chip">' + art.icon('check') + esc(f) + '</span>').join('') + '</div></div>';
      svg.querySelectorAll('.pulse').forEach(e => e.classList.remove('pulse'));
      qMiss = 0; locked = false;
      c.resetHint();
      c.say({ text: a.prompt });
    }
    c.hintText(lv => T.hints[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (lv < 2 || locked) return;
      const a = T.asks[k];
      const el = a.part === 'bar' ? svg.querySelector('.bar[data-i="' + a.idx + '"]') : svg.querySelector('.pt[data-part="' + a.part + '"]');
      if (el) el.classList.add('pulse');
    });
    svg.addEventListener('click', async e => {
      if (locked) return;
      const el = e.target.closest('[data-part]');
      if (!el) return;
      const a = T.asks[k], part = el.dataset.part;
      audio.sfx('tick');
      const ok = part === a.part && (part !== 'bar' || +el.dataset.i === a.idx);
      if (!ok) {
        qMiss++;
        c.miss(part === 'bar' && a.part === 'bar' ? 'แท่งนั้นยังไม่ใช่แท่งที่สูงที่สุด เทียบความสูงของทุกแท่งอีกที' : 'นั่นคือ' + NAME[part] + ' ลองหา' + NAME[a.part] + 'นะ', el);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
        return;
      }
      locked = true;
      el.classList.add('found');
      found.push(NAME[a.part]);
      audio.sfx('check'); ui.sparkle(el, 14);
      if (k === T.asks.length - 1) return c.win({ text: a.why }, svg);
      await c.say({ text: a.why, mood: 'cheer' });
      if (!c.alive()) return;
      k++; show();
    });
    show();
  };

  /* ═══════════ quiz : อ่านแผนภูมิแล้วตอบ ═══════════ */
  ENG.quiz = (T, c) => {
    const { stage, panel } = c;
    let qi = 0, q, spec, st, svg, locked, qMiss;
    c.dbg(() => q);

    function draw() {
      stage.innerHTML = '<div class="chart-wrap">' + chart.chartSVG(spec, {
        clickBar: q.by === 'bar' || q.by === 'order', clickTick: q.by === 'tick',
        hl: st.hl, dim: st.dim, showVals: st.vals, rank: st.rank, still: st.still
      }) + '</div>';
      st.still = true;
      svg = stage.querySelector('svg');
      st.guides.forEach(g => chart.addGuide(svg, spec, g.i, g.v));
      (q.focus || []).forEach(v => { const t = svg.querySelector('.tick[data-v="' + v + '"]'); if (t) t.classList.add('glow'); });
      if (st.glow != null) { const t = svg.querySelector('.tick[data-v="' + st.glow + '"]'); if (t) t.classList.add('glow', 'pulse'); }
      if (st.pulse != null) { const b = svg.querySelector('.bar[data-i="' + st.pulse + '"]'); if (b) b.classList.add('pulse'); }
      svg.addEventListener('click', onSvg);
    }
    function load() {
      q = T.qs[qi]; spec = q.spec || T.spec;
      st = { hl: (q.hl || []).slice(), dim: [], vals: false, rank: {}, guides: [], glow: null, pulse: null, still: false };
      qMiss = 0; locked = false;
      c.resetHint();
      const sub = q.by === 'tick' ? 'แตะที่เลขบนแกนตั้ง' : q.by === 'bar' ? 'แตะที่แท่ง' : q.by === 'order' ? 'แตะแท่งทีละแท่งตามลำดับ' : '';
      panel.innerHTML = '<div class="q-card">' + dots(qi, T.qs.length) + '<p class="q-text">' + esc(q.q) + '</p>' +
        (q.options ? '<div class="opts n' + q.options.length + '">' + optsHTML(q) + '</div>' : '<p class="q-sub">' + sub + '</p>') +
        '<div class="q-why hidden"></div></div>';
      panel.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => pickOpt(b)));
      draw();
      c.say({ text: q.q });
    }
    function wrong(msg, el) {
      qMiss++;
      c.miss(msg, el);
      if (qMiss >= 2) c.hint(Math.min(3, qMiss));
    }
    function pickOpt(b) {
      if (locked) return;
      const o = q.options[+b.dataset.k];
      if (o === q.ans) return correct(b);
      b.classList.add('wrong'); b.disabled = true;
      wrong(q.hints[0], b);
    }
    function onSvg(e) {
      if (locked) return;
      if (q.by === 'tick') {
        const t = e.target.closest('.tick'); if (!t) return;
        const v = +t.dataset.v; audio.sfx('tick');
        if (v === q.ans) return correct(t);
        wrong('เลข ' + v + ' ยังไม่ตรงกับยอดแท่ง ลองไล่สายตาจากยอดแท่งไปทางซ้ายอีกที', t);
      } else if (q.by === 'bar') {
        const b = e.target.closest('.bar'); if (!b) return;
        const i = +b.dataset.i; audio.sfx('tick');
        if (i === q.ans) { b.classList.add('found'); return correct(b); }
        wrong('แท่ง' + spec.cats[i].n + 'ยังไม่ใช่ ' + q.hints[0], b);
      } else if (q.by === 'order') {
        const b = e.target.closest('.bar'); if (!b) return;
        const i = +b.dataset.i; if (st.rank[i]) return;
        const k = Object.keys(st.rank).length;
        if (i === q.ans[k]) {
          st.rank[i] = k + 1; st.pulse = null; audio.sfx('pop', k); draw();
          if (k + 1 === q.ans.length) correct(svg);
        } else wrong('แท่ง' + spec.cats[i].n + 'ยังไม่ใช่แท่งถัดไป เทียบความสูงอีกที', b);
      }
    }
    async function correct(el) {
      locked = true;
      audio.sfx('check');
      if (el && el.getBoundingClientRect) ui.sparkle(el, 16);
      if (el && el.classList && el.classList.contains('opt')) el.classList.add('right');
      const w = panel.querySelector('.q-why'); w.textContent = q.why; w.classList.remove('hidden');
      if (qi === T.qs.length - 1) return c.win({ text: q.why }, el);
      await c.say({ text: q.why, mood: 'cheer' });
      if (!c.alive()) return;
      await wait(200);
      qi++; load();
    }
    c.hintText(lv => q.hints[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (lv >= 2) {
        st.guides = q.guideAll ? spec.cats.map((_, i) => ({ i })) : (q.guide || []);
        st.hl = (q.hl || []).slice();
      }
      if (lv >= 3) {
        if (q.by === 'tick') st.glow = q.ans;
        else if (q.by === 'bar') st.dim = shuffle(spec.cats.map((_, i) => i).filter(i => i !== q.ans)).slice(0, Math.max(1, spec.cats.length - 2));
        else if (q.by === 'order') st.pulse = q.ans[Object.keys(st.rank).length];
        else if (q.tf) st.vals = true;
        else if (q.options) eliminate(panel, q.options, q.ans);
      }
      draw();
    });
    load();
  };

  /* ═══════════ table : ตารางสองทาง ═══════════ */
  ENG.table = (T, c) => {
    const { stage, panel } = c;
    let qi = 0, q, tb, totals, st, locked, qMiss;
    c.dbg(() => q);
    const sumsOf = () => chart.tableSums(tb);

    function draw() {
      const blank = {};
      if (q.by === 'fill') q.blanks.forEach(k => { if (!st.done[k]) blank[k] = 1; });
      let html = '';
      html += chart.tableHTML(tb, { totals, blank, typed: st.typed, hlRow: st.hlRow, hlCol: st.hlCol, click: q.by === 'cell', hit: st.hit });
      stage.innerHTML = html;
      stage.querySelectorAll('[data-key]').forEach(el => {
        const k = el.dataset.key;
        if (q.by === 'fill') {
          if (st.done[k]) el.classList.add('okc');
          if (st.sel === k) el.classList.add('sel');
          if (q.blanks.indexOf(k) >= 0 && !st.done[k]) el.classList.add('tappable');
        }
        if (q.by === 'cell' && q.tapKeys && /^(rt|ct|gt)/.test(k)) el.classList.add('tappable');
        if (st.hit === k) el.classList.add('hit');
        el.addEventListener('click', () => onCell(el));
      });
    }
    function load() {
      q = T.qs[qi]; tb = q.table || T.table; totals = q.totals != null ? q.totals : T.totals;
      st = { hlRow: null, hlCol: null, hit: null, typed: {}, done: {}, sel: q.by === 'fill' ? q.blanks[0] : null, buf: '' };
      qMiss = 0; locked = false;
      c.resetHint();
      const sub = q.by === 'cell' ? 'แตะที่ช่องในตาราง' : '';
      panel.innerHTML = (T.chart ? '<div class="q-chart">' + chart.chartSVG(T.chart, { still: true }) + '</div>' : '') + '<div class="q-card">' + dots(qi, T.qs.length) + '<p class="q-text">' + esc(q.q) + '</p>' +
        (q.options ? '<div class="opts n' + q.options.length + '">' + optsHTML(q) + '</div>' : '') +
        (q.by === 'fill' ? '<div class="q-eq hidden"></div>' + chart.keypadHTML() : '') +
        (sub ? '<p class="q-sub">' + sub + '</p>' : '') + '<div class="q-why hidden"></div></div>';
      panel.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => pickOpt(b)));
      panel.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => onKey(b.dataset.k)));
      draw();
      c.say({ text: q.q });
    }
    function wrong(msg, el) {
      qMiss++;
      c.miss(msg, el);
      if (qMiss >= 2) c.hint(Math.min(3, qMiss));
    }
    function pickOpt(b) {
      if (locked) return;
      if (q.options[+b.dataset.k] === q.ans) return correct(b);
      b.classList.add('wrong'); b.disabled = true;
      wrong(q.hints[0], b);
    }
    function describe(key) {
      if (/^rt/.test(key)) return 'ช่องรวมของแถว ' + tb.rows[+key.slice(2)].n;
      if (/^ct/.test(key)) return 'ช่องรวมของหลัก ' + tb.cols[+key.slice(2)].n;
      if (key === 'gt') return 'ช่องรวมทั้งหมด';
      const [r, cc] = key.split(',').map(Number);
      return 'แถว ' + tb.rows[r].n + ' ตัดกับหลัก ' + tb.cols[cc].n;
    }
    function onCell(el) {
      if (locked) return;
      const key = el.dataset.key;
      if (q.by === 'fill') {
        if (q.blanks.indexOf(key) < 0 || st.done[key]) return;
        st.sel = key; st.buf = ''; audio.sfx('pop'); draw(); refreshHint();
        return;
      }
      if (q.by !== 'cell') return;
      const inner = /^\d+,\d+$/.test(key);
      if (!inner && !q.tapKeys) return;
      audio.sfx('tick');
      if (q.ans.indexOf(key) >= 0) { st.hit = null; el.classList.add('okc'); return correct(el); }
      if (inner) {
        const [r, cc] = key.split(',').map(Number);
        st.hlRow = r; st.hlCol = cc; draw();
        setTimeout(() => { if (!locked && c.alive() && !st.keep) { st.hlRow = null; st.hlCol = null; draw(); } }, 1400);
      }
      wrong('ช่องที่แตะคือ ' + describe(key) + ' ลองหาแถวและหลักที่โจทย์บอกอีกครั้งนะ', el);
    }
    function eqFor(key) {
      const S = sumsOf();
      if (/^rt/.test(key)) return tb.cells[+key.slice(2)].join(' + ') + ' = ?';
      if (/^ct/.test(key)) return tb.cells.map(r => r[+key.slice(2)]).join(' + ') + ' = ?';
      if (key === 'gt') return S.rt.join(' + ') + ' = ?';
      const [r, cc] = key.split(',').map(Number);
      const others = tb.cells[r].filter((_, j) => j !== cc);
      return S.rt[r] + ' − (' + others.join(' + ') + ') = ?';
    }
    function refreshHint() {
      if (q.by !== 'fill' || !st.sel) return;
      const lv = c.level();
      const k = st.sel;
      if (lv >= 2) {
        st.hlRow = null; st.hlCol = null;
        if (/^rt/.test(k)) st.hlRow = +k.slice(2);
        else if (/^ct/.test(k)) st.hlCol = +k.slice(2);
        else if (k !== 'gt') { const [r, cc] = k.split(',').map(Number); st.hlRow = r; st.hlCol = cc; }
        draw();
      }
      const eq = panel.querySelector('.q-eq');
      if (eq) { if (lv >= 3) { eq.textContent = eqFor(k); eq.classList.remove('hidden'); } else eq.classList.add('hidden'); }
    }
    function onKey(k) {
      if (locked || q.by !== 'fill' || !st.sel) return;
      audio.sfx('key');
      if (k === 'del') st.buf = st.buf.slice(0, -1);
      else if (k === 'ok') return commit();
      else if (st.buf.length < 3) st.buf += k;
      st.typed[st.sel] = st.buf;
      const el = stage.querySelector('[data-key="' + st.sel + '"] .q');
      if (el) el.textContent = st.buf === '' ? '?' : st.buf;
    }
    function commit() {
      if (st.buf === '') return;
      const k = st.sel, val = +st.buf;
      if (val === q.ans[k]) {
        st.done[k] = true; delete st.typed[k]; st.buf = '';
        audio.sfx('pop', 2);
        const nextK = q.blanks.find(b => !st.done[b]);
        st.sel = nextK || null;
        st.hlRow = null; st.hlCol = null;
        draw();
        const el = stage.querySelector('[data-key="' + k + '"]'); if (el) ui.sparkle(el, 10);
        if (!nextK) return correct(stage.querySelector('table'));
        refreshHint();
        return;
      }
      const msg = /^rt/.test(k) ? 'รวมแถว ' + tb.rows[+k.slice(2)].n + ' ยังไม่ใช่ ' + val + ' ลองบวกตัวเลขในแถวนั้นอีกที'
        : /^ct/.test(k) ? 'รวมหลัก ' + tb.cols[+k.slice(2)].n + ' ยังไม่ใช่ ' + val + ' ลองบวกตัวเลขในหลักนั้นอีกที'
        : k === 'gt' ? val + ' ยังไม่ใช่ผลรวมทั้งหมด ลองบวกผลรวมของทุกแถวดูนะ'
        : val + ' ยังไม่ถูก ลองใช้ผลรวมของแถวลบด้วยตัวเลขที่เหลือในแถว';
      st.buf = ''; st.typed[k] = '';
      const el = stage.querySelector('[data-key="' + k + '"] .q'); if (el) el.textContent = '?';
      ui.shake(stage.querySelector('[data-key="' + k + '"]'));
      wrong(msg, null);
    }
    async function correct(el) {
      locked = true;
      audio.sfx('check');
      if (el && el.getBoundingClientRect) ui.sparkle(el, 16);
      if (el && el.classList && el.classList.contains('opt')) el.classList.add('right');
      const w = panel.querySelector('.q-why'); w.textContent = q.why; w.classList.remove('hidden');
      if (qi === T.qs.length - 1) return c.win({ text: q.why }, el);
      await c.say({ text: q.why, mood: 'cheer' });
      if (!c.alive()) return;
      await wait(200);
      qi++; load();
    }
    c.hintText(lv => q.hints[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (q.by === 'fill') { refreshHint(); return; }
      if (lv >= 2) {
        if (q.rowN != null) st.hlRow = q.rowN;
        if (q.colN != null) st.hlCol = q.colN;
        if (q.hlCell) st.hit = q.hlCell;
        st.keep = true;
      }
      if (lv >= 3) {
        if (q.by === 'cell') st.hit = q.ans[0];
        else if (q.options) eliminate(panel, q.options, q.ans);
      }
      draw();
    });
    load();
  };

  /* ═══════════ build : สร้างแผนภูมิแท่ง ═══════════ */
  ENG.build = (T, c) => {
    const { stage, panel } = c;
    const base = T.spec;
    const target = base.vals.slice();
    let scale = T.preScale || base.scale;
    const labels = { title: !T.askLabels, x: !T.askLabels, y: !T.askLabels };
    const vals = T.init ? T.init.slice() : target.map(() => 0);
    c.dbg(() => ({ target, vals, phase, T, scale }));
    let svg, curSpec, drag = -1, wrongSet = [], qMiss = 0, locked = false, phase = '', labelIdx = 0, lvNow = 0;

    const maxFor = sc => { const top = Math.max.apply(null, target); let m = Math.ceil(top / sc) * sc; if (m / sc < 4) m = sc * 4; return m; };
    const mkSpec = (sc, v) => Object.assign({}, base, { scale: sc, max: maxFor(sc), vals: v || vals });
    const dataHTML = () => T.twoWay ? chart.tableHTML(T.twoWay, { totals: true }) :
      '<div class="data-list"><div class="dl-h">ข้อมูลที่ต้องสร้าง</div>' + base.cats.map((ct, i) => '<div class="dl-r" data-i="' + i + '">' + art.thing(ct.k, 30) + '<span class="dl-n">' + esc(ct.n) + '</span><b class="dl-v">' + target[i] + '</b><small>' + esc(base.unit) + '</small></div>').join('') + '</div>';
    const wrongNow = () => target.map((t, i) => vals[i] === t ? -1 : i).filter(i => i >= 0);

    function drawChart() {
      curSpec = mkSpec(scale);
      stage.innerHTML = '<div class="chart-wrap">' + chart.chartSVG(curSpec, { vals, labels, showVals: phase === 'build', build: true, still: true }) + '</div>';
      svg = stage.querySelector('svg');
      if (phase === 'build') {
        bindDrag();
        applyHint();
      }
    }
    function applyHint() {
      if (!svg) return;
      const w = lvNow >= 2 ? (wrongSet.length ? wrongSet : wrongNow()) : wrongSet;
      w.forEach(i => { const b = svg.querySelector('.bar[data-i="' + i + '"]'); if (b) b.classList.add('flag'); });
      if (lvNow >= 3) w.forEach(i => chart.addGuide(svg, curSpec, i, target[i]));
      panel.querySelectorAll('.dl-r').forEach(r => r.classList.toggle('flag', lvNow >= 2 && w.indexOf(+r.dataset.i) >= 0));
    }
    function bindDrag() {
      const g = chart.geom(curSpec);
      const toPt = e => { const m = svg.getScreenCTM(); if (!m) return null; const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(m.inverse()); };
      const setFrom = p => {
        if (!p || drag < 0) return;
        const raw = (g.base - p.y) / g.unit;
        let v = Math.round(raw / T.snap) * T.snap;
        v = Math.max(0, Math.min(curSpec.max, v));
        if (v !== vals[drag]) {
          vals[drag] = v;
          chart.updateBar(svg, curSpec, drag, v);
          audio.sfx('grow', v / curSpec.max);
          wrongSet = wrongSet.filter(x => x !== drag);
          const b = svg.querySelector('.bar[data-i="' + drag + '"]'); if (b) b.classList.remove('flag', 'wrong');
        }
      };
      svg.addEventListener('pointerdown', e => {
        if (locked) return;
        const p = toPt(e); if (!p) return;
        const i = Math.floor((p.x - g.L) / g.slot);
        if (p.x < g.L || p.x > g.W - g.R || i < 0 || i >= g.n || p.y > g.base + 14) return;
        drag = i;
        try { svg.setPointerCapture(e.pointerId); } catch (err) {}
        const b = svg.querySelector('.bar[data-i="' + i + '"]'); if (b) b.classList.add('grab');
        setFrom(p);
        e.preventDefault();
      });
      svg.addEventListener('pointermove', e => { if (drag >= 0) setFrom(toPt(e)); });
      const end = () => { if (drag >= 0) { const b = svg.querySelector('.bar[data-i="' + drag + '"]'); if (b) b.classList.remove('grab'); } drag = -1; };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
    }

    /* ── ขั้นเลือกช่องแกนตั้ง ── */
    function phaseScale() {
      phase = 'scale';
      stage.innerHTML = '<div class="scale-grid big">' +
        T.chooseScale.map(sc => '<button type="button" class="scale-opt" data-sc="' + sc + '"><div class="mini-chart">' + chart.chartSVG(mkSpec(sc, target), { mini: true, still: true }) + '</div><b>ช่องละ ' + sc + '</b></button>').join('') + '</div>';
      panel.innerHTML = '<div class="q-card"><p class="q-text">' + esc(T.prompt) + '</p>' + dataHTML() + '</div>';
      stage.querySelectorAll('.scale-opt').forEach(b => b.addEventListener('click', () => {
        if (locked) return;
        const sc = +b.dataset.sc; audio.sfx('pop');
        if (sc === T.truth) { scale = sc; b.classList.add('right'); audio.sfx('check'); ui.sparkle(b, 14); c.say({ text: 'ช่องละ ' + sc + ' ค่ามากสุดอยู่ในแผนภูมิพอดี และแท่งทุกแท่งตรงกับเส้น', mood: 'cheer' }).then(next); return; }
        b.classList.add('wrong'); b.disabled = true;
        const top = Math.max.apply(null, target);
        miss(sc < T.truth ? 'ช่องละ ' + sc + ' ต้องมีเส้นถึง ' + Math.ceil(top / sc) + ' เส้น แน่นเกินไป ลองช่องที่ใหญ่กว่านี้' : 'ช่องละ ' + sc + ' ใหญ่เกินไป แท่งเตี้ยจนอ่านค่าไม่ออก ลองช่องที่เล็กกว่านี้', b);
      }));
      c.say({ text: T.prompt });
    }
    /* ── ขั้นตั้งชื่อ ── */
    function phaseLabels() {
      phase = 'labels';
      drawChart();
      const L = T.labelQs[labelIdx];
      panel.innerHTML = '<div class="q-card">' + dots(labelIdx, T.labelQs.length) + '<p class="q-text">' + esc(L.q) + '</p><div class="opts n3">' + optsHTML({ options: L.options }) + '</div></div>';
      panel.querySelectorAll('.opt').forEach(b => b.addEventListener('click', async () => {
        if (locked) return;
        const o = L.options[+b.dataset.k];
        if (o === L.ans) {
          b.classList.add('right'); audio.sfx('check'); labels[L.key] = true; qMiss = 0;
          drawChart(); ui.sparkle(b, 12);
          await c.say({ text: L.why, mood: 'cheer' });
          if (!c.alive()) return;
          labelIdx++; c.resetHint(); lvNow = 0;
          if (labelIdx < T.labelQs.length) phaseLabels(); else next();
        } else {
          b.classList.add('wrong'); b.disabled = true; audio.sfx('nope');
          miss(L.key === 'title' ? 'ชื่อแผนภูมิต้องตรงกับเรื่องของข้อมูล ลองดูอีกที' : L.key === 'x' ? 'แกนนอนเป็นชื่อรายการ ไม่ใช่จำนวน ลองดูอีกที' : 'แกนตั้งบอกจำนวน ลองดูอีกที', b);
        }
      }));
      c.say({ text: L.q });
    }
    /* ── ขั้นลากแท่ง ── */
    function phaseBuild() {
      phase = 'build';
      drawChart();
      panel.innerHTML = '<div class="q-card"><p class="q-text">' + esc(T.prompt) + '</p><p class="q-sub">แตะหรือลากในแต่ละหลักเพื่อยืดแท่ง</p>' + dataHTML() +
        '<button type="button" class="btn btn-go btn-check" id="bdCheck">' + art.icon('check') + '<span>ตรวจแผนภูมิ</span></button></div>';
      panel.querySelector('#bdCheck').addEventListener('click', check);
      c.say({ text: T.prompt });
    }
    function next() {
      if (phase === 'scale' && T.askLabels) { labelIdx = 0; return phaseLabels(); }
      if (phase === 'scale' || phase === 'labels') return phaseBuild();
    }
    function miss(msg, el) {
      qMiss++;
      c.miss(msg, el);
      if (qMiss >= 2 && phase === 'build') c.hint(Math.min(3, qMiss));
      else if (qMiss >= 2) c.hint(Math.min(3, qMiss));
    }
    function check() {
      if (locked) return;
      const w = wrongNow();
      audio.sfx('check');
      if (!w.length) {
        locked = true;
        svg.querySelectorAll('.bar').forEach(b => b.classList.remove('flag'));
        return c.win({ text: T.okText || 'ยอดแท่งตรงกับข้อมูลทุกแท่งเลย แผนภูมิถูกต้อง!' }, svg);
      }
      wrongSet = w;
      w.forEach(i => { const b = svg.querySelector('.bar[data-i="' + i + '"]'); if (b) { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 900); } });
      const names = w.slice(0, 2).map(i => base.cats[i].n).join(' กับ ');
      miss('ยังมีแท่ง' + names + (w.length > 2 ? ' และอีก ' + (w.length - 2) + ' แท่ง' : '') + 'ที่ไม่ตรงกับตาราง ลองเทียบทีละแท่งนะ', null);
    }

    c.hintText(lv => T.hints[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      lvNow = lv;
      if (locked) return;
      if (phase === 'build') { drawChart(); }
      else if (phase === 'scale') {
        const good = stage.querySelector('.scale-opt[data-sc="' + T.truth + '"]');
        if (lv >= 2 && good) good.classList.add('pulse');
        if (lv >= 3) stage.querySelectorAll('.scale-opt').forEach(b => { if (+b.dataset.sc !== T.truth && !b.disabled) { b.disabled = true; b.classList.add('off'); } });
      } else if (phase === 'labels') {
        const L = T.labelQs[labelIdx];
        if (lv >= 3) eliminate(panel, L.options, L.ans);
        else if (lv >= 2) { const i = L.options.indexOf(L.ans); const b = panel.querySelector('.opt[data-k="' + i + '"]'); if (b) b.classList.add('pulse'); }
      }
    });
    if (T.chooseScale) phaseScale();
    else if (T.askLabels) phaseLabels();
    else phaseBuild();
  };
})();
