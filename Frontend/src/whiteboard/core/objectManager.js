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

export const objectManager = new ObjectManager();
export default objectManager;
