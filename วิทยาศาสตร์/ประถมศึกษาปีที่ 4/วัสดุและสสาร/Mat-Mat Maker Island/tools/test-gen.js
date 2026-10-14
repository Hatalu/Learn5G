/* ทดสอบตัวสร้างโจทย์และข้อมูลวัสดุ (ไม่ต้องใช้เบราว์เซอร์): node tools/test-gen.js */
const MM = require('../js/mat.js');
const { GEN, ITEM, SI, POOL, USE } = MM;
let fails = 0, checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.log('FAIL:', msg); } }
const N = 3000;

/* ── ข้อมูลตัวอย่าง ── */
Object.keys(ITEM).forEach(id => {
  const it = ITEM[id];
  ok(it.n && typeof it.n === 'string', 'item name ' + id);
  if (it.hard != null) ok(it.hard >= 1 && it.hard <= 4, 'hard range ' + id);
});
Object.keys(SI).forEach(id => ok(['solid', 'liquid', 'gas'].indexOf(SI[id].s) >= 0, 'state ' + id));

/* ── ความแข็ง ── */
for (let lv = 1; lv <= 3; lv++) {
  const gap = lv === 1 ? 3 : lv === 2 ? 2 : 1;
  for (let i = 0; i < N; i++) {
    const p = GEN.hardPair(lv);
    ok(p.a !== p.b, 'hardPair distinct');
    ok(Math.abs(ITEM[p.a].hard - ITEM[p.b].hard) >= gap, 'hardPair gap lv' + lv + ' ' + p.a + p.b);
    ok(MM.scratches(p.winner, p.loser) && !MM.scratches(p.loser, p.winner), 'winner scratches loser');
    const t = GEN.hardTriple(lv);
    ok(new Set(t.ids.map(x => ITEM[x].hard)).size === 3, 'triple distinct tiers');
    ok(t.sorted.every((x, k) => k === 0 || ITEM[t.sorted[k - 1]].hard < ITEM[x].hard), 'triple sorted');
    if (lv === 1) ok(ITEM[t.sorted[2]].hard - ITEM[t.sorted[0]].hard >= 3, 'triple spread lv1');
    const s = GEN.hardSort(lv, 6);
    ok(s.length === 6 && new Set(s).size === 6, 'hardSort 6 unique');
    ok(s.filter(x => MM.hardGroup(x) === 'hard').length === 3, 'hardSort 3 hard');
  }
}
/* ตะปูขีดได้เฉพาะระดับ ≤ 3 */
ok(MM.nailScratches('sponge') && MM.nailScratches('wood') && !MM.nailScratches('steel') && !MM.nailScratches('stone'), 'nail rule');

/* ── ยืดหยุ่น ── */
for (let i = 0; i < N; i++) {
  const s = GEN.elasticSet(1, 6);
  ok(s.length === 6 && new Set(s).size === 6, 'elasticSet unique');
  ok(s.filter(MM.isElastic).length === 3, 'elasticSet 3 yes');
}
POOL.elasticYes.forEach(id => ok(ITEM[id].elastic === true, 'elasticYes ' + id));
POOL.elasticNo.forEach(id => ok(ITEM[id].elastic === false, 'elasticNo ' + id));

/* ── ความร้อน ── */
POOL.heatGood.forEach(id => ok(MM.heatGood(id), 'heatGood ' + id));
POOL.heatPoor.forEach(id => ok(!MM.heatGood(id), 'heatPoor ' + id));
for (let i = 0; i < N; i++) {
  const r = GEN.heatRods(1);
  ok(r.length === 4 && new Set(r).size === 4 && r.filter(MM.heatGood).length === 2, 'heatRods');
  const h = GEN.heatSort(6);
  ok(h.length === 6 && new Set(h).size === 6 && h.filter(MM.heatGood).length === 3, 'heatSort 3/3');
}

/* ── ไฟฟ้า ── */
POOL.elecYes.forEach(id => ok(ITEM[id].elec === true, 'elecYes ' + id));
POOL.elecNo.forEach(id => ok(ITEM[id].elec === false, 'elecNo ' + id));
for (let i = 0; i < N; i++) {
  [6, 8].forEach(n => { const e = GEN.elecSet(n); ok(e.length === n && new Set(e).size === n && e.filter(MM.isConductor).length === n / 2, 'elecSet ' + n); });
  for (let lv = 1; lv <= 3; lv++) {
    const b = GEN.bridge(lv);
    ok(b.k === (lv >= 3 ? 3 : 2) && b.slots.length === b.k, 'bridge k');
    const allC = [];
    b.slots.forEach(s => { ok(s.length === 3 && new Set(s).size === 3, 'bridge slot 3 unique'); ok(s.some(MM.isConductor), 'bridge slot has conductor'); s.forEach(x => { if (MM.isConductor(x) && allC.indexOf(x) < 0) allC.push(x); }); });
    ok(allC.length >= b.k, 'bridge enough conductors');
    const flatC = [].concat.apply([], b.slots).filter(MM.isConductor);
    ok(new Set(flatC).size === flatC.length, 'bridge no repeated conductor across slots');
  }
}

