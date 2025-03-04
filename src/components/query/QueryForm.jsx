import React from "react";

/**
 * Initial research query form component
 * @param {Object} props - Component properties
 * @param {string} props.query - Query text
 * @param {Function} props.setQuery - Query state setter
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.isProcessing - Whether query is processing
 * @param {boolean} props.isServerAlive - Whether server is online
 * @param {number} props.maxPapers - Maximum number of papers to download
 * @param {Function} props.setMaxPapers - Function to update maxPapers state
 */
const QueryForm = ({
  query,
  setQuery,
  onSubmit,
  isProcessing,
  isServerAlive,
  maxPapers,
  setMaxPapers,
}) => {
  return (
    <form onSubmit={onSubmit} className="mb-8">
      <div className="flex flex-col space-y-4">
        <label htmlFor="query" className="font-medium">
          Research Topic:
        </label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isProcessing}
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
              max="10"
              step="1"
              value={maxPapers}
              onChange={(e) => setMaxPapers(parseInt(e.target.value))}
              disabled={isProcessing}
              className="flex-grow"
            />
            <span className="text-sm">10</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !query.trim() || !isServerAlive}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Start Research
        </button>
      </div>
    </form>
  );
};

export default QueryForm;
