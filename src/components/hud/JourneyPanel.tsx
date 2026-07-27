import { useState } from "react";
import CornerBrackets from "./CornerBrackets";
import Lightbox from "./Lightbox";
import ThumbCluster from "./ThumbCluster";
import AddPlacePopup from "./AddPlacePopup";
import type { PlacePopupData } from "./AddPlacePopup";
import { groupVisitsByYear, formatVisitDayMonth } from "../../utils/timeline";
import { flattenVisits, groupPlacesByCountry } from "../../utils/journey";
import type { VisitWithPlace } from "../../utils/journey";
import type { Place } from "../../types";

interface JourneyPanelProps {
  places: Place[];
  onClose: () => void;
  onSelectPlace: (place: Place, visitId?: string) => void;
  onAddPlace: () => void;
  onEditVisit: (placeId: string, visitId: string, data: PlacePopupData) => void;
}

type Mode = "time" | "place";

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  const tabStyle = (active: boolean): React.CSSProperties => ({
    font: "inherit",
    padding: "8px 18px",
    border: `1.5px solid ${active ? "#fff" : "rgba(255,255,255,0.3)"}`,
    background: active ? "#fff" : "transparent",
    color: active ? "#0a0a0c" : "rgba(255,255,255,0.7)",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  });
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button type="button" style={tabStyle(mode === "time")} onClick={() => onChange("time")}>
        按时间
      </button>
      <button type="button" style={tabStyle(mode === "place")} onClick={() => onChange("place")}>
        按地点
      </button>
    </div>
  );
}

export default function JourneyPanel({ places, onClose, onSelectPlace, onAddPlace, onEditVisit }: JourneyPanelProps) {
  const [mode, setMode] = useState<Mode>("time");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingVisit, setEditingVisit] = useState<VisitWithPlace | null>(null);

  const yearGroups = groupVisitsByYear(flattenVisits(places));
  const countryGroups = groupPlacesByCountry(places);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(760px, 94vw)",
          maxHeight: "86vh",
          padding: 26,
          background: "rgba(8,8,10,0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CornerBrackets size={18} />
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 22,
            right: 26,
            width: 32,
            height: 32,
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 12, height: 12 }}>
            <div style={{ position: "absolute", top: 5, left: 0, width: 12, height: 1.5, background: "#fff", transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", top: 5, left: 0, width: 12, height: 1.5, background: "#fff", transform: "rotate(-45deg)" }} />
          </div>
        </button>

        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", paddingRight: 44 }}>全部足迹</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4, marginBottom: 16 }}>
          共 {places.length} 个地点 · {places.reduce((sum, p) => sum + p.visits.length, 0)} 次到访
        </div>

        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            type="button"
            onClick={onAddPlace}
            style={{
              font: "inherit",
              padding: "8px 18px",
              border: "1.5px solid #fff",
              background: "#fff",
              color: "#0a0a0c",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + 添加足迹
          </button>
        </div>

        <div style={{ overflowY: "auto", paddingRight: 4 }}>
          {mode === "time" &&
            (yearGroups.length === 0 ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", padding: "20px 0" }}>还没有任何足迹记录</div>
            ) : (
              yearGroups.map(({ year, visits }) => {
                const expanded = expandedYears.has(year);
                return (
                  <div key={year}>
                    <button
                      type="button"
                      onClick={() => toggleYear(year)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "10px 0",
                        background: "none",
                        border: "none",
                        borderBottom: expanded ? "1px solid rgba(255,255,255,0.15)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{year}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{visits.length} 次</span>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{expanded ? "−" : "+"}</span>
                    </button>

                    {expanded && (
                      <div>
                        {visits.map((visit) => {
                          const { day, month } = formatVisitDayMonth(visit.date);
                          return (
                            <div
                              key={visit.id}
                              style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                            >
                              <div style={{ width: 46, flexShrink: 0, textAlign: "right" }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>
                                  {day}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                                  {month}
                                </div>
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const place = places.find((p) => p.id === visit.placeId);
                                    if (place) onSelectPlace(place, visit.id);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    marginBottom: 6,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "#fff",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 3,
                                  }}
                                >
                                  {visit.placeName}
                                  {visit.placeCountry ? ` · ${visit.placeCountry}` : ""}
                                </button>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                                  <ThumbCluster photos={visit.photos} onOpen={(i) => { setLightboxPhotos(visit.photos); setLightboxIndex(i); }} />
                                  <div style={{ flex: 1, minWidth: 90 }}>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                                      {visit.notes || <span style={{ color: "rgba(255,255,255,0.35)" }}>还没有留下文字记录</span>}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingVisit(visit)}
                                  style={{ marginTop: 6, background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", padding: 0 }}
                                >
                                  编辑
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ))}

          {mode === "place" &&
            (countryGroups.length === 0 ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", padding: "20px 0" }}>还没有任何足迹记录</div>
            ) : (
              countryGroups.map(({ country, places: countryPlaces }) => {
                const expanded = expandedCountries.has(country);
                const visitTotal = countryPlaces.reduce((sum, p) => sum + p.visits.length, 0);
                return (
                  <div key={country}>
                    <button
                      type="button"
                      onClick={() => toggleCountry(country)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "10px 0",
                        background: "none",
                        border: "none",
                        borderBottom: expanded ? "1px solid rgba(255,255,255,0.15)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{country}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                        {countryPlaces.length} 个地点 · {visitTotal} 次到访
                      </span>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{expanded ? "−" : "+"}</span>
                    </button>

                    {expanded && (
                      <div style={{ padding: "6px 0 14px" }}>
                        {countryPlaces.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => onSelectPlace(place)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              padding: "10px 12px",
                              marginTop: 4,
                              background: "rgba(255,255,255,0.04)",
                              border: "none",
                              borderLeft: "2px solid rgba(255,255,255,0.2)",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{place.name}</span>
                            <span style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{place.visits.length} 次到访</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ))}
        </div>
      </div>

      {lightboxPhotos && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxPhotos(null)}
        />
      )}

      {editingVisit && (
        <AddPlacePopup
          mode="edit"
          initial={{
            name: editingVisit.placeName,
            country: editingVisit.placeCountry,
            date: editingVisit.date,
            notes: editingVisit.notes,
            photos: editingVisit.photos,
          }}
          onCancel={() => setEditingVisit(null)}
          onSave={(data) => {
            onEditVisit(editingVisit.placeId, editingVisit.id, data);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}
