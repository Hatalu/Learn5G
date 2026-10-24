// ตรวจคลังโจทย์ทั้งหมด: node tools/validate.mjs
// - ทุกหัวข้อมีบทเรียน + โจทย์ครบ 3 ระดับ
// - คำตอบถูกไม่ซ้ำตัวลวง, ตัวลวงอย่างน้อย 2 ตัวไม่ซ้ำกัน
// - ไม่มีค่าว่าง/NaN/undefined, ไม่มีอิโมจิ, ตัวเลือกยาวไม่เกินป้าย
import { SUBJECTS, GRADES, listTopics, createDeck } from '../index.js';

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
const MAX_CHOICE = 26;
const VISUALS = new Set(['numberline', 'blocks', 'compare', 'table', 'shapes', 'ruler', 'scale', 'picto', 'groups', 'clock', 'dial', 'coins', 'place', 'longdiv', 'frac', 'fraccompare', 'angle', 'rect', 'bars', 'grid100', 'box', 'lines', 'tree', 'ratio', 'circle', 'pie',
  'pairs', 'plant', 'flow', 'magnets', 'particles', 'moon', 'planets', 'forces', 'circuit', 'eclipse', 'letters', 'prep', 'arrows']);
let errors = 0, questions = 0, topics = 0, lessonCards = 0;
const perTopic = {};
const err = (where, msg) => { errors++; perTopic[where] = (perTopic[where] || 0) + 1; if (perTopic[where] <= 2) console.log(`  x ${where}: ${msg}`); };

for (const s of SUBJECTS) {
  for (const g of GRADES) {
    const list = listTopics(s.id, g);
    if (list.length < 4) err(`${s.id} ป.${g}`, `หัวข้อน้อยเกินไป (${list.length})`);
    for (const t of list) {
      topics++;
      const where = `${s.id} ป.${g} ${t.id}`;
      const deck = createDeck(s.id, g, t.id, { seed: 12345 });
      const L = deck.topic.lesson || [];
      if (L.length < 5) err(where, `บทเรียนสั้นเกินไป (${L.length} การ์ด)`);
      for (const c of L) {
        if (!c.t || !c.x) err(where, `การ์ดไม่ครบ: ${JSON.stringify(c)}`);
        if (EMOJI.test(`${c.t}${c.x}${c.ex || ''}`)) err(where, `การ์ดมีอิโมจิ: ${c.t}`);
        if (c.v && !VISUALS.has(c.v.type)) err(where, `ภาพไม่รู้จัก: ${c.v.type}`);
      }
      lessonCards += L.length;
      if (deck.topic.qs) for (const d of [1, 2, 3]) if (!deck.topic.qs.some((q) => q[0] === d)) err(where, `ไม่มีโจทย์ระดับ ${d}`);
      const runs = deck.topic.qs ? 12 : 60; // generators: sample many seeds
      for (const d of [1, 2, 3]) {
        for (let i = 0; i < runs; i++) {
          let q;
          try { q = deck.next(d); } catch (e) { err(where, `d${d} crash ${e.message}`); continue; }
          questions++;
          const txt = [q.q, q.a, ...q.choices, q.hint, q.explain].join(' | ');
          if (/undefined|NaN|null|Infinity/.test(txt)) err(where, `ค่าผิด: ${txt}`);
          if (EMOJI.test(txt)) err(where, `มีอิโมจิ: ${txt}`);
          if (q.choices.length !== 3) err(where, `ตัวเลือกไม่ครบ 3: ${q.q} -> ${q.choices.join(' / ')}`);
          if (new Set(q.choices).size !== q.choices.length) err(where, `ตัวเลือกซ้ำ: ${q.q} -> ${q.choices.join(' / ')}`);
          if (q.choices[q.answer] !== q.a) err(where, `index คำตอบผิด: ${q.q}`);
          if (q.choices.some((c) => !String(c).trim())) err(where, `ตัวเลือกว่าง: ${q.q}`);
          if (q.choices.some((c) => String(c).length > MAX_CHOICE)) err(where, `ตัวเลือกยาวเกิน: ${q.choices.join(' / ')}`);
          if (/^-/.test(q.a)) err(where, `คำตอบติดลบ: ${q.q} = ${q.a}`);
        }
      }
    }
  }
}
console.log(`\nหัวข้อ ${topics} | การ์ดบทเรียน ${lessonCards} | ตรวจโจทย์ ${questions} ข้อ | ผิด ${errors}`);
process.exit(errors ? 1 : 0);
