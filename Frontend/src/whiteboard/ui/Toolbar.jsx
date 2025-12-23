import React from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function Toolbar({ activeTool, setTool, zoomIn, zoomOut, resetView }) {

  const ToolButton = (name, icon) => (
    <button
      key={name}
      onClick={() => setTool(name)}
      className={`p-2 rounded flex items-center justify-center transition
        bg-white
        ${activeTool === name ? "ring-2 ring-blue-500" : "hover:bg-gray-100"}
      `}
    >
      <img
        src={icon}
        alt={name}
        className={`w-5 h-5 transition-transform
          ${activeTool === name ? "scale-150" : "hover:scale-180"}
        `}
      />
    </button>
  );

  return (
    <div className="absolute top-4 left-4 z-50 px-3 py-2 bg-white rounded-lg flex gap-2 shadow-lg cursor-default">

     
      {ToolButton("circle", "/record.png")}
      

      
    </div>
  );
}
