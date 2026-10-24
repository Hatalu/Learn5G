// Text with stacked fractions ("3/4", "2 1/3") for canvas boards and HTML.
const FRAC = /(\d+)\/(\d+)/g;

function tokens(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(FRAC)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ n: m[1], d: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}

export function drawRich(g, text, cx, cy, maxW, size, family) {
  const toks = tokens(text);
  const hasFrac = toks.some((k) => k.n);
  const measure = (s) => {
    let w = 0;
    for (const k of toks) {
      if (k.t) { g.font = `600 ${s}px ${family}`; w += g.measureText(k.t).width; }
      else { g.font = `700 ${s * 0.62}px ${family}`; w += Math.max(g.measureText(k.n).width, g.measureText(k.d).width) + s * 0.25; }
    }
    return w;
  };
  let s = hasFrac ? size * 1.05 : size;
  while (s > 24 && measure(s) > maxW) s -= 3;
  let x = cx - measure(s) / 2;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  for (const k of toks) {
    if (k.t) {
      g.font = `600 ${s}px ${family}`;
      g.fillText(k.t, x, cy);
      x += g.measureText(k.t).width;
    } else {
      g.font = `700 ${s * 0.62}px ${family}`;
      const w = Math.max(g.measureText(k.n).width, g.measureText(k.d).width) + s * 0.12;
      g.textAlign = 'center';
      g.fillText(k.n, x + w / 2 + s * 0.06, cy - s * 0.36);
      g.fillText(k.d, x + w / 2 + s * 0.06, cy + s * 0.4);
      g.fillRect(x + s * 0.06, cy - s * 0.035, w, Math.max(3, s * 0.06));
      g.textAlign = 'left';
      x += w + s * 0.25;
    }
  }
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function richHTML(text) {
  return tokens(String(text)).map((k) => (k.t ? esc(k.t) : `<span class="frac"><b>${k.n}</b><i>${k.d}</i></span>`)).join('');
}
