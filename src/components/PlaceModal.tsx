import { useState } from "react";
import { fileToCompressedDataUrl } from "../utils/image";
import type { Footprint } from "../types";

interface PlaceModalProps {
  footprint: Footprint;
  onClose: () => void;
  onUpdate: (patch: Partial<Footprint>) => void;
  onDelete: () => void;
}

export default function PlaceModal({ footprint, onClose, onUpdate, onDelete }: PlaceModalProps) {
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const dataUrls = await Promise.all(Array.from(files).map(fileToCompressedDataUrl));
      onUpdate({ photos: [...footprint.photos, ...dataUrls] });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (index: number) => {
    onUpdate({ photos: footprint.photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{footprint.name}</h2>
        <p className="coords">
          纬度 {footprint.lat.toFixed(2)}° · 经度 {footprint.lng.toFixed(2)}°
        </p>

        <label>
          文字记录
          <textarea
            value={footprint.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={4}
          />
        </label>

        <label>
          添加照片
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
        </label>

        {footprint.photos.length > 0 && (
          <div className="photo-grid">
            {footprint.photos.map((src, i) => (
              <div className="photo-item" key={i}>
                <img src={src} alt="" />
                <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="danger" onClick={onDelete}>
            删除足迹
          </button>
          <button type="button" onClick={onClose} disabled={busy}>
            {busy ? "处理中…" : "关闭"}
          </button>
        </div>
      </div>
    </div>
  );
}
