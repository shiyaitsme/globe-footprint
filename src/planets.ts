export interface PlanetConfig {
  id: string;
  name: string;
  color: string;
  radius: number;
  position: [number, number, number];
  focusDistance: number;
  rotationSpeed: number;
}

export const EARTH_ID = "earth";

export const EARTH_CONFIG: PlanetConfig = {
  id: EARTH_ID,
  name: "地球",
  color: "#ffffff",
  radius: 2,
  position: [0, 0, 0],
  focusDistance: 6,
  rotationSpeed: 0.02,
};

export const PLACEHOLDER_PLANETS: PlanetConfig[] = [
  {
    id: "planet-1",
    name: "星球 A",
    color: "#ff6b6b",
    radius: 0.9,
    position: [7, 2.5, -3],
    focusDistance: 6,
    rotationSpeed: 0.05,
  },
  {
    id: "planet-2",
    name: "星球 B",
    color: "#4c7cf0",
    radius: 1.3,
    position: [-8, -1.5, 2],
    focusDistance: 7.5,
    rotationSpeed: 0.035,
  },
  {
    id: "planet-3",
    name: "星球 C",
    color: "#f0c74c",
    radius: 0.6,
    position: [3.5, -4.5, 6],
    focusDistance: 5,
    rotationSpeed: 0.07,
  },
  {
    id: "planet-4",
    name: "星球 D",
    color: "#9b59ff",
    radius: 1.1,
    position: [-4.5, 4.5, -6],
    focusDistance: 6.5,
    rotationSpeed: 0.04,
  },
  {
    id: "planet-5",
    name: "星球 E",
    color: "#4cf0c7",
    radius: 0.7,
    position: [8.5, -2.5, 4],
    focusDistance: 5.5,
    rotationSpeed: 0.06,
  },
];

export const ALL_PLANETS: PlanetConfig[] = [EARTH_CONFIG, ...PLACEHOLDER_PLANETS];

export function getPlanetConfig(id: string): PlanetConfig | undefined {
  return ALL_PLANETS.find((p) => p.id === id);
}

export const OVERVIEW_CAMERA_POSITION: [number, number, number] = [0, 4, 18];
export const OVERVIEW_CAMERA_TARGET: [number, number, number] = [0, 0, 0];

export const EARTH_DIMMED_POSITION: [number, number, number] = [-4, -2, -5];

export const FOCUS_DIM_SCALE = 0.6;
export const FOCUS_DIM_OPACITY = 0.35;
export const FOCUS_PUSH_FACTOR = 1.35;
export const FOCUS_LERP_SPEED = 0.06;
