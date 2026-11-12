// Knowledge Arena — screens, match flow, HUD, network glue, dev hook (window.KA).
import { Arena, COLORS, EARS, HATS } from './arena.js';
import { createMatch, step, snapshot, answer, ranking, STEP, SKILLS, ORB_POS } from './sim.js';
import { createInput, KEY_HELP } from './input.js';
import { connect, makeCode, cleanCode } from './net.js';
import { ICON, SKILL_ICON, CAT_ICON } from './icons.js';
import { sfx, music, setMuted, isMuted } from './audio.js';
import { createDeck, getTopic, lessonFor, GENERAL_CATS, AGE_BANDS } from '../../คลังข้อมูลเนื้อและโจทย์/index.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CAT = Object.fromEntries(GENERAL_CATS.map((c) => [c.id, c]));
const LV_NAME = { 1: 'ง่าย', 2: 'กลาง', 3: 'ท้าทาย' };
const rid = () => Math.random().toString(36).slice(2, 8);

// ---------------- save (localStorage, falls back to memory) ----------------
const SAVE_KEY = 'ka_v1';
const NAME_A = ['แมว', 'กระต่าย', 'หมี', 'จิ้งจอก', 'นกฮูก', 'แพนด้า', 'เพนกวิน', 'ช้างน้อย'];
const NAME_B = ['เก่ง', 'ซ่า', 'ใจดี', 'สายฟ้า', 'รอบรู้', 'ร่าเริง', 'ไวไว', 'ดาวเด่น'];
const randName = () => NAME_A[Math.floor(Math.random() * NAME_A.length)] + NAME_B[Math.floor(Math.random() * NAME_B.length)];
const BOT_NAMES = ['บอทปิ๊ก', 'บอทป๋อง', 'บอทมิ้ว', 'บอทต๊อบ'];
const DEFAULTS = { name: '', look: { color: COLORS[0], ears: 'cat', hat: 'cap' }, band: 2, p2band: 2, stars: 0, plays: 0, best: 0, dur: 180, bots: 3, cats: GENERAL_CATS.map((c) => c.id), learnFirst: true, muted: false };
let save;
try { save = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') }; } catch { save = { ...DEFAULTS }; }
if (!save.name) save.name = randName();
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode: keep in memory */ } };
setMuted(save.muted);

// ---------------- view + input ----------------
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || /Android [4-7]/.test(navigator.userAgent);
const arena = new Arena($('world'), { dpr: lowEnd ? 1 : 1.5, antialias: !lowEnd });
const input = createInput({ touchRoot: $('touch'), onAnswer: (slot, i) => { const id = G.me[slot]; if (id && G.quiz[id]) pick(id, i); } });
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
document.body.classList.toggle('is-touch', isTouch);

const G = {
  screen: 'menu', phase: 'menu', role: null, kind: 'solo', match: null, snap: null, me: [], slotOf: {}, quiz: {},
  acc: 0, speed: 1, net: null, code: '', myId: null, roster: [], plan: null, lastSnapAt: 0, seen: {}, netQ: [], sendAt: 0, inAcc: null,
  hudAt: 0, countT: 0, quitArm: 0, hintT: 0,
};

// ---------------- generic UI ----------------
function fillIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = ICON[el.dataset.ic] || ''; });
  root.querySelectorAll('[data-act="back"],[data-act="leave"]').forEach((el) => { if (el.classList.contains('icon-btn')) el.innerHTML = ICON.back; });
  root.querySelectorAll('[data-act="quit"]').forEach((el) => (el.innerHTML = ICON.cross));
  root.querySelectorAll('[data-act="sound"]').forEach((el) => (el.innerHTML = isMuted() ? ICON.mute : ICON.sound));
}
function show(id) {
  const f = $('fade'); f.classList.add('on');
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('show', s.id === id));
    G.screen = id; f.classList.remove('on');
  }, G.fast ? 0 : 180);
  if (G.fast) { document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('show', s.id === id)); G.screen = id; }
}
function toast(msg, ms = 1800) {
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms);
}
function banner(msg, ms = 1800) {
  const b = $('banner'); b.textContent = msg; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  clearTimeout(b._h); b._h = setTimeout(() => b.classList.remove('on'), ms);
}
function squish(el) { el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish'); }
document.addEventListener('pointerdown', (e) => { sfx.unlock(); const b = e.target.closest('.jelly,.mini-btn,.opt,.icon-btn,.sw'); if (b) squish(b); }, { capture: true });
const starChips = () => document.querySelectorAll('#starChip,[data-stars]').forEach((c) => (c.innerHTML = `${ICON.star}<b>${save.stars}</b>`));
const dot = (look) => `<span class="dot" style="--c:${esc(look?.color || '#ccc')}"></span>`;
function opts(el, list, cur, onPick, render = (o) => esc(o.name)) {
  el.innerHTML = list.map((o) => `<button class="opt${o.id === cur ? ' on' : ''}${o.locked ? ' locked' : ''}" data-v="${esc(o.id)}">${render(o)}</button>`).join('');
  el.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => { sfx.tap(); onPick(list.find((o) => String(o.id) === b.dataset.v)); }));
}

// ---------------- menu / avatar ----------------
function toMenu() {
  leaveNet();
  G.phase = 'menu'; G.match = null; G.snap = null; G.me = []; G.quiz = {}; $('quizzes').innerHTML = ''; document.body.classList.remove('in-quiz');
  input.setPlayers('none');
  arena.clearBuddies(); arena.zone.position.set(0, 0, 0); arena.setMode('menu');
  starChips(); show('menu'); music.play(0.2); music.setIntensity(0.2);
}
function openAvatar() {
  G.phase = 'avatar';
  arena.showroom(save.look);
  renderAvatar(); show('avatar');
}
function renderAvatar() {
  $('nameOut').textContent = save.name;
  $('colors').innerHTML = COLORS.map((c) => `<button class="sw${c === save.look.color ? ' on' : ''}" style="--c:${c}" data-c="${c}" aria-label="สี"></button>`).join('');
  $('colors').querySelectorAll('.sw').forEach((b) => b.addEventListener('click', () => { save.look.color = b.dataset.c; afterLook(); }));
  opts($('ears'), EARS, save.look.ears, (o) => { save.look.ears = o.id; afterLook(); });
  opts($('hats'), HATS.map((h) => ({ ...h, locked: save.stars < h.need })), save.look.hat, (o) => {
    if (o.locked) { toast(`สะสมอีก ${o.need - save.stars} ดาวเพื่อปลดล็อก`); sfx.wrong(); return; }
    save.look.hat = o.id; afterLook();
  }, (o) => (o.locked ? `${ICON.lock}${esc(o.name)}<small>${o.need}</small>` : esc(o.name)));
  opts($('bands'), AGE_BANDS.map((b) => ({ id: b.g, name: b.name })), save.band, (o) => { save.band = o.id; persist(); renderAvatar(); });
  starChips();
}
function afterLook() { persist(); arena.showroom(save.look).bump(1); sfx.pop(); renderAvatar(); }

