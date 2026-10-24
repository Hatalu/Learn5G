// Lesson card illustrations: bank visual spec { type, ... } -> SVG/HTML string. No emoji, no images.
import { richHTML } from './rich.js';

const C = { ink: '#2b1b4a', pink: '#ff5fa8', yellow: '#ffc93c', cyan: '#3fd0ff', violet: '#7b5cff', green: '#36c98a', orange: '#ff8a3d', soft: '#efe8ff' };
const PAL = [C.pink, C.yellow, C.cyan, C.green, C.violet, C.orange];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (w, h, body) => `<svg class="vis-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="Mitr, sans-serif">${body}</svg>`;
const T = (x, y, s, size = 14, fill = C.ink, anchor = 'middle', weight = 600) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" dominant-baseline="middle">${esc(s)}</text>`;
const STROKE = `stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"`;

function shape(kind, x, y, s, col) {
  const h = s / 2;
  const f = `fill="${col}" ${STROKE}`;
  switch (kind) {
    case 'triangle': return `<path d="M${x} ${y - h}L${x + h} ${y + h}H${x - h}Z" ${f}/>`;
    case 'rtriangle': return `<path d="M${x - h} ${y - h}V${y + h}H${x + h}Z" ${f}/><path d="M${x - h} ${y + h - 10}h10v10" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    case 'square': return `<rect x="${x - h}" y="${y - h}" width="${s}" height="${s}" rx="3" ${f}/>`;
    case 'rect': return `<rect x="${x - h * 1.3}" y="${y - h * 0.7}" width="${s * 1.3}" height="${s * 0.7}" rx="3" ${f}/>`;
    case 'circle': return `<circle cx="${x}" cy="${y}" r="${h}" ${f}/>`;
    case 'ellipse': return `<ellipse cx="${x}" cy="${y}" rx="${h * 1.2}" ry="${h * 0.7}" ${f}/>`;
    case 'parallelogram': return `<path d="M${x - h + 10} ${y - h * 0.7}H${x + h + 6}L${x + h - 10} ${y + h * 0.7}H${x - h - 6}Z" ${f}/>`;
    case 'rhombus': return `<path d="M${x} ${y - h}L${x + h * 0.75} ${y}L${x} ${y + h}L${x - h * 0.75} ${y}Z" ${f}/>`;
    case 'trapezoid': return `<path d="M${x - h * 0.55} ${y - h * 0.65}H${x + h * 0.55}L${x + h} ${y + h * 0.65}H${x - h}Z" ${f}/>`;
    case 'kite': return `<path d="M${x} ${y - h}L${x + h * 0.6} ${y - h * 0.2}L${x} ${y + h}L${x - h * 0.6} ${y - h * 0.2}Z" ${f}/>`;
    case 'sphere': return `<circle cx="${x}" cy="${y}" r="${h}" ${f}/><ellipse cx="${x}" cy="${y}" rx="${h}" ry="${h * 0.3}" fill="none" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="${x - h * 0.35}" cy="${y - h * 0.4}" r="${h * 0.15}" fill="#fff" opacity=".8"/>`;
    case 'cylinder': return `<path d="M${x - h * 0.7} ${y - h * 0.7}V${y + h * 0.7}A${h * 0.7} ${h * 0.25} 0 0 0 ${x + h * 0.7} ${y + h * 0.7}V${y - h * 0.7}" ${f}/><ellipse cx="${x}" cy="${y - h * 0.7}" rx="${h * 0.7}" ry="${h * 0.25}" ${f}/>`;
    case 'cone': return `<path d="M${x} ${y - h}L${x + h * 0.7} ${y + h * 0.7}A${h * 0.7} ${h * 0.25} 0 0 1 ${x - h * 0.7} ${y + h * 0.7}Z" ${f}/>`;
    case 'cube': return `<path d="M${x - h * 0.7} ${y - h * 0.4}h${h * 1.1}v${h * 1.1}h-${h * 1.1}z" ${f}/><path d="M${x - h * 0.7} ${y - h * 0.4}l${h * 0.4} -${h * 0.4}h${h * 1.1}l-${h * 0.4} ${h * 0.4}z" ${f}/><path d="M${x + h * 0.4} ${y - h * 0.4}l${h * 0.4} -${h * 0.4}v${h * 1.1}l-${h * 0.4} ${h * 0.4}z" ${f}/>`;
    case 'prism': return `<path d="M${x - h} ${y + h * 0.6}L${x - h * 0.5} ${y - h * 0.5}L${x} ${y + h * 0.6}Z" ${f}/><path d="M${x - h * 0.5} ${y - h * 0.5}h${h * 1.3}L${x + h} ${y + h * 0.6}H${x}Z" ${f}/>`;
    case 'pyramid': return `<path d="M${x} ${y - h}L${x + h} ${y + h * 0.5}L${x + h * 0.2} ${y + h * 0.8}L${x - h * 0.8} ${y + h * 0.5}Z" ${f}/><path d="M${x} ${y - h}L${x + h * 0.2} ${y + h * 0.8}" stroke="${C.ink}" stroke-width="2"/>`;
    default: return '';
  }
}
const SHAPE_TH = { triangle: 'สามเหลี่ยม', rtriangle: 'สามเหลี่ยมมุมฉาก', square: 'จัตุรัส', rect: 'ผืนผ้า', circle: 'วงกลม', ellipse: 'วงรี', parallelogram: 'ด้านขนาน', rhombus: 'ขนมเปียกปูน', trapezoid: 'คางหมู', kite: 'รูปว่าว', sphere: 'ทรงกลม', cylinder: 'ทรงกระบอก', cone: 'กรวย', cube: 'ทรงสี่เหลี่ยมมุมฉาก', prism: 'ปริซึม', pyramid: 'พีระมิด' };

function fracBar(n, d, x, y, w, h, col) {
  let out = '';
  for (let i = 0; i < d; i++) out += `<rect x="${x + (i * w) / d}" y="${y}" width="${w / d}" height="${h}" fill="${i < n ? col : '#fff'}" ${STROKE}/>`;
  return out;
}

const R = {
  numberline({ from, to, step = 1, mark }) {
    const n = Math.round((to - from) / step), W = 320, x0 = 20, x1 = 300;
    let b = `<path d="M${x0 - 8} 60H${x1 + 8}" stroke="${C.ink}" stroke-width="3"/><path d="M${x1 + 8} 60l-8 -6v12z" fill="${C.ink}"/>`;
    for (let i = 0; i <= n; i++) {
      const v = from + i * step, x = x0 + ((x1 - x0) * i) / n, on = v === mark;
      b += `<path d="M${x} 52V68" stroke="${C.ink}" stroke-width="2.5"/>${T(x, 86, v.toLocaleString(), n > 10 ? 10 : 13, on ? C.pink : C.ink)}`;
      if (on) b += `<circle cx="${x}" cy="60" r="9" fill="${C.pink}" ${STROKE}/><path d="M${x} 22v20" stroke="${C.pink}" stroke-width="3"/><path d="M${x} 44l-6 -8h12z" fill="${C.pink}"/>`;
    }
    return svg(W, 100, b);
  },
  blocks({ hundreds = 0, tens = 0, ones = 0 }) {
    let b = '', x = 10;
    for (let i = 0; i < hundreds; i++) { b += `<rect x="${x}" y="10" width="60" height="60" fill="${C.violet}" ${STROKE}/>`; for (let k = 1; k < 10; k++) b += `<path d="M${x + k * 6} 10v60M${x} ${10 + k * 6}h60" stroke="#fff" stroke-width=".8" opacity=".6"/>`; x += 66; }
    for (let i = 0; i < tens; i++) { b += `<rect x="${x}" y="10" width="10" height="60" fill="${C.cyan}" ${STROKE}/>`; for (let k = 1; k < 10; k++) b += `<path d="M${x} ${10 + k * 6}h10" stroke="#fff" stroke-width="1"/>`; x += 14; }
    x += 6;
    for (let i = 0; i < ones; i++) { b += `<rect x="${x + (i % 3) * 12}" y="${58 - Math.floor(i / 3) * 12}" width="10" height="10" fill="${C.yellow}" ${STROKE}/>`; }
    x += 40;
    const lab = [hundreds && `${hundreds} ร้อย`, tens && `${tens} สิบ`, `${ones} หน่วย`].filter(Boolean).join('  ');
    return svg(Math.max(x, 220), 100, b + T(Math.max(x, 220) / 2, 88, lab, 14));
  },
  compare({ left, op, right }) {
    return svg(300, 90, `<rect x="10" y="15" width="110" height="60" rx="16" fill="${C.soft}" ${STROKE}/>${T(65, 46, left, 26)}<circle cx="150" cy="45" r="24" fill="${C.yellow}" ${STROKE}/>${T(150, 46, op, 28, C.ink, 'middle', 700)}<rect x="180" y="15" width="110" height="60" rx="16" fill="${C.soft}" ${STROKE}/>${T(235, 46, right, 26)}`);
  },
  table({ head, rows }) {
    return `<table class="vis-table"><thead><tr>${head.map((h) => `<th>${richHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${richHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  },
  shapes({ items }) {
    const n = items.length, w = Math.max(320, n * 80), step = w / n;
    return svg(w, 120, items.map((k, i) => shape(k, step * i + step / 2, 48, 54, PAL[i % PAL.length]) + T(step * i + step / 2, 104, SHAPE_TH[k] || k, n > 4 ? 11 : 13)).join(''));
  },
  ruler({ len = 10, mm = false }) {
    const unit = 280 / len;
    let b = `<rect x="15" y="40" width="290" height="44" rx="6" fill="#fff3b0" ${STROKE}/>`;
    for (let i = 0; i <= len; i++) {
      const x = 20 + i * unit;
      b += `<path d="M${x} 40v16" stroke="${C.ink}" stroke-width="2"/>${T(x, 68, i, 11)}`;
      if (mm && i < len) for (let k = 1; k < 10; k++) b += `<path d="M${x + (k * unit) / 10} 40v${k === 5 ? 11 : 7}" stroke="${C.ink}" stroke-width="1"/>`;
    }
    b += `<rect x="20" y="16" width="${unit * Math.min(len, 7) - 6}" height="16" rx="8" fill="${C.pink}" ${STROKE}/>`;
    return svg(320, 96, b + T(300, 24, mm ? 'มม. / ซม.' : 'ซม.', 12, C.ink, 'end'));
  },
  scale({ left, right, heavy = 'left' }) {
    const tilt = heavy === 'left' ? 8 : -8;
    return svg(320, 120, `<path d="M160 30V105M120 108h80" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
      <g transform="rotate(${-tilt} 160 30)"><path d="M60 30H260" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
      <path d="M60 30v20M260 30v20" stroke="${C.ink}" stroke-width="2"/><path d="M30 50h60l-8 14H38z" fill="${C.cyan}" ${STROKE}/><path d="M230 50h60l-8 14h-44z" fill="${C.pink}" ${STROKE}/>
      ${T(60, 80, left, 13)}${T(260, 80, right, 13)}</g><circle cx="160" cy="30" r="7" fill="${C.yellow}" ${STROKE}/>`);
  },
  picto({ unit = 1, rows }) {
    let b = '';
    rows.forEach(([name, n], r) => {
      b += T(48, 22 + r * 30, name, 13, C.ink, 'end');
      for (let i = 0; i < n; i++) b += `<circle cx="${70 + i * 26}" cy="${22 + r * 30}" r="10" fill="${PAL[r % PAL.length]}" ${STROKE}/>`;
    });
    return svg(320, rows.length * 30 + 26, b + T(310, rows.length * 30 + 14, `1 วง แทน ${unit}`, 11, C.violet, 'end'));
  },
  groups({ groups, each }) {
    const w = Math.max(320, groups * 74);
    let b = '';
    for (let g = 0; g < groups; g++) {
      const cx = (w / groups) * (g + 0.5);
      b += `<rect x="${cx - 32}" y="10" width="64" height="64" rx="18" fill="${C.soft}" ${STROKE}/>`;
      for (let i = 0; i < each; i++) b += `<circle cx="${cx - 16 + (i % 3) * 16}" cy="${26 + Math.floor(i / 3) * 16}" r="6" fill="${PAL[g % PAL.length]}" stroke="${C.ink}" stroke-width="1.5"/>`;
    }
    return svg(w, 100, b + T(w / 2, 90, `${groups} กลุ่ม กลุ่มละ ${each} = ${groups * each}`, 14));
  },
  clock({ h, m }) {
    let b = `<circle cx="70" cy="70" r="60" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; b += T(70 + Math.sin(a) * 47, 70 - Math.cos(a) * 47, i, 12); }
    const ha = (((h % 12) + m / 60) / 12) * 360, ma = (m / 60) * 360;
    b += `<path d="M70 70L70 36" stroke="${C.pink}" stroke-width="7" stroke-linecap="round" transform="rotate(${ha} 70 70)"/><path d="M70 70L70 20" stroke="${C.violet}" stroke-width="4.5" stroke-linecap="round" transform="rotate(${ma} 70 70)"/><circle cx="70" cy="70" r="5" fill="${C.ink}"/>`;
    b += `${T(230, 50, `${h}.${String(m).padStart(2, '0')} น.`, 24, C.ink, 'middle', 700)}${T(230, 86, 'เข็มสั้น = ชั่วโมง', 12, C.pink)}${T(230, 106, 'เข็มยาว = นาที', 12, C.violet)}`;
    return svg(320, 140, b);
  },
  dial({ value, max, unit }) {
    const a = -120 + (value / max) * 240;
    let b = `<circle cx="160" cy="70" r="58" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let i = 0; i <= max; i++) { const t = ((-120 + (i / max) * 240) * Math.PI) / 180; b += T(160 + Math.sin(t) * 44, 70 - Math.cos(t) * 44, i, 11); }
    b += `<path d="M160 70V22" stroke="${C.pink}" stroke-width="4" stroke-linecap="round" transform="rotate(${a} 160 70)"/><circle cx="160" cy="70" r="5" fill="${C.ink}"/>${T(160, 104, unit, 13)}`;
    return svg(320, 135, b);
  },
  coins({ items }) {
    let b = '', x = 30;
    for (const v of items) {
      if (v >= 20) { b += `<rect x="${x - 26}" y="22" width="52" height="34" rx="5" fill="${v === 20 ? C.green : v === 50 ? C.cyan : '#ff8080'}" ${STROKE}/>${T(x, 40, v, 15)}`; x += 62; }
      else { b += `<circle cx="${x}" cy="40" r="20" fill="${v === 10 ? '#ffd23f' : '#d9dbe6'}" ${STROKE}/>${T(x, 41, v, 14)}`; x += 48; }
    }
    return svg(Math.max(320, x), 90, b + T(Math.max(320, x) / 2, 78, `รวม ${items.reduce((a, b2) => a + b2, 0)} บาท`, 14));
  },
  place({ digits }) {
    const names = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    const ds = String(digits).split('');
    return `<table class="vis-table place"><thead><tr>${ds.map((_, i) => `<th>${names[ds.length - 1 - i]}</th>`).join('')}</tr></thead><tbody><tr>${ds.map((d, i) => `<td style="color:${PAL[i % PAL.length]}">${d}</td>`).join('')}</tr></tbody></table>`;
  },
  longdiv({ dividend, divisor }) {
    const q = Math.floor(dividend / divisor);
    return svg(320, 100, `${T(150, 22, q, 22, C.pink, 'start', 700)}<path d="M130 36H230M130 36c-8 10 -8 30 0 44" fill="none" stroke="${C.ink}" stroke-width="3"/>${T(118, 58, divisor, 22, C.ink, 'end', 700)}${T(150, 58, dividend, 22, C.ink, 'start', 700)}${T(160, 92, `${divisor} x ${q} = ${divisor * q}`, 13, C.violet)}`);
  },
  frac({ n, d }) {
    const bars = Math.max(1, Math.ceil(n / d));
    let b = '';
    for (let k = 0; k < bars; k++) b += fracBar(Math.min(d, n - k * d), d, 20 + k * (280 / bars + 6) / 1, 20, 280 / bars - 6, 40, C.pink);
    return svg(320, 100, b + T(160, 82, `${n}/${d}`.replace(/(\d+)\/(\d+)/, '$1 ส่วน $2'), 14));
  },
  fraccompare({ a, b, eq }) {
    return svg(320, 120, `${fracBar(a[0], a[1], 20, 12, 230, 34, C.pink)}${T(290, 30, `${a[0]}/${a[1]}`, 15)}${fracBar(b[0], b[1], 20, 62, 230, 34, C.cyan)}${T(290, 80, `${b[0]}/${b[1]}`, 15)}${T(160, 110, eq ? 'ยาวเท่ากัน = เท่ากัน' : 'แถบยาวกว่า = มากกว่า', 12, C.violet)}`);
  },
  angle({ deg }) {
    const r = 70, a = (deg * Math.PI) / 180, cx = 100, cy = 100;
    const x2 = cx + Math.cos(a) * r, y2 = cy - Math.sin(a) * r;
    const arc = deg >= 180 ? `M${cx + 28} ${cy}A28 28 0 1 0 ${cx + Math.cos(a) * 28} ${cy - Math.sin(a) * 28}` : `M${cx + 28} ${cy}A28 28 0 0 0 ${cx + Math.cos(a) * 28} ${cy - Math.sin(a) * 28}`;
    const kind = deg < 90 ? 'มุมแหลม' : deg === 90 ? 'มุมฉาก' : deg < 180 ? 'มุมป้าน' : deg === 180 ? 'มุมตรง' : 'มุมกลับ';
    return svg(320, 130, `<path d="${arc}" fill="${C.yellow}" fill-opacity=".6" stroke="${C.orange}" stroke-width="2"/><path d="M${cx} ${cy}H${cx + r}M${cx} ${cy}L${x2} ${y2}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="${C.pink}"/>${T(250, 50, `${deg}°`, 28, C.pink, 'middle', 700)}${T(250, 88, kind, 16)}`);
  },
  rect({ w, h, unit = '', grid }) {
    const s = Math.min(36, 220 / w, 80 / h), W = w * s, H = h * s, x = (320 - W) / 2, y = 12;
    let b = `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${C.soft}" ${STROKE}/>`;
    if (grid) for (let i = 1; i < w; i++) b += `<path d="M${x + i * s} ${y}v${H}" stroke="${C.violet}" stroke-width="1" opacity=".5"/>`;
    if (grid) for (let j = 1; j < h; j++) b += `<path d="M${x} ${y + j * s}h${W}" stroke="${C.violet}" stroke-width="1" opacity=".5"/>`;
    return svg(320, H + 44, b + T(160, y + H + 16, `ยาว ${w} ${unit}`, 13) + T(x - 8, y + H / 2, `กว้าง ${h}`, 12, C.ink, 'end'));
  },
  bars({ items }) {
    const max = Math.max(...items.map((i) => i[1])), bw = 220 / items.length;
    let b = `<path d="M60 10V110H310" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
    items.forEach(([name, v], i) => {
      const hgt = (v / max) * 90, x = 70 + i * bw + 8;
      b += `<rect x="${x}" y="${110 - hgt}" width="${bw - 16}" height="${hgt}" rx="4" fill="${PAL[i % PAL.length]}" ${STROKE}/>${T(x + (bw - 16) / 2, 104 - hgt, v, 12)}${T(x + (bw - 16) / 2, 124, name, 11)}`;
    });
    return svg(320, 134, b);
  },
  grid100({ fill }) {
    let b = '';
    for (let i = 0; i < 100; i++) b += `<rect x="${20 + (i % 10) * 11}" y="${8 + Math.floor(i / 10) * 11}" width="10" height="10" fill="${i < fill ? C.pink : '#fff'}" stroke="${C.ink}" stroke-width=".8"/>`;
    return svg(320, 124, b + T(230, 50, `${fill} จาก 100`, 18, C.ink, 'middle', 700) + T(230, 80, `= ${fill}%`, 22, C.pink, 'middle', 700));
  },
  box({ w, d, h }) {
    const s = 18, x = 90, y = 30, W = w * s, H = h * s, D = d * s * 0.5;
    return svg(320, 140, `<path d="M${x} ${y + D}h${W}v${H}h-${W}z" fill="${C.cyan}" ${STROKE}/><path d="M${x} ${y + D}l${D} -${D}h${W}l-${D} ${D}z" fill="#9fe6ff" ${STROKE}/><path d="M${x + W} ${y + D}l${D} -${D}v${H}l-${D} ${D}z" fill="#2ab0e0" ${STROKE}/>${T(x + W / 2, y + D + H + 14, `ยาว ${w}`, 12)}${T(x - 8, y + D + H / 2, `สูง ${h}`, 12, C.ink, 'end')}${T(x + W + D + 6, y + D / 2 + H, `กว้าง ${d}`, 12, C.ink, 'start')}`);
  },
  lines({ kind }) {
    if (kind === 'perp') return svg(320, 110, `<path d="M60 90H260M160 10V90" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M160 74h16v16" fill="none" stroke="${C.pink}" stroke-width="3"/>${T(230, 40, '90°', 20, C.pink)}`);
    return svg(320, 110, `<path d="M40 35H280M40 75H280" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M160 40v30" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="4 3"/><path d="M220 40v30" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="4 3"/>${T(160, 98, 'ห่างเท่ากันตลอด', 13, C.violet)}`);
  },
  tree({ n, parts }) {
    let b = `<circle cx="160" cy="22" r="18" fill="${C.yellow}" ${STROKE}/>${T(160, 23, n, 15)}`;
    const step = 260 / parts.length;
    parts.forEach((p, i) => { const x = 30 + step * (i + 0.5); b += `<path d="M160 40L${x} 74" stroke="${C.ink}" stroke-width="2"/><circle cx="${x}" cy="88" r="16" fill="${C.cyan}" ${STROKE}/>${T(x, 89, p, 14)}`; });
    return svg(320, 112, b);
  },
  ratio({ a, b }) {
    let s = '';
    for (let i = 0; i < a; i++) s += `<circle cx="${30 + i * 30}" cy="30" r="11" fill="${C.pink}" ${STROKE}/>`;
    for (let i = 0; i < b; i++) s += `<rect x="${19 + i * 30}" y="58" width="22" height="22" rx="5" fill="${C.cyan}" ${STROKE}/>`;
    return svg(320, 100, s + T(260, 50, `${a} : ${b}`, 28, C.ink, 'middle', 700));
  },
  circle({ r }) {
    return svg(320, 140, `<circle cx="90" cy="70" r="58" fill="${C.soft}" ${STROKE}/><circle cx="90" cy="70" r="4" fill="${C.ink}"/><path d="M90 70H148" stroke="${C.pink}" stroke-width="3"/><path d="M32 70H90" stroke="${C.cyan}" stroke-width="3" stroke-dasharray="5 3"/>${T(119, 60, `r = ${r}`, 12, C.pink)}${T(240, 46, 'รัศมี (r)', 14, C.pink)}${T(240, 72, 'เส้นผ่านศูนย์กลาง = 2r', 13, C.cyan)}${T(240, 98, 'จุดศูนย์กลาง', 13)}`);
  },
  pie({ items }) {
    let a0 = -Math.PI / 2, b = '';
    const tot = items.reduce((s, i) => s + i[1], 0);
    items.forEach(([name, v], i) => {
      const a1 = a0 + (v / tot) * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      b += `<path d="M90 65L${90 + Math.cos(a0) * 55} ${65 + Math.sin(a0) * 55}A55 55 0 ${large} 1 ${90 + Math.cos(a1) * 55} ${65 + Math.sin(a1) * 55}Z" fill="${PAL[i % PAL.length]}" ${STROKE}/>`;
      b += `<rect x="190" y="${28 + i * 26}" width="16" height="16" rx="4" fill="${PAL[i % PAL.length]}" ${STROKE}/>${T(214, 37 + i * 26, `${name} ${v}%`, 14, C.ink, 'start')}`;
      a0 = a1;
    });
    return svg(320, 130, b);
  },
  pairs({ rows }) {
    return `<div class="vis-pairs">${rows.map(([a, b], i) => `<div class="vp" style="--c:${PAL[i % PAL.length]}"><b>${richHTML(a)}</b><span>${richHTML(b)}</span></div>`).join('')}</div>`;
  },
  flow({ steps, cycle }) {
    return `<div class="vis-flow ${cycle ? 'cycle' : ''}">${steps.map((s, i) => `<span class="vf" style="--c:${PAL[i % PAL.length]}">${richHTML(s)}</span>`).join('<i class="va"></i>')}${cycle ? '<i class="va back"></i>' : ''}</div>`;
  },
  plant() {
    return svg(320, 150, `<path d="M0 110H320" stroke="#8b5a3c" stroke-width="3"/><rect x="0" y="110" width="320" height="40" fill="#c99a6e" opacity=".5"/>
      <path d="M150 110v-70" stroke="#3f9a4a" stroke-width="7" stroke-linecap="round"/><path d="M150 110l-16 26M150 110l14 28M150 112v32" stroke="#8b5a3c" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="128" cy="70" rx="20" ry="9" fill="${C.green}" ${STROKE} transform="rotate(-25 128 70)"/><ellipse cx="172" cy="80" rx="20" ry="9" fill="${C.green}" ${STROKE} transform="rotate(25 172 80)"/>
      <circle cx="150" cy="30" r="12" fill="${C.pink}" ${STROKE}/><circle cx="150" cy="30" r="5" fill="${C.yellow}"/><circle cx="185" cy="55" r="8" fill="${C.orange}" ${STROKE}/>
      ${T(60, 30, 'ดอก', 13)}<path d="M76 30H134" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>${T(60, 70, 'ใบ', 13)}<path d="M72 70H108" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>
      ${T(260, 55, 'ผล', 13)}<path d="M193 55H246" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>${T(260, 95, 'ลำต้น', 13)}<path d="M154 95H238" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>${T(260, 132, 'ราก', 13)}<path d="M166 132H244" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>`);
  },
  magnets() {
    const mag = (x, l, r) => `<rect x="${x}" y="20" width="50" height="30" fill="#ff6f7f" ${STROKE}/><rect x="${x + 50}" y="20" width="50" height="30" fill="#6fa8ff" ${STROKE}/>${T(x + 25, 36, l, 15, '#fff')}${T(x + 75, 36, r, 15, '#fff')}`;
    return svg(320, 120, `${mag(10, 'N', 'S')}${mag(130, 'N', 'S')}<path d="M118 35h8" stroke="${C.green}" stroke-width="3"/>${T(120, 64, 'ต่างขั้น ดูดกัน', 12, C.green)}${T(160, 90, 'N กับ N หรือ S กับ S = ผลักกัน', 13, C.pink)}`);
  },
  particles({ kind }) {
    let b = `<rect x="100" y="10" width="120" height="100" rx="8" fill="#fff" ${STROKE}/>`;
    const pts = kind === 'solid' ? Array.from({ length: 20 }, (_, i) => [118 + (i % 5) * 21, 48 + Math.floor(i / 5) * 18]) : kind === 'liquid' ? Array.from({ length: 16 }, (_, i) => [114 + (i % 6) * 18 + (Math.floor(i / 6) % 2) * 8, 66 + Math.floor(i / 6) * 17]) : [[120, 30], [180, 26], [150, 60], [205, 70], [118, 90], [170, 96]];
    pts.forEach(([x, y]) => (b += `<circle cx="${x}" cy="${y}" r="8" fill="${C.cyan}" stroke="${C.ink}" stroke-width="1.5"/>`));
    return svg(320, 120, b + T(270, 60, { solid: 'ชิดกันมาก', liquid: 'ชิด เลื่อนได้', gas: 'ห่างกันมาก' }[kind], 13));
  },
  moon() {
    const phases = [[0, 'ดับ'], [0.25, 'ขึ้น 4'], [0.5, 'ขึ้น 8'], [1, 'ขึ้น 15'], [0.5, 'แรม 8']];
    return svg(320, 100, phases.map(([f, n], i) => {
      const x = 34 + i * 63;
      const lit = f === 0 ? '' : f === 1 ? `<circle cx="${x}" cy="40" r="22" fill="#fff6c2"/>` : `<path d="M${x} 18A22 22 0 0 ${i > 3 ? 0 : 1} ${x} 62A${22 * Math.abs(1 - 2 * f) || 0.1} 22 0 0 ${f > 0.5 ? (i > 3 ? 0 : 1) : i > 3 ? 1 : 0} ${x} 18Z" fill="#fff6c2"/>`;
      return `<circle cx="${x}" cy="40" r="22" fill="#3a3560" ${STROKE}/>${lit}${T(x, 84, n, 12)}`;
    }).join(''));
  },
  planets() {
    const p = [['พุธ', 5, '#b8a99a'], ['ศุกร์', 7, '#f2c27a'], ['โลก', 7, '#4fa8ff'], ['อังคาร', 6, '#ff7a5a'], ['พฤหัส', 15, '#e8b07a'], ['เสาร์', 12, '#f2d38a'], ['ยูเรนัส', 9, '#8fe8f0'], ['เนปจูน', 9, '#5a7aff']];
    let b = `<circle cx="-30" cy="55" r="55" fill="#ffd23f" ${STROKE}/>`, x = 42;
    p.forEach(([n, r, c], i) => { b += `<circle cx="${x}" cy="55" r="${r}" fill="${c}" ${STROKE}/>${i === 5 ? `<ellipse cx="${x}" cy="55" rx="${r + 7}" ry="4" fill="none" stroke="${C.ink}" stroke-width="2"/>` : ''}${T(x, i % 2 ? 92 : 22, n, 10)}`; x += r + 22; });
    return svg(320, 110, b);
  },
  forces({ a, b }) {
    return svg(320, 100, `<rect x="135" y="30" width="50" height="40" rx="6" fill="${C.yellow}" ${STROKE}/><path d="M185 50H${185 + a * 10}" stroke="${C.pink}" stroke-width="6"/><path d="M${193 + a * 10} 50l-12 -9v18z" fill="${C.pink}"/>${T(185 + a * 5, 22, `${a} N`, 13, C.pink)}<path d="M135 50H${135 - b * 10}" stroke="${C.cyan}" stroke-width="6"/><path d="M${127 - b * 10} 50l12 -9v18z" fill="${C.cyan}"/>${T(135 - b * 5, 22, `${b} N`, 13, C.cyan)}${T(160, 88, `แรงลัพธ์ = ${a} - ${b} = ${a - b} N ไปทางขวา`, 13)}`);
  },
  circuit({ kind }) {
    const bulb = (x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="#fff6a8" ${STROKE}/><path d="M${x - 5} ${y}l5 5 5 -5" stroke="${C.orange}" stroke-width="2" fill="none"/>`;
    const batt = `<rect x="30" y="50" width="14" height="30" fill="${C.ink}"/><rect x="48" y="44" width="6" height="42" fill="${C.ink}"/>`;
    if (kind === 'parallel') return svg(320, 130, `<path d="M51 65H90V20H270V110H90V65M180 20V110" fill="none" stroke="${C.ink}" stroke-width="3"/>${batt}${bulb(140, 20)}${bulb(225, 20)}${bulb(180, 65)}${T(250, 65, 'ขนาน', 14, C.violet)}`);
    return svg(320, 130, `<path d="M51 65H90V20H270V110H90V65" fill="none" stroke="${C.ink}" stroke-width="3"/>${batt}${bulb(150, 20)}${bulb(220, 20)}${T(200, 70, 'อนุกรม', 14, C.violet)}`);
  },
  eclipse({ kind }) {
    const sun = `<circle cx="40" cy="55" r="30" fill="#ffd23f" ${STROKE}/>`;
    const earth = (x) => `<circle cx="${x}" cy="55" r="18" fill="#4fa8ff" ${STROKE}/>`;
    const moon = (x) => `<circle cx="${x}" cy="55" r="9" fill="#d9d6e6" ${STROKE}/>`;
    return kind === 'solar'
      ? svg(320, 110, `${sun}${moon(170)}${earth(270)}<path d="M178 50L254 46M178 60L254 64" stroke="#3a3560" stroke-width="2" opacity=".6"/>${T(40, 100, 'ดวงอาทิตย์', 11)}${T(170, 100, 'ดวงจันทร์', 11)}${T(270, 100, 'โลก', 11)}`)
      : svg(320, 110, `${sun}${earth(170)}${moon(270)}<path d="M188 45L262 50M188 65L262 60" stroke="#3a3560" stroke-width="2" opacity=".6"/>${T(40, 100, 'ดวงอาทิตย์', 11)}${T(170, 100, 'โลก', 11)}${T(270, 100, 'ดวงจันทร์', 11)}`);
  },
  letters({ text }) {
    return `<div class="vis-letters">${text.split(/\s*/).filter(Boolean).map((ch, i) => `<span style="--c:${PAL[i % PAL.length]}">${esc(ch)}</span>`).join('')}</div>`;
  },
  prep({ word }) {
    const ballPos = { on: [160, 26], under: [160, 104], in: [160, 66], behind: [196, 50], next: [230, 76] }[word] || [160, 26];
    return svg(320, 120, `${word === 'behind' ? `<circle cx="${ballPos[0]}" cy="${ballPos[1]}" r="13" fill="${C.pink}" ${STROKE}/>` : ''}<path d="M120 40h80v56h-80z" fill="#f2c27a" ${STROKE}/><path d="M120 40l14 -10h80l-14 10z" fill="#ffd9a0" ${STROKE}/>${word !== 'behind' ? `<circle cx="${ballPos[0]}" cy="${ballPos[1]}" r="13" fill="${C.pink}" ${STROKE}/>` : ''}${T(270, 60, word, 22, C.violet, 'middle', 700)}`);
  },
  arrows() {
    const a = (x, rot, label) => `<g transform="translate(${x} 45) rotate(${rot})"><path d="M0 22V-10M-14 2L0 -16 14 2" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>${T(x, 92, label, 12)}`;
    return svg(320, 104, a(60, -90, 'turn left') + a(160, 0, 'go straight') + a(260, 90, 'turn right'));
  },
};

export function renderVisual(v) {
  if (!v || !R[v.type]) return '';
  try { return `<div class="vis">${R[v.type](v)}</div>`; } catch (e) { console.warn('visual', v, e); return ''; }
}
