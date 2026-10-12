/* ═══════════════════════════════════════════════════════════
   DOTTY GRAND PRIX — Decimal core
   เก็บทศนิยมเป็น "สตริง" เสมอ (0.5 กับ 0.50 ต่างกันทางการเขียน)
   คำนวณค่าเป็นจำนวนเต็มหน่วย "ส่วนพัน" เพื่อเลี่ยงปัญหาเลขทศนิยมของคอมพิวเตอร์
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const DG = window.DG = window.DG || {};

  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uniq(list, key) {
    const seen = {};
    return list.filter(x => { const k = key ? key(x) : x; if (seen[k]) return false; seen[k] = 1; return true; });
  }

  /* ── คำอ่านภาษาไทย ── */
  const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNIT = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  function intThai(n) {
    n = Math.floor(+n);
    if (!n) return 'ศูนย์';
    const s = String(n), L = s.length;
    let out = '';
    for (let i = 0; i < L; i++) {
      const d = +s[i], pos = L - 1 - i;
      if (!d) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && L > 1) out += 'เอ็ด';
      else out += DIG[d] + UNIT[pos];
    }
    return out;
  }

  function parts(s) {
    s = String(s).trim();
    const k = s.indexOf('.');
    if (k < 0) return { i: s || '0', f: '' };
    return { i: s.slice(0, k) || '0', f: s.slice(k + 1) };
  }
  /* ค่าเป็นจำนวน "ส่วนพัน" (ทศนิยมไม่เกิน 3 ตำแหน่ง) */
  function val(s) {
    const p = parts(s);
    return (+p.i) * 1000 + (+((p.f + '000').slice(0, 3)));
  }
  /* แปลงค่า (ส่วนพัน) กลับเป็นสตริง; places = จำนวนตำแหน่งที่ต้องการ (ไม่ใส่ = สั้นที่สุด) */
  function fromVal(v, places) {
    const i = Math.floor(v / 1000);
    const f = String(v % 1000).padStart(3, '0');
    const fp = places == null ? f.replace(/0+$/, '') : f.slice(0, places);
    return fp ? i + '.' + fp : String(i);
  }
  const places = s => parts(s).f.length;
  const shortest = s => fromVal(val(s));

  /* อ่านทศนิยม: ส่วนจำนวนเต็มอ่านแบบจำนวนนับ หลังจุดอ่านทีละตัว */
  function read(s) {
    const p = parts(s);
    let r = intThai(+p.i);
    if (p.f) r += 'จุด' + p.f.split('').map(d => DIG[+d]).join('');
    return r;
  }
  /* คำอ่านผิดที่เด็กพบบ่อย: อ่านหลังจุดเป็นจำนวนนับ (0.25 → ศูนย์จุดยี่สิบห้า) */
  function misread(s) {
    const p = parts(s);
    if (p.f.length < 2) return null;
    return intThai(+p.i) + 'จุด' + intThai(+p.f);
  }
  /* คำอ่านผิดแบบตกเลขศูนย์ (3.05 → สามจุดห้า) */
  function dropZeroRead(s) {
    const p = parts(s);
    if (p.f.indexOf('0') < 0) return null;
    const f = p.f.replace(/0/g, '');
    if (!f) return null;
    return intThai(+p.i) + 'จุด' + f.split('').map(d => DIG[+d]).join('');
  }

  /* ── หลักและค่าประจำหลัก ── */
  const PLACE = {
    hun: { name: 'หลักร้อย', short: 'ร้อย', value: '100' },
    ten: { name: 'หลักสิบ', short: 'สิบ', value: '10' },
    one: { name: 'หลักหน่วย', short: 'หน่วย', value: '1' },
    t1: { name: 'หลักส่วนสิบ', short: 'ส่วนสิบ', value: '0.1', piece: 'แถว' },
    t2: { name: 'หลักส่วนร้อย', short: 'ส่วนร้อย', value: '0.01', piece: 'ช่อง' },
    t3: { name: 'หลักส่วนพัน', short: 'ส่วนพัน', value: '0.001', piece: 'ชิ้นจิ๋ว' }
  };
  const ORDER = ['hun', 'ten', 'one', 't1', 't2', 't3'];

  /* [{k, d}] เรียงจากซ้ายไปขวา */
  function digits(s) {
    const p = parts(s);
    const ip = String(+p.i).split('');
    const ik = ORDER.slice(3 - ip.length, 3);
    const out = ip.map((d, i) => ({ k: ik[i], d }));
    p.f.split('').forEach((d, i) => out.push({ k: ['t1', 't2', 't3'][i], d }));
    return out;
  }
  function digitAt(s, k) {
    const x = digits(s).find(o => o.k === k);
    return x ? x.d : null;
  }
  /* ค่าของเลขโดด d ในหลัก k */
  function digitValue(d, k) {
    d = String(d);
    switch (k) {
      case 'hun': return d === '0' ? '0' : d + '00';
      case 'ten': return d === '0' ? '0' : d + '0';
      case 'one': return d;
      case 't1': return '0.' + d;
      case 't2': return '0.0' + d;
      case 't3': return '0.00' + d;
    }
    return d;
  }
  /* รูปกระจาย (ข้ามหลักที่เป็น 0) */
  function expanded(s) {
    const list = digits(s).filter(x => x.d !== '0').map(x => digitValue(x.d, x.k));
    return list.length ? list : ['0'];
  }
  const cmp = (a, b) => Math.sign(val(a) - val(b));
  const sym = c => c > 0 ? '>' : c < 0 ? '<' : '=';
  const relWord = c => c > 0 ? 'มากกว่า' : c < 0 ? 'น้อยกว่า' : 'เท่ากับ';

  /* สุ่มทศนิยม pl ตำแหน่ง (ตัวสุดท้ายไม่เป็น 0) จำนวนเต็ม iMin..iMax */
  function randDec(pl, iMin, iMax, opt) {
    opt = opt || {};
    const i = R(iMin, iMax);
    let f = '';
    for (let k = 0; k < pl; k++) {
      let d = R(opt.noZero ? 1 : 0, 9);
      if (k === pl - 1 && d === 0) d = R(1, 9);
      f += d;
    }
    if (opt.zeroMid && pl >= 2) {
      const pos = R(0, pl - 2);
      f = f.slice(0, pos) + '0' + f.slice(pos + 1);
    }
    return pl ? i + '.' + f : String(i);
  }
  /* สุ่มทศนิยมที่เลขโดดไม่ซ้ำกัน (ใช้กับโจทย์ "เลข x มีค่าเท่าไร") */
  function randDistinct(pl, iMin, iMax, opt) {
    opt = opt || {};
    for (let t = 0; t < 200; t++) {
      const s = randDec(pl, iMin, iMax, opt);
      const ds = digits(s).map(x => x.d);
      const nz = ds.filter(d => d !== '0');
      if (new Set(nz).size === nz.length && (opt.zeroMid || ds.indexOf('0') < 0)) return s;
    }
    return randDec(pl, iMin, iMax, opt);
  }

  /* ── HTML ตัวเลข: จุดทศนิยมเป็นจุดกลมใหญ่ / ระบายสีตามหลักได้ ── */
  function html(s, o) {
    o = o || {};
    const ds = digits(s);
    const hasF = String(s).indexOf('.') >= 0;
    let h = '<span class="num' + (o.color ? ' colored' : '') + (o.cls ? ' ' + o.cls : '') + '">';
    ds.forEach((x, i) => {
      if (hasF && x.k === 't1') h += '<i class="dp"></i>';
      const mark = o.mark && o.mark.indexOf(x.k) >= 0 ? ' mark' : '';
      h += '<i class="dg k-' + x.k + mark + '" data-k="' + x.k + '">' + x.d + '</i>';
    });
    if (hasF && !ds.some(x => x.k === 't1')) h += '<i class="dp"></i>';
    return h + '</span>';
  }
  /* แปลงตัวเลขในข้อความให้เป็นคำอ่านไทย (ใช้ก่อนส่งให้เสียงพูด) */
  function speakify(text) {
    return String(text).replace(/\d+\.\d+|\d+/g, m => read(m));
  }

  DG.D = {
    R, pick, shuffle, uniq,
    intThai, parts, val, fromVal, places, shortest, read, misread, dropZeroRead,
    PLACE, ORDER, digits, digitAt, digitValue, expanded, cmp, sym, relWord,
    randDec, randDistinct, html, speakify
  };
})();
