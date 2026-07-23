import type { Footprint } from "../types";

interface SidebarProps {
  footprints: Footprint[];
  onSelect: (footprint: Footprint) => void;
  onBack: () => void;
}

export default function Sidebar({ footprints, onSelect, onBack }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button type="button" className="back-button" onClick={onBack}>
        ← 返回宇宙
      </button>
      <h1>我的足迹</h1>
      <p className="hint">拖动旋转地球，点击地表任意位置添加一个足迹</p>
      {footprints.length === 0 ? (
        <p className="empty">还没有记录，去地球上点一个地方吧</p>
      ) : (
        <ul className="place-list">
          {footprints.map((f) => (
            <li key={f.id} onClick={() => onSelect(f)}>
              <span className="place-name">{f.name}</span>
              {f.photos.length > 0 && <span className="photo-count">{f.photos.length} 张照片</span>}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
