/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — Fraction math helpers
   เศษส่วนเก็บเป็น { n: ตัวเศษ, d: ตัวส่วน } เสมอ (จำนวนคละแปลงเป็นเศษเกิน)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }
  function lcm(a, b) { return a / gcd(a, b) * b; }

  const F = {
    gcd, lcm,
    of: (n, d) => ({ n, d }),
    mixed: (w, n, d) => ({ n: w * d + n, d }),
    toMixed: f => ({ w: Math.floor(f.n / f.d), n: f.n % f.d, d: f.d }),
    simplify: f => { const g = gcd(f.n, f.d); return { n: f.n / g, d: f.d / g }; },
    cmp: (a, b) => Math.sign(a.n * b.d - b.n * a.d),
    eq: (a, b) => a.n * b.d === b.n * a.d,
    proper: f => f.n < f.d,
    isSimplest: f => gcd(f.n, f.d) === 1,
    value: f => f.n / f.d,

    /* token สำหรับข้อความ: {3/4} = เศษส่วน, {2 1/3} = จำนวนคละ */
    tok(f, asMixed) {
      if (asMixed && f.n >= f.d) {
        const m = F.toMixed(f);
        return m.n === 0 ? String(m.w) : '{' + m.w + ' ' + m.n + '/' + m.d + '}';
      }
      return '{' + f.n + '/' + f.d + '}';
    },

    frHTML(n, d) {
      return '<span class="fr"><span class="fr-n">' + n + '</span><span class="fr-d">' + d + '</span></span>';
    },
    mxHTML(w, n, d) {
      return '<span class="mx"><span class="mx-w">' + w + '</span>' + F.frHTML(n, d) + '</span>';
    },
    html(f, asMixed) {
      if (asMixed && f.n >= f.d) {
        const m = F.toMixed(f);
        return m.n === 0 ? '<span class="num-whole">' + m.w + '</span>' : F.mxHTML(m.w, m.n, m.d);
      }
      return F.frHTML(f.n, f.d);
    },

    /* อ่านตัวเลขเป็นคำไทย (0–99) */
    thai(n) {
      const D = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
      if (n < 10) return D[n];
      const t = Math.floor(n / 10), u = n % 10;
      const tens = t === 1 ? 'สิบ' : t === 2 ? 'ยี่สิบ' : D[t] + 'สิบ';
      return tens + (u === 0 ? '' : u === 1 ? 'เอ็ด' : D[u]);
    },
    readMixed(w, n, d) { return F.thai(w) + 'เศษ' + F.thai(n) + 'ส่วน' + F.thai(d); },

    /* random helpers */
    rand: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };

  window.PP = window.PP || {};
  window.PP.F = F;
})();
