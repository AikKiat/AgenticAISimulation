
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import type { Country, EnvState, HistoryEntry, HistoryResponse } from "./constants";
import CountryCard from "./components/CountryCard";
import AgentThinkingCard from "./components/AgentThinkingCard";

// Base URL of the simulator API. Adjust if you run it elsewhere.
const SIMULATOR_URL = "http://localhost:4000";

export default function App() {
  const [state, setState] = useState<EnvState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchState() {
    try {
      const [sRes, hRes] = await Promise.all([
        fetch(`${SIMULATOR_URL}/env/state`),
        fetch(`${SIMULATOR_URL}/env/history`),
      ]);


      const sJson: EnvState = await sRes.json();
      const hJson: HistoryResponse = await hRes.json();

      console.log(sJson);

      setState(sJson);
      setHistory(hJson.history ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to fetch state");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 1500);
    return () => clearInterval(id);
  }, []);

  async function handleReset() {
    try {
      const res = await fetch(`${SIMULATOR_URL}/env/reset`, { method: "POST" });
      if (!res.ok) throw new Error(`reset ${res.status}`);
      await fetchState();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to reset episode");
    }
  }

  const reversedHistory = useMemo(
    () => [...history].reverse(),
    [history]
  );

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <h1 className="header-title">3-Country Aid Simulator</h1>
          <p className="header-subtitle">
            Live view of the 3-country environment driven by your agent.
          </p>
        </div>
        <div className="header-right">
          <div className="simulator-url">Simulator: {SIMULATOR_URL}</div>
          <button className="reset-button" onClick={handleReset}>
            Reset Episode
          </button>
        </div>
      </header>

      {error && <div className="error-box">Error: {error}</div>}

      <main className="app-main">
        <section className="state-section">
          <div className="state-meta">
            <div className="state-day">
              {state ? `Day ${state.day} / 30` : "Loading..."}
            </div>

            {state && (
              <div className="episode-info">
                Episode: {state.episodeId}
                {state.done && state.reason && (
                  <span className="episode-reason"> • {state.reason}</span>
                )}
              </div>
            )}
          </div>

          <div className="countries-row">
            {state &&
              Object.keys(state.countries).map((countryId : string) =>{
                let country : Country = state.countries[countryId];
                return (<CountryCard key={countryId} country={country} />)
              })}
          </div>

          {state?.currentGift && (
            <div className="gift-row">
              <span className="gift-label">Today's gift:</span>
              <span className="gift-value">
                {state.currentGift.aid_type}
              </span>
            </div>
          )}
        </section>

        <aside className="agent-log-section">
          <div className="agent-log-header">
            <div className="agent-log-title">🤖 Agent Decision Log</div>
            <div className="agent-log-count">
              {history.length} decisions
            </div>
          </div>

          {loading && (
            <div className="agent-log-loading">Loading...</div>
          )}

          {!loading && history.length === 0 && (
            <div className="agent-log-empty">
              No actions recorded yet. Start your agent to see its
              decision-making process.
            </div>
          )}

          {!loading && history.length > 0 && (
            <ul className="agent-log-list">
              {reversedHistory.map((h) => (
                <AgentThinkingCard
                  index={h.day}
                  entry={h}
                />
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
