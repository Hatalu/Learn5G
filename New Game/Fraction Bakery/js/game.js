// Fraction Bakery: Mimi (teacher) runs a fraction cake shop, Jid-Jid (trickster mouse) keeps messing it up.
// Every answer is built with the hands: cut, frost, box cookies, compare bars. Final round uses the shared question bank.
import * as A from './art.js';
import { sfx, music, setMuted, isMuted } from './audio.js';
import { say, sayLib, stopVoice } from './voice.js';
import { richHTML } from './rich.js';
import { createDeck } from '../../คลังข้อมูลเนื้อและโจทย์/index.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rint(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const F = (n, d, cls = '') => `<span class="frac ${cls}"><b>${n}</b><i>${d}</i></span>`;

// ---------- save (localStorage, falls back to memory) ----------
const KEY = 'fraction-bakery-v1';
let save = { coins: 0, stars: {}, owned: [], intro: false };
try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {} };

// ---------- scenes ----------
async function go(id) {
  $('#fade').classList.add('on');
  await wait(300);
  $$('.scene').forEach((s) => s.classList.toggle('on', s.id === id));
  $('#peek').classList.remove('on');
  $('#fade').classList.remove('on');
}

// ---------- characters + speech ----------
let busyTalk = false;
const charEl = (who) => $(who === 'm' ? '#mimiSide .char' : '#jidSide .char');
function showJid(on) { $('#jidSide').classList.toggle('show', on); }

async function talk(v, text) {
  const b = $('#bubble');
  b.className = 'bubble ' + v.who;
  void b.offsetWidth; b.classList.add('pop');
  b.innerHTML = `<span class="who">${v.who === 'm' ? 'มิมิ' : 'จิ๊ดจิ๊ด'}</span><span>${richHTML(text || v.text)}</span>`;
  if (v.who === 'j') showJid(true);
  const el = charEl(v.who);
  el?.classList.add('talk');
  busyTalk = true;
  await v.done;
  busyTalk = false;
  el?.classList.remove('talk');
}
const line = (id) => talk(say(id));
const lib = (cat) => talk(sayLib(cat));

function hop(el) { el.classList.remove('hop'); void el.getBoundingClientRect(); el.classList.add('hop'); }

// ---------- fx ----------
function sparks(x, y, n = 10) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.innerHTML = A.ICON.sparkle(pick(['#ffd45c', '#ff8fb7', '#7fe0c3', '#9fdcff']));
    const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 90;
    s.style.cssText = `left:${x - 11}px;top:${y - 11}px;--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px`;
    $('#fx').append(s);
    setTimeout(() => s.remove(), 950);
  }
}
function puff(x, y) {
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('div');
    p.className = 'puff';
    p.style.cssText = `left:${x - 35 + rint(-30, 30)}px;top:${y - 35 + rint(-20, 20)}px;animation-delay:${i * 60}ms`;
    $('#fx').append(p);
    setTimeout(() => p.remove(), 900);
  }
}
function floatText(x, y, t) {
  const f = document.createElement('div');
  f.className = 'float'; f.textContent = t;
  f.style.cssText = `left:${x - 20}px;top:${y - 20}px`;
  $('#fx').append(f);
  setTimeout(() => f.remove(), 1000);
}
const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

// ---------- board helpers ----------
const ribbon = (t) => { $('#ribbon').textContent = t; };
const order = (h) => { $('#order').innerHTML = h; };
const work = (h) => { $('#work').innerHTML = h; };
const actions = (h) => { $('#actions').innerHTML = h; };
function hintChip(h) {
  const o = $('#order');
  $('.hintchip', o)?.remove();
  o.insertAdjacentHTML('beforeend', `<div class="hintchip" style="flex-basis:100%;font-size:.75em;background:#fff3c4;border-radius:14px;padding:4px 12px">${h}</div>`);
}
function cakeSize(n = 1) {
  const r = $('#work').getBoundingClientRect();
  return Math.max(110, Math.min(300, (r.width - 20 * n) / n, r.height - 10));
}
function coinsUI() { $$('.coins').forEach((e) => { e.textContent = save.coins; }); }
function addCoins(n, el) {
  save.coins += n; persist(); coinsUI(); sfx.coin();
  if (el) { const [x, y] = center(el); floatText(x, y, '+' + n); }
}

// Wait for the big "next" button (tapping it skips the current voice line).
function waitNext(label = 'ต่อไป') {
  return new Promise((res) => {
    actions(`<button class="btn mint" id="nextBtn">${label}</button>`);
    $('#nextBtn').onclick = () => { sfx.tap(); stopVoice(); res(); };
  });
}
async function beat(id, workHtml, orderHtml) {
  if (workHtml != null) work(workHtml);
  if (orderHtml != null) order(orderHtml);
  line(id);
  await waitNext();
}