// ---------------- setup (bots / local) ----------------
function openSetup(kind) {
  G.kind = kind;
  $('setupTitle').textContent = kind === 'local' ? '2 คนเครื่องเดียว' : 'เล่นกับบอท';
  document.body.classList.toggle('local-mode', kind === 'local');
  renderSetup(); show('setup');
}
function renderSetup() {
  const local = G.kind === 'local';
  opts($('durs'), [180, 240, 300].map((d) => ({ id: d, name: `${d / 60} นาที` })), save.dur, (o) => { save.dur = o.id; persist(); renderSetup(); });
  $('botsLabel').textContent = local ? 'บอทเพิ่ม' : 'จำนวนบอท';
  const maxB = local ? 2 : 3, minB = local ? 0 : 1;
  const nb = Math.max(minB, Math.min(maxB, save.bots));
  opts($('botsOpt'), Array.from({ length: maxB - minB + 1 }, (_, i) => ({ id: i + minB, name: `${i + minB} ตัว` })), nb, (o) => { save.bots = o.id; persist(); renderSetup(); });
  opts($('catsOpt'), GENERAL_CATS.map((c) => ({ id: c.id, name: c.name })), null, (o) => {
    const on = save.cats.includes(o.id);
    if (on && save.cats.length === 1) { toast('เลือกอย่างน้อย 1 หมวด'); return; }
    save.cats = on ? save.cats.filter((x) => x !== o.id) : [...save.cats, o.id]; persist(); renderSetup();
  }, (o) => `<span class="cic" style="--c:${CAT[o.id].color}">${CAT_ICON[o.id]}</span>${esc(o.name)}`);
  $('catsOpt').querySelectorAll('.opt').forEach((b) => b.classList.toggle('on', save.cats.includes(b.dataset.v)));
  opts($('p2bands'), AGE_BANDS.map((b) => ({ id: b.g, name: b.name })), save.p2band, (o) => { save.p2band = o.id; persist(); renderSetup(); });
  $('keyHelp').innerHTML = `<div>${KEY_HELP.p1}</div><div>${KEY_HELP.p2}</div>`;
  $('learnFirst').checked = !!save.learnFirst;
}
$('learnFirst').addEventListener('change', (e) => { save.learnFirst = e.target.checked; persist(); });

function soloPlan() {
  const local = G.kind === 'local';
  const nb = local ? Math.max(0, Math.min(2, save.bots)) : Math.max(1, Math.min(3, save.bots));
  const roster = [{ id: 'p1', name: save.name, look: { ...save.look }, band: save.band, bot: false }];
  if (local) {
    const c2 = COLORS.find((c) => c !== save.look.color && c !== '#f2f2f2');
    roster.push({ id: 'p2', name: 'ผู้เล่น 2', look: { color: c2, ears: EARS[(EARS.findIndex((e) => e.id === save.look.ears) + 1) % EARS.length].id, hat: 'none' }, band: save.p2band, bot: false });
  }
  botsInto(roster, nb, save.band);
  return { role: local ? 'local' : 'solo', roster, dur: save.dur, cats: save.cats.slice(), me: local ? ['p1', 'p2'] : ['p1'] };
}
function botsInto(roster, n, band) {
  const used = new Set(roster.map((r) => r.look.color));
  for (let i = 0; i < n; i++) {
    const color = COLORS.find((c) => !used.has(c)) || COLORS[i]; used.add(color);
    roster.push({ id: 'bot' + i + rid(), name: BOT_NAMES[i % 4], look: { color, ears: EARS[(i + 1) % 4].id, hat: ['none', 'flower', 'cap', 'prop'][i % 4] }, band, bot: true, acc: 0.62 + Math.random() * 0.15 });
  }
}

// ---------------- lesson cards ----------------
const L = { list: [], i: 0, then: null, cat: 'sci', lib: false };
function openLearn(cards, then) {
  Object.assign(L, { list: cards, i: 0, then, lib: false });
  $('learnTitle').textContent = 'ความรู้ก่อนลงสนาม'; $('learnCats').style.display = 'none';
  renderLesson(); show('learn');
}
function openLibrary() {
  Object.assign(L, { lib: true, then: null });
  $('learnTitle').textContent = 'การ์ดความรู้'; $('learnCats').style.display = '';
  libCat(L.cat); show('learn');
}
function libCat(id) {
  L.cat = id; L.list = getTopic('general', save.band, id).lesson.map((c) => ({ ...c, cat: id })); L.i = 0;
  opts($('learnCats'), GENERAL_CATS.map((c) => ({ id: c.id, name: c.name })), id, (o) => libCat(o.id), (o) => `<span class="cic" style="--c:${CAT[o.id].color}">${CAT_ICON[o.id]}</span>${esc(o.name)}`);
  renderLesson();
}
function renderLesson() {
  const c = L.list[L.i]; if (!c) return;
  const cat = CAT[c.cat];
  $('lessonCard').innerHTML = `<div class="lc-cat" style="--c:${cat.color}">${CAT_ICON[c.cat]}<span>${esc(cat.name)}</span></div>
    <h3>${esc(c.t)}</h3><p>${esc(c.x)}</p>${c.ex ? `<div class="lc-ex">${ICON.bulb}<span>${esc(c.ex)}</span></div>` : ''}`;
  squish($('lessonCard'));
  $('learnCount').textContent = `${L.i + 1}/${L.list.length}`;
  $('lnextTxt').textContent = L.i === L.list.length - 1 ? (L.then ? 'พร้อมลงสนาม!' : 'จบ') : 'ถัดไป';
}
function lessonStep(d) {
  sfx.tap();
  if (d > 0 && L.i === L.list.length - 1) { if (L.then) L.then(); else if (!L.lib) toMenu(); else { L.i = 0; renderLesson(); } return; }
  L.i = Math.max(0, Math.min(L.list.length - 1, L.i + d)); renderLesson();
}
function warmupCards(plan) {
  const band = plan.roster.find((r) => !r.bot)?.band || 2;
  return plan.cats.map((cat) => { const ls = getTopic('general', band, cat).lesson; return { ...ls[Math.floor(Math.random() * ls.length)], cat }; });
}

