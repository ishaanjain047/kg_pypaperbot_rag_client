import React from "react";
import { Navbar } from "./Navbar";
import { useSidebar } from "../../context/SidebarContext";

export const Layout = ({ children }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen w-full">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="w-full">{children}</main>
    </div>
  );
};
