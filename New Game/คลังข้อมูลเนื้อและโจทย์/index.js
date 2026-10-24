// คลังข้อมูลเนื้อหาและโจทย์ Learn5G — ใช้ร่วมกันทุกเกม
// import { SUBJECTS, listTopics, getTopic, createDeck } from '../คลังข้อมูลเนื้อและโจทย์/index.js'
import { math } from './math.js';
import { science } from './science.js';
import { english } from './english.js';
import { mathLessons } from './lessons-math.js';
import { scienceLessons } from './lessons-science.js';
import { englishLessons } from './lessons-english.js';
import { rng, toPlayable } from './util.js';

export const SUBJECTS = [
  { id: 'math', name: 'คณิตศาสตร์', en: 'Math', color: '#ff8a3d', data: math },
  { id: 'science', name: 'วิทยาศาสตร์', en: 'Science', color: '#2fc28b', data: science },
  { id: 'english', name: 'ภาษาอังกฤษ', en: 'English', color: '#4c8dff', data: english },
];
export const GRADES = [1, 2, 3, 4, 5, 6];
export const LEVELS = [
  { d: 1, name: 'เริ่มต้น', en: 'Beginner' },
  { d: 2, name: 'ฝึกฝน', en: 'Intermediate' },
  { d: 3, name: 'ท้าทาย', en: 'Advanced' },
];

const subj = (id) => SUBJECTS.find((s) => s.id === id);

export function listTopics(subject, grade) {
  return (subj(subject)?.data[grade] || []).map((t) => ({ id: t.id, name: t.name }));
}

const FULL = { math: mathLessons, science: scienceLessons, english: englishLessons };
const card = (c) => (Array.isArray(c) ? { t: c[0], x: c[1], ex: c[2], v: c[3] } : c);

// Topic with its full lesson (every part of the chapter). Falls back to the short inline lesson.
export function getTopic(subject, grade, topicId) {
  const t = (subj(subject)?.data[grade] || []).find((x) => x.id === topicId);
  if (!t) return null;
  const full = FULL[subject]?.[grade]?.[topicId];
  return { ...t, lesson: (full || t.lesson).map(card) };
}

// Which lesson card best explains this question (character-bigram overlap; Thai has no spaces).
const grams = (s) => { const g = new Set(); s = String(s).toLowerCase().replace(/\s+/g, ''); for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; };
export function lessonFor(topic, q) {
  if (!topic?.lesson?.length) return null;
  const qg = grams(`${q.q} ${q.a} ${q.hint || ''}`);
  let best = 0, bestScore = -1;
  topic.lesson.forEach((c, i) => {
    const cg = grams(`${c.t} ${c.x} ${c.ex || ''}`);
    let hit = 0;
    for (const g of qg) if (cg.has(g)) hit++;
    const score = hit / Math.sqrt(cg.size + 1);
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return { index: best, card: topic.lesson[best] };
}

// Static tuple [d, q, a, w, hint] -> question object.
const fromTuple = (t, i, topicId) => ({ id: `${topicId}-${i}`, d: t[0], q: t[1], a: t[2], w: t[3], hint: t[4], explain: `${t[2]} — ${t[4]}` });

// A deck hands out questions one at a time at any difficulty without repeating.
export function createDeck(subject, grade, topicId, { seed = Date.now(), choices = 3 } = {}) {
  const topic = getTopic(subject, grade, topicId);
  if (!topic) throw new Error(`ไม่พบหัวข้อ ${subject}/${grade}/${topicId}`);
  const r = rng(seed);
  const seen = new Set();
  const pool = topic.qs ? topic.qs.map((t, i) => fromTuple(t, i, topic.id)) : null;

  function next(d = 1) {
    if (pool) {
      const order = [d, d - 1, d + 1, d - 2, d + 2].filter((x) => x >= 1 && x <= 3);
      for (const dd of order) {
        const left = pool.filter((q) => q.d === dd && !seen.has(q.id));
        if (left.length) { const q = r.pick(left); seen.add(q.id); return toPlayable(q, r, choices); }
      }
      seen.clear(); // used everything: start again
      return next(d);
    }
    let q;
    for (let k = 0; k < 25; k++) {
      q = topic.gen(d, r);
      if (!seen.has(q.q)) break;
    }
    seen.add(q.q);
    return toPlayable({ ...q, d, id: `${topic.id}-${seen.size}` }, r, choices);
  }
  return { topic, next };
}

// Convenience: a fixed list (e.g. for worksheets).
export function makeQuestions(subject, grade, topicId, { level = 1, count = 10, choices = 3, seed } = {}) {
  const deck = createDeck(subject, grade, topicId, { seed, choices });
  return Array.from({ length: count }, () => deck.next(level));
}
