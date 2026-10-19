/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — Procedural SVG art (ไม่มีไฟล์ภาพ ไม่มีอิโมจิ)
   ตัวละคร : มูนมูน (กระต่ายนักบินอวกาศผู้นำทาง = slot "mat") / น้องดาว (ผู้เล่น = "kid") / ฟิ้วฟิ้ว (ดาวหางจอมซน = slot "tub")
   ดวงจันทร์ทุกรูปร่างวาดด้วยเส้นทางคณิตศาสตร์ (moon) · ดาวเคราะห์ทั้ง 8 · ไอคอนเส้น · ฉากของแต่ละด่าน
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK = window.SK || {};
  const INK = '#22305a';
  let _uid = 0;
  const uid = p => (p || 'u') + (++_uid);
  const f1 = n => (+n).toFixed(1);
  const mod = (n, m) => ((n % m) + m) % m;
  /* ตำแหน่ง/ขนาดให้ svg ที่ฝังในอีก svg */
  const at = (str, x, y, w, h) => str.replace(/<svg /, '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + (h || w) + '" ');

  /* ── ไอคอนเส้น 24x24 ── */
  function cog(n, ro, ri, cx, cy) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2, r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a0) * r).toFixed(2) + ' ' + (cy + Math.sin(a0) * r).toFixed(2) + 'L' + (cx + Math.cos(a1) * r).toFixed(2) + ' ' + (cy + Math.sin(a1) * r).toFixed(2);
    }
    return d + 'Z';
  }
  const ICONS = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    gear: '<path d="' + cog(8, 9.6, 7.2, 12, 12) + '"/><circle cx="12" cy="12" r="3"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M8 7h7M8 11h5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h14l-3 4.5 3 4.5H5"/>',
    back: '<path d="M9 6h11v12H9l-6-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9 17h6v4H9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    magnify: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v6c0 4-2.5 6-6 6h-1.5c-2.5 0-4-1-5.5-3L4 14.5c-.7-1.2.9-2.7 2-1.6L8 15"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    rocket: '<path d="M12 2c4 2 6 6 5 11l-2 3H9l-2-3c-1-5 1-9 5-11z"/><circle cx="12" cy="9" r="2"/><path d="M7 14l-3 3 1 3 4-2M17 14l3 3-1 3-4-2M10 19l2 3 2-3"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    orbit: '<ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-25 12 12)"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/><circle cx="20" cy="8" r="1.4" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'
  };
  const icon = (name, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  const iconNo = (name, cls) => '<svg class="ic ic-no ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '<path d="M4 4L20 20" stroke="#ff4d5e" stroke-width="3"/></svg>';

  function star(on, cls) {
    const g = uid('sg');
    return '<svg class="star ' + (on ? 'on ' : '') + (cls || '') + '" viewBox="-12 -12 24 24" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#ffb21f"/></linearGradient></defs>' +
      '<path d="M0 -10.5 L3 -3.6 L10.4 -3.2 L4.7 1.6 L6.6 9 L0 5 L-6.6 9 L-4.7 1.6 L-10.4 -3.2 L-3 -3.6 Z" fill="' + (on ? 'url(#' + g + ')' : '#dfe6f3') + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      (on ? '<path d="M-2.5 -4 L0 -8" stroke="#fffbe0" stroke-width="2" stroke-linecap="round"/>' : '') + '</svg>';
  }
  function stars(n, of, cls) {
    let h = '<span class="stars">';
    for (let i = 0; i < (of || 3); i++) h += star(i < n, cls);
    return h + '</span>';
  }
  function flag(col) {
    return '<svg class="flagsvg" viewBox="0 0 32 40" aria-hidden="true"><path d="M5 38V4" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<g class="flag-wave"><path d="M7 5 H29 L24 12.5 L29 20 H7 Z" fill="' + (col || '#ff5a6e') + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M10 8.5 H24" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></g><circle cx="5" cy="4" r="3" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.4"/></svg>';
  }
  /* ลูกโป่งลอย = ดาวลอยเล็ก ๆ ใช้ชื่อเดิมเพื่อให้ CSS ใช้ร่วมกัน */
  function balloon(c) {
    return '<svg class="balloon" viewBox="-14 -14 28 28" aria-hidden="true"><path d="M0 -12 L3.4 -4 L12 -3.6 L5.4 1.8 L7.6 10.4 L0 5.8 L-7.6 10.4 L-5.4 1.8 L-12 -3.6 L-3.4 -4 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }
  function bunting(w, h) {
    let s = '', n = Math.max(6, Math.round(w / 34));
    const cols = ['#8b5cf6', '#ffd23f', '#3ccf9a', '#4aa8ff', '#ff8fc1', '#ff8a3c'];
    for (let i = 0; i < n; i++) {
      const x0 = i * (w / n), x1 = (i + 1) * (w / n);
      s += '<path d="M' + f1(x0 + 2) + ' 2 L' + f1((x0 + x1) / 2) + ' ' + (h - 2) + ' L' + f1(x1 - 2) + ' 2 Z" fill="' + cols[i % cols.length] + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    return '<svg class="rband" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="M0 2 H' + w + '" stroke="' + INK + '" stroke-width="3"/>' + s + '</svg>';
  }

  /* ══════════ ดวงจันทร์ : รูปร่างปรากฏทุกมุม (eps 0–360) ══════════
     eps = 0 ดับ · 90 ครึ่งดวงข้างขึ้น (สว่างด้านขวา) · 180 เต็มดวง · 270 ครึ่งดวงข้างแรม (สว่างด้านซ้าย) */
  const CRATERS = [[-14, -12, 7.5], [11, -20, 5.5], [20, 7, 8.5], [-7, 15, 6.5], [-25, 11, 4.5], [5, 29, 5], [27, -9, 4], [-27, -26, 4.2], [12, 0, 3.2]];
  function moon(eps, o) {
    o = o || {};
    eps = mod(eps, 360);
    const id = uid('mn'), R = 44, e = eps <= 180 ? eps : 360 - eps, flip = eps > 180, c = Math.cos(e * Math.PI / 180);
    let litPath = '';
    if (e >= 179) litPath = 'M0 -44 A44 44 0 1 1 0 44 A44 44 0 1 1 0 -44Z';
    else if (e > 1) litPath = 'M0 -44 A44 44 0 0 1 0 44 A' + (Math.abs(c) * R).toFixed(2) + ' 44 0 0 ' + (c > 0 ? 0 : 1) + ' 0 -44Z';
    const dark = CRATERS.map(k => '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="' + k[2] + '" fill="#37437a"/>').join('');
    const warm = CRATERS.map(k => '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="' + k[2] + '" fill="#f1d684" opacity=".85"/>').join('');
    return '<svg class="moonpl' + (o.cls ? ' ' + o.cls : '') + '" viewBox="-52 -52 104 104" aria-hidden="true"><defs>' +
      '<radialGradient id="g' + id + '" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#fffdf0"/><stop offset=".7" stop-color="#ffeaa0"/><stop offset="1" stop-color="#ffd86a"/></radialGradient>' +
      (litPath ? '<clipPath id="c' + id + '"><path d="' + litPath + '"/></clipPath>' : '') + '</defs>' +
      (o.glow && e > 120 ? '<circle r="50" fill="#fff4b0" opacity=".28"/>' : '') +
      '<g' + (flip ? ' transform="scale(-1 1)"' : '') + '><circle r="44" fill="#2a3566"/>' + dark +
      (litPath ? '<g clip-path="url(#c' + id + ')"><circle r="44" fill="url(#g' + id + ')"/>' + warm + '</g>' : '') + '</g>' +
      '<circle r="44" fill="none" stroke="' + INK + '" stroke-width="4.4"/></svg>';
  }
  /* ดวงจันทร์เล็กบนวงโคจร (มุมมองจากเหนือ) : ซีกที่หันเข้าหาดวงอาทิตย์สว่างเสมอ, sunDeg = ทิศไปหาดวงอาทิตย์ (องศาบนจอ) */
  function moonOrbit(r, sunDeg) {
    const id = uid('mo');
    return '<g transform="rotate(' + f1(180 - sunDeg) + ')"><circle r="' + r + '" fill="#2a3566"/>' +
      '<clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><path clip-path="url(#' + id + ')" d="M0 ' + (-r) + ' A' + r + ' ' + r + ' 0 0 0 0 ' + r + ' Z" fill="#ffeaa0"/>' +
      '<circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="3"/></g>';
  }

  /* ══════════ ดาวเคราะห์ / ดวงอาทิตย์ (กลุ่ม SVG กลางที่ 0,0 รัศมี r) ══════════ */
  function planet(pid, r) {
    const g = uid('pl');
    const P = SK.PLID[pid];
    const sw = Math.max(2, r * 0.18);
    let body = '<defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="' + P.c1 + '"/><stop offset="1" stop-color="' + P.c2 + '"/></radialGradient>' +
      '<clipPath id="k' + g + '"><circle r="' + r + '"/></clipPath></defs>';
    let ringBack = '', ringFront = '';
    if (pid === 'saturn') {
      const rx = r * 1.95, ry = r * 0.6;
      ringBack = '<g transform="rotate(-16)"><path d="M' + (-rx) + ' 0 A' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' 0" fill="none" stroke="#e6c46c" stroke-width="' + (r * 0.34) + '"/></g>';
      ringFront = '<g transform="rotate(-16)"><path d="M' + (-rx) + ' 0 A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' 0" fill="none" stroke="#f5dc92" stroke-width="' + (r * 0.34) + '"/><path d="M' + (-rx) + ' 0 A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' 0" fill="none" stroke="' + INK + '" stroke-width="' + (r * 0.34 + sw * 1.1) + '" opacity=".0"/></g>';
    }
    let deco = '';
    if (pid === 'earth') deco = '<g clip-path="url(#k' + g + ')"><path d="M-' + r * 0.7 + ' -' + r * 0.2 + ' q' + r * 0.3 + ' -' + r * 0.5 + ' ' + r * 0.7 + ' -' + r * 0.2 + ' q' + r * 0.1 + ' ' + r * 0.5 + ' -' + r * 0.3 + ' ' + r * 0.6 + ' q-' + r * 0.35 + ' ' + r * 0.1 + ' -' + r * 0.4 + ' -' + r * 0.4 + 'z" fill="#58c26b"/><path d="M' + r * 0.2 + ' ' + r * 0.35 + ' q' + r * 0.4 + ' -' + r * 0.2 + ' ' + r * 0.55 + ' ' + r * 0.1 + ' q-' + r * 0.2 + ' ' + r * 0.35 + ' -' + r * 0.55 + ' ' + r * 0.2 + 'z" fill="#58c26b"/><path d="M-' + r * 0.2 + ' -' + r * 0.7 + ' q' + r * 0.4 + ' ' + r * 0.2 + ' ' + r * 0.8 + ' 0" fill="none" stroke="#fff" stroke-width="' + r * 0.16 + '" stroke-linecap="round" opacity=".85"/></g>';
    else if (pid === 'jupiter') deco = '<g clip-path="url(#k' + g + ')"><rect x="' + (-r) + '" y="' + (-r * 0.42) + '" width="' + 2 * r + '" height="' + r * 0.22 + '" fill="#b8723a" opacity=".55"/><rect x="' + (-r) + '" y="' + (r * 0.08) + '" width="' + 2 * r + '" height="' + r * 0.28 + '" fill="#b8723a" opacity=".5"/><ellipse cx="' + r * 0.35 + '" cy="' + r * 0.52 + '" rx="' + r * 0.22 + '" ry="' + r * 0.13 + '" fill="#d4573a"/></g>';
    else if (pid === 'saturn') deco = '<g clip-path="url(#k' + g + ')"><rect x="' + (-r) + '" y="' + (-r * 0.3) + '" width="' + 2 * r + '" height="' + r * 0.2 + '" fill="#c7a24c" opacity=".45"/></g>';
    else if (pid === 'mars') deco = '<g clip-path="url(#k' + g + ')"><circle cx="' + (-r * 0.25) + '" cy="' + (-r * 0.85) + '" r="' + r * 0.4 + '" fill="#fff" opacity=".85"/><circle cx="' + r * 0.3 + '" cy="' + r * 0.15 + '" r="' + r * 0.2 + '" fill="#9a2f18" opacity=".55"/></g>';
    else if (pid === 'mercury') deco = '<g clip-path="url(#k' + g + ')"><circle cx="' + (-r * 0.3) + '" cy="' + (-r * 0.2) + '" r="' + r * 0.2 + '" fill="#6f665c" opacity=".55"/><circle cx="' + r * 0.35 + '" cy="' + r * 0.3 + '" r="' + r * 0.14 + '" fill="#6f665c" opacity=".55"/></g>';
    else if (pid === 'venus') deco = '<g clip-path="url(#k' + g + ')"><path d="M' + (-r) + ' ' + (-r * 0.2) + ' q' + r * 0.5 + ' -' + r * 0.3 + ' ' + r + ' 0 t' + r + ' 0" fill="none" stroke="#fff" stroke-width="' + r * 0.14 + '" opacity=".6"/></g>';
    return body + ringBack + '<circle r="' + r + '" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="' + sw + '"/>' + deco + ringFront;
  }
  function planetSvg(pid, size) {
    return '<svg class="plsvg" viewBox="-24 -24 48 48" width="' + (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true">' + planet(pid, 15) + '</svg>';
  }
  function sun(r, rays) {
    const g = uid('sn');
    let ry = '';
    if (rays !== false) for (let i = 0; i < 12; i++) ry += '<path d="M' + f1(Math.cos(i * Math.PI / 6) * r * 1.12) + ' ' + f1(Math.sin(i * Math.PI / 6) * r * 1.12) + ' L' + f1(Math.cos((i + .5) * Math.PI / 6) * r * 1.5) + ' ' + f1(Math.sin((i + .5) * Math.PI / 6) * r * 1.5) + ' L' + f1(Math.cos((i + 1) * Math.PI / 6) * r * 1.12) + ' ' + f1(Math.sin((i + 1) * Math.PI / 6) * r * 1.12) + 'Z" fill="#ffc42e" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    return '<defs><radialGradient id="' + g + '" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#fff6a0"/><stop offset=".6" stop-color="#ffc42e"/><stop offset="1" stop-color="#ff8a3c"/></radialGradient></defs>' +
      '<g class="sun-rays">' + ry + '</g><circle r="' + r + '" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="' + Math.max(2.5, r * 0.12) + '"/>';
  }

  /* ══════════ มูนมูน : กระต่ายนักบินอวกาศผู้นำทาง (slot "mat") ══════════ */
  function mat(mood) {
    const g1 = uid('mb'), g2 = uid('mv');
    const arm = (d, ex, ey) => '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#c9b8ff" stroke-width="6" stroke-linecap="round"/><circle cx="' + ex + '" cy="' + ey + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>';
    return '<svg class="mat mood-' + (mood || 'happy') + '" viewBox="-86 -112 172 188" aria-hidden="true">' +
      '<defs><linearGradient id="' + g1 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d8ff"/><stop offset=".6" stop-color="#b9a6ff"/><stop offset="1" stop-color="#9b86ee"/></linearGradient>' +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset="1" stop-color="#bfe8ff" stop-opacity=".35"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="72" rx="46" ry="6.5" fill="rgba(34,48,90,.22)"/>' +
      '<g class="m-leg-l"><path d="M-17 42 V58" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-17 42 V58" stroke="#c9b8ff" stroke-width="6" stroke-linecap="round"/><path d="M-33 68 Q-33 58 -23 58 L-11 58 Q-3 58 -3 68 Z" fill="#ff8fc1" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/></g>' +
      '<g class="m-leg-r"><path d="M17 42 V58" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M17 42 V58" stroke="#c9b8ff" stroke-width="6" stroke-linecap="round"/><path d="M3 68 Q3 58 11 58 L23 58 Q33 58 33 68 Z" fill="#ff8fc1" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/></g>' +
      '<g class="m-body">' +
        '<rect x="-46" y="4" width="14" height="34" rx="6" fill="#8d77e6" stroke="' + INK + '" stroke-width="3.4"/>' +
        '<g class="m-arms-down">' + arm('M-30 20 Q-58 26 -56 48', -56, 51) + arm('M30 20 Q58 26 56 48', 56, 51) + '</g>' +
        '<g class="m-arms-up">' + arm('M-30 16 Q-64 10 -60 -22', -60, -26) + arm('M30 16 Q64 10 60 -22', 60, -26) + '</g>' +
        '<g class="m-arms-think">' + arm('M-30 20 Q-58 26 -56 48', -56, 51) + arm('M30 20 Q62 14 40 -6', 36, -10) + '</g>' +
        '<rect x="-33" y="10" width="66" height="44" rx="17" fill="url(#' + g1 + ')" stroke="' + INK + '" stroke-width="4.4"/>' +
        '<g class="m-screen"><circle cx="0" cy="31" r="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M4 23 A9 9 0 1 0 4 39 A7 7 0 0 1 4 23Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<circle cx="-22" cy="41" r="3" fill="#ff6b8a"/><circle cx="22" cy="41" r="3" fill="#4aa8ff"/></g>' +
        /* หูกระต่าย */
        '<g transform="rotate(-10 -22 -62)"><ellipse cx="-22" cy="-86" rx="11" ry="27" fill="#fff" stroke="' + INK + '" stroke-width="3.8"/><ellipse cx="-22" cy="-84" rx="5" ry="19" fill="#ffb3d1"/></g>' +
        '<g transform="rotate(10 22 -62)"><ellipse cx="22" cy="-86" rx="11" ry="27" fill="#fff" stroke="' + INK + '" stroke-width="3.8"/><ellipse cx="22" cy="-84" rx="5" ry="19" fill="#ffb3d1"/></g>' +
        /* หน้าในหมวก */
        '<ellipse cx="0" cy="-28" rx="38" ry="34" fill="#fff" stroke="' + INK + '" stroke-width="3.4"/>' +
        '<ellipse cx="-26" cy="-14" rx="7.5" ry="4.6" fill="#ffb3d1" opacity=".9"/><ellipse cx="26" cy="-14" rx="7.5" ry="4.6" fill="#ffb3d1" opacity=".9"/>' +
        '<g class="m-eyes-open"><ellipse cx="-14" cy="-32" rx="8.4" ry="10.6" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="14" cy="-32" rx="8.4" ry="10.6" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle class="m-pupil" cx="-13" cy="-30" r="5.4" fill="' + INK + '"/><circle class="m-pupil" cx="15" cy="-30" r="5.4" fill="' + INK + '"/><circle cx="-10.8" cy="-33.4" r="2" fill="#fff"/><circle cx="17.2" cy="-33.4" r="2" fill="#fff"/></g>' +
        '<g class="m-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"><path d="M-23 -30 Q-14 -43 -5 -30"/><path d="M5 -30 Q14 -43 23 -30"/></g>' +
        '<g class="m-eyes-wow"><circle cx="-14" cy="-32" r="10.4" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="14" cy="-32" r="10.4" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-14" cy="-32" r="4" fill="' + INK + '"/><circle cx="14" cy="-32" r="4" fill="' + INK + '"/></g>' +
        '<path d="M-4.4 -20 Q0 -16 4.4 -20 Q2 -16.4 0 -15.4 Q-2 -16.4 -4.4 -20Z" fill="#ff8fa8" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path class="m-m-smile" d="M-7 -11 Q0 -3 7 -11" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>' +
        '<g class="m-m-open"><path d="M-9 -12 Q0 -14 9 -12 Q7 -1 0 -1 Q-7 -1 -9 -12Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M-3.4 -3 Q0 -8 3.4 -3 Q2 -1 0 -1 Q-2 -1 -3.4 -3Z" fill="#ff8f9f"/></g>' +
        '<g class="m-m-o"><ellipse cx="0" cy="-8" rx="5" ry="6.4" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<path class="m-m-flat" d="M-6 -9 Q0 -12 6 -9" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>' +
        /* หมวกแก้ว */
        '<circle cx="0" cy="-30" r="47" fill="url(#' + g2 + ')" stroke="' + INK + '" stroke-width="4.6"/>' +
        '<path d="M-33 -52 Q-24 -66 -8 -68" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<rect x="-31" y="12" width="62" height="12" rx="6" fill="#d7e0f2" stroke="' + INK + '" stroke-width="3.4"/>' +
        /* เสาอากาศดาว */
        '<path d="M33 -60 L42 -80" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/>' +
        '<g class="m-bulb"><circle cx="45" cy="-88" r="10" fill="#fff6a8" stroke="' + INK + '" stroke-width="3.2"/><circle cx="45" cy="-88" r="10" fill="#ffd23f" opacity=".55"/><path d="M45 -94 L47 -89.5 L52 -89 L48.2 -85.8 L49.4 -81 L45 -83.6 L40.6 -81 L41.8 -85.8 L38 -89 L43 -89.5Z" fill="#fff" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/></g>' +
      '</g></svg>';
  }

  /* ══════════ ฟิ้วฟิ้ว : ดาวหางจอมซน (slot "tub") — ไม่น่ากลัว ซนแบบน่ารัก ══════════ */
  function tub(mood) {
    const g = uid('tg'), gt = uid('tt');
    return '<svg class="tub mood-' + (mood || 'smirk') + '" viewBox="-70 -84 140 150" aria-hidden="true">' +
      '<defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#c8f6ff"/><stop offset=".55" stop-color="#6fcbff"/><stop offset="1" stop-color="#3a8ef0"/></radialGradient>' +
      '<linearGradient id="' + gt + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe56b"/><stop offset=".5" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>' +
      '<ellipse cx="-6" cy="60" rx="30" ry="4.5" fill="rgba(34,48,90,.2)"/>' +
      '<g class="t-float">' +
        '<path d="M16 -24 Q44 -40 68 -26 Q52 -12 66 2 Q44 8 62 24 Q36 22 14 26Z" fill="url(#' + gt + ')" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M26 -14 Q44 -24 58 -16 M30 4 Q46 0 56 8" fill="none" stroke="#fff6c2" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>' +
        '<circle cx="-8" cy="0" r="36" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.6"/>' +
        '<path d="M-30 -18 Q-22 -30 -8 -32" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" opacity=".9"/>' +
        '<circle cx="12" cy="22" r="5.5" fill="#3a8ef0" opacity=".55"/><circle cx="-26" cy="20" r="4" fill="#3a8ef0" opacity=".55"/>' +
        '<g class="t-lamp"><circle cx="-8" cy="-44" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/><circle cx="-8" cy="-44" r="4.4" fill="#fff6a8"/><path d="M-8 -53 V-58 M-18 -50 L-22 -55 M2 -50 L6 -55" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
        '<ellipse cx="-24" cy="12" rx="7" ry="4.4" fill="#ff8fb0" opacity=".85"/><ellipse cx="10" cy="12" rx="7" ry="4.4" fill="#ff8fb0" opacity=".85"/>' +
        '<circle cx="-21" cy="-6" r="10.4" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/><circle cx="5" cy="-6" r="10.4" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/>' +
        '<path class="t-brow" d="M-33 -22 L-12 -15 M19 -22 L-2 -15" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/>' +
        '<g class="t-eyes-smirk"><circle cx="-19" cy="-4" r="5" fill="' + INK + '"/><circle cx="7" cy="-4" r="5" fill="' + INK + '"/><circle cx="-17.2" cy="-5.6" r="1.6" fill="#fff"/><circle cx="8.8" cy="-5.6" r="1.6" fill="#fff"/></g>' +
        '<g class="t-eyes-shock"><circle cx="-21" cy="-6" r="10.4" fill="#fff"/><circle cx="5" cy="-6" r="10.4" fill="#fff"/><circle cx="-21" cy="-6" r="3.4" fill="' + INK + '"/><circle cx="5" cy="-6" r="3.4" fill="' + INK + '"/></g>' +
        '<g class="t-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"><path d="M-30 -4 Q-21 -16 -12 -4"/><path d="M-4 -4 Q5 -16 14 -4"/></g>' +
        '<g class="t-m-grin"><path d="M-24 14 Q-8 34 8 14 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M-14 24 V16 M-4 28 V16 M4 24 V16" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<ellipse class="t-m-o" cx="-8" cy="22" rx="6.5" ry="7.5" fill="#5a2250" stroke="' + INK + '" stroke-width="3"/>' +
        '<path class="t-m-smile" d="M-20 16 Q-8 30 4 16" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>' +
        '<g class="t-sign"><path d="M-46 24 L-52 -8" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/><rect x="-68" y="-34" width="36" height="26" rx="5" fill="#fff3d1" stroke="' + INK + '" stroke-width="3.2" transform="rotate(-8 -50 -21)"/>' +
          '<path d="M-60 -26 h14 l-4 -4 M-42 -17 h-14 l4 4" fill="none" stroke="#ff5a6e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-8 -50 -21)"/></g>' +
        '<g class="t-paw-l"><circle cx="-44" cy="26" r="9.5" fill="#8fe0ff" stroke="' + INK + '" stroke-width="3.4"/></g>' +
        '<circle cx="26" cy="38" r="9" fill="#8fe0ff" stroke="' + INK + '" stroke-width="3.4"/>' +
      '</g></svg>';
  }

  /* ══════════ น้องดาว : ผู้เล่น (ชุดนักบินอวกาศ) ══════════ */
  function kid(mood, cls) {
    const g = uid('kg'), gh = uid('kh');
    return '<svg class="kid mood-' + (mood || 'happy') + ' ' + (cls || '') + '" viewBox="0 0 110 136" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9e4ff"/></linearGradient>' +
      '<linearGradient id="' + gh + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#bfe8ff" stop-opacity=".25"/></linearGradient></defs>' +
      '<ellipse cx="55" cy="131" rx="30" ry="4.6" fill="rgba(34,48,90,.2)"/>' +
      '<g class="k-leg-l"><path d="M44 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M44 100 V118" stroke="#e9eeff" stroke-width="6" stroke-linecap="round"/><path d="M32 128 Q32 119 41 119 L50 119 Q56 119 56 128 Z" fill="#ff8a3c" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/></g>' +
      '<g class="k-leg-r"><path d="M66 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M66 100 V118" stroke="#e9eeff" stroke-width="6" stroke-linecap="round"/><path d="M54 128 Q54 119 62 119 L71 119 Q78 119 78 128 Z" fill="#ff8a3c" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/></g>' +
      '<g class="k-body">' +
        '<g class="k-arm-d"><path d="M26 84 Q10 90 12 106" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 84 Q10 90 12 106" fill="none" stroke="#e9eeff" stroke-width="5" stroke-linecap="round"/><circle cx="12" cy="108" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M84 84 Q100 90 98 106" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 84 Q100 90 98 106" fill="none" stroke="#e9eeff" stroke-width="5" stroke-linecap="round"/><circle cx="98" cy="108" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<g class="k-arm-u"><path d="M26 82 Q6 76 8 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 82 Q6 76 8 54" fill="none" stroke="#e9eeff" stroke-width="5" stroke-linecap="round"/><circle cx="8" cy="51" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M84 82 Q104 76 102 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 82 Q104 76 102 54" fill="none" stroke="#e9eeff" stroke-width="5" stroke-linecap="round"/><circle cx="102" cy="51" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<path d="M28 78 Q28 70 38 70 L72 70 Q82 70 82 78 L82 104 Q82 110 76 110 L34 110 Q28 110 28 104 Z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4"/>' +
        '<rect x="40" y="80" width="30" height="20" rx="5" fill="#8b5cf6" stroke="' + INK + '" stroke-width="3"/><circle cx="48" cy="90" r="3.4" fill="#ffd23f"/><circle cx="56" cy="90" r="3.4" fill="#3ccf9a"/><circle cx="64" cy="90" r="3.4" fill="#ff5a6e"/>' +
        '<circle cx="55" cy="42" r="30" fill="#ffd7b4" stroke="' + INK + '" stroke-width="4.2"/>' +
        '<path d="M25 44 Q24 18 55 14 Q86 18 85 44 Q80 28 55 26 Q30 28 25 44Z" fill="#3b2a50" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="36" cy="52" rx="6" ry="4.2" fill="#ff8fb0" opacity=".8"/><ellipse cx="74" cy="52" rx="6" ry="4.2" fill="#ff8fb0" opacity=".8"/>' +
        '<g class="k-eyes-open"><ellipse cx="45" cy="45" rx="6.2" ry="7.6" fill="#fff" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="65" cy="45" rx="6.2" ry="7.6" fill="#fff" stroke="' + INK + '" stroke-width="2.6"/>' +
          '<circle class="k-pupil" cx="46" cy="46.5" r="3.8" fill="' + INK + '"/><circle class="k-pupil" cx="66" cy="46.5" r="3.8" fill="' + INK + '"/><circle cx="47.2" cy="44.6" r="1.3" fill="#fff"/><circle cx="67.2" cy="44.6" r="1.3" fill="#fff"/></g>' +
        '<g class="k-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"><path d="M38 48 Q45 38 52 48"/><path d="M58 48 Q65 38 72 48"/></g>' +
        '<g class="k-eyes-wow"><circle cx="45" cy="45" r="7.6" fill="#fff" stroke="' + INK + '" stroke-width="2.6"/><circle cx="65" cy="45" r="7.6" fill="#fff" stroke="' + INK + '" stroke-width="2.6"/><circle cx="45" cy="45" r="2.8" fill="' + INK + '"/><circle cx="65" cy="45" r="2.8" fill="' + INK + '"/></g>' +
        '<path class="k-m-smile" d="M47 58 Q55 66 63 58" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<g class="k-m-open"><path d="M46 57 Q55 55 64 57 Q62 68 55 68 Q48 68 46 57Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></g>' +
        '<circle cx="55" cy="42" r="36" fill="url(#' + gh + ')" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M30 28 Q36 16 48 13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>' +
        '<rect x="35" y="74" width="40" height="9" rx="4.5" fill="#cfd9f0" stroke="' + INK + '" stroke-width="3"/>' +
      '</g></svg>';
  }

  /* ══════════ ฉากประจำด่าน (พิกัดภายใน 0–200 × 0–150) ══════════ */
  const STARS_S = [[22, 20], [58, 12], [92, 26], [138, 14], [170, 30], [30, 52], [180, 66], [14, 88], [166, 100], [48, 120], [120, 126], [190, 130]];
  const starsBg = (n) => STARS_S.slice(0, n || 12).map((s, i) => '<path d="M' + s[0] + ' ' + (s[1] - 3.4) + ' l1 2.4 2.6.2 -2 1.6.7 2.6 -2.3 -1.4 -2.3 1.4.7 -2.6 -2 -1.6 2.6 -.2z" fill="#fff6c2" opacity="' + (0.55 + (i % 3) * 0.2) + '"/>').join('');
  const night = '<rect x="0" y="0" width="200" height="150" fill="#2c3a86"/>';
  function scene(id) {
    const hill = c => '<path d="M0 120 Q40 96 84 114 T200 108 V150 H0Z" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    if (id === 1) {
      return night + starsBg(8) + '<path d="M26 108 Q100 -4 174 108" fill="none" stroke="#fff6c2" stroke-width="2.6" stroke-dasharray="3 6" stroke-linecap="round"/>' +
        at(moon(150, { glow: true }), 124, 22, 38) + hill('#3d2f78') +
        '<path d="M52 118 A26 26 0 0 1 104 118Z" fill="#dfe6ff" stroke="' + INK + '" stroke-width="3.4"/><rect x="72" y="92" width="12" height="26" rx="4" fill="#2c3a86" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<rect x="82" y="86" width="40" height="11" rx="5" transform="rotate(-28 82 92)" fill="#ff8fc1" stroke="' + INK + '" stroke-width="3"/>' +
        '<text x="20" y="104" font-size="11" font-weight="800" fill="#fff6c2" font-family="Mali">E</text><text x="176" y="104" font-size="11" font-weight="800" fill="#fff6c2" font-family="Mali">W</text>';
    }
    if (id === 2) {
      return '<rect width="200" height="150" fill="#5b4bb8"/>' + starsBg(6) +
        '<rect x="34" y="24" width="132" height="102" rx="12" fill="#fff6dc" stroke="' + INK + '" stroke-width="4"/><path d="M100 24 V126" stroke="' + INK + '" stroke-width="3"/>' +
        [0, 1, 2, 3].map(i => '<path d="M46 ' + (46 + i * 20) + ' H90" stroke="#c9b690" stroke-width="3" stroke-linecap="round"/>').join('') +
        [0, 1, 2, 3, 4].map(i => '<circle cx="' + (112 + i * 11) + '" cy="' + (104 - i * 14) + '" r="4.6" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/>').join('') +
        '<path d="M112 108 L156 50" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="3 5" stroke-linecap="round"/>' +
        '<circle cx="64" cy="42" r="11" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M64 36 V42 L69 45" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
    if (id === 3) {
      return night + starsBg(7) + '<g transform="translate(30 78)">' + sun(17) + '</g>' +
        '<ellipse cx="108" cy="78" rx="46" ry="46" fill="none" stroke="#fff6c2" stroke-width="2.4" stroke-dasharray="3 6"/>' +
        '<g transform="translate(108 78)">' + planet('earth', 17) + '</g>' +
        '<g transform="translate(108 126) rotate(0)">' + moonOrbit(11, 90) + '</g>' +
        [58, 78, 98].map(y => '<path d="M52 ' + y + ' H88" stroke="#ffe27a" stroke-width="2.6" stroke-dasharray="4 5" stroke-linecap="round"/>').join('') +
        at(moon(90), 150, 40, 36);
    }
    if (id === 4) {
      return '<rect width="200" height="150" fill="#3a56b4"/>' + starsBg(5) +
        '<rect x="22" y="16" width="156" height="120" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="4"/><rect x="22" y="16" width="156" height="26" rx="12" fill="#ff5a6e" stroke="' + INK + '" stroke-width="4"/>' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(i => at(moon(i * 45), 32 + (i % 4) * 37, 50 + Math.floor(i / 4) * 40, 32)).join('');
    }
    if (id === 5) {
      return night + starsBg(8) + '<g transform="translate(26 75)">' + sun(20) + '</g>' +
        [['mercury', 62, 4.4], ['venus', 82, 6], ['earth', 104, 6.4], ['mars', 124, 5.4], ['jupiter', 154, 12], ['saturn', 184, 9]].map((p, i) => '<g transform="translate(' + p[1] + ' ' + (i % 2 ? 98 : 52) + ')">' + planet(p[0], p[2]) + '</g>').join('') +
        '<path d="M44 75 Q100 60 196 75" fill="none" stroke="#fff6c2" stroke-width="2" stroke-dasharray="3 6" opacity=".7"/>';
    }
    return night + starsBg(8) + [20, 36, 52, 68].map(r => '<ellipse cx="100" cy="76" rx="' + r * 1.4 + '" ry="' + r + '" fill="none" stroke="#fff6c2" stroke-width="1.8" stroke-dasharray="3 5" opacity=".75"/>').join('') +
      '<g transform="translate(100 76)">' + sun(9, false) + '</g>' +
      [['mercury', 128, 70, 4], ['venus', 52, 84, 5], ['earth', 100, 128, 5.4], ['mars', 100, 8, 5]].map(p => '<g transform="translate(' + p[1] + ' ' + p[2] + ')">' + planet(p[0], p[3]) + '</g>').join('') +
      at(flag('#ff5a6e'), 150, 100, 26, 33);
  }
  const zoneArt = (id, small) => small ? scene(id) : '<svg class="zone-art" viewBox="0 0 200 150" aria-hidden="true"><rect width="200" height="150" rx="18" fill="#2c3a86"/><g clip-path="inset(0 round 18px)">' + scene(id) + '</g></svg>';

  /* ───────── ป้ายแผนที่ (เหรียญกลมของแต่ละด่าน) ───────── */
  function badge(zoneId, color) {
    const clip = uid('bc');
    return '<svg class="badge" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="' + clip + '"><circle cx="50" cy="50" r="44"/></clipPath></defs>' +
      '<circle cx="50" cy="50" r="47" fill="' + color + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<g clip-path="url(#' + clip + ')"><svg x="-10" y="-2" width="120" height="104" viewBox="20 6 160 140" preserveAspectRatio="xMidYMid slice">' + scene(zoneId) + '</svg></g>' +
      '<circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-dasharray="3 6"/></svg>';
  }

  /* ───────── ฉากหลังท้องฟ้า + ของประดับข้างทางบนแผนที่ ───────── */
  /* ดาว/ดวงจันทร์/ดาวเคราะห์ตกแต่งพื้นหลัง ใช้ตำแหน่งแบบเปอร์เซ็นต์ จึงเต็มทุกขนาดจอ */
  function skyBackdrop() {
    let s = '';
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 90; i++) {
      const r = 1.6 + rnd() * 2.6;
      s += '<div class="bgstar" style="left:' + f1(rnd() * 100) + '%;top:' + f1(rnd() * 100) + '%;width:' + f1(r) + 'px;height:' + f1(r) + 'px;animation-delay:' + (rnd() * 4).toFixed(2) + 's"></div>';
    }
    return s +
      '<div class="bg-moon">' + moon(150, { glow: true }) + '</div>' +
      '<div class="bg-pl bg-pl1"><svg viewBox="-48 -48 96 96" aria-hidden="true">' + planet('saturn', 26) + '</svg></div>' +
      '<div class="bg-pl bg-pl2"><svg viewBox="-24 -24 48 48" aria-hidden="true">' + planet('neptune', 16) + '</svg></div>';
  }
  function decor(kind) {
    const k = {
      planet: '<g transform="translate(0 0)">' + planet('saturn', 12) + '</g>',
      star: '<path d="M0 -14 L4 -4.5 L14 -4 L6.4 2.4 L9 12 L0 6.6 L-9 12 L-6.4 2.4 L-14 -4 L-4 -4.5Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>',
      moon: at(moon(60), -15, -15, 30),
      rocket: '<g transform="rotate(35)"><path d="M0 -17 Q9 -8 8 8 L-8 8 Q-9 -8 0 -17Z" fill="#fff" stroke="' + INK + '" stroke-width="2.8" stroke-linejoin="round"/><circle cx="0" cy="-3" r="3.6" fill="#7ad7ff" stroke="' + INK + '" stroke-width="2"/><path d="M-8 4 L-14 12 L-8 10ZM8 4 L14 12 L8 10Z" fill="#ff5a6e" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M-3 10 Q0 18 3 10" fill="#ffb21f" stroke="' + INK + '" stroke-width="2"/></g>',
      comet: '<path d="M-2 0 Q-12 -4 -22 -12 Q-14 -2 -22 2 Q-12 2 -2 4Z" fill="#ffb21f" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><circle r="8" fill="#8fe0ff" stroke="' + INK + '" stroke-width="2.8"/>',
      sat: '<rect x="-5" y="-5" width="10" height="10" rx="2" fill="#dfe6ff" stroke="' + INK + '" stroke-width="2.4"/><rect x="-20" y="-3" width="12" height="6" fill="#4aa8ff" stroke="' + INK + '" stroke-width="2"/><rect x="8" y="-3" width="12" height="6" fill="#4aa8ff" stroke="' + INK + '" stroke-width="2"/>'
    }[kind] || '';
    return '<svg class="decor-svg" viewBox="-26 -26 52 52" width="52" height="52" aria-hidden="true">' + k + '</svg>';
  }
  /* ฉากปิดเกม : สถานีสำรวจฟ้าที่ซ่อมเสร็จ */
  function finalScene() {
    return '<svg class="final-svg" viewBox="0 0 300 200" aria-hidden="true"><rect width="300" height="200" rx="26" fill="#2c3a86"/>' +
      Array.from({ length: 22 }, (_, i) => '<circle class="bgstar" style="animation-delay:' + (i * 0.37 % 4).toFixed(2) + 's" cx="' + ((i * 53) % 290 + 5) + '" cy="' + ((i * 37) % 120 + 6) + '" r="' + (1 + (i % 3) * 0.6) + '" fill="#fff6c2"/>').join('') +
      at(moon(170, { glow: true }), 196, 12, 76) +
      '<g transform="translate(46 56)">' + planet('saturn', 18) + '</g><g transform="translate(150 30)">' + planet('earth', 12) + '</g>' +
      '<path d="M0 168 Q80 136 160 156 T300 150 V200 H0Z" fill="#4a3c96" stroke="' + INK + '" stroke-width="3.4"/>' +
      '<path d="M90 160 A44 44 0 0 1 178 160Z" fill="#e9efff" stroke="' + INK + '" stroke-width="4"/><path d="M110 160 A24 24 0 0 1 158 160Z" fill="#bfe8ff" stroke="' + INK + '" stroke-width="3"/>' +
      at(flag('#ff5a6e'), 120, 82, 26, 33) +
      '<rect x="190" y="136" width="46" height="24" rx="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/><rect x="62" y="136" width="30" height="24" rx="5" fill="#ff8fc1" stroke="' + INK + '" stroke-width="3.4"/></svg>';
  }

  SK.art = Object.assign(SK.art || {}, {
    INK, uid, f1, at, icon, iconNo, star, stars, flag, balloon, bunting,
    moon, moonOrbit, planet, planetSvg, sun, mat, tub, kid, zoneArt, badge, skyBackdrop, decor, finalScene
  });
})();
