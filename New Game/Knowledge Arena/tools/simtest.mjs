// Headless self-check: a full 4-bot match with real bank questions must finish with sane scores.
// node "New Game/Knowledge Arena/tools/simtest.mjs"
import assert from 'node:assert/strict';
import { createMatch, step, ranking, STEP, POINTS } from '../js/sim.js';
import { createDeck, GENERAL_CATS } from '../../คลังข้อมูลเนื้อและโจทย์/index.js';

const decks = {};
const ask = (p, d, cat) => {
  const k = `${p.band}:${cat}`;
  decks[k] ||= createDeck('general', p.band, cat, { seed: 7 });
  return { ...decks[k].next(d), cat };
};
const players = [1, 2, 3, 4].map((b) => ({ id: 'b' + b, name: 'บอท' + b, look: {}, bot: true, band: b }));
const m = createMatch({ players, duration: 180, cats: GENERAL_CATS.map((c) => c.id), ask });
let quizzes = 0, falls = 0, hits = 0;
while (!m.over) {
  step(m, STEP);
  for (const e of m.events) { if (e.t === 'quiz') quizzes++; if (e.t === 'fall') falls++; if (e.t === 'hit') hits++; }
  m.events.length = 0;
}
const r = ranking(m);
for (const p of r) console.log(p.name, 'band', p.band, 'score', p.score, JSON.stringify(p.src), 'right', p.right, 'wrong', p.wrong, 'lvl', p.lvl);
console.log({ quizzes, falls, hits });
assert.ok(quizzes >= 8, 'questions should happen often');
for (const p of r) {
  assert.ok(p.src.fight <= POINTS.fightCap);
  assert.ok(Number.isFinite(p.score) && p.score >= 0);
  assert.equal(p.score, Object.values(p.src).reduce((a, b) => a + b, 0));
}
const tot = r.reduce((a, p) => a + p.src.quiz, 0), fight = r.reduce((a, p) => a + p.src.fight, 0);
assert.ok(tot > fight * 2, 'knowledge must outweigh combat');
console.log('ok');
