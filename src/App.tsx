import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SplatMesh } from "./components/spark/SplatMesh";
import { SparkRenderer } from "./components/spark/SparkRenderer";
import { CameraControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { SplatMesh as SparkSplatMesh } from "@sparkjsdev/spark";
import { noEvents, PointerEvents } from "@react-three/xr/dist/events";
import { createXRStore, XR } from "@react-three/xr/dist/xr";

function App() {
  const store = createXRStore();

  return (
    <div className="flex h-screen w-screen">
      <Canvas gl={{ antialias: false }} events={noEvents}>
        <PointerEvents batchEvents={false} />
        <XR store={store}>
          <Scene />
        </XR>
      </Canvas>
    </div>
  );
}

/**
 * Separate `Scene` component to be used in the React Three Fiber `Canvas` component so that we can use React Three Fiber hooks like `useThree`
 */
const Scene = () => {
  const renderer = useThree((state) => state.gl);
  const meshRef = useRef<SparkSplatMesh>(null);

  // Memoize the elements inside the `<SparkRenderer />` `args` prop so that we don't re-create the `<SparkRenderer />` on every render
  const sparkRendererArgs = useMemo(() => {
    return { renderer };
  }, [renderer]);

  // Memoize the `SplatMesh` `args` prop so that we don't re-create the `SplatMesh` on every render
  const splatMeshArgs = useMemo(
    () =>
      ({
        url: "/assets/berbequim.ply",
      }) as const,
    [],
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.5 * delta;
    }
  });

  return (
    <>
      <CameraControls />
      <group rotation={[Math.PI, 0, 0]}>
        <SparkRenderer args={[sparkRendererArgs]}>
          {/* This particular splat mesh is upside down */}
          <SplatMesh ref={meshRef} args={[splatMeshArgs]} />
        </SparkRenderer>
      </group>
    </>
  );
};

export default App;
