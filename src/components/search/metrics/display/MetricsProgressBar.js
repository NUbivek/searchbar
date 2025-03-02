import React from 'react';

/**
 * Component to display a progress bar for metrics
 * @param {Object} props
 * @param {number} props.value - Value between 0 and 1
 * @param {string} props.label - Label for the metric
 * @param {string} props.color - Color for the progress bar
 * @param {string} props.size - Size of the progress bar (sm, md, lg)
 */
const MetricsProgressBar = ({ 
  value = 0, 
  label = "", 
  color = "blue", 
  size = "md"
}) => {
  // Ensure value is between 0 and 1
  const safeValue = Math.max(0, Math.min(1, value));
  const percentage = Math.round(safeValue * 100);
  
  // Determine height based on size
  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  }[size] || "h-2";
  
  // Determine color classes
  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      track: "bg-blue-100"
    },
    green: {
      bg: "bg-green-500",
      track: "bg-green-100"
    },
    red: {
      bg: "bg-red-500",
      track: "bg-red-100"
    },
    yellow: {
      bg: "bg-yellow-500",
      track: "bg-yellow-100"
    },
    purple: {
      bg: "bg-purple-500",
      track: "bg-purple-100"
    },
    gray: {
      bg: "bg-gray-500",
      track: "bg-gray-100"
    }
  }[color] || {
    bg: "bg-blue-500",
    track: "bg-blue-100"
  };
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className="text-xs font-medium text-gray-500">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${heightClass} ${colorClasses.track} rounded-full overflow-hidden`}>
        <div 
          className={`${heightClass} ${colorClasses.bg} rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MetricsProgressBar;
