/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — บันได 4 การดำเนินการ (บวก ลบ คูณ หาร) ป.1 → ป.6
   แต่ละขั้น = ช่วงตัวเลข + เงื่อนไข (ทด/ไม่ทด ฯลฯ)  แต่ละขั้นขยายเป็นหลายรูปแบบโจทย์ (D K M N S H B X C P R)
   จำนวนแบบโจทย์ = ขั้น × รูปแบบที่ใช้ได้จริง ตรวจโดย tools/test-gen.js
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const { carries, borrows, pw, calc, clean, FMT } = DC.core;

  const T = DC.T = DC.T || [];
  const Rng = DC.Rng;

  /* ─ ช่วยสุ่ม ─ */
  const ri = (r, a, b) => r.int(a, b);
  const mul10 = (r, lo, hi) => 10 * r.int(lo, hi);
  const sw = (r, a, b) => (r.chance(0.5) ? [a, b] : [b, a]);   // สลับตำแหน่งตัวเลข

  /* ═══ ตาราง: [id, ชั้น, ระดับในชั้น(1-3), ตัวสุ่ม(r)→[a,b], ตัวเลือก] ═══ */
  const ADD = [
    ['s5', 1, 1, r => { const a = ri(r, 1, 4); return [a, ri(r, 1, 5 - a)]; }],
    ['s10', 1, 1, r => { const a = ri(r, 1, 9); return [a, ri(r, 1, 10 - a)]; }],
    ['dbl', 1, 2, r => { const a = ri(r, 1, 10); return [a, a]; }],
    ['ten', 1, 2, r => sw(r, 10, ri(r, 1, 9))],
    ['s20', 1, 3, r => pw(r, () => ri(r, 2, 9), () => ri(r, 2, 9), (a, b) => a + b > 10)],
    ['t2d', 2, 1, r => pw(r, () => mul10(r, 1, 8), () => mul10(r, 1, 8), (a, b) => a + b <= 100)],
    ['z2d1', 2, 1, r => pw(r, () => ri(r, 11, 88), () => ri(r, 1, 9), (a, b) => !carries(a, b))],
    ['c2d1', 2, 2, r => pw(r, () => ri(r, 15, 89), () => ri(r, 2, 9), (a, b) => carries(a, b) && a + b < 100)],
    ['n2d2', 2, 2, r => pw(r, () => ri(r, 11, 87), () => ri(r, 11, 87), (a, b) => !carries(a, b) && a + b < 100)],
    ['c2d2', 2, 3, r => pw(r, () => ri(r, 15, 89), () => ri(r, 15, 89), (a, b) => carries(a, b) && a + b < 100)],
    ['h3', 3, 1, r => pw(r, () => 100 * ri(r, 1, 8), () => 100 * ri(r, 1, 8), (a, b) => a + b <= 1000)],
    ['3d2', 3, 1, r => pw(r, () => ri(r, 101, 899), () => ri(r, 11, 99), (a, b) => a + b < 1000)],
    ['n3d3', 3, 2, r => pw(r, () => ri(r, 101, 888), () => ri(r, 101, 888), (a, b) => !carries(a, b) && a + b < 1000)],
    ['c3d3', 3, 3, r => pw(r, () => ri(r, 105, 899), () => ri(r, 105, 899), (a, b) => carries(a, b) && a + b < 1000)],
    ['4d3', 3, 3, r => pw(r, () => ri(r, 1000, 9000), () => ri(r, 101, 999), (a, b) => a + b < 10000 && carries(a, b))],
    ['4d4', 4, 1, r => pw(r, () => ri(r, 1000, 9999), () => ri(r, 1000, 9999), (a, b) => a + b < 20000)],
    ['5d', 4, 2, r => pw(r, () => ri(r, 10000, 89999), () => ri(r, 1000, 99999), (a, b) => a + b < 100000)],
    ['6d', 4, 3, r => pw(r, () => ri(r, 100000, 899999), () => ri(r, 10000, 99999), (a, b) => a + b < 1000000)],
    ['dec1', 5, 1, r => pw(r, () => clean(ri(r, 11, 99) / 10), () => clean(ri(r, 11, 99) / 10), (a, b) => a % 1 !== 0 && b % 1 !== 0), { k: 1 }],
    ['dec1c', 5, 2, r => pw(r, () => clean(ri(r, 15, 98) / 10), () => clean(ri(r, 15, 98) / 10), (a, b) => a % 1 !== 0 && b % 1 !== 0 && Math.round((a % 1 + b % 1) * 10) >= 10), { k: 1 }],
    ['dec2', 5, 3, r => pw(r, () => clean(ri(r, 101, 999) / 100), () => clean(ri(r, 101, 999) / 100), (a, b) => (Math.round(a * 100) % 10) && (Math.round(b * 100) % 10)), { k: 2 }],
    ['dec3', 6, 1, r => pw(r, () => clean(ri(r, 1001, 9999) / 1000), () => clean(ri(r, 101, 999) / 100), (a, b) => (Math.round(a * 1000) % 10) !== 0), { k: 3 }],
    ['big7', 6, 2, r => pw(r, () => ri(r, 100000, 999999), () => ri(r, 100000, 999999), (a, b) => a + b > 900000)],
    ['mil', 6, 3, r => pw(r, () => ri(r, 1000000, 8999999), () => ri(r, 100000, 999999), (a, b) => a + b < 10000000)]
  ];

  const SUB = [
    ['s5', 1, 1, r => { const a = ri(r, 2, 5); return [a, ri(r, 1, a - 1)]; }],
    ['s10', 1, 1, r => { const a = ri(r, 3, 10); return [a, ri(r, 1, a - 1)]; }],
    ['zero', 1, 1, r => { const a = ri(r, 1, 10); return [a, r.chance(0.5) ? 0 : a]; }],
    ['f10', 1, 2, r => [10, ri(r, 1, 9)]],
    ['s20n', 1, 2, r => pw(r, () => ri(r, 11, 19), () => ri(r, 1, 9), (a, b) => b <= a % 10 && a % 10 > 0)],
    ['s20b', 1, 3, r => pw(r, () => ri(r, 11, 18), () => ri(r, 2, 9), (a, b) => b > a % 10)],
    ['t2d', 2, 1, r => pw(r, () => mul10(r, 3, 10), () => mul10(r, 1, 9), (a, b) => b < a)],
    ['z2d1', 2, 1, r => pw(r, () => ri(r, 21, 99), () => ri(r, 1, 9), (a, b) => b <= a % 10 && b > 0)],
    ['b2d1', 2, 2, r => pw(r, () => ri(r, 21, 99), () => ri(r, 2, 9), (a, b) => b > a % 10)],
    ['n2d2', 2, 2, r => pw(r, () => ri(r, 31, 99), () => ri(r, 11, 88), (a, b) => b < a && !borrows(a, b))],
    ['b2d2', 2, 3, r => pw(r, () => ri(r, 31, 99), () => ri(r, 12, 88), (a, b) => b < a && borrows(a, b))],
    ['f100', 2, 3, r => [100, ri(r, 1, 99)]],
    ['3d2', 3, 1, r => pw(r, () => ri(r, 120, 999), () => ri(r, 11, 99), (a, b) => b < a && !borrows(a, b))],
    ['n3d3', 3, 2, r => pw(r, () => ri(r, 200, 999), () => ri(r, 101, 888), (a, b) => b < a && !borrows(a, b))],
    ['b3d3', 3, 3, r => pw(r, () => ri(r, 200, 999), () => ri(r, 101, 888), (a, b) => b < a && borrows(a, b))],
    ['f1000', 3, 3, r => [1000, ri(r, 1, 999)]],
    ['4d3', 4, 1, r => pw(r, () => ri(r, 1200, 9999), () => ri(r, 101, 999), (a, b) => b < a)],
    ['4d4', 4, 2, r => pw(r, () => ri(r, 2000, 9999), () => ri(r, 1000, 9000), (a, b) => b < a && borrows(a, b))],
    ['5d', 4, 3, r => pw(r, () => ri(r, 20000, 99999), () => ri(r, 1000, 89999), (a, b) => b < a && borrows(a, b))],
    ['dec1', 5, 1, r => pw(r, () => clean(ri(r, 21, 99) / 10), () => clean(ri(r, 11, 80) / 10), (a, b) => b < a && a % 1 !== 0 && b % 1 !== 0), { k: 1 }],
    ['f1', 5, 2, r => [1, clean(ri(r, 11, 99) / 100)].map((v, i) => i ? v : 1), { k: 2 }],
    ['dec2', 5, 3, r => pw(r, () => clean(ri(r, 201, 999) / 100), () => clean(ri(r, 101, 800) / 100), (a, b) => b < a && (Math.round(a * 100) % 10) && (Math.round(b * 100) % 10)), { k: 2 }],
    ['6d', 6, 1, r => pw(r, () => ri(r, 200000, 999999), () => ri(r, 10000, 899999), (a, b) => b < a && borrows(a, b))],
    ['dec3', 6, 2, r => pw(r, () => clean(ri(r, 2001, 9999) / 1000), () => clean(ri(r, 101, 1999) / 1000), (a, b) => b < a && (Math.round(b * 1000) % 10) !== 0), { k: 3 }],
    ['mil', 6, 3, r => pw(r, () => ri(r, 2000000, 9999999), () => ri(r, 100000, 1999999), (a, b) => b < a)]
  ];

  const tbl = n => r => [n, ri(r, 1, 10)];
  const MUL = [
    ['t2', 2, 1, r => sw(r, 2, ri(r, 1, 10))],
    ['t5', 2, 1, r => sw(r, 5, ri(r, 1, 10))],
    ['t10', 2, 1, r => sw(r, 10, ri(r, 1, 10))],
    ['t3', 2, 2, r => sw(r, 3, ri(r, 1, 10))],
    ['t4', 2, 3, r => sw(r, 4, ri(r, 1, 10))],
    ['t6', 3, 1, r => sw(r, 6, ri(r, 2, 10))],
    ['t7', 3, 1, r => sw(r, 7, ri(r, 2, 10))],
    ['t8', 3, 2, r => sw(r, 8, ri(r, 2, 10))],
    ['t9', 3, 2, r => sw(r, 9, ri(r, 2, 10))],
    ['tmix', 3, 3, r => [ri(r, 2, 9), ri(r, 2, 9)]],
    ['t11', 3, 3, r => sw(r, 11, ri(r, 2, 9))],
    ['z2d1', 3, 3, r => pw(r, () => ri(r, 11, 33), () => ri(r, 2, 4), (a, b) => (a % 10) * b < 10 && Math.floor(a / 10) * b < 10)],
    ['x10', 4, 1, r => sw(r, r.pick([10, 100, 1000]), ri(r, 2, 99))],
    ['c2d1', 4, 1, r => [ri(r, 12, 99), ri(r, 2, 9)]],
    ['3d1', 4, 2, r => [ri(r, 101, 999), ri(r, 2, 9)]],
    ['tens', 4, 2, r => [mul10(r, 2, 9), mul10(r, 2, 9)]],
    ['4d1', 4, 3, r => [ri(r, 1001, 9999), ri(r, 2, 9)]],
    ['2d2', 4, 3, r => [ri(r, 11, 99), ri(r, 11, 99)]],
    ['3d2', 5, 1, r => [ri(r, 101, 999), ri(r, 11, 99)]],
    ['hund', 5, 1, r => [100 * ri(r, 2, 9), 10 * ri(r, 2, 9)]],
    ['dec1', 5, 2, r => [clean(ri(r, 1, 9) / 10), ri(r, 2, 9)], { k: 1 }],
    ['dec1b', 5, 2, r => [clean(ri(r, 11, 99) / 10), ri(r, 2, 9)], { k: 1 }],
    ['dec10', 5, 3, r => [clean(ri(r, 11, 99) / 10), r.pick([10, 100])], { k: 2 }],
    ['3d3', 6, 1, r => [ri(r, 101, 999), ri(r, 101, 999)]],
    ['dec2', 6, 2, r => [clean(ri(r, 101, 999) / 100), ri(r, 2, 9)], { k: 2 }],
    ['dd', 6, 3, r => [clean(ri(r, 11, 99) / 10), clean(ri(r, 2, 9) / 10)], { k: 2 }]
  ];

  const dt = n => r => { const q = ri(r, 1, 10); return [n * q, n]; };
  const exact = (r, kLo, kHi, qLo, qHi) => { const k = ri(r, kLo, kHi), q = ri(r, qLo, qHi); return [k * q, k]; };
  const remDiv = (r, kLo, kHi, nLo, nHi) => pw(r, () => ri(r, nLo, nHi), () => ri(r, kLo, kHi), (a, b) => a % b !== 0 && Math.floor(a / b) >= 2);
  const DIV = [
    ['z', 3, 1, r => r.pick([[ri(r, 2, 20), 1], (n => [n, n])(ri(r, 2, 20))])],
    ['t2', 2, 2, dt(2)], ['t5', 2, 3, dt(5)], ['t10', 2, 3, dt(10)],
    ['t3', 3, 1, dt(3)], ['t4', 3, 1, dt(4)], ['t6', 3, 2, dt(6)], ['t7', 3, 2, dt(7)], ['t8', 3, 3, dt(8)], ['t9', 3, 3, dt(9)],
    ['2d1', 4, 1, r => exact(r, 2, 9, 11, 30)],
    ['r1', 4, 1, r => remDiv(r, 2, 9, 11, 99), { rem: true }],
    ['3d1', 4, 2, r => exact(r, 2, 9, 20, 150)],
    ['r3', 4, 3, r => remDiv(r, 3, 9, 101, 999), { rem: true }],
    ['4d1', 5, 1, r => exact(r, 2, 9, 120, 900)],
    ['x10', 5, 1, r => { const k = r.pick([10, 100]); return [k * ri(r, 2, 99), k]; }],
    ['2d2', 5, 2, r => exact(r, 11, 30, 2, 12)],
    ['3d2', 5, 3, r => exact(r, 11, 50, 12, 40)],
    ['r2d2', 5, 3, r => remDiv(r, 11, 30, 101, 999), { rem: true }],
    ['dec', 6, 1, r => { const k = ri(r, 2, 9), q = ri(r, 11, 99); return [clean(k * q / 10), k]; }, { k: 1 }],
    ['dec10', 6, 2, r => [clean(ri(r, 11, 999) / 10), r.pick([10, 100])], { k: 3 }],
    ['dec2', 6, 3, r => { const k = ri(r, 2, 9), q = ri(r, 101, 999); return [clean(k * q / 100), k]; }, { k: 2 }]
  ];

  /* ─ ฟิลเตอร์รูปแบบที่ใช้ได้ ตามสถิติจากตัวอย่าง ─ */
  function stats(ent) {
    const rr = new Rng('probe:' + ent.op + ':' + ent.id);
    const s = { maxA: 0, maxB: 0, maxC: 0, maxQ: 0 };
    for (let i = 0; i < 120; i++) {
      const [a, b] = ent.gen(rr), c = ent.calc(a, b);
      s.maxA = Math.max(s.maxA, a); s.maxB = Math.max(s.maxB, b); s.maxC = Math.max(s.maxC, c);
    }
    return s;
  }
  function allowed(ent, s) {
    if (ent.rem) return ['D', 'K', 'R'];                 // หารมีเศษ: ถามผลหาร (พร้อมเศษ) หรือถามเศษ
    const f = ['D', 'M', 'N', 'X', 'C', 'P'];
    if (s.maxC >= 10 || ent.k) f.push('K');
    if (ent.op === 'add' && s.maxA <= 12 && s.maxB <= 12 && s.maxC <= 24) f.push('S');
    if (ent.op === 'sub' && s.maxA <= 24) f.push('S');
    if (ent.op === 'mul' && s.maxA <= 10 && s.maxB <= 10 && s.maxC <= 60 && !ent.k) f.push('S');
    if (ent.op === 'div' && s.maxA <= 36 && s.maxB <= 6 && !ent.rem && !ent.k) f.push('S');
    if ((ent.op === 'add' || ent.op === 'sub') && s.maxA <= 40 && s.maxB <= 12 && s.maxC <= 40 && !ent.k) f.push('H');
    if (ent.op === 'mul' && s.maxA <= 10 && s.maxB <= 12 && s.maxC <= 120 && !ent.k && s.maxA > 0) f.push('H');
    if ((ent.op === 'add' || ent.op === 'sub') && s.maxA <= 30 && s.maxC <= 30 && !ent.k) f.push('B');
    return f;
  }

  function build(op, list) {
    for (const row of list) {
      const [id, g, d, gen, o] = row; const opt = o || {};
      const ent = { id, op, g, d, gen, k: opt.k || 0, rem: !!opt.rem };
      ent.calc = ent.rem ? ((a, b) => Math.floor(a / b)) : ((a, b) => calc(op, a, b));
      const s = stats(ent);
      for (const F of allowed(ent, s)) {
        const t = { id: op + '.' + id + '.' + F, g, d, op, fmt: F, family: 'ladder', ent };
        t.gen = r => { const [a, b] = ent.gen(r); return FMT[F](t, r, ent, a, b, ent.calc(a, b)); };
        T.push(t);
      }
    }
  }
  build('add', ADD); build('sub', SUB); build('mul', MUL); build('div', DIV);

  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
