// import React, { useState, useEffect } from "react";
// import { Send, PlusCircle, Menu, X, ChevronDown, ChevronUp, Search } from "lucide-react";
// import { SearchResult } from "./SearchResult";
// import { searchDrugs, fetchDiseases } from "../../../utils/api";
// import { useSidebar } from "../../context/SidebarContext";

// export const SearchPage = () => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [chats, setChats] = useState([]);
//   const [currentChat, setCurrentChat] = useState(null);
//   const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
//   const [diseases, setDiseases] = useState([]);
//   const [diseasesLoading, setDiseasesLoading] = useState(false);
//   const [selectedDisease, setSelectedDisease] = useState(null);
//   const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filtersVisible, setFiltersVisible] = useState(false);
//   const [diseaseError, setDiseaseError] = useState(null); // Separate error state for diseases
//   const [filters, setFilters] = useState({
//     minScore: 0,
//     maxCandidates: 10,
//     analysisTypes: {
//       gene: true,
//       phenotype: true,
//       disease_similarity: true,
//       disease_hierarchy: true,
//       phenotype_gene: true,
//       molecular_function: true,
//       biological_process: true
//     }
//   });

//   // Fetch diseases from API on component mount
//   useEffect(() => {
//     const getDiseases = async () => {
//       setDiseasesLoading(true);
//       setDiseaseError(null); // Reset disease-specific error
      
//       try {
//         const diseasesData = await fetchDiseases();
        
//         // Check if the response has the expected structure
//         if (diseasesData && Array.isArray(diseasesData.diseases)) {
//           setDiseases(diseasesData.diseases);
//         } else if (Array.isArray(diseasesData)) {
//           // Handle case where API might return array directly
//           setDiseases(diseasesData);
//         } else {
//           // Fallback to empty array if unexpected format
//           console.warn("Unexpected diseases data format:", diseasesData);
//           setDiseases([]);
//           setDiseaseError("Diseases loaded in unexpected format");
//         }
//       } catch (err) {
//         console.error("Failed to fetch diseases:", err);
//         setDiseaseError("Failed to load diseases"); // Only set disease-specific error
//         // Set a fallback list of common diseases so the app remains functional
//         setDiseases([
//           "Alzheimer's Disease",
//           "Parkinson's Disease",
//           "Diabetes Type 2",
//           "Rheumatoid Arthritis",
//           "Multiple Sclerosis",
//           "Hypertension",
//           "Cancer",
//           "Depression",
//           "Asthma",
//           "COPD"
//         ]);
//       } finally {
//         setDiseasesLoading(false);
//       }
//     };

//     getDiseases();
    
//     const savedChats = JSON.parse(localStorage.getItem("drugChats") || "[]");
//     setChats(savedChats);
//   }, []);

//   useEffect(() => {
//     if (currentChat) {
//       setQuery(currentChat.query);
//       setResults(currentChat.results);
//     }
//   }, [currentChat]);

//   const startNewChat = () => {
//     // Save current chat if it exists
//     if (currentChat) {
//       const updatedChats = [
//         currentChat,
//         ...chats.filter((chat) => chat.timestamp !== currentChat.timestamp),
//       ].slice(0, 10); // Keep last 10 chats
//       setChats(updatedChats);
//       localStorage.setItem("drugChats", JSON.stringify(updatedChats));
//     }

//     // Reset current state
//     setQuery("");
//     setResults([]);
//     setCurrentChat(null);
//     setError(null);
//     setSelectedDisease(null);
//   };

//   const handleDiseaseSelect = (disease) => {
//     setSelectedDisease(disease);
//     setQuery(disease);
//     setShowDiseaseDropdown(false);
//   };

//   const filteredDiseases = diseases.filter(disease => 
//     disease.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const result = await searchDrugs(query, filters);
//       const formattedResults = Array.isArray(result) ? result : [result];
//       setResults(formattedResults);

//       // Create new chat
//       const newChat = {
//         query,
//         results: formattedResults,
//         timestamp: new Date().toISOString(),
//       };

//       setCurrentChat(newChat);

//       // Update chat history
//       const updatedChats = [newChat, ...chats].slice(0, 10);
//       setChats(updatedChats);
//       localStorage.setItem("drugChats", JSON.stringify(updatedChats));
//     } catch (error) {
//       console.error("Search error:", error);
//       setError(error.message || "Failed to fetch results. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters({
//       ...filters,
//       [key]: value
//     });
//   };

