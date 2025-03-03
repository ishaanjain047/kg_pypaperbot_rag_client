import React, { useRef, useEffect } from "react";

/**
 * Question input form component
 * @param {Object} props - Component properties
 * @param {string} props.question - Current question text
 * @param {Function} props.setQuestion - Question state setter
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.isServerAlive - Whether server is online
 * @param {boolean} props.isLoading - Whether answer is loading
 */
const QuestionForm = ({
  question,
  setQuestion,
  onSubmit,
  isServerAlive,
  isLoading,
}) => {
  const inputRef = useRef(null);

  // Focus input field on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the research papers"
          className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={!isServerAlive || isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || !isServerAlive || isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Ask
        </button>
      </div>

      {/* Loading message when waiting for an answer */}
      {isLoading && (
        <div className="p-4 mt-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 animate-pulse">
          Searching through research papers for an answer...
        </div>
      )}
    </form>
  );
};

export default QuestionForm;
