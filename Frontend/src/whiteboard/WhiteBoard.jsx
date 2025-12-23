import React, { useEffect, useRef, useState } from "react";
import { objectManager } from "./core/objectManager.js";
import { render } from "./core/render.js";
import { ToolEngine } from "./core/toolEngine.js";
import { Tools } from "./tools/index.js";
import Toolbar from "./ui/Toolbar.jsx";

export default function WhiteBoard({ wsRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // ===== View state =====
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  // ===== Drawing state =====
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const previewRef = useRef(null);

  // ===== Tool engine =====
  const toolEngine = useRef(null);
  const [activeTool, setActiveTool] = useState("circle");

  // ===== Sync scale ref =====
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // ===== Board API exposed to tools =====
  const boardAPI = useRef({});

  useEffect(() => {
    boardAPI.current = {
      get offset() {
        return offset.current;
      },

      get startPos() {
        return startPos.current;
      },

      get isDrawing() {
        return isDrawing.current;
      },

      startDrawing(e) {
        isDrawing.current = true;
        startPos.current = boardAPI.current.toBoardCoords(e);
        try {
          canvasRef.current?.setPointerCapture(e.pointerId);
        } catch {}
      },

      stopDrawing() {
        isDrawing.current = false;
      },

      toBoardCoords(e) {
        const rect = canvasRef.current.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        return {
          x: (localX - offset.current.x) / scaleRef.current,
          y: (localY - offset.current.y) / scaleRef.current,
        };
      },

      setPreview(obj) {
        previewRef.current = obj;
      },

      clearPreview() {
        previewRef.current = null;
      },

      broadcast(type, payload) {
        const ws = wsRef?.current;
        if (ws?.readyState === 1) {
          ws.send(JSON.stringify({ type, ...payload }));
        }
      },
    };
  }, [wsRef]);

  // ===== Canvas setup + render loop =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    toolEngine.current = new ToolEngine(boardAPI.current, Tools);
    toolEngine.current.setTool(activeTool);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

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
    window.addEventListener("resize", resize);

    const loop = () => {
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(
        dpr * scaleRef.current,
        0,
        0,
        dpr * scaleRef.current,
        offset.current.x * dpr,
        offset.current.y * dpr
      );

      render(ctx);

      if (previewRef.current) {
        toolEngine.current?.drawPreview(ctx);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    const unsub = objectManager.subscribe(() => {});

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ===== Tool switching =====
  useEffect(() => {
    toolEngine.current?.setTool(activeTool);
  }, [activeTool]);

  // ===== Pointer handlers =====
  const onPointerDown = (e) => toolEngine.current?.pointerDown(e);
  const onPointerMove = (e) => toolEngine.current?.pointerMove(e);

  const onPointerUp = (e) => {
    toolEngine.current?.pointerUp(e);
    previewRef.current = null;

    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

 

  return (
    <div className="w-full h-full relative select-none">
      <Toolbar
        activeTool={activeTool}
        setTool={setActiveTool}
       
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          background: "#fff",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
