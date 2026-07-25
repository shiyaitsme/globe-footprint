interface LightboxProps {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function Lightbox({ photos, index, onIndexChange, onClose }: LightboxProps) {
  const hasMultiple = photos.length > 1;

  const step = (delta: number) => {
    onIndexChange((index + delta + photos.length) % photos.length);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
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
        <div style={{ position: "relative", width: 14, height: 14 }}>
          <div style={{ position: "absolute", top: 6, left: 0, width: 14, height: 1.5, background: "#fff", transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", top: 6, left: 0, width: 14, height: 1.5, background: "#fff", transform: "rotate(-45deg)" }} />
        </div>
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          style={navButtonStyle("left")}
        >
          ‹
        </button>
      )}

      <img
        src={photos[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "86%", maxHeight: "80%", objectFit: "contain", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
      />

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          style={navButtonStyle("right")}
        >
          ›
        </button>
      )}

      {hasMultiple && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Montserrat',sans-serif",
          }}
        >
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

function navButtonStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 20,
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(255,255,255,0.35)",
    color: "#fff",
    fontSize: 26,
    lineHeight: "40px",
    cursor: "pointer",
  } as React.CSSProperties;
}
