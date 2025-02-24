import React, { useState } from 'react';

export default function ChatInterface({ followUpQuestions, onAskQuestion }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      role: 'user',
      content: message
    };

    setChatHistory(prev => [...prev, newMessage]);
    onAskQuestion(message);
    setMessage('');
  };

  const handleQuestionClick = (question) => {
    const newMessage = {
      role: 'user',
      content: question
    };

    setChatHistory(prev => [...prev, newMessage]);
    onAskQuestion(question);
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Follow-up Questions */}
      {followUpQuestions?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Follow-up Questions</h3>
          <div className="flex flex-wrap gap-2">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}
