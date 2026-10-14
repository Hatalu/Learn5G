/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — งานภาพ SVG: ตัวละคร (ปิ๊บ / ฟู่ว) ไอคอน อาคารบนแผนที่ ยานพาหนะ เครื่องมือ ไอคอนเวลา
   ไม่มีไฟล์รูปภาพ ไม่มีอิโมจิ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP = window.PP || {};
  const INK = '#2a2350';
  const S = ' stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const S3 = ' stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  /* ── ปิ๊บ : ลูกเจี๊ยบนกไปรษณีย์ หมวกแดง กระเป๋าสะพาย ── */
  function pipBody(mood) {
    const E = '#fff';
    const eyes = {
      happy: '<path d="M-22 -4 q7 -10 14 0 M8 -4 q7 -10 14 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      cheer: '<path d="M-22 -2 q7 -11 14 0 M8 -2 q7 -11 14 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      wow: '<circle cx="-15" cy="-4" r="9" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="15" cy="-4" r="9" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-15" cy="-4" r="4" fill="' + INK + '"/><circle cx="15" cy="-4" r="4" fill="' + INK + '"/>',
      think: '<circle cx="-15" cy="-4" r="8.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-12" cy="-8" r="3.8" fill="' + INK + '"/><path d="M6 -4 h18" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>',
      oops: '<path d="M-26 -16 l16 -6 M26 -16 l-16 -6" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/><circle cx="-15" cy="-4" r="4.6" fill="' + INK + '"/><circle cx="15" cy="-4" r="4.6" fill="' + INK + '"/>',
      sad: '<path d="M-24 -10 q9 -6 18 0 M6 -10 q9 -6 18 0" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/><circle cx="-15" cy="-1" r="4.2" fill="' + INK + '"/><circle cx="15" cy="-1" r="4.2" fill="' + INK + '"/><path d="M-20 6 q-2 6 0 9" stroke="#7dd3ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
      talk: '<circle cx="-15" cy="-4" r="8.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="15" cy="-4" r="8.5" fill="' + E + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-14" cy="-5" r="4.2" fill="' + INK + '"/><circle cx="16" cy="-5" r="4.2" fill="' + INK + '"/><circle cx="-12.6" cy="-6.6" r="1.5" fill="#fff"/><circle cx="17.4" cy="-6.6" r="1.5" fill="#fff"/>'
    }[mood] || '';
    const open = mood === 'talk' || mood === 'cheer' || mood === 'wow';
    const beak = open
      ? '<g class="p-beak"><path d="M-9 8 l9 -3 l9 3 l-9 4z" fill="#ff9a3d"' + S + '/><path class="p-jaw" d="M-8 12 l8 -1 l8 1 l-8 9z" fill="#e86a1c"' + S + '/></g>'
      : mood === 'sad' || mood === 'oops'
        ? '<path d="M-9 12 l9 -6 l9 6 l-9 3z" fill="#ff9a3d"' + S + '/>'
        : '<path d="M-9 7 l9 -3 l9 3 l-9 9z" fill="#ff9a3d"' + S + '/>';
    const up = mood === 'cheer' || mood === 'wow';
    const wingL = up ? '<path class="p-wing p-wl" d="M-38 10 q-22 -6 -26 -30 q10 -2 20 8 q8 10 10 20z" fill="#ffc83a"' + S + '/>' : '<path class="p-wing p-wl" d="M-40 8 q-14 8 -10 26 q12 2 18 -8 q2 -10 -8 -18z" fill="#ffc83a"' + S + '/>';
    const wingR = up ? '<path class="p-wing p-wr" d="M38 10 q22 -6 26 -30 q-10 -2 -20 8 q-8 10 -10 20z" fill="#ffc83a"' + S + '/>' : '<path class="p-wing p-wr" d="M40 8 q14 8 10 26 q-12 2 -18 -8 q-2 -10 8 -18z" fill="#ffc83a"' + S + '/>';
    return '<ellipse cx="0" cy="62" rx="36" ry="6" fill="rgba(0,0,0,.18)"/>' +
      '<g class="p-body">' +
        '<path d="M-14 54 v8 M-14 62 l-8 3 M-14 62 l0 4 M-14 62 l8 3 M14 54 v8 M14 62 l-8 3 M14 62 l0 4 M14 62 l8 3" fill="none" stroke="#ff9a3d" stroke-width="3.6" stroke-linecap="round"/>' +
        wingL +
        '<ellipse cx="0" cy="16" rx="44" ry="42" fill="#ffd93f"' + S3 + '/>' +
        '<ellipse cx="0" cy="30" rx="26" ry="22" fill="#fff3b0" opacity=".85"/>' +
        '<path d="M-26 -8 q8 -14 22 -17" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>' +
        '<path d="M-30 -8 L32 40" stroke="#a8683a" stroke-width="7" stroke-linecap="round"/><path d="M-30 -8 L32 40" stroke="#d9a066" stroke-width="3" stroke-linecap="round"/>' +
        '<g transform="rotate(-8 32 44)"><rect x="18" y="32" width="30" height="26" rx="6" fill="#d9a066"' + S + '/><path d="M18 40 h30" stroke="' + INK + '" stroke-width="2.4"/><rect x="29" y="38" width="8" height="6" rx="2" fill="#ffd93f"' + S + '/></g>' +
        wingR +
        '<path d="M-32 -22 q-2 -34 32 -36 q34 2 32 36 q-32 8 -64 0z" fill="#ff5c6c"' + S3 + '/>' +
        '<path d="M-30 -28 q30 6 60 0" fill="none" stroke="#fff" stroke-width="4"/>' +
        '<path d="M-36 -20 q36 12 72 0 q4 8 -4 9 q-32 8 -64 0 q-8 -1 -4 -9z" fill="#c93a4b"' + S + '/>' +
        '<g transform="translate(0 -40)"><circle r="9" fill="#ffd93f"' + S + '/><path d="M-5 -2 h10 v6 h-10z M-5 -2 l5 4 l5 -4" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></g>' +
        '<path d="M-6 -60 q-6 -12 2 -16 q4 6 4 14z M4 -60 q8 -10 14 -6 q-4 8 -12 8z" fill="#ffd93f"' + S + ' opacity="0"/>' +
        eyes + beak +
        '<circle cx="-30" cy="12" r="5.4" fill="#ff8fb1" opacity=".65"/><circle cx="30" cy="12" r="5.4" fill="#ff8fb1" opacity=".65"/>' +
      '</g>';
  }
  function pip(mood) {
    mood = mood || 'happy';
    return '<svg class="pip mood-' + mood + '" viewBox="-72 -92 144 168" aria-hidden="true">' + pipBody(mood) + '</svg>';
  }
  /* ปิ๊บตัวเล็ก (ใช้เป็นไอเท็มในฉาก: วาดจากจุดกึ่งกลางล่าง สูงประมาณ 46 หน่วย) */
  function pipItem() { return '<g transform="translate(0 -4) scale(.5)">' + pipBody('happy') + '</g>'; }

  /* ── ฟู่ว : พายุหมุนจอมซน เป่าคำเล็ก ๆ ปลิวหายหมด ── */
  function whoosh(mood) {
    mood = mood || 'sneaky';
    const eyes = {
      sneaky: '<ellipse cx="-14" cy="-10" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><ellipse cx="14" cy="-10" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-11" cy="-9" r="4" fill="' + INK + '"/><circle cx="17" cy="-9" r="4" fill="' + INK + '"/><path d="M-26 -26 l17 6 M26 -26 l-17 6" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/>',
      shock: '<circle cx="-14" cy="-10" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="14" cy="-10" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-14" cy="-10" r="3" fill="' + INK + '"/><circle cx="14" cy="-10" r="3" fill="' + INK + '"/>',
      sad: '<path d="M-24 -8 q9 -9 18 0 M6 -8 q9 -9 18 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-26 -22 l16 -4 M26 -22 l-16 -4" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      happy: '<path d="M-24 -8 q9 -11 18 0 M6 -8 q9 -11 18 0" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[mood];
    const mouth = {
      sneaky: '<path d="M-14 8 q14 14 28 0z" fill="#fff" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>',
      shock: '<ellipse cx="0" cy="14" rx="7" ry="8" fill="#3a2a6a" stroke="' + INK + '" stroke-width="3"/>',
      sad: '<path d="M-9 16 q9 -9 18 0" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>',
      happy: '<path d="M-12 8 q12 14 24 0z" fill="#3a2a6a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
    }[mood];
    return '<svg class="whoosh mood-' + mood + '" viewBox="-80 -64 160 140" aria-hidden="true">' +
      '<ellipse cx="0" cy="68" rx="26" ry="4.5" fill="rgba(0,0,0,.14)"/>' +
      '<g class="w-body">' +
        /* หางพายุหมุนเป็นเกลียวชี้ลงขวา */
        '<g class="w-spin"><path d="M-26 22 C-20 54 12 70 46 64 C22 52 22 36 28 20 Z" fill="#bfe3ff"' + S3 + '/>' +
          '<path d="M-14 34 q18 8 34 2 M-6 46 q16 6 28 0 M2 56 q10 3 18 -1" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/></g>' +
        /* หัวกลมพองแก้ม (วาดขอบด้วยวงกลมซ้อน) */
        '<g fill="' + INK + '" stroke="' + INK + '" stroke-width="9"><circle cx="0" cy="-8" r="42"/><circle cx="-30" cy="10" r="16"/><circle cx="30" cy="10" r="16"/></g>' +
        '<g fill="#cfeaff"><circle cx="0" cy="-8" r="42"/><circle cx="-30" cy="10" r="16"/><circle cx="30" cy="10" r="16"/></g>' +
        '<path d="M-30 -30 q8 -14 24 -17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>' +
        /* เกลียวลมข้างตัว + ผมม้วน */
        '<g class="w-curl" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round">' +
          '<path d="M-58 -26 a4 4 0 1 1 4 4 a8 8 0 1 1 -8 -8 a13 13 0 1 1 13 13"/>' +
          '<path d="M58 -26 a4 4 0 1 0 -4 4 a8 8 0 1 0 8 -8 a13 13 0 1 0 -13 13"/>' +
          '<path d="M-3 -50 q-8 -10 2 -14 q9 -1 8 8 q-2 5 -7 3"/></g>' +
        eyes + mouth +
        '<circle cx="-34" cy="10" r="5.4" fill="#ff8fb1" opacity=".7"/><circle cx="34" cy="10" r="5.4" fill="#ff8fb1" opacity=".7"/>' +
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
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 8"/>',
    back: '<path d="M4 6h14a3 3 0 0 1 0 6H8"/><path d="M8 3L4 6l4 3"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    teacher: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    ear: '<path d="M7 9.5a5 5 0 0 1 10 0c0 3-2.5 3.5-3 6a3 3 0 0 1-5.5 1.5"/><path d="M10 9.5a2 2 0 0 1 4 0"/>',
    pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
    snail: '<path d="M3 18h16a2 2 0 0 0 0-4h-1"/><circle cx="11" cy="11" r="5"/><circle cx="11" cy="11" r="2"/><path d="M19 14l1-5M22 14l1-4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2.5"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || '') + '</svg>';
  }
  function star(on) {
    return '<svg class="st ' + (on ? 'on' : 'off') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.5 1.2 6.5L12 17.2l-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  /* ── ยานพาหนะ / เครื่องมือ / ไอเท็มเวลา (วาดในกรอบ 80x56 หรือ 48x54 กลางจุด 0,0) ── */
  const T = {
    bus: '<rect x="-36" y="-20" width="72" height="36" rx="9" fill="#ffd93f"' + S3 + '/><rect x="-30" y="-14" width="16" height="13" rx="3" fill="#bfe9ff"' + S + '/><rect x="-10" y="-14" width="16" height="13" rx="3" fill="#bfe9ff"' + S + '/><rect x="10" y="-14" width="20" height="17" rx="3" fill="#bfe9ff"' + S + '/><path d="M-36 6 h72" stroke="' + INK + '" stroke-width="2.4"/><circle cx="-20" cy="18" r="7.5" fill="#6a5fa0"' + S3 + '/><circle cx="20" cy="18" r="7.5" fill="#6a5fa0"' + S3 + '/><circle cx="-20" cy="18" r="2.6" fill="#fff"/><circle cx="20" cy="18" r="2.6" fill="#fff"/>',
    boat: '<path d="M-34 4 h68 l-10 16 h-48z" fill="#ff5c6c"' + S3 + '/><path d="M0 4 v-30" stroke="' + INK + '" stroke-width="3.4"/><path d="M3 -26 l24 20 h-24z" fill="#fff"' + S3 + '/><path d="M-3 -20 l-18 16 h18z" fill="#ffe7a8"' + S3 + '/><path d="M0 -26 l12 4 l-12 4z" fill="#ffd93f"' + S + '/><path d="M-40 24 q5 -5 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" fill="none" stroke="#2a8cf0" stroke-width="3.2" stroke-linecap="round"/>',
    train: '<rect x="-36" y="-18" width="50" height="34" rx="7" fill="#4a7bf0"' + S3 + '/><path d="M14 -18 h14 l8 12 v22 h-22z" fill="#3a63d0"' + S3 + '/><rect x="-30" y="-12" width="12" height="12" rx="3" fill="#bfe9ff"' + S + '/><rect x="-12" y="-12" width="12" height="12" rx="3" fill="#bfe9ff"' + S + '/><rect x="18" y="-10" width="10" height="10" rx="3" fill="#bfe9ff"' + S + '/><rect x="-6" y="-26" width="14" height="8" rx="2" fill="#ffd93f"' + S + '/><circle cx="-22" cy="18" r="6.5" fill="#6a5fa0"' + S3 + '/><circle cx="-2" cy="18" r="6.5" fill="#6a5fa0"' + S3 + '/><circle cx="22" cy="18" r="6.5" fill="#6a5fa0"' + S3 + '/><path d="M-40 25 h80" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>',
    bike: '<circle cx="-22" cy="8" r="14" fill="none"' + S3 + '/><circle cx="22" cy="8" r="14" fill="none"' + S3 + '/><path d="M-22 8 L-6 -12 H12 L22 8 M-6 -12 L2 8 H-22 M12 -12 L10 -20 H18 M-6 -12 L-10 -18 H-2" fill="none" stroke="#ff5c6c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-22 8 L-6 -12 H12 L22 8 M-6 -12 L2 8 H-22 M12 -12 L10 -20 H18 M-6 -12 L-10 -18 H-2" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="2" cy="8" r="3" fill="#ffd93f"' + S + '/>',
    car: '<path d="M-38 6 v-8 q0 -6 8 -8 l8 -12 q3 -4 8 -4 h14 q5 0 8 4 l10 12 q10 2 10 8 v8z" fill="#3fd6a8"' + S3 + '/><path d="M-20 -10 l6 -10 h12 v10z M2 -10 v-10 h10 l8 10z" fill="#bfe9ff"' + S + '/><circle cx="-22" cy="8" r="8" fill="#6a5fa0"' + S3 + '/><circle cx="22" cy="8" r="8" fill="#6a5fa0"' + S3 + '/><circle cx="-22" cy="8" r="2.6" fill="#fff"/><circle cx="22" cy="8" r="2.6" fill="#fff"/>',
    plane: '<path d="M-38 4 q0 -10 12 -10 h40 q16 0 24 10 q-8 8 -24 8 h-40 q-12 0 -12 -8z" fill="#fff"' + S3 + '/><path d="M-4 -6 l-14 -22 h12 l20 22z M-4 12 l-14 20 h12 l20 -20z" fill="#4a7bf0"' + S3 + '/><path d="M-36 -2 l-6 -14 h10 l8 14z" fill="#4a7bf0"' + S3 + '/><circle cx="22" cy="2" r="3" fill="#bfe9ff"' + S + '/><circle cx="12" cy="2" r="3" fill="#bfe9ff"' + S + '/><circle cx="2" cy="2" r="3" fill="#bfe9ff"' + S + '/>',
    scissors: '<path d="M-14 -22 L10 8 M14 -22 L-10 8" fill="none" stroke="#b9c4d6" stroke-width="5" stroke-linecap="round"/><path d="M-14 -22 L10 8 M14 -22 L-10 8" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><circle cx="-12" cy="14" r="8" fill="none" stroke="#ff5c6c" stroke-width="5"/><circle cx="12" cy="14" r="8" fill="none" stroke="#ff5c6c" stroke-width="5"/><circle cx="-12" cy="14" r="10.2" fill="none" stroke="' + INK + '" stroke-width="1.6"/><circle cx="12" cy="14" r="10.2" fill="none" stroke="' + INK + '" stroke-width="1.6"/>',
    pen: '<path d="M-16 20 l-3 8 l8 -3 l26 -34 l-8 -8z" fill="#ffd93f"' + S3 + '/><path d="M12 -17 l-8 -8 l5 -4 q5 -2 8 3 q3 5 -2 8z" fill="#ff5c6c"' + S3 + '/><path d="M-19 28 l8 -3 l-5 -5z" fill="' + INK + '"/>',
    spoon: '<ellipse cx="0" cy="-16" rx="11" ry="14" fill="#e6ecf7"' + S3 + '/><path d="M0 -2 v30" stroke="#b9c4d6" stroke-width="7" stroke-linecap="round"/><path d="M0 -2 v30" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><path d="M-5 -22 q3 -4 7 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>',
    key: '<circle cx="-12" cy="-6" r="11" fill="#ffd93f"' + S3 + '/><circle cx="-12" cy="-6" r="4" fill="#fff8ec"' + S + '/><path d="M-3 0 L22 20 M10 12 l5 -5 M17 18 l5 -5" fill="none" stroke="#ffd93f" stroke-width="6" stroke-linecap="round"/><path d="M-3 0 L22 20" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>',
    brush: '<path d="M14 -24 l8 8 l-26 30 l-10 4 l4 -10z" fill="#d9a066"' + S3 + '/><path d="M-16 8 q-6 14 -16 18 q12 4 22 -4 q4 -6 -2 -10z" fill="#ff5c6c"' + S3 + '/><path d="M-6 8 l10 10" stroke="' + INK + '" stroke-width="2.4"/>',
    cake: '<path d="M-20 10 v-14 l40 0 v14 q0 6 -20 6 q-20 0 -20 -6z" fill="#fff0c8"' + S3 + '/><path d="M-20 -4 q10 9 20 0 q10 -9 20 0" fill="#ff8fb1"' + S3 + '/><path d="M0 -4 v-10" stroke="' + INK + '" stroke-width="3"/><path d="M0 -26 q5 7 0 11 q-5 -4 0 -11z" fill="#ff9a3d"' + S + '/>',
    sun: '<circle r="13" fill="#ffd93f"' + S3 + '/><g stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path d="M0 -19 v-6 M0 19 v6 M-19 0 h-6 M19 0 h6 M-13 -13 l-4 -4 M13 13 l4 4 M-13 13 l-4 4 M13 -13 l4 -4"/></g>',
    moon: '<path d="M8 -20 a20 20 0 1 0 14 30 a16 16 0 1 1 -14 -30z" fill="#ffe7a8"' + S3 + '/><path d="M-22 -14 l2 5 l5 1 l-4 3 l1 5 l-4 -3 l-4 3 l1 -5 l-4 -3 l5 -1z" fill="#ffd93f" transform="translate(30 -4) scale(.6)"/>',
    sunrise: '<path d="M-26 14 h52" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-14 14 a14 14 0 0 1 28 0z" fill="#ffb347"' + S3 + '/><g stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path d="M0 -8 v-8 M-20 0 l-6 -5 M20 0 l6 -5"/></g><path d="M-22 22 h44" stroke="#ffd9a0" stroke-width="3" stroke-linecap="round"/>',
    sunset: '<path d="M-26 14 h52" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-14 14 a14 14 0 0 1 28 0z" fill="#ff7a8a"' + S3 + '/><g stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path d="M-20 0 l-6 -5 M20 0 l6 -5 M0 -8 v-8"/></g><path d="M-22 22 h44" stroke="#ffb3c0" stroke-width="3" stroke-linecap="round"/>',
    rain: '<path d="M-18 4 a10 10 0 0 1 2 -19 a14 14 0 0 1 27 2 a9 9 0 0 1 3 17z" fill="#cfe3ff"' + S3 + '/><g stroke="#2a8cf0" stroke-width="3.4" stroke-linecap="round"><path d="M-12 12 l-3 9 M0 12 l-3 9 M12 12 l-3 9"/></g>',
    star: '<path d="M0 -17 l5 11 l12 1.5 l-9 8 l2.6 12 l-10.6 -6 l-10.6 6 l2.6 -12 l-9 -8 l12 -1.5z" fill="#ffd93f"' + S + '/>'
  };
  function thing(key, size) {
    const sz = size || 40;
    return '<svg class="thing" viewBox="-44 -34 88 68" width="' + sz + '" height="' + Math.round(sz * 0.78) + '" aria-hidden="true">' + (T[key] || T.star) + '</svg>';
  }

  /* นาฬิกา (analog) */
  function clockFace(h, m, size) {
    m = m || 0;
    const a = (h % 12 + m / 60) / 12 * Math.PI * 2, b = m / 60 * Math.PI * 2;
    const hx = Math.sin(a) * 14, hy = -Math.cos(a) * 14, mx = Math.sin(b) * 21, my = -Math.cos(b) * 21;
    let ticks = '';
    for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2; ticks += '<path d="M' + (Math.sin(t) * 26).toFixed(1) + ' ' + (-Math.cos(t) * 26).toFixed(1) + ' L' + (Math.sin(t) * (i % 3 ? 29 : 24)).toFixed(1) + ' ' + (-Math.cos(t) * (i % 3 ? 29 : 24)).toFixed(1) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 2.6) + '" stroke-linecap="round"/>'; }
    return '<svg class="clock" viewBox="-36 -36 72 72" width="' + (size || 64) + '" height="' + (size || 64) + '" aria-hidden="true"><circle r="33" fill="#fff"' + S3 + '/>' + ticks +
      '<path d="M0 0 L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/><path d="M0 0 L' + mx.toFixed(1) + ' ' + my.toFixed(1) + '" stroke="#ff5c6c" stroke-width="3" stroke-linecap="round"/><circle r="3.2" fill="' + INK + '"/></svg>';
  }
  /* หน้าปฏิทิน: วันเดียว (on) / ทั้งเดือน (in) */
  function calPage(big, small, size, kind) {
    const w = size || 64;
    let grid = '';
    if (kind === 'month') {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) grid += '<rect x="' + (-26 + c * 9) + '" y="' + (-2 + r * 8) + '" width="7" height="6" rx="1.5" fill="#d7d1ec"/>';
    }
    return '<svg class="calpg" viewBox="-36 -36 72 72" width="' + w + '" height="' + w + '" aria-hidden="true"><rect x="-31" y="-30" width="62" height="62" rx="9" fill="#fff"' + S3 + '/><path d="M-31 -14 v-7 a9 9 0 0 1 9 -9 h44 a9 9 0 0 1 9 9 v7z" fill="#ff5c6c"' + S3 + '/>' +
      '<circle cx="-16" cy="-32" r="3" fill="#fff"' + S + '/><circle cx="16" cy="-32" r="3" fill="#fff"' + S + '/>' +
      (kind === 'month' ? '<text y="-4" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="13" fill="' + INK + '">' + big + '</text>' + grid : '<text y="9" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="' + (String(big).length > 3 ? 14 : 24) + '" fill="' + INK + '">' + big + '</text>') +
      (small ? '<text y="-17" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="9" fill="#fff">' + small + '</text>' : '') + '</svg>';
  }

  /* ── อาคารบนแผนที่ (วาดกลางจุด 0,0 พื้นอยู่ที่ y≈30) ── */
  function bld(kind) {
    const ground = '<ellipse cx="0" cy="32" rx="52" ry="9" fill="rgba(0,0,0,.16)"/>';
    let g = '';
    if (kind === 'mailbox') {
      g = '<rect x="-5" y="4" width="10" height="28" fill="#a8683a"' + S3 + '/><path d="M-30 4 v-40 a30 30 0 0 1 60 0 v40z" fill="#ff5c6c"' + S3 + '/><rect x="-18" y="-18" width="36" height="7" rx="3.5" fill="' + INK + '"/><path d="M-8 -18 l6 -12 l22 6 l-6 12z" fill="#fff"' + S + '/><path d="M-18 -4 h36 M-18 2 h36" stroke="#ff8a96" stroke-width="2.6"/><path d="M30 -24 h14 v12 h-14" fill="#ffd93f"' + S + '/><path d="M30 -30 v20" stroke="' + INK + '" stroke-width="3"/><path d="M-30 -2 h60" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>';
    } else if (kind === 'shelf') {
      g = '<path d="M-46 32 v-86 h92 v86" fill="#e9a35c"' + S3 + '/><path d="M-40 32 v-80 h80 v80" fill="#f6d9a8"' + S + '/><path d="M-40 -22 h80 M-40 8 h80" stroke="' + INK + '" stroke-width="3.4"/>' +
        '<rect x="-34" y="-40" width="22" height="18" rx="2" fill="#d9a066"' + S + '/><rect x="-6" y="-36" width="16" height="14" rx="2" fill="#ff8fb1"' + S + '/><rect x="14" y="-44" width="22" height="22" rx="2" fill="#4ab0ff"' + S + '/>' +
        '<rect x="-36" y="-10" width="18" height="18" rx="2" fill="#ffd93f"' + S + '/><rect x="-12" y="-4" width="24" height="12" rx="2" fill="#d9a066"' + S + '/><rect x="16" y="-14" width="18" height="22" rx="2" fill="#3fd6a8"' + S + '/>' +
        '<rect x="-34" y="18" width="30" height="14" rx="2" fill="#9b6cf0"' + S + '/><circle cx="14" cy="26" r="7" fill="#ff5c6c"' + S + '/>';
    } else if (kind === 'sign') {
      g = '<rect x="-4" y="-50" width="8" height="82" fill="#a8683a"' + S3 + '/><path d="M-4 -44 h40 l10 8 l-10 8 h-40z" fill="#ffd93f"' + S3 + '/><path d="M4 -22 h-38 l-10 8 l10 8 h38z" fill="#ff8fb1"' + S3 + '/><path d="M-4 2 h38 l10 8 l-10 8 h-38z" fill="#4ab0ff"' + S3 + '/><g transform="translate(0 -60)"><path d="M0 14 L-10 0 A12 12 0 1 1 10 0 Z" fill="#ff5c6c"' + S3 + '/><circle cy="-4" r="4.4" fill="#fff"/></g>';
    } else if (kind === 'clock') {
      g = '<path d="M-26 32 v-78 h52 v78z" fill="#f6d9a8"' + S3 + '/><path d="M-32 -46 l32 -34 l32 34z" fill="#ff5c6c"' + S3 + '/><circle cx="0" cy="-22" r="19" fill="#fff"' + S3 + '/><path d="M0 -22 v-11 M0 -22 l9 5" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/><circle cx="0" cy="-22" r="2.4" fill="' + INK + '"/><path d="M-9 -22 h0 M9 -22 h0 M0 -38 h0" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><rect x="-10" y="8" width="20" height="24" rx="10" fill="#a8683a"' + S3 + '/><path d="M-20 -4 h40" stroke="#e0a95f" stroke-width="3"/>';
    } else if (kind === 'harbor') {
      g = '<path d="M-52 18 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 v14 h-96z" fill="#69b8ff"' + S3 + '/><path d="M-32 8 h64 l-10 14 h-44z" fill="#ff5c6c"' + S3 + '/><path d="M0 8 v-52" stroke="' + INK + '" stroke-width="4"/><path d="M4 -44 l30 34 h-30z" fill="#fff"' + S3 + '/><path d="M-4 -34 l-22 24 h22z" fill="#ffe7a8"' + S3 + '/><path d="M0 -44 l14 5 l-14 5z" fill="#ffd93f"' + S + '/><path d="M-50 22 q6 -4 12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
    } else if (kind === 'tower') {
      g = '<path d="M-30 32 l8 -96 h28 l8 96z" fill="#9aa6ff"' + S3 + '/><path d="M-26 -8 h40 M-24 14 h36" stroke="' + INK + '" stroke-width="2.6"/><path d="M-30 -64 l22 -26 l22 26z" fill="#6d3fd0"' + S3 + '/><path d="M-8 -90 v-14 M-8 -104 h18 l-4 5 l4 5 h-18" fill="#ffd93f"' + S + '/><circle cx="-4" cy="-30" r="9" fill="#fff"' + S + '/><path d="M-4 -30 m0 -1 a1.5 1.5 0 1 1 1.5 1.5 a3 3 0 1 1 -4 -3 a5 5 0 1 1 6 6" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M-46 -36 q-14 -2 -16 -12 q8 -4 12 2 M30 -50 q14 -4 18 -16 q-8 -4 -12 4" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-44 -2 q-14 -2 -16 -12 M26 -20 q14 -2 18 -14" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>';
    }
    return '<g class="bld-art">' + ground + g + '</g>';
  }

  PP.art = { pip, pipBody, pipItem, whoosh, icon, star, thing, clockFace, calPage, bld, RAW: T, INK, S, S3 };
})();
