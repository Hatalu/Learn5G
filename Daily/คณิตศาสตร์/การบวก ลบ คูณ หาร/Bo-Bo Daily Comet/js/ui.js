/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — ตัวช่วย UI: DOM, เอฟเฟกต์อนุภาค, ดาวบินเข้า HUD, ที่เก็บข้อมูลในเครื่อง
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const art = DC.art, audio = DC.audio;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function show(id) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    document.body.dataset.screen = id;
  }
  function restart(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  const shake = el => restart(el, 'shake');
  const boing = el => restart(el, 'boing');

  function center(el) {
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    if (el.x != null && el.getBoundingClientRect == null) return el;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const COLS = ['#ffd23f', '#ff7eb6', '#7df9ff', '#4fe3c1', '#c79bff', '#ffffff'];
  function sparkle(at, n) {
    const c = center(at); n = n || 14;
    for (let i = 0; i < n; i++) {
      const p = h('i', 'spark');
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
      p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.setProperty('--c', COLS[i % COLS.length]); p.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
      $('#fx').appendChild(p); setTimeout(() => p.remove(), 1000);
    }
  }
  function confetti(n) {
    n = n || 80;
    for (let i = 0; i < n; i++) {
      const p = h('i', 'confetti');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--c', COLS[i % COLS.length]); p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's'; p.style.animationDelay = Math.random() * 0.6 + 's';
      if (i % 3 === 0) p.classList.add('tri');
      $('#fx').appendChild(p); setTimeout(() => p.remove(), 4200);
    }
  }
  function puff(at) {
    const c = center(at);
    for (let i = 0; i < 7; i++) {
      const p = h('i', 'puff'); const a = (i / 7) * Math.PI * 2;
      p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * 46 + 'px'); p.style.setProperty('--dy', Math.sin(a) * 30 + 'px');
      $('#fx').appendChild(p); setTimeout(() => p.remove(), 800);
    }
  }
  function floatText(at, text, cls) {
    const c = center(at); const p = h('div', 'float-txt ' + (cls || ''), esc(text));
    p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
    $('#fx').appendChild(p); setTimeout(() => p.remove(), 1300);
  }
  function toast(text) {
    const t = h('div', 'toast', esc(text)); $('#toastWrap').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2300); setTimeout(() => t.remove(), 2800);
  }
  /* ดาวบินจากจุดหนึ่งไปที่ HUD */
  function flyStar(from, toEl, done) {
    const a = center(from), b = center(toEl);
    const s = h('div', 'fly-star', art.starShape(true)); s.style.left = a.x + 'px'; s.style.top = a.y + 'px';
    $('#fx').appendChild(s);
    const mx = (a.x + b.x) / 2 + (Math.random() * 120 - 60), my = Math.min(a.y, b.y) - 90;
    const anim = s.animate([
      { transform: 'translate(-50%,-50%) scale(.3)', offset: 0 },
      { transform: 'translate(calc(-50% + ' + (mx - a.x) + 'px), calc(-50% + ' + (my - a.y) + 'px)) scale(1.3)', offset: 0.45 },
      { transform: 'translate(calc(-50% + ' + (b.x - a.x) + 'px), calc(-50% + ' + (b.y - a.y) + 'px)) scale(.7)', offset: 1 }
    ], { duration: 780, easing: 'cubic-bezier(.4,.1,.3,1)' });
    let fin = false; const end = () => { if (fin) return; fin = true; s.remove(); if (done) done(); };
    anim.onfinish = end; setTimeout(end, 1600);
  }

  /* ── ที่เก็บข้อมูลในเครื่อง (ใช้ได้แม้เข้า localStorage ไม่ได้) ── */
  const KEY = 'bobo_daily_v1';
  let mem = null;
  const store = {
    load() {
      if (mem) return mem;
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
      mem = Object.assign({ grade: 3, music: true, voice: true, vol: 0.8, teacher: false, days: {}, seen: [], recentT: {}, extra: 0, tour: false }, d || {});
      return mem;
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* โหมดส่วนตัว: ใช้ในหน่วยความจำ */ } },
    reset() { mem = null; try { localStorage.removeItem(KEY); } catch (e) { /* ไม่เป็นไร */ } return store.load(); }
  };

  /* ── วันที่ภาษาไทย ── */
  const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const TH_MON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const TH_MON_S = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function thaiDate(d) { return 'วัน' + TH_DAY[d.getDay()] + 'ที่ ' + d.getDate() + ' ' + TH_MON[d.getMonth()] + ' ' + (d.getFullYear() + 543); }

  DC.ui = { $, $$, h, esc, wait, show, restart, shake, boing, sparkle, confetti, puff, floatText, toast, flyStar, center, store, thaiDate, TH_DAY, TH_MON, TH_MON_S };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
