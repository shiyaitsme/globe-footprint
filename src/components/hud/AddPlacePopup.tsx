import { useRef, useState } from "react";
import type { FormEvent } from "react";
import DrawerPanel from "./DrawerPanel";
import { fileToCompressedDataUrl } from "../../utils/image";
import { todayDateString } from "../../hooks/usePlaces";

export interface PlacePopupData {
  name: string;
  country: string;
  date: string;
  notes: string;
  photos: string[];
}

interface AddPlacePopupProps {
  /** "edit" 时表单标题/文案会切换成编辑语境，也不会显示"自动合并"的提示 */
  mode?: "add" | "edit";
  /** 编辑已有到访时传入当前值；不传则是全新的空表单 */
  initial?: PlacePopupData;
  onCancel: () => void;
  onSave: (data: PlacePopupData) => void;
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

export default function AddPlacePopup({ mode = "add", initial, onCancel, onSave }: AddPlacePopupProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [date, setDate] = useState(initial?.date ?? todayDateString());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [busy, setBusy] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), country: country.trim(), date, notes: notes.trim(), photos });
  };

  return (
    <DrawerPanel
      title={mode === "edit" ? "编辑足迹" : "添加足迹"}
      subtitle={mode === "edit" ? "修改这次到访的信息" : "名称和国家都和已有地点一致时，会自动合并为该地点的一次新到访"}
      onClose={onCancel}
      onOpened={() => nameInputRef.current?.focus()}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              ref={nameInputRef}
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
            <label style={fieldLabelStyle}>
              到访日期
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
            </label>
            <textarea
              placeholder="写点什么…"
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
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="删除照片"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        border: "none",
                        background: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        fontSize: 12,
                        lineHeight: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
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
            disabled={busy || !name.trim()}
            style={{
              font: "inherit",
              padding: "10px 20px",
              border: "1.5px solid #fff",
              background: "#fff",
              color: "#0a0a0c",
              fontWeight: 700,
              cursor: busy || !name.trim() ? "not-allowed" : "pointer",
              opacity: busy || !name.trim() ? 0.6 : 1,
            }}
          >
            {busy ? "处理中…" : mode === "edit" ? "保存修改" : "保存"}
          </button>
        </div>
      </form>
    </DrawerPanel>
  );
}
