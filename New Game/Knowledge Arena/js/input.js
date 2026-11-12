// Keyboard (1 or 2 players on one keyboard), mouse, and touch (floating joystick + buttons).
// Screen up = world -z (the camera looks from +z), screen right = world +x.
const KEYMAPS = {
  solo: {
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    atk: ['KeyJ', 'Space'], dash: ['KeyK', 'ShiftLeft', 'ShiftRight'], skill: ['KeyL', 'KeyE'], ans: [['Digit1', 'Numpad1'], ['Digit2', 'Numpad2'], ['Digit3', 'Numpad3']],
  },
  p1: { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], atk: ['KeyF'], dash: ['KeyG'], skill: ['KeyR'], ans: [['Digit1'], ['Digit2'], ['Digit3']] },
  p2: {
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], atk: ['Enter', 'NumpadEnter'], dash: ['ShiftRight', 'Numpad0'], skill: ['Slash', 'NumpadDecimal'],
    ans: [['Digit8', 'Numpad1'], ['Digit9', 'Numpad2'], ['Digit0', 'Numpad3']],
  },
};
export const KEY_HELP = {
  solo: 'เดิน WASD/ลูกศร | ชน J/Space | พุ่ง K/Shift | สกิล L/E | ตอบ 1 2 3',
  p1: 'P1: เดิน WASD | ชน F | พุ่ง G | สกิล R | ตอบ 1 2 3',
  p2: 'P2: เดินลูกศร | ชน Enter | พุ่ง Shift ขวา | สกิล / | ตอบ 8 9 0',
};

export function createInput({ touchRoot, onAnswer }) {
  const down = new Set();
  const slots = []; // [{ map, edges:{atk,dash,skill} }]
  const touch = { active: false, id: null, ox: 0, oy: 0, mx: 0, mz: 0, edges: { atk: false, dash: false, skill: false } };
  let mouseAtk = false;

  const isTyping = () => /INPUT|TEXTAREA/.test(document.activeElement?.tagName || '');
  addEventListener('keydown', (e) => {
    if (isTyping()) return;
    if (!down.has(e.code)) {
      slots.forEach((s, i) => {
        for (const k of ['atk', 'dash', 'skill']) if (s.map[k].includes(e.code)) s.edges[k] = true;
        s.map.ans.forEach((codes, a) => { if (codes.includes(e.code)) onAnswer?.(i, a); });
      });
    }
    down.add(e.code);
    if (/^Arrow|Space/.test(e.code) && slots.length) e.preventDefault();
  });
  addEventListener('keyup', (e) => down.delete(e.code));
  addEventListener('blur', () => down.clear());

  // ---- touch joystick ----
  const stick = touchRoot.querySelector('.stick'), knob = touchRoot.querySelector('.knob'), zone = touchRoot.querySelector('.stick-zone');
  const R = 56;
  zone.addEventListener('pointerdown', (e) => {
    if (touch.active) return;
    touch.active = true; touch.id = e.pointerId; touch.ox = e.clientX; touch.oy = e.clientY;
    stick.style.left = `${e.clientX}px`; stick.style.top = `${e.clientY}px`; stick.classList.add('on');
    try { zone.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    move(e); e.preventDefault();
  });
  const move = (e) => {
    if (!touch.active || e.pointerId !== touch.id) return;
    let dx = e.clientX - touch.ox, dy = e.clientY - touch.oy;
    const L = Math.hypot(dx, dy);
    if (L > R) { touch.ox += (dx / L) * (L - R); touch.oy += (dy / L) * (L - R); dx = (dx / L) * R; dy = (dy / L) * R; stick.style.left = `${touch.ox}px`; stick.style.top = `${touch.oy}px`; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const k = Math.min(1, Math.hypot(dx, dy) / R);
    touch.mx = k > 0.15 ? dx / R : 0; touch.mz = k > 0.15 ? dy / R : 0;
  };
  const end = (e) => {
    if (e.pointerId !== touch.id) return;
    touch.active = false; touch.mx = touch.mz = 0; knob.style.transform = ''; stick.classList.remove('on');
  };
  zone.addEventListener('pointermove', move); zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  touchRoot.querySelectorAll('[data-btn]').forEach((b) => b.addEventListener('pointerdown', (e) => {
    touch.edges[b.dataset.btn] = true; b.classList.remove('press'); void b.offsetWidth; b.classList.add('press'); e.preventDefault();
  }));

  return {
    setPlayers(kind) { // 'solo' | 'local2' | 'none'
      slots.length = 0;
      if (kind === 'solo') slots.push({ map: KEYMAPS.solo, edges: {} });
      if (kind === 'local2') slots.push({ map: KEYMAPS.p1, edges: {} }, { map: KEYMAPS.p2, edges: {} });
    },
    mouseAttack() { mouseAtk = true; },
    read(i) {
      const s = slots[i];
      if (!s) return { mx: 0, mz: 0, atk: false, dash: false, skill: false };
      const has = (k) => s.map[k].some((c) => down.has(c));
      let mx = (has('right') ? 1 : 0) - (has('left') ? 1 : 0), mz = (has('down') ? 1 : 0) - (has('up') ? 1 : 0);
      const L = Math.hypot(mx, mz); if (L > 1) { mx /= L; mz /= L; }
      const out = { mx, mz, atk: !!s.edges.atk, dash: !!s.edges.dash, skill: !!s.edges.skill };
      if (i === 0) {
        if (touch.active || touch.mx || touch.mz) { out.mx = touch.mx; out.mz = touch.mz; }
        for (const k of ['atk', 'dash', 'skill']) if (touch.edges[k]) out[k] = true;
        if (mouseAtk) out.atk = true;
        touch.edges = { atk: false, dash: false, skill: false }; mouseAtk = false;
      }
      s.edges = {};
      return out;
    },
  };
}
