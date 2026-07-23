import { Html } from "@react-three/drei";
import { latLngToVector3 } from "../utils/geo";
import type { Footprint } from "../types";

interface MarkerProps {
  footprint: Footprint;
  radius: number;
  onSelect: (footprint: Footprint) => void;
}

export default function Marker({ footprint, radius, onSelect }: MarkerProps) {
  const position = latLngToVector3(footprint.lat, footprint.lng, radius + 0.02);

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(footprint);
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#ff5252" />
      </mesh>
      <Html distanceFactor={8} occlude style={{ pointerEvents: "none" }}>
        <div className="marker-label">{footprint.name}</div>
      </Html>
    </group>
  );
}
