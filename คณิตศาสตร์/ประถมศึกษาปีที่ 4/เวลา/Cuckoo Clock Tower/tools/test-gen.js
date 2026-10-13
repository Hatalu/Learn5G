/* ทดสอบตัวสร้างโจทย์ (ไม่ต้องใช้เบราว์เซอร์): node tools/test-gen.js */
global.window = global;
require('../js/tm.js');
const T = global.CT.T;
let bad = 0, n = 0;
const fail = (what, o) => { bad++; if (bad < 25) console.log('FAIL', what, JSON.stringify(o)); };

/* คำอ่านไทย */
const reads = [
  [0, 'ศูนย์'], [1, 'หนึ่ง'], [11, 'สิบเอ็ด'], [21, 'ยี่สิบเอ็ด'], [60, 'หกสิบ'], [101, 'หนึ่งร้อยเอ็ด'], [365, 'สามร้อยหกสิบห้า'],
  [1440, 'หนึ่งพันสี่ร้อยสี่สิบ'], [3600, 'สามพันหกร้อย'], [10000, 'หนึ่งหมื่น'], [86400, 'แปดหมื่นหกพันสี่ร้อย'], [1000001, 'หนึ่งล้านเอ็ด']
];
reads.forEach(([k, s]) => { n++; if (T.intThai(k) !== s) fail('intThai ' + k, T.intThai(k)); });
const clocks = [[9, 30, 'เก้านาฬิกาสามสิบนาที'], [13, 0, 'สิบสามนาฬิกา'], [10, 5, 'สิบนาฬิกาห้านาที'], [12, 0, 'สิบสองนาฬิกา'], [21, 21, 'ยี่สิบเอ็ดนาฬิกายี่สิบเอ็ดนาที']];
clocks.forEach(([h, m, s]) => { n++; if (T.clockRead(h, m) !== s) fail('clock ' + h + ':' + m, T.clockRead(h, m)); });
n++; if (T.speakify('รถออก 09.05 น. ใช้เวลา 2 ชั่วโมง 15 นาที') !== 'รถออก  เก้านาฬิกาห้านาที  ใช้เวลา สอง ชั่วโมง สิบห้า นาที') fail('speakify', T.speakify('รถออก 09.05 น. ใช้เวลา 2 ชั่วโมง 15 นาที'));
n++; if (T.speakify('1,440 นาที') !== 'หนึ่งพันสี่ร้อยสี่สิบ นาที') fail('speakify comma', T.speakify('1,440 นาที'));

