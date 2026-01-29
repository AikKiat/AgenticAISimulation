import React, { useState } from "react";
import type { HistoryEntry, Country } from "../constants";

interface AgentThinkingCardProps {
  entry: HistoryEntry;
  index: number;
}

const aidTypeLabels: Record<string, string> = {
  food_aid: "🍞 Food Aid",
  medical_aid: "🏥 Medical Aid",
  peacekeeping: "🛡️ Peacekeeping",
  infrastructure_grant: "🏗️ Infrastructure",
};

const countryColors: Record<string, string> = {
  A: "#3b82f6",
  B: "#8b5cf6",
  C: "#ec4899",
};

export default function AgentThinkingCard({ entry, index }: AgentThinkingCardProps) {
  const [expanded, setExpanded] = useState(index < 3); // Auto-expand first 3

  const targetCountryId = entry.action.target_country_id;
  if(!targetCountryId) {
    console.log("Target Country Id is null");
    return;
  }

  const targetCountryData = entry.state.countries[targetCountryId]
  const prevCountryData = entry.prevState?.countries[targetCountryId]

  const welfareDelta = prevCountryData ? targetCountryData!.welfare - prevCountryData.welfare : 0;

  return (
    <li
      style={{
          padding: 12,
          borderRadius: 12,
          background: "linear-gradient(135deg, #0a0f1e 0%, #020617 100%)",
          border: "1px solid #1e293b",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              opacity: 0.9,
              color: "#94a3b8",
            }}
          >
            Day {entry.day}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: countryColors[entry.action.target_country_id],
              color: "white",
              fontWeight: 500,
            }}
          >
            {targetCountryData?.name}
          </span>
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          {aidTypeLabels[entry.action.aid_type] || entry.action.aid_type}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #1e293b",
          }}
        >
          {entry.rationale && (
            <div
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 8,
                background: "#0f172a",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.6,
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                🧠 Agent's Thinking
              </div>
              <br></br>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "#cbd5e1",
                  fontStyle: "italic",
                }}
              >
                "{entry.rationale}"
              </div>
              <br></br>
              <div
              style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "#cbd5e1",
                  fontStyle: "italic",
                }}>
                  "{entry.past_choices_analysis}"
              </div>
            </div>
          )}

          {/* Impact Analysis */}
          {prevCountryData && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: "#0a0f1e",
                  border: "1px solid #1e293b",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Welfare Change
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: welfareDelta >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {welfareDelta >= 0 ? "+" : ""}
                  {welfareDelta.toFixed(1)}
                </div>
              </div>

              <div
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: "#0a0f1e",
                  border: "1px solid #1e293b",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Current Welfare
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#60a5fa" }}>
                  {targetCountryData!.welfare.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          {/* Ailment Changes */}
          {prevCountryData && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Ailment Changes
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                  fontSize: 11,
                }}
              >
                {[
                  { key: "foodInsecurity", label: "Food" },
                  { key: "healthCrisis", label: "Health" },
                  { key: "conflict", label: "Conflict" },
                  { key: "infraDecay", label: "Infra" },
                ].map(({ key, label }) => {
                  const delta =
                    (targetCountryData as any)[key] - (prevCountryData as any)[key];
                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 6px",
                        background: "#020617",
                        borderRadius: 6,
                      }}
                    >
                      <span style={{ opacity: 0.7 }}>{label}</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: delta <= 0 ? "#22c55e" : "#f97316",
                        }}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Countries Status */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
            <div
              style={{
                fontSize: 10,
                opacity: 0.6,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              All Countries (After Action)
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {
              Object.keys(entry.state.countries).map((countryId : string) =>{
                let country : Country = entry.state.countries[countryId];
                return (
                  <div
                  key={country.id}
                  style={{
                    flex: 1,
                    padding: 6,
                    background:
                      country.id === entry.action.target_country_id
                        ? "#0f172a"
                        : "#020617",
                    borderRadius: 6,
                    border:
                      country.id === entry.action.target_country_id
                        ? `1px solid ${countryColors[country.id]}`
                        : "1px solid #111827",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    {country.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color:
                        country.welfare > 60
                          ? "#22c55e"
                          : country.welfare > 30
                          ? "#f97316"
                          : "#ef4444",
                    }}
                  >
                    {country.welfare.toFixed(0)}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
