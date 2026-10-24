// Sky Rally — flow, quiz rules, adaptive difficulty, HUD. 3D lives in race.js.
import { SUBJECTS, GRADES, LEVELS, listTopics, getTopic, createDeck, lessonFor } from '../../คลังข้อมูลเนื้อและโจทย์/index.js';
import { renderVisual } from './visuals.js';
import { Race, LANE_COLORS } from './race.js';
import { KART_STYLES } from './models.js';
import { ICON, starsHTML } from './icons.js';
import { richHTML } from './rich.js';
import { sfx, music, engineSpeed, setMuted, isMuted, speak } from './audio.js';
import { store, progressKey } from './save.js';

const $ = (id) => document.getElementById(id);
const GATES = 8;
const THEME_OF = { math: 'rainbow', science: 'jungle', english: 'crystal' };
const PRAISE = ['เยี่ยมมาก!', 'สุดยอด!', 'เก่งจัง!', 'ถูกต้อง!', 'ปังมาก!'];
const GUIDE_FACE = `<svg class="face" viewBox="0 0 64 64"><circle cx="32" cy="34" r="24" fill="#ffd9c2" stroke="#2b1b4a" stroke-width="3"/><path d="M8 30C8 12 24 6 32 6s24 6 24 24c-6-8-14-10-24-10S14 22 8 30z" fill="#c9a8ff" stroke="#2b1b4a" stroke-width="3"/><path d="M12 14l-2-10 10 6M52 14l2-10-10 6" fill="#c9a8ff" stroke="#2b1b4a" stroke-width="3" stroke-linejoin="round"/><ellipse cx="24" cy="36" rx="3.5" ry="5" fill="#2a2a6e"/><ellipse cx="40" cy="36" rx="3.5" ry="5" fill="#2a2a6e"/><circle cx="25" cy="34" r="1.3" fill="#fff"/><circle cx="41" cy="34" r="1.3" fill="#fff"/><path d="M27 45q5 4 10 0" stroke="#2b1b4a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="43" rx="4" ry="2.4" fill="#ff8fb8" opacity=".7"/><ellipse cx="47" cy="43" rx="4" ry="2.4" fill="#ff8fb8" opacity=".7"/></svg>`;

const ITEMS = {
  turbo: { name: 'จรวดเทอร์โบ', say: 'พุ่งแรง!' },
  shield: { name: 'โล่ฟองสบู่', say: 'โล่กันได้ 1 ครั้ง' },
  orb: { name: 'ลูกบอลดาว', say: 'ยิงคันข้างหน้า!' },
  jelly: { name: 'เยลลี่ลื่น', say: 'วางกับดักไว้ข้างหลัง' },
  cloud: { name: 'เมฆฝน', say: 'ทุกคันข้างหน้าช้าลง!' },
  magnet: { name: 'แม่เหล็กดาว', say: 'ดูดดาวรอบตัว!' },
};
// Better items for racers further behind (catch-up, like classic kart games).
const ITEM_TABLE = {
  1: ['jelly', 'jelly', 'shield', 'magnet', 'orb'],
  2: ['orb', 'jelly', 'shield', 'turbo', 'magnet'],
  3: ['orb', 'turbo', 'turbo', 'shield', 'cloud'],
  4: ['turbo', 'turbo', 'cloud', 'orb', 'cloud'],
};
const UPGRADES = [
  { id: 'speed', name: 'เครื่องยนต์', ds: 'วิ่งเร็วขึ้นทีละนิด', icon: 'turbo', max: 3, cost: [30, 60, 100] },
  { id: 'boost', name: 'ไอพ่นบูสต์', ds: 'บูสต์นานขึ้น', icon: 'orb', max: 3, cost: [30, 60, 100] },
  { id: 'magnet', name: 'แม่เหล็กดูดดาว', ds: 'เก็บดาวได้กว้างขึ้น', icon: 'magnet', max: 3, cost: [25, 50, 80] },
  { id: 'shield', name: 'โล่ตอนออกตัว', ds: 'เริ่มแข่งพร้อมโล่ 12 วินาที', icon: 'shield', max: 1, cost: [120] },
];
const RANK_BONUS = [0, 20, 12, 8, 5];

const state = { kart: 0, wallet: 0, upgrades: {}, subject: null, grade: null, topic: null, level: 1, step: 'subject', lessonIdx: 0 };
let race, run = null;

