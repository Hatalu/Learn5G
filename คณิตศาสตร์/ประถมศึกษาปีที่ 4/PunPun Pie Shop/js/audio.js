/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — Sound system
   - SFX + BGM สังเคราะห์ด้วย Web Audio API (ไม่ใช้ไฟล์เสียง)
   - เสียงอ่านภาษาไทยผ่าน Web Speech API (ถ้าเครื่องมีเสียงภาษาไทย)
   - ถ้าเบราว์เซอร์ไม่รองรับ เกมยังเล่นได้ตามปกติแบบไม่มีเสียง
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let musicTimer = null, musicStep = 0, musicMode = null;
  let volume = 0.8, musicOn = true;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.13;
      musicGain.connect(master);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.85;
      sfxGain.connect(master);
      return true;
    } catch (e) { return false; }
  }

  function tone(o) {
    if (!ensure() || volume <= 0) return;
    const t0 = ctx.currentTime + (o.delay || 0);
    const dur = o.dur || 0.2;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0 || 440, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t0 + dur);
    const vol = o.vol == null ? 0.4 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.dest || sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise(o) {
    if (!ensure() || volume <= 0) return;
    const dur = o.dur || 0.2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = o.filter || 'bandpass';
    flt.frequency.value = o.freq || 1000;
    flt.Q.value = o.q || 1;
    const g = ctx.createGain();
    const t0 = ctx.currentTime + (o.delay || 0);
    g.gain.setValueAtTime(o.vol == null ? 0.25 : o.vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(flt); flt.connect(g); g.connect(sfxGain);
    src.start(t0);
  }

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  /* กระดิ่งแก้ว: sine + overtone เบา ๆ */
  function bell(m, delay, vol, dur) {
    tone({ f0: mtof(m), dur: dur || 0.5, type: 'sine', vol: vol || 0.28, delay });
    tone({ f0: mtof(m + 12), dur: (dur || 0.5) * 0.6, type: 'sine', vol: (vol || 0.28) * 0.25, delay });
  }

  const SFX = {
    click()   { tone({ f0: 520, f1: 820, dur: 0.08, type: 'triangle', vol: 0.22 }); },
    pop(i)    { const k = i || 0; tone({ f0: 330 + k * 40, f1: 760 + k * 60, dur: 0.11, type: 'sine', vol: 0.4 }); },
    tick()    { tone({ f0: 900, f1: 700, dur: 0.05, type: 'triangle', vol: 0.16 }); },
    slice()   { noise({ dur: 0.12, freq: 3200, q: 2, vol: 0.28 }); tone({ f0: 1400, f1: 700, dur: 0.1, type: 'triangle', vol: 0.12, delay: 0.03 }); },
    merge()   { tone({ f0: 300, f1: 520, dur: 0.18, type: 'sine', vol: 0.35 }); tone({ f0: 450, f1: 780, dur: 0.16, type: 'sine', vol: 0.2, delay: 0.08 }); },
    pack()    { tone({ f0: 200, f1: 420, dur: 0.16, type: 'sine', vol: 0.4 }); tone({ f0: 420, f1: 300, dur: 0.12, type: 'sine', vol: 0.18, delay: 0.12 }); },
    full()    { [72, 76, 79].forEach((m, i) => bell(m, i * 0.06, 0.24, 0.4)); },
    puff()    { noise({ dur: 0.3, freq: 600, q: 0.5, vol: 0.2, filter: 'lowpass' }); },
    whoosh()  { noise({ dur: 0.25, freq: 1500, q: 0.7, vol: 0.14 }); },
    correct() { [76, 79, 84, 88].forEach((m, i) => bell(m, i * 0.08, 0.26, 0.6)); },
    gentle()  { tone({ f0: 392, f1: 349, dur: 0.22, type: 'sine', vol: 0.22 }); tone({ f0: 330, f1: 311, dur: 0.3, type: 'sine', vol: 0.18, delay: 0.16 }); },
    hint()    { [81, 86].forEach((m, i) => bell(m, i * 0.1, 0.2, 0.5)); },
    star()    { [84, 88, 91].forEach((m, i) => bell(m, i * 0.07, 0.24, 0.45)); },
    unlock()  { [69, 73, 76, 81].forEach((m, i) => bell(m, i * 0.08, 0.24, 0.45)); },
    tilt()    { tone({ f0: 180, f1: 120, dur: 0.35, type: 'triangle', vol: 0.2 }); noise({ dur: 0.2, freq: 400, vol: 0.08, delay: 0.1 }); },
    boing()   { tone({ f0: 180, f1: 520, dur: 0.22, type: 'sine', vol: 0.32 }); },
    fanfare() {
      [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => bell(m, i * 0.12, 0.26, 0.5));
      [48, 52, 55, 60].forEach((m, i) => tone({ f0: mtof(m), dur: 0.5, type: 'triangle', vol: 0.22, delay: i * 0.24 }));
    },
    mix()     { tone({ f0: 700, f1: 1100, dur: 0.08, type: 'square', vol: 0.06 }); tone({ f0: 900, f1: 600, dur: 0.1, type: 'square', vol: 0.05, delay: 0.09 }); }
  };

  /* ── BGM : กล่องดนตรีเบา ๆ วนลูป ── */
  const SONGS = {
    map: {
      step: 0.3,
      mel: [72, null, 76, 79, 77, null, 74, null, 72, null, 76, 79, 81, 79, 77, null,
            76, null, 79, 84, 83, null, 79, null, 77, 76, 74, null, 72, null, null, null],
      bass: [48, 53, 55, 48]
    },
    play: {
      step: 0.36,
      mel: [67, null, 72, null, 76, null, 74, 72, 69, null, 72, null, 74, null, null, null,
            67, null, 72, null, 76, 79, 77, 76, 74, null, 72, null, 72, null, null, null],
      bass: [48, 45, 41, 43]
    },
    fest: {
      step: 0.26,
      mel: [72, 76, 79, 76, 81, 79, 76, null, 74, 77, 81, 77, 79, null, null, null,
            72, 76, 79, 84, 83, 81, 79, null, 77, 76, 74, 76, 72, null, null, null],
      bass: [48, 53, 55, 48]
    }
  };

  function musicTick() {
    if (!ctx || !musicOn || volume <= 0) return;
    const song = SONGS[musicMode];
    if (!song) return;
    const m = song.mel[musicStep % song.mel.length];
    if (m) {
      tone({ f0: mtof(m), dur: song.step * 2.2, type: 'sine', vol: 0.5, dest: musicGain });
      tone({ f0: mtof(m + 12), dur: song.step * 0.9, type: 'sine', vol: 0.08, dest: musicGain });
    }
    if (musicStep % 8 === 0) {
      const b = song.bass[Math.floor(musicStep / 8) % song.bass.length];
      tone({ f0: mtof(b), dur: song.step * 7, type: 'triangle', vol: 0.45, dest: musicGain });
      tone({ f0: mtof(b + 7), dur: song.step * 6, type: 'sine', vol: 0.18, dest: musicGain, delay: song.step * 2 });
    }
    musicStep++;
  }

  function music(mode) {
    if (mode === musicMode && musicTimer) return;
    stopMusic();
    musicMode = mode;
    if (!mode || !musicOn) return;
    if (!ensure()) return;
    musicStep = 0;
    musicTick();
    musicTimer = setInterval(musicTick, SONGS[mode].step * 1000);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  /* ── Thai speech (TTS) ── */
  let thaiVoice = null;
  function findVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = window.speechSynthesis.getVoices() || [];
    thaiVoice = vs.find(v => /^th/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    findVoice();
    window.speechSynthesis.onvoiceschanged = findVoice;
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !text || volume <= 0) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'th-TH';
      if (thaiVoice) u.voice = thaiVoice;
      u.rate = 0.95;
      u.pitch = 1.15;
      u.volume = Math.min(1, volume + 0.1);
      u.onstart = () => { if (musicGain) musicGain.gain.value = 0.04; };
      u.onend = u.onerror = () => { if (musicGain) musicGain.gain.value = 0.13; };
      window.speechSynthesis.speak(u);
    } catch (e) { /* ไม่มีเสียงพูด ก็เล่นต่อได้ */ }
  }
  function stopSpeak() { try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {} }

  window.PP = window.PP || {};
  window.PP.audio = {
    unlock: ensure,
    sfx(name, arg) { try { if (SFX[name]) SFX[name](arg); } catch (e) {} },
    music,
    stopMusic,
    setVolume(v) { volume = v; if (master) master.gain.value = v; if (v <= 0) stopSpeak(); },
    setMusic(on) { musicOn = on; if (!on) stopMusic(); else { const m = musicMode; musicMode = null; music(m); } },
    speak, stopSpeak,
    canSpeak: () => 'speechSynthesis' in window,
    hasThaiVoice: () => !!thaiVoice
  };
})();