//   const handleAnalysisTypeToggle = (type) => {
//     setFilters({
//       ...filters,
//       analysisTypes: {
//         ...filters.analysisTypes,
//         [type]: !filters.analysisTypes[type]
//       }
//     });
//   };

//   const ChatHistory = () => (
//     <div className="space-y-3 mt-6">
//       <h3 className="font-medium text-gray-400 uppercase text-xs tracking-wider">Recent Searches</h3>
//       {chats.length === 0 ? (
//         <p className="text-gray-500 text-sm">No recent searches</p>
//       ) : (
//         chats.map((chat, idx) => (
//           <button
//             key={idx}
//             onClick={() => {
//               setCurrentChat(chat);
//               setIsSidebarOpen(false);
//             }}
//             className={`w-full text-left p-3 rounded-lg transition-colors ${
//               currentChat?.timestamp === chat.timestamp
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//             }`}
//           >
//             <p className="truncate text-sm font-medium">{chat.query}</p>
//             <p className="text-xs opacity-70 mt-1">
//               {new Date(chat.timestamp).toLocaleString()}
//             </p>
//           </button>
//         ))
//       )}
//     </div>
//   );

//   return (
//     <div className="flex relative min-h-screen bg-gray-50">
//       {/* Desktop Sidebar */}
//       <div className="hidden lg:block w-64 fixed left-0 top-0 bottom-0 bg-gray-900 border-r border-gray-800 pt-20">
//         <div className="p-4">
//           <button
//             onClick={startNewChat}
//             className="w-full bg-blue-600 text-white rounded-lg p-3 mb-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
//           >
//             <PlusCircle size={18} />
//             New Analysis
//           </button>
//           <ChatHistory />
//         </div>
//       </div>

//       {/* Mobile Sidebar */}
//       <div
//         className={`lg:hidden fixed inset-y-0 left-0 transform ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } w-72 h-full bg-gray-900 transition-transform duration-300 ease-in-out z-50 pt-20`}
//       >
//         <button
//           onClick={() => setIsSidebarOpen(false)}
//           className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
//         >
//           <X size={24} />
//         </button>
//         <div className="p-4">
//           <button
//             onClick={() => {
//               startNewChat();
//               setIsSidebarOpen(false);
//             }}
//             className="w-full bg-blue-600 text-white rounded-lg p-3 mb-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
//           >
//             <PlusCircle size={18} />
//             New Analysis
//           </button>
//           <ChatHistory />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="w-full lg:ml-64 pt-20">
//         <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-16">
//           {/* Mobile header */}
//           <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b">
//             <div className="flex items-center p-4">
//               <button
//                 onClick={() => setIsSidebarOpen(true)}
//                 className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
//               >
//                 <Menu size={24} />
//               </button>
//               <h1 className="ml-2 text-xl font-semibold text-gray-800">Drug Repurposing</h1>
//             </div>
//           </div>

//           {/* Desktop header */}
//           <div className="hidden lg:block fixed top-0 left-64 right-0 bg-white z-40 border-b">
//             <div className="p-4 max-w-6xl mx-auto">
//               <h1 className="text-2xl font-semibold text-gray-800">Drug Repurposing Analysis</h1>
//             </div>
//           </div>

//           {/* Search Form */}
//           <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//             <form onSubmit={handleSubmit}>
//               <div className="relative mb-4">
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     onClick={() => setShowDiseaseDropdown(true)}
//                     placeholder="Search for a disease or condition"
//                     className="w-full p-4 pl-12 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   />
//                   <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <button
//                     type="submit"
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
//                     disabled={loading || !query.trim()}
//                   >
//                     <Send size={16} />
//                   </button>
//                 </div>

