/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — เครื่องมือทดลอง (rigs) ชุดที่ 2
   pourBench    : เทของแข็ง/ของเหลว/แก๊สลงภาชนะต่างรูปร่าง
   spaceBench   : สสารต้องการที่อยู่ (ก้อนหินในแก้วน้ำ / สูบลมเข้าลูกโป่ง)
   sortBins     : ลาก/แตะการ์ดลงถัง พร้อมปุ่มทดสอบหาหลักฐาน
   choice       : ปุ่มตัวเลือก
   buildBench   : เลือกวัสดุประกอบหม้อ สายไฟ หมวกนิรภัย แล้วกดทดสอบ
   mysteryBench : นักสืบวัสดุลึกลับ ทดสอบ 4 อย่างแล้วสรุป
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, ui, audio } = MM;
  const INK = art.INK;
  const clamp = MM.clamp;
  const W = MM.W;
  const { toSvg, at, chip } = W;
  const nm = MM.nm;
  const know = (id, prop) => { try { if (MM.know && MM.ITEM[id]) MM.know(MM.ITEM[id].mat, prop); } catch (e) {} };
  const f1 = n => (+n).toFixed(1);

  /* ════════════════════════════════════════════════════
     1) pourBench
     cfg = {samples:['solid','liquid','gas'], onPour(kind, container)}
     ════════════════════════════════════════════════════ */
  const PROFILES = {
    tube:  { n: 'ขวดผอมสูง', p: [[20, 34], [190, 34]] },
    bowl:  { n: 'ชามกว้าง',  p: [[100, 112], [190, 72]] },
    flask: { n: 'ขวดก้นกลม', p: [[24, 22], [100, 22], [116, 48], [140, 90], [168, 92], [190, 56]] }
  };
  const VOL = 3000;
  function widthAt(p, y) {
    if (y <= p[0][0]) return p[0][1];
    for (let i = 1; i < p.length; i++) if (y <= p[i][0]) { const t = (y - p[i - 1][0]) / (p[i][0] - p[i - 1][0]); return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t; }
    return p[p.length - 1][1];
  }
  function levelFor(p, V) {
    let area = 0;
    for (let y = 190; y > p[0][0]; y -= 0.5) { area += widthAt(p, y) * 0.5; if (area >= V) return y; }
    return p[0][0];
  }
  function profilePath(p) {
    const L = [], Rt = [];
    p.forEach(q => { L.push((60 - q[1] / 2).toFixed(1) + ' ' + q[0]); Rt.push((60 + q[1] / 2).toFixed(1) + ' ' + q[0]); });
    return 'M' + L.join(' L') + ' L' + Rt.reverse().join(' L') + ' Z';
  }
  function pourBench(host, cfg) {
    const kinds = cfg.samples || ['solid', 'liquid', 'gas'];
    const SAMP = { solid: { id: 'stone', n: 'ก้อนหิน' }, liquid: { id: 'water', n: 'น้ำ' }, gas: { id: 'air', n: 'ลมในลูกโป่ง' } };
    const conts = ['tube', 'bowl', 'flask'];
    const gid = art.uid('pb');
    let defs = '<defs><linearGradient id="' + gid + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd2ff"/><stop offset="1" stop-color="#2f9cf0"/></linearGradient>' +
      '<linearGradient id="' + gid + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9af2dd" stop-opacity=".85"/><stop offset="1" stop-color="#52d3b8" stop-opacity=".85"/></linearGradient>';
    conts.forEach(c => { defs += '<clipPath id="' + gid + c + '"><path d="' + profilePath(PROFILES[c].p) + '"/></clipPath>'; });
    defs += '</defs>';
    let stage = '';
    conts.forEach((c, i) => {
      const x = 12 + i * 142;
      stage += '<g class="pc" data-c="' + c + '" transform="translate(' + x + ' 0)">' +
        '<g class="pc-in" clip-path="url(#' + gid + c + ')"><g class="pc-liq"></g><g class="pc-gas"></g><g class="pc-sol"></g></g>' +
        '<path d="' + profilePath(PROFILES[c].p) + '" fill="rgba(235,248,255,.35)" stroke="' + INK + '" stroke-width="4.4" stroke-linejoin="round"/>' +
        '<path d="M' + (60 - widthAt(PROFILES[c].p, PROFILES[c].p[0][0]) / 2 - 6) + ' ' + PROFILES[c].p[0][0] + ' h' + (widthAt(PROFILES[c].p, PROFILES[c].p[0][0]) + 12) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<text x="60" y="206" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + INK + '">' + PROFILES[c].n + '</text>' +
        '<text class="pc-lbl" x="60" y="222" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="#1f6fd0"></text>' +
        '<rect class="pc-hit" x="0" y="10" width="120" height="200" fill="transparent"/></g>';
    });
    host.innerHTML = '<div class="bench pour"><div class="pour-tabs">' + kinds.map(k =>
      '<button class="icard-btn" data-k="' + k + '">' + art.item(SAMP[k].id) + '<b>' + SAMP[k].n + '</b></button>').join('') + '</div>' +
      '<svg class="bench-svg pour-svg" viewBox="0 0 450 232">' + defs + '<rect x="4" y="4" width="442" height="224" rx="22" fill="#eefaff" stroke="' + INK + '" stroke-width="4"/>' +
      stage + '<g class="pour-fx"></g></svg>' +
      '<div class="pour-note">เลือกของทางซ้าย แล้วแตะภาชนะที่จะเท</div>' +
      '<div class="pour-table"></div></div>';
    const svg = host.querySelector('.pour-svg'), fx = svg.querySelector('.pour-fx'), note = host.querySelector('.pour-note'), tbl = host.querySelector('.pour-table');
    const tabs = Array.from(host.querySelectorAll('.icard-btn'));
    const poured = {};      /* kind → Set ภาชนะที่เทแล้ว */
    kinds.forEach(k => poured[k] = new Set());
    let cur = kinds[0], busy = false;
    const content = {};     /* ภาชนะ → kind */

    function selectKind(k) {
      cur = k; tabs.forEach(b => b.classList.toggle('on', b.dataset.k === k));
      note.textContent = 'แตะภาชนะที่จะเท' + SAMP[k].n + 'ใส่';
    }
    tabs.forEach(b => b.addEventListener('click', () => { if (busy) return; audio.sfx('pop', 1); selectKind(b.dataset.k); }));
    selectKind(cur);

    function clearC(c) {
      const g = svg.querySelector('.pc[data-c="' + c + '"]');
      g.querySelector('.pc-liq').innerHTML = ''; g.querySelector('.pc-gas').innerHTML = ''; g.querySelector('.pc-sol').innerHTML = '';
      g.querySelector('.pc-lbl').textContent = '';
      delete content[c];
    }
    function paintTable() {
      let h = '<div class="pt-row pt-head"><span></span><span>รูปร่างเมื่ออยู่ในภาชนะ</span><span>ปริมาตร</span></div>';
      kinds.forEach(k => {
        const know2 = poured[k].size >= 2;
        const shape = k === 'solid' ? chip('คงที่ ไม่เปลี่ยน', 'ok') : chip('เปลี่ยนตามภาชนะ', 'warn');
        const vol = k === 'solid' ? chip('คงที่', 'ok') : k === 'liquid' ? chip('คงที่ (200 มล.)', 'ok') : chip('เต็มภาชนะ ไม่คงที่', 'warn');
        h += '<div class="pt-row"><span class="pt-n">' + art.item(SAMP[k].id) + SAMP[k].n + '</span><span>' + (know2 ? shape : '<i class="pt-q">?</i>') + '</span><span>' + (know2 ? vol : '<i class="pt-q">?</i>') + '</span></div>';
      });
      tbl.innerHTML = h;
    }
    paintTable();

    function pour(c) {
      if (busy) return;
      busy = true;
      const k = cur, g = svg.querySelector('.pc[data-c="' + c + '"]');
      const p = PROFILES[c].p, gx = 12 + conts.indexOf(c) * 142 + 60;
      clearC(c);
      content[c] = k;
      const done = () => {
        poured[k].add(c); busy = false;
        if (k === 'liquid') know('water', 'x');
        paintTable();
        if (cfg.onPour) cfg.onPour(k, c, poured);
      };
      if (k === 'solid') {
        const sol = g.querySelector('.pc-sol');
        const w = Math.min(46, widthAt(p, 180) - 6);
        ui.tween(520, e => {
          const y = -30 + (190 - w - -30) * e;
          sol.innerHTML = '<g transform="translate(60 ' + f1(y + w / 2) + ')">' + at(art.item('stone'), -w / 2, -w / 2, w, w) + '</g>';
        }, () => {
          audio.sfx('thud'); ui.puff(ui.center(g.querySelector('.pc-sol')));
          g.querySelector('.pc-lbl').textContent = 'ก้อนหิน รูปร่างเดิม';
          done();
        }, ui.ease.back);
      } else if (k === 'liquid') {
        const lvl = levelFor(p, VOL), liq = g.querySelector('.pc-liq');
        audio.sfx('pour');
        fx.innerHTML = '<path class="pour-stream" d="M' + (gx + 20) + ' 4 Q' + (gx + 10) + ' 40 ' + gx + ' 90" stroke="#4aa8ff" stroke-width="7" fill="none" stroke-linecap="round"/>';
        ui.tween(900, e => {
          const y = 190 - (190 - lvl) * e;
          const wv = Math.sin(e * 20) * 2;
          liq.innerHTML = '<path d="M-10 ' + f1(y + wv) + ' Q30 ' + f1(y - 3 - wv) + ' 60 ' + f1(y + wv) + ' T130 ' + f1(y - wv) + ' V200 H-10 Z" fill="url(#' + gid + 'w)"/><path d="M-10 ' + f1(y + wv) + ' Q30 ' + f1(y - 3 - wv) + ' 60 ' + f1(y + wv) + ' T130 ' + f1(y - wv) + '" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>';
        }, () => {
          fx.innerHTML = '';
          liq.innerHTML = '<path d="M-10 ' + f1(lvl) + ' H130 V200 H-10 Z" fill="url(#' + gid + 'w)"/><path d="M-10 ' + f1(lvl) + ' H130" stroke="#fff" stroke-width="3" opacity=".8"/>';
          g.querySelector('.pc-lbl').textContent = 'น้ำ 200 มล.';
          audio.sfx('splash');
          done();
        }, ui.ease.linear);
      } else {
        const gas = g.querySelector('.pc-gas');
        audio.sfx('gas');
        let dots = '';
        for (let i = 0; i < 18; i++) dots += '<circle class="gdot" cx="' + (22 + (i * 37) % 80) + '" cy="' + (30 + (i * 53) % 160) + '" r="' + (2 + i % 3) + '" fill="#fff" opacity=".85" style="animation-delay:' + (-i * .23) + 's"/>';
        gas.innerHTML = '<rect x="0" y="0" width="120" height="200" fill="url(#' + gid + 'g)" opacity="0"/>' + dots;
        ui.tween(900, e => { gas.firstChild.setAttribute('opacity', (e * .95).toFixed(2)); gas.style.opacity = e; }, () => {
          g.querySelector('.pc-lbl').textContent = 'แก๊สเต็มภาชนะ';
          done();
        });
      }
    }
    svg.querySelectorAll('.pc').forEach(g => g.addEventListener('click', () => pour(g.dataset.c)));
    return {
      svg, poured, content,
      selectKind,
      allPoured(minEach) { return kinds.every(k => poured[k].size >= (minEach || 2)); },
      pour(c) { pour(c); },
      isBusy: () => busy,
      /* ทดสอบอัตโนมัติ */
      markAll() { kinds.forEach(k => conts.forEach(c => poured[k].add(c))); paintTable(); }
    };
  }

  /* ════════════════════════════════════════════════════
     2) spaceBench : สสารต้องการที่อยู่
     ════════════════════════════════════════════════════ */
  function spaceBench(host, cfg) {
    const gid = art.uid('sp');
    host.innerHTML = '<div class="bench space"><div class="sp-cols">' +
      '<div class="sp-col"><svg class="sp-svg sp-a" viewBox="0 0 200 220"><defs><linearGradient id="' + gid + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd2ff"/><stop offset="1" stop-color="#2f9cf0"/></linearGradient></defs>' +
        '<rect x="3" y="3" width="194" height="214" rx="20" fill="#eefaff" stroke="' + INK + '" stroke-width="4"/>' +
        '<path class="sa-mark" d="M40 110 H160" stroke="#e0457a" stroke-width="3" stroke-dasharray="7 6" opacity="0"/><text class="sa-marktxt" x="164" y="108" font-size="12" font-weight="700" font-family="Mali" fill="#e0457a" opacity="0">ระดับเดิม</text>' +
        '<g class="sa-water"></g>' +
        '<path d="M50 60 H150 L142 196 Q141 204 132 204 H68 Q59 204 58 196 Z" fill="rgba(235,248,255,.3)" stroke="' + INK + '" stroke-width="4.4" stroke-linejoin="round"/>' +
        '<g class="sa-stone" transform="translate(100 24)"><g class="sa-stone-in">' + at(art.item('stone'), -26, -26, 52, 52) + '</g></g></svg>' +
        '<p class="sp-cap">แตะหรือลากก้อนหินลงแก้ว</p></div>' +
      '<div class="sp-col"><svg class="sp-svg sp-b" viewBox="0 0 200 220"><rect x="3" y="3" width="194" height="214" rx="20" fill="#f2fff8" stroke="' + INK + '" stroke-width="4"/>' +
        '<g class="sb-balloon" transform="translate(100 96)"><g class="sb-scale"></g></g>' +
        '<g class="sb-pump" transform="translate(100 190)"><rect x="-30" y="-8" width="60" height="22" rx="8" fill="#ff7a5c" stroke="' + INK + '" stroke-width="3.6"/><g class="sb-handle"><rect x="-4" y="-40" width="8" height="34" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3"/><rect x="-24" y="-48" width="48" height="12" rx="6" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/></g></g></svg>' +
        '<p class="sp-cap">แตะที่สูบลมเข้าลูกโป่ง</p></div></div>' +
      '<div class="sp-msg"></div></div>';
    const sa = host.querySelector('.sp-a'), sb = host.querySelector('.sp-b');
    const water = sa.querySelector('.sa-water'), stone = sa.querySelector('.sa-stone');
    const msg = host.querySelector('.sp-msg');
    let doneA = false, doneB = false, pumps = 0, busy = false;
    const L0 = 150, L1 = 118;
    const waterAt = y => '<path d="M52 ' + y + ' H148 L142 196 Q141 204 132 204 H68 Q59 204 58 196 Z" fill="url(#' + gid + 'w)"/><path d="M52 ' + y + ' H148" stroke="#fff" stroke-width="3" opacity=".8"/>';
    water.innerHTML = waterAt(L0);
    sa.querySelector('.sa-mark').setAttribute('y1', L0);
    sa.querySelector('.sa-mark').setAttribute('d', 'M44 ' + L0 + ' H156');
    sa.querySelector('.sa-marktxt').setAttribute('y', L0 - 4);
    function check() { if (doneA && doneB && cfg.onDone) cfg.onDone(); }
    function dropStone() {
      if (doneA || busy) return;
      busy = true;
      sa.querySelector('.sa-mark').setAttribute('opacity', 1); sa.querySelector('.sa-marktxt').setAttribute('opacity', 1);
      ui.tween(560, e => stone.setAttribute('transform', 'translate(100 ' + (24 + (168 - 24) * e).toFixed(1) + ')'), () => {
        audio.sfx('splash');
        ui.tween(500, e => { water.innerHTML = waterAt(L0 - (L0 - L1) * e); });
        doneA = true; busy = false;
        msg.innerHTML = chip('น้ำสูงขึ้น', 'ok big') + ' ก้อนหินต้องการที่อยู่ เลยดันน้ำขึ้น';
        know('stone', 'x');
        check();
      }, ui.ease.back);
    }
    sa.querySelector('.sa-stone').style.cursor = 'pointer';
    stone.addEventListener('click', dropStone);
    ui.drag(stone, { onStart() { return true; }, onMove() {}, onEnd(p, e, moved) { if (moved) dropStone(); } });
    const bal = sb.querySelector('.sb-scale');
    const drawBalloon = s => {
      bal.innerHTML = '<g transform="scale(' + s.toFixed(3) + ')"><path d="M0 -40 C-30 -40 -38 -16 -38 -2 C-38 24 -16 38 0 44 C16 38 38 24 38 -2 C38 -16 30 -40 0 -40 Z" fill="#8fd8f2" stroke="' + INK + '" stroke-width="3.6"/><path d="M-14 40 L0 52 L14 40 Z" fill="#8fd8f2" stroke="' + INK + '" stroke-width="3"/><path d="M-22 -18 Q-18 -30 -6 -32" stroke="#fff" stroke-width="4.4" fill="none" stroke-linecap="round" opacity=".9"/></g>';
    };
    drawBalloon(.55);
    const pump = sb.querySelector('.sb-pump');
    pump.style.cursor = 'pointer';
    pump.addEventListener('click', () => {
      if (doneB) return;
      pumps++;
      audio.sfx('inflate');
      const h = pump.querySelector('.sb-handle');
      ui.tween(200, e => h.setAttribute('transform', 'translate(0 ' + (18 * Math.sin(e * Math.PI)).toFixed(1) + ')'));
      ui.tween(380, e => drawBalloon(.55 + (pumps - 1) * .3 + .3 * e));
      ui.puff(ui.center(sb.querySelector('.sb-balloon')));
      if (pumps >= 4) { doneB = true; msg.innerHTML = chip('ลูกโป่งพองขึ้น', 'ok big') + ' ลมต้องการที่อยู่ จึงขยายลูกโป่ง'; know('air', 'x'); check(); }
    });
    return { dropStone, pump: () => pump.dispatchEvent(new Event('click')), isDone: () => doneA && doneB, doneA: () => doneA, doneB: () => doneB };
  }

  /* ════════════════════════════════════════════════════
     3) sortBins
     cfg = {items:[{id, name?, html?, ev?}], bins:[{id,label,icon,color,note}], answer(item)→binId,
            evidence(item)→html (ปุ่มทดสอบ), onTest(item), onRight(item,bin), onWrong(item,bin,el), onDone()}
     ════════════════════════════════════════════════════ */
  function sortBins(host, cfg) {
    const items = cfg.items.slice();
    host.innerHTML = '<div class="sorter"><div class="sort-tray">' + items.map(it => {
      const nmx = it.html ? '' : (it.name || nm(it.id));
      return '<div class="scard' + (it.html ? ' text' : '') + '" data-id="' + it.id + '" tabindex="0">' +
        (it.html ? '<div class="scard-txt">' + it.html + '</div>' : '<div class="scard-art">' + art.item(it.id) + '</div><b>' + nmx + '</b>') +
        '<div class="scard-ev"></div>' + (cfg.evidence ? '<button class="scard-test" aria-label="ทดสอบ">' + art.icon(cfg.testIcon || 'magnify') + '<span>' + (cfg.testLabel || 'ทดสอบ') + '</span></button>' : '') + '</div>';
    }).join('') + '</div><div class="sort-bins">' + cfg.bins.map(b =>
      '<div class="bin" data-id="' + b.id + '" style="--bc:' + b.color + '"><div class="bin-h">' + (b.icon ? art.icon(b.icon) : '') + '<b>' + b.label + '</b></div>' + (b.note ? '<small>' + b.note + '</small>' : '') + '<div class="bin-in"></div></div>').join('') + '</div></div>';
    const tray = host.querySelector('.sort-tray');
    const bins = Array.from(host.querySelectorAll('.bin'));
    let selected = null, remaining = items.length;
    const cardOf = id => tray.querySelector('.scard[data-id="' + id + '"]');
    const itemOf = id => items.find(i => i.id === id);
    function select(card) {
      tray.querySelectorAll('.scard').forEach(c => c.classList.toggle('sel', c === card));
      selected = card || null;
    }
    function drop(card, bin) {
      if (!card || !bin) return;
      const it = itemOf(card.dataset.id);
      const ok = cfg.answer(it) === bin.dataset.id;
      if (!ok) {
        audio.sfx('gentle');
        ui.shake(card);
        if (cfg.onWrong) cfg.onWrong(it, bin.dataset.id, card, bin);
        return;
      }
      audio.sfx('pop', 2);
      card.classList.remove('sel');
      const mini = document.createElement('span');
      mini.className = 'bin-mini';
      mini.innerHTML = it.html ? '<em>' + (it.short || '') + '</em>' : art.item(it.id);
      bin.querySelector('.bin-in').appendChild(mini);
      ui.restart(mini, 'pop');
      ui.sparkle(ui.center(bin), 6);
      card.remove(); selected = null;
      remaining--;
      if (cfg.onRight) cfg.onRight(it, bin.dataset.id);
      if (remaining === 0 && cfg.onDone) setTimeout(cfg.onDone, 350);
    }
    function wireCard(card) {
      let ghost = null;
      const t = card.querySelector('.scard-test');
      if (t) t.addEventListener('click', e => {
        e.stopPropagation();
        const it = itemOf(card.dataset.id);
        if (card.classList.contains('tested')) return;
        audio.sfx('pop', 1);
        card.classList.add('testing');
        const wait = cfg.lab ? W.miniLab(cfg.lab(it), it.id, { caption: cfg.evidence(it) }) : new Promise(r => setTimeout(r, 520));
        wait.then(() => {
          card.classList.remove('testing'); card.classList.add('tested');
          card.querySelector('.scard-ev').innerHTML = cfg.evidence(it);
          ui.restart(card.querySelector('.scard-ev'), 'pop');
          if (cfg.onTest) cfg.onTest(it, card);
        });
      });
      ui.drag(card, {
        onStart(p, e) { audio.unlock(); if (e.target.closest && e.target.closest('.scard-test')) return false; return true; },
        onMove(p, e, moved) {
          if (!moved) return;
          if (!ghost) {
            ghost = card.cloneNode(true); ghost.classList.add('drag-ghost', 'scard'); ghost.style.width = card.offsetWidth + 'px';
            document.body.appendChild(ghost); card.classList.add('lifting'); select(card);
          }
          ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
          const b = binAt(p); bins.forEach(x => x.classList.toggle('near', x === b));
        },
        onEnd(p, e, moved) {
          if (ghost) { ghost.remove(); ghost = null; }
          card.classList.remove('lifting'); bins.forEach(x => x.classList.remove('near'));
          if (moved) { drop(card, binAt(p)); return; }
          audio.sfx('pop', 0);
          select(selected === card ? null : card);
        }
      });
    }
    function binAt(p) {
      const els = document.elementsFromPoint(p.x, p.y);
      for (const el of els) { const b = el.closest && el.closest('.bin'); if (b && host.contains(b)) return b; }
      return null;
    }
    tray.querySelectorAll('.scard').forEach(wireCard);
    bins.forEach(b => b.addEventListener('click', () => { if (selected) drop(selected, b); }));
    return {
      select, drop,
      place(id, binId) { drop(cardOf(id), host.querySelector('.bin[data-id="' + binId + '"]')); },
      cardOf, remaining: () => remaining,
      testAll() { tray.querySelectorAll('.scard-test').forEach(b => b.click()); }
    };
  }

  /* ════════════════════════════════════════════════════
     4) choice
     ════════════════════════════════════════════════════ */
  function choice(host, o) {
    host.innerHTML = '<div class="opts ' + (o.cls || '') + '">' + o.options.map((op, i) =>
      '<button class="opt" data-i="' + i + '">' + op.html + '</button>').join('') + '</div>';
    let locked = false;
    const btns = Array.from(host.querySelectorAll('.opt'));
    btns.forEach((b, i) => b.addEventListener('click', () => { if (!locked && !b.disabled) { audio.unlock(); o.onPick(o.options[i].value, b, i); } }));
    return {
      btns,
      lock() { locked = true; btns.forEach(b => b.classList.add('done')); },
      mark(value, cls) { btns.forEach((b, i) => { if (o.options[i].value === value) b.classList.add(cls); }); },
      dim(b) { b.disabled = true; b.classList.add('dim'); }
    };
  }

  /* ════════════════════════════════════════════════════
     5) buildBench : เลือกวัสดุประกอบชิ้นงาน แล้วทดสอบ
     cfg = {kind:'pot'|'cable'|'helmet', onTest(info)}
     info = {ok, bad:[partKey], parts:{k:{id,ok}}}
     ════════════════════════════════════════════════════ */
  function buildBench(host, cfg) {
    const B = MM.GEN.BUILD[cfg.kind];
    const parts = B.parts, assign = {};
    let active = parts[0].k, busy = false, tested = false;
    host.innerHTML = '<div class="build"><div class="build-stage"></div><div class="build-side">' +
      '<div class="build-parts">' + parts.map(p => '<button class="pick-btn part-pill" data-k="' + p.k + '"><span class="pp-n">' + p.n + '</span><span class="pp-m">เลือกวัสดุ</span></button>').join('') + '</div>' +
      '<div class="build-shelf">' + B.shelf.map(id => '<button class="icard-btn" data-id="' + id + '">' + art.item(id) + '<b>' + nm(id) + '</b></button>').join('') + '</div>' +
      '<button class="btn btn-go build-test" disabled>' + art.icon('flask') + '<span>ทดสอบเลย!</span></button>' +
      '<div class="build-msg"></div></div></div>';
    const stage = host.querySelector('.build-stage'), msg = host.querySelector('.build-msg'), go = host.querySelector('.build-test');
    const pills = Array.from(host.querySelectorAll('.part-pill')), shelf = Array.from(host.querySelectorAll('.build-shelf .icard-btn'));
    function extras() {
      if (cfg.kind === 'pot') return '<g class="ob-hand" transform="translate(206 69)"><circle r="14" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.4"/><path d="M-6 -2 q6 6 12 0" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g>' +
        '<g class="ob-say" opacity="0"><rect x="150" y="14" width="72" height="26" rx="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><text class="ob-say-t" x="186" y="32" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + INK + '">ร้อน!</text></g>';
      if (cfg.kind === 'cable') return '<g class="ob-bulb" transform="translate(24 30)"><circle class="ob-glow" r="30" fill="#fff6a8" opacity="0"/><circle class="ob-glass" r="15" fill="#eef4fb" stroke="' + INK + '" stroke-width="3.4"/><rect x="-7" y="13" width="14" height="10" rx="2" fill="#c9d6e4" stroke="' + INK + '" stroke-width="2.6"/><path d="M-4 12 L0 4 L4 12" fill="none" stroke="#8798ab" stroke-width="2.4"/></g>' +
        '<path d="M24 53 V64" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<g class="ob-hand" transform="translate(176 100)"><circle r="14" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.4"/><path d="M-6 0 q6 6 12 0" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g>' +
        '<g class="ob-spark" opacity="0" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"><path d="M150 84 l-8 -10 M164 80 l0 -14 M178 84 l10 -10"/></g>' +
        '<g class="ob-say" opacity="0"><rect x="116" y="104" width="76" height="26" rx="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><text class="ob-say-t" x="154" y="122" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + INK + '">ปลอดภัย</text></g>';
      return '';
    }
    function render() {
      let svgS = art.object(cfg.kind, assign);
      if (cfg.kind === 'pot') svgS = svgS.replace('viewBox="0 0 200 150"', 'viewBox="0 0 232 150"');
      svgS = svgS.replace('</svg>', extras() + '</svg>');
      stage.innerHTML = svgS;
      markActive();
      paintUI();
    }
    function markActive() {
      stage.querySelectorAll('.ob-part.active').forEach(x => x.classList.remove('active'));
      const g = stage.querySelector('.ob-' + active);
      if (g) g.classList.add('active');
    }
    function paintUI() {
      parts.forEach((p, i) => {
        const pill = pills[i];
        pill.classList.toggle('on', p.k === active);
        pill.querySelector('.pp-m').textContent = assign[p.k] ? nm(assign[p.k]) : 'เลือกวัสดุ';
        pill.classList.toggle('filled', !!assign[p.k]);
      });
      go.disabled = busy || !parts.every(p => assign[p.k]);
      shelf.forEach(b => b.classList.toggle('used', parts.some(p => assign[p.k] === b.dataset.id)));
    }
    pills.forEach(pl => pl.addEventListener('click', () => { if (busy) return; audio.sfx('pop', 1); active = pl.dataset.k; render(); }));
    shelf.forEach(b => b.addEventListener('click', () => {
      if (busy) return;
      audio.sfx('plug'); assign[active] = b.dataset.id; tested = false; msg.innerHTML = '';
      const pi = parts.findIndex(p => p.k === active);
      const nxt = parts.find(p => !assign[p.k]);
      if (nxt) active = nxt.k;
      render();
      ui.restart(stage, 'pop');
    }));
    function evaluate() {
      const res = { ok: true, bad: [], parts: {} };
      parts.forEach(p => { const ok = !!p.need(assign[p.k]); res.parts[p.k] = { id: assign[p.k], ok }; if (!ok) { res.ok = false; res.bad.push(p.k); } });
      return res;
    }
    function animate(res) {
      return new Promise(resolve => {
        const q = s => stage.querySelector(s);
        const sayT = (txt, fill) => { const s = q('.ob-say'); if (!s) return; s.querySelector('.ob-say-t').textContent = txt; s.querySelector('rect').setAttribute('fill', fill || '#fff'); s.setAttribute('opacity', 1); };
        if (cfg.kind === 'pot') {
          audio.sfx('fireup'); q('.ob-flames').classList.add('on');
          const bodyOk = res.parts.body.ok, handleOk = res.parts.handle.ok;
          setTimeout(() => {
            if (bodyOk) { q('.ob-bubbles').setAttribute('opacity', 1); q('.ob-bubbles').classList.add('boil'); q('.ob-steam').setAttribute('opacity', 1); q('.ob-steam').classList.add('on'); audio.sfx('sizzle'); setTimeout(() => audio.sfx('hiss'), 200); }
            if (!handleOk) { ui.tween(700, k => q('.ob-handle-hot').setAttribute('opacity', (.9 * k).toFixed(2))); setTimeout(() => { audio.sfx('zap'); sayT('ร้อน!', '#ffd0c8'); ui.shake(q('.ob-hand')); }, 600); }
            else setTimeout(() => sayT('จับสบาย', '#d8ffe9'), 500);
            setTimeout(resolve, 1500);
          }, 700);
        } else if (cfg.kind === 'cable') {
          audio.sfx('plug');
          const coreOk = res.parts.core.ok, coverOk = res.parts.cover.ok;
          setTimeout(() => {
            if (coreOk) { q('.ob-flow').setAttribute('opacity', 1); q('.ob-flow').classList.add('run'); q('.ob-glow').setAttribute('opacity', 1); q('.ob-glass').setAttribute('fill', '#fff6a8'); audio.sfx('bulbOn'); }
            else { audio.sfx('bulbOff'); }
            setTimeout(() => {
              if (!coverOk) { q('.ob-spark').setAttribute('opacity', 1); audio.sfx('zap'); sayT('อันตราย!', '#ffd0c8'); ui.shake(q('.ob-hand')); }
              else sayT('ปลอดภัย', '#d8ffe9');
              setTimeout(resolve, 1200);
            }, 700);
          }, 500);
        } else {
          const shellOk = res.parts.shell.ok, padOk = res.parts.pad.ok;
          const pad = MM.ITEM[assign.pad];
          const ball = q('.ob-ball'), hat = q('.ob-hat'), shell = q('.ob-shell'), padG = q('.ob-pad');
          audio.sfx('whoosh');
          ui.tween(520, k => ball.setAttribute('transform', 'translate(0 ' + (44 * k).toFixed(1) + ')'), () => {
            audio.sfx(shellOk ? 'knockHard' : 'squish');
            ui.tween(220, k => {
              const kk = Math.sin(k * Math.PI);
              if (!shellOk) shell.setAttribute('style', 'transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(' + (1 - .28 * kk).toFixed(3) + ')');
              if (padG && pad && pad.hard <= 2) padG.setAttribute('style', 'transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(' + (1 - .4 * kk).toFixed(3) + ')');
            }, () => {
              if (pad && !pad.elastic && pad.hard <= 2 && padG) padG.setAttribute('style', 'transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.66)');
              if (!shellOk || !padOk) {
                q('.ob-face-ok').setAttribute('opacity', 0); q('.ob-face-ouch').setAttribute('opacity', 1); audio.sfx('zap'); ui.shake(stage);
              }
              ui.tween(500, k => ball.setAttribute('transform', 'translate(' + (34 * k).toFixed(1) + ' ' + (44 - 46 * Math.sin(k * Math.PI) - 4 * k).toFixed(1) + ')'), () => setTimeout(resolve, 600));
            });
          }, ui.ease.linear);
        }
      });
    }
    go.addEventListener('click', async () => {
      if (busy || go.disabled) return;
      audio.unlock();
      busy = true; go.disabled = true; msg.innerHTML = '';
      const res = evaluate();
      await animate(res);
      busy = false; tested = true;
      go.disabled = false;
      if (res.ok) msg.innerHTML = chip('ผ่านการทดสอบ!', 'ok big');
      else {
        const p = parts.find(x => x.k === res.bad[0]);
        msg.innerHTML = chip('ยังไม่ผ่าน', 'warn big') + ' ' + p.n + 'ยังไม่เหมาะ';
        active = res.bad[0];
        markActive(); paintUI();
      }
      if (cfg.onTest) cfg.onTest(res);
    });
    render();
    return {
      assign, render,
      set(k, id) { assign[k] = id; render(); },
      test() { go.click(); },
      setActive(k) { active = k; render(); },
      isBusy: () => busy
    };
  }

  /* ════════════════════════════════════════════════════
     6) mysteryBench : นักสืบวัสดุลึกลับ
     cfg = {secret, cand:[id], onTest(test,val), onGuess(id)}
     ════════════════════════════════════════════════════ */
  const MT = {
    press:   { ic: 'press', n: 'กดด้วยนิ้ว', fmt: v => v === 'hard' ? ['กดแล้วไม่บุ๋ม', 'ok'] : ['กดแล้วบุ๋ม', 'warn'], know: 'hard' },
    elastic: { ic: 'pull', n: 'ออกแรงแล้วปล่อย', fmt: v => v ? ['ปล่อยแล้วกลับเหมือนเดิม', 'ok'] : ['ปล่อยแล้วไม่กลับ / รูปไม่เปลี่ยน', 'warn'], know: 'elastic' },
    heat:    { ic: 'flame', n: 'ทดสอบความร้อน', fmt: v => v ? ['ความร้อนวิ่งผ่านเร็ว', 'ok'] : ['ความร้อนผ่านช้ามาก', 'warn'], know: 'heat' },
    elec:    { ic: 'bolt', n: 'ทดสอบไฟฟ้า', fmt: v => v ? ['หลอดไฟติด', 'ok'] : ['หลอดไฟไม่ติด', 'warn'], know: 'elec' }
  };
  function mysteryBench(host, cfg) {
    const gid = art.uid('mb');
    host.innerHTML = '<div class="mystery"><div class="my-left"><svg class="my-svg" viewBox="0 0 220 190"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6b87a"/><stop offset="1" stop-color="#b9783a"/></linearGradient></defs>' +
      '<rect x="3" y="3" width="214" height="184" rx="22" fill="#f4f1ff" stroke="' + INK + '" stroke-width="4"/>' +
      '<g class="my-crate"><ellipse cx="90" cy="162" rx="56" ry="8" fill="rgba(34,48,90,.2)"/><rect x="38" y="62" width="104" height="94" rx="12" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="4.4"/>' +
      '<path d="M38 88 H142 M38 128 H142" stroke="' + INK + '" stroke-width="3" opacity=".55"/><rect x="62" y="82" width="56" height="54" rx="10" fill="#fff8e6" stroke="' + INK + '" stroke-width="3.6"/>' +
      '<text x="90" y="124" text-anchor="middle" font-size="44" font-weight="800" font-family="Baloo 2, Mali" fill="#8b5cf6">?</text></g>' +
      '<g class="my-thermo" opacity="0"><rect x="152" y="40" width="14" height="70" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect class="my-mer" x="156" y="100" width="6" height="0" fill="#ff3d2e"/><circle cx="159" cy="116" r="10" fill="#ff3d2e" stroke="' + INK + '" stroke-width="3"/></g>' +
      '<g class="my-bulb" transform="translate(186 70)"><circle class="my-glow" r="26" fill="#fff6a8" opacity="0"/><circle class="my-glass" r="13" fill="#eef4fb" stroke="' + INK + '" stroke-width="3.2"/><rect x="-6" y="11" width="12" height="9" rx="2" fill="#c9d6e4" stroke="' + INK + '" stroke-width="2.4"/></g></svg>' +
      '<div class="my-tests">' + Object.keys(MT).map(t => '<button class="tool-btn" data-t="' + t + '">' + art.icon(MT[t].ic) + '<span>' + MT[t].n + '</span></button>').join('') + '</div></div>' +
      '<div class="my-right"><div class="my-seen"><span class="my-empty">ยังไม่ได้ทดสอบ แตะปุ่มด้านซ้าย</span></div>' +
      '<p class="my-ask">วัสดุในลังคืออะไร?</p><div class="my-cands">' + cfg.cand.map(id => '<button class="icard-btn" data-id="' + id + '">' + art.item(MM.MYST[id].art) + '<b>' + MM.MYST[id].n + '</b></button>').join('') + '</div></div></div>';
    const seenEl = host.querySelector('.my-seen'), crate = host.querySelector('.my-crate');
    const seen = {};
    let locked = false;
    function run(t) {
      const v = MM.GEN.mysteryResult(cfg.secret, t);
      if (!(t in seen)) {
        seen[t] = v;
        const f = MT[t].fmt(v);
        if (seenEl.querySelector('.my-empty')) seenEl.innerHTML = '';
        seenEl.insertAdjacentHTML('beforeend', '<div class="my-line">' + art.icon(MT[t].ic) + '<span>' + MT[t].n + ':</span>' + chip(f[0], f[1]) + '</div>');
      }
      const svg = host.querySelector('.my-svg');
      if (t === 'press') { audio.sfx(v === 'hard' ? 'knockHard' : 'squish'); ui.tween(360, k => { const s = v === 'hard' ? 1 : 1 - .16 * Math.sin(k * Math.PI); crate.setAttribute('transform', 'translate(0 ' + (162 * (1 - s)).toFixed(1) + ') scale(1 ' + s.toFixed(3) + ')'); }, () => crate.setAttribute('transform', '')); }
      else if (t === 'elastic') { audio.sfx(v ? 'sproing' : 'stay'); ui.tween(700, (k, kk) => { const s = v ? 1 + .12 * Math.exp(-4 * kk) * Math.cos(16 * kk) : 1 - .1 * Math.sin(Math.min(1, kk * 2) * Math.PI); crate.setAttribute('transform', 'translate(0 ' + (162 * (1 - s)).toFixed(1) + ') scale(1 ' + s.toFixed(3) + ')'); }, () => crate.setAttribute('transform', ''), ui.ease.linear); }
      else if (t === 'heat') {
        const th = svg.querySelector('.my-thermo'), mer = th.querySelector('.my-mer');
        th.setAttribute('opacity', 1); audio.sfx(v ? 'fireup' : 'heat');
        const top = v ? 66 : 12;
        ui.tween(1500, k => { mer.setAttribute('y', 106 - top * k); mer.setAttribute('height', top * k + 4); }, () => { setTimeout(() => th.setAttribute('opacity', 0), 700); });
      } else {
        const gl = svg.querySelector('.my-glow'), gs = svg.querySelector('.my-glass');
        audio.sfx('plug');
        setTimeout(() => {
          gl.setAttribute('opacity', v ? 1 : 0); gs.setAttribute('fill', v ? '#fff6a8' : '#eef4fb'); audio.sfx(v ? 'bulbOn' : 'bulbOff');
          setTimeout(() => { gl.setAttribute('opacity', 0); gs.setAttribute('fill', '#eef4fb'); }, 1400);
        }, 300);
      }
      know(cfg.secret, MT[t].know);
      if (cfg.onTest) cfg.onTest(t, v);
    }
    host.querySelectorAll('.my-tests .tool-btn').forEach(b => b.addEventListener('click', () => { if (!locked) { audio.unlock(); b.classList.add('done'); run(b.dataset.t); } }));
    const cands = Array.from(host.querySelectorAll('.my-cands .icard-btn'));
    cands.forEach(b => b.addEventListener('click', () => { if (!locked && cfg.onGuess) { audio.unlock(); cfg.onGuess(b.dataset.id, b); } }));
    return {
      seen, run, cands,
      lock() { locked = true; },
      dim(id) { const b = cands.find(x => x.dataset.id === id); if (b) { b.disabled = true; b.classList.add('dim'); } },
      mark(id, cls) { const b = cands.find(x => x.dataset.id === id); if (b) b.classList.add(cls); },
      left: () => MM.GEN.mysteryLeft(cfg.cand, seen),
      count: () => Object.keys(seen).length
    };
  }

  /* ════════════════════════════════════════════════════
     miniLab : แอนิเมชันการทดลองสั้น ๆ เด้งขึ้นกลางจอ (กดทดสอบแล้วเห็นภาพการทดลองจริง)
     kind = press | elastic | heat | elec | state · id = ตัวอย่าง · o = {caption(html)}
     ════════════════════════════════════════════════════ */
  function miniLab(kind, id, o) {
    o = o || {};
    return new Promise(resolve => {
      const T = { press: 'กดด้วยนิ้ว', elastic: 'ออกแรงแล้วปล่อย', heat: 'จุ่มน้ำร้อน', elec: 'ต่อวงจรไฟฟ้า', state: 'เทลงภาชนะ' }[kind];
      const IC = { press: 'press', elastic: 'pull', heat: 'flame', elec: 'bolt', state: 'drop' }[kind];
      const ov = document.createElement('div');
      ov.className = 'minilab';
      ov.innerHTML = '<div class="ml-card"><div class="ml-title">' + art.icon(IC) + '<b>' + T + ': ' + nm(id) + '</b></div>' +
        '<svg viewBox="0 0 320 220" aria-hidden="true"><rect x="2" y="2" width="316" height="216" rx="18" fill="#eefaff"/><g class="ml-s"></g></svg><p class="ml-cap"></p></div>';
      document.body.appendChild(ov);
      const g = ov.querySelector('.ml-s'), cap = ov.querySelector('.ml-cap');
      let closed = false;
      const close = () => { if (closed) return; closed = true; ov.remove(); resolve(); };
      ov.addEventListener('click', close);
      const done = () => { cap.innerHTML = o.caption || ''; ui.restart(cap, 'pop'); setTimeout(close, 1500); };
      const it = MM.ITEM[id] || MM.SI[id] || {};
      const floor = '<rect x="20" y="168" width="280" height="10" rx="5" fill="#d9a066" stroke="' + INK + '" stroke-width="3"/>';
      const finger = (x, y) => '<g transform="translate(' + x + ' ' + y + ')"><rect x="-13" y="-56" width="26" height="56" rx="13" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.4"/><ellipse cx="0" cy="-12" rx="8" ry="9" fill="#fff0e0" stroke="' + INK + '" stroke-width="2.2"/></g>';
      const osc = (d0, w, z, ms, fn, end) => ui.tween(ms, (e, k) => fn(d0 * Math.exp(-z * k * 1.2) * Math.cos(w * k * 1.2)), end, ui.ease.linear);
      const KD = W.KIND[id];

      if (kind === 'press' || (kind === 'elastic' && ['squash', 'crumple', 'rigid'].indexOf(KD) >= 0)) {
        const el = kind === 'elastic';
        const amt = el ? (KD === 'rigid' ? 0 : (W.SQ_M[id] || .5)) : (it.hard <= 1 ? .4 : it.hard === 2 ? .16 : it.hard === 3 ? .02 : 0);
        const back = it.elastic === true;
        const base = 160, cx = 160;
        const draw = (sy, fy) => {
          const sx = 1 + (1 - sy) * .5;
          g.innerHTML = floor + '<ellipse cx="160" cy="166" rx="56" ry="6" fill="rgba(34,48,90,.2)"/>' +
            '<rect x="102" y="52" width="116" height="116" rx="14" fill="none" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="7 7" opacity="' + (el ? .8 : 0) + '"/>' +
            '<g transform="translate(' + cx + ' ' + base + ') scale(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') translate(' + (-cx) + ' ' + (-base) + ')">' + at(art.item(id), 100, 52, 120, 120) + '</g>' + finger(cx, fy);
        };
        draw(1, 20);
        audio.sfx('whoosh');
        ui.tween(600, e => draw(1, 20 + e * 36), () => {
          audio.sfx(amt > 0 ? 'squish' : 'knockHard');
          ui.tween(500, e => draw(1 - amt * e, 56 + e * amt * 55), () => {
            setTimeout(() => {
              if (back && amt > 0) {
                audio.sfx(id === 'ball' ? 'boing' : 'squishUp');
                osc(amt, 9, 5, 800, d => draw(1 - Math.max(-.08, d), 30 + 26 * Math.min(1, Math.abs(d / amt))), () => { draw(1, 10); done(); });
              } else {
                audio.sfx('stay');
                ui.tween(500, e => draw(1 - amt * (1 - e * .06), 56 + amt * 55 - e * (30 + amt * 55)), () => done());
              }
            }, 350);
          });
        });
      } else if (kind === 'elastic') {
        const back = it.elastic === true;
        const stretch = KD === 'stretch' || KD === 'spring';
        const draw = (sx, hx, rot) => {
          g.innerHTML = floor + '<ellipse cx="160" cy="166" rx="70" ry="6" fill="rgba(34,48,90,.2)"/>' +
            '<line x1="70" y1="52" x2="70" y2="170" stroke="' + INK + '" stroke-width="5"/>' +
            '<line x1="180" y1="70" x2="180" y2="160" stroke="#ff8fb0" stroke-width="3" stroke-dasharray="6 6"/>' +
            '<g transform="translate(70 0) scale(' + sx.toFixed(3) + ' 1) translate(-70 0) rotate(' + rot + ' 70 160)">' + at(art.item(id), 70, 66, 110, 110) + '</g>' +
            '<g transform="translate(' + hx + ' 124)"><circle r="14" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3.4"/></g>';
        };
        draw(1, 190, 0);
        ui.tween(900, e => draw(stretch ? 1 + .9 * e : 1, 190 + (stretch ? 90 * e : 20 * e), KD === 'bend' ? -30 * e : 0), () => {
          setTimeout(() => {
            if (stretch && back) { audio.sfx(KD === 'spring' ? 'sproing' : 'twang'); osc(.9, 14, 4, 900, d => draw(1 + d, 190 + 90 * d, 0), () => { draw(1, 190, 0); done(); }); }
            else { audio.sfx('stay'); setTimeout(done, 400); }
          }, 300);
        });
      } else if (kind === 'heat') {
        const col = (W.ROD_COL && W.ROD_COL[id]) || art.look(id);
        const gid = art.uid('ml'), Tt = it.heat || 60;
        const draw = (p, melt) => {
          const hh = 30 + 130 * p;
          g.innerHTML = '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + col[0] + '"/><stop offset="1" stop-color="' + col[1] + '"/></linearGradient>' +
            '<linearGradient id="' + gid + 'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23f" stop-opacity=".1"/><stop offset=".25" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff3d2e"/></linearGradient>' +
            '<clipPath id="' + gid + 'c"><rect x="150" y="30" width="20" height="160" rx="10"/><circle cx="160" cy="176" r="20"/></clipPath></defs>' +
            '<rect x="150" y="30" width="20" height="160" rx="10" fill="url(#' + gid + ')"/><circle cx="160" cy="176" r="20" fill="url(#' + gid + ')"/>' +
            '<g clip-path="url(#' + gid + 'c)"><rect x="140" y="' + (200 - hh) + '" width="40" height="' + hh + '" fill="url(#' + gid + 'h)"/></g>' +
            '<rect x="150" y="30" width="20" height="160" rx="10" fill="none" stroke="' + INK + '" stroke-width="3.4"/><circle cx="160" cy="176" r="20" fill="none" stroke="' + INK + '" stroke-width="3.4"/>' +
            '<g transform="translate(0 ' + (melt * 8) + ') translate(160 30) scale(' + (1 + melt * .7).toFixed(2) + ' ' + (1 - melt * .8).toFixed(2) + ') translate(-160 -30)"><rect x="143" y="8" width="34" height="22" rx="6" fill="#ffe27a" stroke="' + INK + '" stroke-width="3.2"/></g>' +
            (melt > .6 ? '<ellipse cx="160" cy="' + (36 + melt * 30) + '" rx="4" ry="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/>' : '') +
            '<path d="M80 130 H240 L232 205 Q231 212 222 212 H98 Q89 212 88 205 Z" fill="rgba(190,230,255,.3)" stroke="' + INK + '" stroke-width="4"/>' +
            '<path d="M84 150 Q120 142 160 150 T236 150 L232 205 Q231 209 222 209 H98 Q91 209 90 205 Z" fill="#ff7a5c" opacity=".55"/>' +
            '<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M110 120 q7 -8 0 -16 t0 -16"/><path d="M210 120 q7 -8 0 -16 t0 -16"/></g>';
        };
        draw(0, 0); audio.sfx('fireup');
        ui.tween(2200, (e, k) => { const t = k * 14; const p = Math.min(1, t / Tt); const m = p >= 1 ? Math.min(1, (t - Tt) / 2) : 0; draw(p, m); }, () => { if (Tt <= 6) { audio.sfx('sizzle'); audio.sfx('drip'); } done(); }, ui.ease.linear);
      } else if (kind === 'elec') {
        const on = it.elec === true;
        const wire = d => '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#ff7a5c" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>';
        const draw = (lit, flow) => {
          g.innerHTML = wire('M50 100 V40 H270 V70') + wire('M270 130 V176 H212') + wire('M108 176 H50 V150') +
            '<g transform="translate(28 98)"><rect width="44" height="54" rx="9" fill="#2d3b66" stroke="' + INK + '" stroke-width="3.4"/><rect y="18" width="44" height="18" fill="#ffd23f"/><path d="M0 18 H44 M0 36 H44" stroke="' + INK + '" stroke-width="2.6"/></g>' +
            '<circle cx="108" cy="176" r="7" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3"/><circle cx="212" cy="176" r="7" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3"/>' +
            '<g transform="translate(120 112)">' + at(art.item(id), 0, 0, 80, 80) + '</g>' +
            '<g transform="translate(270 100)"><circle r="' + (lit ? 52 : 0) + '" fill="rgba(255,240,120,.55)"/><rect x="-10" y="18" width="20" height="14" rx="3" fill="#c9d6e4" stroke="' + INK + '" stroke-width="3"/><circle cy="-4" r="24" fill="' + (lit ? '#fff6a8' : '#eef4fb') + '" stroke="' + INK + '" stroke-width="3.6"/><path d="M-8 18 V6 L0 -8 L8 6 V18" fill="none" stroke="' + (lit ? '#ff8a00' : '#8798ab') + '" stroke-width="2.8"/></g>' +
            (flow ? '<path d="M50 100 V40 H270 V70" fill="none" stroke="#fff6a8" stroke-width="3" stroke-dasharray="3 12" stroke-dashoffset="' + (-flow * 90).toFixed(0) + '" stroke-linecap="round"/>' : '');
        };
        draw(false, 0); audio.sfx('plug');
        ui.tween(1900, (e, k) => draw(on && k > .35, on && k > .35 ? k : 0), () => { audio.sfx(on ? 'bulbOn' : 'bulbOff'); done(); }, ui.ease.linear);
      } else {
        const st = it.s || 'solid';
        const cont = '<path d="M110 60 H210 L204 188 Q203 196 194 196 H126 Q117 196 116 188 Z" fill="rgba(235,248,255,.4)" stroke="' + INK + '" stroke-width="4.4" stroke-linejoin="round"/>';
        const clip = '<defs><clipPath id="mlc"><path d="M111 62 H209 L203 188 Q202 195 194 195 H126 Q118 195 117 188 Z"/></clipPath></defs>';
        const lc = { water: '#4aa8ff', milk: '#fffdf7', oil: '#ffd23f', honey: '#e0900a', juice: '#ff9a3a' }[id] || '#4aa8ff';
        const draw = k => {
          let inner = '';
          if (st === 'solid') { const y = -60 + 210 * ui.ease.back(Math.min(1, k * 1.4)); inner = '<g transform="translate(0 ' + y.toFixed(1) + ')">' + at(art.item(id), 120, 70, 80, 80) + '</g>'; }
          else if (st === 'liquid') { const lvl = 196 - 70 * Math.min(1, k * (it.slow ? .8 : 1.3)); inner = '<g clip-path="url(#mlc)"><path d="M100 ' + (lvl + Math.sin(k * 20) * 2).toFixed(1) + ' H220 V200 H100 Z" fill="' + lc + '"/></g>' + (k < .8 ? '<path d="M160 20 V' + lvl.toFixed(1) + '" stroke="' + lc + '" stroke-width="' + (it.slow ? 5 : 8) + '" stroke-linecap="round"/>' : ''); }
          else { inner = '<g clip-path="url(#mlc)"><rect x="100" y="60" width="120" height="140" fill="#52d3b8" opacity="' + (.85 * Math.min(1, k * 1.4)).toFixed(2) + '"/>' + [0, 1, 2, 3, 4, 5, 6].map(i => '<circle cx="' + (128 + (i * 17) % 70) + '" cy="' + (80 + (i * 29) % 100) + '" r="' + (3 + i % 3) + '" fill="#fff" opacity="' + Math.min(1, k * 2).toFixed(2) + '"/>').join('') + '</g>'; }
          g.innerHTML = clip + floor.replace('y="168"', 'y="196"') + inner + cont;
        };
        draw(0);
        audio.sfx(st === 'solid' ? 'thud' : st === 'liquid' ? 'pour' : 'gas');
        ui.tween(1700, e => draw(e), done, ui.ease.linear);
      }
    });
  }


  Object.assign(W, { miniLab, pourBench, spaceBench, sortBins, choice, buildBench, mysteryBench, PROFILES });
})();
