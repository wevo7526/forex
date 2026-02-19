"use client";

import { MAJOR_PAIRS, CROSS_PAIRS, EM_PAIRS, pairToString } from "@/types/forex";

interface PairSelectorProps {
  value: string;
  onChange: (pair: string) => void;
  style?: React.CSSProperties;
}

export function PairSelector({ value, onChange, style }: PairSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        fontSize: 13,
        fontFamily: "var(--font-geist-sans)",
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
    >
      <optgroup label="Major Pairs">
        {MAJOR_PAIRS.map((p) => {
          const s = pairToString(p);
          return <option key={s} value={s}>{s}</option>;
        })}
      </optgroup>
      <optgroup label="Cross Pairs">
        {CROSS_PAIRS.map((p) => {
          const s = pairToString(p);
          return <option key={s} value={s}>{s}</option>;
        })}
      </optgroup>
      <optgroup label="Emerging Markets">
        {EM_PAIRS.map((p) => {
          const s = pairToString(p);
          return <option key={s} value={s}>{s}</option>;
        })}
      </optgroup>
    </select>
  );
}
