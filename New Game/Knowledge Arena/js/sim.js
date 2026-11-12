// Knowledge Arena — match simulation (no rendering, no DOM).
// Runs on the host (or offline). Everyone else only renders snapshots and sends inputs/answers.
// Units: metres on the XZ plane, seconds. Fixed step = STEP.

export const STEP = 1 / 60;
export const ARENA_R = 19;
export const ZONE_R = 3.4;
export const OBSTACLES = [
  { x: 6.5, z: 4, r: 1.1, k: 'rock' }, { x: -6, z: -4.5, r: 1.1, k: 'rock' },
  { x: -10, z: 9.5, r: 1.3, k: 'tree' }, { x: 11, z: -9, r: 1.3, k: 'tree' }, { x: 13.5, z: 7, r: 1.2, k: 'tree' }, { x: -13.5, z: -6.5, r: 1.2, k: 'tree' },
  { x: 3.5, z: -12, r: 0.9, k: 'crystal' }, { x: -3.5, z: 12.5, r: 0.9, k: 'crystal' },
];
export const HAZARDS = [{ x: -9, z: 1.5, r: 2.4 }, { x: 9.5, z: -1, r: 2.4 }]; // honey puddles (slow)
export const BOUNCERS = [{ x: 0, z: 8, r: 1.1 }, { x: 0, z: -8, r: 1.1 }]; // mushroom pads: bounce you away
const ZONE_SPOTS = [[0, 0], [8, 9], [-8, -9], [-11, 3], [11, -3]];
const ORB_SPOTS = [[14, 2], [-14, -2], [3, 15], [-2, -15], [9, -12], [-9, 12]];
export const SKILLS = {
  speed: { name: 'วิ่งเร็ว', dur: 6 },
  shield: { name: 'โล่ฟอง', dur: 12 },
  wave: { name: 'คลื่นกระแทก', dur: 0 },
  magnet: { name: 'แม่เหล็ก', dur: 8 },
  double: { name: 'แต้มคูณสอง', dur: 10 },
};
const SKILL_IDS = Object.keys(SKILLS);
export const POINTS = { right: { 1: 100, 2: 120, 3: 150 }, coin: 10, gem: 25, zonePerSec: 4, hit: 5, ringOut: 20, fightCap: 150 };
const MISSIONS = [
  { k: 'coin', need: 5, pts: 50, text: 'เก็บดาว 5 ดวง' },
  { k: 'right', need: 2, pts: 80, text: 'ตอบถูก 2 ข้อ' },
  { k: 'zone', need: 5, pts: 60, text: 'ยึดวงมงกุฎ 5 วิ' },
  { k: 'gem', need: 2, pts: 50, text: 'เก็บเพชร 2 เม็ด' },
  { k: 'bonk', need: 3, pts: 40, text: 'ชนคู่แข่ง 3 ครั้ง' },
];
// Age band -> allowed question levels (adaptive inside the band).
export const BAND_LV = { 1: [1, 2], 2: [1, 3], 3: [2, 3], 4: [2, 3] };
const Q_TIME = { 1: 22, 2: 20, 3: 18, 4: 16 };

