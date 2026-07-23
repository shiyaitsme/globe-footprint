import { useState } from "react";
import Scene from "./components/Scene";
import Sidebar from "./components/Sidebar";
import AddPlaceModal from "./components/AddPlaceModal";
import PlaceModal from "./components/PlaceModal";
import { useFootprints } from "./hooks/useFootprints";
import type { Footprint } from "./types";
import "./App.css";

export default function App() {
  const { footprints, addFootprint, updateFootprint, removeFootprint } = useFootprints();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  const handleSurfaceClick = (lat: number, lng: number) => {
    setPendingLocation({ lat, lng });
  };

  const handleSelect = (footprint: Footprint) => {
    setSelectedId(footprint.id);
    setFlyTo({ lat: footprint.lat, lng: footprint.lng });
  };

  const selectedFootprint = selectedId ? footprints.find((f) => f.id === selectedId) ?? null : null;

  return (
    <div className="app">
      <Sidebar footprints={footprints} onSelect={handleSelect} />
      <Scene
        footprints={footprints}
        onSurfaceClick={handleSurfaceClick}
        onSelectFootprint={handleSelect}
        flyToTarget={flyTo}
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
