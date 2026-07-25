# CLAUDE.md

给后续在这个仓库里干活的 Claude Code 会话看的笔记。功能介绍、素材来源见 README.md，这里只写架构决定和容易踩的坑。

## 常用命令

```bash
npm install
npm run dev            # 本地开发服务器
npm run build           # tsc -b && vite build，提交前务必跑一遍确认无 TS 报错
```

没有测试框架，也没有 lint 脚本接入 CI；`.oxlintrc.json` 是 Vite 模板自带的，没启用类型感知规则。

## 现状：首页是"多星球宇宙" + HUD 仪表盘的合体

`App.tsx` 现在直接渲染 `Scene.tsx`（地球 + `PLACEHOLDER_PLANETS` 里的几颗占位星球，自由漫游 + 点击聚焦），全屏铺满，取代了之前那个"背景图/装饰星球 + 固定小圆圈地球插槽"的静态 HUD 版本。`Scene.tsx` / `CameraRig.tsx` / `Planet.tsx` 这套自由漫游 + GSAP 缓动镜头 + Bloom/DepthOfField "虚焦配角"效果**曾经在某次迭代里被搁置过**（`App.tsx` 一度改成只显示 HUD 卡片 + 一个不接受镜头动画的静态地球插槽），现在已经重新接回首页，不要再把它当成可以随便动的死代码。

三种 UI 状态由 `App.tsx` 里的 `focusedId`（`null` / `EARTH_ID` / 占位星球 id）驱动：
- `focusedId === null`（宇宙概览）：只显示导航栏和 `UniverseHint` 提示，所有星球缓慢自转、自由漫游可拖拽。
- `focusedId === EARTH_ID`（聚焦地球）：`GreetingCard` / `DistributionCard` / `StatStrip` / `AddFab` 这几张 HUD 数据卡片才会出现，同时可以点地表加足迹、点标记看详情——这是产品上"点地球 = 核心足迹功能"的入口。
- `focusedId` 是某颗占位星球：显示 `PlanetPanel`（星球名 + "建设中"占位文案），这几颗星球以后要接真实功能时，在这里换内容即可。

三种状态都会有 `BackButton`（点了退出聚焦回到概览）；概览状态下点击场景空白处（`Scene.tsx` 的 `onPointerMissed`）也会退出聚焦，两种退出方式都要留着。

`Earth.tsx` 只有一份，靠可选的 `renderMarker` prop 决定用哪种足迹标记样式；现在 `App.tsx` 无论是给 `Scene` 里的地球，都统一传了 `hud/EarthMarker.tsx`（点阵脉冲圆点样式）。`Marker.tsx`（红色小球 + 文字标签）是 `Earth.tsx` 不传 `renderMarker` 时的默认兜底，目前没有调用方在用，但 `Earth.tsx` 的实现依然保留这个分支，不算死代码。

`hud/EarthSlot.tsx` 和 `hud/EarthCanvas.tsx`（那个把地球单独塞进一个固定小圆圈里、带自己独立 Canvas 的旧实现）已经删掉了——`Scene.tsx` 现在是唯一的地球渲染入口，别再重新造一个。

如果要改地球本身的行为（自转速度、点击判定、缩放/淡出动画），改的是 `Earth.tsx`，`Scene.tsx` 是唯一调用方，不用再担心"两边要不要都改"的问题。

## 地球自转 + 点击经纬度：旋转补偿

`Earth.tsx` 里地球会自转（`EARTH_CONFIG.rotationSpeed`），旋转量加在**外层 group**（`groupRef.current.rotation.y`）上，而不是内层 mesh —— 这样足迹标记（作为 group 的子节点）才会跟着贴图一起转，不会转着转着就和实际地理位置对不上。

点击地表算经纬度时（`handleClick` 里），必须先把 raycast 拿到的世界坐标点按当前 `groupRef.current.rotation.y` 反向旋转（`unrotateY`），再喂给 `vector3ToLatLng`，否则算出来的经纬度会随着自转累积的角度越转越偏。这两处（旋转挂在哪个节点上 + 点击时的反向旋转）必须配套修改，改一半会导致"标记显示位置正确，但新加的足迹点错位"这种不容易发现的 bug。

## 数据模型

`Footprint`（`src/types.ts`）在某次迭代里加了可选的 `country` 字段（给 HUD 首页的国家/城市统计用）。`useFootprints.ts` 的 `load()` 会给旧数据（localStorage 里没有 `country` 字段的）补一个空字符串默认值——加新的必填字段时记得同样处理旧数据兼容，不要假设 localStorage 里的数据一定符合最新的 `Footprint` 类型。

`utils/geoStats.ts` 的大洲归类（`classifyContinent`）是拍脑袋的经纬度矩形判断，不是真实的地理边界数据，只分"亚洲/欧洲/其他"三档，和设计稿的三档分布卡对应。以后如果要做更细的地区统计，这里需要换成真正的地理数据或反向地理编码。

## 测试环境的一个坑（跟代码无关，纯粹是这个沙盒环境的限制）

在这个 headless Chromium + Playwright 的沙盒里，WebGL 是 SwiftShader 软件渲染（没有真实 GPU），加上后处理（Bloom/DepthOfField）之后帧率会掉到个位数，甚至偶尔观察到相机动画的最终状态"飞错地方"。已经验证过这是纯粹的软件渲染性能问题，不是相机/动画逻辑的 bug（同样的操作序列，关掉后处理后连续多次测试，相机都精确停在预期位置）。如果以后调后处理相关的代码，测试时得留意：这个环境测出来的帧率/动画表现不代表真实设备，不要据此去砍功能。
