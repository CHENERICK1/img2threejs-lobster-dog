import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLobsterDog, type NamedPart } from './model';

// --- Setup ---
const container = document.getElementById('canvas-container')!;
const loadingOverlay = document.getElementById('loading-overlay')!;
const errorOverlay = document.getElementById('error-overlay')!;
const selectedPartEl = document.getElementById('selected-part')!;
const partNameEl = document.getElementById('part-name')!;
const partInfoEl = document.getElementById('part-info')!;
const explodeSlider = document.getElementById('explode-slider') as HTMLInputElement;
const explodeValue = document.getElementById('explode-value')!;
const bgSelect = document.getElementById('bg-select') as HTMLSelectElement;
const btnReset = document.getElementById('btn-reset')!;
const btnAutoRotate = document.getElementById('btn-autorotate')!;
const btnReference = document.getElementById('btn-reference')!;
const btnSideBySide = document.getElementById('btn-sidebyside')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 20);
camera.position.set(0, 0.6, 3.2);
camera.lookAt(0, 0.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

try {
  renderer.render(scene, camera);
} catch {
  loadingOverlay.style.display = 'none';
  errorOverlay.style.display = 'flex';
  throw new Error('WebGL not available');
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.8;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI / 1.8;
controls.update();

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(3, 4, 3);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
fillLight.position.set(-2, 1, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(-1, 2, -3);
scene.add(rimLight);

const backLight = new THREE.DirectionalLight(0x4466ff, 0.3);
backLight.position.set(0, -1, -2);
scene.add(backLight);

// --- Ground ---
const groundGeo = new THREE.PlaneGeometry(6, 6);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.3, color: 0x000000 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// Helper Grid
const gridHelper = new THREE.GridHelper(3, 12, 0x444466, 0x333355);
gridHelper.position.y = -0.05;
scene.add(gridHelper);

// --- Build Model ---
const { group: modelGroup, parts: modelParts } = buildLobsterDog();
modelGroup.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
scene.add(modelGroup);

// Store original positions for explode
let allParts = modelParts;
let isExploding = false;
let explodeAmount = 0;

// --- Reference Image Overlay ---
let refImage: HTMLImageElement | null = null;
let refOverlay: HTMLCanvasElement | null = null;
let showReference = false;
let showSideBySide = true;

function createReferenceOverlay(): void {
  if (refOverlay) return;
  const img = new Image();
  img.src = './reference.png';
  refImage = img;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'ref-overlay';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '5';
    canvas.style.opacity = showReference ? '0.5' : '0';
    canvas.style.transition = 'opacity 0.3s';
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(img, 0, 0);
    refOverlay = canvas;
    document.body.appendChild(canvas);
    updateComparisonMode();
  };
}
createReferenceOverlay();

function updateComparisonMode(): void {
  if (!refOverlay) return;
  if (showReference) {
    refOverlay.style.opacity = '0.4';
    refOverlay.style.width = '40%';
    refOverlay.style.height = 'auto';
    refOverlay.style.left = '0';
    refOverlay.style.top = '0';
    refOverlay.style.bottom = 'auto';
    refOverlay.style.right = 'auto';
    btnReference.classList.add('active');
    btnSideBySide.classList.remove('active');
  } else if (showSideBySide) {
    refOverlay.style.opacity = '1';
    refOverlay.style.width = '40%';
    refOverlay.style.height = 'auto';
    refOverlay.style.left = '0';
    refOverlay.style.top = '0';
    refOverlay.style.bottom = 'auto';
    refOverlay.style.right = 'auto';
    btnReference.classList.remove('active');
    btnSideBySide.classList.add('active');
  } else {
    refOverlay.style.opacity = '0';
    btnReference.classList.remove('active');
    btnSideBySide.classList.remove('active');
  }
}

btnReference.addEventListener('click', () => {
  showReference = !showReference;
  if (showReference) showSideBySide = false;
  updateComparisonMode();
});

btnSideBySide.addEventListener('click', () => {
  showSideBySide = !showSideBySide;
  if (showSideBySide) showReference = false;
  updateComparisonMode();
});

// --- Part Picking ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const meshes: THREE.Mesh[] = [];
  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.isPart) {
      meshes.push(child);
    }
  });
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const partId = hit.userData.partId;
    const part = allParts.find(p => p.id === partId);
    if (part) {
      selectedPartEl.style.display = 'block';
      partNameEl.textContent = part.info.name;
      partInfoEl.textContent = part.info.description + ` (confidence: ${part.info.confidence})`;
    }
  } else {
    selectedPartEl.style.display = 'none';
  }
});

// --- Explode ---
explodeSlider.addEventListener('input', () => {
  explodeAmount = parseInt(explodeSlider.value) / 100;
  explodeValue.textContent = `${explodeSlider.value}%`;
  applyExplode(explodeAmount);
});

function applyExplode(amount: number): void {
  for (const part of allParts) {
    const dir = part.originalPosition.clone().normalize();
    const dist = part.originalPosition.length() * amount * 0.5;
    part.object3D.position.copy(part.originalPosition);
    part.object3D.position.add(dir.multiplyScalar(dist));
  }
}

// --- Background ---
bgSelect.addEventListener('change', () => {
  const val = bgSelect.value;
  if (val === 'dark') scene.background = new THREE.Color(0x1a1a2e);
  else if (val === 'light') scene.background = new THREE.Color(0xe8e8f0);
  else if (val === 'grid') {
    scene.background = new THREE.Color(0x1a1a2e);
    gridHelper.visible = true;
    return;
  }
  gridHelper.visible = false;
});

// --- Reset Camera ---
const initialCamPos = new THREE.Vector3(0, 0.6, 3.2);
const initialTarget = new THREE.Vector3(0, 0.6, 0);

btnReset.addEventListener('click', () => {
  camera.position.copy(initialCamPos);
  controls.target.copy(initialTarget);
  controls.update();
});

// --- Auto-rotate ---
let autoRotate = false;
btnAutoRotate.addEventListener('click', () => {
  autoRotate = !autoRotate;
  btnAutoRotate.classList.toggle('active');
});

// --- Resize ---
function onResize(): void {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// --- Animation Loop ---
let lastTime = performance.now();
function animate(time: number): void {
  requestAnimationFrame(animate);

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  if (autoRotate) {
    const pivot = new THREE.Vector3(0, 0.6, 0);
    const radius = camera.position.distanceTo(pivot);
    const angle = dt * 0.5;
    const relPos = camera.position.clone().sub(pivot);
    const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    relPos.applyQuaternion(rot);
    camera.position.copy(pivot.clone().add(relPos));
    camera.lookAt(pivot);
    controls.target.copy(pivot);
    controls.update();
  }

  controls.update();
  renderer.render(scene, camera);
}

// --- Start ---
loadingOverlay.style.display = 'none';
animate(performance.now());

console.log('Lobster Dog 3D Viewer initialized');
console.log(`${allParts.length} named parts loaded`);
