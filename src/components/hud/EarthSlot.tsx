import type { RefObject } from "react";
import EarthCanvas from "./EarthCanvas";
import type { EarthCanvasApi } from "./EarthCanvas";
import type { Footprint } from "../../types";

interface EarthSlotProps {
  footprints: Footprint[];
  onSurfaceClick: (lat: number, lng: number) => void;
  onSelectFootprint: (footprint: Footprint) => void;
  apiRef: RefObject<EarthCanvasApi | null>;
}

export default function EarthSlot({ footprints, onSurfaceClick, onSelectFootprint, apiRef }: EarthSlotProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "52%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: 440,
        height: 440,
      }}
    >
      <div style={{ position: "absolute", inset: -36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0 0 90px rgba(140,170,255,0.35), 0 0 0 1px rgba(255,255,255,0.15)",
        }}
      >
        <EarthCanvas
          footprints={footprints}
          onSurfaceClick={onSurfaceClick}
          onSelectFootprint={onSelectFootprint}
          apiRef={apiRef}
        />
      </div>
    </div>
  );
}
