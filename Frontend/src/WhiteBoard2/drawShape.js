function chaikinSmooth(points, iterations = 2) {
  let pts = points;

  for (let k = 0; k < iterations; k++) {
    const newPts = [];
    newPts.push(pts[0]); // keep start

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];

      const Q = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      };

      const R = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      };

      newPts.push(Q, R);
    }

    newPts.push(pts[pts.length - 1]); // keep end
    pts = newPts;
  }

  return pts;
}


const drawShape = (ctx, shape) => {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const { type } = shape;

  if (type === "rect") {
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
  }

  if (type === "circle") {
    const r = Math.sqrt(shape.width * shape.width + shape.height * shape.height);
    ctx.arc(shape.x, shape.y, r, 0, Math.PI * 2);
  }

  if (type === "line") {
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
  }

  if (type === "pen") {
  if (shape.points.length < 2) return;

  const smoothPts = chaikinSmooth(shape.points, 2);

  ctx.moveTo(smoothPts[0].x, smoothPts[0].y);
  for (let i = 1; i < smoothPts.length; i++) {
    ctx.lineTo(smoothPts[i].x, smoothPts[i].y);
  }
}


  ctx.stroke();
};

export default drawShape;
