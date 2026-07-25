import { useState } from "react";
import type { FormEvent } from "react";
import CornerBrackets from "./CornerBrackets";
import { fileToCompressedDataUrl } from "../../utils/image";
import { todayDateString } from "../../hooks/usePlaces";
import type { Place } from "../../types";

interface AddVisitPopupProps {
  place: Place;
  onCancel: () => void;
  onSave: (data: { date: string; notes: string; photos: string[] }) => void;
}

const inputStyle: React.CSSProperties = {
  font: "inherit",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  resize: "vertical",
};

export default function AddVisitPopup({ place, onCancel, onSave }: AddVisitPopupProps) {
  const [date, setDate] = useState(todayDateString());
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const dataUrls = await Promise.all(Array.from(files).map(fileToCompressedDataUrl));
      setPhotos((prev) => [...prev, ...dataUrls]);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave({ date, notes: notes.trim(), photos });
  };

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
      onClick={onCancel}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: 340,
          padding: 22,
          background: "rgba(8,8,10,0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <CornerBrackets size={16} />
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>新增到访</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: -8 }}>
          {place.country ? `${place.country} · ` : ""}
          {place.name}
        </div>

        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", gap: 6 }}>
          到访日期
          <input autoFocus type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
        </label>
        <textarea
          placeholder="这次来的感受…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={inputStyle}
        />
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          上传照片
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} style={{ display: "block", marginTop: 6 }} />
        </label>

        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 64, height: 64, objectFit: "cover" }} />
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ font: "inherit", padding: "8px 16px", border: "1.5px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", cursor: "pointer" }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={busy}
            style={{
              font: "inherit",
              padding: "8px 16px",
              border: "1.5px solid #fff",
              background: "#fff",
              color: "#0a0a0c",
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "处理中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
