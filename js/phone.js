/* ============================================================
   Phone hardware + the four screens: camera, night, alarm, rating
   ============================================================ */
import { SUBJECTS } from './food.js';

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- cancellable sequencer ---------- */
export class Seq {
  constructor() { this.gen = 0; }
  cancel() { this.gen++; }
  run(fn) {
    const g = ++this.gen;
    const wait = ms => new Promise(r => setTimeout(r, REDUCED ? Math.min(ms, 120) : ms))
      .then(() => { if (g !== this.gen) throw 'abort'; });
    return Promise.resolve(fn(wait)).catch(e => { if (e !== 'abort') throw e; });
  }
}

const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

export function phone(inner, cls = '') {
  return el(`<div class="phone ${cls}">
    <div class="phone__btn phone__btn--v1"></div><div class="phone__btn phone__btn--v2"></div><div class="phone__btn phone__btn--p"></div>
    <div class="phone__frame"><div class="phone__screen">
      <div class="phone__notch"></div>${inner}<div class="phone__gloss"></div>
    </div></div>
  </div>`);
}

export const statusBar = (t = '7:14') => `<div class="sbar"><span>${t}</span>
  <span class="sbar__r"><svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor"><rect x="0" y="7" width="2.6" height="3" rx=".8"/><rect x="4" y="5" width="2.6" height="5" rx=".8"/><rect x="8" y="2.6" width="2.6" height="7.4" rx=".8"/><rect x="12" y="0" width="2.6" height="10" rx=".8"/></svg><i></i></span></div>`;

/* ============================================================
   CAMERA
   ============================================================ */
const camMarkup = (key, { mode = 'Dinner', modes = ['Dinner', 'Dessert', 'Drink'], time = '7:14' } = {}) => {
  const s = SUBJECTS[key];
  return `<div class="cam is-blur">
    <div class="cam__view"><div class="cam__scene">${s.svg()}</div></div>
    <div class="cam__grid"></div><div class="cam__vig"></div>
    <div class="cam__focus"></div>
    <div class="scan"><div class="scan__mesh"></div><div class="scan__beam"></div></div>
    <div class="dets"></div>
    ${statusBar(time)}
    <div class="cam__top">
      <span class="cam__pill"><b>◉</b> Nocturne</span>
      <span class="cam__pill">Auto</span>
    </div>
    <div class="cam__bottom">
      <div class="cam__modes">${modes.map(m => m === mode ? `<b>${m}</b>` : `<span>${m}</span>`).join('')}</div>
      <button class="shutter" aria-label="Take photo"><span class="shutter__ring"></span></button>
    </div>
    <div class="cam__flash"></div>
    <div class="sheet">
      <div class="sheet__tick"><svg viewBox="0 0 24 24"><path d="M4 12.6 9.2 18 20 6.6"/></svg></div>
      <h4></h4><div class="sheet__meta"></div><div class="sheet__foods"></div>
    </div>
  </div>`;
};

