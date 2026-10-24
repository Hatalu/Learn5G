// Procedural 3D models: chibi driver + kart, floating islands, crystals, clouds.
// Toon shading + inverted-hull outline for a cute, clean "cartoon" look.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

const gradientMap = (() => {
  const t = new THREE.DataTexture(new Uint8Array([110, 170, 225, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshToonMaterial({ color, gradientMap, ...opts }));
  return matCache.get(key);
}
export function glow(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0x2b1b4a, side: THREE.BackSide });

function mesh(geo, mat, outline = 0.05) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  if (outline) {
    const o = new THREE.Mesh(geo, OUTLINE);
    o.scale.setScalar(1 + outline);
    o.raycast = () => {};
    m.add(o);
  }
  return m;
}
const at = (obj, x, y, z) => { obj.position.set(x, y, z); return obj; };
const rbox = (w, h, d, r = 0.15) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1));

// Radial soft-glow texture used for headlights, underglow, sun.
export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner);
  gr.addColorStop(1, outer);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const GLOW_TEX = radialTexture();

export const KART_STYLES = [
  { id: 'pink', name: 'พิ้งกี้สตาร์', body: '#ff6fb5', trim: '#ffffff', accent: '#8f6bff', hair: '#c9a8ff', suit: '#43307a', glow: '#5ff4ff' },
  { id: 'sky', name: 'สกายบลู', body: '#3fb8ff', trim: '#ffffff', accent: '#ffd23f', hair: '#ff9fcf', suit: '#24407a', glow: '#ffe25f' },
  { id: 'sun', name: 'ซันนี่โกลด์', body: '#ffb02e', trim: '#fff6e0', accent: '#ff4f7b', hair: '#7a5cff', suit: '#5a2d1f', glow: '#ff7af0' },
  { id: 'mint', name: 'มินต์ซิ่ง', body: '#35d39a', trim: '#ffffff', accent: '#3f6bff', hair: '#ffcf5a', suit: '#1f4a52', glow: '#a6ff5f' },
];
export const RIVAL_STYLES = [
  { id: 'r1', body: '#8f6bff', trim: '#ffffff', accent: '#ffd23f', hair: '#ff8a5c', suit: '#2f2256', glow: '#ffd23f' },
  { id: 'r2', body: '#ff5a5a', trim: '#ffffff', accent: '#3fb8ff', hair: '#3a2a2a', suit: '#4a1f2a', glow: '#5fd4ff' },
  { id: 'r3', body: '#2fd0d0', trim: '#ffffff', accent: '#ff6fb5', hair: '#ffe08a', suit: '#1f3a4a', glow: '#ff9ff0' },
];

