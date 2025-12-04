export class ToolEngine {
  constructor(board, toolsMap) {
    this.board = board;
    this.toolsMap = toolsMap;
    this.activeTool = null;
  }

  setTool(toolName) {
    const ToolClass = this.toolsMap[toolName];

    if (!ToolClass) {
      this.activeTool = null;
      return;
    }

    this.activeTool = new ToolClass(this.board);
  }

  pointerDown(e) {
    if (!this.activeTool) return;
    this.activeTool.onPointerDown(e);
  }

  pointerMove(e) {
    if (!this.activeTool) return;
    this.activeTool.onPointerMove(e);
  }

  pointerUp(e) {
    if (!this.activeTool) return;
    this.activeTool.onPointerUp(e);
  }

  drawPreview(ctx) {
    if (!this.activeTool) return;
    this.activeTool.drawPreview(ctx);
  }
}
