/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — "แท่นเล่น" 7 แบบ: ปรนัย / กดเลข / แบ่งของให้เพื่อน / กบกระโดดเส้นจำนวน / ตาชั่ง / เรียงลำดับ / จับคู่
   ทุกแท่นรับโจทย์ (p) และ X (ตัวควบคุมจาก main.js) คืนค่า { el, hint(level), reveal(), lock(on), ... }
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const { h, esc, wait } = DC.ui;
  const art = DC.art, audio = DC.audio;
  const { fm, norm } = DC.core;
  const NV = DC.NV;
  const RIG = DC.rigs = {};

  const SYMS = new Set(['<', '>', '=']);
  const OPCH = { '+': '+', '−': '−', '×': '×', '÷': '÷' };

  /* ป้ายตัวเลือก */
  function labelHTML(c, p) {
    const l = String(c.label);
    if (c.eq) return '<span class="eqc">' + l.replace(/([+−×÷=])/g, '<i>$1</i>') + '</span>';
    if (c.sym || SYMS.has(l)) return '<span class="sy">' + esc(l) + '</span>';
    if (/^\d+\/\d+$/.test(l)) { const [a, b] = l.split('/'); return '<span class="fr"><i>' + a + '</i><b></b><i>' + b + '</i></span>'; }
    return '<span class="nm">' + esc(l) + '</span>';
  }

  /* ═══ 1) ปรนัย ═══ */
  RIG.choice = (p, X) => {
    const el = h('div', 'rig r-choice');
    const n = p.choices.length;
    const eq = p.choices.some(c => c.eq), sym = p.choices.every(c => c.sym || SYMS.has(String(c.label)));
    const grid = h('div', 'opts n' + n + (eq ? ' eqs' : '') + (sym ? ' syms' : ''));
    el.appendChild(grid);
    const btns = p.choices.map((c, i) => {
      const b = h('button', 'opt c' + (i % 4), labelHTML(c, p)); b.type = 'button'; b.dataset.i = i;
      b.addEventListener('click', () => {
        if (b.disabled || el.classList.contains('locked')) return;
        X.touch();
        if (c.ok) { b.classList.add('good'); el.classList.add('locked'); X.submit(true, { el: b }); }
        else { b.classList.add('bad'); b.disabled = true; X.submit(false, { el: b, baited: b.classList.contains('baited') }); }
      });
      grid.appendChild(b); return b;
    });
    /* ปุ่มลัดบนคีย์บอร์ด 1-4 */
    const onKey = e => { const k = parseInt(e.key, 10); if (k >= 1 && k <= n && !e.ctrlKey && !e.metaKey && document.body.dataset.screen === 'scr-play' && !document.querySelector('.ov:not(.hidden)')) btns[k - 1].click(); };
    document.addEventListener('keydown', onKey);
    const api = {
      el, btns,
      dispose() { document.removeEventListener('keydown', onKey); },
      lock(on) { el.classList.toggle('locked', !!on); },
      eliminate() {
        const c = btns.filter((b, i) => !p.choices[i].ok && !b.disabled && !b.classList.contains('baited'));
        if (c.length > 1 || (c.length === 1 && n > 3)) { const b = c[Math.floor(Math.random() * c.length)]; b.disabled = true; b.classList.add('gone'); return true; }
        return false;
      },
      reveal() { const b = btns[p.choices.findIndex(c => c.ok)]; b.classList.add('good', 'shown'); el.classList.add('locked'); return b; },
      bait() {                                   // บลิ๊บล่อให้เลือกข้อผิด
        const wrongs = btns.filter((b, i) => !p.choices[i].ok && !b.disabled);
        if (!wrongs.length) return null;
        const b = wrongs[Math.floor(Math.random() * wrongs.length)];
        b.classList.add('baited'); b.appendChild(h('span', 'bait-flag', 'ข้อนี้!')); return b;
      },
      shuffleNow() {                             // สลับตำแหน่งตัวเลือกด้วยแอนิเมชัน FLIP
        const before = btns.map(b => b.getBoundingClientRect());
        const order = btns.map((b, i) => i).sort(() => Math.random() - 0.5);
        order.forEach(i => grid.appendChild(btns[i]));
        btns.forEach((b, i) => {
          const a = before[i], z = b.getBoundingClientRect();
          b.animate([{ transform: 'translate(' + (a.left - z.left) + 'px,' + (a.top - z.top) + 'px) scale(.9) rotate(-6deg)' }, { transform: 'translate(0,0) scale(1) rotate(0)' }], { duration: 650, easing: 'cubic-bezier(.3,1.4,.5,1)', delay: i * 40 });
        });
        audio.sfx('whoosh');
      },
      hint(level) {
        if (level >= 2) api.eliminate();
        if (level >= 3) api.reveal();
      }
    };
    if (p.scene && p.scene.kind === 'scatter') api.scene = true;
    return api;
  };

  /* ═══ 2) กดเลข ═══ */
  RIG.keypad = (p, X) => {
    const el = h('div', 'rig r-keypad');
    const disp = h('div', 'kdisp', '<span class="val"></span><i class="caret"></i>');
    const grid = h('div', 'kgrid');
    let val = '';
    const MAX = 10;
    const show = () => {
      const v = val;
      const parts = v.split('.');
      const shown = (parts[0] === '' ? '' : Number(parts[0]).toLocaleString('en-US')) + (parts.length > 1 ? '.' + parts[1] : '');
      disp.querySelector('.val').textContent = shown;
      disp.classList.toggle('empty', !v);
    };
    const press = k => {
      X.touch(); audio.sfx('tap');
      if (k === 'del') val = val.slice(0, -1);
      else if (k === '.') { if (p.keypad && p.keypad.dec && !val.includes('.') && val.length < MAX) val = (val || '0') + '.'; }
      else if (k === 'ok') return commit();
      else if (/^\d$/.test(k)) { if (val === '0') val = k; else if (val.length < MAX) val += k; }
      show();
    };
    const commit = () => {
      if (!val || el.classList.contains('locked')) return;
      const ok = norm(val) === norm(p.answer);
      if (ok) { el.classList.add('locked'); disp.classList.add('good'); X.submit(true, { el: disp }); }
      else { disp.classList.add('bad'); X.submit(false, { el: disp, value: val }); setTimeout(() => { disp.classList.remove('bad'); val = ''; show(); }, 520); }
    };
    ['7', '8', '9', '4', '5', '6', '1', '2', '3', p.keypad && p.keypad.dec ? '.' : '', '0', 'del'].forEach(k => {
      if (!k) { grid.appendChild(h('span', 'kk ghost')); return; }
      const b = h('button', 'kk' + (k === 'del' ? ' del' : ''), k === 'del' ? art.icon('back') : k); b.type = 'button';
      b.addEventListener('click', () => press(k)); grid.appendChild(b);
    });
    const ok = h('button', 'kok', art.icon('check') + '<span>ตอบ</span>'); ok.type = 'button'; ok.addEventListener('click', () => press('ok'));
    el.appendChild(disp); const pad = h('div', 'kpad'); pad.appendChild(grid); pad.appendChild(ok); el.appendChild(pad);
    const onKey = e => {
      if (document.body.dataset.screen !== 'scr-play' || document.querySelector('.ov:not(.hidden)')) return;
      if (e.key >= '0' && e.key <= '9') press(e.key); else if (e.key === '.' || e.key === ',') press('.'); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok');
    };
    document.addEventListener('keydown', onKey);
    show();
    return {
      el, dispose() { document.removeEventListener('keydown', onKey); },
      lock(on) { el.classList.toggle('locked', !!on); },
      reveal() { val = String(p.answer); show(); el.classList.add('locked'); disp.classList.add('good', 'shown'); return disp; },
      hint(level) { if (level >= 2 && !val) { val = String(p.answer).slice(0, 1); show(); disp.classList.add('peek'); } },
      bait() { return null }
    };
  };

  /* ═══ 3) แบ่งของให้เพื่อน (หาร) ═══ */
  RIG.share = (p, X) => {
    const s = p.scene, el = h('div', 'rig r-share');
    const pile = h('div', 'pile'); const fr = h('div', 'friends f' + s.k);
    const counts = Array(s.k).fill(0); let left = s.n;
    const pileItems = [];
    for (let i = 0; i < s.n; i++) { const it = h('span', 'it', art.item(s.icon)); pile.appendChild(it); pileItems.push(it); }
    const friends = [];
    for (let i = 0; i < s.k; i++) {
      const f = h('button', 'fri', '<span class="face">' + art.friend(i) + '</span><span class="tray"></span><span class="cnt">0</span>'); f.type = 'button';
      f.addEventListener('click', () => { X.touch(); give(i); });
      fr.appendChild(f); friends.push(f);
    }
    const reset = h('button', 'mini-btn', art.icon('undo') + '<span>แบ่งใหม่</span>'); reset.type = 'button';
    reset.addEventListener('click', () => { if (el.classList.contains('locked')) return; X.touch(); clear(true); });
    el.appendChild(pile); el.appendChild(fr); el.appendChild(reset);
    function refresh() {
      friends.forEach((f, i) => {
        const tray = f.querySelector('.tray'); tray.innerHTML = '';
        for (let j = 0; j < Math.min(counts[i], 14); j++) tray.appendChild(h('span', 'it', art.item(s.icon)));
        f.querySelector('.cnt').textContent = counts[i];
      });
      pileItems.forEach((it, i) => it.classList.toggle('out', i >= left));
    }
    function fly(fromIdx, toEl) {
      const src = pileItems[fromIdx]; if (!src) return;
      const a = src.getBoundingClientRect(), b = toEl.querySelector('.face').getBoundingClientRect();
      const g = h('div', 'fly-it', art.item(s.icon)); g.style.left = a.left + 'px'; g.style.top = a.top + 'px';
      document.body.appendChild(g);
      const an = g.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + ((b.left + b.width / 2) - a.left - 14) + 'px,' + ((b.top + 6) - a.top - 20) + 'px) scale(.8)' }], { duration: 380, easing: 'cubic-bezier(.3,.8,.4,1)' });
      an.onfinish = () => g.remove();
    }
    function give(i, silent) {
      if (left <= 0 || el.classList.contains('locked')) return false;
      fly(left - 1, friends[i]); counts[i]++; left--;
      audio.sfx('pop'); refresh(); friends[i].classList.remove('boing'); void friends[i].offsetWidth; friends[i].classList.add('boing');
      if (left === 0) setTimeout(check, 420);
      return true;
    }
    function check() {
      const sorted = counts.slice().sort((a, b) => a - b);
      if (sorted[0] === sorted[sorted.length - 1]) { el.classList.add('locked'); friends.forEach(f => f.classList.add('done')); X.submit(true, { el: fr }); }
      else {
        const mx = sorted[sorted.length - 1], mn = sorted[0];
        friends.forEach((f, i) => { if (counts[i] === mn) f.classList.add('few'); if (counts[i] === mx) f.classList.add('many'); });
        X.submit(false, { el: fr, soft: true });
        setTimeout(() => clear(false), 1500);
      }
    }
    function clear(sfx) {
      counts.fill(0); left = s.n; friends.forEach(f => f.classList.remove('few', 'many', 'done')); refresh(); if (sfx) audio.sfx('whoosh');
    }
    refresh();
    return {
      el, lock(on) { el.classList.toggle('locked', !!on); },
      async hint(level) {                          // โบโบ้แบ่งให้ดู 1 รอบ (หรือทั้งหมดถ้าขั้นสุดท้าย)
        if (level < 2) return;
        if (left < s.k) clear(false);
        const rounds = level >= 3 ? Math.ceil(left / s.k) : 1;
        for (let r = 0; r < rounds; r++) for (let i = 0; i < s.k; i++) { if (left > 0) { give(i, true); await wait(260); } }
      },
      async reveal() { clear(false); for (let r = 0; r < s.n / s.k; r++) for (let i = 0; i < s.k; i++) { if (el.classList.contains('locked')) break; give(i, true); await wait(180); } return fr; },
      bait() { return null }
    };
  };

  /* ═══ 4) กบกระโดดเส้นจำนวน ═══ */
  const frogSVG = () => art.svg('0 0 64 60', '<ellipse cx="32" cy="52" rx="18" ry="5" fill="#000" opacity=".18"/><path d="M8 38 Q6 14 32 14 Q58 14 56 38 Q56 52 32 52 Q8 52 8 38Z" fill="#7be86b" stroke="' + art.INK + '" stroke-width="3.5"/><circle cx="20" cy="16" r="9" fill="#fff" stroke="' + art.INK + '" stroke-width="3.5"/><circle cx="44" cy="16" r="9" fill="#fff" stroke="' + art.INK + '" stroke-width="3.5"/><circle cx="21" cy="17" r="4" fill="' + art.INK + '"/><circle cx="45" cy="17" r="4" fill="' + art.INK + '"/><path d="M22 36 Q32 46 42 36" fill="none" stroke="' + art.INK + '" stroke-width="3.5" stroke-linecap="round"/><circle cx="14" cy="34" r="4" fill="#ff7eb6" opacity=".7"/><circle cx="50" cy="34" r="4" fill="#ff7eb6" opacity=".7"/>', 'frog');
  RIG.hops = (p, X) => {
    const s = p.scene, hop = s.hop, el = h('div', 'rig r-hops');
    const lo = s.ticks[0], hi = s.ticks[s.ticks.length - 1];
    const pos = v => 8 + (v - lo) / (hi - lo || 1) * 84;
    const line = h('div', 'hl'); el.appendChild(line);
    line.appendChild(h('div', 'rail'));
    const frog = h('div', 'frog-w', frogSVG()); line.appendChild(frog);
    const cnt = h('div', 'hop-cnt'); line.appendChild(cnt);
    const place = v => { frog.style.left = pos(v) + '%'; };
    place(hop.start);
    const many = s.ticks.length > 16;
    const tb = {};
    s.ticks.forEach(v => {
      const t = h('button', 'tkb' + (v === hop.start ? ' start' : '') + (many && v % 5 && v !== hi && v !== lo ? ' mini' : ''), '<i></i><em>' + fm(v) + '</em>'); t.type = 'button';
      t.style.left = pos(v) + '%'; tb[v] = t;
      t.addEventListener('click', () => choose(v, t));
      line.appendChild(t);
    });
    let busy = false;
    async function jump(from, to, hi2) {
      audio.sfx('hop');
      const a = pos(from), b = pos(to);
      frog.animate([{ left: a + '%', transform: 'translate(-50%,0)' }, { left: ((a + b) / 2) + '%', transform: 'translate(-50%,-' + (hi2 || 46) + 'px)', offset: 0.5 }, { left: b + '%', transform: 'translate(-50%,0)' }], { duration: 420, easing: 'ease-in-out' });
      frog.style.left = b + '%'; await wait(430); audio.sfx('land');
    }
    async function choose(v, t) {
      if (busy || el.classList.contains('locked')) return;
      X.touch(); busy = true;
      await jump(hop.start, v, 40);
      if (v === p.answer) { el.classList.add('locked'); t.classList.add('good'); busy = false; X.submit(true, { el: t }); }
      else { t.classList.add('bad'); await wait(380); await jump(v, hop.start, 36); t.classList.remove('bad'); busy = false; X.submit(false, { el: t }); }
    }
    async function demo() {                        // คำใบ้: กบกระโดดให้ดูทีละช่วง
      busy = true; let cur = hop.start; cnt.textContent = ''; place(hop.start);
      for (let i = 1; i <= hop.n; i++) {
        const nxt = hop.start + hop.dir * hop.size * i;
        await jump(cur, nxt, 38); cur = nxt;
        cnt.textContent = i; cnt.style.left = pos(cur) + '%'; cnt.classList.remove('pop'); void cnt.offsetWidth; cnt.classList.add('pop');
        if (tb[cur]) tb[cur].classList.add('trail');
        await wait(220);
      }
      await wait(500); cnt.textContent = '';
      Object.values(tb).forEach(t => t.classList.remove('trail'));
      await jump(cur, hop.start, 30); busy = false;
    }
    return {
      el, lock(on) { el.classList.toggle('locked', !!on); },
      async hint(level) { if (level >= 2) await demo(); if (level >= 3 && tb[p.answer]) tb[p.answer].classList.add('shown'); },
      async reveal() { if (busy) return tb[p.answer]; el.classList.add('locked'); await jump(hop.start, p.answer, 42); tb[p.answer].classList.add('good', 'shown'); return tb[p.answer]; },
      bait() { return null }
    };
  };

  /* ═══ 5) ตาชั่ง ═══ */
  RIG.balance = (p, X) => {
    const s = p.scene, el = h('div', 'rig r-balance');
    const stage = h('div', 'scale');
    stage.innerHTML = '<div class="post"></div><div class="beam"><div class="pan l"><div class="strings"></div><div class="plates"></div></div><div class="pan r"><div class="strings"></div><div class="plates"></div></div></div><div class="base"></div>';
    const tilesRow = h('div', 'tiles');
    el.appendChild(stage); el.appendChild(tilesRow);
    const pl = stage.querySelector('.pan.l .plates'), pr = stage.querySelector('.pan.r .plates');
    let added = [];
    const tileBtns = s.tiles.map((v, i) => {
      const b = h('button', 'tile c' + (i % 5), '<span>' + v + '</span>'); b.type = 'button';
      b.addEventListener('click', () => { X.touch(); toggle(v, b); });
      tilesRow.appendChild(b); return b;
    });
    function plate(v, cls, onclick) { const e = h('button', 'plate ' + cls, '<span>' + v + '</span>'); e.type = 'button'; if (onclick) e.addEventListener('click', onclick); return e; }
    function render() {
      pl.innerHTML = ''; pr.innerHTML = '';
      pl.appendChild(plate(s.T, 'tgt'));
      if (s.fixed > 0) pr.appendChild(plate(s.fixed, 'fix'));
      added.forEach(a => pr.appendChild(plate(a.v, 'add', () => { if (!el.classList.contains('locked')) { X.touch(); toggle(a.v, a.b); } })));
      const right = s.fixed + added.reduce((x, a) => x + a.v, 0), diff = s.T - right;
      const ang = diff === 0 ? 0 : Math.max(-13, Math.min(13, -diff * 2.4));   // ฝั่งขวาหนัก → คานหมุนตามเข็ม (ขวาต่ำลง)
      stage.style.setProperty('--ang', ang + 'deg');
      stage.classList.toggle('bal', diff === 0);
      stage.dataset.diff = diff;
    }
    function toggle(v, b) {
      const i = added.findIndex(a => a.b === b);
      if (i >= 0) { added.splice(i, 1); b.classList.remove('used'); audio.sfx('tap'); }
      else { if (added.length >= 3) { audio.sfx('gentle'); return; } added.push({ v, b }); b.classList.add('used'); audio.sfx('clink'); }
      render();
      const right = s.fixed + added.reduce((x, a) => x + a.v, 0);
      if (right === s.T) { el.classList.add('locked'); X.submit(true, { el: stage }); }
      else if (right > s.T) { audio.sfx('gentle'); X.explore('หนักเกินไปแล้ว ลองเอาออกนะ'); }
    }
    render();
    return {
      el, lock(on) { el.classList.toggle('locked', !!on); },
      hint(level) {
        if (level >= 2) { const b = tileBtns.find((t, i) => s.tiles[i] === s.need); b.classList.add('glow'); }
      },
      reveal() {
        added.forEach(a => a.b.classList.remove('used')); added = [];
        const b = tileBtns.find((t, i) => s.tiles[i] === s.need); added.push({ v: s.need, b }); b.classList.add('used', 'glow'); render(); el.classList.add('locked'); return stage;
      },
      bait() { return null }
    };
  };

  /* ═══ 6) เรียงลำดับ ═══ */
  RIG.order = (p, X) => {
    const o = p.order, el = h('div', 'rig r-order');
    const sorted = o.items.map(i => i.v).sort((a, b) => o.asc ? a - b : b - a);
    const slots = h('div', 'oslots'); const pool = h('div', 'opool');
    const label = h('div', 'olab', o.asc ? '<span>น้อย</span>' + art.icon('right') + '<span>มาก</span>' : '<span>มาก</span>' + art.icon('right') + '<span>น้อย</span>');
    sorted.forEach((v, i) => slots.appendChild(h('div', 'os', '<em>' + (i + 1) + '</em>')));
    const cards = o.items.map((it, i) => {
      const b = h('button', 'ocard c' + (i % 4), '<span>' + esc(it.label) + '</span>'); b.type = 'button'; b.dataset.v = it.v;
      b.addEventListener('click', () => pick(it, b)); pool.appendChild(b); return b;
    });
    el.appendChild(label); el.appendChild(slots); el.appendChild(pool);
    let idx = 0;
    function place(b, i) { const slot = slots.children[i]; slot.appendChild(b); b.classList.add('placed'); b.disabled = true; slot.classList.add('on'); }
    function pick(it, b) {
      if (b.disabled || el.classList.contains('locked')) return;
      X.touch();
      if (it.v === sorted[idx]) {
        audio.sfx('clink'); place(b, idx); idx++;
        if (idx === sorted.length) { el.classList.add('locked'); X.submit(true, { el: slots }); }
      } else { audio.sfx('gentle'); X.submit(false, { el: b, soft: true }); }
    }
    return {
      el, lock(on) { el.classList.toggle('locked', !!on); },
      hint(level) {
        const nxt = cards.find(c => !c.disabled && +c.dataset.v === sorted[idx]);
        if (nxt && level >= 2) nxt.classList.add('glow');
      },
      async reveal() { el.classList.add('locked'); while (idx < sorted.length) { const b = cards.find(c => !c.disabled && +c.dataset.v === sorted[idx]); place(b, idx); idx++; audio.sfx('clink'); await wait(220); } return slots; },
      bait() { return null }
    };
  };

  /* ═══ 7) จับคู่ ═══ */
  RIG.match = (p, X) => {
    const el = h('div', 'rig r-match'); const L = h('div', 'mcol l'), Rr = h('div', 'mcol r');
    const lefts = p.pairs.map((q, i) => ({ q, i }));
    const rights = DC.Rng ? new DC.Rng('m' + p.sig).shuffle(p.pairs.map((q, i) => ({ q, i }))) : p.pairs.map((q, i) => ({ q, i }));
    let sel = null, matched = 0;
    const lb = lefts.map(o => { const b = h('button', 'mc l c' + o.i, '<span>' + esc(o.q.left) + '</span>'); b.type = 'button'; b.addEventListener('click', () => { if (b.disabled) return; X.touch(); sel && sel.b.classList.remove('sel'); sel = { o, b }; b.classList.add('sel'); audio.sfx('tap'); X.say(NV.expr(o.q.l)); }); L.appendChild(b); return b; });
    const rb = rights.map(o => { const b = h('button', 'mc r', '<span>' + esc(o.q.right) + '</span>'); b.type = 'button'; b.addEventListener('click', () => { if (b.disabled) return; X.touch(); tryPair(o, b); }); Rr.appendChild(b); return b; });
    function tryPair(o, b) {
      if (!sel) { audio.sfx('gentle'); X.explore('เลือกโจทย์ทางซ้ายก่อนนะ'); b.classList.add('nudge'); setTimeout(() => b.classList.remove('nudge'), 400); return; }
      if (sel.o.i === o.i) {
        const cl = 'c' + o.i; sel.b.classList.remove('sel'); sel.b.classList.add('ok', cl); b.classList.add('ok', cl); sel.b.disabled = true; b.disabled = true; sel = null;
        audio.sfx('clink'); matched++;
        if (matched === p.pairs.length) { el.classList.add('locked'); X.submit(true, { el: el }); }
      } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450); sel.b.classList.add('bad'); const sb = sel.b; setTimeout(() => sb.classList.remove('bad'), 450); X.submit(false, { el: b, soft: true }); }
    }
    el.appendChild(L); el.appendChild(Rr);
    return {
      el, lock(on) { el.classList.toggle('locked', !!on); },
      hint(level) {
        if (level < 2) return;
        const i = lb.findIndex(b => !b.disabled); if (i < 0) return;
        lb[i].classList.add('glow'); const o = lefts[i]; const j = rights.findIndex(r => r.i === o.i); rb[j].classList.add('glow');
      },
      async reveal() { el.classList.add('locked'); for (let i = 0; i < lefts.length; i++) { if (lb[i].disabled) continue; const j = rights.findIndex(r => r.i === lefts[i].i); lb[i].classList.add('ok', 'c' + i); rb[j].classList.add('ok', 'c' + i); lb[i].disabled = rb[j].disabled = true; audio.sfx('clink'); await wait(260); } return el; },
      bait() { return null }
    };
  };

  RIG.build = (p, X) => (RIG[p.mech] || RIG.choice)(p, X);
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
