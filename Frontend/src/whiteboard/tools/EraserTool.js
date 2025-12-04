import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class EraserTool extends BaseTool {
  constructor(board) {
    super(board);
    this.isErasing = false;
    this.deletedSet = new Set(); // avoid double delete
  }

  onPointerDown(e) {
    this.isErasing = true;
    this.deleteUnderCursor(e);
  }

  onPointerMove(e) {
    if (!this.isErasing) return;
    this.deleteUnderCursor(e);
  }

  onPointerUp(e) {
    this.isErasing = false;
    this.deletedSet.clear();
  }

  deleteUnderCursor(e) {
    const { x, y } = this.board.toBoardCoords(e);
    const obj = objectManager.findAt(x, y);

    if (obj && !this.deletedSet.has(obj.id)) {
      this.deletedSet.add(obj.id);
      objectManager.deleteObject(obj.id);

      // Broadcast deletion
      this.board.broadcast("object:delete", { id: obj.id });
    }
  }
}
