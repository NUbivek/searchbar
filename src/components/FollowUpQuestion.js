import React, { useState } from 'react';

const FollowUpQuestion = ({ onAsk, isLoading }) => {
  const [question, setQuestion] = useState('');

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Ask a follow-up question
      </h3>
      <div className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask for more details or clarification..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            onAsk(question);
            setQuestion('');
          }}
          disabled={isLoading || !question.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isLoading ? 'Processing...' : 'Ask'}
        </button>
      </div>
    </div>
  );
};

export default FollowUpQuestion; 