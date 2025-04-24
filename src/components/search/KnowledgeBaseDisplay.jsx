import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Dna,
  Zap,
  LayoutGrid,
  AlertCircle,
  FileText,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${
          payload[0].name
        }: ${payload[0].value.toFixed(2)}`}</p>
        {payload[0].payload.description && (
          <p className="text-sm text-gray-600 mt-1">
            {payload[0].payload.description}
          </p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * Component to display the disease knowledge base
 */
const KnowledgeBaseDisplay = ({ knowledgeBase, disease }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("genes");
  const [showExplanation, setShowExplanation] = useState(false);

  if (!knowledgeBase) {
    return null;
  }

  // Prepare data for the charts
  const prepareChartData = (entityObj, limit = 15) => {
    if (!entityObj) return [];

    return Object.entries(entityObj)
      .map(([name, score]) => ({
        name,
        score: typeof score === "number" ? score * 100 : 0,
        description:
          typeof score === "object" && score.explanation
            ? score.explanation
            : `Relevance score for ${name} in relation to ${disease}`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const geneData = prepareChartData(knowledgeBase.genes);
  const bpData = prepareChartData(knowledgeBase.biological_processes);
  const mfData = prepareChartData(knowledgeBase.molecular_functions);
  const ccData = prepareChartData(knowledgeBase.cellular_components);

  const entityCounts = {
    genes: Object.keys(knowledgeBase.genes || {}).length,
    processes: Object.keys(knowledgeBase.biological_processes || {}).length,
    functions: Object.keys(knowledgeBase.molecular_functions || {}).length,
    components: Object.keys(knowledgeBase.cellular_components || {}).length,
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
      >
        <div className="flex items-center">
          <FileText size={18} className="mr-2 text-indigo-600" />
          <span className="font-medium text-gray-800">
            {disease} Knowledge Base
          </span>
          <span className="ml-3 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            Scored
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4">
          <div className="mb-4 bg-indigo-50 p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <AlertCircle
                  size={20}
                  className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-indigo-800">
                    This is the scored knowledge base used for qualitative
                    analysis of drug candidates. It contains genes, biological
                    processes, molecular functions, and cellular components
                    specifically relevant to {disease}.
                  </p>
                  {showExplanation && (
                    <div className="mt-2 text-sm text-indigo-800">
                      <p className="mb-1">
                        <strong>How this affects drug rankings:</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          Each entity has an importance score (0-100) that
                          influences drug rankings
                        </li>
                        <li>
                          Drugs targeting genes with higher scores receive
                          priority
                        </li>
                        <li>
                          Drugs affecting biological processes and molecular
                          functions relevant to the disease receive higher
                          qualitative scores
                        </li>
                        <li>
                          The final score is a weighted combination of
                          quantitative analysis (from the knowledge graph) and
                          qualitative analysis (from this knowledge base)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium flex-shrink-0"
              >
                <Info size={16} className="mr-1" />
                {showExplanation ? "Hide details" : "How it works"}
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === "genes"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("genes")}
            >
              <div className="flex items-center">
                <Dna size={16} className="mr-1" />
                Genes ({entityCounts.genes})
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === "processes"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("processes")}
            >
              <div className="flex items-center">
                <Brain size={16} className="mr-1" />
                Biological Processes ({entityCounts.processes})
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === "functions"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("functions")}
            >
              <div className="flex items-center">
                <Zap size={16} className="mr-1" />
                Molecular Functions ({entityCounts.functions})
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === "components"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("components")}
            >
              <div className="flex items-center">
                <LayoutGrid size={16} className="mr-1" />
                Cellular Components ({entityCounts.components})
              </div>
            </button>
          </div>

          {/* Genes Section */}
          {activeSection === "genes" && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Top Disease-Associated Genes
              </h4>
              <div className="h-60 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={geneData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#6366f1">
                      {geneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#6366f1" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                These genes are associated with {disease} and are used to score
                drugs based on gene targeting. Higher scores indicate greater
                importance for qualitative analysis.
              </p>
            </div>
          )}

          {/* Biological Processes Section */}
          {activeSection === "processes" && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Top Disease-Related Biological Processes
              </h4>
              <div className="h-60 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bpData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#10b981">
                      {bpData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                These biological processes are relevant to {disease} and
                contribute to drug scoring. Drugs affecting high-scored
                processes will receive higher qualitative scores.
              </p>
            </div>
          )}

          {/* Molecular Functions Section */}
          {activeSection === "functions" && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Top Disease-Related Molecular Functions
              </h4>
              <div className="h-60 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mfData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#3b82f6">
                      {mfData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                These molecular functions are relevant to {disease} and
                influence the drug's qualitative scores. Functions with higher
                scores have greater impact on drug ranking.
              </p>
            </div>
          )}

          {/* Cellular Components Section */}
          {activeSection === "components" && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Top Disease-Related Cellular Components
              </h4>
              <div className="h-60 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ccData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#8b5cf6">
                      {ccData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#8b5cf6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                These cellular components are associated with {disease} and may
                influence drug efficacy. Drugs affecting components with higher
                scores receive higher qualitative ratings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseDisplay;
