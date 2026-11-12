// Knowledge Arena — 3D view (three.js r170). Procedural low-poly toon models + inverted-hull outlines.
// The view only draws snapshots from sim.js; it never changes game state.
import * as THREE from 'three';
import { ARENA_R, ZONE_R, OBSTACLES, HAZARDS, BOUNCERS, ORB_POS } from './sim.js';

export const COLORS = ['#ff6fb5', '#3fb8ff', '#ffb02e', '#35d39a', '#9b6bff', '#ff6b4a', '#f2f2f2', '#5b6cff'];
export const EARS = [
  { id: 'cat', name: 'แมวเหมียว' }, { id: 'bunny', name: 'กระต่าย' }, { id: 'bear', name: 'หมีน้อย' }, { id: 'fox', name: 'จิ้งจอก' },
];
// Hats unlock with lifetime stars (saved locally).
export const HATS = [
  { id: 'none', name: 'ไม่ใส่', need: 0 }, { id: 'cap', name: 'หมวกแก๊ป', need: 0 }, { id: 'flower', name: 'ดอกไม้', need: 20 },
  { id: 'crown', name: 'มงกุฎ', need: 60 }, { id: 'prop', name: 'ใบพัด', need: 120 }, { id: 'halo', name: 'วงแหวนดาว', need: 200 },
];

// ---------------- materials ----------------
const gradientMap = (() => {
  const t = new THREE.DataTexture(new Uint8Array([120, 185, 235, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const matCache = new Map();
function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshToonMaterial({ color, gradientMap, ...opts }));
  return matCache.get(key);
}
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0x2b1b4a, side: THREE.BackSide });
function mesh(geo, mat, outline = 0.05) {
  const m = new THREE.Mesh(geo, mat);
  if (outline) { const o = new THREE.Mesh(geo, OUTLINE); o.scale.setScalar(1 + outline); m.add(o); }
  return m;
}
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = radialTexture();
const SHADOW = radialTexture('rgba(30,10,60,0.45)', 'rgba(30,10,60,0)');
function glowSprite(color, size, opacity = 0.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.setScalar(size); return s;
}
function blob(r) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.renderOrder = 1; return m;
}
function starGeo(outer = 0.5, inner = 0.22, depth = 0.16) {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  g.center(); return g;
}
const STAR = starGeo();
const SMALL_STAR = starGeo(0.16, 0.07, 0.05);
function lighten(hex, k) { return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), k).getHexString(); }
function darken(hex, k) { return '#' + new THREE.Color(hex).lerp(new THREE.Color('#2b1b4a'), k).getHexString(); }
function textSprite(txt, color = '#fff', size = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.font = '900 104px Mitr, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 14; g.strokeStyle = '#2b1b4a'; g.strokeText(txt, 64, 70); g.fillStyle = color; g.fillText(txt, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.setScalar(size); return s;
}

