import { useState } from "react";
import type { FormEvent } from "react";
import { fileToCompressedDataUrl } from "../utils/image";

interface AddPlaceModalProps {
  lat: number;
  lng: number;
  onCancel: () => void;
  onSave: (data: { name: string; notes: string; photos: string[] }) => void;
}

export default function AddPlaceModal({ lat, lng, onCancel, onSave }: AddPlaceModalProps) {
  const [name, setName] = useState("");
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
    onSave({ name: name.trim(), notes: notes.trim(), photos });
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>添加足迹</h2>
        <p className="coords">纬度 {lat.toFixed(2)}° · 经度 {lng.toFixed(2)}°</p>

        <label>
          地点名称
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：巴黎"
            required
          />
        </label>

        <label>
          文字记录
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="写点什么…"
            rows={4}
          />
        </label>

        <label>
          上传照片
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
        </label>

        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            取消
          </button>
          <button type="submit" disabled={busy || !name.trim()}>
            {busy ? "处理中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
