/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — ระบบฝึกพูด (ทักษะ Speaking)
   1) Speech Recognition ของเบราว์เซอร์ (en-US) ฟังว่าเด็กพูดอะไร แล้วเทียบกับประโยคเป้าหมายทีละคำ
      * ผลเป็น "ฟังออกไหม" (intelligibility) ไม่ใช่คะแนนสำเนียง · ไม่ตัดสินแรง ผิดแล้วลองใหม่ได้ ข้ามได้
      * เบราว์เซอร์บางตัว (เช่น Chrome) ส่งเสียงไปประมวลผลที่ผู้ให้บริการของเบราว์เซอร์ เกมไม่เก็บเสียงไว้
   2) ถ้าใช้ไม่ได้ (ไม่มี SR / ไม่อนุญาตไมค์ / ไม่มีเน็ต) → อัดเสียงตัวเองแล้วเล่นเทียบกับเสียงปิ๊บ แล้วเด็กตัดสินเอง
   3) ถ้าไมค์ก็ใช้ไม่ได้ → โหมดพูดตามเสียงปิ๊บ (แตะ "ฉันพูดแล้ว") บอกชัดเจนว่าไม่ได้ตรวจ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP = window.PP || {};

  /* ── ปรับข้อความให้เทียบกันได้ ── */
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  function norm(s) {
    s = String(s || '').toLowerCase().replace(/[’`]/g, "'");
    s = s.replace(/o['\s]?clock/g, 'oclock');
    s = s.replace(/\b(\d{1,2})\b/g, (m, d) => NUM[+d] != null ? NUM[+d] : m);
    s = s.replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
    return s ? s.split(' ') : [];
  }
  const OPTIONAL = { the: 1, a: 1, an: 1 };
  /* คำที่เครื่องมักฟังเพี้ยน ถือว่าตรงได้ (เฉพาะที่เสียงใกล้จริง) */
  const SOUNDS = {
    by: ['buy', 'bye', 'bi'], with: ['wit', 'wif', 'wid', 'width'], above: ['abov', 'abuv', 'a bove'], between: ['betwen', 'between', 'beetween', 'be tween'],
    under: ['onder', 'ander'], in: ['inn', 'en'], at: ['hat', 'ed'], on: ['own', 'um'], oclock: ['clock', 'oclok'], parcel: ['parcels', 'pasel'], table: ['tables'], basket: ['baskets']
  };
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 9;
    const d = Array.from({ length: m + 1 }, (_, i) => [i].concat(Array(n).fill(0)));
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  /* คำเป้าหมาย t ตรงกับคำที่ได้ยิน h ไหม
     strict = คำบุพบทหลัก (in/on/at ต้องตรงเป๊ะ เพราะเสียงใกล้กันมาก ห้ามให้ in = on) */
  function same(t, h, strict) {
    if (t === h) return true;
    if (SOUNDS[t] && SOUNDS[t].indexOf(h) >= 0 && !(strict && (t === 'in' || t === 'on' || t === 'at') )) return true;
    if (t.length >= 5 && h.length >= 4 && lev(t, h) <= 1) return true;
    if (t.length >= 8 && lev(t, h) <= 2) return true;
    return false;
  }
  /* เทียบตามลำดับ (greedy) คืน [{w, hit}] ของคำเป้าหมายทุกคำ */
  function align(tt, ht, keys) {
    let hi = 0;
    return tt.map(t => {
      const strict = keys.indexOf(t) >= 0 && (t === 'in' || t === 'on' || t === 'at');
      for (let j = hi; j < ht.length; j++) {
        if (same(t, ht[j], strict)) { hi = j + 1; return { w: t, hit: true }; }
      }
      return { w: t, hit: false };
    });
  }
  /* alts = รายการข้อความที่ได้ยิน (หลายตัวเลือกจาก SR) ; keys = คำสำคัญที่ต้องถูก */
  function scoreSpeech(target, alts, keys) {
    const tt = norm(target);
    keys = (keys || []).map(k => norm(k)).reduce((a, b) => a.concat(b), []);
    const counted = tt.filter(w => !OPTIONAL[w]);
    let best = null;
    (alts || []).forEach(a => {
      const ht = norm(a);
      const al = align(tt, ht, keys);
      const hits = al.filter(x => x.hit && !OPTIONAL[x.w]).length;
      const keyOk = keys.every(k => al.some(x => x.w === k && x.hit));
      const sc = counted.length ? hits / counted.length : 0;
      if (!best || (keyOk ? 1 : 0) + sc > (best.keyOk ? 1 : 0) + best.score) best = { text: a, words: al, score: sc, keyOk };
    });
    if (!best) return { ok: false, score: 0, keyOk: false, words: tt.map(w => ({ w, hit: false })), heard: '' };
    const ok = (best.keyOk && best.score >= 0.66) || best.score >= 0.85;
    return { ok, score: best.score, keyOk: best.keyOk, words: best.words, heard: best.text };
  }

  /* ── Speech Recognition ── */
  const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const state = { micOn: true, blocked: false, rec: null, mock: null, lastMode: null };

  function mode() {
    if (!state.micOn) return 'tap';
    if (state.mock) return 'asr';
    if (SR && !state.blocked) return 'asr';
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && window.MediaRecorder && !state.blocked) return 'rec';
    return 'tap';
  }
  /* ฟัง 1 ครั้ง → { error } หรือ { alts:[...] } */
  function listenOnce(opts) {
    opts = opts || {};
    return new Promise(resolve => {
      if (state.mock) { const v = state.mock(opts.target); setTimeout(() => resolve(v == null ? { error: 'no-speech' } : { alts: [].concat(v) }), 60); return; }
      let rec;
      try { rec = new SR(); } catch (e) { return resolve({ error: 'unsupported' }); }
      state.rec = rec;
      rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
      let got = null, finished = false, timer = null;
      const done = r => { if (finished) return; finished = true; clearTimeout(timer); state.rec = null; resolve(r); };
      rec.onresult = e => {
        const res = e.results[e.results.length - 1];
        const alts = []; for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
        got = alts;
        if (opts.onInterim) opts.onInterim(alts[0], res.isFinal);
        if (res.isFinal) { done({ alts }); try { rec.stop(); } catch (er) {} }
      };
      rec.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') state.blocked = true;
        done({ error: e.error || 'error' });
      };
      rec.onend = () => done(got ? { alts: got } : { error: 'no-speech' });
      try { rec.start(); if (opts.onStart) opts.onStart(); } catch (e) { return done({ error: 'start' }); }
      timer = setTimeout(() => { try { rec.stop(); } catch (er) {} }, opts.maxMs || 8000);
    });
  }
  function stopListening() { if (state.rec) { try { state.rec.stop(); } catch (e) {} } }

  /* ── อัดเสียงตัวเอง (โหมดสำรอง) ── */
  let recorder = null, chunks = [], stream = null;
  async function startRecord() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.start();
      return true;
    } catch (e) { state.blocked = true; return false; }
  }
  function stopRecord() {
    return new Promise(resolve => {
      if (!recorder) return resolve(null);
      recorder.onstop = () => {
        try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        recorder = null; stream = null;
        resolve(URL.createObjectURL(blob));
      };
      try { recorder.stop(); } catch (e) { resolve(null); }
    });
  }

  PP.speech = {
    norm, scoreSpeech, same, align,
    mode, listenOnce, stopListening, startRecord, stopRecord,
    state,
    setMic(on) { state.micOn = !!on; },
    set mock(fn) { state.mock = fn; },
    get mock() { return state.mock; }
  };
})();
