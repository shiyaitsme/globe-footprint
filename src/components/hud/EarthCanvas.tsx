import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth, { EARTH_RADIUS } from "../Earth";
import EarthMarker from "./EarthMarker";
import { vector3ToLatLng } from "../../utils/geo";
import type { Footprint } from "../../types";

export interface EarthCanvasApi {
  getCenterLatLng: () => { lat: number; lng: number };
}

interface EarthCanvasProps {
  footprints: Footprint[];
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectFootprint: (footprint: Footprint) => void;
  apiRef: React.MutableRefObject<EarthCanvasApi | null>;
}

function ApiBridge({ apiRef }: { apiRef: EarthCanvasProps["apiRef"] }) {
  const { camera } = useThree();
  useEffect(() => {
    apiRef.current = {
      getCenterLatLng: () => {
        const point = camera.position.clone().normalize().multiplyScalar(EARTH_RADIUS);
        return vector3ToLatLng(point, EARTH_RADIUS);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera]);
  return null;
}

export default function EarthCanvas({ footprints, onSurfaceClick, onSelectFootprint, apiRef }: EarthCanvasProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4.6], fov: 45 }} gl={{ alpha: true }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={2.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.7} />
      <Suspense fallback={null}>
        <Earth
          focused
          dimmed={false}
          footprints={footprints}
          onSelect={() => {}}
          onSurfaceClick={onSurfaceClick}
          onSelectFootprint={onSelectFootprint}
          renderMarker={(footprint) => (
            <EarthMarker footprint={footprint} radius={EARTH_RADIUS} onSelect={onSelectFootprint} />
          )}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={3.2}
        maxDistance={9}
        rotateSpeed={0.4}
      />
      <ApiBridge apiRef={apiRef} />
    </Canvas>
  );
}
