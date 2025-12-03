// src/WhiteBoard/index.jsx
import React, { useEffect, useRef, useState } from "react";
import { objectManager } from "./engine/objectManager";
import { render } from "./engine/renderer";

/**
 * WhiteBoard component
 * Props:
 *   - wsRef: React ref object containing WebSocket instance (pass the ref, not .current)
 *
 * Preview is LOCAL only. On mouse-up we add object locally and call wsRef.current.send(...)
 */
export default function WhiteBoard({ wsRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [tool, setTool] = useState("none");
  const [previewObj, setPreviewObj] = useState(null);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // physical pixels
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      // CSS pixels
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // reset any transform and scale once
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // RAF loop: render objects then local preview on top
    const loop = () => {
      render(ctx);
      if (previewObj) drawPreview(ctx, previewObj);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    // subscribe to object changes so other modules can force immediate render if needed
    const unsub = objectManager.subscribe(() => { /* no-op: RAF will render */ });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewObj]);

  const drawPreview = (ctx, p) => {
    if (!p) return;
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);

    if (p.type === "rect") ctx.strokeRect(p.x, p.y, p.w, p.h);
    else if (p.type === "line") {
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
    } else if (p.type === "circle") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Pointer handlers
  const handleDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    start.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawing.current = true;

    // set an initial preview so user gets immediate feedback
    if (tool === "rect") setPreviewObj({ type: "rect", x: start.current.x, y: start.current.y, w: 0, h: 0 });
    if (tool === "line") setPreviewObj({ type: "line", x1: start.current.x, y1: start.current.y, x2: start.current.x, y2: start.current.y });
    if (tool === "circle") setPreviewObj({ type: "circle", x: start.current.x, y: start.current.y, r: 0 });

    // capture pointer so move/up events continue if pointer leaves canvas
    canvasRef.current.setPointerCapture?.(e.pointerId);
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    if (tool === "none") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;
    const { x, y } = start.current;

    if (tool === "rect") setPreviewObj({ type: "rect", x, y, w: x2 - x, h: y2 - y });
    else if (tool === "line") setPreviewObj({ type: "line", x1: x, y1: y, x2, y2 });
    else if (tool === "circle") {
      const r = Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);
      setPreviewObj({ type: "circle", x, y, r });
    }
  };

  const handleUp = (e) => {
    if (!drawing.current) return;
    drawing.current = false;

    // release capture
    try { canvasRef.current.releasePointerCapture?.(e.pointerId); } catch {}

    if (!previewObj) return;

    const finalObj = { id: "obj_" + Date.now(), ...previewObj, stroke: "black", strokeWidth: 2 };

    // add locally
    objectManager.addObject(finalObj);

    // send to server using live ref (important: use wsRef.current!)
    const ws = wsRef && wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "object:add", object: finalObj }));
    }

    // clear preview
    setPreviewObj(null);
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-50 p-2 bg-black text-white rounded flex gap-2">
        <button onClick={() => setTool("rect")} className={tool === "rect" ? "bg-blue-600 px-3 py-1 rounded" : "px-3 py-1 rounded bg-gray-700"}>Rect</button>
        <button onClick={() => setTool("circle")} className={tool === "circle" ? "bg-blue-600 px-3 py-1 rounded" : "px-3 py-1 rounded bg-gray-700"}>Circle</button>
        <button onClick={() => setTool("line")} className={tool === "line" ? "bg-blue-600 px-3 py-1 rounded" : "px-3 py-1 rounded bg-gray-700"}>Line</button>
        <button onClick={() => setTool("none")} className="px-3 py-1 rounded bg-gray-600">None</button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
      />
    </div>
  );
}
