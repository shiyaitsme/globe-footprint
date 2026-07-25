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
import AddPlacePopup from "./components/hud/AddPlacePopup";
import AddVisitPopup from "./components/hud/AddVisitPopup";
import MergeConfirmDialog from "./components/hud/MergeConfirmDialog";
import PlaceTimelinePanel from "./components/hud/PlaceTimelinePanel";
import { usePlaces } from "./hooks/usePlaces";
import { computeDistribution, computeSummary } from "./utils/geoStats";
import { findNearbyPlace } from "./utils/geo";
import { EARTH_ID, getPlanetConfig } from "./planets";
import type { Place } from "./types";
import "./App.css";

export default function App() {
  const { places, addPlace, addVisit, removeVisit, addComment } = usePlaces();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mergeCandidate, setMergeCandidate] = useState<{ place: Place; lat: number; lng: number } | null>(null);
  const [visitTargetPlace, setVisitTargetPlace] = useState<Place | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [footprintTarget, setFootprintTarget] = useState<{ lat: number; lng: number } | null>(null);
  const apiRef = useRef<SceneApi | null>(null);

  const summary = useMemo(() => computeSummary(places), [places]);
  const distribution = useMemo(() => computeDistribution(places), [places]);
  const selectedPlace = selectedPlaceId ? places.find((p) => p.id === selectedPlaceId) ?? null : null;
  const focusedPlanet = focusedId && focusedId !== EARTH_ID ? getPlanetConfig(focusedId) ?? null : null;

  const handleExitFocus = () => {
    setFocusedId(null);
    setSelectedPlaceId(null);
    setPendingLocation(null);
    setMergeCandidate(null);
    setVisitTargetPlace(null);
    setFootprintTarget(null);
  };

  const startAddingAt = (lat: number, lng: number) => {
    const nearby = findNearbyPlace(places, lat, lng);
    if (nearby) {
      setMergeCandidate({ place: nearby, lat, lng });
    } else {
      setPendingLocation({ lat, lng });
    }
  };

  const handleFabClick = () => {
    const center = apiRef.current?.getCenterLatLng() ?? { lat: 0, lng: 0 };
    startAddingAt(center.lat, center.lng);
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
        places={places}
        focusedId={focusedId}
        footprintTarget={footprintTarget}
        onSurfaceClick={(lat, lng) => startAddingAt(lat, lng)}
        onSelectPlace={(place) => setSelectedPlaceId(place.id)}
        onFocusPlanet={setFocusedId}
        onExitFocus={handleExitFocus}
        apiRef={apiRef}
        renderMarker={(place) => (
          <EarthMarker place={place} radius={EARTH_RADIUS} onSelect={(p) => setSelectedPlaceId(p.id)} />
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

      {mergeCandidate && (
        <MergeConfirmDialog
          place={mergeCandidate.place}
          onMerge={() => {
            setVisitTargetPlace(mergeCandidate.place);
            setMergeCandidate(null);
          }}
          onCreateNew={() => {
            setPendingLocation({ lat: mergeCandidate.lat, lng: mergeCandidate.lng });
            setMergeCandidate(null);
          }}
          onCancel={() => setMergeCandidate(null)}
        />
      )}

      {pendingLocation && (
        <AddPlacePopup
          lat={pendingLocation.lat}
          lng={pendingLocation.lng}
          onCancel={() => setPendingLocation(null)}
          onSave={({ name, country, date, notes, photos }) => {
            addPlace({ name, country, date, notes, photos, lat: pendingLocation.lat, lng: pendingLocation.lng });
            setPendingLocation(null);
          }}
        />
      )}

      {visitTargetPlace && (
        <AddVisitPopup
          place={visitTargetPlace}
          onCancel={() => setVisitTargetPlace(null)}
          onSave={({ date, notes, photos }) => {
            addVisit(visitTargetPlace.id, { date, notes, photos });
            setVisitTargetPlace(null);
          }}
        />
      )}

      {selectedPlace && (
        <PlaceTimelinePanel
          place={selectedPlace}
          onClose={() => setSelectedPlaceId(null)}
          onAddComment={(visitId, data) => addComment(selectedPlace.id, visitId, data)}
          onDeleteVisit={(visitId) => removeVisit(selectedPlace.id, visitId)}
        />
      )}
    </div>
  );
}
