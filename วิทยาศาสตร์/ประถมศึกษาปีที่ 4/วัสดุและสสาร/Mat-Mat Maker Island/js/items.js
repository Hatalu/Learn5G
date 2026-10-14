/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — วาดตัวอย่างวัสดุทั้งหมดด้วย SVG
   item(id)   : ตัวอย่างทดลอง 100x100 (ฟองน้ำ ดินน้ำมัน ไม้ เหล็ก ...)
   look(id)   : สีพื้นผิวของวัสดุสำหรับชิ้นงาน (หม้อ สายไฟ หมวก)
   object(k)  : ชิ้นงานที่ให้เด็กเลือกวัสดุประกอบ (หม้อต้มน้ำ สายไฟ หมวกนิรภัย)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM = window.MM || {};
  const A = MM.art;
  const INK = A.INK;
  const uid = A.uid;
  const st = w => ' stroke="' + INK + '" stroke-width="' + (w || 3.2) + '" stroke-linejoin="round" stroke-linecap="round"';

  /* ตัวสร้าง svg + ไล่สี */
  function mk(fn, cls, vb) {
    const defs = [];
    const g = (c0, c1, dir) => {
      const id = uid('i');
      const d = dir || 'v';
      const xy = d === 'v' ? [0, 1] : d === 'h' ? [1, 0] : [1, 1];
      defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="' + xy[0] + '" y2="' + xy[1] + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient>');
      return 'url(#' + id + ')';
    };
    const rg = (c0, c1, cx, cy) => {
      const id = uid('r');
      defs.push('<radialGradient id="' + id + '" cx="' + (cx == null ? .35 : cx) + '" cy="' + (cy == null ? .3 : cy) + '" r=".85"><stop offset="0" stop-color="' + c0 + '"/><stop offset="1" stop-color="' + c1 + '"/></radialGradient>');
      return 'url(#' + id + ')';
    };
    const body = fn(g, rg);
    return '<svg class="item ' + (cls || '') + '" viewBox="' + (vb || '0 0 100 100') + '" aria-hidden="true"><defs>' + defs.join('') + '</defs>' + body + '</svg>';
  }
  const shadow = (cx, cy, rx) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="4.5" fill="rgba(34,48,90,.18)"/>';
  /* บล็อก 2.5 มิติ : front, top, side */
  function block(x, y, w, h, d, cFront, cTop, cSide, r) {
    return '<path d="M' + x + ' ' + y + ' l' + d + ' -' + d * .6 + ' h' + w + ' l-' + d + ' ' + d * .6 + ' z" fill="' + cTop + '"' + st(3) + '/>' +
      '<path d="M' + (x + w) + ' ' + y + ' l' + d + ' -' + d * .6 + ' v' + h + ' l-' + d + ' ' + d * .6 + ' z" fill="' + cSide + '"' + st(3) + '/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 5) + '" fill="' + cFront + '"' + st(3.4) + '/>';
  }

  const DRAW = {
    /* ───────── ความแข็ง / ยืดหยุ่น ───────── */
    sponge: (g) => shadow(50, 84, 38) +
      '<rect x="12" y="34" width="76" height="46" rx="12" fill="' + g('#ffe86a', '#ffc21f') + '"' + st(3.4) + '/>' +
      '<rect x="12" y="24" width="76" height="20" rx="9" fill="' + g('#5be58f', '#27b565') + '"' + st(3.4) + '/>' +
      '<g fill="#b87d00" opacity=".55"><ellipse cx="26" cy="56" rx="4.5" ry="3"/><ellipse cx="44" cy="68" rx="5" ry="3.4"/><ellipse cx="62" cy="54" rx="3.6" ry="2.6"/><ellipse cx="76" cy="66" rx="4.6" ry="3"/><ellipse cx="54" cy="46" rx="3" ry="2.2"/><ellipse cx="32" cy="72" rx="3" ry="2.2"/></g>' +
      '<g fill="#fff" opacity=".6"><circle cx="24" cy="30" r="1.6"/><circle cx="36" cy="35" r="1.6"/><circle cx="50" cy="30" r="1.6"/><circle cx="64" cy="35" r="1.6"/><circle cx="78" cy="30" r="1.6"/></g>' +
      '<path d="M18 42 Q22 38 30 38" stroke="#fff7b8" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
    clay: (g, rg) => shadow(50, 84, 38) +
      '<path d="M16 72 Q8 54 24 42 Q32 24 52 28 Q74 20 84 42 Q96 58 82 72 Q66 84 40 82 Q22 82 16 72 Z" fill="' + rg('#a8f0a0', '#43b94a') + '"' + st(3.4) + '/>' +
      '<path d="M26 46 Q34 34 50 34" fill="none" stroke="#e5ffe0" stroke-width="4" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="62" cy="58" rx="9" ry="6" fill="#3aa840" opacity=".5"/><ellipse cx="40" cy="64" rx="6" ry="4" fill="#3aa840" opacity=".4"/>',
    eraser: (g) => shadow(50, 84, 40) +
      block(10, 38, 66, 38, 14, g('#ff9fc0', '#f2638e'), '#ffd0e0', '#d94a7a', 8) +
      '<rect x="32" y="38" width="22" height="38" fill="' + g('#7cc4ff', '#3a8fe0') + '"' + st(3) + '/>' +
      '<path d="M36 46 H50 M36 52 H50" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M14 46 Q16 42 22 42" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>',
    rubber: (g) => shadow(50, 84, 40) +
      block(10, 44, 70, 26, 12, g('#ff7aa0', '#e0457a'), '#ffb0c8', '#b93063', 7) +
      '<g fill="#a52a58" opacity=".5"><circle cx="22" cy="57" r="3"/><circle cx="36" cy="57" r="3"/><circle cx="50" cy="57" r="3"/><circle cx="64" cy="57" r="3"/></g>' +
      '<path d="M14 50 Q16 47 22 47" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>',
    wood: (g) => shadow(50, 84, 40) +
      block(10, 36, 66, 40, 14, g('#e0a766', '#b9783a'), '#f0c88e', '#9a6128', 6) +
      '<g fill="none" stroke="#8a5420" stroke-width="2.2" stroke-linecap="round" opacity=".7"><path d="M14 46 Q40 42 72 48"/><path d="M14 56 Q44 62 72 56"/><path d="M14 66 Q36 62 72 68"/></g>' +
      '<ellipse cx="56" cy="56" rx="6" ry="4" fill="#8a5420" opacity=".55"/><path d="M14 42 Q16 40 22 40" stroke="#fff3d6" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>',
    plastic: (g) => shadow(50, 84, 40) +
      block(10, 36, 66, 40, 14, g('#7ed0ff', '#2f86e6'), '#b8e6ff', '#1f66c0', 10) +
      '<path d="M16 46 Q18 42 28 41" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/><path d="M60 70 H70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>',
    steel: (g) => shadow(50, 84, 40) +
      block(10, 36, 66, 40, 14, g('#e6edf5', '#8798ab'), '#f6fafe', '#62758a', 4) +
      '<path d="M12 50 H74" stroke="#fff" stroke-width="2.4" opacity=".7"/><path d="M12 62 H74" stroke="#6f8196" stroke-width="2" opacity=".5"/>' +
      '<circle cx="19" cy="43" r="2.6" fill="#7b8da1" stroke="' + INK + '" stroke-width="1.6"/><circle cx="67" cy="43" r="2.6" fill="#7b8da1" stroke="' + INK + '" stroke-width="1.6"/><circle cx="19" cy="69" r="2.6" fill="#7b8da1" stroke="' + INK + '" stroke-width="1.6"/><circle cx="67" cy="69" r="2.6" fill="#7b8da1" stroke="' + INK + '" stroke-width="1.6"/>',
    stone: (g, rg) => shadow(50, 84, 40) +
      '<path d="M14 72 L20 46 L38 28 L64 30 L84 46 L88 68 L64 80 L32 80 Z" fill="' + rg('#cfcfda', '#8a8a9c') + '"' + st(3.6) + '/>' +
      '<path d="M38 28 L44 46 L64 30 M44 46 L50 66 L32 80 M50 66 L88 68" fill="none" stroke="#6c6c80" stroke-width="2" opacity=".6"/>' +
      '<g fill="#5c5c70" opacity=".5"><circle cx="30" cy="58" r="2"/><circle cx="62" cy="52" r="2.4"/><circle cx="72" cy="62" r="1.8"/><circle cx="48" cy="72" r="2"/></g>' +
      '<path d="M26 50 L32 38" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>',
    glass: (g) => shadow(50, 84, 40) +
      block(12, 34, 62, 42, 12, 'rgba(170,232,247,.62)', 'rgba(220,248,255,.8)', 'rgba(120,200,225,.7)', 8) +
      '<path d="M20 44 L36 40 M20 56 L48 48" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/><circle cx="60" cy="64" r="2.4" fill="#fff" opacity=".8"/>',
    cloth: (g) => shadow(50, 84, 38) +
      '<path d="M12 34 Q50 24 88 34 L88 74 Q50 84 12 74 Z" fill="' + g('#c9a8ff', '#8f66e8') + '"' + st(3.4) + '/>' +
      '<path d="M12 46 Q50 38 88 46 M12 58 Q50 50 88 58 M12 70 Q50 62 88 70" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="5 5" opacity=".7"/>' +
      '<path d="M22 40 Q40 34 56 36" stroke="#efe3ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
    alu: (g) => shadow(50, 84, 40) +
      '<path d="M12 40 L72 32 L88 52 L28 62 Z" fill="' + g('#f4f8fc', '#a3b2c3') + '"' + st(3.4) + '/><path d="M12 40 L28 62 L28 70 L12 48 Z" fill="#8798ab"' + st(3) + '/><path d="M28 62 L88 52 L88 60 L28 70 Z" fill="#6f8196"' + st(3) + '/>' +
      '<path d="M26 44 L60 40 M34 54 L72 48" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><circle cx="26" cy="52" r="2" fill="#6f8196"/>',
    band: (g) => shadow(50, 80, 36) +
      '<g class="it-band"><ellipse cx="42" cy="48" rx="26" ry="20" fill="none" stroke="' + INK + '" stroke-width="13"/><ellipse cx="42" cy="48" rx="26" ry="20" fill="none" stroke="#ff6b8a" stroke-width="7"/>' +
      '<ellipse cx="60" cy="52" rx="24" ry="18" fill="none" stroke="' + INK + '" stroke-width="13" opacity=".95"/><ellipse cx="60" cy="52" rx="24" ry="18" fill="none" stroke="#ffb02e" stroke-width="7"/>' +
      '<path d="M26 38 Q34 30 44 30" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></g>',
    spring: (g) => {
      let s = shadow(50, 80, 38) + '<g class="it-spring">';
      for (let i = 0; i < 6; i++) {
        const x = 18 + i * 12.5;
        s += '<ellipse cx="' + x + '" cy="50" rx="6.5" ry="22" transform="rotate(-14 ' + x + ' 50)" fill="none" stroke="' + INK + '" stroke-width="9"/>';
      }
      for (let i = 0; i < 6; i++) {
        const x = 18 + i * 12.5;
        s += '<ellipse cx="' + x + '" cy="50" rx="6.5" ry="22" transform="rotate(-14 ' + x + ' 50)" fill="none" stroke="' + g('#eef3f9', '#8798ab') + '" stroke-width="4.4"/>';
      }
      return s + '</g>';
    },
    ball: (g, rg) => shadow(50, 84, 32) +
      '<defs><clipPath id="bc1"><circle cx="50" cy="50" r="33"/></clipPath></defs>' +
      '<circle cx="50" cy="50" r="33" fill="' + rg('#ff8a9a', '#e0334f') + '"/>' +
      '<g clip-path="url(#bc1)"><path d="M10 40 Q50 66 92 40 V60 Q50 86 10 60 Z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.4"/><path d="M30 14 Q50 30 70 14" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/></g>' +
      '<circle cx="50" cy="50" r="33" fill="none"' + st(3.6) + '/><ellipse cx="38" cy="34" rx="8" ry="5" transform="rotate(-30 38 34)" fill="#fff" opacity=".7"/>',
    paper: (g) => shadow(50, 88, 30) +
      '<path d="M24 12 H62 L80 30 V86 H24 Z" fill="' + g('#ffffff', '#ece6d6') + '"' + st(3.4) + '/>' +
      '<path d="M62 12 V30 H80 Z" fill="#dcd2ba"' + st(3) + '/>' +
      '<path d="M32 42 H70 M32 52 H70 M32 62 H62 M32 72 H66" stroke="#b9b09a" stroke-width="3" stroke-linecap="round"/>',
    foil: (g) => shadow(50, 84, 36) +
      '<path d="M14 62 L22 36 L42 24 L58 32 L84 30 L88 56 L74 76 L48 70 L28 80 Z" fill="' + g('#f7fbff', '#9fb0c4') + '"' + st(3.4) + '/>' +
      '<path d="M22 36 L36 52 L58 32 M36 52 L48 70 M58 32 L62 54 L84 30 M62 54 L74 76 M28 80 L36 52" fill="none" stroke="#6f8196" stroke-width="2" opacity=".7"/>' +
      '<path d="M26 42 L36 34" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>',
    wire: (g) => shadow(50, 84, 36) +
      '<ellipse cx="46" cy="48" rx="30" ry="24" fill="none" stroke="' + INK + '" stroke-width="12"/><ellipse cx="46" cy="48" rx="30" ry="24" fill="none" stroke="#e98445" stroke-width="6"/>' +
      '<ellipse cx="46" cy="48" rx="19" ry="14" fill="none" stroke="' + INK + '" stroke-width="12"/><ellipse cx="46" cy="48" rx="19" ry="14" fill="none" stroke="#f4a261" stroke-width="6"/>' +
      '<path d="M72 60 Q86 66 90 82" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M72 60 Q86 66 90 82" fill="none" stroke="#e98445" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M26 36 Q34 28 46 28" stroke="#ffe3c4" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
    /* ───────── ช้อนทดลองความร้อน ───────── */
    cuRod:   () => spoon('#f0a066', '#c9622a'),
    alRod:   () => spoon('#f4f8fc', '#a3b2c3'),
    feRod:   () => spoon('#dfe7ef', '#7d8ea2'),
    woodRod: () => spoon('#e0a766', '#a96e30', 'wood'),
    plRod:   () => spoon('#7ed0ff', '#2f86e6'),
    rubRod:  () => spoon('#ff7aa0', '#c93a6e'),
    /* ───────── ไฟฟ้า ───────── */
    nail: (g) => shadow(50, 86, 30) +
      '<g transform="rotate(35 50 50)"><path d="M47 24 H53 L52 82 L50 90 L48 82 Z" fill="' + g('#eef3f9', '#7d8ea2', 'h') + '"' + st(3) + '/><ellipse cx="50" cy="22" rx="14" ry="6" fill="' + g('#f6fafe', '#8798ab') + '"' + st(3.2) + '/><path d="M45 20 H56" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>',
    coin: (g, rg) => shadow(50, 84, 30) +
      '<circle cx="50" cy="50" r="32" fill="' + rg('#fff6c2', '#e0b030') + '"' + st(3.6) + '/><circle cx="50" cy="50" r="24" fill="none" stroke="#a87a10" stroke-width="2.6"/>' +
      '<path d="M50 34 L54 45 L66 46 L57 53 L60 65 L50 58 L40 65 L43 53 L34 46 L46 45 Z" fill="#fff3a8" stroke="#a87a10" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M26 38 Q32 28 44 24" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>',
    clip: () => shadow(50, 86, 26) +
      '<g transform="rotate(20 50 50)"><path d="M42 80 V30 A10 10 0 0 1 62 30 V70 A8 8 0 0 1 46 70 V36" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M42 80 V30 A10 10 0 0 1 62 30 V70 A8 8 0 0 1 46 70 V36" fill="none" stroke="#c9d6e4" stroke-width="4" stroke-linecap="round"/></g>',
    key: (g) => shadow(50, 86, 30) +
      '<g transform="rotate(-35 50 50)"><circle cx="30" cy="50" r="15" fill="' + g('#ffe27a', '#e0a21f') + '"' + st(3.4) + '/><circle cx="30" cy="50" r="6" fill="#fff8d8"' + st(2.6) + '/>' +
      '<path d="M44 46 H84 V56 H78 V63 H72 V56 H64 V64 H58 V56 H44 Z" fill="' + g('#ffe27a', '#d9981a') + '"' + st(3) + '/></g>',
    stick: (g) => shadow(50, 86, 32) +
      '<g transform="rotate(-28 50 50)"><rect x="12" y="38" width="78" height="22" rx="11" fill="' + g('#f0c58a', '#c88c4a') + '"' + st(3.4) + '/><path d="M20 46 H80 M24 54 H72" stroke="#a96e30" stroke-width="2" opacity=".6" stroke-linecap="round"/><path d="M20 43 H40" stroke="#fff3d6" stroke-width="2.6" stroke-linecap="round" opacity=".8"/></g>',
    ruler: (g) => shadow(50, 86, 34) +
      '<g transform="rotate(-24 50 50)"><rect x="8" y="36" width="84" height="26" rx="5" fill="rgba(122,200,255,.75)"' + st(3.4) + '/>' +
      '<path d="M16 36 V46 M26 36 V42 M36 36 V46 M46 36 V42 M56 36 V46 M66 36 V42 M76 36 V46 M86 36 V42" stroke="' + INK + '" stroke-width="2.2"/><path d="M12 56 H88" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/></g>',
    glassRod: () => shadow(50, 86, 32) +
      '<g transform="rotate(-30 50 50)"><rect x="10" y="40" width="80" height="20" rx="10" fill="rgba(168,230,242,.7)"' + st(3.4) + '/><path d="M18 46 H78" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/><path d="M22 55 H62" stroke="#7cc4dc" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>',
    /* ───────── สถานะของสสาร ───────── */
    rock: (g, rg) => DRAW.stone(g, rg),
    book: (g) => shadow(50, 86, 34) +
      '<path d="M18 22 H72 V80 H18 Z" fill="' + g('#ff7a8a', '#d9364f') + '"' + st(3.4) + '/><path d="M72 22 L82 28 V86 L72 80 Z" fill="#fff3d1"' + st(3) + '/><path d="M18 80 H72 L82 86 H28 Z" fill="#e8d7a8"' + st(3) + '/>' +
      '<path d="M28 22 V80" stroke="#a8243a" stroke-width="3"/><rect x="36" y="32" width="28" height="16" rx="3" fill="#ffe27a"' + st(2.4) + '/><path d="M40 38 H60 M40 43 H54" stroke="#b9800a" stroke-width="2.2" stroke-linecap="round"/>',
    ice: (g) => shadow(50, 86, 34) +
      block(14, 34, 46, 44, 16, 'rgba(190,236,255,.85)', 'rgba(230,250,255,.95)', 'rgba(140,208,240,.85)', 8) +
      '<path d="M20 42 L34 40 M20 54 L44 46" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M40 78 Q42 88 44 78" fill="#bfe9ff" stroke="' + INK + '" stroke-width="2"/>',
    sand: (g) => shadow(50, 86, 42) +
      '<path d="M8 80 Q30 76 40 52 Q50 24 60 52 Q70 76 92 80 Z" fill="' + g('#ffe3a0', '#e2b25a') + '"' + st(3.4) + '/>' +
      '<g fill="#b98530" opacity=".7"><circle cx="30" cy="72" r="1.6"/><circle cx="46" cy="60" r="1.6"/><circle cx="58" cy="68" r="1.6"/><circle cx="70" cy="74" r="1.6"/><circle cx="50" cy="46" r="1.4"/><circle cx="38" cy="66" r="1.4"/></g>' +
      '<path d="M44 40 Q50 30 54 40" fill="none" stroke="#fff6d0" stroke-width="3" stroke-linecap="round"/>',
    salt: (g) => shadow(50, 86, 26) +
      '<path d="M30 40 H70 V78 Q70 84 64 84 H36 Q30 84 30 78 Z" fill="rgba(230,248,255,.85)"' + st(3.4) + '/>' +
      '<path d="M32 56 Q50 48 68 56 V78 Q68 82 64 82 H36 Q32 82 32 78 Z" fill="#fff"/><g fill="#c8d4e3"><circle cx="40" cy="66" r="1.8"/><circle cx="52" cy="72" r="1.8"/><circle cx="60" cy="64" r="1.8"/><circle cx="46" cy="76" r="1.6"/></g>' +
      '<path d="M28 40 Q50 26 72 40 V44 H28 Z" fill="' + g('#e6edf5', '#8798ab') + '"' + st(3.4) + '/><g fill="' + INK + '"><circle cx="42" cy="36" r="1.8"/><circle cx="50" cy="34" r="1.8"/><circle cx="58" cy="36" r="1.8"/></g>' +
      '<path d="M36 52 V76" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>',
    pencil: (g) => shadow(50, 86, 32) +
      '<g transform="rotate(-38 50 50)"><rect x="10" y="40" width="60" height="22" rx="3" fill="' + g('#ffe66b', '#f2b51f') + '"' + st(3.2) + '/><path d="M70 40 L92 51 L70 62 Z" fill="#f4d6a8"' + st(3.2) + '/><path d="M84 47.5 L92 51 L84 54.5 Z" fill="' + INK + '"/>' +
      '<rect x="4" y="40" width="10" height="22" rx="3" fill="#ff8fb0"' + st(3) + '/><rect x="14" y="40" width="6" height="22" fill="#c9d6e4"' + st(2.4) + '/><path d="M24 46 H62" stroke="#fff7c2" stroke-width="2.6" stroke-linecap="round"/></g>',
    water: (g) => shadow(50, 88, 28) +
      '<path d="M26 22 H74 L70 82 Q70 88 64 88 H36 Q30 88 30 82 Z" fill="rgba(235,248,255,.8)"' + st(3.4) + '/>' +
      '<path d="M29 44 Q40 38 50 44 T71 44 L70 82 Q70 85 64 85 H36 Q31 85 30 82 Z" fill="' + g('#7fd2ff', '#2f9cf0') + '"/>' +
      '<path d="M36 30 V70" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/><circle cx="56" cy="62" r="2.4" fill="#fff" opacity=".7"/><circle cx="46" cy="70" r="1.8" fill="#fff" opacity=".7"/>',
    milk: (g) => shadow(50, 88, 28) +
      '<path d="M28 20 H72 L68 82 Q68 88 62 88 H38 Q32 88 32 82 Z" fill="rgba(240,248,255,.85)"' + st(3.4) + '/>' +
      '<path d="M31 34 Q40 28 50 34 T69 34 L68 82 Q68 85 62 85 H38 Q33 85 32 82 Z" fill="#fffdf7"/><path d="M31 34 Q40 28 50 34 T69 34" fill="none" stroke="#e8e0cf" stroke-width="2.4"/>' +
      '<path d="M37 40 V72" stroke="#e8e0cf" stroke-width="3.4" stroke-linecap="round"/>',
    oil: (g) => shadow(50, 88, 26) +
      '<path d="M42 10 H58 V24 Q74 30 74 46 V80 Q74 88 66 88 H34 Q26 88 26 80 V46 Q26 30 42 24 Z" fill="rgba(255,244,196,.8)"' + st(3.4) + '/>' +
      '<path d="M28 44 Q28 34 40 30 H60 Q72 34 72 44 V80 Q72 85 66 85 H34 Q28 85 28 80 Z" fill="' + g('#ffe45a', '#f0a712') + '"/>' +
      '<rect x="36" y="56" width="28" height="18" rx="4" fill="#fff"' + st(2.4) + '/><path d="M41 62 H59 M41 68 H54" stroke="#e0a21f" stroke-width="2.4" stroke-linecap="round"/><rect x="40" y="6" width="20" height="8" rx="3" fill="#ff5a6e"' + st(3) + '/>',
    honey: (g) => shadow(50, 88, 30) +
      '<path d="M24 34 H76 V80 Q76 88 68 88 H32 Q24 88 24 80 Z" fill="rgba(255,236,170,.8)"' + st(3.4) + '/>' +
      '<path d="M26 40 H74 V80 Q74 85 68 85 H32 Q26 85 26 80 Z" fill="' + g('#ffc83a', '#d97a06') + '"/>' +
      '<rect x="22" y="26" width="56" height="12" rx="5" fill="#8a5a2b"' + st(3.4) + '/>' +
      '<path d="M34 46 V72" stroke="#fff3b0" stroke-width="3.4" stroke-linecap="round" opacity=".8"/><rect x="40" y="56" width="20" height="16" rx="4" fill="#fff"' + st(2.4) + '/>' +
      '<path d="M66 8 V30" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/><path d="M60 28 Q66 40 72 28" fill="#d97a06"' + st(2.4) + '/>',
    juice: (g) => shadow(50, 88, 28) +
      '<path d="M24 24 H76 L70 84 Q70 88 64 88 H36 Q30 88 30 84 Z" fill="rgba(255,240,215,.8)"' + st(3.4) + '/>' +
      '<path d="M27 38 H73 L70 82 Q70 85 64 85 H36 Q31 85 30 82 Z" fill="' + g('#ffb347', '#ff7a1a') + '"/>' +
      '<path d="M62 4 L56 30" stroke="#3ccf7a"' + st(4.4) + '/><circle cx="76" cy="30" r="12" fill="#ffd23f"' + st(3) + '/><path d="M76 30 L76 20 M76 30 L84 26 M76 30 L84 34 M76 30 L76 40 M76 30 L68 34 M76 30 L68 26" stroke="#fff3b0" stroke-width="1.8"/>' +
      '<path d="M34 46 V70" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>',
    air: (g, rg) => shadow(50, 90, 24) +
      '<path d="M50 10 C26 10 18 28 18 44 C18 62 34 74 50 80 C66 74 82 62 82 44 C82 28 74 10 50 10 Z" fill="' + rg('#e8f9ff', '#8fd8f2') + '"' + st(3.6) + '/>' +
      '<path d="M44 80 L50 88 L56 80 Z" fill="#8fd8f2"' + st(3) + '/><path d="M32 30 Q36 20 46 18" stroke="#fff" stroke-width="4.4" fill="none" stroke-linecap="round"/>' +
      '<g fill="none" stroke="#3aa0d0" stroke-width="2.4" stroke-linecap="round" opacity=".7"><path d="M36 48 q6 -5 12 0 t12 0"/><path d="M34 58 q6 -5 12 0 t12 0"/></g>',
    helium: (g, rg) => shadow(50, 92, 20) +
      '<path d="M30 8 C14 8 10 22 10 32 C10 44 20 52 30 56 C40 52 50 44 50 32 C50 22 46 8 30 8 Z" fill="' + rg('#ffc0d8', '#f0549a') + '"' + st(3.4) + '/>' +
      '<path d="M70 14 C56 14 52 26 52 36 C52 48 62 56 70 60 C78 56 88 48 88 36 C88 26 84 14 70 14 Z" fill="' + rg('#d9c8ff', '#8a5cf0') + '"' + st(3.4) + '/>' +
      '<path d="M30 56 Q26 70 44 84 M70 60 Q76 74 52 88" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M20 18 Q24 12 32 12" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/><path d="M62 24 Q66 18 74 18" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/>',
    lpg: (g) => shadow(50, 90, 26) +
      '<rect x="26" y="22" width="48" height="62" rx="16" fill="' + g('#ff8a8a', '#d9364f', 'h') + '"' + st(3.6) + '/>' +
      '<rect x="40" y="10" width="20" height="14" rx="4" fill="' + g('#e6edf5', '#8798ab') + '"' + st(3.2) + '/><path d="M46 10 V4 H54 V10" fill="none"' + st(3.4) + '/>' +
      '<rect x="32" y="44" width="36" height="22" rx="6" fill="#fff6d6"' + st(2.4) + '/>' +
      '<path d="M50 62 C42 60 42 52 48 46 C48 50 52 50 52 46 C58 52 58 60 50 62 Z" fill="#ff7a1a"' + st(2.2) + '/>' +
      '<path d="M32 30 V74" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/>',
    soda: (g) => shadow(50, 90, 24) +
      '<path d="M42 6 H58 V20 Q72 28 72 46 V82 Q72 90 64 90 H36 Q28 90 28 82 V46 Q28 28 42 20 Z" fill="rgba(210,255,225,.7)"' + st(3.4) + '/>' +
      '<path d="M30 40 Q30 30 42 26 H58 Q70 30 70 40 V82 Q70 87 64 87 H36 Q30 87 30 82 Z" fill="' + g('#7be2a0', '#2fa862') + '"/>' +
      '<rect x="38" y="52" width="24" height="18" rx="4" fill="#fff"' + st(2.4) + '/><path d="M43 58 H57 M43 64 H53" stroke="#2fa862" stroke-width="2.4" stroke-linecap="round"/>' +
      '<rect x="40" y="2" width="20" height="8" rx="3" fill="#ff5a6e"' + st(3) + '/>' +
      '<g class="bub" fill="#fff" stroke="' + INK + '" stroke-width="1.6"><circle cx="40" cy="38" r="3"/><circle cx="52" cy="32" r="2.4"/><circle cx="60" cy="42" r="3.2"/><circle cx="46" cy="46" r="2"/></g>'
  };
  /* ช้อน (วาดเฉียง) */
  function spoon(c1, c2, wood) {
    const id = uid('sp');
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      shadow(50, 90, 26) +
      '<g transform="rotate(38 50 50)"><path d="M46 46 H54 L56 90 Q50 94 44 90 Z" fill="url(#' + id + ')"' + st(3.2) + '/>' +
      '<ellipse cx="50" cy="26" rx="19" ry="23" fill="url(#' + id + ')"' + st(3.4) + '/>' +
      (wood ? '<path d="M46 56 V84 M52 52 V86" stroke="#7a4a1c" stroke-width="1.8" opacity=".6" fill="none"/>' : '') +
      '<ellipse cx="44" cy="20" rx="6" ry="10" fill="#fff" opacity=".45"/></g>';
  }

  function item(id, cls) {
    const fn = DRAW[id];
    if (!fn) return mk(() => '<rect x="20" y="20" width="60" height="60" rx="10" fill="#dfe6f3"' + st(3.4) + '/>', cls);
    return mk(fn, 'it-' + id + (cls ? ' ' + cls : ''));
  }

  /* ───────── พื้นผิววัสดุสำหรับชิ้นงาน ───────── */
  const LOOK = {
    wood: ['#e6b074', '#a96e30'], plastic: ['#7ed0ff', '#2f86e6'], steel: ['#e6edf5', '#7d8ea2'], alu: ['#f4f8fc', '#a3b2c3'],
    rubber: ['#ff7aa0', '#c93a6e'], cloth: ['#c9a8ff', '#8f66e8'], wire: ['#f4a261', '#c9622a'], sponge: ['#ffe86a', '#ffc21f'],
    clay: ['#a8f0a0', '#43b94a'], eraser: ['#ff9fc0', '#f2638e'], stone: ['#cfcfda', '#8a8a9c'], glass: ['#bfeaf6', '#7cc4dc']
  };
  const lookPair = id => LOOK[id] || ['#dfe6f3', '#a9b6cf'];

  /* ───────── ชิ้นงานที่ให้เลือกวัสดุประกอบ ─────────
     assign = {part: itemId | null}  → svg พร้อมคลาสให้แอนิเมชันเรียกใช้ */
  function object(kind, assign) {
    assign = assign || {};
    const defs = [];
    const fill = (part, fallback) => {
      const idn = assign[part];
      const pr = idn ? lookPair(idn) : (fallback || ['#eef2fa', '#d3dcec']);
      const gid = uid('o');
      defs.push('<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pr[0] + '"/><stop offset="1" stop-color="' + pr[1] + '"/></linearGradient>');
      return 'url(#' + gid + ')';
    };
    const empty = part => assign[part] ? '' : ' ob-empty';
    let body = '', vb = '0 0 200 150';
    if (kind === 'pot') {
      body =
        '<ellipse cx="96" cy="140" rx="70" ry="6" fill="rgba(34,48,90,.2)"/>' +
        /* เตา + ไฟ */
        '<rect x="34" y="118" width="124" height="16" rx="6" fill="#5b6a86"' + st(3.4) + '/>' +
        '<g class="ob-flames"><path d="M54 118 C50 108 58 104 56 96 C64 102 66 112 62 118 Z" fill="#ff8a1f"' + st(2.2) + '/><path d="M80 118 C76 106 86 102 82 92 C92 100 94 112 88 118 Z" fill="#ffb02e"' + st(2.2) + '/><path d="M106 118 C102 108 110 104 108 96 C116 102 118 112 114 118 Z" fill="#ff8a1f"' + st(2.2) + '/><path d="M132 118 C128 108 136 104 134 96 C142 102 144 112 140 118 Z" fill="#ffb02e"' + st(2.2) + '/></g>' +
        /* ตัวหม้อ */
        '<g class="ob-part ob-body' + empty('body') + '"><path d="M38 50 H154 L148 106 Q147 116 136 116 H56 Q45 116 44 106 Z" fill="' + fill('body') + '"' + st(4) + '/>' +
        '<path d="M54 68 H138 L136 100 Q135 106 128 106 H64 Q57 106 56 100 Z" fill="#6cc8ff" stroke="' + INK + '" stroke-width="2.4" opacity=".95"/>' +
        '<path d="M58 70 Q76 64 96 70 T136 70" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M46 58 V100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/><path d="M48 54 H66" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"/></g>' +
        '<g class="ob-bubbles" opacity="0"><circle cx="72" cy="92" r="4" fill="#fff"/><circle cx="96" cy="84" r="5" fill="#fff"/><circle cx="122" cy="92" r="4" fill="#fff"/><circle cx="84" cy="99" r="3" fill="#fff"/></g>' +
        /* ด้าม */
        '<g class="ob-part ob-handle' + empty('handle') + '"><path d="M152 60 H196 Q200 60 200 65 V73 Q200 78 196 78 H150 Z" fill="' + fill('handle') + '"' + st(4) + '/>' +
        '<path d="M160 66 H190" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect class="ob-handle-hot" x="152" y="60" width="48" height="18" rx="4" fill="#ff3d2e" opacity="0"/></g>' +
        '<g class="ob-steam" opacity="0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M70 40 q6 -8 0 -16 t0 -16"/><path d="M96 38 q6 -8 0 -16 t0 -16"/><path d="M122 40 q6 -8 0 -16 t0 -16"/></g>';
    } else if (kind === 'cable') {
      vb = '0 0 200 150';
      body =
        '<ellipse cx="100" cy="132" rx="84" ry="5" fill="rgba(34,48,90,.18)"/>' +
        /* ปลอกหุ้ม (ตัดครึ่งให้เห็นแกน) */
        '<g class="ob-part ob-cover' + empty('cover') + '"><rect x="48" y="52" width="140" height="40" rx="20" fill="' + fill('cover') + '"' + st(4) + '/><path d="M60 60 H170" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".55"/></g>' +
        '<g class="ob-part ob-core' + empty('core') + '"><rect x="8" y="64" width="110" height="16" rx="8" fill="' + fill('core') + '"' + st(3.4) + '/><path d="M16 69 H100" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>' +
        '<path class="ob-flow" d="M14 72 H112" stroke="#fff3a0" stroke-width="3.4" stroke-dasharray="6 8" opacity="0" stroke-linecap="round"/></g>' +
        '<path d="M48 52 Q40 72 48 92" fill="none"' + st(3.4) + '/>';
    } else if (kind === 'helmet') {
      body =
        '<ellipse cx="100" cy="140" rx="64" ry="6" fill="rgba(34,48,90,.2)"/>' +
        '<g class="ob-head"><circle cx="100" cy="98" r="34" fill="#ffd7b4"' + st(4) + '/>' +
        '<g class="ob-face-ok"><path d="M84 100 Q90 92 96 100 M104 100 Q110 92 116 100" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M90 114 Q100 124 110 114" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/></g>' +
        '<g class="ob-face-ouch" opacity="0"><path d="M82 94 L96 102 M96 94 L82 102 M104 94 L118 102 M118 94 L104 102" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><ellipse cx="100" cy="116" rx="7" ry="8" fill="#9b2c4a"' + st(3.2) + '/></g></g>' +
        '<g class="ob-hat">' +
        '<g class="ob-part ob-pad' + empty('pad') + '"><path d="M58 92 Q58 52 100 52 Q142 52 142 92 L130 92 Q130 66 100 66 Q70 66 70 92 Z" fill="' + fill('pad') + '"' + st(3.6) + '/></g>' +
        '<g class="ob-part ob-shell' + empty('shell') + '"><path d="M50 98 Q46 38 100 36 Q154 38 150 98 Z" fill="' + fill('shell') + '"' + st(4.4) + '/><path d="M44 98 H156" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M70 56 Q80 46 98 46" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g></g>' +
        '<g class="ob-ball"><circle cx="100" cy="-20" r="14" fill="#ff5a6e"' + st(3.4) + '/><path d="M90 -26 Q100 -18 110 -26" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></g>';
      vb = '0 -40 200 190';
    }
    return '<svg class="obj obj-' + kind + '" viewBox="' + vb + '" aria-hidden="true"><defs>' + defs.join('') + '</defs>' + body + '</svg>';
  }

  /* ───────── การ์ดตัวอย่าง (ภาพ + ชื่อ) ───────── */
  function card(id, o) {
    o = o || {};
    const nm = (MM.ITEM[id] || MM.SI[id] || {}).n || id;
    return '<span class="icard' + (o.cls ? ' ' + o.cls : '') + '" data-id="' + id + '">' + item(id) + (o.noName ? '' : '<b class="icard-n">' + (o.name || nm) + '</b>') + '</span>';
  }

  Object.assign(A, { item, DRAW, look: lookPair, object, card });
})();
