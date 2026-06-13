// ═══════════════════════════════════════════════════════════
//  QMHP·CoPro — three.js scenes
//  1. Hero "quantum core" (qubit lattice + cryostat rings + bloom)
//  2. Live distance-3 surface-code lattice
//  3. Contact particle field
// ═══════════════════════════════════════════════════════════
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GOLD = new THREE.Color('#e8c074');
const CYAN = new THREE.Color('#5fe6f2');
const VIOLET = new THREE.Color('#8a7cff');

// ───────────────────────────────────────────────────────────
//  HERO SCENE
// ───────────────────────────────────────────────────────────
function initHero(onReady){
  const canvas = document.getElementById('quantum-canvas');
  if(!canvas) { onReady && onReady(); return; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050609, 0.045);

  const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 1.2, 17);

  const core = new THREE.Group();
  scene.add(core);

  // ── lights
  scene.add(new THREE.AmbientLight(0x223044, 0.6));
  const key = new THREE.PointLight(0x9fe9ff, 60, 60); key.position.set(6, 8, 10); scene.add(key);
  const warm = new THREE.PointLight(0xe8c074, 50, 60); warm.position.set(-8, -4, 6); scene.add(warm);

  // ── cryostat rings (stacked golden tori — the dilution fridge stages)
  const rings = new THREE.Group();
  const ringDefs = [
    { r:5.4, y: 5.2, c:GOLD,  tube:0.05 },
    { r:4.6, y: 3.0, c:GOLD,  tube:0.05 },
    { r:3.9, y: 1.1, c:GOLD,  tube:0.05 },
    { r:3.2, y:-0.8, c:GOLD,  tube:0.05 },
    { r:2.6, y:-2.6, c:CYAN,  tube:0.045 },
    { r:2.0, y:-4.3, c:CYAN,  tube:0.045 },
  ];
  ringDefs.forEach((d,i)=>{
    const geo = new THREE.TorusGeometry(d.r, d.tube, 12, 120);
    const mat = new THREE.MeshStandardMaterial({ color:d.c, emissive:d.c, emissiveIntensity:.55,
      metalness:.9, roughness:.3, transparent:true, opacity:.9 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI/2;
    ring.position.y = d.y;
    ring.userData.spin = (i%2?-1:1) * (0.04 + i*0.008);
    rings.add(ring);
    // vertical struts hint
    const strutCount = 10;
    for(let s=0;s<strutCount;s++){
      const a = (s/strutCount)*Math.PI*2;
      const dotGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color:d.c, emissive:d.c, emissiveIntensity:.8 }));
      dot.position.set(Math.cos(a)*d.r, d.y, Math.sin(a)*d.r);
      rings.add(dot);
    }
  });
  core.add(rings);

  // ── qubit lattice (the chip at the cold stage) — instanced glowing nodes
  const nodes = new THREE.Group();
  nodes.position.y = -4.3;
  const gridN = 5, spacing = 0.62;
  const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const dataMat = new THREE.MeshStandardMaterial({ color:CYAN, emissive:CYAN, emissiveIntensity:1.4 });
  const stabMat = new THREE.MeshStandardMaterial({ color:GOLD, emissive:GOLD, emissiveIntensity:1.2 });
  const qubits = [];
  for(let x=0;x<gridN;x++){
    for(let z=0;z<gridN;z++){
      const isData = (x+z)%2===0;
      const m = new THREE.Mesh(nodeGeo, (isData?dataMat:stabMat).clone());
      m.position.set((x-(gridN-1)/2)*spacing, 0, (z-(gridN-1)/2)*spacing);
      m.userData = { phase: Math.random()*Math.PI*2, base:isData?1.4:1.2, data:isData };
      nodes.add(m); qubits.push(m);
    }
  }
  // coupler links
  const linkMat = new THREE.LineBasicMaterial({ color:0x3a5566, transparent:true, opacity:.5 });
  for(let x=0;x<gridN;x++){
    for(let z=0;z<gridN;z++){
      const here = qubits[x*gridN+z];
      [[1,0],[0,1]].forEach(([dx,dz])=>{
        const nx=x+dx, nz=z+dz;
        if(nx<gridN && nz<gridN){
          const there = qubits[nx*gridN+nz];
          const g = new THREE.BufferGeometry().setFromPoints([here.position, there.position]);
          nodes.add(new THREE.Line(g, linkMat));
        }
      });
    }
  }
  core.add(nodes);

  // ── ambient quantum particle field
  const pCount = prefersReduced ? 400 : 1400;
  const pPos = new Float32Array(pCount*3);
  const pCol = new Float32Array(pCount*3);
  for(let i=0;i<pCount;i++){
    const r = 6 + Math.random()*16;
    const th = Math.random()*Math.PI*2;
    const ph = Math.acos(2*Math.random()-1);
    pPos[i*3]   = r*Math.sin(ph)*Math.cos(th);
    pPos[i*3+1] = (Math.random()-0.5)*22;
    pPos[i*3+2] = r*Math.sin(ph)*Math.sin(th);
    const c = Math.random()>.7 ? GOLD : (Math.random()>.4 ? CYAN : VIOLET);
    pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol,3));
  const pMat = new THREE.PointsMaterial({ size:0.06, vertexColors:true, transparent:true,
    opacity:.85, depthWrite:false, blending:THREE.AdditiveBlending });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── central "energy" beam connecting chip to fridge
  const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 9, 8, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:.18,
    blending:THREE.AdditiveBlending, side:THREE.DoubleSide });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 0.5;
  core.add(beam);

  // ── post-processing bloom
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.6, 0.2);
  composer.addPass(bloom);
  composer.setSize(innerWidth, innerHeight);
  composer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // ── interaction
  const target = { x:0, y:0 };
  const mouse = { x:0, y:0 };
  window.addEventListener('pointermove', e=>{
    target.x = (e.clientX/innerWidth - .5);
    target.y = (e.clientY/innerHeight - .5);
  });

  // scroll-driven camera dolly (exposed for GSAP)
  const state = { scroll:0 };
  window.__heroState = state;

  const clock = new THREE.Clock();
  let pulseT = 0;
  function animate(){
    const t = clock.getElapsedTime();
    const dt = clock.getDelta ? Math.min(clock.getDelta(),0.05) : 0.016;

    mouse.x += (target.x - mouse.x)*0.05;
    mouse.y += (target.y - mouse.y)*0.05;

    core.rotation.y = t*0.08 + mouse.x*0.5;
    core.rotation.x = mouse.y*0.18;

    rings.children.forEach(c=>{ if(c.userData.spin) c.rotation.z += c.userData.spin*0.02; });

    // qubit pulse — travelling "syndrome round"
    pulseT += dt*0.6;
    qubits.forEach((q,i)=>{
      const pulse = 0.5 + 0.5*Math.sin(t*2 + q.userData.phase);
      q.material.emissiveIntensity = q.userData.base*(0.6 + pulse*0.9);
      const s = 1 + pulse*0.25;
      q.scale.setScalar(s);
    });
    beam.material.opacity = 0.12 + 0.1*Math.sin(t*1.5);

    particles.rotation.y = t*0.012;

    // camera dolly with scroll
    const sc = state.scroll;
    camera.position.z = 17 - sc*6;
    camera.position.y = 1.2 + sc*3;
    camera.lookAt(0, -sc*2, 0);
    camera.position.x += (mouse.x*2 - camera.position.x)*0.03;

    composer.render();
    requestAnimationFrame(animate);
  }

  function resize(){
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', resize);

  animate();
  onReady && onReady();
}

