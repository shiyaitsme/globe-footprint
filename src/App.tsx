import { useMemo, useRef, useState } from "react";
import Scene from "./components/Scene";
import type { SceneApi } from "./components/Scene";
import EarthMarker from "./components/hud/EarthMarker";
import { EARTH_RADIUS } from "./components/Earth";
import NavBar from "./components/hud/NavBar";
import GreetingCard from "./components/hud/GreetingCard";
import DistributionCard from "./components/hud/DistributionCard";
import StatStrip from "./components/hud/StatStrip";
import AddFab from "./components/hud/AddFab";
import UniverseHint from "./components/hud/UniverseHint";
import PlanetPanel from "./components/hud/PlanetPanel";
import BackButton from "./components/hud/BackButton";
import AddFootprintPopup from "./components/hud/AddFootprintPopup";
import FootprintPopup from "./components/hud/FootprintPopup";
import { useFootprints } from "./hooks/useFootprints";
import { computeDistribution, computeSummary } from "./utils/geoStats";
import { EARTH_ID, getPlanetConfig } from "./planets";
import type { Footprint } from "./types";
import "./App.css";

export default function App() {
  const { footprints, addFootprint, updateFootprint, removeFootprint } = useFootprints();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [footprintTarget, setFootprintTarget] = useState<{ lat: number; lng: number } | null>(null);
  const apiRef = useRef<SceneApi | null>(null);

  const summary = useMemo(() => computeSummary(footprints), [footprints]);
  const distribution = useMemo(() => computeDistribution(footprints), [footprints]);
  const selectedFootprint = selectedId ? footprints.find((f) => f.id === selectedId) ?? null : null;
  const focusedPlanet = focusedId && focusedId !== EARTH_ID ? getPlanetConfig(focusedId) ?? null : null;

  const handleExitFocus = () => {
    setFocusedId(null);
    setSelectedId(null);
    setPendingLocation(null);
    setFootprintTarget(null);
  };

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
      <Scene
        footprints={footprints}
        focusedId={focusedId}
        footprintTarget={footprintTarget}
        onSurfaceClick={(lat, lng) => setPendingLocation({ lat, lng })}
        onSelectFootprint={(footprint) => setSelectedId(footprint.id)}
        onFocusPlanet={setFocusedId}
        onExitFocus={handleExitFocus}
        apiRef={apiRef}
        renderMarker={(footprint) => (
          <EarthMarker footprint={footprint} radius={EARTH_RADIUS} onSelect={(f) => setSelectedId(f.id)} />
        )}
      />

      <NavBar variant="top" />
      <NavBar variant="bottom" />

      {focusedId === null && <UniverseHint />}

      {focusedId === EARTH_ID && (
        <>
          <BackButton onClick={handleExitFocus} />
          <GreetingCard countries={summary.countries} cities={summary.cities} />
          <DistributionCard stats={distribution} />
          <StatStrip countries={summary.countries} cities={summary.cities} footprints={summary.footprints} />
          <AddFab onClick={handleFabClick} />
        </>
      )}

      {focusedPlanet && (
        <>
          <BackButton onClick={handleExitFocus} />
          <PlanetPanel name={focusedPlanet.name} />
        </>
      )}

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
