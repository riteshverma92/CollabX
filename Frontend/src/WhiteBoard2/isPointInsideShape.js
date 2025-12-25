function isPointInsideShape(x, y, shape) {
  let { type } = shape;

  if (type === "rect") {
    let { x: sx, y: sy, width, height } = shape;
    if (width < 0) { sx += width; width = Math.abs(width); }
    if (height < 0) { sy += height; height = Math.abs(height); }
    return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
  }

  if (type === "circle") {
    const r = Math.sqrt(shape.width * shape.width + shape.height * shape.height);
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= r * r;
  }

  if (type === "line") {
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width;
    const y2 = shape.y + shape.height;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let t = dot / lenSq;

    t = Math.max(0, Math.min(1, t));
    const xx = x1 + t * C;
    const yy = y1 + t * D;

    const dx = x - xx;
    const dy = y - yy;
    return dx * dx + dy * dy < 25;
  }

  if (type === "pen") {
    const pts = shape.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const x1 = pts[i].x;
      const y1 = pts[i].y;
      const x2 = pts[i + 1].x;
      const y2 = pts[i + 1].y;

      const A = x - x1;
      const B = y - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let t = dot / lenSq;

      t = Math.max(0, Math.min(1, t));
      const xx = x1 + t * C;
      const yy = y1 + t * D;

      const dx = x - xx;
      const dy = y - yy;

      if (dx * dx + dy * dy < 25) return true;
    }
    return false;
  }

  return false;
}

export default isPointInsideShape;
