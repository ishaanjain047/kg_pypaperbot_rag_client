import { Home, Search, X, MessageSquare } from "lucide-react";
import { useChat } from "../../../contexts/ChatContext";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chats, setCurrentChat, setCurrentPage } = useChat();

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden z-50`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chat History</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              setCurrentPage("home");
              setIsOpen(false);
            }}
            className="w-full text-left py-2 px-4 rounded hover:bg-gray-800 flex items-center gap-2"
          >
            <Home size={18} /> Home
          </button>

          <button
            onClick={() => {
              setCurrentPage("search");
              setIsOpen(false);
            }}
            className="w-full text-left py-2 px-4 rounded hover:bg-gray-800 flex items-center gap-2"
          >
            <Search size={18} /> Find Drugs
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-sm text-gray-400 uppercase">Recent Searches</h3>
          {chats.map((chat, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentChat(chat);
                setCurrentPage("search");
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-800 flex items-center gap-2 text-sm truncate"
            >
              <MessageSquare size={16} />
              {chat.query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