//                 {/* Disease Dropdown */}
//                 {showDiseaseDropdown && (
//                   <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
//                     <div className="sticky top-0 bg-white p-2 border-b">
//                       <input
//                         type="text"
//                         placeholder="Filter diseases..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded-md"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </div>
//                     <div className="p-2">
//                       {diseasesLoading ? (
//                         <div className="text-center p-4">
//                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
//                         </div>
//                       ) : diseaseError ? (
//                         <div className="p-3">
//                           <p className="text-amber-600 mb-2">{diseaseError}</p>
//                           <p className="text-gray-600 text-sm">You can still type your query manually</p>
//                         </div>
//                       ) : filteredDiseases.length > 0 ? (
//                         filteredDiseases.map((disease, index) => (
//                           <button
//                             key={index}
//                             onClick={() => handleDiseaseSelect(disease)}
//                             className="w-full text-left p-3 rounded hover:bg-gray-100 truncate"
//                           >
//                             {disease}
//                           </button>
//                         ))
//                       ) : (
//                         <p className="text-gray-500 p-3">No matching diseases found</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Advanced Filters Toggle */}
//               <div>
//                 <button
//                   type="button"
//                   onClick={() => setFiltersVisible(!filtersVisible)}
//                   className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
//                 >
//                   Advanced Options
//                   {filtersVisible ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
//                 </button>

//                 {/* Filters Panel */}
//                 {filtersVisible && (
//                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                     <div className="grid gap-6 md:grid-cols-2">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Minimum Score (0-100)
//                         </label>
//                         <input
//                           type="range"
//                           min="0"
//                           max="100"
//                           value={filters.minScore}
//                           onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
//                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                         />
//                         <div className="flex justify-between text-xs text-gray-500 mt-1">
//                           <span>0</span>
//                           <span>Current: {filters.minScore}</span>
//                           <span>100</span>
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Max Candidates
//                         </label>
//                         <select
//                           value={filters.maxCandidates}
//                           onChange={(e) => handleFilterChange('maxCandidates', parseInt(e.target.value))}
//                           className="w-full p-2 border border-gray-300 rounded-md"
//                         >
//                           <option value={10}>10</option>
//                           <option value={25}>25</option>
//                           <option value={50}>50</option>
//                           <option value={100}>100</option>
//                           <option value={500}>500</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="mt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Analysis Types
//                       </label>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                         {Object.entries(filters.analysisTypes).map(([type, enabled]) => (
//                           <div key={type} className="flex items-center">
//                             <input
//                               type="checkbox"
//                               id={`analysis-${type}`}
//                               checked={enabled}
//                               onChange={() => handleAnalysisTypeToggle(type)}
//                               className="h-4 w-4 text-blue-600 rounded"
//                             />
//                             <label
//                               htmlFor={`analysis-${type}`}
//                               className="ml-2 text-sm text-gray-700"
//                             >
//                               {type.replace('_', ' ')}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* Results Section */}
//           <div>
//             {loading && (
//               <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                 <h3 className="font-medium text-lg text-gray-700">Analyzing drug repurposing candidates...</h3>
//                 <p className="text-gray-500 text-sm mt-2">This may take a moment as we evaluate multiple biological pathways.</p>
//               </div>
//             )}

//             {error && (
//               <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 shadow">
//                 <h3 className="font-bold">Error</h3>
//                 <p>{error}</p>
//               </div>
//             )}

