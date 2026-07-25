interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        top: 60,
        left: 36,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 999,
        border: "1.5px solid rgba(255,255,255,0.35)",
        background: "rgba(3,3,5,0.35)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer",
        fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>←</span>
      返回宇宙
    </button>
  );
}
