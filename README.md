# Outdoor Gym 3D Viewer

Client-facing 3D viewer for the Packsaddle Village and Port Haven outdoor gym renders.

Live site: https://outdoor-gym.arcofs.app

## Updating The 3D Models

Replace the relevant GLB export:

```text
public/models/packsaddle-outdoor-gym.glb
public/models/port-haven-outdoor-gym.glb
```

The legacy `public/models/outdoor-gym.glb` path is kept for backwards compatibility.

Then commit and push to `main`. GitHub Actions triggers Coolify to redeploy the live viewer automatically.

The selected gym is stored in the URL with the `gym` query parameter:

```text
/?gym=packsaddle
/?gym=port-haven
```

## Local Check

```bash
npm install
npm run lint
npm run build
npm run dev
```
