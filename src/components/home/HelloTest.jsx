import React, { useState } from "react";
import { testHello } from "../../../utils/api";

const HelloTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await testHello();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">CORS Test</h2>
      <button
        onClick={handleTestClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Testing..." : "Test Hello Endpoint"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="font-semibold">Success!</p>
          <pre className="mt-2 bg-white p-2 rounded border">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HelloTest;
