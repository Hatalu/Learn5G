/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — วาด "โจทย์" เป็นภาพ: นิพจน์ตัวเลข ฉากกลุ่มของ แถบเศษส่วน เส้นจำนวน ฯลฯ
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const { h, esc } = DC.ui;
  const art = DC.art;

  const OPS = new Set(['+', '−', '×', '÷', '=', '<', '>', '≈', '→', '(', ')']);

  /* ── ตัวเลข/สัญลักษณ์เป็นชิ้น ๆ ── */
  function tok(t) {
    t = String(t);
    if (t === '?') return '<span class="tk blank" data-blank="1">?</span>';
    if (/^\?\/\d+$/.test(t)) return '<span class="tk frac"><i class="blank" data-blank="1">?</i><b></b><i>' + esc(t.split('/')[1]) + '</i></span>';
    if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); return '<span class="tk frac"><i>' + a + '</i><b></b><i>' + b + '</i></span>'; }
    if (t === 'เศษ') return '<span class="tk word">เศษ</span>';
    if (t === '(' || t === ')') return '<span class="tk par">' + t + '</span>';
    if (OPS.has(t)) return '<span class="tk op">' + (t === '→' ? art.icon('right') : esc(t)) + '</span>';
    return '<span class="tk num">' + esc(t) + '</span>';
  }
  function expr(tokens, isSeq) {
    const n = tokens.join('').length;
    const size = n > 30 ? 'xs' : n > 22 ? 'sm' : n > 14 ? 'md' : 'lg';
    const el = h('div', 'expr x-' + size + (isSeq ? ' seq' : ''));
    el.innerHTML = tokens.map(tok).join('');
    return el;
  }

  /* ── กลุ่มไอเทม ── */
  function group(icon, n, cls, max) {
    const g = h('div', 'grp ' + (cls || ''));
    for (let i = 0; i < n; i++) { const c = h('span', 'it', art.item(icon)); c.style.setProperty('--i', i); g.appendChild(c); }
    return g;
  }

  const SC = {};
  SC.join = s => {
    const w = h('div', 'scene s-join');
    w.appendChild(group(s.icon, s.a, 'g1'));
    w.appendChild(h('div', 'plus', '+'));
    w.appendChild(group(s.icon, s.b, 'g2'));
    return w;
  };
  SC.take = s => {
    const w = h('div', 'scene s-take');
    const g = h('div', 'grp');
    for (let i = 0; i < s.a; i++) { const c = h('span', 'it' + (i >= s.a - s.b ? ' gone' : ''), art.item(s.icon)); c.style.setProperty('--i', i); g.appendChild(c); }
    w.appendChild(g);
    w.appendChild(h('div', 'cap', '<span class="dot"></span> ถูกบลิ๊บเอาไป ' + s.b));
    return w;
  };
  SC.array = s => {
    const w = h('div', 'scene s-array');
    const g = h('div', 'arr'); g.style.setProperty('--cols', s.cols);
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) { const it = h('span', 'it rw' + (r % 3), art.item(s.icon)); it.style.setProperty('--i', r * s.cols + c); g.appendChild(it); }
    w.appendChild(g);
    w.appendChild(h('div', 'cap', s.rows + ' แถว แถวละ ' + s.cols));
    return w;
  };
  SC.scatter = (s, api) => {
    const w = h('div', 'scene s-scatter');
    const field = h('div', 'field'); w.appendChild(field);
    const cols = Math.ceil(Math.sqrt(s.n * 1.6)), rows = Math.ceil(s.n / cols);
    const R = new DC.Rng('sc' + s.n + s.icon + Math.random());
    const cells = R.shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, s.n);
    let counted = 0;
    const items = cells.map((cidx, i) => {
      const cx = (cidx % cols + 0.5) / cols * 100 + R.int(-4, 4), cy = (Math.floor(cidx / cols) + 0.5) / rows * 100 + R.int(-6, 6);
      const it = h('button', 'it tapcount', art.item(s.icon) + '<em></em>'); it.type = 'button';
      it.style.left = cx + '%'; it.style.top = cy + '%'; it.style.setProperty('--i', i);
      it.addEventListener('click', () => {
        if (it.classList.contains('on')) return;
        counted++; it.classList.add('on'); it.querySelector('em').textContent = counted;
        DC.audio.sfx('count', counted);
        if (api && api.onCount) api.onCount(counted);
      });
      field.appendChild(it); return it;
    });
    const reset = h('button', 'mini-btn', art.icon('undo') + '<span>นับใหม่</span>'); reset.type = 'button';
    reset.addEventListener('click', () => { counted = 0; items.forEach(i => { i.classList.remove('on'); i.querySelector('em').textContent = ''; }); DC.audio.sfx('pop'); });
    w.appendChild(reset);
    w.autoCount = (done) => {                       // คำใบ้: โบโบ้นับให้ทีละอัน
      let k = 0;
      const step = () => { if (k >= items.length) return done && done(); const it = items[k++]; if (!it.classList.contains('on')) { counted++; it.classList.add('on'); it.querySelector('em').textContent = counted; DC.audio.sfx('count', counted); } setTimeout(step, 330); };
      counted = 0; items.forEach(i => { i.classList.remove('on'); i.querySelector('em').textContent = ''; }); step();
    };
    return w;
  };
  SC.baht = s => {
    const w = h('div', 'scene s-baht');
    w.innerHTML = '<div class="tag"><span>ราคา</span><b>' + s.price + '</b><small>บาท</small></div><div class="arrow">' + art.icon('right') + '</div><div class="pay">' + art.note(s.pay) + '<small>จ่าย ' + s.pay + ' บาท</small></div>';
    return w;
  };
  SC.bars = s => {
    const w = h('div', 'scene s-bars');
    s.parts.forEach((pt, k) => {
      const [n, d] = pt; const bar = h('div', 'fbar' + (k ? ' alt' : ''));
      for (let i = 0; i < d; i++) bar.appendChild(h('i', i < n ? 'on' : (s.take && i < n ? 'take' : '')));
      if (s.take && k === 0) { const cells = bar.querySelectorAll('i'); for (let i = n - s.take; i < n; i++) cells[i].className = 'take'; }
      const lab = h('span', 'flab', '<i>' + n + '</i><b></b><i>' + d + '</i>'); const row = h('div', 'frow'); row.appendChild(lab); row.appendChild(bar); w.appendChild(row);
    });
    return w;
  };
  SC.bars2 = s => {
    const w = h('div', 'scene s-bars2'); const mx = Math.max(s.a, s.b);
    [[s.a, 'a'], [s.b, 'b']].forEach(([n, k]) => { const row = h('div', 'brow ' + k); for (let i = 0; i < n; i++) row.appendChild(h('i', '')); row.appendChild(h('b', '', n)); w.appendChild(row); });
    w.style.setProperty('--mx', mx);
    return w;
  };
  SC.marker = s => {
    const w = h('div', 'scene s-marker'); const lo = s.ticks[0], hi = s.ticks[s.ticks.length - 1];
    const pos = v => (v - lo) / (hi - lo) * 100;
    let html = '<div class="nl"><div class="rail"></div>';
    s.ticks.forEach(v => { html += '<span class="tk-m' + (s.ticks.length > 14 && v % 5 !== 0 && v !== lo && v !== hi ? ' mini' : '') + '" style="left:' + pos(v) + '%"><i></i><em>' + (s.ticks.length > 14 && v % 5 !== 0 && v !== lo && v !== hi ? '' : v) + '</em></span>'; });
    html += '<span class="ptr" style="left:' + pos(s.at) + '%">' + art.icon('rocket') + '</span></div>';
    w.innerHTML = html; return w;
  };

  function scene(s, api) { const f = SC[s.kind]; return f ? f(s, api) : null; }

  /* ── ภาพช่วยคิด (คำใบ้ขั้นที่ 2) ── */
  function steps(a) {
    if (!a) return [];
    const A = a.a, B = a.b, fm = DC.core.fm;
    const t = (n) => Math.floor(n / 10) * 10, o = (n) => n % 10;
    if (a.k) return [];
    if (a.type === 'add' && Number.isInteger(A) && Number.isInteger(B)) {
      if (B >= 10 && A >= 10) { const s1 = A + t(B); return [fm(A) + ' + ' + fm(t(B)) + ' = ' + fm(s1), fm(s1) + ' + ' + fm(o(B)) + ' = ' + fm(A + B)].slice(0, o(B) ? 2 : 1); }
      return [fm(A) + ' ... นับต่ออีก ' + fm(B) + ' = ' + fm(A + B)];
    }
    if (a.type === 'sub' && Number.isInteger(A) && Number.isInteger(B)) {
      if (B >= 10) { const s1 = A - t(B); return [fm(A) + ' − ' + fm(t(B)) + ' = ' + fm(s1), fm(s1) + ' − ' + fm(o(B)) + ' = ' + fm(A - B)].slice(0, o(B) ? 2 : 1); }
      return [fm(A) + ' ... ถอยหลัง ' + fm(B) + ' = ' + fm(A - B)];
    }
    if (a.type === 'mul' && Number.isInteger(A) && Number.isInteger(B)) {
      const big = Math.max(A, B), sm = Math.min(A, B);
      if (big >= 20) return [fm(sm) + ' × ' + fm(t(big)) + ' = ' + fm(sm * t(big)), fm(sm) + ' × ' + fm(o(big)) + ' = ' + fm(sm * o(big)), 'รวมกัน = ' + fm(A * B)].filter(x => !/× 0 =/.test(x));
      return [fm(sm) + ' กลุ่ม กลุ่มละ ' + fm(big) + ' → นับข้ามทีละ ' + fm(big)];
    }
    if (a.type === 'div' && Number.isInteger(A) && Number.isInteger(B) && B > 0) return [fm(B) + ' × ? = ' + fm(A), 'ลองท่องแม่ ' + fm(B) + ': ' + [1, 2, 3, 4, 5].map(i => fm(B * i)).join(', ') + ' ...'];
    return [];
  }

  DC.scenes = { expr, tok, scene, steps, group };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
