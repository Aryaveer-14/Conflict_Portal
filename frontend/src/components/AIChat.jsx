import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ReactMarkdown from 'react-markdown';
import { agentAPI } from '../api/client';

const CONFIDENCE_COLORS = {
  HIGH: "#34d399", 
  MEDIUM: "#fbbf24",
  LOW: "#f87171",
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
    { role: 'ai', text: 'Welcome to the GCIP Intelligence Chat. How can I assist your analysis today?', confidence: null, sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
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

  const simulateTyping = useCallback((text, messageIndex) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let currentIndex = 0;
    setDisplayedText("");
    setStreamingIdx(messageIndex);
    
    const typeChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(intervalRef.current);
        setStreamingIdx(null);
      }
    };
    
    intervalRef.current = setInterval(typeChar, 20);
  }, []);

  const handleSubmit = useCallback(async (e, queryText = null) => {
    e?.preventDefault();
    const query = queryText || input.trim();
    
    if (!query) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await agentAPI.query(query, {
        previous_queries: messages
          .filter(m => m.role === 'user')
          .map(m => m.text)
          .slice(-3)
      });

      const aiText = response?.data?.data?.response || 'Unable to generate response';
      const confidence = response?.data?.data?.confidence || null;
      const sources = response?.data?.data?.sources || [];

      const aiMessage = {
        role: 'ai',
        text: aiText,
        confidence,
        sources
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Start typing simulation for the latest message
      setTimeout(() => {
        const messageIndex = messages.length + 1; // +1 because we just added user message
        simulateTyping(aiText, messageIndex);
      }, 300);

    } catch (error) {
      console.error('Agent query error:', error);
      const errorMessage = {
        role: 'ai',
        text: `I apologize, but I'm having trouble processing your request right now. This could be due to server connectivity or an internal error. Please try again in a moment.`,
        confidence: 'LOW',
        sources: [],
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, simulateTyping]);

  const handleExampleClick = (query) => {
    handleSubmit(null, query);
  };

  const isStreaming = streamingIdx !== null;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden border border-accent-green/20 bg-base">
      {/* Header */}
      <div className="bg-surface border-b border-accent-green/20 p-4 flex items-center gap-3">
        <div className="p-1.5 bg-accent-green/10 rounded-lg">
          <Bot className="w-5 h-5 text-accent-green" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary">GCIP Intelligence Agent</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-muted">AI Assistant Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base">
        {messages.map((msg, index) => {
          const isStreamingThis = streamingIdx === index;
          const textToShow = isStreamingThis ? displayedText : msg.text;

          const content = (
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none text-accent-green prose-p:text-accent-green prose-headings:text-accent-green prose-strong:text-accent-green prose-a:text-accent-green prose-ul:text-accent-green prose-li:text-accent-green">
                <ReactMarkdown>{textToShow}</ReactMarkdown>
              </div>
              
              {!isStreamingThis && msg.confidence && (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-semibold uppercase px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: `${CONFIDENCE_COLORS[msg.confidence]}20`,
                      color: CONFIDENCE_COLORS[msg.confidence]
                    }}
                  >
                    {msg.confidence} Confidence
                  </span>
                </div>
              )}
              
              {!isStreamingThis && msg.sources && msg.sources.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted mb-1">Sources:</div>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-surface border-hover text-primary rounded-full">
                        {SOURCE_LABELS[src] || src.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

          return <ChatMessage key={index} role={msg.role} content={content} />;
        })}
        
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface border-hover">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-muted bg-surface px-3 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-accent-green/20 bg-surface">
        <div className="space-y-3">
          
          {/* Example Queries */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(query)}
                disabled={loading}
                className="text-xs px-2 py-1 bg-base border border-accent-green/20 text-primary hover:text-accent-green hover:border-accent-green/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="inline w-3 h-3 mr-1" />
                {query}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about global conflicts and their impacts..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-accent-green/30 rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent-green disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-accent-green text-black text-white rounded-lg hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default AIChat;