# Nocturne — discover what your dinner is doing to your sleep

The launch site for **Nocturne**, a consumer sleep product built on one loop:

> **Photograph → Sleep → Rate → Learn**

Photograph dinner (and anything else) before bed. Rate your sleep and your dreams when you
wake up. Over time the app surfaces correlations between your own evening habits, your sleep
quality and your dreams.

The page is designed to *be* the product demo rather than describe it. Every claim in the copy
has a working interaction next to it: the camera actually focuses and fires, the AI scan
actually sweeps and labels the food, the alarm actually rings, and the 0–10 sleep slider is
live and draggable.

## The journey

The whole page travels through one night, and the lighting travels with it — the background,
type colours and UI chrome cross-fade between four scenes as you scroll:

```
evening (dusk) → night → sunrise (dawn) → morning (day)
```

| Section | What it demonstrates |
|---|---|
| Hero | A phone looping the full journey: dinner → AI analysis → sleep → morning score → insights |
| 01 · Capture dinner | Focus pull, shutter, flash, scan beam, six food detections on a real photograph, “Dinner saved.” |
| 02 · Capture everything | A second and third capture (dessert, coffee) building tonight’s timeline live |
| 03 · Night | Tonight’s log completes, the screen goes deep, “Goodnight. We’ll check in when you wake up.” |
| — Asleep | Full-bleed photographic band closing the night chapter |
| 04 · Morning | A ringing alarm you can stop, then a live 0–10 slider, dream yes/no, vividness and notes |
| — Sunrise | Full-bleed photographic band opening the morning chapter |
| Dream tracking | Frequency ring, vividness gauge, themes from your own notes, one observed pattern |
| Over time | Animated correlation cards — garlic, coffee after 8 PM, chocolate, alcohol |
| Weekly report | “Your week, decoded.” — generates on scroll, then seven animated charts and three insight cards |
| No food diary | What you are *not* doing, against what you are |
| Day 1 → 90 | A scatter field resolving from noise into a pattern as nights accumulate |
| Your sleep is personal | Four pieces of common advice checked against one person’s log — two hold, two don’t |
| Try a night yourself | The full seven-step product, driven by the visitor, ending in a personalised sample insight |
| Privacy | Plain-language data commitments and the not-a-medical-device statement |

## Interaction notes

- **Try a night** (`#demo`) is fully playable: shoot the plate (or upload your own photo — it
  stays in your browser, nothing is uploaded), pick a dessert or a coffee, sleep, stop the
  alarm, drag your score, answer the dream questions. Step 7 writes an insight from *your*
  actual choices — and deliberately refuses to draw a conclusion from one night.
- Sliders work with pointer, touch and keyboard (`role="slider"`, arrow keys, Home/End).
- Every chart animates from an `IntersectionObserver`; the weekly report visibly assembles
  itself the first time it enters the viewport.

## Claim hygiene

Sleep is affected by far more than food, and this is a wellness product, not a diagnostic one.
The copy therefore says **“possible correlation”, “observed in your own log”, “associated
with”** — never “causes”. Sample figures are labelled as illustrative, single-night results are
explicitly called insufficient, and the footer and privacy section both state that Nocturne
does not diagnose sleep disorders, allergies, intolerances or any medical condition.

## Stack

No build step, no framework, no runtime dependencies — static files served as-is.

```
index.html          markup and section mount points
css/style.css       design system: tokens, four lighting themes, phone UI, charts
js/main.js          scroll lighting engine, parallax, nav, reveals, hero loop, wiring
js/phone.js         phone hardware + camera / night / alarm / rating components
js/food.js          camera subjects — photographed dinners + drawn dessert and coffee
assets/img/         optimised photography (WebP + JPEG, art-directed per breakpoint)
js/charts.js        line, scatter, bar, stacked, ring and gauge charts
js/sections.js      timeline, correlations, weekly report, dream dashboard, growth
js/demo.js          the seven-step "Try a night yourself" sequencer
js/util.js          element + IntersectionObserver helpers
```

### Imagery

Five supplied photographs carry the page; nothing is stock and nothing is AI-generated.

| Image | Where it lives |
|---|---|
| Penne with chicken and aubergine | The dinner the camera photographs in the hero loop and in section 01 |
| Chicken and rice bowl | The dinner you photograph yourself in “Try a night” |
| Person asleep | Full-bleed band between the night and morning chapters |
| Empty bed at sunrise | Full-bleed band between the morning and dream chapters |
| Tired portrait | Editorial portrait in “Your sleep is personal” |

Every one is cropped for its role, then emitted as **WebP with a JPEG fallback** through
`<picture>`, with explicit `width`/`height` to prevent layout shift, `loading="lazy"` on
everything below the fold, and a `preload` on the one image the hero needs immediately. The
two full-bleed bands are **art-directed**: a 2.2∶1 crop on desktop, a 1.2∶1 crop below 700px,
so the subject survives a narrow viewport instead of being cropped into abstraction. Total
WebP payload across the whole set is under 600 KB, of which roughly 70 KB is needed to render
the hero.

The meals are photographed in the camera at 3∶4 — the aspect a phone actually shoots — and
shown in a 3∶4 preview window inside the taller screen, exactly the way a real camera app
frames a shot. Detection labels are positioned in image space and mapped into that window,
so they stay pinned to the right food.

Dessert and drinks have no photograph, so they remain **hand-drawn SVG** — a bowl of chocolate
ice cream and a cup of coffee, lit by the same warm evening lamp as the rest of the page.

### Other notes

- Fonts are **Fraunces** (display) and **Inter** (UI), loaded non-render-blocking with a
  system-font fallback stack.
- `prefers-reduced-motion` is honoured throughout: animations collapse, sequences fast-forward,
  and all content remains visible and usable.

## Run locally

```bash
python3 -m http.server 8099
# open http://localhost:8099
```

## Note

All names, figures, charts and insights on this page are illustrative sample data for a concept
product. Nocturne is not a medical device.
