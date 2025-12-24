// import BaseTool from "./BaseTool.js";

// export default class TextTool extends BaseTool {
//   onPointerDown(e) {
//     const { x, y } = this.board.toBoardCoords(e);
//     this.board.openTextInput(x, y);
//   }
// }



import BaseTool from "./BaseTool.js";

export default class TextTool extends BaseTool {
  onPointerDown(e) {
    // STOP drawing / panning from triggering
    e.stopPropagation();
    e.preventDefault();

    const pos = this.board.toBoardCoords(e);

    // OPEN INPUT (local only)
    this.board.openTextInput(pos.x, pos.y);
  }

  onPointerMove() {}
  onPointerUp() {}
}
