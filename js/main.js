/* ============================================================
   Nocturne — scroll engine, lighting, hero loop, wiring
   ============================================================ */
import { el, onView, animateIn } from './util.js';
import { Camera, Night, Morning, Seq, phone, statusBar, nightMarkup, insightMarkup, scoreColor, scoreWord, REDUCED } from './phone.js';
import { SUBJECTS, sceneFor, isPhoto } from './food.js';
import { mountTimeline, mountCorrelations, mountReport, mountDreams, mountVersus, mountGrowth, mountPersonal } from './sections.js';
import { mountDemo } from './demo.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ============================================================
   1. lighting — the page moves through evening → night → dawn → day
   ============================================================ */
function lighting() {
  const layers = {};
  $$('.sky__layer').forEach(l => layers[l.dataset.sky] = l);
  const secs = $$('[data-scene]').map(n => ({ n, scene: n.dataset.scene }));
  const measure = () => secs.forEach(s => {
    const r = s.n.getBoundingClientRect();
    s.top = r.top + scrollY; s.bot = s.top + r.height;
  });
  const SAMPLES = [[.08, .12], [.3, .2], [.5, .36], [.72, .2], [.92, .12]];
  let theme = '';

  const paint = () => {
    const w = { dusk: 0, night: 0, dawn: 0, day: 0 };
    let total = 0;
    for (const [f, weight] of SAMPLES) {
      const p = scrollY + innerHeight * f;
      const hit = secs.find(s => p >= s.top && p < s.bot) || (p < secs[0].top ? secs[0] : secs[secs.length - 1]);
      w[hit.scene] += weight; total += weight;
    }
    let best = 'dusk', bv = -1;
    for (const k in w) {
      const v = w[k] / total;
      layers[k].style.opacity = v.toFixed(3);
      if (v > bv) { bv = v; best = k; }
    }
    if (best !== theme) { theme = best; document.documentElement.dataset.theme = best; }
  };

  measure(); paint();
  addEventListener('resize', () => { measure(); paint(); }, { passive: true });
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; paint(); parallax(); });
  }, { passive: true });
  /* sections mount asynchronously and change page height */
  new ResizeObserver(() => { measure(); paint(); }).observe(document.body);
}

/* ============================================================
   2. parallax — restrained
   ============================================================ */
let pnodes = [];
function parallax() {
  if (REDUCED) return;
  const vc = innerHeight / 2;
  for (const { n, f } of pnodes) {
    const r = n.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;
    n.style.transform = `translate3d(0,${((r.top + r.height / 2 - vc) * -f).toFixed(2)}px,0)`;
  }
}

/* ============================================================
   3. nav
   ============================================================ */
function nav() {
  const bar = $('.nav');
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    bar.classList.toggle('is-stuck', y > 40);
    bar.classList.toggle('is-hidden', y > 320 && y > last + 4);
    last = y;
  }, { passive: true });
}

/* ============================================================
   4. reveals
   ============================================================ */
