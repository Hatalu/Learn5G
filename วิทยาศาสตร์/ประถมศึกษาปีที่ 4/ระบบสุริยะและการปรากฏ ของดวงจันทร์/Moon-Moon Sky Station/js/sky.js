/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ข้อมูลหลัก + ตัวสร้างโจทย์ (ข้อมูลล้วน ไม่แตะ DOM)
   - คำอ่านไทย (เวลา ตัวเลข) สำหรับเสียงพากย์
   - ข้อมูลดวงจันทร์ (8 รูปร่างปรากฏ) / เวลาขึ้นของดวงจันทร์ / ดาวเคราะห์ทั้ง 8
   - ตัวสร้างโจทย์ทุกด่าน: ทดสอบด้วย Node ได้  node tools/test-gen.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const SK = G.SK = G.SK || {};

  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const mod = (n, m) => ((n % m) + m) % m;

  /* ───────── คำอ่านภาษาไทย ───────── */
  const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNIT = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น'];
  function intThai(n) {
    n = Math.floor(Math.abs(+n));
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
  /* เวลาเป็นนาทีนับจากเที่ยงคืน → "19.40 น." (เกิน 24 ชม. วนกลับ) */
  function fmtTime(min) {
    const m = mod(Math.round(min), 1440), h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + '.' + (mm < 10 ? '0' : '') + mm + ' น.';
  }
  function sayTime(h, mm) {
    if (h === 0 && mm === 0) return 'เที่ยงคืน';
    return intThai(h) + ' นาฬิกา' + (mm ? ' ' + intThai(mm) + ' นาที' : ' ตรง');
  }
  /* ข้อความโชว์ → ข้อความสำหรับพูด */
  function speakify(s) {
    return String(s)
      .replace(/(\d{1,2})\.(\d{2})\s*น\./g, (m, h, mm) => ' ' + sayTime(+h, +mm) + ' ')
      .replace(/(\d+)\.(\d+)/g, (m, a, b) => ' ' + intThai(+a) + ' จุด ' + b.split('').map(d => DIG[+d]).join(' ') + ' ')
      .replace(/(\d+)/g, (m, n) => ' ' + intThai(+n) + ' ')
      .replace(/\s=\s/g, ' เท่ากับ ')
      .replace(/→/g, ' ไปยัง ')
      .replace(/\s+/g, ' ');
  }

  /* ═════════════════════════════════════════════════════════
     ดวงจันทร์ : 8 รูปร่างปรากฏ ใน 1 รอบเดือน (ประมาณ 29.5 วัน ≈ 30 วัน)
     eps = มุมระหว่างดวงอาทิตย์-โลก-ดวงจันทร์ที่เพิ่มขึ้นหลังวันจันทร์ดับ
       0 = ดับ · 90 = ครึ่งดวงข้างขึ้น · 180 = เต็มดวง · 270 = ครึ่งดวงข้างแรม
     มองจากประเทศไทย ข้างขึ้นสว่างด้านขวา ข้างแรมสว่างด้านซ้าย
     ═════════════════════════════════════════════════════════ */
  const PHASES = [
    { i: 0, n: 'จันทร์ดับ', long: 'ดวงจันทร์ดับ (มองไม่เห็น)', wax: null, day: 0 },
    { i: 1, n: 'เสี้ยวข้างขึ้น', long: 'ดวงจันทร์เสี้ยวข้างขึ้น', wax: true, day: 4 },
    { i: 2, n: 'ครึ่งดวงข้างขึ้น', long: 'ดวงจันทร์ครึ่งดวงข้างขึ้น', wax: true, day: 7 },
    { i: 3, n: 'ค่อนดวงข้างขึ้น', long: 'ดวงจันทร์ค่อนดวงข้างขึ้น', wax: true, day: 11 },
    { i: 4, n: 'เต็มดวง', long: 'ดวงจันทร์เต็มดวง', wax: null, day: 15 },
    { i: 5, n: 'ค่อนดวงข้างแรม', long: 'ดวงจันทร์ค่อนดวงข้างแรม', wax: false, day: 18 },
    { i: 6, n: 'ครึ่งดวงข้างแรม', long: 'ดวงจันทร์ครึ่งดวงข้างแรม', wax: false, day: 22 },
    { i: 7, n: 'เสี้ยวข้างแรม', long: 'ดวงจันทร์เสี้ยวข้างแรม', wax: false, day: 26 }
  ];
  const CYCLE_DAYS = 29.5;
  const epsOfIdx = i => mod(i, 8) * 45;
  const phaseIdx = eps => Math.round(mod(eps, 360) / 45) % 8;
  const epsOfDay = d => mod(d, CYCLE_DAYS) / CYCLE_DAYS * 360;
  const lit = eps => (1 - Math.cos(eps * Math.PI / 180)) / 2;
  /* กี่ก้าวของวัฏจักร (1 ก้าว = 1 รูปร่างถัดไป) ที่ผ่านไปเมื่อเวลาผ่านไปประมาณ d วัน */
  const DAY_STEPS = { 4: 1, 7: 2, 11: 3, 15: 4, 18: 5, 22: 6, 26: 7, 30: 8 };
  const stepOf = days => DAY_STEPS[days];
  /* มุมของดวงจันทร์บนวงโคจรในภาพมองจากเหนือโลก (องศา ทวนเข็ม, 0 = ขวา) */
  const orbitAngle = eps => mod(180 + eps, 360);

  /* ═════════════════════════════════════════════════════════
     ดาวเคราะห์ทั้ง 8 (เรียงจากใกล้ดวงอาทิตย์)
     yrs = คาบการโคจรรอบดวงอาทิตย์ (ปีโลก) · d = ระยะห่างจากดวงอาทิตย์ (AU) ใช้เทียบอันดับเท่านั้น
     ═════════════════════════════════════════════════════════ */
  const PL = [
    { id: 'mercury', n: 'ดาวพุธ', c1: '#e3d9cc', c2: '#8d8378', d: 0.39, yrs: 0.241, per: '88 วัน', size: 5 },
    { id: 'venus', n: 'ดาวศุกร์', c1: '#ffe2a8', c2: '#d99a3a', d: 0.72, yrs: 0.615, per: '225 วัน', size: 7 },
    { id: 'earth', n: 'โลก', c1: '#8fd4ff', c2: '#2a7fd6', d: 1.0, yrs: 1, per: '365 วัน (1 ปี)', size: 7.4 },
    { id: 'mars', n: 'ดาวอังคาร', c1: '#ff9d7a', c2: '#c4482a', d: 1.52, yrs: 1.88, per: '687 วัน', size: 6 },
    { id: 'jupiter', n: 'ดาวพฤหัสบดี', c1: '#ffd9a8', c2: '#c8884a', d: 5.2, yrs: 11.86, per: '12 ปี', size: 13 },
    { id: 'saturn', n: 'ดาวเสาร์', c1: '#fff0b8', c2: '#d3b060', d: 9.58, yrs: 29.46, per: '29 ปี', size: 11.5 },
    { id: 'uranus', n: 'ดาวยูเรนัส', c1: '#c8f4f4', c2: '#4fb6c4', d: 19.2, yrs: 84.01, per: '84 ปี', size: 9 },
    { id: 'neptune', n: 'ดาวเนปจูน', c1: '#a8c4ff', c2: '#3f5fd8', d: 30.1, yrs: 164.8, per: '165 ปี', size: 9 }
  ];
  const PLID = {}; PL.forEach((p, i) => { p.rank = i; PLID[p.id] = p; });
  const plName = id => PLID[id].n;
  /* ผลรวมคาบ ใช้ใบ้: "ใน 1 ปีของโลก ดาวพุธโคจรได้ประมาณ 4 รอบ" (365 / 88 ≈ 4.1) */
  const lapsIn = (id, years) => years / PLID[id].yrs;

  /* ─────────────────────────────────────────────────────────
     ตัวช่วยตัวเลือก
     ───────────────────────────────────────────────────────── */
  const opts = (answer, wrongs, extra) => shuffle([answer].concat(wrongs)).map(v => Object.assign({ value: v }, extra && extra(v)));
  const fresh = (list, used, keyFn) => {
    const ok = list.filter(x => used.indexOf(keyFn(x)) < 0);
    return pick(ok.length ? ok : list);
  };

  const GEN = {};

  /* ═════════ ด่าน 1 : เส้นทางขึ้น-ตกของดวงจันทร์ ═════════ */
  const DIRS = { E: 'ทิศตะวันออก', W: 'ทิศตะวันตก', N: 'ทิศเหนือ', S: 'ทิศใต้' };
  GEN.sky = function (level, used) {
    const types = level === 1 ? ['rise', 'set', 'state'] : level === 2 ? ['rise', 'set', 'state', 'moves', 'spin'] : ['moves', 'cause', 'spin', 'stateHi', 'set'];
    const type = fresh(types, used, x => x);
    used.push(type);
    const dirWrong = lv => lv === 1 ? ['E', 'W'] : lv === 2 ? ['E', 'W', 'N'] : ['E', 'W', 'N', 'S'];
    const dirOpts = (ans, lv) => shuffle(dirWrong(lv)).map(k => ({ label: DIRS[k], value: k }));
    if (type === 'rise') {
      return { key: type, type, ask: 'ดวงจันทร์กำลังโผล่พ้นขอบฟ้า (กำลังขึ้น) อยู่ทางทิศใด?', fig: { t: 0.06 }, options: dirOpts('E', level), answer: 'E',
        why: 'ดวงจันทร์ขึ้นทางทิศตะวันออกเสมอ', hints: ['ดูที่ดวงจันทร์ มันเพิ่งพ้นขอบฟ้าขึ้นมา', 'มือขวาของภาพ คือทิศตะวันออก', 'ดวงจันทร์เริ่มต้นที่ฝั่งขวา ซึ่งเป็นทิศตะวันออก'] };
    }
    if (type === 'set') {
      return { key: type, type, ask: 'ดวงจันทร์กำลังจะตกลับขอบฟ้า อยู่ทางทิศใด?', fig: { t: 0.94 }, options: dirOpts('W', level), answer: 'W',
        why: 'ดวงจันทร์ตกทางทิศตะวันตกเสมอ', hints: ['ดวงจันทร์กำลังลงต่ำจนจะลับขอบฟ้า', 'ฝั่งซ้ายของภาพ คือทิศตะวันตก', 'ดวงจันทร์จบเส้นทางที่ฝั่งซ้าย ซึ่งเป็นทิศตะวันตก'] };
    }
    if (type === 'state') {
      const up = Math.random() < 0.5, t = up ? R(18, 32) / 100 : R(68, 82) / 100;
      return { key: type, type, ask: 'ตอนนี้ดวงจันทร์ดวงนี้กำลังทำอะไร?', fig: { t, trail: true },
        options: shuffle([{ label: 'กำลังไต่ขึ้นสูง', value: 'up' }, { label: 'กำลังลดต่ำลง', value: 'down' }]), answer: up ? 'up' : 'down',
        why: up ? 'ดวงจันทร์อยู่ฝั่งตะวันออก กำลังไต่ขึ้นสูง' : 'ดวงจันทร์อยู่ฝั่งตะวันตก กำลังลดต่ำลง',
        hints: ['ดวงจันทร์เดินจากขวาไปซ้าย', 'ถ้ายังไม่ถึงกลางฟ้า คือกำลังขึ้นสูง', 'อยู่ฝั่งขวาของยอดโค้ง = กำลังขึ้น · ฝั่งซ้าย = กำลังลง'] };
    }
    if (type === 'stateHi') {
      return { key: type, type, ask: 'ดวงจันทร์อยู่สูงสุดกลางฟ้า อีกสักพักจะเคลื่อนไปทางทิศใด?', fig: { t: 0.5 }, options: dirOpts('W', 3), answer: 'W',
        why: 'จากกลางฟ้า ดวงจันทร์จะเคลื่อนต่อไปทางทิศตะวันตก', hints: ['ดวงจันทร์ไม่เคยย้อนกลับ มันเดินทางเดิม', 'เส้นทางไปทางซ้ายของภาพ', 'ซ้ายมือของภาพ คือทิศตะวันตก'] };
    }
    if (type === 'moves') {
      return { key: type, type, ask: 'ดวงจันทร์เพิ่งขึ้นทางทิศตะวันออก ต่อไปมันจะเคลื่อนไปทางทิศใด?', fig: { t: 0.1 }, options: dirOpts('W', level), answer: 'W',
        why: 'ดวงจันทร์เคลื่อนจากตะวันออกไปตะวันตก', hints: ['นึกถึงเส้นโค้งบนฟ้า จากขวาไปซ้าย', 'ปลายทางของเส้นโค้งอยู่ที่ฝั่งซ้าย', 'ฝั่งซ้ายคือทิศตะวันตก'] };
    }
    if (type === 'spin') {
      return { key: type, type, ask: 'โลกหมุนรอบตัวเองไปทางทิศใด?', fig: { earth: true, t: 0.2 },
        options: shuffle([{ label: 'จากตะวันตกไปตะวันออก', value: 'WE' }, { label: 'จากตะวันออกไปตะวันตก', value: 'EW' }, { label: 'จากเหนือไปใต้', value: 'NS' }]).slice(0, level === 1 ? 2 : 3),
        answer: 'WE', needAns: true, why: 'โลกหมุนจากตะวันตกไปตะวันออก เราจึงเห็นดวงจันทร์เคลื่อนไปทางตะวันตก',
        hints: ['ดูลูกศรบนโลกในแบบจำลอง', 'โลกหมุนทวนเข็มนาฬิกา เมื่อมองจากด้านบน', 'หมุนไปทางตะวันออก คือจากตะวันตกไปตะวันออก'] };
    }
    return { key: 'cause', type: 'cause', ask: 'ทำไมเรามองเห็นดวงจันทร์ขึ้นทางทิศตะวันออกแล้วไปตกทางทิศตะวันตก?', fig: { earth: true, t: 0.2 },
      options: shuffle([{ label: 'เพราะโลกหมุนรอบตัวเอง', value: 'spin' }, { label: 'เพราะดวงจันทร์โคจรรอบโลกครบ 1 รอบในคืนเดียว', value: 'fast' }, { label: 'เพราะดวงอาทิตย์ผลักให้ดวงจันทร์เคลื่อนที่', value: 'push' }]),
      answer: 'spin', why: 'โลกหมุนรอบตัวเอง เราจึงเห็นดวงจันทร์เหมือนเคลื่อนที่จากตะวันออกไปตะวันตก',
      hints: ['ลองหมุนโลกในแบบจำลอง แล้วดูท้องฟ้าของคนบนโลก', 'ดวงจันทร์แทบไม่ขยับในหนึ่งคืน คนที่เคลื่อนที่คือเรา', 'โลกหมุนรอบตัวเอง คนบนโลกจึงเห็นดวงจันทร์เลื่อนไป'] };
  };
  /* เรียงภาพดวงจันทร์ตามลำดับเวลาที่เคลื่อนผ่านฟ้า */
  GEN.arcOrder = function (level) {
    const pool = [0.06, 0.24, 0.5, 0.76, 0.94];
    const n = level === 1 ? 3 : level === 2 ? 4 : 5;
    const ts = n === 5 ? pool.slice() : n === 4 ? sample(pool, 4).sort((a, b) => a - b) : sample(pool, 3).sort((a, b) => a - b);
    return { ts, shuffled: shuffle(ts) };
  };

  /* ═════════ ด่าน 2 : หลักฐานเวลาขึ้นของดวงจันทร์ ═════════ */
  const STEP = 50;
  GEN.riseTable = function (level, n, extra) {
    n = n || 5;
    const maxStart = 24 * 60 - 1 - STEP * (n - 1 + (extra || 0));
    let start = R(16 * 6 + 3, 19 * 6 + 3) * 10; // 16:30 – 19:30
    start = Math.min(start, Math.floor(maxStart / 10) * 10);
    return { start, step: STEP, rows: Array.from({ length: n }, (_, i) => ({ day: i + 1, min: start + STEP * i })) };
  };
  GEN.rise = function (level, used) {
    const types = level === 1 ? ['pattern', 'method', 'next'] : level === 2 ? ['next', 'gap', 'method', 'next'] : ['next2', 'gap', 'cross', 'next'];
    const type = fresh(types, used, x => x);
    used.push(type);
    const tb = GEN.riseTable(level, 5, type === 'next2' ? 2 : type === 'cross' ? 0 : 1);
    const last = tb.rows[tb.rows.length - 1];
    if (type === 'pattern') {
      return { key: type, type, tb, ask: 'ดูตารางแล้ว เวลาที่ดวงจันทร์ขึ้นในแต่ละวัน เป็นอย่างไร?',
        options: shuffle([{ label: 'ช้าลงทุกวัน', value: 'later' }, { label: 'เร็วขึ้นทุกวัน', value: 'earlier' }, { label: 'เวลาเดิมทุกวัน', value: 'same' }]),
        answer: 'later', why: 'เวลาที่ดวงจันทร์ขึ้น ช้าลงทุกวัน ประมาณวันละ 50 นาที', hints: ['เทียบเวลาของวันที่ 1 กับวันที่ 2', 'ตัวเลขเวลาเพิ่มขึ้นหรือลดลง?', 'เวลาเพิ่มขึ้นทุกวัน แปลว่าขึ้นช้าลง'] };
    }
    if (type === 'method') {
      return { key: type, type, tb: null, ask: 'อยากรู้แบบรูปการขึ้นของดวงจันทร์ ควรเก็บหลักฐานอย่างไรดี?',
        options: shuffle([{ label: 'จดเวลาที่ดวงจันทร์ขึ้นติดต่อกันหลายวัน', value: 'log' }, { label: 'ดูแค่คืนเดียวแล้วเดา', value: 'once' }, { label: 'จำจากความรู้สึกว่าเคยเห็น', value: 'feel' }]),
        answer: 'log', why: 'การสังเกตและจดบันทึกติดต่อกันหลายวัน เป็นหลักฐานที่เชื่อถือได้', hints: ['หลักฐานต้องมาจากการสังเกตจริง', 'ดูครั้งเดียวไม่พอที่จะเห็นแบบรูป', 'ต้องสังเกตซ้ำ ๆ และจดไว้'] };
    }
    if (type === 'next' || type === 'next2') {
      const k = type === 'next2' ? 2 : 1, ans = last.min + STEP * k;
      const wrongs = [ans - STEP, ans + STEP, last.min].filter((v, i, a) => v !== ans && a.indexOf(v) === i).slice(0, 3);
      return { key: type, type, tb, predict: { day: last.day + k, ans },
        ask: 'ถ้าสังเกตต่อ วันที่ ' + (last.day + k) + ' ดวงจันทร์จะขึ้นเวลาประมาณกี่โมง?',
        options: opts(ans, wrongs.slice(0, 2), v => ({ label: fmtTime(v) })), answer: ans,
        why: 'ขึ้นช้าลงวันละประมาณ 50 นาที วันที่ ' + (last.day + k) + ' จึงประมาณ ' + fmtTime(ans),
        hints: ['หาว่าแต่ละวันช้าลงกี่นาที', 'ช้าลงวันละประมาณ 50 นาที', 'เอาเวลาของวันล่าสุด บวกอีก ' + (50 * k) + ' นาที'] };
    }
    if (type === 'gap') {
      const a = R(1, 2), b = R(4, 5), ans = (b - a) * STEP;
      const w = [ans - STEP, ans + STEP, ans + 2 * STEP].filter(v => v > 0 && v !== ans);
      return { key: type, type, tb, ask: 'ตั้งแต่วันที่ ' + a + ' ถึงวันที่ ' + b + ' ดวงจันทร์ขึ้นช้าลงรวมประมาณกี่นาที?',
        options: opts(ans, sample(w, 2), v => ({ label: v + ' นาที' })), answer: ans,
        why: 'ผ่านไป ' + (b - a) + ' วัน วันละ 50 นาที รวมประมาณ ' + ans + ' นาที', hints: ['นับว่าห่างกันกี่วัน', 'ช้าลงวันละประมาณ 50 นาที', (b - a) + ' วัน คูณ 50 นาที'] };
    }
    /* cross : เวลาข้ามเที่ยงคืน */
    const tbx = { start: 22 * 60 + 10, step: STEP, rows: [0, 1, 2].map(i => ({ day: i + 1, min: 22 * 60 + 10 + STEP * i })) };
    const ansx = 22 * 60 + 10 + STEP * 3; // 00.40
    return { key: 'cross', type: 'cross', tb: tbx, predict: null, ask: 'วันที่ 4 ดวงจันทร์จะขึ้นกี่โมง? (เลยเที่ยงคืนไปแล้ว)',
      options: opts(ansx, [ansx - 60, ansx + STEP], v => ({ label: fmtTime(v) })), answer: ansx,
      why: '23.50 น. + 50 นาที เลยเที่ยงคืนไปเป็น ' + fmtTime(ansx), hints: ['วันที่ 3 ขึ้น 23.00 น. กว่า ๆ', 'บวกอีก 50 นาทีจะเลยเที่ยงคืน', 'เลยเที่ยงคืนแล้ว เวลาจะขึ้นต้นด้วย 00.'] };
  };

  /* ═════════ ด่าน 3 : แบบจำลองแสงจันทร์ ═════════ */
  GEN.phaseTarget = function (level, used) {
    const pool = level === 1 ? [0, 2, 4, 6] : level === 2 ? [1, 2, 3, 4, 5, 6, 7] : [1, 3, 5, 7, 2, 6];
    const idx = fresh(pool, used, x => x);
    used.push(idx);
    return { idx, eps: epsOfIdx(idx), name: PHASES[idx].long };
  };
  /* ตำแหน่งบนวงโคจร → รูปร่างที่เห็น */
  GEN.pos2shape = function (level, used) {
    const pool = level === 1 ? [0, 2, 4, 6] : [1, 2, 3, 5, 6, 7, 0, 4];
    const idx = fresh(pool, used, x => x);
    used.push(idx);
    const wrongs = sample(pool.filter(i => i !== idx && (level === 1 || Math.abs(mod(i - idx, 8)) !== 0)), 2);
    if (level >= 2 && wrongs.indexOf(mod(8 - idx, 8)) < 0 && idx % 4 !== 0) wrongs[0] = mod(8 - idx, 8); // ตัวลวง: ด้านตรงข้าม (ซ้าย-ขวากลับกัน)
    return { idx, eps: epsOfIdx(idx), options: shuffle([idx].concat(wrongs)) };
  };
  GEN.shape2pos = function (level, used) {
    const pool = [2, 4, 6, 0, 1, 3, 5, 7];
    const idx = fresh(pool, used, x => x);
    used.push(idx);
    const wrongs = sample(pool.filter(i => i !== idx), 2);
    return { idx, eps: epsOfIdx(idx), options: shuffle([idx].concat(wrongs)) };
  };
  GEN.moonConcept = function (used) {
    const list = [
      { key: 'src', ask: 'แสงสว่างบนดวงจันทร์มาจากไหน?', ans: { label: 'แสงอาทิตย์ที่สะท้อนจากดวงจันทร์', value: 'sun' },
        wrongs: [{ label: 'ดวงจันทร์เปล่งแสงออกมาเอง', value: 'self' }, { label: 'แสงจากดวงดาวตอนกลางคืน', value: 'star' }],
        why: 'ดวงจันทร์ไม่มีแสงในตัวเอง เรามองเห็นเพราะสะท้อนแสงอาทิตย์', hints: ['ดวงจันทร์ไม่ใช่ดาวฤกษ์', 'ในแบบจำลอง แสงมาจากไหน?', 'แสงจากดวงอาทิตย์ตกกระทบดวงจันทร์'] },
      { key: 'half', ask: 'ดวงจันทร์ครึ่งซีกที่หันเข้าหาดวงอาทิตย์ เป็นอย่างไร?', ans: { label: 'สว่างอยู่เสมอ', value: 'lit' },
        wrongs: [{ label: 'มืดเสมอ', value: 'dark' }, { label: 'สว่างเฉพาะวันเต็มดวง', value: 'full' }],
        why: 'ซีกที่หันเข้าหาดวงอาทิตย์จะได้รับแสงอยู่เสมอ', hints: ['ลองลากดวงจันทร์ในห้องจำลอง', 'ดูซีกที่หันเข้าหาแสงอาทิตย์', 'ซีกนั้นสว่างเสมอ ไม่ว่าดวงจันทร์อยู่ตรงไหน'] },
      { key: 'full', ask: 'เห็นดวงจันทร์เต็มดวง เมื่อดวงจันทร์อยู่ที่ตำแหน่งใด?', ans: { label: 'อยู่ตรงข้ามดวงอาทิตย์ (โลกอยู่ตรงกลาง)', value: 'opp' },
        wrongs: [{ label: 'อยู่ระหว่างโลกกับดวงอาทิตย์', value: 'between' }, { label: 'อยู่ด้านบนของโลก', value: 'top' }],
        why: 'ดวงจันทร์อยู่ตรงข้ามดวงอาทิตย์ เรามองเห็นซีกที่สว่างเต็มดวง', hints: ['ลองลากดวงจันทร์ให้เห็นเต็มดวง', 'ภาพที่เห็นจากโลกต้องสว่างทั้งดวง', 'โลกอยู่ระหว่างดวงอาทิตย์กับดวงจันทร์'] },
      { key: 'new', ask: 'จันทร์ดับ ดวงจันทร์อยู่ที่ตำแหน่งใด?', ans: { label: 'อยู่ระหว่างโลกกับดวงอาทิตย์', value: 'between' },
        wrongs: [{ label: 'อยู่ตรงข้ามดวงอาทิตย์', value: 'opp' }, { label: 'หายไปจากวงโคจร', value: 'gone' }],
        why: 'ซีกสว่างหันเข้าหาดวงอาทิตย์ ส่วนซีกมืดหันมาทางโลก จึงมองไม่เห็นดวงจันทร์', hints: ['ลากให้ภาพที่เห็นจากโลกมืดสนิท', 'ซีกที่สว่างหันไปทางไหน?', 'ซีกสว่างหันไปหาดวงอาทิตย์ ซีกมืดหันหาโลก'] }
    ];
    const it = fresh(list, used, x => x.key);
    used.push(it.key);
    return it;
  };

  /* ═════════ ด่าน 4 : ปฏิทินดวงจันทร์ ═════════ */
  GEN.predict = function (level, used) {
    const starts = level === 1 ? [0, 2, 4, 6] : [0, 1, 2, 3, 4, 5, 6, 7];
    const days = level === 1 ? [7, 15] : level === 2 ? [4, 7, 11, 15] : [4, 7, 11, 18, 22, 26];
    let from, d, key, guard = 0;
    do { from = pick(starts); d = pick(days); key = from + ':' + d; guard++; } while (used.indexOf(key) >= 0 && guard < 30);
    used.push(key);
    const to = mod(from + stepOf(d), 8);
    const wrong = sample([0, 1, 2, 3, 4, 5, 6, 7].filter(i => i !== to), 2);
    const mirror = mod(8 - to, 8);
    if (level >= 2 && to % 4 !== 0 && wrong.indexOf(mirror) < 0) wrong[0] = mirror; // ตัวลวง: ซ้าย-ขวากลับกัน
    return { from, days: d, to, options: shuffle([to].concat(wrong)) };
  };
  GEN.phaseOrder = function (level) {
    const n = level === 1 ? 3 : level === 2 ? 4 : 5;
    const start = R(0, 7);
    const seq = Array.from({ length: n }, (_, i) => mod(start + i, 8));
    return { seq, shuffled: shuffle(seq) };
  };
  GEN.waxSide = function (level, used) {
    const pool = level === 1 ? [2, 6] : [1, 2, 3, 5, 6, 7];
    const idx = fresh(pool, used, x => x);
    used.push(idx);
    const wax = PHASES[idx].wax;
    return { idx, wax, ans: wax ? 'wax' : 'wane' };
  };
  GEN.dayShape = function (level, used) {
    const pool = level === 1 ? [0, 7, 15, 22] : [4, 11, 18, 26, 7, 15, 22, 0];
    const day = fresh(pool, used, x => x);
    used.push(day);
    const idx = phaseIdx(epsOfDay(day));
    const wrong = sample([0, 1, 2, 3, 4, 5, 6, 7].filter(i => i !== idx), 2);
    return { day, idx, options: shuffle([idx].concat(wrong)) };
  };

  /* ═════════ ด่าน 5 : ระบบสุริยะ ═════════ */
  GEN.nth = function (level, used) {
    const pool = level === 1 ? [0, 2, 4, 7] : [0, 1, 2, 3, 4, 5, 6, 7];
    const r = fresh(pool, used, x => x);
    used.push(r);
    const w = sample(PL.filter((p, i) => i !== r && Math.abs(i - r) <= (level === 1 ? 7 : 2)), 2).map(p => p.id);
    return { rank: r, id: PL[r].id, options: shuffle([PL[r].id].concat(w)) };
  };
  GEN.between = function (level, used) {
    const r = fresh([1, 2, 3, 4, 5, 6], used, x => x);
    used.push(r);
    const w = sample(PL.filter((p, i) => Math.abs(i - r) >= 1 && Math.abs(i - r) <= 3 && i !== r), 2).map(p => p.id);
    return { rank: r, a: PL[r - 1].id, b: PL[r + 1].id, id: PL[r].id, options: shuffle([PL[r].id].concat(w)) };
  };
  GEN.planetsSorted = function (level) {
    const n = level === 1 ? 4 : level === 2 ? 5 : 6;
    const ids = sample(PL, n).sort((a, b) => a.rank - b.rank).map(p => p.id);
    return { ids, shuffled: shuffle(ids) };
  };
  GEN.nearFar = function (level) {
    const n = level === 1 ? 5 : level === 2 ? 6 : 7;
    const near = sample(PL.slice(0, 2), level === 1 ? 1 : 2), far = sample(PL.slice(3), n - near.length);
    const items = shuffle(near.concat(far)).map(p => p.id);
    return { items, ans: id => PLID[id].rank < 2 ? 'near' : 'far' };
  };

  /* ═════════ ด่าน 6 : คาบการโคจร ═════════ */
  GEN.longer = function (level, used) {
    const gap = level === 1 ? [3, 7] : level === 2 ? [2, 3] : [1, 2];
    let a, b, key, guard = 0;
    do {
      a = R(0, 7); b = R(0, 7);
      key = Math.min(a, b) + '-' + Math.max(a, b); guard++;
    } while ((Math.abs(a - b) < gap[0] || Math.abs(a - b) > gap[1] || used.indexOf(key) >= 0) && guard < 80);
    used.push(key);
    const mode = level === 3 && Math.random() < 0.5 ? 'shorter' : 'longer';
    const far = PL[Math.max(a, b)], near = PL[Math.min(a, b)];
    return { a: near.id, b: far.id, mode, answer: mode === 'longer' ? far.id : near.id };
  };
  GEN.periodTable = function (level, used) {
    const ids = sample(PL, 4).sort((a, b) => a.rank - b.rank).map(p => p.id);
    const types = level === 1 ? ['most', 'least'] : ['most', 'least', 'lessEarth'];
    let type = fresh(types, used, x => x);
    if (type === 'lessEarth' && ids.indexOf('earth') < 0) { ids[1] = 'earth'; ids.sort((a, b) => PLID[a].rank - PLID[b].rank); }
    used.push(type);
    const sorted = ids.slice();
    if (type === 'most') return { ids, ask: 'ดาวเคราะห์ดวงใดใช้เวลาโคจรครบ 1 รอบ นานที่สุด?', answer: sorted[3], options: shuffle([sorted[3]].concat(sample(sorted.slice(0, 3), 2))) };
    if (type === 'least') return { ids, ask: 'ดาวเคราะห์ดวงใดใช้เวลาโคจรครบ 1 รอบ น้อยที่สุด?', answer: sorted[0], options: shuffle([sorted[0]].concat(sample(ids.slice(1), 2))) };
    const inner = ['mercury', 'venus'], outer = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    const lessMode = Math.random() < 0.5;
    const ans = pick(lessMode ? inner : outer), wr = sample(lessMode ? outer : inner, 2);
    const tab = [ans].concat(wr, ['earth']).sort((a, b) => PLID[a].rank - PLID[b].rank);
    return { ids: tab, ask: lessMode ? 'ดาวดวงไหนใช้เวลาโคจรครบ 1 รอบ น้อยกว่าโลก?' : 'ดาวดวงไหนใช้เวลาโคจรครบ 1 รอบ มากกว่าโลก?', answer: ans, options: shuffle([ans].concat(wr)) };
  };
  GEN.laps = function (used) {
    const list = [
      { key: 'merc', ask: 'ในเวลา 1 ปีของโลก ดาวพุธ (คาบ 88 วัน) โคจรได้ประมาณกี่รอบ?', ans: 4, wrongs: [1, 2], why: 'โลก 1 ปี = 365 วัน ดาวพุธรอบละ 88 วัน จึงโคจรได้ประมาณ 4 รอบ', hints: ['1 ปีของโลก = 365 วัน', 'ดาวพุธใช้ 88 วัน ต่อ 1 รอบ', '88 วัน ซ้ำ ๆ ใน 365 วัน ได้ราว 4 รอบ'] },
      { key: 'jup', ask: 'ดาวพฤหัสบดีโคจรครบ 1 รอบใช้เวลา 12 ปีของโลก ในเวลานั้นโลกโคจรได้กี่รอบ?', ans: 12, wrongs: [1, 6], why: 'โลกใช้เวลา 1 ปีต่อ 1 รอบ ใน 12 ปีจึงโคจรได้ 12 รอบ', hints: ['โลกโคจรครบ 1 รอบใช้ 1 ปี', 'ผ่านไป 12 ปี', 'ปีละ 1 รอบ ครบ 12 ปี ได้ 12 รอบ'] },
      { key: 'nep', ask: 'ใน 1 ปีของโลก ดาวเนปจูน (คาบ 165 ปี) โคจรได้กี่รอบ?', ans: 'ยังไม่ครบรอบ', wrongs: ['1 รอบ', '10 รอบ'], why: 'ดาวเนปจูนใช้ 165 ปีต่อ 1 รอบ ใน 1 ปีจึงยังโคจรได้นิดเดียว', hints: ['ดาวเนปจูนมีคาบนานมาก', '165 ปีกว่าจะครบ 1 รอบ', '1 ปี เป็นเวลาน้อยมากเมื่อเทียบกับ 165 ปี'] }
    ];
    const it = fresh(list, used, x => x.key);
    used.push(it.key);
    return it;
  };
  GEN.periodOrder = function (level) {
    const n = level === 1 ? 4 : level === 2 ? 5 : 6;
    const ids = sample(PL, n).sort((a, b) => a.yrs - b.yrs).map(p => p.id);
    return { ids, shuffled: shuffle(ids) };
  };

  /* ═════════ ฟิ้วฟิ้วอ้าง : จริงหรือไม่จริง ═════════ */
  const C = (text, truth, why) => ({ text, truth, why });
  const CLAIMS = {
    1: [
      C('ดวงจันทร์ขึ้นทางทิศตะวันตก แล้วไปตกทางทิศตะวันออก', false, 'ดวงจันทร์ขึ้นทางตะวันออก แล้วไปตกทางตะวันตก'),
      C('ดวงจันทร์ขึ้นทางทิศตะวันออก แล้วไปตกทางทิศตะวันตก', true, 'ถูกแล้ว ขึ้นทางตะวันออก ตกทางตะวันตก'),
      C('ดวงจันทร์ขึ้นและตกในทิศเดียวกัน', false, 'ขึ้นทางตะวันออก ตกทางตะวันตก คนละทิศกัน'),
      C('ดวงจันทร์เคลื่อนที่บนท้องฟ้าเป็นเส้นโค้ง', true, 'เส้นทางของดวงจันทร์เป็นเส้นโค้ง จากขอบฟ้าด้านหนึ่งไปอีกด้านหนึ่ง'),
      C('ดวงจันทร์ขึ้นทางทิศเหนือ', false, 'ดวงจันทร์ขึ้นทางทิศตะวันออก ไม่ใช่ทิศเหนือ'),
      C('ทิศทางที่ดวงจันทร์ขึ้นและตก เหมือนกับดวงอาทิตย์', true, 'ทั้งสองขึ้นทางตะวันออก ตกทางตะวันตก'),
      C('โลกหมุนรอบตัวเอง ทำให้เรามองเห็นดวงจันทร์ขึ้นและตก', true, 'โลกหมุนรอบตัวเอง จึงเห็นดวงจันทร์เหมือนเคลื่อนที่'),
      C('ตอนที่ดวงจันทร์อยู่สูงสุดกลางฟ้า มันอยู่ใกล้ขอบฟ้าที่สุด', false, 'กลางฟ้าคือตำแหน่งสูงสุด ไกลจากขอบฟ้าที่สุด')
    ],
    2: [
      C('ดวงจันทร์ขึ้นเวลาเดิมเป๊ะทุกวัน', false, 'เวลาขึ้นช้าลงทุกวัน ประมาณวันละ 50 นาที'),
      C('ดวงจันทร์ขึ้นช้าลงวันละประมาณ 50 นาที', true, 'ใช่แล้ว ข้อมูลที่บันทึกไว้แสดงอย่างนั้น'),
      C('พรุ่งนี้ดวงจันทร์จะขึ้นเร็วกว่าวันนี้', false, 'ขึ้นช้ากว่าวันนี้ ไม่ใช่เร็วกว่า'),
      C('เมฆบังฟ้า แปลว่าวันนั้นดวงจันทร์ไม่ขึ้น', false, 'ดวงจันทร์ขึ้นตามปกติ แค่เมฆบังไว้ เรามองไม่เห็น'),
      C('การจดบันทึกหลายวันติดกัน ช่วยให้เห็นแบบรูปได้ชัดเจน', true, 'บันทึกหลายวันเป็นหลักฐานให้เห็นแบบรูป'),
      C('ดูดวงจันทร์ครั้งเดียว ก็รู้แบบรูปการขึ้นได้ทั้งหมด', false, 'ต้องสังเกตหลายวันติดกัน จึงจะเห็นแบบรูป'),
      C('หลักฐานทางวิทยาศาสตร์ คือสิ่งที่สังเกตและบันทึกได้จริง', true, 'หลักฐานเชิงประจักษ์ มาจากการสังเกตและบันทึก')
    ],
    3: [
      C('ดวงจันทร์เปล่งแสงเองได้ จึงสว่างทุกคืน', false, 'ดวงจันทร์สะท้อนแสงอาทิตย์ ไม่ได้เปล่งแสงเอง'),
      C('ซีกของดวงจันทร์ที่หันเข้าหาดวงอาทิตย์ สว่างอยู่เสมอ', true, 'ถูกแล้ว ซีกที่หันเข้าหาแสงอาทิตย์สว่างเสมอ'),
      C('ตอนจันทร์เสี้ยว ส่วนที่มืดของดวงจันทร์หายไปจริง ๆ', false, 'ส่วนมืดยังอยู่ เพียงแต่เรามองเห็นไม่ชัด เพราะไม่ได้รับแสงในมุมที่เรามอง'),
      C('เห็นดวงจันทร์เต็มดวง เมื่อโลกอยู่ระหว่างดวงอาทิตย์กับดวงจันทร์', true, 'ใช่ ดวงจันทร์อยู่ตรงข้ามดวงอาทิตย์ จึงเห็นซีกสว่างเต็มดวง'),
      C('จันทร์ดับ เพราะดวงจันทร์เดินทางออกไปจากวงโคจร', false, 'ดวงจันทร์ยังอยู่ที่เดิม เพียงแต่ซีกสว่างหันไปทางดวงอาทิตย์ ไม่หันมาทางโลก'),
      C('รูปร่างปรากฏของดวงจันทร์เปลี่ยน เพราะมุมที่เรามองซีกสว่างเปลี่ยนไป', true, 'ดวงจันทร์โคจรรอบโลก มุมที่เรามองซีกสว่างจึงเปลี่ยนไป'),
      C('ดวงจันทร์ครึ่งซีกที่หันมาทางโลก สว่างเสมอ', false, 'ซีกที่สว่างคือซีกที่หันเข้าหาดวงอาทิตย์ ไม่ใช่ซีกที่หันหาโลก')
    ],
    4: [
      C('ข้างขึ้น ดวงจันทร์จะสว่างเพิ่มขึ้นเรื่อย ๆ', true, 'ข้างขึ้นคือช่วงที่ส่วนสว่างเพิ่มขึ้นทีละวัน'),
      C('ข้างแรม ดวงจันทร์จะสว่างเพิ่มขึ้นเรื่อย ๆ', false, 'ข้างแรมคือช่วงที่ส่วนสว่างลดลงทีละวัน'),
      C('ดวงจันทร์เต็มดวงทุก ๆ ประมาณ 15 วันพอดี ตลอดไป', false, 'ดวงจันทร์เต็มดวงซ้ำเดิมทุก ๆ ประมาณ 30 วัน'),
      C('รูปร่างปรากฏของดวงจันทร์เปลี่ยนเป็นวัฏจักร ครบรอบประมาณ 30 วัน', true, 'ครบ 1 รอบประมาณ 30 วัน แล้วเริ่มต้นใหม่'),
      C('ข้างขึ้น ซีกที่สว่างอยู่ทางซ้ายมือ (มองจากประเทศไทย)', false, 'ข้างขึ้นสว่างทางขวามือ ข้างแรมสว่างทางซ้ายมือ'),
      C('หลังเต็มดวง ดวงจันทร์จะค่อย ๆ สว่างน้อยลง', true, 'หลังเต็มดวงคือข้างแรม แสงสว่างลดลงเรื่อย ๆ'),
      C('จากจันทร์ดับไปเต็มดวง ใช้เวลาประมาณ 15 วัน', true, 'ข้างขึ้นใช้เวลาประมาณ 15 วัน'),
      C('วันนี้เสี้ยว พรุ่งนี้จะกลายเป็นเต็มดวงทันที', false, 'รูปร่างเปลี่ยนทีละน้อยทุกวัน ไม่ได้เปลี่ยนทันที')
    ],
    5: [
      C('ดวงอาทิตย์เป็นดาวเคราะห์ดวงหนึ่ง', false, 'ดวงอาทิตย์เป็นดาวฤกษ์ ศูนย์กลางของระบบสุริยะ'),
      C('ระบบสุริยะมีดาวเคราะห์ 8 ดวง', true, 'ถูกแล้ว มีดาวเคราะห์ 8 ดวงโคจรรอบดวงอาทิตย์'),
      C('โลกอยู่ใกล้ดวงอาทิตย์ที่สุด', false, 'ดาวพุธอยู่ใกล้ที่สุด โลกเป็นดวงที่ 3'),
      C('ดวงจันทร์เป็นบริวารของโลก โคจรรอบโลก', true, 'ดวงจันทร์โคจรรอบโลก จึงเป็นบริวารของโลก'),
      C('ดาวเนปจูนอยู่ไกลดวงอาทิตย์ที่สุดในบรรดาดาวเคราะห์ทั้ง 8', true, 'ดาวเนปจูนเป็นดวงที่ 8 ไกลที่สุด'),
      C('ดาวพฤหัสบดีอยู่ใกล้ดวงอาทิตย์กว่าโลก', false, 'ดาวพฤหัสบดีเป็นดวงที่ 5 ไกลกว่าโลก'),
      C('ดาวเคราะห์ทุกดวงโคจรรอบดวงอาทิตย์', true, 'ดาวเคราะห์ทั้ง 8 โคจรรอบดวงอาทิตย์'),
      C('ดาวอังคารอยู่ระหว่างดาวศุกร์กับโลก', false, 'ดาวอังคารอยู่ถัดจากโลกออกไป ส่วนดาวศุกร์อยู่ก่อนโลก')
    ],
    6: [
      C('ดาวเนปจูนโคจรครบรอบเร็วกว่าโลก', false, 'ดาวเนปจูนอยู่ไกล คาบการโคจรนานกว่าโลกมาก'),
      C('ดาวพุธมีคาบการโคจรสั้นที่สุดในดาวเคราะห์ทั้ง 8', true, 'ดาวพุธอยู่ใกล้ที่สุด จึงโคจรครบรอบเร็วที่สุด'),
      C('ดาวเคราะห์ที่อยู่ไกลดวงอาทิตย์กว่า มีคาบการโคจรนานกว่า', true, 'จากแบบจำลอง ยิ่งไกลดวงอาทิตย์ ยิ่งใช้เวลาโคจรนาน'),
      C('1 ปีของโลก คือเวลาที่โลกโคจรรอบดวงอาทิตย์ครบ 1 รอบ', true, 'ถูกแล้ว ประมาณ 365 วัน'),
      C('ดาวศุกร์ใช้เวลาโคจรครบรอบนานกว่าโลก', false, 'ดาวศุกร์ใช้ประมาณ 225 วัน น้อยกว่าโลก'),
      C('ดาวทุกดวงโคจรครบ 1 รอบในเวลาเท่ากัน', false, 'แต่ละดวงมีคาบการโคจรไม่เท่ากัน'),
      C('ดาวพฤหัสบดีใช้เวลาโคจรครบ 1 รอบประมาณ 12 ปีของโลก', true, 'ดาวพฤหัสบดีมีคาบประมาณ 12 ปี')
    ]
  };
  GEN.claim = function (stage, used) {
    const list = CLAIMS[stage];
    const lastTruth = used.length ? list.find(c => c.text === used[used.length - 1]) : null;
    let pool = list.filter(c => used.indexOf(c.text) < 0);
    if (!pool.length) pool = list;
    if (lastTruth) { const alt = pool.filter(c => c.truth !== lastTruth.truth); if (alt.length) pool = alt; }
    const c = pick(pool);
    used.push(c.text);
    return c;
  };

  Object.assign(SK, { R, pick, shuffle, clamp, sample, mod, intThai, fmtTime, sayTime, speakify, PHASES, CYCLE_DAYS, epsOfIdx, phaseIdx, epsOfDay, lit, DAY_STEPS, stepOf, orbitAngle,
    PL, PLID, plName, lapsIn, DIRS, STEP, CLAIMS, GEN });
  if (typeof module !== 'undefined' && module.exports) module.exports = SK;
})();
