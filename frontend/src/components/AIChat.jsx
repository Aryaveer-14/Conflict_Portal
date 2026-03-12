import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';

const EXAMPLE_QUERIES = [
  "How could this conflict affect oil supply?",
  "Are shipping routes disrupted?",
  "Which sectors are at risk?",
  "What's the 30-day outlook?"
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome to the GCIP Intelligence Chat. How can I assist your analysis today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    if (!queryText.trim() || loading) return;
    
    setInput('');
    const userMsg = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await axios.post('/agent', { query: queryText });
      
      if (response.data && response.data.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: response.data.data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: "An error occurred while processing your request. Check your API payload logic." }]);
      }
    } catch (error) {
      // Mock Response Fallback for Hackathon Demo UI without a backend
      console.warn("Backend /agent call failed or not found, simulating response for demo purposes.");
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'ai', 
            content: `Simulation: Based on recent intelligence, your query regarding "${queryText}" flags high volatility indicators. Global commodities are currently sensitive to rapid geopolitical shifts. Recommend monitoring daily trade routes.` 
          }
        ]);
        setLoading(false);
      }, 1500);
      return;
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-hover bg-base z-0">
      
      {/* ⭐ Header Section */}
      <div className="bg-surface border-b border-hover p-4 px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-accent-blue/10 border border-accent-blue/20 shadow-inner rounded-xl">
            <Bot className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary">GCIP Intelligence Agent</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_#3FB950]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-green">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🗨️ Middle Section: Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-base">
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
        
        {loading && (
          <div className="flex gap-4 w-full animate-in fade-in duration-300">
             <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm bg-surface border-hover text-accent-blue">
               <Bot className="w-5 h-5" />
             </div>
             <div className="flex flex-col items-start justify-center min-h-[40px]">
               <div className="flex items-center gap-2 h-full text-muted px-4 py-2.5 bg-surface border border-hover rounded-2xl rounded-tl-sm shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />
                  <span className="text-sm font-medium">Agent is analyzing...</span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 📥 Container below messages layout padding wrapper */}
      <div className="p-4 md:px-8 pb-8 shrink-0 relative bg-gradient-to-t from-base to-transparent border-t border-hover/50 pt-6">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Example Query Chips */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {EXAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSend(query)}
                disabled={loading}
                className="text-xs font-semibold tracking-wide px-3 py-1.5 bg-surface border border-hover hover:border-accent-blue/50 text-muted hover:text-accent-blue hover:bg-accent-blue/5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm group"
              >
                <Sparkles className="w-3 h-3 group-hover:text-accent-blue transition-colors" />
                {query}
              </button>
            ))}
          </div>

          {/* Text Input Area */}
          <div className="flex items-end gap-3 w-full bg-surface border border-hover rounded-2xl p-2 shadow-xl focus-within:border-accent-blue/50 focus-within:ring-1 focus-within:ring-accent-blue/50 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the intelligence agent about active conflicts, systems or predictions..."
              disabled={loading}
              className="flex-1 bg-transparent text-primary px-3 py-2.5 focus:outline-none min-h-[44px] max-h-[150px] resize-none text-sm placeholder:text-muted/60 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 p-3 h-[44px] w-[44px] bg-accent-blue text-white rounded-xl hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20 flex items-center justify-center group"
            >
              <Send className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AIChat;