// ───────────────────────────────────────────────────────────
//  LIVE SURFACE-CODE LATTICE (2D-ish projected, in canvas section)
// ───────────────────────────────────────────────────────────
function initLattice(){
  const canvas = document.getElementById('lattice-canvas');
  if(!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const resizeRenderer = ()=>{
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    camera.aspect = w/h; camera.updateProjectionMatrix();
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
  camera.position.set(0, 0, 11);
  scene.add(new THREE.AmbientLight(0xffffff, .7));
  const pl = new THREE.PointLight(0x5fe6f2, 40, 40); pl.position.set(4,5,8); scene.add(pl);

  const grp = new THREE.Group();
  scene.add(grp);

  // distance-3 tile: 3x3 data qubits + stabilizers between them
  const dataGeo = new THREE.IcosahedronGeometry(0.34, 1);
  const stabGeo = new THREE.OctahedronGeometry(0.26, 0);
  const data = [], stabs = [];
  const step = 1.7;
  // 9 data qubits on a 3x3 grid
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    const m = new THREE.Mesh(dataGeo, new THREE.MeshStandardMaterial({
      color:CYAN, emissive:CYAN, emissiveIntensity:.7, metalness:.4, roughness:.3 }));
    m.position.set((c-1)*step, (1-r)*step, 0);
    m.userData = { ph:Math.random()*6.28 };
    grp.add(m); data.push(m);
  }
  // 8 stabilizers placed around plaquettes / edges
  const stabPos = [
    [-.85, .85],[.85,.85],[-.85,-.85],[.85,-.85], // plaquette centers (X/Z)
    [0,1.7],[0,-1.7],[-1.7,0],[1.7,0]             // boundary checks
  ];
  stabPos.forEach((p,i)=>{
    const isX = i%2===0;
    const m = new THREE.Mesh(stabGeo, new THREE.MeshStandardMaterial({
      color:GOLD, emissive:GOLD, emissiveIntensity:.5, metalness:.5, roughness:.35 }));
    m.position.set(p[0]*step, p[1]*step*0.0+p[1]*step, 0);
    m.position.set(p[0]*step, p[1]*step, isX?0.35:-0.35);
    m.userData = { ph:Math.random()*6.28, X:isX };
    grp.add(m); stabs.push(m);
  });

  // links from each stabilizer to nearby data qubits
  const linkMat = new THREE.LineBasicMaterial({ color:0x44707d, transparent:true, opacity:.45 });
  const pulses = [];
  stabs.forEach(s=>{
    data.forEach(d=>{
      if(s.position.distanceTo(d.position) < step*1.25){
        const g = new THREE.BufferGeometry().setFromPoints([s.position, d.position]);
        grp.add(new THREE.Line(g, linkMat));
        pulses.push({ a:s.position.clone(), b:d.position.clone() });
      }
    });
  });

  // travelling pulse dots
  const pulseGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({ color:0xffffff, blending:THREE.AdditiveBlending, transparent:true });
  const pulseMeshes = pulses.slice(0, 14).map(p=>{
    const m = new THREE.Mesh(pulseGeo, pulseMat.clone());
    m.userData = { ...p, t:Math.random() };
    grp.add(m); return m;
  });

  const target = {x:0,y:0}, m={x:0,y:0};
  canvas.addEventListener('pointermove', e=>{
    const rect = canvas.getBoundingClientRect();
    target.x = ((e.clientX-rect.left)/rect.width - .5);
    target.y = ((e.clientY-rect.top)/rect.height - .5);
  });

  const clock = new THREE.Clock();
  let running = false;
  function loop(){
    if(!running) return;
    const t = clock.getElapsedTime();
    m.x += (target.x - m.x)*0.06; m.y += (target.y - m.y)*0.06;
    grp.rotation.y = 0.35*Math.sin(t*0.2) + m.x*0.7;
    grp.rotation.x = -0.1 + m.y*0.5;

    data.forEach(d=>{ const p=.5+.5*Math.sin(t*2.2+d.userData.ph);
      d.material.emissiveIntensity=.5+p*.9; d.scale.setScalar(1+p*.12); });
    stabs.forEach(s=>{ const p=.5+.5*Math.sin(t*3+s.userData.ph);
      s.material.emissiveIntensity=.35+p*.8; });

    pulseMeshes.forEach(pm=>{
      pm.userData.t += 0.01;
      if(pm.userData.t>1) pm.userData.t=0;
      pm.position.lerpVectors(pm.userData.a, pm.userData.b, pm.userData.t);
      pm.material.opacity = Math.sin(pm.userData.t*Math.PI);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  // start only when visible (single loop guaranteed by `running` flag)
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !running){ resizeRenderer(); running=true; loop(); }
      else if(!e.isIntersecting){ running=false; }
    });
  }, { threshold:0.02 });
  io.observe(canvas);
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

