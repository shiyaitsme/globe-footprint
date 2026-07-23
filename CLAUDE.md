# CLAUDE.md

给后续在这个仓库里干活的 Claude Code 会话看的笔记。功能介绍、素材来源见 README.md，这里只写架构决定和容易踩的坑。

## 常用命令

```bash
npm install
npm run dev            # 本地开发服务器
npm run build           # tsc -b && vite build，提交前务必跑一遍确认无 TS 报错
```

没有测试框架，也没有 lint 脚本接入 CI；`.oxlintrc.json` 是 Vite 模板自带的，没启用类型感知规则。

## 现状：首页是 HUD 仪表盘，不是多星球宇宙

`App.tsx` 渲染的是从 Claude Design 项目照着做的 HUD 首页（`src/components/hud/` 下那一堆组件）。中间是一个可交互的 3D 地球（`Earth.tsx` + `hud/EarthCanvas.tsx`），拖动旋转、点击地表加足迹、点击标记看详情。

`Scene.tsx` / `CameraRig.tsx` / `Planet.tsx` / `Marker.tsx` 是**更早一版**的首页：地球 + 5 颗可点击聚焦的占位星球，GSAP 缓动镜头 + Bloom/DepthOfField 做"虚焦配角"效果。这套代码完整能跑，但**没有被 `App.tsx` 引用**，是产品决定暂时搁置、故意保留的，不是该删的死代码。如果任务是"把 JOURNEY 导航页做成能飞到另一颗星球"之类的，先看这几个文件能不能直接复用，不要重新发明一遍相机缓动逻辑。

`Earth.tsx` 被两边共用。区别只在于调用方传不传 `renderMarker` prop：
- HUD 首页（`hud/EarthCanvas.tsx`）传了 `renderMarker`，用的是 `hud/EarthMarker.tsx`（点阵脉冲圆点样式）。
- 多星球宇宙（`Scene.tsx`）不传，走 `Earth.tsx` 里默认的旧版 `Marker.tsx`（红色小球 + 文字标签）。

如果要改地球本身的行为（自转速度、点击判定、缩放/淡出动画），两边都会受影响，改之前确认一下是不是两边都想要。

## 地球自转 + 点击经纬度：旋转补偿

`Earth.tsx` 里地球会自转（`EARTH_CONFIG.rotationSpeed`），旋转量加在**外层 group**（`groupRef.current.rotation.y`）上，而不是内层 mesh —— 这样足迹标记（作为 group 的子节点）才会跟着贴图一起转，不会转着转着就和实际地理位置对不上。

点击地表算经纬度时（`handleClick` 里），必须先把 raycast 拿到的世界坐标点按当前 `groupRef.current.rotation.y` 反向旋转（`unrotateY`），再喂给 `vector3ToLatLng`，否则算出来的经纬度会随着自转累积的角度越转越偏。这两处（旋转挂在哪个节点上 + 点击时的反向旋转）必须配套修改，改一半会导致"标记显示位置正确，但新加的足迹点错位"这种不容易发现的 bug。

## 数据模型

`Footprint`（`src/types.ts`）在某次迭代里加了可选的 `country` 字段（给 HUD 首页的国家/城市统计用）。`useFootprints.ts` 的 `load()` 会给旧数据（localStorage 里没有 `country` 字段的）补一个空字符串默认值——加新的必填字段时记得同样处理旧数据兼容，不要假设 localStorage 里的数据一定符合最新的 `Footprint` 类型。

`utils/geoStats.ts` 的大洲归类（`classifyContinent`）是拍脑袋的经纬度矩形判断，不是真实的地理边界数据，只分"亚洲/欧洲/其他"三档，和设计稿的三档分布卡对应。以后如果要做更细的地区统计，这里需要换成真正的地理数据或反向地理编码。

## 测试环境的一个坑（跟代码无关，纯粹是这个沙盒环境的限制）

在这个 headless Chromium + Playwright 的沙盒里，WebGL 是 SwiftShader 软件渲染（没有真实 GPU），加上后处理（Bloom/DepthOfField）之后帧率会掉到个位数，甚至偶尔观察到相机动画的最终状态"飞错地方"。已经验证过这是纯粹的软件渲染性能问题，不是相机/动画逻辑的 bug（同样的操作序列，关掉后处理后连续多次测试，相机都精确停在预期位置）。如果以后调后处理相关的代码，测试时得留意：这个环境测出来的帧率/动画表现不代表真实设备，不要据此去砍功能。
