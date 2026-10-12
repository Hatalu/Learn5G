/* ═══════════════════════════════════════════════════════════
   DOTTY GRAND PRIX — Interactive widgets
   builder (เติมแผ่นพลัง) / keypad / choice / numline / slots (ช่องเกียร์หลัก)
   pickDigit / expand (รูปกระจาย) / pickMany / zeroIns (เติมศูนย์) / versus / order
   ทุกชิ้นรองรับทั้งแตะและลาก (touch + mouse)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const DG = window.DG;
  const { D, art, ui, audio } = DG;
  const COL = art.COL, PLACE = D.PLACE;
  const FRAC = ['t1', 't2', 't3'];

  /* ── แตะ = เลือก / ลาก = ย้ายไปวางที่เป้าหมาย ── */
  function dragTap(el, o) {
    el.addEventListener('pointerdown', e => {
      if (e.button > 0 || (o.disabled && o.disabled())) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY;
      let ghost = null, over = null;
      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 9) {
          const r = el.getBoundingClientRect();
          ghost = el.cloneNode(true);
          ghost.classList.add('ghost');
          ghost.style.width = r.width + 'px';
          ghost.style.height = r.height + 'px';
          document.body.appendChild(ghost);
          el.classList.add('dragging');
        }
        if (ghost) {
          ghost.style.left = ev.clientX + 'px';
          ghost.style.top = ev.clientY + 'px';
          const t = document.elementFromPoint(ev.clientX, ev.clientY);
          const tgt = t && t.closest(o.targets);
          if (tgt !== over) { if (over) over.classList.remove('drop-over'); over = tgt; if (over) over.classList.add('drop-over'); }
        }
      };
      const up = ev => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (over) over.classList.remove('drop-over');
        if (ghost) {
          ghost.remove();
          el.classList.remove('dragging');
          const t = document.elementFromPoint(ev.clientX, ev.clientY);
          const tgt = t && t.closest(o.targets);
          if (tgt) o.onDrop(tgt); else audio.sfx('tick');
        } else o.onTap();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }

  /* ══════════ 1) BUILDER : เติมแผ่นพลังตามปริมาณ ══════════ */
  const PIECE = {
    one: { v: '1', name: 'แผ่นเต็ม' },
    t1: { v: '0.1', name: 'แถว' },
    t2: { v: '0.01', name: 'ช่อง' },
    t3: { v: '0.001', name: 'ชิ้นจิ๋ว' }
  };
  const UP = { t3: 't2', t2: 't1', t1: 'one' };
  function builder(host, o) {
    o = o || {};
    const keys = o.keys || ['one', 't1', 't2', 't3'];
    const c = { one: 0, t1: 0, t2: 0, t3: 0 };
    let locked = false;
    host.innerHTML = '<div class="bld">' +
      '<div class="bld-view"></div>' +
      (o.live ? '<div class="bld-live"><span>พลังตอนนี้</span><b></b></div>' : '') +
      '<div class="bld-pads">' + keys.map(k =>
        '<div class="pad" data-k="' + k + '" style="--pc:' + COL[k] + '">' +
          '<div class="pad-top">' + art.piece(k) + '<div><b>' + PIECE[k].v + '</b><small>' + PIECE[k].name + '</small></div></div>' +
          '<div class="pad-row"><button class="pbtn minus" aria-label="เอาออก">' + art.icon('minus') + '</button>' +
          '<output>0</output>' +
          '<button class="pbtn plus" aria-label="เติม">' + art.icon('plus') + '</button></div>' +
        '</div>').join('') + '</div></div>';
    const view = host.querySelector('.bld-view');
    const value = () => c.one * 1000 + c.t1 * 100 + c.t2 * 10 + c.t3;
    function paint(k) {
      view.innerHTML = art.qty(value(), { zoom: keys.indexOf('t3') >= 0, showEmpty: true });
      keys.forEach(kk => { host.querySelector('.pad[data-k="' + kk + '"] output').textContent = c[kk]; });
      if (o.live) host.querySelector('.bld-live b').innerHTML = D.html(D.fromVal(value()), { color: true });
      if (k) ui.jelly(host.querySelector('.pad[data-k="' + k + '"] output'));
      if (o.onChange) o.onChange(value());
    }
    function add(k, dir, btn) {
      if (locked) return;
      if (dir > 0) {
        if (c[k] < 9) { c[k]++; audio.sfx('piece', k); }
        else if (k !== 'one' && c[UP[k]] < 9) {
          c[k] = 0; c[UP[k]]++;
          audio.sfx('regroup');
          ui.toast('ครบ 10 ' + PIECE[k].name + ' = 1 ' + PIECE[UP[k]].name + '! รวมให้แล้ว');
          paint(UP[k]);
          return;
        } else { ui.shake(btn); audio.sfx('gentle'); return; }
      } else {
        if (c[k] > 0) { c[k]--; audio.sfx('tick'); }
        else { ui.shake(btn); return; }
      }
      paint(k);
    }
    host.querySelectorAll('.pad').forEach(p => {
      const k = p.dataset.k;
      p.querySelector('.plus').addEventListener('click', e => add(k, 1, e.currentTarget));
      p.querySelector('.minus').addEventListener('click', e => add(k, -1, e.currentTarget));
    });
    paint();
    return {
      get: value,
      str: () => D.fromVal(value()),
      set(s) { const v = D.val(s); c.one = Math.floor(v / 1000); c.t1 = Math.floor(v / 100) % 10; c.t2 = Math.floor(v / 10) % 10; c.t3 = v % 10; paint(); },
      lock() { locked = true; host.querySelector('.bld').classList.add('locked'); },
      pulse(k, on) { ui.pulse(host.querySelector('.pad[data-k="' + k + '"] .plus'), on); }
    };
  }

  /* ══════════ 2) KEYPAD : แป้นกดเขียนทศนิยม ══════════ */
  let activePad = null;
  document.addEventListener('keydown', e => {
    if (!activePad || !activePad.host.isConnected || document.querySelector('.ov:not(.hidden)')) return;
    if (/^[0-9]$/.test(e.key)) { activePad.press(e.key); e.preventDefault(); }
    else if (e.key === '.' || e.key === ',') { activePad.press('.'); e.preventDefault(); }
    else if (e.key === 'Backspace') { activePad.press('back'); e.preventDefault(); }
    else if (e.key === 'Enter' && activePad.onEnter) { activePad.onEnter(); e.preventDefault(); }
  });
  function keypad(host, o) {
    o = o || {};
    let s = '', locked = false;
    host.innerHTML = '<div class="kp">' +
      '<div class="kp-disp"><span class="kp-val"></span>' + (o.unit ? '<small class="kp-unit">' + o.unit + '</small>' : '') + '</div>' +
      '<div class="kp-keys">' + ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'back'].map((k, i) =>
        '<button class="key' + (k === '.' ? ' k-dot' : k === 'back' ? ' k-back' : '') + '" data-k="' + k + '" data-i="' + i + '" aria-label="' + (k === 'back' ? 'ลบ' : k === '.' ? 'จุดทศนิยม' : k) + '">' +
        (k === 'back' ? art.icon('back') : k === '.' ? '<i class="kdot"></i>' : k) + '</button>').join('') +
      '</div></div>';
    const disp = host.querySelector('.kp-val');
    function paint() {
      disp.innerHTML = s ? D.html(s) : '<span class="kp-ph">?</span>';
      disp.classList.toggle('empty', !s);
    }
    function press(k) {
      if (locked) return;
      const btn = host.querySelector('.key[data-k="' + (k === '.' ? '.' : k) + '"]');
      if (btn) ui.jelly(btn);
      if (k === 'back') { s = s.slice(0, -1); audio.sfx('tick'); paint(); return; }
      if (k === '.') {
        if (s.indexOf('.') >= 0) { ui.shake(disp); audio.sfx('gentle'); return; }
        s = (s || '0') + '.';
      } else {
        const f = s.split('.')[1];
        if (f != null && f.length >= 3) { ui.shake(disp); ui.toast('ทศนิยมในด่านนี้ไม่เกิน 3 ตำแหน่งนะ'); return; }
        if (s.replace('.', '').length >= 6) { ui.shake(disp); return; }
        s = s === '0' ? k : s + k;
      }
      audio.sfx('key', +btn.dataset.i % 6);
      paint();
    }
    host.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
    paint();
    const api = {
      host, press, onEnter: o.onEnter,
      get() { let t = s; if (t.endsWith('.')) t = t.slice(0, -1); return t; },
      raw: () => s,
      set(v) { s = String(v); paint(); },
      clear() { s = ''; paint(); },
      lock() { locked = true; host.querySelector('.kp').classList.add('locked'); if (activePad === api) activePad = null; }
    };
    activePad = api;
    return api;
  }

  /* ══════════ 3) CHOICE : ปุ่มตัวเลือก ══════════ */
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

  /* ══════════ 4) NUMBER LINE : จอดรถบนเส้นจำนวน ══════════ */
  function numline(host, o) {
    const n = o.n || 10;
    const fv = D.val(o.from), sv = D.val(o.step), pl = D.places(o.step);
    const valAt = i => D.fromVal(fv + i * sv, pl);
    const pct = i => 5 + i * 90 / n;
    let idx = o.at != null ? Math.round((D.val(o.at) - fv) / sv) : null, locked = !!o.readOnly;
    let ticks = '', labels = '';
    for (let i = 0; i <= n; i++) {
      const major = i === 0 || i === n;
      ticks += '<i class="nl-tick' + (major ? ' major' : i === n / 2 ? ' mid' : '') + '" data-i="' + i + '" style="left:' + pct(i) + '%"></i>';
      if (major || o.labelAll || (o.labelMid && i === n / 2)) {
        labels += '<span class="nl-lbl' + (major ? ' major' : '') + '" style="left:' + pct(i) + '%">' + D.html(major ? (i === 0 ? o.from : o.to || valAt(i)) : valAt(i)) + '</span>';
      }
    }
    host.innerHTML = '<div class="nl' + (o.readOnly ? ' ro' : '') + '"><div class="nl-sky"></div>' +
      '<div class="nl-track"><div class="nl-road"></div>' + ticks +
      '<div class="nl-car">' + (o.readOnly ? '<span class="nl-pin">' + art.icon('flag') + '</span>' : '') + art.carMini() + '</div></div>' +
      '<div class="nl-labels">' + labels + '</div>' + (o.unit ? '<div class="nl-unit">หน่วย: ' + o.unit + '</div>' : '') + '</div>';
    const track = host.querySelector('.nl-track'), car = host.querySelector('.nl-car');
    function paint() {
      if (idx == null) { car.style.left = '0%'; car.classList.add('idle'); return; }
      car.classList.remove('idle');
      car.style.left = pct(idx) + '%';
      host.querySelectorAll('.nl-tick').forEach(t => t.classList.toggle('on', +t.dataset.i === idx));
    }
    function fromX(x) {
      const r = track.getBoundingClientRect();
      const p = (x - r.left) / r.width * 100;
      return Math.max(0, Math.min(n, Math.round((p - 5) / 90 * n)));
    }
    let dragging = false;
    track.addEventListener('pointerdown', e => {
      if (locked) return;
      e.preventDefault();
      dragging = true;
      track.setPointerCapture && track.setPointerCapture(e.pointerId);
      const i = fromX(e.clientX);
      if (i !== idx) { idx = i; audio.sfx('tick'); paint(); }
    });
    track.addEventListener('pointermove', e => {
      if (!dragging || locked) return;
      const i = fromX(e.clientX);
      if (i !== idx) { idx = i; audio.sfx('tick'); paint(); if (o.onMove) o.onMove(valAt(i)); }
    });
    const end = () => { if (dragging) { dragging = false; audio.sfx('skid'); } };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    paint();
    return {
      get: () => idx == null ? null : valAt(idx),
      set(v) { idx = Math.round((D.val(v) - fv) / sv); paint(); },
      lock() { locked = true; host.querySelector('.nl').classList.add('locked'); },
      flashTick(v) {
        const i = Math.round((D.val(v) - fv) / sv);
        const t = host.querySelector('.nl-tick[data-i="' + i + '"]');
        if (t) ui.restart(t, 'flash');
      },
      steps: v => Math.round((D.val(v) - fv) / sv)
    };
  }

  /* ══════════ 5) SLOTS : ช่องเกียร์ตามหลัก ══════════ */
  function slots(host, o) {
    const keys = o.keys;
    const fill = {};
    let sel = null, locked = false;
    host.innerHTML = '<div class="pv"><div class="pv-board">' + keys.map(k =>
      '<div class="pv-col" data-k="' + k + '" style="--pc:' + COL[k] + '">' +
        '<div class="pv-head">' + PLACE[k].short + '</div>' +
        (o.hideVal ? '' : '<div class="pv-val">' + PLACE[k].value + '</div>') +
        '<button class="pv-slot" data-k="' + k + '" aria-label="' + PLACE[k].name + '"></button></div>' +
      (k === 'one' && keys.indexOf('t1') >= 0 ? '<div class="pv-dot"><i></i></div>' : '')).join('') +
      '</div><div class="pv-tray">' + o.chips.map((d, i) => '<button class="chip pv-chip" data-i="' + i + '">' + d + '</button>').join('') + '</div></div>';
    const chips = Array.from(host.querySelectorAll('.pv-chip'));
    const slotEl = k => host.querySelector('.pv-slot[data-k="' + k + '"]');
    function select(i) {
      sel = sel === i ? null : i;
      chips.forEach((c, j) => c.classList.toggle('sel', j === sel));
      audio.sfx('pop', 1);
      host.querySelector('.pv').classList.toggle('picking', sel != null);
    }
    function place(i, k) {
      if (fill[k] != null) unplace(k, true);
      Object.keys(fill).forEach(kk => { if (fill[kk] === i) unplace(kk, true); });
      fill[k] = i;
      chips[i].classList.add('used');
      chips[i].classList.remove('sel');
      const s = slotEl(k);
      s.textContent = o.chips[i];
      s.classList.add('filled');
      ui.jelly(s);
      audio.sfx('snap');
      sel = null;
      host.querySelector('.pv').classList.remove('picking');
      if (o.onChange) o.onChange();
    }
    function unplace(k, quiet) {
      const i = fill[k];
      if (i == null) return;
      delete fill[k];
      chips[i].classList.remove('used');
      const s = slotEl(k);
      s.textContent = '';
      s.classList.remove('filled');
      if (!quiet) { audio.sfx('tick'); if (o.onChange) o.onChange(); }
    }
    chips.forEach((c, i) => dragTap(c, {
      targets: '.pv-slot',
      disabled: () => locked || c.classList.contains('used'),
      onTap: () => select(i),
      onDrop: t => place(i, t.dataset.k)
    }));
    keys.forEach(k => slotEl(k).addEventListener('click', () => {
      if (locked) return;
      if (sel != null) place(sel, k);
      else if (fill[k] != null) unplace(k);
      else { ui.shake(slotEl(k)); audio.sfx('tick'); }
    }));
    return {
      get() { const r = {}; keys.forEach(k => { r[k] = fill[k] != null ? o.chips[fill[k]] : null; }); return r; },
      full: () => keys.every(k => fill[k] != null),
      str() {
        const g = this.get();
        let i = '', f = '';
        keys.forEach(k => { if (FRAC.indexOf(k) >= 0) f += g[k] || '_'; else i += g[k] || '_'; });
        return f ? (i || '0') + '.' + f : i;
      },
      solve(map) {
        keys.forEach(k => unplace(k, true));
        keys.forEach(k => {
          const i = o.chips.findIndex((d, j) => d === map[k] && !Object.values(fill).includes(j));
          if (i >= 0) place(i, k);
        });
      },
      mark(k, cls) { const s = slotEl(k); s.classList.add(cls); setTimeout(() => s.classList.remove(cls), 1600); },
      lock() { locked = true; host.querySelector('.pv').classList.add('locked'); }
    };
  }

  /* ══════════ 6) PICK DIGIT : แตะเลขโดด ══════════ */
  function pickDigit(host, o) {
    const ds = D.digits(o.num);
    let h = '<div class="pd">';
    ds.forEach((x, i) => {
      if (x.k === 't1') h += '<i class="pd-dot"></i>';
      h += '<button class="pd-d k-' + x.k + '" data-i="' + i + '" data-k="' + x.k + '">' + x.d + '</button>';
    });
    host.innerHTML = h + '</div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.pd-d'));
    btns.forEach(b => b.addEventListener('click', () => { if (!locked) o.onPick(b.dataset.k, b); }));
    return {
      lock() { locked = true; host.querySelector('.pd').classList.add('locked'); },
      mark(k, cls) { btns.forEach(b => { if (b.dataset.k === k) b.classList.add(cls); }); },
      colorAll() { host.querySelector('.pd').classList.add('colored'); }
    };
  }

  /* ══════════ 7) EXPAND : เขียนรูปกระจาย ══════════ */
  function expand(host, o) {
    const n = o.count;
    const fill = new Array(n).fill(null);
    let locked = false;
    let eq = '<div class="ex-eq"><span class="ex-num">' + D.html(o.num, { color: !!o.color }) + '</span><b class="ex-op">=</b>';
    for (let i = 0; i < n; i++) eq += (i ? '<b class="ex-op">+</b>' : '') + '<button class="ex-slot" data-s="' + i + '"></button>';
    eq += '</div>';
    host.innerHTML = '<div class="ex">' + eq + '<div class="ex-tray">' + o.chips.map((c, i) =>
      '<button class="chip ex-chip" data-i="' + i + '">' + D.html(c) + '</button>').join('') + '</div></div>';
    const chips = Array.from(host.querySelectorAll('.ex-chip'));
    const slotsEl = Array.from(host.querySelectorAll('.ex-slot'));
    function put(ci, si) {
      if (si == null) si = fill.indexOf(null);
      if (si < 0) { ui.shake(host.querySelector('.ex-eq')); audio.sfx('gentle'); return; }
      if (fill[si] != null) take(si, true);
      fill[si] = ci;
      chips[ci].classList.add('used');
      slotsEl[si].innerHTML = D.html(o.chips[ci]);
      slotsEl[si].classList.add('filled');
      ui.jelly(slotsEl[si]);
      audio.sfx('snap');
    }
    function take(si, quiet) {
      const ci = fill[si];
      if (ci == null) return;
      fill[si] = null;
      chips[ci].classList.remove('used');
      slotsEl[si].innerHTML = '';
      slotsEl[si].classList.remove('filled');
      if (!quiet) audio.sfx('tick');
    }
    chips.forEach((c, i) => dragTap(c, {
      targets: '.ex-slot',
      disabled: () => locked || c.classList.contains('used'),
      onTap: () => put(i),
      onDrop: t => put(i, +t.dataset.s)
    }));
    slotsEl.forEach((s, i) => s.addEventListener('click', () => { if (!locked) take(i); }));
    return {
      get: () => fill.map(ci => ci == null ? null : o.chips[ci]),
      solve(parts) {
        for (let i = 0; i < n; i++) take(i, true);
        parts.forEach((p, i) => { const ci = o.chips.findIndex((c, j) => c === p && !fill.includes(j)); if (ci >= 0) put(ci, i); });
      },
      lock() { locked = true; host.querySelector('.ex').classList.add('locked'); }
    };
  }

  /* ══════════ 8) PICK MANY : เลือกหลายใบ ══════════ */
  function pickMany(host, o) {
    host.innerHTML = '<div class="pm ' + (o.cls || '') + '">' + o.cards.map((c, i) =>
      '<button class="pm-card" data-i="' + i + '"><span class="pm-light"></span>' + c.html + '</button>').join('') + '</div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.pm-card'));
    btns.forEach(b => b.addEventListener('click', () => {
      if (locked) return;
      b.classList.toggle('on');
      audio.sfx(b.classList.contains('on') ? 'pop' : 'tick', 3);
    }));
    return {
      get: () => btns.filter(b => b.classList.contains('on')).map(b => o.cards[+b.dataset.i].value),
      set(vals) { btns.forEach((b, i) => b.classList.toggle('on', vals.indexOf(o.cards[i].value) >= 0)); },
      mark(fn) { btns.forEach((b, i) => { const r = fn(o.cards[i].value, b.classList.contains('on')); if (r) { b.classList.add(r); setTimeout(() => b.classList.remove(r), 1800); } }); },
      lock() { locked = true; host.querySelector('.pm').classList.add('locked'); }
    };
  }

  /* ══════════ 9) ZERO INSERT : เครื่องเติมศูนย์ ══════════ */
  function zeroIns(host, o) {
    let cur = o.start;
    const hist = [];
    let locked = false;
    host.innerHTML = '<div class="zi"><div class="zi-num"></div>' +
      '<div class="zi-tools"><button class="btn btn-soft zi-undo">' + art.icon('refresh') + '<span>ย้อนกลับ</span></button></div>' +
      '<div class="zi-cmp"></div></div>';
    const numEl = host.querySelector('.zi-num');
    function paint() {
      const p = D.parts(cur);
      const L = p.f.length;
      let h = '<span class="num big">';
      String(+p.i).split('').forEach(d => { h += '<i class="dg">' + d + '</i>'; });
      if (!p.f) {
        h += L < 3 ? '<button class="zi-ins end" data-p="w" aria-label="เติมจุดและศูนย์">+.0</button>' : '';
      } else {
        h += '<i class="dp"></i>';
        for (let k = 0; k <= L; k++) {
          if (L < 3) h += '<button class="zi-ins' + (k === L ? ' end' : '') + '" data-p="' + k + '" aria-label="เติมศูนย์">+0</button>';
          if (k < L) h += '<i class="dg' + (hist.length && p.f[k] === '0' ? ' zero' : '') + '">' + p.f[k] + '</i>';
        }
      }
      numEl.innerHTML = h + '</span>';
      numEl.querySelectorAll('.zi-ins').forEach(b => b.addEventListener('click', () => insert(b.dataset.p)));
      if (o.compare !== false) {
        const same = D.val(cur) === D.val(o.start);
        host.querySelector('.zi-cmp').innerHTML =
          '<div class="zc"><small>ก่อนเติม</small>' + D.html(o.start) + art.qty(D.val(o.start), { cls: 'mini' }) + '</div>' +
          '<b class="zi-sign ' + (same ? 'eq' : 'ne') + '">' + (same ? '=' : '&ne;') + '</b>' +
          '<div class="zc"><small>หลังเติม</small>' + D.html(cur) + art.qty(D.val(cur), { cls: 'mini' }) + '</div>';
      }
      host.querySelector('.zi-undo').disabled = !hist.length;
    }
    function insert(p) {
      if (locked) return;
      hist.push(cur);
      const P = D.parts(cur);
      if (p === 'w') cur = String(+P.i) + '.0';
      else { const k = +p; cur = String(+P.i) + '.' + P.f.slice(0, k) + '0' + P.f.slice(k); }
      audio.sfx('pop', 4);
      paint();
      ui.jelly(numEl);
      if (o.onChange) o.onChange(cur);
    }
    host.querySelector('.zi-undo').addEventListener('click', () => {
      if (locked || !hist.length) return;
      cur = hist.pop();
      audio.sfx('tick');
      paint();
    });
    paint();
    return {
      get: () => cur,
      set(v) { cur = v; paint(); },
      lock() { locked = true; host.querySelector('.zi').classList.add('locked'); }
    };
  }

  /* ══════════ 10) ALIGN BOARD : ตั้งจุดให้ตรงแล้วเทียบทีละหลัก ══════════ */
  function alignKeys(nums) {
    const maxI = Math.max.apply(null, nums.map(n => String(+D.parts(n).i).length));
    const maxF = Math.max.apply(null, nums.map(D.places));
    return D.ORDER.slice(3 - maxI, 3).concat(FRAC.slice(0, maxF));
  }
  function alignBoard(nums, o) {
    o = o || {};
    const keys = alignKeys(nums);
    let h = '<table class="align"><thead><tr>' + (o.names ? '<th></th>' : '');
    keys.forEach(k => {
      h += '<th data-k="' + k + '" style="color:' + COL[k] + '">' + PLACE[k].short + '</th>';
      if (k === 'one' && keys.indexOf('t1') >= 0) h += '<th class="al-dotc"></th>';
    });
    h += '</tr></thead><tbody>';
    nums.forEach((n, r) => {
      h += '<tr>' + (o.names ? '<td class="al-name">' + o.names[r] + '</td>' : '');
      keys.forEach(k => {
        const d = D.digitAt(n, k);
        const ghost = d == null && FRAC.indexOf(k) >= 0;
        h += '<td data-k="' + k + '" class="' + (ghost ? 'ghost' : '') + '">' + (d != null ? d : ghost ? '0' : '') + '</td>';
        if (k === 'one' && keys.indexOf('t1') >= 0) h += '<td class="al-dotc"><i></i></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  /* ไฮไลต์ทีละหลักจากซ้าย จนเจอหลักแรกที่ต่างกัน → คืนค่า key ของหลักนั้น (หรือ null ถ้าเท่ากัน) */
  function firstDiff(a, b) {
    const keys = alignKeys([a, b]);
    for (const k of keys) {
      const x = +(D.digitAt(a, k) || 0), y = +(D.digitAt(b, k) || 0);
      if (x !== y) return k;
    }
    return null;
  }
  function animateAlign(el, a, b) {
    const keys = alignKeys([a, b]);
    const diff = firstDiff(a, b);
    const stop = diff ? keys.indexOf(diff) : keys.length - 1;
    keys.forEach((k, i) => {
      if (i > stop) return;
      setTimeout(() => {
        el.querySelectorAll('[data-k="' + k + '"]').forEach(c => c.classList.add(k === diff ? 'diff' : 'same'));
        audio.sfx(k === diff ? 'pop' : 'tick', 5);
      }, 350 + i * 420);
    });
    return diff;
  }

  /* ══════════ 11) VERSUS : เทียบ 2 จำนวน ══════════ */
  function versus(host, o) {
    host.innerHTML = '<div class="vs">' +
      '<div class="vs-side a"><div class="vs-car">' + art.carMini('#ff5a4e') + '</div><div class="vs-name">' + (o.nameA || 'ดอตตี้') + '</div>' +
        '<div class="vs-num">' + D.html(o.a) + '</div>' + (o.unit ? '<small>' + o.unit + '</small>' : '') + '</div>' +
      '<div class="vs-mid">' + ['>', '=', '<'].map(s => '<button class="opt vs-op" data-s="' + s + '" aria-label="' + D.relWord(s === '>' ? 1 : s === '<' ? -1 : 0) + '">' + (s === '>' ? '&gt;' : s === '<' ? '&lt;' : '=') + '</button>').join('') + '</div>' +
      '<div class="vs-side b"><div class="vs-car flip">' + art.carMini(o.colorB || '#3ba8ff') + '</div><div class="vs-name">' + (o.nameB || 'คู่แข่ง') + '</div>' +
        '<div class="vs-num">' + D.html(o.b) + '</div>' + (o.unit ? '<small>' + o.unit + '</small>' : '') + '</div>' +
      '</div><div class="vs-proof"></div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.vs-op'));
    btns.forEach(b => b.addEventListener('click', () => { if (!locked) o.onPick(b.dataset.s, b); }));
    return {
      btns,
      proof(animate) {
        const p = host.querySelector('.vs-proof');
        p.innerHTML = alignBoard([o.a, o.b], { names: [o.nameA || 'ดอตตี้', o.nameB || 'คู่แข่ง'] });
        p.classList.add('show');
        return animate === false ? firstDiff(o.a, o.b) : animateAlign(p, o.a, o.b);
      },
      lock() { locked = true; host.querySelector('.vs').classList.add('locked'); },
      mark(s, cls) { btns.forEach(b => { if (b.dataset.s === s) b.classList.add(cls); }); }
    };
  }

  /* ══════════ 12) ORDER : เรียงลำดับขึ้นโพเดียม/กริดสตาร์ต ══════════ */
  function order(host, o) {
    const n = o.items.length;
    const fill = new Array(n).fill(null);
    let locked = false;
    host.innerHTML = '<div class="od">' +
      '<div class="od-ends"><span>' + (o.leftLabel || '') + '</span><span>' + (o.rightLabel || '') + '</span></div>' +
      '<div class="od-slots">' + o.labels.map((l, i) =>
        '<div class="od-slot-wrap"><button class="od-slot" data-s="' + i + '"></button><span class="od-lbl">' + l + '</span></div>').join('') + '</div>' +
      '<div class="od-tray">' + o.items.map((s, i) =>
        '<button class="chip od-card" data-i="' + i + '">' + (o.cardHTML ? o.cardHTML(s, i) : D.html(s)) + '</button>').join('') + '</div></div>';
    const cards = Array.from(host.querySelectorAll('.od-card'));
    const slotsEl = Array.from(host.querySelectorAll('.od-slot'));
    function put(ci, si) {
      const cur = fill.indexOf(ci);
      if (cur >= 0) take(cur, true);
      if (si == null) si = fill.indexOf(null);
      if (si < 0) return;
      if (fill[si] != null) take(si, true);
      fill[si] = ci;
      cards[ci].classList.add('used');
      slotsEl[si].innerHTML = o.cardHTML ? o.cardHTML(o.items[ci], ci) : D.html(o.items[ci]);
      slotsEl[si].classList.add('filled');
      ui.jelly(slotsEl[si]);
      audio.sfx('snap');
    }
    function take(si, quiet) {
      const ci = fill[si];
      if (ci == null) return;
      fill[si] = null;
      cards[ci].classList.remove('used');
      slotsEl[si].innerHTML = '';
      slotsEl[si].classList.remove('filled');
      if (!quiet) audio.sfx('tick');
    }
    cards.forEach((c, i) => dragTap(c, {
      targets: '.od-slot',
      disabled: () => locked || c.classList.contains('used'),
      onTap: () => put(i),
      onDrop: t => put(i, +t.dataset.s)
    }));
    slotsEl.forEach((s, i) => s.addEventListener('click', () => { if (!locked) take(i); }));
    return {
      get: () => fill.map(ci => ci == null ? null : o.items[ci]),
      solve(sorted) {
        for (let i = 0; i < n; i++) take(i, true);
        const used = [];
        sorted.forEach((s, si) => { const ci = o.items.findIndex((x, j) => x === s && used.indexOf(j) < 0); used.push(ci); put(ci, si); });
      },
      mark(si, cls) { slotsEl[si].classList.add(cls); setTimeout(() => slotsEl[si].classList.remove(cls), 1800); },
      lock() { locked = true; host.querySelector('.od').classList.add('locked'); }
    };
  }

  /* ── หลักฐานภาพ: แผ่นพลังสองจำนวนเทียบกัน ── */
  function gridPair(a, b, o) {
    o = o || {};
    const c = D.cmp(a, b);
    const sign = c === 0 ? '=' : o.ne ? '&ne;' : (c > 0 ? '&gt;' : '&lt;');
    return '<div class="gpair"><div class="gp">' + D.html(a, { color: true }) + art.qty(D.val(a), { cls: 'mini', zoom: o.zoom }) + '</div>' +
      '<b class="gp-sign ' + (c === 0 ? 'eq' : 'ne') + '">' + sign + '</b>' +
      '<div class="gp">' + D.html(b, { color: true }) + art.qty(D.val(b), { cls: 'mini', zoom: o.zoom }) + '</div></div>';
  }

  DG.W = { dragTap, builder, keypad, choice, numline, slots, pickDigit, expand, pickMany, zeroIns, alignBoard, firstDiff, animateAlign, versus, order, gridPair, PIECE };
})();
