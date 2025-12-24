import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class CircleTool extends BaseTool {
  constructor(board) {
    super(board);
    this.preview = null;
  }

  onPointerDown(e) {
    this.board.startDrawing(e);
    const { x, y } = this.board.toBoardCoords(e);
    this.preview = { type: "circle", x, y, r: 0 };
    this.board.setPreview(this.preview);
  }

  onPointerMove(e) {
    if (!this.board.isDrawing || !this.preview) return;

    const { x, y } = this.board.toBoardCoords(e);
    const s = this.board.startPos;

    this.preview.r = Math.hypot(x - s.x, y - s.y);
    this.board.setPreview(this.preview);
  }

  onPointerUp() {
    if (!this.preview) return;

    const obj = {
      id: "obj_" + Date.now(),
      ...this.preview,
      stroke: "#000",
      strokeWidth: 2,
    };

    objectManager.addObject(obj);
    this.board.broadcast("object:add", { object: obj });

    this.preview = null;
    this.board.clearPreview();
    this.board.stopDrawing();
  }

  drawPreview(ctx) {
    if (!this.preview) return;
  // NoW 
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(this.preview.x, this.preview.y, this.preview.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}


