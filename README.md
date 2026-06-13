# QMHP·CoPro — Heavy-Fluxonium Quantum Coprocessor

An immersive, award-caliber marketing/technical site for **QMHP·CoPro**, an erasure-biased
heavy-fluxonium superconducting quantum coprocessor. The page presents the program as a
falsifiable **TRL-2 architecture roadmap**: distance-3 surface-code logic, a proposed
dark-state CZ gate, a five-stage 15–20 mK cryogenic platform, and a Phase-1 dual-rail
cat-state interconnect.

The structure and production polish follow the premium deep-tech startup pattern of
[zetta-joule.com](https://zetta-joule.com); the content is original and grounded entirely
in the QMHP·CoPro whitepaper (v1.3.1) and system imagery.

## Stack
- **Three.js** (r160) — hero "quantum core" with a stacked golden cryostat, a glowing
  qubit lattice, an ambient particle field and `UnrealBloomPass` post-processing; a live
  distance-3 surface-code lattice in the processor section; a particle field behind the
  contact CTA.
- **GSAP + ScrollTrigger** — hero reveal, scrubbed manifesto, animated stat counters,
  a pinned five-stage cryostat stepper, and a pinned horizontal validation-gate chain.
- **Lenis** — smooth scrolling, integrated with ScrollTrigger.
- Custom cursor, preloader, grain overlay, lightbox gallery. No build step — static files.

Three.js, GSAP and Lenis load from CDN via an import map; if they are unavailable the page
degrades gracefully to a fully readable static layout.

## Run locally
```bash
python3 -m http.server 8099
# open http://localhost:8099
```

## Structure
```
index.html              # markup + import map
css/style.css           # design system
js/quantum-scene.js      # three.js scenes (ES module)
js/main.js               # GSAP / Lenis / UI interactions
assets/img/              # optimised system imagery
```

## Sections
Hero · Thesis · Headline quantities · Technology · Five-stage cryostat (pinned) ·
Quantum Processor Unit · Validation gate chain (horizontal) · Our edge · Gallery ·
Document status · Contact.

## Note on status
Per the source whitepaper, every projection on the site is **proposed and internally
derived — conditional until validation gates P3, P5 and P4 pass experimental validation.**
This is an architecture roadmap, not experimental proof.
