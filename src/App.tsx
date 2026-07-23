import { useMemo, useRef, useState } from "react";
import EarthSlot from "./components/hud/EarthSlot";
import NavBar from "./components/hud/NavBar";
import GreetingCard from "./components/hud/GreetingCard";
import DistributionCard from "./components/hud/DistributionCard";
import StatStrip from "./components/hud/StatStrip";
import AddFab from "./components/hud/AddFab";
import AddFootprintPopup from "./components/hud/AddFootprintPopup";
import FootprintPopup from "./components/hud/FootprintPopup";
import type { EarthCanvasApi } from "./components/hud/EarthCanvas";
import { useFootprints } from "./hooks/useFootprints";
import { computeDistribution, computeSummary } from "./utils/geoStats";
import type { Footprint } from "./types";
import "./App.css";

export default function App() {
  const { footprints, addFootprint, updateFootprint, removeFootprint } = useFootprints();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const apiRef = useRef<EarthCanvasApi | null>(null);

  const summary = useMemo(() => computeSummary(footprints), [footprints]);
  const distribution = useMemo(() => computeDistribution(footprints), [footprints]);
  const selectedFootprint = selectedId ? footprints.find((f) => f.id === selectedId) ?? null : null;

  const handleFabClick = () => {
    const center = apiRef.current?.getCenterLatLng() ?? { lat: 0, lng: 0 };
    setPendingLocation(center);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Montserrat','Noto Sans SC','PingFang SC',sans-serif",
        background: "#050507",
      }}
    >
      <img
        src="/design/space-bg.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.72) saturate(1.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 78%)",
        }}
      />

      <NavBar variant="top" />
      <GreetingCard countries={summary.countries} cities={summary.cities} />
      <DistributionCard stats={distribution} />
      <StatStrip countries={summary.countries} cities={summary.cities} footprints={summary.footprints} />
      <AddFab onClick={handleFabClick} />
      <NavBar variant="bottom" />

      <EarthSlot
        footprints={footprints}
        onSurfaceClick={(lat, lng) => setPendingLocation({ lat, lng })}
        onSelectFootprint={(footprint) => setSelectedId(footprint.id)}
        apiRef={apiRef}
      />

      {pendingLocation && (
        <AddFootprintPopup
          lat={pendingLocation.lat}
          lng={pendingLocation.lng}
          onCancel={() => setPendingLocation(null)}
          onSave={({ name, country, notes, photos }) => {
            const footprint: Footprint = {
              id: crypto.randomUUID(),
              name,
              country,
              notes,
              photos,
              lat: pendingLocation.lat,
              lng: pendingLocation.lng,
              createdAt: Date.now(),
            };
            addFootprint(footprint);
            setPendingLocation(null);
          }}
        />
      )}

      {selectedFootprint && (
        <FootprintPopup
          footprint={selectedFootprint}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateFootprint(selectedFootprint.id, patch)}
          onDelete={() => {
            removeFootprint(selectedFootprint.id);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}
