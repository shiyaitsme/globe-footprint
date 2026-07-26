import { Html } from "@react-three/drei";
import { latLngToVector3 } from "../../utils/geo";
import type { Place } from "../../types";

interface EarthMarkerProps {
  place: Place;
  radius: number;
  onSelect: (place: Place) => void;
}

export default function EarthMarker({ place, radius, onSelect }: EarthMarkerProps) {
  const position = latLngToVector3(place.lat, place.lng, radius + 0.02);

  return (
    <Html position={position} center distanceFactor={6} zIndexRange={[1, 0]}>
      <div style={{ position: "relative", width: 14, height: 14 }}>
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.8)",
            animation: "pulse 2.4s ease-out infinite",
          }}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(place);
          }}
          style={{
            position: "relative",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 14px rgba(255,255,255,0.9)",
          }}
        />
      </div>
    </Html>
  );
}
