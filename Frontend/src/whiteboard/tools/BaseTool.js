export default class BaseTool {
  constructor(board) {
    this.board = board; // access board API (toBoardCoords, startDrawing, etc)
  }

  onPointerDown() {}
  onPointerMove() {}
  onPointerUp() {}
  drawPreview() {}
}
