import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SplatMesh } from "./components/spark/SplatMesh";
import { SparkRenderer } from "./components/spark/SparkRenderer";
import { CameraControls, Resize } from "@react-three/drei";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { SplatMesh as SplatMeshObject } from "@sparkjsdev/spark";

import type {
  SplatMesh as SparkSplatMesh,
  SplatMeshOptions,
} from "@sparkjsdev/spark";
import { noEvents, PointerEvents } from "@react-three/xr/dist/events";
import { createXRStore, XR } from "@react-three/xr/dist/xr";
import Panorama from "./components/Panorama";

const ClickHandler = () => {
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();

    const onClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();

      // Convert screen coords to normalized device coords
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const clickCoords = new THREE.Vector2(x, y);

      raycaster.setFromCamera(clickCoords, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      const hit = hits.find((h) => h.object instanceof SplatMeshObject);
      if (hit) {
        console.log("✅ Clicked a SplatMesh!", hit.object);
      }
    };

    gl.domElement.addEventListener("click", onClick);
    return () => {
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [gl, camera, scene]);

  return null;
};

function App() {
  const store = createXRStore({
    emulate: true,
  });

  return (
    <div className="flex h-screen w-screen">
      <img
        id="default360Image"
        src="/assets/default360Image.jpg"
        style={{ display: "none" }}
        alt="default"
      />

      <Canvas gl={{ antialias: false }} events={noEvents}>
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
  const splatMeshArgs: SplatMeshOptions = useMemo(
    () =>
      ({
        url: "/assets/splats/fireplace.spz",
        // onLoad: () => {
        //   console.log("loaded");
        // },
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

      <Resize>
        <group rotation={[Math.PI, 0, 0]}>
          <SparkRenderer args={[sparkRendererArgs]}>
            {/* This particular splat mesh is upside down */}
            <SplatMesh ref={meshRef} args={[splatMeshArgs]} />
          </SparkRenderer>
        </group>
      </Resize>

      <Panorama />
      <ClickHandler />
    </>
  );
};

export default App;
