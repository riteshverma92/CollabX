// tools/circleTool.js
export function circleTool() {
  let start = null;
  let preview = null;

  return {
    down(point) {
      start = point;
      preview = { type: "circle", x: point.x, y: point.y, r: 0 };
      return preview;
    },

    move(point) {
      if (!start || !preview) return null;
      preview.r = Math.hypot(point.x - start.x, point.y - start.y);
      return preview;
    },

    up() {
      if (!preview) return null;

      const final = {
        id: crypto.randomUUID(),
        ...preview,
        stroke: "#000",
        strokeWidth: 2,
      };

      start = null;
      preview = null;
      return final;
    },
  };
}
