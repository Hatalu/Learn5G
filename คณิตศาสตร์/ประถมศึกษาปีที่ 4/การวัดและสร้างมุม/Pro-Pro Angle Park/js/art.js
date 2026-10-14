/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — Procedural SVG art (ไม่มีไฟล์ภาพ ไม่มีอิโมจิ)
   ตัวละคร : โปรโปร (โพรแทรกเตอร์ผู้นำทาง) / น้องแต้ม (ผู้เล่น) / ซิกแซก (เจ้าตัวป่วนบิดมุม)
   งานภาพ  : โพรแทรกเตอร์สองสเกลแยกสี, เครื่องเล่น 5 ชิ้น, สวนสนุกพื้นหลัง, ปราสาทสายรุ้ง
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const AP = window.AP = window.AP || {};
  const M = AP.M;
  const INK = '#2d1b4e';
  let _uid = 0;
  const uid = p => (p || 'u') + (++_uid);
  const P = (r, a) => [(Math.cos(a * Math.PI / 180) * r), (-Math.sin(a * Math.PI / 180) * r)];   /* a = องศาคณิตศาสตร์ */
  const f1 = n => n.toFixed(1);

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
    rotL: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M3 3v5h5"/>',
    rotR: '<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M21 3v5h-5"/>',
    pin: '<path d="M12 21v-7"/><path d="M8 3h8l-1 6 3 3H6l3-3z"/>',
    pencil: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
    proti: '<path d="M3 18a9 9 0 0 1 18 0z"/><path d="M12 18v-4M6.5 18l.5-1.5M17.5 18l-.5-1.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9 17h6v4H9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function star(on, cls) {
    const g = uid('sg');
    return '<svg class="star ' + (on ? 'on ' : '') + (cls || '') + '" viewBox="-12 -12 24 24" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#ffb21f"/></linearGradient></defs>' +
      '<path d="M0 -10.5 L3 -3.6 L10.4 -3.2 L4.7 1.6 L6.6 9 L0 5 L-6.6 9 L-4.7 1.6 L-10.4 -3.2 L-3 -3.6 Z" ' +
      'fill="' + (on ? 'url(#' + g + ')' : '#e3dcf3') + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      (on ? '<path d="M-2.5 -4 L0 -8" stroke="#fffbe0" stroke-width="2" stroke-linecap="round"/>' : '') + '</svg>';
  }
  function stars(n, of, cls) {
    let h = '<span class="stars">';
    for (let i = 0; i < (of || 3); i++) h += star(i < n, cls);
    return h + '</span>';
  }

  /* ══════════ โปรโปร : โพรแทรกเตอร์ผู้นำทางสุดร่าเริง ══════════ */
  function pro(mood) {
    const g1 = uid('pb'), g2 = uid('ph');
    const rainbow = ['#ff5a4e', '#ff9a1f', '#ffd23f', '#3ccf7a', '#3ba8ff', '#8b5cf6'];
    let arcs = '', ticks = '';
    rainbow.forEach((c, i) => {
      const a0 = 180 - i * 30, a1 = a0 - 30, r = 53;
      const p0 = P(r, a0), p1 = P(r, a1);
      arcs += '<path d="M' + f1(p0[0]) + ' ' + f1(24 + p0[1]) + ' A' + r + ' ' + r + ' 0 0 1 ' + f1(p1[0]) + ' ' + f1(24 + p1[1]) + '" fill="none" stroke="' + c + '" stroke-width="9"/>';
    });
    for (let a = 0; a <= 180; a += 10) {
      const p0 = P(47, a), p1 = P(a % 30 === 0 ? 41 : 43.5, a);
      ticks += 'M' + f1(p0[0]) + ' ' + f1(24 + p0[1]) + 'L' + f1(p1[0]) + ' ' + f1(24 + p1[1]);
    }
    return '<svg class="pro mood-' + (mood || 'happy') + '" viewBox="-86 -96 172 172" aria-hidden="true">' +
      '<defs><radialGradient id="' + g1 + '" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d7f0ff"/><stop offset="1" stop-color="#a9dcff"/></radialGradient>' +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd0ff"/><stop offset="1" stop-color="#3b9cf0"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="72" rx="46" ry="6.5" fill="rgba(45,27,78,.2)"/>' +
      /* ขา + รองเท้า */
      '<g class="p-leg-l"><path d="M-22 40 V60" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M-22 40 V60" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M-36 66 Q-36 58 -26 58 L-14 58 Q-6 58 -6 66 Z" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M-34 63 H-8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="p-leg-r"><path d="M22 40 V60" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M22 40 V60" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M6 66 Q6 58 14 58 L26 58 Q36 58 36 66 Z" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M8 63 H34" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="p-body">' +
        /* แขน */
        '<g class="p-arms-down"><path d="M-60 14 Q-82 22 -76 46" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-60 14 Q-82 22 -76 46" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="-76" cy="49" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M60 14 Q82 22 76 46" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M60 14 Q82 22 76 46" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="76" cy="49" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/></g>' +
        '<g class="p-arms-up"><path d="M-60 6 Q-86 0 -80 -30" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-60 6 Q-86 0 -80 -30" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="-80" cy="-34" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M60 6 Q86 0 80 -30" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M60 6 Q86 0 80 -30" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="-34" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/></g>' +
        '<g class="p-arms-think"><path d="M-60 14 Q-82 22 -76 46" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M-60 14 Q-82 22 -76 46" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="-76" cy="49" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<path d="M60 14 Q86 10 62 -12" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M60 14 Q86 10 62 -12" fill="none" stroke="#6fd0ff" stroke-width="6" stroke-linecap="round"/><circle cx="58" cy="-14" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/></g>' +
        /* ตัว : ครึ่งวงกลม + แถบฐาน */
        '<path d="M-64 24 A64 64 0 0 1 64 24 L64 40 Q64 46 58 46 L-58 46 Q-64 46 -64 40 Z" fill="url(#' + g1 + ')" stroke="' + INK + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        arcs +
        '<path d="M-64 24 A64 64 0 0 1 64 24" fill="none" stroke="' + INK + '" stroke-width="4.5"/>' +
        '<path d="M-44 24 A44 44 0 0 1 44 24" fill="none" stroke="' + INK + '" stroke-width="2.4" opacity=".55"/>' +
        '<path d="' + ticks + '" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>' +
        '<path d="M-52 -22 A58 58 0 0 1 -28 -46" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<path d="M-64 24 H64" stroke="' + INK + '" stroke-width="3.2"/>' +
        '<rect x="-58" y="28" width="116" height="14" rx="6" fill="url(#' + g2 + ')" opacity=".45"/>' +
        /* จุดกึ่งกลาง (สะดือ) */
        '<g><circle cx="0" cy="24" r="6" fill="#fff" stroke="#ff3b57" stroke-width="3"/><path d="M0 14 V34 M-10 24 H10" stroke="#ff3b57" stroke-width="2" stroke-linecap="round"/></g>' +
        /* หน้า */
        '<ellipse cx="-30" cy="12" rx="8" ry="5" fill="#ff8fb0" opacity=".8"/><ellipse cx="30" cy="12" rx="8" ry="5" fill="#ff8fb0" opacity=".8"/>' +
        '<g class="p-eyes-open"><ellipse cx="-17" cy="-1" rx="10" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/><ellipse cx="17" cy="-1" rx="10" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/>' +
          '<circle class="p-pupil" cx="-15" cy="1" r="6" fill="' + INK + '"/><circle class="p-pupil" cx="19" cy="1" r="6" fill="' + INK + '"/>' +
          '<circle cx="-12.5" cy="-2" r="2.4" fill="#fff"/><circle cx="21.5" cy="-2" r="2.4" fill="#fff"/></g>' +
        '<g class="p-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"><path d="M-28 1 Q-17 -13 -6 1"/><path d="M6 1 Q17 -13 28 1"/></g>' +
        '<g class="p-eyes-wow"><circle cx="-17" cy="-1" r="12" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/><circle cx="17" cy="-1" r="12" fill="#fff" stroke="' + INK + '" stroke-width="3.2"/><circle cx="-17" cy="-1" r="4.4" fill="' + INK + '"/><circle cx="17" cy="-1" r="4.4" fill="' + INK + '"/></g>' +
        '<path class="p-m-smile" d="M-10 15 Q0 26 10 15" fill="none" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"/>' +
        '<g class="p-m-open"><path d="M-12 14 Q0 12 12 14 Q10 30 0 30 Q-10 30 -12 14 Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M-5 25 Q0 19 5 25 Q3 29 0 29 Q-3 29 -5 25Z" fill="#ff8f9f"/></g>' +
        '<g class="p-m-o"><ellipse cx="0" cy="21" rx="6.5" ry="8" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3.4"/></g>' +
        '<path class="p-m-flat" d="M-9 20 Q0 17 9 20" fill="none" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"/>' +
        /* หมวกปาร์ตี้ */
        '<g transform="rotate(-10 6 -52)"><g class="p-hat"><path d="M-17 -44 L5 -86 L27 -44 Z" fill="#ff5fa2" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M-9 -58 L19 -58 M-13 -50 L23 -50" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M-6 -66 L16 -66" stroke="#ffd23f" stroke-width="3.4" stroke-linecap="round"/>' +
          '<ellipse cx="5" cy="-44" rx="23" ry="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/>' +
          '<circle cx="5" cy="-88" r="6.5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/></g></g>' +
      '</g></svg>';
  }

  /* ══════════ ซิกแซก : เจ้าตัวป่วนที่ชอบบิดมุม (ไม่น่ากลัว) ══════════ */
  function zig(mood) {
    const g = uid('zg');
    return '<svg class="zig mood-' + (mood || 'smirk') + '" viewBox="-70 -84 140 150" aria-hidden="true">' +
      '<defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#d9c7ff"/><stop offset=".5" stop-color="#a07bff"/><stop offset="1" stop-color="#7143e0"/></radialGradient></defs>' +
      '<ellipse cx="0" cy="58" rx="28" ry="4.5" fill="rgba(45,27,78,.16)"/>' +
      '<g class="z-float">' +
        /* หางซิกแซก */
        '<g class="z-tail"><path d="M-6 28 L-30 40 L-14 44 L-38 58 L-6 50 Z" fill="#7143e0" stroke="' + INK + '" stroke-width="3.6" stroke-linejoin="round"/></g>' +
        /* เสาอากาศบิดมุม */
        '<g class="z-ant"><path d="M0 -34 L-12 -48 L10 -58 L-6 -72" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M0 -34 L-12 -48 L10 -58 L-6 -72" fill="none" stroke="#ff5fa2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="-6" cy="-75" r="7" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/></g>' +
        /* ตัว */
        '<ellipse cx="0" cy="0" rx="38" ry="36" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.5"/>' +
        '<path d="M-26 -22 Q-16 -34 -2 -34" fill="none" stroke="#efe6ff" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<path d="M-38 12 L-26 22 L-14 12 L-2 24 L10 12 L22 24 L36 12" fill="none" stroke="#5b32c8" stroke-width="3" stroke-linejoin="round" opacity=".6"/>' +
        '<ellipse cx="-24" cy="10" rx="7" ry="4.4" fill="#ff8fb0" opacity=".85"/><ellipse cx="24" cy="10" rx="7" ry="4.4" fill="#ff8fb0" opacity=".85"/>' +
        '<path class="z-brow" d="M-26 -16 L-8 -8 M26 -20 L8 -10" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"/>' +
        '<g class="z-eyes-smirk"><ellipse cx="-14" cy="-2" rx="10" ry="10.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="15" cy="-4" rx="8" ry="8.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
          '<circle cx="-11" cy="1" r="4.8" fill="' + INK + '"/><circle cx="18" cy="-1" r="4" fill="' + INK + '"/><circle cx="-9" cy="-1" r="1.6" fill="#fff"/><circle cx="19.5" cy="-2.5" r="1.3" fill="#fff"/></g>' +
        '<g class="z-eyes-shock"><circle cx="-14" cy="-2" r="11.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="15" cy="-3" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-14" cy="-2" r="3.4" fill="' + INK + '"/><circle cx="15" cy="-3" r="3" fill="' + INK + '"/></g>' +
        '<g class="z-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"><path d="M-24 0 Q-14 -12 -4 0"/><path d="M6 0 Q15 -11 24 0"/></g>' +
        '<g class="z-m-grin"><path d="M-17 14 Q0 34 19 12 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M0 22 V14 M-9 18 V14 M9 19 V13" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<ellipse class="z-m-o" cx="0" cy="20" rx="7" ry="8.5" fill="#3b1470" stroke="' + INK + '" stroke-width="3.2"/>' +
        '<path class="z-m-smile" d="M-12 14 Q0 26 12 14" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        /* แขน + ไม้บิด */
        '<path d="M-38 6 Q-54 10 -54 24" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-38 6 Q-54 10 -54 24" fill="none" stroke="#a07bff" stroke-width="4" stroke-linecap="round"/><circle cx="-54" cy="27" r="6" fill="#efe6ff" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="z-hand"><path d="M38 6 Q52 2 54 -10" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M38 6 Q52 2 54 -10" fill="none" stroke="#a07bff" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M52 -8 L50 -44 L66 -62" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 -8 L50 -44 L66 -62" fill="none" stroke="#ffd23f" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="53" cy="-6" r="6" fill="#efe6ff" stroke="' + INK + '" stroke-width="3"/></g>' +
      '</g></svg>';
  }

  /* ══════════ น้องแต้ม : ผู้เล่น (หมวกแดง กระเป๋าเป้) ══════════ */
  function kid(mood, cls) {
    const g = uid('kg');
    return '<svg class="kid mood-' + (mood || 'happy') + ' ' + (cls || '') + '" viewBox="0 0 110 136" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a6a"/><stop offset="1" stop-color="#ee3d3d"/></linearGradient></defs>' +
      '<ellipse cx="55" cy="131" rx="30" ry="4.6" fill="rgba(45,27,78,.2)"/>' +
      '<g class="k-leg-l"><path d="M44 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M44 100 V118" stroke="#3ba8ff" stroke-width="6" stroke-linecap="round"/><path d="M32 128 Q32 119 41 119 L50 119 Q56 119 56 128 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M33 124 H55" stroke="#ff5a4e" stroke-width="2.4"/></g>' +
      '<g class="k-leg-r"><path d="M66 100 V118" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M66 100 V118" stroke="#3ba8ff" stroke-width="6" stroke-linecap="round"/><path d="M54 128 Q54 119 62 119 L71 119 Q78 119 78 128 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M55 124 H77" stroke="#ff5a4e" stroke-width="2.4"/></g>' +
      '<g class="k-body">' +
        '<path d="M26 84 Q10 90 12 106" class="k-arm-d" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 84 Q10 90 12 106" class="k-arm-d" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle class="k-arm-d" cx="12" cy="108" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M84 84 Q100 90 98 106" class="k-arm-d" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 84 Q100 90 98 106" class="k-arm-d" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle class="k-arm-d" cx="98" cy="108" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="k-arm-u"><path d="M26 82 Q6 76 8 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M26 82 Q6 76 8 54" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle cx="8" cy="51" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M84 82 Q104 76 102 54" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M84 82 Q104 76 102 54" fill="none" stroke="#ffcfa3" stroke-width="5" stroke-linecap="round"/><circle cx="102" cy="51" r="6.5" fill="#ffcfa3" stroke="' + INK + '" stroke-width="3"/></g>' +
        /* ตัว */
        '<path d="M28 76 Q28 68 38 68 L72 68 Q82 68 82 76 L82 104 Q82 110 76 110 L34 110 Q28 110 28 104 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M40 86 A15 15 0 0 1 70 86 Z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M55 86 V76 M44.5 86 l2-4 M65.5 86 l-2-4" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
        /* หัว */
        '<circle cx="55" cy="40" r="32" fill="#ffd7b4" stroke="' + INK + '" stroke-width="4.4"/>' +
        '<path d="M26 40 Q26 22 42 16 L40 28 Q30 32 28 44 Z" fill="#6b3f2a" stroke="' + INK + '" stroke-width="3"/><path d="M84 40 Q84 22 68 16 L70 28 Q80 32 82 44 Z" fill="#6b3f2a" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="34" cy="48" rx="6.5" ry="4.4" fill="#ff8fb0" opacity=".8"/><ellipse cx="76" cy="48" rx="6.5" ry="4.4" fill="#ff8fb0" opacity=".8"/>' +
        '<g class="k-eyes-open"><ellipse cx="44" cy="41" rx="6.6" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><ellipse cx="66" cy="41" rx="6.6" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/>' +
          '<circle class="k-pupil" cx="45" cy="42.5" r="4" fill="' + INK + '"/><circle class="k-pupil" cx="67" cy="42.5" r="4" fill="' + INK + '"/><circle cx="46.4" cy="40.5" r="1.4" fill="#fff"/><circle cx="68.4" cy="40.5" r="1.4" fill="#fff"/></g>' +
        '<g class="k-eyes-happy" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"><path d="M37 44 Q44 34 51 44"/><path d="M59 44 Q66 34 73 44"/></g>' +
        '<g class="k-eyes-wow"><circle cx="44" cy="41" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><circle cx="66" cy="41" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/><circle cx="44" cy="41" r="3" fill="' + INK + '"/><circle cx="66" cy="41" r="3" fill="' + INK + '"/></g>' +
        '<path class="k-m-smile" d="M45 56 Q55 66 65 56" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>' +
        '<g class="k-m-open"><path d="M44 55 Q55 53 66 55 Q64 68 55 68 Q46 68 44 55 Z" fill="#9b2c4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></g>' +
        /* หมวกแดง */
        '<path d="M22 32 Q24 6 55 6 Q86 6 88 32 Q55 24 22 32 Z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.4" stroke-linejoin="round"/>' +
        '<path d="M16 34 Q55 22 98 36 Q98 42 92 40 Q55 30 22 42 Q14 42 16 34 Z" fill="#ee3d3d" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M55 6 V24" stroke="' + INK + '" stroke-width="2.4" opacity=".5"/><circle cx="55" cy="5" r="4.6" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M43 20 L46 14 L49 20 L55 21 L50 25 L52 31 L46 27.5 L40 31 L42 25 L37 21 Z" fill="#fff6a8" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round" transform="translate(5 -3) scale(.9)"/>' +
      '</g></svg>';
  }

  /* ══════════ โพรแทรกเตอร์สองสเกล (พิกัดท้องถิ่น: จุดกึ่งกลางอยู่ที่ 0,0 ครึ่งวงกลมหันขึ้น) ══════════
     สเกลนอก (สีฟ้า) เริ่ม 0 ทางขวา · สเกลใน (สีส้ม) เริ่ม 0 ทางซ้าย
     o = {lite: ข้ามขีด 1 องศา, hl: [ส่วนที่ไฮไลต์], faint: ลดความทึบ, nums: แสดงตัวเลข(ค่าเริ่ม true)} */
  const BLUE = '#1d4ed8', ORNG = '#c2410c';
  let _protCache = {};
  function protractorInner(o) {
    o = o || {};
    const key = (o.lite ? 'L' : 'F') + (o.nums === false ? 'n' : 'y');
    let base = _protCache[key];
    if (!base) {
      const R = M.PROT.R, B = M.PROT.BODY;
      const gid = uid('pf');
      let s = '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".82"/><stop offset="1" stop-color="#cfeeff" stop-opacity=".66"/></linearGradient></defs>';
      s += '<path d="M' + (-B) + ' 30 L' + (-B) + ' 0 A' + B + ' ' + B + ' 0 0 1 ' + B + ' 0 L' + B + ' 30 Q' + B + ' 38 ' + (B - 8) + ' 38 L' + (-B + 8) + ' 38 Q' + (-B) + ' 38 ' + (-B) + ' 30 Z" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="3.6" stroke-linejoin="round"/>';
      /* แถบสี สเกลนอก / ใน */
      const band = (r1, r0, col) => '<path d="M' + r1 + ' 0 A' + r1 + ' ' + r1 + ' 0 0 0 ' + (-r1) + ' 0 L' + (-r0) + ' 0 A' + r0 + ' ' + r0 + ' 0 0 1 ' + r0 + ' 0 Z" fill="' + col + '"/>';
      s += band(R, 115, 'rgba(59,130,246,.20)');
      s += band(113, 82, 'rgba(249,115,22,.20)');
      /* ขีด */
      let d1 = '', d5 = '', d10 = '', e1 = '', e5 = '', e10 = '';
      for (let a = 0; a <= 180; a++) {
        const c = P(R, a);
        if (a % 10 === 0) { const q = P(R - 13, a); d10 += 'M' + f1(c[0]) + ' ' + f1(c[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
        else if (a % 5 === 0) { const q = P(R - 9, a); d5 += 'M' + f1(c[0]) + ' ' + f1(c[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
        else if (!o.lite) { const q = P(R - 5, a); d1 += 'M' + f1(c[0]) + ' ' + f1(c[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
        const c2 = P(104, a);
        if (a % 10 === 0) { const q = P(113, a); e10 += 'M' + f1(c2[0]) + ' ' + f1(c2[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
        else if (a % 5 === 0) { const q = P(110, a); e5 += 'M' + f1(c2[0]) + ' ' + f1(c2[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
        else if (!o.lite) { const q = P(107, a); e1 += 'M' + f1(c2[0]) + ' ' + f1(c2[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
      }
      s += '<path d="' + d1 + '" stroke="' + BLUE + '" stroke-width=".8" opacity=".75"/><path d="' + d5 + '" stroke="' + BLUE + '" stroke-width="1.3"/><path d="' + d10 + '" stroke="' + BLUE + '" stroke-width="2" stroke-linecap="round"/>';
      s += '<path d="' + e1 + '" stroke="' + ORNG + '" stroke-width=".8" opacity=".75"/><path d="' + e5 + '" stroke="' + ORNG + '" stroke-width="1.3"/><path d="' + e10 + '" stroke="' + ORNG + '" stroke-width="2" stroke-linecap="round"/>';
      s += '<path d="M' + R + ' 0 A' + R + ' ' + R + ' 0 0 0 ' + (-R) + ' 0" fill="none" stroke="' + BLUE + '" stroke-width="1.4"/>';
      s += '<path d="M104 0 A104 104 0 0 0 -104 0" fill="none" stroke="' + ORNG + '" stroke-width="1.4"/>';
      /* ตัวเลข (หมุนตามแนวรัศมี) */
      if (o.nums !== false) {
        for (let a = 0; a <= 180; a += 10) {
          const po = P(124.5, a), pi = P(92, a);
          const rot = 90 - a;
          if (a === 0) s += '<g transform="translate(' + f1(po[0]) + ' ' + f1(po[1]) + ')"><circle r="9.5" fill="' + BLUE + '" stroke="#fff" stroke-width="1.6"/><text text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="13" fill="#fff">0</text></g>';
          else s += '<text transform="translate(' + f1(po[0]) + ' ' + f1(po[1]) + ') rotate(' + rot + ')" text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="13.5" fill="' + BLUE + '">' + a + '</text>';
          if (a === 180) s += '<g transform="translate(' + f1(pi[0]) + ' ' + f1(pi[1]) + ')"><circle r="9" fill="' + ORNG + '" stroke="#fff" stroke-width="1.6"/><text text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="12.5" fill="#fff">0</text></g>';
          else s += '<text transform="translate(' + f1(pi[0]) + ' ' + f1(pi[1]) + ') rotate(' + (a <= 90 ? -a : 180 - a) + ')" text-anchor="middle" dy=".36em" font-family="Baloo 2, Mali, sans-serif" font-weight="800" font-size="13" fill="' + ORNG + '">' + (180 - a) + '</text>';
        }
      }
      /* เส้นฐาน + จุดกึ่งกลาง + ดาวตกแต่ง */
      s += '<path d="M' + (-B) + ' 0 H' + B + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="butt"/>';
      s += '<path d="M-58 22 H58" stroke="' + INK + '" stroke-width="1.2" opacity=".25" stroke-dasharray="3 5"/>';
      s += '<path d="M-60 -50 Q-30 -66 0 -68" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>';
      s += '<g class="pr-center"><circle r="7" fill="#fff" stroke="#ff3b57" stroke-width="3"/><path d="M0 -17 V17 M-17 0 H17" stroke="#ff3b57" stroke-width="2.2" stroke-linecap="round"/></g>';
      base = _protCache[key] = s;
    }
    /* ไฮไลต์ส่วนต่าง ๆ (ไม่แคช) */
    let hl = '';
    (o.hl || []).forEach(k => {
      if (k === 'center') hl += '<circle class="hl-pulse" r="17" fill="rgba(255,210,63,.35)" stroke="#ffb400" stroke-width="3.5"/>';
      if (k === 'base') hl += '<rect class="hl-pulse" x="-160" y="-6" width="320" height="12" rx="6" fill="rgba(255,210,63,.4)" stroke="#ffb400" stroke-width="3"/>';
      if (k === 'zeroOut') hl += '<circle class="hl-pulse" cx="124.5" cy="0" r="17" fill="rgba(255,210,63,.35)" stroke="#ffb400" stroke-width="3.5"/>';
      if (k === 'zeroIn') hl += '<circle class="hl-pulse" cx="-92" cy="0" r="17" fill="rgba(255,210,63,.35)" stroke="#ffb400" stroke-width="3.5"/>';
      if (k === 'outer') hl += '<path class="hl-pulse" d="M146 0 A146 146 0 0 0 -146 0 L-114 0 A114 114 0 0 1 114 0 Z" fill="rgba(255,210,63,.3)" stroke="#ffb400" stroke-width="3"/>';
      if (k === 'inner') hl += '<path class="hl-pulse" d="M113 0 A113 113 0 0 0 -113 0 L-81 0 A81 81 0 0 1 81 0 Z" fill="rgba(255,210,63,.3)" stroke="#ffb400" stroke-width="3"/>';
    });
    return base + hl;
  }
  /* โพรแทรกเตอร์เดี่ยว ๆ (สำหรับการ์ดโชว์) */
  function protractor(o) {
    o = o || {};
    return '<svg class="prot-show" viewBox="-174 -178 348 232" aria-hidden="true"><g>' + protractorInner(o) + '</g></svg>';
  }

  /* ══════════ รูปมุม (แขนสองข้าง จุดยอด) แบบนิ่ง ใช้ในการ์ดและภาพย่อ ══════════ */
  function figureMarkup(f, o) {
    o = o || {};
    const V = f.V, L = f.len;
    const e1 = M.vec(f.b, L), e2 = M.vec(f.e, L);
    let s = '';
    if (f.size > 0 && o.wedge !== false) {
      const r = o.arcR || 40;
      const a = M.vec(f.b, r), b = M.vec(f.e, r);
      const sweep = f.dir === 1 ? 0 : 1;
      s += '<path d="M' + V.x + ' ' + V.y + ' L' + f1(V.x + a.x) + ' ' + f1(V.y + a.y) + ' A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + f1(V.x + b.x) + ' ' + f1(V.y + b.y) + ' Z" fill="rgba(255,95,162,.28)" stroke="#ff5fa2" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    s += '<path d="M' + V.x + ' ' + V.y + ' l' + f1(e1.x) + ' ' + f1(e1.y) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + V.x + ' ' + V.y + ' l' + f1(e1.x) + ' ' + f1(e1.y) + '" stroke="#3ba8ff" stroke-width="5" stroke-linecap="round"/>';
    if (f.size > 0) s += '<path d="M' + V.x + ' ' + V.y + ' l' + f1(e2.x) + ' ' + f1(e2.y) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + V.x + ' ' + V.y + ' l' + f1(e2.x) + ' ' + f1(e2.y) + '" stroke="#ff5fa2" stroke-width="5" stroke-linecap="round"/>';
    s += '<circle cx="' + V.x + '" cy="' + V.y + '" r="8.5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/>';
    return s;
  }
  /* ภาพย่อ: มุม + โพรแทรกเตอร์วางตามท่า pr (ใช้ในการ์ดตัวเลือก "ใครวางถูก") */
  function miniPlacement(f, pr, o) {
    o = o || {};
    return '<svg class="mini-pl" viewBox="40 20 380 360" aria-hidden="true">' +
      '<rect x="40" y="20" width="380" height="360" rx="26" fill="#fffdf6"/>' +
      figureMarkup(f, { arcR: 34 }) +
      '<g transform="translate(' + f1(pr.x) + ' ' + f1(pr.y) + ') rotate(' + f1(-pr.rot) + ')" opacity=".93">' + protractorInner({ lite: true, nums: o.nums !== false }) + '</g>' +
      '</svg>';
  }

  /* ══════════ เครื่องเล่น : ป้ายกลม + ภาพเครื่องเล่น ══════════ */
  function rideArt(kind) {
    const g = uid('rg');
    switch (kind) {
      case 'booth': /* บูธโปรโปร : ร้านลายทาง ป้ายโพรแทรกเตอร์ */
        return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#ffe49a"/></linearGradient></defs>' +
          '<rect x="22" y="48" width="56" height="38" rx="4" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="3.4"/>' +
          '<path d="M16 50 L22 28 H78 L84 50 Z" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3.6" stroke-linejoin="round"/>' +
          '<path d="M30 28 L28 50 M42 28 L41 50 M54 28 L54 50 M66 28 L67 50 M78 28 L74 50" stroke="#fff" stroke-width="5.4"/>' +
          '<path d="M16 50 Q22 58 28 50 Q35 58 41 50 Q47 58 54 50 Q60 58 67 50 Q73 58 79 50 L84 50" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M32 78 A14 14 0 0 1 60 78 Z" fill="#cdeeff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M46 78 V69" stroke="#ff3b57" stroke-width="2.6" stroke-linecap="round"/>' +
          '<circle cx="50" cy="22" r="5" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/>';
      case 'coaster': /* รถไฟเหาะสายรุ้ง */
        return '<path d="M8 80 Q22 80 28 62 Q36 30 50 30 Q64 30 72 62 Q78 80 92 80" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
          '<path d="M8 80 Q22 80 28 62 Q36 30 50 30 Q64 30 72 62 Q78 80 92 80" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/>' +
          '<path d="M24 82 V88 M40 52 V88 M60 52 V88 M76 82 V88" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' +
          '<g transform="translate(34 36) rotate(-38)"><rect x="-12" y="-9" width="24" height="15" rx="6" fill="#ff5fa2" stroke="' + INK + '" stroke-width="3.2"/><circle cx="-5" cy="-11" r="4.4" fill="#ffd7b4" stroke="' + INK + '" stroke-width="2.4"/><circle cx="5" cy="-11" r="4.4" fill="#ffd7b4" stroke="' + INK + '" stroke-width="2.4"/><circle cx="-6" cy="8" r="3.4" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><circle cx="6" cy="8" r="3.4" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/></g>' +
          '<path d="M50 30 V16 L62 20 L50 24" fill="#ff5a4e" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
      case 'swing': /* ชิงช้าหมุนติ้ว */
        return '<path d="M48 90 V26" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M48 90 V26" stroke="#8b5cf6" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M12 36 Q48 6 88 36 Z" fill="#ff9a1f" stroke="' + INK + '" stroke-width="3.6" stroke-linejoin="round"/>' +
          '<path d="M12 36 Q20 44 28 36 Q36 44 48 36 Q60 44 68 36 Q76 44 88 36" fill="#ffd23f" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M24 42 L18 70 M36 42 L34 72 M62 42 L66 72 M74 42 L82 70" stroke="' + INK + '" stroke-width="2.4"/>' +
          '<rect x="12" y="70" width="12" height="9" rx="4" fill="#3ba8ff" stroke="' + INK + '" stroke-width="2.8"/><rect x="29" y="72" width="12" height="9" rx="4" fill="#ff5fa2" stroke="' + INK + '" stroke-width="2.8"/>' +
          '<rect x="58" y="72" width="12" height="9" rx="4" fill="#3ccf7a" stroke="' + INK + '" stroke-width="2.8"/><rect x="76" y="70" width="12" height="9" rx="4" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.8"/>' +
          '<circle cx="48" cy="14" r="5.4" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3"/>';
      case 'castle': /* ปราสาทกระจกวิเศษ */
        return '<rect x="24" y="48" width="52" height="40" rx="3" fill="#d9f2ff" stroke="' + INK + '" stroke-width="3.6"/>' +
          '<path d="M32 48 V32 L40 24 L48 32 V48" fill="#e8d9ff" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
          '<path d="M52 48 V32 L60 24 L68 32 V48" fill="#ffd9ec" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
          '<path d="M14 88 V44 L24 30 L34 44 V88 Z" fill="#a8e1ff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
          '<path d="M66 88 V44 L76 30 L86 44 V88 Z" fill="#a8e1ff" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
          '<path d="M24 30 V16 L36 20 L24 24" fill="#ff5a4e" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M76 30 V16 L88 20 L76 24" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M42 88 V72 A8 8 0 0 1 58 72 V88 Z" fill="#8b5cf6" stroke="' + INK + '" stroke-width="3.2"/><path d="M20 56 l4 -6 l4 6 M72 56 l4 -6 l4 6" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>' +
          '<path d="M30 62 l6 -5 M30 72 l12 -10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>';
      case 'grand': /* ปราสาทยักษ์ + ชิงช้าสวรรค์ */
        {
          let sp = '', cab = '';
          for (let i = 0; i < 8; i++) {
            const a = i * 45, p = P(34, a);
            sp += 'M50 50 L' + f1(50 + p[0]) + ' ' + f1(50 + p[1]);
            cab += '<circle cx="' + f1(50 + p[0]) + '" cy="' + f1(50 + p[1]) + '" r="5" fill="' + ['#ff5a4e', '#ffd23f', '#3ccf7a', '#3ba8ff'][i % 4] + '" stroke="' + INK + '" stroke-width="2.6"/>';
          }
          return '<path d="M30 92 L50 50 L70 92" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<g class="ferris-spin"><circle cx="50" cy="50" r="34" fill="rgba(255,255,255,.35)" stroke="' + INK + '" stroke-width="4"/><path d="' + sp + '" stroke="' + INK + '" stroke-width="2.6"/>' + cab + '</g>' +
            '<circle cx="50" cy="50" r="7" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4"/>' +
            '<path d="M42 10 L46 18 L54 18 L48 23 L50 31 L42 26 L34 31 L36 23 L30 18 L38 18 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" transform="translate(8 -9) scale(.95)"/>';
        }
    }
    return '';
  }
  function badge(kind, col) {
    const g = uid('bg');
    return '<svg class="badge" viewBox="0 0 100 100" aria-hidden="true">' +
      '<defs><radialGradient id="' + g + '" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".38" stop-color="' + col + '"/><stop offset="1" stop-color="' + col + '"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="47" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="4.4"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-dasharray="2 7" stroke-linecap="round"/>' +
      '<g transform="translate(5 3) scale(.9)">' + rideArt(kind) + '</g></svg>';
  }

  /* ══════════ ของตกแต่ง ══════════ */
  function balloon(col) {
    return '<svg class="balloon" viewBox="0 0 40 70" aria-hidden="true"><path d="M20 4 C34 4 38 18 36 28 C34 38 26 46 20 50 C14 46 6 38 4 28 C2 18 6 4 20 4 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M11 14 Q13 8 19 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M16 50 L24 50 L20 55 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M20 55 Q14 62 22 68" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  function flag() {
    return '<svg class="flagsvg" viewBox="0 0 40 52" aria-hidden="true"><path d="M8 50 V6" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path class="flag-wave" d="M8 8 H34 L28 17 L34 26 H8 Z" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M19 11 L21 16 L26 16.4 L22.2 19.4 L23.4 24 L19 21.6 L14.6 24 L15.8 19.4 L12 16.4 L17 16 Z" fill="#fff" transform="translate(0 -1) scale(.95)" transform-origin="19 17"/><circle cx="8" cy="5" r="3.4" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.4"/></svg>';
  }
  function rainbowBand(w, h) {
    const cols = ['#ff5a4e', '#ff9a1f', '#ffd23f', '#3ccf7a', '#3ba8ff', '#8b5cf6'];
    const bh = (h || 24) / cols.length;
    return '<svg class="rband" viewBox="0 0 ' + (w || 300) + ' ' + (h || 24) + '" preserveAspectRatio="none" aria-hidden="true">' +
      cols.map((c, i) => '<rect x="0" y="' + f1(i * bh) + '" width="' + (w || 300) + '" height="' + f1(bh + .4) + '" fill="' + c + '"/>').join('') + '</svg>';
  }

  /* ══════════ ฉากสวนสนุก (พื้นหลังเต็มจอ) ══════════ */
  function parkBackdrop() {
    const sg = uid('sky'), hg = uid('hill'), gg = uid('gr');
    let tents = '', bals = '', trees = '', wheel = '', spokes = '', cabs = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 30, p = P(120, a);
      spokes += 'M0 0 L' + f1(p[0]) + ' ' + f1(p[1]);
      cabs += '<g transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ')"><g class="cab"><path d="M0 0 V10" stroke="' + INK + '" stroke-width="3"/><rect x="-10" y="10" width="20" height="16" rx="5" fill="' + ['#ff5a4e', '#ffd23f', '#3ccf7a', '#3ba8ff', '#ff5fa2', '#ff9a1f'][i % 6] + '" stroke="' + INK + '" stroke-width="3"/></g></g>';
    }
    wheel = '<g transform="translate(1150 470)"><path d="M-70 280 L0 0 L70 280" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g class="bgwheel"><circle r="120" fill="rgba(255,255,255,.28)" stroke="' + INK + '" stroke-width="7"/><circle r="84" fill="none" stroke="' + INK + '" stroke-width="3.4" opacity=".6"/><path d="' + spokes + '" stroke="' + INK + '" stroke-width="3.6"/>' + cabs + '</g>' +
      '<circle r="14" fill="#ffd23f" stroke="' + INK + '" stroke-width="5"/></g>';
    const tent = (x, y, w, h, c1, c2) => {
      let st = '';
      const n = 6;
      for (let i = 0; i < n; i++) {
        const x0 = x - w / 2 + (w / n) * i, x1 = x0 + w / n;
        st += '<path d="M' + f1(x0) + ' ' + (y) + ' L' + x + ' ' + (y - h) + ' L' + f1(x1) + ' ' + (y) + ' Z" fill="' + (i % 2 ? c1 : c2) + '"/>';
      }
      return '<g>' + st + '<path d="M' + (x - w / 2) + ' ' + y + ' L' + x + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + y + ' Z" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<rect x="' + (x - w / 2 + 10) + '" y="' + y + '" width="' + (w - 20) + '" height="46" fill="#fff4cf" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M' + (x - 22) + ' ' + (y + 46) + ' V' + (y + 20) + ' A22 22 0 0 1 ' + (x + 22) + ' ' + (y + 20) + ' V' + (y + 46) + ' Z" fill="#8b5cf6" stroke="' + INK + '" stroke-width="4.4"/>' +
        '<circle cx="' + x + '" cy="' + (y - h - 8) + '" r="9" fill="#ffd23f" stroke="' + INK + '" stroke-width="4"/></g>';
    };
    tents = tent(300, 590, 220, 120, '#ff5a4e', '#fff') + tent(640, 600, 170, 96, '#3ba8ff', '#fff');
    const bcol = ['#ff5a4e', '#ffd23f', '#3ba8ff', '#ff5fa2', '#3ccf7a', '#8b5cf6'];
    [[120, 360], [200, 300], [520, 250], [760, 330], [900, 220], [1330, 300], [1450, 380], [60, 220]].forEach((b, i) => {
      bals += '<g transform="translate(' + b[0] + ' ' + b[1] + ')"><g class="bgbal b' + (i % 4) + '"><g transform="scale(1.35)">' + balloonRaw(bcol[i % bcol.length]) + '</g></g></g>';
    });
    [[90, 640], [480, 650], [980, 655], [1400, 645]].forEach((t, i) => {
      trees += '<g transform="translate(' + t[0] + ' ' + t[1] + ')"><rect x="-7" y="-12" width="14" height="46" rx="5" fill="#a86b3c" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="0" cy="-32" r="34" fill="' + (i % 2 ? '#52d47f' : '#3ccf7a') + '" stroke="' + INK + '" stroke-width="4.4"/><circle cx="-12" cy="-44" r="9" fill="#fff" opacity=".35"/></g>';
    });
    /* รุ้ง */
    const rb = ['#ff5a4e', '#ff9a1f', '#ffd23f', '#3ccf7a', '#3ba8ff', '#8b5cf6'].map((c, i) =>
      '<path d="M-' + (360 - i * 20) + ' 0 A' + (360 - i * 20) + ' ' + (360 - i * 20) + ' 0 0 1 ' + (360 - i * 20) + ' 0" fill="none" stroke="' + c + '" stroke-width="21" opacity=".9"/>').join('');
    return '<svg class="park-svg" viewBox="0 0 1600 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><linearGradient id="' + sg + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd0ff"/><stop offset=".6" stop-color="#bdeaff"/><stop offset="1" stop-color="#fff0c9"/></linearGradient>' +
      '<linearGradient id="' + hg + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe28a"/><stop offset="1" stop-color="#5fcf78"/></linearGradient>' +
      '<linearGradient id="' + gg + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe07a"/><stop offset="1" stop-color="#46bd68"/></linearGradient></defs>' +
      '<rect width="1600" height="760" fill="url(#' + sg + ')"/>' +
      /* พระอาทิตย์ยิ้ม */
      '<g transform="translate(250 130)"><g class="bgsun"><path d="' + (function () { let d = ''; for (let i = 0; i < 16; i++) { const a = i * 22.5; const p0 = P(70, a), p1 = P(94, a); d += 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + 'L' + f1(p1[0]) + ' ' + f1(p1[1]); } return d; })() + '" stroke="#ffb21f" stroke-width="9" stroke-linecap="round"/></g>' +
        '<circle r="58" fill="#ffe14a" stroke="' + INK + '" stroke-width="5"/><circle cx="-18" cy="-8" r="6" fill="' + INK + '"/><circle cx="18" cy="-8" r="6" fill="' + INK + '"/><path d="M-20 12 Q0 32 20 12" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><ellipse cx="-34" cy="10" rx="9" ry="6" fill="#ff9aa8" opacity=".8"/><ellipse cx="34" cy="10" rx="9" ry="6" fill="#ff9aa8" opacity=".8"/></g>' +
      /* รุ้ง */
      '<g transform="translate(860 560)" opacity=".75">' + rb + '</g>' +
      /* เมฆ */
      '<g transform="translate(560 120)"><g class="bgcloud c1"><path d="M0 40 Q-4 18 20 18 Q26 -6 56 6 Q78 -8 94 14 Q118 14 114 40 Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/></g></g>' +
      '<g transform="translate(1120 90)"><g class="bgcloud c2"><path d="M0 36 Q-4 14 18 14 Q26 -8 52 4 Q72 -6 86 12 Q106 12 104 36 Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="40" cy="26" r="2.6" fill="' + INK + '"/><circle cx="58" cy="26" r="2.6" fill="' + INK + '"/><path d="M45 31 Q49 35 53 31" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g></g>' +
      '<g transform="translate(120 200)"><g class="bgcloud c3"><path d="M0 30 Q-4 10 16 10 Q22 -8 44 2 Q62 -6 74 10 Q92 10 90 30 Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/></g></g>' +
      /* เนินไกล */
      '<path d="M0 520 Q220 420 460 500 Q700 560 920 470 Q1160 380 1380 480 Q1500 520 1600 480 V760 H0 Z" fill="url(#' + hg + ')" stroke="' + INK + '" stroke-width="5"/>' +
      wheel + tents + bals +
      /* พื้น + ทางเดิน */
      '<path d="M0 640 Q400 600 800 630 Q1200 660 1600 620 V760 H0 Z" fill="url(#' + gg + ')" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M0 700 Q400 668 800 692 Q1200 716 1600 684" fill="none" stroke="#f3d9a4" stroke-width="40" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M0 700 Q400 668 800 692 Q1200 716 1600 684" fill="none" stroke="#fff6dc" stroke-width="4" stroke-dasharray="10 22" stroke-linecap="round"/>' +
      trees + '</svg>';
  }
  function balloonRaw(col) {
    return '<path d="M0 -30 C14 -30 18 -16 16 -6 C14 4 6 12 0 16 C-6 12 -14 4 -16 -6 C-18 -16 -14 -30 0 -30 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M-9 -20 Q-7 -26 -1 -26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M-4 16 L4 16 L0 21 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M0 21 Q-6 28 2 34" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>';
  }

  /* ปราสาทสายรุ้งตอนจบ */
  function grandCastle() {
    const g = uid('gc');
    let fw = '';
    [[40, 60, '#ff5fa2'], [300, 40, '#ffd23f'], [170, 20, '#3ba8ff']].forEach((p, i) => {
      let d = '';
      for (let k = 0; k < 10; k++) { const a = k * 36, p0 = P(8, a), p1 = P(24, a); d += 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + 'L' + f1(p1[0]) + ' ' + f1(p1[1]); }
      fw += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><g class="firework f' + i + '"><path d="' + d + '" stroke="' + p[2] + '" stroke-width="4" stroke-linecap="round"/><circle r="3.4" fill="' + p[2] + '"/></g></g>';
    });
    return '<svg class="gcastle" viewBox="0 0 340 300" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3f3"/><stop offset="1" stop-color="#ffc4e4"/></linearGradient></defs>' + fw +
      '<g transform="translate(170 150) scale(1.9)" opacity=".85">' + ['#ff5a4e', '#ff9a1f', '#ffd23f', '#3ccf7a', '#3ba8ff', '#8b5cf6'].map((c, i) => '<path d="M-' + (74 - i * 4.4) + ' 40 A' + (74 - i * 4.4) + ' ' + (74 - i * 4.4) + ' 0 0 1 ' + (74 - i * 4.4) + ' 40" fill="none" stroke="' + c + '" stroke-width="5"/>').join('') + '</g>' +
      '<rect x="110" y="140" width="120" height="140" rx="6" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M86 280 V110 L112 80 L138 110 V280 Z" fill="#a8e1ff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M202 280 V110 L228 80 L254 110 V280 Z" fill="#a8e1ff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M138 140 V96 L170 56 L202 96 V140" fill="#e8d9ff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M112 80 V50 L132 58 L112 66" fill="#ff5a4e" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/><path d="M228 80 V50 L248 58 L228 66" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
      '<path d="M170 56 V26 L194 36 L170 46" fill="#3ccf7a" stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"/>' +
      '<path d="M146 280 V224 A24 24 0 0 1 194 224 V280 Z" fill="#8b5cf6" stroke="' + INK + '" stroke-width="5"/><circle cx="184" cy="246" r="3.4" fill="#ffd23f"/>' +
      '<path d="M170 128 l8 -12 l8 12 z" fill="#ffd23f" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" transform="translate(-8 -2)"/>' +
      '<path d="M100 150 l10 -14 l10 14 M218 150 l10 -14 l10 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M40 288 H300" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/></svg>';
  }

  /* การ์ดตัวเลือกประเภทมุม : ไอคอนมุมเล็ก ๆ */
  function typeGlyph(kind) {
    const a = { acute: 40, right: 90, obtuse: 130, straight: 180 }[kind] || 40;
    const f = M.figure({ b: 0, dir: 1, size: a, V: { x: 80, y: 100 }, len: 56 });
    return '<svg class="glyph" viewBox="10 20 150 100" aria-hidden="true">' + figureMarkup(f, { arcR: 22 }) + '</svg>';
  }

  AP.art = {
    INK, icon, star, stars, pro, zig, kid, protractorInner, protractor, figureMarkup, miniPlacement,
    badge, rideArt, balloon, flag, rainbowBand, parkBackdrop, grandCastle, typeGlyph, uid
  };
})();
