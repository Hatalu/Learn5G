/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — Angle core
   - คำอ่านไทย (ตัวเลข / องศา) สำหรับเสียงพากย์
   - เรขาคณิตของโพรแทรกเตอร์: ตรวจการวาง, หาตำแหน่งที่ถูก, มุมที่สร้างได้
   - ตัวสร้างโจทย์ (ข้อมูลล้วน ไม่แตะ DOM) ทดสอบด้วย Node ได้
   มุมทั้งหมดเป็น "องศาแบบคณิตศาสตร์" : 0 = ขวา, เพิ่มทวนเข็มนาฬิกา
   พิกัดภาพ (SVG) : y ชี้ลง จึงแปลงด้วย vec()
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const AP = G.AP = G.AP || {};

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
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const norm = a => { a = ((a % 360) + 360) % 360; return a > 180 ? a - 360 : a; };   /* (-180, 180] */
  const norm360 = a => ((a % 360) + 360) % 360;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ═════════ คำอ่านภาษาไทย ═════════ */
  const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNIT = ['', 'สิบ', 'ร้อย', 'พัน'];
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
  /* แปลงข้อความโชว์เป็นข้อความสำหรับพูด */
  function speakify(s) {
    return String(s)
      .replace(/(\d+)\s*°/g, (m, n) => ' ' + intThai(+n) + ' องศา ')
      .replace(/∠/g, ' มุม ')
      .replace(/(\d+)/g, (m, n) => ' ' + intThai(+n) + ' ')
      .replace(/\s=\s/g, ' เท่ากับ ')
      .replace(/\s+/g, ' ');
  }
  const dg = n => n + '°';

  /* ═════════ เรขาคณิต ═════════ */
  const STAGE = { w: 460, h: 400, V: { x: 230, y: 212 }, len: 165 };
  const PROT = { R: 146, BODY: 156, KNOB: 174 };
  /* เวกเตอร์ภาพจากมุมคณิตศาสตร์ */
  const vec = (g, len) => ({ x: Math.cos(rad(g)) * len, y: -Math.sin(rad(g)) * len });
  const angOf = (p, from) => deg(Math.atan2(-(p.y - from.y), p.x - from.x));
  const typeOf = s => s < 90 ? 'acute' : s === 90 ? 'right' : s < 180 ? 'obtuse' : 'straight';
  const TYPE_NAME = { acute: 'มุมแหลม', right: 'มุมฉาก', obtuse: 'มุมป้าน', straight: 'มุมตรง' };

  /* รูปมุม: จุดยอด V, แขนฐานทิศ b, เปิดทิศ dir (+1 ทวนเข็ม / -1 ตามเข็ม) ขนาด size */
  function figure(o) {
    const f = { V: o.V || { x: STAGE.V.x, y: STAGE.V.y }, b: norm360(o.b), dir: o.dir || 1, size: o.size || 0, len: o.len || STAGE.len };
    f.e = norm360(f.b + f.dir * f.size);
    return f;
  }

  /* ตำแหน่งที่ถูกต้องทั้งหมดของโพรแทรกเตอร์ (ใช้แขนไหนเป็นเส้นฐานก็ได้) */
  function ideals(f) {
    const res = [];
    [[1, f.b, f.e], [2, f.e, f.b]].forEach(c => {
      const id = c[0], ab = c[1], ao = c[2];
      [0, 180].forEach(side => {
        const rot = norm360(ab - side);
        const lo = norm(ao - rot);
        if (lo > 0.5 && lo < 179.5) res.push({ id, side, rot, scale: side === 0 ? 'outer' : 'inner' });
      });
    });
    return res;
  }

  /* ตรวจการวางโพรแทรกเตอร์บนมุมที่มีสองแขน
     pr = {x, y, rot}  → {ok, posOk, rotOk, flipped, dist, rotErr, base, scale} */
  function checkPlacement(f, pr, tol) {
    tol = Object.assign({ pos: 12, rot: 4 }, tol || {});
    const dist = Math.hypot(pr.x - f.V.x, pr.y - f.V.y);
    const out = { dist, posOk: dist <= tol.pos, rotOk: false, flipped: false, ok: false, base: 0, scale: null, rotErr: 999 };
    const cands = [];
    [[1, f.b, f.e], [2, f.e, f.b]].forEach(c => {
      [0, 180].forEach(side => {
        const err = Math.abs(norm(c[1] - (pr.rot + side)));
        const lo = norm(c[2] - pr.rot);
        cands.push({ id: c[0], side, err, inside: lo > 0 && lo < 180 });
      });
    });
    out.rotErr = Math.min.apply(null, cands.map(c => c.err));
    const good = cands.filter(c => c.inside && c.err <= tol.rot).sort((a, b) => a.err - b.err)[0];
    if (good) { out.rotOk = true; out.base = good.id; out.scale = good.side === 0 ? 'outer' : 'inner'; out.ok = out.posOk; }
    else out.flipped = cands.some(c => c.err <= tol.rot && !c.inside);
    return out;
  }
  /* ตำแหน่งที่ถูกที่ใกล้ที่สุดกับท่าปัจจุบัน (ใช้ดูดเข้า) */
  function nearestIdeal(f, pr) {
    const list = ideals(f);
    list.sort((a, b) => Math.abs(norm(a.rot - pr.rot)) - Math.abs(norm(b.rot - pr.rot)));
    return list[0];
  }

  /* โหมดสร้างมุม: ตรวจเฉพาะการทับแขนฐาน (ครึ่งวงกลมหันขึ้นหรือลงก็ได้) */
  function checkBase(f, pr, tol) {
    tol = Object.assign({ pos: 12, rot: 4 }, tol || {});
    const dist = Math.hypot(pr.x - f.V.x, pr.y - f.V.y);
    const eO = Math.abs(norm(pr.rot - f.b)), eI = Math.abs(norm(pr.rot - (f.b + 180)));
    const out = { dist, posOk: dist <= tol.pos, rotErr: Math.min(eO, eI), rotOk: false, scale: null, ok: false };
    if (eO <= tol.rot || eI <= tol.rot) { out.rotOk = true; out.scale = eO <= eI ? 'outer' : 'inner'; out.ok = out.posOk; }
    return out;
  }
  function baseIdeals(f) {
    return [{ rot: norm360(f.b), scale: 'outer' }, { rot: norm360(f.b + 180), scale: 'inner' }];
  }
  /* มุมที่สร้างได้ = ระยะห่างเชิงมุมระหว่างแขนฐานกับจุดที่ทำเครื่องหมาย */
  const builtAngle = (b, g) => Math.round(Math.abs(norm(g - b)));
  /* ค่าที่อ่านได้บนสเกลที่เลือก ของทิศ g เมื่อโพรแทรกเตอร์หมุน rot */
  function scaleReading(rot, g, scale) {
    const l = clamp(norm(g - rot), 0, 180);
    return Math.round(scale === 'inner' ? 180 - l : l);
  }

  /* ═════════ ตัวสร้างโจทย์ ═════════ */
  const range = (a, b, st) => { const r = []; for (let i = a; i <= b; i += st) r.push(i); return r; };
  const SIZES = {
    1: range(20, 160, 10).filter(x => x !== 90),
    2: range(15, 165, 5).filter(x => x !== 90),
    3: range(12, 168, 1).filter(x => x !== 90 && x % 5 !== 0)
  };
  /* โจทย์วัดมุม — tilt: 'up' (แขนฐานแนวนอน แขนที่สองอยู่เหนือเส้น) | 'flat' | 'any' */
  function measureQ(level, tilt, last) {
    level = clamp(level || 1, 1, 3);
    tilt = tilt || (level === 1 ? 'up' : level === 2 ? 'flat' : 'any');
    let size, f, tries = 0;
    do {
      size = pick(SIZES[level]);
      let b, dir;
      if (tilt === 'up') { b = pick([0, 180]); dir = b === 0 ? 1 : -1; }
      else if (tilt === 'flat') { b = pick([0, 0, 180]); dir = pick([1, -1]); }
      else { b = pick([0, 180].concat(range(15, 345, 15).filter(x => x % 180 !== 0))); dir = pick([1, -1]); }
      f = figure({ b, dir, size });
      tries++;
    } while (last && last.size === size && tries < 20);
    return f;
  }
  /* ตัวเลือกวัดมุมแบบเลือกคำตอบ: ค่าจริง + ค่าจากสเกลผิดฝั่ง + ค่าใกล้เคียง */
  function measureChoices(size) {
    const wrongScale = 180 - size;
    let near = size < 90 ? size + 10 : size - 10;
    if (near === wrongScale || near === size) near = size < 90 ? size + 20 : size - 20;
    return shuffle([size, wrongScale, near]);
  }
  /* โจทย์สร้างมุม */
  function buildQ(level, tilt, last) {
    level = clamp(level || 1, 1, 3);
    tilt = tilt || (level < 3 ? 'flat' : 'any');
    const pool = level === 1 ? range(30, 150, 10).filter(x => x !== 90) : level === 2 ? range(15, 165, 5).filter(x => x !== 90) : range(11, 169, 1).filter(x => x !== 90);
    let size, tries = 0;
    do { size = pick(pool); tries++; } while (last && last.size === size && tries < 20);
    const b = tilt === 'flat' ? pick([0, 180]) : pick([0, 180].concat(range(15, 345, 15).filter(x => x % 180 !== 0)));
    return { size, f: figure({ b, dir: 1, size: 0 }) };
  }
  /* ครึ่งวงกลมหันขึ้น (หรือเกือบขึ้น) ที่ทับแขนฐาน */
  function upIdeal(f) {
    const c = baseIdeals(f);
    const up = r => Math.sin(rad(r + 90));
    return up(c[0].rot) >= up(c[1].rot) ? c[0] : c[1];
  }
  /* วินิจฉัยคำตอบสร้างมุมที่ผิด */
  function diagBuild(target, built) {
    const d = Math.abs(built - target);
    if (d <= 2) return 'ok';
    if (Math.abs(built - (180 - target)) <= 3) return 'wrongScale';
    if (d <= 6) return 'close';
    return 'far';
  }
  function diagMeasure(size, ans) {
    const d = Math.abs(ans - size);
    if (d === 0) return 'ok';
    if (ans === 180 - size) return 'wrongScale';
    if (d <= 3) return 'close';
    if (ans === 90 - size || ans === size + 90) return 'far';
    return 'far';
  }

  AP.M = {
    R, pick, shuffle, uniq, range, rad, deg, norm, norm360, clamp,
    intThai, speakify, dg,
    STAGE, PROT, vec, angOf, typeOf, TYPE_NAME,
    figure, ideals, checkPlacement, nearestIdeal, checkBase, baseIdeals, builtAngle, scaleReading, upIdeal,
    SIZES, measureQ, measureChoices, buildQ, diagBuild, diagMeasure
  };
})();
