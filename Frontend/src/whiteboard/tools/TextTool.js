import BaseTool from "./BaseTool.js";

export default class TextTool extends BaseTool {
  onPointerDown(e) {
    const { x, y } = this.board.toBoardCoords(e);
    this.board.openTextInput(x, y);
  }
}
