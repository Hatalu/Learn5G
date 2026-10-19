/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — จัดชุดโจทย์ประจำวัน (วันละ 8 ข้อ ปรับตามชั้นและฝีมือ)
   - วันเดียวกัน + ชั้นเดียวกัน = ชุดโจทย์เดียวกัน (seed จากวันที่) ห้องเรียนคุยกันได้
   - ข้ามวัน: เลี่ยงแบบโจทย์ที่เพิ่งใช้ และเลี่ยงข้อที่เคยเจอ (จำ signature ไว้ในเครื่อง)
   - เล่นรอบพิเศษ: seed สุ่มใหม่
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const T = DC.T;
  const Rng = DC.Rng;

  /* ค่าที่ใช้คัดเลือก: ระดับ (lv) และกลไกการเล่น (mech) ของแต่ละแบบโจทย์ */
  for (const t of T) {
    t.lv = (t.g - 1) * 3 + t.d;
    t.mech = t.fmt === 'K' ? 'keypad' : t.fmt === 'H' ? 'hops' : t.fmt === 'B' ? 'balance' : t.fmt === 'P' ? 'match' : t.fmt === 'O' ? 'order' : (t.fmt === 'S' && t.op === 'div') ? 'share' : 'choice';
  }

  const OPS = ['add', 'sub', 'mul', 'div'];
  const catOf = t => (OPS.includes(t.op) ? t.op : 'misc');

  /* หมวดโจทย์ของแต่ละช่อง (ช่องแรกง่าย ช่องสุดท้ายคือด่านบอส) */
  function slotCats(G, rng) {
    let mid;
    if (G === 1) mid = ['add', 'sub', 'misc', 'add', 'sub', 'misc'];
    else if (G === 2) mid = ['sub', 'misc', 'mul', 'add', 'sub', 'misc'];
    else if (G === 3) mid = ['sub', 'mul', 'div', 'misc', 'mul', 'div'];
    else mid = ['sub', 'mul', 'div', 'misc', 'mul', 'div'];
    mid = rng.shuffle(mid);
    const first = 'add';
    const boss = G === 1 ? rng.pick(['add', 'sub']) : rng.pick(G >= 3 ? ['mul', 'div', 'misc'] : ['mul', 'add', 'sub']);
    return [first].concat(mid, [boss]);
  }
  const RAMP = [-2, -1, 0, 0, 0, 1, 1, 1];

  function stats() {
    const s = { total: T.length, byOp: {}, byFmt: {}, byGrade: {}, families: {} };
    for (const t of T) {
      s.byOp[t.op] = (s.byOp[t.op] || 0) + 1;
      s.byFmt[t.fmt] = (s.byFmt[t.fmt] || 0) + 1;
      s.byGrade[t.g] = (s.byGrade[t.g] || 0) + 1;
      const fam = t.family || t.op; s.families[fam] = (s.families[fam] || 0) + 1;
    }
    return s;
  }

  /* opts: { grade, seed (string), dayIndex, recentT: {tid: dayIndex}, seen: Set/Array of signature, rounds } */
  function newRun(opts) {
    const G = Math.max(1, Math.min(6, opts.grade | 0 || 1));
    const rounds = opts.rounds || 8;
    const rng = new Rng('run:' + opts.seed + ':g' + G);
    const cats = slotCats(G, rng);
    const seen = new Set(opts.seen || []);
    const recent = opts.recentT || {};
    const dayIdx = opts.dayIndex == null ? 0 : opts.dayIndex;
    const used = new Set();
    const st = { offset: 0, lastMech: null, lastFmt: null, picks: [], good: 0, bad: 0 };
    const mid = (G - 1) * 3 + 2;

    function score(t, target, i) {
      let sc = Math.abs(t.lv - target) * 2.2;
      const since = dayIdx - (recent[t.id] == null ? -99 : recent[t.id]);
      if (since < 5) sc += (5 - since) * 1.4;
      if (t.fmt === st.lastFmt) sc += 1.2;
      if (t.mech === st.lastMech) sc += 0.8;
      if (i <= 1 && !['D', 'K', 'M', 'S'].includes(t.fmt) && t.family === 'ladder') sc += 3.2;   // สองข้อแรกเริ่มด้วยแบบง่าย ๆ ก่อน
      if (t.fmt === 'P' && i === 0) sc += 3;                // ข้อแรกไม่ใช้จับคู่ (ยาวไป)
      if (t.fmt === 'P' && i === rounds - 1) sc += 1.5;
      return sc;
    }
    function lvOf(t) { return (t.g - 1) * 3 + t.d; }

    function pick(i) {
      const cat = cats[Math.min(i, cats.length - 1)];
      const target = Math.max(1, Math.min(18, mid + (RAMP[Math.min(i, RAMP.length - 1)]) + st.offset));
      let cands = T.filter(t => catOf(t) === cat && !used.has(t.id) && t.lv <= target + 1 && t.lv >= target - 2 && t.g <= Math.min(6, G + 1));
      if (!cands.length) cands = T.filter(t => catOf(t) === cat && !used.has(t.id) && t.g <= G);
      if (!cands.length) cands = T.filter(t => !used.has(t.id) && t.g <= G);
      const fork = rng.fork('slot' + i);
      let best = null, bs = 1e9;
      for (const t of cands) {
        const sc = score(t, target, i) + fork.next() * 2.6;
        if (sc < bs) { bs = sc; best = t; }
      }
      return best;
    }

    return {
      G, rounds, cats, state: st,
      next(i) {
        const t = pick(i);
        let p = null;
        for (let k = 0; k < 8; k++) {                       // เลี่ยงข้อที่เคยเจอ
          const r = new Rng(opts.seed + ':' + G + ':' + i + ':' + t.id + ':' + k);
          p = t.gen(r);
          if (!seen.has(p.sig)) break;
        }
        used.add(t.id); seen.add(p.sig);
        st.lastMech = p.mech; st.lastFmt = p.fmt; st.picks.push(t.id);
        p.round = i; p.final = i === rounds - 1;
        return p;
      },
      /* ผลข้อล่าสุด: clean = ถูกตั้งแต่ครั้งแรกโดยไม่ใช้คำใบ้ */
      report(res) {
        if (res.clean) { st.good++; st.bad = 0; if (st.good >= 2) { st.offset = Math.min(2, st.offset + 1); st.good = 0; } }
        else { st.bad++; st.good = 0; if (st.bad >= 2) { st.offset = Math.max(-2, st.offset - 1); st.bad = 0; } }
      }
    };
  }

  DC.plan = { newRun, stats, catOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
