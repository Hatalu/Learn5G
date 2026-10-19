/* ทดสอบตัวสร้างโจทย์: node tools/test-gen.js [จำนวนตัวอย่างต่อแบบ]
   ตรวจ: สร้างได้ทุกแบบ / ตัวเลือกมีข้อถูกข้อเดียว / คำตอบถูกจริง (คำนวณใหม่แยกต่างหาก) / เสียงที่เรียกมีไฟล์ / ไม่ซ้ำข้ามวัน */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
for (const f of ['rng', 'numvoice', 'gen-core', 'gen-ladders', 'gen-misc', 'gen-plan']) vm.runInThisContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), { filename: f });
const DC = globalThis.DC, T = DC.T, Rng = DC.Rng;
const N = +process.argv[2] || 120;

const clips = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8')).clips.map(c => c.id));
const files = new Set(fs.existsSync(path.join(root, 'audio/voice')) ? fs.readdirSync(path.join(root, 'audio/voice')).map(f => f.replace('.mp3', '')) : []);

const fail = []; const small = [];
let total = 0; const distinctAll = new Set();
const num = s => parseFloat(String(s).replace(/,/g, ''));
const jsExpr = toks => toks.map(t => t === '×' ? '*' : t === '÷' ? '/' : t === '−' ? '-' : String(t).replace(/,/g, '')).join(' ');
function evalToks(toks) { try { return Function('"use strict";return (' + jsExpr(toks) + ')')(); } catch (e) { return NaN; } }
const close = (a, b) => Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(a));

function checkProblem(t, p) {
  const errs = [];
  if (!p || !p.mech) return ['no problem'];
  if (p.mech === 'choice') {
    if (!p.choices || p.choices.length < 3) errs.push('choices<3');
    else {
      const ok = p.choices.filter(c => c.ok).length;
      if (ok !== 1) errs.push('ok count ' + ok);
      const labs = p.choices.map(c => c.label);
      if (new Set(labs).size !== labs.length) errs.push('dup labels ' + labs.join('|'));
    }
  }
  if (p.mech === 'keypad' && p.answer == null) errs.push('keypad no answer');
  for (const id of (p.speak || [])) { if (!clips.has(id)) errs.push('speak id missing ' + id); else if (!files.has(id)) errs.push('speak file missing ' + id); }
  if (p.line && (!clips.has(p.line) || !files.has(p.line))) errs.push('line missing ' + p.line);
  const ex = p.expr;
  if (ex && ex.includes('=') && !ex.includes('→') && !ex.some(x => /\/|≈|เศษ/.test(String(x)))) {
    const eq = ex.indexOf('=');
    const L = ex.slice(0, eq), Rr = ex.slice(eq + 1);
    const ans = p.mech === 'choice' ? p.choices.find(c => c.ok).v : p.answer;
    if (typeof ans === 'number' || /^[\d.,]+$/.test(String(ans))) {
      const a = num(ans);
      const fill = toks => toks.map(x => x === '?' ? String(a) : x);
      const lv = evalToks(fill(L)), rv = evalToks(fill(Rr));
      if (!close(lv, rv)) errs.push('equation false: ' + ex.join(' ') + ' with ' + a + ' (' + lv + ' vs ' + rv + ')');
    }
  }
  if (p.ask === 'which' && ex && ex.length === 5 && ['<', '>', '='].includes(p.answer)) {
    const lhs = evalToks(ex.slice(0, 3)), rhs = num(ex[4]);
    const real = lhs < rhs ? '<' : lhs > rhs ? '>' : '=';
    if (real !== p.answer && !close(lhs, rhs)) errs.push('cmp wrong ' + ex.join(' '));
  }
  if (p.ask === 'which' && ex && ex.length === 3 && ['<', '>', '='].includes(p.answer) && !/\//.test(ex[0])) {
    const a = num(ex[0]), b = num(ex[2]); const real = a < b ? '<' : a > b ? '>' : '=';
    if (real !== p.answer) errs.push('cmp2 wrong ' + ex.join(' '));
  }
  if (p.ask === 'spot') {
    const bad = p.choices.filter(c => {
      const m = /^(.+) ([+−×÷]) (.+) = (.+)$/.exec(c.label); if (!m) return null;
      const v = evalToks([m[1], m[2], m[3]]); return !close(v, num(m[4]));
    });
    const okc = p.choices.filter(c => c.ok);
    if (bad.length !== 1 || okc.length !== 1 || !bad.includes(okc[0])) errs.push('spot: wrong count ' + bad.length);
  }
  if (p.mech === 'match') {
    for (const q of p.pairs) { const [a, op, b] = q.l; const v = evalToks([a, op, b]); if (!close(v, num(q.right))) errs.push('pair false ' + q.left + ' = ' + q.right); }
    if (new Set(p.pairs.map(q => q.right)).size !== p.pairs.length) errs.push('pair answers dup');
  }
  if (p.mech === 'balance') { const s = p.scene; if (s.fixed + s.need !== s.T) errs.push('balance sum'); if (!s.tiles.includes(s.need)) errs.push('balance no tile'); }
  if (p.mech === 'hops') { const h = p.scene.hop; const end = h.start + h.dir * h.size * h.n; if (!p.scene.ticks.includes(end) || end !== p.answer) errs.push('hops end ' + end + ' vs ' + p.answer); if (p.scene.ticks.length > 30) errs.push('too many ticks'); }
  if (p.mech === 'share') { if (p.scene.n % p.scene.k !== 0 || p.scene.n / p.scene.k !== p.answer) errs.push('share'); }
  if (p.mech === 'order') { const o = p.order; const ans = o.items.map(i => i.v).sort((x, y) => o.asc ? x - y : y - x).join(','); if (ans !== p.answer) errs.push('order ans'); if (new Set(o.items.map(i => i.v)).size !== o.items.length) errs.push('order dup'); }
  return errs;
}

