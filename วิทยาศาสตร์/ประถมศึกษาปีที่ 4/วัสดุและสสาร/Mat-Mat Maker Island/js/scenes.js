/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — ฉากและพื้นหลัง (SVG)
   zoneArt(1..6)  : ภาพของพื้นที่ทั้ง 6 (ใช้ในป้ายแผนที่ ปกพื้นที่ สมุดบันทึก)
   isleBackdrop() : ทะเล ท้องฟ้า เกาะ เมฆลอย นกบิน เรือใบ
   grandCastle()  : ปราสาทนักประดิษฐ์ ตอนจบ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM = window.MM || {};
  const A = MM.art;
  const INK = A.INK;
  const uid = A.uid;
  const st = w => ' stroke="' + INK + '" stroke-width="' + (w || 3.2) + '" stroke-linejoin="round" stroke-linecap="round"';

  /* ตัวสร้างไล่สีในฉาก */
  function scene(fn) {
    const defs = [];
    const g = (c0, c1, dir, c2) => {
      const id = uid('z');
      const xy = dir === 'h' ? [1, 0] : dir === 'd' ? [1, 1] : [0, 1];
      defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="' + xy[0] + '" y2="' + xy[1] + '"><stop offset="0" stop-color="' + c0 + '"/>' +
        (c2 ? '<stop offset=".5" stop-color="' + c2 + '"/>' : '') + '<stop offset="1" stop-color="' + c1 + '"/></linearGradient>');
      return 'url(#' + id + ')';
    };
    const rg = (c0, c1, cx, cy, r) => {
      const id = uid('y');
      defs.push('<radialGradient id="' + id + '" cx="' + (cx == null ? .5 : cx) + '" cy="' + (cy == null ? .5 : cy) + '" r="' + (r || .6) + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset="1" stop-color="' + c1 + '"/></radialGradient>');
      return 'url(#' + id + ')';
    };
    const body = fn(g, rg);
    return '<defs>' + defs.join('') + '</defs>' + body;
  }
  const cloud = (x, y, s, o) => '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')" opacity="' + (o == null ? 1 : o) + '"><path d="M0 12 Q-2 2 8 2 Q10 -8 22 -4 Q30 -12 38 -2 Q50 -2 48 10 Q48 14 42 14 H6 Q0 14 0 12 Z" fill="#fff"' + st(2.6) + '/></g>';

  const ZONES = {
    /* 1 เหมืองแข็งแรง : ภูเขา ถ้ำ รถเข็นหิน */
    1: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#ffe2b8', '#ffb877') + '"/>' +
      '<circle cx="158" cy="34" r="16" fill="' + rg('#fff7c2', '#ffd23f') + '"/>' + cloud(20, 24, .9, .9) +
      '<path d="M-6 150 V86 L36 52 L66 74 L104 30 L150 76 L176 60 L206 90 V150 Z" fill="' + g('#b98a5e', '#8a5a36') + '"' + st(3.6) + '/>' +
      '<path d="M104 30 L92 52 L104 48 L112 60 L120 46 Z" fill="#fff"' + st(2.6) + '/>' +
      '<path d="M62 150 V108 Q62 84 96 84 Q130 84 130 108 V150 Z" fill="#2a1d3a"' + st(3.6) + '/>' +
      '<path d="M62 108 H130 M70 150 V108 M122 150 V108" stroke="#c68a4e" stroke-width="5" opacity=".9"/>' +
      '<rect x="56" y="100" width="80" height="8" rx="3" fill="#c68a4e"' + st(3) + '/>' +
      '<g transform="translate(150 118)"><path d="M-22 -8 H22 L16 14 H-16 Z" fill="' + g('#b9c6d6', '#7d8ea2') + '"' + st(3.2) + '/><circle cx="-12" cy="-12" r="9" fill="#9b9aa6"' + st(2.6) + '/><circle cx="2" cy="-16" r="10" fill="#b8b7c6"' + st(2.6) + '/><circle cx="14" cy="-11" r="8" fill="#8c8b9b"' + st(2.6) + '/><circle cx="-12" cy="18" r="6" fill="#5b6a86"' + st(2.6) + '/><circle cx="12" cy="18" r="6" fill="#5b6a86"' + st(2.6) + '/></g>' +
      '<g transform="translate(34 128) rotate(-30)"><path d="M0 -26 V20" stroke="#8a5a2b"' + st(5) + '/><path d="M-18 -24 Q0 -34 18 -24" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-18 -24 Q0 -34 18 -24" fill="none" stroke="#c9d6e4" stroke-width="4.6" stroke-linecap="round"/></g>' +
      '<g fill="#6ee7ff" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"><path d="M22 96 l5 -8 l5 8 l-5 6 z"/><path d="M174 104 l4 -6 l4 6 l-4 5 z"/></g>' +
      '<path d="M0 138 Q50 132 100 140 T200 138 V150 H0 Z" fill="#7b5230"' + st(3) + '/>'),

    /* 2 โรงงานยางเด้ง : โรงงานสีชมพู ปล่องสปริง ลูกบอลเด้ง */
    2: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#ffd0e6', '#ff9ccb') + '"/>' + cloud(130, 16, .9, .9) + cloud(10, 40, .7, .8) +
      '<rect x="28" y="66" width="108" height="66" rx="8" fill="' + g('#ffffff', '#ffd8ea') + '"' + st(3.6) + '/>' +
      '<path d="M22 70 L82 40 L142 70 Z" fill="' + g('#ff6fa8', '#e0457a') + '"' + st(3.6) + '/>' +
      '<rect x="44" y="86" width="26" height="22" rx="4" fill="#bfe9ff"' + st(3) + '/><path d="M44 97 H70 M57 86 V108" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<rect x="86" y="86" width="26" height="22" rx="4" fill="#bfe9ff"' + st(3) + '/><path d="M86 97 H112 M99 86 V108" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<rect x="62" y="108" width="30" height="24" rx="4" fill="#ffd23f"' + st(3) + '/>' +
      '<g transform="translate(152 90)"><rect x="-10" y="20" width="20" height="22" rx="4" fill="#9a7bff"' + st(3.2) + '/>' +
        [0, 1, 2, 3].map(i => '<ellipse cx="0" cy="' + (14 - i * 11) + '" rx="13" ry="6" fill="none" stroke="' + INK + '" stroke-width="8"/><ellipse cx="0" cy="' + (14 - i * 11) + '" rx="13" ry="6" fill="none" stroke="#eef3f9" stroke-width="3.6"/>').join('') + '</g>' +
      '<g class="zs-bounce"><circle cx="168" cy="24" r="16" fill="' + rg('#ff9aa8', '#e0334f', .35, .3, .8) + '"' + st(3.4) + '/><path d="M154 20 Q168 32 182 20 V28 Q168 40 154 28 Z" fill="#ffd23f"' + st(2.2) + '/><ellipse cx="162" cy="16" rx="4" ry="2.6" fill="#fff" opacity=".7"/></g>' +
      '<path d="M8 132 H196" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M0 140 Q50 134 100 142 T200 140 V150 H0 Z" fill="#ff7fb5"' + st(3) + '/>'),

    /* 3 ครัวร้อนฉ่า : หม้อบนเตา ไอน้ำ ช้อน */
    3: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#fff0c9', '#ffc88a') + '"/>' +
      '<rect x="14" y="20" width="44" height="40" rx="6" fill="#bfe9ff"' + st(3.2) + '/><path d="M36 20 V60 M14 40 H58" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".95"><path d="M84 52 q8 -10 0 -20 t0 -20"/><path d="M104 50 q8 -10 0 -20 t0 -20"/><path d="M124 52 q8 -10 0 -20 t0 -20"/></g>' +
      '<path d="M62 66 H146 L140 112 Q139 120 130 120 H78 Q69 120 68 112 Z" fill="' + g('#e6edf5', '#7d8ea2') + '"' + st(3.8) + '/>' +
      '<path d="M72 74 H136" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><rect x="56" y="60" width="96" height="10" rx="5" fill="' + g('#f4f8fc', '#93a4b8') + '"' + st(3.4) + '/>' +
      '<path d="M146 78 H186 Q190 78 190 83 V89 Q190 94 186 94 H144 Z" fill="' + g('#a96e30', '#7a4a1c') + '"' + st(3.4) + '/>' +
      '<rect x="40" y="120" width="130" height="18" rx="6" fill="#5b6a86"' + st(3.6) + '/>' +
      '<g class="zs-flame"><path d="M64 120 C60 110 68 106 66 98 C74 104 76 114 72 120 Z" fill="#ff8a1f"' + st(2.2) + '/><path d="M90 120 C86 108 96 104 92 94 C102 102 104 114 98 120 Z" fill="#ffb02e"' + st(2.2) + '/><path d="M116 120 C112 110 120 106 118 98 C126 104 128 114 124 120 Z" fill="#ff8a1f"' + st(2.2) + '/><path d="M142 120 C138 110 146 106 144 98 C152 104 154 114 150 120 Z" fill="#ffb02e"' + st(2.2) + '/></g>' +
      '<g transform="translate(28 98) rotate(-18)"><path d="M0 -8 V34" stroke="#c68a4e"' + st(5) + '/><ellipse cx="0" cy="-16" rx="11" ry="14" fill="' + g('#e8b87a', '#b9783a') + '"' + st(3.2) + '/></g>' +
      '<path d="M0 142 H200 V150 H0 Z" fill="#c9622a"' + st(3) + '/>'),

    /* 4 หอไฟฟ้าแปลบ : หอคอยหลอดไฟ สายไฟ ฟ้าแลบ */
    4: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#7b6cf0', '#ffb347') + '"/>' +
      '<circle cx="100" cy="42" r="40" fill="' + rg('rgba(255,246,168,.9)', 'rgba(255,246,168,0)', .5, .5, .5) + '"/>' +
      '<path d="M70 140 L82 64 H118 L130 140 Z" fill="' + g('#e6edf5', '#7d8ea2', 'h') + '"' + st(3.8) + '/>' +
      '<path d="M76 110 H124 M79 90 H121 M82 74 H118" stroke="' + INK + '" stroke-width="3.2" opacity=".7"/>' +
      '<rect x="84" y="52" width="32" height="14" rx="4" fill="#ffd23f"' + st(3.4) + '/>' +
      '<path d="M100 14 C84 14 80 28 88 38 C92 43 92 46 92 50 H108 C108 46 108 43 112 38 C120 28 116 14 100 14 Z" fill="' + rg('#fffbd0', '#ffd23f', .4, .3, .8) + '"' + st(3.6) + '/>' +
      '<path d="M94 22 Q98 18 104 18" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<g fill="#fff6a8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"><path d="M44 28 L36 44 H44 L38 58 L54 38 H46 Z"/><path d="M156 20 L148 36 H156 L150 50 L166 30 H158 Z"/></g>' +
      '<path d="M0 120 Q40 100 76 108 M200 118 Q160 98 124 108" fill="none" stroke="' + INK + '" stroke-width="3.4"/>' +
      '<g stroke="' + INK + '" stroke-width="3.4"><path d="M22 140 V104 M12 110 H32"/><path d="M178 140 V102 M168 108 H188"/></g>' +
      '<path d="M0 140 Q60 132 100 142 T200 138 V150 H0 Z" fill="#3b2f7a"' + st(3) + '/>'),

    /* 5 ท่าเรือสามสถานะ : ก้อนน้ำแข็ง น้ำทะเล ลูกโป่ง */
    5: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#bfeaff', '#7fd0f0') + '"/>' + cloud(14, 22, .9, .95) + cloud(130, 40, .7, .85) +
      '<path d="M0 84 Q25 76 50 84 T100 84 T150 84 T200 84 V150 H0 Z" fill="' + g('#4aa8ff', '#1f6fd0') + '"' + st(3.4) + '/>' +
      '<path d="M0 100 Q25 92 50 100 T100 100 T150 100 T200 100" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M0 118 Q25 110 50 118 T100 118 T150 118 T200 118" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>' +
      '<rect x="10" y="96" width="96" height="12" rx="4" fill="' + g('#d9a066', '#a96e30') + '"' + st(3.4) + '/><path d="M24 108 V138 M60 108 V138 M94 108 V138" stroke="#7a4a1c" stroke-width="7" stroke-linecap="round"/>' +
      '<g transform="translate(30 62)"><path d="M0 14 L20 8 H42 L42 36 L22 42 L0 36 Z" fill="rgba(190,236,255,.9)"' + st(3.2) + '/><path d="M20 8 L22 42 M0 14 L22 20 L42 8" fill="none" stroke="#fff" stroke-width="2.4"/></g>' +
      '<g transform="translate(90 70)"><path d="M18 0 C28 12 36 22 36 32 A18 18 0 0 1 0 32 C0 22 8 12 18 0 Z" fill="' + g('#7fd2ff', '#1f8fe8') + '"' + st(3.4) + '/><path d="M8 28 Q10 36 16 40" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8"/></g>' +
      '<g class="zs-float"><path d="M154 10 C140 10 136 24 136 34 C136 46 146 54 154 58 C162 54 172 46 172 34 C172 24 168 10 154 10 Z" fill="' + rg('#e5f9ff', '#52d3c6', .35, .3, .8) + '"' + st(3.4) + '/><path d="M150 58 L154 64 L158 58 Z" fill="#52d3c6"' + st(2.6) + '/><path d="M146 22 Q150 16 156 16" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M0 136 Q50 130 100 138 T200 134 V150 H0 Z" fill="#1f6fd0"' + st(3) + '/>'),

    /* 6 ปราสาทนักประดิษฐ์ : ปราสาทเฟือง หลอดไฟบนยอด ธง */
    6: () => scene((g, rg) =>
      '<rect width="200" height="150" fill="' + g('#cbb8ff', '#8a63f0') + '"/>' +
      '<g fill="#fff" opacity=".9"><circle cx="24" cy="26" r="2.4"/><circle cx="170" cy="22" r="2.4"/><circle cx="150" cy="48" r="1.8"/><circle cx="40" cy="58" r="1.8"/></g>' +
      '<rect x="52" y="64" width="96" height="70" fill="' + g('#fff3d1', '#f0c98a') + '"' + st(3.8) + '/>' +
      '<g fill="' + g('#fff3d1', '#f0c98a') + '"' + st(3.6) + '><rect x="34" y="52" width="34" height="82"/><rect x="132" y="52" width="34" height="82"/></g>' +
      '<path d="M30 52 L51 22 L72 52 Z" fill="' + g('#ff7aa0', '#d9364f') + '"' + st(3.6) + '/><path d="M128 52 L149 22 L170 52 Z" fill="' + g('#4aa8ff', '#1f6fd0') + '"' + st(3.6) + '/>' +
      '<path d="M100 64 V20" stroke="' + INK + '" stroke-width="3.6"/><path d="M100 20 H122 L116 27 L122 34 H100 Z" fill="#ff5a6e"' + st(2.6) + '/>' +
      '<path d="M52 64 Q100 36 148 64 Z" fill="' + g('#9aa8ff', '#6a5cf0') + '"' + st(3.6) + '/>' +
      '<circle cx="100" cy="86" r="16" fill="' + rg('#fffbd0', '#ffd23f', .4, .3, .8) + '"' + st(3.4) + '/><path d="M94 82 Q97 78 102 78" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M82 134 V112 Q82 100 100 100 Q118 100 118 112 V134 Z" fill="#7a4a1c"' + st(3.6) + '/><path d="M100 100 V134" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<g transform="translate(44 100)"><path d="' + gearPath(9, 12, 9) + '" fill="' + g('#ffd23f', '#e0a21f') + '"' + st(2.6) + '/><circle r="4" fill="#fff"' + st(2.2) + '/></g>' +
      '<g transform="translate(156 100)"><path d="' + gearPath(9, 12, 9) + '" fill="' + g('#7fe0c8', '#2bb5a0') + '"' + st(2.6) + '/><circle r="4" fill="#fff"' + st(2.2) + '/></g>' +
      '<path d="M0 134 H200 V150 H0 Z" fill="#5a47c9"' + st(3) + '/>')
  };
  function gearPath(n, ro, ri) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (Math.cos(a0) * r).toFixed(1) + ' ' + (Math.sin(a0) * r).toFixed(1) + 'L' + (Math.cos(a1) * r).toFixed(1) + ' ' + (Math.sin(a1) * r).toFixed(1);
    }
    return d + 'Z';
  }

  /* inner = ภายในของ svg (สำหรับป้ายกลมใช้ซ้อนใน svg อื่น) */
  function zoneArt(id, inner) {
    const body = (ZONES[id] || ZONES[1])();
    if (inner) return body;
    return '<svg class="zone-art" viewBox="0 0 200 150" aria-hidden="true">' + body + '</svg>';
  }

  /* ───────── พื้นหลังเกาะ ───────── */
  function isleBackdrop() {
    const sky = uid('sk'), sea = uid('se'), isl = uid('is'), sun = uid('sn');
    let clouds = '';
    [[40, 90, 1.6, '60s', 0], [260, 40, 1.2, '90s', -30], [120, 150, 1.0, '75s', -50], [330, 120, 1.4, '110s', -70]].forEach(c => {
      clouds += '<g class="bgcloud" style="animation-duration:' + c[3] + ';animation-delay:' + c[4] + 's"><g transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')"><path d="M0 14 Q-4 0 10 0 Q14 -12 28 -6 Q38 -16 48 -4 Q64 -4 62 12 Q62 16 54 16 H8 Q0 16 0 14 Z" fill="#fff" opacity=".92"/></g></g>';
    });
    let birds = '';
    [[60, 180, 0], [90, 160, -2], [120, 190, -4]].forEach(b => {
      birds += '<g class="bgbird" style="animation-delay:' + b[2] + 's"><path d="M' + b[0] + ' ' + b[1] + ' q7 -8 14 0 q7 -8 14 0" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/></g>';
    });
    return '<svg class="isle-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc7ff"/><stop offset=".6" stop-color="#bff0ff"/><stop offset="1" stop-color="#e9fbff"/></linearGradient>' +
      '<linearGradient id="' + sea + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46c0e8"/><stop offset="1" stop-color="#1a7fc4"/></linearGradient>' +
      '<linearGradient id="' + isl + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8be06f"/><stop offset="1" stop-color="#3fae5a"/></linearGradient>' +
      '<radialGradient id="' + sun + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbd0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffd23f"/></radialGradient></defs>' +
      '<rect width="400" height="700" fill="url(#' + sky + ')"/>' +
      '<g class="bgsun"><g transform="translate(320 90)"><g stroke="#ffd23f" stroke-width="5" stroke-linecap="round" opacity=".8">' +
        [0, 45, 90, 135, 180, 225, 270, 315].map(a => '<path d="M' + (Math.cos(a * Math.PI / 180) * 38).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 38).toFixed(1) + ' L' + (Math.cos(a * Math.PI / 180) * 52).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 52).toFixed(1) + '"/>').join('') + '</g></g></g>' +
      '<circle cx="320" cy="90" r="30" fill="url(#' + sun + ')"' + st(3.4) + '/>' +
      clouds + birds +
      /* เกาะไกล ๆ */
      '<path d="M-10 330 Q40 276 100 330 Z" fill="#6bc4a0" opacity=".75"/><path d="M270 330 Q330 262 410 330 Z" fill="#74cfa8" opacity=".75"/><path d="M150 330 Q190 300 232 330 Z" fill="#8fd9b4" opacity=".7"/>' +
      '<rect x="0" y="326" width="400" height="374" fill="url(#' + sea + ')"/>' +
      '<g class="bgwave"><path d="M-20 352 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/></g>' +
      '<g class="bgwave w2"><path d="M-20 410 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/></g>' +
      '<g class="bgwave w3"><path d="M-20 490 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".3"/></g>' +
      /* เรือใบ */
      '<g class="bgboat"><g transform="translate(70 346)"><path d="M0 0 H44 L38 12 H6 Z" fill="#ff7a5c"' + st(2.6) + '/><path d="M22 0 V-30" stroke="' + INK + '" stroke-width="2.6"/><path d="M24 -30 L24 -4 L42 -4 Z" fill="#fff"' + st(2.4) + '/></g></g>' +
      /* ประภาคาร */
      '<g transform="translate(330 262)"><path d="M0 70 L6 10 H22 L28 70 Z" fill="#fff"' + st(3) + '/><path d="M3 50 H25 M5 30 H23" stroke="#ff5a6e" stroke-width="8"/><rect x="3" y="0" width="22" height="12" rx="3" fill="#ffd23f"' + st(3) + '/><path d="M0 0 L14 -12 L28 0 Z" fill="#ff5a6e"' + st(3) + '/></g>' +
      '</svg>';
  }

  /* ───────── ปราสาทนักประดิษฐ์ (ตอนจบ) ───────── */
  function grandCastle() {
    const g1 = uid('gc'), g2 = uid('gd'), g3 = uid('ge'), rgb = uid('gb');
    let fw = '';
    [[40, 30, 'f0', '#ff5a6e'], [250, 24, 'f1', '#ffd23f'], [150, 8, 'f2', '#4aa8ff']].forEach(f => {
      fw += '<g class="firework ' + f[2] + '" transform="translate(' + f[0] + ' ' + f[1] + ')" stroke="' + f[3] + '" stroke-width="4" stroke-linecap="round">' +
        [0, 45, 90, 135, 180, 225, 270, 315].map(a => '<path d="M' + (Math.cos(a * Math.PI / 180) * 8).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 8).toFixed(1) + ' L' + (Math.cos(a * Math.PI / 180) * 20).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 20).toFixed(1) + '"/>').join('') + '</g>';
    });
    return '<svg class="gcastle" viewBox="0 0 300 270" aria-hidden="true"><defs>' +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7de"/><stop offset="1" stop-color="#f0c98a"/></linearGradient>' +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7aa0"/><stop offset="1" stop-color="#d9364f"/></linearGradient>' +
      '<linearGradient id="' + g3 + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8ff"/><stop offset="1" stop-color="#3a6fe0"/></linearGradient>' +
      '<radialGradient id="' + rgb + '" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fffbd0"/><stop offset="1" stop-color="#ffc21f"/></radialGradient></defs>' + fw +
      '<ellipse cx="150" cy="262" rx="124" ry="8" fill="rgba(34,48,90,.22)"/>' +
      '<rect x="86" y="108" width="128" height="150" fill="url(#' + g1 + ')"' + st(4.4) + '/>' +
      '<g fill="url(#' + g1 + ')"' + st(4.2) + '><rect x="38" y="90" width="52" height="168"/><rect x="210" y="90" width="52" height="168"/><rect x="118" y="62" width="64" height="60"/></g>' +
      '<g fill="url(#' + g1 + ')"' + st(3.4) + '>' + [38, 52, 66, 80].map(x => '<rect x="' + x + '" y="80" width="10" height="12"/>').join('') + [210, 224, 238, 252].map(x => '<rect x="' + x + '" y="80" width="10" height="12"/>').join('') + '</g>' +
      '<path d="M32 90 L64 36 L96 90 Z" fill="url(#' + g2 + ')"' + st(4.2) + '/><path d="M204 90 L236 36 L268 90 Z" fill="url(#' + g3 + ')"' + st(4.2) + '/>' +
      '<path d="M112 62 L150 18 L188 62 Z" fill="url(#' + g2 + ')"' + st(4.2) + '/>' +
      '<path d="M150 18 V-2" stroke="' + INK + '" stroke-width="4"/><circle cx="150" cy="-6" r="10" fill="url(#' + rgb + ')"' + st(3.6) + '/>' +
      '<path d="M64 36 V16" stroke="' + INK + '" stroke-width="3.6"/><path d="M64 16 H86 L80 23 L86 30 H64 Z" fill="#3ccf9a"' + st(2.6) + '/>' +
      '<path d="M236 36 V16" stroke="' + INK + '" stroke-width="3.6"/><path d="M236 16 H258 L252 23 L258 30 H236 Z" fill="#ffd23f"' + st(2.6) + '/>' +
      '<circle cx="150" cy="96" r="20" fill="url(#' + rgb + ')"' + st(4) + '/><g class="gear-spin"><path d="' + gearPath(8, 14, 10) + '" transform="translate(150 96)" fill="none" stroke="#e0a21f" stroke-width="2.6"/></g>' +
      '<path d="M130 258 V198 Q130 172 150 172 Q170 172 170 198 V258 Z" fill="#7a4a1c"' + st(4.2) + '/><path d="M150 172 V258" stroke="' + INK + '" stroke-width="3"/>' +
      '<g transform="translate(66 166)"><g class="gear-spin"><path d="' + gearPath(9, 18, 13) + '" fill="#ffd23f"' + st(3) + '/><circle r="6" fill="#fff"' + st(2.6) + '/></g></g>' +
      '<g transform="translate(236 166)"><g class="gear-spin rev"><path d="' + gearPath(9, 18, 13) + '" fill="#7fe0c8"' + st(3) + '/><circle r="6" fill="#fff"' + st(2.6) + '/></g></g>' +
      '<rect x="56" y="206" width="20" height="30" rx="10" fill="#bfe9ff"' + st(3) + '/><rect x="224" y="206" width="20" height="30" rx="10" fill="#bfe9ff"' + st(3) + '/>' +
      '</svg>';
  }

  /* ───────── ของตกแต่งบนเกาะ (แผนที่) ───────── */
  function decor(kind) {
    const i = INK;
    if (kind === 'palm') return '<g><path d="M0 0 Q-6 -24 4 -48" fill="none" stroke="' + i + '" stroke-width="11" stroke-linecap="round"/><path d="M0 0 Q-6 -24 4 -48" fill="none" stroke="#c68a4e" stroke-width="6" stroke-linecap="round"/>' +
      '<g transform="translate(4 -48)">' + [-70, -30, 10, 50, 90].map(a => '<path d="M0 0 Q' + (Math.cos((a - 90) * Math.PI / 180) * 22).toFixed(1) + ' ' + (Math.sin((a - 90) * Math.PI / 180) * 22 - 8).toFixed(1) + ' ' + (Math.cos((a - 90) * Math.PI / 180) * 38).toFixed(1) + ' ' + (Math.sin((a - 90) * Math.PI / 180) * 30 + 8).toFixed(1) + ' Q' + (Math.cos((a - 90) * Math.PI / 180) * 20).toFixed(1) + ' ' + (Math.sin((a - 90) * Math.PI / 180) * 8 - 4).toFixed(1) + ' 0 0 Z" fill="#3ccf6a" stroke="' + i + '" stroke-width="3" stroke-linejoin="round"/>').join('') +
      '<circle cx="-4" cy="4" r="5" fill="#8a5a2b" stroke="' + i + '" stroke-width="2.4"/><circle cx="5" cy="5" r="5" fill="#8a5a2b" stroke="' + i + '" stroke-width="2.4"/></g></g>';
    if (kind === 'rock') return '<g><path d="M-18 0 Q-22 -16 -8 -22 Q6 -26 16 -14 Q24 -4 18 0 Z" fill="#b8b7c6" stroke="' + i + '" stroke-width="3.2" stroke-linejoin="round"/><path d="M-10 -14 Q-4 -20 4 -19" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>';
    if (kind === 'flower') return '<g><path d="M0 0 V-18" stroke="' + i + '" stroke-width="3.4" stroke-linecap="round"/>' + [0, 72, 144, 216, 288].map(a => '<ellipse cx="' + (Math.cos(a * Math.PI / 180) * 6).toFixed(1) + '" cy="' + (-22 + Math.sin(a * Math.PI / 180) * 6).toFixed(1) + '" rx="5" ry="5" fill="#ff8fc1" stroke="' + i + '" stroke-width="2"/>').join('') + '<circle cy="-22" r="3.6" fill="#ffd23f" stroke="' + i + '" stroke-width="2"/></g>';
    if (kind === 'bush') return '<g><circle cx="-10" cy="-8" r="11" fill="#43c46c" stroke="' + i + '" stroke-width="3"/><circle cx="6" cy="-12" r="13" fill="#52d27a" stroke="' + i + '" stroke-width="3"/><circle cx="18" cy="-5" r="9" fill="#43c46c" stroke="' + i + '" stroke-width="3"/><path d="M-4 -18 Q2 -22 8 -20" stroke="#c9ffd9" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
    return '';
  }

  Object.assign(A, { zoneArt, isleBackdrop, grandCastle, gearPath, decor });
})();
