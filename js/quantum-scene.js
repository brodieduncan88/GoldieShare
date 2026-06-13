// ═══════════════════════════════════════════════════════════
//  QMHP·CoPro — three.js scenes (light / airy theme)
//  1. Hero — metallic "cold column" render rising from bottom
//  2. Live distance-3 surface-code lattice
//  3. Contact constellation field
// ═══════════════════════════════════════════════════════════
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ACCENT = new THREE.Color('#2F6BC4');
const GOLD   = new THREE.Color('#b3873d');
const COOL   = new THREE.Color('#2a7d86');
const STEEL  = new THREE.Color('#cfd6de');

// ───────────────────────────────────────────────────────────
//  HERO — metallic cold column
// ───────────────────────────────────────────────────────────
function initHero(onReady){
  const canvas = document.getElementById('quantum-canvas');
  if(!canvas){ onReady && onReady(); return; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 1.5, 22);

  // studio environment for crisp metal reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // lights for form
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 12, 10); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4f0, 1.4); rim.position.set(-8, 4, -6); scene.add(rim);
  const fill = new THREE.PointLight(0xffe6b8, 30, 50); fill.position.set(-4, -6, 8); scene.add(fill);

  const core = new THREE.Group();
  core.position.y = -2.2;
  scene.add(core);

  // materials
  const chrome = new THREE.MeshStandardMaterial({ color:STEEL, metalness:1.0, roughness:0.16, envMapIntensity:1.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color:GOLD, metalness:1.0, roughness:0.28, envMapIntensity:1.2 });
  const darkMetal = new THREE.MeshStandardMaterial({ color:0x6b7480, metalness:.95, roughness:.35, envMapIntensity:1.1 });

  // ── vertical rod cluster (echoes the reactor-core render / coax lines)
  const rods = new THREE.Group();
  const ringR = 1.7, rodCount = 8, rodH = 9;
  const rodGeo = new THREE.CylinderGeometry(0.16, 0.16, rodH, 24);
  const capGeo = new THREE.SphereGeometry(0.2, 20, 20);
  for(let i=0;i<rodCount;i++){
    const a = (i/rodCount)*Math.PI*2;
    const x = Math.cos(a)*ringR, z = Math.sin(a)*ringR;
    const rod = new THREE.Mesh(rodGeo, i%2? chrome : darkMetal);
    rod.position.set(x, 0, z);
    rods.add(rod);
    const cap = new THREE.Mesh(capGeo, chrome);
    cap.position.set(x, rodH/2, z);
    rods.add(cap);
    // segmented collars along each rod
    for(let s=-1;s<=1;s++){
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 10, 24), goldMat);
      collar.rotation.x = Math.PI/2;
      collar.position.set(x, s*2.4, z);
      rods.add(collar);
    }
  }
  // central rod
  const centerRod = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, rodH+0.6, 28), chrome);
  rods.add(centerRod);
  core.add(rods);

  // ── stacked cryostat plates (rings/discs)
  const plates = new THREE.Group();
  const plateDefs = [
    { y: 4.6, r:2.5, mat:goldMat },
    { y: 2.3, r:2.8, mat:chrome },
    { y: 0.0, r:3.1, mat:goldMat },
    { y:-2.3, r:2.8, mat:chrome },
    { y:-4.4, r:2.4, mat:goldMat },
  ];
  plateDefs.forEach(d=>{
    const ring = new THREE.Mesh(new THREE.TorusGeometry(d.r, 0.12, 16, 96), d.mat);
    ring.rotation.x = Math.PI/2; ring.position.y = d.y;
    plates.add(ring);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(d.r-0.08, d.r-0.08, 0.06, 96),
      new THREE.MeshStandardMaterial({ color:0xd7dde4, metalness:.9, roughness:.4, envMapIntensity:1, transparent:true, opacity:.25 }));
    disc.position.y = d.y; plates.add(disc);
  });
  core.add(plates);

  // ── glowing qubit lattice at the base (the chip)
  const chip = new THREE.Group();
  chip.position.y = -5.6;
  const n = 5, sp = 0.5;
  const glowGeo = new THREE.SphereGeometry(0.075, 16, 16);
  const qubits = [];
  for(let x=0;x<n;x++)for(let z=0;z<n;z++){
    const data = (x+z)%2===0;
    const mat = new THREE.MeshStandardMaterial({ color: data?ACCENT:GOLD, emissive: data?ACCENT:GOLD,
      emissiveIntensity:1.6, metalness:.2, roughness:.4 });
    const m = new THREE.Mesh(glowGeo, mat);
    m.position.set((x-(n-1)/2)*sp, 0, (z-(n-1)/2)*sp);
    m.userData = { ph:Math.random()*6.28, base:1.6 };
    chip.add(m); qubits.push(m);
  }
  const linkMat = new THREE.LineBasicMaterial({ color:0x9fb2c8, transparent:true, opacity:.5 });
  for(let x=0;x<n;x++)for(let z=0;z<n;z++){
    const here = qubits[x*n+z];
    [[1,0],[0,1]].forEach(([dx,dz])=>{ const nx=x+dx,nz=z+dz;
      if(nx<n&&nz<n){ const g=new THREE.BufferGeometry().setFromPoints([here.position, qubits[nx*n+nz].position]);
        chip.add(new THREE.Line(g, linkMat)); } });
  }
  core.add(chip);

  // ── soft floating particles (subtle, dark on light)
  const pCount = prefersReduced ? 200 : 700;
  const pPos = new Float32Array(pCount*3);
  for(let i=0;i<pCount;i++){
    pPos[i*3]   = (Math.random()-.5)*26;
    pPos[i*3+1] = (Math.random()-.5)*24;
    pPos[i*3+2] = (Math.random()-.5)*16 - 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  const pMat = new THREE.PointsMaterial({ size:0.045, color:0x5b76a0, transparent:true, opacity:.5 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── interaction
  const target = { x:0, y:0 }, mouse = { x:0, y:0 };
  window.addEventListener('pointermove', e=>{
    target.x = (e.clientX/innerWidth - .5);
    target.y = (e.clientY/innerHeight - .5);
  });
  const state = { scroll:0 };
  window.__heroState = state;

  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x)*0.05;
    mouse.y += (target.y - mouse.y)*0.05;

    core.rotation.y = t*0.12 + mouse.x*0.6;
    core.rotation.x = mouse.y*0.12;

    qubits.forEach(q=>{ const p=.5+.5*Math.sin(t*2.4+q.userData.ph);
      q.material.emissiveIntensity = q.userData.base*(0.5+p*0.9); q.scale.setScalar(1+p*0.25); });

    particles.rotation.y = t*0.02;

    const sc = state.scroll;
    camera.position.z = 22 - sc*5;
    camera.position.y = 1.5 + sc*4;
    camera.position.x += (mouse.x*1.6 - camera.position.x)*0.04;
    camera.lookAt(0, -2.2 - sc*2.5, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  function resize(){
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', resize);
  animate();
  onReady && onReady();
}

// ───────────────────────────────────────────────────────────
//  LIVE SURFACE-CODE LATTICE
// ───────────────────────────────────────────────────────────
function initLattice(){
  const canvas = document.getElementById('lattice-canvas');
  if(!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const resizeRenderer = ()=>{
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    camera.aspect = w/h; camera.updateProjectionMatrix();
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
  camera.position.set(0, 0, 11);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.AmbientLight(0xffffff, .5));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(4,6,8); scene.add(dl);

  const grp = new THREE.Group(); scene.add(grp);
  const dataGeo = new THREE.IcosahedronGeometry(0.34, 1);
  const stabGeo = new THREE.OctahedronGeometry(0.26, 0);
  const data = [], stabs = [];
  const step = 1.7;
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    const m = new THREE.Mesh(dataGeo, new THREE.MeshStandardMaterial({
      color:ACCENT, emissive:ACCENT, emissiveIntensity:.45, metalness:.5, roughness:.25, envMapIntensity:1 }));
    m.position.set((c-1)*step, (1-r)*step, 0);
    m.userData = { ph:Math.random()*6.28 };
    grp.add(m); data.push(m);
  }
  const stabPos = [[-.85,.85],[.85,.85],[-.85,-.85],[.85,-.85],[0,1.7],[0,-1.7],[-1.7,0],[1.7,0]];
  stabPos.forEach((p,i)=>{
    const isX = i%2===0;
    const m = new THREE.Mesh(stabGeo, new THREE.MeshStandardMaterial({
      color:GOLD, emissive:GOLD, emissiveIntensity:.35, metalness:.6, roughness:.3, envMapIntensity:1 }));
    m.position.set(p[0]*step, p[1]*step, isX?0.4:-0.4);
    m.userData = { ph:Math.random()*6.28 };
    grp.add(m); stabs.push(m);
  });
  const linkMat = new THREE.LineBasicMaterial({ color:0x9fb2c8, transparent:true, opacity:.55 });
  const pulses = [];
  stabs.forEach(s=>{ data.forEach(d=>{ if(s.position.distanceTo(d.position) < step*1.25){
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([s.position,d.position]), linkMat));
    pulses.push({ a:s.position.clone(), b:d.position.clone() }); } }); });
  const pulseGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const pulseMat = new THREE.MeshStandardMaterial({ color:0xffffff, emissive:ACCENT, emissiveIntensity:2 });
  const pulseMeshes = pulses.slice(0,14).map(p=>{ const m=new THREE.Mesh(pulseGeo, pulseMat.clone());
    m.userData={...p, t:Math.random()}; grp.add(m); return m; });

  const target={x:0,y:0}, mm={x:0,y:0};
  canvas.addEventListener('pointermove', e=>{ const r=canvas.getBoundingClientRect();
    target.x=((e.clientX-r.left)/r.width-.5); target.y=((e.clientY-r.top)/r.height-.5); });

  const clock = new THREE.Clock();
  let running = false;
  function loop(){ if(!running) return;
    const t = clock.getElapsedTime();
    mm.x+=(target.x-mm.x)*0.06; mm.y+=(target.y-mm.y)*0.06;
    grp.rotation.y = 0.3*Math.sin(t*0.2) + mm.x*0.7;
    grp.rotation.x = -0.08 + mm.y*0.5;
    data.forEach(d=>{ const p=.5+.5*Math.sin(t*2.2+d.userData.ph);
      d.material.emissiveIntensity=.3+p*.6; d.scale.setScalar(1+p*.1); });
    stabs.forEach(s=>{ const p=.5+.5*Math.sin(t*3+s.userData.ph); s.material.emissiveIntensity=.25+p*.55; });
    pulseMeshes.forEach(pm=>{ pm.userData.t+=0.01; if(pm.userData.t>1) pm.userData.t=0;
      pm.position.lerpVectors(pm.userData.a, pm.userData.b, pm.userData.t); });
    renderer.render(scene, camera); requestAnimationFrame(loop);
  }
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting && !running){ resizeRenderer(); running=true; loop(); }
    else if(!e.isIntersecting){ running=false; }
  }), { threshold:0.02 });
  io.observe(canvas);
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

