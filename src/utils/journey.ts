import type { Place, Visit } from "../types";

export interface VisitWithPlace extends Visit {
  placeId: string;
  placeName: string;
  placeCountry: string;
}

/** 把所有地点的到访记录摊平成一条列表，每条都带上属于哪个地点/国家——给"按时间"全局浏览用 */
export function flattenVisits(places: Place[]): VisitWithPlace[] {
  return places.flatMap((place) =>
    place.visits.map((visit) => ({
      ...visit,
      placeId: place.id,
      placeName: place.name,
      placeCountry: place.country,
    }))
  );
}

export interface CountryGroup {
  country: string;
  places: Place[];
}

const UNKNOWN_COUNTRY = "未知国家";

/** 按国家分组地点（国家名按字母排序，未填国家的统一归到"未知国家"）——给"按地点"全局浏览用 */
export function groupPlacesByCountry(places: Place[]): CountryGroup[] {
  const byCountry = new Map<string, Place[]>();
  for (const place of places) {
    const key = place.country.trim() || UNKNOWN_COUNTRY;
    const bucket = byCountry.get(key);
    if (bucket) bucket.push(place);
    else byCountry.set(key, [place]);
  }
  return Array.from(byCountry.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([country, countryPlaces]) => ({ country, places: countryPlaces }));
}
