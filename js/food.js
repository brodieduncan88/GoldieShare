/* ============================================================
   Illustrated subjects for the camera viewfinders.
   Everything is drawn — no photography, no stock imagery.
   viewBox is 360 × 780 so it fills a phone screen exactly.
   ============================================================ */

let uid = 0;
const id = () => `f${++uid}`;

/* warm evening table under a low lamp */
function table(u, tone = 'warm') {
  const a = tone === 'warm' ? ['#3a2418', '#241409', '#160c05'] : ['#312433', '#1f1622', '#140d16'];
  return `
  <defs>
    <radialGradient id="${u}lamp" cx="72%" cy="6%" r="88%">
      <stop offset="0" stop-color="#ffce8f" stop-opacity=".55"/>
      <stop offset="42%" stop-color="#f0a05a" stop-opacity=".17"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${u}wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a[0]}"/><stop offset="55%" stop-color="${a[1]}"/><stop offset="100%" stop-color="${a[2]}"/>
    </linearGradient>
    <radialGradient id="${u}plate" cx="38%" cy="26%" r="82%">
      <stop offset="0" stop-color="#fffaf3"/><stop offset="58%" stop-color="#f0e6da"/><stop offset="100%" stop-color="#cdbfb1"/>
    </radialGradient>
    <filter id="${u}soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="${u}tiny" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
  </defs>
  <rect width="360" height="780" fill="url(#${u}wood)"/>
  <g opacity=".35">
    <path d="M0 132h360M0 318h360M0 512h360M0 700h360" stroke="#000" stroke-opacity=".16" stroke-width="1.4"/>
  </g>
  <rect width="360" height="780" fill="url(#${u}lamp)"/>`;
}

const plateBase = (u, cx, cy, r) => `
  <ellipse cx="${cx + 6}" cy="${cy + 16}" rx="${r + 6}" ry="${r + 4}" fill="#000" opacity=".45" filter="url(#${u}soft)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${u}plate)"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 26}" fill="none" stroke="#c9bbab" stroke-opacity=".55" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.2"/>
  <path d="M${cx - r * .7} ${cy - r * .62}a${r * .9} ${r * .9} 0 0 1 ${r * .95} -${r * .16}"
        fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round" filter="url(#${u}tiny)"/>`;

const cutlery = (u, cx, cy, r) => `
  <g opacity=".92">
    <g transform="translate(${cx - r - 46} ${cy - 58}) rotate(-3)">
      <rect x="0" y="0" width="7" height="118" rx="3.5" fill="#b9b2a6"/>
      <path d="M-6 0h19v26a9.5 9.5 0 0 1-19 0Z" fill="#cdc6b9"/>
      <path d="M-6 0v20M0 0v20M6.5 0v20M13 0v20" stroke="#3a2418" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g transform="translate(${cx + r + 40} ${cy - 58}) rotate(3)">
      <rect x="0" y="0" width="7" height="118" rx="3.5" fill="#b9b2a6"/>
      <path d="M0 0h7c7 0 11 6 11 15v22c0 6-5 9-11 9H0Z" fill="#d6cfc3"/>
    </g>
  </g>`;

