import { Html } from "@react-three/drei";
import { latLngToVector3 } from "../utils/geo";
import type { Place } from "../types";

interface MarkerProps {
  place: Place;
  radius: number;
  onSelect: (place: Place) => void;
}

export default function Marker({ place, radius, onSelect }: MarkerProps) {
  const position = latLngToVector3(place.lat, place.lng, radius + 0.02);

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(place);
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#ff5252" />
      </mesh>
      <Html distanceFactor={8} occlude zIndexRange={[1, 0]} style={{ pointerEvents: "none" }}>
        <div className="marker-label">{place.name}</div>
      </Html>
    </group>
  );
}