// ---------- Boot ----------
async function boot() {
  await store.init();
  state.kart = await store.setting('kart', 0);
  state.wallet = await store.setting('wallet', 0);
  state.upgrades = await store.setting('upgrades', {});
  setMuted(await store.setting('muted', false));
  try { await document.fonts.load('600 64px Mitr'); } catch { /* fallback font */ }
  race = new Race($('world'));
  race.setTheme('rainbow');
  race.setPlayerStyle(KART_STYLES[state.kart % KART_STYLES.length]);
  race.showroom();
  race.on = {
    gate: onGate, coin: onCoin, pad: () => sfx.boost(), checkpoint: onCheckpoint, finish: onFinish,
    itemBox: () => rollItem(), hit: onHit,
    blocked: (isPlayer) => { sfx.shield(); if (isPlayer) toast('โล่กันไว้ได้!', true); },
    rivalItem: (kind) => { if (kind === 'orb') toast('ระวังลูกบอลดาว!', true); },
  };
  paintIcons();
  updateKartName();
  paintWallet();
  bindInput();
  hudLoop();
  $('loading').classList.add('hide');
  setTimeout(() => ($('loading').style.display = 'none'), 700);
  window.SR = { state, get run() { return run; }, race, store }; // dev/testing hook
}

function paintIcons() {
  document.querySelectorAll('[data-act="back"]').forEach((b) => (b.innerHTML = ICON.back));
  document.querySelectorAll('[data-act="pause"]').forEach((b) => (b.innerHTML = ICON.pause));
  document.querySelectorAll('[data-act="speak"]').forEach((b) => (b.innerHTML = ICON.speak));
  document.querySelector('[data-act="kart-prev"]').innerHTML = ICON.back;
  document.querySelector('[data-act="kart-next"]').innerHTML = ICON.next;
  document.querySelector('.pad.left').innerHTML = ICON.left;
  document.querySelector('.pad.right').innerHTML = ICON.right;
  document.querySelector('.pad.brake').innerHTML = ICON.brake;
  document.querySelector('[data-act="garage-back"]').innerHTML = ICON.back;
  $('garageBtn').innerHTML = `${ICON.wrench}<span>อู่แต่งรถ</span>`;
  document.querySelector('#result [data-act="menu"]').innerHTML = `${ICON.home}<span>เลือกเรื่องใหม่</span>`;
  document.querySelector('#result [data-act="again"]').innerHTML = `${ICON.replay}<span>แข่งอีกครั้ง</span>`;
  document.querySelector('#result [data-act="relearn"]').innerHTML = `${ICON.book}<span>ทบทวนบทเรียน</span>`;
  paintSound();
}
function paintSound() { document.querySelectorAll('[data-act="sound"]').forEach((b) => (b.innerHTML = isMuted() ? ICON.soundOff : ICON.soundOn)); }

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('show', s.id === id));
}
function squish(el) { el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish'); }

function updateKartName() { $('kartName').textContent = KART_STYLES[state.kart].name; }

function paintWallet() {
  for (const id of ['walletTitle', 'walletGarage']) $(id).innerHTML = `${ICON.coin}<span>${state.wallet}</span>`;
}

// White flash between scenes so the camera never visibly jumps.
let fading = false;
function fade(fn) {
  if (fading) return Promise.resolve();
  fading = true;
  const f = $('fade');
  f.classList.add('on');
  return new Promise((res) => setTimeout(async () => {
    await fn();
    race.snapCamera();
    requestAnimationFrame(() => { f.classList.remove('on'); fading = false; res(); });
  }, 300));
}

// ---------- Garage ----------
function openGarage() { paintGarage(); show('garage'); }
function paintGarage() {
  paintWallet();
  $('garageList').innerHTML = UPGRADES.map((u, i) => {
    const lv = state.upgrades[u.id] || 0, maxed = lv >= u.max, cost = u.cost[lv];
    return `<div class="up-card" style="animation-delay:${i * 0.06}s"><span class="ico">${ICON[u.icon]}</span>
      <div class="info"><div class="nm">${u.name}</div><div class="ds">${u.ds}</div><div class="pips">${Array.from({ length: u.max }, (_, k) => `<i class="${k < lv ? 'on' : ''}"></i>`).join('')}</div></div>
      <button class="jelly buy" data-buy="${u.id}" ${maxed || state.wallet < cost ? 'disabled' : ''}>${maxed ? 'เต็มแล้ว' : `${ICON.coin}<span>${cost}</span>`}</button></div>`;
  }).join('');
}
async function buyUpgrade(id) {
  const u = UPGRADES.find((x) => x.id === id);
  const lv = state.upgrades[id] || 0;
  if (lv >= u.max || state.wallet < u.cost[lv]) return;
  state.wallet -= u.cost[lv];
  state.upgrades = { ...state.upgrades, [id]: lv + 1 };
  sfx.buy();
  race.sparkle(race.player.obj.position.clone().add({ x: 0, y: 2, z: 0 }), 60, ['#ffd23f', '#ffffff', KART_STYLES[state.kart].glow], 7);
  await store.setSetting('wallet', state.wallet);
  await store.setSetting('upgrades', state.upgrades);
  paintGarage();
}

// ---------- Items ----------
function setItemSlot(kind, rolling = false) {
  const b = $('itemBtn');
  $('itemIco').innerHTML = kind ? ICON[kind] : ICON.star;
  $('itemName').textContent = kind ? ITEMS[kind].name : 'ไอเทม';
  b.classList.toggle('has', !!kind && !rolling);
  b.classList.toggle('roll', rolling);
}
function rollItem() {
  if (!run || run.item || run.rolling) return;
  run.rolling = true;
  const pool = ITEM_TABLE[race.rank()] || ITEM_TABLE[4];
  const final = pool[Math.floor(Math.random() * pool.length)];
  const kinds = Object.keys(ITEMS);
  let n = 0;
  const spin = () => {
    if (!run) return;
    if (n < 12) { setItemSlot(kinds[n % kinds.length], true); sfx.tick(); n++; setTimeout(spin, 50 + n * 8); return; }
    run.rolling = false;
    run.item = final;
    setItemSlot(final);
    sfx.itemGet();
    toast(`${ITEMS[final].name} — ${ITEMS[final].say}`, true);
  };
  spin();
}
function useCurrentItem() {
  if (!run || !run.item || run.done || race.mode !== 'race') return;
  const kind = run.item;
  run.item = null;
  setItemSlot(null);
  const res = race.useItem(kind);
  ({ turbo: () => sfx.boost(), shield: () => sfx.shield(), orb: () => sfx.shoot(), jelly: () => sfx.plop(), cloud: () => sfx.wrong(), 'cloud-miss': () => sfx.tap(), magnet: () => sfx.itemGet() })[res]?.();
  if (res === 'cloud-miss') toast('ไม่มีใครอยู่ข้างหน้าแล้ว!', true);
}
function onHit(isPlayer, kind, fromPlayer) {
  if (isPlayer) { sfx.hit(); toast(kind === 'cloud' ? 'ฝนตกใส่! ช้าลงนิดนึง' : 'หมุนติ้ว! ไม่เป็นไร', true); }
  else if (fromPlayer) { sfx.hit(); toast('โดนเป้า!'); }
}

// ---------- Pickers ----------
const subjectOf = (id) => SUBJECTS.find((s) => s.id === id);
function crumbs() {
  const parts = [];
  if (state.subject) parts.push(subjectOf(state.subject).name);
  if (state.grade) parts.push(`ป.${state.grade}`);
  if (state.topic) parts.push(getTopic(state.subject, state.grade, state.topic).name);
  return parts.join('  /  ');
}

async function openPick(step) {
  state.step = step;
  const grid = $('pickGrid');
  grid.className = 'pick-grid';
  grid.innerHTML = '';
  $('crumbs').textContent = crumbs();
  const add = (html, cls, onClick, style = '') => {
    const b = document.createElement('button');
    b.className = `card ${cls}`;
    b.innerHTML = html;
    if (style) b.style.cssText = style;
    b.style.animationDelay = `${grid.children.length * 0.05}s`;
    b.addEventListener('click', () => { sfx.pop(); squish(b); setTimeout(onClick, 160); });
    grid.appendChild(b);
  };

  if (step === 'subject') {
    $('pickTitle').textContent = 'เลือกวิชา';
    grid.classList.add('subjects');
    for (const s of SUBJECTS) {
      add(`<span class="badge">${ICON[s.id]}</span><span>${s.name}</span><small>${s.en}</small>`, 'subject',
        () => { state.subject = s.id; if (race.themeId !== THEME_OF[s.id]) fade(() => { race.setTheme(THEME_OF[s.id]); race.showroom(); }); openPick('grade'); },
        `background: linear-gradient(160deg, ${s.color}, ${shade(s.color)})`);
    }
  } else if (step === 'grade') {
    $('pickTitle').textContent = 'เลือกระดับชั้น';
    grid.classList.add('grades');
    for (const g of GRADES) add(`ป.${g}<small>${listTopics(state.subject, g).length} เรื่อง</small>`, 'grade', () => { state.grade = g; openPick('topic'); });
  } else if (step === 'topic') {
    $('pickTitle').textContent = 'เลือกเรื่อง';
    grid.classList.add('topics');
    const prog = Object.fromEntries((await store.all('progress')).map((r) => [r.key, r]));
    listTopics(state.subject, state.grade).forEach((t, i) => {
      const rec = prog[progressKey(state.subject, state.grade, t.id)];
      add(`<span class="tname">${i + 1}. ${t.name}</span><span class="tmeta">${starsHTML(rec?.stars || 0)}<span>${rec ? `แข่งแล้ว ${rec.plays} ครั้ง` : 'ยังไม่เคยแข่ง'}</span></span>`,
        'topic', () => { state.topic = t.id; state.levelHint = rec?.level; openPick('level'); });
    });
  } else if (step === 'level') {
    $('pickTitle').textContent = 'เลือกความยาก';
    for (const lv of LEVELS) {
      const rec = state.levelHint === lv.d ? '<small style="color:#ff5fa8">ระดับที่เล่นล่าสุด</small>' : '';
      add(`<span class="meter">${[1, 2, 3].map((k) => `<i class="${k <= lv.d ? 'on' : ''}"></i>`).join('')}</span><span class="lv-name">${lv.name}</span><span class="lv-en">${lv.en}</span>${rec}`,
        'level', () => { state.level = lv.d; openLesson(); });
    }
  }
  show('pick');
}
function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.72));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