export class Camera {
  /* opts: subject, mode, modes, clock, savedTitle, savedMeta, onSaved, manual */
  constructor(mount, opts = {}) {
    this.o = Object.assign({ subject: 'plate', mode: 'Dinner', clock: '7:14', savedTitle: 'Dinner saved.', savedMeta: 'Logged 7:14 PM · 5 items recognised' }, opts);
    this.seq = new Seq();
    this.node = phone(camMarkup(this.o.subject, { mode: this.o.mode, modes: this.o.modes, time: this.o.clock }), opts.cls || '');
    if (mount) mount.appendChild(this.node);
    this.$ = q => this.node.querySelector(q);
    this.cam = this.$('.cam');
    this.shutter = this.$('.shutter');
    this.shutter.addEventListener('click', () => this.capture());
    this.state = 'idle';
  }
  setSubject(key, dets) {
    this.o.subject = key;
    this.custom = null; this.customDets = dets || null;
    this.$('.cam__scene').innerHTML = SUBJECTS[key].svg();
  }
  setImage(url) {
    this.custom = url;
    this.$('.cam__scene').innerHTML = `<img src="${url}" alt="Your uploaded dinner photo">`;
  }
  reset() {
    this.seq.cancel();
    this.state = 'idle';
    this.cam.classList.add('is-blur');
    this.$('.cam__focus').className = 'cam__focus';
    this.$('.scan').className = 'scan';
    this.$('.dets').innerHTML = '';
    this.$('.sheet').classList.remove('up');
    this.$('.cam__grid').style.opacity = '';
    this.shutter.disabled = false;
    this.$('.cam__scene').style.transform = '';
  }
  /* focus pull — runs when the demo enters view */
  arm() {
    if (this.state !== 'idle') return;
    return this.seq.run(async wait => {
      const f = this.$('.cam__focus');
      f.style.left = '50%'; f.style.top = '46%'; f.style.marginLeft = '-44px'; f.style.marginTop = '-44px';
      await wait(260); f.classList.add('on');
      await wait(520); this.cam.classList.remove('is-blur'); f.classList.add('lock');
      await wait(900); f.classList.remove('on');
    });
  }
  autoCapture(delay = 1500) {
    return this.seq.run(async wait => {
      await wait(delay);
      this.shutter.classList.add('press');
      await wait(180); this.shutter.classList.remove('press');
      this.capture();
    });
  }
  capture() {
    if (this.state !== 'idle') return;
    this.state = 'shot';
    this.cam.classList.remove('is-blur');
    this.$('.cam__focus').classList.remove('on');
    return this.seq.run(async wait => {
      const flash = this.$('.cam__flash');
      flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
      this.shutter.disabled = true;
      this.$('.cam__grid').style.opacity = '0';
      this.$('.cam__scene').style.transform = 'scale(1)';
      await wait(420);

      /* scan */
      const scan = this.$('.scan');
      scan.classList.add('on'); void scan.offsetWidth; scan.classList.add('go');
      await wait(700);

      /* detections */
      const dets = this.customDets || SUBJECTS[this.o.subject].dets;
      const box = this.$('.dets');
      dets.forEach(d => {
        const n = el(`<div class="det" data-side="${d.side || 'r'}" style="left:${d.x}%;top:${d.y}%">
          <span class="det__line"></span><span class="det__dot"></span><span class="det__lbl">${d.label}</span></div>`);
        box.appendChild(n);
      });
      const nodes = [...box.children];
      for (const n of nodes) { n.classList.add('on'); await wait(300); }
      await wait(500);
      scan.classList.remove('on');

      /* saved sheet */
      const sh = this.$('.sheet');
      sh.querySelector('h4').textContent = this.o.savedTitle;
      sh.querySelector('.sheet__meta').textContent = this.o.savedMeta;
      const foods = this.o.foods || SUBJECTS[this.o.subject].foods;
      sh.querySelector('.sheet__foods').innerHTML = foods.map((f, i) => `<span style="transition-delay:${240 + i * 70}ms">${f}</span>`).join('');
      sh.classList.add('up');
      this.state = 'saved';
      this.o.onSaved && this.o.onSaved();
    });
  }
}

/* ============================================================
   NIGHT
   ============================================================ */
export const nightMarkup = (items = [['Dinner', '7:14 PM'], ['Dessert', '8:42 PM'], ['Drinks', '9:18 PM']]) => `
<div class="night-scr">
  <div class="night-scr__stars"></div>
  ${statusBar('10:41')}
  <div class="night-scr__body">
    <div class="logdone">
      <h4>Tonight's log complete</h4>
      <ul>${items.map(([n, t]) => `<li><i></i>${n}<b>${t}</b></li>`).join('')}</ul>
    </div>
    <div class="goodnight">
      <svg viewBox="0 0 24 24"><path d="M20.5 14.8A8.7 8.7 0 0 1 9.2 3.5 9.2 9.2 0 1 0 20.5 14.8Z" stroke-linejoin="round"/></svg>
      <p>Goodnight. We'll check in when you wake up.</p>
      <small>Alarm set · 7:00 AM</small>
    </div>
  </div>
</div>`;

