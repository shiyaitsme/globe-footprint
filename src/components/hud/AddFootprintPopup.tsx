import { useState } from "react";
import type { FormEvent } from "react";
import CornerBrackets from "./CornerBrackets";
import { fileToCompressedDataUrl } from "../../utils/image";

interface AddFootprintPopupProps {
  lat: number;
  lng: number;
  onCancel: () => void;
  onSave: (data: { name: string; country: string; notes: string; photos: string[] }) => void;
}

const inputStyle: React.CSSProperties = {
  font: "inherit",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  resize: "vertical",
};

export default function AddFootprintPopup({ lat, lng, onCancel, onSave }: AddFootprintPopupProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
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
    if (!name.trim()) return;
    onSave({ name: name.trim(), country: country.trim(), notes: notes.trim(), photos });
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
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>添加足迹</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: -8 }}>
          纬度 {lat.toFixed(2)}° · 经度 {lng.toFixed(2)}°
        </div>

        <input
          autoFocus
          placeholder="地点名称，例如：巴黎"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          placeholder="国家（选填）"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="写点什么…"
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
            disabled={busy || !name.trim()}
            style={{
              font: "inherit",
              padding: "8px 16px",
              border: "1.5px solid #fff",
              background: "#fff",
              color: "#0a0a0c",
              fontWeight: 700,
              cursor: busy || !name.trim() ? "not-allowed" : "pointer",
              opacity: busy || !name.trim() ? 0.6 : 1,
            }}
          >
            {busy ? "处理中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
