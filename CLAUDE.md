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

**已经聚焦某个星球/地球时，点击其他星球/地球不会直接跳过去聚焦它，而是先退回概览**——和点空白处退出是同一个效果，想看别的星球得先退出再点一次。这是 `Scene.tsx` 里 `handleFocusableSelect(id)` 的行为：`focusedId === null`（概览）时点击才会真正切换聚焦目标；已经聚焦时点击"当前聚焦对象以外的东西"一律 `onExitFocus()`，点击当前已聚焦的对象本身则什么都不做。`Earth.tsx`/`Planet.tsx` 自己不知道这个"先退出再切换"的语义，它们始终只是老老实实报告"我被点了"（`onSelect`），语义判断全部收在 `Scene.tsx` 里，别把这层判断下沉到具体星球组件。

**点击 vs 拖拽：`onClick` 不会区分两者。** 用鼠标拖拽转动镜头（OrbitControls 依赖同一块 canvas 的 mousedown/mousemove/mouseup），如果拖拽的起点和终点都落在同一颗星球/地球的网格上，three.js/`@react-three/fiber` 的 `onClick` 依然会正常触发——因为它只看"抬手时鼠标下面是什么"，不管抬手之前鼠标移动了多远。不加处理的话，绕着星球转视角松手的瞬间就会把它意外聚焦打开。修复方式是 `utils/pointer.ts` 的 `isClickNotDrag`：`Earth.tsx`/`Planet.tsx` 的网格上都加了 `onPointerDown` 记录按下时的屏幕坐标，`onClick` 里比较松手坐标和按下坐标的距离，超过 `CLICK_DRAG_THRESHOLD_PX`（6px）就当作是拖拽，直接 return，不触发 `onSelect`/`onSurfaceClick`。这个判断必须放在每个网格自己的 handler 里（而不是 `Scene.tsx` 的 `handleFocusableSelect`），因为它要用到该网格自己的 `onPointerDown`/`onClick` 事件坐标。

`Earth.tsx` 只有一份，靠可选的 `renderMarker` prop 决定用哪种足迹标记样式；现在 `App.tsx` 无论是给 `Scene` 里的地球，都统一传了 `hud/EarthMarker.tsx`（点阵脉冲圆点样式）。`Marker.tsx`（红色小球 + 文字标签）是 `Earth.tsx` 不传 `renderMarker` 时的默认兜底，目前没有调用方在用，但 `Earth.tsx` 的实现依然保留这个分支，不算死代码。

`hud/EarthSlot.tsx` 和 `hud/EarthCanvas.tsx`（那个把地球单独塞进一个固定小圆圈里、带自己独立 Canvas 的旧实现）已经删掉了——`Scene.tsx` 现在是唯一的地球渲染入口，别再重新造一个。

如果要改地球本身的行为（自转速度、点击判定、缩放/淡出动画），改的是 `Earth.tsx`，`Scene.tsx` 是唯一调用方，不用再担心"两边要不要都改"的问题。

## 占位星球的真实贴图：不能直接用 `TextureLoader`

`planets.ts` 里配了 `textureUrl` 的占位星球（星球 A~E 现在全配了），加载贴图走的是 `utils/seamlessTextureLoader.ts` 里的 `SeamlessEquirectTextureLoader`，**不是** three.js 自带的 `TextureLoader`。原因：这几张贴图（用户上传的）大多不是真正的 equirectangular 全景图，而是"一张有球面弧度的照片"（比如 `planet_B_texture.png`，其实就是从某个角度拍的一颗星球的照片，不是能无缝 360° 环绕的贴图）。如果直接用 `TextureLoader` 把这种图按标准球面 UV（经度 0°~360° 对应图片左边到右边）贴上去，图片左边缘和右边缘对不上，会在球面上出现一条很丑的硬接缝——而且往往还不只是接缝那么简单：原图边缘部分（原拍摄角度里画面边缘、掠射光照）本来就偏"平"、细节少，被贴到新球体上以后，接缝两侧会呈现出"一半有细节纹理、一半像没贴图一样平"的诡异效果（实测过，见过一次这个问题）。

`SeamlessEquirectTextureLoader` 的做法：截取原图中间最清晰的一段（`CORE_FRACTION = 0.6`，即中间 60% 宽度），镜像铺满整张画布再拿去贴图，这样球面的"环绕接缝"和"镜像对折缝"两处都能严丝合缝对上（镜像后接缝两侧本来就是同一列像素）。代价是星球背面会是正面的镜像重复，不是独一无二的纹理——对这种装饰性的占位星球来说完全够用，不要为了追求"背面也不同"就换回 `TextureLoader`，会导致接缝问题重新出现。

`Earth.tsx` 的地球贴图（`2k_earth_daymap.jpg`）**不**用这套 loader——它是真实的 NASA Blue Marble 等距柱状投影图，本来就无缝，镜像裁切反而会把地理位置搞乱，继续用普通 `TextureLoader` 加载即可。