const val = p => T.inBase(p);
for (let lv = 1; lv <= 3; lv++) {
  for (let i = 0; i < 4000; i++) {
    /* convert */
    n++;
    const c = T.genConvert(lv, Object.keys(T.PAIRS));
    const f = c.pair.f;
    if (c.to.length === 1) {
      const u = c.to[0];
      const want = val(c.from) / (u === c.pair.small ? 1 : f) / (T.kindOf(u) === 'mo' ? T.MOS[u] : T.SECS[u]) * (T.kindOf(u) === 'mo' ? T.MOS[u] : T.SECS[u]);
      const inTo = val(c.from) / (T.kindOf(u) === 'mo' ? T.MOS[u] : T.SECS[u]);
      if (inTo !== c.ans[0] || !Number.isInteger(inTo)) fail('convert1 L' + lv, c);
    } else {
      const total = c.ans[0] * (T.kindOf(c.to[0]) === 'mo' ? T.MOS[c.to[0]] : T.SECS[c.to[0]]) + c.ans[1] * (T.kindOf(c.to[1]) === 'mo' ? T.MOS[c.to[1]] : T.SECS[c.to[1]]);
      if (total !== val(c.from) || c.ans[1] >= f || c.ans[1] < 1) fail('convert2 L' + lv, c);
    }
    /* span */
    n++;
    const s = T.genSpan(lv);
    if (s.end - s.start !== s.dur || s.end > 24 * 60 || s.start < 6 * 60) fail('span range', s);
    const a = s.ans[0] * 60 + s.ans[1];
    if ((s.mode === 'dur' && a !== s.dur) || (s.mode === 'end' && a !== s.end) || (s.mode === 'start' && a !== s.start)) fail('span ans', s);
    /* compare */
    n++;
    const cm = T.genCompare(lv);
    const real = Math.sign(val(cm.a) - val(cm.b));
    if (real !== cm.c || T.kindOf(cm.a[0].u) !== T.kindOf(cm.b[0].u)) fail('compare L' + lv, cm);
    if (cm.a.some(p => p.n <= 0) && T.clean(cm.a).length === 0) fail('compare zero', cm);
    /* order */
    n++;
    const od = T.genOrder(lv);
    const bases = od.cards.map(x => val(x.parts));
    if (new Set(bases).size !== bases.length) fail('order dup', od);
    if (od.cards.some((x, k) => x.base !== val(x.parts))) fail('order base', od);
    /* eq */
    n++;
    const eq = T.genEq(lv);
    if (!eq) fail('eq null L' + lv, {}); else {
      const goods = eq.cards.filter(x => x.ok).length;
      if (goods < 2 || eq.cards.some(x => (val(x.parts) === val(eq.target)) !== x.ok)) fail('eq', eq);
    }
    /* cal */
    n++;
    const cl = T.genCal(lv);
    if (cl.target < 1 || cl.target > cl.days || cl.today + cl.dir * cl.step !== cl.target) fail('cal', cl);
    if (lv === 1 && cl.step % 7) fail('cal L1 week', cl);
    /* table */
    n++;
    const tb = T.genTable(lv);
    for (let k = 0; k < tb.rows.length; k++) {
      const r = tb.rows[k];
      if (r.arr - r.dep !== r.dur || (k && r.dep <= tb.rows[k - 1].dep) || r.arr > 24 * 60) fail('table row', tb);
    }
    ['read', 'dur', 'next', 'before', 'fastest', 'slowest'].forEach(kind => {
      const q = T.tableQuestion(tb, kind);
      if (!q) return;
      n++;
      if (kind === 'next') {
        const first = tb.rows.find(r => r.dep >= q.t0);
        if (!first || first.no !== q.row || first.dep - q.t0 !== q.wait || q.wait <= 0) fail('next', { tb, q });
        if (tb.rows.some(r => r.dep === q.t0)) fail('next equal', { tb, q });
      }
      if (kind === 'before') {
        const g = tb.rows.filter(r => r.arr < q.D).map(r => r.no);
        if (JSON.stringify(g) !== JSON.stringify(q.good) || !g.length || g.length === tb.rows.length) fail('before', { tb, q });
      }
      if (kind === 'fastest') { const m = Math.min(...tb.rows.map(r => r.dur)); if (tb.rows.find(r => r.no === q.row).dur !== m) fail('fastest', { tb, q }); }
      if (kind === 'slowest') { const m = Math.max(...tb.rows.map(r => r.dur)); if (tb.rows.find(r => r.no === q.row).dur !== m) fail('slowest', { tb, q }); }
    });
    /* plan */
    n++;
    const pl = T.genPlan(lv);
    if (!pl) fail('plan null', lv); else {
      pl.sols.forEach(sol => { const sum = sol.reduce((a, id) => a + pl.cards.find(c => c.id === id).dur, 0); if (sum !== pl.target) fail('plan sum', pl); });
      if (pl.end >= 24 * 60) fail('plan end', pl);
    }
    /* stories */
    n++;
    const es = T.genEndStory(lv);
    if (es.end !== es.start + es.dur || es.end >= 24 * 60) fail('endstory', es);
    const bw = T.genBackward(lv);
    if (bw.start !== bw.D - bw.a - bw.b || bw.start < 6 * 60) fail('backward', bw);
    const df = T.genDiffStory();
    if (!df || df.diff <= 0 || df.longer !== (df.a > df.b ? 'a' : 'b')) fail('diff', df);
  }
}
console.log(n + ' checks, ' + bad + ' failures');
process.exit(bad ? 1 : 0);
