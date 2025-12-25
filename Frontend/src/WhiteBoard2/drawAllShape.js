import drawShape from "./drawShape";

const drawAllShapes = (canvas, shapes, previewShape = null) => {

const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 if (previewShape) {
    drawShape(ctx, previewShape);
 }

  

  // Draw saved shapes
  
  shapes.forEach(shape => drawShape(ctx, shape));

  // Draw preview on top (if exists)
 
};

export default drawAllShapes;
