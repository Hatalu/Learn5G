/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — UI helpers
   screens / guide bubble / dialog / particles / overlays / drag
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, audio } = MM;
  const $ = s => document.querySelector(s);

  /* ── ข้อความแบบมีป้ายพิเศษ ──
     {c:hard}  → ป้ายคำศัพท์สี (แข็ง นิ่ม ยืดหยุ่น ฯลฯ)
     **x**     → ตัวหนา          \n → ขึ้นบรรทัดใหม่ */
  const CHIPS = {
    hard: ['แข็ง', 'k-hard'], soft: ['นิ่ม', 'k-soft'],
    elastic: ['ยืดหยุ่น', 'k-elastic'], inelastic: ['ไม่ยืดหยุ่น', 'k-no'],
    heatY: ['นำความร้อนดี', 'k-heat'], heatN: ['นำความร้อนไม่ดี', 'k-no'],
    elecY: ['นำไฟฟ้า', 'k-elec'], elecN: ['ไม่นำไฟฟ้า', 'k-no'],
    solid: ['ของแข็ง', 'k-solid'], liquid: ['ของเหลว', 'k-liquid'], gas: ['แก๊ส', 'k-gas'],
    matter: ['สสาร', 'k-matter']
  };
  const RE_C = /\{c:(\w+)\}/g;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rich(s, trustedHTML) {
    s = String(s);
    if (!trustedHTML) s = esc(s);
    return s
      .replace(RE_C, (m, k) => CHIPS[k] ? '<span class="kchip ' + CHIPS[k][1] + '">' + CHIPS[k][0] + '</span>' : m)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  }
  /* ข้อความสำหรับเสียงพูด */
  function speech(s) {
    return String(s)
      .replace(/<[^>]+>/g, ' ')
      .replace(RE_C, (m, k) => CHIPS[k] ? ' ' + CHIPS[k][0] + ' ' : ' ')
      .replace(/\*\*/g, '')
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
      .replace(/\s>\s/g, ' มากกว่า ').replace(/\s<\s/g, ' น้อยกว่า ').replace(/\s=\s/g, ' เท่ากับ ')
      .replace(/·/g, ' ');
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  }

  /* ── game juice ── */
  function restart(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  const jelly = el => restart(el, 'jelly');
  const shake = el => restart(el, 'shake');
  function pulse(el, on) { if (el) el.classList.toggle('guide-pulse', on !== false); }
  const JELLY_SEL = '.btn, .icon-btn, .chip, .key, .opt, .tool-btn, .bin, .icard-btn, .pick-btn';
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest(JELLY_SEL);
    if (b && !b.disabled) jelly(b);
  });

  function center(el) {
    if (!el || !el.getBoundingClientRect) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function fxEl(cls, p) {
    const s = document.createElement('div');
    s.className = cls;
    s.style.left = p.x + 'px';
    s.style.top = p.y + 'px';
    $('#fx').appendChild(s);
    return s;
  }
  const pt = at => at && at.x != null ? at : center(at);
  function sparkle(at, count) {
    const p = pt(at);
    const n = count || 14;
    for (let i = 0; i < n; i++) {
      const s = fxEl('spark' + (i % 3 === 0 ? ' big' : ''), p);
      const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 90;
      s.style.setProperty('--dx', Math.cos(a) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      s.innerHTML = art.star(true);
      setTimeout(() => s.remove(), 900);
    }
  }
  function puff(at) {
    const p = pt(at);
    for (let i = 0; i < 7; i++) {
      const s = fxEl('puff', p);
      const a = i / 7 * Math.PI * 2;
      s.style.setProperty('--dx', Math.cos(a) * 40 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 40 + 'px');
      setTimeout(() => s.remove(), 700);
    }
  }
  /* เศษวัสดุกระเด็น (เช่นเศษไม้จากการขีด) */
  function chips(at, color, n) {
    const p = pt(at);
    for (let i = 0; i < (n || 8); i++) {
      const s = fxEl('chipfx', p);
      s.style.background = color || '#c68a4e';
      const a = -Math.PI * (0.15 + Math.random() * 0.7), d = 20 + Math.random() * 40;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      setTimeout(() => s.remove(), 700);
    }
  }
  function floatText(at, html, cls) {
    const p = pt(at);
    const s = fxEl('float-txt ' + (cls || ''), p);
    s.innerHTML = html;
    setTimeout(() => s.remove(), 1300);
  }
  function confetti(n) {
    const fx = $('#fx');
    const cols = ['#ff5a6e', '#ffd23f', '#3ccf9a', '#8b5cf6', '#ff8fc1', '#4aa8ff', '#ff9a1f'];
    for (let i = 0; i < (n || 46); i++) {
      const s = document.createElement('div');
      s.className = 'confetti k' + (i % 4);
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = cols[i % cols.length];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      s.style.setProperty('--sw', (Math.random() * 120 - 60) + 'px');
      fx.appendChild(s);
      setTimeout(() => s.remove(), 3200);
    }
  }
  function ripple(at) {
    const p = pt(at);
    for (let i = 0; i < 3; i++) {
      const s = fxEl('ripple', p);
      s.style.animationDelay = i * 0.14 + 's';
      setTimeout(() => s.remove(), 1200 + i * 140);
    }
  }
  function flash(cls) {
    const f = document.createElement('div');
    f.className = 'screen-flash ' + (cls || '');
    $('#fx').appendChild(f);
    setTimeout(() => f.remove(), 600);
  }

  /* ── ผู้นำทาง (แมทแมท / ตุ๊บตุ๊บ) + กล่องคำพูด ── */
  function fitGuide() {
    const root = document.documentElement;
    root.style.removeProperty('--guide-h');
    if (innerWidth > 640) return;
    requestAnimationFrame(() => {
      const t = $('#bText');
      const need = t.scrollHeight - t.clientHeight;
      if (need > 2) root.style.setProperty('--guide-h', Math.min(170, 104 + need) + 'px');
    });
  }
  addEventListener('resize', () => { if ($('#bText').textContent) fitGuide(); });

  const MOOD_EMO = { cheer: 'hype', wow: 'wow', happy: 'happy', talk: 'talk', think: 'think', smirk: 'sneaky', laugh: 'sneaky', shock: 'wow', sad: 'think' };
  const NAMES = { mat: 'แมทแมท', tub: 'ตุ๊บตุ๊บ' };
  const G = {
    who: 'mat', text: '', emo: 'talk', autoVoice: true, nextCb: null, tapToNext: false,
    init() {
      $('#gMat').innerHTML = art.mat('happy');
      $('#gTub').innerHTML = art.tub('smirk');
      $('#bSpeak').innerHTML = art.icon('speaker');
      if (!audio.canSpeak()) $('#bSpeak').hidden = true;
      $('#bSpeak').addEventListener('click', e => { e.stopPropagation(); audio.speak(speech(G.text), { emo: G.emo, who: G.who }); });
      $('#btnNext').addEventListener('click', () => G.fireNext());
      $('#bubble').addEventListener('click', () => { if (G.nextCb && G.tapToNext) G.fireNext(); });
    },
    show() { $('#guide').classList.remove('hidden'); document.body.classList.add('has-guide'); },
    hide() { $('#guide').classList.add('hidden'); document.body.classList.remove('has-guide'); audio.stopSpeak(); },
    mood(m, who) {
      const el = who === 'tub' ? $('#gTub svg') : $('#gMat svg');
      if (el) el.setAttribute('class', (who === 'tub' ? 'tub' : 'mat') + ' mood-' + m);
    },
    /* o = {who, mood, emo, keepTub, sfx, silent} */
    say(text, o) {
      o = o || {};
      const who = o.who || 'mat';
      const mood = o.mood || (who === 'tub' ? 'smirk' : 'talk');
      G.who = who; G.text = text; G.emo = o.emo || MOOD_EMO[mood] || 'talk';
      const b = $('#bubble');
      b.classList.toggle('from-tub', who === 'tub');
      $('#bName').textContent = NAMES[who];
      $('#bText').innerHTML = rich(text);
      jelly(b);
      fitGuide();
      if (who === 'tub') {
        $('#gTub').classList.remove('hidden');
        $('#gTub').classList.add('speaking');
        $('#gMat').classList.remove('speaking');
        G.mood(mood, 'tub');
        if (!o.sfx) audio.sfx('sneaky');
      } else {
        $('#gMat').classList.add('speaking');
        $('#gTub').classList.remove('speaking');
        if (!o.keepTub) $('#gTub').classList.add('hidden');
        G.mood(mood, 'mat');
        clearTimeout(G._t);
        G._t = setTimeout(() => {
          const svg = $('#gMat svg');
          if (svg && /mood-talk/.test(svg.getAttribute('class'))) G.mood('happy');
          $('#gMat').classList.remove('speaking');
        }, 2200);
      }
      if (o.sfx) audio.sfx(o.sfx);
      if (G.autoVoice && !o.silent) audio.speak(speech(text), { emo: G.emo, who });
    },
    setNext(label, cb, tapToNext) {
      const btn = $('#btnNext');
      G.nextCb = cb;
      G.tapToNext = !!tapToNext;
      if (!cb) { btn.classList.add('hidden'); return; }
      btn.innerHTML = '<span>' + (label || 'ต่อไป') + '</span>' + art.icon('right');
      btn.classList.remove('hidden');
      jelly(btn);
    },
    fireNext() {
      const cb = G.nextCb;
      if (!cb) return;
      audio.sfx('click');
      G.setNext(null);
      cb();
    },
    /* lines: [{who, text, mood, show, sfx, last}] → Promise */
    dialog(lines) {
      return new Promise(resolve => {
        let i = 0;
        const step = () => {
          if (i >= lines.length) { resolve(); return; }
          const L = lines[i++];
          if (L.show != null && G.onShow) G.onShow(L.show);
          G.say(L.text, { who: L.who, mood: L.mood, keepTub: L.keepTub, sfx: L.sfx });
          G.setNext(i >= lines.length ? (L.last || 'ลุยเลย') : 'ต่อไป', step, true);
        };
        step();
      });
    }
  };

  function openOv(id) { const o = $(id); o.classList.remove('hidden'); jelly(o.querySelector('.ov-card')); }
  function closeOv(id) { $(id).classList.add('hidden'); }
  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = rich(html);
    $('#toastWrap').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2300);
    setTimeout(() => t.remove(), 2800);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ── tween กลาง ── */
  const ease = {
    out: k => 1 - Math.pow(1 - k, 3),
    inOut: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
    back: k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
    linear: k => k
  };
  /* กรอบเฟรมกลาง (ทดสอบอัตโนมัติสามารถแทนที่ด้วย setTimeout ได้) */
  const frame = { raf: f => requestAnimationFrame(f) };
  function tween(ms, fn, done, e) {
    const t0 = performance.now();
    const f = e || ease.out;
    let stop = false;
    const step = t => {
      if (stop) return;
      const k = Math.min(1, (t - t0) / ms);
      fn(f(k), k);
      if (k < 1) frame.raf(step); else if (done) done();
    };
    frame.raf(step);
    return { cancel() { stop = true; } };
  }
  /* วนทุกเฟรมจนกว่า fn จะคืนค่า false · fn(dtSeconds, tSeconds) */
  function loop(fn) {
    let last = performance.now(), t0 = last, stop = false;
    const step = now => {
      if (stop) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (fn(dt, (now - t0) / 1000) === false) { stop = true; return; }
      frame.raf(step);
    };
    frame.raf(step);
    return { cancel() { stop = true; } };
  }

  /* ── ลากด้วย Pointer Events (นิ้ว/เมาส์) ──
     o = {onStart(p,e)→false=ไม่เริ่ม, onMove(p,e), onEnd(p,e,moved)} ; p = {x,y} พิกัดจอ */
  function drag(el, o) {
    let active = false, id = null, moved = false, sx = 0, sy = 0;
    el.addEventListener('pointerdown', e => {
      if (e.button != null && e.button > 0) return;
      const p = { x: e.clientX, y: e.clientY };
      if (o.onStart && o.onStart(p, e) === false) return;
      active = true; moved = false; id = e.pointerId; sx = p.x; sy = p.y;
      try { el.setPointerCapture(id); } catch (_) {}
      e.preventDefault();
    });
    el.addEventListener('pointermove', e => {
      if (!active || e.pointerId !== id) return;
      const p = { x: e.clientX, y: e.clientY };
      if (!moved && Math.hypot(p.x - sx, p.y - sy) > 4) moved = true;
      o.onMove && o.onMove(p, e, moved);
      e.preventDefault();
    });
    const end = e => {
      if (!active || (e.pointerId != null && e.pointerId !== id)) return;
      active = false;
      try { el.releasePointerCapture(id); } catch (_) {}
      o.onEnd && o.onEnd({ x: e.clientX, y: e.clientY }, e, moved);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  MM.ui = { $, esc, rich, speech, CHIPS, show, jelly, shake, pulse, restart, center, sparkle, puff, chips, floatText, confetti, ripple, flash, G, openOv, closeOv, toast, wait, tween, loop, frame, ease, drag };
})();
