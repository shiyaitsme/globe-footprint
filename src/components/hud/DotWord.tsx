import { useMemo } from "react";
import { getDotWord } from "../../utils/dotMatrix";

interface DotWordProps {
  word: string;
  color?: string;
}

export default function DotWord({ word, color = "#fff" }: DotWordProps) {
  const { dots, width, height } = useMemo(() => getDotWord(word), [word]);

  return (
    <span style={{ position: "relative", display: "inline-block", width, height }}>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: d.y,
            left: d.x,
            width: d.s,
            height: d.s,
            background: color,
          }}
        />
      ))}
    </span>
  );
}
