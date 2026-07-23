import { useState } from "react";
import Scene from "./components/Scene";
import Sidebar from "./components/Sidebar";
import AddPlaceModal from "./components/AddPlaceModal";
import PlaceModal from "./components/PlaceModal";
import { useFootprints } from "./hooks/useFootprints";
import { EARTH_ID, getPlanetConfig } from "./planets";
import type { Footprint } from "./types";
import "./App.css";

export default function App() {
  const { footprints, addFootprint, updateFootprint, removeFootprint } = useFootprints();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [footprintTarget, setFootprintTarget] = useState<{ lat: number; lng: number } | null>(null);

  const handleSurfaceClick = (lat: number, lng: number) => {
    setPendingLocation({ lat, lng });
  };

  const handleSelectFootprint = (footprint: Footprint) => {
    setSelectedId(footprint.id);
    setFocusedId(EARTH_ID);
    setFootprintTarget({ lat: footprint.lat, lng: footprint.lng });
  };

  const handleFocusPlanet = (id: string) => {
    setFocusedId(id);
  };

  const handleExitFocus = () => {
    setFocusedId(null);
    setSelectedId(null);
    setPendingLocation(null);
    setFootprintTarget(null);
  };

  const selectedFootprint = selectedId ? footprints.find((f) => f.id === selectedId) ?? null : null;
  const focusedPlaceholder =
    focusedId && focusedId !== EARTH_ID ? getPlanetConfig(focusedId) ?? null : null;

  return (
    <div className="app">
      {focusedId === EARTH_ID && (
        <Sidebar footprints={footprints} onSelect={handleSelectFootprint} onBack={handleExitFocus} />
      )}

      {focusedId === null && (
        <div className="overview-hint">
          <h1>宇宙</h1>
          <p>拖动自由漫游，点击任意星球开始探索</p>
        </div>
      )}

      {focusedPlaceholder && (
        <div className="placeholder-panel">
          <button type="button" className="back-button" onClick={handleExitFocus}>
            ← 返回宇宙
          </button>
          <h1>{focusedPlaceholder.name}</h1>
          <p>这颗星球的功能正在建设中，敬请期待</p>
        </div>
      )}

      <Scene
        footprints={footprints}
        focusedId={focusedId}
        footprintTarget={footprintTarget}
        onSurfaceClick={handleSurfaceClick}
        onSelectFootprint={handleSelectFootprint}
        onFocusPlanet={handleFocusPlanet}
        onExitFocus={handleExitFocus}
      />

      {pendingLocation && (
        <AddPlaceModal
          lat={pendingLocation.lat}
          lng={pendingLocation.lng}
          onCancel={() => setPendingLocation(null)}
          onSave={({ name, notes, photos }) => {
            addFootprint({
              id: crypto.randomUUID(),
              name,
              notes,
              photos,
              lat: pendingLocation.lat,
              lng: pendingLocation.lng,
              createdAt: Date.now(),
            });
            setPendingLocation(null);
          }}
        />
      )}

      {selectedFootprint && (
        <PlaceModal
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