function goBack() {
  const order = ['subject', 'grade', 'topic', 'level'];
  if ($('lesson').classList.contains('show')) return openPick('level');
  const i = order.indexOf(state.step);
  if (i <= 0) { state.subject = null; show('title'); return; }
  if (state.step === 'grade') state.subject = null;
  if (state.step === 'topic') state.grade = null;
  if (state.step === 'level') state.topic = null;
  openPick(order[i - 1]);
}

// ---------- Lesson ----------
// Every part of the chapter gets a card; then 2 warm-up questions with feedback linked back to the card.
const PRACTICE_N = 2;
function openLesson(startAt = 0) {
  const topic = getTopic(state.subject, state.grade, state.topic);
  state.lessonIdx = startAt;
  state.seen = new Set();
  state.practice = { deck: createDeck(state.subject, state.grade, state.topic, { seed: Date.now() ^ 0x5a5a }), i: 0, q: null, answered: false, topic };
  $('lessonCrumbs').textContent = crumbs();
  show('lesson');
  paintLesson();
}
function paintLesson() {
  const topic = state.practice.topic;
  const cards = topic.lesson, n = cards.length;
  const i = state.lessonIdx;
  state.seen.add(i);
  $('lessonToc').innerHTML = cards.map((c, k) => `<button class="toc ${k === i ? 'on' : ''} ${state.seen.has(k) ? 'seen' : ''}" data-toc="${k}"><b>${k + 1}</b><span>${richHTML(c.t)}</span></button>`).join('')
    + `<button class="toc practice ${i >= n ? 'on' : ''}" data-toc="${n}"><b>${ICON.star}</b><span>ฝึกก่อนแข่ง</span></button>`;
  $('lessonToc').querySelector('.toc.on')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  const el = $('lessonCard');
  if (i < n) {
    const c = cards[i];
    const say = i === 0 ? `บทนี้มี ${n} ส่วน มาเรียนให้ครบกัน!` : i === n - 1 ? 'ส่วนสุดท้ายแล้ว!' : ['จำตัวอย่างนี้ไว้นะ', 'ดูภาพประกอบด้วย', 'เก่งมาก ไปต่อกัน'][i % 3];
    $('guide').innerHTML = `${GUIDE_FACE}<div class="bubble">${say}</div>`;
    el.innerHTML = `<div class="lt"><span class="part">ส่วนที่ ${i + 1}/${n}</span>${richHTML(c.t)}<button class="icon-btn small say" data-act="say-card" aria-label="อ่านให้ฟัง">${ICON.speak}</button></div>
      ${renderVisual(c.v)}<div class="lx">${richHTML(c.x)}</div>${c.ex ? `<div class="ex">${richHTML(c.ex)}</div>` : ''}`;
    $('lessonNext').innerHTML = i === n - 1 ? `${ICON.star}<span>ฝึกก่อนแข่ง</span>` : 'ต่อไป';
  } else paintPractice();
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  document.querySelector('[data-act="lesson-prev"]').style.visibility = i ? 'visible' : 'hidden';
}
function paintPractice() {
  const p = state.practice;
  if (!p.q) { p.q = p.deck.next(Math.max(1, state.level - 1)); p.answered = false; }
  $('guide').innerHTML = `${GUIDE_FACE}<div class="bubble">ลองตอบดูก่อน ข้อ ${p.i + 1}/${PRACTICE_N}</div>`;
  $('lessonCard').innerHTML = `<div class="lt"><span class="part">ฝึกก่อนแข่ง</span>${richHTML(p.q.q)}</div>
    <div class="pchoices">${p.q.choices.map((c, k) => `<button class="chip pc" data-pc="${k}" style="--c:${LANE_COLORS[k]}"><span>${richHTML(c)}</span></button>`).join('')}</div><div class="pfeed" id="pfeed"></div>`;
  $('lessonNext').innerHTML = p.answered ? (p.i + 1 >= PRACTICE_N ? `${ICON.flag}<span>ไปแข่งเลย!</span>` : 'ข้อต่อไป') : 'เลือกคำตอบก่อนนะ';
  $('lessonNext').disabled = !p.answered;
}
function answerPractice(k) {
  const p = state.practice;
  if (p.answered) return;
  const ok = k === p.q.answer;
  const btns = $('lessonCard').querySelectorAll('.pc');
  btns.forEach((b, j) => { b.classList.toggle('on', j === p.q.answer); b.classList.toggle('off', !ok && j === k); });
  const link = lessonFor(p.topic, p.q);
  if (ok) { sfx.correct(); p.answered = true; $('pfeed').innerHTML = `<div class="pf ok">${ICON.check}<span>ถูกต้อง! ${richHTML(p.q.explain || '')}</span></div>`; }
  else {
    sfx.wrong();
    p.answered = true;
    $('pfeed').innerHTML = `<div class="pf bad">${ICON.cross}<span>คำตอบคือ ${richHTML(p.q.a)}</span></div>
      ${link ? `<button class="relink" data-toc="${link.index}">${ICON.book}<span>ทบทวนส่วนที่ ${link.index + 1}: ${richHTML(link.card.t)} — ${richHTML(link.card.x)}</span></button>` : ''}`;
  }
  $('lessonNext').innerHTML = p.i + 1 >= PRACTICE_N ? `${ICON.flag}<span>ไปแข่งเลย!</span>` : 'ข้อต่อไป';
  $('lessonNext').disabled = false;
}
function lessonNext() {
  const n = state.practice.topic.lesson.length;
  if (state.lessonIdx < n) { state.lessonIdx++; paintLesson(); return; }
  const p = state.practice;
  if (!p.answered) return;
  if (++p.i >= PRACTICE_N) { startRace(); return; }
  p.q = null;
  paintLesson();
}

