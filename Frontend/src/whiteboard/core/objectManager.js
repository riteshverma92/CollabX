// Stores objects, notifies listeners, and supports hit-testing

class ObjectManager {
  constructor() {
    this.objects = [];
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  _notify() {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (err) {
        console.error("ObjectManager listener error:", err);
      }
    }
  }

  setObjects(arr) {
    this.objects = Array.isArray(arr) ? [...arr] : [];
    this._notify();
  }

  addObject(obj) {
    this.objects.push(obj);
    this._notify();
  }

  deleteObject(id) {
    this.objects = this.objects.filter((o) => o.id !== id);
    this._notify();
  }

  getObjects() {
    return this.objects;
  }

  // Hit-test for eraser
  // findAt(x, y) {
  //   for (let i = this.objects.length - 1; i >= 0; i--) {
  //     const o = this.objects[i];
  //     if (!o) continue;

  //     // Rectangle
  //     if (o.type === "rect") {
  //       const left = Math.min(o.x, o.x + o.w);
  //       const right = Math.max(o.x, o.x + o.w);
  //       const top = Math.min(o.y, o.y + o.h);
  //       const bottom = Math.max(o.y, o.y + o.h);
  //       if (x >= left && x <= right && y >= top && y <= bottom) return o;
  //     }

  //     // Circle
  //     if (o.type === "circle") {
  //       const dx = x - o.x;
  //       const dy = y - o.y;
  //       if (Math.sqrt(dx * dx + dy * dy) <= o.r) return o;
  //     }

  //     // Line
  //     if (o.type === "line") {
  //       const dist = pointToSegmentDistance(x, y, o.x1, o.y1, o.x2, o.y2);
  //       if (dist <= (o.strokeWidth || 4)) return o;
  //     }

  //     // Pen path
  //     if (o.type === "pen") {
  //       for (const p of o.points) {
  //         if (Math.hypot(x - p.x, y - p.y) <= (o.strokeWidth || 4)) {
  //           return o;
  //         }
  //       }
  //     }

  //     // Text
  //     if (o.type === "text") {
  //       const fontSize = parseInt(o.font || "18px", 10);
  //       const width = fontSize * 0.6 * (o.text.length || 0);
  //       const height = fontSize;

  //       if (x >= o.x && x <= o.x + width && y >= o.y - height && y <= o.y)
  //         return o;
  //     }
  //   }
  //   return null;
  // }


  findAt(x, y) {
  for (let i = this.objects.length - 1; i >= 0; i--) {
    const o = this.objects[i];

    const HIT_RADIUS = 12;  // <-- big improvement

    if (o.type === "rect") {
      const left = Math.min(o.x, o.x + o.w);
      const right = Math.max(o.x, o.x + o.w);
      const top = Math.min(o.y, o.y + o.h);
      const bottom = Math.max(o.y, o.y + o.h);
      if (x >= left && x <= right && y >= top && y <= bottom) return o;
    }

    if (o.type === "circle") {
      const dx = x - o.x;
      const dy = y - o.y;
      if (Math.sqrt(dx * dx + dy * dy) <= (o.r + HIT_RADIUS)) return o;
    }

    if (o.type === "line") {
      const d = pointToSegmentDistance(x, y, o.x1, o.y1, o.x2, o.y2);
      if (d <= (o.strokeWidth || 4) + HIT_RADIUS) return o;
    }

    if (o.type === "pen") {
      const pts = o.points || [];
      for (let j = 0; j < pts.length - 1; j++) {
        const p1 = pts[j];
        const p2 = pts[j + 1];
        const d = pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);

        if (d <= (o.strokeWidth || 4) + HIT_RADIUS) {
          return o;
        }
      }
    }

    if (o.type === "text") {
      const fontSize = parseInt(o.font || "18px", 10);
      const w = (o.text?.length || 0) * fontSize * 0.6;
      const h = fontSize;
      if (x >= o.x && x <= o.x + w && y >= o.y - h && y <= o.y) return o;
    }
  }

  return null;
}

}

// Helper for line hit-test
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len = C * C + D * D;
  let t = len ? dot / len : -1;

  if (t < 0) return Math.hypot(px - x1, py - y1);
  if (t > 1) return Math.hypot(px - x2, py - y2);

  const projX = x1 + C * t;
  const projY = y1 + D * t;

  return Math.hypot(px - projX, py - projY);
}

export const objectManager = new ObjectManager();
export default objectManager;
