import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import Earth, { EARTH_RADIUS } from "./Earth";
import Marker from "./Marker";
import { latLngToVector3, vector3ToLatLng } from "../utils/geo";
import type { Footprint } from "../types";

interface SceneProps {
  footprints: Footprint[];
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectFootprint: (footprint: Footprint) => void;
  flyToTarget: { lat: number; lng: number } | null;
}

function CameraRig({ flyToTarget }: { flyToTarget: { lat: number; lng: number } | null }) {
  const { camera } = useThree();
  const destination = useRef<Vector3 | null>(null);

  useEffect(() => {
    if (flyToTarget) {
      const direction = latLngToVector3(flyToTarget.lat, flyToTarget.lng, 1);
      destination.current = direction.multiplyScalar(EARTH_RADIUS * 2.4);
    }
  }, [flyToTarget]);

  useFrame(() => {
    if (!destination.current) return;
    camera.position.lerp(destination.current, 0.06);
    camera.lookAt(0, 0, 0);
    if (camera.position.distanceTo(destination.current) < 0.02) {
      destination.current = null;
    }
  });

  return null;
}

export default function Scene({ footprints, onSurfaceClick, onSelectFootprint, flyToTarget }: SceneProps) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const { lat, lng } = vector3ToLatLng(event.point, EARTH_RADIUS);
    onSurfaceClick(lat, lng);
  };

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <color attach="background" args={["#05070f"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <Suspense fallback={null}>
        <Earth onSurfaceClick={handleClick} />
        {footprints.map((footprint) => (
          <Marker
            key={footprint.id}
            footprint={footprint}
            radius={EARTH_RADIUS}
            onSelect={onSelectFootprint}
          />
        ))}
      </Suspense>
      <Stars radius={80} depth={40} count={3000} factor={2} fade />
      <OrbitControls enablePan={false} minDistance={2.6} maxDistance={12} rotateSpeed={0.5} />
      <CameraRig flyToTarget={flyToTarget} />
    </Canvas>
  );
}
