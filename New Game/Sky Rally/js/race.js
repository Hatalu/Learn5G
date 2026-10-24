// Three.js race world: floating sky track, answer gates, karts, FX, camera.
// Game rules live in main.js; this file only simulates + draws and emits events via race.on.*
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { buildKart, buildIsland, buildCrystal, buildCloudSea, buildStarCoin, radialTexture, toon, glow, RIVAL_STYLES } from './models.js';
import { drawRich } from './rich.js';

export const LANES = [-4.3, 0, 4.3];
export const LANE_COLORS = ['#ff5fa8', '#ffc93c', '#3fd0ff'];
const TRACK_W = 13.5;
const UP = new THREE.Vector3(0, 1, 0);

export const THEMES = {
  rainbow: {
    name: 'Rainbow Sky', seed: 7,
    sky: ['#fff0c9', '#ffb3d6', '#c58cff', '#5d63ff'], fog: '#f7c6e6',
    stripes: ['#ff5fa2', '#ff9a4d', '#ffd84d', '#5fe08a', '#4dc9ff', '#6f7bff', '#b26dff'],
    rail: ['#ff7ad9', '#7af4ff'], under: '#f3e6ff',
    island: { rock: '#b98ad8', grass: '#a6e86b', wall: '#fff2f8', roofs: ['#ff6fa8', '#ffb43c', '#8f6bff'], flag: '#ffd23f', tree: '#6fd36b' },
    crystals: ['#c56bff', '#ff6fd8', '#6fe8ff'], sun: '#fff1a8',
  },
  jungle: {
    name: 'Jungle Temple', seed: 21,
    sky: ['#fff3d6', '#bfe8ff', '#7cc4ff', '#3d7bff'], fog: '#cdeaff',
    stripes: ['#f2d3a2', '#e8c088', '#f2d3a2', '#e8c088', '#f2d3a2', '#e8c088', '#f2d3a2'],
    rail: ['#5ff4c8', '#ffd25f'], under: '#c9a77c',
    island: { rock: '#9a8a74', grass: '#4fbf5a', wall: '#cbbf9f', roofs: ['#8a7a62', '#b39b74', '#6f8f5a'], flag: '#ff6f5a', tree: '#2fa55a' },
    crystals: ['#3fe0ff', '#7affb0', '#ffe066'], sun: '#fff7d6',
  },
  crystal: {
    name: 'Crystal City', seed: 42,
    sky: ['#ffffff', '#d4ecff', '#8ec8ff', '#3a6dff'], fog: '#d9eeff',
    stripes: ['#6fd0ff', '#a8e6ff', '#8fa8ff', '#c3a8ff', '#8fa8ff', '#a8e6ff', '#6fd0ff'],
    rail: ['#7af4ff', '#b47aff'], under: '#e6f3ff',
    island: { rock: '#8aa0c8', grass: '#9ff0c0', wall: '#f4f8ff', roofs: ['#5fb6ff', '#9f7aff', '#5ff0d8'], flag: '#ff6fb5', tree: '#5fd39a' },
    crystals: ['#8f6bff', '#4fd8ff', '#ff6fd8'], sun: '#ffffff',
  },
};

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function trackTexture(colors) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  const n = colors.length, w = c.width / n;
  colors.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * w, 0, w + 1, c.height); });
  const sheen = g.createLinearGradient(0, 0, c.width, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0.0)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0.18)'); sheen.addColorStop(1, 'rgba(255,255,255,0.0)');
  g.fillStyle = sheen; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(255,255,255,0.95)';
  for (const fx of [1 / 3, 2 / 3]) for (let y = 0; y < c.height; y += 128) g.fillRect(fx * c.width - 5, y, 10, 70);
  g.fillRect(0, 0, 14, c.height); g.fillRect(c.width - 14, 0, 14, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function chevronTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.strokeStyle = '#ffffff'; g.lineWidth = 18; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(20, 200 - i * 70); g.lineTo(64, 150 - i * 70); g.lineTo(108, 200 - i * 70); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function starTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(30, 2, 4, 60); g.fillRect(2, 30, 60, 4);
  return new THREE.CanvasTexture(c);
}

