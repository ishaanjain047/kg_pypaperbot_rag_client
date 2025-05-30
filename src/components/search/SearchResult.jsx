import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Dna,
  Activity,
  Database,
  Grid,
  Zap,
  Brain,
  FileText,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import ScoreBreakdown from "./ScoreCard";
import QualitativeScoreBreakdown from "./QualitativeScoreBreakdown";

// Create a new Indication Badge component
const IndicationBadge = ({ isIndication }) => {
  return isIndication ? (
    <div className="rounded-full px-3 py-1 font-medium text-sm flex items-center bg-green-100 text-green-800">
      <Check size={14} className="mr-1" />
      Current Indication
    </div>
  ) : (
    <div className="rounded-full px-3 py-1 font-medium text-sm flex items-center bg-blue-100 text-blue-800">
      <AlertCircle size={14} className="mr-1" />
      Repurposing Candidate
    </div>
  );
};

// Create a new TXGNN Badge component
const TXGNNBadge = ({ score }) => {
  // Ensure score is a number
  const numericScore = typeof score === "number" ? score : 0;

  let color = "gray";
  if (numericScore >= 0.85) color = "green";
  else if (numericScore >= 0.75) color = "emerald";
  else if (numericScore >= 0.65) color = "blue";
  else if (numericScore >= 0.55) color = "yellow";
  else if (numericScore >= 0.45) color = "orange";
  else color = "red";

  const colorClasses = {
    green: "bg-green-100 text-green-800",
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  // Convert score to percentage with one decimal place
  const displayScore = (numericScore * 100).toFixed(1) + "%";

  return (
    <div
      className={`rounded-full px-3 py-1 font-medium text-sm flex items-center ${colorClasses[color]}`}
    >
      <Dna size={14} className="mr-1" />
      TXGNN: {displayScore}
    </div>
  );
};

const AnalysisSection = ({ title, content, icon: Icon }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          {Icon && <Icon size={20} className="text-blue-500 mr-3" />}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {content || "No data available."}
          </p>
        </div>
      )}
    </div>
  );
};

// Generic Chip component for displaying tags
const Chip = ({ text, icon: Icon, colorClass }) => {
  return (
    <div
      className={`inline-flex items-center ${colorClass} rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2`}
    >
      {Icon && <Icon size={14} className="mr-1" />}
      {text}
    </div>
  );
};

// Gene Chip component to display genes in a visually appealing way
const GeneChip = ({ gene }) => {
  return (
    <Chip text={gene} icon={Dna} colorClass="bg-indigo-50 text-indigo-700" />
  );
};

// Phenotype Chip component
const PhenotypeChip = ({ phenotype }) => {
  return (
    <Chip
      text={phenotype}
      icon={Activity}
      colorClass="bg-purple-50 text-purple-700"
    />
  );
};

// Biological Process Chip component
const ProcessChip = ({ process }) => {
  return (
    <Chip
      text={process}
      icon={Brain}
      colorClass="bg-emerald-50 text-emerald-700"
    />
  );
};

// Molecular Function Chip component
const FunctionChip = ({ func }) => {
  return <Chip text={func} icon={Zap} colorClass="bg-blue-50 text-blue-700" />;
};

// Disease Chip component
const DiseaseChip = ({ disease }) => {
  return (
    <Chip text={disease} icon={FileText} colorClass="bg-red-50 text-red-700" />
  );
};

