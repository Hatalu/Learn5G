/**
 * THE GREAT MAP MAKERS - Maporia World & Living Map Renderer
 * 100% SVG Interactive Map with Fog-of-War, Living World elements, and Area Portals.
 */
(function () {
  'use strict';

  const WorldRenderer = {
    renderMap(containerId, unlockedAreas = ['point-plaza'], onAreaClick) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const areas = window.MapData ? window.MapData.areas : [];

      const svg = `
      <svg class="world-map-svg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Parchment Pattern -->
          <radialGradient id="ocean-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#b2ebf2" stop-opacity="0.85"/>
            <stop offset="60%" stop-color="#80deea" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#4dd0e1"/>
          </radialGradient>

          <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0, 105, 120, 0.12)" stroke-width="1.2" stroke-dasharray="2 4"/>
          </pattern>

          <!-- Island Shading Filters -->
          <filter id="island-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#006064" flood-opacity="0.35"/>
          </filter>

          <!-- Fog Gradient -->
          <radialGradient id="fog-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#eceff1" stop-opacity="0.95"/>
            <stop offset="80%" stop-color="#cfd8dc" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#b0bec5" stop-opacity="0.4"/>
          </radialGradient>
        </defs>

        <!-- Ocean Background -->
        <rect width="1400" height="800" fill="url(#ocean-bg)"/>
        <!-- Navigation Grid (Cartography Lat/Long) -->
        <rect width="1400" height="800" fill="url(#grid-pattern)"/>

        <!-- Animated Ocean Waves -->
        <g class="living-waves" stroke="rgba(255, 255, 255, 0.45)" stroke-width="2.5" fill="none" stroke-linecap="round">
          <path d="M 120 180 Q 140 170, 160 180 Q 180 190, 200 180" class="wave-anim"/>
          <path d="M 400 650 Q 425 640, 450 650 Q 475 660, 500 650" class="wave-anim" style="animation-delay: 1s;"/>
          <path d="M 850 140 Q 875 130, 900 140 Q 925 150, 950 140" class="wave-anim" style="animation-delay: 1.5s;"/>
          <path d="M 1200 680 Q 1225 670, 1250 680 Q 1275 690, 1300 680" class="wave-anim" style="animation-delay: 0.5s;"/>
        </g>

        <!-- Little Sailing Ships -->
        <g class="living-ship" transform="translate(180, 620)">
          <path d="M 0 15 Q 15 25 35 15 L 30 25 L 5 25 Z" fill="#6d4c41" stroke="#3e2723" stroke-width="2"/>
          <polygon points="18,14 18,-6 32,10" fill="#fff9c4" stroke="#8d6e63" stroke-width="1.5"/>
          <polygon points="16,14 16,-2 4,11" fill="#ffffff" stroke="#8d6e63" stroke-width="1.5"/>
          <line x1="17" y1="15" x2="17" y2="-9" stroke="#3e2723" stroke-width="2"/>
        </g>

        <!-- ================= ISLAND LANDMASSES (MAPORIA) ================= -->
        <!-- Main Archipelago outline with sand beaches and lush greens -->
        <g filter="url(#island-shadow)">
          <!-- Sand Base Layer -->
          <path d="M 160 480 C 140 360, 280 280, 400 300 C 520 220, 680 160, 800 200 C 940 180, 1080 240, 1200 300 C 1280 380, 1260 520, 1140 600 C 980 660, 840 620, 720 660 C 560 700, 420 640, 320 620 C 200 620, 160 560, 160 480 Z" fill="#ffe082" stroke="#d7ccc8" stroke-width="4"/>

          <!-- Lush Green Topography -->
          <path d="M 180 470 C 170 380, 300 310, 410 320 C 520 250, 660 190, 780 220 C 910 200, 1050 260, 1160 320 C 1240 400, 1220 500, 1110 570 C 960 620, 830 590, 710 630 C 560 660, 440 610, 340 590 C 240 590, 190 530, 180 470 Z" fill="#c8e6c9" stroke="#81c784" stroke-width="3"/>

          <!-- River crossing Line Forest (Bridge challenge location) -->
          <path d="M 440 290 Q 480 420 460 560" stroke="#4dd0e1" stroke-width="18" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Decorative Map Contour Lines & Trees -->
        <g stroke="#a5d6a7" stroke-width="2" fill="none" opacity="0.6">
          <ellipse cx="320" cy="440" rx="60" ry="40"/>
          <ellipse cx="640" cy="520" rx="70" ry="45"/>
          <ellipse cx="1060" cy="440" rx="90" ry="60"/>
        </g>

        <!-- Little Pine Trees & Landmark Decorations -->
        <g class="map-decorations">
          <!-- Forest Trees -->
          <polygon points="460,250 450,270 470,270" fill="#2e7d32"/>
          <polygon points="480,240 470,265 490,265" fill="#388e3c"/>
          <polygon points="510,255 500,275 520,275" fill="#2e7d32"/>
          <polygon points="440,320 430,345 450,345" fill="#1b5e20"/>

          <!-- Canyon Ridges -->
          <path d="M 580 460 L 610 440 L 640 470 L 670 450" stroke="#795548" stroke-width="4" fill="none" stroke-linejoin="round"/>
          <path d="M 600 530 L 630 510 L 660 540" stroke="#8d6e63" stroke-width="3.5" fill="none" stroke-linejoin="round"/>

          <!-- Lighthouse Beam (Living Ray animation) -->
          <g class="lighthouse-glow">
            <polygon points="760,205 1020,120 1060,180" fill="rgba(255, 238, 88, 0.28)" class="pulse-beam"/>
            <circle cx="760" cy="205" r="9" fill="#ffeb3b"/>
          </g>
        </g>

        <!-- ================= 6 INTERACTIVE AREA NODES ================= -->
        <g id="map-area-nodes">
          ${areas.map((area, idx) => {
            const isUnlocked = unlockedAreas.includes(area.id);
            return `
            <g class="area-node ${isUnlocked ? 'unlocked' : 'locked'}" data-area-id="${area.id}" transform="translate(${area.x}, ${area.y})">
              <!-- Node Glow Base -->
              <circle cx="0" cy="0" r="42" fill="${isUnlocked ? area.color : '#78909c'}" opacity="0.22" class="node-halo"/>
              <circle cx="0" cy="0" r="32" fill="#ffffff" stroke="${isUnlocked ? area.color : '#546e7a'}" stroke-width="4.5" class="node-disc"/>

              <!-- Icon -->
              <text x="0" y="10" font-size="28" text-anchor="middle" class="node-icon">${isUnlocked ? area.icon : '🔒'}</text>

              <!-- Pin Badge / Zone Number -->
              <circle cx="24" cy="-22" r="13" fill="${isUnlocked ? area.color : '#607d8b'}" stroke="#ffffff" stroke-width="2"/>
              <text x="24" y="-17" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${area.zoneNum}</text>

              <!-- Title Banner -->
              <g class="node-banner" transform="translate(0, 48)">
                <rect x="-85" y="0" width="170" height="30" rx="15" fill="#fffde7" stroke="#3e2723" stroke-width="2.5" class="banner-box"/>
                <text x="0" y="20" font-size="13" font-weight="800" fill="#3e2723" text-anchor="middle" font-family="var(--font-map, sans-serif)">${area.name.split(' (')[0]}</text>
              </g>

              <!-- Fog Cover Overlay if locked -->
              ${!isUnlocked ? `
                <g class="area-fog" transform="translate(-70, -70)">
                  <circle cx="70" cy="70" r="75" fill="url(#fog-grad)" class="fog-puff"/>
                  <text x="70" y="75" font-size="12" font-weight="700" fill="#455a64" text-anchor="middle">หมอกบดบัง</text>
                </g>
              ` : ''}
            </g>
            `;
          }).join('')}
        </g>

        <!-- Cartographic Compass Rose in Corner -->
        <g class="map-compass-rose" transform="translate(1260, 110)">
          <circle cx="0" cy="0" r="54" fill="rgba(255, 253, 231, 0.85)" stroke="#8d6e63" stroke-width="3"/>
          <circle cx="0" cy="0" r="46" stroke="#bcaaa4" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>
          <!-- Star Points -->
          <polygon points="0,-42 7,-8 0,0 -7,-8" fill="#d32f2f"/>
          <polygon points="0,42 7,8 0,0 -7,8" fill="#5d4037"/>
          <polygon points="42,0 8,7 0,0 8,-7" fill="#5d4037"/>
          <polygon points="-42,0 -8,7 0,0 -8,-7" fill="#5d4037"/>
          <circle cx="0" cy="0" r="6" fill="#ffd54f" stroke="#ff8f00" stroke-width="2"/>
          <text x="0" y="-46" font-size="12" font-weight="900" fill="#d32f2f" text-anchor="middle">N</text>
        </g>

        <!-- Map Title Banner on Top-Left -->
        <g class="map-title-scroll" transform="translate(40, 40)">
          <rect x="0" y="0" width="280" height="54" rx="14" fill="#fffde7" stroke="#4e342e" stroke-width="3.5"/>
          <text x="140" y="26" font-size="16" font-weight="900" fill="#bf360c" text-anchor="middle">🗺️ แผนที่หมู่เกาะ MAPORIA</text>
          <text x="140" y="44" font-size="11" font-weight="700" fill="#6d4c41" text-anchor="middle">สำรวจโลก วาดเส้น สร้างมุม และสร้างแผนที่</text>
        </g>
      </svg>
      `;

      container.innerHTML = svg;

      // Bind click handlers to area nodes
      container.querySelectorAll('.area-node').forEach(node => {
        node.addEventListener('click', () => {
          const areaId = node.dataset.areaId;
          if (typeof onAreaClick === 'function') {
            onAreaClick(areaId);
          }
        });
      });
    }
  };

  window.MapWorldRenderer = WorldRenderer;
})();