// Frosting a cake: tap slices to toggle. onChange(count).
function bindSlices(svgRoot, on, onChange) {
  $$('.slice', svgRoot).forEach((g) => {
    g.onclick = () => {
      const i = +g.dataset.i;
      on[i] = !on[i];
      on[i] ? sfx.pop() : sfx.tap();
      onChange(on.filter(Boolean).length, i);
    };
  });
}

// ---------- difficulty ----------
const DEN = { 1: [2, 3, 4], 2: [3, 4, 5, 6], 3: [5, 6, 8, 10] };
let run = null; // current chapter run

// ---------- lessons (teach with the same toys the tasks use) ----------
const LESSONS = [
  async () => {
    const s = cakeSize(1);
    await beat('c1_a', A.roundCake({ d: 1, size: s }), 'เค้กทั้งก้อน');
    await beat('c1_b', A.roundCake({ d: 4, size: s }), `4 ชิ้น <b style="color:#2fb08c">เท่ากันทุกชิ้น</b>`);
    showJid(true);
    await beat('c1_j', A.roundCake({ d: 4, weights: [3.2, 1, 1.4, 0.7], size: s }), 'จิ๊ดจิ๊ดตัดเอง...');
    const s2 = cakeSize(2);
    await beat('c1_c', `<div class="pick bad">${A.roundCake({ d: 4, weights: [3.2, 1, 1.4, 0.7], size: s2 })}<div class="live" style="justify-content:center;color:#e5578d">ไม่เท่ากัน</div></div>
      <div class="pick good">${A.roundCake({ d: 4, size: s2 })}<div class="live" style="justify-content:center;color:#2fb08c">เท่ากัน</div></div>`, 'เศษส่วนต้องแบ่งเท่ากัน');
  },
  async () => {
    const s = cakeSize(1);
    await beat('c2_a', A.roundCake({ d: 4, on: [1], size: s }), `${F(1, '<u>4</u>', 'big')} <span>ตัวล่าง = ทั้งหมด 4 ชิ้น</span>`);
    await beat('c2_b', A.roundCake({ d: 4, on: [1], size: s }), `${F('<u>1</u>', 4, 'big')} <span>ตัวบน = เลือก 1 ชิ้น</span>`);
    const on = [];
    work(`<div>${A.roundCake({ d: 4, size: s })}</div>`);
    const upd = (c) => { order(`แต่งครีมแล้ว ${F(c, 4, 'big')}`); work(`<div>${A.roundCake({ d: 4, on, size: s })}</div>`); bindSlices($('#work'), on, upd); };
    upd(0);
    line('c2_try');
    await waitNext();
  },
  async () => {
    await beat('c3_a', A.cookieTray({ d: 3, k: 2 }), 'คุกกี้ 6 ชิ้น แบ่ง 3 จาน เท่า ๆ กัน');
    await beat('c3_b', A.cookieTray({ d: 3, k: 2, sel: [1, 1, 1, 1], glow: [1, 1] }) + A.box(4), `${F(2, 3, 'big')} ของ 6 ชิ้น = 2 จาน = 4 ชิ้น`);
  },
  async () => {
    const w = Math.min(420, $('#work').clientWidth - 10);
    await beat('c4_a', A.barCake({ d: 5, on: [1, 1], width: w, label: '2/5' }) + A.barCake({ d: 5, on: [1, 1, 1, 1], width: w, label: '4/5' }), `${F(4, 5, 'big')} มากกว่า ${F(2, 5, 'big')}`);
    showJid(true);
    await beat('c4_j', `<div class="live">${F(1, 8, 'big')} มากกว่า ${F(1, 3, 'big')} ?</div>`, 'จิ๊ดจิ๊ดว่า...');
    await beat('c4_b', A.barCake({ d: 3, on: [1], width: w, label: '1/3' }) + A.barCake({ d: 8, on: [1], width: w, label: '1/8' }), `${F(1, 3, 'big')} มากกว่า ${F(1, 8, 'big')}`);
  },
  async () => {
    const w = Math.min(420, $('#work').clientWidth - 10);
    let d = 2;
    const draw = () => {
      work(A.barCake({ d, on: Array.from({ length: d }, (_, i) => i < d / 2), width: w }));
      order(`${F(d / 2, d, 'big')} <span>กดมีด ผ่าทุกชิ้นเพิ่ม</span>`);
    };
    draw();
    line('c5_a');
    await new Promise((res) => {
      actions(`<button class="btn sun" id="split">${A.ICON.knife} ผ่าเพิ่ม</button><button class="btn mint" id="nextBtn" style="display:none">ต่อไป</button>`);
      $('#split').onclick = (e) => {
        sfx.pop(); hop(e.currentTarget);
        d *= 2; draw();
        if (d >= 8) { $('#split').disabled = true; $('#nextBtn').style.display = ''; }
      };
      $('#nextBtn').onclick = () => { sfx.tap(); stopVoice(); res(); };
    });
    await beat('c5_b', A.barCake({ d: 2, on: [1], width: w, label: '1/2' }) + A.barCake({ d: 4, on: [1, 1], width: w, label: '2/4' }) + A.barCake({ d: 8, on: [1, 1, 1, 1], width: w, label: '4/8' }), `${F(1, 2, 'big')} = ${F(2, 4, 'big')} = ${F(4, 8, 'big')}`);
  },
  async () => {
    const w = Math.min(420, $('#work').clientWidth - 10);
    await beat('c6_a', A.barCake({ d: 5, on: [1, 1], width: w, label: '2/5' }) + A.barCake({ d: 5, on: [0, 0, 1], width: w, label: '1/5' }) + A.barCake({ d: 5, on: [1, 1, 1], width: w, label: '3/5' }), `${F(2, 5, 'big')} + ${F(1, 5, 'big')} = ${F(3, 5, 'big')}`);
    showJid(true);
    await beat('c6_j', A.barCake({ d: 6, on: [1, 1, 1, 1, 1], width: w, label: '5/6' }), `มีเค้ก ${F(5, 6, 'big')}`);
    await beat('c6_b', A.barCake({ d: 6, on: [1, 1, 1, 0, 0], gone: [0, 0, 0, 1, 1], width: w, label: '3/6' }), `${F(5, 6, 'big')} − ${F(2, 6, 'big')} = ${F(3, 6, 'big')}`);
  },
];

