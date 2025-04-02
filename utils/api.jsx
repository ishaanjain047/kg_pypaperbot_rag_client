const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Add this to utils/api.jsx searchDrugs function to process TXGNN results

export const testHello = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hello`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Hello test failed:", error);
    throw error;
  }
};
// Update the searchDrugs function in utils/api.jsx

// Update the searchDrugs function in utils/api.jsx

export const searchDrugs = async (query, filters = {}) => {
  try {
    console.log("Searching for:", query);
    console.log("With filters:", filters);

    // Add include_indications parameter to include indication drugs
    const response = await fetch(`${API_BASE_URL}/api/repurpose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        disease: query,
        max_candidates: filters.maxCandidates || 500,
        min_score: filters.minScore || 0,
        analysis_types: filters.analysisTypes || undefined,
        use_txgnn: filters.analysisTypes?.txgnn !== false, // Use TXGNN unless explicitly disabled
        txgnn_weight: filters.txgnnWeight || 0.4, // Default TXGNN weight
        include_indications: true  // Always include indication drugs
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

    // Safely map over the top candidates
    const formattedResults = data.top_candidates.map((candidate) => {
      // Ensure score is a number
      const score =
        typeof candidate.combined_score === "number"
          ? +candidate.combined_score.toFixed(4)
          : typeof candidate.score === "number"
          ? +candidate.score.toFixed(4)
          : 0;

      // Extract if this is an indication drug
      const isIndication = candidate.is_indication === true;

      // Extract TXGNN score if available
      const txgnnScore =
        candidate.txgnn_score !== undefined
          ? candidate.txgnn_score
          : candidate.method_scores?.txgnn !== undefined
          ? candidate.method_scores.txgnn
          : 0;

      // Extract GPT score if available
      const gptScore =
        candidate.gpt_score !== undefined ? candidate.gpt_score : 0;

      // Get all individual analyzer scores, ensuring each one exists
      // even if it's zero
      const analyzerScores = {};

      // Make sure every common analyzer has a score (even if zero)
      const commonAnalyzers = [
        "gene",
        "phenotype",
        "disease_similarity",
        "disease_hierarchy",
        "phenotype_gene",
        "molecular_function",
        "biological_process",
      ];

      // Populate all common analyzers with 0 first
      commonAnalyzers.forEach((analyzer) => {
        analyzerScores[analyzer] = 0;
      });

      // Then update with actual values from method_scores
      if (candidate.method_scores) {
        Object.entries(candidate.method_scores).forEach(([analyzer, score]) => {
          // Store original score as a number between 0-100
          analyzerScores[analyzer] =
            typeof score === "number" ? score * 100 : 0;
        });
      }

      // Add TXGNN and GPT explicitly
      analyzerScores.txgnn = txgnnScore * 100;
      analyzerScores.gpt = gptScore * 100;

      return {
        disease: data.disease || query,
        drug: candidate.drug || "Unknown Drug",
        score: score,
        txgnn_score: txgnnScore,
        gpt_score: gptScore,
        is_indication: isIndication,  // Add indication flag
        evidence_types: Array.isArray(candidate.evidence_types)
          ? candidate.evidence_types
          : [],
        method_scores: candidate.method_scores || {},
        analyzer_scores: analyzerScores,
        weights_used: candidate.weights_used || data.weights_used || {},
        ensemble_factor: candidate.ensemble_factor,
        consistency_factor: candidate.consistency_factor,
        original_score: candidate.original_score,
        metrics: candidate.metrics || {},
        found_in_methods: candidate.found_in_methods || [],

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
          `${candidate.drug || "This drug"} is a ${isIndication ? "current indication" : "repurposing candidate"} for ${
            data.disease || query
          } with a confidence score of ${score.toFixed(1)}.`,
        analysis: {
          drug_repurposing_recommendation:
            candidate.recommendation ||
            `${
              candidate.drug || "This drug"
            } is ${isIndication ? "a current approved indication" : "recommended as a potential repurposing candidate"} for ${
              data.disease || query
            } with a confidence score of ${score.toFixed(1)} out of 100.
            
  ${isIndication ? "This drug is already approved for this indication." : `This score represents the combined evidence from multiple computational analyses including gene associations, phenotype matching, pathway analysis${
    txgnnScore > 0 ? ", and TXGNN modeling" : ""
  }.`}`,

          biological_evidence:
            candidate.biological_evidence ||
            `${isIndication ? "As an approved indication, this drug has established biological evidence for efficacy." : "This recommendation is based on evidence from multiple analyses."}`,

          mechanism_analysis:
            candidate.mechanism ||
            `${isIndication ? "As a current indication, the mechanism of action for this drug is already established." : "The repurposing potential needs to be validated through experimental studies."}`,

          scientific_support:
            candidate.references ||
            `${isIndication ? "This drug is already approved and used clinically for this disease." : "This recommendation is based on computational analysis and would require further validation."}`,
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
        credentials: "include",
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
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      credentials: "include",
    });
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
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch (err) {
    console.error("Health check failed:", err);
    return false;
  }
};
