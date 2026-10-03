/**
 * Chrono-Beast 2D Pixel Art Field & Pet Engine
 * Version 3.5: Dynamic Environment & Quest Action Engine
 * 
 * Features:
 * - Dynamic Scenes: 'castle', 'volcano', 'snow', 'storm', 'galaxy', 'forest', 'temple', 'ruins', 'meadow'
 * - Dynamic Pet Actions: 'attack_castle', 'breathe_fire', 'flying', 'roar', 'sleeping', 'hunt', 'catch_lightning', 'fight_monster', 'defend', 'walk'
 * - 10 Pixel Art Companions
 * - Celebration jump on correct answer & sweatdrop on wrong answer
 * - 100% Kid-friendly retro pixel art rendering
 */

class PixelFieldRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Current Active Pet & Environment
    this.currentPetId = 1;
    this.petType = 'dragon';
    this.currentScene = 'volcano';
    this.currentAction = 'breathe_fire';

    // Pet Physics & State
    this.pet = {
      x: 240,
      y: 200,
      baseY: 200,
      vx: 1.0,
      facing: 1, // 1 = right, -1 = left
      state: 'action', // 'action', 'jump', 'idle', 'walk'
      actionTimer: 0,
      jumpY: 0,
      jumpVy: 0,
      emote: null,
      emoteTimer: 0
    };

    // Dynamic Projectiles & Particles (for attacks, breath, fireflies, snow, rain, embers)
    this.particles = [];
    this.projectiles = [];
    this.impacts = [];
    this.zzzList = [];
    this.lightningFlash = 0;

    // Environmental elements
    this.clouds = [
      { x: 30, y: 25, speed: 0.25, w: 90, h: 26 },
      { x: 280, y: 35, speed: 0.18, w: 120, h: 30 },
      { x: 550, y: 20, speed: 0.3, w: 85, h: 24 }
    ];

    this.windTime = 0;
    this.resizeCanvas();
    this.bindEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 800;
    this.canvas.height = rect.height || 260;

    this.pet.baseY = this.canvas.height - 68;
    this.pet.y = this.pet.baseY;
    if (this.pet.x > this.canvas.width - 160) {
      this.pet.x = this.canvas.width * 0.35;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());
    // Note: click-to-pet system removed as requested
  }

  setSceneAndAction(sceneName, actionName) {
    this.currentScene = sceneName || 'meadow';
    this.currentAction = actionName || 'walk';
    this.pet.actionTimer = 0;
    this.pet.state = 'action';
    this.projectiles = [];
    this.impacts = [];
    this.zzzList = [];

    // Adjust pet starting position based on action
    if (this.currentAction === 'attack_castle' || this.currentAction === 'flying') {
      this.pet.facing = 1;
      this.pet.x = Math.max(80, this.canvas.width * 0.25);
    } else if (this.currentAction === 'breathe_fire' || this.currentAction === 'fight_monster') {
      this.pet.facing = 1;
      this.pet.x = Math.max(90, this.canvas.width * 0.28);
    } else {
      this.pet.facing = 1;
    }
  }

  setPet(petId) {
    this.currentPetId = petId;
    const petTypes = {
      1: 'dragon', 2: 'tiger', 3: 'gryphon', 4: 'phoenix', 5: 'wolf',
      6: 'bear', 7: 'fox', 8: 'lion', 9: 'stag', 10: 'unicorn'
    };
    this.petType = petTypes[petId] || 'dragon';
    this.triggerCheer();
  }

  triggerCheer() {
    this.pet.state = 'jump';
    this.pet.jumpVy = -6.5;
    this.showEmote('✨');
  }

  triggerWrongReaction() {
    this.showEmote('💧');
    this.pet.state = 'idle';
  }

  showEmote(emoji) {
    this.pet.emote = emoji;
    this.pet.emoteTimer = 1.8;
  }

  /* ========================================================================
     Update Loop
     ======================================================================== */
  update(delta) {
    this.windTime += delta;
    this.pet.actionTimer += delta;

    // Emote timer
    if (this.pet.emoteTimer > 0) {
      this.pet.emoteTimer -= delta;
      if (this.pet.emoteTimer <= 0) this.pet.emote = null;
    }

    // Clouds
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > this.canvas.width + 150) c.x = -150;
    });

    // Handle Jump physics (on cheer)
    if (this.pet.state === 'jump') {
      this.pet.jumpY += this.pet.jumpVy;
      this.pet.jumpVy += 0.35;
      if (this.pet.jumpY >= 0) {
        this.pet.jumpY = 0;
        this.pet.jumpVy = 0;
        this.pet.state = 'action';
      }
    }

    // Action Mechanics
    const action = this.currentAction;
    const groundY = this.pet.baseY;

    if (action === 'attack_castle') {
      // Pet hovers in air, fires plasma balls at castle on the right
      this.pet.y = groundY - 45 + Math.sin(this.windTime * 4) * 8;
      this.pet.facing = 1;

      // Periodically fire projectile
      if (Math.floor(this.pet.actionTimer * 2.5) !== Math.floor((this.pet.actionTimer - delta) * 2.5)) {
        this.projectiles.push({
          x: this.pet.x + 35,
          y: this.pet.y - 15,
          vx: 7,
          vy: (Math.random() - 0.5) * 1.5,
          color: '#f97316',
          targetX: this.canvas.width - 90
        });
      }
    } else if (action === 'flying') {
      // Pet soars through sky smoothly
      this.pet.y = groundY - 55 + Math.sin(this.windTime * 3) * 16;
      this.pet.x += this.pet.vx * this.pet.facing * 0.8;
      if (this.pet.x > this.canvas.width - 120) this.pet.facing = -1;
      if (this.pet.x < 80) this.pet.facing = 1;
    } else if (action === 'breathe_fire') {
      // Pet stands, head reared, streaming flame particles
      this.pet.y = groundY;
      this.pet.facing = 1;
      // Spawn flame particles
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: this.pet.x + 38,
          y: this.pet.y - 18 + (Math.random() - 0.5) * 6,
          vx: Math.random() * 5 + 4,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 6 + 3,
          color: Math.random() > 0.4 ? '#f97316' : '#fde047',
          life: 0.5,
          maxLife: 0.5
        });
      }
    } else if (action === 'roar') {
      // Pet roars with expanding sonic rings
      this.pet.y = groundY;
      if (Math.floor(this.pet.actionTimer * 1.5) !== Math.floor((this.pet.actionTimer - delta) * 1.5)) {
        this.particles.push({
          type: 'sonic',
          x: this.pet.x + 25 * this.pet.facing,
          y: this.pet.y - 20,
          radius: 6,
          maxRadius: 45,
          life: 0.8,
          maxLife: 0.8
        });
      }
    } else if (action === 'sleeping') {
      // Pet sleeps with floating Zzz
      this.pet.y = groundY + 8;
      if (Math.floor(this.pet.actionTimer * 1.2) !== Math.floor((this.pet.actionTimer - delta) * 1.2)) {
        this.zzzList.push({
          x: this.pet.x + 10,
          y: this.pet.y - 18,
          life: 1.6,
          text: Math.random() > 0.5 ? 'Z' : 'z'
        });
      }
    } else if (action === 'hunt') {
      // Pet stalks low, dashes forward and pounces
      this.pet.y = groundY;
      this.pet.x += this.pet.vx * this.pet.facing * 1.5;
      if (this.pet.x > this.canvas.width - 120) this.pet.facing = -1;
      if (this.pet.x < 70) this.pet.facing = 1;
    } else if (action === 'catch_lightning') {
      // Gryphon / creature standing while lightning strikes
      this.pet.y = groundY - 15 + Math.sin(this.windTime * 5) * 5;
      if (Math.random() < 0.05) {
        this.lightningFlash = 0.2;
      }
    } else if (action === 'fight_monster') {
      // Pet shoots blasts at monster
      this.pet.y = groundY;
      this.pet.facing = 1;
      if (Math.floor(this.pet.actionTimer * 2) !== Math.floor((this.pet.actionTimer - delta) * 2)) {
        this.projectiles.push({
          x: this.pet.x + 35,
          y: this.pet.y - 15,
          vx: 8,
          vy: (Math.random() - 0.5) * 1,
          color: '#a855f7',
          targetX: this.canvas.width - 100
        });
      }
    } else {
      // Default: walking wander
      this.pet.y = groundY;
      this.pet.x += this.pet.vx * this.pet.facing * 0.8;
      if (this.pet.x > this.canvas.width - 80) this.pet.facing = -1;
      if (this.pet.x < 60) this.pet.facing = 1;
    }

    // Update Projectiles
    this.projectiles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x >= p.targetX) {
        // Impact burst
        for (let i = 0; i < 6; i++) {
          this.impacts.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 5 + 3,
            color: p.color,
            life: 0.4
          });
        }
        this.projectiles.splice(idx, 1);
      }
    });

    // Update Particles
    this.particles.forEach((p, idx) => {
      p.life -= delta;
      if (p.type === 'sonic') {
        p.radius += 55 * delta;
      } else {
        p.x += (p.vx || 0);
        p.y += (p.vy || 0);
      }
      if (p.life <= 0) this.particles.splice(idx, 1);
    });

    // Update Impacts
    this.impacts.forEach((imp, idx) => {
      imp.life -= delta;
      imp.x += imp.vx;
      imp.y += imp.vy;
      if (imp.life <= 0) this.impacts.splice(idx, 1);
    });

    // Update Zzz
    this.zzzList.forEach((z, idx) => {
      z.y -= 20 * delta;
      z.x += Math.sin(z.y * 0.1) * 0.5;
      z.life -= delta;
      if (z.life <= 0) this.zzzList.splice(idx, 1);
    });

    // Lightning Flash fade
    if (this.lightningFlash > 0) {
      this.lightningFlash -= delta;
    }
  }

  /* ========================================================================
     Draw Loop
     ======================================================================== */
  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    // 1. Draw Dynamic Scene Background
    this.drawSceneBackground(w, h);

    // 2. Draw Scene Foreground Objects (e.g., Castle, Volcano, Shadow Monster)
    this.drawSceneForeground(w, h);

    // 3. Draw Projectiles & Particles
    this.drawProjectilesAndParticles();

    // 4. Draw Animated 2D Pixel Pet
    const petDrawY = this.pet.y + this.pet.jumpY;
    this.drawPixelPet(this.pet.x, petDrawY, this.pet.facing);

    // 5. Draw Emote Bubble
    if (this.pet.emote) {
      this.drawEmote(this.pet.x, petDrawY - 60, this.pet.emote);
    }

    // 6. Draw Zzz if sleeping
    this.zzzList.forEach(z => {
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(z.text, z.x, z.y);
    });

    // 7. Lightning Flash Overlay
    if (this.lightningFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 2.5})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  /* ========================================================================
     Scene Backgrounds: Castle, Volcano, Snow, Storm, Galaxy, Forest, Temple
     ======================================================================== */
  drawSceneBackground(w, h) {
    const ctx = this.ctx;
    const scene = this.currentScene;
    const groundY = h * 0.65;

    if (scene === 'castle') {
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(1, '#bae6fd');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Clouds
      this.clouds.forEach(c => this.drawPixelCloud(c.x, c.y, c.w, c.h));

      // Lush Meadow Ground
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, groundY + 20, w, h - groundY - 20);

    } else if (scene === 'volcano') {
      // Fire Red / Magma Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#7f1d1d');
      sky.addColorStop(0.6, '#b91c1c');
      sky.addColorStop(1, '#f97316');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Distant Volcanic Peaks
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, groundY);
      ctx.lineTo(w * 0.45, groundY - 80);
      ctx.lineTo(w * 0.7, groundY);
      ctx.fill();

      // Lava Crater Ground
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(0, groundY + 24, w, 8); // Lava river
      ctx.fillStyle = '#fde047';
      ctx.fillRect(w * 0.2, groundY + 26, w * 0.6, 4);

    } else if (scene === 'snow') {
      // Arctic Cyan / Snow Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#0369a1');
      sky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Snow Mountains
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(w * 0.1, groundY);
      ctx.lineTo(w * 0.35, groundY - 70);
      ctx.lineTo(w * 0.6, groundY);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(w * 0.28, groundY - 45);
      ctx.lineTo(w * 0.35, groundY - 70);
      ctx.lineTo(w * 0.42, groundY - 45);
      ctx.fill();

      // Snow Ground
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, groundY + 22, w, h - groundY - 22);

      // Falling Snow Particles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 45 + this.windTime * 25) % w;
        const sy = (i * 28 + this.windTime * 40) % (h * 0.85);
        ctx.fillRect(sx, sy, 3, 3);
      }

    } else if (scene === 'storm') {
      // Dark Thunder Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.5, '#1e1b4b');
      sky.addColorStop(1, '#312e81');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Rain Streaks
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 25; i++) {
        const rx = (i * 35 + this.windTime * 150) % w;
        const ry = (i * 18 + this.windTime * 200) % groundY;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 16);
        ctx.stroke();
      }

      // Rocky Storm Ground
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY + 22, w, h - groundY - 22);

    } else if (scene === 'galaxy') {
      // Deep Space / Cosmos
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#09090b');
      sky.addColorStop(0.5, '#1e1b4b');
      sky.addColorStop(1, '#3b0764');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Crescent Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w * 0.82, 45, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(w * 0.86, 40, 18, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 35; i++) {
        const stX = (i * 47) % w;
        const stY = (i * 29) % (groundY - 10);
        const sz = (i % 3 === 0) ? 2 : 1;
        ctx.fillRect(stX, stY, sz, sz);
      }

      // Astral Floor
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(0, groundY + 20, w, h - groundY - 20);

    } else if (scene === 'forest') {
      // Enchanted Woods Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#064e3b');
      sky.addColorStop(1, '#059669');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      // Forest Trees
      ctx.fillStyle = '#022c22';
      for (let i = 20; i < w; i += 75) {
        ctx.fillRect(i, groundY - 55, 14, 55);
        ctx.beginPath();
        ctx.arc(i + 7, groundY - 60, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moss Ground
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#047857';
      ctx.fillRect(0, groundY + 20, w, h - groundY - 20);

      // Glowing Fireflies
      for (let i = 0; i < 12; i++) {
        const fx = (i * 65 + Math.sin(this.windTime + i) * 20) % w;
        const fy = groundY - 30 + Math.cos(this.windTime * 2 + i) * 15;
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(fx, fy, 3, 3);
      }

    } else {
      // Default: Radiant Sunlit Meadow
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#38bdf8');
      sky.addColorStop(1, '#bae6fd');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, groundY);

      this.clouds.forEach(c => this.drawPixelCloud(c.x, c.y, c.w, c.h));

      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, groundY + 24, w, h - groundY - 24);
    }
  }

  /* ========================================================================
     Foreground Objects: Castle, Monster, Pillars
     ======================================================================== */
  drawSceneForeground(w, h) {
    const ctx = this.ctx;
    const groundY = h * 0.65;

    if (this.currentScene === 'castle' || this.currentAction === 'attack_castle') {
      // Draw Pixel Castle on the right
      const cx = w - 110;
      const cy = groundY - 75;

      // Castle Main Wall
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx, cy + 20, 95, 55);

      // Castle Spires
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx, cy - 10, 26, 85);
      ctx.fillRect(cx + 65, cy - 10, 26, 85);

      // Roof Cones
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 10);
      ctx.lineTo(cx + 13, cy - 35);
      ctx.lineTo(cx + 29, cy - 10);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 62, cy - 10);
      ctx.lineTo(cx + 78, cy - 35);
      ctx.lineTo(cx + 94, cy - 10);
      ctx.fill();

      // Flag
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 13, cy - 45, 14, 8);

      // Castle Gate
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(cx + 47, cy + 50, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx + 33, cy + 50, 28, 25);

      // Castle Windows
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx + 8, cy + 10, 8, 12);
      ctx.fillRect(cx + 74, cy + 10, 8, 12);

    } else if (this.currentAction === 'fight_monster') {
      // Shadow Monster on the right
      const mx = w - 95;
      const my = groundY - 45;
      const bob = Math.sin(this.windTime * 6) * 4;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.arc(mx, my + bob, 26, 0, Math.PI * 2);
      ctx.fill();

      // Monster Spikes
      ctx.fillStyle = '#581c87';
      ctx.fillRect(mx - 8, my - 34 + bob, 16, 12);

      // Glowing Red Monster Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(mx - 14, my - 6 + bob, 7, 5);
      ctx.fillRect(mx + 7, my - 6 + bob, 7, 5);

    } else if (this.currentScene === 'temple') {
      // Ancient Marble Pillars
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(w - 70, groundY - 65, 18, 65);
      ctx.fillRect(w - 40, groundY - 65, 18, 65);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(w - 75, groundY - 72, 56, 8); // Top lintel
    }
  }

  /* ========================================================================
     Projectiles, Breath Particles, and Attacks
     ======================================================================== */
  drawProjectilesAndParticles() {
    const ctx = this.ctx;

    // Projectiles
    this.projectiles.forEach(p => {
      ctx.fillStyle = p.color || '#f97316';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x + 2, p.y - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles (Fire breath, sparks)
    this.particles.forEach(p => {
      if (p.type === 'sonic') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });

    // Impacts
    this.impacts.forEach(imp => {
      ctx.fillStyle = imp.color;
      ctx.fillRect(imp.x, imp.y, imp.size, imp.size);
    });
  }

  /* ========================================================================
     Draw Cloud Helper
     ======================================================================== */
  drawPixelCloud(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 10, y + 4, w - 20, h - 8);
    ctx.fillRect(x + 4, y + 10, w - 8, h - 14);
    ctx.fillRect(x + 20, y, w - 45, h);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 10, y + h - 6, w - 20, 6);
  }

  /* ========================================================================
     Retro 2D Pixel Art Pet Sprite Generator
     ======================================================================== */
  drawPixelPet(px, py, facing) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(facing, 1);

    const isSleeping = (this.currentAction === 'sleeping');
    const bob = isSleeping ? 0 : Math.sin(this.windTime * 6) * 3;
    const legSwing = isSleeping ? 0 : Math.sin(this.windTime * 7) * 4;

    // Color palettes per pet type
    let c1 = '#ea580c', c2 = '#f97316', cHorn = '#fef08a', eye = '#38bdf8';
    if (this.petType === 'tiger') {
      c1 = '#0284c7'; c2 = '#38bdf8'; cHorn = '#e0f2fe';
    } else if (this.petType === 'gryphon') {
      c1 = '#ca8a04'; c2 = '#facc15'; cHorn = '#fef08a';
    } else if (this.petType === 'phoenix') {
      c1 = '#dc2626'; c2 = '#fb923c'; cHorn = '#fde047';
    } else if (this.petType === 'wolf') {
      c1 = '#6b21a8'; c2 = '#a855f7'; cHorn = '#c084fc';
    } else if (this.petType === 'bear') {
      c1 = '#b45309'; c2 = '#f59e0b'; cHorn = '#fcd34d';
    } else if (this.petType === 'fox') {
      c1 = '#1d4ed8'; c2 = '#60a5fa'; cHorn = '#93c5fd';
    } else if (this.petType === 'lion') {
      c1 = '#a16207'; c2 = '#facc15'; cHorn = '#fef08a';
    } else if (this.petType === 'stag') {
      c1 = '#047857'; c2 = '#34d399'; cHorn = '#6ee7b7';
    } else if (this.petType === 'unicorn') {
      c1 = '#a21caf'; c2 = '#f472b6'; cHorn = '#fdf2f8';
    }

    const p = 2.8;

    // 1. Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Tail
    ctx.fillStyle = c2;
    ctx.fillRect(-12 * p, (-10 * p) + bob, 4 * p, 4 * p);
    ctx.fillRect(-15 * p, (-14 * p) + bob + (legSwing * 0.5), 4 * p, 5 * p);
    ctx.fillStyle = cHorn;
    ctx.fillRect(-17 * p, (-17 * p) + bob + (legSwing * 0.8), 3 * p, 3 * p);

    // 3. Back Legs
    ctx.fillStyle = c1;
    ctx.fillRect((-6 * p) - legSwing, 0, 4 * p, 5 * p);
    ctx.fillRect((4 * p) + legSwing, 0, 4 * p, 5 * p);

    // 4. Main Body
    ctx.fillStyle = c2;
    ctx.fillRect(-9 * p, (-12 * p) + bob, 15 * p, 11 * p);
    ctx.fillStyle = cHorn;
    ctx.fillRect(-5 * p, (-6 * p) + bob, 9 * p, 5 * p);

    // 5. Wings (for flying types)
    if (['dragon', 'gryphon', 'phoenix'].includes(this.petType)) {
      ctx.fillStyle = c1;
      const wingFlap = Math.sin(this.windTime * 10) * 4;
      ctx.fillRect(-6 * p, (-18 * p) + bob + wingFlap, 10 * p, 5 * p);
      ctx.fillStyle = cHorn;
      ctx.fillRect(-3 * p, (-21 * p) + bob + wingFlap, 6 * p, 4 * p);
    }

    // 6. Front Head
    ctx.fillStyle = c2;
    ctx.fillRect(4 * p, (-17 * p) + bob, 11 * p, 10 * p);
    ctx.fillRect(14 * p, (-13 * p) + bob, 4 * p, 6 * p); // Snout

    // Horns / Ears
    ctx.fillStyle = cHorn;
    ctx.fillRect(3 * p, (-22 * p) + bob, 3 * p, 6 * p);
    ctx.fillRect(7 * p, (-23 * p) + bob, 3 * p, 7 * p);

    // Eye
    if (isSleeping) {
      // Closed eye line
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(9 * p, (-13 * p) + bob, 4 * p, 1.5 * p);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9 * p, (-15 * p) + bob, 4 * p, 5 * p);
      ctx.fillStyle = eye;
      ctx.fillRect(11 * p, (-14 * p) + bob, 2 * p, 3 * p);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11 * p, (-14 * p) + bob, 1 * p, 1 * p);
    }

    // 7. Front Legs
    ctx.fillStyle = c2;
    ctx.fillRect((-4 * p) + legSwing, 0, 4 * p, 6 * p);
    ctx.fillRect((6 * p) - legSwing, 0, 4 * p, 6 * p);

    ctx.restore();
  }

  drawEmote(x, y, emoji) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 4, y + 13);
    ctx.lineTo(x, y + 18);
    ctx.lineTo(x + 4, y + 13);
    ctx.fill();

    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
  }

  animate() {
    this.update(0.016);
    this.draw();
    requestAnimationFrame(this.animate);
  }
}

window.PixelFieldRenderer = PixelFieldRenderer;