## 地球自转 + 点击经纬度：旋转补偿

`Earth.tsx` 里地球会自转（`EARTH_CONFIG.rotationSpeed`），旋转量加在**外层 group**（`groupRef.current.rotation.y`）上，而不是内层 mesh —— 这样足迹标记（作为 group 的子节点）才会跟着贴图一起转，不会转着转着就和实际地理位置对不上。

点击地表算经纬度时（`handleClick` 里），必须先把 raycast 拿到的世界坐标点按当前 `groupRef.current.rotation.y` 反向旋转（`unrotateY`），再喂给 `vector3ToLatLng`，否则算出来的经纬度会随着自转累积的角度越转越偏。这两处（旋转挂在哪个节点上 + 点击时的反向旋转）必须配套修改，改一半会导致"标记显示位置正确，但新加的足迹点错位"这种不容易发现的 bug。

## 数据模型：`Place` + `Visit` + `VisitComment`（不再是扁平的 `Footprint`）

早期版本里一个 `Footprint` = 地球上一个点 + 一个日期 + 一组照片/文字，一次到访就是一个 marker。为了支持"同一个地方去过好几次，点开显示一条完整 timeline"，数据模型已经改成三层（`src/types.ts`）：

- `Place`：地球上的一个地点（`name` / `country` / `lat` / `lng` + `visits: Visit[]`）。**一个地点只对应一个 marker**，不管去过多少次。
- `Visit`：一次具体到访（`date` 到访日期 `YYYY-MM-DD` / `notes` / `photos` / `createdAt` 记录创建时间 / `comments: VisitComment[]`）。
- `VisitComment`：挂在某一次 `Visit` 下面的"回顾式"评论（比如多年后回看某次旅行补的照片/感想），有自己独立的 `createdAt`（评论本身写于何时，不是被回顾那次到访的日期）。回顾评论**只挂在具体某次到访上**，不挂在整个地点上，渲染时也刻意用更淡、缩进、左边框的样式和主时间线区分开，不要把两者的展示逻辑混在一起。

`src/hooks/usePlaces.ts`（替代旧的 `useFootprints.ts`）负责存储和迁移：`load()` 里会检测 localStorage 数据是不是旧的扁平 `Footprint[]`（没有 `visits` 字段），有的话自动把每条旧记录转成一个只有 1 次到访的 `Place`。以后再加字段，记得同样考虑旧数据兼容（不要假设 localStorage 里的数据一定符合最新类型）。

`src/utils/geoStats.ts` 的 `computeSummary`/`computeDistribution` 现在基于 `Place[]`：国家/城市数按**地点**去重，`footprints`（HUD 上"足迹"这个数字）按**到访次数**（所有地点的 `visits.length` 求和）统计，两者故意不是同一个维度。大洲归类（`classifyContinent`）还是拍脑袋的经纬度矩形判断，不是真实地理边界数据，以后要做更细的地区统计需要换成真正的地理数据或反向地理编码。

### 新增到访 = "点附近已有地点"合并检测

再次到访一个已有地点时（比如又去了一次东京），入口不是在时间线面板里放个固定的"+"按钮，而是复用"点地球加足迹"这个已有交互：`utils/geo.ts` 的 `findNearbyPlace(places, lat, lng)` 用 haversine 距离（`NEARBY_PLACE_THRESHOLD_KM = 150`，大致一个城市/都会区的范围）在点击点附近找已有地点。`App.tsx` 的 `startAddingAt(lat, lng)` 是唯一入口，`onSurfaceClick`（点地表）和 `handleFabClick`（点右下角 + 用当前镜头中心）都走这个函数：

- 附近没有地点 → 直接打开 `AddPlacePopup`（新地点：名称+国家+日期+文字+照片）。
- 附近有地点 → 弹 `MergeConfirmDialog`，选"添加为到访"就打开 `AddVisitPopup`（只填日期+文字+照片，挂到已有 `Place.visits`），选"作为新地点"就还是走 `AddPlacePopup`。

`PlaceTimelinePanel.tsx` 点开某个 marker 后展示的就是该 `Place` 的完整 timeline：年份用 `utils/timeline.ts` 的 `groupVisitsByYear` 分组，默认全部折叠（大号加粗年份数字），点击展开显示该年内每次到访（日期徽标越小越淡，缩略图簇 + 文字，参考朋友圈但张数不固定），点缩略图用 `Lightbox.tsx` 看大图，评论区在每条到访下面单独渲染。

**测试这块功能时的一个坑**：`Earth.tsx` 里地球不管有没有聚焦都会持续自转（`EARTH_CONFIG.rotationSpeed`），所以自动化测试里"记住一个屏幕像素坐标，隔几秒再点一次同一个像素"**不代表点到了地球上同一个地理位置**——旋转会让同一个像素对应的经纬度持续漂移，几秒内就可能漂移出 `NEARBY_PLACE_THRESHOLD_KM` 的范围，导致合并检测测出来"没找到附近地点"，看起来像 bug 但其实是测试方法本身的问题。验证合并流程更可靠的办法：连续两次点右下角的 `AddFab`（它用 `SceneApi.getCenterLatLng()`，基于相机朝向算，不受地球贴图旋转影响，两次点出来的经纬度是稳定的），而不是对着地表固定像素点两次。

