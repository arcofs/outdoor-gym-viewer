import * as THREE from "three";
import { Box3, Color, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpFromLine,
  createIcons,
  Maximize2,
  Move3d,
  RotateCcw,
  Ruler,
  SunMedium,
  View,
  ZoomIn,
} from "lucide";
import "./styles.css";

const MODEL_STORAGE_KEY = "outdoor-gym-selected-model";

const iconSet = {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpFromLine,
  Maximize2,
  Move3d,
  RotateCcw,
  Ruler,
  SunMedium,
  View,
  ZoomIn,
};

const modelAliases = {
  portHaven: "port-haven",
  port_haven: "port-haven",
};

const modelOptions = {
  packsaddle: {
    label: "Packsaddle",
    location: "Packsaddle Village",
    title: "Outdoor Gym 3D Review",
    url: "/models/packsaddle-outdoor-gym.glb?v=20260628-no-fans",
    asset: "packsaddle-outdoor-gym.glb",
    rootName: "Packsaddle outdoor gym model",
    targetSize: 26,
    rotationY: Math.PI,
    groundColor: 0x6e4a35,
    viewPresets: {
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
    },
  },
  "port-haven": {
    label: "Port Haven",
    location: "Port Haven",
    title: "Outdoor Gym 3D Review",
    url: "/models/port-haven-outdoor-gym.glb?v=20260628-no-fans",
    asset: "port-haven-outdoor-gym.glb",
    rootName: "Port Haven outdoor gym model",
    targetSize: 26,
    rotationY: Math.PI,
    groundColor: 0x6e4a35,
    viewPresets: {
      overall: {
        label: "Overall",
        icon: "view",
        position: new Vector3(17, 9, -20),
        target: new Vector3(0, 1.5, 0),
      },
      d01: {
        label: "D01 Door",
        icon: "ruler",
        position: new Vector3(-16, 3.8, 1.5),
        target: new Vector3(-9.7, 1.2, 0),
      },
      d02: {
        label: "D02 Door",
        icon: "ruler",
        position: new Vector3(-6, 4.1, -14),
        target: new Vector3(-6.8, 1.1, -5.4),
      },
      side: {
        label: "Side Wall",
        icon: "zoom-in",
        position: new Vector3(14, 3.8, -8),
        target: new Vector3(2.2, 1.4, -4.8),
      },
      roof: {
        label: "Roof",
        icon: "sun-medium",
        position: new Vector3(8, 12, -12),
        target: new Vector3(0, 3.1, 0),
      },
    },
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
        <span id="projectLocation">Packsaddle Village</span>
        <strong id="projectName">Outdoor Gym 3D Review</strong>
      </div>
      <div class="model-switcher" id="modelSwitcher" role="group" aria-label="Select gym model"></div>
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
      <div class="move-pad" aria-label="Move camera">
        <button class="move-button move-button--forward" data-move="forward" type="button" aria-label="Move forward" title="Move forward">
          <i data-lucide="arrow-up"></i>
        </button>
        <button class="move-button move-button--left" data-move="left" type="button" aria-label="Move left" title="Move left">
          <i data-lucide="arrow-left"></i>
        </button>
        <span class="move-pad-mark" aria-hidden="true">
          <i data-lucide="move-3d"></i>
        </span>
        <button class="move-button move-button--right" data-move="right" type="button" aria-label="Move right" title="Move right">
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="move-button move-button--backward" data-move="backward" type="button" aria-label="Move backward" title="Move backward">
          <i data-lucide="arrow-down"></i>
        </button>
        <button class="move-button move-button--up" data-move="up" type="button" aria-label="Move up" title="Move up">
          <i data-lucide="arrow-up-from-line"></i>
        </button>
        <button class="move-button move-button--down" data-move="down" type="button" aria-label="Move down" title="Move down">
          <i data-lucide="arrow-down-to-line"></i>
        </button>
      </div>
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
        <strong id="assetStatus">packsaddle-outdoor-gym.glb</strong>
      </div>
      <div>
        <span class="status-label">Review</span>
        <strong id="reviewStatus">2 Gym Models</strong>
      </div>
    </section>
  </main>
`;

const canvas = document.querySelector("#viewerCanvas");
const loadPanel = document.querySelector("#loadPanel");
const loadProgress = document.querySelector("#loadProgress");
const modelStatus = document.querySelector("#modelStatus");
const assetStatus = document.querySelector("#assetStatus");
const reviewStatus = document.querySelector("#reviewStatus");
const projectLocation = document.querySelector("#projectLocation");
const projectName = document.querySelector("#projectName");
const modelSwitcher = document.querySelector("#modelSwitcher");
const toast = document.querySelector("#toast");
const viewButtons = document.querySelector("#viewButtons");
const moveButtons = document.querySelectorAll("[data-move]");

let activeModelKey = getInitialModelKey();
let activeModel = modelOptions[activeModelKey];
let modelRoot = null;
let modelBounds = null;
let loadToken = 0;

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

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.05, 250);
camera.position.copy(activeModel.viewPresets.overall.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enablePan = true;
controls.panSpeed = 0.95;
controls.screenSpacePanning = true;
controls.zoomSpeed = 0.9;
controls.zoomToCursor = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 0.75;
controls.maxDistance = 58;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};
controls.target.copy(activeModel.viewPresets.overall.target);

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
    color: activeModel.groundColor,
    roughness: 0.95,
    metalness: 0,
  }),
);
ground.name = "Viewer ground plane";
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.24;
ground.receiveShadow = true;
scene.add(ground);

const raycaster = new Raycaster();
const pointer = new Vector2();
const moveForward = new Vector3();
const moveRight = new Vector3();
const moveDelta = new Vector3();
const focusDirection = new Vector3();
const focusPosition = new Vector3();
const focusTarget = new Vector3();
const moveDirections = ["forward", "backward", "left", "right", "up", "down"];
const moveInputs = Object.fromEntries(moveDirections.map((direction) => [direction, new Set()]));
const movementState = { boost: false };
const keyMoveMap = new Map([
  ["KeyW", "forward"],
  ["ArrowUp", "forward"],
  ["KeyS", "backward"],
  ["ArrowDown", "backward"],
  ["KeyA", "left"],
  ["ArrowLeft", "left"],
  ["KeyD", "right"],
  ["ArrowRight", "right"],
  ["KeyE", "up"],
  ["PageUp", "up"],
  ["KeyQ", "down"],
  ["PageDown", "down"],
]);
const activeTouchPointers = new Set();

let touchStart = null;
let lastTap = null;
let lastFrameTime = performance.now();

createModelSwitcher();
selectModel(activeModelKey, { updateUrl: false, instantCamera: true });
refreshIcons();

document.querySelector("#resetButton").addEventListener("click", () => {
  flyTo(activeModel.viewPresets.overall);
});
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
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("dblclick", (event) => {
  event.preventDefault();
  focusOnSpot(event);
});
canvas.addEventListener("pointerdown", handleTouchStart);
canvas.addEventListener("pointerup", handleTouchEnd);
canvas.addEventListener("pointercancel", handleTouchCancel);

moveButtons.forEach((button) => {
  const direction = button.dataset.move;
  const source = `button-${direction}`;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    setMovement(direction, source, true);
    moveSingleDirection(direction, getButtonNudgeDistance());
  });

  const stopMoving = (event) => {
    if (button.hasPointerCapture?.(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    setMovement(direction, source, false);
  };

  button.addEventListener("pointerup", stopMoving);
  button.addEventListener("pointercancel", stopMoving);
  button.addEventListener("lostpointercapture", () => setMovement(direction, source, false));
});

window.addEventListener("keydown", (event) => handleKeyMovement(event, true));
window.addEventListener("keyup", (event) => handleKeyMovement(event, false));
window.addEventListener("blur", clearMovement);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearMovement();
});

function createModelSwitcher() {
  Object.entries(modelOptions).forEach(([key, model]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "model-option";
    button.dataset.model = key;
    button.textContent = model.label;
    button.addEventListener("click", () => {
      if (key !== activeModelKey) selectModel(key);
    });
    modelSwitcher.appendChild(button);
  });
}

function createViewButtons() {
  viewButtons.innerHTML = "";
  Object.entries(activeModel.viewPresets).forEach(([key, preset]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-button";
    button.dataset.view = key;
    button.innerHTML = `<i data-lucide="${preset.icon}"></i><span>${preset.label}</span>`;
    button.addEventListener("click", () => flyTo(activeModel.viewPresets[key]));
    viewButtons.appendChild(button);
  });
  refreshIcons();
}

function refreshIcons() {
  createIcons({ icons: iconSet });
}

function selectModel(modelKey, { updateUrl = true, instantCamera = false } = {}) {
  const nextModel = modelOptions[modelKey];
  if (!nextModel) return;

  activeModelKey = modelKey;
  activeModel = nextModel;
  storeSelectedModel(modelKey);
  updateModelMeta();
  updateModelSwitcher();
  createViewButtons();
  loadModel(activeModel);

  if (updateUrl) updateModelUrl(modelKey);
  if (instantCamera) {
    moveToPreset(activeModel.viewPresets.overall);
  } else {
    flyTo(activeModel.viewPresets.overall);
  }
}

function updateModelMeta() {
  projectLocation.textContent = activeModel.location;
  projectName.textContent = activeModel.title;
  assetStatus.textContent = activeModel.asset;
  reviewStatus.textContent = `${Object.keys(modelOptions).length} Gym Models`;
  document.title = `${activeModel.label} Outdoor Gym Viewer`;
}

function updateModelSwitcher() {
  document.querySelectorAll("[data-model]").forEach((button) => {
    const isActive = button.dataset.model === activeModelKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateModelUrl(modelKey) {
  const url = new URL(window.location.href);
  url.searchParams.set("gym", modelKey);
  window.history.replaceState({}, "", url);
}

function getInitialModelKey() {
  const params = new URLSearchParams(window.location.search);
  const gymParam = resolveModelKey(params.get("gym"));
  if (gymParam) return gymParam;

  const storedModel = resolveModelKey(getStoredModel());
  if (storedModel) return storedModel;

  return "packsaddle";
}

function resolveModelKey(modelKey) {
  if (!modelKey) return null;
  if (modelOptions[modelKey]) return modelKey;
  return modelAliases[modelKey] ?? null;
}

function getStoredModel() {
  try {
    return window.localStorage.getItem(MODEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSelectedModel(modelKey) {
  try {
    window.localStorage.setItem(MODEL_STORAGE_KEY, modelKey);
  } catch {
    // Browser privacy settings can block storage; the URL selector still works.
  }
}

function moveToPreset(preset) {
  camera.position.copy(preset.position);
  controls.target.copy(preset.target);
  controls.update();
}

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

function handleKeyMovement(event, isActive) {
  if (isTypingTarget(event.target)) return;

  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    movementState.boost = isActive;
    return;
  }

  const direction = keyMoveMap.get(event.code);
  if (!direction) return;

  event.preventDefault();
  setMovement(direction, `key-${event.code}`, isActive);
}

function isTypingTarget(target) {
  return target?.matches?.("input, textarea, select, [contenteditable='true']");
}

function setMovement(direction, source, isActive) {
  const inputs = moveInputs[direction];
  if (!inputs) return;

  if (isActive) {
    inputs.add(source);
  } else {
    inputs.delete(source);
  }
}

function clearMovement() {
  Object.values(moveInputs).forEach((inputs) => inputs.clear());
  movementState.boost = false;
}

function hasActiveMovement() {
  return Object.values(moveInputs).some((inputs) => inputs.size > 0);
}

function isMoving(direction) {
  return moveInputs[direction]?.size > 0;
}

function applyCameraMovement(deltaSeconds) {
  if (!hasActiveMovement()) return;

  const speed = getMovementSpeed() * (movementState.boost ? 2.35 : 1);
  moveCameraByActiveDirections(speed * deltaSeconds);
}

function moveCameraByActiveDirections(distance) {
  moveDelta.set(0, 0, 0);
  updateMoveBasis();

  if (isMoving("forward")) moveDelta.add(moveForward);
  if (isMoving("backward")) moveDelta.sub(moveForward);
  if (isMoving("right")) moveDelta.add(moveRight);
  if (isMoving("left")) moveDelta.sub(moveRight);
  if (isMoving("up")) moveDelta.y += 1;
  if (isMoving("down")) moveDelta.y -= 1;

  if (moveDelta.lengthSq() === 0) return;
  moveDelta.normalize().multiplyScalar(distance);
  translateCamera(moveDelta);
}

function moveSingleDirection(direction, distance) {
  moveDelta.set(0, 0, 0);
  updateMoveBasis();
  addDirectionToVector(direction, moveDelta);

  if (moveDelta.lengthSq() === 0) return;
  moveDelta.normalize().multiplyScalar(distance);
  translateCamera(moveDelta);
}

function addDirectionToVector(direction, targetVector) {
  if (direction === "forward") targetVector.add(moveForward);
  if (direction === "backward") targetVector.sub(moveForward);
  if (direction === "right") targetVector.add(moveRight);
  if (direction === "left") targetVector.sub(moveRight);
  if (direction === "up") targetVector.y += 1;
  if (direction === "down") targetVector.y -= 1;
}

function updateMoveBasis() {
  moveRight.setFromMatrixColumn(camera.matrixWorld, 0);
  moveRight.y = 0;

  if (moveRight.lengthSq() < 0.0001) {
    moveRight.set(1, 0, 0);
  } else {
    moveRight.normalize();
  }

  moveForward.crossVectors(camera.up, moveRight).normalize();
}

function getMovementSpeed() {
  return THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 1.15, 4.5, 18);
}

function getButtonNudgeDistance() {
  return THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.065, 0.35, 1.7);
}

function translateCamera(delta) {
  camera.position.add(delta);
  controls.target.add(delta);
  controls.update();
}

function handleTouchStart(event) {
  if (event.pointerType !== "touch") return;

  activeTouchPointers.add(event.pointerId);
  if (activeTouchPointers.size !== 1) {
    touchStart = null;
    return;
  }

  touchStart = {
    x: event.clientX,
    y: event.clientY,
    time: performance.now(),
  };
}

function handleTouchEnd(event) {
  if (event.pointerType !== "touch") return;

  const wasSingleTouch = activeTouchPointers.size === 1;
  activeTouchPointers.delete(event.pointerId);

  if (!wasSingleTouch || !touchStart) return;

  const now = performance.now();
  const moved = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
  const isTap = moved < 16 && now - touchStart.time < 320;
  touchStart = null;

  if (!isTap) return;

  const currentTap = { x: event.clientX, y: event.clientY, time: now };
  const isDoubleTap =
    lastTap &&
    currentTap.time - lastTap.time < 360 &&
    Math.hypot(currentTap.x - lastTap.x, currentTap.y - lastTap.y) < 26;

  if (isDoubleTap) {
    lastTap = null;
    focusOnSpot(event);
  } else {
    lastTap = currentTap;
  }
}

function handleTouchCancel(event) {
  if (event.pointerType !== "touch") return;
  activeTouchPointers.delete(event.pointerId);
  touchStart = null;
}

function focusOnSpot(event) {
  const hit = pickScenePoint(event);
  if (!hit) return;

  focusTarget.copy(hit.point);
  focusDirection.subVectors(camera.position, controls.target).normalize();

  if (focusDirection.lengthSq() === 0) {
    focusDirection.set(0, 0.35, 1).normalize();
  }

  const nextDistance = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.44, 1.35, 6.5);
  focusPosition.copy(focusTarget).addScaledVector(focusDirection, nextDistance);

  flyTo({ position: focusPosition.clone(), target: focusTarget.clone() });
}

function pickScenePoint(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const targets = modelRoot ? [modelRoot, ground] : [ground];
  const hits = raycaster.intersectObjects(targets, true);
  return hits[0] ?? null;
}

function normaliseModel(root, config) {
  root.position.set(0, 0, 0);
  root.rotation.set(0, config.rotationY ?? 0, 0);
  root.scale.setScalar(1);
  root.updateWorldMatrix(true, true);

  modelBounds = new Box3().setFromObject(root);
  const center = modelBounds.getCenter(new Vector3());
  root.position.sub(center);
  root.updateWorldMatrix(true, true);

  modelBounds = new Box3().setFromObject(root);
  const size = modelBounds.getSize(new Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = (config.targetSize ?? 26) / maxAxis;
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
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        material.needsUpdate = true;
      });
    }
  });
}

function loadModel(config) {
  const token = ++loadToken;
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "wasm" });
  loader.setDRACOLoader(dracoLoader);

  if (modelRoot) {
    scene.remove(modelRoot);
    disposeModel(modelRoot);
    modelRoot = null;
    modelBounds = null;
  }

  ground.material.color.setHex(config.groundColor);
  modelStatus.textContent = "Loading";
  loadProgress.textContent = "Preparing scene";
  loadPanel.classList.remove("is-hidden");

  loader.load(
    config.url,
    (gltf) => {
      dracoLoader.dispose();
      if (token !== loadToken) {
        disposeModel(gltf.scene);
        return;
      }

      modelRoot = gltf.scene;
      modelRoot.name = config.rootName;
      normaliseModel(modelRoot, config);
      scene.add(modelRoot);
      modelStatus.textContent = "Ready";
      loadPanel.classList.add("is-hidden");
      showToast(`${config.label} model ready`);
    },
    (event) => {
      if (token !== loadToken || !event.total) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      loadProgress.textContent = `${percent}%`;
    },
    (error) => {
      dracoLoader.dispose();
      if (token !== loadToken) return;
      console.error(error);
      modelStatus.textContent = "Model unavailable";
      loadProgress.textContent = "Unable to load model";
      showToast("Model failed to load");
    },
  );
}

function disposeModel(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.geometry?.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose?.();
    });
  });
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  applyCameraMovement(deltaSeconds);
  controls.update();
  if (modelRoot) {
    raycaster.setFromCamera(pointer, camera);
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", resize);

animate();
