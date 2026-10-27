// Web Audio: synthesized SFX, looping BGM sequencer, engine hum. Fails silently if audio is unavailable.
let ctx = null, master = null, musicBus = null, sfxBus = null, engine = null;
let muted = false, musicOn = true, seqTimer = null, step = 0, nextTime = 0, intensity = 0;

function init() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.32; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
  } catch { ctx = null; }
  return ctx;
}

function tone({ f = 440, f2, type = 'sine', dur = 0.15, vol = 0.3, at = 0, bus, attack = 0.005 }) {
  if (!init()) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus || sfxBus);
  o.start(t); o.stop(t + dur + 0.05);
}

let noiseBuf = null;
function noise({ dur = 0.3, vol = 0.2, f = 1200, f2, q = 1, at = 0, type = 'bandpass', bus }) {
  if (!init()) return;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf;
  fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(bus || sfxBus);
  s.start(t); s.stop(t + dur + 0.05);
}

export const sfx = {
  unlock() { init(); if (ctx?.state === 'suspended') ctx.resume(); },
  tap() { tone({ f: 660, f2: 990, type: 'sine', dur: 0.09, vol: 0.25 }); },
  pop() { tone({ f: 420, f2: 1200, type: 'sine', dur: 0.12, vol: 0.3 }); noise({ dur: 0.05, vol: 0.08, f: 3000 }); },
  lane() { tone({ f: 520, f2: 760, type: 'triangle', dur: 0.08, vol: 0.18 }); },
  coin() { tone({ f: 1320, type: 'square', dur: 0.06, vol: 0.08 }); tone({ f: 1760, type: 'square', dur: 0.12, vol: 0.08, at: 0.06 }); },
  correct() {
    [784, 988, 1175, 1568].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.25, vol: 0.22, at: i * 0.07 }));
    [2093, 2637].forEach((f, i) => tone({ f, type: 'sine', dur: 0.6, vol: 0.12, at: 0.3 + i * 0.08 })); // glass bell
    noise({ dur: 0.6, vol: 0.12, f: 600, f2: 5000, q: 0.7 });
  },
  wrong() { tone({ f: 300, f2: 160, type: 'sine', dur: 0.3, vol: 0.28 }); noise({ dur: 0.35, vol: 0.12, f: 800, f2: 200, type: 'lowpass' }); },
  boost() { noise({ dur: 0.8, vol: 0.25, f: 300, f2: 4000, q: 0.8 }); tone({ f: 200, f2: 900, type: 'sawtooth', dur: 0.5, vol: 0.06 }); },
  checkpoint() { [1047, 1319, 1568].forEach((f, i) => tone({ f, type: 'sine', dur: 0.3, vol: 0.18, at: i * 0.09 })); },
  count(go) { tone({ f: go ? 1046 : 523, type: 'square', dur: go ? 0.5 : 0.18, vol: 0.14 }); },
  finish() {
    [523, 659, 784, 1046, 784, 1046, 1319].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.3, vol: 0.2, at: i * 0.12 }));
    noise({ dur: 1.2, vol: 0.1, f: 4000, q: 0.5, at: 0.4 });
  },
  tick() { tone({ f: 1500, type: 'square', dur: 0.03, vol: 0.06 }); },
  itemGet() { [988, 1319, 1760].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.16, vol: 0.16, at: i * 0.05 })); },
  shoot() { tone({ f: 900, f2: 300, type: 'sawtooth', dur: 0.25, vol: 0.08 }); noise({ dur: 0.3, vol: 0.1, f: 2000, f2: 600 }); },
  plop() { tone({ f: 200, f2: 90, type: 'sine', dur: 0.25, vol: 0.3 }); },
  hit() { tone({ f: 600, f2: 150, type: 'square', dur: 0.35, vol: 0.1 }); [0, 0.08, 0.16].forEach((at) => tone({ f: 1200, type: 'sine', dur: 0.08, vol: 0.08, at })); },
  shield() { tone({ f: 500, f2: 1500, type: 'sine', dur: 0.4, vol: 0.18 }); noise({ dur: 0.4, vol: 0.06, f: 5000, q: 2 }); },
  buy() { [784, 1047, 1319, 1568].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.2, vol: 0.18, at: i * 0.06 })); },
  star(i) { tone({ f: 880 * Math.pow(1.26, i), type: 'triangle', dur: 0.35, vol: 0.2 }); tone({ f: 1760 * Math.pow(1.26, i), type: 'sine', dur: 0.5, vol: 0.1, at: 0.05 }); },
};

