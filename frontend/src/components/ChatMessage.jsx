import { User, Bot } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex gap-4 w-full animate-in fade-in duration-300 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
        isUser 
          ? 'bg-accent-blue border-transparent text-white shadow-[0_4px_15px_-5px_rgba(88,166,255,0.4)]' 
          : 'bg-surface border-hover text-accent-blue'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      {/* Message Bubble */}
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-sm md:text-base ${
          isUser 
            ? 'bg-accent-blue text-white rounded-tr-sm border border-transparent' 
            : 'bg-surface text-primary border border-hover rounded-tl-sm shadow-md'
        }`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
