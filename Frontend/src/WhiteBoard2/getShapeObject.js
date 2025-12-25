const getShapeObject = (
  tool,
  start,
  end,
  shapeColor,
  shapeSize,
  existing = null
) => {
  if (tool === "pen") {
    if (!existing) {
      return {
        type: "pen",
        points: [{ x: start.x, y: start.y }],
        shapeColor: shapeColor || "#fff",
        shapeSize: shapeSize || 2,
      };
    }

    return {
      ...existing,
      points: [...existing.points, { x: end.x, y: end.y }],
    };
  }

  return {
    type: tool,
    x: start.x,
    y: start.y,
    width: end.x - start.x,
    height: end.y - start.y,
    shapeColor: shapeColor || "#fff",
    shapeSize: shapeSize || 2,
  };
};

export default getShapeObject;
