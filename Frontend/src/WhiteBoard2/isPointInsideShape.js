function isPointInsideShape(x, y, shape) {
  let { type, width, height } = shape;
  let sx = shape.x;
  let sy = shape.y;

  // Normalize negative width/height
  if (width < 0) { sx += width; width = Math.abs(width); }
  if (height < 0) { sy += height; height = Math.abs(height); }

  if (type === "rect") {
    return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
  }

  if (type === "circle") {
    const radius = Math.sqrt(width * width + height * height);
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  if (type === "line") {
    // distance from point to line segment
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width;
    const y2 = shape.y + shape.height;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return dx * dx + dy * dy < 25; // 5px eraser thickness
  }

  return false;
}


export default isPointInsideShape;