/* ---------- dinner ---------- */
const potato = (u, x, y, rot, s = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-31-14-12-27l24-3 18 14 3 20-13 16-24 4-17-11Z"
          fill="url(#${u}pot)" stroke="#8f5d1c" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-12-27l24-3 18 14-8 9-22 2-14-9Z" fill="#ffe0a0" fill-opacity=".5"/>
    <path d="M-20-9 2-6l14-4" fill="none" stroke="#8a5714" stroke-opacity=".3" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M-13 15c9 5 22 4 30-3" fill="none" stroke="#7d4c10" stroke-opacity=".38" stroke-width="4" stroke-linecap="round"/>
  </g>`;

const floret = (u, x, y, s = 1, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-2 8c0 14-3 22-10 30" stroke="#87ab63" stroke-width="13" stroke-linecap="round" fill="none"/>
    <g fill="url(#${u}bro)">
      <circle cx="-18" cy="-12" r="16"/><circle cx="4" cy="-21" r="18"/><circle cx="23" cy="-6" r="15"/>
      <circle cx="1" cy="1" r="17"/><circle cx="-19" cy="7" r="13"/><circle cx="19" cy="12" r="12"/>
    </g>
    <g fill="#93bd6b" opacity=".5">
      <circle cx="-2" cy="-24" r="4.4"/><circle cx="-16" cy="-14" r="3.4"/><circle cx="18" cy="-6" r="3.8"/>
      <circle cx="3" cy="2" r="3.2"/><circle cx="-18" cy="6" r="2.8"/>
    </g>
  </g>`;

export function plate() {
  const u = id(), cx = 180, cy = 402, r = 156;
  return `<svg viewBox="0 0 360 780" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  ${table(u)}
  <defs>
    <linearGradient id="${u}chk" x1=".1" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="#eec084"/><stop offset="42%" stop-color="#d2924b"/><stop offset="100%" stop-color="#a86a2c"/>
    </linearGradient>
    <linearGradient id="${u}pot" x1="0" y1="0" x2=".3" y2="1">
      <stop offset="0" stop-color="#f6cd7f"/><stop offset="60%" stop-color="#dfa54e"/><stop offset="100%" stop-color="#c1852c"/>
    </linearGradient>
    <radialGradient id="${u}bro" cx="38%" cy="30%" r="74%">
      <stop offset="0" stop-color="#6a9c4b"/><stop offset="100%" stop-color="#2e5324"/>
    </radialGradient>
    <clipPath id="${u}chkClip">
      <path d="M-74-30c22-26 74-30 108-8 26 17 30 52 10 72-22 22-72 26-104 6-24-15-30-48-14-70Z"/>
    </clipPath>
  </defs>
  <g transform="translate(0 -90)">
  ${plateBase(u, cx, cy, r)}
  ${cutlery(u, cx, cy, r)}

  <!-- cream sauce pooled at the near edge -->
  <path d="M104 494c26-22 74-26 116-14 30 9 52 4 62 20 10 15-10 32-42 39-46 10-100 6-128-12-19-12-24-22-8-33Z"
        fill="#f0dfb4" opacity=".97"/>
  <path d="M124 500c22-13 58-16 88-8 22 6 40 3 48 12" fill="none" stroke="#fffaee" stroke-opacity=".85" stroke-width="4" stroke-linecap="round"/>
  <path d="M110 500c26-24 76-28 118-16" fill="none" stroke="#cbb384" stroke-opacity=".5" stroke-width="2"/>
  <g fill="#41632c" opacity=".75">
    <circle cx="146" cy="516" r="2.8"/><circle cx="196" cy="528" r="2.4"/><circle cx="238" cy="508" r="2.6"/>
    <circle cx="170" cy="536" r="2"/><circle cx="216" cy="498" r="1.9"/>
  </g>

  <!-- grilled chicken -->
  <g transform="translate(136 358) rotate(-10)">
    <path d="M-74-30c22-26 74-30 108-8 26 17 30 52 10 72-22 22-72 26-104 6-24-15-30-48-14-70Z"
          fill="url(#${u}chk)" stroke="#8a5320" stroke-opacity=".5" stroke-width="1.6"/>
    <g clip-path="url(#${u}chkClip)">
      <g stroke="#5a3210" stroke-opacity=".62" stroke-width="7" stroke-linecap="round" transform="rotate(-9)">
        <path d="M-90-30h190"/><path d="M-90 0h190"/><path d="M-90 30h190"/>
      </g>
      <path d="M-80-34c26-20 74-22 106-8" fill="none" stroke="#ffe6b8" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"/>
    </g>
    <path d="M-66-24c22-18 66-22 98-8" fill="none" stroke="#ffedcb" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- roast potatoes -->
  ${potato(u, 244, 316, 12)}
  ${potato(u, 282, 372, -18, .9)}
  ${potato(u, 212, 300, -8, .8)}

  <!-- broccoli -->
  ${floret(u, 250, 452, 1)}
  ${floret(u, 202, 470, .74, 12)}

  <!-- garlic cloves -->
  <g transform="translate(114 464)">
    <ellipse cx="10" cy="16" rx="34" ry="20" fill="#a08f7c" opacity=".28" filter="url(#${u}tiny)"/>
    <g transform="rotate(-26)">
      <path d="M0-22c12 0 21 13 19 26-2 11-12 17-21 14-10-2-16-13-12-25C-12-15-7-22 0-22Z" fill="#f3e6cd" stroke="#c0ad8c" stroke-width="1.3"/>
      <path d="M-2-15c7 3 10 13 8 22" stroke="#ddd1bb" stroke-width="2" fill="none"/>
    </g>
    <g transform="translate(30 16) rotate(24) scale(.85)">
      <path d="M0-22c12 0 21 13 19 26-2 11-12 17-21 14-10-2-16-13-12-25C-12-15-7-22 0-22Z" fill="#ead9bd" stroke="#c0ad8c" stroke-width="1.3"/>
    </g>
  </g>

  </g>
  <!-- steam -->
  <g stroke="#ffe9c8" stroke-opacity=".13" stroke-width="8" stroke-linecap="round" fill="none" filter="url(#${u}tiny)">
    <path d="M148 176c-15-28 13-40-2-68"/><path d="M216 162c-14-26 12-36-2-62"/>
  </g>
</svg>`;
}

export const plateDetections = [
  { x: 37.5, y: 34.4, label: 'Grilled chicken', side: 'l' },
  { x: 66, y: 30.8, label: 'Roast potatoes', side: 'r' },
  { x: 67.5, y: 47, label: 'Broccoli', side: 'r' },
  { x: 32.8, y: 48.5, label: 'Garlic', side: 'l' },
  { x: 48.9, y: 56, label: 'Cream sauce', side: 'r' }
];

/* ---------- dessert ---------- */
export function dessert() {
  const u = id(), cx = 180, cy = 396;
  return `<svg viewBox="0 0 360 780" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  ${table(u, 'cool')}
  <defs>
    <radialGradient id="${u}ic" cx="36%" cy="30%" r="76%">
      <stop offset="0" stop-color="#8a5638"/><stop offset="55%" stop-color="#67381f"/><stop offset="100%" stop-color="#40200f"/>
    </radialGradient>
    <linearGradient id="${u}bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fdfaf5"/><stop offset="100%" stop-color="#cbc0b4"/>
    </linearGradient>
  </defs>
  <g transform="translate(0 -66)">
  <ellipse cx="${cx + 5}" cy="${cy + 22}" rx="152" ry="140" fill="#000" opacity=".5" filter="url(#${u}soft)"/>
  <circle cx="${cx}" cy="${cy}" r="146" fill="url(#${u}bowl)"/>
  <circle cx="${cx}" cy="${cy}" r="118" fill="#efe6da"/>
  <circle cx="${cx}" cy="${cy}" r="118" fill="none" stroke="#bfb3a5" stroke-opacity=".6"/>
  <path d="M86 318a146 146 0 0 1 110-62" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="8" stroke-linecap="round" filter="url(#${u}tiny)"/>

  <g>
    <circle cx="138" cy="358" r="58" fill="url(#${u}ic)"/>
    <circle cx="222" cy="368" r="53" fill="url(#${u}ic)"/>
    <circle cx="178" cy="440" r="55" fill="url(#${u}ic)"/>
    <g fill="#a3714d" opacity=".42">
      <circle cx="116" cy="330" r="15"/><circle cx="206" cy="342" r="13"/><circle cx="160" cy="416" r="14"/>
    </g>
    <g fill="#2c1608" opacity=".45">
      <circle cx="160" cy="388" r="8"/><circle cx="204" cy="408" r="6"/><circle cx="142" cy="404" r="5"/><circle cx="196" cy="452" r="6.5"/>
    </g>
    <!-- shavings -->
    <g fill="#3a1e0d">
      <rect x="140" y="320" width="34" height="8" rx="4" transform="rotate(-18 157 324)"/>
      <rect x="198" y="336" width="30" height="7" rx="3.5" transform="rotate(14 213 339)"/>
      <rect x="158" y="466" width="32" height="7.5" rx="3.7" transform="rotate(8 174 470)"/>
    </g>
    <path d="M108 380c26 20 60 26 102 16 24-6 42-2 54 10" fill="none" stroke="#22110a" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/>
    <!-- mint -->
    <g transform="translate(224 322) rotate(18)">
      <path d="M0 0c18-5 30 4 27 18-16 7-29 0-27-18Z" fill="#4e8b47"/>
      <path d="M2 2c11 2 19 9 22 15" stroke="#8fc276" stroke-width="2.2" fill="none"/>
    </g>
  </g>
  <g transform="translate(284 214) rotate(28)">
    <rect x="0" y="0" width="9" height="130" rx="4.5" fill="#c3bcb0"/>
    <ellipse cx="4.5" cy="-16" rx="19" ry="24" fill="#d7d0c4"/>
  </g>
  </g>
</svg>`;
}

export const dessertDetections = [
  { x: 46, y: 38, label: 'Chocolate ice cream', side: 'l' },
  { x: 62, y: 48.3, label: 'Cocoa · dairy', side: 'r' }
];

/* ---------- drink ---------- */
export function coffee() {
  const u = id(), cx = 180, cy = 400;
  return `<svg viewBox="0 0 360 780" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  ${table(u, 'cool')}
  <defs>
    <radialGradient id="${u}cof" cx="34%" cy="28%" r="78%">
      <stop offset="0" stop-color="#6b4326"/><stop offset="52%" stop-color="#42230f"/><stop offset="100%" stop-color="#221107"/>
    </radialGradient>
  </defs>
  <g transform="translate(0 -66)">
  <ellipse cx="${cx + 6}" cy="${cy + 24}" rx="150" ry="138" fill="#000" opacity=".5" filter="url(#${u}soft)"/>
  <circle cx="${cx}" cy="${cy}" r="142" fill="#e9e1d6"/>
  <circle cx="${cx}" cy="${cy}" r="142" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="116" fill="none" stroke="#c9bcac" stroke-opacity=".7"/>
  <!-- handle -->
  <path d="M282 392c40 0 40 62 0 62" fill="none" stroke="#f4eee4" stroke-width="17" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="106" fill="#fbf7f0"/>
  <circle cx="${cx}" cy="${cy}" r="90" fill="url(#${u}cof)"/>
  <g opacity=".5">
    <path d="M116 380c26-18 60-20 86-4 24 14 50 10 64-10" fill="none" stroke="#c79a6a" stroke-width="8" stroke-linecap="round"/>
    <path d="M114 428c30 16 70 14 98-6" fill="none" stroke="#b98b5c" stroke-width="6" stroke-linecap="round" opacity=".7"/>
  </g>
  <ellipse cx="146" cy="358" rx="30" ry="16" fill="#fff" opacity=".13" transform="rotate(-22 146 358)"/>
  <path d="M92 350a106 106 0 0 1 72-60" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="7" stroke-linecap="round" filter="url(#${u}tiny)"/>
  </g>
  <g stroke="#ffeacb" stroke-opacity=".16" stroke-width="9" stroke-linecap="round" fill="none" filter="url(#${u}tiny)">
    <path d="M156 196c-17-30 15-42-2-74"/><path d="M216 186c-16-28 14-38-2-66"/>
  </g>
</svg>`;
}

export const coffeeDetections = [
  { x: 50, y: 43, label: 'Coffee', side: 'r' },
  { x: 52, y: 32.5, label: 'Caffeine · likely', side: 'r' }
];


/* ============================================================
   Photographed subjects.
   Shot 3:4 — the aspect a phone actually takes — and shown in a
   3:4 preview window inside the taller screen, exactly like a
   real camera app. Detection coordinates below are already
   mapped from image space into screen space.
   ============================================================ */
export const WIN = { top: 9, height: 62.2 };            /* preview window, % of screen — must match .cam--photo in CSS */
const toScreen = y => +(WIN.top + y * WIN.height / 100).toFixed(1);

export function photoMarkup({ src, alt, eager }) {
  return `<picture>
    <source srcset="${src}.webp" type="image/webp">
    <img src="${src}.jpg" alt="${alt}" width="756" height="1008"
         decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>
  </picture>`;
}

/* y here is a position in the photograph; toScreen() maps it into the window */
const PASTA_DETS = [
  { x: 52, y: 32, label: 'Grilled chicken', side: 'r' },
  { x: 30, y: 40, label: 'Aubergine', side: 'l' },
  { x: 17, y: 48, label: 'Penne pasta', side: 'r' },
  { x: 43, y: 57, label: 'Parmesan', side: 'r' },
  { x: 72, y: 64, label: 'Tomato sauce', side: 'l' },
  { x: 49, y: 72, label: 'Basil', side: 'r' }
].map(d => ({ ...d, y: toScreen(d.y) }));

const BOWL_DETS = [
  { x: 33, y: 24, label: 'Grilled chicken', side: 'r' },
  { x: 81, y: 33, label: 'Peppers', side: 'l' },
  { x: 20, y: 44, label: 'White rice', side: 'r' },
  { x: 74, y: 54, label: 'Sweetcorn', side: 'l' },
  { x: 46, y: 62, label: 'Black beans', side: 'r' }
].map(d => ({ ...d, y: toScreen(d.y) }));

export const SUBJECTS = {
  pasta: {
    photo: 'assets/img/meal-pasta', alt: 'A plate of penne with chicken, aubergine and tomato sauce, photographed from above',
    dets: PASTA_DETS, title: 'Dinner',
    foods: ['Penne pasta', 'Grilled chicken', 'Aubergine', 'Tomato sauce', 'Parmesan', 'Basil']
  },
  bowl: {
    photo: 'assets/img/meal-bowl', alt: 'A bowl of chicken, rice, black beans, sweetcorn and peppers, photographed from above',
    dets: BOWL_DETS, title: 'Dinner',
    foods: ['Grilled chicken', 'White rice', 'Black beans', 'Sweetcorn', 'Peppers', 'Lime']
  },
  plate: { svg: plate, dets: plateDetections, title: 'Dinner', foods: ['Grilled chicken', 'Roast potatoes', 'Broccoli', 'Garlic', 'Cream sauce'] },
  dessert: { svg: dessert, dets: dessertDetections, title: 'Dessert', foods: ['Chocolate ice cream', 'Cocoa', 'Dairy', 'Sugar'] },
  coffee: { svg: coffee, dets: coffeeDetections, title: 'Drink', foods: ['Coffee', 'Caffeine'] }
};

/* the scene for a subject — a photograph if it has one, otherwise the drawing */
export const sceneFor = (key, eager) => {
  const s = SUBJECTS[key];
  return s.photo ? photoMarkup({ src: s.photo, alt: s.alt, eager }) : s.svg();
};
export const isPhoto = key => !!SUBJECTS[key].photo;
