import { Vector3 } from "three";
import type { Place } from "../types";

export function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

export function vector3ToLatLng(point: Vector3, radius: number): { lat: number; lng: number } {
  const normalized = point.clone().normalize().multiplyScalar(radius);
  const lat = 90 - (Math.acos(normalized.y / radius) * 180) / Math.PI;
  const lng = ((Math.atan2(normalized.z, -normalized.x) * 180) / Math.PI) - 180;
  const wrappedLng = ((lng + 180) % 360 + 360) % 360 - 180;
  return { lat, lng: wrappedLng };
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** 新增到访时用来判断"是否和已有地点足够近"的阈值：大致覆盖同一座城市/都会区 */
export const NEARBY_PLACE_THRESHOLD_KM = 150;

export function findNearbyPlace(places: Place[], lat: number, lng: number): Place | null {
  let closest: Place | null = null;
  let closestDistance = Infinity;
  for (const place of places) {
    const distance = haversineDistanceKm(lat, lng, place.lat, place.lng);
    if (distance < NEARBY_PLACE_THRESHOLD_KM && distance < closestDistance) {
      closest = place;
      closestDistance = distance;
    }
  }
  return closest;
}
