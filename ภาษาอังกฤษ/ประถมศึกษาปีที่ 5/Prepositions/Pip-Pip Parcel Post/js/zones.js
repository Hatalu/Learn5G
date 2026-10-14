/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — โซนทั้ง 6 และภารกิจ (gen = ฟังก์ชันสุ่มโจทย์ใหม่ทุกครั้ง)
   ทักษะ: E = สำรวจ · L = ฟัง · R = อ่าน · S = พูด · W = เขียน
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { D, G } = PP;
  const { pick, shuffle, sample } = D;

  PP.SKILLS = { L: { th: 'ฟัง', en: 'Listening' }, R: { th: 'อ่าน', en: 'Reading' }, S: { th: 'พูด', en: 'Speaking' }, W: { th: 'เขียน', en: 'Writing' }, E: { th: 'สำรวจ', en: 'Explore' } };
  const ALL = ['in', 'on', 'at', 'under', 'above', 'between'];
  const task = (skill, title, gen, extra) => Object.assign({ skill, tag: PP.SKILLS[skill].th + ' · ' + PP.SKILLS[skill].en, title, gen }, extra || {});
  const E = (i, p, o) => D.entryOf(i, p, o);
  const ANSWERABLE = ['cat', 'parcel', 'ball', 'bird', 'pip', 'book'];
  const withKeys = a => a.filter(e => ANSWERABLE.indexOf(e.i) >= 0);
  const timeOf = prep => pick(D.TSENT.filter(t => t.prep === prep));
  const methodOf = prep => pick(D.METHOD.filter(m => m.prep === prep && !m.noPool));
  const note = id => D.NOTES.find(n => n.id === id);
  const mail = id => D.MAIL.find(m => m.id === id);

  const ZONES = [
    /* ───────── 1 ซอยตู้ไปรษณีย์ : in on at ───────── */
    {
      id: 1, name: 'ซอยตู้ไปรษณีย์', en: 'Mailbox Lane', bld: 'mailbox', voice: 'z1', music: 'play',
      learn: 'ใช้ in, on, at บอกตำแหน่งของสิ่งของ (ฟัง อ่าน พูด เขียน)',
      tasks: [
        task('E', 'ปิ๊บสาธิต: in on at', () => ({
          type: 'explore', kind: 'place', inst: 'แตะคำเล็ก ๆ แล้วดูพัสดุเคลื่อนที่ไปอยู่ตรงไหน', words: ['in', 'on', 'at'],
          layout: { env: 'outdoor', objs: [['box', 62], ['chair', 176], ['door', 320]] },
          entries: { in: E('parcel', 'in', 'box'), on: E('parcel', 'on', 'chair'), at: E('parcel', 'at', 'door') },
          hint: 'แตะ in, on, at ทีละคำ แล้วดูว่าพัสดุไปอยู่ตรงไหน', intro: { id: 'l_tapWord', en: 'Tap a word!', th: 'แตะคำเลย! ดูพัสดุเคลื่อนที่' }
        })),
        task('L', 'ฟังแล้ววางพัสดุ', () => G.dropRounds(1, 3)),
        task('R', 'ซ่อมป้ายพัสดุ', () => ({ type: 'fix', qs: G.spread(['in', 'on', 'at'], 3).map(e => G.fixPlace(e, ['in', 'on', 'at'])) })),
        task('S', 'พูดตามปิ๊บ', () => { const [a, b] = G.spread(['in', 'on', 'at'], 2); return { type: 'say', items: [G.sayEcho(a), G.sayDescribe(b)] }; }),
        task('W', 'เรียงประโยคบนป้าย', () => ({ type: 'build', items: G.spread(['in', 'on', 'at'], 2).map(e => G.buildPlace(e, ['in', 'on', 'at'])) }))
      ],
      bonus: { skill: 'L', tag: 'ท้าทาย · Challenge', title: 'ฟังแล้วเลือกภาพ', gen: () => G.pickScene(G.spreadPick(['in', 'on', 'at'], 3), 'listen') },
      easy: { skill: 'L', tag: 'ซ้อมเพิ่ม · Practice', title: 'วางพัสดุสบาย ๆ (มีตัวหนังสือช่วย)', gen: () => G.dropRounds(1, 2, true) },
      book: [['in', 'อยู่ข้างใน เช่น in the box (ในกล่อง)'], ['on', 'อยู่บนผิวของสิ่งนั้น เช่น on the chair (บนเก้าอี้)'], ['at', 'อยู่ตรงจุดหนึ่ง เช่น at the door (ตรงประตู) at the bus stop (ที่ป้ายรถเมล์)'], ['ประโยค', 'The parcel is in the box. = พัสดุอยู่ในกล่อง']],
      teacher: ['in กับ on ต่างกันอย่างไร ลองยกตัวอย่างจากสิ่งของในห้องเรียน', 'ในห้องเรียนมีที่ไหนบ้างที่พูดว่า at ได้ (at the door, at the board)']
    },

    /* ───────── 2 เนินชั้นวางของ : under above between ───────── */
    {
      id: 2, name: 'เนินชั้นวางของ', en: 'Shelf Hill', bld: 'shelf', voice: 'z2', music: 'play',
      learn: 'ใช้ under, above, between บอกตำแหน่งของสิ่งของ',
      tasks: [
        task('E', 'ปิ๊บสาธิต: under above between', () => ({
          type: 'explore', kind: 'place', inst: 'แตะคำเล็ก ๆ แล้วดูพัสดุเคลื่อนที่ไปอยู่ตรงไหน', words: ['under', 'above', 'between'],
          layout: { env: 'indoor', pair: ['chair', 'table'] },
          entries: { under: E('parcel', 'under', 'table'), above: E('parcel', 'above', 'table'), between: E('parcel', 'between', ['chair', 'table']) },
          hint: 'above คือลอยอยู่เหนือโดยไม่แตะ (พัสดุมีร่มชูชีพ) · between คืออยู่ตรงกลางสองสิ่ง', intro: { id: 'l_tapWord', en: 'Tap a word!', th: 'แตะคำเลย! ดูพัสดุเคลื่อนที่' }
        })),
        task('L', 'ฟังแล้ววางพัสดุ', () => G.dropRounds(2, 3)),
        task('R', 'อ่านแล้วเลือกภาพ', () => G.pickScene(G.spreadPick(['under', 'above', 'between'], 3), 'read')),
        task('S', 'พูดบรรยายภาพ', () => {
          const [a, b, c] = G.spread(['between', 'under', 'above'], 3, e => ANSWERABLE.indexOf(e.i) >= 0 && e.i !== 'book');
          return { type: 'say', items: [G.sayEcho(a), G.sayDescribe(b), G.sayAnswer(c)] };
        }),
        task('W', 'สะกดคำเล็ก ๆ', () => ({ type: 'spell', items: ['under', 'above', 'between'].map(p => G.spellPlace(pick(D.ENTRIES.filter(e => e.p === p && e.i !== 'boat')))) }))
      ],
      bonus: { skill: 'W', tag: 'ท้าทาย · Challenge', title: 'เรียงประโยคบนป้าย', gen: () => ({ type: 'build', items: G.spread(['under', 'above', 'between'], 2).map(e => G.buildPlace(e, ['under', 'above', 'between'])) }) },
      easy: { skill: 'L', tag: 'ซ้อมเพิ่ม · Practice', title: 'ฟังแล้วเลือกภาพสบาย ๆ', gen: () => G.pickScene(G.spreadPick(['under', 'above', 'between'], 2), 'listen') },
      book: [['under', 'อยู่ใต้ เช่น under the table (ใต้โต๊ะ)'], ['above', 'อยู่เหนือขึ้นไป ไม่แตะ เช่น above the tree (เหนือต้นไม้)'], ['between', 'อยู่ตรงกลางระหว่างสองสิ่ง เช่น between the box and the basket'], ['on ≠ above', 'on = แตะผิวของสิ่งนั้น · above = อยู่สูงกว่าแต่ไม่แตะ']],
      teacher: ['above กับ on ต่างกันอย่างไร (ลองให้ถือหนังสือไว้เหนือโต๊ะ แล้ววางบนโต๊ะ)', 'between ต้องมีกี่สิ่ง ยกตัวอย่างในห้องเรียน']
    },

    /* ───────── 3 ลานแผนที่ : รวมคำบอกตำแหน่ง ───────── */
    {
      id: 3, name: 'ลานแผนที่', en: 'Map Square', bld: 'sign', voice: 'z3', music: 'play',
      learn: 'ใช้ in, on, at, under, above, between ให้ตรงกับภาพ จากการอ่านโน้ตและฟังข้อความ',
      tasks: [
        task('R', 'อ่านโน้ตจากลูกค้า', () => G.notes(note(pick(['n1', 'n2'])))),
        task('L', 'ฟังข้อความเสียง', () => G.mail(mail('vm1'))),
        task('L', 'ฟังแล้ววางพัสดุ (รวมทุกคำ)', () => G.dropRounds(3, 3)),
        task('S', 'ตอบคำถามของปิ๊บ', () => {
          const [a, b, c] = G.spread(ALL, 3, e => ANSWERABLE.indexOf(e.i) >= 0);
          return { type: 'say', items: [G.sayAnswer(a), G.sayAnswer(b), G.sayDescribe(c)] };
        }),
        task('W', 'เขียนตามคำบอก', () => ({ type: 'build', items: G.spread(ALL, 2).map(e => G.buildPlace(e, ALL, true)) }))
      ],
      bonus: { skill: 'L', tag: 'ท้าทาย · Challenge', title: 'ฟังข้อความเสียงอีกฉบับ', gen: () => G.mail(mail('vm2')) },
      easy: { skill: 'R', tag: 'ซ้อมเพิ่ม · Practice', title: 'ซ่อมป้ายสบาย ๆ', gen: () => ({ type: 'fix', qs: G.spread(ALL, 2).map(e => G.fixPlace(e, ALL)) }) },
      book: [['อ่านโน้ต', 'หาคำเล็ก ๆ (in on at under above between) แล้วดูว่าบอกตำแหน่งของอะไร'], ['ฟังข้อความ', 'ตั้งใจฟังคำเล็ก ๆ และชื่อของที่วาง เช่น on the table, under the table'], ['พูด', 'ตอบ Where is...? ด้วยประโยคเต็ม เช่น The cat is under the table.']],
      teacher: ['ให้นักเรียนจับคู่ ฝึกถามตอบ Where is my pencil? ในห้องเรียน', 'ถ้าฟังไม่ทัน ควรทำอย่างไร (ขอฟังอีกครั้ง / ฟังช้า ๆ)']
    },

    /* ───────── 4 หอนาฬิกา : at on in บอกเวลา ───────── */
    {
      id: 4, name: 'หอนาฬิกา', en: 'Clock Tower', bld: 'clock', voice: 'z4', music: 'play',
      learn: 'ใช้ at (จุดเวลา) on (วัน) in (ช่วงเวลายาว) บอกเวลา',
      tasks: [
        task('E', 'ปิ๊บสาธิต: at on in', () => ({
          type: 'explore', kind: 'time', inst: 'แตะ at / on / in เพื่อดูว่าใช้กับเวลาแบบไหน', words: ['at', 'on', 'in'], examples: G.timeExamples(),
          hint: 'at = จุดเวลา · on = วัน · in = ช่วงเวลายาว', intro: { id: 'l_sortTime', en: 'Which little word? At, on or in?', th: 'ใช้คำไหนดี? at, on หรือ in?' }
        })),
        task('R', 'ประตู at / on / in', () => ({ type: 'gate', gates: ['at', 'on', 'in'], cards: G.deck({ at: 2, on: 2, in: 2 }, ['at_7', 'at_9', 'at_330', 'at_noon', 'on_mon', 'on_fri', 'on_sun', 'in_jun', 'in_dec', 'in_summer', 'in_rainy']) })),
        task('R', 'ซ่อมป้ายเวลา', () => ({ type: 'fix', qs: shuffle(['at', 'on', 'in']).map(p => G.fixTime(timeOf(p))) })),
        task('L', 'ฟังข้อความเสียง', () => G.mail(mail('vm3'))),
        task('S', 'พูดเรื่องเวลา', () => ({ type: 'say', items: [G.sayTime(timeOf('at')), G.sayTime(pick([timeOf('in'), timeOf('on')])), G.sayAskTime()] })),
        task('W', 'เรียงประโยคเวลา', () => ({ type: 'build', items: [timeOf('at'), timeOf(pick(['on', 'in']))].map(t => G.buildTime(t)) }))
      ],
      bonus: { skill: 'R', tag: 'ท้าทาย · Challenge', title: 'ประตู at / on / in (การ์ดเยอะขึ้น)', gen: () => ({ type: 'gate', gates: ['at', 'on', 'in'], cards: G.deck({ at: 3, on: 3, in: 3 }) }) },
      easy: { skill: 'R', tag: 'ซ้อมเพิ่ม · Practice', title: 'ซ่อมป้ายเวลาสบาย ๆ', gen: () => ({ type: 'fix', qs: [timeOf('at'), timeOf('on')].map(t => G.fixTime(t)) }) },
      book: [['at', 'จุดเวลา: at seven o\'clock, at noon, at night'], ['on', 'วัน/วันที่: on Monday, on 5 May, on my birthday'], ['in', 'ช่วงเวลายาว: in June, in summer, in 2026, in the morning'], ['จำง่าย ๆ', 'at = จุด · on = วัน · in = ช่วงยาว']],
      teacher: ['ให้นักเรียนเล่ากิจวัตรประจำวัน ใช้ at / on / in', 'ทำไม at night แต่ in the morning (ข้อยกเว้นที่ต้องจำ)']
    },

    /* ───────── 5 ท่าเรือ : by with ───────── */
    {
      id: 5, name: 'ท่าเรือไปรษณีย์', en: 'Harbor Station', bld: 'harbor', voice: 'z5', music: 'play',
      learn: 'ใช้ by กับยานพาหนะ และ with กับเครื่องมือ',
      tasks: [
        task('E', 'ปิ๊บสาธิต: by with', () => ({
          type: 'explore', kind: 'method', inst: 'แตะ by หรือ with แล้วฟังตัวอย่าง', words: ['by', 'with'], examples: G.methodExamples(),
          hint: 'by ใช้กับยานพาหนะ · with ใช้กับเครื่องมือ', intro: { en: 'By or with?', th: 'by หรือ with?' }
        })),
        task('R', 'ซ่อมป้ายวิธีส่ง', () => ({ type: 'fix', qs: [methodOf('by'), methodOf('with'), pick([methodOf('by'), methodOf('with')])].map(m => G.fixMethod(m)) })),
        task('L', 'ฟังข้อความเสียง', () => G.mail(mail('vm4'))),
        task('S', 'พูดเรื่องวิธีการ', () => ({ type: 'say', items: [G.sayMethod(methodOf('by')), G.sayMethod(methodOf('with')), G.sayAskGo()] })),
        task('W', 'สะกด by / with', () => ({ type: 'spell', items: [G.spellMethod(methodOf('by')), G.spellMethod(methodOf('with'))] }))
      ],
      bonus: { skill: 'R', tag: 'ท้าทาย · Challenge', title: 'อ่านโน้ตจากลูกค้า', gen: () => G.notes(note('n4')) },
      easy: { skill: 'R', tag: 'ซ้อมเพิ่ม · Practice', title: 'ซ่อมป้ายสบาย ๆ', gen: () => ({ type: 'fix', qs: [methodOf('by'), methodOf('with')].map(m => G.fixMethod(m)) }) },
      book: [['by', 'วิธีเดินทาง/ส่งของ ใช้กับยานพาหนะ: by bus, by boat, by plane (ไม่ใส่ a/the)'], ['with', 'ใช้เครื่องมือทำสิ่งต่าง ๆ: with scissors, with a pen'], ['จำง่าย ๆ', 'by = ยานพาหนะ · with = เครื่องมือ']],
      teacher: ['ให้นักเรียนบอกว่ามาโรงเรียนอย่างไร (by bus / by bike / on foot)', 'with ใช้กับอะไรได้อีกบ้างในห้องเรียน (write with a pencil)']
    },

    /* ───────── 6 หอคอยฟู่ว : ด่านสุดท้าย (รวมทุกอย่าง) ───────── */
    {
      id: 6, name: 'หอคอยฟู่ว', en: 'Whoosh Tower', bld: 'tower', voice: 'z6', music: 'boss', boss: true,
      learn: 'รวมทุกอย่าง: ตำแหน่ง เวลา และวิธีการ ครบทั้งฟัง พูด อ่าน เขียน',
      tasks: [
        task('L', 'ฟังแล้ววางพัสดุ', () => G.dropRounds(3, 3)),
        task('R', 'อ่านโน้ตลับ', () => G.notes(note('n5'))),
        task('L', 'ฟังข้อความเสียง', () => G.mail(mail('vm5'))),
        task('S', 'พูดสู้ฟู่ว', () => {
          const a = pick(withKeys(D.ENTRIES));
          return { type: 'say', items: [G.sayDescribe(a), G.sayTime(pick(D.TSENT)), G.sayMethod(pick(D.METHOD.filter(m => !m.noPool)))] };
        }),
        task('W', 'เขียนตามคำบอก', () => {
          const a = pick(D.ENTRIES);
          return { type: 'build', items: [G.buildPlace(a, ALL, true), G.buildTime(pick(D.TSENT), true), G.buildMethod(pick(D.METHOD.filter(m => !m.noPool)), true)] };
        })
      ],
      book: [['สรุป', 'ตำแหน่ง: in on at under above between · เวลา: at on in · วิธีการ: by with']],
      teacher: ['ให้นักเรียนเขียนประโยคของตัวเอง 3 ประโยค (ตำแหน่ง เวลา วิธีการ)', 'ทักษะไหนที่นักเรียนยังต้องฝึก (ฟัง พูด อ่าน เขียน) ดูจากรายงาน']
    }
  ];

  PP.ZONES = ZONES;
})();
