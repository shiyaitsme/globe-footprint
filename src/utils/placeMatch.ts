import type { Place } from "../types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** 名称+国家都一致（大小写、首尾空格不敏感）就认为是同一个地点，自动合并到访记录，不用问用户 */
export function findMatchingPlace(places: Place[], name: string, country: string): Place | null {
  const targetName = normalize(name);
  const targetCountry = normalize(country);
  return (
    places.find((p) => normalize(p.name) === targetName && normalize(p.country) === targetCountry) ?? null
  );
}