const ItemGrid = ({
  items,
  ChipComponent,
  title,
  icon: Icon,
  colorClasses,
  maxDisplay = 20,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 italic">No information available</p>
      </div>
    );
  }

  const displayItems = showAll ? items : items.slice(0, maxDisplay);
  const hasMore = items.length > maxDisplay;

  return (
    <div className={`mb-6 ${colorClasses.bg} p-3 rounded-lg`}>
      <h3
        className={`${colorClasses.text} text-sm font-semibold flex items-center mb-2`}
      >
        {Icon && <Icon size={16} className="mr-2" />}
        {title}
      </h3>
      <p className={`text-xs ${colorClasses.textLight} mb-2`}>
        {items.length}{" "}
        {title.includes("Genes")
          ? "gene"
          : title.includes("Phenotypes")
          ? "phenotype"
          : title.includes("Processes")
          ? "biological process"
          : title.includes("Functions")
          ? "molecular function"
          : title.includes("Diseases")
          ? "disease"
          : ""}
        {items.length === 1 ? "" : "s"} specific to this drug
      </p>
      <div className="flex flex-wrap">
        {displayItems.map((item, index) => (
          <ChipComponent
            key={index}
            {...{ [ChipComponent.propName || "item"]: item }}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`mt-2 ${colorClasses.textButton} text-sm flex items-center hover:underline`}
        >
          {showAll ? (
            <>
              Show fewer {title.toLowerCase()}
              <ChevronUp size={16} className="ml-1" />
            </>
          ) : (
            <>
              Show all {items.length} {title.toLowerCase()}
              <ChevronDown size={16} className="ml-1" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Set prop names for each chip component
GeneChip.propName = "gene";
PhenotypeChip.propName = "phenotype";
ProcessChip.propName = "process";
FunctionChip.propName = "func";
DiseaseChip.propName = "disease";

// Score badge component with color based on score value
const ScoreBadge = ({ score }) => {
  // Ensure score is a number
  const numericScore = typeof score === "number" ? score : 0;

  let color = "gray";
  if (numericScore >= 90) color = "green";
  else if (numericScore >= 75) color = "emerald";
  else if (numericScore >= 60) color = "blue";
  else if (numericScore >= 40) color = "yellow";
  else if (numericScore >= 25) color = "orange";
  else color = "red";

  const colorClasses = {
    green: "bg-green-100 text-green-800",
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-center">
      <div
        className={`rounded-full px-3 py-1 font-medium text-sm ${colorClasses[color]}`}
      >
        {numericScore.toFixed(1)}
      </div>
      <div className="flex ml-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= Math.round(numericScore / 20) ? "#FFD700" : "none"}
            stroke={
              star <= Math.round(numericScore / 20) ? "#FFD700" : "#D1D5DB"
            }
            className={`${
              star <= Math.round(numericScore / 20)
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Evidence Type Badge
const EvidenceBadge = ({ type }) => {
  const badges = {
    gene: { bg: "bg-indigo-100", text: "text-indigo-800", icon: Dna },
    phenotype: { bg: "bg-purple-100", text: "text-purple-800", icon: Activity },
    disease_similarity: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: Activity,
    },
    disease_hierarchy: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      icon: Activity,
    },
    phenotype_gene: { bg: "bg-teal-100", text: "text-teal-800", icon: Dna },
    molecular_function: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: Zap,
    },
    biological_process: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: Brain,
    },
  };

  // Handle missing or invalid type
  if (!type || typeof type !== "string") {
    return (
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium text-xs flex items-center">
        <Activity size={12} className="mr-1" />
        unknown
      </span>
    );
  }

  const badge = badges[type] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: Activity,
  };
  const Icon = badge.icon;
  const displayName = type.replace(/_/g, " ");

  return (
    <span
      className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full font-medium text-xs flex items-center`}
    >
      <Icon size={12} className="mr-1" />
      {displayName}
    </span>
  );
};

export const SearchResult = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const [showRelatedData, setShowRelatedData] = useState(false);

  // Add near the beginning of your SearchResult component
  console.log("Full result object:", result);
  console.log("TXGNN score:", result.txgnn_score);
  console.log("Method scores:", result.method_scores);

  // Return fallback UI if result is null or not an object
  if (!result || typeof result !== "object") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Invalid Result
        </h3>
        <p className="text-gray-700">The result data is invalid or missing.</p>
      </div>
    );
  }

  // Check if this is a top candidate with expected properties
  const isTopCandidate = result.drug && result.disease;

  // For top candidates
  if (isTopCandidate) {
    // Check if it's an indication drug
    const isIndication = result.is_indication === true;

    // Define color classes for different item types
    const colorClassSets = {
      genes: {
        bg: "bg-indigo-50",
        text: "text-indigo-800",
        textLight: "text-indigo-700",
        textButton: "text-indigo-600",
      },
      phenotypes: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        textLight: "text-purple-700",
        textButton: "text-purple-600",
      },
      processes: {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        textLight: "text-emerald-700",
        textButton: "text-emerald-600",
      },
      functions: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        textLight: "text-blue-700",
        textButton: "text-blue-600",
      },
      diseases: {
        bg: "bg-red-50",
        text: "text-red-800",
        textLight: "text-red-700",
        textButton: "text-red-600",
      },
    };

    // Count how many related data categories are available
    const relatedDataCount = [
      result.related_genes?.length > 0,
      result.related_phenotypes?.length > 0,
      result.related_molecular_functions?.length > 0,
      result.related_biological_processes?.length > 0,
      result.related_diseases?.length > 0,
    ].filter(Boolean).length;

    // Enhanced score display to include qualitative analysis scores
    const ScoreDisplay = () => {
      const score = result.combined_score || result.score || 0;
      const hasQualitativeScores =
        result.qualitative_analysis &&
        (result.qualitative_analysis.gene_quality_score > 0 ||
          result.qualitative_analysis.biological_process_quality_score > 0 ||
          result.qualitative_analysis.molecular_function_quality_score > 0);

      // Calculate impact of qualitative analysis if available
      let scoreImpact = null;
      if (
        hasQualitativeScores &&
        typeof result.original_score !== "undefined"
      ) {
        const originalScore = result.original_score;
        const percentChange = ((score - originalScore) / originalScore) * 100;

        if (Math.abs(percentChange) >= 1) {
          scoreImpact = {
            change: percentChange,
            isPositive: percentChange > 0,
          };
        }
      }

      return (
        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-blue-600 mb-1">
            {score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mb-1">Combined Score</div>

          {hasQualitativeScores && (
            <div className="flex flex-col items-center mt-1">
              <div className="flex items-center">
                <Sparkles size={12} className="text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 font-medium">
                  Qualitative Analysis
                </span>
              </div>

              {scoreImpact && (
                <div
                  className={`text-xs font-medium mt-1 ${
                    scoreImpact.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scoreImpact.isPositive ? "+" : ""}
                  {scoreImpact.change.toFixed(1)}% score impact
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        className={`bg-white rounded-lg shadow-sm border ${
          isIndication ? "border-green-300" : "border-gray-200"
        } overflow-hidden transition-all hover:shadow-md`}
      >
        <div className={`p-1 ${isIndication ? "bg-green-50" : ""}`}>
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium text-sm">
                  Disease: {result.disease || "Unknown"}
                </span>
                <ArrowRight className="text-gray-400 hidden md:block" />
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm">
                  Drug: {result.drug || "Unknown"}
                </span>
              </div>

              {typeof result.combined_score !== "undefined" ? (
                <ScoreBadge score={result.combined_score} />
              ) : typeof result.score !== "undefined" ? (
                <ScoreBadge score={result.score} />
              ) : null}
            </div>

            {/* Display indication status and qualitative analysis badge */}
            <div className="mb-4 flex flex-wrap gap-2">
              <IndicationBadge isIndication={isIndication} />

              {/* Add Qualitative Analysis Badge if available */}
              {result.qualitative_analysis && (
                <div className="rounded-full px-3 py-1 font-medium text-sm flex items-center bg-purple-100 text-purple-800">
                  <Sparkles size={14} className="mr-1" />
                  Qualitative Analysis
                </div>
              )}
            </div>

            {/* Evidence types with optional TXGNN score badge */}
            {result.evidence_types &&
              Array.isArray(result.evidence_types) &&
              result.evidence_types.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Evidence types:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.evidence_types.map((type, idx) => (
                      <EvidenceBadge key={idx} type={type} />
                    ))}

                    {/* Add TXGNN Badge if score is available */}
                    {result.txgnn_score !== undefined &&
                      result.txgnn_score > 0 && (
                        <TXGNNBadge score={result.txgnn_score} />
                      )}
                  </div>
                </div>
              )}

            {result.summary && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Summary
                </h3>
                <p className="text-gray-700">{result.summary}</p>
              </div>
            )}

            {/* Related Data Button - Only show if there's related data */}
            {relatedDataCount > 0 && (
              <button
                onClick={() => setShowRelatedData(!showRelatedData)}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mb-3"
              >
                <Database size={16} className="mr-2" />
                {showRelatedData
                  ? `Hide ${result.drug} Biological Data`
                  : `Show ${result.drug}-Specific Biological Data (${relatedDataCount} categories)`}
                {showRelatedData ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>
            )}

            {/* Related Data Panels */}
            {showRelatedData && (
              <div className="mb-6 space-y-4">
                {result.related_genes?.length > 0 && (
                  <ItemGrid
                    items={result.related_genes}
                    ChipComponent={GeneChip}
                    title="Related Genes"
                    icon={Dna}
                    colorClasses={colorClassSets.genes}
                    maxDisplay={15}
                  />
                )}

                {result.related_phenotypes?.length > 0 && (
                  <ItemGrid
                    items={result.related_phenotypes}
                    ChipComponent={PhenotypeChip}
                    title="Related Phenotypes"
                    icon={Activity}
                    colorClasses={colorClassSets.phenotypes}
                    maxDisplay={15}
                  />
                )}

                {result.related_biological_processes?.length > 0 && (
                  <ItemGrid
                    items={result.related_biological_processes}
                    ChipComponent={ProcessChip}
                    title="Related Biological Processes"
                    icon={Brain}
                    colorClasses={colorClassSets.processes}
                    maxDisplay={15}
                  />
                )}

                {result.related_molecular_functions?.length > 0 && (
                  <ItemGrid
                    items={result.related_molecular_functions}
                    ChipComponent={FunctionChip}
                    title="Related Molecular Functions"
                    icon={Zap}
                    colorClasses={colorClassSets.functions}
                    maxDisplay={15}
                  />
                )}

                {result.related_diseases?.length > 0 && (
                  <ItemGrid
                    items={result.related_diseases}
                    ChipComponent={DiseaseChip}
                    title="Related Diseases"
                    icon={FileText}
                    colorClasses={colorClassSets.diseases}
                    maxDisplay={15}
                  />
                )}
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mt-2"
            >
              {expanded ? (
                <>
                  Show less
                  <ChevronUp size={16} className="ml-1" />
                </>
              ) : (
                <>
                  View detailed analysis
                  <ChevronDown size={16} className="ml-1" />
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-6 space-y-4">
                <ScoreDisplay />
                <ScoreBreakdown result={result} />
                {/* Add Qualitative Analysis Breakdown component */}
                {result.qualitative_analysis && (
                  <QualitativeScoreBreakdown result={result} />
                )}
                <AnalysisSection
                  title={
                    isIndication
                      ? "Indication Information"
                      : "Drug Repurposing Recommendation"
                  }
                  content={
                    isIndication
                      ? `${result.drug} is a current approved indication for ${
                          result.disease
                        }. The score of ${(
                          result.combined_score ||
                          result.score ||
                          0
                        ).toFixed(1)} reflects its established efficacy.`
                      : result.analysis?.drug_repurposing_recommendation ||
                        `${result.drug} is recommended as a potential repurposing candidate for ${result.disease}.`
                  }
                  icon={Star}
                />
                <AnalysisSection
                  title="Biological Evidence"
                  content={
                    result.analysis?.biological_evidence ||
                    "Evidence based on biological pathways and mechanisms."
                  }
                  icon={Dna}
                />
                <AnalysisSection
                  title="Mechanism Analysis"
                  content={
                    result.analysis?.mechanism_analysis ||
                    "The molecular mechanisms suggest therapeutic potential."
                  }
                  icon={Activity}
                />
                <AnalysisSection
                  title="Scientific Support"
                  content={
                    result.analysis?.scientific_support ||
                    "Based on knowledge graph analysis of biomedical literature."
                  }
                  icon={ExternalLink}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For combined results or other formats, display as JSON
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Analysis Result
      </h3>
      <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

export default SearchResult;
