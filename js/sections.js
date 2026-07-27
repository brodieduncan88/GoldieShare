/* ============================================================
   Data sections — all figures are illustrative sample data.
   ============================================================ */
import { el, onView, animateIn } from './util.js';
import { lineChart, scatterChart, barsH, barsV, stackChart, ring, gauge, countUp, PALETTE as C } from './charts.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK = [7, 9, 8, 8, 4, 7, 9];                 /* avg 7.4 */
const DREAMT = [false, true, true, false, true, true, false]; /* 4 of 7 */
const VIVID = [0, 6, 8, 0, 7, 9, 0];
const DINNERS = [
  { t: 18.5, s: 9 }, { t: 18.75, s: 8 }, { t: 19.0, s: 8 }, { t: 19.25, s: 9 }, { t: 19.5, s: 8 },
  { t: 19.75, s: 7 }, { t: 20.0, s: 7 }, { t: 20.25, s: 6 }, { t: 20.5, s: 5 }, { t: 20.75, s: 5 },
  { t: 21.0, s: 6 }, { t: 21.25, s: 4 }
];

/* ============================================================
   evening timeline
   ============================================================ */
export function mountTimeline(node) {
  const box = el(`<div class="tl">
    <div class="tl__head"><h3>Tonight</h3><span>Wed 11 Mar</span></div>
    <div class="tl__list"></div>
    <div class="tl__foot"><span>Entries</span><span data-n>0</span></div>
  </div>`);
  node.appendChild(box);
  const list = box.querySelector('.tl__list');
  const n = box.querySelector('[data-n]');
  const empty = el(`<p class="tl__empty">Nothing logged yet. Photograph what you eat and drink.</p>`);
  list.appendChild(empty);
  let count = 0;
  return {
    add({ time, kind, foods }) {
      empty.remove();
      const item = el(`<div class="tl__item">
        <div class="tl__t">${time}</div><div class="tl__n">${kind}</div><div class="tl__f">${foods.join(' &nbsp;·&nbsp; ')}</div>
      </div>`);
      list.appendChild(item);
      requestAnimationFrame(() => item.classList.add('on'));
      n.textContent = ++count;
    },
    reset() { list.innerHTML = ''; list.appendChild(empty); count = 0; n.textContent = '0'; }
  };
}

/* ============================================================
   correlations
   ============================================================ */
const CORR = [
  {
    n: 'Garlic', evenings: 12, total: 30, stat: '8.2', unit: '/10', lbl: 'average sleep score',
    bar: 82, color: C.sage, dir: 'up', tag: 'Possible positive correlation',
    note: 'Detected in 12 of your last 30 evenings. Your average across all nights is 7.1.'
  },
  {
    n: 'Coffee after 8 PM', evenings: 9, total: 30, stat: '4.9', unit: '/10', lbl: 'average sleep score',
    bar: 49, color: C.clay, dir: 'down', tag: 'Possible negative correlation',
    note: 'Nine evenings with caffeine logged after 8 PM. Earlier coffee shows no similar association in your log.'
  },
  {
    n: 'Chocolate', evenings: 14, total: 30, stat: '+23', unit: '%', lbl: 'dream vividness',
    bar: 68, color: C.violet, dir: 'neu', tag: 'Associated with more vivid dreams',
    note: 'Vividness averaged 8.1 on chocolate evenings against 6.6 on the rest. Sleep scores were unchanged.'
  },
  {
    n: 'Alcohol', evenings: 6, total: 30, stat: '5.1', unit: '/10', lbl: 'average sleep score',
    bar: 51, color: C.clay, dir: 'down', tag: 'Possible negative correlation',
    note: 'Only six evenings so far — treat this as an early signal, not a conclusion.'
  }
];

