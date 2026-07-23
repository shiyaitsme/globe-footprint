import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { PlanetConfig } from "../planets";
import { FOCUS_DIM_OPACITY, FOCUS_DIM_SCALE, FOCUS_LERP_SPEED, FOCUS_PUSH_FACTOR } from "../planets";
import { generateGasGiantTexture } from "../utils/planetTexture";

const DIMMED_TINT = new Color("#7a7a7a");
const NORMAL_TINT = new Color("#ffffff");

interface PlanetProps {
  config: PlanetConfig;
  dimmed: boolean;
  onSelect: (id: string) => void;
}

export default function Planet({ config, dimmed, onSelect }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  const basePosition = useMemo(() => new Vector3(...config.position), [config.position]);
  const pushedPosition = useMemo(
    () => basePosition.clone().multiplyScalar(FOCUS_PUSH_FACTOR),
    [basePosition]
  );
  const texture = useMemo(
    () =>
      generateGasGiantTexture({
        palette: config.palette,
        seed: hashString(config.id),
        vortex: config.vortex,
      }),
    [config.palette, config.id, config.vortex]
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

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(config.id);
  };

  return (
    <group ref={groupRef} position={config.position}>
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[config.radius, 48, 48]} />
        <meshStandardMaterial ref={materialRef} map={texture} roughness={0.6} metalness={0.05} transparent />
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
