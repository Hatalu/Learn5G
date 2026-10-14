/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — ตัวสร้างฉาก (วัตถุ + ไอเท็ม + คำบุพบท) ใช้ซ้ำทุกภารกิจ
   ฉากกว้าง 400 x 270 พื้นอยู่ที่ y=238 ไอเท็มวาดจากจุดกึ่งกลางล่าง (0,0)
   prep: in on at under above between
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const { INK, S, S3 } = PP.art;
  const W = 400, H = 270, FLOOR = 238;
  let uid = 0;

  /* ── ฉากหลัง ── */
  function backdrop(env, id) {
    if (env === 'indoor') {
      return '<defs><pattern id="wp' + id + '" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.2" fill="#ffd9ae"/><circle cx="19" cy="19" r="2.2" fill="#ffd9ae"/></pattern></defs>' +
        '<rect width="400" height="270" fill="#ffeed6"/><rect width="400" height="238" fill="url(#wp' + id + ')"/>' +
        '<rect x="22" y="30" width="72" height="62" rx="6" fill="#bfe9ff"' + S3 + '/><path d="M58 30 v62 M22 61 h72" stroke="' + INK + '" stroke-width="3"/><path d="M30 50 q10 -8 18 0 q8 -8 16 0" fill="#fff" opacity=".9"/>' +
        '<rect x="316" y="38" width="58" height="46" rx="5" fill="#fff"' + S3 + '/><path d="M324 76 l14 -18 l10 12 l8 -8 l12 14z" fill="#8fdc6c"' + S + '/><circle cx="352" cy="50" r="5" fill="#ffd93f"/>' +
        '<rect y="224" width="400" height="14" fill="#e0b078"/><path d="M0 224 h400" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<rect y="238" width="400" height="32" fill="#f3c986"/><path d="M0 238 h400" stroke="' + INK + '" stroke-width="3"/><path d="M0 254 h400 M70 238 v32 M190 238 v32 M310 238 v32" stroke="#d9a86a" stroke-width="2"/>';
    }
    const sky = '<defs><linearGradient id="sk' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad8ff"/><stop offset="1" stop-color="#e4f7ff"/></linearGradient></defs>' +
      '<rect width="400" height="270" fill="url(#sk' + id + ')"/>' +
      '<g fill="#fff" opacity=".95"><ellipse cx="70" cy="56" rx="30" ry="11"/><ellipse cx="92" cy="48" rx="20" ry="12"/><ellipse cx="318" cy="38" rx="32" ry="11"/><ellipse cx="340" cy="30" rx="18" ry="11"/></g>';
    if (env === 'river') {
      return sky + '<path d="M0 190 q40 -30 90 -6 v90 h-90z" fill="#8fdc6c"' + S + '/><path d="M400 186 q-40 -30 -90 -6 v94 h90z" fill="#8fdc6c"' + S + '/>' +
        '<rect y="206" width="400" height="64" fill="#69b8ff"/><path d="M0 206 h400" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M120 226 q6 -5 12 0 t12 0 M250 250 q6 -5 12 0 t12 0 M170 258 q6 -5 12 0 t12 0 M300 224 q6 -5 12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M0 238 h60 M340 238 h60" stroke="#6fbf50" stroke-width="2"/>';
    }
    return sky + '<path d="M-10 190 q80 -50 170 -8 q80 -34 250 4 v60 h-420z" fill="#b8ee98"' + S + '/>' +
      '<rect y="238" width="400" height="32" fill="#8fdc6c"/><path d="M0 238 h400" stroke="' + INK + '" stroke-width="3"/>' +
      '<g stroke="#6fbf50" stroke-width="3" stroke-linecap="round"><path d="M30 252 l3 -7 l3 7 M110 258 l3 -7 l3 7 M250 250 l3 -7 l3 7 M340 258 l3 -7 l3 7"/></g>' +
      '<circle cx="60" cy="262" r="3" fill="#ff8fb1"/><circle cx="300" cy="264" r="3" fill="#fff"/><circle cx="150" cy="256" r="3" fill="#ffd93f"/>';
  }

  /* ── วัตถุ : draw(x) → {back, front} · anchors(x) → {prep: [x,y]} ── */
  const rect = (x, y, w, h, fill, rx) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + S3 + '/>';
  const OBJ = {
    table: {
      name: 'table', env: 'indoor', w: 152, preps: ['on', 'under', 'above'],
      draw: x => ({
        back: rect(x - 66, 166, 12, 72, '#cf8741', 3) + rect(x + 54, 166, 12, 72, '#cf8741', 3) +
          rect(x - 76, 148, 152, 18, '#e9a35c', 6) + '<path d="M' + (x - 66) + ' 154 h40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>', front: ''
      }),
      anchors: x => ({ on: [x, 148], under: [x, FLOOR], above: [x, 96] })
    },
    chair: {
      name: 'chair', env: 'indoor', w: 70, preps: ['on', 'under', 'above'],
      draw: x => ({
        back: rect(x - 30, 182, 9, 56, '#cf8741', 3) + rect(x + 21, 182, 9, 56, '#cf8741', 3) +
          rect(x + 16, 100, 15, 70, '#e9a35c', 5) + rect(x - 34, 168, 68, 15, '#e9a35c', 6) + '<path d="M' + (x - 26) + ' 174 h28" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>', front: ''
      }),
      anchors: x => ({ on: [x - 8, 168], under: [x, FLOOR], above: [x, 92] })
    },
    bed: {
      name: 'bed', env: 'indoor', w: 178, preps: ['on', 'under', 'above'],
      draw: x => ({
        back: rect(x - 84, 188, 10, 50, '#a8683a', 3) + rect(x + 74, 188, 10, 50, '#a8683a', 3) +
          rect(x - 92, 100, 15, 138, '#a8683a', 5) + rect(x + 76, 150, 13, 88, '#a8683a', 5) +
          rect(x - 80, 170, 158, 15, '#c98a4e', 4) + rect(x - 78, 150, 154, 22, '#fff', 8) +
          '<path d="M' + (x - 10) + ' 150 h' + 86 + ' v22 h-86 q-8 -11 0 -22z" fill="#4ab0ff"' + S3 + '/><path d="M' + (x) + ' 158 q10 6 20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
          rect(x - 74, 138, 44, 16, '#fff7e0', 8), front: ''
      }),
      anchors: x => ({ on: [x + 30, 150], under: [x + 6, FLOOR], above: [x, 78] })
    },
    shelf: {
      name: 'shelf', env: 'indoor', w: 150, preps: ['on', 'under', 'above'],
      draw: x => ({
        back: '<path d="M' + (x - 58) + ' 140 v22 l20 -22z M' + (x + 58) + ' 140 v22 l-20 -22z" fill="#cf8741"' + S3 + '/>' + rect(x - 76, 128, 152, 13, '#e9a35c', 4) +
          '<path d="M' + (x - 66) + ' 133 h30" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>', front: ''
      }),
      anchors: x => ({ on: [x, 128], under: [x, FLOOR], above: [x, 76] })
    },
    box: {
      name: 'box', env: 'indoor', w: 88, preps: ['in', 'above'],
      draw: x => ({
        back: '<ellipse cx="' + x + '" cy="190" rx="44" ry="12" fill="#7a4a22"' + S3 + '/>',
        front: '<path d="M' + (x - 44) + ' 192 l-12 -16 l24 -4 l16 20z" fill="#e6b57a"' + S + '/><path d="M' + (x + 44) + ' 192 l12 -16 l-24 -4 l-16 20z" fill="#e6b57a"' + S + '/>' +
          rect(x - 44, 192, 88, 46, '#d9a066', 4) + rect(x - 7, 192, 14, 46, '#f3dca3', 0) + rect(x + 14, 208, 22, 14, '#fff', 3) + '<path d="M' + (x + 18) + ' 213 h14 M' + (x + 18) + ' 217 h10" stroke="#a79fc9" stroke-width="1.8" stroke-linecap="round"/>'
      }),
      anchors: x => ({ in: [x, 208], above: [x, 134] })
    },
    basket: {
      name: 'basket', env: 'indoor', w: 96, preps: ['in', 'above'],
      draw: x => ({
        back: '<path d="M' + (x - 36) + ' 196 q36 -78 72 0" fill="none" stroke="#a8683a" stroke-width="7" stroke-linecap="round"/><path d="M' + (x - 36) + ' 196 q36 -78 72 0" fill="none" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="' + x + '" cy="194" rx="42" ry="10" fill="#7a4a22"' + S3 + '/>',
        front: '<path d="M' + (x - 44) + ' 196 l8 42 h72 l8 -42z" fill="#e0a95f"' + S3 + '/><path d="M' + (x - 40) + ' 208 h80 M' + (x - 37) + ' 220 h74 M' + (x - 20) + ' 196 l4 42 M' + (x) + ' 196 v42 M' + (x + 20) + ' 196 l-4 42" stroke="#b8793e" stroke-width="2.6" fill="none"/>'
      }),
      anchors: x => ({ in: [x, 206], above: [x, 120] })
    },
    house: {
      name: 'house', env: 'outdoor', w: 140, preps: ['at', 'above'],
      draw: x => ({
        back: rect(x - 62, 104, 124, 134, '#ffe3a8', 3) + '<path d="M' + (x - 76) + ' 106 L' + x + ' 56 L' + (x + 76) + ' 106z" fill="#ff5c6c"' + S3 + '/>' +
          rect(x - 22, 156, 44, 82, '#a8683a', 5) + '<circle cx="' + (x + 12) + '" cy="198" r="3.4" fill="#ffd93f"' + S + '/>' + rect(x + 28, 122, 26, 26, '#bfe9ff', 4) + '<path d="M' + (x + 41) + ' 122 v26 M' + (x + 28) + ' 135 h26" stroke="' + INK + '" stroke-width="2.4"/>' +
          rect(x - 54, 122, 26, 26, '#bfe9ff', 4) + '<path d="M' + (x - 41) + ' 122 v26 M' + (x - 54) + ' 135 h26" stroke="' + INK + '" stroke-width="2.4"/>' + rect(x - 34, 232, 68, 6, '#c9c2dd', 2), front: ''
      }),
      anchors: x => ({ at: [x, 238], above: [x, 44] })
    },
    tree: {
      name: 'tree', env: 'outdoor', w: 124, preps: ['in', 'under', 'above'],
      draw: x => ({
        back: '<path d="M' + (x - 14) + ' 238 v-96 h28 v96z" fill="#a8683a"' + S3 + '/>' +
          '<g fill="#4fc86a"' + S3 + '><circle cx="' + x + '" cy="92" r="46"/><circle cx="' + (x - 36) + '" cy="118" r="30"/><circle cx="' + (x + 36) + '" cy="118" r="30"/></g>' +
          '<g fill="#6fe08a"><circle cx="' + (x - 14) + '" cy="76" r="10"/><circle cx="' + (x + 24) + '" cy="96" r="8"/><circle cx="' + (x - 44) + '" cy="110" r="7"/></g>',
        front: '<g fill="#3fb85a"' + S3 + '><circle cx="' + (x - 20) + '" cy="132" r="13"/><circle cx="' + (x + 24) + '" cy="134" r="12"/></g>'
      }),
      anchors: x => ({ in: [x - 2, 128], under: [x - 40, FLOOR], above: [x, 36] })
    },
    gate: {
      name: 'gate', env: 'outdoor', w: 140, preps: ['at'],
      draw: x => {
        let p = '';
        for (let i = 0; i < 7; i++) p += rect(x - 50 + i * 15, 168, 9, 70, '#fff', 3);
        return { back: p + rect(x - 62, 150, 14, 88, '#cf8741', 4) + rect(x + 48, 150, 14, 88, '#cf8741', 4) + '<path d="M' + (x - 50) + ' 186 h100 M' + (x - 50) + ' 214 h100" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (x - 55) + '" cy="146" r="7" fill="#ffd93f"' + S + '/><circle cx="' + (x + 55) + '" cy="146" r="7" fill="#ffd93f"' + S + '/>', front: '' };
      },
      anchors: x => ({ at: [x, 238] })
    },
    busstop: {
      name: 'bus stop', env: 'outdoor', w: 70, preps: ['at'],
      draw: x => ({
        back: rect(x - 5, 100, 10, 138, '#9aa6c8', 3) + '<circle cx="' + x + '" cy="92" r="24" fill="#4a7bf0"' + S3 + '/><g transform="translate(' + x + ' 92) scale(.36)">' + PP.art.RAW.bus + '</g>' + rect(x - 30, 206, 60, 8, '#cf8741', 3) + rect(x - 26, 214, 6, 24, '#cf8741', 2) + rect(x + 20, 214, 6, 24, '#cf8741', 2), front: ''
      }),
      anchors: x => ({ at: [x + 6, 238] })
    },
    bridge: {
      name: 'bridge', env: 'river', w: 224, preps: ['on', 'under', 'above'],
      draw: x => ({
        back: rect(x - 112, 168, 224, 70, '#cfc8e6', 3) + '<path d="M' + (x - 62) + ' 238 v-24 a62 62 0 0 1 124 0 v24z" fill="#69b8ff"' + S3 + '/>' +
          '<path d="M' + (x - 40) + ' 232 q6 -5 12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
          rect(x - 118, 150, 236, 20, '#e0a95f', 6) + rect(x - 112, 128, 10, 24, '#cf8741', 3) + rect(x + 102, 128, 10, 24, '#cf8741', 3) + '<path d="M' + (x - 108) + ' 134 h216" stroke="' + INK + '" stroke-width="3"/>', front: ''
      }),
      anchors: x => ({ on: [x, 150], under: [x, 236], above: [x, 98] })
    }
  };
  OBJ.door = Object.assign({}, OBJ.house, { name: 'door', preps: ['at'] });
  /* ชื่อที่ใช้พูดตามคำบุพบท: house ที่ใช้กับ at → "door" */
  const objName = (o, prep) => (o === 'house' && prep === 'at') ? 'door' : OBJ[o].name;

  /* ── ไอเท็ม (วาดจากกึ่งกลางล่าง) ── */
  const wing = (fly) => fly ? '<path class="wing" d="M-12 -18 q-20 -16 -24 -2 q6 12 22 12z M12 -18 q20 -16 24 -2 q-6 12 -22 12z" fill="#7bc4ff"' + S + '/>' : '<path d="M-11 -14 q-9 6 -3 14 q8 0 12 -8z" fill="#7bc4ff"' + S + '/>';
  const ITEM = {
    parcel: { name: 'parcel', h: 38, w: 40, draw: () => '<rect x="-20" y="-34" width="40" height="34" rx="4" fill="#d9a066"' + S3 + '/><rect x="-4" y="-34" width="8" height="34" fill="#f3dca3"/><path d="M-4 -34 v34 M4 -34 v34" stroke="' + INK + '" stroke-width="1.6"/><rect x="6" y="-20" width="11" height="10" rx="2" fill="#fff"' + S + '/><path d="M8.5 -16 h6 M8.5 -13 h4" stroke="#a79fc9" stroke-width="1.4" stroke-linecap="round"/><path d="M-20 -34 q10 -9 20 0 q10 -9 20 0" fill="none" stroke="#ff5c6c" stroke-width="3.4" stroke-linecap="round"/>' },
    cat: { name: 'cat', h: 47, w: 36, draw: () => '<path d="M14 -6 q16 -4 14 -18 q-2 -6 -7 -4" fill="none"' + S3 + '/><ellipse cx="0" cy="-16" rx="15" ry="16" fill="#ffb25c"' + S3 + '/><ellipse cx="0" cy="-12" rx="8" ry="10" fill="#fff3d6"/><path d="M-6 -2 v4 M6 -2 v4" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-12 -40 l-3 -14 l12 7 q3 -1 6 0 l12 -7 l-3 14z" fill="#ffb25c"' + S3 + '/><circle cx="0" cy="-34" r="13" fill="#ffb25c"' + S3 + '/><path d="M-9 -44 l3 6 M0 -46 v6 M9 -44 l-3 6" stroke="#e8893a" stroke-width="2.4" stroke-linecap="round"/><circle cx="-5" cy="-35" r="2.2" fill="' + INK + '"/><circle cx="5" cy="-35" r="2.2" fill="' + INK + '"/><path d="M-2 -30 l2 2 l2 -2z" fill="#ff8fb1"' + S + '/><path d="M-9 -30 l-9 -2 M-9 -28 l-9 2 M9 -30 l9 -2 M9 -28 l9 2" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round"/>' },
    bird: { name: 'bird', h: 32, w: 34, draw: (fly) => (fly ? '' : '<path d="M-6 -2 v4 M6 -2 v4" stroke="#ff9a3d" stroke-width="3" stroke-linecap="round"/>') + wing(fly) + '<ellipse cx="0" cy="-15" rx="15" ry="14" fill="#4ab0ff"' + S3 + '/><ellipse cx="0" cy="-11" rx="8" ry="8" fill="#bfe9ff"/><circle cx="-5" cy="-19" r="2.4" fill="' + INK + '"/><circle cx="5" cy="-19" r="2.4" fill="' + INK + '"/><path d="M-4 -13 l4 -3 l4 3 l-4 4z" fill="#ff9a3d"' + S + '/><path d="M-4 -29 q4 -8 8 0" fill="none"' + S + '/>' },
    ball: { name: 'ball', h: 32, w: 32, draw: () => '<circle cx="0" cy="-16" r="16" fill="#fff"' + S3 + '/><path d="M0 -16 L0 -32 A16 16 0 0 1 13.9 -24z" fill="#ff5c6c"/><path d="M0 -16 L13.9 -8 A16 16 0 0 1 0 0z" fill="#ffd93f"/><path d="M0 -16 L-13.9 -8 A16 16 0 0 1 -13.9 -24z" fill="#4ab0ff"/><circle cx="0" cy="-16" r="16" fill="none"' + S3 + '/><circle cx="0" cy="-16" r="3" fill="#fff"' + S + '/><path d="M-9 -26 q3 -3 7 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' },
    book: { name: 'book', h: 14, w: 38, draw: () => '<rect x="-19" y="-14" width="38" height="14" rx="3" fill="#4a7bf0"' + S3 + '/><rect x="-15" y="-11" width="32" height="8" rx="1.5" fill="#fff"/><path d="M-12 -8 h22" stroke="#a79fc9" stroke-width="1.6" stroke-linecap="round"/><rect x="-19" y="-14" width="6" height="14" rx="2" fill="#2f55c0"' + S + '/><path d="M12 -14 v-5 l4 3 l4 -3 v5" fill="#ff5c6c"' + S + '/>' },
    kite: { name: 'kite', h: 52, w: 30, fly: true, draw: () => '<path d="M0 -50 l15 16 l-15 26 l-15 -26z" fill="#ff5c6c"' + S3 + '/><path d="M0 -50 v42 M-15 -34 h30" stroke="#fff" stroke-width="2.2" opacity=".85"/><path d="M0 -8 q-7 4 0 8 q7 4 0 8" fill="none"' + S + ' transform="translate(0 -6)"/><path d="M-6 -9 l-5 -4 l5 -1z M6 -2 l5 -4 l-5 -1z" fill="#ffd93f"' + S + '/>' },
    balloon: { name: 'balloon', h: 56, w: 28, fly: true, draw: () => '<path d="M0 -56 q16 0 16 16 q0 14 -16 20 q-16 -6 -16 -20 q0 -16 16 -16z" fill="#ff8fb1"' + S3 + '/><path d="M0 -20 l-3.4 5 h6.8z" fill="#ff8fb1"' + S + '/><path d="M0 -15 q-6 6 0 10 q6 4 0 9" fill="none"' + S + '/><path d="M-8 -48 q3 -4 8 -4" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>' },
    boat: { name: 'boat', h: 44, w: 50, draw: () => '<path d="M-24 -10 h48 l-8 10 h-32z" fill="#ff5c6c"' + S3 + '/><path d="M0 -10 v-30" stroke="' + INK + '" stroke-width="3"/><path d="M3 -38 l18 26 h-18z" fill="#fff"' + S3 + '/><path d="M-3 -32 l-14 20 h14z" fill="#ffe7a8"' + S3 + '/><path d="M0 -40 l10 4 l-10 4z" fill="#ffd93f"' + S + '/><path d="M-30 -1 q5 -4 10 0 t10 0 t10 0 t10 0 t10 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' },
    pip: { name: 'Pip', h: 49, w: 40, draw: () => '<g transform="translate(0 -26) scale(.4)">' + PP.art.pipBody('happy') + '</g>' }
  };
  const FLYERS = { bird: 1, kite: 1, balloon: 1, pip: 1 };
  /* ไอเท็มที่ลอยกลางอากาศเมื่อ above ; parcel ใช้ร่มชูชีพ */
  function itemSVG(name, prep, scale) {
    const it = ITEM[name];
    const fly = prep === 'above';
    let body = name === 'bird' ? it.draw(fly) : it.draw();
    /* พัสดุที่ลอยกลางอากาศมีร่มชูชีพ (ซ่อนไว้ ใช้ได้เมื่อ parent มี .fly) */
    if (name === 'parcel') body = '<g class="chute"><path d="M-26 -42 q26 -34 52 0 q-13 -6 -26 -6 q-13 0 -26 6z" fill="#ff5c6c"' + S3 + '/><path d="M-26 -42 q13 -16 26 -4 q13 -12 26 4" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7"/><path d="M-24 -42 L-17 -34 M24 -42 L17 -34 M0 -47 L0 -34" stroke="' + INK + '" stroke-width="1.8"/></g>' + body;
    const cls = 'itm it-' + name + (fly ? ' fly' : '');
    return '<g class="' + cls + '" transform="scale(' + (scale || 1) + ')"><g class="bob">' + body + '</g></g>';
  }

  /* ── ตำแหน่งของไอเท็มจากคำบุพบท ── */
  function pairPositions(a, b) {
    const L = OBJ[a], R = OBJ[b];
    return [[a, 200 - 50 - L.w / 2], [b, 200 + 50 + R.w / 2]];
  }
  function spotOf(objs, prep, o, o2) {
    if (prep === 'between') return [200, FLOOR, 1];
    const ob = objs.find(q => q.o === o);
    if (!ob) return null;
    const a = OBJ[o].anchors(ob.x)[prep];
    if (!a) return null;
    const sc = (o === 'bed' && prep === 'under') ? .8 : 1;
    return [a[0], a[1], sc];
  }

  /* ── สร้างฉากเต็ม ──
     spec = { env?, objs:[{o,x}], items:[{i, prep, o, o2?, x?, y?, scale?, id?}], ghosts:[{id,x,y,w,h,prep,o}], cls }  */
  function svg(spec) {
    const id = ++uid;
    const env = spec.env || (spec.objs[0] ? OBJ[spec.objs[0].o].env : 'indoor');
    let back = '', front = '', items = '', ghosts = '';
    spec.objs.forEach(ob => { const d = OBJ[ob.o].draw(ob.x); back += '<g class="obj o-' + ob.o + '">' + d.back + '</g>'; front += d.front ? '<g class="obj-f">' + d.front + '</g>' : ''; });
    (spec.items || []).forEach(it => {
      let sp = it.x != null ? [it.x, it.y, it.scale || 1] : spotOf(spec.objs, it.prep, it.o, it.o2);
      if (!sp) return;
      /* ภาพย่อ (mini) ขยายไอเท็ม 20% ให้เห็นชัด ยกเว้นที่ต้องอยู่ใต้/ในวัตถุ */
      const grow = /\bmini\b/.test(spec.cls || '') && it.prep !== 'under' && it.prep !== 'in' ? 1.2 : 1;
      const sc = (it.scale != null ? it.scale : sp[2]) * grow;
      items += it.mv
        ? '<g class="slot mv' + (it.id ? ' ' + it.id : '') + '" data-id="' + (it.id || '') + '" style="transform:translate(' + sp[0] + 'px,' + sp[1] + 'px)">' + itemSVG(it.i, it.prep, sc) + '</g>'
        : '<g class="slot' + (it.id ? ' ' + it.id : '') + '" data-id="' + (it.id || '') + '" transform="translate(' + sp[0] + ' ' + sp[1] + ')">' + itemSVG(it.i, it.prep, sc) + '</g>';
    });
    (spec.ghosts || []).forEach(g => {
      ghosts += '<g class="ghost" data-spot="' + g.id + '" data-prep="' + g.prep + '" data-o="' + (g.o || '') + '" transform="translate(' + g.x + ' ' + g.y + ')"><rect x="' + (-g.w / 2) + '" y="' + (-g.h) + '" width="' + g.w + '" height="' + g.h + '" rx="9"/><rect class="hit" x="' + (-g.w / 2 - 10) + '" y="' + (-g.h - 10) + '" width="' + (g.w + 20) + '" height="' + (g.h + 20) + '" fill="transparent"/></g>';
    });
    return '<svg class="scene ' + (spec.cls || '') + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">' +
      '<g class="bg">' + backdrop(env, id) + '</g>' + back + '<g class="items">' + items + '</g>' + front + '<g class="ghosts">' + ghosts + '</g></svg>';
  }

  /* ── ฉากสำเร็จรูปจากรายการในคลัง (bank entry) ── */
  function layoutFor(e) {
    if (e.p === 'between') return pairPositions(e.o[0], e.o[1]).map(q => ({ o: q[0], x: q[1] }));
    return [{ o: e.o, x: 200 }];
  }
  function ofEntry(e, extra) {
    const objs = layoutFor(e);
    const spec = Object.assign({ objs, items: [{ i: e.i, prep: e.p, o: e.p === 'between' ? e.o[0] : e.o, o2: e.o[1] }] }, extra || {});
    return svg(spec);
  }
  /* ประโยค: The cat is under the table. */
  function sentence(e) {
    const subj = e.i === 'pip' ? 'Pip is' : 'The ' + ITEM[e.i].name + ' is';
    const obj = e.p === 'between' ? 'the ' + objName(e.o[0], 'x') + ' and the ' + objName(e.o[1], 'x') : 'the ' + objName(e.o, e.p);
    return subj + ' ' + e.p + ' ' + obj + '.';
  }
  function command(item, prep, o, o2) {
    const obj = prep === 'between' ? 'the ' + objName(o, 'x') + ' and the ' + objName(o2, 'x') : 'the ' + objName(o, prep);
    return 'Put the ' + ITEM[item].name + ' ' + prep + ' ' + obj + '.';
  }

  /* ── ฉากสำหรับ "วางพัสดุ" : วัตถุ + จุดเงา ──
     คืน { svg, spots:[{id,prep,o,x,y}] } แต่ละ spot ใช้เทียบคำตอบ */
  function dropScene(objKeys, allowPreps, opts) {
    opts = opts || {};
    let objs, pairKey = null;
    if (opts.pair) { objs = pairPositions(opts.pair[0], opts.pair[1]).map(q => ({ o: q[0], x: q[1] })); pairKey = opts.pair; }
    else if (objKeys.length === 1) objs = [{ o: objKeys[0], x: 200 }];
    else if (objKeys.length === 2) objs = [{ o: objKeys[0], x: 112 }, { o: objKeys[1], x: 294 }];
    else objs = objKeys.map((o, i) => ({ o, x: 70 + i * 130 }));
    const spots = [];
    objs.forEach(ob => {
      OBJ[ob.o].preps.forEach(p => {
        if (allowPreps && allowPreps.indexOf(p) < 0) return;
        if (opts.only && opts.only.indexOf(ob.o + ':' + p) < 0) return;
        const a = OBJ[ob.o].anchors(ob.x)[p];
        if (a) spots.push({ id: ob.o + ':' + p, prep: p, o: ob.o, x: a[0], y: a[1] });
      });
    });
    if (pairKey && (!allowPreps || allowPreps.indexOf('between') >= 0)) spots.push({ id: 'between', prep: 'between', o: pairKey[0], o2: pairKey[1], x: 200, y: FLOOR });
    const ghosts = spots.map(s => ({ id: s.id, prep: s.prep, o: s.o, x: s.x, y: s.y + (s.prep === 'in' ? 0 : 0), w: 46, h: 44 }));
    return { objs, spots, ghosts };
  }

  /* ตำแหน่งที่ไอเท็มของประโยค e ไปอยู่ได้เมื่อใช้คำบุพบท prep (null = เป็นไปไม่ได้) */
  function fit(e, objs, prep) {
    if (e.p === 'between') return prep === 'between' ? [200, FLOOR] : null;
    const ob = objs.find(q => q.o === e.o);
    if (!ob || OBJ[e.o].preps.indexOf(prep) < 0 || !PP.D.canDo(e.i, prep)) return null;
    const a = OBJ[e.o].anchors(ob.x)[prep];
    return a ? [a[0], a[1]] : null;
  }

  /* ย้ายไอเท็ม (mover) ในฉากที่สร้างแล้ว : เลื่อนด้วย CSS transition · prep='above' → ชักร่มชูชีพ */
  function moveTo(svgEl, id, x, y, prep, instant) {
    const g = svgEl.querySelector('.slot.' + id);
    if (!g) return;
    if (instant) g.style.transition = 'none';
    g.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    const it = g.querySelector('.itm');
    if (it) it.classList.toggle('fly', prep === 'above');
    if (instant) { void g.getBoundingClientRect(); g.style.transition = ''; }
  }

  PP.scene = { OBJ, ITEM, FLOOR, W, H, svg, moveTo, fit, itemSVG, ofEntry, sentence, command, objName, spotOf, pairPositions, dropScene, layoutFor, backdrop };
})();
