import React, { useEffect, useRef, useState } from "react";
import { render } from "./core/render.js";
import { objectStore } from "./core/objectStore.js";
import { circleTool } from "./tools/CircleTool.js";

export default function WhiteBoard({ wsRef }) {
  const canvasRef = useRef(null);
  const toolRef = useRef(circleTool());

  const [shapes, setShapes] = useState([]);
  const [preview, setPreview] = useState(null);

  /* =====================
     STORE SUBSCRIPTION
  ===================== */
  useEffect(() => {
    return objectStore.subscribe(() => {
      setShapes(objectStore.get());
    });
  }, []);

  /* =====================
     CANVAS LOOP
  ===================== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const loop = () => {
      render(ctx, shapes);

      if (preview) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(preview.x, preview.y, preview.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(loop);
    };

    loop();
  }, [shapes, preview]);

  /* =====================
     POINTER HELPERS
  ===================== */
  const toPoint = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* =====================
     POINTER EVENTS
  ===================== */
  const onDown = (e) => {
    const p = toPoint(e);
    setPreview(toolRef.current.down(p));
  };

  const onMove = (e) => {
    const p = toPoint(e);
    const next = toolRef.current.move(p);
    if (next) setPreview({ ...next });
  };

  const onUp = () => {
    const obj = toolRef.current.up();
    if (obj) {
      objectStore.add(obj);
      wsRef?.current?.send(
        JSON.stringify({ type: "object:add", object: obj })
      );
    }
    setPreview(null);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", background: "#fff" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
    />
  );
}
