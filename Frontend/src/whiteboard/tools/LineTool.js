import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class LineTool extends BaseTool {
  constructor(board) {
    super(board);
    this.preview = null;
  }

  onPointerDown(e) {
    this.board.startDrawing(e);
    const { x, y } = this.board.toBoardCoords(e);

    this.preview = { type: "line", x1: x, y1: y, x2: x, y2: y };
    this.board.setPreview(this.preview);
  }

  onPointerMove(e) {
    if (!this.board.isDrawing || !this.preview) return;

    const { x, y } = this.board.toBoardCoords(e);
    this.preview.x2 = x;
    this.preview.y2 = y;
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

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.preview.x1, this.preview.y1);
    ctx.lineTo(this.preview.x2, this.preview.y2);
    ctx.stroke();
    ctx.restore();
  }
}
