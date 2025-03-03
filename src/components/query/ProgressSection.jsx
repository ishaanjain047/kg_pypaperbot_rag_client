import React from "react";
import { XCircle } from "lucide-react";

/**
 * Progress indicator section with status messages
 * @param {Object} props - Component properties
 * @param {string} props.currentStage - Current processing stage
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {Array} props.messages - Status messages
 * @param {boolean} props.isServerAlive - Whether server is online
 * @param {Function} props.onCancel - Cancel operation handler
 */
const ProgressSection = ({
  currentStage,
  progress,
  messages,
  isServerAlive,
  onCancel,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">{currentStage}</h2>
        <button
          onClick={onCancel}
          className="text-red-600 flex items-center"
          disabled={!isServerAlive}
        >
          <XCircle size={18} className="mr-1" />
          Cancel
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Progress details */}
      <div className="max-h-60 overflow-y-auto border rounded p-3 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`py-1 ${
              message.type === "info"
                ? "text-blue-700"
                : message.type === "warning"
                ? "text-yellow-700"
                : message.type === "error"
                ? "text-red-700"
                : message.type === "success"
                ? "text-green-700"
                : "text-gray-700"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSection;
