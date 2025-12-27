import React, { useEffect, useRef, useState } from "react";
import { TOOLS } from "./tools";
import drawAllShapes from "./drawAllShape";
import getShapeObject from "./getShapeObject";
import isPointInsideShape from "./isPointInsideShape";

function Board({ wsRef, events , shapes , setShapes }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);


  const [tool, setTool] = useState(TOOLS.RECT);

  const [strokeColor, setStrokeColor] = useState("#796A35");
  const [strokeSize, setStrokeSize] = useState(3);

  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const eraseLock = useRef(false);

  // ---------------- CANVAS INIT ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawAllShapes(canvas, shapes);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [shapes]);

  // ---------------- REDRAW ----------------
  useEffect(() => {
    if (!canvasRef.current) return;
    drawAllShapes(canvasRef.current, shapes);
  }, [shapes]);

  // ---------------- WS EVENTS ----------------
  useEffect(() => {
    if (!events) return;

    if (events.type === "init") setShapes(events.objects);
    if (events.type === "object:add") setShapes((p) => [...p, events.object]);
    if (events.type === "object:delete")
      setShapes((p) => p.filter((o) => o.id !== events.id));
  }, [events]);

  // ---------------- EVENTS ----------------
  const handleDoubleclick = () => {
    if (tool === TOOLS.ERASER) {
      eraseLock.current = !eraseLock.current;
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    startPos.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

    if (tool === TOOLS.PEN) {
      previewRef.current = getShapeObject(
        TOOLS.PEN,
        startPos.current,
        startPos.current,
        strokeColor,
        strokeSize
      );
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    // ERASER
    if (tool === TOOLS.ERASER && eraseLock.current) {
      const hit = shapes.find((s) => isPointInsideShape(x, y, s));
      if (hit) {
        wsRef.current.send(
          JSON.stringify({ type: "object:delete", id: hit.id })
        );
      }
      return;
    }

    if (!isDrawing.current) return;

    // PEN
    if (tool === TOOLS.PEN) {
      previewRef.current = getShapeObject(
        TOOLS.PEN,
        startPos.current,
        { x, y },
        strokeColor,
        strokeSize,
        previewRef.current
      );
      drawAllShapes(canvasRef.current, shapes, previewRef.current);
      return;
    }

    // OTHER SHAPES
    const preview = getShapeObject(
      tool,
      startPos.current,
      { x, y },
      strokeColor,
      strokeSize
    );
    drawAllShapes(canvasRef.current, shapes, preview);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    // PEN FINAL
    if (tool === TOOLS.PEN && previewRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "object:add",
          object: { ...previewRef.current, id: crypto.randomUUID() },
        })
      );
      previewRef.current = null;
      return;
    }

    // OTHER SHAPES FINAL
    const finalShape = {
      ...getShapeObject(
        tool,
        startPos.current,
        { x, y },
        strokeColor,
        strokeSize
      ),
      id: crypto.randomUUID(),
    };

    wsRef.current.send(
      JSON.stringify({ type: "object:add", object: finalShape })
    );
  };

  // ---------------- JSX ----------------
  return (
    <>
      {/* TOOLBAR */}
      <div
        className="
          absolute top-4 left-4 z-20
          flex items-center gap-3
          bg-[#cfd3d3]
          px-3 py-2
          rounded-xl
          shadow-[0_8px_20px_rgba(0,0,0,0.35)]
          
        "
      >
        {/* TOOLS */}
        <div className="flex items-center gap-2">
          {[
            { key: TOOLS.RECT, img: "/rectangle.png" },
            { key: TOOLS.CIRCLE, img: "/record.png" },
            { key: TOOLS.LINE, img: "/line.png" },
            { key: TOOLS.PEN, img: "/pencil.png" },
            { key: TOOLS.ERASER, img: "/eraser.png" },
          ].map((toolBtn) => (
            <button
              key={toolBtn.key}
              onClick={() => setTool(toolBtn.key)}
              className={`
                w-11 h-9 flex items-center justify-center rounded-md
                transition-all duration-150
                ${
                  tool === toolBtn.key
                    ? "bg-[#d8cff4] shadow-inner"
                    : "bg-[#feffff] hover:bg-[#adacad]"
                }
              `}
            >
              <img src={toolBtn.img} alt="" className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="h-7 w-px bg-black/25" />

        {/* COLOR */}
        <label className="relative w-8 h-8 cursor-pointer">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-full rounded-full border border-black/40"
            style={{ backgroundColor: strokeColor }}
          />
        </label>

        <div className="h-7 w-px bg-black/25" />

        {/* STROKE */}
        <div className="flex items-center gap-1 min-w-[80px]">
          <div className="flex items-center gap-1 bg-[#feffff] px-2 py-1 rounded-lg shadow">
            {/* DECREASE */}
            <button
              onClick={() => setStrokeSize((s) => Math.max(1, s - 1))}
              className="
      w-6 h-6 flex items-center justify-center
      rounded-md
      bg-[#e5e5e5]
      hover:bg-[#d1d1d1]
      transition
      text-sm font-semibold
      text-black
    "
            >
              ▼
            </button>

            {/* VALUE */}
            <span className="w-6 text-center text-sm font-medium text-black">
              {strokeSize}
            </span>

            {/* INCREASE */}
            <button
              onClick={() => setStrokeSize((s) => Math.min(20, s + 1))}
              className="
      w-6 h-6 flex items-center justify-center
      rounded-md
      bg-[#e5e5e5]
      hover:bg-[#d1d1d1]
      transition
      text-sm font-semibold
      text-black
    "
            >
              ▲
            </button>
          </div>
        </div>

         <div className="w-8 flex justify-center">
            <div
              className="rounded-full bg-black"
              style={{ width: strokeSize, height: strokeSize }}
            />
          </div>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleclick}
        style={{
          width: "100%",
          height: "100%",
          background: "#111",
          touchAction: "none",
          display: "block",
        }}
      />
    </>
  );
}

export default Board;
