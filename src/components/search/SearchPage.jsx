import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  Check,
  Sparkles,
  FileText,
} from "lucide-react";
import { SearchResult } from "./SearchResult";
import {
  searchDrugs,
  getDiseaseSuggestions,
  getKnowledgeBase,
} from "../../../utils/api.jsx";
import { useSidebar } from "../../context/SidebarContext";
import KnowledgeBaseDisplay from "./KnowledgeBaseDisplay";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    minScore: 0,
    maxCandidates: 10,
    showIndications: true, // New filter to show/hide indication drugs
    showRepurposing: true, // New filter to show/hide repurposing candidates
    applyQualitative: true, // New filter to enable/disable qualitative analysis
    analysisTypes: {
      gene: true,
      phenotype: true,
      disease_similarity: true,
      disease_hierarchy: true,
      phenotype_gene: true,
      molecular_function: true,
      biological_process: true,
      txgnn: true, // TXGNN analysis toggle
      gpt: true, // GPT analysis toggle
    },
  });

  // Fetch diseases from API on component mount
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("drugChats") || "[]");
    setChats(savedChats);
  }, []);

  useEffect(() => {
    if (currentChat) {
      setQuery(currentChat.query);
      setResults(currentChat.results);
      setKnowledgeBase(currentChat.knowledge_base || null);
      applyFilters(currentChat.results); // Apply filters to the restored results
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

  // Apply filters when results or filter settings change
  useEffect(() => {
    applyFilters(results);
  }, [
    results,
    filters.showIndications,
    filters.showRepurposing,
    filters.minScore,
  ]);

  // Function to apply filters to results
  const applyFilters = (resultsToFilter) => {
    if (!resultsToFilter || !Array.isArray(resultsToFilter)) {
      setFilteredResults([]);
      return;
    }

    // Apply all filters
    let filtered = resultsToFilter.filter((result) => {
      // Filter by score
      const score = result.combined_score || result.score || 0;
      if (score < filters.minScore) return false;

      // Filter by indication status
      if (result.is_indication && !filters.showIndications) return false;
      if (!result.is_indication && !filters.showRepurposing) return false;

      return true;
    });

    setFilteredResults(filtered);
  };

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

  // Add a helper function to manage local storage and prevent quota issues
  const saveDrugChatsToStorage = (chatsToSave) => {
    try {
      // Keep only essential data to reduce storage size
      const compactChats = chatsToSave.map((chat) => ({
        query: chat.query,
        timestamp: chat.timestamp,
        // For results, only keep essential fields and limit the number of drugs
        results: (chat.results || []).slice(0, 50).map((drug) => ({
          drug: drug.drug,
          combined_score: drug.combined_score || drug.score || 0,
          is_indication: drug.is_indication || false,
        })),
        // Don't store the full knowledge base, only basic info if needed
        knowledge_base: chat.knowledge_base
          ? {
              disease: chat.knowledge_base.disease,
              gene_count: chat.knowledge_base.genes
                ? chat.knowledge_base.genes.length
                : 0,
            }
          : null,
      }));

      // Limit to 5 chats to reduce storage usage
      const limitedChats = compactChats.slice(0, 5);

      // Convert to string and check size
      const chatString = JSON.stringify(limitedChats);

      // If string is too large (over 4MB), reduce further
      if (chatString.length > 4000000) {
        console.warn("Chat history too large, reducing further");
        const furtherLimitedChats = limitedChats.slice(0, 3);
        localStorage.setItem("drugChats", JSON.stringify(furtherLimitedChats));
        return furtherLimitedChats;
      }

      localStorage.setItem("drugChats", chatString);
      return limitedChats;
    } catch (error) {
      console.error("Error saving chats to localStorage:", error);
      // If quota exceeded or other error, clear and save only current
      try {
        localStorage.removeItem("drugChats");
        if (chatsToSave.length > 0) {
          const singleChat = [
            {
              query: chatsToSave[0].query,
              timestamp: chatsToSave[0].timestamp,
              results: [],
            },
          ];
          localStorage.setItem("drugChats", JSON.stringify(singleChat));
          return singleChat;
        }
      } catch (fallbackError) {
        console.error("Failed to save even after clearing:", fallbackError);
      }
      return [];
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSelectedFromSuggestions(true);

    setLoading(true);
    setError(null);

    searchDrugs(suggestion.name, filters)
      .then(async (result) => {
        const formattedResults = Array.isArray(result) ? result : [result];
        setResults(formattedResults);
        applyFilters(formattedResults);

        // Check if knowledge base data is available in the response
        if (result.knowledge_base) {
          setKnowledgeBase(result.knowledge_base);
        } else if (filters.applyQualitative) {
          // Try to fetch knowledge base separately if qualitative analysis was enabled
          const kb = await getKnowledgeBase(suggestion.name);
          setKnowledgeBase(kb);
        } else {
          setKnowledgeBase(null);
        }

        // Create new chat with all detailed scores included
        const newChat = {
          query: suggestion.name,
          results: formattedResults,
          timestamp: new Date().toISOString(),
          // Include the analyzer scores in the saved data
          analyzerScores:
            formattedResults.length > 0
              ? formattedResults[0].analyzer_scores
              : null,
          methodScores:
            formattedResults.length > 0
              ? formattedResults[0].method_scores
              : null,
          knowledge_base: result.knowledge_base || null,
        };

        setCurrentChat(newChat);

        // Update chat history with our new storage management function
        const updatedChats = [newChat, ...chats].slice(0, 10);
        const savedChats = saveDrugChatsToStorage(updatedChats);
        setChats(savedChats);
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
      ].slice(0, 10);

      const savedChats = saveDrugChatsToStorage(updatedChats);
      setChats(savedChats);
    }

    // Reset current state
    setQuery("");
    setResults([]);
    setFilteredResults([]);
    setCurrentChat(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setKnowledgeBase(null); // Reset knowledge base when starting a new search

    try {
      // Fetch disease repurposing results
      const response = await fetch(
        `${apiBaseUrl}/api/disease/analyze?disease=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error analyzing disease");
      }

      const data = await response.json();

      // Process results
      setResults(data.top_candidates || []);

      // Log the entire response to inspect structure
      console.log("API Response:", data);

      // Look for knowledge base in the response by checking all possible field names
      if (data.knowledge_base) {
        console.log("Found knowledge_base in response", data.knowledge_base);
        setKnowledgeBase(data.knowledge_base);
      } else if (data.disease_knowledge) {
        console.log(
          "Found disease_knowledge in response",
          data.disease_knowledge
        );
        setKnowledgeBase(data.disease_knowledge);
      } else {
        console.log(
          "Knowledge base not found in response, trying to fetch separately"
        );
        // If knowledge base isn't in the response, try to fetch it separately
        fetchKnowledgeBase(query);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      if (err.message.includes("Disease not found")) {
        // Try to find similar diseases
        try {
          const suggestionsResponse = await fetch(
            `${apiBaseUrl}/api/disease/suggest?query=${encodeURIComponent(
              query
            )}`
          );
          if (suggestionsResponse.ok) {
            const suggestionsData = await suggestionsResponse.json();
            setError({
              message: `Disease "${query}" not found in our database.`,
              suggestions: suggestionsData.suggestions || [],
              userMessage: "Did you mean one of these diseases?",
            });
          } else {
            setError(err);
          }
        } catch (suggestionsErr) {
          setError(err);
        }
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fix the fetchKnowledgeBase function to log more information
  const fetchKnowledgeBase = async (diseaseName) => {
    try {
      console.log("Fetching knowledge base for", diseaseName);
      const response = await fetch(
        `${apiBaseUrl}/api/disease/knowledge-base?disease=${encodeURIComponent(
          diseaseName
        )}`
      );

      console.log("Knowledge base response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Knowledge base response data:", data);

        // Check for both field names
        if (data.knowledge_base) {
          console.log("Setting knowledge_base from dedicated endpoint");
          setKnowledgeBase(data.knowledge_base);
        } else if (data.disease_knowledge) {
          console.log("Setting disease_knowledge from dedicated endpoint");
          setKnowledgeBase(data.disease_knowledge);
        } else {
          // As a fallback, check if the data itself is a knowledge base (has the expected structure)
          if (
            data.genes &&
            (data.biological_processes || data.molecular_functions)
          ) {
            console.log("Response appears to be the knowledge base itself");
            setKnowledgeBase(data);
          } else {
            console.log(
              "No knowledge base found in dedicated endpoint response"
            );
          }
        }
      } else {
        console.error("Error fetching knowledge base:", response.statusText);
      }
    } catch (err) {
      console.error("Exception fetching knowledge base:", err);
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

  // Enhanced Qualitative Analysis Notice
  const QualitativeAnalysisNotice = () => {
    const qualitativeCount = results.filter(
      (r) => r.qualitative_analysis
    ).length;

    if (qualitativeCount === 0) return null;

    return (
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm flex items-start">
        <Sparkles
          size={18}
          className="text-purple-600 mr-2 mt-0.5 flex-shrink-0"
        />
        <div>
          <h3 className="font-medium text-purple-800">
            Qualitative Analysis Applied to {qualitativeCount} Drugs
          </h3>
          <p className="text-purple-700">
            Top results have been analyzed using the {query}-specific knowledge
            base for enhanced biological relevance. This analysis evaluates
            matches with disease-relevant genes, biological processes, and
            molecular functions.
          </p>
          {knowledgeBase && (
            <button
              onClick={() =>
                document
                  .getElementById("knowledge-base-section")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="mt-1 text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
            >
              <FileText size={14} className="mr-1" />
              View Knowledge Base
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <form onSubmit={handleSubmit}>
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
                        Advanced Analysis Options
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="apply-qualitative"
                            checked={filters.applyQualitative}
                            onChange={() =>
                              handleFilterChange(
                                "applyQualitative",
                                !filters.applyQualitative
                              )
                            }
                            className="h-4 w-4 text-purple-600 rounded"
                          />
                          <label
                            htmlFor="apply-qualitative"
                            className="ml-2 text-sm text-gray-700 flex items-center"
                          >
                            <span className="text-purple-600 mr-1">✨</span>
                            Apply Qualitative Analysis
                            <span className="ml-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">
                          Enhanced scoring using disease-specific knowledge
                          bases (currently available for Cystic Fibrosis)
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Drug Types
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="show-indications"
                            checked={filters.showIndications}
                            onChange={() =>
                              handleFilterChange(
                                "showIndications",
                                !filters.showIndications
                              )
                            }
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label
                            htmlFor="show-indications"
                            className="ml-2 text-sm text-gray-700 flex items-center"
                          >
                            <Check size={14} className="text-green-600 mr-1" />
                            Current Indications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="show-repurposing"
                            checked={filters.showRepurposing}
                            onChange={() =>
                              handleFilterChange(
                                "showRepurposing",
                                !filters.showRepurposing
                              )
                            }
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label
                            htmlFor="show-repurposing"
                            className="ml-2 text-sm text-gray-700 flex items-center"
                          >
                            <AlertCircle
                              size={14}
                              className="text-blue-600 mr-1"
                            />
                            Repurposing Candidates
                          </label>
                        </div>
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

          {/* Display knowledge base if available */}
          {knowledgeBase && query && (
            <div id="knowledge-base-section">
              <KnowledgeBaseDisplay
                knowledgeBase={knowledgeBase}
                disease={query}
              />
            </div>
          )}

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

                {/* Results summary with counts */}
                <div className="flex gap-4 bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">Total: {results.length}</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-green-600 mr-1" />
                    <span>
                      {results.filter((r) => r.is_indication).length}{" "}
                      Indications
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle size={16} className="text-blue-600 mr-1" />
                    <span>
                      {results.filter((r) => !r.is_indication).length}{" "}
                      Repurposing
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700">
                      Showing: {filteredResults.length} results
                    </span>
                  </div>
                </div>

                {/* Qualitative Analysis Notice - enhanced version */}
                <QualitativeAnalysisNotice />

                <div className="space-y-4">
                  {filteredResults.map((result, index) => (
                    <SearchResult key={index} result={result} />
                  ))}
                </div>

                {filteredResults.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle
                      size={32}
                      className="text-gray-400 mx-auto mb-2"
                    />
                    <p className="text-gray-600">
                      No results match your current filters.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Try adjusting your filter settings.
                    </p>
                  </div>
                )}
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
