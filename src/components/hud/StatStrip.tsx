interface StatStripProps {
  countries: number;
  cities: number;
  footprints: number;
}

export default function StatStrip({ countries, cities, footprints }: StatStripProps) {
  const items: [number, string][] = [
    [countries, "国家 Countries"],
    [cities, "城市 Cities"],
    [footprints, "足迹 Footprints"],
  ];

  return (
    <div style={{ position: "absolute", bottom: 112, left: 36, display: "flex", gap: 28 }}>
      {items.map(([value, label]) => (
        <div key={label} style={{ paddingLeft: 12, borderLeft: "1.5px solid rgba(255,255,255,0.55)" }}>
          <div
            style={{
              color: "#fff",
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1,
              fontFamily: "'Montserrat',sans-serif",
              textShadow: "0 4px 18px rgba(0,0,0,0.85)",
            }}
          >
            {value}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              textShadow: "0 2px 10px rgba(0,0,0,0.85)",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
