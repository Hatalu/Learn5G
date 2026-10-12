/* ═══════════════════════════════════════════════════════════
   DOTTY GRAND PRIX — UI helpers
   screens / guide bubble / dialog / particles / boost FX / overlays
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const DG = window.DG;
  const { D, art, audio } = DG;
  const $ = s => document.querySelector(s);

  /* ── ข้อความแบบมีตัวเลขทศนิยม ──
     {2.45}   → ตัวเลขทศนิยม (จุดกลมใหญ่)
     {c:2.45} → ตัวเลขระบายสีตามหลัก
     **x**    → ตัวหนา */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rich(s, trustedHTML) {
    s = String(s);
    if (!trustedHTML) s = esc(s);
    return s
      .replace(/\{c:([\d.]+)\}/g, (m, n) => D.html(n, { color: true }))
      .replace(/\{([\d.]+)\}/g, (m, n) => D.html(n))
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  }
  /* ข้อความสำหรับเสียงพูด */
  function speech(s) {
    return String(s)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{c:([\d.]+)\}/g, (m, n) => D.read(n))
      .replace(/\{([\d.]+)\}/g, (m, n) => D.read(n))
      .replace(/\*\*/g, '')
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
      .replace(/\s>\s/g, ' มากกว่า ').replace(/\s<\s/g, ' น้อยกว่า ').replace(/\s=\s/g, ' เท่ากับ ').replace(/\s\+\s/g, ' บวก ')
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
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn, .icon-btn, .chip, .key, .opt');
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
  function sparkle(at, count) {
    const p = at && at.x != null ? at : center(at);
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
    const p = at && at.x != null ? at : center(at);
    for (let i = 0; i < 7; i++) {
      const s = fxEl('puff', p);
      const a = i / 7 * Math.PI * 2;
      s.style.setProperty('--dx', Math.cos(a) * 40 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 40 + 'px');
      setTimeout(() => s.remove(), 700);
    }
  }
  function floatText(at, html, cls) {
    const p = at && at.x != null ? at : center(at);
    const s = fxEl('float-txt ' + (cls || ''), p);
    s.innerHTML = html;
    setTimeout(() => s.remove(), 1300);
  }
  function confetti(n) {
    const fx = $('#fx');
    const cols = ['#ff5a3c', '#ffd23f', '#20c4b4', '#7c5cff', '#ff5fa2', '#fff'];
    for (let i = 0; i < (n || 46); i++) {
      const s = document.createElement('div');
      s.className = 'confetti' + (i % 4 === 0 ? ' chk' : '');
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = cols[i % cols.length];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      fx.appendChild(s);
      setTimeout(() => s.remove(), 3000);
    }
  }
  /* เส้นความเร็ววิ่งผ่านจอ (บูสต์) */
  function speedLines() {
    const fx = $('#fx');
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('div');
      s.className = 'speed-line';
      s.style.top = (10 + Math.random() * 80) + 'vh';
      s.style.animationDelay = Math.random() * 0.25 + 's';
      s.style.width = (80 + Math.random() * 160) + 'px';
      fx.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }
  function flash(cls) {
    const f = document.createElement('div');
    f.className = 'screen-flash ' + (cls || '');
    $('#fx').appendChild(f);
    setTimeout(() => f.remove(), 600);
  }

  /* ── ผู้นำทาง (ซิ่งซิ่ง / เจ้าจุดซน) + กล่องคำพูด ── */
  /* จอเล็ก: ขยายความสูงกล่องคำพูดตามข้อความ (ไม่เกิน 170px) ให้อ่านครบไม่ต้องเลื่อน */
  function fitGuide() {
    const root = document.documentElement;
    root.style.removeProperty('--guide-h');
    if (innerWidth > 640) return;
    requestAnimationFrame(() => {
      const t = $('#bText');
      const need = t.scrollHeight - t.clientHeight;
      if (need > 2) root.style.setProperty('--guide-h', Math.min(170, 120 + need) + 'px');
    });
  }
  addEventListener('resize', () => { if ($('#bText').textContent) fitGuide(); });

  const MOOD_EMO = { cheer: 'hype', wow: 'wow', happy: 'happy', talk: 'talk', think: 'think', smirk: 'sneaky', laugh: 'sneaky', shock: 'wow', sad: 'think' };
  const NAMES = { zing: 'ซิ่งซิ่ง', jud: 'เจ้าจุดซน' };
  const G = {
    who: 'zing', text: '', emo: 'talk', autoVoice: true, nextCb: null, tapToNext: false,
    init() {
      $('#gZing').innerHTML = art.zing('happy');
      $('#gJud').innerHTML = art.jud('smirk');
      $('#bSpeak').innerHTML = art.icon('speaker');
      if (!audio.canSpeak()) $('#bSpeak').hidden = true;
      $('#bSpeak').addEventListener('click', e => { e.stopPropagation(); audio.speak(speech(G.text), { emo: G.emo, who: G.who }); });
      $('#btnNext').addEventListener('click', () => G.fireNext());
      $('#bubble').addEventListener('click', () => { if (G.nextCb && G.tapToNext) G.fireNext(); });
    },
    show() { $('#guide').classList.remove('hidden'); document.body.classList.add('has-guide'); },
    hide() { $('#guide').classList.add('hidden'); document.body.classList.remove('has-guide'); audio.stopSpeak(); },
    mood(m, who) {
      const el = who === 'jud' ? $('#gJud svg') : $('#gZing svg');
      if (el) el.setAttribute('class', (who === 'jud' ? 'jud' : 'zing') + ' mood-' + m);
    },
    /* o = {who, mood, emo, keepJud, sfx, silent} */
    say(text, o) {
      o = o || {};
      const who = o.who || 'zing';
      const mood = o.mood || (who === 'jud' ? 'smirk' : 'talk');
      G.who = who; G.text = text; G.emo = o.emo || MOOD_EMO[mood] || 'talk';
      const b = $('#bubble');
      b.classList.toggle('from-jud', who === 'jud');
      $('#bName').textContent = NAMES[who];
      $('#bText').innerHTML = rich(text);
      jelly(b);
      fitGuide();
      if (who === 'jud') {
        $('#gJud').classList.remove('hidden');
        $('#gJud').classList.add('speaking');
        $('#gZing').classList.remove('speaking');
        G.mood(mood, 'jud');
        if (!o.sfx) audio.sfx('sneaky');
      } else {
        $('#gZing').classList.add('speaking');
        $('#gJud').classList.remove('speaking');
        if (!o.keepJud) $('#gJud').classList.add('hidden');
        G.mood(mood, 'zing');
        clearTimeout(G._t);
        G._t = setTimeout(() => {
          const svg = $('#gZing svg');
          if (svg && /mood-talk/.test(svg.getAttribute('class'))) G.mood('happy');
          $('#gZing').classList.remove('speaking');
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
          G.say(L.text, { who: L.who, mood: L.mood, keepJud: L.keepJud, sfx: L.sfx });
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

  DG.ui = { $, esc, rich, speech, show, jelly, shake, pulse, restart, center, sparkle, puff, floatText, confetti, speedLines, flash, G, openOv, closeOv, toast, wait };
})();
