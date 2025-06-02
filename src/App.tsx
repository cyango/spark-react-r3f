import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SplatMesh } from "./components/forge/SplatMesh";
import { ForgeRenderer } from "./components/forge/SplatRenderer";
import { CameraControls } from "@react-three/drei";
import { useRef } from "react";
import type { SplatMesh as ForgeSplatMesh } from "@forge-gfx/forge";

function App() {
  return (
    <div className="flex h-screen w-screen">
      <Canvas gl={{ antialias: false }}>
        <Scene />
      </Canvas>
    </div>
  );
}

/**
 * Separate `Scene` component to be used in the React Three Fiber `Canvas` component so that we can use React Three Fiber hooks like `useThree`
 */
const Scene = () => {
  const renderer = useThree((state) => state.gl);
  const meshRef = useRef<ForgeSplatMesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.5 * delta;
    }
  });

  return (
    <>
      <CameraControls />
      <ForgeRenderer args={[{ renderer }]}>
        {/* This particular splat mesh is upside down */}
        <group rotation={[Math.PI, 0, 0]}>
          <SplatMesh
            ref={meshRef}
            args={[{ url: "/assets/splats/butterfly.spz" }]}
          />
        </group>
      </ForgeRenderer>
    </>
  );
};

export default App;
