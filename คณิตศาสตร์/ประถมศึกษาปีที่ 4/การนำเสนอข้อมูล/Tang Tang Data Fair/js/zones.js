/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — ซุ้มทั้ง 6 และภารกิจ (gen = ฟังก์ชันสุ่มโจทย์ใหม่ทุกครั้ง)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT;
  const D = TT.DATA;
  const { int, pick, shuffle, sample, sum, mkChart, withVals, qTick, qRead, qExtreme, qDiff, qSum, qOrder, qTF, qStep, qBarOfValue,
    mkTable, tCell, tRowTot, tColTot, tGrand, tRowTop, tColTop, tColDiff, tFill, POOLS, ordIdx } = D;

  /* คู่ดัชนีสองแท่งที่ไม่เท่ากัน (ข้อมูลสุ่มไม่ซ้ำกันอยู่แล้ว) */
  const two = s => sample(s.cats.map((_, i) => i), 2);
  const bigSmall = s => { const [a, b] = two(s); return s.vals[a] > s.vals[b] ? [a, b] : [b, a]; };

  /* ── แผนภูมิ: ภารกิจประเภทตอบคำถาม ── */
  const quiz = (s, qs, extra) => Object.assign({ type: 'quiz', spec: s, qs }, extra || {});

  /* ── แผนภูมิ: ภารกิจสร้าง ── */
  function labelQs(s) {
    const others = POOLS.filter(p => p.id !== s.pool);
    const o3 = sample(others, 2);
    return [
      { key: 'title', q: 'ตั้งชื่อแผนภูมิว่าอะไรดี?', options: shuffle([s.title].concat(o3.map(p => p.title))), ans: s.title, why: 'ชื่อแผนภูมิต้องบอกเรื่องของข้อมูล คือ "' + s.title + '"' },
      { key: 'x', q: 'แกนนอนบอกชื่อรายการ เขียนว่าอะไรดี?', options: shuffle([s.xLabel, s.yLabel, o3[0].x]), ans: s.xLabel, why: 'แกนนอนเป็นชื่อรายการของข้อมูล คือ "' + s.xLabel + '"' },
      { key: 'y', q: 'แกนตั้งบอกจำนวน เขียนว่าอะไรดี?', options: shuffle([s.yLabel, s.xLabel, o3[1].y]), ans: s.yLabel, why: 'แกนตั้งบอกจำนวน คือ "' + s.yLabel + '"' }
    ];
  }
  function gBuild(o) {
    const base = o.truth || o.scale;
    const s = mkChart({ n: o.n, scale: base, vmin: o.vmin, vmax: o.vmax, step: o.step, halves: o.halves || 0, pool: o.pool });
    let init = null;
    if (o.fix) {
      init = s.vals.slice();
      sample(s.vals.map((_, i) => i), o.fix).forEach(i => {
        const d = pick([1, 2]) * base * pick([-1, 1]);
        let nv = s.vals[i] + d;
        if (nv < base || nv > s.max) nv = s.vals[i] + (d > 0 ? -d : -d);
        if (nv < base || nv > s.max || nv === s.vals[i]) nv = s.vals[i] + base <= s.max ? s.vals[i] + base : s.vals[i] - base;
        init[i] = nv;
      });
    }
    return {
      type: 'build', spec: s, init, preScale: o.chooseScale ? null : o.scale, chooseScale: o.chooseScale || null, truth: base,
      askLabels: !!o.askLabels, labelQs: o.askLabels ? labelQs(s) : null, snap: o.snap || base, prompt: o.prompt, intro: o.intro,
      hints: o.hints || ['ดูตารางข้อมูลด้านข้าง แล้วลากแต่ละแท่งให้สูงตามจำนวน', 'แกนตั้งนับทีละ ' + o.scale + ' ลากยอดแท่งไปให้ตรงกับเลขที่ต้องการ', 'แท่งที่ยังไม่ตรงถูกเน้นไว้แล้ว ลองปรับดู']
    };
  }

  /* ── ตาราง: ผลรวมของแต่ละหลักเป็นพหุคูณของ scale (ใช้สร้างแผนภูมิจากตาราง) ── */
  function mkTableTotals(scale) {
    const ctx = pick(D.TCTX.filter(c => c.cols.length >= 3 && c.rows.length >= 2));
    const rows = ctx.rows.slice(0, 2);
    const cols = sample(ctx.cols, 3);
    const tots = sample([2, 3, 4, 5].map(k => k * scale), 3);
    const cells = rows.map(() => []);
    tots.forEach((t, j) => {
      let a, b, tries = 0;
      do { a = int(Math.max(2, t - 13), Math.min(13, t - 2)); b = t - a; tries++; } while ((a === b || b < 2 || b > 13) && tries < 50);
      cells[0][j] = a; cells[1][j] = b;
    });
    return { ctx, title: ctx.title, corner: ctx.corner, colHead: ctx.colHead, unit: ctx.unit, rows, cols, cells };
  }
  const chartOfCols = tb => {
    const t = TT.chart.tableSums(tb).ct;
    const mx = Math.max.apply(null, t);
    const scale = 5;
    return { title: tb.title + ' (รวมสองแถว)', xLabel: tb.colHead, yLabel: 'จำนวน (' + tb.unit + ')', unit: tb.unit, verb: 'มี', which: tb.colHead + 'ใด', cats: tb.cols, vals: t, scale, max: Math.max(Math.ceil(mx / scale) * scale, scale * 4), pool: 'tbl' };
  };

  /* ═══════════ ซุ้มทั้งหมด ═══════════ */
  const ZONES = [
    /* ───────── 1 ลานนับนับ : ส่วนประกอบ + อ่านค่าแท่ง ───────── */
    {
      id: 1, name: 'ลานนับนับ', booth: 'tally', voice: 'z1', music: 'play',
      learn: 'บอกส่วนประกอบของแผนภูมิแท่ง และอ่านค่าของแท่งจากแกนตั้ง',
      tasks: [
        { tag: 'ภารกิจ 1', title: 'รู้จักแผนภูมิแท่ง', gen() {
          const s = mkChart({ n: 4, scale: 1, vmin: 2, vmax: 8 });
          const top = ordIdx(s, true)[0];
          return { type: 'parts', spec: s, asks: [
            { part: 'title', prompt: 'แตะ "ชื่อแผนภูมิ" ที่อยู่ด้านบน', why: 'ชื่อแผนภูมิบอกว่าเป็นเรื่องอะไร: ' + s.title },
            { part: 'yaxis', prompt: 'แตะ "แกนตั้ง" คือเลขที่อยู่ด้านซ้าย', why: 'แกนตั้งบอกจำนวน ยิ่งสูงยิ่งมาก' },
            { part: 'xaxis', prompt: 'แตะ "แกนนอน" คือชื่อรายการด้านล่าง', why: 'แกนนอนบอกว่าแต่ละแท่งคืออะไร' },
            { part: 'bar', idx: top, prompt: 'แตะ "แท่ง" ที่สูงที่สุด', why: 'แท่ง' + s.cats[top].n + 'สูงที่สุด เพราะ' + s.verb + 'มากที่สุด' }
          ], hints: ['มองหาส่วนที่ชื่อตรงกับโจทย์', 'ส่วนที่ถูกต้องกะพริบแล้ว', 'แตะที่ส่วนที่กะพริบได้เลย'] };
        } },
        { tag: 'ภารกิจ 2', title: 'อ่านค่าจากแกนตั้ง', gen() {
          const s = mkChart({ n: 4, scale: 1, vmin: 2, vmax: 9 });
          const [a, b, c] = sample(s.cats.map((_, i) => i), 3);
          return quiz(s, [qTick(s, a), qTick(s, b), qTick(s, c)]);
        } },
        { tag: 'ภารกิจ 3', title: 'ใครมาก ใครน้อย', gen() {
          const s = mkChart({ n: 5, scale: 1, vmin: 2, vmax: 9 });
          return quiz(s, [qExtreme(s, true, 'bar'), qExtreme(s, false, 'bar')]);
        } },
        { tag: 'ภารกิจ 4', title: 'แกนตั้งนับทีละ 2', gen() {
          const s = mkChart({ n: 4, scale: 2, vmin: 2, vmax: 12 });
          const [a, b, c] = sample(s.cats.map((_, i) => i), 3);
          return quiz(s, [qTick(s, a), qRead(s, b), qRead(s, c)]);
        } }
      ],
      bonus: { tag: 'ท้าทาย', title: 'แกนตั้งนับทีละ 2 (ครึ่งช่อง)', gen() {
        const s = mkChart({ n: 4, scale: 2, vmin: 2, vmax: 12, halves: 2 });
        const odd = s.vals.map((v, i) => v % 2 ? i : -1).filter(i => i >= 0);
        return quiz(s, [qRead(s, odd[0]), qRead(s, odd[1] != null ? odd[1] : odd[0])]);
      } },
      easy: { tag: 'ซ้อมเพิ่ม', title: 'อ่านค่าแท่งสบาย ๆ', gen() {
        const s = mkChart({ n: 3, scale: 1, vmin: 2, vmax: 7 });
        return quiz(s, [qTick(s, 0), qRead(s, 1), qRead(s, 2)]);
      } },
      book: [['ส่วนประกอบ', 'แผนภูมิแท่งมี ชื่อแผนภูมิ แกนนอน แกนตั้ง และแท่ง'], ['แกนนอน', 'บอกชื่อรายการของข้อมูล เช่น ชนิดผลไม้'], ['แกนตั้ง', 'บอกจำนวน เริ่มนับจาก 0 ขึ้นไปเรื่อย ๆ'], ['อ่านค่า', 'ดูยอดแท่งแล้วไล่สายตาไปที่แกนตั้ง แท่งยิ่งสูงยิ่งมีจำนวนมาก']],
      teacher: ['ถ้าไม่มีแกนตั้ง เราจะรู้จำนวนได้หรือไม่ เพราะอะไร', 'แท่งที่สูงกว่าแปลว่าอะไร']
    },

    /* ───────── 2 ร้านเปรียบเทียบ : ผลต่าง ผลรวม จริง/ไม่จริง เรียงลำดับ ───────── */
    {
      id: 2, name: 'ร้านเปรียบเทียบ', booth: 'compare', voice: 'z2', music: 'play',
      learn: 'อ่านแผนภูมิเพื่อเปรียบเทียบ หาผลต่าง ผลรวม และเรียงลำดับข้อมูล',
      tasks: [
        { tag: 'ภารกิจ 1', title: 'มากกว่ากี่', gen() {
          const s = mkChart({ n: 4, scale: 1, vmin: 2, vmax: 10 });
          const [a, b] = bigSmall(s);
          const rest = s.cats.map((_, i) => i).filter(i => i !== a && i !== b);
          const x = rest[0], y = rest[1];
          const [c, d] = s.vals[x] > s.vals[y] ? [x, y] : [y, x];
          return quiz(s, [qDiff(s, a, b), qDiff(s, c, d)]);
        } },
        { tag: 'ภารกิจ 2', title: 'รวมกันเท่าไร', gen() {
          const s = mkChart({ n: 3, scale: 1, vmin: 2, vmax: 9 });
          const [a, b] = two(s);
          return quiz(s, [qSum(s, [a, b]), qSum(s, s.cats.map((_, i) => i))]);
        } },
        { tag: 'ภารกิจ 3', title: 'จริงหรือไม่จริง', gen() {
          const s = mkChart({ n: 4, scale: 2, vmin: 2, vmax: 14 });
          return quiz(s, [qTF(s, 'most'), qTF(s, 'more'), qTF(s, 'val')], { showValsOnHint: true });
        } },
        { tag: 'ภารกิจ 4', title: 'เรียงแท่ง', gen() {
          const s = mkChart({ n: 4, scale: 2, vmin: 2, vmax: 14 });
          return quiz(s, [qOrder(s, true), qOrder(s, false)]);
        } },
        { tag: 'ภารกิจ 5', title: 'แกนตั้งนับทีละ 5', gen() {
          const s = mkChart({ n: 4, scale: 5, vmin: 10, vmax: 40 });
          const [a, b] = bigSmall(s);
          const [c, d] = two(s);
          return quiz(s, [qRead(s, c), qDiff(s, a, b), qSum(s, [d, c === d ? a : c])]);
        } }
      ],
      bonus: { tag: 'ท้าทาย', title: 'ผลต่างของ 3 แท่ง', gen() {
        const s = mkChart({ n: 5, scale: 5, vmin: 10, vmax: 45 });
        const ord = ordIdx(s, true);
        return quiz(s, [qDiff(s, ord[0], ord[ord.length - 1]), qSum(s, [ord[0], ord[1], ord[2]])]);
      } },
      easy: { tag: 'ซ้อมเพิ่ม', title: 'เปรียบเทียบสบาย ๆ', gen() {
        const s = mkChart({ n: 3, scale: 1, vmin: 2, vmax: 8 });
        const [a, b] = bigSmall(s);
        return quiz(s, [qExtreme(s, true, 'bar'), qDiff(s, a, b)]);
      } },
      book: [['มากกว่า / น้อยกว่า', 'แท่งสูงกว่าแปลว่ามีมากกว่า เปรียบเทียบความสูงได้เลย'], ['ผลต่าง', 'อ่านค่าของสองแท่ง แล้วนำมาลบกัน'], ['ผลรวม', 'อ่านค่าของแท่งที่ต้องการ แล้วนำมาบวกกัน'], ['เรียงลำดับ', 'เรียงจากแท่งสูงสุดไปต่ำสุด หรือต่ำสุดไปสูงสุดได้']],
      teacher: ['ถ้าแท่งสองแท่งสูงเท่ากัน จะเปรียบเทียบอย่างไร', 'อ่านค่าผิดไป 1 ช่อง ผลต่างจะเปลี่ยนอย่างไร']
    },

    /* ───────── 3 ลานหาช่อง : มาตราส่วนของแกนตั้ง (ไม่ย่นระยะ) ───────── */
    {
      id: 3, name: 'ลานหาช่อง', booth: 'scale', voice: 'z3', music: 'play',
      learn: 'บอกได้ว่าแกนตั้งแต่ละช่องมีค่าเท่าไร และอ่านค่าแท่งที่อยู่ระหว่างช่อง',
      tasks: [
        { tag: 'ภารกิจ 1', title: 'ช่องละเท่าไร', gen() {
          const mk = sc => mkChart({ n: 3, scale: sc, vmin: sc * 2, vmax: sc * 6 });
          const sA = mk(2), sB = mk(5), sC = mk(10);
          return quiz(sA, [qStep(sA, 2), qStep(sB, 5), qStep(sC, 10)], { noSpec: true });
        } },
        { tag: 'ภารกิจ 2', title: 'อ่านค่าช่องละ 5', gen() {
          const s = mkChart({ n: 4, scale: 5, vmin: 5, vmax: 35 });
          const [a, b, c] = sample(s.cats.map((_, i) => i), 3);
          return quiz(s, [qTick(s, a), qRead(s, b), qRead(s, c)]);
        } },
        { tag: 'ภารกิจ 3', title: 'ยอดแท่งอยู่ระหว่างช่อง', gen() {
          const s = mkChart({ n: 4, scale: 10, vmin: 10, vmax: 60, halves: 2 });
          const mid = s.vals.map((v, i) => v % 10 ? i : -1).filter(i => i >= 0);
          const q1 = qRead(s, mid[0]), q2 = qRead(s, mid.length > 1 ? mid[1] : mid[0]);
          q1.hints[0] = 'ยอดแท่งอยู่ระหว่างสองเลข ลองคิดว่ากึ่งกลางคือเลขอะไร';
          return quiz(s, [q1, q2]);
        } },
        { tag: 'ภารกิจ 4', title: 'แกนตั้งนับทีละ 20', gen() {
          const s = mkChart({ n: 4, scale: 20, vmin: 20, vmax: 100, halves: 2 });
          const a = s.vals.findIndex(v => v % 20);
          const [i, j] = bigSmall(s);
          return quiz(s, [qRead(s, a >= 0 ? a : 0), qDiff(s, i, j)]);
        } },
        { tag: 'ภารกิจ 5', title: 'หาแท่งที่ใช่', gen() {
          const s = mkChart({ n: 4, scale: 5, vmin: 5, vmax: 35 });
          const [a, b] = two(s);
          return quiz(s, [qBarOfValue(s, a), qBarOfValue(s, b)]);
        } }
      ],
      bonus: { tag: 'ท้าทาย', title: 'ช่องละ 10 ครึ่งช่อง', gen() {
        const s = mkChart({ n: 5, scale: 10, vmin: 10, vmax: 70, halves: 3 });
        const mid = s.vals.map((v, i) => v % 10 ? i : -1).filter(i => i >= 0);
        const [i, j] = bigSmall(s);
        return quiz(s, [qRead(s, mid[0]), qDiff(s, i, j)]);
      } },
      easy: { tag: 'ซ้อมเพิ่ม', title: 'ช่องละเท่าไร (ซ้อม)', gen() {
        const s = mkChart({ n: 3, scale: 2, vmin: 2, vmax: 10 });
        const s2 = mkChart({ n: 3, scale: 5, vmin: 5, vmax: 25 });
        return quiz(s, [qStep(s, 2), qStep(s2, 5)], { noSpec: true });
      } },
      book: [['ช่องละเท่าไร', 'ดูเลขสองช่องที่อยู่ติดกัน แล้วลบกัน จะรู้ว่าแกนตั้งนับทีละเท่าไร'], ['แกนตั้งเริ่มที่ 0', 'แกนตั้งในแผนภูมิของเราเริ่มนับที่ 0 เสมอ ไม่ข้ามช่อง'], ['อยู่ระหว่างช่อง', 'ถ้ายอดแท่งอยู่กึ่งกลางระหว่างสองเลข ค่าที่ได้คือครึ่งหนึ่งของช่อง บวกกับเลขที่ต่ำกว่า'], ['อ่านย้อนกลับ', 'ถ้ารู้ค่า เราหาแท่งที่ยอดตรงกับค่านั้นได้']],
      teacher: ['ทำไมก่อนอ่านค่าต้องดูก่อนว่าแกนตั้งนับทีละเท่าไร', 'ถ้ายอดแท่งอยู่กึ่งกลางระหว่าง 30 กับ 40 ค่าคือเท่าไร']
    },

    /* ───────── 4 โรงงานสร้างแท่ง : การเขียนแผนภูมิแท่ง ───────── */
    {
      id: 4, name: 'โรงงานสร้างแท่ง', booth: 'factory', voice: 'z4', music: 'play',
      learn: 'เขียนแผนภูมิแท่งจากข้อมูล: เลือกช่องแกนตั้ง ลากแท่งให้สูงถูก และตั้งชื่อ',
      tasks: [
        { tag: 'ภารกิจ 1', title: 'สร้างแผนภูมิ (ช่องละ 1)', gen: () => gBuild({ scale: 1, n: 4, vmin: 2, vmax: 8, askLabels: true,
          prompt: 'ตั้งชื่อให้แผนภูมิ แล้วลากแต่ละแท่งให้สูงตามข้อมูลในตาราง' }) },
        { tag: 'ภารกิจ 2', title: 'สร้างแผนภูมิ (ช่องละ 2)', gen: () => gBuild({ scale: 2, n: 4, vmin: 2, vmax: 12,
          prompt: 'แกนตั้งนับทีละ 2 ลากแต่ละแท่งให้สูงตามข้อมูลในตาราง' }) },
        { tag: 'ภารกิจ 3', title: 'เลือกช่องให้พอดี', gen: () => gBuild({ truth: 10, chooseScale: [1, 10, 100], n: 4, vmin: 20, vmax: 70,
          prompt: 'ข้อมูลมีค่ามาก เลือกแกนตั้งที่นับทีละเท่าไรถึงจะพอดี แล้วสร้างแท่งตามข้อมูล',
          hints: ['ดูแผนภูมิตัวอย่างทั้ง 3 แบบ แบบไหนอ่านง่ายและแท่งไม่เล็กเกินไป', 'ค่ามากสุดในตารางอยู่ราว 70 ถ้าช่องละ 1 จะมีเส้นเยอะเกินไป', 'ช่องละ 10 ทำให้แท่งทุกแท่งตรงกับเส้นพอดี'] }) },
        { tag: 'ภารกิจ 4', title: 'แก้แท่งที่ผิด', gen: () => gBuild({ scale: 5, n: 4, vmin: 10, vmax: 35, fix: 2,
          prompt: 'มึนมึนแอบแก้แท่งผิดไป 2 แท่ง ดูตารางที่ถูกต้อง แล้วลากแก้ให้ตรง',
          hints: ['เทียบยอดแต่ละแท่งกับตัวเลขในตารางทีละแท่ง', 'แกนตั้งนับทีละ 5 ลากยอดแท่งไปให้ตรงกับเส้น', 'แท่งที่ยังไม่ตรงถูกเน้นไว้แล้ว'] }) }
      ],
      bonus: { tag: 'ท้าทาย', title: 'สร้างแท่งครึ่งช่อง', gen: () => gBuild({ scale: 2, n: 4, vmin: 2, vmax: 12, halves: 2, snap: 1,
        prompt: 'บางแท่งอยู่กึ่งกลางระหว่างเส้น ลากให้ยอดแท่งอยู่ตรงกลางช่อง',
        hints: ['ค่าคี่ในช่องละ 2 อยู่กึ่งกลางระหว่างเส้น', 'ลองลากช้า ๆ เลขที่ลากถึงจะแสดงให้ดู', 'แท่งที่ยังไม่ตรงถูกเน้นไว้แล้ว'] }) },
      easy: { tag: 'ซ้อมเพิ่ม', title: 'สร้างแผนภูมิสบาย ๆ', gen: () => gBuild({ scale: 1, n: 3, vmin: 2, vmax: 6,
        prompt: 'ลากแต่ละแท่งให้สูงตามข้อมูลในตาราง' }) },
      book: [['ตั้งชื่อ', 'แผนภูมิต้องมีชื่อ ชื่อแกนนอน และชื่อแกนตั้ง'], ['เลือกช่องแกนตั้ง', 'เลือกให้ค่ามากสุดอยู่ในแผนภูมิ และอ่านง่าย ไม่ละเอียดหรือหยาบเกินไป'], ['วาดแท่ง', 'ยอดแท่งต้องสูงถึงเลขที่ตรงกับข้อมูล แท่งทุกแท่งกว้างเท่ากัน'], ['ตรวจ', 'เทียบแท่งกับตารางข้อมูลทีละแท่งทุกครั้ง']],
      teacher: ['ถ้าเลือกแกนตั้งช่องละ 1 กับข้อมูลหลักสิบ จะเกิดอะไรขึ้น', 'ตรวจแผนภูมิของตัวเองอย่างไรให้แน่ใจว่าถูก']
    },

    /* ───────── 5 ร้านตารางสองทาง ───────── */
    {
      id: 5, name: 'ร้านตารางสองทาง', booth: 'table', voice: 'z5', music: 'play',
      learn: 'อ่านตารางสองทาง: หาช่องที่แถวกับหลักตัดกัน หาผลรวม และตอบคำถาม',
      tasks: [
        { tag: 'ภารกิจ 1', title: 'หาช่องที่ตัดกัน', gen() {
          const tb = mkTable({ rows: 2, cols: 3 });
          const cells = sample([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], 3);
          return { type: 'table', table: tb, totals: false, qs: cells.map(([r, c]) => tCell(tb, r, c, 'cell')) };
        } },
        { tag: 'ภารกิจ 2', title: 'อ่านค่าในช่อง', gen() {
          const tb = mkTable({ rows: 3, cols: 3 });
          const cells = sample([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], 3);
          return { type: 'table', table: tb, totals: false, qs: cells.map(([r, c]) => tCell(tb, r, c, 'option')) };
        } },
        { tag: 'ภารกิจ 3', title: 'เติมผลรวม', gen() {
          const tb = mkTable({ rows: 2, cols: 3 });
          return { type: 'table', table: tb, totals: true, qs: [tFill(tb, ['rt0', 'rt1', 'ct0', 'ct1', 'ct2', 'gt'], 'เติมช่องผลรวมที่หายไป (รวมแถว รวมหลัก และรวมทั้งหมด)')] };
        } },
        { tag: 'ภารกิจ 4', title: 'ถามจากตาราง', gen() {
          const tb = mkTable({ rows: 3, cols: 3 });
          const r = int(0, 2), c = int(0, 2);
          return { type: 'table', table: tb, totals: true, qs: [tRowTot(tb, r), tColTot(tb, c), tRowTop(tb, (r + 1) % 3), tColDiff(tb, (c + 1) % 3)] };
        } },
        { tag: 'ภารกิจ 5', title: 'ตัวเลขที่หายไป', gen() {
          const tb = mkTable({ rows: 2, cols: 3 });
          const tb2 = mkTable({ rows: 3, cols: 3 });
          const k1 = int(0, 1) + ',' + int(0, 2), k2 = int(0, 2) + ',' + int(0, 2);
          const q1 = tFill(tb, [k1], 'ผลรวมมีให้ครบแล้ว แต่มีช่องข้อมูลหายไป 1 ช่อง ช่วยหาที่');
          q1.table = tb; q1.totals = true;
          const q2 = tFill(tb2, [k2], 'มีช่องข้อมูลหายไป 1 ช่อง ช่วยหาที่');
          q2.table = tb2; q2.totals = true;
          return { type: 'table', table: tb, totals: true, qs: [q1, q2] };
        } }
      ],
      bonus: { tag: 'ท้าทาย', title: 'ตารางใหญ่ ถามหลายขั้น', gen() {
        const tb = mkTable({ rows: 3, cols: 4, vmin: 3, vmax: 14 });
        const c = int(0, 3), r = int(0, 2);
        return { type: 'table', table: tb, totals: true, qs: [tColTop(tb, c), tColDiff(tb, (c + 1) % 4), tRowTot(tb, r), tGrand(tb)] };
      } },
      easy: { tag: 'ซ้อมเพิ่ม', title: 'อ่านตารางสบาย ๆ', gen() {
        const tb = mkTable({ rows: 2, cols: 3 });
        return { type: 'table', table: tb, totals: false, qs: [tCell(tb, 0, 1, 'cell'), tCell(tb, 1, 2, 'option')] };
      } },
      book: [['แถว', 'แถวอ่านจากซ้ายไปขวา ชื่อแถวอยู่ด้านซ้าย'], ['หลัก', 'หลักอ่านจากบนลงล่าง ชื่อหลักอยู่ด้านบน'], ['ช่องที่ตัดกัน', 'หาแถว หาหลัก แล้วดูช่องที่ทั้งสองตัดกัน'], ['ผลรวม', 'รวมแถว รวมหลัก และรวมทั้งหมด รวมแถวหรือรวมหลักได้ผลรวมทั้งหมดเท่ากัน']],
      teacher: ['ทำไมรวมทุกแถวกับรวมทุกหลักจึงได้ผลรวมทั้งหมดเท่ากัน', 'ตารางสองทางบอกข้อมูลสองเรื่องพร้อมกันอย่างไร']
    },

    /* ───────── 6 ด่านมึนมึน : ผสมทุกทักษะ ───────── */
    {
      id: 6, name: 'ด่านมึนมึน', booth: 'boss', voice: 'z6', music: 'boss', boss: true,
      learn: 'ใช้แผนภูมิแท่งและตารางสองทางร่วมกัน ในสถานการณ์ใหม่',
      tasks: [
        { tag: 'ด่านมึนมึน 1', title: 'อ่านแผนภูมิหลายขั้น', gen() {
          const s = mkChart({ n: 5, scale: 5, vmin: 10, vmax: 45 });
          const [a, b] = bigSmall(s);
          const [c] = sample(s.cats.map((_, i) => i), 1);
          return quiz(s, [qDiff(s, a, b), qSum(s, [a, b]), qExtreme(s, false, 'option'), qRead(s, c)]);
        } },
        { tag: 'ด่านมึนมึน 2', title: 'อ่านตารางหลายขั้น', gen() {
          const tb = mkTable({ rows: 3, cols: 3, vmin: 3, vmax: 14 });
          return { type: 'table', table: tb, totals: true, qs: [tCell(tb, int(0, 2), int(0, 2), 'option'), tRowTop(tb, int(0, 2)), tColTot(tb, int(0, 2)), tGrand(tb)] };
        } },
        { tag: 'ด่านมึนมึน 3', title: 'ตาราง เป็นแผนภูมิ', gen() {
          const tb = mkTableTotals(5);
          const s = chartOfCols(tb);
          return { type: 'build', spec: s, init: null, preScale: 5, chooseScale: null, truth: 5, askLabels: false, labelQs: null, snap: 5, twoWay: tb,
            prompt: 'ตารางนี้บอกจำนวนแต่ละแถว สร้างแผนภูมิแท่งของ "ผลรวมแต่ละหลัก" ให้ที',
            hints: ['ผลรวมแต่ละหลักอยู่ที่แถวล่างสุดของตาราง', 'แกนตั้งนับทีละ 5 ลากยอดแท่งไปให้ตรงกับผลรวมของแต่ละหลัก', 'แท่งที่ยังไม่ตรงถูกเน้นไว้แล้ว'] };
        } },
        { tag: 'ด่านมึนมึน 4', title: 'แท่งนี้อยู่ช่องไหน', gen() {
          let tb;
          for (let i = 0; i < 40; i++) { tb = mkTableTotals(5); const S0 = TT.chart.tableSums(tb); if (!S0.rt.some(v => S0.ct.indexOf(v) >= 0)) break; }
          const s = chartOfCols(tb);
          const sums = TT.chart.tableSums(tb);
          const idx = sample([0, 1, 2], 2);
          const qs = idx.map(c => ({ by: 'cell', q: 'แท่ง' + tb.cols[c].n + ' สูง ' + sums.ct[c] + ' ตรงกับช่องรวมช่องไหนในตาราง? แตะช่องนั้น', ans: ['ct' + c], tapKeys: true, colN: c,
            why: 'ผลรวมหลัก' + tb.cols[c].n + ' = ' + sums.ct[c] + ' ตรงกับยอดแท่ง',
            hints: ['ผลรวมของแต่ละหลักอยู่ที่แถวล่างสุด', 'หลักที่ต้องดูถูกไฮไลต์แล้ว', 'ช่องที่ถูกกะพริบอยู่ แตะได้เลย'] }));
          return { type: 'table', table: tb, totals: true, chart: s, qs };
        } },
        { tag: 'ด่านมึนมึน 5', title: 'จริงหรือไม่จริง', gen() {
          const s = mkChart({ n: 5, scale: 10, vmin: 10, vmax: 70, halves: 2 });
          return quiz(s, [qTF(s, 'val'), qTF(s, 'more'), qTF(s, 'most'), qTF(s, 'val')]);
        } },
        { tag: 'ด่านมึนมึน 6', title: 'หาตัวเลขที่หายไป', gen() {
          const tb = mkTable({ rows: 3, cols: 3, vmin: 3, vmax: 14 });
          const k = int(0, 2) + ',' + int(0, 2);
          const q = tFill(tb, [k, 'ct' + int(0, 2), 'gt'], 'มึนมึนซ่อนตัวเลขไว้ 3 ช่อง ช่วยหาที');
          return { type: 'table', table: tb, totals: true, qs: [q] };
        } }
      ],
      bonus: null, easy: null,
      book: [['แผนภูมิกับตาราง', 'ข้อมูลเดียวกันนำเสนอได้ทั้งแผนภูมิแท่งและตารางสองทาง'], ['ผลรวมแต่ละหลัก', 'ตารางสองทางรวมหลักได้เป็นข้อมูลชุดใหม่ สร้างเป็นแผนภูมิแท่งได้']],
      teacher: ['แผนภูมิแท่งช่วยให้เห็นอะไรได้เร็วกว่าตาราง', 'ตารางสองทางบอกอะไรได้ละเอียดกว่าแผนภูมิ']
    }
  ];
  TT.ZONES = ZONES;
})();
