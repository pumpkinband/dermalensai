// Page-local adaptation of the supplied DottedSurface component for GitHub Pages.
// Build from this directory with npm install && npm run build.
// Three.js is bundled locally; no CDN or React runtime is needed by this page.
import * as THREE from 'three';

const container = document.getElementById('dotted-surface');
const pauseButton = document.getElementById('motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const colorScheme = matchMedia('(prefers-color-scheme: dark)');
let renderer;

try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
} catch {
  // The CSS dot field remains visible if WebGL is unavailable.
  pauseButton.hidden = true;
}

if (renderer) {
  pauseButton.hidden = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);
  camera.position.set(0, 355, 1220);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(40 * 60 * 3);
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 60; y++) {
      const i = (x * 60 + y) * 3;
      positions[i] = x * 150 - 3000;
      positions[i + 2] = y * 150 - 4500;
    }
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // A circular sprite makes the surface read as dots at every pixel density.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const ctx = sprite.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(16, 16, 15, 0, Math.PI * 2);
  ctx.fill();
  const map = new THREE.CanvasTexture(sprite);
  const material = new THREE.PointsMaterial({
    size: 12, opacity: 0.9, transparent: true, sizeAttenuation: true,
    map, depthWrite: false, alphaTest: 0.02,
  });
  scene.add(new THREE.Points(geometry, material));
  scene.fog = new THREE.Fog(0xffffff, 2000, 10000);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  container.classList.add('ready');
  let frame = 0;
  let phase = 0;
  let previous = 0;
  let visible = true;
  let paused = reducedMotion.matches;
  let disposed = false;

  function draw() {
    for (let x = 0; x < 40; x++) {
      for (let y = 0; y < 60; y++) {
        positions[(x * 60 + y) * 3 + 1] =
          Math.sin((x + phase) * 0.3) * 50 + Math.sin((y + phase) * 0.5) * 50;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  function tick(time) {
    if (disposed) return;
    phase += previous ? Math.min(time - previous, 50) * 0.003 : 0;
    previous = time;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.dataset.paused = String(paused);
    document.dispatchEvent(new Event('company-motion-change'));
    if (!paused && visible && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
    else if (!disposed) draw();
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    draw();
  }
  function theme() {
    const styles = getComputedStyle(document.documentElement);
    material.color.set(styles.getPropertyValue('--surface-dot').trim());
    scene.fog.color.set(styles.getPropertyValue('--paper').trim());
    draw();
  }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(container);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(container);
  const changeMotion = () => { paused = reducedMotion.matches; sync(); };
  const toggleMotion = () => { paused = !paused; sync(); };
  const visibility = () => sync();
  const themeObserver = new MutationObserver(theme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  reducedMotion.addEventListener('change', changeMotion);
  colorScheme.addEventListener('change', theme);
  pauseButton.addEventListener('click', toggleMotion);
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    dispose();
  }, { once: true });
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    sizeObserver.disconnect();
    themeObserver.disconnect();
    reducedMotion.removeEventListener('change', changeMotion);
    colorScheme.removeEventListener('change', theme);
    pauseButton.removeEventListener('click', toggleMotion);
    document.removeEventListener('visibilitychange', visibility);
    geometry.dispose();
    material.dispose();
    map.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    container.classList.remove('ready');
    pauseButton.hidden = true;
  }
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); });
  window.addEventListener('pageshow', sync);
  resize();
  theme();
  sync();
}
