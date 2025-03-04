import React, { useState, useEffect } from "react";
import {
  Send,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { SearchResult } from "./SearchResult";
import { searchDrugs, getDiseaseSuggestions } from "../../../utils/api.jsx";
import { useSidebar } from "../../context/SidebarContext";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxCandidates: 10,
    analysisTypes: {
      gene: true,
      phenotype: true,
      disease_similarity: true,
      disease_hierarchy: true,
      phenotype_gene: true,
      molecular_function: true,
      biological_process: true,
    },
  });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);

  // Fetch diseases from API on component mount
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("drugChats") || "[]");
    setChats(savedChats);
  }, []);

  useEffect(() => {
    if (currentChat) {
      setQuery(currentChat.query);
      setResults(currentChat.results);
    }
  }, [currentChat]);

  // Add debounced search
  useEffect(() => {
    // Reset selection state when query changes
    if (selectedFromSuggestions) {
      setSelectedFromSuggestions(false);
    }

    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Add this to handle clicks outside the suggestions box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest(".suggestions-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const data = await getDiseaseSuggestions(searchTerm);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Add a handler for selecting a suggestion
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSelectedFromSuggestions(true);

    // Instead of trying to create an artificial event, directly call handleSubmit
    // with the necessary data
    setLoading(true);
    setError(null);

    // Call searchDrugs directly with the selected disease name
    searchDrugs(suggestion.name, filters)
      .then((result) => {
        const formattedResults = Array.isArray(result) ? result : [result];
        setResults(formattedResults);

        // Create new chat
        const newChat = {
          query: suggestion.name,
          results: formattedResults,
          timestamp: new Date().toISOString(),
        };

        setCurrentChat(newChat);

        // Update chat history
        const updatedChats = [newChat, ...chats].slice(0, 10);
        setChats(updatedChats);
        localStorage.setItem("drugChats", JSON.stringify(updatedChats));
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch results. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const startNewChat = () => {
    // Save current chat if it exists
    if (currentChat) {
      const updatedChats = [
        currentChat,
        ...chats.filter((chat) => chat.timestamp !== currentChat.timestamp),
      ].slice(0, 10); // Keep last 10 chats
      setChats(updatedChats);
      localStorage.setItem("drugChats", JSON.stringify(updatedChats));
    }

    // Reset current state
    setQuery("");
    setResults([]);
    setCurrentChat(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchDrugs(query, filters);
      const formattedResults = Array.isArray(result) ? result : [result];
      setResults(formattedResults);

      // Create new chat
      const newChat = {
        query,
        results: formattedResults,
        timestamp: new Date().toISOString(),
      };

      setCurrentChat(newChat);

      // Update chat history
      const updatedChats = [newChat, ...chats].slice(0, 10);
      setChats(updatedChats);
      localStorage.setItem("drugChats", JSON.stringify(updatedChats));
    } catch (error) {
      setError(error.message || "Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleAnalysisTypeToggle = (type) => {
    setFilters({
      ...filters,
      analysisTypes: {
        ...filters.analysisTypes,
        [type]: !filters.analysisTypes[type],
      },
    });
  };

  const ChatHistory = () => (
    <div className="space-y-3 mt-6">
      <h3 className="font-medium text-gray-400 uppercase text-xs tracking-wider">
        Recent Searches
      </h3>
      {chats.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent searches</p>
      ) : (
        chats.map((chat, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentChat(chat);
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentChat?.timestamp === chat.timestamp
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <p className="truncate text-sm font-medium">{chat.query}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(chat.timestamp).toLocaleString()}
            </p>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="flex relative min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed left-0 top-0 bottom-0 bg-gray-900 border-r border-gray-800 pt-20">
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 text-white rounded-lg p-3 mb-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} />
            New Analysis
          </button>
          <ChatHistory />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-72 h-full bg-gray-900 transition-transform duration-300 ease-in-out z-50 pt-20`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
        >
          <X size={24} />
        </button>
        <div className="p-4">
          <button
            onClick={() => {
              startNewChat();
              setIsSidebarOpen(false);
            }}
            className="w-full bg-blue-600 text-white rounded-lg p-3 mb-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} />
            New Analysis
          </button>
          <ChatHistory />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-64 pt-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-16">
          {/* Mobile header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b">
            <div className="flex items-center p-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-800">
                Drug Repurposing
              </h1>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block fixed top-0 left-64 right-0 bg-white z-40 border-b">
            <div className="p-4 max-w-6xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-800">
                Drug Repurposing Analysis
              </h1>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent normal form submission
                // Only the handleSelectSuggestion will trigger submission
              }}
            >
              <div className="relative mb-4">
                <p className="text-base font-bold text-gray-700 mb-3">
                  Type to search for a disease, then select from available
                  options
                </p>
                <div className="relative suggestions-container">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type a disease name to see available options"
                    className={`w-full p-4 pl-12 pr-12 rounded-lg border ${
                      showSuggestions && query.trim().length > 0
                        ? "border-blue-400 ring-2 ring-blue-200"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  {/* Submit button removed */}

                  {/* Disease Suggestions Dropdown */}
                  {showSuggestions && query.trim().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                      {suggestionsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading suggestions...
                        </div>
                      ) : suggestions.filter((s) => s.available).length > 0 ? (
                        <ul>
                          {suggestions
                            .filter((suggestion) => suggestion.available)
                            .map((suggestion, index) => (
                              <li
                                key={index}
                                onClick={() =>
                                  handleSelectSuggestion(suggestion)
                                }
                                className="p-3 cursor-pointer border-b last:border-0 hover:bg-gray-50 flex items-center"
                              >
                                <div
                                  className="w-3 h-3 bg-green-500 rounded-full mr-2"
                                  title="Available in Knowledge Graph"
                                ></div>
                                <div>
                                  <p className="font-medium">
                                    {suggestion.name}
                                  </p>
                                  {suggestion.description && (
                                    <p className="text-sm text-gray-600 truncate">
                                      {suggestion.description}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No matching diseases found in our database
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                >
                  Advanced Options
                  {filtersVisible ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </button>

                {/* Filters Panel */}
                {filtersVisible && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Score (0-100)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.minScore}
                          onChange={(e) =>
                            handleFilterChange(
                              "minScore",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>Current: {filters.minScore}</span>
                          <span>100</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Candidates
                        </label>
                        <select
                          value={filters.maxCandidates}
                          onChange={(e) =>
                            handleFilterChange(
                              "maxCandidates",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={500}>500</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analysis Types
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(filters.analysisTypes).map(
                          ([type, enabled]) => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`analysis-${type}`}
                                checked={enabled}
                                onChange={() => handleAnalysisTypeToggle(type)}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <label
                                htmlFor={`analysis-${type}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                {type.replace("_", " ")}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div>
            {loading && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="font-medium text-lg text-gray-700">
                  Analyzing drug repurposing candidates...
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  This may take a moment as we evaluate multiple biological
                  pathways.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-red-500">
                <h3 className="font-bold text-red-600 text-lg mb-2">Error</h3>
                <p className="text-gray-700 mb-4">{error.message || error}</p>

                {/* Display disease suggestions if available */}
                {error.suggestions && error.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">
                      {error.userMessage ||
                        "Try one of these diseases instead:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {error.suggestions.map((disease, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(disease);
                            setError(null);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        >
                          {disease}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Analysis Results
                </h2>

                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResult key={index} result={result} />
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg text-gray-700">
                  Ready to analyze
                </h3>
                <p className="text-gray-500 mt-2">
                  {query
                    ? "Type a disease name and select from the suggestions to view results"
                    : "Start by typing a disease name in the search box above"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchPage;
