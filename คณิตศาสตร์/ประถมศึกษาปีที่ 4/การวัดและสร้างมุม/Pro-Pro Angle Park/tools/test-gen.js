/* ทดสอบตัวสร้างโจทย์และเรขาคณิต — รัน: node tools/test-gen.js */
require('../js/ap.js');
const M = globalThis.AP.M;
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL:', msg); } };

/* 1) อ่านไทย */
ok(M.intThai(35) === 'สามสิบห้า', 'intThai 35 ' + M.intThai(35));
ok(M.intThai(21) === 'ยี่สิบเอ็ด', 'intThai 21 ' + M.intThai(21));
ok(M.intThai(101) === 'หนึ่งร้อยเอ็ด', 'intThai 101 ' + M.intThai(101));
ok(M.intThai(180) === 'หนึ่งร้อยแปดสิบ', 'intThai 180 ' + M.intThai(180));
ok(M.speakify('มุม 45° ใหญ่') .includes('สี่สิบห้า องศา'), 'speakify ' + M.speakify('มุม 45° ใหญ่'));

/* 2) ทุกโจทย์วัดมุม: ตำแหน่งที่ถูกต้อง "ผ่าน" และตำแหน่งสุ่มเกือบทั้งหมด "ไม่ผ่าน" */
for (let level = 1; level <= 3; level++) {
  for (let n = 0; n < 400; n++) {
    const f = M.measureQ(level);
    ok(f.size >= 12 && f.size <= 168, 'size range ' + f.size);
    const id = M.ideals(f);
    ok(id.length >= 1, 'has ideal L' + level + ' ' + JSON.stringify(f));
    id.forEach(i => {
      const pr = { x: f.V.x + 3, y: f.V.y - 2, rot: i.rot + 1.5 };
      const c = M.checkPlacement(f, pr);
      ok(c.ok, 'ideal ok L' + level + ' ' + JSON.stringify([f, i, c]));
      ok(c.scale === i.scale || id.length > 1, 'scale ' + c.scale + ' vs ' + i.scale);
    });
    /* ย้ายไกลจากจุดยอดต้องไม่ผ่าน */
    const far = M.checkPlacement(f, { x: f.V.x + 60, y: f.V.y, rot: id[0].rot });
    ok(!far.ok && !far.posOk, 'far must fail');
    /* L1 ต้องเป็นตัวคูณ 10, L2 ตัวคูณ 5 */
    if (level === 1) ok(f.size % 10 === 0, 'L1 multiple of 10');
    if (level === 2) ok(f.size % 5 === 0, 'L2 multiple of 5');
    const ch = M.measureChoices(f.size);
    ok(new Set(ch).size === 3 && ch.includes(f.size) && ch.includes(180 - f.size), 'choices distinct ' + ch);
  }
}
/* L1: แขนที่สองต้องอยู่เหนือเส้นฐานเสมอ (ไม่ต้องคว่ำโพรแทรกเตอร์) */
for (let n = 0; n < 200; n++) {
  const f = M.measureQ(1);
  ok(f.b === 0 || f.b === 180, 'L1 flat base');
  const up = M.vec(f.e, 10).y < 0;
  ok(up, 'L1 second ray above');
}
/* 3) คว่ำโพรแทรกเตอร์ (แขนอีกข้างอยู่ใต้โค้ง) ต้องไม่ผ่าน และบอก flipped */
{
  const f = M.figure({ b: 0, dir: 1, size: 60 });
  const wrong = M.checkPlacement(f, { x: f.V.x, y: f.V.y, rot: 180 });
  ok(!wrong.ok && wrong.flipped, 'flipped detect ' + JSON.stringify(wrong));
  const good = M.checkPlacement(f, { x: f.V.x, y: f.V.y, rot: 0 });
  ok(good.ok && good.scale === 'outer', 'outer ok');
  const g2 = M.checkPlacement(f, { x: f.V.x, y: f.V.y, rot: 60 + 180 });
  ok(g2.ok && g2.scale === 'inner', 'use other ray as base ' + JSON.stringify(g2));
}
/* 4) สร้างมุม */
for (let level = 1; level <= 3; level++) {
  for (let n = 0; n < 200; n++) {
    const q = M.buildQ(level);
    const u = M.upIdeal(q.f);
    const pr = { x: q.f.V.x, y: q.f.V.y, rot: u.rot };
    ok(M.checkBase(q.f, pr).ok, 'base ok');
    /* ทำเครื่องหมายที่มุม target ตามสเกลที่ถูก แล้วต้องได้มุมเท่ากับ target */
    const g = u.scale === 'outer' ? q.f.b + q.size : q.f.b - q.size;
    const side = M.norm(g - u.rot);
    ok(side > 0 && side < 180, 'mark inside arc ' + JSON.stringify([q, u, side]));
    ok(M.builtAngle(q.f.b, g) === q.size, 'built = target ' + M.builtAngle(q.f.b, g) + ' ' + q.size);
    ok(M.scaleReading(u.rot, g, u.scale) === q.size, 'reading = target ' + M.scaleReading(u.rot, g, u.scale) + ' ' + q.size);
    /* ใช้สเกลผิดฝั่งแล้วได้ 180 - target */
    const wrongScale = u.scale === 'outer' ? 'inner' : 'outer';
    ok(M.scaleReading(u.rot, g, wrongScale) === 180 - q.size, 'wrong scale = 180-t');
  }
}
ok(M.diagBuild(50, 130) === 'wrongScale', 'diag wrongScale');
ok(M.diagBuild(50, 51) === 'ok' && M.diagBuild(50, 55) === 'close' && M.diagBuild(50, 80) === 'far', 'diagBuild');
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exit(fails ? 1 : 0);
