/* ==========================================================================
   SHAPE DETECTIVE — Shape Town district scenes (viewBox 1600 x 900)
   Every interactive object is a real geometric shape → the world is the lesson
   ========================================================================== */
(function () {
  'use strict';

  // O(shape, x, y, w, h, fill, label, extra)
  function O(shape, x, y, w, h, fill, label, extra) {
    return Object.assign({ shape, x, y, w, h: shape === 'circle' || shape === 'square' ? w : h, fill, label }, extra || {});
  }

  const cloud = (x, y, s) => `<g opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${28 * s}" fill="#fff"/><ellipse cx="${x - 40 * s}" cy="${y + 6 * s}" rx="${40 * s}" ry="${20 * s}" fill="#fff"/><ellipse cx="${x + 45 * s}" cy="${y + 8 * s}" rx="${38 * s}" ry="${18 * s}" fill="#fff"/></g>`;
  const sky = (a, b) => `<defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#skyg)"/>`;
  const grassTufts = (y, color) => { let s = ''; for (let i = 0; i < 26; i++) { const x = 30 + i * 62 + (i % 3) * 9; s += `<path d="M${x} ${y + (i % 4) * 40} l6 -16 l6 16 l6 -12 l4 12" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`; } return s; };

  const SCENES = {
    /* ---------------- 1. Shape Town Square ---------------- */
    square: {
      bg: () => sky('#a8e0ff', '#fff3d6') + cloud(250, 260, 1) + cloud(1350, 230, .8) +
        `<rect y="640" width="1600" height="260" fill="#f1d39b"/>
         <ellipse cx="800" cy="770" rx="620" ry="110" fill="#e9c27f" stroke="#d9ac63" stroke-width="4"/>
         <rect x="555" y="300" width="10" height="350" fill="#6d4c41"/>
         <rect x="1004" y="560" width="12" height="90" fill="#6d4c41"/>
         <rect x="1166" y="620" width="28" height="70" fill="#b0bec5" stroke="#3b2a20" stroke-width="3"/>
         <line x1="1180" y1="260" x2="1120" y2="640" stroke="#5d4037" stroke-width="2" stroke-dasharray="6 6"/>
         <line x1="800" y1="370" x2="800" y2="335" stroke="#3b2a20" stroke-width="6" stroke-linecap="round"/>
         <line x1="800" y1="370" x2="825" y2="380" stroke="#3b2a20" stroke-width="6" stroke-linecap="round"/>`,
      objects: [
        O('rectangle', 250, 560, 240, 180, '#ffab91', 'ตัวบ้าน'),
        O('triangle', 250, 405, 290, 130, '#e57373', 'หลังคาบ้าน'),
        O('square', 195, 545, 60, 0, '#fff59d', 'หน้าต่างบ้าน'),
        O('rectangle', 300, 600, 60, 100, '#8d6e63', 'ประตูบ้าน'),
        O('triangle', 600, 345, 80, 80, '#ff7043', 'ธงสามเหลี่ยม', { rot: 90 }),
        O('rectangle', 800, 470, 170, 360, '#ffe082', 'ตัวหอนาฬิกา'),
        O('triangle', 800, 220, 210, 140, '#7986cb', 'หลังคาหอนาฬิกา'),
        O('circle', 800, 370, 110, 0, '#ffffff', 'หน้าปัดนาฬิกา'),
        O('rectangle', 800, 600, 64, 100, '#a1887f', 'ประตูหอนาฬิกา'),
        O('pentagon', 1010, 515, 100, 95, '#ce93d8', 'ป้ายบอกทาง'),
        O('ellipse', 1180, 695, 280, 80, '#80deea', 'อ่างน้ำพุ'),
        O('circle', 1180, 585, 60, 0, '#4dd0e1', 'ลูกแก้วน้ำพุ'),
        O('circle', 1420, 430, 200, 0, '#66bb6a', 'พุ่มไม้'),
        O('rectangle', 1420, 600, 44, 140, '#8d6e63', 'ลำต้นไม้'),
        O('square', 1180, 230, 80, 0, '#ff8a65', 'ว่าว', { rot: 45 }),
        O('circle', 1010, 140, 90, 0, '#ffd54f', 'ดวงอาทิตย์'),
        O('hexagon', 560, 770, 100, 84, '#ffd54f', 'แผ่นทางเดินหกเหลี่ยม'),
        O('ellipse', 640, 230, 150, 54, '#ffffff', 'ก้อนเมฆ'),
        O('hexagon', 1488, 700, 30, 26, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 2. Shape Market ---------------- */
    market: {
      bg: () => sky('#ffe0b2', '#fff8e1') + cloud(1100, 150, .8) +
        `<rect y="650" width="1600" height="250" fill="#e6c08f"/>
         <path d="M0 160 Q400 220 800 160 T1600 160" fill="none" stroke="#795548" stroke-width="3"/>
         ${[100, 200, 300, 500, 600, 700, 900, 1000, 1100, 1300, 1400, 1500].map((x, i) => `<polygon points="${x - 22},${168 + Math.sin(x / 255) * 25} ${x + 22},${168 + Math.sin(x / 255) * 25} ${x},${205 + Math.sin(x / 255) * 25}" fill="${['#ef5350', '#ffca28', '#42a5f5', '#66bb6a'][i % 4]}"/>`).join('')}
         <rect x="176" y="330" width="10" height="320" fill="#6d4c41"/><rect x="474" y="330" width="10" height="320" fill="#6d4c41"/>
         <rect x="1084" y="360" width="10" height="290" fill="#6d4c41"/><rect x="1406" y="360" width="10" height="290" fill="#6d4c41"/>
         <path d="M1000 290 L1000 360" stroke="#5d4037" stroke-width="2"/><path d="M800 300 L800 370" stroke="#5d4037" stroke-width="2"/>
         <ellipse cx="440" cy="560" rx="54" ry="24" fill="#a1887f" stroke="#3b2a20" stroke-width="3"/>`,
      objects: [
        O('rectangle', 330, 610, 320, 90, '#a1887f', 'โต๊ะขายผลไม้'),
        O('triangle', 230, 350, 100, 80, '#ef5350', 'ผ้าใบกันแดด', { rot: 180 }),
        O('triangle', 330, 350, 100, 80, '#fffde7', 'ผ้าใบกันแดด', { rot: 180 }),
        O('triangle', 430, 350, 100, 80, '#ef5350', 'ผ้าใบกันแดด', { rot: 180 }),
        O('circle', 245, 540, 54, 0, '#ffa726', 'ส้ม'),
        O('circle', 305, 540, 54, 0, '#ffa726', 'ส้ม'),
        O('circle', 365, 540, 54, 0, '#ffa726', 'ส้ม'),
        O('ellipse', 425, 535, 34, 48, '#fff8e1', 'ไข่ไก่'),
        O('ellipse', 458, 535, 34, 48, '#fff8e1', 'ไข่ไก่'),
        O('ellipse', 640, 600, 130, 80, '#9ccc65', 'แตงไทย'),
        O('rectangle', 800, 250, 320, 80, '#ffcc80', 'ป้ายตลาด'),
        O('pentagon', 800, 410, 90, 86, '#ce93d8', 'ป้ายราคา'),
        O('ellipse', 800, 560, 170, 60, '#ffffff', 'จานรูปไข่'),
        O('triangle', 700, 690, 110, 90, '#ffe082', 'ชีสสามเหลี่ยม'),
        O('circle', 910, 700, 50, 0, '#ffd54f', 'เหรียญ'),
        O('ellipse', 1000, 245, 64, 86, '#f48fb1', 'ลูกโป่ง'),
        O('rectangle', 1250, 330, 360, 70, '#4fc3f7', 'หลังคาร้าน'),
        O('rectangle', 1250, 610, 330, 90, '#bcaaa4', 'โต๊ะขายของ'),
        O('square', 1160, 520, 90, 0, '#d7a86e', 'ลังผลไม้'),
        O('square', 1262, 520, 90, 0, '#d7a86e', 'ลังผลไม้'),
        O('hexagon', 1370, 515, 86, 76, '#ffca28', 'ป้ายน้ำผึ้ง'),
        O('pentagon', 1108, 622, 26, 26, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 3. Shape Station ---------------- */
    station: {
      bg: () => sky('#b3e5fc', '#e1f5fe') + cloud(820, 150, 1) + cloud(1400, 210, .7) +
        `<rect y="610" width="1600" height="290" fill="#b0bec5"/>
         <rect y="690" width="1600" height="16" fill="#6d4c41"/><rect y="730" width="1600" height="16" fill="#6d4c41"/>
         ${Array.from({ length: 33 }, (_, i) => `<rect x="${i * 50}" y="684" width="18" height="70" fill="#8d6e63"/>`).join('')}
         <rect x="694" y="470" width="12" height="190" fill="#6d4c41"/><rect x="1414" y="565" width="12" height="100" fill="#6d4c41"/>
         <line x1="380" y1="380" x2="380" y2="352" stroke="#3b2a20" stroke-width="5" stroke-linecap="round"/><line x1="380" y1="380" x2="398" y2="388" stroke="#3b2a20" stroke-width="5" stroke-linecap="round"/>`,
      objects: [
        O('rectangle', 380, 455, 420, 300, '#ffcc80', 'อาคารสถานี'),
        O('triangle', 380, 240, 460, 130, '#8d6e63', 'หลังคาสถานี'),
        O('circle', 380, 380, 90, 0, '#ffffff', 'นาฬิกาสถานี'),
        O('rectangle', 380, 535, 90, 140, '#6d4c41', 'ประตูสถานี'),
        O('square', 260, 440, 70, 0, '#b3e5fc', 'หน้าต่างสถานี'),
        O('square', 500, 440, 70, 0, '#b3e5fc', 'หน้าต่างสถานี'),
        O('hexagon', 700, 430, 90, 80, '#e53935', 'ป้ายหยุด'),
        O('rectangle', 1050, 560, 340, 150, '#ef5350', 'ตัวรถไฟ'),
        O('rectangle', 1170, 430, 110, 110, '#e57373', 'ห้องคนขับ'),
        O('rectangle', 930, 450, 40, 70, '#5d4037', 'ปล่องควัน'),
        O('square', 1000, 545, 60, 0, '#fff59d', 'หน้าต่างรถไฟ'),
        O('square', 1100, 545, 60, 0, '#fff59d', 'หน้าต่างรถไฟ'),
        O('circle', 940, 655, 74, 0, '#424242', 'ล้อรถไฟ'),
        O('circle', 1050, 655, 74, 0, '#424242', 'ล้อรถไฟ'),
        O('circle', 1160, 655, 74, 0, '#424242', 'ล้อรถไฟ'),
        O('triangle', 1250, 600, 70, 60, '#ffb300', 'กันชนหน้ารถ', { rot: 90 }),
        O('ellipse', 930, 370, 70, 44, '#eceff1', 'ควัน'),
        O('triangle', 1420, 520, 100, 90, '#ffeb3b', 'ป้ายเตือน'),
        O('circle', 1540, 760, 26, 0, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 4. Shape Park ---------------- */
    park: {
      bg: () => sky('#b2ebf2', '#f1f8e9') + cloud(300, 170, .9) + cloud(1250, 140, .8) +
        `<rect y="600" width="1600" height="300" fill="#9ccc65"/>${grassTufts(640, '#7cb342')}
         <rect x="205" y="470" width="30" height="150" fill="#8d6e63" stroke="#3b2a20" stroke-width="3"/>
         <rect x="1365" y="460" width="34" height="170" fill="#8d6e63" stroke="#3b2a20" stroke-width="3"/>
         <line x1="1050" y1="440" x2="1050" y2="555" stroke="#5d4037" stroke-width="4"/><line x1="1150" y1="440" x2="1150" y2="555" stroke="#5d4037" stroke-width="4"/>
         <rect x="1000" y="430" width="200" height="14" fill="#5d4037"/>
         <line x1="760" y1="345" x2="790" y2="560" stroke="#5d4037" stroke-width="2"/><line x1="860" y1="360" x2="800" y2="560" stroke="#5d4037" stroke-width="2"/>
         <line x1="620" y1="240" x2="560" y2="600" stroke="#5d4037" stroke-width="2" stroke-dasharray="6 6"/>`,
      objects: [
        O('ellipse', 520, 700, 440, 130, '#4fc3f7', 'สระน้ำ'),
        O('circle', 220, 400, 190, 0, '#66bb6a', 'พุ่มไม้'),
        O('circle', 1380, 380, 210, 0, '#43a047', 'พุ่มไม้ใหญ่'),
        O('circle', 900, 700, 76, 0, '#ff7043', 'ลูกบอล'),
        O('ellipse', 1060, 730, 110, 62, '#a1887f', 'ลูกรักบี้', { rot: -20 }),
        O('ellipse', 1270, 650, 150, 52, '#8d6e63', 'รังนก'),
        O('ellipse', 1245, 615, 34, 46, '#e3f2fd', 'ไข่นก'),
        O('ellipse', 1292, 615, 34, 46, '#e3f2fd', 'ไข่นก'),
        O('ellipse', 760, 300, 72, 94, '#f06292', 'ลูกโป่งรี'),
        O('circle', 860, 320, 82, 0, '#ffd54f', 'ลูกโป่งกลม'),
        O('circle', 1000, 140, 100, 0, '#ffca28', 'ดวงอาทิตย์'),
        O('triangle', 620, 210, 90, 80, '#ab47bc', 'ว่าวสามเหลี่ยม'),
        O('rectangle', 1100, 560, 110, 22, '#ffb74d', 'ที่นั่งชิงช้า'),
        O('circle', 690, 610, 40, 0, '#f48fb1', 'ดอกไม้'),
        O('circle', 735, 630, 40, 0, '#fff176', 'ดอกไม้'),
        O('hexagon', 380, 790, 100, 86, '#ffe082', 'แผ่นทางเดิน'),
        O('ellipse', 160, 770, 32, 20, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 5. Shape Factory ---------------- */
    factory: {
      bg: () => `<rect width="1600" height="900" fill="#d7ccc8"/>
         ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="0" width="98" height="40" fill="#bcaaa4"/>`).join('')}
         <rect y="700" width="1600" height="200" fill="#8d6e63"/>
         <rect x="1310" y="0" width="80" height="380" fill="#78909c" stroke="#3b2a20" stroke-width="4"/>
         <rect x="330" y="640" width="20" height="60" fill="#616161"/><rect x="1250" y="640" width="20" height="60" fill="#616161"/>`,
      objects: [
        O('circle', 300, 300, 150, 0, '#ffb300', 'เฟืองใหญ่'),
        O('circle', 425, 380, 90, 0, '#ffa000', 'เฟืองเล็ก'),
        O('rectangle', 600, 230, 170, 110, '#b3e5fc', 'หน้าต่างโรงงาน'),
        O('rectangle', 860, 230, 170, 110, '#b3e5fc', 'หน้าต่างโรงงาน'),
        O('rectangle', 800, 640, 920, 40, '#616161', 'สายพาน'),
        O('circle', 420, 675, 34, 0, '#9e9e9e', 'ลูกกลิ้ง'),
        O('circle', 620, 675, 34, 0, '#9e9e9e', 'ลูกกลิ้ง'),
        O('circle', 820, 675, 34, 0, '#9e9e9e', 'ลูกกลิ้ง'),
        O('circle', 1020, 675, 34, 0, '#9e9e9e', 'ลูกกลิ้ง'),
        O('square', 560, 575, 90, 0, '#d7a86e', 'กล่องสินค้า'),
        O('square', 1000, 575, 90, 0, '#d7a86e', 'กล่องเอียง', { rot: 15 }),
        O('hexagon', 720, 585, 80, 70, '#ffd54f', 'น็อตหกเหลี่ยม'),
        O('pentagon', 860, 580, 84, 80, '#ba68c8', 'ชิ้นส่วนห้าเหลี่ยม'),
        O('rectangle', 1350, 520, 240, 220, '#90a4ae', 'เครื่องจักร'),
        O('circle', 1300, 470, 70, 0, '#e0f7fa', 'หน้าปัดเครื่อง'),
        O('triangle', 1400, 470, 66, 58, '#ffeb3b', 'ป้ายระวัง'),
        O('ellipse', 1350, 120, 120, 60, '#eceff1', 'ควัน'),
        O('ellipse', 1420, 200, 90, 46, '#eceff1', 'ควัน'),
        O('hexagon', 160, 780, 28, 24, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 6. Shape Museum ---------------- */
    museum: {
      bg: () => `<rect width="1600" height="900" fill="#fff3e0"/>
         <rect y="680" width="1600" height="220" fill="#d7b98e"/>
         ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="680" width="50" height="220" fill="#c9a87a"/>`).join('')}
         <rect x="40" y="160" width="60" height="520" fill="#efdcc0" stroke="#3b2a20" stroke-width="3"/><rect x="1500" y="160" width="60" height="520" fill="#efdcc0" stroke="#3b2a20" stroke-width="3"/>
         <path d="M0 150 L1600 150" stroke="#bf9b6e" stroke-width="10"/>`,
      objects: [
        O('rectangle', 320, 330, 240, 170, '#fff8e1', 'กรอบรูปภาพ', { stroke: '#8d6e63', sw: 10 }),
        O('triangle', 300, 345, 130, 100, '#81c784', 'ภูเขาในภาพ'),
        O('circle', 380, 300, 36, 0, '#ffb74d', 'ดวงอาทิตย์ในภาพ'),
        O('rectangle', 650, 600, 150, 160, '#efebe9', 'แท่นโชว์'),
        O('ellipse', 650, 450, 96, 130, '#c5e1a5', 'ไข่ไดโนเสาร์'),
        O('rectangle', 950, 600, 150, 160, '#efebe9', 'แท่นโชว์'),
        O('pentagon', 950, 460, 110, 104, '#ba68c8', 'อัญมณีห้าเหลี่ยม'),
        O('hexagon', 1250, 300, 120, 104, '#ffca28', 'รวงผึ้งโบราณ'),
        O('rectangle', 1250, 600, 150, 160, '#efebe9', 'แท่นโชว์'),
        O('circle', 1250, 460, 120, 0, '#90caf9', 'จานโบราณ'),
        O('ellipse', 800, 230, 160, 70, '#ffe0b2', 'ป้ายพิพิธภัณฑ์'),
        O('triangle', 1520, 760, 30, 26, '#fff176', 'ชิ้นแผนที่ลับ', { secret: true })
      ]
    },

    /* ---------------- 7. Secret Shape Room ---------------- */
    secret: {
      bg: () => `<defs><radialGradient id="rg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#7e57c2"/><stop offset="1" stop-color="#3f2b6b"/></radialGradient></defs>
         <rect width="1600" height="900" fill="url(#rg)"/>
         <rect y="700" width="1600" height="200" fill="#5e4a8b"/>
         ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 397) % 1600}" cy="${(i * 211) % 600 + 40}" r="${1 + (i % 3)}" fill="#fff" opacity=".6"/>`).join('')}`,
      objects: [
        O('circle', 800, 430, 380, 0, '#b39ddb', 'ประตูห้องลับ', { stroke: '#ffd54f', sw: 10 }),
        O('hexagon', 800, 430, 110, 96, '#ffd54f', 'แม่กุญแจหกเหลี่ยม'),
        O('ellipse', 300, 300, 70, 100, '#ffcc80', 'โคมไฟ'),
        O('ellipse', 1300, 300, 70, 100, '#ffcc80', 'โคมไฟ'),
        O('rectangle', 230, 600, 220, 260, '#8d6e63', 'ชั้นหนังสือ'),
        O('rectangle', 1370, 600, 220, 260, '#8d6e63', 'ชั้นหนังสือ'),
        O('triangle', 800, 760, 120, 60, '#ffd54f', 'บันไดทอง', { rot: 180 })
      ]
    }
  };

  window.SD = window.SD || {};
  window.SD.SCENES = SCENES;
})();