const rnd = (a, b) => a + Math.random() * (b - a);
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export function createMatch({ players, duration = 180, cats, ask }) {
  // ask(player, d, cat) -> { q, choices, answer, hint, explain, d, cat }
  const m = {
    t: 0, dur: duration, over: false, cats, ask,
    zone: { i: 0, x: 0, z: 0, owner: null, next: 40 },
    items: [], nextItem: 0, itemId: 1,
    orbs: ORB_SPOTS.map(([x, z], i) => ({ i, x, z, on: i % 2 === 0, wait: rnd(2, 8) })),
    players: [], events: [],
  };
  players.forEach((pl, i) => {
    const a = (i / players.length) * Math.PI * 2 + 0.4;
    const lv = BAND_LV[pl.band || 2];
    m.players.push({
      id: pl.id, name: pl.name, look: pl.look, bot: !!pl.bot, band: pl.band || 2, acc: pl.acc ?? 0.72,
      x: Math.cos(a) * 9, z: Math.sin(a) * 9, vx: 0, vz: 0, face: a + Math.PI, y: 0,
      st: 'play', fallT: 0, stun: 0, inv: 2, dashT: 0, dashCd: 0, atkCd: 0, atkT: 0, hitCd: {},
      skill: null, eff: { speed: 0, shield: 0, magnet: 0, double: 0 }, shieldHits: 0,
      score: 0, src: { quiz: 0, item: 0, mission: 0, zone: 0, fight: 0 }, zoneAcc: 0,
      lvl: Math.min(lv[1], Math.max(lv[0], 2 - (pl.band === 1 ? 1 : 0))), streak: 0, catI: i,
      mission: null, missionI: i, log: [], right: 0, wrong: 0,
      quiz: null, in: { mx: 0, mz: 0, atk: false, dash: false, skill: false },
      ai: { t: 0, gx: 0, gz: 0, ans: 0 },
    });
  });
  m.players.forEach((p) => newMission(m, p));
  for (let k = 0; k < 8; k++) spawnItem(m);
  return m;
}

function emit(m, e) { m.events.push(e); }
function add(m, p, src, pts) {
  if (src === 'fight') { pts = Math.min(pts, POINTS.fightCap - p.src.fight); if (pts <= 0) return 0; }
  p.src[src] += pts; p.score += pts;
  return pts;
}
function newMission(m, p) {
  const d = MISSIONS[p.missionI++ % MISSIONS.length];
  p.mission = { k: d.k, need: d.need, have: 0, pts: d.pts, text: d.text };
}
function progress(m, p, k, n = 1) {
  const ms = p.mission;
  if (!ms || ms.k !== k) return;
  ms.have = Math.min(ms.need, ms.have + n);
  if (ms.have >= ms.need) {
    add(m, p, 'mission', ms.pts);
    emit(m, { t: 'mission', id: p.id, pts: ms.pts, text: ms.text, x: p.x, z: p.z });
    newMission(m, p);
  }
}
function safeSpot() {
  for (let k = 0; k < 30; k++) {
    const a = rnd(0, Math.PI * 2), r = rnd(2, ARENA_R - 3);
    const s = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    if (OBSTACLES.every((o) => dist2(o, s) > (o.r + 1.2) ** 2) && HAZARDS.every((h) => dist2(h, s) > (h.r + 0.6) ** 2)) return s;
  }
  return { x: 0, z: 0 };
}
function spawnItem(m) {
  const s = safeSpot();
  m.items.push({ id: m.itemId++, k: Math.random() < 0.18 ? 'gem' : 'coin', x: s.x, z: s.z });
}

// ---------------- answers ----------------
export function answer(m, id, idx) {
  const p = m.players.find((x) => x.id === id);
  if (!p || p.st !== 'quiz' || !p.quiz || m.over) return;
  const qz = p.quiz, q = qz.q;
  if (idx === qz.elim || idx < 0 || idx >= q.choices.length) return;
  const ok = idx === q.answer;
  const band = BAND_LV[p.band];
  if (ok) {
    let pts = POINTS.right[q.d] || 100;
    if (qz.tries) pts = Math.round(pts / 2);
    pts = add(m, p, 'quiz', pts);
    p.right++; p.streak++;
    if (p.streak >= 2 && p.lvl < band[1]) { p.lvl++; p.streak = 0; }
    let skill = null, bonus = 0;
    if (!qz.tries || Math.random() < 0.5) {
      skill = SKILL_IDS[Math.floor(Math.random() * SKILL_IDS.length)];
      if (p.skill) bonus = add(m, p, 'quiz', 20); else p.skill = skill;
    }
    p.log.push({ q: q.q, a: q.choices[q.answer], ok: true, tries: qz.tries, cat: q.cat, explain: q.explain, d: q.d });
    progress(m, p, 'right');
    emit(m, { t: 'qres', id, ok: true, final: true, pts: pts + bonus, skill: bonus ? null : skill, x: p.x, z: p.z, a: q.answer });
    leaveQuiz(p);
    return;
  }
  p.streak = 0;
  if (!qz.tries) {
    qz.tries = 1; qz.elim = idx; qz.time = Math.max(qz.time, 10);
    emit(m, { t: 'qres', id, ok: false, final: false, elim: idx, hint: q.hint });
    return;
  }
  p.wrong++;
  if (p.lvl > band[0]) p.lvl--;
  p.log.push({ q: q.q, a: q.choices[q.answer], ok: false, tries: 2, cat: q.cat, explain: q.explain, d: q.d });
  emit(m, { t: 'qres', id, ok: false, final: true, a: q.answer, explain: q.explain });
  leaveQuiz(p);
}
function leaveQuiz(p) { p.quiz = null; p.st = 'play'; p.inv = 1.2; }
function startQuiz(m, p) {
  const cat = m.cats[p.catI++ % m.cats.length];
  const q = m.ask(p, p.lvl, cat);
  p.st = 'quiz'; p.vx = p.vz = 0;
  p.quiz = { q, tries: 0, elim: -1, time: Q_TIME[p.band] || 20 };
  p.ai.ans = rnd(2.2, 5.5);
  emit(m, { t: 'quiz', id: p.id, q: { q: q.q, choices: q.choices, cat: q.cat, d: q.d }, time: p.quiz.time });
}

