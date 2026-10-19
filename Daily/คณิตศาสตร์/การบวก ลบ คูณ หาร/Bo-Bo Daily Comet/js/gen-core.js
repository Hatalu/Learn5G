/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — แกนตัวสร้างโจทย์: ตัวช่วย ตัวหลอก ตัวสร้างรูปแบบโจทย์ (D K M N S H B X C P R)
   โจทย์ 1 ข้อ (problem) = วัตถุที่ UI เอาไปวาดได้ทันที ไม่มีข้อมูลตายตัว
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const NV = DC.NV;

  /* ── ตัวช่วยตัวเลข ── */
  const SYM = { add: '+', sub: '−', mul: '×', div: '÷' };
  const ICONS = ['star', 'moon', 'fuel', 'crystal', 'cookie'];
  const ICON_TH = { star: 'ดาว', moon: 'พระจันทร์', fuel: 'ถังพลังงาน', crystal: 'คริสตัล', cookie: 'คุกกี้' };

  const clean = v => +(+v).toFixed(8);
  function fm(n) {                       // แสดงตัวเลข: มีจุลภาคตั้งแต่ 1,000
    if (typeof n === 'string') return n;
    n = clean(n);
    if (Number.isInteger(n)) return Math.abs(n) >= 1000 ? n.toLocaleString('en-US') : String(n);
    return String(n);
  }
  const plain = n => String(clean(n));  // ไม่มีจุลภาค (ใช้พูด/เทียบ)
  function norm(s) {                     // ปรับคำตอบที่พิมพ์ให้เทียบกันได้
    s = String(s).replace(/,/g, '').trim();
    if (s === '' || s === '.') return null;
    const v = parseFloat(s);
    return isNaN(v) ? null : String(clean(v));
  }
  const carries = (a, b) => { let c = 0; while (a > 0 || b > 0 || c) { const s = (a % 10) + (b % 10) + c; if (s >= 10) return true; c = 0; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; };
  const borrows = (a, b) => { while (a > 0 || b > 0) { if ((a % 10) < (b % 10)) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; };
  function pw(r, fa, fb, ok) {           // สุ่มคู่ที่ผ่านเงื่อนไข
    for (let i = 0; i < 400; i++) { const a = fa(r), b = fb(r); if (!ok || ok(a, b)) return [a, b]; }
    return [fa(r), fb(r)];
  }
  function calc(op, a, b) {
    if (op === 'add') return clean(a + b);
    if (op === 'sub') return clean(a - b);
    if (op === 'mul') return clean(a * b);
    return clean(a / b);
  }
  const swapDigits = n => { const s = String(Math.abs(Math.round(n))); if (s.length < 2) return n; const i = s.length - 2; return +(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)); };

  /* ── ตัวหลอก: ผิดแบบที่เด็กพลาดจริง + ใกล้เคียง ── */
  function dis(r, ans, extras, n, k) {
    n = n || 3;
    const unit = k ? Math.pow(10, -k) : 1;
    const out = [], seen = new Set([clean(ans)]);
    const push = v => { v = clean(v); if (v >= 0 && !seen.has(v) && (k || Number.isInteger(v))) { seen.add(v); out.push(v); } };
    const ex = r.shuffle((extras || []).filter(v => v != null && isFinite(v)));
    for (const v of ex) { if (out.length >= Math.max(1, n - 1)) break; push(v); }
    const mags = [1, 1, 2, 10, 10, 3, 5];
    if (ans > 60) mags.push(20, 50);
    if (ans > 500) mags.push(100, 100);
    if (ans > 5000) mags.push(1000);
    if (ans > 50000) mags.push(10000);
    let guard = 0;
    while (out.length < n && guard++ < 200) {
      const m = r.pick(mags) * (k && r.chance(0.6) ? unit * 10 : unit);
      push(ans + (r.chance(0.5) ? m : -m));
    }
    while (out.length < n) push(ans + out.length + 1 + (guard++));
    return out.slice(0, n);
  }

  /* ── ตัวสร้างข้อ ── */
  function base(t, r) {
    return { tid: t.id, g: t.g, d: t.d, lv: (t.g - 1) * 3 + t.d, op: t.op, fmt: t.fmt, mech: 'choice', ask: 'equals', expr: null, scene: null, line: null, speak: [], text: null, answer: null, choices: null, hint: null, exp: '', sig: '' };
  }
  function mkChoices(r, p, correct, wrongs, lab) {
    lab = lab || fm;
    const all = [{ v: correct, label: lab(correct), ok: true }].concat(wrongs.map(v => ({ v, label: lab(v), ok: false })));
    p.choices = r.shuffle(all);
    p.answer = correct;
    return p;
  }
  function eqStr(a, op, b, c) { return fm(a) + ' ' + SYM[op] + ' ' + fm(b) + ' = ' + fm(c); }
  const opId = { add: 'op_plus', sub: 'op_minus', mul: 'op_times', div: 'op_div' };

  /* บันทึกข้อมูลช่วยอธิบาย (aid) ตามชนิดการดำเนินการ */
  function aidFor(op, a, b, k) { return { type: op, a, b, k: k || 0 }; }

  /* ═══ รูปแบบโจทย์สำหรับ a ○ b (ladder) ═══
     ent = { op, k (จำนวนตำแหน่งทศนิยม), rem (มีเศษ) } */
  const FMT = {};

  function head(t, r, ent, a, b, c) {
    const p = base(t, r);
    p.A = a; p.B = b; p.C = c; p.opSym = SYM[ent.op];
    p.aid = aidFor(ent.op, a, b, ent.k);
    p.exp = eqStr(a, ent.op, b, c) + (ent.rem && a % b > 0 ? ' เศษ ' + (a % b) : '');
    return p;
  }
  function ex1(ent, a, b, c) { return { add: [c - 10, a - b, a + b + 10, c + 10], sub: [Math.abs(b - a), a + b, c + 10, c - 10], mul: [a + b, c + a, c - a, c + b, c - b], div: [a - b, a * b, c + 1, c - 1] }[ent.op]; }

  FMT.D = (t, r, ent, a, b, c) => {
    const p = head(t, r, ent, a, b, c);
    p.expr = [fm(a), SYM[ent.op], fm(b), '=', '?'].concat(ent.rem ? ['เศษ', String(a % b)] : []);
    p.speak = NV.expr([plain(a), SYM[ent.op], plain(b)]).concat(['q_equals']);
    p.sig = p.tid + '|' + a + ',' + b;
    return mkChoices(r, p, c, dis(r, c, ex1(ent, a, b, c), 3, ent.k));
  };
  FMT.K = (t, r, ent, a, b, c) => {
    const p = FMT.D(t, r, ent, a, b, c);
    p.mech = 'keypad'; p.choices = null; p.answer = c; p.keypad = { dec: !!ent.k };
    return p;
  };
  FMT.M = (t, r, ent, a, b, c) => {               // ? ○ b = c
    const p = head(t, r, ent, a, b, c);
    p.expr = ['?', SYM[ent.op], fm(b), '=', fm(c)]; p.ask = 'missing'; p.speak = ['q_missing'];
    p.sig = p.tid + '|' + a + ',' + b;
    const ex = { add: [c + b, c - b + 10, b], sub: [c - b, b - c > 0 ? b - c : null, a + 10], mul: [c + b, c - b, b], div: [c / b + 1, c * b + 0, b] }[ent.op];
    return mkChoices(r, p, a, dis(r, a, ex, 3, ent.k));
  };
  FMT.N = (t, r, ent, a, b, c) => {               // a ○ ? = c
    const p = head(t, r, ent, a, b, c);
    p.expr = [fm(a), SYM[ent.op], '?', '=', fm(c)]; p.ask = 'missing'; p.speak = ['q_missing'];
    p.sig = p.tid + '|' + a + ',' + b;
    const ex = { add: [c + a, a - c > 0 ? a - c : null, a], sub: [c + a, a + c - 10, a], mul: [c - a, c + a, a], div: [c * a, a - c > 0 ? a - c : null, a] }[ent.op];
    return mkChoices(r, p, b, dis(r, b, ex, 3, ent.k));
  };
  FMT.C = (t, r, ent, a, b, c) => {               // เทียบ a ○ b กับเลขอีกตัว
    const p = head(t, r, ent, a, b, c);
    const mode = r.pick(['<', '>', '=']);
    const delta = Math.max(ent.k ? Math.pow(10, -ent.k) : 1, Math.round(Math.abs(c) * 0.1) || 1) * r.int(1, 3);
    const other = mode === '=' ? c : mode === '<' ? clean(c + delta) : clean(Math.max(0, c - delta));
    const real = c < other ? '<' : c > other ? '>' : '=';
    p.expr = [fm(a), SYM[ent.op], fm(b), '?', fm(other)]; p.ask = 'which'; p.speak = ['q_which'];
    p.sig = p.tid + '|' + a + ',' + b + ',' + other;
    p.exp = eqStr(a, ent.op, b, c) + ' ' + real + ' ' + fm(other);
    p.choices = ['<', '=', '>'].map(s => ({ v: s, label: s, ok: s === real, sym: true }));
    p.answer = real;
    return p;
  };
  FMT.X = (t, r, ent, a, b, c) => {               // หาสมการที่ผิด (บลิ๊บเขียนผิด)
    const p = head(t, r, ent, a, b, c);
    const eqs = [{ a, b, c, ok: true }];
    const gen = ent.gen;
    let guard = 0;
    while (eqs.length < 4 && guard++ < 50) {
      const pr = gen(r); const cc = ent.calc(pr[0], pr[1]);
      if (!eqs.some(e => e.a === pr[0] && e.b === pr[1])) eqs.push({ a: pr[0], b: pr[1], c: cc, ok: true });
    }
    // เลือกข้อผิด 1 ข้อ: ใช้ผลลัพธ์ที่ผิดแบบเด็กพลาดจริง
    const wi = r.int(0, eqs.length - 1);
    const w = eqs[wi];
    const wr = dis(r, w.c, ex1(ent, w.a, w.b, w.c), 2, ent.k)[0];
    w.c = wr; w.ok = false;
    const labs = eqs.map(e => eqStr(e.a, ent.op, e.b, e.c));
    p.ask = 'spot'; p.line = 'd_spot'; p.speak = [];
    p.choices = eqs.map(e => ({ v: e.ok ? 'ok' : 'bad', label: eqStr(e.a, ent.op, e.b, e.c), ok: !e.ok, eq: true }));
    p.answer = labs[wi]; p.expr = null;
    p.sig = p.tid + '|' + eqs.map(e => e.a + ',' + e.b).join(';');
    p.exp = eqStr(w.a, ent.op, w.b, ent.calc(w.a, w.b));
    return p;
  };
  FMT.R = (t, r, ent, a, b, c) => {               // ถามเศษของการหาร
    const p = head(t, r, ent, a, b, c);
    const rem = a % b;
    p.expr = [fm(a), '÷', fm(b), '=', fm(c), 'เศษ', '?']; p.ask = 'missing'; p.speak = NV.expr([plain(a), '÷', plain(b)]).concat(['op_rem']);
    p.sig = p.tid + '|' + a + ',' + b;
    p.exp = a + ' ÷ ' + b + ' = ' + c + ' เศษ ' + rem;
    return mkChoices(r, p, rem, dis(r, rem, [b - 1 > 0 && b - 1 !== rem ? b - 1 : null, rem + 1 < b ? rem + 1 : null, c % 10], 3));
  };

  /* ฉาก: เรื่องเล่าเป็นภาพ (ไม่มีตัวหนังสือยาว) */
  FMT.S = (t, r, ent, a, b, c) => {
    const p = head(t, r, ent, a, b, c);
    const icon = r.pick(ICONS);
    p.sig = p.tid + '|' + a + ',' + b;
    if (ent.op === 'div') {                       // แบ่งของ: เล่นจริงด้วยการแตะเพื่อน
      p.mech = 'share'; p.ask = 'share'; p.line = 'd_share';
      p.scene = { kind: 'share', icon, n: a, k: b };
      p.expr = [fm(a), '÷', fm(b), '=', '?'];
      p.speak = NV.expr([plain(a), '÷', plain(b)]).concat(['q_equals']);
      p.answer = c;
      p.exp = a + ' ÷ ' + b + ' = ' + c;
      return p;
    }
    const kind = ent.op === 'add' ? 'join' : ent.op === 'sub' ? 'take' : 'array';
    p.scene = ent.op === 'mul' ? { kind, icon, rows: a, cols: b } : { kind, icon, a, b };
    p.expr = [fm(a), SYM[ent.op], fm(b), '=', '?'];
    p.speak = NV.expr([plain(a), SYM[ent.op], plain(b)]).concat(['q_equals']);
    const ex = ex1(ent, a, b, c);
    return mkChoices(r, p, c, dis(r, c, ex, 3, ent.k));
  };

  /* กบกระโดดบนเส้นจำนวน (เพิ่ม/ลด/นับข้ามเป็นช่วง) */
  FMT.H = (t, r, ent, a, b, c) => {
    const p = head(t, r, ent, a, b, c);
    p.mech = 'hops'; p.ask = 'hop'; p.line = 'd_hop';
    p.sig = p.tid + '|' + a + ',' + b;
    let ticks, hop;
    if (ent.op === 'mul') {
      const step = b, cnt = a;
      const max = (cnt + r.int(1, 2)) * step;
      ticks = []; for (let v = 0; v <= max; v += step) ticks.push(v);
      hop = { start: 0, size: step, n: cnt, dir: 1 };
      p.expr = [fm(a), '×', fm(b), '=', '?'];
    } else {
      const lo = Math.max(0, Math.min(a, c) - r.int(0, 3)), hi = Math.max(a, c) + r.int(1, 3);
      ticks = []; for (let v = lo; v <= hi; v++) ticks.push(v);
      hop = { start: a, size: 1, n: b, dir: ent.op === 'add' ? 1 : -1 };
      p.expr = [fm(a), SYM[ent.op], fm(b), '=', '?'];
    }
    p.scene = { kind: 'line', ticks, hop };
    p.speak = NV.expr([plain(a), SYM[ent.op], plain(b)]).concat(['q_equals']);
    p.answer = c;
    return p;
  };

  /* ตาชั่ง: เติมน้ำหนักฝั่งขวาให้เท่ากับฝั่งซ้าย */
  FMT.B = (t, r, ent, a, b, c) => {
    const p = head(t, r, ent, a, b, c);
    p.mech = 'balance'; p.ask = 'balance'; p.line = 'd_balance';
    p.sig = p.tid + '|' + a + ',' + b;
    let T, fixed, need;
    if (ent.op === 'add') { T = c; fixed = a; need = b; p.expr = [fm(a), '+', '?', '=', fm(c)]; }
    else { T = a; fixed = c; need = b; p.expr = [fm(a), '−', '?', '=', fm(c)]; }
    const tiles = [need];
    let g2 = 0;
    while (tiles.length < 5 && g2++ < 80) {
      const v = r.int(1, Math.max(2, T - 1));
      if (!tiles.includes(v)) tiles.push(v);
    }
    p.scene = { kind: 'balance', T, fixed, tiles: r.shuffle(tiles), need };
    p.speak = ['q_missing'];
    p.answer = need;
    return p;
  };

  /* จับคู่โจทย์กับคำตอบ 3 คู่ */
  FMT.P = (t, r, ent, a, b, c) => {
    const p = head(t, r, ent, a, b, c);
    const pairs = [{ a, b, c }];
    let guard = 0;
    while (pairs.length < 3 && guard++ < 60) {
      const pr = ent.gen(r), cc = ent.calc(pr[0], pr[1]);
      if (!pairs.some(e => e.c === cc || (e.a === pr[0] && e.b === pr[1]))) pairs.push({ a: pr[0], b: pr[1], c: cc });
    }
    p.mech = 'match'; p.ask = 'match'; p.line = 'd_match';
    p.pairs = pairs.map(e => ({ left: fm(e.a) + ' ' + SYM[ent.op] + ' ' + fm(e.b), right: fm(e.c), l: [plain(e.a), SYM[ent.op], plain(e.b)] }));
    p.sig = p.tid + '|' + pairs.map(e => e.a + ',' + e.b).join(';');
    p.speak = []; p.answer = 'match';
    return p;
  };

  DC.core = { SYM, ICONS, ICON_TH, clean, fm, plain, norm, carries, borrows, pw, calc, dis, base, mkChoices, eqStr, FMT, swapDigits, opId };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
