/* ═══════════════════════════════════════════════════════════
   BO-BO DAILY COMET — แปลงตัวเลข/โจทย์เป็น "ลำดับคลิปเสียง"
   ไม่ต้อง gen เสียงต่อโจทย์: ต่อชิ้นส่วนเสียง (เลข ร้อย พัน ... บวก ลบ ...) ที่ gen ไว้แล้ว 49 คลิป
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const DC = root.DC = root.DC || {};

  const DIGIT = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'];
  const POS = ['', 'n_sip', 'n_roi', 'n_phan', 'n_muen', 'n_saen'];   // หลักหน่วย..แสน

  /* ข้อความไทยของแต่ละคลิป (ใช้เป็นเสียงสำรองเมื่อโหลดไฟล์ไม่ได้ และเป็นคำบรรยาย) */
  const TEXT = {
    n0: 'ศูนย์', n1: 'หนึ่ง', n2: 'สอง', n3: 'สาม', n4: 'สี่', n5: 'ห้า', n6: 'หก', n7: 'เจ็ด', n8: 'แปด', n9: 'เก้า',
    n_sip: 'สิบ', n_yisip: 'ยี่สิบ', n_et: 'เอ็ด', n_roi: 'ร้อย', n_phan: 'พัน', n_muen: 'หมื่น', n_saen: 'แสน', n_lan: 'ล้าน', n_jud: 'จุด',
    op_plus: 'บวก', op_minus: 'ลบ', op_times: 'คูณ', op_div: 'หาร', op_eq: 'เท่ากับ', op_rem: 'เหลือเศษ', op_frac: 'ส่วน', op_baht: 'บาท',
    q_equals: 'เท่ากับเท่าไหร่', q_missing: 'เลขที่หายไปคือเลขอะไร', q_greater: 'อันไหนมากกว่า', q_less: 'อันไหนน้อยกว่า',
    q_which: 'ข้อไหนถูกต้อง', a_is: 'คำตอบคือ'
  };

  /* อ่านจำนวนเต็ม 0 .. 999,999 */
  function below1M(n) {
    if (n === 0) return [];
    const ds = String(n).split('').map(Number);
    const L = ds.length;
    const out = [];
    for (let i = 0; i < L; i++) {
      const d = ds[i], p = L - 1 - i;
      if (d === 0) continue;
      if (p === 0) { out.push(d === 1 && L > 1 ? 'n_et' : DIGIT[d]); continue; }
      if (p === 1) { out.push(d === 1 ? 'n_sip' : d === 2 ? 'n_yisip' : DIGIT[d], ...(d > 2 ? ['n_sip'] : [])); continue; }
      out.push(DIGIT[d], POS[p]);
    }
    return out;
  }

  /* อ่านจำนวนเต็มใด ๆ (วนซ้ำเมื่อเกินล้าน) */
  function intClips(n) {
    n = Math.round(Math.abs(n));
    if (n === 0) return ['n0'];
    if (n >= 1000000) {
      const hi = Math.floor(n / 1000000), lo = n % 1000000;
      return intClips(hi).concat(['n_lan'], below1M(lo));
    }
    return below1M(n);
  }

  /* num: จำนวนเต็ม ทศนิยม (รับเลขหรือสตริง) → รายการ id คลิป */
  function num(x) {
    const s = String(x).replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return [];
    const parts = s.split('.');
    let out = intClips(parseInt(parts[0], 10));
    if (parts[1] != null) {
      out.push('n_jud');
      for (const ch of parts[1]) out.push(DIGIT[+ch]);
    }
    return out;
  }

  function frac(n, d) { return num(n).concat(['op_frac'], num(d)); }

  const OP = { '+': 'op_plus', '−': 'op_minus', '-': 'op_minus', '×': 'op_times', '÷': 'op_div', '=': 'op_eq' };

  /* tokens: เช่น ['7','+','5','=','?'] → "เจ็ด บวก ห้า เท่ากับ" + ถาม "เท่าไหร่" */
  function expr(tokens) {
    const out = [];
    for (const t of tokens) {
      if (OP[t]) out.push(OP[t]);
      else if (t === '?') continue;
      else if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); out.push(...frac(a, b)); }
      else out.push(...num(t));
    }
    return out;
  }

  function text(ids) { return ids.map(i => TEXT[i] || '').join(' '); }

  DC.NV = { num, frac, expr, text, TEXT, OP };
  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
})(typeof window !== 'undefined' ? window : globalThis);
