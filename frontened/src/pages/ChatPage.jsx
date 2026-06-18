// // Note: This code assumes you have a backend API set up to handle user and message requests.



import { useChatStore } from "../store/useChatStore";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const ChatPage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className="flex flex-1 h-full">
      {selectedUser ? <ChatContainer /> : <NoChatSelected />}
    </div>
  );
};

export default ChatPage;
