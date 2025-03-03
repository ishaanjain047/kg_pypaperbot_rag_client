import React from "react";

/**
 * Initial research query form component
 * @param {Object} props - Component properties
 * @param {string} props.query - Query text
 * @param {Function} props.setQuery - Query state setter
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.isProcessing - Whether query is processing
 * @param {boolean} props.isServerAlive - Whether server is online
 */
const QueryForm = ({
  query,
  setQuery,
  onSubmit,
  isProcessing,
  isServerAlive,
}) => {
  return (
    <form onSubmit={onSubmit} className="mb-8">
      <div className="flex flex-col space-y-2">
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
