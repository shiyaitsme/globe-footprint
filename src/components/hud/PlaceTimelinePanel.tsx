import { useState } from "react";
import type { FormEvent } from "react";
import CornerBrackets from "./CornerBrackets";
import Lightbox from "./Lightbox";
import ThumbCluster from "./ThumbCluster";
import AddPlacePopup from "./AddPlacePopup";
import type { PlacePopupData } from "./AddPlacePopup";
import { fileToCompressedDataUrl } from "../../utils/image";
import { groupVisitsByYear, formatVisitDayMonth } from "../../utils/timeline";
import type { Place, Visit } from "../../types";

interface PlaceTimelinePanelProps {
  place: Place;
  onClose: () => void;
  onAddComment: (visitId: string, data: { text: string; photos: string[] }) => void;
  onDeleteVisit: (visitId: string) => void;
  onEditVisit: (visitId: string, data: PlacePopupData) => void;
}

function CommentComposer({ onSubmit }: { onSubmit: (data: { text: string; photos: string[] }) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
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
    if (!text.trim() && photos.length === 0) return;
    onSubmit({ text: text.trim(), photos });
    setText("");
    setPhotos([]);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        + 添加回顾
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}
    >
      <textarea
        autoFocus
        placeholder="现在回头看，想补充点什么…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        style={{
          font: "inherit",
          fontSize: 12,
          padding: "6px 8px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.05)",
          color: "#fff",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
          + 照片
          <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        </label>
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 4 }}>
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 26, height: 26, objectFit: "cover" }} />
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText("");
            setPhotos([]);
          }}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}
        >
          取消
        </button>
        <button
          type="submit"
          disabled={busy}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff",
            fontSize: 11,
            padding: "3px 10px",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          发布
        </button>
      </div>
    </form>
  );
}

function VisitRow({
  visit,
  onOpenLightbox,
  onAddComment,
  onDeleteVisit,
  onEditVisit,
}: {
  visit: Visit;
  onOpenLightbox: (photos: string[], index: number) => void;
  onAddComment: (data: { text: string; photos: string[] }) => void;
  onDeleteVisit: () => void;
  onEditVisit: () => void;
}) {
  const { day, month } = formatVisitDayMonth(visit.date);

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ width: 46, flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>{day}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          {month}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <ThumbCluster photos={visit.photos} onOpen={(i) => onOpenLightbox(visit.photos, i)} />
          <div style={{ flex: 1, minWidth: 90 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
              {visit.notes || <span style={{ color: "rgba(255,255,255,0.35)" }}>还没有留下文字记录</span>}
            </div>
          </div>
        </div>

        {visit.comments.length > 0 && (
          <div
            style={{
              marginTop: 10,
              paddingLeft: 12,
              borderLeft: "2px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {visit.comments.map((comment) => (
              <div key={comment.id}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
                  回顾 · {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{comment.text}</div>
                {comment.photos.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <ThumbCluster photos={comment.photos} onOpen={(i) => onOpenLightbox(comment.photos, i)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CommentComposer onSubmit={onAddComment} />
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onEditVisit}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer" }}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={onDeleteVisit}
              style={{ background: "none", border: "none", color: "rgba(255,120,120,0.6)", fontSize: 11, cursor: "pointer" }}
            >
              删除这次到访
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaceTimelinePanel({ place, onClose, onAddComment, onDeleteVisit, onEditVisit }: PlaceTimelinePanelProps) {
  const yearGroups = groupVisitsByYear(place.visits);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
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
          width: 420,
          maxHeight: "80vh",
          padding: 22,
          background: "rgba(8,8,10,0.7)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          display: "flex",
          flexDirection: "column",
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

        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", paddingRight: 40 }}>{place.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 700, marginBottom: 14 }}>
          {place.country ? `${place.country} · ` : ""}
          共 {place.visits.length} 次到访
        </div>

        <div style={{ overflowY: "auto", paddingRight: 4 }}>
          {yearGroups.map(({ year, visits }) => {
            const expanded = expandedYears.has(year);
            return (
              <div key={year}>
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 0",
                    background: "none",
                    border: "none",
                    borderBottom: expanded ? "1px solid rgba(255,255,255,0.15)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{year}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                    {visits.length} 次
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{expanded ? "−" : "+"}</span>
                </button>

                {expanded && (
                  <div>
                    {visits.map((visit) => (
                      <VisitRow
                        key={visit.id}
                        visit={visit}
                        onOpenLightbox={(photos, index) => {
                          setLightboxPhotos(photos);
                          setLightboxIndex(index);
                        }}
                        onAddComment={(data) => onAddComment(visit.id, data)}
                        onDeleteVisit={() => onDeleteVisit(visit.id)}
                        onEditVisit={() => setEditingVisit(visit)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lightboxPhotos && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxPhotos(null)}
        />
      )}

      {editingVisit && (
        <AddPlacePopup
          mode="edit"
          initial={{
            name: place.name,
            country: place.country,
            date: editingVisit.date,
            notes: editingVisit.notes,
            photos: editingVisit.photos,
          }}
          onCancel={() => setEditingVisit(null)}
          onSave={(data) => {
            onEditVisit(editingVisit.id, data);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}
