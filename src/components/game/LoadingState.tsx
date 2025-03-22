
import React from 'react';
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, error, onRetry }) => {
  console.log("LoadingState rendering with:", { isLoading, error });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="font-medium text-purple-800">Loading Office Escape game...</p>
          <p className="text-xs text-gray-500 mt-2">Get ready to collect coins and dodge obstacles!</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-2 font-medium">Unable to load game</p>
          <p className="text-sm text-gray-700 mb-4">{error}</p>
          <div className="text-xs text-gray-500 bg-gray-100 p-3 mb-3 rounded overflow-auto">
            <p>Debug info:</p>
            <ul className="list-disc pl-5 text-left">
              <li>Phaser globally available: {typeof window !== 'undefined' && window.Phaser ? 'Yes' : 'No'}</li>
              <li>Phaser module available: {typeof Phaser !== 'undefined' ? 'Yes' : 'No'}</li>
              <li>Browser: {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}</li>
            </ul>
          </div>
          <Button 
            className="mt-2" 
            onClick={onRetry || (() => window.location.reload())}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default LoadingState;
