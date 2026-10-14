/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — Game engine
   save / title countdown / map / stage runner / hints / adaptive level
   scoring / results / final castle / notebook / settings
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const AP = window.AP;
  const { M, art, ui, audio, STAGES, SKILLS } = AP;
  const { $, G } = ui;

  /* ── บันทึก (เก็บในเครื่องนี้เท่านั้น ไม่มีข้อมูลส่วนตัว) ── */
  const KEY = 'proproAnglePark.v1';
  function fresh() {
    return { v: 1, seenIntro: false, finished: false, stages: {}, settings: { vol: 0.8, music: true, voice: true, hype: true, voiceName: '', teacher: false } };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      s.settings = Object.assign(fresh().settings, s.settings || {});
      return s;
    } catch (e) { return null; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  /* เปิดเว็บใหม่ = เริ่มใหม่ (เครื่องในโรงเรียนใช้ร่วมกัน) — จำไว้เฉพาะการตั้งค่า */
  let S = fresh();
  const old = load();
  if (old) S.settings = old.settings;
  save();
  const hasProgress = () => Object.keys(S.stages).length > 0;

  function applySettings() {
    audio.setVolume(S.settings.vol);
    audio.setMusic(S.settings.music);
    audio.setHype(S.settings.hype);
    audio.setVoice(S.settings.voiceName);
    G.autoVoice = S.settings.voice;
    document.body.classList.toggle('teacher', !!S.settings.teacher);
  }
  const unlocked = id => id === 1 || S.settings.teacher || !!(S.stages[id - 1] && S.stages[id - 1].stars > 0);
  const totalStars = () => STAGES.reduce((a, st) => a + ((S.stages[st.id] && S.stages[st.id].stars) || 0), 0);
  const MAX_STARS = STAGES.length * 3;
  const flagsGot = () => STAGES.filter(st => S.stages[st.id] && S.stages[st.id].stars).length;

  /* ═════════ TITLE ═════════ */
  function initTitle() {
    $('#titleKid').innerHTML = art.kid('happy', 'walk');
    $('#titlePro').innerHTML = art.pro('cheer');
    $('#titleZig').innerHTML = art.zig('smirk');
    $('#btnContinue').hidden = !hasProgress();
    $('#btnNew').querySelector('span').textContent = hasProgress() ? 'เริ่มใหม่' : 'เริ่มซ่อมมุม!';
  }
  async function countdown() {
    const ov = $('#ovCount');
    ov.classList.remove('hidden');
    const lights = ov.querySelectorAll('.cd-light');
    const txt = $('#cdText');
    lights.forEach(l => l.classList.remove('on', 'go'));
    audio.sfx('whoosh');
    for (let i = 0; i < 3; i++) {
      txt.textContent = String(3 - i);
      ui.restart(txt, 'pop');
      lights[i].classList.add('on');
      audio.sfx('count');
      await ui.wait(650);
    }
    lights.forEach(l => l.classList.add('go'));
    txt.textContent = 'ไปเลย!';
    ui.restart(txt, 'pop');
    audio.sfx('go');
    ui.confetti(30);
    await ui.wait(750);
    ov.classList.add('hidden');
  }
  $('#btnNew').addEventListener('click', async () => {
    audio.unlock();
    if (hasProgress()) {
      confirmBox('เริ่มซ่อมมุมใหม่ทั้งหมด? ดาวที่เก็บไว้จะหายไปนะ', async () => {
        const keep = S.settings;
        S = fresh(); S.settings = keep; save();
        await countdown();
        goMap();
      });
    } else {
      await countdown();
      goMap();
    }
  });
  $('#btnContinue').addEventListener('click', () => { audio.unlock(); goMap(); });

  /* ═════════ MAP : ทางเดินในสวนสนุก (ทางเข้าอยู่ล่าง ปราสาทยักษ์อยู่บน) ═════════ */
  function buildMap() {
    const map = $('#mapNodes');
    map.innerHTML = '';
    STAGES.slice().reverse().forEach(st => {
      const rec = S.stages[st.id];
      const open = unlocked(st.id);
      const n = document.createElement('button');
      n.className = 'node' + (open ? '' : ' locked') + (rec && rec.stars ? ' done' : '') + (st.final ? ' final' : '');
      n.dataset.id = st.id;
      n.style.setProperty('--c', st.color);
      n.innerHTML = '<div class="node-badge">' + art.badge(st.icon, open ? st.color : '#b8b3c9') + '<span class="node-num">' + st.id + '</span>' +
        (open ? '' : '<span class="node-lock">' + art.icon('lock') + '</span>') +
        (rec && rec.stars ? '<span class="node-flag">' + art.flag() + '</span>' : '') + '</div>' +
        '<div class="node-card"><b>' + st.name + '</b><small>' + st.topic + '</small>' + art.stars(rec ? rec.stars : 0) + '</div>';
      n.addEventListener('click', () => {
        if (!open) {
          ui.shake(n);
          audio.sfx('gentle');
          G.say('เครื่องเล่นนี้ยังล็อกอยู่! ซ่อมเครื่องเล่นก่อนหน้าก่อนนะ', { mood: 'think' });
          return;
        }
        audio.sfx('whoosh');
        playStage(st.id);
      });
      map.appendChild(n);
    });
    $('#mapStars').innerHTML = art.star(true) + '<b>' + totalStars() + '</b><span>/ ' + MAX_STARS + '</span>';
    $('#mapFlags').innerHTML = art.flag() + '<b>' + flagsGot() + '</b><span>/ ' + STAGES.length + '</span>';
    requestAnimationFrame(() => { drawRoad(); placeMapKid(flagsGot()); });
  }
  /* จุดกลางป้ายของแต่ละเครื่องเล่น เรียงตามเลข (1 → 5) */
  function nodePoints() {
    const box = $('#map').getBoundingClientRect();
    const sc = $('#map').scrollTop;
    return Array.from(document.querySelectorAll('#mapNodes .node'))
      .sort((a, b) => +a.dataset.id - +b.dataset.id)
      .map(n => {
        const r = n.querySelector('.node-badge').getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top + sc };
      });
  }
  function drawRoad() {
    const map = $('#map');
    const pts = nodePoints();
    if (pts.length < 2) return;
    let d = 'M' + pts[0].x + ' ' + (pts[0].y + 70) + ' L' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i];
      const my = (p.y + q.y) / 2;
      d += ' C' + p.x + ' ' + my + ' ' + q.x + ' ' + my + ' ' + q.x + ' ' + q.y;
    }
    const svg = $('#mapRoad');
    const h = Math.max(map.scrollHeight, map.clientHeight);
    svg.style.height = h + 'px';
    svg.setAttribute('viewBox', '0 0 ' + map.clientWidth + ' ' + h);
    svg.innerHTML = '<path class="road-curb" d="' + d + '"/><path class="road-base" d="' + d + '"/><path class="road-dash" d="' + d + '"/>';
  }
  function placeMapKid(i) {
    const pts = nodePoints();
    const c = $('#mapKid');
    if (!pts.length) return;
    const p = pts[Math.min(i, pts.length - 1)];
    c.innerHTML = art.kid('happy', 'mini');
    c.style.left = p.x + 'px';
    c.style.top = p.y + 'px';
  }
  addEventListener('resize', () => {
    if ($('#scr-map').classList.contains('active')) { drawRoad(); placeMapKid(flagsGot()); }
  });

  function goMap() {
    initTitle();
    ui.show('scr-map');
    document.body.dataset.stage = '0';
    buildMap();
    G.show();
    G.setNext(null);
    audio.music('map');
    const next = STAGES.find(st => unlocked(st.id) && !(S.stages[st.id] && S.stages[st.id].stars));
    const target = next || STAGES[STAGES.length - 1];
    setTimeout(() => {
      const nd = document.querySelector('.node[data-id="' + target.id + '"]');
      if (nd) nd.scrollIntoView({ block: 'center' });
      drawRoad(); placeMapKid(flagsGot());
    }, 60);
    if (!S.seenIntro) {
      G.dialog([
        { who: 'pro', mood: 'cheer', sfx: 'horn', text: 'สวัสดีทุกคน! ฉันโปรโปร โพรแทรกเตอร์ประจำสวนสนุกเมืองมุม!' },
        { who: 'pro', mood: 'wow', text: 'แย่แล้ว! เครื่องเล่นทุกอย่างเบี้ยวหมดเลย เล่นไม่ได้สักอย่าง!' },
        { who: 'zig', mood: 'laugh', text: 'ฮิ ๆ ข้าชื่อซิกแซก! ข้าบิดมุมเครื่องเล่นให้เบี้ยวหมดแล้ว! ใครจะวัดมุมเก่งกว่าข้า!' },
        { who: 'pro', mood: 'think', text: 'ต้องวัดมุมให้ถูกและสร้างมุมให้เป๊ะ ถึงจะซ่อมได้! มาเป็นนักซ่อมมุมกับฉันนะ!' },
        { who: 'pro', mood: 'cheer', text: 'ซ่อมให้ครบ 5 เครื่องเล่น แล้วสวนสนุกจะเปิดอีกครั้ง! พร้อมไหม!', last: 'พร้อม!' }
      ]).then(() => {
        S.seenIntro = true; save();
        G.say('แตะเครื่องเล่นที่ 1 บูธโปรโปร ได้เลย!', { mood: 'happy' });
        ui.pulse(document.querySelector('.node[data-id="1"] .node-badge'));
      });
    } else {
      G.say(next ? 'ไปที่ ' + next.name + ' กันต่อเลย!' : 'ซ่อมครบทุกเครื่องเล่นแล้ว! เลือกเครื่องไหนก็เล่นซ้ำเก็บดาวได้นะ', { mood: 'happy' });
      if (next) ui.pulse(document.querySelector('.node[data-id="' + next.id + '"] .node-badge'));
    }
  }
  $('#btnMapHome').addEventListener('click', () => { audio.sfx('click'); G.hide(); initTitle(); ui.show('scr-title'); audio.music('title'); });

  /* ═════════ ย่อเนื้อหาให้พอดีจอ (จอเตี้ย) ด้วยการย่อทั้งก้อนแบบสัดส่วนเดียวกัน แทนการเลื่อนจอ ═════════ */
  let fitRaf = 0;
  function fitWork() {
    clearTimeout(fitRaf);
    fitRaf = setTimeout(() => {
      const w = $('#work');
      const inn = w && w.querySelector('.work-in');
      if (!inn || !w.clientHeight) return;
      inn.style.transform = 'none'; inn.style.marginBottom = '0'; inn.style.width = '100%';
      const cs = getComputedStyle(w);
      const availH = w.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2;
      let s = 1;
      for (let it = 0; it < 5; it++) {
        inn.style.width = (100 / s).toFixed(2) + '%';
        const nat = inn.offsetHeight;
        const ns = Math.max(0.5, Math.min(1, availH / nat));
        const done = Math.abs(ns - s) < 0.004;
        s = ns;
        if (done) break;
      }
      inn.style.width = (100 / s).toFixed(2) + '%';
      const nat = inn.offsetHeight;
      if (s < 0.999) {
        inn.style.transform = 'scale(' + s.toFixed(3) + ')';
        inn.style.marginBottom = (-(nat * (1 - s))).toFixed(1) + 'px';
      } else { inn.style.width = '100%'; }
    }, 20);
  }
  let fitT = 0;
  new MutationObserver(() => { clearTimeout(fitT); fitT = setTimeout(fitWork, 40); }).observe($('#work'), { childList: true, subtree: true });
  addEventListener('resize', fitWork);
  /* ขนาดพื้นที่เล่นเปลี่ยน (เช่นกล่องคำพูดสูงขึ้น) → คำนวณใหม่ */
  if (window.ResizeObserver) new ResizeObserver(() => fitWork()).observe($('#work'));

  /* ═════════ STAGE RUNNER ═════════ */
  let run = null;

  async function playStage(id) {
    const st = STAGES[id - 1];
    const token = {};
    run = { st, token, level: 1, streak: 0, results: [], skills: {}, total: st.learn.length + st.missions };
    ui.show('scr-play');
    document.body.dataset.stage = id;
    $('#hudStage').innerHTML = '<span class="hud-num" style="background:' + st.color + '">' + id + '</span><span class="hud-name">' + st.name + '</span>';
    paintTrail(-1);
    paintLevel();
    $('#taskTag').textContent = 'เข้าเครื่องเล่น';
    $('#taskTitle').innerHTML = ui.rich(st.topic);
    $('#work').innerHTML = '<div class="stage-cover"><div class="cover-badge">' + art.badge(st.icon, st.color) + '</div>' +
      '<div class="cover-kid">' + art.kid('cheer', 'walk') + '</div><div class="cover-name">' + st.name + '</div></div>';
    $('#btnHint').disabled = true;
    G.show();
    audio.music(st.final ? 'final' : 'play');
    G.onShow = sh => {
      const w = $('#work');
      w.innerHTML = '<div class="intro-show"></div>';
      const box = w.firstChild;
      if (typeof sh === 'function') sh(box); else box.innerHTML = ui.rich(sh, true);
      ui.restart(w, 'enter');
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

  function paintTrail(cur) {
    const r = run;
    let h = '';
    for (let i = 0; i < r.total; i++) {
      const res = r.results[i];
      const left = ((i + 1) / r.total) * 100;
      h += '<i class="cp ' + (res ? 'p' + res.pts : i === cur ? 'cur' : '') + '" style="left:' + left + '%"></i>';
    }
    $('#trailCps').innerHTML = h;
    const done = r.results.filter(Boolean).length;
    $('#trailKid').style.left = (done / r.total * 100) + '%';
    const pts = r.results.reduce((a, x) => a + (x ? x.pts : 0), 0);
    $('#hudScore').innerHTML = art.star(true) + '<b>' + pts + '</b>';
  }
  function paintLevel() {
    let h = '<span>ระดับ</span>';
    for (let i = 1; i <= 3; i++) h += '<i class="' + (i <= run.level ? 'on' : '') + '"></i>';
    $('#hudLevel').innerHTML = h;
  }

  function runTask(task, i, isMission) {
    return new Promise(resolve => {
      const Tk = { wrongs: 0, hints: 0, hintLevel: 0, done: false, helped: false };
      run.cur = { task, T: Tk };
      $('#taskTag').textContent = (isMission ? 'ภารกิจ ' : 'ฝึกซ้อม ') + (i + 1) + ' / ' + run.total;
      $('#taskTitle').innerHTML = ui.rich(task.title);
      paintTrail(i);
      const work = $('#work');
      work.innerHTML = '<div class="work-in"></div>';
      const inner = work.firstChild;
      ui.restart(work, 'enter');
      work.classList.remove('helped');
      $('#btnHint').disabled = false;
      G.setNext(null);

      const finish = () => {
        $('#btnHint').disabled = true;
        work.querySelectorAll('.act-go').forEach(b => { b.disabled = true; });
        const pts = Tk.helped ? 1 : Math.max(1, 3 - Tk.wrongs - Tk.hints);
        run.results[i] = { pts, skill: task.skill, first: Tk.wrongs === 0 && Tk.hints === 0 && !Tk.helped };
        const sk = run.skills[task.skill] = run.skills[task.skill] || { ok: 0, total: 0 };
        sk.total++;
        if (run.results[i].first) sk.ok++;
        paintTrail(-1);
        if (isMission && i < run.total - 1) adapt(Tk);
        G.setNext(i < run.total - 1 ? 'ไปต่อ!' : 'ดูผลงาน!', () => resolve());
      };

      let listenCb = null;
      const dropListen = () => { if (listenCb && G.nextCb === listenCb) G.setNext(null); listenCb = null; };
      const api = {
        level: run.level,
        isCurrent: () => !!(run && run.cur && run.cur.task === task),
        say: (text, mood) => { if (!api.isCurrent()) return; dropListen(); G.say(text, { mood: mood || 'talk', keepZig: !!task.judSay }); },
        zig: (text, mood) => { if (api.isCurrent()) G.say(text, { who: 'zig', mood: mood || 'smirk' }); },
        correct(text, at) {
          if (Tk.done || !api.isCurrent()) return;
          dropListen();
          Tk.done = true;
          const pts = Tk.helped ? 1 : Math.max(1, 3 - Tk.wrongs - Tk.hints);
          audio.sfx('correct');
          ui.sparkle(at || work, 16);
          ui.ripple(ui.center(at || work));
          ui.floatText(ui.center(at || work), '+' + pts, 'pts');
          ui.restart($('#trailKid'), 'hop');
          G.say(text, { mood: 'cheer', keepZig: false });
          finish();
        },
        wrong(text, at) {
          if (Tk.done || !api.isCurrent()) return;
          dropListen();
          Tk.wrongs++;
          audio.sfx('gentle');
          setTimeout(() => audio.sfx('spin'), 120);
          if (at) ui.shake(at);
          ui.restart($('#trailKid'), 'wobble');
          Tk.hintLevel = Math.min(3, Tk.hintLevel + 1);
          const h = task.hint(Tk.hintLevel);
          const lead = text || M.pick(AP.LEAD_WRONG);
          G.say(lead + '\n' + h, { mood: 'think', keepZig: !!task.judSay });
          if (Tk.wrongs >= 3) G.setNext('ให้โปรโปรช่วย', help);
        },
        nudge(text, at) {
          if (Tk.done || !api.isCurrent()) return;
          dropListen();
          if (at) ui.shake(at);
          audio.sfx('tick');
          G.say(text, { mood: 'think', keepZig: !!task.judSay });
        }
      };
      function help() {
        if (Tk.done) return;
        Tk.done = true;
        Tk.helped = true;
        try { if (task.solve) task.solve(api); } catch (e) { console.error(e); }
        work.classList.add('helped');
        audio.sfx('hint');
        G.say('ไม่เป็นไรนะ มาดูด้วยกัน!\n' + task.answer, { mood: 'happy' });
        finish();
      }
      run.cur.hint = () => {
        if (Tk.done) return;
        Tk.hints++;
        Tk.hintLevel = Math.min(3, Tk.hintLevel + 1);
        audio.sfx('hint');
        G.say(task.hint(Tk.hintLevel), { mood: 'think', keepZig: !!task.judSay });
        if (Tk.hintLevel >= 3 && Tk.wrongs >= 1) G.setNext('ให้โปรโปรช่วย', help);
      };

      task.render(inner, api);
      fitWork();
      setTimeout(fitWork, 300); setTimeout(fitWork, 900);
      if (task.judSay) {
        G.say(task.judSay, { who: 'zig', mood: 'laugh' });
        listenCb = () => { listenCb = null; G.say(task.say, { mood: 'talk', keepZig: true }); };
        G.setNext('ฟังโปรโปร', listenCb, true);
      } else {
        G.say(task.say, { mood: 'talk' });
      }
    });
  }

  /* ── ปรับระดับตามความเข้าใจ ไม่ใช่ความเร็ว ── */
  function adapt(Tk) {
    if (Tk.wrongs === 0 && Tk.hints === 0) {
      run.streak++;
      if (run.streak >= 2 && run.level < 3) {
        run.level++; run.streak = 0;
        setTimeout(() => { ui.toast('ระดับ ' + run.level + '! ภารกิจต่อไปท้าทายขึ้น'); audio.sfx('unlock'); }, 700);
      }
    } else {
      run.streak = 0;
      if ((Tk.wrongs >= 2 || Tk.helped) && run.level > 1) {
        run.level--;
        setTimeout(() => ui.toast('ลดระดับลงหน่อย มาฝึกแบบที่ง่ายขึ้นก่อนนะ'), 700);
      }
    }
    paintLevel();
  }

  $('#btnHint').addEventListener('click', () => { if (run && run.cur && run.cur.hint) run.cur.hint(); });
  $('#btnPlayHome').addEventListener('click', () => {
    audio.sfx('click');
    confirmBox('กลับแผนที่? เครื่องเล่นนี้จะเริ่มใหม่ครั้งหน้านะ', () => {
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
    G.say(stars === 3 ? 'สุดยอด! ซ่อม' + st.name + 'ได้เป๊ะที่สุด!' : 'ซ่อมเสร็จแล้ว! เก่งมากที่สู้จนจบ!', { mood: 'cheer' });

    const recs = Object.keys(run.skills).filter(k => run.skills[k].ok / run.skills[k].total < 0.7).map(k => SKILLS[k].rec);
    let h = '<div class="res-band">' + art.rainbowBand(300, 24) + '</div>' +
      '<div class="res-flag">' + art.flag() + '</div>' +
      '<div class="res-head">เครื่องเล่นที่ ' + st.id + ' ' + st.name + '</div>' +
      '<div class="res-stars">' + art.stars(stars, 3, 'pop-in') + '</div>' +
      '<div class="res-pts">ได้ <b>' + pts + '</b> จาก ' + max + ' คะแนน</div>' +
      '<div class="res-sec"><h4>สิ่งที่ได้เรียนรู้</h4><ul>' + st.recap.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    if (recs.length) h += '<div class="res-sec tip"><h4>ฝึกเพิ่มอีกนิด</h4><ul>' + recs.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    if (S.settings.teacher) h += '<div class="res-sec teach"><h4>คำถามชวนคิด (ครู)</h4><ul>' + st.teacher.map(t => '<li>' + ui.rich(t) + '</li>').join('') + '</ul></div>';
    h += '<p class="res-rule">ทำถูกครั้งแรก 3 คะแนน · ใช้คำใบ้/ลองใหม่ 2 คะแนน · ทำสำเร็จได้อย่างน้อย 1 คะแนน<br>ดาว 3 ดวง = 85% ขึ้นไป · 2 ดวง = 60% ขึ้นไป · ซ่อมสำเร็จได้ 1 ดาวเสมอ</p>';
    h += '<div class="res-btns">' +
      '<button class="btn btn-soft" id="resReplay">' + art.icon('refresh') + '<span>เล่นอีกรอบ</span></button>' +
      (st.final ? '<button class="btn btn-go" id="resFinal">' + art.icon('trophy') + '<span>เปิดสวนสนุก!</span></button>'
                : '<button class="btn btn-go" id="resMap">' + art.icon('map') + '<span>' + (firstClear ? 'ไปเครื่องเล่นต่อไป' : 'กลับแผนที่') + '</span></button>') +
      '</div>';
    $('#resBody').innerHTML = h;
    ui.openOv('#ovResult');
    document.querySelectorAll('#resBody .star.on').forEach((s, i) => setTimeout(() => { s.classList.add('shown'); audio.sfx('star'); }, 450 + i * 380));
    $('#resReplay').addEventListener('click', () => { ui.closeOv('#ovResult'); playStage(st.id); });
    const m = $('#resMap');
    if (m) m.addEventListener('click', () => { ui.closeOv('#ovResult'); if (firstClear && st.id < STAGES.length) audio.sfx('unlock'); goMap(); });
    const f = $('#resFinal');
    if (f) f.addEventListener('click', () => { ui.closeOv('#ovResult'); showFinal(); });
  }

  /* ═════════ FINAL : ปราสาทยักษ์ เปิดสวนสนุกอีกครั้ง ═════════ */
  async function showFinal() {
    S.finished = true; save();
    ui.show('scr-final');
    document.body.dataset.stage = '6';
    audio.music('title');
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
    const bal = ['#ff5a4e', '#ffd23f', '#3ba8ff', '#ff5fa2', '#3ccf7a'].map((c, i) => '<span class="sc-bal b' + i + '">' + art.balloon(c) + '</span>').join('');
    $('#finalBody').innerHTML =
      '<div class="scene"><div class="sc-castle">' + art.grandCastle() + '</div>' + bal +
        '<div class="sc-kid">' + art.kid('cheer', 'walk') + '</div>' +
        '<div class="sc-pro">' + art.pro('cheer') + '</div><div class="sc-zig">' + art.zig('happy') + '</div></div>' +
      '<h2 class="final-title">สวนสนุกเมืองมุมเปิดแล้ว!</h2>' +
      '<div class="final-stars">' + art.star(true) + '<b>' + totalStars() + '</b> / ' + MAX_STARS + ' ดาว</div>' +
      '<div class="final-cert"><h4>ใบประกาศนักซ่อมมุมมือโปร</h4>' + bars +
        '<p class="cert-note">วัดจากการทำถูกในครั้งแรกโดยไม่ใช้คำใบ้</p></div>' +
      (weak.length ? '<div class="res-sec tip"><h4>แนะนำให้ฝึกเพิ่ม</h4><ul>' + weak.map(k => '<li>' + ui.rich(SKILLS[k].rec) + '</li>').join('') + '</ul></div>' : '') +
      '<div class="res-btns"><button class="btn btn-go" id="finMap">' + art.icon('map') + '<span>กลับแผนที่</span></button></div>';
    $('#finMap').addEventListener('click', () => goMap());
    ui.confetti(70);
    audio.sfx('fanfare');
    G.show();
    await G.dialog(STAGES[STAGES.length - 1].outro);
    G.say('เลือกเครื่องเล่นไหนก็เล่นซ้ำได้ เก็บดาวให้ครบ ' + MAX_STARS + ' ดวงเลย!', { mood: 'happy', keepZig: true });
  }

  /* ═════════ NOTEBOOK / SETTINGS / CONFIRM ═════════ */
  let bookPage = 0;
  const bookOpen = st => S.settings.teacher || S.stages[st.id] || (run && run.st.id === st.id);
  function openBook() {
    audio.sfx('pop', 2);
    $('#bookTabs').innerHTML = STAGES.map((st, i) =>
      '<button class="book-tab' + (i === bookPage ? ' active' : '') + (bookOpen(st) ? '' : ' locked') + '" data-i="' + i + '" style="--c:' + st.color + '">' +
      (bookOpen(st) ? st.id : art.icon('lock')) + '</button>').join('') +
      '<button class="book-tab proti-tab' + (bookPage === 99 ? ' active' : '') + '" data-i="99" style="--c:#2d1b4e" aria-label="แผนภาพโพรแทรกเตอร์">' + art.icon('proti') + '</button>';
    paintBook();
    ui.openOv('#ovBook');
  }
  function paintBook() {
    if (bookPage === 99) {
      $('#bookBody').innerHTML = '<h3>โพรแทรกเตอร์ของโปรโปร</h3><p class="book-topic">ส่วนต่าง ๆ ที่ต้องจำ</p>' + art.protractor({ lite: true, hl: [] }) +
        '<ul class="book-list"><li><b class="dot r"></b> **จุดกึ่งกลาง** ทับจุดยอดมุม</li><li><b class="dot k"></b> **เส้นฐาน** ทับแขนมุม</li><li><b class="dot b"></b> {out} เริ่ม 0 ทางขวา</li><li><b class="dot o"></b> {in} เริ่ม 0 ทางซ้าย</li></ul>'.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\{out\}/g, '<span class="scp sc-out">สเกลนอก</span>').replace(/\{in\}/g, '<span class="scp sc-in">สเกลใน</span>');
    } else {
      const st = STAGES[bookPage];
      $('#bookBody').innerHTML = '<h3>' + st.name + '</h3><p class="book-topic">' + st.topic + '</p>' +
        (bookOpen(st) ? st.book.map(t => '<p>' + ui.rich(t) + '</p>').join('') : '<p class="book-locked">' + art.icon('lock') + ' เล่นเครื่องเล่นนี้ก่อน แล้วหน้านี้จะเปิดเอง</p>');
    }
    document.querySelectorAll('.book-tab').forEach(t => t.classList.toggle('active', +t.dataset.i === bookPage));
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
    $('#setHype').checked = S.settings.hype;
    $('#setTeacher').checked = S.settings.teacher;
    const vs = audio.voices();
    $('#setVoiceName').innerHTML = '<option value="">อัตโนมัติ (เลือกเสียงที่ดีที่สุด)</option>' +
      vs.map(n => '<option value="' + ui.esc(n) + '"' + (n === S.settings.voiceName ? ' selected' : '') + '>' + ui.esc(n) + '</option>').join('');
    $('#voiceNote').textContent = !audio.canSpeak() ? 'อุปกรณ์นี้ไม่รองรับเสียงพากย์'
      : audio.hasThaiVoice() ? 'กำลังใช้: ' + audio.voiceName() : 'ไม่พบเสียงภาษาไทยในเครื่อง แนะนำเปิดด้วย Microsoft Edge หรือ Chrome';
    ui.openOv('#ovSettings');
  }
  document.querySelectorAll('.btn-settings').forEach(b => b.addEventListener('click', openSettings));
  $('#setVol').addEventListener('input', e => { S.settings.vol = e.target.value / 100; applySettings(); save(); });
  $('#setVol').addEventListener('change', () => audio.sfx('pop', 4));
  $('#setMusic').addEventListener('change', e => { S.settings.music = e.target.checked; applySettings(); save(); });
  $('#setVoice').addEventListener('change', e => { S.settings.voice = e.target.checked; applySettings(); save(); if (e.target.checked) audio.speak('เปิดเสียงพากย์แล้ว! ลุยกันเลย!', { emo: 'hype' }); });
  $('#setHype').addEventListener('change', e => { S.settings.hype = e.target.checked; applySettings(); save(); });
  $('#setVoiceName').addEventListener('change', e => { S.settings.voiceName = e.target.value; applySettings(); save(); $('#voiceNote').textContent = 'กำลังใช้: ' + audio.voiceName(); });
  $('#setTest').addEventListener('click', () => audio.speak('โปรโปรมาแล้ว! มุมนี้ 45 องศา! วางจุดกึ่งกลางทับจุดยอด! ไปซ่อมสวนสนุกกันเลย!', { emo: 'hype' }));
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
      audio.music('title');
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
    $('#trailFlag').innerHTML = art.flag();
    $('#trailKid').innerHTML = art.kid('happy', 'mini');
    $('#bgPark').innerHTML = art.parkBackdrop();
    const bal = ['#ff5a4e', '#ffd23f', '#3ba8ff', '#ff5fa2', '#3ccf7a', '#8b5cf6'];
    $('#bgFloat').innerHTML = bal.map((c, i) => '<span class="fl f' + i + '">' + art.balloon(c) + '</span>').join('');
  }
  document.addEventListener('pointerdown', () => {
    audio.unlock();
    if ($('#scr-title').classList.contains('active') && document.body.classList.contains('authed')) audio.music('title');
  }, { once: true });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !document.querySelector('.ov:not(.hidden)') && G.nextCb && document.activeElement === document.body) {
      e.preventDefault();
      G.fireNext();
    }
  });

  /* สำหรับทดสอบเท่านั้น: เปิดด้วย ?dev=1 */
  if (/[?&]dev=1/.test(location.search)) {
    window.APdev = {
      playStage, goMap, showFinal, run: () => run, state: () => S,
      solve() { if (run && run.cur) run.cur.task.solve(); },
      /* preview(เครื่องเล่น, ระดับ, ลำดับ) — ลำดับติดลบ = ฝึกซ้อม (-1 = ข้อแรก) */
      preview(id, level, i) {
        const st = STAGES[id - 1];
        run = { st, token: {}, level, streak: 0, results: [], skills: {}, total: 1 };
        ui.show('scr-play'); G.show(); paintLevel();
        document.body.dataset.stage = id;
        return runTask(i < 0 ? st.learn[-i - 1]() : st.gen(level, i, run), 0, true);
      },
      fakeFinish(id, pts) {
        const st = STAGES[id - 1];
        run = { st, token: {}, level: 1, streak: 0, skills: {}, total: pts.length, results: pts.map(p => ({ pts: p, skill: 'measure', first: p === 3 })) };
        pts.forEach(p => { const s = run.skills.measure = run.skills.measure || { ok: 0, total: 0 }; s.total++; if (p === 3) s.ok++; });
        ui.show('scr-play'); G.show();
        finishStage();
      }
    };
  }

  decorate();
  G.init();
  applySettings();
  initTitle();
  setTimeout(() => { document.body.classList.add('ready'); $('#loading').classList.add('gone'); }, 400);
})();
