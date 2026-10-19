/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — งานภาพทั้งหมดเป็น SVG วาดด้วยโค้ด (ไม่มีอิโมจิ ไม่มีไฟล์ภาพ)
   โบโบ้ (แมวนักบินอวกาศ) / บลิ๊บ (เอเลี่ยนเมือกจอมป่วนบนจานบิน) / จรวด / ดาวเคราะห์ประจำวัน / ไอคอน / ไอเทม
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};
  const INK = '#2b1f5c';

  const svg = (vb, body, cls, extra) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" class="' + (cls || '') + '" ' + (extra || '') + ' aria-hidden="true" focusable="false">' + body + '</svg>';

  /* ═══ โบโบ้ ═══ */
  function bobo(mood) {
    mood = mood || 'happy';
    const cheer = mood === 'cheer', talk = mood === 'talk', oops = mood === 'oops', think = mood === 'think', sad = mood === 'sad';
    const pup = think ? 'transform="translate(2,-4)"' : '';
    let mouth;
    if (talk) mouth = '<ellipse cx="100" cy="102" rx="9" ry="8" fill="#7a2b4a" stroke="' + INK + '" stroke-width="3"/><ellipse cx="100" cy="106" rx="5" ry="3.5" fill="#ff8fa8"/>';
    else if (cheer) mouth = '<path d="M84 98 Q100 124 116 98 Z" fill="#7a2b4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M92 108 Q100 114 108 108 Q100 104 92 108Z" fill="#ff8fa8"/>';
    else if (oops || sad) mouth = '<path d="M88 106 Q100 96 112 106" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>';
    else if (think) mouth = '<ellipse cx="104" cy="104" rx="5" ry="4" fill="#7a2b4a" stroke="' + INK + '" stroke-width="3"/>';
    else mouth = '<path d="M86 98 Q93 108 100 99 Q107 108 114 98" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    const eyes = cheer
      ? '<path d="M70 82 l6-10 l6 10 l-10-6 h8z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M118 82 l6-10 l6 10 l-10-6 h8z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>'
      : '<g class="eyes"><g ' + pup + '><ellipse cx="78" cy="82" rx="8" ry="' + (sad ? 9 : 11) + '" fill="' + INK + '"/><circle cx="75" cy="77" r="3.2" fill="#fff"/><ellipse cx="122" cy="82" rx="8" ry="' + (sad ? 9 : 11) + '" fill="' + INK + '"/><circle cx="119" cy="77" r="3.2" fill="#fff"/></g></g>';
    const brows = think ? '<path d="M66 66 q12-8 24 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' : (oops || sad) ? '<path d="M66 74 l22 -7 M134 74 l-22 -7" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' : '';
    const armL = cheer ? '<path d="M52 150 Q30 120 34 98" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M52 150 Q30 120 34 98" fill="none" stroke="#f4f7ff" stroke-width="8" stroke-linecap="round"/><circle cx="34" cy="96" r="8" fill="#ffb15c" stroke="' + INK + '" stroke-width="3"/>'
      : '<ellipse cx="50" cy="160" rx="11" ry="17" fill="#f4f7ff" stroke="' + INK + '" stroke-width="3.5" transform="rotate(14 50 160)"/><circle cx="46" cy="174" r="7" fill="#ffb15c" stroke="' + INK + '" stroke-width="3"/>';
    const armR = cheer ? '<path d="M148 150 Q170 120 166 98" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M148 150 Q170 120 166 98" fill="none" stroke="#f4f7ff" stroke-width="8" stroke-linecap="round"/><circle cx="166" cy="96" r="8" fill="#ffb15c" stroke="' + INK + '" stroke-width="3"/>'
      : (talk ? '<ellipse cx="156" cy="152" rx="11" ry="17" fill="#f4f7ff" stroke="' + INK + '" stroke-width="3.5" transform="rotate(-38 156 152)"/><circle cx="168" cy="140" r="7" fill="#ffb15c" stroke="' + INK + '" stroke-width="3"/>'
        : '<ellipse cx="150" cy="160" rx="11" ry="17" fill="#f4f7ff" stroke="' + INK + '" stroke-width="3.5" transform="rotate(-14 150 160)"/><circle cx="154" cy="174" r="7" fill="#ffb15c" stroke="' + INK + '" stroke-width="3"/>');
    const extra = oops ? '<path d="M150 46 q-7 12 0 17 q7-5 0-17z" fill="#6fd0ff" stroke="' + INK + '" stroke-width="2.5"/>' : '';
    const spark = cheer ? '<path d="M20 60 l4 9 9 4 -9 4 -4 9 -4-9 -9-4 9-4z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2"/><path d="M178 50 l3 7 7 3 -7 3 -3 7 -3-7 -7-3 7-3z" fill="#ff7eb6" stroke="' + INK + '" stroke-width="2"/>' : '';
    return svg('0 0 200 230',
      '<g class="b-body">' +
      /* กระเป๋าหลัง */ '<rect x="34" y="118" width="132" height="84" rx="22" fill="#9b8cff" stroke="' + INK + '" stroke-width="4"/>' +
      /* ขา+รองเท้า */ '<rect x="70" y="192" width="24" height="24" rx="10" fill="#4fe3c1" stroke="' + INK + '" stroke-width="4"/><rect x="106" y="192" width="24" height="24" rx="10" fill="#4fe3c1" stroke="' + INK + '" stroke-width="4"/>' +
      /* ตัวชุด */ '<path d="M56 130 Q100 118 144 130 L152 196 Q100 212 48 196 Z" fill="#f4f7ff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<rect x="78" y="146" width="44" height="30" rx="9" fill="#ffd9ec" stroke="' + INK + '" stroke-width="3"/><circle cx="90" cy="161" r="4.5" fill="#ff5d9a"/><circle cx="104" cy="161" r="4.5" fill="#4fe3c1"/><circle cx="115" cy="161" r="3.2" fill="#ffd23f"/>' +
      armL + armR +
      /* หู */ '<path d="M58 54 L50 14 L90 34 Z" fill="#ffb15c" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M142 54 L150 14 L110 34 Z" fill="#ffb15c" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M58 42 L56 26 L72 34Z" fill="#ff8fa8"/><path d="M142 42 L144 26 L128 34Z" fill="#ff8fa8"/>' +
      /* หัว */ '<circle cx="100" cy="86" r="56" fill="#ffb15c" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M100 36 q-9 12 0 22 q9-10 0-22z" fill="#e8893a" opacity=".55"/>' +
      '<circle cx="66" cy="100" r="9" fill="#ff8fa8" opacity=".65"/><circle cx="134" cy="100" r="9" fill="#ff8fa8" opacity=".65"/>' +
      '<path d="M94 92 l6 7 l6-7 z" fill="#ff6b8e" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M56 94 l-14-4 M56 100 l-15 3 M144 94 l14-4 M144 100 l15 3" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
      eyes + brows + mouth +
      /* หมวกแก้ว */ '<circle cx="100" cy="86" r="64" fill="#bfe9ff" fill-opacity=".28" stroke="#fff" stroke-width="7"/><circle cx="100" cy="86" r="64" fill="none" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<path d="M58 56 Q72 36 96 31" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/>' +
      '<rect x="78" y="144" width="44" height="9" rx="4.5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      extra + spark + '</g>', 'art-bobo');
  }

  /* ═══ บลิ๊บ ═══ */
  function blip(mood) {
    mood = mood || 'sneaky';
    const laugh = mood === 'laugh', shock = mood === 'shock', sad = mood === 'sad', nice = mood === 'nice';
    let eyes;
    if (laugh) eyes = '<path d="M64 74 q10-12 20 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/><path d="M116 74 q10-12 20 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/><path d="M62 84 q-4 8 0 14 M138 84 q4 8 0 14" fill="none" stroke="#6fd0ff" stroke-width="4" stroke-linecap="round"/>';
    else {
      const px = shock ? 0 : sad ? 0 : 4, py = sad ? 4 : 0, r = shock ? 6.5 : 8;
      eyes = '<g class="eyes"><circle cx="74" cy="72" r="' + (shock ? 17 : 15) + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="126" cy="72" r="' + (shock ? 17 : 15) + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="' + (74 + px) + '" cy="' + (74 + py) + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + (126 + px) + '" cy="' + (74 + py) + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + (71 + px) + '" cy="' + (70 + py) + '" r="2.8" fill="#fff"/><circle cx="' + (123 + px) + '" cy="' + (70 + py) + '" r="2.8" fill="#fff"/></g>';
      if (!shock && !nice && !sad) eyes += '<path d="M56 52 l32 10 M144 52 l-32 10" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      if (sad) eyes += '<path d="M58 58 l30-6 M142 58 l-30-6" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
    }
    let mouth;
    if (laugh) mouth = '<path d="M66 100 Q100 150 134 100 Z" fill="#5a1a52" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M80 112 Q100 128 120 112 Q100 108 80 112Z" fill="#ff7eb6"/><path d="M92 102 l4 10 l4-10z M104 102 l4 10 l4-10z" fill="#fff"/>';
    else if (shock) mouth = '<ellipse cx="100" cy="118" rx="12" ry="15" fill="#5a1a52" stroke="' + INK + '" stroke-width="4"/>';
    else if (sad) mouth = '<path d="M80 124 Q100 106 120 124" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    else if (nice) mouth = '<path d="M80 108 Q100 128 120 108" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    else mouth = '<path d="M72 104 Q100 134 132 100 Q100 116 72 104Z" fill="#5a1a52" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M92 112 l5 9 l5-9z" fill="#fff"/>';
    const hearts = nice ? '<path d="M38 40 q-9-9 -2-16 q6-5 10 3 q4-8 10-3 q7 7 -2 16 l-8 8z" fill="#ff7eb6" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' : '';
    const cheeks = nice ? '<circle cx="58" cy="100" r="9" fill="#ff7eb6" opacity=".7"/><circle cx="142" cy="100" r="9" fill="#ff7eb6" opacity=".7"/>' : '';
    return svg('0 0 200 200',
      '<g class="p-body">' +
      /* หนวด */ '<path d="M70 38 Q60 14 44 10" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="9" r="8" fill="#ff7eb6" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<path d="M130 38 Q142 14 158 10" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="160" cy="9" r="8" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.5"/>' +
      /* จานบิน */ '<ellipse cx="100" cy="152" rx="82" ry="26" fill="#8fa3d8" stroke="' + INK + '" stroke-width="4.5"/><ellipse cx="100" cy="146" rx="62" ry="14" fill="#b7c6ee"/>' +
      '<circle cx="48" cy="156" r="6" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5"/><circle cx="100" cy="166" r="6" fill="#ff7eb6" stroke="' + INK + '" stroke-width="2.5"/><circle cx="152" cy="156" r="6" fill="#4fe3c1" stroke="' + INK + '" stroke-width="2.5"/>' +
      /* ตัวเมือก */ '<path d="M34 134 Q28 70 60 46 Q100 18 140 46 Q172 70 166 134 Q100 152 34 134Z" fill="#7be86b" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M54 60 Q72 40 96 38" fill="none" stroke="#c9ffbf" stroke-width="6" stroke-linecap="round" opacity=".85"/>' +
      '<circle cx="146" cy="108" r="5" fill="#5dc84f" opacity=".7"/><circle cx="52" cy="116" r="4" fill="#5dc84f" opacity=".7"/>' +
      cheeks + eyes + mouth + hearts + '</g>', 'art-blip');
  }

  /* ═══ จรวด ═══ */
  function rocket() {
    return svg('0 0 60 110',
      '<g class="r-flame"><path d="M22 84 Q30 118 38 84 Z" fill="#ff8a3d" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M26 84 Q30 104 34 84 Z" fill="#ffd23f"/></g>' +
      '<path d="M10 70 L2 92 L22 82 Z" fill="#ff6b6b" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 70 L58 92 L38 82 Z" fill="#ff6b6b" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M30 4 Q52 28 48 80 L12 80 Q8 28 30 4Z" fill="#f4f7ff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M30 4 Q42 18 45 34 L15 34 Q18 18 30 4Z" fill="#ff6b6b" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<circle cx="30" cy="52" r="10" fill="#6fd0ff" stroke="' + INK + '" stroke-width="3.5"/><path d="M25 49 q3-5 8-3" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>', 'art-rocket');
  }

  /* ═══ ดาวเคราะห์ประจำวัน (สร้างจาก seed ของวัน) ═══ */
  const NAMES = ['มะลิ', 'ส้มโอ', 'ลำไย', 'ชมพู่', 'องุ่น', 'มะม่วง', 'ทับทิม', 'เสาวรส', 'น้ำผึ้ง', 'ลูกพีช', 'ขนมปัง', 'ไอศกรีม', 'พุดซ้อน', 'ทานตะวัน', 'กุหลาบ', 'ลาเวนเดอร์', 'มินต์', 'ลูกอม', 'คัสตาร์ด', 'บลูเบอร์รี', 'มันม่วง', 'ฟักทอง', 'ข้าวโพด', 'ชาไทย', 'นมสด', 'ส้มจี๊ด', 'แตงโม', 'มะพร้าว', 'ข้าวเหนียว', 'โกโก้', 'ดอกจาน'];
  const PAL = [['#ff9a62', '#ffcf6b'], ['#7ad7f0', '#b6f0ff'], ['#c79bff', '#f0d4ff'], ['#7be86b', '#d1ffb8'], ['#ff7eb6', '#ffd1e8'], ['#ffd23f', '#fff0a8'], ['#5cc8ff', '#c7ecff'], ['#ff6b6b', '#ffc2b8']];
  function planetName(seed) { return 'ดาว' + NAMES[Math.abs(seed | 0) % NAMES.length]; }
  function planet(seed, opt) {
    opt = opt || {};
    const R = new DC.Rng('planet:' + seed);
    const [c1, c2] = PAL[R.int(0, PAL.length - 1)];
    const kind = R.int(0, 4), ring = R.chance(0.45), rid = 'pl' + Math.abs(seed | 0) + (opt.uid || '');
    let body = '';
    if (kind === 0) for (let i = 0; i < 5; i++) body += '<rect x="0" y="' + (14 + i * 17 + R.int(-3, 3)) + '" width="100" height="' + R.int(6, 11) + '" fill="' + c2 + '" opacity=".75"/>';
    else if (kind === 1) for (let i = 0; i < 6; i++) body += '<circle cx="' + R.int(20, 80) + '" cy="' + R.int(20, 80) + '" r="' + R.int(5, 11) + '" fill="' + c2 + '" opacity=".7" stroke="' + c1 + '" stroke-width="2"/>';
    else if (kind === 2) for (let i = 0; i < 3; i++) body += '<path d="M' + R.int(5, 40) + ' ' + R.int(20, 80) + ' q' + R.int(10, 25) + ' -' + R.int(10, 24) + ' ' + R.int(25, 45) + ' ' + R.int(-8, 8) + ' q-' + R.int(5, 15) + ' ' + R.int(14, 26) + ' -' + R.int(30, 40) + ' ' + R.int(6, 14) + 'z" fill="' + c2 + '" opacity=".8"/>';
    else if (kind === 3) body += '<path d="M0 40 Q25 20 50 40 T100 36 L100 56 Q75 76 50 56 T0 60Z" fill="' + c2 + '" opacity=".75"/><circle cx="68" cy="26" r="8" fill="#fff" opacity=".7"/>';
    else for (let i = 0; i < 5; i++) body += '<circle cx="' + R.int(15, 85) + '" cy="' + R.int(15, 85) + '" r="' + R.int(4, 9) + '" fill="#fff" opacity=".55"/>';
    const ringBack = ring ? '<ellipse cx="50" cy="50" rx="68" ry="15" fill="none" stroke="' + INK + '" stroke-width="9" transform="rotate(-18 50 50)" opacity=".95"/><ellipse cx="50" cy="50" rx="68" ry="15" fill="none" stroke="' + c2 + '" stroke-width="5" transform="rotate(-18 50 50)"/>' : '';
    const ringFront = ring ? '<clipPath id="rf' + rid + '"><rect x="-40" y="50" width="180" height="70"/></clipPath><g transform="rotate(-18 50 50)"><g clip-path="url(#rf' + rid + ')"><ellipse cx="50" cy="50" rx="68" ry="15" fill="none" stroke="' + INK + '" stroke-width="9"/><ellipse cx="50" cy="50" rx="68" ry="15" fill="none" stroke="' + c2 + '" stroke-width="5"/></g></g>' : '';
    const moon = R.chance(0.5) ? '<circle cx="' + R.pick([6, 94]) + '" cy="' + R.pick([14, 86]) + '" r="9" fill="#f4f7ff" stroke="' + INK + '" stroke-width="3.5"/>' : '';
    return svg('-22 -8 144 116',
      '<defs><clipPath id="' + rid + '"><circle cx="50" cy="50" r="40"/></clipPath><radialGradient id="g' + rid + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>' +
      '<g class="pl-g">' + (ring ? '<g>' + ringBack + '</g>' : '') +
      '<circle cx="50" cy="50" r="40" fill="' + c1 + '"/><g clip-path="url(#' + rid + ')">' + body + '<rect width="100" height="100" fill="url(#g' + rid + ')"/></g>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' + INK + '" stroke-width="4.5"/>' +
      ringFront + moon + '</g>', 'art-planet');
  }

  /* ═══ ไอคอน UI (เส้น) ═══ */
  const IC = {
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    book: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="9" cy="14.5" r="1.1" fill="currentColor"/><circle cx="13" cy="14.5" r="1.1" fill="currentColor"/><circle cx="17" cy="14.5" r="1.1" fill="currentColor"/>',
    home: '<path d="M3.5 11.5L12 4l8.5 7.5M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/>',
    bulb: '<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5M19.5 4v4.5H15"/>',
    left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    back: '<path d="M21 6H9l-6 6 6 6h12z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/>',
    star: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" fill="currentColor"/>',
    starO: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z"/>',
    lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
    flame: '<path d="M12 2.5c.6 3 3.3 4.7 4.6 7.2 1.5 2.9.6 6.1-1.6 8-2.6 2.3-6.8 1.6-8.1-1.6-1-2.4.1-4.6 1.6-6.4.4 1.2 1 1.8 1.8 2.1-.2-3.6.7-6.4 1.7-9.3z" fill="currentColor"/>',
    rocket: '<path d="M12 3c3.5 2.5 5 6.5 4 11H8c-1-4.5.5-8.5 4-11z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M8 14l-3 3 1 3 3-2M16 14l3 3-1 3-3-2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    undo: '<path d="M8 8H4V4M4 8a8 8 0 1 1-1 5"/>',
    teacher: '<path d="M3 9l9-4.5L21 9l-9 4.5z"/><path d="M7 11.5V16c1.5 2 8.5 2 10 0v-4.5"/>'
  };
  function icon(name, cls) { return svg('0 0 24 24', '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + (IC[name] || '') + '</g>', 'ic ' + (cls || '')); }

  /* ═══ ไอเทมในโจทย์ (นับได้) ═══ */
  const ITEM = {
    star: '<path d="M16 3l3.9 8.2 9 1.2-6.6 6.2 1.7 8.9L16 22.2 8 27.5l1.7-8.9L3.1 12.4l9-1.2z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 12l2-4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    moon: '<path d="M22 4a13 13 0 1 0 6 19A11 11 0 0 1 22 4z" fill="#ffe9a8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="13" cy="20" r="2" fill="#f0cd6c"/><circle cx="17" cy="12" r="1.5" fill="#f0cd6c"/>',
    fuel: '<rect x="7" y="8" width="18" height="20" rx="5" fill="#4fe3c1" stroke="' + INK + '" stroke-width="2.5"/><rect x="12" y="3" width="8" height="6" rx="2" fill="#8fa3d8" stroke="' + INK + '" stroke-width="2.5"/><path d="M17 12l-4 7h4l-2 6 6-9h-4z" fill="#fff" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>',
    crystal: '<path d="M16 3l9 8-9 18L7 11z" fill="#c79bff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M7 11h18M16 3l-4 8 4 18 4-18z" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 11l4-6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    cookie: '<circle cx="16" cy="16" r="13" fill="#e8a958" stroke="' + INK + '" stroke-width="2.5"/><circle cx="11" cy="12" r="2.2" fill="#6b3d1e"/><circle cx="20" cy="11" r="2" fill="#6b3d1e"/><circle cx="21" cy="20" r="2.4" fill="#6b3d1e"/><circle cx="12" cy="21" r="2" fill="#6b3d1e"/><circle cx="16" cy="16" r="1.6" fill="#6b3d1e"/>'
  };
  function item(name, cls) { return svg('0 0 32 32', ITEM[name] || ITEM.star, 'item ' + (cls || '')); }

  /* ═══ เพื่อนตัวกลม (แบ่งของ) ═══ */
  const FCOL = ['#ff7eb6', '#5cc8ff', '#ffd23f', '#4fe3c1', '#c79bff', '#ff9a62'];
  function friend(i) {
    const c = FCOL[i % FCOL.length];
    return svg('0 0 80 90',
      '<ellipse cx="40" cy="82" rx="22" ry="5" fill="#000" opacity=".18"/>' +
      '<path d="M10 52 Q8 14 40 12 Q72 14 70 52 Q70 80 40 80 Q10 80 10 52Z" fill="' + c + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M22 28 Q30 18 40 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
      '<circle cx="30" cy="44" r="5.5" fill="' + INK + '"/><circle cx="50" cy="44" r="5.5" fill="' + INK + '"/><circle cx="28.5" cy="42" r="1.8" fill="#fff"/><circle cx="48.5" cy="42" r="1.8" fill="#fff"/>' +
      '<path d="M32 58 Q40 68 48 58" fill="#7a2b4a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M18 22 L14 8 M62 22 L66 8" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="14" cy="7" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="66" cy="7" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>', 'friend');
  }

  /* ═══ เหรียญ/ธนบัตร ═══ */
  function coin(v) { return svg('0 0 40 40', '<circle cx="20" cy="20" r="17" fill="#ffd23f" stroke="' + INK + '" stroke-width="3.5"/><circle cx="20" cy="20" r="12" fill="none" stroke="#e8a900" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="' + INK + '" font-family="Baloo 2, sans-serif">' + v + '</text>', 'coin'); }
  function note(v) { return svg('0 0 120 64', '<rect x="3" y="3" width="114" height="58" rx="9" fill="#bff0c8" stroke="' + INK + '" stroke-width="4"/><rect x="12" y="11" width="96" height="42" rx="6" fill="none" stroke="#5fb36f" stroke-width="2.5" stroke-dasharray="5 4"/><circle cx="32" cy="32" r="12" fill="#8be0a0" stroke="' + INK + '" stroke-width="3"/><text x="84" y="40" text-anchor="middle" font-size="26" font-weight="800" fill="' + INK + '" font-family="Baloo 2, sans-serif">' + v + '</text>', 'note'); }

  /* สติกเกอร์ดาวเล็ก (ใช้กับดาวผลลัพธ์) */
  function starShape(on) { return svg('0 0 24 24', '<path d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4-5.7-3.1-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.9z" fill="' + (on ? '#ffd23f' : '#5b4f94') + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>', 'starsh'); }

  DC.art = { svg, bobo, blip, rocket, planet, planetName, icon, item, friend, coin, note, starShape, INK, ICONS_LIST: Object.keys(IC) };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
