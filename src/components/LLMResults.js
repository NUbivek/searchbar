import React from 'react';
import ReactMarkdown from 'react-markdown';

const LLMResults = ({ results, query, onFollowUpSearch, loading }) => {
  // Extract LLM-generated content from results
  const findLLMContent = () => {
    if (!results || !Array.isArray(results)) return null;
    
    // Handle chat history format
    const assistantMessages = results.filter(msg => msg.type === 'assistant');
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      
      // Handle different content formats
      if (typeof lastMessage.content === 'string') {
        return { summary: lastMessage.content };
      }
      
      if (Array.isArray(lastMessage.content)) {
        // Look for synthesized answer in array
        const synthesizedAnswer = lastMessage.content.find(item => item.synthesizedAnswer);
        if (synthesizedAnswer) return synthesizedAnswer.synthesizedAnswer;
      }
      
      if (lastMessage.content && typeof lastMessage.content === 'object') {
        if (lastMessage.content.synthesizedAnswer) {
          return lastMessage.content.synthesizedAnswer;
        }
        return lastMessage.content;
      }
    }
    
    // Handle direct synthesized answer format
    const synthesizedResult = results.find(r => r.synthesizedAnswer);
    if (synthesizedResult) return synthesizedResult.synthesizedAnswer;
    
    return null;
  };
  
  const llmContent = findLLMContent();
  
  if (!llmContent) {
    return (
      <div className="p-4 text-gray-500 italic">
        No AI-generated content available
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2 text-blue-800">AI Response</h3>
        
        <div className="prose max-w-none">
          <ReactMarkdown>{llmContent.summary || ''}</ReactMarkdown>
        </div>
        
        {/* Display sections if available */}
        {llmContent.sections && llmContent.sections.length > 0 && (
          <div className="mt-4">
            {llmContent.sections.map((section, idx) => (
              <div key={idx} className="mt-3">
                {section.heading && (
                  <h4 className="font-medium text-blue-700">{section.heading}</h4>
                )}
                <div className="prose max-w-none mt-1">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Display sources if available */}
        {llmContent.sources && llmContent.sources.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700">Sources:</h4>
            <ul className="mt-1 space-y-1">
              {llmContent.sources.map((source, idx) => (
                <li key={idx} className="text-sm">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                  {source.source && <span className="ml-1 text-gray-500">({source.source})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Display follow-up questions if available */}
        {llmContent.followUpQuestions && llmContent.followUpQuestions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700">Follow-up questions:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {llmContent.followUpQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpSearch(question)}
                  className="text-sm bg-white hover:bg-gray-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-full"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMResults; 