const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Add this to utils/api.jsx searchDrugs function to process TXGNN results

// Modify the searchDrugs function to handle TXGNN scores
export const searchDrugs = async (query, filters = {}) => {
  try {
    console.log("Searching for:", query);
    console.log("With filters:", filters);

    // Add TXGNN-related parameters to the request
    const response = await fetch(`${API_BASE_URL}/api/repurpose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        disease: query,
        max_candidates: filters.maxCandidates || 500,
        min_score: filters.minScore || 0,
        analysis_types: filters.analysisTypes || undefined,
        use_txgnn: filters.analysisTypes?.txgnn !== false, // Use TXGNN unless explicitly disabled
        txgnn_weight: filters.txgnnWeight || 0.4, // Default TXGNN weight
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);

    // Check if top_candidates exists in the response
    if (!data.top_candidates || !Array.isArray(data.top_candidates)) {
      console.error(
        "Invalid response format: top_candidates missing or not an array"
      );
      return [];
    }

    // Helper function to format method scores for better readability
    const formatMethodScores = (methodScores) => {
      if (!methodScores || typeof methodScores !== "object") {
        return "No method scores available";
      }

      // Create an array of formatted score entries
      return Object.entries(methodScores)
        .map(([method, score]) => {
          // Format the method name to be more readable
          const formattedMethod = method
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          // Format the score as a percentage with 1 decimal place
          const formattedScore =
            typeof score === "number" ? `${(score * 100).toFixed(1)}%` : score;

          return `• ${formattedMethod}: ${formattedScore}`;
        })
        .join("\n");
    };

    // Helper function to format weights for better readability
    const formatWeights = (weights) => {
      if (!weights || typeof weights !== "object") {
        return "No weight data available";
      }

      return Object.entries(weights)
        .map(([method, weight]) => {
          const formattedMethod = method
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return `• ${formattedMethod}: ${weight}`;
        })
        .join("\n");
    };

    // Helper function to format evidence types list
    const formatEvidenceTypes = (types) => {
      if (!Array.isArray(types) || types.length === 0) {
        return "multiple analysis methods";
      }

      // Format each type to be more readable
      return types
        .map((type) => {
          return type
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        })
        .join(", ");
    };

    // Helper function to format methods list
    const formatMethods = (methods) => {
      if (!Array.isArray(methods) || methods.length === 0) {
        return "No method information available";
      }

      return methods
        .map((method) => {
          return `• ${method
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`;
        })
        .join("\n");
    };

    // Safely map over the top candidates
    const formattedResults = data.top_candidates.map((candidate) => {
      // Ensure score is a number
      const score =
        typeof candidate.combined_score === "number"
          ? +candidate.combined_score.toFixed(4)
          : typeof candidate.score === "number"
          ? +candidate.score.toFixed(4)
          : 0;

      // Format method scores for display
      const methodScoresFormatted = formatMethodScores(candidate.method_scores);

      // Format weights for display
      const weightsFormatted = formatWeights(
        candidate.weights_used || data.weights_used
      );

      // Format evidence types for display
      const evidenceTypesFormatted = formatEvidenceTypes(
        candidate.evidence_types
      );

      // Format methods list for display
      const methodsFormatted = formatMethods(candidate.found_in_methods);

      // Extract TXGNN score if available
      const txgnnScore =
        candidate.txgnn_score !== undefined
          ? candidate.txgnn_score
          : candidate.method_scores?.txgnn !== undefined
          ? candidate.method_scores.txgnn
          : null;

      // Check if TXGNN was used
      const usesTxgnn =
        txgnnScore !== null ||
        (candidate.evidence_types &&
          candidate.evidence_types.includes("txgnn"));

      return {
        disease: data.disease || query,
        drug: candidate.drug || "Unknown Drug",
        score: score,
        txgnn_score: txgnnScore,
        uses_txgnn: usesTxgnn,
        rank: candidate.rank || 0,
        evidence_types: Array.isArray(candidate.evidence_types)
          ? candidate.evidence_types
          : [],

        // Handle both array and dictionary formats for related data
        related_genes:
          typeof data.related_genes === "object"
            ? Array.isArray(data.related_genes)
              ? data.related_genes
              : candidate.drug && data.related_genes[candidate.drug]
              ? data.related_genes[candidate.drug]
              : []
            : [],

        related_phenotypes:
          typeof data.related_phenotypes === "object"
            ? Array.isArray(data.related_phenotypes)
              ? data.related_phenotypes
              : candidate.drug && data.related_phenotypes[candidate.drug]
              ? data.related_phenotypes[candidate.drug]
              : []
            : [],

        related_molecular_functions:
          typeof data.related_molecular_functions === "object"
            ? Array.isArray(data.related_molecular_functions)
              ? data.related_molecular_functions
              : candidate.drug &&
                data.related_molecular_functions[candidate.drug]
              ? data.related_molecular_functions[candidate.drug]
              : []
            : [],

        related_biological_processes:
          typeof data.related_biological_processes === "object"
            ? Array.isArray(data.related_biological_processes)
              ? data.related_biological_processes
              : candidate.drug &&
                data.related_biological_processes[candidate.drug]
              ? data.related_biological_processes[candidate.drug]
              : []
            : [],

        related_diseases:
          typeof data.related_diseases === "object"
            ? Array.isArray(data.related_diseases)
              ? data.related_diseases
              : candidate.drug && data.related_diseases[candidate.drug]
              ? data.related_diseases[candidate.drug]
              : []
            : [],
        summary:
          candidate.summary ||
          `${candidate.drug || "This drug"} is a repurposing candidate for ${
            data.disease || query
          } with a confidence score of ${score.toFixed(1)}.`,
        analysis: {
          drug_repurposing_recommendation:
            candidate.recommendation ||
            `${
              candidate.drug || "This drug"
            } is recommended as a potential repurposing candidate for ${
              data.disease || query
            } with a confidence score of ${score.toFixed(1)} out of 100.
            
This score represents the combined evidence from multiple computational analyses including gene associations, phenotype matching, pathway analysis${
              usesTxgnn ? ", and TXGNN modeling" : ""
            }.`,

          biological_evidence:
            candidate.biological_evidence ||
            `This recommendation is based on evidence from ${evidenceTypesFormatted}.

${
  Array.isArray(candidate.evidence_types) && candidate.evidence_types.length > 0
    ? `The drug shows promising biological connections to ${
        data.disease || query
      } through multiple mechanisms and pathways.`
    : ""
}

${usesTxgnn ? `TXGNN Score: ${(txgnnScore * 100).toFixed(1)}%\n` : ""}

Analysis Method Scores:
${methodScoresFormatted}`,

          mechanism_analysis:
            candidate.mechanism ||
            `The repurposing potential of ${
              candidate.drug || "this drug"
            } for ${
              data.disease || query
            } is supported by the following analysis methods:

${methodsFormatted}
${usesTxgnn ? `• TXGNN Neural Network Analysis` : ""}

The combined score reflects the following weights applied to each analysis method:
${weightsFormatted}
${usesTxgnn && data.txgnn_weight ? `• TXGNN: ${data.txgnn_weight}` : ""}

${
  score >= 75
    ? "This drug shows strong mechanistic support across multiple analysis methods."
    : score >= 50
    ? "This drug shows moderate mechanistic support in several analysis methods."
    : "This drug shows some mechanistic potential that warrants further investigation."
}`,

          scientific_support:
            candidate.references ||
            `This recommendation is based on knowledge graph analysis of biomedical literature and databases${
              usesTxgnn ? " combined with AI model predictions" : ""
            }.

The repurposing prediction incorporates evidence from:
• Gene associations between drug targets and disease genes
• Phenotypic similarities between drug effects and disease manifestations
• Biological pathway and molecular function overlaps
• Disease hierarchy and related disease treatment patterns${
              usesTxgnn ? "\n• TXGNN neural network predictive modeling" : ""
            }

${
  score >= 80
    ? "Strong computational evidence suggests this drug may be effective, but experimental validation is recommended."
    : score >= 60
    ? "Moderate computational evidence supports this drug as a repurposing candidate. Further investigation is warranted."
    : "Preliminary computational evidence suggests potential for repurposing. Consider as part of a broader investigation."
}`,
        },
      };
    });

    return formattedResults;
  } catch (error) {
    console.error("Error searching drugs:", error);
    throw error;
  }
};

/**
 * Get disease suggestions based on a search term
 * @param {string} query - Search term
 * @returns {Promise<Object>} - Response with disease suggestions
 */
export const getDiseaseSuggestions = async (query) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/disease-suggestions?query=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching disease suggestions:", error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const searchDiseases = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/diseases`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch diseases");
    return await response.json();
  } catch (error) {
    console.error("Error fetching diseases:", error);
    throw error;
  }
};

export const getDrugRepurposing = async (disease) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/repurpose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        disease: disease,
        max_candidates: 500,
      }),
    });
    if (!response.ok) throw new Error("Failed to get repurposing results");
    return await response.json();
  } catch (error) {
    console.error("Error getting repurposing results:", error);
    throw error;
  }
};

