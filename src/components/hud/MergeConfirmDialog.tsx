import CornerBrackets from "./CornerBrackets";
import type { Place } from "../../types";

interface MergeConfirmDialogProps {
  place: Place;
  onMerge: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export default function MergeConfirmDialog({ place, onMerge, onCreateNew, onCancel }: MergeConfirmDialogProps) {
  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: 320,
          padding: 22,
          background: "rgba(8,8,10,0.65)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <CornerBrackets size={16} />
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>
          发现附近已有地点「{place.name}」
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
          这次记录是「{place.name}」的新到访吗？也可以作为一个全新的地点单独记录。
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={onMerge}
            style={{
              font: "inherit",
              padding: "10px 16px",
              border: "1.5px solid #fff",
              background: "#fff",
              color: "#0a0a0c",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            添加为「{place.name}」的新到访
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            style={{
              font: "inherit",
              padding: "10px 16px",
              border: "1.5px solid rgba(255,255,255,0.35)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            作为新地点单独记录
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              font: "inherit",
              padding: "6px 16px",
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
