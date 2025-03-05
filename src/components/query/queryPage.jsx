import React, { useState, useEffect } from "react";

// Hooks
import useEventSource, { API_BASE_URL } from "../../hooks/useEventSource";
import useServerHealth from "../../hooks/useServerHealth";

// Utils
import {
  saveSessionToLocalStorage,
  loadSessionFromLocalStorage,
  clearSessionFromLocalStorage,
} from "../../../utils/sessionStorage";
import {
  submitQuery,
  askQuestion,
  cancelSession,
  validateSession,
  checkServerHealth,
} from "../../../utils/api.jsx";

// Components
import Header from "./Header";
import StatusIndicators from "./StatusIndicators";
import QueryForm from "./QueryForm";
import ProgressSection from "./ProgressSection";
import ConversationHistory from "./ConversationHistory";
import QuestionForm from "./QuestionForm";
import ResetConfirmationModal from "./ResetConfirmationModal";
import NewResearchModal from "./NewResearchModal";

/**
 * Main Research Assistant component
 */
const ResearchAssistant = () => {
  // State
  const [query, setQuery] = useState("");
  const [maxPapers, setMaxPapers] = useState(15); // Default to 15 papers
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentStage, setCurrentStage] = useState("");
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Not connected");
  const [conversations, setConversations] = useState([]);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);

  // Server health check using custom hook
  const isServerAlive = useServerHealth();

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedSession = loadSessionFromLocalStorage();
    if (savedSession) {
      try {
        setSessionId(savedSession.sessionId);
        setIsReady(savedSession.isReady || false);
        setConversations(savedSession.conversations || []);
        setIsProcessing(savedSession.isProcessing || false);
        setProgress(savedSession.progress || 0);
        setCurrentStage(savedSession.currentStage || "");
        setMessages(savedSession.messages || []);
        setMaxPapers(savedSession.maxPapers || 10); // Load saved maxPapers
        console.log("Restored session:", savedSession);
      } catch (err) {
        console.error("Failed to parse saved session:", err);
        clearSessionFromLocalStorage();
      }
    }
  }, []);

  // Validate session when server is alive and we have a sessionId
  useEffect(() => {
    const checkSession = async () => {
      if (!sessionId || sessionValidated || !isServerAlive) return;

      try {
        console.log("Validating session:", sessionId);
        const data = await validateSession(sessionId);

        if (data.valid) {
          console.log("Session validated successfully");
          setSessionValidated(true);

          // Update session state from server if available
          if (data.status) {
            setIsReady(data.status.isReady || isReady);
            setIsProcessing(data.status.isProcessing || isProcessing);
            setProgress(data.status.progress || progress);
            setCurrentStage(data.status.currentStage || currentStage);
          }
        } else {
          console.log("Session invalid or expired, clearing local state");
          // Don't show error when session has been intentionally reset or cleared
          if (
            error !==
            "Session has been reset. You can start a new research query."
          ) {
            handleSessionCleanup();
          }
        }
      } catch (err) {
        console.error("Error validating session:", err);
        // Don't clear session yet - it might be valid when server comes back
      }
    };

    if (isServerAlive && sessionId && !sessionValidated) {
      checkSession();
    }
  }, [
    sessionId,
    isServerAlive,
    sessionValidated,
    isReady,
    isProcessing,
    progress,
    currentStage,
    error,
  ]);

  // Connect to event stream when sessionId is available and validated
  const {
    data: eventData,
    status: eventSourceStatus,
    reconnect: reconnectEventSource,
  } = useEventSource(
    sessionId && isServerAlive ? `/api/events/${sessionId}` : null
  );

  // Monitor connection status
  useEffect(() => {
    setConnectionStatus(eventSourceStatus);

    // Show error if connection drops
    if (eventSourceStatus === "error" && sessionId && isServerAlive) {
      setError("Connection to server lost. Please try reconnecting.");
    }

    // Clear error if connection is restored
    if (
      eventSourceStatus === "open" &&
      error &&
      error.includes("Connection to server lost")
    ) {
      setError(null);
    }
  }, [eventSourceStatus, sessionId, isServerAlive, error]);

  // Process incoming events
  useEffect(() => {
    if (!eventData) return;

    console.log("Event received:", eventData);

    // Handle different event types
    switch (eventData.event) {
      case "stage_update":
        setCurrentStage(eventData.message);
        if (eventData.progress !== undefined) {
          setProgress(eventData.progress);
        }
        // Save progress state to localStorage
        saveSessionToLocalStorage({
          sessionId,
          isReady,
          conversations,
          isProcessing: true,
          progress: eventData.progress || progress,
          currentStage: eventData.message || currentStage,
          messages,
          maxPapers, // Save maxPapers with the session
        });
        break;

      case "status_update":
        const updatedMessages = [
          ...messages,
          { type: "status", text: eventData.message },
        ];
        setMessages(updatedMessages);

        if (eventData.progress !== undefined) {
          setProgress(eventData.progress);
        }

        // Save updated state to localStorage
        saveSessionToLocalStorage({
          sessionId,
          isReady,
          conversations,
          isProcessing,
          progress: eventData.progress || progress,
          currentStage,
          messages: updatedMessages,
          maxPapers, // Save maxPapers with the session
        });
        break;

      case "info":
        const newMessages = [
          ...messages,
          { type: "info", text: eventData.message },
        ];
        setMessages(newMessages);

        if (eventData.progress !== undefined) {
          setProgress(eventData.progress);
        }

        // Save updated state to localStorage
        saveSessionToLocalStorage({
          sessionId,
          isReady,
          conversations,
          isProcessing,
          progress: eventData.progress || progress,
          currentStage,
          messages: newMessages,
          maxPapers, // Save maxPapers with the session
        });
        break;

      case "warning":
        setMessages((prev) => [
          ...prev,
          { type: "warning", text: eventData.message },
        ]);
        break;

      case "error":
        setError(eventData.message);
        setIsProcessing(false);

        // Save updated state to localStorage
        saveSessionToLocalStorage({
          sessionId,
          isReady,
          conversations,
          isProcessing: false,
          progress,
          currentStage,
          messages,
          maxPapers, // Save maxPapers with the session
        });
        break;

      case "complete":
        setIsReady(true);
        setIsProcessing(false);
        setProgress(100);
        const completedMessages = [
          ...messages,
          { type: "success", text: eventData.message },
        ];
        setMessages(completedMessages);

        // Save completed state to localStorage
        saveSessionToLocalStorage({
          sessionId,
          isReady: true,
          conversations,
          isProcessing: false,
          progress: 100,
          currentStage,
          messages: completedMessages,
          maxPapers, // Save maxPapers with the session
        });
        break;

      case "connected":
        console.log("Connection established with server");
        if (error && error.includes("Connection to server lost")) {
          setError(null);
        }
        break;

      case "heartbeat":
        // Silently handle heartbeats
        break;

      default:
        console.log("Unhandled event type:", eventData.event);
        break;
    }
  }, [
    eventData,
    sessionId,
    isReady,
    conversations,
    isProcessing,
    progress,
    currentStage,
    messages,
    error,
    maxPapers, // Add maxPapers to the dependency list
  ]);

  // Helper function to clean up session completely
  const handleSessionCleanup = () => {
    setIsProcessing(false);
    setIsReady(false);
    setSessionId(null);
    setProgress(0);
    setMessages([]);
    // Don't clear error here - we might want to keep the reset confirmation message
    setQuery("");
    setQuestion("");
    setAnswer(null);
    setSources([]);
    setConversations([]);
    setSessionValidated(false);
    // Don't reset maxPapers to keep user preference

    // Remove from localStorage
    clearSessionFromLocalStorage();
  };

  // Function to show the new research confirmation modal
  const showNewResearchConfirmation = () => {
    setIsNewResearchModalOpen(true);
  };

  // Function to start a new research session
  const handleNewResearch = () => {
    setIsNewResearchModalOpen(false); // Close the modal first

    // Cancel current session if it exists
    if (sessionId && isServerAlive) {
      cancelSession(sessionId).catch((err) => {
        console.error("Error cancelling session on server:", err);
      });
    }

    // Clean up all state
    handleSessionCleanup();

    // Show confirmation message
    setError(null); // Clear any existing errors

    console.log("Starting new research session");
  };

  // Function to show the reset confirmation modal
  const showResetConfirmation = () => {
    setIsResetModalOpen(true);
  };

  // Function to completely reset the session state
  const handleResetSession = () => {
    setIsResetModalOpen(false); // Close the modal first

    // First try to cancel on server if we have a session and server is alive
    if (sessionId && isServerAlive) {
      cancelSession(sessionId).catch((err) => {
        console.error("Error cancelling session on server:", err);
      });
    }

    // Force cleanup regardless of server response
    handleSessionCleanup();

    // Show confirmation to user
    setError("Session has been reset. You can start a new research query.");

    // Clear error after 5 seconds
    setTimeout(() => {
      if (
        error === "Session has been reset. You can start a new research query."
      ) {
        setError(null);
      }
    }, 5000);

    console.log("Session forcefully reset");
  };

  // Function to end the current session
  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      if (isServerAlive) {
        await cancelSession(sessionId);
      }

      handleSessionCleanup();
      console.log("Session ended successfully");
    } catch (err) {
      console.error("Failed to end session:", err);
      // Still clean up locally even if server request fails
      handleSessionCleanup();
    }
  };

  // Function to reconnect to server
  const handleReconnect = async () => {
    // First check if server is available
    try {
      const serverAvailable = await checkServerHealth();

      if (serverAvailable) {
        setError(null);
        reconnectEventSource();
      } else {
        setError("Server is still unavailable. Please try again later.");
      }
    } catch (err) {
      setError(
        "Cannot connect to server. Please check if the server is running."
      );
    }
  };

  // Submit research query
  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !isServerAlive) return;

    setIsProcessing(true);
    setIsReady(false);
    setMessages([]);
    setProgress(0);
    setError(null);
    setCurrentStage("Initializing");

    try {
      // Pass maxPapers as part of the query
      const data = await submitQuery(query, maxPapers);

      const newSessionId = data.session_id;
      setSessionId(newSessionId);
      setSessionValidated(true);
      console.log("Session ID received:", newSessionId);

      // Save new session to localStorage
      saveSessionToLocalStorage({
        sessionId: newSessionId,
        isReady: false,
        conversations: [],
        isProcessing: true,
        progress: 0,
        currentStage: "Initializing",
        messages: [],
        maxPapers, // Save maxPapers with the session
      });
    } catch (err) {
      console.error("Error submitting query:", err);
      setError(err.message || "Network error");
      setIsProcessing(false);
    }
  };

  // Submit question to the assistant
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || !sessionId || !isReady || !isServerAlive) return;

    const currentQuestion = question;
    setQuestion(""); // Clear the input field immediately for UX
    setIsAnswerLoading(true);

    try {
      setAnswer("Searching for answer...");
      setSources([]);

      const data = await askQuestion(sessionId, currentQuestion);

      let newAnswer = "";
      let newSources = [];

      newAnswer = data.answer;
      newSources = data.sources || [];
      setAnswer(newAnswer);
      setSources(newSources);

      // Add to conversation history
      const newConversation = {
        question: currentQuestion,
        answer: newAnswer,
        sources: newSources,
        timestamp: new Date().toISOString(),
      };

      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);

      // Save updated conversations to localStorage
      saveSessionToLocalStorage({
        sessionId,
        isReady,
        conversations: updatedConversations,
        isProcessing,
        progress,
        currentStage,
        messages,
        maxPapers, // Save maxPapers with the session
      });

      // Clear loading state
      setIsAnswerLoading(false);
    } catch (err) {
      setAnswer(`Error: ${err.message || "Network error"}`);
      setIsAnswerLoading(false);
    }
  };

  // Cancel the operation
  const handleCancel = async () => {
    if (!sessionId || !isServerAlive) return;

    try {
      await cancelSession(sessionId);

      setIsProcessing(false);
      setProgress(0);
      const updatedMessages = [
        ...messages,
        { type: "info", text: "Operation canceled" },
      ];
      setMessages(updatedMessages);

      // Update localStorage
      saveSessionToLocalStorage({
        sessionId,
        isReady,
        conversations,
        isProcessing: false,
        progress: 0,
        currentStage,
        messages: updatedMessages,
        maxPapers, // Save maxPapers with the session
      });
    } catch (err) {
      setError("Failed to cancel: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-30 bg-white rounded-lg shadow-md">
      {/* Header with action buttons */}
      <Header
        sessionId={sessionId}
        isReady={isReady}
        onEndSession={handleEndSession}
        onResetSession={showResetConfirmation}
        onNewResearch={showNewResearchConfirmation}
      />

      {/* Status and error indicators */}
      <StatusIndicators
        error={error}
        connectionStatus={connectionStatus}
        sessionId={sessionId}
        isProcessing={isProcessing}
        isServerAlive={isServerAlive}
        onReconnect={handleReconnect}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Initial query form - only show if no active session */}
      {!sessionId && isServerAlive && (
        <QueryForm
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmitQuery}
          isProcessing={isProcessing}
          isServerAlive={isServerAlive}
          maxPapers={maxPapers}
          setMaxPapers={setMaxPapers}
        />
      )}

      {/* Progress section - show during processing */}
      {isProcessing && (
        <ProgressSection
          currentStage={currentStage}
          progress={progress}
          messages={messages}
          isServerAlive={isServerAlive}
          onCancel={handleCancel}
        />
      )}

      {/* Q&A Section - Only visible when processing is complete */}
      {isReady && (
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Ask About Your Research
          </h2>

          {/* Conversation History */}
          <ConversationHistory conversations={conversations} />

          {/* New Question Form */}
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleAskQuestion}
            isServerAlive={isServerAlive}
            isLoading={isAnswerLoading}
          />
        </div>
      )}

      {/* Reset confirmation modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetSession}
      />

      {/* New research confirmation modal */}
      <NewResearchModal
        isOpen={isNewResearchModalOpen}
        onClose={() => setIsNewResearchModalOpen(false)}
        onConfirm={handleNewResearch}
      />
    </div>
  );
};

export default ResearchAssistant;