// ───────────────────────────────────────────────────────────
//  CONTACT PARTICLE FIELD
// ───────────────────────────────────────────────────────────
function initContact(){
  const canvas = document.getElementById('contact-canvas');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 100);
  camera.position.z = 14;

  const N = prefersReduced ? 300 : 900;
  const pos = new Float32Array(N*3), col = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-.5)*40; pos[i*3+1]=(Math.random()-.5)*24; pos[i*3+2]=(Math.random()-.5)*20;
    const c = Math.random()>.6?GOLD:CYAN;
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size:0.07, vertexColors:true,
    transparent:true, opacity:.7, depthWrite:false, blending:THREE.AdditiveBlending }));
  scene.add(pts);

  const target={x:0,y:0}, mm={x:0,y:0};
  window.addEventListener('pointermove', e=>{ target.x=(e.clientX/innerWidth-.5); target.y=(e.clientY/innerHeight-.5); });

  const resize=()=>{ const w=canvas.clientWidth,h=canvas.clientHeight;
    renderer.setSize(w,h,false); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    camera.aspect=w/h; camera.updateProjectionMatrix(); };
  window.addEventListener('resize', resize); resize();

  let running=false;
  const clock=new THREE.Clock();
  function loop(){ if(!running)return;
    const t=clock.getElapsedTime();
    mm.x+=(target.x-mm.x)*0.04; mm.y+=(target.y-mm.y)*0.04;
    pts.rotation.y=t*0.03+mm.x*0.4; pts.rotation.x=mm.y*0.2;
    renderer.render(scene,camera); requestAnimationFrame(loop);
  }
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting && !running){ running=true; loop(); }
    else if(!e.isIntersecting){ running=false; }
  }),{threshold:0}); io.observe(canvas);
}

// ───────────────────────────────────────────────────────────
//  BOOT
// ───────────────────────────────────────────────────────────
function boot(){
  const signalReady = ()=>{ window.__heroReady = true; window.dispatchEvent(new Event('hero-ready')); };
  try { initHero(signalReady); }
  catch(err){ console.warn('hero scene failed', err); signalReady(); }
  try { initLattice(); } catch(e){ console.warn('lattice failed', e); }
  try { initContact(); } catch(e){ console.warn('contact field failed', e); }
}
boot();