// ---------- tasks: each returns { order, html, mount(submit), auto() } ; submit(ok, info) ----------
function choiceTask(orderHtml, visual, opts, correct, jidTrick = true) {
  // opts: array of HTML labels; correct: index
  return {
    order: orderHtml,
    html: `${visual}<div class="choices">${opts.map((o, i) => `<button class="choice" data-k="${i}">${o}</button>`).join('')}</div>`,
    trick: jidTrick ? opts.findIndex((_, i) => i !== correct) : -1,
    mount(submit) { $$('.choice').forEach((b) => { b.onclick = () => submit(+b.dataset.k === correct, b); }); },
    eliminate() { const w = $$('.choice').filter((b) => +b.dataset.k !== correct && !b.classList.contains('out')); if (w.length > 1) w[0].classList.add('out'); },
    reveal() { $$('.choice')[correct]?.classList.add('good'); },
    auto() { $$('.choice')[correct].click(); },
  };
}

const TASKS = {
  equal(lvl) {
    const d = pick(DEN[lvl]), shapeRound = lvl === 1 || Math.random() < 0.5, good = rint(0, 2);
    const s = cakeSize(3);
    const cakes = [0, 1, 2].map((i) => {
      const weights = i === good ? null : A.unequalWeights(d);
      return shapeRound ? A.roundCake({ d, weights, size: s }) : A.barCake({ d, weights, width: Math.min(260, s * 1.3) });
    });
    return {
      order: `แตะเค้กที่แบ่ง <b>${d} ชิ้นเท่ากัน</b>`, say: 'c1_task',
      html: cakes.map((c, i) => `<div class="pick" data-k="${i}">${c}</div>`).join(''),
      hint: 'ดูขนาดทุกชิ้น ต้องเท่ากันหมดนะ',
      mount(submit) { $$('.pick').forEach((p) => { p.onclick = () => submit(+p.dataset.k === good, p); }); },
      eliminate() { const w = $$('.pick').filter((p) => +p.dataset.k !== good && !p.classList.contains('out')); if (w.length > 1) w[0].classList.add('out'); },
      reveal() { $$('.pick')[good].classList.add('good'); },
      auto() { $$('.pick')[good].click(); },
      label: `แบ่ง ${d} ชิ้นเท่ากัน`,
    };
  },
  cut(lvl) {
    const d = pick(DEN[lvl].filter((x) => x > 2) .concat(DEN[lvl])), s = cakeSize(1);
    let n = 1;
    const draw = () => { $('#cake').innerHTML = A.roundCake({ d: n, size: s * 0.9 }); $('#cnt').textContent = n; };
    return {
      order: `ลูกค้า ${d} คน ขอเค้กคนละ 1 ชิ้นเท่ากัน`, say: 'c1_cut',
      html: `<div id="cake"></div><div class="knife"><button class="iconbtn" id="mn">${A.ICON.minus}</button>${A.ICON.knife}<span id="cnt">1</span> ชิ้น<button class="iconbtn" id="pl">${A.ICON.plus}</button></div>`,
      serve: true, hint: `ต้องได้ ${d} ชิ้น ให้ครบ ${d} คนนะ`,
      mount(submit) {
        draw();
        $('#pl').onclick = (e) => { if (n < 12) { n++; sfx.pop(); hop(e.currentTarget); draw(); } };
        $('#mn').onclick = (e) => { if (n > 1) { n--; sfx.tap(); hop(e.currentTarget); draw(); } };
        this.check = () => submit(n === d, $('#cake'));
      },
      reveal() { n = d; draw(); },
      auto() { n = d; draw(); this.check(); },
      label: `ตัดเค้ก ${d} ชิ้น`,
    };
  },
  frost(lvl) {
    const d = pick(DEN[lvl]), n = rint(1, d - 1), round = lvl < 3 ? Math.random() < 0.6 : Math.random() < 0.4;
    const on = [], s = cakeSize(1), w = Math.min(420, $('#work').clientWidth - 10);
    const draw = () => {
      $('#cake').innerHTML = round ? A.roundCake({ d, on, size: s * 0.85 }) : A.barCake({ d, on, width: w });
      $('#live').innerHTML = `แต่งแล้ว ${F(on.filter(Boolean).length, d, 'big')}`;
      bindSlices($('#cake'), on, draw);
    };
    return {
      order: `ออเดอร์: เค้กแต่งครีม ${F(n, d, 'big')}`, say: 'c2_task',
      html: `<div id="cake"></div><div class="live" id="live"></div>`,
      serve: true, hint: `แต่งครีม ${n} ชิ้น จากทั้งหมด ${d} ชิ้น`,
      mount(submit) { draw(); this.check = () => submit(on.filter(Boolean).length === n, $('#cake')); },
      reveal() { on.length = 0; for (let i = 0; i < n; i++) on[i] = true; draw(); $$('#cake .slice').forEach((g, i) => i < n && g.classList.add('flash')); },
      auto() { this.reveal(); this.check(); },
      label: `แต่งครีม ${n}/${d}`,
    };
  },
  name(lvl) {
    const d = pick(DEN[lvl]), n = rint(1, d - 1), s = cakeSize(2);
    const on = shuffle(Array.from({ length: d }, (_, i) => i < n));
    const other = d - n !== n ? [d - n, d] : [n === 1 ? 2 : n - 1, d];
    const opts = shuffle([[n, d], other, [d, n]]);
    const correct = opts.findIndex(([a, b]) => a === n && b === d);
    const t = choiceTask(`เค้กนี้แต่งครีมไปเท่าไร`, `<div>${A.roundCake({ d, on, size: s * 0.8 })}</div>`, opts.map(([a, b]) => F(a, b)), correct);
    return { ...t, say: 'c2_pick', hint: 'ตัวล่าง = นับทุกชิ้น ตัวบน = นับชิ้นที่มีครีม', label: `อ่าน ${n}/${d}` };
  },
  set(lvl) {
    const d = pick({ 1: [2, 3], 2: [3, 4], 3: [4, 5, 6] }[lvl]), k = pick(lvl === 1 ? [2, 3] : [2, 3]), n = rint(1, d - 1);
    const sel = [];
    const draw = () => {
      $('#tray').innerHTML = A.cookieTray({ d, k, sel });
      $('#bx').innerHTML = A.box(sel.filter(Boolean).length);
      $$('#tray .cookie').forEach((c) => { c.onclick = () => { const i = +c.dataset.i; sel[i] = !sel[i]; sel[i] ? sfx.pop() : sfx.tap(); draw(); }; });
    };
    let glow = [];
    return {
      order: `ใส่ ${F(n, d, 'big')} ของคุกกี้ ${d * k} ชิ้นลงกล่อง`, say: 'c3_task',
      html: `<div id="tray" style="max-width:70%"></div><div id="bx"></div>`,
      serve: true, hint: `${d} จาน เลือก ${n} จาน`,
      mount(submit) { draw(); this.check = () => submit(sel.filter(Boolean).length === n * k, $('#bx')); },
      eliminate() { glow = Array.from({ length: d }, (_, i) => i < n); $('#tray').innerHTML = A.cookieTray({ d, k, sel, glow }); draw(); $$('#tray .plate').forEach((p, i) => glow[i] && p.classList.add('glow')); },
      reveal() { sel.length = 0; for (let i = 0; i < n * k; i++) sel[i] = true; draw(); },
      auto() { this.reveal(); this.check(); },
      label: `${n}/${d} ของ ${d * k} = ${n * k}`,
    };
  },
  compare(lvl) {
    let a, b, c, d;
    if (lvl === 1) { d = b = pick([4, 5, 6, 8]); a = rint(1, b - 1); do { c = rint(1, d - 1); } while (c === a); }
    else if (lvl === 2) { a = c = rint(1, 2); b = pick([3, 4, 5]); do { d = pick([3, 4, 5, 6, 8]); } while (d === b || d <= a); }
    else if (Math.random() < 0.4) { b = pick([2, 3, 4]); a = rint(1, b - 1); const k = pick([2, 3]); c = a * k; d = b * k; }
    else { b = pick([3, 4, 6]); d = b * 2; a = rint(1, b - 1); do { c = rint(1, d - 1); } while (c === a * 2); }
    const L = a / b, R = c / d, correct = Math.abs(L - R) < 1e-9 ? 2 : L > R ? 0 : 1;
    const w = Math.min(380, $('#work').clientWidth - 30);
    const bar = (n, m) => A.barCake({ d: m, on: Array.from({ length: m }, (_, i) => i < n), width: w });
    const t = choiceTask('แตะเค้กที่มีครีมมากกว่า', `<div style="display:grid;gap:4px;justify-items:center">${bar(a, b)}${bar(c, d)}</div>`, [F(a, b), F(c, d), 'เท่ากัน'], correct);
    return { ...t, say: 'c4_task', hint: lvl === 2 ? 'ตัวล่างเยอะ ชิ้นยิ่งเล็กนะ' : 'ดูความยาวครีมสีชมพู', label: `${a}/${b} กับ ${c}/${d}` };
  },
  equiv(lvl) {
    const b = pick(lvl === 1 ? [2, 3] : [2, 3, 4]), a = rint(1, b - 1), k = pick(lvl === 3 && b <= 3 ? [3, 4] : [2, 3]), d = b * k;
    const on = [], w = Math.min(420, $('#work').clientWidth - 10);
    const draw = () => {
      $('#tgt').innerHTML = A.barCake({ d, on, width: w });
      $('#live').innerHTML = `${F(on.filter(Boolean).length, d, 'big')} = ${F(a, b, 'big')} ?`;
      bindSlices($('#tgt'), on, draw);
    };
    return {
      order: `แต่งครีมให้เท่ากับ ${F(a, b, 'big')}`, say: 'c5_task',
      html: `<div style="display:grid;gap:4px;justify-items:center">${A.barCake({ d: b, on: Array.from({ length: b }, (_, i) => i < a), width: w, label: `ต้นแบบ ${a}/${b}` })}<div id="tgt"></div><div class="live" id="live"></div></div>`,
      serve: true, hint: `1 ชิ้นใหญ่ = ${k} ชิ้นเล็ก`,
      mount(submit) { draw(); this.check = () => submit(on.filter(Boolean).length === a * k, $('#tgt')); },
      reveal() { on.length = 0; for (let i = 0; i < a * k; i++) on[i] = true; draw(); },
      auto() { this.reveal(); this.check(); },
      label: `${a}/${b} = ${a * k}/${d}`,
    };
  },
  add(lvl) {
    const d = pick(DEN[Math.min(3, lvl + 1)]), sub = lvl >= 2 && Math.random() < 0.55;
    let a, b, ans;
    if (sub) { a = rint(2, d - 1); b = rint(1, a - 1); ans = a - b; } else { a = rint(1, d - 2); b = rint(1, d - 1 - a); ans = a + b; }
    const on = [], w = Math.min(400, $('#work').clientWidth - 10);
    const sm = Math.min(300, w * 0.75);
    const top = sub
      ? A.barCake({ d, on: Array.from({ length: d }, (_, i) => i < a), gone: Array.from({ length: d }, (_, i) => i >= a - b && i < a), width: sm, label: `มี ${a}/${d} จิ๊ดจิ๊ดกิน ${b}/${d}` })
      : A.barCake({ d, on: Array.from({ length: d }, (_, i) => i < a), width: sm, label: `${a}/${d}` }) + A.barCake({ d, on: Array.from({ length: d }, (_, i) => i >= a && i < a + b), width: sm, label: `${b}/${d}` });
    const draw = () => {
      $('#tgt').innerHTML = A.barCake({ d, on, width: w });
      $('#live').innerHTML = `ผลลัพธ์ ${F(on.filter(Boolean).length, d, 'big')}`;
      bindSlices($('#tgt'), on, draw);
    };
    return {
      order: sub ? `${F(a, d, 'big')} − ${F(b, d, 'big')} = ?` : `${F(a, d, 'big')} + ${F(b, d, 'big')} = ?`, say: sub ? 'c6_b' : 'c6_task',
      html: `<div style="display:grid;gap:2px;justify-items:center">${top}<div id="tgt"></div><div class="live" id="live"></div></div>`,
      serve: true, hint: sub ? `${a} − ${b} ชิ้น` : `${a} + ${b} ชิ้น`, jidEat: sub,
      mount(submit) { draw(); this.check = () => submit(on.filter(Boolean).length === ans, $('#tgt')); },
      reveal() { on.length = 0; for (let i = 0; i < ans; i++) on[i] = true; draw(); },
      auto() { this.reveal(); this.check(); },
      label: `${a}/${d} ${sub ? '−' : '+'} ${b}/${d} = ${ans}/${d}`,
    };
  },
  bank(lvl, deck) {
    const q = deck.next(lvl);
    const t = choiceTask(richHTML(q.q), '', q.choices.map((c) => richHTML(String(c))), q.answer);
    return { ...t, hint: richHTML(q.hint || ''), explain: q.explain, label: q.q.slice(0, 26) };
  },
};

