import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Color, Group, Mesh, MeshStandardMaterial, Texture, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { PlanetConfig } from "../planets";
import { FOCUS_DIM_OPACITY, FOCUS_DIM_SCALE, FOCUS_LERP_SPEED, FOCUS_PUSH_FACTOR } from "../planets";
import { generateGasGiantTexture } from "../utils/planetTexture";
import { SeamlessEquirectTextureLoader } from "../utils/seamlessTextureLoader";
import { isClickNotDrag } from "../utils/pointer";

const DIMMED_TINT = new Color("#7a7a7a");
const NORMAL_TINT = new Color("#ffffff");

interface PlanetProps {
  config: PlanetConfig;
  dimmed: boolean;
  onSelect: (id: string) => void;
}

export default function Planet({ config, dimmed, onSelect }: PlanetProps) {
  return config.textureUrl ? (
    <PlanetWithImageTexture config={config} dimmed={dimmed} onSelect={onSelect} textureUrl={config.textureUrl} />
  ) : (
    <PlanetWithProceduralTexture config={config} dimmed={dimmed} onSelect={onSelect} />
  );
}

function PlanetWithImageTexture({
  config,
  dimmed,
  onSelect,
  textureUrl,
}: PlanetProps & { textureUrl: string }) {
  const texture = useLoader(SeamlessEquirectTextureLoader, textureUrl);
  return <PlanetBody config={config} dimmed={dimmed} onSelect={onSelect} texture={texture} />;
}

function PlanetWithProceduralTexture({ config, dimmed, onSelect }: PlanetProps) {
  const texture = useMemo(
    () =>
      generateGasGiantTexture({
        palette: config.palette,
        seed: hashString(config.id),
        vortex: config.vortex,
      }),
    [config.palette, config.id, config.vortex]
  );
  return <PlanetBody config={config} dimmed={dimmed} onSelect={onSelect} texture={texture} />;
}

function PlanetBody({ config, dimmed, onSelect, texture }: PlanetProps & { texture: Texture }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const basePosition = useMemo(() => new Vector3(...config.position), [config.position]);
  const pushedPosition = useMemo(
    () => basePosition.clone().multiplyScalar(FOCUS_PUSH_FACTOR),
    [basePosition]
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * config.rotationSpeed;
    }
    const targetScale = dimmed ? FOCUS_DIM_SCALE : 1;
    const targetOpacity = dimmed ? FOCUS_DIM_OPACITY : 1;
    const targetPosition = dimmed ? pushedPosition : basePosition;

    if (groupRef.current) {
      const s = groupRef.current.scale;
      s.set(
        s.x + (targetScale - s.x) * FOCUS_LERP_SPEED,
        s.y + (targetScale - s.y) * FOCUS_LERP_SPEED,
        s.z + (targetScale - s.z) * FOCUS_LERP_SPEED
      );
      groupRef.current.position.lerp(targetPosition, FOCUS_LERP_SPEED);
    }
    if (materialRef.current) {
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * FOCUS_LERP_SPEED;
      materialRef.current.color.lerp(dimmed ? DIMMED_TINT : NORMAL_TINT, FOCUS_LERP_SPEED);
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const start = pointerDownPos.current;
    if (start && !isClickNotDrag(start.x, start.y, event.clientX, event.clientY)) return;
    onSelect(config.id);
  };

  return (
    <group ref={groupRef} position={config.position}>
      <mesh ref={meshRef} onPointerDown={handlePointerDown} onClick={handleClick}>
        <sphereGeometry args={[config.radius, 48, 48]} />
        <meshStandardMaterial ref={materialRef} map={texture} roughness={0.5} metalness={0} transparent />
      </mesh>
    </group>
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash || 1;
}
