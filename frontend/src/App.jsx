import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { eventsAPI, narrativesAPI } from "./api/client";
import AIChat from "./components/AIChat";

// ═══════════════════════════════════════════════════════════════════════════════
// App — GCIP Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  // ── State ────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [narratives, setNarratives] = useState([]);
  const [narLoading, setNarLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  // ── Fetch events on mount ────────────────────────────────────────────────
  useEffect(() => {
    eventsAPI
      .getAll()
      .then((res) => setEvents(res.data?.data?.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  // ── Fetch narratives when an event is selected ───────────────────────────
  useEffect(() => {
    if (!selectedEvent) {
      setNarratives([]);
      return;
    }
    setNarLoading(true);
    narrativesAPI
      .getNarratives(selectedEvent.id)
      .then((res) => setNarratives(res.data?.data?.narratives ?? []))
      .catch(() => setNarratives([]))
      .finally(() => setNarLoading(false));
  }, [selectedEvent]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>
          <span>GCIP</span> — Global Conflict Intelligence
        </h1>
        <div className="header-status">
          <span className={`status-dot ${eventsLoading ? "error" : ""}`} />
          {eventsLoading ? "Connecting…" : `${events.length} events tracked`}
        </div>
      </header>

      {/* Main grid */}
      <main className="main">
        {/* Left: Events list */}
        <div className="card events-panel">
          <div className="card-title">Conflict Events</div>
          {eventsLoading ? (
            <div className="loading">
              <span className="spinner" /> Loading events…
            </div>
          ) : events.length === 0 ? (
            <div className="empty">No events available</div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className={`event-item ${selectedEvent?.id === evt.id ? "selected" : ""}`}
                onClick={() => setSelectedEvent(evt)}
              >
                <div className="event-title">{evt.title}</div>
                <div className="event-meta">
                  <span>{evt.country}</span>
                  <span>{evt.region}</span>
                  <span className={`severity-badge ${evt.severity}`}>{evt.severity}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top-right: Narratives for selected event */}
        <div className="card">
          <div className="card-title">
            Narratives {selectedEvent ? `— ${selectedEvent.title}` : ""}
          </div>
          {!selectedEvent ? (
            <div className="empty">Select an event to view narratives</div>
          ) : narLoading ? (
            <div className="loading">
              <span className="spinner" /> Extracting narratives…
            </div>
          ) : narratives.length === 0 ? (
            <div className="empty">No narratives extracted</div>
          ) : (
            narratives.map((n, i) => (
              <div key={i} className="narrative-item">
                <div className="narrative-label">{n.label}</div>
                <div className="narrative-desc">{n.description}</div>
                <div className="narrative-bar-bg">
                  <div className="narrative-bar" style={{ width: `${n.prevalence_score}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom-right: AI Agent Chat */}
        <AIChat />
      </main>
    </div>
  );
}
