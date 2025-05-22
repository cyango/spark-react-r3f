# React + r3f

A basic example of using Forge in a React app. This example uses React Three Fiber to create a basic scene with a camera with [`CameraControls`](https://drei.docs.pmnd.rs/controls/camera-controls), a [`ForgeRenderer`](./src/components/forge/SplatRenderer.tsx), and a [`SplatMesh`](./src/components/forge/SplatMesh.tsx).

In order to use Forge elements declaratively with JSX, we use React Three Fiber's [`extend`](https://r3f.docs.pmnd.rs/api/typescript#extend-usage) function. See [`src/components/forge/SplatMesh.tsx`](./src/components/forge/SplatMesh.tsx) and [`src/components/forge/SplatRenderer.tsx`](./src/components/forge/SplatRenderer.tsx) as examples.

## Running the example

```bash
npm install
npm run dev
```
