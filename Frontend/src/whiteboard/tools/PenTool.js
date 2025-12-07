import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class PenTool extends BaseTool {
  constructor(board) {
    super(board);
    this.points = [];
    this.preview = null;
  }

  onPointerDown(e) {
    this.board.startDrawing(e);

    const pt = this.board.toBoardCoords(e);
    this.points = [pt];

    this.preview = { type: "pen", points: [...this.points] };
    this.board.setPreview(this.preview);
  }

  onPointerMove(e) {
    if (!this.board.isDrawing) return;

    const pt = this.board.toBoardCoords(e);
    const last = this.points[this.points.length - 1];

    // Avoid useless ultra-dense points
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    if (dist < 1) return;  // skip micro moves

    // Smooth new point with last (low-pass filter)
    const alpha = 0.35;
    const smooth = {
      x: last.x * (1 - alpha) + pt.x * alpha,
      y: last.y * (1 - alpha) + pt.y * alpha
    };

    this.points.push(smooth);

    this.preview = { type: "pen", points: this.points };
    this.board.setPreview(this.preview);
  }

  onPointerUp() {
    if (!this.preview) return;

    const obj = {
      id: "obj_" + Date.now(),
      type: "pen",
      points: [...this.points],
      stroke: "#000",
      strokeWidth: 2
    };

    objectManager.addObject(obj);
    this.board.broadcast("object:add", { object: obj });

    this.board.clearPreview();
    this.board.stopDrawing();

    this.points = [];
    this.preview = null;
  }

  drawPreview(ctx) {
    if (!this.preview) return;
    const pts = this.preview.points;
    if (pts.length < 2) return;

    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    // Catmull–Rom spline → smooth curves that follow points
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();
    ctx.restore();
  }
}
