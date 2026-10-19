/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — ตัวสุ่มแบบกำหนด seed (วันเดียวกัน = โจทย์ชุดเดียวกัน)
   ใช้ได้ทั้งในเบราว์เซอร์และ Node (สำหรับ tools/test-gen.js)
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};

  /* แฮชข้อความเป็นเลข 32 บิต (xmur3) */
  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function Rng(seed) {
    if (typeof seed === 'string') seed = hash(seed);
    this.s = (seed >>> 0) || 1;
  }
  Rng.prototype.next = function () {          // mulberry32
    let t = (this.s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Rng.prototype.int = function (lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); };
  Rng.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  Rng.prototype.chance = function (p) { return this.next() < p; };
  Rng.prototype.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  Rng.prototype.fork = function (tag) { return new Rng(hash(this.s + ':' + tag)); };

  /* วันที่ท้องถิ่นแบบ YYYYMMDD และลำดับวัน (นับจากวันที่ 1 ม.ค. 2025) */
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function dayIndex(d) {
    d = d || new Date();
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2025, 0, 1)) / 86400000);
  }

  DC.hash = hash; DC.Rng = Rng; DC.dayKey = dayKey; DC.dayIndex = dayIndex;
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