// ---------- Race ----------
function startRace() { return fade(startRaceNow); }
function startRaceNow() {
  const topic = getTopic(state.subject, state.grade, state.topic);
  run = {
    deck: createDeck(state.subject, state.grade, state.topic, { seed: Date.now() }),
    topic, d: state.level, streak: 0, wrongStreak: 0,
    gateQ: [], retry: null, log: [], coins: 0, done: false, lane: 1, item: null, rolling: false,
  };
  race.setTheme(THEME_OF[state.subject]);
  const base = 19 + state.grade * 1.3 + (state.level - 1) * 1.5;
  race.prepareRace({ gates: GATES, baseSpeed: base, upgrades: state.upgrades });
  setItemSlot(null);
  $('trackGates').innerHTML = Array.from({ length: GATES }, (_, i) => `<i style="left:${((i + 1) / (GATES + 1)) * 100}%"></i>`).join('');
  $('coins').innerHTML = `${ICON.coin}<span>0</span>`;
  $('qhint').classList.remove('show');
  show('hud');
  assignGate(0);
  music.play(1);
  music.setIntensity(1);
  countdown();
}

function countdown() {
  const el = $('count');
  const steps = ['3', '2', '1', 'GO!'];
  const me = run;
  steps.forEach((txt, k) => setTimeout(() => {
    if (run !== me) return;
    el.textContent = txt;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
    sfx.count(k === 3);
    if (k < 3) race.setStartLight(k, '#ff4f7b');
    else { [0, 1, 2].forEach((j) => race.setStartLight(j, '#5fe08a')); race.go(); maybeTutorial(); }
  }, 300 + k * 850));
}

