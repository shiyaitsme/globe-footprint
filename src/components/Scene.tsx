import { Suspense, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Earth, { EARTH_RADIUS } from "./Earth";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import { PLACEHOLDER_PLANETS, OVERVIEW_CAMERA_POSITION, getPlanetConfig } from "../planets";
import { vector3ToLatLng } from "../utils/geo";
import type { Footprint } from "../types";

export interface SceneApi {
  getCenterLatLng: () => { lat: number; lng: number };
}

interface SceneProps {
  footprints: Footprint[];
  focusedId: string | null;
  footprintTarget: { lat: number; lng: number } | null;
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectFootprint: (footprint: Footprint) => void;
  onFocusPlanet: (id: string) => void;
  onExitFocus: () => void;
  renderMarker?: (footprint: Footprint) => ReactNode;
  apiRef?: React.MutableRefObject<SceneApi | null>;
}

function ApiBridge({ apiRef }: { apiRef: React.MutableRefObject<SceneApi | null> }) {
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

export default function Scene({
  footprints,
  focusedId,
  footprintTarget,
  onSurfaceClick,
  onSelectFootprint,
  onFocusPlanet,
  onExitFocus,
  renderMarker,
  apiRef,
}: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusedPosition = useMemo(
    () => (focusedId ? getPlanetConfig(focusedId)?.position : undefined),
    [focusedId]
  );

  return (
    <Canvas
      camera={{ position: OVERVIEW_CAMERA_POSITION, fov: 50 }}
      onPointerMissed={() => {
        if (focusedId !== null) onExitFocus();
      }}
    >
      <color attach="background" args={["#05070f"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 3, 5]} intensity={2} />
      <directionalLight position={[-6, -2, -4]} intensity={0.7} />
      <Suspense fallback={null}>
        <Earth
          focused={focusedId === "earth"}
          dimmed={focusedId !== null && focusedId !== "earth"}
          footprints={footprints}
          onSelect={() => onFocusPlanet("earth")}
          onSurfaceClick={onSurfaceClick}
          onSelectFootprint={onSelectFootprint}
          renderMarker={renderMarker}
        />
        {PLACEHOLDER_PLANETS.map((planet) => (
          <Planet
            key={planet.id}
            config={planet}
            dimmed={focusedId !== null && focusedId !== planet.id}
            onSelect={onFocusPlanet}
          />
        ))}
      </Suspense>
      <Stars radius={80} depth={40} count={3000} factor={2} fade />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={2.6}
        maxDistance={40}
        rotateSpeed={0.5}
      />
      <CameraRig controlsRef={controlsRef} focusedId={focusedId} footprintTarget={footprintTarget} />
      {apiRef && <ApiBridge apiRef={apiRef} />}
      <EffectComposer>
        {[
          <Bloom key="bloom" luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={0.6} mipmapBlur />,
          ...(focusedPosition
            ? [
                <DepthOfField
                  key="dof"
                  target={focusedPosition}
                  worldFocusRange={3.5}
                  bokehScale={4}
                  resolutionScale={0.5}
                />,
              ]
            : []),
        ]}
      </EffectComposer>
    </Canvas>
  );
}
