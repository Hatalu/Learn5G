/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — Game engine
   save / map / stage runner / hints / adaptive level / scoring / summary
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { F, art, ui, audio, STAGES, SKILLS } = PP;
  const { $, G } = ui;

  /* ── บันทึกความก้าวหน้า (เก็บในเครื่องนี้เท่านั้น ไม่มีข้อมูลส่วนตัว) ── */
  const KEY = 'punpunPieShop.v1';
  function fresh() {
    return { v: 1, seenIntro: false, finished: false, stages: {}, settings: { vol: 0.8, music: true, voice: false, teacher: false } };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      const base = fresh();
      s.settings = Object.assign(base.settings, s.settings || {});
      s.stages = s.stages || {};
      return s;
    } catch (e) { return null; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  /* เริ่มใหม่ทุกครั้งที่เปิดเว็บ (เครื่องในโรงเรียนใช้ร่วมกัน) — จำไว้เฉพาะการตั้งค่าเสียง */
  let S = fresh();
  const old = load();
  if (old) S.settings = old.settings;
  save();
  const hasProgress = () => Object.keys(S.stages).length > 0;

  function applySettings() {
    audio.setVolume(S.settings.vol);
    audio.setMusic(S.settings.music);
    G.autoVoice = S.settings.voice;
    document.body.classList.toggle('teacher', !!S.settings.teacher);
  }

  const unlocked = id => id === 1 || S.settings.teacher || !!(S.stages[id - 1] && S.stages[id - 1].stars > 0);
  const totalStars = () => STAGES.reduce((a, st) => a + ((S.stages[st.id] && S.stages[st.id].stars) || 0), 0);

  /* ═════════ TITLE ═════════ */
  function initTitle() {
    $('#titlePie').innerHTML = art.pie(8, 6, { flavor: 'berry', cls: 'spin-slow' });
    $('#titlePP').innerHTML = art.punpun('cheer');
    $('#titleMix').innerHTML = art.mix('smirk');
    $('#btnContinue').hidden = !hasProgress();
    $('#btnNew').querySelector('span').textContent = hasProgress() ? 'เริ่มใหม่' : 'เริ่มผจญภัย';
  }
  $('#btnNew').addEventListener('click', () => {
    audio.unlock();
    if (hasProgress()) {
      confirmBox('เริ่มใหม่ทั้งหมด? ดาวที่เก็บไว้จะหายไปนะ', () => {
        const keep = S.settings;
        S = fresh(); S.settings = keep; save();
        goMap();
      });
    } else goMap();
  });
  $('#btnContinue').addEventListener('click', () => { audio.unlock(); goMap(); });

  /* ═════════ MAP ═════════ */
  function buildMap() {
    const map = $('#mapNodes');
    map.innerHTML = '';
    STAGES.forEach(st => {
      const rec = S.stages[st.id];
      const open = unlocked(st.id);
      const n = document.createElement('button');
      n.className = 'node' + (open ? '' : ' locked') + (rec && rec.stars ? ' done' : '') + (st.final ? ' final' : '');
      n.dataset.id = st.id;
      n.style.setProperty('--c', st.color);
      n.innerHTML = '<div class="node-shop">' + art.shop(st.color) + '<span class="node-num">' + st.id + '</span>' +
        (open ? '' : '<span class="node-lock">' + art.icon('lock') + '</span>') + '</div>' +
        '<div class="node-card"><b>' + st.name + '</b><small>' + st.topic + '</small>' + art.stars(rec ? rec.stars : 0) + '</div>';
      n.addEventListener('click', () => {
        if (!open) {
          ui.shake(n);
          audio.sfx('gentle');
          G.say('ร้านนี้ยังปิดอยู่ ผ่านร้านก่อนหน้าก่อนนะ', { mood: 'think' });
          return;
        }
        audio.sfx('pop', 3);
        playStage(st.id);
      });
      map.appendChild(n);
    });
    $('#mapStars').innerHTML = art.star(true) + '<b>' + totalStars() + '</b><span>/ 15</span>';
    requestAnimationFrame(drawRoad);
  }
  function drawRoad() {
    const box = $('#map').getBoundingClientRect();
    const pts = Array.from(document.querySelectorAll('#mapNodes .node-shop')).map(n => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    if (pts.length < 2) return;
    let d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i];
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      d += ' Q' + p.x + ' ' + my + ' ' + mx + ' ' + my + ' T' + q.x + ' ' + q.y;
    }
    const svg = $('#mapRoad');
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    svg.innerHTML = '<path class="road-base" d="' + d + '"/><path class="road-dash" d="' + d + '"/>';
  }
  addEventListener('resize', () => { if ($('#scr-map').classList.contains('active')) drawRoad(); });

  function goMap() {
    initTitle();
    ui.show('scr-map');
    buildMap();
    G.show();
    G.setNext(null);
    audio.music('map');
    if (!S.seenIntro) {
      G.dialog([
        { who: 'pp', text: 'สวัสดี! เราชื่อปันปัน หมีทำพายประจำหมู่บ้านขนมหวาน', mood: 'cheer' },
        { who: 'pp', text: 'พรุ่งนี้มีเทศกาลแบ่งพาย ทุกคนจะมาซื้อพายร้านเรา' },
        { who: 'mix', text: 'แฮ่ ๆ ข้าคือมิกซ์! ข้าสลับป้ายเศษส่วนในร้านจนมั่วไปหมดแล้ว' },
        { who: 'pp', text: 'แย่แล้ว! ช่วยเราซ่อมร้านทีละจุดได้ไหม?', mood: 'wow' },
        { who: 'pp', text: 'เริ่มที่ร้านหมายเลข 1 ครัวตัดพาย แตะที่ร้านได้เลย', last: 'ตกลง' }
      ]).then(() => {
        S.seenIntro = true; save();
        G.say('แตะร้านหมายเลข 1 ได้เลย!', { mood: 'happy' });
        const n1 = document.querySelector('.node[data-id="1"]');
        ui.pulse(n1);
      });
    } else {
      const next = STAGES.find(st => unlocked(st.id) && !(S.stages[st.id] && S.stages[st.id].stars));
      G.say(next ? 'ไปที่ ' + next.name + ' กันต่อเลย!' : 'ร้านกลับมาสวยแล้ว! เลือกร้านไหนก็เล่นซ้ำได้นะ', { mood: 'happy' });
      if (next) ui.pulse(document.querySelector('.node[data-id="' + next.id + '"]'));
    }
  }
  $('#btnMapHome').addEventListener('click', () => { audio.sfx('click'); G.hide(); initTitle(); ui.show('scr-title'); audio.music(null); });

  /* ═════════ STAGE RUNNER ═════════ */
  let run = null;

  async function playStage(id) {
    const st = STAGES[id - 1];
    const token = {};
    run = { st, token, level: 1, streak: 0, results: [], skills: {}, total: st.learn.length + st.missions };
    ui.show('scr-play');
    document.body.dataset.stage = id;
    $('#hudStage').innerHTML = '<span class="hud-num" style="background:' + st.color + '">' + id + '</span><span class="hud-name">' + st.name + '</span>';
    paintPips(-1);
    paintLevel();
    $('#taskTag').textContent = 'เปิดร้าน';
    $('#taskTitle').innerHTML = ui.rich(st.topic);
    $('#work').innerHTML = '<div class="stage-cover">' + art.shop(st.color) + '<div class="cover-name">' + st.name + '</div></div>';
    $('#btnHint').disabled = true;
    G.show();
    audio.music(st.final ? 'fest' : 'play');
    G.onShow = html => {
      const w = $('#work');
      w.innerHTML = '<div class="intro-show">' + ui.rich(html, true) + '</div>';
      w.classList.remove('enter'); void w.offsetWidth; w.classList.add('enter');
    };
    await G.dialog(st.intro);
    G.onShow = null;
    if (!run || run.token !== token) return;

    for (let i = 0; i < run.total; i++) {
      const isLearn = i < st.learn.length;
      const task = isLearn ? st.learn[i]() : st.gen(run.level, i - st.learn.length, run);
      await runTask(task, i, !isLearn);
      if (!run || run.token !== token) return;
    }
    finishStage();
  }

  function paintPips(cur) {
    const r = run;
    let h = '';
    for (let i = 0; i < r.total; i++) {
      const res = r.results[i];
      const cls = res ? 'p' + res.pts : (i === cur ? 'cur' : '');
      h += '<i class="' + cls + '"></i>';
    }
    $('#hudPips').innerHTML = h;
    const pts = r.results.reduce((a, x) => a + x.pts, 0);
    $('#hudScore').innerHTML = art.star(true) + '<b>' + pts + '</b>';
  }
  function paintLevel() {
    let h = '<span>ระดับ</span>';
    for (let i = 1; i <= 3; i++) h += '<i class="' + (i <= run.level ? 'on' : '') + '"></i>';
    $('#hudLevel').innerHTML = h;
  }

  function runTask(task, i, isMission) {
    return new Promise(resolve => {
      const T = { wrongs: 0, hints: 0, hintLevel: 0, done: false, helped: false };
      run.cur = { task, T };
      $('#taskTag').textContent = 'ภารกิจ ' + (i + 1) + ' / ' + run.total;
      $('#taskTitle').innerHTML = ui.rich(task.title);
      paintPips(i);
      const work = $('#work');
      work.innerHTML = '';
      work.classList.remove('enter'); void work.offsetWidth; work.classList.add('enter');
      $('#btnHint').disabled = false;
      G.setNext(null);

      const finish = () => {
        $('#btnHint').disabled = true;
        work.querySelectorAll('.act-go').forEach(b => { b.disabled = true; });
        const pts = T.helped ? 1 : Math.max(1, 3 - T.wrongs - T.hints);
        run.results[i] = { pts, skill: task.skill, first: T.wrongs === 0 && T.hints === 0 };
        const sk = run.skills[task.skill] = run.skills[task.skill] || { ok: 0, total: 0 };
        sk.total++;
        if (run.results[i].first) sk.ok++;
        paintPips(-1);
        if (isMission && i < run.total - 1) adapt(T);
        G.setNext(i < run.total - 1 ? 'ภารกิจต่อไป' : 'สรุปผล', () => resolve());
      };

      const api = {
        level: run.level,
        isDone: () => T.done,
        isCurrent: () => !!(run && run.cur && run.cur.task === task),
        say: (text, mood) => G.say(text, { mood: mood || 'talk' }),
        mix: (text, mood) => G.say(text, { who: 'mix', mood: mood || 'smirk' }),
        mixMood: m => G.mood(m, 'mix'),
        correct(text, at) {
          if (T.done) return;
          T.done = true;
          audio.sfx('correct');
          ui.sparkle(at || $('#work'), 16);
          const pts = Math.max(1, 3 - T.wrongs - T.hints);
          ui.floatText(ui.center(at || $('#work')), '+' + pts, 'pts');
          G.say(text, { mood: 'cheer', keepMix: !!task.mixSay });
          finish();
        },
        wrong(text, at) {
          if (T.done) return;
          T.wrongs++;
          audio.sfx('gentle');
          if (at) ui.shake(at);
          T.hintLevel = Math.min(3, T.hintLevel + 1);
          const h = task.hint(T.hintLevel, api);
          const lead = text || F.pick(['เกือบแล้ว! ลองอีกนิดนะ', 'ไม่เป็นไร ลองใหม่นะ', 'หืม... ลองคิดอีกทีนะ']);
          G.say(lead + '\n' + h, { mood: 'think', keepMix: !!task.mixSay });
          if (T.wrongs >= 3) G.setNext('ให้ปันปันช่วย', help);
        }
      };
      function help() {
        if (T.done) return;
        T.done = true;
        T.helped = true;
        if (task.solve) task.solve(api);
        G.say('ไม่เป็นไรนะ มาดูด้วยกัน\n' + task.answer, { mood: 'happy' });
        work.classList.add('helped');
        finish();
      }
      run.cur.hint = () => {
        if (T.done) return;
        T.hints++;
        T.hintLevel = Math.min(3, T.hintLevel + 1);
        audio.sfx('hint');
        G.say(task.hint(T.hintLevel, api), { mood: 'think', keepMix: !!task.mixSay });
        if (T.hintLevel >= 3 && T.wrongs >= 1) G.setNext('ให้ปันปันช่วย', help);
      };

      task.render(work, api);
      work.classList.remove('helped');
      if (task.mixSay) {
        G.say(task.mixSay, { who: 'mix', mood: 'smirk' });
        G.setNext('ฟังปันปัน', () => G.say(task.say, { mood: 'talk', keepMix: true }), true);
      } else {
        G.say(task.say, { mood: 'talk' });
      }
    });
  }

  /* ── ปรับระดับความยากตามความเข้าใจ ── */
  function adapt(T) {
    if (T.wrongs === 0 && T.hints === 0) {
      run.streak++;
      if (run.streak >= 2 && run.level < 3) {
        run.level++; run.streak = 0;
        setTimeout(() => ui.toast('เก่งมาก! ภารกิจต่อไปท้าทายขึ้นอีกนิด'), 600);
      }
    } else {
      run.streak = 0;
      if ((T.wrongs >= 2 || T.helped) && run.level > 1) {
        run.level--;
        setTimeout(() => ui.toast('ภารกิจต่อไป มาฝึกแบบที่ง่ายขึ้นก่อนนะ'), 600);
      }
    }
    paintLevel();
  }

  $('#btnHint').addEventListener('click', () => { if (run && run.cur && run.cur.hint) run.cur.hint(); });
  $('#btnPlayHome').addEventListener('click', () => {
    audio.sfx('click');
    confirmBox('กลับแผนที่? ภารกิจในร้านนี้จะเริ่มใหม่ครั้งหน้า', () => {
      if (run) run.token = null;
      run = null;
      goMap();
    });
  });

  /* ═════════ STAGE RESULT ═════════ */
  function finishStage() {
    const st = run.st;
    const pts = run.results.reduce((a, x) => a + x.pts, 0);
    const max = run.total * 3;
    const ratio = pts / max;
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
    const prev = S.stages[st.id] || { stars: 0, best: 0 };
    S.stages[st.id] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best || 0, pts), max, skills: run.skills, plays: (prev.plays || 0) + 1 };
    const firstClear = !prev.stars;
    save();

    audio.music(null);
    audio.sfx('fanfare');
    ui.confetti();
    G.say(stars === 3 ? 'สุดยอดไปเลย! ' + st.name + ' กลับมาสวยแล้ว' : 'ทำสำเร็จแล้ว! เก่งมากที่พยายามจนจบ', { mood: 'cheer' });

    const recs = Object.keys(run.skills).filter(k => run.skills[k].ok / run.skills[k].total < 0.7).map(k => SKILLS[k].rec);
    let h = '<div class="res-head">ร้านที่ ' + st.id + ' ' + st.name + '</div>' +
      '<div class="res-stars">' + art.stars(stars, 3, 'pop-in') + '</div>' +
      '<div class="res-pts">ได้ <b>' + pts + '</b> จาก ' + max + ' คะแนน</div>' +
      '<div class="res-sec"><h4>สิ่งที่ได้เรียนรู้</h4><ul>' + st.recap.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    if (recs.length) h += '<div class="res-sec tip"><h4>ฝึกเพิ่มอีกนิด</h4><ul>' + recs.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    if (S.settings.teacher) h += '<div class="res-sec teach"><h4>คำถามชวนคิด (ครู)</h4><ul>' + st.teacher.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    h += '<p class="res-rule">ดาว 3 ดวง = 85% ขึ้นไป · 2 ดวง = 60% ขึ้นไป · ทำจนจบได้ 1 ดวงเสมอ</p>';
    h += '<div class="res-btns">' +
      '<button class="btn" id="resReplay">' + art.icon('refresh') + '<span>เล่นอีกครั้ง</span></button>' +
      (st.final ? '<button class="btn btn-go" id="resFinal">' + art.icon('right') + '<span>ฉลองเทศกาล</span></button>'
                : '<button class="btn btn-go" id="resMap">' + art.icon('map') + '<span>' + (firstClear ? 'ไปร้านต่อไป' : 'กลับแผนที่') + '</span></button>') +
      '</div>';
    $('#resBody').innerHTML = h;
    ui.openOv('#ovResult');
    document.querySelectorAll('#resBody .star.on').forEach((s, i) => setTimeout(() => { s.classList.add('shown'); audio.sfx('star'); }, 400 + i * 350));
    $('#resReplay').addEventListener('click', () => { ui.closeOv('#ovResult'); playStage(st.id); });
    const m = $('#resMap');
    if (m) m.addEventListener('click', () => { ui.closeOv('#ovResult'); if (firstClear && st.id < 5) audio.sfx('unlock'); goMap(); });
    const f = $('#resFinal');
    if (f) f.addEventListener('click', () => { ui.closeOv('#ovResult'); showFinal(); });
  }

  /* ═════════ FINAL CELEBRATION ═════════ */
  async function showFinal() {
    S.finished = true; save();
    ui.show('scr-final');
    audio.music('fest');
    const agg = {};
    Object.keys(S.stages).forEach(id => {
      const sk = S.stages[id].skills || {};
      Object.keys(sk).forEach(k => {
        agg[k] = agg[k] || { ok: 0, total: 0 };
        agg[k].ok += sk[k].ok; agg[k].total += sk[k].total;
      });
    });
    let bars = '';
    Object.keys(SKILLS).forEach(k => {
      const a = agg[k];
      const p = a && a.total ? Math.round(a.ok / a.total * 100) : 0;
      const lvl = !(a && a.total) ? 'ยังไม่ได้เล่น' : p >= 80 ? 'เข้าใจดีมาก' : p >= 60 ? 'เข้าใจดี' : 'ควรฝึกเพิ่ม';
      bars += '<div class="mbar"><div class="mbar-top"><span>' + SKILLS[k].name + '</span><b>' + lvl + '</b></div>' +
        '<div class="mbar-track"><div class="mbar-fill ' + (p >= 80 ? 'hi' : p >= 60 ? 'mid' : 'lo') + '" style="--p:' + p + '%"></div></div></div>';
    });
    const weak = Object.keys(SKILLS).filter(k => agg[k] && agg[k].total && agg[k].ok / agg[k].total < 0.6);
    $('#finalBody').innerHTML =
      '<div class="final-chars"><div class="fc">' + art.punpun('cheer') + '</div><div class="fc">' + art.mix('happy') + '</div></div>' +
      '<h2 class="final-title">เทศกาลแบ่งพายสำเร็จ!</h2>' +
      '<div class="final-stars">' + art.star(true) + '<b>' + totalStars() + '</b> / 15 ดาว</div>' +
      '<div class="final-cert"><h4>ความเข้าใจของนักทำพาย</h4>' + bars +
        '<p class="cert-note">วัดจากการตอบถูกในครั้งแรกโดยไม่ใช้คำใบ้</p></div>' +
      (weak.length ? '<div class="res-sec tip"><h4>แนะนำให้ฝึกเพิ่ม</h4><ul>' + weak.map(k => '<li>' + ui.rich(SKILLS[k].rec) + '</li>').join('') + '</ul></div>' : '') +
      '<div class="res-btns"><button class="btn btn-go" id="finMap">' + art.icon('map') + '<span>กลับแผนที่</span></button></div>';
    $('#finMap').addEventListener('click', () => goMap());
    ui.confetti();
    G.show();
    await G.dialog(STAGES[4].outro);
    G.say('เลือกเล่นร้านไหนซ้ำก็ได้ เพื่อเก็บดาวให้ครบนะ', { mood: 'happy', keepMix: true });
  }

  /* ═════════ BOOK / SETTINGS / CONFIRM ═════════ */
  let bookPage = 0;
  function openBook() {
    audio.sfx('pop', 2);
    const tabs = STAGES.map((st, i) => {
      const open = S.settings.teacher || S.stages[st.id] || (run && run.st.id === st.id);
      return '<button class="book-tab' + (i === bookPage ? ' active' : '') + (open ? '' : ' locked') + '" data-i="' + i + '">' + (open ? st.id : art.icon('lock')) + '</button>';
    }).join('');
    $('#bookTabs').innerHTML = tabs;
    paintBook();
    ui.openOv('#ovBook');
  }
  function paintBook() {
    const st = STAGES[bookPage];
    const open = S.settings.teacher || S.stages[st.id] || (run && run.st.id === st.id);
    $('#bookBody').innerHTML = '<h3>' + st.name + '</h3><p class="book-topic">' + st.topic + '</p>' +
      (open ? st.book.map(t => '<p>' + ui.rich(t) + '</p>').join('') : '<p class="book-locked">' + art.icon('lock') + ' เล่นร้านนี้ก่อน แล้วหน้านี้จะเปิดเอง</p>');
    document.querySelectorAll('.book-tab').forEach((t, i) => t.classList.toggle('active', i === bookPage));
  }
  $('#bookTabs').addEventListener('click', e => {
    const t = e.target.closest('.book-tab');
    if (!t) return;
    bookPage = +t.dataset.i;
    audio.sfx('tick');
    paintBook();
  });
  document.querySelectorAll('.btn-book').forEach(b => b.addEventListener('click', () => {
    if (run && run.st) bookPage = run.st.id - 1;
    openBook();
  }));
  $('#bookClose').addEventListener('click', () => { audio.sfx('click'); ui.closeOv('#ovBook'); });

  function openSettings() {
    audio.sfx('pop', 2);
    $('#setVol').value = Math.round(S.settings.vol * 100);
    $('#setMusic').checked = S.settings.music;
    $('#setVoice').checked = S.settings.voice;
    $('#setTeacher').checked = S.settings.teacher;
    $('#voiceNote').textContent = !audio.canSpeak() ? 'อุปกรณ์นี้ไม่รองรับเสียงอ่าน'
      : audio.hasThaiVoice() ? 'พบเสียงอ่านภาษาไทยในเครื่องนี้' : 'ไม่พบเสียงภาษาไทยในเครื่อง อาจอ่านได้ไม่ชัด';
    ui.openOv('#ovSettings');
  }
  document.querySelectorAll('.btn-settings').forEach(b => b.addEventListener('click', openSettings));
  $('#setVol').addEventListener('input', e => { S.settings.vol = e.target.value / 100; applySettings(); save(); });
  $('#setVol').addEventListener('change', () => audio.sfx('pop', 4));
  $('#setMusic').addEventListener('change', e => { S.settings.music = e.target.checked; applySettings(); save(); });
  $('#setVoice').addEventListener('change', e => { S.settings.voice = e.target.checked; applySettings(); save(); if (e.target.checked) audio.speak('เปิดเสียงอ่านแล้ว'); });
  $('#setTeacher').addEventListener('change', e => {
    S.settings.teacher = e.target.checked; applySettings(); save();
    if ($('#scr-map').classList.contains('active')) buildMap();
  });
  $('#setReset').addEventListener('click', () => {
    confirmBox('ลบความก้าวหน้าทั้งหมด แล้วเริ่มใหม่?', () => {
      const keep = S.settings;
      S = fresh(); S.settings = keep; save();
      ui.closeOv('#ovSettings');
      if (run) run.token = null;
      run = null;
      G.hide();
      initTitle();
      ui.show('scr-title');
      audio.music(null);
    });
  });
  $('#setClose').addEventListener('click', () => { audio.sfx('click'); ui.closeOv('#ovSettings'); });

  function confirmBox(text, yes) {
    $('#cfText').textContent = text;
    ui.openOv('#ovConfirm');
    const y = $('#cfYes'), n = $('#cfNo');
    const done = () => { y.onclick = n.onclick = null; ui.closeOv('#ovConfirm'); };
    y.onclick = () => { audio.sfx('click'); done(); yes(); };
    n.onclick = () => { audio.sfx('click'); done(); };
  }

  /* ═════════ BOOT ═════════ */
  function decorate() {
    document.querySelectorAll('[data-icon]').forEach(el => { el.insertAdjacentHTML('afterbegin', art.icon(el.dataset.icon)); });
    let b = '';
    const cols = ['#ff9fb2', '#ffd36e', '#9fe0c6', '#a9c8ff', '#c9b3ec'];
    for (let i = 0; i < 18; i++) b += '<i style="--c:' + cols[i % 5] + ';--i:' + i + '"></i>';
    $('#bunting').innerHTML = b;
  }
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !document.querySelector('.ov:not(.hidden)') && G.nextCb && document.activeElement === document.body) {
      e.preventDefault();
      G.fireNext();
    }
  });

  /* สำหรับทดสอบเท่านั้น: เปิดด้วย ?dev=1 */
  if (/[?&]dev=1/.test(location.search)) {
    window.PPdev = {
      playStage, goMap, run: () => run, save: () => S,
      /* แสดงภารกิจเดี่ยว: preview(ด่าน, ระดับ, ลำดับภารกิจ) */
      preview(id, level, i) {
        const st = STAGES[id - 1];
        run = { st, token: {}, level, streak: 0, results: [], skills: {}, total: 1 };
        ui.show('scr-play'); G.show(); paintLevel();
        return runTask(i < 0 ? st.learn[-i - 1]() : st.gen(level, i, run), 0, true);
      },
      /* จำลองจบด่าน: fakeFinish(ด่าน, คะแนนต่อภารกิจ[]) */
      fakeFinish(id, pts) {
        const st = STAGES[id - 1];
        run = { st, token: {}, level: 1, streak: 0, skills: {}, total: pts.length,
          results: pts.map(p => ({ pts: p, skill: 'compare', first: p === 3 })) };
        pts.forEach(p => { const s = run.skills.compare = run.skills.compare || { ok: 0, total: 0 }; s.total++; if (p === 3) s.ok++; });
        ui.show('scr-play'); G.show();
        finishStage();
      }
    };
  }

  decorate();
  G.init();
  applySettings();
  initTitle();
  setTimeout(() => { document.body.classList.add('ready'); $('#loading').classList.add('gone'); }, 350);
})();