const CHAPTERS = [
  { name: 'แบ่งให้เท่ากัน', tasks: ['equal', 'cut', 'equal', 'cut', 'equal'] },
  { name: 'อ่านและเขียนเศษส่วน', tasks: ['frost', 'name', 'frost', 'name', 'frost'] },
  { name: 'เศษส่วนของกลุ่ม', tasks: ['set', 'set', 'set', 'set', 'set'] },
  { name: 'เปรียบเทียบเศษส่วน', tasks: ['compare', 'compare', 'compare', 'compare', 'compare'] },
  { name: 'เศษส่วนที่เท่ากัน', tasks: ['equiv', 'equiv', 'equiv', 'equiv', 'equiv'] },
  { name: 'บวกลบเศษส่วน', tasks: ['add', 'add', 'add', 'add', 'add'] },
  { name: 'ออเดอร์ใหญ่ (รวมทุกเรื่อง)', tasks: ['bank', 'bank', 'bank', 'bank', 'bank', 'bank'], final: true },
];

// ---------- chapter run ----------
async function startChapter(ci) {
  const ch = CHAPTERS[ci];
  run = { ci, i: 0, lvl: 1, streak: 0, results: [], earned: 0, sinceJid: 0, deck: ch.final ? createDeck('math', 4, 'fraction4', { choices: 3 }) : null, deck3: ch.final ? createDeck('math', 3, 'fraction3', { choices: 3 }) : null };
  await go('play');
  showJid(false);
  dots();
  ribbon(ch.final ? 'ออเดอร์ใหญ่' : `บทเรียน: ${ch.name}`);
  order(''); work(''); actions('');
  if (!save.intro) {
    save.intro = true; persist();
    work(A.bakery(save.owned));
    await beat('m_hello', null, '');
    await beat('m_help');
    showJid(true);
    await beat('j_hello');
    showJid(false);
  }
  if (ch.final) { work(''); await beat('fin_a', null, 'ตอบ 6 ข้อ รวมทุกเรื่อง'); }
  else await LESSONS[ci]();
  showJid(false);
  nextTask();
}

