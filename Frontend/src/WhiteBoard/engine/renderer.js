// src/WhiteBoard/engine/renderer.js
import { objectManager } from "./objectManager";

/**
 * Render objects. The canvas context passed in must be scaled for DPR already.
 * We clear using CSS pixel dimensions (canvas.width / dpr) so clearing is accurate.
 */
export function render(ctx) {
  if (!ctx) return;
  const canvas = ctx.canvas;
  const dpr = window.devicePixelRatio || 1;

  // clear in CSS pixels (ctx is scaled by dpr; clearing should use CSS coordinate space)
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  const objs = objectManager.getObjects();
  for (const obj of objs) {
    ctx.save();
    ctx.strokeStyle = obj.stroke || "black";
    ctx.lineWidth = obj.strokeWidth || 2;

    if (obj.type === "rect") {
      ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
    } else if (obj.type === "line") {
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
    } else if (obj.type === "circle") {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
