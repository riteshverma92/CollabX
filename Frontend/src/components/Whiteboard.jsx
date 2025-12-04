// src/components/Whiteboard.jsx
import React, { useRef, useState, useEffect } from "react";

/**
 * Whiteboard component
 * Props:
 *   - ws : WebSocket instance (optional) used to emit draw events
 *
 * This component exposes the drawing context globally as window.whiteboardCtx
 * so the RoomPage can use it to apply remote draw events.
 */
function Whiteboard({ ws }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen | line | rect | circle | eraser | text
  const [zoom, setZoom] = useState(1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Initialize canvas size & context
  useEffect(() => {
    const resize = () => {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
};

resize();

// 🔥 IMPORTANT: this triggers when chat open/close changes parent width
const observer = new ResizeObserver(() => resize());
observer.observe(canvas.parentElement);

window.addEventListener("resize", resize);

return () => {
  observer.disconnect();
  window.removeEventListener("resize", resize);
};


  }, []);

  // Emit helper
  const emit = (action, payload = {}) => {
    try {
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "draw", action, payload }));
      }
    } catch (err) {
      // ignore
    }
  };

  // Local drawing helpers
  const beginLocalPath = (x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const strokeTo = (x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const eraseAt = (x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // clear a small rect - take device pixel ratio into account via CSS pixel coords
    ctx.clearRect(x - 10, y - 10, 20, 20);
  };

  // Mouse events
  const handlePointerDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setStartPos({ x, y });

    if (tool === "text") return; // text handled on click

    setIsDrawing(true);
    beginLocalPath(x, y);
    emit("start", { tool, x, y });
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === "pen") {
      strokeTo(x, y);
      emit("move", { tool, x, y });
    } else if (tool === "eraser") {
      eraseAt(x, y);
      emit("move", { tool, x, y });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Shapes (line/rect/circle) are drawn on pointer up
    const ctx = ctxRef.current;
    if (!ctx) {
      setIsDrawing(false);
      return;
    }

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    } else if (tool === "circle") {
      const r = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    emit("end", { tool, x1: startPos.x, y1: startPos.y, x2: x, y2: y });

    setIsDrawing(false);
  };

  const handleCanvasClick = (e) => {
    if (tool !== "text") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const text = prompt("Enter text:");
    if (!text) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
    emit("text", { text, x, y });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emit("clear", {});
  };

  // Render
  return (
    <div ref={containerRef} className="relative h-full w-full bg-white">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded-lg flex gap-2 z-50">
        <button onClick={() => setTool("pen")} className={`px-2 py-1 rounded ${tool === "pen" ? "bg-blue-600" : "bg-gray-700"}`}>Pen</button>
        <button onClick={() => setTool("line")} className={`px-2 py-1 rounded ${tool === "line" ? "bg-blue-600" : "bg-gray-700"}`}>Line</button>
        <button onClick={() => setTool("rect")} className={`px-2 py-1 rounded ${tool === "rect" ? "bg-blue-600" : "bg-gray-700"}`}>Rect</button>
        <button onClick={() => setTool("circle")} className={`px-2 py-1 rounded ${tool === "circle" ? "bg-blue-600" : "bg-gray-700"}`}>Circle</button>
        <button onClick={() => setTool("eraser")} className={`px-2 py-1 rounded ${tool === "eraser" ? "bg-red-600" : "bg-gray-700"}`}>Eraser</button>
        <button onClick={() => setTool("text")} className={`px-2 py-1 rounded ${tool === "text" ? "bg-yellow-600" : "bg-gray-700"}`}>Text</button>

        <button onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))} className="px-2 py-1 rounded bg-purple-600">Zoom +</button>
        <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))} className="px-2 py-1 rounded bg-purple-600">Zoom -</button>

        <button onClick={handleClear} className="px-2 py-1 rounded bg-red-700">Clear</button>
      </div>

      {/* Canvas area; we apply zoom transform to the canvas container */}
      <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }} className="h-full w-full">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}

export default Whiteboard;
