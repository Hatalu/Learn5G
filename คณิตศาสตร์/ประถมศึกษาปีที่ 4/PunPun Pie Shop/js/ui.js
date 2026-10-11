/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — UI helpers
   screens / speech bubble / dialog / particles / steppers / overlays
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const art = PP.art, F = PP.F, audio = PP.audio;
  const $ = s => document.querySelector(s);

  /* ── ข้อความแบบมีเศษส่วน ──
     {3/4}  → เศษส่วนแนวตั้ง   {2 1/3} → จำนวนคละ   [pie 3/4] → รูปพายจิ๋ว */
  function rich(s, trustedHTML) {
    s = String(s);
    if (!trustedHTML) s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return s
      .replace(/\[PIE (\d+)\/(\d+)( \w+)?\]/g, (m, n, d, fl) => art.pies(+n, +d, { cls: 'illus', flavor: fl ? fl.trim() : 'berry' }))
      .replace(/\[pie (\d+)\/(\d+)\]/g, (m, n, d) => art.miniPie(+n, +d))
      .replace(/\{(\d+) (\d+)\/(\d+)\}/g, (m, w, n, d) => F.mxHTML(w, n, d))
      .replace(/\{(\d+)\/(\d+)\}/g, (m, n, d) => F.frHTML(n, d))
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  }
  function speech(s) {
    return String(s)
      .replace(/\[pie [^\]]*\]/gi, '')
      .replace(/\{(\d+) (\d+)\/(\d+)\}/g, '$1 เศษ $2 ส่วน $3')
      .replace(/\{(\d+)\/(\d+)\}/g, 'เศษ $1 ส่วน $2')
      .replace(/\*\*/g, '')
      .replace(/×/g, ' คูณ ').replace(/÷/g, ' หาร ')
      .replace(/≥/g, ' มากกว่าหรือเท่ากับ ')
      .replace(/>/g, ' มากกว่า ').replace(/</g, ' น้อยกว่า ').replace(/=/g, ' เท่ากับ ');
  }

  /* ── screens ── */
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  }

  /* ── juice: กดปุ่มแล้วเด้งแบบเยลลี่ ── */
  function jelly(el) {
    if (!el) return;
    el.classList.remove('jelly');
    void el.offsetWidth;
    el.classList.add('jelly');
  }
  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }
  function pulse(el, on) {
    if (!el) return;
    el.classList.toggle('guide-pulse', on !== false);
  }
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn, .icon-btn, .chip-btn');
    if (b && !b.disabled) jelly(b);
  });

  /* ── particles ── */
  function center(el) {
    if (!el || !el.getBoundingClientRect) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function sparkle(at, count) {
    const p = at && at.x != null ? at : center(at);
    const fx = $('#fx');
    const n = count || 14;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'spark' + (i % 3 === 0 ? ' big' : '');
      const a = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 90;
      s.style.left = p.x + 'px';
      s.style.top = p.y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      s.style.setProperty('--h', ['#ffd36e', '#ff9fb2', '#9fe0c6', '#a9c8ff', '#fff3b0'][i % 5]);
      s.innerHTML = art.star(true);
      fx.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }
  function puff(at) {
    const p = at && at.x != null ? at : center(at);
    const fx = $('#fx');
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('div');
      s.className = 'puff';
      const a = i / 7 * Math.PI * 2;
      s.style.left = p.x + 'px';
      s.style.top = p.y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * 40 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 40 + 'px');
      fx.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }
  function floatText(at, html, cls) {
    const p = at && at.x != null ? at : center(at);
    const s = document.createElement('div');
    s.className = 'float-txt ' + (cls || '');
    s.innerHTML = html;
    s.style.left = p.x + 'px';
    s.style.top = p.y + 'px';
    $('#fx').appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
  function confetti() {
    const fx = $('#fx');
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div');
      s.className = 'confetti';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = ['#ff9fb2', '#ffd36e', '#9fe0c6', '#a9c8ff', '#c9b3ec'][i % 5];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      fx.appendChild(s);
      setTimeout(() => s.remove(), 2800);
    }
  }

  /* ── ผู้นำทาง (ปันปัน / มิกซ์) + กล่องคำพูด ── */
  const G = {
    who: 'pp',
    text: '',
    autoVoice: false,
    nextCb: null,

    init() {
      $('#gPP').innerHTML = art.punpun('happy');
      $('#gMix').innerHTML = art.mix('smirk');
      $('#bSpeak').innerHTML = art.icon('speaker');
      if (!audio.canSpeak()) $('#bSpeak').hidden = true;
      $('#bSpeak').addEventListener('click', e => { e.stopPropagation(); audio.speak(speech(G.text)); });
      $('#btnNext').addEventListener('click', () => G.fireNext());
      $('#bubble').addEventListener('click', () => { if (G.nextCb && G.tapToNext) G.fireNext(); });
    },
    show() { $('#guide').classList.remove('hidden'); document.body.classList.add('has-guide'); },
    hide() { $('#guide').classList.add('hidden'); document.body.classList.remove('has-guide'); audio.stopSpeak(); },
    mood(m, who) {
      const el = who === 'mix' ? $('#gMix svg') : $('#gPP svg');
      if (!el) return;
      const base = who === 'mix' ? 'mixc' : 'pp';
      el.setAttribute('class', base + ' mood-' + m);
    },
    say(text, o) {
      o = o || {};
      const who = o.who || 'pp';
      G.who = who;
      G.text = text;
      const b = $('#bubble');
      b.classList.toggle('from-mix', who === 'mix');
      $('#bName').textContent = who === 'mix' ? 'มิกซ์' : 'ปันปัน';
      $('#bText').innerHTML = rich(text);
      jelly(b);
      if (who === 'mix') {
        $('#gMix').classList.remove('hidden');
        $('#gMix').classList.add('speaking');
        $('#gPP').classList.remove('speaking');
        G.mood(o.mood || 'smirk', 'mix');
        audio.sfx('mix');
      } else {
        $('#gPP').classList.add('speaking');
        $('#gMix').classList.remove('speaking');
        if (!o.keepMix) $('#gMix').classList.add('hidden');
        G.mood(o.mood || 'talk', 'pp');
        clearTimeout(G._t);
        G._t = setTimeout(() => {
          const svg = $('#gPP svg');
          if (svg && /mood-talk/.test(svg.getAttribute('class'))) G.mood('happy');
        }, 1600);
      }
      if (G.autoVoice) audio.speak(speech(text));
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
    /* lines: [{who, text, mood}] → Promise */
    dialog(lines) {
      return new Promise(resolve => {
        let i = 0;
        const step = () => {
          if (i >= lines.length) { resolve(); return; }
          const L = lines[i++];
          G.say(L.text, { who: L.who, mood: L.mood, keepMix: L.keepMix });
          if (L.show && G.onShow) G.onShow(L.show);
          G.setNext(i >= lines.length ? (L.last || 'ไปกันเลย') : 'ต่อไป', step, true);
        };
        step();
      });
    }
  };

  /* ── ปุ่มเพิ่ม/ลดตัวเลข (กดค้างได้) ── */
  function stepper(o) {
    o = o || {};
    let v = o.value == null ? 0 : o.value;
    const min = o.min == null ? 0 : o.min, max = o.max == null ? 30 : o.max;
    const el = document.createElement('div');
    el.className = 'stepper ' + (o.cls || '');
    el.innerHTML = '<button class="st-btn st-minus" aria-label="ลด">' + art.icon('minus') + '</button>' +
      '<output class="st-val">' + v + '</output>' +
      '<button class="st-btn st-plus" aria-label="เพิ่ม">' + art.icon('plus') + '</button>';
    const out = el.querySelector('output');
    const set = (nv, silent) => {
      nv = Math.max(min, Math.min(max, nv));
      if (nv === v && !silent) { shake(out); return; }
      v = nv;
      out.textContent = v;
      if (!silent) { audio.sfx('tick'); jelly(out); }
      if (o.onChange && !silent) o.onChange(v);
    };
    const hold = (btn, dv) => {
      let timer = null, rep = null;
      const stop = () => { clearTimeout(timer); clearInterval(rep); };
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        set(v + dv);
        timer = setTimeout(() => { rep = setInterval(() => set(v + dv), 110); }, 420);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, stop));
    };
    hold(el.querySelector('.st-minus'), -1);
    hold(el.querySelector('.st-plus'), +1);
    return { el, get: () => v, set: x => set(x, true), disable(d) { el.classList.toggle('disabled', !!d); } };
  }

  /* ── ป้ายเขียนเศษส่วน / จำนวนคละ ──
     o = { whole: {value}|null, n: {value}, d: {value, fixed} } */
  function fracInput(o) {
    const el = document.createElement('div');
    el.className = 'frac-input';
    let W = null, N, D = null;
    if (o.whole) {
      W = stepper({ value: o.whole.value || 0, max: o.whole.max || 20, cls: 'st-whole' });
      const wrap = document.createElement('div');
      wrap.className = 'fi-whole';
      wrap.appendChild(W.el);
      el.appendChild(wrap);
    }
    const col = document.createElement('div');
    col.className = 'fi-col';
    N = stepper({ value: o.n.value || 0, max: o.n.max || 30 });
    col.appendChild(N.el);
    const bar = document.createElement('div');
    bar.className = 'fi-bar';
    col.appendChild(bar);
    if (o.d.fixed) {
      const fx = document.createElement('div');
      fx.className = 'fi-fixed';
      fx.textContent = o.d.value;
      col.appendChild(fx);
    } else {
      D = stepper({ value: o.d.value || 1, min: 1, max: o.d.max || 30 });
      col.appendChild(D.el);
    }
    el.appendChild(col);
    return {
      el,
      get: () => ({ w: W ? W.get() : 0, n: N.get(), d: D ? D.get() : o.d.value }),
      disable(x) { el.classList.toggle('disabled', !!x); }
    };
  }

  /* ── overlays ── */
  function openOv(id) { const o = $(id); o.classList.remove('hidden'); jelly(o.querySelector('.ov-card')); }
  function closeOv(id) { $(id).classList.add('hidden'); }

  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = rich(html);
    $('#toastWrap').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2700);
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  PP.ui = { $, rich, speech, show, jelly, shake, pulse, center, sparkle, puff, floatText, confetti, G, stepper, fracInput, openOv, closeOv, toast, wait };
})();