// ───────────────────────────────────────────────────────────
//  CONTACT — constellation (dark points on light gradient)
// ───────────────────────────────────────────────────────────
function initContact(){
  const canvas = document.getElementById('contact-canvas');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 100);
  camera.position.z = 14;

  const N = prefersReduced ? 240 : 700;
  const pos = new Float32Array(N*3), col = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-.5)*42; pos[i*3+1]=(Math.random()-.5)*24; pos[i*3+2]=(Math.random()-.5)*18;
    const c = Math.random()>.7?GOLD:ACCENT;
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size:0.08, vertexColors:true,
    transparent:true, opacity:.55, depthWrite:false }));
  scene.add(pts);

  const target={x:0,y:0}, mm={x:0,y:0};
  window.addEventListener('pointermove', e=>{ target.x=(e.clientX/innerWidth-.5); target.y=(e.clientY/innerHeight-.5); });
  const resize=()=>{ const w=canvas.clientWidth,h=canvas.clientHeight;
    renderer.setSize(w,h,false); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    camera.aspect=w/h; camera.updateProjectionMatrix(); };
  window.addEventListener('resize', resize); resize();

  let running=false; const clock=new THREE.Clock();
  function loop(){ if(!running)return; const t=clock.getElapsedTime();
    mm.x+=(target.x-mm.x)*0.04; mm.y+=(target.y-mm.y)*0.04;
    pts.rotation.y=t*0.025+mm.x*0.4; pts.rotation.x=mm.y*0.2;
    renderer.render(scene,camera); requestAnimationFrame(loop);
  }
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting && !running){ running=true; loop(); } else if(!e.isIntersecting){ running=false; }
  }),{threshold:0}); io.observe(canvas);
}

// ───────────────────────────────────────────────────────────
function boot(){
  const signalReady = ()=>{ window.__heroReady = true; window.dispatchEvent(new Event('hero-ready')); };
  try { initHero(signalReady); }
  catch(err){ console.warn('hero scene failed', err); signalReady(); }
  try { initLattice(); } catch(e){ console.warn('lattice failed', e); }
  try { initContact(); } catch(e){ console.warn('contact field failed', e); }
}
boot();
