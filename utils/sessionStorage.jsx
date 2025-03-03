/**
 * Save complete session data to localStorage
 * @param {Object} sessionData - Session data to save
 */
export const saveSessionToLocalStorage = ({
  sessionId,
  isReady = false,
  conversations = [],
  isProcessing = false,
  progress = 0,
  currentStage = "",
  messages = [],
}) => {
  if (!sessionId) return;

  const data = {
    sessionId,
    isReady,
    conversations,
    isProcessing,
    progress,
    currentStage,
    messages,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem("researchSession", JSON.stringify(data));
  console.log("Saved session to localStorage:", data);
};

/**
 * Load session data from localStorage
 * @returns {Object|null} Session data or null if not found
 */
export const loadSessionFromLocalStorage = () => {
  const savedSession = localStorage.getItem("researchSession");

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch (err) {
    console.error("Failed to parse saved session:", err);
    localStorage.removeItem("researchSession");
    return null;
  }
};

/**
 * Clear session data from localStorage
 */
export const clearSessionFromLocalStorage = () => {
  localStorage.removeItem("researchSession");
  console.log("Cleared session from localStorage");
};

/**
 * Check if session appears to be stuck
 * @returns {boolean} True if session appears stuck
 */
export const isSessionStuck = () => {
  const savedSession = loadSessionFromLocalStorage();

  if (
    !savedSession ||
    !savedSession.isProcessing ||
    !savedSession.lastUpdated
  ) {
    return false;
  }

  // Consider session stuck if no updates for over a minute
  const lastUpdateTime = new Date(savedSession.lastUpdated).getTime();
  const currentTime = Date.now();
  const timeSinceLastUpdate = currentTime - lastUpdateTime;

  return timeSinceLastUpdate > 60000; // 1 minute
};
