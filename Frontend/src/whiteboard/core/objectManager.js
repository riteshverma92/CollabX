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




  findAt(x, y) {
  for (let i = this.objects.length - 1; i >= 0; i--) {
    const o = this.objects[i];

    const HIT_RADIUS = 10;  // <-- big improvement

   

    if (o.type === "circle") {
      const dx = x - o.x;
      const dy = y - o.y;
      if (Math.sqrt(dx * dx + dy * dy) <= (o.r + HIT_RADIUS)) return o;
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
