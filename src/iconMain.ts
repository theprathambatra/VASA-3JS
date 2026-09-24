import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createVasaIconModel } from './createVasaIconModel';

const canvas = document.querySelector<HTMLCanvasElement>('#icon-viewer')!;
const status = document.querySelector<HTMLElement>('#view-status')!;
const fallback = document.querySelector<HTMLElement>('#icon-fallback')!;
function showFallback(error: unknown) {
  console.error('VASA icon: interactive view unavailable', error);
  canvas.hidden = true;
  fallback.hidden = false;
  status.textContent = 'FRONT MARK PREVIEW';
  document.querySelector<HTMLElement>('.hint')!.textContent = 'The interactive view requires WebGL.';
  document.querySelectorAll<HTMLButtonElement>('.controls button').forEach(button => button.disabled = true);
}

try {
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xfff9ec, 0x48311a, 1.9));
const light = new THREE.DirectionalLight(0xffedcf, 3.0);
light.position.set(-2, 3, 5);
scene.add(light);
const rim = new THREE.DirectionalLight(0xf1c989, 1.35);
rim.position.set(4, 1, -4);
scene.add(rim);

const model = createVasaIconModel();
scene.add(model.root);
const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 40);
camera.position.set(0, 0, 6);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = false;
controls.minZoom = 0.75;
controls.maxZoom = 2.4;
controls.rotateSpeed = 0.62;
controls.autoRotateSpeed = 0.9;
controls.update();

const viewPositions: Record<string, THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, 6),
  angle: new THREE.Vector3(2.4, 0.8, 5.3),
  side: new THREE.Vector3(5.8, 0.25, 0.5),
};
let destination: THREE.Vector3 | null = null;
let currentView = 'front';
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-view]')];
const rotateButton = document.querySelector<HTMLButtonElement>('#turntable')!;

function setView(view: string) {
  const position = viewPositions[view];
  if (!position) return;
  currentView = view;
  destination = position.clone();
  controls.autoRotate = false;
  rotateButton.setAttribute('aria-pressed', 'false');
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  status.textContent = `${view.toUpperCase()} VIEW`;
}
buttons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view!)));
rotateButton.addEventListener('click', () => {
  const active = !controls.autoRotate;
  controls.autoRotate = active;
  rotateButton.setAttribute('aria-pressed', String(active));
  destination = null;
  buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  status.textContent = active ? 'TURNTABLE' : 'FREE ORBIT';
});
canvas.addEventListener('pointerdown', () => {
  destination = null;
  controls.autoRotate = false;
  rotateButton.setAttribute('aria-pressed', 'false');
  buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  status.textContent = 'FREE ORBIT';
});

function resize() {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  renderer.setSize(width, height, false);
  const halfHeight = 1.8;
  const halfWidth = halfHeight * width / height;
  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

const clock = new THREE.Clock();
function frame() {
  const delta = Math.min(clock.getDelta(), 0.05);
  if (destination) {
    camera.position.lerp(destination, 1 - Math.exp(-5.2 * delta));
    if (camera.position.distanceTo(destination) < 0.008) {
      camera.position.copy(destination);
      destination = null;
    }
  }
  controls.update(delta);
  renderer.render(scene, camera);
  fallback.hidden = true;
  requestAnimationFrame(frame);
}
frame();
document.addEventListener('visibilitychange', () => { if (document.hidden) controls.autoRotate = false; });
window.addEventListener('keydown', event => {
  if (event.key === '1') setView('front');
  if (event.key === '2') setView('angle');
  if (event.key === '3') setView('side');
});
(window as unknown as { vasaIconScene: object }).vasaIconScene = { scene, camera, model, controls, setView, currentView };
} catch (error) {
  showFallback(error);
}
