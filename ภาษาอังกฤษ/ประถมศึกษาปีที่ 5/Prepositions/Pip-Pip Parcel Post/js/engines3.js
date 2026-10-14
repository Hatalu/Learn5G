/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — กลไกภารกิจ (ส่วนที่ 3)
     say   : ฝึกพูด — ฟังปิ๊บ แล้วพูดตาม/พูดบรรยายภาพ/ตอบคำถาม (Speaking)
     spell : สะกดคำเล็ก ๆ ด้วยแป้นตัวอักษร (Writing)
     build : เรียงคำเป็นประโยค / เขียนตามคำบอก (Writing + Listening)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { art, audio, ui, scene: SC, ENG, cards, speech } = PP;
  const D = PP.D;
  const { esc, wait, h } = ui;
  const { hiPrep, dots } = cards;

  /* ═══════════ say : ฝึกพูด ═══════════ */
  ENG.say = (T, c) => {
    const { stage, panel } = c;
    let ii = 0, it, qMiss, locked, busy = false, selfUrl = null, shown = null, noScore = false;
    c.dbg(() => ({ it, T, mode: speech.mode() }));
    const MODE_TXT = { asr: 'ตรวจด้วยไมค์', rec: 'อัดเสียงแล้วเทียบกับปิ๊บ', tap: 'พูดตามปิ๊บ (ไม่ตรวจ)' };

    function frameHTML(done) {
      if (it.mode === 'describe' && !done) return '<div class="say-text frame">' + esc(it.before) + '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' + esc(it.after) + '</div>';
      if (it.mode === 'answer' && !done) return '<div class="say-ask"><b>' + esc(it.ask.en) + '</b><small>' + esc(it.ask.th) + '</small></div><div class="say-text frame">' + esc(it.frame) + '</div>';
      return '<div class="say-text">' + ui.karaokeHTML(it.text) + '</div>';
    }
    function load() {
      it = T.items[ii]; qMiss = 0; locked = false; busy = false; shown = null; noScore = false;
      c.resetHint();
      const md = speech.mode();
      const tips = (it.text.match(/between|above|under/i) || []).map(w => w.toLowerCase());
      stage.innerHTML = '<div class="say-stage"><div class="say-pic">' + it.pic + '</div><div class="say-card">' + frameHTML(false) + '<div class="heard-row"></div><div class="tip-row">' +
        tips.map(w => '<button type="button" class="tip" data-w="' + w + '"><span>เน้นเสียง</span> <b>' + D.STRESS[w] + '</b>' + art.icon('speaker') + '</button>').join('') + '</div></div></div>';
      panel.innerHTML = '<div class="q-card">' + dots(ii, T.items.length) + '<p class="q-th">' + esc(it.inst) + '</p><div class="q-listen"></div>' +
        '<div class="mic-zone"><button type="button" class="mic idle" aria-label="พูด"><span class="mic-ic">' + art.icon('mic') + '</span><span class="mic-ring"></span></button><div class="mic-state">กดไมค์แล้วพูด</div></div>' +
        '<div class="mode-chip" data-m="' + md + '">' + art.icon(md === 'tap' ? 'speaker' : 'mic') + '<span>' + MODE_TXT[md] + '</span></div><div class="say-act"></div><div class="q-why hidden"></div></div>';
      const listenHost = panel.querySelector('.q-listen');
      const sbtn = ui.speakBtns(listenHost, { id: it.audioId, text: it.text, who: 'pip', onProgress: ui.karaoke(stage.querySelector('.say-card'), true) });
      stage.querySelectorAll('.tip').forEach(t => t.addEventListener('click', () => { audio.sfx('pop'); audio.play('w_' + t.dataset.w, t.dataset.w, 'pip', { rate: 0.8 }); }));
      panel.querySelector('.mic').addEventListener('click', onMic);
      /* เริ่ม: echo/answer ให้ปิ๊บพูดก่อน */
      (async () => {
        if (it.mode === 'echo') {
          await c.say({ id: it.audioId, en: it.text, th: it.th || '', mood: 'happy' });
          if (c.alive()) c.say({ id: 'l_sayIt', en: 'Now you say it!', th: 'ทีนี้ถึงตาเธอพูด!' });
        } else if (it.mode === 'answer') {
          await c.say({ id: it.ask.id, en: it.ask.en, th: it.ask.th });
        } else {
          await c.say({ id: 'l_sayIt', en: 'Look and say it!', th: 'ดูภาพแล้วพูดเป็นประโยค!' });
        }
        if (c.alive()) panel.querySelector('.mic').classList.add('nudge');
      })();
    }
    const state = (txt, cls) => { const m = panel.querySelector('.mic'); m.className = 'mic ' + (cls || 'idle'); panel.querySelector('.mic-state').textContent = txt; };

    function mark(res) {
      /* แสดงผลทีละคำบนประโยคเป้าหมาย */
      const card = stage.querySelector('.say-card');
      const holder = card.querySelector('.say-text');
      if (holder) holder.className = 'say-text';
      if (holder) holder.innerHTML = res.words.map(x => '<span class="kw sw ' + (x.hit ? 'hit' : 'miss') + '">' + esc(x.w) + '</span>').join(' ');
      card.querySelector('.heard-row').innerHTML = res.heard ? '<span class="heard"><small>ปิ๊บได้ยิน</small> ' + esc(res.heard) + '</span>' : '';
    }
    function evalAlts(alts) {
      let best = null;
      it.targets.forEach(t => {
        const r = speech.scoreSpeech(t, alts, it.keys);
        r.target = t;
        if (!best || (r.ok ? 2 : 0) + r.score > (best.ok ? 2 : 0) + best.score) best = r;
      });
      return best;
    }
    async function succeed(how) {
      locked = true;
      c.flag('speak' + ii, how);
      state('เก่งมาก!', 'ok');
      audio.sfx('check'); ui.sparkle(panel.querySelector('.mic'), 18);
      const full = stage.querySelector('.say-card');
      full.innerHTML = '<div class="say-text ok">' + hiPrep(it.text, it.keys) + '</div><div class="heard-row"></div><div class="tip-row"></div>';
      full.classList.add('stamp');
      const wy = panel.querySelector('.q-why'); wy.innerHTML = how === 'tap' ? '<small>โหมดพูดตามเสียง: ไม่ได้ตรวจการออกเสียง</small>' : '<span class="why-en">' + hiPrep(it.text, it.keys) + '</span>'; wy.classList.remove('hidden');
      if (ii === T.items.length - 1) return c.win({ id: it.audioId, en: it.text, th: it.th || '' }, panel.querySelector('.mic'));
      await c.say({ id: it.audioId, en: it.text, th: '', mood: 'cheer' });
      if (!c.alive()) return;
      await wait(250);
      ii++; load();
    }
    async function failTry(res, reason) {
      qMiss++;
      busy = false;
      state(reason || 'ลองอีกครั้งนะ', 'idle');
      if (res) mark(res);
      c.miss(res && res.words ? 'คำที่ยังไม่ชัด: ' + res.words.filter(x => !x.hit && ['the', 'a', 'an'].indexOf(x.w) < 0).map(x => x.w).join(', ') + ' — ฟังช้า ๆ แล้วลองอีกที' : 'ปิ๊บยังฟังไม่ชัด ลองพูดดังขึ้นอีกนิดนะ', null);
      if (qMiss >= 1) c.hint(Math.min(3, qMiss));
      if (qMiss >= 2) showSkip();
    }
    function showSkip() {
      const act = panel.querySelector('.say-act');
      if (act.querySelector('.skip')) return;
      const b = h('button', 'btn btn-soft btn-sm skip', art.icon('right') + '<span>ข้าม (ไม่เป็นไร)</span>');
      b.type = 'button';
      b.addEventListener('click', () => { qMiss = Math.max(qMiss, 3); succeed('skip'); });
      act.appendChild(b);
    }
    async function onMic() {
      if (locked || busy) return;
      audio.unlock(); ui.guide.hush(); audio.stopVoice();
      const md = speech.mode();
      busy = true;
      panel.querySelector('.mic').classList.remove('nudge');
      if (md === 'asr') {
        audio.sfx('mic'); state('ปิ๊บกำลังฟัง...', 'listening');
        const r = await speech.listenOnce({ target: it.text, onInterim: txt => { stage.querySelector('.heard-row').innerHTML = '<span class="heard live">' + esc(txt) + '</span>'; } });
        audio.sfx('micOff');
        if (!c.alive()) return;
        if (r.error) {
          if (r.error === 'not-allowed' || r.error === 'service-not-allowed' || r.error === 'audio-capture' || r.error === 'network' || r.error === 'unsupported' || r.error === 'start') {
            busy = false; state('ใช้ไมค์ไม่ได้ ลองโหมดอื่น', 'idle');
            ui.toast('ใช้ไมค์ตรวจเสียงไม่ได้ — เปลี่ยนเป็นโหมดอัดเสียงแทน');
            panel.querySelector('.mode-chip').remove(); load(); return;
          }
          busy = false; state('ปิ๊บยังไม่ได้ยิน กดไมค์ลองอีกที', 'idle');
          c.say({ id: 'l_micRetry', en: "I can't hear you. Try again!", th: 'ปิ๊บยังไม่ได้ยิน ลองอีกที!' });
          return;
        }
        const res = evalAlts(r.alts);
        mark(res);
        if (res.ok) return succeed('asr');
        return failTry(res, 'เกือบแล้ว! กดไมค์ลองอีกที');
      }
      if (md === 'rec') {
        const okRec = await speech.startRecord();
        if (!okRec) { busy = false; panel.querySelector('.mode-chip').remove(); load(); return; }
        audio.sfx('mic'); state('กำลังอัด... แตะอีกครั้งเมื่อพูดเสร็จ', 'listening');
        busy = false;
        const stopper = async () => {
          panel.querySelector('.mic').removeEventListener('click', stopper);
          clearTimeout(tm);
          busy = true;
          const url = await speech.stopRecord();
          audio.sfx('micOff'); state('ฟังเสียงตัวเอง', 'idle');
          panel.querySelector('.mic').addEventListener('click', onMic);
          selfCheck(url);
        };
        const tm = setTimeout(stopper, 7000);
        panel.querySelector('.mic').removeEventListener('click', onMic);
        panel.querySelector('.mic').addEventListener('click', stopper);
        return;
      }
      /* tap: พูดตามปิ๊บ แล้วกดว่าพูดแล้ว */
      await audio.play(it.audioId, it.text, 'pip', {});
      busy = false;
      const act = panel.querySelector('.say-act');
      act.innerHTML = '<button type="button" class="btn btn-go said">' + art.icon('check') + '<span>ฉันพูดแล้ว</span></button>';
      state('พูดตามปิ๊บ แล้วกดปุ่ม', 'idle');
      act.querySelector('.said').addEventListener('click', () => succeed('tap'));
    }
    function selfCheck(url) {
      busy = false;
      const act = panel.querySelector('.say-act');
      act.innerHTML = '<div class="self-box"><small>ฟังเสียงเธอ แล้วฟังเสียงปิ๊บ ใกล้เคียงกันไหม?</small><div class="self-btns">' +
        '<button type="button" class="btn btn-soft btn-sm me">' + art.icon('play') + '<span>เสียงเธอ</span></button>' +
        '<button type="button" class="btn btn-soft btn-sm pipv">' + art.icon('speaker') + '<span>เสียงปิ๊บ</span></button>' +
        '<button type="button" class="btn btn-go btn-sm okk">' + art.icon('check') + '<span>ใกล้เคียง!</span></button>' +
        '<button type="button" class="btn btn-soft btn-sm again">' + art.icon('refresh') + '<span>อัดใหม่</span></button></div></div>';
      act.querySelector('.me').addEventListener('click', () => { if (url) { const a = new Audio(url); a.play().catch(() => {}); } });
      act.querySelector('.pipv').addEventListener('click', () => audio.play(it.audioId, it.text, 'pip'));
      act.querySelector('.okk').addEventListener('click', () => succeed('rec'));
      act.querySelector('.again').addEventListener('click', () => { act.innerHTML = ''; state('กดไมค์แล้วพูด', 'idle'); });
    }
    c.hintText(lv => ['ฟังปิ๊บอีกครั้ง แล้วพูดช้า ๆ ทีละคำ', 'ลองกดรูปเต่าเพื่อฟังช้า ๆ ปิ๊บไฮไลต์คำที่ยังไม่ชัดให้แล้ว', 'พูดตามทีละคำ: ' + (it ? it.text : '')][Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (lv === 1) { const s = stage.querySelector('.say-card'); audio.play(it.audioId, it.text, 'pip', { rate: 0.7, onProgress: ui.karaoke(s, true) }); }
      if (lv >= 3) showSkip();
    });
    /* ทดสอบ/ผู้พัฒนา: ฉีดผลฟังโดยตรง */
    c.hook('say', alts => { const res = evalAlts([].concat(alts)); mark(res); if (res.ok) succeed('asr'); else failTry(res); return res; });
    load();
  };

  /* ═══════════ spell : สะกดคำ ═══════════ */
  ENG.spell = (T, c) => {
    const { stage, panel } = c;
    let ii = 0, it, slots, tiles, used, qMiss, locked;
    const POOL = 'abcdefghijklmnopqrstuvwxyz'.split('');
    c.dbg(() => ({ it, slots }));
    function load() {
      it = T.items[ii]; qMiss = 0; locked = false; c.resetHint();
      const w = it.word.toLowerCase();
      slots = Array(w.length).fill(null);
      const extra = D.sample(POOL.filter(x => w.indexOf(x) < 0), Math.min(3, Math.max(2, 8 - w.length)));
      tiles = D.shuffle(w.split('').map((ch, i) => ({ ch, id: 't' + i })).concat(extra.map((ch, i) => ({ ch, id: 'x' + i }))));
      used = {};
      stage.innerHTML = '<div class="spell-stage"><div class="spell-pic">' + it.pic + '</div><div class="spell-sent">' + hiPrep(it.sentenceBlank, []) + '</div><div class="slots"></div></div>';
      panel.innerHTML = '<div class="q-card">' + dots(ii, T.items.length) + '<p class="q-th">' + esc(it.inst || 'สะกดคำเล็ก ๆ ที่หายไปให้ถูก') + '</p><div class="q-listen"></div><div class="bank"></div><div class="spell-act"><button type="button" class="btn btn-soft btn-sm clr">' + art.icon('undo') + '<span>ลบ</span></button></div><div class="q-why hidden"></div></div>';
      ui.speakBtns(panel.querySelector('.q-listen'), { id: 'w_' + w, text: w, who: 'pip' });
      panel.querySelector('.clr').addEventListener('click', back);
      draw();
      c.say({ id: null, en: it.sayText || 'Spell the little word!', th: it.th || 'สะกดคำเล็ก ๆ ให้ถูก' });
    }
    function draw() {
      stage.querySelector('.slots').innerHTML = slots.map((s, i) => '<button type="button" class="slot-l' + (s ? ' fill' : '') + '" data-i="' + i + '">' + (s ? s.ch : '') + '</button>').join('');
      stage.querySelectorAll('.slot-l.fill').forEach(b => b.addEventListener('click', () => { if (locked) return; const i = +b.dataset.i; used[slots[i].id] = false; slots[i] = null; audio.sfx('tick'); draw(); }));
      panel.querySelector('.bank').innerHTML = tiles.map(t => '<button type="button" class="ltile' + (used[t.id] ? ' used' : '') + '" data-id="' + t.id + '"' + (used[t.id] ? ' disabled' : '') + '>' + t.ch + '</button>').join('');
      panel.querySelectorAll('.ltile').forEach(b => b.addEventListener('click', () => put(b.dataset.id)));
    }
    function put(id) {
      if (locked) return;
      const k = slots.findIndex(s => !s);
      if (k < 0) return;
      const t = tiles.find(x => x.id === id);
      if (!t || used[id]) return;
      used[id] = true; slots[k] = t; audio.sfx('tile'); draw();
      if (slots.every(Boolean)) check();
    }
    function back() {
      if (locked) return;
      for (let i = slots.length - 1; i >= 0; i--) if (slots[i]) { used[slots[i].id] = false; slots[i] = null; break; }
      audio.sfx('tick'); draw();
    }
    async function check() {
      const typed = slots.map(s => s.ch).join('');
      locked = true;
      await wait(250);
      if (!c.alive()) return;
      if (typed === it.word.toLowerCase()) {
        audio.sfx('check'); ui.sparkle(stage.querySelector('.slots'), 18);
        stage.querySelectorAll('.slot-l').forEach(b => b.classList.add('ok'));
        stage.querySelector('.spell-sent').innerHTML = hiPrep(it.sentence, [it.word]);
        const wy = panel.querySelector('.q-why'); wy.innerHTML = '<span class="why-en">' + hiPrep(it.sentence, [it.word]) + '</span>'; wy.classList.remove('hidden');
        if (ii === T.items.length - 1) return c.win({ id: it.audioId, en: it.sentence, th: '' }, stage.querySelector('.slots'));
        await c.say({ id: it.audioId, en: it.sentence, th: '', mood: 'cheer' });
        if (!c.alive()) return;
        await wait(200);
        ii++; load();
      } else {
        qMiss++;
        stage.querySelectorAll('.slot-l').forEach(b => b.classList.add('bad'));
        ui.shake(stage.querySelector('.slots'));
        await wait(700);
        slots.fill(null); used = {}; locked = false; draw();
        c.miss('สะกด "' + typed + '" ยังไม่ถูก ลองดูภาพและฟังคำอีกครั้ง', null);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
      }
    }
    document.addEventListener('keydown', onKey);
    function onKey(e) {
      if (!c.alive() || !document.body.contains(stage)) { document.removeEventListener('keydown', onKey); return; }
      if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === 'Backspace') { back(); e.preventDefault(); return; }
      if (/^[a-zA-Z]$/.test(e.key)) {
        const t = tiles.find(x => x.ch === e.key.toLowerCase() && !used[x.id]);
        if (t) put(t.id);
      }
    }
    c.hintText(lv => (it.hints || [])[Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      if (lv === 2) audio.play('w_' + it.word.toLowerCase(), it.word, 'pip');
      if (lv >= 2) { /* ใส่ตัวแรกให้ */
        const w = it.word.toLowerCase();
        if (!slots[0]) { const t = tiles.find(x => x.ch === w[0] && !used[x.id]); if (t) { used[t.id] = true; slots[0] = t; draw(); } }
      }
      if (lv >= 3) { const w = it.word.toLowerCase(); for (let i = 0; i < Math.ceil(w.length / 2); i++) { if (!slots[i] || slots[i].ch !== w[i]) { if (slots[i]) used[slots[i].id] = false; const t = tiles.find(x => x.ch === w[i] && !used[x.id]); if (t) { used[t.id] = true; slots[i] = t; } } } draw(); }
    });
    load();
  };

  /* ═══════════ build : เรียงคำเป็นประโยค ═══════════ */
  ENG.build = (T, c) => {
    const { stage, panel } = c;
    let ii = 0, it, tiles, placed, qMiss, locked;
    c.dbg(() => ({ it, placed }));
    function load() {
      it = T.items[ii]; qMiss = 0; locked = false; c.resetHint();
      const ws = it.words.slice();
      tiles = D.shuffle(ws.map((w, i) => ({ w, id: 'w' + i, ok: i })).concat((it.extra || []).map((w, i) => ({ w, id: 'x' + i, ok: -1 }))));
      placed = [];
      const pic = it.dictate
        ? '<div class="dict-box"><div class="dict-ic">' + art.icon('ear') + '</div><small>ฟังแล้วเรียงคำตามที่ได้ยิน</small></div>'
        : '<div class="build-pic">' + it.pic + '</div>';
      stage.innerHTML = '<div class="build-stage">' + pic + '<div class="answer-line" aria-label="ประโยคของเธอ"></div></div>';
      panel.innerHTML = '<div class="q-card">' + dots(ii, T.items.length) + '<p class="q-th">' + esc(it.inst || 'แตะคำเรียงเป็นประโยค') + '</p><div class="q-listen"></div><div class="word-bank"></div><div class="spell-act"><button type="button" class="btn btn-soft btn-sm clr">' + art.icon('undo') + '<span>ล้าง</span></button><button type="button" class="btn btn-go btn-sm chk">' + art.icon('check') + '<span>ตรวจ</span></button></div><div class="q-why hidden"></div></div>';
      ui.speakBtns(panel.querySelector('.q-listen'), { id: it.audioId, text: it.text, who: 'pip' });
      panel.querySelector('.clr').addEventListener('click', () => { if (locked) return; placed = []; audio.sfx('tick'); draw(); });
      panel.querySelector('.chk').addEventListener('click', () => check());
      draw();
      if (it.dictate) c.say({ id: it.audioId, en: it.text, th: 'ฟังแล้วเขียนตามที่ได้ยิน', hide: true });
      else c.say({ id: null, en: it.sayText || 'Make the sentence!', th: it.th || 'เรียงคำให้เป็นประโยคตามภาพ' });
    }
    function draw() {
      stage.querySelector('.answer-line').innerHTML = placed.length ? placed.map((t, i) => '<button type="button" class="wt placed' + (t.bad ? ' bad' : '') + '" data-id="' + t.id + '">' + esc(t.w) + '</button>').join('') : '<span class="al-ph">แตะคำด้านล่าง</span>';
      stage.querySelectorAll('.wt.placed').forEach(b => b.addEventListener('click', () => { if (locked) return; const k = placed.findIndex(t => t.id === b.dataset.id); if (k >= 0) { placed.splice(k, 1); audio.sfx('tick'); draw(); } }));
      const bank = panel.querySelector('.word-bank');
      bank.innerHTML = tiles.map(t => '<button type="button" class="wt' + (placed.indexOf(t) >= 0 ? ' used' : '') + '" data-id="' + t.id + '"' + (placed.indexOf(t) >= 0 ? ' disabled' : '') + '>' + esc(t.w) + '</button>').join('');
      bank.querySelectorAll('.wt').forEach(b => b.addEventListener('click', () => {
        if (locked) return;
        const t = tiles.find(x => x.id === b.dataset.id); if (!t || placed.indexOf(t) >= 0) return;
        placed.push(t); audio.sfx('tile'); draw();
        if (placed.length === it.words.length) check();
      }));
    }
    async function check() {
      if (locked || placed.length === 0) return;
      locked = true;
      const got = placed.map(t => t.w);
      const ok = got.length === it.words.length && got.every((w, i) => w === it.words[i]);
      await wait(200);
      if (!c.alive()) return;
      if (ok) {
        audio.sfx('check'); ui.sparkle(stage.querySelector('.answer-line'), 18);
        stage.querySelector('.answer-line').classList.add('ok');
        const wy = panel.querySelector('.q-why'); wy.innerHTML = '<span class="why-en">' + hiPrep(it.text, it.keys || []) + '</span>'; wy.classList.remove('hidden');
        ui.guide.reveal();
        if (ii === T.items.length - 1) return c.win({ id: it.audioId, en: it.text, th: '' }, stage.querySelector('.answer-line'));
        await c.say({ id: it.audioId, en: it.text, th: '', mood: 'cheer' });
        if (!c.alive()) return;
        await wait(200);
        ii++; load();
      } else {
        qMiss++;
        placed.forEach((t, i) => { t.bad = t.w !== it.words[i]; });
        draw(); ui.shake(stage.querySelector('.answer-line'));
        await wait(900);
        placed.forEach(t => { delete t.bad; });
        /* เก็บคำที่ถูกตำแหน่งไว้ นำคำที่ผิดออก */
        let keep = 0; while (keep < placed.length && placed[keep].w === it.words[keep]) keep++;
        placed = placed.slice(0, keep);
        locked = false; draw();
        c.miss(it.wrongText || 'ลำดับยังไม่ถูก ลองอ่านออกเสียงประโยคในใจ: ใคร/อะไร + is + คำบุพบท + ที่ตั้ง', null);
        if (qMiss >= 2) c.hint(Math.min(3, qMiss));
      }
    }
    c.hintText(lv => (it.hints || [])[Math.min(lv, 3) - 1] || ['ดูภาพแล้วเริ่มจากคำแรกของประโยค ("The" หรือ "Pip")', 'ปิ๊บทำให้คำถัดไปที่ถูกกะพริบ', 'ปิ๊บวางคำถัดไปให้แล้ว'][Math.min(lv, 3) - 1]);
    c.onHint(lv => {
      if (locked) return;
      let keep = 0; while (keep < placed.length && placed[keep].w === it.words[keep]) keep++;
      const nextT = tiles.find(t => t.ok === keep && placed.indexOf(t) < 0);
      if (lv === 2 && nextT) { const b = panel.querySelector('.wt[data-id="' + nextT.id + '"]'); if (b) b.classList.add('pulse'); }
      if (lv >= 3 && nextT) { placed = placed.slice(0, keep); placed.push(nextT); draw(); if (placed.length === it.words.length) check(); }
      if (lv >= 2 && it.dictate) ui.guide.reveal();
    });
    load();
  };
})();
