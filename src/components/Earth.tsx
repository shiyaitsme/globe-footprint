import { useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, TextureLoader, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { EARTH_CONFIG, EARTH_DIMMED_POSITION, FOCUS_DIM_OPACITY, FOCUS_DIM_SCALE, FOCUS_LERP_SPEED } from "../planets";
import Marker from "./Marker";
import { vector3ToLatLng } from "../utils/geo";
import type { Footprint } from "../types";

const EARTH_TEXTURE_URL = "/textures/earth.jpg";

export const EARTH_RADIUS = EARTH_CONFIG.radius;

function unrotateY(point: Vector3, angle: number): Vector3 {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  return new Vector3(point.x * cos + point.z * sin, point.y, -point.x * sin + point.z * cos);
}

interface EarthProps {
  focused: boolean;
  dimmed: boolean;
  footprints: Footprint[];
  onSelect: () => void;
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectFootprint: (footprint: Footprint) => void;
  renderMarker?: (footprint: Footprint) => ReactNode;
}

export default function Earth({
  focused,
  dimmed,
  footprints,
  onSelect,
  onSurfaceClick,
  onSelectFootprint,
  renderMarker,
}: EarthProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const texture = useLoader(TextureLoader, EARTH_TEXTURE_URL);

  const basePosition = useMemo(() => new Vector3(...EARTH_CONFIG.position), []);
  const pushedPosition = useMemo(() => new Vector3(...EARTH_DIMMED_POSITION), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * EARTH_CONFIG.rotationSpeed;
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
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (focused) {
      const adjusted = unrotateY(event.point, groupRef.current?.rotation.y ?? 0);
      const { lat, lng } = vector3ToLatLng(adjusted, EARTH_RADIUS);
      onSurfaceClick(lat, lng);
    } else {
      onSelect();
    }
  };

  return (
    <group ref={groupRef} position={EARTH_CONFIG.position}>
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial ref={materialRef} map={texture} roughness={0.85} metalness={0} transparent />
      </mesh>
      {focused &&
        footprints.map((footprint) =>
          renderMarker ? (
            <group key={footprint.id}>{renderMarker(footprint)}</group>
          ) : (
            <Marker key={footprint.id} footprint={footprint} radius={EARTH_RADIUS} onSelect={onSelectFootprint} />
          )
        )}
    </group>
  );
}
