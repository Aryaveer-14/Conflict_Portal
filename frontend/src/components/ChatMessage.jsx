import { User, Bot } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border ${
        isUser 
          ? 'bg-accent-blue border-accent-blue/30 text-white' 
          : 'bg-surface border-hover text-accent-blue'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      {/* Message Bubble */}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2.5 rounded text-[13px] leading-relaxed ${
          isUser 
            ? 'bg-accent-blue/15 text-primary border border-accent-blue/20' 
            : 'bg-surface text-primary/90 border border-hover'
        }`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
