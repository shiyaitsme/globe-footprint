import type { ReactNode } from "react";
import CornerBrackets from "./CornerBrackets";

interface DrawerPanelProps {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** 核心的"添加/编辑"表单用这个全屏侧滑抽屉，而不是居中小弹窗——给照片墙、长文字留够空间 */
export default function DrawerPanel({ title, subtitle, onClose, children }: DrawerPanelProps) {
  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", zIndex: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="drawer-panel"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(720px, 94vw)",
          padding: "36px 44px",
          background: "rgba(8,8,10,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "-40px 0 80px rgba(0,0,0,0.55)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <CornerBrackets size={22} />
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 30,
            right: 36,
            width: 34,
            height: 34,
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 13, height: 13 }}>
            <div style={{ position: "absolute", top: 5.5, left: 0, width: 13, height: 1.5, background: "#fff", transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", top: 5.5, left: 0, width: 13, height: 1.5, background: "#fff", transform: "rotate(-45deg)" }} />
          </div>
        </button>

        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", paddingRight: 50 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 700, marginTop: 6, marginBottom: 8 }}>
            {subtitle}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 24 }}>{children}</div>
      </div>
    </div>
  );
}
