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
    const pts = obj.points;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      // Catmull–Rom → Bézier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

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
