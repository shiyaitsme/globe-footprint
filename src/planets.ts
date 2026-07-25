export interface PlanetConfig {
  id: string;
  name: string;
  radius: number;
  position: [number, number, number];
  focusDistance: number;
  rotationSpeed: number;
  palette: string[];
  vortex?: boolean;
  /** 真实贴图 URL；给了就用 TextureLoader 加载真图，不再走 generateGasGiantTexture 的程序化生成 */
  textureUrl?: string;
}

export const EARTH_ID = "earth";

export const EARTH_CONFIG: PlanetConfig = {
  id: EARTH_ID,
  name: "地球",
  radius: 2,
  position: [0, 0, 0],
  focusDistance: 6,
  rotationSpeed: 0.02,
  palette: [],
};

export const PLACEHOLDER_PLANETS: PlanetConfig[] = [
  {
    id: "planet-1",
    name: "星球 A",
    radius: 0.9,
    position: [7, 2.5, -3],
    focusDistance: 6,
    rotationSpeed: 0.05,
    palette: ["#dce8f5", "#e8b8d8", "#d68fb0", "#e8c5d8", "#c9d8ec"],
    textureUrl: "/textures/planet_A_texture.png",
  },
  {
    id: "planet-2",
    name: "星球 B",
    radius: 1.3,
    position: [-8, -1.5, 2],
    focusDistance: 7.5,
    rotationSpeed: 0.035,
    palette: ["#0f1f4d", "#2a4d8f", "#4a7ab8", "#7ab8d8", "#bfe3ea"],
    textureUrl: "/textures/planet_B_texture.png",
  },
  {
    id: "planet-3",
    name: "星球 C",
    radius: 0.6,
    position: [3.5, -4.5, 6],
    focusDistance: 5,
    rotationSpeed: 0.07,
    palette: ["#2a5c4a", "#6ba888", "#a8c890", "#8fb8c8", "#9888c8"],
    vortex: true,
    textureUrl: "/textures/planet_C_texture.png",
  },
  {
    id: "planet-4",
    name: "星球 D",
    radius: 1.1,
    position: [-4.5, 4.5, -6],
    focusDistance: 6.5,
    rotationSpeed: 0.04,
    palette: ["#e8dcc0", "#d8c89a", "#c8d8d0", "#a8c8d8", "#e0d8b8"],
    textureUrl: "/textures/planet_D_texture.png",
  },
  {
    id: "planet-5",
    name: "星球 E",
    radius: 0.7,
    position: [8.5, -2.5, 4],
    focusDistance: 5.5,
    rotationSpeed: 0.06,
    palette: ["#f0a888", "#e88868", "#d868a0", "#f0c8a8", "#e8a888"],
    textureUrl: "/textures/planet_E_texture.png",
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