// ---------------- skills / combat ----------------
function useSkill(m, p) {
  const s = p.skill;
  if (!s) return;
  p.skill = null;
  if (s === 'wave') {
    for (const o of m.players) {
      if (o === p || o.st !== 'play' || o.inv > 0) continue;
      const d = Math.sqrt(dist2(o, p));
      if (d < 4.6) knock(m, p, o, (o.x - p.x) / (d || 1), (o.z - p.z) / (d || 1), 13, 0.6, true);
    }
  } else if (s === 'shield') { p.eff.shield = SKILLS.shield.dur; p.shieldHits = 2; }
  else p.eff[s] = SKILLS[s].dur;
  emit(m, { t: 'skill', id: p.id, s, x: p.x, z: p.z });
}
function knock(m, a, o, nx, nz, force, stun, noPts) {
  if (o.shieldHits > 0) {
    o.shieldHits--; if (!o.shieldHits) o.eff.shield = 0;
    o.vx += nx * force * 0.35; o.vz += nz * force * 0.35;
    emit(m, { t: 'block', id: o.id, x: o.x, z: o.z });
    return;
  }
  o.vx = nx * force; o.vz = nz * force; o.stun = stun; o.lastBy = a.id; o.lastByT = m.t;
  const pts = noPts ? 0 : add(m, a, 'fight', POINTS.hit);
  if (!noPts) progress(m, a, 'bonk');
  emit(m, { t: 'hit', id: o.id, by: a.id, pts, x: o.x, z: o.z });
}
function attack(m, p) {
  p.atkCd = 0.45; p.atkT = 0.22;
  const fx = Math.sin(p.face), fz = Math.cos(p.face);
  emit(m, { t: 'swing', id: p.id });
  for (const o of m.players) {
    if (o === p || o.st !== 'play' || o.inv > 0 || o.dashT > 0) continue;
    const dx = o.x - p.x, dz = o.z - p.z, d = Math.hypot(dx, dz);
    if (d > 1.9 || (dx * fx + dz * fz) / (d || 1) < 0.25) continue;
    if ((p.hitCd[o.id] || 0) > m.t) continue; // kid-friendly: no stun-locking the same player
    p.hitCd[o.id] = m.t + 1.1;
    knock(m, p, o, dx / (d || 1), dz / (d || 1), 11, 0.45);
  }
}

