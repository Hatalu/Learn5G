/**
 * THE GREAT MAP MAKERS - Procedural Vector SVG Characters
 * 100% SVG. Dynamic emotional states & talking animations.
 */
(function () {
  'use strict';

  const Characters = {
    // 1. Captain Dot (The Junior Map Maker Guide)
    captainDotSVG(state = 'cheer', size = 180) {
      const isThink = state === 'think';
      const isCheer = state === 'cheer';
      const isGuide = state === 'guide';

      return `
      <svg class="char-svg char-captain" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="c-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2d1d13" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Shadow -->
        <ellipse cx="100" cy="188" rx="45" ry="9" fill="#3a2517" opacity="0.25"/>

        <!-- Body & Coat -->
        <g filter="url(#c-shadow)">
          <!-- Legs -->
          <rect x="78" y="145" width="16" height="35" rx="7" fill="#37474f" stroke="#1a2529" stroke-width="4"/>
          <rect x="106" y="145" width="16" height="35" rx="7" fill="#37474f" stroke="#1a2529" stroke-width="4"/>
          <ellipse cx="86" cy="180" rx="12" ry="6" fill="#212121"/>
          <ellipse cx="114" cy="180" rx="12" ry="6" fill="#212121"/>

          <!-- Explorer Coat -->
          <path d="M60 115 C60 90, 140 90, 140 115 L145 152 C145 158, 138 160, 130 160 L70 160 C62 160, 55 158, 55 152 Z" fill="#e65100" stroke="#bf360c" stroke-width="4.5"/>
          <!-- Belt with Golden Compass Buckle -->
          <rect x="58" y="132" width="84" height="11" fill="#4e342e" stroke="#271b16" stroke-width="3"/>
          <circle cx="100" cy="137.5" r="9" fill="#ffd54f" stroke="#ff8f00" stroke-width="2.5"/>
          <polygon points="100,131 103,137.5 100,144 97,137.5" fill="#d32f2f"/>

          <!-- Left Arm -->
          ${isCheer ? `
            <path d="M60 108 Q35 75 42 55" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <circle cx="42" cy="55" r="9" fill="#ffcc80" stroke="#e65100" stroke-width="3"/>
          ` : isGuide ? `
            <path d="M60 110 Q30 115 22 100" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <!-- Holding Map Scroll -->
            <rect x="10" y="85" width="22" height="14" rx="4" fill="#fff9c4" stroke="#8d6e63" stroke-width="2.5" transform="rotate(-15 21 92)"/>
          ` : `
            <path d="M60 110 Q45 130 52 145" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <circle cx="52" cy="145" r="8" fill="#ffcc80"/>
          `}

          <!-- Right Arm -->
          ${isCheer ? `
            <path d="M140 108 Q165 75 158 55" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <circle cx="158" cy="55" r="9" fill="#ffcc80" stroke="#e65100" stroke-width="3"/>
          ` : isThink ? `
            <path d="M140 110 Q160 95 135 85" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <circle cx="135" cy="85" r="8" fill="#ffcc80"/>
          ` : `
            <!-- Holding Telescope / Magnifier -->
            <path d="M140 110 Q165 125 155 135" stroke="#e65100" stroke-width="14" stroke-linecap="round"/>
            <circle cx="160" cy="140" r="10" fill="#80deea" stroke="#00838f" stroke-width="3"/>
            <line x1="168" y1="148" x2="178" y2="158" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>
          `}

          <!-- Head -->
          <circle cx="100" cy="78" r="34" fill="#ffe0b2" stroke="#e65100" stroke-width="4"/>
          <!-- Cheeks -->
          <circle cx="82" cy="88" r="6" fill="#ff8a80" opacity="0.6"/>
          <circle cx="118" cy="88" r="6" fill="#ff8a80" opacity="0.6"/>

          <!-- Eyes -->
          ${isThink ? `
            <path d="M78 74 Q85 68 92 74" stroke="#212121" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            <circle cx="118" cy="74" r="5" fill="#212121"/>
          ` : `
            <circle cx="85" cy="75" r="5" fill="#212121"/>
            <circle cx="87" cy="73" r="2" fill="#ffffff"/>
            <circle cx="115" cy="75" r="5" fill="#212121"/>
            <circle cx="117" cy="73" r="2" fill="#ffffff"/>
          `}

          <!-- Mouth -->
          ${isCheer ? `
            <path d="M88 88 Q100 102 112 88 Z" fill="#d32f2f" stroke="#212121" stroke-width="2.5"/>
          ` : isThink ? `
            <circle cx="100" cy="92" r="3" fill="#212121"/>
          ` : `
            <path d="M90 88 Q100 96 110 88" stroke="#212121" stroke-width="3" fill="none" stroke-linecap="round"/>
          `}

          <!-- Captain's Navigator Hat -->
          <path d="M60 58 Q100 38 140 58 L146 54 Q100 20 54 54 Z" fill="#1565c0" stroke="#0d47a1" stroke-width="4"/>
          <path d="M66 52 Q100 32 134 52 L128 35 Q100 24 72 35 Z" fill="#1976d2" stroke="#0d47a1" stroke-width="3"/>
          <!-- Gold Badge with Point Dot -->
          <circle cx="100" cy="44" r="9" fill="#ffd54f" stroke="#ff8f00" stroke-width="2.5"/>
          <circle cx="100" cy="44" r="4.5" fill="#d32f2f"/>
        </g>
      </svg>
      `;
    },

    // 2. Compass (The Curious Navigation Companion)
    compassSVG(angle = 45, size = 110) {
      return `
      <svg class="char-svg char-compass" width="${size}" height="${size}" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="comp-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#3e2723" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#comp-shadow)">
          <!-- Top Ring -->
          <circle cx="70" cy="20" r="10" stroke="#c9a227" stroke-width="4.5" fill="none"/>
          <!-- Brass Casing -->
          <circle cx="70" cy="74" r="50" fill="#ffe082" stroke="#c9a227" stroke-width="6"/>
          <circle cx="70" cy="74" r="42" fill="#fffde7" stroke="#8d6e63" stroke-width="3"/>

          <!-- Compass Rose Ticks -->
          <circle cx="70" cy="74" r="34" stroke="#d7ccc8" stroke-width="1.5" stroke-dasharray="2 6" fill="none"/>
          <text x="70" y="47" font-size="10" font-weight="800" fill="#d32f2f" text-anchor="middle" font-family="sans-serif">N</text>
          <text x="70" y="106" font-size="9" font-weight="800" fill="#5d4037" text-anchor="middle" font-family="sans-serif">S</text>
          <text x="100" y="77" font-size="9" font-weight="800" fill="#5d4037" text-anchor="middle" font-family="sans-serif">E</text>
          <text x="40" y="77" font-size="9" font-weight="800" fill="#5d4037" text-anchor="middle" font-family="sans-serif">W</text>

          <!-- Rotating Needle -->
          <g transform="rotate(${angle} 70 74)">
            <!-- North Arrow (Red) -->
            <polygon points="70,36 76,74 70,70" fill="#f44336"/>
            <polygon points="70,36 64,74 70,70" fill="#d32f2f"/>
            <!-- South Arrow (Blue) -->
            <polygon points="70,112 76,74 70,78" fill="#1e88e5"/>
            <polygon points="70,112 64,74 70,78" fill="#1565c0"/>
            <!-- Center Pivot Pin -->
            <circle cx="70" cy="74" r="6" fill="#ffd54f" stroke="#c9a227" stroke-width="2"/>
            <circle cx="70" cy="74" r="2.5" fill="#212121"/>
          </g>

          <!-- Cute Face on Faceplate -->
          <circle cx="60" cy="70" r="2.5" fill="#424242"/>
          <circle cx="80" cy="70" r="2.5" fill="#424242"/>
          <path d="M66 77 Q70 81 74 77" stroke="#424242" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>
      </svg>
      `;
    },

    // 3. Liney (Infinite Straight Line - Serious & Fun)
    lineySVG(size = 140) {
      return `
      <svg class="char-svg char-liney" width="${size}" height="${size * 0.7}" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Body: Straight bar with infinite arrows on BOTH sides <---> -->
        <defs>
          <linearGradient id="liney-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#42a5f5"/>
            <stop offset="100%" stop-color="#1e88e5"/>
          </linearGradient>
        </defs>
        <!-- Horizontal Line Bar -->
        <rect x="25" y="50" width="130" height="20" rx="6" fill="url(#liney-grad)" stroke="#0d47a1" stroke-width="4"/>

        <!-- Left Arrowhead (Extends indefinitely to the left) -->
        <polygon points="28,38 4,60 28,82 22,60" fill="#1565c0" stroke="#0d47a1" stroke-width="3"/>
        <!-- Right Arrowhead (Extends indefinitely to the right) -->
        <polygon points="152,38 176,60 152,82 158,60" fill="#1565c0" stroke="#0d47a1" stroke-width="3"/>

        <!-- Face in center -->
        <!-- Big Round Glasses -->
        <circle cx="78" cy="57" r="10" fill="#ffffff" stroke="#212121" stroke-width="3"/>
        <circle cx="102" cy="57" r="10" fill="#ffffff" stroke="#212121" stroke-width="3"/>
        <line x1="88" y1="57" x2="92" y2="57" stroke="#212121" stroke-width="3"/>
        <circle cx="80" cy="57" r="4" fill="#0d47a1"/>
        <circle cx="104" cy="57" r="4" fill="#0d47a1"/>
        <!-- Grin -->
        <path d="M84 72 Q90 77 96 72" stroke="#212121" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Little Boots -->
        <rect x="72" y="70" width="10" height="20" rx="4" fill="#37474f"/>
        <rect x="98" y="70" width="10" height="20" rx="4" fill="#37474f"/>
        <ellipse cx="74" cy="91" rx="8" ry="4" fill="#212121"/>
        <ellipse cx="104" cy="91" rx="8" ry="4" fill="#212121"/>
      </svg>
      `;
    },

    // 4. Ray-Ray (The Forward-Shooting Beam of Light)
    rayRaySVG(size = 140) {
      return `
      <svg class="char-svg char-ray" width="${size}" height="${size * 0.7}" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ray-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ffd54f"/>
            <stop offset="100%" stop-color="#ff9800"/>
          </linearGradient>
        </defs>
        <!-- Beam Body: Fixed Origin Endpoint (Bullet Point) on left -> Arrow on right -->
        <rect x="36" y="50" width="115" height="20" rx="6" fill="url(#ray-grad)" stroke="#e65100" stroke-width="4"/>

        <!-- Definite Origin Point (Red Anchor) -->
        <circle cx="34" cy="60" r="14" fill="#e53935" stroke="#b71c1c" stroke-width="4"/>
        <circle cx="34" cy="60" r="6" fill="#ffffff"/>

        <!-- Forward Arrowhead (Points infinity right) -->
        <polygon points="145,36 175,60 145,84 152,60" fill="#f57c00" stroke="#bf360c" stroke-width="3.5"/>

        <!-- Speed Lines / Sparkles -->
        <line x1="168" y1="42" x2="178" y2="35" stroke="#ffb300" stroke-width="3" stroke-linecap="round"/>
        <line x1="168" y1="78" x2="178" y2="85" stroke="#ffb300" stroke-width="3" stroke-linecap="round"/>

        <!-- Face with Determined Goggles -->
        <circle cx="75" cy="58" r="9" fill="#263238" stroke="#ffb300" stroke-width="2.5"/>
        <circle cx="95" cy="58" r="9" fill="#263238" stroke="#ffb300" stroke-width="2.5"/>
        <circle cx="77" cy="57" r="3" fill="#00e676"/>
        <circle cx="97" cy="57" r="3" fill="#00e676"/>
        <!-- Confident Smile -->
        <path d="M80 72 Q86 78 92 72" stroke="#212121" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
      `;
    },

    // 5. Angle (Rotating Jointed Arm with Vertex & Arc)
    angleSVG(deg = 90, size = 150) {
      const isRightAngle = Math.abs(deg - 90) <= 2;
      const rad = (deg * Math.PI) / 180;
      const armLength = 70;
      // Arm 1 horizontal right: from (40, 110) to (110, 110)
      const vx = 40;
      const vy = 110;
      const ax1 = vx + armLength;
      const ay1 = vy;
      // Arm 2 rotated up by deg
      const ax2 = vx + armLength * Math.cos(rad);
      const ay2 = vy - armLength * Math.sin(rad);

      // Arc calculation for angle representation
      const arcR = 28;
      const arcX = vx + arcR * Math.cos(rad);
      const arcY = vy - arcR * Math.sin(rad);

      return `
      <svg class="char-svg char-angle" width="${size}" height="${size}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ang-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffd54f" flood-opacity="0.8"/>
          </filter>
        </defs>

        <!-- Angle Arc or Right-Angle Square -->
        ${isRightAngle ? `
          <!-- Iconic Right-Angle Square Marker -->
          <rect x="${vx}" y="${vy - 24}" width="24" height="24" fill="#a5d6a7" stroke="#2e7d32" stroke-width="3" filter="url(#ang-glow)"/>
          <text x="${vx + 32}" y="${vy - 28}" font-size="12" font-weight="900" fill="#2e7d32" font-family="sans-serif">90° มุมฉาก!</text>
        ` : `
          <!-- Curve Arc showing angle span -->
          <path d="M${vx + arcR} ${vy} A${arcR} ${arcR} 0 0 0 ${arcX} ${arcY}" stroke="#ff7043" stroke-width="3.5" fill="none"/>
          <path d="M${vx} ${vy} L${vx + arcR} ${vy} A${arcR} ${arcR} 0 0 0 ${arcX} ${arcY} Z" fill="#ffccbc" opacity="0.45"/>
          <text x="${vx + 26}" y="${vy - 16}" font-size="11" font-weight="800" fill="#d84315" font-family="sans-serif">${Math.round(deg)}°</text>
        `}

        <!-- Arm 1 (Base Ray) -->
        <line x1="${vx}" y1="${vy}" x2="${ax1}" y2="${ay1}" stroke="#7e57c2" stroke-width="7" stroke-linecap="round"/>
        <polygon points="${ax1 + 8},${ay1} ${ax1},${ay1 - 5} ${ax1},${ay1 + 5}" fill="#512da8"/>

        <!-- Arm 2 (Rotating Ray) -->
        <line x1="${vx}" y1="${vy}" x2="${ax2}" y2="${ay2}" stroke="#ab47bc" stroke-width="7" stroke-linecap="round"/>
        <circle cx="${ax2}" cy="${ay2}" r="5" fill="#4a148c"/>

        <!-- Vertex Point (จุดยอดมุม) -->
        <circle cx="${vx}" cy="${vy}" r="12" fill="#ffd54f" stroke="#ff6f00" stroke-width="3.5"/>
        <circle cx="${vx}" cy="${vy}" r="5" fill="#d84315"/>

        <!-- Cute Eyes on Vertex -->
        <circle cx="${vx - 3}" cy="${vy - 2}" r="2" fill="#ffffff"/>
        <circle cx="${vx + 3}" cy="${vy - 2}" r="2" fill="#ffffff"/>
      </svg>
      `;
    }
  };

  window.MapCharacters = Characters;
})();
