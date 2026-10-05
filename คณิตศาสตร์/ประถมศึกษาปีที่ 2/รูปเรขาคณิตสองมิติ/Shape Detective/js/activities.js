/* ==========================================================================
   SHAPE DETECTIVE — Activity engine
   Every mechanic exists for a learning purpose:
   lens(O1) find+proof(O2) sort(O3) scan(O2,O3) arrange(O5) stretch(O3)
   compare(O4) draw(O5) combine(O1,O3) deduce(O2-O4) countlab(O2)
   ========================================================================== */
(function () {
  'use strict';
  const SD = window.SD;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------------- requirement logic (CLUE → PROOF) ---------------- */
  function reqText(r) {
    switch (r.k) {
      case 'sides': return `มี ${r.v} ด้าน`;
      case 'corners': return r.v === 0 ? 'ไม่มีมุม' : `มี ${r.v} มุม`;
      case 'curved': return r.v ? 'เป็นเส้นโค้ง' : 'มีแต่เส้นตรง ไม่มีเส้นโค้ง';
      case 'round': return r.v ? 'กลม กว้างเท่ากับสูง' : 'ยาวกับกว้างไม่เท่ากัน';
      case 'cornersGt': return `มีมุมมากกว่า ${r.v} มุม`;
      case 'sidesLt': return `มีด้านน้อยกว่า ${r.v} ด้าน`;
      default: return '';
    }
  }
  function foundText(r, type) {
    const s = SD.SHAPES[type];
    switch (r.k) {
      case 'sides': case 'sidesLt': return s.curved ? 'ไม่มีด้านตรง' : `${s.sides} ด้าน`;
      case 'corners': case 'cornersGt': return s.corners ? `${s.corners} มุม` : 'ไม่มีมุม';
      case 'curved': return s.curved ? 'เป็นเส้นโค้ง' : 'เป็นเส้นตรง';
      case 'round': return s.curved ? (s.round ? 'กว้าง = สูง' : 'กว้าง ≠ สูง') : 'มีมุม ไม่ใช่รูปโค้ง';
      default: return '';
    }
  }
  function test(r, type) {
    const s = SD.SHAPES[type];
    switch (r.k) {
      case 'sides': return !s.curved && s.sides === r.v;
      case 'corners': return s.corners === r.v;
      case 'curved': return s.curved === r.v;
      case 'round': return !!s.curved && s.round === r.v;
      case 'cornersGt': return s.corners > r.v;
      case 'sidesLt': return s.sides < r.v;
      default: return false;
    }
  }
  const matchAll = (req, type) => req.every(r => test(r, type));
  function misCategory(req, type) {
    const s = SD.SHAPES[type];
    if (req.some(r => r.k === 'round') && s.curved) return 'circleEllipse';
    if (req.some(r => (r.k === 'sides' || r.k === 'corners') && r.v > 0) && !s.curved) return 'sides';
    return 'general';
  }

  /* ---------------- helpers ---------------- */
  function svgPt(svg, e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const r = p.matrixTransform(m.inverse()); return { x: r.x, y: r.y };
  }
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const P = pts => pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');

  /** Drag & drop + tap-to-select fallback (kids with small fingers) */
  function dnd(cfg) {
    let selected = null;
    const { container, itemSel, targetSel } = cfg;
    const targetAt = ev => { const t = document.elementFromPoint(ev.clientX, ev.clientY); return t && t.closest ? t.closest(targetSel) : null; };
    let overEl = null;
    const setOver = t => { if (overEl === t) return; overEl && overEl.classList.remove('over'); overEl = t; t && t.classList.add('over'); };
    function onDown(e) {
      const it = e.target.closest(itemSel);
      if (!it || it.classList.contains('used') || e.target.closest('.rot-btn')) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY; let ghost = null;
      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
          ghost = it.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.classList.remove('selected');
          ghost.style.width = it.offsetWidth + 'px'; ghost.style.height = it.offsetHeight + 'px';
          document.body.appendChild(ghost); it.style.opacity = '.3';
        }
        if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; setOver(targetAt(ev)); }
      };
      const up = ev => {
        window.removeEventListener('pointermove', move);
        if (ghost) {
          ghost.remove(); it.style.opacity = ''; const t = targetAt(ev); setOver(null);
          if (selected) { selected.classList.remove('selected'); selected = null; }
          if (t) cfg.onDrop(it, t);
        } else {
          if (selected === it) { it.classList.remove('selected'); selected = null; }
          else { selected && selected.classList.remove('selected'); selected = it; it.classList.add('selected'); SD.Audio.play('click'); cfg.onSelect && cfg.onSelect(it); }
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
    }
    function onClick(e) {
      const t = e.target.closest(targetSel);
      if (t && selected) { const it = selected; selected.classList.remove('selected'); selected = null; cfg.onDrop(it, t); }
    }
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('click', onClick);
    return { get selected() { return selected; } };
  }

  /* ======================================================================
     PROOF — Shape Lens close-up: child counts sides & corners as evidence
     ====================================================================== */
  function Proof(container, o, opts) {
    const S = SD.SHAPES[o.shape], api = opts.api;
    container.innerHTML = `
      <div class="proof">
        <div class="proof-stage"><div class="lens-ring"></div><svg viewBox="0 0 500 430"></svg></div>
        <div class="proof-side-panel">
          ${opts.req ? `<div class="mc-witness">${opts.witness || ''}</div>` : ''}
          <div class="step-instr"></div>
          <div class="counters"><div class="counter sides">ด้าน (เส้นตรง)<b>0</b></div><div class="counter corners">มุม<b>0</b></div></div>
          <div class="ev"></div>
          <div class="proof-actions"></div>
        </div>
      </div>`;
    const svg = container.querySelector('svg'), instr = container.querySelector('.step-instr');
    const sidesB = container.querySelector('.counter.sides b'), cornersB = container.querySelector('.counter.corners b');
    const ev = container.querySelector('.ev'), actions = container.querySelector('.proof-actions');
    const s = Math.min(330 / o.w, 290 / o.h), W = o.w * s, H = o.h * s, cx = 250, cy = 215;
    let html = '';
    let pts = null;
    if (!S.curved) {
      pts = SD.worldPoints({ shape: o.shape, x: cx, y: cy, w: W, h: H, rot: o.rot || 0 });
      html += `<polygon points="${P(pts)}" fill="${o.fill || S.color}" fill-opacity=".35"/>`;
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % pts.length];
        html += `<g class="proof-side" data-i="${i}"><line class="hit" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/><line class="vis" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/></g>`;
      });
      pts.forEach((p, i) => { html += `<g class="proof-corner" data-i="${i}" style="display:none"><circle class="hit" cx="${p[0]}" cy="${p[1]}" r="30"/><circle class="c" cx="${p[0]}" cy="${p[1]}" r="14"/></g>`; });
    } else {
      const tr = `transform="rotate(${o.rot || 0} ${cx} ${cy})"`;
      html += `<g class="proof-curve"><ellipse class="vis" cx="${cx}" cy="${cy}" rx="${W / 2}" ry="${H / 2}" ${tr} fill="${o.fill || S.color}" fill-opacity=".35" stroke="#90a4ae" stroke-width="10"/><ellipse cx="${cx}" cy="${cy}" rx="${W / 2}" ry="${H / 2}" ${tr} fill="none" stroke="transparent" stroke-width="44"/></g><g class="measure"></g>`;
    }
    html += '<g class="tags"></g>';
    svg.innerHTML = html;
    const tags = svg.querySelector('.tags');
    const tag = (x, y, t, color) => { const e = document.createElementNS(NS, 'text'); e.setAttribute('x', x); e.setAttribute('y', y); e.setAttribute('text-anchor', 'middle'); e.setAttribute('dominant-baseline', 'middle'); e.setAttribute('class', 'num-tag'); if (color) e.style.fill = color; e.textContent = t; tags.appendChild(e); };
    const out = (x, y, d) => { const dx = x - cx, dy = y - cy, m = Math.hypot(dx, dy) || 1; return [x + dx / m * d, y + dy / m * d]; };

    let sides = 0, corners = 0;
    const say = (t, mood) => api.say(t, mood);

    function markNext() {
      if (!opts.autoHint) return;
      svg.querySelectorAll('.proof-side').forEach(g => g.classList.remove('next'));
      const n = svg.querySelector('.proof-side:not(.counted)'); n && n.classList.add('next');
    }

    if (!S.curved) {
      instr.innerHTML = '👆 ขั้นที่ 1: แตะ <b style="color:#1e88e5">เส้นตรง</b> ทีละเส้นเพื่อนับด้าน';
      say('ใช้ Shape Lens ตรวจหลักฐาน! แตะเส้นตรงแต่ละเส้นเพื่อนับด้าน', 'think');
      markNext();
      svg.querySelectorAll('.proof-side').forEach(g => g.addEventListener('click', () => {
        if (g.classList.contains('counted')) return;
        g.classList.add('counted'); sides++; sidesB.textContent = sides; SD.Audio.play('count', sides);
        const i = +g.dataset.i, p = pts[i], q = pts[(i + 1) % pts.length];
        const [tx, ty] = out((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 30); tag(tx, ty, sides, '#1e88e5');
        markNext();
        if (sides === pts.length) {
          instr.innerHTML = '👆 ขั้นที่ 2: แตะ <b style="color:#e53935">มุม</b> (จุดที่เส้นตรงสองเส้นมาชนกัน)';
          say(`นับได้ ${sides} ด้านแล้ว! ต่อไปแตะมุม ตรงจุดที่เส้นตรงสองเส้นมาชนกัน`, 'happy');
          svg.querySelectorAll('.proof-corner').forEach(c => { c.style.display = ''; c.classList.add('wait'); });
        }
      }));
      svg.querySelectorAll('.proof-corner').forEach(g => g.addEventListener('click', () => {
        if (g.classList.contains('counted')) return;
        g.classList.add('counted'); g.classList.remove('wait'); corners++; cornersB.textContent = corners; SD.Audio.play('count', corners + 2);
        const p = pts[+g.dataset.i], [tx, ty] = out(p[0], p[1], 40); tag(tx, ty, corners, '#e53935');
        if (corners === pts.length) setTimeout(verdict, 350);
      }));
    } else {
      instr.innerHTML = '👆 ขั้นที่ 1: แตะเส้นรอบรูป เส้นนี้ตรงหรือโค้ง?';
      say('รูปนี้แปลกนะ ลองแตะเส้นรอบรูปดูสิ ว่าเป็นเส้นตรงหรือเส้นโค้ง', 'think');
      const curve = svg.querySelector('.proof-curve');
      curve.addEventListener('click', () => {
        if (curve.classList.contains('counted')) return;
        curve.classList.add('counted'); SD.Audio.play('count', 3);
        tag(cx, cy - H / 2 - 30, 'เส้นโค้ง 1 เส้น', '#ff7a1a');
        sidesB.textContent = '0';
        instr.innerHTML = '🔍 ขั้นที่ 2: ลองหามุมดู มีจุดไหนที่เส้นหักเป็นมุมไหม?';
        say('เป็นเส้นโค้งเส้นเดียวต่อกันรอบรูป ไม่มีเส้นตรงเลย ลองหาดูว่ามีมุมไหม?', 'think');
        actions.innerHTML = '<button class="btn btn-teal" data-a="nocorner">ไม่พบมุมเลย ✔</button>';
        actions.querySelector('[data-a]').onclick = () => {
          cornersB.textContent = '0'; SD.Audio.play('pop');
          instr.innerHTML = '📏 ขั้นที่ 3: วัดความกว้างและความสูง';
          say('ถูกต้อง ไม่มีมุมเลย! ต่อไปวัดความกว้างกับความสูง เพื่อดูว่ากลมเท่ากันไหม', 'happy');
          actions.innerHTML = '<button class="btn btn-orange" data-a="measure">📏 วัดเลย</button>';
          actions.querySelector('[data-a]').onclick = measure;
        };
      });
    }

    let wU = 0, hU = 0;
    function measure() {
      SD.Audio.play('scan');
      const g = svg.querySelector('.measure'), r = o.rot || 0;
      const [ax, ay] = SD.rotPt(W / 2, 0, r), [bx, by] = SD.rotPt(0, H / 2, r);
      wU = Math.round(o.w / 10); hU = Math.round(o.h / 10);
      g.innerHTML = `<line x1="${cx - ax}" y1="${cy - ay}" x2="${cx + ax}" y2="${cy + ay}" stroke="#1e88e5" stroke-width="6" stroke-dasharray="12 8"/>
        <line x1="${cx - bx}" y1="${cy - by}" x2="${cx + bx}" y2="${cy + by}" stroke="#e53935" stroke-width="6" stroke-dasharray="12 8"/>`;
      tag(cx + ax * 0.55, cy + ay * 0.55 - 22, `กว้าง ${wU}`, '#1e88e5');
      tag(cx + bx * 0.55 + 46, cy + by * 0.55, `สูง ${hU}`, '#e53935');
      actions.innerHTML = '';
      setTimeout(verdict, 700);
    }

    function verdict() {
      SD.Audio.play('scan');
      if (!opts.req) {
        ev.innerHTML = `<div class="verdict ok">${SD.shapeIcon(o.shape, 44, o.fill)}<br>นี่คือ ${S.th}<br><small>${SD.describe(o.shape)}</small></div>`;
        say(`นี่คือ${S.th} เพราะ${SD.describe(o.shape)}`, 'happy');
        actions.innerHTML = '<button class="btn btn-green">ต่อไป ▶</button>';
        actions.querySelector('button').onclick = () => opts.onDone(true);
        instr.innerHTML = '✅ ตรวจหลักฐานครบแล้ว';
        return;
      }
      instr.innerHTML = '⚖️ เทียบหลักฐานกับคำให้การของพยาน';
      const rows = opts.req.map(r => ({ r, ok: test(r, o.shape) }));
      const allOk = rows.every(x => x.ok);
      ev.innerHTML = `<table class="evidence-table">${rows.map((x, i) => `<tr class="${x.ok ? 'ok' : 'no'}" style="animation-delay:${i * .25}s"><td>พยาน: <b>${reqText(x.r)}</b></td><td>พบ: <b>${foundText(x.r, o.shape)}</b></td><td>${x.ok ? '✅' : '❓'}</td></tr>`).join('')}</table>
        <div class="verdict ${allOk ? 'ok' : 'no'}" style="margin-top:.4rem">${allOk ? `หลักฐานตรงกัน! นี่คือ ${S.th}` : 'หลักฐานบางอย่างยังไม่ตรง'}</div>`;
      if (allOk) {
        SD.Audio.play('success');
        say(`ใช่แล้ว! เธอสังเกตได้ถูกต้อง เพราะ${o.label || 'สิ่งนี้'}${SD.describe(o.shape)} ตรงกับคำให้การ`, 'happy');
        actions.innerHTML = '<button class="btn btn-green">💼 เก็บเข้าถุงหลักฐาน</button>';
        actions.querySelector('button').onclick = () => opts.onDone(true);
      } else {
        SD.Audio.play('soft');
        const bad = rows.find(x => !x.ok);
        say(`ไม่เป็นไรนะ นักสืบตัวจริงก็ต้องตรวจหลายครั้ง พยานบอกว่า "${reqText(bad.r)}" แต่สิ่งนี้ ${foundText(bad.r, o.shape)} ลองหาสิ่งอื่นดู`, 'soft');
        actions.innerHTML = '<button class="btn btn-orange">🔍 กลับไปสืบต่อ</button>';
        actions.querySelector('button').onclick = () => opts.onDone(false);
      }
    }
  }

  /* ======================================================================
     ACTIVITIES
     ====================================================================== */
  const A = {};

  /* ---- LENS: WOW 1 — the whole town reveals its shapes ---- */
  A.lens = function (step, api) {
    const need = step.need || 3, found = new Set();
    api.progress(`ค้นพบแล้ว 0/${need}`);
    if (!api.lensOn()) api.pulseTool('lens', true);
    api.onLens(on => {
      if (on) { api.pulseTool('lens', false); api.say('ว้าว! เห็นไหม ทุกอย่างในเมืองคือรูปเรขาคณิต! เส้นตรงเรืองแสงสีฟ้า เส้นโค้งเรืองแสงสีส้ม ลองแตะสิ่งของ 3 ชิ้นดูสิ', 'happy'); }
    });
    api.setSceneHandler((o, node) => {
      if (!api.lensOn()) { api.say('เปิด Shape Lens ก่อนนะ แล้วจะเห็นความลับของรูปทรง', 'think'); api.pulseTool('lens', true); return; }
      api.scanCard(o, node);
      if (found.has(o.label)) return;
      found.add(o.label); api.progress(`ค้นพบแล้ว ${found.size}/${need}`); api.record(true);
      if (found.size >= need) {
        api.setSceneHandler((o2, n2) => api.scanCard(o2, n2));
        setTimeout(() => api.complete('เยี่ยมมาก! เธอค้นพบแล้วว่าสิ่งของทุกชิ้นในเมืองสร้างจากรูปเรขาคณิต บางรูปมีเส้นตรงและมุม บางรูปเป็นเส้นโค้งไม่มีมุม'), 1400);
      }
    });
    return {
      hint(l) { if (l >= 2) { if (!api.lensOn()) api.pulseTool('lens', true); else api.highlight(() => true, 3); } }
    };
  };

  /* ---- FIND: witness clue → pick → PROOF with Shape Lens ---- */
  A.find = function (step, api) {
    const hard = step.hard && api.isStrong();
    const witness = hard ? step.hard.witness : step.witness, req = hard ? step.hard.req : step.req;
    api.setWitness(witness);
    if (hard) api.toast('🌟 โจทย์ระดับนักสืบตัวจริง!');
    api.setSceneHandler((o, node) => {
      node.classList.add('picked'); setTimeout(() => node.classList.remove('picked'), 500);
      SD.Audio.play('lens');
      const body = api.openPanel(`🔍 Shape Lens: ตรวจ “${o.label}”`, { single: true, closable: true });
      Proof(body, o, {
        api, req, witness, autoHint: api.mis('sides') >= 2,
        onDone(ok) {
          api.closePanel();
          if (ok) {
            api.record(true); api.addEvidence(o); api.learn(o.shape);
            api.complete(`ใช่แล้ว! ${o.label}${SD.describe(o.shape)} จึงเป็น${SD.SHAPES[o.shape].th} ตรงกับคำให้การของพยาน`, o.shape);
          } else {
            api.record(false); api.mistake(misCategory(req, o.shape));
            api.say('หลักฐานบางอย่างยังไม่ตรง ลองอ่านคำให้การอีกครั้ง แล้วหาสิ่งอื่นดูนะ (ถ้าอยากได้ตัวช่วย กด 💡 คำใบ้)', 'soft');
          }
        }
      });
    });
    return { hint(l) { if (l >= 2) api.highlight(o => matchAll(req, o.shape), 2); } };
  };

  /* ---- SORT: evidence crates polygon / circle / ellipse ---- */
  A.sort = function (step, api) {
    const body = api.openPanel('💼 ' + step.title, { closable: true });
    const crates = [
      { g: 'polygon', h: 'รูปหลายเหลี่ยม', p: 'มีเส้นตรง มีมุม', icon: 'pentagon', bg: '#bbdefb' },
      { g: 'circle', h: 'รูปวงกลม', p: 'ไม่มีมุม กลมเท่ากันทุกทาง', icon: 'circle', bg: '#c8e6c9' },
      { g: 'ellipse', h: 'รูปวงรี', p: 'ไม่มีมุม ยาวกับกว้างไม่เท่ากัน', icon: 'ellipse', bg: '#f8bbd0' }
    ];
    const items = shuffle(step.items.map((it, i) => Object.assign({ i }, it)));
    body.innerHTML = `<div class="sort-wrap">
      <div class="crates">${crates.map(c => `<div class="crate" data-g="${c.g}" style="background:linear-gradient(${c.bg},#c99a5e)"><h4>${SD.shapeIcon(c.icon, 28)} ${c.h}</h4><p>${c.p}</p><div class="in"></div></div>`).join('')}</div>
      <div class="tray">${items.map(it => `<div class="item-card" data-i="${it.i}">${SD.shapeIcon(it.shape, 80, it.fill)}<div>${it.label}</div></div>`).join('')}</div></div>`;
    api.say(step.say);
    let left = items.length;
    dnd({
      container: body, itemSel: '.item-card', targetSel: '.crate',
      onSelect(it) { const d = step.items[+it.dataset.i]; api.say(`เลือก "${d.label}" แล้ว แตะลังที่ถูกต้อง หรือลากไปวางได้เลย`); },
      onDrop(itEl, crate) {
        const d = step.items[+itEl.dataset.i], S = SD.SHAPES[d.shape];
        if (S.group === crate.dataset.g) {
          SD.Audio.play('pop'); api.record(true); api.learn(d.shape);
          crate.querySelector('.in').insertAdjacentHTML('beforeend', `<span class="mini">${SD.shapeIcon(d.shape, 38, d.fill)}</span>`);
          itEl.remove(); left--;
          api.say(`✓ ${d.label}: ${SD.describe(d.shape)} → ${SD.GROUPS[S.group].th}`, 'good');
          if (left === 0) setTimeout(() => api.complete('จัดหลักฐานครบแล้ว! รูปหลายเหลี่ยมมีเส้นตรงและมุม วงกลมกับวงรีไม่มีมุม แต่วงกลมกลมเท่ากันทุกทาง ส่วนวงรียาวกว่า'), 700);
        } else {
          SD.Audio.play('soft'); api.record(false);
          itEl.classList.add('shake'); setTimeout(() => itEl.classList.remove('shake'), 500);
          let msg;
          if (S.curved && crate.dataset.g !== 'polygon') { msg = `${d.label}ไม่มีมุมจริงๆ แต่ลองดูอีกที ${S.round ? 'มันกลมเท่ากันทุกทางนะ' : 'มันยาวกับกว้างไม่เท่ากันนะ'}`; api.mistake('circleEllipse'); }
          else if (S.curved) { msg = `ลองดู${d.label}อีกครั้ง มีมุมไหม? เส้นของมันตรงหรือโค้ง?`; api.mistake('general'); }
          else { msg = `${d.label}มีเส้นตรงและมี ${S.corners} มุมนะ ลองดูป้ายบนลังอีกครั้ง`; api.mistake('general'); }
          api.say(msg, 'soft');
        }
      }
    });
    return {
      hint(l) {
        if (l >= 2) {
          const first = body.querySelector('.item-card'); if (!first) return;
          const d = step.items[+first.dataset.i];
          first.classList.add('selected');
          const c = body.querySelector(`.crate[data-g="${SD.SHAPES[d.shape].group}"]`);
          c.classList.add('hint-glow'); setTimeout(() => c.classList.remove('hint-glow'), 2500);
        }
      }
    };
  };

  /* ---- SCAN: lights out — Clue Scanner spotlight ---- */
  A.scan = function (step, api) {
    const svg = api.scene, need = step.need || 3;
    api.setWitness(step.witness);
    api.setSceneHandler(null);
    svg.classList.add('scan-mode');
    const layer = document.createElementNS(NS, 'g'); layer.setAttribute('id', 'scan-layer');
    const hid = step.hidden.map((h, i) => Object.assign({ i, h: h.h || h.w, fill: '#fff59d' }, h));
    layer.innerHTML = `
      <defs><mask id="scanmask"><rect width="1600" height="900" fill="#fff"/><circle id="scanhole" cx="800" cy="450" r="150" fill="#000"/></mask></defs>
      ${hid.map(h => `<g class="hid" data-i="${h.i}" style="cursor:pointer">${SD.shapeEl(Object.assign({}, h, { fill: '#e0f7fa', stroke: '#00acc1', sw: 6 }))}</g>`).join('')}
      <rect class="dark" width="1600" height="900" fill="#0d1030" opacity=".94" mask="url(#scanmask)" style="pointer-events:none;transition:opacity 1s"/>
      <circle id="scanring" cx="800" cy="450" r="150" fill="none" stroke="#4dd0e1" stroke-width="8" stroke-dasharray="20 10" style="pointer-events:none"/>`;
    svg.appendChild(layer);
    const hole = layer.querySelector('#scanhole'), ring = layer.querySelector('#scanring');
    const move = e => { const p = svgPt(svg, e); hole.setAttribute('cx', p.x); hole.setAttribute('cy', p.y); ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y); };
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerdown', move);
    let got = 0;
    api.progress(`พบเบาะแส 0/${need}`);
    layer.querySelectorAll('.hid').forEach(g => g.addEventListener('click', () => {
      if (g.dataset.done) return;
      const h = hid[+g.dataset.i];
      if (matchAll(step.req, h.shape)) {
        g.dataset.done = 1; got++; SD.Audio.play('discover'); api.record(true); api.learn(h.shape);
        g.querySelector('*').setAttribute('fill', '#ffeb3b'); g.querySelector('*').setAttribute('stroke', '#ff6f00');
        api.progress(`พบเบาะแส ${got}/${need}`);
        api.say(`เจอแล้ว! ${SD.SHAPES[h.shape].th} ${SD.describe(h.shape)} ✓`, 'good');
        if (got >= need) {
          layer.querySelector('.dark').style.opacity = 0; ring.style.display = 'none';
          SD.Audio.play('unlock');
          setTimeout(() => api.complete('ไฟกลับมาแล้ว! เธอใช้คุณสมบัติ “ไม่มีมุม” หาเบาะแสในความมืดได้ วงกลมและวงรีเป็นรูปที่ไม่มีมุม เพราะเป็นเส้นโค้ง'), 1100);
        }
      } else {
        SD.Audio.play('soft'); api.record(false); api.mistake('general');
        api.say(`รูปนี้${SD.describe(h.shape)} ยังไม่ใช่เบาะแสที่เราตามหา ลองส่องหาต่อนะ`, 'soft');
        g.classList.add('shake');
      }
    }));
    return {
      hint(l) {
        if (l < 2) return;
        const t = hid.find(h => matchAll(step.req, h.shape) && !layer.querySelector(`.hid[data-i="${h.i}"]`).dataset.done);
        if (t) { hole.setAttribute('cx', t.x); hole.setAttribute('cy', t.y); ring.setAttribute('cx', t.x); ring.setAttribute('cy', t.y); }
      },
      destroy() { svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerdown', move); layer.remove(); svg.classList.remove('scan-mode'); }
    };
  };

  /* ---- ARRANGE: rebuild the train from its silhouette ---- */
  A.arrange = function (step, api) {
    const body = api.openPanel('🚂 ' + step.title, { closable: true });
    const slots = [
      { id: 'body', shape: 'rectangle', x: 360, y: 250, w: 380, h: 120, fill: '#ef5350' },
      { id: 'cabin', shape: 'square', x: 480, y: 140, w: 110, h: 110, fill: '#e57373' },
      { id: 'chim', shape: 'rectangle', x: 240, y: 150, w: 44, h: 80, fill: '#5d4037' },
      { id: 'w1', shape: 'circle', x: 240, y: 330, w: 80, h: 80, fill: '#424242', wheel: 1 },
      { id: 'w2', shape: 'circle', x: 360, y: 330, w: 80, h: 80, fill: '#424242', wheel: 1 },
      { id: 'w3', shape: 'circle', x: 480, y: 330, w: 80, h: 80, fill: '#424242', wheel: 1 },
      { id: 'front', shape: 'triangle', x: 585, y: 280, w: 70, h: 60, rot: 90, fill: '#ffb300' }
    ];
    const pieces = shuffle([
      { shape: 'rectangle' }, { shape: 'square' }, { shape: 'rectangle' }, { shape: 'circle' }, { shape: 'circle' }, { shape: 'circle' },
      { shape: 'triangle' }, { shape: 'ellipse' }, { shape: 'pentagon' }, { shape: 'hexagon' }
    ]).map((p, i) => Object.assign({ i, rot: 0 }, p));
    body.innerHTML = `<div class="two-col">
      <div class="stage grid-bg"><svg viewBox="0 0 800 420"><g id="train">
        ${slots.map(s => `<g class="slot" data-id="${s.id}">${SD.shapeEl(Object.assign({}, s, { fill: '#455a64' }), 'class="sil"')}</g>`).join('')}
      </g></svg></div>
      <div><div class="step-instr" style="margin-bottom:.6rem">🔎 ดูแบบเงา แล้วลากชิ้นส่วนที่รูปร่างตรงกันไปวาง (แตะชิ้น แล้วแตะช่องก็ได้)</div>
      <div class="piece-tray">${pieces.map(p => `<div class="piece" data-i="${p.i}">${SD.shapeIcon(p.shape, 84)}${p.shape === 'triangle' ? '<button class="rot-btn" title="หมุน">↻</button>' : ''}</div>`).join('')}</div></div></div>`;
    api.say(step.say);
    body.querySelectorAll('.rot-btn').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const pc = b.closest('.piece'), p = pieces[+pc.dataset.i];
      p.rot = (p.rot + 90) % 360; pc.querySelector('svg').style.transform = `rotate(${p.rot}deg)`; SD.Audio.play('click');
    }));
    let left = slots.length;
    dnd({
      container: body, itemSel: '.piece', targetSel: '.slot',
      onDrop(pc, slotEl) {
        if (slotEl.classList.contains('filled')) return;
        const p = pieces[+pc.dataset.i], s = slots.find(x => x.id === slotEl.dataset.id);
        const PS = SD.SHAPES[p.shape], SS = SD.SHAPES[s.shape];
        if (p.shape !== s.shape) {
          SD.Audio.play('soft'); api.record(false); slotEl.classList.add('shake'); setTimeout(() => slotEl.classList.remove('shake'), 500);
          if (PS.sides === 4 && SS.sides === 4) api.say(s.shape === 'square' ? 'ชิ้นนี้เป็นรูปสี่เหลี่ยมเหมือนกัน! แต่ช่องนี้ด้านยาวเท่ากันทุกด้าน ลองหาชิ้นที่ด้านยาวเท่ากันดูนะ' : 'ชิ้นนี้เป็นรูปสี่เหลี่ยมเหมือนกัน แต่ช่องนี้ยาวกว่ากว้าง ลองหาชิ้นสี่เหลี่ยมผืนผ้า', 'soft');
          else { api.mistake(SS.curved && PS.curved ? 'circleEllipse' : 'general'); api.say(`ช่องนี้${SD.describe(s.shape)} แต่ชิ้นนี้${SD.describe(p.shape)} ลองชิ้นอื่นนะ`, 'soft'); }
          return;
        }
        if (s.shape === 'triangle' && p.rot !== s.rot) { SD.Audio.play('soft'); api.say('รูปถูกแล้ว เป็นสามเหลี่ยม! แต่ยังหันไม่ตรงกับแบบ ลองกดปุ่ม ↻ หมุนดูนะ', 'soft'); return; }
        SD.Audio.play('pop'); api.record(true); api.learn(s.shape);
        pc.classList.add('used'); pc.classList.remove('selected'); slotEl.classList.add('filled');
        slotEl.insertAdjacentHTML('beforeend', SD.shapeEl(s, `class="${s.wheel ? 'spin-target' : ''}" style="animation:popIn .3s"`));
        left--;
        api.say(`ใช่! ช่องนี้คือ${SS.th} ${SD.describe(s.shape)}`, 'good');
        if (left === 0) {
          const tr = body.querySelector('#train');
          tr.insertAdjacentHTML('beforeend', '<circle cx="300" cy="380" r="0"/>');
          tr.querySelectorAll('.spin-target').forEach(w => w.classList.add('spin'));
          setTimeout(() => { tr.classList.add('train-go'); SD.Audio.play('chug'); }, 400);
          setTimeout(() => api.complete('รถไฟกลับมาวิ่งได้แล้ว! เธอสังเกตรูปจากแบบได้ ตัวรถเป็นสี่เหลี่ยม ล้อเป็นวงกลม กันชนเป็นสามเหลี่ยมที่หันไปทางขวา (หมุนแล้วก็ยังเป็นสามเหลี่ยม)'), 2600);
        }
      }
    });
    return { hint(l) { if (l >= 2) { const s = body.querySelector('.slot:not(.filled)'); if (s) { s.classList.add('hint-glow'); setTimeout(() => s.classList.remove('hint-glow'), 2500); } } } };
  };

  /* ---- STRETCH: circle ↔ ellipse laboratory ---- */
  A.stretch = function (step, api) {
    const body = api.openPanel('🧪 ' + step.title, { closable: true });
    const cx = 350, cy = 200, ry = 90; let rx = 90;
    body.innerHTML = `<div class="two-col">
      <div class="stage grid-bg"><svg viewBox="0 0 700 400">
        <ellipse id="st-e" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#81c784" fill-opacity=".6" stroke="#3b2a20" stroke-width="6"/>
        <line id="st-w" y1="${cy}" y2="${cy}" stroke="#1e88e5" stroke-width="5" stroke-dasharray="10 6"/>
        <line id="st-h" x1="${cx}" x2="${cx}" y1="${cy - ry}" y2="${cy + ry}" stroke="#e53935" stroke-width="5" stroke-dasharray="10 6"/>
        <g class="handle" id="st-hd"><circle r="34" fill="transparent"/><circle r="20" fill="#ffca28" stroke="#3b2a20" stroke-width="5"/><text text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="700">↔</text></g>
      </svg></div>
      <div style="display:flex;flex-direction:column;gap:.6rem">
        <div class="shape-label-big" id="st-label"></div>
        <div class="readout"><div class="counter">กว้าง<b id="st-wv" style="color:#1e88e5"></b></div><div class="counter">สูง<b id="st-hv" style="color:#e53935"></b></div><div class="counter">มุม<b>0</b></div></div>
        <ul class="checklist"><li data-t="long">ยืดให้เป็นวงรีที่ยาวมากๆ</li><li data-t="back">หดกลับให้เป็นวงกลมอีกครั้ง</li><li data-t="tall">ทำวงรีที่สูงกว่ากว้าง</li></ul>
        <div class="proof-actions" id="st-act"></div>
      </div></div>`;
    api.say(step.say);
    const svg = body.querySelector('svg'), e = body.querySelector('#st-e'), wl = body.querySelector('#st-w'), hd = body.querySelector('#st-hd');
    const done = {}; let madeEllipse = false;
    function draw() {
      e.setAttribute('rx', rx); wl.setAttribute('x1', cx - rx); wl.setAttribute('x2', cx + rx);
      hd.setAttribute('transform', `translate(${cx + rx} ${cy})`);
      const wv = Math.round(rx * 2 / 20), hv = Math.round(ry * 2 / 20);
      body.querySelector('#st-wv').textContent = wv; body.querySelector('#st-hv').textContent = hv;
      const lab = body.querySelector('#st-label');
      if (rx === ry) { lab.innerHTML = '⭕ วงกลม <small>(กว้าง = สูง)</small>'; lab.style.background = '#c8e6c9'; e.setAttribute('fill', '#81c784'); }
      else { lab.innerHTML = '🥚 วงรี <small>(กว้าง ≠ สูง)</small>'; lab.style.background = '#f8bbd0'; e.setAttribute('fill', '#f06292'); }
    }
    function check() {
      const mark = t => { if (done[t]) return; done[t] = 1; body.querySelector(`[data-t="${t}"]`).classList.add('done'); SD.Audio.play('discover'); };
      if (rx >= 150) { mark('long'); madeEllipse = true; api.say('ยืดแล้วกว้างมากกว่าสูง กลายเป็นวงรี! แต่สังเกตไหม มุมยังเป็น 0 เหมือนเดิม', 'good'); }
      if (rx <= 60) { mark('tall'); madeEllipse = true; api.say('สูงกว่ากว้างก็เป็นวงรีเหมือนกัน ยาวไม่เท่ากันนั่นเอง', 'good'); }
      if (rx === ry && madeEllipse) { mark('back'); api.say('กว้างเท่ากับสูงพอดี กลับมาเป็นวงกลมแล้ว!', 'good'); }
      if (done.long && done.tall && done.back && !done.fin) {
        done.fin = 1; api.record(true); api.learn('circle'); api.learn('ellipse');
        api.say('สรุปการทดลอง: วงกลมและวงรีไม่มีมุมทั้งคู่ แต่วงกลมกว้างเท่ากับสูง ส่วนวงรียาวกับกว้างไม่เท่ากัน', 'happy');
        const act = body.querySelector('#st-act'); act.innerHTML = '<button class="btn btn-green">เข้าใจแล้ว! ✔</button>';
        act.querySelector('button').onclick = () => { api.closePanel(); api.complete('การทดลองสำเร็จ! วงกลม = ไม่มีมุม กว้างเท่ากับสูง / วงรี = ไม่มีมุม แต่ยาวกับกว้างไม่เท่ากัน'); };
      }
    }
    hd.addEventListener('pointerdown', ev => {
      ev.preventDefault(); hd.setPointerCapture(ev.pointerId);
      const mv = m => { const p = svgPt(svg, m); let v = Math.max(40, Math.min(300, p.x - cx)); if (Math.abs(v - ry) < 9) v = ry; rx = Math.round(v); draw(); };
      const up = () => { hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); check(); };
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up);
    });
    draw();
    return { hint(l) { if (l >= 2) { hd.querySelector('circle:nth-child(2)').style.animation = 'cornerPulse .8s 4'; } } };
  };

  /* ---- COMPARE: same shape despite size / colour / rotation? ---- */
  A.compare = function (step, api) {
    const body = api.openPanel('⚙️ ' + step.title, { closable: true });
    let r = 0;
    api.say(step.say);
    function round() {
      const R = step.rounds[r], a = Object.assign({}, R.a), b = Object.assign({ sc: 1 }, R.b);
      const same = SD.SHAPES[a.shape].th === SD.SHAPES[b.shape].th && a.shape !== 'circle' && b.shape !== 'circle' ? a.shape === b.shape : a.shape === b.shape;
      const insp = { a: false, b: false };
      body.innerHTML = `<div class="compare-wrap"><div class="pedestals">
        <div class="pedestal" data-k="a"><h4>ชิ้นส่วน A</h4><svg viewBox="0 0 300 260"></svg><div class="ctrl"><span class="muted">แตะรูปเพื่อตรวจ</span></div></div>
        <div class="pedestal" data-k="b"><h4>ชิ้นส่วน B</h4><svg viewBox="0 0 300 260"></svg><div class="ctrl">
          <button class="btn btn-small" data-c="l">↺ หมุน</button><button class="btn btn-small" data-c="r">↻ หมุน</button><button class="btn btn-small" data-c="m">➖ ย่อ</button><button class="btn btn-small" data-c="p">➕ ขยาย</button></div></div>
        </div>
        <div><div class="round-tag">คู่ที่ ${r + 1}/${step.rounds.length} · ตรวจทั้งสองชิ้นก่อนประทับตรา</div>
        <div class="stamps"><button class="btn btn-green" data-s="1" disabled>✅ รูปชนิดเดียวกัน</button><button class="btn btn-orange" data-s="0" disabled>❌ คนละชนิดกัน</button></div></div></div>`;
      const render = (k, o) => {
        const sv = body.querySelector(`.pedestal[data-k="${k}"] svg`);
        const sc = o.sc || 1;
        sv.innerHTML = SD.shapeEl({ shape: o.shape, x: 150, y: 130, w: o.w * sc, h: o.h * sc, rot: o.rot, fill: o.fill, sw: 5 });
      };
      render('a', a); render('b', b);
      const info = (k, o) => {
        const ped = body.querySelector(`.pedestal[data-k="${k}"]`), S = SD.SHAPES[o.shape];
        ped.querySelector('.info') && ped.querySelector('.info').remove();
        const t = S.curved ? `เส้นโค้ง · 0 มุม · ${S.round ? 'กว้าง = สูง' : 'กว้าง ≠ สูง'}` : `${S.sides} ด้าน · ${S.corners} มุม`;
        ped.insertAdjacentHTML('beforeend', `<div class="info">🔍 ${t}</div>`);
        ped.classList.add('inspected'); insp[k] = true; SD.Audio.play('scan');
        if (insp.a && insp.b) body.querySelectorAll('[data-s]').forEach(x => x.disabled = false);
      };
      body.querySelectorAll('.pedestal svg').forEach(sv => sv.addEventListener('click', () => { const k = sv.closest('.pedestal').dataset.k; info(k, k === 'a' ? a : b); }));
      body.querySelectorAll('[data-c]').forEach(btn => btn.addEventListener('click', () => {
        const c = btn.dataset.c; SD.Audio.play('click');
        if (c === 'l') b.rot -= 15; if (c === 'r') b.rot += 15;
        if (c === 'm') b.sc = Math.max(.5, b.sc - .15); if (c === 'p') b.sc = Math.min(1.8, b.sc + .15);
        render('b', b);
      }));
      body.querySelectorAll('[data-s]').forEach(btn => btn.addEventListener('click', () => {
        const pick = btn.dataset.s === '1';
        const SA = SD.SHAPES[a.shape], SB = SD.SHAPES[b.shape];
        if (pick === same) {
          SD.Audio.play('success'); api.record(true); api.learn(a.shape); api.learn(b.shape);
          const exp = same
            ? `ถึงสี ขนาด หรือทิศทางจะต่างกัน แต่ทั้งคู่${SD.describe(a.shape)} จึงเป็น${SA.th}เหมือนกัน`
            : `A เป็น${SA.th} (${SD.describe(a.shape)}) แต่ B เป็น${SB.th} (${SD.describe(b.shape)}) จึงเป็นคนละชนิด`;
          body.querySelector('.compare-wrap').insertAdjacentHTML('beforeend', `<div class="stamp">${same ? 'เหมือนกัน!' : 'ต่างกัน!'}</div>`);
          api.say('ตัดสินถูกต้อง! ' + exp, 'good');
          const st = body.querySelector('.stamps'); st.innerHTML = '<button class="btn btn-teal">คู่ต่อไป ▶</button>';
          st.querySelector('button').onclick = () => { r++; if (r < step.rounds.length) round(); else { api.closePanel(); api.complete('เธอรู้แล้วว่า สี ขนาด และการหมุน ไม่ได้ทำให้ชนิดของรูปเปลี่ยน สิ่งที่บอกชนิดของรูปคือ จำนวนด้าน จำนวนมุม และเส้นตรง/เส้นโค้ง'); } };
        } else {
          SD.Audio.play('soft'); api.record(false);
          if (same && (a.rot !== b.rot || b.sc !== 1 || a.fill !== b.fill)) api.mistake('rotation');
          else if (SA.curved && SB.curved) api.mistake('circleEllipse'); else api.mistake('sides');
          api.say(same ? 'ลองหมุน B ให้ตั้งตรงแบบ A แล้วนับด้านกับมุมอีกครั้งนะ สีหรือขนาดทำให้จำนวนด้านเปลี่ยนไหม?' : 'ลองเทียบตัวเลขที่ตรวจได้อีกครั้ง จำนวนด้านหรือความกลมเท่ากันจริงไหม?', 'soft');
        }
      }));
    }
    round();
    return { hint(l) { if (l >= 2) body.querySelectorAll('.pedestal svg').forEach(sv => sv.dispatchEvent(new Event('click'))); } };
  };

  /* ---- DRAW: trace → guided → free ; WOW 3 drawing becomes a real object ---- */
  const EXHIBITS = {
    roof: {
      title: 'บ้านจำลองไม่มีหลังคา', slot: { shape: 'triangle', x: 200, y: 105, w: 230, h: 100 }, fill: '#e57373',
      art: `<rect x="110" y="155" width="180" height="130" fill="#ffcc80" stroke="#3b2a20" stroke-width="5"/><rect x="180" y="205" width="40" height="80" fill="#8d6e63" stroke="#3b2a20" stroke-width="4"/><rect class="win" x="125" y="180" width="40" height="40" fill="#90a4ae" stroke="#3b2a20" stroke-width="4"/><rect class="win" x="235" y="180" width="40" height="40" fill="#90a4ae" stroke="#3b2a20" stroke-width="4"/>`,
      done: svg => svg.querySelectorAll('.win').forEach(w => w.classList.add('lights-on'))
    },
    window: {
      title: 'บ้านจำลองไม่มีหน้าต่าง', slot: { shape: 'square', x: 150, y: 210, w: 60, h: 60 }, fill: '#fff59d',
      art: `<polygon points="90,150 200,60 310,150" fill="#e57373" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/><rect x="110" y="150" width="180" height="135" fill="#ffcc80" stroke="#3b2a20" stroke-width="5"/><rect x="225" y="205" width="40" height="80" fill="#8d6e63" stroke="#3b2a20" stroke-width="4"/><g class="cat" opacity="0"><circle cx="150" cy="222" r="12" fill="#5d4037"/><polygon points="140,214 144,202 149,212" fill="#5d4037"/><polygon points="160,214 156,202 151,212" fill="#5d4037"/></g>`,
      done: svg => { const c = svg.querySelector('.cat'); c.style.transition = 'opacity 1s'; c.setAttribute('opacity', 1); }
    },
    wheel: {
      title: 'รถของบ้านจำลองไม่มีล้อ', slots: [{ shape: 'circle', x: 135, y: 250, w: 66, h: 66 }, { shape: 'circle', x: 265, y: 250, w: 66, h: 66 }], fill: '#424242',
      art: `<rect x="80" y="180" width="240" height="60" rx="14" fill="#42a5f5" stroke="#3b2a20" stroke-width="5"/><polygon points="130,180 170,130 250,130 285,180" fill="#90caf9" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/>`,
      done: svg => { svg.querySelectorAll('.kid').forEach(k => k.classList.add('spin')); svg.querySelector('.ex-group').classList.add('drive'); SD.Audio.play('chug'); }
    },
    vault: {
      title: 'ห้องนิรภัยเก็บกุญแจ', slot: { shape: 'hexagon', x: 200, y: 165, w: 110, h: 96 }, fill: '#ffd54f',
      art: `<rect x="60" y="40" width="280" height="250" fill="#fff59d" stroke="#3b2a20" stroke-width="5"/>
        <g>${['triangle', 'square', 'circle', 'ellipse', 'pentagon', 'hexagon'].map((t, i) => SD.shapeEl({ shape: t, x: 110 + (i % 3) * 90, y: 115 + Math.floor(i / 3) * 110, w: t === 'ellipse' ? 60 : 46, h: t === 'ellipse' ? 36 : 46, fill: '#ffca28', sw: 3 })).join('')}</g>
        <rect class="door-l" x="60" y="40" width="140" height="250" fill="#90a4ae" stroke="#3b2a20" stroke-width="5"/><rect class="door-r" x="200" y="40" width="140" height="250" fill="#90a4ae" stroke="#3b2a20" stroke-width="5"/>`,
      done: svg => { svg.classList.add('vault-open'); svg.querySelector('.kid-wrap').style.transition = 'opacity 1s'; svg.querySelector('.kid-wrap').style.opacity = 0; SD.Audio.play('unlock'); }
    }
  };

  A.draw = function (step, api) {
    const body = api.openPanel('✏️ ' + step.title, { closable: true });
    const ex = EXHIBITS[step.exhibit], T = step.target, S = SD.SHAPES[T];
    const LW = 560, LH = 420, gcx = 280, gcy = 215;
    const size = { triangle: [300, 250], square: [240, 240], hexagon: [300, 260], circle: [260, 260] }[T] || [260, 260];
    const modeName = { trace: 'ระดับ 1: ลากตามรอย', guided: 'ระดับ 2: ลากต่อจุด', free: 'ระดับ 3: วาดอิสระ' }[step.mode];
    const slots = ex.slots || [ex.slot];
    body.innerHTML = `<div class="draw-wrap">
      <div class="draw-left">
        <div class="draw-goal">🖊️ ${modeName} — ${step.goal}</div>
        <div class="canvas-box"><svg class="guide" viewBox="0 0 ${LW} ${LH}"></svg><canvas></canvas></div>
        <div class="draw-btns"><button class="btn btn-small" data-a="clear">🧽 ลบวาดใหม่</button><button class="btn btn-orange" data-a="send">✔ ส่งหลักฐาน</button></div>
      </div>
      <div class="exhibit-card"><h4>🏛️ ${ex.title}</h4><div class="stage"><svg viewBox="0 0 400 320"><g class="ex-group">${ex.art}
        ${slots.map(s => SD.shapeEl(Object.assign({}, s, { fill: 'none', stroke: '#e53935', sw: 4 }), 'stroke-dasharray="10 8" class="ex-slot"')).join('')}</g></svg></div></div></div>`;
    api.say(step.say);
    const guide = body.querySelector('svg.guide'), canvas = body.querySelector('canvas'), box = body.querySelector('.canvas-box');
    const exSvg = body.querySelector('.exhibit-card svg');
    const verts = S.curved ? null : SD.localPoints(T, size[0], size[1]).map(([x, y]) => [gcx + x, gcy + y]);
    if (step.mode === 'trace') {
      guide.innerHTML = SD.shapeEl({ shape: T, x: gcx, y: gcy, w: size[0], h: size[1], fill: 'none', stroke: '#b0a090', sw: 6 }, 'stroke-dasharray="14 12"');
    } else if (step.mode === 'guided' && verts) {
      guide.innerHTML = verts.map((v, i) => `<circle cx="${v[0]}" cy="${v[1]}" r="14" fill="#fff" stroke="#e53935" stroke-width="5"/><text x="${v[0] + (v[0] < gcx ? -26 : 26)}" y="${v[1] + (v[1] < gcy ? -20 : 26)}" text-anchor="middle" class="num-tag">${i + 1}</text>`).join('');
    }
    // canvas mapping with "meet" like the guide svg
    const ctx = canvas.getContext('2d');
    let map = { s: 1, ox: 0, oy: 0 }, strokes = [], cur = null;
    function resize() {
      const r = box.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      const s = Math.min(r.width / LW, r.height / LH);
      map = { s, ox: (r.width - LW * s) / 2, oy: (r.height - LH * s) / 2, dpr };
      redraw();
    }
    function redraw() {
      ctx.setTransform(map.dpr * map.s, 0, 0, map.dpr * map.s, map.dpr * map.ox, map.dpr * map.oy);
      ctx.clearRect(-map.ox / map.s, -map.oy / map.s, canvas.width, canvas.height);
      ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3b2a20';
      strokes.forEach(st => { ctx.beginPath(); st.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); });
    }
    const toL = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left - map.ox) / map.s, (e.clientY - r.top - map.oy) / map.s]; };
    canvas.addEventListener('pointerdown', e => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); cur = [toL(e)]; strokes.push(cur); });
    canvas.addEventListener('pointermove', e => { if (!cur) return; const p = toL(e), q = cur[cur.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 2.5) return; cur.push(p); if (cur.length % 6 === 0) SD.Audio.play('draw'); redraw(); });
    const end = () => { cur = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    setTimeout(resize, 30);
    window.addEventListener('resize', resize);
    let solved = false;

    body.querySelector('[data-a="clear"]').onclick = () => { strokes = []; redraw(); SD.Audio.play('whoosh'); };
    body.querySelector('[data-a="send"]').onclick = () => {
      if (solved) return;
      const all = strokes.filter(s => s.length > 1);
      if (!all.length) { api.say('ลองใช้ Shape Pen วาดในกระดาษก่อนนะ', 'soft'); return; }
      const res = evaluate(all);
      if (res.ok) {
        solved = true; api.record(true); api.learn(T); SD.Audio.play('success');
        api.say(res.msg, 'good');
        becomeReal(all);
      } else {
        api.record(false); if (res.cat) api.mistake(res.cat); SD.Audio.play('soft');
        api.say(res.msg, 'soft');
      }
    };

    function evaluate(all) {
      const rec = SD.recognize(all);
      if (step.mode === 'trace') {
        const outl = SD.outlinePoints(T, gcx, gcy, size[0], size[1], 72);
        const sc = SD.traceScore(all, outl, 26);
        if (sc.coverage >= .72 && sc.precision >= .6) return { ok: true, msg: `สวยมาก! เธอลากครบ ${S.sides} ด้าน และเส้นมาบรรจบกันเป็นรูปปิด ได้${S.th}แล้ว` };
        if (sc.coverage < .72) return { ok: false, msg: 'เกือบแล้ว! ยังลากไม่ครบทุกด้าน ลากตามรอยประให้ครบรอบนะ' };
        return { ok: false, msg: 'ลองลากให้ชิดรอยประมากขึ้นอีกนิด ค่อยๆ ลากก็ได้นะ' };
      }
      if (step.mode === 'guided') {
        let pts = []; all.forEach(s => { pts = pts.concat(s); });
        const miss = verts.findIndex(v => !pts.some(p => Math.hypot(p[0] - v[0], p[1] - v[1]) < 36));
        if (miss >= 0) return { ok: false, msg: `ยังไม่ได้ลากผ่านจุดที่ ${miss + 1} ลองลากต่อให้ครบทุกจุดนะ`, cat: 'sides' };
        const last = all[all.length - 1], lp = last[last.length - 1], first = all[0][0];
        const closedOk = rec.closed || Math.hypot(lp[0] - first[0], lp[1] - first[1]) < 45 || Math.hypot(lp[0] - verts[0][0], lp[1] - verts[0][1]) < 45;
        if (!closedOk) return { ok: false, msg: 'เส้นยังไม่ปิด ลากกลับมาที่จุดแรกให้เป็นรูปปิดนะ' };
        return { ok: true, msg: `เยี่ยม! ต่อจุดครบ ${S.sides} จุด ได้เส้นตรง ${S.sides} ด้าน และ ${S.corners} มุม เป็น${S.th}` };
      }
      // free draw — assess the idea (closed, curved/straight, corners)
      if (rec.kind === 'tiny') return { ok: false, msg: 'รูปเล็กไปนิด ลองวาดให้ใหญ่ขึ้นนะ' };
      if (rec.kind === 'open') return { ok: false, msg: 'เส้นยังไม่ปิด ลองวาดให้ปลายเส้นกลับมาเจอจุดเริ่มต้นนะ' };
      if (S.curved) {
        if (rec.kind === 'circle') return { ok: true, msg: 'ใช่เลย! รูปนี้ไม่มีมุม เป็นเส้นโค้ง และกลมเกือบเท่ากันทุกทาง ล้อจะหมุนได้แล้ว!' };
        if (rec.kind === 'ellipse') return { ok: false, cat: 'circleEllipse', msg: 'ไม่มีมุมแล้ว เก่งมาก! แต่รูปนี้ยาวกับกว้างยังไม่เท่ากัน เป็นวงรีนะ ล้อต้องกลมเท่ากันทุกทาง ลองวาดให้กลมขึ้นอีกนิด' };
        return { ok: false, cat: 'general', msg: `ลุงฮูกเห็นมุม ${rec.corners} มุม แต่ล้อต้องไม่มีมุมนะ ลองวาดเป็นเส้นโค้งวนรอบ` };
      }
      if (rec.kind === 'polygon' && rec.sides === S.sides) return { ok: true, msg: `ถูกต้อง! มีเส้นตรง ${S.sides} ด้าน ${S.corners} มุม เป็น${S.th}` };
      if (rec.kind === 'polygon') return { ok: false, cat: 'sides', msg: `ลุงฮูกนับได้ ${rec.sides} มุม แต่เราต้องการ ${S.corners} มุม ลองวาดใหม่นะ` };
      return { ok: false, cat: 'general', msg: 'รูปนี้ดูเป็นเส้นโค้ง ลองวาดเป็นเส้นตรงหักมุมนะ' };
    }

    function becomeReal(all) {
      // WOW 3: the child's own drawing is placed into the exhibit and works
      let pts = []; all.forEach(s => { pts = pts.concat(s); });
      const bb = SD.bboxOf(pts);
      const d = all.map(s => 'M' + s.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L')).join(' ') + ' Z';
      exSvg.querySelectorAll('.ex-slot').forEach(x => x.remove());
      const group = exSvg.querySelector('.ex-group');
      const wrap = document.createElementNS(NS, 'g'); wrap.setAttribute('class', 'kid-wrap'); group.appendChild(wrap);
      slots.forEach(s => {
        const sx = s.w / Math.max(bb.w, 1), sy = s.h / Math.max(bb.h, 1);
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('transform', `translate(${s.x - s.w / 2} ${s.y - s.h / 2}) scale(${sx} ${sy}) translate(${-bb.x} ${-bb.y})`);
        g.innerHTML = `<g class="kid"><path d="${d}" fill="${ex.fill}" stroke="#3b2a20" stroke-width="${6 / Math.min(sx, sy)}" stroke-linejoin="round"/></g>`;
        g.style.opacity = 0; g.style.transition = 'opacity .6s';
        wrap.appendChild(g); requestAnimationFrame(() => { g.style.opacity = 1; });
      });
      api.saveCreation(step.exhibit, d, T);
      SD.Audio.play('whoosh');
      setTimeout(() => ex.done(exSvg), 700);
      setTimeout(() => {
        api.closePanel();
        api.complete(`รูปที่เธอวาดกลายเป็นของจริงแล้ว! ${S.th}${SD.describe(T)}`, T);
      }, 3200);
    }
    return {
      hint(l) {
        if (l < 2) return;
        if (step.mode === 'free') guide.innerHTML = SD.shapeEl({ shape: T, x: gcx, y: gcy, w: size[0], h: size[1], fill: 'none', stroke: '#ffcc80', sw: 5 }, 'stroke-dasharray="6 14" opacity=".8"');
        else guide.querySelectorAll('circle,polygon,ellipse').forEach(c => c.style.animation = 'hintGlow .8s 4');
      },
      destroy() { window.removeEventListener('resize', resize); }
    };
  };

  /* ---- COMBINE: WOW 2 — all keys merge and open the secret door ---- */
  A.combine = function (step, api) {
    const body = api.openPanel('🗝️ ' + step.title, { closable: true });
    const keys = ['triangle', 'square', 'circle', 'ellipse', 'pentagon', 'hexagon'];
    const holeRot = { triangle: 180, square: 45, circle: 0, ellipse: 90, pentagon: 36, hexagon: 30 };
    const order = shuffle(keys);
    const holes = order.map((k, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return { k, x: 300 + Math.cos(a) * 150, y: 260 + Math.sin(a) * 150, rot: holeRot[k] }; });
    const dim = k => ({ w: k === 'ellipse' ? 84 : 66, h: k === 'ellipse' ? 50 : 66 });
    body.innerHTML = `<div class="two-col">
      <div class="stage" style="background:radial-gradient(#fff8e1,#d1c4e9)"><svg viewBox="0 0 600 520">
        <circle cx="300" cy="260" r="0" fill="#fffde7" id="cb-light"/>
        <g id="cb-door"><path class="door-l" d="M300 30 A230 230 0 0 0 300 490 Z" fill="#b39ddb" stroke="#3b2a20" stroke-width="6"/><path class="door-r" d="M300 30 A230 230 0 0 1 300 490 Z" fill="#9575cd" stroke="#3b2a20" stroke-width="6"/></g>
        <g id="cb-holes">${holes.map((h, i) => `<g class="slot" data-i="${i}">${SD.shapeEl(Object.assign({ shape: h.k, x: h.x, y: h.y, rot: h.rot, fill: '#311b92' }, dim(h.k)), 'class="sil"')}</g>`).join('')}</g>
        <g id="cb-master" opacity="0"><circle cx="300" cy="260" r="60" fill="#ffd54f" stroke="#3b2a20" stroke-width="6"/><rect x="290" y="300" width="20" height="120" fill="#ffd54f" stroke="#3b2a20" stroke-width="5"/><text x="300" y="272" text-anchor="middle" font-size="40">🔑</text></g>
      </svg></div>
      <div><div class="step-instr" style="margin-bottom:.6rem">🗝️ ลากกุญแจไปใส่ช่องที่รูปร่างตรงกัน (ช่องอาจหมุนเอียงอยู่ สังเกตด้านและมุม!)</div>
      <div class="piece-tray">${shuffle(keys).map(k => `<div class="piece" data-k="${k}">${SD.shapeIcon(k, 84, '#ffca28')}</div>`).join('')}</div></div></div>`;
    api.say(step.say);
    const svg = body.querySelector('svg');
    let left = 6;
    dnd({
      container: body, itemSel: '.piece', targetSel: '.slot',
      onDrop(pc, slot) {
        if (slot.classList.contains('filled')) return;
        const k = pc.dataset.k, h = holes[+slot.dataset.i];
        if (k !== h.k) {
          SD.Audio.play('soft'); api.record(false); api.mistake(SD.SHAPES[k].curved && SD.SHAPES[h.k].curved ? 'circleEllipse' : 'sides');
          api.say(`กุญแจนี้${SD.describe(k)} แต่ช่องนี้${SD.describe(h.k)} ลองช่องอื่นนะ`, 'soft'); return;
        }
        SD.Audio.play('pop'); api.record(true);
        pc.classList.add('used'); slot.classList.add('filled');
        slot.insertAdjacentHTML('beforeend', SD.shapeEl(Object.assign({ shape: k, x: h.x, y: h.y, rot: h.rot, fill: '#ffca28' }, dim(k)), 'style="animation:popIn .4s"'));
        left--;
        api.say(`คลิก! ${SD.SHAPES[k].th}เข้ากับช่องพอดี แม้ช่องจะหมุนเอียง แต่จำนวนด้านและมุมยังเท่าเดิม`, 'good');
        if (left === 0) wow();
      }
    });
    function wow() {
      SD.Audio.play('unlock');
      const hg = svg.querySelector('#cb-holes');
      hg.querySelectorAll('.slot').forEach((s, i) => {
        const h = holes[i]; s.style.transition = 'transform 1.2s cubic-bezier(.6,-0.3,.4,1.3), opacity 1.2s';
        s.style.transform = `translate(${300 - h.x}px, ${260 - h.y}px) scale(.3)`; s.style.transformOrigin = `${h.x}px ${h.y}px`;
      });
      setTimeout(() => { hg.style.transition = 'opacity .4s'; hg.style.opacity = 0; const m = svg.querySelector('#cb-master'); m.style.transition = 'opacity .5s'; m.setAttribute('opacity', 1); SD.Audio.play('discover'); api.fx('sparkle'); }, 1300);
      setTimeout(() => { const m = svg.querySelector('#cb-master'); m.setAttribute('opacity', 0); svg.classList.add('vault-open'); const l = svg.querySelector('#cb-light'); l.style.transition = 'r 1.4s'; l.setAttribute('r', 230); SD.Audio.play('whoosh'); }, 2400);
      setTimeout(() => { api.closePanel(); api.complete('เบาะแสทั้งหมดรวมกันเป็นกุญแจใหญ่ ประตูห้องลับเปิดแล้ว! เธอจับคู่รูปได้แม้รูปจะหมุนเอียง เพราะดูจากจำนวนด้านและมุม'); }, 4200);
    }
    return { hint(l) { if (l >= 2) { const s = body.querySelector('.slot:not(.filled)'); if (s) { s.classList.add('hint-glow'); const k = holes[+s.dataset.i].k; const p = body.querySelector(`.piece[data-k="${k}"]`); p && p.classList.add('selected'); setTimeout(() => s.classList.remove('hint-glow'), 2500); } } } };
  };

  /* ---- DEDUCE: eliminate suspects using multiple properties ---- */
  A.deduce = function (step, api) {
    const body = api.openPanel('🕵️ ' + step.title, { closable: true });
    let ci = 0, showStats = false;
    const out = new Set();
    body.innerHTML = `<div class="deduce-wrap"><div id="dd-clue"></div><div class="lineup">${step.suspects.map(t => `<div class="suspect" data-t="${t}">${SD.suspectSVG(t)}<div class="tag"></div><div class="stats"></div></div>`).join('')}</div></div>`;
    api.say(step.say);
    function showClue() {
      const c = step.clues[ci];
      body.querySelector('#dd-clue').innerHTML = `<div class="clue-paper">${SD.shapeIcon('hexagon', 40, '#fff59d')}<div><span class="ci">การ์ดเบาะแส ${ci + 1}/${step.clues.length}</span>${c.text}</div></div>`;
      SD.Audio.play('discover');
    }
    function remaining(c) { return step.suspects.filter(t => !out.has(t) && !matchAll(c.keep, t)); }
    body.querySelectorAll('.suspect').forEach(card => card.addEventListener('click', () => {
      const t = card.dataset.t, c = step.clues[ci]; if (!c) return;
      const S = SD.SHAPES[t];
      if (!matchAll(c.keep, t)) {
        out.add(t); card.classList.add('out'); SD.Audio.play('pop'); api.record(true);
        card.querySelector('.tag').textContent = foundText(c.keep[0], t);
        api.say(`ถูกต้อง! ${S.th} ${foundText(c.keep[0], t)} ไม่ตรงกับเบาะแส ตัดออก`, 'good');
        if (!remaining(c).length) {
          ci++;
          if (ci < step.clues.length) setTimeout(() => { showClue(); api.say('เบาะแสใหม่มาแล้ว! อ่านให้ดี แล้วตัดผู้ต้องสงสัยที่ไม่ตรง'); }, 900);
          else setTimeout(reveal, 900);
        }
      } else {
        SD.Audio.play('soft'); api.record(false); api.mistake(c.keep[0].k === 'curved' ? 'general' : 'sides');
        card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500);
        api.say(`เดี๋ยวก่อน! ${S.th} ${foundText(c.keep[0], t)} ซึ่งตรงกับเบาะแส "${reqText(c.keep[0])}" ยังตัดออกไม่ได้นะ`, 'soft');
      }
    }));
    function reveal() {
      const last = step.suspects.find(t => !out.has(t));
      const card = body.querySelector(`.suspect[data-t="${last}"]`);
      card.classList.add('culprit');
      api.say(`เหลือคนเดียว! ${SD.SHAPES[last].th} ตรงกับทุกเบาะแส: ไม่มีเส้นโค้ง มีมุมมากกว่า 4 และด้านน้อยกว่า 6 ...เดี๋ยวนะ มันกำลังเปลี่ยนร่าง!`, 'think');
      setTimeout(() => {
        card.innerHTML = `${SD.scribbleSVG('sorry')}<div class="tag">เจ้าขยุกขยิก!</div>`;
        SD.Audio.play('whoosh');
        api.say('เจ้าขยุกขยิก: "ขอโทษนะ! ฉันวาดได้แต่เส้นยึกยือ เลยอยากได้กุญแจรูปทรงสวยๆ บ้าง..." ลุงฮูก: "งั้นให้นักสืบสอนวาดรูปให้สิ!"', 'happy');
        body.querySelector('#dd-clue').innerHTML = '<div class="proof-actions"><button class="btn btn-green">🔍 ไขคดีสำเร็จ! ไปต่อ</button></div>';
        body.querySelector('#dd-clue button').onclick = () => { api.closePanel(); api.complete(`เธอใช้หลายคุณสมบัติร่วมกันจนพบความจริง: รูปห้าเหลี่ยมไม่มีเส้นโค้ง มี 5 มุม (มากกว่า 4) และมี 5 ด้าน (น้อยกว่า 6)`); };
      }, 2200);
    }
    showClue();
    return {
      hint(l) {
        if (l >= 2 && !showStats) {
          showStats = true;
          body.querySelectorAll('.suspect').forEach(c => { const S = SD.SHAPES[c.dataset.t]; c.querySelector('.stats').textContent = S.curved ? 'เส้นโค้ง · 0 มุม' : `${S.sides} ด้าน · ${S.corners} มุม`; });
        }
      }
    };
  };

  /* ---- COUNTLAB (adaptive remedial): guided side counting ---- */
  A.countlab = function (step, api) {
    const body = api.openPanel('🔢 ' + step.title, { closable: true, single: true });
    let i = 0;
    const next = () => {
      if (i >= step.shapes.length) { api.closePanel(); api.complete('ฝึกนับด้านครบแล้ว! จำไว้ว่า รูปหลายเหลี่ยมมีจำนวนด้านเท่ากับจำนวนมุมเสมอ'); return; }
      const t = step.shapes[i++];
      Proof(body, { shape: t, w: 200, h: t === 'hexagon' ? 174 : t === 'triangle' ? 180 : 190, rot: 0, fill: SD.SHAPES[t].color, label: SD.SHAPES[t].th }, {
        api, practice: true, autoHint: true, onDone() { api.record(true); api.learn(t); next(); }
      });
    };
    next();
    return { hint() { /* side highlighting already automatic */ } };
  };

  SD.Activities = A;
  SD.Proof = Proof;
  SD.req = { reqText, foundText, test, matchAll };
})();