async function maybeTutorial() {
  if (await store.setting('tutorialDone', false)) return;
  const t = $('tutorial');
  t.textContent = 'แตะคำตอบ หรือเลี้ยวซ้าย-ขวา แล้วขับลอดป้าย';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 6000);
  store.setSetting('tutorialDone', true);
}

function assignGate(i) {
  let q, disabled = [false, false, false], retry = false;
  if (run.retry) {
    ({ q, disabled } = run.retry);
    retry = true;
    run.retry = null;
  } else {
    q = run.deck.next(run.d);
  }
  run.gateQ[i] = { q, disabled, retry };
  race.setGateChoices(i, q.choices, disabled);
  $('qnum').textContent = i + 1;
  $('qtext').innerHTML = richHTML(q.q);
  const hint = $('qhint');
  const link = retry ? lessonFor(run.topic, q) : null;
  hint.innerHTML = retry ? `คำใบ้: ${richHTML(q.hint || '')}${link ? `<small class="qlink">${ICON.book}ส่วนที่ ${link.index + 1} ${richHTML(link.card.t)}: ${richHTML(link.card.x)}</small>` : ''}` : '';
  hint.classList.toggle('show', retry);
  $('chips').innerHTML = q.choices.map((c, k) => `<button class="chip ${disabled[k] ? 'off' : ''}" data-lane="${k}" style="--c:${LANE_COLORS[k]}"><span>${richHTML(c)}</span></button>`).join('');
  const panel = $('qpanel');
  panel.classList.remove('flip'); void panel.offsetWidth; panel.classList.add('flip');
  // Keep the kart out of a crossed-out lane
  if (disabled[race.player.lane]) race.setLane(disabled.indexOf(false));
}

