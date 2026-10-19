/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — ตระกูลโจทย์นอกบันได: เปรียบเทียบ แบบรูปจำนวน ปัดเศษ ค่าประจำหลัก เงิน เศษส่วน ผสมหลายขั้น ฯลฯ
   ทุกตระกูลคืน "spec" แล้ว registerDK ทำให้เป็นแบบปรนัย (D) และแบบพิมพ์คำตอบ (K) ตามที่ใช้ได้
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const { clean, fm, plain, dis, base, mkChoices, ICONS, SYM } = DC.core;
  const NV = DC.NV;
  const T = DC.T;
  const ri = (r, a, b) => r.int(a, b);

  function mk(t, r, o) {
    const p = base(t, r);
    ['expr', 'text', 'ask', 'speak', 'line', 'scene', 'aid', 'exp', 'sig', 'mech'].forEach(k => { if (o[k] != null) p[k] = o[k]; });
    if (!p.sig) p.sig = t.id + '|' + (o.exp || JSON.stringify(o.expr));
    return p;
  }
  function fillWrongs(r, correct, wrongs) {
    const seen = new Set([String(correct)]), out = [];
    const add = w => { const k = String(w); if (!seen.has(k)) { seen.add(k); out.push(w); } };
    (wrongs || []).forEach(add);
    let g = 0;
    while (out.length < 3 && g++ < 60) {
      if (typeof correct === 'number') add(clean(Math.max(0, correct + r.pick([-3, -2, -1, 1, 2, 3, 10, -10]))));
      else {
        const m = /^(\d+)\/(\d+)$/.exec(correct);
        if (!m) break;
        const n = +m[1], d = +m[2];
        add(r.pick([(n + 1) + '/' + d, Math.max(1, n - 1) + '/' + d, n + '/' + (d + 1), n + '/' + (d * 2), (n * 2) + '/' + d, (n + 2) + '/' + d]));
      }
    }
    return out.slice(0, 3);
  }
  /* ลงทะเบียน: D = ปรนัย, K = พิมพ์ตอบ (ถ้าไม่ปิด noK) */
  function regDK(id, g, d, op, spec, opt) {
    opt = opt || {};
    const D = { id: id + '.D', g, d, op, fmt: 'D', family: opt.family || id.split('.')[0] };
    D.gen = r => {
      const o = spec(r);
      const p = mk(D, r, o);
      return mkChoices(r, p, o.correct, fillWrongs(r, o.correct, o.wrongs), o.lab);
    };
    T.push(D);
    if (!opt.noK) {
      const K = { id: id + '.K', g, d, op, fmt: 'K', family: D.family };
      K.gen = r => {
        const o = spec(r);
        const p = mk(K, r, o);
        p.mech = 'keypad'; p.answer = o.correct; p.keypad = { dec: !!o.dec };
        return p;
      };
      T.push(K);
    }
  }
  /* แบบเลือกจากรายการที่ติดป้าย (ไม่ใช่ตัวเลข) */
  function regD(id, g, d, op, spec, opt) { regDK(id, g, d, op, spec, Object.assign({ noK: true }, opt || {})); }
  function regCustom(id, g, d, op, fmt, genFn, family) {
    const t = { id, g, d, op, fmt, family: family || id.split('.')[0] };
    t.gen = r => genFn(t, r);
    T.push(t);
  }

  /* ═══ 1) เปรียบเทียบจำนวน ═══ */
  const CMP = [
    ['n10', 1, 1, r => ri(r, 0, 10)],
    ['n20', 1, 2, r => ri(r, 5, 20)],
    ['n100', 2, 1, r => ri(r, 10, 99)],
    ['n1000', 3, 1, r => ri(r, 100, 999)],
    ['n10k', 3, 3, r => ri(r, 1000, 9999)],
    ['n100k', 4, 2, r => ri(r, 10000, 99999)],
    ['n1m', 5, 1, r => ri(r, 100000, 999999)],
    ['dec1', 5, 2, r => clean(ri(r, 11, 99) / 10)],
    ['dec2', 5, 3, r => clean(ri(r, 101, 999) / 100)],
    ['dec3', 6, 1, r => clean(ri(r, 1001, 9999) / 1000)]
  ];
  function twoNear(r, gen) {                     // สองจำนวนที่ใกล้กัน (หลอกตา)
    let a = gen(r), b = gen(r), g = 0;
    while ((a === b || Math.abs(a - b) > Math.max(5, a * 0.35)) && g++ < 50) b = gen(r);
    if (a === b) b = clean(a + 1);
    return [a, b];
  }
  for (const [id, g, d, gen] of CMP) {
    regCustom('cmp.' + id + '.S', g, d, 'cmp', 'S', (t, r) => {            // ใส่ < = >
      let [a, b] = twoNear(r, gen); if (r.chance(0.12)) b = a;
      const real = a < b ? '<' : a > b ? '>' : '=';
      const p = base(t, r);
      p.expr = [fm(a), '?', fm(b)]; p.ask = 'which'; p.speak = ['q_which'];
      p.choices = ['<', '=', '>'].map(s => ({ v: s, label: s, ok: s === real, sym: true }));
      p.answer = real; p.exp = fm(a) + ' ' + real + ' ' + fm(b); p.sig = t.id + '|' + a + ',' + b;
      p.aid = { type: 'cmp', a, b };
      return p;
    });
    regCustom('cmp.' + id + '.G', g, d, 'cmp', 'G', (t, r) => {            // เลือกตัวที่มากกว่า/น้อยกว่า
      const big = r.chance(0.5);
      const set = new Set(); let guard = 0;
      const c0 = gen(r); set.add(c0);
      while (set.size < 3 && guard++ < 80) { const x = gen(r); if (Math.abs(x - c0) <= Math.max(8, c0 * 0.4)) set.add(x); }
      while (set.size < 3) set.add(clean(c0 + set.size * (id.startsWith('dec') ? 0.1 : 1)));
      const arr = [...set];
      const ans = big ? Math.max(...arr) : Math.min(...arr);
      const p = base(t, r);
      p.ask = big ? 'greater' : 'less'; p.speak = [big ? 'q_greater' : 'q_less']; p.expr = null;
      p.choices = r.shuffle(arr).map(v => ({ v, label: fm(v), ok: v === ans }));
      p.answer = ans; p.exp = arr.map(fm).join(', ') + ' → ' + fm(ans); p.sig = t.id + '|' + arr.sort().join(',');
      return p;
    });
    regCustom('cmp.' + id + '.O', g, d, 'cmp', 'O', (t, r) => {            // เรียงลำดับ
      const n = g <= 1 ? 3 : 4; const set = new Set(); let guard = 0;
      while (set.size < n && guard++ < 200) set.add(gen(r));
      while (set.size < n) set.add(clean(gen(r) + set.size));
      const arr = [...set]; const asc = r.chance(0.6);
      const p = base(t, r);
      p.mech = 'order'; p.ask = 'order'; p.line = asc ? 'd_order' : null; p.speak = [];
      p.order = { items: r.shuffle(arr).map(v => ({ v, label: fm(v) })), asc };
      p.answer = (asc ? arr.slice().sort((x, y) => x - y) : arr.slice().sort((x, y) => y - x)).join(',');
      p.exp = (asc ? 'น้อย → มาก: ' : 'มาก → น้อย: ') + p.answer.split(',').map(x => fm(+x)).join(', ');
      p.sig = t.id + '|' + arr.slice().sort().join(',') + (asc ? 'a' : 'd');
      return p;
    });
  }

  /* ═══ 2) แบบรูปจำนวน (นับเพิ่ม/นับลดเป็นช่วง) ═══ */
  const STEPS = [[1, 1, 1], [2, 1, 1], [5, 1, 1], [10, 1, 2], [3, 2, 1], [4, 2, 2], [6, 2, 3], [7, 3, 1], [8, 3, 1], [9, 3, 2], [12, 3, 3], [25, 4, 1], [50, 4, 1], [100, 4, 2], [15, 4, 3], [20, 4, 3], [250, 5, 1], [1000, 5, 2], [0.5, 5, 3], [0.25, 6, 1]];
  for (const [s, g, d] of STEPS) {
    for (const dir of ['up', 'down']) {
      if (dir === 'down' && s === 1) continue;
      regDK('pat.' + dir + '.s' + String(s).replace('.', '_'), g, d, 'pat', r => {
        const len = 5, pos = ri(r, 1, len - 1);
        const off = s < 5 ? ri(r, 0, 5) : 0;
        const start = dir === 'up' ? clean(s * ri(r, 0, 12) + off) : clean(s * (len + ri(r, 1, 12)) + off);
        const seq = []; for (let i = 0; i < len; i++) seq.push(clean(dir === 'up' ? start + s * i : start - s * i));
        const ans = seq[pos];
        const show = seq.map((v, i) => i === pos ? '?' : fm(v));
        const k = s < 1 ? 2 : 0;
        return {
          expr: show, ask: 'missing', speak: ['q_missing'], correct: ans, dec: s < 1,
          wrongs: dis(r, ans, [ans + s, ans - s, ans + 2 * s, ans - 2 * s], 3, k), exp: seq.map(fm).join(', '),
          aid: { type: 'pat', seq, pos }, sig: 'pat|' + seq.join(',')
        };
      });
    }
  }
  regDK('pat.alt', 4, 2, 'pat', r => {
    let a, b; do { a = ri(r, 2, 9); b = ri(r, 2, 9); } while (a === b);
    const st = ri(r, 1, 15);
    const seq = [st]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? a : b));
    const pos = ri(r, 2, 5), ans = seq[pos];
    return { expr: seq.map((v, i) => i === pos ? '?' : fm(v)), ask: 'missing', speak: ['q_missing'], correct: ans, wrongs: dis(r, ans, [ans + a, ans - b, ans + b], 3), exp: seq.join(', '), sig: 'alt|' + seq.join(',') };
  });
  regDK('pat.dbl', 5, 2, 'pat', r => {
    const m = r.pick([2, 3, 5]), st = ri(r, 1, 4);
    const seq = [st]; for (let i = 1; i < 5; i++) seq.push(seq[i - 1] * m);
    const pos = ri(r, 2, 4), ans = seq[pos];
    return { expr: seq.map((v, i) => i === pos ? '?' : fm(v)), ask: 'missing', speak: ['q_missing'], correct: ans, wrongs: dis(r, ans, [ans + m, seq[pos - 1] + m, ans * 2], 3), exp: seq.join(', '), sig: 'dbl|' + seq.join(',') };
  });

  /* ═══ 3) คู่ / คี่ ═══ */
  for (const [id, g, d, hi] of [['20', 2, 1, 20], ['100', 2, 2, 99], ['1000', 3, 1, 999], ['big', 4, 1, 99999]]) {
    for (const even of [true, false]) {
      regD('eo.' + (even ? 'even' : 'odd') + '.' + id, g, d, 'eo', r => {
        const ans = (() => { let v = ri(r, 1, hi); if ((v % 2 === 0) !== even) v += v < hi ? 1 : -1; return v; })();
        const wrongs = []; let guard = 0;
        while (wrongs.length < 3 && guard++ < 100) { let v = ri(r, 1, hi); if ((v % 2 === 0) === even) v += v < hi ? 1 : -1; if (v !== ans && !wrongs.includes(v)) wrongs.push(v); }
        return { text: even ? 'เลขคู่คือเลขไหน' : 'เลขคี่คือเลขไหน', ask: 'which', speak: ['q_which'], correct: ans, wrongs, exp: fm(ans) + (even ? ' หารสองลงตัว' : ' หารสองเหลือเศษหนึ่ง'), sig: 'eo|' + even + ans + wrongs.join() };
      });
    }
  }

  /* ═══ 4) เท่าตัว และ ครึ่งหนึ่ง ═══ */
  for (const [id, g, d, f] of [
    ['dbl10', 1, 2, r => { const n = ri(r, 1, 10); return { n, ans: 2 * n, txt: 'สองเท่าของ', e: [fm(n), '×', '2'], sp: [fm(n), '×', '2'] }; }],
    ['dbl50', 2, 2, r => { const n = ri(r, 6, 50); return { n, ans: 2 * n, txt: 'สองเท่าของ', e: [fm(n), '×', '2'], sp: [fm(n), '×', '2'] }; }],
    ['tri', 2, 3, r => { const n = ri(r, 2, 20); return { n, ans: 3 * n, txt: 'สามเท่าของ', e: [fm(n), '×', '3'], sp: [fm(n), '×', '3'] }; }],
    ['half20', 2, 2, r => { const n = 2 * ri(r, 1, 10); return { n, ans: n / 2, txt: 'ครึ่งหนึ่งของ', e: [fm(n), '÷', '2'], sp: [fm(n), '÷', '2'] }; }],
    ['half100', 3, 1, r => { const n = 2 * ri(r, 6, 50); return { n, ans: n / 2, txt: 'ครึ่งหนึ่งของ', e: [fm(n), '÷', '2'], sp: [fm(n), '÷', '2'] }; }],
    ['half1000', 4, 1, r => { const n = 2 * ri(r, 51, 499); return { n, ans: n / 2, txt: 'ครึ่งหนึ่งของ', e: [fm(n), '÷', '2'], sp: [fm(n), '÷', '2'] }; }],
    ['quarter', 4, 2, r => { const n = 4 * ri(r, 3, 60); return { n, ans: n / 4, txt: 'หนึ่งในสี่ของ', e: [fm(n), '÷', '4'], sp: [fm(n), '÷', '4'] }; }]
  ]) {
    regDK('dbl.' + id, g, d, 'dbl', r => {
      const q = f(r);
      return { text: q.txt + ' ' + fm(q.n), expr: q.e.concat(['=', '?']), ask: 'equals', speak: NV.expr(q.sp).concat(['q_equals']), correct: q.ans, wrongs: dis(r, q.ans, [q.n + 2, q.n, q.ans + 2, q.ans * 2], 3), exp: q.txt + ' ' + q.n + ' = ' + q.ans, sig: 'dbl|' + id + q.n };
    });
  }

  /* ═══ 5) ปัดเศษ ═══ */
  const roundTo = (n, u) => Math.round(n / u) * u;
  for (const [id, g, d, u, lo, hi, nm] of [
    ['r10', 3, 2, 10, 11, 999, 'สิบ'], ['r100', 3, 3, 100, 101, 9999, 'ร้อย'], ['r1000', 4, 1, 1000, 1001, 99999, 'พัน'],
    ['r10000', 4, 3, 10000, 10001, 999999, 'หมื่น'], ['r1', 5, 1, 1, 1, 1, 'หน่วย'], ['r01', 5, 3, 0.1, 1, 1, 'ทศนิยมหนึ่งตำแหน่ง']
  ]) {
    regDK('round.' + id, g, d, 'round', r => {
      let n;
      if (id === 'r1') n = clean(ri(r, 11, 999) / 10);
      else if (id === 'r01') n = clean(ri(r, 101, 999) / 100);
      else { do { n = ri(r, lo, hi); } while (n % u === 0 || (n % u) * 2 === u); }
      if (u === 1 || u === 0.1) { if (Math.abs((n * 10) % 10) === 5 && u === 1) n = clean(n + 0.1); }
      const ans = clean(roundTo(n, u));
      const down = clean(Math.floor(n / u) * u), up = clean(Math.ceil(n / u) * u);
      return { text: 'ปัดเศษ ' + fm(n) + ' เป็น' + (u >= 10 ? 'หลัก' : '') + nm + 'ที่ใกล้ที่สุด', ask: 'which', speak: [], correct: ans, dec: u < 1 || u === 1 && n % 1 !== 0 && false,
        wrongs: dis(r, ans, [ans === down ? up : down, ans + u, ans - u, down, up], 3, u < 1 ? 1 : 0), exp: fm(n) + ' ≈ ' + fm(ans), aid: { type: 'round', n, u }, sig: 'round|' + id + n };
    });
  }

  /* ═══ 6) ค่าประจำหลัก ═══ */
  function otherDigits(r, ans, digits) {
    const have = r.shuffle([...new Set(digits)].filter(x => x !== ans));
    const rest = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== ans && !have.includes(x)));
    return have.concat(rest).slice(0, 3);
  }
  const PV = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  for (const [id, g, d, len] of [['p3', 2, 2, 3], ['p4', 3, 1, 4], ['p5', 4, 1, 5], ['p6', 4, 3, 6], ['p7', 5, 1, 7]]) {
    regDK('pv.digit.' + id, g, d, 'pv', r => {
      let digits; do { digits = Array.from({ length: len }, (_, i) => i === 0 ? ri(r, 1, 9) : ri(r, 0, 9)); } while (new Set(digits).size < Math.min(4, len));
      const n = +digits.join(''), pos = ri(r, 0, len - 1), ans = digits[len - 1 - pos];
      return { text: 'เลข ' + fm(n) + ' หลัก' + PV[pos] + 'คือเลขอะไร', ask: 'which', speak: [], correct: ans, wrongs: otherDigits(r, ans, digits), exp: 'หลัก' + PV[pos] + ' = ' + ans, sig: 'pv|' + n + pos };
    }, {});
    regDK('pv.value.' + id, g, Math.min(3, d + 1), 'pv', r => {
      let digits; do { digits = Array.from({ length: len }, (_, i) => i === 0 ? ri(r, 1, 9) : ri(r, 0, 9)); } while (new Set(digits).size < len - 1 || digits.filter(x => x === 0).length > 1);
      const pos = ri(r, 1, len - 1); const dg = digits[len - 1 - pos]; if (dg === 0) digits[len - 1 - pos] = ri(r, 1, 9);
      const dd = digits[len - 1 - pos], n = +digits.join(''), ans = dd * Math.pow(10, pos);
      return { text: 'เลข ' + dd + ' ใน ' + fm(n) + ' มีค่าเท่าไหร่', ask: 'which', speak: [], correct: ans, wrongs: dis(r, ans, [dd, ans * 10, ans / 10 >= 1 ? ans / 10 : null, dd * Math.pow(10, pos === 1 ? 2 : pos - 1)], 3), exp: dd + ' อยู่หลัก' + PV[pos] + ' = ' + fm(ans), sig: 'pvv|' + n + pos };
    });
  }
  for (const [id, g, d, k] of [['t1', 5, 1, 1], ['t2', 5, 2, 2], ['t3', 6, 1, 3]]) {
    regDK('pv.dec.' + id, g, d, 'pv', r => {
      const ip = ri(r, 1, 99), fp = ri(r, 1, Math.pow(10, k) - 1);
      const frac = String(fp).padStart(k, '0'); const n = ip + '.' + frac; const pos = ri(r, 0, k - 1);
      const dg = +frac[pos];
      const names = ['หนึ่งส่วนสิบ', 'หนึ่งส่วนร้อย', 'หนึ่งส่วนพัน'];
      const pn = ['ทศนิยมตำแหน่งที่ 1', 'ทศนิยมตำแหน่งที่ 2', 'ทศนิยมตำแหน่งที่ 3'][pos];
      return { text: 'เลข ' + n + ' ' + pn + 'คือเลขอะไร', ask: 'which', speak: [], correct: dg, wrongs: otherDigits(r, dg, (frac + (ip % 10)).split('').map(Number)), exp: pn + ' = ' + dg, sig: 'pvd|' + n + pos };
    });
  }

  /* ═══ 7) เงินบาท ═══ */
  function money(id, g, d, f) { regDK('money.' + id, g, d, 'money', r => f(r)); }
  money('change20', 2, 1, r => { const p = ri(r, 3, 19), pay = 20; return { text: 'ซื้อของ ' + p + ' บาท จ่าย ' + pay + ' บาท', expr: [String(pay), '−', String(p), '=', '?'], ask: 'equals', scene: { kind: 'baht', price: p, pay }, speak: NV.expr([String(pay), '−', String(p)]).concat(['q_equals']), correct: pay - p, wrongs: dis(r, pay - p, [p, pay + p, pay - p + 10], 3), exp: pay + ' − ' + p + ' = ' + (pay - p), sig: 'm20|' + p }; });
  money('change50', 2, 3, r => { const p = ri(r, 12, 48), pay = 50; return { text: 'ซื้อของ ' + p + ' บาท จ่าย ' + pay + ' บาท', expr: [String(pay), '−', String(p), '=', '?'], ask: 'equals', scene: { kind: 'baht', price: p, pay }, speak: NV.expr([String(pay), '−', String(p)]).concat(['q_equals']), correct: pay - p, wrongs: dis(r, pay - p, [p - 10, pay - p + 10, pay + p], 3), exp: pay + ' − ' + p + ' = ' + (pay - p), sig: 'm50|' + p }; });
  money('change100', 3, 1, r => { const p = ri(r, 21, 98), pay = 100; return { text: 'ซื้อของ ' + p + ' บาท จ่าย ' + pay + ' บาท', expr: [String(pay), '−', String(p), '=', '?'], ask: 'equals', scene: { kind: 'baht', price: p, pay }, speak: NV.expr([String(pay), '−', String(p)]).concat(['q_equals']), correct: pay - p, wrongs: dis(r, pay - p, [p - 10, pay - p + 10, pay - p - 10], 3), exp: pay + ' − ' + p + ' = ' + (pay - p), sig: 'm100|' + p }; });
  money('change500', 3, 3, r => { const p = ri(r, 101, 489), pay = r.pick([500, 1000]); return { text: 'ซื้อของ ' + fm(p) + ' บาท จ่าย ' + fm(pay) + ' บาท', expr: [fm(pay), '−', fm(p), '=', '?'], ask: 'equals', speak: NV.expr([String(pay), '−', String(p)]).concat(['q_equals']), correct: pay - p, wrongs: dis(r, pay - p, [p - 10, pay - p + 10, pay - p - 100], 3), exp: pay + ' − ' + p + ' = ' + (pay - p), sig: 'm500|' + p + pay }; });
  money('total2', 2, 2, r => { const a = ri(r, 5, 45), b = ri(r, 5, 45); return { text: 'ของสองชิ้นราคา ' + a + ' กับ ' + b + ' บาท รวมกี่บาท', expr: [String(a), '+', String(b), '=', '?'], ask: 'equals', speak: NV.expr([String(a), '+', String(b)]).concat(['q_equals']), correct: a + b, wrongs: dis(r, a + b, [a + b + 10, a + b - 10, Math.abs(a - b)], 3), exp: a + ' + ' + b + ' = ' + (a + b), sig: 'mt|' + a + b }; });
  money('unit', 3, 2, r => { const p = ri(r, 3, 25), n = ri(r, 2, 9); return { text: 'ชิ้นละ ' + p + ' บาท ซื้อ ' + n + ' ชิ้น', expr: [String(n), '×', String(p), '=', '?'], ask: 'equals', speak: NV.expr([String(n), '×', String(p)]).concat(['q_equals']), correct: n * p, wrongs: dis(r, n * p, [n + p, n * p + p, n * p - p], 3), exp: n + ' × ' + p + ' = ' + n * p, sig: 'mu|' + p + n }; });
  money('share', 4, 1, r => { const n = ri(r, 2, 9), q = ri(r, 12, 99), tot = n * q; return { text: 'เงิน ' + fm(tot) + ' บาท แบ่งให้ ' + n + ' คนเท่า ๆ กัน', expr: [fm(tot), '÷', String(n), '=', '?'], ask: 'equals', speak: NV.expr([String(tot), '÷', String(n)]).concat(['q_equals']), correct: q, wrongs: dis(r, q, [q + n, q - 1, q + 10], 3), exp: tot + ' ÷ ' + n + ' = ' + q, sig: 'ms|' + tot + n }; });
  money('save', 5, 2, r => { const w = ri(r, 25, 95), k = ri(r, 6, 20), t = w * k; return { text: 'เก็บเงินสัปดาห์ละ ' + w + ' บาท ' + k + ' สัปดาห์', expr: [String(k), '×', String(w), '=', '?'], ask: 'equals', speak: NV.expr([String(k), '×', String(w)]).concat(['q_equals']), correct: t, wrongs: dis(r, t, [t + w, t - w, t + 10 * k], 3), exp: k + ' × ' + w + ' = ' + fm(t), sig: 'msv|' + w + k }; });

  /* ═══ 8) ครอบครัวของจำนวน ═══ */
  regDK('fam.add', 1, 3, 'fam', r => { const a = ri(r, 2, 9), b = ri(r, 2, 10 - 1), c = a + b; const ask = r.pick([a, b]); const other = ask === a ? b : a; return { expr: [fm(a), '+', fm(b), '=', fm(c), '→', fm(c), '−', fm(other), '=', '?'], text: 'ใช้ ' + a + ' + ' + b + ' = ' + c + ' ช่วยคิด', ask: 'equals', speak: NV.expr([String(c), '−', String(other)]).concat(['q_equals']), correct: ask, wrongs: dis(r, ask, [c, a + b + 1], 3), exp: c + ' − ' + other + ' = ' + ask, sig: 'fa|' + a + b + ask }; });
  regDK('fam.sub', 2, 2, 'fam', r => { const a = ri(r, 11, 50), b = ri(r, 5, 9), c = a + b; return { expr: [fm(c), '−', fm(b), '=', fm(a), '→', fm(a), '+', fm(b), '=', '?'], text: 'ตรวจคำตอบด้วยการบวก', ask: 'equals', speak: NV.expr([String(a), '+', String(b)]).concat(['q_equals']), correct: c, wrongs: dis(r, c, [a - b, c + 10, c - 10], 3), exp: a + ' + ' + b + ' = ' + c, sig: 'fs|' + a + b }; });
  regDK('fam.mul', 3, 2, 'fam', r => { const a = ri(r, 2, 9), b = ri(r, 2, 9), c = a * b; const ask = r.pick([a, b]); const other = ask === a ? b : a; return { expr: [fm(a), '×', fm(b), '=', fm(c), '→', fm(c), '÷', fm(other), '=', '?'], text: 'คูณกับหารเป็นคู่กัน', ask: 'equals', speak: NV.expr([String(c), '÷', String(other)]).concat(['q_equals']), correct: ask, wrongs: dis(r, ask, [c - other, other + 1, ask + 1], 3), exp: c + ' ÷ ' + other + ' = ' + ask, sig: 'fm|' + a + b + ask }; });
  regDK('fam.div', 4, 1, 'fam', r => { const k = ri(r, 2, 9), q = ri(r, 11, 60), n = k * q; return { expr: [fm(n), '÷', fm(k), '=', fm(q), '→', fm(q), '×', fm(k), '=', '?'], text: 'ตรวจคำตอบด้วยการคูณ', ask: 'equals', speak: NV.expr([String(q), '×', String(k)]).concat(['q_equals']), correct: n, wrongs: dis(r, n, [q + k, n + k, n - k, n + 10], 3), exp: q + ' × ' + k + ' = ' + n, sig: 'fd|' + n + k }; });

  /* ═══ 9) บวกสามจำนวน ═══ */
  for (const [id, g, d, lo, hi, cap] of [['s100', 3, 2, 5, 50, 100], ['s1000', 3, 3, 50, 500, 1000], ['s10k', 4, 2, 500, 5000, 10000]]) {
    regDK('add3.' + id, g, d, 'add', r => {
      let a, b, c; do { a = ri(r, lo, hi); b = ri(r, lo, hi); c = ri(r, lo, hi); } while (a + b + c >= cap);
      const s = a + b + c;
      return { expr: [fm(a), '+', fm(b), '+', fm(c), '=', '?'], ask: 'equals', speak: NV.expr([String(a), '+', String(b), '+', String(c)]).concat(['q_equals']), correct: s, wrongs: dis(r, s, [s + 10, s - 10, s + 100 > cap ? null : s + 100, a + b], 3), exp: a + ' + ' + b + ' + ' + c + ' = ' + fm(s), sig: 'a3|' + [a, b, c].join(), aid: { type: 'add', a: a + b, b: c } };
    });
  }

  /* ═══ 10) โจทย์ผสมหลายขั้น (ลำดับการคำนวณ) ═══ */
  const MIX = [
    ['a+bxc', 4, 2, r => { const a = ri(r, 2, 30), b = ri(r, 2, 9), c = ri(r, 2, 9); return [[fm(a), '+', fm(b), '×', fm(c)], a + b * c, [a + b + c, (a + b) * c, a * b + c], 'ทำ × ก่อน: ' + b + ' × ' + c + ' = ' + b * c + ' แล้ว + ' + a]; }],
    ['axb+c', 4, 1, r => { const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 30); return [[fm(a), '×', fm(b), '+', fm(c)], a * b + c, [a * (b + c), a + b + c, a * b * c], a + ' × ' + b + ' = ' + a * b + ' แล้ว + ' + c]; }],
    ['a-bxc', 5, 1, r => { const b = ri(r, 2, 9), c = ri(r, 2, 9), a = b * c + ri(r, 2, 40); return [[fm(a), '−', fm(b), '×', fm(c)], a - b * c, [(a - b) * c, a - b - c, a + b * c], 'ทำ × ก่อน: ' + b + ' × ' + c + ' = ' + b * c]; }],
    ['(a+b)xc', 5, 1, r => { const a = ri(r, 2, 20), b = ri(r, 2, 20), c = ri(r, 2, 9); return [['(', fm(a), '+', fm(b), ')', '×', fm(c)], (a + b) * c, [a + b * c, a * c + b, (a + b) + c], 'ทำในวงเล็บก่อน: ' + a + ' + ' + b + ' = ' + (a + b)]; }],
    ['(a-b)xc', 5, 2, r => { const b = ri(r, 2, 20), a = b + ri(r, 2, 30), c = ri(r, 2, 9); return [['(', fm(a), '−', fm(b), ')', '×', fm(c)], (a - b) * c, [a - b * c, a * c - b, a - b + c], 'ทำในวงเล็บก่อน: ' + a + ' − ' + b + ' = ' + (a - b)]; }],
    ['a+b/c', 5, 2, r => { const c = ri(r, 2, 9), q = ri(r, 2, 12), b = c * q, a = ri(r, 2, 40); return [[fm(a), '+', fm(b), '÷', fm(c)], a + q, [(a + b) / c, a + b + c, a + b - c], 'ทำ ÷ ก่อน: ' + b + ' ÷ ' + c + ' = ' + q]; }],
    ['a/b+c', 5, 3, r => { const b = ri(r, 2, 9), q = ri(r, 2, 15), a = b * q, c = ri(r, 2, 30); return [[fm(a), '÷', fm(b), '+', fm(c)], q + c, [a / (b + c) | 0, a + c, q * c], a + ' ÷ ' + b + ' = ' + q + ' แล้ว + ' + c]; }],
    ['(a+b)/c', 6, 1, r => { const c = ri(r, 2, 9), q = ri(r, 3, 20), s = c * q, a = ri(r, 1, s - 1), b = s - a; return [['(', fm(a), '+', fm(b), ')', '÷', fm(c)], q, [a + b / c, s, q + 1], 'ในวงเล็บก่อน: ' + a + ' + ' + b + ' = ' + s]; }],
    ['axb-cxd', 6, 2, r => { const a = ri(r, 3, 12), b = ri(r, 3, 12), c = ri(r, 2, 6), d = ri(r, 2, 6); return [[fm(a), '×', fm(b), '−', fm(c), '×', fm(d)], a * b - c * d, [(a * b - c) * d, a * b - c + d, a * b + c * d], 'คูณก่อนทั้งสองส่วน: ' + a * b + ' และ ' + c * d]; }],
    ['a-b+c', 4, 3, r => { const a = ri(r, 30, 90), b = ri(r, 11, 29), c = ri(r, 5, 40); return [[fm(a), '−', fm(b), '+', fm(c)], a - b + c, [a - (b + c), a + b - c, a - b - c], 'ทำจากซ้ายไปขวา: ' + a + ' − ' + b + ' = ' + (a - b)]; }]
  ];
  for (const [id, g, d, f] of MIX) {
    regDK('mix.' + id, g, d, 'mix', r => {
      const [tok, ans, ex, why] = f(r);
      const e = ex.map(v => Math.round(v)).filter(v => v !== ans && v >= 0);
      return { expr: tok.concat(['=', '?']), ask: 'equals', speak: [], line: null, correct: ans, wrongs: dis(r, ans, e, 3), exp: tok.join(' ') + ' = ' + fm(ans) + '  (' + why + ')', sig: 'mix|' + tok.join('') };
    });
  }

  /* ═══ 11) เศษส่วน ═══ */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fr = (n, d) => n + '/' + d;
  regDK('fr.add', 4, 1, 'frac', r => { const d = r.pick([3, 4, 5, 6, 8, 10]), a = ri(r, 1, d - 2), b = ri(r, 1, d - 1 - a); const s = a + b; return { expr: [fr(a, d), '+', fr(b, d), '=', '?'], ask: 'equals', speak: NV.expr([fr(a, d), '+', fr(b, d)]).concat(['q_equals']), correct: fr(s, d), lab: x => x, wrongs: [fr(s, d * 2), fr(s + 1, d), fr(a + b, d + d)].filter(x => x !== fr(s, d)).slice(0, 3), exp: a + '/' + d + ' + ' + b + '/' + d + ' = ' + s + '/' + d, scene: { kind: 'bars', parts: [[a, d], [b, d]] }, sig: 'fra|' + a + b + d }; }, { noK: true });
  regDK('fr.sub', 4, 2, 'frac', r => { const d = r.pick([4, 5, 6, 8, 10]), a = ri(r, 2, d - 1), b = ri(r, 1, a - 1); const s = a - b; return { expr: [fr(a, d), '−', fr(b, d), '=', '?'], ask: 'equals', speak: NV.expr([fr(a, d), '−', fr(b, d)]).concat(['q_equals']), correct: fr(s, d), lab: x => x, wrongs: [fr(s, d - b > 0 ? d - b : d + 1), fr(a + b, d), fr(s, 0 + d * 2)].filter(x => x !== fr(s, d)).slice(0, 3), exp: a + '/' + d + ' − ' + b + '/' + d + ' = ' + s + '/' + d, scene: { kind: 'bars', parts: [[a, d]], take: b }, sig: 'frs|' + a + b + d }; }, { noK: true });
  regDK('fr.cmpden', 4, 1, 'frac', r => { const d = r.pick([5, 6, 7, 8, 9, 10]); let a = ri(r, 1, d - 1), b = ri(r, 1, d - 1); while (a === b) b = ri(r, 1, d - 1); const real = a < b ? '<' : '>'; return { expr: [fr(a, d), '?', fr(b, d)], ask: 'which', speak: ['q_which'], correct: real, lab: x => x, wrongs: ['<', '=', '>'].filter(x => x !== real), exp: a + '/' + d + ' ' + real + ' ' + b + '/' + d, scene: { kind: 'bars', parts: [[a, d], [b, d]] }, sig: 'frc|' + a + b + d, sym: true }; }, { noK: true });
  regDK('fr.cmpnum', 5, 1, 'frac', r => { const n = ri(r, 1, 4); let a = ri(r, n + 1, 12), b = ri(r, n + 1, 12); while (a === b) b = ri(r, n + 1, 12); const real = n / a < n / b ? '<' : '>'; return { expr: [fr(n, a), '?', fr(n, b)], ask: 'which', speak: ['q_which'], correct: real, lab: x => x, wrongs: ['<', '=', '>'].filter(x => x !== real), exp: n + '/' + a + ' ' + real + ' ' + n + '/' + b, sig: 'frn|' + n + a + b, sym: true }; }, { noK: true });
  regDK('fr.equiv', 5, 2, 'frac', r => { const a = ri(r, 1, 4), b = ri(r, a + 1, 6), m = ri(r, 2, 5); return { expr: [fr(a, b), '=', '?/' + b * m], ask: 'missing', speak: ['q_missing'], correct: a * m, wrongs: dis(r, a * m, [a + m, a * m + 1, b * m - a], 3), exp: a + '/' + b + ' = ' + a * m + '/' + b * m, sig: 'fre|' + a + b + m }; });
  regDK('fr.of', 5, 3, 'frac', r => { const d = r.pick([2, 3, 4, 5, 6, 8, 10]), a = ri(r, 1, d - 1), q = ri(r, 2, 12), n = d * q; return { text: fr(a, d) + ' ของ ' + n, expr: [fr(a, d), '×', fm(n), '=', '?'], ask: 'equals', speak: [], correct: a * q, wrongs: dis(r, a * q, [q, n - a, a * n, q * (a + 1)], 3), exp: n + ' ÷ ' + d + ' = ' + q + ' แล้ว × ' + a, sig: 'fro|' + a + d + n }; });
  regDK('fr.mixed', 6, 1, 'frac', r => { const d = r.pick([3, 4, 5, 6, 8]), w = ri(r, 1, 5), n = ri(r, 1, d - 1); const top = w * d + n; return { text: 'เศษเกินที่เท่ากับ ' + w + ' และ ' + n + '/' + d, ask: 'which', speak: [], correct: fr(top, d), lab: x => x, wrongs: [fr(w + n, d), fr(top + 1, d), fr(w * n, d)].filter(x => x !== fr(top, d)).slice(0, 3), exp: w + ' × ' + d + ' + ' + n + ' = ' + top, sig: 'frm|' + w + n + d }; }, { noK: true });
  regDK('fr.unlike', 6, 2, 'frac', r => { const d = r.pick([2, 3, 4, 5]), m = ri(r, 2, 3), a = ri(r, 1, d - 1), b = ri(r, 1, m * d - 1); const num = a * m + b, den = d * m; const g = gcd(num, den); return { expr: [fr(a, d), '+', fr(b, den), '=', '?'], ask: 'equals', speak: NV.expr([fr(a, d), '+', fr(b, den)]).concat(['q_equals']), correct: fr(num / g, den / g), lab: x => x, wrongs: [fr(a + b, d + den), fr(a + b, den), fr(num / g + 1, den / g)].filter(x => x !== fr(num / g, den / g)).slice(0, 3), exp: fr(a, d) + ' = ' + fr(a * m, den) + ' → ' + fr(num, den), sig: 'fru|' + a + d + b + m }; }, { noK: true });
  regDK('fr.times', 6, 3, 'frac', r => { const a = ri(r, 1, 3), b = ri(r, a + 1, 5), c = ri(r, 1, 3), d = ri(r, c + 1, 5); const n = a * c, dn = b * d, g = gcd(n, dn); return { expr: [fr(a, b), '×', fr(c, d), '=', '?'], ask: 'equals', speak: NV.expr([fr(a, b), '×', fr(c, d)]).concat(['q_equals']), correct: fr(n / g, dn / g), lab: x => x, wrongs: [fr(a + c, b + d), fr(n / g, (dn / g) + 1), fr(a * d, b * c)].filter(x => x !== fr(n / g, dn / g)).slice(0, 3), exp: fr(a, b) + ' × ' + fr(c, d) + ' = ' + fr(n, dn), sig: 'frt|' + a + b + c + d }; }, { noK: true });

  /* ═══ 12) ประมาณค่า ═══ */
  regDK('est.add', 4, 1, 'est', r => { const a = ri(r, 120, 890), b = ri(r, 120, 890); const ans = roundTo(a, 100) + roundTo(b, 100); return { text: 'ประมาณผลบวก (ปัดเป็นร้อย)', expr: [fm(a), '+', fm(b), '≈', '?'], ask: 'which', speak: [], correct: ans, wrongs: dis(r, ans, [a + b, ans + 100, ans - 100], 3), exp: roundTo(a, 100) + ' + ' + roundTo(b, 100) + ' = ' + ans, sig: 'ea|' + a + b }; });
  regDK('est.sub', 4, 2, 'est', r => { const b = ri(r, 120, 480), a = b + ri(r, 200, 500); const ans = roundTo(a, 100) - roundTo(b, 100); return { text: 'ประมาณผลลบ (ปัดเป็นร้อย)', expr: [fm(a), '−', fm(b), '≈', '?'], ask: 'which', speak: [], correct: ans, wrongs: dis(r, ans, [a - b, ans + 100, ans - 100], 3), exp: roundTo(a, 100) + ' − ' + roundTo(b, 100) + ' = ' + ans, sig: 'es|' + a + b }; });
  regDK('est.mul', 5, 1, 'est', r => { const a = ri(r, 21, 89), b = ri(r, 21, 89); const ans = roundTo(a, 10) * roundTo(b, 10); return { text: 'ประมาณผลคูณ (ปัดเป็นสิบ)', expr: [fm(a), '×', fm(b), '≈', '?'], ask: 'which', speak: [], correct: ans, wrongs: dis(r, ans, [a * b, ans + 100, ans - 100, ans * 10], 3), exp: roundTo(a, 10) + ' × ' + roundTo(b, 10) + ' = ' + fm(ans), sig: 'em|' + a + b }; });
  regDK('est.div', 5, 3, 'est', r => { const b = r.pick([20, 30, 40, 50, 60]) + ri(r, 0, 4), q = ri(r, 3, 15), a = roundTo(b, 10) * q + ri(r, 1, 9); const ans = roundTo(a, 10) / roundTo(b, 10); return { text: 'ประมาณผลหาร (ปัดเป็นสิบ)', expr: [fm(a), '÷', fm(b), '≈', '?'], ask: 'which', speak: [], correct: Math.round(ans), wrongs: dis(r, Math.round(ans), [q + 1, q - 1, q * 10], 3), exp: roundTo(a, 10) + ' ÷ ' + roundTo(b, 10) + ' ≈ ' + Math.round(ans), sig: 'ed|' + a + b }; });

  /* ═══ 13) ตัวประกอบ พหุคูณ จำนวนเฉพาะ ═══ */
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  regD('num.multiple', 4, 1, 'num', r => { const k = ri(r, 3, 9); const ans = k * ri(r, 4, 12); const w = []; while (w.length < 3) { const v = ri(r, k * 3, k * 12); if (v % k !== 0 && !w.includes(v)) w.push(v); } return { text: 'ข้อไหนเป็นพหุคูณของ ' + k, ask: 'which', speak: ['q_which'], correct: ans, wrongs: w, exp: fm(ans) + ' = ' + k + ' × ' + ans / k, sig: 'nm|' + k + ans }; });
  regD('num.factor', 4, 3, 'num', r => { const n = r.pick([12, 18, 20, 24, 28, 30, 36, 42, 48, 60]); const fs = []; for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i); const ans = r.pick(fs.filter(x => x > 1 && x < n)); const w = []; let g = 0; while (w.length < 3 && g++ < 100) { const v = ri(r, 2, n - 1); if (n % v !== 0 && !w.includes(v)) w.push(v); } return { text: 'ข้อไหนเป็นตัวประกอบของ ' + n, ask: 'which', speak: ['q_which'], correct: ans, wrongs: w, exp: n + ' ÷ ' + ans + ' = ' + n / ans, sig: 'nf|' + n + ans }; });
  regD('num.prime', 5, 2, 'num', r => { const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]; const ans = r.pick(ps); const cs = []; while (cs.length < 3) { const v = ri(r, 9, 49); if (!isPrime(v) && !cs.includes(v)) cs.push(v); } return { text: 'ข้อไหนเป็นจำนวนเฉพาะ', ask: 'which', speak: ['q_which'], correct: ans, wrongs: cs, exp: ans + ' หารลงตัวด้วย 1 กับตัวเองเท่านั้น', sig: 'np|' + ans + cs.join() }; });
  regD('num.divrule', 4, 2, 'num', r => { const k = r.pick([2, 3, 5, 9, 10]); const ok = n => n % k === 0; const ans = (() => { let v; do { v = ri(r, 30, 999); } while (!ok(v)); return v; })(); const w = []; while (w.length < 3) { const v = ri(r, 30, 999); if (!ok(v) && !w.includes(v)) w.push(v); } return { text: 'ข้อไหนหารด้วย ' + k + ' ลงตัว', ask: 'which', speak: ['q_which'], correct: ans, wrongs: w, exp: ans + ' ÷ ' + k + ' = ' + ans / k, sig: 'nd|' + k + ans }; });
  regDK('num.gcd', 5, 3, 'num', r => { const g = ri(r, 2, 9); let a, b; do { a = ri(r, 2, 6); b = ri(r, 2, 6); } while (a === b); const x = g * a, y = g * b, G = gcd(x, y); return { text: 'ห.ร.ม. ของ ' + x + ' กับ ' + y, ask: 'which', speak: [], correct: G, wrongs: dis(r, G, [x * y / G, G * 2, Math.max(1, G - 1), 1], 3), exp: 'ห.ร.ม. = ' + G, sig: 'ng|' + x + y }; });
  regDK('num.lcm', 6, 2, 'num', r => { let a, b; do { a = ri(r, 2, 9); b = ri(r, 2, 9); } while (a === b); const G = gcd(a, b), L = a * b / G; return { text: 'ค.ร.น. ของ ' + a + ' กับ ' + b, ask: 'which', speak: [], correct: L, wrongs: dis(r, L, [a * b === L ? a + b : a * b, L * 2, L + a, a + b], 3), exp: 'ค.ร.น. = ' + L, sig: 'nl|' + a + b }; });

  /* ═══ 14) ร้อยละ ═══ */
  regDK('pct.of', 6, 1, 'pct', r => { const p = r.pick([10, 20, 25, 50]), base = p === 25 ? 4 * ri(r, 2, 40) : p === 20 ? 5 * ri(r, 2, 40) : 10 * ri(r, 2, 40); const ans = base * p / 100; return { text: p + '% ของ ' + base, ask: 'equals', speak: [], correct: ans, wrongs: dis(r, ans, [base / 10, base - ans, ans * 2, p], 3), exp: base + ' × ' + p + ' ÷ 100 = ' + ans, sig: 'pc|' + p + base }; });
  regDK('pct.sale', 6, 3, 'pct', r => { const p = r.pick([10, 20, 25, 50]), base = 20 * ri(r, 3, 40); const off = base * p / 100, ans = base - off; return { text: 'ลดราคา ' + p + '% จาก ' + base + ' บาท เหลือกี่บาท', ask: 'equals', speak: [], correct: ans, wrongs: dis(r, ans, [off, base + off, ans + 10], 3), exp: base + ' − ' + off + ' = ' + ans, sig: 'ps|' + p + base }; });

  /* ═══ 15) นับสิ่งของ (แตะนับ) และเส้นจำนวน ═══ */
  regCustom('cnt.10', 1, 1, 'count', 'S', (t, r) => {
    const n = ri(r, 2, 10), icon = r.pick(ICONS);
    const p = base(t, r); p.ask = 'count'; p.line = 'd_count'; p.scene = { kind: 'scatter', icon, n, tap: true }; p.speak = []; p.expr = null;
    p.sig = t.id + '|' + n + icon + r.int(0, 99999);
    p.exp = 'มีทั้งหมด ' + n; return mkChoices(r, p, n, dis(r, n, [n + 1, n - 1], 3));
  });
  regCustom('cnt.20', 1, 2, 'count', 'S', (t, r) => {
    const n = ri(r, 11, 20), icon = r.pick(ICONS);
    const p = base(t, r); p.ask = 'count'; p.line = 'd_count'; p.scene = { kind: 'scatter', icon, n, tap: true }; p.speak = []; p.expr = null;
    p.sig = t.id + '|' + n + icon + r.int(0, 99999);
    p.exp = 'มีทั้งหมด ' + n; return mkChoices(r, p, n, dis(r, n, [n + 1, n - 1, n + 10], 3));
  });
  for (const [id, g, d, lo, hi, step] of [['nl10', 1, 1, 0, 10, 1], ['nl20', 1, 3, 0, 20, 1], ['nl100', 2, 2, 0, 100, 10]]) {
    regCustom('nl.' + id, g, d, 'nl', 'S', (t, r) => {
      const ticks = []; for (let v = lo; v <= hi; v += step) ticks.push(v);
      const ans = r.pick(ticks.filter(v => v > lo && v < hi));
      const p = base(t, r); p.ask = 'which'; p.scene = { kind: 'marker', ticks, at: ans }; p.speak = ['q_which']; p.expr = null; p.text = 'ลูกศรชี้เลขอะไร';
      p.sig = t.id + '|' + ans; p.exp = 'ลูกศรชี้ ' + ans; return mkChoices(r, p, ans, dis(r, ans, [ans + step, ans - step, ans + 2 * step], 3));
    });
  }

  /* ═══ 16) ต่างกันเท่าไหร่ ═══ */
  for (const [id, g, d, hi] of [['d20', 2, 2, 20], ['d100', 3, 1, 90]]) {
    regDK('diff.' + id, g, d, 'diff', r => { const b = ri(r, 3, hi - 3), a = b + ri(r, 2, Math.min(hi - b, hi / 2 | 0)); return { text: 'สีส้ม ' + a + ' สีฟ้า ' + b + ' ต่างกันเท่าไหร่', expr: [fm(a), '−', fm(b), '=', '?'], ask: 'equals', speak: NV.expr([String(a), '−', String(b)]).concat(['q_equals']), scene: hi <= 20 ? { kind: 'bars2', a, b } : null, correct: a - b, wrongs: dis(r, a - b, [a + b, b, a - b + 10], 3), exp: a + ' − ' + b + ' = ' + (a - b), sig: 'df|' + a + b }; });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
