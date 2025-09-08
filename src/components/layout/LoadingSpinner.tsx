import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-pure-white dark:bg-deep-charcoal">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-medium-gray dark:text-accent-gold text-lg">Loading...</p>
      </div>
    </div>
  );
}
