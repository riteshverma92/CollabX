const getShapeObject = (tool, start, end, existing = null) => {
  if (tool === "pen") {
    if (!existing) {
      return {
        type: "pen",
        points: [{ x: start.x, y: start.y }],
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
  };
};

export default getShapeObject;
