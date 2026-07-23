interface CornerBracketsProps {
  size?: number;
  opacity?: number;
  thickness?: number;
}

export default function CornerBrackets({ size = 14, opacity = 0.75, thickness = 1.5 }: CornerBracketsProps) {
  const color = `rgba(255,255,255,${opacity})`;
  const base: React.CSSProperties = { position: "absolute", width: size, height: size };
  return (
    <>
      <span style={{ ...base, top: 0, left: 0, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ ...base, top: 0, right: 0, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
      <span style={{ ...base, bottom: 0, left: 0, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ ...base, bottom: 0, right: 0, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
    </>
  );
}
