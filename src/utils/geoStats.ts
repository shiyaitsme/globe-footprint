import type { Place } from "../types";

export type ContinentBucket = "asia" | "europe" | "other";

export function classifyContinent(lat: number, lng: number): ContinentBucket {
  if (lat >= 34 && lat <= 71 && lng >= -25 && lng <= 40) return "europe";
  if (lat >= -10 && lat <= 55 && lng >= 40 && lng <= 150) return "asia";
  return "other";
}

export interface DistributionStats {
  asia: number;
  europe: number;
  other: number;
}

/** 每次到访都算一次分布贡献（同一个地点去得越多次，占比越高） */
export function computeDistribution(places: Place[]): DistributionStats {
  const counts: DistributionStats = { asia: 0, europe: 0, other: 0 };
  let total = 0;
  for (const place of places) {
    for (const _visit of place.visits) {
      counts[classifyContinent(place.lat, place.lng)] += 1;
      total += 1;
    }
  }
  total = total || 1;
  return {
    asia: Math.round((counts.asia / total) * 100),
    europe: Math.round((counts.europe / total) * 100),
    other: Math.round((counts.other / total) * 100),
  };
}

export interface SummaryStats {
  countries: number;
  cities: number;
  footprints: number;
}

export function computeSummary(places: Place[]): SummaryStats {
  const countries = new Set(places.map((p) => p.country.trim()).filter(Boolean));
  const cities = new Set(places.map((p) => p.name.trim()).filter(Boolean));
  const footprints = places.reduce((sum, p) => sum + p.visits.length, 0);
  return {
    countries: countries.size,
    cities: cities.size,
    footprints,
  };
}
