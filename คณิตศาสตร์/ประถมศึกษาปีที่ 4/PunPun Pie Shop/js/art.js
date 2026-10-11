/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — Procedural SVG art
   พาย / ตัวละคร / ไอคอน วาดด้วย SVG ทั้งหมด (ไม่มีรูปภาพหรืออิโมจิ)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const R = 50;

  function wedgePath(i, d, r) {
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / d;
    const a1 = a0 + 2 * Math.PI / d;
    const x0 = (r * Math.cos(a0)).toFixed(2), y0 = (r * Math.sin(a0)).toFixed(2);
    const x1 = (r * Math.cos(a1)).toFixed(2), y1 = (r * Math.sin(a1)).toFixed(2);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return 'M0,0 L' + x0 + ',' + y0 + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1 + ',' + y1 + ' Z';
  }

  /* พาย 1 ถาด แบ่ง d ชิ้น เติมไส้ filled ชิ้น (ตัวเลข หรือ array ของ index) */
  function pie(d, filled, o) {
    o = o || {};
    const isOn = i => Array.isArray(filled) ? filled.indexOf(i) >= 0 : i < filled;
    let s = '<svg class="pie fl-' + (o.flavor || 'berry') + ' ' + (o.cls || '') + '" viewBox="-60 -60 120 120" aria-hidden="true">';
    s += '<circle class="pie-plate" r="58"/>';
    s += '<circle class="pie-tin" r="' + (R + 3) + '"/>';
    if (d === 1) {
      s += '<circle class="sl ' + (isOn(0) ? 'on' : 'off') + '" data-i="0" r="' + R + '"/>';
    } else {
      for (let i = 0; i < d; i++) {
        s += '<path class="sl ' + (isOn(i) ? 'on' : 'off') + '" data-i="' + i + '" d="' + wedgePath(i, d, R) + '"/>';
      }
    }
    s += '<circle class="pie-rim" r="' + R + '"/>';
    s += '</svg>';
    return s;
  }

  /* พายหลายถาด แทนค่า n/d */
  function pies(n, d, o) {
    o = o || {};
    const count = o.count || Math.max(1, Math.ceil(n / d));
    let s = '<div class="pies ' + (o.cls || '') + '">';
    for (let p = 0; p < count; p++) {
      const f = Math.max(0, Math.min(d, n - p * d));
      s += pie(d, f, o);
    }
    return s + '</div>';
  }

  /* ชิ้นพายเดี่ยว 1 ชิ้น (ขนาด 1/d) */
  function slice(d, o) {
    o = o || {};
    /* ครอบ viewBox ให้พอดีชิ้น เพื่อให้ชิ้นเล็ก ๆ ยังมองเห็นชัด */
    const xs = [0], ys = [0];
    const a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI / d;
    for (let k = 0; k <= 24; k++) {
      const a = a0 + (a1 - a0) * k / 24;
      xs.push(R * Math.cos(a)); ys.push(R * Math.sin(a));
    }
    const pad = 5;
    const x0 = Math.min.apply(null, xs) - pad, y0 = Math.min.apply(null, ys) - pad;
    const w = Math.max.apply(null, xs) - x0 + pad, h = Math.max.apply(null, ys) - y0 + pad;
    const s = Math.max(w, h);
    const vb = (x0 - (s - w) / 2).toFixed(1) + ' ' + (y0 - (s - h) / 2).toFixed(1) + ' ' + s.toFixed(1) + ' ' + s.toFixed(1);
    return '<svg class="slice fl-' + (o.flavor || 'berry') + '" viewBox="' + vb + '" aria-hidden="true">' +
      '<path class="sl on" d="' + wedgePath(0, d, R) + '"/></svg>';
  }

  /* พายจิ๋วในข้อความ */
  function miniPie(n, d) {
    return '<span class="mini-pie">' + pies(n, d, { cls: 'mini' }) + '</span>';
  }

  /* ── ตัวละคร: หมีปันปัน (เชฟทำพาย) ── */
  function punpun(mood) {
    return '<svg class="pp mood-' + (mood || 'happy') + '" viewBox="0 0 200 220" aria-label="ปันปัน">' +
      '<ellipse class="ch-shadow" cx="100" cy="212" rx="62" ry="7"/>' +
      '<g class="pp-bob">' +
        '<g class="arm arm-l"><ellipse cx="48" cy="165" rx="15" ry="24" class="fur"/></g>' +
        '<g class="arm arm-r"><ellipse cx="152" cy="165" rx="15" ry="24" class="fur"/></g>' +
        '<path class="fur" d="M44 206 Q38 136 100 130 Q162 136 156 206 Z"/>' +
        '<path class="apron" d="M66 206 Q62 156 100 152 Q138 156 134 206 Z"/>' +
        '<path class="apron-str" d="M70 158 Q100 140 130 158"/>' +
        '<g transform="translate(100 182) scale(0.2)"><circle r="56" class="mp-plate"/><circle r="48" class="mp-fill"/>' +
          '<path d="M0 0 L0 -48 M0 0 L42 24 M0 0 L-42 24" class="mp-cut"/></g>' +
        '<g class="pp-head">' +
          '<circle cx="56" cy="52" r="19" class="fur"/><circle cx="56" cy="52" r="10" class="ear-in"/>' +
          '<circle cx="144" cy="52" r="19" class="fur"/><circle cx="144" cy="52" r="10" class="ear-in"/>' +
          '<circle cx="100" cy="88" r="54" class="fur"/>' +
          '<ellipse cx="100" cy="110" rx="27" ry="20" class="muzzle"/>' +
          '<ellipse cx="100" cy="100" rx="9" ry="6.5" class="ink-fill"/>' +
          '<g class="eyes-o"><ellipse cx="76" cy="84" rx="6.5" ry="8.5" class="ink-fill"/><ellipse cx="124" cy="84" rx="6.5" ry="8.5" class="ink-fill"/>' +
            '<circle cx="78.5" cy="80.5" r="2.4" class="glint"/><circle cx="126.5" cy="80.5" r="2.4" class="glint"/></g>' +
          '<g class="eyes-h"><path d="M68 86 Q76 76 84 86" class="ink-line"/><path d="M116 86 Q124 76 132 86" class="ink-line"/></g>' +
          '<g class="brows"><path d="M68 70 L84 74" class="ink-line"/><path d="M132 70 L116 74" class="ink-line"/></g>' +
          '<ellipse cx="64" cy="104" rx="9" ry="6" class="cheek"/><ellipse cx="136" cy="104" rx="9" ry="6" class="cheek"/>' +
          '<path class="m m-smile ink-line" d="M89 112 Q100 122 111 112"/>' +
          '<path class="m m-open" d="M88 110 Q100 128 112 110 Z"/>' +
          '<ellipse class="m m-o" cx="100" cy="116" rx="5.5" ry="6.5"/>' +
          '<path class="m m-hmm ink-line" d="M91 116 Q100 111 109 117"/>' +
          '<g class="hat">' +
            '<circle cx="70" cy="22" r="18"/><circle cx="100" cy="12" r="22"/><circle cx="130" cy="22" r="18"/>' +
            '<rect x="62" y="24" width="76" height="20" rx="7"/>' +
          '</g>' +
        '</g>' +
      '</g>' +
    '</svg>';
  }

  /* ── ตัวละคร: หนูมิกซ์ จอมสลับป้าย ── */
  function mix(mood) {
    return '<svg class="mixc mood-' + (mood || 'smirk') + '" viewBox="0 0 200 220" aria-label="มิกซ์">' +
      '<ellipse class="ch-shadow" cx="100" cy="212" rx="55" ry="7"/>' +
      '<g class="mix-bob">' +
        '<path class="mix-tail" d="M140 196 Q186 190 180 158 Q174 132 192 120"/>' +
        '<path class="mfur" d="M58 208 Q52 142 100 136 Q148 142 142 208 Z"/>' +
        '<ellipse cx="100" cy="186" rx="26" ry="18" class="mbelly"/>' +
        '<path class="bandana" d="M66 138 L134 138 L100 166 Z"/>' +
        '<g class="mix-head">' +
          '<circle cx="58" cy="54" r="30" class="mfur"/><circle cx="58" cy="54" r="18" class="ear-pink"/>' +
          '<circle cx="142" cy="54" r="30" class="mfur"/><circle cx="142" cy="54" r="18" class="ear-pink"/>' +
          '<ellipse cx="100" cy="98" rx="46" ry="41" class="mfur"/>' +
          '<ellipse cx="100" cy="116" rx="20" ry="13" class="mbelly"/>' +
          '<circle cx="100" cy="108" r="6.5" class="mnose"/>' +
          '<path d="M78 112 L52 106 M78 118 L52 120 M122 112 L148 106 M122 118 L148 120" class="whisk"/>' +
          '<g class="meyes-o"><ellipse cx="82" cy="90" rx="6" ry="8" class="ink-fill"/><ellipse cx="118" cy="90" rx="6" ry="8" class="ink-fill"/>' +
            '<circle cx="84" cy="87" r="2.2" class="glint"/><circle cx="120" cy="87" r="2.2" class="glint"/></g>' +
          '<g class="meyes-s"><ellipse cx="82" cy="90" rx="6" ry="8" class="ink-fill"/><circle cx="84" cy="87" r="2.2" class="glint"/>' +
            '<path d="M111 91 Q118 86 125 91" class="ink-line"/></g>' +
          '<path class="mm mm-smirk ink-line" d="M88 124 Q102 132 114 121"/>' +
          '<rect class="mm mm-smirk tooth" x="96" y="126" width="8" height="7" rx="1.5"/>' +
          '<ellipse class="mm mm-o" cx="100" cy="127" rx="5" ry="6"/>' +
          '<path class="mm mm-smile ink-line" d="M88 122 Q100 133 112 122"/>' +
        '</g>' +
      '</g>' +
    '</svg>';
  }

  /* ── ไอคอน (stroke = currentColor) ── */
  const P = {
    home: '<path d="M3 11.5 L12 3.5 L21 11.5"/><path d="M5.5 10 V20.5 H10 V15 H14 V20.5 H18.5 V10"/>',
    speaker: '<path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" class="ic-fill"/><path d="M16.2 9 Q18.2 12 16.2 15"/><path d="M18.8 6.4 Q22.6 12 18.8 17.6"/>',
    mute: '<path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" class="ic-fill"/><path d="M16.5 9.5 L21 14.5 M21 9.5 L16.5 14.5"/>',
    bulb: '<path d="M9 17.5 H15 M10 20.5 H14"/><path d="M12 3 A6 6 0 0 1 16.2 13.4 Q15 14.6 15 15.5 H9 Q9 14.6 7.8 13.4 A6 6 0 0 1 12 3 Z" class="ic-fill-soft"/>',
    gear: '<circle cx="12" cy="12" r="7.2" stroke-width="3.6" stroke-dasharray="2.9 2.75"/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="2"/>',
    book: '<path d="M3.5 5.5 Q7.75 3.5 12 5.5 V20 Q7.75 18 3.5 20 Z"/><path d="M12 5.5 Q16.25 3.5 20.5 5.5 V20 Q16.25 18 12 20"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5" class="ic-fill-soft"/><path d="M8 10.5 V8 A4 4 0 0 1 16 8 V10.5"/>',
    check: '<path d="M5 12.5 L10 17.5 L19.5 6.5"/>',
    cross: '<path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"/>',
    right: '<path d="M5 12 H19 M13 6 L19 12 L13 18"/>',
    left: '<path d="M19 12 H5 M11 6 L5 12 L11 18"/>',
    refresh: '<path d="M19.5 12 A7.5 7.5 0 1 1 17.3 6.7"/><path d="M19.5 3.5 V8.5 H14.5"/>',
    plus: '<path d="M12 5 V19 M5 12 H19"/>',
    minus: '<path d="M5 12 H19"/>',
    play: '<path d="M8 5 L19 12 L8 19 Z" class="ic-fill"/>',
    knife: '<path d="M3 17 L15 5 Q19 3 20 6 L8 18 Z" class="ic-fill-soft"/><path d="M8 18 L5.5 20.5 Q4 22 3 20.5 Q2 19 3.5 17.5 L6 15"/>',
    map: '<path d="M3 6 L9 3.5 L15 6 L21 3.5 V18 L15 20.5 L9 18 L3 20.5 Z"/><path d="M9 3.5 V18 M15 6 V20.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5 A2.5 2.5 0 1 1 12 12 V14"/><circle cx="12" cy="17.3" r="0.6" class="ic-fill"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  function star(on, cls) {
    return '<svg class="star ' + (on ? 'on' : 'off') + ' ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.6 L14.8 8.6 L21.4 9.3 L16.5 13.8 L17.9 20.4 L12 17 L6.1 20.4 L7.5 13.8 L2.6 9.3 L9.2 8.6 Z"/></svg>';
  }
  function stars(k, of, cls) {
    let s = '<span class="stars ' + (cls || '') + '">';
    for (let i = 0; i < (of || 3); i++) s += star(i < k);
    return s + '</span>';
  }

  /* ร้านค้าบนแผนที่ */
  function shop(color) {
    return '<svg class="shop" viewBox="0 0 120 110" aria-hidden="true">' +
      '<rect x="18" y="44" width="84" height="58" rx="6" class="shop-wall"/>' +
      '<path d="M10 46 L22 18 H98 L110 46 Z" class="shop-roof" style="fill:' + color + '"/>' +
      '<path d="M10 46 Q20 56 30 46 Q40 56 50 46 Q60 56 70 46 Q80 56 90 46 Q100 56 110 46" class="shop-awn"/>' +
      '<rect x="48" y="68" width="24" height="34" rx="4" class="shop-door"/>' +
      '<rect x="26" y="62" width="16" height="14" rx="3" class="shop-win"/><rect x="78" y="62" width="16" height="14" rx="3" class="shop-win"/>' +
    '</svg>';
  }

  window.PP = window.PP || {};
  window.PP.art = { pie, pies, slice, miniPie, punpun, mix, icon, star, stars, shop };
})();
