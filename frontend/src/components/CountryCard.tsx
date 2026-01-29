

import type { Country } from "../constants";
import StatBar from "./StatBar";

export default function CountryCard({ country }: { country: Country }) {
  return (
    <div
      style={{
        background: "#020617",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
        border: "1px solid #1e293b",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Country {country.id}</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{country.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Welfare</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {country.welfare.toFixed(1)} / 100
          </div>
        </div>
      </div>

      <StatBar label="welfare" value={country.welfare} />
      <div style={{ height: 8 }} />

      <StatBar label="foodInsecurity" value={country.foodInsecurity} />
      <StatBar label="healthCrisis" value={country.healthCrisis} />
      <StatBar label="conflict" value={country.conflict} />
      <StatBar label="infraDecay" value={country.infraDecay} />
    </div>
  );
}
