import React, { useEffect, useRef, useState } from "react";
import { TOOLS } from "./tools";
import drawAllShapes from "./drawAllShape";
import getShapeObject from "./getShapeObject";
import isPointInsideShape from "./isPointInsideShape";

function Board({ wsRef, events }) {
  const canvasRef = useRef(null);
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
      // use parent element dimensions (wrapper) — this will change when chat opens/closes
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // only update when size actually changed (avoid unnecessary work)
      const newW = Math.max(1, Math.round(rect.width * dpr));
      const newH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === newW && canvas.height === newH) {
        return;
      }

      canvas.width = newW;
      canvas.height = newH;

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // reset transform to device pixels and then scale for drawing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    // initial resize
    resize();
   
  }, []);

  // REDRAW
  useEffect(() => {
    drawAllShapes(canvasRef.current, shapes);
  }, [shapes]);

  // WS EVENTS FROM PARENT
  useEffect(() => {
    if (!events) return;

    if (events.type === "init") setShapes(events.objects);
    if (events.type === "object:add")
      setShapes((p) => [...p, events.object]);
    if (events.type === "object:delete")
      setShapes((p) => p.filter((o) => o.id !== events.id));
  }, [events]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    startPos.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  const handleMouseMove = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === TOOLS.ERASER && !eraseLock.current) {
      const hit = shapes.find((s) => isPointInsideShape(x, y, s));
      if (hit) {
        eraseLock.current = true;
        wsRef.current.send(
          JSON.stringify({ type: "object:delete", id: hit.id })
        );
        setTimeout(() => (eraseLock.current = false), 200);
      }
      return;
    }

    if (!isDrawing.current) return;
    const preview = getShapeObject(tool, startPos.current, { x, y });
    drawAllShapes(canvasRef.current, shapes, preview);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

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
      <div style={{ position: "absolute", zIndex: 20, padding: 10, gap: 10 }}>
        <button onClick={() => setTool(TOOLS.RECT)}>Rectangle</button>
        <hr />
        <button onClick={() => setTool(TOOLS.CIRCLE)}>Circle</button>
        <hr />
        <button onClick={() => setTool(TOOLS.LINE)}>Line</button>
        <hr />
        <button onClick={() => setTool(TOOLS.ERASER)}>Eraser</button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
       style={{
          width: "100%",
          height: "100%",
          background: "#111",
          touchAction: "none",
          zIndex: 0, 
          position: "relative", 
        }}
      />
    </>
  );
}

export default Board;
