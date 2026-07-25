import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { DoubleSide, Mesh, TextureLoader, type Texture } from "three";
import { Stars } from "@react-three/drei";
import { generateGasGiantTexture } from "../../utils/planetTexture";
import { BACKDROP_PLANETS, type BackdropPlanetConfig } from "../../utils/backdropPlanets";

function BackdropPlanetMesh({ config, texture }: { config: BackdropPlanetConfig; texture: Texture }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * config.rotationSpeed;
    }
  });

  return (
    <group position={config.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.radius, 40, 40]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} />
      </mesh>
      {config.ring && (
        <mesh rotation={[1.3, 0, 0.35]}>
          <ringGeometry args={[config.radius * 1.35, config.radius * 1.7, 64]} />
          <meshBasicMaterial color={config.palette[0] ?? "#dce8f0"} transparent opacity={0.28} side={DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function ProceduralBackdropPlanet({ config }: { config: BackdropPlanetConfig }) {
  const texture = useMemo(
    () =>
      generateGasGiantTexture({
        palette: config.palette,
        seed: config.seed,
        vortex: config.vortex,
        turbulence: config.turbulence,
      }),
    [config.palette, config.seed, config.vortex, config.turbulence]
  );
  return <BackdropPlanetMesh config={config} texture={texture} />;
}

function ImageBackdropPlanet({ config, textureUrl }: { config: BackdropPlanetConfig; textureUrl: string }) {
  const texture = useLoader(TextureLoader, textureUrl);
  return <BackdropPlanetMesh config={config} texture={texture} />;
}

export default function PlanetBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: false, antialias: true }}
        style={{ filter: "brightness(0.72) saturate(1.05)" }}
      >
        <color attach="background" args={["#050507"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 4, 6]} intensity={1.3} />
        <directionalLight position={[-6, -3, -4]} intensity={0.4} />
        <Stars radius={60} depth={30} count={1800} factor={2} fade />
        <Suspense fallback={null}>
          {BACKDROP_PLANETS.map((planet) =>
            planet.textureUrl ? (
              <ImageBackdropPlanet key={planet.id} config={planet} textureUrl={planet.textureUrl} />
            ) : (
              <ProceduralBackdropPlanet key={planet.id} config={planet} />
            )
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
