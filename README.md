# Globe Footprint 足迹地球

一个以 3D 地球为核心的个人足迹记录网站。首页是一个可以自由漫游的"多星球宇宙"：地球和几颗占位星球散布在 3D 空间里，拖动镜头四处看，点击任意星球，镜头会缓动飞过去聚焦，其余星球缩小推远、虚焦模糊，营造"配角"氛围。点地球会进入核心的足迹记录功能（问候卡片、足迹分布统计、数字统计条，外加拖拽旋转地球、点地表加足迹、点标记看详情）；点其他星球目前是"建设中"占位面板，预留给以后的功能模块。

首页的 HUD 卡片（问候语、分布统计、统计条、导航栏）UI 是从 [Claude Design](https://claude.ai/design) 项目「个人足迹地球网站UI」导入还原的（`Footprint Earth Home.dc.html`），点阵字体、半调点图、边角描边等装饰细节都是照着设计稿在 React 里重新实现的，不是截图。

## 功能

- **多星球宇宙首页**：地球固定在场景中心，几颗大小/配色各异的占位星球自由分布在周围的 3D 空间里，全部缓慢自转；镜头可以自由拖拽漫游（带阻尼惯性），配合 Bloom 辉光效果
- **点击聚焦**：点任意星球，镜头用 GSAP 缓动飞近该星球，其余星球同时缩小、推向背景、降低不透明度，并叠加 DepthOfField 景深模糊，做出"虚焦配角"的层次感；点场景空白处或点导航栏旁的返回按钮可以退出聚焦回到宇宙概览
- **点地球 = 核心足迹功能**：聚焦地球后才会出现问候卡片（国家/城市数）、足迹分布卡（"亚洲/欧洲/其他"三档真实百分比）、底部统计条（国家/城市/足迹三个真实数字）、右下角悬浮加号；可以拖拽旋转地球，点地表任意位置弹出表单（地点名称、国家、文字记录、上传照片）生成一个足迹标记，点已有标记弹出详情卡片补传照片或删除
- **点其他星球 = 功能占位**：显示星球名字 + "建设中"提示面板，是留给以后功能模块（比如导航栏里现在只是占位的 JOURNEY / PROFILE / SETTINGS）的入口位置
- **悬浮"+"按钮**：仅在聚焦地球时出现，点击后以当前正对镜头的经纬度为坐标，直接弹出添加表单（不用先点地球表面）
- 数据保存在浏览器 `localStorage` 中（无需登录、无需后端），照片会在上传时自动压缩为合适尺寸

## 技术栈

- [Vite](https://vite.dev/) + React + TypeScript
- [three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)

## 目录结构

```
src/
  App.tsx                     首页布局：Scene（多星球宇宙）+ 按 focusedId 状态切换显示的 HUD 卡片
  components/
    Earth.tsx                 地球 3D 网格：自转、点击地表转经纬度、可插拔的 renderMarker
    Marker.tsx                旧版足迹标记样式（Earth.tsx 不传 renderMarker 时的默认兜底，目前没有调用方在用）
    Scene.tsx                 多星球宇宙场景：地球 + PLACEHOLDER_PLANETS、自由漫游相机、Bloom/DepthOfField 后处理
    CameraRig.tsx              GSAP 镜头缓动：宇宙概览 <-> 聚焦某颗星球 <-> 聚焦地球上某个足迹
    Planet.tsx                 占位星球 3D 网格：程序化贴图或真实图片贴图、聚焦时的缩放/推远/降饱和度动画
    hud/                      HUD 卡片和交互面板 —— 从 Claude Design 稿子照着做的
      NavBar.tsx / DotWord.tsx / CornerBrackets.tsx   导航栏、点阵字体、边角描边等基础装饰
      UniverseHint.tsx                                宇宙概览状态的提示文案
      GreetingCard.tsx / DistributionCard.tsx / StatStrip.tsx   聚焦地球时才显示的三张数据卡片
      PlanetPanel.tsx / BackButton.tsx                聚焦占位星球时的"建设中"面板 / 通用返回按钮
      EarthMarker.tsx                                 足迹标记（点阵脉冲圆点样式），传给 Scene 里的 Earth 用
      AddFootprintPopup.tsx / FootprintPopup.tsx      加足迹表单 / 足迹详情卡片
      AddFab.tsx                                       右下角悬浮加号（仅聚焦地球时渲染）
  hooks/useFootprints.ts      足迹数据的 CRUD + localStorage 持久化
  utils/
    geo.ts            经纬度 <-> 3D 坐标转换
    geoStats.ts       大洲归类、国家/城市/足迹数统计
    dotMatrix.ts       点阵字体 + 半调点图坐标生成（从设计稿的 JS 逻辑照搬）
    image.ts           上传照片的客户端压缩
    planetTexture.ts   占位星球的程序化贴图生成（equirectangular 画布 + 多层正弦湍流噪声 + 可选极地漩涡）
  planets.ts           地球 + 占位星球的配置（位置、半径、聚焦距离、贴图配色/贴图 URL 等）
public/
  textures/earth.jpg                地球贴图
  textures/planet_A_texture.png     占位星球「星球 A」用的真实贴图
```

## 占位星球的贴图

占位星球默认贴图是纯代码生成的（`planetTexture.ts`），`PlanetConfig` 也支持可选的 `textureUrl` 字段，给了就用 `TextureLoader` 加载真实图片贴图（和 `Earth.tsx` 加载 `earth.jpg` 同一套方式），不再走程序化生成——目前"星球 A"（`planets.ts` 里的 `planet-1`）配了这个字段，用的是 `public/textures/planet_A_texture.png`。

## 点其他星球之后要接功能怎么做

`focusedId` 是某颗占位星球 id 时，`App.tsx` 目前只渲染 `PlanetPanel`（星球名 + "建设中"提示）。以后要给某颗星球接真实功能，在 `App.tsx` 里按 `focusedId` 的值分支渲染对应的功能面板/组件即可，`Scene.tsx` 的镜头聚焦、虚焦、返回逻辑都不用改。

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
