import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  History,
  Code,
  ChevronDown,
  ChevronUp,
  Dna,
  Activity,
  Brain,
  Pill,
  AlertCircle,
  Heart,
  MapPin,
} from "lucide-react";

export const VariantSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showQuery, setShowQuery] = useState(false);
  const [selectedGene, setSelectedGene] = useState(null);
  const [geneAnalysis, setGeneAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_BASE_URL;

  // The Neo4j Cypher query used for variant search
  const cypherQuery = `
  MATCH p=(gp:gene_protein)-[:variant]->(gv:gene_variant)
  WHERE gv.name CONTAINS "${searchQuery || "<variant_name>"}"
  RETURN p
  `;

  // Fetch search history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/variant-history`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.history) {
          setSearchHistory(data.history);
        }
      } catch (err) {
        console.error("Error fetching search history:", err);
      }
    };

    fetchHistory();
  }, [apiBaseUrl]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedGene(null);
    setGeneAnalysis(null);

    try {
      // Call API to initiate search
      const response = await fetch(`${apiBaseUrl}/api/variant-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ variant_name: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Variant search response:", data);

      // Add to search history and set results from API
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory([searchQuery, ...searchHistory]);
      }

      // Use the real data from the API
      setResults(data.genes || []);
    } catch (err) {
      setError(`Failed to search for variant: ${err.message}`);
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setSearchQuery(item);
    // Auto-search when clicking history item
    const fakeEvent = { preventDefault: () => {} };
    handleSearch(fakeEvent);
  };

  const handleViewDetails = async (gene) => {
    console.log(
      `Viewing details for ${gene.gene} (ID: ${gene.gene_id}) with variant ${gene.variant}`
    );

    // Clear previous analysis
    setGeneAnalysis(null);
    setAnalysisError(null);
    setSelectedGene(gene);
    setIsAnalysisLoading(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/gene-analysis/${gene.gene_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Gene analysis response:", data);
      setGeneAnalysis(data);
      // Initialize all sections as expanded
      setExpandedSections({
        biological_processes: true,
        molecular_functions: true,
        pathways: true,
        diseases: true,
        drugs: true,
        phenotypes: true,
        anatomies: true,
        exposures: true,
      });
    } catch (err) {
      setAnalysisError(`Failed to retrieve gene analysis: ${err.message}`);
      console.error("Analysis error:", err);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <History className="mr-2" size={20} />
            Search History
          </h2>
          {searchHistory.length > 0 ? (
            <ul className="space-y-2">
              {searchHistory.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleHistoryItemClick(item)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-left w-full truncate"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No search history yet</p>
          )}

          {/* Cypher Query Information */}
          <div className="mt-8">
            <button
              onClick={() => setShowQuery(!showQuery)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <Code size={16} className="mr-1" />
              {showQuery ? "Hide Query" : "Show Cypher Query"}
            </button>

            {showQuery && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {cypherQuery}
                </pre>
                <p className="mt-2 text-xs text-gray-600">
                  This query finds gene proteins connected to gene variants that
                  match your search term.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h1 className="text-2xl font-bold mb-6">Variant Search</h1>

            {/* Search form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex w-full">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter variant name..."
                    className="w-full p-3 pr-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-r-lg disabled:bg-gray-400"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Search for gene variants like "rs123", "missense", "deletion",
                etc.
              </p>
            </form>

            {/* Results */}
            <div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {results.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Genes associated with "{searchQuery}" variant
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b text-left">Gene</th>
                          <th className="py-2 px-4 border-b text-left">
                            Variant
                          </th>
                          <th className="py-2 px-4 border-b text-left">
                            Relationship
                          </th>
                          <th className="py-2 px-4 border-b text-left">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              selectedGene &&
                              selectedGene.gene_id === item.gene_id
                                ? "bg-blue-50"
                                : ""
                            }
                          >
                            <td className="py-2 px-4 border-b">{item.gene}</td>
                            <td className="py-2 px-4 border-b">
                              {item.variant}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {item.relationship}
                            </td>
                            <td className="py-2 px-4 border-b">
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => handleViewDetails(item)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-gray-700">
                    <p>
                      Found {results.length} gene(s) related to "{searchQuery}"
                      variant.
                    </p>
                    <p className="mt-2">
                      Click "View Details" for comprehensive gene analysis.
                    </p>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Enter a variant name to search for associated genes and
                      information.
                    </p>
                  </div>
                )
              )}

              {isLoading && (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Searching for variant data...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Gene Analysis Section */}
          {selectedGene && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Dna className="mr-2" size={20} />
                Gene Analysis: {selectedGene.gene}
              </h2>

              {analysisError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {analysisError}
                </div>
              )}

              {isAnalysisLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading gene analysis...</p>
                </div>
              ) : geneAnalysis ? (
                <div className="space-y-4">
                  {/* Gene Information */}
                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-medium">Gene Information</h3>
                    <p>
                      <strong>Name:</strong> {geneAnalysis.analysis.gene.name}
                    </p>
                    <p>
                      <strong>ID:</strong> {geneAnalysis.analysis.gene.id}
                    </p>
                    <p>
                      <strong>Variant:</strong> {selectedGene.variant}
                    </p>
                  </div>

                  {/* Biological Processes Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("biological_processes")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Activity className="mr-2" size={18} />
                        <span className="font-medium">
                          Biological Processes
                        </span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.biological_processes}
                        </span>
                      </div>
                      {expandedSections.biological_processes ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.biological_processes && (
                      <div className="p-3">
                        {geneAnalysis.counts.biological_processes > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.biological_processes.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No biological processes found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Molecular Functions Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("molecular_functions")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Brain className="mr-2" size={18} />
                        <span className="font-medium">Molecular Functions</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.molecular_functions}
                        </span>
                      </div>
                      {expandedSections.molecular_functions ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.molecular_functions && (
                      <div className="p-3">
                        {geneAnalysis.counts.molecular_functions > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.molecular_functions.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No molecular functions found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pathways Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("pathways")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Activity className="mr-2" size={18} />
                        <span className="font-medium">Pathways</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.pathways}
                        </span>
                      </div>
                      {expandedSections.pathways ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.pathways && (
                      <div className="p-3">
                        {geneAnalysis.counts.pathways > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.pathways.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No pathways found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Diseases Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("diseases")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="mr-2" size={18} />
                        <span className="font-medium">Associated Diseases</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.diseases}
                        </span>
                      </div>
                      {expandedSections.diseases ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.diseases && (
                      <div className="p-3">
                        {geneAnalysis.counts.diseases > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.diseases.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No diseases found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Drugs Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("drugs")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Pill className="mr-2" size={18} />
                        <span className="font-medium">Related Drugs</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.drugs}
                        </span>
                      </div>
                      {expandedSections.drugs ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.drugs && (
                      <div className="p-3">
                        {geneAnalysis.counts.drugs > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.drugs.map((item, index) => (
                              <li key={index} className="text-sm">
                                • {item.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No drugs found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phenotypes Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("phenotypes")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Heart className="mr-2" size={18} />
                        <span className="font-medium">Phenotypes</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.phenotypes}
                        </span>
                      </div>
                      {expandedSections.phenotypes ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.phenotypes && (
                      <div className="p-3">
                        {geneAnalysis.counts.phenotypes > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.phenotypes.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No phenotypes found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Anatomy Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("anatomies")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2" size={18} />
                        <span className="font-medium">
                          Anatomical Locations
                        </span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.anatomies}
                        </span>
                      </div>
                      {expandedSections.anatomies ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.anatomies && (
                      <div className="p-3">
                        {geneAnalysis.counts.anatomies > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.anatomies.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name} (
                                  {item.relationship_type ===
                                  "anatomy_protein_present"
                                    ? "Present"
                                    : "Absent"}
                                  )
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No anatomical locations found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Exposures Section */}
                  <div className="border rounded overflow-hidden">
                    <button
                      onClick={() => toggleSection("exposures")}
                      className="w-full flex justify-between items-center p-3 bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <Pill className="mr-2" size={18} />
                        <span className="font-medium">Exposures</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {geneAnalysis.counts.exposures}
                        </span>
                      </div>
                      {expandedSections.exposures ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedSections.exposures && (
                      <div className="p-3">
                        {geneAnalysis.counts.exposures > 0 ? (
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {geneAnalysis.analysis.exposures.map(
                              (item, index) => (
                                <li key={index} className="text-sm">
                                  • {item.name}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No exposures found for this gene.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Select a gene to view detailed analysis
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