export function mountCorrelations(node) {
  const grid = el(`<div class="corr"></div>`);
  CORR.forEach((c, i) => {
    /* deterministic, evenly spread selection of "detected" nights, then scrambled
       so the grid reads as scattered rather than striped */
    const hits = new Set();
    for (let d = 0; d < c.total; d++) {
      if ((d * c.evenings) % c.total < c.evenings) hits.add((d * 7 + i * 5) % c.total);
    }
    const dots = [...Array(c.total)].map((_, d) =>
      `<i class="${hits.has(d) ? 'hit' : ''}" style="transition-delay:${d * 16}ms"></i>`).join('');
    const arrow = c.dir === 'up' ? '↑' : c.dir === 'down' ? '↓' : '◈';
    const card = el(`<article class="card corr__c reveal">
      <h3>${c.n}</h3>
      <div class="corr__n">${c.evenings} evenings detected · last ${c.total} nights</div>
      <div class="corr__nights" aria-hidden="true">${dots}</div>
      <div class="corr__stat"><span class="corr__v" style="color:${c.color}">${c.stat}<small>${c.unit}</small></span>
        <span class="corr__lbl">${c.lbl}</span></div>
      <div class="corr__bar"><span data-w="${c.bar}" style="background:${c.color}"></span></div>
      <div class="corr__tag ${c.dir}">${arrow} ${c.tag}</div>
      <p class="corr__note">${c.note}</p>
    </article>`);
    grid.appendChild(card);
    animateIn(card, { threshold: .2 });
    onView(card, () => { card.querySelector('.corr__bar span').style.width = c.bar + '%'; }, { threshold: .2 });
  });
  node.appendChild(grid);
}

/* ============================================================
   weekly report
   ============================================================ */
export function mountReport(node) {
  const rep = el(`<div class="rep reveal">
    <div class="rep__bar"><span class="rep__dots"><i></i><i></i><i></i></span><b>Weekly Report</b><span>· 5–11 March</span></div>
    <div class="rep__gen">
      <p data-gen>Analysing 7 nights…</p>
      <div class="rep__prog"><span></span></div>
    </div>
    <div class="rep__body"></div>
  </div>`);
  node.appendChild(rep);

  const body = rep.querySelector('.rep__body');
  body.innerHTML = `
    <div class="rep__stats">
      ${statCard('Average sleep quality', '7.4', '/10', 'Across 7 rated nights')}
      ${statCard('Best night', '9', '/10', 'Tuesday · dinner 6:50 PM')}
      ${statCard('Lowest night', '4', '/10', 'Friday · coffee 9:40 PM, wine 10 PM')}
      ${statCard('Dream nights', '4', '/7', 'Average vividness 7.5')}
    </div>

    <h3 class="rep__sub">Sleep across the week</h3>
    <div class="rep__grid">
      <div class="card g4"><div class="card__t">Sleep quality by day<span>0–10</span></div>
        ${lineChart({ data: WEEK, labels: DAYS })}</div>
      <div class="card g2"><div class="card__t">Dream frequency</div>
        ${ring({ pct: 57, label: 'Dream frequency', sub: 'of nights', color: C.violet })}
        <div class="dnights">${DAYS.map((d, i) => `<div class="${DREAMT[i] ? 'dreamt' : ''}" style="transition-delay:${i * 60}ms">${d[0]}</div>`).join('')}</div>
      </div>
      <div class="card g3"><div class="card__t">Dinner time vs sleep score<span>last 12 nights</span></div>
        ${scatterChart({ points: DINNERS })}
        <p class="card__sub">Later dinners line up with lower scores in your log. The trend line is descriptive, not predictive.</p></div>
      <div class="card g3"><div class="card__t">Dream vividness by night<span>0 = no dream recalled</span></div>
        ${barsV({ data: VIVID, labels: DAYS, colorFn: v => v ? C.violet : 'currentColor' })}</div>
      <div class="card g3"><div class="card__t">Foods on your higher-scoring nights</div>
        ${barsH({
    items: [
      { n: 'Dinner before 7:30', v: 8.4, color: C.sage }, { n: 'Garlic', v: 8.2, color: C.sage },
      { n: 'Oily fish', v: 8.0, color: C.sage }, { n: 'Leafy greens', v: 7.9, color: C.sage },
      { n: 'Herbal tea', v: 7.8, color: C.sage }]
  })}
        <p class="card__sub">Average sleep score on evenings where each was detected.</p></div>
      <div class="card g3"><div class="card__t">Foods on your lower-scoring nights</div>
        ${barsH({
    items: [
      { n: 'Coffee after 8 PM', v: 4.9, color: C.clay }, { n: 'Alcohol', v: 5.1, color: C.clay },
      { n: 'Large late dinner', v: 5.4, color: C.clay }, { n: 'Spicy food', v: 5.6, color: C.clay },
      { n: 'Sugary dessert', v: 6.2, color: C.amber }]
  })}
        <p class="card__sub">Same scale. Neither list implies cause.</p></div>
      <div class="card g6"><div class="card__t">Evening drinks logged<span>after 6 PM</span></div>
        ${stackChart({
    days: [[0, 0, 1], [0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1]],
    series: [{ n: 'Coffee', c: C.clay }, { n: 'Alcohol', c: C.amber }, { n: 'Herbal tea', c: C.sage }]
  })}
        <div class="legend"><span><i style="background:${C.clay}"></i>Coffee</span><span><i style="background:${C.amber}"></i>Alcohol</span><span><i style="background:${C.sage}"></i>Herbal tea</span></div>
      </div>
    </div>

    <h3 class="rep__sub">Your strongest patterns</h3>
    <div class="rep__ins">
      ${insCard('Timing', 'Coffee after 8 PM', 'Your sleep scores were <b>27% lower</b> on evenings where coffee was detected after 8 PM, compared with your own average. Nine evenings so far.')}
      ${insCard('Rhythm', 'Earlier dinners', 'Your three highest-rated nights this month all followed dinners logged <b>before 7:30 PM</b>.')}
      ${insCard('Dreams', 'Chocolate &amp; dreams', 'Dream vividness was <b>higher</b> on nights where chocolate was detected — 8.1 against 6.6 on other nights.')}
    </div>
    <p class="disclaimer" style="margin-top:26px">These are correlations found in your own log over a short period. They can be coincidence, and many other factors affect sleep. Nocturne does not diagnose any condition.</p>`;

  /* the report "generates" when it scrolls into view */
  onView(rep, () => {
    const prog = rep.querySelector('.rep__prog span'), txt = rep.querySelector('[data-gen]');
    const stages = ['Analysing 7 nights…', 'Matching 34 logged items…', 'Testing 12 recurring patterns…', 'Writing your report…'];
    let p = 0, si = 0;
    const t = setInterval(() => {
      p += 3 + Math.random() * 5;
      prog.style.width = Math.min(100, p) + '%';
      const ns = Math.min(stages.length - 1, Math.floor(p / 26));
      if (ns !== si) { si = ns; txt.textContent = stages[si]; }
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => {
          rep.classList.add('done');
          rep.querySelectorAll('.card').forEach(c => animateIn(c, { threshold: .12 }));
          rep.querySelectorAll('[data-count]').forEach(n => {
            onView(n, x => countUp(x, +x.dataset.count, { dp: x.dataset.dp | 0 }), { threshold: .4 });
          });
        }, 420);
      }
    }, 90);
  }, { threshold: .3 });
}

