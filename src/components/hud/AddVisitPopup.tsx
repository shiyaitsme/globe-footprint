import { useRef, useState } from "react";
import type { FormEvent } from "react";
import DrawerPanel from "./DrawerPanel";
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
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  resize: "vertical",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.6)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

export default function AddVisitPopup({ place, onCancel, onSave }: AddVisitPopupProps) {
  const [date, setDate] = useState(todayDateString());
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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
    <DrawerPanel
      title="新增到访"
      subtitle={`${place.country ? `${place.country} · ` : ""}${place.name}`}
      onClose={onCancel}
      onOpened={() => dateInputRef.current?.focus()}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={fieldLabelStyle}>
              到访日期
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <textarea
              placeholder="这次来的感受…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                border: "1px dashed rgba(255,255,255,0.3)",
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              点击上传照片
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
            </label>

            {photos.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 8,
                  overflowY: "auto",
                }}
              >
                {photos.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ font: "inherit", padding: "10px 20px", border: "1.5px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", cursor: "pointer" }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={busy}
            style={{
              font: "inherit",
              padding: "10px 20px",
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
    </DrawerPanel>
  );
}
