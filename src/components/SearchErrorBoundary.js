import React from 'react';

export default function SearchErrorBoundary({ children }) {
  return (
    <React.Fragment>
      {children}
      <div id="search-error-container" />
    </React.Fragment>
  );
}