import React from "react";
import { LogOut, RefreshCw, FileText } from "lucide-react";

/**
 * Application header with action buttons
 * @param {Object} props - Component properties
 * @param {string} props.sessionId - Current session ID
 * @param {boolean} props.isReady - Whether a session is ready
 * @param {Function} props.onEndSession - End session handler
 * @param {Function} props.onResetSession - Reset session handler
 * @param {Function} props.onNewResearch - New research handler
 */
const Header = ({
  sessionId,
  isReady,
  onEndSession,
  onResetSession,
  onNewResearch,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Research Paper Assistant</h1>

      <div className="flex gap-2">
        {/* Always show New Research button */}
        <button
          onClick={onNewResearch}
          className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded border border-green-300 hover:bg-green-100"
          title="Start a new research query"
        >
          <FileText size={16} className="mr-1" />
          New Research
        </button>

        {/* Always show reset button */}
        <button
          onClick={onResetSession}
          className="flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded border border-amber-300 hover:bg-amber-100"
          title="Reset session if stuck"
        >
          <RefreshCw size={16} className="mr-1" />
          Reset
        </button>

        {/* Only show End Session when ready */}
        {sessionId && isReady && (
          <button
            onClick={onEndSession}
            className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded border border-red-300 hover:bg-red-100"
          >
            <LogOut size={16} className="mr-1" />
            End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
