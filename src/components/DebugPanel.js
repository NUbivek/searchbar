import { useState, useEffect } from 'react';

export default function DebugPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="text-red-600">API Connection Error: {error}</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs">
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
} 