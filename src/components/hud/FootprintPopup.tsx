import { useState } from "react";
import CornerBrackets from "./CornerBrackets";
import { fileToCompressedDataUrl } from "../../utils/image";
import type { Footprint } from "../../types";

interface FootprintPopupProps {
  footprint: Footprint;
  onClose: () => void;
  onUpdate: (patch: Partial<Footprint>) => void;
  onDelete: () => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function FootprintPopup({ footprint, onClose, onUpdate, onDelete }: FootprintPopupProps) {
  const [busy, setBusy] = useState(false);

  const handleAddPhoto = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const dataUrls = await Promise.all(Array.from(files).map(fileToCompressedDataUrl));
      onUpdate({ photos: [...footprint.photos, ...dataUrls] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: 340,
          padding: 22,
          background: "rgba(8,8,10,0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
        }}
      >
        <CornerBrackets size={16} />
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 12, height: 12 }}>
            <div style={{ position: "absolute", top: 5, left: 0, width: 12, height: 1.5, background: "#fff", transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", top: 5, left: 0, width: 12, height: 1.5, background: "#fff", transform: "rotate(-45deg)" }} />
          </div>
        </button>

        {footprint.photos[0] ? (
          <img
            src={footprint.photos[0]}
            alt=""
            style={{ width: "100%", height: 170, marginBottom: 16, objectFit: "cover" }}
          />
        ) : (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 170,
              marginBottom: 16,
              border: "1px dashed rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {busy ? "处理中…" : "点击上传照片"}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleAddPhoto(e.target.files)} />
          </label>
        )}

        {footprint.photos.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {footprint.photos.slice(1).map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 44, height: 44, objectFit: "cover" }} />
            ))}
          </div>
        )}

        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Montserrat',sans-serif" }}>
          {footprint.name}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 10 }}>
          {footprint.country ? `${footprint.country} · ` : ""}
          {formatDate(footprint.createdAt)}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, marginBottom: 16 }}>
          {footprint.notes || "还没有留下文字记录"}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
            + 添加照片
            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleAddPhoto(e.target.files)} />
          </label>
          <button
            type="button"
            onClick={onDelete}
            style={{ background: "none", border: "none", color: "rgba(255,120,120,0.8)", fontSize: 12, cursor: "pointer" }}
          >
            删除足迹
          </button>
        </div>
      </div>
    </div>
  );
}
