/* ═══════════════════════════════════════════════════════════
   CUCKOO CLOCK TOWER — Interactive widgets
   keypad (แป้นตัวเลข + นาฬิกาสด) / choice / scale (ตาชั่งระยะเวลา) / order
   pickMany / sortBuckets / calendar / board (ตารางเวลา) / planner (จัดตารางวัน)
   ทุกชิ้นรองรับทั้งแตะและลาก (touch + mouse)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CT = window.CT;
  const { T, art, ui, audio } = CT;
  const UC = k => T.UNITS[k].col;

  /* หน่วยเวลา → ข้อความมีสี  [{u,n}] → HTML */
  const tok = parts => T.clean(parts).map(p => '{' + p.u + ':' + p.n + '}').join('');
  const durHTML = parts => ui.rich(tok(parts), true);

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

  /* ══════════ 1) KEYPAD : แป้นกดตัวเลข 1-2 ช่อง (+ นาฬิกาสดที่เข็มขยับตามที่กด) ══════════ */
  let activePad = null;
  document.addEventListener('keydown', e => {
    if (!activePad || !activePad.host.isConnected || document.querySelector('.ov:not(.hidden)')) return;
    if (/^[0-9]$/.test(e.key)) { activePad.press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { activePad.press('back'); e.preventDefault(); }
    else if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') && activePad.nf > 1) { activePad.press('next'); e.preventDefault(); }
    else if (e.key === 'Enter' && activePad.onEnter) { activePad.onEnter(); e.preventDefault(); }
  });
  /* o = {fields:[{unit, label, max, pad}], clock, autoNext, onEnter, onChange} */
  function keypad(host, o) {
    o = o || {};
    const F = o.fields && o.fields.length ? o.fields : [{ max: 5 }];
    const nf = F.length;
    const vals = F.map(() => '');
    let act = 0, locked = false;
    const keyList = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'back', '0', nf > 1 ? 'next' : 'clear'];
    host.innerHTML = '<div class="kp' + (o.clock ? ' with-clock' : '') + '">' +
      '<div class="kp-head">' + (o.clock ? '<div class="kp-clk">' + art.clock(12, 0, { cls: 'dim' }) + '</div>' : '') +
      '<div class="kp-plates">' + F.map((f, i) =>
        '<button class="plate' + (i === 0 ? ' active' : '') + '" data-i="' + i + '" style="--uc:' + (f.unit ? UC(f.unit) : '#7c5cff') + '">' +
        '<span class="pl-val"></span><small class="pl-unit">' + (f.label || (f.unit ? T.UNITS[f.unit].name : '')) + '</small></button>').join('') + '</div></div>' +
      '<div class="kp-keys">' + keyList.map((k, i) =>
        '<button class="key' + (k === 'back' ? ' k-back' : k === 'next' ? ' k-next' : k === 'clear' ? ' k-clear' : '') + '" data-k="' + k + '" data-i="' + i + '" aria-label="' +
        (k === 'back' ? 'ลบ' : k === 'next' ? 'ช่องถัดไป' : k === 'clear' ? 'ล้าง' : k) + '">' +
        (k === 'back' ? art.icon('back') : k === 'next' ? art.icon('right') : k === 'clear' ? art.icon('refresh') : k) + '</button>').join('') + '</div></div>';
    const plates = Array.from(host.querySelectorAll('.plate'));
    const ck = host.querySelector('.ck');
    function paintClock() {
      if (!ck) return;
      const h = vals[0] === '' ? 12 : (+vals[0]) % 12, m = nf > 1 && vals[1] !== '' ? Math.min(59, +vals[1]) : 0;
      ck.querySelector('.ck-h').style.transform = 'rotate(' + ((h + m / 60) * 30) + 'deg)';
      ck.querySelector('.ck-m').style.transform = 'rotate(' + (m * 6) + 'deg)';
      ck.classList.toggle('dim', vals[0] === '');
    }
    function paint() {
      plates.forEach((p, i) => {
        const v = vals[i];
        p.querySelector('.pl-val').textContent = v === '' ? '?' : v;
        p.classList.toggle('empty', v === '');
        p.classList.toggle('active', i === act && !locked);
      });
      paintClock();
      if (o.onChange) o.onChange(api.get());
    }
    function press(k) {
      if (locked) return;
      const btn = host.querySelector('.key[data-k="' + k + '"]');
      if (btn) ui.jelly(btn);
      if (k === 'back') {
        if (vals[act]) vals[act] = vals[act].slice(0, -1);
        else if (act > 0) { act--; vals[act] = vals[act].slice(0, -1); }
        audio.sfx('tick'); paint(); return;
      }
      if (k === 'next') { act = (act + 1) % nf; audio.sfx('tick'); paint(); return; }
      if (k === 'clear') { vals.fill(''); act = 0; audio.sfx('tick'); paint(); return; }
      const max = F[act].max || 4;
      if (vals[act].length >= max) {
        if (act < nf - 1) { act++; if (vals[act].length >= (F[act].max || 4)) vals[act] = ''; }
        else { ui.shake(plates[act]); audio.sfx('gentle'); return; }
      }
      const f = F[act];
      vals[act] = (vals[act] === '0' && !f.pad) ? k : vals[act] + k;
      audio.sfx('key', +(btn && btn.dataset.i) % 6);
      if (o.autoNext && vals[act].length >= (f.max || 4) && act < nf - 1) act++;
      paint();
    }
    host.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
    plates.forEach((p, i) => p.addEventListener('click', () => { if (locked) return; act = i; audio.sfx('tick'); paint(); }));
    const api = {
      host, nf, press, onEnter: o.onEnter,
      get() { return vals.map(v => v === '' ? null : +v); },
      empty() { return vals.every(v => v === ''); },
      filled() { return vals.every(v => v !== ''); },
      set(arr) { arr.forEach((v, i) => { vals[i] = String(v); }); paint(); },
      clear() { vals.fill(''); act = 0; paint(); },
      lock() { locked = true; host.querySelector('.kp').classList.add('locked'); plates.forEach(p => p.classList.remove('active')); if (activePad === api) activePad = null; },
      shakeAll() { plates.forEach(p => ui.shake(p)); }
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

  /* ══════════ 3) SCALE : ตาชั่งระยะเวลา (เทียบ > = <) ══════════ */
  const ORDER_SEC = ['sec', 'min', 'hr', 'day', 'wk'], ORDER_MO = ['mo', 'yr'];
  function smallestUnit(parts) {
    const k = T.kindOf(parts[0].u), order = k === 'mo' ? ORDER_MO : ORDER_SEC;
    let best = order.length;
    parts.forEach(p => { best = Math.min(best, order.indexOf(p.u)); });
    return order[best];
  }
  const unitBase = u => T.kindOf(u) === 'mo' ? T.MOS[u] : T.SECS[u];
  function valIn(parts, u) { return T.inBase(parts) / unitBase(u); }
  function scaleCompare(host, o) {
    const side = (parts, c) => '<div class="scl-card ' + c + '">' + durHTML(parts) + '</div>';
    host.innerHTML = '<div class="scl"><div class="scl-bal">' +
      '<div class="scl-post"></div>' +
      '<div class="scl-beam idle"><span class="scl-pivot"></span>' +
        '<div class="scl-end l"><div class="scl-hang"><i class="scl-rope"></i><div class="scl-pan">' + side(o.a, 'a') + '</div></div></div>' +
        '<div class="scl-end r"><div class="scl-hang"><i class="scl-rope"></i><div class="scl-pan">' + side(o.b, 'b') + '</div></div></div>' +
      '</div><div class="scl-base"></div></div>' +
      '<div class="scl-help hidden"></div>' +
      '<div class="scl-ops">' +
        [[1, '&gt;', 'มากกว่า'], [0, '=', 'เท่ากัน'], [-1, '&lt;', 'น้อยกว่า']].map(op =>
          '<button class="btn op-btn" data-s="' + op[0] + '" aria-label="' + op[2] + '"><b>' + op[1] + '</b></button>').join('') +
      '</div></div>';
    const beam = host.querySelector('.scl-beam');
    const ends = Array.from(host.querySelectorAll('.scl-end'));
    let locked = false;
    host.querySelectorAll('.op-btn').forEach(b => b.addEventListener('click', () => {
      if (locked) return;
      o.onPick(+b.dataset.s, b);
    }));
    function setTilt(c) {
      beam.classList.remove('idle');
      const deg = -c * 11;
      beam.style.transform = 'rotate(' + deg + 'deg)';
      ends.forEach(e => { e.style.transform = 'rotate(' + (-deg) + 'deg)'; });
    }
    function helper(on) {
      const el = host.querySelector('.scl-help');
      if (!on) { el.classList.add('hidden'); return; }
      const u = smallestUnit(o.a.concat(o.b));
      const va = valIn(o.a, u), vb = valIn(o.b, u), mx = Math.max(va, vb);
      el.innerHTML = '<div class="hlp-title">เทียบเป็น ' + ui.rich('{u:' + u + '}', true) + ' เหมือนกัน</div>' +
        [[o.a, va, 'a'], [o.b, vb, 'b']].map(r =>
          '<div class="hlp-row ' + r[2] + '"><span class="hlp-t">' + durHTML(r[0]) + '</span><b>=</b><span class="hlp-v">' + durHTML([{ u, n: r[1] }]) + '</span>' +
          '<div class="hlp-bar"><i style="width:' + Math.max(6, r[1] / mx * 100) + '%;background:' + UC(u) + '"></i></div></div>').join('');
      el.classList.remove('hidden');
    }
    return {
      setTilt, helper,
      lock() { locked = true; host.querySelector('.scl').classList.add('locked'); },
      mark(s, cls) { host.querySelectorAll('.op-btn').forEach(b => { if (+b.dataset.s === s) b.classList.add(cls); }); },
      dim(b) { b.disabled = true; b.classList.add('dim'); }
    };
  }

  /* ══════════ 4) ORDER : เรียงลำดับระยะเวลา (แตะหรือลากใส่ช่อง) ══════════ */
  function order(host, o) {
    const items = o.items, n = items.length;
    const slots = new Array(n).fill(null);
    host.innerHTML = '<div class="od">' +
      (o.ends ? '<div class="od-ends"><span>' + o.ends[0] + '</span><span>' + o.ends[1] + '</span></div>' : '') +
      '<div class="od-slots">' + items.map((_, i) =>
        '<div class="od-slot-wrap"><button class="od-slot" data-i="' + i + '" aria-label="ช่องที่ ' + (i + 1) + '"></button><div class="od-lbl">' + (o.labels ? o.labels[i] : 'อันดับ ' + (i + 1)) + '</div></div>').join('') + '</div>' +
      '<div class="od-tray">' + items.map(it => '<button class="chip od-card" data-id="' + it.id + '">' + it.html + '</button>').join('') + '</div></div>';
    const slotEls = Array.from(host.querySelectorAll('.od-slot'));
    const cardEl = id => host.querySelector('.od-card[data-id="' + id + '"]');
    const htmlOf = id => items.find(x => x.id === id).html;
    let locked = false;
    function paint() {
      slotEls.forEach((s, i) => {
        const id = slots[i];
        s.classList.toggle('filled', !!id);
        s.innerHTML = id ? htmlOf(id) : '<span class="od-ph">' + (i + 1) + '</span>';
      });
      host.querySelectorAll('.od-card').forEach(c => c.classList.toggle('used', slots.indexOf(c.dataset.id) >= 0));
      if (o.onChange) o.onChange();
    }
    function place(id, i) {
      if (locked) return;
      const from = slots.indexOf(id);
      if (from >= 0) slots[from] = null;
      if (i == null) i = slots.indexOf(null);
      if (i < 0) { audio.sfx('gentle'); return; }
      slots[i] = id;                       /* ช่องที่ถูกแทนที่จะกลับไปที่ถาด */
      audio.sfx('pop', i);
      paint();
    }
    host.querySelectorAll('.od-card').forEach(c => dragTap(c, {
      targets: '.od-slot',
      disabled: () => locked || c.classList.contains('used'),
      onTap: () => place(c.dataset.id),
      onDrop: t => place(c.dataset.id, +t.dataset.i)
    }));
    slotEls.forEach((s, i) => s.addEventListener('click', () => {
      if (locked || !slots[i]) return;
      slots[i] = null; audio.sfx('tick'); paint();
    }));
    paint();
    return {
      get: () => slots.slice(),
      filled: () => slots.every(Boolean),
      set(ids) { ids.forEach((id, i) => { slots[i] = id; }); paint(); },
      lock() { locked = true; host.querySelector('.od').classList.add('locked'); },
      bad(i) { ui.restart(slotEls[i], 'bad'); },
      clearBad() { slotEls.forEach(s => s.classList.remove('bad')); }
    };
  }

  /* ══════════ 5) PICK MANY : เลือกได้หลายอัน (แตะสลับ) ══════════ */
  function pickMany(host, o) {
    host.innerHTML = '<div class="pm ' + (o.cls || '') + '">' + o.items.map(it =>
      '<button class="pm-card" data-id="' + it.id + '"><i class="pm-light"></i><span class="pm-body">' + it.html + '</span></button>').join('') + '</div>';
    const cards = Array.from(host.querySelectorAll('.pm-card'));
    let locked = false;
    cards.forEach(c => c.addEventListener('click', () => {
      if (locked) return;
      c.classList.toggle('on');
      c.classList.remove('bad');
      audio.sfx('pop', c.classList.contains('on') ? 3 : 0);
      if (o.onChange) o.onChange();
    }));
    const byId = id => cards.find(c => c.dataset.id === id);
    return {
      get: () => cards.filter(c => c.classList.contains('on')).map(c => c.dataset.id).sort(),
      set(ids) { cards.forEach(c => c.classList.toggle('on', ids.indexOf(c.dataset.id) >= 0)); },
      mark(id, cls) { const c = byId(id); if (c) ui.restart(c, cls); },
      flag(id, cls) { const c = byId(id); if (c) c.classList.add(cls); },
      clearBad() { cards.forEach(c => c.classList.remove('bad')); },
      lock() { locked = true; host.querySelector('.pm').classList.add('locked'); }
    };
  }

  /* ══════════ 6) SORT BUCKETS : จับป้ายกิจกรรมใส่กล่องหน่วย ══════════ */
  function sortBuckets(host, o) {
    host.innerHTML = '<div class="sb"><div class="sb-tray">' + o.cards.map(c =>
      '<button class="chip sk-card" data-id="' + c.id + '">' + c.html + '</button>').join('') + '</div>' +
      '<div class="sb-buckets">' + o.buckets.map(b =>
        '<button class="bucket" data-b="' + b.id + '" style="--uc:' + b.col + '"><b>' + b.label + '</b><div class="bk-list"></div></button>').join('') + '</div></div>';
    let sel = null, locked = false;
    const cardEl = id => host.querySelector('.sk-card[data-id="' + id + '"]');
    function drop(id, bid) {
      if (locked) return;
      const el = cardEl(id);
      if (!el || el.classList.contains('placed')) return;
      const ok = o.onDrop(id, bid, el);
      const bk = host.querySelector('.bucket[data-b="' + bid + '"]');
      if (ok) {
        el.classList.add('placed'); el.classList.remove('sel');
        const mini = document.createElement('span');
        mini.className = 'bk-chip'; mini.innerHTML = o.cards.find(c => c.id === id).mini || el.innerHTML;
        bk.querySelector('.bk-list').appendChild(mini);
        audio.sfx('snap');
        ui.jelly(bk);
      } else {
        ui.shake(el);
      }
      sel = null;
      host.querySelectorAll('.sk-card').forEach(c => c.classList.remove('sel'));
    }
    host.querySelectorAll('.sk-card').forEach(c => dragTap(c, {
      targets: '.bucket',
      disabled: () => locked || c.classList.contains('placed'),
      onTap: () => {
        host.querySelectorAll('.sk-card').forEach(x => x.classList.remove('sel'));
        sel = sel === c.dataset.id ? null : c.dataset.id;
        if (sel) c.classList.add('sel');
        audio.sfx('tick');
      },
      onDrop: t => drop(c.dataset.id, t.dataset.b)
    }));
    host.querySelectorAll('.bucket').forEach(b => b.addEventListener('click', () => { if (sel) drop(sel, b.dataset.b); }));
    return {
      drop,
      pending: () => o.cards.filter(c => !cardEl(c.id).classList.contains('placed')).map(c => c.id),
      lock() { locked = true; },
      pulse(id, on) { const c = cardEl(id); if (c) ui.pulse(c, on); }
    };
  }

  /* ══════════ 7) CALENDAR : ปฏิทินแตะเลือกวันที่ ══════════ */
  function calendar(host, o) {
    let cells = T.DOW_S.map(d => '<div class="cal-h">' + d + '</div>').join('');
    for (let i = 0; i < o.dow0; i++) cells += '<i class="cal-blank"></i>';
    for (let d = 1; d <= o.days; d++) {
      cells += '<button class="cal-d' + (d === o.today ? ' today' : '') + '" data-d="' + d + '"' + (o.readOnly ? ' disabled' : '') + '><span>' + d + '</span>' + (d === o.today ? '<small>วันนี้</small>' : '') + '</button>';
    }
    host.innerHTML = '<div class="cal"><div class="cal-head"><span class="cal-ic">' + art.icon('calendar') + '</span><b>เดือน' + o.mo.n + '</b><span class="cal-n">' + o.days + ' วัน</span></div><div class="cal-grid">' + cells + '</div></div>';
    const el = d => host.querySelector('.cal-d[data-d="' + d + '"]');
    let locked = false;
    host.querySelectorAll('.cal-d').forEach(b => b.addEventListener('click', () => {
      if (locked || o.readOnly) return;
      o.onPick(+b.dataset.d, b);
    }));
    return {
      mark(d, cls) { const e = el(d); if (e) e.classList.add(cls); },
      unmark(cls) { host.querySelectorAll('.cal-d.' + cls).forEach(e => e.classList.remove(cls)); },
      flash(d, on) { const e = el(d); if (e) e.classList.toggle('flash', on !== false); },
      el,
      lock() { locked = true; }
    };
  }

  /* ══════════ 8) BOARD : ป้ายตารางเวลาแบบสถานี ══════════ */
  /* o = {theme, rows, showDur, mode:'one'|'many'|null, onPick, note} */
  function board(host, o) {
    const th = o.theme;
    host.innerHTML = '<div class="board' + (o.showDur ? ' with-dur' : '') + (o.mode ? ' pickable' : '') + '">' +
      '<div class="bd-top"><span class="bd-ic">' + art.icon(th.ic || 'train') + '</span><b>ตารางเวลา' + th.noun + '</b><span class="bd-route">' + th.from + '<i>›</i>' + th.to + '</span></div>' +
      '<table class="bd-tbl"><thead><tr><th>' + th.unit + '</th><th>ออก</th><th>ถึง</th><th class="bd-dh">ใช้เวลา</th></tr></thead><tbody>' +
      o.rows.map(r => '<tr class="bd-row" data-no="' + r.no + '"><td class="bd-no">' + r.no + '</td><td class="bd-t dep">' + T.fmtT(r.dep) + '</td><td class="bd-t arr">' + T.fmtT(r.arr) + '</td><td class="bd-d">' + T.minText(r.dur) + '</td></tr>').join('') +
      '</tbody></table></div>';
    const rowEl = no => host.querySelector('.bd-row[data-no="' + no + '"]');
    let locked = false;
    host.querySelectorAll('.bd-row').forEach(r => r.addEventListener('click', () => {
      if (locked || !o.mode) return;
      const no = +r.dataset.no;
      if (o.mode === 'many') { r.classList.toggle('sel'); r.classList.remove('bad'); audio.sfx('pop', r.classList.contains('sel') ? 3 : 0); if (o.onChange) o.onChange(); }
      else o.onPick(no, r);
    }));
    return {
      get: () => Array.from(host.querySelectorAll('.bd-row.sel')).map(r => +r.dataset.no).sort((a, b) => a - b),
      set(nos) { host.querySelectorAll('.bd-row').forEach(r => r.classList.toggle('sel', nos.indexOf(+r.dataset.no) >= 0)); },
      mark(no, cls) { const r = rowEl(no); if (r) ui.restart(r, cls); },
      flag(no, cls) { const r = rowEl(no); if (r) r.classList.add(cls); },
      hlCell(no, col, on) { const r = rowEl(no); if (r) r.querySelector('.bd-t.' + col).classList.toggle('hl', on !== false); },
      showDur() { host.querySelector('.board').classList.add('with-dur'); },
      pulse(no, on) { const r = rowEl(no); if (r) r.classList.toggle('pulse', on !== false); },
      clearBad() { host.querySelectorAll('.bd-row').forEach(r => r.classList.remove('bad')); },
      lock() { locked = true; }
    };
  }

  /* ══════════ 9) PLANNER : จัดตารางกิจกรรมให้พอดีเวลา ══════════ */
  const SEG_COLS = ['#ff9a1f', '#14b8a6', '#7c5cff', '#ff5fa2', '#3ba8ff'];
  function planner(host, o) {
    host.innerHTML = '<div class="pln">' +
      '<div class="pln-ends"><span>' + T.fmtT(o.start) + ' น.</span><span>' + T.fmtT(o.start + o.target) + ' น.</span></div>' +
      '<div class="pln-track"><div class="pln-fill"></div></div>' +
      '<div class="pln-info"></div>' +
      '<div class="pln-cards">' + o.cards.map(c =>
        '<button class="pl-card" data-id="' + c.id + '"><b>' + c.name + '</b><span>' + durHTML(T.minParts(c.dur)) + '</span></button>').join('') + '</div></div>';
    const sel = [];
    const byId = id => o.cards.find(c => c.id === id);
    const fill = host.querySelector('.pln-fill'), info = host.querySelector('.pln-info');
    let locked = false;
    function total() { return sel.reduce((a, id) => a + byId(id).dur, 0); }
    function paint() {
      let t = o.start, h = '';
      sel.forEach((id, k) => {
        const c = byId(id), w = c.dur / o.target * 100;
        h += '<div class="pln-seg" style="width:' + w + '%;background:' + SEG_COLS[k % SEG_COLS.length] + '"><b>' + T.fmtT(t) + '</b><small>' + T.fmtT(t + c.dur) + '</small></div>';
        t += c.dur;
      });
      fill.innerHTML = h;
      const used = total(), left = o.target - used;
      info.innerHTML = sel.length === 0 ? 'แตะกิจกรรมเพื่อใส่ลงตาราง'
        : left > 0 ? 'ใช้ไปแล้ว ' + durHTML(T.minParts(used)) + ' · เหลืออีก ' + durHTML(T.minParts(left))
        : left === 0 ? '<b class="pln-ok">พอดีเป๊ะ!</b> ' + durHTML(T.minParts(used))
        : '<b class="pln-over">เกินมา</b> ' + durHTML(T.minParts(-left));
      info.classList.toggle('over', left < 0);
      host.querySelectorAll('.pl-card').forEach(c => c.classList.toggle('on', sel.indexOf(c.dataset.id) >= 0));
      fill.classList.toggle('over', left < 0);
      if (o.onChange) o.onChange(used);
    }
    host.querySelectorAll('.pl-card').forEach(c => c.addEventListener('click', () => {
      if (locked) return;
      const id = c.dataset.id, i = sel.indexOf(id);
      if (i >= 0) sel.splice(i, 1); else sel.push(id);
      audio.sfx('pop', sel.length + 1);
      paint();
    }));
    paint();
    return {
      get: () => ({ ids: sel.slice(), total: total() }),
      set(ids) { sel.length = 0; ids.forEach(i => sel.push(i)); paint(); },
      clear() { sel.length = 0; paint(); },
      pulse(id, on) { const c = host.querySelector('.pl-card[data-id="' + id + '"]'); if (c) ui.pulse(c, on); },
      lock() { locked = true; }
    };
  }

  CT.W = { tok, durHTML, valIn, smallestUnit, keypad, choice, scaleCompare, order, pickMany, sortBuckets, calendar, board, planner, dragTap };
})();
