export default function UniverseHint() {
  return (
    <div
      style={{
        position: "absolute",
        top: 112,
        left: 36,
        maxWidth: 260,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: -0.5,
          fontFamily: "'Montserrat',sans-serif",
          textShadow: "0 4px 18px rgba(0,0,0,0.85)",
        }}
      >
        宇宙 UNIVERSE
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 700,
          lineHeight: 1.6,
          textShadow: "0 2px 10px rgba(0,0,0,0.85)",
        }}
      >
        拖动自由漫游
        <br />
        点击任意星球开始探索
      </div>
    </div>
  );
}
