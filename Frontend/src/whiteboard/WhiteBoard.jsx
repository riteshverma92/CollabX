import React, { useEffect, useRef, useState } from "react";
import { objectManager } from "./core/objectManager.js";
import { render } from "./core/render.js";
import { ToolEngine } from "./core/toolEngine.js";
import { Tools } from "./tools/index.js";
import Toolbar from "./ui/Toolbar.jsx";

export default function WhiteBoard({ wsRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  const offset = useRef({ x: 0, y: 0 });

  const [textInput, setTextInput] = useState(null);
  const [activeTool, setActiveTool] = useState("pen");

  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const toolEngine = useRef(null);
  const previewRef = useRef(null);
  const previousTool = useRef(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const clearSelection = () => {
    // If you maintain a selected state somewhere, clear it.
    // objectManager.selected isn't part of core objectManager API I provided earlier;
    // if you implemented selection storage elsewhere, clear it here.
    if (objectManager.selected) objectManager.selected = null;
  };

  const boardAPI = useRef({});

  useEffect(() => {
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

      toBoardCoords: (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        return {
          x: (localX - offset.current.x) / scaleRef.current,
          y: (localY - offset.current.y) / scaleRef.current,
        };
      },

      setPreview: (obj) => (previewRef.current = obj),
      clearPreview: () => (previewRef.current = null),

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

  // --------------------------
  // Canvas Resize + Render Loop (robust)
  // --------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    toolEngine.current = new ToolEngine(boardAPI.current, Tools);
    toolEngine.current.setTool(activeTool);

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

    // observe both the immediate parent and the container (grandparent)
    const observer = new ResizeObserver(() => {
      // ResizeObserver may batch events; call resize next frame for safety
      requestAnimationFrame(resize);
    });

    // observe the wrapper (parent) which changes size with chat
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    // also observe the root container (grandparent) to catch layout shifts
    if (canvas.parentElement?.parentElement) {
      observer.observe(canvas.parentElement.parentElement);
    }

    // listen transitionend to catch tail of width transition
    const onTransitionEnd = (ev) => {
      // only respond to width changes to avoid many triggers
      if (ev.propertyName === "width") {
        requestAnimationFrame(resize);
      }
    };
    canvas.parentElement?.addEventListener("transitionend", onTransitionEnd);

    window.addEventListener("resize", resize);

    const loop = () => {
      const dpr = window.devicePixelRatio || 1;

      ctx.save();
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

      if (previewRef.current && toolEngine.current) {
        toolEngine.current.drawPreview(ctx);
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    const unsub = objectManager.subscribe(() => {});

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub();
      observer.disconnect();
      canvas.parentElement?.removeEventListener(
        "transitionend",
        onTransitionEnd
      );
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    toolEngine.current?.setTool(activeTool);
  }, [activeTool]);

  // --------------------------
  // Temporary Pan on Double Click: clears selection and enters pan until mouseup
  // --------------------------
  const startTemporaryPan = (e) => {
    clearSelection();

    previousTool.current = activeTool;
    setActiveTool("pan");

    // start pan immediately
    toolEngine.current?.pointerDown(e);

    // ensure resize in case UI toggles triggered near same time
    requestAnimationFrame(() => {
      const c = canvasRef.current;
      if (c && c.parentElement) {
        const ev = new Event("resize");
        window.dispatchEvent(ev);
      }
    });
  };

  // --------------------------
  // Pointer events
  // --------------------------
  const onDown = (e) => toolEngine.current?.pointerDown(e);
  const onMove = (e) => toolEngine.current?.pointerMove(e);

  const onUp = (e) => {
    toolEngine.current?.pointerUp(e);
    previewRef.current = null;

    // Restore tool after temporary pan
    if (previousTool.current && activeTool === "pan") {
      setActiveTool(previousTool.current);
      previousTool.current = null;
    }

    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // --------------------------
  // Text Commit
  // --------------------------
  const commitText = () => {
    if (!textInput?.value.trim()) {
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

  // --------------------------
  // Zoom + Reset
  // --------------------------
  const zoomIn = () => setScale((s) => Math.min(5, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.2, +(s - 0.1).toFixed(2)));
  const resetView = () => {
    offset.current = { x: 0, y: 0 };
    setScale(1);
  };

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
            transform: `translate(${offset.current.x + textInput.x * scale}px, 
                                   ${
                                     offset.current.y + textInput.y * scale
                                   }px)`,
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
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
          touchAction: "none",
          zIndex: 0, // <-- ADD THIS
          position: "relative", // <-- ADD THIS
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onDoubleClick={startTemporaryPan}
      />
    </div>
  );
}
