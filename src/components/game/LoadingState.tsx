
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-focus-purple mx-auto mb-2"></div>
          <p>Loading game...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">Unable to load game</p>
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <div className="text-xs text-gray-400 bg-gray-100 p-2 mb-3 rounded max-w-md overflow-auto">
            <p>Debug info: Phaser available: {typeof Phaser !== 'undefined' ? 'Yes' : 'No'}</p>
          </div>
          <Button className="mt-2" onClick={onRetry || (() => window.location.reload())}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default LoadingState;
