import * as THREE from "three";
import { Box3, Color, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createIcons, Maximize2, RotateCcw, Ruler, SunMedium, View, ZoomIn } from "lucide";
import "./styles.css";

const MODEL_URL = "/models/outdoor-gym.glb";

const viewPresets = {
  overall: {
    label: "Overall",
    icon: "view",
    position: new Vector3(16, 9, -20),
    target: new Vector3(0, 1.5, 0),
  },
  d01: {
    label: "D01 Ramp",
    icon: "ruler",
    position: new Vector3(10, 3.8, -14),
    target: new Vector3(3.6, 0.55, -8.1),
  },
  d02: {
    label: "D02 Ramp",
    icon: "ruler",
    position: new Vector3(10, 4.2, 17),
    target: new Vector3(4.5, 0.55, 10.2),
  },
  side: {
    label: "Side Wall",
    icon: "zoom-in",
    position: new Vector3(13, 3.5, -9),
    target: new Vector3(1.6, 1.35, -5.2),
  },
  roof: {
    label: "Roof",
    icon: "sun-medium",
    position: new Vector3(8, 12, -12),
    target: new Vector3(0, 3.1, 0),
  },
};

const app = document.querySelector("#app");
app.innerHTML = `
  <main class="viewer-shell">
    <section class="topbar">
      <div class="brand-lockup">
        <img src="/logos/arco.png" alt="Arco" class="logo logo-arco" />
        <span class="divider"></span>
        <img src="/logos/bhp.png" alt="BHP" class="logo logo-bhp" />
      </div>
      <div class="project-title">
        <span>Packsaddle Village</span>
        <strong>Outdoor Gym 3D Review</strong>
      </div>
      <button class="icon-button" id="fullscreenButton" type="button" aria-label="Fullscreen" title="Fullscreen">
        <i data-lucide="maximize-2"></i>
      </button>
    </section>

    <section class="viewport-wrap">
      <canvas id="viewerCanvas" aria-label="Interactive 3D model"></canvas>
      <div class="load-panel" id="loadPanel">
        <div class="load-mark"></div>
        <strong>Loading 3D model</strong>
        <span id="loadProgress">Preparing scene</span>
      </div>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </section>

    <aside class="control-rail" aria-label="View controls">
      <div class="view-buttons" id="viewButtons"></div>
      <button class="control-button" id="resetButton" type="button">
        <i data-lucide="rotate-ccw"></i>
        <span>Reset</span>
      </button>
    </aside>

    <section class="status-strip">
      <div>
        <span class="status-label">Model</span>
        <strong id="modelStatus">Loading</strong>
      </div>
      <div>
        <span class="status-label">Asset</span>
        <strong>outdoor-gym.glb</strong>
      </div>
      <div>
        <span class="status-label">Review</span>
        <strong>Client 3D Viewer</strong>
      </div>
    </section>
  </main>
`;

const canvas = document.querySelector("#viewerCanvas");
const loadPanel = document.querySelector("#loadPanel");
const loadProgress = document.querySelector("#loadProgress");
const modelStatus = document.querySelector("#modelStatus");
const toast = document.querySelector("#toast");
const viewButtons = document.querySelector("#viewButtons");

const scene = new THREE.Scene();
scene.background = new Color(0x14181d);
scene.fog = new THREE.Fog(0x14181d, 34, 72);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.copy(viewPresets.overall.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 4;
controls.maxDistance = 52;
controls.target.copy(viewPresets.overall.target);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const ambient = new THREE.HemisphereLight(0xf5f8ff, 0x775335, 1.4);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff2d2, 2.8);
sun.position.set(-11, -12, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 70;
sun.shadow.camera.left = -26;
sun.shadow.camera.right = 26;
sun.shadow.camera.top = 26;
sun.shadow.camera.bottom = -26;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x93b7ff, 0.65);
fill.position.set(12, 18, 9);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(46, 96),
  new THREE.MeshStandardMaterial({
    color: 0x6e4a35,
    roughness: 0.95,
    metalness: 0,
  }),
);
ground.name = "Viewer ground plane";
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.24;
ground.receiveShadow = true;
scene.add(ground);

let modelRoot = null;
let modelBounds = null;
const raycaster = new Raycaster();
const pointer = new Vector2();

Object.entries(viewPresets).forEach(([key, preset]) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "control-button";
  button.dataset.view = key;
  button.innerHTML = `<i data-lucide="${preset.icon}"></i><span>${preset.label}</span>`;
  viewButtons.appendChild(button);
});
createIcons({
  icons: {
    Maximize2,
    RotateCcw,
    Ruler,
    SunMedium,
    View,
    ZoomIn,
  },
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => flyTo(viewPresets[button.dataset.view]));
});

document.querySelector("#resetButton").addEventListener("click", () => flyTo(viewPresets.overall));
document.querySelector("#fullscreenButton").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => showToast("Fullscreen unavailable"));
  } else {
    document.exitFullscreen();
  }
});

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

function flyTo(preset) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const duration = 820;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPosition, preset.position, eased);
    controls.target.lerpVectors(startTarget, preset.target, eased);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2000);
}

function normaliseModel(root) {
  modelBounds = new Box3().setFromObject(root);
  const center = modelBounds.getCenter(new Vector3());
  root.position.sub(center);
  root.rotation.y = Math.PI;
  root.updateWorldMatrix(true, true);
  modelBounds = new Box3().setFromObject(root);

  const size = modelBounds.getSize(new Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z);
  const targetSize = 26;
  const scale = targetSize / maxAxis;
  root.scale.setScalar(scale);
  root.updateWorldMatrix(true, true);
  modelBounds = new Box3().setFromObject(root);
  const bottom = modelBounds.min.y;
  root.position.y -= bottom;
  root.updateWorldMatrix(true, true);

  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    if (node.material) {
      node.material.side = THREE.FrontSide;
      node.material.needsUpdate = true;
    }
  });
}

function loadModel() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "wasm" });
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    MODEL_URL,
    (gltf) => {
      modelRoot = gltf.scene;
      modelRoot.name = "Outdoor gym model";
      normaliseModel(modelRoot);
      scene.add(modelRoot);
      modelStatus.textContent = "Ready";
      loadPanel.classList.add("is-hidden");
      showToast("Model ready");
    },
    (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      loadProgress.textContent = `${percent}%`;
    },
    (error) => {
      console.error(error);
      modelStatus.textContent = "Model unavailable";
      loadProgress.textContent = "Unable to load model";
      showToast("Model failed to load");
    },
  );
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (modelRoot) {
    raycaster.setFromCamera(pointer, camera);
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", resize);

loadModel();
animate();
