import React from "react";
import { Clock, Search } from "lucide-react";

export const SearchSidebar = ({ chats, setCurrentChat, setIsSidebarOpen }) => {
  if (chats.length === 0) {
    return (
      <div className="text-center py-10">
        <Search size={48} className="mx-auto text-gray-500 opacity-20 mb-4" />
        <p className="text-gray-400">No recent analyses</p>
        <p className="text-gray-500 text-sm mt-2">
          Your search history will appear here
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="space-y-2">
        {chats.map((chat, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentChat(chat);
              if (setIsSidebarOpen) setIsSidebarOpen(false);
            }}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors flex flex-col"
          >
            <div className="flex items-start">
              <Clock size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate">{chat.query}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(chat.timestamp)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {chat.results && chat.results.length > 0 && chat.results.slice(0, 2).map((result, idx) => (
                    <span 
                      key={idx} 
                      className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full truncate max-w-full"
                    >
                      {result.drug || "Result " + (idx + 1)}
                    </span>
                  ))}
                  {chat.results && chat.results.length > 2 && (
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      +{chat.results.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchSidebar;