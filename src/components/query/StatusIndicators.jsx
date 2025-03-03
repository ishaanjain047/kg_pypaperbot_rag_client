import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { isSessionStuck } from "../../../utils/sessionStorage";

/**
 * Component for displaying error and status messages
 * @param {Object} props - Component properties
 * @param {string} props.error - Error message
 * @param {string} props.connectionStatus - EventSource connection status
 * @param {string} props.sessionId - Current session ID
 * @param {boolean} props.isProcessing - Whether processing is happening
 * @param {boolean} props.isServerAlive - Whether server is online
 * @param {Function} props.onReconnect - Reconnection handler
 * @param {string} props.apiBaseUrl - Base API URL
 */
const StatusIndicators = ({
  error,
  connectionStatus,
  sessionId,
  isProcessing,
  isServerAlive,
  onReconnect,
  apiBaseUrl,
}) => {
  const isStuck = isSessionStuck();

  return (
    <>
      {/* Debug info and server status */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>
          Server: {apiBaseUrl} | Connection: {connectionStatus}
          {sessionId && ` | Session: ${sessionId}`}
        </div>
        <div
          className={`flex items-center ${
            isServerAlive ? "text-green-600" : "text-red-600"
          }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${
              isServerAlive ? "bg-green-600" : "bg-red-600"
            }`}
          ></span>
          {isServerAlive ? "Server online" : "Server offline"}
        </div>
      </div>

      {/* Show warning if session is stuck */}
      {sessionId && isProcessing && isStuck && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded flex items-start">
          <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Session may be stuck</p>
            <p className="text-sm">
              No updates received in over a minute. You can try reconnecting or
              reset the session to start fresh.
            </p>
          </div>
        </div>
      )}

      {/* Server offline warning */}
      {!isServerAlive && sessionId && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">
            Server connection lost
          </h3>
          <p className="text-red-700 mb-3">
            The connection to the server has been lost. Your session data is
            saved locally and will resume when the server is available again.
          </p>
          <button
            onClick={onReconnect}
            className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            <RotateCcw size={16} className="mr-2" />
            Attempt to reconnect
          </button>
        </div>
      )}

      {/* Connection Error with Retry Button */}
      {error &&
        error.includes("Connection to server lost") &&
        isServerAlive && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">
              Connection issue
            </h3>
            <p className="text-amber-700 mb-3">
              {error} Your session is still active on the server.
            </p>
            <button
              onClick={onReconnect}
              className="flex items-center px-3 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
            >
              <RotateCcw size={16} className="mr-2" />
              Reconnect
            </button>
          </div>
        )}

      {/* Other error messages */}
      {error && !error.includes("Connection to server lost") && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </>
  );
};

export default StatusIndicators;
