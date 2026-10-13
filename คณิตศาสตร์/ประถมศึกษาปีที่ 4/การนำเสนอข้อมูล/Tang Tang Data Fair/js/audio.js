/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — ระบบเสียง
   - SFX + BGM สังเคราะห์สดด้วย Web Audio API (ไม่ใช้ไฟล์เสียง)
   - เสียงพากย์: ถ้ามีไฟล์ audio/voice/<id>.mp3 (ระบุใน js/voiced.js) เล่นไฟล์นั้น
     ถ้าไม่มี → ใช้เสียงอ่านภาษาไทยของเบราว์เซอร์ (ไล่ระดับเสียงไม่ให้โมโนโทน)
     ถ้าอ่านไม่ได้เลย → เงียบ ข้อความยังแสดงในกล่องคำพูด (Graceful Fallback)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT = window.TT || {};

  let ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let volume = 0.8, musicOn = true, voiceOn = true;
  const FAST = /[?&]fast=1/.test(location.search); /* ทดสอบอัตโนมัติ: ข้ามเวลารอเสียงพากย์ */
  const MUSIC_LEVEL = 0.17;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4;
      comp.attack.value = 0.004; comp.release.value = 0.2;
      comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = volume; master.connect(comp);
      musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_LEVEL; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
      return true;
    } catch (e) { return false; }
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
    if (document.hidden && curVoice) curVoice.pause();
  });

  const now = () => ctx.currentTime;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function tone(o) {
    if (!ensure() || volume <= 0) return;
    const t0 = o.t != null ? o.t : now() + (o.delay || 0);
    const dur = o.dur || 0.2;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0 || 440, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t0 + (o.glide || dur));
    const vol = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 1;
      osc.connect(f); node = f;
    }
    node.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function getNoise() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }
  function noise(o) {
    if (!ensure() || volume <= 0) return;
    const t0 = o.t != null ? o.t : now() + (o.delay || 0);
    const dur = o.dur || 0.2;
    const src = ctx.createBufferSource();
    src.buffer = getNoise(); src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = o.filter || 'bandpass';
    flt.frequency.setValueAtTime(o.freq || 1000, t0);
    if (o.f1) flt.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
    flt.Q.value = o.q || 1;
    const g = ctx.createGain();
    const v = o.vol == null ? 0.25 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(flt); flt.connect(g); g.connect(o.dest || sfxBus);
    src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.05);
  }
  function bell(m, delay, vol, dur) {
    tone({ f0: mtof(m), dur: dur || 0.5, type: 'sine', vol: vol || 0.22, delay });
    tone({ f0: mtof(m + 12), dur: (dur || 0.5) * 0.5, type: 'triangle', vol: (vol || 0.22) * 0.3, delay });
    tone({ f0: mtof(m + 19), dur: (dur || 0.5) * 0.3, type: 'sine', vol: (vol || 0.22) * 0.12, delay });
  }

  const SFX = {
    click()   { tone({ f0: 620, f1: 920, dur: 0.07, type: 'triangle', vol: 0.18 }); },
    pop(i)    { const k = i || 0; tone({ f0: 360 + k * 50, f1: 820 + k * 80, dur: 0.1, type: 'sine', vol: 0.34 }); },
    bubble()  { tone({ f0: 300, f1: 1200, dur: 0.12, type: 'sine', vol: 0.25 }); tone({ f0: 900, f1: 1600, dur: 0.06, type: 'sine', vol: 0.1, delay: 0.07 }); },
    tick()    { tone({ f0: 1300, f1: 950, dur: 0.035, type: 'triangle', vol: 0.12 }); },
    /* แท่งยืดขึ้น: ปรับระดับเสียงตามความสูง (0..1) */
    grow(k)   { const x = k == null ? 0.5 : k; tone({ f0: 300 + x * 500, f1: 420 + x * 700, dur: 0.1, type: 'triangle', vol: 0.15 }); },
    snap()    { tone({ f0: 900, f1: 300, dur: 0.06, type: 'square', vol: 0.05, lp: 2200 }); tone({ f0: 540, f1: 820, dur: 0.1, type: 'sine', vol: 0.22, delay: 0.02 }); },
    drum()    { tone({ f0: 180, f1: 70, dur: 0.18, type: 'sine', vol: 0.4 }); noise({ dur: 0.08, freq: 800, q: 0.8, vol: 0.12 }); },
    key()     { tone({ f0: 700, f1: 760, dur: 0.05, type: 'triangle', vol: 0.15 }); },
    check()   { bell(88, 0, 0.18, 0.3); bell(95, 0.07, 0.15, 0.3); },
    nope()    { tone({ f0: 380, f1: 330, dur: 0.16, type: 'sine', vol: 0.18 }); },
    correct() { [76, 80, 83, 88].forEach((m, i) => bell(m, i * 0.065, 0.22, 0.5)); tone({ f0: 300, f1: 900, dur: 0.25, type: 'sine', vol: 0.08, delay: 0.05 }); },
    gentle()  { tone({ f0: 440, f1: 380, dur: 0.18, type: 'sine', vol: 0.18 }); tone({ f0: 350, f1: 310, dur: 0.26, type: 'sine', vol: 0.14, delay: 0.14 }); },
    hint()    { [84, 88, 91].forEach((m, i) => bell(m, i * 0.09, 0.16, 0.45)); },
    star()    { [84, 88, 91, 96].forEach((m, i) => bell(m, i * 0.06, 0.2, 0.45)); },
    unlock()  { [69, 73, 76, 81, 85].forEach((m, i) => bell(m, i * 0.07, 0.2, 0.45)); },
    whoosh()  { noise({ dur: 0.3, freq: 500, f1: 3400, q: 0.8, vol: 0.14 }); },
    puff()    { noise({ dur: 0.35, freq: 700, q: 0.5, vol: 0.2, filter: 'lowpass' }); tone({ f0: 220, f1: 110, dur: 0.2, type: 'sine', vol: 0.12 }); },
    sparkle() { for (let i = 0; i < 6; i++) tone({ f0: 2000 + Math.random() * 1800, dur: 0.08, type: 'sine', vol: 0.06, delay: i * 0.045 }); },
    sneaky()  { [62, 65, 61, 58].forEach((m, i) => tone({ f0: mtof(m), dur: 0.12, type: 'triangle', vol: 0.15, delay: i * 0.09 })); },
    scramble(){ for (let i = 0; i < 7; i++) tone({ f0: 300 + Math.random() * 900, dur: 0.07, type: 'square', vol: 0.05, lp: 2400, delay: i * 0.05 }); },
    bonk()    { tone({ f0: 300, f1: 90, dur: 0.25, type: 'square', vol: 0.12, lp: 1200 }); noise({ dur: 0.15, freq: 400, q: 1, vol: 0.2 }); },
    fanfare() {
      [72, 76, 79, 84, 79, 84, 88, 91].forEach((m, i) => bell(m, i * 0.11, 0.22, 0.5));
      [48, 55, 60, 64].forEach((m, i) => tone({ f0: mtof(m), dur: 0.6, type: 'triangle', vol: 0.12, delay: i * 0.22 }));
    }
  };

  /* ── BGM : lookahead scheduler (สไตล์งานวัด สดใส เด้ง ๆ) ── */
  const X = -1;
  const TRACKS = {
    title: {
      bpm: 116, kick: 'x...x...x...x...', snare: '', hat: '..x...x...x...x.',
      chords: [[48, 0], [53, 0], [43, 0], [48, 0]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 7, null, 12, null],
      lead: [
        [76, X, 79, X, 84, X, 79, X, 76, X, 72, X, 76, X, X, X],
        [77, X, 81, X, 84, X, 81, X, 77, X, 74, X, 72, X, X, X],
        [79, X, 83, X, 86, X, 83, X, 79, X, 74, X, 71, X, X, X],
        [76, X, 79, X, 84, X, 88, X, 86, X, 84, X, 79, X, 76, X]
      ],
      leadType: 'triangle', leadVol: 0.2
    },
    map: {
      bpm: 100, kick: 'x.......x.......', snare: '', hat: 'x...x...x...x...',
      chords: [[48, 0], [45, 1], [41, 0], [43, 0]],
      bass: [0, null, null, null, 7, null, null, null, 0, null, null, null, 7, null, null, null],
      lead: [
        [79, 0, 76, 0, 72, 0, 76, 0, 79, X, X, X, 0, 0, 0, 0],
        [81, 0, 76, 0, 72, 0, 76, 0, 81, X, X, X, 0, 0, 0, 0],
        [77, 0, 72, 0, 69, 0, 72, 0, 77, X, X, X, 0, 0, 0, 0],
        [79, 0, 74, 0, 71, 0, 74, 0, 79, X, 83, X, 0, 0, 0, 0]
      ],
      leadType: 'sine', leadVol: 0.2
    },
    play: {
      bpm: 106, kick: 'x.......x.......', snare: '', hat: '....x.......x...',
      chords: [[48, 0], [43, 0], [45, 1], [41, 0]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      arp: 0.05
    },
    boss: {
      bpm: 128, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.',
      chords: [[45, 1], [41, 0], [43, 0], [40, 1]],
      bass: [0, null, 0, 12, null, 0, null, 12, 0, null, 0, 12, null, 7, null, 12],
      lead: [
        [69, 0, 72, 0, 76, 0, 75, 0, 76, X, 0, 0, 72, 0, 69, 0],
        [65, 0, 69, 0, 72, 0, 71, 0, 72, X, 0, 0, 69, 0, 65, 0],
        [67, 0, 71, 0, 74, 0, 73, 0, 74, X, 0, 0, 71, 0, 67, 0],
        [64, 0, 68, 0, 71, 0, 74, 0, 76, X, X, X, 0, 0, 0, 0]
      ],
      leadType: 'square', leadVol: 0.07
    },
    final: {
      bpm: 132, kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
      chords: [[48, 0], [43, 0], [45, 1], [41, 0]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 7, null, 12, null],
      lead: [
        [84, X, 79, X, 76, X, 79, X, 84, X, 88, X, 86, X, 84, X],
        [83, X, 79, X, 74, X, 79, X, 83, X, 86, X, 84, X, 83, X],
        [81, X, 76, X, 72, X, 76, X, 81, X, 84, X, 83, X, 81, X],
        [77, X, 81, X, 84, X, 88, X, 91, X, X, X, 0, 0, 0, 0]
      ],
      leadType: 'triangle', leadVol: 0.18
    }
  };
  function kick(t, v) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(g); g.connect(musicBus); osc.start(t); osc.stop(t + 0.28);
  }
  let curTrack = null, step = 0, nextT = 0, timer = null;
  function scheduleStep(tr, s, t) {
    const i = s % 16;
    const bar = Math.floor(s / 16) % tr.chords.length;
    const sp = 60 / tr.bpm / 4;
    const root = tr.chords[bar][0], minor = tr.chords[bar][1];
    if (tr.kick[i] === 'x') kick(t, 0.7);
    if (tr.snare && tr.snare[i] === 'x') noise({ t, dur: 0.12, freq: 1800, q: 0.8, vol: 0.2, dest: musicBus });
    if (tr.hat && tr.hat[i] === 'x') noise({ t, dur: 0.035, filter: 'highpass', freq: 8000, vol: 0.08, dest: musicBus });
    if (tr.bass) {
      const b = tr.bass[i];
      if (b != null) tone({ t, f0: mtof(root - 12 + b), dur: sp * 1.8, type: 'triangle', vol: 0.34, lp: 900, dest: musicBus });
    }
    if (tr.lead) {
      const line = tr.lead[bar % tr.lead.length];
      const m = line[i];
      if (m > 0) {
        let n = 1;
        while (i + n < 16 && line[i + n] === X) n++;
        tone({ t, f0: mtof(m), dur: sp * n * 0.95, type: tr.leadType, vol: tr.leadVol, lp: 3400, dest: musicBus });
      }
    }
    if (tr.arp) {
      const pat = [0, minor ? 3 : 4, 7, 12, 7, minor ? 3 : 4];
      if (i % 2 === 0) tone({ t, f0: mtof(root + 12 + pat[(i / 2) % 6]), dur: sp * 1.6, type: 'sine', vol: tr.arp * 3.4, dest: musicBus });
    }
  }
  function pump() {
    const tr = TRACKS[curTrack];
    if (!tr || !ctx) return;
    if (nextT < now() - 0.2) nextT = now() + 0.05;
    const sp = 60 / tr.bpm / 4;
    while (nextT < now() + 0.15) { scheduleStep(tr, step, nextT); nextT += sp; step++; }
  }
  function music(name) {
    if (name === curTrack && timer) return;
    stopMusic();
    curTrack = name;
    if (!name || !musicOn || !TRACKS[name]) return;
    if (!ensure()) return;
    step = 0; nextT = now() + 0.06;
    timer = setInterval(pump, 30);
  }
  function stopMusic() { if (timer) { clearInterval(timer); timer = null; } }
  function duck(on) {
    if (!musicBus) return;
    musicBus.gain.setTargetAtTime(on ? MUSIC_LEVEL * 0.3 : MUSIC_LEVEL, now(), 0.12);
  }

  /* ══════════ เสียงพากย์ ══════════ */
  const canSpeak = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let thVoice = null;
  function findVoices() {
    if (!canSpeak()) return;
    const vs = (window.speechSynthesis.getVoices() || []).filter(v => /^th/i.test(v.lang) || /thai/i.test(v.name));
    const score = v => (/natural|online/i.test(v.name) ? 5 : 0) + (/google/i.test(v.name) ? 2 : 0);
    vs.sort((a, b) => score(b) - score(a));
    thVoice = vs[0] || null;
  }
  if (canSpeak()) { findVoices(); window.speechSynthesis.onvoiceschanged = findVoices; }

  /* แบ่งวลี + ไล่ระดับเสียงให้มีชีวิตชีวา ไม่ราบเรียบ */
  function ttsPlan(text, who) {
    const base = who === 'm' ? 0.9 : 1.3;
    const out = [];
    let buf = '', si = 0;
    const push = end => {
      const s = buf.trim(); buf = '';
      if (!s) return;
      const parts = s.split(/\s+/).reduce((acc, p) => {
        const last = acc[acc.length - 1];
        if (last && (last.length < 10 || p.length < 4)) acc[acc.length - 1] = last + ' ' + p; else acc.push(p);
        return acc;
      }, []);
      parts.forEach((p, j) => {
        let pitch = base + j * 0.05 + (si % 2 ? 0.05 : 0);
        if (j === parts.length - 1 && end === '!') pitch += 0.18;
        if (j === parts.length - 1 && end === '?') pitch += 0.25;
        out.push({ t: p, pitch: Math.min(2, pitch), rate: 1.05 });
      });
      si++;
    };
    for (const ch of text) {
      if (ch === '!' || ch === '?' || ch === '\n') { push(ch); continue; }
      buf += ch;
    }
    push('');
    return out;
  }
  function tts(text, who) {
    return new Promise(res => {
      if (!canSpeak() || !text) return res();
      const chunks = ttsPlan(String(text).replace(/\[[^\]]*\]/g, ''), who);
      try { window.speechSynthesis.cancel(); } catch (e) {}
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      setTimeout(() => {
        chunks.forEach((c, i) => {
          try {
            const u = new SpeechSynthesisUtterance(c.t);
            u.lang = 'th-TH'; if (thVoice) u.voice = thVoice;
            u.pitch = c.pitch; u.rate = c.rate; u.volume = Math.min(1, volume + 0.2);
            if (i === chunks.length - 1) u.onend = u.onerror = fin;
            window.speechSynthesis.speak(u);
          } catch (e) { fin(); }
        });
      }, 60);
      setTimeout(fin, 900 + String(text).length * 130);
    });
  }

  let curVoice = null, curFin = null, voiceToken = 0;
  /* เล่นเสียงพากย์ตาม id (ถ้ามีไฟล์) ไม่เช่นนั้นอ่านด้วยเสียงสำรอง; คืน Promise เมื่อพูดจบ */
  function line(id, fallbackText, who) {
    stopVoice();
    const my = ++voiceToken;
    if (!voiceOn || volume <= 0 || FAST) return Promise.resolve();
    const has = id && TT.VOICED && TT.VOICED.indexOf(id) >= 0;
    duck(true);
    const end = () => { if (my === voiceToken) duck(false); };
    const plain = String(fallbackText || '').replace(/\[[^\]]*\]/g, '');
    if (!has) {
      const wait = new Promise(r => setTimeout(r, Math.min(5000, 800 + plain.length * 60)));
      /* อ่านออกเสียงเฉพาะเมื่อเครื่องมีเสียงภาษาไทย (กันเสียงภาษาอื่นอ่านผิด) */
      const spoken = (canSpeak() && thVoice) ? tts(plain, who) : Promise.resolve();
      return Promise.all([wait, spoken]).then(end);
    }
    return new Promise(res => {
      const a = new Audio('audio/voice/' + id + '.mp3');
      curVoice = a;
      a.volume = Math.min(1, volume + 0.15);
      let done = false;
      const fin = () => { if (done) return; done = true; if (curFin === fin) curFin = null; end(); res(); };
      curFin = fin;
      a.onended = fin;
      a.onerror = () => { tts(plain, who).then(fin); };
      const p = a.play();
      if (p && p.catch) p.catch(() => setTimeout(fin, 1500));
      setTimeout(fin, 15000);
    });
  }
  function stopVoice() {
    voiceToken++;
    if (curVoice) { try { curVoice.pause(); } catch (e) {} curVoice = null; }
    if (curFin) { const f = curFin; curFin = null; f(); }
    try { if (canSpeak()) window.speechSynthesis.cancel(); } catch (e) {}
    duck(false);
  }

  TT.audio = {
    unlock: ensure,
    sfx(name, arg) { try { if (SFX[name]) SFX[name](arg); } catch (e) {} },
    music, stopMusic,
    setVolume(v) { volume = v; if (master) master.gain.value = v; if (v <= 0) stopVoice(); },
    setMusic(on) { musicOn = on; if (!on) stopMusic(); else { const m = curTrack; curTrack = null; music(m); } },
    setVoice(on) { voiceOn = !!on; if (!on) stopVoice(); },
    line, stopVoice, tts, canSpeak
  };
})();
