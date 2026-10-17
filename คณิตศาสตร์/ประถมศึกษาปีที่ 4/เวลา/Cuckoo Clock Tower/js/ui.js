/* ═══════════════════════════════════════════════════════════
   CUCKOO CLOCK TOWER — UI helpers
   screens / guide bubble / dialog / particles / overlays
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CT = window.CT;
  const { T, art, audio } = CT;
  const $ = s => document.querySelector(s);

  /* ── ข้อความแบบมีหน่วยเวลา ──
     {min:30}   → "30 นาที" (ระบายสีตามหน่วย)    หน่วย: sec min hr day wk mo yr
     {u:min}    → คำว่า "นาที" สีตามหน่วย
     {t:09.30}  → ป้ายเวลานาฬิกา 09.30 น.
     **x**      → ตัวหนา */
  const UK = 'sec|min|hr|day|wk|mo|yr';
  const RE_DU = new RegExp('\\{(' + UK + '):(\\d+)\\}', 'g');
  const RE_U = new RegExp('\\{u:(' + UK + ')\\}', 'g');
  const RE_T = /\{t:(\d{1,2})\.(\d{2})\}/g;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  const duHTML = (u, n) => '<span class="du" style="--uc:' + T.UNITS[u].col + '"><b>' + T.num(+n) + '</b><i>' + T.UNITS[u].name + '</i></span>';
  const ulHTML = u => '<span class="ul" style="--uc:' + T.UNITS[u].col + '">' + T.UNITS[u].name + '</span>';
  const tHTML = (h, m) => '<span class="tchip">' + T.pad(+h) + '.' + m + '<small>น.</small></span>';
  function rich(s, trustedHTML) {
    s = String(s);
    if (!trustedHTML) s = esc(s);
    return s
      .replace(RE_DU, (m, u, n) => duHTML(u, n))
      .replace(RE_U, (m, u) => ulHTML(u))
      .replace(RE_T, (m, h, mi) => tHTML(h, mi))
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  }
  /* ข้อความสำหรับเสียงพูด */
  function speech(s) {
    return String(s)
      .replace(/<[^>]+>/g, ' ')
      .replace(RE_DU, (m, u, n) => ' ' + n + ' ' + T.UNITS[u].name + ' ')
      .replace(RE_U, (m, u) => ' ' + T.UNITS[u].name + ' ')
      .replace(RE_T, (m, h, mi) => h + '.' + mi + ' น.')
      .replace(/\*\*/g, '')
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
      .replace(/\s>\s/g, ' มากกว่า ').replace(/\s<\s/g, ' น้อยกว่า ').replace(/\s=\s/g, ' เท่ากับ ').replace(/\s\+\s/g, ' บวก ').replace(/\s-\s/g, ' ลบ ')
      .replace(/×/g, ' คูณ ').replace(/÷/g, ' หาร ')
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
  const JELLY_SEL = '.btn, .icon-btn, .chip, .key, .opt, .plate, .pm-card, .cal-d, .op-btn, .tcard, .bd-row, .sk-card, .pl-card, .bucket';
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
  /* วงคลื่นระฆังแผ่ออกจากจุดที่ตอบถูก */
  function ripple(at) {
    const p = at && at.x != null ? at : center(at);
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

  /* ── ผู้นำทาง (กุ๊กกู๊ / เจ้าเฟืองซน) + กล่องคำพูด ── */
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
  const NAMES = { guk: 'กุ๊กกู๊', fon: 'เจ้าเฟืองซน' };
  const G = {
    who: 'guk', text: '', emo: 'talk', autoVoice: true, nextCb: null, tapToNext: false,
    init() {
      $('#gGuk').innerHTML = art.guk('happy');
      $('#gFon').innerHTML = art.fon('smirk');
      $('#bSpeak').innerHTML = art.icon('speaker');
      if (!audio.canSpeak()) $('#bSpeak').hidden = true;
      $('#bSpeak').addEventListener('click', e => { e.stopPropagation(); audio.speak(speech(G.text), { emo: G.emo, who: G.who }); });
      $('#btnNext').addEventListener('click', () => G.fireNext());
      $('#bubble').addEventListener('click', () => { if (G.nextCb && G.tapToNext) G.fireNext(); });
    },
    show() { $('#guide').classList.remove('hidden'); document.body.classList.add('has-guide'); },
    hide() { $('#guide').classList.add('hidden'); document.body.classList.remove('has-guide'); audio.stopSpeak(); },
    mood(m, who) {
      const el = who === 'fon' ? $('#gFon svg') : $('#gGuk svg');
      if (el) el.setAttribute('class', (who === 'fon' ? 'fon' : 'guk') + ' mood-' + m);
    },
    /* o = {who, mood, emo, keepFon, sfx, silent, clip, rest}
       clip = คลิปจากคลังเสียงกลาง (audio.clipLine) เล่นก่อน แล้วอ่าน rest ต่อด้วยเสียงอ่าน */
    say(text, o) {
      o = o || {};
      const who = o.who || 'guk';
      const mood = o.mood || (who === 'fon' ? 'smirk' : 'talk');
      G.who = who; G.text = text; G.emo = o.emo || MOOD_EMO[mood] || 'talk';
      const b = $('#bubble');
      b.classList.toggle('from-fon', who === 'fon');
      $('#bName').textContent = NAMES[who];
      $('#bText').innerHTML = rich(text);
      jelly(b);
      fitGuide();
      if (who === 'fon') {
        $('#gFon').classList.remove('hidden');
        $('#gFon').classList.add('speaking');
        $('#gGuk').classList.remove('speaking');
        G.mood(mood, 'fon');
        if (!o.sfx) audio.sfx('sneaky');
      } else {
        $('#gGuk').classList.add('speaking');
        $('#gFon').classList.remove('speaking');
        if (!o.keepFon) $('#gFon').classList.add('hidden');
        G.mood(mood, 'guk');
        clearTimeout(G._t);
        G._t = setTimeout(() => {
          const svg = $('#gGuk svg');
          if (svg && /mood-talk/.test(svg.getAttribute('class'))) G.mood('happy');
          $('#gGuk').classList.remove('speaking');
        }, 2200);
      }
      if (o.sfx) audio.sfx(o.sfx);
      if (G.autoVoice && !o.silent) {
        /* เจ้าเฟืองซนหัวเราะ: เปิดด้วยเสียงหัวเราะจากคลังกลาง (ตัวป่วน) แล้วอ่านข้อความต่อ */
        let clip = o.clip, rest = o.rest;
        if (!clip && who === 'fon' && mood === 'laugh' && audio.hasClips()) {
          clip = audio.clipLine('trickster', 'taunt', 'laugh');
          rest = text;
          o = Object.assign({}, o, { prefixOnFail: false });
        }
        if (clip) audio.sayClip(clip, speech(rest == null ? '' : rest), { emo: G.emo, who, prefixOnFail: o.prefixOnFail });
        else audio.speak(speech(text), { emo: G.emo, who });
      }
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
          G.say(L.text, { who: L.who, mood: L.mood, keepFon: L.keepFon, sfx: L.sfx });
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

  CT.ui = { $, esc, rich, speech, show, jelly, shake, pulse, restart, center, sparkle, puff, floatText, confetti, ripple, flash, G, openOv, closeOv, toast, wait };
})();
