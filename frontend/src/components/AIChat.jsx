import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles, Cpu, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { agentAPI } from '../api/client';

const CONFIDENCE_COLORS = {
  HIGH: "#3FB950", 
  MEDIUM: "#F4A261",
  LOW: "#FF4D4D",
};

const SOURCE_LABELS = {
  conflict_events: "Conflict Events",
  commodity_prices: "Commodity Data",
  news_narratives: "News Narratives",
};

const EXAMPLE_QUERIES = [
  "How could this conflict affect oil supply?",
  "Are shipping routes disrupted?",
  "Which sectors are at risk?",
  "What's the 30-day outlook?"
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'GCIP Intelligence Agent online. Monitoring geopolitical signals across 5 active conflict zones. How can I assist your analysis?', confidence: null, sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [feedbackByMsg, setFeedbackByMsg] = useState({});
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, displayedText]);

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

  const handleSend = async (queryText) => {
    const q = queryText.trim();
    if (!q || loading) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStreamingIdx(null);
    }
    
    setInput('');
    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await agentAPI.query(q, { detail_level: detailLevel });
      const data = res.data?.data ?? {};
      const aiText = data.response ?? "No response received.";
      const confidence = data.confidence ?? null;
      const sources = data.sources ?? [];
      const followUps = data.follow_ups ?? [];

      setMessages((prev) => {
        const newMessages = [
          ...prev,
          { role: 'ai', text: aiText, confidence, sources, followUps },
        ];
        streamResponse(aiText, newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠ AI analysis temporarily unavailable. System will retry automatically.",
          confidence: null,
          sources: [],
          followUps: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleFeedback = (msgIndex, value) => {
    setFeedbackByMsg((prev) => ({ ...prev, [msgIndex]: value }));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto overflow-hidden bg-base">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-sm border-b border-hover/40 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-blue/10 border border-accent-blue/20 rounded">
            <Cpu className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-primary">GCIP Intelligence Agent</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_6px_#3FB950]" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent-green">
                {loading ? 'PROCESSING QUERY...' : 'SYSTEM ONLINE'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-[10px] font-mono text-muted tracking-wider mr-1">
            RESPONSE MODE
          </div>
          <button
            type="button"
            onClick={() => setDetailLevel('short')}
            disabled={loading}
            className={`text-[10px] px-2.5 py-1.5 rounded border font-mono tracking-wider transition-all ${
              detailLevel === 'short'
                ? 'border-accent-blue text-accent-blue bg-accent-blue/10'
                : 'border-hover text-muted hover:text-accent-blue'
            }`}
          >
            SHORT
          </button>
          <button
            type="button"
            onClick={() => setDetailLevel('detailed')}
            disabled={loading}
            className={`text-[10px] px-2.5 py-1.5 rounded border font-mono tracking-wider transition-all ${
              detailLevel === 'detailed'
                ? 'border-accent-blue text-accent-blue bg-accent-blue/10'
                : 'border-hover text-muted hover:text-accent-blue'
            }`}
          >
            DETAILED
          </button>
          <div className="text-[9px] font-mono text-muted tracking-wider">MODEL: GEMINI</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isStreaming = streamingIdx === index;
          const textToShow = isStreaming ? displayedText : msg.text;
          const isUser = msg.role === 'user';

          return (
            <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border ${
                isUser 
                  ? 'bg-accent-blue border-accent-blue/30 text-white' 
                  : 'bg-surface border-hover text-accent-blue'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              {/* Message */}
              <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && (
                  <span className="text-[9px] font-mono text-muted tracking-wider mb-1 ml-1">
                    AI ANALYST
                  </span>
                )}
                <div className={`px-3 py-2.5 rounded text-[13px] leading-relaxed ${
                  isUser 
                    ? 'bg-accent-blue/15 text-primary border border-accent-blue/20' 
                    : 'bg-surface border border-hover text-primary/90'
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{textToShow}</ReactMarkdown>
                  </div>
                  
                  {!isStreaming && msg.confidence && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-hover/30">
                      <span 
                        className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-base border border-hover"
                        style={{ color: CONFIDENCE_COLORS[msg.confidence] || '#8B949E' }}
                      >
                        CONF: {msg.confidence}
                      </span>
                    </div>
                  )}
                  
                  {!isStreaming && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-hover/30">
                      <span className="text-[9px] font-mono text-muted tracking-wider">SOURCES: </span>
                      {msg.sources.map((src, j) => (
                        <span key={j} className="text-[9px] font-mono text-accent-blue ml-1">
                          [{SOURCE_LABELS[src] || src}]
                        </span>
                      ))}
                    </div>
                  )}

                  {!isStreaming && msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-hover/30">
                      <div className="text-[9px] font-mono text-muted tracking-wider mb-1">FOLLOW-UPS:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((followUp, j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => handleSend(followUp)}
                            disabled={loading}
                            className="text-[10px] font-mono tracking-wide px-2 py-1 bg-base border border-hover hover:border-accent-blue/40 text-muted hover:text-accent-blue rounded transition-all disabled:opacity-40"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUser && !isStreaming && (
                    <div className="mt-2 pt-2 border-t border-hover/30 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted tracking-wider">FEEDBACK:</span>
                      <button
                        type="button"
                        onClick={() => handleFeedback(index, 'up')}
                        className={`p-1 rounded border transition-all ${
                          feedbackByMsg[index] === 'up'
                            ? 'border-accent-green text-accent-green bg-accent-green/10'
                            : 'border-hover text-muted hover:text-accent-green'
                        }`}
                        aria-label="Helpful response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(index, 'down')}
                        className={`p-1 rounded border transition-all ${
                          feedbackByMsg[index] === 'down'
                            ? 'border-accent-red text-accent-red bg-accent-red/10'
                            : 'border-hover text-muted hover:text-accent-red'
                        }`}
                        aria-label="Not helpful response"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border bg-surface border-hover text-accent-blue">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-mono text-muted tracking-wider mb-1 ml-1">AI ANALYST</span>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-hover rounded text-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-blue" />
                <span className="text-[11px] font-mono tracking-wider">ANALYZING GEOPOLITICAL DATA...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 pb-4 pt-3 shrink-0 border-t border-hover/40 bg-surface/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono text-muted tracking-wider">RESPONSE MODE</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailLevel('short')}
                disabled={loading}
                className={`text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider transition-all ${
                  detailLevel === 'short'
                    ? 'border-accent-blue text-accent-blue bg-accent-blue/10'
                    : 'border-hover text-muted hover:text-accent-blue'
                }`}
              >
                SHORT
              </button>
              <button
                type="button"
                onClick={() => setDetailLevel('detailed')}
                disabled={loading}
                className={`text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider transition-all ${
                  detailLevel === 'detailed'
                    ? 'border-accent-blue text-accent-blue bg-accent-blue/10'
                    : 'border-hover text-muted hover:text-accent-blue'
                }`}
              >
                DETAILED
              </button>
            </div>
          </div>
          
          {/* Example queries */}
          <div className="flex items-center flex-wrap gap-1.5 mb-3">
            {EXAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSend(query)}
                disabled={loading}
                className="text-[10px] font-mono tracking-wide px-2.5 py-1 bg-base border border-hover hover:border-accent-blue/40 text-muted hover:text-accent-blue rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {query}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex items-end gap-2 w-full bg-base border border-hover rounded p-1.5 focus-within:border-accent-blue/40 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query the intelligence agent..."
              disabled={loading}
              className="flex-1 bg-transparent text-primary px-2 py-2 focus:outline-none min-h-[40px] max-h-[120px] resize-none text-sm font-sans placeholder:text-muted/50 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 p-2.5 bg-accent-blue text-white rounded hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AIChat;