// ---------------- the buddy (player character) ----------------
export function buildBuddy(look = {}) {
  const color = look.color || COLORS[0], ears = look.ears || 'cat';
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const main = toon(color), light = toon(lighten(color, 0.55)), dark = toon(darken(color, 0.35));
  const torso = mesh(new THREE.SphereGeometry(0.5, 20, 16), main); torso.scale.set(1, 0.92, 0.95); at(torso, 0, 0.55, 0); body.add(torso);
  const belly = mesh(new THREE.SphereGeometry(0.34, 16, 12), light, 0); belly.scale.set(1, 1, 0.5); at(belly, 0, 0.5, 0.3); body.add(belly);
  const head = new THREE.Group(); at(head, 0, 1.22, 0); body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.5, 22, 18), main));
  const muzzle = mesh(new THREE.SphereGeometry(0.2, 14, 10), light, 0); muzzle.scale.set(1.3, 0.8, 0.7); at(muzzle, 0, -0.12, 0.4); head.add(muzzle);
  const eyeM = toon('#1d1233'), white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), eyeM); e.scale.set(1, 1.25, 0.6); at(e, s * 0.18, 0.06, 0.45); head.add(e);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), white); at(h, s * 0.18 + 0.025, 0.1, 0.5); head.add(h);
    const bl = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), new THREE.MeshBasicMaterial({ color: '#ff8fb8', transparent: true, opacity: 0.75 }));
    at(bl, s * 0.31, -0.08, 0.405); bl.rotation.y = s * 0.55; head.add(bl);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), toon('#3a2150')); at(nose, 0, -0.06, 0.53); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 6, 12, Math.PI), toon('#3a2150')); mouth.rotation.z = Math.PI; at(mouth, 0, -0.15, 0.5); head.add(mouth);
  // ears + tail
  const pink = toon('#ffb3cf');
  let tail;
  if (ears === 'bunny') {
    for (const s of [-1, 1]) {
      const e = mesh(new THREE.CapsuleGeometry(0.1, 0.42, 6, 10), main); at(e, s * 0.17, 0.62, -0.02); e.rotation.z = -s * 0.15; head.add(e);
      const i = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.32, 4, 8), pink); at(i, 0, 0, 0.07); e.add(i);
    }
    tail = mesh(new THREE.SphereGeometry(0.15, 12, 10), light);
  } else if (ears === 'bear') {
    for (const s of [-1, 1]) {
      const e = mesh(new THREE.SphereGeometry(0.16, 14, 10), main); at(e, s * 0.34, 0.38, 0); head.add(e);
      const i = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), pink); i.scale.z = 0.5; at(i, 0, 0, 0.1); e.add(i);
    }
    tail = mesh(new THREE.SphereGeometry(0.11, 10, 8), main);
  } else {
    const fox = ears === 'fox';
    for (const s of [-1, 1]) {
      const e = mesh(new THREE.ConeGeometry(fox ? 0.19 : 0.16, fox ? 0.42 : 0.32, 4), main); at(e, s * 0.27, 0.45, 0); e.rotation.z = -s * 0.32; e.rotation.y = Math.PI / 4; head.add(e);
      const i = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), pink); at(i, 0, -0.04, 0.05); e.add(i);
    }
    if (fox) {
      tail = new THREE.Group();
      const t1 = mesh(new THREE.SphereGeometry(0.2, 12, 10), main); t1.scale.set(0.9, 0.9, 1.9); tail.add(t1);
      const t2 = mesh(new THREE.SphereGeometry(0.13, 10, 8), toon('#ffffff')); at(t2, 0, 0.02, -0.33); tail.add(t2);
      tail.rotation.x = -0.6;
    } else {
      tail = mesh(new THREE.CapsuleGeometry(0.06, 0.45, 4, 8), main); tail.rotation.x = -0.9;
    }
  }
  at(tail, 0, 0.45, -0.5); body.add(tail);
  // arms + feet
  const arms = [-1, 1].map((s) => { const a = mesh(new THREE.SphereGeometry(0.14, 12, 10), main); a.scale.set(0.9, 1.15, 0.9); at(a, s * 0.5, 0.66, 0.05); body.add(a); return a; });
  const feet = [-1, 1].map((s) => { const f = mesh(new THREE.SphereGeometry(0.16, 12, 10), dark); f.scale.set(1, 0.6, 1.3); at(f, s * 0.21, 0.09, 0.05); root.add(f); return f; });
  // hat
  const hatId = look.hat || 'none';
  let hat = null;
  if (hatId === 'cap') {
    hat = new THREE.Group();
    const dome = mesh(new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lighten(color, 0.2) === color ? '#ff4f7b' : '#ff4f7b')); hat.add(dome);
    const brim = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16, 1, false, -Math.PI / 2, Math.PI), toon('#ff4f7b'), 0.03); at(brim, 0, 0, 0.18); hat.add(brim);
    at(hat, 0, 0.38, 0); hat.rotation.x = -0.15;
  } else if (hatId === 'flower') {
    hat = new THREE.Group();
    for (let i = 0; i < 5; i++) { const p = mesh(new THREE.SphereGeometry(0.1, 10, 8), toon('#ffd23f'), 0.04); const a = (i / 5) * Math.PI * 2; at(p, Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12); p.scale.y = 0.5; hat.add(p); }
    hat.add(mesh(new THREE.SphereGeometry(0.07, 10, 8), toon('#ff6b4a'), 0.04));
    at(hat, 0.22, 0.42, 0.12); hat.rotation.z = -0.4;
  } else if (hatId === 'crown') {
    hat = buildCrown(0.28); at(hat, 0, 0.5, 0);
  } else if (hatId === 'prop') {
    hat = new THREE.Group();
    hat.add(mesh(new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#3fb8ff')));
    const blade = new THREE.Group(); at(blade, 0, 0.36, 0); hat.add(blade);
    for (const s of [0, Math.PI / 2]) { const b = mesh(new THREE.BoxGeometry(0.7, 0.03, 0.12), toon(s ? '#ffd23f' : '#ff4f7b'), 0.04); b.rotation.y = s; blade.add(b); }
    hat.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36), toon('#2b1b4a')), 0, 0.18, 0));
    hat.userData.spin = blade; at(hat, 0, 0.4, 0);
  } else if (hatId === 'halo') {
    hat = new THREE.Group();
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(SMALL_STAR, toon('#ffe25f', { emissive: '#ffb02e', emissiveIntensity: 0.6 })); const a = (i / 5) * Math.PI * 2; at(s, Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36); hat.add(s); }
    hat.userData.spin = hat; at(hat, 0, 0.72, 0);
  }
  if (hat) head.add(hat);
  root.add(blob(0.6));

  // status props
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), new THREE.MeshToonMaterial({ color: '#8ff4ff', gradientMap, transparent: true, opacity: 0.28, emissive: '#3fd8ff', emissiveIntensity: 0.4, depthWrite: false }));
  at(bubble, 0, 0.85, 0); bubble.scale.setScalar(1.05); bubble.visible = false; root.add(bubble);
  const qmark = textSprite('?', '#ffe25f', 0.9); at(qmark, 0, 2.55, 0); qmark.visible = false; root.add(qmark);
  const stars = new THREE.Group(); at(stars, 0, 1.95, 0); stars.visible = false; root.add(stars);
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(SMALL_STAR, toon('#ffe25f', { emissive: '#ffb02e', emissiveIntensity: 0.5 })); const a = (i / 3) * Math.PI * 2; at(s, Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4); stars.add(s); }
  const aura = glowSprite('#ffd23f', 3, 0.0); at(aura, 0, 0.9, 0); root.add(aura);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; root.add(ring);
  const marker = mesh(new THREE.ConeGeometry(0.2, 0.34, 4), toon('#ffe25f', { emissive: '#ffb02e', emissiveIntensity: 0.4 }), 0.08);
  marker.rotation.x = Math.PI; at(marker, 0, 2.35, 0); marker.visible = false; root.add(marker);

  root.scale.setScalar(1.25);
  let phase = 0, squash = 0;
  return {
    root, body, head, ring, marker, look: { color, ears, hat: hatId },
    bump(k = 1) { squash = Math.max(squash, k); },
    update(dt, s, t) {
      const sp = Math.hypot(s.vx || 0, s.vz || 0);
      phase += dt * (4 + sp * 1.8);
      const run = Math.min(1, sp / 6);
      squash *= Math.exp(-dt * 9);
      const bob = Math.abs(Math.sin(phase)) * 0.12 * run;
      let sy = 1 + Math.sin(phase * 2) * 0.05 * run - squash * 0.25, sxz = 1 / Math.sqrt(Math.max(0.5, sy));
      if (s.dash) { sy = 0.75; sxz = 1.2; }
      body.scale.set(sxz, sy, sxz);
      body.position.y = bob;
      body.rotation.x = run * 0.18 + (s.dash ? 0.5 : 0);
      feet[0].position.z = 0.05 + Math.sin(phase) * 0.22 * run; feet[1].position.z = 0.05 - Math.sin(phase) * 0.22 * run;
      feet[0].position.y = 0.09 + Math.max(0, Math.sin(phase)) * 0.1 * run; feet[1].position.y = 0.09 + Math.max(0, -Math.sin(phase)) * 0.1 * run;
      arms[0].position.z = 0.05 - Math.sin(phase) * 0.18 * run; arms[1].position.z = 0.05 + Math.sin(phase) * 0.18 * run;
      if (s.atk) { arms[1].position.set(0.32, 0.75, 0.62); body.rotation.x = -0.15; }
      else arms[1].position.x = 0.5, arms[1].position.y = 0.66;
      head.rotation.z = s.stun ? Math.sin(t * 9) * 0.25 : Math.sin(t * 2 + phase * 0.1) * 0.04;
      if (tail) tail.rotation.y = Math.sin(t * 6) * 0.4;
      stars.visible = !!s.stun; stars.rotation.y = t * 5;
      const inQuiz = s.st === 'quiz';
      bubble.visible = inQuiz || s.eff?.shield > 0;
      bubble.material.color.set(inQuiz ? '#ffe98f' : '#8ff4ff');
      bubble.scale.setScalar(1.05 + Math.sin(t * 4) * 0.04);
      qmark.visible = inQuiz; qmark.position.y = 2.55 + Math.sin(t * 3) * 0.1;
      aura.material.opacity = s.eff?.double > 0 ? 0.55 + Math.sin(t * 8) * 0.15 : s.eff?.speed > 0 ? 0.35 : 0;
      aura.material.color.set(s.eff?.double > 0 ? '#ffd23f' : '#5ff4ff');
      root.visible = !(s.inv && s.st === 'play' && Math.sin(t * 30) > 0.6);
      if (hat?.userData.spin) hat.userData.spin.rotation.y += dt * 9;
      marker.position.y = 2.35 + Math.sin(t * 4) * 0.12;
      ring.material.opacity = 0.85;
    },
  };
}