const statCard = (t, v, u, sub) => `<div class="card">
  <div class="card__t">${t}</div>
  <div class="card__big"><span data-count="${v}" data-dp="${v.includes('.') ? 1 : 0}">0</span><small>${u}</small></div>
  <div class="card__sub">${sub}</div></div>`;

const insCard = (k, t, p) => `<article class="card ins"><span class="ins__k">${k}</span><h3>${t}</h3><p>${p}</p></article>`;

/* ============================================================
   dream dashboard
   ============================================================ */
export function mountDreams(node) {
  const box = el(`<div class="dream">
    <div class="card d3"><div class="card__t">Dream frequency</div>
      ${ring({ pct: 57, label: 'Dream frequency', sub: 'of nights', color: C.violet })}
      <p class="card__sub">17 of your last 30 nights included a remembered dream.</p></div>

    <div class="card d3"><div class="card__t">Average vividness</div>
      <div class="card__big" style="margin-bottom:10px"><span data-count="7.2" data-dp="1">0</span><small>/10</small></div>
      ${gauge({ v: 7.2 })}
      <p class="card__sub">Self-reported the morning after, on a 0–10 scale.</p></div>

    <div class="card d6" style="grid-column:span 6"><div class="card__t">Most common themes<span>from your own notes</span></div>
      <ul class="themes">
        <li>Travel <b>9</b></li><li>Water <b>7</b></li><li>People <b>6</b></li><li>Work <b>5</b></li>
        <li>Falling <b>3</b></li><li>Houses <b>3</b></li><li>Searching <b>2</b></li>
      </ul>
      <p class="card__sub" style="margin-top:18px">Themes are grouped from the words you write in “What do you remember?”. Nothing is inferred that you did not type.</p></div>

    <div class="card d7"><div class="card__t">Vividness across the week</div>
      ${barsV({ data: VIVID, labels: DAYS, colorFn: v => v ? C.violet : 'currentColor' })}
      <div class="dnights" style="margin-top:16px">${DAYS.map((d, i) => `<div class="${DREAMT[i] ? 'dreamt' : ''}" style="transition-delay:${i * 60}ms">${d[0]}</div>`).join('')}</div>
      <p class="card__sub">Filled squares are nights you recalled a dream.</p></div>

    <div class="card d5"><div class="card__t">Interesting pattern</div>
      <div class="pattern-note">
        <p>“On evenings when chocolate was logged, you reported vivid dreams more frequently.”</p>
        <small>14 chocolate evenings · dream recalled on 11 of them (79%) against 46% on other nights. This is an observed correlation in your own log — it is not evidence that chocolate causes dreams.</small>
      </div>
      <p class="card__sub" style="margin-top:20px">Dream recall is affected by when you wake, how you wake and whether you were asked. Nocturne asks every morning, which is itself likely to increase recall.</p></div>
  </div>`);
  node.appendChild(box);
  box.querySelectorAll('.card').forEach(c => animateIn(c, { threshold: .15 }));
  box.querySelectorAll('[data-count]').forEach(n => onView(n, x => countUp(x, +x.dataset.count, { dp: +x.dataset.dp }), { threshold: .4 }));
}