// ---------- Engine hum ----------
export function engineSpeed(v) {
  if (!init() || muted) return;
  if (!engine) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus);
    o.start(); o2.start();
    engine = { o, o2, g, f };
  }
  const t = ctx.currentTime;
  engine.o.frequency.setTargetAtTime(45 + v * 2.6, t, 0.1);
  engine.o2.frequency.setTargetAtTime(22 + v * 1.3, t, 0.1);
  engine.f.frequency.setTargetAtTime(300 + v * 25, t, 0.1);
  engine.g.gain.setTargetAtTime(v > 0.5 ? 0.035 : 0, t, 0.15);
}

// ---------- BGM: bright 4-chord loop, intensity 0 (menu) .. 1 (race) ----------
const CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; // C G Am F
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 128, SIXTEENTH = 60 / BPM / 4;

function scheduleStep(t) {
  const bar = Math.floor(step / 16) % 4, s = step % 16, ch = CHORDS[bar];
  const at = t - ctx.currentTime;
  if (s % 4 === 0) tone({ f: mtof(ch[0] - 24), type: 'triangle', dur: 0.28, vol: 0.32, at, bus: musicBus });
  if (s % 8 === 4 && intensity > 0.5) noise({ dur: 0.12, vol: 0.12, f: 1800, at, bus: musicBus });
  if (s % 2 === 1 && intensity > 0.5) noise({ dur: 0.04, vol: 0.05, f: 8000, type: 'highpass', at, bus: musicBus });
  if (s === 0) ch.forEach((m) => tone({ f: mtof(m), type: 'sine', dur: 1.6, vol: 0.06, at, bus: musicBus, attack: 0.08 }));
  const arp = [0, 1, 2, 1, 2, 0, 1, 2];
  if (intensity > 0.2 || s % 2 === 0) tone({ f: mtof(ch[arp[s % 8]] + 12 + (s >= 8 ? 12 : 0) * (intensity > 0.5 ? 1 : 0)), type: 'triangle', dur: 0.14, vol: 0.07, at, bus: musicBus });
  const mel = [72, 0, 74, 76, 0, 79, 0, 76, 74, 0, 72, 0, 74, 0, 76, 0];
  if (intensity > 0.5 && mel[s] && bar % 2 === 1) tone({ f: mtof(mel[s] + (bar === 3 ? -3 : 0)), type: 'square', dur: 0.16, vol: 0.035, at, bus: musicBus });
  step++;
}

export const music = {
  play(level = 0) {
    intensity = level;
    if (!init() || seqTimer) return;
    nextTime = ctx.currentTime + 0.1;
    seqTimer = setInterval(() => {
      if (!musicOn || muted) { nextTime = ctx.currentTime + 0.1; return; }
      while (nextTime < ctx.currentTime + 0.12) { scheduleStep(nextTime); nextTime += SIXTEENTH; }
    }, 25);
  },
  setIntensity(v) { intensity = v; },
  stop() { clearInterval(seqTimer); seqTimer = null; },
};

export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05);
  if (m && engine) engine.g.gain.value = 0;
}
export const isMuted = () => muted;

// Read text aloud with the browser voice (Thai or English), if available.
export function speak(text, lang = 'th-TH') {
  try {
    if (!('speechSynthesis' in window) || muted) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/(\d+)\/(\d+)/g, '$1 ส่วน $2').replace(/÷/g, ' หาร ').replace(/ x /g, ' คูณ '));
    u.lang = lang;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    u.rate = 0.95; u.pitch = 1.15;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