export function buildCrown(k = 1) {
  const g = new THREE.Group();
  const gold = toon('#ffd23f', { emissive: '#ff9f1c', emissiveIntensity: 0.25 });
  const band = mesh(new THREE.CylinderGeometry(1 * k, 1 * k, 0.55 * k, 20, 1, true), new THREE.MeshToonMaterial({ color: '#ffd23f', gradientMap, emissive: '#ff9f1c', emissiveIntensity: 0.25, side: THREE.DoubleSide }), 0.04);
  g.add(band);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const sp = mesh(new THREE.ConeGeometry(0.28 * k, 0.6 * k, 4), gold, 0.04); at(sp, Math.cos(a) * k * 0.92, 0.5 * k, Math.sin(a) * k * 0.92); g.add(sp);
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.12 * k, 10, 8), toon(['#ff4f7b', '#3fb8ff', '#35d39a'][i % 3])); at(gem, Math.cos(a) * k * 1.0, 0.05 * k, Math.sin(a) * k * 1.0); g.add(gem);
  }
  return g;
}

// ---------------- scenery ----------------
function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function jitter(geo, amt, rand) {
  const p = geo.attributes.position, map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!map.has(k)) map.set(k, [(rand() - 0.5) * amt, (rand() - 0.5) * amt, (rand() - 0.5) * amt]);
    const d = map.get(k); p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]);
  }
  geo.computeVertexNormals(); return geo;
}
function buildTree(rand, pinkish) {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.8, 7), toon('#8b5a3c'), 0.04); at(trunk, 0, 0.9, 0); g.add(trunk);
  const cols = pinkish ? ['#ff9fcf', '#ffc2e0', '#ff7ab8'] : ['#4cc96b', '#6be08a', '#38b25c'];
  [[0, 2.3, 0, 1.15], [0.55, 2.0, 0.3, 0.8], [-0.5, 2.1, -0.2, 0.85], [0.1, 2.95, 0, 0.75]].forEach(([x, y, z, r], i) => {
    const c = mesh(jitter(new THREE.IcosahedronGeometry(r, 1), 0.12, rand), toon(cols[i % 3]), 0.04); at(c, x, y, z); g.add(c);
  });
  g.add(blob(1.4));
  return g;
}
function buildRock(rand) {
  const g = new THREE.Group();
  const r = mesh(jitter(new THREE.DodecahedronGeometry(1.1, 0), 0.25, rand), toon('#9a8fb8'), 0.04); r.scale.y = 0.85; at(r, 0, 0.75, 0); g.add(r);
  const moss = mesh(jitter(new THREE.IcosahedronGeometry(0.6, 0), 0.15, rand), toon('#6be08a'), 0.04); moss.scale.y = 0.45; at(moss, 0.1, 1.45, 0.05); g.add(moss);
  const s = mesh(jitter(new THREE.DodecahedronGeometry(0.45, 0), 0.12, rand), toon('#b4a9d4'), 0.04); at(s, 0.9, 0.3, 0.5); g.add(s);
  g.add(blob(1.6)); return g;
}
function buildCrystal(rand, color = '#7ae8ff') {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color, gradientMap, emissive: color, emissiveIntensity: 0.45 });
  for (let i = 0; i < 5; i++) {
    const c = mesh(new THREE.OctahedronGeometry(0.5, 0), mat, 0.05);
    c.scale.set(0.8, 1.8 + rand() * 1.4, 0.8); c.rotation.set((rand() - 0.5) * 0.7, rand() * 3, (rand() - 0.5) * 0.7);
    at(c, (rand() - 0.5) * 1, c.scale.y * 0.4, (rand() - 0.5) * 1); g.add(c);
  }
  const h = glowSprite(color, 5, 0.45); at(h, 0, 1.2, 0); g.add(h);
  g.add(blob(1.2)); return g;
}
function buildMushroom() {
  const g = new THREE.Group();
  const stem = mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12), toon('#fff4e0'), 0.05); at(stem, 0, 0.4, 0); g.add(stem);
  const cap = mesh(new THREE.SphereGeometry(1.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ff4f7b'), 0.05); at(cap, 0, 0.75, 0); cap.scale.y = 0.7; g.add(cap);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const d = new THREE.Mesh(new THREE.CircleGeometry(0.15, 10), toon('#ffffff')); at(d, Math.cos(a) * 0.62, 1.12, Math.sin(a) * 0.62); d.lookAt(Math.cos(a) * 2, 2.4, Math.sin(a) * 2); g.add(d); }
  g.userData.cap = cap; g.add(blob(1.3)); return g;
}
function buildHoney(r, rand) {
  const g = new THREE.Group();
  const pg = jitter(new THREE.CircleGeometry(r, 20), 0.35, rand); for (let i = 0; i < pg.attributes.position.count; i++) pg.attributes.position.setZ(i, 0);
  const pool = new THREE.Mesh(pg, toon('#ffb52e', { emissive: '#ff8a00', emissiveIntensity: 0.15 }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.06; g.add(pool);
  const shine = new THREE.Mesh(new THREE.CircleGeometry(r * 0.35, 14), new THREE.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.6 }));
  shine.rotation.x = -Math.PI / 2; at(shine, -r * 0.3, 0.08, -r * 0.25); shine.scale.set(1.4, 0.6, 1); g.add(shine);
  const bubbles = [];
  for (let i = 0; i < 6; i++) { const b = mesh(new THREE.SphereGeometry(0.14, 10, 8), toon('#ffd36b'), 0.06); at(b, (rand() - 0.5) * r * 1.2, 0.05, (rand() - 0.5) * r * 1.2); b.userData.ph = rand() * 6; bubbles.push(b); g.add(b); }
  g.userData.bubbles = bubbles; return g;
}
function buildOrb() {
  const g = new THREE.Group();
  const core = mesh(new THREE.IcosahedronGeometry(0.55, 2), toon('#9b6bff', { emissive: '#7a4dff', emissiveIntensity: 0.55 }), 0.05); at(core, 0, 1.2, 0); g.add(core);
  const q = textSprite('?', '#ffffff', 0.95); at(q, 0, 1.22, 0); q.renderOrder = 3; q.material.depthTest = false; g.add(q);
  const rings = [];
  for (let i = 0; i < 2; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 40), toon(i ? '#ffe25f' : '#5ff4ff', { emissive: i ? '#ffb02e' : '#3fd8ff', emissiveIntensity: 0.5 })); at(r, 0, 1.2, 0); rings.push(r); g.add(r); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 9, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#b89bff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  at(beam, 0, 4.5, 0); g.add(beam);
  g.add(at(glowSprite('#b89bff', 3.4, 0.7), 0, 1.2, 0));
  const pad = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.05, 32), new THREE.MeshBasicMaterial({ color: '#b89bff', transparent: true, opacity: 0.7, depthWrite: false }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.05; g.add(pad);
  g.userData = { core, rings, beam, s: 0 };
  return g;
}