/* ============================================================
   no food diary — versus
   ============================================================ */
export function mountVersus(node) {
  const box = el(`<div class="vs reveal">
    <div class="vs__row">
      <div class="vs__col vs__col--old"><h4>What you are not doing</h4><ul>
        <li>Weighing portions</li><li>Searching a food database</li><li>Logging macros and calories</li>
        <li>Typing every ingredient</li><li>Hitting a daily target</li><li>Wearing anything to bed</li>
      </ul></div>
      <div class="vs__col vs__col--new"><h4>What you are doing</h4><ul>
        <li>One photo of dinner</li><li>One photo of anything after it</li><li>One number in the morning</li>
        <li>Yes or no to a dream</li><li>Correcting the AI when it slips</li><li>Nothing else</li>
      </ul></div>
    </div>
    <div class="vs__snap"><p>Roughly eight seconds a night.</p>
      <small>Two taps in the evening, one slider in the morning. That is the whole ritual.</small></div>
  </div>`);
  node.appendChild(box);
}

/* ============================================================
   growth: day 1 → 7 → 30 → 90
   ============================================================ */
const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
function field(n, clarity, seed = 7) {
  const r = rng(seed), W = 340, H = 210;
  let pts = '';
  for (let i = 0; i < n; i++) {
    const x = 26 + r() * (W - 52);
    /* later dinner (right) tracks with a lower score (further down) */
    const base = 46 + ((x - 26) / (W - 52)) * (H - 108);
    const noise = (r() - .5) * 150 * (1 - clarity);
    const y = Math.max(16, Math.min(H - 26, base + noise));
    const good = y < H / 2;
    pts += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.4 - clarity * .6).toFixed(1)}"
      fill="${good ? C.sage : C.clay}" fill-opacity="${(.35 + clarity * .5).toFixed(2)}"/>`;
  }
  const spread = 40 * (1 - clarity) + 12;
  const band = clarity > .3 ? `<path d="M26 ${46 - spread} L${W - 26} ${H - 62 - spread} L${W - 26} ${H - 62 + spread} L26 ${46 + spread} Z"
      fill="${C.amber}" fill-opacity="${(clarity * .13).toFixed(2)}"/>` : '';
  const line = clarity > .15 ? `<line x1="26" y1="46" x2="${W - 26}" y2="${H - 62}" stroke="${C.amber}"
      stroke-width="1.6" stroke-dasharray="5 5" opacity="${clarity.toFixed(2)}"/>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${n} nights plotted">
    <line class="ax" x1="26" y1="${H - 16}" x2="${W - 26}" y2="${H - 16}" stroke="currentColor" stroke-opacity=".12"/>
    <line class="ax" x1="26" y1="16" x2="26" y2="${H - 16}" stroke="currentColor" stroke-opacity=".12"/>
    ${band}${line}${pts}
    <text x="30" y="14" font-size="9" fill="currentColor" opacity=".45">Sleep score</text>
    <text x="${W - 26}" y="${H - 4}" font-size="9" text-anchor="end" fill="currentColor" opacity=".45">Dinner time →</text>
  </svg>`;
}

const STAGES = [
  { d: 'Day 1', n: 1, c: 0, conf: 4, h: 'One night is an anecdote.', p: 'You have logged a single evening. Nocturne shows you the timeline and says nothing else — because there is nothing honest to say yet.' },
  { d: 'Day 7', n: 7, c: .18, conf: 22, h: 'A week is a hunch.', p: 'Your first weekly report appears. Early tendencies are visible, flagged as tentative. Most of them will change.' },
  { d: 'Day 30', n: 30, c: .58, conf: 64, h: 'A month is a pattern.', p: 'Repeat foods now have enough evenings behind them to compare. The shape of your own week starts to hold still.' },
  { d: 'Day 90', n: 90, c: .92, conf: 91, h: 'A season is a portrait.', p: 'Seasonal habits, weekday and weekend rhythms, and the handful of items that consistently track with your best and worst nights.' }
];

export function mountGrowth(node) {
  const ui = el(`<div class="growth__ui reveal">
    <div class="growth__tabs" role="tablist">${STAGES.map((s, i) =>
    `<button role="tab" data-i="${i}" class="${i ? '' : 'on'}" aria-selected="${!i}"><b>${s.d}</b><span>${s.n} night${s.n > 1 ? 's' : ''}</span></button>`).join('')}</div>
    <div class="growth__panel">
      <div class="growth__field"></div>
      <div class="growth__txt">
        <h3></h3><p></p>
        <div class="growth__conf"><span>Pattern confidence</span><div class="growth__meter"><i style="width:0"></i></div></div>
      </div>
    </div>
  </div>`);
  node.appendChild(ui);
  const fieldBox = ui.querySelector('.growth__field'), h = ui.querySelector('h3'),
    p = ui.querySelector('p'), meter = ui.querySelector('.growth__meter i');
  let cur = -1, timer;
  const go = i => {
    if (i === cur) return;
    cur = i;
    const s = STAGES[i];
    ui.querySelectorAll('.growth__tabs button').forEach(b => {
      const on = +b.dataset.i === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    });
    fieldBox.style.opacity = '0';
    setTimeout(() => { fieldBox.innerHTML = field(s.n, s.c, 7 + i); fieldBox.style.opacity = '1'; }, 180);
    h.textContent = s.h; p.textContent = s.p; meter.style.width = s.conf + '%';
  };
  fieldBox.style.transition = 'opacity .35s ease';
  ui.querySelectorAll('.growth__tabs button').forEach(b =>
    b.addEventListener('click', () => { clearInterval(timer); go(+b.dataset.i); }));
  onView(ui, () => {
    go(0);
    let i = 0;
    timer = setInterval(() => { i++; if (i >= STAGES.length) { clearInterval(timer); return; } go(i); }, 2600);
  }, { threshold: .35 });
}

/* ============================================================
   your sleep is personal
   ============================================================ */
const RULES = [
  { r: '“Never drink coffee after 8 PM.”', v: 4.9, w: 49, c: C.clay, verdict: 'Holds up in your log', dir: 'down', n: '9 evenings' },
  { r: '“A nightcap helps you sleep.”', v: 5.1, w: 51, c: C.clay, verdict: 'Does not hold up in your log', dir: 'down', n: '6 evenings' },
  { r: '“Cheese gives you nightmares.”', v: 7.3, w: 73, c: C.amber, verdict: 'No difference in your log', dir: 'neu', n: '5 evenings' },
  { r: '“Eat dinner earlier.”', v: 8.4, w: 84, c: C.sage, verdict: 'Holds up in your log', dir: 'up', n: '11 evenings' }
];

export function mountPersonal(node) {
  const box = el(`<div class="card reveal">
    <div class="card__t">Common advice, checked against one person's nights<span>Your average: 7.1</span></div>
    ${RULES.map(x => `<div class="pers__row" style="flex-wrap:wrap;row-gap:8px">
      <div class="pers__who" style="width:100%;color:var(--fg);font-size:.92rem">${x.r}</div>
      <div class="pers__bar"><i data-w="${x.w}" style="background:${x.c};opacity:.8"></i></div>
      <div class="pers__v">${x.v}/10</div>
      <div style="width:100%;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <span class="corr__tag ${x.dir}" style="margin-top:0">${x.verdict}</span>
        <span style="font-size:.72rem;color:var(--fg-mute)">${x.n} logged</span>
      </div>
    </div>`).join('')}
    <p class="pers__note">Two of these matched the general advice. Two did not. That split is the entire argument: the only history that describes your sleep is your own.</p>
  </div>`);
  node.appendChild(box);
  onView(box, () => box.querySelectorAll('.pers__bar i').forEach(i => i.style.width = i.dataset.w + '%'), { threshold: .3 });
}
