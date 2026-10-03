/**
 * Chrono-Express Unified Galaxy Sky & World Renderer
 * Features:
 * - High-speed hyperdrive warp streaks and dense stardust smoke trailing the train
 * - Unified full-canvas rendering flowing behind the center glass window
 * - Natural planetary orbit paths
 */

class SkyRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.timeMinutes = 8 * 60; // 08:00
    this.trainProgress = 0; // 0 to 1
    this.trainRunning = false;
    this.trainSpeed = 0.007;
    this.particles = [];
    this.warpLines = [];
    this.stars = [];
    this.shootingStars = [];
    this.planets = [];
    this.orbitAngle = 0;

    this.initCosmos();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCosmos() {
    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        color: ['#ffffff', '#bae6fd', '#fef08a', '#fbcfe8', '#a7f3d0'][Math.floor(Math.random() * 5)]
      });
    }

    this.planets = [
      {
        name: 'Ruby World',
        baseRadius: 13,
        color: '#f43f5e',
        glow: 'rgba(244, 63, 94, 0.55)',
        orbitSpeed: 0.002,
        orbitX: 0.5,
        orbitY: 0.35,
        radiusX: 0.38,
        radiusY: 0.22,
        phaseOffset: 0
      },
      {
        name: 'Ringed Cosmos',
        hasRing: true,
        baseRadius: 15,
        color: '#f472b6',
        glow: 'rgba(244, 114, 182, 0.45)',
        orbitSpeed: 0.0016,
        orbitX: 0.5,
        orbitY: 0.38,
        radiusX: 0.46,
        radiusY: 0.26,
        phaseOffset: Math.PI * 0.65
      },
      {
        name: 'Azure Moon',
        baseRadius: 11,
        color: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.5)',
        orbitSpeed: 0.0022,
        orbitX: 0.5,
        orbitY: 0.36,
        radiusX: 0.28,
        radiusY: 0.16,
        phaseOffset: Math.PI * 1.3
      },
      {
        name: 'Emerald Giant',
        baseRadius: 9,
        color: '#34d399',
        glow: 'rgba(52, 211, 153, 0.45)',
        orbitSpeed: 0.0018,
        orbitX: 0.5,
        orbitY: 0.35,
        radiusX: 0.2,
        radiusY: 0.12,
        phaseOffset: Math.PI * 1.8
      }
    ];
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio || window.innerWidth;
    this.canvas.height = rect.height * window.devicePixelRatio || window.innerHeight;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.w = rect.width;
    this.h = rect.height;
  }

  setTimeMinutes(min) {
    this.timeMinutes = min % 1440;
  }

  startTrainRun(onComplete) {
    this.trainProgress = 0;
    this.trainRunning = true;
    this.onTrainComplete = onComplete;
  }

  resetTrain() {
    this.trainProgress = 0;
    this.trainRunning = false;
    this.onTrainComplete = null;
  }

  // Helper: Linear hex color interpolation
  lerpHex(hexA, hexB, t) {
    const parse = hex => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const n = parseInt(c, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const c1 = parse(hexA);
    const c2 = parse(hexB);
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r},${g},${b})`;
  }

  // Helper: RGBA string interpolation
  lerpRgba(rgbaA, rgbaB, t) {
    const parse = str => {
      const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return [0, 0, 0, 1];
      return [+match[1], +match[2], +match[3], match[4] !== undefined ? +match[4] : 1];
    };
    const c1 = parse(rgbaA);
    const c2 = parse(rgbaB);
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    const a = +(c1[3] + (c2[3] - c1[3]) * t).toFixed(3);
    return `rgba(${r},${g},${b},${a})`;
  }

  /**
   * 24-Hour Continuous Cosmic Palette Interpolator
   * Perfectly smooth transitions between midnight, dawn, morning, midday, afternoon, sunset and dusk
   */
  getCosmicPalette(min) {
    const m = (min % 1440 + 1440) % 1440;

    const KEYFRAMES = [
      // 00:00 - Midnight Starfield
      { min: 0,    grad: ['#030511', '#070c24', '#150c30', '#02030a'], neb1: 'rgba(139, 92, 246, 0.35)', neb2: 'rgba(6, 182, 212, 0.25)', starA: 1.0, sunA: 0, moonA: 1.0 },
      // 04:00 - Pre-dawn deep indigo
      { min: 240,  grad: ['#06091c', '#0f1536', '#251340', '#0a0a1e'], neb1: 'rgba(147, 51, 234, 0.35)', neb2: 'rgba(37, 99, 235, 0.28)', starA: 0.95, sunA: 0, moonA: 0.85 },
      // 05:30 - Dawn twilight (Warm peach-pink horizon glow)
      { min: 330,  grad: ['#0d1433', '#1c2552', '#6b2148', '#b45309'], neb1: 'rgba(236, 72, 153, 0.42)', neb2: 'rgba(245, 158, 11, 0.38)', starA: 0.75, sunA: 0.25, moonA: 0.3 },
      // 06:30 - Sunrise (Bright azure & golden rays)
      { min: 390,  grad: ['#172554', '#1d4ed8', '#0284c7', '#f59e0b'], neb1: 'rgba(244, 114, 182, 0.35)', neb2: 'rgba(56, 189, 248, 0.45)', starA: 0.55, sunA: 0.75, moonA: 0.0 },
      // 08:30 - Bright Morning Cosmic Day
      { min: 510,  grad: ['#1e40af', '#2563eb', '#38bdf8', '#fed7aa'], neb1: 'rgba(236, 72, 153, 0.25)', neb2: 'rgba(125, 211, 252, 0.4)', starA: 0.32, sunA: 0.95, moonA: 0.0 },
      // 12:00 - High Noon Brilliant Sky
      { min: 720,  grad: ['#0369a1', '#0284c7', '#38bdf8', '#bae6fd'], neb1: 'rgba(244, 114, 182, 0.2)',  neb2: 'rgba(56, 189, 248, 0.35)', starA: 0.2, sunA: 1.0, moonA: 0.0 },
      // 15:30 - Warm Afternoon Azure
      { min: 930,  grad: ['#1d4ed8', '#2563eb', '#60a5fa', '#fef08a'], neb1: 'rgba(236, 72, 153, 0.25)', neb2: 'rgba(253, 224, 71, 0.35)', starA: 0.32, sunA: 0.95, moonA: 0.0 },
      // 17:15 - Golden Hour
      { min: 1035, grad: ['#1e1b4b', '#4338ca', '#b45309', '#f97316'], neb1: 'rgba(244, 63, 94, 0.45)',  neb2: 'rgba(251, 146, 60, 0.45)', starA: 0.65, sunA: 0.75, moonA: 0.1 },
      // 18:30 - Sunset / Dusk (Magenta, Crimson & Violet)
      { min: 1110, grad: ['#140f32', '#3b0764', '#831843', '#c2410c'], neb1: 'rgba(225, 29, 72, 0.45)',  neb2: 'rgba(139, 92, 246, 0.4)',  starA: 0.82, sunA: 0.2, moonA: 0.5 },
      // 19:45 - Nightfall into Starry Deep Cosmos
      { min: 1185, grad: ['#080b22', '#101138', '#261240', '#080718'], neb1: 'rgba(126, 34, 206, 0.4)',  neb2: 'rgba(30, 58, 138, 0.35)', starA: 0.95, sunA: 0.0, moonA: 0.85 },
      // 24:00 - Wrap to midnight
      { min: 1440, grad: ['#030511', '#070c24', '#150c30', '#02030a'], neb1: 'rgba(139, 92, 246, 0.35)', neb2: 'rgba(6, 182, 212, 0.25)', starA: 1.0, sunA: 0, moonA: 1.0 }
    ];

    let i = 0;
    while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].min <= m) {
      i++;
    }
    const kf1 = KEYFRAMES[i];
    const kf2 = KEYFRAMES[i + 1] || KEYFRAMES[0];

    const span = kf2.min - kf1.min;
    let t = span > 0 ? (m - kf1.min) / span : 0;
    // Hermite smoothstep for ultra-fluid color easing
    t = Math.max(0, Math.min(1, t));
    const smoothT = t * t * (3 - 2 * t);

    return {
      grad1: this.lerpHex(kf1.grad[0], kf2.grad[0], smoothT),
      grad2: this.lerpHex(kf1.grad[1], kf2.grad[1], smoothT),
      grad3: this.lerpHex(kf1.grad[2], kf2.grad[2], smoothT),
      grad4: this.lerpHex(kf1.grad[3], kf2.grad[3], smoothT),
      nebula1: this.lerpRgba(kf1.neb1, kf2.neb1, smoothT),
      nebula2: this.lerpRgba(kf1.neb2, kf2.neb2, smoothT),
      starAlphaMult: kf1.starA + (kf2.starA - kf1.starA) * smoothT,
      sunAlpha: kf1.sunA + (kf2.sunA - kf1.sunA) * smoothT,
      moonAlpha: kf1.moonA + (kf2.moonA - kf1.moonA) * smoothT,
      isDay: (m >= 360 && m < 1080)
    };
  }

  drawCosmicBackground(palette) {
    this.currentPalette = palette;
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, palette.grad1);
    grad.addColorStop(0.3, palette.grad2);
    grad.addColorStop(0.7, palette.grad3);
    grad.addColorStop(1, palette.grad4);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.w, this.h);

    this.drawNebula(this.w * 0.25, this.h * 0.25, 180, palette.nebula1);
    this.drawNebula(this.w * 0.75, this.h * 0.45, 210, palette.nebula2);
    this.drawNebula(this.w * 0.5, this.h * 0.75, 160, palette.nebula1);

    // Draw Dynamic Sun & Moon based on time
    this.drawCelestialSunAndMoon(palette);
  }

  drawCelestialSunAndMoon(palette) {
    const min = this.timeMinutes;

    // 1. Draw Sun (during day hours ~ 06:00 to 18:00)
    if (palette.sunAlpha > 0.02) {
      this.ctx.save();
      this.ctx.globalAlpha = palette.sunAlpha;
      // Arc: starts on left at 06:00 (360), peaks at 12:00 (720), sets on right at 18:00 (1080)
      const sunRatio = Math.max(0, Math.min(1, (min - 360) / 720));
      const sunX = this.w * (0.12 + 0.76 * sunRatio);
      const sunY = this.h * (0.58 - 0.42 * Math.sin(Math.PI * sunRatio));

      // Sun Outer Corona
      const corona = this.ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 70);
      corona.addColorStop(0, 'rgba(255, 245, 204, 0.95)');
      corona.addColorStop(0.25, 'rgba(253, 224, 71, 0.6)');
      corona.addColorStop(0.65, 'rgba(245, 158, 11, 0.2)');
      corona.addColorStop(1, 'rgba(245, 158, 11, 0)');
      this.ctx.fillStyle = corona;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
      this.ctx.fill();

      // Sun Core Disc
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#fde047';
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Draw Moon (during night hours ~ 18:00 to 06:00)
    if (palette.moonAlpha > 0.02) {
      this.ctx.save();
      this.ctx.globalAlpha = palette.moonAlpha;
      // Moon night ratio
      let moonMin = min >= 1080 ? min - 1080 : min + 360; // 0 to 720
      const moonRatio = Math.max(0, Math.min(1, moonMin / 720));
      const moonX = this.w * (0.15 + 0.70 * moonRatio);
      const moonY = this.h * (0.52 - 0.36 * Math.sin(Math.PI * moonRatio));

      // Moon Aura
      const moonAura = this.ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 50);
      moonAura.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
      moonAura.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
      moonAura.addColorStop(1, 'rgba(56, 189, 248, 0)');
      this.ctx.fillStyle = moonAura;
      this.ctx.beginPath();
      this.ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
      this.ctx.fill();

      // Crescent Moon
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.beginPath();
      this.ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = palette.grad2;
      this.ctx.beginPath();
      this.ctx.arc(moonX + 6, moonY - 3, 13, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  drawNebula(x, y, radius, color) {
    this.ctx.save();
    const g = this.ctx.createRadialGradient(x, y, 10, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawStars() {
    this.ctx.save();
    const alphaMult = this.currentPalette ? (this.currentPalette.starAlphaMult || 1) : 1;
    this.stars.forEach(s => {
      s.alpha += s.twinkleSpeed;
      if (s.alpha > 1 || s.alpha < 0.2) s.twinkleSpeed = -s.twinkleSpeed;
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.max(0, Math.min(1, Math.abs(s.alpha) * alphaMult));
      this.ctx.beginPath();
      this.ctx.arc(s.x * this.w, s.y * this.h, s.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  updateAndDrawShootingStars() {
    if (Math.random() < 0.02 && this.shootingStars.length < 3) {
      this.shootingStars.push({
        x: Math.random() * this.w * 0.8,
        y: Math.random() * this.h * 0.5,
        len: Math.random() * 90 + 50,
        speed: Math.random() * 8 + 6,
        alpha: 1
      });
    }

    this.ctx.save();
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.speed;
      ss.y += ss.speed * 0.55;
      ss.alpha -= 0.035;

      if (ss.alpha <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.55);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawOrbitingPlanets() {
    this.orbitAngle += 0.005;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 6]);

    this.planets.forEach(p => {
      this.ctx.beginPath();
      this.ctx.ellipse(
        this.w * p.orbitX,
        this.h * p.orbitY,
        this.w * p.radiusX,
        this.h * p.radiusY,
        0, 0, Math.PI * 2
      );
      this.ctx.stroke();
    });
    this.ctx.restore();

    this.planets.forEach(p => {
      const currentA = this.orbitAngle * (p.orbitSpeed * 300) + p.phaseOffset;
      const px = this.w * p.orbitX + Math.cos(currentA) * (this.w * p.radiusX);
      const py = this.h * p.orbitY + Math.sin(currentA) * (this.h * p.radiusY);

      this.ctx.save();
      const glow = this.ctx.createRadialGradient(px, py, 2, px, py, p.baseRadius * 2.5);
      glow.addColorStop(0, p.glow);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.baseRadius * 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.isSun) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(px, py, p.baseRadius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (p.hasRing) {
        this.ctx.strokeStyle = 'rgba(251, 207, 232, 0.75)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(px, py, p.baseRadius * 1.9, p.baseRadius * 0.65, -0.25, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.restore();
    });
  }

  drawCosmicTrack(trackY) {
    this.ctx.save();

    this.ctx.strokeStyle = '#06b6d4';
    this.ctx.lineWidth = 3.5;
    this.ctx.shadowColor = '#22d3ee';
    this.ctx.shadowBlur = 14;
    this.ctx.beginPath();
    this.ctx.moveTo(0, trackY);
    this.ctx.lineTo(this.w, trackY);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#ec4899';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#f472b6';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(0, trackY + 8);
    this.ctx.lineTo(this.w, trackY + 8);
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
    const tieSpacing = 28;
    for (let x = 0; x < this.w; x += tieSpacing) {
      this.ctx.fillStyle = 'rgba(167, 139, 250, 0.7)';
      this.ctx.fillRect(x, trackY - 2, 4, 12);
    }

    this.drawSpaceStation(this.w * 0.08, trackY, '🚀 ท่าอวกาศต้นทาง');
    this.drawSpaceStation(this.w * 0.92, trackY, '🪐 ชุมทางกาแล็กซีปลายทาง');

    this.ctx.restore();
  }

  drawSpaceStation(x, trackY, name) {
    this.ctx.save();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(x, trackY - 25, 18, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = '#f43f5e';
    this.ctx.beginPath();
    this.ctx.arc(x, trackY - 48, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 11px Prompt, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(name, x, trackY + 24);
    this.ctx.restore();
  }

  /**
   * Enhanced High-Speed Smoke & Plasma Trail Generator
   * Creates rich billowing particle clouds and speed streaks when running!
   */
  emitDenseThrusterSmoke(x, y) {
    const count = this.trainRunning ? 12 : 3;
    const colors = ['#06b6d4', '#38bdf8', '#ec4899', '#fde047', '#a855f7', '#ffffff'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 12 - 6),
        vx: this.trainRunning ? (Math.random() * -6 - 4) : (Math.random() * -2 - 1),
        vy: (Math.random() - 0.5) * (this.trainRunning ? 3.5 : 1.5),
        radius: Math.random() * (this.trainRunning ? 12 : 5) + 4,
        growth: this.trainRunning ? 0.35 : 0.1,
        alpha: 0.9,
        fadeSpeed: this.trainRunning ? 0.022 : 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Add high-speed laser streak lines along the railway track
    if (this.trainRunning && Math.random() < 0.4) {
      this.warpLines.push({
        x: x + 60,
        y: y + (Math.random() * 40 - 20),
        len: Math.random() * 80 + 40,
        speed: Math.random() * 12 + 10,
        alpha: 0.85,
        color: Math.random() < 0.5 ? '#22d3ee' : '#f472b6'
      });
    }
  }

  updateAndDrawParticles() {
    this.ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.radius += p.growth;
      p.alpha -= p.fadeSpeed;

      if (p.alpha <= 0 || p.radius <= 0.5) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = this.trainRunning ? 10 : 4;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  updateAndDrawWarpStreaks() {
    if (!this.trainRunning && this.warpLines.length === 0) return;

    this.ctx.save();
    for (let i = this.warpLines.length - 1; i >= 0; i--) {
      const w = this.warpLines[i];
      w.x -= w.speed;
      w.alpha -= 0.04;

      if (w.alpha <= 0 || w.x < -100) {
        this.warpLines.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = w.color;
      this.ctx.globalAlpha = w.alpha;
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = w.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.moveTo(w.x, w.y);
      this.ctx.lineTo(w.x - w.len, w.y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSpaceTrain(x, trackY) {
    this.ctx.save();

    // Subtle engine rumble vibration when running
    const rumbleY = this.trainRunning ? (Math.random() - 0.5) * 2.5 : 0;
    this.ctx.translate(x, trackY + rumbleY);

    // Emit dense trailing stardust smoke
    this.emitDenseThrusterSmoke(x - 55, trackY - 16);

    // Booster
    this.ctx.fillStyle = '#312e81';
    this.ctx.strokeStyle = '#06b6d4';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(-60, -26, 20, 20, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Intense Plasma Flame (Larger & brighter when running!)
    const flameSize = this.trainRunning ? 42 : 22;
    const flameGlow = this.ctx.createRadialGradient(-60, -16, 2, -60 - flameSize, -16, flameSize);
    flameGlow.addColorStop(0, '#ffffff');
    flameGlow.addColorStop(0.3, '#38bdf8');
    flameGlow.addColorStop(0.7, '#ec4899');
    flameGlow.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = flameGlow;
    this.ctx.beginPath();
    this.ctx.arc(-65, -16, flameSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Train Hull
    const hullGrad = this.ctx.createLinearGradient(-40, -38, 40, 0);
    hullGrad.addColorStop(0, '#1e1b4b');
    hullGrad.addColorStop(0.5, '#4338ca');
    hullGrad.addColorStop(1, '#06b6d4');
    this.ctx.fillStyle = hullGrad;
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(-45, -2);
    this.ctx.lineTo(25, -2);
    this.ctx.quadraticCurveTo(55, -2, 58, -18);
    this.ctx.quadraticCurveTo(52, -34, 25, -34);
    this.ctx.lineTo(-45, -34);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Canopy
    const canopy = this.ctx.createLinearGradient(0, -32, 45, -18);
    canopy.addColorStop(0, '#a5f3fc');
    canopy.addColorStop(1, '#0284c7');
    this.ctx.fillStyle = canopy;
    this.ctx.beginPath();
    this.ctx.moveTo(8, -30);
    this.ctx.lineTo(34, -30);
    this.ctx.quadraticCurveTo(48, -20, 45, -15);
    this.ctx.lineTo(8, -15);
    this.ctx.closePath();
    this.ctx.fill();

    // Neon Trim
    this.ctx.strokeStyle = '#fde047';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#fde047';
    this.ctx.shadowBlur = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(-35, -18);
    this.ctx.lineTo(5, -18);
    this.ctx.stroke();

    // Headlight Beam
    const headlightX = 54;
    const headlightY = -18;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(headlightX, headlightY, 6, 0, Math.PI * 2);
    this.ctx.fill();

    const beamDist = this.trainRunning ? 260 : 180;
    const beam = this.ctx.createLinearGradient(headlightX, headlightY, headlightX + beamDist, headlightY);
    beam.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    beam.addColorStop(0.6, 'rgba(236, 72, 153, 0.35)');
    beam.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = beam;
    this.ctx.beginPath();
    this.ctx.moveTo(headlightX, headlightY - 5);
    this.ctx.lineTo(headlightX + beamDist, headlightY - 36);
    this.ctx.lineTo(headlightX + beamDist, headlightY + 36);
    this.ctx.lineTo(headlightX, headlightY + 5);
    this.ctx.closePath();
    this.ctx.fill();

    // Maglev Rings
    [-30, 0, 30].forEach(rx => {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.shadowColor = '#06b6d4';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(rx, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  animate() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.w, this.h);

    const palette = this.getCosmicPalette(this.timeMinutes);
    this.drawCosmicBackground(palette);
    this.drawStars();
    this.updateAndDrawShootingStars();
    this.drawOrbitingPlanets();

    const trackY = 175;
    this.drawCosmicTrack(trackY);

    if (this.trainRunning) {
      this.trainProgress += this.trainSpeed;
      if (this.trainProgress >= 1.0) {
        this.trainProgress = 1.0;
        this.trainRunning = false;
        if (this.onTrainComplete) {
          const cb = this.onTrainComplete;
          this.onTrainComplete = null;
          cb();
        }
      }
    }

    const startX = this.w * 0.08;
    const endX = this.w * 0.92;
    const currentX = startX + (endX - startX) * this.trainProgress;

    this.updateAndDrawWarpStreaks();
    this.updateAndDrawParticles();
    this.drawSpaceTrain(currentX, trackY);

    requestAnimationFrame(this.animate);
  }
}

window.SkyRenderer = SkyRenderer;
