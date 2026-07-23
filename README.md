# Globe Footprint 足迹地球

一个以 3D 地球为核心的个人足迹记录网站：拖动旋转地球，点击任意地表位置，为去过的地方添加照片和文字记录。

## 功能

- 可拖动旋转、滚轮缩放的 3D 地球（Three.js + react-three-fiber）
- 点击地表任意位置，输入地点名称、文字记录并上传照片，即可生成一个足迹标记
- 侧边栏列出所有足迹，点击可让镜头飞向对应位置并查看详情
- 点击已有标记查看/编辑文字记录、增删照片
- 数据保存在浏览器 `localStorage` 中（无需登录、无需后端），照片会在上传时自动压缩为合适尺寸

## 技术栈

- [Vite](https://vite.dev/) + React + TypeScript
- [three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)

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
