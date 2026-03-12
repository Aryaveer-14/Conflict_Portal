import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { agentAPI } from "../api/client";

// ═══════════════════════════════════════════════════════════════════════════════
// AIChat — Intelligence Agent with streaming, confidence & sources
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIDENCE_COLORS = {
  HIGH: "var(--success)",
  MEDIUM: "var(--warning)",
  LOW: "var(--danger)",
};

const SOURCE_LABELS = {
  conflict_events: "Conflict Events",
  commodity_prices: "Commodity Data",
  news_narratives: "News Narratives",
};

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function streamResponse(text, msgIndex) {
    let i = 0;
    setStreamingIdx(msgIndex);
    setDisplayedText("");

    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));

      if (i >= text.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStreamingIdx(null);
      }
    }, 10);
  }

  const sendMessage = useCallback(async () => {
    const q = input.trim();
    if (!q || chatLoading) return;

    // Stop any in-progress streaming
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStreamingIdx(null);
    }

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await agentAPI.query(q, {});
      const data = res.data?.data ?? {};
      const aiText = data.response ?? "No response received.";
      const confidence = data.confidence ?? null;
      const sources = data.sources ?? [];

      setMessages((prev) => {
        const newMessages = [
          ...prev,
          { role: "ai", text: aiText, confidence, sources },
        ];
        // Start streaming the latest AI message
        streamResponse(aiText, newMessages.length - 1);
        return newMessages;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "AI analysis temporarily unavailable. Please try again.",
          confidence: null,
          sources: [],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [input, chatLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card agent-panel">
      <div className="card-title">GCIP Intelligence Agent</div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty">
            Ask a question about any global conflict…
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === "ai" ? (
              <>
                <ReactMarkdown>
                  {streamingIdx === i ? displayedText : msg.text}
                </ReactMarkdown>

                {/* Confidence indicator — show after streaming completes or for older messages */}
                {streamingIdx !== i && msg.confidence && (
                  <div
                    className="confidence-badge"
                    style={{
                      borderColor: CONFIDENCE_COLORS[msg.confidence],
                      color: CONFIDENCE_COLORS[msg.confidence],
                    }}
                  >
                    Confidence: {msg.confidence}
                  </div>
                )}

                {/* Sources panel — show after streaming completes or for older messages */}
                {streamingIdx !== i && msg.sources && msg.sources.length > 0 && (
                  <div className="sources-panel">
                    <div className="sources-title">Sources:</div>
                    <ul className="sources-list">
                      {msg.sources.map((src, j) => (
                        <li key={j}>{SOURCE_LABELS[src] || src}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {chatLoading && (
          <div className="chat-msg ai">
            <span className="spinner" /> Analysing…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="e.g. How does the Sudan conflict affect oil supply?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={chatLoading}
        />
        <button
          className="chat-btn"
          onClick={sendMessage}
          disabled={chatLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
