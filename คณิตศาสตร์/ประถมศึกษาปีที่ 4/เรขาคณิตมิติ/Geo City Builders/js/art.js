/* ═══════════════════════════════════════════════════════════
   GEO CITY BUILDERS — งานภาพ SVG ทั้งหมด (ตัวละคร / ไอคอน / ฉาก)
   ไม่มีไฟล์รูปภาพ ไม่มีอิโมจิ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const GB = window.GB = window.GB || {};
  const INK = '#1f2a44';

  /* ── ปิ๊ง : หุ่นยนต์ช่างเรขาคณิต ── */
  function ping(mood) {
    mood = mood || 'happy';
    const eyes = {
      happy: '<path d="M-17 -16 q6 -8 12 0 M5 -16 q6 -8 12 0" fill="none" stroke="#7df9ff" stroke-width="4.5" stroke-linecap="round"/>',
      cheer: '<path d="M-17 -14 q6 -9 12 0 M5 -14 q6 -9 12 0" fill="none" stroke="#7df9ff" stroke-width="4.5" stroke-linecap="round"/>',
      wow: '<circle cx="-11" cy="-17" r="6.5" fill="#7df9ff"/><circle cx="11" cy="-17" r="6.5" fill="#7df9ff"/><circle cx="-9" cy="-19" r="2.2" fill="#fff"/><circle cx="13" cy="-19" r="2.2" fill="#fff"/>',
      think: '<circle cx="-11" cy="-17" r="5" fill="#7df9ff"/><path d="M5 -17 h12" stroke="#7df9ff" stroke-width="4.5" stroke-linecap="round"/>',
      oops: '<path d="M-17 -20 l12 4 M17 -20 l-12 4" stroke="#7df9ff" stroke-width="4" stroke-linecap="round"/><circle cx="-11" cy="-13" r="3.5" fill="#7df9ff"/><circle cx="11" cy="-13" r="3.5" fill="#7df9ff"/>',
      talk: '<circle cx="-11" cy="-17" r="5.5" fill="#7df9ff"/><circle cx="11" cy="-17" r="5.5" fill="#7df9ff"/><circle cx="-9.5" cy="-18.5" r="1.8" fill="#fff"/><circle cx="12.5" cy="-18.5" r="1.8" fill="#fff"/>'
    }[mood] || '';
    const mouth = {
      happy: '<path d="M-9 -4 q9 9 18 0" fill="#ff8fb1" stroke="#7df9ff" stroke-width="2.5" stroke-linejoin="round"/>',
      cheer: '<path d="M-11 -6 q11 13 22 0 z" fill="#ff8fb1" stroke="#7df9ff" stroke-width="2.5" stroke-linejoin="round"/>',
      wow: '<ellipse cx="0" cy="-3" rx="5" ry="6" fill="#ff8fb1" stroke="#7df9ff" stroke-width="2.5"/>',
      think: '<path d="M-6 -3 h12" stroke="#7df9ff" stroke-width="3" stroke-linecap="round"/>',
      oops: '<path d="M-7 -1 q7 -6 14 0" fill="none" stroke="#7df9ff" stroke-width="3" stroke-linecap="round"/>',
      talk: '<path class="p-mouth" d="M-8 -5 q8 8 16 0 z" fill="#ff8fb1" stroke="#7df9ff" stroke-width="2.5" stroke-linejoin="round"/>'
    }[mood] || '';
    const armsUp = mood === 'cheer' || mood === 'wow';
    const armL = armsUp ? 'M-27 22 L-46 -4' : 'M-27 24 L-44 40';
    const armR = armsUp ? 'M27 22 L46 -4' : 'M27 24 L44 36';
    const hL = armsUp ? [-46, -4] : [-44, 40], hR = armsUp ? [46, -4] : [44, 36];
    return '<svg class="ping mood-' + mood + '" viewBox="-62 -76 124 150" aria-hidden="true">' +
      '<ellipse cx="0" cy="68" rx="34" ry="6" fill="rgba(0,0,0,.18)"/>' +
      '<g class="p-body">' +
        '<g class="p-arm p-arm-l"><path d="' + armL + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="' + armL + '" stroke="#9fb6dd" stroke-width="3.5" stroke-linecap="round"/><circle cx="' + hL[0] + '" cy="' + hL[1] + '" r="7.5" fill="#ffcf3f" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<g class="p-arm p-arm-r"><path d="' + armR + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="' + armR + '" stroke="#9fb6dd" stroke-width="3.5" stroke-linecap="round"/><circle cx="' + hR[0] + '" cy="' + hR[1] + '" r="7.5" fill="#ffcf3f" stroke="' + INK + '" stroke-width="3"/></g>' +
        '<rect x="-18" y="52" width="14" height="12" rx="4" fill="#5a6a8f" stroke="' + INK + '" stroke-width="3"/><rect x="4" y="52" width="14" height="12" rx="4" fill="#5a6a8f" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="-28" y="14" width="56" height="42" rx="14" fill="#2f6fde" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M-12 26 v16 h16" fill="none" stroke="#ffcf3f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="-12" y="35" width="7" height="7" fill="none" stroke="#ffcf3f" stroke-width="2.4"/>' +
        '<circle cx="15" cy="30" r="4" fill="#3fd6a8" stroke="' + INK + '" stroke-width="2"/>' +
        '<g class="p-head">' +
          '<line x1="0" y1="-46" x2="0" y2="-62" stroke="' + INK + '" stroke-width="4"/>' +
          '<circle class="p-dot" cx="0" cy="-65" r="7" fill="#ffcf3f" stroke="' + INK + '" stroke-width="3"/>' +
          '<rect x="-38" y="-46" width="76" height="62" rx="20" fill="#eaf2ff" stroke="' + INK + '" stroke-width="4"/>' +
          '<path d="M-40 -30 q0 -26 40 -26 q40 0 40 26 z" fill="#ffcf3f" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
          '<rect x="-46" y="-33" width="92" height="8" rx="4" fill="#ffb52e" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<rect x="-29" y="-25" width="58" height="34" rx="11" fill="#1f2a44"/>' +
          '<g class="p-eyes">' + eyes + '</g>' + mouth +
          '<circle cx="-33" cy="0" r="4" fill="#ff9db8" opacity=".75"/><circle cx="33" cy="0" r="4" fill="#ff9db8" opacity=".75"/>' +
        '</g>' +
      '</g></svg>';
  }

  /* ── ลบลบ : ยางลบจอมซน ── */
  function lob(mood) {
    mood = mood || 'sneaky';
    const eyes = {
      sneaky: '<path d="M-20 -10 q7 -6 14 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M6 -10 q7 -6 14 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-13" cy="-6" r="3.6" fill="' + INK + '"/><circle cx="13" cy="-6" r="3.6" fill="' + INK + '"/><path d="M-22 -18 l14 4 M22 -18 l-14 4" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
      shock: '<circle cx="-13" cy="-9" r="7" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="13" cy="-9" r="7" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-13" cy="-9" r="2.6" fill="' + INK + '"/><circle cx="13" cy="-9" r="2.6" fill="' + INK + '"/>',
      sad: '<path d="M-20 -6 q7 -6 14 0 M6 -6 q7 -6 14 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-21 -16 l12 -3 M21 -16 l-12 -3" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
      happy: '<path d="M-20 -6 q7 -9 14 0 M6 -6 q7 -9 14 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[mood];
    const mouth = {
      sneaky: '<path d="M-14 8 q16 12 30 -4" fill="#fff" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M2 10 v5" stroke="' + INK + '" stroke-width="2"/>',
      shock: '<ellipse cx="0" cy="12" rx="7" ry="8" fill="#7a2140" stroke="' + INK + '" stroke-width="3"/>',
      sad: '<path d="M-10 14 q10 -8 20 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
      happy: '<path d="M-12 8 q12 12 24 0 z" fill="#7a2140" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
    }[mood];
    return '<svg class="lob mood-' + mood + '" viewBox="-62 -70 124 140" aria-hidden="true">' +
      '<ellipse cx="0" cy="62" rx="36" ry="6" fill="rgba(0,0,0,.18)"/>' +
      '<g class="l-body">' +
        '<path d="M-16 44 l-6 14 M16 44 l6 14" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M-40 6 l-14 -10 M40 6 l14 -12" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
        '<g transform="rotate(-6)">' +
          '<rect x="-42" y="-40" width="84" height="88" rx="16" fill="#ff8fb1" stroke="' + INK + '" stroke-width="4"/>' +
          '<rect x="-42" y="22" width="84" height="26" rx="6" fill="#4a7bf0" stroke="' + INK + '" stroke-width="4"/>' +
          '<path d="M-30 35 h60" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" opacity=".7"/>' +
          '<path d="M-34 -32 q10 -6 24 -4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>' +
          eyes + mouth +
          '<circle cx="-28" cy="4" r="5" fill="#ff5c8a" opacity=".6"/><circle cx="28" cy="4" r="5" fill="#ff5c8a" opacity=".6"/>' +
        '</g>' +
        '<g class="l-crumbs" fill="#ffb3c9" stroke="' + INK + '" stroke-width="1.5"><circle cx="-50" cy="48" r="3"/><circle cx="48" cy="52" r="2.5"/><circle cx="-56" cy="38" r="2"/></g>' +
      '</g></svg>';
  }

  /* ── ไอคอน (เส้น) ── */
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
    ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6 8v3M9.5 8v4M13 8v3M16.5 8v4"/>',
    corner: '<path d="M5 4v15h15"/><rect x="5" y="13" width="6" height="6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
    eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7M9.5 17h5"/>',
    hand: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 10V4.5a1.5 1.5 0 0 1 3 0V11M15 10.5V6.5a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L9 13.5V11"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    stamp: '<path d="M9 4h6v4l-1 4h-4L9 8z"/><path d="M4 15h16v3H4zM6 21h12"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    teacher: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    medal: '<circle cx="12" cy="15" r="5"/><path d="M8 3l4 7 4-7"/><path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || '') + '</svg>';
  }
  function starSvg(on) {
    return '<svg class="st ' + (on ? 'on' : 'off') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.5 1.2 6.5L12 17.2l-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  /* ── สัญลักษณ์ทางเรขาคณิต (SVG) : kind = seg | ray | line | angle ── */
  function symbol(kind, letters, opts) {
    opts = opts || {};
    const L = (letters || '').split('');
    const cw = 22, pad = kind === 'angle' ? 30 : 6;
    const w = pad + L.length * cw + 6, h = 52;
    let s = '<svg class="sym" viewBox="0 0 ' + w + ' ' + h + '" width="' + (w * (opts.scale || 1)) + '" height="' + (h * (opts.scale || 1)) + '" aria-label="สัญลักษณ์">';
    L.forEach((c, i) => {
      s += '<text x="' + (pad + i * cw + cw / 2) + '" y="44" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="28" fill="currentColor">' + c + '</text>';
    });
    const x1 = pad + 2, x2 = pad + L.length * cw - 2, y = 12;
    const st = ' stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"';
    if (kind === 'seg') s += '<path d="M' + x1 + ' ' + y + ' H' + x2 + '"' + st + '/>';
    if (kind === 'ray') s += '<path d="M' + x1 + ' ' + y + ' H' + x2 + ' M' + (x2 - 7) + ' ' + (y - 6) + ' L' + x2 + ' ' + y + ' L' + (x2 - 7) + ' ' + (y + 6) + '"' + st + '/>';
    if (kind === 'line') s += '<path d="M' + x1 + ' ' + y + ' H' + x2 + ' M' + (x2 - 7) + ' ' + (y - 6) + ' L' + x2 + ' ' + y + ' L' + (x2 - 7) + ' ' + (y + 6) + ' M' + (x1 + 7) + ' ' + (y - 6) + ' L' + x1 + ' ' + y + ' L' + (x1 + 7) + ' ' + (y + 6) + '"' + st + '/>';
    if (kind === 'angle') s += '<path d="M24 22 L6 44 H26"' + st + '/>';
    return s + '</svg>';
  }
  /* เครื่องหมายเดี่ยวสำหรับป้ายกระเบื้อง */
  function mark(kind) {
    const st = ' stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const p = {
      seg: '<path d="M6 20 H42"' + st + '/>',
      ray: '<path d="M6 20 H42 M34 13 L42 20 L34 27"' + st + '/>',
      line: '<path d="M6 20 H42 M34 13 L42 20 L34 27 M14 13 L6 20 L14 27"' + st + '/>',
      angle: '<path d="M32 8 L10 32 H36"' + st + '/>'
    }[kind] || '';
    return '<svg class="mk" viewBox="0 0 48 40" aria-hidden="true">' + p + '</svg>';
  }

  /* ── อาคารบนแผนที่ (แต่ละย่าน) : มีสองสถานะ ถูกลบ/ซ่อมแล้ว ── */
  function building(kind) {
    const S = ' stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"';
    const b = {
      plaza: '<path d="M-34 18 h68" ' + S + ' fill="none"/><path d="M-26 18 v-26 h52 v26"' + S + ' fill="#7fd1ff"/><path d="M-30 -8 l30 -18 l30 18 z"' + S + ' fill="#ff8fb1"/><circle cx="0" cy="-36" r="5" fill="#ffcf3f"' + S + '/><rect x="-8" y="2" width="16" height="16"' + S + ' fill="#fff8ec"/>',
      sign: '<path d="M-4 20 v-40 h8 v40"' + S + ' fill="#c9a26b"/><rect x="-30" y="-36" width="60" height="22" rx="5"' + S + ' fill="#3fd6a8"/><path d="M-20 -25 h40 M12 -30 l8 5 -8 5"' + ' stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="-26" y="-8" width="52" height="16" rx="5"' + S + ' fill="#ffcf3f"/>',
      tower: '<path d="M-14 20 l6 -56 h16 l6 56 z"' + S + ' fill="#a98bff"/><path d="M-12 -36 l12 -16 l12 16 z"' + S + ' fill="#ff8fb1"/><path d="M-4 0 h8 M-6 10 h12" stroke="' + INK + '" stroke-width="2.5"/><path d="M-2 -20 l8 0 M-2 -20 l5 -7" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/>',
      park: '<circle cx="0" cy="-10" r="24" fill="none"' + S + '/><circle cx="0" cy="-10" r="4" fill="#ffcf3f"' + S + '/><path d="M0 -10 L0 -34 M0 -10 L20 2 M0 -10 L-20 2" stroke="' + INK + '" stroke-width="2.5"/><path d="M-18 20 L0 -10 L18 20" stroke="' + INK + '" stroke-width="3.5" fill="none"/><circle cx="0" cy="-34" r="5" fill="#ff8fb1"' + S + '/><circle cx="20" cy="2" r="5" fill="#3fd6a8"' + S + '/><circle cx="-20" cy="2" r="5" fill="#7fd1ff"' + S + '/>',
      factory: '<path d="M-32 20 v-26 l14 -8 v8 l14 -8 v8 l14 -8 v8 h22 v26 z"' + S + ' fill="#ffb26b"/><rect x="18" y="-32" width="8" height="18"' + S + ' fill="#c9c9d9"/><rect x="-24" y="2" width="10" height="10"' + S + ' fill="#fff8ec"/><rect x="-6" y="2" width="16" height="10"' + S + ' fill="#fff8ec"/>',
      yard: '<path d="M-30 20 h60"' + S + '/><path d="M-20 20 v-34 h4 v34" ' + S + ' fill="#ffcf3f"/><path d="M-18 -14 h40 v4 h-40" ' + S + ' fill="#ffcf3f"/><path d="M18 -10 v14" stroke="' + INK + '" stroke-width="2.5"/><rect x="10" y="4" width="16" height="12"' + S + ' fill="#7fd1ff"/>',
      gate: '<rect x="-34" y="-30" width="16" height="50"' + S + ' fill="#c9c9d9"/><rect x="18" y="-30" width="16" height="50"' + S + ' fill="#c9c9d9"/><path d="M-34 -30 q34 -26 68 0"' + S + ' fill="none"/><rect x="-18" y="-6" width="36" height="26"' + S + ' fill="#ff8fb1"/><circle cx="0" cy="-26" r="6" fill="#ffcf3f"' + S + '/>'
    }[kind] || '';
    return '<g class="bld">' + b + '</g>';
  }

  GB.art = { ping, lob, icon, star: starSvg, symbol, mark, building, INK };
})();
