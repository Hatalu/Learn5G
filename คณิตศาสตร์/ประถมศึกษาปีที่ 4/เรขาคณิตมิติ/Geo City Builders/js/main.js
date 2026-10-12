/* ═══════════════════════════════════════════════════════════
   GEO CITY BUILDERS — ลำดับเกมหลัก
   หน้าแรก → เปิดเรื่อง → แผนที่เมือง → ย่าน (ภารกิจ) → สรุปย่าน → ด่านลบลบ → ตอนจบ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const GB = window.GB;
  const { art, audio, ui, ENG, ZONES } = GB;
  const { $, h, esc, wait, guide } = ui;

  /* ── บันทึก: เปิดเว็บใหม่ = เริ่มใหม่ (เครื่องในโรงเรียนใช้ร่วมกัน) จำไว้เฉพาะการตั้งค่า ── */
  const KEY = 'geoCityBuilders.v1';
  const freshSettings = () => ({ vol: 0.8, music: true, voice: true, teacher: false });
  let S = { seenIntro: false, zones: {}, settings: freshSettings() };
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.settings) S.settings = Object.assign(freshSettings(), o.settings); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ settings: S.settings })); } catch (e) {} };

  function applySettings() {
    document.body.classList.toggle('dev', dev);
    audio.setVolume(S.settings.vol);
    audio.setMusic(S.settings.music);
    audio.setVoice(S.settings.voice);
    document.body.classList.toggle('teacher', !!S.settings.teacher);
  }
  /* ── โหมดนักพัฒนา: ใส่รหัสในหน้าตั้งค่าเพื่อเข้าทุกย่านได้ (ผู้เล่นทั่วไปยังต้องผ่านตามลำดับ) ── */
  const DEV_KEY = 'geoCityBuilders.dev';
  const DEV_HASH = '2bimdt';
  const devHash = s => { let x = 5381; for (const ch of s) x = ((x * 33) ^ ch.charCodeAt(0)) >>> 0; return x.toString(36); };
  let dev = false;
  try { dev = localStorage.getItem(DEV_KEY) === DEV_HASH; } catch (e) {}
  const unlocked = id => id === 1 || dev || !!S.zones[id - 1];
  /* ย่านแรกที่ยังไม่ผ่าน ซึ่งขวางย่าน id อยู่ */
  const blocker = id => ZONES.find(z => z.id < id && !S.zones[z.id]);
  const rand = a => a[Math.floor(Math.random() * a.length)];

  /* ══════════ HUD / ปุ่มทั่วไป ══════════ */
  function decorate() {
    document.querySelectorAll('[data-icon]').forEach(b => { b.insertAdjacentHTML('afterbegin', art.icon(b.dataset.icon)); });
    document.querySelectorAll('.btn-settings').forEach(b => b.addEventListener('click', openSettings));
    document.querySelectorAll('.btn-book').forEach(b => b.addEventListener('click', () => openBook()));
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest('button');
      if (b && !b.disabled) { audio.unlock(); if (!b.classList.contains('silent')) audio.sfx('click'); }
    });
  }

  /* ══════════ หน้าแรก ══════════ */
  function initTitle() {
    $('#titlePing').innerHTML = art.ping('cheer');
    $('#titleLob').innerHTML = art.lob('sneaky');
    const sky = $('#titleCity');
    sky.innerHTML = '<svg viewBox="0 0 800 160" preserveAspectRatio="xMidYMax meet">' +
      ['plaza', 'sign', 'tower', 'park', 'factory', 'yard', 'gate'].map((k, i) => '<g transform="translate(' + (60 + i * 113) + ' 110) scale(1.35)" class="erased e' + i + '">' + art.building(k) + '</g>').join('') + '</svg>';
    $('#btnStart').addEventListener('click', () => {
      if (!document.body.classList.contains('authed')) { $('#ovLogin').classList.remove('hidden'); return; }
      audio.unlock();
      if (!S.seenIntro) story(); else goMap();
    });
    audio.music('title');
  }

  /* ══════════ เปิดเรื่อง ══════════ */
  async function story() {
    S.seenIntro = true;
    const ov = $('#ovStory');
    ov.classList.remove('hidden');
    $('#stPing').innerHTML = art.ping('happy');
    $('#stLob').innerHTML = art.lob('sneaky');
    $('#stLob').classList.add('hide');
    $('#stCity').innerHTML = $('#titleCity').innerHTML;
    $('#stCity').classList.remove('erasing');
    guide.show(true);
    audio.music('map');
    const skip = $('#stSkip');
    let skipped = false;
    skip.onclick = () => { skipped = true; guide.hush(); finish(); };
    const step = async (id, fn) => { if (skipped) return; if (fn) fn(); await guide.say(id); if (!skipped) await wait(300); };
    await step('intro1', () => { ui.bounce($('#stPing')); });
    await step('intro2', () => { $('#stPing').innerHTML = art.ping('oops'); $('#stCity').classList.add('erasing'); audio.sfx('erase'); });
    await step('lobIntro', () => { $('#stLob').classList.remove('hide'); ui.puff($('#stLob')); audio.sfx('sneaky'); });
    await step('intro3', () => { $('#stPing').innerHTML = art.ping('cheer'); $('#stLob').classList.add('run'); audio.sfx('whoosh'); });
    finish();
    function finish() {
      if (ov.classList.contains('hidden')) return;
      ov.classList.add('hidden');
      $('#stLob').classList.remove('run');
      goMap();
    }
  }

  /* ══════════ แผนที่เมือง ══════════ */
  const POS = {
    land: [[110, 470], [270, 330], [430, 450], [560, 270], [720, 420], [850, 250], [900, 90]],
    port: [[150, 1080], [420, 950], [190, 810], [430, 660], [180, 510], [420, 360], [300, 170]]
  };
  function goMap() {
    run = null;
    guide.hush();
    ui.show('scr-map');
    guide.show(true);
    audio.music('map');
    paintMap();
    const next = ZONES.find(z => !S.zones[z.id]);
    setTimeout(() => {
      if (!next) guide.say('mapDone');
      else if (next.id === 1) guide.say('mapStart');
      else guide.say('mapStart');
    }, 350);
  }
  function paintMap() {
    const port = innerHeight > innerWidth * 1.1;
    const P = port ? POS.port : POS.land;
    const W = port ? 600 : 1000, H = port ? 1200 : 600;
    let road = 'M' + P[0][0] + ' ' + P[0][1];
    for (let i = 1; i < P.length; i++) {
      const [x0, y0] = P[i - 1], [x1, y1] = P[i];
      road += ' C' + (x0 + (x1 - x0) * 0.5) + ' ' + y0 + ' ' + (x0 + (x1 - x0) * 0.5) + ' ' + y1 + ' ' + x1 + ' ' + y1;
    }
    let s = '<svg class="map-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">';
    s += '<path d="' + road + '" class="road-bed"/><path d="' + road + '" class="road-line"/>';
    ZONES.forEach((z, i) => {
      const [x, y] = P[i];
      const st = S.zones[z.id];
      const open = unlocked(z.id);
      const cls = st ? 'restored' : open ? 'open' : 'locked';
      s += '<g class="node ' + cls + (z.boss ? ' boss' : '') + '" data-id="' + z.id + '" transform="translate(' + x + ' ' + y + ')" tabindex="0" role="button" aria-label="' + esc(z.name) + '">' +
        '<ellipse cx="0" cy="30" rx="70" ry="20" class="pad"/>' +
        '<g class="bwrap" transform="scale(1.45)">' + art.building(z.bld) + '</g>' +
        '<g class="tagg" transform="translate(0 66)"><rect x="-82" y="-17" width="164" height="34" rx="17" class="tag"/><text y="7" text-anchor="middle" class="tag-t">' + z.id + '. ' + esc(z.name.replace(' (ด่านลบลบ)', '')) + '</text></g>';
      if (st) s += '<g transform="translate(0 -70)">' + [0, 1, 2].map(k => '<g transform="translate(' + (k - 1) * 30 + ' 0) scale(1.15)"><path d="M0 -11l3.2 6.6 7.2.9-5.3 5 1.3 7.1L0 15.2l-6.4 3.4 1.3-7.1-5.3-5 7.2-.9z" class="mstar ' + (k < st.stars ? 'on' : '') + '"/></g>').join('') + '</g>';
      if (!open) s += '<g class="lock" transform="translate(0 -6)"><circle r="22"/><g transform="translate(-12 -12)">' + art.icon('lock').replace('class="ic ', 'width="24" height="24" class="ic ') + '</g></g>';
      if (open && !st) s += '<g class="here" transform="translate(0 -78)"><path d="M0 18 L-14 -2 A17 17 0 1 1 14 -2 Z"/><circle cy="-8" r="6"/></g>';
      s += '</g>';
    });
    s += '</svg>';
    const m = $('#map');
    m.innerHTML = s;
    m.querySelectorAll('.node').forEach(n => {
      const go = () => {
        const id = +n.dataset.id;
        if (!unlocked(id)) {
          ui.shake(n); audio.sfx('nope');
          const bz = blocker(id);
          guide.say(bz ? { id: 'mapLock', text: 'ต้องเล่นย่าน ' + bz.id + ' ' + bz.name.replace(' (ด่านลบลบ)', '') + ' ให้ผ่านก่อนนะ' } : 'mapLock');
          return;
        }
        audio.sfx('whoosh');
        startZone(ZONES[id - 1]);
      };
      n.addEventListener('click', go);
      n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
    });
    const tot = Object.values(S.zones).reduce((a, z) => a + z.stars, 0);
    $('#mapStars').innerHTML = art.star(true) + '<b>' + tot + '</b><small>/' + ZONES.length * 3 + '</small>';
    if (justRestored) {
      const n = m.querySelector('.node[data-id="' + justRestored + '"]');
      if (n) { n.classList.add('just'); setTimeout(() => { ui.sparkle(n, 26); audio.sfx('sparkle'); }, 300); }
      justRestored = null;
    }
  }
  let justRestored = null;
  window.addEventListener('resize', () => { if ($('#scr-map').classList.contains('active')) paintMap(); });

  /* ══════════ เล่นย่าน ══════════ */
  let run = null;
  async function startZone(z) {
    run = { z, list: z.tasks.slice(), i: 0, res: [], effort: 0, bonusDone: false, hp: z.boss ? z.tasks.length : 0, tok: {} };
    ui.show('scr-play');
    guide.show(true);
    audio.music(z.music);
    $('#hudZone').innerHTML = '<b>ย่าน ' + z.id + '</b><small>' + esc(z.name) + '</small>';
    $('#bossBar').classList.toggle('hidden', !z.boss);
    if (z.boss) { $('#bossFace').innerHTML = art.lob('sneaky'); paintHP(); }
    paintScore();
    /* ป้ายเปิดย่าน */
    const ban = $('#zoneBanner');
    ban.innerHTML = '<div class="zb-card"><div class="zb-bld"><svg viewBox="-60 -60 120 100">' + art.building(z.bld) + '</svg></div><small>ย่านที่ ' + z.id + '</small><h2>' + esc(z.name) + '</h2><p>' + esc(z.learn) + '</p></div>';
    ban.classList.remove('hidden'); ban.classList.add('in');
    $('#work').innerHTML = '';
    audio.sfx('unlock');
    const tok = run.tok;
    await guide.say(z.voice);
    if (run && run.tok === tok) {
      await wait(250);
      ban.classList.add('hidden'); ban.classList.remove('in');
      runTask();
    }
  }
  function paintScore() {
    if (!run) return;
    const pts = run.res.reduce((a, r) => a + r.score, 0);
    $('#hudScore').innerHTML = art.star(true) + '<b>' + pts + '</b>';
    const n = run.list.length;
    $('#hudProg').innerHTML = run.list.map((t, i) => '<i class="pd' + (i < run.i ? ' done' : i === run.i ? ' now' : '') + (t.tag === 'ท้าทาย' ? ' bonus' : '') + '"></i>').join('');
    void n;
  }
  function paintHP() {
    $('#bossHP').innerHTML = '<i style="width:' + (run.hp / run.z.tasks.length * 100) + '%"></i>';
  }

  function runTask() {
    const T = run.list[run.i];
    const tok = {};
    run.cur = { T, tok, misses: 0, level: 0, hintFn: null, done: false };
    const cur = run.cur;
    paintScore();
    $('#taskTag').textContent = T.tag;
    $('#taskTitle').textContent = T.title;
    $('#btnHint').classList.remove('used');
    clearActions();
    const work = $('#work');
    work.innerHTML = '';
    work.className = 'work type-' + T.type;
    const stage = h('div', 'stage'), panel = h('div', 'panel');
    work.append(stage, panel);
    const c = {
      stage, panel, T,
      alive: () => run && run.cur === cur && !cur.done,
      say: x => guide.say(x),
      seq: ids => guide.seq(ids),
      onHint: fn => { cur.hintFn = fn; },
      win: (okId, at) => win(cur, okId, at),
      miss: (text, at) => miss(cur, text, at)
    };
    try { ENG[T.type](T, c); } catch (err) { console.error(err); }
    work.classList.add('enter');
  }

  function clearActions() { $('#gActions').innerHTML = ''; }
  function action(label, icon, cls, fn) {
    const b = h('button', 'btn ' + (cls || 'btn-go'), (icon ? art.icon(icon) : '') + '<span>' + label + '</span>');
    b.type = 'button';
    b.addEventListener('click', () => { clearActions(); fn(); });
    $('#gActions').appendChild(b);
    ui.bounce(b);
    return b;
  }

  async function win(cur, okId, at) {
    if (!run || run.cur !== cur || cur.done) return;
    cur.done = true;
    const score = cur.misses === 0 ? 3 : cur.misses === 1 ? 2 : 1;
    const final = cur.level >= 3 ? Math.min(score, 2) : score;
    if (cur.misses > 0) run.effort++;
    run.res.push({ id: cur.T.title, tag: cur.T.tag, score: final, misses: cur.misses, hints: cur.level, bonus: cur.T.tag === 'ท้าทาย' });
    audio.sfx('correct');
    ui.sparkle(at, 24);
    ui.floatText(at || $('#work'), '+' + final, 'good');
    if (final === 3) ui.confetti(40);
    guide.react('cheer');
    paintScore();
    const tok = cur.tok;
    const z = run.z;
    if (z.boss) {
      run.hp--; paintHP();
      $('#bossFace').innerHTML = art.lob('shock');
      ui.shake($('#bossBar')); audio.sfx('bonk');
      if (okId) await guide.say(okId);
      if (!run || run.cur.tok !== tok) return;
      if (run.hp > 0) { await guide.say('lobHit', 'shock'); $('#bossFace').innerHTML = art.lob('sneaky'); }
    } else {
      await guide.say(okId || rand(['yay1', 'yay2', 'yay3', 'yay4', 'yay5']));
    }
    if (!run || run.cur.tok !== tok) return;
    const last = run.i === run.list.length - 1;
    action(last ? 'เสร็จแล้ว!' : 'ภารกิจต่อไป', 'right', 'btn-go', next);
  }
  function next() {
    guide.hush();
    run.i++;
    if (run.i < run.list.length) { audio.sfx('whoosh'); runTask(); return; }
    /* ปรับความยาก: ถ้าเล่นได้ดีมาก เสนอภารกิจท้าทายพิเศษ */
    const z = run.z;
    const mis = run.res.reduce((a, r) => a + r.misses, 0);
    if (z.bonus && !run.bonusDone && mis <= 1) {
      run.bonusDone = true;
      guide.react('wow');
      guide.say('bonus');
      action('ลองเลย!', 'star', 'btn-go', () => { run.list.push(z.bonus); runTask(); });
      action('ไว้คราวหน้า', 'right', 'btn-soft', finishZone);
      return;
    }
    finishZone();
  }
  async function miss(cur, text, at) {
    if (!run || run.cur !== cur || cur.done) return 0;
    cur.misses++;
    audio.sfx('gentle');
    if (at && at.nodeType) ui.shake(at);
    guide.react('oops');
    const n = cur.misses;
    /* ผิดซ้ำ → ช่วยมากขึ้นอัตโนมัติ */
    if (n >= 2 && cur.level < Math.min(3, n)) setHint(cur, Math.min(3, n), true);
    const oops = rand(['oops1', 'oops2', 'oops3', 'oops4']);
    const L = GB.LINES[oops];
    guide.say({ id: oops, who: 'p', text: ui.strip(L[1]) + ' ' + text, voice: L[2] });
    /* ปุ่มลำโพงจะอ่านคำอธิบายให้ฟัง */
    return n;
  }
  function setHint(cur, lv, auto) {
    cur.level = lv;
    $('#btnHint').classList.add('used');
    try { cur.hintFn && cur.hintFn(lv); } catch (e) { console.error(e); }
    const t = cur.T.hints && cur.T.hints[lv - 1];
    if (!auto && t) {
      audio.sfx('hint');
      const v = lv >= 3 ? 'hintB' : 'hintA';
      guide.say({ id: v, who: 'p', text: t, voice: GB.LINES[v][2] });
    }
  }
  $('#btnHint').addEventListener('click', () => {
    if (!run || !run.cur || run.cur.done) return;
    setHint(run.cur, Math.min(3, run.cur.level + 1));
  });

  /* ══════════ สรุปย่าน ══════════ */
  async function finishZone() {
    const z = run.z;
    const main = run.res.filter(r => !r.bonus);
    const pts = main.reduce((a, r) => a + r.score, 0);
    const ratio = pts / (main.length * 3);
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : 1;
    const bonus = run.res.some(r => r.bonus);
    const prev = S.zones[z.id];
    S.zones[z.id] = {
      stars: Math.max(stars, prev ? prev.stars : 0), pts, bonus: bonus || (prev && prev.bonus),
      misses: run.res.reduce((a, r) => a + r.misses, 0), hints: run.res.reduce((a, r) => a + r.hints, 0), effort: run.effort, res: run.res
    };
    justRestored = z.id;
    if (z.boss) return bossEnd();
    const ov = $('#ovResult');
    $('#resBody').innerHTML =
      '<div class="res-top"><div class="res-bld"><svg viewBox="-60 -60 120 100">' + art.building(z.bld) + '</svg></div><div><small>ซ่อมเสร็จแล้ว!</small><h3>' + esc(z.name) + '</h3></div></div>' +
      '<div class="res-stars">' + [0, 1, 2].map(k => '<span class="rs' + (k < stars ? ' on' : '') + '" style="animation-delay:' + (0.3 + k * 0.25) + 's">' + art.star(k < stars) + '</span>').join('') + '</div>' +
      '<div class="res-chips"><span>' + art.icon('star') + ' คะแนน ' + pts + '/' + main.length * 3 + '</span>' +
      (run.effort ? '<span class="eff">' + art.icon('medal') + ' เหรียญพยายาม ' + run.effort + '</span>' : '') +
      (bonus ? '<span class="bon">' + art.icon('trophy') + ' ผ่านภารกิจท้าทาย</span>' : '') + '</div>' +
      '<div class="res-learn"><b>ได้เรียนรู้</b>' + z.book.map(b => '<div class="rl"><i>' + art.icon('check') + '</i><span><b>' + esc(b[0]) + '</b> ' + esc(b[1]) + '</span></div>').join('') + '</div>' +
      (S.settings.teacher ? '<div class="res-teach"><b>คำถามชวนคิด (ครู)</b><ul>' + z.teacher.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' : '') +
      '<div class="res-btns"><button class="btn btn-soft" id="resAgain">' + art.icon('refresh') + '<span>เล่นซ้ำ</span></button><button class="btn btn-go" id="resMap">' + art.icon('map') + '<span>กลับแผนที่</span></button></div>';
    ov.classList.remove('hidden');
    audio.sfx('fanfare');
    ui.confetti(80);
    [0, 1, 2].forEach(k => { if (k < stars) setTimeout(() => audio.sfx('star'), 400 + k * 250); });
    guide.react('cheer');
    guide.say('zoneClear');
    $('#resAgain').onclick = () => { ov.classList.add('hidden'); startZone(z); };
    $('#resMap').onclick = () => { ov.classList.add('hidden'); goMap(); };
  }

  /* ══════════ ด่านลบลบจบ → ตอนจบ ══════════ */
  async function bossEnd() {
    const ov = $('#ovStory');
    ov.classList.remove('hidden');
    $('#stCity').innerHTML = $('#titleCity').innerHTML;
    $('#stCity').classList.add('restored');
    $('#stPing').innerHTML = art.ping('cheer');
    $('#stLob').innerHTML = art.lob('sad');
    $('#stLob').classList.remove('hide', 'run');
    audio.music('final');
    let skipped = false;
    $('#stSkip').onclick = () => { skipped = true; guide.hush(); done(); };
    audio.sfx('bonk');
    await guide.say('lobLose', 'sad');
    if (skipped) return;
    $('#stLob').innerHTML = art.lob('happy');
    ui.confetti(90); audio.sfx('fanfare');
    await guide.say('end1');
    if (skipped) return;
    done();
    function done() {
      if (ov.classList.contains('hidden')) return;
      ov.classList.add('hidden');
      $('#stCity').classList.remove('restored');
      showFinal();
    }
  }
  function showFinal() {
    run = null;
    ui.show('scr-final');
    guide.show(true);
    audio.music('final');
    const tot = ZONES.reduce((a, z) => a + (S.zones[z.id] ? S.zones[z.id].stars : 0), 0);
    const eff = Object.values(S.zones).reduce((a, z) => a + (z.effort || 0), 0);
    const weak = ZONES.filter(z => S.zones[z.id] && (S.zones[z.id].stars < 3 || S.zones[z.id].misses >= 3)).sort((a, b) => S.zones[b.id].misses - S.zones[a.id].misses);
    $('#finalBody').innerHTML =
      '<div class="fin-hero"><div class="fin-ping">' + art.ping('cheer') + '</div><div class="fin-lob">' + art.lob('happy') + '</div></div>' +
      '<h2 class="fin-h">เมืองเรขากลับมาแล้ว!</h2><p class="fin-sub">ขอบคุณนายช่างน้อย ที่ช่วยสร้างเมืองคืนมา</p>' +
      '<div class="fin-total">' + art.star(true) + '<b>' + tot + '</b><small>/ ' + ZONES.length * 3 + ' ดาว</small>' + (eff ? '<span class="eff">' + art.icon('medal') + ' เหรียญพยายาม ' + eff + '</span>' : '') + '</div>' +
      '<div class="fin-zones">' + ZONES.map(z => {
        const st = S.zones[z.id];
        return '<div class="fz"><span class="fz-n">' + z.id + '</span><span class="fz-t">' + esc(z.name) + '</span><span class="fz-s">' + [0, 1, 2].map(k => art.star(st && k < st.stars)).join('') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="fin-learn"><b>สิ่งที่นายช่างน้อยได้เรียนรู้</b><ul>' + ZONES.filter(z => !z.boss).map(z => '<li>' + esc(z.learn) + '</li>').join('') + '</ul></div>' +
      (weak.length ? '<div class="fin-tip"><b>ฝึกเพิ่มอีกนิดจะเก่งขึ้นอีก</b><ul>' + weak.slice(0, 3).map(z => '<li>' + esc(z.name) + ' : ' + esc(z.learn) + '</li>').join('') + '</ul></div>' : '<div class="fin-tip good"><b>สุดยอด! เก่งครบทุกเรื่องเลย</b></div>') +
      (S.settings.teacher ? teacherTable() : '') +
      '<div class="res-btns"><button class="btn btn-soft" id="finBook">' + art.icon('book') + '<span>สมุดช่าง</span></button><button class="btn btn-soft" id="finMap">' + art.icon('map') + '<span>แผนที่เมือง</span></button><button class="btn btn-go" id="finAgain">' + art.icon('refresh') + '<span>เล่นใหม่ทั้งหมด</span></button></div>';
    $('#finBook').onclick = () => openBook();
    $('#finMap').onclick = goMap;
    $('#finAgain').onclick = () => confirmBox('เริ่มสร้างเมืองใหม่ทั้งหมดไหม?', () => { S.zones = {}; S.seenIntro = false; goMap(); });
    ui.confetti(100);
    guide.react('cheer');
    guide.say('end2');
  }
  function teacherTable() {
    return '<div class="res-teach"><b>รายงานสำหรับครู</b><table class="tt"><tr><th>ย่าน</th><th>ดาว</th><th>ตอบผิด</th><th>ใช้คำใบ้</th></tr>' +
      ZONES.map(z => { const s = S.zones[z.id]; return '<tr><td>' + esc(z.name) + '</td><td>' + (s ? s.stars : '-') + '</td><td>' + (s ? s.misses : '-') + '</td><td>' + (s ? s.hints : '-') + '</td></tr>'; }).join('') + '</table></div>';
  }

  /* ══════════ สมุดช่าง (สรุปความรู้) ══════════ */
  const BOOK_FIG = {
    1: [null, null, { k: 'seg', l: 'AB' }, { k: 'ray', l: 'AB' }, { k: 'line', l: 'AB' }],
    2: ['seg', 'ray', 'line'],
    3: [{ k: 'ang', deg: 55, rot: 0 }, null, null, 'angle'],
    4: [{ k: 'ang', deg: 45 }, { k: 'ang', deg: 90 }, { k: 'ang', deg: 130 }, { k: 'ang', deg: 180 }, { k: 'ang', deg: 240 }]
  };
  function openBook(zid) {
    const ov = $('#ovBook');
    const avail = ZONES.filter(z => z.book.length);
    const can = z => S.settings.teacher || dev || S.zones[z.id] || (run && run.z.id === z.id);
    zid = zid || (run && run.z.book.length ? run.z.id : (avail.find(can) || avail[0]).id);
    $('#bookTabs').innerHTML = avail.map(z => '<button class="btab' + (z.id === zid ? ' on' : '') + (can(z) ? '' : ' locked') + '" data-id="' + z.id + '">' + z.id + '</button>').join('');
    $('#bookTabs').querySelectorAll('.btab').forEach(b => b.onclick = () => openBook(+b.dataset.id));
    const z = ZONES[zid - 1];
    if (!can(z)) {
      $('#bookBody').innerHTML = '<div class="book-lock">' + art.icon('lock') + '<p>ซ่อมย่าน ' + esc(z.name) + ' ก่อน แล้วหน้านี้จะเปิดนะ</p></div>';
    } else {
      $('#bookBody').innerHTML = '<h4>' + esc(z.name) + '</h4>' + z.book.map((b, i) => {
        const f = BOOK_FIG[zid] && BOOK_FIG[zid][i];
        let fig = '';
        if (f && typeof f === 'object') fig = GB.figSvg(f, 150, 80);
        else if (typeof f === 'string') fig = art.symbol(f, f === 'angle' ? 'ABC' : 'AB', { scale: 1.2 });
        else if (zid === 5) fig = '<svg class="mini" viewBox="0 0 150 80"><rect x="' + (i === 1 ? 45 : 25) + '" y="12" width="' + (i === 1 ? 60 : 100) + '" height="' + (i === 1 ? 60 : 56) + '" fill="#ffe7a8" stroke="currentColor" stroke-width="4"/></svg>';
        return '<div class="bk-item">' + (fig ? '<div class="bk-fig">' + fig + '</div>' : '') + '<div><b>' + esc(b[0]) + '</b><p>' + esc(b[1]) + '</p></div></div>';
      }).join('');
    }
    ov.classList.remove('hidden');
  }
  $('#bookClose').addEventListener('click', () => $('#ovBook').classList.add('hidden'));

  /* ══════════ ตั้งค่า ══════════ */
  function openSettings() {
    $('#setVol').value = Math.round(S.settings.vol * 100);
    $('#setMusic').checked = S.settings.music;
    $('#setVoice').checked = S.settings.voice;
    $('#setTeacher').checked = S.settings.teacher;
    paintDev();
    $('#ovSettings').classList.remove('hidden');
  }
  $('#setClose').addEventListener('click', () => $('#ovSettings').classList.add('hidden'));
  $('#setVol').addEventListener('input', e => { S.settings.vol = e.target.value / 100; applySettings(); save(); });
  $('#setMusic').addEventListener('change', e => { S.settings.music = e.target.checked; applySettings(); save(); });
  $('#setVoice').addEventListener('change', e => { S.settings.voice = e.target.checked; applySettings(); save(); });
  $('#setTeacher').addEventListener('change', e => {
    S.settings.teacher = e.target.checked; applySettings(); save();
    if ($('#scr-map').classList.contains('active')) paintMap();
  });
  function paintDev() {
    $('#devForm').classList.toggle('on', dev);
    $('#devForm').classList.remove('bad');
    $('#devState').textContent = dev ? 'เปิดอยู่ เข้าได้ทุกย่าน' : 'เปิดทุกย่านเพื่อทดสอบ';
    $('#devBtn').textContent = dev ? 'ออก' : 'ตกลง';
    $('#devCode').value = '';
  }
  $('#devForm').addEventListener('submit', e => {
    e.preventDefault();
    if (dev) dev = false;
    else if (devHash($('#devCode').value.trim()) === DEV_HASH) dev = true;
    else {
      const f = $('#devForm'); f.classList.remove('bad'); void f.offsetWidth; f.classList.add('bad');
      audio.sfx('nope'); $('#devCode').value = ''; return;
    }
    try { dev ? localStorage.setItem(DEV_KEY, DEV_HASH) : localStorage.removeItem(DEV_KEY); } catch (err) {}
    audio.sfx(dev ? 'unlock' : 'click');
    applySettings(); paintDev();
    if ($('#scr-map').classList.contains('active')) paintMap();
  });
  $('#setReset').addEventListener('click', () => confirmBox('ล้างความก้าวหน้าแล้วเริ่มใหม่ทั้งหมดไหม?', () => {
    S.zones = {}; S.seenIntro = false; $('#ovSettings').classList.add('hidden'); guide.hush(); run = null; ui.show('scr-title'); audio.music('title');
  }));
  function confirmBox(text, yes) {
    $('#cfText').textContent = text;
    $('#ovConfirm').classList.remove('hidden');
    $('#cfYes').onclick = () => { $('#ovConfirm').classList.add('hidden'); yes(); };
    $('#cfNo').onclick = () => $('#ovConfirm').classList.add('hidden');
  }

  /* ปุ่มบน HUD */
  $('#btnMapHome').addEventListener('click', () => { guide.hush(); ui.show('scr-title'); guide.show(false); audio.music('title'); });
  $('#btnPlayHome').addEventListener('click', () => confirmBox('กลับไปที่แผนที่ไหม? ภารกิจในย่านนี้จะเริ่มใหม่', goMap));
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !/INPUT|BUTTON|SELECT/.test(document.activeElement.tagName)) {
      const b = $('#gActions .btn');
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  /* ── สำหรับทดสอบเท่านั้น: ?dev=1 ── */
  if (/[?&]dev=1/.test(location.search)) {
    window.GBdev = {
      state: () => S, run: () => run, startZone: id => startZone(ZONES[id - 1]),
      task(zid, i) { startZone(ZONES[zid - 1]); setTimeout(() => { guide.hush(); run.tok = {}; $('#zoneBanner').classList.add('hidden'); run.i = i; runTask(); }, 60); },
      bonus(zid) { startZone(ZONES[zid - 1]); setTimeout(() => { guide.hush(); run.tok = {}; $('#zoneBanner').classList.add('hidden'); run.list.push(ZONES[zid - 1].bonus); run.i = run.list.length - 1; runTask(); }, 60); },
      win() { if (run && run.cur) win(run.cur, null, null); },
      finishAll(stars) { ZONES.forEach(z => { S.zones[z.id] = { stars: stars || 3, misses: 1, hints: 0, effort: 1, res: [] }; }); },
      showFinal, goMap, finishZone: () => finishZone(), story
    };
  }

  decorate();
  guide.init();
  guide.show(false);
  applySettings();
  initTitle();
  setTimeout(() => { document.body.classList.add('ready'); $('#loading').classList.add('gone'); }, 300);
  GB.main = { goMap };
})();
