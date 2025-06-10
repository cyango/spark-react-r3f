# React + r3f

A basic example of using Spark in a React app. This example uses React Three Fiber to create a basic scene with a camera with [`CameraControls`](https://drei.docs.pmnd.rs/controls/camera-controls), a [`SparkRenderer`](./src/components/spark/SparkRenderer.tsx), and a [`SplatMesh`](./src/components/spark/SplatMesh.tsx).

In order to use Spark elements declaratively with JSX, we use React Three Fiber's [`extend`](https://r3f.docs.pmnd.rs/api/typescript#extend-usage) function. See [`src/components/spark/SplatMesh.tsx`](./src/components/spark/SplatMesh.tsx) and [`src/components/spark/SparkRenderer.tsx`](./src/components/spark/SparkRenderer.tsx) as examples.

## Running the example

First, download the assets:

```bash
npm run assets:download
```

Then, run the development server:

```bash
npm install
npm run dev
```
