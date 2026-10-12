/* ═══════════════════════════════════════════════════════════
   DOTTY GRAND PRIX — Procedural SVG art (ไม่มีไฟล์ภาพ ไม่มีอิโมจิ)
   ตัวละคร: ซิ่งซิ่ง (เสือชีตาห์ผู้บรรยาย) / ดอตตี้ (รถแข่ง) / เจ้าจุดซน
   แบบจำลองปริมาณ: แผ่นพลัง 10x10  (แผ่น = 1, แถว = 0.1, ช่อง = 0.01, ชิ้นจิ๋ว = 0.001)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const DG = window.DG;
  const INK = '#2b2440';
  const COL = { one: '#ff5a3c', t1: '#ffa41b', t2: '#14b8a6', t3: '#7c5cff', ten: '#ff5fa2', hun: '#e04fd0' };

  /* ── ไอคอนเส้น 24x24 ── */
  function cog() {
    let d = '';
    const n = 8;
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? 7.2 : 9.6;
      d += (i ? 'L' : 'M') + (12 + Math.cos(a0) * r).toFixed(2) + ' ' + (12 + Math.sin(a0) * r).toFixed(2) +
        'L' + (12 + Math.cos(a1) * r).toFixed(2) + ' ' + (12 + Math.sin(a1) * r).toFixed(2);
    }
    return '<path d="' + d + 'Z"/><circle cx="12" cy="12" r="3"/>';
  }
  const ICONS = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    gear: cog(),
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
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12"/><path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h4"/>',
    gauge: '<path d="M3 17a9 9 0 1 1 18 0"/><path d="M12 17l4.5-5.5"/><circle cx="12" cy="17" r="1.6" fill="currentColor"/>',
    mirror: '<rect x="3" y="4" width="7.5" height="16" rx="2"/><rect x="13.5" y="4" width="7.5" height="16" rx="2"/><path d="M5 9l3-3M15.5 9l3-3"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
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

  /* ══════════ ซิ่งซิ่ง : เสือชีตาห์ผู้บรรยายสนาม ══════════ */
  function zing(mood) {
    return '<svg class="zing mood-' + (mood || 'happy') + '" viewBox="-70 -84 140 160" aria-hidden="true">' +
      '<ellipse cx="0" cy="72" rx="40" ry="6" fill="rgba(43,36,64,.18)"/>' +
      /* หาง */
      '<path class="z-tail" d="M28 52 C58 50 62 22 50 12" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/>' +
      '<path class="z-tail" d="M28 52 C58 50 62 22 50 12" fill="none" stroke="#ffc94a" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="50" cy="13" r="4" fill="' + INK + '"/>' +
      /* ตัว: เสื้อแจ็กเก็ตทีมแข่ง */
      '<path d="M-26 70 L-28 38 Q-28 20 0 20 Q28 20 28 38 L26 70 Z" fill="#20c4b4" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M-6 21 L-4 70 M6 21 L4 70" stroke="#fff" stroke-width="4"/>' +
      '<circle cx="-15" cy="44" r="6" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5"/>' +
      /* แขน (ปกติ / ชูมือ) */
      '<g class="z-arms-down">' +
        '<path d="M-26 32 Q-40 46 -34 60" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M-26 32 Q-40 46 -34 60" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="-34" cy="61" r="7" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M26 32 Q42 38 40 22" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M26 32 Q42 38 40 22" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<g class="z-mic"><rect x="36" y="2" width="9" height="20" rx="4" fill="#4a4560" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="40.5" cy="2" r="8" fill="#9a96ad" stroke="' + INK + '" stroke-width="3"/><path d="M36 0h9M36 4h9" stroke="' + INK + '" stroke-width="1.5"/></g>' +
        '<circle cx="40" cy="22" r="7" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>' +
      '<g class="z-arms-up">' +
        '<path d="M-24 30 Q-46 18 -44 -6" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M-24 30 Q-46 18 -44 -6" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="-44" cy="-8" r="7.5" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M24 30 Q46 18 44 -6" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M24 30 Q46 18 44 -6" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<g transform="translate(44 -10)"><path d="M0 0 V-34" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="0" y="-34" width="24" height="16" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M0 -34h6v4h-6zM12 -34h6v4h-6zM6 -30h6v4h-6zM18 -30h6v4h-6zM0 -26h6v4h-6zM12 -26h6v4h-6zM6 -22h6v4h-6zM18 -22h6v4h-6z" fill="' + INK + '"/></g>' +
        '<circle cx="44" cy="-8" r="7.5" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>' +
      '<g class="z-arms-think">' +
        '<path d="M-26 32 Q-40 46 -34 60" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M-26 32 Q-40 46 -34 60" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="-34" cy="61" r="7" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M26 32 Q36 20 18 12" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M26 32 Q36 20 18 12" fill="none" stroke="#20c4b4" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="16" cy="11" r="7" fill="#ffc94a" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>' +
      /* หัว */
      '<g class="z-head">' +
        '<circle cx="-30" cy="-50" r="12" fill="#ffc94a" stroke="' + INK + '" stroke-width="4"/><circle cx="-30" cy="-50" r="5.5" fill="#ff9fb2"/>' +
        '<circle cx="30" cy="-50" r="12" fill="#ffc94a" stroke="' + INK + '" stroke-width="4"/><circle cx="30" cy="-50" r="5.5" fill="#ff9fb2"/>' +
        '<ellipse cx="0" cy="-18" rx="42" ry="38" fill="#ffc94a" stroke="' + INK + '" stroke-width="4"/>' +
        '<g fill="#d98a2b"><circle cx="-26" cy="-40" r="3.2"/><circle cx="-34" cy="-28" r="2.6"/><circle cx="-18" cy="-48" r="2.4"/>' +
        '<circle cx="26" cy="-40" r="3.2"/><circle cx="35" cy="-26" r="2.6"/><circle cx="18" cy="-48" r="2.4"/><circle cx="-36" cy="-10" r="2.4"/><circle cx="36" cy="-10" r="2.4"/></g>' +
        '<ellipse cx="0" cy="-2" rx="22" ry="15" fill="#fff6e4"/>' +
        '<path d="M-17 -16 Q-20 -6 -12 2 M17 -16 Q20 -6 12 2" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<ellipse cx="-30" cy="-4" rx="6" ry="3.5" fill="#ff9fb2" opacity=".75"/><ellipse cx="30" cy="-4" rx="6" ry="3.5" fill="#ff9fb2" opacity=".75"/>' +
        /* ตา */
        '<g class="z-eyes-open">' +
          '<ellipse cx="-15" cy="-24" rx="8" ry="9.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="15" cy="-24" rx="8" ry="9.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle class="z-pupil" cx="-13" cy="-22" r="5" fill="' + INK + '"/><circle class="z-pupil" cx="17" cy="-22" r="5" fill="' + INK + '"/>' +
          '<circle cx="-11.5" cy="-24.5" r="1.8" fill="#fff"/><circle cx="18.5" cy="-24.5" r="1.8" fill="#fff"/>' +
        '</g>' +
        '<g class="z-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round">' +
          '<path d="M-23 -22 Q-15 -32 -7 -22"/><path d="M7 -22 Q15 -32 23 -22"/></g>' +
        '<g class="z-eyes-wow">' +
          '<circle cx="-15" cy="-25" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="15" cy="-25" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle cx="-15" cy="-25" r="4" fill="' + INK + '"/><circle cx="15" cy="-25" r="4" fill="' + INK + '"/></g>' +
        '<path d="M-6 -10 Q0 -14 6 -10 Q4 -5 0 -4 Q-4 -5 -6 -10 Z" fill="' + INK + '"/>' +
        /* ปาก */
        '<path class="z-m-smile" d="M-10 0 Q-5 6 0 1 Q5 6 10 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="z-m-open"><path d="M-11 0 Q0 2 11 0 Q9 15 0 15 Q-9 15 -11 0 Z" fill="#8a2c3c" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M-6 10 Q0 6 6 10 Q4 14 0 14 Q-4 14 -6 10Z" fill="#ff7f8f"/></g>' +
        '<ellipse class="z-m-o" cx="0" cy="6" rx="6" ry="7" fill="#8a2c3c" stroke="' + INK + '" stroke-width="3"/>' +
        '<path class="z-m-flat" d="M-7 4 Q0 1 7 5" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        /* หูฟัง + ไมค์ */
        '<path d="M-42 -22 Q-44 -70 0 -70 Q44 -70 42 -22" fill="none" stroke="#3e3a55" stroke-width="5"/>' +
        '<rect x="-49" y="-32" width="12" height="20" rx="5" fill="#ff4d6d" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="37" y="-32" width="12" height="20" rx="5" fill="#ff4d6d" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M-43 -14 Q-40 6 -18 8" fill="none" stroke="#3e3a55" stroke-width="3"/><circle cx="-17" cy="8" r="3.5" fill="#3e3a55"/>' +
        /* หมวกแก๊ป */
        '<path d="M-30 -52 Q-28 -76 0 -76 Q28 -76 30 -52 Z" fill="#ff4d4d" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M22 -54 Q46 -58 56 -50 Q44 -46 24 -48 Z" fill="#e23b3b" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<circle cx="-2" cy="-63" r="6" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5"/>' +
      '</g>' +
    '</svg>';
  }

  /* ══════════ ดอตตี้ : รถแข่งที่มี "จุดทศนิยม" เป็นแกนพลัง ══════════ */
  function dotty(mood, cls) {
    return '<svg class="dotty mood-' + (mood || 'happy') + ' ' + (cls || '') + '" viewBox="0 0 170 92" aria-hidden="true">' +
      '<ellipse cx="86" cy="84" rx="70" ry="6" fill="rgba(43,36,64,.2)"/>' +
      '<g class="d-puffs"><circle cx="10" cy="62" r="6" fill="#e9e6f2"/><circle cx="2" cy="56" r="4" fill="#e9e6f2"/></g>' +
      '<g class="d-body">' +
        /* สปอยเลอร์ */
        '<path d="M14 40 L14 22 L38 22 L38 28 L22 28 L22 44" fill="#3e3a55" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<rect x="8" y="16" width="34" height="9" rx="3" fill="#ff4d4d" stroke="' + INK + '" stroke-width="3.5"/>' +
        /* ตัวถัง */
        '<path d="M16 66 Q12 46 30 42 L62 38 Q74 18 100 18 Q118 18 126 36 L150 42 Q166 46 164 60 Q163 70 150 70 L24 70 Q17 70 16 66 Z" fill="#ff5a4e" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M30 52 L150 52" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<path d="M34 46 Q60 42 70 40" stroke="#ff9b8f" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        /* กระจก + ตา */
        '<path d="M72 38 Q80 24 100 24 Q114 24 120 38 Z" fill="#bfe9ff" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g class="d-eye-open"><ellipse cx="104" cy="32" rx="9" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
          '<circle class="d-pupil" cx="107" cy="32" r="4.5" fill="' + INK + '"/><circle cx="108.5" cy="30" r="1.6" fill="#fff"/></g>' +
        '<path class="d-eye-happy" d="M96 34 Q104 25 112 34" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<g class="d-eye-dizzy" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"><path d="M104 32 m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -3 -4"/></g>' +
        /* แกนพลังจุดทศนิยม */
        '<circle class="d-core-glow" cx="88" cy="56" r="13" fill="#ffe27a" opacity=".55"/>' +
        '<circle cx="88" cy="56" r="9" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<circle cx="85" cy="53" r="2.6" fill="#fff8d6"/>' +
        /* ปาก */
        '<path class="d-m-smile" d="M146 58 Q152 64 158 58" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse class="d-m-o" cx="153" cy="60" rx="3.5" ry="4" fill="#8a2c3c" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path class="d-m-wavy" d="M145 61 q3 -3 6 0 q3 3 6 0" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="160" cy="49" r="3.5" fill="#fff6a8" stroke="' + INK + '" stroke-width="2"/>' +
      '</g>' +
      /* ล้อ */
      wheel(44, 70) + wheel(132, 70) +
    '</svg>';
  }
  function wheel(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="d-wheel">' +
      '<circle r="15" fill="#3e3a55" stroke="' + INK + '" stroke-width="4"/><circle r="7" fill="#d9d4e8" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M0 -12 V-7 M0 7 V12 M-12 0 H-7 M7 0 H12" stroke="#9a96ad" stroke-width="3" stroke-linecap="round"/></g></g>';
  }
  function carMini(color) {
    return '<svg class="car-mini" viewBox="0 0 60 30" aria-hidden="true">' +
      '<path d="M4 22 Q3 14 10 13 L22 12 Q26 5 35 5 Q42 5 45 11 L53 13 Q58 15 57 20 Q57 24 52 24 L8 24 Q4 24 4 22 Z" fill="' + (color || '#ff5a4e') + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M25 12 Q28 7 35 7 Q40 7 42 12 Z" fill="#bfe9ff" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<circle cx="31" cy="18" r="3.2" fill="#ffd23f" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<circle cx="15" cy="24" r="5" fill="#3e3a55" stroke="' + INK + '" stroke-width="2"/><circle cx="46" cy="24" r="5" fill="#3e3a55" stroke="' + INK + '" stroke-width="2"/></svg>';
  }
  /* รถคู่แข่ง (สีต่างกัน ใช้ในหน้าแข่ง) */
  function rival(color, num) {
    return '<svg class="rival" viewBox="0 0 120 64" aria-hidden="true">' +
      '<ellipse cx="60" cy="58" rx="50" ry="4" fill="rgba(43,36,64,.18)"/>' +
      '<path d="M8 44 Q6 30 20 28 L42 26 Q50 12 68 12 Q82 12 88 24 L106 28 Q116 31 114 41 Q113 48 104 48 L16 48 Q9 48 8 44 Z" fill="' + color + '" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M50 26 Q56 16 68 16 Q78 16 82 26 Z" fill="#bfe9ff" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="62" cy="37" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<text x="62" y="41.5" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="12" fill="' + INK + '">' + num + '</text>' +
      '<circle cx="30" cy="48" r="10" fill="#3e3a55" stroke="' + INK + '" stroke-width="3"/><circle cx="30" cy="48" r="4" fill="#d9d4e8"/>' +
      '<circle cx="92" cy="48" r="10" fill="#3e3a55" stroke="' + INK + '" stroke-width="3"/><circle cx="92" cy="48" r="4" fill="#d9d4e8"/></svg>';
  }

  /* ══════════ เจ้าจุดซน : ตัวป่วนที่ชอบย้ายจุดทศนิยม (ไม่น่ากลัว) ══════════ */
  function jud(mood) {
    let aura = '';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, r = i % 2 ? 34 : 44;
      aura += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1);
    }
    return '<svg class="jud mood-' + (mood || 'smirk') + '" viewBox="-56 -66 112 126" aria-hidden="true">' +
      '<ellipse cx="0" cy="54" rx="24" ry="4" fill="rgba(43,36,64,.15)"/>' +
      '<g class="j-float">' +
      '<path class="j-aura" d="' + aura + 'Z" fill="#e3d6ff" stroke="#b9a2ff" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M0 -30 Q-4 -44 6 -52" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="7" cy="-54" r="7" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="0" cy="0" r="31" fill="#8b5cf6" stroke="' + INK + '" stroke-width="4"/>' +
      '<ellipse cx="-10" cy="-14" rx="9" ry="5" fill="#b49bff" opacity=".7"/>' +
      /* คิ้ว + ตา */
      '<path class="j-brow" d="M-20 -14 L-6 -9 M20 -14 L6 -9" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g class="j-eyes-smirk"><ellipse cx="-11" cy="-2" rx="7" ry="7.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="11" cy="-2" rx="7" ry="7.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M-18 -4 H-4 M4 -4 H18" stroke="#8b5cf6" stroke-width="5"/>' +
        '<circle cx="-9" cy="0" r="3.4" fill="' + INK + '"/><circle cx="13" cy="0" r="3.4" fill="' + INK + '"/></g>' +
      '<g class="j-eyes-shock"><circle cx="-11" cy="-3" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="11" cy="-3" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="-11" cy="-3" r="2.6" fill="' + INK + '"/><circle cx="11" cy="-3" r="2.6" fill="' + INK + '"/></g>' +
      '<g class="j-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"><path d="M-17 -1 Q-11 -9 -5 -1"/><path d="M5 -1 Q11 -9 17 -1"/></g>' +
      /* ปาก */
      '<g class="j-m-grin"><path d="M-12 11 Q0 22 13 9" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M2 15 V11" stroke="' + INK + '" stroke-width="2"/></g>' +
      '<ellipse class="j-m-o" cx="0" cy="14" rx="5.5" ry="6.5" fill="#4a1d6e" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<path class="j-m-smile" d="M-10 11 Q0 19 10 11" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      /* มือ + จุดยักษ์ที่ขโมยมา */
      '<path d="M-29 8 Q-40 14 -38 24" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M29 8 Q40 2 42 -6" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
      '<circle class="j-dot" cx="44" cy="-14" r="9" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/>' +
      '</g></svg>';
  }

  /* ══════════ แบบจำลองปริมาณ: แผ่นพลัง 10x10 ══════════
     v = ค่าเป็น "ส่วนพัน" (0..999) สำหรับแผ่นเดียว
     ระบายตามลำดับ: แถวเต็ม (ส่วนสิบ) → ช่อง (ส่วนร้อย) → ชิ้นจิ๋วในช่องถัดไป (ส่วนพัน) */
  function grid(v, o) {
    o = o || {};
    const t = Math.floor(v / 100), h = Math.floor(v / 10) % 10, th = v % 10;
    const zoom = o.zoom != null ? o.zoom : th > 0;
    const W = zoom ? 176 : 104;
    let s = '<svg class="pgrid ' + (o.cls || '') + '" viewBox="0 0 ' + W + ' 104" aria-hidden="true">';
    s += '<rect x="2" y="2" width="100" height="100" rx="3" fill="#fffdf6"/>';
    if (t) s += '<rect class="g-t1" x="2" y="2" width="' + t * 10 + '" height="100" fill="' + COL.t1 + '"/>';
    if (h) s += '<rect class="g-t2" x="' + (2 + t * 10) + '" y="2" width="10" height="' + h * 10 + '" fill="' + COL.t2 + '"/>';
    if (th && t < 10) s += '<rect class="g-t3" x="' + (2 + t * 10) + '" y="' + (2 + h * 10) + '" width="' + th + '" height="10" fill="' + COL.t3 + '"/>';
    let lines = '';
    for (let i = 1; i < 10; i++) {
      lines += '<path d="M' + (2 + i * 10) + ' 2V102" stroke="rgba(43,36,64,.42)" stroke-width="0.9"/>';
      lines += '<path d="M2 ' + (2 + i * 10) + 'H102" stroke="rgba(43,36,64,.2)" stroke-width="0.6"/>';
    }
    s += lines + '<rect x="2" y="2" width="100" height="100" rx="3" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
    if (zoom) {
      const cx = 2 + t * 10, cy = 2 + h * 10;
      const zx = 116, zy = 26, zs = 54;
      s += '<rect x="' + cx + '" y="' + cy + '" width="10" height="10" fill="none" stroke="' + COL.t3 + '" stroke-width="1.8"/>';
      s += '<path d="M' + (cx + 10) + ' ' + (cy + 5) + ' L' + zx + ' ' + (zy + zs / 2) + '" stroke="' + COL.t3 + '" stroke-width="1.6" stroke-dasharray="3 2"/>';
      s += '<rect x="' + zx + '" y="' + zy + '" width="' + zs + '" height="' + zs + '" rx="4" fill="#fffdf6" stroke="' + INK + '" stroke-width="2.4"/>';
      for (let i = 0; i < 10; i++) {
        s += '<rect x="' + (zx + i * zs / 10) + '" y="' + zy + '" width="' + zs / 10 + '" height="' + zs + '" fill="' + (i < th ? COL.t3 : 'none') + '" stroke="rgba(43,36,64,.35)" stroke-width=".6"/>';
      }
      s += '<rect x="' + zx + '" y="' + zy + '" width="' + zs + '" height="' + zs + '" rx="4" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<text x="' + (zx + zs / 2) + '" y="' + (zy + zs + 14) + '" text-anchor="middle" font-size="9.5" font-family="Mali, sans-serif" font-weight="700" fill="' + COL.t3 + '">ส่องช่องนี้</text>';
    }
    return s + '</svg>';
  }
  function fullGrid(cls) {
    let s = '<svg class="pgrid full ' + (cls || '') + '" viewBox="0 0 104 104" aria-hidden="true"><rect x="2" y="2" width="100" height="100" rx="3" fill="' + COL.one + '"/>';
    for (let i = 1; i < 10; i++) s += '<path d="M' + (2 + i * 10) + ' 2V102M2 ' + (2 + i * 10) + 'H102" stroke="rgba(255,255,255,.35)" stroke-width="0.8"/>';
    return s + '<rect x="2" y="2" width="100" height="100" rx="3" fill="none" stroke="' + INK + '" stroke-width="2.6"/></svg>';
  }
  /* ปริมาณเต็ม: แผ่นเต็มตามจำนวนหน่วย + แผ่นที่ระบายบางส่วน */
  function qty(v, o) {
    o = o || {};
    const ones = Math.floor(v / 1000), rest = v % 1000;
    let h = '<div class="qty ' + (o.cls || '') + '">';
    if (ones) {
      /* จำนวนเต็มมาก ๆ ย่อเป็นแผ่นเดียว + ป้ายจำนวนแผ่น */
      if (ones > (/mini/.test(o.cls || '') ? 3 : 9)) h += '<div class="q-ones compact">' + fullGrid() + '<b class="q-x">x ' + ones + '</b></div>';
      else {
        h += '<div class="q-ones' + (ones > 4 ? ' many' : '') + '">';
        for (let i = 0; i < ones; i++) h += fullGrid();
        h += '</div>';
      }
    }
    if (rest || !ones || o.showEmpty) h += '<div class="q-part">' + grid(rest, { zoom: o.zoom }) + '</div>';
    return h + '</div>';
  }
  /* ไอคอนชิ้นพลัง (ใช้บนปุ่ม) */
  function piece(k) {
    const c = COL[k];
    const box = '<rect x="2" y="2" width="36" height="36" rx="3" fill="#fffdf6" stroke="' + INK + '" stroke-width="2"/>';
    let inner = '';
    if (k === 'one') inner = '<rect x="2" y="2" width="36" height="36" rx="3" fill="' + c + '" stroke="' + INK + '" stroke-width="2"/>';
    else if (k === 't1') inner = box + '<rect x="2" y="2" width="3.6" height="36" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/>';
    else if (k === 't2') inner = box + '<rect x="2" y="2" width="3.6" height="3.6" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/><circle cx="3.8" cy="3.8" r="7" fill="none" stroke="' + c + '" stroke-width="1.6"/>';
    else inner = box + '<rect x="2" y="2" width="1" height="3.6" fill="' + c + '"/><circle cx="3" cy="3.8" r="7" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-dasharray="2 1.5"/>';
    return '<svg class="piece-ic" viewBox="0 0 40 40" aria-hidden="true">' + inner + '</svg>';
  }

  /* ── โลโก้สนามบนแผนที่ ── */
  function badge(iconName, color) {
    return '<svg class="badge" viewBox="-40 -40 80 80" aria-hidden="true">' +
      '<circle r="36" fill="' + color + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle r="28" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-dasharray="5 5"/>' +
      '<g transform="translate(-15 -15) scale(1.25)" stroke="#fff" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[iconName] || '') + '</g></svg>';
  }
  function checker(w, h, cls) {
    let s = '<svg class="checker ' + (cls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><rect width="' + w + '" height="' + h + '" fill="#fff"/>';
    for (let y = 0; y < h; y += 6) for (let x = (y / 6) % 2 ? 6 : 0; x < w; x += 12) s += '<rect x="' + x + '" y="' + y + '" width="6" height="6" fill="' + INK + '"/>';
    return s + '</svg>';
  }
  function trophy(cls) {
    return '<svg class="trophy ' + (cls || '') + '" viewBox="-50 -60 100 120" aria-hidden="true">' +
      '<path d="M-26 -44 Q-50 -44 -46 -22 Q-42 -6 -20 -4" fill="none" stroke="' + INK + '" stroke-width="9"/>' +
      '<path d="M-26 -44 Q-50 -44 -46 -22 Q-42 -6 -20 -4" fill="none" stroke="#ffd23f" stroke-width="4"/>' +
      '<path d="M26 -44 Q50 -44 46 -22 Q42 -6 20 -4" fill="none" stroke="' + INK + '" stroke-width="9"/>' +
      '<path d="M26 -44 Q50 -44 46 -22 Q42 -6 20 -4" fill="none" stroke="#ffd23f" stroke-width="4"/>' +
      '<path d="M-30 -52 H30 V-30 Q30 4 0 8 Q-30 4 -30 -30 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M-20 -44 V-28 Q-20 -10 -6 -4" fill="none" stroke="#fff4b8" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="-7" y="8" width="14" height="16" fill="#f0b400" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="-26" y="24" width="52" height="18" rx="4" fill="#7c5cff" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="0" cy="-26" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="-26" r="4" fill="#ff5a3c"/>' +
      '</svg>';
  }

  DG.art = { INK, COL, icon, star, stars, zing, dotty, carMini, rival, jud, grid, fullGrid, qty, piece, badge, checker, trophy };
})();
