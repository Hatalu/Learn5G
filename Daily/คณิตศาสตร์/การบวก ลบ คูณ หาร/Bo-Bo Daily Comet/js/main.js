/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — ตัวควบคุมเกม: หน้าแรก / วิ่งภารกิจ 8 ข้อ / บลิ๊บป่วน / สรุปผล / สมุดสะสมดาว / ตั้งค่า
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC;
  const { $, $$, h, esc, wait, show, shake, boing, sparkle, confetti, puff, floatText, toast, flyStar, store, thaiDate, TH_DAY, TH_MON, TH_MON_S } = DC.ui;
  const art = DC.art, audio = DC.audio, NV = DC.NV;
  const VOICED = root.VOICED || {};
  const DEV = /[?&]dev=1/.test(location.search) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const FAST = DEV && /[?&]fast=1/.test(location.search);
  DC.fast = FAST;

  const S = store.load();
  const ROUNDS = 8;
  let TODAY = new Date(), DKEY = DC.dayKey(TODAY), DIDX = DC.dayIndex(TODAY);
  function refreshToday() { TODAY = new Date(); DKEY = DC.dayKey(TODAY); DIDX = DC.dayIndex(TODAY); }

  const pickR = a => a[Math.floor(Math.random() * a.length)];
  /* ── ชุดเสียงพูดของตัวละคร (ใช้คลังกลาง guide_m / trickster + คลิปของเกมนี้) ── */
  const L = {
    praise: ['guide_m/praise1', 'guide_m/praise2', 'guide_m/praise3', 'guide_m/praise4'],
    oops: ['guide_m/oops1', 'guide_m/oops2', 'guide_m/oops3'],
    hint: ['guide_m/hint1', 'guide_m/hint2', 'guide_m/think'],
    tIntro: ['trickster/intro1', 'trickster/intro2'],
    tWrong: ['trickster/wrong1', 'trickster/wrong2', 'trickster/wrong3', 'trickster/wrong4'],
    tHit: ['trickster/hit1', 'trickster/hit2', 'trickster/hit3', 'trickster/surprise'],
    tWin: ['trickster/gotcha', 'trickster/laugh', 'trickster/taunt1', 'trickster/taunt2']
  };
  const textOf = ids => ids.map(i => VOICED[i] || '').filter(Boolean).join(' ');

  /* ═════════ ตัวละครและกล่องคำพูด ═════════ */
  const guide = {
    mood: 'happy', tok: 0,
    set(mood) { this.mood = mood; $('#gChar').innerHTML = art.bobo(mood); },
    async say(ids, o) {
      o = o || {};
      const tok = ++this.tok;
      const txt = o.text != null ? o.text : textOf(ids);
      $('#gText').textContent = txt;
      const bub = $('#gBubble'); bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      this.set(o.mood || 'talk'); $('#guide').classList.add('speaking');
      this.last = { ids, o };
      let ok = true;
      if (ids && ids.length) ok = await audio.say(ids);
      else await wait(o.hold || 0);
      if (tok === this.tok) { $('#guide').classList.remove('speaking'); this.set(o.after || 'happy'); }
      return ok;
    },
    text(txt, mood) { this.tok++; $('#gText').textContent = txt; const b = $('#gBubble'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); this.set(mood || 'happy'); },
    react(mood) { this.set(mood); boing($('#gChar')); }
  };

  const blip = {
    el: null, mood: 'sneaky', big: false,
    set(mood) { this.mood = mood; $('#blipChar').innerHTML = art.blip(mood); },
    arrive(big) { this.big = !!big; const z = $('#blipZone'); z.classList.toggle('big', !!big); z.classList.remove('out'); z.classList.add('in'); this.set('sneaky'); audio.sfx('ufo'); },
    leave() { const z = $('#blipZone'); z.classList.remove('in'); z.classList.add('out'); },
    say(txt, ms) { const b = $('#blipBubble'); b.textContent = txt; b.classList.remove('hidden'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); clearTimeout(this._t); this._t = setTimeout(() => b.classList.add('hidden'), ms || 2600); },
    async speak(ids, mood, txt) { this.set(mood || 'sneaky'); this.say(txt != null ? txt : textOf(ids), 3000); const ok = await audio.say(ids); return ok; }
  };

  /* ═════════ สถานะการเล่น ═════════ */
  let R = null;           // ข้อมูลรอบที่กำลังเล่น
  let cur = null;         // ข้อปัจจุบัน
  let run = null;

  const ASK = {
    equals: '', missing: '', which: '', greater: 'แตะจำนวนที่มากที่สุด', less: 'แตะจำนวนที่น้อยที่สุด', spot: 'แตะสมการที่ผิด',
    match: 'แตะโจทย์ แล้วแตะคำตอบคู่กัน', order: '', count: 'แตะนับ แล้วเลือกคำตอบ', share: 'แบ่งให้เพื่อนเท่า ๆ กัน', hop: 'กบต้องไปหยุดที่เลขไหน', balance: 'เติมน้ำหนักให้คานสมดุล'
  };

  function dailyDone(grade) {
    const d = S.days[DKEY]; return d && d.g && d.g[grade] != null;
  }
  function streakOf() {
    let n = 0; const d = new Date(TODAY); if (!(S.days[DC.dayKey(d)])) d.setDate(d.getDate() - 1);
    while (S.days[DC.dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bestStreak() {
    const keys = Object.keys(S.days).map(Number).sort((a, b) => a - b); let best = 0, run1 = 0, prev = null;
    for (const k of keys) { const y = Math.floor(k / 10000), m = Math.floor(k / 100) % 100 - 1, dd = k % 100; const t = Date.UTC(y, m, dd); if (prev != null && t - prev === 86400000) run1++; else run1 = 1; prev = t; best = Math.max(best, run1); }
    return best;
  }

  /* ═════════ หน้าแรก ═════════ */
  function renderTitle() {
    refreshToday();
    $('#titleDate').textContent = thaiDate(TODAY);
    const pn = art.planetName(DIDX);
    $('#titlePlanet').innerHTML = art.planet(DIDX, { uid: 't' });
    $('#titlePlanetName').textContent = pn;
    $('#titleBobo').innerHTML = art.bobo('cheer');
    $('#titleBlip').innerHTML = art.blip('sneaky');
    const st = streakOf();
    $('#titleStreak').innerHTML = art.icon('flame') + '<b>' + st + '</b><small>วันติด</small>';
    $('#titleStreak').classList.toggle('zero', st === 0);
    $$('#gradeRow .gchip').forEach(b => b.classList.toggle('on', +b.dataset.g === S.grade));
    const done = dailyDone(S.grade);
    const d = S.days[DKEY];
    const btn = $('#btnStart');
    btn.querySelector('span').textContent = done ? 'เล่นรอบพิเศษ' : 'เริ่มภารกิจวันนี้';
    $('#btnAgain').classList.toggle('hidden', !done);
    $('#doneNote').classList.toggle('hidden', !done);
    if (done) $('#doneNote').innerHTML = art.icon('check') + '<span>วันนี้ ป.' + S.grade + ' ได้ ' + d.g[S.grade] + '/' + ROUNDS * 3 + ' ดาว แล้ว</span>';
  }

  /* ═════════ เริ่มรอบเล่น ═════════ */
  async function startRun(kind) {
    refreshToday(); audio.unlock();
    audio.set({ vol: S.vol, music: S.music, voice: S.voice });
    audio.musicStart();
    const grade = S.grade;
    const seed = kind === 'extra' ? 'X' + Date.now().toString(36) + Math.floor(Math.random() * 1e6) : 'D' + DKEY;
    run = DC.plan.newRun({ grade, seed, dayIndex: DIDX, recentT: S.recentT, seen: kind === 'repeat' ? [] : S.seen, rounds: ROUNDS });
    R = { kind, grade, seed, i: -1, stars: 0, rounds: [], token: (R ? R.token : 0) + 1, t0: Date.now(), mechSeen: {}, bobooIntro: false };
    show('scr-play'); $('#guide').classList.remove('hidden');
    buildTrack(); $('#hudStars').innerHTML = art.starShape(true) + '<b>0</b>';
    buildBlipHp();
    $('#stem').innerHTML = ''; $('#work').innerHTML = '';
    guide.set('cheer');
    nextRound();
  }

  function buildTrack() {
    const t = $('#track'); t.innerHTML = '';
    const rail = h('div', 'rail'); t.appendChild(rail);
    for (let i = 0; i < ROUNDS; i++) t.appendChild(h('i', 'stn' + (i === ROUNDS - 1 ? ' boss' : ''), i === ROUNDS - 1 ? art.icon('star') : ''));
    const rk = h('div', 'rk', art.rocket()); rk.id = 'rocket'; t.appendChild(rk);
    const pl = h('div', 'goal', art.planet(DIDX, { uid: 'g' })); t.appendChild(pl);
    moveRocket(-1);
  }
  function moveRocket(i) {
    const rk = $('#rocket'); if (!rk) return;
    const pct = (i + 0.5) / ROUNDS * 100;
    rk.style.left = Math.max(2, pct) + '%';
    $$('#track .stn').forEach((s, k) => { s.classList.toggle('done', k < i); s.classList.toggle('now', k === i); });
  }
  function buildBlipHp() {
    const hp = $('#blipHp'); hp.innerHTML = '';
    for (let i = 0; i < ROUNDS; i++) hp.appendChild(h('i', '', ''));
    $('#blipZone').classList.remove('in', 'out', 'big');
  }

  /* ═════════ ข้อ ═════════ */
  function nextRound() {
    const tok = R.token;
    R.i++;
    if (R.i >= ROUNDS) return finishRun();
    const p = run.next(R.i);
    cur = { p, i: R.i, wrongs: 0, hint: 0, solved: false, revealed: false, touched: false, rig: null, t0: Date.now(), mis: null, tok };
    moveRocket(R.i);
    renderProblem(p);
  }

  function renderProblem(p) {
    const stem = $('#stem'), work = $('#work');
    stem.innerHTML = ''; work.innerHTML = ''; stem.className = 'stem'; $('#aidBox').classList.add('hidden'); $('#aidBox').innerHTML = '';
    document.body.dataset.mech = p.mech;
    const head = p.text || askText(p);
    if (head) stem.appendChild(h('div', 'stem-text', esc(head)));
    if (p.expr) stem.appendChild(DC.scenes.expr(p.expr, p.tid.indexOf('pat.') === 0));
    if (p.scene && !['share', 'line', 'balance'].includes(p.scene.kind)) {
      const sc = DC.scenes.scene(p.scene, {});
      if (sc) { stem.appendChild(sc); cur.sceneEl = sc; }
    }
    const X = {
      touch: () => { audio.stopVoice(); cur.touched = true; guide.tok++; $('#guide').classList.remove('speaking'); },
      say: ids => audio.say(ids),
      explore: msg => guide.text(msg, 'think'),
      submit: (ok, meta) => (ok ? onSolved(meta || {}) : onWrong(meta || {}))
    };
    cur.rig = DC.rigs.build(p, X);
    work.appendChild(cur.rig.el);
    work.classList.remove('enter'); void work.offsetWidth; work.classList.add('enter');
    $('#btnHint').dataset.lv = 0; $('#btnHint').classList.remove('lv1', 'lv2', 'lv3');
    $('#roundNo').textContent = (cur.i + 1) + '/' + ROUNDS;
    stem.classList.toggle('final', !!p.final);
    audio.sfx('pop');
    intro(p);
  }

  async function intro(p) {
    const tok = cur.tok, c = cur;
    const ids = [];
    if (p.line && (!R.mechSeen[p.mech + p.ask] || !p.speak.length)) ids.push(p.line);
    R.mechSeen[p.mech + p.ask] = true;
    p.speak.forEach(x => ids.push(x));
    if (c.i === 0 && !p.final) ids.unshift('d_welcome');
    audio.preload(ids);
    { const rem = audio.remaining(); if (rem > 0) await wait(Math.min(rem + 80, 1900)); if (tok !== R.token || c !== cur) return; }
    if (p.final) { await Promise.race([guide.say(['d_final'], { mood: 'cheer' }), wait(2600)]); if (tok !== R.token || c !== cur) return; }
    if (!ids.length) { guide.text(askText(p) || p.text || '', 'happy'); }
    else await Promise.race([guide.say(ids, { text: p.line && !p.speak.length ? textOf([p.line]) : (askText(p) || humanAsk(p)), mood: 'talk' }), wait(4200)]);
    if (tok !== R.token || c !== cur) return;
    startMischief();
  }
  function askText(p) { if (p.ask === 'order' && p.order) return p.order.asc ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'; return ASK[p.ask] || ''; }
  function humanAsk(p) {
    if (p.ask === 'equals') return 'ฟังโจทย์ แล้วตอบนะ';
    if (p.ask === 'missing') return 'เลขที่หายไปคือเลขอะไร';
    if (p.ask === 'which') return p.expr && p.expr.includes('?') ? 'ใส่เครื่องหมายที่ถูกต้อง' : 'เลือกข้อที่ถูกต้อง';
    return '';
  }

  /* ═════════ บลิ๊บป่วน ═════════ */
  function misKind(p) {
    const r = new DC.Rng('mis:' + R.seed + ':' + cur.i);
    if (cur.i === 0) return null;
    if (p.final) return 'boss';
    if (!r.chance(0.58)) return null;
    const opts = [];
    if (p.mech === 'choice' && p.choices.length >= 3 && !p.choices.every(c => c.sym)) opts.push('whisper', 'whisper', 'shuffle');
    else if (p.mech === 'keypad') opts.push('whisper');
    opts.push('goo', 'goo');
    return r.pick(opts);
  }

  async function startMischief() {
    const p = cur.p, tok = cur.tok, c = cur;
    const kind = misKind(p);
    cur.mis = kind;
    if (!kind) return;
    const alive = () => tok === R.token && c === cur && !cur.solved;
    blip.arrive(kind === 'boss');
    if (!R.blipSeen) { R.blipSeen = true; await Promise.race([guide.say(['d_blip'], { mood: 'oops' }), wait(2200)]); if (!alive()) return; }
    else if (kind === 'boss') { await Promise.race([blip.speak([pickR(L.tIntro)], 'laugh'), wait(3000)]); if (!alive()) return; }
    const seq = kind === 'boss' ? ['goo', p.mech === 'choice' ? 'shuffle' : null, 'whisper'].filter(Boolean) : [kind];
    for (const k of seq) {
      if (!alive()) return;
      if (k === 'goo') await doGoo(alive);
      else if (k === 'whisper') await doWhisper(alive);
      else if (k === 'shuffle') await doShuffle(alive);
    }
  }
  async function doGoo(alive) {
    const stem = $('#stem'); if (!stem.firstChild) return;
    const ov = h('div', 'goo-ov'); stem.appendChild(ov);
    const tgt = stem.querySelector('.expr') || stem.querySelector('.stem-text') || stem;
    const box = tgt.getBoundingClientRect(), sb = stem.getBoundingClientRect();
    const n = 3; let left = n;
    for (let i = 0; i < n; i++) {
      const g = h('button', 'goo g' + i, '<svg viewBox="0 0 100 90" aria-hidden="true"><path d="M14 52 Q2 28 26 20 Q34 2 56 10 Q80 0 88 26 Q104 46 82 62 Q86 84 58 80 Q40 92 26 76 Q4 76 14 52Z" fill="#7be86b" stroke="#2b1f5c" stroke-width="4"/><circle cx="38" cy="38" r="6" fill="#fff"/><circle cx="62" cy="38" r="6" fill="#fff"/><circle cx="40" cy="40" r="3" fill="#2b1f5c"/><circle cx="64" cy="40" r="3" fill="#2b1f5c"/><path d="M40 58 Q50 66 60 58" fill="none" stroke="#2b1f5c" stroke-width="3.5" stroke-linecap="round"/></svg>');
      g.type = 'button';
      const w = Math.max(70, Math.min(120, box.width / (n - 0.4)));
      g.style.width = w + 'px';
      g.style.left = (box.left - sb.left + (box.width - w) * (i / (n - 1 || 1))) + 'px';
      g.style.top = (box.top - sb.top + (box.height - w * 0.9) / 2 + (i % 2 ? 8 : -8)) + 'px';
      g.addEventListener('click', () => {
        if (g.classList.contains('pop')) return; g.classList.add('pop'); audio.sfx('wipe'); sparkle(g, 8); puff(g);
        setTimeout(() => g.remove(), 260); left--;
        if (left === 0) { ov.classList.add('clear'); setTimeout(() => ov.remove(), 400); blip.set('shock'); blip.say('อุ๊ย!', 1200); audio.sfx('pop'); }
      });
      ov.appendChild(g);
    }
    audio.sfx('splat'); blip.set('laugh');
    if ((R.gooSaid = (R.gooSaid || 0) + 1) <= 2) await Promise.race([guide.say(['d_goo'], { mood: 'oops' }), wait(2800)]);
    else guide.text('แตะเช็ดเมือกออกให้หมดนะ', 'oops');
  }
  async function doWhisper(alive) {
    const p = cur.p;
    if (p.mech === 'choice') {
      const b = cur.rig.bait && cur.rig.bait();
      if (!b) return;
      if ((R.whiSaid = (R.whiSaid || 0) + 1) <= 2) {
        await Promise.race([blip.speak([pickR(L.tWrong)], 'sneaky'), wait(3200)]);
        if (!alive()) return;
        await Promise.race([guide.say(['d_whisper'], { mood: 'think' }), wait(2200)]);
      } else { blip.set('sneaky'); blip.say('ข้อนี้ต้องเลือกอันนี้แน่ ๆ!', 2400); guide.text('อย่าเพิ่งเชื่อบลิ๊บนะ คิดเองก่อน!', 'think'); }
    } else if (p.mech === 'keypad') {
      const a = +p.answer; const w = Math.max(0, Math.round(a + (Math.random() < 0.5 ? -1 : 1) * Math.max(1, Math.round(Math.abs(a) * 0.1 + 1))));
      blip.say('ข้าว่าคำตอบคือ ' + DC.core.fm(w) + '!', 3200);
      if ((R.whiSaid = (R.whiSaid || 0) + 1) <= 2) {
        await Promise.race([blip.speak([pickR(L.tWrong)], 'sneaky', 'ข้าว่าคำตอบคือ ' + DC.core.fm(w) + '!'), wait(3200)]);
        if (!alive()) return;
        await Promise.race([guide.say(['d_whisper'], { mood: 'think' }), wait(2200)]);
      } else guide.text('อย่าเพิ่งเชื่อบลิ๊บนะ คิดเองก่อน!', 'think');
    }
  }
  async function doShuffle(alive) {
    if (!cur.rig.shuffleNow) return;
    await wait(500); if (!alive()) return;
    blip.set('laugh'); cur.rig.shuffleNow();
    if ((R.shufSaid = (R.shufSaid || 0) + 1) <= 2) await Promise.race([guide.say(['d_shuffle'], { mood: 'oops' }), wait(2400)]);
    else guide.text('ตัวเลือกวิ่งไปมา ตามให้ทันนะ!', 'oops');
  }

  /* ═════════ ผลการตอบ ═════════ */
  function starsFor(c) {
    if (c.revealed) return 1;
    let s = 3;
    if (c.wrongs > 0 || c.hint > 0) s = 2;
    if (c.wrongs >= 3 || (c.hint >= 2 && c.wrongs > 0) || c.hint >= 3) s = 1;
    return s;
  }

  async function onWrong(meta) {
    if (cur.solved) return;
    cur.wrongs++;
    audio.sfx('wrong'); if (meta.el) shake(meta.el);
    const tok = cur.tok, c = cur;
    blip.set(meta.baited ? 'laugh' : 'sneaky');
    guide.react('oops');
    const alive = () => tok === R.token && c === cur && !cur.solved;
    if (meta.baited) { blip.say('ฮิฮิ โดนหลอกแล้ว!', 2000); audio.say([pickR(['trickster/gotcha', 'trickster/laugh'])]); await wait(900); if (!alive()) return; }
    const line = pickR(L.oops);
    if (cur.wrongs >= 4 && !cur.revealed) { await guide.say([line], { mood: 'oops' }); if (alive()) await doHint(3); return; }
    await guide.say([line], { text: textOf([line]), mood: 'oops', after: 'think' });
    if (!alive()) return;
    if (cur.wrongs === 2 && cur.hint < 1) await doHint(1);
  }

  async function onSolved(meta) {
    if (cur.solved) return;
    cur.solved = true;
    const tok = cur.tok, c = cur;
    try { cur.rig.lock(true); } catch (e) { /* ปล่อยผ่าน */ }
    const stars = starsFor(cur);
    cur.stars = stars; R.stars += stars; R.rounds.push({ tid: cur.p.tid, exp: cur.p.exp, wrongs: cur.wrongs, hint: cur.hint, stars, revealed: cur.revealed, mech: cur.p.mech });
    run.report({ clean: cur.wrongs === 0 && cur.hint === 0 });
    audio.stopVoice();
    audio.sfx(stars === 3 ? 'good' : 'coin');
    const el = meta.el || $('#work');
    sparkle(el, stars === 3 ? 22 : 12); if (stars === 3) puff(el);
    floatText(el, stars === 3 ? '+3 ดาว' : '+' + stars + ' ดาว', 'good');
    for (let k = 0; k < stars; k++) setTimeout(() => { audio.sfx('star'); flyStar(el, $('#hudStars'), () => { const sb = $('#hudStars b'); if (sb) { sb.textContent = R.stars; boing($('#hudStars')); } }); }, 160 + k * 170);
    guide.react(stars === 3 ? 'cheer' : 'happy');
    // บลิ๊บเสียพลัง
    const pips = $$('#blipHp i'); if (pips[cur.i]) pips[cur.i].classList.add('off');
    if (!cur.p.final && cur.mis) { blip.set('shock'); blip.say('โอ๊ย!', 1400); setTimeout(() => blip.leave(), 1100); }
    $('#aidBox').classList.add('hidden');
    // แสดงเฉลยสั้น ๆ เมื่อใช้ตัวช่วย
    if (cur.revealed || cur.wrongs >= 3) toast(cur.p.exp || '');
    const line = cur.revealed ? null : pickR(L.praise);
    if (R.i < ROUNDS - 1) {
      const sp = line ? guide.say([line], { text: textOf([line]), mood: 'cheer', after: 'happy' }) : guide.say([], { text: cur.p.exp, hold: 1300, mood: 'think' });
      await wait(FAST ? 50 : 900);
      if (tok !== R.token || c !== cur) return;
      nextRound();
    } else {
      await finishBoss(line);
    }
  }

  async function finishBoss(line) {
    const tok = R.token;
    blip.arrive(true); blip.set('shock'); $('#blipZone').classList.add('hit');
    audio.sfx('lose'); confetti(50);
    guide.text('ชนะบลิ๊บแล้ว!', 'cheer');
    await Promise.race([blip.speak(['trickster/lose'], 'sad', 'ยอมแล้ว ๆ ข้าแพ้แล้ว'), wait(3200)]);
    if (tok !== R.token) return;
    finishRun();
  }

  /* ═════════ คำใบ้ ═════════ */
  async function doHint(lv) {
    if (!cur || cur.solved) return;
    lv = Math.min(3, Math.max(lv || cur.hint + 1, cur.hint + 1));
    if (lv < cur.hint) return;
    cur.hint = lv; const tok = cur.tok, c = cur;
    const b = $('#btnHint'); b.classList.remove('lv1', 'lv2', 'lv3'); b.classList.add('lv' + lv); b.dataset.lv = lv;
    audio.stopVoice(); audio.sfx('pop');
    const p = cur.p;
    const steps = DC.scenes.steps(p.aid);
    if (lv === 1) {
      if (cur.sceneEl && cur.sceneEl.autoCount) cur.sceneEl.autoCount();
      const txt = steps[0] ? 'ลองคิดแบบนี้: ' + steps[0] : (p.ask === 'count' ? 'แตะนับทีละชิ้นนะ' : 'ค่อย ๆ คิดนะ ลองดูโจทย์อีกที');
      const l = pickR(L.hint);
      await guide.say([l], { text: txt, mood: 'think' });
    } else if (lv === 2) {
      showAid(p, steps.map((s, i) => (i === steps.length - 1 && steps.length > 0 ? s.replace(/=s*[^=→]+$/, '= ?') : s)));
      try { await cur.rig.hint(2); } catch (e) { /* ไม่เป็นไร */ }
      if (c !== cur) return;
      await guide.say(['guide_m/hint1'], { text: steps.length ? 'ลองต่อจากตรงนี้นะ' : 'ดูตรงที่เรืองแสง', mood: 'think' });
    } else {
      cur.revealed = true;
      showAid(p, steps, true);
      guide.say([], { text: 'เฉลย: ' + (p.exp || ''), mood: 'think', hold: 100 });
      let el = null;
      try { el = await cur.rig.reveal(); } catch (e) { /* ปล่อยผ่าน */ }
      if (c !== cur || cur.solved) return;
      onSolved({ el: el && el.nodeType ? el : $('#work'), revealed: true });
    }
  }
  function showAid(p, steps, full) {
    const box = $('#aidBox'); box.innerHTML = '';
    const list = steps.slice();
    if (full && p.exp) list.push(p.exp);
    if (p.aid && p.aid.type === 'mul' && Number.isInteger(p.aid.a) && Number.isInteger(p.aid.b) && p.aid.a <= 10 && p.aid.b <= 10 && !(p.scene && p.scene.kind === 'array')) {
      box.appendChild(DC.scenes.scene({ kind: 'array', icon: 'star', rows: Math.min(p.aid.a, p.aid.b), cols: Math.max(p.aid.a, p.aid.b) }));
    }
    list.forEach(s => box.appendChild(h('div', 'aid-line', esc(s))));
    box.classList.toggle('hidden', !box.childNodes.length);
  }

  /* ═════════ จบรอบ ═════════ */
  const RANKS = [[22, 'จอมคณิตอวกาศ'], [18, 'นักบินยอดเยี่ยม'], [12, 'นักบินฝีมือดี'], [0, 'นักบินน้องใหม่']];
  function finishRun() {
    const tok = R.token;
    audio.stopVoice(); $('#guide').classList.add('hidden'); blip.leave();
    const max = ROUNDS * 3, got = R.stars;
    // บันทึก
    (R.rounds.length ? R.rounds : []).forEach(r => { S.recentT[r.tid] = DIDX; });
    if (R.kind !== 'repeat') { S.seen = S.seen.concat(run.sigs || []).slice(-800); }
    Object.keys(S.recentT).forEach(k => { if (DIDX - S.recentT[k] > 40) delete S.recentT[k]; });
    if (R.kind === 'daily' && !dailyDone(R.grade)) {
      const d = S.days[DKEY] || { g: {} }; d.g = d.g || {}; d.g[R.grade] = got; d.best = Math.max(d.best || 0, got); d.max = max; S.days[DKEY] = d;
    } else if (R.kind === 'extra') S.extra = (S.extra || 0) + 1;
    store.save();
    const lines = RANKS.find(r => got >= r[0]);
    const pn = art.planetName(DIDX);
    const fin = $('#finalBody'); fin.innerHTML = '';
    fin.appendChild(h('div', 'fin-planet', art.planet(DIDX, { uid: 'f' }) + '<div class="ship">' + art.rocket() + '</div>'));
    fin.appendChild(h('div', 'fin-kick', 'ถึงแล้ว!'));
    fin.appendChild(h('h2', 'fin-title', pn));
    fin.appendChild(h('div', 'fin-rank', '<span>' + lines[1] + '</span>'));
    const row = h('div', 'fin-stars'); R.rounds.forEach((r, k) => { const c = h('div', 'rs s' + r.stars, '<span>' + (k + 1) + '</span>' + art.starShape(true).repeat(1)); c.title = r.exp || ''; row.appendChild(c); });
    fin.appendChild(row);
    fin.appendChild(h('div', 'fin-score', '<b>' + got + '</b><small>/' + max + ' ดาว</small>'));
    const st = streakOf();
    fin.appendChild(h('div', 'fin-streak' + (R.kind === 'daily' ? '' : ' x'), R.kind === 'daily' ? art.icon('flame') + '<span>เล่นติดกัน ' + st + ' วัน</span>' : art.icon('rocket') + '<span>รอบพิเศษ ไม่นับในสมุดสะสม</span>'));
    if (S.teacher) fin.appendChild(teacherTable());
    const bt = h('div', 'fin-btns');
    const b1 = h('button', 'btn btn-go', art.icon('rocket') + '<span>เล่นรอบพิเศษ</span>'); b1.type = 'button'; b1.addEventListener('click', () => startRun('extra'));
    const b2 = h('button', 'btn btn-soft', art.icon('book') + '<span>สมุดสะสมดาว</span>'); b2.type = 'button'; b2.addEventListener('click', () => openCalendar('scr-final'));
    const b3 = h('button', 'btn btn-soft', art.icon('home') + '<span>หน้าแรก</span>'); b3.type = 'button'; b3.addEventListener('click', goHome);
    bt.appendChild(b1); bt.appendChild(b2); bt.appendChild(b3); fin.appendChild(bt);
    show('scr-final'); audio.sfx('fanfare'); confetti(120);
    setTimeout(async () => { if (tok !== R.token) return; await guide2(['d_win']); if (R.kind === 'daily') await guide2(['d_tomorrow']); }, 700);
  }
  async function guide2(ids) { try { await audio.say(ids); } catch (e) { /* เงียบ */ } }
  function teacherTable() {
    const t = h('div', 'teacher');
    t.innerHTML = '<h4>รายงานครู</h4>' + R.rounds.map((r, i) => '<div class="tr"><b>' + (i + 1) + '</b><span>' + esc(r.exp) + '</span><em>' + (r.revealed ? 'ดูเฉลย' : r.wrongs === 0 && r.hint === 0 ? 'ตอบถูกครั้งแรก' : 'ตอบผิด ' + r.wrongs + ' ใช้คำใบ้ ' + r.hint) + '</em></div>').join('');
    return t;
  }

  function goHome() { if (R) R.token++; audio.stopVoice(); audio.musicStop(); $('#guide').classList.add('hidden'); blip.leave(); renderTitle(); show('scr-title'); }

  /* ═════════ สมุดสะสมดาว (ปฏิทิน) ═════════ */
  let calY, calM, calFrom = 'scr-title';
  function openCalendar(from) {
    calFrom = from || 'scr-title'; refreshToday(); calY = TODAY.getFullYear(); calM = TODAY.getMonth(); renderCalendar(); show('scr-cal');
  }
  function renderCalendar() {
    const first = new Date(calY, calM, 1), days = new Date(calY, calM + 1, 0).getDate(), lead = first.getDay();
    $('#calTitle').textContent = TH_MON[calM] + ' ' + (calY + 543);
    const grid = $('#calGrid'); grid.innerHTML = '';
    for (let i = 0; i < lead; i++) grid.appendChild(h('div', 'cd empty'));
    let played = 0;
    for (let d = 1; d <= days; d++) {
      const dt = new Date(calY, calM, d), key = DC.dayKey(dt), rec = S.days[key];
      const isToday = key === DKEY, future = dt > TODAY && !isToday;
      const c = h('div', 'cd' + (rec ? ' has' : '') + (isToday ? ' today' : '') + (future ? ' future' : ''));
      c.innerHTML = '<em>' + d + '</em>' + (rec ? '<div class="pl">' + art.planet(DC.dayIndex(dt), { uid: 'c' + d }) + '</div><div class="ss">' + rec.best + '/' + (rec.max || 24) + '</div>' : (future ? '' : '<div class="ghost"></div>'));
      if (rec) played++;
      grid.appendChild(c);
    }
    $('#calStats').innerHTML = '<div><b>' + streakOf() + '</b><small>วันติด</small></div><div><b>' + bestStreak() + '</b><small>ติดกันนานสุด</small></div><div><b>' + Object.keys(S.days).length + '</b><small>วันที่ทำภารกิจ</small></div>';
    $('#calNext').disabled = (calY === TODAY.getFullYear() && calM >= TODAY.getMonth());
  }

  /* ═════════ ตั้งค่า ═════════ */
  function openSettings() { $('#setVol').value = Math.round(S.vol * 100); $('#setMusic').checked = S.music; $('#setVoice').checked = S.voice; $('#setTeacher').checked = S.teacher; $('#ovSettings').classList.remove('hidden'); }
  function applyAudio() { audio.set({ vol: S.vol, music: S.music, voice: S.voice }); }

  /* ═════════ ติดตั้งปุ่ม ═════════ */
  function wire() {
    $$('[data-icon]').forEach(b => { if (!b.dataset.done) { b.insertAdjacentHTML('afterbegin', art.icon(b.dataset.icon)); b.dataset.done = 1; } });
    const gr = $('#gradeRow');
    for (let g = 1; g <= 6; g++) { const b = h('button', 'gchip', '<small>ป.</small><b>' + g + '</b>'); b.type = 'button'; b.dataset.g = g; b.addEventListener('click', () => { S.grade = g; store.save(); audio.unlock(); audio.sfx('pop'); renderTitle(); boing(b); }); gr.appendChild(b); }
    $('#btnStart').addEventListener('click', () => { if (!document.body.classList.contains('authed')) return; startRun(dailyDone(S.grade) ? 'extra' : 'daily'); });
    $('#btnAgain').addEventListener('click', () => { if (!document.body.classList.contains('authed')) return; startRun('repeat'); });
    $('#btnCal').addEventListener('click', () => { audio.unlock(); openCalendar('scr-title'); });
    $('#btnCalBack').addEventListener('click', () => { renderTitle(); show(calFrom === 'scr-final' ? 'scr-final' : 'scr-title'); });
    $('#calPrev').addEventListener('click', () => { calM--; if (calM < 0) { calM = 11; calY--; } renderCalendar(); });
    $('#calNext').addEventListener('click', () => { calM++; if (calM > 11) { calM = 0; calY++; } renderCalendar(); });
    $('#btnPlayHome').addEventListener('click', () => { confirmBox('ออกจากภารกิจกลางทางไหม?', goHome); });
    $('#btnHint').addEventListener('click', () => { audio.unlock(); doHint(); });
    $$('.btn-settings').forEach(b => b.addEventListener('click', () => { audio.unlock(); openSettings(); }));
    $('#setClose').addEventListener('click', () => { $('#ovSettings').classList.add('hidden'); });
    $('#setVol').addEventListener('input', e => { S.vol = e.target.value / 100; applyAudio(); store.save(); });
    $('#setMusic').addEventListener('change', e => { S.music = e.target.checked; applyAudio(); if (S.music && document.body.dataset.screen === 'scr-play') audio.musicStart(); store.save(); });
    $('#setVoice').addEventListener('change', e => { S.voice = e.target.checked; applyAudio(); store.save(); });
    $('#setTeacher').addEventListener('change', e => { S.teacher = e.target.checked; store.save(); });
    $('#setReset').addEventListener('click', () => confirmBox('ลบความก้าวหน้าและสมุดสะสมทั้งหมดไหม?', () => { store.reset(); Object.assign(S, store.load()); $('#ovSettings').classList.add('hidden'); renderTitle(); }));
    $('#gSpeak').addEventListener('click', () => { audio.unlock(); if (guide.last && guide.last.ids && guide.last.ids.length) guide.say(guide.last.ids, guide.last.o); else if (cur) intro(cur.p); });
    $('#cfNo').addEventListener('click', () => $('#ovConfirm').classList.add('hidden'));
    $('#cfYes').addEventListener('click', () => { $('#ovConfirm').classList.add('hidden'); if (confirmCb) confirmCb(); });
    document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
    $('#blipChar').addEventListener('click', () => { if (!blip.big) return; blip.set('laugh'); audio.sfx('ufo'); });
  }
  let confirmCb = null;
  function confirmBox(text, cb) { confirmCb = cb; $('#cfText').textContent = text; $('#ovConfirm').classList.remove('hidden'); }

  /* โหลดคลิปเสียงทั้งหมดล่วงหน้า (ประมาณ 2.5 MB) เรียงตามความสำคัญ จะได้ไม่ต้องรอตอนเล่น */
  function warmVoices() {
    if (DC.fast) return;
    const own = Object.keys(VOICED);
    const core = own.filter(k => /^(n|op_|q_|a_)/.test(k)).concat(['d_welcome', 'd_win', 'd_tomorrow']);
    const rest = own.filter(k => core.indexOf(k) < 0);
    audio.warm(core.concat(L.praise, L.oops, L.hint, rest, L.tIntro, L.tWrong, L.tHit, L.tWin, ['trickster/lose', 'trickster/sorry', 'trickster/gotcha']));
  }

  /* ═════════ เริ่มต้น ═════════ */
  function boot() {
    wire();
    $('#gChar').innerHTML = art.bobo('happy');
    $('#blipChar').innerHTML = art.blip('sneaky');
    $('#gSpeak').innerHTML = art.icon('speaker');
    $('#userBadge').classList.add('hidden');
    applyAudio();
    renderTitle();
    show('scr-title');
    warmVoices();
    setTimeout(() => { const l = $('#loading'); if (l) { l.classList.add('gone'); setTimeout(() => l.remove(), 600); } }, 250);
    if (DEV) {
      root.BB = {
        state: () => ({ R, cur, run, S }),
        solve() { const p = cur.p; if (p.mech === 'choice') { const i = p.choices.findIndex(c => c.ok); cur.rig.btns[i].click(); } else if (p.mech === 'keypad') { String(p.answer).split('').forEach(ch => { const b = $$('.kk').find(x => x.textContent === ch); b && b.click(); }); $('.kok').click(); } else doHint(3); },
        force(tid, i) { const t = DC.T.find(x => x.id === tid); if (!R) { R = { kind: 'extra', grade: S.grade, seed: 'dev', i: 0, stars: 0, rounds: [], token: 1, mechSeen: {}, t0: Date.now() }; run = DC.plan.newRun({ grade: S.grade, seed: 'dev', dayIndex: DIDX, recentT: {}, seen: [], rounds: ROUNDS }); show('scr-play'); $('#guide').classList.remove('hidden'); buildTrack(); buildBlipHp(); } R.i = i == null ? 2 : i; const p = t.gen(new DC.Rng('force' + Math.random())); p.final = R.i === ROUNDS - 1; p.round = R.i; cur = { p, i: R.i, wrongs: 0, hint: 0, solved: false, revealed: false, touched: false, rig: null, t0: Date.now(), mis: null, tok: R.token }; moveRocket(R.i); renderProblem(p); return p; },
        start: k => startRun(k || 'daily'), hint: () => doHint(), go: (id) => show(id), cal: () => openCalendar(), fin: () => { R = R || { rounds: [], stars: 0, kind: 'extra', token: 1, i: 0, seed: 'x' }; finishRun(); }
      };
    }
  }
  /* เก็บ signature ของข้อที่ออกในรอบนี้ เพื่อกันซ้ำข้ามวัน */
  const _next = DC.plan.newRun;
  DC.plan.newRun = function (o) { const r = _next(o); const _n = r.next; r.sigs = []; r.next = function (i) { const p = _n.call(r, i); r.sigs.push(p.sig); return p; }; return r; };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
