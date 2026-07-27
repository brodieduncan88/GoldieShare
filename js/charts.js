/* ============================================================
   Small hand-rolled SVG chart set.
   Every chart animates when an ancestor gains `.in`.
   ============================================================ */

const S = { sage: '#5f9e86', clay: '#d1674f', amber: '#e0a04e', violet: '#8b7ae8', peri: '#9aa8ff' };
export const PALETTE = S;

const pathLen = pts => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
const round = (n, d = 1) => Number(n.toFixed(d));

/* ---------- line + area: sleep quality by day ---------- */
export function lineChart({ data, labels, w = 460, h = 190, max = 10, color = S.sage, pad = 26, valueLabels = true }) {
  const iw = w - pad * 2, ih = h - 46;
  const X = i => pad + (iw * i) / (data.length - 1);
  const Y = v => 14 + ih - (v / max) * ih;
  const pts = data.map((v, i) => [X(i), Y(v)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + round(p[0]) + ' ' + round(p[1])).join(' ');
  const area = `${d} L${round(X(data.length - 1))} ${14 + ih} L${round(X(0))} ${14 + ih} Z`;
  const len = Math.ceil(pathLen(pts));
  const grid = [0, .5, 1].map(g => `<line class="ax" x1="${pad}" x2="${w - pad}" y1="${14 + ih - g * ih}" y2="${14 + ih - g * ih}"/>`).join('');
  const gid = 'lg' + Math.random().toString(36).slice(2, 8);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Sleep quality by day of week">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}
    <path class="c-area" d="${area}" fill="url(#${gid})"/>
    <path class="c-line" style="--len:${len}" d="${d}" stroke="${color}"/>
    ${pts.map((p, i) => `<circle class="c-pt" cx="${round(p[0])}" cy="${round(p[1])}" fill="${color}" style="transition-delay:${600 + i * 90}ms"/>`).join('')}
    ${valueLabels ? pts.map((p, i) => `<text class="val c-dot" x="${round(p[0])}" y="${round(p[1]) - 11}" text-anchor="middle" style="transition-delay:${700 + i * 90}ms">${data[i]}</text>`).join('') : ''}
    ${labels.map((l, i) => `<text x="${round(X(i))}" y="${h - 8}" text-anchor="middle">${l}</text>`).join('')}
  </svg>`;
}

/* ---------- scatter + trend: dinner time vs sleep score ---------- */
export function scatterChart({ points, w = 460, h = 200, pad = 34 }) {
  const iw = w - pad * 2, ih = h - 48;
  const t0 = 17.5, t1 = 22;
  const X = t => pad + ((t - t0) / (t1 - t0)) * iw;
  const Y = v => 12 + ih - (v / 10) * ih;
  /* least squares */
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.t, 0) / n, my = points.reduce((a, p) => a + p.s, 0) / n;
  const b = points.reduce((a, p) => a + (p.t - mx) * (p.s - my), 0) / points.reduce((a, p) => a + (p.t - mx) ** 2, 0);
  const a0 = my - b * mx;
  const ticks = [18, 19, 20, 21, 22];
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Dinner time plotted against sleep score">
    ${[0, .5, 1].map(g => `<line class="ax" x1="${pad}" x2="${w - pad}" y1="${12 + ih - g * ih}" y2="${12 + ih - g * ih}"/>`).join('')}
    <line class="c-trend" x1="${round(X(18.3))}" y1="${round(Y(a0 + b * 18.3))}" x2="${round(X(21.5))}" y2="${round(Y(a0 + b * 21.5))}"/>
    ${points.map((p, i) => `<circle class="c-dot" cx="${round(X(p.t))}" cy="${round(Y(p.s))}" r="5.2"
       fill="${p.s >= 7 ? S.sage : p.s <= 5 ? S.clay : S.amber}" fill-opacity=".85"
       style="transition-delay:${120 + i * 55}ms"><title>Dinner ${fmt(p.t)} · slept ${p.s}/10</title></circle>`).join('')}
    ${ticks.map(t => `<text x="${round(X(t))}" y="${h - 8}" text-anchor="middle">${fmt(t)}</text>`).join('')}
    <text x="${pad - 8}" y="${12 + 4}" text-anchor="end">10</text>
    <text x="${pad - 8}" y="${12 + ih / 2 + 4}" text-anchor="end">5</text>
    <text x="${pad - 8}" y="${12 + ih + 4}" text-anchor="end">0</text>
  </svg>`;
}
const fmt = t => { const h = Math.floor(t), m = Math.round((t - h) * 60); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`; };

/* ---------- horizontal bars: foods vs sleep ---------- */
export function barsH({ items, w = 460, max = 10, color = S.sage, rowH = 34, pad = 0 }) {
  const h = items.length * rowH + 8;
  const labelW = 112, barW = w - labelW - 46;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Average sleep score by food">
    ${items.map((it, i) => {
    const y = i * rowH + 6, bw = Math.max(4, (it.v / max) * barW);
    const c = it.color || color;
    return `<g>
        <text x="0" y="${y + 15}" dominant-baseline="middle">${it.n}</text>
        <rect x="${labelW}" y="${y + 5}" width="${barW}" height="18" rx="9" fill="currentColor" opacity=".07"/>
        <rect class="c-bar" x="${labelW}" y="${y + 5}" width="${round(bw)}" height="18" rx="9" fill="${c}" fill-opacity=".85"
          style="transform-origin:${labelW}px center;transition-delay:${i * 110}ms"/>
        <text class="val" x="${w - 2}" y="${y + 15}" text-anchor="end" dominant-baseline="middle">${it.label ?? it.v}</text>
        ${it.sub ? `<text x="${labelW + 10}" y="${y + 15}" dominant-baseline="middle" fill="#fff" opacity=".85" style="font-size:8.5px">${it.sub}</text>` : ''}
      </g>`;
  }).join('')}
  </svg>`;
}

/* ---------- vertical bars ---------- */
export function barsV({ data, labels, w = 460, h = 170, max = 10, colorFn }) {
  const pad = 16, iw = w - pad * 2, bw = Math.min(38, (iw / data.length) * .56);
  const ih = h - 40;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Values by day">
    ${data.map((v, i) => {
    const x = pad + (iw * (i + .5)) / data.length - bw / 2;
    const bh = (v / max) * ih;
    return `<g>
      ${v ? `<rect class="c-vbar" x="${round(x)}" y="${round(12 + ih - bh)}" width="${round(bw)}" height="${round(bh)}" rx="6"
        fill="${colorFn ? colorFn(v, i) : S.amber}" fill-opacity=".85" style="transition-delay:${i * 90}ms;transform-origin:center ${12 + ih}px"/>`
      : `<circle class="c-dot" cx="${round(x + bw / 2)}" cy="${12 + ih - 4}" r="2.6" fill="currentColor" opacity=".22" style="transition-delay:${i * 90}ms"/>`}
      <text class="val c-dot" x="${round(x + bw / 2)}" y="${round(12 + ih - bh - 8)}" text-anchor="middle" opacity="${v ? 1 : .35}" style="transition-delay:${400 + i * 90}ms">${v || '—'}</text>
      <text x="${round(x + bw / 2)}" y="${h - 8}" text-anchor="middle">${labels[i]}</text>
    </g>`;
  }).join('')}
  </svg>`;
}

/* ---------- stacked evening drinks ---------- */
export function stackChart({ days, series, w = 460, h = 176 }) {
  const pad = 16, iw = w - pad * 2, ih = h - 42, bw = Math.min(34, (iw / days.length) * .5);
  const maxTotal = Math.max(...days.map(d => d.reduce((a, b) => a + b, 0)), 1);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evening drinks logged each day">
    ${days.map((d, i) => {
    const x = pad + (iw * (i + .5)) / days.length - bw / 2;
    let acc = 0;
    return d.map((v, j) => {
      if (!v) return '';
      const bh = (v / maxTotal) * ih;
      const y = 12 + ih - acc - bh; acc += bh;
      return `<rect class="c-vbar" x="${round(x)}" y="${round(y)}" width="${round(bw)}" height="${round(bh - 2)}" rx="4"
        fill="${series[j].c}" fill-opacity=".88" style="transition-delay:${i * 80 + j * 40}ms;transform-origin:center ${12 + ih}px"><title>${series[j].n} — ${v}</title></rect>`;
    }).join('');
  }).join('')}
    ${days.map((_, i) => `<text x="${round(pad + (iw * (i + .5)) / days.length)}" y="${h - 8}" text-anchor="middle">${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</text>`).join('')}
  </svg>`;
}

/* ---------- ring ---------- */
export function ring({ pct, label, sub, color = S.violet, size = 148 }) {
  const r = size / 2 - 12, c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" style="max-width:${size}px;margin-inline:auto" role="img" aria-label="${label} ${pct} percent">
    <g transform="rotate(-90 ${size / 2} ${size / 2})">
      <circle class="c-ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
      <circle class="c-ring" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}"
        style="--len:${round(c, 2)};--off:${round(off, 2)}"/>
    </g>
    <text x="${size / 2}" y="${size / 2 - 2}" text-anchor="middle" class="val" style="font-size:26px;font-family:var(--f-display);font-weight:340">${pct}%</text>
    <text x="${size / 2}" y="${size / 2 + 16}" text-anchor="middle">${sub}</text>
  </svg>`;
}

/* ---------- arc gauge ---------- */
export function gauge({ v, max = 10, color = S.violet, w = 200 }) {
  const h = w * .58, cx = w / 2, cy = h - 6, r = w / 2 - 16;
  const a = Math.PI * (1 - v / max);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const c = Math.PI * r;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="Average vividness ${v} out of ${max}">
    <path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="currentColor" stroke-opacity=".16" stroke-width="9" stroke-linecap="round"/>
    <path class="c-ring" d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"
      style="--len:${round(c, 2)};--off:${round(c * (1 - v / max), 2)}"/>
    <circle class="c-dot" cx="${round(x)}" cy="${round(y)}" r="5.5" fill="${color}" style="transition-delay:1.4s"/>
  </svg>`;
}

/* ---------- count-up ---------- */
export function countUp(node, to, { dur = 1400, dp = 0, suffix = '' } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = to.toFixed(dp) + suffix; return; }
  const t0 = performance.now();
  const tick = t => {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    node.textContent = (to * e).toFixed(dp) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