export class Night {
  constructor(mount, items) {
    this.seq = new Seq();
    this.node = phone(nightMarkup(items));
    if (mount) mount.appendChild(this.node);
    this.scr = this.node.querySelector('.night-scr');
  }
  reset() { this.seq.cancel(); this.scr.classList.remove('deep'); this.scr.querySelectorAll('.logdone li').forEach(l => l.classList.remove('on')); }
  run() {
    return this.seq.run(async wait => {
      const li = [...this.scr.querySelectorAll('.logdone li')];
      await wait(300);
      for (const l of li) { l.classList.add('on'); await wait(420); }
      await wait(900);
      this.scr.classList.add('deep');
      await wait(1400);
      this.floatZ();
    });
  }
  floatZ() {
    if (REDUCED) return;
    const g = this.scr.querySelector('.goodnight');
    let i = 0;
    this.zt = setInterval(() => {
      const z = document.createElement('span');
      z.className = 'zzz'; z.textContent = 'z';
      z.style.left = `${38 + (i % 3) * 10}%`; z.style.top = '26%';
      z.style.fontSize = `${.85 + (i % 3) * .25}rem`;
      g.appendChild(z); setTimeout(() => z.remove(), 4200); i++;
    }, 1300);
  }
  stop() { clearInterval(this.zt); }
}

/* ============================================================
   ALARM + RATING
   ============================================================ */
const WORDS = ['Terrible', 'Awful', 'Poor', 'Rough', 'Restless', 'Average', 'Okay', 'Good', 'Great', 'Excellent', 'Amazing'];
const VIVID = ['None', 'A trace', 'Faint', 'Hazy', 'Soft', 'Moderate', 'Clear', 'Vivid', 'Very vivid', 'Intense', 'Cinematic'];
export const scoreWord = v => WORDS[v];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
export function scoreColor(v) {
  const c1 = [209, 103, 79], c2 = [224, 160, 78], c3 = [95, 158, 134];
  const t = v / 10;
  const rgb = t < .5 ? mix(c1, c2, t / .5) : mix(c2, c3, (t - .5) / .5);
  return `rgb(${rgb.join(',')})`;
}

export function makeSlider(root, { value = 5, onInput, onCommit, labels } = {}) {
  const track = root.querySelector('.slider__track');
  const fill = root.querySelector('.slider__fill');
  const knob = root.querySelector('.slider__knob');
  let v = value, dragging = false;
  root.setAttribute('role', 'slider');
  root.setAttribute('tabindex', '0');
  root.setAttribute('aria-valuemin', '0'); root.setAttribute('aria-valuemax', '10');
  const paint = () => {
    const p = v * 10;
    fill.style.width = p + '%'; knob.style.left = p + '%';
    knob.style.setProperty('--k', scoreColor(v));
    root.setAttribute('aria-valuenow', v);
    root.setAttribute('aria-valuetext', `${v} out of 10 — ${(labels || WORDS)[v]}`);
  };
  const from = x => {
    const r = track.getBoundingClientRect();
    const nv = Math.round(Math.min(1, Math.max(0, (x - r.left) / r.width)) * 10);
    if (nv !== v) { v = nv; paint(); onInput && onInput(v); }
  };
  const down = e => { dragging = true; root.classList.add('grab'); root.setPointerCapture?.(e.pointerId); from(e.clientX); e.preventDefault(); };
  const move = e => { if (dragging) from(e.clientX); };
  const up = () => { if (!dragging) return; dragging = false; root.classList.remove('grab'); onCommit && onCommit(v); };
  root.addEventListener('pointerdown', down);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', up);
  root.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (d === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    v = e.key === 'Home' ? 0 : e.key === 'End' ? 10 : Math.min(10, Math.max(0, v + d));
    paint(); onInput && onInput(v); onCommit && onCommit(v);
  });
  paint();
  return { get: () => v, set: nv => { v = nv; paint(); onInput && onInput(v); } };
}

const sliderMarkup = (cls = '') => `<div class="slider ${cls}">
  <div class="slider__track"><div class="slider__fill"></div><div class="slider__knob"></div></div>
  <div class="slider__ticks">${[...Array(11)].map((_, i) => `<span>${i}</span>`).join('')}</div>
</div>`;

