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
    this.points.push(pt);
    this.preview = { type: "pen", points: [...this.points] };

    this.board.setPreview(this.preview);
  }

  onPointerUp() {
    if (!this.preview) return;

    const obj = {
      id: "obj_" + Date.now(),
      type: "pen",
      points: [...this.points],
      stroke: "#000",
      strokeWidth: 2,
    };

    objectManager.addObject(obj);
    this.board.broadcast("object:add", { object: obj });

    this.points = [];
    this.preview = null;

    this.board.clearPreview();
    this.board.stopDrawing();
  }

  drawPreview(ctx) {
    if (!this.preview) return;

    const pts = this.preview.points;
    if (pts.length < 2) return;

    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    ctx.restore();
  }
}
