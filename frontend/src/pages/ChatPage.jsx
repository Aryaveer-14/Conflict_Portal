import AIChat from '../components/AIChat';

const ChatPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-full p-4 md:p-6 bg-base animate-in fade-in duration-500 overflow-hidden relative">
      <AIChat />
    </div>
  );
};

export default ChatPage;
