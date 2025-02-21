import { ChevronDown } from 'lucide-react';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const models = [
    { id: 'Perplexity', name: 'Perplexity-Online', description: 'Real-time web analysis' },
    { id: 'Mixtral-8x7B', name: 'Mixtral 8x7B', description: 'Powerful multi-expert model' },
    { id: 'Gemma-7B', name: 'Gemma 7B', description: 'Efficient Google model' },
    { id: 'DeepSeek-70B', name: 'DeepSeek 70B', description: 'Advanced reasoning model' }
  ];

  return (
    <div className="mb-6">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  );
} 