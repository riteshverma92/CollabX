import BaseTool from "./BaseTool.js";
import { objectManager } from "../core/objectManager.js";

export default class EraserTool extends BaseTool {
  onPointerDown(e) {
    const { x, y } = this.board.toBoardCoords(e);
    const obj = objectManager.findAt(x, y);

    if (obj) {
      objectManager.deleteObject(obj.id);
      this.board.broadcast("object:delete", { id: obj.id });
    }
  }
}
