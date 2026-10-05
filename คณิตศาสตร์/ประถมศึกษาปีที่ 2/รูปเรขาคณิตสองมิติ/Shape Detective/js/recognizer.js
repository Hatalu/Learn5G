/* ==========================================================================
   SHAPE DETECTIVE — Friendly shape recognizer for children's drawings
   Checks: closed? straight vs curved? number of corners? round vs long?
   Deliberately lenient: we assess the idea, not perfect handwriting.
   ========================================================================== */
(function () {
  'use strict';

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  function bbox(pts) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    pts.forEach(([x, y]) => { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); });
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
  }

  function resample(pts, n) {
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
    if (total === 0) return [];
    const step = total / n, out = [pts[0].slice()];
    let acc = 0, prev = pts[0].slice();
    for (let i = 1; i < pts.length; i++) {
      let cur = pts[i], d = dist(prev, cur);
      while (acc + d >= step && out.length < n) {
        const t = (step - acc) / d;
        const np = [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])];
        out.push(np); prev = np; d = dist(prev, cur); acc = 0;
      }
      acc += d; prev = cur;
    }
    while (out.length < n) out.push(pts[pts.length - 1].slice());
    return out;
  }

  /** Main recognizer. strokes: array of arrays of [x,y] */
  function recognize(strokes) {
    let pts = [];
    strokes.forEach(s => { pts = pts.concat(s); });
    if (pts.length < 8) return { kind: 'tiny', closed: false, corners: 0 };
    const bb = bbox(pts), diag = Math.hypot(bb.w, bb.h);
    if (diag < 40) return { kind: 'tiny', closed: false, corners: 0, bbox: bb };

    // trim overshoot: kid passes the start point again
    const tail = Math.floor(pts.length * 0.7);
    let best = pts.length - 1, bestD = dist(pts[pts.length - 1], pts[0]);
    for (let i = tail; i < pts.length; i++) { const d = dist(pts[i], pts[0]); if (d < bestD) { bestD = d; best = i; } }
    if (bestD < diag * 0.12) pts = pts.slice(0, best + 1);

    const gap = dist(pts[0], pts[pts.length - 1]);
    const closed = gap < diag * 0.2;
    if (!closed) return { kind: 'open', closed: false, corners: 0, bbox: bb, gap, diag };

    const loop = pts.concat([pts[0]]);
    const N = 64, rs = resample(loop, N + 1).slice(0, N), k = 3;
    const turn = [];
    for (let i = 0; i < N; i++) {
      const a = rs[(i - k + N) % N], b = rs[i], c = rs[(i + k) % N];
      const v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - b[0], c[1] - b[1]];
      const m = Math.hypot(...v1) * Math.hypot(...v2) || 1;
      let cos = (v1[0] * v2[0] + v1[1] * v2[1]) / m;
      cos = Math.max(-1, Math.min(1, cos));
      turn.push(Math.acos(cos) * 180 / Math.PI);
    }
    // corners = strong local maxima
    const cornersIdx = [];
    for (let i = 0; i < N; i++) {
      if (turn[i] < 45) continue;
      let isMax = true;
      for (let j = -4; j <= 4; j++) {
        if (j === 0) continue;
        const t = turn[(i + j + N) % N];
        if (t > turn[i] || (t === turn[i] && j < 0)) { isMax = false; break; }
      }
      if (isMax) cornersIdx.push(i);
    }
    const straight = turn.filter(t => t < 11).length / N;
    const aspect = Math.min(bb.w, bb.h) / Math.max(bb.w, bb.h);
    const C = cornersIdx.length;

    let kind;
    if (C >= 3 && straight >= 0.35) kind = 'polygon';
    else kind = aspect >= 0.75 ? 'circle' : 'ellipse';

    return {
      kind, closed: true, corners: kind === 'polygon' ? C : 0, sides: kind === 'polygon' ? C : 0,
      aspect, straight, bbox: bb, cornerPts: cornersIdx.map(i => rs[i]), diag
    };
  }

  /** Trace check: how well the drawing follows the dashed outline */
  function traceScore(strokes, outline, tol) {
    let pts = []; strokes.forEach(s => { pts = pts.concat(s); });
    if (pts.length < 8) return { coverage: 0, precision: 0 };
    const covered = outline.filter(o => pts.some(p => dist(p, o) < tol)).length / outline.length;
    const precise = pts.filter(p => outline.some(o => dist(p, o) < tol * 1.8)).length / pts.length;
    return { coverage: covered, precision: precise };
  }

  /** sample the outline of a polygon/circle at n points */
  function outlinePoints(shape, cx, cy, w, h, n) {
    n = n || 72;
    if (shape === 'circle' || shape === 'ellipse') {
      return Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * w / 2, cy + Math.sin(a) * h / 2]; });
    }
    const v = window.SD.localPoints(shape, w, h).map(([x, y]) => [cx + x, cy + y]);
    const loop = v.concat([v[0]]);
    return resample(loop, n + 1).slice(0, n);
  }

  window.SD = window.SD || {};
  Object.assign(window.SD, { recognize, traceScore, outlinePoints, bboxOf: bbox, dist });
})();
