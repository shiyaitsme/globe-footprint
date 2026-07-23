import { useCallback, useEffect, useState } from "react";
import type { Footprint } from "../types";

const STORAGE_KEY = "globe-footprint.places";

function load(): Footprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Footprint[]) : [];
  } catch {
    return [];
  }
}

export function useFootprints() {
  const [footprints, setFootprints] = useState<Footprint[]>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(footprints));
    } catch (err) {
      console.error("Failed to save footprints — localStorage may be full.", err);
    }
  }, [footprints]);

  const addFootprint = useCallback((footprint: Footprint) => {
    setFootprints((prev) => [...prev, footprint]);
  }, []);

  const updateFootprint = useCallback((id: string, patch: Partial<Footprint>) => {
    setFootprints((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFootprint = useCallback((id: string) => {
    setFootprints((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { footprints, addFootprint, updateFootprint, removeFootprint };
}
