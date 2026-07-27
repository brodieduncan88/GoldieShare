/* ============================================================
   "Try a night yourself" — the whole product in seven steps
   ============================================================ */
import { el } from './util.js';
import { Camera, Night, Morning, Seq, scoreWord, scoreColor } from './phone.js';

const STEPS = [
  ['Photograph dinner', 'Frame the plate and press the shutter.'],
  ['AI reads the meal', 'Foods and likely ingredients, no typing.'],
  ['Add dessert or a drink', 'Anything consumed after dinner.'],
  ['Go to sleep', 'Tonight’s log closes.'],
  ['7:00 AM', 'The alarm rings.'],
  ['Rate your night', 'One number. And your dreams.'],
  ['What Nocturne says', 'Your first data point.']
];

export function mountDemo(node) {
  const ui = el(`<div class="demo__ui reveal">
    <div class="steps" aria-label="Demo steps">${STEPS.map((s, i) =>
    `<button class="step" data-i="${i}" ${i ? 'disabled' : ''}>
        <span class="step__n">${i + 1}</span><span class="step__b">${s[0]}<small>${s[1]}</small></span></button>`).join('')}</div>
    <div class="demo__stage">
      <div class="demo__phone"></div>
      <div class="demo__side">
        <h3 data-t></h3>
        <p data-p></p>
        <div class="demo__acts" data-acts></div>
        <div class="demo__sum" data-sum hidden></div>
        <div class="demo__result" data-res hidden></div>
        <div class="demo__hint" data-hint></div>
      </div>
    </div>
  </div>`);
  node.appendChild(ui);

  const stage = ui.querySelector('.demo__phone');
  const $t = ui.querySelector('[data-t]'), $p = ui.querySelector('[data-p]'),
    $acts = ui.querySelector('[data-acts]'), $hint = ui.querySelector('[data-hint]'),
    $sum = ui.querySelector('[data-sum]'), $res = ui.querySelector('[data-res]');
  const seq = new Seq();
  const state = { entries: [], score: null, dreamed: null, vivid: null, note: '', later: null, own: false };
  let step = -1, phones = {};

  /* ---------- phones ---------- */
  function getPhone(key) {
    if (phones[key]) return phones[key];
    let p;
    if (key === 'dinner') {
      p = new Camera(null, {
        subject: 'plate', mode: 'Dinner', clock: '7:14', savedTitle: 'Dinner saved.',
        savedMeta: 'Logged 7:14 PM · 5 items recognised',
        onSaved: () => {
          state.entries.push({ time: '7:14 PM', kind: 'Dinner', foods: ['Chicken', 'Potato', 'Broccoli', 'Garlic', 'Cream sauce'] });
          renderSum();
          go(1);
          seq.run(async wait => { await wait(2400); if (step === 1) go(2); });
        }
      });
    } else if (key === 'later') {
      p = new Camera(null, {
        subject: 'dessert', mode: 'Dessert', clock: '8:42', savedTitle: 'Dessert saved.',
        savedMeta: 'Logged 8:42 PM · 1 item recognised',
        onSaved: () => {
          const e = state.later === 'coffee'
            ? { time: '9:18 PM', kind: 'Drink', foods: ['Coffee'] }
            : { time: '8:42 PM', kind: 'Dessert', foods: ['Chocolate ice cream'] };
          state.entries.push(e); renderSum(); go(3);
        }
      });
    } else if (key === 'night') {
      p = new Night(null, [['Dinner', '7:14 PM'], ['Dessert / drink', state.later === 'coffee' ? '9:18 PM' : '8:42 PM'], ['Nothing since', '—']]);
    } else if (key === 'morning') {
      p = new Morning(null, {
        onComplete: d => { Object.assign(state, d); go(6); }
      });
    }
    phones[key] = p;
    p.node.hidden = true;
    stage.appendChild(p.node);
    return p;
  }
  const showPhone = key => {
    Object.entries(phones).forEach(([k, p]) => { p.node.hidden = k !== key; });
    const p = getPhone(key); p.node.hidden = false; return p;
  };

  /* ---------- side panel ---------- */
  function renderSum() {
    if (!state.entries.length) { $sum.hidden = true; return; }
    $sum.hidden = false;
    $sum.innerHTML = state.entries.map(e =>
      `<div><span>${e.time} · ${e.kind}</span><b>${e.foods.join(' · ')}</b></div>`).join('')
      + (state.score !== null ? `<div><span>Sleep score</span><b style="color:${scoreColor(state.score)}">${state.score}/10 · ${scoreWord(state.score)}</b></div>` : '')
      + (state.dreamed !== null ? `<div><span>Dream</span><b>${state.dreamed ? `Yes · vividness ${state.vivid}/10` : 'No'}</b></div>` : '');
  }
  const btn = (label, fn, ghost) => {
    const b = el(`<button class="btn ${ghost ? 'btn--ghost' : ''} btn--sm">${label}</button>`);
    b.addEventListener('click', fn); $acts.appendChild(b); return b;
  };

  /* ---------- step machine ---------- */
  function go(i) {
    if (i === step) return;
    step = i;
    seq.cancel();
    ui.querySelectorAll('.step').forEach(s => {
      const n = +s.dataset.i;
      s.classList.toggle('on', n === i);
      s.classList.toggle('done', n < i);
      s.disabled = n > i;
    });
    $acts.innerHTML = ''; $hint.textContent = ''; $res.hidden = true;

    if (i === 0) {
      const cam = showPhone('dinner'); cam.reset(); cam.arm();
      $t.textContent = 'Photograph dinner';
      $p.innerHTML = 'It is 7:14 PM. The camera has focused on the plate — press the shutter to capture it. You can shoot the illustrated dinner, or upload a photo of your own.';
      const f = el(`<label class="btn btn--ghost btn--sm file">Upload your own photo<input type="file" accept="image/*"></label>`);
      f.querySelector('input').addEventListener('change', e => {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        const url = URL.createObjectURL(file);
        cam.setImage(url); state.own = true;
        cam.o.savedMeta = 'Logged 7:14 PM · demo recognition';
        $hint.textContent = 'Your photo is shown locally in your browser only — nothing is uploaded. Recognition on this page is a scripted simulation.';
      });
      $acts.appendChild(f);
      btn('Shoot the sample plate', () => cam.capture(), true);
      if (!$hint.textContent) $hint.textContent = 'Press the white shutter button on the phone.';
    }

    if (i === 1) {
      $t.textContent = 'The AI reads the meal';
      $p.innerHTML = state.own
        ? 'The scan sweeps the photo and labels each item. On this page the result is scripted — in the product it comes from the image itself.'
        : 'The scan sweeps the photo, then each food is labelled: grilled chicken, roast potatoes, broccoli, garlic, cream sauce. Garlic and cream are inferred ingredients, not separate dishes.';
      $hint.textContent = 'Nothing was typed. That is the whole point.';
    }

    if (i === 2) {
      $t.textContent = 'Add dessert or a drink';
      $p.innerHTML = 'Two hours later you have something else. Choose what, then shoot it — it lands on tonight’s timeline with its own time stamp.';
      const cam = showPhone('later');
      const pick = kind => {
        state.later = kind;
        cam.reset();
        cam.setSubject(kind === 'coffee' ? 'coffee' : 'dessert');
        cam.o.mode = kind === 'coffee' ? 'Drink' : 'Dessert';
        cam.o.clock = kind === 'coffee' ? '9:18' : '8:42';
        cam.o.savedTitle = kind === 'coffee' ? 'Drink saved.' : 'Dessert saved.';
        cam.o.savedMeta = kind === 'coffee' ? 'Logged 9:18 PM · caffeine flagged' : 'Logged 8:42 PM · 1 item recognised';
        cam.o.foods = kind === 'coffee' ? ['Coffee', 'Caffeine'] : ['Chocolate ice cream', 'Cocoa', 'Dairy'];
        cam.node.querySelector('.sbar span').textContent = cam.o.clock;
        cam.node.querySelector('.cam__modes').innerHTML = ['Dinner', 'Dessert', 'Drink']
          .map(m => m === cam.o.mode ? `<b>${m}</b>` : `<span>${m}</span>`).join('');
        cam.arm();
        $hint.textContent = 'Press the shutter to log it.';
      };
      btn('Chocolate ice cream · 8:42 PM', () => pick('dessert'), true);
      btn('Coffee · 9:18 PM', () => pick('coffee'), true);
      if (!state.later) { cam.reset(); cam.arm(); $hint.textContent = 'Pick one to load it into the camera.'; }
      else pick(state.later);
    }

    if (i === 3) {
      const n = showPhone('night'); n.reset(); n.run();
      $t.textContent = 'Goodnight';
      $p.innerHTML = 'The evening log closes: dinner, dessert or drink, and nothing since. Nocturne goes quiet — no wearable, no microphone, no tracking through the night.';
      $hint.textContent = 'Waiting for morning…';
      btn('Skip to 7:00 AM', () => go(4));
      seq.run(async wait => { await wait(7000); if (step === 3) go(4); });
    }

    if (i === 4) {
      phones.night && phones.night.stop();
      const m = showPhone('morning'); m.reset(); m.show('alarm'); m.ring();
      $t.textContent = '7:00 AM';
      $p.innerHTML = 'The alarm goes off. Stop it on the phone — Nocturne asks its two questions before you are properly awake.';
      $hint.textContent = 'Tap “Stop” on the screen.';
      const io = new MutationObserver(() => {
        if (m.node.querySelector('[data-s="rate"]').classList.contains('on')) { io.disconnect(); go(5); }
      });
      io.observe(m.node.querySelector('[data-s="rate"]'), { attributes: true, attributeFilter: ['class'] });
    }

    if (i === 5) {
      showPhone('morning');
      $t.textContent = 'Rate your night';
      $p.innerHTML = 'Drag the slider to score last night from 0 to 10. Then answer whether you dreamed — and if you did, how vivid it was and anything you remember.';
      $hint.textContent = 'Drag, answer, then press “Save last night”.';
    }

    if (i === 6) {
      renderSum();
      $t.textContent = 'What Nocturne says after one night';
      $p.innerHTML = 'Almost nothing — and that is the honest answer.';
      $res.hidden = false;
      const later = state.later === 'coffee'
        ? 'coffee at 9:18 PM' : 'chocolate ice cream at 8:42 PM';
      const dream = state.dreamed === true ? ` You recalled a dream at ${state.vivid}/10 vividness.` :
        state.dreamed === false ? ' You did not recall a dream.' : '';
      $res.innerHTML = `
        <h4>Night 1 recorded.</h4>
        <p>Dinner at 7:14 PM — chicken, potato, broccoli, garlic, cream sauce — followed by ${later}.
        You rated the night <b>${state.score ?? '—'}/10</b>.${dream}</p>
        <p style="margin-top:12px">One night is not a pattern, so Nocturne draws no conclusion. It needs roughly ten evenings containing the same item before it will show you a correlation at all.</p>
        <p style="margin-top:12px;color:var(--fg-mute)">After thirty nights, an evening like this one would sit inside a card that reads:
        <em style="font-style:normal;color:var(--accent)">${state.later === 'coffee'
          ? '“Coffee after 8 PM · 9 evenings detected · average sleep 4.9/10 · possible negative correlation.”'
          : '“Chocolate · 14 evenings detected · dream vividness +23% · associated with more vivid dreams.”'}</em></p>`;
      $hint.textContent = 'Sample data. Correlations only — never a diagnosis.';
      btn('Run it again', () => { reset(); go(0); });
      btn('See the weekly report', () => document.getElementById('report').scrollIntoView({ behavior: 'smooth' }), true);
    }
  }

  function reset() {
    state.entries = []; state.score = null; state.dreamed = null; state.vivid = null; state.later = null; state.own = false;
    Object.values(phones).forEach(p => p.node.remove());
    phones = {};
    renderSum();
    step = -1;
  }

  ui.querySelectorAll('.step').forEach(s => s.addEventListener('click', () => { if (!s.disabled) go(+s.dataset.i); }));
  go(0);
  return { go, reset };
}
