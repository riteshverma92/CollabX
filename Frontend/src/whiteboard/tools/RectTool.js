import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class RectTool extends BaseTool {
  constructor(board) {
    super(board);
    this.preview = null;
  }

  onPointerDown(e) {
    this.board.startDrawing(e);
    const { x, y } = this.board.toBoardCoords(e);

    this.preview = { type: "rect", x, y, w: 0, h: 0 };
    this.board.setPreview(this.preview);
  }

  onPointerMove(e) {
    if (!this.board.isDrawing) return;
    if (!this.preview) return; // ✔ prevents crashing

    const { x, y } = this.board.toBoardCoords(e);
    const start = this.board.startPos;

    this.preview.w = x - start.x;
    this.preview.h = y - start.y;

    this.board.setPreview(this.preview);
  }

  onPointerUp(e) {
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
    const p = this.preview;

    ctx.save();
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = "red";
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.restore();
  }
}
