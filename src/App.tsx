import { useMemo, useState } from "react";
import Scene from "./components/Scene";
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
import PlaceTimelinePanel from "./components/hud/PlaceTimelinePanel";
import JourneyPanel from "./components/hud/JourneyPanel";
import { usePlaces } from "./hooks/usePlaces";
import { computeDistribution, computeSummary } from "./utils/geoStats";
import { randomLatLng } from "./utils/geo";
import { findMatchingPlace } from "./utils/placeMatch";
import { EARTH_ID, getPlanetConfig } from "./planets";
import "./App.css";

export default function App() {
  const { places, addPlace, addVisit, updatePlace, updateVisit, removeVisit, addComment } = usePlaces();
  const [isAdding, setIsAdding] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [focusVisitId, setFocusVisitId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const summary = useMemo(() => computeSummary(places), [places]);
  const distribution = useMemo(() => computeDistribution(places), [places]);
  const selectedPlace = selectedPlaceId ? places.find((p) => p.id === selectedPlaceId) ?? null : null;
  const focusedPlanet = focusedId && focusedId !== EARTH_ID ? getPlanetConfig(focusedId) ?? null : null;

  const handleExitFocus = () => {
    setFocusedId(null);
    setSelectedPlaceId(null);
    setFocusVisitId(null);
    setIsAdding(false);
  };

  const openPlace = (placeId: string, visitId?: string) => {
    setSelectedPlaceId(placeId);
    setFocusVisitId(visitId ?? null);
  };

  const handleEditVisit = (
    placeId: string,
    visitId: string,
    data: { name: string; country: string; date: string; notes: string; photos: string[] }
  ) => {
    updatePlace(placeId, { name: data.name, country: data.country });
    updateVisit(placeId, visitId, { date: data.date, notes: data.notes, photos: data.photos });
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
        footprintTarget={null}
        onSurfaceClick={() => setIsAdding(true)}
        onSelectPlace={(place) => openPlace(place.id)}
        onFocusPlanet={setFocusedId}
        onExitFocus={handleExitFocus}
        renderMarker={(place) => (
          <EarthMarker place={place} radius={EARTH_RADIUS} onSelect={(p) => openPlace(p.id)} />
        )}
      />

      <NavBar variant="top" onJourneyClick={() => setJourneyOpen(true)} />
      <NavBar variant="bottom" onJourneyClick={() => setJourneyOpen(true)} />

      {focusedId === null && <UniverseHint />}

      {focusedId === EARTH_ID && (
        <>
          <BackButton onClick={handleExitFocus} />
          <GreetingCard countries={summary.countries} cities={summary.cities} />
          <DistributionCard stats={distribution} />
          <StatStrip countries={summary.countries} cities={summary.cities} footprints={summary.footprints} />
          <AddFab onClick={() => setIsAdding(true)} />
        </>
      )}

      {focusedPlanet && (
        <>
          <BackButton onClick={handleExitFocus} />
          <PlanetPanel name={focusedPlanet.name} />
        </>
      )}

      {journeyOpen && (
        <JourneyPanel
          places={places}
          onClose={() => setJourneyOpen(false)}
          onSelectPlace={(place, visitId) => openPlace(place.id, visitId)}
          onAddPlace={() => setIsAdding(true)}
          onEditVisit={handleEditVisit}
        />
      )}

      {selectedPlace && (
        <PlaceTimelinePanel
          place={selectedPlace}
          focusVisitId={focusVisitId}
          onClose={() => {
            setSelectedPlaceId(null);
            setFocusVisitId(null);
          }}
          onAddComment={(visitId, data) => addComment(selectedPlace.id, visitId, data)}
          onDeleteVisit={(visitId) => removeVisit(selectedPlace.id, visitId)}
          onEditVisit={(visitId, data) => handleEditVisit(selectedPlace.id, visitId, data)}
        />
      )}

      {isAdding && (
        <AddPlacePopup
          onCancel={() => setIsAdding(false)}
          onSave={({ name, country, date, notes, photos }) => {
            const match = findMatchingPlace(places, name, country);
            if (match) {
              addVisit(match.id, { date, notes, photos });
            } else {
              const { lat, lng } = randomLatLng();
              addPlace({ name, country, date, notes, photos, lat, lng });
            }
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}
