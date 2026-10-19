/* ทดสอบตัวสร้างโจทย์: node tools/test-gen.js */
const assert = require('assert');
const SK = require('../js/sky.js');
const { GEN, PHASES, PL } = SK;
let n = 0;
const ok = (c, m) => { n++; assert(c, m); };
const uniq = a => new Set(a).size === a.length;

for (let rep = 0; rep < 300; rep++) {
  for (const lv of [1, 2, 3]) {
    let u = [];
    for (let i = 0; i < 5; i++) {
      const q = GEN.sky(lv, u);
      const vals = q.options.map(o => o.value);
      ok(vals.indexOf(q.answer) >= 0 && uniq(vals), 'sky ' + q.type);
      ok(q.hints.length === 3, 'sky hints');
    }
    u = [];
    for (let i = 0; i < 4; i++) {
      const q = GEN.rise(lv, u);
      const vals = q.options.map(o => o.value);
      ok(vals.indexOf(q.answer) >= 0 && uniq(vals) && vals.length >= 3, 'rise ' + q.type + ' ' + JSON.stringify(vals));
      if (q.tb) q.tb.rows.forEach(r => ok(r.min < 1440, 'row < 24h'));
      if (q.type === 'next' || q.type === 'next2') ok(q.answer < 1440, 'predict < 24h ' + q.answer);
    }
    const o = GEN.arcOrder(lv);
    ok(o.ts.length === (lv === 1 ? 3 : lv === 2 ? 4 : 5) && uniq(o.ts), 'arcOrder');
    u = [];
    for (let i = 0; i < 4; i++) { const t = GEN.phaseTarget(lv, u); ok(t.idx >= 0 && t.idx < 8, 'phaseTarget'); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.pos2shape(lv, u); ok(p.options.indexOf(p.idx) >= 0 && uniq(p.options) && p.options.length === 3, 'pos2shape ' + JSON.stringify(p)); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.shape2pos(lv, u); ok(p.options.indexOf(p.idx) >= 0 && uniq(p.options), 'shape2pos'); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.predict(lv, u); ok(p.options.indexOf(p.to) >= 0 && uniq(p.options) && p.options.length === 3, 'predict'); }
    const po = GEN.phaseOrder(lv); ok(uniq(po.seq), 'phaseOrder');
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.waxSide(lv, u); ok(p.wax === true || p.wax === false, 'waxSide'); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.dayShape(lv, u); ok(p.options.indexOf(p.idx) >= 0 && uniq(p.options), 'dayShape'); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.nth(lv, u); ok(p.options.indexOf(p.id) >= 0 && uniq(p.options) && p.options.length === 3, 'nth'); }
    u = [];
    for (let i = 0; i < 3; i++) { const p = GEN.between(lv, u); ok(p.options.indexOf(p.id) >= 0 && uniq(p.options) && p.options.length === 3, 'between'); }
    const ps = GEN.planetsSorted(lv); ok(uniq(ps.ids), 'planetsSorted');
    const nf = GEN.nearFar(lv); ok(nf.items.length >= 5 && uniq(nf.items), 'nearFar');
    u = [];
    for (let i = 0; i < 3; i++) {
      const p = GEN.longer(lv, u);
      ok(p.a !== p.b, 'longer');
      const A = SK.PLID[p.a], B = SK.PLID[p.b];
      ok(p.mode === 'longer' ? SK.PLID[p.answer].yrs === Math.max(A.yrs, B.yrs) : SK.PLID[p.answer].yrs === Math.min(A.yrs, B.yrs), 'longer answer');
    }
    u = [];
    for (let i = 0; i < 3; i++) {
      const p = GEN.periodTable(lv, u);
      ok(p.options.indexOf(p.answer) >= 0 && uniq(p.options) && p.options.length === 3, 'periodTable ' + JSON.stringify(p));
    }
    const pr = GEN.periodOrder(lv); ok(uniq(pr.ids), 'periodOrder');
  }
  for (let s = 1; s <= 6; s++) { const u = []; for (let i = 0; i < 4; i++) ok(typeof GEN.claim(s, u).truth === 'boolean', 'claim'); }
}

/* ข้อเท็จจริงสำคัญ */
ok(SK.phaseIdx(SK.epsOfDay(15)) === 4, 'day 15 = full');
ok(SK.phaseIdx(SK.epsOfDay(7.4)) === 2, 'day 7 = first quarter');
ok(SK.phaseIdx(SK.epsOfDay(0)) === 0 && SK.phaseIdx(SK.epsOfDay(29.5)) === 0, 'day 0/29.5 = new');
ok(Math.abs(SK.lit(180) - 1) < 1e-9 && SK.lit(0) < 1e-9 && Math.abs(SK.lit(90) - 0.5) < 1e-9, 'lit');
ok(SK.orbitAngle(0) === 180 && SK.orbitAngle(180) === 0, 'orbit angle');
ok(PL.every((p, i) => i === 0 || (p.d > PL[i - 1].d && p.yrs > PL[i - 1].yrs)), 'periods grow with distance');
ok(SK.fmtTime(24 * 60 + 40) === '00.40 น.' && SK.fmtTime(19 * 60 + 5) === '19.05 น.', 'fmtTime');
ok(SK.speakify('19.40 น.').indexOf('นาฬิกา') > 0, 'speakify time');
[1, 2, 3, 4, 5, 6, 7, 8].forEach(k => ok(Object.values(SK.DAY_STEPS).indexOf(k) >= 0, 'steps'));
console.log('OK', n, 'checks');
