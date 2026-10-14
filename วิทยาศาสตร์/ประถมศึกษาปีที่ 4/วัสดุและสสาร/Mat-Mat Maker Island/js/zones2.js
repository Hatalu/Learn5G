/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — พื้นที่ 4–6
   4 หอไฟฟ้าแปลบ (การนำไฟฟ้า) · 5 ท่าเรือสามสถานะ (สถานะของสสาร) · 6 ปราสาทนักประดิษฐ์ (ภารกิจสุดท้าย)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, ui, audio, W, GEN, POOL } = MM;
  const { pick, shuffle, sample } = MM;
  const L = MM.lib;
  const { itemOpt, yn, taskChoice, praise, rich, rchip, storyP } = L;
  const nm = MM.nm;
  const Z = MM.zone1;
  const { tUse, tClaim, used, showZone, showItems, showHtml } = Z;
  const STAGES = MM.STAGES;

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 4 หอไฟฟ้าแปลบ : การนำไฟฟ้า
     ═══════════════════════════════════════════════════════ */
  function tCirc1() {
    const ids = ['nail', 'ruler', 'wire', 'stick'];
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'elec',
      title: 'ต่อวงจร ลองวางวัสดุตรงช่องว่าง',
      say: 'ลากวัสดุไปวางตรงช่องว่าง! ถ้าไฟฟ้าผ่านได้ หลอดไฟจะติด!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('ตะปูกับลวดทำให้ไฟติด ส่วนไม้ไม่ติด! วัสดุที่ทำให้ไฟติดเรียกว่าอะไร?', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-words',
            options: [{ html: rich('วัสดุ {c:elecY}'), value: 'y' }, { html: rich('วัสดุ {c:elecN}'), value: 'n' }],
            onPick(v, b) {
              if (v === 'y') { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ไฟฟ้าผ่านได้ ไฟติด เรียกว่าวัสดุ {c:elecY}!', b); }
              else { ch.dim(b); api.wrong('ถ้าไฟฟ้าผ่านไม่ได้ หลอดไฟจะไม่ติดนะ', b); }
            }
          });
        };
        askFn = ask;
        bench = W.circuitBench(el.querySelector('.bench-host'), { slots: 1, items: ids, onChange: () => { if (bench && bench.allTested()) setTimeout(ask, 900); } });
      },
      hint(l) {
        if (l === 3 && bench) ids.filter(id => !(id in bench.tested)).slice(0, 1).forEach(id => bench.place(id, 0));
        return ['ลากวัสดุไปวางที่กรอบเส้นประตรงกลางสายไฟ', 'แตะที่วัสดุในช่อง จะเอาออกได้ แล้วลองอันใหม่', 'แมทแมทวางให้ 1 อัน ดูหลอดไฟสิ'][l - 1];
      },
      answer: 'วัสดุที่ทำให้ไฟติด คือวัสดุนำไฟฟ้า',
      solve() { if (bench) ids.forEach(id => bench.place(id, 0)); if (askFn) askFn(); if (ch) ch.mark('y', 'good'); }
    };
  }

  function tSortElec() {
    const items = GEN.elecSet(6);
    let sorter = null;
    return {
      skill: 'elec',
      title: 'ต่อวงจรแล้วจัดกลุ่ม นำไฟฟ้า / ไม่นำไฟฟ้า',
      say: 'กดปุ่ม "ต่อวงจร" ดูว่าไฟติดไหม แล้วลากลงถัง!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: items.map(id => ({ id })),
          bins: [{ id: 'yes', label: 'นำไฟฟ้า', note: 'ไฟติด', icon: 'bolt', color: '#eab308' }, { id: 'no', label: 'ไม่นำไฟฟ้า', note: 'ไฟไม่ติด', icon: 'plug', color: '#64748b' }],
          answer: it => MM.isConductor(it.id) ? 'yes' : 'no',
          evidence: it => MM.isConductor(it.id) ? rchip('ไฟติด', 'ok') : rchip('ไฟไม่ติด', 'warn'),
          testIcon: 'bolt', testLabel: 'ต่อวงจร',
          onTest: it => { if (MM.know) MM.know(MM.ITEM[it.id].mat, 'elec'); },
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่ถังนี้ ลองกดปุ่ม "ต่อวงจร" ก่อนนะ', card),
          onDone: () => api.correct(praise() + ' โลหะ {c:elecY} · ไม้ พลาสติก ยาง แก้ว {c:elecN}', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.testAll();
        return ['กดปุ่ม "ต่อวงจร" บนการ์ดก่อน แล้วดูหลอดไฟ', 'ไฟติด = {c:elecY}   ไฟไม่ติด = {c:elecN}', 'แมทแมทต่อวงจรให้ทุกใบแล้ว ดูผลแล้วลากลงถังนะ'][l - 1];
      },
      answer: items.map(id => nm(id) + (MM.isConductor(id) ? ' = นำไฟฟ้า' : ' = ไม่นำไฟฟ้า')).join(' · '),
      solve() { items.forEach(id => { try { sorter.place(id, MM.isConductor(id) ? 'yes' : 'no'); } catch (e) {} }); }
    };
  }

  function tPredictBulb(level, run) {
    const u = used(run);
    const pools = { 1: ['nail', 'stick', 'wire', 'ruler'], 2: ['coin', 'clip', 'glassRod', 'key', 'eraser'], 3: ['foil', 'band', 'eraser', 'glassRod', 'coin'] };
    let id, tries = 0;
    do { id = pick(pools[level]); tries++; } while (u.kinds.indexOf(id) >= 0 && tries < 20);
    u.kinds.push(id);
    const on = MM.isConductor(id);
    return taskChoice({
      skill: 'elec',
      title: 'ถ้าใส่ ' + nm(id) + ' ไฟจะติดไหม?',
      say: 'เอา' + nm(id) + 'ไปคั่นช่องว่าง หลอดไฟจะติดไหม? ลองต่อวงจรพิสูจน์ได้!',
      cls: 'opts-2',
      options: [{ html: art.icon('bolt') + '<span>ไฟติด</span>', value: true }, { html: art.iconNo('bolt') + '<span>ไฟไม่ติด</span>', value: false }],
      answer: on,
      explain: on ? nm(id) + 'นำไฟฟ้า ไฟฟ้าผ่านได้ หลอดไฟจึงติด' : nm(id) + 'ไม่นำไฟฟ้า ไฟฟ้าผ่านไม่ได้ หลอดไฟจึงไม่ติด',
      wrongMsg: () => 'ลองลากวัสดุไปวางที่ช่องว่าง ดูหลอดไฟสิ',
      hints: ['คิดดูว่า ' + nm(id) + 'ทำจากอะไร โลหะนำไฟฟ้า', 'ลากการ์ดด้านล่างไปวางในช่องว่าง แล้วดูหลอดไฟ', 'แมทแมทวางให้แล้ว ดูหลอดไฟเลย'],
      noDim: true,
      fx3: b => { if (b) b.place(id, 0); },
      fig: q => W.circuitBench(q, { slots: 1, items: [id] }),
      answerText: on ? 'ไฟติด' : 'ไฟไม่ติด'
    });
  }

  function tBridge(level, run) {
    const br = GEN.bridge(level);
    const all = [];
    br.slots.forEach(s => s.forEach(id => { if (all.indexOf(id) < 0) all.push(id); }));
    const cond = all.filter(MM.isConductor), non = all.filter(id => !MM.isConductor(id));
    const items = shuffle(cond.concat(non.slice(0, Math.max(2, 7 - cond.length))));
    let bench = null, lastKey = '';
    return {
      skill: 'elec',
      title: 'ซ่อมวงจร: ทำให้หลอดไฟติด',
      say: 'วงจรมีช่องว่าง ' + br.k + ' ช่อง! เลือกวัสดุไปคั่นให้ไฟติด!',
      render(el, api) {
        el.innerHTML = '<div class="w-host b-host"></div>';
        bench = W.circuitBench(el.querySelector('.b-host'), {
          slots: br.k, items,
          onChange(list, lit, full) {
            if (!full) { lastKey = ''; return; }
            const key = list.join(',');
            if (key === lastKey) return;
            lastKey = key;
            if (lit) api.correct(praise() + ' ไฟติดแล้ว! ทุกช่องต้องเป็นวัสดุ {c:elecY}', el);
            else api.wrong('ไฟยังไม่ติด! ช่องสีแดงมีวัสดุที่ไฟผ่านไม่ได้', el.querySelector('.cb-shelf'));
          }
        });
      },
      hint(l) {
        if (l === 3 && bench) {
          for (let i = 0; i < br.k; i++) { const cur = bench.list[i]; if (!cur || !MM.isConductor(cur)) { const c = items.find(id => MM.isConductor(id) && bench.list.indexOf(id) < 0); if (c) bench.place(c, i); break; } }
        }
        return ['ไฟจะติดเมื่อ **ทุกช่อง** ใส่วัสดุที่นำไฟฟ้า', 'ช่องไหนเป็นสีแดง ช่องนั้นใส่วัสดุที่ไม่นำไฟฟ้าอยู่ แตะเพื่อเอาออกได้', 'แมทแมทวางวัสดุนำไฟฟ้าให้ 1 ช่องแล้ว ที่เหลือเลือกต่อนะ'][l - 1];
      },
      answer: 'ใส่วัสดุนำไฟฟ้าให้ครบทุกช่อง',
      solve() {
        if (!bench) return;
        const cs = items.filter(MM.isConductor);
        for (let i = 0; i < br.k; i++) bench.place(cs[i % cs.length], i);
      }
    };
  }

  STAGES.push({
    id: 4, name: 'หอไฟฟ้าแปลบ', topic: 'การนำไฟฟ้าของวัสดุ', color: '#f5b400', skill: 'elec',
    intro: [
      { who: 'mat', mood: 'wow', text: 'หอไฟฟ้าแปลบ! หลอดไฟบนหอดับหมด ตุ๊บตุ๊บสลับสายไฟเสียแล้ว!', show: showZone(4, 'หอไฟฟ้าแปลบ') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ ไม้บรรทัดพลาสติกนำไฟฟ้าดีที่สุด ข้าลองมาแล้ว!' },
      { who: 'mat', mood: 'think', text: 'ไม่จริงแน่ ๆ! เราจะต่อวงจรด้วยถ่านก้อนเล็ก แล้วดูว่าหลอดไฟติดไหม!', show: showItems(['nail', 'ruler', 'wire', 'stick'], 'ใส่วัสดุคั่นช่องว่าง แล้วดูหลอดไฟ') },
      { who: 'mat', mood: 'wow', text: 'ความปลอดภัยสำคัญ! ทดลองกับถ่านก้อนเล็กเท่านั้น ห้ามเอาของไปแหย่ปลั๊กไฟบ้านเด็ดขาด!', last: 'เข้าใจแล้ว!' }
    ],
    learn: [tCirc1, tSortElec],
    missions: 3,
    gen(level, i, run) {
      if (i === 0) return tPredictBulb(level, run);
      if (i === 1) return tBridge(level, run);
      return tClaim(4, run);
    },
    recap: [
      'วัสดุ {c:elecY} ทำให้ไฟฟ้าผ่านได้ หลอดไฟติด เช่น เหล็ก ทองแดง อะลูมิเนียม (โลหะ)',
      'วัสดุ {c:elecN} ไฟฟ้าผ่านไม่ได้ หลอดไฟไม่ติด เช่น ไม้ พลาสติก ยาง แก้ว',
      'สายไฟ แกนกลางเป็นโลหะนำไฟฟ้า ปลอกหุ้มเป็นพลาสติกที่ไม่นำไฟฟ้า',
      'ความปลอดภัย: ทดลองกับถ่านก้อนเล็กเท่านั้น ห้ามแหย่ปลั๊กไฟบ้านเด็ดขาด'
    ],
    teacher: [
      'ทำไมช่างไฟจึงใช้ไขควงที่มีด้ามพลาสติกหรือยาง? (เชื่อมกับสมบัติไม่นำไฟฟ้าและความปลอดภัย)',
      'ชวนนักเรียนบอกกฎความปลอดภัยเกี่ยวกับไฟฟ้าที่บ้าน และเน้นว่าห้ามทดลองกับปลั๊กไฟบ้าน'
    ],
    book: [
      '**การนำไฟฟ้า** คือ ไฟฟ้าผ่านวัสดุได้หรือไม่ ดูได้จากหลอดไฟในวงจร',
      '{c:elecY}: เหล็ก · ทองแดง · อะลูมิเนียม · เหรียญ · คลิป · กุญแจ',
      '{c:elecN}: ไม้ · พลาสติก · ยาง · แก้ว',
      'ปลอดภัยไว้ก่อน: ใช้ถ่านก้อนเล็กเท่านั้น'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 5 ท่าเรือสามสถานะ : สถานะของสสาร
     ═══════════════════════════════════════════════════════ */
  function tSpace1() {
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'states',
      title: 'ก้อนหินกับลม ต้องการที่อยู่ไหม?',
      say: 'หย่อนก้อนหินลงแก้วน้ำ แล้วสูบลมเข้าลูกโป่ง ดูซิเกิดอะไรขึ้น!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('น้ำสูงขึ้น ลูกโป่งพองขึ้น! หินกับลมมีอะไรเหมือนกัน?', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-words',
            options: [
              { html: rich('ต้องการที่อยู่'), value: 'a' },
              { html: rich('มองเห็นได้ทั้งคู่'), value: 'b' },
              { html: rich('แข็งทั้งคู่'), value: 'c' }
            ],
            onPick(v, b) {
              if (v === 'a') { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ทุกสิ่งที่มีมวลและต้องการที่อยู่ เรียกว่า {c:matter}\nสสารมี 3 สถานะ คือ {c:solid} {c:liquid} และ {c:gas}', b); }
              else { ch.dim(b); api.wrong(v === 'b' ? 'ลมมองไม่เห็นนะ ลองคิดจากน้ำที่สูงขึ้นกับลูกโป่งที่พอง' : 'ลมไม่ได้แข็งนะ ลองดูว่าทั้งคู่ทำอะไรกับที่ว่าง', b); }
            }
          });
        };
        askFn = ask;
        bench = W.spaceBench(el.querySelector('.bench-host'), { onDone: () => setTimeout(ask, 600) });
      },
      hint(l) {
        if (l === 3 && bench) { if (!bench.doneA()) bench.dropStone(); }
        return ['แตะก้อนหินให้หล่นลงน้ำ และแตะที่สูบลม 4 ครั้ง', 'ดูระดับน้ำ มันสูงขึ้นไหม ลูกโป่งใหญ่ขึ้นไหม', 'ทั้งสองอย่างต้องการ "ที่" ให้ตัวเองอยู่'][l - 1];
      },
      answer: 'ก้อนหินและลมต้องการที่อยู่ จึงเป็นสสาร',
      solve() { if (bench) { bench.dropStone(); for (let i = 0; i < 4; i++) bench.pump(); } if (askFn) askFn(); if (ch) ch.mark('a', 'good'); }
    };
  }

  function tPour1() {
    let bench = null, ch = null, asked = false, askFn = null;
    return {
      skill: 'states',
      title: 'เทลงภาชนะต่างรูปร่าง ดูซิเปลี่ยนไหม?',
      say: 'เลือกของ แล้วแตะภาชนะเพื่อเท! เทให้ครบ 3 อย่าง อย่างละ 2 ภาชนะ!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host bench-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const ask = () => {
          if (asked) return;
          asked = true;
          api.say('ดูตารางพิสูจน์! ใครรักษารูปร่างไว้ได้ ไม่ว่าอยู่ภาชนะไหน?', 'cheer');
          ch = W.choice(el.querySelector('.ch-host'), {
            cls: 'opts-3', options: [{ html: itemOpt('stone'), value: 'stone' }, { html: itemOpt('water'), value: 'water' }, { html: itemOpt('air'), value: 'air' }],
            onPick(v, b) {
              if (v === 'stone') { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ก้อนหินเป็น {c:solid} รูปร่างและปริมาตรคงที่!', b); }
              else { ch.dim(b); api.wrong(v === 'water' ? 'น้ำเปลี่ยนรูปร่างตามภาชนะนะ ดูระดับน้ำสิ' : 'ลมแผ่เต็มภาชนะทุกแบบเลย รูปร่างเปลี่ยนตามภาชนะ', b); }
            }
          });
        };
        askFn = ask;
        bench = W.pourBench(el.querySelector('.bench-host'), { onPour: () => { if (bench && bench.allPoured(2)) setTimeout(ask, 900); } });
      },
      hint(l) {
        if (l === 3 && bench) bench.markAll();
        return ['เลือกของแล้วแตะภาชนะ ลองเทให้ครบทุกอย่าง', 'ดูรูปร่างของที่เทลงไป เหมือนเดิมไหม หรือเปลี่ยนตามภาชนะ', 'ดูตารางพิสูจน์ด้านล่าง ใครเขียนว่า "คงที่"'][l - 1];
      },
      answer: 'ก้อนหินรูปร่างคงที่ น้ำและลมเปลี่ยนตามภาชนะ',
      solve() { if (bench) bench.markAll(); if (askFn) askFn(); if (ch) ch.mark('stone', 'good'); }
    };
  }

  function tStateNames() {
    const items = [
      { id: 's1', html: 'รูปร่างคงที่ ปริมาตรคงที่', short: 'รูปร่างคงที่', a: 'solid' },
      { id: 's2', html: 'ไหลได้ รูปร่างเปลี่ยนตามภาชนะ ปริมาตรเท่าเดิม', short: 'ไหลได้', a: 'liquid' },
      { id: 's3', html: 'แผ่เต็มภาชนะ รูปร่างและปริมาตรเปลี่ยนตามภาชนะ', short: 'แผ่เต็ม', a: 'gas' }
    ];
    let sorter = null;
    return {
      skill: 'states',
      title: 'จับคู่สมบัติ กับสถานะ',
      say: 'สสารมี 3 สถานะ! ลากสมบัติไปใส่ถังที่ใช่!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items,
          bins: [{ id: 'solid', label: 'ของแข็ง', icon: 'cube', color: '#8b5cf6' }, { id: 'liquid', label: 'ของเหลว', icon: 'drop', color: '#0ea5e9' }, { id: 'gas', label: 'แก๊ส', icon: 'cloud', color: '#14b8a6' }],
          answer: it => it.a,
          onWrong: (it, b, card) => api.wrong('ยังไม่ใช่สถานะนั้น นึกถึงตอนเทลงภาชนะนะ', card),
          onDone: () => api.correct(praise() + ' {c:solid} คงที่ · {c:liquid} ไหลตามภาชนะ · {c:gas} แผ่เต็ม', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) { sorter.place('s1', 'solid'); }
        return ['นึกถึงก้อนหิน น้ำ และลมในลูกโป่งที่เราเทลงภาชนะ', 'ก้อนหินรูปร่างเดิมเสมอ น้ำไหลตามภาชนะ ลมแผ่เต็มภาชนะ', 'แมทแมทวางให้ 1 ใบแล้ว ที่เหลือคิดต่อได้เลย'][l - 1];
      },
      answer: 'ของแข็ง = รูปร่างคงที่ · ของเหลว = ไหลตามภาชนะ · แก๊ส = แผ่เต็มภาชนะ',
      solve() { items.forEach(it => { try { sorter.place(it.id, it.a); } catch (e) {} }); }
    };
  }

  /* หลักฐานของแต่ละตัวอย่างในโหมดคัดแยกสถานะ */
  const EVID = {
    rock: ['รูปร่างคงที่', 'ok'], book: ['รูปร่างคงที่', 'ok'], ice: ['รูปร่างคงที่ แข็ง', 'ok'], pencil: ['รูปร่างคงที่', 'ok'],
    sand: ['เทเป็นกอง ทุกเม็ดรูปร่างเดิม', 'ok'], salt: ['เทเป็นกอง ทุกเม็ดรูปร่างเดิม', 'ok'],
    water: ['ไหลตามภาชนะ ผิวเรียบ', 'ok'], milk: ['ไหลตามภาชนะ ผิวเรียบ', 'ok'], oil: ['ไหลตามภาชนะ ผิวเรียบ', 'ok'], juice: ['ไหลตามภาชนะ ผิวเรียบ', 'ok'],
    honey: ['ไหลช้า แต่ไหลตามภาชนะ', 'ok'],
    air: ['แผ่เต็มลูกโป่ง', 'ok'], helium: ['แผ่เต็มลูกโป่ง', 'ok'], lpg: ['แผ่เต็มถัง', 'ok'], soda: ['ฟองลอยขึ้น แผ่ออกไป', 'ok']
  };
  const BIN_ST = [{ id: 'solid', label: 'ของแข็ง', icon: 'cube', color: '#8b5cf6' }, { id: 'liquid', label: 'ของเหลว', icon: 'drop', color: '#0ea5e9' }, { id: 'gas', label: 'แก๊ส', icon: 'cloud', color: '#14b8a6' }];

  function tSortStates(level, run) {
    const items = GEN.stateSet(6, level >= 2);
    let sorter = null;
    return {
      skill: 'states',
      title: 'คัดแยกสถานะ: ของแข็ง ของเหลว แก๊ส',
      say: 'กดปุ่ม "ตรวจดู" แล้วลากของลงถังสถานะที่ใช่!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items: items.map(id => ({ id })),
          bins: BIN_ST,
          answer: it => MM.SI[it.id].s,
          evidence: it => rchip(EVID[it.id][0], EVID[it.id][1]),
          testIcon: 'magnify', testLabel: 'ตรวจดู',
          onWrong: (it, b, card) => api.wrong('ใบนี้ยังไม่ใช่ถังนี้ ลองกดปุ่ม "ตรวจดู" ก่อนนะ', card),
          onDone: () => api.correct(praise() + ' ' + items.filter(id => ['sand', 'salt', 'honey', 'soda'].indexOf(id) >= 0).map(id => ({ sand: 'ทรายเทได้แต่ทุกเม็ดเป็นของแข็ง', salt: 'เกลือทุกเม็ดเป็นของแข็ง', honey: 'น้ำผึ้งไหลช้าแต่เป็นของเหลว', soda: 'ฟองในน้ำอัดลมเป็นแก๊ส' })[id]).join(' · ') || 'แยกสถานะได้ถูกหมดเลย', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.testAll();
        return ['กดปุ่ม "ตรวจดู" แล้วดูว่ารูปร่างเปลี่ยนตามภาชนะไหม', '{c:solid} รูปร่างคงที่ · {c:liquid} ไหลตามภาชนะ · {c:gas} แผ่เต็มภาชนะ', 'แมทแมทตรวจให้ทุกใบแล้ว ดูผลแล้วลากลงถังนะ'][l - 1];
      },
      answer: items.map(id => nm(id) + ' = ' + MM.STATE_N[MM.SI[id].s]).join(' · '),
      solve() { items.forEach(id => { try { sorter.place(id, MM.SI[id].s); } catch (e) {} }); }
    };
  }

  /* ภาพย่อภาชนะ + ของที่อยู่ข้างใน (ตัวเลือกคำตอบ) */
  function miniCont(c, mode) {
    const P = W.PROFILES[c].p;
    const gid = art.uid('mc');
    const path = (function () { const Lp = [], Rp = []; P.forEach(q => { Lp.push((60 - q[1] / 2).toFixed(1) + ' ' + q[0]); Rp.push((60 + q[1] / 2).toFixed(1) + ' ' + q[0]); }); return 'M' + Lp.join(' L') + ' L' + Rp.reverse().join(' L') + ' Z'; })();
    const widthAt = y => { if (y <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (y <= P[i][0]) { const t = (y - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * t; } return P[P.length - 1][1]; };
    let level = P[0][0];
    { let area = 0; for (let y = 190; y > P[0][0]; y -= .5) { area += widthAt(y) * .5; if (area >= 3000) { level = y; break; } } }
    let inner = '';
    if (mode === 'liq-ok') inner = '<rect x="0" y="' + level + '" width="120" height="200" fill="#4aa8ff"/><path d="M0 ' + level + ' H120" stroke="#fff" stroke-width="3"/>';
    else if (mode === 'liq-full') inner = '<rect x="0" y="0" width="120" height="200" fill="#4aa8ff"/>';
    else if (mode === 'liq-col') inner = '<rect x="46" y="' + (level - 40) + '" width="28" height="160" rx="6" fill="#4aa8ff"/>';
    else if (mode === 'gas-ok') inner = '<rect x="0" y="0" width="120" height="200" fill="#52d3b8" opacity=".85"/>' + [20, 50, 80, 40, 90, 60].map((x, i) => '<circle cx="' + (x + 10) + '" cy="' + (30 + i * 26) + '" r="3" fill="#fff"/>').join('');
    else if (mode === 'gas-bottom') inner = '<rect x="0" y="' + level + '" width="120" height="200" fill="#52d3b8" opacity=".85"/>';
    else if (mode === 'gas-ball') inner = '<circle cx="60" cy="120" r="24" fill="#52d3b8" opacity=".9"/>';
    else if (mode === 'sol-ok') inner = '<g transform="translate(60 168)">' + W.at(art.item('stone'), -22, -22, 44, 44) + '</g>';
    else if (mode === 'sol-flat') inner = '<g transform="translate(60 170) scale(2.4 .7)">' + W.at(art.item('stone'), -22, -22, 44, 44) + '</g>';
    else if (mode === 'sol-full') inner = '<rect x="0" y="0" width="120" height="200" fill="#9b9aa6"/>';
    return '<svg class="mini-cont" viewBox="0 10 120 190" aria-hidden="true"><defs><clipPath id="' + gid + '"><path d="' + path + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + gid + ')">' + inner + '</g><path d="' + path + '" fill="rgba(235,248,255,.3)" stroke="' + art.INK + '" stroke-width="4.4" stroke-linejoin="round"/></svg>';
  }

  function tPredictShape(level, run) {
    const kinds = level === 1 ? ['liquid'] : level === 2 ? ['gas', 'liquid'] : ['solid', 'liquid', 'gas'];
    const k = pick(kinds), c = pick(['tube', 'bowl', 'flask']);
    const names = { solid: 'ก้อนหิน', liquid: 'น้ำ', gas: 'แก๊ส' };
    const modes = { solid: ['sol-ok', 'sol-flat', 'sol-full'], liquid: ['liq-ok', 'liq-full', 'liq-col'], gas: ['gas-ok', 'gas-bottom', 'gas-ball'] }[k];
    const order = shuffle(modes);
    const expl = { solid: 'ก้อนหินรูปร่างและขนาดเหมือนเดิมเสมอ', liquid: 'น้ำไหลตามภาชนะ ผิวเรียบ ปริมาตรเท่าเดิม', gas: 'แก๊สแผ่เต็มภาชนะเสมอ' }[k];
    return taskChoice({
      skill: 'states',
      title: 'ใส่' + names[k] + 'ลง' + W.PROFILES[c].n + ' ภาพไหนถูก?',
      say: 'เท' + names[k] + 'ลง' + W.PROFILES[c].n + ' หน้าตาจะเป็นแบบไหน? เลือกภาพที่ใช่!',
      cls: 'opts-thumb',
      options: order.map((m, i) => ({ html: '<span class="th-tag">' + (i + 1) + '</span>' + miniCont(c, m), value: m })),
      answer: modes[0],
      explain: expl,
      wrongMsg: () => ({ solid: 'ของแข็งรูปร่างไม่เปลี่ยนตามภาชนะนะ', liquid: 'ของเหลวไหลมากองก้นภาชนะ ผิวหน้าเรียบ ปริมาตรเท่าเดิม', gas: 'แก๊สไม่ตกลงไปกองก้นภาชนะ มันแผ่ออกเต็มพื้นที่' })[k],
      hints: [({ solid: '{c:solid} รูปร่างคงที่ ไม่เปลี่ยนตามภาชนะ', liquid: '{c:liquid} ไหลตามภาชนะ ปริมาตรเท่าเดิม', gas: '{c:gas} แผ่เต็มภาชนะเสมอ' })[k], 'นึกถึงตอนที่เราเทลงภาชนะในห้องทดลอง', 'ตัดภาพที่ไม่น่าใช่ออกแล้วเลือกต่อ'],
      answerText: 'ภาพที่ถูกคือแบบ ' + modes[0]
    });
  }

  /* กับดักทราย/เกลือ : เทได้แต่เป็นของแข็ง */
  function sandFigure(kind) {
    const nameK = kind === 'salt' ? 'เกลือ' : 'ทราย';
    const col = kind === 'salt' ? ['#ffffff', '#cfd8e6'] : ['#ffe3a0', '#e2b25a'];
    const ink = art.INK;
    let grains = '';
    const G = [[360, 46, 10], [388, 38, 12], [418, 52, 11], [372, 74, 12], [404, 78, 13], [434, 80, 10], [358, 98, 11], [386, 104, 12], [416, 104, 11], [440, 56, 9]];
    G.forEach((g, i) => {
      const r = g[2];
      grains += '<path d="M' + (g[0] - r) + ' ' + g[1] + ' l' + (r * .5) + ' -' + (r * .9) + ' l' + r + ' -' + (r * .2) + ' l' + (r * .9) + ' ' + (r * .8) + ' l-' + (r * .3) + ' ' + r + ' l-' + r + ' ' + (r * .3) + ' z" fill="' + (i % 3 === 0 ? col[0] : col[1]) + '" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/>';
    });
    return '<svg class="sand-fig" viewBox="0 0 480 160" aria-hidden="true">' +
      '<rect x="3" y="3" width="474" height="154" rx="20" fill="#f4fbff" stroke="' + ink + '" stroke-width="4"/>' +
      /* น้ำ */
      '<path d="M76 8 Q70 40 74 82" stroke="#4aa8ff" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M26 76 H124 L116 126 Q115 134 106 134 H44 Q35 134 34 126 Z" fill="rgba(235,248,255,.5)" stroke="' + ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M30 98 H120 L116 126 Q115 131 106 131 H44 Q36 131 35 126 Z" fill="#4aa8ff"/><path d="M30 98 H120" stroke="#fff" stroke-width="3"/>' +
      '<text x="76" y="152" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + ink + '">เทน้ำ: ผิวเรียบ</text>' +
      /* ทราย */
      '<g fill="' + col[1] + '" stroke="' + ink + '" stroke-width="1.6">' + [0, 1, 2, 3, 4, 5].map(i => '<circle cx="' + (232 + (i % 2) * 3) + '" cy="' + (14 + i * 10) + '" r="3"/>').join('') + '</g>' +
      '<path d="M182 76 H280 L272 126 Q271 134 262 134 H200 Q191 134 190 126 Z" fill="rgba(235,248,255,.5)" stroke="' + ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M194 131 Q214 124 226 80 Q240 124 268 131 Z" fill="' + col[1] + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<text x="232" y="152" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + ink + '">เท' + nameK + ': กองเป็นภูเขา</text>' +
      /* แว่นขยาย */
      '<circle cx="400" cy="74" r="58" fill="#fffdf6" stroke="' + ink + '" stroke-width="5"/>' + grains +
      '<path d="M442 118 L470 148" stroke="' + ink + '" stroke-width="8" stroke-linecap="round"/><path d="M442 118 L470 148" stroke="#ffb02e" stroke-width="3.6" stroke-linecap="round"/>' +
      '<text x="372" y="152" text-anchor="middle" font-size="13" font-weight="700" font-family="Mali" fill="' + ink + '" style="display:none">ขยายดู</text></svg>' +
      '<p class="sand-cap">แว่นขยาย: ' + nameK + 'ทุกเม็ดเป็นก้อนแข็งเล็ก ๆ รูปร่างไม่เปลี่ยน</p>';
  }
  function tSandTrap(level, run) {
    const kind = pick(['sand', 'salt']);
    const n = kind === 'salt' ? 'เกลือ' : 'ทราย';
    return taskChoice({
      skill: 'states',
      title: n + 'เทได้ ไหลได้ ' + n + 'เป็นสถานะอะไร?',
      judSay: 'ฮิ ๆ ' + n + 'เทได้ไหลได้ ' + n + 'ต้องเป็นของเหลวสิ!',
      say: 'ดูหลักฐาน! น้ำเทแล้วผิวเรียบ แต่' + n + 'กองเป็นภูเขา แว่นขยายเห็นอะไร?',
      fig: sandFigure(kind),
      cls: 'opts-3',
      options: [{ html: rich('{c:solid}'), value: 'solid' }, { html: rich('{c:liquid}'), value: 'liquid' }, { html: rich('{c:gas}'), value: 'gas' }],
      answer: 'solid',
      explain: n + 'ทุกเม็ดเป็นก้อนแข็ง รูปร่างไม่เปลี่ยน จึงเป็น {c:solid}',
      wrongMsg: v => v === 'liquid' ? 'ของเหลวต้องผิวเรียบและไหลตามภาชนะ แต่' + n + 'กองเป็นภูเขา' : 'แก๊สมองไม่เห็นและแผ่เต็มภาชนะ แต่' + n + 'เป็นเม็ดที่มองเห็น',
      hints: ['เทียบรูปน้ำกับรูป' + n + ' ผิวหน้าเหมือนกันไหม', 'ดูแว่นขยาย แต่ละเม็ดเป็นอะไร', 'แต่ละเม็ดเป็นก้อนแข็ง รูปร่างเดิมเสมอ'],
      answerText: 'ของแข็ง'
    });
  }

  function tClaimState(level, run) {
    const u = used(run);
    const c = GEN.stateClaim(u.claim);
    u.claim.push(c.idx);
    return taskChoice({
      skill: 'states',
      title: 'ตุ๊บตุ๊บอ้างว่า... จริงหรือไม่จริง?',
      judSay: 'ฮิ ๆ ข้าขอบอกว่า “' + c.text + '” เชื่อข้าสิ!',
      say: 'อย่าเพิ่งเชื่อ! คิดจากสิ่งที่ทดลองมา แล้วตัดสินนะ!',
      story: 'ตุ๊บตุ๊บบอกว่า: **' + c.text + '**',
      cls: 'opts-yn',
      options: yn(),
      answer: c.truth,
      explain: c.why,
      wrongMsg: () => 'นึกถึงตอนเทลงภาชนะ แล้วเทียบสมบัติของสามสถานะดูนะ',
      hints: ['อย่าเชื่อตุ๊บตุ๊บ ต้องคิดจากสิ่งที่ทดลองมา', '{c:solid} รูปร่างคงที่ · {c:liquid} ไหลตามภาชนะ ปริมาตรเท่าเดิม · {c:gas} แผ่เต็มภาชนะ', 'ลองนึกภาพเทของนั้นลงขวดหลายแบบ'],
      noDim: true,
      answerText: c.truth ? 'จริง' : 'ไม่จริง'
    });
  }

  STAGES.push({
    id: 5, name: 'ท่าเรือสามสถานะ', topic: 'สถานะของสสาร', color: '#20c4b4', skill: 'states',
    intro: [
      { who: 'mat', mood: 'wow', text: 'ท่าเรือสามสถานะ! ตุ๊บตุ๊บสลับของบนท่าเรือ หิน น้ำ ลม ปนกันหมดแล้ว!', show: showZone(5, 'ท่าเรือสามสถานะ') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ ทรายเทได้ ไหลได้ ข้าว่าทรายเป็นของเหลว เชื่อข้าสิ!' },
      { who: 'mat', mood: 'think', text: 'ต้องมีวิธีแยก! เทใส่ภาชนะ ดูรูปร่าง ดูปริมาตร แล้วจะรู้!', show: showItems(['stone', 'water', 'air'], 'ของแข็ง ของเหลว แก๊ส') },
      { who: 'mat', mood: 'cheer', text: 'ลุยเลย!', last: 'ลุยเลย!' }
    ],
    learn: [tSpace1, tPour1, tStateNames],
    missions: 4,
    gen(level, i, run) {
      if (i === 0) return tSortStates(level, run);
      if (i === 1) return tPredictShape(level, run);
      if (i === 2) return tSandTrap(level, run);
      return tClaimState(level, run);
    },
    recap: [
      '{c:matter} คือทุกสิ่งที่มีมวลและต้องการที่อยู่ มี 3 สถานะ คือ {c:solid} {c:liquid} {c:gas}',
      '{c:solid} รูปร่างและปริมาตรคงที่ เช่น หิน ไม้ น้ำแข็ง ทราย (ทุกเม็ดเป็นของแข็ง)',
      '{c:liquid} ปริมาตรคงที่ รูปร่างเปลี่ยนตามภาชนะ ไหลได้ เช่น น้ำ นม น้ำมัน น้ำผึ้ง',
      '{c:gas} รูปร่างและปริมาตรเปลี่ยนตามภาชนะ แผ่เต็มภาชนะ เช่น อากาศ แก๊สหุงต้ม'
    ],
    teacher: [
      'ทรายและเกลือเทได้เหมือนของเหลว ทำไมจึงเป็นของแข็ง? (ชวนสังเกตผิวหน้าที่เทแล้วกองเป็นภูเขา และดูเม็ดด้วยแว่นขยาย)',
      'อากาศมองไม่เห็น แต่เรารู้ว่ามีอยู่ได้อย่างไร? (ลูกโป่งพอง ลมพัดใบไม้ แก้วคว่ำจุ่มน้ำ)'
    ],
    book: [
      '**สสาร** คือ ทุกสิ่งที่มีมวลและต้องการที่อยู่',
      '{c:solid}: รูปร่างคงที่ ปริมาตรคงที่',
      '{c:liquid}: ไหลได้ รูปร่างเปลี่ยนตามภาชนะ ปริมาตรเท่าเดิม',
      '{c:gas}: แผ่เต็มภาชนะ รูปร่างและปริมาตรเปลี่ยนตามภาชนะ'
    ]
  });

  /* ═══════════════════════════════════════════════════════
     พื้นที่ 6 ปราสาทนักประดิษฐ์ : ภารกิจสุดท้าย
     ═══════════════════════════════════════════════════════ */
  const BUILD_SAY = {
    pot: 'ประกอบหม้อ! เลือกวัสดุตัวหม้อกับด้าม แล้วกดทดสอบ!',
    cable: 'ประกอบสายไฟ! เลือกวัสดุแกนกับปลอก แล้วกดทดสอบ!',
    helmet: 'ประกอบหมวก! เลือกวัสดุเปลือกกับนวม แล้วกดทดสอบ!'
  };
  function tBuild(kind) {
    const B = GEN.BUILD[kind];
    let bench = null;
    const ok = k => { const p = B.parts.find(x => x.k === k); return B.shelf.filter(id => p.need(id)); };
    return {
      skill: 'apply',
      title: 'ประกอบ' + B.name,
      say: BUILD_SAY[kind],
      render(el, api) {
        el.innerHTML = '<div class="w-host b-host"></div>';
        bench = W.buildBench(el.querySelector('.b-host'), {
          kind,
          onTest(res) {
            if (res.ok) api.correct(praise() + ' ' + B.parts.map(p => p.tell).join(' · '), el.querySelector('.build-stage'));
            else {
              const p = B.parts.find(x => x.k === res.bad[0]);
              api.wrong(p.n + 'ยังไม่เหมาะ', el.querySelector('.build-stage'));
            }
          }
        });
      },
      hint(l) {
        if (l === 3 && bench) { const bad = B.parts.find(p => !bench.assign[p.k] || !p.need(bench.assign[p.k])); if (bad) { bench.setActive(bad.k); document.querySelectorAll('.build-shelf .icard-btn').forEach(b => b.classList.toggle('hl', !!bad.need(b.dataset.id))); } }
        const badNow = bench && B.parts.find(p => bench.assign[p.k] && !p.need(bench.assign[p.k]));
        return [(badNow || B.parts[0]).tell, B.parts.map(p => p.tell).join(' · '), 'ดูการ์ดที่เรืองแสงสีเหลือง เหมาะกับส่วนที่กำลังเลือก'][l - 1];
      },
      answer: B.parts.map(p => p.n + ' = ' + ok(p.k).map(nm).join('/')).join(' · '),
      solve() { if (!bench) return; B.parts.forEach(p => bench.set(p.k, ok(p.k)[0])); setTimeout(() => bench.test(), 300); }
    };
  }

  function tMystery(run) {
    const u = used(run);
    const m = GEN.mystery(u.kinds.filter(k => MM.MYST[k]));
    u.kinds.push(m.secret);
    let bench = null;
    return {
      skill: 'apply',
      title: 'นักสืบวัสดุ: ในลังคืออะไร?',
      judSay: 'ฮิ ๆ ข้าใส่วัสดุลึกลับไว้ในลัง เจ้าไม่มีทางรู้หรอก!',
      say: 'กดปุ่มทดสอบ แล้วตัดผู้ต้องสงสัยทีละคน! ทดสอบ 2 อย่างขึ้นไปก่อนทาย!',
      render(el, api) {
        el.innerHTML = '<div class="w-host m-host"></div>';
        bench = W.mysteryBench(el.querySelector('.m-host'), {
          secret: m.secret, cand: m.cand,
          onGuess(id, b) {
            if (bench.count() < 2) { api.nudge('ทดสอบอย่างน้อย 2 อย่างก่อนนะ จะได้มั่นใจ', b); return; }
            if (id === m.secret) {
              b.classList.add('good'); bench.lock();
              const S = MM.MYST[id].sig;
              api.correct(praise() + ' ผลทดสอบตรงกับ' + MM.MYST[id].n + ': ' + Object.keys(bench.seen).map(t => ({ press: S.press === 'hard' ? 'แข็ง' : 'นิ่ม', elastic: S.elastic ? 'ยืดหยุ่น' : 'ไม่ยืดหยุ่น', heat: S.heat ? 'นำความร้อนดี' : 'นำความร้อนไม่ดี', elec: S.elec ? 'นำไฟฟ้า' : 'ไม่นำไฟฟ้า' })[t]).join(' · '), b);
            } else { bench.dim(id); api.wrong(MM.MYST[id].n + 'มีสมบัติไม่ตรงกับผลที่ได้', b); }
          }
        });
      },
      hint(l) {
        if (l === 3 && bench) {
          if (bench.count() < 2) { bench.run('elec'); bench.run('press'); }
          const left = bench.left();
          bench.cands.forEach(b => { if (left.indexOf(b.dataset.id) < 0) bench.dim(b.dataset.id); });
        }
        return ['ลองทดสอบหลายอย่าง แล้วดูว่าผลที่ได้ตรงกับผู้ต้องสงสัยคนไหน', 'ไฟติดแปลว่าเป็นโลหะ · กดไม่บุ๋ม ไฟไม่ติด อาจเป็นไม้หรือพลาสติก · นิ่มและยืดหยุ่นคือยางหรือฟองน้ำ', 'แมทแมททดสอบและตัดผู้ต้องสงสัยให้แล้ว เหลือใครบ้าง'][l - 1];
      },
      answer: MM.MYST[m.secret].n,
      solve() { if (bench) { bench.run('elec'); bench.run('press'); bench.mark(m.secret, 'good'); } }
    };
  }

  function tClues(run) {
    const items = [
      { id: 'c1', html: 'ฉันไหลลงจากขวดได้ ผิวหน้าเรียบเมื่อวางนิ่ง ปริมาตรเท่าเดิม', short: 'ไหลได้ผิวเรียบ', a: 'liquid' },
      { id: 'c2', html: 'ฉันมองไม่เห็น แต่ทำให้ลูกโป่งพองเต็มลูก', short: 'พองลูกโป่ง', a: 'gas' },
      { id: 'c3', html: 'ฉันกดแล้วไม่ไหล รูปร่างเหมือนเดิมเสมอ', short: 'รูปร่างเดิม', a: 'solid' },
      { id: 'c4', html: 'ฉันแผ่ไปทั่วห้อง ปริมาตรเปลี่ยนตามที่ว่าง', short: 'แผ่ทั่วห้อง', a: 'gas' },
      { id: 'c5', html: 'ฉันเป็นเม็ดเล็ก ๆ เทเป็นกองได้ แต่ทุกเม็ดรูปร่างเดิม', short: 'เม็ดเล็กเทเป็นกอง', a: 'solid' },
      { id: 'c6', html: 'ฉันเทใส่แก้วทรงไหนก็เปลี่ยนตามแก้ว แต่ปริมาตรเท่าเดิม', short: 'เปลี่ยนตามแก้ว', a: 'liquid' }
    ];
    let sorter = null;
    return {
      skill: 'states',
      title: 'เดาสถานะจากเบาะแส',
      judSay: 'ฮิ ๆ ข้าเขียนเบาะแสไว้ ไม่บอกหรอกว่าเป็นสถานะอะไร!',
      say: 'อ่านเบาะแสแต่ละใบ แล้วลากลงถังสถานะที่ใช่!',
      render(el, api) {
        el.innerHTML = '<div class="w-host sort-host"></div>';
        sorter = W.sortBins(el.querySelector('.sort-host'), {
          items, bins: BIN_ST,
          answer: it => it.a,
          onWrong: (it, b, card) => api.wrong('เบาะแสนี้ยังไม่ใช่สถานะนั้น เทียบกับสมบัติดูนะ', card),
          onDone: () => api.correct(praise() + ' ไขเบาะแสด้วยสมบัติของสสารได้หมดเลย!', el)
        });
      },
      hint(l) {
        if (l === 3 && sorter) sorter.place('c3', 'solid');
        return ['นึกถึงสมบัติ: รูปร่างคงที่ / ไหลตามภาชนะ / แผ่เต็มภาชนะ', '{c:solid} รูปร่างคงที่ · {c:liquid} ไหลตามภาชนะ ปริมาตรเท่าเดิม · {c:gas} แผ่เต็มภาชนะ', 'แมทแมทวางให้ 1 ใบแล้ว ที่เหลือคิดต่อได้เลย'][l - 1];
      },
      answer: 'ไหล/เปลี่ยนตามแก้ว = ของเหลว · แผ่เต็ม = แก๊ส · รูปร่างเดิม = ของแข็ง',
      solve() { items.forEach(it => { try { sorter.place(it.id, it.a); } catch (e) {} }); }
    };
  }

  STAGES.push({
    id: 6, name: 'ปราสาทนักประดิษฐ์', topic: 'ภารกิจสุดท้าย: ใช้ทุกอย่างที่เรียนมา', color: '#8b5cf6', skill: 'apply', final: true,
    intro: [
      { who: 'mat', mood: 'wow', text: 'มาถึงปราสาทนักประดิษฐ์แล้ว! ตุ๊บตุ๊บปิดประตูไว้!', show: showZone(6, 'ปราสาทนักประดิษฐ์') },
      { who: 'tub', mood: 'laugh', text: 'ฮิ ๆ เลือกวัสดุผิดแค่ครั้งเดียว ปราสาทก็ไม่เปิด!' },
      { who: 'mat', mood: 'cheer', text: 'ไม่กลัวหรอก! เรารู้วิธีทดสอบแล้ว ความแข็ง ยืดหยุ่น ความร้อน ไฟฟ้า และสถานะ!', last: 'ลุยเลย!' }
    ],
    learn: [],
    missions: 5,
    gen(level, i, run) {
      if (i === 0) return tBuild('pot');
      if (i === 1) return tBuild('cable');
      if (i === 2) return tMystery(run);
      if (i === 3) return tBuild('helmet');
      return tClues(run);
    },
    recap: [
      'ตัวหม้อใช้วัสดุ {c:heatY} ด้ามใช้วัสดุ {c:heatN}',
      'สายไฟ แกนใช้วัสดุ {c:elecY} ปลอกหุ้มใช้วัสดุ {c:elecN}',
      'หมวกนิรภัย เปลือกใช้วัสดุ {c:hard} นวมใช้วัสดุ {c:soft} และ {c:elastic}',
      'ทดลองด้วยตัวเอง คือวิธีรู้สมบัติของวัสดุที่แท้จริง'
    ],
    teacher: [
      'ชวนนักเรียนคิดสิ่งประดิษฐ์ของตัวเอง แล้วเลือกวัสดุแต่ละส่วนพร้อมบอกเหตุผลจากสมบัติ 4 ข้อ',
      'ให้นักเรียนวางแผนทดลองหาสมบัติของวัสดุที่ไม่เคยเห็น (วัสดุลึกลับ) โดยเลือกว่าจะทดสอบอะไรก่อน เพราะอะไร'
    ],
    book: [
      'ชิ้นงานหนึ่งชิ้นใช้ได้หลายวัสดุ แต่ละส่วนเลือกตามสมบัติที่ต้องการ',
      'ไม่รู้ว่าวัสดุอะไร? ทดสอบ: กด · ออกแรงแล้วปล่อย · ความร้อน · ไฟฟ้า',
      'อย่าเชื่อคำบอกเล่า ทดลองด้วยตัวเองก่อนเสมอ'
    ],
    outro: [
      { who: 'tub', mood: 'shock', text: 'ไม่นะ! ข้าสลับป้ายยังไง เจ้าก็ทดสอบเองได้หมด!' },
      { who: 'mat', mood: 'cheer', text: 'ใช่แล้ว! ทดลองด้วยตัวเอง คือวิธีรู้ของจริง!' },
      { who: 'tub', mood: 'happy', text: 'ก็ได้... ข้ายอมแพ้! ขอเรียนวิธีทดสอบด้วยคนได้ไหม?' },
      { who: 'mat', mood: 'cheer', text: 'ได้เลย! เกาะช่างประดิษฐ์เปิดแล้ว ขอบคุณเพื่อนช่างนะ!', last: 'ไชโย!' }
    ]
  });

  MM.SKILLS = {
    hard:    { name: 'ความแข็งของวัสดุ', rec: 'เล่นเหมืองแข็งแรงอีกรอบ ลองขีดและกดเทียบวัสดุหลาย ๆ ชนิด' },
    elastic: { name: 'สภาพยืดหยุ่น', rec: 'เล่นโรงงานยางเด้งอีกรอบ จำไว้ว่าต้อง "กลับเหมือนเดิม" ถึงเรียกว่ายืดหยุ่น' },
    heat:    { name: 'การนำความร้อน', rec: 'เล่นครัวร้อนฉ่าอีกรอบ ดูว่าเนยที่ปลายช้อนละลายเร็วหรือช้า' },
    elec:    { name: 'การนำไฟฟ้า', rec: 'เล่นหอไฟฟ้าแปลบอีกรอบ ลองต่อวงจรกับวัสดุหลาย ๆ ชนิด' },
    states:  { name: 'สถานะของสสาร', rec: 'เล่นท่าเรือสามสถานะอีกรอบ จำสมบัติ: รูปร่างคงที่ / ไหลตามภาชนะ / แผ่เต็มภาชนะ' },
    apply:   { name: 'เลือกใช้วัสดุและตรวจข้ออ้าง', rec: 'ฝึกคิดว่างานแต่ละส่วนต้องการสมบัติอะไร แล้วทดสอบก่อนเชื่อเสมอ' }
  };
})();