function skyDome() {
  const geo = new THREE.SphereGeometry(400, 32, 16), cols = [];
  const top = new THREE.Color('#6cc6ff'), mid = new THREE.Color('#bfe7ff'), low = new THREE.Color('#ffd9ee');
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 400, c = y > 0 ? mid.clone().lerp(top, y) : mid.clone().lerp(low, Math.min(1, -y * 2.2));
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false }));
}
function cloud(rand, k = 1) {
  const g = new THREE.Group(), m = toon('#ffffff');
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), m); const r = (1.2 + rand() * 1.4) * k; s.scale.set(r * 1.3, r, r); at(s, (i - 2) * 1.6 * k, rand() * k, (rand() - 0.5) * 2 * k); g.add(s); }
  return g;
}

// ---------------- particles ----------------
class Particles {
  constructor(scene, n = 160) {
    this.pool = [];
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.visible = false; scene.add(s); this.pool.push({ s, life: 0 });
    }
    this.i = 0;
  }
  burst(x, y, z, { n = 12, color = '#ffe25f', speed = 4, up = 3, size = 0.6, life = 0.7, grav = 6, add = true } = {}) {
    for (let k = 0; k < n; k++) {
      const p = this.pool[this.i++ % this.pool.length];
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.6);
      Object.assign(p, { life, max: life, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: up * (0.5 + Math.random()), grav, size });
      p.s.material.color.set(color); p.s.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending;
      p.s.position.set(x, y, z); p.s.visible = true;
    }
  }
  update(dt) {
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; continue; }
      p.vy -= p.grav * dt;
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      const k = p.life / p.max;
      p.s.scale.setScalar(p.size * (0.4 + k * 0.8)); p.s.material.opacity = k;
    }
  }
}

