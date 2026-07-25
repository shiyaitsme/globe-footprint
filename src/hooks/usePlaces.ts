import { useCallback, useEffect, useState } from "react";
import type { Footprint, Place, Visit, VisitComment } from "../types";

const STORAGE_KEY = "globe-footprint.places";

function dateStringFromTimestamp(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayDateString(): string {
  return dateStringFromTimestamp(Date.now());
}

function isLegacyFootprint(item: unknown): item is Footprint {
  return !!item && typeof item === "object" && !Array.isArray((item as Place).visits);
}

function migrateLegacyFootprint(f: Footprint): Place {
  return {
    id: f.id,
    name: f.name,
    country: f.country ?? "",
    lat: f.lat,
    lng: f.lng,
    visits: [
      {
        id: crypto.randomUUID(),
        date: dateStringFromTimestamp(f.createdAt),
        notes: f.notes ?? "",
        photos: f.photos ?? [],
        createdAt: f.createdAt,
        comments: [],
      },
    ],
  };
}

function normalizePlace(raw: Place): Place {
  return {
    ...raw,
    country: raw.country ?? "",
    visits: raw.visits.map((v) => ({
      ...v,
      notes: v.notes ?? "",
      photos: v.photos ?? [],
      comments: v.comments ?? [],
    })),
  };
}

function load(): Place[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((item) =>
      isLegacyFootprint(item) ? migrateLegacyFootprint(item as Footprint) : normalizePlace(item as Place)
    );
  } catch {
    return [];
  }
}

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    } catch (err) {
      console.error("Failed to save places — localStorage may be full.", err);
    }
  }, [places]);

  const addPlace = useCallback(
    (data: { name: string; country: string; lat: number; lng: number; date: string; notes: string; photos: string[] }) => {
      const place: Place = {
        id: crypto.randomUUID(),
        name: data.name,
        country: data.country,
        lat: data.lat,
        lng: data.lng,
        visits: [
          {
            id: crypto.randomUUID(),
            date: data.date,
            notes: data.notes,
            photos: data.photos,
            createdAt: Date.now(),
            comments: [],
          },
        ],
      };
      setPlaces((prev) => [...prev, place]);
      return place;
    },
    []
  );

  const addVisit = useCallback(
    (placeId: string, data: { date: string; notes: string; photos: string[] }) => {
      const visit: Visit = {
        id: crypto.randomUUID(),
        date: data.date,
        notes: data.notes,
        photos: data.photos,
        createdAt: Date.now(),
        comments: [],
      };
      setPlaces((prev) => prev.map((p) => (p.id === placeId ? { ...p, visits: [...p.visits, visit] } : p)));
      return visit;
    },
    []
  );

  const updateVisit = useCallback((placeId: string, visitId: string, patch: Partial<Visit>) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id !== placeId
          ? p
          : { ...p, visits: p.visits.map((v) => (v.id === visitId ? { ...v, ...patch } : v)) }
      )
    );
  }, []);

  const removeVisit = useCallback((placeId: string, visitId: string) => {
    setPlaces((prev) =>
      prev
        .map((p) => (p.id !== placeId ? p : { ...p, visits: p.visits.filter((v) => v.id !== visitId) }))
        .filter((p) => p.visits.length > 0)
    );
  }, []);

  const removePlace = useCallback((placeId: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
  }, []);

  const addComment = useCallback(
    (placeId: string, visitId: string, data: { text: string; photos: string[] }) => {
      const comment: VisitComment = {
        id: crypto.randomUUID(),
        text: data.text,
        photos: data.photos,
        createdAt: Date.now(),
      };
      setPlaces((prev) =>
        prev.map((p) =>
          p.id !== placeId
            ? p
            : {
                ...p,
                visits: p.visits.map((v) =>
                  v.id === visitId ? { ...v, comments: [...v.comments, comment] } : v
                ),
              }
        )
      );
      return comment;
    },
    []
  );

  const removeComment = useCallback((placeId: string, visitId: string, commentId: string) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id !== placeId
          ? p
          : {
              ...p,
              visits: p.visits.map((v) =>
                v.id !== visitId ? v : { ...v, comments: v.comments.filter((c) => c.id !== commentId) }
              ),
            }
      )
    );
  }, []);

  return {
    places,
    addPlace,
    addVisit,
    updateVisit,
    removeVisit,
    removePlace,
    addComment,
    removeComment,
  };
}
