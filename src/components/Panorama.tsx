import { XRLayer } from "@react-three/xr";
import type React from "react";
import { useRef } from "react";
import type { Object3D } from "three";

const Panorama: React.FC = (props) => {
  const objectRef = useRef<Object3D | undefined>(undefined);

  const imageEl = document.getElementById(
    "default360Image",
  ) as HTMLImageElement;

  return (
    <group
      // @ts-ignore
      ref={objectRef}
      position={[0, 0, 0]}
      rotation={[0, -1.5, 0]}
      scale={[500, 500, 500]}
      // NOTE: This is a hack to make the panorama render other than the skybox
      renderOrder={-1}
      //   pointerEvents="none"
    >
      <XRLayer
        src={imageEl}
        rotation={[0, Math.PI / 2, 0]}
        shape="equirect"
        centralHorizontalAngle={Math.PI * 2} // 180 or 360 degrees
        upperVerticalAngle={Math.PI / 2} // 90 degrees up
        lowerVerticalAngle={-Math.PI / 2} // 90 degrees down
        chromaticAberrationCorrection
      />
    </group>
  );
};

export default Panorama;
