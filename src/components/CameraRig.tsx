import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EARTH_CONFIG, OVERVIEW_CAMERA_POSITION, OVERVIEW_CAMERA_TARGET, getPlanetConfig } from "../planets";
import { latLngToVector3 } from "../utils/geo";

interface CameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusedId: string | null;
  footprintTarget: { lat: number; lng: number } | null;
}

export default function CameraRig({ controlsRef, focusedId, footprintTarget }: CameraRigProps) {
  const { camera } = useThree();
  const tween = useRef({
    px: camera.position.x,
    py: camera.position.y,
    pz: camera.position.z,
    tx: OVERVIEW_CAMERA_TARGET[0],
    ty: OVERVIEW_CAMERA_TARGET[1],
    tz: OVERVIEW_CAMERA_TARGET[2],
  }).current;

  const flyTo = (position: Vector3, lookAt: Vector3, duration = 1.6) => {
    const controls = controlsRef.current;

    if (controls) {
      controls.enabled = false;
      // Flush any residual rotate/zoom damping momentum left over from the
      // user's last OrbitControls drag/scroll — otherwise it keeps nudging
      // camera.position on its own every frame (enabled=false only blocks
      // *new* input, it doesn't stop already-queued damping inertia from
      // still being applied), fighting the tween we're about to start.
      const hadDamping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      controls.enableDamping = hadDamping;
    }

    // Resync from the live camera/controls state before animating. The tween
    // object otherwise only remembers where the *previous* flight ended, so
    // if the user free-rotated/zoomed via OrbitControls in between flights
    // (allowed once a flight's onComplete re-enables controls), camera.position
    // has since drifted away from tween.px/py/pz without us knowing — the next
    // flyTo would then jump from that stale, no-longer-accurate starting point
    // instead of smoothly continuing from wherever the camera actually is.
    tween.px = camera.position.x;
    tween.py = camera.position.y;
    tween.pz = camera.position.z;
    if (controls) {
      tween.tx = controls.target.x;
      tween.ty = controls.target.y;
      tween.tz = controls.target.z;
    }

    gsap.killTweensOf(tween);
    gsap.to(tween, {
      px: position.x,
      py: position.y,
      pz: position.z,
      tx: lookAt.x,
      ty: lookAt.y,
      tz: lookAt.z,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.set(tween.px, tween.py, tween.pz);
        if (controls) {
          controls.target.set(tween.tx, tween.ty, tween.tz);
          controls.update();
        } else {
          camera.lookAt(tween.tx, tween.ty, tween.tz);
        }
      },
      onComplete: () => {
        if (controls) controls.enabled = true;
      },
    });
  };

  useEffect(() => {
    if (focusedId === null) {
      flyTo(new Vector3(...OVERVIEW_CAMERA_POSITION), new Vector3(...OVERVIEW_CAMERA_TARGET));
      return;
    }
    const config = getPlanetConfig(focusedId);
    if (!config) return;
    const planetPosition = new Vector3(...config.position);
    const direction = camera.position.clone().sub(planetPosition);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0.3, 1);
    direction.normalize();
    const closePosition = planetPosition.clone().add(direction.multiplyScalar(config.focusDistance));
    flyTo(closePosition, planetPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId]);

  useEffect(() => {
    if (!footprintTarget || focusedId !== "earth") return;
    const direction = latLngToVector3(footprintTarget.lat, footprintTarget.lng, 1);
    const position = direction.multiplyScalar(EARTH_CONFIG.focusDistance);
    flyTo(position, new Vector3(0, 0, 0), 1.2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footprintTarget]);

  return null;
}
