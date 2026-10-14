/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — Procedural SVG art (ไม่มีไฟล์ภาพ ไม่มีอิโมจิ)
   ตัวละคร : แมทแมท (หุ่นนักสำรวจวัสดุผู้นำทาง) / น้องช่าง (ผู้เล่น) / ตุ๊บตุ๊บ (ตุ่นสลับป้าย)
   ไอคอน  : เส้นไอคอน 24x24 + ตราสัญลักษณ์สมบัติวัสดุ + ดาว ธง ลูกโป่ง
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM = window.MM || {};
  const INK = '#22305a';
  let _uid = 0;
  const uid = p => (p || 'u') + (++_uid);
  const f1 = n => (+n).toFixed(1);

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
    back: '<path d="M9 6h11v12H9l-6-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9 17h6v4H9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    /* ไอคอนวิทยาศาสตร์ */
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
    magnify: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v6c0 4-2.5 6-6 6h-1.5c-2.5 0-4-1-5.5-3L4 14.5c-.7-1.2.9-2.7 2-1.6L8 15"/>',
    flame: '<path d="M12 21c4 0 7-2.8 7-6.6 0-2.6-1.6-4.4-3-6-.3 1.6-1.1 2.6-2.2 3 .2-3.6-1.5-6.6-4.3-9-.2 3.4-1.8 5.2-3.2 7.2C5.1 11.2 5 12.8 5 14.4 5 18.2 8 21 12 21z"/><path d="M12 21c-1.7 0-3-1.2-3-3 0-1.6 1.3-2.5 2-3.8.9 1 3 2.2 3 3.8 0 1.8-1.3 3-2 3z"/>',
    thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    bolt: '<path d="M13 2L5 13.5h6L10 22l9-12h-6.2z"/>',
    drop: '<path d="M12 3c3.6 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.4-6.4 6-11z"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z"/>',
    cube: '<path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z"/><path d="M12 12L4 7.2M12 12l8-4.8M12 12v9"/>',
    coil: '<path d="M4 7h11a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h11"/><path d="M3 7h1M20 19h1"/>',
    bent: '<path d="M3 17h7l4-9h7"/>',
    gem: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 9l3 11 3-11M10 4L9 9M14 4l1 5"/>',
    pillow: '<path d="M5 8c3-2 11-2 14 0 1.5 3 1.5 5 0 8-3 2-11 2-14 0-1.5-3-1.5-5 0-8z"/><path d="M8 12h8"/>',
    scratch: '<path d="M4 20L20 6"/><path d="M7 20L20 9M4 16L15 5"/>',
    press: '<path d="M12 3v9M8 9l4 4 4-4"/><path d="M5 17c2 3 12 3 14 0"/><path d="M4 20h16"/>',
    pull: '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>',
    wave: '<path d="M2 9c3-3 5 3 10 0s7 3 10 0M2 15c3-3 5 3 10 0s7 3 10 0"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    scale: '<path d="M12 4v16M6 20h12"/><path d="M4 8h16"/><path d="M4 8l-2 6a3 3 0 0 0 6 0zM20 8l-2 6a3 3 0 0 0 6 0z" transform="translate(-1 0)"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  /* ไอคอนทับด้วยเส้นทแยง (ใช้แทน "ไม่") */
  function iconNo(name, cls) {
    return '<svg class="ic ic-no ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') +
      '<path d="M4 4L20 20" stroke="#ff4d5e" stroke-width="3"/></svg>';
  }

  function star(on, cls) {
    const g = uid('sg');
    return '<svg class="star ' + (on ? 'on ' : '') + (cls || '') + '" viewBox="-12 -12 24 24" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#ffb21f"/></linearGradient></defs>' +
      '<path d="M0 -10.5 L3 -3.6 L10.4 -3.2 L4.7 1.6 L6.6 9 L0 5 L-6.6 9 L-4.7 1.6 L-10.4 -3.2 L-3 -3.6 Z" ' +
      'fill="' + (on ? 'url(#' + g + ')' : '#dfe6f3') + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
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
  function balloon(c) {
    const g = uid('bl');
    return '<svg class="balloon" viewBox="0 0 40 70" aria-hidden="true"><defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '"/></radialGradient></defs>' +
      '<path d="M20 4C9 4 4 13 4 22c0 11 9 19 16 22 7-3 16-11 16-22C36 13 31 4 20 4z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M17 46l3 4 3-4z" fill="' + c + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 50c-3 5 3 8 0 14" fill="none" stroke="' + INK + '" stroke-width="2"/></svg>';
  }
  function bunting(w, h) {
    let s = '', n = Math.max(6, Math.round(w / 34));
    const cols = ['#ff5a6e', '#ffd23f', '#3ccf9a', '#4aa8ff', '#ff8fc1', '#9a7bff'];
    for (let i = 0; i < n; i++) {
      const x0 = i * (w / n), x1 = (i + 1) * (w / n);
      s += '<path d="M' + f1(x0 + 2) + ' 2 L' + f1((x0 + x1) / 2) + ' ' + (h - 2) + ' L' + f1(x1 - 2) + ' 2 Z" fill="' + cols[i % cols.length] + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    return '<svg class="rband" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="M0 2 H' + w + '" stroke="' + INK + '" stroke-width="3"/>' + s + '</svg>';
  }

  /* ══════════ แมทแมท : หุ่นนักสำรวจวัสดุผู้นำทางสุดร่าเริง ══════════ */
  function mat(mood) {
    const g1 = uid('mb'), g2 = uid('mv'), g3 = uid('ms');
    return '<svg class="mat mood-' + (mood || 'happy') + '" viewBox="-86 -96 172 172" aria-hidden="true">' +
      '<defs><linearGradient id="' + g1 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff0d8"/><stop offset=".55" stop-color="#37cdb2"/><stop offset="1" stop-color="#1fa68f"/></linearGradient>' +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfeeff"/></linearGradient>' +
      '<linearGradient id="' + g3 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c4a7a"/><stop offset="1" stop-color="#0f2b4d"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="72" rx="46" ry="6.5" fill="rgba(34,48,90,.2)"/>' +
      /* ขา + รองเท้าบูทส้ม */
      '<g class="m-leg-l"><path d="M-20 38 V58" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M-20 38 V58" stroke="#ffe27a" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M-34 66 Q-34 57 -24 57 L-12 57 Q-4 57 -4 66 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M-32 62 H-6" stroke="#ffd7a0" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="m-leg-r"><path d="M20 38 V58" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M20 38 V58" stroke="#ffe27a" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M4 66 Q4 57 12 57 L24 57 Q34 57 34 66 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 62 H32" stroke="#ffd7a0" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="m-body">' +
        /* กระเป๋าเป้เครื่องมือ (โผล่หลังหัว) */
        '<g transform="rotate(-18 -44 -34)"><rect x="-58" y="-62" width="9" height="34" rx="4" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/><path d="M-56 -55h5M-56 -48h5M-56 -41h5" stroke="' + INK + '" stroke-width="1.8"/></g>' +
        '<g transform="rotate(16 46 -34)"><rect x="48" y="-64" width="8" height="36" rx="4" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3"/><circle cx="52" cy="-66" r="8" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3"/></g>' +
        /* แขน */
        '<g class="m-arms-down"><path d="M-48 18 Q-72 26 -68 48" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-48 18 Q-72 26 -68 48" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/><circle cx="-68" cy="51" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M48 18 Q72 26 68 48" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M48 18 Q72 26 68 48" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/><circle cx="68" cy="51" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/></g>' +
        '<g class="m-arms-up"><path d="M-48 12 Q-78 8 -72 -26" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-48 12 Q-78 8 -72 -26" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/><circle cx="-72" cy="-30" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M48 12 Q78 8 72 -26" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M48 12 Q78 8 72 -26" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/><circle cx="72" cy="-30" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/></g>' +
        '<g class="m-arms-think"><path d="M-48 18 Q-72 26 -68 48" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-48 18 Q-72 26 -68 48" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/><circle cx="-68" cy="51" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M48 18 Q78 12 56 -8" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M48 18 Q78 12 56 -8" fill="none" stroke="#37cdb2" stroke-width="6" stroke-linecap="round"/>' +
          '<circle cx="52" cy="-12" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/><circle cx="64" cy="-24" r="10" fill="rgba(207,238,255,.8)" stroke="' + INK + '" stroke-width="3"/><path d="M57 -17 L52 -12" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/></g>' +
        /* ลำตัว + จอหน้าท้อง */
        '<rect x="-36" y="6" width="72" height="42" rx="16" fill="url(#' + g1 + ')" stroke="' + INK + '" stroke-width="4.4"/>' +
        '<rect x="-24" y="14" width="48" height="26" rx="8" fill="url(#' + g3 + ')" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="m-screen"><rect x="-19" y="19" width="10" height="10" rx="2.5" fill="#ff6b6b"/><rect x="-5" y="19" width="10" height="10" rx="2.5" fill="#ffd23f"/><rect x="9" y="19" width="10" height="10" rx="2.5" fill="#4aa8ff"/>' +
          '<path d="M-19 36 Q-10 30 -2 35 T19 34" fill="none" stroke="#7ff0d8" stroke-width="2.4" stroke-linecap="round"/></g>' +
        /* หัว */
        '<rect x="-50" y="-62" width="100" height="78" rx="32" fill="url(#' + g1 + ')" stroke="' + INK + '" stroke-width="4.6"/>' +
        '<path d="M-38 -50 Q-30 -58 -14 -58" fill="none" stroke="#c5fff2" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<circle cx="-52" cy="-24" r="9" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.4"/><circle cx="52" cy="-24" r="9" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.4"/>' +
        /* แว่น/กระจกหน้า */
        '<rect x="-40" y="-48" width="80" height="52" rx="22" fill="url(#' + g2 + ')" stroke="' + INK + '" stroke-width="3.8"/>' +
        '<path d="M-30 -40 Q-22 -45 -10 -44" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".95"/>' +
        '<ellipse cx="-28" cy="-6" rx="8" ry="4.6" fill="#ff9fc0" opacity=".85"/><ellipse cx="28" cy="-6" rx="8" ry="4.6" fill="#ff9fc0" opacity=".85"/>' +
        '<g class="m-eyes-open"><ellipse cx="-16" cy="-24" rx="9.5" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="16" cy="-24" rx="9.5" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle class="m-pupil" cx="-14" cy="-22" r="6" fill="' + INK + '"/><circle class="m-pupil" cx="18" cy="-22" r="6" fill="' + INK + '"/>' +
          '<circle cx="-11.5" cy="-25.5" r="2.3" fill="#fff"/><circle cx="20.5" cy="-25.5" r="2.3" fill="#fff"/></g>' +
        '<g class="m-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"><path d="M-27 -22 Q-16 -36 -5 -22"/><path d="M5 -22 Q16 -36 27 -22"/></g>' +
        '<g class="m-eyes-wow"><circle cx="-16" cy="-24" r="11.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="16" cy="-24" r="11.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-16" cy="-24" r="4.4" fill="' + INK + '"/><circle cx="16" cy="-24" r="4.4" fill="' + INK + '"/></g>' +
        '<path class="m-m-smile" d="M-8 -8 Q0 1 8 -8" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<g class="m-m-open"><path d="M-10 -9 Q0 -11 10 -9 Q8 3 0 3 Q-8 3 -10 -9 Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/><path d="M-4 0 Q0 -5 4 0 Q2 3 0 3 Q-2 3 -4 0Z" fill="#ff8f9f"/></g>' +
        '<g class="m-m-o"><ellipse cx="0" cy="-3" rx="5.5" ry="7" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3.2"/></g>' +
        '<path class="m-m-flat" d="M-7 -4 Q0 -7 7 -4" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        /* เสาอากาศ + หลอดไฟ */
        '<path d="M0 -62 V-78" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<g class="m-bulb"><circle cx="0" cy="-86" r="9" fill="#fff6a8" stroke="' + INK + '" stroke-width="3.4"/><circle cx="0" cy="-86" r="9" fill="#ffd23f" opacity=".55"/><path d="M-3 -88 Q0 -92 3 -88" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '</g></svg>';
  }

  /* ══════════ ตุ๊บตุ๊บ : ตุ่นจอมสลับป้าย (ไม่น่ากลัว) ══════════ */
  function tub(mood) {
    const g = uid('tg'), gh = uid('th');
    return '<svg class="tub mood-' + (mood || 'smirk') + '" viewBox="-70 -84 140 150" aria-hidden="true">' +
      '<defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#c79a74"/><stop offset=".55" stop-color="#8f6446"/><stop offset="1" stop-color="#5f3f2b"/></radialGradient>' +
      '<linearGradient id="' + gh + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe56b"/><stop offset="1" stop-color="#ffb21f"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="58" rx="30" ry="4.5" fill="rgba(34,48,90,.16)"/>' +
      '<g class="t-float">' +
        /* ตัว */
        '<ellipse cx="0" cy="12" rx="40" ry="38" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.5"/>' +
        '<ellipse cx="0" cy="26" rx="22" ry="20" fill="#e8c9a6" stroke="' + INK + '" stroke-width="3" opacity=".95"/>' +
        '<path d="M-16 24 Q0 34 16 24" fill="none" stroke="#c9a37c" stroke-width="2.6" stroke-linecap="round"/>' +
        /* หมวกคนงานเหมือง */
        '<path d="M-34 -14 Q-34 -50 0 -50 Q34 -50 34 -14 Z" fill="url(#' + gh + ')" stroke="' + INK + '" stroke-width="4.2" stroke-linejoin="round"/>' +
        '<rect x="-40" y="-17" width="80" height="9" rx="4.5" fill="#ffb21f" stroke="' + INK + '" stroke-width="3.6"/>' +
        '<path d="M-22 -38 Q-14 -46 -2 -46" fill="none" stroke="#fff6c2" stroke-width="4.4" stroke-linecap="round"/>' +
        '<g class="t-lamp"><circle cx="0" cy="-34" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3.4"/><circle cx="0" cy="-34" r="5" fill="#fff6a8"/></g>' +
        /* แว่นหนา + ตา */
        '<circle cx="-15" cy="-1" r="13" fill="#e6f7ff" stroke="' + INK + '" stroke-width="3.4"/><circle cx="15" cy="-1" r="13" fill="#e6f7ff" stroke="' + INK + '" stroke-width="3.4"/><path d="M-2 -1 H2" stroke="' + INK + '" stroke-width="3.4"/>' +
        '<path class="t-brow" d="M-26 -16 L-8 -10 M26 -18 L8 -11" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"/>' +
        '<g class="t-eyes-smirk"><circle cx="-14" cy="0" r="4.6" fill="' + INK + '"/><circle cx="16" cy="-1" r="4" fill="' + INK + '"/><circle cx="-12.4" cy="-1.6" r="1.4" fill="#fff"/><circle cx="17.4" cy="-2.6" r="1.2" fill="#fff"/></g>' +
        '<g class="t-eyes-shock"><circle cx="-15" cy="-1" r="9" fill="#fff"/><circle cx="15" cy="-1" r="9" fill="#fff"/><circle cx="-15" cy="-1" r="3" fill="' + INK + '"/><circle cx="15" cy="-1" r="3" fill="' + INK + '"/></g>' +
        '<g class="t-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"><path d="M-22 1 Q-15 -9 -8 1"/><path d="M8 1 Q15 -9 22 1"/></g>' +
        /* จมูกดาวสีชมพู */
        '<ellipse cx="0" cy="17" rx="13" ry="9" fill="#ff8fb0" stroke="' + INK + '" stroke-width="3.4"/><ellipse cx="-4" cy="14" rx="4" ry="2.4" fill="#ffd0e0"/>' +
        '<g class="t-m-grin"><path d="M-14 28 Q0 42 15 27 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/><path d="M-4 35 V29 M5 35 V28" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<ellipse class="t-m-o" cx="0" cy="32" rx="6" ry="7" fill="#5a2250" stroke="' + INK + '" stroke-width="3"/>' +
        '<path class="t-m-smile" d="M-10 28 Q0 38 10 28" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>' +
        /* กรงเล็บ + ป้ายสลับ */
        '<g class="t-paw-l"><circle cx="-44" cy="30" r="10" fill="#a87a58" stroke="' + INK + '" stroke-width="3.4"/><path d="M-50 36 l-3 7M-44 39 l-1 8M-38 36 l2 7" stroke="#ff8fb0" stroke-width="3.4" stroke-linecap="round"/></g>' +
        '<g class="t-sign"><path d="M44 28 L50 -22" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>' +
          '<rect x="34" y="-42" width="38" height="26" rx="5" fill="#fff3d1" stroke="' + INK + '" stroke-width="3.2" transform="rotate(8 53 -29)"/>' +
          '<path d="M41 -33 l6 8 l6 -8 l6 8" fill="none" stroke="#ff5a6e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" transform="rotate(8 53 -29)"/></g>' +
        '<circle cx="44" cy="30" r="10" fill="#a87a58" stroke="' + INK + '" stroke-width="3.4"/><path d="M50 36 l3 7M44 39 l1 8M38 36 l-2 7" stroke="#ff8fb0" stroke-width="3.4" stroke-linecap="round"/>' +
      '</g></svg>';
  }

  /* ══════════ น้องช่าง : ผู้เล่น (หมวกนิรภัยเหลือง เอี๊ยมส้ม) ══════════ */
  function kid(mood, cls) {
    const g = uid('kg');
    return '<svg class="kid mood-' + (mood || 'happy') + ' ' + (cls || '') + '" viewBox="0 0 110 136" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe56b"/><stop offset="1" stop-color="#ffb21f"/></linearGradient></defs>' +
      '<ellipse cx="55" cy="131" rx="30" ry="4.6" fill="rgba(34,48,90,.2)"/>' +
      '<g class="k-leg-l"><path d="M44 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M44 100 V118" stroke="#ff8a3c" stroke-width="6" stroke-linecap="round"/><path d="M32 128 Q32 119 41 119 L50 119 Q56 119 56 128 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M33 124 H55" stroke="#3aa0ff" stroke-width="2.4"/></g>' +
      '<g class="k-leg-r"><path d="M66 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M66 100 V118" stroke="#ff8a3c" stroke-width="6" stroke-linecap="round"/><path d="M54 128 Q54 119 62 119 L71 119 Q78 119 78 128 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M55 124 H77" stroke="#3aa0ff" stroke-width="2.4"/></g>' +
      '<g class="k-body">' +
        '<path d="M26 84 Q10 90 12 106" class="k-arm-d" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 84 Q10 90 12 106" class="k-arm-d" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle class="k-arm-d" cx="12" cy="108" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M84 84 Q100 90 98 106" class="k-arm-d" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 84 Q100 90 98 106" class="k-arm-d" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle class="k-arm-d" cx="98" cy="108" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="k-arm-u"><path d="M26 82 Q6 76 8 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 82 Q6 76 8 54" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle cx="8" cy="51" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M84 82 Q104 76 102 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 82 Q104 76 102 54" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle cx="102" cy="51" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<path d="M28 76 Q28 68 38 68 L72 68 Q82 68 82 76 L82 104 Q82 110 76 110 L34 110 Q28 110 28 104 Z" fill="#ff8a3c" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M40 68 V84 M70 68 V84" stroke="' + INK + '" stroke-width="3.4"/><rect x="42" y="84" width="26" height="20" rx="4" fill="#ffb27a" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="40" cy="70" r="3.2" fill="#ffe56b" stroke="' + INK + '" stroke-width="1.8"/><circle cx="70" cy="70" r="3.2" fill="#ffe56b" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<path d="M50 94 h10 M55 90 v8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="55" cy="40" r="32" fill="#ffd7b4" stroke="' + INK + '" stroke-width="4.4"/>' +
        '<path d="M26 40 Q26 26 36 20 L36 32 Q30 36 28 46 Z" fill="#3b2a50" stroke="' + INK + '" stroke-width="3"/><path d="M84 40 Q84 26 74 20 L74 32 Q80 36 82 46 Z" fill="#3b2a50" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="34" cy="48" rx="6.5" ry="4.4" fill="#ff8fb0" opacity=".8"/><ellipse cx="76" cy="48" rx="6.5" ry="4.4" fill="#ff8fb0" opacity=".8"/>' +
        '<g class="k-eyes-open"><ellipse cx="44" cy="41" rx="6.6" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><ellipse cx="66" cy="41" rx="6.6" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/>' +
          '<circle class="k-pupil" cx="45" cy="42.5" r="4" fill="' + INK + '"/><circle class="k-pupil" cx="67" cy="42.5" r="4" fill="' + INK + '"/><circle cx="46.4" cy="40.5" r="1.4" fill="#fff"/><circle cx="68.4" cy="40.5" r="1.4" fill="#fff"/></g>' +
        '<g class="k-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"><path d="M37 44 Q44 34 51 44"/><path d="M59 44 Q66 34 73 44"/></g>' +
        '<g class="k-eyes-wow"><circle cx="44" cy="41" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><circle cx="66" cy="41" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><circle cx="44" cy="41" r="3" fill="' + INK + '"/><circle cx="66" cy="41" r="3" fill="' + INK + '"/></g>' +
        '<path class="k-m-smile" d="M45 56 Q55 66 65 56" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>' +
        '<g class="k-m-open"><path d="M44 55 Q55 53 66 55 Q64 68 55 68 Q46 68 44 55 Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></g>' +
        /* หมวกนิรภัย + ไฟคาดหัว */
        '<path d="M20 34 Q20 4 55 4 Q90 4 90 34 Q55 26 20 34 Z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.4" stroke-linejoin="round"/>' +
        '<path d="M14 36 Q55 24 96 38 Q96 44 90 42 Q55 32 20 44 Q12 44 14 36 Z" fill="#ffc42e" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M55 4 V26" stroke="' + INK + '" stroke-width="2.4" opacity=".5"/><path d="M38 10 Q46 6 54 8" fill="none" stroke="#fff6c2" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="44" y="12" width="22" height="13" rx="6" fill="#e6f7ff" stroke="' + INK + '" stroke-width="3"/><circle cx="55" cy="18.5" r="3.4" fill="#fff6a8" stroke="' + INK + '" stroke-width="1.8"/>' +
      '</g></svg>';
  }

  /* ══════════ ตราสัญลักษณ์สมบัติ / สถานะ (ไอคอนสี) ══════════ */
  const PROPS = {
    hard:    { n: 'ความแข็ง', icon: 'gem', c: '#3b82f6', yes: 'แข็ง', no: 'นิ่ม' },
    elastic: { n: 'สภาพยืดหยุ่น', icon: 'coil', c: '#ec4899', yes: 'ยืดหยุ่น', no: 'ไม่ยืดหยุ่น' },
    heat:    { n: 'การนำความร้อน', icon: 'flame', c: '#f97316', yes: 'นำความร้อนดี', no: 'นำความร้อนไม่ดี' },
    elec:    { n: 'การนำไฟฟ้า', icon: 'bolt', c: '#eab308', yes: 'นำไฟฟ้า', no: 'ไม่นำไฟฟ้า' }
  };
  const STATES = {
    solid:  { n: 'ของแข็ง', icon: 'cube', c: '#8b5cf6' },
    liquid: { n: 'ของเหลว', icon: 'drop', c: '#0ea5e9' },
    gas:    { n: 'แก๊ส', icon: 'cloud', c: '#14b8a6' }
  };
  /* ป้ายกลมของสมบัติ : val true/false/null(ยังไม่รู้) */
  function propBadge(kind, val, small) {
    const P = PROPS[kind];
    if (val == null) return '<span class="pbadge unk' + (small ? ' sm' : '') + '" title="ยังไม่ได้ทดลอง">?</span>';
    const ic = val ? icon(kind === 'hard' ? 'gem' : P.icon) : (kind === 'hard' ? icon('pillow') : iconNo(P.icon));
    return '<span class="pbadge ' + (val ? 'yes' : 'no') + (small ? ' sm' : '') + '" style="--pc:' + P.c + '">' + ic + '</span>';
  }

  /* ───────── ป้ายแผนที่ (เหรียญกลมของแต่ละพื้นที่) ───────── */
  function badge(zoneId, color) {
    const clip = uid('bc');
    const scene = MM.art.zoneArt ? MM.art.zoneArt(zoneId, true) : '';
    return '<svg class="badge" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="' + clip + '"><circle cx="50" cy="50" r="44"/></clipPath></defs>' +
      '<circle cx="50" cy="50" r="47" fill="' + color + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<g clip-path="url(#' + clip + ')"><svg x="-10" y="-2" width="120" height="104" viewBox="20 6 160 140" preserveAspectRatio="xMidYMid slice">' + scene + '</svg></g>' +
      '<circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-dasharray="3 6"/></svg>';
  }

  MM.art = Object.assign(MM.art || {}, {
    INK, uid, f1, icon, iconNo, star, stars, flag, balloon, bunting,
    mat, tub, kid, PROPS, STATES, propBadge, badge
  });
})();
