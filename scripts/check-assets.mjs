import { access } from "node:fs/promises";

const required = [
  "public/logos/arco.png",
  "public/logos/bhp.png",
  "public/models/outdoor-gym.glb",
];

await Promise.all(required.map((file) => access(new URL(`../${file}`, import.meta.url))));
console.log("Viewer assets present.");
