import type { Footprint } from "../types";

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

export function computeDistribution(footprints: Footprint[]): DistributionStats {
  const counts: DistributionStats = { asia: 0, europe: 0, other: 0 };
  for (const f of footprints) {
    counts[classifyContinent(f.lat, f.lng)] += 1;
  }
  const total = footprints.length || 1;
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

export function computeSummary(footprints: Footprint[]): SummaryStats {
  const countries = new Set(footprints.map((f) => f.country.trim()).filter(Boolean));
  const cities = new Set(footprints.map((f) => f.name.trim()).filter(Boolean));
  return {
    countries: countries.size,
    cities: cities.size,
    footprints: footprints.length,
  };
}
