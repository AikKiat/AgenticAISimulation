

function percent(n: number) {
  return Math.max(0, Math.min(100, n));
}

const barColors: Record<string, string> = {
  welfare: "#22c55e",
  foodInsecurity: "#f97316",
  healthCrisis: "#ef4444",
  conflict: "#e11d48",
  infraDecay: "#a855f7",
};



export default function StatBar({label, value, invert,}: {label: string; value: number; invert?: boolean;}) {
    const pct = invert ? 100 - percent(value) : percent(value);
    const color = barColors[label] ?? "#3b82f6";
    return (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12, marginBottom: 2, opacity: 0.8 }}>
            {label}: {value.toFixed(1)}
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "#1e293b",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: color,
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
        </div>
    );
}