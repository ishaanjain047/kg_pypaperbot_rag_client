import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Menu } from "lucide-react";

export const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-4 relative z-[110]">
          {" "}
          {/* Increased z-index and added relative */}
          {location.pathname === "/search" && (
            <button
              onClick={() => toggleSidebar()}
              className="md:hidden text-white hover:text-gray-300 p-2 -ml-2 relative z-[110]"
              type="button"
            >
              <Menu size={24} />
            </button>
          )}
          <span className="text-xl font-bold">Renaiscent Bionexus</span>
        </div>
        <div className="flex space-x-6">
          <Link
            to="/"
            className={`hover:text-blue-400 flex items-center gap-2 p-2 ${
              location.pathname === "/" ? "text-blue-400" : ""
            }`}
          >
            <Home size={18} /> Home
          </Link>
          <Link
            to="/search"
            className={`hover:text-blue-400 flex items-center gap-2 p-2 ${
              location.pathname === "/search" ? "text-blue-400" : ""
            }`}
          >
            <Search size={18} /> Drug Repurposing
          </Link>
          <Link
            to="/query"
            className={`hover:text-blue-400 flex items-center gap-2 p-2 ${
              location.pathname === "/query" ? "text-blue-400" : ""
            }`}
          >
            <Search size={18} /> General Query
          </Link>
        </div>
      </div>
    </nav>
  );
};
