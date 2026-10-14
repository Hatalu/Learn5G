/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — UI helpers เอฟเฟกต์ ผู้นำทาง (ปิ๊บ / ฟู่ว) และตัวไฮไลต์คำตามเสียง
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { art, audio } = PP;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
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

  /* ── ไฮไลต์คำตามเสียง (karaoke) ──
     el = ตัวห่อข้อความ ; คืนฟังก์ชัน progress(0..1) ที่เปิดไฟทีละคำตามความยาวตัวอักษร */
  function words(text) { return String(text || '').split(/(\s+)/); }
  function karaokeHTML(text, cls) {
    return words(text).map(w => /^\s+$/.test(w) ? w.replace(/\n/g, '<br>') : '<span class="kw ' + (cls || '') + '">' + esc(w) + '</span>').join('');
  }
  function karaoke(root, reset) {
    const ws = Array.from(root.querySelectorAll('.kw'));
    const lens = ws.map(w => w.textContent.length + 1);
    const tot = lens.reduce((a, b) => a + b, 0) || 1;
    return p => {
      let acc = 0;
      ws.forEach((w, i) => { acc += lens[i]; w.classList.toggle('on', p >= 1 || (acc - lens[i] * 0.4) / tot <= p); });
      /* reset = ล้างไฟเมื่อจบ (ใช้กับการ์ดที่ไม่ต้องการให้ทุกคำสว่างค้าง) */
      if (reset && p >= 1) setTimeout(() => ws.forEach(w => w.classList.remove('on')), 350);
    };
  }

  /* ══════════ ผู้นำทาง (แถบล่าง) ══════════
     ข้อความ: อังกฤษตัวใหญ่ + คำแปลไทยตัวเล็กใต้ · ปุ่มลำโพง (ฟังอีกครั้ง) · ปุ่มเต่า (ฟังช้า) */
  const strip = s => String(s || '').trim();
  const guide = {
    last: null,
    token: 0,
    who: 'p',
    init() {
      $('#gSpeak').innerHTML = art.icon('speaker');
      $('#gSlow').innerHTML = art.icon('snail');
      $('#gShow').innerHTML = art.icon('eye');
      $('#gShow').addEventListener('click', () => guide.reveal());
      $('#gSpeak').addEventListener('click', () => { audio.unlock(); if (this.last) this._play(this.last, false, true); });
      $('#gSlow').addEventListener('click', () => { audio.unlock(); if (this.last) this._play(this.last, true, true); });
      this.setChar('p', 'happy');
    },
    setChar(who, mood) {
      this.who = who;
      const el = $('#gChar');
      el.innerHTML = who === 'w' ? art.whoosh(mood === 'talk' ? 'sneaky' : mood) : art.pip(mood);
      el.classList.toggle('is-whoosh', who === 'w');
      $('#guide').classList.toggle('whoosh-talk', who === 'w');
      $('#gName').textContent = who === 'w' ? 'Whoosh · ฟู่ว' : 'Pip · ปิ๊บ';
    },
    react(mood) { this.setChar('p', mood); bounce($('#gChar')); },
    reveal() { $('#gEn').classList.remove('masked'); $('#gShow').classList.add('hidden'); },
    show(on) { $('#guide').classList.toggle('hidden', !on); },
    /* พูดตามรหัสใน LINES หรือ {en, th, id, who, mood} หรือสตริงอังกฤษธรรมดา (th เว้นว่างได้) */
    say(x, mood, fromSeq) {
      if (!fromSeq) this.seqTok++;
      let item;
      if (typeof x === 'string' && PP.LINES[x]) {
        const L = PP.LINES[x];
        item = { id: 'l_' + x, who: L[0], en: L[1], th: L[2], mood };
      } else if (typeof x === 'string') item = { id: null, who: 'p', en: x, th: '', mood };
      else item = Object.assign({ who: 'p', th: '' }, x, { en: x.en != null ? x.en : x.text });
      /* ประโยคที่ไม่มีไฟล์เสียงจริง (fileOnly) แสดงข้อความอย่างเดียว ไม่ใช้เสียงหุ่นยนต์ของเบราว์เซอร์ */
      if (item.fileOnly && !(item.id && audio.has(item.id))) item.silent = true;
      this.last = item;
      return this._play(item, false);
    },
    _play(item, slow, replay) {
      const my = ++this.token;
      const en = $('#gEn');
      en.innerHTML = karaokeHTML(strip(item.en));
      en.classList.toggle('masked', !!item.hide);
      $('#gShow').classList.toggle('hidden', !item.hide);
      $('#gTh').textContent = strip(item.th);
      $('#gTh').classList.toggle('hidden', !item.th);
      const prog = karaoke(en);
      const bub = $('#gBubble');
      bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      this.setChar(item.who, item.who === 'w' ? (item.mood || 'sneaky') : 'talk');
      if (item.name) $('#gName').textContent = item.name;
      if (item.silent) { $('#guide').classList.remove('speaking'); prog(1); return Promise.resolve(); }
      $('#guide').classList.add('speaking');
      const opts = { onProgress: prog, force: !!replay };
      if (slow) opts.rate = 0.7;
      return audio.line(item.id, strip(item.en), item.who === 'w' ? 'whoosh' : 'pip', opts).then(() => {
        if (my !== this.token) return;
        prog(1);
        $('#guide').classList.remove('speaking');
        this.setChar(item.who, item.who === 'w' ? (item.mood || 'sneaky') : (item.mood || 'happy'));
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

  /* ปุ่มลำโพง/เต่าเล็ก ๆ ข้างประโยคในภารกิจ : ui.speakBtns(host, {id, text, who, onProgress}) */
  function speakBtns(host, o) {
    const wrap = h('div', 'sp-btns');
    const a = h('button', 'icon-btn sp-btn silent', art.icon('speaker')); a.type = 'button'; a.setAttribute('aria-label', 'ฟังเสียง');
    const b = h('button', 'icon-btn sp-btn silent slow', art.icon('snail')); b.type = 'button'; b.setAttribute('aria-label', 'ฟังช้า ๆ');
    const run = slow => {
      audio.unlock(); guide.hush();
      a.classList.add('playing');
      audio.play(o.id, o.text, o.who || 'pip', { rate: slow ? 0.7 : 1, onProgress: o.onProgress }).then(() => { a.classList.remove('playing'); if (o.onEnd) o.onEnd(); });
    };
    a.addEventListener('click', () => run(false));
    b.addEventListener('click', () => run(true));
    wrap.append(a, b);
    if (host) host.appendChild(wrap);
    wrap.play = run;
    return wrap;
  }

  PP.ui = { $, h, esc, wait, show, shake, bounce, sparkle, confetti, puff, floatText, toast, center, guide, strip, karaokeHTML, karaoke, speakBtns };
})();
