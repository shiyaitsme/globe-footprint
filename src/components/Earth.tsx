import { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import type { Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";

const EARTH_TEXTURE_URL = "/textures/earth.jpg";

export const EARTH_RADIUS = 2;

interface EarthProps {
  onSurfaceClick: (event: ThreeEvent<MouseEvent>) => void;
}

export default function Earth({ onSurfaceClick }: EarthProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, EARTH_TEXTURE_URL);

  return (
    <mesh ref={meshRef} onClick={onSurfaceClick}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
    </mesh>
  );
}
