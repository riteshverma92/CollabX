import { saveSnapshot } from "../dataBase/snapshot.repo.js";

export const rooms = {}; 
// { roomId: { clients:Set, objects:[], users:Set, dirty:boolean }}

export const users = {}; 
// { userId: {userId, name, avatar, color} }

export function getRoomUsers(roomId) {
  const result = {};
  rooms[roomId]?.users.forEach((id) => {
    if (users[id]) result[id] = users[id];
  });
  return result;
}

export function getCount(roomId) {
  if (!rooms[roomId]) return 0;
  return rooms[roomId].objects.length;
}

// 🔥 AUTOSAVE (OPTIMIZED)
setInterval(async () => {
  const promises = [];

  for (const roomId in rooms) {
    const room = rooms[roomId];

    if (room.objects.length > 0 && room.dirty) {
      

      promises.push(
        saveSnapshot(roomId, room.objects)
      );

      room.dirty = false; 
    }
  }

  await Promise.all(promises);
}, 60000);
