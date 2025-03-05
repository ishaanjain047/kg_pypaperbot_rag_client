import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const UltraSimpleResearchAssistant = () => {
  // State
  const [query, setQuery] = useState("");
  const [maxPapers, setMaxPapers] = useState(3); // Default to 3 papers
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [isChecking, setIsChecking] = useState(false); // New state for check button
  const [lastProgressUpdate, setLastProgressUpdate] = useState(null); // Track last progress update
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Check if enough time has passed since processing started
  useEffect(() => {
    if (isLoading && processingStartTime) {
      // Set up an interval to check if the assistant is ready every 30 seconds
      const interval = setInterval(async () => {
        const currentSessionId = localStorage.getItem("researchSessionId");
        if (!currentSessionId) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/validate-session/${currentSessionId}`
          );
          const data = await response.json();

          if (data.valid && data.status && data.status.isReady) {
            // Session is valid and ready
            setIsLoading(false);
            setIsReady(true);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error in automatic readiness check:", error);
        }
      }, 30000); // Check every 30 seconds

      // Also set up a fallback timer in case the backend doesn't respond
      const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
        setIsReady(true);
      }, 480000); // 8 minutes as fallback

      return () => {
        clearInterval(interval);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isLoading, processingStartTime, API_BASE_URL]);

  // Initialize on component mount
  useEffect(() => {
    // Check for existing session
    const savedSessionId = localStorage.getItem("researchSessionId");
    const savedQuery = localStorage.getItem("researchQuery");
    const savedStartTime = localStorage.getItem("processingStartTime");

    if (savedSessionId && savedQuery) {
      // If we have session data, restore it
      setQuery(savedQuery);

      if (savedStartTime) {
        const startTime = parseInt(savedStartTime, 10);
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        // If it's been more than 7 minutes since we started, assume ready
        if (elapsedTime >= 420000) {
          setIsReady(true);
        } else {
          // Otherwise, we're still loading
          setIsLoading(true);
          setProcessingStartTime(startTime);
        }
      }
    }
  }, []);

  // Handle submitting the research query
  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setIsReady(false);
    setAnswer(null);
    setError(null);

    const startTime = Date.now();
    setProcessingStartTime(startTime);

    try {
      // Send the query to the backend
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, max_papers: maxPapers }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start processing");
      }

      // Get the session ID
      const data = await response.json();

      // Store the session ID and query in localStorage
      localStorage.setItem("researchSessionId", data.session_id);
      localStorage.setItem("researchQuery", query);
      localStorage.setItem("processingStartTime", startTime.toString());

      // At this point, we're successfully processing
      // We'll wait for the timer to eventually set isReady to true
    } catch (error) {
      setError(error.message || "Failed to process query");
      setIsLoading(false);
      setProcessingStartTime(null);
    }
  };

  // Handle asking a question
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || !isReady) return;

    // Retrieve the session ID from localStorage
    const sessionId = localStorage.getItem("researchSessionId");
    if (!sessionId) {
      setError("Session not found. Please start a new research query.");
      return;
    }

    setAnswer("Searching for answer...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          question,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        // If the session is not found, instruct user to start a new session
        if (response.status === 404) {
          setError(
            "Your research session has expired. Please start a new research query."
          );
          setIsReady(false);
          return;
        }

        throw new Error(data.error || "Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer found");
      setQuestion(""); // Clear the input field
    } catch (error) {
      setAnswer(`Error: ${error.message || "Network error"}`);
    }
  };

  // Check with the backend if the agent is ready
  const checkIfReady = async () => {
    const currentSessionId = localStorage.getItem("researchSessionId");
    if (!currentSessionId) {
      setError("Session not found. Please start a new research query.");
      return;
    }

    try {
      // Set checking state to show loading indicator
      setIsChecking(true);

      // Clear previous messages
      setError(null);

      // Show feedback immediately
      setAnswer("Checking if research assistant is ready...");

      // Add a delay to ensure the backend has time to process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `${API_BASE_URL}/api/validate-session/${currentSessionId}`,
        {
          // Only add timeout without custom headers that trigger CORS issues
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Validation response:", data);

      if (data.valid && data.status && data.status.isReady) {
        // Session is valid and ready
        setIsLoading(false);
        setIsReady(true);
        setAnswer("Research assistant is ready! You can now ask questions.");
      } else if (data.valid) {
        // Session is valid but not ready
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor(
          (currentTime - processingStartTime) / 1000
        );
        const progress = data.status.progress || 0;

        // Save the progress update
        setLastProgressUpdate({
          time: new Date().toLocaleTimeString(),
          progress: progress,
          stage: data.status.currentStage || "Processing",
        });

        setAnswer(`The research assistant is still working (${progress}% complete).
Current stage: ${data.status.currentStage || "Processing"}
Time elapsed: ${elapsedSeconds} seconds
Typical completion time: 5-8 minutes`);
      } else {
        // Session is not valid
        setAnswer(
          "The session couldn't be found on the server. You may need to start a new research query."
        );
      }
    } catch (error) {
      console.error("Error checking readiness:", error);
      // Provide more specific error message
      if (error.name === "AbortError") {
        setAnswer(
          "Request timed out while checking. The server might be busy. Please try again in a moment."
        );
      } else {
        setAnswer(
          `Failed to check if the assistant is ready: ${error.message}`
        );
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Start a new session
  const startNewSession = () => {
    setIsLoading(false);
    setIsReady(false);
    setQuery("");
    setQuestion("");
    setAnswer(null);
    setError(null);
    setProcessingStartTime(null);

    // Clear localStorage
    localStorage.removeItem("researchSessionId");
    localStorage.removeItem("researchQuery");
    localStorage.removeItem("processingStartTime");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Research Paper Assistant</h1>

        {/* Only show New Research button if we're ready or loading */}
        {(isReady || isLoading) && (
          <button
            onClick={startNewSession}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Research
          </button>
        )}
      </div>

      {/* Error messages */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Initial query form - only show if not loading or ready */}
      {!isLoading && !isReady && (
        <form onSubmit={handleSubmitQuery} className="mb-8">
          <div className="flex flex-col space-y-4">
            <label htmlFor="query" className="font-medium">
              Research Topic:
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research topic or keywords"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <label htmlFor="maxPapers" className="font-medium">
                  Maximum Papers to Download:
                </label>
                <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                  {maxPapers} {maxPapers === 1 ? "paper" : "papers"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">1</span>
                <input
                  id="maxPapers"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={maxPapers}
                  onChange={(e) => setMaxPapers(parseInt(e.target.value))}
                  className="flex-grow"
                />
                <span className="text-sm">5</span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Start Research
            </button>
          </div>
        </form>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-center text-blue-800 mb-2">
            Setting up Research Assistant
          </h2>
          <p className="text-center text-blue-600 mb-4">
            Please wait while we download and process research papers on your
            topic. This typically takes approximately 5-8 minutes.
          </p>

          <div className="flex justify-center">
            <button
              onClick={checkIfReady}
              disabled={isChecking}
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center`}
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Checking...
                </>
              ) : (
                "Check if it's ready"
              )}
            </button>
          </div>

          {/* Display last progress update if available */}
          {lastProgressUpdate && (
            <div className="mt-2 mb-2 text-center text-sm text-blue-700">
              <p>
                Last update at {lastProgressUpdate.time}:{" "}
                <strong>{lastProgressUpdate.progress}%</strong> complete
              </p>
              <p>Stage: {lastProgressUpdate.stage}</p>
            </div>
          )}

          <div className="mt-4 bg-blue-100 p-3 rounded text-sm text-blue-700">
            <p>
              <strong>What's happening:</strong> We're downloading up to{" "}
              {maxPapers} research papers related to "{query}" and preparing an
              AI research assistant to answer your questions.
            </p>
          </div>
        </div>
      )}

      {/* Q&A Section - Only visible when ready */}
      {isReady && (
        <div className="border-t pt-6 mt-6">
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Research Assistant Ready
            </h2>
            <p className="text-green-700">
              You can now ask questions about your research topic "{query}".
            </p>
          </div>

          {/* Question form */}
          <form onSubmit={handleAskQuestion} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the research papers"
                className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Ask
              </button>
            </div>
          </form>

          {/* Answer display */}
          {answer && (
            <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Status:</h3>
              <div className="text-gray-800 whitespace-pre-wrap">{answer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UltraSimpleResearchAssistant;