function dots() {
  const n = CHAPTERS[run.ci].tasks.length;
  $('#dots').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < run.i ? 'ok' : i === run.i ? 'now' : ''}"></i>`).join('');
}

let task = null;
async function nextTask() {
  const ch = CHAPTERS[run.ci];
  if (run.i >= ch.tasks.length) return finishChapter();
  dots();
  const type = ch.tasks[run.i];
  ribbon(`ออเดอร์ที่ ${run.i + 1}/${ch.tasks.length}`);
  work('');
  const prev = task?.label;
  for (let k = 0; k < 6; k++) { // avoid the same order twice in a row
    task = TASKS[type](run.lvl, run.i % 2 ? run.deck3 || run.deck : run.deck);
    if (task.label !== prev || type === 'bank') break;
  }
  task.tries = 0;
  order(task.order); work(task.html); actions(task.serve ? '<button class="btn" id="serve">เสิร์ฟ!</button>' : '');
  task.mount(onSubmit);
  if (task.serve) $('#serve').onclick = (e) => { hop(e.currentTarget); task.check(); };
  const said = task.say && run.i < 2 ? line(task.say) : Promise.resolve(); // say the instruction only for the first orders
  run.sinceJid++;
  const my = task;
  await said;
  if (task !== my) return;
  // Jid-Jid mischief, with a cooldown so it never spams
  if (task.trick >= 0 && run.sinceJid >= 2 && Math.random() < 0.5) { run.sinceJid = 0; jidTrick(task.trick); }
  else if (run.sinceJid >= 3 && Math.random() < 0.7) { run.sinceJid = 0; await wait(rint(800, 2000)); if (task === my) jidSteal(); }
}

