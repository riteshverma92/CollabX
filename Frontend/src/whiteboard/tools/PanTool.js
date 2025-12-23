import BaseTool from "./BaseTool.js";

export default class PanTool extends BaseTool {
  constructor(board) {
    super(board);
    this.dragging = false;
    this.start = null;
  }

  onPointerDown(e) {
    this.dragging = true;
    this.start = {
      x: e.clientX,
      y: e.clientY,
      offset: { ...this.board.offset }
    };

    try { e.target.setPointerCapture(e.pointerId); } catch {}
  }

  onPointerMove(e) {
    if (!this.dragging || !this.start) return;

    const dx = e.clientX - this.start.x;
    const dy = e.clientY - this.start.y;

    this.board.offset = {
      x: this.start.offset.x + dx,
      y: this.start.offset.y + dy,
    };
  }

  onPointerUp(e) {
    this.dragging = false;
    this.start = null;
    try { e.target.releasePointerCapture(e.pointerId); } catch {}
  }
}