function buildDriver(st) {
  const g = new THREE.Group();
  const skin = toon('#ffd9c2'), hair = toon(st.hair), suit = toon(st.suit), dark = toon('#22183d');

  const torso = mesh(new THREE.CapsuleGeometry(0.36, 0.38, 6, 14), suit);
  at(torso, 0, 0.35, 0);
  g.add(torso);
  const collar = mesh(new THREE.TorusGeometry(0.28, 0.07, 8, 20), toon(st.accent), 0.03);
  collar.rotation.x = Math.PI / 2;
  at(collar, 0, 0.72, 0);
  g.add(collar);

  const head = new THREE.Group();
  at(head, 0, 1.28, 0.02);
  g.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.6, 32, 24), skin, 0.035));

  // Hair: cap + bangs + spikes + cat-ear tufts.
  const cap = mesh(new THREE.SphereGeometry(0.66, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0.03);
  cap.rotation.x = -0.35;
  at(cap, 0, 0.06, -0.06);
  head.add(cap);
  for (let i = -2; i <= 2; i++) {
    const bang = mesh(new THREE.ConeGeometry(0.16, 0.42, 10), hair, 0.04);
    bang.rotation.set(Math.PI + 0.5, 0, i * 0.22);
    at(bang, i * 0.17, 0.3, 0.46);
    head.add(bang);
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 2.4;
    const sp = mesh(new THREE.ConeGeometry(0.17, 0.55, 10), hair, 0.04);
    sp.rotation.set(-1.9, a * 0.6, 0);
    at(sp, Math.sin(a) * 0.5, 0.15 + Math.cos(a) * 0.12, -0.45);
    head.add(sp);
  }
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.ConeGeometry(0.2, 0.5, 4), hair, 0.04);
    ear.rotation.set(-0.2, 0, s * -0.45);
    at(ear, s * 0.38, 0.62, -0.05);
    head.add(ear);
    const inner = mesh(new THREE.ConeGeometry(0.1, 0.3, 4), toon('#ffb3d6'), 0);
    inner.rotation.copy(ear.rotation);
    at(inner, s * 0.38, 0.6, 0.04);
    head.add(inner);
  }

  // Face: big glossy eyes, blush, smile.
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.13, 16, 16), toon('#2a2a6e'), 0);
    eye.scale.set(0.85, 1.25, 0.45);
    at(eye, s * 0.22, -0.02, 0.54);
    head.add(eye);
    const iris = mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshBasicMaterial({ color: st.glow }), 0);
    iris.scale.set(0.9, 1, 0.4);
    at(iris, s * 0.22, -0.07, 0.585);
    head.add(iris);
    const shine = mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0);
    at(shine, s * 0.22 + 0.04, 0.05, 0.6);
    head.add(shine);
    const blush = mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: '#ff8fb8', transparent: true, opacity: 0.6 }), 0);
    blush.scale.set(1.3, 0.6, 0.3);
    at(blush, s * 0.36, -0.2, 0.47);
    head.add(blush);
  }
  const smile = mesh(new THREE.TorusGeometry(0.08, 0.022, 6, 16, Math.PI), dark, 0);
  smile.rotation.z = Math.PI;
  at(smile, 0, -0.2, 0.575);
  head.add(smile);

  // Goggles on forehead.
  const band = mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 40), toon('#33305a'), 0);
  band.rotation.x = Math.PI / 2 - 0.45;
  at(band, 0, 0.24, 0);
  head.add(band);
  for (const s of [-1, 1]) {
    const lens = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 20), toon('#ffffff'), 0.06);
    lens.rotation.x = Math.PI / 2 - 0.5;
    at(lens, s * 0.2, 0.42, 0.44);
    head.add(lens);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), new THREE.MeshBasicMaterial({ color: st.glow }));
    glass.rotation.x = -0.5;
    at(glass, s * 0.2, 0.445, 0.495);
    head.add(glass);
  }

  // Arms reaching to the wheel.
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.11, 0.5, 4, 10), suit, 0.05);
    arm.rotation.set(1.2, 0, s * 0.35);
    at(arm, s * 0.36, 0.48, 0.32);
    g.add(arm);
    const hand = mesh(new THREE.SphereGeometry(0.12, 12, 10), toon('#ffffff'), 0.05);
    at(hand, s * 0.24, 0.42, 0.68);
    g.add(hand);
  }
  g.userData.head = head;
  return g;
}

