/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — เสียง: เอฟเฟกต์ Web Audio, เพลงประกอบ, ตัวต่อคลิปเสียงพากย์ (ElevenLabs) แบบไร้รอยต่อ
   - ถ้าคลิปโหลดไม่ได้ → ใช้เสียงอ่านของเบราว์เซอร์ (ถ้ามีเสียงไทย) → ไม่มีอะไรเลยก็ยังเล่นได้ (ตัวหนังสือครบ)
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const VOICED = root.VOICED || {};

  let ctx = null, master, sfxG, musicG, voiceG;
  const S = { vol: 0.8, music: true, voice: true, sfx: true };
  const bufCache = new Map();

  function ensure() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = S.vol; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = 0.9; sfxG.connect(master);
    musicG = ctx.createGain(); musicG.gain.value = S.music ? 0.5 : 0; musicG.connect(master);
    voiceG = ctx.createGain(); voiceG.gain.value = 1.15; voiceG.connect(master);
    return ctx;
  }
  function unlock() {
    const c = ensure();
    if (c && c.state === 'suspended') c.resume();
    return !!c;
  }

  /* ── ตัวสร้างเสียง ── */
  function tone(f, dur, o) {
    const c = ensure(); if (!c || !S.sfx) return;
    o = o || {};
    const t0 = c.currentTime + (o.at || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const peak = o.gain == null ? 0.22 : o.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (o.atk || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.dest || sfxG);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(dur, o) {
    const c = ensure(); if (!c || !S.sfx) return;
    o = o || {};
    const t0 = c.currentTime + (o.at || 0);
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = b;
    const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1200, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    f.Q.value = o.q || 1.2;
    const g = c.createGain(); g.gain.value = o.gain == null ? 0.25 : o.gain;
    src.connect(f); f.connect(g); g.connect(sfxG); src.start(t0);
  }

  const SFX = {
    tap: () => tone(660, 0.05, { type: 'triangle', gain: 0.16 }),
    pop: () => { tone(420, 0.09, { to: 900, gain: 0.26 }); noise(0.03, { f: 3000, gain: 0.06 }); },
    good: () => { [523, 659, 784, 1047].forEach((f, i) => { tone(f, 0.32, { at: i * 0.075, type: 'sine', gain: 0.2 }); tone(f * 2, 0.2, { at: i * 0.075, type: 'triangle', gain: 0.06 }); }); },
    wrong: () => { tone(330, 0.16, { to: 262, type: 'triangle', gain: 0.2 }); tone(262, 0.22, { at: 0.13, to: 220, type: 'triangle', gain: 0.18 }); },
    star: () => { tone(1319, 0.2, { gain: 0.14 }); tone(1760, 0.3, { at: 0.07, gain: 0.12 }); },
    whoosh: () => noise(0.32, { f: 500, to: 3500, q: 0.8, gain: 0.2 }),
    splat: () => { noise(0.22, { type: 'lowpass', f: 1400, to: 200, gain: 0.35 }); tone(200, 0.2, { to: 70, gain: 0.25 }); },
    wipe: () => noise(0.12, { f: 2400, q: 2, gain: 0.12 }),
    hop: () => tone(380, 0.14, { to: 760, gain: 0.22 }),
    land: () => { tone(300, 0.08, { to: 200, gain: 0.2, type: 'triangle' }); },
    clink: () => { tone(1568, 0.14, { gain: 0.14 }); tone(2093, 0.1, { at: 0.03, gain: 0.08 }); },
    ufo: () => { tone(280, 0.5, { to: 520, type: 'sawtooth', gain: 0.08 }); tone(285, 0.5, { to: 540, type: 'sine', gain: 0.1, at: 0.02 }); },
    lose: () => { [392, 330, 262].forEach((f, i) => tone(f, 0.28, { at: i * 0.14, type: 'triangle', gain: 0.18 })); },
    fanfare: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { tone(f, 0.38, { at: i * 0.12, gain: 0.2 }); tone(f / 2, 0.38, { at: i * 0.12, type: 'triangle', gain: 0.1 }); }); },
    coin: () => { tone(988, 0.08, { gain: 0.16 }); tone(1319, 0.28, { at: 0.07, gain: 0.16 }); },
    gentle: () => tone(440, 0.18, { to: 392, gain: 0.12, type: 'sine' }),
    count: n => tone(440 + (n || 0) * 28, 0.1, { gain: 0.18, type: 'triangle' })
  };
  function sfx(name, a) { try { if (SFX[name]) SFX[name](a); } catch (e) { /* ไม่มีเสียงก็เล่นต่อได้ */ } }

  /* ── เพลงประกอบ: อาร์เปจิโอเบา ๆ วนคอร์ด C - Am - F - G ── */
  let musTimer = null, musNext = 0, musStep = 0;
  const CHORDS = [[48, 55, 64, 67, 72], [45, 52, 60, 64, 69], [41, 48, 57, 60, 65], [43, 50, 59, 62, 67]];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function musTick() {
    const c = ctx; if (!c || !S.music) return;
    const BEAT = 60 / 92 / 2;
    while (musNext < c.currentTime + 0.35) {
      const bar = Math.floor(musStep / 8) % CHORDS.length, k = musStep % 8, ch = CHORDS[bar];
      const t = Math.max(musNext, c.currentTime + 0.02);
      const note = [ch[2], ch[3], ch[4], ch[3], ch[2], ch[3], ch[4], ch[1] + 12][k];
      mNote(mtof(note + 12), BEAT * 1.6, t, 'triangle', 0.05);
      if (k === 0) { mNote(mtof(ch[0]), BEAT * 7, t, 'sine', 0.09); mNote(mtof(ch[1]), BEAT * 7, t, 'sine', 0.045); }
      if (k === 4) mNote(mtof(ch[0] + 7), BEAT * 3.5, t, 'sine', 0.05);
      if (k % 2 === 1) mNote(mtof(ch[4] + 12), BEAT * 0.5, t, 'sine', 0.014);
      musNext += BEAT; musStep++;
    }
  }
  function mNote(f, dur, t0, type, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(musicG); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function musicStart() {
    const c = ensure(); if (!c || musTimer || !S.music) return;
    musicG.gain.cancelScheduledValues(c.currentTime); musicG.gain.setTargetAtTime(0.5, c.currentTime, 0.4);
    musNext = c.currentTime + 0.1; musStep = 0;
    musTimer = setInterval(musTick, 120);
  }
  function musicStop() {
    if (musTimer) { clearInterval(musTimer); musTimer = null; }
    if (ctx && musicG) musicG.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  }

  /* ── เสียงพากย์ ── */
  const pathOf = id => (id.indexOf('/') >= 0 ? 'audio/lib/' + id + '.mp3' : 'audio/voice/' + id + '.mp3');
  function load(id) {
    if (bufCache.has(id)) return bufCache.get(id);
    const c = ensure();
    const p = c ? fetch(pathOf(id)).then(r => { if (!r.ok) throw new Error('404'); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej))).catch(() => null) : Promise.resolve(null);
    bufCache.set(id, p);
    return p;
  }
  const isNum = id => /^n(\d|_)/.test(id) || id === 'n_jud';
  function gapAfter(a, b) {
    if (!b) return 0;
    if (isNum(a) && isNum(b)) return 0.012;
    if (isNum(a) && !isNum(b)) return 0.13;
    if (/^op_/.test(a) && isNum(b)) return 0.09;
    if (a.indexOf('/') >= 0 || /^d_/.test(a)) return 0.22;
    return 0.12;
  }
  let token = 0, live = [], endTimer = null;
  function stopVoice() {
    token++;
    live.forEach(s => { try { s.stop(); } catch (e) { /* ปล่อยผ่าน */ } });
    live = [];
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
    try { if (root.speechSynthesis) root.speechSynthesis.cancel(); } catch (e) { /* ไม่มี TTS */ }
  }
  function thaiVoice() {
    try { const v = root.speechSynthesis && root.speechSynthesis.getVoices(); return v && v.find(x => /^th/i.test(x.lang)); } catch (e) { return null; }
  }
  function ttsSpeak(text) {
    return new Promise(res => {
      const v = thaiVoice();
      if (!v || !text) return res(false);
      try {
        const u = new root.SpeechSynthesisUtterance(text); u.lang = 'th-TH'; u.voice = v; u.rate = 1.0; u.volume = S.vol;
        u.onend = () => res(true); u.onerror = () => res(false);
        root.speechSynthesis.speak(u);
      } catch (e) { res(false); }
    });
  }
  /* say(['n3','op_plus','n2','q_equals']) → Promise<boolean> จบเมื่อเล่นครบ (false = ถูกขัดจังหวะ) */
  async function say(ids, opt) {
    opt = opt || {};
    ids = (ids || []).filter(Boolean);
    stopVoice();
    const my = token;
    if (!ids.length || DC.fast) return true;      // DC.fast = โหมดทดสอบ ?dev=1&fast=1
    if (!S.voice) return true;
    const c = ensure();
    if (!c) return true;
    if (c.state === 'suspended') { try { await c.resume(); } catch (e) { /* รอปฏิสัมพันธ์ */ } }
    const bufs = await Promise.all(ids.map(load));
    if (my !== token) return false;
    if (bufs.some(b => !b)) {                              // คลิปหาย → เสียงสำรอง
      const text = ids.map(i => VOICED[i] || (DC.NV && DC.NV.TEXT[i]) || '').join(' ');
      return ttsSpeak(text);
    }
    let t = c.currentTime + 0.04;
    bufs.forEach((b, i) => {
      const s = c.createBufferSource(); s.buffer = b; s.connect(voiceG); s.start(t); live.push(s);
      t += b.duration + gapAfter(ids[i], ids[i + 1]);
    });
    if (opt.onStart) opt.onStart();
    return new Promise(res => { endTimer = setTimeout(() => { endTimer = null; res(my === token); }, Math.max(0, (t - c.currentTime) * 1000)); });
  }
  /* ระยะเวลาโดยประมาณของลำดับคลิป (ใช้ซิงก์ภาพ) */
  async function lengthOf(ids) {
    const bufs = await Promise.all(ids.map(load));
    let t = 0; bufs.forEach((b, i) => { if (b) t += b.duration + gapAfter(ids[i], ids[i + 1]); });
    return t;
  }
  function preload(ids) { ids.forEach(load); }

  function set(o) {
    Object.assign(S, o);
    if (ctx) {
      master.gain.setTargetAtTime(S.vol, ctx.currentTime, 0.05);
      if (!S.music) musicStop(); else musicStart();
    }
  }

  DC.audio = { unlock, sfx, musicStart, musicStop, say, stopVoice, lengthOf, preload, set, S, ensure, thaiVoice };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
