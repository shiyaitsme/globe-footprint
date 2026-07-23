import { useMemo } from "react";
import CornerBrackets from "./CornerBrackets";
import { getHalftoneDots } from "../../utils/dotMatrix";
import type { DistributionStats } from "../../utils/geoStats";

interface DistributionCardProps {
  stats: DistributionStats;
}

export default function DistributionCard({ stats }: DistributionCardProps) {
  const dots = useMemo(() => getHalftoneDots(), []);

  const rows: [string, string, number][] = [
    ["亚洲 Asia", "asia", stats.asia],
    ["欧洲 Europe", "europe", stats.europe],
    ["其他 Other", "other", stats.other],
  ];

  return (
    <div style={{ position: "absolute", top: 112, right: 36, width: 206, padding: "16px 6px" }}>
      <CornerBrackets opacity={0.7} />
      <div
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: 0.2,
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: "'Montserrat',sans-serif",
          textShadow: "0 3px 14px rgba(0,0,0,0.85)",
        }}
      >
        足迹分布 Distribution
      </div>
      <div style={{ position: "relative", width: 150, height: 130, margin: "0 auto 12px" }}>
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 10,
            width: 118,
            height: 100,
            border: "1px solid rgba(255,255,255,0.3)",
            transform: "rotate(-4deg)",
          }}
        />
        <svg width={150} height={130} style={{ position: "absolute", inset: 0 }}>
          <line x1={10} y1={12} x2={140} y2={118} stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
          <line x1={140} y1={12} x2={10} y2={118} stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
          <line x1={75} y1={8} x2={75} y2={122} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        </svg>
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: d.y,
              left: d.x,
              width: d.s,
              height: d.s,
              borderRadius: "50%",
              background: "#c9d4ff",
              transform: "translate(-50%,-50%)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: -2,
            left: -4,
            fontSize: 8,
            fontWeight: 800,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 0.5,
            fontFamily: "'Montserrat',sans-serif",
          }}
        >
          1007
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            fontSize: 8,
            fontWeight: 800,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 0.5,
            fontFamily: "'Montserrat',sans-serif",
          }}
        >
          0637
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map(([label, key, value]) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 800,
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.85)",
            }}
          >
            <span>{label}</span>
            <span style={{ fontWeight: 900, color: "#fff" }}>{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