// ---------------- bots ----------------
function botThink(m, p, dt) {
  const ai = p.ai;
  if (p.st === 'quiz') {
    ai.ans -= dt;
    if (ai.ans <= 0) {
      const q = p.quiz.q;
      const right = Math.random() < p.acc + (p.quiz.tries ? 0.2 : 0) - (q.d - 2) * 0.08;
      const opts = q.choices.map((_, i) => i).filter((i) => i !== p.quiz.elim && i !== q.answer);
      answer(m, p.id, right ? q.answer : opts[Math.floor(Math.random() * opts.length)]);
      ai.ans = rnd(1.5, 3);
    }
    return;
  }
  ai.t -= dt;
  if (ai.t <= 0) {
    ai.t = rnd(0.25, 0.5);
    let best = null, bs = -1e9;
    const consider = (x, z, w) => { const s = w - Math.hypot(x - p.x, z - p.z); if (s > bs) { bs = s; best = { x, z }; } };
    for (const o of m.orbs) if (o.on) consider(o.x, o.z, 9);
    for (const it of m.items) consider(it.x, it.z, it.k === 'gem' ? 3 : 0);
    if (!m.zone.owner || m.zone.owner === p.id) consider(m.zone.x, m.zone.z, 4);
    if (Math.random() < 0.15) ai.aggro = !ai.aggro;
    for (const o of m.players) if (o !== p && o.st === 'play') consider(o.x, o.z, (ai.aggro ? 7 : -3) + (o.score > p.score ? 2 : 0));
    ai.gx = best ? best.x : 0; ai.gz = best ? best.z : 0;
    if (p.skill && (p.skill !== 'wave' || m.players.some((o) => o !== p && o.st === 'play' && dist2(o, p) < 12))) p.in.skill = true;
  }
  let dx = ai.gx - p.x, dz = ai.gz - p.z;
  for (const o of OBSTACLES) { const ox = p.x - o.x, oz = p.z - o.z, d = Math.hypot(ox, oz); if (d < o.r + 1.6) { dx += (ox / d) * 3; dz += (oz / d) * 3; } }
  for (const h of HAZARDS) { const ox = p.x - h.x, oz = p.z - h.z, d = Math.hypot(ox, oz); if (d < h.r + 1) { dx += (ox / d) * 2; dz += (oz / d) * 2; } }
  const r = Math.hypot(p.x, p.z);
  if (r > ARENA_R - 2.5) { dx -= (p.x / r) * 4; dz -= (p.z / r) * 4; }
  const L = Math.hypot(dx, dz);
  p.in.mx = L > 0.3 ? dx / L : 0; p.in.mz = L > 0.3 ? dz / L : 0;
  for (const o of m.players) {
    if (o === p || o.st !== 'play') continue;
    if (dist2(o, p) < 3 && p.atkCd <= 0 && Math.random() < 0.12) { p.face = Math.atan2(o.x - p.x, o.z - p.z); p.in.atk = true; }
  }
  if (p.stunWas && Math.random() < 0.3) p.in.dash = true;
}

