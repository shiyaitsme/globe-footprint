interface AddFabProps {
  onClick: () => void;
}

export default function AddFab({ onClick }: AddFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: 80,
        right: 36,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#fff",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "floaty 4s ease-in-out infinite",
      }}
    >
      <div style={{ position: "relative", width: 22, height: 22 }}>
        <div style={{ position: "absolute", top: 9, left: 0, width: 22, height: 4, background: "#0a0a0c" }} />
        <div style={{ position: "absolute", top: 0, left: 9, width: 4, height: 22, background: "#0a0a0c" }} />
      </div>
    </button>
  );
}
