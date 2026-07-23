# Globe Footprint 足迹地球

一个以 3D 星球为核心的个人足迹记录网站。首页是一个可自由漫游的多星球宇宙，地球固定在中心、更大更亮，是主功能入口；点击地球进入足迹标记功能，点击任意地表位置为去过的地方添加照片和文字记录。

## 功能

- **宇宙概览**：多颗星球自由分布在 3D 空间中，相机可带阻尼惯性地自由环绕漫游，星球各自缓慢自转
- **点击聚焦**：点击任意星球，镜头缓动飞向它，其余星球缩小、推向背景并降低饱和度/不透明度，配合辉光（Bloom）与景深（DepthOfField）营造"虚焦配角"的氛围
- **地球 = 足迹功能**：聚焦地球后，点击地表任意位置，输入地点名称、文字记录并上传照片，即可生成一个足迹标记；侧边栏列出所有足迹，点击可让镜头飞向对应位置并查看详情
- 其余星球目前是功能占位（点击后显示"建设中"面板），后续可扩展为独立功能模块
- 点击空白处或返回按钮可退出聚焦，回到宇宙概览
- 数据保存在浏览器 `localStorage` 中（无需登录、无需后端），照片会在上传时自动压缩为合适尺寸

## 技术栈

- [Vite](https://vite.dev/) + React + TypeScript
- [three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)
- [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)（Bloom 辉光 + DepthOfField 景深）
- [GSAP](https://gsap.com/) 驱动相机聚焦/返回的缓动动画

> 性能提示：景深（DepthOfField）是相对较重的后处理效果，仅在聚焦某颗星球时才启用。如果在低性能设备上感觉卡顿，可以在 `src/components/Scene.tsx` 中移除 `<DepthOfField>`，只保留 `<Bloom>`。

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

## 素材来源

地球贴图 `public/textures/earth.jpg` 取自 [three-globe](https://github.com/vasturiano/three-globe) 项目自带的示例贴图（基于 NASA Blue Marble 影像）。
