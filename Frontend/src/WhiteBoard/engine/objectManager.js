// src/WhiteBoard/engine/objectManager.js
export class ObjectManager {
  constructor() {
    this.objects = [];
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => (this.listeners = this.listeners.filter((f) => f !== fn));
  }

  _notify() {
    this.listeners.forEach((fn) => fn());
  }

  setObjects(arr) {
    this.objects = Array.isArray(arr) ? arr : [];
    this._notify();
  }

  addObject(obj) {
    this.objects.push(obj);
    this._notify();
  }

  getObjects() {
    return this.objects;
  }
}

export const objectManager = new ObjectManager();
