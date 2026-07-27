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
| 01 · Capture dinner | Focus pull, shutter, flash, scan beam, five food detections, “Dinner saved.” |
| 02 · Capture everything | A second and third capture (dessert, coffee) building tonight’s timeline live |
| 03 · Night | Tonight’s log completes, the screen goes deep, “Goodnight. We’ll check in when you wake up.” |
| 04 · Morning | A ringing alarm you can stop, then a live 0–10 slider, dream yes/no, vividness and notes |
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
js/food.js          the food itself — hand-drawn SVG plate, dessert and coffee
js/charts.js        line, scatter, bar, stacked, ring and gauge charts
js/sections.js      timeline, correlations, weekly report, dream dashboard, growth
js/demo.js          the seven-step "Try a night yourself" sequencer
js/util.js          element + IntersectionObserver helpers
```

- **No stock photography and no AI imagery.** The meals in the camera are drawn by hand in
  SVG — a plate of grilled chicken, roast potatoes, broccoli, garlic and cream sauce, a bowl of
  chocolate ice cream, and a cup of coffee, all lit by the same warm evening lamp.
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
