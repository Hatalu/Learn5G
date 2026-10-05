/* ==========================================================================
   SHAPE DETECTIVE — Procedural sound (WebAudio): no external files needed
   Warm success, soft non-pressuring error, playful mystery BGM loop
   ========================================================================== */
(function () {
  'use strict';
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let musicOn = true, musicTimer = null, step = 0;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.12; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    return true;
  }

  function tone(freq, start, dur, type, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(start); o.stop(start + dur + 0.05);
    return o;
  }

  const N = f => 440 * Math.pow(2, (f - 69) / 12); // midi -> Hz

  const SFX = {
    click() { const t = ctx.currentTime; tone(N(84), t, 0.07, 'triangle', 0.2); },
    pop() { const t = ctx.currentTime; tone(N(76), t, 0.08, 'sine', 0.25); tone(N(83), t + 0.05, 0.1, 'sine', 0.2); },
    scan() {
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.45);
    },
    lens() { const t = ctx.currentTime; [72, 76, 79, 84, 88].forEach((m, i) => tone(N(m), t + i * 0.06, 0.5, 'sine', 0.15)); },
    count(n) { const t = ctx.currentTime; tone(N(67 + Math.min(n, 8) * 2), t, 0.18, 'triangle', 0.25); },
    discover() { const t = ctx.currentTime; [79, 83, 86, 91].forEach((m, i) => tone(N(m), t + i * 0.07, 0.35, 'triangle', 0.18)); },
    success() {
      const t = ctx.currentTime;
      [60, 64, 67].forEach(m => tone(N(m), t, 0.9, 'sine', 0.14));
      [72, 76, 79, 84].forEach((m, i) => tone(N(m), t + 0.12 + i * 0.09, 0.5, 'triangle', 0.15));
    },
    soft() { const t = ctx.currentTime; tone(N(62), t, 0.22, 'sine', 0.16); tone(N(57), t + 0.16, 0.3, 'sine', 0.14); },
    unlock() {
      const t = ctx.currentTime;
      tone(N(55), t, 0.12, 'square', 0.06); tone(N(62), t + 0.1, 0.12, 'square', 0.06);
      [74, 79, 83, 86, 91, 95].forEach((m, i) => tone(N(m), t + 0.25 + i * 0.08, 0.7, 'sine', 0.13));
    },
    draw() { const t = ctx.currentTime; tone(1800 + Math.random() * 400, t, 0.03, 'triangle', 0.03); },
    chug() { const t = ctx.currentTime; for (let i = 0; i < 6; i++) tone(110, t + i * 0.18, 0.1, 'sawtooth', 0.05); tone(N(84), t + 1.1, 0.4, 'square', 0.05); tone(N(88), t + 1.1, 0.4, 'square', 0.05); },
    whoosh() {
      const t = ctx.currentTime, len = 0.5, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + len);
      g.gain.value = 0.25; s.buffer = buf; s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t);
    }
  };

  // Playful mystery loop (pentatonic minor-ish, pizzicato feeling)
  const BASS = [45, 45, 52, 52, 48, 48, 50, 52];
  const MEL = [69, 0, 72, 74, 76, 0, 74, 72, 69, 0, 67, 69, 72, 0, 0, 0,
               69, 0, 72, 74, 76, 79, 76, 74, 72, 0, 74, 72, 69, 0, 0, 0];
  function tick() {
    if (!ctx || !musicOn) return;
    const t = ctx.currentTime + 0.05;
    if (step % 4 === 0) tone(N(BASS[(step / 4) % BASS.length]), t, 0.5, 'triangle', 0.5, musicGain);
    const m = MEL[step % MEL.length];
    if (m) tone(N(m), t, 0.22, 'sine', 0.35, musicGain);
    if (step % 2 === 1) tone(N(93), t, 0.03, 'triangle', 0.06, musicGain);
    step++;
  }

  const Audio = {
    unlock() { ensure(); },
    play(name, arg) { if (!ensure()) return; try { SFX[name] && SFX[name](arg); } catch (e) { /* ignore */ } },
    startMusic() {
      if (!ensure()) return;
      if (musicTimer) return;
      musicTimer = setInterval(tick, 230);
    },
    toggleMusic() {
      musicOn = !musicOn;
      if (musicOn) Audio.startMusic(); else { clearInterval(musicTimer); musicTimer = null; }
      return musicOn;
    },
    get musicOn() { return musicOn; },
    speak(text) {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
      u.lang = 'th-TH'; u.rate = 0.95; u.pitch = 1.1;
      const v = speechSynthesis.getVoices().find(v => /th/i.test(v.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    }
  };

  window.SD = window.SD || {};
  window.SD.Audio = Audio;
})();
