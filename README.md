# Outdoor Gym 3D Viewer

Client-facing 3D viewer for the Packsaddle Village outdoor gym render.

Live site: https://outdoor-gym.arcofs.app

## Updating The 3D Model

Replace this file with the latest GLB export:

```text
public/models/outdoor-gym.glb
```

Then commit and push to `main`. GitHub Actions will trigger Coolify to redeploy the live viewer automatically.

## Local Check

```bash
npm install
npm run build
npm run dev
```
