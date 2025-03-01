import React, { useState, useEffect } from 'react';

/**
 * ConsoleLogger component to display console logs in the UI
 * Useful for debugging when you can't access browser console
 */
const ConsoleLogger = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    // Override console methods
    console.log = function() {
      originalConsole.log.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      );
      setLogs(prev => [...prev, { type: 'log', content: args.join(' '), time: new Date() }]);
    };

    console.warn = function() {
      originalConsole.warn.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      );
      setLogs(prev => [...prev, { type: 'warn', content: args.join(' '), time: new Date() }]);
    };

    console.error = function() {
      originalConsole.error.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      );
      setLogs(prev => [...prev, { type: 'error', content: args.join(' '), time: new Date() }]);
    };

    console.info = function() {
      originalConsole.info.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      );
      setLogs(prev => [...prev, { type: 'info', content: args.join(' '), time: new Date() }]);
    };

    // Cleanup
    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
    };
  }, []);

  // Keep only the last 50 logs
  const recentLogs = logs.slice(-50);

  const getLogStyle = (type) => {
    switch(type) {
      case 'error': return { color: '#ef4444', fontWeight: 'bold' };
      case 'warn': return { color: '#f59e0b', fontWeight: 'bold' };
      case 'info': return { color: '#3b82f6' };
      default: return { color: '#374151' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '600px',
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '10px',
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Console Logs</h3>
        <button 
          onClick={() => setLogs([])}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
      <div>
        {recentLogs.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>No logs to display</p>
        ) : (
          recentLogs.map((log, index) => (
            <div key={index} style={{ 
              fontSize: '13px', 
              fontFamily: 'monospace', 
              padding: '4px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#6b7280', marginRight: '8px' }}>
                [{log.time.toLocaleTimeString()}]
              </span>
              <span style={getLogStyle(log.type)}>
                {log.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsoleLogger;
