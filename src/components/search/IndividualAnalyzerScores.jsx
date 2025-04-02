import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Database } from "lucide-react";

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${
          payload[0].payload.name
        }: ${payload[0].value.toFixed(1)}%`}</p>
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

const IndividualAnalyzerScores = ({ result }) => {
  if (!result || !result.analyzer_scores) {
    return null;
  }

  // Define the analyzers and their display properties
  const analyzers = [
    {
      id: "gene",
      name: "Gene Analysis",
      color: "#6366f1",
      description:
        "Score based on shared genes between drug targets and disease genes",
    },
    {
      id: "phenotype",
      name: "Phenotype Analysis",
      color: "#a855f7",
      description: "Score based on matching drug effects with disease symptoms",
    },
    {
      id: "disease_similarity",
      name: "Disease Similarity",
      color: "#3b82f6",
      description: "Score based on similarity to diseases this drug treats",
    },
    {
      id: "disease_hierarchy",
      name: "Disease Hierarchy",
      color: "#0ea5e9",
      description: "Score based on parent-child relationships between diseases",
    },
    {
      id: "phenotype_gene",
      name: "Phenotype-Gene",
      color: "#14b8a6",
      description: "Score based on phenotype-gene pathway analysis",
    },
    {
      id: "molecular_function",
      name: "Molecular Function",
      color: "#22c55e",
      description: "Score based on shared molecular functions",
    },
    {
      id: "biological_process",
      name: "Biological Process",
      color: "#10b981",
      description: "Score based on shared biological processes",
    },
    // AI Models
    {
      id: "txgnn",
      name: "TXGNN Model",
      color: "#34d399",
      description: "Neural network prediction score",
    },
    {
      id: "gpt",
      name: "GPT Analysis",
      color: "#f97316",
      description: "Large language model assessment score",
    },
  ];

  // Create chart data from available scores
  const chartData = analyzers
    .map((analyzer) => ({
      id: analyzer.id,
      name: analyzer.name,
      score: result.analyzer_scores[analyzer.id] || 0, // Default to 0 if missing
      color: analyzer.color,
      description: analyzer.description,
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return (
    <div className="mt-6">
      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
        <Database size={16} className="mr-2 text-blue-600" />
        Individual Analyzer Scores
      </h4>
      <div className="h-96 bg-gray-50 rounded-lg p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2 italic">
        Scores displayed on a 0-100 scale. Higher scores indicate stronger
        evidence.
      </p>
    </div>
  );
};

export default IndividualAnalyzerScores;
