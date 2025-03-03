import React from "react";

/**
 * Display conversation history between user and assistant
 * @param {Object} props - Component properties
 * @param {Array} props.conversations - Array of conversation items
 */
const ConversationHistory = ({ conversations }) => {
  if (!conversations || conversations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-6">
      {conversations.map((conv, index) => (
        <div key={index} className="border-b pb-4">
          <div className="font-medium text-blue-700 mb-2">
            Q: {conv.question}
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border mb-2">
            {conv.answer}
          </div>

          {/* Conversation Sources */}
          {conv.sources && conv.sources.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-1">Sources:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {conv.sources.map((source, idx) => (
                  <li key={idx} className="mb-1">
                    <div className="font-medium">{source.title}</div>
                    {source.journal && (
                      <div className="text-xs">Journal: {source.journal}</div>
                    )}
                    {source.publication_date && (
                      <div className="text-xs">
                        Published: {source.publication_date}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationHistory;
