// core/render.js
export function render(ctx, shapes) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const s of shapes) {
    if (s.type === "circle") {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.strokeStyle = s.stroke || "#000";
      ctx.lineWidth = s.strokeWidth || 2;
      ctx.stroke();
    }
  }
}
