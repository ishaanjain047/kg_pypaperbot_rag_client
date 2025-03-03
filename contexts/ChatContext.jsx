import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  const addChat = (chat) => {
    setChats((prevChats) => [chat, ...prevChats].slice(0, 10));
    setCurrentChat(chat);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        setCurrentChat,
        addChat,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