function reveals() {
  const groups = new Map();
  $$('.reveal').forEach(n => {
    const p = n.parentElement;
    if (!groups.has(p)) groups.set(p, 0);
    const i = groups.get(p); groups.set(p, i + 1);
    n.style.setProperty('--d', `${Math.min(i, 6) * 90}ms`);
    n.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    onView(n, x => x.classList.add('in'), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  });
  $$('.moment').forEach((m, i) => { m.style.transitionDelay = `${i * 110}ms`; });
}

/* ============================================================
   5. moment icons
   ============================================================ */
const ICONS = {
  camera: `<svg viewBox="0 0 48 40"><rect x="1" y="8" width="46" height="31" rx="6"/><path d="M16 8l3.4-6.2h9.2L32 8"/><circle cx="24" cy="23" r="9"/><circle cx="24" cy="23" r="3.6"/><circle cx="39" cy="15" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  moon: `<svg viewBox="0 0 48 40"><path d="M33 26.5A12.6 12.6 0 0 1 16.6 9.2 13.4 13.4 0 1 0 33 26.5Z" stroke-linejoin="round"/><circle cx="38" cy="9" r="1.3"/><circle cx="31" cy="4.5" r="1"/><circle cx="43" cy="16" r="1"/></svg>`,
  sun: `<svg viewBox="0 0 48 40"><circle cx="24" cy="26" r="8.4"/><path d="M24 10v-5M11.6 15.6 8 12M36.4 15.6 40 12M4 30h6M38 30h6"/><path d="M2 36h44"/></svg>`,
  chart: `<svg viewBox="0 0 48 40"><path d="M4 34h40"/><path d="M8 30V19M17 30V12M26 30v-8M35 30V6"/><path d="M8 19 17 12 26 22 35 6" stroke-dasharray="3 3" opacity=".55"/></svg>`
};
const icons = () => $$('[data-ico]').forEach(n => n.innerHTML = ICONS[n.dataset.ico] || '');

/* ============================================================
   6. hero loop
   ============================================================ */
const camMarkup = (key, mode, modes, time) => {
  const s = SUBJECTS[key];
  return `<div class="cam is-blur ${isPhoto(key) ? 'cam--photo' : ''}">
    <div class="cam__view"><div class="cam__scene">${sceneFor(key, true)}</div></div>
    <div class="cam__grid"></div><div class="cam__vig"></div><div class="cam__focus"></div>
    <div class="scan"><div class="scan__mesh"></div><div class="scan__beam"></div></div>
    <div class="dets"></div>${statusBar(time)}
    <div class="cam__top"><span class="cam__pill"><b>◉</b> Nocturne</span><span class="cam__pill">Auto</span></div>
    <div class="cam__bottom">
      <div class="cam__modes">${modes.map(m => m === mode ? `<b>${m}</b>` : `<span>${m}</span>`).join('')}</div>
      <button class="shutter" tabindex="-1" aria-hidden="true"><span class="shutter__ring"></span></button>
    </div>
    <div class="cam__flash"></div>
    <div class="sheet"><div class="sheet__tick"><svg viewBox="0 0 24 24"><path d="M4 12.6 9.2 18 20 6.6"/></svg></div>
      <h4>Dinner saved.</h4><div class="sheet__meta">Logged 7:14 PM · ${s.foods.length} items recognised</div>
      <div class="sheet__foods">${s.foods.map((f, i) => `<span style="transition-delay:${240 + i * 70}ms">${f}</span>`).join('')}</div></div>
  </div>`;
};

const heroScoreMarkup = () => `<div class="rate" style="padding-top:58px">
  <div class="rate__q">Sleep quality</div>
  <div class="rate__sub">Wednesday · logged at 7:02 AM</div>
  <div class="rate__num" data-hn>0<small>/10</small></div>
  <div class="rate__word" data-hw>—</div>
  <div class="slider" aria-hidden="true"><div class="slider__track"><div class="slider__fill" style="transition:width 1.6s cubic-bezier(.16,1,.3,1)"></div>
    <div class="slider__knob" style="transition:left 1.6s cubic-bezier(.16,1,.3,1)"></div></div>
    <div class="slider__ticks">${[...Array(11)].map((_, i) => `<span>${i}</span>`).join('')}</div></div>
  <div class="slider__ends"><span>0 · Terrible</span><span>10 · Amazing</span></div>
  <div class="rate__step" data-hd><div class="rate__div"></div>
    <div class="rate__q" style="font-size:1.05rem">Did you dream?</div>
    <div class="yn"><button class="sel" tabindex="-1">Yes</button><button tabindex="-1">No</button></div>
    <div class="rate__sub" style="margin-top:14px">Vividness 7/10 · “driving somewhere near water”</div>
  </div>
</div>`;

function heroLoop(mount) {
  const node = phone(`
    <div class="scr on" data-h="0">${camMarkup('pasta', 'Dinner', ['Dinner', 'Dessert', 'Drink'], '7:14')}</div>
    <div class="scr" data-h="1">${nightMarkup()}</div>
    <div class="scr" data-h="2">${alarmOnly()}</div>
    <div class="scr" data-h="3">${heroScoreMarkup()}</div>
    <div class="scr" data-h="4">${insightMarkup()}</div>`, 'phone--lg');
  mount.appendChild(node);

  const q = s => node.querySelector(s);
  const show = i => node.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', +s.dataset.h === i));
  const journey = $$('[data-journey] li');
  const mark = j => journey.forEach(l => l.classList.toggle('on', +l.dataset.j === j));
  const seq = new Seq();

  const resetCam = () => {
    q('.cam').classList.add('is-blur');
    q('.cam__focus').className = 'cam__focus';
    q('.scan').className = 'scan';
    q('.dets').innerHTML = '';
    q('.sheet').classList.remove('up');
    q('.cam__grid').style.opacity = '';
    q('.cam__scene').style.transform = '';
  };
  const resetNight = () => {
    q('.night-scr').classList.remove('deep');
    node.querySelectorAll('.logdone li').forEach(l => l.classList.remove('on'));
  };
  const resetScore = () => {
    q('[data-hn]').innerHTML = `0<small>/10</small>`;
    q('[data-hw]').textContent = '—';
    q('[data-h="3"] .slider__fill').style.width = '0%';
    q('[data-h="3"] .slider__knob').style.left = '0%';
    q('[data-hd]').classList.remove('on');
  };

  async function cycle(wait) {
    /* — dinner — */
    show(0); mark(0); resetCam(); resetNight(); resetScore();
    node.querySelectorAll('.ins-bar').forEach(b => b.style.width = '0');
    const f = q('.cam__focus');
    f.style.left = '50%'; f.style.top = '43%'; f.style.marginLeft = '-44px'; f.style.marginTop = '-44px';
    await wait(500); f.classList.add('on');
    await wait(520); q('.cam').classList.remove('is-blur'); f.classList.add('lock');
    await wait(950);
    const sh = q('.shutter'); sh.classList.add('press');
    await wait(170); sh.classList.remove('press'); f.classList.remove('on');
    const fl = q('.cam__flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    q('.cam__grid').style.opacity = '0'; q('.cam__scene').style.transform = 'scale(1)';
    await wait(420);

    /* — analysis — */
    mark(1);
    const scan = q('.scan'); scan.classList.add('on'); void scan.offsetWidth; scan.classList.add('go');
    await wait(650);
    const box = q('.dets');
    for (const d of SUBJECTS.pasta.dets) {
      box.appendChild(el(`<div class="det" data-side="${d.side}" style="left:${d.x}%;top:${d.y}%">
        <span class="det__line"></span><span class="det__dot"></span><span class="det__lbl">${d.label}</span></div>`));
      await wait(60);
      box.lastElementChild.classList.add('on');
      await wait(240);
    }
    await wait(420); scan.classList.remove('on');
    q('.sheet').classList.add('up');
    await wait(2200);

    /* — sleep — */
    mark(2); show(1);
    const li = [...node.querySelectorAll('.logdone li')];
    await wait(420);
    for (const l of li) { l.classList.add('on'); await wait(360); }
    await wait(800); q('.night-scr').classList.add('deep');
    await wait(2600);

    /* — morning — */
    mark(3); show(2);
    node.classList.add('shake');
    await wait(2400);
    node.classList.remove('shake');
    show(3);
    await wait(500);
    q('[data-h="3"] .slider__fill').style.width = '80%';
    q('[data-h="3"] .slider__knob').style.left = '80%';
    q('[data-h="3"] .slider__knob').style.setProperty('--k', scoreColor(8));
    const hn = q('[data-hn]'), hw = q('[data-hw]');
    for (let v = 0; v <= 8; v++) {
      hn.innerHTML = `${v}<small>/10</small>`; hn.style.color = scoreColor(v);
      hw.textContent = scoreWord(v); hw.style.color = scoreColor(v);
      await wait(150);
    }
    await wait(900); q('[data-hd]').classList.add('on');
    await wait(2400);

    /* — insights — */
    mark(4); show(4);
    await wait(180);
    node.querySelectorAll('.ins-bar').forEach(b => b.style.width = b.dataset.w + '%');
    await wait(4200);
  }

  const spin = () => seq.run(async wait => { for (;;) { await cycle(wait); } });
  /* run only while the hero is on screen */
  if ('IntersectionObserver' in window) {
    let live = false;
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !live) { live = true; spin(); }
      else if (!e.isIntersecting && live) { live = false; seq.cancel(); }
    }), { threshold: .12 }).observe(node);
  } else spin();
}

const alarmOnly = () => `<div class="alarm">
  <div class="alarm__sun"></div>
  <div class="alarm__waves" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="alarm__body">
    <div class="alarm__label">Alarm · Wake</div>
    <div class="alarm__time">7:00<sup>AM</sup></div>
    <div class="alarm__date">Wednesday, 12 March</div>
  </div>
  <div class="alarm__actions">
    <button class="bigbtn" tabindex="-1" aria-hidden="true">Stop</button>
    <button class="bigbtn bigbtn--soft" tabindex="-1" aria-hidden="true">Snooze 9 minutes</button>
  </div>
</div>`;

/* ============================================================
   7. section demos
   ============================================================ */
const setMode = (cam, mode, modes = ['Dinner', 'Dessert', 'Drink']) => {
  cam.node.querySelector('.cam__modes').innerHTML =
    modes.map(m => m === mode ? `<b>${m}</b>` : `<span>${m}</span>`).join('');
};

function dinnerDemo(mount) {
  const cam = new Camera(mount, {
    subject: 'pasta', mode: 'Dinner', clock: '7:14',
    savedMeta: 'Logged 7:14 PM · 6 items recognised'
  });
  const replay = el(`<button class="btn btn--ghost btn--sm" style="margin-top:22px">Replay the capture</button>`);
  mount.appendChild(replay);
  mount.style.display = 'flex'; mount.style.flexDirection = 'column'; mount.style.alignItems = 'center';
  const run = () => { cam.reset(); cam.arm().then(() => cam.autoCapture(400)); };
  replay.addEventListener('click', run);
  onView(mount, run, { threshold: .35 });
}

function eveningDemo(camMount, tlMount) {
  const tl = mountTimeline(tlMount);
  const cam = new Camera(camMount, { subject: 'dessert', mode: 'Dessert', clock: '8:42' });
  const seq = new Seq();
  const run = () => seq.run(async wait => {
    tl.reset();
    tl.add({ time: '7:14 PM', kind: 'Dinner', foods: ['Penne', 'Chicken', 'Aubergine', 'Tomato'] });
    await wait(700);

    /* dessert */
    cam.reset(); cam.setSubject('dessert'); setMode(cam, 'Dessert');
    cam.node.querySelector('.sbar span').textContent = '8:42';
    Object.assign(cam.o, { subject: 'dessert', savedTitle: 'Dessert saved.', savedMeta: 'Logged 8:42 PM · 1 item recognised', foods: null });
    await cam.arm(); await wait(200); await cam.autoCapture(300);
    await wait(4200);
    tl.add({ time: '8:42 PM', kind: 'Dessert', foods: ['Chocolate ice cream'] });
    await wait(2000);

    /* drink */
    cam.reset(); cam.setSubject('coffee'); setMode(cam, 'Drink');
    cam.node.querySelector('.sbar span').textContent = '9:18';
    Object.assign(cam.o, { subject: 'coffee', savedTitle: 'Drink saved.', savedMeta: 'Logged 9:18 PM · caffeine flagged', foods: ['Coffee', 'Caffeine'] });
    await cam.arm(); await wait(200); await cam.autoCapture(300);
    await wait(4200);
    tl.add({ time: '9:18 PM', kind: 'Drink', foods: ['Coffee'] });
  });
  onView(camMount, run, { threshold: .3 });
}

function nightDemo(mount) {
  const n = new Night(mount);
  onView(mount, () => { n.reset(); n.run(); }, { threshold: .35 });
}

function morningDemo(mount) {
  const m = new Morning(mount, {});
  onView(mount, () => m.ring(), { threshold: .35 });
  return m;
}

/* ============================================================
   8. boot
   ============================================================ */
function boot() {
  document.querySelectorAll('[data-year]').forEach(n => n.textContent = new Date().getFullYear());
  icons();
  nav();

  const heroMount = $('[data-mount="hero-phone"]');
  if (heroMount) heroLoop(heroMount);

  const d = $('[data-mount="camera-dinner"]'); if (d) dinnerDemo(d);
  const ce = $('[data-mount="camera-evening"]'), tl = $('[data-mount="timeline"]');
  if (ce && tl) eveningDemo(ce, tl);
  const np = $('[data-mount="night-phone"]'); if (np) nightDemo(np);
  const mp = $('[data-mount="morning-phone"]'); if (mp) morningDemo(mp);

  const dd = $('[data-mount="dream-dash"]'); if (dd) mountDreams(dd);
  const co = $('[data-mount="correlations"]'); if (co) mountCorrelations(co);
  const rp = $('[data-mount="report"]'); if (rp) mountReport(rp);
  const vs = $('[data-mount="versus"]'); if (vs) mountVersus(vs);
  const gr = $('[data-mount="growth"]'); if (gr) mountGrowth(gr);
  const pe = $('[data-mount="personal"]'); if (pe) mountPersonal(pe);
  const dm = $('[data-mount="demo"]'); if (dm) mountDemo(dm);

  /* every .reveal exists by now — including the ones the sections just mounted */
  reveals();

  pnodes = [
    { n: $('.hero__stage'), f: .05 },
    ...$$('.chapter__stage').map(n => ({ n, f: .035 }))
  ].filter(x => x.n);

  lighting();
  parallax();
  requestAnimationFrame(() => $$('.reveal').forEach(n => {
    const r = n.getBoundingClientRect();
    if (r.top < innerHeight * .92) n.classList.add('in');
  }));
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();
