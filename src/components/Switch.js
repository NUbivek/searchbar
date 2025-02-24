import React from 'react';

export default function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span 
        className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
          checked ? 'left-6' : 'left-1'
        }`} 
      />
    </button>
  );
}
