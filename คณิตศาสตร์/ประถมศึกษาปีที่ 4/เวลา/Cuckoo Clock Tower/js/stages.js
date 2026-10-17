/* ═══════════════════════════════════════════════════════════
   CUCKOO CLOCK TOWER — เนื้อหา 5 ชั้นของหอนาฬิกา
   task = { skill, title, say, judSay?, render(el, api), hint(level), answer, solve() }
   level 1–3 (เฟือง) ปรับอัตโนมัติจาก "ความถูกต้อง" ไม่ใช่ความเร็ว
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CT = window.CT;
  const { T, art, W, ui, audio } = CT;
  const { R, pick, shuffle, uniq, mk } = T;
  const U = T.UNITS;
  const tok = W.tok;                                   /* [{u,n}] → '{hr:2}{min:15}' */
  const tt = t => '{t:' + T.fmtT(t) + '}';             /* นาทีนับจากเที่ยงคืน → ป้ายเวลา */
  const mtok = m => tok(T.minParts(m));                /* จำนวนนาที → ชั่วโมง นาที */
  const LEAD_WRONG = ['เกือบแล้ว! ลองอีกนิด', 'ไม่เป็นไร ลองใหม่ได้!', 'หืม... เข็มยังเพี้ยนนิดนึง', 'ยังไม่ใช่ แต่ใกล้แล้ว!'];
  const PRAISE = ['เป๊ะ!', 'ตรงเวลาเป๊ะ!', 'ถูกต้อง!', 'เยี่ยมไปเลย!', 'ใช่เลย!', 'กุ๊กกู๊! ถูกต้อง!', 'สุดยอด!'];
  const praise = () => pick(PRAISE);
  const eqArr = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

  /* ── ส่วนประกอบหน้าจอที่ใช้ซ้ำ ── */
  function goBtn(label) {
    return '<div class="act"><button class="btn btn-go act-go">' + art.icon('check') + '<span>' + label + '</span></button></div>';
  }
  function ticket(lbl, html, cls) {
    return '<div class="ticket ' + (cls || '') + '"><span class="tk-lbl">' + lbl + '</span><span class="tk-val">' + html + '</span></div>';
  }
  const rich = s => ui.rich(s, true);
  const yesNo = () => [
    { html: art.icon('check') + '<span>ถูก</span>', value: true },
    { html: art.icon('cross') + '<span>ผิด</span>', value: false }
  ];
  const unitBtn = u => ({ html: '<span class="ub" style="--uc:' + U[u].col + '">' + U[u].name + '</span>', value: u });
  const timeFields = () => [{ unit: 'hr', label: 'นาฬิกา', max: 2, pad: true }, { unit: 'min', label: 'นาที', max: 2, pad: true }];
  const durFields = () => [{ unit: 'hr', max: 2 }, { unit: 'min', max: 3 }];

  /* ══════════════════════════════════════════════
     ชั้น 1 : ห้องเฟืองจิ๋ว — วินาที นาที ชั่วโมง
     ══════════════════════════════════════════════ */

  /* จับกิจกรรมใส่กล่องหน่วย */
  function tSortUnits() {
    const cards = [
      { id: 'a', t: 'กระพริบตา 1 ครั้ง', short: 'กระพริบตา', u: 'sec' },
      { id: 'b', t: 'แปรงฟัน', short: 'แปรงฟัน', u: 'min' },
      { id: 'c', t: 'ดูภาพยนตร์ 1 เรื่อง', short: 'ดูหนัง', u: 'hr' }
    ];
    let w, done = 0;
    return {
      skill: 'hms',
      title: 'จับกิจกรรมใส่กล่องหน่วยเวลา',
      say: 'กระพริบตาใช้เวลาแวบเดียว! แตะกิจกรรม แล้วแตะกล่องหน่วยที่เหมาะสม หรือจะลากไปวางก็ได้!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        w = W.sortBuckets(el.querySelector('.w-host'), {
          cards: cards.map(c => ({ id: c.id, html: ui.esc(c.t), mini: ui.esc(c.short) })),
          buckets: ['sec', 'min', 'hr'].map(u => ({ id: u, label: U[u].name, col: U[u].col })),
          onDrop(id, bid) {
            const c = cards.find(x => x.id === id);
            if (c.u === bid) {
              done++;
              if (done === cards.length) setTimeout(() => api.correct(praise() + ' วินาทีใช้กับเรื่องสั้นมาก นาทีใช้กับเรื่องสั้น ๆ ชั่วโมงใช้กับเรื่องยาว!'), 250);
              return true;
            }
            api.wrong(c.short + ' ไม่ได้ใช้เวลาเป็น ' + U[bid].name + ' นะ ' + (U[bid].name === 'ชั่วโมง' ? 'นานไปหน่อย' : 'สั้นไปหน่อย'), null);
            return false;
          }
        });
      },
      hint(l) {
        if (l === 3 && w) { const p = w.pending()[0]; if (p) w.pulse(p, true); }
        return [
          'วินาทีสั้นที่สุด นาทียาวขึ้น ชั่วโมงยาวที่สุด',
          'ลองนึกว่าทำกิจกรรมนั้นนานแค่ไหน แวบเดียว เป็นนาที หรือเป็นชั่วโมง',
          'ดูกิจกรรมที่กะพริบอยู่ ลองเลือกกล่องที่เหมาะดูนะ'
        ][l - 1];
      },
      answer: 'กระพริบตา = วินาที · แปรงฟัน = นาที · ดูภาพยนตร์ = ชั่วโมง',
      solve() { cards.forEach(c => w.drop(c.id, c.u)); }
    };
  }

  /* เลือกหน่วยที่เหมาะสม */
  function tUnitPick(act, skill) {
    let ch;
    const idx = u => act.set.indexOf(u);
    return {
      skill,
      title: 'เลือกหน่วยเวลาที่เหมาะสม',
      say: 'ลองนึกภาพจริง ๆ ดู ทำสิ่งนี้นานแค่ไหนนะ? เลือกหน่วยที่ใช่เลย!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('ใช้เวลาเท่าไร?', '<span class="act-t">' + ui.esc(act.t) + '</span><span class="act-sub">ใช้เวลาประมาณ</span><b class="act-n">' + act.n + '</b><span class="blank">?</span>') + '</div><div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-units',
          options: act.set.map(unitBtn),
          onPick(v, b) {
            if (v === act.u) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ' + act.t + ' ใช้เวลาประมาณ {' + act.u + ':' + act.n + '}', b); }
            else {
              ch.dim(b);
              const longer = idx(v) > idx(act.u);
              api.wrong(longer ? 'ถ้าเป็น ' + act.n + ' ' + U[v].name + ' จะนานเกินไปนะ' : 'ถ้าเป็น ' + act.n + ' ' + U[v].name + ' จะสั้นเกินไปนะ', b);
            }
          }
        });
      },
      hint(l) {
        if (l === 3 && ch) ch.btns.forEach((b, i) => ui.pulse(b, act.set[i] === act.u));
        return [
          act.set.map(u => U[u].name).join(' < ') + ' (เรียงจากสั้นไปยาว)',
          'ลองนึกว่า ' + act.t + ' ถ้าใช้เวลา ' + act.n + ' ' + U[act.set[0]].name + ' จะสั้นหรือยาวเกินไปไหม?',
          'ดูปุ่มที่กะพริบนะ!'
        ][l - 1];
      },
      answer: act.t + ' ใช้เวลาประมาณ {' + act.u + ':' + act.n + '}',
      solve() { ch.mark(act.u, 'good'); }
    };
  }

  /* เปลี่ยนหน่วย */
  function convMeta(q) {
    const pr = q.pair, f = pr.f;
    const total = T.inBase(q.from) / (T.kindOf(pr.small) === 'mo' ? T.MOS[pr.small] : T.SECS[pr.small]);
    const dir = q.from.length === 2 ? 'comp' : (q.from[0].u === pr.big ? 'down' : 'up');
    return { pr, f, total, nBig: Math.floor(total / f), rem: total % f, dir };
  }
  function convExplain(q, M) {
    const ans = q.to.map((u, i) => mk(u, q.ans[i]));
    if (M.dir === 'down') return tok(q.from) + ' = ' + M.nBig + ' × ' + M.f + ' = ' + tok(ans);
    if (M.dir === 'comp') return tok(q.from) + ' = ' + M.nBig + ' × ' + M.f + ' + ' + M.rem + ' = ' + tok(ans);
    if (q.to.length === 1) return tok(q.from) + ' = ' + M.total + ' ÷ ' + M.f + ' = ' + tok(ans);
    return tok(q.from) + ' = ' + M.total + ' ÷ ' + M.f + ' ได้ ' + M.nBig + ' เศษ ' + M.rem + ' = ' + tok(ans);
  }
  function tConvert(q, o) {
    o = o || {};
    const M = convMeta(q), pr = M.pr;
    const skill = pr.big === 'min' || pr.big === 'hr' ? 'hms' : 'dwmy';
    let kp, viz;
    const showViz = full => { viz.innerHTML = art.groups(pr, M.nBig, M.rem, { noSum: !full }); ui.restart(viz, 'enter'); };
    return {
      skill,
      title: o.title || 'เปลี่ยนหน่วย: ' + tok(q.from) + ' = ?',
      say: o.say || (M.dir === 'down' ? '1 ' + U[pr.big].name + ' มีกี่' + U[pr.small].name + 'นะ? หน่วยใหญ่เปลี่ยนเป็นหน่วยเล็ก ตัวเลขจะมากขึ้น!'
        : M.dir === 'comp' ? 'รวมหน่วยใหญ่กับหน่วยเล็ก ให้เป็นหน่วยเล็กทั้งหมดนะ!'
        : q.to.length === 1 ? 'รวมกลุ่มละ ' + M.f + ' ' + U[pr.small].name + ' ได้กี่กลุ่มนะ? หน่วยใหญ่ ตัวเลขจะน้อยลง!'
        : 'แบ่งเป็นกลุ่มละ ' + M.f + ' ได้กี่กลุ่ม แล้วเหลือเศษเท่าไร?'),
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="row-center">' + ticket('ใบสั่งเฟือง', rich(tok(q.from)) + '<b class="eq">=</b><span class="qm">?</span>') + '</div>' +
          '<div class="viz"></div></div><div class="qa-a"><div class="w-host"></div>' + goBtn('ตรวจคำตอบ') + '</div></div>';
        viz = el.querySelector('.viz');
        if (o.viz) showViz(false);
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { fields: q.to.map(u => ({ unit: u, max: 5 })), onEnter: () => go.click() });
        go.addEventListener('click', () => {
          if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
          if (!kp.filled()) return api.nudge('ใส่ให้ครบทุกช่องนะ', go);
          const g = kp.get();
          if (eqArr(g, q.ans)) { kp.lock(); showViz(true); api.correct(praise() + ' ' + convExplain(q, M), go); return; }
          if (q.to.length === 2 && g[1] >= pr.f) {
            if (g[0] * pr.f + g[1] === M.total) return api.nudge('ถูกต้องในค่า แต่ช่อง ' + U[pr.small].name + ' ต้องน้อยกว่า ' + pr.f + ' นะ ลองรวมเป็น ' + U[pr.big].name + ' ก่อน', go);
            return api.nudge('ช่อง ' + U[pr.small].name + ' ต้องน้อยกว่า ' + pr.f + ' นะ ถ้าครบ ' + pr.f + ' ให้รวมเป็น 1 ' + U[pr.big].name, go);
          }
          let d = '';
          const a0 = g[0];
          if (q.to.length === 1) {
            if (a0 === M.nBig * (pr.f === 60 ? 100 : pr.f === 24 ? 20 : 10) && M.dir === 'down') d = 'ระวัง! 1 ' + U[pr.big].name + ' มี ' + pr.f + ' ' + U[pr.small].name + ' ไม่ใช่นับทีละ 10 หรือ 100';
            else if (M.dir === 'down' && a0 < q.ans[0]) d = 'เปลี่ยนเป็นหน่วยเล็ก ตัวเลขต้องมากขึ้นนะ';
            else if (M.dir === 'up' && a0 > q.ans[0]) d = 'เปลี่ยนเป็นหน่วยใหญ่ ตัวเลขต้องน้อยลงนะ';
            else if (M.dir === 'down' && a0 === M.nBig) d = 'ต้องคูณด้วย ' + pr.f + ' ก่อนนะ';
          } else if (g[0] === q.ans[1] && g[1] === q.ans[0]) d = 'สลับช่องแล้วนะ ' + U[pr.big].name + ' ต้องอยู่ช่องแรก';
          api.wrong(d, go);
        });
      },
      hint(l) {
        if (l === 2 && viz) showViz(false);
        if (l === 3 && viz) showViz(true);
        return [
          '{' + pr.big + ':1} = {' + pr.small + ':' + pr.f + '}',
          M.dir === 'down' ? 'มี ' + M.nBig + ' กลุ่ม กลุ่มละ ' + pr.f + ' ดูแท่งด้านบนนะ'
            : M.dir === 'comp' ? 'หน่วยใหญ่ ' + M.nBig + ' กลุ่ม กลุ่มละ ' + pr.f + ' แล้วบวกส่วนที่เหลือ'
            : 'แบ่งเป็นกลุ่มละ ' + pr.f + ' ดูแท่งด้านบนนะ นับกลุ่มเต็มกับที่เหลือ',
          M.dir === 'down' ? 'บวกกัน ' + M.nBig + ' ครั้ง ครั้งละ ' + pr.f + ' ดูผลรวมที่แท่งด้านบน'
            : M.dir === 'comp' ? 'กลุ่มเต็มรวมกับส่วนที่เหลือ ดูผลรวมที่แท่งด้านบน'
            : 'ได้ ' + M.nBig + ' กลุ่มเต็ม' + (M.rem ? ' เหลือเศษ ' + M.rem : '') + ' ดูแท่งด้านบนนะ'
        ][l - 1];
      },
      answer: convExplain(q, M),
      solve() { kp.set(q.ans); showViz(true); }
    };
  }

  /* เจ้าเฟืองซนพูดถูกหรือผิด */
  function tClaim(c, skill, o) {
    o = o || {};
    let ch;
    return {
      skill,
      title: 'เจ้าเฟืองซนพูดถูกหรือผิด?',
      say: 'ฟังให้ดี! เจ้าเฟืองซนพูดถูกหรือผิด? ตัดสินเลย!',
      judSay: o.judSay || ('ข้าบอกเลยนะ! ' + c.t + ' แน่นอน! ใครจะกล้าเถียง!'),
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('เจ้าเฟืองซนบอกว่า', '<span class="claim-t">' + ui.esc(c.t) + '</span>', 'claim') + '</div><div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-2 opts-yn', options: yesNo(),
          onPick(v, b) {
            if (v === c.ok) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ' + c.why, b); }
            else { ch.dim(b); api.wrong(c.ok ? 'เจ้าเฟืองซนพูดถูกนะ!' : 'อันนี้ไม่ใช่นะ!', b); }
          }
        });
      },
      hint(l) {
        return [
          'ลองนึกถึงความสัมพันธ์ของหน่วยเวลา: ' + c.f,
          'ลองเปลี่ยนเป็นหน่วยเดียวกันแล้วเทียบดู',
          c.why
        ][l - 1];
      },
      answer: c.why,
      solve() { ch.mark(c.ok, 'good'); }
    };
  }

  /* หาระยะเวลา / เวลาจบ / เวลาเริ่ม */
  function tSpan(q, o) {
    o = o || {};
    const mode = q.mode;
    let kp, viz;
    const stepTxt = {
      dur: 'ใช้เส้นเวลากระโดด: ไปให้ถึงชั่วโมงเต็มก่อน แล้วบวกส่วนที่เหลือ',
      end: 'บวกชั่วโมงก่อน แล้วค่อยบวกนาที ถ้านาทีครบ 60 ให้ทดเป็น 1 ชั่วโมง',
      start: 'ย้อนกลับ ลบชั่วโมงก่อน แล้วค่อยลบนาที'
    };
    const midBack = mode === 'start' ? q.end - Math.floor(q.dur / 60) * 60 : 0;
    const okText = () => mode === 'dur' ? tt(q.start) + ' ถึง ' + tt(q.end) + ' ใช้เวลา ' + mtok(q.dur)
      : mode === 'end' ? 'เริ่ม ' + tt(q.start) + ' ใช้เวลา ' + mtok(q.dur) + ' จะจบเวลา ' + tt(q.end)
      : 'จบ ' + tt(q.end) + ' ใช้เวลา ' + mtok(q.dur) + ' ต้องเริ่มเวลา ' + tt(q.start);
    return {
      skill: o.skill || 'span',
      title: o.title || (mode === 'dur' ? 'เริ่ม ' + tt(q.start) + ' จบ ' + tt(q.end) + ' ใช้เวลานานเท่าไร?'
        : mode === 'end' ? 'เริ่ม ' + tt(q.start) + ' ใช้เวลา ' + mtok(q.dur) + ' จบกี่โมง?'
        : 'จบ ' + tt(q.end) + ' ใช้เวลา ' + mtok(q.dur) + ' เริ่มกี่โมง?'),
      say: o.say || (mode === 'dur' ? 'ดูนาฬิกาตอนเริ่มกับตอนจบ แล้วหาว่าใช้เวลานานเท่าไร!'
        : mode === 'end' ? 'พิมพ์เวลาจบ แล้วดูเข็มนาฬิกาขยับตามได้เลย!'
        : 'ย้อนเวลากลับ! พิมพ์เวลาเริ่ม แล้วดูเข็มนาฬิกาขยับตามได้เลย!'),
      judSay: o.judSay,
      render(el, api) {
        let top;
        if (mode === 'dur') top = '<div class="ck-pair">' + art.clockCard(q.start, 'เริ่ม') + '<div class="ck-arrow">' + art.icon('right') + '</div>' + art.clockCard(q.end, 'จบ') + '</div>';
        else if (mode === 'end') top = '<div class="row-center">' + ticket('เริ่ม', art.led(q.start)) + ticket('ใช้เวลา', rich(mtok(q.dur))) + '</div>';
        else top = '<div class="row-center">' + ticket('จบ', art.led(q.end)) + ticket('ใช้เวลา', rich(mtok(q.dur))) + '</div>';
        el.innerHTML = '<div class="qa"><div class="qa-q">' + (o.story ? '<p class="story">' + rich(o.story) + '</p>' : '') + top + '<div class="viz"></div></div><div class="qa-a"><div class="w-host"></div>' + goBtn('ตรวจคำตอบ') + '</div></div>';
        viz = el.querySelector('.viz');
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), mode === 'dur'
          ? { fields: durFields(), onEnter: () => go.click() }
          : { fields: timeFields(), clock: true, autoNext: true, onEnter: () => go.click() });
        go.addEventListener('click', () => {
          if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
          if (!kp.filled()) return api.nudge('ใส่ให้ครบทั้ง 2 ช่องนะ', go);
          const g = kp.get();
          if (mode === 'dur') {
            const total = g[0] * 60 + g[1];
            if (total === q.dur) {
              kp.lock();
              api.correct(praise() + ' ' + okText() + (g[1] >= 60 ? ' (' + g[1] + ' นาทีรวมเป็นชั่วโมงได้อีก)' : ''), go);
              return;
            }
            if (g[1] >= 60) return api.nudge('นาทีครบ 60 แล้วต้องรวมเป็น 1 ชั่วโมงนะ! เวลาไม่ใช่ทศนิยม', go);
            return api.wrong(g[0] === q.ans[0] ? 'ชั่วโมงถูกแล้ว แต่นาทียังไม่ใช่' : g[1] === q.ans[1] ? 'นาทีถูกแล้ว แต่ชั่วโมงยังไม่ใช่' : '', go);
          }
          if (g[1] > 59 || g[0] > 23) return api.nudge('นาทีต้องไม่เกิน 59 และชั่วโมงไม่เกิน 23 นะ', go);
          if (g[0] === q.ans[0] && g[1] === q.ans[1]) { kp.lock(); api.correct(praise() + ' ' + okText(), go); return; }
          const tm = g[0] * 60 + g[1];
          let d = '';
          if (g[0] === q.ans[0]) d = 'ชั่วโมงถูกแล้ว ลองดูนาทีอีกที';
          else if (g[1] === q.ans[1]) d = 'นาทีถูกแล้ว ลองดูชั่วโมงอีกที (นาทีครบ 60 ต้องทดเป็นชั่วโมง)';
          else if (Math.abs(tm - (mode === 'end' ? q.end : q.start)) % 60 === 0) d = 'ใกล้แล้ว! ผิดไปแค่ชั่วโมงเดียว';
          api.wrong(d, go);
        });
      },
      hint(l) {
        if (mode === 'dur') {
          if (l >= 2) { viz.innerHTML = art.hops(q.start, q.end, { reveal: l === 2 ? 1 : 99, noTotal: true }); ui.restart(viz, 'enter'); }
        } else if (mode === 'end') {
          if (l >= 2) { viz.innerHTML = art.hops(q.start, q.end, { reveal: l === 2 ? 1 : 99, hideEnd: true }); ui.restart(viz, 'enter'); }
        }
        return [
          stepTxt[mode],
          mode === 'dur' ? 'กระโดดไปทีละช่วง ดูเส้นเวลาด้านบนนะ'
            : mode === 'end' ? 'ดูเส้นเวลาด้านบน กระโดดไปทีละช่วงจากเวลาเริ่ม'
            : tt(q.end) + ' ย้อนกลับ ' + Math.floor(q.dur / 60) + ' ชั่วโมง จะได้ ' + tt(midBack),
          mode === 'dur' ? 'บวกเวลาแต่ละช่วงเข้าด้วยกัน ก็ได้คำตอบแล้ว'
            : mode === 'end' ? 'ช่วงสุดท้ายยังเป็น ? อยู่ ลองบวกเอง!'
            : 'จาก ' + tt(midBack) + ' ย้อนอีก ' + (q.dur % 60) + ' นาที ก็ได้เวลาเริ่ม (ถ้านาทีไม่พอ ให้ยืม 1 ชั่วโมง = 60 นาที)'
        ][l - 1];
      },
      answer: okText(),
      solve() { kp.set(q.ans); }
    };
  }

  /* ══════════════════════════════════════════════
     ชั้น 2 : หอปฏิทินยักษ์ — วัน สัปดาห์ เดือน ปี
     ══════════════════════════════════════════════ */
  function tCal(q) {
    let cal;
    const stepTxt = q.kind === 'week' ? q.step / 7 + ' สัปดาห์' : q.kind === 'back' ? q.step + ' วันที่แล้ว' : 'อีก ' + q.step + ' วัน';
    const title = q.kind === 'week' ? 'วันนี้วันที่ ' + q.today + ' อีก ' + q.step / 7 + ' สัปดาห์ เป็นวันที่เท่าไร?'
      : q.kind === 'back' ? 'วันนี้วันที่ ' + q.today + ' เมื่อ ' + q.step + ' วันที่แล้ว เป็นวันที่เท่าไร?'
      : 'วันนี้วันที่ ' + q.today + ' อีก ' + q.step + ' วัน เป็นวันที่เท่าไร?';
    return {
      skill: 'dwmy',
      title,
      say: q.kind === 'week' ? '1 สัปดาห์ = 7 วัน! แตะวันที่ที่ถูกต้องบนปฏิทินเลย!' : 'แตะวันที่ที่ถูกต้องบนปฏิทิน ลองนับทีละสัปดาห์ก่อนก็ได้นะ!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        cal = W.calendar(el.querySelector('.w-host'), {
          mo: q.mo, dow0: q.dow0, days: q.days, today: q.today,
          onPick(d, btn) {
            if (d === q.target) { cal.mark(d, 'good'); cal.lock(); api.correct(praise() + ' วันที่ ' + q.target + ' ตรงกับวัน' + q.dowT + ' (' + (q.dir > 0 ? q.today + ' + ' : q.today + ' - ') + q.step + ' = ' + q.target + ')', btn); }
            else {
              cal.mark(d, 'bad'); setTimeout(() => cal.unmark('bad'), 700);
              const dist = Math.abs(d - q.today);
              api.wrong('วันที่ ' + d + ' ห่างจากวันนี้ ' + dist + ' วัน' + (d === q.today ? ' (นั่นคือวันนี้เลย)' : (d > q.today ? ' ข้างหน้า' : ' ย้อนหลัง')) + (dist === q.step && (d > q.today) !== (q.dir > 0) ? ' ผิดทิศทางนะ' : ''), btn);
            }
          }
        });
      },
      hint(l) {
        if (l === 2 && cal) { const k = Math.floor(q.step / 7); for (let i = 1; i <= k; i++) cal.flash(q.today + q.dir * 7 * i, true); }
        if (l === 3 && cal) cal.flash(q.target, true);
        return [
          '1 สัปดาห์ = 7 วัน เลื่อนลงมา 1 แถวบนปฏิทิน ก็คือวันเดียวกันของสัปดาห์ถัดไป',
          q.kind === 'week' ? 'นับทีละแถวจากวันนี้ ' + q.step / 7 + ' แถว (ดูช่องที่กะพริบ)' : 'กระโดดทีละสัปดาห์ (7 วัน) ก่อน ดูช่องที่กะพริบ แล้วนับวันที่เหลือ',
          'ดูช่องที่กะพริบเป็นคำตอบนะ!'
        ][l - 1];
      },
      answer: 'วันที่ ' + q.target + ' (' + stepTxt + ')',
      solve() { cal.mark(q.target, 'good'); cal.flash(q.target, true); }
    };
  }

  function tMonthDays(mo) {
    let ch, viz;
    const ans = mo.d === 28 ? '28' : String(mo.d);
    const tail = mo.d === 30 ? 'ลงท้ายด้วย ยน' : mo.d === 31 ? 'ลงท้ายด้วย คม' : 'เป็นเดือนพิเศษ';
    return {
      skill: 'dwmy',
      title: 'เดือน' + mo.n + ' มีกี่วัน?',
      say: 'จำง่าย ๆ ดูที่ท้ายชื่อเดือนนะ! เลือกจำนวนวันที่ถูกต้อง!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('ป้ายเดือน', '<span class="mo-name">' + mo.n + '</span><span class="blank">?</span><span class="mo-unit">วัน</span>') + '</div><div class="viz"></div><div class="w-host"></div>';
        viz = el.querySelector('.viz');
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-3',
          options: [{ html: '<b class="big">28</b><small>หรือ 29 วัน</small>', value: '28' }, { html: '<b class="big">30</b><small>วัน</small>', value: '30' }, { html: '<b class="big">31</b><small>วัน</small>', value: '31' }],
          onPick(v, b) {
            if (v === ans) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' เดือน' + mo.n + ' ' + tail + ' มี ' + (mo.d === 28 ? '28 วัน (ปีอธิกสุรทิน 29 วัน)' : mo.d + ' วัน'), b); }
            else { ch.dim(b); api.wrong('', b); }
          }
        });
      },
      hint(l) {
        if (l === 2) { viz.innerHTML = art.monthBoard(); ui.restart(viz, 'enter'); }
        if (l === 3 && ch) ch.btns.forEach((b, i) => ui.pulse(b, ['28', '30', '31'][i] === ans));
        return [
          'เดือนที่ลงท้ายว่า ยน มี 30 วัน · เดือนที่ลงท้ายว่า คม มี 31 วัน · กุมภาพันธ์ มี 28 หรือ 29 วัน',
          'ดูป้ายเดือนด้านบน หาเดือน' + mo.n + ' แล้วดูตัวเลขข้าง ๆ',
          'เดือน' + mo.n + ' ' + tail + ' ดูปุ่มที่กะพริบนะ'
        ][l - 1];
      },
      answer: 'เดือน' + mo.n + ' ' + tail,
      solve() { ch.mark(ans, 'good'); }
    };
  }

  function tMonthsPick(days) {
    let pm, good;
    const feb = T.MONTHS[1];
    const pool = T.MONTHS.filter(m => m.n !== 'กุมภาพันธ์');
    const want = pool.filter(m => m.d === days), other = pool.filter(m => m.d !== days);
    const ms = shuffle(shuffle(want).slice(0, days === 30 ? 2 : 3).concat(shuffle(other).slice(0, days === 30 ? 3 : 2)).concat(Math.random() < 0.5 ? [feb] : []));
    good = ms.filter(m => m.d === days).map(m => m.n).sort();
    return {
      skill: 'dwmy',
      title: 'เลือกทุกเดือนที่มี ' + days + ' วัน',
      say: 'เดือนที่ลงท้ายว่า ' + (days === 30 ? 'ยน' : 'คม') + ' ใช่ไหมนะ? แตะเลือกทุกเดือนที่ใช่!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ตรวจคำตอบ');
        pm = W.pickMany(el.querySelector('.w-host'), { cls: 'pm-months', items: ms.map(m => ({ id: m.n, html: '<b>' + m.n + '</b>' })) });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = pm.get();
          if (!g.length) return api.nudge('ยังไม่ได้เลือกเดือนเลย!', go);
          if (eqArr(g, good)) { pm.lock(); api.correct(praise() + ' เดือนที่มี ' + days + ' วัน คือ ' + good.join(' ') + ' (ลงท้ายด้วย ' + (days === 30 ? 'ยน' : 'คม') + ')', go); return; }
          const wrong = g.filter(x => good.indexOf(x) < 0);
          wrong.forEach(x => pm.mark(x, 'bad'));
          api.wrong(wrong.length ? wrong.join(' ') + ' ไม่ใช่เดือนที่มี ' + days + ' วันนะ' : 'ยังหาไม่ครบนะ ยังมีเดือนที่ใช่อีก', go);
        });
      },
      hint(l) {
        if (l === 3 && pm) { const x = good.find(n => pm.get().indexOf(n) < 0); if (x) pm.flag(x, 'hl'); }
        return [
          'เดือนที่ลงท้ายว่า ยน มี 30 วัน · ลงท้ายว่า คม มี 31 วัน · กุมภาพันธ์ มี 28 หรือ 29 วัน',
          'ดูท้ายชื่อเดือนทีละเดือนเลย ลงท้ายว่า ' + (days === 30 ? 'ยน' : 'คม') + ' หรือเปล่า?',
          'มีทั้งหมด ' + good.length + ' เดือน ดูเดือนที่กะพริบนะ'
        ][l - 1];
      },
      answer: good.join(' ') + ' มี ' + days + ' วัน',
      solve() { pm.set(good); }
    };
  }

  /* ══════════════════════════════════════════════
     ชั้น 3 : ตาชั่งเฟืองทอง — เปรียบเทียบระยะเวลา
     ══════════════════════════════════════════════ */
  function cmpExplain(a, b, c) {
    const u = W.smallestUnit(a.concat(b));
    const va = W.valIn(a, u), vb = W.valIn(b, u);
    return tok(a) + ' = ' + tok([mk(u, va)]) + ' และ ' + tok(b) + ' = ' + tok([mk(u, vb)]) + (c === 0 ? ' เท่ากันพอดี' : c > 0 ? ' ฝั่งซ้ายนานกว่า' : ' ฝั่งขวานานกว่า');
  }
  function tCompare(q, o) {
    o = o || {};
    let sc;
    const sym = c => c > 0 ? '>' : c < 0 ? '<' : '=';
    return {
      skill: 'compare',
      title: o.title || 'ตาชั่งระยะเวลา: ' + tok(q.a) + ' ? ' + tok(q.b),
      say: o.say || 'เปลี่ยนให้เป็นหน่วยเดียวกันก่อน แล้วเลือกเครื่องหมาย > = < ให้ถูก!',
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        sc = W.scaleCompare(el.querySelector('.w-host'), {
          a: q.a, b: q.b,
          onPick(s, b) {
            if (s === q.c) {
              sc.lock(); sc.mark(s, 'good'); sc.setTilt(q.c); sc.helper(true);
              api.correct(praise() + ' ' + cmpExplain(q.a, q.b, q.c) + ' ดังนั้น ' + tok(q.a) + ' ' + sym(q.c) + ' ' + tok(q.b), b);
            } else {
              sc.dim(b);
              let d = '';
              if (q.trap && s === T.sgn(Math.max(...q.a.map(p => p.n)) - Math.max(...q.b.map(p => p.n)))) d = 'ตัวเลขมากกว่าไม่ได้แปลว่านานกว่า! ต้องดูหน่วยด้วยนะ';
              else if (q.c === 0) d = 'ลองเปลี่ยนเป็นหน่วยเดียวกัน อาจเท่ากันพอดีก็ได้นะ';
              else if (s === 0) d = 'ลองเปลี่ยนเป็นหน่วยเดียวกัน ตัวเลขไม่เท่ากันนะ';
              api.wrong(d, b);
            }
          }
        });
        if (o.helper) sc.helper(true);
      },
      hint(l) {
        if (l >= 2 && sc) sc.helper(true);
        return [
          'เปลี่ยนให้เป็นหน่วยเดียวกันก่อน ถึงจะเทียบกันได้',
          'ดูแถบเทียบด้านล่าง ตอนนี้ทั้งสองข้างเป็นหน่วยเดียวกันแล้ว',
          'ดูความยาวแท่งสิ! แท่งไหนยาวกว่า ฝั่งนั้นนานกว่า'
        ][l - 1];
      },
      answer: cmpExplain(q.a, q.b, q.c),
      solve() { sc.setTilt(q.c); sc.helper(true); sc.mark(q.c, 'good'); }
    };
  }

  function tOrderDur(q, dir) {
    let od, viz;
    const sorted = q.cards.slice().sort((x, y) => dir === 'asc' ? x.base - y.base : y.base - x.base);
    const want = sorted.map(c => c.id);
    const u = W.smallestUnit([].concat(...q.cards.map(c => c.parts)));
    return {
      skill: 'compare',
      title: dir === 'asc' ? 'เรียงระยะเวลา จากสั้นที่สุดไปนานที่สุด' : 'เรียงระยะเวลา จากนานที่สุดไปสั้นที่สุด',
      say: 'เปลี่ยนเป็นหน่วยเดียวกันก่อน แล้วแตะป้ายเพื่อวางลงช่อง จะลากก็ได้!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div><div class="viz"></div>' + goBtn('ตรวจลำดับ');
        viz = el.querySelector('.viz');
        od = W.order(el.querySelector('.w-host'), {
          items: q.cards.map(c => ({ id: c.id, html: W.durHTML(c.parts) })),
          ends: dir === 'asc' ? ['สั้นที่สุด', 'นานที่สุด'] : ['นานที่สุด', 'สั้นที่สุด'],
          labels: q.cards.map((_, i) => i === 0 ? (dir === 'asc' ? 'สั้นสุด' : 'นานสุด') : i === q.cards.length - 1 ? (dir === 'asc' ? 'นานสุด' : 'สั้นสุด') : 'ที่ ' + (i + 1)),
          onChange: () => od && od.clearBad()
        });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          if (!od.filled()) return api.nudge('วางป้ายให้ครบทุกช่องก่อนนะ', go);
          const g = od.get();
          if (eqArr(g, want)) { od.lock(); api.correct(praise() + ' ' + sorted.map(c => tok(c.parts)).join(dir === 'asc' ? ' < ' : ' > '), go); return; }
          g.forEach((id, i) => { if (id !== want[i]) od.bad(i); });
          api.wrong('ช่องที่แดงยังไม่ใช่นะ ลองเทียบป้ายที่อยู่ติดกัน', go);
        });
      },
      hint(l) {
        if (l === 2) {
          const rows = shuffle(q.cards).map(c => '<div class="hlp-row"><span class="hlp-t">' + W.durHTML(c.parts) + '</span><b>=</b><span class="hlp-v">' + W.durHTML([mk(u, W.valIn(c.parts, u))]) + '</span></div>').join('');
          viz.innerHTML = '<div class="scl-help"><div class="hlp-title">เทียบเป็น ' + rich('{u:' + u + '}') + ' เหมือนกัน</div>' + rows + '</div>';
          ui.restart(viz, 'enter');
        }
        if (l === 3 && od) od.set([want[0]]);
        return [
          'เปลี่ยนทุกป้ายให้เป็นหน่วยเดียวกันก่อน แล้วค่อยเรียง',
          'ดูแถบเทียบด้านล่าง ตอนนี้ทุกป้ายเป็นหน่วย ' + U[u].name + ' แล้ว',
          'ใส่ป้ายแรกให้แล้ว ' + (dir === 'asc' ? 'สั้นที่สุด' : 'นานที่สุด') + ' ต่อด้วยป้ายที่ใกล้เคียงที่สุด'
        ][l - 1];
      },
      answer: sorted.map(c => tok(c.parts)).join(dir === 'asc' ? ' < ' : ' > '),
      solve() { od.set(want); }
    };
  }

  function tEq(q) {
    let pm, viz;
    const good = q.cards.filter(c => c.ok).map(c => c.id).sort();
    const u = W.smallestUnit(q.target.concat([mk(q.pair.small, 1)]));
    return {
      skill: 'compare',
      title: 'เลือกทุกป้ายที่เท่ากับ ' + tok(q.target),
      say: 'ป้ายบางอันเขียนต่างกัน แต่ระยะเวลาเท่ากันได้! เปลี่ยนหน่วยแล้วเลือกให้ครบ!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('ระยะเวลาเป้าหมาย', rich(tok(q.target))) + '</div><div class="w-host"></div><div class="viz"></div>' + goBtn('ตรวจคำตอบ');
        viz = el.querySelector('.viz');
        pm = W.pickMany(el.querySelector('.w-host'), { cls: 'pm-dur', items: q.cards.map(c => ({ id: c.id, html: W.durHTML(c.parts) })) });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = pm.get();
          if (!g.length) return api.nudge('ยังไม่ได้เลือกป้ายเลย!', go);
          if (eqArr(g, good)) { pm.lock(); api.correct(praise() + ' ' + q.cards.filter(c => c.ok).map(c => tok(c.parts)).join(' = '), go); return; }
          const wrong = g.filter(x => good.indexOf(x) < 0);
          wrong.forEach(x => pm.mark(x, 'bad'));
          api.wrong(wrong.length ? 'มีป้ายที่ไม่เท่ากันอยู่ ลองเปลี่ยนเป็นหน่วยเดียวกันแล้วเทียบดู' : 'ยังหาไม่ครบนะ ยังมีป้ายที่เท่ากันอีก', go);
        });
      },
      hint(l) {
        if (l === 2) {
          const v = W.valIn(q.target, u);
          if (viz) { viz.innerHTML = '<div class="scl-help"><div class="hlp-title">เป้าหมายคือ</div><div class="hlp-row"><span class="hlp-t">' + W.durHTML(q.target) + '</span><b>=</b><span class="hlp-v">' + W.durHTML([mk(u, v)]) + '</span></div></div>'; ui.restart(viz, 'enter'); }
        }
        if (l === 3 && pm) { const x = good.find(id => pm.get().indexOf(id) < 0); if (x) pm.flag(x, 'hl'); }
        return [
          'เปลี่ยนทุกป้ายให้เป็นหน่วยเดียวกับเป้าหมายก่อน',
          'เป้าหมายคือ ' + tok([mk(u, W.valIn(q.target, u))]) + ' ดูแถบด้านล่าง แล้วเทียบกับแต่ละป้าย',
          'มีป้ายที่ใช่ ' + good.length + ' ป้าย ดูป้ายที่กะพริบนะ'
        ][l - 1];
      },
      answer: q.cards.filter(c => c.ok).map(c => tok(c.parts)).join(' = '),
      solve() { pm.set(good); }
    };
  }

  /* ══════════════════════════════════════════════
     ชั้น 4 : สถานีตารางเวลา — อ่านตารางเวลา
     ══════════════════════════════════════════════ */
  function tTable(tb, q, o) {
    o = o || {};
    const kind = q.kind;
    const rowOf = no => tb.rows.find(r => r.no === no);
    let bd, kp, viz;
    const th = tb.theme;
    const askWait = kind === 'next' && o.askWait;
    function conf() {
      switch (kind) {
        case 'read': {
          const r = rowOf(q.row), colName = q.col === 'dep' ? 'ออก' : 'ถึง';
          return { title: th.unit + 'ที่ ' + q.row + ' ' + colName + 'กี่โมง?', say: 'อ่านตารางทีละแถว! หา' + th.unit + 'ที่ ' + q.row + ' แล้วดูช่อง ' + colName + ' พิมพ์เวลาได้เลย!', mode: null, fields: timeFields(), clock: true, ok: tt(r[q.col]), ans: q.ans };
        }
        case 'dur': {
          const r = rowOf(q.row);
          return { title: th.unit + 'ที่ ' + q.row + ' เดินทางนานเท่าไร?', say: 'เวลาถึง ลบ เวลาออก! กระโดดบนเส้นเวลาก็ช่วยได้นะ!', mode: null, fields: durFields(), ok: tt(r.dep) + ' ถึง ' + tt(r.arr) + ' ใช้เวลา ' + mtok(r.dur), ans: q.ans };
        }
        case 'next': {
          const r = rowOf(q.row);
          if (askWait) return { title: 'ถึงสถานี ' + tt(q.t0) + ' ขึ้นขบวนแรกที่ออกได้ ต้องรอกี่นาที?', say: 'หา' + th.unit + 'แรกที่ออกหลังเวลาที่มาถึง แล้วหาว่าต้องรอนานแค่ไหน!', mode: null, fields: [{ unit: 'min', max: 3 }], ok: 'มาถึง ' + tt(q.t0) + ' ' + th.unit + 'ที่ ' + q.row + ' ออก ' + tt(r.dep) + ' ต้องรอ ' + mtok(q.wait), ans: [q.wait] };
          return { title: 'ติ๊กตี้ถึงสถานี ' + tt(q.t0) + ' ขึ้น' + th.unit + 'ไหนได้เป็นอันดับแรก?', say: 'ขบวนที่ออกไปแล้วขึ้นไม่ได้นะ! แตะแถวของ' + th.unit + 'แรกที่ยังทัน!', mode: 'one', ok: th.unit + 'ที่ ' + q.row + ' ออก ' + tt(r.dep) + ' เป็นขบวนแรกที่ออกหลัง ' + tt(q.t0), ans: q.row };
        }
        case 'before':
          return { title: 'ขบวนไหนถึงปลายทาง "ก่อน" ' + tt(q.D) + ' บ้าง?', say: 'ดูช่อง ถึง ให้ดี! "ก่อน" แปลว่าน้อยกว่า ถ้าเท่ากันพอดีไม่นับนะ! เลือกให้ครบ!', mode: 'many', ok: 'ถึงก่อน ' + tt(q.D) + ' คือขบวนที่ ' + q.good.join(', '), ans: q.good };
        case 'fastest': case 'slowest': {
          const r = rowOf(q.row);
          return { title: kind === 'fastest' ? 'ขบวนไหนใช้เวลาเดินทาง "น้อยที่สุด"?' : 'ขบวนไหนใช้เวลาเดินทาง "นานที่สุด"?', say: 'หาเวลาเดินทางของทุกขบวน (เวลาถึง ลบ เวลาออก) แล้วเทียบกัน แตะแถวที่ใช่!', mode: 'one', ok: th.unit + 'ที่ ' + q.row + ' ใช้เวลา ' + mtok(r.dur), ans: q.row };
        }
      }
    }
    const C = conf();
    const skill = o.skill || 'table';
    return {
      skill,
      title: C.title,
      say: C.say,
      render(el, api) {
        el.innerHTML = '<div class="split-tb"><div class="tb-host"></div><div class="tb-side"><div class="viz"></div><div class="w-host"></div></div></div>' + (C.mode === 'many' || C.fields ? goBtn('ตรวจคำตอบ') : '');
        viz = el.querySelector('.viz');
        const go = el.querySelector('.act-go');
        bd = W.board(el.querySelector('.tb-host'), {
          theme: th, rows: tb.rows, mode: C.mode,
          onPick(no, row) {
            if (kind === 'next') {
              if (no === q.row) { bd.lock(); bd.flag(no, 'good'); api.correct(praise() + ' ' + C.ok, row); }
              else { const r = rowOf(no); api.wrong(r.dep < q.t0 ? th.unit + 'ที่ ' + no + ' ออก ' + tt(r.dep) + ' ไปแล้วนะ' : 'มีขบวนที่ออกเร็วกว่านี้ ที่ยังทันนะ', row); bd.mark(no, 'bad'); }
            } else {
              if (no === q.row) { bd.lock(); bd.flag(no, 'good'); api.correct(praise() + ' ' + C.ok, row); }
              else { const r = rowOf(no); api.wrong('', row); bd.mark(no, 'bad'); }
            }
          }
        });
        if (o.showDur || (kind === 'fastest' && o.level === 1)) bd.showDur();
        if (kind === 'read') bd.pulse(q.row, true);
        if (kind === 'dur') bd.pulse(q.row, true);
        if (C.fields) {
          kp = W.keypad(el.querySelector('.w-host'), kind === 'read' ? { fields: C.fields, clock: true, autoNext: true, onEnter: () => go.click() } : { fields: C.fields, onEnter: () => go.click() });
          go.addEventListener('click', () => {
            if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
            if (!kp.filled()) return api.nudge('ใส่ให้ครบทุกช่องนะ', go);
            const g = kp.get();
            let okv = false;
            if (kind === 'dur') okv = g[0] * 60 + g[1] === rowOf(q.row).dur;
            else okv = eqArr(g, C.ans);
            if (okv) { kp.lock(); bd.lock(); api.correct(praise() + ' ' + C.ok, go); return; }
            if (kind === 'dur' && g[1] >= 60) return api.nudge('นาทีครบ 60 แล้วต้องรวมเป็น 1 ชั่วโมงนะ! เวลาไม่ใช่ทศนิยม', go);
            api.wrong('', go);
          });
        } else if (C.mode === 'many') {
          go.addEventListener('click', () => {
            const g = bd.get();
            if (!g.length) return api.nudge('ยังไม่ได้เลือกแถวเลย!', go);
            if (eqArr(g, q.good)) { bd.lock(); api.correct(praise() + ' ' + C.ok, go); return; }
            const wrong = g.filter(x => q.good.indexOf(x) < 0);
            wrong.forEach(x => bd.flag(x, 'bad'));
            const eqRow = wrong.find(x => rowOf(x).arr === q.D);
            api.wrong(eqRow ? th.unit + 'ที่ ' + eqRow + ' ถึง ' + tt(q.D) + ' พอดี ไม่ใช่ "ก่อน" นะ' : wrong.length ? 'มีขบวนที่ถึงช้ากว่านั้นอยู่นะ' : 'ยังหาไม่ครบนะ ยังมีขบวนที่ถึงก่อนอีก', go);
          });
        }
      },
      hint(l) {
        const r = q.row ? rowOf(q.row) : null;
        if (kind === 'dur' && l >= 2) { viz.innerHTML = art.hops(r.dep, r.arr, { reveal: l === 2 ? 1 : 99, noTotal: true }); ui.restart(viz, 'enter'); }
        if (askWait && l >= 2) { viz.innerHTML = art.hops(q.t0, rowOf(q.row).dep, { reveal: l === 2 ? 1 : 99, noTotal: true }); ui.restart(viz, 'enter'); bd.pulse(q.row, true); }
        if (kind === 'next' && !askWait && l === 3) bd.pulse(q.row, true);
        if ((kind === 'fastest' || kind === 'slowest') && l >= 2) bd.showDur();
        if (kind === 'before' && l === 3) { const x = q.good.find(n => bd.get().indexOf(n) < 0); if (x) bd.pulse(x, true); }
        return ({
          read: ['หาแถวที่ตรงกับ' + th.unit + 'ที่ ' + (q.row || '') + ' แล้วดูช่อง ' + (q.col === 'dep' ? 'ออก' : 'ถึง'), 'แถวนั้นกะพริบอยู่ ดูตัวเลขในช่องที่ถามนะ', 'ดูที่เวลา ' + (q.col === 'dep' ? 'ออก' : 'ถึง') + ' ในแถวที่กะพริบ ตัวเลขหน้าจุดคือชั่วโมง หลังจุดคือนาที'],
          dur: ['ระยะเวลาเดินทาง = เวลาถึง ลบ เวลาออก ใช้เส้นเวลากระโดดช่วยได้', 'กระโดดทีละช่วง ดูเส้นเวลาด้านล่าง', 'บวกเวลาแต่ละช่วงเข้าด้วยกัน ก็ได้ระยะเวลาเดินทางแล้ว'],
          next: [askWait ? 'หาขบวนแรกที่ออกหลังเวลาที่มาถึง แล้วนับว่ารอกี่นาที' : 'หา' + th.unit + 'ที่ออกหลังเวลาที่มาถึง ' + (q.t0 ? tt(q.t0) : ''), askWait ? 'ขบวนที่ ' + q.row + ' คือขบวนแรกที่ทัน ลองหาว่ารอนานแค่ไหน' : 'ขบวนที่ออกก่อนเวลาที่มาถึง ขึ้นไม่ได้แล้ว ดูขบวนถัดไปทีละแถว', askWait ? 'กระโดดจากเวลาที่มาถึงไปถึงเวลาออก ดูเส้นเวลาด้านล่าง' : 'ดูแถวที่กะพริบเป็นคำตอบนะ'],
          before: ['"ก่อน" ' + (q.D ? tt(q.D) : '') + ' แปลว่าเวลาถึงต้องน้อยกว่า ถ้าเท่ากันพอดีไม่นับ', 'ไล่ดูช่อง ถึง ทีละแถว เทียบกับ ' + (q.D ? tt(q.D) : ''), 'มีทั้งหมด ' + (q.good ? q.good.length : '') + ' ขบวน ดูแถวที่กะพริบนะ'],
          fastest: ['ใช้เวลาเดินทาง = เวลาถึง ลบ เวลาออก ต้องหาของทุกแถว', 'ตอนนี้ตารางมีช่อง ใช้เวลา ให้ดูแล้ว เทียบกันได้เลย', 'เทียบเวลาเดินทางทุกแถว แถวที่น้อยที่สุดคือคำตอบ'],
          slowest: ['ใช้เวลาเดินทาง = เวลาถึง ลบ เวลาออก ต้องหาของทุกแถว', 'ตอนนี้ตารางมีช่อง ใช้เวลา ให้ดูแล้ว เทียบกันได้เลย', 'เทียบเวลาเดินทางทุกแถว แถวที่นานที่สุดคือคำตอบ']
        })[kind][l - 1];
      },
      answer: C.ok,
      solve() {
        if (kind === 'many' || C.mode === 'many') bd.set(q.good);
        else if (C.mode === 'one') bd.flag(q.row, 'good');
        else if (kind === 'dur') kp.set(q.ans);
        else kp.set(C.ans);
      }
    };
  }

  /* ══════════════════════════════════════════════
     ชั้น 5 : ระฆังใหญ่ยามเที่ยง — โจทย์ปัญหาเกี่ยวกับเวลา
     ══════════════════════════════════════════════ */
  function tBackward(bw) {
    let kp, viz;
    const mid = bw.D - bw.a;
    return {
      skill: 'span',
      title: 'ต้องถึงไม่เกิน ' + tt(bw.D) + ' ต้องเริ่มเตรียมตัวกี่โมง?',
      say: 'ย้อนเวลากลับทีละขั้น! จากเวลาที่ต้องถึง ย้อนไปเวลาออกเดินทาง แล้วย้อนไปเวลาเริ่มเตรียมตัว!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="row-center">' + ticket('ถึงไม่เกิน', art.led(bw.D)) + ticket('เดินทาง', rich(mtok(bw.a))) + ticket('เตรียมตัว', rich(mtok(bw.b))) + '</div>' +
          '<div class="viz"></div></div><div class="qa-a"><div class="w-host"></div>' + goBtn('ตรวจคำตอบ') + '</div></div>';
        viz = el.querySelector('.viz');
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { fields: timeFields(), clock: true, autoNext: true, onEnter: () => go.click() });
        go.addEventListener('click', () => {
          if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
          if (!kp.filled()) return api.nudge('ใส่ให้ครบทั้ง 2 ช่องนะ', go);
          const g = kp.get();
          if (g[1] > 59 || g[0] > 23) return api.nudge('นาทีต้องไม่เกิน 59 และชั่วโมงไม่เกิน 23 นะ', go);
          const tm = g[0] * 60 + g[1];
          if (tm === bw.start) { kp.lock(); api.correct(praise() + ' ' + tt(bw.D) + ' ย้อนกลับ ' + mtok(bw.a) + ' ได้ ' + tt(mid) + ' แล้วย้อนอีก ' + mtok(bw.b) + ' ได้ ' + tt(bw.start), go); return; }
          api.wrong(tm === mid ? 'นั่นคือเวลาที่ต้องออกเดินทางนะ อย่าลืมเวลาเตรียมตัวด้วย' : tm === bw.D - Math.max(bw.a, bw.b) ? 'ต้องย้อนทั้งสองช่วงเลยนะ' : '', go);
        });
      },
      hint(l) {
        if (l === 3) { viz.innerHTML = art.hops(bw.start, bw.D, { reveal: 99, noTotal: true, hideEnd: false }); }
        return [
          'ย้อนกลับทีละขั้น: ถึงที่หมาย → ออกเดินทาง → เริ่มเตรียมตัว',
          tt(bw.D) + ' ย้อนกลับ ' + mtok(bw.a) + ' จะได้เวลาออกเดินทาง ' + tt(mid),
          'จาก ' + tt(mid) + ' ย้อนอีก ' + mtok(bw.b) + ' (ถ้านาทีไม่พอ ให้ยืม 1 ชั่วโมง = 60 นาที)'
        ][l - 1];
      },
      answer: tt(bw.D) + ' − ' + mtok(bw.a) + ' = ' + tt(mid) + ' แล้ว − ' + mtok(bw.b) + ' = ' + tt(bw.start),
      solve() { kp.set([Math.floor(bw.start / 60), bw.start % 60]); }
    };
  }

  function tPlan(pl) {
    let pw;
    return {
      skill: 'solve',
      title: 'จัดตารางวันเที่ยวให้พอดีเวลา',
      say: 'มีเวลาตั้งแต่ ' + T.fmtT(pl.start) + ' ถึง ' + T.fmtT(pl.end) + ' น. เลือกกิจกรรมให้ใช้เวลารวมพอดีเป๊ะ! แตะเลือกหรือแตะซ้ำเพื่อเอาออก!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('เวลาที่มี', rich(mtok(pl.target))) + '</div><div class="w-host"></div>' + goBtn('ตรวจตาราง');
        pw = W.planner(el.querySelector('.w-host'), pl);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = pw.get();
          if (!g.ids.length) return api.nudge('ยังไม่ได้เลือกกิจกรรมเลย!', go);
          if (g.total === pl.target) { pw.lock(); api.correct(praise() + ' ' + g.ids.map(id => pl.cards.find(c => c.id === id).dur).join(' + ') + ' = ' + g.total + ' นาที = ' + mtok(g.total) + ' ครบพอดี!', go); return; }
          api.wrong(g.total < pl.target ? 'ยังขาดอีก ' + mtok(pl.target - g.total) + ' ลองเพิ่มหรือเปลี่ยนกิจกรรมดูนะ' : 'เกินมา ' + mtok(g.total - pl.target) + ' ลองเอาบางกิจกรรมออกนะ', go);
        });
      },
      hint(l) {
        if (l === 3 && pw) pl.sols[0].forEach(id => pw.pulse(id, true));
        return [
          'บวกเวลาของกิจกรรมเข้าด้วยกัน ให้รวมได้ ' + pl.target + ' นาที',
          'ดูแถบเวลาด้านบน มันจะบอกว่าใช้ไปเท่าไร เหลืออีกเท่าไร',
          'ลองดูกิจกรรมที่กะพริบ มันอยู่ในคำตอบนะ'
        ][l - 1];
      },
      answer: pl.sols[0].map(id => pl.cards.find(c => c.id === id).dur).join(' + ') + ' = ' + pl.target + ' นาที',
      solve() { pw.set(pl.sols[0]); }
    };
  }

  const KIDS = ['น้องปุ๊กปิ๊ก', 'น้องแป้ง', 'น้องต้นกล้า', 'น้องฟ้า', 'น้องกล้วยไม้'];
  function tDiff(df) {
    let ch, kp, phase = 1, host2;
    const names = shuffle(KIDS).slice(0, 2);
    const ta = T.minParts(df.a), tb = [mk('min', df.b)];
    const who = df.longer === 'a' ? names[0] : names[1];
    return {
      skill: 'solve',
      title: 'ใครใช้เวลานานกว่า และต่างกันกี่นาที?',
      say: 'เปลี่ยนเป็นหน่วยเดียวกันก่อนเลย! ข้อนี้มี 2 จังหวะ: เลือกคนที่ใช้เวลานานกว่า แล้วหาผลต่าง!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket(names[0] + ' ทำการบ้านใช้เวลา', rich(tok(ta))) + ticket(names[1] + ' ทำการบ้านใช้เวลา', rich(tok(tb))) + '</div>' +
          '<div class="phase1 w-host"></div><div class="phase2 hidden"><div class="ticket"><span class="tk-lbl">ต่างกัน</span><span class="tk-val">?</span></div><div class="w-host p2k"></div>' + goBtn('ตรวจคำตอบ') + '</div>';
        ch = W.choice(el.querySelector('.phase1'), {
          cls: 'opts-2',
          options: [{ html: names[0], value: 'a' }, { html: names[1], value: 'b' }],
          onPick(v, b) {
            if (v === df.longer) {
              b.classList.add('good'); ch.lock(); phase = 2; audio.sfx('star');
              api.say(praise() + ' ' + who + ' ใช้เวลานานกว่า (' + df.a + ' นาที กับ ' + df.b + ' นาที) ต่อไปหาว่าต่างกันกี่นาที!', 'happy');
              const p2 = el.querySelector('.phase2'); p2.classList.remove('hidden'); ui.restart(p2, 'enter');
              const go = el.querySelector('.act-go');
              kp = W.keypad(el.querySelector('.p2k'), { fields: [{ unit: 'min', max: 3 }], onEnter: () => go.click() });
              go.addEventListener('click', () => {
                if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
                const g = kp.get()[0];
                if (g === df.diff) { kp.lock(); api.correct(praise() + ' ' + Math.max(df.a, df.b) + ' − ' + Math.min(df.a, df.b) + ' = ' + df.diff + ' นาที ' + who + ' ใช้เวลานานกว่า ' + df.diff + ' นาที', go); }
                else api.wrong(g === df.a + df.b ? 'ผลต่างต้องเอามาลบกันนะ ไม่ใช่บวก' : '', go);
              });
            } else { ch.dim(b); api.wrong('เปลี่ยน ' + tok(ta) + ' ให้เป็นนาทีก่อน แล้วเทียบกับ ' + df.b + ' นาที', b); }
          }
        });
      },
      hint(l) {
        return phase === 1 ? [
          'เปลี่ยนให้เป็นหน่วยเดียวกันก่อน ถึงจะเทียบกันได้',
          tok(ta) + ' เท่ากับกี่นาที? (1 ชั่วโมง = 60 นาที)',
          tok(ta) + ' = ' + df.a + ' นาที เทียบกับ ' + df.b + ' นาที'
        ][l - 1] : [
          'หาผลต่าง ให้เอาเวลาที่มากกว่า ลบ เวลาที่น้อยกว่า',
          Math.max(df.a, df.b) + ' − ' + Math.min(df.a, df.b) + ' = ?',
          'ลบกันได้ ' + df.diff + ' นาที'
        ][l - 1];
      },
      answer: who + ' นานกว่า ' + df.diff + ' นาที',
      solve() { if (phase === 1) ch.mark(df.longer, 'good'); if (kp) kp.set([df.diff]); }
    };
  }

  /* ด่านสุดท้าย 2 จังหวะ: เลือกขบวนที่ทัน แล้วหาเวลารอ */
  function genShowdown(level) {
    for (let t = 0; t < 400; t++) {
      const tb = T.genTable(Math.max(2, level), 'train');
      const rows = tb.rows;
      const i = R(1, rows.length - 2);
      const lo = rows[i - 1].dep + 1, hi = rows[i].dep - 1;
      if (hi - lo < 4) continue;
      const t0 = R(lo + 2, hi);
      const D = rows[R(i, rows.length - 1)].arr + pick([0, 0, 5, 10]);
      const good = rows.filter(r => r.dep > t0 && r.arr < D).map(r => r.no);
      const later = rows.filter(r => r.dep > t0).length;
      if (!good.length || good.length >= later) continue;
      if (rows.some(r => r.dep === t0)) continue;
      return { tb, t0, D, good, first: good[0], wait: rows.find(r => r.no === good[0]).dep - t0 };
    }
    return null;
  }
  function tShowdown(sd) {
    let bd, kp, phase = 1;
    const th = sd.tb.theme;
    return {
      skill: 'solve',
      title: 'ยามเที่ยง! เลือกขบวนที่ทัน แล้วหาเวลารอ',
      say: 'ภารกิจ 2 จังหวะ! ต้องออกหลังจากที่ติ๊กตี้มาถึง และต้องถึงก่อนเวลาที่กำหนดด้วย!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('ติ๊กตี้ถึงสถานี', art.led(sd.t0)) + ticket('ต้องถึงปลายทางก่อน', art.led(sd.D)) + '</div>' +
          '<div class="split-tb"><div class="tb-host"></div><div class="tb-side"><div class="phase1 note">จังหวะ 1: แตะทุกขบวนที่ขึ้นได้ (ออกหลังติ๊กตี้มาถึง และถึงก่อนเวลาที่กำหนด)</div><div class="phase2 hidden"><div class="ticket"><span class="tk-lbl">ขึ้นขบวนแรกที่ทัน ต้องรอ</span><span class="tk-val">?</span></div><div class="w-host p2k"></div></div></div></div>' + goBtn('ตรวจคำตอบ');
        bd = W.board(el.querySelector('.tb-host'), { theme: th, rows: sd.tb.rows, mode: 'many' });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          if (phase === 1) {
            const g = bd.get();
            if (!g.length) return api.nudge('ยังไม่ได้เลือกแถวเลย!', go);
            if (eqArr(g, sd.good)) {
              bd.lock(); phase = 2; audio.sfx('star');
              api.say(praise() + ' ขบวนที่ทันคือ ' + sd.good.join(', ') + ' ต่อไป ถ้าขึ้นขบวนแรกที่ทัน (ขบวนที่ ' + sd.first + ') ต้องรอกี่นาที?', 'happy');
              el.querySelector('.phase1').classList.add('hidden');
              const p2 = el.querySelector('.phase2'); p2.classList.remove('hidden'); ui.restart(p2, 'enter');
              kp = W.keypad(el.querySelector('.p2k'), { fields: [{ unit: 'min', max: 3 }], onEnter: () => go.click() });
              return;
            }
            const wrong = g.filter(x => sd.good.indexOf(x) < 0);
            wrong.forEach(x => bd.flag(x, 'bad'));
            const r0 = wrong.length ? sd.tb.rows.find(r => r.no === wrong[0]) : null;
            api.wrong(r0 ? (r0.dep < sd.t0 ? th.unit + 'ที่ ' + r0.no + ' ออก ' + tt(r0.dep) + ' ไปแล้วนะ' : r0.arr === sd.D ? th.unit + 'ที่ ' + r0.no + ' ถึง ' + tt(sd.D) + ' พอดี ไม่ใช่ "ก่อน" นะ' : th.unit + 'ที่ ' + r0.no + ' ถึงช้าเกินไปนะ') : 'ยังหาไม่ครบนะ ยังมีขบวนที่ทันอีก', go);
          } else {
            if (kp.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
            const g = kp.get()[0];
            if (g === sd.wait) { kp.lock(); api.correct(praise() + ' ' + tt(sd.t0) + ' ถึง ' + tt(sd.tb.rows.find(r => r.no === sd.first).dep) + ' รอ ' + mtok(sd.wait), go); }
            else api.wrong('', go);
          }
        });
      },
      hint(l) {
        if (phase === 1) {
          if (l === 3 && bd) { const x = sd.good.find(n => bd.get().indexOf(n) < 0); if (x) bd.pulse(x, true); }
          return [
            'ขบวนที่ขึ้นได้ ต้องออกหลังเวลาที่ติ๊กตี้มาถึง และต้องถึงก่อนเวลาที่กำหนด (เท่ากันพอดีไม่นับ)',
            'ขีดฆ่าขบวนที่ออกไปแล้วก่อน แล้วดูช่อง ถึง ของที่เหลือ',
            'มีทั้งหมด ' + sd.good.length + ' ขบวน ดูแถวที่กะพริบนะ'
          ][l - 1];
        }
        return [
          'หาเวลารอ = เวลาออกของขบวนแรกที่ทัน ลบ เวลาที่มาถึง',
          'ขบวนแรกที่ทันคือขบวนที่ ' + sd.first + ' ออกเวลา ' + tt(sd.tb.rows.find(r => r.no === sd.first).dep),
          'จาก ' + tt(sd.t0) + ' ไปถึง ' + tt(sd.tb.rows.find(r => r.no === sd.first).dep) + ' กระโดดไปทีละช่วงนะ'
        ][l - 1];
      },
      answer: 'ขบวนที่ทัน: ' + sd.good.join(', ') + ' · รอ ' + sd.wait + ' นาที',
      solve() { if (phase === 1) { bd.set(sd.good); } else kp.set([sd.wait]); }
    };
  }

  /* โจทย์เรื่องเล่าเปลี่ยนหน่วย */
  function mixStory(q) {
    const M = convMeta(q), pr = M.pr, key = pr.big;
    const tx = tok(q.from);
    if (M.dir === 'comp') {
      return ({
        min: 'ติ๊กตี้จับเวลาวิ่งรอบหอนาฬิกา ได้ ' + tx + ' คิดเป็นกี่วินาที?',
        hr: 'ภาพยนตร์เรื่องหนึ่งยาว ' + tx + ' คิดเป็นกี่นาที?',
        day: 'ค่ายเรียนรู้มีระยะเวลา ' + tx + ' คิดเป็นกี่ชั่วโมง?',
        wk: 'ปิดเทอมครั้งหนึ่งยาว ' + tx + ' รวมทั้งหมดกี่วัน?',
        yr: 'ต้นไม้ต้นหนึ่งมีอายุ ' + tx + ' คิดเป็นกี่เดือน?'
      })[key];
    }
    return ({
      min: 'เจ้าเฟืองซนซ่อนอยู่ ' + tx + ' คิดเป็นกี่นาที กี่วินาที?',
      hr: 'ติ๊กตี้ฝึกซ้อม ' + tx + ' คิดเป็นกี่ชั่วโมง กี่นาที?',
      day: 'เรือเดินทางกลางทะเล ' + tx + ' คิดเป็นกี่วัน กี่ชั่วโมง?',
      wk: 'โครงงานใช้เวลา ' + tx + ' คิดเป็นกี่สัปดาห์ กี่วัน?',
      yr: 'ต้นมะม่วงปลูกมาแล้ว ' + tx + ' คิดเป็นกี่ปี กี่เดือน?'
    })[key];
  }
  function tMix(q) {
    const t = tConvert(q, { title: mixStory(q), viz: false });
    t.skill = 'solve';
    return t;
  }

  /* ════════════════════════════ ข้อมูลชั้น ════════════════════════════ */
  const show = (body, cap) => '<div class="show-card">' + body + (cap ? '<p class="show-cap">' + cap + '</p>' : '') + '</div>';

  /* ภาพสาธิตตาชั่งในบทนำ */
  function demoScale(a, b, c, help) {
    return box => {
      box.innerHTML = '<div class="show-card"><div class="w-host"></div></div>';
      const sc = W.scaleCompare(box.querySelector('.w-host'), { a, b, onPick() {} });
      box.querySelectorAll('.op-btn').forEach(x => { x.disabled = true; });
      setTimeout(() => { sc.setTilt(c); if (help) sc.helper(true); audio.sfx('boing'); }, 650);
    };
  }
  const demoTable = (tb, col) => box => {
    box.innerHTML = '<div class="show-card"><div class="tb-host"></div></div>';
    const bd = W.board(box.querySelector('.tb-host'), { theme: tb.theme, rows: tb.rows, mode: null });
    if (col) { bd.hlCell(1, col, true); bd.pulse(1, true); }
  };

  const T1 = T.genTable(1, 'train');
  const STAGES = [
    {
      id: 1, name: 'ห้องเฟืองจิ๋ว', topic: 'ระยะเวลา วินาที นาที ชั่วโมง', icon: 'gear', color: '#ff9a1f',
      intro: [
        { who: 'guk', mood: 'cheer', sfx: 'chime', text: 'ยินดีต้อนรับสู่ห้องเฟืองจิ๋ว! ที่นี่ เฟืองวินาที นาที ชั่วโมง ต้องหมุนให้ตรงกันเป๊ะ!', show: show(art.clock(10, 10, { sweep: true, cls: 'big' }), 'เข็มวินาทีวิ่งไว เข็มนาทีเดินช้า เข็มชั่วโมงช้าที่สุด') },
        { who: 'guk', mood: 'talk', text: 'เข็มวินาทีวิ่งครบ 1 รอบ ใช้เวลา 60 วินาที เท่ากับ 1 นาที!', show: show(art.clock(12, 0, { sweep: true, cls: 'big' }), '{sec:60} = {min:1}') },
        { who: 'guk', mood: 'wow', text: 'เข็มนาทีเดินครบ 1 รอบ ใช้เวลา 60 นาที เท่ากับ 1 ชั่วโมง!', show: show(art.groups(T.PAIRS['hr:min'], 1, 0, { noSum: true }), '{min:60} = {hr:1}') },
        { who: 'fon', mood: 'laugh', text: 'ฮิ ๆ ข้าสลับเฟืองหมดแล้ว! 1 นาทีมี 100 วินาที! 1 ชั่วโมงมี 100 นาที!', show: show('<div class="show-big wavy">{min:1} = {sec:100} ?</div>', 'เจ้าเฟืองซนว่าอย่างนี้') },
        { who: 'guk', mood: 'wow', text: 'ไม่จริง! หน่วยเวลาไม่ได้นับทีละ 10 หรือ 100 นะ ต้อง 60 เท่านั้น!', show: show(art.groups(T.PAIRS['min:sec'], 3, 0), '{min:3} = {sec:180}') },
        { who: 'guk', mood: 'cheer', text: 'มาหมุนเฟืองให้ตรงกัน แล้วไปเก็บระฆังใบแรกกัน!', last: 'ไขเฟือง!' }
      ],
      learn: [
        () => tSortUnits(),
        () => tConvert({ pair: T.PAIRS['min:sec'], from: [mk('min', 2)], to: ['sec'], ans: [120] }, { viz: true, say: 'กดเลขตามที่คิด! 1 นาทีมี 60 วินาที ดูแท่งด้านบนช่วยได้นะ!' }),
        () => tConvert({ pair: T.PAIRS['hr:min'], from: [mk('min', 180)], to: ['hr'], ans: [3] }, { viz: true, say: 'ทีนี้ย้อนกลับ! 180 นาที รวมกลุ่มละ 60 ได้กี่ชั่วโมง?' }),
        () => tClaim(T.CLAIMS.hms[1], 'hms')
      ],
      missions: 5,
      gen(level, i) {
        const type = ['unit', 'convert', 'span', 'compound', 'claim'][i % 5];
        const keys = ['min:sec', 'hr:min'];
        if (type === 'unit') return tUnitPick(pick(T.UNIT_ACTS.hms), 'hms');
        if (type === 'convert') return tConvert(T.genConvert(level, keys));
        if (type === 'compound') return tConvert(T.genConvert(Math.min(3, level + 1), keys));
        if (type === 'span') return tSpan(T.genSpan(level));
        return tClaim(pick(T.CLAIMS.hms), 'hms');
      },
      recap: [
        '{min:1} = {sec:60} · {hr:1} = {min:60}',
        'หน่วยใหญ่ → หน่วยเล็ก ใช้ คูณ เช่น {min:3} = 3 × 60 = {sec:180}',
        'หน่วยเล็ก → หน่วยใหญ่ ใช้ หาร เช่น {min:150} = {hr:2} {min:30}',
        'หาระยะเวลา: กระโดดไปชั่วโมงเต็มก่อน แล้วบวกส่วนที่เหลือ'
      ],
      book: [
        '**วินาที นาที ชั่วโมง** ใช้บอกระยะเวลาที่สั้น',
        '{min:1} = {sec:60} · {hr:1} = {min:60}',
        'เปลี่ยนหน่วยใหญ่เป็นหน่วยเล็ก → **คูณ**: {min:2} = 2 × 60 = {sec:120}',
        'เปลี่ยนหน่วยเล็กเป็นหน่วยใหญ่ → **หาร**: {min:180} = 180 ÷ 60 = {hr:3}',
        'ตัวอย่าง: {min:135} = {hr:2} {min:15} (135 ÷ 60 ได้ 2 เศษ 15)',
        '**หาระยะเวลา** จาก {t:09.45} ถึง {t:11.20}: กระโดด {t:09.45} → {t:10.00} ได้ {min:15}, → {t:11.00} ได้ {hr:1}, → {t:11.20} ได้ {min:20} รวม {hr:1} {min:35}'
      ],
      teacher: [
        'ทำไมเวลาจึงเปลี่ยนหน่วยทีละ 60 ไม่ใช่ 10 หรือ 100 เหมือนที่เคยเรียนมา?',
        'ให้นักเรียนยกตัวอย่างกิจกรรมที่ควรบอกเวลาเป็นวินาที เป็นนาที และเป็นชั่วโมง อย่างละ 2 อย่าง',
        'ถ้านาฬิกาเดินจาก 09.45 ถึง 11.20 นักเรียนมีวิธีหาระยะเวลากี่แบบ อธิบายให้เพื่อนฟังได้ไหม?'
      ]
    },
    {
      id: 2, name: 'หอปฏิทินยักษ์', topic: 'ระยะเวลา วัน สัปดาห์ เดือน ปี', icon: 'calendar', color: '#3ba8ff',
      intro: [
        { who: 'guk', mood: 'cheer', sfx: 'chime', text: 'มาถึงหอปฏิทินยักษ์แล้ว! ที่นี่เก็บ วัน สัปดาห์ เดือน ปี ไว้ทั้งหมด!', show: show(art.dayBar(), '{day:1} = {hr:24}') },
        { who: 'guk', mood: 'talk', text: '1 สัปดาห์ มี 7 วัน! วันจันทร์ถึงวันอาทิตย์ นับได้ครบ 7 วันพอดี!', show: show(art.weekBar(), '{wk:1} = {day:7}') },
        { who: 'guk', mood: 'wow', text: '1 ปี มี 12 เดือน! แต่ละเดือนมีจำนวนวันไม่เท่ากันนะ!', show: show(art.yearRing(), '{yr:1} = {mo:12}') },
        { who: 'fon', mood: 'smirk', text: 'ฮิ ๆ ทุกเดือนมี 30 วันเหมือนกันหมดแหละ! แล้ว 1 สัปดาห์ก็มี 5 วัน!', show: show('<div class="show-big wavy">{wk:1} = {day:5} ?</div>', 'เจ้าเฟืองซนว่าอย่างนี้') },
        { who: 'guk', mood: 'wow', text: 'ไม่จริง! บางเดือน 30 วัน บางเดือน 31 วัน จำง่าย ๆ ลงท้าย ยน มี 30 ลงท้าย คม มี 31 วัน!', show: show(art.monthBoard(), '') },
        { who: 'guk', mood: 'cheer', text: 'มาไขปฏิทินกัน! ดูให้ดีแล้วเก็บระฆังใบที่สองให้ได้!', last: 'เปิดปฏิทิน!' }
      ],
      learn: [
        () => tCal(T.genCal(1)),
        () => tMonthDays(T.MONTHS[3]),
        () => tConvert({ pair: T.PAIRS['wk:day'], from: [mk('wk', 2)], to: ['day'], ans: [14] }, { viz: true, say: '1 สัปดาห์ = 7 วัน! 2 สัปดาห์มีกี่วันนะ? ดูแท่งด้านบนช่วยได้!' }),
        () => tClaim(T.CLAIMS.dwmy[2], 'dwmy')
      ],
      missions: 5,
      gen(level, i) {
        const type = ['cal', 'month', 'convert', 'unit', 'claim'][i % 5];
        const keys = ['day:hr', 'wk:day', 'yr:mo'];
        if (type === 'cal') return tCal(T.genCal(level));
        if (type === 'month') return level >= 2 && Math.random() < 0.5 ? tMonthsPick(pick([30, 31])) : tMonthDays(pick(T.MONTHS.filter(m => level >= 2 || m.n !== 'กุมภาพันธ์')));
        if (type === 'convert') return tConvert(T.genConvert(level, keys));
        if (type === 'unit') return tUnitPick(pick(T.UNIT_ACTS.dwmy), 'dwmy');
        return tClaim(pick(T.CLAIMS.dwmy), 'dwmy');
      },
      recap: [
        '{day:1} = {hr:24} · {wk:1} = {day:7} · {yr:1} = {mo:12}',
        'เดือนที่ลงท้ายว่า ยน มี 30 วัน · ลงท้ายว่า คม มี 31 วัน · กุมภาพันธ์ มี 28 หรือ 29 วัน',
        'บนปฏิทิน เลื่อนลงมา 1 แถว = 1 สัปดาห์ = 7 วัน'
      ],
      book: [
        '{day:1} = {hr:24} · {wk:1} = {day:7} · {yr:1} = {mo:12}',
        '**จำนวนวันในแต่ละเดือน**: ลงท้าย **ยน** มี 30 วัน (เมษายน มิถุนายน กันยายน พฤศจิกายน)',
        'ลงท้าย **คม** มี 31 วัน · **กุมภาพันธ์** มี 28 วัน (ปีอธิกสุรทิน 29 วัน)',
        '1 ปี มี 365 วัน (ปีอธิกสุรทิน 366 วัน)',
        'เปลี่ยนหน่วย: {wk:2} = 2 × 7 = {day:14} · {yr:3} = 3 × 12 = {mo:36}',
        'ตัวอย่าง: {day:17} = {wk:2} {day:3} (17 ÷ 7 ได้ 2 เศษ 3)'
      ],
      teacher: [
        'ทำไมแต่ละเดือนจึงมีจำนวนวันไม่เท่ากัน นักเรียนมีวิธีจำจำนวนวันในแต่ละเดือนอย่างไร?',
        'ถ้าวันนี้เป็นวันที่ 12 อีก 3 สัปดาห์จะเป็นวันที่เท่าไร ใช้ปฏิทินอธิบายอย่างไร?',
        '1 ปี เท่ากับกี่สัปดาห์ กี่วัน? (365 ÷ 7) ลองให้นักเรียนค้นหาคำตอบ'
      ]
    },
    {
      id: 3, name: 'ตาชั่งเฟืองทอง', topic: 'เปรียบเทียบระยะเวลาโดยใช้ความสัมพันธ์ของหน่วยเวลา', icon: 'scale', color: '#7c5cff',
      intro: [
        { who: 'guk', mood: 'cheer', sfx: 'whoosh', text: 'ตาชั่งเฟืองทอง! ฝั่งไหนระยะเวลานานกว่า ตาชั่งก็จะเอียงลงไปฝั่งนั้น!', show: demoScale([mk('min', 3)], [mk('sec', 120)], 1, false) },
        { who: 'guk', mood: 'talk', text: 'เทียบระยะเวลา ต้องเปลี่ยนให้เป็นหน่วยเดียวกันก่อนเสมอ!', show: demoScale([mk('min', 2)], [mk('sec', 100)], 1, true) },
        { who: 'fon', mood: 'laugh', text: '90 วินาที ต้องนานกว่า 2 นาที แน่นอน เพราะ 90 มากกว่า 2 ตั้งเยอะ!', show: show('<div class="show-row"><div class="show-num">{sec:90}</div><span class="vs-t">มากกว่า</span><div class="show-num">{min:2}</div></div>', 'เจ้าเฟืองซนว่าอย่างนี้') },
        { who: 'guk', mood: 'wow', text: 'ตัวเลขมากกว่า ไม่ได้แปลว่านานกว่า! 2 นาที เท่ากับ 120 วินาที นานกว่า 90 วินาทีต่างหาก!', show: demoScale([mk('sec', 90)], [mk('min', 2)], -1, true) },
        { who: 'guk', mood: 'cheer', text: 'เทียบให้ถูก ทุกหน่วย! ขึ้นตาชั่งกันเลย!', last: 'ขึ้นตาชั่ง!' }
      ],
      learn: [
        () => tCompare({ a: [mk('min', 2)], b: [mk('sec', 100)], c: 1, trap: true }, { say: '2 นาที กับ 100 วินาที อันไหนนานกว่า? เปลี่ยนเป็นวินาทีเหมือนกันก่อนนะ!' }),
        () => tCompare({ a: [mk('hr', 1), mk('min', 30)], b: [mk('min', 100)], c: -1, trap: false }, { judSay: 'ฮิ ๆ {hr:1} {min:30} ต้องนานกว่า {min:100} แน่ ๆ ก็มีตั้งสองหน่วยนี่!' }),
        () => tOrderDur(T.genOrder(1), 'asc'),
        () => tClaim(T.CLAIMS.compare[0], 'compare')
      ],
      missions: 5,
      gen(level, i) {
        const type = ['compare', 'order', 'eq', 'compare', 'claim'][i % 5];
        if (type === 'compare') return tCompare(T.genCompare(level));
        if (type === 'order') return tOrderDur(T.genOrder(level), Math.random() < 0.5 ? 'asc' : 'desc');
        if (type === 'eq') { let e = null; for (let k = 0; k < 20 && !e; k++) e = T.genEq(level); return tEq(e); }
        return tClaim(pick(T.CLAIMS.compare), 'compare');
      },
      recap: [
        'เทียบระยะเวลา ต้องเปลี่ยนเป็นหน่วยเดียวกันก่อน',
        'ตัวเลขมากกว่า ไม่ได้แปลว่านานกว่า: {min:2} > {sec:90} เพราะ {min:2} = {sec:120}',
        'ระยะเวลาเขียนได้หลายแบบแต่เท่ากัน: {hr:1} {min:30} = {min:90}'
      ],
      book: [
        '**ขั้นตอนเทียบระยะเวลา**',
        '1. เปลี่ยนให้เป็นหน่วยเดียวกัน (ปกติเปลี่ยนเป็นหน่วยเล็ก)',
        '2. เทียบตัวเลข ตัวเลขมากกว่า = ระยะเวลานานกว่า',
        'ตัวอย่าง {min:2} กับ {sec:100}: {min:2} = {sec:120} ดังนั้น {min:2} > {sec:100}',
        'ตัวอย่าง {hr:1} {min:30} กับ {min:100}: {hr:1} {min:30} = {min:90} ดังนั้น {hr:1} {min:30} < {min:100}',
        '**เรียงลำดับ**: เปลี่ยนทุกป้ายเป็นหน่วยเดียวกัน แล้วเรียงตามตัวเลข'
      ],
      teacher: [
        'ทำไมเราจึงเปรียบเทียบ 90 วินาที กับ 2 นาที โดยดูแค่ตัวเลข 90 กับ 2 ไม่ได้?',
        'ให้นักเรียนสร้างโจทย์เปรียบเทียบระยะเวลาที่ "ตัวเลขน้อยกว่า แต่นานกว่า" ให้เพื่อนทาย',
        '1 ชั่วโมง 30 นาที เขียนเป็น 1.30 ชั่วโมงได้ไหม? เพราะเหตุใด (เวลาไม่ใช่ทศนิยม)'
      ]
    },
    {
      id: 4, name: 'สถานีตารางเวลา', topic: 'การอ่านตารางเวลา', icon: 'train', color: '#14b8a6',
      intro: [
        { who: 'guk', mood: 'cheer', sfx: 'horn', text: 'ปี๊น ปี๊น! มาถึงสถานีตารางเวลาแล้ว! รถทุกขบวนออกตรงเวลาเป๊ะ!', show: demoTable(T1, null) },
        { who: 'guk', mood: 'talk', text: 'อ่านตารางทีละแถว! แถวแรก ออก ' + tt(T1.rows[0].dep) + ' ถึง ' + tt(T1.rows[0].arr) + ' ตัวเลขหน้าจุดคือชั่วโมง หลังจุดคือนาที!', show: demoTable(T1, 'dep') },
        { who: 'guk', mood: 'wow', text: 'อยากรู้ว่าเดินทางนานเท่าไร ให้ดู เวลาถึง ลบ เวลาออก!', show: show(art.hops(T1.rows[0].dep, T1.rows[0].arr, {}), '') },
        { who: 'fon', mood: 'laugh', text: 'ง่ายนิดเดียว! ออก {t:09.45} ถึง {t:11.20} ก็เอา {t:11.20} ลบ {t:09.45} ได้ 1.75 ชั่วโมง!', show: show('<div class="show-big wavy">11.20 − 09.45 = 1.75 ?</div>', 'เจ้าเฟืองซนว่าอย่างนี้') },
        { who: 'guk', mood: 'wow', text: 'เวลาไม่ใช่ทศนิยม! 1 ชั่วโมงมี 60 นาที ต้องกระโดดบนเส้นเวลาทีละช่วง!', show: show(art.hops(9 * 60 + 45, 11 * 60 + 20, {}), '') },
        { who: 'guk', mood: 'cheer', text: 'ไปอ่านตารางให้ถูกกัน! ระฆังใบที่สี่รออยู่!', last: 'ออกเดินทาง!' }
      ],
      learn: [
        () => { const tb = T.genTable(1); return tTable(tb, T.tableQuestion(tb, 'read'), { level: 1 }); },
        () => { const tb = T.genTable(1); return tTable(tb, T.tableQuestion(tb, 'dur'), { level: 1 }); },
        () => { for (let k = 0; k < 40; k++) { const tb = T.genTable(1); const q = T.tableQuestion(tb, 'next'); if (q) return tTable(tb, q, { level: 1 }); } }
      ],
      missions: 5,
      gen(level, i) {
        const type = ['read', 'dur', 'next', 'before', 'fastest'][i % 5];
        for (let k = 0; k < 60; k++) {
          const tb = T.genTable(level);
          let kind = type;
          const q = T.tableQuestion(tb, kind);
          if (!q) continue;
          if (type === 'next') return tTable(tb, q, { level, askWait: level >= 2 && Math.random() < 0.5 });
          if (type === 'fastest') return tTable(tb, Math.random() < 0.3 && level >= 2 ? T.tableQuestion(tb, 'slowest') : q, { level });
          return tTable(tb, q, { level });
        }
      },
      recap: [
        'อ่านตารางทีละแถว: ตัวเลขหน้าจุดคือชั่วโมง หลังจุดคือนาที',
        'ระยะเวลาเดินทาง = เวลาถึง ลบ เวลาออก (กระโดดบนเส้นเวลา ไม่ใช่ลบแบบทศนิยม)',
        '"ก่อน" เวลาที่กำหนด แปลว่าน้อยกว่า ถ้าเท่ากันพอดีไม่นับ'
      ],
      book: [
        '**ตารางเวลา** บอก เวลาออก และ เวลาถึง ของแต่ละเที่ยว',
        'อ่านเวลา {t:09.30} คือ เก้านาฬิกาสามสิบนาที (09 = ชั่วโมง, 30 = นาที)',
        'เวลา 24 ชั่วโมง: หลังเที่ยงบวก 12 เช่น บ่ายโมง = {t:13.00} บ่ายสามโมง = {t:15.00}',
        'ระยะเวลาเดินทาง: {t:09.45} → {t:11.20}  ใช้ {hr:1} {min:35}',
        '**รอ** = เวลาออก ลบ เวลาที่มาถึง เช่น มาถึง {t:09.12} ขบวนออก {t:09.30} ต้องรอ {min:18}',
        'ถ้าถามหา "ก่อน {t:11.00}" ต้องถึง **น้อยกว่า** {t:11.00}'
      ],
      teacher: [
        'ถ้าตารางเวลาบอกออก 13.20 ถึง 15.05 นักเรียนอ่านออกเสียงเวลาและหาระยะเวลาอย่างไร?',
        'ทำไม 11.20 − 09.45 จึงไม่ได้ 1.75 ชั่วโมง? ให้นักเรียนอธิบายโดยใช้เส้นเวลา',
        'นักเรียนใช้ตารางเวลาอะไรในชีวิตจริงบ้าง (ตารางเรียน ตารางรถ ตารางหนัง)?'
      ]
    },
    {
      id: 5, name: 'ระฆังใหญ่ยามเที่ยง', topic: 'ภารกิจสุดท้าย: แก้โจทย์ปัญหาเกี่ยวกับเวลา', icon: 'bell', color: '#ffb020', final: true,
      intro: [
        { who: 'guk', mood: 'cheer', sfx: 'chime', text: 'นี่แหละ! ยอดหอนาฬิกา! ระฆังใบสุดท้ายอยู่ตรงนี้แล้ว!', show: show(art.tower('small'), '') },
        { who: 'guk', mood: 'talk', text: 'ภารกิจสุดท้าย ใช้ทุกอย่างที่เรียนมา วางแผนเวลาให้เป๊ะ! ไม่ใช่โจทย์เดิมซ้ำนะ!' },
        { who: 'fon', mood: 'laugh', text: 'ฮ่า ๆ ข้าจะป่วนทั้งตารางเวลา ปฏิทิน และหน่วยเวลาทั้งหมดเลย!' },
        { who: 'guk', mood: 'cheer', sfx: 'crowd', text: 'ใช้ทุกอย่างที่เรียนมา พาติ๊กตี้ตีระฆังใบสุดท้าย! สาม สอง หนึ่ง!', last: 'ตีระฆัง!' }
      ],
      learn: [],
      missions: 6,
      gen(level, i) {
        switch (i % 6) {
          case 0: {
            const s = T.genEndStory(level);
            return tSpan({ mode: 'end', start: s.start, end: s.end, dur: s.dur, ans: [Math.floor(s.end / 60), s.end % 60] }, {
              title: s.name + ' เริ่ม ' + tt(s.start) + ' ยาว ' + mtok(s.dur) + ' จบกี่โมง?',
              say: 'ใช้เส้นเวลากระโดดช่วยได้! พิมพ์เวลาจบ แล้วดูเข็มนาฬิกาขยับตาม!', skill: 'span'
            });
          }
          case 1: return tBackward(T.genBackward(level));
          case 2: { const pl = T.genPlan(level); return tPlan(pl); }
          case 3: return tMix(T.genConvert(3, ['hr:min', 'wk:day', 'yr:mo', 'min:sec', 'day:hr']));
          case 4: return tDiff(T.genDiffStory());
          default: { let sd = null; for (let k = 0; k < 10 && !sd; k++) sd = genShowdown(level); return tShowdown(sd); }
        }
      },
      recap: [
        'บอกระยะเวลา และเปลี่ยนหน่วยเวลาได้ ตั้งแต่วินาทีจนถึงปี',
        'เทียบและเรียงลำดับระยะเวลา โดยเปลี่ยนเป็นหน่วยเดียวกันก่อน',
        'อ่านตารางเวลา หาระยะเวลา เวลารอ และวางแผนเวลาย้อนกลับได้'
      ],
      book: [
        '**สรุปทั้งหมด**',
        '{min:1} = {sec:60} · {hr:1} = {min:60} · {day:1} = {hr:24} · {wk:1} = {day:7} · {yr:1} = {mo:12}',
        'หน่วยใหญ่ → เล็ก **คูณ** · เล็ก → ใหญ่ **หาร**',
        'เทียบระยะเวลา: เปลี่ยนเป็นหน่วยเดียวกันก่อน',
        'หาเวลาจบ: เวลาเริ่ม **บวก** ระยะเวลา · หาเวลาเริ่ม: เวลาจบ **ลบ** ระยะเวลา',
        'เวลาไม่ใช่ทศนิยม: ครบ 60 นาที ทดเป็น 1 ชั่วโมง'
      ],
      teacher: [
        'ในชีวิตจริง ถ้าต้องไปโรงเรียนให้ทันเวลา เราต้องวางแผนย้อนเวลาอย่างไรบ้าง?',
        'ให้นักเรียนสร้างโจทย์ "จัดตารางวันเที่ยว" ของตัวเองให้เพื่อนลองแก้',
        'ถ้านาฬิกาของเราเดินช้าไป 5 นาที ผลของการอ่านตารางเวลาจะเปลี่ยนไปอย่างไร?'
      ],
      outro: [
        { who: 'fon', mood: 'shock', text: 'โอ้โห! เจ้าแก้ทุกอย่างที่ข้าป่วนได้หมดเลย!' },
        { who: 'fon', mood: 'happy', text: 'ข้ายอมแล้ว... ขอเป็นเฟืองประจำหอนาฬิกาได้ไหม? ข้าจะหมุนให้ตรงเวลาเป๊ะ!' },
        { who: 'guk', mood: 'cheer', sfx: 'chime', keepFon: true, text: 'ได้เลย! และเสียงระฆังยามเที่ยงก็ดังก้อง... ติ๊กตี้กับเพื่อน ๆ กู้เวลาให้เมืองสำเร็จแล้ว!' },
        { who: 'guk', mood: 'happy', keepFon: true, text: 'บอกระยะเวลา เปลี่ยนหน่วย เทียบ อ่านตาราง และแก้โจทย์เวลาได้ครบ เก่งที่สุด!', last: 'กุ๊กกู๊!' }
      ]
    }
  ];

  const SKILLS = {
    hms: { name: 'ระยะเวลา วินาที นาที ชั่วโมง', rec: 'กลับไปที่ **ห้องเฟืองจิ๋ว** ฝึก {min:1} = {sec:60} และ {hr:1} = {min:60}' },
    dwmy: { name: 'ระยะเวลา วัน สัปดาห์ เดือน ปี', rec: 'ฝึกที่ **หอปฏิทินยักษ์** จำให้ได้ว่า {wk:1} = {day:7} และเดือนลงท้าย ยน = 30 วัน คม = 31 วัน' },
    compare: { name: 'เปรียบเทียบระยะเวลา', rec: 'ฝึกที่ **ตาชั่งเฟืองทอง** เปลี่ยนเป็นหน่วยเดียวกันก่อนเทียบเสมอ' },
    table: { name: 'อ่านตารางเวลา', rec: 'ฝึกที่ **สถานีตารางเวลา** อ่านตัวเลขหน้าจุด (ชั่วโมง) และหลังจุด (นาที) ให้ถูก' },
    span: { name: 'หาระยะเวลา เวลาเริ่ม เวลาจบ', rec: 'ฝึกกระโดดบนเส้นเวลา ไปชั่วโมงเต็มก่อน แล้วค่อยบวกส่วนที่เหลือ' },
    solve: { name: 'แก้โจทย์ปัญหาเกี่ยวกับเวลา', rec: 'กลับไปเล่น **ระฆังใหญ่ยามเที่ยง** อีกครั้ง ค่อย ๆ ทำทีละขั้นตอน' }
  };

  CT.STAGES = STAGES;
  CT.SKILLS = SKILLS;
  CT.LEAD_WRONG = LEAD_WRONG;
  CT.PRAISE = PRAISE;
  CT.TASKS = { tSortUnits, tUnitPick, tConvert, tClaim, tSpan, tCal, tMonthDays, tMonthsPick, tCompare, tOrderDur, tEq, tTable, tBackward, tPlan, tDiff, tShowdown, tMix, genShowdown };
})();
