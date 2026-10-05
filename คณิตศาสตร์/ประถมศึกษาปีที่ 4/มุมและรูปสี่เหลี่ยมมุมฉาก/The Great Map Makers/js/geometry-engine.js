/**
 * THE GREAT MAP MAKERS - Interactive Geometry Engine
 * Mathematical calculation, angle detection, right-angle snapping, and polygon validation.
 */
(function () {
  'use strict';

  const Geometry = {
    // Distance between 2 points
    dist(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.hypot(dx, dy);
    },

    // Midpoint between 2 points
    midpoint(p1, p2) {
      return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    },

    // Calculate angle in degrees between vertex V, arm A, and arm B
    // Angle formed by ray VA and ray VB
    angleBetween(v, a, b) {
      const v1 = { x: a.x - v.x, y: a.y - v.y };
      const v2 = { x: b.x - v.x, y: b.y - v.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.hypot(v1.x, v1.y);
      const mag2 = Math.hypot(v2.x, v2.y);
      if (mag1 === 0 || mag2 === 0) return 0;
      let cosVal = dot / (mag1 * mag2);
      cosVal = Math.max(-1, Math.min(1, cosVal));
      return (Math.acos(cosVal) * 180) / Math.PI;
    },

    // Check if an angle is approximately a Right Angle (90 degrees +- 4 degrees for kids)
    isRightAngle(v, a, b, tolerance = 4.5) {
      const deg = this.angleBetween(v, a, b);
      return Math.abs(deg - 90) <= tolerance;
    },

    // Check if 4 points form a valid Rectangle (รูปสี่เหลี่ยมมุมฉาก)
    // Points must be in cyclic order [p0, p1, p2, p3]
    validateRectangle(points, tolerance = 5) {
      if (!points || points.length !== 4) return { isValid: false, reason: 'ต้องมีจุดยอด 4 จุด' };

      const [p0, p1, p2, p3] = points;
      // Calculate 4 interior angles
      const a0 = this.angleBetween(p0, p3, p1);
      const a1 = this.angleBetween(p1, p0, p2);
      const a2 = this.angleBetween(p2, p1, p3);
      const a3 = this.angleBetween(p3, p2, p0);

      const angles = [a0, a1, a2, a3];
      const rightCount = angles.filter(a => Math.abs(a - 90) <= tolerance).length;

      // Side lengths
      const s0 = this.dist(p0, p1);
      const s1 = this.dist(p1, p2);
      const s2 = this.dist(p2, p3);
      const s3 = this.dist(p3, p0);

      // Check opposite sides approximately equal
      const opp1Equal = Math.abs(s0 - s2) <= Math.max(s0, s2) * 0.15 + 15;
      const opp2Equal = Math.abs(s1 - s3) <= Math.max(s1, s3) * 0.15 + 15;

      const isSquare = Math.abs(s0 - s1) <= 18 && opp1Equal && opp2Equal && rightCount === 4;

      if (rightCount === 4 && opp1Equal && opp2Equal) {
        return {
          isValid: true,
          type: isSquare ? 'สี่เหลี่ยมจัตุรัส (Square)' : 'สี่เหลี่ยมผืนผ้า (Rectangle)',
          isSquare,
          angles,
          rightCount
        };
      }

      return {
        isValid: false,
        angles,
        rightCount,
        reason: rightCount < 4
          ? `มุมทั้ง 4 ต้องเป็นมุมฉาก (ปัจจุบันเป็นมุมฉาก ${rightCount} มุม)`
          : 'ด้านตรงข้ามต้องมีความยาวเท่ากัน'
      };
    },

    // Snap point to 90 degrees if close to arm
    snapToRightAngle(vertex, basePoint, movingPoint, snapThreshold = 6) {
      const currentAngle = this.angleBetween(vertex, basePoint, movingPoint);
      if (Math.abs(currentAngle - 90) <= snapThreshold) {
        // Compute perpendicular unit vector from vertex to basePoint
        const dx = basePoint.x - vertex.x;
        const dy = basePoint.y - vertex.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return movingPoint;

        const ux = dx / len;
        const uy = dy / len;
        // Two perpendicular directions: (-uy, ux) and (uy, -ux)
        const curDx = movingPoint.x - vertex.x;
        const curDy = movingPoint.y - vertex.y;
        const curLen = Math.hypot(curDx, curDy);

        // Check which perp direction is closer
        const p1 = { x: vertex.x - uy * curLen, y: vertex.y + ux * curLen };
        const p2 = { x: vertex.x + uy * curLen, y: vertex.y - ux * curLen };

        const d1 = this.dist(movingPoint, p1);
        const d2 = this.dist(movingPoint, p2);
        return d1 < d2 ? { ...p1, snapped: true } : { ...p2, snapped: true };
      }
      return movingPoint;
    },

    // Generate SVG path for a Right-Angle corner symbol (สัญลักษณ์มุมฉาก)
    getRightAngleMarkerSVG(v, a, b, size = 18) {
      const v1 = { x: a.x - v.x, y: a.y - v.y };
      const v2 = { x: b.x - v.x, y: b.y - v.y };
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      if (len1 === 0 || len2 === 0) return '';

      const u1 = { x: (v1.x / len1) * size, y: (v1.y / len1) * size };
      const u2 = { x: (v2.x / len2) * size, y: (v2.y / len2) * size };

      const c1 = { x: v.x + u1.x, y: v.y + u1.y };
      const c2 = { x: v.x + u1.x + u2.x, y: v.y + u1.y + u2.y };
      const c3 = { x: v.x + u2.x, y: v.y + u2.y };

      return `
        <polygon points="${v.x},${v.y} ${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}" fill="rgba(76, 175, 80, 0.25)" stroke="#2e7d32" stroke-width="2.5" class="ra-marker" />
      `;
    },

    // Generate SVG for a Segment (ส่วนของเส้นตรง: มีจุดปลาย 2 จุดชัดเจน)
    renderSegmentSVG(p1, p2, options = {}) {
      const color = options.color || '#29b6f6';
      const width = options.width || 5;
      const label = options.label || '';
      return `
        <g class="geom-segment">
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
          <!-- 2 Distinct Endpoints (จุดปลาย 2 จุด) -->
          <circle cx="${p1.x}" cy="${p1.y}" r="${width + 3}" fill="#0288d1" stroke="#ffffff" stroke-width="2.5" />
          <circle cx="${p2.x}" cy="${p2.y}" r="${width + 3}" fill="#0288d1" stroke="#ffffff" stroke-width="2.5" />
          ${label ? `<text x="${(p1.x + p2.x)/2}" y="${(p1.y + p2.y)/2 - 12}" font-size="13" font-weight="700" fill="${color}" text-anchor="middle">${label}</text>` : ''}
        </g>
      `;
    },

    // Generate SVG for a Line (เส้นตรง: ต่อออกไปได้เรื่อยๆ ทั้ง 2 ด้าน ลูกศร 2 หัว)
    renderLineSVG(p1, p2, options = {}) {
      const color = options.color || '#ab47bc';
      const width = options.width || 4.5;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return '';
      const ext = 45; // Extend beyond points to show infinite line
      const ux = dx / len;
      const uy = dy / len;

      const start = { x: p1.x - ux * ext, y: p1.y - uy * ext };
      const end = { x: p2.x + ux * ext, y: p2.y + uy * ext };

      return `
        <g class="geom-line">
          <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="${width}" stroke-dasharray="1 0"/>
          <!-- Reference points on line -->
          <circle cx="${p1.x}" cy="${p1.y}" r="5" fill="#7b1fa2" stroke="#fff" stroke-width="2"/>
          <circle cx="${p2.x}" cy="${p2.y}" r="5" fill="#7b1fa2" stroke="#fff" stroke-width="2"/>
          <!-- Arrowheads at both ends -->
          <polygon points="${start.x},${start.y} ${start.x + ux*10 - uy*6},${start.y + uy*10 + ux*6} ${start.x + ux*10 + uy*6},${start.y + uy*10 - ux*6}" fill="${color}"/>
          <polygon points="${end.x},${end.y} ${end.x - ux*10 - uy*6},${end.y - uy*10 + ux*6} ${end.x - ux*10 + uy*6},${end.y - uy*10 - ux*6}" fill="${color}"/>
        </g>
      `;
    },

    // Generate SVG for a Ray (รังสี: จุดกำเนิด 1 จุด พุ่งไปข้างหน้า 1 ทิศทาง)
    renderRaySVG(origin, dirPoint, options = {}) {
      const color = options.color || '#ffa726';
      const width = options.width || 5;
      const dx = dirPoint.x - origin.x;
      const dy = dirPoint.y - origin.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return '';
      const ext = 50;
      const ux = dx / len;
      const uy = dy / len;
      const end = { x: dirPoint.x + ux * ext, y: dirPoint.y + uy * ext };

      return `
        <g class="geom-ray">
          <line x1="${origin.x}" y1="${origin.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="${width}"/>
          <!-- Origin Endpoint (จุดเริ่มต้น/จุดกำเนิด) -->
          <circle cx="${origin.x}" cy="${origin.y}" r="8" fill="#d84315" stroke="#ffffff" stroke-width="3"/>
          <circle cx="${dirPoint.x}" cy="${dirPoint.y}" r="4" fill="#fb8c00"/>
          <!-- Single Arrowhead at far end -->
          <polygon points="${end.x},${end.y} ${end.x - ux*12 - uy*7},${end.y - uy*12 + ux*7} ${end.x - ux*12 + uy*7},${end.y - uy*12 - ux*7}" fill="${color}"/>
        </g>
      `;
    }
  };

  window.MapGeometry = Geometry;
})();
