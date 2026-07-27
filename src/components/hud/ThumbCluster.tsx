interface ThumbClusterProps {
  photos: string[];
  onOpen: (index: number) => void;
}

/** 缩略图簇——参考朋友圈九宫格但张数不固定，超过 9 张最后一格叠加 "+N" */
export default function ThumbCluster({ photos, onOpen }: ThumbClusterProps) {
  if (photos.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 168 }}>
      {photos.slice(0, 9).map((src, i) => (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(i);
          }}
          style={{ position: "relative", width: 50, height: 50, cursor: "pointer", overflow: "hidden" }}
        >
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {i === 8 && photos.length > 9 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +{photos.length - 9}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
