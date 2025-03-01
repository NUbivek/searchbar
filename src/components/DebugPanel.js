import React from 'react';
import { useDebugMode } from '../utils/debug';

const DebugPanel = ({ data }) => {
  const debugMode = useDebugMode();
  
  if (!debugMode) return null;
  
  return (
    <div className="debug-panel">
      <h3>Debug Information</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DebugPanel; 