for (const t of T) {
  const sigs = new Set();
  for (let i = 0; i < N; i++) {
    let p;
    try { p = t.gen(new Rng('test:' + t.id + ':' + i)); } catch (e) { fail.push(t.id + ' THROW ' + e.message); break; }
    total++;
    const errs = checkProblem(t, p);
    if (errs.length) { fail.push(t.id + ' :: ' + errs[0] + '  [' + (p.exp || '') + ']'); break; }
    sigs.add(p.sig); distinctAll.add(p.sig);
  }
  if (sigs.size < Math.min(N, 12)) small.push(t.id + '=' + sigs.size);
}

const st = DC.plan.stats();
console.log('แบบโจทย์ทั้งหมด:', st.total, '| ตามการดำเนินการ', JSON.stringify(st.byOp), '| ตามรูปแบบ', JSON.stringify(st.byFmt), '| ตามชั้น', JSON.stringify(st.byGrade));
console.log('ตัวอย่างที่สร้าง', total, ' ไม่ซ้ำกัน', distinctAll.size);
console.log('แบบที่ space เล็ก (<12 ข้อไม่ซ้ำใน ' + N + ' ตัวอย่าง):', small.length ? small.join(' ') : 'ไม่มี');
console.log('ผิดพลาด:', fail.length); fail.slice(0, 60).forEach(f => console.log('  ' + f));

/* จำลองเล่นทุกวัน 40 วัน × 6 ชั้น */
let tot = 0, sameNext = 0, planFails = 0;
for (let G = 1; G <= 6; G++) {
  const seen = new Set(), recent = {}; let prev = new Set();
  for (let day = 0; day < 40; day++) {
    const run = DC.plan.newRun({ grade: G, seed: 'D' + (20261019 + day), dayIndex: 1000 + day, recentT: recent, seen });
    const today = new Set();
    for (let i = 0; i < 8; i++) {
      const p = run.next(i); const e = checkProblem({}, p);
      if (e.length) { planFails++; console.log('  PLAN FAIL g' + G + ' d' + day + ' ' + p.tid + ' ' + e[0]); }
      tot++; today.add(p.tid); recent[p.tid] = 1000 + day; run.report({ clean: (i % 3) !== 0 });
    }
    for (const x of today) if (prev.has(x)) sameNext++;
    prev = today;
  }
}
console.log('จำลอง 40 วัน × 6 ชั้น =', tot, 'ข้อ | แบบโจทย์เดียวกับวันก่อนหน้า:', sameNext, 'ครั้ง | ข้อผิดในแผน:', planFails);
process.exit(fail.length || planFails ? 1 : 0);
