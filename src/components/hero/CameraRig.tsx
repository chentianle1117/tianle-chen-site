/**
 * CameraRig.tsx — OrbitControls wrapper with the constitutional clamps.
 *
 * Forwards the controls ref so ProjectCloud can dolly the camera on click.
 */

import { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const CameraRig = forwardRef<OrbitControlsImpl>((_, ref) => {
  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      minPolarAngle={Math.PI * 0.32}
      maxPolarAngle={Math.PI * 0.62}
      minDistance={2}
      maxDistance={5}
      makeDefault
    />
  );
});

CameraRig.displayName = "CameraRig";

export default CameraRig;
