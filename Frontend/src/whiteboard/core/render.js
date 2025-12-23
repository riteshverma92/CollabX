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
     

      case "circle":
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2);
        ctx.stroke();
        break;

    }

    ctx.restore();
  }
}
