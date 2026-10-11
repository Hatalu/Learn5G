/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — Interactive tools (widgets)
   filler   : แตะเติมไส้พายทีละชิ้น
   packer   : แพ็กชิ้นพายลงถาด (เศษเกิน → จำนวนคละ)
   cutter   : ผ่าพายเต็มถาดเป็นชิ้น (จำนวนคละ → เศษเกิน)
   machine  : เครื่องตัด/รวมชิ้น (เศษส่วนที่เท่ากัน / อย่างต่ำ)
   scale    : ตาชั่งเปรียบเทียบ
   shelf    : ชั้นเรียงลำดับ + เส้นจำนวนพิสูจน์
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const art = PP.art, F = PP.F, audio = PP.audio, ui = PP.ui;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ── ลอยชิ้นจาก A ไป B (game juice) ── */
  function fly(fromEl, toEl, html, done) {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const c = document.createElement('div');
    c.className = 'flyer';
    c.innerHTML = html;
    c.style.left = a.left + 'px';
    c.style.top = a.top + 'px';
    c.style.width = a.width + 'px';
    c.style.height = a.height + 'px';
    document.getElementById('fx').appendChild(c);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' +
        (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(0.6)';
      c.style.opacity = '0.2';
    }));
    setTimeout(() => { c.remove(); if (done) done(); }, 380);
  }

  /* ════════ FILLER ════════ */
  function filler(el, o) {
    const d = o.d, count = o.pies;
    let filled = 0, locked = false;
    let html = '<div class="pies filler">';
    for (let p = 0; p < count; p++) {
      html += '<div class="pie-slot" data-p="' + p + '">' + art.pie(d, 0, { flavor: o.flavor }) +
        '<span class="pie-no">ถาดที่ ' + (p + 1) + '</span></div>';
    }
    html += '</div><div class="live">เติมแล้ว <span class="live-val"></span> ถาด</div>';
    el.innerHTML = html;
    const slots = Array.from(el.querySelectorAll('.pie-slot'));
    const live = el.querySelector('.live-val');

    function paint() {
      slots.forEach((slot, p) => {
        const inPie = clamp(filled - p * d, 0, d);
        slot.querySelectorAll('.sl').forEach((sl, i) => {
          sl.classList.toggle('on', i < inPie);
          sl.classList.toggle('off', i >= inPie);
        });
        slot.classList.toggle('locked', filled < p * d);
        slot.classList.toggle('full', inPie === d);
      });
      live.innerHTML = F.frHTML(filled, d);
    }
    el.querySelector('.filler').addEventListener('click', e => {
      if (locked) return;
      const slot = e.target.closest('.pie-slot');
      if (!slot) return;
      const p = +slot.dataset.p;
      const sl = e.target.closest('.sl');
      if (filled < p * d) {
        ui.shake(slot);
        audio.sfx('gentle');
        if (o.onLocked) o.onLocked();
        return;
      }
      if (sl && sl.classList.contains('on')) {
        filled--;
        audio.sfx('pop', 0);
      } else {
        if (filled >= count * d) return;
        filled++;
        audio.sfx('pop', filled % 8);
        if (filled % d === 0) { audio.sfx('full'); ui.sparkle(slot, 10); }
      }
      paint();
      ui.jelly(live.parentNode);
      if (o.onChange) o.onChange(filled);
    });
    paint();
    return {
      get: () => filled,
      lock() { locked = true; el.classList.add('done'); },
      pulseFirst() { const s = slots[0]; ui.pulse(s); setTimeout(() => ui.pulse(s, false), 2600); }
    };
  }

  /* ════════ PACKER ════════ */
  function packer(el, o) {
    const n = o.n, d = o.d, trays = Math.ceil(n / d);
    let packed = 0, busy = false;
    let pile = '';
    for (let k = 0; k < n; k++) {
      pile += '<button class="loose" style="--r:' + (Math.random() * 60 - 30).toFixed(0) + 'deg">' + art.slice(d, { flavor: o.flavor }) + '</button>';
    }
    let tr = '';
    for (let t = 0; t < trays; t++) tr += '<div class="tray">' + art.pie(d, 0, { flavor: o.flavor }) + '<span class="tray-tag"></span></div>';
    el.innerHTML = '<div class="pack">' +
      '<div class="pile-box"><div class="pile-lbl">ชิ้นพาย ' + F.frHTML(1, d) + ' จำนวน <b class="pile-left">' + n + '</b> ชิ้น</div><div class="pile">' + pile + '</div></div>' +
      '<div class="trays">' + tr + '</div></div>';
    const trayEls = Array.from(el.querySelectorAll('.tray'));
    const left = el.querySelector('.pile-left');

    function paint() {
      trayEls.forEach((t, i) => {
        const f = clamp(packed - i * d, 0, d);
        t.querySelectorAll('.sl').forEach((sl, j) => { sl.classList.toggle('on', j < f); sl.classList.toggle('off', j >= f); });
        const full = f === d;
        if (full && !t.classList.contains('full')) {
          t.classList.add('full');
          t.querySelector('.tray-tag').textContent = 'เต็ม 1 ถาด';
          audio.sfx('full');
          ui.sparkle(t, 12);
        }
      });
      left.textContent = n - packed;
    }
    el.querySelector('.pile').addEventListener('click', e => {
      const b = e.target.closest('.loose');
      if (!b || busy || b.classList.contains('gone')) return;
      busy = true;
      const target = trayEls[Math.floor(packed / d)];
      b.classList.add('gone');
      audio.sfx('pack');
      fly(b, target, art.slice(d, { flavor: o.flavor }), () => {
        packed++;
        busy = false;
        paint();
        ui.jelly(target);
        if (packed === n) {
          el.querySelector('.pile-box').classList.add('hidden');
          if (o.onDone) o.onDone(Math.floor(n / d), n % d);
        }
      });
    });
    paint();
    return { pulse() { const f = el.querySelector('.loose'); if (f) { ui.pulse(f); setTimeout(() => ui.pulse(f, false), 2500); } } };
  }

  /* ════════ CUTTER ════════ */
  function cutter(el, o) {
    const w = o.w, n = o.n, d = o.d;
    let cut = 0;
    let html = '<div class="pies cutter">';
    for (let k = 0; k < w; k++) html += '<button class="whole-pie">' + art.pie(1, 1, { flavor: o.flavor }) + '<span class="pie-no">1 ถาดเต็ม</span></button>';
    if (n > 0) html += '<div class="part-pie">' + art.pie(d, n, { flavor: o.flavor }) + '<span class="pie-no">' + F.frHTML(n, d) + ' ถาด</span></div>';
    html += '</div><div class="knife-tip">' + art.icon('knife') + '<span>แตะพายเต็มถาด เพื่อผ่าเป็น ' + d + ' ชิ้นเท่ากัน</span></div>';
    el.innerHTML = html;
    el.querySelectorAll('.whole-pie').forEach(b => {
      b.addEventListener('click', () => {
        if (b.classList.contains('cut')) return;
        b.classList.add('cut');
        b.innerHTML = art.pie(d, d, { flavor: o.flavor, cls: 'just-cut' }) + '<span class="pie-no">' + d + ' ชิ้น</span>';
        audio.sfx('slice');
        setTimeout(() => audio.sfx('slice'), 120);
        ui.puff(b);
        cut++;
        if (cut === w) {
          el.querySelector('.knife-tip').classList.add('hidden');
          if (o.onDone) o.onDone();
        }
      });
    });
    return { pulse() { const f = el.querySelector('.whole-pie:not(.cut)'); if (f) { ui.pulse(f); setTimeout(() => ui.pulse(f, false), 2500); } } };
  }

  /* ════════ SLICE / MERGE MACHINE ════════ */
  const OPS = {
    x2: { k: 2, cut: true }, x3: { k: 3, cut: true }, x4: { k: 4, cut: true },
    d2: { k: 2, cut: false }, d3: { k: 3, cut: false }, d4: { k: 4, cut: false }, d5: { k: 5, cut: false }
  };
  function machine(el, o) {
    let n = o.n, d = o.d, locked = false;
    const start = { n, d };
    const maxD = o.maxD || 24;
    const trail = [];
    const ops = o.ops || ['x2', 'x3', 'd2', 'd3'];
    const cutOps = ops.filter(k => OPS[k].cut), mergeOps = ops.filter(k => !OPS[k].cut);
    const btn = k => '<button class="chip-btn op ' + (OPS[k].cut ? 'op-cut' : 'op-merge') + '" data-op="' + k + '"><b>' + (OPS[k].cut ? '×' : '÷') + OPS[k].k + '</b></button>';
    el.innerHTML = '<div class="machine">' +
      '<div class="mc-view"><div class="mc-pies"></div><div class="mc-eq"><span class="mc-label"></span></div></div>' +
      '<div class="mc-trail"></div>' +
      '<div class="mc-panel">' +
        (cutOps.length ? '<div class="mc-group"><div class="mc-gl">' + art.icon('knife') + 'ตัดชิ้นให้เล็กลง</div><div class="mc-btns">' + cutOps.map(btn).join('') + '</div></div>' : '') +
        (mergeOps.length ? '<div class="mc-group"><div class="mc-gl merge">รวมชิ้นให้ใหญ่ขึ้น</div><div class="mc-btns">' + mergeOps.map(btn).join('') + '</div></div>' : '') +
        '<button class="chip-btn op-reset" title="เริ่มใหม่">' + art.icon('refresh') + '</button>' +
      '</div></div>';
    const piesEl = el.querySelector('.mc-pies'), label = el.querySelector('.mc-label'), trailEl = el.querySelector('.mc-trail');

    function render(anim) {
      piesEl.innerHTML = art.pies(n, d, { flavor: o.flavor, count: Math.max(1, Math.ceil(n / d)) });
      label.innerHTML = F.frHTML(n, d);
      if (anim) { ui.jelly(piesEl); ui.jelly(label); }
      let t = F.frHTML(start.n, start.d);
      trail.slice(-4).forEach((s, i, arr) => {
        if (i === 0 && trail.length > 4) t = '<span class="mc-dots">…</span>';
        t += '<span class="mc-step">' + s.op + '</span>' + F.frHTML(s.n, s.d);
      });
      trailEl.innerHTML = trail.length ? t : '<span class="mc-hint">กดปุ่มด้านล่าง แล้วดูพายเปลี่ยน</span>';
    }
    el.querySelector('.mc-panel').addEventListener('click', e => {
      if (locked) return;
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('op-reset')) {
        n = start.n; d = start.d; trail.length = 0;
        audio.sfx('whoosh');
        render(true);
        if (o.onChange) o.onChange({ n, d });
        return;
      }
      const op = OPS[b.dataset.op];
      const k = op.k;
      if (op.cut) {
        if (d * k > maxD) {
          ui.shake(b);
          audio.sfx('gentle');
          if (o.onInvalid) o.onInvalid('ชิ้นเล็กเกินไปแล้ว ลองกดเริ่มใหม่นะ');
          return;
        }
        n *= k; d *= k;
        audio.sfx('slice');
        trail.push({ op: '×' + k, n, d });
      } else {
        if (n % k || d % k) {
          ui.shake(b);
          ui.shake(piesEl);
          audio.sfx('gentle');
          const bad = d % k ? 'ตัวส่วน ' + d : 'ตัวเศษ ' + n;
          if (o.onInvalid) o.onInvalid('รวมทีละ ' + k + ' ชิ้นไม่พอดี เพราะ' + bad + ' หารด้วย ' + k + ' ไม่ลงตัว');
          return;
        }
        n /= k; d /= k;
        audio.sfx('merge');
        ui.puff(piesEl);
        trail.push({ op: '÷' + k, n, d });
      }
      render(true);
      if (o.onChange) o.onChange({ n, d });
    });
    render(false);
    return {
      get: () => ({ n, d }),
      set(nn, dd, opLabel) {
        n = nn; d = dd;
        if (opLabel) trail.push({ op: opLabel, n, d });
        render(true);
      },
      lock() { locked = true; el.querySelector('.machine').classList.add('locked'); },
      pulse() { const p = el.querySelector('.mc-panel'); ui.pulse(p); setTimeout(() => ui.pulse(p, false), 2800); }
    };
  }

  /* ════════ SCALE (ตาชั่ง) ════════ */
  function scale(el, o) {
    const S = {
      a: Object.assign({}, o.a), b: Object.assign({}, o.b),
      a0: Object.assign({}, o.a), b0: Object.assign({}, o.b),
      shown: !!o.showPies, locked: false
    };
    const tools = side => o.slicers ? '<div class="sc-tools" data-side="' + side + '">' +
      ['x2', 'x3', 'x4'].map(k => '<button class="chip-btn op op-cut mini" data-op="' + k + '"><b>×' + OPS[k].k + '</b></button>').join('') +
      '<button class="chip-btn op-reset mini">' + art.icon('refresh') + '</button></div>' : '';
    el.innerHTML = '<div class="scale-wrap">' +
      '<div class="scale">' +
        '<svg class="sc-pillar" viewBox="0 0 100 120" preserveAspectRatio="xMidYMax meet"><path d="M50 14 L50 100" class="sc-post"/><path d="M18 116 Q50 92 82 116 Z" class="sc-base"/><circle cx="50" cy="14" r="9" class="sc-knob"/></svg>' +
        '<div class="sc-beam"></div>' +
        '<div class="sc-side sc-a">' + (o.whoA ? '<div class="sc-who">' + o.whoA + '</div>' : '') + '<div class="sc-load"></div><div class="sc-dish"></div></div>' +
        '<div class="sc-side sc-b">' + (o.whoB ? '<div class="sc-who">' + o.whoB + '</div>' : '') + '<div class="sc-load"></div><div class="sc-dish"></div></div>' +
      '</div>' +
      '<div class="sc-under">' +
        '<div class="sc-info"><div class="sc-val sc-va"></div>' + tools('a') + '</div>' +
        '<div class="sc-ops">' +
          '<button class="op-sign" data-s="1"><b>&gt;</b><small>มากกว่า</small></button>' +
          '<button class="op-sign" data-s="0"><b>=</b><small>เท่ากับ</small></button>' +
          '<button class="op-sign" data-s="-1"><b>&lt;</b><small>น้อยกว่า</small></button>' +
        '</div>' +
        '<div class="sc-info"><div class="sc-val sc-vb"></div>' + tools('b') + '</div>' +
      '</div></div>';
    const q = s => el.querySelector(s);

    function load(side) {
      const f = S[side];
      const L = q('.sc-' + side + ' .sc-load');
      if (!S.shown) {
        L.innerHTML = '<svg class="cloche" viewBox="0 0 120 80"><path d="M10 72 Q10 12 60 12 Q110 12 110 72 Z"/><circle cx="60" cy="9" r="7"/><path d="M4 72 H116" class="cl-rim"/><path d="M30 50 Q36 26 56 22" class="cl-shine"/></svg>';
      } else {
        L.innerHTML = art.pies(f.n, f.d, { flavor: side === 'a' ? (o.flavorA || 'berry') : (o.flavorB || 'blue'), count: Math.max(1, Math.ceil(f.n / f.d)) });
      }
      const mixed = side === 'a' ? o.amix : o.bmix;
      q('.sc-v' + side).innerHTML = F.html(f, mixed);
    }
    function paintAll() { load('a'); load('b'); }

    el.querySelectorAll('.sc-tools').forEach(t => t.addEventListener('click', e => {
      if (S.locked) return;
      const b = e.target.closest('button');
      if (!b) return;
      const side = t.dataset.side;
      if (b.classList.contains('op-reset')) {
        S[side] = Object.assign({}, S[side + '0']);
        audio.sfx('whoosh');
      } else {
        const k = OPS[b.dataset.op].k;
        if (S[side].d * k > 36) { ui.shake(b); audio.sfx('gentle'); return; }
        S[side] = { n: S[side].n * k, d: S[side].d * k };
        audio.sfx('slice');
      }
      load(side);
      ui.jelly(q('.sc-v' + side));
      if (S.a.d === S.b.d && b.dataset.op) {
        ui.sparkle(q('.sc-under'), 8);
        audio.sfx('hint');
        if (o.onSameDen) o.onSameDen(S.a, S.b);
      }
    }));
    q('.sc-ops').addEventListener('click', e => {
      const b = e.target.closest('.op-sign');
      if (!b || S.locked) return;
      audio.sfx('click');
      if (o.onPick) o.onPick(+b.dataset.s, b);
    });
    paintAll();

    return {
      reveal() {
        if (S.shown) return;
        S.shown = true;
        ui.puff(q('.scale'));
        audio.sfx('puff');
        paintAll();
      },
      tilt(sign) {
        const sc = q('.scale');
        const beam = q('.sc-beam');
        const ang = -sign * 7;
        const half = beam.getBoundingClientRect().width / 2;
        const off = half * Math.sin(7 * Math.PI / 180) * 0.92;
        sc.style.setProperty('--ang', ang + 'deg');
        sc.style.setProperty('--dya', (sign * off) + 'px');
        sc.style.setProperty('--dyb', (-sign * off) + 'px');
        if (sign === 0) { sc.classList.remove('wobble'); void sc.offsetWidth; sc.classList.add('wobble'); }
        audio.sfx('tilt');
      },
      lock() { S.locked = true; el.querySelector('.scale-wrap').classList.add('locked'); },
      markPick(btn, ok) { if (btn) btn.classList.add(ok ? 'right' : 'nope'); if (!ok) setTimeout(() => btn.classList.remove('nope'), 700); },
      pulseTools() { el.querySelectorAll('.sc-tools').forEach(t => { ui.pulse(t); setTimeout(() => ui.pulse(t, false), 2800); }); },
      setForms(a, b) { S.a = a; S.b = b; paintAll(); },
      state: S
    };
  }

  /* ════════ NUMBER LINE (เส้นจำนวนพิสูจน์) ════════ */
  function numberLine(host, o) {
    const max = Math.max(1, o.max || Math.ceil(Math.max.apply(null, o.items.map(it => F.value(it.f)))));
    const pct = v => (4 + v / max * 92).toFixed(2) + '%';
    let h = '<div class="nl"><div class="nl-line"></div>';
    for (let k = 0; k <= max; k++) h += '<div class="nl-tick" style="left:' + pct(k) + '"><span>' + k + '</span></div>';
    const sorted = o.items.map((it, i) => Object.assign({ i }, it)).sort((a, b) => F.value(a.f) - F.value(b.f));
    sorted.forEach((it, j) => {
      h += '<div class="nl-mk ' + (j % 2 ? 'down' : 'up') + '" style="left:' + pct(F.value(it.f)) + ';--i:' + j + '">' +
        '<div class="nl-flag">' + F.html(it.f, it.mixed) + '</div><div class="nl-dot"></div></div>';
    });
    h += '</div>';
    host.innerHTML = h;
  }

  /* ════════ SHELF (เรียงลำดับ) ════════ */
  function shelf(el, o) {
    const items = o.items; // [{f, mixed}]
    const N = items.length;
    const slots = new Array(N).fill(-1);
    let locked = false;
    const asc = o.dir !== 'desc';
    let h = '<div class="shelf-wrap">' +
      '<div class="shelf-dir"><span>' + (asc ? 'น้อยที่สุด' : 'มากที่สุด') + '</span>' + art.icon('right') + '<span>' + (asc ? 'มากที่สุด' : 'น้อยที่สุด') + '</span></div>' +
      '<div class="slots">';
    for (let i = 0; i < N; i++) h += '<div class="slot" data-s="' + i + '"><span class="slot-no">' + (i + 1) + '</span></div>';
    h += '</div><div class="card-tray">';
    items.forEach((it, k) => {
      h += '<button class="fcard" data-k="' + k + '">' + F.html(it.f, it.mixed) +
        (o.pies ? '<span class="fcard-pies">' + art.pies(it.f.n, it.f.d, { cls: 'mini' }) + '</span>' : '') + '</button>';
    });
    h += '</div><div class="nl-host"></div></div>';
    el.innerHTML = h;
    const slotEls = Array.from(el.querySelectorAll('.slot'));
    const tray = el.querySelector('.card-tray');
    const cards = Array.from(el.querySelectorAll('.fcard'));

    function place(card, slotIdx) {
      slots[slotIdx] = +card.dataset.k;
      slotEls[slotIdx].appendChild(card);
      card.classList.add('placed');
    }
    el.addEventListener('click', e => {
      if (locked) return;
      const card = e.target.closest('.fcard');
      if (!card) return;
      const k = +card.dataset.k;
      const at = slots.indexOf(k);
      if (at >= 0) {
        slots[at] = -1;
        tray.appendChild(card);
        card.classList.remove('placed');
        audio.sfx('pop', 0);
      } else {
        const free = slots.indexOf(-1);
        if (free < 0) return;
        place(card, free);
        audio.sfx('pop', free + 2);
      }
      ui.jelly(card);
      el.querySelectorAll('.slot').forEach(s => s.classList.remove('bad'));
      if (o.onChange) o.onChange(slots.indexOf(-1) < 0);
    });

    return {
      full: () => slots.indexOf(-1) < 0,
      check() {
        const bad = [];
        for (let i = 0; i < N - 1; i++) {
          const c = F.cmp(items[slots[i]].f, items[slots[i + 1]].f);
          if (asc ? c > 0 : c < 0) bad.push(i, i + 1);
        }
        bad.forEach(i => slotEls[i].classList.add('bad'));
        return bad.length === 0;
      },
      proof() { numberLine(el.querySelector('.nl-host'), { items, max: o.max }); },
      lock() { locked = true; el.querySelector('.shelf-wrap').classList.add('locked'); },
      solve() {
        const order = items.map((it, k) => k).sort((x, y) => F.cmp(items[x].f, items[y].f) * (asc ? 1 : -1));
        slots.fill(-1);
        order.forEach((k, i) => place(cards[k], i));
      }
    };
  }

  PP.W = { fly, filler, packer, cutter, machine, scale, numberLine, shelf };
})();