// ---------------- questions ----------------
const decks = {};
function ask(p, d, cat) {
  const k = `${p.band}:${cat}`;
  decks[k] ||= createDeck('general', p.band, cat, { seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0 });
  return { ...decks[k].next(d), cat };
}

// ---------------- match lifecycle ----------------
function startMatch(plan) {
  G.plan = plan; G.role = plan.role; G.quiz = {}; G.acc = 0; G.seen = {}; G.netQ = []; G.myLog = {};
  G.me = plan.me; G.slotOf = Object.fromEntries(plan.me.map((id, i) => [id, i]));
  $('quizzes').innerHTML = ''; $('tags').innerHTML = ''; $('pops').innerHTML = '';
  document.body.classList.toggle('local-mode', plan.role === 'local');
  input.setPlayers(plan.role === 'local' ? 'local2' : 'solo');
  arena.clearBuddies();
  if (plan.role !== 'guest') {
    G.match = createMatch({ players: plan.roster, duration: plan.dur, cats: plan.cats, ask });
    G.snap = snapshot(G.match);
  } else {
    G.match = null;
    G.snap = { t: 0, dur: plan.dur, zone: { x: 0, z: 0, owner: null }, items: [], orbs: ORB_POS.map(() => 0), players: plan.roster.map((r, i) => ({ ...r, x: Math.cos(i * 1.6) * 9, z: Math.sin(i * 1.6) * 9, y: 0, face: 0, vx: 0, vz: 0, st: 'play', eff: {}, score: 0, src: {} })) };
    G.lastSnapAt = performance.now();
  }
  arena.setMode('play', G.me);
  arena.sync(G.snap, 0.016, { me: G.me });
  $('keyhint').textContent = isTouch ? '' : plan.role === 'local' ? `${KEY_HELP.p1}    ${KEY_HELP.p2}` : KEY_HELP.solo;
  show('hud');
  G.phase = 'count'; G.countT = G.fast ? 0 : 3.6; G.lastCount = -1;
  music.play(1); music.setIntensity(1);
  G.hintT = 6;
}
function finish() {
  if (G.phase === 'end') return;
  G.phase = 'end';
  if (G.match) G.snap = snapshot(G.match);
  const snap = G.snap, rank = snap.players.slice().sort((a, b) => b.score - a.score || (b.src.quiz || 0) - (a.src.quiz || 0));
  arena.placePodium(rank); arena.fx({ t: 'confetti' });
  sfx.finish(); music.setIntensity(0.3);
  $('quizzes').innerHTML = ''; G.quiz = {}; document.body.classList.remove('in-quiz');
  // stars carry across matches -> unlock hats
  const PLACE = [5, 3, 2, 1];
  let earn = 0;
  for (const id of G.me) { const i = rank.findIndex((p) => p.id === id); const p = rank[i]; if (p) earn += (p.right || 0) + (PLACE[i] || 1); }
  const before = save.stars;
  save.stars += earn; save.plays++; save.best = Math.max(save.best, ...G.me.map((id) => rank.find((p) => p.id === id)?.score || 0)); persist();
  const unlocked = HATS.filter((h) => h.need > before && h.need <= save.stars);
  const myRank = rank.findIndex((p) => p.id === G.me[0]) + 1;
  $('resTitle').innerHTML = myRank === 1 ? `${ICON.crown}<span>ชนะเลิศ!</span>` : `<span>อันดับที่ ${myRank}</span>`;
  const segs = [['quiz', 'ความรู้', '#9b6bff'], ['item', 'ไอเทม', '#ffb02e'], ['mission', 'ภารกิจ', '#35d39a'], ['zone', 'วงมงกุฎ', '#ff6fb5'], ['fight', 'ประลอง', '#3fb8ff']];
  const top = Math.max(1, rank[0]?.score || 1);
  $('rankList').innerHTML = rank.map((p, i) => `<div class="rrow${G.me.includes(p.id) ? ' me' : ''}"><b class="place">${i + 1}</b>${dot(p.look)}<span class="rname">${esc(p.name)}</span><b class="rscore">${p.score}</b>
      <div class="segs">${segs.map(([k, , c]) => `<i style="--c:${c};width:${((p.src[k] || 0) / top) * 100}%"></i>`).join('')}</div></div>`).join('')
    + `<div class="legend">${segs.map(([, n, c]) => `<span><i style="--c:${c}"></i>${n}</span>`).join('')}</div>`;
  $('earn').innerHTML = G.me.length ? `${ICON.star}<b>+${earn} ดาว</b><span>${unlocked.length ? `ปลดล็อก ${unlocked.map((h) => esc(h.name)).join(', ')}!` : `รวม ${save.stars} ดาว`}</span>` : '';
  renderReview();
  setTimeout(() => show('results'), G.fast ? 0 : 1400);
}
function renderReview() {
  const logs = [];
  for (const id of G.me) {
    const p = G.match?.players.find((x) => x.id === id);
    (p?.log || G.myLog?.[id] || []).forEach((l) => logs.push({ ...l, who: G.me.length > 1 ? p?.name || '' : '' }));
  }
  if (!logs.length) { $('review').innerHTML = '<div class="empty">ยังไม่ได้ตอบคำถาม รอบหน้าลองแตะลูกแก้ว ? นะ</div>'; return; }
  $('review').innerHTML = logs.map((l, i) => `<div class="rv ${l.ok ? 'ok' : 'no'}"><span class="rv-ic">${l.ok ? ICON.check : ICON.cross}</span>
    <div><div class="rv-q">${esc(l.q)}</div><div class="rv-a">${l.ok ? '' : 'เฉลย: '}${esc(l.ok ? l.a : l.explain)}</div></div>
    ${l.ok ? '' : `<button class="mini-btn" data-card="${i}">${ICON.book}การ์ด</button>`}</div>`).join('');
  $('review').querySelectorAll('[data-card]').forEach((b) => b.addEventListener('click', () => {
    const l = logs[+b.dataset.card]; const band = G.plan.roster.find((r) => r.id === G.me[0])?.band || 2;
    const topic = getTopic('general', band, l.cat); const hit = lessonFor(topic, { q: l.q, a: l.a, hint: l.explain });
    openModal(`<div class="lc-cat" style="--c:${CAT[l.cat].color}">${CAT_ICON[l.cat]}<span>${esc(CAT[l.cat].name)}</span></div><h3>${esc(hit.card.t)}</h3><p>${esc(hit.card.x)}</p>${hit.card.ex ? `<div class="lc-ex">${ICON.bulb}<span>${esc(hit.card.ex)}</span></div>` : ''}`);
  }));
}
function openModal(html) { $('modalBody').innerHTML = html; $('modal').classList.add('on'); }