// ---------------- step ----------------
export function step(m, dt = STEP) {
  if (m.over) return;
  m.t += dt;
  if (m.t >= m.dur) { m.over = true; emit(m, { t: 'end' }); return; }

  // capture zone hops around
  const z = m.zone;
  if (m.t >= z.next) {
    z.i = (z.i + 1 + Math.floor(Math.random() * (ZONE_SPOTS.length - 1))) % ZONE_SPOTS.length;
    [z.x, z.z] = ZONE_SPOTS[z.i]; z.next = m.t + 40;
    emit(m, { t: 'zonemove', x: z.x, z: z.z });
  }
  // question orbs respawn
  for (const o of m.orbs) if (!o.on && (o.wait -= dt) <= 0) { o.on = true; emit(m, { t: 'orb', i: o.i }); }
  // keep the field stocked
  if ((m.nextItem -= dt) <= 0) { m.nextItem = 1.4; if (m.items.length < 12) spawnItem(m); }

  for (const p of m.players) {
    if (p.bot) botThink(m, p, dt);
    for (const k in p.eff) if (p.eff[k] > 0) p.eff[k] = Math.max(0, p.eff[k] - dt);
    if (p.eff.shield <= 0) p.shieldHits = 0;
    p.inv = Math.max(0, p.inv - dt); p.atkCd = Math.max(0, p.atkCd - dt); p.atkT = Math.max(0, p.atkT - dt);
    p.dashCd = Math.max(0, p.dashCd - dt); p.dashT = Math.max(0, p.dashT - dt);
    p.stunWas = p.stun > 0; p.stun = Math.max(0, p.stun - dt);

    if (p.st === 'fall') {
      p.fallT += dt; p.y -= dt * (6 + p.fallT * 18);
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.fallT > 1.3) {
        const s = safeSpot(); Object.assign(p, { x: s.x, z: s.z, vx: 0, vz: 0, y: 6, st: 'play', inv: 2.2, stun: 0 });
        emit(m, { t: 'respawn', id: p.id, x: p.x, z: p.z });
      }
      clearIn(p); continue;
    }
    if (p.y > 0) p.y = Math.max(0, p.y - dt * 14);
    if (p.st === 'quiz') {
      p.quiz.time -= dt;
      if (p.quiz.time <= 0) {
        const q = p.quiz.q;
        p.log.push({ q: q.q, a: q.choices[q.answer], ok: false, tries: p.quiz.tries, cat: q.cat, explain: q.explain, d: q.d, late: true });
        emit(m, { t: 'qres', id: p.id, ok: false, final: true, a: q.answer, explain: q.explain, late: true });
        leaveQuiz(p);
      }
      clearIn(p); continue;
    }

    const inp = p.in;
    if (p.stun <= 0) {
      if (inp.skill) useSkill(m, p);
      if (inp.dash && p.dashCd <= 0) {
        p.dashT = 0.22; p.dashCd = 1.1;
        const L = Math.hypot(inp.mx, inp.mz);
        if (L > 0.2) p.face = Math.atan2(inp.mx, inp.mz);
        p.vx = Math.sin(p.face) * 17; p.vz = Math.cos(p.face) * 17;
        emit(m, { t: 'dash', id: p.id });
      }
      if (inp.atk && p.atkCd <= 0) attack(m, p);
    }
    clearIn(p);

    let sp = 6.2 * (p.eff.speed > 0 ? 1.5 : 1);
    if (HAZARDS.some((h) => dist2(h, p) < h.r * h.r)) sp *= 0.5;
    if (p.dashT <= 0) {
      const L = Math.min(1, Math.hypot(inp.mx, inp.mz));
      const tx = p.stun > 0 ? 0 : (L > 0.05 ? inp.mx / Math.max(L, 1e-6) * L : 0) * sp;
      const tz = p.stun > 0 ? 0 : (L > 0.05 ? inp.mz / Math.max(L, 1e-6) * L : 0) * sp;
      const k = 1 - Math.exp(-dt * (p.stun > 0 ? 3 : 12));
      p.vx += (tx - p.vx) * k; p.vz += (tz - p.vz) * k;
      if (L > 0.1 && p.stun <= 0) {
        const want = Math.atan2(inp.mx, inp.mz);
        let d = want - p.face; d = Math.atan2(Math.sin(d), Math.cos(d));
        p.face += d * Math.min(1, dt * 14);
      }
    }
    p.x += p.vx * dt; p.z += p.vz * dt;

    for (const o of OBSTACLES) {
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), min = o.r + 0.55;
      if (d < min) { p.x = o.x + (dx / (d || 1)) * min; p.z = o.z + (dz / (d || 1)) * min; }
    }
    for (const b of BOUNCERS) {
      const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz);
      if (d < b.r + 0.5) { p.vx = (dx / (d || 1)) * 13; p.vz = (dz / (d || 1)) * 13; p.y = 1.6; emit(m, { t: 'bounce', x: b.x, z: b.z, id: p.id }); }
    }
    if (Math.hypot(p.x, p.z) > ARENA_R + 0.4) {
      p.st = 'fall'; p.fallT = 0; p.stun = 0; p.skill = p.skill; // keep skill, no harsh penalty
      emit(m, { t: 'fall', id: p.id, x: p.x, z: p.z });
      if (p.lastBy && m.t - p.lastByT < 3) {
        const a = m.players.find((x) => x.id === p.lastBy);
        if (a) { const pts = add(m, a, 'fight', POINTS.ringOut); if (pts) emit(m, { t: 'ringout', id: a.id, pts, x: a.x, z: a.z }); }
      }
      p.lastBy = null;
      continue;
    }

    // pickups
    for (let i = m.items.length - 1; i >= 0; i--) {
      const it = m.items[i], d2 = dist2(it, p);
      if (p.eff.magnet > 0 && d2 < 49) { const d = Math.sqrt(d2) || 1; it.x += ((p.x - it.x) / d) * dt * 11; it.z += ((p.z - it.z) / d) * dt * 11; }
      if (d2 < 0.95) {
        m.items.splice(i, 1);
        const pts = add(m, p, 'item', (it.k === 'gem' ? POINTS.gem : POINTS.coin) * (p.eff.double > 0 ? 2 : 1));
        progress(m, p, it.k === 'gem' ? 'gem' : 'coin');
        emit(m, { t: 'pick', id: p.id, k: it.k, pts, x: it.x, z: it.z });
      }
    }
    for (const o of m.orbs) {
      if (o.on && dist2(o, p) < 1.3) { o.on = false; o.wait = rnd(7, 12); emit(m, { t: 'orbtake', i: o.i, id: p.id }); startQuiz(m, p); break; }
    }
  }

  // soft player separation
  const ps = m.players;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j];
    if (a.st === 'fall' || b.st === 'fall') continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
    if (d > 0 && d < 1.1) { const push = (1.1 - d) / 2, nx = dx / d, nz = dz / d; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push; }
  }

  // zone: only a lone holder scores
  const inside = ps.filter((p) => p.st === 'play' && dist2(p, z) < ZONE_R * ZONE_R);
  const owner = inside.length === 1 ? inside[0] : null;
  if ((owner?.id || null) !== z.owner) { z.owner = owner?.id || null; emit(m, { t: 'zoneowner', id: z.owner }); }
  if (owner) {
    owner.zoneAcc += dt * POINTS.zonePerSec * (owner.eff.double > 0 ? 2 : 1);
    if (owner.zoneAcc >= 1) { const n = Math.floor(owner.zoneAcc); owner.zoneAcc -= n; add(m, owner, 'zone', n); }
    owner.zoneSec = (owner.zoneSec || 0) + dt;
    if (owner.zoneSec >= 1) { owner.zoneSec -= 1; progress(m, owner, 'zone'); }
  }
}
function clearIn(p) { p.in.atk = p.in.dash = p.in.skill = false; }

