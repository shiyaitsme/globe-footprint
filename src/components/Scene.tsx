import { Suspense, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Earth from "./Earth";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import { EARTH_CONFIG, PLACEHOLDER_PLANETS, OVERVIEW_CAMERA_POSITION, getPlanetConfig } from "../planets";
import type { Place } from "../types";

interface SceneProps {
  places: Place[];
  focusedId: string | null;
  footprintTarget: { lat: number; lng: number } | null;
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectPlace: (place: Place) => void;
  onFocusPlanet: (id: string) => void;
  onExitFocus: () => void;
  renderMarker?: (place: Place) => ReactNode;
}

export default function Scene({
  places,
  focusedId,
  footprintTarget,
  onSurfaceClick,
  onSelectPlace,
  onFocusPlanet,
  onExitFocus,
  renderMarker,
}: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusedPosition = useMemo(
    () => (focusedId ? getPlanetConfig(focusedId)?.position : undefined),
    [focusedId]
  );

  // 已经聚焦某个星球/地球时，点击场景里的其他星球/地球不应该直接跳过去聚焦它——
  // 而是先退回宇宙概览（和点击空白处一致），要看别的星球得先退出再点一次。
  // 只有在宇宙概览（focusedId === null）时点击才会真正切换聚焦目标。
  const handleFocusableSelect = (id: string) => {
    if (focusedId === null) onFocusPlanet(id);
    else if (focusedId !== id) onExitFocus();
  };

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
          places={places}
          onSelect={() => handleFocusableSelect("earth")}
          onSurfaceClick={onSurfaceClick}
          onSelectPlace={onSelectPlace}
          renderMarker={renderMarker}
        />
        {PLACEHOLDER_PLANETS.map((planet) => (
          <Planet
            key={planet.id}
            config={planet}
            dimmed={focusedId !== null && focusedId !== planet.id}
            onSelect={handleFocusableSelect}
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
      <EffectComposer>
        <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={0.6} mipmapBlur />
        <DepthOfField
          target={focusedPosition ?? EARTH_CONFIG.position}
          worldFocusRange={3.5}
          bokehScale={focusedPosition ? 4 : 0}
          resolutionScale={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
