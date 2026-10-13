/* ═══════════════════════════════════════════════════════════
   CUCKOO CLOCK TOWER — Time core
   - คำอ่านไทยที่ถูกต้อง (ตัวเลข / เวลานาฬิกา / ระยะเวลา)
   - หน่วยเวลา + ความสัมพันธ์ระหว่างหน่วย
   - ตัวสร้างโจทย์ (ข้อมูลล้วน ไม่แตะ DOM) ทดสอบด้วย Node ได้
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const CT = G.CT = G.CT || {};

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
  const sgn = x => x > 0 ? 1 : x < 0 ? -1 : 0;

  /* ═════════ คำอ่านภาษาไทย ═════════ */
  const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNIT = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  function body(n, afterMillion) {
    const s = String(n), L = s.length;
    let out = '';
    for (let i = 0; i < L; i++) {
      const d = +s[i], pos = L - 1 - i;
      if (!d) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && (L > 1 || afterMillion)) out += 'เอ็ด';
      else out += DIG[d] + UNIT[pos];
    }
    return out;
  }
  function intThai(n) {
    n = Math.floor(Math.abs(+n));
    if (!n) return 'ศูนย์';
    if (n >= 1000000) {
      const hi = Math.floor(n / 1000000), lo = n % 1000000;
      return intThai(hi) + 'ล้าน' + (lo ? body(lo, true) : '');
    }
    return body(n, false);
  }
  const pad = n => String(n).padStart(2, '0');
  const num = n => n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(n);

  /* ═════════ เวลานาฬิกา (นาทีนับจากเที่ยงคืน) ═════════ */
  const hmOf = t => ({ h: Math.floor(t / 60), m: t % 60 });
  const fmtT = t => pad(Math.floor(t / 60)) + '.' + pad(t % 60);          /* 09.30 */
  const fmtTN = t => fmtT(t) + ' น.';                                    /* 09.30 น. */
  function clockRead(h, m) { return intThai(h) + 'นาฬิกา' + (m ? intThai(m) + 'นาที' : ''); }
  const readT = t => clockRead(Math.floor(t / 60), t % 60);

  /* ═════════ หน่วยเวลา ═════════ */
  const UNITS = {
    sec: { name: 'วินาที', col: '#ff5fa2' },
    min: { name: 'นาที', col: '#ff9a1f' },
    hr: { name: 'ชั่วโมง', col: '#14b8a6' },
    day: { name: 'วัน', col: '#3ba8ff' },
    wk: { name: 'สัปดาห์', col: '#7c5cff' },
    mo: { name: 'เดือน', col: '#2fbf71' },
    yr: { name: 'ปี', col: '#ff5a4e' }
  };
  const SECS = { sec: 1, min: 60, hr: 3600, day: 86400, wk: 604800 };
  const MOS = { mo: 1, yr: 12 };
  const kindOf = u => (u === 'mo' || u === 'yr') ? 'mo' : 'sec';
  /* ค่ารวมเป็นหน่วยฐาน (วินาที หรือ เดือน) — เทียบกันได้เฉพาะชนิดเดียวกัน */
  function inBase(parts) {
    return parts.reduce((a, p) => a + p.n * (kindOf(p.u) === 'mo' ? MOS[p.u] : SECS[p.u]), 0);
  }
  const clean = parts => parts.filter(p => p.n > 0);
  function durText(parts) {
    const ps = clean(parts);
    if (!ps.length) return '0 ' + UNITS[parts[parts.length - 1].u].name;
    return ps.map(p => num(p.n) + ' ' + UNITS[p.u].name).join(' ');
  }
  /* นาที → [{hr},{min}] */
  function minParts(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return h ? (m ? [{ u: 'hr', n: h }, { u: 'min', n: m }] : [{ u: 'hr', n: h }]) : [{ u: 'min', n: m }];
  }
  const minText = mins => durText(minParts(mins));

  /* ความสัมพันธ์ระหว่างหน่วยที่ติดกัน */
  const PAIRS = {
    'min:sec': { big: 'min', small: 'sec', f: 60 },
    'hr:min': { big: 'hr', small: 'min', f: 60 },
    'day:hr': { big: 'day', small: 'hr', f: 24 },
    'wk:day': { big: 'wk', small: 'day', f: 7 },
    'yr:mo': { big: 'yr', small: 'mo', f: 12 }
  };

  /* ═════════ เดือน/วัน ═════════ */
  const MONTHS = [
    { n: 'มกราคม', d: 31 }, { n: 'กุมภาพันธ์', d: 28 }, { n: 'มีนาคม', d: 31 }, { n: 'เมษายน', d: 30 },
    { n: 'พฤษภาคม', d: 31 }, { n: 'มิถุนายน', d: 30 }, { n: 'กรกฎาคม', d: 31 }, { n: 'สิงหาคม', d: 31 },
    { n: 'กันยายน', d: 30 }, { n: 'ตุลาคม', d: 31 }, { n: 'พฤศจิกายน', d: 30 }, { n: 'ธันวาคม', d: 31 }
  ];
  const DOW = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const DOW_S = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  /* แปลงข้อความให้เสียงอ่านออกเสียงถูกต้อง (ตัวเลข / เวลานาฬิกา) */
  function speakify(text) {
    return String(text)
      .replace(/(\d{1,2})\.(\d{2})\s*น\./g, (m, h, mi) => ' ' + clockRead(+h, +mi) + ' ')
      .replace(/\d{1,3}(?:,\d{3})+/g, m => intThai(+m.replace(/,/g, '')))
      .replace(/(\d+)\.(\d+)/g, (m, a, b) => intThai(+a) + 'จุด' + b.split('').map(d => DIG[+d]).join(''))
      .replace(/\d+/g, m => intThai(+m));
  }

  /* ═════════════════════════════════════════════════════════
     ตัวสร้างโจทย์ (ข้อมูลล้วน)
     ═════════════════════════════════════════════════════════ */

  /* ── 1) เปลี่ยนหน่วย ── */
  function genConvert(level, keys) {
    const pr = PAIRS[pick(keys)];
    const f = pr.f, B = pr.big, S = pr.small;
    if (level <= 1) {
      const n = R(1, f === 60 ? 4 : f === 24 ? 3 : 5);
      return Math.random() < 0.72
        ? { pair: pr, from: [{ u: B, n }], to: [S], ans: [n * f] }
        : { pair: pr, from: [{ u: S, n: n * f }], to: [B], ans: [n] };
    }
    if (level === 2) {
      const n = R(2, f === 60 ? 9 : f === 24 ? 7 : 12);
      return Math.random() < 0.5
        ? { pair: pr, from: [{ u: B, n }], to: [S], ans: [n * f] }
        : { pair: pr, from: [{ u: S, n: n * f }], to: [B], ans: [n] };
    }
    const big = R(1, f === 60 ? 4 : f === 24 ? 3 : f === 7 ? 4 : 3);
    const rem = f === 60 ? R(1, 11) * 5 : R(1, f - 1);
    const total = big * f + rem;
    return Math.random() < 0.5
      ? { pair: pr, from: [{ u: B, n: big }, { u: S, n: rem }], to: [S], ans: [total] }
      : { pair: pr, from: [{ u: S, n: total }], to: [B, S], ans: [big, rem] };
  }

  /* ── 2) ระยะเวลาจากเวลาเริ่ม–เวลาจบ ── */
  function genSpan(level) {
    let start, dur, mode = 'dur';
    if (level <= 1) {
      start = R(7, 15) * 60 + pick([0, 30]);
      dur = R(1, 8) * 15 + (Math.random() < 0.4 ? 30 : 0);
    } else if (level === 2) {
      start = R(7, 15) * 60 + R(0, 11) * 5;
      dur = R(4, 36) * 5;
      mode = pick(['dur', 'dur', 'end']);
    } else {
      start = R(7, 16) * 60 + R(1, 59);
      dur = R(10, 230);
      mode = pick(['dur', 'end', 'start']);
    }
    const end = start + dur;
    if (end > 23 * 60 + 30 || (mode === 'start' && start - 0 < 6 * 60)) return genSpan(level);
    const ans = mode === 'dur' ? [Math.floor(dur / 60), dur % 60] : mode === 'end' ? [Math.floor(end / 60), end % 60] : [Math.floor(start / 60), start % 60];
    return { mode, start, end, dur, ans };
  }

  /* ── 3) เปรียบเทียบระยะเวลา ── */
  const mk = (u, n) => ({ u, n });
  function genCompare(level) {
    for (let tries = 0; tries < 80; tries++) {
      let a, b;
      const flip = Math.random() < 0.5;
      const side = (big, small) => flip ? [small, big] : [big, small];
      if (level <= 1) {
        const pr = pick([PAIRS['min:sec'], PAIRS['hr:min']]);
        const n = R(1, pr.big === 'min' ? 4 : 3);
        const d = Math.random() < 0.15 ? 0 : pick([-1, 1]) * pick([10, 15, 20, 30, 40]);
        [a, b] = side([mk(pr.big, n)], [mk(pr.small, n * pr.f + d)]);
      } else if (level === 2) {
        const t = pick(['ds', 'dh', 'wd', 'ym', 'trap']);
        if (t === 'trap') {
          const n = R(2, 3), s = n * 60 + pick([-1, 1]) * pick([10, 20, 30]);
          [a, b] = side([mk('min', n)], [mk('sec', s)]);
        } else {
          const pr = t === 'dh' ? PAIRS['day:hr'] : t === 'wd' ? PAIRS['wk:day'] : t === 'ym' ? PAIRS['yr:mo'] : pick([PAIRS['min:sec'], PAIRS['hr:min']]);
          const n = R(1, pr.f === 12 ? 3 : 4);
          const mag = pr.f === 24 ? [2, 3, 6, 12] : pr.f === 7 ? [1, 2, 3] : pr.f === 12 ? [1, 2, 3, 5] : [10, 20, 30, 45];
          const d = Math.random() < 0.22 ? 0 : pick([-1, 1]) * pick(mag);
          [a, b] = side([mk(pr.big, n)], [mk(pr.small, n * pr.f + d)]);
        }
      } else {
        const pr = pick(Object.values(PAIRS));
        const nb = R(1, pr.f === 12 ? 3 : 4);
        const rem = pr.f === 60 ? R(1, 11) * 5 : R(1, pr.f - 1);
        const total = nb * pr.f + rem;
        const delta = Math.random() < 0.22 ? 0 : pick([-1, 1]) * pick(pr.f === 60 ? [5, 10, 15, 20] : pr.f === 24 ? [1, 2, 6] : pr.f === 7 ? [1, 2] : [1, 2, 3]);
        const kind = pick(['cs', 'cs', 'cc']);
        if (kind === 'cs') {
          [a, b] = side([mk(pr.big, nb), mk(pr.small, rem)], [mk(pr.small, total + delta)]);
        } else {
          const t2 = total + delta;
          const nb2 = Math.floor(t2 / pr.f), r2 = t2 % pr.f;
          if (!nb2) continue;
          [a, b] = side([mk(pr.big, nb), mk(pr.small, rem)], [mk(pr.big, nb2), mk(pr.small, r2)]);
        }
      }
      if (clean(a).length === 0 || clean(b).length === 0) continue;
      if (durText(a) === durText(b)) continue;
      if (kindOf(a[0].u) !== kindOf(b[0].u)) continue;
      const c = sgn(inBase(a) - inBase(b));
      const bigNumLeft = Math.max(...a.map(p => p.n)), bigNumRight = Math.max(...b.map(p => p.n));
      const trap = c !== 0 && sgn(bigNumLeft - bigNumRight) === -c;      /* ตัวเลขมากกว่า แต่เวลาน้อยกว่า */
      return { a, b, c, trap };
    }
    return { a: [mk('min', 2)], b: [mk('sec', 100)], c: 1, trap: true };
  }

  /* ── 4) เรียงลำดับระยะเวลา ── */
  function exprForm(pr, v, allowMixed) {
    const f = pr.f;
    const forms = [[mk(pr.small, v)]];
    if (v % f === 0) forms.push([mk(pr.big, v / f)]);
    else if (v > f && allowMixed) forms.push([mk(pr.big, Math.floor(v / f)), mk(pr.small, v % f)]);
    return pick(forms);
  }
  function genOrder(level) {
    for (let tries = 0; tries < 60; tries++) {
      const pr = level <= 1 ? pick([PAIRS['min:sec'], PAIRS['hr:min']]) : pick(Object.values(PAIRS));
      const k = level <= 1 ? 3 : level === 2 ? 4 : pick([4, 5]);
      const f = pr.f;
      const vals = [];
      let guard = 0;
      while (vals.length < k && guard++ < 200) {
        const v = level <= 1 ? (pr.f === 60 ? R(3, 18) * 10 : R(2, 9) * 10) : R(f > 12 ? 20 : 5, f * (level === 2 ? 3 : 4));
        if (vals.some(x => Math.abs(x - v) < Math.max(2, f / 10))) continue;
        vals.push(v);
      }
      if (vals.length < k) continue;
      const cards = vals.map(v => ({ parts: exprForm(pr, v, level >= 2), base: v * (kindOf(pr.small) === 'mo' ? MOS[pr.small] : SECS[pr.small]) }));
      const txt = cards.map(c => durText(c.parts));
      if (uniq(txt).length < cards.length) continue;
      /* ต้องมีตัวลวง: ตัวเลขมากสุดไม่ใช่ระยะเวลานานสุด */
      const byNum = cards.slice().sort((x, y) => Math.max(...y.parts.map(p => p.n)) - Math.max(...x.parts.map(p => p.n)));
      const byDur = cards.slice().sort((x, y) => y.base - x.base);
      if (level >= 2 && byNum[0] === byDur[0]) continue;
      return { cards: cards.map((c, i) => Object.assign({ id: 'c' + i }, c)) };
    }
    return { cards: [{ id: 'c0', parts: [mk('sec', 90)], base: 90 }, { id: 'c1', parts: [mk('min', 2)], base: 120 }, { id: 'c2', parts: [mk('sec', 45)], base: 45 }] };
  }

  /* ── 5) ป้ายที่เท่ากัน ── */
  function genEq(level) {
    for (let tries = 0; tries < 60; tries++) {
      const pr = pick(level <= 1 ? [PAIRS['min:sec'], PAIRS['hr:min']] : Object.values(PAIRS));
      const f = pr.f;
      const k = R(1, f === 12 ? 3 : 4);
      const r = level <= 1 ? 0 : (f === 60 ? R(1, 11) * 5 : R(1, f - 1));
      const T = k * f + r;
      const good = [];
      good.push([mk(pr.small, T)]);
      if (r === 0) good.push([mk(pr.big, k)]); else good.push([mk(pr.big, k), mk(pr.small, r)]);
      if (level >= 3 && k >= 2) good.push([mk(pr.big, k - 1), mk(pr.small, r + f)]);
      const bad = [];
      bad.push([mk(pr.small, T + pick([-1, 1]) * (f === 60 ? 10 : f === 24 ? 2 : 1))]);
      bad.push(r === 0 ? [mk(pr.big, k + 1)] : [mk(pr.big, k), mk(pr.small, Math.min(f - 1, r + (f === 60 ? 10 : 1)) === r ? r - 1 : Math.min(f - 1, r + (f === 60 ? 10 : 1)))]);
      bad.push([mk(pr.small, k * (f === 60 ? 100 : f === 24 ? 20 : f === 7 ? 10 : 10) + r)]);   /* ตัวลวง: ใช้ตัวคูณผิด */
      const pool = good.slice(0, level <= 1 ? 2 : 3).map(p => ({ parts: p, ok: true })).concat(bad.slice(0, level <= 1 ? 2 : 3).map(p => ({ parts: p, ok: false })));
      const txt = pool.map(c => durText(c.parts));
      if (uniq(txt).length < pool.length) continue;
      if (pool.some(c => c.parts.some(p => p.n <= 0 || p.n > 9999))) continue;
      if (pool.some(c => (inBase(c.parts) === inBase(good[0])) !== c.ok)) continue;
      return { target: good[0], pair: pr, cards: shuffle(pool).map((c, i) => Object.assign({ id: 'e' + i }, c)) };
    }
    return null;
  }

  /* ── 6) ปฏิทิน ── */
  function genCal(level) {
    const pool = MONTHS.filter(m => m.n !== 'กุมภาพันธ์');
    const mo = pick(pool);
    const dow0 = R(0, 6);                 /* วันที่ 1 ตรงกับวัน (0 = อาทิตย์) */
    const days = mo.d;
    let step, dir = 1, kind;
    if (level <= 1) { step = 7 * R(1, 2); kind = 'week'; }
    else if (level === 2) { step = pick([3, 4, 5, 6, 8, 9, 10, 11]); kind = 'days'; }
    else { step = pick([10, 12, 13, 15, 16, 17, 18, 19, 20]); kind = pick(['days', 'days', 'back']); }
    if (kind === 'back') dir = -1;
    let today;
    if (dir > 0) today = R(1, Math.max(1, days - step));
    else today = R(step + 1, days);
    const target = today + dir * step;
    if (target < 1 || target > days) return genCal(level);
    return { mo, dow0, days, today, step, dir, kind, target, dowT: DOW[(dow0 + target - 1) % 7] };
  }

  /* ── 7) ตารางเวลา ── */
  const THEMES = [
    { id: 'train', noun: 'รถไฟ', unit: 'ขบวน', from: 'สถานีหอนาฬิกา', to: 'สถานีทุ่งเฟือง', ic: 'train' },
    { id: 'bus', noun: 'รถบัส', unit: 'เที่ยว', from: 'ท่ารถตลาดเวลา', to: 'สวนสนุกต๊อกแต๊ก', ic: 'train' },
    { id: 'boat', noun: 'เรือ', unit: 'เที่ยว', from: 'ท่าเรือนาฬิกาทราย', to: 'เกาะเฟืองทอง', ic: 'train' }
  ];
  function genTable(level, themeId) {
    const th = themeId ? THEMES.find(t => t.id === themeId) : pick(THEMES);
    const n = level <= 1 ? 3 : level === 2 ? 4 : 5;
    for (let tries = 0; tries < 60; tries++) {
      let t = level <= 1 ? R(7, 10) * 60 + pick([0, 30]) : level === 2 ? R(7, 12) * 60 + R(0, 11) * 5 : R(7, 15) * 60 + R(1, 59);
      const rows = [];
      let ok = true;
      for (let i = 0; i < n; i++) {
        const gap = level <= 1 ? pick([30, 60, 90]) : level === 2 ? R(4, 14) * 5 : R(25, 95);
        if (i) t += gap;
        const dur = level <= 1 ? pick([30, 60, 90, 120]) : level === 2 ? R(5, 24) * 5 : R(25, 150);
        rows.push({ no: i + 1, dep: t, arr: t + dur, dur });
      }
      if (rows[n - 1].arr > 23 * 60) ok = false;
      if (uniq(rows.map(r => r.dur)).length < n) ok = false;           /* ระยะเวลาไม่ซ้ำกัน */
      if (ok) return { theme: th, rows, level };
    }
    return genTable(level, themeId);
  }
  /* คำถามจากตาราง */
  function tableQuestion(tb, kind) {
    const rows = tb.rows, lv = tb.level;
    if (kind === 'read') {
      const r = pick(rows), col = pick(['dep', 'arr']);
      return { kind, row: r.no, col, ans: [Math.floor(r[col] / 60), r[col] % 60] };
    }
    if (kind === 'dur') {
      const r = pick(rows);
      return { kind, row: r.no, ans: [Math.floor(r.dur / 60), r.dur % 60] };
    }
    if (kind === 'next') {                        /* ไปถึงสถานีเวลา t0 ขึ้นขบวนแรกที่ออกหลังจากนั้น */
      const i = R(0, rows.length - 2);
      const gapBefore = rows[i].dep - (i ? rows[i - 1].dep : rows[i].dep - 60);
      const back = Math.min(gapBefore - 1, lv <= 1 ? 15 : R(3, 18));
      if (back < 3) return null;
      const t0 = rows[i].dep - (lv <= 1 ? Math.min(back, 15) : back);
      const t0f = lv <= 1 ? rows[i].dep - 15 : t0;
      if (i && t0f <= rows[i - 1].dep) return null;
      const wait = rows[i].dep - t0f;
      return { kind, t0: t0f, row: rows[i].no, wait };
    }
    if (kind === 'before') {                      /* ขบวนไหนถึงก่อนเวลา D */
      const eq = lv >= 2 && Math.random() < 0.6 ? pick(rows) : null;
      const sorted = rows.slice().sort((a, b) => a.arr - b.arr);
      let D;
      if (eq) D = eq.arr;
      else D = Math.floor((sorted[1].arr + sorted[2 % sorted.length].arr) / 2 / 5) * 5 + 5;
      const good = rows.filter(r => r.arr < D).map(r => r.no);
      if (!good.length || good.length === rows.length) return null;
      return { kind, D, good, equalTrap: !!eq };
    }
    if (kind === 'fastest' || kind === 'slowest') {
      const s = rows.slice().sort((a, b) => a.dur - b.dur);
      const r = kind === 'fastest' ? s[0] : s[s.length - 1];
      return { kind, row: r.no };
    }
    return null;
  }

  /* ── 8) จัดตารางกิจกรรมให้พอดีเวลา ── */
  const ACTS = ['ชมโชว์นกกุ๊กกู๊', 'ขี่รถไฟจิ๋ว', 'พายเรือเฟือง', 'ปั่นจักรยานน้ำ', 'ทำขนมนาฬิกา', 'ชมพิพิธภัณฑ์ทรายเวลา', 'ปีนหอคอยเล็ก', 'ระบายสีนาฬิกา'];
  function genPlan(level) {
    for (let tries = 0; tries < 200; tries++) {
      const start = pick([9 * 60, 9 * 60 + 30, 10 * 60, 13 * 60]);
      const step = level <= 1 ? 15 : 5;
      const pool = level <= 1 ? [15, 30, 45, 60, 75, 90] : [20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90];
      const sol = shuffle(pool).slice(0, 3);
      const target = sol[0] + sol[1] + sol[2];
      if (level <= 1 && (target < 90 || target > 150)) continue;
      if (target % step !== 0 || target > 240) continue;
      const rest = shuffle(pool.filter(x => sol.indexOf(x) < 0)).slice(0, level <= 1 ? 1 : 2);
      const durs = shuffle(sol.concat(rest));
      const names = shuffle(ACTS).slice(0, durs.length);
      const cards = durs.map((d, i) => ({ id: 'p' + i, name: names[i], dur: d }));
      /* หาคำตอบที่ตรงทุกชุด */
      const sols = [];
      const m = cards.length;
      for (let mask = 1; mask < (1 << m); mask++) {
        let s = 0; for (let i = 0; i < m; i++) if (mask & (1 << i)) s += cards[i].dur;
        if (s === target) sols.push(cards.filter((c, i) => mask & (1 << i)).map(c => c.id));
      }
      if (!sols.length) continue;
      return { start, target, end: start + target, cards, sols };
    }
    return null;
  }

  /* ── ใช้ซ้ำ: เรื่องราวหาเวลาจบ/เวลาเริ่มต้น ── */
  const EVENTS = ['การแสดงละครเวที', 'การแข่งขันต่อบล็อก', 'การประกวดร้องเพลง', 'ภาพยนตร์การ์ตูน', 'กิจกรรมวาดภาพ', 'การแสดงมายากล'];
  function genEndStory(level) {
    const start = level <= 1 ? R(9, 15) * 60 + pick([0, 30]) : R(9, 16) * 60 + R(0, 11) * 5;
    const dur = level <= 1 ? pick([60, 90, 120, 150]) : R(5, 30) * 5 + (level >= 3 ? R(0, 4) : 0);
    return { name: pick(EVENTS), start, dur, end: start + dur };
  }
  function genBackward(level) {
    const a = level <= 1 ? pick([20, 30, 40]) : R(4, 10) * 5;
    const b = level <= 1 ? pick([20, 30]) : R(3, 9) * 5;
    const D = R(8, 15) * 60 + (level <= 1 ? pick([0, 30]) : R(0, 11) * 5);
    return { a, b, D, start: D - a - b };
  }
  function genDiffStory() {
    for (let i = 0; i < 50; i++) {
      const h = R(1, 2), m = R(5, 50);
      const mins = h * 60 + m;
      const other = mins + pick([-1, 1]) * R(3, 20);
      if (other === mins || other < 20) continue;
      /* ผู้เล่น A เขียนเป็นชั่วโมงนาที, B เขียนเป็นนาทีล้วน */
      return { a: mins, b: other, longer: mins > other ? 'a' : 'b', diff: Math.abs(mins - other) };
    }
  }

  /* ── ธนาคารกิจกรรมเลือกหน่วย (set = ตัวเลือกหน่วยที่แสดง 3 ปุ่ม) ── */
  const SET_HMS = ['sec', 'min', 'hr'], SET_DWM = ['day', 'wk', 'mo'], SET_WMY = ['wk', 'mo', 'yr'];
  const UNIT_ACTS = {
    hms: [
      { t: 'กระพริบตา 1 ครั้ง', n: 1, u: 'sec', set: SET_HMS }, { t: 'ปรบมือ 5 ครั้ง', n: 5, u: 'sec', set: SET_HMS },
      { t: 'กดกริ่งประตูบ้าน 1 ครั้ง', n: 1, u: 'sec', set: SET_HMS },
      { t: 'แปรงฟัน', n: 2, u: 'min', set: SET_HMS }, { t: 'เดินจากห้องเรียนไปโรงอาหาร', n: 3, u: 'min', set: SET_HMS },
      { t: 'อาบน้ำ', n: 10, u: 'min', set: SET_HMS }, { t: 'ร้องเพลงชาติไทย', n: 1, u: 'min', set: SET_HMS },
      { t: 'ดูภาพยนตร์การ์ตูน 1 เรื่อง', n: 2, u: 'hr', set: SET_HMS }, { t: 'นอนหลับตอนกลางคืน', n: 9, u: 'hr', set: SET_HMS },
      { t: 'นั่งรถไปเที่ยวต่างจังหวัด', n: 3, u: 'hr', set: SET_HMS }
    ],
    dwmy: [
      { t: 'พักรักษาไข้หวัดจนหาย', n: 3, u: 'day', set: SET_DWM }, { t: 'ถั่วงอกงอกจากเมล็ด', n: 3, u: 'day', set: SET_DWM },
      { t: 'อ่านหนังสือเล่มบางจนจบ', n: 5, u: 'day', set: SET_DWM },
      { t: 'ลูกเจี๊ยบฟักออกจากไข่', n: 3, u: 'wk', set: SET_DWM }, { t: 'พักฟื้นหลังกระดูกแขนหัก', n: 6, u: 'wk', set: SET_DWM },
      { t: 'ปิดเทอมใหญ่', n: 2, u: 'mo', set: SET_WMY }, { t: 'ข้าวในนาโตจนเก็บเกี่ยวได้', n: 4, u: 'mo', set: SET_WMY },
      { t: 'ลูกแมวโตเต็มวัย', n: 1, u: 'yr', set: SET_WMY }, { t: 'เรียนระดับชั้นประถมศึกษา', n: 6, u: 'yr', set: SET_WMY },
      { t: 'ต้นมะม่วงที่ปลูกจากเมล็ดโตจนออกผล', n: 4, u: 'yr', set: SET_WMY }
    ]
  };

  /* ── คำพูดของเจ้าเฟืองซน (ความเข้าใจผิดที่พบบ่อย) ── */
  const CLAIMS = {
    hms: [
      { t: '1 นาที มี 100 วินาที', f: '{min:1} = {sec:60}', ok: false, why: '1 นาที มี 60 วินาที ไม่ใช่ 100' },
      { t: '1 ชั่วโมง มี 100 นาที', f: '{hr:1} = {min:60}', ok: false, why: '1 ชั่วโมง มี 60 นาที ไม่ใช่ 100' },
      { t: '1 ชั่วโมง เท่ากับ 60 นาที', f: '{hr:1} = {min:60}', ok: true, why: 'ใช่ 1 ชั่วโมง = 60 นาที' },
      { t: '2 นาที เท่ากับ 120 วินาที', f: '{min:1} = {sec:60}', ok: true, why: '2 นาที = 60 + 60 = 120 วินาที' },
      { t: '90 วินาที เท่ากับ 1 นาที 30 วินาที', f: '{min:1} = {sec:60}', ok: true, why: '90 วินาที = 60 วินาที + 30 วินาที = 1 นาที 30 วินาที' },
      { t: 'ชั่วโมงครึ่ง เท่ากับ 1 ชั่วโมง 50 นาที', f: '{hr:1} = {min:60} ดังนั้นครึ่งชั่วโมงคือกี่นาที', ok: false, why: 'ครึ่งชั่วโมง คือ 30 นาที ชั่วโมงครึ่งจึงเป็น 1 ชั่วโมง 30 นาที' },
      { t: '3 ชั่วโมง เท่ากับ 300 นาที', f: '{hr:1} = {min:60}', ok: false, why: '3 ชั่วโมง = 60 + 60 + 60 = 180 นาที' }
    ],
    dwmy: [
      { t: '1 สัปดาห์ มี 5 วัน', f: '{wk:1} = {day:7}', ok: false, why: '1 สัปดาห์ มี 7 วัน (จันทร์ถึงอาทิตย์)' },
      { t: '1 ปี มี 12 เดือน', f: '{yr:1} = {mo:12}', ok: true, why: 'ใช่ 1 ปี มี 12 เดือน' },
      { t: 'ทุกเดือนมี 30 วัน', f: 'ลงท้าย ยน = 30 วัน · ลงท้าย คม = 31 วัน', ok: false, why: 'บางเดือนมี 31 วัน และกุมภาพันธ์มี 28 หรือ 29 วัน' },
      { t: 'กันยายน มี 31 วัน', f: 'ลงท้าย ยน = 30 วัน · ลงท้าย คม = 31 วัน', ok: false, why: 'กันยายนลงท้ายด้วย ยน มี 30 วัน' },
      { t: '1 วัน มี 12 ชั่วโมง', f: '{day:1} = {hr:24}', ok: false, why: '1 วัน มี 24 ชั่วโมง' },
      { t: '1 วัน มี 24 ชั่วโมง', f: '{day:1} = {hr:24}', ok: true, why: 'ใช่ 1 วัน = 24 ชั่วโมง' },
      { t: 'ตุลาคม มี 31 วัน', f: 'ลงท้าย ยน = 30 วัน · ลงท้าย คม = 31 วัน', ok: true, why: 'ตุลาคมลงท้ายด้วย คม มี 31 วัน' },
      { t: 'กุมภาพันธ์ มี 30 วัน', f: 'กุมภาพันธ์ = 28 หรือ 29 วัน', ok: false, why: 'กุมภาพันธ์มีแค่ 28 วัน (ปีอธิกสุรทิน 29 วัน)' }
    ],
    compare: [
      { t: '90 วินาที นานกว่า 2 นาที เพราะ 90 มากกว่า 2', f: '{min:1} = {sec:60}', ok: false, why: '2 นาที = 120 วินาที ซึ่งมากกว่า 90 วินาที' },
      { t: '100 นาที นานกว่า 1 ชั่วโมง', f: '{hr:1} = {min:60}', ok: true, why: '1 ชั่วโมง = 60 นาที และ 100 นาที มากกว่า 60 นาที' },
      { t: '2 สัปดาห์ นานกว่า 15 วัน', f: '{wk:1} = {day:7}', ok: false, why: '2 สัปดาห์ = 14 วัน ซึ่งน้อยกว่า 15 วัน' },
      { t: '1 ปี น้อยกว่า 13 เดือน', f: '{yr:1} = {mo:12}', ok: true, why: '1 ปี = 12 เดือน ซึ่งน้อยกว่า 13 เดือน' },
      { t: '50 นาที นานกว่า 1 ชั่วโมง เพราะ 50 มากกว่า 1', f: '{hr:1} = {min:60}', ok: false, why: '1 ชั่วโมง = 60 นาที ซึ่งมากกว่า 50 นาที' },
      { t: '3 วัน เท่ากับ 72 ชั่วโมง', f: '{day:1} = {hr:24}', ok: true, why: '3 วัน = 24 + 24 + 24 = 72 ชั่วโมง' }
    ]
  };

  CT.T = {
    R, pick, shuffle, uniq, sgn, mk,
    DIG, intThai, pad, num, hmOf, fmtT, fmtTN, clockRead, readT, speakify,
    UNITS, SECS, MOS, PAIRS, kindOf, inBase, clean, durText, minParts, minText,
    MONTHS, DOW, DOW_S, THEMES, ACTS, EVENTS, UNIT_ACTS, CLAIMS,
    genConvert, genSpan, genCompare, genOrder, genEq, genCal, genTable, tableQuestion, genPlan, genEndStory, genBackward, genDiffStory
  };
})();