export class Race {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.5, 3000);
    this.clock = new THREE.Clock();
    this.on = {};
    this.mode = 'idle';
    this.paused = false;
    this.anims = [];
    this.tmp = { p: new THREE.Vector3(), t: new THREE.Vector3(), s: new THREE.Vector3(), u: new THREE.Vector3(), m: new THREE.Matrix4() };

    this.hemi = new THREE.HemisphereLight('#ffffff', '#b48cff', 1.25);
    this.sunLight = new THREE.DirectionalLight('#fff3e0', 2.1);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sunLight.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 });
    this.scene.add(this.hemi, this.sunLight, this.sunLight.target);

    this.initParticles();
    this.coinGeo = buildStarCoin();
    this.coinMat = toon('#ffd23f', { emissive: '#ff9a1f', emissiveIntensity: 0.35 });
    this.playerStyle = null;
    this.up = { speed: 0, boost: 0, magnet: 0, shield: 0 };
    this.playerHitCd = 0;
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.fovKick = 0;

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.baseFov = w / h < 0.8 ? 80 : 66; // portrait phones need a wider view
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
  }

  // ---------- World ----------
  setTheme(id) {
    if (this.themeId === id && this.world) return;
    this.themeId = id;
    const th = (this.theme = THEMES[id] || THEMES.rainbow);
    if (this.world) { this.scene.remove(this.world); this.world.traverse((o) => { if (o.geometry && o.geometry !== this.coinGeo) o.geometry.dispose(); }); }
    const world = (this.world = new THREE.Group());
    this.scene.add(world);
    const rand = seeded(th.seed);

    // Sky dome
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { c0: { value: new THREE.Color(th.sky[0]) }, c1: { value: new THREE.Color(th.sky[1]) }, c2: { value: new THREE.Color(th.sky[2]) }, c3: { value: new THREE.Color(th.sky[3]) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 c0,c1,c2,c3; varying vec3 vP;
        void main(){ float h = vP.y; vec3 c = h < 0.0 ? mix(c1, c0, clamp(-h*3.0,0.0,1.0)) : h < 0.25 ? mix(c1, c2, h/0.25) : mix(c2, c3, clamp((h-0.25)/0.6,0.0,1.0));
          gl_FragColor = vec4(c,1.0);
          #include <colorspace_fragment>
        }`,
    }));
    sky.renderOrder = -1;
    world.add(sky);
    this.scene.fog = new THREE.Fog(th.fog, 220, 1100);
    this.hemi.groundColor.set(th.island.rock);

    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), color: th.sun, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sun.scale.setScalar(520);
    sun.position.set(-500, 260, -900);
    world.add(sun);
    this.sunSprite = sun;

    // Track curve: closed loop with rolling hills
    const pts = [];
    const n = 16, R = 330;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = R + (rand() - 0.5) * 140;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 18 * Math.sin(a * 2 + 1) + 9 * Math.sin(a * 5) + (rand() - 0.5) * 8, Math.sin(a) * r));
    }
    const curve = (this.curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal'));
    this.L = curve.getLength();
    const M = (this.M = 3000);
    this.frames = [];
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      const p = curve.getPointAt(u % 1), t = curve.getTangentAt(u % 1).normalize();
      const s = new THREE.Vector3().crossVectors(t, UP).normalize();
      const up = new THREE.Vector3().crossVectors(s, t).normalize();
      this.frames.push({ p, t, s, up });
    }

    // Track ribbon (top) + body (sides/bottom)
    const top = [], uv = [], idx = [], body = [], bidx = [];
    for (let i = 0; i <= M; i++) {
      const { p, s, up } = this.frames[i];
      const l = p.clone().addScaledVector(s, -TRACK_W / 2), r = p.clone().addScaledVector(s, TRACK_W / 2);
      top.push(l.x, l.y, l.z, r.x, r.y, r.z);
      const v = (i / M) * this.L / 28;
      uv.push(0, v, 1, v);
      const ld = l.clone().addScaledVector(up, -1.6), rd = r.clone().addScaledVector(up, -1.6);
      body.push(l.x, l.y - 0.02, l.z, ld.x, ld.y, ld.z, rd.x, rd.y, rd.z, r.x, r.y - 0.02, r.z);
      if (i < M) {
        const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        const b = i * 4, c = b + 4;
        bidx.push(b, c, b + 1, b + 1, c, c + 1, b + 1, c + 1, b + 2, b + 2, c + 1, c + 2, b + 2, c + 2, b + 3, b + 3, c + 2, c + 3);
      }
    }
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(top, 3));
    tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    tg.setIndex(idx);
    tg.computeVertexNormals();
    const trackMat = new THREE.MeshToonMaterial({ map: trackTexture(th.stripes), side: THREE.DoubleSide });
    const trackMesh = new THREE.Mesh(tg, trackMat);
    trackMesh.receiveShadow = true;
    world.add(trackMesh);
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(body, 3));
    bg.setIndex(bidx);
    bg.computeVertexNormals();
    world.add(new THREE.Mesh(bg, toon(th.under, { side: THREE.DoubleSide })));

    // Glowing rails
    th.rail.forEach((col, k) => {
      const side = k ? 1 : -1, rp = [];
      for (let i = 0; i < M; i += 10) { const f = this.frames[i]; rp.push(f.p.clone().addScaledVector(f.s, side * (TRACK_W / 2 + 0.15)).addScaledVector(f.up, 0.45)); }
      const rc = new THREE.CatmullRomCurve3(rp, true);
      world.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 900, 0.26, 8, true), new THREE.MeshBasicMaterial({ color: col })));
      world.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 900, 0.55, 8, true), glow(col, 0.25)));
    });
    // Lamps every so often
    for (let i = 0; i < M; i += 60) {
      for (const side of [-1, 1]) {
        const f = this.frames[i];
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8), toon('#ffffff'));
        this.placeRaw(post, f, side * (TRACK_W / 2 + 0.4), 1.1);
        world.add(post);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshBasicMaterial({ color: th.rail[side > 0 ? 1 : 0] }));
        this.placeRaw(bulb, f, side * (TRACK_W / 2 + 0.4), 2.35);
        world.add(bulb);
      }
    }

    // Scenery: cloud sea, islands, crystals
    let minY = Infinity;
    pts.forEach((p) => (minY = Math.min(minY, p.y)));
    world.add(buildCloudSea(320, 900, minY - 55, rand));
    for (let i = 0; i < 26; i++) {
      const f = this.frames[Math.floor(rand() * M)];
      const side = rand() < 0.5 ? -1 : 1, off = 45 + rand() * 120;
      const isl = buildIsland(rand, th.island);
      isl.position.copy(f.p).addScaledVector(f.s, side * off);
      isl.position.y += -30 + rand() * 45;
      isl.rotation.y = rand() * 6;
      isl.userData.bob = rand() * 6;
      world.add(isl);
      (this.floaters ||= []).push(isl);
    }
    for (let i = 0; i < 22; i++) {
      const f = this.frames[Math.floor(rand() * M)];
      const side = rand() < 0.5 ? -1 : 1;
      const cr = buildCrystal(rand, th.crystals[i % th.crystals.length]);
      cr.position.copy(f.p).addScaledVector(f.s, side * (22 + rand() * 60));
      cr.position.y += -6 + rand() * 30;
      cr.scale.setScalar(0.8 + rand() * 1.4);
      cr.userData.bob = rand() * 6;
      cr.userData.spin = (rand() - 0.5) * 0.4;
      world.add(cr);
      this.floaters.push(cr);
    }
    this.floaters = this.floaters.filter((o) => o.parent === world);

    // Start / finish arch
    const arch = new THREE.Group();
    const archMat = toon('#ffffff');
    for (const sd of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 9, 14), archMat);
      post.position.set(sd * (TRACK_W / 2 + 0.8), 4.5, 0);
      arch.add(post);
    }
    const cc = document.createElement('canvas'); cc.width = 512; cc.height = 64;
    const cg = cc.getContext('2d');
    for (let x = 0; x < 32; x++) for (let y = 0; y < 4; y++) { cg.fillStyle = (x + y) % 2 ? '#222244' : '#ffffff'; cg.fillRect(x * 16, y * 16, 16, 16); }
    const banner = new THREE.Mesh(new RoundedBoxGeometry(TRACK_W + 2.6, 1.6, 0.5, 2, 0.2), new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(cc) }));
    banner.position.y = 9;
    arch.add(banner);
    this.place(arch, 2, 0, 0);
    world.add(arch);
    this.startLights = [];
    for (let k = 0; k < 3; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: '#552244' }));
      b.position.set((k - 1) * 1.6, 7.3, 0);
      arch.add(b);
      this.startLights.push(b);
    }

    this.dynamic = new THREE.Group();
    world.add(this.dynamic);
  }

  frameAt(s) {
    const L = this.L, M = this.M;
    const u = (((s % L) + L) % L) / L * M;
    const i = Math.floor(u), k = u - i;
    const a = this.frames[i], b = this.frames[Math.min(i + 1, M)];
    const T = this.tmp;
    T.p.lerpVectors(a.p, b.p, k); T.t.lerpVectors(a.t, b.t, k).normalize();
    T.s.lerpVectors(a.s, b.s, k).normalize(); T.u.lerpVectors(a.up, b.up, k).normalize();
    return T;
  }
  placeRaw(obj, f, x, y) {
    obj.position.copy(f.p).addScaledVector(f.s, x).addScaledVector(f.up, y);
    const nx = f.s.clone().negate();
    obj.quaternion.setFromRotationMatrix(this.tmp.m.makeBasis(nx, f.up, f.t));
  }
  place(obj, s, x, y) {
    const f = this.frameAt(s);
    obj.position.copy(f.p).addScaledVector(f.s, x).addScaledVector(f.u, y);
    const nx = this.tmp.s.clone().negate();
    obj.quaternion.setFromRotationMatrix(this.tmp.m.makeBasis(nx, f.u, f.t));
  }

  // ---------- Karts ----------
  // Swap the player's kart in place (keeps the camera orbit; pops the new model in).
  setPlayerStyle(style) {
    this.playerStyle = style;
    const old = this.player;
    this.player = this.makeRacer(style, true);
    if (old) {
      for (const k of ['s', 'x', 'xt', 'lane']) this.player[k] = old[k];
      this.scene.remove(old.obj);
      const obj = this.player.obj;
      this.place(obj, this.player.s, this.player.x, 0);
      this.sparkle(obj.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 40, [style.body, style.glow, '#ffffff'], 6);
      this.anim(0.45, (k) => obj.scale.setScalar(k < 0.6 ? 0.3 + k * 1.5 : 1.2 - (k - 0.6) * 0.5));
    }
  }
  makeRacer(style, isPlayer) {
    const obj = buildKart(style);
    this.scene.add(obj);
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), new THREE.MeshBasicMaterial({ color: '#8ff4ff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    bubble.position.y = 1.2;
    bubble.visible = false;
    obj.add(bubble);
    return { obj, bubble, s: 0, x: 0, xt: 0, v: 0, lane: 1, boost: 0, slow: 0, spin: 0, shield: 0, magnet: 0, item: null, itemCd: 6, isPlayer, steer: 0, skill: 1 };
  }

  showroom() {
    const was = this.mode === 'showroom';
    this.mode = 'showroom';
    this.clearDynamic();
    (this.rivals || []).forEach((r) => (r.obj.visible = false));
    Object.assign(this.player, { s: 30, x: 0, xt: 0, v: 0, spin: 0, shield: 0, boost: 0 });
    this.player.obj.visible = true;
    this.player.obj.userData.setBoost(false);
    this.player.bubble.visible = false;
    if (!was) this.showT = this.showT || 0; // keep orbiting from where we were
  }

  clearDynamic() {
    if (!this.dynamic) return;
    while (this.dynamic.children.length) this.dynamic.remove(this.dynamic.children[0]);
    this.gates = []; this.coins = []; this.pads = []; this.checkpoints = []; this.boxes = []; this.shots = []; this.traps = [];
  }

  prepareRace({ gates = 8, baseSpeed = 26, upgrades = {} }) {
    this.clearDynamic();
    this.up = { speed: 0, boost: 0, magnet: 0, shield: 0, ...upgrades };
    this.base = baseSpeed;
    this.playerHitCd = 10;
    this.spacing = this.L / (gates + 1);
    const rand = seeded(Date.now() & 0xffff);
    for (let i = 0; i < gates; i++) this.gates.push(this.buildGate(this.spacing * (i + 1), i));
    for (let i = 0; i <= gates; i++) {
      const s0 = this.spacing * i;
      // coin rows
      for (const frac of [0.25, 0.55]) {
        const lane = Math.floor(rand() * 3);
        for (let k = 0; k < 5; k++) {
          const m = new THREE.Mesh(this.coinGeo, this.coinMat);
          m.castShadow = true;
          const c = { mesh: m, s: s0 + this.spacing * frac + k * 5, x: LANES[lane], taken: false };
          this.place(m, c.s, c.x, 1.4);
          this.dynamic.add(m);
          this.coins.push(c);
        }
      }
      // boost pad
      if (i > 0) {
        const lane = Math.floor(rand() * 3);
        const pad = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5.5), new THREE.MeshBasicMaterial({ map: this.chev ||= chevronTexture(), color: '#7afcff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        const p = { mesh: pad, s: s0 + this.spacing * 0.78, x: LANES[lane], used: false };
        this.place(pad, p.s, p.x, 0.08);
        pad.rotateX(-Math.PI / 2);
        this.dynamic.add(pad);
        this.pads.push(p);
      }
      if (i > 0 && i % 2 === 0 && i < gates) this.checkpoints.push(this.buildCheckpoint(s0 + this.spacing * 0.5));
      // item box row across all lanes
      if (i < gates) for (let k = 0; k < 3; k++) this.boxes.push(this.buildBox(s0 + this.spacing * 0.4 + (i === 0 ? 40 : 0), LANES[k]));
    }

    // Grid: rivals ahead, player starts last for overtakes
    if (!this.rivals) this.rivals = RIVAL_STYLES.map((st) => this.makeRacer(st, false));
    const grid = [[18, 0], [12, 2], [6, 1]];
    this.rivals.forEach((r, i) => {
      Object.assign(r, { s: grid[i][0], lane: grid[i][1], x: LANES[grid[i][1]], xt: LANES[grid[i][1]], v: 0, boost: 0, slow: 0, spin: 0, shield: 0, item: null, itemCd: 8 + i * 4, skill: 0.9 + i * 0.03 });
      r.obj.visible = true;
      r.obj.userData.setBoost(false);
    });
    Object.assign(this.player, { s: 0, lane: 1, x: 0, xt: 0, v: 0, boost: 0, slow: 0, spin: 0, shield: 0, magnet: 0, finished: false });
    this.player.obj.visible = true;
    this.nextGate = 0;
    this.nextCheckpoint = 0;
    this.brake = false;
    this.mode = 'countdown';
    this.startLights.forEach((b) => b.material.color.set('#552244'));
    this.snapCamera();
  }

  setStartLight(k, color) { this.startLights[k]?.material.color.set(color); }
  go() {
    this.mode = 'race';
    this.raceTime = 0;
    if (this.up.shield) this.player.shield = 12;
  }

  // ---------- Items ----------
  buildBox(s, x) {
    const g = new THREE.Group();
    if (!this.boxTex) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x2 = c.getContext('2d');
      const gr = x2.createLinearGradient(0, 0, 128, 128);
      ['#ff5fa8', '#ffc93c', '#5fe08a', '#3fd0ff', '#b26dff'].forEach((col, k) => gr.addColorStop(k / 4, col));
      x2.fillStyle = gr; x2.fillRect(0, 0, 128, 128);
      x2.strokeStyle = '#fff'; x2.lineWidth = 10; x2.strokeRect(8, 8, 112, 112);
      x2.fillStyle = '#fff'; x2.font = '700 84px Mitr, sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle';
      x2.fillText('?', 64, 70);
      this.boxTex = new THREE.CanvasTexture(c);
      this.boxTex.colorSpace = THREE.SRGBColorSpace;
    }
    const cube = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.7, 1.7, 3, 0.25), new THREE.MeshBasicMaterial({ map: this.boxTex, transparent: true, opacity: 0.92 }));
    g.add(cube);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.flashTex ||= radialTexture(), color: '#fff2ff', blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
    halo.scale.setScalar(4);
    g.add(halo);
    this.place(g, s, x, 1.7);
    this.dynamic.add(g);
    return { group: g, cube, s, x, taken: 0 };
  }

  // Racer `by` uses an item. Returns a short result tag for the UI.
  useItem(kind, by = this.player) {
    const boostMul = by.isPlayer ? 1 + 0.2 * this.up.boost : 1;
    if (kind === 'turbo') { by.boost = 2.2 * boostMul; this.sparkle(by.obj.position.clone(), 30, ['#7afcff', '#ffffff'], 5); return 'turbo'; }
    if (kind === 'shield') { by.shield = 9; return 'shield'; }
    if (kind === 'magnet') { by.magnet = 8; return 'magnet'; }
    if (kind === 'jelly') {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: '#a6ff5f', transparent: true, opacity: 0.85 }));
      m.scale.set(1.3, 0.6, 1.3);
      const t = { mesh: m, s: by.s - 5, x: by.x, owner: by, age: 0 };
      this.place(m, t.s, t.x, 0.05);
      this.dynamic.add(m);
      this.traps.push(t);
      return 'jelly';
    }
    if (kind === 'orb') {
      const all = [this.player, ...this.rivals];
      const target = all.filter((r) => r !== by && r.s > by.s && r.s - by.s < this.L / 2).sort((a, b) => a.s - b.s)[0] || null;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ color: '#ff8af0' }));
      const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.flashTex ||= radialTexture(), color: '#ff8af0', blending: THREE.AdditiveBlending, depthWrite: false }));
      glowS.scale.setScalar(4);
      m.add(glowS);
      this.dynamic.add(m);
      this.shots.push({ mesh: m, s: by.s + 3, x: by.x, target, owner: by, v: Math.max(by.v, this.base) * 1.9, life: 0 });
      return 'orb';
    }
    if (kind === 'cloud') {
      const ahead = [this.player, ...this.rivals].filter((r) => r !== by && r.s > by.s);
      ahead.forEach((r) => this.hit(r, 'cloud', by));
      return ahead.length ? 'cloud' : 'cloud-miss';
    }
    return null;
  }

  hit(r, kind, from) {
    if (r.isPlayer && from && !from.isPlayer && this.playerHitCd > 0) return false; // be gentle with kids
    if (r.shield > 0) {
      r.shield = 0;
      this.sparkle(r.obj.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 40, ['#8ff4ff', '#ffffff'], 7);
      this.on.blocked?.(r.isPlayer);
      return false;
    }
    if (kind === 'cloud') {
      r.slow = Math.max(r.slow, 1.6);
      this.rainCloud(r);
    } else {
      r.spin = 1.0;
      r.v *= 0.45;
      this.sparkle(r.obj.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 30, ['#fff27a', '#ff8af0', '#ffffff'], 6);
    }
    if (r.isPlayer) this.playerHitCd = 9;
    this.on.hit?.(r.isPlayer, kind, from?.isPlayer);
    return true;
  }

  rainCloud(r) {
    const c = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.8 + (i % 2) * 0.3, 12, 10), new THREE.MeshToonMaterial({ color: '#8d86b3', transparent: true }));
      b.position.set((i - 1.5) * 0.8, (i % 2) * 0.3, 0);
      c.add(b);
    }
    r.obj.add(c);
    c.position.y = 4;
    this.anim(1.6, (k) => {
      c.children.forEach((b) => (b.material.opacity = k > 0.8 ? (1 - k) * 5 : 1));
      if (Math.random() < 0.5) this.sparkle(r.obj.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 3.4, 0)), 1, ['#9fd6ff'], 1);
    }, () => r.obj.remove(c));
  }

  updateItems(dt) {
    const all = [this.player, ...this.rivals];
    this.playerHitCd = Math.max(0, this.playerHitCd - dt);
    // boxes: spin, pickup, respawn
    for (const b of this.boxes) {
      b.cube.rotation.x += dt * 1.2; b.cube.rotation.y += dt * 1.7;
      if (b.taken > 0) { b.taken -= dt; if (b.taken <= 0) { b.group.visible = true; b.group.scale.setScalar(1); } continue; }
      for (const r of all) {
        if (Math.abs(r.s - b.s) > 2 || Math.abs(r.x - b.x) > 1.9) continue;
        b.taken = 3;
        this.sparkle(b.group.position.clone(), 24, ['#ff5fa8', '#ffc93c', '#3fd0ff', '#ffffff'], 6);
        this.anim(0.25, (k) => b.group.scale.setScalar(1 + k), () => (b.group.visible = false));
        if (r.isPlayer) this.on.itemBox?.();
        else if (!r.item) r.item = ['orb', 'jelly', 'turbo', 'shield'][Math.floor(Math.random() * 4)];
        break;
      }
    }
    // projectiles
    this.shots = this.shots.filter((p) => {
      p.life += dt;
      p.s += p.v * dt;
      if (p.target) p.x += (p.target.x - p.x) * Math.min(1, dt * 4);
      this.place(p.mesh, p.s, p.x, 1.2 + Math.sin(p.life * 12) * 0.2);
      p.mesh.rotation.y += dt * 10;
      if (Math.random() < 0.6) this.sparkle(p.mesh.position.clone(), 1, ['#ff8af0', '#ffffff'], 1);
      const tgt = p.target;
      if (tgt && Math.abs(tgt.s - p.s) < 1.8 && Math.abs(tgt.x - p.x) < 2.2) { this.hit(tgt, 'orb', p.owner); this.dynamic.remove(p.mesh); return false; }
      if (p.life > 4) { this.dynamic.remove(p.mesh); return false; }
      return true;
    });
    // jelly traps
    this.traps = this.traps.filter((t) => {
      t.age += dt;
      t.mesh.scale.y = 0.6 + Math.sin(t.age * 8) * 0.08;
      for (const r of all) {
        if (r === t.owner && t.age < 1.5) continue;
        if (Math.abs(r.s - t.s) < 1.6 && Math.abs(r.x - t.x) < 1.7) {
          if (this.hit(r, 'jelly', t.owner) || r.shield <= 0) { this.dynamic.remove(t.mesh); return false; }
        }
      }
      if (t.age > 40) { this.dynamic.remove(t.mesh); return false; }
      return true;
    });
    // rival item AI
    for (const r of this.rivals) {
      r.itemCd -= dt;
      if (!r.item && r.itemCd <= 0) { r.item = Math.random() < 0.5 ? 'turbo' : ['orb', 'jelly', 'shield'][Math.floor(Math.random() * 3)]; r.itemCd = 14 + Math.random() * 10; }
      if (!r.item || Math.random() > dt * 0.8) continue;
      const d = this.player.s - r.s;
      const use = r.item === 'orb' ? d > 4 && d < 60 : r.item === 'jelly' ? d < -3 && d > -40 : true;
      if (use) { const kind = r.item; r.item = null; this.useItem(kind, r); if (kind === 'orb' || kind === 'jelly') this.on.rivalItem?.(kind); }
    }
  }

  buildGate(s, i) {
    const g = new THREE.Group();
    const postMat = toon('#ffffff');
    for (const sd of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 8.6, 12), postMat);
      post.position.set(sd * (TRACK_W / 2 + 0.5), 4.3, 0);
      post.castShadow = true;
      g.add(post);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 12), new THREE.MeshBasicMaterial({ color: this.theme.rail[sd > 0 ? 1 : 0] }));
      orb.position.set(sd * (TRACK_W / 2 + 0.5), 8.9, 0);
      g.add(orb);
    }
    const beam = new THREE.Mesh(new RoundedBoxGeometry(TRACK_W + 2, 0.55, 0.55, 2, 0.2), toon('#ffffff'));
    beam.position.y = 8.4;
    g.add(beam);
    const boards = LANES.map((lx, k) => {
      const b = new THREE.Group();
      b.position.set(-lx, 5.9, 0); // local +x is the driver's left
      const frame = new THREE.Mesh(new RoundedBoxGeometry(4.15, 2.55, 0.35, 3, 0.25), toon(LANE_COLORS[k]));
      frame.castShadow = true;
      b.add(frame);
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 300;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(3.85, 2.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      face.rotation.y = Math.PI;
      face.position.z = -0.19;
      b.add(face);
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), toon('#ffffff'));
      rope.position.y = 1.75;
      b.add(rope);
      g.add(b);
      return { group: b, canvas, tex, color: LANE_COLORS[k], text: '?' };
    });
    this.place(g, s, 0, 0);
    this.dynamic.add(g);
    const gate = { s, group: g, boards, i };
    boards.forEach((bd) => this.drawBoard(bd, '?', false));
    return gate;
  }

  drawBoard(bd, text, disabled) {
    const g = bd.canvas.getContext('2d');
    const W = bd.canvas.width, H = bd.canvas.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = disabled ? '#d9d4e6' : '#ffffff';
    g.beginPath(); g.roundRect(10, 10, W - 20, H - 20, 44); g.fill();
    g.lineWidth = 12; g.strokeStyle = disabled ? '#a69fbd' : bd.color; g.stroke();
    g.fillStyle = disabled ? '#9a93b0' : '#2b1b4a';
    drawRich(g, String(text), W / 2, H / 2 + 4, W - 70, 96, '"Mitr", sans-serif');
    if (disabled) {
      g.strokeStyle = 'rgba(255,90,120,0.85)'; g.lineWidth = 16; g.lineCap = 'round';
      g.beginPath(); g.moveTo(70, 60); g.lineTo(W - 70, H - 60); g.moveTo(W - 70, 60); g.lineTo(70, H - 60); g.stroke();
    }
    bd.tex.needsUpdate = true;
    bd.text = text;
  }

  setGateChoices(i, choices, disabled = []) {
    const gate = this.gates[i];
    if (!gate) return;
    gate.boards.forEach((bd, k) => { bd.group.visible = true; bd.group.scale.setScalar(1); this.drawBoard(bd, choices[k] ?? '', !!disabled[k]); });
  }

  buildCheckpoint(s) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(TRACK_W / 2 + 1.4, 0.45, 10, 48, Math.PI), new THREE.MeshBasicMaterial({ color: this.theme.rail[0] }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(TRACK_W / 2 + 1.4, 1.1, 10, 48, Math.PI), glow(this.theme.rail[1], 0.25));
    const g = new THREE.Group();
    g.add(ring, halo);
    this.place(g, s, 0, 0);
    this.dynamic.add(g);
    return { s, group: g, passed: false };
  }

  setLane(k) { if (this.player) { this.player.lane = Math.max(0, Math.min(2, k)); this.player.xt = LANES[this.player.lane]; } }
  shiftLane(d) { this.setLane(this.player.lane + d); }
  setBrake(b) { this.brake = b; }

  reward(kind, i, lane) {
    const p = this.player;
    const bd = this.gates[i]?.boards[lane];
    const pos = bd ? bd.group.getWorldPosition(new THREE.Vector3()) : p.obj.position.clone();
    if (kind === 'correct') {
      p.boost = 2.4 * (1 + 0.2 * (this.up?.boost || 0));
      this.crystalBurst(pos, LANE_COLORS[lane]);
      this.sparkle(pos, 70, ['#ffffff', '#fff27a', LANE_COLORS[lane], '#c58cff']);
      if (bd) this.anim(0.5, (k) => bd.group.scale.setScalar(1 + k * 0.6), () => (bd.group.visible = false));
    } else {
      p.slow = 1.1;
      this.smokePuff(p.obj.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
      if (bd) this.anim(0.4, (k) => (bd.group.rotation.z = Math.sin(k * 30) * 0.12 * (1 - k)));
    }
  }

  // ---------- FX ----------
  anim(dur, update, done) { this.anims.push({ t: 0, dur, update, done }); }

  initParticles() {
    const MAX = (this.pMax = 900);
    const geo = new THREE.BufferGeometry();
    this.pPos = new Float32Array(MAX * 3).fill(9999);
    this.pCol = new Float32Array(MAX * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.9, map: starTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.points.frustumCulled = false;
    this.scene.add(this.points);
    this.parts = [];
    this.pNext = 0;
  }
  sparkle(pos, n, colors, speed = 9) {
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.1, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.4 + Math.random()));
      const c = new THREE.Color(colors[i % colors.length]);
      this.parts[this.pNext] = { p: pos.clone(), v, c, life: 0, max: 0.7 + Math.random() * 0.7 };
      this.pNext = (this.pNext + 1) % this.pMax;
    }
  }
  updateParticles(dt) {
    for (let i = 0; i < this.pMax; i++) {
      const q = this.parts[i];
      if (!q) continue;
      q.life += dt;
      const k = q.life / q.max;
      if (k >= 1) { this.parts[i] = null; this.pPos[i * 3 + 1] = 9999; continue; }
      q.v.y -= 9 * dt;
      q.v.multiplyScalar(1 - dt * 1.5);
      q.p.addScaledVector(q.v, dt);
      this.pPos.set([q.p.x, q.p.y, q.p.z], i * 3);
      const f = 1 - k;
      this.pCol.set([q.c.r * f, q.c.g * f, q.c.b * f], i * 3);
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
  crystalBurst(pos, color) {
    const g = new THREE.Group();
    g.position.copy(pos);
    this.scene.add(g);
    const shards = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: i % 3 ? '#e8dcff' : color, transparent: true }));
      const a = (i / 9) * Math.PI * 2;
      m.userData.v = new THREE.Vector3(Math.cos(a) * 6, 4 + Math.random() * 5, Math.sin(a) * 6);
      m.scale.set(0.5, 1.8, 0.5);
      g.add(m); shards.push(m);
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.0, 40), glow(color, 0.9));
    ring.material.side = THREE.DoubleSide;
    ring.lookAt(this.camera.position.clone().sub(pos).add(pos));
    g.add(ring);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.flashTex ||= radialTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false }));
    flash.scale.setScalar(8);
    g.add(flash);
    this.anim(1.0, (k) => {
      const dt = 1 / 60;
      shards.forEach((m) => { m.position.addScaledVector(m.userData.v, dt); m.userData.v.y -= 12 * dt; m.rotation.y += 0.2; m.material.opacity = 1 - k; });
      ring.scale.setScalar(1 + k * 9); ring.material.opacity = 0.9 * (1 - k);
      flash.material.opacity = Math.max(0, 1 - k * 2.5); flash.scale.setScalar(8 + k * 10);
    }, () => { this.scene.remove(g); g.traverse((o) => o.geometry?.dispose()); });
  }
  smokePuff(pos) {
    const g = new THREE.Group();
    g.position.copy(pos);
    this.scene.add(g);
    const balls = [];
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), new THREE.MeshToonMaterial({ color: '#efe9ff', transparent: true }));
      m.userData.v = new THREE.Vector3((Math.random() - 0.5) * 4, 1 + Math.random() * 2, (Math.random() - 0.5) * 4);
      g.add(m); balls.push(m);
    }
    this.anim(0.9, (k) => balls.forEach((m) => { m.position.addScaledVector(m.userData.v, 1 / 60); m.scale.setScalar(1 + k * 2); m.material.opacity = 1 - k; }),
      () => { this.scene.remove(g); g.traverse((o) => o.geometry?.dispose()); });
  }

  // ---------- Loop ----------
  snapCamera() { this.updateCamera(1, true); }

  updateCamera(dt, snap = false) {
    const p = this.player;
    if (!p) return;
    const f = this.frameAt(p.s);
    const kp = f.p.clone().addScaledVector(f.s, p.x).addScaledVector(f.u, 0.5);
    let want, look;
    if (this.mode === 'showroom') {
      this.showT += dt;
      const a = this.showT * 0.35;
      const side = f.s.clone(), fwd = f.t.clone();
      want = kp.clone().addScaledVector(fwd, Math.cos(a) * 9).addScaledVector(side, Math.sin(a) * 9).addScaledVector(f.u, 3.2);
      look = kp.clone().addScaledVector(f.u, 1.2);
    } else if (this.mode === 'finish') {
      this.showT += dt;
      const a = this.showT * 0.5;
      want = kp.clone().addScaledVector(f.t, Math.cos(a) * 10 + 4).addScaledVector(f.s, Math.sin(a) * 10).addScaledVector(f.u, 4);
      look = kp.clone().addScaledVector(f.u, 1.4);
    } else {
      want = kp.clone().addScaledVector(f.t, -10.5).addScaledVector(f.u, 4.6).addScaledVector(f.s, -p.x * 0.25);
      look = kp.clone().addScaledVector(f.t, 7).addScaledVector(f.u, 2.2);
    }
    const k = snap ? 1 : 1 - Math.exp(-dt * 6);
    this.camPos.lerp(want, k);
    this.camLook.lerp(look, k);
    if (snap) { this.camPos.copy(want); this.camLook.copy(look); }
    this.camera.position.copy(this.camPos);
    this.camera.up.copy(f.u);
    this.camera.lookAt(this.camLook);
    const fov = this.baseFov + this.fovKick;
    if (Math.abs(this.camera.fov - fov) > 0.05) { this.camera.fov += (fov - this.camera.fov) * Math.min(1, dt * 5); this.camera.updateProjectionMatrix(); }
    // keep the shadow camera around the player
    this.sunLight.position.copy(kp).add(new THREE.Vector3(-40, 70, 30));
    this.sunLight.target.position.copy(kp);
  }

  updateRacer(r, dt) {
    r.boost = Math.max(0, r.boost - dt);
    r.slow = Math.max(0, r.slow - dt);
    r.spin = Math.max(0, r.spin - dt);
    r.shield = Math.max(0, r.shield - dt);
    r.magnet = Math.max(0, r.magnet - dt);
    let target = 0;
    if (this.mode === 'race' || this.mode === 'finish') {
      if (r.isPlayer) {
        target = this.base * (1 + 0.04 * this.up.speed) * (r.boost ? 1.6 : 1) * (r.slow ? 0.5 : 1) * (this.brake ? 0.42 : 1) * (r.spin ? 0.35 : 1);
        if (r.finished) target = this.base * 0.6;
      } else {
        const diff = r.s - this.player.s;
        const band = 1 - Math.max(-0.28, Math.min(0.22, diff / 140));
        target = this.base * r.skill * band * (r.boost ? 1.4 : 1) * (r.slow ? 0.5 : 1) * (r.spin ? 0.35 : 1);
        if (Math.random() < dt * 0.25) { r.lane = Math.floor(Math.random() * 3); r.xt = LANES[r.lane]; }
        if (Math.random() < dt * 0.05) r.boost = 1.2;
      }
    }
    r.v += (target - r.v) * Math.min(1, dt * 2.2);
    const prev = r.s;
    r.s += r.v * dt;
    const dx = r.xt - r.x;
    r.x += dx * Math.min(1, dt * 7);
    r.steer += (Math.max(-1, Math.min(1, dx / 3)) - r.steer) * Math.min(1, dt * 10);
    this.place(r.obj, r.s, r.x, 0);
    if (r.spin) r.obj.rotateY((1 - r.spin) * Math.PI * 4);
    r.obj.userData.update(dt, r.v, r.steer);
    r.obj.userData.setBoost(r.boost > 0);
    r.bubble.visible = r.shield > 0 && (r.shield > 2 || Math.sin(r.shield * 20) > 0);
    if (r.bubble.visible) r.bubble.scale.setScalar(1 + Math.sin(this.clock.elapsedTime * 6) * 0.04);
    return prev;
  }

  frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.world || !this.player) return;
    if (this.paused) { this.renderer.render(this.scene, this.camera); return; }
    const t = this.clock.elapsedTime;
    for (const o of this.floaters) { o.position.y += Math.sin(t * 0.6 + o.userData.bob) * 0.01; if (o.userData.spin) o.rotation.y += o.userData.spin * dt; }

    if (this.mode === 'showroom') {
      this.place(this.player.obj, this.player.s, 0, 0);
      this.player.obj.userData.update(dt, 0, Math.sin(t) * 0.3);
    } else if (this.mode === 'countdown' || this.mode === 'race' || this.mode === 'finish') {
      if (this.mode === 'race') this.raceTime += dt;
      const p = this.player;
      const prev = this.updateRacer(p, dt);
      this.rivals.forEach((r) => this.updateRacer(r, dt));
      this.fovKick += ((p.boost ? 12 : 0) - this.fovKick) * Math.min(1, dt * 4);

      if (this.mode === 'race' && !p.finished) {
        // coins
        this.updateItems(dt);
        const reach = p.magnet ? 6 : 1.8 + 1.0 * this.up.magnet;
        for (const c of this.coins) {
          if (c.taken || Math.abs(c.s - p.s) > (p.magnet ? 8 : 2) || Math.abs(c.x - p.x) > reach) continue;
          c.taken = true;
          const pos = c.mesh.position.clone();
          this.sparkle(pos, 10, ['#fff27a', '#ffffff'], 5);
          this.anim(0.3, (k) => { c.mesh.scale.setScalar(1 - k); c.mesh.position.addScaledVector(this.frameAt(c.s).u, 0.1); }, () => (c.mesh.visible = false));
          this.on.coin?.();
        }
        for (const pd of this.pads) {
          if (pd.used || Math.abs(pd.s - p.s) > 2.8 || Math.abs(pd.x - p.x) > 1.8) continue;
          pd.used = true;
          p.boost = Math.max(p.boost, 1.5 * (1 + 0.2 * this.up.boost));
          this.on.pad?.();
        }
        const cp = this.checkpoints[this.nextCheckpoint];
        if (cp && p.s >= cp.s) { this.nextCheckpoint++; this.sparkle(p.obj.position.clone().add(new THREE.Vector3(0, 6, 0)), 40, this.theme.rail); this.on.checkpoint?.(); }
        const g = this.gates[this.nextGate];
        if (g && prev < g.s && p.s >= g.s) {
          let lane = 0;
          LANES.forEach((lx, k) => { if (Math.abs(lx - p.x) < Math.abs(LANES[lane] - p.x)) lane = k; });
          const i = this.nextGate++;
          this.on.gate?.(i, lane);
        }
        if (p.s >= this.L) {
          p.finished = true;
          this.mode = 'finish';
          this.showT = 0;
          this.sparkle(p.obj.position.clone().add(new THREE.Vector3(0, 3, 0)), 120, ['#ff5fa8', '#ffc93c', '#3fd0ff', '#ffffff']);
          this.on.finish?.(this.rank());
        }
      }
      for (const c of this.coins) if (!c.taken) c.mesh.rotateY(dt * 3);
    }
    this.updateParticles(dt);
    this.anims = this.anims.filter((a) => {
      a.t += dt;
      const k = Math.min(1, a.t / a.dur);
      a.update(k);
      if (k >= 1) { a.done?.(); return false; }
      return true;
    });
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }

  rank() { return 1 + this.rivals.filter((r) => r.s > this.player.s).length; }
  hud() {
    const p = this.player;
    return { rank: this.rank(), racers: this.rivals.length + 1, progress: Math.min(1, p.s / this.L), speed: p.v, boost: p.boost > 0, time: this.raceTime || 0, nextGate: this.nextGate, gates: this.gates.length };
  }
}
