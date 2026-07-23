import DotWord from "./DotWord";

interface NavBarProps {
  variant: "top" | "bottom";
}

function NavPills() {
  return (
    <>
      <a
        href="#"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "6px 14px",
          borderRadius: 999,
          border: "1.5px solid #fff",
        }}
      >
        <DotWord word="HOME" />
      </a>
      <a
        href="#"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "6px 14px",
          borderRadius: 999,
          border: "1.5px solid rgba(255,255,255,0.35)",
        }}
      >
        <DotWord word="JOURNEY" color="rgba(255,255,255,0.85)" />
      </a>
      <DotWord word="PROFILE" color="rgba(255,255,255,0.6)" />
      <DotWord word="SETTINGS" color="rgba(255,255,255,0.6)" />
    </>
  );
}

export default function NavBar({ variant }: NavBarProps) {
  const isTop = variant === "top";
  const gradient = isTop
    ? "linear-gradient(to bottom, rgba(3,3,5,0.7) 0%, rgba(3,3,5,0.4) 65%, rgba(3,3,5,0) 100%)"
    : "linear-gradient(to top, rgba(3,3,5,0.7) 0%, rgba(3,3,5,0.4) 65%, rgba(3,3,5,0) 100%)";

  return (
    <div
      style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: 0,
        left: 0,
        right: 0,
        height: 42,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: isTop ? "space-between" : "center",
        gap: isTop ? undefined : 16,
        padding: isTop ? "0 40px" : undefined,
        background: gradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {isTop ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", border: "1.5px solid #fff" }} />
            <DotWord word="WANDERER" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NavPills />
          </div>
        </>
      ) : (
        <NavPills />
      )}
    </div>
  );
}