// Jid points at a wrong choice: teaches "check it yourself".
async function jidTrick(k) {
  const b = $$('.choice')[k];
  if (!b) return;
  task.tricked = true;
  showJid(true);
  b.insertAdjacentHTML('beforeend', `<svg class="jidpoint" viewBox="0 0 40 40"><path d="M20 38 L6 14 Q2 4 12 3 L28 3 Q38 4 34 14 Z" fill="#b7a6ee" stroke="#4a2f45" stroke-width="3"/><circle cx="20" cy="14" r="5" fill="#fff"/></svg>`);
  await lib('jwrong');
}

// Jid sneaks in to steal: tap him fast for bonus coins. Missing him costs nothing.
function jidSteal() {
  const p = $('#peek');
  const left = Math.random() < 0.5;
  p.innerHTML = A.jid() + `<div class="alert">${A.ICON.alert}</div>`;
  p.style.left = left ? '8px' : 'auto';
  p.style.right = left ? 'auto' : '8px';
  p.style.transform = 'translateY(110%)';
  p.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => { p.style.transform = 'translateY(30%)'; }));
  talk(say('j_steal'));
  let done = false;
  p.onclick = async () => {
    if (done) return; done = true;
    const [x, y] = center(p);
    puff(x, y); sfx.hit(); addCoins(3, p);
    p.style.transform = 'translateY(120%)';
    await talk(say('j_caught'));
    p.classList.remove('on');
  };
  setTimeout(async () => {
    if (done) return; done = true;
    p.style.transform = 'translateY(120%)';
    lib('jlaugh');
    await wait(500); p.classList.remove('on');
  }, 4500);
}

