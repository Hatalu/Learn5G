/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — Sound system
   - SFX + BGM สังเคราะห์สดด้วย Web Audio API (ไม่ใช้ไฟล์เสียง)
     เสียงไซโลโฟน กระดิ่ง ป๊อป บอยง์ ตะไบหมุนโพรแทรกเตอร์ แตรปาร์ตี้ กองเชียร์
     เพลงสวนสนุก (กลอง เบสจังหวะ oom-pah ไซโลโฟน กระดิ่ง) สนุก เร้าใจ
   - เสียงพากย์ภาษาไทยผ่าน Web Speech API + "ระบบน้ำเสียงตื่นเต้น"
     แบ่งประโยคเป็นวลีสั้น แล้วไล่ระดับเสียงสูง-ต่ำ/ความเร็วตามอารมณ์
     ตัวเลขและองศาถูกแปลงเป็นคำอ่านไทยที่ถูกต้องก่อนพูด
   - ไม่รองรับก็เล่นต่อได้ปกติ (Graceful Fallback)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const AP = window.AP = window.AP || {};

  let ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let volume = 0.8, musicOn = true;
  const MUSIC_LEVEL = 0.2;

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
  });

  const now = () => ctx.currentTime;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  /* oscillator 1 ตัว: o = {f0, f1, dur, type, vol, t(abs) | delay, dest, attack, lp, vib} */
  function tone(o) {
    if (!ensure() || volume <= 0) return;
    const t0 = o.t != null ? o.t : now() + (o.delay || 0);
    const dur = o.dur || 0.2;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0 || 440, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t0 + (o.glide || dur));
    if (o.vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = o.vib; lg.gain.value = (o.f0 || 440) * 0.02;
      l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + dur + 0.05);
    }
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
  /* noise: o = {dur, filter, freq, f1, q, vol, t | delay, attack, dest} */
  function noise(o) {
    if (!ensure() || volume <= 0) return;
    const t0 = o.t != null ? o.t : now() + (o.delay || 0);
    const dur = o.dur || 0.2;
    const src = ctx.createBufferSource();
    src.buffer = getNoise();
    src.loop = true;
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

  /* ไซโลโฟน / มาริมบา: โน้ตสั้น กลม ใส */
  function xylo(m, delay, vol, dur, dest) {
    const f = mtof(m), v = vol || 0.24, dl = delay || 0, d = dur || 0.32;
    const o1 = { f0: f, dur: d, type: 'sine', vol: v, attack: 0.003 };
    const o2 = { f0: f * 3.98, dur: d * 0.3, type: 'sine', vol: v * 0.32, attack: 0.002 };
    if (dest) { o1.t = o2.t = dl; o1.dest = o2.dest = dest; } else o1.delay = o2.delay = dl;
    tone(o1); tone(o2);
  }
  /* กระดิ่งแก้วใส */
  function chime(m, delay, vol, dur) {
    tone({ f0: mtof(m), dur: dur || 0.6, type: 'sine', vol: vol || 0.2, delay, attack: 0.004 });
    tone({ f0: mtof(m + 12), dur: (dur || 0.6) * 0.5, type: 'triangle', vol: (vol || 0.2) * 0.3, delay });
    tone({ f0: mtof(m + 19), dur: (dur || 0.6) * 0.3, type: 'sine', vol: (vol || 0.2) * 0.14, delay });
  }
  function shaker(t, dest, v) {
    const o = { t, dur: 0.05, filter: 'highpass', freq: 5200, vol: v == null ? 0.09 : v };
    if (dest) o.dest = dest;
    noise(o);
  }
  function crowd(dur, vol) {
    dur = dur || 1.6; vol = vol || 0.22;
    noise({ dur, freq: 900, f1: 700, q: 0.6, vol, attack: 0.25 });
    noise({ dur: dur * 0.8, freq: 2400, q: 1.2, vol: vol * 0.5, attack: 0.2 });
    for (let i = 0; i < 16; i++) noise({ dur: 0.04, filter: 'highpass', freq: 1800, vol: 0.12 + Math.random() * 0.1, delay: Math.random() * dur * 0.8 });
  }
  /* แตรปาร์ตี้ปี๊ด */
  function partyHorn(delay) {
    delay = delay || 0;
    tone({ f0: 520, f1: 1100, glide: 0.22, dur: 0.42, type: 'sawtooth', vol: 0.07, lp: 2600, delay, vib: 22 });
    noise({ dur: 0.3, filter: 'highpass', freq: 3000, vol: 0.05, delay: delay + 0.18 });
  }
  function brass(delay) {
    [466, 587, 698].forEach(f => tone({ f0: f, f1: f * 0.99, dur: 0.42, type: 'sawtooth', vol: 0.09, lp: 2600, delay: delay || 0, attack: 0.02 }));
  }

  const SFX = {
    click()   { tone({ f0: 600, f1: 900, dur: 0.07, type: 'triangle', vol: 0.2 }); },
    pop(i)    { const k = i || 0; tone({ f0: 340 + k * 45, f1: 780 + k * 70, dur: 0.1, type: 'sine', vol: 0.36 }); },
    tick()    { tone({ f0: 1500, f1: 1000, dur: 0.035, type: 'square', vol: 0.05, lp: 4200 }); noise({ dur: 0.025, freq: 3400, q: 5, vol: 0.1 }); },
    tock()    { tone({ f0: 1000, f1: 700, dur: 0.04, type: 'square', vol: 0.05, lp: 3000 }); noise({ dur: 0.025, freq: 2200, q: 5, vol: 0.1 }); },
    key(i)    { const k = i || 0; tone({ f0: 520 + k * 30, dur: 0.06, type: 'square', vol: 0.06, lp: 2400 }); tone({ f0: 1040 + k * 60, dur: 0.04, type: 'sine', vol: 0.08 }); },
    /* โพรแทรกเตอร์หมุน: ตะไบเล็ก ๆ */
    ratchet() { tone({ f0: 1900, f1: 1300, dur: 0.02, type: 'square', vol: 0.025, lp: 5000 }); },
    /* ดูดเข้าที่: แม่เหล็กคลิก + ระฆังเล็ก */
    snap()    { tone({ f0: 900, f1: 300, dur: 0.07, type: 'square', vol: 0.07, lp: 2000 }); xylo(84, 0.03, 0.24, 0.3); xylo(91, 0.1, 0.2, 0.3); },
    /* ปากกา: ขีดเส้น */
    draw()    { for (let i = 0; i < 7; i++) noise({ dur: 0.05, freq: 3000 + i * 260, q: 3, vol: 0.07, delay: i * 0.045 }); },
    mark()    { tone({ f0: 700, f1: 420, dur: 0.08, type: 'triangle', vol: 0.24 }); noise({ dur: 0.04, freq: 2400, q: 3, vol: 0.06 }); },
    sparkle() { [88, 93, 96, 100].forEach((m, i) => tone({ f0: mtof(m), dur: 0.12, type: 'sine', vol: 0.07, delay: i * 0.04 })); },
    correct() {
      [72, 76, 79, 84].forEach((m, i) => xylo(m, i * 0.07, 0.26, 0.4));
      chime(91, 0.3, 0.2, 0.7);
      partyHorn(0.28);
      crowd(1.0, 0.13);
    },
    gentle()  { tone({ f0: 420, f1: 360, dur: 0.18, type: 'sine', vol: 0.2 }); tone({ f0: 330, f1: 300, dur: 0.26, type: 'sine', vol: 0.16, delay: 0.14 }); },
    spin()    { tone({ f0: 700, f1: 260, dur: 0.45, type: 'triangle', vol: 0.1, vib: 14 }); },
    hint()    { [84, 88, 91].forEach((m, i) => chime(m, i * 0.09, 0.16, 0.5)); },
    star()    { [84, 88, 91, 96].forEach((m, i) => chime(m, i * 0.06, 0.2, 0.5)); },
    unlock()  { [69, 73, 76, 81, 85].forEach((m, i) => xylo(m, i * 0.07, 0.24, 0.4)); chime(93, 0.38, 0.18, 0.7); },
    whoosh()  { noise({ dur: 0.32, freq: 600, f1: 3200, q: 0.8, vol: 0.16 }); },
    boing()   { tone({ f0: 220, f1: 520, glide: 0.12, dur: 0.3, type: 'sine', vol: 0.3, vib: 18 }); },
    horn()    { partyHorn(0); },
    airhorn() { brass(0); brass(0.48); },
    crowd()   { crowd(1.8, 0.22); },
    drumroll(){ for (let i = 0; i < 18; i++) noise({ dur: 0.06, freq: 1800, q: 0.8, vol: 0.05 + i * 0.008, delay: i * 0.04 }); },
    count()   { tone({ f0: 660, dur: 0.16, type: 'square', vol: 0.07, lp: 3000 }); xylo(76, 0, 0.2, 0.25); },
    go()      { partyHorn(0); [79, 84, 88].forEach((m, i) => xylo(m, 0.05 + i * 0.06, 0.26, 0.4)); },
    sneaky()  { [62, 65, 61, 58].forEach((m, i) => tone({ f0: mtof(m), dur: 0.12, type: 'triangle', vol: 0.16, delay: i * 0.09 })); noise({ dur: 0.12, freq: 2200, q: 5, vol: 0.06, delay: 0.3 }); },
    zap()     { tone({ f0: 1800, f1: 200, dur: 0.25, type: 'sawtooth', vol: 0.06, lp: 3000 }); noise({ dur: 0.2, freq: 5000, q: 2, vol: 0.06 }); },
    puff()    { noise({ dur: 0.3, freq: 700, q: 0.5, vol: 0.18, filter: 'lowpass' }); },
    fanfare() {
      brass(0);
      [72, 76, 79, 84, 79, 84, 88, 91].forEach((m, i) => xylo(m, 0.3 + i * 0.11, 0.26, 0.5));
      [48, 55, 60, 64].forEach((m, i) => tone({ f0: mtof(m), dur: 0.6, type: 'sawtooth', vol: 0.06, lp: 1500, delay: 0.3 + i * 0.22 }));
      chime(84, 0.9, 0.2, 1.0); chime(91, 1.3, 0.2, 1.0); chime(96, 1.7, 0.22, 1.2);
      partyHorn(1.0); partyHorn(1.5);
      crowd(2.4, 0.22);
    }
  };

  /* ── BGM : สวนสนุก (กลอง + เบส oom-pah + ไซโลโฟน + เขย่าเมล็ดไม้) ── */
  const X = -1; // ลากเสียงต่อ
  const TRACKS = {
    title: {
      bpm: 132,
      kick: 'x.......x.......', snare: '....x.......x...', shake: 'x.x.x.x.x.x.x.x.',
      chords: [[48, 0], [53, 0], [55, 0], [48, 0]],
      bass: [0, null, 7, null, 0, null, 7, null, 0, null, 7, null, 0, null, 7, null],
      lead: [
        [76, 0, 79, 0, 84, 0, 79, 0, 76, 0, 72, 0, 76, X, X, 0],
        [77, 0, 81, 0, 84, 0, 81, 0, 77, 0, 74, 0, 77, X, X, 0],
        [79, 0, 83, 0, 86, 0, 83, 0, 79, 0, 74, 0, 79, X, X, 0],
        [84, 0, 79, 0, 76, 0, 79, 0, 84, 0, 88, 0, 84, X, X, 0]
      ],
      leadType: 'triangle', leadVol: 0.2, leadDur: 0.62, xylo: true, bell: 'x...............'
    },
    map: {
      bpm: 104,
      kick: 'x.......x.......', snare: '', shake: 'x...x...x...x...',
      chords: [[48, 0], [41, 0], [45, 1], [43, 0]],
      bass: [0, null, null, null, 7, null, null, null, 0, null, null, null, 7, null, null, null],
      lead: [
        [76, 0, 0, 79, 0, 0, 76, 0, 74, 0, 72, 0, 0, 0, 0, 0],
        [77, 0, 0, 81, 0, 0, 77, 0, 76, 0, 74, 0, 0, 0, 0, 0],
        [76, 0, 0, 79, 0, 0, 84, 0, 83, 0, 81, 0, 0, 0, 0, 0],
        [74, 0, 0, 76, 0, 0, 77, 0, 79, X, X, X, 0, 0, 0, 0]
      ],
      leadType: 'sine', leadVol: 0.22, leadDur: 0.7, xylo: true
    },
    play: {
      bpm: 114,
      kick: 'x...............', snare: '', shake: 'x.x.x.x.x.x.x.x.',
      chords: [[48, 0], [45, 1], [41, 0], [43, 0]],
      bass: [0, null, null, null, 0, null, null, 12, 0, null, null, null, 7, null, null, null],
      arp: 0.07
    },
    final: {
      bpm: 146,
      kick: 'x...x...x...x...', snare: '....x.......x..x', shake: 'xxxxxxxxxxxxxxxx',
      chords: [[45, 1], [41, 0], [48, 0], [43, 0]],
      bass: [0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 7, 12],
      lead: [
        [81, 0, 81, 84, 0, 81, 79, 0, 76, 0, 79, 81, 0, 79, 76, 0],
        [77, 0, 77, 81, 0, 77, 76, 0, 72, 0, 76, 77, 0, 76, 72, 0],
        [79, 0, 79, 84, 0, 79, 76, 0, 72, 0, 76, 79, 0, 84, 88, 0],
        [86, X, X, X, 83, X, X, X, 79, 0, 83, 0, 86, 0, 91, 0]
      ],
      leadType: 'square', leadVol: 0.085, leadDur: 0.9, bell: 'x.......x.......'
    }
  };

  function kick(t, v) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g); g.connect(musicBus); osc.start(t); osc.stop(t + 0.32);
  }

  let curTrack = null, step = 0, nextT = 0, timer = null;
  function scheduleStep(tr, s, t) {
    const i = s % 16;
    const bar = Math.floor(s / 16) % tr.chords.length;
    const sp = 60 / tr.bpm / 4;
    const root = tr.chords[bar][0], minor = tr.chords[bar][1];
    if (tr.kick && tr.kick[i] === 'x') kick(t, 0.85);
    if (tr.snare && tr.snare[i] === 'x') {
      noise({ t, dur: 0.15, freq: 1800, q: 0.8, vol: 0.3, dest: musicBus });
      tone({ t, f0: 200, f1: 140, dur: 0.1, type: 'triangle', vol: 0.22, dest: musicBus });
    }
    if (tr.shake && tr.shake[i] === 'x') shaker(t, musicBus, 0.08);
    if (tr.bell && tr.bell[i] === 'x' && bar % 2 === 0) { tone({ t, f0: mtof(root + 36), dur: 1.0, type: 'sine', vol: 0.07, dest: musicBus }); }
    if (tr.bass) {
      const b = tr.bass[i];
      if (b != null) tone({ t, f0: mtof(root - 12 + b), dur: sp * 1.7, type: 'sawtooth', vol: 0.3, lp: 700, dest: musicBus });
    }
    if (tr.lead) {
      const line = tr.lead[bar % tr.lead.length];
      const m = line[i];
      if (m > 0) {
        let n = 1;
        while (i + n < 16 && line[i + n] === X) n++;
        const d = sp * n * (tr.leadDur || 0.95);
        if (tr.xylo) xylo(m, t, tr.leadVol * 1.3, Math.min(0.5, d), musicBus);
        else {
          tone({ t, f0: mtof(m), dur: d, type: tr.leadType, vol: tr.leadVol, lp: 3600, dest: musicBus });
          if (tr.leadType !== 'square') tone({ t, f0: mtof(m + 12), dur: d * 0.5, type: 'sine', vol: tr.leadVol * 0.35, dest: musicBus });
        }
      }
    }
    if (tr.arp) {
      const pat = [0, minor ? 3 : 4, 7, 12];
      tone({ t, f0: mtof(root + 12 + pat[i % 4]), dur: sp * 0.9, type: 'triangle', vol: tr.arp * 3, dest: musicBus });
    }
  }
  function pump() {
    const tr = TRACKS[curTrack];
    if (!tr || !ctx) return;
    if (nextT < now() - 0.2) nextT = now() + 0.05;
    const sp = 60 / tr.bpm / 4;
    while (nextT < now() + 0.15) {
      scheduleStep(tr, step, nextT);
      nextT += sp;
      step++;
    }
  }
  function music(name) {
    if (name === curTrack && timer) return;
    stopMusic();
    curTrack = name;
    if (!name || !musicOn || !TRACKS[name]) return;
    if (!ensure()) return;
    step = 0;
    nextT = now() + 0.06;
    timer = setInterval(pump, 30);
  }
  function stopMusic() { if (timer) { clearInterval(timer); timer = null; } }
  function duck(on) {
    if (!musicBus) return;
    musicBus.gain.setTargetAtTime(on ? MUSIC_LEVEL * 0.3 : MUSIC_LEVEL, now(), 0.12);
  }

  /* ══════════ เสียงพากย์ภาษาไทยแบบตื่นเต้น ══════════ */
  const canSpeak = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let thVoices = [], voice = null, voicePref = '', hype = true;
  function scoreVoice(v) {
    return (/natural/i.test(v.name) ? 8 : 0) + (/online/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0) +
      (/premwadee|achara/i.test(v.name) ? 1 : 0);
  }
  function findVoices() {
    if (!canSpeak()) return;
    const vs = window.speechSynthesis.getVoices() || [];
    thVoices = vs.filter(v => /^th/i.test(v.lang) || /thai/i.test(v.name)).sort((a, b) => scoreVoice(b) - scoreVoice(a));
    voice = thVoices.find(v => v.name === voicePref) || thVoices[0] || null;
  }
  if (canSpeak()) {
    findVoices();
    window.speechSynthesis.onvoiceschanged = findVoices;
  }

  /* อารมณ์ → ระดับเสียง (pitch) / ความเร็ว (rate) / การไต่ระดับระหว่างวลี (rise) */
  const EMO = {
    hype:   { p: 1.45, r: 1.12, rise: 0.07 },
    wow:    { p: 1.55, r: 1.08, rise: 0.05 },
    happy:  { p: 1.32, r: 1.06, rise: 0.04 },
    talk:   { p: 1.25, r: 1.04, rise: 0.03 },
    think:  { p: 1.12, r: 0.96, rise: -0.02 },
    calm:   { p: 1.18, r: 1.0, rise: 0.0 },
    sneaky: { p: 0.85, r: 1.05, rise: 0.05 }
  };
  const WHO = { pro: { dp: 0.04, dr: 0 }, zig: { dp: -0.4, dr: 0.03 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* แบ่งข้อความเป็นประโยค (ตัดที่ ! ? ขึ้นบรรทัด) แล้วแบ่งเป็นวลีตามช่องว่างแบบภาษาไทย */
  function plan(text, emo, who) {
    const E = EMO[emo] || EMO.talk, W = WHO[who] || WHO.pro;
    const sentences = [];
    let buf = '';
    for (const ch of text) {
      if (ch === '\n') { if (buf.trim()) sentences.push({ s: buf.trim(), end: '' }); buf = ''; continue; }
      if (ch === '!' || ch === '?') { if (buf.trim()) sentences.push({ s: buf.trim(), end: ch }); buf = ''; continue; }
      buf += ch;
    }
    if (buf.trim()) sentences.push({ s: buf.trim(), end: '' });
    const out = [];
    sentences.forEach((S, si) => {
      let ph = S.s.split(/\s+/).filter(Boolean);
      const merged = [];
      ph.forEach(p => {
        const last = merged[merged.length - 1];
        if (last && (last.length < 9 || p.length < 4)) merged[merged.length - 1] = last + ' ' + p;
        else merged.push(p);
      });
      while (merged.length > 3) {
        let best = 0, bl = 1e9;
        for (let k = 0; k < merged.length - 1; k++) { const l = merged[k].length + merged[k + 1].length; if (l < bl) { bl = l; best = k; } }
        merged.splice(best, 2, merged[best] + ' ' + merged[best + 1]);
      }
      const n = merged.length;
      const base = E.p + W.dp + (si % 2 ? 0.05 : 0);
      merged.forEach((t, j) => {
        let p = base + E.rise * j + (j % 2 ? 0.04 : -0.02);
        let r = E.r + W.dr + (j === 0 ? 0.03 : 0);
        if (j === n - 1 && S.end === '!') { p += 0.18; r -= 0.04; }
        if (j === n - 1 && S.end === '?') { p += 0.25; r -= 0.02; }
        out.push({ t, pitch: clamp(p, 0.3, 2), rate: clamp(r, 0.6, 1.6) });
      });
    });
    return out;
  }

  let speakId = 0, speakTimer = null;
  function speak(text, o) {
    o = o || {};
    if (!canSpeak() || !text || volume <= 0 || !voice) return;
    const clean = AP.M ? AP.M.speakify(text) : text;
    const E = EMO[o.emo] || EMO.talk, W = WHO[o.who] || WHO.pro;
    const chunks = hype ? plan(clean, o.emo, o.who)
      : [{ t: clean.replace(/[!?]/g, ' '), pitch: clamp(E.p + W.dp - 0.1, 0.3, 2), rate: E.r + W.dr }];
    const id = ++speakId;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    clearTimeout(speakTimer);
    /* Chrome ทิ้งเสียงแรกหลัง cancel ทันที จึงหน่วงนิดหนึ่ง */
    speakTimer = setTimeout(() => {
      if (id !== speakId) return;
      duck(true);
      chunks.forEach((c, i) => {
        try {
          const u = new SpeechSynthesisUtterance(c.t);
          u.lang = 'th-TH';
          if (voice) u.voice = voice;
          u.pitch = c.pitch;
          u.rate = c.rate;
          u.volume = Math.min(1, volume + 0.2);
          if (i === chunks.length - 1) u.onend = u.onerror = () => { if (id === speakId) duck(false); };
          window.speechSynthesis.speak(u);
        } catch (e) {}
      });
    }, 70);
  }
  function stopSpeak() {
    speakId++;
    clearTimeout(speakTimer);
    try { if (canSpeak()) window.speechSynthesis.cancel(); } catch (e) {}
    duck(false);
  }

  AP.audio = {
    unlock: ensure,
    sfx(name, arg) { try { if (SFX[name]) SFX[name](arg); } catch (e) { if (window.console) console.warn("sfx", name, e); } },
    names: () => Object.keys(SFX),
    music, stopMusic,
    setVolume(v) { volume = v; if (master) master.gain.value = v; if (v <= 0) stopSpeak(); },
    setMusic(on) { musicOn = on; if (!on) stopMusic(); else { const m = curTrack; curTrack = null; music(m); } },
    setHype(on) { hype = !!on; },
    setVoice(name) { voicePref = name || ''; findVoices(); },
    voices: () => thVoices.map(v => v.name),
    voiceName: () => voice ? voice.name : '',
    speak, stopSpeak, canSpeak,
    hasThaiVoice: () => !!voice
  };
})();