// ---------------- the arena view ----------------
export class Arena {
  constructor(canvas, { dpr = 1.5, antialias = true } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#d9efff', 70, 190);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 900);
    this.camPos = new THREE.Vector3(0, 30, 34); this.camLook = new THREE.Vector3();
    this.mode = 'menu'; this.focus = []; this.t = 0; this.shake = 0;
    this.buddies = new Map(); this.itemMeshes = new Map();
    const s = this.scene;
    s.add(skyDome());
    s.add(new THREE.HemisphereLight('#ffffff', '#b79cff', 1.6));
    const sun = new THREE.DirectionalLight('#fff1d6', 2.2); sun.position.set(12, 30, 18); s.add(sun);
    this.buildIsland();
    this.particles = new Particles(s);
    this.coinGeo = STAR;
    this.gemGeo = new THREE.OctahedronGeometry(0.42, 0);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  buildIsland() {
    const s = this.scene, rand = seeded(42), R = ARENA_R;
    const isl = new THREE.Group(); s.add(isl); this.island = isl;
    const top = mesh(new THREE.CylinderGeometry(R + 0.4, R + 0.1, 1, 72), toon('#7ed957'), 0.012); at(top, 0, -0.5, 0); isl.add(top);
    const lip = mesh(new THREE.TorusGeometry(R + 0.25, 0.35, 8, 72), toon('#5fc24a'), 0); lip.rotation.x = Math.PI / 2; at(lip, 0, -0.05, 0); isl.add(lip);
    const dirt = mesh(jitter(new THREE.CylinderGeometry(R + 0.1, R - 1.5, 2.6, 36, 2), 0.5, rand), toon('#c98a5a'), 0.012); at(dirt, 0, -2.3, 0); isl.add(dirt);
    const under = mesh(jitter(new THREE.ConeGeometry(R - 1.5, 17, 28, 5), 1.6, rand), toon('#9a6b8f'), 0.01); under.rotation.x = Math.PI; at(under, 0, -12, 0); isl.add(under);
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2, d = R * (0.3 + rand() * 0.55);
      const c = buildCrystal(rand, ['#7ae8ff', '#ff9fe0', '#ffe25f'][i % 3]); c.rotation.x = Math.PI; c.scale.setScalar(1.3); at(c, Math.cos(a) * d, -5 - rand() * 6, Math.sin(a) * d); isl.add(c);
    }
    // grass patches, flowers, tufts (decor only)
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * (R - 1.5);
      const p = new THREE.Mesh(new THREE.CircleGeometry(0.8 + rand() * 1.6, 9), toon(rand() < 0.5 ? '#6fcf4d' : '#8fe06a')); p.rotation.x = -Math.PI / 2; at(p, Math.cos(a) * d, 0.02 + i * 0.0004, Math.sin(a) * d); isl.add(p);
    }
    const tuft = new THREE.ConeGeometry(0.08, 0.35, 4), tm = toon('#4cb84a');
    const tufts = new THREE.InstancedMesh(tuft, tm, 260), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < 260; i++) { const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * (R - 0.5); V.set(Math.cos(a) * d, 0.15, Math.sin(a) * d); S.setScalar(0.7 + rand() * 0.8); M.compose(V, Q, S); tufts.setMatrixAt(i, M); }
    isl.add(tufts);
    const fcols = ['#ffffff', '#ffd23f', '#ff8fc8', '#b89bff'];
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2, d = R - 0.6 - rand() * 3;
      const f = mesh(new THREE.SphereGeometry(0.13, 8, 6), toon(fcols[i % 4]), 0.06); f.scale.y = 0.6; at(f, Math.cos(a) * d, 0.12, Math.sin(a) * d); isl.add(f);
    }
    // boundary: glowing rim + little posts
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.07, 6, 120), new THREE.MeshBasicMaterial({ color: '#fff4b8' })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.06; isl.add(rim);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const post = mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.7, 6), toon('#fff4e0'), 0.06); at(post, Math.cos(a) * (R + 0.1), 0.35, Math.sin(a) * (R + 0.1)); isl.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), toon(i % 2 ? '#ff6fb5' : '#3fb8ff', { emissive: i % 2 ? '#ff6fb5' : '#3fb8ff', emissiveIntensity: 0.5 })); at(cap, post.position.x, 0.78, post.position.z); isl.add(cap);
    }
    // waterfall off one edge
    const wc = document.createElement('canvas'); wc.width = 32; wc.height = 128;
    const wg = wc.getContext('2d'); for (let y = 0; y < 128; y += 8) { wg.fillStyle = y % 16 ? '#8fe3ff' : '#d8f7ff'; wg.fillRect(0, y, 32, 8); }
    this.waterTex = new THREE.CanvasTexture(wc); this.waterTex.wrapT = THREE.RepeatWrapping; this.waterTex.repeat.set(1, 3);
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(3, 16), new THREE.MeshBasicMaterial({ map: this.waterTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    at(fall, -R - 0.3, -8, 4); fall.rotation.y = Math.PI / 2; isl.add(fall);
    // obstacles / hazards / bouncers
    this.mushrooms = [];
    OBSTACLES.forEach((o, i) => {
      const m = o.k === 'tree' ? buildTree(rand, i % 2 === 1) : o.k === 'rock' ? buildRock(rand) : buildCrystal(rand, i % 2 ? '#ff9fe0' : '#7ae8ff');
      at(m, o.x, 0, o.z); m.rotation.y = rand() * 6; isl.add(m);
    });
    this.honey = HAZARDS.map((h) => { const m = buildHoney(h.r, rand); at(m, h.x, 0, h.z); isl.add(m); return m; });
    this.mushrooms = BOUNCERS.map((b) => { const m = buildMushroom(); at(m, b.x, 0, b.z); isl.add(m); return m; });
    // capture zone
    const zone = new THREE.Group(); s.add(zone); this.zone = zone;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(ZONE_R, 48), new THREE.MeshBasicMaterial({ color: '#ffe25f', transparent: true, opacity: 0.25, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; zone.add(disc);
    const zr = new THREE.Mesh(new THREE.TorusGeometry(ZONE_R, 0.13, 8, 64), toon('#ffe25f', { emissive: '#ffb02e', emissiveIntensity: 0.6 })); zr.rotation.x = Math.PI / 2; zr.position.y = 0.1; zone.add(zr);
    const crown = buildCrown(0.6); at(crown, 0, 3.1, 0); zone.add(crown);
    const cg = glowSprite('#ffe25f', 4, 0.6); at(cg, 0, 3.2, 0); zone.add(cg);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const p = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), toon('#ffffff'), 0.08); at(p, Math.cos(a) * ZONE_R, 0.3, Math.sin(a) * ZONE_R); zone.add(p); }
    this.zoneParts = { disc, zr, crown, cg };
    // question orbs
    this.orbs = ORB_POS.map(([x, z]) => { const o = buildOrb(); at(o, x, 0, z); s.add(o); return o; });
    // distant decor
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.7, d = 75 + rand() * 25;
      const g = new THREE.Group();
      const t = mesh(new THREE.CylinderGeometry(6, 5.5, 1.4, 16), toon('#8fe06a'), 0.01); g.add(t);
      const u = mesh(jitter(new THREE.ConeGeometry(5.5, 9, 10, 2), 0.8, rand), toon('#b08aa8'), 0.01); u.rotation.x = Math.PI; at(u, 0, -5, 0); g.add(u);
      const tr = buildTree(rand, i % 2 === 0); at(tr, 1, 0.7, 0); tr.scale.setScalar(1.5); g.add(tr);
      at(g, Math.cos(a) * d, -6 + rand() * 12, Math.sin(a) * d); g.userData.ph = rand() * 6; s.add(g);
      (this.far ||= []).push(g);
    }
    this.clouds = [];
    for (let i = 0; i < 16; i++) {
      const c = cloud(rand, 1.6 + rand() * 2); const a = rand() * Math.PI * 2, d = 40 + rand() * 90;
      at(c, Math.cos(a) * d, -24 + rand() * 18, Math.sin(a) * d); s.add(c); this.clouds.push(c);
    }
    const sunGlow = glowSprite('#fff3c4', 70, 0.75); at(sunGlow, 120, 110, -200); s.add(sunGlow);
    // podium (results)
    const pod = new THREE.Group(); pod.visible = false; s.add(pod); this.podium = pod;
    [[0, 2.2, '#ffd23f'], [-2.4, 1.5, '#d9e3ff'], [2.4, 1.0, '#ffb08a']].forEach(([x, h, c], i) => {
      const b = mesh(new THREE.BoxGeometry(2.2, h, 2.2), toon(c), 0.03); at(b, x, h / 2, 0); pod.add(b);
      const num = textSprite(String(i + 1), '#ffffff', 1.3); at(num, x, h / 2, 1.2); pod.add(num);
    });
    this.podiumH = [2.2, 1.5, 1.0];
    this.podiumX = [0, -2.4, 2.4];
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  setMode(mode, focus = []) {
    this.mode = mode; this.focus = focus; this.podium.visible = mode === 'podium';
    const stage = mode === 'showroom' || mode === 'podium';
    this.orbs.forEach((o) => { o.visible = !stage; if (!stage) { o.userData.s = 1; o.scale.setScalar(1); } });
    if (stage) this.zone.position.set(0, -50, 0); else if (mode === 'menu') this.zone.position.set(0, 0, 0);
  }

  buddy(p) {
    let b = this.buddies.get(p.id);
    const look = p.look || {};
    if (b && (b.look.color !== (look.color || COLORS[0]) || b.look.ears !== (look.ears || 'cat') || b.look.hat !== (look.hat || 'none'))) { this.scene.remove(b.root); b = null; }
    if (!b) { b = buildBuddy(look); b.root.position.set(p.x, 0, p.z); this.scene.add(b.root); this.buddies.set(p.id, b); }
    return b;
  }
  clearBuddies(keep = []) {
    for (const [id, b] of this.buddies) if (!keep.includes(id)) { this.scene.remove(b.root); this.buddies.delete(id); }
  }

  // Draw one snapshot. `smooth` > 0 interpolates (network play).
  sync(snap, dt, { me = [], smooth = 0 } = {}) {
    const k = smooth ? 1 - Math.exp(-dt * smooth) : 1;
    const ids = new Set();
    for (const p of snap.players) {
      ids.add(p.id);
      const b = this.buddy(p);
      const r = b.root;
      r.position.x += (p.x - r.position.x) * k; r.position.z += (p.z - r.position.z) * k;
      r.position.y += ((p.st === 'fall' ? p.y : p.y) - r.position.y) * (smooth ? k : 1);
      let d = p.face - r.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); r.rotation.y += d * Math.min(1, k * 1.5 + (smooth ? 0 : 1));
      b.marker.visible = me.includes(p.id);
      b.update(dt, p, this.t);
    }
    for (const [id, b] of this.buddies) if (!ids.has(id) && this.mode !== 'showroom') { this.scene.remove(b.root); this.buddies.delete(id); }
    // items
    const seen = new Set();
    for (const [id, gem, x, z] of snap.items) {
      seen.add(id);
      let m = this.itemMeshes.get(id);
      if (!m) {
        m = gem ? mesh(this.gemGeo, toon('#5ff4ff', { emissive: '#2fc0ff', emissiveIntensity: 0.5 }), 0.08) : mesh(this.coinGeo, toon('#ffd23f', { emissive: '#ff9f1c', emissiveIntensity: 0.35 }), 0.06);
        if (!gem) m.scale.setScalar(0.75);
        m.add(at(glowSprite(gem ? '#5ff4ff' : '#ffe25f', 1.8, 0.5), 0, 0, 0));
        m.userData.pop = 0; this.scene.add(m); this.itemMeshes.set(id, m);
      }
      m.userData.pop = Math.min(1, m.userData.pop + dt * 4);
      const pop = m.userData.pop, e = 1 + Math.sin(pop * Math.PI) * 0.4 * (1 - pop);
      m.position.x += (x - m.position.x) * k; m.position.z += (z - m.position.z) * k;
      m.position.y = 0.7 + Math.sin(this.t * 3 + id) * 0.15;
      m.rotation.y = this.t * 2.5 + id;
      m.scale.setScalar((gem ? 1 : 0.75) * pop * e);
    }
    for (const [id, m] of this.itemMeshes) if (!seen.has(id)) { this.scene.remove(m); this.itemMeshes.delete(id); }
    // orbs
    snap.orbs.forEach((on, i) => {
      const o = this.orbs[i], u = o.userData;
      u.s += ((on ? 1 : 0) - u.s) * Math.min(1, dt * 6);
      o.visible = u.s > 0.02; o.scale.setScalar(Math.max(0.001, u.s));
      u.core.position.y = 1.2 + Math.sin(this.t * 2.5 + i) * 0.2; u.core.rotation.y += dt;
      u.rings[0].rotation.set(this.t * 1.7, this.t, 0); u.rings[1].rotation.set(-this.t, 0, this.t * 1.3);
      u.rings.forEach((r) => (r.position.y = u.core.position.y));
    });
    // zone
    const z = snap.zone;
    this.zone.position.y = 0;
    this.zone.position.x += (z.x - this.zone.position.x) * Math.min(1, dt * 3);
    this.zone.position.z += (z.z - this.zone.position.z) * Math.min(1, dt * 3);
    const owner = z.owner && snap.players.find((p) => p.id === z.owner);
    const zc = owner ? owner.look?.color || '#ffe25f' : '#ffe25f';
    this.zoneParts.disc.material.color.set(zc); this.zoneParts.disc.material.opacity = owner ? 0.42 + Math.sin(this.t * 8) * 0.08 : 0.22;
    this.zoneParts.crown.rotation.y = this.t * (owner ? 3 : 1); this.zoneParts.crown.position.y = 3.1 + Math.sin(this.t * 2) * 0.25;
    this.zoneParts.cg.material.color.set(zc);
    this.snap = snap;
  }

  fx(e) {
    const P = this.particles, b = e.id && this.buddies.get(e.id);
    const pos = b ? b.root.position : { x: e.x || 0, z: e.z || 0 };
    switch (e.t) {
      case 'hit': P.burst(pos.x, 1, pos.z, { n: 10, color: '#ffffff', speed: 5, size: 0.9, add: false }); P.burst(pos.x, 1.2, pos.z, { n: 6, color: '#ffe25f', speed: 6 }); b?.bump(1); this.kick(0.25); break;
      case 'block': P.burst(pos.x, 1, pos.z, { n: 14, color: '#8ff4ff', speed: 5 }); break;
      case 'pick': P.burst(e.x, 0.8, e.z, { n: e.k === 'gem' ? 16 : 9, color: e.k === 'gem' ? '#5ff4ff' : '#ffe25f', speed: 3, up: 4 }); b?.bump(0.5); break;
      case 'dash': P.burst(pos.x, 0.2, pos.z, { n: 8, color: '#ffffff', speed: 2, up: 1, size: 0.8, add: false, grav: 0 }); break;
      case 'fall': P.burst(pos.x, 0, pos.z, { n: 14, color: '#bfe7ff', speed: 4, up: 2, size: 1, add: false }); break;
      case 'respawn': P.burst(e.x, 1, e.z, { n: 18, color: '#ff9fe0', speed: 4, up: 5 }); break;
      case 'qres': if (e.ok) { P.burst(pos.x, 1.5, pos.z, { n: 26, color: '#ffe25f', speed: 6, up: 7, size: 0.8 }); b?.bump(1); } break;
      case 'skill': P.burst(pos.x, 1, pos.z, { n: e.s === 'wave' ? 40 : 18, color: e.s === 'wave' ? '#ff9fe0' : '#5ff4ff', speed: e.s === 'wave' ? 12 : 4, up: 1.5, grav: 0 }); if (e.s === 'wave') this.kick(0.5); break;
      case 'mission': case 'ringout': P.burst(pos.x, 2, pos.z, { n: 20, color: '#b89bff', speed: 5, up: 6 }); break;
      case 'bounce': { const m = this.mushrooms.find((mm) => Math.abs(mm.position.x - e.x) < 0.1 && Math.abs(mm.position.z - e.z) < 0.1); if (m) m.userData.sq = 1; P.burst(e.x, 1.2, e.z, { n: 8, color: '#ffffff', speed: 3 }); break; }
      case 'zonemove': P.burst(e.x, 0.5, e.z, { n: 30, color: '#ffe25f', speed: 6, up: 4 }); break;
      case 'confetti': for (let i = 0; i < 5; i++) P.burst((Math.random() - 0.5) * 6, 5, (Math.random() - 0.5) * 3, { n: 14, color: COLORS[i], speed: 4, up: 4, size: 0.5, add: false, grav: 4, life: 1.6 }); break;
    }
  }
  kick(a) { this.shake = Math.max(this.shake, a); }

  // world -> CSS pixels
  project(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight, behind: v.z > 1 };
  }
  headPos(id) { const b = this.buddies.get(id); return b ? this.project(b.root.position.x, b.root.position.y + 2.7, b.root.position.z) : null; }

  render(dt) {
    this.t += dt;
    const portrait = this.camera.aspect < 0.9;
    const cam = this.camera;
    let want, look;
    if (this.mode === 'play' && this.focus.length) {
      const pts = this.focus.map((id) => this.buddies.get(id)?.root.position).filter(Boolean);
      const c = pts.reduce((a, p) => a.add(new THREE.Vector3(p.x, 0, p.z)), new THREE.Vector3()).divideScalar(Math.max(1, pts.length));
      let spread = 0; for (const p of pts) spread = Math.max(spread, Math.hypot(p.x - c.x, p.z - c.z));
      const dist = (portrait ? 1.5 : 1) * (21 + spread * 0.8);
      c.x *= 0.85; c.z *= 0.85; // lean toward the middle so the edge stays readable
      look = c; want = new THREE.Vector3(c.x, dist * 1.05, c.z + dist * 0.78);
    } else if (this.mode === 'showroom') {
      // portrait: aim below the buddy so it sits in the top part, above the settings card
      // diagonal view keeps the mushroom pad and rock out of the shot
      look = new THREE.Vector3(0, portrait ? -1.3 : 0.9, 0); want = portrait ? new THREE.Vector3(6, 3, 11) : new THREE.Vector3(3.6, 2.6, 6.6);
    } else if (this.mode === 'podium') {
      look = new THREE.Vector3(0, portrait ? -2.5 : -1.0, 0); want = new THREE.Vector3(Math.sin(this.t * 0.3) * 2, 5.5, portrait ? 19 : 13);
    } else {
      const a = this.t * 0.05;
      look = new THREE.Vector3(0, -2, 0); want = new THREE.Vector3(Math.sin(a) * 42, 26, Math.cos(a) * 42);
    }
    const k = 1 - Math.exp(-dt * (this.mode === 'play' ? 5 : 2.2));
    this.camPos.lerp(want, k); this.camLook.lerp(look, k);
    cam.position.copy(this.camPos);
    if (this.shake > 0) { cam.position.x += (Math.random() - 0.5) * this.shake; cam.position.y += (Math.random() - 0.5) * this.shake; this.shake = Math.max(0, this.shake - dt * 2); }
    cam.lookAt(this.camLook);
    // ambient motion
    this.waterTex.offset.y -= dt * 1.2;
    this.clouds.forEach((c, i) => { c.position.x += Math.sin(i) * dt * 0.6; if (Math.abs(c.position.x) > 140) c.position.x *= -0.95; });
    this.far?.forEach((g) => (g.position.y += Math.sin(this.t * 0.6 + g.userData.ph) * dt * 0.4));
    this.honey.forEach((h) => h.userData.bubbles.forEach((b) => { const s = (this.t * 0.8 + b.userData.ph) % 1; b.scale.setScalar(0.3 + s); b.position.y = 0.05 + s * 0.12; }));
    this.mushrooms.forEach((m) => { const u = m.userData; u.sq = Math.max(0, (u.sq || 0) - dt * 3); u.cap.scale.set(1 + u.sq * 0.25, 0.7 - u.sq * 0.25 + Math.sin(this.t * 3) * 0.02, 1 + u.sq * 0.25); });
    this.particles.update(dt);
    this.renderer.render(this.scene, cam);
  }

  // Showroom: draw one buddy in the middle of the zone pad.
  showroom(look, id = 'showroom') {
    this.clearBuddies();
    const b = this.buddy({ id, look, x: 0, z: 0 });
    b.root.position.set(0, 0, 0); b.root.rotation.y = 0;
    this.zone.position.set(0, 0, 0);
    this.setMode('showroom');
    return b;
  }
  spinShowroom(dt) {
    const b = this.buddies.get('showroom');
    if (b) { b.root.rotation.y = 0.5 + Math.sin(this.t * 0.8) * 0.6; b.update(dt, { vx: 0, vz: 0, st: 'play', eff: {} }, this.t); }
  }
  placePodium(rank) {
    this.clearBuddies(rank.slice(0, 3).map((p) => p.id));
    this.podium.position.set(0, 0, 0);
    this.podiumOrder = rank.slice(0, 3).map((p) => p.id);
    rank.slice(0, 3).forEach((p, i) => {
      const b = this.buddies.get(p.id) || this.buddy(p);
      b.root.position.set(this.podiumX[i], this.podiumH[i], 0); b.root.rotation.y = 0;
      b.marker.visible = false;
    });
    this.zone.position.set(0, -50, 0);
    this.setMode('podium');
  }
  animatePodium(dt) {
    (this.podiumOrder || []).forEach((id, i) => {
      const b = this.buddies.get(id); if (!b) return;
      b.root.position.set(this.podiumX[i], this.podiumH[i] + Math.abs(Math.sin(this.t * 4 + i)) * 0.3, 0); b.root.rotation.y = 0;
      b.update(dt, { vx: 0, vz: 0, st: 'play', eff: {} }, this.t);
    });
  }
}
