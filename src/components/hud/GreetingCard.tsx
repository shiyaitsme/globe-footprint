import CornerBrackets from "./CornerBrackets";

interface GreetingCardProps {
  countries: number;
  cities: number;
}

export default function GreetingCard({ countries, cities }: GreetingCardProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 112,
        left: 36,
        width: 220,
        height: 150,
        padding: "16px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <CornerBrackets />
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: "#fff",
          lineHeight: 0.98,
          letterSpacing: -0.5,
          fontFamily: "'Montserrat',sans-serif",
          textShadow: "0 4px 18px rgba(0,0,0,0.85)",
        }}
      >
        Hi, Wanderer
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.1,
          marginBottom: 12,
          textShadow: "0 4px 18px rgba(0,0,0,0.85)",
        }}
      >
        欢迎回来
      </div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 700,
          lineHeight: 1.5,
          textShadow: "0 2px 10px rgba(0,0,0,0.85)",
        }}
      >
        你的足迹已遍布
        <br />
        {countries} 个国家 · {cities} 座城市
      </div>
    </div>
  );
}