let locked = false;
async function onSubmit(ok, el) {
  if (locked) return;
  locked = true;
  const [x, y] = el ? center(el) : [innerWidth / 2, innerHeight / 2];
  if (ok) {
    sfx.correct(); sparks(x, y, 14);
    el?.classList?.add('good');
    const first = task.tries === 0;
    run.results.push({ label: task.label, ok: first });
    if (first) { run.streak++; addCoins(3, el); } else { run.streak = 0; addCoins(1, el); }
    if (run.streak >= 2 && run.lvl < 3) { run.lvl++; run.streak = 0; }
    hop(charEl('m'));
    if (task.explain) hintChip(richHTML(task.explain));
    await (task.tricked ? lib('jhit') : run.streak === 0 && first ? lib('streak') : lib('praise'));
    await wait(250);
    run.i++; locked = false;
    nextTask();
    return;
  }
  task.tries++;
  sfx.wrong();
  el?.classList?.remove('bad'); void el?.getBoundingClientRect(); el?.classList?.add('bad');
  run.streak = 0;
  if (run.lvl > 1) run.lvl--;
  if (task.tries === 1) {
    hintChip(`${A.ICON.sparkle('#ffb800').replace('<svg', '<svg width="18" height="18" style="vertical-align:middle"')} ${task.hint}`);
    task.eliminate?.();
    locked = false;
    await lib('oops');
  } else {
    // second miss: show the answer, then move on (no game over)
    task.reveal?.();
    hintChip(`ดูคำตอบนะ ${task.hint}`);
    run.results.push({ label: task.label, ok: false });
    await lib('hint');
    await waitNext('เข้าใจแล้ว');
    run.i++; locked = false;
    nextTask();
  }
}

async function finishChapter() {
  const ch = CHAPTERS[run.ci];
  const good = run.results.filter((r) => r.ok).length, tot = ch.tasks.length;
  const st = good >= tot ? 3 : good >= tot - 2 ? 2 : 1;
  save.stars[run.ci] = Math.max(save.stars[run.ci] || 0, st);
  persist();
  dots();
  sfx.finish();
  $('#resStars').innerHTML = '';
  $('#resTitle').textContent = ch.final ? 'ออเดอร์ใหญ่สำเร็จ!' : `ผ่าน "${ch.name}"`;
  $('#resReview').innerHTML = run.results.map((r) => `<div><span>${richHTML(r.label)}</span><b style="color:${r.ok ? '#2fb08c' : '#e5578d'}">${r.ok ? 'ถูกรอบแรก' : 'ฝึกเพิ่ม'}</b></div>`).join('');
  $('#result').classList.add('on');
  for (let i = 0; i < 3; i++) {
    await wait(300);
    $('#resStars').insertAdjacentHTML('beforeend', A.ICON.star(i < st));
    if (i < st) sfx.star(i);
  }
  const allDone = CHAPTERS.every((_, i) => save.stars[i]);
  await (allDone && ch.final ? line('m_end') : lib('clear'));
  showJid(true);
  await lib('jlose');
}

