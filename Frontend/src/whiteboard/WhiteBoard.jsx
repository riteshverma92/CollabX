import React, { useEffect, useRef, useState } from "react";
import { objectManager } from "./core/objectManager.js";
import { render } from "./core/render.js";
import { ToolEngine } from "./core/toolEngine.js";
import { Tools } from "./tools/index.js";
import Toolbar from "./ui/Toolbar.jsx";

export default function WhiteBoard({ wsRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // viewport scale (state for UI) and a ref for consistent reads inside boardAPI
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale);

  // offset stored in ref (mutated directly)
  const offset = useRef({ x: 0, y: 0 });

  // preview object (for preview drawing)
  const [previewObj, setPreviewObj] = useState(null);

  // text overlay
  const [textInput, setTextInput] = useState(null);

  // active tool (default to pen so pointer flows create previews)
  const [activeTool, setActiveTool] = useState("pen");

  // drawing state (refs)
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // ToolEngine instance
  const toolEngine = useRef(null);

  // keep scaleRef in sync
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Board API — stable object provided to tools
  const boardAPI = useRef({});

  useEffect(() => {
    // stable board API object
    boardAPI.current = {
      get offset() {
        return offset.current;
      },
      set offset(v) {
        offset.current = v;
      },

      get startPos() {
        return startPos.current;
      },
      set startPos(v) {
        startPos.current = v;
      },

      get isDrawing() {
        return isDrawing.current;
      },
      set isDrawing(v) {
        isDrawing.current = v;
      },

      // invoked by tools to mark drawing started
      startDrawing: (e) => {
        isDrawing.current = true;
        startPos.current = boardAPI.current.toBoardCoords(e);
        try {
          canvasRef.current?.setPointerCapture(e.pointerId);
        } catch {}
      },

      stopDrawing: () => {
        isDrawing.current = false;
      },

      // convert a DOM pointer event to board (logical) coordinates using current scale + offset
      toBoardCoords: (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        return {
          x: (localX - offset.current.x) / (scaleRef.current || 1),
          y: (localY - offset.current.y) / (scaleRef.current || 1),
        };
      },

      setPreview: (obj) => {
        setPreviewObj({ ...obj });
      },

      clearPreview: () => setPreviewObj(null),

      openTextInput: (x, y) => {
        setTextInput({ x, y, value: "", visible: true });
      },

      broadcast: (type, payload) => {
        const ws = wsRef?.current;
        if (ws?.readyState === 1) {
          ws.send(JSON.stringify({ type, ...payload }));
        }
      },
    };
  }, [wsRef]);

  // initialize canvas, render loop and tool engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Create tool engine with stable board reference
    toolEngine.current = new ToolEngine(boardAPI.current, Tools);
    // ensure initial tool is set so pointerDown creates previews
    toolEngine.current.setTool(activeTool);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // reset transform to identity (we set transforms per-frame)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const dpr = window.devicePixelRatio || 1;

      // clear in device pixels then apply transforms
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // apply pan + zoom (offset is in CSS pixels)
      ctx.setTransform(
        dpr * scale,
        0,
        0,
        dpr * scale,
        offset.current.x * dpr,
        offset.current.y * dpr
      );

      render(ctx);

      if (previewObj) {
        // tools draw preview using their drawPreview via the ToolEngine
        toolEngine.current?.drawPreview(ctx);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    // subscribe so other parts can react (no-op here, loop redraws)
    const unsubscribe = objectManager.subscribe(() => {});

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsubscribe();
      window.removeEventListener("resize", resize);
      // clear tool engine on unmount
      toolEngine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* intentionally empty: internal refs handle updates */]);

  // update tool when activeTool changes
  useEffect(() => {
    if (toolEngine.current) {
      toolEngine.current.setTool(activeTool);
    }
  }, [activeTool]);

  // Pointer event handlers with guards (prevents null-preview runs)
  const onDown = (e) => {
    if (!toolEngine.current) return;
    toolEngine.current.pointerDown(e);
  };

  const onMove = (e) => {
    if (!toolEngine.current) return;
    toolEngine.current.pointerMove(e);
  };

  const onUp = (e) => {
    if (!toolEngine.current) return;
    toolEngine.current.pointerUp(e);
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Commit text overlay input (used by TextTool)
  const commitText = () => {
    if (!textInput?.value?.trim()) {
      setTextInput(null);
      return;
    }

    const obj = {
      id: "obj_" + Date.now(),
      type: "text",
      text: textInput.value,
      x: textInput.x,
      y: textInput.y,
      font: "18px Arial",
      fill: "#000",
    };

    objectManager.addObject(obj);
    boardAPI.current.broadcast("object:add", { object: obj });

    setTextInput(null);
  };

  // Zoom / Pan helpers
  const zoomIn = () => setScale((s) => Math.min(5, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.2, +(s - 0.1).toFixed(2)));
  const resetView = () => {
    offset.current = { x: 0, y: 0 };
    setScale(1);
  };

  // keep scaleRef updated
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  return (
    <div className="h-full w-full relative select-none">
      <Toolbar
        activeTool={activeTool}
        setTool={setActiveTool}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetView={resetView}
      />

      {textInput?.visible && (
        <input
          autoFocus
          className="absolute border p-1 bg-white z-50"
          style={{
            left: textInput.x * scale + offset.current.x,
            top: textInput.y * scale + offset.current.y,
          }}
          value={textInput.value}
          onChange={(e) =>
            setTextInput({ ...textInput, value: e.target.value })
          }
          onBlur={commitText}
          onKeyDown={(e) => e.key === "Enter" && commitText()}
        />
      )}

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", background: "#fff", touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      />
    </div>
  );
}