// ---------------- events from the sim (local or network) ----------------
function onEvent(e) {
  const mine = e.id && G.me.includes(e.id);
  switch (e.t) {
    case 'quiz': if (mine) openQuiz(e); break;
    case 'qres': if (mine) quizResult(e); break;
    case 'pick': if (mine) { e.k === 'gem' ? sfx.itemGet() : sfx.coin(); pop(e.x, 1, e.z, `+${e.pts}`, e.k === 'gem' ? 'gem' : 'coin'); } break;
    case 'hit': sfx.hit(); if (G.me.includes(e.by) && e.pts) pop(e.x, 2, e.z, `+${e.pts}`, 'fight'); if (mine) arena.kick(0.35); break;
    case 'block': sfx.shield(); break;
    case 'dash': if (mine) sfx.lane(); break;
    case 'skill': if (mine) { e.s === 'wave' ? sfx.shoot() : e.s === 'speed' ? sfx.boost() : sfx.shield(); banner(SKILLS[e.s].name + '!', 1100); } break;
    case 'fall': sfx.plop(); if (mine) banner('ตกเกาะ! กำลังกลับมา', 1300); break;
    case 'respawn': if (mine) sfx.pop(); break;
    case 'mission': if (mine) { sfx.checkpoint(); toast(`ภารกิจสำเร็จ +${e.pts}`); pop(e.x, 2.4, e.z, `+${e.pts}`, 'mission'); } break;
    case 'ringout': if (mine) pop(e.x, 2.4, e.z, `+${e.pts}`, 'fight'); break;
    case 'zonemove': sfx.checkpoint(); banner('วงมงกุฎย้ายที่แล้ว!', 1500); break;
    case 'zoneowner': if (e.id && G.me.includes(e.id)) sfx.itemGet(); break;
    case 'bounce': if (mine) sfx.pop(); break;
    case 'end': break;
  }
  arena.fx(e);
  if (e.t === 'end' && G.role !== 'guest') { flushNet(true); finish(); }
}
function pop(x, y, z, txt, kind) {
  const p = arena.project(x, y, z); if (p.behind) return;
  const d = document.createElement('div'); d.className = `pop ${kind}`; d.textContent = txt;
  d.style.left = `${p.x}px`; d.style.top = `${p.y}px`; $('pops').appendChild(d);
  setTimeout(() => d.remove(), 1000);
}