export const morningMarkup = () => `
<div class="scr on" data-s="alarm">
  <div class="alarm">
    <div class="alarm__sun"></div>
    <div class="alarm__waves" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="alarm__body">
      <div class="alarm__label">Alarm · Wake</div>
      <div class="alarm__time">7:00<sup>AM</sup></div>
      <div class="alarm__date">Wednesday, 12 March</div>
    </div>
    <div class="alarm__actions">
      <button class="bigbtn" data-a="stop">Stop</button>
      <button class="bigbtn bigbtn--soft" data-a="snooze">Snooze 9 minutes</button>
    </div>
  </div>
</div>
<div class="scr" data-s="rate">
  <div class="rate">
    <div class="rate__q">Good morning.<br>How did you sleep?</div>
    <div class="rate__sub">Drag to rate last night · 0 to 10</div>
    <div class="rate__num" data-num>—<small>/10</small></div>
    <div class="rate__word" data-word>Slide to score</div>
    ${sliderMarkup('js-sleep')}
    <div class="slider__ends"><span>0 · Terrible</span><span>10 · Amazing</span></div>

    <div class="rate__step" data-step="dream">
      <div class="rate__div"></div>
      <div class="rate__q" style="font-size:1.12rem">Did you dream?</div>
      <div class="yn" data-yn>
        <button data-v="yes">Yes</button><button data-v="no">No</button>
      </div>
    </div>

    <div class="rate__step" data-step="vivid">
      <div class="rate__sub" style="margin:20px 0 2px">How vivid was your dream?</div>
      <div class="rate__num" data-vnum style="font-size:2.6rem">5<small>/10</small></div>
      <div class="rate__word" data-vword>Moderate</div>
      ${sliderMarkup('js-vivid')}
      <textarea class="rate__note" data-note placeholder="What do you remember? (optional)"></textarea>
    </div>

    <div class="rate__step" data-step="save">
      <button class="rate__save" data-save>Save last night</button>
    </div>

    <div class="rate__step" data-step="done">
      <div class="rate__done">
        <div class="rate__num" data-dnum style="font-size:3rem"></div>
        <div class="rate__word" data-dword></div>
        <p data-dmsg></p>
      </div>
    </div>
  </div>
</div>`;

export class Morning {
  constructor(mount, opts = {}) {
    this.o = opts;
    this.seq = new Seq();
    this.node = phone(morningMarkup(), opts.cls || '');
    if (mount) mount.appendChild(this.node);
    this.$ = q => this.node.querySelector(q);
    this.data = { score: null, dreamed: null, vivid: 5, note: '' };
    this.wire();
  }
  wire() {
    this.node.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
      this.stopRinging();
      if (b.dataset.a === 'snooze') { this.snooze(); return; }
      this.show('rate');
    }));

    const num = this.$('[data-num]'), word = this.$('[data-word]');
    this.sleep = makeSlider(this.$('.js-sleep'), {
      value: 5,
      onInput: v => {
        num.innerHTML = `${v}<small>/10</small>`;
        num.style.color = scoreColor(v);
        word.textContent = WORDS[v]; word.style.color = scoreColor(v);
        this.data.score = v;
      },
      onCommit: () => { this.step('dream'); }
    });

    const vn = this.$('[data-vnum]'), vw = this.$('[data-vword]');
    this.vivid = makeSlider(this.$('.js-vivid'), {
      value: 5, labels: VIVID,
      onInput: v => { vn.innerHTML = `${v}<small>/10</small>`; vw.textContent = VIVID[v]; this.data.vivid = v; }
    });

    this.$('[data-yn]').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      this.$('[data-yn]').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
      this.data.dreamed = b.dataset.v === 'yes';
      if (this.data.dreamed) this.step('vivid'); else this.hide('vivid');
      this.step('save');
    });
    this.$('[data-note]').addEventListener('input', e => { this.data.note = e.target.value; });
    this.$('[data-save]').addEventListener('click', () => this.finish());
  }
  step(name) { this.$(`[data-step="${name}"]`).classList.add('on'); }
  hide(name) { this.$(`[data-step="${name}"]`).classList.remove('on'); }
  show(name) {
    this.node.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.dataset.s === name));
  }
  ring() {
    if (this.ringing) return;
    this.ringing = true;
    this.show('alarm');
    if (!REDUCED) this.node.classList.add('shake');
  }
  stopRinging() { this.ringing = false; this.node.classList.remove('shake'); }
  snooze() {
    return this.seq.run(async wait => { await wait(1400); this.ring(); });
  }
  finish() {
    const d = this.data;
    this.hide('save'); this.hide('dream'); this.hide('vivid');
    this.$('.js-sleep').closest('.rate').querySelectorAll('.slider,.slider__ends,.rate__num,.rate__word')
      .forEach(n => { if (!n.closest('[data-step="done"]')) n.style.display = 'none'; });
    this.$('.rate__q').innerHTML = 'Logged.';
    this.$('.rate__sub').textContent = 'Wednesday, 12 March';
    const dn = this.$('[data-dnum]'), dw = this.$('[data-dword]');
    dn.innerHTML = `${d.score ?? 5}<small>/10</small>`; dn.style.color = scoreColor(d.score ?? 5);
    dw.textContent = WORDS[d.score ?? 5];
    this.$('[data-dmsg]').textContent = d.dreamed
      ? `Dream recorded · vividness ${d.vivid}/10. Nocturne will line this up against last night's timeline.`
      : `No dream recorded. Nocturne will line this up against last night's timeline.`;
    this.step('done');
    this.o.onComplete && this.o.onComplete({ ...d });
  }
  reset() {
    this.seq.cancel(); this.stopRinging();
    this.data = { score: null, dreamed: null, vivid: 5, note: '' };
  }
}

