import React from "react";

const Loading = () => {
  return (
    <div className="bg-gray-950 text-white flex items-center justify-center min-h-screen px-6 relative">

      {/* Background Glow */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 blur-[150px] rounded-full"></div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>

        {/* Text */}
        <p className="text-gray-300 text-lg tracking-wide animate-pulse">
          Loading...
        </p>
      </div>

    </div>
  );
};

export default Loading;
