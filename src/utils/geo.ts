import { Vector3 } from "three";

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
