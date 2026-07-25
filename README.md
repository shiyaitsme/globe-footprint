# Globe Footprint 足迹地球

一个以 3D 地球为核心的个人足迹记录网站。首页是一个科幻 HUD 风格的仪表盘（顶部/底部导航、问候卡片、足迹分布统计、数字统计条、悬浮添加按钮），中间是一个可交互的 3D 地球：拖动旋转，点击地表任意位置为去过的地方添加照片和文字记录，点击已有的足迹标记查看详情。

首页 UI 是从 [Claude Design](https://claude.ai/design) 项目「个人足迹地球网站UI」导入还原的（`Footprint Earth Home.dc.html`），点阵字体、半调点图、边角描边等装饰细节都是照着设计稿在 React 里重新实现的，不是截图。

## 功能

- **HUD 首页**：全屏 3D 星球背景（多颗程序化生成/贴图星球缓慢自转，非交互）+ 暗角，点阵字体渲染的品牌名和导航（HOME / JOURNEY / PROFILE / SETTINGS，后三者目前只是占位）
- **问候卡片**：展示已记录的国家数 / 城市数
- **足迹分布卡**：按经纬度粗略归类到"亚洲 / 欧洲 / 其他"三个大洲桶，算出真实百分比（非设计稿假数据）
- **底部统计条**：国家 / 城市 / 足迹三个数字，均来自真实数据
- **中间的 3D 地球**：可拖拽旋转（带阻尼惯性），点击地表任意位置弹出表单（地点名称、国家、文字记录、上传照片）生成一个足迹标记；点击已有标记弹出详情卡片，可以补传照片或删除
- **悬浮"+"按钮**：点击后以当前正对镜头的经纬度为坐标，直接弹出添加表单（不用先点地球）
- 数据保存在浏览器 `localStorage` 中（无需登录、无需后端），照片会在上传时自动压缩为合适尺寸

## 技术栈

- [Vite](https://vite.dev/) + React + TypeScript
- [three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)

## 目录结构

```
src/
  App.tsx                     首页布局，把下面这些 HUD 组件和地球拼在一起
  components/
    Earth.tsx                 地球 3D 网格：自转、点击地表转经纬度、可插拔的 renderMarker
    Marker.tsx                旧版足迹标记（多星球宇宙在用）
    hud/                      当前首页实际使用的 UI —— 从 Claude Design 稿子照着做的
      NavBar.tsx / DotWord.tsx / CornerBrackets.tsx   导航栏、点阵字体、边角描边等基础装饰
      GreetingCard.tsx / DistributionCard.tsx / StatStrip.tsx   三张数据卡片
      EarthSlot.tsx / EarthCanvas.tsx / EarthMarker.tsx         圆形插槽里的 3D 地球 + 足迹标记（点阵脉冲圆点样式）
      AddFootprintPopup.tsx / FootprintPopup.tsx                加足迹表单 / 足迹详情卡片
      AddFab.tsx                                                右下角悬浮加号
      PlanetBackdrop.tsx                                        首页全屏背景：多颗不可交互的装饰星球（见下方"首页背景"一节）
    Scene.tsx / CameraRig.tsx / Planet.tsx   多星球宇宙（见下方"多星球宇宙"一节），当前未接入导航
  hooks/useFootprints.ts      足迹数据的 CRUD + localStorage 持久化
  utils/
    geo.ts            经纬度 <-> 3D 坐标转换
    geoStats.ts       大洲归类、国家/城市/足迹数统计
    dotMatrix.ts       点阵字体 + 半调点图坐标生成（从设计稿的 JS 逻辑照搬）
    image.ts           上传照片的客户端压缩
    planetTexture.ts   星球的程序化贴图生成（首页背景星球和多星球宇宙占位星球共用）
    backdropPlanets.ts  首页背景装饰星球的位置/配色/贴图配置
  planets.ts           地球 + 多星球宇宙占位星球的配置（位置、半径、贴图配色等）
public/
  textures/earth.jpg                地球贴图
  textures/planet_A_texture.png     首页背景 + 多星球宇宙「星球 A」共用的真实贴图
```

## 多星球宇宙（暂未接入首页）

在做 HUD 首页之前，这个项目有一版"自由漫游的多星球宇宙"首页：地球 + 5 颗可点击聚焦的占位星球，点击后镜头用 GSAP 缓动飞过去，其余星球缩小/推远/降低饱和度，配合 Bloom 辉光和 DepthOfField 景深做出"虚焦配角"的氛围。这部分代码（`Scene.tsx`、`CameraRig.tsx`、`Planet.tsx`、`Marker.tsx`）还在仓库里，但目前**没有接入任何导航入口**，是特意保留、按产品决定暂时搁置的，不是遗留死代码——如果以后要把 JOURNEY 之类的导航页做成"飞向另一颗星球"的交互，这套逻辑可以直接复用。

占位星球的贴图默认是纯代码生成的（`planetTexture.ts`：equirectangular 画布 + 多层正弦湍流噪声 + 可选极地漩涡，配色对应几张梦幻渐变星球的参考图）。`PlanetConfig` 也支持可选的 `textureUrl` 字段，给了就用 `TextureLoader` 加载真实图片贴图（和 `Earth.tsx` 加载 `earth.jpg` 同一套方式），不再走程序化生成——目前"星球 A"（`planets.ts` 里的 `planet-1`）配了这个字段，用的是 `public/textures/planet_A_texture.png`。

`Earth.tsx` 同时被 HUD 首页和这套多星球宇宙共用，通过一个可选的 `renderMarker` prop 决定用哪种足迹标记样式（HUD 用点阵脉冲圆点 `EarthMarker`，多星球宇宙用旧版 `Marker`），避免为了换皮就分叉出两份地球逻辑。

## 首页背景

首页最外层背景不是静态图片，而是 `PlanetBackdrop.tsx` 渲染的一个独立 `Canvas`：十来颗不可交互的装饰星球（大部分程序化生成，其中一颗复用 `planet_A_texture.png` 真实贴图）缓慢自转，摆位参考早期设计稿里"星球合照"背景图的大致布局换算成世界坐标（配置见 `utils/backdropPlanets.ts`），刻意避开中间地球所在区域。这个 Canvas 整体 `pointer-events: none`，不会拦截 HUD 和中间地球的点击/拖拽；套了和原设计稿背景图一样的 `brightness(0.72) saturate(1.05)` CSS 滤镜降低亮度饱和度，避免和中间的地球、文字抢视觉。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 数据存储说明

足迹记录（含照片）保存在浏览器本地的 `localStorage` 中，仅在当前浏览器 / 设备可见，清除浏览器数据会导致记录丢失。上传的照片会在客户端自动压缩（长边最大 1600px，JPEG 质量 0.8），以降低占用 `localStorage` 空间的风险；如果计划长期记录大量照片，后续可以考虑迁移到 IndexedDB 或接入后端存储。

足迹的"国家"字段是可选的，历史数据没有这个字段时会自动补空字符串，不会报错；国家/城市统计和分布卡百分比都是按当前实际数据实时算出来的。

## 素材来源

- 地球贴图 `public/textures/earth.jpg` 取自 [three-globe](https://github.com/vasturiano/three-globe) 项目自带的示例贴图（基于 NASA Blue Marble 影像）。
- 星球贴图 `public/textures/planet_A_texture.png` 由用户提供。
