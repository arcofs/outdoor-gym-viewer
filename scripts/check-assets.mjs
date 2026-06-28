import { access } from "node:fs/promises";

const required = [
  "public/logos/arco.png",
  "public/logos/bhp.png",
  "public/models/outdoor-gym.glb",
  "public/models/packsaddle-outdoor-gym.glb",
  "public/models/port-haven-outdoor-gym.glb",
];

await Promise.all(required.map((file) => access(new URL(`../${file}`, import.meta.url))));
console.log("Viewer assets present.");