//             {!loading && results.length > 0 && (
//               <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                   Analysis Results
//                 </h2>
//                 <div className="space-y-4">
//                   {results.map((result, index) => (
//                     <SearchResult key={index} result={result} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {!loading && !error && results.length === 0 && query && (
//               <div className="bg-white rounded-xl shadow-md p-8 text-center">
//                 <Search size={48} className="text-gray-300 mx-auto mb-4" />
//                 <h3 className="font-medium text-lg text-gray-700">Ready to analyze</h3>
//                 <p className="text-gray-500 mt-2">Submit your query to find drug repurposing candidates</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Backdrop for mobile sidebar */}
//       {isSidebarOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Backdrop for diseases dropdown */}
//       {showDiseaseDropdown && (
//         <div
//           className="fixed inset-0 z-10"
//           onClick={() => setShowDiseaseDropdown(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default SearchPage;
import React, { useState, useEffect } from "react";
import { Send, PlusCircle, Menu, X, ChevronDown, ChevronUp, Search, Book, FileText } from "lucide-react";
import { SearchResult } from "./SearchResult";
import { searchDrugs, fetchDiseases } from "../../../utils/api";
import { useSidebar } from "../../context/SidebarContext";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [diseases, setDiseases] = useState([]);
  const [diseasesLoading, setDiseasesLoading] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [diseaseError, setDiseaseError] = useState(null);
  const [showReferences, setShowReferences] = useState(true);
  const [expandedReference, setExpandedReference] = useState(null);
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
      biological_process: true
    }
  });

  // Scientific references data
  const scientificReferences = [
    {
      id: 1,
      category: "Gene Analysis",
      title: "Network-based approach to prediction and population-based validation of in silico drug repurposing",
      authors: "Cheng, F., Desai, R. J., Handy, D. E., Wang, R., Schneeweiss, S., Barabási, A. L., & Loscalzo, J.",
      year: 2018,
      journal: "Nature Communications, 9(1), 1-12",
      description: "This study presents a network-based framework for systematic drug repurposing, utilizing gene-disease associations and network proximity to predict new indications for approved drugs."
    },
    {
      id: 2,
      category: "Phenotype Methods",
      title: "PREDICT: a method for inferring novel drug indications with application to personalized medicine",
      authors: "Gottlieb, A., Stein, G. Y., Ruppin, E., & Sharan, R.",
      year: 2011,
      journal: "Molecular Systems Biology, 7(1), 496",
      description: "Introduces PREDICT, a novel computational method that directly relates drug features and disease features to predict new drug indications based on phenotypic signatures."
    },
    {
      id: 3,
      category: "Pathway Analysis",
      title: "A next generation connectivity map: L1000 platform and the first 1,000,000 profiles",
      authors: "Subramanian, A., et al.",
      year: 2017,
      journal: "Cell, 171(6), 1437-1452",
      description: "This landmark paper introduces the L1000 platform for creating a comprehensive map of functional connections among genes, diseases, and therapeutics through biological pathway analysis."
    },
    {
      id: 4,
      category: "Combined Approach",
      title: "Drug repurposing: progress, challenges and recommendations",
      authors: "Pushpakom, S., Iorio, F., Eyers, P. A., Escott, K. J., Hopper, S., Wells, A., et al.",
      year: 2019,
      journal: "Nature Reviews Drug Discovery, 18(1), 41-58",
      description: "A comprehensive review of computational approaches for drug repurposing, including combined scoring methodologies and their applications in clinical settings."
    },
    {
      id: 5,
      category: "Statistical Methods",
      title: "Measurement theory and practice: The world through quantification",
      authors: "Hand, D. J.",
      year: 2009,
      journal: "Wiley-Blackwell",
      description: "Explores statistical foundations for scoring systems and normalization techniques relevant to biological data analysis and predictive modeling."
    }
  ];

  // Fetch diseases from API on component mount
  useEffect(() => {
    const getDiseases = async () => {
      setDiseasesLoading(true);
      setDiseaseError(null);
      
      try {
        const diseasesData = await fetchDiseases();
        
        if (diseasesData && Array.isArray(diseasesData.diseases)) {
          setDiseases(diseasesData.diseases);
        } else if (Array.isArray(diseasesData)) {
          setDiseases(diseasesData);
        } else {
          console.warn("Unexpected diseases data format:", diseasesData);
          setDiseases([]);
          setDiseaseError("Diseases loaded in unexpected format");
        }
      } catch (err) {
        console.error("Failed to fetch diseases:", err);
        setDiseaseError("Failed to load diseases");
        setDiseases([
          "Alzheimer's Disease",
          "Parkinson's Disease",
          "Diabetes Type 2",
          "Rheumatoid Arthritis",
          "Multiple Sclerosis",
          "Hypertension",
          "Cancer",
          "Depression",
          "Asthma",
          "COPD"
        ]);
      } finally {
        setDiseasesLoading(false);
      }
    };

    getDiseases();
    
    const savedChats = JSON.parse(localStorage.getItem("drugChats") || "[]");
    setChats(savedChats);
  }, []);

  useEffect(() => {
    if (currentChat) {
      setQuery(currentChat.query);
      setResults(currentChat.results);
      setShowReferences(false);
    }
  }, [currentChat]);

  const startNewChat = () => {
    if (currentChat) {
      const updatedChats = [
        currentChat,
        ...chats.filter((chat) => chat.timestamp !== currentChat.timestamp),
      ].slice(0, 10);
      setChats(updatedChats);
      localStorage.setItem("drugChats", JSON.stringify(updatedChats));
    }

    setQuery("");
    setResults([]);
    setCurrentChat(null);
    setError(null);
    setSelectedDisease(null);
    setShowReferences(true);
  };

  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    setQuery(disease);
    setShowDiseaseDropdown(false);
  };

  const filteredDiseases = diseases.filter(disease => 
    disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setShowReferences(false);

    try {
      const result = await searchDrugs(query, filters);
      const formattedResults = Array.isArray(result) ? result : [result];
      setResults(formattedResults);

      const newChat = {
        query,
        results: formattedResults,
        timestamp: new Date().toISOString(),
      };

      setCurrentChat(newChat);

      const updatedChats = [newChat, ...chats].slice(0, 10);
      setChats(updatedChats);
      localStorage.setItem("drugChats", JSON.stringify(updatedChats));
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleAnalysisTypeToggle = (type) => {
    setFilters({
      ...filters,
      analysisTypes: {
        ...filters.analysisTypes,
        [type]: !filters.analysisTypes[type]
      }
    });
  };

  const handleReferenceClick = (id) => {
    setExpandedReference(expandedReference === id ? null : id);
  };

  const ChatHistory = () => (
    <div className="space-y-3 mt-6">
      <h3 className="font-medium text-gray-400 uppercase text-xs tracking-wider">Recent Searches</h3>
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

  const References = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Book size={20} className="mr-2 text-blue-600" />
          Scientific References
        </h2>
        <span className="text-sm text-gray-500">Learn about our methods</span>
      </div>
      
      <div className="space-y-4">
        {scientificReferences.map((reference) => (
          <div 
            key={reference.id} 
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleReferenceClick(reference.id)}
            >
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs font-medium mr-3 mt-0.5">
                  {reference.category}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{reference.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{reference.authors} ({reference.year})</p>
                </div>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition-transform ${expandedReference === reference.id ? 'transform rotate-180' : ''}`}
              />
            </div>
            
            {expandedReference === reference.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700 text-sm">{reference.description}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Published in:</span> {reference.journal}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-center text-gray-600">
        Our drug repurposing platform uses scientifically validated methods from leading research in the field
      </div>
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
              <h1 className="ml-2 text-xl font-semibold text-gray-800">Drug Repurposing</h1>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block fixed top-0 left-64 right-0 bg-white z-40 border-b">
            <div className="p-4 max-w-6xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-800">Drug Repurposing Analysis</h1>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClick={() => setShowDiseaseDropdown(true)}
                    placeholder="Search for a disease or condition"
                    className="w-full p-4 pl-12 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                    disabled={loading || !query.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>

                {/* Disease Dropdown */}
                {showDiseaseDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                    <div className="sticky top-0 bg-white p-2 border-b">
                      <input
                        type="text"
                        placeholder="Filter diseases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="p-2">
                      {diseasesLoading ? (
                        <div className="text-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      ) : diseaseError ? (
                        <div className="p-3">
                          <p className="text-amber-600 mb-2">{diseaseError}</p>
                          <p className="text-gray-600 text-sm">You can still type your query manually</p>
                        </div>
                      ) : filteredDiseases.length > 0 ? (
                        filteredDiseases.map((disease, index) => (
                          <button
                            key={index}
                            onClick={() => handleDiseaseSelect(disease)}
                            className="w-full text-left p-3 rounded hover:bg-gray-100 truncate"
                          >
                            {disease}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 p-3">No matching diseases found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                >
                  Advanced Options
                  {filtersVisible ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
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
                          onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
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
                          onChange={(e) => handleFilterChange('maxCandidates', parseInt(e.target.value))}
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
                        {Object.entries(filters.analysisTypes).map(([type, enabled]) => (
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
                              {type.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
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
                <h3 className="font-medium text-lg text-gray-700">Analyzing drug repurposing candidates...</h3>
                <p className="text-gray-500 text-sm mt-2">This may take a moment as we evaluate multiple biological pathways.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 shadow">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            )}

            {!loading && showReferences && !error && results.length === 0 && (
              <References />
            )}

            {!loading && results.length > 0 && (
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

            {!loading && !showReferences && !error && results.length === 0 && query && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg text-gray-700">Ready to analyze</h3>
                <p className="text-gray-500 mt-2">Submit your query to find drug repurposing candidates</p>
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

      {/* Backdrop for diseases dropdown */}
      {showDiseaseDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDiseaseDropdown(false)}
        />
      )}
    </div>
  );
};

export default SearchPage;