/**
 * Submit a research query to the backend
 * @param {string} query - Research query
 * @param {number} maxPapers - Maximum number of papers to download
 * @returns {Promise<Object>} - Response with session ID
 */
export const submitQuery = async (query, maxPapers = 3) => {
  console.log(
    `Sending query to ${API_BASE_URL}/api/query with maxPapers=${maxPapers}`
  );

  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, max_papers: maxPapers }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to start processing");
  }

  return response.json();
};

/**
 * Ask a question about the research
 * @param {string} sessionId - Session ID
 * @param {string} question - User question
 * @returns {Promise<Object>} - Response with answer and sources
 */
export const askQuestion = async (sessionId, question) => {
  console.log(`Sending question to ${API_BASE_URL}/api/ask:`, {
    session_id: sessionId,
    question,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, question }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Error response from ask endpoint:", data);
      throw new Error(
        data.error ||
          `Failed to get answer: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Network error in askQuestion:", error);
    throw error;
  }
};

/**
 * Cancel a session or operation
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
export const cancelSession = async (sessionId) => {
  await fetch(`${API_BASE_URL}/api/cancel/${sessionId}`, {
    method: "POST",
    credentials: "include",
  });
};

/**
 * Validate if a session exists and is active
 * @param {string} sessionId - Session ID to validate
 * @returns {Promise<Object>} - Response with session status
 */
export const validateSession = async (sessionId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/validate-session/${sessionId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  return response.json();
};

/**
 * Check if the server is available
 * @returns {Promise<boolean>} - True if server is available
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch (err) {
    console.error("Health check failed:", err);
    return false;
  }
};
