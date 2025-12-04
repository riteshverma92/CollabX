import { objectManager } from "./objectManager.js";

export function render(ctx) {
  if (!ctx) return;

  const objects = objectManager.getObjects();

  for (const obj of objects) {
    ctx.save();

    ctx.strokeStyle = obj.stroke || "#000";
    ctx.lineWidth = obj.strokeWidth || 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    switch (obj.type) {
      case "rect":
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(obj.x1, obj.y1);
        ctx.lineTo(obj.x2, obj.y2);
        ctx.stroke();
        break;

      case "pen":
        if (obj.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          obj.points.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
        break;

      case "text":
        ctx.font = obj.font || "18px Arial";
        ctx.fillStyle = obj.fill || "#000";
        ctx.fillText(obj.text, obj.x, obj.y);
        break;
    }

    ctx.restore();
  }
}
