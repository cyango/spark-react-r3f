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
import { noEvents } from "@react-three/xr/dist/events";
import { useXR } from "@react-three/xr";
import { createXRStore, XR } from "@react-three/xr/dist/xr";
import Panorama from "./components/Panorama";

const ClickHandler = () => {
	const { gl, camera, scene } = useThree();
	const xr = useXR();

	useEffect(() => {
		const raycaster = new THREE.Raycaster();

		// Regular mouse click handling
		const onMouseClick = (event: MouseEvent) => {
			// Skip if in XR mode
			if (xr.session) return;

			const rect = gl.domElement.getBoundingClientRect();
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

		// XR input handling
		const handleXRSelect = (event: any) => {
			if (!xr.session) return;

			const inputSource = event.inputSource;
			if (!inputSource || !inputSource.targetRaySpace) return;

			// Get the pose of the controller's target ray
			const frame = event.frame;
			if (!xr.originReferenceSpace) return;

			const pose = frame.getPose(
				inputSource.targetRaySpace,
				xr.originReferenceSpace,
			);

			if (pose) {
				const transform = pose.transform;
				const origin = new THREE.Vector3(
					transform.position.x,
					transform.position.y,
					transform.position.z,
				);
				const direction = new THREE.Vector3(
					-transform.orientation.x,
					-transform.orientation.y,
					-transform.orientation.z,
				).normalize();

				raycaster.set(origin, direction);
				const hits = raycaster.intersectObjects(scene.children, true);
				const hit = hits.find((h) => h.object instanceof SplatMeshObject);
				if (hit) {
					console.log("✅ Clicked a SplatMesh in XR!", hit.object);
				}
			}
		};

		// Add listeners
		gl.domElement.addEventListener("click", onMouseClick);

		// XR session event listeners
		if (xr.session) {
			xr.session.addEventListener("select", handleXRSelect);
		}

		return () => {
			gl.domElement.removeEventListener("click", onMouseClick);
			if (xr.session) {
				xr.session.removeEventListener("select", handleXRSelect);
			}
		};
	}, [gl, camera, scene, xr]);

	return null;
};

function App() {
	const store = createXRStore({
		emulate: {
			inject: true,
			syntheticEnvironment: "living_room",
		},
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
						<SplatMesh ref={meshRef} args={[splatMeshArgs]} />
					</SparkRenderer>
				</group>
			</Resize>

			{/* <Panorama /> */}
			<ClickHandler />
		</>
	);
};

export default App;
