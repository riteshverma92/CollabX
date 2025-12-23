// core/objectStore.js
export const createObjectStore = () => {
  let objects = [];
  const listeners = new Set();

  return {
    get: () => objects,

    set: (arr) => {
      objects = [...arr];
      listeners.forEach((fn) => fn());
    },

    add: (obj) => {
      objects = [...objects, obj];
      listeners.forEach((fn) => fn());
    },

    remove: (id) => {
      objects = objects.filter((o) => o.id !== id);
      listeners.forEach((fn) => fn());
    },

    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
};

export const objectStore = createObjectStore();
