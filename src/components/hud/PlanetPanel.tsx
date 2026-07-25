import CornerBrackets from "./CornerBrackets";

interface PlanetPanelProps {
  name: string;
}

export default function PlanetPanel({ name }: PlanetPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 112,
        left: 36,
        width: 220,
        padding: "16px 10px",
        textAlign: "center",
      }}
    >
      <CornerBrackets />
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.1,
          letterSpacing: -0.3,
          fontFamily: "'Montserrat','Noto Sans SC',sans-serif",
          textShadow: "0 4px 18px rgba(0,0,0,0.85)",
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 700,
          lineHeight: 1.5,
          textShadow: "0 2px 10px rgba(0,0,0,0.85)",
        }}
      >
        这颗星球的功能正在建设中
        <br />
        敬请期待
      </div>
    </div>
  );
}
