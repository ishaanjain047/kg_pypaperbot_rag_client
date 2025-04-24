import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Dna,
  Sparkles,
  Brain,
  Zap,
  Calculator,
  AlertCircle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// Custom tooltip component
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

const QualitativeScoreBreakdown = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if this drug has qualitative analysis
  const hasQualitativeAnalysis =
    result &&
    result.qualitative_analysis &&
    (result.qualitative_analysis.gene_quality_score > 0 ||
      result.qualitative_analysis.biological_process_quality_score > 0 ||
      result.qualitative_analysis.molecular_function_quality_score > 0);

  // If no qualitative analysis data, don't render the component
  if (!hasQualitativeAnalysis) {
    return null;
  }

  const qualitativeData = result.qualitative_analysis;
  const weights = qualitativeData.weights_used || {
    quantitative: 0.5,
    gene: 0.25,
    biological_process: 0.15,
    molecular_function: 0.1,
  };

  // Multiply scores by 100 to display as percentages
  const geneScore = qualitativeData.gene_quality_score * 100;
  const bpScore = qualitativeData.biological_process_quality_score * 100;
  const mfScore = qualitativeData.molecular_function_quality_score * 100;

  // Original and hybrid scores
  const originalScore = result.original_score || 0;
  const hybridScore = result.combined_score || 0;

  // Get score impact percentage from backend or calculate if not available
  const percentChange =
    qualitativeData.score_impact_percentage !== undefined
      ? qualitativeData.score_impact_percentage
      : ((hybridScore - originalScore) / Math.max(1, originalScore)) * 100;

  // Determine if qualitative analysis improved the score
  let scoreImpactIcon = Minus;
  let scoreImpactColor = "text-gray-500";
  let scoreImpactBg = "bg-gray-100";
  let scoreImpactText = "No Change";

  if (percentChange > 1) {
    scoreImpactIcon = ArrowUp;
    scoreImpactColor = "text-green-600";
    scoreImpactBg = "bg-green-100";
    scoreImpactText = "Improved";
  } else if (percentChange < -1) {
    scoreImpactIcon = ArrowDown;
    scoreImpactColor = "text-red-600";
    scoreImpactBg = "bg-red-100";
    scoreImpactText = "Reduced";
  }

  // Prepare data for charts
  const qualitativeScoreData = [
    {
      name: "Gene Match",
      score: geneScore,
      color: "#6366f1", // indigo
      description: "Score based on matching disease-associated genes",
      weight: weights.gene,
    },
    {
      name: "Biological Process",
      score: bpScore,
      color: "#10b981", // emerald
      description: "Score based on relevant biological processes",
      weight: weights.biological_process,
    },
    {
      name: "Molecular Function",
      score: mfScore,
      color: "#3b82f6", // blue
      description: "Score based on relevant molecular functions",
      weight: weights.molecular_function,
    },
  ].filter((item) => item.score > 0); // Only show scores > 0

  const scoreComparisonData = [
    {
      name: "Quantitative Score",
      score: originalScore,
      color: "#8b5cf6", // purple
      description: "Original combined score from knowledge graph analysis",
      weight: weights.quantitative,
    },
    {
      name: "Hybrid Score",
      score: hybridScore,
      color: "#f97316", // orange
      description:
        "Final score combining quantitative and qualitative analysis",
      weight: 1.0,
    },
  ];

  // Weight distribution pie chart data
  const weightData = [
    {
      name: "Quantitative",
      value: weights.quantitative * 100,
      fill: "#8b5cf6",
    },
    { name: "Gene", value: weights.gene * 100, fill: "#6366f1" },
    {
      name: "Bio Process",
      value: weights.biological_process * 100,
      fill: "#10b981",
    },
    {
      name: "Mol Function",
      value: weights.molecular_function * 100,
      fill: "#3b82f6",
    },
  ];

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors text-left"
      >
        <div className="flex items-center">
          <Sparkles size={18} className="mr-2 text-purple-600" />
          <span className="font-medium text-gray-800">
            Qualitative Analysis Breakdown
          </span>
          <span
            className="ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{
              backgroundColor: scoreImpactBg,
              color: scoreImpactColor
                .replace("text-", "rgb-")
                .replace("-", "-"),
            }}
          >
            <scoreImpactIcon size={12} />
            {Math.abs(percentChange) > 1
              ? `${scoreImpactText} Score ${Math.abs(percentChange).toFixed(
                  1
                )}%`
              : "No Significant Change"}
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4">
          <div className="mb-4 bg-purple-50 p-3 rounded-lg flex items-start">
            <AlertCircle
              size={20}
              className="text-purple-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm text-purple-800">
                This breakdown shows how <strong>{result.drug}</strong> was
                scored based on qualitative analysis of its match with{" "}
                {result.disease}-specific knowledge. The final hybrid score
                combines quantitative knowledge graph analysis with qualitative
                assessment.
              </p>
              <div className="mt-2 text-sm flex items-center">
                <TrendingUp size={14} className="text-purple-600 mr-1" />
                <span className="text-purple-800">
                  Qualitative analysis{" "}
                  {percentChange > 1 ? (
                    <strong>
                      boosted this drug's score by {percentChange.toFixed(1)}%
                    </strong>
                  ) : percentChange < -1 ? (
                    <strong>
                      reduced this drug's score by{" "}
                      {Math.abs(percentChange).toFixed(1)}%
                    </strong>
                  ) : (
                    "did not significantly change this drug's score"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Score comparison chart */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Calculator size={16} className="mr-2 text-purple-600" />
              Score Comparison
            </h4>
            <div className="h-16 bg-gray-50 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scoreComparisonData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {scoreComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight distribution pie chart */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <FileText size={16} className="mr-2 text-purple-600" />
              Score Weight Distribution
            </h4>
            <div className="h-48 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  />
                  <Legend />
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This chart shows how different components are weighted in the
              final score calculation
            </p>
          </div>

          {/* Qualitative score breakdown chart */}
          {qualitativeScoreData.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <Database size={16} className="mr-2 text-blue-600" />
                Qualitative Score Components
              </h4>
              <div className="h-20 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={qualitativeScoreData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {qualitativeScoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gene matches */}
          {qualitativeData.matched_genes &&
            qualitativeData.matched_genes.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                <h5 className="text-sm font-medium text-indigo-800 flex items-center mb-2">
                  <Dna size={14} className="mr-1" />
                  Matched Disease-Relevant Genes
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {qualitativeData.matched_genes.map((match, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-indigo-700">
                        {match.gene}
                      </span>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        Importance: {(match.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Biological processes */}
          {qualitativeData.matched_processes &&
            qualitativeData.matched_processes.length > 0 && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                <h5 className="text-sm font-medium text-emerald-800 flex items-center mb-2">
                  <Brain size={14} className="mr-1" />
                  Matched Disease-Relevant Biological Processes
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {qualitativeData.matched_processes.map((match, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-emerald-700 overflow-hidden overflow-ellipsis">
                        {match.process}
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                        Importance: {(match.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Molecular functions */}
          {qualitativeData.matched_functions &&
            qualitativeData.matched_functions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                  <Zap size={14} className="mr-1" />
                  Matched Disease-Relevant Molecular Functions
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {qualitativeData.matched_functions.map((match, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-blue-700 overflow-hidden overflow-ellipsis">
                        {match.function}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Importance: {(match.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default QualitativeScoreBreakdown;
