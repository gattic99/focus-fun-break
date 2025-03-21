
import React from 'react';
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-focus-purple mx-auto mb-2"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">Unable to load game</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Button className="mt-4" onClick={onRetry || (() => window.location.reload())}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default LoadingState;
