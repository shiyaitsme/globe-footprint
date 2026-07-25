export interface BackdropPlanetConfig {
  id: string;
  position: [number, number, number];
  radius: number;
  palette: string[];
  seed: number;
  vortex?: boolean;
  turbulence?: number;
  ring?: boolean;
  rotationSpeed: number;
  textureUrl?: string;
}

/**
 * 首页背景装饰星球：位置按参考设计稿（星球合照背景图）里各星球的大致屏幕布局换算到
 * 世界坐标（camera 在 z=10，fov 50 时可视范围约 x:[-9,9] y:[-4.6,4.6]），
 * 刻意避开中间地球所在的区域。纯装饰、不可交互。
 */
export const BACKDROP_PLANETS: BackdropPlanetConfig[] = [
  {
    id: "backdrop-moon",
    position: [-10, 5, -9],
    radius: 1.1,
    palette: ["#d8d5d2", "#bfbcb8", "#e8e6e2", "#a8a5a0"],
    seed: 11,
    turbulence: 0.25,
    rotationSpeed: 0.01,
  },
  {
    id: "backdrop-jupiter",
    position: [-4.5, 5.5, -10],
    radius: 1.3,
    palette: ["#d8543a", "#e8926a", "#f0d8c0", "#c8683a", "#e8b088"],
    seed: 22,
    vortex: true,
    turbulence: 0.8,
    rotationSpeed: 0.015,
  },
  {
    id: "backdrop-nebula-pink",
    position: [2, 6, -9],
    radius: 1.4,
    palette: [],
    seed: 33,
    rotationSpeed: 0.012,
    textureUrl: "/textures/planet_A_texture.png",
  },
  {
    id: "backdrop-pale-blue",
    position: [9.5, 5.2, -10],
    radius: 1.2,
    palette: ["#dce8f0", "#b8ccd8", "#f0f4f6", "#a0b8c8"],
    seed: 44,
    turbulence: 0.35,
    ring: true,
    rotationSpeed: 0.018,
  },
  {
    id: "backdrop-saturn",
    position: [-11, 0, -9],
    radius: 1.2,
    palette: ["#e8a888", "#d868a0", "#f0c8a8", "#c86888"],
    seed: 55,
    turbulence: 0.5,
    ring: true,
    rotationSpeed: 0.02,
  },
  {
    id: "backdrop-teal-giant",
    position: [11.5, 1, -11],
    radius: 1.6,
    palette: ["#a8d8d8", "#dcecec", "#88b8c0", "#c8e8e8"],
    seed: 66,
    turbulence: 0.3,
    ring: true,
    rotationSpeed: 0.01,
  },
  {
    id: "backdrop-galaxy",
    position: [11, -4.5, -10],
    radius: 1.7,
    palette: ["#3a1f4d", "#8a4fa8", "#d888c8", "#4a2a6a", "#c05a98"],
    seed: 77,
    vortex: true,
    turbulence: 1.1,
    rotationSpeed: 0.025,
  },
  {
    id: "backdrop-olive",
    position: [0, -6.2, -10],
    radius: 1.6,
    palette: ["#c8b878", "#a89858", "#d8c898", "#98a888"],
    seed: 88,
    turbulence: 0.45,
    rotationSpeed: 0.014,
  },
  {
    id: "backdrop-warm-stripe",
    position: [-9.5, -5, -9],
    radius: 1.3,
    palette: ["#f0a888", "#e88868", "#d868a0", "#f0c8a8"],
    seed: 99,
    turbulence: 0.55,
    rotationSpeed: 0.017,
  },
  {
    id: "backdrop-teal-small",
    position: [5.5, -6, -9],
    radius: 0.8,
    palette: ["#4a8878", "#6ba888", "#3a6858"],
    seed: 110,
    turbulence: 0.4,
    rotationSpeed: 0.022,
  },
];
