/* ═══════════════════════════════════════════════════════════
   CUCKOO CLOCK TOWER — Procedural SVG art (ไม่มีไฟล์ภาพ ไม่มีอิโมจิ)
   ตัวละคร: กุ๊กกู๊ (นกประจำหอนาฬิกา ผู้บรรยาย) / ติ๊กตี้ (นาฬิกาปลุกจิ๋ว ตัวแทนผู้เล่น)
            เจ้าเฟืองซน (เฟืองตัวป่วน ไม่น่ากลัว)
   ภาพอธิบายเวลา: หน้าปัด, แท่งหน่วย, เส้นเวลากระโดด, บันไดเวลา, กลางวัน-กลางคืน
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CT = window.CT;
  const T = CT.T;
  const INK = '#2b2440';
  const UC = k => T.UNITS[k].col;

  /* ── ไอคอนเส้น 24x24 ── */
  function cog(n, ro, ri, cx, cy) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a0) * r).toFixed(2) + ' ' + (cy + Math.sin(a0) * r).toFixed(2) +
        'L' + (cx + Math.cos(a1) * r).toFixed(2) + ' ' + (cy + Math.sin(a1) * r).toFixed(2);
    }
    return d + 'Z';
  }
  const ICONS = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
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
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9 17h6v4H9z"/>',
    back: '<path d="M9 6h11v12H9l-6-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M12 14h2M16 14h.01M8 17.5h2M12 17.5h2"/>',
    scale: '<path d="M12 4v15M7.5 20h9"/><path d="M4 7.5h16"/><path d="M4 7.5L1.8 13.5a3 3 0 0 0 4.4 0z"/><path d="M20 7.5l-2.2 6a3 3 0 0 0 4.4 0z"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 6.5h6"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><path d="M8 17l-2 4M16 17l2 4"/>',
    bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0M12 3v2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    hourglass: '<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function star(on, cls) {
    return '<svg class="star ' + (on ? 'on ' : '') + (cls || '') + '" viewBox="-12 -12 24 24" aria-hidden="true">' +
      '<path d="M0 -10.5 L3 -3.6 L10.4 -3.2 L4.7 1.6 L6.6 9 L0 5 L-6.6 9 L-4.7 1.6 L-10.4 -3.2 L-3 -3.6 Z" ' +
      'fill="' + (on ? '#ffd23f' : '#d9d4e8') + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      (on ? '<path d="M-2.5 -4 L0 -8" stroke="#fff6c8" stroke-width="2" stroke-linecap="round"/>' : '') + '</svg>';
  }
  function stars(n, of, cls) {
    let h = '<span class="stars">';
    for (let i = 0; i < (of || 3); i++) h += star(i < n, cls);
    return h + '</span>';
  }

  /* ══════════ กุ๊กกู๊ : นกประจำหอนาฬิกา ผู้บรรยายสุดเสียงดัง ══════════ */
  function guk(mood) {
    return '<svg class="guk mood-' + (mood || 'happy') + '" viewBox="-70 -84 140 160" aria-hidden="true">' +
      '<ellipse cx="0" cy="72" rx="38" ry="6" fill="rgba(43,36,64,.18)"/>' +
      /* หาง */
      '<g class="g-tail"><path d="M26 50 Q58 52 62 24 Q48 40 32 36 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M30 46 Q52 46 58 30" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/></g>' +
      /* ขา */
      '<path d="M-12 62 V71 M12 62 V71" stroke="#ff9a1f" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-20 72 H-6 M6 72 H20" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-20 72 H-6 M6 72 H20" stroke="#ff9a1f" stroke-width="2.4" stroke-linecap="round"/>' +
      /* ตัว */
      '<ellipse cx="0" cy="32" rx="34" ry="36" fill="#ffd23f" stroke="' + INK + '" stroke-width="4"/>' +
      '<ellipse cx="0" cy="40" rx="21" ry="24" fill="#fff3bf"/>' +
      '<path d="M-14 38 Q0 46 14 38 M-12 48 Q0 56 12 48" fill="none" stroke="#f3d27a" stroke-width="2.4" stroke-linecap="round"/>' +
      /* โบว์ผูกคอ */
      '<g transform="translate(0 6)"><path d="M0 0 L-15 -8 L-15 8 Z M0 0 L15 -8 L15 8 Z" fill="#ff4d4d" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle r="4.6" fill="#ff7a7a" stroke="' + INK + '" stroke-width="2.6"/></g>' +
      /* ปีก (ปกติ / ชู / คิด) */
      '<g class="g-arms-down">' +
        '<path d="M-30 20 Q-50 36 -40 58 Q-26 50 -26 26 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M30 20 Q50 36 40 58 Q26 50 26 26 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '</g>' +
      '<g class="g-arms-up">' +
        '<path d="M-28 16 Q-58 14 -56 -14 Q-42 -6 -24 8 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M28 16 Q58 14 56 -14 Q42 -6 24 8 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<g transform="translate(56 -14)"><path d="M0 0 V-34" stroke="' + INK + '" stroke-width="3.2"/>' +
        '<path d="M0 -34 L26 -26 L0 -18 Z" fill="#ff4d4d" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<circle cx="7" cy="-26" r="3" fill="#fff"/></g>' +
      '</g>' +
      '<g class="g-arms-think">' +
        '<path d="M-30 20 Q-50 36 -40 58 Q-26 50 -26 26 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M28 22 Q52 24 36 -2 Q26 4 22 14 Z" fill="#ffb81f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '</g>' +
      /* หัว */
      '<g class="g-head">' +
        '<path d="M-8 -54 Q-12 -68 -2 -72 M0 -56 Q2 -70 11 -70 M7 -54 Q14 -62 20 -58" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        /* หูฟัง */
        '<path d="M-37 -30 Q-40 -54 -20 -54 M37 -30 Q40 -54 20 -54" fill="none" stroke="#3e3a55" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="0" cy="-20" r="36" fill="#ffd23f" stroke="' + INK + '" stroke-width="4"/>' +
        '<ellipse cx="-24" cy="-6" rx="6.5" ry="4" fill="#ff9fb2" opacity=".8"/><ellipse cx="24" cy="-6" rx="6.5" ry="4" fill="#ff9fb2" opacity=".8"/>' +
        '<g class="g-eyes-open">' +
          '<ellipse cx="-14" cy="-26" rx="9" ry="10.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="14" cy="-26" rx="9" ry="10.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle class="g-pupil" cx="-12" cy="-24" r="5.2" fill="' + INK + '"/><circle class="g-pupil" cx="16" cy="-24" r="5.2" fill="' + INK + '"/>' +
          '<circle cx="-10" cy="-27" r="1.9" fill="#fff"/><circle cx="18" cy="-27" r="1.9" fill="#fff"/>' +
        '</g>' +
        '<g class="g-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"><path d="M-24 -24 Q-14 -36 -4 -24"/><path d="M4 -24 Q14 -36 24 -24"/></g>' +
        '<g class="g-eyes-wow"><circle cx="-14" cy="-27" r="11" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="14" cy="-27" r="11" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle cx="-14" cy="-27" r="4.2" fill="' + INK + '"/><circle cx="14" cy="-27" r="4.2" fill="' + INK + '"/></g>' +
        /* จะงอยปาก */
        '<g class="g-beak">' +
          '<path class="g-m-smile" d="M-11 -12 Q0 -22 11 -12 Q7 -1 0 0 Q-7 -1 -11 -12 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
          '<g class="g-m-open"><path d="M-11 -14 Q0 -24 11 -14 Q5 -8 0 -8 Q-5 -8 -11 -14 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
            '<path d="M-9 -8 Q0 -6 9 -8 Q6 8 0 8 Q-6 8 -9 -8 Z" fill="#8a2c3c" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M-4 3 Q0 -1 4 3 Q2 6 0 6 Q-2 6 -4 3Z" fill="#ff7f8f"/></g>' +
          '<g class="g-m-o"><path d="M-10 -14 Q0 -23 10 -14 Q6 -8 0 -8 Q-6 -8 -10 -14 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
            '<ellipse cx="0" cy="-1" rx="6" ry="7" fill="#8a2c3c" stroke="' + INK + '" stroke-width="3"/></g>' +
          '<path class="g-m-flat" d="M-11 -12 Q0 -20 11 -12 Q8 -6 0 -5 Q-8 -6 -11 -12 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
        '</g>' +
        /* ที่ครอบหู + ไมค์ */
        '<rect x="-47" y="-38" width="13" height="22" rx="6" fill="#ff4d6d" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="34" y="-38" width="13" height="22" rx="6" fill="#ff4d6d" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M-41 -17 Q-38 4 -20 6" fill="none" stroke="#3e3a55" stroke-width="3"/><circle cx="-19" cy="6" r="3.8" fill="#3e3a55"/>' +
        /* หลังคาบ้านนาฬิกาเป็นหมวก */
        '<path d="M-31 -50 L0 -82 L31 -50 Z" fill="#c8602f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M-17 -64 L17 -64 M-24 -57 L24 -57" stroke="#9c431c" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M-36 -48 H36" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M-36 -48 H36" stroke="#e8864a" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="0" cy="-71" r="5.5" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6"/>' +
      '</g>' +
    '</svg>';
  }

  /* ══════════ ติ๊กตี้ : นาฬิกาปลุกจิ๋ว ตัวแทนผู้เล่น ══════════ */
  function tikti(mood, cls) {
    let dots = '';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2;
      dots += '<circle cx="' + (65 + Math.cos(a) * 31).toFixed(1) + '" cy="' + (76 + Math.sin(a) * 31).toFixed(1) + '" r="' + (i % 3 ? 1.6 : 2.6) + '" fill="' + INK + '" opacity=".7"/>';
    }
    return '<svg class="tikti mood-' + (mood || 'happy') + ' ' + (cls || '') + '" viewBox="0 0 130 142" aria-hidden="true">' +
      '<ellipse cx="65" cy="136" rx="40" ry="5" fill="rgba(43,36,64,.2)"/>' +
      /* ขา */
      '<g class="t-leg-l"><path d="M50 114 V128" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M50 114 V128" stroke="#ffd23f" stroke-width="4.5" stroke-linecap="round"/>' +
        '<ellipse cx="46" cy="131" rx="11" ry="5.5" fill="#3e3a55" stroke="' + INK + '" stroke-width="3"/></g>' +
      '<g class="t-leg-r"><path d="M80 114 V128" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M80 114 V128" stroke="#ffd23f" stroke-width="4.5" stroke-linecap="round"/>' +
        '<ellipse cx="84" cy="131" rx="11" ry="5.5" fill="#3e3a55" stroke="' + INK + '" stroke-width="3"/></g>' +
      '<g class="t-body">' +
        /* กระดิ่งปลุก 2 ใบ + ค้อน */
        '<g transform="rotate(-28 38 40)"><g class="t-bell-l"><path d="M20 38 A18 18 0 0 1 56 38 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M27 34 Q31 24 40 22" fill="none" stroke="#fff6c8" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="17" r="3.6" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/></g></g>' +
        '<g transform="rotate(28 92 40)"><g class="t-bell-r"><path d="M74 38 A18 18 0 0 1 110 38 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M81 34 Q85 24 94 22" fill="none" stroke="#fff6c8" stroke-width="3" stroke-linecap="round"/><circle cx="92" cy="17" r="3.6" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/></g></g>' +
        '<g class="t-hammer"><path d="M65 32 V16" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="65" cy="13" r="6" fill="#ff7a7a" stroke="' + INK + '" stroke-width="3.2"/></g>' +
        /* แขน */
        '<g class="t-arms-down"><path d="M22 84 Q8 90 10 104" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M22 84 Q8 90 10 104" fill="none" stroke="#ff8a7a" stroke-width="5.5" stroke-linecap="round"/><circle cx="10" cy="106" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M108 84 Q122 90 120 104" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M108 84 Q122 90 120 104" fill="none" stroke="#ff8a7a" stroke-width="5.5" stroke-linecap="round"/><circle cx="120" cy="106" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<g class="t-arms-up"><path d="M22 76 Q4 70 6 48" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M22 76 Q4 70 6 48" fill="none" stroke="#ff8a7a" stroke-width="5.5" stroke-linecap="round"/><circle cx="6" cy="45" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M108 76 Q126 70 124 48" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M108 76 Q126 70 124 48" fill="none" stroke="#ff8a7a" stroke-width="5.5" stroke-linecap="round"/><circle cx="124" cy="45" r="6.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/></g>' +
        /* ตัว */
        '<circle cx="65" cy="76" r="46" fill="#ff5a4e" stroke="' + INK + '" stroke-width="4.5"/>' +
        '<path d="M30 56 Q40 38 60 34" fill="none" stroke="#ff9a8f" stroke-width="4.5" stroke-linecap="round"/>' +
        '<circle cx="65" cy="76" r="36" fill="#fffaf0" stroke="' + INK + '" stroke-width="3.5"/>' + dots +
        /* ตา */
        '<g class="t-eye-open"><ellipse cx="52" cy="64" rx="7.5" ry="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="78" cy="64" rx="7.5" ry="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle class="t-pupil" cx="53.5" cy="65.5" r="4.4" fill="' + INK + '"/><circle class="t-pupil" cx="79.5" cy="65.5" r="4.4" fill="' + INK + '"/>' +
          '<circle cx="55" cy="63" r="1.5" fill="#fff"/><circle cx="81" cy="63" r="1.5" fill="#fff"/></g>' +
        '<g class="t-eye-happy" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"><path d="M44 66 Q52 56 60 66"/><path d="M70 66 Q78 56 86 66"/></g>' +
        '<g class="t-eye-wow"><circle cx="52" cy="64" r="9.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="78" cy="64" r="9.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle cx="52" cy="64" r="3.6" fill="' + INK + '"/><circle cx="78" cy="64" r="3.6" fill="' + INK + '"/></g>' +
        '<g class="t-eye-dizzy" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"><path d="M52 64 m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -3 -4"/><path d="M78 64 m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -3 -4"/></g>' +
        /* เข็มนาฬิกาเล็ก ๆ ตรงกลาง (หมุนได้) */
        '<g class="t-hands"><path d="M65 80 L72 85" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/><g class="t-min"><path d="M65 80 V67" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>' +
          '<circle cx="65" cy="80" r="4.2" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6"/></g>' +
        /* ปาก */
        '<path class="t-m-smile" d="M54 94 Q65 105 76 94" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<ellipse class="t-m-o" cx="65" cy="98" rx="5" ry="6" fill="#8a2c3c" stroke="' + INK + '" stroke-width="3"/>' +
        '<path class="t-m-wavy" d="M54 98 q3.6 -4 7.2 0 q3.6 4 7.2 0 q3.6 -4 7.2 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="40" cy="86" rx="5.5" ry="3.4" fill="#ff9fb2" opacity=".75"/><ellipse cx="90" cy="86" rx="5.5" ry="3.4" fill="#ff9fb2" opacity=".75"/>' +
      '</g>' +
    '</svg>';
  }
  /* ติ๊กตี้ตัวเล็กบนแถบความคืบหน้า / แผนที่ */
  function tiktiMini() {
    return '<svg class="tk-mini" viewBox="0 0 60 66" aria-hidden="true">' +
      '<path d="M22 54 V62 M38 54 V62" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M22 54 V62 M38 54 V62" stroke="#ffd23f" stroke-width="2.4" stroke-linecap="round"/>' +
      '<g transform="rotate(-28 18 20)"><path d="M8 20 A10 10 0 0 1 28 20 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.8" stroke-linejoin="round"/></g>' +
      '<g transform="rotate(28 42 20)"><path d="M32 20 A10 10 0 0 1 52 20 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.8" stroke-linejoin="round"/></g>' +
      '<circle cx="30" cy="36" r="22" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="30" cy="36" r="16.5" fill="#fffaf0" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<circle cx="24" cy="32" r="2.6" fill="' + INK + '"/><circle cx="36" cy="32" r="2.6" fill="' + INK + '"/>' +
      '<path d="M24 41 Q30 47 36 41" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M30 38 V32 M30 38 L34 41" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  /* ══════════ เจ้าเฟืองซน : เฟืองตัวป่วนที่ชอบสลับหน่วยเวลา (ไม่น่ากลัว) ══════════ */
  function fon(mood) {
    const gear = cog(11, 46, 36, 0, 0);
    return '<svg class="fon mood-' + (mood || 'smirk') + '" viewBox="-60 -64 120 128" aria-hidden="true">' +
      '<ellipse cx="0" cy="54" rx="26" ry="4" fill="rgba(43,36,64,.15)"/>' +
      '<g class="f-float">' +
        '<g class="f-spin"><path d="' + gear + '" fill="#8b5cf6" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/></g>' +
        '<circle cx="0" cy="0" r="30" fill="#a07bff" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="-10" cy="-14" rx="9" ry="4.6" fill="#c6b2ff" opacity=".8"/>' +
        '<path class="f-brow" d="M-20 -14 L-6 -9 M20 -14 L6 -9" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<g class="f-eyes-smirk"><ellipse cx="-11" cy="-2" rx="7" ry="7.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
          '<ellipse cx="11" cy="-2" rx="7" ry="7.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
          '<path d="M-18 -4 H-4 M4 -4 H18" stroke="#a07bff" stroke-width="5"/>' +
          '<circle cx="-9" cy="0" r="3.4" fill="' + INK + '"/><circle cx="13" cy="0" r="3.4" fill="' + INK + '"/></g>' +
        '<g class="f-eyes-shock"><circle cx="-11" cy="-3" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="11" cy="-3" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
          '<circle cx="-11" cy="-3" r="2.6" fill="' + INK + '"/><circle cx="11" cy="-3" r="2.6" fill="' + INK + '"/></g>' +
        '<g class="f-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"><path d="M-17 -1 Q-11 -9 -5 -1"/><path d="M5 -1 Q11 -9 17 -1"/></g>' +
        '<g class="f-m-grin"><path d="M-12 11 Q0 22 13 9" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M2 15 V11" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<ellipse class="f-m-o" cx="0" cy="14" rx="5.5" ry="6.5" fill="#4a1d6e" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path class="f-m-smile" d="M-10 11 Q0 19 10 11" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        /* แขน + เข็มนาฬิกาที่ขโมยมา */
        '<path d="M-32 6 Q-46 10 -46 22" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
        '<g class="f-hand"><path d="M34 6 Q46 2 48 -8" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
          '<path d="M48 -6 L52 -52 L56 -6 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><circle cx="52" cy="-2" r="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/></g>' +
      '</g></svg>';
  }

  /* ══════════ นาฬิกาหน้าปัด ══════════ */
  function clock(h, m, o) {
    o = o || {};
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    let ticks = '', nums = '';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
      const r1 = big ? 36 : 40, r2 = 44;
      ticks += '<path d="M' + (50 + Math.sin(a) * r1).toFixed(1) + ' ' + (50 - Math.cos(a) * r1).toFixed(1) + 'L' + (50 + Math.sin(a) * r2).toFixed(1) + ' ' + (50 - Math.cos(a) * r2).toFixed(1) + '" stroke="' + INK + '" stroke-width="' + (big ? 2 : 0.9) + '" stroke-linecap="round" opacity="' + (big ? 1 : .55) + '"/>';
    }
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180;
      nums += '<text x="' + (50 + Math.sin(a) * 28.5).toFixed(1) + '" y="' + (50 - Math.cos(a) * 28.5 + 3.8).toFixed(1) + '" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="11" fill="' + INK + '">' + i + '</text>';
    }
    return '<svg class="ck ' + (o.cls || '') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="48" fill="' + (o.rim || '#ff9a1f') + '" stroke="' + INK + '" stroke-width="3.4"/>' +
      '<circle cx="50" cy="50" r="44.5" fill="#fffaf0" stroke="' + INK + '" stroke-width="2"/>' + ticks + nums +
      '<g class="ck-h" style="transform:rotate(' + ha.toFixed(1) + 'deg)"><path d="M50 56 V30" stroke="' + INK + '" stroke-width="5.6" stroke-linecap="round"/><path d="M50 56 V30" stroke="#14b8a6" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="ck-m" style="transform:rotate(' + ma + 'deg)"><path d="M50 58 V15" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/><path d="M50 58 V15" stroke="#ff9a1f" stroke-width="1.8" stroke-linecap="round"/></g>' +
      (o.sweep ? '<g class="ck-s sweep"><path d="M50 60 V10" stroke="#ff5fa2" stroke-width="1.6" stroke-linecap="round"/><circle cx="50" cy="60" r="2.6" fill="#ff5fa2"/></g>' : '') +
      '<circle cx="50" cy="50" r="3.8" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/></svg>';
  }
  /* ป้ายนาฬิกาดิจิทัลแบบจอ LED */
  function led(t, cls) {
    return '<span class="led ' + (cls || '') + '">' + T.fmtT(t) + '<small>น.</small></span>';
  }
  function clockCard(t, label, o) {
    return '<div class="ckc"><div class="ckc-lbl">' + label + '</div>' + clock(Math.floor(t / 60), t % 60, o) + led(t) + '</div>';
  }

  /* ══════════ แท่งหน่วย: n หน่วยใหญ่ = ? หน่วยเล็ก ══════════ */
  function groups(pr, n, rem, o) {
    o = o || {};
    const B = pr.big, S = pr.small, f = pr.f;
    const cap = o.cap || 5;
    let boxes = '';
    const show = Math.min(n, cap);
    for (let i = 0; i < show; i++) {
      boxes += '<div class="gbox" style="--uc:' + UC(B) + ';--i:' + i + '"><b>1</b><i>' + T.UNITS[B].name + '</i><span>= ' + f + ' ' + T.UNITS[S].name + '</span></div>';
    }
    if (n > cap) boxes += '<div class="gmore">... รวม ' + n + ' ' + T.UNITS[B].name + '</div>';
    if (rem) boxes += '<div class="gbox part" style="--uc:' + UC(S) + ';--i:' + show + '"><b>' + rem + '</b><i>' + T.UNITS[S].name + '</i></div>';
    const total = n * f + (rem || 0);
    const sumTerms = [];
    for (let i = 0; i < n; i++) sumTerms.push(f);
    if (rem) sumTerms.push(rem);
    const sumTxt = sumTerms.length > 6 ? f + ' + ' + f + ' + ... (' + n + ' ครั้ง)' + (rem ? ' + ' + rem : '') : sumTerms.join(' + ');
    return '<div class="grp"><div class="grp-row">' + boxes + '</div>' +
      (o.noSum ? '' : '<div class="grp-sum"><span>' + sumTxt + '</span> = <b style="color:' + UC(S) + '">' + T.num(total) + ' ' + T.UNITS[S].name + '</b></div>') + '</div>';
  }

  /* ══════════ เส้นเวลากระโดด ══════════ */
  function hopSegs(t0, t1) {
    const segs = [];
    let t = t0;
    if (t % 60 !== 0) {
      const nx = Math.ceil(t / 60) * 60;
      if (nx <= t1) { segs.push([t, nx]); t = nx; }
    }
    if (t + 60 <= t1) {
      const hrs = Math.floor((t1 - t) / 60);
      segs.push([t, t + hrs * 60]);
      t += hrs * 60;
    }
    if (t < t1) segs.push([t, t1]);
    return segs;
  }
  /* o = {reveal: จำนวนช่วงที่เปิดให้เห็น (ค่าเริ่มต้น = ทั้งหมด), hideEnd: ซ่อนเวลาสุดท้าย} */
  function hops(t0, t1, o) {
    o = o || {};
    const segs = hopSegs(t0, t1);
    const reveal = o.reveal == null ? segs.length : o.reveal;
    let h = '<div class="hops"><div class="hp-node on">' + T.fmtT(t0) + '</div>';
    segs.forEach((s, i) => {
      const on = i < reveal;
      const last = i === segs.length - 1;
      const col = s[1] - s[0] >= 60 && (s[1] - s[0]) % 60 === 0 ? UC('hr') : UC('min');
      h += '<div class="hp-arrow' + (on ? ' on' : '') + '" style="--hc:' + col + ';--i:' + i + '"><span>+ ' + T.minText(s[1] - s[0]) + '</span></div>' +
        '<div class="hp-node' + (on ? ' on' : '') + (last && o.hideEnd ? ' q' : '') + '" style="--i:' + i + '">' + (last && o.hideEnd ? '?' : T.fmtT(s[1])) + '</div>';
    });
    h += '</div>';
    if (!o.noTotal) {
      const sum = segs.map(s => T.minText(s[1] - s[0])).join(' + ');
      h += '<div class="hp-total' + (reveal >= segs.length && !o.hideEnd ? ' on' : '') + '">' + sum + ' = <b>' + T.minText(t1 - t0) + '</b></div>';
    }
    return h;
  }

  /* ══════════ บันไดเวลา ══════════ */
  function ladder() {
    const steps = [
      ['yr', '1 ปี', '12 เดือน'], ['mo', '1 เดือน', '28 - 31 วัน'], ['wk', '1 สัปดาห์', '7 วัน'],
      ['day', '1 วัน', '24 ชั่วโมง'], ['hr', '1 ชั่วโมง', '60 นาที'], ['min', '1 นาที', '60 วินาที']
    ];
    return '<div class="ladder">' + steps.map((s, i) =>
      '<div class="lad-step" style="--uc:' + UC(s[0]) + ';--i:' + i + '"><b>' + s[1] + '</b><span>=</span><em>' + s[2] + '</em></div>').join('') + '</div>';
  }

  /* ══════════ 24 ชั่วโมง = 1 วัน (กลางวัน-กลางคืน) ══════════ */
  function sun() {
    let rays = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; rays += '<path d="M' + (Math.cos(a) * 10).toFixed(1) + ' ' + (Math.sin(a) * 10).toFixed(1) + 'L' + (Math.cos(a) * 14).toFixed(1) + ' ' + (Math.sin(a) * 14).toFixed(1) + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    return '<svg class="sunic" viewBox="-16 -16 32 32" aria-hidden="true">' + rays + '<circle r="7.5" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6"/></svg>';
  }
  function moon() {
    return '<svg class="sunic" viewBox="-16 -16 32 32" aria-hidden="true"><path d="M6 -12 A13 13 0 1 0 12 7 A10 10 0 0 1 6 -12 Z" fill="#cfe0ff" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/></svg>';
  }
  function dayBar(upto) {
    let cells = '';
    for (let i = 0; i < 24; i++) {
      const day = i >= 6 && i < 18;
      cells += '<i class="dn ' + (day ? 'day' : 'night') + (i < (upto == null ? 24 : upto) ? ' on' : '') + '" style="--i:' + i + '"><small>' + (i % 6 === 0 ? i : '') + '</small></i>';
    }
    return '<div class="daybar"><div class="db-ic">' + moon() + '</div><div class="db-cells">' + cells + '</div><div class="db-ic">' + sun() + '</div></div>' +
      '<div class="db-cap">24 ชั่วโมง = 1 วัน</div>';
  }
  /* แถบ 7 วันในหนึ่งสัปดาห์ */
  function weekBar() {
    return '<div class="weekbar">' + T.DOW.map((d, i) => '<div class="wk-d" style="--i:' + i + '"><b>' + (i + 1) + '</b><span>' + d + '</span></div>').join('') + '</div>';
  }
  /* ป้ายเดือน: ยน = 30 วัน / คม = 31 วัน */
  function monthBoard() {
    const f = m => '<div class="mb-m d' + m.d + '"><b>' + m.n + '</b><span>' + (m.d === 28 ? '28 หรือ 29' : m.d) + '</span></div>';
    return '<div class="monthboard">' + T.MONTHS.map(f).join('') + '</div>' +
      '<div class="mb-key"><span class="k30">ลงท้าย ยน = 30 วัน</span><span class="k31">ลงท้าย คม = 31 วัน</span><span class="k28">กุมภาพันธ์ = 28 หรือ 29 วัน</span></div>';
  }
  /* 12 เดือน = 1 ปี */
  function yearRing() {
    return '<div class="yearring">' + T.MONTHS.map((m, i) => '<i style="--i:' + i + '"><small>' + (i + 1) + '</small></i>').join('') + '<b>1 ปี<br><span>12 เดือน</span></b></div>';
  }

  /* ══════════ ระฆังทอง ══════════ */
  function bell(on, cls) {
    return '<svg class="bellsvg ' + (on ? 'on ' : '') + (cls || '') + '" viewBox="-30 -34 60 70" aria-hidden="true">' +
      '<g class="bell-sw"><path d="M0 -30 V-22" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-22 16 Q-22 -2 -16 -10 Q-10 -22 0 -22 Q10 -22 16 -10 Q22 -2 22 16 L26 20 H-26 Z" fill="' + (on ? '#ffd23f' : '#cfcadb') + '" stroke="' + INK + '" stroke-width="3.6" stroke-linejoin="round"/>' +
      '<path d="M-14 12 Q-14 0 -10 -6" fill="none" stroke="' + (on ? '#fff6c8' : '#ebe8f3') + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="0" cy="25" r="5" fill="' + (on ? '#ff9a1f' : '#b8b3c9') + '" stroke="' + INK + '" stroke-width="3"/></g></svg>';
  }
  function badge(iconName, color) {
    return '<svg class="badge" viewBox="-40 -40 80 80" aria-hidden="true">' +
      '<circle r="36" fill="' + color + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle r="28" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-dasharray="5 5"/>' +
      '<g transform="translate(-15 -15) scale(1.25)" stroke="#fff" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[iconName] || '') + '</g></svg>';
  }
  /* ริบบิ้นเฟืองเล็ก ๆ ตกแต่งหัวการ์ด */
  function gearBand(w, h) {
    let s = '<svg class="gearband" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><rect width="' + w + '" height="' + h + '" fill="#ffd23f"/>';
    for (let x = 6; x < w; x += 16) s += '<path d="' + cog(6, 5, 3.6, x + 2, h / 2) + '" fill="#ff9a1f" stroke="' + INK + '" stroke-width="1"/>';
    return s + '<path d="M0 ' + (h - 1) + 'H' + w + '" stroke="' + INK + '" stroke-width="2"/></svg>';
  }

  /* ══════════ หอนาฬิกาใหญ่ (ฉากจบ) ══════════ */
  function tower(cls) {
    return '<svg class="tower ' + (cls || '') + '" viewBox="-70 -140 140 270" aria-hidden="true">' +
      '<path d="M-30 -60 L0 -110 L30 -60 Z" fill="#c8602f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M-20 -78 H20 M-26 -68 H26" stroke="#9c431c" stroke-width="3"/>' +
      '<circle cx="0" cy="-118" r="6" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="-28" y="-62" width="56" height="42" rx="3" fill="#f0c590" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M-16 -58 V-24 Q0 -34 16 -24 V-58 Q0 -68 -16 -58Z" fill="#6b4a8c" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="tw-bell" style="transform-origin:0 -56px"><path d="M-9 -34 Q-9 -44 -5 -48 Q0 -54 5 -48 Q9 -44 9 -34 L12 -31 H-12 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/><circle cx="0" cy="-29" r="3.6" fill="#ff9a1f" stroke="' + INK + '" stroke-width="2"/></g>' +
      '<rect x="-34" y="-20" width="68" height="120" rx="3" fill="#f6d9ae" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="0" cy="22" r="26" fill="#fffaf0" stroke="' + INK + '" stroke-width="4"/><circle cx="0" cy="22" r="21" fill="none" stroke="#ff9a1f" stroke-width="2.4" stroke-dasharray="2 5.2" stroke-linecap="round"/>' +
      '<path d="M0 22 V6 M0 22 L10 28" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="22" r="3.4" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<path d="M-12 100 V76 Q-12 64 0 64 Q12 64 12 76 V100 Z" fill="#6b4a8c" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
      '<rect x="-44" y="98" width="88" height="14" rx="3" fill="#8a6b4a" stroke="' + INK + '" stroke-width="4"/>' +
    '</svg>';
  }
  /* ฉากหลังเมือง (พื้นหลังคงที่) */
  function town() {
    let houses = '';
    const hc = ['#ffd6a8', '#ffc3b3', '#ffe6a0', '#c9ecff', '#d9ccff'];
    const xs = [10, 62, 104, 150, 220, 262, 312, 352];
    xs.forEach((x, i) => {
      const w = 34 + (i % 3) * 6, hh = 34 + ((i * 7) % 4) * 6;
      houses += '<g><rect x="' + x + '" y="' + (150 - hh) + '" width="' + w + '" height="' + hh + '" fill="' + hc[i % hc.length] + '" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M' + (x - 4) + ' ' + (150 - hh) + ' L' + (x + w / 2) + ' ' + (150 - hh - 18) + ' L' + (x + w + 4) + ' ' + (150 - hh) + ' Z" fill="#e8864a" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<rect x="' + (x + w / 2 - 5) + '" y="' + (150 - 18) + '" width="10" height="18" fill="#8a6b4a" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="' + (x + 6) + '" y="' + (150 - hh + 8) + '" width="8" height="8" fill="#fff6c8" stroke="' + INK + '" stroke-width="1.8"/></g>';
    });
    return '<svg class="town-svg" viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<path d="M0 120 Q60 70 130 110 T260 100 T400 104 V190 H0 Z" fill="#9be3c9" opacity=".75"/>' +
      '<path d="M0 140 Q80 100 170 134 T330 128 T400 132 V190 H0 Z" fill="#7fd6b5"/>' + houses +
      /* หอนาฬิกากลาง */
      '<g transform="translate(186 0)"><rect x="-17" y="38" width="34" height="112" fill="#f0c590" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M-22 40 L0 8 L22 40 Z" fill="#c8602f" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="0" cy="68" r="12.5" fill="#fffaf0" stroke="' + INK + '" stroke-width="3"/><path d="M0 68 V59 M0 68 L6 72" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="0" cy="4" r="3.6" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/></g></svg>';
  }

  CT.art = {
    INK, ICONS, icon, star, stars, guk, tikti, tiktiMini, fon, clock, led, clockCard, groups, hopSegs, hops, ladder,
    sun, moon, dayBar, weekBar, monthBoard, yearRing, bell, badge, gearBand, tower, town
  };
})();