export function buildKart(st) {
  const kart = new THREE.Group();
  const body = new THREE.Group();
  kart.add(body);
  const main = toon(st.body), trim = toon(st.trim), acc = toon(st.accent), dark = toon('#2c2a40'), metal = toon('#cfd6e6');

  body.add(at(mesh(rbox(2.0, 0.55, 3.0, 0.24), main), 0, 0.62, 0));
  body.add(at(mesh(rbox(1.5, 0.42, 1.1, 0.2), main), 0, 0.56, 1.75));
  body.add(at(mesh(rbox(2.2, 0.26, 0.36, 0.12), trim), 0, 0.36, 2.25));
  body.add(at(mesh(rbox(1.35, 0.32, 0.95, 0.15), trim), 0, 0.98, 0.95));
  for (const s of [-1, 1]) {
    body.add(at(mesh(rbox(0.5, 0.48, 1.7, 0.18), acc), s * 1.08, 0.6, -0.1));
    const stripe = at(mesh(rbox(0.06, 0.12, 2.2, 0.03), trim, 0), s * 1.005, 0.7, 0.2);
    body.add(stripe);
  }
  const gem = mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: st.glow }), 0.08);
  gem.scale.set(1, 1.3, 0.35);
  at(gem, 0, 0.8, 2.3);
  body.add(gem);
  body.add(at(mesh(rbox(1.1, 0.95, 0.32, 0.14), dark), 0, 1.2, -0.75));
  // Spoiler
  body.add(at(mesh(rbox(2.3, 0.12, 0.55, 0.05), acc), 0, 1.55, -1.6));
  for (const s of [-1, 1]) body.add(at(mesh(rbox(0.12, 0.6, 0.3, 0.04), dark, 0.04), s * 0.7, 1.2, -1.55));
  // Steering wheel
  const sw = mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 20), dark, 0.03);
  sw.rotation.x = -0.9;
  at(sw, 0, 1.2, 0.55);
  body.add(sw);

  // Exhaust + boost flames
  const flames = [];
  for (const s of [-1, 1]) {
    const pipe = mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.5, 14), metal, 0.05);
    pipe.rotation.x = Math.PI / 2;
    at(pipe, s * 0.45, 0.72, -1.65);
    body.add(pipe);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 12, 1, true), glow(st.glow, 0.9));
    fl.rotation.x = -Math.PI / 2;
    at(fl, s * 0.45, 0.72, -2.5);
    fl.visible = false;
    body.add(fl);
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.9, 10, 1, true), glow('#ffffff', 0.9));
    core.rotation.x = -Math.PI / 2;
    at(core, s * 0.45, 0.72, -2.25);
    core.visible = false;
    body.add(core);
    flames.push(fl, core);
  }
  // Headlights
  for (const s of [-1, 1]) {
    body.add(at(mesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff6c2' }), 0.06), s * 0.55, 0.65, 2.3));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color: '#fff2a8', blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
    halo.scale.setScalar(0.9);
    at(halo, s * 0.55, 0.65, 2.45);
    body.add(halo);
  }

  // Wheels with glowing rims
  const wheels = [];
  const wheelSpots = [[1.12, 1.25, 0.46], [-1.12, 1.25, 0.46], [1.15, -1.05, 0.56], [-1.15, -1.05, 0.56]];
  for (const [x, z, r] of wheelSpots) {
    const w = new THREE.Group();
    at(w, x, r, z);
    const tire = mesh(new THREE.CylinderGeometry(r, r, 0.45, 26), toon('#2b2838'), 0.05);
    tire.rotation.z = Math.PI / 2;
    w.add(tire);
    const rim = mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.47, 18), metal, 0);
    rim.rotation.z = Math.PI / 2;
    w.add(rim);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.72, 0.045, 8, 28), new THREE.MeshBasicMaterial({ color: st.glow }));
    ring.rotation.y = Math.PI / 2;
    ring.position.x = Math.sign(x) * 0.24;
    w.add(ring);
    for (let k = 0; k < 3; k++) {
      const spoke = mesh(new THREE.BoxGeometry(0.48, 0.08, r * 1.1), toon(st.accent), 0);
      spoke.rotation.x = (k * Math.PI) / 3;
      w.add(spoke);
    }
    body.add(w);
    wheels.push(w);
  }

  // Neon underglow
  const under = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.6), new THREE.MeshBasicMaterial({ map: GLOW_TEX, color: st.glow, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  under.rotation.x = -Math.PI / 2;
  under.position.y = 0.06;
  kart.add(under);

  const driver = buildDriver(st);
  at(driver, 0, 0.75, -0.3);
  body.add(driver);

  let t = 0;
  kart.userData = {
    style: st,
    setBoost(on) { flames.forEach((f) => (f.visible = on)); },
    update(dt, speed, steer) {
      t += dt;
      for (const w of wheels) w.children.forEach((c, i) => { if (i !== 2) c.rotation.x += speed * dt * 1.6; });
      wheels[0].rotation.y = wheels[1].rotation.y = steer * 0.35;
      body.rotation.z = -steer * 0.08;
      body.rotation.y = steer * 0.12;
      body.position.y = Math.sin(t * 18) * 0.02 * Math.min(1, speed / 10);
      driver.userData.head.rotation.z = Math.sin(t * 2.2) * 0.06 - steer * 0.15;
      driver.userData.head.position.y = 1.28 + Math.sin(t * 9) * 0.015;
      for (const f of flames) f.scale.y = 0.8 + Math.random() * 0.5;
      under.material.opacity = 0.45 + Math.sin(t * 6) * 0.1;
    },
  };
  return kart;
}

// ---------- Scenery ----------
export function buildIsland(rand, palette) {
  const g = new THREE.Group();
  const r = 6 + rand() * 7;
  const rock = mesh(new THREE.ConeGeometry(r, r * 1.6, 9, 3), toon(palette.rock), 0.02);
  rock.rotation.x = Math.PI;
  rock.position.y = -r * 0.8;
  g.add(rock);
  const top = mesh(new THREE.CylinderGeometry(r * 1.02, r, 1.4, 18), toon(palette.grass), 0.02);
  g.add(top);
  // Castle / towers
  const towers = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < towers; i++) {
    const a = rand() * Math.PI * 2, d = rand() * r * 0.45;
    const h = 4 + rand() * 7, w = 1 + rand() * 1.2;
    const tw = mesh(new THREE.CylinderGeometry(w, w * 1.1, h, 14), toon(palette.wall), 0.03);
    at(tw, Math.cos(a) * d, h / 2 + 0.6, Math.sin(a) * d);
    g.add(tw);
    const roof = mesh(rand() < 0.5 ? new THREE.ConeGeometry(w * 1.4, h * 0.55, 14) : new THREE.SphereGeometry(w * 1.25, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(palette.roofs[i % palette.roofs.length]), 0.03);
    at(roof, tw.position.x, h + 0.6 + (roof.geometry.type === 'ConeGeometry' ? h * 0.27 : 0), tw.position.z);
    g.add(roof);
    const flag = mesh(new THREE.BoxGeometry(0.9, 0.5, 0.05), toon(palette.flag), 0);
    at(flag, tw.position.x + 0.45, h + 0.6 + h * 0.6, tw.position.z);
    g.add(flag);
  }
  // Round trees
  for (let i = 0; i < 4; i++) {
    const a = rand() * Math.PI * 2, d = r * (0.55 + rand() * 0.35);
    const crown = mesh(new THREE.SphereGeometry(0.9 + rand() * 0.6, 12, 10), toon(palette.tree), 0.04);
    at(crown, Math.cos(a) * d, 2.2, Math.sin(a) * d);
    g.add(crown);
    const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.6, 6), toon('#8b5a3c'), 0);
    at(trunk, crown.position.x, 1.1, crown.position.z);
    g.add(trunk);
  }
  return g;
}

export function buildCrystal(rand, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color, gradientMap, emissive: color, emissiveIntensity: 0.45, transparent: true, opacity: 0.92 });
  const n = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const c = mesh(new THREE.OctahedronGeometry(1, 0), mat, 0.04);
    c.scale.set(0.5 + rand() * 0.4, 1.6 + rand() * 1.8, 0.5 + rand() * 0.4);
    c.rotation.set((rand() - 0.5) * 0.8, rand() * 3, (rand() - 0.5) * 0.8);
    c.position.set((rand() - 0.5) * 1.6, 0, (rand() - 0.5) * 1.6);
    g.add(c);
  }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  halo.scale.setScalar(7);
  g.add(halo);
  return g;
}

export function buildCloudSea(count, area, y, rand) {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const mat = new THREE.MeshToonMaterial({ color: '#fff4fb', gradientMap });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * area;
    p.set(Math.cos(a) * d, y + rand() * 10, Math.sin(a) * d);
    const k = 6 + rand() * 14;
    s.set(k * 1.4, k * 0.7, k);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
  }
  inst.receiveShadow = true;
  return inst;
}

export function buildStarCoin() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.42 : 0.95, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 });
  geo.center();
  return geo;
}