// ---------- map + shop ----------
function renderMap() {
  $('#front').innerHTML = A.bakery(save.owned);
  const next = CHAPTERS.findIndex((_, i) => !save.stars[i]);
  $('#menus').innerHTML = CHAPTERS.map((c, i) => {
    const open = i === 0 || save.stars[i - 1];
    return `<button class="menu ${open ? '' : 'lock'} ${i === next ? 'glow' : ''}" data-i="${i}">
      <span class="no">${c.final ? 'พิเศษ' : 'เมนู ' + (i + 1)}</span>
      <div style="height:70px;display:grid;place-items:center">${A.THUMB[i]().replace('<svg', '<svg class="thumb"')}</div>
      <div>${c.name}</div><div class="stars">${A.stars(save.stars[i] || 0)}</div></button>`;
  }).join('');
  $$('#menus .menu').forEach((b) => {
    b.onclick = () => {
      const i = +b.dataset.i;
      if (b.classList.contains('lock')) { sfx.wrong(); b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); return; }
      sfx.tap(); startChapter(i);
    };
  });
  coinsUI();
}
function renderShop() {
  $('#items').innerHTML = A.DECOR.map((d) => {
    const own = save.owned.includes(d.id);
    return `<div class="item ${own ? 'own' : ''}">${A.decorThumb(d.id)}<div>${d.name}</div>
      ${own ? '<b style="color:#2fb08c">ติดตั้งแล้ว</b>' : `<button class="btn sun" data-id="${d.id}" ${save.coins < d.cost ? 'disabled' : ''} style="font-size:18px;min-height:40px">${A.ICON.coin.replace('<svg', '<svg width="20" height="20" style="vertical-align:middle"')} ${d.cost}</button>`}</div>`;
  }).join('');
  $$('#items button').forEach((b) => {
    b.onclick = () => {
      const d = A.DECOR.find((x) => x.id === b.dataset.id);
      if (save.coins < d.cost) return;
      save.coins -= d.cost; save.owned.push(d.id); persist();
      sfx.buy(); const [x, y] = center(b); sparks(x, y, 12);
      renderShop(); renderMap();
    };
  });
  coinsUI();
}

// ---------- boot ----------
function boot() {
  $('#titleDuo').innerHTML = A.mimi() + A.jid();
  $('#mimiSide').innerHTML = A.mimi();
  $('#jidSide').innerHTML = A.jid();
  $$('.coinIcon').forEach((e) => { e.innerHTML = A.ICON.coin; });
  $$('.homeBtn').forEach((e) => { e.innerHTML = A.ICON.home; e.onclick = () => { sfx.tap(); stopVoice(); task = null; $('#result').classList.remove('on'); renderMap(); go('map'); }; });
  const snd = () => $$('.sndBtn').forEach((e) => { e.innerHTML = A.ICON.sound(!isMuted()); });
  $$('.sndBtn').forEach((e) => { e.onclick = () => { setMuted(!isMuted()); if (isMuted()) stopVoice(); snd(); }; });
  snd();
  $('#shopBtn').innerHTML = A.ICON.shop;
  $('#shopBtn').onclick = () => { sfx.tap(); renderShop(); $('#shop').classList.add('on'); };
  $('#shopClose').onclick = () => { sfx.tap(); $('#shop').classList.remove('on'); };
  $('#startBtn').onclick = () => { sfx.unlock(); sfx.tap(); music.play(0.3); renderMap(); go('map'); };
  $('#again').onclick = () => { sfx.tap(); $('#result').classList.remove('on'); startChapter(run.ci); };
  $('#toMap').onclick = () => { sfx.tap(); stopVoice(); $('#result').classList.remove('on'); renderMap(); go('map'); };
  // tap the characters
  $('#mimiSide').onclick = () => { hop(charEl('m')); sfx.pop(); if (!busyTalk) talk(say(pick(['m_tap1', 'm_tap2']))); };
  $('#jidSide').onclick = () => { hop(charEl('j')); sfx.plop(); if (!busyTalk) talk(say('j_tap')); };
  $('#titleDuo').onclick = (e) => { const c = e.target.closest('.char'); if (c) { hop(c); sfx.pop(); } };
  // keyboard: Enter = serve/next, 1-3 = choices
  addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { ($('#nextBtn') || $('#serve'))?.click(); e.preventDefault(); }
    const k = +e.key;
    if (k >= 1 && k <= 3) ($$('.choice')[k - 1] || $$('.pick')[k - 1])?.click();
  });
  coinsUI();
}
boot();

// dev hook: FB.solve() answers the current order correctly
window.FB = { get run() { return run; }, get task() { return task; }, solve: () => task?.auto(), save, startChapter };