/* ── ชิ้นงานที่ให้ประกอบ ── */
Object.keys(GEN.BUILD).forEach(k => {
  const B = GEN.BUILD[k];
  B.parts.forEach(p => {
    const good = B.shelf.filter(p.need), bad = B.shelf.filter(id => !p.need(id));
    ok(good.length >= 1, 'build ' + k + '/' + p.k + ' has valid');
    ok(bad.length >= 2, 'build ' + k + '/' + p.k + ' has distractors');
  });
  /* ไม่มีวัสดุเดียวที่ถูกทุกส่วนจนเกมกลายเป็นเดาง่าย */
  const both = B.shelf.filter(id => B.parts.every(p => p.need(id)));
  ok(both.length === 0, 'build ' + k + ' no item valid for all parts: ' + both.join());
});

/* ── นักสืบวัสดุลึกลับ ── */
for (let i = 0; i < N; i++) {
  const m = GEN.mystery();
  ok(m.cand.length === 3 && new Set(m.cand).size === 3, 'mystery 3 cand');
  ok(m.cand.indexOf(m.secret) >= 0, 'mystery secret in cand');
  ok(new Set(m.cand.map(id => MM.MYST[id].sig.grp)).size === 3, 'mystery 3 groups');
  const seen = {};
  ['press', 'elastic', 'heat', 'elec'].forEach(t => { seen[t] = GEN.mysteryResult(m.secret, t); });
  const left = GEN.mysteryLeft(m.cand, seen);
  ok(left.length === 1 && left[0] === m.secret, 'mystery unique after all tests');
  /* ทดสอบ 2 อย่างพอแล้วหรือยัง : elec + press ต้องแยกได้ครบ 3 กลุ่ม */
  const two = GEN.mysteryLeft(m.cand, { press: seen.press, elec: seen.elec });
  ok(two.length === 1, 'mystery press+elec enough');
}

/* ── สถานะ ── */
for (let i = 0; i < N; i++) {
  [false, true].forEach(tr => {
    const s = GEN.stateSet(6, tr);
    ok(s.length === 6 && new Set(s).size === 6, 'stateSet unique');
    const states = new Set(s.map(id => SI[id].s));
    if (!tr) ok(states.size === 3, 'stateSet covers 3 states');
    else ok(s.some(id => ['sand', 'salt', 'honey', 'soda'].indexOf(id) >= 0), 'tricky has trap item');
  });
}

/* ── ข้ออ้างของตุ๊บตุ๊บ ── */
for (let i = 0; i < N; i++) {
  for (let z = 1; z <= 4; z++) {
    const c = GEN.claim(z);
    ok(typeof c.truth === 'boolean' && c.text && c.why, 'claim shape z' + z);
    if (z === 1) ok(c.truth === MM.scratches(c.a, c.b), 'claim hard truth');
    if (z === 2) ok(c.truth === MM.isElastic(c.id), 'claim elastic truth');
    if (z === 3) ok(c.truth === (MM.heatGood(c.a) && !MM.heatGood(c.b)), 'claim heat truth');
    if (z === 4) ok(c.truth === MM.isConductor(c.id), 'claim elec truth');
  }
  const sc = GEN.stateClaim();
  ok(typeof sc.truth === 'boolean', 'state claim');
}
let t = 0, f = 0;
for (let i = 0; i < N; i++) { const c = GEN.claim(1 + (i % 4)); if (c.truth) t++; else f++; }
ok(t > N * 0.15 && f > N * 0.15, 'claims mix true/false (t=' + t + ' f=' + f + ')');

/* ── เลือกใช้วัสดุ ── */
const PROP = { 1: id => MM.hardGroup(id) === 'hard', 2: MM.isElastic, 3: MM.heatGood, 4: MM.isConductor };
const NEED = { 1: 'hard', 2: 'elastic', 3: 'heat', 4: 'elec' };
for (let z = 1; z <= 4; z++) {
  USE[z].forEach((u, i) => {
    const tag = 'USE ' + z + '#' + i;
    u.good.concat(u.bad).forEach(id => ok(ITEM[id] && ITEM[id][NEED[z] === 'hard' ? 'hard' : NEED[z]] != null, tag + ' property defined for ' + id));
    const gv = u.good.map(PROP[z]), bv = u.bad.map(PROP[z]);
    ok(gv.every(v => v === gv[0]), tag + ' good items agree');
    ok(bv.every(v => v === !gv[0]), tag + ' bad items opposite');
    ok(u.bad.length >= 2, tag + ' enough distractors');
    ok(u.good.every(g => u.bad.indexOf(g) < 0), tag + ' no overlap');
  });
  for (let i = 0; i < 500; i++) {
    const q = GEN.useQ(z, 1 + (i % 3));
    ok(q.options.length === 3 && new Set(q.options).size === 3, 'useQ 3 options z' + z);
    ok(q.options.filter(id => USE[z][q.idx].good.indexOf(id) >= 0).length === 1, 'useQ exactly one good z' + z);
    ok(q.options.indexOf(q.answer) >= 0, 'useQ answer present');
  }
}

/* ── คำอ่านไทย ── */
ok(MM.intThai(21) === 'ยี่สิบเอ็ด', 'thai 21');
ok(MM.intThai(200) === 'สองร้อย', 'thai 200');
ok(MM.speakify('น้ำ 200 มล.').indexOf('สองร้อย มิลลิลิตร') >= 0, 'speakify ml');

console.log(fails ? ('\n' + fails + ' FAILED / ' + checks + ' checks') : ('ผ่านทั้งหมด ' + checks + ' เงื่อนไข (' + N + ' รอบสุ่มต่อชนิด)'));
process.exit(fails ? 1 : 0);
