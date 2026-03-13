import AIChat from '../components/AIChat';

const ChatPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-48px)] w-full bg-base overflow-hidden relative">
      <AIChat />
    </div>
  );
};

export default ChatPage;
