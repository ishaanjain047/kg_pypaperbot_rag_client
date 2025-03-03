import React from "react";
import { FileText } from "lucide-react";

/**
 * Modal to confirm starting a new research project
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onConfirm - Function to confirm new research
 */
const NewResearchModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Start new research?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              This will clear all current research data and allow you to start a
              new session. Any in-progress operations will be canceled, and your
              current conversation history will be lost.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Start New Research
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewResearchModal;
