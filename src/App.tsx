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
// import Panorama from "./components/Panorama";

const ClickHandler = () => {
	const { gl, camera, scene } = useThree();
	const xr = useXR();

	useEffect(() => {
		const raycaster = new THREE.Raycaster();
		let lastMoveTime = 0;
		const moveThrottle = 16; // ~60fps throttling

		// Helper function to perform raycasting from screen coordinates
		const performRaycastFromScreen = (clientX: number, clientY: number) => {
			const rect = gl.domElement.getBoundingClientRect();
			const x = ((clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((clientY - rect.top) / rect.height) * 2 + 1;
			const coords = new THREE.Vector2(x, y);

			raycaster.setFromCamera(coords, camera);
			const hits = raycaster.intersectObjects(scene.children, true);
			return hits.find((h) => h.object instanceof SplatMeshObject);
		};

		// Regular DOM event handlers
		const onPointerDown = (event: PointerEvent) => {
			if (xr.session) return;
			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("👆 Pointer Down on SplatMesh!", hit.object, hit.point);
			}
		};

		const onPointerUp = (event: PointerEvent) => {
			if (xr.session) return;
			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("👆 Pointer Up on SplatMesh!", hit.object, hit.point);
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			if (xr.session) return;

			// Throttle pointer move events for performance
			const now = Date.now();
			if (now - lastMoveTime < moveThrottle) return;
			lastMoveTime = now;

			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("👆 Pointer Move on SplatMesh!", hit.object, hit.point);
			}
		};

		const onPointerEnter = (event: PointerEvent) => {
			if (xr.session) return;
			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("👆 Pointer Enter SplatMesh!", hit.object);
			}
		};

		const onPointerLeave = (event: PointerEvent) => {
			if (xr.session) return;
			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("👆 Pointer Leave SplatMesh!", hit.object);
			}
		};

		const onClick = (event: MouseEvent) => {
			if (xr.session) return;
			const hit = performRaycastFromScreen(event.clientX, event.clientY);
			if (hit) {
				console.log("✅ Click on SplatMesh!", hit.object, hit.point);
			}
		};

		// Helper function to perform XR raycasting
		const performXRRaycast = (event: any, logMessage: string) => {
			if (!xr.session) return null;

			const inputSource = event.inputSource;
			if (!inputSource || !inputSource.targetRaySpace) return null;

			const frame = event.frame;
			if (!xr.originReferenceSpace) return null;

			const pose = frame.getPose(
				inputSource.targetRaySpace,
				xr.originReferenceSpace,
			);
			if (!pose) return null;

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
				console.log(logMessage, hit.object, hit.point);
			}

			return hit;
		};

		// XR input event handlers
		const handleXRSelect = (event: any) => {
			performXRRaycast(event, "🎮 XR Select on SplatMesh!");
		};

		const handleXRSelectStart = (event: any) => {
			performXRRaycast(event, "🎮 XR Select Start on SplatMesh!");
		};

		const handleXRSelectEnd = (event: any) => {
			performXRRaycast(event, "🎮 XR Select End on SplatMesh!");
		};

		const handleXRSqueeze = (event: any) => {
			performXRRaycast(event, "🤏 XR Squeeze on SplatMesh!");
		};

		const handleXRSqueezeStart = (event: any) => {
			performXRRaycast(event, "🤏 XR Squeeze Start on SplatMesh!");
		};

		const handleXRSqueezeEnd = (event: any) => {
			performXRRaycast(event, "🤏 XR Squeeze End on SplatMesh!");
		};

		// Add DOM event listeners
		gl.domElement.addEventListener("click", onClick);
		gl.domElement.addEventListener("pointerdown", onPointerDown);
		gl.domElement.addEventListener("pointerup", onPointerUp);
		gl.domElement.addEventListener("pointermove", onPointerMove);
		gl.domElement.addEventListener("pointerenter", onPointerEnter);
		gl.domElement.addEventListener("pointerleave", onPointerLeave);

		// Add XR session event listeners
		if (xr.session) {
			xr.session.addEventListener("select", handleXRSelect);
			xr.session.addEventListener("selectstart", handleXRSelectStart);
			xr.session.addEventListener("selectend", handleXRSelectEnd);
			xr.session.addEventListener("squeeze", handleXRSqueeze);
			xr.session.addEventListener("squeezestart", handleXRSqueezeStart);
			xr.session.addEventListener("squeezeend", handleXRSqueezeEnd);
		}

		return () => {
			// Remove DOM event listeners
			gl.domElement.removeEventListener("click", onClick);
			gl.domElement.removeEventListener("pointerdown", onPointerDown);
			gl.domElement.removeEventListener("pointerup", onPointerUp);
			gl.domElement.removeEventListener("pointermove", onPointerMove);
			gl.domElement.removeEventListener("pointerenter", onPointerEnter);
			gl.domElement.removeEventListener("pointerleave", onPointerLeave);

			// Remove XR session event listeners
			if (xr.session) {
				xr.session.removeEventListener("select", handleXRSelect);
				xr.session.removeEventListener("selectstart", handleXRSelectStart);
				xr.session.removeEventListener("selectend", handleXRSelectEnd);
				xr.session.removeEventListener("squeeze", handleXRSqueeze);
				xr.session.removeEventListener("squeezestart", handleXRSqueezeStart);
				xr.session.removeEventListener("squeezeend", handleXRSqueezeEnd);
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
				url: "/assets/splats/sutro.zip",
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
