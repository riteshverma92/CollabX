import React, { useEffect, useRef, useState } from "react";
import { TOOLS } from "./tools";
import drawAllShapes from "./drawAllShape";
import getShapeObject from "./getShapeObject";
import isPointInsideShape from "./isPointInsideShape";

function Board({ wsRef, events }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null); // ✅ for pen preview
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState(TOOLS.RECT);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const eraseLock = useRef(false);

  // CANVAS INIT
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const newW = Math.max(1, Math.round(rect.width * dpr));
      const newH = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width === newW && canvas.height === newH) return;

      canvas.width = newW;
      canvas.height = newH;

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      drawAllShapes(canvas, shapes);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [shapes]);

  // REDRAW
  useEffect(() => {
    drawAllShapes(canvasRef.current, shapes);
  }, [shapes]);

  // WS EVENTS FROM PARENT
  useEffect(() => {
    if (!events) return;

    if (events.type === "init") setShapes(events.objects);
    if (events.type === "object:add") setShapes((p) => [...p, events.object]);
    if (events.type === "object:delete")
      setShapes((p) => p.filter((o) => o.id !== events.id));
  }, [events]);

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
        startPos.current
      );
    }
  };

  const handleMouseMove = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    // ERASER
    if (tool === TOOLS.ERASER && eraseLock.current) {
      const hit = shapes.find((s) => isPointInsideShape(x, y, s));
      if (hit) {
        eraseLock.current = true;
        wsRef.current.send(
          JSON.stringify({ type: "object:delete", id: hit.id })
        );
      }
      return;
    }

    if (!isDrawing.current) return;

    // PEN (FREEHAND)
    if (tool === TOOLS.PEN) {
      previewRef.current = getShapeObject(
        TOOLS.PEN,
        startPos.current,
        { x, y },
        previewRef.current
      );
      drawAllShapes(canvasRef.current, shapes, previewRef.current);
      return;
    }

    // OTHER SHAPES
    const preview = getShapeObject(tool, startPos.current, { x, y });
    drawAllShapes(canvasRef.current, shapes, preview);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === TOOLS.ERASER) {
      handleDoubleclick();
    }

    // PEN FINALIZE
    if (tool === TOOLS.PEN && previewRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "object:add",
          object: {
            ...previewRef.current,
            id: crypto.randomUUID(),
          },
        })
      );
      previewRef.current = null;
      return;
    }

    // OTHER SHAPES FINALIZE
    const finalShape = {
      ...getShapeObject(tool, startPos.current, { x, y }),
      id: crypto.randomUUID(),
    };

    wsRef.current.send(
      JSON.stringify({ type: "object:add", object: finalShape })
    );
  };

  return (
    <>
<div className="absolute h-13 top-4 left-4 z-20 flex gap-2 bg-[#cfd3d3] backdrop-blur-md p-2 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
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
        transition-all duration-200 ease-out cursor-pointer
        ${
          tool === toolBtn.key
            ? "bg-[#d8cff4] shadow-inner shadow-gray-400 scale-[0.95]"
            : "bg-[#feffff] hover:bg-[#adacad] hover:scale-105"
        }
      `}
    >
      <img
        src={toolBtn.img}
        alt={toolBtn.key}
        className={`
          w-5 h-5 transition-all duration-200 ease-out
          ${
            tool === toolBtn.key
              ? "scale-150 rotate-[-3deg]"
              : "scale-100"
          }
        `}
      />
    </button>
  ))}
</div>


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
          zIndex: 0,
          position: "relative",
          display: "block",
          overflow: "hidden",
        }}
      />
    </>
  );
}

export default Board;
