import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import {
  Info,
  ChevronDown,
  ChevronUp,
  Calculator,
  PieChart as PieChartIcon,
} from "lucide-react";
import IndividualAnalyzerScores from "./IndividualAnalyzerScores";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${
          payload[0].name
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

// Active shape for pie chart
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={13}
        fontWeight={500}
      >
        {`${payload.name} (${(percent * 100).toFixed(1)}%)`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#666"
        fontSize={12}
      >
        {`${value.toFixed(1)} points`}
      </text>
    </g>
  );
};

const ScoreBreakdown = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState(0);

  if (!result || !result.drug) {
    return null;
  }

  // Extract all the scores
  const methodScores = result.method_scores || {};
  const finalScore = result.combined_score || result.score || 0;

  // Get individual algorithm scores - calculate properly
  const kgMethodsScore = Object.entries(methodScores)
    .filter(([method]) => method !== "txgnn")
    .reduce(
      (sum, [_, score]) =>
        sum +
        (score * 100) /
          Object.keys(methodScores).filter((m) => m !== "txgnn").length,
      0
    );

  // Make sure we extract the scores correctly from either property
  const txgnnScore =
    typeof result.txgnn_score === "number"
      ? result.txgnn_score * 100
      : typeof methodScores.txgnn === "number"
      ? methodScores.txgnn * 100
      : 0;

  const gptScore =
    typeof result.gpt_score === "number" ? result.gpt_score * 100 : 0;

  console.log("Extracted scores:", {
    finalScore,
    kgMethodsScore,
    txgnnScore,
    gptScore,
    methodScores: JSON.stringify(methodScores),
  });

  // Get weights from the API response or use default values matching server's config
  const serverWeights = result.weights_used || {};

  // Use the weights from the API response if available, otherwise use default values matching server config
  const txgnnWeight =
    result.txgnn_score > 0
      ? serverWeights.txgnn || result.txgnn_weight || 0.4
      : 0;
  const gptWeight =
    result.gpt_score > 0 ? serverWeights.gpt || result.gpt_weight || 0.35 : 0;

  // Calculate the remaining weight for knowledge graph methods
  const kgWeight =
    result.txgnn_score > 0 || result.gpt_score > 0
      ? Math.max(0, 1.0 - txgnnWeight - gptWeight)
      : 1.0;

  // Calculate weighted contributions to final score
  const kgContribution = kgMethodsScore * kgWeight;
  const txgnnContribution = txgnnScore * txgnnWeight;
  const gptContribution = gptScore * gptWeight;

  console.log("Contributions:", {
    kgContribution,
    txgnnContribution,
    gptContribution,
    weights: JSON.stringify(serverWeights),
  });

  // Create data for the component breakdown chart - original scores
  // Use analyzer_scores if available as it has all scores normalized to 0-100 scale
  const analyzerScores = result.analyzer_scores || {};
  const componentData = [];

  // Add all individual analyzer scores, including zero values
  const analyzerColors = {
    gene: "#6366f1", // indigo
    phenotype: "#a855f7", // purple
    disease_similarity: "#3b82f6", // blue
    disease_hierarchy: "#0ea5e9", // sky blue
    phenotype_gene: "#14b8a6", // teal
    molecular_function: "#22c55e", // green
    biological_process: "#10b981", // emerald
    txgnn: "#34d399", // bright green
    gpt: "#f97316", // orange
  };

  // Add Knowledge Graph combined score
  if (kgMethodsScore >= 0) {
    componentData.push({
      name: "Knowledge Graph",
      score: kgMethodsScore,
      color: "#60a5fa",
      description: `Combined knowledge graph score (${kgMethodsScore.toFixed(
        1
      )}%)`,
    });
  }

  // Add TXGNN
  if (txgnnScore >= 0) {
    componentData.push({
      name: "TXGNN",
      score: txgnnScore,
      color: "#34d399",
      description: `Neural network prediction score (${txgnnScore.toFixed(
        1
      )}%)`,
    });
  }

  // Add GPT
  if (gptScore >= 0) {
    componentData.push({
      name: "GPT",
      score: gptScore,
      color: "#f97316",
      description: `GPT model assessment score (${gptScore.toFixed(1)}%)`,
    });
  }

  // If we somehow have no component data but we do have a final score,
  // add a placeholder so the chart isn't empty
  if (componentData.length === 0 && finalScore > 0) {
    componentData.push({
      name: "Combined Score",
      score: finalScore,
      color: "#8b5cf6",
      description: `Final combined score (${finalScore.toFixed(1)}%)`,
    });
  }

  // Data for detailed KG methods
  const kgDetailData = Object.entries(methodScores)
    .filter(([method]) => method !== "txgnn")
    .map(([method, score]) => ({
      name: method.replace(/_/g, " "),
      score: score * 100,
      color: "#60a5fa",
      description: `${method.replace(/_/g, " ")} analyzer score`,
    }))
    .sort((a, b) => b.score - a.score);

  console.log("KG detail data:", kgDetailData);

  // Data for final composition pie chart
  const contributionData = [];

  // Only add contributions that actually exist and have positive values
  if (kgContribution > 0) {
    contributionData.push({
      name: "Knowledge Graph",
      value: kgContribution,
      color: "#60a5fa",
    });
  }

  if (txgnnContribution > 0) {
    contributionData.push({
      name: "TXGNN",
      value: txgnnContribution,
      color: "#34d399",
    });
  }

  if (gptContribution > 0) {
    contributionData.push({
      name: "GPT",
      value: gptContribution,
      color: "#f97316",
    });
  }

  // If we have no contribution data but a final score, add a placeholder
  if (contributionData.length === 0 && finalScore > 0) {
    contributionData.push({
      name: "Combined Score",
      value: finalScore,
      color: "#8b5cf6",
    });
  }

  console.log("Contribution data:", contributionData);

  // Explanation for users
  const getScoreExplanation = () => {
    let explanation = `The final repurposing score for ${result.drug} is calculated by combining multiple evidence sources with different weights:`;

    // Knowledge Graph section - only include if we have valid method scores
    if (kgDetailData.length > 0) {
      explanation += `\n\n1. Knowledge Graph Analysis: ${kgMethodsScore.toFixed(
        1
      )}%`;

      explanation += "\n   Including:";
      kgDetailData.forEach((item) => {
        explanation += `\n   • ${item.name}: ${item.score.toFixed(1)}%`;
      });

      if (kgWeight < 1) {
        explanation += `\n   Weight in final calculation: ${(
          kgWeight * 100
        ).toFixed(0)}%`;
        explanation += `\n   Contribution to final score: ${kgContribution.toFixed(
          1
        )} points`;
      }
    }

    // TXGNN section
    if (txgnnScore > 0) {
      explanation += `\n\n${
        kgDetailData.length > 0 ? "2" : "1"
      }. TXGNN Neural Network Score: ${txgnnScore.toFixed(1)}%`;
      explanation += `\n   Weight in final calculation: ${(
        txgnnWeight * 100
      ).toFixed(0)}%`;
      explanation += `\n   Contribution to final score: ${txgnnContribution.toFixed(
        1
      )} points`;
    }

    // GPT section
    if (gptScore > 0) {
      const num =
        (kgDetailData.length > 0 ? 1 : 0) + (txgnnScore > 0 ? 1 : 0) + 1;
      explanation += `\n\n${num}. GPT Analysis Score: ${gptScore.toFixed(1)}%`;
      explanation += `\n   Weight in final calculation: ${(
        gptWeight * 100
      ).toFixed(0)}%`;
      explanation += `\n   Contribution to final score: ${gptContribution.toFixed(
        1
      )} points`;
    }

    explanation += `\n\nFinal Score: ${finalScore.toFixed(1)}%`;

    // Formula explanation
    if (txgnnScore > 0 || gptScore > 0) {
      explanation += `\n\nFormula: `;

      if (txgnnScore > 0 && gptScore > 0) {
        explanation += `KG Score × ${(kgWeight * 100).toFixed(
          0
        )}% + TXGNN Score × ${(txgnnWeight * 100).toFixed(0)}% + GPT Score × ${(
          gptWeight * 100
        ).toFixed(0)}%`;
      } else if (txgnnScore > 0) {
        explanation += `KG Score × ${(kgWeight * 100).toFixed(
          0
        )}% + TXGNN Score × ${(txgnnWeight * 100).toFixed(0)}%`;
      } else if (gptScore > 0) {
        explanation += `KG Score × ${(kgWeight * 100).toFixed(
          0
        )}% + GPT Score × ${(gptWeight * 100).toFixed(0)}%`;
      }
    }

    return explanation;
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center">
          <Calculator size={18} className="mr-2 text-blue-600" />
          <span className="font-medium text-gray-800">
            Score Calculation Breakdown
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4">
          <div className="mb-4 bg-blue-50 p-3 rounded-lg flex items-start">
            <Info
              size={20}
              className="text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-blue-800">
              This breakdown shows how the final score of{" "}
              <span className="font-semibold">{finalScore.toFixed(1)}%</span> is
              calculated by combining knowledge graph analysis with AI model
              predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <PieChartIcon size={16} className="mr-2 text-purple-600" />
                Final Score Composition
              </h4>
              <div className="h-64 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={contributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                    >
                      {contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center text-sm text-gray-600">
                Hover over segments to see details
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Original Scores
              </h4>
              <div className="h-64 bg-gray-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={componentData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {componentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Individual Analyzer Scores Component */}
          <IndividualAnalyzerScores result={result} />

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">
              Score Calculation Explanation
            </h4>
            <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono bg-white p-3 rounded border border-gray-200">
              {getScoreExplanation()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;
