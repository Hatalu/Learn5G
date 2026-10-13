/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — UI helpers, เอฟเฟกต์ และผู้นำทาง (แท่งแท่ง / มึนมึน)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT;
  const { art, audio } = TT;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  }
  function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function bounce(el) { if (!el) return; el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); }

  /* ── เอฟเฟกต์อนุภาค ── */
  const fx = () => $('#fx');
  function center(el) {
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    if (el.x != null) return el;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const SPARK = ['#ffcf3f', '#ff8fb1', '#7df9ff', '#3fd6a8', '#a98bff', '#fff'];
  function sparkle(at, n) {
    const c = center(at);
    n = n || 14;
    for (let i = 0; i < n; i++) {
      const p = h('i', 'spark');
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
      p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.setProperty('--c', SPARK[i % SPARK.length]);
      p.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
      p.style.animationDelay = (Math.random() * 0.08) + 's';
      fx().appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }
  function confetti(n) {
    n = n || 70;
    for (let i = 0; i < n; i++) {
      const p = h('i', 'confetti');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--c', SPARK[i % SPARK.length]);
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = Math.random() * 0.5 + 's';
      if (i % 3 === 0) p.classList.add('tri');
      fx().appendChild(p);
      setTimeout(() => p.remove(), 3800);
    }
  }
  function puff(at) {
    const c = center(at);
    for (let i = 0; i < 7; i++) {
      const p = h('i', 'puff');
      const a = (i / 7) * Math.PI * 2;
      p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * 46 + 'px');
      p.style.setProperty('--dy', Math.sin(a) * 30 + 'px');
      fx().appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }
  function floatText(at, text, cls) {
    const c = center(at);
    const p = h('div', 'float-txt ' + (cls || ''), esc(text));
    p.style.left = c.x + 'px'; p.style.top = c.y + 'px';
    fx().appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
  function toast(text, kind) {
    const t = h('div', 'toast ' + (kind || ''), esc(text));
    $('#toastWrap').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2300);
    setTimeout(() => t.remove(), 2800);
  }

  /* ══════════ ผู้นำทาง (แถบล่าง) ══════════ */
  const strip = s => String(s || '').replace(/\[[^\]]*\]/g, '').trim();
  const guide = {
    last: null,
    token: 0,
    who: 't',
    init() {
      $('#gSpeak').innerHTML = art.icon('speaker');
      $('#gSpeak').addEventListener('click', () => { audio.unlock(); if (this.last) this._play(this.last); });
      this.setChar('t', 'happy');
    },
    setChar(who, mood) {
      this.who = who;
      const el = $('#gChar');
      el.innerHTML = who === 'm' ? art.muen(mood === 'talk' ? 'sneaky' : mood) : art.tang(mood);
      el.classList.toggle('is-muen', who === 'm');
      $('#guide').classList.toggle('muen-talk', who === 'm');
      $('#gName').textContent = who === 'm' ? 'มึนมึน' : 'แท่งแท่ง';
    },
    react(mood) { this.setChar('t', mood); bounce($('#gChar')); },
    show(on) { $('#guide').classList.toggle('hidden', !on); },
    /* พูดตาม id ใน LINES หรือ {text, who, mood, voice} หรือสตริงธรรมดา */
    say(x, mood, fromSeq) {
      if (!fromSeq) this.seqTok++;
      let item;
      if (typeof x === 'string' && TT.LINES[x]) {
        const L = TT.LINES[x];
        item = { id: x, who: L[0], text: L[1], voice: L[2] || L[1], mood };
      } else if (typeof x === 'string') {
        item = { id: null, who: 't', text: x, voice: x, mood };
      } else item = Object.assign({ who: 't' }, x, { voice: x.voice || x.text });
      this.last = item;
      return this._play(item);
    },
    _play(item) {
      const my = ++this.token;
      $('#gText').textContent = strip(item.text);
      const bub = $('#gBubble');
      bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      this.setChar(item.who, item.who === 'm' ? (item.mood || 'sneaky') : 'talk');
      $('#guide').classList.add('speaking');
      return audio.line(item.id, item.voice, item.who).then(() => {
        if (my !== this.token) return;
        $('#guide').classList.remove('speaking');
        this.setChar(item.who, item.who === 'm' ? (item.mood || 'sneaky') : (item.mood || 'happy'));
      });
    },
    seqTok: 0,
    async seq(ids) {
      const my = ++this.seqTok;
      for (const id of ids) {
        if (my !== this.seqTok) return false;
        await this.say(id, undefined, true);
        if (my !== this.seqTok) return false;
        await wait(250);
      }
      return my === this.seqTok;
    },
    hush() { this.token++; this.seqTok++; audio.stopVoice(); $('#guide').classList.remove('speaking'); }
  };

  TT.ui = { $, h, esc, wait, show, shake, bounce, sparkle, confetti, puff, floatText, toast, center, guide, strip };
})();