// ---------------- quiz UI ----------------
function openQuiz(e) {
  const slot = G.slotOf[e.id], q = e.q, cat = CAT[q.cat];
  const keys = G.role === 'local' && slot === 1 ? ['8', '9', '0'] : ['1', '2', '3'];
  let el = document.querySelector(`.quiz[data-id="${e.id}"]`);
  if (!el) { el = document.createElement('div'); el.className = 'quiz'; el.dataset.id = e.id; $('quizzes').appendChild(el); }
  el.dataset.slot = slot; el.className = `quiz s${slot}`;
  const who = G.me.length > 1 ? `<span class="who">${dot(G.snap.players.find((p) => p.id === e.id)?.look)}${slot ? 'P2' : 'P1'}</span>` : '';
  el.innerHTML = `<div class="qhead"><span class="qcat" style="--c:${cat.color}">${CAT_ICON[q.cat]}<span>${esc(cat.name)}</span></span>${who}<span class="qlv">${LV_NAME[q.d] || ''}</span></div>
    <div class="qtext">${esc(q.q)}</div>
    <div class="qchoices">${q.choices.map((c, i) => `<button class="qc" data-i="${i}"><b>${keys[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>
    <div class="qbar"><i></i></div><div class="qmsg"></div>`;
  el.querySelectorAll('.qc').forEach((b) => b.addEventListener('click', () => pick(e.id, +b.dataset.i)));
  G.quiz[e.id] = { q, time: e.time, max: e.time, done: false, el };
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  sfx.itemGet();
}
function pick(id, i) {
  const qz = G.quiz[id]; if (!qz || qz.done || qz.wait) return;
  const b = qz.el.querySelector(`.qc[data-i="${i}"]`); if (!b || b.disabled) return;
  squish(b); sfx.tap();
  if (G.role === 'guest') { qz.wait = true; b.classList.add('chosen'); G.net?.send('ans', { id, i }); setTimeout(() => (qz.wait = false), 1500); return; }
  answer(G.match, id, i); drain();
}
function quizResult(e) {
  const qz = G.quiz[e.id]; if (!qz) return;
  qz.wait = false;
  const el = qz.el, msg = el.querySelector('.qmsg');
  if (!e.final) {
    const b = el.querySelector(`.qc[data-i="${e.elim}"]`); b?.classList.add('elim'); if (b) b.disabled = true;
    msg.innerHTML = `${ICON.bulb}<span>${esc(e.hint)} ลองอีกครั้ง!</span>`; msg.className = 'qmsg hint';
    sfx.wrong(); return;
  }
  qz.done = true;
  if (G.role === 'guest') ((G.myLog ||= {})[e.id] ||= []).push({ q: qz.q.q, a: qz.q.choices[e.a], ok: e.ok, cat: qz.q.cat, explain: e.explain || '', d: qz.q.d });
  el.querySelectorAll('.qc').forEach((b) => (b.disabled = true));
  if (e.ok) {
    el.querySelector(`.qc[data-i="${e.a}"]`)?.classList.add('right');
    msg.innerHTML = `${ICON.check}<b>ถูกต้อง! +${e.pts}</b>${e.skill ? `<span class="got">${SKILL_ICON[e.skill]}ได้สกิล ${esc(SKILLS[e.skill].name)}</span>` : ''}`;
    msg.className = 'qmsg ok'; sfx.correct();
    pop(e.x, 2.6, e.z, `+${e.pts}`, 'quiz');
    closeQuiz(e.id, 1500);
  } else {
    el.querySelector(`.qc[data-i="${e.a}"]`)?.classList.add('right');
    msg.innerHTML = `${ICON.book}<span>${e.late ? 'หมดเวลา — ' : ''}เฉลย: ${esc(e.explain)}</span>`; msg.className = 'qmsg explain';
    sfx.plop();
    closeQuiz(e.id, 4200);
    el.addEventListener('click', () => closeQuiz(e.id, 0), { once: true });
  }
}
function closeQuiz(id, ms) {
  const qz = G.quiz[id]; if (!qz) return;
  clearTimeout(qz.h);
  qz.h = setTimeout(() => { if (G.quiz[id] === qz) { qz.el.classList.add('out'); setTimeout(() => qz.el.remove(), 250); delete G.quiz[id]; } }, G.fast ? 0 : ms);
}

// ---------------- HUD ----------------
const fmtT = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function updateHud(dt) {
  const snap = G.snap; if (!snap) return;
  // name tags follow heads every frame
  const tags = $('tags');
  for (const p of snap.players) {
    let t = tags.querySelector(`[data-id="${p.id}"]`);
    if (!t) { t = document.createElement('div'); t.className = 'tag'; t.dataset.id = p.id; tags.appendChild(t); }
    const hp = arena.headPos(p.id);
    if (!hp || hp.behind || p.st === 'fall') { t.style.display = 'none'; continue; }
    t.style.display = ''; t.style.transform = `translate(${hp.x}px, ${hp.y}px) translate(-50%, -100%)`;
    const html = `${snap.zone.owner === p.id ? ICON.crown : ''}<span>${esc(p.name)}</span>`;
    if (t._h !== html) { t.innerHTML = html; t._h = html; t.classList.toggle('me', G.me.includes(p.id)); t.style.setProperty('--c', p.look?.color || '#fff'); }
  }
  // quiz timers
  document.body.classList.toggle('in-quiz', Object.values(G.quiz).some((q) => !q.done));
  for (const id in G.quiz) {
    const qz = G.quiz[id], p = snap.players.find((x) => x.id === id);
    if (!qz.done && p) qz.el.querySelector('.qbar i').style.transform = `scaleX(${Math.max(0, (p.qt || 0) / qz.max)})`;
  }
  // nearest orb arrow (visual guidance)
  const me = snap.players.find((p) => p.id === G.me[0]), arrow = $('orbArrow');
  if (me && me.st === 'play' && G.phase === 'play') {
    let best = -1, bd = 1e9;
    snap.orbs.forEach((on, i) => { if (!on) return; const d = Math.hypot(ORB_POS[i][0] - me.x, ORB_POS[i][1] - me.z); if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd > 2.5) {
      const p = arena.project(ORB_POS[best][0], 2.8, ORB_POS[best][1]);
      const W = innerWidth, H = innerHeight, m = 46;
      const off = p.behind || p.x < m || p.x > W - m || p.y < 60 || p.y > H - m;
      const c = arena.project(me.x, 1, me.z);
      let ax = p.x, ay = p.y, ang = Math.PI / 2;
      if (off) { ang = Math.atan2(p.y - c.y, p.x - c.x); if (p.behind) ang += Math.PI; ax = Math.min(W - m, Math.max(m, c.x + Math.cos(ang) * 1e4)); ay = Math.min(H - m, Math.max(100, c.y + Math.sin(ang) * 1e4)); const k = Math.min((W / 2 - m) / Math.abs(Math.cos(ang) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(ang) || 1e-6)); ax = W / 2 + Math.cos(ang) * k; ay = H / 2 + Math.sin(ang) * k; }
      arrow.style.display = ''; arrow.classList.toggle('edge', off);
      arrow.style.transform = `translate(${ax}px, ${ay}px) translate(-50%, -50%)${off ? ` rotate(${ang}rad)` : ''}`;
    } else arrow.style.display = 'none';
  } else arrow.style.display = 'none';

  G.hudAt -= dt; if (G.hudAt > 0) return; G.hudAt = 0.1;
  const left = Math.max(0, snap.dur - snap.t);
  $('timer').querySelector('b').textContent = fmtT(left);
  $('timer').classList.toggle('hurry', left <= 15);
  const rank = snap.players.slice().sort((a, b) => b.score - a.score);
  $('board').innerHTML = rank.map((p, i) => `<div class="brow${G.me.includes(p.id) ? ' me' : ''}">${i === 0 ? ICON.crown : `<b>${i + 1}</b>`}${dot(p.look)}<span>${esc(p.name)}</span><b>${p.score}</b></div>`).join('');
  $('meBox').innerHTML = G.me.map((id) => { const p = snap.players.find((x) => x.id === id); return p ? `<div class="mescore">${dot(p.look)}<b>${p.score}</b><small>คะแนน</small></div>` : ''; }).join('');
  $('mission').innerHTML = G.me.map((id) => { const p = snap.players.find((x) => x.id === id); const ms = p?.mission; return ms ? `<div class="ms">${ICON.flag}<span>${esc(ms.text)}</span><i style="--p:${ms.have / ms.need}"></i><b>+${ms.pts}</b></div>` : ''; }).join('');
  const sk = me?.skill;
  const tS = $('tSkill'); tS.innerHTML = sk ? SKILL_ICON[sk] : ICON.star; tS.classList.toggle('ready', !!sk);
  $('skillPc').innerHTML = G.me.map((id, i) => { const p = snap.players.find((x) => x.id === id); const s = p?.skill; return `<div class="spc${s ? ' ready' : ''}">${s ? SKILL_ICON[s] : ICON.star}<span>${s ? esc(SKILLS[s].name) : 'ตอบถูกเพื่อรับสกิล'}</span><kbd>${G.role === 'local' ? (i ? '/' : 'R') : 'L'}</kbd></div>`; }).join('');
  if (G.hintT > 0 && G.phase === 'play') { G.hintT -= 0.1; if (G.hintT <= 0) $('banner').classList.remove('on'); }
}

// ---------------- main loop ----------------
let last = performance.now(), rafOn = true, ivl = null;
function frame(dt) {
  if (G.phase === 'count') {
    G.countT -= dt;
    const n = Math.ceil(G.countT - 0.6);
    if (n !== G.lastCount) {
      G.lastCount = n; const c = $('count');
      if (n >= 1) { c.textContent = n; sfx.count(false); } else { c.textContent = 'เริ่ม!'; sfx.count(true); }
      c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
    }
    if (G.countT <= 0) { G.phase = 'play'; $('count').classList.remove('on'); banner('แตะลูกแก้ว ? เพื่อตอบคำถาม', 4000); }
  }
  if (G.phase === 'play' || G.phase === 'count') {
    if (G.match && G.phase === 'play') {
      for (const id of G.me) {
        const p = G.match.players.find((x) => x.id === id), i = input.read(G.slotOf[id]);
        if (!p || p.bot) continue;
        p.in.mx = i.mx; p.in.mz = i.mz; p.in.atk ||= i.atk; p.in.dash ||= i.dash; p.in.skill ||= i.skill;
      }
      G.acc += Math.min(dt, 0.1) * G.speed;
      while (G.acc >= STEP && G.phase === 'play') { step(G.match, STEP); G.acc -= STEP; drain(); }
      if (G.match) G.snap = snapshot(G.match);
      if (G.role === 'host') hostTick(dt);
    } else if (G.role === 'guest' && G.phase === 'play') guestTick();
    arena.sync(G.snap, dt, { me: G.me, smooth: G.role === 'guest' ? 14 : 0 });
    updateHud(dt);
  } else if (G.phase === 'avatar') arena.spinShowroom(dt);
  else if (G.phase === 'end') arena.animatePodium(dt);
  arena.render(dt);
}
function drain() {
  if (!G.match) return;
  const ev = G.match.events.splice(0);
  for (const e of ev) { onEvent(e); if (G.role === 'host') G.netQ.push(e); }
}
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (rafOn) frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------------- network: host ----------------
async function hostRoom() {
  G.role = 'host'; G.myId = 'h' + rid(); G.code = makeCode(); G.phase = 'lobby';
  G.roster = [{ id: G.myId, name: save.name, look: { ...save.look }, band: save.band, bot: false }];
  document.body.classList.add('is-host'); document.body.classList.remove('is-guest');
  $('codeOut').textContent = G.code; $('lobbyStatus').textContent = 'กำลังเปิดห้อง...';
  renderLobby(); show('lobby');
  try {
    G.net = await connect(G.code, onNet, { onClose: () => toast('การเชื่อมต่อหลุด') });
    $('lobbyStatus').textContent = 'บอกรหัสห้องให้เพื่อน แล้วรอเพื่อนเข้ามา';
  } catch {
    $('lobbyStatus').textContent = 'เชื่อมต่อออนไลน์ไม่ได้ ลองเล่นกับบอทก่อนนะ';
  }
}
function renderLobby() {
  const slots = [0, 1, 2, 3].map((i) => G.roster[i]);
  $('roster').innerHTML = slots.map((p) => p ? `<div class="slot${p.id === G.myId ? ' me' : ''}">${dot(p.look)}<span>${esc(p.name)}</span>${p.bot ? `<i class="tagbot">${ICON.bot}</i>` : ''}<small>${esc(AGE_BANDS.find((b) => b.g === p.band)?.name || '')}</small></div>`
    : '<div class="slot empty"><span>ว่าง</span></div>').join('');
  if (G.role === 'host') opts($('ldurs'), [180, 240, 300].map((d) => ({ id: d, name: `${d / 60} นาที` })), save.dur, (o) => { save.dur = o.id; persist(); renderLobby(); sendRoster(); });
}
const sendRoster = () => G.net?.send('roster', { roster: G.roster, dur: save.dur, code: G.code });
function onNet(ev, p) {
  if (G.role === 'host') {
    if (ev === 'hello') {
      if (G.phase !== 'lobby') { G.net.send('nope', { id: p.p?.id, why: 'busy' }); return; }
      if (G.roster.some((r) => r.id === p.p.id)) { sendRoster(); return; }
      const bot = G.roster.findIndex((r) => r.bot);
      if (G.roster.length >= 4 && bot < 0) { G.net.send('nope', { id: p.p.id, why: 'full' }); return; }
      if (G.roster.length >= 4) G.roster.splice(bot, 1);
      const look = cleanLook(p.p.look);
      if (G.roster.some((r) => r.look.color === look.color)) look.color = COLORS.find((c) => !G.roster.some((r) => r.look.color === c)) || look.color; // everyone looks different
      G.roster.push({ id: String(p.p.id).slice(0, 12), name: String(p.p.name || 'เพื่อน').slice(0, 16), look, band: [1, 2, 3, 4].includes(p.p.band) ? p.p.band : 2, bot: false });
      sfx.pop(); toast(`${p.p.name} เข้าห้องแล้ว`); renderLobby(); sendRoster();
    } else if (ev === 'bye') {
      if (G.phase === 'lobby') { G.roster = G.roster.filter((r) => r.id !== p.id); renderLobby(); sendRoster(); }
      else dropToBot(p.id);
    } else if (ev === 'in' && G.match) {
      const pl = G.match.players.find((x) => x.id === p.id); if (!pl || pl.bot) return;
      G.seen[p.id] = performance.now();
      pl.in.mx = clamp1(p.mx); pl.in.mz = clamp1(p.mz); pl.in.atk ||= !!p.atk; pl.in.dash ||= !!p.dash; pl.in.skill ||= !!p.skill;
    } else if (ev === 'ans' && G.match) { G.seen[p.id] = performance.now(); answer(G.match, p.id, p.i | 0); drain(); }
    return;
  }
  // guest
  if (ev === 'roster') {
    if (!p.roster?.some((r) => r.id === G.myId)) return;
    G.roster = p.roster; G.joined = true; G.phase = G.phase === 'end' || G.phase === 'joining' || G.phase === 'lobby' ? 'lobby' : G.phase;
    if (G.screen !== 'lobby' && G.phase === 'lobby') { $('codeOut').textContent = G.code; show('lobby'); }
    renderLobby(); $('lobbyStatus').textContent = '';
  } else if (ev === 'nope' && p.id === G.myId) {
    $('joinStatus').textContent = p.why === 'full' ? 'ห้องเต็มแล้ว (4 คน)' : 'ห้องนี้กำลังแข่งอยู่ ลองใหม่ทีหลัง'; leaveNet();
  } else if (ev === 'start') {
    if (!p.roster?.some((r) => r.id === G.myId)) return;
    G.roster = p.roster;
    startMatch({ role: 'guest', roster: p.roster, dur: p.dur, cats: p.cats, me: [G.myId] });
  } else if (ev === 's' && G.role === 'guest' && G.phase !== 'end') {
    G.lastSnapAt = performance.now();
    const look = Object.fromEntries(G.roster.map((r) => [r.id, r]));
    G.snap = { ...p.s, players: p.s.players.map((x) => ({ ...x, name: look[x.id]?.name || x.id, look: look[x.id]?.look })) };
    for (const e of p.e || []) onEvent(e);
    if (p.s.over) finish();
  } else if (ev === 'lobby') {
    if (G.phase === 'end' || G.screen === 'results') { G.phase = 'lobby'; toast('เจ้าของห้องพร้อมเล่นรอบใหม่'); }
  } else if (ev === 'close') { toast('เจ้าของห้องปิดห้องแล้ว', 2500); toMenu(); }
}
const clamp1 = (v) => Math.max(-1, Math.min(1, +v || 0));
const cleanLook = (l) => ({ color: COLORS.includes(l?.color) ? l.color : COLORS[0], ears: EARS.some((e) => e.id === l?.ears) ? l.ears : 'cat', hat: HATS.some((h) => h.id === l?.hat) ? l.hat : 'none' });
function dropToBot(id) {
  const pl = G.match?.players.find((x) => x.id === id);
  if (pl && !pl.bot) { pl.bot = true; toast(`${pl.name} หลุด บอทเล่นแทน`); }
}
function hostTick(dt) {
  G.sendAt -= dt;
  const now = performance.now();
  for (const r of G.roster) if (!r.bot && r.id !== G.myId) { G.seen[r.id] ??= now; if (now - G.seen[r.id] > 8000) dropToBot(r.id); }
  if (G.sendAt <= 0) flushNet();
}
function flushNet(force) {
  if (G.role !== 'host' || !G.net || !G.match) return;
  if (!force && G.sendAt > 0) return;
  G.sendAt = 0.1;
  const s = snapshot(G.match);
  s.players = s.players.map(({ name, look, ...rest }) => rest);
  G.net.send('s', { s, e: G.netQ.splice(0) });
}
async function startNet() {
  if (G.roster.length < 2) { toast('รอเพื่อนหรือเพิ่มบอทก่อน'); return; }
  const plan = { role: 'host', roster: G.roster.map((r) => ({ ...r })), dur: save.dur, cats: save.cats.slice(), me: [G.myId] };
  G.net?.send('start', { roster: plan.roster, dur: plan.dur, cats: plan.cats });
  startMatch(plan);
}

// ---------------- network: guest ----------------
async function joinRoom() {
  const code = cleanCode($('codeIn').value);
  if (code.length !== 5) { $('joinStatus').textContent = 'รหัสห้องมี 5 ตัว'; return; }
  leaveNet();
  G.role = 'guest'; G.code = code; G.myId = 'g' + rid(); G.phase = 'joining'; G.joined = false;
  document.body.classList.add('is-guest'); document.body.classList.remove('is-host');
  $('joinStatus').textContent = 'กำลังเชื่อมต่อ...';
  try { G.net = await connect(code, onNet, { onClose: () => { if (G.role === 'guest') { toast('การเชื่อมต่อหลุด'); toMenu(); } } }); }
  catch { $('joinStatus').textContent = 'เชื่อมต่อออนไลน์ไม่ได้ ลองใหม่ หรือเล่นกับบอทก่อนนะ'; G.role = null; return; }
  const hello = () => G.net?.send('hello', { p: { id: G.myId, name: save.name, look: save.look, band: save.band } });
  hello(); setTimeout(() => { if (!G.joined && G.role === 'guest') hello(); }, 1500);
  setTimeout(() => { if (!G.joined && G.role === 'guest') { $('joinStatus').textContent = 'ไม่พบห้องนี้ ตรวจรหัสอีกครั้ง'; leaveNet(); } }, 5000);
}
function guestTick() {
  const i = input.read(0), now = performance.now();
  const a = (G.inAcc ||= { mx: 0, mz: 0, atk: false, dash: false, skill: false });
  a.atk ||= i.atk; a.dash ||= i.dash; a.skill ||= i.skill;
  const changed = Math.abs(a.mx - i.mx) > 0.08 || Math.abs(a.mz - i.mz) > 0.08 || a.atk || a.dash || a.skill;
  if ((changed && now - G.sendAt > 70) || now - G.sendAt > 900) {
    G.net?.send('in', { id: G.myId, mx: +i.mx.toFixed(2), mz: +i.mz.toFixed(2), atk: a.atk, dash: a.dash, skill: a.skill });
    G.sendAt = now; Object.assign(a, { mx: i.mx, mz: i.mz, atk: false, dash: false, skill: false });
  }
  if (now - G.lastSnapAt > 7000) { toast('การเชื่อมต่อหลุด', 2500); toMenu(); }
}
function leaveNet() {
  if (G.net) { try { G.net.send(G.role === 'host' ? 'close' : 'bye', { id: G.myId }); } catch {} setTimeout(((n) => () => n.close())(G.net), 200); }
  G.net = null; G.role = null; G.joined = false;
  document.body.classList.remove('is-host', 'is-guest');
}

// ---------------- buttons ----------------
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act !== 'sound') sfx.tap();
  switch (act) {
    case 'solo': openSetup('solo'); break;
    case 'local': openSetup('local'); break;
    case 'host': hostRoom(); break;
    case 'join': $('joinStatus').textContent = ''; show('join'); setTimeout(() => $('codeIn').focus(), 250); break;
    case 'joinGo': joinRoom(); break;
    case 'avatar': openAvatar(); break;
    case 'cards': openLibrary(); break;
    case 'back': if (G.screen === 'avatar' || G.screen === 'setup' || G.screen === 'join' || G.screen === 'learn') toMenu(); break;
    case 'rename': save.name = randName(); persist(); renderAvatar(); break;
    case 'go': { const plan = soloPlan(); if (save.learnFirst) openLearn(warmupCards(plan), () => startMatch(plan)); else startMatch(plan); break; }
    case 'lprev': lessonStep(-1); break;
    case 'lnext': lessonStep(1); break;
    case 'leave': toMenu(); break;
    case 'copy': navigator.clipboard?.writeText(G.code).then(() => toast('คัดลอกรหัสแล้ว'), () => toast(G.code)); break;
    case 'addBot': if (G.roster.length < 4) { botsInto(G.roster, 1, save.band); renderLobby(); sendRoster(); } break;
    case 'rmBot': { const i = G.roster.map((r) => r.bot).lastIndexOf(true); if (i >= 0) { G.roster.splice(i, 1); renderLobby(); sendRoster(); } break; }
    case 'startNet': startNet(); break;
    case 'quit':
      if (performance.now() - G.quitArm < 2500) toMenu(); else { G.quitArm = performance.now(); toast('แตะอีกครั้งเพื่อออก'); }
      break;
    case 'menu': toMenu(); break;
    case 'again':
      if (G.role === 'host') { G.phase = 'lobby'; G.match = null; arena.clearBuddies(); arena.setMode('menu'); G.net?.send('lobby', {}); renderLobby(); sendRoster(); show('lobby'); }
      else if (G.role === 'guest') { G.phase = 'lobby'; arena.clearBuddies(); arena.setMode('menu'); renderLobby(); show('lobby'); }
      else startMatch(soloPlanFrom(G.plan));
      break;
    case 'closeModal': $('modal').classList.remove('on'); break;
    case 'sound': save.muted = !isMuted(); setMuted(save.muted); persist(); fillIcons(); if (!save.muted) sfx.tap(); break;
  }
});
const soloPlanFrom = (plan) => ({ ...plan, roster: plan.roster.map((r) => ({ ...r })) });
$('codeIn').addEventListener('input', (e) => (e.target.value = cleanCode(e.target.value)));
$('codeIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') joinRoom(); });
$('world').addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && G.phase === 'play' && e.button === 0) input.mouseAttack(); });
addEventListener('beforeunload', () => leaveNet());

fillIcons();
toMenu();

// ---------------- dev hook (tests) ----------------
window.KA = {
  G, save, arena, step: frame,
  screen: () => G.screen,
  // Drive the loop with setInterval (the hidden browser pane pauses requestAnimationFrame).
  useInterval(ms = 16) { rafOn = false; clearInterval(ivl); ivl = setInterval(() => frame(ms / 1000), ms); },
  useRaf() { clearInterval(ivl); rafOn = true; },
  fast(on = true) { G.fast = on; },
  startBots({ bots = 3, dur = 180, local = false } = {}) {
    G.fast = true; G.kind = local ? 'local' : 'solo'; save.bots = bots; save.dur = dur;
    startMatch(soloPlan()); G.phase = 'play'; return G.me;
  },
  botMe(on = true) { for (const id of G.me) { const p = G.match?.players.find((x) => x.id === id); if (p) p.bot = on; } },
  run(seconds) { // fast-forward the sim without rendering
    const n = Math.round(seconds / STEP);
    for (let k = 0; k < n && G.match && !G.match.over; k++) { step(G.match, STEP); drain(); }
    if (G.match) G.snap = snapshot(G.match);
    if (G.match?.over) { drain(); finish(); }
    return G.match ? { t: G.match.t, over: G.match.over } : null;
  },
  toOrb(id = G.me[0]) {
    const p = G.match.players.find((x) => x.id === id), i = G.match.orbs.findIndex((o) => o.on);
    const o = G.match.orbs[i >= 0 ? i : 0]; o.on = true; p.x = o.x; p.z = o.z; p.st = 'play';
    step(G.match, STEP); drain(); G.snap = snapshot(G.match); return G.quiz[id] ? G.quiz[id].q : null;
  },
  quiz(id = G.me[0]) { const p = G.match?.players.find((x) => x.id === id); return p?.quiz ? { ...p.quiz.q, tries: p.quiz.tries, elim: p.quiz.elim } : null; },
  answer(right = true, id = G.me[0]) {
    const p = G.match.players.find((x) => x.id === id); if (!p?.quiz) return 'no quiz';
    const q = p.quiz.q, i = right ? q.answer : q.choices.findIndex((_, k) => k !== q.answer && k !== p.quiz.elim);
    pick(id, i); return { picked: i, right };
  },
  me: () => G.snap?.players.filter((p) => G.me.includes(p.id)),
};
