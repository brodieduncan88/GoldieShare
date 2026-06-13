/* ═══════════════════════════════════════════════════════════
   QMHP·CoPro — interaction layer
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ─── PRELOADER ─────────────────────────────────────── */
  const pre = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const pct = document.getElementById('preloaderPct');
  const statusEl = document.getElementById('preloaderStatus');
  const stages = ['Cooling mixing chamber…','Biasing flux lines…','Calibrating couplers…','Arming erasure flags…','Entering 15–20 mK…'];
  let p = 0, heroReady = false;
  const tick = setInterval(()=>{
    if(window.__heroReady) heroReady = true;
    p += Math.random()*8 + 3;
    if(p > 92 && !heroReady) p = 92;
    if(p >= 100){ p = 100; clearInterval(tick); finishPre(); }
    fill.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
    statusEl.textContent = stages[Math.min(stages.length-1, Math.floor(p/20))];
  }, 130);
  window.addEventListener('hero-ready', ()=>{ heroReady = true; });
  // safety: never hang
  setTimeout(()=>{ heroReady = true; }, 4000);
  let preDone = false;
  function finishPre(){
    if(preDone) return; preDone = true;
    pre.classList.add('is-done');
    document.body.style.overflow = '';
    startReveal();
  }

  /* ─── LENIS SMOOTH SCROLL ───────────────────────────── */
  let lenis = null;
  if(!reduced && window.Lenis){
    lenis = new Lenis({ duration:1.15, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if(window.ScrollTrigger){
      lenis.on('scroll', ()=>ScrollTrigger.update());
    }
  }

  /* ─── CUSTOM CURSOR ─────────────────────────────────── */
  if(!isTouch){
    const cur = document.getElementById('cursor');
    const dot = cur.querySelector('.cursor__dot');
    const ring = cur.querySelector('.cursor__ring');
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    window.addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px'; });
    (function ring_loop(){ rx+=(mx-rx)*0.16; ry+=(my-ry)*0.16;
      ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(ring_loop); })();
    document.addEventListener('pointerover',e=>{
      const t=e.target.closest('[data-cursor]');
      cur.classList.remove('is-hover','is-zoom');
      if(t){ cur.classList.add(t.dataset.cursor==='zoom'?'is-zoom':'is-hover'); }
    });
  }

  /* ─── NAV scroll state + mobile menu ────────────────── */
  const nav = document.getElementById('nav');
  const onScrollNav = ()=>{ nav.classList.toggle('is-scrolled', window.scrollY>40); };
  window.addEventListener('scroll', onScrollNav); onScrollNav();

  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const toggleMenu = (force)=>{
    const open = force!==undefined ? force : !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    if(lenis){ open ? lenis.stop() : lenis.start(); }
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger && burger.addEventListener('click', ()=>toggleMenu());
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));

  /* ─── smooth anchor scrolling ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if(id==='#' || id.length<2) return;
      const el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      if(lenis) lenis.scrollTo(el, { offset:0, duration:1.3 });
      else el.scrollIntoView({ behavior:'smooth' });
    });
  });

  /* ─── GSAP animations (run after preloader) ─────────── */
  function startReveal(){
    if(!window.gsap){ return; }
    const gsap = window.gsap;
    if(window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* HERO entrance */
    const tl = gsap.timeline({ defaults:{ ease:'power4.out' } });
    tl.from('.hero__eyebrow', { y:24, opacity:0, duration:.9 })
      .from('.hero__title .line>span', { yPercent:115, duration:1.1, stagger:.12 }, '-=.5')
      .from('.hero__lede', { y:24, opacity:0, duration:.9 }, '-=.7')
      .from('.hero__actions', { y:24, opacity:0, duration:.8 }, '-=.7')
      .from('.hero__ticker', { y:30, opacity:0, duration:.8 }, '-=.6')
      .from('.hero__scroll', { opacity:0, duration:.8 }, '-=.5');

    if(reduced || !window.ScrollTrigger) return;

    /* hero canvas drives 3D camera dolly on scroll */
    if(window.__heroState){
      ScrollTrigger.create({
        trigger:'.hero', start:'top top', end:'bottom top', scrub:true,
        onUpdate:(self)=>{ window.__heroState.scroll = self.progress; }
      });
    }

    /* generic reveal for section heads + cards */
    gsap.utils.toArray('.section-head').forEach(el=>{
      gsap.from(el.children, { y:50, opacity:0, duration:1, stagger:.1, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 82%' } });
    });

    ['.stat','.tcard','.ecard','.qpu__specs li','.gitem','.contact__grid > div','.about__chips .chip']
      .forEach(sel=>{
        gsap.utils.toArray(sel).forEach((el,i)=>{
          gsap.from(el, { y:46, opacity:0, duration:.9, ease:'power3.out', delay:(i%4)*0.06,
            scrollTrigger:{ trigger:el, start:'top 88%' } });
        });
      });

    /* MANIFESTO word-by-word reveal */
    const mWords = document.querySelectorAll('.manifesto__text .word');
    if(mWords.length){
      gsap.to(mWords, { opacity:1, stagger:0.04, ease:'none',
        scrollTrigger:{ trigger:'.manifesto__text', start:'top 75%', end:'bottom 60%', scrub:true } });
    }
    gsap.from('.manifesto__foot', { y:40, opacity:0, duration:1,
      scrollTrigger:{ trigger:'.manifesto__foot', start:'top 85%' } });

    /* STAT counters */
    document.querySelectorAll('.count').forEach(el=>{
      const target = parseFloat(el.dataset.target);
      const dec = el.dataset.decimals!==undefined ? parseInt(el.dataset.decimals) :
        (String(target).includes('.') ? String(target).split('.')[1].length : 0);
      const obj = { v:0 };
      ScrollTrigger.create({ trigger:el, start:'top 88%', once:true, onEnter:()=>{
        gsap.to(obj, { v:target, duration:1.8, ease:'power2.out',
          onUpdate:()=>{ el.textContent = obj.v.toFixed(dec); } });
      }});
    });

    /* TECH media parallax */
    gsap.utils.toArray('[data-parallax-media] img').forEach(img=>{
      gsap.fromTo(img, { yPercent:-8 }, { yPercent:8, ease:'none',
        scrollTrigger:{ trigger:img.closest('.tech__layout')||img, start:'top bottom', end:'bottom top', scrub:true } });
    });

    /* CRYO pinned stage stepper */
    const cstages = gsap.utils.toArray('.cstage');
    const cryoImg = document.getElementById('cryoImg');
    const cryoTemp = document.getElementById('cryoTemp');
    const cryoName = document.getElementById('cryoStageName');
    const cryoSticky = document.querySelector('.cryo__sticky');
    if(cstages.length && cryoSticky){
      const imgShifts = [0, 18, 36, 54, 72, 90]; // % object-position-ish via translateY scale
      function setStage(i){
        cstages.forEach((s,k)=>s.classList.toggle('is-active', k===i));
        const s = cstages[i];
        cryoTemp.textContent = s.dataset.temp;
        cryoName.textContent = s.dataset.name;
        if(cryoImg){
          const pos = (i/(cstages.length-1))*60; // pan down the cryostat
          cryoImg.style.transform = `scale(1.18) translateY(${-pos*0.18}%)`;
          cryoImg.style.filter = `saturate(${1.05 - i*0.02}) brightness(${1 - i*0.015})`;
        }
      }
      setStage(0);
      ScrollTrigger.create({
        trigger:'.cryo', start:'top top', end:`+=${cstages.length*60}%`, pin:'.cryo__sticky', scrub:true,
        onUpdate:(self)=>{
          const idx = Math.min(cstages.length-1, Math.floor(self.progress*cstages.length*0.999));
          setStage(idx);
        }
      });
    }

    /* VALIDATION GATES horizontal scroll */
    const track = document.getElementById('gatesTrack');
    const viewport = document.getElementById('gatesViewport');
    const progress = document.getElementById('gatesProgress');
    if(track && viewport){
      const getDist = ()=> track.scrollWidth - viewport.clientWidth;
      gsap.to(track, {
        x: ()=> -getDist(),
        ease:'none',
        scrollTrigger:{
          trigger:'.gates', start:'top top', end:()=>`+=${getDist()+window.innerHeight*0.4}`,
          pin:true, scrub:1, invalidateOnRefresh:true,
          onUpdate:(self)=>{ if(progress) progress.style.width=(self.progress*100)+'%'; }
        }
      });
    }

    /* CONTACT title */
    gsap.from('.contact__title', { y:60, opacity:0, duration:1.1, ease:'power4.out',
      scrollTrigger:{ trigger:'.contact', start:'top 70%' } });

    ScrollTrigger.refresh();
  }

  /* ─── split manifesto into words (for scrub reveal) ── */
  (function splitManifesto(){
    const el = document.querySelector('.manifesto__text');
    if(!el) return;
    const walk = (node)=>{
      const kids = Array.from(node.childNodes);
      kids.forEach(n=>{
        if(n.nodeType===3){ // text
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok=>{
            if(tok.trim()===''){ frag.appendChild(document.createTextNode(tok)); }
            else { const s=document.createElement('span'); s.className='word'; s.textContent=tok; frag.appendChild(s); }
          });
          node.replaceChild(frag, n);
        } else if(n.nodeType===1 && n.tagName==='EM'){
          const s=document.createElement('span'); s.className='word'; s.style.color='var(--gold)';
          s.textContent=n.textContent; node.replaceChild(s, n);
        }
      });
    };
    walk(el);
  })();

  /* ─── LIGHTBOX ──────────────────────────────────────── */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  document.querySelectorAll('[data-src]').forEach(fig=>{
    fig.addEventListener('click', ()=>{
      lbImg.src = fig.dataset.src;
      lb.classList.add('is-open');
      if(lenis) lenis.stop(); document.body.style.overflow='hidden';
    });
  });
  function closeLb(){ lb.classList.remove('is-open'); if(lenis) lenis.start(); document.body.style.overflow=''; }
  lbClose && lbClose.addEventListener('click', closeLb);
  lb && lb.addEventListener('click', e=>{ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeLb(); toggleMenu(false); } });

  /* lock scroll while preloader visible */
  document.body.style.overflow = 'hidden';
})();