/* ============================================================
   INSIGHT screen (used by the hero loop)
   ============================================================ */
export const insightMarkup = () => `
<div class="ins-scr" style="position:absolute;inset:0;background:linear-gradient(180deg,#fdf6ee,#f6ece1);color:#241d2b;padding:52px 20px 22px;display:flex;flex-direction:column;gap:14px">
  <div style="font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:#9a8c98">This week · 7 nights</div>
  <div style="font-family:var(--f-display);font-size:1.5rem;font-weight:340;letter-spacing:-.025em;line-height:1.05">Your week,<br>decoded.</div>
  <div style="display:flex;gap:8px">
    <div style="flex:1;border:1px solid rgba(36,29,43,.12);border-radius:14px;padding:11px">
      <div style="font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:#9a8c98">Avg sleep</div>
      <div style="font-family:var(--f-display);font-size:1.5rem;letter-spacing:-.03em;font-weight:330">7.4<span style="font-size:.5em;color:#9a8c98">/10</span></div>
    </div>
    <div style="flex:1;border:1px solid rgba(36,29,43,.12);border-radius:14px;padding:11px">
      <div style="font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:#9a8c98">Dream nights</div>
      <div style="font-family:var(--f-display);font-size:1.5rem;letter-spacing:-.03em;font-weight:330">4<span style="font-size:.5em;color:#9a8c98">/7</span></div>
    </div>
  </div>
  ${[['Coffee after 8 PM', 'Sleep 27% lower', 78, '#d1674f'],
      ['Dinner before 7:30 PM', 'Your 3 best nights', 62, '#5f9e86'],
      ['Chocolate', 'Dream vividness +23%', 48, '#8b7ae8']]
    .map(([t, s, w, c], i) => `
    <div style="border:1px solid rgba(36,29,43,.1);border-radius:14px;padding:12px 13px;background:rgba(255,255,255,.5)">
      <div style="font-size:.76rem;font-weight:500">${t}</div>
      <div style="font-size:.64rem;color:#7d6f7b;margin-top:2px">${s}</div>
      <div style="height:4px;border-radius:99px;background:rgba(36,29,43,.08);margin-top:9px;overflow:hidden">
        <i class="ins-bar" style="display:block;height:100%;width:0;background:${c};border-radius:99px;transition:width 1.1s cubic-bezier(.16,1,.3,1) ${.2 + i * .15}s" data-w="${w}"></i>
      </div>
    </div>`).join('')}
  <div style="margin-top:auto;font-size:.56rem;color:#a2949f;line-height:1.5">Observed correlations in your own log. Not medical advice.</div>
</div>`;