## `EffectComposer` 的 children 数量不能随状态变化

`Scene.tsx` 里 `<EffectComposer>` 曾经这样写：`Bloom` 常驻，`DepthOfField` 只在 `focusedPosition` 有值（即聚焦某颗星球/地球）时才作为第二个 child 挂进去，没聚焦时数组只有一个元素。**这个写法会把 `@react-three/postprocessing` 的渲染循环拖死**——从"聚焦"退回"概览"、`DepthOfField` 被卸载的那一刻，画面会完全冻结在退出前的最后一帧，不再更新（不是变慢，是彻底不再渲染任何新帧），`CameraRig` 的 GSAP 缓动镜头逻辑本身完全正常、状态也正确切换了，只是没有画面能体现出来。复现方式：聚焦地球后用滚轮/拖拽随便动一下镜头，再点"返回宇宙"，旧代码会卡死不动，实测过好几秒到十几秒都不会恢复。

修复方式：`Bloom` 和 `DepthOfField` **两个 effect 永远都挂载着**，不聚焦时不要把 `DepthOfField` 从 children 里拿掉，而是把它的 `bokehScale` 设成 `0`（`target` 给个默认值比如 `EARTH_CONFIG.position`，反正 `bokehScale=0` 时不产生任何虚焦，target 给什么都看不出来）。以后如果还要加别的后处理 effect，同样的原则：**effect 的挂载数量/顺序要保持稳定，用 props 控制强弱，不要用条件渲染控制有无**。

## 相机缓动（`CameraRig.tsx`）：`flyTo` 每次都要从"当前真实状态"起飞

`CameraRig.tsx` 用一个持久化的 `tween`（`useRef` 存的普通对象，`gsap.to()` 直接对它做数值补间）来驱动 `camera.position` 和 `controls.target`。这个 `tween` 只在**自己触发的补间过程中**被更新——如果 GSAP 补间结束后 `controls.enabled` 恢复为 `true`，用户又用鼠标自由拖拽/滚轮缩放了一阵（这个场景下 `enablePan={false}`，所以 `controls.target` 不会被用户操作改变，但 `camera.position` 会），下一次调用 `flyTo()` 时，如果直接从 `tween` 存的旧数值开始补间，这个旧数值已经和用户实际看到的镜头位置对不上了。所以 `flyTo()` 一开始必须先把 `tween.px/py/pz`（以及 `tx/ty/tz`）从 `camera.position` / `controls.target` 的**当前实际值**重新同步一遍，再开始新的补间，不能假设 `tween` 里存的还是准的。同一个地方还顺手 flush 了一下 OrbitControls 可能残留的阻尼惯性（临时关掉 `enableDamping` 调一次 `update()` 再恢复），避免它在补间过程中继续自己拽相机。

## 部署：Cloudflare Workers，没有 wrangler.toml 不是漏配

这个仓库直接连了 Cloudflare Workers 的 Workers Builds，推送到 `main` 会自动构建部署到 `https://wanderer.shiya9863.workers.dev`（静态资源 Worker）。仓库里故意没有 `wrangler.toml`——构建命令、部署命令这些都是在 Cloudflare 后台配置的，不是这边漏放了配置文件，不要因为找不到 wrangler 配置就去仓库里加一个，去 Cloudflare 那边的 Settings → Build 改就行。

仓库本身在某次迭代里从 `globe-footprint` 改名成了 `wanderer`（为了和 Cloudflare 那边的 Worker 名字对上），历史和远程地址都是同一个仓库，GitHub 改名后旧名字的地址还能继续用（自动跳转），git fetch/push 不用改任何东西。

## 测试环境的一个坑（跟代码无关，纯粹是这个沙盒环境的限制）

在这个 headless Chromium + Playwright 的沙盒里，WebGL 是 SwiftShader 软件渲染（没有真实 GPU），加上后处理（Bloom/DepthOfField）之后帧率会掉到个位数。如果测试时发现相机动画看起来"没到位"，先耐心多等几秒再截图排除纯粹的渲染慢——但**"卡死不动"和"渲染慢"不是一回事**：上面 `EffectComposer` 那条就是一个真实存在过的 bug，在这个慢速沙盒里第一次排查时被误判成"纯粹是环境渲染慢，等久一点就好"，直到真实用户在真实设备上复现出"点返回宇宙后画面永久卡死"才发现是渲染循环真的被冻住了、根本不会再更新，不管等多久截图都长得一样。以后遇到类似"相机好像没动"的现象，除了等久一点重新截图，也要检查连续多张截图是不是**逐帧完全不变**（那大概率是真 bug，渲染循环没在跑），还是**在缓慢但持续地变化**（那大概率只是这个环境软件渲染慢）。
