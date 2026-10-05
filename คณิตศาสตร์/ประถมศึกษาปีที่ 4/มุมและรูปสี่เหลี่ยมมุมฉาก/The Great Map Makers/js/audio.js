/**
 * THE GREAT MAP MAKERS - WebAudio & Speech Synthesis Engine
 * Zero external audio dependencies. Procedural sound synthesis and Thai TTS.
 */
(function () {
  'use strict';

  let ctx = null;
  let musicGain = null;
  let sfxGain = null;
  let ambientOsc = null;
  let isMuted = false;
  let isAmbientOn = false;

  function getAudioCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
        musicGain = ctx.createGain();
        sfxGain = ctx.createGain();
        musicGain.gain.setValueAtTime(0.18, ctx.currentTime);
        sfxGain.gain.setValueAtTime(0.45, ctx.currentTime);
        musicGain.connect(ctx.destination);
        sfxGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Create an envelope tone helper
  function playTone(freq, type = 'sine', duration = 0.25, gainVal = 0.35, detune = 0) {
    const ac = getAudioCtx();
    if (!ac || isMuted) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (detune) osc.detune.setValueAtTime(detune, ac.currentTime);

    g.gain.setValueAtTime(0.001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(gainVal, ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);

    osc.connect(g);
    g.connect(sfxGain);

    osc.start();
    osc.stop(ac.currentTime + duration);
  }

  const Sounds = {
    click() {
      // Wood/parchment soft tap
      playTone(320, 'triangle', 0.08, 0.25);
    },

    point() {
      // Pin drop / crisp droplet plink
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      playTone(784, 'sine', 0.12, 0.4); // G5
      setTimeout(() => playTone(1174, 'sine', 0.18, 0.3), 35); // D6
    },

    segment() {
      // Snappy ruler connect
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      playTone(440, 'triangle', 0.1, 0.3); // A4
      setTimeout(() => playTone(659, 'sine', 0.16, 0.35), 45); // E5
      setTimeout(() => playTone(880, 'sine', 0.25, 0.4), 90); // A5
    },

    line() {
      // Line extending infinitely in both directions (double swoosh)
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      [392, 523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => playTone(f, 'triangle', 0.2, 0.25), i * 35);
      });
    },

    ray() {
      // Beam shot forward from origin (Lighthouse ray pulse)
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.3, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(g);
      g.connect(sfxGain);
      osc.start();
      osc.stop(now + 0.4);
    },

    angle() {
      // Rotating compass arm / gear click
      playTone(587, 'triangle', 0.07, 0.25);
    },

    rightAngleLock() {
      // Magical 90 degree lock snap! (WOW Moment)
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      // Golden major triad chime
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        setTimeout(() => playTone(f, 'sine', 0.45, 0.35), idx * 60);
      });
      // Metallic resonant lock
      setTimeout(() => playTone(261.63, 'triangle', 0.25, 0.4), 180);
    },

    rectangle() {
      // 4 corners lock into rectangle
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      [440, 554, 659, 880].forEach((f, idx) => {
        setTimeout(() => playTone(f, 'sine', 0.3, 0.35), idx * 70);
      });
      setTimeout(() => playTone(1108, 'sine', 0.5, 0.4), 320);
    },

    unlock() {
      // Fog lifts / new island unlocked
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      [330, 392, 493, 587, 659, 784, 987, 1174].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.4, 0.25), i * 50);
      });
    },

    discovery() {
      // Found secret or new map item
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      [587, 740, 880, 1174].forEach((f, i) => {
        setTimeout(() => playTone(f, 'triangle', 0.35, 0.3), i * 65);
      });
    },

    cheer() {
      // Mission Complete Fanfare
      const ac = getAudioCtx();
      if (!ac || isMuted) return;
      const notes = [
        { f: 523, d: 0.12, w: 0 },
        { f: 659, d: 0.12, w: 120 },
        { f: 784, d: 0.18, w: 240 },
        { f: 1046, d: 0.45, w: 380 }
      ];
      notes.forEach(n => {
        setTimeout(() => playTone(n.f, 'sine', n.d, 0.35), n.w);
      });
    },

    error() {
      // Gentle encouragement thud
      playTone(220, 'sine', 0.18, 0.2);
      setTimeout(() => playTone(196, 'sine', 0.22, 0.18), 70);
    },

    // Procedural warm ocean ambient background
    startAmbient() {
      const ac = getAudioCtx();
      if (!ac || isAmbientOn || isMuted) return;
      isAmbientOn = true;

      // Soft melodic chord generator for Maporia exploration
      const chords = [
        [261.6, 329.6, 392.0], // C
        [220.0, 261.6, 329.6], // Am
        [174.6, 220.0, 261.6], // F
        [196.0, 246.9, 293.6]  // G
      ];
      let step = 0;

      function playChordLoop() {
        if (!isAmbientOn || isMuted) return;
        const currentChord = chords[step % chords.length];
        step++;
        currentChord.forEach((freq, idx) => {
          setTimeout(() => {
            if (!isAmbientOn || isMuted) return;
            playTone(freq * 1.5, 'sine', 2.2, 0.08);
          }, idx * 160);
        });
        ambientOsc = setTimeout(playChordLoop, 4500);
      }
      playChordLoop();
    },

    stopAmbient() {
      isAmbientOn = false;
      if (ambientOsc) clearTimeout(ambientOsc);
    },

    toggleSound() {
      isMuted = !isMuted;
      if (isMuted) {
        this.stopAmbient();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } else {
        this.startAmbient();
      }
      return !isMuted;
    },

    isMuted: () => isMuted,

    // Thai Speech Synthesis for Accessibility (Kids Grade 4)
    speak(text) {
      if (isMuted || !text || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/<[^>]*>/g, '').trim();
        if (!clean) return;

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'th-TH';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        // Try to pick a Thai voice if available
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH'));
        if (thaiVoice) utterance.voice = thaiVoice;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[MapAudio] Speech error:', err);
      }
    }
  };

  // Unlock audio context on first user touch
  function initUnlock() {
    const unlock = () => {
      getAudioCtx();
      Sounds.startAmbient();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  }
  initUnlock();

  window.MapAudio = Sounds;
})();