function onGate(i, lane) {
  const g = run.gateQ[i];
  if (!g) return;
  const ok = lane === g.q.answer && !g.disabled[lane];
  const mark = $('trackGates').children[i];
  run.log.push({ q: g.q, chosen: g.q.choices[lane], ok, retry: g.retry });
  if (ok) {
    race.reward('correct', i, lane);
    sfx.correct();
    setTimeout(() => sfx.boost(), 150);
    toast(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    mark?.classList.add('ok');
    setTimeout(rollItem, 900); // correct answers earn an item
    run.wrongStreak = 0;
    if (!g.retry && ++run.streak >= 2) { run.d = Math.min(3, run.d + 1); run.streak = 0; }
  } else {
    race.reward('wrong', i, lane);
    sfx.wrong();
    mark?.classList.add('bad');
    run.streak = 0;
    const disabled = g.disabled.slice();
    disabled[lane] = true;
    run.retry = { q: g.q, disabled };
    if (++run.wrongStreak >= 1) run.d = Math.max(1, run.d - 1);
    toast('ลองอีกครั้งนะ', true);
  }
  if (i + 1 < GATES) setTimeout(() => run && assignGate(i + 1), 450);
  else setTimeout(() => $('qpanel').classList.add('hidden'), 450);
}

function onCoin() {
  run.coins++;
  sfx.coin();
  const el = $('coins');
  el.querySelector('span').textContent = run.coins;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}
function onCheckpoint() { sfx.checkpoint(); toast('CHECKPOINT'); }

async function onFinish(rank) {
  if (run.done) return;
  run.done = true;
  sfx.finish();
  engineSpeed(0);
  const first = run.log.filter((l) => !l.retry);
  const firstOk = first.filter((l) => l.ok).length;
  const acc = first.length ? firstOk / first.length : 0;
  const stars = acc >= 0.85 && rank <= 2 ? 3 : acc >= 0.6 ? 2 : 1;
  const time = race.hud().time;
  toast(rank === 1 ? 'ที่ 1!' : 'เข้าเส้นชัย!');
  const key = progressKey(state.subject, state.grade, state.topic);
  await store.recordRace(key, { stars, rank, time, correct: firstOk, total: first.length, level: state.level });
  const earned = run.coins + firstOk * 5 + (RANK_BONUS[rank] || 5);
  state.wallet += earned;
  await store.setSetting('wallet', state.wallet);
  paintWallet();
  setTimeout(() => showResult({ rank, stars, acc, time, firstOk, total: first.length, earned }), 2400);
}

function showResult(r) {
  const titles = ['', 'แชมป์ Sky Rally!', 'อันดับ 2 เก่งมาก!', 'อันดับ 3 สู้ๆ!', 'เข้าเส้นชัยแล้ว!'];
  $('trophy').innerHTML = ICON.trophy;
  $('resultTitle').textContent = titles[r.rank] || titles[4];
  $('resultStars').innerHTML = starsHTML(r.stars, 3, 'big');
  for (let i = 0; i < r.stars; i++) setTimeout(() => sfx.star(i), 300 + i * 250);
  $('stats').innerHTML = [
    [`${r.firstOk}/${r.total}`, 'ตอบถูกครั้งแรก'],
    [`${Math.floor(r.time / 60)}:${String(Math.floor(r.time % 60)).padStart(2, '0')}`, 'เวลา'],
    [`+${r.earned}`, 'ดาวไว้แต่งรถ'],
  ].map(([b, s]) => `<div class="stat"><b>${b}</b><small>${s}</small></div>`).join('');
  $('review').innerHTML = run.log.filter((l) => !l.retry).map((l) => {
    const fixed = !l.ok && run.log.some((x) => x.retry && x.q === l.q && x.ok);
    return `<div class="ri ${l.ok ? '' : 'bad'}"><span class="mk">${l.ok ? ICON.check : ICON.cross}</span><div><div>${richHTML(l.q.q)}</div>
      <div class="a">คำตอบ: ${richHTML(l.q.a)}${!l.ok ? ` (เลือก ${richHTML(l.chosen)}${fixed ? ' แล้วแก้ถูก' : ''})` : ''}</div>
      ${!l.ok ? `<div class="h">${richHTML(l.q.explain || l.q.hint || '')}</div>${(() => { const k = lessonFor(run.topic, l.q); return k ? `<button class="relink" data-toc="${k.index}">${ICON.book}<span>ทบทวนส่วนที่ ${k.index + 1}: ${richHTML(k.card.t)}</span></button>` : ''; })()}` : ''}</div></div>`;
  }).join('');
  music.setIntensity(0.3);
  show('result');
}

function toast(text, small = false) {
  const t = $('toast');
  t.textContent = text;
  t.classList.toggle('small', small);
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
}

function exitToMenu() {
  $('pause').classList.remove('show');
  engineSpeed(0);
  music.setIntensity(0.3);
  fade(() => {
    run = null;
    race.paused = false;
    race.showroom();
    $('qpanel').classList.remove('hidden');
    openPick('topic');
  });
}
function restart() {
  $('pause').classList.remove('show');
  race.paused = false;
  $('qpanel').classList.remove('hidden');
  startRace();
}

// ---------- HUD loop ----------
let lastRank = 0;
function hudLoop() {
  requestAnimationFrame(hudLoop);
  if (!run || !$('hud').classList.contains('show')) return;
  const h = race.hud();
  if (h.rank !== lastRank) { $('rank').innerHTML = `<b>${h.rank}</b><small>/${h.racers}</small>`; const el = $('rank'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); lastRank = h.rank; }
  $('trackFill').style.width = `${h.progress * 100}%`;
  $('trackKart').style.left = `${h.progress * 100}%`;
  engineSpeed(race.paused ? 0 : h.speed);
  const lane = race.player.lane;
  if (lane !== run.lane) { run.lane = lane; }
  document.querySelectorAll('#chips .chip').forEach((c, k) => c.classList.toggle('on', k === lane));
}

// ---------- Input ----------
function bindInput() {
  document.addEventListener('pointerdown', () => sfx.unlock(), { once: true });
  document.addEventListener('click', (e) => {
    const pc = e.target.closest('[data-pc]');
    if (pc) { squish(pc); answerPractice(+pc.dataset.pc); return; }
    const toc = e.target.closest('[data-toc]');
    if (toc) {
      sfx.tap();
      if (!$('lesson').classList.contains('show')) { const k = +toc.dataset.toc; run = null; music.setIntensity(0.3); fade(() => { race.showroom(); openLesson(k); }); }
      else { state.lessonIdx = +toc.dataset.toc; paintLesson(); }
      return;
    }
    const chip = e.target.closest('#chips .chip');
    if (chip && run && !chip.classList.contains('off')) { race.setLane(+chip.dataset.lane); sfx.lane(); squish(chip); return; }
    const buy = e.target.closest('[data-buy]');
    if (buy) { squish(buy); buyUpgrade(buy.dataset.buy); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    sfx.unlock();
    const act = b.dataset.act;
    if (b.classList.contains('jelly')) squish(b);
    ({
      start: () => { sfx.pop(); music.play(0.3); openPick('subject'); },
      back: () => { sfx.tap(); goBack(); },
      sound: async () => { setMuted(!isMuted()); paintSound(); store.setSetting('muted', isMuted()); if (!isMuted()) sfx.tap(); },
      garage: () => { sfx.pop(); openGarage(); },
      'garage-back': () => { sfx.tap(); show('title'); },
      item: () => useCurrentItem(),
      'kart-prev': () => changeKart(-1),
      'kart-next': () => changeKart(1),
      'lesson-prev': () => { sfx.tap(); state.lessonIdx = Math.max(0, state.lessonIdx - 1); paintLesson(); },
      'lesson-next': () => { sfx.pop(); lessonNext(); },
      'lesson-skip': () => { sfx.tap(); startRace(); },
      'say-card': () => {
        const c = state.practice.topic.lesson[state.lessonIdx];
        if (c) speak(`${c.t}. ${c.x}. ${c.ex || ''}`);
      },
      relearn: () => { sfx.tap(); run = null; music.setIntensity(0.3); fade(() => { race.showroom(); openLesson(0); }); },
      pause: () => { if (!run || run.done) return; race.paused = true; engineSpeed(0); $('pause').classList.add('show'); },
      resume: () => { race.paused = false; $('pause').classList.remove('show'); },
      again: () => { sfx.pop(); restart(); },
      menu: () => { sfx.tap(); exitToMenu(); },
      speak: () => {
        const q = run?.gateQ[race.nextGate]?.q;
        if (!q) return;
        const en = state.subject === 'english';
        speak(`${q.q} ${q.choices.join(' , ')}`, en && /^[A-Za-z]/.test(q.q) ? 'en-US' : 'th-TH');
      },
    })[act]?.();
  });

  // Hold buttons: left/right tap to switch lane, brake while held
  document.querySelectorAll('[data-hold]').forEach((b) => {
    const k = b.dataset.hold;
    const down = (e) => {
      e.preventDefault();
      b.classList.add('held');
      if (!run) return;
      if (k === 'left') { race.shiftLane(-1); sfx.lane(); }
      if (k === 'right') { race.shiftLane(1); sfx.lane(); }
      if (k === 'brake') race.setBrake(true);
    };
    const up = () => { b.classList.remove('held'); if (k === 'brake') race.setBrake(false); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
    b.addEventListener('pointercancel', up);
  });

  // Swipe on the 3D view
  let sx = null;
  $('world').addEventListener('pointerdown', (e) => (sx = e.clientX));
  $('world').addEventListener('pointerup', (e) => {
    if (sx == null || !run) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 40) { race.shiftLane(dx > 0 ? 1 : -1); sfx.lane(); }
    sx = null;
  });

  document.addEventListener('keydown', (e) => {
    if (!run || e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') { race.shiftLane(-1); sfx.lane(); }
    else if (k === 'arrowright' || k === 'd') { race.shiftLane(1); sfx.lane(); }
    else if (k === 'arrowdown' || k === 's') { race.setBrake(true); e.preventDefault(); }
    else if (k === ' ' || k === 'e' || k === 'arrowup' || k === 'w') { useCurrentItem(); e.preventDefault(); }
    else if (['1', '2', '3'].includes(k)) { race.setLane(+k - 1); sfx.lane(); }
    else if (k === 'escape' || k === 'p') document.querySelector('#hud [data-act="pause"]').click();
  });
  document.addEventListener('keyup', (e) => { if (['arrowdown', 's'].includes(e.key.toLowerCase())) race.setBrake(false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && run && !run.done) document.querySelector('#hud [data-act="pause"]').click(); });
}

function changeKart(d) {
  sfx.tap();
  state.kart = (state.kart + d + KART_STYLES.length) % KART_STYLES.length;
  race.setPlayerStyle(KART_STYLES[state.kart]);
  updateKartName();
  store.setSetting('kart', state.kart);
}

boot().catch((e) => {
  console.error(e);
  $('loading').innerHTML = `<p>เปิดเกมไม่สำเร็จ ลองรีเฟรชอีกครั้ง</p><small>${String(e.message || e)}</small>`;
});
