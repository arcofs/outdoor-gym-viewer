import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const sourceDir = join(rootDir, "node_modules", "three", "examples", "jsm", "libs", "draco");
const targetDir = join(rootDir, "public", "draco");

mkdirSync(targetDir, { recursive: true });

for (const filename of ["draco_decoder.js", "draco_decoder.wasm", "draco_wasm_wrapper.js"]) {
  copyFileSync(join(sourceDir, filename), join(targetDir, filename));
}