export function ranking(m) {
  return m.players.slice().sort((a, b) => b.score - a.score || b.src.quiz - a.src.quiz);
}

// Plain-data view for the renderer / network. Keeps everything the screen needs and nothing secret.
export function snapshot(m) {
  return {
    t: m.t, dur: m.dur, over: m.over,
    zone: { x: m.zone.x, z: m.zone.z, owner: m.zone.owner, next: m.zone.next },
    items: m.items.map((it) => [it.id, it.k === 'gem' ? 1 : 0, +it.x.toFixed(2), +it.z.toFixed(2)]),
    orbs: m.orbs.map((o) => (o.on ? 1 : 0)),
    players: m.players.map((p) => ({
      id: p.id, name: p.name, look: p.look, bot: p.bot, band: p.band,
      x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), face: +p.face.toFixed(2),
      vx: +p.vx.toFixed(1), vz: +p.vz.toFixed(1), st: p.st, stun: p.stun > 0 ? 1 : 0, inv: p.inv > 0 ? 1 : 0,
      dash: p.dashT > 0 ? 1 : 0, atk: p.atkT > 0 ? 1 : 0, skill: p.skill,
      eff: { speed: +p.eff.speed.toFixed(1), shield: p.shieldHits, magnet: +p.eff.magnet.toFixed(1), double: +p.eff.double.toFixed(1) },
      score: p.score, src: p.src, mission: p.mission, lvl: p.lvl, right: p.right, wrong: p.wrong,
      qt: p.quiz ? +p.quiz.time.toFixed(1) : 0,
    })),
  };
}
export const ORB_POS = ORB_SPOTS;
export const ZONE_POS = ZONE_SPOTS;
