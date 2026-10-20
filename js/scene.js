// Scroll-driven data sculpture: scattered blocks (raw data) → grid (structure)
// → 3D bar chart (analysis) → one highlighted series with a trend line (decision).
import * as THREE from './vendor/three.module.min.js';

const INK = new THREE.Color('#ece7dc'); // light blocks on the dark page
const FADED = new THREE.Color('#34343a');
const ACCENT = new THREE.Color('#f2552c');

const COLS = 12;
const ROWS = 7;
const N = COLS * ROWS;
const GAP = 1;
const SIZE = 0.7;
const HIGHLIGHT_ROW = ROWS - 1; // front row, nearest the camera, so nothing hides it

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, from, to) => ease(clamp((p - from) / (to - from)));

// Deterministic pseudo-random so the sculpture looks the same on every visit
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function initScene(container, storyEl) {
  const canvas = container.querySelector('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    container.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a30, 1.3));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-6, 14, 9);
  scene.add(sun);

  const group = new THREE.Group();
  scene.add(group);

  // Bars: one InstancedMesh, base of each box at y = 0
  const geo = new THREE.BoxGeometry(SIZE, 1, SIZE);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  const bars = new THREE.InstancedMesh(geo, mat, N);
  bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(bars);

  const rand = rng(7);
  const items = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gx = (c - (COLS - 1) / 2) * GAP;
      const gz = (r - (ROWS - 1) / 2) * GAP;
      // Rising series with seasonal wobble; the highlighted row trends up most clearly
      const trend = 0.5 + c * 0.22;
      const wobble = Math.sin(c * 0.9 + r * 1.7) * 0.5 + (rand() - 0.5) * 0.5;
      const lead = 0.8 + c * 0.42 + Math.sin(c * 1.3) * 0.25;
      // Background series stay below the highlighted one so its trend reads clearly
      const h = r === HIGHLIGHT_ROW ? lead : Math.min(lead * 0.75, Math.max(0.3, trend * (0.6 + r * 0.05) + wobble));
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const rad = 4 + rand() * 4.5;
      items.push({
        r, c, h,
        grid: new THREE.Vector3(gx, 0, gz),
        scatter: new THREE.Vector3(rad * Math.sin(phi) * Math.cos(theta), 2.5 + rad * Math.cos(phi) * 0.6, rad * Math.sin(phi) * Math.sin(theta)),
        spin: new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
        delay: (c + r) / (COLS + ROWS),
      });
    }
  }

  // Graph-paper ground that fades in as the data gets structured
  const ground = new THREE.GridHelper(COLS + 2, COLS + 2, 0x3a3a42, 0x3a3a42);
  ground.material.transparent = true;
  ground.material.opacity = 0;
  ground.position.y = -0.001;
  group.add(ground);

  // Trend line + dots over the highlighted row
  const tops = items.filter((it) => it.r === HIGHLIGHT_ROW).map((it) => new THREE.Vector3(it.grid.x, it.h + 0.35, it.grid.z));
  const curve = new THREE.CatmullRomCurve3(tops);
  const linePts = curve.getPoints(120);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: ACCENT }));
  lineGeo.setDrawRange(0, 0);
  group.add(line);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: ACCENT }), tops.length);
  group.add(dots);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const qIdentity = new THREE.Quaternion();
  const qSpin = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const col = new THREE.Color();

  function update(p, t) {
    for (let i = 0; i < N; i++) {
      const it = items[i];
      const a = span(p, 0.04 + it.delay * 0.16, 0.26 + it.delay * 0.16); // scatter → grid
      const b = span(p, 0.4 + it.c * 0.012, 0.6 + it.c * 0.012); // grow
      pos.lerpVectors(it.scatter, it.grid, a);
      if (a < 1 && !reduceMotion) pos.y += Math.sin(t * 0.6 + i) * 0.12 * (1 - a);
      qSpin.setFromEuler(it.spin);
      q.slerpQuaternions(qSpin, qIdentity, a);
      const height = THREE.MathUtils.lerp(SIZE, 0.08, a) + (it.h - 0.08) * b;
      scl.set(1, height, 1);
      m.compose(pos, q, scl);
      bars.setMatrixAt(i, m);

      const hl = span(p, 0.72, 0.86);
      col.copy(INK).lerp(it.r === HIGHLIGHT_ROW ? ACCENT : FADED, hl);
      bars.setColorAt(i, col);
    }
    bars.instanceMatrix.needsUpdate = true;
    bars.instanceColor.needsUpdate = true;

    ground.material.opacity = 0.9 * span(p, 0.15, 0.35);

    const lineT = span(p, 0.8, 0.96);
    lineGeo.setDrawRange(0, Math.floor(linePts.length * lineT));
    tops.forEach((v, i) => {
      const s = clamp(lineT * tops.length - i) * 1;
      m.compose(v, qIdentity, scl.set(s, s, s));
      dots.setMatrixAt(i, m);
    });
    dots.instanceMatrix.needsUpdate = true;

    // Camera: high three-quarter view → lower, more frontal "presentation" view
    const sway = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.06 * (1 - span(p, 0, 0.3));
    const theta = THREE.MathUtils.lerp(-0.95, -0.42, ease(p)) + sway + (reduceMotion ? 0 : t * 0.02 * (1 - span(p, 0, 0.2)));
    const elev = THREE.MathUtils.lerp(0.72, 0.36, ease(p));
    const aspect = camera.aspect;
    const radius = THREE.MathUtils.lerp(29, 25, ease(p)) * (aspect < 1 ? 1.35 / Math.max(aspect, 0.5) * 0.9 : 1);
    camera.position.set(Math.sin(theta) * Math.cos(elev) * radius, Math.sin(elev) * radius, Math.cos(theta) * Math.cos(elev) * radius);
    camera.lookAt(0, THREE.MathUtils.lerp(1.6, 2.2, p), 0);
  }

  // Measure the sticky box the canvas sits in, not the tall grid column around it
  const box = canvas.parentElement;
  function resize() {
    const w = box.clientWidth;
    const h = box.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(box);
  resize();

  function target() {
    if (reduceMotion) return 1;
    const rect = storyEl.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    return total > 0 ? clamp(-rect.top / total) : 0;
  }

  let current = target();
  let visible = true;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = 0;
    const goal = target();
    current += (goal - current) * (reduceMotion ? 1 : 0.08);
    update(current, clock.getElapsedTime());
    renderer.render(scene, camera);
    if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }).observe(container);

  if (reduceMotion) {
    window.addEventListener('resize', () => requestAnimationFrame(frame));
  }

  frame();
  container.classList.add('is-ready');
}
