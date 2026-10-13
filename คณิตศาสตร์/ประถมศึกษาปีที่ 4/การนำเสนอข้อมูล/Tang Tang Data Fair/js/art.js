/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — งานภาพ SVG ทั้งหมด (ตัวละคร / ไอคอน / ของใช้ / ซุ้มงาน)
   ไม่มีไฟล์รูปภาพ ไม่มีอิโมจิ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT = window.TT || {};
  const INK = '#2a2350';

  /* ── แท่งแท่ง : เสาแท่งสีส้ม มีขีดแกนตั้งข้างตัว ── */
  function tang(mood) {
    mood = mood || 'happy';
    const E = '#fff';
    const eyes = {
      happy: '<path d="M-17 -26 q6 -9 12 0 M5 -26 q6 -9 12 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      cheer: '<path d="M-17 -24 q6 -10 12 0 M5 -24 q6 -10 12 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      wow: '<circle cx="-11" cy="-26" r="8" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="11" cy="-26" r="8" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-11" cy="-26" r="3.6" fill="' + INK + '"/><circle cx="11" cy="-26" r="3.6" fill="' + INK + '"/>',
      think: '<circle cx="-11" cy="-26" r="7.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-8" cy="-29" r="3.4" fill="' + INK + '"/><path d="M4 -26 h14" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      oops: '<path d="M-19 -33 l13 -5 M19 -33 l-13 -5" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/><circle cx="-11" cy="-25" r="4.2" fill="' + INK + '"/><circle cx="11" cy="-25" r="4.2" fill="' + INK + '"/>',
      talk: '<circle cx="-11" cy="-26" r="7.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="11" cy="-26" r="7.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-10" cy="-27" r="3.6" fill="' + INK + '"/><circle cx="12" cy="-27" r="3.6" fill="' + INK + '"/><circle cx="-8.8" cy="-28.4" r="1.3" fill="#fff"/><circle cx="13.2" cy="-28.4" r="1.3" fill="#fff"/>'
    }[mood] || '';
    const mouth = {
      happy: '<path d="M-9 -9 q9 10 18 0" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>',
      cheer: '<path d="M-12 -12 q12 16 24 0 z" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>',
      wow: '<ellipse cx="0" cy="-8" rx="5.5" ry="7" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3"/>',
      think: '<path d="M-6 -8 h12" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      oops: '<path d="M-8 -5 q8 -7 16 0" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      talk: '<path class="t-mouth" d="M-9 -11 q9 11 18 0 z" fill="#ff7a8a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
    }[mood] || '';
    const up = mood === 'cheer' || mood === 'wow';
    const aL = up ? 'M-30 6 L-48 -22' : 'M-30 8 L-47 22';
    const aR = up ? 'M30 6 L48 -22' : 'M30 8 L47 20';
    const hL = up ? [-48, -22] : [-47, 22], hR = up ? [48, -22] : [47, 20];
    let ticks = '';
    [-8, 12, 32].forEach(y => { ticks += '<path d="M-30 ' + y + ' h10" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>'; });
    return '<svg class="tang mood-' + mood + '" viewBox="-62 -92 124 172" aria-hidden="true">' +
      '<ellipse cx="0" cy="74" rx="32" ry="6" fill="rgba(0,0,0,.18)"/>' +
      '<g class="t-body">' +
        '<g class="t-arm t-arm-l"><path d="' + aL + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="' + aL + '" stroke="#ffb86b" stroke-width="3.6" stroke-linecap="round"/><circle cx="' + hL[0] + '" cy="' + hL[1] + '" r="7.5" fill="#ffd36a" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<g class="t-arm t-arm-r"><path d="' + aR + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="' + aR + '" stroke="#ffb86b" stroke-width="3.6" stroke-linecap="round"/><circle cx="' + hR[0] + '" cy="' + hR[1] + '" r="7.5" fill="#ffd36a" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<ellipse cx="-14" cy="68" rx="11" ry="7" fill="#e86a1c" stroke="' + INK + '" stroke-width="3"/><ellipse cx="14" cy="68" rx="11" ry="7" fill="#e86a1c" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="-32" y="-58" width="64" height="124" rx="26" fill="#ff9a3d" stroke="' + INK + '" stroke-width="4.5"/>' +
        '<path d="M-22 -50 q10 -6 24 -5" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>' +
        '<g class="t-ticks">' + ticks + '</g>' +
        '<rect x="-34" y="-1" width="68" height="13" rx="6" fill="#20b2a0" stroke="' + INK + '" stroke-width="3.5"/><path d="M12 10 l6 16 l9 -3 l-4 -13" fill="#20b2a0" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
        '<path d="M-6 -62 q-2 -14 8 -20 q10 -4 14 4 q-8 2 -12 8 z" fill="#3fd6a8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" class="t-sprout"/>' +
        eyes + mouth +
        '<circle cx="-24" cy="-12" r="4.6" fill="#ff7a8a" opacity=".6"/><circle cx="24" cy="-12" r="4.6" fill="#ff7a8a" opacity=".6"/>' +
      '</g></svg>';
  }

  /* ── มึนมึน : เมฆม่วงขี้เล่น ชอบทำข้อมูลมั่ว ── */
  function muen(mood) {
    mood = mood || 'sneaky';
    const circles = [[-34, 6, 24], [0, -14, 32], [34, 6, 24], [-14, 22, 24], [16, 22, 24]];
    const outline = circles.map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="9"/>').join('');
    const fill = circles.map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#b7a3ff"/>').join('');
    const swirl = (x, y) => '<path d="M' + x + ' ' + y + ' m0 -1 a2 2 0 1 1 2 2 a4 4 0 1 1 -5 -4 a7 7 0 1 1 8 8" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>';
    const eyes = {
      sneaky: '<ellipse cx="-14" cy="0" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="14" cy="0" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + swirl(-14, 0) + swirl(14, 0) + '<path d="M-24 -14 l16 5 M24 -14 l-16 5" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>',
      shock: '<circle cx="-14" cy="-1" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="14" cy="-1" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-14" cy="-1" r="3" fill="' + INK + '"/><circle cx="14" cy="-1" r="3" fill="' + INK + '"/>',
      sad: '<path d="M-22 2 q8 -8 16 0 M6 2 q8 -8 16 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-23 -10 l14 -4 M23 -10 l-14 -4" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      happy: '<path d="M-22 2 q8 -10 16 0 M6 2 q8 -10 16 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[mood];
    const mouth = {
      sneaky: '<path d="M-14 17 q14 12 28 0" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>',
      shock: '<ellipse cx="0" cy="22" rx="7" ry="8" fill="#5a2a7a" stroke="' + INK + '" stroke-width="3"/>',
      sad: '<path d="M-9 24 q9 -8 18 0" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      happy: '<path d="M-12 16 q12 13 24 0 z" fill="#5a2a7a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
    }[mood];
    return '<svg class="muen mood-' + mood + '" viewBox="-76 -66 152 124" aria-hidden="true">' +
      '<ellipse cx="0" cy="52" rx="40" ry="5" fill="rgba(0,0,0,.14)"/>' +
      '<g class="m-body">' + outline + fill +
        '<path d="M-48 -4 q4 -12 16 -14 M-12 -36 q10 -6 22 -2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>' +
        eyes + mouth +
        '<circle cx="-30" cy="16" r="5" fill="#ff8fb1" opacity=".7"/><circle cx="30" cy="16" r="5" fill="#ff8fb1" opacity=".7"/>' +
        '<g class="m-q" fill="' + INK + '" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20"><text x="-62" y="-36">?</text><text x="52" y="-30">?</text></g>' +
      '</g></svg>';
  }

  /* ── ไอคอนเส้น ── */
  const I = {
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    book: '<path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.6 1.6 0 0 0-1.6-1.6H4z"/><path d="M20 4.5h-6a2 2 0 0 0-2 2V20a1.6 1.6 0 0 1 1.6-1.6H20z"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    speaker: '<path d="M4 9.5h4l5-4v13l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
    star: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
    eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7M9.5 17h5"/>',
    medal: '<circle cx="12" cy="15" r="5"/><path d="M8 3l4 7 4-7"/><path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
    bars: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3.4" height="9" rx="1"/><rect x="10.3" y="5" width="3.4" height="15" rx="1"/><rect x="15.1" y="13" width="3.4" height="7" rx="1"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M9.5 4.5v15M15 4.5v15"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 8"/>',
    back: '<path d="M4 6h14a3 3 0 0 1 0 6H8"/><path d="M8 3L4 6l4 3"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    teacher: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || '') + '</svg>';
  }
  function star(on) {
    return '<svg class="st ' + (on ? 'on' : 'off') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.5 1.2 6.5L12 17.2l-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  /* ── ของในหมวดข้อมูล (วาดกลางจุด 0,0 ขนาดประมาณ 40x40) ── */
  const S = ' stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const T = {
    apple: '<path d="M0 -10 q-16 -6 -17 10 q0 17 12 18 q5 1 5 -1 q0 2 5 1 q12 -1 12 -18 q-1 -16 -17 -10z" fill="#ff5c5c"' + S + '/><path d="M0 -10 q0 -6 3 -10" fill="none"' + S + '/><path d="M2 -14 q8 -8 14 -3 q-6 7 -14 3z" fill="#3fd6a8"' + S + '/>',
    banana: '<path d="M-18 -8 q4 22 26 22 q8 0 12 -4 q-6 -2 -10 -8 q-6 -10 -8 -18 q-7 0 -20 8z" fill="#ffd93f"' + S + '/><path d="M-18 -8 l-3 -5" fill="none"' + S + '/>',
    orange: '<circle cx="0" cy="3" r="16" fill="#ff9a3d"' + S + '/><path d="M-5 -12 q4 -6 11 -4 q-3 6 -11 4z" fill="#3fd6a8"' + S + '/><path d="M-8 -4 q3 -4 7 -4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>',
    grape: '<g fill="#9b6cf0"' + S + '><circle cx="-9" cy="-4" r="8"/><circle cx="9" cy="-4" r="8"/><circle cx="0" cy="6" r="8"/><circle cx="-9" cy="12" r="0"/><circle cx="0" cy="-12" r="0"/></g><path d="M0 -12 q0 -8 6 -9 q-1 8 -6 9z" fill="#3fd6a8"' + S + '/>',
    melon: '<path d="M-18 -4 a18 18 0 0 0 36 0z" fill="#ff6b7a"' + S + '/><path d="M-18 -4 a18 18 0 0 0 36 0" fill="none" stroke="#2fa86b" stroke-width="5" stroke-linecap="round"/><g fill="' + INK + '"><ellipse cx="-7" cy="3" rx="1.6" ry="2.6"/><ellipse cx="2" cy="8" rx="1.6" ry="2.6"/><ellipse cx="9" cy="2" rx="1.6" ry="2.6"/></g>',
    cherry: '<path d="M-8 6 q4 -16 12 -22 M10 8 q0 -16 2 -24" fill="none"' + S + '/><circle cx="-8" cy="10" r="9" fill="#e0344e"' + S + '/><circle cx="11" cy="12" r="9" fill="#e0344e"' + S + '/><path d="M12 -16 q8 -3 11 3 q-8 3 -11 -3z" fill="#3fd6a8"' + S + '/>',
    cat: '<path d="M-16 -4 l-2 -16 l12 8 q6 -2 12 0 l12 -8 l-2 16 q4 6 -2 14 q-8 8 -18 8 q-10 0 -16 -8 q-6 -8 -2 -14z" fill="#b8a99a"' + S + '/><circle cx="-7" cy="0" r="2.6" fill="' + INK + '"/><circle cx="7" cy="0" r="2.6" fill="' + INK + '"/><path d="M-2 6 l2 2 l2 -2z" fill="#ff8fb1"' + S + '/><path d="M-12 6 l-9 -2 M-12 9 l-9 3 M12 6 l9 -2 M12 9 l9 3" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>',
    dog: '<path d="M-12 -12 q-12 -4 -14 10 q0 10 6 12 q2 -10 8 -14z M12 -12 q12 -4 14 10 q0 10 -6 12 q-2 -10 -8 -14z" fill="#9a6a3f"' + S + '/><circle cx="0" cy="3" r="16" fill="#e8c28f"' + S + '/><circle cx="-6" cy="-1" r="2.6" fill="' + INK + '"/><circle cx="6" cy="-1" r="2.6" fill="' + INK + '"/><ellipse cx="0" cy="7" rx="5" ry="3.6" fill="' + INK + '"/>',
    rabbit: '<ellipse cx="-7" cy="-14" rx="4.6" ry="12" fill="#fff"' + S + '/><ellipse cx="7" cy="-14" rx="4.6" ry="12" fill="#fff"' + S + '/><ellipse cx="-7" cy="-13" rx="1.8" ry="8" fill="#ffb3c9"/><ellipse cx="7" cy="-13" rx="1.8" ry="8" fill="#ffb3c9"/><circle cx="0" cy="6" r="15" fill="#fff"' + S + '/><circle cx="-6" cy="3" r="2.4" fill="' + INK + '"/><circle cx="6" cy="3" r="2.4" fill="' + INK + '"/><path d="M-2 9 l2 2 l2 -2z" fill="#ff8fb1"' + S + '/>',
    fish: '<path d="M-18 0 q10 -16 24 -8 l12 -8 l0 32 l-12 -8 q-14 8 -24 -8z" fill="#4ab0ff"' + S + '/><circle cx="-8" cy="-3" r="2.4" fill="' + INK + '"/><path d="M-2 -6 q3 6 0 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
    duck: '<path d="M-16 4 q-2 -22 14 -22 q14 0 14 12 l10 2 l-10 4 q0 12 -14 14 q-14 0 -14 -10z" fill="#ffd93f"' + S + '/><circle cx="-2" cy="-8" r="2.4" fill="' + INK + '"/><path d="M12 -6 l12 3 l-12 4z" fill="#ff9a3d"' + S + '/>',
    ball: '<circle cx="0" cy="0" r="17" fill="#fff"' + S + '/><path d="M0 -6 l6 4 l-2 7 h-8 l-2 -7z" fill="' + INK + '"/><path d="M0 -6 v-11 M6 -2 l11 -3 M4 5 l7 9 M-4 5 l-7 9 M-6 -2 l-11 -3" fill="none" stroke="' + INK + '" stroke-width="2"/>',
    kite: '<path d="M0 -20 l14 14 l-14 24 l-14 -24z" fill="#ff6b7a"' + S + '/><path d="M0 -20 v42 M-14 -6 h28" stroke="#fff" stroke-width="2" opacity=".8"/><path d="M0 18 q-6 6 0 10 q6 4 0 10" fill="none"' + S + '/>',
    book: '<path d="M-16 -14 h22 a6 6 0 0 1 6 6 v22 h-24 a4 4 0 0 1 -4 -4z" fill="#4a7bf0"' + S + '/><path d="M-12 14 h24" stroke="#fff" stroke-width="3"/><rect x="-8" y="-9" width="14" height="8" rx="2" fill="#ffd93f"' + S + '/>',
    drum: '<ellipse cx="0" cy="-8" rx="17" ry="7" fill="#ffe7a8"' + S + '/><path d="M-17 -8 v18 q0 7 17 7 q17 0 17 -7 v-18" fill="#e0344e"' + S + '/><path d="M-9 -2 l6 14 l6 -14 l6 14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
    flower: '<g fill="#ff8fb1"' + S + '><circle cx="0" cy="-11" r="7"/><circle cx="11" cy="-3" r="7"/><circle cx="7" cy="10" r="7"/><circle cx="-7" cy="10" r="7"/><circle cx="-11" cy="-3" r="7"/></g><circle cx="0" cy="0" r="6.5" fill="#ffd93f"' + S + '/>',
    cookie: '<circle cx="0" cy="0" r="17" fill="#e8b46e"' + S + '/><g fill="#6b3f1d"><circle cx="-6" cy="-6" r="2.6"/><circle cx="7" cy="-3" r="2.6"/><circle cx="-2" cy="7" r="2.6"/><circle cx="9" cy="9" r="2"/><circle cx="-10" cy="4" r="2"/></g>',
    cake: '<path d="M-18 8 v-14 l36 -6 v20 q0 6 -18 6 q-18 0 -18 -6z" fill="#fff0c8"' + S + '/><path d="M-18 -6 q9 8 18 0 q9 -8 18 -6" fill="#ff8fb1"' + S + '/><circle cx="0" cy="-12" r="4" fill="#e0344e"' + S + '/>',
    donut: '<circle cx="0" cy="0" r="17" fill="#ff9fc0"' + S + '/><circle cx="0" cy="0" r="6" fill="#fff8ec"' + S + '/><g stroke-width="3" stroke-linecap="round"><path d="M-10 -9 l3 -2" stroke="#fff"/><path d="M8 -10 l3 3" stroke="#ffd93f"/><path d="M10 7 l-3 3" stroke="#4ab0ff"/><path d="M-9 8 l-3 -3" stroke="#3fd6a8"/></g>',
    cupO: '<path d="M-11 -10 h22 l-3 26 q0 4 -8 4 q-8 0 -8 -4z" fill="#ff9a3d"' + S + '/><path d="M-10 -10 h20 l-1 6 h-18z" fill="#fff" opacity=".7"/><path d="M4 -10 l5 -14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>',
    cupG: '<path d="M-11 -10 h22 l-3 26 q0 4 -8 4 q-8 0 -8 -4z" fill="#7be08f"' + S + '/><path d="M-10 -10 h20 l-1 6 h-18z" fill="#fff" opacity=".7"/><path d="M4 -10 l5 -14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>',
    cupP: '<path d="M-11 -10 h22 l-3 26 q0 4 -8 4 q-8 0 -8 -4z" fill="#ff8fb1"' + S + '/><path d="M-10 -10 h20 l-1 6 h-18z" fill="#fff" opacity=".7"/><path d="M4 -10 l5 -14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>',
    wave: '<circle cx="0" cy="0" r="17" fill="#bfe9ff"' + S + '/><path d="M-14 -4 q4 -5 7 0 t7 0 t7 0 t7 0 M-14 5 q4 -5 7 0 t7 0 t7 0 t7 0" fill="none" stroke="#2a8cf0" stroke-width="3" stroke-linecap="round"/>',
    palette: '<path d="M0 -17 q18 0 18 14 q0 8 -8 6 q-6 -1 -5 5 q0 7 -6 7 q-17 0 -17 -16 q0 -16 18 -16z" fill="#ffe7a8"' + S + '/><circle cx="-7" cy="-5" r="3.2" fill="#ff6b7a"/><circle cx="2" cy="-9" r="3.2" fill="#4a7bf0"/><circle cx="9" cy="-2" r="3.2" fill="#3fd6a8"/><circle cx="-9" cy="5" r="3.2" fill="#9b6cf0"/>',
    note: '<circle cx="-8" cy="12" r="6.5" fill="#9b6cf0"' + S + '/><circle cx="10" cy="8" r="6.5" fill="#9b6cf0"' + S + '/><path d="M-2 12 v-26 l18 -4 v22" fill="none"' + S + '/><path d="M-2 -10 l18 -4" stroke="' + INK + '" stroke-width="4"/>',
    balloon: '<path d="M0 -18 q15 0 15 14 q0 12 -15 18 q-15 -6 -15 -18 q0 -14 15 -14z" fill="#ff6b7a"' + S + '/><path d="M0 14 l-3 5 h6z" fill="#ff6b7a"' + S + '/><path d="M0 19 q-6 6 0 12" fill="none"' + S + '/><path d="M-8 -10 q3 -4 7 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>',
    star: '<path d="M0 -17 l5 11 l12 1.5 l-9 8 l2.6 12 l-10.6 -6 l-10.6 6 l2.6 -12 l-9 -8 l12 -1.5z" fill="#ffd93f"' + S + '/>',
    shell: '<path d="M0 14 q-18 -6 -16 -20 q16 -8 32 0 q2 14 -16 20z" fill="#ffb3c9"' + S + '/><path d="M0 14 v-22 M-8 11 l-6 -15 M8 11 l6 -15" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>'
  };
  function thing(key, size) {
    const sz = size || 36;
    return '<svg class="thing" viewBox="-24 -26 48 54" width="' + sz + '" height="' + Math.round(sz * 1.12) + '" aria-hidden="true">' + (T[key] || T.star) + '</svg>';
  }

  /* ── ซุ้มงาน (ปุ่มบนแผนที่) ── */
  function booth(kind) {
    const col = { tally: '#ff6b7a', compare: '#4a7bf0', scale: '#20b2a0', factory: '#ff9a3d', table: '#9b6cf0', boss: '#6d3fd0' }[kind] || '#ff6b7a';
    let stripes = '';
    for (let i = 0; i < 6; i++) stripes += '<path d="M' + (-48 + i * 16) + ' -14 h16 v10 a8 8 0 0 1 -16 0z" fill="' + (i % 2 ? '#fff' : col) + '"' + S + '/>';
    let prop = '';
    if (kind === 'tally') prop = '<path d="M0 -44 v-30" stroke="' + INK + '" stroke-width="4"/><path d="M0 -74 h30 l-6 8 l6 8 h-30z" fill="#ffd93f"' + S + '/><g fill="' + col + '"><rect x="6" y="-62" width="3.4" height="8"/><rect x="12" y="-66" width="3.4" height="12"/><rect x="18" y="-60" width="3.4" height="6"/></g>';
    if (kind === 'compare') prop = '<g fill="#ff6b7a"' + S + '><circle cx="-22" cy="-52" r="8"/><circle cx="-4" cy="-50" r="8" fill="#ffd93f"/><circle cx="14" cy="-52" r="8" fill="#3fd6a8"/><circle cx="-13" cy="-62" r="8" fill="#ff9a3d"/><circle cx="5" cy="-62" r="8" fill="#9b6cf0"/></g>';
    if (kind === 'scale') prop = '<rect x="-12" y="-82" width="24" height="42" rx="6" fill="#fff"' + S + '/><g stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"><path d="M-12 -74 h10 M-12 -66 h6 M-12 -58 h10 M-12 -50 h6"/></g><rect x="2" y="-62" width="8" height="20" fill="' + col + '"/>';
    if (kind === 'factory') prop = '<rect x="-24" y="-66" width="34" height="26" fill="#fff"' + S + '/><rect x="12" y="-80" width="12" height="40" fill="#e86a1c"' + S + '/><g fill="' + col + '"><rect x="-19" y="-52" width="6" height="10"/><rect x="-10" y="-60" width="6" height="18"/><rect x="-1" y="-56" width="6" height="14"/></g><circle cx="18" cy="-86" r="6" fill="#fff" opacity=".8"/>';
    if (kind === 'table') prop = '<rect x="-26" y="-74" width="52" height="34" rx="5" fill="#fff"' + S + '/><path d="M-26 -62 h52 M-26 -52 h52 M-8 -74 v34 M10 -74 v34" stroke="' + INK + '" stroke-width="2.4"/><rect x="-24" y="-60" width="14" height="6" fill="' + col + '" opacity=".6"/>';
    if (kind === 'boss') prop = '<path d="M-44 -44 l44 -44 l44 44z" fill="' + col + '"' + S + '/><path d="M-44 -44 l44 -44" stroke="#fff" stroke-width="0"/><g transform="translate(0 -62) scale(.34)">' + muenShapes() + '</g>';
    return '<g class="booth-art">' +
      '<ellipse cx="0" cy="30" rx="58" ry="10" fill="rgba(0,0,0,.16)"/>' +
      '<rect x="-46" y="-6" width="92" height="38" rx="6" fill="#ffd9a0"' + S + '/>' +
      '<path d="M-30 6 h60 M-30 16 h60" stroke="#e0a95f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-44 -14 v-30 M44 -14 v-30" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/>' +
      prop +
      '<path d="M-52 -14 q52 -38 104 0z" fill="' + col + '"' + S + '/>' + stripes +
      '</g>';
  }
  function muenShapes() {
    return [[-34, 6, 24], [0, -14, 32], [34, 6, 24], [-14, 22, 24], [16, 22, 24]].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#d6c9ff" stroke="' + INK + '" stroke-width="8"/>').join('');
  }

  TT.art = { tang, muen, icon, star, thing, booth, RAW: T, INK };
})();
