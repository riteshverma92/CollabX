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

      {ToolButton("rect", "/rectangle.png")}
      {ToolButton("circle", "/record.png")}
      {ToolButton("line", "/line.png")}
      {ToolButton("pen", "/pencil.png")}
      {ToolButton("eraser", "/eraser.png")}
      {ToolButton("text", "/text-box.png")}
      {ToolButton("pan", "/hand.png")}

      <div className="flex items-center gap-2 ml-2">
        <button className="p-2 rounded bg-black/[0.5] hover:bg-gray-700" onClick={zoomOut}>
          <ZoomOut size={18} />
        </button>

        <button className="p-2 rounded bg-black/[0.5] hover:bg-gray-700" onClick={zoomIn}>
          <ZoomIn size={18} />
        </button>

        <button className="p-2 rounded bg-black/[0.5] hover:bg-gray-700" onClick={resetView}>
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
