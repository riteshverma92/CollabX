import React from "react";

export default function Toolbar({ activeTool, setTool, zoomIn, zoomOut, resetView }) {
  const ToolButton = (name, label, activeColor = "bg-blue-600") => (
    <button
      key={name}
      onClick={() => setTool(name)}
      className={`px-3 py-1 rounded transition 
        ${activeTool === name ? activeColor : "bg-gray-700 hover:bg-gray-600"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute top-4 left-4 z-50 px-3 py-2 bg-black/80 backdrop-blur text-white rounded-lg flex gap-2 shadow-lg">
      
      {ToolButton("rect", "Rect")}
      {ToolButton("circle", "Circle")}
      {ToolButton("line", "Line")}
      {ToolButton("pen", "Pen")}
      {ToolButton("eraser", "Erase", "bg-red-600")}
      {ToolButton("text", "Text", "bg-yellow-600")}
      {ToolButton("pan", "Pan", "bg-green-600")}

      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={zoomOut}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          -
        </button>

        <button
          onClick={zoomIn}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          +
        </button>

        <button
          onClick={resetView}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
