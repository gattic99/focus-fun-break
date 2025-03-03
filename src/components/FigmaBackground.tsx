
import React from "react";

const FigmaBackground: React.FC = () => {
  return (
    <div className="w-full h-screen bg-white fixed top-0 left-0 z-0 overflow-hidden">
      {/* Figma-like UI elements */}
      <div className="w-full h-12 bg-[#2c2c2c] flex items-center px-4">
        <div className="w-3 h-3 rounded-full bg-red-500 mx-1"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 mx-1"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 mx-1"></div>
        <div className="ml-4 text-white text-sm">Untitled - Figma</div>
      </div>
      
      {/* Left sidebar */}
      <div className="w-12 h-[calc(100vh-48px)] bg-[#2c2c2c] fixed left-0 top-12 flex flex-col items-center py-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-6 h-6 rounded bg-gray-600 mb-4"></div>
        ))}
      </div>
      
      {/* Top toolbar */}
      <div className="h-10 bg-[#1e1e1e] fixed top-12 left-12 right-0 flex items-center px-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-8 h-6 rounded bg-gray-700 mx-1"></div>
        ))}
      </div>
      
      {/* Right panel */}
      <div className="w-64 h-[calc(100vh-48px)] bg-[#1e1e1e] fixed right-0 top-22 border-l border-gray-800">
        <div className="p-4">
          <div className="w-full h-6 rounded bg-gray-700 mb-4"></div>
          <div className="w-full h-40 rounded bg-gray-800 mb-4"></div>
          <div className="w-full h-6 rounded bg-gray-700 mb-2"></div>
          <div className="w-full h-6 rounded bg-gray-700 mb-2"></div>
          <div className="w-full h-6 rounded bg-gray-700 mb-4"></div>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="fixed left-12 top-22 right-64 bottom-0 bg-[#252525] flex items-center justify-center overflow-auto">
        <div className="w-[800px] h-[600px] bg-white shadow-lg relative">
          {/* Sample design elements */}
          <div className="absolute top-10 left-10 w-32 h-10 rounded bg-blue-500"></div>
          <div className="absolute top-40 left-10 w-64 h-4 bg-gray-800"></div>
          <div className="absolute top-50 left-10 w-48 h-4 bg-gray-600"></div>
          <div className="absolute top-100 left-10 w-80 h-80 rounded-lg bg-gray-100 flex flex-wrap p-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-32 h-32 rounded bg-gray-300 shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaBackground;
