/* ==========================================================================
   SHAPE DETECTIVE — Shape knowledge base, geometry & SVG character art
   ========================================================================== */
(function () {
  'use strict';

  // ---- Knowledge base: every learning statement comes from here ----------
  const SHAPES = {
    triangle:  { th: 'รูปสามเหลี่ยม', short: 'สามเหลี่ยม', sides: 3, corners: 3, curved: false, group: 'polygon', color: '#ff8a65' },
    square:    { th: 'รูปสี่เหลี่ยม', short: 'สี่เหลี่ยม', sub: 'สี่เหลี่ยมจัตุรัส', sides: 4, corners: 4, curved: false, group: 'polygon', color: '#4fc3f7' },
    rectangle: { th: 'รูปสี่เหลี่ยม', short: 'สี่เหลี่ยม', sub: 'สี่เหลี่ยมผืนผ้า', sides: 4, corners: 4, curved: false, group: 'polygon', color: '#4fc3f7' },
    pentagon:  { th: 'รูปห้าเหลี่ยม', short: 'ห้าเหลี่ยม', sides: 5, corners: 5, curved: false, group: 'polygon', color: '#ba68c8' },
    hexagon:   { th: 'รูปหกเหลี่ยม', short: 'หกเหลี่ยม', sides: 6, corners: 6, curved: false, group: 'polygon', color: '#ffd54f' },
    circle:    { th: 'รูปวงกลม', short: 'วงกลม', sides: 0, corners: 0, curved: true, round: true, group: 'circle', color: '#81c784' },
    ellipse:   { th: 'รูปวงรี', short: 'วงรี', sides: 0, corners: 0, curved: true, round: false, group: 'ellipse', color: '#f06292' }
  };

  const GROUPS = {
    polygon: { th: 'รูปหลายเหลี่ยม', desc: 'มีเส้นตรงล้อมรอบ มีด้านและมุม' },
    circle:  { th: 'รูปวงกลม', desc: 'เส้นโค้งปิด ไม่มีมุม กลมเท่ากันทุกทาง' },
    ellipse: { th: 'รูปวงรี', desc: 'เส้นโค้งปิด ไม่มีมุม ยาวไม่เท่ากัน' }
  };

  function describe(type) {
    const s = SHAPES[type];
    if (!s) return '';
    if (s.curved) {
      return s.round
        ? 'ไม่มีด้านตรง ไม่มีมุม เป็นเส้นโค้งปิด และกว้างเท่ากับสูง'
        : 'ไม่มีด้านตรง ไม่มีมุม เป็นเส้นโค้งปิด แต่ยาวกับกว้างไม่เท่ากัน';
    }
    return `มีเส้นตรง ${s.sides} ด้าน และมี ${s.corners} มุม`;
  }

  // ---- Geometry -----------------------------------------------------------
  function rotPt(x, y, deg) {
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [x * c - y * s, x * s + y * c];
  }

  /** returns local vertices (centered at 0,0) for polygon types */
  function localPoints(type, w, h) {
    switch (type) {
      case 'triangle': return [[0, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
      case 'square':
      case 'rectangle': return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
      case 'pentagon':
      case 'hexagon': {
        const n = type === 'pentagon' ? 5 : 6, pts = [];
        const start = type === 'pentagon' ? -Math.PI / 2 : 0;
        for (let i = 0; i < n; i++) {
          const a = start + i * 2 * Math.PI / n;
          pts.push([Math.cos(a) * w / 2, Math.sin(a) * h / 2]);
        }
        return pts;
      }
      default: return null;
    }
  }

  function worldPoints(o) {
    const lp = localPoints(o.shape, o.w, o.h);
    if (!lp) return null;
    return lp.map(([x, y]) => {
      const [rx, ry] = rotPt(x, y, o.rot || 0);
      return [o.x + rx, o.y + ry];
    });
  }

  /** SVG element string for a shape object {shape,x,y,w,h,rot,fill} */
  function shapeEl(o, attrs) {
    attrs = attrs || '';
    const fill = o.fill || SHAPES[o.shape].color;
    const stroke = o.stroke || '#3b2a20';
    const sw = o.sw != null ? o.sw : 4;
    const base = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${attrs}`;
    if (o.shape === 'circle') {
      return `<circle cx="${o.x}" cy="${o.y}" r="${o.w / 2}" ${base}/>`;
    }
    if (o.shape === 'ellipse') {
      return `<ellipse cx="${o.x}" cy="${o.y}" rx="${o.w / 2}" ry="${o.h / 2}" transform="rotate(${o.rot || 0} ${o.x} ${o.y})" ${base}/>`;
    }
    const pts = worldPoints(o).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    return `<polygon points="${pts}" ${base}/>`;
  }

  /** standalone svg icon of a shape */
  function shapeIcon(type, size, fill, rot) {
    size = size || 60;
    const w = type === 'rectangle' ? 84 : type === 'ellipse' ? 88 : 70;
    const h = type === 'rectangle' ? 52 : type === 'ellipse' ? 54 : 70;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${shapeEl({ shape: type, x: 50, y: 52, w, h, rot: rot || 0, fill: fill || SHAPES[type].color, sw: 4 })}</svg>`;
  }

  // ---- Characters (built from shapes on purpose: the world teaches) -------
  function owlSVG(mood) {
    const mouth = mood === 'happy' ? '<path d="M88 104 Q100 116 112 104" fill="none" stroke="#3b2a20" stroke-width="4" stroke-linecap="round"/>'
      : mood === 'think' ? '<path d="M90 108 L110 106" stroke="#3b2a20" stroke-width="4" stroke-linecap="round"/>' : '';
    const pupil = mood === 'think' ? 4 : 0;
    return `<svg viewBox="0 0 200 220" class="owl-svg">
      <ellipse cx="100" cy="135" rx="70" ry="78" fill="#a1887f" stroke="#3b2a20" stroke-width="5"/>
      <ellipse cx="100" cy="150" rx="44" ry="52" fill="#efebe9" stroke="#3b2a20" stroke-width="4"/>
      <polygon points="40,70 58,30 78,64" fill="#8d6e63" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="160,70 142,30 122,64" fill="#8d6e63" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="72" cy="86" r="26" fill="#fff" stroke="#3b2a20" stroke-width="5"/>
      <circle cx="128" cy="86" r="26" fill="#fff" stroke="#3b2a20" stroke-width="5"/>
      <circle cx="${74 + pupil}" cy="${88 - pupil}" r="11" fill="#3b2a20"/>
      <circle cx="${130 + pupil}" cy="${88 - pupil}" r="11" fill="#3b2a20"/>
      <circle cx="${78 + pupil}" cy="${84 - pupil}" r="4" fill="#fff"/>
      <circle cx="${134 + pupil}" cy="${84 - pupil}" r="4" fill="#fff"/>
      <circle cx="128" cy="86" r="33" fill="none" stroke="#c9a227" stroke-width="5"/>
      <polygon points="92,104 108,104 100,120" fill="#ffb300" stroke="#3b2a20" stroke-width="4" stroke-linejoin="round"/>
      ${mouth}
      <polygon points="66,26 134,26 124,6 76,6" fill="#5d4037" stroke="#3b2a20" stroke-width="4" stroke-linejoin="round"/>
      <rect x="54" y="24" width="92" height="12" rx="6" fill="#4e342e" stroke="#3b2a20" stroke-width="4"/>
      <ellipse cx="70" cy="210" rx="16" ry="7" fill="#ffb300" stroke="#3b2a20" stroke-width="3"/>
      <ellipse cx="130" cy="210" rx="16" ry="7" fill="#ffb300" stroke="#3b2a20" stroke-width="3"/>
    </svg>`;
  }

  function detectiveSVG(pose) {
    const arm = pose === 'cheer'
      ? '<rect x="128" y="96" width="16" height="50" rx="8" transform="rotate(-35 136 120)" fill="#ffcc80" stroke="#3b2a20" stroke-width="4"/>'
      : '<rect x="130" y="120" width="16" height="44" rx="8" transform="rotate(-60 138 142)" fill="#ffcc80" stroke="#3b2a20" stroke-width="4"/>';
    return `<svg viewBox="0 0 200 260" class="det-svg">
      <rect x="62" y="130" width="76" height="90" rx="20" fill="#c69c6d" stroke="#3b2a20" stroke-width="5"/>
      <polygon points="100,132 80,180 120,180" fill="#8d5b3a" stroke="#3b2a20" stroke-width="4" stroke-linejoin="round"/>
      <rect x="72" y="214" width="20" height="34" rx="8" fill="#5d4037" stroke="#3b2a20" stroke-width="4"/>
      <rect x="108" y="214" width="20" height="34" rx="8" fill="#5d4037" stroke="#3b2a20" stroke-width="4"/>
      <rect x="52" y="136" width="16" height="50" rx="8" fill="#ffcc80" stroke="#3b2a20" stroke-width="4"/>
      ${arm}
      <circle cx="100" cy="88" r="46" fill="#ffd8a8" stroke="#3b2a20" stroke-width="5"/>
      <circle cx="84" cy="90" r="7" fill="#3b2a20"/><circle cx="116" cy="90" r="7" fill="#3b2a20"/>
      <circle cx="86" cy="87" r="2.5" fill="#fff"/><circle cx="118" cy="87" r="2.5" fill="#fff"/>
      <ellipse cx="72" cy="106" rx="8" ry="5" fill="#ff8a80" opacity=".6"/><ellipse cx="128" cy="106" rx="8" ry="5" fill="#ff8a80" opacity=".6"/>
      <path d="M88 112 Q100 124 112 112" fill="none" stroke="#3b2a20" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="100" cy="52" rx="56" ry="14" fill="#a1764a" stroke="#3b2a20" stroke-width="5"/>
      <path d="M58 52 Q60 10 100 8 Q140 10 142 52 Z" fill="#c08a55" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/>
      <rect x="60" y="40" width="80" height="10" fill="#7a4e2d"/>
      <g transform="translate(150 132)">
        <rect x="-4" y="14" width="10" height="34" rx="4" transform="rotate(-30)" fill="#6d4c41" stroke="#3b2a20" stroke-width="3"/>
        <circle cx="0" cy="0" r="20" fill="#bbdefb" fill-opacity=".7" stroke="#c9a227" stroke-width="6"/>
      </g>
    </svg>`;
  }

  function scribbleSVG(mood) {
    const eyes = mood === 'sorry'
      ? '<path d="M70 92 Q80 84 90 92" fill="none" stroke="#fff" stroke-width="5"/><path d="M110 92 Q120 84 130 92" fill="none" stroke="#fff" stroke-width="5"/>'
      : '<circle cx="80" cy="92" r="11" fill="#fff"/><circle cx="120" cy="92" r="11" fill="#fff"/><circle cx="83" cy="94" r="5" fill="#222"/><circle cx="123" cy="94" r="5" fill="#222"/>';
    return `<svg viewBox="0 0 200 200" class="scribble-svg">
      <path d="M40 120 C20 60 70 20 110 40 C160 20 190 80 160 120 C190 160 130 190 100 170 C60 195 10 160 40 120 Z" fill="#5c6bc0" stroke="#283593" stroke-width="6"/>
      <path d="M50 70 C70 60 80 80 95 65 C110 50 130 75 150 60" fill="none" stroke="#9fa8da" stroke-width="5" stroke-linecap="round"/>
      <path d="M45 150 C70 140 90 160 110 145 C130 132 150 152 165 140" fill="none" stroke="#9fa8da" stroke-width="5" stroke-linecap="round"/>
      ${eyes}
      <path d="${mood === 'sorry' ? 'M88 128 Q100 120 112 128' : 'M85 122 Q100 136 118 120'}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  /** cute suspect = a shape with eyes */
  function suspectSVG(type, fill) {
    const w = type === 'rectangle' ? 120 : type === 'ellipse' ? 130 : 110;
    const h = type === 'ellipse' ? 84 : type === 'rectangle' ? 84 : 110;
    return `<svg viewBox="0 0 160 160">
      ${shapeEl({ shape: type, x: 80, y: 86, w, h, fill: fill || SHAPES[type].color, sw: 5 })}
      <circle cx="66" cy="${type === 'triangle' ? 104 : 84}" r="9" fill="#fff" stroke="#3b2a20" stroke-width="3"/>
      <circle cx="94" cy="${type === 'triangle' ? 104 : 84}" r="9" fill="#fff" stroke="#3b2a20" stroke-width="3"/>
      <circle cx="68" cy="${type === 'triangle' ? 106 : 86}" r="4" fill="#3b2a20"/>
      <circle cx="96" cy="${type === 'triangle' ? 106 : 86}" r="4" fill="#3b2a20"/>
      <rect x="54" y="${type === 'triangle' ? 90 : 70}" width="52" height="8" rx="4" fill="#3b2a20" opacity=".8"/>
    </svg>`;
  }

  window.SD = window.SD || {};
  Object.assign(window.SD, {
    SHAPES, GROUPS, describe, rotPt, localPoints, worldPoints, shapeEl, shapeIcon,
    owlSVG, detectiveSVG, scribbleSVG, suspectSVG
  });
})();
